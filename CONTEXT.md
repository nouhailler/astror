# Astror — Contexte de reprise

**Date de dernière mise à jour :** 2026-06-08

---

## Ce qu'est le projet

Application mobile PWA pour astronomes amateurs, entièrement en français.
Stack : **Vite + React 18 + vite-plugin-pwa** (Workbox). Données statiques (pas de backend).
Déployable sur Netlify via `netlify.toml`.

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
├── data.js             # Toutes les données statiques (exports nommés)
├── icons.jsx           # Tous les composants SVG icônes (exports nommés)
├── ui.jsx              # Composants partagés : ScreenHeader, Sheet, ChipRow, Bar, useCountdown…
├── tool-ui.jsx         # Primitives outils : ToolPage, ToolHero, ToolSection, ToolSeg, Metric…
│
├── onboarding.jsx      # Onboarding 7 étapes + onbLoad/onbSave/onbWasSeen/onbMarkSeen
├── settings.jsx        # SettingsSheet (default export) — wraps Sheet internally
├── help.jsx            # TopBar + HelpSheet + HELP_CONTENT
│
├── sky.jsx             # Onglet Ciel : carte SVG, filtres, fiche objet
├── ephemerides.jsx     # Onglet Éphémérides : Lune, météo, alertes, événements
├── explore.jsx         # Onglet Explorer : planètes, JWST, anomalies, théories
├── feed.jsx            # Onglet Veille : actualités, ajout utilisateur (localStorage)
├── assistant.jsx       # Onglet Assistant : chat avec window.claude.complete()
├── tools.jsx           # Onglet Outils : grille ToolsHub + routeur OutilsScreen
│
├── tool-observe.jsx    # Outil Observer : journal (localStorage astror_journal_v1)
├── tool-moon.jsx       # Outil Lune : suivi + carte
├── tool-planets.jsx    # Outil Planètes : éphémérides + simulateur oculaire
├── tool-events.jsx     # Outil Événements : calendrier + notifications
├── tool-astrophoto.jsx # Outil Astrophoto : calculs expo + simulateur cadrage
├── tool-satellites.jsx # Outil Satellites : ISS + missions + lancements
├── tool-education.jsx  # Outil Apprendre : quiz + parcours + contenus
├── tool-community.jsx  # Outil Communauté : fil + classement + sorties
├── tool-ai.jsx         # Outil Assistant IA : chat contextuel (onbLoad pour profil)
└── tool-extras.jsx     # Outil Explorations : ScaleExplorer + ImpactSim + Top10
```

---

## Données persistées (localStorage)

| Clé | Contenu |
|---|---|
| `astror_profile_v1` | Profil utilisateur : location, level, interests, gear, alerts |
| `astror_onboarded_v1` | Flag booléen : onboarding vu |
| `astror_veille_v1` | Entrées Veille ajoutées par l'utilisateur |
| `astror_journal_v1` | Sessions du journal d'observation |

---

## Conventions importantes

- **Pas de circular imports** : les tool pages importent depuis `./tool-ui`, jamais depuis `./tools`.
- **`SettingsSheet`** est un `export default` qui gère son propre `<Sheet>` en interne — ne pas le re-wrapper.
- **`Onboarding`** est un `export default`, les helpers (`onbLoad`, etc.) sont des exports nommés.
- **`window.openAstrorSettings`** est enregistré dans `App.jsx` via `useEffect` — c'est le seul endroit.
- **`IcWrench` et `IcPlanet`** ont été ajoutés à `icons.jsx` en fin de session (ils manquaient du prototype).
- Les apostrophes françaises dans les strings JS doivent être en **double quotes** `"..."` pour éviter les erreurs de build (ex : `"l'ISS"` pas `'l'ISS'`).
- Les `.ph` (placeholder divs) remplacent les `<image-slot>` custom elements du prototype.

---

## État actuel

- **Build** : ✅ propre (`npm run build` passe sans erreur)
- **Dev server** : ✅ fonctionnel (`npm run dev`)
- **Git** : commit initial poussé sur `main` (33 fichiers, 10 368 lignes)
- **Netlify** : prêt à connecter (le `netlify.toml` est en place)

---

## Ce qui reste à faire / améliorations possibles

1. **Données dynamiques** : remplacer les données statiques (`data.js`) par de vraies API (position réelle, météo, ISS live, etc.)
2. **Géolocalisation** : utiliser `navigator.geolocation` pour la position réelle au lieu du profil texte
3. **Assistant IA** : brancher `window.claude.complete()` sur l'API Anthropic (Claude SDK)
4. **Notifications push** : implémenter les vraies alertes pour l'ISS et les événements célestes
5. **Tests** : aucun test écrit pour l'instant
6. **Accessibilité** : revoir les contrastes et les labels ARIA
7. **Internationalisation** : tout est en français hard-codé, pas de i18n
8. **PWA icons** : seul `favicon.svg` est fourni — ajouter `icon-192.png` et `icon-512.png` pour un meilleur score Lighthouse

---

## Commandes utiles

```bash
cd /home/patrick/Documents/Claude/Projects/Astror/astror-app

npm run dev        # Serveur de développement
npm run build      # Build de production → dist/
npm run preview    # Prévisualiser le build

git status
git log --oneline
```
