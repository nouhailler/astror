import { useState, useMemo } from 'react'
import { IcSpark, IcGlobe, IcTimer, IcOrbit, IcComet, IcStar, IcRocket, IcZap, IcPin } from './icons'
import { ToolPage, ToolHero, ToolSection, ToolSeg } from './tool-ui'
import { Sheet, AiInfoPanel, DataRow } from './ui'
import { onbLoad } from './onboarding'

// ─── Échelle ─────────────────────────────────────────────────────────────────

const SCALE = [
  { name: 'Montagne Everest', size: '8 849 m', px: 3 },
  { name: 'Lune', size: '3 474 km', px: 9 },
  { name: 'Terre', size: '12 742 km', px: 14 },
  { name: 'Jupiter', size: '139 820 km', px: 28 },
  { name: 'Soleil', size: '1,39 millions km', px: 52 },
  { name: 'Étoile R Doradus', size: '1,2 UA', px: 80 },
  { name: 'Système Solaire', size: '287,5 UA', px: 110 },
  { name: 'Voie Lactée', size: '100 000 al', px: 160 },
  { name: 'Univers observable', size: '93 milliards al', px: 210 },
]

// ─── Top 10 pool ──────────────────────────────────────────────────────────────
// months : meilleurs mois de visibilité (null = toute l'année)

