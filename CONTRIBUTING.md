# Contribuer à Astror

Astror est un projet personnel développé par [Patrick Nouhailler](https://swinux.ch), avec l'aide de
Claude (Anthropic) en pair-programming. Les retours, signalements de bugs et suggestions sont bienvenus
via les [issues GitHub](https://github.com/nouhailler/astror/issues) ; les pull requests aussi, dans la
mesure du raisonnable pour un projet de cette taille.

## Avant de commencer

- Pour un bug : vérifiez d'abord la [FAQ](https://nouhailler.github.io/astror/faq/) et le
  [dépannage](https://nouhailler.github.io/astror/troubleshooting/) de la documentation.
- Pour une idée de fonctionnalité : ouvrez une issue pour en discuter avant de coder, surtout si le
  changement est important (ça évite un travail jeté si l'idée ne correspond pas à la direction du projet).

## Mettre en place l'environnement

```bash
git clone https://github.com/nouhailler/astror.git
cd astror
npm install
npm run dev        # http://localhost:5173
```

Node.js 18 ou 20+ recommandé (voir `engines` dans `package.json`).

## Avant de proposer une pull request

```bash
npm test           # Vitest doit passer intégralement
npm run build      # Le build de production doit réussir sans erreur
```

## Conventions de code

Voir la section [Conventions](README.md#conventions) du README pour les règles spécifiques au projet
(imports, `Sheet`/`createPortal`, format du profil, etc.).

Style de message de commit utilisé dans l'historique — à respecter si possible :

```
<type>(<scope>): résumé court à l'impératif

Corps optionnel expliquant le pourquoi, pas seulement le quoi.
```

Types utilisés : `feat`, `fix`, `perf`, `docs`, `debug`, `design`. Le `scope` est en général le nom
d'écran ou de module concerné (`sky`, `settings`, `demo`, `nav`…).

## Documentation

Ce projet applique [`DOCUMENTATION_SPEC.md`](DOCUMENTATION_SPEC.md) : **une fonctionnalité n'est pas
terminée si sa documentation n'est pas à jour**. Si votre changement ajoute, modifie ou supprime un écran,
un paramètre, une permission ou un comportement visible :

1. Mettez à jour la page correspondante dans [`docs/_generator/content.mjs`](docs/_generator/content.mjs).
2. Relancez `node docs/_generator/build.mjs` pour régénérer le site dans `docs/`.
3. Si le changement est notable, incrémentez `version` dans `package.json` (semver) et ajoutez une entrée
   dans [`CHANGELOG.md`](CHANGELOG.md).

## Code de conduite

Ce projet suit un [code de conduite](CODE_OF_CONDUCT.md). En y participant, vous acceptez de le respecter.
