import { useState, useMemo, useEffect, useRef } from 'react'
import { IcTrophy, IcFlame, IcCheckCircle, IcClose, IcPlay, IcSpark } from './icons'
import { Sheet } from './ui'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { useLiveData, fetchAPODArticle, fetchEduNews } from './api'
import { callAI } from './claudeApi'

// ─── Quiz pool : 40 questions avec catégories ───────────────────────────────

const CAT_COLORS = {
  'Système solaire': { bg: 'rgba(100,160,255,.12)', bd: 'rgba(100,160,255,.35)', cl: '#7ab3ff' },
  'Cosmologie':      { bg: 'rgba(180,130,255,.12)', bd: 'rgba(180,130,255,.35)', cl: '#c49dff' },
  'Astrophysique':   { bg: 'rgba(255,170,100,.12)', bd: 'rgba(255,170,100,.35)', cl: '#ffb870' },
  'Observation':     { bg: 'rgba(100,210,160,.12)', bd: 'rgba(100,210,160,.35)', cl: '#7dd4a8' },
  'Histoire':        { bg: 'rgba(217,179,108,.12)', bd: 'rgba(217,179,108,.35)', cl: 'var(--gold)' },
  'Instruments':     { bg: 'rgba(200,200,200,.08)', bd: 'rgba(200,200,200,.25)', cl: 'var(--faint)' },
}

const QUIZ_POOL = [
  // ── Système solaire ──
  { cat: 'Système solaire', q: 'Quelle planète possède le système d\'anneaux le plus visible ?',
    opts: ['Jupiter', 'Saturne', 'Uranus', 'Neptune'], a: 1,
    why: 'Les anneaux de Saturne, faits de glace et de poussière, sont visibles dès une lunette de 60 mm.' },
  { cat: 'Système solaire', q: 'Quel est le nom de la plus grande lune de Saturne ?',
    opts: ['Europe', 'Ganymède', 'Titan', 'Io'], a: 2,
    why: 'Titan, plus grand que Mercure, possède une atmosphère dense d\'azote et méthane.' },
  { cat: 'Système solaire', q: 'Quelle est la période de rotation sidérale de la Lune ?',
    opts: ['24 heures', '27,3 jours', '29,5 jours', '365 jours'], a: 1,
    why: 'La Lune tourne en 27,3 jours — exactement sa période orbitale, d\'où on voit toujours la même face.' },
  { cat: 'Système solaire', q: 'Quelle planète tourne « couchée » avec une inclinaison axiale de ~98° ?',
    opts: ['Neptune', 'Jupiter', 'Uranus', 'Vénus'], a: 2,
    why: 'L\'axe d\'Uranus est incliné à 97,8° — probablement suite à un impact colossal dans le passé.' },
  { cat: 'Système solaire', q: 'Quel est le plus grand volcan du système solaire ?',
    opts: ['Mauna Kea', 'Olympus Mons', 'Elysium Mons', 'Ascraeus Mons'], a: 1,
    why: 'Olympus Mons sur Mars culmine à ~22 km de hauteur et s\'étend sur 600 km de diamètre.' },
  { cat: 'Système solaire', q: 'Combien de temps met la lumière du Soleil pour atteindre la Terre ?',
    opts: ['1 minute', '8 minutes 20 secondes', '15 minutes', '4 heures'], a: 1,
    why: 'La distance Terre-Soleil (~150 millions de km) est parcourue par la lumière en 8 min 20 s.' },
  { cat: 'Système solaire', q: 'Quelle particularité de l\'orbite de Mercure a confirmé la relativité générale ?',
    opts: ['Son excentricité', 'La précession de son périhélie', 'Sa vitesse de rotation', 'Son inclinaison'], a: 1,
    why: 'La précession du périhélie de Mercure (43 arcsec/siècle) ne s\'explique que par la relativité générale d\'Einstein.' },
  { cat: 'Système solaire', q: 'Quelle planète possède la plus longue journée du système solaire ?',
    opts: ['Mercure', 'Vénus', 'Mars', 'Jupiter'], a: 1,
    why: 'Vénus tourne si lentement qu\'un jour vénusien dure ~243 jours terrestres — plus long que son année.' },
  // ── Cosmologie ──
  { cat: 'Cosmologie', q: 'À quelle distance se trouve la galaxie d\'Andromède (M31) ?',
    opts: ['250 000 al', '2,5 millions d\'al', '25 millions d\'al', '2,5 milliards d\'al'], a: 1,
    why: 'M31 est à 2,5 millions d\'années-lumière — l\'objet le plus lointain visible à l\'œil nu.' },
  { cat: 'Cosmologie', q: 'Quelle est la distance approximative du centre galactique depuis la Terre ?',
    opts: ['2 600 al', '8 200 parsecs', '1 000 parsecs', '50 000 al'], a: 1,
    why: 'Le centre de la Voie Lactée se trouve à ~8 200 parsecs (26 700 al), dans la direction du Sagittaire.' },
  { cat: 'Cosmologie', q: 'Qu\'est-ce que l\'énergie noire ?',
    opts: ['Un trou noir massif', 'La force accélérant l\'expansion de l\'univers', 'De l\'antimatière', 'Une étoile mourante'], a: 1,
    why: 'L\'énergie noire représente ~68 % du contenu de l\'univers. Elle contrecarre la gravité et accélère l\'expansion.' },
  { cat: 'Cosmologie', q: 'Qu\'est-ce que la matière noire ?',
    opts: ['Des trous noirs', 'Une masse non lumineuse détectée uniquement par ses effets gravitationnels', 'Du gaz froid', 'Des neutrinos'], a: 1,
    why: 'La matière noire (~27 % de l\'univers) ne rayonne pas, mais son effet gravitationnel est visible sur les courbes de rotation galactiques.' },
  { cat: 'Cosmologie', q: 'Quel est l\'âge estimé de l\'univers ?',
    opts: ['4,6 milliards d\'années', '13,8 milliards d\'années', '10 milliards d\'années', '20 milliards d\'années'], a: 1,
    why: 'L\'âge de l\'univers est évalué à 13,8 milliards d\'années d\'après le fond diffus cosmologique et la constante de Hubble.' },
  // ── Astrophysique ──
  { cat: 'Astrophysique', q: 'Qu\'est-ce qu\'une étoile de type spectral O ?',
    opts: ['Froide et rouge', 'Chaude et bleue', 'Naine blanche', 'Géante orange'], a: 1,
    why: 'Les étoiles O sont les plus chaudes (>30 000 K), bleues, et les plus massives — elles vivent quelques millions d\'années.' },
  { cat: 'Astrophysique', q: 'Qu\'est-ce qu\'une nébuleuse planétaire ?',
    opts: ['Nuage d\'une jeune étoile', 'Enveloppe éjectée par une étoile mourante', 'Restes d\'une supernova', 'Un amas globulaire lointain'], a: 1,
    why: 'Quand une étoile de type solaire s\'éteint, elle éjecte ses couches externes — sans rapport avec les planètes.' },
  { cat: 'Astrophysique', q: 'Quelle est la magnitude apparente du Soleil ?',
    opts: ['-12,7', '-26,7', '-4,2', '1,0'], a: 1,
    why: 'Le Soleil a une magnitude de −26,7, de loin l\'astre le plus brillant du ciel.' },
  { cat: 'Astrophysique', q: 'Qu\'est-ce qu\'une Céphéide en astronomie ?',
    opts: ['Une étoile à neutrons', 'Une étoile variable pulsante indicatrice de distance', 'Une naine blanche froide', 'Un quasar proche'], a: 1,
    why: 'Les Céphéides pulsent avec une période liée à leur luminosité, permettant de mesurer des distances extragalactiques.' },
  { cat: 'Astrophysique', q: 'Quel est le type spectral du Soleil selon la classification de Harvard ?',
    opts: ['K5V', 'G2V', 'F0III', 'M4V'], a: 1,
    why: 'Le Soleil est une naine G2V — une étoile de milieu de vie, ni trop chaude ni trop froide.' },
  { cat: 'Astrophysique', q: 'Quel est le destin d\'une étoile 10 fois plus massive que le Soleil ?',
    opts: ['Naine blanche', 'Nébuleuse planétaire', 'Supernova puis étoile à neutrons ou trou noir', 'Géante rouge stable'], a: 2,
    why: 'Les étoiles très massives terminent en supernova, laissant une étoile à neutrons ou un trou noir selon leur masse finale.' },
  { cat: 'Astrophysique', q: 'Comment s\'appelle la couche superficielle visible du Soleil ?',
    opts: ['Chromosphère', 'Couronne', 'Photosphère', 'Zone radiative'], a: 2,
    why: 'La photosphère est la couche visible du Soleil, à ~5 778 K. C\'est d\'elle que provient la lumière que nous voyons.' },
  { cat: 'Astrophysique', q: 'Qu\'est-ce qu\'une étoile à neutrons ?',
    opts: ['Une étoile froide', 'Le résidu ultra-dense d\'une supernova, ~1,4 masse solaire pour 10 km de rayon', 'Une naine brune', 'Un trou noir de faible masse'], a: 1,
    why: 'Les étoiles à neutrons sont si denses qu\'une cuillère à café de leur matière pèserait ~1 milliard de tonnes.' },
  // ── Observation ──
  { cat: 'Observation', q: 'Que mesure l\'échelle de Bortle ?',
    opts: ['La magnitude des étoiles', 'La pollution lumineuse du ciel', 'La distance des galaxies', 'La phase lunaire'], a: 1,
    why: 'L\'échelle de Bortle (1–9) quantifie la noirceur du ciel, de 1 (parfait) à 9 (centre-ville).' },
  { cat: 'Observation', q: 'Qu\'est-ce que le « seeing » en astronomie ?',
    opts: ['La transparence du ciel', 'La turbulence atmosphérique', 'La pollution lumineuse', 'L\'humidité ambiante'], a: 1,
    why: 'Le seeing mesure la turbulence de l\'air, qui fait scintiller et brouiller les images.' },
  { cat: 'Observation', q: 'Dans quelle constellation se trouve la nébuleuse d\'Orion (M42) ?',
    opts: ['Taurus', 'Orion', 'Persée', 'Gémeaux'], a: 1,
    why: 'M42 est visible à l\'œil nu dans le baudrier d\'Orion — une pouponnière d\'étoiles à 1 344 al.' },
  { cat: 'Observation', q: 'Quel phénomène provoque la scintillation des étoiles mais pas des planètes ?',
    opts: ['La distance', 'Le diamètre apparent — les planètes sont des disques', 'La température', 'La phase lunaire'], a: 1,
    why: 'Les planètes ont un disque angulaire : la turbulence se moyenne, réduisant la scintillation.' },
  { cat: 'Observation', q: 'Quel est le grossissement maximum utile d\'un télescope de 200 mm d\'ouverture ?',
    opts: ['100×', '200×', '400×', '800×'], a: 2,
    why: 'La règle pratique est 2× le diamètre en mm : pour 200 mm → 400× max par temps parfait de seeing.' },
  { cat: 'Observation', q: 'Qu\'est-ce que la magnitude limite visuelle d\'un télescope ?',
    opts: ['Le grossissement maximum', 'La plus faible magnitude d\'étoile discernable', 'La distance maximale observable', 'Le champ de vue en degrés'], a: 1,
    why: 'Elle dépend du diamètre d\'ouverture : un télescope de 200 mm atteint ~13,5 mag par ciel parfait.' },
  // ── Histoire ──
  { cat: 'Histoire', q: 'En quelle année Edwin Hubble a-t-il prouvé l\'expansion de l\'univers ?',
    opts: ['1912', '1929', '1945', '1965'], a: 1,
    why: 'En 1929, Hubble publie la loi de récession des galaxies, preuve directe de l\'expansion cosmique.' },
  { cat: 'Histoire', q: 'Quelle mission a photographié Pluton en gros plan pour la première fois ?',
    opts: ['Cassini', 'Voyager 1', 'New Horizons', 'Dawn'], a: 2,
    why: 'New Horizons a survolé Pluton le 14 juillet 2015, révélant montagnes de glace et plaine Tombaugh.' },
  { cat: 'Histoire', q: 'En quelle année a eu lieu le premier alunissage habité ?',
    opts: ['1967', '1969', '1972', '1975'], a: 1,
    why: 'Apollo 11 s\'est posé sur la Lune le 20 juillet 1969 — Neil Armstrong fut le premier humain à marcher dessus.' },
  { cat: 'Histoire', q: 'Qui a proposé le modèle héliocentrique moderne en 1543 ?',
    opts: ['Galilée', 'Kepler', 'Copernic', 'Newton'], a: 2,
    why: 'Nicolas Copernic publie son modèle héliocentrique dans « De revolutionibus » en 1543, l\'année de sa mort.' },
  { cat: 'Histoire', q: 'Quelle est la première image directe d\'un trou noir, publiée en 2019 ?',
    opts: ['Sagittarius A*', 'M87*', 'Cygnus X-1', 'NGC 1277'], a: 1,
    why: 'Le projet Event Horizon Telescope a publié l\'image de M87* en avril 2019 — un trou noir de 6,5 milliards de masses solaires.' },
  { cat: 'Histoire', q: 'Quel télescope spatial a succédé à Hubble pour l\'observation infrarouge ?',
    opts: ['Spitzer', 'Chandra', 'James Webb', 'Kepler'], a: 2,
    why: 'JWST, lancé en décembre 2021 et opérationnel en 2022, observe dans l\'infrarouge depuis le point L2.' },
  // ── Instruments ──
  { cat: 'Instruments', q: 'Quel instrument a détecté des ondes gravitationnelles pour la première fois, en 2015 ?',
    opts: ['Hubble', 'ALMA', 'LIGO', 'VLT'], a: 2,
    why: 'LIGO a détecté la fusion de deux trous noirs le 14 septembre 2015, confirmant la relativité générale.' },
  { cat: 'Instruments', q: 'Que signifie l\'acronyme JWST ?',
    opts: ['James Webb Space Telescope', 'Joint Wide Survey Telescope', 'Jupiter Webb Space Tool', 'James Wren Star Telescope'], a: 0,
    why: 'JWST observe dans l\'infrarouge depuis le point L2, à 1,5 million de km de la Terre.' },
  { cat: 'Instruments', q: 'Qu\'est-ce que l\'aberration chromatique dans une lunette astronomique ?',
    opts: ['Vibrations dues au vent', 'Dispersion des couleurs par la lentille', 'Reflets parasites', 'Déformation du champ'], a: 1,
    why: 'Un objectif simple ne focalise pas toutes les longueurs d\'onde au même point, créant des halos colorés.' },
  { cat: 'Instruments', q: 'Quel satellite ESA mesure les parallaxes stellaires avec une précision sub-microseconde d\'arc ?',
    opts: ['Herschel', 'Gaia', 'Planck', 'XMM-Newton'], a: 1,
    why: 'Gaia a cartographié plus d\'un milliard d\'étoiles avec une précision angulaire jamais atteinte, révolutionnant l\'astrométrie.' },
  { cat: 'Instruments', q: 'Qu\'est-ce qu\'une monture équatoriale en astronomie ?',
    opts: ['Un trépied léger', 'Une monture dont un axe est parallèle à l\'axe terrestre', 'Un système de mise au point motorisé', 'Un type d\'oculaire'], a: 1,
    why: 'La monture équatoriale compense la rotation terrestre avec un seul axe (axe polaire), idéale pour le suivi et l\'astrophoto.' },
  { cat: 'Instruments', q: 'Que mesure un astromètre photométrique comme Kepler ou TESS ?',
    opts: ['Les distances par parallaxe', 'Les variations de luminosité d\'étoiles pour détecter des transits', 'Le spectre des étoiles', 'La position des astéroïdes'], a: 1,
    why: 'Kepler et TESS surveillent la luminosité de milliers d\'étoiles simultanément pour détecter le passage d\'exoplanètes.' },
  { cat: 'Instruments', q: 'Qu\'est-ce que le rapport focal (f/D) d\'un télescope ?',
    opts: ['La longueur du tube', 'La focale divisée par le diamètre', 'Le diamètre de l\'oculaire', 'L\'angle de champ'], a: 1,
    why: 'Un f/5 est lumineux (grand champ, poses courtes) ; un f/10 est lent mais offre un fort grossissement naturel.' },
]

const QUIZ_CATS = ['Tout', ...Object.keys(CAT_COLORS)]

function pickQuestions(n = 5, cat = 'Tout') {
  const pool = cat === 'Tout' ? QUIZ_POOL : QUIZ_POOL.filter(q => q.cat === cat)
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(n, pool.length))
}

// ─── Défis du jour : pool de 28, rotation par date ──────────────────────────

