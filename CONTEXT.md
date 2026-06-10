# Astror — Contexte de reprise

**Date de dernière mise à jour :** 2026-06-10

---

## Ce qu'est le projet

Application mobile PWA pour astronomes amateurs, entièrement en français.
Stack : **Vite + React 18 + vite-plugin-pwa** (Workbox). Déployable sur Netlify via `netlify.toml`.

---

## Dépôt & déploiement

| Élément | Valeur |
|---|---|
| GitHub | https://github.com/nouhailler/astror |
| Répertoire source | `/home/patrick/Documents/Claude/Projects/Astror/astror-app/` |
| Prototype de référence | `/home/patrick/Documents/Claude/Projects/Astror/design_handoff_astror/prototype/` |
| Build | `npm run build` → `dist/` |
| Dev local | `npm run dev` → http://localhost:5173 |
| Netlify | Connecter le repo GitHub, détecte `netlify.toml` automatiquement |

---

## Architecture des fichiers source (`src/`)

```
src/
├── main.jsx            # Point d'entrée ReactDOM
├── App.jsx             # Shell : TabBar 6 onglets, onboarding gate, TopBar, HelpSheet, SettingsSheet
├── app.css             # Design system complet (CSS custom properties, layout, composants)
├── data.js             # Données statiques résiduelles (exports nommés)
├── icons.jsx           # Tous les composants SVG icônes (exports nommés)
├── ui.jsx              # Composants partagés : ScreenHeader, Sheet, ChipRow, Bar, AiInfoPanel, useCountdown…
├── tool-ui.jsx         # Primitives outils : ToolPage, ToolHero, ToolSection, ToolSeg, Metric…
│
├── api.js              # Toutes les API externes + hook useLiveData :
│                       #   ISS (wheretheiss.at, 10 s), météo (open-meteo), news (spaceflightnewsapi),
│                       #   lancements (lldev.thespacedevs), APOD (NASA DEMO_KEY),
│                       #   images Wikipedia/Wikimedia, couvertures livres, passages ISS (satellite.js + TLE)
├── astro.js            # Calculs locaux via astronomy-engine : lune, soleil, planètes, événements
├── claudeApi.js        # Wrapper OpenRouter — clé dans localStorage astror_api_key_v1
├── notifications.js    # Web Notifications API
│
├── onboarding.jsx      # Onboarding 7 étapes + onbLoad/onbSave/onbWasSeen/onbMarkSeen
├── settings.jsx        # SettingsSheet (default export) — wraps Sheet internally
├── help.jsx            # TopBar + HelpSheet + HELP_CONTENT
│
├── sky.jsx             # Onglet Ciel : carte SVG, boussole AR (deviceorientation), filtres, fiche objet
├── ephemerides.jsx     # Onglet Éphémérides : Lune, météo dynamique, alertes, événements calculés
├── explore.jsx         # Onglet Explorer : visibilité planètes live, images JWST Wikimedia, liens Wikipedia
├── feed.jsx            # Onglet Veille : actualités, conférences (images Wikipedia), livres (couvertures),
│                       #                 personnalités (photos Wikipedia), ajout utilisateur (localStorage)
├── assistant.jsx       # Onglet Assistant : chat OpenRouter
├── tools.jsx           # Onglet Outils : grille ToolsHub + routeur OutilsScreen
│
├── tool-observe.jsx    # Outil Observer : journal (localStorage) + créneaux dynamiques + météo
├── tool-moon.jsx       # Outil Lune : phase + carte lunaire
├── tool-planets.jsx    # Outil Planètes : éphémérides astronomy-engine + simulateur oculaire
├── tool-events.jsx     # Outil Événements : calendrier calculé + notifications
├── tool-astrophoto.jsx # Outil Astrophoto : calculs expo dynamiques + simulateur cadrage + planning
├── tool-satellites.jsx # Outil Satellites : ISS live, passages satellite.js + TLE, IA panel
├── tool-education.jsx  # Outil Apprendre : quiz (40 q., catégories, chrono, joker 50/50),
│                       #                   défi du jour, XP global, parcours, APOD, glossaire 47 termes
├── tool-community.jsx  # Outil Communauté : fil + classement + sorties
├── tool-ai.jsx         # Outil Assistant IA : chat contextuel (profil via onbLoad)
└── tool-extras.jsx     # Outil Explorations : ScaleExplorer + ImpactSim + Top10
```

---

## Données persistées (localStorage)

| Clé | Contenu |
|---|---|
| `astror_profile_v1` | Profil : `{ city, lat, lng }`, niveau, intérêts, matériel, alertes |
| `astror_onboarded_v1` | Flag booléen : onboarding vu |
| `astror_journal_v1` | Sessions du journal d'observation |
| `astror_veille_v1` | Entrées Veille ajoutées par l'utilisateur |
| `astror_quiz_v1` | Stats quiz : streak, bestScore, totalPlayed, lastDate |
| `astror_xp_v1` | XP total accumulé + date du dernier défi complété |
| `astror_parcours_v1` | Progression (%) par parcours pédagogique |
| `astror_api_key_v1` | Clé OpenRouter (séparée du profil) |
| `astror_conf_imgs_v1` | Cache images Wikipedia des conférences |
| `astror_book_covers_v1` | Cache couvertures livres (Open Library / Google Books) |

---

## Conventions importantes

- **Pas de circular imports** : les tool pages importent depuis `./tool-ui`, jamais depuis `./tools`.
- **`SettingsSheet`** est un `export default` qui gère son propre `<Sheet>` en interne — ne pas le re-wrapper.
- **`Onboarding`** est un `export default`, les helpers (`onbLoad`, etc.) sont des exports nommés.
- **`window.openAstrorSettings`** est enregistré dans `App.jsx` via `useEffect` — c'est le seul endroit.
- **`profile.location`** est un objet `{ city, lat, lng }` (migration automatique dans `onbLoad()`).
- Les apostrophes françaises dans les strings JS doivent être en **double quotes** `"..."` pour éviter les erreurs de build.
- Les `.ph` (placeholder divs) remplacent les `<image-slot>` custom elements du prototype.
- **`useLiveData(fetchFn)`** dans `api.js` : hook universel pour les appels API avec cache et rafraîchissement.

---

## État actuel

- **Build** : ✅ propre (`npm run build` passe sans erreur)
- **Dev server** : ✅ fonctionnel (`npm run dev`)
- **Tests** : ✅ 21 tests Vitest (`npm test`)
- **Git** : 36 commits — branche `main` à jour sur GitHub
- **Netlify** : prêt à connecter (le `netlify.toml` est en place)

---

## Ce qui reste à faire / améliorations possibles

1. **Parcours pédagogiques** : les cartes avancent via le quiz, mais il n'y a pas de vrai contenu de leçon à l'intérieur (cliquer un parcours ne fait rien)
2. **Communauté** : données entièrement statiques (pas de backend/API communautaire)
3. **Tests** : couverture à étendre (21 tests surtout sur les calculs astro)
4. **PWA offline** : certains appels API échouent silencieusement hors-ligne
5. **i18n** : tout est en français hard-codé
6. **Notifications push** : les notifications locales fonctionnent, les push web nécessiteraient un backend

---

## Commandes utiles

```bash
cd /home/patrick/Documents/Claude/Projects/Astror/astror-app

npm run dev        # Serveur de développement
npm run build      # Build de production → dist/
npm run preview    # Prévisualiser le build
npm test           # Tests Vitest

git log --oneline  # Historique des commits
```
