// Registre des scénarios vidéo.
//  - Tutoriels écrits pour la vidéo (métadonnées audiovisuelles complètes).
//  - Démos existantes réutilisées telles quelles (adaptateur fromDemoScenario).
import { SCENARIOS } from '../../src/demo/scenarios'
import type { VideoScenario } from '../types/video.types'
import { fromDemoScenario } from './from-demo'
import presentationFr from './astror-presentation-fr'

export const VIDEO_SCENARIOS: VideoScenario[] = [
  presentationFr,
  ...Object.values(SCENARIOS).map((s) => fromDemoScenario(s)),
]
