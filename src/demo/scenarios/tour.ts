// Grand tour : parcours complet des six onglets principaux.
// Scénario déclaratif — aucune logique.

import type { Scenario } from '../types'

const tour: Scenario = {
  name: 'tour',
  label: 'Visite guidée complète',
  description: 'Un survol des six écrans principaux, de la carte du ciel à l’assistant IA.',
  steps: [
    { type: 'navigate', to: 'sky',
      narrate: 'Bienvenue dans Astror. Voici la carte du ciel de ce soir, calculée pour votre position.' },
    { type: 'highlight', target: 'sky-filter-planet', label: 'Filtres',
      narrate: 'Vous pouvez filtrer les astres par catégorie.' },
    { type: 'click', target: 'sky-filter-planet',
      narrate: 'Ici, seules les planètes visibles ce soir sont affichées.' },
    { type: 'click', target: 'sky-filter-all',
      narrate: 'Et de nouveau tout le ciel.' },
    { type: 'highlight', target: 'sky-list-first',
      narrate: 'La liste « Maintenant visible » est triée par éclat.' },
    { type: 'click', target: 'sky-list-first',
      narrate: 'Touchez un astre pour ouvrir sa fiche détaillée.' },
    { type: 'wait', ms: 1400 },

    { type: 'navigate', to: 'eph',
      narrate: 'Les Éphémérides : Lune, Soleil, alertes et prochains événements du jour.' },
    { type: 'navigate', to: 'explore',
      narrate: 'Explorer : les planètes en direct, le James Webb et la conquête spatiale.' },
    { type: 'navigate', to: 'feed',
      narrate: 'La Veille : la photo du jour de la NASA et l’actualité spatiale.' },

    { type: 'navigate', to: 'tools',
      narrate: 'La boîte à outils regroupe dix modules d’observation.' },
    { type: 'highlight', target: 'tool-moon', label: 'Lune',
      narrate: 'Par exemple l’outil Lune : phases, carte des mers et cratères.' },

    { type: 'navigate', to: 'ai',
      narrate: 'Et l’assistant IA, expert en astronomie, qui connaît votre profil.' },
    { type: 'narrate', title: 'Fin de la visite',
      text: 'C’est terminé. Appuyez sur ✕ ou Échap pour quitter à tout moment.' },
  ],
}

export default tour
