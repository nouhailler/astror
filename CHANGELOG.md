# Changelog — Astror

Toutes les modifications notables du projet sont documentées ici. À partir de la version **1.1.0**,
chaque changement notable incrémente le numéro de version (`package.json`, suivi de semver) — les
entrées précédentes, non versionnées individuellement, restent groupées par date de session.

---

## [1.6.0] — 2026-11-16

### Ajouts

- **Astror Video Studio** (`video/`, outillage local, hors bundle) : génération automatique de tutoriels
  vidéo à partir des scénarios du mode démo. Validation des scénarios, narration par TTS local (Piper)
  avec cache par empreinte, capture Playwright + screencast CDP dans un environnement déterministe
  (horloge, position et réseau figés, APIs d'IA bloquées), composition Remotion (intro, maquette de
  téléphone, encadrés synchronisés, chapitres, conclusion), export MP4 H.264/AAC vérifié, sous-titres
  SRT/WebVTT et chapitrage YouTube. Commandes `npm run video:*` — voir [`video/README.md`](video/README.md).
- Premier tutoriel : `astror-presentation-fr` (« Découvrez ASTROR, votre compagnon d'observation astronomique »).
- Moteur de démo (`src/demo/`) : bus d'événements typés horodatés et **mode capture** optionnel
  (`new DemoEngine(s, { mode: 'capture' })`), activable seulement par l'outil d'enregistrement
  (`?capture=1` + injection préalable). Le mode interactif est inchangé.
- Attributs `data-demo-id` inertes sur quelques éléments (Éphémérides, Explorer, segments des outils)
  et `data-demo-loading` sur les indicateurs de chargement.
- Tests : non-régression du moteur de démo (13 tests) et tests du pipeline vidéo (`npm run video:test`).

### Corrections

- Mode démo : sous React.StrictMode (dev), le double effet pouvait lancer deux visites superposées
  (jeton de démarrage dans `startDemo`).

---

## [1.5.1] — 2026-10-29

### Ajouts

- Écran **À propos** : lien « Découvrir Astror » vers la page de présentation
  (<https://decouvrir-astror.swinux.ch/>), en tête de la section Liens.

### Corrections

- Crédits de l'écran À propos : le lien satellite.js pointait vers `shashwatak/satellite.js` (404) au lieu
  de `shashwatak/satellite-js`.

---

## [1.5.0] — 2026-10-21

### Ajouts

- **Vitrine publique** (`landing/`) : page de présentation statique d'Astror, séparée de l'application
  (aucun changement dans `src/`, `public/`, le manifeste ou le service worker). Hero, soirée type,
  fonctionnalités illustrées par des captures réelles (v1.4.0), galerie, avantages, installation par
  plateforme (mise en avant automatique de l'appareil du visiteur), FAQ, appel à l'action final.
  Prête à publier sur Cloudflare Pages — paramètres et étapes dans [`LANDING.md`](LANDING.md).
- Image de partage social 1200×630 générée à partir de captures réelles (`scripts/landing/`).

---

## [1.4.0] — 2026-09-12

### Ajouts

- **Bandeau d'annonces** sur l'écran Ciel : messages ponctuels de l'équipe (nouveauté, actualité du
  projet), affichés une seule fois par appareil puis mémorisés comme masqués (`astror_announcements_v1`).
  Contenu codé en dur dans `src/announcements.jsx` — publier une nouvelle annonce se fait par déploiement
  (commit + push), sans backend.
  - Première annonce : vidéo YouTube de présentation d'Astror.

---

## [1.3.0] — 2026-08-29

### Ajouts

- **Écran « À propos »** accessible tout en bas du menu hamburger :
  - Version installée, SHA de commit (build) et date de publication.
  - Développeur (Patrick Nouhailler), lien vers swinux.ch et le portfolio des applications.
  - Contact support (`contact@swinux.ch`) et « Signaler un bug » (issue GitHub) : les deux liens
    pré-remplissent automatiquement le message avec les informations de diagnostic (version,
    build, plateforme, langue, navigateur).
  - Liens dépôt GitHub, documentation, README, issues.
  - Crédits des bibliothèques open-source utilisées (React, Vite, vite-plugin-pwa/Workbox,
    astronomy-engine, satellite.js).
  - Logo Swinux (réduit à 128×128, 15 Ko contre 830 Ko à l'origine).
- SHA de commit court injecté au build (`__GIT_SHA__`, `vite.config.js`) pour identifier
  précisément la version installée.

---

## [1.2.1] — 2026-08-29

### Ajouts

- Lien **« Documentation »** ajouté dans le menu hamburger (catégorie Réglages, à côté de
  Paramètres), ouvrant le site documentaire dans un nouvel onglet.

---

## [1.2.0] — 2026-08-29

### Ajouts

- **Menu hamburger** (☰, en haut à gauche de chaque écran) listant toutes les fonctionnalités
  de l'app classées en 8 catégories (Ciel & pointage, Éphémérides, Explorer le cosmos,
  Astrophotographie, Veille spatiale, Apprendre & communauté, Assistant IA, Réglages) — 24
  destinations au total. Chaque entrée navigue directement vers l'écran, le sous-onglet
  (Explorer/Veille) ou l'outil correspondant, ou ouvre les Paramètres.
- `ExploreScreen` et `FeedScreen` acceptent désormais un deep-link (`deepLink`/
  `onDeepLinkConsumed`, même mécanisme que `OutilsScreen`) pour ouvrir directement un
  sous-onglet précis (ex. Conquête spatiale, Bibliothèque) depuis l'extérieur du composant.

---

## [1.1.0] — 2026-08-29

### Corrections

- **Outil Lune** : la phase, l'illumination, l'âge, la distance et le diamètre apparent étaient des
  constantes codées en dur ; ils sont désormais calculés en direct via `astronomy-engine`
  (`getMoonData`). Le calendrier des phases affiche les 4 prochains quartiers réels
  (`getUpcomingMoonPhases`) au lieu de dates figées.
- **Outil Planètes** : magnitude, taille apparente, phase et visibilité étaient des tableaux
  statiques valables jusqu'à janvier 2027 ; ils sont désormais calculés en direct
  (`getPlanetObservationData`). La liste « Oppositions & élongations » (anciennement
  « Conjonctions & oppositions ») provient d'un calcul réel des prochaines oppositions et plus
  grandes élongations (`getPlanetEvents`) — les conjonctions planète-planète, non calculées, ont
  été retirées du libellé plutôt que laissées inexactes.
- **Onboarding rejoué** (« Revoir l'introduction » dans Paramètres) repartait toujours des valeurs
  par défaut au lieu du profil actuel. `App.jsx` transmet maintenant `initial={profile}`.

### Ajouts

- Bouton **« Effacer »** pour retirer isolément une clé API déjà enregistrée (OpenRouter,
  Anthropic, Google Books), sans devoir vider les données du navigateur.
- Numéro de version affiché dans Paramètres désormais lu directement depuis `package.json`
  (`__APP_VERSION__`, injecté au build par `vite.config.js`) — il ne peut plus se désynchroniser.
- Site de documentation complet publié sur [GitHub Pages](https://nouhailler.github.io/astror/)
  (voir `docs/`), avec lien « 📚 Documentation » dans Paramètres.

---

## [Actuel] — 2026-06-10 (session 3)

### Conquête spatiale — Annexes interactives

- **Chronologie, Glossaire et Missions cliquables** : chaque entrée est un bouton avec indicateur `›`
- **WikiSummarySheet** : composant portal (createPortal → `#root`) qui charge `fr.wikipedia.org/api/rest_v1/page/summary/{titre}`, affiche thumbnail + titre + description + extrait + panel IA + lien article complet. Fallback automatique vers l'API anglaise si la page FR est absente
- `wikiPage` ajouté sur les 34 entrées de la chronologie, 16 termes du glossaire, 15 missions
- **Fix photos** : `ConquestWikiImg` utilise désormais l'API Wikimedia thumbnail (480 px via `iiprop=thumburl&iiurlwidth=480`) au lieu des URLs pleine taille — résout les erreurs de chargement sur mobile
- **Fix positionnement** : WikiSummarySheet rendu via `createPortal` dans `#root` pour contourner le containing block CSS créé par l'animation `transform` de `.enter`

---

## 2026-06-10 (session 2) — Conquête spatiale

### Onglet Conquête spatiale (Explorer)

- Nouvel onglet **Conquête spatiale** dans l'onglet Explorer (à côté de James Webb)
- Article complet "De Spoutnik à Mars — histoire, enjeux et futur de la conquête spatiale"
- **10 chapitres + Conclusion** : Introduction, Course aux étoiles, Ère de Gagarine, Conquête lunaire, Stations orbitales, Exploration planétaire, Ère commerciale, Défis futurs, Conclusion
- Chaque chapitre : photo héro Wikimedia, sections avec image + texte + panel IA
- **Annexes** en sous-onglets : Chronologie (34 dates), Glossaire (16 termes), Missions (15), Biographies (8 pionniers)
- Fix URLs Wikimedia : remplacement de toutes les URLs `/thumb/` (HTTP 400) par des URLs directes confirmées
- Fix hashs incorrects (Earthrise `a/a4` → `a/a8`, Goddard `7/74` → `7/7c`)
- Remplacement des images introuvables (Laïka, SpaceX Starship IFT-2, Space_debris.jpg) par des alternatives confirmées

---

## 2026-06-10 (session 1) — Quiz & Enrichissements

### Quiz & Apprentissage

- Pool de questions étendu de 20 à **40 questions**, chacune taguée avec une catégorie
- 6 catégories : Système solaire, Astrophysique, Observation, Instruments, Cosmologie, Histoire
- **Chips de filtre par catégorie** — redémarre une session ciblée instantanément
- **Joker 50/50** — élimine 2 mauvaises réponses, une utilisation par session
- **Mode Chrono** — barre de 15 s verte→or→rouge, +5 XP bonus si réponse rapide
- Badge catégorie coloré sur chaque question
- Réponse affichée si le temps s'écoule

---

## 2026-06-09 (session 2) — Éducation, Veille, Communauté

### Éducation

- **Glossaire astronomique** : 47 termes triés A–Z, barre de recherche full-text
- **Défi du jour interactif** : bouton « Marquer comme fait », persisté jusqu'au lendemain
- **Score XP global** (`astror_xp_v1`) : +10 XP/bonne réponse quiz, +pts défi du jour
- Streak, record et XP total affichés en pills dans le header du tab
- APOD NASA (`fetchAPODArticle`) injecté en tête de l'onglet Contenus avec photo du jour
- Parcours pédagogiques avec persistance (`astror_parcours_v1`) et avancement via quiz

### Veille — Contenus enrichis

- Conférences : images Wikipedia en fond de poster, bouton ↻ Images, city fallback
- Bibliothèque : couvertures réelles (Open Library / Google Books), bouton ↻ Couvertures
- Personnalités : photo Wikipedia sur chaque carte et dans la fiche détail
- Liens articles, URLs de conférences, combobox de recherche
- Aperçus photos des sites (APOD, Hubble, JWST, ESO, Astrobin)

---

## 2026-06-09 (session 1) — Connexion aux données dynamiques

### Calculs astronomiques locaux

- `astro.js` : lune, soleil, planètes via `astronomy-engine` (sans API)
- Éphémérides : événements célestes calculés dynamiquement
- Astrophoto : planning calculé depuis la position et la date
- Observer : conditions, lever/coucher, créneaux d'observation

### APIs externes

- **ISS live** (wheretheiss.at, rafraîchissement 10 s) via hook `useLiveData`
- **Météo** open-meteo (aucune clé requise)
- **Actualités** spatiales (spaceflightnewsapi.net)
- **Lancements** (lldev.thespacedevs.com)
- **Passages ISS** prédits dynamiquement via satellite.js + TLE en direct

### IA & Assistant

- `claudeApi.js` : wrapper OpenRouter, clé dans `astror_api_key_v1`
- Sélecteur de modèles gratuits OpenRouter
- `AiInfoPanel` partagé (`ui.jsx`), déployé sur 6 écrans
- Analyses IA persistées en localStorage avec bouton ↻
- Alertes settings cliquables avec explication IA contextuelle

### Satellites

- Barre localisation/date dans l'outil Satellites
- Panel IA pour Tiangong, Starlink, Hubble

### Boussole AR (Ciel)

- Détection `deviceorientation` compatible Android Galaxy A13
- Panneau de diagnostic capteur (debug)

### Explorateur

- Visibilité des planètes en temps réel
- Images JWST depuis Wikimedia Commons
- Liens Wikipedia sur chaque objet

### Observer

- Barre localisation/date déplacée au-dessus des onglets
- Qualité météo intégrée dans les scores « Meilleurs créneaux »

---

## 2026-06-08 — Initialisation du projet

- Build initial : Astror PWA — Vite + React 18 (33 fichiers, ~10 000 lignes)
- 6 onglets : Ciel, Éphémérides, Explorer, Veille, Assistant, Outils
- 9 outils spécialisés
- Onboarding 7 étapes
- Design system complet (CSS custom properties)
- PWA icons 192 + 512 px générés depuis favicon.svg
- 21 tests Vitest
- `netlify.toml` pour déploiement Netlify
- `CONTEXT.md` pour reprise de session
