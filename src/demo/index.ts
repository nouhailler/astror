// API publique du mode démo.
//   startDemo(name)  — lance un scénario (moteur chargé à la demande)
//   stopDemo()       — arrête la démo en cours et restaure l'app
//   getScenarioList()— métadonnées pour l'UI (réglages)
//   getDemoParam()   — lit ?demo=<name> et valide le nom
//   getCaptureRequest() / startCapture() — mode capture vidéo (Astror Video Studio)
//
// L'engine (et son overlay) n'est importé que lorsqu'une démo démarre : le
// bundle initial ne porte que ce petit index + les scénarios déclaratifs.

import { SCENARIOS, SCENARIO_ORDER } from './scenarios'
import type { DemoEngine } from './engine'
import type { CaptureOptions, DemoEvent, DemoRunResult, Scenario } from './types'

let current: DemoEngine | null = null
// Jeton de démarrage : un startDemo plus récent annule un démarrage encore en
// cours d'import (cas de l'effet exécuté deux fois sous React.StrictMode en dev).
let startToken = 0

export function getScenarioList(): { name: string; label: string; description?: string }[] {
  return SCENARIO_ORDER.map(n => {
    const s = SCENARIOS[n]
    return { name: s.name, label: s.label, description: s.description }
  })
}

export function hasScenario(name: string | null | undefined): boolean {
  return !!name && name in SCENARIOS
}

/** Lit et valide ?demo=<name> dans l'URL. Renvoie le nom ou null. */
export function getDemoParam(): string | null {
  try {
    const name = new URLSearchParams(window.location.search).get('demo')
    return hasScenario(name) ? name : null
  } catch {
    return null
  }
}

export async function startDemo(name: string): Promise<boolean> {
  const scenario = SCENARIOS[name]
  if (!scenario) return false
  stopDemo()
  const token = ++startToken
  const { DemoEngine } = await import('./engine')
  if (token !== startToken) return false   // supplanté entre-temps
  current = new DemoEngine(scenario)
  current.start()
  return true
}

export function stopDemo(): void {
  current?.stop()
  current = null
}

// ── Mode capture vidéo ──────────────────────────────────────────────────────
// Activé UNIQUEMENT si les deux conditions sont réunies :
//   1. l'URL contient ?capture=1 ;
//   2. l'outil d'enregistrement a injecté window.__ASTROR_CAPTURE__ avant le
//      chargement (Playwright addInitScript).
// Un utilisateur normal ne peut donc pas l'activer par mégarde.

export interface CaptureRequest {
  scenario: Scenario
  options?: CaptureOptions
  seed?: Record<string, string>
}

interface CaptureWindow {
  __ASTROR_CAPTURE__?: CaptureRequest
  __ASTROR_CAPTURE_EVENTS__?: DemoEvent[]
  __ASTROR_CAPTURE_RESULT__?: DemoRunResult | null
  __ASTROR_STOP_DEMO__?: () => void
}

export function getCaptureRequest(): CaptureRequest | null {
  try {
    if (new URLSearchParams(window.location.search).get('capture') !== '1') return null
    const req = (window as unknown as CaptureWindow).__ASTROR_CAPTURE__
    if (!req || !req.scenario || !Array.isArray(req.scenario.steps)) return null
    return req
  } catch {
    return null
  }
}

export async function startCapture(req: CaptureRequest): Promise<boolean> {
  const w = window as unknown as CaptureWindow
  stopDemo()
  const token = ++startToken
  const { DemoEngine } = await import('./engine')
  if (token !== startToken) return false
  w.__ASTROR_CAPTURE_EVENTS__ = []
  w.__ASTROR_CAPTURE_RESULT__ = null
  w.__ASTROR_STOP_DEMO__ = stopDemo
  current = new DemoEngine(req.scenario, {
    mode: 'capture',
    capture: req.options,
    seed: req.seed,
    onEvent: (e) => { w.__ASTROR_CAPTURE_EVENTS__?.push(e) },
    onFinish: (r) => { if (!w.__ASTROR_CAPTURE_RESULT__) w.__ASTROR_CAPTURE_RESULT__ = r },
  })
  current.start()
  return true
}
