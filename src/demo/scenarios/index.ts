// Registre des scénarios déclaratifs.
import type { Scenario } from '../types'
import tour from './tour'
import sky from './sky'
import tools from './tools'
import assistant from './assistant'

const list: Scenario[] = [tour, sky, tools, assistant]

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(
  list.map(s => [s.name, s]),
)

export const SCENARIO_ORDER = list.map(s => s.name)
