import { useState, useMemo } from 'react'
import { IcTrophy, IcFlame, IcCheckCircle, IcClose, IcPlay } from './icons'
import { Sheet } from './ui'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { useLiveData, fetchAPODArticle } from './api'

// ─── Quiz pool : 20 questions, 5 tirées aléatoirement par session ───────────

const QUIZ_POOL = [
  { q: 'Quelle planète possède le système d\'anneaux le plus visible ?',
    opts: ['Jupiter', 'Saturne', 'Uranus', 'Neptune'], a: 1,
    why: 'Les anneaux de Saturne, faits de glace et de poussière, sont visibles dès une lunette de 60 mm.' },
  { q: 'Que mesure l\'échelle de Bortle ?',
    opts: ['La magnitude des étoiles', 'La pollution lumineuse', 'La distance des galaxies', 'La phase lunaire'], a: 1,
    why: 'L\'échelle de Bortle (1–9) quantifie la noirceur du ciel, de 1 (parfait) à 9 (centre-ville).' },
  { q: 'À quelle distance se trouve la galaxie d\'Andromède (M31) ?',
    opts: ['250 000 al', '2,5 millions d\'al', '25 millions d\'al', '2,5 milliards d\'al'], a: 1,
    why: 'M31 est à 2,5 millions d\'années-lumière — l\'objet le plus lointain visible à l\'œil nu.' },
  { q: 'Qu\'est-ce que le « seeing » en astronomie ?',
    opts: ['La transparence du ciel', 'La turbulence atmosphérique', 'La pollution lumineuse', 'L\'humidité ambiante'], a: 1,
    why: 'Le seeing mesure la turbulence de l\'air, qui fait scintiller et brouiller les images.' },
  { q: 'Quel est le nom de la plus grande lune de Saturne ?',
    opts: ['Europe', 'Ganymède', 'Titan', 'Io'], a: 2,
    why: 'Titan, plus grand que Mercure, possède une atmosphère dense d\'azote et méthane.' },
  { q: 'En quelle année Edwin Hubble a-t-il prouvé l\'expansion de l\'univers ?',
    opts: ['1912', '1929', '1945', '1965'], a: 1,
    why: 'En 1929, Hubble publie la loi de récession des galaxies, preuve directe de l\'expansion cosmique.' },
  { q: 'Quelle mission a photographié Pluton en gros plan pour la première fois ?',
    opts: ['Cassini', 'Voyager 1', 'New Horizons', 'Dawn'], a: 2,
    why: 'New Horizons a survolé Pluton le 14 juillet 2015, révélant montagnes de glace et plaine Tombaugh.' },
  { q: 'Qu\'est-ce qu\'une étoile de type spectral O ?',
    opts: ['Froide et rouge', 'Chaude et bleue', 'Naine blanche', 'Géante orange'], a: 1,
    why: 'Les étoiles O sont les plus chaudes (>30 000 K), bleues, et les plus massives — elles vivent quelques millions d\'années.' },
  { q: 'Quelle est la période de rotation sidérale de la Lune ?',
    opts: ['24 heures', '27,3 jours', '29,5 jours', '365 jours'], a: 1,
    why: 'La Lune tourne en 27,3 jours — exactement sa période orbitale, d\'où on voit toujours la même face.' },
  { q: 'Quel instrument a détecté des ondes gravitationnelles pour la première fois, en 2015 ?',
    opts: ['Hubble', 'ALMA', 'LIGO', 'VLT'], a: 2,
    why: 'LIGO a détecté la fusion de deux trous noirs le 14 septembre 2015, confirmant la relativité générale.' },
  { q: 'Dans quelle constellation se trouve la nébuleuse d\'Orion (M42) ?',
    opts: ['Taurus', 'Orion', 'Persée', 'Gémeaux'], a: 1,
    why: 'M42 est visible à l\'œil nu dans le baudrier d\'Orion — une pouponnière d\'étoiles à 1 344 al.' },
  { q: 'Qu\'est-ce qu\'une nébuleuse planétaire ?',
    opts: ['Nuage d\'une jeune étoile', 'Enveloppe éjectée par une étoile mourante', 'Restes d\'une supernova', 'Un amas globulaire lointain'], a: 1,
    why: 'Quand une étoile de type solaire s\'éteint, elle éjecte ses couches externes — sans rapport avec les planètes.' },
  { q: 'Quelle est la magnitude apparente du Soleil ?',
    opts: ['-12,7', '-26,7', '-4,2', '1,0'], a: 1,
    why: 'Le Soleil a une magnitude de −26,7, de loin l\'astre le plus brillant du ciel.' },
  { q: 'Quelle planète tourne « couchée » avec une inclinaison axiale de ~98° ?',
    opts: ['Neptune', 'Jupiter', 'Uranus', 'Vénus'], a: 2,
    why: 'L\'axe d\'Uranus est incliné à 97,8° — probablement suite à un impact colossal dans le passé.' },
  { q: 'Que signifie l\'acronyme JWST ?',
    opts: ['James Webb Space Telescope', 'Joint Wide Survey Telescope', 'Jupiter Webb Space Tool', 'James Wren Star Telescope'], a: 0,
    why: 'JWST observe dans l\'infrarouge depuis le point L2, à 1,5 million de km de la Terre.' },
  { q: 'Qu\'est-ce qu\'une Céphéide en astronomie ?',
    opts: ['Une étoile à neutrons', 'Une étoile variable pulsante indicatrice de distance', 'Une naine blanche froide', 'Un quasar proche'], a: 1,
    why: 'Les Céphéides pulsent avec une période liée à leur luminosité, permettant de mesurer des distances extragalactiques.' },
  { q: 'Quel phénomène provoque la scintillation des étoiles mais pas des planètes ?',
    opts: ['La distance', 'Le diamètre apparent — les planètes sont des disques', 'La température', 'La phase lunaire'], a: 1,
    why: 'Les planètes ont un disque angulaire : la turbulence se moyenne, réduisant la scintillation.' },
  { q: 'Quel est le type spectral du Soleil selon la classification de Harvard ?',
    opts: ['K5V', 'G2V', 'F0III', 'M4V'], a: 1,
    why: 'Le Soleil est une naine G2V — une étoile de milieu de vie, ni trop chaude ni trop froide.' },
  { q: 'Quelle est la distance approximative du centre galactique depuis la Terre ?',
    opts: ['2 600 al', '8 200 parsecs', '1 000 parsecs', '50 000 al'], a: 1,
    why: 'Le centre de la Voie Lactée se trouve à ~8 200 parsecs (26 700 al), dans la direction du Sagittaire.' },
  { q: 'Qu\'est-ce que l\'aberration chromatique dans une lunette astronomique ?',
    opts: ['Vibrations dues au vent', 'Dispersion des couleurs par la lentille', 'Reflets parasites', 'Déformation du champ'], a: 1,
    why: 'Un objectif simple ne focalise pas toutes les longueurs d\'onde au même point, créant des halos colorés.' },
]