const TOP_POOL = [
  {
    id: 'M42', name: 'M42 — Nébuleuse d\'Orion', cat: 'Nébuleuse à émission', mag: 4.0, gear: 'Œil nu',
    const: 'Orion', coords: 'AR 05h35m · Déc −05°', months: [11, 12, 1, 2, 3],
    desc: 'La plus belle nébuleuse du ciel boréal, à 1 344 al. À l\'œil nu c\'est une tache floue dans l\'épée d\'Orion. Aux jumelles, on distingue les 4 étoiles du Trapèze qui ionisent le gaz environnant et créent un spectacle de lumière rose-orangée.',
    tip: 'Observez au grossissement 40–80× pour voir les contours de gaz. Évitez les nuits de pleine Lune.',
  },
  {
    id: 'M45', name: 'M45 — Pléiades', cat: 'Amas ouvert', mag: 1.6, gear: 'Jumelles',
    const: 'Taureau', coords: 'AR 03h47m · Déc +24°', months: [10, 11, 12, 1, 2, 3],
    desc: 'L\'amas ouvert le plus connu du ciel. À l\'œil nu, 6 à 7 étoiles visibles selon les conditions. Aux jumelles, une centaine d\'étoiles bleues jeunes entourées d\'une légère nébuleuse de réflexion.',
    tip: 'Les jumelles 7×50 ou 10×50 donnent le meilleur résultat — le télescope a un champ trop étroit pour cet amas.',
  },
  {
    id: 'M13', name: 'M13 — Amas globulaire d\'Hercule', cat: 'Amas globulaire', mag: 5.8, gear: 'Lunette 80 mm',
    const: 'Hercule', coords: 'AR 16h42m · Déc +36°', months: [4, 5, 6, 7, 8, 9],
    desc: '300 000 étoiles concentrées en une sphère de 150 al de diamètre, à 25 100 al. Un télescope de 150 mm le résout en milliers d\'étoiles individuelles. C\'est vers lui que le message d\'Arecibo fut envoyé en 1974.',
    tip: 'Cherchez la tache floue dans le côté du quadrilatère d\'Hercule. Un 100 mm suffit pour commencer à le résoudre.',
  },
  {
    id: 'M31', name: 'M31 — Galaxie d\'Andromède', cat: 'Galaxie spirale', mag: 3.4, gear: 'Jumelles',
    const: 'Andromède', coords: 'AR 00h43m · Déc +41°', months: [8, 9, 10, 11, 12],
    desc: 'La galaxie la plus lointaine visible à l\'œil nu : 2,5 millions d\'al. Aux jumelles, on distingue le noyau et les galaxies satellites M32 et M110. Dans 4,5 milliards d\'années, elle fusionnera avec la Voie Lactée.',
    tip: 'Depuis un ciel Bortle ≤ 4 par nuit sans Lune, la galaxie s\'étend sur 6× le diamètre de la Lune pleine.',
  },
  {
    id: 'M57', name: 'M57 — Nébuleuse de l\'Anneau', cat: 'Nébuleuse planétaire', mag: 8.8, gear: 'Télescope 100 mm',
    const: 'Lyra', coords: 'AR 18h54m · Déc +33°', months: [5, 6, 7, 8, 9],
    desc: 'Un anneau de gaz éjecté par une étoile mourante à 2 300 al. L\'étoile centrale (naine blanche) atteint 100 000 K. Facile à trouver : entre β et γ Lyrae, juste au-dessus de Véga.',
    tip: '150–200× de grossissement pour distinguer clairement l\'anneau et son trou central.',
  },
  {
    id: 'M51', name: 'M51 — Galaxie du Tourbillon', cat: 'Galaxie spirale', mag: 8.4, gear: 'Télescope 150 mm',
    const: 'Chiens de chasse', coords: 'AR 13h30m · Déc +47°', months: [2, 3, 4, 5, 6],
    desc: 'La galaxie qui révéla les bras spiraux pour la première fois en 1845. M51 est en interaction gravitationnelle avec sa compagne NGC 5195. Un 200 mm par ciel sombre montre les bras spiraux.',
    tip: 'Décalez depuis Alcor/Mizar (Grande Ourse) vers le sud-ouest. Fond de ciel très sombre requis.',
  },
  {
    id: 'M1', name: 'M1 — Nébuleuse du Crabe', cat: 'Reste de supernova', mag: 8.4, gear: 'Télescope 100 mm',
    const: 'Taureau', coords: 'AR 05h35m · Déc +22°', months: [11, 12, 1, 2, 3],
    desc: 'Les restes de la supernova observée par les Chinois en 1054 apr. J.-C. Au centre, un pulsar tourne à 30 tours/seconde. La nébuleuse s\'étend encore à 11 km/s et couvre 10×7 années-lumière.',
    tip: 'Pointez 1° au NW de ζ Tauri. À 100×, une tache ovale légèrement irrégulière, grisâtre.',
  },
  {
    id: 'M44', name: 'M44 — Ruche', cat: 'Amas ouvert', mag: 3.7, gear: 'Jumelles',
    const: 'Cancer', coords: 'AR 08h40m · Déc +20°', months: [1, 2, 3, 4, 5],
    desc: 'L\'un des amas ouverts les plus proches, à 577 al. À l\'œil nu, une tache floue entre Castor/Pollux et Régulus. Aux jumelles, on dénombre facilement une cinquantaine d\'étoiles dans un beau champ.',
    tip: 'Parfait objet pour s\'initier aux jumelles. Le ciel doit être Bortle ≤ 5 pour le voir à l\'œil nu.',
  },
  {
    id: 'NGC869', name: 'NGC 869/884 — Double amas de Persée', cat: 'Amas ouvert double', mag: 4.3, gear: 'Jumelles',
    const: 'Persée', coords: 'AR 02h19m · Déc +57°', months: null,
    desc: 'Deux amas ouverts voisins à 7 500 al. Aux jumelles, deux concentrations d\'étoiles bleues jeunes (13 Ma) côte à côte dans un champ saisissant. Circumpolaire depuis l\'Europe — visible toute l\'année.',
    tip: 'Circumpolaire : meilleur en automne-hiver quand Persée est haut. Le meilleur objet jumelles de l\'hiver.',
  },
  {
    id: 'Albireo', name: 'Albireo — Étoile double colorée', cat: 'Étoile double', mag: 3.1, gear: 'Lunette 60 mm',
    const: 'Cygne', coords: 'AR 19h31m · Déc +28°', months: [5, 6, 7, 8, 9, 10],
    desc: 'Le plus beau couple d\'étoiles contrastées : une géante orange (K3, 4 500 K) et une étoile bleue (B0, 30 000 K), séparées de 35 arcsec. Un vrai joyau visuel pour les petits instruments.',
    tip: '50–80× de grossissement suffit amplement. Le contraste jaune-orangé/bleu est immédiatement saisissant.',
  },
  {
    id: 'M81M82', name: 'M81/M82 — Bode & Cigare', cat: 'Paire de galaxies', mag: 6.9, gear: 'Télescope 100 mm',
    const: 'Grande Ourse', coords: 'AR 09h56m · Déc +69°', months: [1, 2, 3, 4, 5, 6],
    desc: 'Deux galaxies dans le même champ. M81 est une spirale majestuese ; M82 est une galaxie à explosion stellaire — des filaments de gaz s\'en échappent sur plusieurs kiloparsecs. Interagissent gravitationnellement.',
    tip: 'À mi-chemin entre Dubhe (Grande Ourse) et Polaris. Un 150 mm montre les détails de M82.',
  },
  {
    id: 'M104', name: 'M104 — Galaxie Sombrero', cat: 'Galaxie spirale', mag: 8.0, gear: 'Télescope 150 mm',
    const: 'Vierge', coords: 'AR 12h40m · Déc −11°', months: [3, 4, 5, 6],
    desc: 'Une des galaxies les plus reconnaissables : renflement central massif et anneau de poussières sombres en font un sombrero visible de profil à 50 millions d\'al. Le trou noir central équivaut à 1 milliard de masses solaires.',
    tip: 'Un 200 mm commence à révéler la bande de poussière. Excellent ciel sombre requis.',
  },
]

// ─── Voyages ─────────────────────────────────────────────────────────────────

