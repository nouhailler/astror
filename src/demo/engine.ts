// Moteur du mode démo : exécute la liste d'étapes d'un scénario en pilotant
// l'interface réelle, comme si quelqu'un naviguait.
//
// Responsabilités :
//   - exécuter navigate / click / type / wait / highlight / narrate ;
//   - afficher un curseur virtuel animé + la surbrillance de l'élément visé ;
//   - fournir une barre de contrôle (play, pause, suivant, vitesse, quitter) ;
//   - respecter prefers-reduced-motion ;
//   - sortir proprement (Échap ou ✕) et restaurer l'état de l'app.
//
// Le moteur est volontairement en DOM pur : son overlay survit aux re-rendus
// React et reste indépendant de l'écran affiché. La navigation passe par
// l'hôte enregistré (bridge), le ciblage par [data-demo-id].
//
// Mode capture (Astror Video Studio, optionnel — `new DemoEngine(s, { mode: 'capture' })`) :
//   - pas de barre de contrôle, bulle de narration masquable, curseur toujours animé ;
//   - chaque étape est tenue au moins `capture.holdMs[i]` ms (durée de la voix) ;
//   - navigation confirmée (écran monté) au lieu d'une attente aveugle ;
//   - erreurs strictes : élément introuvable → `action:error` + arrêt + onFinish({ ok: false }).
// Dans les deux modes, le moteur émet des événements horodatés (onEvent + CustomEvent
// `astror:demo-event` sur window). Le mode interactif reste strictement identique.

import type {
  DemoStep, Scenario, TabKey, DemoEngineOptions, DemoEvent, DemoEventType, DemoMode,
} from './types'
import { getDemoHost, prefersReducedMotion } from './bridge'
import { snapshotStore, applySeed, restoreStore } from './seed'

/** Horloge réelle, même si l'horloge de la page est simulée (enregistrement vidéo). */
type RealClock = { now: () => number; origin: number }
function realClock(): RealClock {
  const w = (typeof window !== 'undefined' ? window : {}) as { __ASTROR_REAL_CLOCK__?: RealClock }
  if (w.__ASTROR_REAL_CLOCK__) return w.__ASTROR_REAL_CLOCK__
  const p = typeof performance !== 'undefined' ? performance : null
  return { now: () => (p ? p.now() : Date.now()), origin: p?.timeOrigin ?? 0 }
}

class CaptureError extends Error {}

const SPEEDS = [0.5, 1, 2] as const

const CURSOR_SVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">' +
  '<path d="M5 3l14 8.5-6 1.4L10.5 19 5 3z" fill="#0a1020" stroke="#d9b36c" ' +
  'stroke-width="1.4" stroke-linejoin="round"/></svg>'

const IC = {
  play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  next: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5l9 7-9 7zM16 5h2.5v14H16z"/></svg>',
  close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
}