const DEFIS_POOL = [
  { title: 'Repérer le Triangle d\'été', pts: 50 },
  { title: 'Identifier Cassiopée (la grande W)', pts: 30 },
  { title: 'Trouver l\'étoile polaire sans aide', pts: 20 },
  { title: 'Estimer la magnitude limite du ciel', pts: 50 },
  { title: 'Observer les Pléiades à l\'œil nu', pts: 30 },
  { title: 'Dessiner la Lune à la lunette', pts: 60 },
  { title: 'Localiser la Grande Ourse complète', pts: 20 },
  { title: 'Trouver Jupiter dans le ciel du soir', pts: 40 },
  { title: 'Photographier un champ d\'étoiles', pts: 80 },
  { title: 'Identifier la constellation du Lion', pts: 40 },
  { title: 'Repérer Saturne et ses anneaux', pts: 60 },
  { title: 'Trouver M31 (Andromède) à l\'œil nu', pts: 70 },
  { title: 'Observer une étoile double au télescope', pts: 50 },
  { title: 'Compter les étoiles visibles dans les Pléiades', pts: 40 },
  { title: 'Identifier le Scorpion au sud de l\'horizon', pts: 50 },
  { title: 'Repérer Vénus au crépuscule', pts: 30 },
  { title: 'Trouver la nébuleuse d\'Orion (M42)', pts: 60 },
  { title: 'Identifier Bételgeuse et Rigel dans Orion', pts: 40 },
  { title: 'Observer la Voie Lactée à l\'œil nu', pts: 80 },
  { title: 'Trouver Mars à sa couleur rouge orangée', pts: 40 },
  { title: 'Repérer le Carré de Pégase', pts: 50 },
  { title: 'Identifier Arcturus, l\'étoile orange du printemps', pts: 30 },
  { title: 'Trouver l\'amas M44 (la Ruche)', pts: 60 },
  { title: 'Observer les cratères de la Lune gibbeuse', pts: 50 },
  { title: 'Repérer le Dauphin (constellation)', pts: 60 },
  { title: 'Identifier Sirius, étoile la plus brillante', pts: 20 },
  { title: 'Trouver M13, amas globulaire d\'Hercule', pts: 70 },
  { title: 'Observer une étoile filante par nuit dégagée', pts: 80 },
]

function getTodayDefi() {
  const day = Math.floor(Date.now() / 86400000)
  return DEFIS_POOL[day % DEFIS_POOL.length]
}

// ─── Persistance XP global ───────────────────────────────────────────────────

const XP_STORE = 'astror_xp_v1'
function xpLoad() { try { return JSON.parse(localStorage.getItem(XP_STORE)) || { total: 0, lastDefi: null } } catch { return { total: 0, lastDefi: null } } }
function xpSave(s) { try { localStorage.setItem(XP_STORE, JSON.stringify(s)) } catch {} }

function addXp(pts) {
  const prev = xpLoad()
  const next = { ...prev, total: (prev.total || 0) + pts }
  xpSave(next)
  return next
}

function defiDoneToday() {
  const today = new Date().toISOString().slice(0, 10)
  return xpLoad().lastDefi === today
}

function markDefiDone(pts) {
  const today = new Date().toISOString().slice(0, 10)
  const prev = xpLoad()
  const next = { total: (prev.total || 0) + pts, lastDefi: today }
  xpSave(next)
  return next
}

// ─── Persistance quiz ────────────────────────────────────────────────────────

const QUIZ_STORE = 'astror_quiz_v1'
function quizLoad() { try { return JSON.parse(localStorage.getItem(QUIZ_STORE)) || {} } catch { return {} } }
function quizSave(s) { try { localStorage.setItem(QUIZ_STORE, JSON.stringify(s)) } catch {} }

function recordQuiz(score) {
  const prev = quizLoad()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const streak = prev.lastDate === today ? (prev.streak || 1)
    : prev.lastDate === yesterday ? (prev.streak || 0) + 1
    : 1
  const saved = {
    streak,
    lastDate: today,
    bestScore: Math.max(prev.bestScore || 0, score),
    totalPlayed: (prev.totalPlayed || 0) + 1,
  }
  quizSave(saved)
  addXp(score * 10)
  return saved
}

// ─── Parcours pédagogiques avec leçons réelles ───────────────────────────────

