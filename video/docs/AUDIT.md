# Astror Video Studio — Rapport d'audit (phase 0)

Date : 2026-11-16 · Branche : `feature/video-studio` · Base : v1.5.1 (`10e2f1e`)

## 1. Ce qui existe

| Fichier | Rôle |
|---|---|
| `src/demo/types.ts` | Types déclaratifs : `TabKey`, `ToolKey`, 6 types d'étapes (`navigate`, `click`, `type`, `wait`, `highlight`, `narrate`), `Scenario { name, label, description?, steps }`. Aucune logique. |
| `src/demo/engine.ts` | `DemoEngine` en DOM pur : overlay (bouclier, curseur SVG, surbrillance, bulle de narration, barre play/pause/suivant/vitesse/quitter), boucle `run()` séquentielle, `sleep()` interruptible. |
| `src/demo/bridge.ts` | Pont React ↔ moteur : `registerDemoHost({ navigate, getTab, openSettings })`, `prefersReducedMotion()`. |
| `src/demo/seed.ts` | Isolation des données : `snapshotStore()` (toutes les clés `astror_`), `applySeed()` (onboarding vu + profil Paris), `restoreStore()`. |
| `src/demo/index.ts` | API publique : `startDemo`, `stopDemo`, `getScenarioList`, `getDemoParam` (`?demo=<nom>`). Le moteur est importé à la demande (`import('./engine')`). |
| `src/demo/scenarios/` | 4 scénarios : `tour`, `sky`, `tools`, `assistant`. |
| `src/App.jsx` | Enregistre l'hôte démo (setTab / setToolDeepLink), démarre `?demo=`, contourne l'onboarding si `?demo=`. |

## 2. Réponses aux dix questions

1. **Déclaration des scénarios** — objets `Scenario` exportés par défaut dans `src/demo/scenarios/*.ts`, enregistrés dans `scenarios/index.ts` (`SCENARIOS`, `SCENARIO_ORDER`).
2. **Exécution des étapes** — `run()` boucle sur `steps`, `exec()` par type, puis respiration fixe de 850 ms (× vitesse). Les erreurs d'étape sont avalées (`catch {}`) : « étape résiliente ».
3. **Navigation** — `getDemoHost().navigate({ tab, tool })` → `setTab()` / `setToolDeepLink()` dans App ; puis **attente fixe de 700 ms** pour laisser monter l'écran lazy. Aucune confirmation de montage.
4. **Ciblage** — `document.querySelector('[data-demo-id="…"]')` ; `waitForEl()` sonde toutes les 120 ms jusqu'à 4,5 s, exige `offsetParent !== null`, puis `scrollIntoView` + 220 ms. Ids existants : `tab-*`, `tool-*`, `nav-menu`, `settings-btn`, `sky-compass`, `sky-time`, `sky-list-first`, `sky-filter-*`, `ai-suggestions`, `ai-input`.
5. **Surbrillance** — div `.demo-highlight` positionnée en `fixed` sur le `getBoundingClientRect()` (+6 px), étiquette optionnelle, repositionnée au scroll/resize.
6. **Curseur virtuel** — div `.demo-cursor` déplacée par `transform` avec transition CSS de 560 ms ; clic = classe `press` + `.demo-ripple` + `pointerdown/mousedown/mouseup/click` dispatchés sur l'élément.
7. **Données** — snapshot/seed/restore du localStorage (`astror_*`) ; restauration à `stop()` (Échap, ✕, ou `startDemo` suivant).
8. **Lancement** — `?demo=<nom>`, feuille Réglages (`onStartDemo`), `startDemo(name)`.
9. **Erreurs et délais** — tout est temporisé (`setTimeout`) ; un élément introuvable fait silencieusement « sauter » l'action ; aucune remontée d'erreur.
10. **Préserver l'existant** — garder `DemoEngine(scenario)` + `start()/stop()` à l'identique ; toute extension doit être optionnelle (second argument du constructeur).