function slug(text: string, max = 220): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export class DemoEngine {
  private scenario: Scenario
  private steps: DemoStep[]
  private i = 0
  private aborted = false
  private paused = false
  private forceStep = false
  private speedIdx = 1
  private reduced = prefersReducedMotion()

  // Overlay DOM
  private shield!: HTMLElement
  private cursor!: HTMLElement
  private highlight!: HTMLElement
  private hlLabel!: HTMLElement
  private narration!: HTMLElement
  private bar!: HTMLElement
  private btnPlay!: HTMLButtonElement
  private btnSpeed!: HTMLButtonElement
  private progressEl!: HTMLElement

  private cursorX = 0
  private cursorY = 0
  private wake: (() => void) | null = null
  private onKey: (e: KeyboardEvent) => void
  private onScroll: () => void
  private hlTarget: HTMLElement | null = null
  private startTab: TabKey = 'sky'

  // Mode capture / événements
  private readonly mode: DemoMode
  private readonly opts: DemoEngineOptions
  private readonly clock = realClock()
  private narrShown = false
  private narrAt: number | null = null
  private finished = false

  constructor(scenario: Scenario, options: DemoEngineOptions = {}) {
    this.scenario = scenario
    this.steps = scenario.steps
    this.opts = options
    this.mode = options.mode ?? 'interactive'
    if (this.capturing) this.reduced = false   // curseur et surbrillance toujours animés
    this.onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); this.stop() } }
    this.onScroll = () => this.repositionHighlight()
  }

  private get capturing(): boolean { return this.mode === 'capture' }

  // ── Événements ──────────────────────────────────────────────────────────
  private emit(type: DemoEventType, data?: Record<string, unknown>, step: number | undefined = this.i): void {
    const t = this.clock.now()
    const ev: DemoEvent = { type, t, epoch: this.clock.origin + t, step, data }
    try { this.opts.onEvent?.(ev) } catch { /* un écouteur ne doit pas casser la démo */ }
    try { window.dispatchEvent(new CustomEvent('astror:demo-event', { detail: ev })) } catch { /* ignore */ }
  }

  // ── Cycle de vie ────────────────────────────────────────────────────────
  start(): void {
    // Onglet de départ, pour restaurer l'écran en sortie.
    this.startTab = (getDemoHost()?.getTab?.() ?? 'sky') as TabKey
    // Isolation des données : capture → graine de démo.
    snapshotStore()
    applySeed(this.opts.seed)
    this.buildOverlay()
    window.addEventListener('keydown', this.onKey, true)
    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onScroll)
    // Position initiale du curseur : bas-centre.
    this.cursorX = window.innerWidth / 2
    this.cursorY = window.innerHeight - 120
    this.placeCursor(true)
    void this.run()
  }

  stop(): void {
    if (this.aborted) return
    if (this.hlTarget) this.emit('highlight:hide')
    if (this.narrShown) this.emit('narration:hide')
    if (!this.finished) {
      this.finished = true
      this.opts.onFinish?.({ ok: false, error: 'Démo interrompue', step: this.i })
    }
    this.aborted = true
    this.wake?.()
    window.removeEventListener('keydown', this.onKey, true)
    window.removeEventListener('scroll', this.onScroll, true)
    window.removeEventListener('resize', this.onScroll)
    // Restauration de l'app : onglet de départ + store réel intact.
    try { getDemoHost()?.navigate({ tab: this.startTab }) } catch { /* ignore */ }
    restoreStore()
    this.teardownOverlay()
  }

  // ── Boucle d'exécution ──────────────────────────────────────────────────
  private async run(): Promise<void> {
    if (this.capturing && this.opts.capture?.syncMark !== false) await this.showSyncMark()
    this.emit('scenario:start', { name: this.scenario.name, steps: this.steps.length, mode: this.mode }, undefined)
    while (this.i < this.steps.length && !this.aborted) {
      await this.gate()
      if (this.aborted) break
      const forced = this.forceStep
      this.forceStep = false

      const step = this.steps[this.i]
      const t0 = this.clock.now()
      this.narrAt = null
      this.emit('step:start', { type: step.type })
      try {
        await this.exec(step)
        if (this.capturing) await this.hold(t0)
      } catch (err) {
        if (this.capturing && !this.aborted) { this.fail(err); return }
        /* mode interactif : étape résiliente */
      }
      if (this.aborted) break
      this.emit('step:end', { type: step.type })

      this.i++
      this.updateProgress()

      if (forced) { this.paused = true; continue }   // pas à pas : on se re-fige
      if (this.paused) continue
      await this.sleep(this.scaled(this.opts.capture?.breathMs ?? 850))   // respiration entre étapes
    }
    if (!this.aborted) this.finish()
  }

  /** Mode capture : maintient l'étape jusqu'à la fin de la voix (holdMs). */
  private async hold(stepStart: number): Promise<void> {
    const h = this.opts.capture?.holdMs?.[this.i]
    if (!h) return
    const ref = this.narrAt ?? stepStart
    const remain = h - (this.clock.now() - ref)
    if (remain > 0) await this.sleep(remain)
  }

  /** Mode capture : erreur bloquante → événement, arrêt propre, restauration. */
  private fail(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err)
    this.emit('action:error', { message, type: this.steps[this.i]?.type })
    this.finished = true
    this.opts.onFinish?.({ ok: false, error: message, step: this.i })
    this.stop()
  }

  /**
   * Mire de synchronisation (mode capture) : un aplat magenta plein écran,
   * repérable image par image dans l'enregistrement, horodaté au moment où il
   * est peint. Permet d'aligner événements et vidéo à une image près.
   */
  private async showSyncMark(): Promise<void> {
    const mark = el('div', 'demo-sync-mark')
    Object.assign(mark.style, { position: 'fixed', inset: '0', zIndex: '99999', background: '#ff00ff' })
    document.body.appendChild(mark)
    await new Promise<void>((resolve) => {
      const raf = window.requestAnimationFrame ?? ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 16))
      raf(() => { this.emit('sync:mark', { color: '#ff00ff' }, undefined); resolve() })
    })
    await this.sleep(500)
    mark.remove()
    await this.sleep(400)
  }

  /** Attend tant que la démo est en pause (le pas-à-pas la débloque un cran). */
  private async gate(): Promise<void> {
    while (this.paused && !this.aborted && !this.forceStep) {
      await this.sleep(120)
    }
  }

  private finish(): void {
    if (this.capturing) {
      // Capture : l'image reste figée sur le dernier écran ; l'enregistreur
      // coupe la vidéo puis appelle stopDemo() (restauration du store).
      this.finished = true
      this.emit('scenario:end', { ok: true }, undefined)
      this.opts.onFinish?.({ ok: true })
      return
    }
    this.setNarration('Visite terminée.', 'Fin')
    this.setPlaying(false)
    this.paused = true
    this.finished = true
    this.emit('scenario:end', { ok: true }, undefined)
    this.opts.onFinish?.({ ok: true })
    // La barre reste : l'utilisateur quitte quand il veut (✕ ou Échap).
  }

  // ── Exécution d'une étape ───────────────────────────────────────────────
  private async exec(step: DemoStep): Promise<void> {
    switch (step.type) {
      case 'navigate': {
        this.clearHighlight()
        const host = getDemoHost()
        if (!host && this.capturing) throw new CaptureError('Hôte de navigation absent (App non montée)')
        host?.navigate({ tab: step.to, tool: step.tool })
        if (step.narrate) this.setNarration(step.narrate)
        if (this.capturing) await this.waitForScreen(step.to ?? 'tools')
        else await this.sleep(this.scaled(700))   // laisse l'écran (lazy) se monter
        this.emit('navigation:complete', { to: step.to, tool: step.tool })
        break
      }
      case 'wait':
        await this.sleep(this.scaled(step.ms))
        break
      case 'narrate':
        this.setNarration(step.text, step.title)
        // Capture avec voix : la durée vient de l'audio réel (hold), pas d'une estimation.
        if (this.capturing && this.opts.capture?.holdMs?.[this.i]) break
        await this.sleep(step.ms != null ? this.scaled(step.ms) : this.readingTime(step.text))
        break
      case 'highlight': {
        const el = await this.waitForEl(step.target)
        if (step.narrate) this.setNarration(step.narrate)
        if (el) { await this.moveCursorTo(el); this.showHighlight(el, step.label) }
        break
      }
      case 'click': {
        const el = await this.waitForEl(step.target)
        if (step.narrate) this.setNarration(step.narrate)
        if (el) {
          await this.moveCursorTo(el)
          this.showHighlight(el)
          await this.sleep(this.scaled(260))
          this.pressCursor()
          this.rippleAt(this.cursorX, this.cursorY)
          this.emit('action:click', { target: step.target, x: this.cursorX, y: this.cursorY })
          this.dispatchClick(el)
          await this.sleep(this.scaled(260))
        }
        break
      }
      case 'type': {
        const el = await this.waitForEl(step.target)
        if (step.narrate) this.setNarration(step.narrate)
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          await this.moveCursorTo(el)
          this.showHighlight(el)
          el.focus()
          this.emit('action:type', { target: step.target, text: step.text })
          await this.typeInto(el, step.text)
        } else if (el && this.capturing) {
          throw new CaptureError(`Élément « ${step.target} » non saisissable`)
        }
        break
      }
    }
  }

  // ── Ciblage ─────────────────────────────────────────────────────────────
  private find(id: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-demo-id="${CSS.escape(id)}"]`)
  }

  /** Attend qu'un élément ciblé apparaisse (écrans chargés à la demande). */
  private async waitForEl(id: string, timeout = 4500): Promise<HTMLElement | null> {
    if (this.capturing) timeout = this.opts.capture?.stepTimeoutMs ?? 8000
    const t0 = this.clock.now()
    while (!this.aborted) {
      const el = this.find(id)
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: 'center', behavior: this.reduced ? 'auto' : 'smooth' })
        if (this.capturing) await this.waitStable(id)
        else await this.sleep(this.reduced ? 0 : 220)   // laisse le scroll se stabiliser
        return this.find(id)
      }
      if (this.clock.now() - t0 > timeout) {
        if (this.capturing) throw new CaptureError(`Élément introuvable : [data-demo-id="${id}"] (après ${timeout} ms)`)
        return null
      }
      await this.sleep(120)
    }
    return null
  }

  /** Capture : attend que la position de l'élément ne bouge plus (fin du scroll). */
  private async waitStable(id: string): Promise<void> {
    let last = ''
    let same = 0
    const t0 = this.clock.now()
    while (!this.aborted && this.clock.now() - t0 < 1500) {
      await this.sleep(60)
      const r = this.find(id)?.getBoundingClientRect()
      const sig = r ? `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}` : ''
      same = sig === last ? same + 1 : 0
      last = sig
      if (same >= 3) return
    }
  }

  /**
   * Capture : attend que l'écran demandé soit réellement monté — onglet actif,
   * plus aucun indicateur de chargement (Suspense) — puis laisse les animations
   * d'entrée se jouer.
   */
  private async waitForScreen(tab: TabKey): Promise<void> {
    const timeout = this.opts.capture?.stepTimeoutMs ?? 8000
    const t0 = this.clock.now()
    while (!this.aborted) {
      const tabBtn = this.find(`tab-${tab}`)
      const tabOk = !tabBtn || tabBtn.getAttribute('aria-selected') === 'true'
      const loading = document.querySelector('[data-demo-loading]')
      const screen = document.querySelector('.screen-area')?.firstElementChild
      if (tabOk && !loading && screen) break
      if (this.clock.now() - t0 > timeout) {
        throw new CaptureError(`Navigation non confirmée vers « ${tab} » (après ${timeout} ms)`)
      }
      await this.sleep(60)
    }
    await this.sleep(this.scaled(450))   // animations d'entrée (.enter)
  }

  private dispatchClick(el: HTMLElement): void {
    el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    el.click()
  }

  /** Saisie compatible React (setter natif + événement input). */
  private async typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string): Promise<void> {
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
    const setVal = (v: string) => {
      if (setter) setter.call(el, v); else el.value = v
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    if (this.reduced) { setVal(text); return }
    let acc = ''
    for (const ch of text) {
      if (this.aborted) return
      acc += ch
      setVal(acc)
      await this.sleep(this.scaled(45))
    }
  }

  // ── Curseur virtuel ─────────────────────────────────────────────────────
  private placeCursor(instant = false): void {
    this.cursor.classList.toggle('reduced', instant || this.reduced)
    this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px)`
  }

  private async moveCursorTo(el: HTMLElement): Promise<void> {
    const r = el.getBoundingClientRect()
    const from = { x: this.cursorX, y: this.cursorY }
    this.cursorX = r.left + r.width / 2
    this.cursorY = r.top + r.height / 2
    this.emit('cursor:move', {
      from, to: { x: this.cursorX, y: this.cursorY },
      durationMs: this.reduced ? 0 : this.scaled(560),
    })
    if (this.reduced) { this.placeCursor(true); return }
    this.cursor.classList.remove('reduced')
    // Durée du trajet proportionnelle à la distance, plafonnée.
    this.cursor.style.transitionDuration = `${this.scaled(560)}ms`
    this.placeCursor(false)
    await this.sleep(this.scaled(560))
  }

  private pressCursor(): void {
    this.cursor.classList.add('press')
    setTimeout(() => this.cursor.classList.remove('press'), 240)
  }

  private rippleAt(x: number, y: number): void {
    if (this.reduced) return
    const rip = document.createElement('div')
    rip.className = 'demo-ripple'
    rip.style.transform = `translate(${x}px, ${y}px)`
    document.body.appendChild(rip)
    setTimeout(() => rip.remove(), 550)
  }

  // ── Surbrillance ────────────────────────────────────────────────────────
  private showHighlight(el: HTMLElement, label?: string): void {
    this.hlTarget = el
    this.repositionHighlight()
    this.highlight.style.opacity = '1'
    this.highlight.classList.toggle('reduced', this.reduced)
    if (label) {
      this.hlLabel.textContent = label
      this.hlLabel.style.display = 'block'
    } else {
      this.hlLabel.style.display = 'none'
    }
    const r = el.getBoundingClientRect()
    this.emit('highlight:show', {
      target: el.getAttribute('data-demo-id'), label: label ?? null,
      rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      viewport: { width: window.innerWidth, height: window.innerHeight },
    })
  }

  private repositionHighlight(): void {
    if (!this.hlTarget) return
    const r = this.hlTarget.getBoundingClientRect()
    const pad = 6
    Object.assign(this.highlight.style, {
      left: `${r.left - pad}px`, top: `${r.top - pad}px`,
      width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px`,
    })
  }

  private clearHighlight(): void {
    if (this.hlTarget) this.emit('highlight:hide')
    this.hlTarget = null
    this.highlight.style.opacity = '0'
    this.hlLabel.style.display = 'none'
  }

  // ── Narration ───────────────────────────────────────────────────────────
  private setNarration(text: string, title?: string): void {
    if (this.narrShown) this.emit('narration:hide')
    this.narration.innerHTML =
      (title ? `<div class="demo-narr-title">${title}</div>` : '') +
      `<div class="demo-narr-body">${slug(text)}</div>`
    const visible = !this.capturing || this.opts.capture?.showNarration === true
    this.narration.style.opacity = visible ? '1' : '0'
    this.narrShown = true
    this.narrAt = this.clock.now()
    this.emit('narration:show', { text, title: title ?? null })
  }

  private readingTime(text: string): number {
    // ~50 ms/caractère, borné, puis mis à l'échelle par la vitesse.
    const base = Math.min(6000, Math.max(2200, text.length * 48))
    return this.scaled(base)
  }

  // ── Barre de contrôle ───────────────────────────────────────────────────
  private buildOverlay(): void {
    this.shield = el('div', 'demo-shield')

    this.cursor = el('div', 'demo-cursor')
    this.cursor.innerHTML = CURSOR_SVG

    this.highlight = el('div', 'demo-highlight')
    this.hlLabel = el('div', 'demo-highlight-label')
    this.highlight.appendChild(this.hlLabel)

    this.narration = el('div', 'demo-narration')

    this.bar = el('div', 'demo-bar')
    this.bar.setAttribute('role', 'toolbar')
    this.bar.setAttribute('aria-label', 'Contrôles du mode démo')

    const title = el('span', 'demo-bar-title')
    title.textContent = this.scenario.label

    this.progressEl = el('span', 'demo-bar-progress')

    this.btnPlay = barBtn(IC.pause, 'Lecture / pause', () => this.togglePlay())
    const btnNext = barBtn(IC.next, 'Étape suivante', () => this.next())
    this.btnSpeed = barBtn('', 'Vitesse de lecture', () => this.cycleSpeed())
    this.btnSpeed.classList.add('demo-bar-speed')
    const btnQuit = barBtn(IC.close, 'Quitter la démo (Échap)', () => this.stop())
    btnQuit.classList.add('demo-bar-quit')

    this.bar.append(title, this.progressEl, this.btnPlay, btnNext, this.btnSpeed, btnQuit)
    // Capture vidéo : aucun contrôle destiné à l'utilisateur à l'image.
    if (this.capturing) this.bar.style.display = 'none'

    document.body.append(
      this.shield, this.highlight, this.cursor, this.narration, this.bar,
    )
    this.updateSpeedLabel()
    this.updateProgress()
    this.setPlaying(true)
  }

  private teardownOverlay(): void {
    for (const n of [this.shield, this.highlight, this.cursor, this.narration, this.bar]) {
      n?.remove()
    }
    document.querySelectorAll('.demo-ripple').forEach(r => r.remove())
  }

  private updateProgress(): void {
    const cur = Math.min(this.i + 1, this.steps.length)
    this.progressEl.textContent = `${cur} / ${this.steps.length}`
  }

  private setPlaying(playing: boolean): void {
    this.btnPlay.innerHTML = playing ? IC.pause : IC.play
    this.btnPlay.setAttribute('aria-pressed', String(playing))
  }

  private togglePlay(): void {
    this.paused = !this.paused
    this.setPlaying(!this.paused)
    if (!this.paused) this.wake?.()   // reprend un éventuel sleep en cours
  }

  private next(): void {
    if (this.paused) this.forceStep = true
    this.wake?.()   // coupe la respiration / débloque la pause d'un cran
  }

  private cycleSpeed(): void {
    this.speedIdx = (this.speedIdx + 1) % SPEEDS.length
    this.updateSpeedLabel()
  }

  private updateSpeedLabel(): void {
    this.btnSpeed.textContent = `${SPEEDS[this.speedIdx]}×`
  }

  // ── Temporisation ───────────────────────────────────────────────────────
  private scaled(ms: number): number {
    const speed = this.capturing ? (this.opts.capture?.speed || 1) : SPEEDS[this.speedIdx]
    return Math.round(ms / speed)
  }

  /** Sleep interruptible : next()/togglePlay()/stop() peuvent l'écourter. */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (ms <= 0 || this.aborted) { resolve(); return }
      const t = setTimeout(() => { this.wake = null; resolve() }, ms)
      this.wake = () => { clearTimeout(t); this.wake = null; resolve() }
    })
  }
}

// ── Petits utilitaires DOM ──────────────────────────────────────────────────
function el(tag: string, cls: string): HTMLElement {
  const n = document.createElement(tag)
  n.className = cls
  return n
}

function barBtn(html: string, aria: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button')
  b.className = 'demo-bar-btn'
  b.type = 'button'
  b.innerHTML = html
  b.setAttribute('aria-label', aria)
  b.title = aria
  b.addEventListener('click', onClick)
  return b
}