const PARCOURS_DEF = [
  {
    id: 'stars', name: 'Premiers pas sous les étoiles',
    lessons: [
      { id: 's1', title: "S'orienter dans le ciel nocturne",
        body: "La première chose à faire sous un ciel étoilé est de trouver le Nord. Par nuit claire, repérez la Grande Ourse (les sept étoiles en forme de casserole). Prolongez mentalement l'axe des deux étoiles du « bord » du carré sur environ cinq fois cette distance : vous tombez sur l'Étoile polaire (Polaris), qui marque le Nord géographique à moins d'un degré.\n\nPolaris se trouve à la pointe de la Petite Ourse, constellation moins lumineuse. Une fois le Nord identifié, le Sud est derrière vous, l'Est à votre gauche, l'Ouest à votre droite.\n\nLaissez vos yeux s'adapter à l'obscurité pendant 20 à 30 minutes : la pupille se dilate et la rétine active ses bâtonnets, bien plus sensibles que les cônes. N'allumez jamais de lampe blanche — utilisez une lampe rouge pour préserver votre vision nocturne." },
      { id: 's2', title: "Les constellations : repères permanents",
        body: "Une constellation est une zone délimitée du ciel, non un groupe physique d'étoiles. L'Union Astronomique Internationale en reconnaît 88. Certaines sont visibles toute l'année depuis nos latitudes (circumpolaires), d'autres n'apparaissent qu'en certaines saisons.\n\nLes circumpolaires incontournables (depuis l'Europe) : Grande Ourse, Petite Ourse, Cassiopée (grand W), Céphée, Dragon. En hiver : Orion, Taureau, Gémeaux, Persée. Au printemps : Lion, Vierge, Bouvier. En été : Cygne, Lyra, Aigle (le Triangle d'été). En automne : Pégase, Andromède, Persée.\n\nCommencez par Orion en hiver : ses trois étoiles alignées (la ceinture) sont unmistakables. De là, suivez la ceinture vers le bas-gauche pour trouver Sirius, l'étoile la plus brillante du ciel." },
      { id: 's3', title: "La magnitude : mesurer la brillance",
        body: "La magnitude apparente mesure la brillance d'un astre telle que nous la percevons depuis la Terre. L'échelle est logarithmique et inversée : plus la valeur est basse (ou négative), plus l'astre est brillant.\n\nRepères pratiques : Soleil −26,7 · Lune pleine −12,7 · Vénus jusqu'à −4,8 · Sirius −1,46 · étoiles visibles à l'œil nu jusqu'à +6 · limite des jumelles 10×50 : +10 · limite d'un télescope 200 mm : +14.\n\nLa différence entre deux magnitudes se calcule avec un rapport de 2,512 : une étoile de mag 1 est 100 fois plus brillante qu'une étoile de mag 6. La magnitude absolue, elle, mesure la luminosité intrinsèque de l'astre, ramenée à une distance standard de 10 parsecs." },
      { id: 's4', title: "La Lune : premier objet à observer",
        body: "La Lune est l'objet idéal pour débuter : elle est brillante, grande et ne demande aucun matériel. À l'œil nu, repérez les mers (zones sombres, basaltiques) et les hautes terres (zones claires, cratérisées).\n\nAux jumelles ou à la lunette, observez le terminateur — la ligne entre la zone éclairée et la zone dans l'ombre. C'est là que le relief est le plus spectaculaire car les ombres sont rasantes. Le cratère Tycho (sud) avec son système de rayons, Copernicus et Clavius sont parmi les plus beaux.\n\nLa Lune passe par plusieurs phases en 29,5 jours (mois synodique) : nouvelle Lune, croissant, premier quartier, gibbeuse croissante, pleine Lune, puis décroissante. Pour l'astronomie du ciel profond, favorisez les nuits sans Lune : sa lumière réduit les contrastes sur les nébuleuses et galaxies." },
      { id: 's5', title: "Les planètes visibles à l'œil nu",
        body: "Cinq planètes sont visibles à l'œil nu et connues depuis l'Antiquité : Mercure, Vénus, Mars, Jupiter, Saturne. On les reconnaît à leur lumière stable (elles ne scintillent presque pas, contrairement aux étoiles) et à leur déplacement lent sur fond de constellations.\n\nVénus est la plus brillante (jusqu'à −4,8 mag) et toujours proche du Soleil — visible en soirée à l'ouest ou le matin à l'est. Jupiter (jusqu'à −2,9 mag) est souvent le deuxième objet le plus brillant après Vénus. Mars se reconnaît à sa teinte rouge-orangée. Saturne a une lumière légèrement dorée.\n\nMercure est difficile à observer car toujours proche de l'horizon au coucher ou lever du soleil. Les meilleures périodes sont ses élongations maximales (≈ 18–28° du Soleil)." },
      { id: 's6', title: "Météores, étoiles filantes et comètes",
        body: "Une étoile filante (météore) est un grain de poussière de quelques milligrammes qui se vaporise dans l'atmosphère à 80–120 km d'altitude. Pendant les pluies de météores (essaims), la Terre traverse le sillage de poussières laissé par une comète.\n\nLes essaims annuels incontournables : Perséides (12 août, jusqu'à 100/h, radiant dans Persée) · Géminides (14 décembre, jusqu'à 120/h, les plus actives) · Léonides (17 novembre, variables mais parfois spectaculaires) · Quadrantides (3 janvier, pic court mais intense).\n\nUne comète est un corps de glace et de poussières de quelques kilomètres. En s'approchant du Soleil, la glace se sublime et forme une chevelure (coma) et une queue. Les comètes brillantes (C/2022 E3, Tsuchinshan-ATLAS…) sont imprévisibles et font la une des actualités astronomiques quand elles apparaissent." },
      { id: 's7', title: "Le ciel qui change avec les saisons",
        body: "La Terre orbite autour du Soleil en un an : notre planète regarde vers des régions différentes de l'univers selon la saison. C'est pourquoi Orion est une constellation d'hiver (en été, elle est du côté du Soleil, donc invisible la nuit).\n\nEn pratique, le ciel avance d'environ 2 heures par mois à la même heure : ce qui était au méridien à 22 h en janvier sera au méridien à 20 h en février. On dit que la sphère céleste « avance » de 1° par jour.\n\nLes objets circumpolaires (proches du pôle nord céleste) ne se couchent jamais sous nos latitudes (>48°N) : Grande Ourse, Cassiopée, Céphée, Dragon sont visibles toute l'année. En été, la Voie Lactée est particulièrement belle au zénith entre 22 h et 2 h du matin, en direction du Sagittaire où se trouve le centre galactique." },
      { id: 's8', title: "Préparer sa première nuit d'observation",
        body: "Une bonne session d'observation se prépare en amont. Vérifiez la météo (transparence et seeing), la phase de la Lune, et les objets visibles depuis votre position. Les applications comme SkySafari, Stellarium ou l'onglet Éphémérides d'Astror vous donneront les horaires de lever/coucher et les positions.\n\nMatériel essentiel : lampe rouge (préserve la vision nocturne), carte du ciel imprimée ou tablette, couverture ou vêtements chauds (la température chute rapidement), thermos. Si vous utilisez un télescope, sortez-le 30 à 60 minutes avant pour l'acclimatation thermique.\n\nChoisissez un site à l'écart des lumières, avec un horizon dégagé vers le sud. Les meilleures nuits combinent : ciel dégagé sans vent, humidité faible, Lune absente, et un site Bortle ≤ 4. Notez vos observations dans un journal (outil Observer dans Astror) pour suivre vos progrès." },
    ],
  },
  {
    id: 'map', name: 'Lire une carte du ciel',
    lessons: [
      { id: 'm1', title: "Les coordonnées célestes : AR et déclinaison",
        body: "Pour repérer un objet dans le ciel, les astronomes utilisent un système de coordonnées équivalent à la longitude et la latitude terrestre.\n\nL'ascension droite (AR) joue le rôle de la longitude : elle est mesurée en heures (de 0 h à 24 h) vers l'est, à partir du point vernal (intersection de l'équateur céleste et de l'écliptique au printemps). La déclinaison (Déc) joue le rôle de la latitude : mesurée en degrés de −90° (pôle sud céleste) à +90° (pôle nord céleste), 0° étant l'équateur céleste.\n\nExemple : M42, la nébuleuse d'Orion, est à AR 5 h 35 min, Déc −5°23'. Ces coordonnées sont fixes dans le repère céleste et permettent de pointer n'importe quel objet avec une monture équatoriale motorisée." },
      { id: 'm2', title: "Le méridien et la culmination",
        body: "Le méridien est un grand cercle imaginaire qui passe par le pôle nord céleste, le zénith (point au-dessus de votre tête) et le point sud de l'horizon. Chaque astre passe au méridien une fois par jour — c'est la culmination.\n\nLa culmination est le moment idéal pour observer : l'astre est à son maximum de hauteur, ce qui minimise la traversée de l'atmosphère (et donc les distorsions). Plus un objet culmine haut, mieux c'est.\n\nPour une étoile de déclinaison Déc depuis une latitude L, la hauteur à la culmination est : H = 90° − |L − Déc|. Depuis Paris (L = 48,8°N), Sirius (Déc = −16,7°) culmine à seulement 24,5° — observable mais bas. Deneb (Déc = +45,3°) culmine à 86,5° — presque au zénith." },
      { id: 'm3', title: "Lire un planisphère",
        body: "Un planisphère est une carte du ciel double disque : le disque du fond montre toutes les constellations, le disque rotatif du dessus comporte une fenêtre ovale représentant l'horizon. En alignant la date (sur le bord extérieur) avec l'heure (sur le bord du disque), la fenêtre révèle exactement le ciel visible à ce moment.\n\nPour l'utiliser : tenez-le au-dessus de votre tête, orienté face au nord. Le centre du planisphère correspond au zénith, et le bord de la fenêtre correspond à votre horizon. Les constellations sont alors orientées dans le même sens que ce que vous voyez dans le ciel.\n\nChoisissez un planisphère adapté à votre latitude (Paris ≈ 48°N, Lyon ≈ 45°N). Les planisphères pour 50°N ne sont pas adaptés pour les régions méditerranéennes. Le planisphère ne montre pas les planètes, qui se déplacent sur l'écliptique." },
      { id: 'm4', title: "Les coordonnées horizontales : hauteur et azimut",
        body: "En parallèle des coordonnées équatoriales (AR/Déc), les coordonnées horizontales décrivent la position d'un astre par rapport à votre horizon local.\n\nL'azimut est l'angle horizontal mesuré depuis le Nord (0°) vers l'Est, le Sud (180°) puis l'Ouest (360°). La hauteur (ou altitude) est l'angle vertical depuis l'horizon (0°) jusqu'au zénith (90°). Un objet à azimut 180° et hauteur 45° se trouve au sud, à mi-chemin entre l'horizon et le zénith.\n\nCes coordonnées changent en permanence au fil du temps et dépendent de l'observateur. Elles sont utiles pour planifier une session ('Jupiter se lève à l'est à 22 h, à hauteur 20°') mais pas pour pointer un télescope à monture équatoriale. Les applications comme Stellarium affichent les deux systèmes simultanément." },
      { id: 'm5', title: "Le catalogue Messier et le ciel profond",
        body: "En 1781, l'astronome Charles Messier publie un catalogue de 110 objets nébuleux afin de ne pas les confondre avec les comètes qu'il chassait. Ce catalogue est devenu la liste de référence des objets du ciel profond pour les amateurs.\n\nLe catalogue comprend : 40 galaxies (M31 Andromède, M51 Tourbillon, M81/M82…), 28 amas globulaires (M13 Hercule, M3, M5…), 27 nébuleuses et restes de supernovae (M42 Orion, M1 Crabe, M57 Anneau…), amas ouverts, et quelques objets inclassables.\n\nLe défi Messier (observer les 110 objets en une nuit au printemps, quand ils sont tous visibles) est un rite de passage pour les astronomes amateurs. Avec des jumelles 10×50, une trentaine sont accessibles depuis un ciel Bortle 4." },
      { id: 'm6', title: "Utiliser une application de carte du ciel",
        body: "Les applications de planétarium sur smartphone ont révolutionné l'observation. Stellarium (gratuit, open-source), SkySafari, ou l'onglet Ciel d'Astror permettent d'identifier instantanément n'importe quel astre en pointant l'écran vers le ciel.\n\nFonctionnalités à maîtriser : le mode temps réel (utilise le GPS et le gyroscope), la simulation temporelle (accélérer/reculer le temps), la recherche d'objet par nom ou coordonnées, l'affichage de la Voie Lactée et de l'écliptique, les éphémérides de lever/coucher.\n\nConseils pratiques : passez l'interface en mode nuit (écran rouge) pour préserver votre vision nocturne. Calibrez la boussole à l'écart des objets métalliques. Sur Astror, l'onglet Ciel affiche la carte avec boussole AR et un filtre par type d'objet (planètes, amas, nébuleuses, galaxies)." },
    ],
  },
  {
    id: 'scope', name: 'Choisir et régler son télescope',
    lessons: [
      { id: 'sc1', title: "Lunette ou télescope : les différences fondamentales",
        body: "Une lunette astronomique (réfracteur) forme l'image par réfraction à travers un objectif en verre. Un télescope (réflecteur) utilise un miroir primaire concave pour collecter la lumière. Chacun a ses avantages.\n\nLunette : image contrastée et nette (idéale pour la Lune et les planètes), étanche, peu d'entretien. Inconvénient : aberration chromatique (halos colorés) sur les modèles simples, et le diamètre est limité par le poids et le coût du verre. Les achromats doubles (ED ou APO) corrigent cela mais coûtent plus cher.\n\nTélescope Newton (miroir parabolique) : le plus grand diamètre pour le budget, idéal pour le ciel profond. Inconvénient : nécessite une collimation régulière. Le Schmidt-Cassegrain (SCT) est compact malgré une longue focale — polyvalent, idéal pour les appartements. Pour débuter avec un budget limité, un Newton 150/750 ou 200/1000 sur monture équatoriale est un excellent choix." },
      { id: 'sc2', title: "L'ouverture et la focale : paramètres clés",
        body: "L'ouverture (diamètre du miroir ou de l'objectif) est le paramètre le plus important. Elle détermine la quantité de lumière collectée et le pouvoir de résolution. Un 200 mm collecte ~1 630 fois plus de lumière que l'œil nu (pupille 7 mm).\n\nLa focale (distance entre le miroir et le point focal) détermine le grossissement obtenu avec un oculaire donné : grossissement = focale du télescope ÷ focale de l'oculaire. Un Newton 200/1000 avec un oculaire de 10 mm donne 100×.\n\nLe rapport focal f/D = focale ÷ diamètre. Un f/5 est « lumineux » (champ large, bonnes poses courtes en photo), un f/10 est « lent » (fort grossissement naturel, bon pour les planètes). La magnitude limite théorique dépend uniquement de l'ouverture : m ≈ 2 + 5 × log(D en mm). Pour D = 200 mm : m ≈ 13,5." },
      { id: 'sc3', title: "Les montures : alt-azimutale vs équatoriale",
        body: "La monture est souvent plus importante que l'optique. Elle doit être stable et permettre un suivi facile des astres.\n\nMonture alt-azimutale (AltAz) : deux axes, vertical (azimut) et horizontal (hauteur). Simple et intuitive. Suffisante pour l'observation visuelle, mais nécessite un dérotateur de champ pour l'astrophoto longue pose. La monture Dobson (alt-az de grande taille) est la reine du rapport diamètre/prix.\n\nMonture équatoriale (EQ) : un axe (polaire) est aligné parallèlement à l'axe de rotation terrestre. Un seul moteur sur l'axe polaire compense la rotation terrestre — idéal pour le suivi et l'astrophoto. Plus lourde et complexe à mettre en œuvre, mais indispensable pour la photographie du ciel profond. La monture EQ3 ou EQ5 motorisée est un excellent point de départ." },
      { id: 'sc4', title: "Les oculaires : grossissement et champ",
        body: "L'oculaire est l'interface entre le télescope et votre œil. Sa qualité impacte directement la netteté et le confort d'observation. Le grossissement est : G = F_télescope ÷ F_oculaire.\n\nChamp apparent et réel : un oculaire à grand champ apparent (68° à 100°) donne une sensation d'immersion. Le champ réel = champ apparent ÷ grossissement. Pour un Newton 200/1000 avec un Nagler 13 mm (82°) : G = 77×, champ réel = 1,06°.\n\nGrossissement maximum utile : 2× le diamètre en mm (400× pour un 200 mm). Au-delà, l'image est grande mais floue et sombre. Grossissement minimum utile : G_min = D/7 (environ 29× pour 200 mm). Commencez avec un oculaire basse puissance (25–32 mm) pour centrer l'objet, puis montez en grossissement. Trois oculaires couvrent tous les besoins : 25 mm (faible), 10 mm (moyen), 5 mm ou barlow 2× (fort)." },
      { id: 'sc5', title: "La collimation d'un télescope Newton",
        body: "La collimation est l'alignement optique du miroir secondaire (petit miroir plat) et du miroir primaire (grand miroir concave). Sur un Newton, elle doit être vérifiée régulièrement (après chaque transport).\n\nOutils nécessaires : un oculaire de collimation (Cheshire ou laser). Procédure en trois étapes : 1) Centrer le reflet du miroir primaire dans le secondaire (vis du porte-secondaire). 2) Centrer le secondaire dans le focaliseur (vis de réglage du secondaire). 3) Centrer le point focal dans le primaire en agissant sur les vis de réglage du miroir principal.\n\nSigne d'une mauvaise collimation : les étoiles défocalisées ne sont pas des anneaux concentriques mais un disque asymétrique. Une collimation parfaite donne des anneaux de diffraction parfaitement centrés. Prenez le temps de bien la faire : même un excellent miroir donne de mauvais résultats si mal collimaté." },
      { id: 'sc6', title: "L'acclimatation thermique",
        body: "Quand vous sortez votre télescope d'une pièce chauffée vers l'extérieur froid, le miroir ou l'objectif est plus chaud que l'air ambiant. Cette différence de température crée des courants d'air locaux qui dégradent les images — on parle de « tube seeing ».\n\nLe temps d'acclimatation dépend de la masse de verre et de la différence de température : compter 30 min pour une petite lunette, 60 à 90 min pour un télescope à miroir de 200 mm, et jusqu'à 2 h pour un grand Dobson.\n\nAstuces pour accélérer : sortez le télescope ouvert pour favoriser la circulation d'air, évitez d'observer à travers du verre de fenêtre (double effet thermique), et installez un petit ventilateur derrière le miroir primaire des Newton pour forcer le renouvellement de l'air." },
      { id: 'sc7', title: "L'alignement polaire",
        body: "Pour une monture équatoriale, l'alignement polaire (pointer l'axe polaire vers le pôle nord céleste = Polaris) est indispensable pour que le suivi soit précis.\n\nAlignement rapide (observation visuelle) : réglez l'azimut et la latitude de la monture pour que le cherche-pole ou le viseur polaire pointe vers Polaris. C'est suffisant pour observer visuellement et faire des poses photographiques courtes (<30 s).\n\nAlignement précis (astrophoto longue pose) : utilisez la méthode de Bigourdan (déplacer une étoile au méridien avec les axes de la monture jusqu'à ce qu'elle reste centrée) ou un logiciel d'alignement polaire assisté (SharpCap, PoleMaster, NINA). Un bon alignement permet des poses de 5 à 10 minutes sans dérive notable." },
      { id: 'sc8', title: "L'entretien du matériel optique",
        body: "Un télescope bien entretenu dure des décennies. Quelques règles simples suffisent.\n\nProtection : rangez toujours avec les bouchons sur les optiques. Évitez les chocs et les vibrations. Stockez dans un endroit sec et sans poussière. Pour les Newton, laissez le tube fermé avec un couvercle percé pour éviter la condensation.\n\nNettoyage des optiques : à éviter autant que possible. La poussière sur un miroir ou un objectif a très peu d'impact sur les images — un miroir poussiéreux reste excellent. Si nettoyage nécessaire, utilisez une poire soufflante puis un chiffon microfibre humidifié d'alcool isopropylique en douceur. Ne jamais frotter sec. Pour les miroirs aluminisés, un nettoyage maladroit peut rayer le revêtement définitivement." },
      { id: 'sc9', title: "Chercheur et pointage : trouver les objets",
        body: "Le pointage (trouver un objet dans le champ de l'oculaire) est souvent la première difficulté des débutants. Le chercheur est une petite lunette ou un point rouge (Red Dot Finder) fixé sur le tube et aligné avec l'axe optique principal.\n\nAlignez d'abord le chercheur de jour sur un objet lointain. La nuit, commencez toujours avec le plus faible grossissement (oculaire 25–32 mm) pour avoir le plus grand champ.\n\nDeux techniques de pointage : le Star-Hopping (sauter d'étoile brillante en étoile brillante en suivant des patterns géométriques jusqu'à la cible) est la méthode manuelle classique. Le Go-To (monture motorisée avec base de données d'objets) pointe automatiquement après un alignement sur 2–3 étoiles de référence. Les débutants progressent plus vite avec le star-hopping car ils apprennent le ciel en même temps." },
      { id: 'sc10', title: "Acheter son premier instrument : guide pratique",
        body: "Le meilleur télescope est celui qu'on utilise. Évitez les instruments de grande surface qui vantent des grossissements fantaisistes (600×, 800×) avec un petit objectif de 60 mm — ils donnent des images floues et décevantes.\n\nPour un budget de 150–300 € : lunette 70/900 ou Newton 114/900 sur monture EQ2 motorisée — correct pour la Lune et les planètes. Budget 300–600 € : Newton 150/750 ou 200/1000 sur EQ3/EQ5 motorisée — excellents pour tout. Budget 600–1 000 € : Dobson 250/1200 ou Newton sur HEQ5 — ciel profond exceptionnel.\n\nPrivilégiez les revendeurs spécialisés (Astroshop, Pierro-Astro, Téléscope Service) qui offrent un SAV sérieux. Le marché de l'occasion (Webastro forum) est une excellente option pour accéder à du matériel de qualité à moindre coût. Rejoignez un club astronomique local : vous pourrez tester différents instruments avant d'acheter." },
    ],
  },
  {
    id: 'photo', name: "Initiation à l'astrophoto",
    lessons: [
      { id: 'p1', title: "Les bases de la photographie numérique",
        body: "En astrophotographie, vous contrôlez trois paramètres fondamentaux : la sensibilité ISO, l'ouverture (f/D), et le temps de pose.\n\nISO : augmenter l'ISO amplifie le signal mais aussi le bruit électronique. En astrophoto, on utilise des ISO élevés (800–6400) pour capturer les objets faibles, mais au prix d'un bruit plus marqué. Le capteur chaud en longue pose ajoute un bruit thermique supplémentaire.\n\nTemps de pose : en astrophoto, on ne parle pas de 1/500 s mais de 30 s, 2 min, 5 min ou plus. Plus la pose est longue, plus le signal accumulé est important — mais aussi plus le bruit thermique s'accumule. La solution : additionner (empiler) de nombreuses poses courtes plutôt qu'une seule très longue. 30 poses de 2 min = bien mieux qu'une seule pose de 60 min." },
      { id: 'p2', title: "Choisir son appareil photo",
        body: "Trois grandes familles d'appareils pour l'astrophoto :\n\nDSLR / Mirrorless du commerce : le point d'entrée le plus accessible. Utilisez le mode Bulb pour des poses de durée arbitraire. Le mode RAW est indispensable. Un DSLR défiltré (modification interne) améliore la sensibilité à l'hydrogène-alpha (Hα) pour les nébuleuses rouges — mais rend l'appareil moins pratique pour la photo classique.\n\nCaméra couleur dédiée (ASI294MC, QHY268C…) : refroidissement thermoélectrique (−35°C en dessous de l'ambiant) qui réduit drastiquement le bruit thermique. Pas d'obturateur mécanique — pilotage par logiciel. Le format est souvent plus petit (capteur APS-C ou 4/3).\n\nCaméra mono dédiée : capteur noir et blanc ultra sensible, utilisé avec des filtres (L, R, G, B ou Ha, OIII, SII). Technique avancée mais qualité d'image maximale, notamment pour la narrowband." },
      { id: 'p3', title: "La mise au point sur les étoiles",
        body: "La mise au point (MAP) est critique en astrophoto : une légère imprécision rend les étoiles floues et asymétriques. Elle doit être refaite à chaque session et peut dériver avec les changements de température.\n\nMéthode manuelle sur étoile brillante : zoomez à 10× sur l'écran Live View, ajustez le focaliseur jusqu'à obtenir l'étoile la plus petite et la plus brillante possible. Difficile à l'œil mais suffisant pour débuter.\n\nMask de Bahtinov : masque à trois fentes placé devant l'objectif qui crée un motif de diffraction en étoile. La MAP est correcte quand le pic central est parfaitement centré entre les deux pics latéraux. Simple, fiable, très populaire. Méthode logicielle (Half-Flux Diameter, HFD) : logiciels comme Sharpcap, NINA ou Ekos affichent un indice numérique de mise au point et peuvent automatiser le processus avec un focaliseur motorisé." },
      { id: 'p4', title: "Photographier la Lune",
        body: "La Lune est la cible idéale pour débuter : pas besoin de suivi, lumière abondante, résultats spectaculaires rapidement.\n\nModes recommandés : en afocal (smartphone contre l'oculaire), vous pouvez obtenir de bonnes images de la Lune entière. En prime focus (appareil photo directement au foyer du télescope), l'échelle est parfaite pour les détails.\n\nParamètres typiques au foyer d'un 200/1000 : ISO 100–400, poses de 1/500 à 1/2 000 s selon la phase. Le terminateur (limite ombre/lumière) révèle le relief avec des ombres rasantes spectaculaires. Les détails maximaux s'obtiennent en pleine Lune pour les rayons de Tycho, et au quartier pour le relief cratérisé. Empilez une vidéo de quelques secondes (plusieurs centaines de frames) avec AutoStakkert ou PIPP pour obtenir des images d'une netteté exceptionnelle." },
      { id: 'p5', title: "Photographier les planètes",
        body: "Les planètes demandent un fort grossissement et un seeing excellent. On travaille en vidéo haute cadence (50–200 images/s) puis on sélectionne et empile les meilleures frames.\n\nMatériel optimal : caméra planétaire rapide (ASI224MC, ASI462MC), barlow 2× ou 3×, télescope à longue focale. Les conditions de seeing sont prépondérantes — mieux vaut 50 mm d'ouverture par nuit de seeing parfait que 400 mm par nuit turbulente.\n\nLogiciels : AutoStakkert!3 ou PIPP pour le prétraitement et l'empilement des meilleures frames (tri par qualité), RegiStax 6 ou Siril pour les wavelets (rehaussement des détails fins). Jupiter révèle ses bandes nuageuses et la Grande Tache Rouge, Saturne ses anneaux avec divisions, Mars ses calottes polaires et albédos de surface." },
      { id: 'p6', title: "Les nébuleuses et galaxies : longues poses",
        body: "Le ciel profond (nébuleuses, galaxies, amas globulaires) demande un suivi précis et l'accumulation de nombreuses poses. Ces objets ont une luminosité de surface très faible — plusieurs heures de temps de pose cumulé sont souvent nécessaires.\n\nChaîne de travail typique : 1) Visez et centrez l'objet. 2) Mettez au point. 3) Alignement polaire précis. 4) Lancez une série de poses de 2 à 5 min (selon les conditions et l'objet). 5) Entre les séries, faites des frames de calibration.\n\nPour M42 (nébuleuse d'Orion), des poses de 30 s à 1 min suffisent — elle est très brillante. Pour M81 (galaxie de la Grande Ourse), il faut 2 à 4 h de poses totales. Pour les nébu­leuses en émission (Rosette, Cœur, Âme), les filtres H-alpha permettent de travailler même par pleine Lune ou en ciel urbain." },
      { id: 'p7', title: "Le guidage automatique",
        body: "Même un alignement polaire parfait laisse une dérive résiduelle : après quelques minutes, les étoiles se déplacent légèrement, traçant des traits sur l'image. Le guidage automatique corrige en temps réel cette dérive.\n\nPrincipe : une caméra de guidage observe une étoile guide (sur un chercheur ou un prisme off-axis). Un logiciel (PHD2, le plus populaire) mesure le déplacement de l'étoile guide et envoie des corrections à la monture plusieurs fois par seconde.\n\nMatériel nécessaire : une lunette guide (60–80 mm de focale suffit) ou un prisme off-axis (OAG), une caméra de guidage (ASI120MM, QHY5L-II…), et un câble ST-4 ou connexion USB. PHD2 est gratuit et dispose d'un assistant de configuration très bien guidé. Avec un bon guidage, des poses de 5 à 10 min sans étoiles filées sont courantes." },
      { id: 'p8', title: "Les frames de calibration",
        body: "Pour obtenir une image propre, il faut soustraire les défauts du capteur et du système optique. On prend à part des images de calibration :\n\nDarks : expositions de même durée et même ISO que les lights, avec le bouchon sur l'objectif. Capturent le courant d'obscurité (bruit thermique). Doivent être pris à la même température que les lights.\n\nBias (offset) : poses très courtes (1/4 000 s) qui capturent le signal de lecture du capteur. Utilisés pour calibrer les darks si les températures diffèrent (méthode scaled darks).\n\nFlats : expositions sur une surface uniformément éclairée (panneau LED, ciel crépusculaire) qui révèlent les poussières sur le capteur et le vignettage. Doivent être pris avec la même configuration optique (même mise au point, même oculaire). En pratique, 20 darks, 20 bias et 20 flats suffisent pour une calibration correcte." },
      { id: 'p9', title: "L'empilement d'images",
        body: "L'empilement (stacking) consiste à combiner de nombreuses poses pour réduire le bruit aléatoire. Mathématiquement, empiler N images divise le bruit par √N : 16 poses → bruit divisé par 4.\n\nLogiciels : Siril (gratuit, multiplateforme), DeepSkyStacker (DSS, Windows, gratuit), PixInsight (payant, professionnel).\n\nProcédure dans Siril : 1) Calibration automatique avec les darks/bias/flats. 2) Enregistrement (alignement) des poses sur les étoiles. 3) Empilement avec rejet de sigma (élimine les rayons cosmiques et les passages de satellites). 4) Post-traitement. Le résultat est une image 32 bits par canal, à fort rapport signal/bruit, prête pour le traitement." },
      { id: 'p10', title: "Traitement basique avec Siril",
        body: "Siril est le logiciel libre de référence pour le traitement astrophoto. Après l'empilement, l'image résultante est linéaire (très sombre) — il faut l'étirer pour révéler les détails.\n\nÉtapes de base : 1) Retrait du gradient de fond de ciel (Background Extraction). 2) Calibration des couleurs (Color Calibration ou Photometric Color Calibration). 3) Étirement de l'histogramme : utilisez AutoStretch comme point de départ puis ajustez manuellement avec le transfert d'histogramme. 4) Rehaussement du signal : StarNet++ (sépare les étoiles du fond) + Unsharp Mask sur la nébuleuse, puis recombinez.\n\nÉvitez le sur-traitement : une bonne image astrophoto doit paraître naturelle, avec des étoiles rondes et un fond de ciel propre. L'erreur la plus courante est d'écraser le bruit au point de perdre les détails fins dans les zones faibles." },
      { id: 'p11', title: "Balance des couleurs et esthétique",
        body: "La balance des couleurs est la touche finale qui donne son caractère à une image. En broadband (LRGB), l'objectif est une couleur naturelle proche de ce que l'œil humain verrait si la nébuleuse était beaucoup plus brillante. En narrowband (Ha/OIII/SII), on choisit une palette :\n\nPalette Hubble (SHO : SII→rouge, Ha→vert, OIII→bleu) : les couleurs de référence des images HST — rouges chauds et bleu-vert profond. Palette naturelle (HOO : Ha→rouge, OIII→vert, OIII→bleu) : donne des tons roses-rouges et bleu-vert plus doux.\n\nTravaillez dans un espace de couleur linéaire avant l'étirement, puis passez en log ou gamma pour le rendu final. Réduisez les étoiles trop dominantes (StarReducer) si elles écrêtent sur la nébuleuse. L'objectif : équilibrer la nébuleuse et les étoiles pour une lecture facile de la structure." },
      { id: 'p12', title: "Partager et progresser",
        body: "Publier ses images est une étape importante : les retours de la communauté sont précieux pour progresser. Plusieurs plateformes accueillent les astrophotos amateurs.\n\nAstrobin (astrobin.com) est la référence internationale : chaque image est accompagnée du matériel utilisé, des temps de pose et du traitement. L'algorithme de mise en avant récompense la qualité technique. Les groupes nationaux (Webastro.net en France) sont d'excellents espaces d'échange et de critique constructive.\n\nPour progresser, analysez les images des meilleurs : décomposez leur traitement (beaucoup publient leurs scripts Siril ou PixInsight). Rejoignez les star parties et rencontres d'astro-imageurs. Tenez un carnet de vos sessions (outil Observer dans Astror) avec les paramètres, les problèmes rencontrés et les solutions trouvées — c'est la meilleure façon de ne pas répéter les mêmes erreurs." },
    ],
  },
]

