// Configuration video-studio d'Astror (https://github.com/nouhailler/video-studio).
// Tout ce qui est propre à Astror vit ici ; le moteur de production est le paquet.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineVideoConfig } from '@nouhailler/video-studio'
import { SCENARIOS } from '../src/demo/scenarios'
import { NETWORK_FIXTURES } from './fixtures/network'
import { fromDemoScenario } from './scenarios/from-demo'
import presentationFr from './scenarios/astror-presentation-fr'

const TABS = ['sky', 'eph', 'explore', 'feed', 'tools', 'ai']
const TOOLS = ['observe', 'moon', 'planets', 'events', 'astrophoto', 'satellites', 'education', 'community', 'ai', 'extras']

export default defineVideoConfig({
  name: 'Astror',
  app: { build: 'npx vite build --logLevel error', staticDir: 'dist' },

  // Astror embarque son propre moteur de démo (src/demo/), qui parle le
  // protocole de capture : ?capture=1 + window.__ASTROR_CAPTURE__ injecté.
  driver: {
    type: 'engine',
    url: '/?capture=1',
    globals: {
      request: '__ASTROR_CAPTURE__',
      events: '__ASTROR_CAPTURE_EVENTS__',
      result: '__ASTROR_CAPTURE_RESULT__',
      stop: '__ASTROR_STOP_DEMO__',
      realClock: '__ASTROR_REAL_CLOCK__',
    },
  },
  layout: 'phone',   // PWA mobile portrait : 430×932 @2x dans une maquette de téléphone

  scenarios: [presentationFr, ...Object.values(SCENARIOS).map((s) => fromDemoScenario(s))],

  // Graine posée avant le chargement : onboarding vu, astuces et annonces masquées,
  // profil de démonstration (jamais les données réelles de l'utilisateur).
  preseed: (scn, { root }) => {
    const tipsSrc = readFileSync(path.join(root, 'src', 'tips.jsx'), 'utf8')
    const tipKeys = [...(tipsSrc.match(/export const TIPS = \{([\s\S]*?)\n\}/)?.[1] ?? '').matchAll(/^ {2}(\w+): \[/gm)].map((m) => m[1])
    const annIds = [...readFileSync(path.join(root, 'src', 'announcements.jsx'), 'utf8').matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1])
    const loc = scn.video.location ?? { city: 'Paris', lat: 48.8566, lng: 2.3522 }
    return {
      astror_onboarded_v1: '1',
      astror_profile_v1: JSON.stringify({
        location: loc, level: 'Amateur', interests: ['Planètes', 'Ciel profond', 'Lune & Soleil'],
        gear: ['Jumelles', 'Télescope'], alerts: { iss: true, conj: true, meteor: true, eclipse: false },
      }),
      astror_tips_v1: JSON.stringify(Object.fromEntries(tipKeys.map((k) => [k, true]))),
      astror_announcements_v1: JSON.stringify(annIds),
    }
  },
  // Le moteur de démo doit rendre le localStorage exactement comme il l'a trouvé.
  verifyRestore: { prefix: 'astror_', ignore: (k) => k.startsWith('astror_pwa_') },

  network: { fixtures: NETWORK_FIXTURES, fixturesDir: 'fixtures/network' },

  validation: {
    sourceDirs: ['src'],
    extraTargets: [...TABS.map((t) => `tab-${t}`), ...TOOLS.map((t) => `tool-${t}`)],
    validateStep: (s) => {
      if (s.type !== 'navigate') return []
      const errs: string[] = []
      if (!s.to && !s.tool) errs.push('« to » ou « tool » requis')
      if (typeof s.to === 'string' && !TABS.includes(s.to)) errs.push(`onglet inconnu « ${s.to} »`)
      if (typeof s.tool === 'string' && !TOOLS.includes(s.tool)) errs.push(`outil inconnu « ${s.tool} »`)
      return errs
    },
  },

  pronunciations: {
    fr: [
      [/astror\.swinux\.ch/gi, 'astror point swinux point ch'],
      [/github\.com\/nouhailler\/astror/gi, 'github point com, slash nouhailler, slash astror'],
      [/\bASTROR\b/g, 'Astror'],
      [/\bOpenRouter\b/g, 'Open Router'],
      [/\bJames Webb\b/g, 'James Ouèbe'],
      [/\bISS\b/g, 'I S S'],
    ],
    en: [[/\bASTROR\b/g, 'Astror']],
  },

  // Identité visuelle d'Astror (les couleurs par défaut du paquet sont celles d'Astror).
  theme: { brand: 'Astror', url: 'astror.swinux.ch', logo: 'assets/logo.svg' },
})
