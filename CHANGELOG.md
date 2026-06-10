# Changelog — Astror

Toutes les modifications notables du projet sont documentées ici.

---

## [Actuel] — 2026-06-10

### Quiz & Apprentissage
- Pool de questions étendu de 20 à **40 questions**, chacune taguée avec une catégorie
- 6 catégories : Système solaire, Astrophysique, Observation, Instruments, Cosmologie, Histoire
- **Chips de filtre par catégorie** — redémarre une session ciblée instantanément
- **Joker 50/50** — élimine 2 mauvaises réponses, une utilisation par session
- **Mode Chrono** — barre de 15 s verte→or→rouge, +5 XP bonus si réponse rapide
- Badge catégorie coloré sur chaque question
- Réponse affichée si le temps s'écoule

### Éducation (session précédente — 2026-06-09)
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

## 2026-06-09 — Connexion aux données dynamiques

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