// ─── Persistance parcours (par leçons lues) ──────────────────────────────────

const PARCOURS_STORE = 'astror_parcours_v2'

function parcoursLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(PARCOURS_STORE)) || {}
    return PARCOURS_DEF.map(p => ({
      ...p,
      read: new Set(saved[p.id] || []),
      pct: Math.round(((saved[p.id] || []).length / p.lessons.length) * 100),
    }))
  } catch {
    return PARCOURS_DEF.map(p => ({ ...p, read: new Set(), pct: 0 }))
  }
}

function markLessonRead(parcours, parcoursId, lessonId) {
  const updated = parcours.map(p => {
    if (p.id !== parcoursId) return p
    const read = new Set([...p.read, lessonId])
    const pct = Math.round((read.size / p.lessons.length) * 100)
    return { ...p, read, pct }
  })
  try {
    const obj = {}
    updated.forEach(p => { obj[p.id] = [...p.read] })
    localStorage.setItem(PARCOURS_STORE, JSON.stringify(obj))
  } catch {}
  // bonus XP pour la première lecture
  addXp(15)
  return updated
}

// ─── Contenus statiques (enrichis par APOD dynamique) ───────────────────────

const EDU_CONTENT = [
  { cat: 'Histoire', title: 'De Galilée au télescope spatial', read: '6 min',
    questions: [
      "Quelles découvertes de Galilée ont le plus bouleversé la science de son époque ?",
      "Comment le télescope Hubble a-t-il changé notre vision de l'univers ?",
      "En quoi James Webb est-il supérieur à Hubble, concrètement ?",
      "Quels sont les grands jalons de l'histoire de l'instrumentation astronomique ?",
    ],
    body: 'En 1609, Galilée pointe sa lunette vers le ciel et bouleverse l\'astronomie : les cratères de la Lune, les phases de Vénus et les quatre lunes de Jupiter — Io, Europe, Ganymède, Callisto — prouvent que tous les astres ne tournent pas autour de la Terre.\n\nDeux siècles plus tard, William Herschel cartographie la Voie Lactée et découvre Uranus (1781), première planète identifiée à l\'instrument. En 1924, Hubble mesure la distance d\'Andromède et révèle que l\'univers est peuplé de milliards de galaxies.\n\nL\'ère spatiale s\'ouvre en 1957 avec Spoutnik, puis Hubble Space Telescope (1990) montre des galaxies à 12 milliards d\'années-lumière. En 2022, James Webb franchit une nouvelle frontière : infrarouge, cryogénie à −233 °C, miroir de 6,5 m déployé à 1,5 million de km de la Terre. Il capture la lumière des tout premières galaxies formées 300 millions d\'années après le Big Bang.\n\nChaque génération d\'instruments agrandit l\'univers observable. Ce qui était invisible devient visible — et chaque nouvelle fenêtre révèle que la réalité dépasse toujours les modèles.' },
  { cat: 'Cosmologie', title: 'Le Big Bang en cinq idées', read: '7 min',
    questions: [
      "Que s'est-il passé dans les toutes premières secondes après le Big Bang ?",
      "Comment le fond diffus cosmologique (CMB) prouve-t-il le Big Bang ?",
      "Qu'est-ce que l'inflation cosmique et pourquoi est-elle nécessaire au modèle ?",
      "Quelle est la différence entre matière ordinaire, matière noire et énergie noire ?",
    ],
    body: 'L\'univers a commencé par un état extrêmement chaud et dense il y a 13,8 milliards d\'années. Ce n\'est pas une explosion dans l\'espace, mais une expansion de l\'espace lui-même.\n\n1. La fuite des galaxies. Hubble (1929) mesure que toutes les galaxies lointaines s\'éloignent de nous à une vitesse proportionnelle à leur distance. Rembobinons : tout converge vers une singularité.\n\n2. Le fond diffus cosmologique. En 1965, Penzias et Wilson captent accidentellement un rayonnement à 2,7 K uniforme dans tout le ciel. C\'est la chaleur résiduelle du Big Bang, émise 380 000 ans après le début quand l\'univers est devenu transparent.\n\n3. La nucléosynthèse primordiale. Dans les trois premières minutes, les protons et neutrons fusionnent et forgent hydrogène (75 %), hélium-4 (25 %) et des traces de lithium — exactement l\'abondance observée dans les étoiles les plus vieilles.\n\n4. L\'inflation cosmique. Une microseconde après le Big Bang, l\'univers aurait subi une expansion exponentielle fulgurante, expliquant son homogénéité et sa platitude géométrique.\n\n5. L\'énergie noire. Depuis 1998, les supernovas Ia révèlent que l\'expansion accélère. Une énergie mystérieuse (68 % du contenu de l\'univers) contrecarre la gravité. Sa nature reste inconnue.' },
  { cat: 'Astrophysique', title: 'Comment naissent les étoiles', read: '5 min',
    questions: [
      "Combien de temps met une étoile comme le Soleil à se former complètement ?",
      "Qu'est-ce qu'un disque protoplanétaire et comment les planètes s'y forment-elles ?",
      "Pourquoi les étoiles très massives vivent-elles bien moins longtemps que les naines rouges ?",
      "Quelle sera la fin de vie du Soleil dans 5 milliards d'années ?",
    ],
    body: 'Les étoiles naissent dans les nuages moléculaires géants — de vastes réservoirs de gaz froid (∼10 K) et de poussière qui s\'étendent sur des centaines d\'années-lumière. La nébuleuse d\'Orion, visible à l\'œil nu, en est l\'exemple le plus proche à 1 350 al.\n\nUnder des perturbations (onde de choc de supernova, collision galactique), une région du nuage s\'effondre sous l\'effet de la gravité. Elle se fragmente en grumeaux qui s\'échauffent en se contractant : c\'est la proto-étoile, encore entourée d\'une enveloppe de gaz et de poussière qui formera un disque protoplanétaire.\n\nQuand la température au cœur atteint 10 millions de kelvins, la fusion de l\'hydrogène s\'amorce. La pression de radiation équilibre la gravité : l\'étoile entre dans la séquence principale — le stade stable qui durera de quelques millions d\'années (pour les plus massives) à des dizaines de milliards d\'années (pour les naines rouges).\n\nNotre Soleil est une étoile de type G2V, à mi-vie depuis 4,6 milliards d\'années. Dans 5 milliards d\'années, il gonflera en géante rouge, engloutissant peut-être la Terre, avant de finir en nébuleuse planétaire puis naine blanche.' },
  { cat: 'Découvertes', title: 'La tension de Hubble', read: '6 min',
    questions: [
      "Qu'est-ce que la constante de Hubble et pourquoi est-elle si importante ?",
      "Pourquoi l'écart de 5σ entre les deux mesures de H₀ est-il si troublant ?",
      "Les mesures de JWST sur les Céphéides ont-elles résolu la tension de Hubble ?",
      "Quelles nouvelles théories physiques pourraient expliquer cet écart ?",
    ],
    body: 'Comment mesure-t-on l\'expansion de l\'univers ? La constante de Hubble H₀ donne le taux d\'expansion en km/s par mégaparsec (Mpc). Deux méthodes indépendantes donnent aujourd\'hui des valeurs statistiquement incompatibles.\n\nMéthode 1 — l\'échelle de distances cosmiques. On enchaîne des indicateurs : parallaxe stellaire → Céphéides → supernovas Ia. La collaboration SH0ES (2022) obtient H₀ = 73,0 ± 1,0 km/s/Mpc.\n\nMéthode 2 — le fond diffus cosmologique. Le satellite Planck mesure les fluctuations du CMB (carte de l\'univers à 380 000 ans) et extrapole H₀ = 67,4 ± 0,5 km/s/Mpc en utilisant le modèle ΛCDM standard.\n\nL\'écart est de ~5σ. En science, 5σ, c\'est le seuil de découverte. Si ce n\'est pas une erreur systématique (biais dans les mesures de distance, contamination du CMB), cela signifierait que la physique standard est incomplète : énergie noire variable, interactions avec des neutrinos stériles, ou nouvelle physique dans l\'univers primordial.\n\nJWST apporte de nouvelles mesures des Céphéides. Les résultats préliminaires confortent la valeur haute (∼73). Le mystère reste entier — et passionnant.' },
]

// ─── Glossaire astronomique ──────────────────────────────────────────────────

