# Tutoriels vidéo d'Astror

Les tutoriels vidéo d'Astror sont produits automatiquement par
**[video-studio](https://github.com/nouhailler/video-studio)** : un scénario TypeScript est joué dans
la vraie interface, filmé, doublé par une voix de synthèse locale (Piper), sous-titré et exporté en
MP4 prêt pour YouTube. Le moteur de production est le paquet ; ce dossier ne contient que ce qui est
propre à Astror.

## Utilisation

Une fois par machine (Piper, voix et Chromium, partagés par tous les projets dans `~/.cache/video-studio`) :

```bash
npm run video:setup
```

Produire le tutoriel de présentation :

```bash
npm run video:generate -- --scenario astror-presentation-fr
```

Sorties dans `video/output/` : `.mp4` (H.264 1920×1080, AAC), `.srt` / `.vtt` (sous-titres),
`.chapters.txt` (chapitrage YouTube), `.report.json` (vérifications).

Autres commandes : `video:list`, `video:validate`, `video:audio`, `video:record`, `video:render`,
`video:preview` (Remotion Studio), `video:typecheck`. Toutes acceptent `--scenario <id>` ;
`video:record` et `video:generate` acceptent `--no-build`, `--headed`, `--network replay|refresh|offline`.

## Contenu de ce dossier

| Élément | Rôle |
|---|---|
| `video.config.ts` | Configuration : pilote « engine » (moteur de démo `src/demo/`), graine localStorage, vérification de restauration, validation des onglets/outils, prononciation, identité visuelle |
| `scenarios/astror-presentation-fr.ts` | « Découvrez ASTROR » (3 min 47 s, 7 chapitres) |
| `scenarios/from-demo.ts` | Réutilise les démos existantes sans les modifier (`demo-tour`, `demo-sky`, `demo-tools`, `demo-assistant`) |
| `fixtures/network/` | Réponses simulées (météo, position ISS) et données réelles figées (TLE) |
| `assets/logo.svg` | Logo utilisé dans l'intro, la conclusion et le bandeau |
| `docs/AUDIT.md` | Audit initial du moteur de démo |

Les fichiers générés (`audio/`, `cache/`, `recordings/`, `build/`, `output/`) ne sont pas versionnés.

## Comment Astror est filmé

Astror possède son propre moteur de démo (`src/demo/`). Il parle le protocole de capture de
video-studio : en mode capture (activé seulement si l'outil injecte `window.__ASTROR_CAPTURE__` et
ouvre `?capture=1`), il masque ses contrôles, tient chaque étape la durée réelle de la voix, confirme
les navigations, s'arrête sur toute erreur et émet des événements horodatés. Le mode démo interactif
de l'application n'est pas affecté.

Pendant la capture : soirée du 20 novembre 2026, 21 h 30, à Paris (horloge simulée). La météo et la
position instantanée de l'ISS sont simulées ; les éléments orbitaux sont réels, figés aux 15-16 nov.
2026 ; les calculs astronomiques sont ceux d'Astror. Les APIs d'IA sont toujours bloquées.

## Écrire un nouveau tutoriel

1. Créer `scenarios/<sujet>-fr.ts` sur le modèle de `astror-presentation-fr.ts` (étapes du moteur de
   démo : `navigate` avec `to`/`tool`, `click`, `highlight`, `type`, `wait`, `narrate`).
2. L'ajouter à `scenarios` dans `video.config.ts`.
3. Si un élément n'a pas encore de cible, poser un attribut inerte `data-demo-id="…"` dans `src/`.
4. `npm run video:validate -- --scenario <id>`, puis `video:generate`.

Les valeurs citées à l'oral (phase de la Lune, planète visible…) doivent être celles qu'Astror calcule
pour l'horloge du scénario : vérifier sur la capture. Référence complète :
[README de video-studio](https://github.com/nouhailler/video-studio#readme).
