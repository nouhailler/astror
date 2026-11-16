// Types déclaratifs du mode démo (visites guidées).
// Aucune logique ici : uniquement la forme des étapes et des scénarios.
// Les scénarios (src/demo/scenarios/*.ts) n'importent que ces types.

/** Onglets principaux de l'application (clés de App.jsx). */
export type TabKey = 'sky' | 'eph' | 'explore' | 'feed' | 'tools' | 'ai'

/** Clés des outils ouvrables via l'onglet « Outils » (voir tools.jsx). */
export type ToolKey =
  | 'observe' | 'moon' | 'planets' | 'events' | 'astrophoto'
  | 'satellites' | 'education' | 'community' | 'ai' | 'extras'

/**
 * Change d'écran. Soit un onglet principal (`to`), soit l'ouverture directe
 * d'un outil (`tool`) — dans ce cas l'onglet « Outils » est activé.
 * Le ciblage passe par l'hôte React, jamais par le DOM, pour attendre le montage.
 */
export interface NavigateStep {
  type: 'navigate'
  to?: TabKey
  tool?: ToolKey
  /** Légende affichée pendant la navigation. */
  narrate?: string
}

/** Déclenche un clic réel sur l'élément ciblé par son data-demo-id. */
export interface ClickStep {
  type: 'click'
  target: string
  narrate?: string
}

/** Saisit du texte, caractère par caractère, dans le champ ciblé. */
export interface TypeStep {
  type: 'type'
  target: string
  text: string
  narrate?: string
}

/** Pause simple, en millisecondes (échelle de vitesse appliquée). */
export interface WaitStep {
  type: 'wait'
  ms: number
}

/** Déplace le curseur et met l'élément en surbrillance, sans cliquer. */
export interface HighlightStep {
  type: 'highlight'
  target: string
  /** Étiquette optionnelle accolée à la surbrillance. */
  label?: string
  narrate?: string
}

/** Affiche une bulle de narration (aucun ciblage d'élément). */
export interface NarrateStep {
  type: 'narrate'
  text: string
  title?: string
  /** Durée d'affichage forcée (sinon calculée d'après la longueur du texte). */
  ms?: number
}

export type DemoStep =
  | NavigateStep | ClickStep | TypeStep | WaitStep | HighlightStep | NarrateStep

export interface Scenario {
  /** Identifiant stable, utilisé dans ?demo=<name>. */
  name: string
  /** Libellé lisible (barre de contrôle, réglages). */
  label: string
  /** Résumé court affiché dans les réglages. */
  description?: string
  steps: DemoStep[]
}

// ── Mode capture & événements (Astror Video Studio) ─────────────────────────
// Ajouts rétrocompatibles : un scénario existant s'exécute sans changement.

/** Mode d'exécution du moteur. `interactive` = comportement historique. */
export type DemoMode = 'interactive' | 'capture'

/** Événements émis par le moteur, dans les deux modes. */
export type DemoEventType =
  | 'scenario:start' | 'scenario:end'
  | 'step:start' | 'step:end'
  | 'navigation:complete'
  | 'cursor:move'
  | 'action:click' | 'action:type'
  | 'highlight:show' | 'highlight:hide'
  | 'narration:show' | 'narration:hide'
  | 'action:error'
  | 'sync:mark'

export interface DemoEvent {
  type: DemoEventType
  /** Horloge réelle de la page (ms, performance.now non simulé). */
  t: number
  /** Même instant en temps Unix (ms) — timeOrigin réel + t. */
  epoch: number
  /** Index de l'étape concernée, s'il y a lieu. */
  step?: number
  data?: Record<string, unknown>
}

/** Réglages du mode capture vidéo (ignorés en mode interactif). */
export interface CaptureOptions {
  /**
   * Durée minimale (ms) de chaque étape, par index. Mesurée à partir de
   * l'apparition de la narration de l'étape (ou de son début s'il n'y en a pas).
   * Sert à caler l'image sur la durée réelle de la voix générée.
   */
  holdMs?: Record<number, number>
  /** Affiche la bulle de narration dans l'app (défaut : false). */
  showNarration?: boolean
  /** Multiplicateur de vitesse des animations du moteur (défaut : 1). */
  speed?: number
  /** Affiche une mire de synchronisation avant le scénario (défaut : true). */
  syncMark?: boolean
  /** Délai max d'attente d'un élément / d'un écran (défaut : 8000 ms). */
  stepTimeoutMs?: number
  /** Respiration entre deux étapes (défaut : 850 ms, avant vitesse). */
  breathMs?: number
}

export interface DemoRunResult {
  ok: boolean
  error?: string
  step?: number
}

export interface DemoEngineOptions {
  mode?: DemoMode
  capture?: CaptureOptions
  /** Clés astror_ supplémentaires posées après la graine de démo. */
  seed?: Record<string, string>
  onEvent?: (e: DemoEvent) => void
  onFinish?: (r: DemoRunResult) => void
}
