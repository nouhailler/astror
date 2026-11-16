# Astror Video Studio

Production automatique de tutoriels vidéo à partir du **moteur de démo existant** (`src/demo/`).
Un scénario TypeScript versionné dans GitHub est joué dans la vraie interface d'Astror,
filmé, doublé par une voix de synthèse locale, sous-titré, puis exporté en MP4 prêt pour YouTube.

```text
ASTROR VIDEO STUDIO

[1/6] Validation du scénario          OK
[2/6] Préparation des données         OK
[3/6] Génération de la voix           OK
[4/6] Enregistrement du parcours      OK
[5/6] Composition de la vidéo         OK
[6/6] Exportation MP4                 OK

Vidéo générée :
video/output/astror-presentation-fr.mp4
```

C'est un **outil de développement local** : rien ici n'est importé par l'application, et le
bundle de production de la PWA est inchangé (Remotion, Piper, Playwright et FFmpeg n'y entrent pas).

---

## 1. Installation

Prérequis : Node ≥ 18, Python 3 avec `venv`, FFmpeg (`ffmpeg` + `ffprobe` dans le PATH).

```bash
npm install
```

```bash
npm run video:setup
```

`video:setup` crée `video/.venv`, installe `piper-tts`, télécharge les voix (≈ 63 Mo chacune) dans
`video/models/` et installe Chromium pour Playwright. Au premier rendu, Remotion télécharge
aussi son propre « Chrome Headless Shell » (≈ 100 Mo). Tout est local ensuite : **aucune API
payante ni service cloud** n'est nécessaire.

## 2. Commandes

| Commande | Rôle |
|---|---|
| `npm run video:list` | Liste les scénarios vidéo et ce qui a déjà été produit |
| `npm run video:validate -- --scenario <id>` | Contrôle statique (cibles `data-demo-id` présentes dans `src/`, onglets, voix, horloge…) |
| `npm run video:audio -- --scenario <id> [--force]` | Génère la narration (cache par empreinte) |
| `npm run video:record -- --scenario <id>` | Joue et filme le scénario dans Chromium |
| `npm run video:render -- --scenario <id>` | Chronologie + rendu Remotion + vérification de l'export |
| `npm run video:generate -- --scenario <id>` | Toutes les étapes, dans l'ordre |
| `npm run video:preview -- --scenario <id>` | Ouvre Remotion Studio sur la dernière capture |
| `npm run video:test` | Tests du pipeline (Vitest, moteur TTS factice) |
| `npm run video:typecheck` | Vérification TypeScript du sous-système |

Options d'enregistrement : `--no-build` (réutilise `dist/`), `--headed` (navigateur visible),
`--network replay|refresh|offline` (voir § 5).

Sorties (jamais versionnées) dans `video/output/` :

- `<id>.mp4` — H.264, 1920 × 1080, 30 i/s, audio AAC ;
- `<id>.srt` et `<id>.vtt` — sous-titres ;
- `<id>.chapters.txt` — chapitrage à coller dans la description YouTube ;
- `<id>.report.json` — rapport de production (vérifications, ou cause de l'échec).

## 3. Architecture

```text
video/
├── config/video.config.ts      Réglages : viewport, voix, prononciation, sous-titres, réseau
├── types/video.types.ts        Types (scénario vidéo, manifestes, chronologie)
├── scenarios/                  Scénarios vidéo (versionnés)
│   ├── astror-presentation-fr.ts
│   ├── from-demo.ts            Adaptateur : réutilise une démo existante sans la modifier
│   └── index.ts                Registre
├── fixtures/network/           Réponses simulées des APIs externes (versionnées)
├── scripts/
│   ├── cli.ts                  Interface en ligne de commande
│   ├── validate.ts             Validation statique
│   ├── generate-voice.ts       Narration + cache
│   ├── tts/                    Abstraction TTS (Piper, moteur factice) + script Python
│   ├── record.ts               Capture Playwright + screencast CDP
│   ├── build-timeline.ts       Chronologie (voix × événements de capture)
│   ├── render.ts               Rendu Remotion + vérification ffprobe
│   ├── setup.sh                Installation
│   └── lib/                    Chemins, utilitaires, sous-titres, serveur local
├── compositions/               Composition Remotion (React, hors app)
├── assets/                     Logo
├── tests/                      Tests du pipeline
├── docs/AUDIT.md               Rapport d'audit initial
└── (générés, ignorés par git) .venv/ models/ cache/ audio/ recordings/ build/ output/
```

### Chaîne de production

```text
scénario.ts ──validate──► OK
     │
     ├──audio──► Piper (1 WAV par phrase) ─► durées mesurées par ffprobe ─► audio/<id>/voice.json
     │                                                                  │ holdMs[étape]
     └──record─► vite build + preview ─► Chromium 430×932 @2x ─► moteur de démo en mode capture
                    (horloge, géoloc, réseau figés)        │ événements horodatés + mire de synchro
                                                           ▼
                                  screencast CDP (JPEG) ─► ffmpeg ─► recordings/<id>/screen.mp4
                                                                     recordings/<id>/capture.json
     timeline : voix × événements ─► build/<id>/timeline.json + .srt/.vtt/.chapters.txt
     render   : Remotion (intro · téléphone + encadrés · conclusion) ─► vérifications ─► output/<id>.mp4
```

### Extension du moteur de démo (rétrocompatible)

`new DemoEngine(scenario)` se comporte exactement comme avant. Le mode capture s'active par un
second argument : `new DemoEngine(scenario, { mode: 'capture', capture: { holdMs, … }, onEvent, onFinish })`.

- **Événements typés horodatés** (`src/demo/types.ts`) : `scenario:start|end`, `step:start|end`,
  `navigation:complete`, `cursor:move`, `action:click`, `action:type`, `highlight:show|hide`,
  `narration:show|hide`, `action:error`, `sync:mark`. Émis dans les deux modes (callback + `CustomEvent`
  `astror:demo-event`).
- **Mode capture** : pas de barre de contrôle, bulle in-app masquée (la narration est reprise par la
  composition), curseur toujours animé, navigation confirmée (écran réellement monté), attente de fin
  de défilement, chaque étape tenue au moins la durée de sa voix, erreurs strictes (élément introuvable
  → arrêt + restauration + rapport), mire magenta de synchronisation au départ.
- **Activation** : uniquement si l'URL contient `?capture=1` **et** que l'outil a injecté
  `window.__ASTROR_CAPTURE__` avant le chargement. Impossible à déclencher par un utilisateur.

## 4. Écrire un scénario vidéo

Un scénario vidéo est un `Scenario` du moteur de démo, enrichi de métadonnées optionnelles :

```ts
import type { VideoScenario } from '../types/video.types'
import { DEFAULT_VIDEO } from './from-demo'

export default {
  id: 'mon-tutoriel-fr',
  video: {
    ...DEFAULT_VIDEO,                       // 1920×1080, 30 i/s, Paris, 20/11/2026 21 h 30
    title: 'Préparer sa soirée',
    intro: { title: 'Préparer sa soirée', tagline: '…', narration: 'Texte parlé de l’intro.' },
    outro: { title: '…', bullets: ['…'], links: [{ label: 'Application', url: 'https://astror.swinux.ch' }] },
  },
  scenario: {
    name: 'mon-tutoriel-fr', label: 'Préparer sa soirée',
    steps: [
      { type: 'navigate', to: 'eph', narrate: 'Le texte affiché est aussi le texte parlé.',
        video: { chapter: 'Éphémérides', transition: 'fade' } },
      { type: 'highlight', target: 'eph-moon', narrate: '…', video: { zoom: 1.3 } },
      { type: 'click', target: 'sky-filter-planet', narrate: 'Affiché', video: { narration: { text: 'Parlé, si différent' } } },
      { type: 'wait', ms: 1500 },
    ],
  },
} satisfies VideoScenario
```

Puis l'ajouter à `scenarios/index.ts`. Règles :

- **Cibles** : uniquement des `data-demo-id` présents dans `src/` (`video:validate` le vérifie).
  En ajouter un = poser un attribut inerte sur l'élément, sans changer le composant.
- **Pas de duplication** : le texte parlé est `narrate` (ou `text` d'une étape `narrate`).
  `video.narration.text` ne sert qu'à le surcharger ; `video.narration: false` rend l'étape muette.
- **Rien d'inventé** : les valeurs citées à l'oral doivent être celles qu'Astror calcule pour
  l'horloge du scénario (`video.clock`) — vérifier sur la capture.
- **Démos existantes** : `fromDemoScenario(scenario)` les transforme en vidéos sans les modifier
  (`demo-tour`, `demo-sky`, `demo-tools`, `demo-assistant` sont déjà enregistrées).
- **Autre langue** : `language: 'en'`, une voix de cette langue dans `voices` / `defaultVoice`,
  des règles de prononciation si besoin. Un tutoriel = une langue (`<sujet>-fr`, `<sujet>-en`).
- **Sans voix** : `voiceEnabled: false` → durées estimées, sous-titres conservés, MP4 sans narration.

## 5. Environnement déterministe

| Élément | Traitement |
|---|---|
| Date / heure | `page.clock.install(video.clock)` — le ciel est calculé pour cette date |
| Position | Profil de démo + géolocalisation Playwright (`video.location`) |
| Calculs astronomiques | **Réels** (astronomy-engine, satellite.js), exécutés dans le navigateur |
| Météo (open-meteo) | **Simulée** : nuit dégagée (`fixtures/network/open-meteo.json`) |
| Position instantanée de l'ISS | **Simulée** (`iss-position.json`) |
| TLE ISS / Tiangong | **Réels figés** au 15-16/11/2026 ; les passages sont calculés réellement |
| Autres requêtes (images, polices, actualités) | Cache HAR `video/cache/network/<id>.har`, créé à la 1re prise (`--network refresh` pour le renouveler, `offline` pour tout bloquer) |
| APIs d'IA (OpenRouter, Anthropic…) | **Toujours bloquées** — aucune clé, aucun appel |
| Données utilisateur | Contexte de navigateur vierge ; graine de démo ; `localStorage` restauré et vérifié en fin de prise |
| Service worker / notifications | Bloqués / refusées |

Chaque prise consigne dans `capture.json` les fixtures servies, les requêtes rejouées, bloquées ou
échouées, et le résultat de la vérification de restauration.

## 6. Synchronisation

1. La voix est générée **avant** la capture ; chaque durée est mesurée sur le fichier réel.
2. Le moteur tient chaque étape au moins `pause avant + voix + pause après` (`holdMs`) : l'image
   attend la voix, jamais l'inverse.
3. Une mire magenta est affichée au départ et repérée image par image dans `screen.mp4` ; tous les
   événements sont recalés sur elle (écart mesuré avec les horodatages CDP consigné : quelques dizaines de ms).
4. Chaque phrase est posée à `narration:show + décalage dans le segment`. Une narration sans
   événement, une voix qui déborde ou deux voix superposées **interrompent** la production.
5. Les bornes des phrases sont exactes (un WAV par phrase). Piper ne fournissant pas d'alignement
   mot à mot pour ces voix, l'illumination progressive des mots est **estimée** à l'intérieur de chaque
   phrase (`wordTiming: 'estimated'`) ; elle deviendra exacte avec un moteur qui fournit des alignements.

## 7. Garanties et vérifications

La production s'arrête avec un message explicite et un rapport (`output/<id>.report.json`,
`recordings/<id>/capture.json`, `failure.png`) si : scénario invalide, Piper ou modèle absent, échec
de synthèse, fichier audio manquant ou corrompu, voix obsolète par rapport au scénario, élément DOM
introuvable, écran non monté à temps, page plantée ou capture interrompue, étape incomplète, mire
introuvable, `localStorage` non restauré, narration manquante ou superposée.

Avant publication, le MP4 est vérifié par ffprobe/ffmpeg : codec H.264, résolution, 30 i/s, piste AAC
présente et non muette, durée égale à la chronologie (aucune séquence manquante), décodage complet
sans erreur. Sinon l'export est refusé (le fichier partiel reste en `.partial.mp4`).

## 8. Dépendances ajoutées (développement uniquement)

| Paquet | Licence | Rôle |
|---|---|---|
| `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer` 4.0.539 | Remotion License | Composition et rendu vidéo. Gratuit pour les particuliers, associations et entreprises de ≤ 3 personnes ; licence d'entreprise au-delà. Usage actuel (projet personnel open source) : gratuit. |
| `tsx` | MIT | Exécution des scripts TypeScript |
| `typescript` 5.9 | Apache-2.0 | Vérification de types |
| `@fontsource/spectral`, `ibm-plex-sans`, `ibm-plex-mono` | OFL-1.1 | Polices de l'app, embarquées hors ligne pour le rendu |
| `@types/react`, `@types/node` | MIT | Types |
| `playwright` (déjà présent) | Apache-2.0 | Pilotage de Chromium |
| `piper-tts` 1.8.0 (Python, venv) | GPL-3.0 | TTS local, exécuté comme programme externe (non lié au code MIT) |
| Voix Piper siwis / tom / alba | voir les fiches des modèles sur rhasspy/piper-voices | Modèles téléchargés, non versionnés |

## 9. Limites connues

- Viewport téléphone (430 × 932 @2x) au lieu de 1920 × 1080 : Astror est une PWA mobile portrait ;
  la capture est présentée dans une maquette de téléphone sur un canevas 16:9. Une déclinaison 9:16
  consistera surtout à changer la composition.
- Minutage mot à mot estimé (voir § 6).
- Les narrations qui citent des valeurs (phase de la Lune, planète visible…) sont liées à la date
  simulée : changer `video.clock` impose de les relire.
- Le cache HAR de la première prise dépend du réseau de ce jour-là (images, actualités) ; les données
  qui comptent pour la démonstration sont couvertes par des fixtures versionnées.
- Rendu Remotion ≈ 3 × la durée de la vidéo sur une machine modeste (`output.concurrency`).