function pickQuestions(n = 5) {
  return [...QUIZ_POOL].sort(() => Math.random() - 0.5).slice(0, n)
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

// ─── Persistance parcours ────────────────────────────────────────────────────

const PARCOURS_STORE = 'astror_parcours_v1'
const PARCOURS_DEF = [
  { id: 'stars', name: 'Premiers pas sous les étoiles', steps: '8 leçons',  initPct: 100 },
  { id: 'map',   name: 'Lire une carte du ciel',         steps: '6 leçons',  initPct: 66  },
  { id: 'scope', name: 'Choisir et régler son télescope', steps: '10 leçons', initPct: 30  },
  { id: 'photo', name: 'Initiation à l\'astrophoto',      steps: '12 leçons', initPct: 0   },
]

function parcoursLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(PARCOURS_STORE)) || {}
    return PARCOURS_DEF.map(p => ({ ...p, pct: saved[p.id] ?? p.initPct }))
  } catch { return PARCOURS_DEF.map(p => ({ ...p, pct: p.initPct })) }
}

function parcoursSave(list) {
  try {
    const obj = {}
    list.forEach(p => { obj[p.id] = p.pct })
    localStorage.setItem(PARCOURS_STORE, JSON.stringify(obj))
  } catch {}
}

function advanceParcours(parcours, score, total) {
  const gain = Math.round((score / total) * 15)
  if (gain <= 0) return parcours
  const updated = [...parcours]
  const idx = updated.findIndex(p => p.pct < 100)
  if (idx >= 0) updated[idx] = { ...updated[idx], pct: Math.min(100, updated[idx].pct + gain) }
  parcoursSave(updated)
  return updated
}

