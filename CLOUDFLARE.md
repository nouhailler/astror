# Déploiement d'Astror sur Cloudflare Pages

L'application (`astror.swinux.ch`) passe de Netlify à **Cloudflare Pages**. La vitrine
(`decouvrir-astror.swinux.ch`, projet Pages `astrorlanding`, voir [LANDING.md](LANDING.md)) y est déjà ;
la documentation reste sur GitHub Pages.

## Ce qui est prêt dans le dépôt

| Fichier | Rôle |
|---|---|
| [`public/_headers`](public/_headers) | En-têtes HTTP (copié dans `dist/`). `Permissions-Policy` pour la boussole (reprise de `netlify.toml`), `nosniff`, `Referrer-Policy`, `no-cache` sur `index.html` / `sw.js` / manifeste (mises à jour PWA immédiates), cache d'un an sur les fichiers avec empreinte (`/assets/*`, `workbox-*.js`) |
| [`.node-version`](.node-version) | Node 22 pour le build Cloudflare |
| [`vite.config.js`](vite.config.js) | SHA du commit affiché dans l'app (Paramètres, À propos) lu dans `CF_PAGES_COMMIT_SHA` |

Pas de `_redirects` : sans `404.html` à la racine, Cloudflare Pages renvoie `index.html` pour toute
route inconnue (comportement « single-page application »), ce qui remplace la règle `/* → /index.html`
de Netlify. Une règle `/* /index.html 200` serait d'ailleurs ignorée par Pages (boucle potentielle).

Vérifié localement : build depuis un clone propre (`npm ci` + `npm run build`), puis `dist/` servi par
l'émulateur Cloudflare (`npx wrangler pages dev dist`) — en-têtes appliqués, repli SPA fonctionnel.

## 1. Créer le projet Pages

Tableau de bord Cloudflare → **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git** →
autoriser l'application GitHub de Cloudflare sur le dépôt `nouhailler/astror` (privé : l'accès est
donné dépôt par dépôt) → sélectionner `astror`.

| Paramètre | Valeur |
|---|---|
| Project name | `astror` (adresse provisoire : `astror.pages.dev`) |
| Production branch | `main` |
| Framework preset | `None` (ou `Vite` : mêmes valeurs) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(vide — racine du dépôt)* |
| Variables d'environnement | aucune (Node 22 est fixé par `.node-version`) |

Ne pas définir `Root directory` sur `landing` : c'est le réglage de la vitrine, pas de l'application.

Le premier build installe toutes les dépendances de développement, y compris l'outillage vidéo
(`video-studio`, Remotion, Playwright, environ 470 Mo) : il est plus long que les suivants, qui profitent
du cache. Facultatif : **Settings → Builds → Build watch paths**, exclure `video/*`, `docs/*`,
`landing/*` pour ne pas reconstruire l'application quand seuls ces dossiers changent.

## 2. Vérifier sur `astror.pages.dev`

Avant de toucher au domaine :

- l'application s'ouvre, les six onglets fonctionnent ;
- **Paramètres → À propos** : la version (`1.6.2` ou plus) et le SHA du dernier commit s'affichent ;
- en-têtes (outils de développement → Réseau, ou `curl -I https://astror.pages.dev/sw.js`) :
  `Cache-Control: no-cache` sur `/` et `/sw.js`, `Permissions-Policy` présent ;
- une adresse inventée (`https://astror.pages.dev/test`) affiche l'application, pas une erreur.

Chaque branche poussée obtient aussi un aperçu (`<branche>.astror.pages.dev`).

## 3. Basculer le domaine `astror.swinux.ch`

1. Projet Pages `astror` → **Custom domains** → **Set up a custom domain** → `astror.swinux.ch`.
2. Cloudflare indique l'enregistrement DNS à créer. Chez l'hébergeur DNS de `swinux.ch` (le même que
   pour `decouvrir-astror`) : remplacer l'enregistrement actuel d'`astror` (qui pointe vers Netlify) par
   `CNAME astror → astror.pages.dev`.
3. Attendre que Cloudflare affiche le domaine **Active** (certificat HTTPS émis automatiquement).
4. Vérifier `https://astror.swinux.ch` comme à l'étape 2.

L'origine ne change pas (`https://astror.swinux.ch`) : les utilisateurs gardent leurs données
(`localStorage`) et leur application installée. Leur service worker détecte la nouvelle version à la
prochaine vérification (au lancement, puis toutes les heures) et se met à jour seul.

## 4. Désactiver Netlify

Une fois `astror.swinux.ch` servi par Cloudflare (réponse avec l'en-tête `server: cloudflare`) :

- Netlify → site Astror → retirer le domaine personnalisé, puis **Build & deploy → Stop builds**
  (ou supprimer le site) ;
- le fichier `netlify.toml` est conservé pour l'instant (retour arrière possible) ; il pourra être
  supprimé quand la migration sera jugée définitive.

**Retour arrière** : remettre l'ancien enregistrement DNS d'`astror` vers Netlify et réactiver les builds.

## Déploiements suivants

Chaque `git push` sur `main` déclenche un build et un déploiement de production ; l'historique et le
retour à une version précédente (« Rollback ») sont dans l'onglet **Deployments** du projet.
