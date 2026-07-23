// Pont entre le moteur démo (DOM pur) et l'application React.
// App.jsx enregistre un « hôte » qui sait changer d'onglet / ouvrir un outil.
// Le moteur navigue via cet hôte plutôt qu'en cliquant, pour attendre le montage
// des écrans chargés à la demande (code-splitting).

import type { TabKey, ToolKey } from './types'

export interface DemoHost {
  /** Change d'écran : onglet principal ou ouverture d'un outil. */
  navigate: (target: { tab?: TabKey; tool?: ToolKey }) => void
  /** Onglet actuellement affiché (pour restaurer l'état en sortie). */
  getTab: () => TabKey
  /** Ouvre la feuille Réglages (optionnel). */
  openSettings?: () => void
}

let host: DemoHost | null = null

/** Enregistre l'hôte. Renvoie une fonction de désinscription. */
export function registerDemoHost(h: DemoHost): () => void {
  host = h
  return () => { if (host === h) host = null }
}

export function getDemoHost(): DemoHost | null {
  return host
}

/** Vrai si l'utilisateur a activé « animations réduites ». */
export function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  } catch {
    return false
  }
}
