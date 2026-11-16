// Types d'Astror Video Studio.
//
// Un scénario vidéo = un `Scenario` du moteur de démo (src/demo/types.ts),
// inchangé, enrichi de métadonnées audiovisuelles OPTIONNELLES :
//   - au niveau du scénario : `video` (titre, langue, voix, intro/outro…) ;
//   - au niveau de chaque étape : `video` (narration parlée, chapitre, zoom…).
// Le moteur ignore ces champs : il n'a aucune dépendance vers Remotion/Piper.
// Par défaut, le texte parlé est celui déjà présent dans `narrate` / `text`
// (aucune duplication) ; `video.narration.text` ne sert qu'à le surcharger.

import type { DemoStep, Scenario, DemoEvent, TabKey } from '../../src/demo/types'

export type { DemoStep, Scenario, DemoEvent, TabKey }

export type LanguageCode = 'fr' | 'en' | (string & {})

export interface VideoNarration {
  /** Texte parlé (par défaut : `narrate` ou `text` de l'étape). */
  text?: string
  /** Langue (par défaut : celle du scénario). */
  language?: LanguageCode
  /** Voix (clé de `voices` dans video.config.ts ; défaut : voix de la langue). */
  voice?: string
  /** Débit : 1 = normal, 1.1 = 10 % plus rapide. */
  rate?: number
  /** Silence avant la voix (ms). */
  pauseBeforeMs?: number
  /** Maintien après la voix (ms) : le texte reste affiché. */
  pauseAfterMs?: number
}

export interface VideoStepMetadata {
  /** Narration parlée ; `false` = étape muette même si `narrate` existe. */
  narration?: VideoNarration | false
  /** Sous-titre forcé (par défaut : le texte parlé). */
  subtitle?: string
  /** Pause de lecture supplémentaire après la voix (ms). */
  readingPause?: number
  /** Transition visuelle au début de l'étape. */
  transition?: 'none' | 'fade' | 'slide'
  /** Début d'un chapitre (titre affiché + chapitrage YouTube). */
  chapter?: string
  /** Zoom léger sur l'élément mis en évidence (ex. 1.25). */
  zoom?: number
}

/** Étape du moteur + métadonnées vidéo optionnelles. */
export type VideoStep = DemoStep & { video?: VideoStepMetadata }

export interface VideoCard {
  /** Petit sur-titre (ex. « Tutoriel »). */
  eyebrow?: string
  title?: string
  tagline?: string
  /** Narration parlée pendant la carte. */
  narration?: string
  bullets?: string[]
  links?: { label: string; url: string }[]
  /** Durée minimale (ms) si la narration est absente ou courte. */
  minDurationMs?: number
}

export interface VideoMetadata {
  title: string
  description?: string
  language: LanguageCode
  voiceEnabled: boolean
  /** Voix par défaut (clé de `voices`). */
  voice?: string
  resolution: { width: number; height: number }
  fps: number
  intro?: VideoCard | false
  outro?: VideoCard | false
  subtitles?: { export?: boolean; burnIn?: boolean }
  /** Date/heure simulée dans le navigateur (ISO 8601), pour un ciel reproductible. */
  clock: string
  /** Fuseau horaire du navigateur. */
  timezone?: string
  /** Position simulée (profil de démo + géolocalisation). */
  location?: { city: string; lat: number; lng: number }
  /** Clés astror_ supplémentaires (données de démonstration). */
  seed?: Record<string, string>
  /** Vitesse des animations du moteur (défaut 1). */
  speed?: number
  /** Chapitre de la première séquence (après l'intro). */
  firstChapter?: string
}

export interface VideoScenario {
  /** Identifiant du tutoriel (nom de fichier de sortie). */
  id: string
  video: VideoMetadata
  scenario: Omit<Scenario, 'steps'> & { steps: VideoStep[] }
}

// ── Artefacts du pipeline ───────────────────────────────────────────────────

export interface WordTiming { word: string; start: number; end: number }

export interface VoiceSentence {
  text: string
  /** Fichier WAV (relatif au dossier audio du scénario). */
  file: string
  hash: string
  /** Décalage dans le segment (ms), pause initiale comprise. */
  offsetMs: number
  durationMs: number
  /** Minutage des mots : exact si le moteur TTS le fournit, sinon estimé. */
  words: WordTiming[]
  wordTiming: 'exact' | 'estimated'
}

export interface VoiceSegment {
  key: string                // 'intro' | 'outro' | 'step-<i>'
  kind: 'intro' | 'step' | 'outro'
  step?: number
  text: string
  language: LanguageCode
  voice: string
  pauseBeforeMs: number
  pauseAfterMs: number
  /** Durée de la voix seule (de la 1re phrase au dernier échantillon). */
  speechMs: number
  /** pauseBefore + speech + pauseAfter : durée minimale de l'étape. */
  totalMs: number
  sentences: VoiceSentence[]
}

export interface VoiceManifest {
  scenarioId: string
  engine: string
  generatedAt: string
  voiceEnabled: boolean
  segments: VoiceSegment[]
  cache: { hits: number; misses: number }
}

export interface CaptureEvent extends DemoEvent {
  /** Instant dans screen.mp4 (s). */
  videoT: number
}

export interface NetworkReport {
  mode: 'replay' | 'refresh' | 'offline'
  fixtures: string[]
  harHits: number
  blocked: string[]
  failed: string[]
}

export interface CaptureManifest {
  scenarioId: string
  recordedAt: string
  ok: boolean
  error?: string
  failedStep?: number
  viewport: { width: number; height: number; deviceScaleFactor: number }
  clock: string
  video: { file: string; width: number; height: number; fps: number; durationS: number; frames: number }
  sync: { markVideoT: number; method: 'frame-scan' | 'timestamps'; screencastDriftMs: number | null }
  events: CaptureEvent[]
  network: NetworkReport
  storeRestored: boolean | null
}

export interface TimelineSentence {
  text: string
  src: string          // fichier dans le publicDir de Remotion
  from: number         // image de début (absolue)
  durationInFrames: number
  words: { word: string; from: number }[]
  segment: string
}

export interface TimelineCue { index: number; startMs: number; endMs: number; lines: string[] }

export interface Timeline {
  id: string
  title: string
  description?: string
  language: string
  fps: number
  width: number
  height: number
  durationInFrames: number
  intro: { from: number; durationInFrames: number; card: VideoCard } | null
  body: {
    from: number
    durationInFrames: number
    src: string
    /** Début du passage utile dans screen.mp4 (images). */
    trimStartFrames: number
    screen: { width: number; height: number }
  }
  outro: { from: number; durationInFrames: number; card: VideoCard } | null
  sentences: TimelineSentence[]
  chapters: { title: string; from: number }[]
  zooms: { from: number; to: number; scale: number; cx: number; cy: number }[]
  transitions: { at: number; kind: 'fade' | 'slide' }[]
  cues: TimelineCue[]
  subtitles: { burnIn: boolean }
}
