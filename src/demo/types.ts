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