const GLOSSAIRE = [
  { term: 'Albédo', cat: 'Photométrie',
    def: 'Fraction de lumière réfléchie par une surface. La Lune a un albédo de ~12 %, Vénus de ~65 %.',
    detail: "L'albédo se mesure entre 0 (absorption totale) et 1 (réflexion parfaite). On distingue l'albédo de Bond A_B, qui intègre toutes les longueurs d'onde et toutes les directions, et l'albédo géométrique p, mesuré à opposition. La relation entre les deux fait intervenir la fonction de phase : A_B = p·q. La Lune a p ≈ 0,12 (très sombre), Vénus p ≈ 0,65 (nuages sulfuriques hautement réfléchissants), la Terre p ≈ 0,30. En planétologie, albédo + diamètre angulaire contraignent le diamètre réel d'un corps trop petit pour être résolu. Les comètes ont un albédo de seulement ~0,04 — parmi les objets les plus sombres du système solaire." },

  { term: 'Apogée', cat: 'Mécanique céleste',
    def: 'Point de l\'orbite lunaire (ou d\'un satellite) le plus éloigné de la Terre. Opposé : périgée.',
    detail: "En mécanique orbitale, la distance à l'apogée vaut r_a = a(1+e), où a est le demi-grand axe et e l'excentricité. À l'apogée, la vitesse orbitale est minimale (conservation du moment cinétique : v_a × r_a = v_p × r_p). Pour la Lune, r_a ≈ 405 400 km contre r_p ≈ 362 600 km. La précession de la ligne des apsides (rotation lente de l'axe apogée-périgée) est un effet perturbatif dû à l'aplatissement terrestre et à l'attraction du Soleil — sa période est de ~8,85 ans pour la Lune. Pour les orbites solaires, les termes équivalents sont aphélie et périhélie." },

  { term: 'Ascension droite', cat: 'Coordonnées célestes',
    def: 'Coordonnée céleste équivalente à la longitude, mesurée en heures (0 h à 24 h) vers l\'est.',
    detail: "L'ascension droite (α) se mesure depuis le point vernal γ (nœud ascendant de l'écliptique sur l'équateur céleste) vers l'est, en heures-minutes-secondes. 1h = 15° exactement. Ce point γ se déplace lentement à cause de la précession des équinoxes (~50,3 arcsec/an), ce qui oblige à préciser l'époque des coordonnées (J2000.0, J2050.0…). Une monture équatoriale suit le mouvement diurne en AR à vitesse sidérale de 15 arcsec/s. Combinée à la déclinaison, l'AR permet de pointer n'importe quel objet du ciel indépendamment de la latitude de l'observateur." },

  { term: 'Astéroïde', cat: 'Corps du système solaire',
    def: 'Petit corps rocheux du système solaire, principalement dans la ceinture principale entre Mars et Jupiter.',
    detail: "La ceinture principale s'étend de 2,2 à 3,2 UA et contient plus d'un million d'objets de diamètre > 1 km. Sa masse totale est infime (~4 % de la Lune), ce qui exclut toute formation planétaire perturbée par Jupiter. Les astéroïdes sont classés par composition spectrale : type C (carbonés, sombres, ~75 %), type S (silicatés, brillants, ~17 %), type M (métalliques). La mission DART (2022) a démontré qu'un impact cinétique peut dévier l'orbite d'un petit corps (Dimorphos). Les familles d'astéroïdes (Hilda, Troyens…) sont piégées en résonances orbitales avec Jupiter." },

  { term: 'Bortle (échelle de)', cat: 'Observation',
    def: 'Échelle de 1 à 9 mesurant la pollution lumineuse du ciel. Bortle 1 = ciel parfait, Bortle 9 = centre-ville.',
    detail: "Proposée par John Bortle en 2001, l'échelle quantifie la luminance du fond de ciel (en mag/arcsec²). Bortle 1 correspond à une luminance > 21,7 mag/arcsec² (Voie Lactée projetant des ombres), Bortle 9 à < 17,5 mag/arcsec² (seules quelques centaines d'étoiles visibles). La limite de magnitude à l'œil nu passe de ~7,6 à < 4. En France métropolitaine, moins de 1 % du territoire atteint Bortle ≤ 3. Pour l'astrophoto du ciel profond, les nébuleuses à émission (Hα) restent accessibles en Bortle 6-7 avec des filtres passe-bande étroits (3–7 nm)." },

  { term: 'Céphéide', cat: 'Astrophysique stellaire',
    def: 'Étoile variable pulsante dont la période est liée à la luminosité. Sert d\'indicateur de distance cosmique.',
    detail: "Les Céphéides sont des supergéantes jaunes-blanches (F–K) qui pulsent en raison du mécanisme κ : l'hélium ionisé deux fois (He II) absorbe l'énergie, se dilate, puis se refroidit et se contracte périodiquement. La relation période-luminosité (découverte par Henrietta Leavitt en 1912) lie P à L : log L = a·log P + b. Les périodes vont de 1 à 70 jours pour des luminosités 1 000 à 30 000 L☉. Elles ont permis à Hubble de mesurer la distance d'Andromède (1924) et de prouver l'existence des galaxies extérieures. La tension de Hubble actuelle repose en partie sur les incertitudes dans l'étalonnage des Céphéides." },

  { term: 'Chromosphère', cat: 'Physique solaire',
    def: 'Couche de l\'atmosphère solaire visible lors des éclipses totales, d\'une couleur rose-rouge caractéristique.',
    detail: "La chromosphère s'étend de 500 à ~2 000 km au-dessus de la photosphère, avec une température qui monte paradoxalement de ~4 400 K à ~25 000 K (problème du chauffage coronal). Sa couleur rouge-rose est due à la raie Hα à 656,3 nm de l'hydrogène atomique. Elle est structurée en spicules (jets de gaz de ~10 000 km de haut, durée de vie 5–15 min) et en filaments. La transition chromosphère-couronne s'effectue dans la région de transition, couche de 100 km à peine où la température bondit de 30 000 K à plus de 1 million de K. En astrophoto, les filtres Hα à bande étroite permettent d'imager la chromosphère solaire depuis le sol." },

  { term: 'Comète', cat: 'Corps du système solaire',
    def: 'Corps de glace et de poussière qui développe une chevelure (coma) et une queue en s\'approchant du Soleil.',
    detail: "Le noyau cométaire (quelques km à quelques dizaines de km) est composé d'eau, CO₂, CO, poussières silicatées et matière organique. À l'approche du Soleil, la sublimation crée une coma gazeuse de ~100 000 km. Le vent solaire ionise une partie du gaz et forme la queue ionique (bleue, pointée à l'opposé du Soleil) ; la pression de radiation pousse les poussières dans la queue de poussière (blanche-jaune, courbée). Les comètes à courte période (< 200 ans) viennent de la ceinture de Kuiper ; les comètes à longue période du nuage d'Oort (~50 000 UA). La mission Rosetta (ESA, 2014-2016) a orbiré la comète 67P/Churyumov-Gerasimenko et détecté des acides aminés dans sa coma." },

  { term: 'Conjonction', cat: 'Mécanique céleste',
    def: 'Alignement apparent de deux astres ou plus sur la même droite vue depuis la Terre.',
    detail: "En conjonction inférieure, une planète intérieure (Mercure, Vénus) se trouve entre la Terre et le Soleil ; en conjonction supérieure, elle est de l'autre côté du Soleil. Les conjonctions entre planètes extérieures et le Soleil rendent l'observation impossible. Une conjonction rapprochée de deux planètes (moins d'1°) est spectaculaire à l'œil nu. La grande conjonction Jupiter-Saturne de décembre 2020 (0,1° de séparation) était la plus proche depuis 1623. Les conjonctions de la Lune avec les planètes brillantes sont fréquentes (~mensuel) et idéales pour initier des débutants au repérage céleste." },

  { term: 'Coronagraphe', cat: 'Instrumentation',
    def: 'Instrument masquant le disque solaire pour observer la couronne ou les exoplanètes proches de leur étoile.',
    detail: "Inventé par Bernard Lyot en 1930, le coronagraphe interne occulte le disque stellaire et bloque la lumière diffusée par optique de Lyot. Les coronagraphes externes (oculteur hors-axe) permettent des séparations angulaires plus grandes. Le contraste requis pour imager une exoplanète est de 10⁻⁹ à 10⁻¹⁰ pour une Terre-analogue, contre 10⁻⁵ pour un Jupiter chaud. JWST embarque le coronagraphe NIRCam (contraste ~10⁻⁵) et MIRI. Le futur télescope spatial Nancy Grace Roman visera 10⁻⁹ pour la chasse aux exoplanètes directement imagées. Les coronagraphes solaires (LASCO sur SOHO) permettent le suivi continu des éjections de masse coronale (CME)." },

  { term: 'Déclinaison', cat: 'Coordonnées célestes',
    def: 'Coordonnée céleste équivalente à la latitude, mesurée en degrés (−90° à +90°) depuis l\'équateur céleste.',
    detail: "La déclinaison (δ) est la distance angulaire au nord (+) ou au sud (-) de l'équateur céleste. Un astre culmine à une hauteur h = 90° − |φ − δ| au méridien, avec φ la latitude de l'observateur. Les objets circumpolaires (visibles toute la nuit) satisfont |δ| > 90° − φ. Pour un observateur à Paris (φ = 48,9°), tout objet avec δ > 41,1° est circumpolaire. La déclinaison du Soleil varie entre +23,5° (solstice juin) et −23,5° (solstice décembre). La précession des équinoxes modifie la déclinaison des étoiles d'environ 20 arcsec/an, d'où l'importance d'utiliser des catalogues d'époque récente." },

  { term: 'Écliptique', cat: 'Mécanique céleste',
    def: 'Plan de l\'orbite terrestre autour du Soleil. Les planètes du système solaire sont toutes proches de ce plan.',
    detail: "L'écliptique est incliné de 23,44° sur l'équateur céleste (obliquité de l'écliptique), responsable des saisons. Toutes les planètes du système solaire orbitent dans un plan proche de l'écliptique (Mercure : 7°, Vénus : 3,4°, Neptune : 1,8°), résidu du disque protoplanétaire originel. La latitude écliptique β et la longitude écliptique λ forment un système de coordonnées commode pour les éphémérides planétaires. L'obliquité varie lentement entre 22,1° et 24,5° sur un cycle de ~41 000 ans (cycles de Milanković), influençant les glaciations. Les nœuds lunaires (intersections de l'orbite de la Lune avec l'écliptique) contrôlent la survenue des éclipses." },

  { term: 'Élongation', cat: 'Mécanique céleste',
    def: 'Angle entre un astre et le Soleil vu depuis la Terre. Vénus atteint au maximum ~47° d\'élongation.',
    detail: "L'élongation maximale (greatest elongation) se produit quand la ligne de visée est tangente à l'orbite de la planète inférieure. Pour Vénus, elle est de 45–47° selon la position de Vénus sur son orbite elliptique ; pour Mercure, de 18° à 28°. À grande élongation, la planète est visible plusieurs heures avant le coucher ou après le lever du Soleil. La configuration quadrature (élongation = 90°) concerne les planètes supérieures. Pour les comètes et astéroïdes, le suivi de l'élongation permet de planifier les fenêtres d'observation loin du fond de ciel solaire." },

  { term: 'Équinoxe', cat: 'Mécanique céleste',
    def: 'Moment de l\'année où le Soleil passe sur l\'équateur céleste. Durée nuit = durée jour. Deux par an.',
    detail: "Aux équinoxes, la déclinaison du Soleil est nulle et le Soleil se lève exactement à l'est, se couche exactement à l'ouest, partout sur Terre. L'équinoxe vernal (point γ) est le zéro de l'ascension droite et de la longitude écliptique. La date des équinoxes varie de quelques jours à cause des années bissextiles et de la précession. L'équinoxe de mars tombe entre le 19 et le 21 mars. La légère asymétrie de durée du jour et de la nuit autour de l'équinoxe provient de la réfraction atmosphérique (~0,5°) et du fait que le Soleil n'est pas ponctuel (disque de 0,5°). Les équinoxes marquent aussi la transition de visibilité de nombreux objets du ciel profond entre hémisphères." },

  { term: 'Exoplanète', cat: 'Exoplanètes',
    def: 'Planète en orbite autour d\'une autre étoile que le Soleil. Plus de 5 500 confirmées en 2024.',
    detail: "La première exoplanète confirmée autour d'une étoile de type solaire, 51 Peg b, a été découverte en 1995 par Mayor et Queloz (prix Nobel 2019) via la méthode des vitesses radiales. Les quatre méthodes principales sont : vitesses radiales (variation Doppler de l'étoile, ~20 % des détections), transits photométriques (Kepler/TESS, ~75 %), imagerie directe (<1 %), et microlentille gravitationnelle. Le satellite TESS a découvert plus de 7 000 candidats depuis 2018. JWST analyse les atmosphères par spectroscopie de transmission : CO₂ détecté sur WASP-39 b (2022). La zone habitable (liquid water zone) est définie par l'équilibre entre flux stellaire et albédo ; un facteur 2 en flux représente la différence Terre-Mars." },

  { term: 'Fond diffus cosmologique', cat: 'Cosmologie',
    def: 'Rayonnement fossile à 2,7 K émis 380 000 ans après le Big Bang, preuve clé du modèle standard.',
    detail: "Le CMB (Cosmic Microwave Background) est un corps noir quasi parfait à T = 2,7255 K, découvert accidentellement par Penzias et Wilson (1965). Ses fluctuations de température (ΔT/T ≈ 10⁻⁵) reflètent les inhomogénéités primordiales qui ont donné naissance aux structures cosmiques. Planck (ESA, 2009-2013) a cartographié ces fluctuations à une résolution de 5 arcmin, contraignant les paramètres cosmologiques à 1 % de précision : Ω_m = 0,315, Ω_Λ = 0,685, H₀ = 67,4 km/s/Mpc. Les pics acoustiques du spectre de puissance (position du 1er pic à l = 220) prouvent la géométrie plate de l'univers. La polarisation du CMB (modes E et B) sonde l'inflation cosmique primordiale." },

  { term: 'Géocroiseur', cat: 'Corps du système solaire',
    def: 'Astéroïde dont l\'orbite croise celle de la Terre. Surveillés pour les risques d\'impact potentiel.',
    detail: "Les NEAs (Near-Earth Asteroids) sont définis par un périhélie < 1,3 UA. Les géocroiseurs au sens strict (demi-grand axe > 1 UA, périhélie < 1,017 UA) sont les Apollon et Aten. La NASA et l'ESA maintiennent des programmes de surveillance (Spaceguard, Catalina Sky Survey) qui ont catalogué plus de 35 000 NEAs. L'énergie libérée par un impact est E = ½mv², proportionnelle à m et v² : un astéroïde de 140 m libère ~300 Mt TNT. Le système DART a dévié Dimorphos de 33 minutes sur sa période orbitale (2022), preuve de concept d'une défense planétaire cinétique. L'astéroïde Apophis (340 m) passera à 31 000 km de la Terre en 2029 — sans risque d'impact." },

  { term: 'Héliocentrisme', cat: 'Histoire de l\'astronomie',
    def: 'Modèle astronomique plaçant le Soleil au centre du système planétaire, défendu par Copernic dès 1543.',
    detail: "Copernic publie son De revolutionibus orbium coelestium en 1543, proposant un Soleil central et des planètes en orbites circulaires. Ce modèle simplifie la description des rétrogradations planétaires (expliquées par la combinaison des mouvements terrestres et planétaires) mais ne prédit pas mieux que Ptolémée avec ses épicycles. Kepler (1609) abandonne les cercles au profit des ellipses et établit ses trois lois. Galilée (1610) apporte des preuves observationnelles : phases de Vénus, lunes de Jupiter. Newton (1687) donne le fondement dynamique avec sa loi de gravitation universelle. L'héliocentrisme strict est une approximation : le barycentre Soleil-Jupiter est légèrement en dehors du Soleil." },

  { term: 'Hubble (loi de)', cat: 'Cosmologie',
    def: 'Les galaxies s\'éloignent d\'autant plus vite qu\'elles sont lointaines : v = H₀ × d (H₀ ≈ 70 km/s/Mpc).',
    detail: "Établie en 1929 par Hubble à partir des mesures de Céphéides, la loi v = H₀ × d est la preuve observationnelle de l'expansion de l'univers. H₀ est la constante de Hubble, actuellement objet d'une tension : Planck/CMB donne H₀ = 67,4 km/s/Mpc, les Céphéides+supernovas Ia donnent 73,0 km/s/Mpc (tension à 5σ). À z > 1 (décalage spectral), la loi linéaire cède la place à des corrections relativistes — la vitesse de récession peut dépasser c car c'est l'espace lui-même qui s'étend. La distance de Hubble c/H₀ ≈ 14,3 Gpc est l'ordre de grandeur de la taille de l'univers observable. Le paramètre de décélération q₀ = −Ω_Λ/2 + Ω_m/2 est négatif (q₀ ≈ −0,55) : l'expansion accélère." },

  { term: 'Infrarouge', cat: 'Physique / Instrumentation',
    def: 'Rayonnement électromagnétique au-delà du rouge visible. JWST observe dans l\'infrarouge proche et moyen.',
    detail: "Le domaine infrarouge s'étend de 0,75 µm (fin du visible) à ~1 mm (début des micro-ondes). On le divise en proche (NIR : 0,75–2,5 µm), moyen (MIR : 2,5–25 µm) et lointain (FIR : 25–350 µm). L'atmosphère terrestre est transparente dans quelques fenêtres (bandes J, H, K, L, M à 1,25/1,65/2,2/3,5/5 µm) mais opaque dans le MIR, ce qui impose l'observation spatiale. JWST opère de 0,6 à 28 µm avec un miroir refroidi à 40 K (NIRCam/NIRSpec) et un détecteur MIRI à 7 K. L'IR permet de pénétrer les nuages de poussière interstellaire (τ_IR ≪ τ_visible), d'observer les proto-étoiles, et de détecter le rayonnement décalé vers le rouge des galaxies primordiales (z > 10)." },

  { term: 'Libration', cat: 'Mécanique céleste',
    def: 'Oscillation apparente de la Lune qui permet d\'observer légèrement plus de 50 % de sa surface au total.',
    detail: "La Lune présente toujours la même face à cause du verrouillage de marée (rotation synchrone), mais trois types de librations permettent d'observer ~59 % de la surface totale. La libration en longitude (±7,9°) résulte de l'excentricité de l'orbite : la rotation uniforme de la Lune est légèrement décalée par rapport à son mouvement orbital non-uniforme (2ᵉ loi de Kepler). La libration en latitude (±6,7°) vient de l'inclinaison de l'équateur lunaire sur l'écliptique. La libration diurne (±1°) est un effet de parallaxe lié à la rotation terrestre. Ces oscillations sont prévisibles à la seconde près et permettent de planifier les observations des régions limbaires." },

  { term: 'Luminosité absolue', cat: 'Astrophysique stellaire',
    def: 'Quantité d\'énergie réellement émise par un astre, indépendamment de sa distance. Mesurée en magnitude absolue.',
    detail: "La luminosité absolue L est la puissance totale rayonnée, exprimée en watts ou en L☉ (L☉ = 3,828 × 10²⁶ W). La magnitude absolue M est définie comme la magnitude apparente qu'aurait l'objet à 10 pc : M = m − 5 log(d/10 pc). La relation L/L☉ = 10^(0,4(M☉−M)) relie les deux. Pour les étoiles de la séquence principale, la relation masse-luminosité vaut L ∝ M^3,5–4. La bolométrie corrige la luminosité de toutes les longueurs d'onde ; la correction bolométrique BC varie de ~0 (étoiles G) à −5 (étoiles O très chaudes). Les modules de distance (m − M) permettent de remonter aux distances dans le cas de chandelles standard (supernovas Ia, Céphéides)." },

  { term: 'Magnitude', cat: 'Photométrie',
    def: 'Échelle logarithmique de brillance. Plus la valeur est basse (ou négative), plus l\'astre est brillant.',
    detail: "L'échelle de magnitude est héritée d'Hipparque (~150 av. J.-C.). Pogson (1856) la formalise : une différence de 5 magnitudes correspond exactement à un rapport de flux 100. Donc 1 magnitude = facteur 10^0,4 ≈ 2,512. La magnitude limite à l'œil nu est ~6–6,5 ; des jumelles 10×50 atteignent ~9,5 ; un télescope de 200 mm ~13,5 ; HST ~31,5. La magnitude du Soleil est −26,7, de Sirius −1,46, de Pluton +14,2. La magnitude de surface (mag/arcsec²) quantifie la brillance des objets étendus (nébuleuses, galaxies). Le filtre photométrique doit être précisé : magnitudes B, V, R, I, J, H, K selon la bande spectrale." },

  { term: 'Méridien (passage au)', cat: 'Observation',
    def: 'Moment où un astre atteint sa hauteur maximale dans le ciel, en traversant le méridien local. Idéal pour observer.',
    detail: "Le méridien céleste est le grand cercle passant par le zénith, le nadir et les pôles célestes. Au passage au méridien, un astre culmine à une hauteur h_max = 90° − |φ − δ| (pour δ < φ + 90°). C'est le moment où la masse d'air (airmass = 1/cos(z) avec z l'angle zénithal) est minimale, donc l'absorption atmosphérique et la turbulence sont au minimum. En astrophoto planétaire ou haute résolution, on cible systématiquement la fenêtre ±30 min autour du méridien. Les observatoires professionnels ont souvent un 'flip de méridien' sur les montures équatoriales à fourche, nécessitant un basculement de la configuration à ce moment." },

  { term: 'Météorite', cat: 'Corps du système solaire',
    def: 'Fragment de météoroïde ayant survécu à la traversée atmosphérique et atteint le sol terrestre.',
    detail: "Les météorites se classent en trois familles : chondrites (~86 %), représentatives de la composition primitive du système solaire ; achondrites (~8 %), fragments d'astéroïdes différenciés ; et météorites de fer (~5 %), noyaux métalliques d'anciens planétésimaux. Les chondrites contiennent des chondres (sphérules de silicates fondus) et des inclusions CAI (calcium-aluminium) âgées de 4,567 milliards d'années — les plus vieux solides du système solaire. 99 % des météorites antarctiques sont des chondrites ordinaires ; parmi les exceptions rares : 260 météorites martiennes (SNC) identifiées et ~400 météorites lunaires. L'énergie de pénétration atmosphérique crée le phénomène de boule de feu (fireball) et l'onde de choc — l'événement de Tcheliabinsk (2013, ~20 m) a libéré ~500 kt." },

  { term: 'Naine blanche', cat: 'Astrophysique stellaire',
    def: 'Résidu dense d\'une étoile de faible masse après sa mort. Taille de la Terre, masse solaire.',
    detail: "Une naine blanche est soutenue par la pression de dégénérescence des électrons, non par la fusion nucléaire. Sa densité est ~10⁶ g/cm³ (une cuillère à café pèse ~1 tonne). La masse maximale est la limite de Chandrasekhar : M_Ch = 1,44 M☉ — au-delà, la pression électronique ne peut résister à la gravité. La composition est principalement CO (carbone-oxygène) issu de la fusion de l'He. La naine blanche refroidit lentement sur des milliards d'années vers une naine noire hypothétique. En binaire serrée, l'accrétion de matière d'une compagne peut porter la masse à M_Ch et déclencher une supernova de type Ia (standard candle cosmologique). Sirius B est la naine blanche la plus proche (8,6 al)." },

  { term: 'Nébuleuse', cat: 'Milieu interstellaire',
    def: 'Nuage de gaz et de poussière interstellaire. Peut être émission (HII), réflexion, absorption ou planétaire.',
    detail: "Les nébuleuses HII (régions ionisées par des étoiles OB voisines) émettent principalement en Hα (rouge), OIII (vert-bleu) et SII (rouge profond). Les nébuleuses de réflexion diffusent la lumière d'une étoile proche sans l'ioniser (souvent bleues car la diffusion de Rayleigh favorise le bleu). Les nébuleuses obscures (Barnard 68, piliers de la Création) sont des nuages denses opaques visibles en absorption. Les nébuleuses planétaires sont des enveloppes éjectées par des étoiles de type solaire mourantes (M57, M27) — leur nom est trompeur, sans rapport avec les planètes. L'Hα filtre le continuum et rend accessible la photographie depuis des sites pollués." },

  { term: 'Opposition', cat: 'Mécanique céleste',
    def: 'Configuration où une planète supérieure est à l\'opposé du Soleil vu de la Terre — idéale pour observer.',
    detail: "À l'opposition, une planète extérieure est à son point le plus proche de la Terre (distance minimale) et visible toute la nuit (se lève au coucher du Soleil, culmine à minuit, se couche à l'aube). L'opposition périhélique, quand la planète est proche de son périhélie au moment de l'opposition, offre les meilleures conditions : Mars est à 55,7 millions de km lors d'une opposition périhélique (2003 : 55,76 Mkm, record historique récent) contre 101 Mkm lors d'une opposition aphélique. La fréquence des oppositions dépend de la période synodique : Mars s'oppose tous les ~26 mois, Jupiter tous les ~13 mois, Saturne tous les ~12,5 mois. L'opposition magnétique (surge d'opposition) est un bref éclat de brillance à opposé exact dû à l'opposition de rétrodiffusion de la lumière." },

  { term: 'Parallaxe', cat: 'Astrométrie',
    def: 'Décalage apparent d\'un objet proche selon le point d\'observation. Base de la mesure des distances stellaires.',
    detail: "La parallaxe trigonométrique stellaire p est l'angle sous lequel on voit le demi-grand axe de l'orbite terrestre (1 UA) depuis l'étoile. La distance d = 1/p [parsecs] si p est en arcsec. Hipparcos (ESA, 1989-1993) a mesuré ~120 000 étoiles jusqu'à ~300 pc avec une précision de 1 mas. Gaia (ESA, 2013-) mesure plus d'un milliard d'étoiles jusqu'à ~10 kpc avec une précision de 10–25 µas, révolutionnant la cartographie de la Voie Lactée. La parallaxe est à la base de l'échelle de distances cosmiques : elle calibre les Céphéides, qui calibrent les supernovas Ia, qui calibrent H₀. Au-delà de ~5 kpc, les erreurs statistiques de Gaia deviennent comparables à la parallaxe elle-même." },

  { term: 'Parsec', cat: 'Astrométrie',
    def: 'Unité de distance : 3,26 années-lumière, soit 3,086 × 10¹³ km. La mesure de référence en astrophysique.',
    detail: "Un parsec est défini comme la distance à laquelle 1 UA sous-tend un angle de 1 arcseconde (parallaxe annuelle). Mathématiquement : 1 pc = 1 UA / tan(1\") ≈ 1 UA / 1\" = 206 265 UA = 3,0857 × 10¹³ km = 3,2616 al. L'étoile la plus proche (Proxima Centauri) est à 1,295 pc. Le centre galactique est à ~8,2 kpc (kiloparsecs). La Voie Lactée a un diamètre de ~30 kpc. Les groupes et amas de galaxies se mesurent en Mpc (mégaparsecs) : Andromède est à 0,765 Mpc. L'univers observable (~14,2 Gpc) s'exprime en gigaparsecs." },

  { term: 'Périgée', cat: 'Mécanique céleste',
    def: 'Point de l\'orbite lunaire (ou d\'un satellite) le plus proche de la Terre. Super Lune = pleine Lune au périgée.',
    detail: "La distance périgée vaut r_p = a(1−e). Pour la Lune, r_p ≈ 362 600 km. À ce point, la vitesse orbitale est maximale. La « Super Lune » est une pleine Lune ou nouvelle Lune coïncidant avec un périgée à moins de 90 % du périgée minimum annuel : elle apparaît ~14 % plus grande et ~30 % plus lumineuse qu'à l'apogée. Le terme n'est pas officiel en astronomie. Pour les satellites artificiels en LEO (Low Earth Orbit), le périgée détermine la durée de vie : sous ~200 km, le freinage atmosphérique résiduel cause une rentrée rapide. L'injection en orbite de transfert de Hohmann s'effectue en deux impulsions : l'une au périgée initial, l'autre à l'apogée cible." },

  { term: 'Planète naine', cat: 'Corps du système solaire',
    def: 'Corps suffisamment massif pour être sphérique, mais n\'ayant pas « nettoyé » son orbite. Ex : Pluton, Éris.',
    detail: "La définition de l'UAI (2006) exige trois critères pour une planète : orbiter le Soleil, avoir une forme quasi sphérique (hydrostatique), et avoir « nettoyé » son voisinage orbital. Pluton échoue au 3ᵉ critère (paramètre Λ ≈ 0,077 ; la Terre a Λ ≈ 2,1 × 10⁵). Les cinq planètes naines reconnues sont Pluton, Éris, Makémaké, Hauméa et Cérès. Éris (2326 km) est légèrement plus petite que Pluton (2377 km) mais plus massive (1,27 M_Pluton) en raison d'une densité plus élevée. Des centaines d'objets trans-neptuniens (TNOs) pourraient remplir les critères d'une planète naine — les estimations vont de 50 à plusieurs centaines d'objets non encore découverts." },

  { term: 'Point de Lagrange', cat: 'Mécanique céleste',
    def: 'Position d\'équilibre gravitationnel dans un système à deux corps. JWST orbite autour du point L2 Soleil-Terre.',
    detail: "Les cinq points de Lagrange L1–L5 sont les solutions d'équilibre du problème restreint à trois corps (Euler/Lagrange, 1772). L1 et L2 sont sur la ligne Soleil-Terre à ~1,5 million de km (rayon de la sphère de Hill ≈ (M_Terre/3M_Soleil)^(1/3) × 1 UA). L3 est sur la même ligne mais de l'autre côté du Soleil. L1 et L2 sont instables (durée de vie sans correction d'orbite ~23 jours) ; JWST et SOHO nécessitent des manœuvres régulières. L4 et L5, précédant et suivant la planète à 60° sur l'orbite, sont stables si M_primaire/M_secondaire > 24,96 : Jupiter y accumule ses troyens (~7 000 astéroïdes connus). La mission LISA (gravitationnel) orbitera autour de L4/L5 Terre-Soleil." },

  { term: 'Précession', cat: 'Mécanique céleste',
    def: 'Lent balancement de l\'axe de rotation terrestre, d\'une période de ~26 000 ans. Modifie l\'étoile polaire.',
    detail: "La précession des équinoxes est causée par le couple gravitationnel exercé par le Soleil et la Lune sur le renflement équatorial terrestre (aplatissement f = 1/298). La vitesse de précession est ~50,3 arcsec/an, pour une période complète de ~25 772 ans. Dans ~12 000 ans, l'étoile polaire sera Véga (α Lyrae). La précession est combinée à la nutation (oscillation de l'axe de ~9 arcsec et période 18,6 ans liée aux nœuds lunaires). La précession du périhélie de Mercure (~43 arcsec/siècle inexpliqués par la mécanique newtonienne) a été le premier test de la relativité générale d'Einstein (1915)." },

  { term: 'Pulsar', cat: 'Astrophysique stellaire',
    def: 'Étoile à neutrons émettant des faisceaux radio périodiques. Horloge naturelle parmi les plus précises.',
    detail: "Un pulsar est une étoile à neutrons (rayon ~10 km, masse ~1,4 M☉, densité ~10¹⁴ g/cm³) dont le champ magnétique intense (10⁸–10¹² T) canalise le rayonnement en deux faisceaux. La rotation rapide (milliseconde à quelques secondes) balaye le ciel comme un phare. Le premier pulsar (CP 1919) fut découvert par Jocelyn Bell en 1967. Les pulsars milliseconde (MSP, période ~1–10 ms) sont les horloges naturelles les plus stables : une précision de 10⁻¹⁵ en fréquence relative, comparable aux meilleures horloges atomiques. Le pulsar PSR B1913+16 (Hulse-Taylor) a fourni la première preuve indirecte des ondes gravitationnelles via la décroissance de son orbite binaire (prix Nobel 1993). PTA (Pulsar Timing Arrays) détecte les ondes gravitationnelles nanohertz." },

  { term: 'Quasar', cat: 'Cosmologie',
    def: 'Noyau de galaxie actif extrêmement lumineux alimenté par un trou noir supermassif. Visible à des milliards d\'al.',
    detail: "Les quasars (QSO, quasi-stellar objects) sont des noyaux actifs de galaxies (AGN) alimentés par l'accrétion sur un trou noir de 10⁶ à 10¹⁰ M☉. L'efficacité de conversion masse-énergie de l'accrétion (~10 %) dépasse de loin la fusion nucléaire (~0,7 %). Le quasar 3C 273 (z = 0,158, découvert en 1963) est à 2,4 Gal et est visible aux jumelles (m_V = 12,8). Le quasar le plus lumineux connu, J0529-4351 (WISE+Gaia), dégage ~2 × 10¹⁴ L☉. À grand décalage spectral (z > 6), les quasars sondent l'époque de réionisation. Le spectre d'un quasar présente des raies d'émission larges (1 000–10 000 km/s de largeur) et la forêt Lyman-α dans l'UV." },

  { term: 'Rapport F (ouverture)', cat: 'Optique / Instruments',
    def: 'Rapport focal = focale / diamètre. Un f/5 est plus lumineux qu\'un f/10 : champ plus large, poses plus courtes.',
    detail: "Le rapport F/D (ou f/number) détermine la luminosité intrinsèque d'un instrument : l'éclairement sur le capteur ∝ (D/f)² = 1/(F/D)². Un f/5 est donc 4 fois plus lumineux qu'un f/10 à même diamètre. La profondeur de champ augmente avec F/D. Pour l'astrophoto du ciel profond, un f/4–f/7 est idéal ; pour la photographie planétaire (fort grossissement), on utilise souvent f/20–f/40 en projection oculaire. La taille du champ sur le capteur est θ = 2 arctan(d/2f) avec d la taille du capteur. La résolution angulaire (limite de diffraction) ne dépend que du diamètre D : θ_min = 1,22 λ/D (critère de Rayleigh)." },

  { term: 'Seeing', cat: 'Observation',
    def: 'Qualité de la stabilité atmosphérique. Un mauvais seeing brouille les images hautes résolutions.',
    detail: "Le seeing astronomique est causé par les turbulences atmosphériques (cellules de Kolmogorov) qui dévient les fronts d'onde lumineux. Il se quantifie par le paramètre de Fried r₀ : un bon seeing correspond à r₀ > 15 cm (FWHM étoile ≈ 0,5 arcsec), un mauvais à r₀ < 5 cm (FWHM > 2 arcsec). La FWHM d'une étoile non résolue = 0,98 λ/r₀. Les meilleurs sites mondiaux (Mauna Kea, VLT Paranal) ont un seeing médian de 0,6–0,7 arcsec. L'optique adaptative (AO) mesure et corrige les déformations en temps réel grâce à un miroir déformable (centaines d'actionneurs à ~1 kHz), atteignant la limite de diffraction du télescope (~0,05 arcsec pour un 8 m). Le seeing thermique local (heated ground, dôme) s'ajoute au seeing atmosphérique et peut dominer sur les petits télescopes." },

  { term: 'Solstice', cat: 'Mécanique céleste',
    def: 'Moment où le Soleil atteint sa déclinaison maximale (+23,5° en juin, −23,5° en décembre). Jours les plus longs/courts.',
    detail: "Aux solstices, l'axe de rotation terrestre est maximalemment incliné vers ou loin du Soleil (23,44°). Le Soleil se lève et se couche à ses positions les plus extrêmes (nord-est/nord-ouest en été, sud-est/sud-ouest en hiver pour l'hémisphère nord). La durée du jour au solstice d'été à Paris (~48,9° N) est d'environ 16h12, contre ~8h10 au solstice d'hiver. L'obliquité de 23,44° varie entre 22,1° et 24,5° sur ~41 000 ans (cycle de Milanković), influençant les glaciations. Au pôle, le Soleil ne se couche pas pendant 6 mois (nuit polaire / jour polaire). Stonehenge et d'autres monuments mégalithiques sont alignés sur le lever du Soleil au solstice d'été." },

  { term: 'Spectroscopie', cat: 'Astrophysique stellaire',
    def: 'Décomposition de la lumière en spectre. Révèle la composition chimique, la vitesse radiale et la température des astres.',
    detail: "Un spectrographe disperse la lumière via un prisme ou un réseau de diffraction (R = λ/Δλ = résolution spectrale). Les raies d'absorption (spectre de Fraunhofer) apparaissent quand l'atmosphère stellaire absorbe des longueurs d'onde précises (loi de Kirchhoff). La température stellaire détermine le type spectral (OBAFGKM) via la loi de Wien : λ_max = 2898 µm·K / T. L'effet Doppler décale les raies : Δλ/λ = v_r/c (z = v/c pour les vitesses non relativistes). Les spectrographes à haute résolution (HARPS, ESPRESSO, R ≈ 10⁵–10⁶) mesurent des vitesses radiales de ~0,3 m/s, permettant la détection d'exoplanètes. La spectroscopie de transit avec JWST analyse l'atmosphère des exoplanètes en transmettance : une différence de profondeur de transit en fonction de λ révèle la composition." },

  { term: 'Supernova', cat: 'Astrophysique stellaire',
    def: 'Explosion cataclysmique de fin de vie d\'une étoile massive (type II) ou d\'une naine blanche en accrétion (type Ia).',
    detail: "Une SN de type II (effondrement gravitationnel) se produit quand le cœur d'une étoile massive (> 8 M☉) forme un noyau de fer (pas de fusion exothermique possible) et s'effondre en étoile à neutrons ou trou noir : l'onde de choc éjecte l'enveloppe à ~10 000 km/s. L'énergie libérée est ~3 × 10⁴⁶ J, dont 99 % en neutrinos. SN 1987A dans le Grand Nuage de Magellan est la plus proche observée depuis 400 ans (détection de 25 neutrinos sur Terre). Une SN de type Ia (naine blanche dépassant M_Chandrasekhar) est standardisable en luminosité après correction Phillips et sert de bougie standard cosmologique. Les SNe enrichissent le milieu interstellaire en éléments lourds (Fe, Ni, Si…) forgés dans les couches stellaires ; sans elles, pas de planètes rocheuses ni de vie." },

  { term: 'Transit', cat: 'Exoplanètes',
    def: 'Passage d\'un astre devant un autre plus grand. Détection principale des exoplanètes par la méthode des transits.',
    detail: "Un transit planétaire produit une diminution de la luminosité de l'étoile hôte de δ = (R_p/R_*)² : un Jupiter-chaud (R_p ≈ 1,1 R_Jup) devant une étoile solaire cause une baisse de ~1 %, une Terre-analogue de ~0,008 %. La période orbitale est directement la période entre transits (loi de Kepler : T² ∝ a³). Kepler/K2 a détecté ~4 000 exoplanètes par cette méthode. La transmission spectroscopy (JWST) analyse les variations de profondeur en fonction de λ pendant le transit pour sonder l'atmosphère. La probabilité géométrique d'un transit est P ≈ R_*/a (~0,5 % pour une Terre-analogue), d'où la nécessité de monitorer des millions d'étoiles. Les transits de Mercure et Vénus devant le Soleil sont visibles depuis la Terre avec un filtre solaire." },

  { term: 'Trou noir', cat: 'Astrophysique stellaire',
    def: 'Région de l\'espace où la gravité est si intense que rien, pas même la lumière, ne peut s\'en échapper.',
    detail: "Le rayon de Schwarzschild r_s = 2GM/c² définit l'horizon des événements : r_s = 3 km × (M/M☉). Un trou noir stellaire (5–100 M☉) naît de l'effondrement d'une étoile massive. Les trous noirs supermassifs (10⁶–10¹⁰ M☉) siègent au cœur de presque toutes les galaxies : Sgr A* (Voie Lactée, 4 × 10⁶ M☉) et M87* (6,5 × 10⁹ M☉, imagé en 2019 par l'Event Horizon Telescope en VLBI). Le rayonnement de Hawking (T_H = ℏc³/8πGMk_B) est infime pour les trous noirs stellaires (T_H ~ 10⁻⁸ K pour 1 M☉). LIGO/Virgo/KAGRA détecte les ondes gravitationnelles des fusions de trous noirs binaires depuis 2015. La singularité centrale (densité infinie) indique une rupture de la physique classique, requérant une théorie quantique de la gravitation." },

  { term: 'Unité Astronomique (UA)', cat: 'Astrométrie',
    def: 'Distance moyenne Terre-Soleil : 149,6 millions de km. Référence pour les distances du système solaire.',
    detail: "L'UA est définie depuis 2012 comme exactement 149 597 870 700 m (anciennement définie par la constante gravitationnelle du Soleil GM☉). La mesure précise a été obtenue par radar sur Vénus et Mars dans les années 1960 (Shapiro). Les distances planétaires s'expriment naturellement en UA : Mercure 0,39 UA, Vénus 0,72, Mars 1,52, Jupiter 5,2, Neptune 30 UA. La ceinture de Kuiper s'étend de 30 à ~50 UA, le nuage d'Oort de ~2 000 à ~100 000 UA. Le signal radio met 8 min 20 s pour parcourir 1 UA. Voyager 1 se trouve actuellement à ~165 UA du Soleil. En astrophysique des exoplanètes, la zone habitable se situe typiquement entre 0,8 et 1,7 UA pour une étoile de type solaire." },

  { term: 'Vitesse de libération', cat: 'Mécanique céleste',
    def: 'Vitesse minimale pour échapper à l\'attraction d\'un corps. 11,2 km/s pour la Terre, 620 km/s pour le Soleil.',
    detail: "La vitesse de libération v_esc = √(2GM/r) est dérivée de la conservation de l'énergie mécanique (E_c + E_p = 0). Elle est indépendante de la direction et de la masse du projectile. Pour la Terre : v_esc = 11,2 km/s ; pour Mars : 5,0 km/s (d'où son atmosphère peu retenue) ; pour Jupiter : 59,5 km/s ; pour le Soleil en surface : 617 km/s ; pour une naine blanche : ~5 000 km/s ; pour une étoile à neutrons : ~100 000 km/s (c/3). L'horizon des événements d'un trou noir est précisément défini par v_esc = c (r_s = 2GM/c²). La vitesse de libération galactique depuis le voisinage solaire est ~550 km/s — les étoiles hyperrapides (hypervelocity stars) éjectées du centre galactique peuvent la dépasser." },

  { term: 'Zénith', cat: 'Coordonnées célestes',
    def: 'Point du ciel situé exactement à la verticale de l\'observateur. Distance zénithale = 90° − hauteur.',
    detail: "Le zénith est défini par la direction opposée au vecteur gravité local, donc influencé par l'aplatissement terrestre et les anomalies gravimétriques locales. La distance zénithale z = 90° − h (avec h la hauteur de l'astre) détermine la masse d'air traversée : X = sec(z) = 1/cos(z) pour un modèle d'atmosphère plane. À z = 60°, X = 2 (doublement de l'absorption). L'observation zénithale minimise l'absorption, la réfraction atmosphérique (nulle au zénith) et la turbulence. Le nadir est le point antipodal du zénith. La distance zénithale du pôle céleste est égale à 90° moins la latitude : à Paris (φ = 48,9° N), le pôle est à 48,9° de hauteur, soit 41,1° de distance zénithale." },

  { term: 'Zodiaque', cat: 'Mécanique céleste',
    def: 'Bande du ciel le long de l\'écliptique divisée en 12 constellations. Les planètes y circulent toujours.',
    detail: "Le zodiaque est une bande de ±8–9° de latitude écliptique, correspondant aux orbites des planètes connues de l'Antiquité (jusqu'à Saturne) et de la Lune. Les 12 constellations zodiacales (définie par l'IAU en 1930) occupent des portions inégales de l'écliptique : Vierge couvre ~45°, Scorpion seulement ~7°. L'ophiuchus est traversé par l'écliptique mais n'est pas une constellation du zodiaque au sens traditionnel. La précession des équinoxes a décalé de ~1 signe le Soleil printanier depuis l'Antiquité : le signe astrologique du Bélier correspond désormais astronomiquement aux Poissons. Les planètes du système solaire ne s'éloignent jamais de plus de quelques degrés de l'écliptique, ce qui rend le zodiaque indispensable au repérage planétaire." },
].sort((a, b) => a.term.localeCompare(b.term, 'fr'))

