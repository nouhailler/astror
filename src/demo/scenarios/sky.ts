// Visite guidée de la carte du ciel.
import type { Scenario } from '../types'

const sky: Scenario = {
  name: 'sky',
  label: 'Carte du ciel',
  description: 'Filtres, fiche d’un astre, boussole et simulation temporelle.',
  steps: [
    { type: 'navigate', to: 'sky',
      narrate: 'La carte du ciel en temps réel, pour votre position et l’heure actuelle.' },
    { type: 'highlight', target: 'sky-compass', label: 'Boussole',
      narrate: 'Le mode boussole aligne la carte sur la direction de votre téléphone.' },
    { type: 'click', target: 'sky-filter-planet',
      narrate: 'Filtrons pour ne garder que les planètes.' },
    { type: 'click', target: 'sky-filter-deep',
      narrate: 'Ou le ciel profond : galaxies, nébuleuses, amas.' },
    { type: 'click', target: 'sky-filter-all',
      narrate: 'Revenons à l’ensemble du ciel.' },
    { type: 'highlight', target: 'sky-time', label: 'Voyage dans le temps',
      narrate: 'Ce curseur simule le ciel jusqu’à douze heures plus tard.' },
    { type: 'highlight', target: 'sky-list-first',
      narrate: 'La liste des objets visibles, triée par magnitude.' },
    { type: 'click', target: 'sky-list-first',
      narrate: 'Touchez un objet pour sa fiche : magnitude, altitude, distance, panel IA.' },
    { type: 'wait', ms: 1600 },
    { type: 'narrate', title: 'Carte du ciel',
      text: 'Vous savez lire le ciel de ce soir. ✕ ou Échap pour quitter.' },
  ],
}

export default sky