// ─── Contenus statiques (enrichis par APOD dynamique) ───────────────────────

const EDU_CONTENT = [
  { cat: 'Histoire', title: 'De Galilée au télescope spatial', read: '6 min',
    body: 'En 1609, Galilée pointe une lunette vers le ciel et découvre les cratères de la Lune, les phases de Vénus et les quatre lunes de Jupiter. Quatre siècles plus tard, le James Webb observe les premières galaxies de l\'univers. Cette page retrace les grandes étapes instrumentales qui ont transformé notre regard sur le cosmos.' },
  { cat: 'Cosmologie', title: 'Le Big Bang en cinq idées', read: '7 min',
    body: 'L\'univers est en expansion depuis 13,8 milliards d\'années à partir d\'un état chaud et dense. Trois piliers le confirment : la fuite des galaxies, le fond diffus cosmologique à 2,7 K, et l\'abondance des éléments légers forgés dans les premières minutes.' },
  { cat: 'Astrophysique', title: 'Comment naissent les étoiles', read: '5 min',
    body: 'Dans les nuages moléculaires froids, la gravité effondre des grumeaux de gaz jusqu\'à allumer la fusion de l\'hydrogène. Une étoile naît, équilibre entre gravité et pression de radiation, pour des millions à des milliards d\'années.' },
  { cat: 'Découvertes', title: 'La tension de Hubble', read: '6 min',
    body: 'Deux méthodes de mesure de l\'expansion de l\'univers donnent des valeurs incompatibles : 67,4 contre 73 km/s/Mpc. Cet écart de plus de 5σ est l\'un des plus grands mystères de la cosmologie actuelle — erreur systématique ou physique nouvelle ?' },
]

// ─── Glossaire astronomique ──────────────────────────────────────────────────

