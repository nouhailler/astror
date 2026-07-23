// API publique du mode démo.
//   startDemo(name)  — lance un scénario (moteur chargé à la demande)
//   stopDemo()       — arrête la démo en cours et restaure l'app
//   getScenarioList()— métadonnées pour l'UI (réglages)
//   getDemoParam()   — lit ?demo=<name> et valide le nom
//
// L'engine (et son overlay) n'est importé que lorsqu'une démo démarre : le
// bundle initial ne porte que ce petit index + les scénarios déclaratifs.

import { SCENARIOS, SCENARIO_ORDER } from './scenarios'
import type { DemoEngine } from './engine'

let current: DemoEngine | null = null

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
  const { DemoEngine } = await import('./engine')
  current = new DemoEngine(scenario)
  current.start()
  return true
}

export function stopDemo(): void {
  current?.stop()
  current = null
}
