// Réponses simulées des services externes pendant la capture vidéo.
//
// Distinction importante :
//  - SIMULÉ : la donnée est inventée pour la démonstration (météo dégagée,
//    position instantanée de l'ISS). Elle ne prétend pas refléter la réalité.
//  - RÉEL FIGÉ : la donnée est réelle mais figée à une date (éléments orbitaux
//    TLE du 15-16 novembre 2026). Les calculs faits dessus par Astror
//    (passages ISS/Tiangong via satellite.js) restent de vrais calculs.
// Les calculs astronomiques locaux (astronomy-engine : Lune, Soleil, planètes,
// événements, carte du ciel) ne passent pas par le réseau : ils sont exécutés
// réellement, pour la date simulée du scénario.

export interface NetworkFixture {
  id: string
  /** Expression testée sur l'URL complète. */
  match: RegExp
  file: string
  contentType: string
  nature: 'simulé' | 'réel figé'
  note: string
}

export const NETWORK_FIXTURES: NetworkFixture[] = [
  { id: 'open-meteo', match: /^https:\/\/api\.open-meteo\.com\/v1\/forecast/, file: 'open-meteo.json',
    contentType: 'application/json', nature: 'simulé', note: 'Nuit dégagée : 8 % de nuages, 74 % d’humidité, 5 °C.' },
  { id: 'iss-tle', match: /^https:\/\/api\.wheretheiss\.at\/v1\/satellites\/25544\/tles/, file: 'iss-tle.json',
    contentType: 'application/json', nature: 'réel figé', note: 'TLE ISS du 15/11/2026 (wheretheiss.at).' },
  { id: 'iss-position', match: /^https:\/\/api\.wheretheiss\.at\/v1\/satellites\/25544(\?.*)?$/, file: 'iss-position.json',
    contentType: 'application/json', nature: 'simulé', note: 'Position instantanée de l’ISS (au-dessus de la France).' },
  { id: 'celestrak-iss', match: /^https:\/\/celestrak\.org\/NORAD\/elements\/gp\.php\?CATNR=25544/, file: 'celestrak-25544.txt',
    contentType: 'text/plain', nature: 'réel figé', note: 'TLE ISS du 16/11/2026 (CelesTrak).' },
  { id: 'celestrak-tiangong', match: /^https:\/\/celestrak\.org\/NORAD\/elements\/gp\.php\?CATNR=48274/, file: 'celestrak-48274.txt',
    contentType: 'text/plain', nature: 'réel figé', note: 'TLE Tiangong du 15/11/2026 (CelesTrak).' },
]

/** Services d'IA payants : toujours bloqués pendant une capture (aucune clé, aucun appel). */
export const BLOCKED_HOSTS: RegExp[] = [
  /^https:\/\/openrouter\.ai\//,
  /^https:\/\/api\.anthropic\.com\//,
  /^https:\/\/api\.openai\.com\//,
  /^https:\/\/generativelanguage\.googleapis\.com\//,
]