const GLOSSAIRE = [
  { term: 'Albédo', def: 'Fraction de lumière réfléchie par une surface. La Lune a un albédo de ~12 %, Venus de ~65 %.' },
  { term: 'Apogée', def: 'Point de l\'orbite lunaire (ou d\'un satellite) le plus éloigné de la Terre. Opposé : périgée.' },
  { term: 'Ascension droite', def: 'Coordonnée céleste équivalente à la longitude, mesurée en heures (0 h à 24 h) vers l\'est.' },
  { term: 'Astéroïde', def: 'Petit corps rocheux du système solaire, principalement dans la ceinture principale entre Mars et Jupiter.' },
  { term: 'Bortle (échelle de)', def: 'Échelle de 1 à 9 mesurant la pollution lumineuse du ciel. Bortle 1 = ciel parfait, Bortle 9 = centre-ville.' },
  { term: 'Céphéide', def: 'Étoile variable pulsante dont la période est liée à la luminosité. Sert d\'indicateur de distance cosmique.' },
  { term: 'Chromosphère', def: 'Couche de l\'atmosphère solaire visible lors des éclipses totales, d\'une couleur rose-rouge caractéristique.' },
  { term: 'Comète', def: 'Corps de glace et de poussière qui développe une chevelure (coma) et une queue en s\'approchant du Soleil.' },
  { term: 'Conjonction', def: 'Alignement apparent de deux astres ou plus sur la même droite vue depuis la Terre.' },
  { term: 'Coronagraphe', def: 'Instrument masquant le disque solaire pour observer la couronne ou les exoplanètes proches de leur étoile.' },
  { term: 'Déclinaison', def: 'Coordonnée céleste équivalente à la latitude, mesurée en degrés (−90° à +90°) depuis l\'équateur céleste.' },
  { term: 'Écliptique', def: 'Plan de l\'orbite terrestre autour du Soleil. Les planètes du système solaire sont toutes proches de ce plan.' },
  { term: 'Elongation', def: 'Angle entre un astre et le Soleil vu depuis la Terre. Vénus atteint au maximum ~47° d\'élongation.' },
  { term: 'Équinoxe', def: 'Moment de l\'année où le Soleil passe sur l\'équateur céleste. Durée nuit = durée jour. Deux par an.' },
  { term: 'Exoplanète', def: 'Planète en orbite autour d\'une autre étoile que le Soleil. Plus de 5 500 confirmées en 2024.' },
  { term: 'Fond diffus cosmologique', def: 'Rayonnement fossile à 2,7 K émis 380 000 ans après le Big Bang, preuve clé du modèle standard.' },
  { term: 'Géocroiseur', def: 'Astéroïde dont l\'orbite croise celle de la Terre. Surveillés pour les risques d\'impact potentiel.' },
  { term: 'Héliocentrisme', def: 'Modèle astronomique plaçant le Soleil au centre du système planétaire, défendu par Copernic dès 1543.' },
  { term: 'Hubble (loi de)', def: 'Les galaxies s\'éloignent d\'autant plus vite qu\'elles sont lointaines : v = H₀ × d (H₀ ≈ 70 km/s/Mpc).' },
  { term: 'Infrarouge', def: 'Rayonnement électromagnétique au-delà du rouge visible. JWST observe dans l\'infrarouge proche et moyen.' },
  { term: 'Libration', def: 'Oscillation apparente de la Lune qui permet d\'observer légèrement plus de 50 % de sa surface au total.' },
  { term: 'Luminosité absolue', def: 'Quantité d\'énergie réellement émise par un astre, indépendamment de sa distance. Mesurée en magnitude absolue.' },
  { term: 'Magnitude', def: 'Échelle logarithmique de brillance. Plus la valeur est basse (ou négative), plus l\'astre est brillant.' },
  { term: 'Méridien (passage au)', def: 'Moment où un astre atteint sa hauteur maximale dans le ciel, en traversant le méridien local. Idéal pour observer.' },
  { term: 'Météorite', def: 'Fragment de météoroïde ayant survécu à la traversée atmosphérique et atteint le sol terrestre.' },
  { term: 'Naine blanche', def: 'Résidu dense d\'une étoile de faible masse après sa mort. Taille de la Terre, masse solaire.' },
  { term: 'Nébuleuse', def: 'Nuage de gaz et de poussière interstellaire. Peut être émission (HII), réflexion, absorption ou planétaire.' },
  { term: 'Opposition', def: 'Configuration où une planète supérieure est à l\'opposé du Soleil vu de la Terre — idéale pour observer.' },
  { term: 'Parallaxe', def: 'Décalage apparent d\'un objet proche selon le point d\'observation. Base de la mesure des distances stellaires.' },
  { term: 'Parsec', def: 'Unité de distance : 3,26 années-lumière, soit 3,086 × 10¹³ km. La mesure de référence en astrophysique.' },
  { term: 'Périgée', def: 'Point de l\'orbite lunaire (ou d\'un satellite) le plus proche de la Terre. Super Lune = pleine Lune au périgée.' },
  { term: 'Planète naine', def: 'Corps suffisamment massif pour être sphérique, mais n\'ayant pas « nettoyé » son orbite. Ex : Pluton, Éris.' },
  { term: 'Point de Lagrange', def: 'Position d\'équilibre gravitationnel dans un système à deux corps. JWST orbite autour du point L2 Soleil-Terre.' },
  { term: 'Précession', def: 'Lent balancement de l\'axe de rotation terrestre, d\'une période de ~26 000 ans. Modifie l\'étoile polaire.' },
  { term: 'Pulsar', def: 'Étoile à neutrons émettant des faisceaux radio périodiques. Horloge naturelle parmi les plus précises.' },
  { term: 'Quasar', def: 'Noyau de galaxie actif extrêmement lumineux alimenté par un trou noir supermassif. Visible à des milliards d\'al.' },
  { term: 'Rapport F (ouverture)', def: 'Rapport focal = focale / diamètre. Un f/5 est plus lumineux qu\'un f/10 : champ plus large, poses plus courtes.' },
  { term: 'Seeing', def: 'Qualité de la stabilité atmosphérique. Un mauvais seeing brouille les images hautes résolutions.' },
  { term: 'Solstice', def: 'Moment où le Soleil atteint sa déclinaison maximale (+23,5° en juin, −23,5° en décembre). Jours les plus longs/courts.' },
  { term: 'Spectroscopie', def: 'Décomposition de la lumière en spectre. Révèle la composition chimique, la vitesse radiale et la température des astres.' },
  { term: 'Supernova', def: 'Explosion cataclysmique de fin de vie d\'une étoile massive (type II) ou d\'une naine blanche en accrétion (type Ia).' },
  { term: 'Transit', def: 'Passage d\'un astre devant un autre plus grand. Détection principale des exoplanètes par la méthode des transits.' },
  { term: 'Trou noir', def: 'Région de l\'espace où la gravité est si intense que rien, pas même la lumière, ne peut s\'en échapper.' },
  { term: 'Unité Astronomique (UA)', def: 'Distance moyenne Terre-Soleil : 149,6 millions de km. Référence pour les distances du système solaire.' },
  { term: 'Vitesse de libération', def: 'Vitesse minimale pour échapper à l\'attraction d\'un corps. 11,2 km/s pour la Terre, 620 km/s pour le Soleil.' },
  { term: 'Zenith', def: 'Point du ciel situé exactement à la verticale de l\'observateur. Distance zénithale = 90° − hauteur.' },
  { term: 'Zodiaque', def: 'Bande du ciel le long de l\'écliptique divisée en 12 constellations. Les planètes y circulent toujours.' },
].sort((a, b) => a.term.localeCompare(b.term, 'fr'))

