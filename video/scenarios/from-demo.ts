// Migration sans réécriture : transforme un scénario de démo existant
// (src/demo/scenarios) en scénario vidéo, sans modifier ses étapes.
// Les textes `narrate` / `text` déjà présents deviennent la narration parlée.
import type { VideoMetadata, VideoScenario, VideoStepMetadata } from '@nouhailler/video-studio'
import type { DemoStep, Scenario } from '../../src/demo/types'

/** Étape du moteur de démo d'Astror + métadonnées vidéo optionnelles. */
export type AstrorVideoStep = DemoStep & { video?: VideoStepMetadata }
export type AstrorVideoScenario = VideoScenario<AstrorVideoStep>

export const DEFAULT_VIDEO: Omit<VideoMetadata, 'title'> = {
  language: 'fr',
  voiceEnabled: true,
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  intro: false,
  outro: false,
  subtitles: { export: true, burnIn: false },
  // Soirée de référence : ciel reproductible (Paris, 20 nov. 2026, 21 h 30).
  clock: '2026-11-20T21:30:00+01:00',
  timezone: 'Europe/Paris',
  location: { city: 'Paris', lat: 48.8566, lng: 2.3522 },
}

export function fromDemoScenario(
  scenario: Scenario,
  overrides: Partial<VideoMetadata> & { id?: string } = {},
): AstrorVideoScenario {
  const { id, ...video } = overrides
  return {
    id: id ?? `demo-${scenario.name}`,
    video: { ...DEFAULT_VIDEO, title: scenario.label, description: scenario.description, ...video },
    scenario,
  }
}
