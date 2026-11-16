// Chargement des scénarios vidéo (video/scenarios/).
import { VIDEO_SCENARIOS } from '../../scenarios'
import type { VideoScenario } from '../../types/video.types'
import { StudioError } from './util'

export function listScenarios(): VideoScenario[] {
  return VIDEO_SCENARIOS
}

export function loadScenario(id: string | undefined | boolean): VideoScenario {
  if (!id || typeof id !== 'string') {
    throw new StudioError(`Préciser --scenario <id>. Disponibles : ${VIDEO_SCENARIOS.map((s) => s.id).join(', ')}`)
  }
  const s = VIDEO_SCENARIOS.find((x) => x.id === id)
  if (!s) throw new StudioError(`Scénario vidéo inconnu : « ${id} ». Disponibles : ${VIDEO_SCENARIOS.map((x) => x.id).join(', ')}`)
  return s
}