const EXPLORATIONS = [
  {
    id: 'sun',
    title: 'Voyage vers le Soleil',
    desc: 'De la Terre vers le Soleil à la vitesse de la lumière. 8 min 20 s pour 150 millions de km.',
    Icon: IcOrbit,
    body: `La distance Terre–Soleil, aussi appelée unité astronomique (UA), vaut exactement 149 597 870,7 km. La lumière la traverse en 8 minutes et 20 secondes — c'est la limite de vitesse de l'univers.

Si vous voyagiez à bord d'un avion de ligne (900 km/h), il vous faudrait 19 ans pour atteindre le Soleil. Un voyage en voiture à 130 km/h prendrait 131 ans. Même une fusée comme la Saturn V (40 000 km/h) mettrait plus de 5 mois.

La sonde Parker Solar Probe (2018) est l'objet le plus rapide jamais construit : elle frôle le Soleil à 690 000 km/h — et met tout de même 83 heures depuis la Terre. Au plus proche, elle se trouve à seulement 6,1 millions de km de la photosphère, baignant dans une couronne solaire à 1 million de kelvins.`,
    facts: [['Distance', '149,6 millions km'], ['Lumière', '8 min 20 s'], ['Avion 900 km/h', '~19 ans'], ['Parker Solar Probe', '~83 h']],
    aiPrompt: 'Voyage vers le Soleil : décris en 4 phrases ce qu\'on observerait en s\'approchant de la photosphère solaire depuis la Terre — les phénomènes visibles successivement (couronne, vent solaire, proéminences), et pourquoi la couronne est paradoxalement plus chaude que la surface.',
  },
  {
    id: 'jupiter',
    title: 'Les lunes de Jupiter',
    desc: '95 lunes gravitent autour de Jupiter. Europa possède un océan sous sa croûte de glace.',
    Icon: IcGlobe,
    body: `Jupiter possède 95 lunes confirmées. Les quatre lunes galiléennes — Io, Europa, Ganymède et Callisto — sont visibles aux jumelles et furent les premières preuves, en 1610, que tous les corps célestes n'orbitent pas autour de la Terre.

Io est le monde le plus volcanique du système solaire : plus de 400 volcans actifs alimentés par les forces de marée de Jupiter. Europa, légèrement plus petite que la Lune, cache un océan d'eau liquide sous 10 à 30 km de glace — l'un des meilleurs candidats à la vie extraterrestre.

Ganymède est la plus grande lune du système solaire, plus grande que Mercure, et possède son propre champ magnétique. La mission JUICE de l'ESA (lancée 2023) est actuellement en route pour les étudier en détail, avec une arrivée prévue en 2031.`,
    facts: [['Nb de lunes', '95 confirmées'], ['Io', 'Volcans actifs (×400)'], ['Europa', 'Océan sous-glaciaire'], ['JUICE (ESA)', 'Arrivée 2031']],
    aiPrompt: 'Les lunes de Jupiter et la vie extraterrestre : détaille les conditions d\'Europa et compare avec Encelade (Saturne). Quelles missions futures (Europa Clipper, JUICE) pourraient détecter des biosignatures, et quelles seraient les implications d\'une découverte positive ?',
  },
  {
    id: 'scale',
    title: 'L\'échelle du Système Solaire',
    desc: 'Si le Soleil était une balle de basketball, Neptune serait à 800 mètres de là.',
    Icon: IcTimer,
    body: `Les distances du Système Solaire défient l'imagination. Prenons une analogie : si le Soleil (1,39 million km) était réduit à une balle de basketball (24 cm), voici où se trouveraient les planètes.

Mercure serait à 10 mètres, Vénus à 19 m, la Terre à 26 m, Mars à 40 m, Jupiter à 135 m, Saturne à 248 m, Uranus à 499 m, Neptune à 781 m. L'étoile la plus proche (Proxima Centauri) serait à… 7 000 kilomètres de là.

L'espace interplanétaire est presque entièrement vide. Les 8 planètes et tous leurs satellites tiennent dans moins de 0,002 % du volume de la sphère d'influence solaire. Voyager 1, lancé en 1977, n'a franchi l'héliopause (limite du vent solaire) qu'en 2012 — après 35 ans de voyage.`,
    facts: [['Soleil → Neptune', '4,5 milliards km'], ['1 UA', '149,6 Mkm'], ['Voyager 1', '~163 UA (2025)'], ['Proxima Cen.', '4,24 al · 268 000 UA']],
    aiPrompt: 'L\'échelle du Système Solaire et la frontière héliosphérique : comment Voyager 1 a-t-il traversé l\'héliopause en 2012 et qu\'a-t-il détecté ? Explique la différence entre héliopause, héliosphère et nuage d\'Oort, et ce que cela signifie pour la définition des "limites" du système solaire.',
  },
  {
    id: 'web',
    title: 'La toile cosmique',
    desc: 'Les galaxies s\'assemblent en filaments séparés par des vides de 300 millions d\'al.',
    Icon: IcSpark,
    body: `À grande échelle, l'univers ressemble à une toile d'araignée cosmique. Les galaxies ne sont pas réparties aléatoirement : elles s'organisent en filaments et en murs séparés par d'immenses vides (voids) presque dépourvus de matière.

Le Grand Mur de CfA2 s'étend sur 500 millions d'années-lumière. Le Vide du Bouvier mesure 330 Mal de diamètre. Notre Voie Lactée fait partie du superamas de Laniakea (500 Mal, 100 000 galaxies), lui-même inclus dans la structure Perseus-Pisces.

Cette structure est le résultat de 13,8 milliards d'années de gravité amplifiant les minuscules fluctuations de densité du Big Bang primordial. Les simulations Illustris et TNG reproduisent fidèlement cette toile à partir des seules équations connues de la physique — une confirmation que notre modèle standard est correct.`,
    facts: [['Laniakea', '500 Mal · 100 000 galaxies'], ['Vide du Bouvier', '330 Mal'], ['Nb de galaxies', '~2 trillions'], ['Grand attrac.', '250 Mal · 10¹⁶ M☉']],
    aiPrompt: 'La toile cosmique et son origine : comment les astronomes cartographient-ils cette structure (SDSS, Euclid) ? Explique le rôle de la matière noire dans la formation de la toile, et ce que les relevés actuels nous apprennent sur l\'énergie noire à travers la mesure des oscillations acoustiques des baryons (BAO).',
  },
  {
    id: 'neutron',
    title: 'Plongée dans une étoile à neutrons',
    desc: '1,4 masse solaire comprimée en 10 km. La matière poussée à son extrême limite.',
    Icon: IcComet,
    body: `Une étoile à neutrons est le résidu d'une supernova : 1,4 fois la masse du Soleil comprimée en une sphère de 10 km de rayon — moins que la superficie de Paris. Une cuillère à café de sa matière pèse un milliard de tonnes.

La gravité en surface est 200 milliards de fois celle de la Terre. La vitesse de libération approche 50 % de la vitesse de la lumière. La pression est si extrême que les électrons et les protons se fusionnent en neutrons — d'où le nom.

Les pulsars sont des étoiles à neutrons en rotation rapide (1 à 716 tours/seconde pour les plus rapides) qui émettent des faisceaux de rayonnement précis comme des horloges atomiques. La fusion de deux étoiles à neutrons (kilonova) a été détectée par LIGO en 2017 : elle produit des ondes gravitationnelles ET forge des métaux lourds comme l'or et le platine.`,
    facts: [['Masse', '1,2 – 2,2 M☉'], ['Rayon', '~10 km'], ['Rotation max', '716 Hz (PSR J1748)'], ['Champ magnétique', '10⁸ – 10¹⁵ Tesla']],
    aiPrompt: 'Les étoiles à neutrons et la kilonova GW170817 (2017) : qu\'a-t-on appris de cette première observation simultanée en ondes gravitationnelles et en lumière ? Explique le lien entre fusions d\'étoiles à neutrons, nucléosynthèse r-process et origine des éléments lourds comme l\'or dans l\'univers.',
  },
  {
    id: 'blackhole',
    title: 'Au bord d\'un trou noir stellaire',
    desc: 'L\'horizon des événements : la frontière dont rien, même la lumière, ne revient.',
    Icon: IcStar,
    body: `Un trou noir stellaire se forme quand le cœur d'une étoile massive (> 25 M☉) s'effondre après une supernova. Aucune force connue ne peut arrêter cet effondrement. Le résultat est une singularité enveloppée par l'horizon des événements.

L'horizon des événements n'est pas une surface physique mais une limite mathématique : tout ce qui la franchit ne peut plus revenir. Pour un trou noir de 10 masses solaires, ce rayon de Schwarzschild vaut 30 km. Un observateur distant verrait un objet tombant sembler "se figer" sur l'horizon, rougir et s'estomper.

LIGO a détecté des dizaines de fusions de trous noirs depuis 2015. En 2019, l'Event Horizon Telescope a capturé la première image directe d'un trou noir (M87*, 6,5 milliards de M☉). En 2022, c'est Sagittarius A* — le trou noir de notre propre galaxie (4 millions de M☉) — qui a été imagé.`,
    facts: [['Rmin (10 M☉)', '~30 km (rSch)'], ['1ère image', 'M87* (EHT 2019)'], ['Sgr A*', '4 Mrd M☉ (EHT 2022)'], ['Hawking T°', '~60 nK pour 10 M☉']],
    aiPrompt: 'Les trous noirs et le paradoxe de l\'information : expliquer le paradoxe de Hawking (les trous noirs émettent un rayonnement thermique, donc s\'évaporent, mais l\'information semble perdue), les approches proposées pour le résoudre (complémentarité, firewalls, holographie), et ce que l\'image de M87* nous a réellement appris sur la physique des trous noirs.',
  },
]

