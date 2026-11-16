// Enregistrement automatique d'un scénario dans la véritable interface Astror.
//
// 1. build de production + `vite preview` ;
// 2. Chromium (Playwright) au format téléphone 430×932 @2x, service workers bloqués,
//    horloge simulée, géolocalisation fixe, notifications refusées ;
// 3. réseau déterministe : fixtures + cache HAR, APIs d'IA bloquées ;
// 4. injection de la requête de capture (scénario + durées audio) puis ?capture=1 ;
// 5. screencast CDP (JPEG haute qualité, horodaté) pendant toute la prise ;
// 6. attente de la fin RÉELLE du scénario (résultat publié par le moteur) ;
// 7. assemblage ffmpeg en MP4 30 i/s constants, repérage de la mire de synchro ;
// 8. vérification de la restauration du localStorage et rapport capture.json.
// Toute erreur bloquante arrête la prise et produit un rapport explicite.
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import { videoConfig } from '../config/video.config'
import { NETWORK_FIXTURES, BLOCKED_HOSTS } from '../fixtures/network'
import type { CaptureEvent, CaptureManifest, NetworkReport, VideoScenario, VoiceManifest } from '../types/video.types'
import type { DemoEvent, DemoRunResult } from '../../src/demo/types'
import { holdsFromManifest } from './generate-voice'
import { collectNarrations } from './lib/narration'
import { files, paths, rel } from './lib/paths'
import { buildApp, startPreview, type AppServer } from './lib/server'
import { StudioError, ensureDir, readJson, runOk, sleep, writeJson } from './lib/util'

const EXTERNAL = /^https?:\/\/(?!127\.0\.0\.1[:/]|localhost[:/])/

export interface RecordOptions {
  build?: boolean
  network?: 'replay' | 'refresh' | 'offline'
  headed?: boolean
  log?: (msg: string) => void
}

/** Vérifie que voice.json correspond aux narrations actuelles du scénario. */
export function loadVoiceFor(scn: VideoScenario): VoiceManifest | null {
  if (!scn.video.voiceEnabled) return null
  const m = readJson<VoiceManifest>(files.voice(scn.id), 'Manifeste de voix (lancer « npm run video:audio »)')
  const expected = collectNarrations(scn).map((n) => `${n.key}:${n.text}`)
  const got = m.segments.map((s) => `${s.key}:${s.text}`)
  if (expected.join('\n') !== got.join('\n')) {
    throw new StudioError('Le manifeste de voix ne correspond plus au scénario (texte modifié) : relancer « npm run video:audio »')
  }
  for (const seg of m.segments) for (const s of seg.sentences) {
    if (!existsSync(path.join(paths.video, s.file))) throw new StudioError(`Fichier audio manquant : ${s.file} — relancer « npm run video:audio »`)
  }
  return m
}

/** Clés astror_ posées avant le chargement : onboarding vu, astuces et annonces masquées. */
function preseed(scn: VideoScenario): Record<string, string> {
  const tipsSrc = readFileSync(path.join(paths.src, 'tips.jsx'), 'utf8')
  const tipsBlock = tipsSrc.match(/export const TIPS = \{([\s\S]*?)\n\}/)?.[1] ?? ''
  const tipKeys = [...tipsBlock.matchAll(/^ {2}(\w+): \[/gm)].map((m) => m[1])
  const annSrc = readFileSync(path.join(paths.src, 'announcements.jsx'), 'utf8')
  const annIds = [...annSrc.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1])
  const loc = scn.video.location ?? { city: 'Paris', lat: 48.8566, lng: 2.3522 }
  return {
    astror_onboarded_v1: '1',
    astror_profile_v1: JSON.stringify({
      location: loc, level: 'Amateur', interests: ['Planètes', 'Ciel profond', 'Lune & Soleil'],
      gear: ['Jumelles', 'Télescope'], alerts: { iss: true, conj: true, meteor: true, eclipse: false },
    }),
    astror_tips_v1: JSON.stringify(Object.fromEntries(tipKeys.map((k) => [k, true]))),
    astror_announcements_v1: JSON.stringify(annIds),
    ...(scn.video.seed ?? {}),
  }
}