function GlossaireView({ onSelect }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? GLOSSAIRE.filter(g => g.term.toLowerCase().includes(s) || g.def.toLowerCase().includes(s)) : GLOSSAIRE
  }, [q])

  return (
    <div className="enter pad" style={{ paddingTop: 14 }}>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un terme…"
          style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 38px',
            borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--surface-1)',
            color: 'var(--text)', fontSize: 14, fontFamily: 'var(--sans)', outline: 'none' }}
        />
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, color: 'var(--faint)', pointerEvents: 'none' }}>
          <circle cx="8.5" cy="8.5" r="5.5" /><line x1="13.5" y1="13.5" x2="17.5" y2="17.5" />
        </svg>
      </div>

      {filtered.length === 0 && (
        <div className="meta" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--faint)' }}>
          Aucun terme trouvé
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {filtered.map(g => (
          <button key={g.term} onClick={() => onSelect(g)} className="press"
            style={{ textAlign: 'left', padding: '13px 15px', borderRadius: 13, cursor: 'pointer',
              background: 'var(--surface-1)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="h-card" style={{ fontSize: 14.5, display: 'block', marginBottom: 4 }}>{g.term}</span>
              <span className="body" style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-2)' }}>{g.def}</span>
            </span>
            <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 99, flexShrink: 0, marginTop: 2,
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--faint)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{g.cat}</span>
          </button>
        ))}
      </div>

      <div className="meta" style={{ textAlign: 'center', marginTop: 18, color: 'var(--faint)' }}>
        {filtered.length} terme{filtered.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ─── Composant Quiz ──────────────────────────────────────────────────────────

const CHRONO_SECS = 15

function Quiz({ onComplete, cat = 'Tout', chrono = false }) {
  const [questions]          = useState(() => pickQuestions(5, cat))
  const [i, setI]            = useState(0)
  const [picked, setPicked]  = useState(null)
  const [score, setScore]    = useState(0)
  const [bonusXp, setBonusXp]= useState(0)
  const [done, setDone]      = useState(false)
  const [stats, setStats]    = useState(null)
  const [jokerUsed, setJokerUsed] = useState(false)
  const [eliminated, setEliminated] = useState([])
  const [timeLeft, setTimeLeft]    = useState(CHRONO_SECS)
  const [timedOut, setTimedOut]    = useState(false)
  const timerRef = useRef(null)

  const cur = questions[i]

  // Timer chrono
  useEffect(() => {
    if (!chrono || picked != null || done) return
    setTimeLeft(CHRONO_SECS)
    setTimedOut(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setTimedOut(true)
          setPicked(-1)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [i, chrono, done])

  const choose = (idx) => {
    if (picked != null) return
    clearInterval(timerRef.current)
    setPicked(idx)
    const correct = idx === cur.a
    if (correct) {
      setScore(s => s + 1)
      if (chrono && timeLeft >= 10) setBonusXp(b => b + 5)
    }
  }

  const nextQ = () => {
    if (i + 1 >= questions.length) {
      const saved = recordQuiz(score + Math.floor(bonusXp / 10))
      setStats(saved)
      setDone(true)
      onComplete?.(score, questions.length, bonusXp)
      return
    }
    setI(i + 1)
    setPicked(null)
    setEliminated([])
    setTimedOut(false)
  }

  const useJoker = () => {
    if (jokerUsed || picked != null) return
    const wrongIdxs = cur.opts.map((_, i) => i).filter(i => i !== cur.a)
    const toElim = wrongIdxs.sort(() => Math.random() - 0.5).slice(0, 2)
    setEliminated(toElim)
    setJokerUsed(true)
  }

  const restart = () => {
    setI(0); setPicked(null); setScore(0); setBonusXp(0)
    setDone(false); setStats(null); setJokerUsed(false)
    setEliminated([]); setTimeLeft(CHRONO_SECS); setTimedOut(false)
  }

  const catStyle = cur ? (CAT_COLORS[cur.cat] || {}) : {}

  if (done && stats) {
    const totalXpGained = score * 10 + bonusXp
    return (
      <div style={{ padding: 20, borderRadius: 18, textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))',
        border: '1px solid var(--gold-line)' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}>
          <IcTrophy size={28} />
        </span>
        <div className="h-sec" style={{ fontSize: 22 }}>{score} / {questions.length}</div>
        <div className="body" style={{ fontSize: 13.5, margin: '8px 0 10px' }}>
          {score === questions.length ? 'Sans faute, bravo !'
            : score >= Math.ceil(questions.length / 2) ? 'Beau score, continuez à explorer.'
            : 'Le ciel n\'attend que vous — réessayez !'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            color: 'var(--gold)', padding: '4px 10px', borderRadius: 99,
            background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
            <IcTrophy size={13} /> +{totalXpGained} XP{bonusXp > 0 ? ` (dont ${bonusXp} bonus chrono)` : ''}
          </div>
          {stats.streak > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              color: 'var(--gold)', padding: '4px 10px', borderRadius: 99,
              background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
              <IcFlame size={13} /> {stats.streak} jours consécutifs
            </div>
          )}
          {stats.bestScore > 0 && (
            <div style={{ fontSize: 12, color: 'var(--faint)', padding: '4px 10px', borderRadius: 99,
              background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
              Record : {stats.bestScore}/{questions.length}
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={restart}><IcPlay size={17} /> Rejouer</button>
      </div>
    )
  }

  const chronoPct = (timeLeft / CHRONO_SECS) * 100
  const chronoColor = timeLeft > 8 ? 'var(--good)' : timeLeft > 4 ? 'var(--gold)' : 'var(--bad)'

  return (
    <div style={{ padding: 18, borderRadius: 18,
      background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>

      {/* Header : progression + cat + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="eyebrow">Question {i + 1} / {questions.length}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {cur.cat && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--mono)',
              letterSpacing: '.05em', background: catStyle.bg, border: '1px solid ' + catStyle.bd, color: catStyle.cl }}>
              {cur.cat}
            </span>
          )}
          <span className="data" style={{ fontSize: 12, color: 'var(--gold)' }}>{score} ✓</span>
        </div>
      </div>

      {/* Barre chrono */}
      {chrono && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: chronoPct + '%', background: chronoColor,
              transition: 'width 1s linear, background 0.3s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: chronoColor, fontFamily: 'var(--mono)' }}>
              {timedOut ? 'Temps écoulé !' : timeLeft + 's'}
            </span>
          </div>
        </div>
      )}

      <div className="h-card" style={{ fontSize: 16, lineHeight: 1.35, marginBottom: 16, fontFamily: 'var(--serif)' }}>
        {cur.q}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {cur.opts.map((o, idx) => {
          const isA = idx === cur.a, isP = idx === picked
          const isElim = eliminated.includes(idx)
          let bd = 'var(--line-2)', bg = 'var(--surface-1)', cl = 'var(--text)'
          if (isElim && picked == null) { bd = 'var(--line)'; bg = 'transparent'; cl = 'var(--faint)' }
          if (picked != null) {
            if (isA)       { bd = 'rgba(132,211,169,.5)'; bg = 'rgba(132,211,169,.1)'; cl = 'var(--good)' }
            else if (isP)  { bd = 'rgba(226,141,126,.5)'; bg = 'rgba(226,141,126,.1)'; cl = 'var(--bad)'  }
            else if (isElim) { bd = 'var(--line)'; bg = 'transparent'; cl = 'var(--faint)' }
          }
          return (
            <button key={idx}
              onClick={() => !isElim && choose(idx)}
              className="press"
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11,
                padding: '13px 14px', borderRadius: 12,
                cursor: picked == null && !isElim ? 'pointer' : 'default',
                background: bg, border: '1px solid ' + bd, color: cl, fontSize: 14,
                fontWeight: 500, fontFamily: 'var(--sans)',
                textDecoration: isElim ? 'line-through' : 'none',
                opacity: isElim ? 0.45 : 1 }}>
              <span style={{ flex: 1 }}>{o}</span>
              {picked != null && isA && <IcCheckCircle size={18} />}
              {picked != null && isP && !isA && <IcClose size={16} />}
              {chrono && picked != null && isA && timeLeft >= 10 && timeLeft < CHRONO_SECS && (
                <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>+5 XP</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Joker 50/50 */}
      {picked == null && !timedOut && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={useJoker} disabled={jokerUsed}
            style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 99, cursor: jokerUsed ? 'default' : 'pointer',
              background: jokerUsed ? 'var(--surface-1)' : 'rgba(217,179,108,.12)',
              border: '1px solid ' + (jokerUsed ? 'var(--line)' : 'var(--gold-line)'),
              color: jokerUsed ? 'var(--faint)' : 'var(--gold)', fontFamily: 'var(--mono)',
              opacity: jokerUsed ? 0.5 : 1 }}>
            {jokerUsed ? '50/50 utilisé' : '⚡ Joker 50/50'}
          </button>
        </div>
      )}

      {(picked != null || timedOut) && (
        <div style={{ marginTop: 14 }}>
          {timedOut && picked === -1 && (
            <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 10, marginBottom: 10,
              background: 'rgba(226,141,126,.08)', border: '1px solid rgba(226,141,126,.3)',
              color: 'var(--bad)' }}>
              Temps écoulé — la bonne réponse était : <strong>{cur.opts[cur.a]}</strong>
            </div>
          )}
          <div className="body tight serif-body"
            style={{ fontSize: 13, padding: '11px 13px', borderRadius: 11,
              background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
            {cur.why}
          </div>
          <button className="btn-primary" style={{ marginTop: 14 }} onClick={nextQ}>
            {i + 1 >= questions.length ? 'Voir le score' : 'Question suivante'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function EducationPage({ onBack }) {
  const [seg, setSeg]           = useState('learn')
  const [read, setRead]         = useState(null)
  const [quizKey, setQuizKey]   = useState(0)
  const [parcours, setParcours] = useState(parcoursLoad)
  const [quizStats, setQuizStats] = useState(quizLoad)
  const [xp, setXp]             = useState(xpLoad)
  const [defiDone, setDefiDone] = useState(defiDoneToday)
  const [quizCat, setQuizCat]       = useState('Tout')
  const [chronoMode, setChronoMode] = useState(false)
  const [openParcours, setOpenParcours] = useState(null)
  const [openLesson, setOpenLesson]     = useState(null)
  const [aiQ, setAiQ]         = useState('')
  const [aiAnswer, setAiAnswer] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [openGlossaire, setOpenGlossaire] = useState(null)
  const [glossAiAnswer, setGlossAiAnswer] = useState(null)
  const [glossAiLoading, setGlossAiLoading] = useState(false)

  useEffect(() => { setAiQ(''); setAiAnswer(null); setAiLoading(false) }, [read])
  useEffect(() => { setGlossAiAnswer(null); setGlossAiLoading(false) }, [openGlossaire])

  async function askAIGlossaire(term, def, detail) {
    setGlossAiLoading(true)
    setGlossAiAnswer(null)
    try {
      const messages = [
        { role: 'user', content: 'Tu es un expert en astronomie et astrophysique. Réponds toujours en français, de façon très approfondie et pédagogique (8 à 10 phrases). Inclus des formules, des ordres de grandeur, des exemples concrets et les liens avec d\'autres concepts clés.' },
        { role: 'assistant', content: 'Compris, je réponds en expert avec formules et ordres de grandeur.' },
        { role: 'user', content: `Donne-moi une explication exhaustive du concept astronomique suivant.\n\nTerme : ${term}\nDéfinition courte : ${def}\nDétails connus : ${detail}\n\nApprofondis encore davantage : curiosités, histoire de la découverte, applications actuelles, et questions encore ouvertes sur ce sujet.` },
      ]
      const reply = await callAI(messages)
      setGlossAiAnswer((reply || '').trim() || '…')
    } catch (e) {
      setGlossAiAnswer(e.message === 'no-key'
        ? "Configurez une clé API dans les Paramètres pour activer les réponses IA."
        : "Erreur de connexion. Vérifiez votre clé API dans les Paramètres.")
    } finally {
      setGlossAiLoading(false)
    }
  }

  async function askAI(question, article) {
    if (!question || !article) return
    setAiQ(question)
    setAiLoading(true)
    setAiAnswer(null)
    try {
      const ctx = `Article : "${article.title}"\n\n${(article.body || '').slice(0, 800)}`
      const messages = [
        { role: 'user', content: 'Tu es Astror, expert en astronomie et astrophysique. Réponds toujours en français, de façon précise et approfondie (6 à 8 phrases), avec des données chiffrées si pertinent.' },
        { role: 'assistant', content: 'Compris, je réponds en expert.' },
        { role: 'user', content: `${ctx}\n\nQuestion : ${question}` },
      ]
      const reply = await callAI(messages)
      setAiAnswer((reply || '').trim() || '…')
    } catch (e) {
      setAiAnswer(e.message === 'no-key'
        ? "Configurez une clé API dans les Paramètres pour activer les réponses IA."
        : "Erreur de connexion. Vérifiez votre clé API dans les Paramètres.")
    } finally {
      setAiLoading(false)
    }
  }

  const defi = getTodayDefi()
  const { data: apodArticle } = useLiveData(fetchAPODArticle)
  const { data: eduNews, loading: eduNewsLoading } = useLiveData(fetchEduNews)

  const onQuizComplete = (score, total, bonusXp) => {
    setQuizStats(quizLoad())
    setXp(xpLoad())
    setTimeout(() => setQuizKey(k => k + 1), 4500)
  }

  const onDefiDone = () => {
    const next = markDefiDone(defi.pts)
    setXp(next)
    setDefiDone(true)
  }

  const allContent = [
    ...(apodArticle ? [apodArticle] : []),
    ...(eduNews || []),
    ...EDU_CONTENT,
  ]

  return (
    <ToolPage title="Apprendre" onBack={onBack} demoKey="tool_education">
      <ToolSeg
        items={[{ key: 'learn', label: 'Apprentissage' }, { key: 'content', label: 'Contenus' }, { key: 'glossaire', label: 'Glossaire' }]}
        value={seg} onChange={setSeg}
      />

      {seg === 'learn' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 14 }}>
            {/* Score XP + streak */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                color: 'var(--gold)', padding: '5px 12px', borderRadius: 99,
                background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
                fontFamily: 'var(--mono)', fontWeight: 600 }}>
                <IcTrophy size={13} /> {xp.total} XP
              </div>
              {quizStats.streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5,
                  color: 'var(--gold)', padding: '4px 10px', borderRadius: 99,
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
                  fontFamily: 'var(--mono)' }}>
                  <IcFlame size={13} /> {quizStats.streak} j. consécutifs
                </div>
              )}
              {quizStats.totalPlayed > 0 && (
                <div style={{ fontSize: 11.5, color: 'var(--faint)', padding: '4px 10px', borderRadius: 99,
                  background: 'var(--surface-1)', border: '1px solid var(--line)', fontFamily: 'var(--mono)' }}>
                  Record {quizStats.bestScore}/5 · {quizStats.totalPlayed} quiz
                </div>
              )}
            </div>

            {/* Défi du jour */}
            <div style={{ padding: 15, borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))',
              border: '1px solid var(--gold-line)' }}>
              <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#1a130a',
                  background: defiDone ? 'var(--surface-2)' : 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}>
                  {defiDone ? <IcCheckCircle size={22} style={{ color: 'var(--good)' }} /> : <IcFlame size={22} />}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>Défi du jour</div>
                  <div className="h-card" style={{ fontSize: 14.5,
                    textDecoration: defiDone ? 'line-through' : 'none',
                    opacity: defiDone ? 0.55 : 1 }}>
                    {defi.title}
                  </div>
                </div>
                <span className="data" style={{ fontSize: 12, color: defiDone ? 'var(--good)' : 'var(--gold)' }}>
                  +{defi.pts} XP
                </span>
              </div>
              {!defiDone && (
                <button onClick={onDefiDone} className="btn-primary"
                  style={{ marginTop: 12, width: '100%', fontSize: 13.5 }}>
                  Marquer comme fait
                </button>
              )}
              {defiDone && (
                <div className="meta" style={{ marginTop: 10, textAlign: 'center', color: 'var(--good)' }}>
                  Défi accompli — revenez demain pour un nouveau !
                </div>
              )}
            </div>
          </div>

          <ToolSection title="Quiz éclair">
            {/* Filtres catégorie */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
              {QUIZ_CATS.map(c => {
                const active = quizCat === c
                const cs = CAT_COLORS[c] || {}
                return (
                  <button key={c} onClick={() => { setQuizCat(c); setQuizKey(k => k + 1) }}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
                      fontFamily: 'var(--mono)', letterSpacing: '.04em',
                      background: active ? (cs.bg || 'var(--gold-soft)') : 'var(--surface-1)',
                      border: '1px solid ' + (active ? (cs.bd || 'var(--gold-line)') : 'var(--line)'),
                      color: active ? (cs.cl || 'var(--gold)') : 'var(--faint)' }}>
                    {c}
                  </button>
                )
              })}
            </div>
            {/* Toggle chrono */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button onClick={() => { setChronoMode(m => !m); setQuizKey(k => k + 1) }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 99,
                  cursor: 'pointer', fontSize: 12, fontFamily: 'var(--mono)',
                  background: chronoMode ? 'rgba(226,141,126,.12)' : 'var(--surface-1)',
                  border: '1px solid ' + (chronoMode ? 'rgba(226,141,126,.4)' : 'var(--line)'),
                  color: chronoMode ? 'var(--bad)' : 'var(--faint)' }}>
                <span style={{ fontSize: 14 }}>⏱</span>
                Mode chrono {chronoMode ? 'ON' : 'OFF'}
                {chronoMode && <span style={{ fontSize: 10, opacity: .7 }}>· +5 XP si ≥ 10s restantes</span>}
              </button>
            </div>
            <Quiz key={quizKey} onComplete={onQuizComplete} cat={quizCat} chrono={chronoMode} />
          </ToolSection>

          <ToolSection title="Parcours pédagogiques">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {parcours.map(p => (
                <button key={p.id} onClick={() => setOpenParcours(p)} className="press"
                  style={{ textAlign: 'left', padding: 14, borderRadius: 14, cursor: 'pointer',
                    background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <span className="h-card" style={{ fontSize: 14, flex: 1 }}>{p.name}</span>
                    {p.pct >= 100
                      ? <IcCheckCircle size={18} style={{ color: 'var(--good)' }} />
                      : <span className="meta" style={{ color: 'var(--gold)' }}>{p.pct}%</span>}
                  </div>
                  <div className="bar"><i style={{ width: p.pct + '%' }} /></div>
                  <div className="meta" style={{ marginTop: 7 }}>
                    {p.read.size} / {p.lessons.length} leçon{p.lessons.length > 1 ? 's' : ''} lue{p.read.size > 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'content' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {eduNewsLoading && !eduNews && [0, 1, 2].map(i => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden',
              background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
              <div style={{ height: 100, background: 'var(--surface-2)',
                animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.15 + 's' }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ height: 10, width: '40%', borderRadius: 6, background: 'var(--surface-2)',
                  animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.15 + 's' }} />
                <div style={{ height: 14, width: '85%', borderRadius: 6, background: 'var(--surface-2)',
                  animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.2 + 's' }} />
                <div style={{ height: 10, width: '60%', borderRadius: 6, background: 'var(--surface-2)',
                  animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.25 + 's' }} />
              </div>
            </div>
          ))}
          {allContent.map((c, i) => (
            <button key={i} onClick={() => setRead(c)} className="press" style={{ textAlign: 'left',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
              border: '1px solid var(--line)', borderRadius: 16, padding: 0,
              cursor: 'pointer', overflow: 'hidden' }}>
              {c.imageUrl && (
                <img src={c.imageUrl} alt={c.title} loading="lazy"
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="tag">{c.cat}</span>
                  {c.isToday && <span style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 99,
                    background: 'rgba(132,211,169,.1)', border: '1px solid rgba(132,211,169,.3)',
                    color: 'var(--good)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>aujourd'hui</span>}
                  <span style={{ flex: 1 }} />
                  <span className="meta">{c.read} de lecture</span>
                </div>
                <div className="h-card" style={{ fontSize: 16, fontFamily: 'var(--serif)', marginBottom: 5 }}>{c.title}</div>
                {c.date && <div className="meta" style={{ color: 'var(--gold)', marginBottom: 5 }}>{c.date}</div>}
                <div className="body tight" style={{ fontSize: 12.5 }}>{(c.body || '').slice(0, 96)}…</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {seg === 'glossaire' && <GlossaireView onSelect={setOpenGlossaire} />}

      {/* ── Sheet : détail glossaire + IA ── */}
      <Sheet open={!!openGlossaire} onClose={() => setOpenGlossaire(null)}>
        {openGlossaire && (
          <div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'var(--mono)',
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--faint)', letterSpacing: '.06em' }}>{openGlossaire.cat}</span>

            <div className="h-sec" style={{ fontSize: 26, marginTop: 12, marginBottom: 10, lineHeight: 1.15 }}>
              {openGlossaire.term}
            </div>

            <p className="body serif-body" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--dim)',
              fontStyle: 'italic', marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
              {openGlossaire.def}
            </p>

            <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 0 }}>
              {openGlossaire.detail}
            </p>

            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#1a130a',
                  background: 'linear-gradient(180deg,var(--gold-2),var(--gold))' }}>
                  <IcSpark size={14} />
                </span>
                <span className="eyebrow">Aller encore plus loin</span>
              </div>

              <button
                onClick={() => askAIGlossaire(openGlossaire.term, openGlossaire.def, openGlossaire.detail)}
                disabled={glossAiLoading}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 13,
                  cursor: glossAiLoading ? 'default' : 'pointer', opacity: glossAiLoading ? 0.5 : 1,
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
                  color: 'var(--gold)', fontSize: 14, fontFamily: 'var(--mono)',
                  letterSpacing: '.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <IcSpark size={15} />
                Approfondir avec l'IA
              </button>

              {glossAiLoading && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(217,179,108,0.07)', border: '1px solid var(--gold-line)',
                  display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
                      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: i * 0.18 + 's' }} />
                  ))}
                </div>
              )}

              {glossAiAnswer && !glossAiLoading && (
                <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(217,179,108,0.07)', border: '1px solid var(--gold-line)',
                  fontSize: 14, lineHeight: 1.68, color: 'var(--text)', fontFamily: 'var(--serif)' }}>
                  {glossAiAnswer}
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>

      {/* ── Sheet : liste des leçons d'un parcours ── */}
      <Sheet open={!!openParcours && !openLesson} onClose={() => setOpenParcours(null)}>
        {openParcours && (
          <div>
            <div className="tag" style={{ marginBottom: 10 }}>Parcours</div>
            <div className="h-sec" style={{ fontSize: 22, marginBottom: 4, lineHeight: 1.2 }}>{openParcours.name}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 18 }}>
              {openParcours.read.size} / {openParcours.lessons.length} leçons lues · {openParcours.pct}%
            </div>
            <div className="bar" style={{ marginBottom: 20 }}>
              <i style={{ width: openParcours.pct + '%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {openParcours.lessons.map((l, idx) => {
                const done = openParcours.read.has(l.id)
                return (
                  <button key={l.id} onClick={() => setOpenLesson(l)} className="press"
                    style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 15px', borderRadius: 13, cursor: 'pointer',
                      background: done ? 'rgba(132,211,169,.06)' : 'var(--surface-1)',
                      border: '1px solid ' + (done ? 'rgba(132,211,169,.3)' : 'var(--line)') }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                      fontFamily: 'var(--mono)', fontWeight: 700,
                      background: done ? 'rgba(132,211,169,.2)' : 'var(--surface-2)',
                      color: done ? 'var(--good)' : 'var(--faint)' }}>
                      {done ? '✓' : idx + 1}
                    </span>
                    <span className="h-card" style={{ fontSize: 13.5, flex: 1,
                      color: done ? 'var(--text-2)' : 'var(--text)' }}>
                      {l.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Sheet>

      {/* ── Sheet : contenu d'une leçon ── */}
      <Sheet open={!!openLesson} onClose={() => setOpenLesson(null)}>
        {openLesson && openParcours && (() => {
          const done = openParcours.read.has(openLesson.id)
          const lessonIdx = openParcours.lessons.findIndex(l => l.id === openLesson.id)
          const nextLesson = openParcours.lessons[lessonIdx + 1] || null
          return (
            <div>
              <div className="tag" style={{ marginBottom: 10 }}>{openParcours.name}</div>
              <div className="h-sec" style={{ fontSize: 22, marginBottom: 18, lineHeight: 1.2 }}>
                {openLesson.title}
              </div>
              {openLesson.body.split('\n\n').map((para, i) => (
                <p key={i} className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.68, marginBottom: 16 }}>
                  {para}
                </p>
              ))}
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!done ? (
                  <button className="btn-primary" onClick={() => {
                    const updated = markLessonRead(parcours, openParcours.id, openLesson.id)
                    setParcours(updated)
                    setXp(xpLoad())
                    const updatedP = updated.find(p => p.id === openParcours.id)
                    setOpenParcours(updatedP)
                    if (nextLesson) setOpenLesson(nextLesson)
                    else setOpenLesson(null)
                  }}>
                    <IcCheckCircle size={16} /> Marquer comme lu · +15 XP
                    {nextLesson ? ' — Leçon suivante' : ' — Terminer le parcours'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="meta" style={{ textAlign: 'center', color: 'var(--good)' }}>
                      ✓ Leçon déjà lue
                    </div>
                    {nextLesson && (
                      <button className="btn-primary" onClick={() => setOpenLesson(nextLesson)}>
                        Leçon suivante →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </Sheet>

      <Sheet open={!!read} onClose={() => setRead(null)}>
        {read && (
          <div>
            {read.imageUrl && (
              <img src={read.imageUrl} alt={read.title} loading="lazy"
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 18 }} />
            )}
            <div className="tag" style={{ marginBottom: 12 }}>{read.cat}</div>
            <div className="h-sec" style={{ fontSize: 24, marginBottom: 8, lineHeight: 1.15 }}>{read.title}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 16 }}>
              {read.date || read.read + ' de lecture'}
            </div>
            {(read.body || '').split('\n\n').map((para, i) => (
              <p key={i} className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62, marginBottom: 14 }}>{para}</p>
            ))}

            {read.url && (
              <a href={read.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 8, padding: '13px 18px', borderRadius: 13, textDecoration: 'none',
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-line)',
                  color: 'var(--gold)', fontSize: 13.5, fontFamily: 'var(--mono)', letterSpacing: '.04em' }}>
                Lire l'article complet →
              </a>
            )}

            {/* ── Section IA ── */}
            <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#1a130a',
                  background: 'linear-gradient(180deg,var(--gold-2),var(--gold))' }}>
                  <IcSpark size={14} />
                </span>
                <span className="eyebrow">Approfondir avec l'IA</span>
              </div>

              {/* Combobox questions */}
              {read.questions?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <select
                    value={aiQ}
                    onChange={e => askAI(e.target.value, read)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                      background: 'var(--surface-1)', border: '1px solid var(--line-2)',
                      color: aiQ ? 'var(--text)' : 'var(--faint)',
                      fontSize: 13.5, fontFamily: 'var(--sans)', outline: 'none',
                      appearance: 'none', WebkitAppearance: 'none' }}>
                    <option value="">Choisir une question…</option>
                    {read.questions.map((q, i) => (
                      <option key={i} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bouton Plus d'informations */}
              <button
                onClick={() => askAI(`Développe et approfondis le sujet de cet article de façon détaillée, en donnant des exemples concrets, des chiffres précis et les découvertes les plus récentes liées à : ${read.title}`, read)}
                disabled={aiLoading}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, cursor: aiLoading ? 'default' : 'pointer',
                  background: 'var(--surface-1)', border: '1px solid var(--line-2)',
                  color: 'var(--dim)', fontSize: 13.5, fontFamily: 'var(--sans)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  opacity: aiLoading ? 0.5 : 1 }}>
                <IcSpark size={14} style={{ color: 'var(--gold)' }} />
                Plus d'informations
              </button>

              {/* Loading */}
              {aiLoading && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(217,179,108,0.07)', border: '1px solid var(--gold-line)',
                  display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
                      animation: 'pulse 1.2s ease-in-out infinite', animationDelay: i * 0.18 + 's' }} />
                  ))}
                </div>
              )}

              {/* Réponse IA */}
              {aiAnswer && !aiLoading && (
                <div style={{ marginTop: 14 }}>
                  {aiQ && read.questions?.includes(aiQ) && (
                    <div className="eyebrow dim" style={{ marginBottom: 8 }}>{aiQ}</div>
                  )}
                  <div style={{ padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(217,179,108,0.07)', border: '1px solid var(--gold-line)',
                    fontSize: 14, lineHeight: 1.62, color: 'var(--text)', fontFamily: 'var(--serif)' }}>
                    {aiAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </ToolPage>
  )
}
