# Vitrine Astror (`landing/`)

Page de présentation publique d'Astror, **séparée de l'application** : HTML + CSS + quelques lignes de
JavaScript, sans dépendance ni étape de build. Elle renvoie vers l'application en ligne
(<https://astror.swinux.ch/>) sans jamais la remplacer.

## Pourquoi un site séparé

- L'application (Vite + vite-plugin-pwa) est hébergée sur **Netlify** (`netlify.toml`) et la
  documentation sur GitHub Pages (`docs/`). Ni l'une ni l'autre n'est modifiée par la vitrine.
- `landing/` est hors de `public/` : rien n'est copié dans `dist/` ni précaché par le service worker
  de l'application (`dist/sw.js` identique avant/après).
- La vitrine n'a **ni manifeste ni service worker** : aucun risque de mise en cache inadaptée, et pas de
  confusion d'installation avec la PWA.
- Un navigateur n'autorise l'installation d'une PWA que depuis son propre site : la vitrine n'affiche
  donc pas de bouton « Installer » (`beforeinstallprompt` ne peut pas concerner l'application depuis une
  autre origine), mais des instructions par plateforme, avec mise en avant automatique de l'appareil du
  visiteur.

## Contenu

| Fichier | Rôle |
|---|---|
| `landing/index.html` | Page unique (sections : hero, soirée type, fonctionnalités, aperçu, pourquoi, appareils/installation, FAQ, appel final, pied de page) |
| `landing/styles.css` | Styles (palette et typographies reprises de `src/app.css`) |
| `landing/main.js` | Menu mobile + mise en avant de la plateforme dans la section Installer |
| `landing/assets/screens/*.webp` | Captures **réelles** de l'application v1.4.0 (390×844 @2x, réduites à 600 px de large) |
| `landing/assets/og-image.jpg` | Image de partage social 1200×630 |
| `landing/_headers` | En-têtes HTTP Cloudflare Pages (sécurité, cache des images) |
| `landing/404.html`, `landing/robots.txt` | Page d'erreur et règles d'indexation |
| `scripts/landing/og-image.html`, `build-og.mjs` | Source et générateur de l'image de partage |

Prévisualiser localement :

```bash
python3 -m http.server 8090 --directory landing
```

Régénérer l'image de partage (après modification des captures) :

```bash
CHROMIUM_PATH=/usr/bin/chromium node scripts/landing/build-og.mjs
```

### Mettre à jour les captures

Les captures sont prises sur le build de production (`npm run build && npm run preview`) avec Playwright,
viewport 390×844, `deviceScaleFactor: 2`, profil pré-rempli (onboarding vu, astuces et annonces masquées),
puis converties : `cwebp -q 78 -resize 600 0 capture.png -o landing/assets/screens/<nom>.webp`.
Penser à mettre à jour la mention de version dans la section « Aperçu » et dans le pied de page.

## Déploiement Cloudflare Pages

Aucun `wrangler.toml` n'est nécessaire.

**Option A — projet relié au dépôt Git** (tableau de bord Cloudflare → Workers & Pages → Create → Pages →
Connect to Git) :

| Paramètre | Valeur |
|---|---|
| Production branch | `main` |
| Framework preset | `None` |
| Root directory (advanced) | `landing` |
| Build command | *(vide)* |
| Build output directory | `.` |

Définir le répertoire racine sur `landing` évite que Cloudflare installe les dépendances npm de
l'application (il n'y a pas de `package.json` dans `landing/`). Pour ne pas redéployer la vitrine à chaque
commit de l'application, on peut restreindre les déploiements automatiques aux chemins `landing/*`
(Settings → Builds → Build watch paths).

**Option B — envoi direct** (sans connexion Git) :

```bash
npx wrangler pages deploy landing --project-name astror-vitrine
```

### Domaine

Le projet sera d'abord servi sur `<projet>.pages.dev`. Pour un domaine personnalisé, ajouter un
sous-domaine distinct de l'application (par exemple `decouvrir.swinux.ch` ou `www.astror.swinux.ch`)
dans Pages → Custom domains. **Ne pas** pointer `astror.swinux.ch` vers Cloudflare Pages : ce domaine sert
l'application (Netlify) et son service worker.

Une fois le domaine définitif connu, ajouter dans `landing/index.html` :

```html
<link rel="canonical" href="https://DOMAINE/" />
<meta property="og:url" content="https://DOMAINE/" />
```

et rendre absolue l'URL de `og:image` (`https://DOMAINE/assets/og-image.jpg`) : la plupart des réseaux
sociaux ignorent une image de partage en chemin relatif. Ajouter alors `Sitemap: https://DOMAINE/sitemap.xml`
dans `robots.txt` si un sitemap est créé.

## Points à réactiver plus tard

Le dépôt GitHub est actuellement **privé** et la documentation GitHub Pages n'est pas publiée : la vitrine
n'annonce donc ni « open source » ni lien GitHub / documentation. Les liens correspondants (documentation,
données et confidentialité, code source, nouveautés, licence MIT) sont prêts, en commentaire HTML, dans le
pied de page de `landing/index.html`. Une fois le dépôt rendu public : décommenter ces blocs, et remettre la
mention « open source » dans le hero, la section « Pourquoi Astror » et la FAQ « Astror est-il gratuit ? ».