/** Repère la mire magenta dans la vidéo assemblée (image par image). */
async function findSyncMark(mp4: string, fps: number): Promise<number | null> {
  const buf: Buffer = await new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-v', 'error', '-i', mp4, '-t', '40', '-vf', 'scale=4:4:flags=area,format=rgb24', '-f', 'rawvideo', '-'])
    const chunks: Buffer[] = []
    p.stdout.on('data', (d: Buffer) => chunks.push(d))
    p.on('error', reject)
    p.on('close', () => resolve(Buffer.concat(chunks)))
  })
  const frame = 4 * 4 * 3
  for (let f = 0; f * frame < buf.length; f++) {
    let rr = 0, gg = 0, bb = 0
    for (let p = 0; p < 16; p++) { rr += buf[f * frame + p * 3]; gg += buf[f * frame + p * 3 + 1]; bb += buf[f * frame + p * 3 + 2] }
    rr /= 16; gg /= 16; bb /= 16
    if (rr > 200 && gg < 70 && bb > 200) return f / fps
  }
  return null
}

export async function record(scn: VideoScenario, opts: RecordOptions = {}): Promise<CaptureManifest> {
  const log = opts.log ?? (() => {})
  const cfg = videoConfig.capture
  const fps = videoConfig.output.fps
  const voice = loadVoiceFor(scn)
  const holdMs = voice ? holdsFromManifest(voice) : undefined

  const dir = paths.recording(scn.id)
  const framesDir = path.join(dir, 'frames')
  rmSync(dir, { recursive: true, force: true })
  ensureDir(framesDir)
  ensureDir(paths.networkCache)

  let mode = opts.network ?? videoConfig.network.mode
  const har = files.har(scn.id)
  if (mode === 'replay' && !existsSync(har)) {
    log(`cache réseau absent → première prise en mode « refresh » (${rel(har)})`)
    mode = 'refresh'
  }
  const network: NetworkReport = { mode, fixtures: [], harHits: 0, blocked: [], failed: [] }

  let server: AppServer | null = null
  let browser: Browser | null = null
  let context: BrowserContext | null = null
  let page: Page | null = null
  const pageErrors: string[] = []
  const frames: { file: string; ts: number }[] = []
  const seed = preseed(scn)
  const loc = scn.video.location ?? { city: 'Paris', lat: 48.8566, lng: 2.3522 }

  const manifestBase = {
    scenarioId: scn.id,
    recordedAt: new Date().toISOString(),
    viewport: { ...cfg.viewport, deviceScaleFactor: cfg.deviceScaleFactor },
    clock: scn.video.clock,
    network,
  }

  const failReport = async (message: string, extra: Partial<CaptureManifest> = {}): Promise<never> => {
    if (page && !page.isClosed()) {
      try { await page.screenshot({ path: path.join(dir, 'failure.png') }) } catch { /* ignore */ }
    }
    writeJson(files.capture(scn.id), {
      ...manifestBase, ok: false, error: message, pageErrors,
      video: null, sync: null, events: [], storeRestored: null, ...extra,
    })
    throw new StudioError(`Capture échouée : ${message}`, { report: rel(files.capture(scn.id)), pageErrors })
  }

  const onSigint = () => { try { void browser?.close() } catch { /* ignore */ } server?.stop() }
  process.once('SIGINT', onSigint)

  try {
    if (opts.build !== false) { log('build de production…'); await buildApp() }
    server = await startPreview()
    browser = await chromium.launch({ headless: !opts.headed })
    context = await browser.newContext({
      viewport: cfg.viewport,
      deviceScaleFactor: cfg.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      serviceWorkers: 'block',
      locale: 'fr-FR',
      timezoneId: scn.video.timezone ?? 'Europe/Paris',
      geolocation: { latitude: loc.lat, longitude: loc.lng },
      permissions: ['geolocation'],
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
    })

    // ── Réseau déterministe ───────────────────────────────────────────────
    if (mode === 'refresh') await context.routeFromHAR(har, { url: EXTERNAL, update: true, updateContent: 'embed', updateMode: 'minimal' })
    else if (mode === 'replay') await context.routeFromHAR(har, { url: EXTERNAL, notFound: 'abort' })
    else await context.route(EXTERNAL, (r) => { network.blocked.push(r.request().url()); return r.abort('blockedbyclient') })
    for (const fx of NETWORK_FIXTURES) {
      const body = readFileSync(path.join(paths.fixtures, 'network', fx.file))
      await context.route(fx.match, (r) => {
        if (!network.fixtures.includes(fx.id)) network.fixtures.push(fx.id)
        return r.fulfill({ status: 200, contentType: fx.contentType, body, headers: { 'access-control-allow-origin': '*' } })
      })
    }
    for (const h of BLOCKED_HOSTS) {
      await context.route(h, (r) => { network.blocked.push(r.request().url()); return r.abort('blockedbyclient') })
    }

    // ── Injection avant chargement : horloge réelle, requête de capture, graine ──
    const request = {
      scenario: scn.scenario,
      options: { holdMs, speed: scn.video.speed ?? 1, syncMark: true, stepTimeoutMs: cfg.stepTimeoutMs, breathMs: cfg.breathMs, showNarration: false },
      seed: scn.video.seed ?? {},
    }
    // tsx/esbuild (keepNames) insère des appels __name() dans les fonctions
    // sérialisées vers la page : on fournit un équivalent neutre.
    await context.addInitScript('window.__name = window.__name || ((f) => f)')
    await context.addInitScript(({ req, preseedKeys }) => {
      const perf = performance
      const realNow = perf.now.bind(perf)
      Object.defineProperty(window, '__ASTROR_REAL_CLOCK__', { value: { now: realNow, origin: perf.timeOrigin } })
      ;(window as unknown as { __ASTROR_CAPTURE__: unknown }).__ASTROR_CAPTURE__ = req
      if (!sessionStorage.getItem('__astror_preseeded')) {
        for (const [k, v] of Object.entries(preseedKeys)) localStorage.setItem(k, v as string)
        sessionStorage.setItem('__astror_preseeded', '1')
      }
      // Aucune notification réelle pendant une capture.
      try { Object.defineProperty(Notification, 'permission', { get: () => 'denied' }) } catch { /* ignore */ }
    }, { req: request, preseedKeys: seed })

    page = await context.newPage()
    await page.clock.install({ time: new Date(scn.video.clock) })
    page.on('pageerror', (e) => pageErrors.push(e.message))
    page.on('dialog', (d) => void d.dismiss())
    page.on('requestfinished', (r) => {
      const u = r.url()
      if (EXTERNAL.test(u) && !NETWORK_FIXTURES.some((f) => f.match.test(u))) network.harHits++
    })
    page.on('requestfailed', (r) => {
      const u = r.url()
      if (!network.blocked.includes(u)) network.failed.push(`${u.slice(0, 140)} — ${r.failure()?.errorText ?? '?'}`)
    })
    let crashed = false
    page.on('crash', () => { crashed = true })

    // ── Screencast CDP ────────────────────────────────────────────────────
    const cdp = await context.newCDPSession(page)
    let n = 0
    cdp.on('Page.screencastFrame', (f: { data: string; sessionId: number; metadata: { timestamp?: number } }) => {
      const file = path.join(framesDir, `${String(++n).padStart(6, '0')}.jpg`)
      writeFileSync(file, Buffer.from(f.data, 'base64'))
      frames.push({ file, ts: f.metadata.timestamp ?? Date.now() / 1000 })
      void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
    })
    await cdp.send('Page.startScreencast', {
      format: 'jpeg', quality: cfg.jpegQuality,
      maxWidth: cfg.viewport.width * cfg.deviceScaleFactor, maxHeight: cfg.viewport.height * cfg.deviceScaleFactor,
      everyNthFrame: 1,
    })

    log('lecture du scénario dans le navigateur…')
    await page.goto(`${server.url}/?capture=1`, { waitUntil: 'load' })

    // ── Attente de la fin réelle ───────────────────────────────────────────
    const t0 = Date.now()
    let result: DemoRunResult | null = null
    let lastStep = -1
    while (!result) {
      if (crashed || page.isClosed()) await failReport('capture interrompue (page fermée ou plantée)')
      if (Date.now() - t0 > cfg.maxDurationMs) await failReport(`délai global dépassé (${cfg.maxDurationMs} ms)`)
      const state = await page.evaluate(() => {
        const w = window as unknown as { __ASTROR_CAPTURE_RESULT__?: DemoRunResult | null; __ASTROR_CAPTURE_EVENTS__?: DemoEvent[] }
        const evs = w.__ASTROR_CAPTURE_EVENTS__ ?? []
        const lastStart = [...evs].reverse().find((e) => e.type === 'step:start')
        return { result: w.__ASTROR_CAPTURE_RESULT__ ?? null, step: lastStart?.step ?? -1, started: !!w.__ASTROR_CAPTURE_EVENTS__ }
      }).catch(() => ({ result: null, step: -1, started: false }))
      if (!state.started && Date.now() - t0 > 20000) await failReport('le mode capture ne s’est pas lancé (requête non reçue par l’app ?)')
      if (state.step !== lastStep) { lastStep = state.step; log(`étape ${state.step + 1}/${scn.scenario.steps.length}`) }
      result = state.result
      if (!result) await sleep(250)
    }

    await sleep(cfg.tailMs)   // dernière image tenue
    const events = await page.evaluate(() => (window as unknown as { __ASTROR_CAPTURE_EVENTS__: DemoEvent[] }).__ASTROR_CAPTURE_EVENTS__)
    await cdp.send('Page.stopScreencast').catch(() => {})
    const endTs = Date.now() / 1000

    if (!result.ok) {
      await failReport(`étape ${(result.step ?? 0) + 1} — ${result.error ?? 'erreur inconnue'}`, { failedStep: result.step, events: events as CaptureEvent[] })
    }
    if (pageErrors.length) log(`⚠ erreurs JavaScript de la page : ${pageErrors.length}`)

    // ── Restauration du store ──────────────────────────────────────────────
    const storeRestored = await page.evaluate((expected) => {
      (window as unknown as { __ASTROR_STOP_DEMO__?: () => void }).__ASTROR_STOP_DEMO__?.()
      const now: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!
        if (k.startsWith('astror_')) now[k] = localStorage.getItem(k)!
      }
      // Les clés écrites par l'app elle-même hors démo (horodatages PWA) sont tolérées.
      const ignore = (k: string) => k.startsWith('astror_pwa_')
      const a = Object.keys(now).filter((k) => !ignore(k)).sort()
      const b = Object.keys(expected).filter((k) => !ignore(k)).sort()
      return a.join() === b.join() && b.every((k) => now[k] === expected[k])
    }, seed)

    await context.close(); context = null   // écrit le HAR en mode refresh
    await browser.close(); browser = null
    server.stop(); server = null

    // ── Assemblage MP4 30 i/s constants ────────────────────────────────────
    if (frames.length < 2) await failReport('aucune image capturée')
    const base = frames[0].ts
    const lines = ['ffconcat version 1.0']
    for (let i = 0; i < frames.length; i++) {
      const next = i + 1 < frames.length ? frames[i + 1].ts : endTs
      lines.push(`file '${path.basename(frames[i].file)}'`, `duration ${Math.max(0.001, next - frames[i].ts).toFixed(6)}`)
    }
    lines.push(`file '${path.basename(frames.at(-1)!.file)}'`)
    const list = path.join(framesDir, 'list.ffconcat')
    writeFileSync(list, lines.join('\n') + '\n')
    const mp4 = files.screen(scn.id)
    log(`assemblage de ${frames.length} images…`)
    await runOk('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list,
      '-vf', `fps=${fps},scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-movflags', '+faststart', mp4])
    const durationS = endTs - base
    const W = cfg.viewport.width * cfg.deviceScaleFactor
    const H = cfg.viewport.height * cfg.deviceScaleFactor

    // ── Synchronisation ───────────────────────────────────────────────────
    const mark = events.find((e) => e.type === 'sync:mark')
    if (!mark) await failReport('événement sync:mark absent')
    const scanned = await findSyncMark(mp4, fps)
    const byTs = mark!.epoch / 1000 - base
    const markVideoT = scanned ?? byTs
    const drift = scanned != null ? Math.round((scanned - byTs) * 1000) : null
    if (scanned == null) log('⚠ mire non détectée dans l’image : synchronisation par horodatage')
    const capEvents: CaptureEvent[] = events.map((e) => ({ ...e, videoT: +(markVideoT + (e.t - mark!.t) / 1000).toFixed(4) }))

    // Contrôle de complétude : chaque étape a démarré et s'est terminée.
    const missing = scn.scenario.steps.map((_, i) => i).filter((i) =>
      !capEvents.some((e) => e.type === 'step:start' && e.step === i) || !capEvents.some((e) => e.type === 'step:end' && e.step === i))
    if (missing.length) await failReport(`étapes incomplètes : ${missing.join(', ')}`)
    if (!capEvents.some((e) => e.type === 'scenario:end')) await failReport('scenario:end absent')

    // Les images sources ne servent plus (screen.mp4 fait foi).
    rmSync(framesDir, { recursive: true, force: true })

    const manifest: CaptureManifest = {
      ...manifestBase,
      ok: true,
      video: { file: path.basename(mp4), width: W, height: H, fps, durationS: +durationS.toFixed(3), frames: Math.round(durationS * fps) },
      sync: { markVideoT: +markVideoT.toFixed(4), method: scanned != null ? 'frame-scan' : 'timestamps', screencastDriftMs: drift },
      events: capEvents,
      network,
      storeRestored,
    }
    writeJson(files.capture(scn.id), { ...manifest, pageErrors })
    if (!storeRestored) throw new StudioError('Le localStorage n’a pas été restauré à l’identique après la démo')
    return manifest
  } finally {
    process.removeListener('SIGINT', onSigint)
    await context?.close().catch(() => {})
    await browser?.close().catch(() => {})
    server?.stop()
  }
}
