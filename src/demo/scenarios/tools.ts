// Visite guidée de la boîte à outils.
import type { Scenario } from '../types'

const tools: Scenario = {
  name: 'tools',
  label: 'Boîte à outils',
  description: 'Les modules d’observation, avec ouverture de l’outil Lune.',
  steps: [
    { type: 'navigate', to: 'tools',
      narrate: 'La boîte à outils : dix modules pour préparer et mener vos observations.' },
    { type: 'highlight', target: 'tool-observe', label: 'Observer',
      narrate: 'Observer prépare votre session : météo, créneaux, catalogues.' },
    { type: 'highlight', target: 'tool-astrophoto', label: 'Astrophoto',
      narrate: 'Astrophoto calcule fenêtres de nuit et temps de pose.' },
    { type: 'navigate', tool: 'moon',
      narrate: 'Ouvrons l’outil Lune.' },
    { type: 'wait', ms: 1200 },
    { type: 'narrate', title: 'Outil Lune',
      text: 'Phase exacte, illumination, distance, et carte interactive des mers et cratères.' },
    { type: 'narrate', title: 'Boîte à outils',
      text: 'Chaque module est adapté à votre profil. ✕ ou Échap pour quitter.' },
  ],
}

export default tools