function GlossaireView() {
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
          <div key={g.term} style={{ padding: '13px 15px', borderRadius: 13,
            background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
            <div className="h-card" style={{ fontSize: 14.5, marginBottom: 5 }}>{g.term}</div>
            <div className="body" style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)' }}>{g.def}</div>
          </div>
        ))}
      </div>
      <div className="meta" style={{ textAlign: 'center', marginTop: 18, color: 'var(--faint)' }}>
        {filtered.length} terme{filtered.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ─── Composant Quiz ──────────────────────────────────────────────────────────

function Quiz({ onComplete }) {
  const [questions] = useState(() => pickQuestions(5))
  const [i, setI]         = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore]   = useState(0)
  const [done, setDone]     = useState(false)
  const [stats, setStats]   = useState(null)
  const cur = questions[i]

  const choose = (idx) => {
    if (picked != null) return
    setPicked(idx)
    if (idx === cur.a) setScore(s => s + 1)
  }

  const nextQ = () => {
    if (i + 1 >= questions.length) {
      const saved = recordQuiz(score)
      setStats(saved)
      setDone(true)
      onComplete?.(score, questions.length)
      return
    }
    setI(i + 1)
    setPicked(null)
  }

  const restart = () => { setI(0); setPicked(null); setScore(0); setDone(false); setStats(null) }

  if (done && stats) {
    return (
      <div style={{ padding: 20, borderRadius: 18, textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))',
        border: '1px solid var(--gold-line)' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}><IcTrophy size={28} /></span>
        <div className="h-sec" style={{ fontSize: 22 }}>{score} / {questions.length}</div>
        <div className="body" style={{ fontSize: 13.5, margin: '8px 0 10px' }}>
          {score === questions.length ? 'Sans faute, bravo !'
            : score >= Math.ceil(questions.length / 2) ? 'Beau score, continuez à explorer.'
            : 'Le ciel n\'attend que vous — réessayez !'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
          {stats.streak > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              color: 'var(--gold)', padding: '4px 10px', borderRadius: 99,
              background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
              <IcFlame size={13} /> {stats.streak} jours consécutifs
            </div>
          )}
          {stats.bestScore > 0 && (
            <div style={{ fontSize: 12, color: 'var(--faint)', display: 'flex', alignItems: 'center',
              padding: '4px 10px', borderRadius: 99, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
              Record : {stats.bestScore}/{questions.length}
            </div>
          )}
        </div>
        <button className="btn-primary" onClick={restart}><IcPlay size={17} /> Rejouer</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 18, borderRadius: 18,
      background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="eyebrow">Question {i + 1} / {questions.length}</span>
        <span className="data" style={{ fontSize: 12, color: 'var(--gold)' }}>{score} pt</span>
      </div>
      <div className="h-card" style={{ fontSize: 16, lineHeight: 1.3, marginBottom: 16, fontFamily: 'var(--serif)' }}>{cur.q}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {cur.opts.map((o, idx) => {
          const isA = idx === cur.a, isP = idx === picked
          let bd = 'var(--line-2)', bg = 'var(--surface-1)', cl = 'var(--text)'
          if (picked != null) {
            if (isA)       { bd = 'rgba(132,211,169,.5)'; bg = 'rgba(132,211,169,.1)'; cl = 'var(--good)' }
            else if (isP)  { bd = 'rgba(226,141,126,.5)'; bg = 'rgba(226,141,126,.1)'; cl = 'var(--bad)'  }
          }
          return (
            <button key={idx} onClick={() => choose(idx)} className="press"
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 11,
                padding: '13px 14px', borderRadius: 12, cursor: picked == null ? 'pointer' : 'default',
                background: bg, border: '1px solid ' + bd, color: cl, fontSize: 14,
                fontWeight: 500, fontFamily: 'var(--sans)' }}>
              <span style={{ flex: 1 }}>{o}</span>
              {picked != null && isA && <IcCheckCircle size={18} />}
              {picked != null && isP && !isA && <IcClose size={16} />}
            </button>
          )
        })}
      </div>
      {picked != null && (
        <div style={{ marginTop: 14 }}>
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

  const defi = getTodayDefi()
  const { data: apodArticle } = useLiveData(fetchAPODArticle)

  const onQuizComplete = (score, total) => {
    setQuizStats(quizLoad())
    setXp(xpLoad())
    setParcours(prev => advanceParcours(prev, score, total))
    setTimeout(() => setQuizKey(k => k + 1), 4000)
  }

  const onDefiDone = () => {
    const next = markDefiDone(defi.pts)
    setXp(next)
    setDefiDone(true)
  }

  const allContent = [
    ...(apodArticle ? [apodArticle] : []),
    ...EDU_CONTENT,
  ]

  return (
    <ToolPage title="Apprendre" onBack={onBack}>
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
            <Quiz key={quizKey} onComplete={onQuizComplete} />
          </ToolSection>

          <ToolSection title="Parcours pédagogiques">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {parcours.map(p => (
                <div key={p.id} style={{ padding: 14, borderRadius: 14,
                  background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <span className="h-card" style={{ fontSize: 14, flex: 1 }}>{p.name}</span>
                    {p.pct >= 100
                      ? <IcCheckCircle size={18} style={{ color: 'var(--good)' }} />
                      : <span className="meta" style={{ color: 'var(--gold)' }}>{p.pct}%</span>}
                  </div>
                  <div className="bar"><i style={{ width: p.pct + '%' }} /></div>
                  <div className="meta" style={{ marginTop: 7 }}>{p.steps}</div>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'content' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
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
                <div className="body tight" style={{ fontSize: 12.5 }}>{c.body.slice(0, 96)}…</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {seg === 'glossaire' && <GlossaireView />}

      <Sheet open={!!read} onClose={() => setRead(null)}>
        {read && (
          <div>
            {read.imageUrl && (
              <img src={read.imageUrl} alt={read.title}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 18 }} />
            )}
            <div className="tag" style={{ marginBottom: 12 }}>{read.cat}</div>
            <div className="h-sec" style={{ fontSize: 24, marginBottom: 8, lineHeight: 1.15 }}>{read.title}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 16 }}>
              {read.date || read.read + ' de lecture'}
            </div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62 }}>{read.body}</p>
          </div>
        )}
      </Sheet>
    </ToolPage>
  )
}
