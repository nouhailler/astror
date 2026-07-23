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

import type { DemoStep, Scenario, TabKey } from './types'
import { getDemoHost, prefersReducedMotion } from './bridge'
import { snapshotStore, applySeed, restoreStore } from './seed'

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

  constructor(scenario: Scenario) {
    this.scenario = scenario
    this.steps = scenario.steps
    this.onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); this.stop() } }
    this.onScroll = () => this.repositionHighlight()
  }

  // ── Cycle de vie ────────────────────────────────────────────────────────
  start(): void {
    // Onglet de départ, pour restaurer l'écran en sortie.
    this.startTab = (getDemoHost()?.getTab?.() ?? 'sky') as TabKey
    // Isolation des données : capture → graine de démo.
    snapshotStore()
    applySeed()
    this.buildOverlay()
    window.addEventListener('keydown', this.onKey, true)
    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onScroll)
    // Position initiale du curseur : bas-centre.
    this.cursorX = window.innerWidth / 2
    this.cursorY = window.innerHeight - 120
    this.placeCursor(true)
    this.run()
  }

  stop(): void {
    if (this.aborted) return
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
    while (this.i < this.steps.length && !this.aborted) {
      await this.gate()
      if (this.aborted) break
      const forced = this.forceStep
      this.forceStep = false

      try { await this.exec(this.steps[this.i]) } catch { /* étape résiliente */ }
      if (this.aborted) break

      this.i++
      this.updateProgress()

      if (forced) { this.paused = true; continue }   // pas à pas : on se re-fige
      if (this.paused) continue
      await this.sleep(this.scaled(850))              // respiration entre étapes
    }
    if (!this.aborted) this.finish()
  }

  /** Attend tant que la démo est en pause (le pas-à-pas la débloque un cran). */
  private async gate(): Promise<void> {
    while (this.paused && !this.aborted && !this.forceStep) {
      await this.sleep(120)
    }
  }

  private finish(): void {
    this.setNarration('Visite terminée.', 'Fin')
    this.setPlaying(false)
    this.paused = true
    // La barre reste : l'utilisateur quitte quand il veut (✕ ou Échap).
  }

  // ── Exécution d'une étape ───────────────────────────────────────────────
  private async exec(step: DemoStep): Promise<void> {
    switch (step.type) {
      case 'navigate': {
        this.clearHighlight()
        const host = getDemoHost()
        host?.navigate({ tab: step.to, tool: step.tool })
        if (step.narrate) this.setNarration(step.narrate)
        await this.sleep(this.scaled(700))   // laisse l'écran (lazy) se monter
        break
      }
      case 'wait':
        await this.sleep(this.scaled(step.ms))
        break
      case 'narrate':
        this.setNarration(step.text, step.title)
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
          await this.typeInto(el, step.text)
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
    const t0 = Date.now()
    while (!this.aborted) {
      const el = this.find(id)
      if (el && el.offsetParent !== null) {
        el.scrollIntoView({ block: 'center', behavior: this.reduced ? 'auto' : 'smooth' })
        await this.sleep(this.reduced ? 0 : 220)   // laisse le scroll se stabiliser
        return this.find(id)
      }
      if (Date.now() - t0 > timeout) return null
      await this.sleep(120)
    }
    return null
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
    this.cursorX = r.left + r.width / 2
    this.cursorY = r.top + r.height / 2
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
    this.hlTarget = null
    this.highlight.style.opacity = '0'
    this.hlLabel.style.display = 'none'
  }

  // ── Narration ───────────────────────────────────────────────────────────
  private setNarration(text: string, title?: string): void {
    this.narration.innerHTML =
      (title ? `<div class="demo-narr-title">${title}</div>` : '') +
      `<div class="demo-narr-body">${slug(text)}</div>`
    this.narration.style.opacity = '1'
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
    return Math.round(ms / SPEEDS[this.speedIdx])
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
