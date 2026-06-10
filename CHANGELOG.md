# Changelog — Astror

Toutes les modifications notables du projet sont documentées ici.

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