## 3. Limites pour une capture déterministe

| Limite | Conséquence vidéo | Réponse retenue |
|---|---|---|
| Pas d'événements : impossible de savoir quand une étape commence, quand le clic a lieu… | Pas de synchronisation voix/image | Bus d'événements typés horodatés (`scenario:*`, `step:*`, `navigation:complete`, `cursor:move`, `action:click`, `highlight:*`, `narration:*`, `action:error`, `sync:mark`). |
| Durées fixes (`readingTime` ≈ 48 ms/caractère) | La voix serait coupée ou suivie d'un blanc | Mode capture : chaque étape narrée est **tenue au moins aussi longtemps que l'audio réellement généré** (durée mesurée par ffprobe). |
| Erreurs avalées | Vidéo incomplète silencieuse | Mode capture strict : élément introuvable / navigation non confirmée → `action:error` + arrêt du scénario + rapport. |
| Navigation = attente aveugle de 700 ms | Écran pas encore monté sur machine lente | En capture : attente active (Suspense terminé, plus de `ScreenLoader`) avec délai max. |
| Barre de contrôle et bulle visibles | Parasites à l'image | Mode capture : barre masquée ; bulle désactivable (la narration est reprise proprement dans la composition). |
| `prefers-reduced-motion` coupe le curseur animé | Démonstration moins lisible | Mode capture : animations du curseur forcées. |
| Scroll `smooth` de durée variable | Surbrillance posée avant la fin du scroll | En capture : attente de stabilisation du rectangle cible. |
| `StrictMode` (dev) : l'effet `?demo=` s'exécute deux fois et `startDemo` est asynchrone → deux moteurs possibles en dev | Bug latent (dev uniquement) | Jeton de démarrage dans `startDemo` (correctif minimal). La capture utilise le build de production (`vite preview`). |
| App mobile portrait plein écran (pas de `max-width`) | Un viewport 1920 × 1080 étirerait l'interface mobile | **Écart assumé** : capture en viewport téléphone 430 × 932 @2× (860 × 1864 px réels), composée dans une maquette de téléphone sur un canevas 1920 × 1080. Bonus : le passage au 9:16 devient trivial. |
| Enregistrement vidéo natif Playwright = 1× CSS, VP8 ≈ 0,9 Mbit/s, 25 i/s (vérifié) | Image floue | Capture par **screencast CDP** (JPEG haute qualité à la résolution physique, horodaté), puis normalisation ffmpeg en 30 i/s constants. |
| APIs externes (open-meteo, wheretheiss, celestrak, APOD, Wikimedia, Google Fonts…) | Rendu dépendant du réseau du jour | Fixtures JSON pour les APIs de données + cache réseau HAR rejoué pour le reste ; requêtes non couvertes bloquées et listées dans le rapport. |
| Heure réelle (`new Date()`) | Ciel différent à chaque prise | Horloge simulée Playwright (`page.clock.install`), date fixée par scénario. Les calculs astronomiques restent ceux d'`astronomy-engine`. |

## 4. Service worker / PWA

`main.jsx` appelle `initPwaUpdate()` (`virtual:pwa-register`, `registerType: autoUpdate`, rechargement automatique sur nouvelle version). En capture, le contexte Playwright bloque les service workers (`serviceWorkers: 'block'`) : pas de rechargement intempestif ni de cache périmé.

## 5. Tests existants

`vitest` (jsdom) : 5 fichiers, 39 tests (api, astro, constellations, notifications, onboarding). **Aucun test du moteur de démo** : des tests de non-régression seront écrits avant toute modification.

## 6. Plan

Sous-système `video/` (outillage local uniquement, jamais importé par `src/`), extension rétrocompatible du moteur (option `mode: 'capture'`), TTS local (Piper) avec cache par empreinte, enregistrement Playwright + CDP, composition Remotion, export MP4/SRT/VTT, CLI `npm run video:*`.
