# Astror — Contexte projet

Application mobile PWA pour astronomes amateurs, entièrement en français (Vite + React 18 + vite-plugin-pwa). Voir [CONTEXT.md](CONTEXT.md) pour l'architecture technique détaillée des fichiers source.

## Documentation

> Documentation : suivre [DOCUMENTATION_SPEC.md](DOCUMENTATION_SPEC.md). Une tâche n'est « done » que si la doc est à jour.

Le site documentaire utilisateur vit dans [`docs/`](docs/) (généré à partir de [`docs/_generator/content.mjs`](docs/_generator/content.mjs) — voir ce fichier pour modifier le contenu, puis relancer `node docs/_generator/build.mjs`). Il est publié via GitHub Pages depuis `main` / `/docs`.

Avant de considérer une fonctionnalité terminée : vérifier si un écran, un paramètre, une permission, une donnée ou un comportement a changé, et mettre à jour la page correspondante dans `docs/_generator/content.mjs` (voir la commande `/doc`).