// ─── Composants ──────────────────────────────────────────────────────────────

function ScaleVisual({ idx, size }) {
  const s = Math.max(size, 10)
  const r = s / 2

  if (idx === 0) { // Everest — mountain
    return (
      <div style={{ position: 'relative', width: s * 1.6, height: s, flexShrink: 0, transition: 'all .4s cubic-bezier(.34,1.56,.64,1)' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: `${s * 0.8}px solid transparent`,
          borderRight: `${s * 0.8}px solid transparent`,
          borderBottom: `${s}px solid #7a6a5a` }} />
        <div style={{ position: 'absolute', bottom: s * 0.6, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: `${s * 0.35}px solid transparent`,
          borderRight: `${s * 0.35}px solid transparent`,
          borderBottom: `${s * 0.42}px solid rgba(255,255,255,0.75)` }} />
      </div>
    )
  }

  if (idx === 1) { // Moon — gray sphere with craters
    return (
      <div style={{ width: s, height: s, borderRadius: '50%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        background: 'radial-gradient(circle at 38% 36%, #d0cfc8, #9e9d96 50%, #6e6d68)',
        boxShadow: `0 0 ${r * 0.3}px rgba(180,180,160,0.3)` }}>
        {s > 14 && <>
          <div style={{ position: 'absolute', width: '20%', height: '20%', borderRadius: '50%', background: 'rgba(0,0,0,0.22)', top: '30%', left: '40%' }} />
          <div style={{ position: 'absolute', width: '14%', height: '14%', borderRadius: '50%', background: 'rgba(0,0,0,0.18)', top: '55%', left: '25%' }} />
          <div style={{ position: 'absolute', width: '10%', height: '10%', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', top: '22%', left: '22%' }} />
        </>}
      </div>
    )
  }

  if (idx === 2) { // Earth — blue sphere with continents
    return (
      <div style={{ width: s, height: s, borderRadius: '50%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        background: 'radial-gradient(circle at 36% 32%, #4fa3d4, #1a6ea8 50%, #0d3d6e)',
        boxShadow: `0 0 ${r * 0.4}px rgba(79,163,212,0.35)` }}>
        {s > 10 && <>
          <div style={{ position: 'absolute', width: '38%', height: '32%', borderRadius: '40% 60% 50% 55%', background: '#3a9e5a', top: '22%', left: '28%', opacity: 0.85 }} />
          <div style={{ position: 'absolute', width: '24%', height: '22%', borderRadius: '50%', background: '#3a9e5a', top: '48%', left: '12%', opacity: 0.8 }} />
          <div style={{ position: 'absolute', width: '20%', height: '16%', borderRadius: '45% 55% 60% 40%', background: '#4aae6a', top: '32%', left: '62%', opacity: 0.75 }} />
          <div style={{ position: 'absolute', width: '18%', height: '8%', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', top: '5%', left: '30%' }} />
          <div style={{ position: 'absolute', width: '15%', height: '7%', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', bottom: '4%', left: '36%' }} />
        </>}
      </div>
    )
  }

  if (idx === 3) { // Jupiter — orange banded sphere
    return (
      <div style={{ width: s, height: s, borderRadius: '50%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        background: 'radial-gradient(circle at 38% 35%, #e8c89e, #c8824a 40%, #8c4a1a)',
        boxShadow: `0 0 ${r * 0.3}px rgba(200,130,74,0.4)` }}>
        {[18, 33, 48, 63, 78].map(t => (
          <div key={t} style={{ position: 'absolute', left: 0, right: 0, height: '8%', top: `${t}%`,
            background: 'rgba(110,45,10,0.35)' }} />
        ))}
      </div>
    )
  }

  if (idx === 4) { // Sun — gold orb with corona glow
    return (
      <div style={{ width: s, height: s, borderRadius: '50%', flexShrink: 0,
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        background: 'radial-gradient(circle at 36% 32%, var(--gold-2), var(--gold) 40%, #8c5c18)',
        boxShadow: `0 0 ${r * 0.8}px rgba(217,179,108,0.65), 0 0 ${r * 1.8}px rgba(217,179,108,0.2)` }} />
    )
  }

  if (idx === 5) { // R Doradus — red giant with large glow
    return (
      <div style={{ width: s, height: s, borderRadius: '50%', flexShrink: 0,
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        background: 'radial-gradient(circle at 38% 36%, #ff9070, #e04020 50%, #7a1a0a)',
        boxShadow: `0 0 ${r * 0.8}px rgba(224,64,32,0.55), 0 0 ${r * 1.8}px rgba(224,64,32,0.2)` }} />
    )
  }

  if (idx === 6) { // Solar System — orbital rings
    const rings = [0.28, 0.42, 0.58, 0.74, 0.92]
    return (
      <div style={{ width: s, height: s, flexShrink: 0, transition: 'all .4s cubic-bezier(.34,1.56,.64,1)' }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
          {rings.map((f, i) => (
            <ellipse key={i} cx={s / 2} cy={s / 2} rx={s / 2 * f} ry={s / 2 * f * 0.26}
              fill="none" stroke="rgba(217,179,108,0.32)" strokeWidth={s > 80 ? 1.2 : 0.7} />
          ))}
          <circle cx={s / 2} cy={s / 2} r={s * 0.07} fill="var(--gold)" opacity={0.9} />
          {rings.map((f, i) => {
            const rx = s / 2 * f, ry = s / 2 * f * 0.26
            return <circle key={i} cx={s / 2 + rx * 0.7} cy={s / 2 - ry * 0.7} r={Math.max(1.5, s * 0.018)}
              fill="rgba(217,179,108,0.7)" />
          })}
        </svg>
      </div>
    )
  }

  if (idx === 7) { // Milky Way — spiral galaxy
    return (
      <div style={{ width: s, height: s, flexShrink: 0, transition: 'all .4s cubic-bezier(.34,1.56,.64,1)' }}>
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={s / 2} cy={s / 2} r={s / 2} fill="rgba(8,5,20,0.7)" />
          <ellipse cx={s / 2} cy={s / 2} rx={s * 0.44} ry={s * 0.09} fill="rgba(200,190,255,0.18)" />
          {[0, Math.PI].map((offset, ai) => {
            const pts = []
            for (let t = 0; t <= Math.PI * 1.35; t += 0.1) {
              const rad = (s * 0.048) * Math.exp(t * 0.37)
              if (rad > s * 0.45) break
              pts.push(`${s / 2 + rad * Math.cos(t + offset)},${s / 2 + rad * Math.sin(t + offset) * 0.36}`)
            }
            return <polyline key={ai} points={pts.join(' ')} fill="none"
              stroke="rgba(200,190,255,0.6)" strokeWidth={s > 80 ? 2 : 1} strokeLinecap="round" />
          })}
          <circle cx={s / 2} cy={s / 2} r={s * 0.055} fill="rgba(240,235,255,0.92)" />
        </svg>
      </div>
    )
  }

  // idx === 8: Universe observable — cosmic web
  return (
    <div style={{ width: s, height: s, flexShrink: 0, transition: 'all .4s cubic-bezier(.34,1.56,.64,1)' }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={s / 2} cy={s / 2} r={s / 2} fill="rgba(5,3,15,0.8)" />
        <circle cx={s / 2} cy={s / 2} r={s / 2 - 0.5} fill="none" stroke="rgba(255,255,255,0.05)" />
        {[
          [0.25, 0.30], [0.50, 0.18], [0.72, 0.35], [0.80, 0.60],
          [0.60, 0.78], [0.30, 0.72], [0.15, 0.55], [0.42, 0.52],
          [0.65, 0.50], [0.35, 0.40], [0.55, 0.38], [0.22, 0.46],
        ].map(([fx, fy], i) => (
          <circle key={i} cx={s * fx} cy={s * fy} r={s > 60 ? 2.2 : 1.2} fill="rgba(200,195,240,0.72)" />
        ))}
        {[
          [[0.25,0.30],[0.42,0.52]], [[0.42,0.52],[0.65,0.50]], [[0.50,0.18],[0.65,0.50]],
          [[0.65,0.50],[0.80,0.60]], [[0.30,0.72],[0.42,0.52]], [[0.15,0.55],[0.35,0.40]],
          [[0.35,0.40],[0.55,0.38]], [[0.55,0.38],[0.72,0.35]], [[0.22,0.46],[0.42,0.52]],
        ].map(([[x1,y1],[x2,y2]], i) => (
          <line key={i} x1={s*x1} y1={s*y1} x2={s*x2} y2={s*y2}
            stroke="rgba(200,195,240,0.18)" strokeWidth="0.5" />
        ))}
      </svg>
    </div>
  )
}

function ScaleExplorer() {
  const [idx, setIdx] = useState(4)
  const cur = SCALE[idx]

  return (
    <div style={{ padding: 18, borderRadius: 18, background: 'radial-gradient(circle at 50% 0%, #0c1128, #040609)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, position: 'relative' }}>
        <ScaleVisual idx={idx} size={cur.px} />
        <div className="eyebrow" style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center' }}>
          {cur.name} · {cur.size}
        </div>
      </div>
      <input type="range" min={0} max={SCALE.length - 1} step={1} value={idx} onChange={e => setIdx(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--gold)', marginTop: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span className="meta">Everest</span>
        <span className="meta">Univers observable</span>
      </div>
    </div>
  )
}

function EarthCrater({ craterKm }) {
  const earthSize = 192
  const craterPx = Math.min(earthSize * 0.92, Math.max(5, (craterKm / 6371) * earthSize))

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
      <div style={{ width: earthSize, height: earthSize, borderRadius: '50%', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(circle at 36% 32%, #4fa3d4, #1a6ea8 50%, #0d3d6e)',
        boxShadow: '0 0 22px rgba(79,163,212,0.28), inset 0 0 32px rgba(0,0,0,0.28)' }}>
        <div style={{ position: 'absolute', width: '38%', height: '32%', borderRadius: '40% 60% 50% 55%', background: '#3a9e5a', top: '22%', left: '28%', opacity: 0.85 }} />
        <div style={{ position: 'absolute', width: '24%', height: '22%', borderRadius: '50%', background: '#3a9e5a', top: '48%', left: '12%', opacity: 0.8 }} />
        <div style={{ position: 'absolute', width: '20%', height: '16%', borderRadius: '45% 55% 60% 40%', background: '#4aae6a', top: '32%', left: '62%', opacity: 0.75 }} />
        <div style={{ position: 'absolute', width: '18%', height: '8%', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', top: '5%', left: '30%' }} />
        <div style={{ position: 'absolute', width: '15%', height: '7%', borderRadius: '50%', background: 'rgba(255,255,255,0.75)', bottom: '4%', left: '36%' }} />
        <div style={{
          position: 'absolute', borderRadius: '50%',
          width: craterPx, height: craterPx,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'width .3s, height .3s',
          background: 'radial-gradient(circle, rgba(200,90,30,0.95) 0%, rgba(230,110,50,0.75) 35%, rgba(110,55,20,0.55) 70%, transparent)',
          boxShadow: craterPx > 20 ? `0 0 ${craterPx * 0.25}px rgba(230,110,50,0.5)` : 'none',
        }} />
      </div>
    </div>
  )
}

function ImpactSim() {
  const [mass, setMass] = useState(5)
  const joules = (10 ** mass).toExponential(1)
  const mt = (10 ** (mass - 15.6)).toFixed(mass < 18 ? 2 : 0)
  const craterKm = parseFloat((10 ** ((mass - 15) / 3)).toFixed(1))

  return (
    <div style={{ padding: 16, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
      <EarthCrater craterKm={craterKm} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span className="field-label" style={{ margin: 0 }}>Masse (log kg)</span>
        <span className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>10^{mass} kg</span>
      </div>
      <input type="range" min={3} max={30} step={1} value={mass} onChange={e => setMass(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: 14 }} />
      <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="metric"><div className="m-k">Énergie</div><div className="m-v" style={{ fontSize: 13 }}>{joules} J</div></div>
        <div className="metric"><div className="m-k">Équiv. TNT</div><div className="m-v" style={{ fontSize: 13 }}>{parseFloat(mt) < 0.01 ? '<0.01' : mt} Mt</div></div>
        <div className="metric"><div className="m-k">Cratère</div><div className="m-v" style={{ fontSize: 13 }}>{craterKm} km</div></div>
      </div>
    </div>
  )
}

function Top10({ onPick }) {
  const [list, setList] = useState(null)
  const profile = useMemo(() => onbLoad(), [])
  const city = profile?.location?.city || null

  const now = new Date()
  const month = now.getMonth() + 1
  const todayLabel = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const seasonLabel = useMemo(() => {
    if ([12, 1, 2].includes(month)) return 'hiver'
    if ([3, 4, 5].includes(month)) return 'printemps'
    if ([6, 7, 8].includes(month)) return 'été'
    return 'automne'
  }, [month])

  const gen = () => {
    const seasonal = TOP_POOL.filter(o => !o.months || o.months.includes(month))
    const offSeason = TOP_POOL.filter(o => o.months && !o.months.includes(month))
    const pool = [...seasonal.sort(() => Math.random() - 0.5), ...offSeason.sort(() => Math.random() - 0.5)]
    setList(pool.slice(0, 10))
  }

  if (!list) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="body tight" style={{ marginBottom: 5, fontSize: 13.5 }}>
          Génère une sélection personnalisée pour ce soir.
        </div>
        <div className="meta" style={{ marginBottom: 16, color: 'var(--gold)' }}>
          Objets de saison en priorité · {seasonLabel}
        </div>
        <button className="btn-primary" onClick={gen}><IcSpark size={17} /> Générer</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 12px', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
        {city && (
          <>
            <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}><IcPin size={13} /></span>
            <span className="meta" style={{ color: 'var(--gold)', flex: 1 }}>{city}</span>
          </>
        )}
        <span className="meta" style={{ color: 'var(--faint)', marginLeft: city ? 0 : 'auto' }}>{todayLabel}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((o, i) => {
          const inSeason = !o.months || o.months.includes(month)
          return (
            <button key={o.id} onClick={() => onPick(o)} className="press"
              style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 14px', borderRadius: 12,
                textAlign: 'left', background: 'var(--surface-1)', border: '1px solid var(--line)', cursor: 'pointer' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, width: 24, textAlign: 'center',
                color: i < 3 ? 'var(--gold)' : 'var(--faint)', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h-card" style={{ fontSize: 13.5 }}>{o.name}</div>
                <div className="meta" style={{ marginTop: 2 }}>{o.const} · mag {o.mag}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                <span className="tag neutral" style={{ fontSize: 10 }}>{o.gear}</span>
                {!inSeason && (
                  <span style={{ fontSize: 9, color: 'var(--faint)', fontFamily: 'var(--mono)' }}>hors saison</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <button onClick={gen} style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '14px auto 0',
        background: 'none', border: 0, cursor: 'pointer', color: 'var(--gold)',
        fontFamily: 'var(--serif)', fontSize: 13.5, fontWeight: 500 }}>
        <IcSpark size={15} /> Nouvelle sélection
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ExtrasPage({ onBack }) {
  const [seg, setSeg] = useState('scale')
  const [expl, setExpl] = useState(null)
  const [top10pick, setTop10pick] = useState(null)

  return (
    <ToolPage title="Explorations" onBack={onBack}>
      <ToolHero
        title="Explorations cosmiques"
        sub="Simulateurs, top 10 et voyages interactifs"
        icon={<IcOrbit size={28} />}
      />
      <ToolSeg
        items={[
          { key: 'scale', label: 'Échelle' },
          { key: 'impact', label: 'Impact' },
          { key: 'top10', label: 'Top 10' },
          { key: 'maps', label: 'Voyages' },
        ]}
        value={seg} onChange={setSeg}
      />

      {seg === 'scale' && (
        <div className="enter">
          <ToolSection title="Explorateur d'échelles">
            <ScaleExplorer />
          </ToolSection>
        </div>
      )}

      {seg === 'impact' && (
        <div className="enter">
          <ToolSection title="Simulateur d'impact">
            <ImpactSim />
          </ToolSection>
        </div>
      )}

      {seg === 'top10' && (
        <div className="enter">
          <ToolSection title="Top 10 de ce soir">
            <Top10 onPick={setTop10pick} />
          </ToolSection>
        </div>
      )}

      {seg === 'maps' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EXPLORATIONS.map(e => (
            <button key={e.id} onClick={() => setExpl(e)} className="press" style={{ textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 15, padding: 16, borderRadius: 18, cursor: 'pointer',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
                <e.Icon size={26} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="h-card" style={{ fontSize: 15, marginBottom: 5 }}>{e.title}</div>
                <div className="body tight" style={{ fontSize: 12.5 }}>{e.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Sheet : fiche objet Top 10 ── */}
      <Sheet open={!!top10pick} onClose={() => setTop10pick(null)}>
        {top10pick && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className="tag">{top10pick.cat}</span>
              <span className="meta" style={{ color: 'var(--gold)' }}>mag {top10pick.mag}</span>
            </div>
            <div className="h-sec" style={{ fontSize: 24, marginBottom: 4, lineHeight: 1.2 }}>{top10pick.name}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 16 }}>
              {top10pick.const} · {top10pick.coords}
            </div>

            <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.68, marginBottom: 16 }}>
              {top10pick.desc}
            </p>

            <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface-1)',
              border: '1px solid var(--line)', marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Conseil d'observation</div>
              <div className="body tight" style={{ fontSize: 13 }}>{top10pick.tip}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 18 }}>
              <DataRow k="Matériel" v={top10pick.gear} accent />
              <DataRow k="Magnitude" v={`mag ${top10pick.mag}`} />
              <DataRow k="Constellation" v={top10pick.const} />
              <DataRow k="Coordonnées" v={top10pick.coords} />
            </div>

            <AiInfoPanel
              cacheKey={`top10_${top10pick.id}`}
              buildPrompt={`Objet du ciel profond : ${top10pick.name} (${top10pick.cat}), magnitude ${top10pick.mag}, dans ${top10pick.const}.
${top10pick.desc}
En 3 à 4 phrases, explique ce qu'un astronome amateur peut réellement voir selon son équipement (jumelles, lunette 80 mm, télescope 200 mm), la meilleure technique d'observation, et une anecdote ou fait scientifique marquant sur cet objet.`}
            />
          </div>
        )}
      </Sheet>

      {/* ── Sheet : voyage interactif ── */}
      <Sheet open={!!expl} onClose={() => setExpl(null)}>
        {expl && (
          <div>
            <span style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)',
              border: '1px solid var(--gold-line)', marginBottom: 16 }}>
              <expl.Icon size={28} />
            </span>
            <div className="h-sec" style={{ fontSize: 22, marginBottom: 18, lineHeight: 1.2 }}>{expl.title}</div>

            {expl.body.split('\n\n').map((para, i) => (
              <p key={i} className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.68, marginBottom: 14 }}>
                {para}
              </p>
            ))}

            <div className="card-2" style={{ padding: '4px 16px', margin: '18px 0' }}>
              {expl.facts.map((f, i) => (
                <DataRow key={i} k={f[0]} v={f[1]} accent={i === 0} />
              ))}
            </div>

            <AiInfoPanel
              cacheKey={`voyage_${expl.id}`}
              buildPrompt={expl.aiPrompt}
            />
          </div>
        )}
      </Sheet>
    </ToolPage>
  )
}
