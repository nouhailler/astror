# Vitrine Astror (`landing/`)

Page de présentation publique d'Astror, **séparée de l'application** : HTML + CSS + quelques lignes de
JavaScript, sans dépendance ni étape de build. Elle renvoie vers l'application en ligne
(<https://astror.swinux.ch/>) sans jamais la remplacer.

## Pourquoi un site séparé

- L'application (Vite + vite-plugin-pwa) est hébergée sur **Cloudflare Pages**, projet distinct (voir [CLOUDFLARE.md](CLOUDFLARE.md)), et la
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
| `landing/404.html`, `landing/robots.txt`, `landing/sitemap.xml` | Page d'erreur, règles d'indexation et plan du site |
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

La vitrine est publiée sur le projet Cloudflare Pages `astrorlanding` :

| | |
|---|---|
| Domaine principal | <https://decouvrir-astror.swinux.ch/> |
| Adresse Cloudflare | <https://astrorlanding.pages.dev/> |
| DNS | `CNAME decouvrir-astror → astrorlanding.pages.dev` (chez l'hébergeur DNS de `swinux.ch`) |

Convention : `decouvrir-<app>.swinux.ch` pour la vitrine, `<app>.swinux.ch` pour l'application.
`astror.swinux.ch` sert l'application et son service worker : il pointe vers le projet Pages **de
l'application** (`astror`, voir [CLOUDFLARE.md](CLOUDFLARE.md)), jamais vers `astrorlanding`.

La balise canonique, `og:url`, `og:image` (URL absolue) et `sitemap.xml` utilisent le domaine principal ;
l'adresse `pages.dev` est ainsi traitée comme un doublon par les moteurs de recherche. En cas de
changement de domaine, mettre à jour `landing/index.html`, `landing/robots.txt` et `landing/sitemap.xml`.

## Points à réactiver plus tard

Le dépôt GitHub est **public** depuis le 2026-11-16 : la vitrine annonce « open source » (hero,
« Pourquoi Astror », FAQ « Astror est-il gratuit ? ») et le pied de page renvoie vers le code source,
les nouveautés (`CHANGELOG.md`) et la licence MIT.

Reste en attente : les liens **Documentation** et **Données et confidentialité**, prêts en commentaire HTML
dans le pied de page de `landing/index.html`. Ils pointent vers <https://nouhailler.github.io/astror/>,
qui ne sera en ligne qu'après activation de GitHub Pages (dépôt → Settings → Pages → branche `main`,
dossier `/docs`). Décommenter ces deux liens une fois la documentation accessible.
