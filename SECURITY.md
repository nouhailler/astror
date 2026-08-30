# Politique de sécurité

## Versions supportées

Astror n'a pas de branches de maintenance à long terme : seule la dernière version publiée sur
`main` (voir [CHANGELOG.md](CHANGELOG.md) pour le numéro courant) reçoit des correctifs de sécurité.

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique** pour une vulnérabilité de sécurité. Envoyez plutôt un
e-mail à **contact@swinux.ch** avec :

- une description du problème et de son impact potentiel ;
- les étapes pour le reproduire ;
- si possible, la version d'Astror concernée (visible dans l'app : menu ☰ → À propos).

Vous recevrez un accusé de réception sous quelques jours. Le correctif, une fois disponible, sera
publié dans une nouvelle version et documenté dans le [CHANGELOG.md](CHANGELOG.md) sans nécessairement
détailler la faille avant qu'un délai raisonnable ne se soit écoulé.

## Modèle de sécurité du projet

Astror est une application 100 % côté client (PWA), sans backend ni compte utilisateur :

- Aucune donnée personnelle n'est stockée sur un serveur ; tout reste dans le `localStorage` du
  navigateur de l'utilisateur. Détail complet : [Données et confidentialité](https://nouhailler.github.io/astror/data/).
- Les fonctionnalités IA nécessitent que l'utilisateur fournisse sa propre clé API (OpenRouter ou
  Anthropic). **Ces clés sont stockées en clair dans le `localStorage`**, comme documenté dans
  [Clés API pour l'IA](https://nouhailler.github.io/astror/features/cles-api-ia/) — c'est une limite
  connue et assumée de l'architecture sans backend, pas un oubli. Si vous identifiez un moyen de
  l'exfiltrer autrement que par un accès physique/XSS au navigateur de l'utilisateur, merci de le
  signaler.
- Aucune télémétrie, aucun tracker, aucun envoi de données en arrière-plan. Les seuls messages
  envoyés vers l'extérieur (mail de support, issue GitHub) sont pré-remplis mais **jamais envoyés sans
  action explicite de l'utilisateur** — voir [Écran À propos](https://nouhailler.github.io/astror/features/a-propos/).

## Dépendances

Le projet utilise `npm audit` de façon ponctuelle pour surveiller les vulnérabilités connues dans les
dépendances tierces. Les contributions mettant à jour une dépendance vulnérable sont bienvenues.
