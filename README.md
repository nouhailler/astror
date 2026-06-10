# Astror

Application mobile PWA pour astronomes amateurs, entièrement en français.

## Stack technique

| Élément | Valeur |
|---|---|
| Framework | React 18 + Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Calculs astronomiques | astronomy-engine (local, sans API) |
| Prédictions satellites | satellite.js + TLE en direct |
| Déploiement | Netlify (détecte `netlify.toml` automatiquement) |
| Tests | Vitest (21 tests) |

## Liens

| | |
|---|---|
| GitHub | https://github.com/nouhailler/astror |
| Dev local | `npm run dev` → http://localhost:5173 |

## Lancer le projet

```bash
npm install
npm run dev       # Serveur de développement
npm run build     # Build de production → dist/
npm run test      # Tests Vitest
npm run preview   # Prévisualiser le build
```

## Structure des onglets

| Onglet | Fichier | Description |
|---|---|---|
| Ciel | `sky.jsx` | Carte SVG du ciel, boussole AR, filtres, fiche objet |
| Éphémérides | `ephemerides.jsx` | Lune, météo open-meteo, alertes, événements astronomiques |
| Explorer | `explore.jsx` | Planètes, images JWST, anomalies, théories |
| Veille | `feed.jsx` | Actualités spatiales, conférences, livres, personnalités |
| Assistant | `assistant.jsx` | Chat IA contextuel (OpenRouter) |
| Outils | `tools.jsx` | 9 outils spécialisés (voir ci-dessous) |

## Outils

| Outil | Fichier | Description |
|---|---|---|
| Observer | `tool-observe.jsx` | Journal d'observation + créneaux dynamiques |
| Lune | `tool-moon.jsx` | Suivi phase + carte lunaire |
| Planètes | `tool-planets.jsx` | Éphémérides + simulateur oculaire |
| Événements | `tool-events.jsx` | Calendrier céleste + notifications |
| Astrophoto | `tool-astrophoto.jsx` | Calculs exposition + simulateur cadrage |
| Satellites | `tool-satellites.jsx` | ISS live, passages prédits (satellite.js + TLE), Tiangong, Hubble |
| Apprendre | `tool-education.jsx` | Quiz 40 questions + catégories + chrono + joker, glossaire 47 termes, parcours |
| Communauté | `tool-community.jsx` | Fil + classement + sorties |
| Assistant IA | `tool-ai.jsx` | Chat contextuel avec profil utilisateur |
| Explorations | `tool-extras.jsx` | ScaleExplorer + ImpactSim + Top10 |

## APIs utilisées

| Service | Usage | Clé requise |
|---|---|---|
| open-meteo.com | Météo locale (aucune clé) | Non |
| wheretheiss.at | Position ISS live | Non |
| lldev.thespacedevs.com | Prochains lancements | Non |
| spaceflightnewsapi.net | Actualités spatiales | Non |
| api.nasa.gov | APOD (DEMO_KEY suffisante) | Non |
| Wikimedia Commons | Images JWST, personnalités, conférences | Non |
| OpenLibrary / Google Books | Couvertures de livres | Non |
| OpenRouter | IA assistant (modèles gratuits) | Oui — dans les paramètres |

## localStorage

| Clé | Contenu |
|---|---|
| `astror_profile_v1` | Profil : `{ city, lat, lng }`, niveau, intérêts, matériel, alertes |
| `astror_onboarded_v1` | Flag onboarding vu |
| `astror_journal_v1` | Sessions du journal d'observation |
| `astror_veille_v1` | Entrées Veille ajoutées par l'utilisateur |
| `astror_quiz_v1` | Stats quiz : streak, record, total joués |
| `astror_xp_v1` | XP total + date dernier défi complété |
| `astror_parcours_v1` | Progression par parcours pédagogique |
| `astror_api_key_v1` | Clé OpenRouter (séparée du profil) |
| `astror_conf_imgs_v1` | Cache images Wikipedia des conférences |
| `astror_book_covers_v1` | Cache couvertures livres |

## Conventions

- Pas de circular imports : les tool pages importent depuis `./tool-ui`, jamais depuis `./tools`.
- `SettingsSheet` est un `export default` qui gère son propre `<Sheet>` en interne.
- `window.openAstrorSettings` est enregistré dans `App.jsx` via `useEffect`.
- Les apostrophes françaises dans les strings JS doivent être en double quotes `"..."`.
- `profile.location` est un objet `{ city, lat, lng }` (migration auto dans `onbLoad()`).
