import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IcOrbit, IcChevron, IcArrowLeft, IcWave, IcSpark, IcRocket, IcClose } from './icons'
import { ScreenHeader, SettingsBtn, DataRow, Sheet, AiInfoPanel } from './ui'
import { TipBanner } from './tips'
import { PLANETS, ANOMALIES, THEORIES } from './data'
import { getPlanetPositions } from './astro'
import { fetchJWSTImages, fetchNASAImages } from './api'
import { onbLoad } from './onboarding'

const ASTRO_ID = { mercure: 'mercury', saturne: 'saturn' }

// ─── Données des lunes ────────────────────────────────────────────────────────

const MOONS = {
  terre: [
    { name: 'La Lune', nameEn: 'moon lunar surface nasa', color: '#c8c0a8',
      type: 'Satellite naturel', dist: '384 400 km', orbit: '27,3 j', diam: '3 474 km', temp: '−173 → +127 °C',
      water: true, life: false,
      waterNote: 'Glace d\'eau confirmée dans les cratères polaires ombragés (LCROSS 2009).',
      missions: 'NASA Artemis (base Gateway), ESA Moon Village, missions robotiques chinoises Chang\'e.',
      note: 'Formée il y a 4,5 Ga par l\'impact d\'un corps de la taille de Mars sur la Terre. Stabilise l\'axe de rotation terrestre à 23,5° — essentiel au climat de la Terre. Seul corps extraterrestre visité par des humains (Apollo 1969–1972).' },
  ],
  mars: [
    { name: 'Phobos', nameEn: 'phobos mars moon', color: '#8a7560',
      type: 'Lune irrégulière', dist: '9 378 km', orbit: '7 h 39 min', diam: '27 × 22 × 18 km', temp: '−40 °C moy.',
      water: false, life: false,
      missions: 'Mission JAXA MMX (Mars Moons eXploration) — atterrissage et retour d\'échantillons prévu 2027.',
      note: 'Orbite si basse (2× plus basse que les satellites géostationnaires terrestres) qu\'elle se rapproche de Mars de 2 m par siècle. Dans ~50 millions d\'années, sera disloquée par les forces de marée ou s\'écrasera sur Mars.' },
    { name: 'Déimos', nameEn: 'deimos mars moon', color: '#7a6e5c',
      type: 'Lune irrégulière', dist: '23 460 km', orbit: '30 h 18 min', diam: '15 × 12 × 11 km', temp: '−40 °C moy.',
      water: false, life: false,
      missions: 'Peu visitée. MMX la survolera lors de son trajet vers Phobos.',
      note: 'S\'éloigne très lentement de Mars (contrairement à Phobos). Origine encore débattue : astéroïde de type C capturé ou éjectat d\'un impact géant sur Mars.' },
  ],
  jupiter: [
    { name: 'Io', nameEn: 'io moon jupiter volcanic galileo', color: '#d4a84b',
      type: 'Lune galiléenne', dist: '421 700 km', orbit: '1 j 18 h', diam: '3 643 km', temp: '−143 → +1 600 °C',
      water: false, life: false,
      missions: 'Survols proches par Europa Clipper (NASA) et JUICE (ESA). Juno a observé ses volcans depuis 2021.',
      note: 'Le corps le plus volcanique du système solaire : plus de 400 volcans actifs en permanence. Chauffée par les forces de marée de Jupiter et la résonance de Laplace avec Europa et Ganymède. Éruptions projetant de la matière jusqu\'à 300 km de haut.' },
    { name: 'Europa', nameEn: 'europa moon jupiter ice ocean galileo', color: '#a8c4d8',
      type: 'Lune galiléenne', dist: '671 100 km', orbit: '3 j 12 h', diam: '3 121 km', temp: '−160 °C surface',
      water: true, life: true,
      waterNote: 'Océan liquide salé de ~100 km de profondeur sous 10–30 km de croûte glacée. Volume d\'eau 2× supérieur à tous les océans terrestres réunis.',
      lifeNote: 'Principal candidat à la vie extraterrestre dans le système solaire. Le fond de l\'océan pourrait abriter des fumeurs hydrothermaux, source d\'énergie pour la vie. Europa Clipper cherchera des biosignatures.',
      missions: 'NASA Europa Clipper (arrivée décembre 2030) — 50 survols rapprochés, radar pénétrant la glace. ESA JUICE (arrivée 2032).',
      note: 'Surface de glace striée de fractures tectoniques, renouvelée en permanence. La croûte flotte sur l\'océan. Des panaches d\'eau ont peut-être été détectés par Hubble.' },
    { name: 'Ganymède', nameEn: 'ganymede moon jupiter galileo largest', color: '#8898a8',
      type: 'Lune galiléenne', dist: '1 070 400 km', orbit: '7 j 3 h', diam: '5 268 km', temp: '−163 °C',
      water: true, life: false,
      waterNote: 'Océan souterrain probable emprisonné entre deux couches de glace à ~800 km de profondeur.',
      missions: 'ESA JUICE entrera en orbite de Ganymède en 2034 — première orbite autour d\'une lune autre que la nôtre.',
      note: 'Plus grand satellite du système solaire — plus large que Mercure. Seul satellite à posséder son propre champ magnétique (magnétosphère), créant des aurores visibles en UV. Différencié en noyau de fer, manteau et croûte.' },
    { name: 'Callisto', nameEn: 'callisto moon jupiter cratered galileo', color: '#5a5a6a',
      type: 'Lune galiléenne', dist: '1 882 700 km', orbit: '16 j 17 h', diam: '4 821 km', temp: '−139 °C',
      water: false, life: false,
      missions: 'Survols par JUICE. Envisagée comme base d\'opérations pour de futures missions joviales (hors ceinture de radiation).',
      note: 'Surface la plus cratérisée et la plus ancienne du système solaire — un "registre des bombardements" de l\'histoire du système. Peu de géologie interne : pas de chaleur de marée, pas de tectonique. Hors de la ceinture de radiation de Jupiter : idéale pour une future base humaine.' },
  ],
  saturne: [
    { name: 'Titan', nameEn: 'titan moon saturn cassini huygens atmosphere', color: '#c88840',
      type: 'Lune géante', dist: '1 221 870 km', orbit: '15 j 22 h', diam: '5 150 km', temp: '−179 °C',
      water: false, life: true,
      lifeNote: 'Cycle de méthane liquide analogue au cycle terrestre de l\'eau. Des formes de vie à base de méthane (non aqueuses) seraient hypothétiquement possibles — radicalement différentes de la vie terrestre. Huygens a détecté des molécules prébiotiques complexes.',
      missions: 'NASA Dragonfly (lancement 2028, arrivée 2034) : drone hélicoptère nucléaire qui explorera 8 sites en surface, cherchant la chimie prébiotique.',
      note: 'Seul autre corps du système solaire avec des liquides de surface stables (lacs et mers de méthane/éthane). Atmosphère d\'azote plus dense que celle de la Terre. La sonde Huygens s\'y est posée en 2005, transmettant des images de rivières et côtes de méthane.' },
    { name: 'Encelade', nameEn: 'enceladus moon saturn plumes geysers cassini', color: '#dce8f0',
      type: 'Lune active', dist: '237 948 km', orbit: '1 j 8 h', diam: '504 km', temp: '−201 °C (pôle S : −93 °C)',
      water: true, life: true,
      waterNote: 'Geysers d\'eau salée projetés à 500+ km dans l\'espace par le pôle sud, alimentant l\'anneau E de Saturne. Océan sous-glaciaire global confirmé.',
      lifeNote: 'Cassini a détecté dans les geysers : eau liquide salée, silice (= activité hydrothermale), H₂ moléculaire, CO₂ et molécules organiques complexes. Toutes les conditions connues pour la vie sont réunies. Candidat numéro 1 à la vie dans le système solaire externe.',
      missions: 'Pas de mission dédiée confirmée. Plusieurs concepts étudiés : orbiteur, plongeur dans les geysers, sous-marin. Une décision de l\'ESA/NASA est attendue dans les prochaines années.',
      note: 'Malgré ses 504 km de diamètre (à peine la taille de la France), Encelade est l\'un des corps les plus actifs géologiquement. 1 kg de matière est éjecté chaque seconde dans l\'espace via ses geysers.' },
    { name: 'Mimas', nameEn: 'mimas moon saturn herschel crater cassini', color: '#b8b8c8',
      type: 'Lune glacée', dist: '185 520 km', orbit: '22 h 36 min', diam: '396 km', temp: '−200 °C',
      water: false, life: false,
      missions: 'Observée par Cassini. Possible mission future de la NASA Discovery.',
      note: 'Surnommée "l\'Étoile de la Mort" : son cratère Herschel (139 km de diamètre, 1/3 de Mimas) lui donne une ressemblance frappante avec la station spatiale fictive. Surprise de 2024 : des oscillations de sa surface suggèrent un océan interne liquide, inattendu pour un si petit corps.' },
    { name: 'Rhéa', nameEn: 'rhea moon saturn cassini', color: '#c0b8b0',
      type: 'Lune glacée', dist: '527 108 km', orbit: '4 j 12 h', diam: '1 527 km', temp: '−174 °C',
      water: false, life: false,
      missions: 'Observée par Cassini (nombreux survols). Pas de mission dédiée prévue.',
      note: 'Deuxième plus grande lune de Saturne. Surface fortement cratérisée, très réfléchissante. Possède une atmosphère ténue d\'oxygène et de dioxyde de carbone — l\'une des rares lunes avec une atmosphère mesurable.' },
    { name: 'Dioné', nameEn: 'dione moon saturn cassini icy cliffs', color: '#b4b0b8',
      type: 'Lune glacée', dist: '377 396 km', orbit: '2 j 18 h', diam: '1 122 km', temp: '−186 °C',
      water: false, life: false,
      missions: 'Observée par Cassini.',
      note: 'Falaises de glace verticales atteignant des centaines de mètres. Possible activité géologique ancienne. Hémisphère avant parsemé de stries brillantes qui sont des falaises de glace vives.' },
    { name: 'Japet', nameEn: 'iapetus moon saturn two-tone cassini', color: '#786050',
      type: 'Lune glacée', dist: '3 560 820 km', orbit: '79 j 7 h', diam: '1 469 km', temp: '−143 → −173 °C',
      water: false, life: false,
      missions: 'Observée par Cassini.',
      note: 'L\'une des grandes énigmes du système solaire : hémisphère avant extrêmement sombre (rouge-brun, comme du goudron), hémisphère arrière extrêmement brillant (comme de la neige). Crête équatoriale unique de 20 km de haut, dont l\'origine reste mystérieuse.' },
  ],
  uranus: [
    { name: 'Miranda', nameEn: 'miranda moon uranus voyager cliff', color: '#787880',
      type: 'Lune moyenne', dist: '129 900 km', orbit: '1 j 10 h', diam: '472 km', temp: '−187 °C',
      water: false, life: false,
      missions: 'Seul Voyager 2 l\'a survolée en 1986. Une mission Uranus Orbiter Probe (NASA) est recommandée pour les années 2030.',
      note: 'Terrain géologique le plus chaotique du système solaire : canyons, terrasses, et Verona Rupes, une falaise verticale de 20 km — la plus haute du système solaire. On a pensé qu\'elle avait été détruite par un impact et s\'était réassemblée en désordre.' },
    { name: 'Ariel', nameEn: 'ariel moon uranus voyager', color: '#909098',
      type: 'Lune moyenne', dist: '191 020 km', orbit: '2 j 12 h', diam: '1 158 km', temp: '−213 °C',
      water: false, life: false,
      missions: 'Uranus Orbiter Probe prévu dans les années 2030.',
      note: 'Surface la plus brillante des lunes d\'Uranus. Vastes vallées et canyons suggèrent une activité géologique ancienne. Peu photographiée — Voyager 2 n\'a capturé qu\'un hémisphère lors de son passage rapide.' },
    { name: 'Umbriel', nameEn: 'umbriel moon uranus voyager dark', color: '#484858',
      type: 'Lune moyenne', dist: '266 000 km', orbit: '4 j 3 h', diam: '1 169 km', temp: '−203 °C',
      water: false, life: false,
      missions: 'Uranus Orbiter Probe.',
      note: 'Lune la plus sombre d\'Uranus, couverte d\'un matériau opaque d\'origine inconnue. Un anneau lumineux mystérieux (Wunda) est visible à son pôle nord dans les images Voyager 2.' },
    { name: 'Titania', nameEn: 'titania moon uranus voyager largest', color: '#7a8088',
      type: 'Lune majeure', dist: '436 300 km', orbit: '8 j 17 h', diam: '1 578 km', temp: '−213 °C',
      water: false, life: false,
      missions: 'Uranus Orbiter Probe.',
      note: 'Plus grande lune d\'Uranus. Canyon Messina Chasmata long de 1 500 km et profond de plusieurs km. Images très limitées — seulement un hémisphère vu par Voyager 2 en 1986, à 369 000 km.' },
    { name: 'Obéron', nameEn: 'oberon moon uranus voyager outermost', color: '#686870',
      type: 'Lune majeure', dist: '583 500 km', orbit: '13 j 11 h', diam: '1 523 km', temp: '−198 °C',
      water: false, life: false,
      missions: 'Uranus Orbiter Probe.',
      note: 'Lune la plus externe des cinq grandes lunes d\'Uranus. Surface fortement cratérisée avec des dépôts sombres au fond de certains cratères — peut-être des produits carbonés.' },
  ],
  neptune: [
    { name: 'Triton', nameEn: 'triton moon neptune voyager retrograde', color: '#7898b8',
      type: 'Lune capturée', dist: '354 760 km', orbit: '5 j 21 h (rétrograde)', diam: '2 707 km', temp: '−235 °C',
      water: false, life: false,
      missions: 'Concept Trident (NASA) — non sélectionné en 2021 mais reconsidéré. Aucune mission confirmée.',
      note: 'Orbite rétrograde (sens inverse de Neptune) : clairement un objet capturé depuis la Ceinture de Kuiper. Geysers d\'azote actifs observés par Voyager 2. Son terrain "melon d\'eau" (cantaloupe terrain) est unique. Se rapproche de Neptune et se désintégrera ou s\'écrasera dans ~3,6 milliards d\'années.' },
    { name: 'Néréide', nameEn: 'nereid moon neptune voyager', color: '#586878',
      type: 'Lune irrégulière', dist: '5 513 400 km (moy.)', orbit: '360 j', diam: '340 km', temp: '−220 °C',
      water: false, life: false,
      missions: 'Aucune mission dédiée.',
      note: 'Orbite très allongée (excentricité 0,75 — la plus forte du système solaire pour une lune majeure). Probablement perturbée lors de la capture de Triton. Réflectivité variable suggérant une rotation chaotique.' },
  ],
}

// ─── Lightbox (plein écran) ───────────────────────────────────────────────────

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.96)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px' }}>
      <img src={photo.thumbUrl} alt={photo.caption}
        style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 10 }} />
      {photo.caption && (
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, marginTop: 18, textAlign: 'center',
          fontFamily: 'var(--serif)', lineHeight: 1.5, maxWidth: 360, padding: '0 8px' }}>
          {photo.caption}
        </p>
      )}
      <div style={{ marginTop: 14, color: 'rgba(255,255,255,.3)', fontSize: 11.5,
        fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>
        Touchez pour fermer
      </div>
    </div>
  )
}

// ─── Galerie photo NASA ───────────────────────────────────────────────────────

function PhotoGallery({ query, title = 'Photos NASA · JPL' }) {
  const [photos, setPhotos] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchNASAImages(query, 6)
      .then(setPhotos)
      .catch(() => setPhotos([]))
  }, [query])

  if (!photos) {
    return (
      <div style={{ marginTop: 22 }}>
        <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 10 }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ height: 110, borderRadius: 12, background: 'var(--surface-1)',
              animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.12 + 's' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!photos.length) return null

  return (
    <>
      <div style={{ marginTop: 22 }}>
        <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 10 }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {photos.map((ph, i) => (
            <button key={i} onClick={() => setLightbox(ph)} className="press"
              style={{ padding: 0, border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden',
                background: 'var(--surface-1)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ height: 110, overflow: 'hidden', background: '#060c1c' }}>
                <img src={ph.thumbUrl} alt={ph.caption}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              {ph.caption && (
                <div style={{ padding: '6px 9px 9px', fontSize: 10.5, lineHeight: 1.3,
                  color: 'var(--faint)', fontFamily: 'var(--mono)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ph.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}

// ─── Visuel planète ───────────────────────────────────────────────────────────

function PlanetOrb({ p, size = 92 }) {
  const ring = p.id === 'saturne' || p.id === 'uranus'
  return (
    <div style={{ position: 'relative', width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 34% 30%, ${p.glow}, ${p.color} 58%, #0a0f1d 130%)`,
        boxShadow: `0 0 30px ${p.color}44, inset -8px -8px 20px rgba(0,0,0,.45)` }} />
      {ring && (
        <div style={{ position: 'absolute', width: size * 1.7, height: size * 0.5,
          border: `${size * 0.06}px solid ${p.glow}`, borderRadius: '50%', opacity: .55,
          transform: 'rotate(-18deg)', borderTopColor: 'transparent', borderBottomColor: `${p.glow}88` }} />
      )}
    </div>
  )
}

function PlanetPhoto({ p, size = 92 }) {
  const [imgOk, setImgOk] = useState(!!p.img)
  if (!imgOk) return <PlanetOrb p={p} size={size} />
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: `0 0 28px ${p.color}55, 0 4px 18px rgba(0,0,0,.55)` }}>
      <img src={p.img} alt={p.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => setImgOk(false)} />
    </div>
  )
}

// ─── Carte planète (grille) ───────────────────────────────────────────────────

function PlanetCard({ p, pos, onPick, onMoons }) {
  const moonList = MOONS[p.id] || []
  const hasMoons = moonList.length > 0

  return (
    <div style={{ flexShrink: 0, width: 150, display: 'flex', flexDirection: 'column' }}>
      <button onClick={() => onPick(p)} className="press"
        style={{ flex: 1, background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
          border: '1px solid var(--line)', borderBottom: hasMoons ? 0 : '1px solid var(--line)',
          borderRadius: hasMoons ? '16px 16px 0 0' : 'var(--r-l)',
          padding: 18, cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <PlanetPhoto p={p} size={92} />
        </div>
        <div className="meta" style={{ color: 'var(--gold)', marginBottom: 3 }}>{p.dist}</div>
        <div className="h-card" style={{ fontSize: 16 }}>{p.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2, marginBottom: pos ? 8 : 0 }}>{p.sub}</div>
        {pos && (
          <span className={'tag' + (pos.visible ? ' live' : ' neutral')} style={{ fontSize: 10 }}>
            {pos.visible ? 'Visible ce soir' : 'Non visible'}
          </span>
        )}
      </button>
      {hasMoons && (
        <button onClick={() => onMoons(p)} className="press"
          style={{ padding: '8px 12px', cursor: 'pointer', textAlign: 'center',
            background: 'var(--surface-2)', color: 'var(--dim)',
            border: '1px solid var(--line)', borderTop: '1px solid var(--line-2)',
            borderRadius: '0 0 16px 16px', fontSize: 11.5, fontFamily: 'var(--mono)',
            letterSpacing: '.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span style={{ fontSize: 13 }}>◦</span>
          {p.moons} lune{p.moons > 1 ? 's' : ''}
          {p.moons > moonList.length && ` · ${moonList.length} détaillées`}
        </button>
      )}
    </div>
  )
}

// ─── Fiche planète (Sheet) ────────────────────────────────────────────────────

function PlanetSheetContent({ planet, pos }) {
  const [imgOk, setImgOk] = useState(!!planet.img)

  return (
    <div>
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 220,
        background: `radial-gradient(circle at 34% 30%, ${planet.glow}, ${planet.color} 58%, #0a0f1d 130%)`,
        position: 'relative' }}>
        {planet.img && imgOk && (
          <img src={planet.img} alt={planet.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgOk(false)} />
        )}
        {(!planet.img || !imgOk) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlanetOrb p={planet} size={140} />
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="tag" style={{ marginBottom: 8 }}>{planet.sub}</div>
        <div className="h-sec" style={{ fontSize: 28 }}>{planet.name}</div>
      </div>

      {pos && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <span className={'tag' + (pos.visible ? ' live' : ' neutral')}>
            {pos.visible ? 'Visible ce soir' : 'Non visible ce soir'}
          </span>
          <span className="tag neutral">Dist. {pos.distLabel}</span>
          <span className="tag neutral">mag {pos.mag}</span>
        </div>
      )}

      <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, textAlign: 'center', margin: '0 0 14px' }}>
        {planet.note}
      </p>

      <AiInfoPanel cacheKey={`explore_planet_${planet.id}`} style={{ marginBottom: 18 }}
        buildPrompt={`Planète ${planet.name} (${planet.sub}) : diamètre ${planet.diam}, masse ${planet.mass}, distance ${planet.dist}, température ${planet.temp}, ${planet.moons} lune(s).
${planet.note}
En 4 phrases, décris ce qu'un astronome amateur peut voir de ${planet.name} avec un télescope, les aspects les plus fascinants, et une anecdote marquante sur cette planète.`} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <DataRow k="Diamètre" v={planet.diam} accent />
        <DataRow k="Masse" v={planet.mass} />
        <DataRow k="Jour" v={planet.day} />
        <DataRow k="Année" v={planet.year} />
        <DataRow k="Lunes" v={planet.moons} />
        <DataRow k="Distance orb." v={planet.dist} />
        <DataRow k="Température" v={planet.temp} />
        {pos && <DataRow k="Distance actuelle" v={pos.distLabel} accent />}
        {pos && <DataRow k="Magnitude" v={`mag ${pos.mag}`} />}
      </div>

      <PhotoGallery query={planet.nameEn || planet.name + ' planet NASA'} title="Photos NASA · JPL" />
    </div>
  )
}

// ─── Détail d'une lune ────────────────────────────────────────────────────────

function MoonDetail({ moon, onBack }) {
  const [heroUrl, setHeroUrl] = useState(null)
  const heroFetched = useRef(false)

  useEffect(() => {
    if (heroFetched.current) return
    heroFetched.current = true
    fetchNASAImages(moon.nameEn, 1)
      .then(photos => { if (photos.length) setHeroUrl(photos[0].thumbUrl) })
      .catch(() => {})
  }, [moon.nameEn])

  return (
    <div>
      {/* Bouton retour */}
      <button onClick={onBack} className="press"
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 0,
          cursor: 'pointer', color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 12,
          letterSpacing: '.06em', padding: '0 0 18px', textTransform: 'uppercase' }}>
        <IcArrowLeft size={15} /> Toutes les lunes
      </button>

      {/* Hero photo */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 210,
        background: `radial-gradient(circle at 40% 35%, ${moon.color}cc, ${moon.color}44 60%, #060c1c)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {heroUrl ? (
          <img src={heroUrl} alt={moon.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle at 38% 34%, ${moon.color}, ${moon.color}88 60%, #0a0f1d)`,
            boxShadow: `0 0 40px ${moon.color}66, inset -6px -6px 16px rgba(0,0,0,.5)`,
            animation: 'pulse 2s ease-in-out infinite' }} />
        )}
      </div>

      {/* En-tête */}
      <div style={{ marginBottom: 16 }}>
        <div className="tag neutral" style={{ marginBottom: 8 }}>{moon.type}</div>
        <div className="h-sec" style={{ fontSize: 26, marginBottom: 6 }}>{moon.name}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {moon.water && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontFamily: 'var(--mono)',
              background: 'rgba(80,160,220,.12)', border: '1px solid rgba(80,160,220,.35)',
              color: '#6ab8e8' }}>
              <IcWave size={12} /> Eau
            </span>
          )}
          {moon.life && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontFamily: 'var(--mono)',
              background: 'rgba(100,200,120,.12)', border: '1px solid rgba(100,200,120,.35)',
              color: '#78d494' }}>
              <IcSpark size={12} /> Potentiel vie
            </span>
          )}
          {moon.missions && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontFamily: 'var(--mono)',
              background: 'rgba(217,179,108,.08)', border: '1px solid var(--gold-line)',
              color: 'var(--gold)' }}>
              <IcRocket size={12} /> Mission
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.65, marginBottom: 16 }}>
        {moon.note}
      </p>

      {/* Panel IA */}
      <AiInfoPanel
        cacheKey={`moon_${moon.name.toLowerCase().replace(/\s/g, '_')}`}
        style={{ marginBottom: 16 }}
        buildPrompt={`Lune ${moon.name} : ${moon.type}, diamètre ${moon.diam}, distance de sa planète ${moon.dist}, période orbitale ${moon.orbit}, température ${moon.temp}.
${moon.note}
${moon.waterNote ? 'Eau : ' + moon.waterNote : ''}
${moon.lifeNote ? 'Potentiel vie : ' + moon.lifeNote : ''}

En 4 phrases, explique ce qui rend ${moon.name} fascinante pour un passionné d\'astronomie : ce qu\'on y découvrirait si on pouvait s\'y poser, pourquoi les scientifiques s\'y intéressent tant, et une comparaison avec un environnement terrestre connu.`}
      />

      {/* Caractéristiques */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 16 }}>
        <DataRow k="Diamètre" v={moon.diam} accent />
        <DataRow k="Distance" v={moon.dist} />
        <DataRow k="Orbite" v={moon.orbit} />
        <DataRow k="Température" v={moon.temp} />
        <DataRow k="Type" v={moon.type} />
      </div>

      {/* Eau */}
      {moon.waterNote && (
        <div style={{ borderRadius: 14, padding: '13px 15px', marginBottom: 12,
          background: 'rgba(80,160,220,.07)', border: '1px solid rgba(80,160,220,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IcWave size={16} style={{ color: '#6ab8e8', flexShrink: 0 }} />
            <span className="h-card" style={{ fontSize: 13.5, color: '#6ab8e8' }}>Présence d\'eau</span>
          </div>
          <p className="body" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>
            {moon.waterNote}
          </p>
        </div>
      )}

      {/* Hypothèse vie */}
      {moon.lifeNote && (
        <div style={{ borderRadius: 14, padding: '13px 15px', marginBottom: 12,
          background: 'rgba(100,200,120,.07)', border: '1px solid rgba(100,200,120,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IcSpark size={16} style={{ color: '#78d494', flexShrink: 0 }} />
            <span className="h-card" style={{ fontSize: 13.5, color: '#78d494' }}>Hypothèse de vie</span>
          </div>
          <p className="body" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>
            {moon.lifeNote}
          </p>
        </div>
      )}

      {/* Missions futures */}
      {moon.missions && (
        <div style={{ borderRadius: 14, padding: '13px 15px', marginBottom: 16,
          background: 'rgba(217,179,108,.06)', border: '1px solid var(--gold-line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IcRocket size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span className="h-card" style={{ fontSize: 13.5, color: 'var(--gold)' }}>Missions & exploration</span>
          </div>
          <p className="body" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--dim)', margin: 0 }}>
            {moon.missions}
          </p>
        </div>
      )}

      {/* Galerie NASA */}
      <PhotoGallery query={moon.nameEn} title="Photos NASA · JPL" />
    </div>
  )
}

// ─── Liste des lunes d\'une planète ────────────────────────────────────────────

function MoonListItem({ moon, onSelect }) {
  return (
    <button onClick={() => onSelect(moon)} className="press"
      style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
        borderBottom: '1px solid var(--line)' }}>
      {/* Miniature couleur */}
      <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: `radial-gradient(circle at 38% 34%, ${moon.color}ee, ${moon.color}66 60%, #0a0f1d)`,
        boxShadow: `0 0 14px ${moon.color}44, inset -4px -4px 10px rgba(0,0,0,.5)` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="h-card" style={{ fontSize: 15, marginBottom: 3 }}>{moon.name}</div>
        <div className="meta" style={{ marginBottom: 5 }}>{moon.type} · {moon.diam}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {moon.water && (
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 7px', borderRadius: 99,
              background: 'rgba(80,160,220,.12)', border: '1px solid rgba(80,160,220,.3)', color: '#6ab8e8' }}>
              Eau
            </span>
          )}
          {moon.life && (
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 7px', borderRadius: 99,
              background: 'rgba(100,200,120,.12)', border: '1px solid rgba(100,200,120,.3)', color: '#78d494' }}>
              Vie potentielle
            </span>
          )}
          {moon.missions && (
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 7px', borderRadius: 99,
              background: 'rgba(217,179,108,.08)', border: '1px solid var(--gold-line)', color: 'var(--gold)' }}>
              Mission
            </span>
          )}
        </div>
      </div>
      <IcChevron size={16} className="arrow" />
    </button>
  )
}

// ─── Sheet des lunes ──────────────────────────────────────────────────────────

function MoonsSheet({ planet, open, onClose }) {
  const [selectedMoon, setSelectedMoon] = useState(null)
  const moons = planet ? (MOONS[planet.id] || []) : []

  useEffect(() => { if (!open) setSelectedMoon(null) }, [open])

  if (!planet) return null

  return (
    <Sheet open={open} onClose={onClose}>
      {selectedMoon ? (
        <MoonDetail moon={selectedMoon} onBack={() => setSelectedMoon(null)} />
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 34% 30%, ${planet.glow}, ${planet.color} 58%, #0a0f1d)`,
              boxShadow: `0 0 20px ${planet.color}44` }} />
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{planet.name}</div>
              <div className="h-sec" style={{ fontSize: 22 }}>
                {planet.moons} lune{planet.moons > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {planet.moons > moons.length && (
            <div style={{ marginBottom: 14, padding: '9px 13px', borderRadius: 10,
              background: 'var(--surface-1)', border: '1px solid var(--line)',
              fontSize: 12.5, color: 'var(--faint)', lineHeight: 1.5 }}>
              {planet.moons} lunes au total — les {moons.length} principales sont détaillées ci-dessous.
            </div>
          )}

          <div>
            {moons.map((m, i) => (
              <MoonListItem
                key={m.name}
                moon={m}
                onSelect={setSelectedMoon}
              />
            ))}
          </div>
        </div>
      )}
    </Sheet>
  )
}

// ─── Fiche Soleil ─────────────────────────────────────────────────────────────

function SunSheet({ open, onClose }) {
  const [heroUrl, setHeroUrl] = useState(null)

  useEffect(() => {
    if (!open || heroUrl) return
    fetchNASAImages('solar dynamics observatory full disk', 1)
      .then(photos => { if (photos.length) setHeroUrl(photos[0].thumbUrl) })
      .catch(() => {})
  }, [open])

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 220,
        background: 'radial-gradient(circle at 50% 50%, #fff9e6 0%, #ffd200 20%, #ff8000 55%, #c03800 85%, #5c1200 100%)' }}>
        {heroUrl && (
          <img src={heroUrl} alt="Le Soleil"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      <div className="tag" style={{ marginBottom: 8 }}>Étoile naine jaune · G2V</div>
      <div className="h-sec" style={{ fontSize: 28, marginBottom: 14 }}>Le Soleil</div>

      <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.65, margin: '0 0 14px' }}>
        Notre étoile, à 150 millions de km. Diamètre de 1,39 million de km, il représente 99,86&nbsp;%
        de la masse du système solaire. Sa photosphère brûle à 5 500&nbsp;°C tandis que sa couronne
        dépasse 1 million de degrés — un paradoxe encore inexpliqué.
      </p>

      <AiInfoPanel cacheKey="explore_sun" style={{ marginBottom: 18 }}
        buildPrompt="Le Soleil — étoile naine jaune G2V, âge 4,6 Ga, luminosité 3,83×10²⁶ W, rotation différentielle (25 j à l\'équateur, 35 j aux pôles). En 4 phrases, décris les phénomènes les plus spectaculaires observables (couronne, éruptions, taches, proéminences) et leur impact sur la Terre et les observateurs." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 4 }}>
        <DataRow k="Diamètre" v="1,39 M km" accent />
        <DataRow k="Masse" v="1,99 × 10³⁰ kg" />
        <DataRow k="Température surface" v="5 500 °C" />
        <DataRow k="Température couronne" v="> 1 000 000 °C" />
        <DataRow k="Distance Terre" v="1 UA · 150 M km" />
        <DataRow k="Âge" v="4,6 milliards d\'ans" />
      </div>

      <PhotoGallery query="solar corona chromosphere sunspot" title="Couronne · Chromosphère · Taches" />
      <PhotoGallery query="solar flare prominence eruption SDO" title="Éruptions · Proéminences solaires" />
    </Sheet>
  )
}

// ─── Vue Système solaire ──────────────────────────────────────────────────────

function WikiLink({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14,
      padding: '6px 13px', borderRadius: 99,
      background: 'rgba(217,179,108,.07)', border: '1px solid rgba(217,179,108,.25)',
      color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)',
      textTransform: 'uppercase', letterSpacing: '.07em', textDecoration: 'none',
    }}>
      Lire sur Wikipédia →
    </a>
  )
}

function SolarView({ onPick, onSun, onMoons, planetPositions }) {
  return (
    <div className="enter">
      <p className="body" style={{ padding: '6px 18px 4px', fontSize: 12.5 }}>
        Huit planètes en orbite autour du Soleil. Touchez pour les caractéristiques et les photos.
      </p>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '12px 18px 18px', scrollbarWidth: 'none' }}>
        {PLANETS.map(p => {
          const astroId = ASTRO_ID[p.id] ?? p.id
          const pos = planetPositions.find(x => x.id === astroId)
          return <PlanetCard key={p.id} p={p} pos={pos} onPick={onPick} onMoons={onMoons} />
        })}
      </div>

      <div className="pad">
        <button onClick={onSun} className="press" style={{ width: '100%', textAlign: 'left', padding: 0,
          background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
          borderRadius: 'var(--r-l)', overflow: 'hidden', cursor: 'pointer' }}>
          <div style={{ height: 110, overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 60%, #fff9e6 0%, #ffd200 22%, #ff8000 55%, #c03800 85%, #5c1200 100%)' }} />
          <div style={{ padding: '12px 16px', display: 'flex', gap: 13, alignItems: 'center' }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)',
              border: '1px solid var(--gold-line)', flexShrink: 0 }}><IcOrbit size={20} /></span>
            <div style={{ flex: 1 }}>
              <div className="h-card" style={{ fontSize: 15 }}>Le Soleil</div>
              <div className="body tight" style={{ fontSize: 12 }}>Étoile naine jaune G2V · 1,39 M km · 99,86 % de la masse du système</div>
            </div>
            <IcChevron size={17} className="arrow" />
          </div>
        </button>
      </div>
    </div>
  )
}

// ─── Vue James Webb ───────────────────────────────────────────────────────────

function JwstView() {
  const [images, setImages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [tick, setTick] = useState(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    setLoading(true)
    fetchJWSTImages()
      .then(imgs => { if (alive.current) { setImages(imgs); setLoading(false) } })
      .catch(() => { if (alive.current) { setImages([]); setLoading(false) } })
    return () => { alive.current = false }
  }, [tick])

  return (
    <div className="enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 4px' }}>
        <p className="body" style={{ fontSize: 12, margin: 0, color: 'var(--faint)' }}>
          Wikimedia Commons · James Webb Space Telescope
        </p>
        <button onClick={() => setTick(t => t + 1)} style={{
          background: 'none', border: '1px solid var(--line)', borderRadius: 99, flexShrink: 0,
          color: 'var(--gold)', fontSize: 10.5, fontFamily: 'var(--mono)', padding: '4px 10px',
          textTransform: 'uppercase', letterSpacing: '.07em', cursor: 'pointer',
        }}>↻ Actualiser</button>
      </div>

      {loading && (
        <div style={{ display: 'flex', gap: 5, padding: '20px 18px' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
              animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
      )}

      {!loading && images?.length === 0 && (
        <div style={{ padding: '20px 18px', color: 'var(--faint)', fontSize: 13 }}>
          Impossible de charger les images. Vérifiez votre connexion et réessayez.
        </div>
      )}

      {!loading && images?.length > 0 && (
        <div className="pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 10 }}>
          {images.map(img => (
            <button key={img.id} onClick={() => setSelected(img)} className="press"
              style={{ textAlign: 'left', background: 'var(--surface-1)', border: '1px solid var(--line)',
                borderRadius: 'var(--r-m)', overflow: 'hidden', padding: 0, cursor: 'pointer' }}>
              <div style={{ height: 120, overflow: 'hidden', background: '#060c1c' }}>
                <img src={img.thumbUrl} alt={img.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '9px 11px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="tag neutral">JWST</span>
                  {img.date && <span className="meta" style={{ fontSize: 9.5 }}>{img.date}</span>}
                </div>
                <div className="h-card" style={{ fontSize: 12.5, lineHeight: 1.3 }}>
                  {img.name.length > 46 ? img.name.slice(0, 45) + '…' : img.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: '#060c1c' }}>
              <img src={selected.thumbUrl} alt={selected.name}
                style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
            </div>
            <div className="tag neutral" style={{ marginBottom: 10 }}>James Webb · JWST</div>
            <div className="h-sec" style={{ fontSize: 22, marginBottom: 6 }}>{selected.name}</div>
            {selected.date && (
              <div className="meta" style={{ color: 'var(--gold)', marginBottom: 12 }}>{selected.date}</div>
            )}
            {selected.desc && selected.desc !== selected.name && (
              <p className="body serif-body" style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>
                {selected.desc.length > 400 ? selected.desc.slice(0, 399) + '…' : selected.desc}
              </p>
            )}
            <a href={selected.pageUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 99,
              background: 'rgba(217,179,108,.07)', border: '1px solid rgba(217,179,108,.25)',
              color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)',
              textTransform: 'uppercase', letterSpacing: '.07em', textDecoration: 'none',
            }}>
              Voir sur Wikimedia Commons →
            </a>
          </div>
        )}
      </Sheet>
    </div>
  )
}

// ─── Vue Anomalies ────────────────────────────────────────────────────────────

function AnomalyView({ onPick }) {
  return (
    <div className="enter pad">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 6 }}>
        {ANOMALIES.map(a => (
          <button key={a.id} onClick={() => onPick(a)} className="press" style={{ textAlign: 'left',
            background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
            borderRadius: 'var(--r-m)', padding: 16, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, boxShadow: `0 0 12px ${a.color}` }} />
              <span className="h-card" style={{ fontSize: 16, flex: 1 }}>{a.name}</span>
            </div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 9, letterSpacing: '.08em', textTransform: 'uppercase' }}>{a.tag}</div>
            <div className="body tight" style={{ fontSize: 13 }}>{a.short}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Vue Théories ─────────────────────────────────────────────────────────────

function TheoryView({ onPick }) {
  return (
    <div className="enter pad">
      <div className="card-2" style={{ overflow: 'hidden', marginTop: 6 }}>
        {THEORIES.map((t, i) => (
          <button key={t.id} onClick={() => onPick(t)} className="press" style={{ width: '100%', textAlign: 'left',
            display: 'flex', gap: 14, alignItems: 'center', padding: '15px 15px', background: 'none',
            border: 0, borderBottom: i < THEORIES.length - 1 ? '1px solid var(--line)' : 0, cursor: 'pointer' }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 22,
              color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>{t.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="h-card" style={{ fontSize: 15 }}>{t.name}</span>
              </span>
              <span className="meta" style={{ display: 'block', color: 'var(--gold)', margin: '2px 0 4px' }}>{t.when}</span>
              <span className="body tight" style={{ fontSize: 12.5, display: 'block' }}>{t.short}</span>
            </span>
            <IcChevron size={17} className="arrow" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Conquête spatiale — données ─────────────────────────────────────────────

const CONQUEST = [
  { id:'intro', num:'', label:'Introduction', badge:'Intro',
    title:'Pourquoi explorer l\'espace ?', sub:'Définition · Guerre froide · Enjeux',
    color:'#3d6b9e',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/a/a8/NASA-Apollo8-Dec24-Earthrise.jpg',
    sections:[
      { heading:'La conquête spatiale, qu\'est-ce que c\'est ?',
        text:'La conquête spatiale désigne l\'ensemble des activités humaines visant à explorer et comprendre l\'espace au-delà de l\'atmosphère. Elle se divise en deux branches : le vol habité (astronautes en orbite, sur la Lune, demain sur Mars) et l\'exploration robotique (sondes, rovers, télescopes spatiaux). Depuis Spoutnik en 1957, plus de 600 humains ont voyagé dans l\'espace et des centaines de sondes ont exploré chaque recoin du système solaire. La conquête spatiale est à la fois une aventure scientifique, technologique et profondément humaine.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/a/a8/NASA-Apollo8-Dec24-Earthrise.jpg',
        aiKey:'intro_def', aiPrompt:'Qu\'est-ce que la conquête spatiale dans toute sa dimension (vols habités, sondes robotiques, télescopes) ? Pourquoi est-elle considérée comme l\'une des plus grandes aventures de l\'humanité, et quelle différence existe-t-il entre exploration spatiale et colonisation ? 4 phrases captivantes.' },
      { heading:'Guerre froide — moteur de la course à l\'espace',
        text:'La conquête spatiale naît de la rivalité entre les États-Unis et l\'URSS pendant la Guerre froide (1947–1991). Chaque exploit spatial est une victoire idéologique : le premier satellite, le premier homme en orbite, la première marche sur la Lune. Cette compétition nourrie par la peur et l\'orgueil national a produit en moins de 15 ans les avancées technologiques les plus spectaculaires du XXe siècle. À partir des années 1970, la rivalité a cédé la place à une coopération progressive, incarnée aujourd\'hui par la Station spatiale internationale.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
        aiKey:'intro_cold', aiPrompt:'Comment la Guerre froide a-t-elle été le moteur de la conquête spatiale ? Pourquoi cette rivalité USA/URSS a-t-elle paradoxalement produit les plus grandes avancées spatiales de l\'histoire, et comment la coopération internationale (ISS) a-t-elle changé le modèle ? 4 phrases.' },
      { heading:'Des enjeux multiples',
        text:'Les enjeux sont scientifiques (comprendre l\'univers, l\'origine de la vie), politiques (prestige national, soft power), économiques (GPS, satellites météo, internet, matériaux composites) et philosophiques. La vision de la Terre depuis l\'espace engendre ce que les astronautes appellent l\'« Overview Effect » — une prise de conscience soudaine de la fragilité et de l\'unicité de notre planète. Plus de 45 % des astronautes ayant vécu cette expérience déclarent avoir profondément changé de regard sur le monde. La conquête spatiale est aussi, fondamentalement, un acte d\'espoir.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/04/International_Space_Station_after_undocking_of_STS-132.jpg',
        aiKey:'intro_stakes', aiPrompt:'Quels sont les enjeux réels de la conquête spatiale (scientifiques, économiques, politiques, philosophiques) ? Parle de l\'Overview Effect (la perception de la Terre qui transforme les astronautes) et des technologies du quotidien nées de la course à l\'espace. 4 phrases.' },
    ] },
  { id:'ch1', num:'01', label:'Chapitre 1', badge:'Ch. 1',
    title:'Les prémisses (avant 1957)', sub:'Tsiolkovski · Goddard · V2 · Course aux missiles',
    color:'#7b4a9e',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/7/7c/Goddard_and_Rocket.jpg',
    sections:[
      { heading:'Les pionniers théoriques',
        text:'Trois visionnaires ont posé les bases du voyage spatial. Konstantin Tsiolkovski (1857–1935), instituteur russe sourd, formule dès 1903 l\'équation-fusée fondamentale et le principe de propulsion par réaction. Robert Goddard (1882–1945) lance la première fusée à carburant liquide le 16 mars 1926 dans un champ du Massachusetts — elle monte à 12 mètres, mais prouve le concept. Hermann Oberth (1894–1989) publie en 1923 « Die Rakete zu den Planetenräumen », inspirant une génération d\'ingénieurs dont le jeune Wernher von Braun. Ces trois pionniers théorisèrent et expérimentèrent dans l\'indifférence quasi générale.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/7/7c/Goddard_and_Rocket.jpg',
        aiKey:'ch1_pioneers', aiPrompt:'Tsiolkovski, Goddard et Oberth — les trois pionniers de l\'astronautique. Pourquoi leurs travaux, souvent moqués de leur vivant, sont-ils devenus la fondation de toute exploration spatiale ? Qu\'est-ce que l\'équation de Tsiolkovski et pourquoi est-elle encore utilisée sur chaque lancement aujourd\'hui ? 4 phrases.' },
      { heading:'La V2 — première fusée à atteindre l\'espace',
        text:'En Allemagne nazie, sous la direction de Wernher von Braun depuis Peenemünde, la V2 (Vergeltungswaffe 2) franchit pour la première fois la limite de l\'espace le 3 octobre 1942. Arme de terreur, plus de 3 000 V2 s\'abattent sur Londres, Anvers et d\'autres villes en 1944–1945, tuant 9 000 civils. La sinistre réalité : ces fusées étaient fabriquées par des détenus du camp de Dora, dont 12 000 périront à la tâche. À la capitulation, les deux superpuissances s\'emparent des plans et recrutent les ingénieurs allemands (Opération Paperclip côté américain).',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wernher_von_Braun.jpg',
        aiKey:'ch1_v2', aiPrompt:'La fusée V2 allemande : comment une arme de destruction est-elle devenue la mère de toutes les fusées spatiales ? Quelle est la part d\'ombre (travail forcé, crimes de guerre) et la part d\'héritage technologique ? Qu\'est devenu Wernher von Braun après la guerre ? 4 phrases nuancées.' },
      { heading:'La course aux missiles balistiques',
        text:'Après 1945, les deux superpuissances comprennent vite que la V2, améliorée, peut placer un engin en orbite. En URSS, Sergueï Korolev — brillant ingénieur survivant du Goulag — développe le R-7, premier ICBM réussi (août 1957). Son identité reste classifiée jusqu\'à sa mort en 1966 pour le protéger des espions. C\'est ce même R-7 qui lancera Spoutnik deux mois plus tard. Aux États-Unis, von Braun travaille pour l\'armée sur les missiles Redstone, mais reste sous-financé jusqu\'au « choc Spoutnik ».',
        nasaQuery:'Soviet R7 rocket Korolev missile program history',
        aiKey:'ch1_missiles', aiPrompt:'Sergueï Korolev, l\'homme de l\'ombre de la conquête spatiale soviétique : pourquoi son identité est-elle restée secrète pendant sa vie, et quel rôle crucial a-t-il joué dans l\'histoire de l\'espace ? Comment le passage du missile militaire au lanceur spatial civil s\'est-il opéré ? 4 phrases.' },
    ] },
  { id:'ch2', num:'02', label:'Chapitre 2', badge:'Ch. 2',
    title:'La course à l\'espace (1957–1975)', sub:'Spoutnik · Gagarine · Apollo · Animaux · Apollo-Soyouz',
    color:'#4a9e6b',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/b/be/Sputnik_asm.jpg',
    sections:[
      { heading:'Spoutnik 1 — le choc mondial (1957)',
        text:'Le 4 octobre 1957, l\'URSS lance Spoutnik 1, premier satellite artificiel de la Terre. Cette sphère de 84 kg émet un simple bip-bip capté par des amateurs du monde entier — et provoque un traumatisme politique aux États-Unis. La NASA est créée en réponse directe en juillet 1958. Un mois après Spoutnik 1, Spoutnik 2 emporte Laïka, premier être vivant en orbite — un aller simple, sans retour prévu. Le mot « spoutnik » (compagnon de voyage) entre dans toutes les langues du monde.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/b/be/Sputnik_asm.jpg',
        aiKey:'ch2_sputnik', aiPrompt:'Spoutnik 1 (1957) : pourquoi ce satellite de 84 kg a-t-il provoqué un traumatisme géopolitique aux États-Unis ? Qu\'est-ce que le « Spoutnik choc » a changé à l\'éducation américaine, à la politique de défense et à la création de la NASA ? Quel a été le sort de Laïka ? 4 phrases.' },
      { heading:'Gagarine et les premiers humains dans l\'espace (1961)',
        text:'Le 12 avril 1961, Youri Gagarine (27 ans) effectue le premier vol humain : 108 minutes, une orbite. En descendant dans l\'atmosphère, il radiodiffuse : « Le ciel est d\'un noir profond. La Terre est bleue. Quelle beauté ! » Trois semaines plus tard, Alan Shepard réalise le premier vol suborbital américain (15 minutes). En 1963, Valentina Terechkova devient la première femme dans l\'espace à bord de Vostok 6. Stimulé par ces défaites en série, Kennedy lance en 1961 le défi Apollo : un Américain sur la Lune avant 1970.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/e/e5/Yuri_Gagarin_%281961%29_-_Restoration.jpg',
        aiKey:'ch2_gagarin', aiPrompt:'Youri Gagarine : qu\'a-t-il vécu lors de ses 108 minutes historiques ? Quelle était l\'atmosphère en URSS ce jour-là, et comment le monde a-t-il réagi ? Pourquoi la mort de Gagarine en 1968 dans un accident d\'avion reste-t-elle entourée de mystère ? 4 phrases.' },
      { heading:'Les animaux précurseurs',
        text:'Avant d\'envoyer des humains, les deux superpuissances testent l\'espace avec des animaux. L\'URSS envoie des chiens : Laïka (1957, mourut de surchauffe quelques heures après le lancement), puis Belka et Strelka (1960), premières à revenir vivantes. Les États-Unis envoient des singes et chimpanzés, dont Ham (janvier 1961), premier chimpanzé en espace suborbital. Ces vols valident les systèmes de survie et démontrent que la vie peut supporter l\'apesanteur et les forces de lancement — ouvrant concrètement la voie aux vols humains.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/9f/Laika_experimental_space_dog_space_suit.jpg',
        aiKey:'ch2_animals', aiPrompt:'Les animaux dans l\'espace : comment ont-ils contribué à rendre le vol humain possible ? Était-ce éthique d\'envoyer Laïka sans retour possible ? Quelles espèces ont voyagé dans l\'espace depuis (araignées, poissons, méduses, tardigrades) et pourquoi ? 4 phrases.' },
      { heading:'Apollo 11 — premiers pas sur la Lune (1969)',
        text:'Le 20 juillet 1969, le module Eagle se pose sur la Mer de la Tranquillité. Neil Armstrong pose le pied sur la Lune à 02:56 UTC : « C\'est un petit pas pour un homme, un bond de géant pour l\'humanité. » Buzz Aldrin le rejoint 19 minutes plus tard ; Michael Collins orbit. 600 millions de personnes regardent en direct — l\'audience la plus large de l\'histoire à ce moment. Les 6 missions Apollo qui alunissent (1969–1972) rapportent 382 kg de roches lunaires. Apollo 13 (1970), après une explosion du service module, revient sain et sauf grâce à une improvisation d\'ingénierie remarquable.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/98/Aldrin_Apollo_11_original.jpg',
        aiKey:'ch2_apollo', aiPrompt:'Apollo 11 : comment l\'humanité a-t-elle accompli en seulement 8 ans ce qui semblait impossible ? Qu\'a-t-on appris sur la Lune grâce aux 382 kg de roches rapportées ? Et pourquoi n\'y est-on pas retourné depuis Apollo 17 (1972) jusqu\'à Artemis ? 4 phrases.' },
      { heading:'Mission Apollo-Soyouz — première poignée de main (1975)',
        text:'En juillet 1975, un vaisseau Apollo américain et un Soyouz soviétique s\'ariment en orbite. Thomas Stafford et Alexeï Leonov se serrent la main dans l\'espace pour la première fois — symbole fort de la détente internationale. La mission révèle les défis de la coopération technique entre deux systèmes incompatibles, préfigurant les compromis qui permettront l\'ISS. L\'anglais et le russe deviennent officiellement les deux langues de la coopération spatiale. C\'est le dernier vol habité américain avant la navette spatiale en 1981.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/90/ASTP_handshake_-_cropped.jpg',
        aiKey:'ch2_apollo_soyuz', aiPrompt:'La mission Apollo-Soyouz (1975) : pourquoi cette poignée de main dans l\'espace était-elle si symbolique dans le contexte de la Guerre froide ? Quels obstacles techniques ont dû être résolus pour l\'arrimage ? Comment a-t-elle préfiguré l\'ISS 25 ans plus tard ? 4 phrases.' },
    ] },
  { id:'ch3', num:'03', label:'Chapitre 3', badge:'Ch. 3',
    title:'L\'exploration robotique du système solaire', sub:'Voyager · Rovers martiens · Cassini · Télescopes',
    color:'#6b9e4a',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
    sections:[
      { heading:'Sondes lunaires et vénusiennes — les premières',
        text:'Avant Apollo, les sondes robotiques préparent le terrain. Le programme Luna soviétique (1959–1976) accumule les premières : premier impact lunaire (Luna 2), premières photos du côté caché (Luna 3), premier alunissage en douceur (Luna 9, 1966), premier retour d\'échantillons automatique (Luna 16, 1970). Les sondes Surveyor américaines valident les sites d\'atterrissage d\'Apollo. Sur Vénus, les sondes Venera soviétiques (1970–1983) révèlent un enfer de 465 °C et 92 atm — et transmettent les premières photos couleur d\'une autre surface planétaire.',
        nasaQuery:'Luna program Soviet moon probe Venera Venus',
        aiKey:'ch3_lunar', aiPrompt:'Les premières sondes robotiques lunaires et vénusiennes (Luna, Surveyor, Venera) : comment ont-elles transformé des corps célestes inconnus en destinations explorées ? Qu\'ont révélé les Venera sur Vénus, et pourquoi la surface vénusienne est-elle si difficile à explorer encore aujourd\'hui ? 4 phrases.' },
      { heading:'Voyager — les ambassadeurs interstellaires (1977)',
        text:'Lancées en 1977 pour profiter d\'un alignement planétaire exceptionnel (une fois tous les 176 ans), Voyager 1 et 2 survolent les 4 planètes géantes et révèlent les volcans de Io, l\'anneau de Jupiter, les lunes actives de Saturne, les anneaux d\'Uranus et les tempêtes de Neptune. Depuis 2012, Voyager 1 évolue dans l\'espace interstellaire — à plus de 23 milliards de km, le plus loin qu\'un objet humain ait jamais atteint. Chaque sonde porte un « Disque d\'or » encodant sons, images et langues de la Terre, message pour d\'éventuelles civilisations extraterrestres.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/4/4f/Voyager_1_entering_heliosheath_region.jpg',
        aiKey:'ch3_voyager', aiPrompt:'Les sondes Voyager : comment ont-elles révolutionné notre connaissance du système solaire externe en un seul voyage ? Qu\'est-ce que le Disque d\'or contient, et pourquoi certains scientifiques pensent-ils que l\'envoyer représente un risque (en révélant notre existence) ? 4 phrases.' },
      { heading:'Les rovers martiens — géologues sur Mars',
        text:'Depuis 1997, des rovers de plus en plus sophistiqués explorent Mars. Sojourner (1997, 10 kg, 83 jours) prouve la viabilité du concept. Spirit et Opportunity (2004), prévus pour 90 jours, ont respectivement résisté 6 et 14 ans. Curiosity (2012, 1 tonne, toujours actif) confirme que Mars a abrité des lacs liquides il y a 3,5 milliards d\'années. Perseverance (2021) constitue des dépôts d\'échantillons en attente de retour terrestre, tandis qu\'Ingenuity réalise les premiers vols motorisés sur une autre planète (72 vols). L\'expérience MOXIE produit de l\'oxygène depuis le CO₂ martien.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Curiosity_Self-Portrait_at_%27Big_Sky%27_Drilling_Site.jpg',
        aiKey:'ch3_rovers', aiPrompt:'Les rovers martiens : qu\'a apporté chaque génération (Sojourner → Curiosity → Perseverance) à notre compréhension de Mars ? Ingenuity a réalisé les premiers vols motorisés sur une autre planète — pourquoi est-ce une avancée révolutionnaire pour les missions futures ? 4 phrases.' },
      { heading:'Galileo, Cassini-Huygens, New Horizons',
        text:'Galileo (1995–2003) révèle l\'océan sous-glaciaire d\'Europe et les volcans de Io. Cassini-Huygens (2004–2017) tourne autour de Saturne pendant 13 ans : elle découvre les geysers d\'Encelade (eau liquide + organiques = candidat à la vie), et la sonde Huygens se pose sur Titan en 2005 (lacs de méthane, rivières d\'éthane). New Horizons survole Pluton en 2015 et révèle montagnes de 3 000 m et cœur de glace géant. OSIRIS-REx rapporte en 2023 250 g de l\'astéroïde Bennu — plus grande collecte d\'échantillons extraterrestres depuis Apollo.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/b/b2/Cassini_Saturn_Orbit_Insertion.jpg',
        aiKey:'ch3_outer', aiPrompt:'Cassini, Galileo, New Horizons : quelles découvertes vous ont le plus surpris ? Pourquoi l\'entrée finale de Cassini dans l\'atmosphère de Saturne en 2017 est-elle restée si émouvante pour des scientifiques qui avaient passé 20 ans sur cette mission ? 4 phrases.' },
      { heading:'Hubble et James Webb — les yeux de l\'humanité',
        text:'Hubble (1990–aujourd\'hui) révolutionne l\'astronomie : âge de l\'univers (13,8 milliards d\'années), expansion accélérée par l\'énergie noire, images emblématiques des « Piliers de la Création », catalogage de milliards de galaxies. Malgré un miroir défectueux corrigé en 1993, il est en service depuis 35 ans. Le James Webb Space Telescope (2021) observe l\'infrarouge et a déjà photographié des galaxies formées 300 millions d\'ans après le Big Bang — repoussant les limites observationnelles de 600 millions d\'années au-delà de Hubble. Ces deux observatoires ont redéfini notre place dans l\'univers.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/3/3f/HST-SM4.jpeg',
        aiKey:'ch3_telescopes', aiPrompt:'Hubble et James Webb : comment ces deux télescopes ont-ils transformé notre vision de l\'univers ? Quelle est la différence fondamentale entre les deux (infrarouge vs visible) ? Et qu\'est-ce que JWST a déjà découvert qui remet en question les modèles de formation des premières galaxies ? 4 phrases.' },
    ] },
  { id:'ch4', num:'04', label:'Chapitre 4', badge:'Ch. 4',
    title:'Stations orbitales et vol durable', sub:'Saliout · Mir · Navette spatiale · ISS',
    color:'#9e7b4a',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/0/04/International_Space_Station_after_undocking_of_STS-132.jpg',
    sections:[
      { heading:'De Saliout à Mir — l\'école soviétique de longue durée',
        text:'L\'URSS invente la station spatiale habitable. Saliout 1 (1971) accueille les premiers résidents, mais la mission se termine tragiquement : les 3 cosmonautes de Soyouz 11 périssent lors de la rentrée par dépressurisation de la capsule. Skylab américain (1973–1974) accueille 3 équipages pour 9 mois cumulés. Puis vient Mir (1986–2001) : la station soviétique bat tous les records. Valeri Polyakov y séjourne 437 jours consécutifs (record jamais battu en mission continue), prouvant que l\'être humain peut survivre à la durée d\'un aller-retour vers Mars.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/09/Mir_Space_Station_viewed_from_Endeavour_during_STS-89.jpg',
        aiKey:'ch4_mir', aiPrompt:'Des stations Saliout à Mir : qu\'ont-elles appris sur les effets à long terme de l\'espace sur le corps humain ? Pourquoi le record de 437 jours de Polyakov est-il si crucial pour planifier un vol vers Mars ? Quelle a été la fin spectaculaire de Mir en 2001 ? 4 phrases.' },
      { heading:'La navette spatiale — triomphe et tragédies (1981–2011)',
        text:'La navette spatiale américaine est le premier vaisseau spatial réutilisable. En 135 missions, elle déploie Hubble (et le répare 5 fois), construit l\'ISS et fait voler 355 personnes. Deux catastrophes marquent son histoire : Challenger (28 jan. 1986) explose 73 secondes après le décollage — 7 morts dont l\'institutrice Christa McAuliffe — à cause d\'un joint gelé par le froid. Columbia (1er fév. 2003) se désintègre à la rentrée après une tuile endommagée au décollage — 7 morts. Ces deux accidents transforment en profondeur la culture de sécurité de la NASA.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/9f/Challenger_explosion.jpg',
        aiKey:'ch4_shuttle', aiPrompt:'La navette spatiale : pourquoi était-elle révolutionnaire, et quelles étaient ses limitations ? Les accidents Challenger et Columbia étaient-ils évitables ? Qu\'ont appris ces deux tragédies sur les risques systémiques dans les grandes organisations sous pression budgétaire ? 4 phrases.' },
      { heading:'L\'ISS — 25 ans de présence permanente dans l\'espace',
        text:'La Station spatiale internationale est la plus grande infrastructure jamais construite dans l\'espace : 109 m de long, 420 tonnes, 15 nations partenaires. Habitée en permanence depuis novembre 2000, elle a accueilli plus de 270 astronautes et 3 000 expériences scientifiques — en biologie cellulaire, physique des fluides, médecine, matériaux. En 2022, malgré l\'invasion de l\'Ukraine, astronautes et cosmonautes ont continué à travailler ensemble à bord, symbole que la coopération scientifique peut résister aux crises politiques. Elle sera déorbitée vers 2030, remplacée par des stations commerciales.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/04/International_Space_Station_after_undocking_of_STS-132.jpg',
        aiKey:'ch4_iss', aiPrompt:'L\'ISS après 25 ans : quelles ont été les découvertes scientifiques les plus importantes réalisées à bord ? Comment la coopération entre 15 nations a-t-elle fonctionné en pratique ? Et quelle sera la suite après la déorbitation prévue vers 2030 ? 4 phrases.' },
    ] },
  { id:'ch5', num:'05', label:'Chapitre 5', badge:'Ch. 5',
    title:'Nouveaux acteurs, nouvelle ère', sub:'Chine · SpaceX · Artemis · Tourisme · Mars',
    color:'#4a6b9e',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
    sections:[
      { heading:'La Chine — la troisième puissance spatiale',
        text:'Sans accès aux technologies américaines ou russes, la Chine a développé son programme de A à Z. Yang Liwei devient le premier taikonaute en 2003 (Shenzhou 5). La station Tiangong est habitée en permanence depuis 2021. Le rover Yutu-2 explore la face cachée de la Lune depuis 2019 — une première mondiale. Chang\'e 5 rapporte 1,7 kg d\'échantillons lunaires en 2020. La sonde Tianwen-1 dépose le rover Zhurong sur Mars en 2021. La Chine vise un alunissage habité avant 2030 et une base lunaire permanente — une vraie compétition avec le programme Artemis américain.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/03/Tiangong_Space_Station_Rendering_2021.08.png',
        aiKey:'ch5_china', aiPrompt:'Comment la Chine est-elle devenue la troisième grande puissance spatiale en si peu de temps ? Quelles sont ses ambitions pour la Lune et Mars, et pourquoi cette nouvelle course entre USA et Chine est-elle différente — et peut-être plus dangereuse — que la Guerre froide USA/URSS ? 4 phrases.' },
      { heading:'SpaceX et la révolution de la réutilisabilité',
        text:'Fondé en 2002 par Elon Musk avec l\'objectif explicite de coloniser Mars, SpaceX bouleverse l\'économie des lancements. En 2015, Falcon 9 réalise le premier atterrissage vertical contrôlé d\'un premier étage — réduisant les coûts d\'un facteur 10. Crew Dragon transporte des astronautes vers l\'ISS depuis 2020, mettant fin à la dépendance vis-à-vis des Soyouz russes. Starship (120 m, le plus grand lanceur jamais construit), en développement actif depuis 2023, vise la Lune (contrat NASA Artemis) puis Mars. Blue Origin, Rocket Lab et Arianespace réinventent aussi le secteur.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/5/54/CRS-8_%2826239020092%29.jpg',
        aiKey:'ch5_spacex', aiPrompt:'SpaceX a changé les règles du jeu spatial. Comment la réutilisabilité des fusées a-t-elle transformé l\'économie des lancements ? Qu\'est-ce que Starship représente vraiment — est-ce réaliste d\'aller sur Mars avec ce lanceur ? Quels risques pose la domination d\'un acteur privé sur l\'accès à l\'espace ? 4 phrases.' },
      { heading:'Artemis — retour habité sur la Lune',
        text:'Le programme Artemis (NASA, depuis 2017) vise à ramener des astronautes sur la Lune pour la première fois depuis Apollo 17 (1972). Artemis I (novembre 2022) a testé sans équipage le lanceur SLS et la capsule Orion. Artemis II (2025) enverra 4 astronautes en orbite lunaire. Artemis III (2026) doit déposer les premiers humains au pôle sud lunaire — dont la première femme et le premier non-Blanc sur la Lune. Le pôle sud est visé car ses cratères ombragés renferment de la glace d\'eau, ressource clé pour produire carburant et oxygène sur place.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/7/75/Artemis_I_Launch_%28NHQ202211160028%29.jpg',
        aiKey:'ch5_artemis', aiPrompt:'Le programme Artemis : pourquoi retourner sur la Lune 50 ans après Apollo ? Qu\'est-ce qui est fondamentalement différent cette fois (objectifs durables, pôle sud, glace d\'eau, Gateway orbital) ? Quel rôle joue la compétition avec la Chine dans l\'urgence du programme ? 4 phrases.' },
      { heading:'Mars — le prochain grand saut humain',
        text:'Mars est à 54 à 401 millions de km selon l\'alignement des orbites. Un voyage aller prend 6 à 9 mois avec la propulsion chimique actuelle. Les défis sont immenses : radiation cosmique (risque de cancer multiplié), microgravité prolongée (os, muscles, vision), communication avec un délai de 24 minutes, auto-suffisance totale. MOXIE, expérience embarquée sur Perseverance, a produit 122 g d\'oxygène depuis le CO₂ martien — première production de ressource in-situ sur Mars. SpaceX vise des vols cargo dans les années 2020 et des humains vers 2030–2035.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
        aiKey:'ch5_mars', aiPrompt:'Un voyage humain vers Mars : quels sont les défis les plus difficiles à résoudre (radiation, durée, ressources, santé mentale de l\'équipage) ? Comment l\'expérience MOXIE prépare-t-elle concrètement une mission habitée ? Et comment imagine-tu le quotidien des premiers Marsiens ? 4 phrases.' },
    ] },
  { id:'ch6', num:'06', label:'Chapitre 6', badge:'Ch. 6',
    title:'Défis et limites actuelles', sub:'Corps humain · Débris · Droit · Éthique',
    color:'#9e4a4a',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/a/a1/Debris-GEO1280.jpg',
    sections:[
      { heading:'Le corps humain face à l\'espace',
        text:'L\'espace est hostile au corps humain. En microgravité, les muscles s\'atrophient (1–2 % de masse par mois), les os se décalcifient, la pression intraoculaire augmente et altère durablement la vision (syndrome SANS). Les rayonnements cosmiques, non filtrés hors de la magnétosphère, augmentent le risque de cancer : un voyage aller-retour vers Mars exposerait l\'équipage à environ 1 Sievert, soit 33 fois la limite annuelle pour un travailleur du nucléaire. Des solutions sont à l\'étude : gravité artificielle par rotation, boucliers d\'hydrogène liquide, traitements médicaux préventifs.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/a/a1/ISS-38_Mike_Hopkins_works_on_the_COLBERT_treadmill_in_the_Unity_node.jpg',
        aiKey:'ch6_health', aiPrompt:'Les effets de l\'espace sur le corps humain : quels sont les plus dangereux à long terme (radiation, os, vision, cœur) ? Quelles solutions techniques ou médicales sont développées pour des vols longue durée ? Parle aussi des effets psychologiques de l\'isolement prolongé en équipage restreint. 4 phrases.' },
      { heading:'Débris spatiaux — le syndrome de Kessler',
        text:'Plus de 27 000 débris de plus de 10 cm orbitent autour de la Terre, plus des millions de particules plus petites. À 7 km/s, un boulon de 10 g a l\'énergie cinétique d\'une voiture à 100 km/h. L\'astrophysicien Donald Kessler prédit en 1978 un scénario catastrophique : au-delà d\'un seuil critique, les collisions génèrent des débris qui causent d\'autres collisions — une réaction en chaîne rendant certaines orbites inutilisables pendant des siècles. Avec les méga-constellations (Starlink : 6 000 satellites), le problème s\'accélère. Des projets de ramassage actif (filets, harpons magnétiques, lasers) sont en développement.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/a/a1/Debris-GEO1280.jpg',
        aiKey:'ch6_debris', aiPrompt:'Le syndrome de Kessler et les débris spatiaux : à quel point la situation est-elle critique aujourd\'hui ? Qui est responsable des débris (États, entreprises) et quelles obligations légales existent ? Quelles technologies de nettoyage orbital sont les plus prometteuses ? 4 phrases.' },
      { heading:'Droit spatial, éthique et militarisation',
        text:'Le Traité de l\'espace (1967, 111 signataires) stipule que l\'espace est « patrimoine commun de l\'humanité », interdit d\'y placer des armes nucléaires et empêche toute appropriation nationale d\'un corps céleste. Mais ce traité a 60 ans et ne couvre pas les ressources des astéroïdes ou de la Lune (lois américaine de 2015 et luxembourgeoise de 2017 : une entreprise peut posséder ce qu\'elle extrait). La militarisation progresse avec la Space Force américaine et les armes anti-satellites. La question des droits des futurs habitants de Mars ou d\'une colonie lunaire reste entièrement ouverte.',
        nasaQuery:'space law treaty international cooperation satellite military',
        aiKey:'ch6_law', aiPrompt:'Le droit spatial est-il encore adapté à l\'ère SpaceX et des ambitions de colonisation ? Qui peut légalement exploiter les ressources de la Lune ou d\'un astéroïde ? Si on découvrait de la vie sur Europa — quelle serait notre obligation éthique et légale avant d\'y envoyer une sonde ? 4 phrases.' },
    ] },
  { id:'conclusion', num:'', label:'Conclusion', badge:'Fin',
    title:'Quel avenir pour la conquête spatiale ?', sub:'Bilan · Base lunaire · Mars · Europa · Humanité multiplanétaire',
    color:'#4a7b9e',
    heroImg:'https://upload.wikimedia.org/wikipedia/commons/a/a8/NASA-Apollo8-Dec24-Earthrise.jpg',
    sections:[
      { heading:'Bilan — 67 ans d\'ère spatiale',
        text:'En 67 ans, l\'humanité a posé le pied sur la Lune, photographié chaque planète du système solaire, maintenu une présence permanente en orbite, et créé des technologies qui structurent le quotidien (GPS, satellites météo, internet par satellite, IRM, capteurs CMOS, matériaux composites). Les échecs sont réels : 18 astronautes morts en mission, des centaines de sondes perdues, des milliards engloutis. Mais chaque échec a enrichi le savoir-faire des ingénieurs. La conquête spatiale a aussi changé notre regard sur la Terre — une bille bleue fragile visible dans toute son unicité depuis 400 km d\'altitude.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
        aiKey:'concl_balance', aiPrompt:'Bilan de 67 ans de conquête spatiale : les coûts humains et financiers ont-ils été justifiés par les bénéfices ? Quelles technologies du quotidien n\'existeraient pas sans la course à l\'espace ? Et quelle est la prochaine étape que tu considères comme la plus transformative pour l\'humanité ? 4 phrases.' },
      { heading:'L\'humanité deviendra-t-elle multiplanétaire ?',
        text:'Les prochaines décennies verront probablement une base orbitale autour de la Lune (Gateway), une base au pôle sud lunaire, les premiers humains sur Mars (2030–2040), et des sondes plongeant dans les océans d\'Europe ou de Titan. La question philosophique reste ouverte : devons-nous coloniser d\'autres mondes pour assurer la survie de l\'espèce, ou cette énergie devrait-elle d\'abord résoudre les crises terrestres ? Pour les partisans de la multiplanétarisation, une civilisation confinée à une seule planète est vulnérable à un événement catastrophique (astéroïde géant, guerre nucléaire, pandémie) qui pourrait l\'anéantir.',
        wikiImg:'https://upload.wikimedia.org/wikipedia/commons/0/07/Moon_colony_with_rover.jpeg',
        aiKey:'concl_future', aiPrompt:'L\'humanité est-elle destinée à devenir multiplanétaire ? Quels sont les arguments en faveur (survie de l\'espèce) et contre (priorités terrestres, éthique de la colonisation) ? Si tu devais vivre sur Mars en 2050, dans une colonie des premiers temps, à quoi ressemblerait ton quotidien ? 4 phrases imaginatives.' },
    ] },
]

const CONQUEST_TIMELINE = [
  { year:'1903', flag:'🇷🇺', event:'Tsiolkovski publie l\'équation-fusée fondamentale', wikiPage:'Konstantin_Tsiolkovski' },
  { year:'1926', flag:'🇺🇸', event:'Goddard lance la première fusée à carburant liquide', wikiPage:'Robert_Goddard' },
  { year:'1942', flag:'🇩🇪', event:'La V2 franchit la ligne de Kármán (100 km) — premier objet humain dans l\'espace', wikiPage:'V2_(fusée)' },
  { year:'1957', flag:'🇷🇺', event:'Spoutnik 1 (4 oct.) · Laïka, premier être vivant en orbite (3 nov.)', wikiPage:'Spoutnik_1' },
  { year:'1958', flag:'🇺🇸', event:'Création de la NASA (29 juillet)', wikiPage:'NASA' },
  { year:'1961', flag:'🇷🇺', event:'Youri Gagarine — premier homme dans l\'espace (12 avr.) · Kennedy lance le défi Apollo', wikiPage:'Youri_Gagarine' },
  { year:'1963', flag:'🇷🇺', event:'Valentina Terechkova — première femme dans l\'espace (Vostok 6)', wikiPage:'Valentina_Terechkova' },
  { year:'1965', flag:'🇷🇺', event:'Alexeï Leonov — première sortie extravéhiculaire (EVA)', wikiPage:'Alekseï_Leonov' },
  { year:'1969', flag:'🇺🇸', event:'Apollo 11 — premiers pas sur la Lune (20 juil.) · Armstrong + Aldrin', wikiPage:'Apollo_11' },
  { year:'1971', flag:'🇷🇺', event:'Saliout 1 — première station spatiale habitée', wikiPage:'Saliout_1' },
  { year:'1972', flag:'🇺🇸', event:'Apollo 17 — dernière mission habitée lunaire (jusqu\'à Artemis)', wikiPage:'Apollo_17' },
  { year:'1975', flag:'🌍', event:'Mission Apollo-Soyouz — première coopération USA/URSS en orbite', wikiPage:'Mission_Apollo-Soyouz' },
  { year:'1977', flag:'🇺🇸', event:'Lancement Voyager 1 et 2 — grand tour du système solaire', wikiPage:'Voyager_1' },
  { year:'1981', flag:'🇺🇸', event:'Premier vol de la navette spatiale Columbia (STS-1)', wikiPage:'STS-1' },
  { year:'1986', flag:'🇷🇺', event:'Station Mir en orbite (active jusqu\'en 2001)', wikiPage:'Station_spatiale_Mir' },
  { year:'1986', flag:'🇺🇸', event:'Catastrophe Challenger (28 jan.) — 7 morts', wikiPage:'Catastrophe_de_la_navette_Challenger' },
  { year:'1990', flag:'🌍', event:'Déploiement du télescope spatial Hubble', wikiPage:'Télescope_spatial_Hubble' },
  { year:'1995', flag:'🇺🇸', event:'Sonde Galileo entre en orbite de Jupiter — découvre l\'océan d\'Europe', wikiPage:'Sonde_Galileo' },
  { year:'1997', flag:'🇺🇸', event:'Rover Sojourner sur Mars (mission Pathfinder)', wikiPage:'Mars_Pathfinder' },
  { year:'1998', flag:'🌍', event:'Début de construction de l\'ISS (module Zarya)', wikiPage:'Station_spatiale_internationale' },
  { year:'2000', flag:'🌍', event:'ISS : début de l\'occupation humaine permanente (nov.)', wikiPage:'Station_spatiale_internationale' },
  { year:'2003', flag:'🇨🇳', event:'Yang Liwei — premier taikonaute chinois (Shenzhou 5)', wikiPage:'Yang_Liwei' },
  { year:'2003', flag:'🇺🇸', event:'Catastrophe Columbia (1er fév.) — 7 morts · Rovers Spirit et Opportunity sur Mars', wikiPage:'Catastrophe_de_la_navette_Columbia' },
  { year:'2004', flag:'🌍', event:'Cassini-Huygens entre en orbite de Saturne · Sonde Huygens sur Titan (2005)', wikiPage:'Cassini-Huygens' },
  { year:'2011', flag:'🇺🇸', event:'Dernier vol de la navette spatiale (STS-135, Atlantis)', wikiPage:'STS-135' },
  { year:'2012', flag:'🇺🇸', event:'Curiosity se pose sur Mars · Voyager 1 entre dans l\'espace interstellaire', wikiPage:'Mars_Science_Laboratory' },
  { year:'2015', flag:'🇺🇸', event:'New Horizons survole Pluton · Falcon 9 réalise le premier atterrissage vertical', wikiPage:'New_Horizons' },
  { year:'2019', flag:'🇨🇳', event:'Yutu-2 sur la face cachée de la Lune (Chang\'e 4) — première mondiale', wikiPage:'Chang\'e_4' },
  { year:'2020', flag:'🇺🇸', event:'Crew Dragon transporte des astronautes vers l\'ISS (fin de la dépendance au Soyouz)', wikiPage:'SpaceX_Crew_Dragon' },
  { year:'2021', flag:'🌍', event:'JWST lancé (25 déc.) · Perseverance + Ingenuity sur Mars · Tiangong chinoise habitée', wikiPage:'James-Webb_(télescope_spatial)' },
  { year:'2022', flag:'🇺🇸', event:'Artemis I — tour de la Lune sans équipage (SLS + Orion)', wikiPage:'Artemis_1' },
  { year:'2025', flag:'🇺🇸', event:'Artemis II — 4 astronautes en orbite lunaire (prévu)', wikiPage:'Artemis_2' },
  { year:'2026', flag:'🇺🇸', event:'Artemis III — premiers humains au pôle sud lunaire (prévu)', wikiPage:'Artemis_3' },
  { year:'2030s', flag:'🌍', event:'Mission habitée vers Mars — objectif SpaceX / NASA (visée)', wikiPage:'Exploration_humaine_de_Mars' },
]

const CONQUEST_GLOSSARY = [
  { term:'Ligne de Kármán', def:'Altitude de 100 km généralement reconnue comme la frontière entre atmosphère et espace. Aux USA, la limite est fixée à 80 km.', wikiPage:'Ligne_de_Kármán' },
  { term:'Delta-v (Δv)', def:'Variation de vitesse nécessaire pour passer d\'une orbite à une autre. Mesure universelle du « coût » d\'une manœuvre spatiale.', wikiPage:'Delta-v' },
  { term:'EVA', def:'Extra-Vehicular Activity — sortie extravéhiculaire dans l\'espace. Les astronautes portent une combinaison pressurisée (EMU).', wikiPage:'Activité_extravéhiculaire' },
  { term:'ICBM', def:'Missile balistique intercontinental — capable d\'atteindre n\'importe quel point du globe. La technologie ICBM a directement produit les premiers lanceurs spatiaux.', wikiPage:'Missile_balistique_intercontinental' },
  { term:'ISS', def:'Station spatiale internationale — orbite à 400 km, vitesse 7,66 km/s, 15 nations partenaires, habitée en permanence depuis 2000.', wikiPage:'Station_spatiale_internationale' },
  { term:'LEO', def:'Low Earth Orbit — orbite basse entre 160 et 2 000 km. ISS, navette, Starlink y évoluent.', wikiPage:'Orbite_basse_terrestre' },
  { term:'Microgravité', def:'État d\'apesanteur apparent vécu en orbite. Non pas l\'absence de gravité, mais la chute libre permanente autour de la Terre.', wikiPage:'Microgravité' },
  { term:'Module lunaire', def:'Partie d\'un vaisseau Apollo conçue pour se poser sur la Lune et en décoller. Composée d\'un étage de descente et d\'un étage de remontée (Eagle pour Apollo 11).', wikiPage:'Module_lunaire_Apollo' },
  { term:'Orbite géostationnaire', def:'Orbite à 35 786 km où un satellite est synchrone avec la rotation terrestre — il semble immobile. Utilisée pour la communication et la météo.', wikiPage:'Orbite_géostationnaire' },
  { term:'Overview Effect', def:'Expérience subjective décrite par de nombreux astronautes : la vue de la Terre depuis l\'espace provoque une prise de conscience soudaine de sa fragilité et de l\'unité de l\'humanité.', wikiPage:'Overview_effect' },
  { term:'Propulsion ionique', def:'Moteur accélérant des ions par champ électrique. Très efficace sur le long terme (faible poussée, longue durée) — utilisée par Dawn, Hayabusa, SMART-1.', wikiPage:'Propulseur_ionique' },
  { term:'Rover', def:'Véhicule robotique explorant la surface d\'un autre corps céleste (Lune, Mars, et bientôt Titan avec Dragonfly en 2034).', wikiPage:'Rover_(véhicule_spatial)' },
  { term:'Sievert (Sv)', def:'Unité de dose de radiation absorbée. Limite annuelle terrestre : 1 mSv. Limite nucléaire : 20 mSv/an. Voyage vers Mars aller-retour : ~1 Sv (1 000 mSv).', wikiPage:'Sievert' },
  { term:'Taikonaute', def:'Terme officiel chinois pour astronaute — de « Taikong » (espace en mandarin) et « naute » (navigateur en grec).', wikiPage:'Taikonaute' },
  { term:'Vitesse de libération', def:'Vitesse minimale pour quitter un champ gravitationnel. Terre : 11,2 km/s. Lune : 2,4 km/s. Mars : 5 km/s.', wikiPage:'Vitesse_de_libération' },
  { term:'JWST', def:'James Webb Space Telescope — lancé en 2021, observe dans l\'infrarouge depuis le point de Lagrange L2 à 1,5 million de km de la Terre.', wikiPage:'James-Webb_(télescope_spatial)' },
]

const CONQUEST_MISSIONS = [
  { name:'Spoutnik 1', year:'1957', agency:'URSS', dest:'Orbite terrestre', note:'Premier satellite artificiel de la Terre — 84 kg, bip-bip, 3 mois en orbite', wikiPage:'Spoutnik_1' },
  { name:'Vostok 1', year:'1961', agency:'URSS', dest:'Orbite terrestre', note:'Premier vol humain — Youri Gagarine (108 min, 1 orbite)', wikiPage:'Vostok_1' },
  { name:'Apollo 11', year:'1969', agency:'NASA', dest:'Lune', note:'Premiers humains sur la Lune — Armstrong, Aldrin, Collins', wikiPage:'Apollo_11' },
  { name:'Mariner 9', year:'1971', agency:'NASA', dest:'Mars', note:'Première sonde en orbite martienne — cartographie complète de la surface', wikiPage:'Mariner_9' },
  { name:'Pioneer 10 & 11', year:'1972–73', agency:'NASA', dest:'Jupiter/Saturne', note:'Premières missions vers les planètes géantes, première plaque dorée', wikiPage:'Pioneer_10' },
  { name:'Viking 1 & 2', year:'1976', agency:'NASA', dest:'Mars', note:'Premiers atterrisseurs sur Mars — recherche de vie dans le sol', wikiPage:'Programme_Viking' },
  { name:'Voyager 1 & 2', year:'1977', agency:'NASA', dest:'Système solaire', note:'Grand tour des planètes géantes — Voyager 1 en espace interstellaire depuis 2012', wikiPage:'Voyager_1' },
  { name:'Hubble (HST)', year:'1990', agency:'NASA/ESA', dest:'Orbite terrestre', note:'Télescope spatial visible/UV — 35 ans de service, révolutionne l\'astronomie', wikiPage:'Télescope_spatial_Hubble' },
  { name:'Galileo', year:'1995', agency:'NASA', dest:'Jupiter', note:'Orbite jovienne — révèle l\'océan sous-glaciaire d\'Europe', wikiPage:'Sonde_Galileo' },
  { name:'Cassini-Huygens', year:'2004', agency:'NASA/ESA', dest:'Saturne', note:'13 ans d\'orbite saturnienne, sonde Huygens sur Titan, geysers d\'Encelade', wikiPage:'Cassini-Huygens' },
  { name:'Spirit & Opportunity', year:'2004', agency:'NASA', dest:'Mars', note:'Rovers géologiques — Opportunity actif 14 ans (prévu 3 mois)', wikiPage:'Mars_Exploration_Rover' },
  { name:'New Horizons', year:'2015', agency:'NASA', dest:'Pluton/Kuiper', note:'Premier survol de Pluton — révèle montagnes de 3 000 m et cœur de glace', wikiPage:'New_Horizons' },
  { name:'JWST', year:'2021', agency:'NASA/ESA/CSA', dest:'L2 (1,5 M km)', note:'Télescope infrarouge — photographie des galaxies formées 300 Ma après le Big Bang', wikiPage:'James-Webb_(télescope_spatial)' },
  { name:'Perseverance + Ingenuity', year:'2021', agency:'NASA', dest:'Mars', note:'Collecte d\'échantillons, 72 vols d\'Ingenuity, production d\'O₂ (MOXIE)', wikiPage:'Mars_2020' },
  { name:'Artemis I', year:'2022', agency:'NASA', dest:'Lune', note:'Test sans équipage SLS + Orion en orbite lunaire', wikiPage:'Artemis_1' },
]

const CONQUEST_BIOS = [
  { name:'Konstantin Tsiolkovski', dates:'1857–1935', role:'Père théorique de l\'astronautique',
    bio:'Instituteur russe sourd de naissance, il formule dès 1903 l\'équation-fusée fondamentale encore utilisée aujourd\'hui. Il imagine les stations orbitales, les vaisseaux multi-étages et la colonisation du système solaire, dans l\'indifférence quasi totale de ses contemporains. Sa phrase culte : « La Terre est le berceau de l\'humanité, mais on ne peut pas vivre éternellement dans un berceau. »' },
  { name:'Robert Goddard', dates:'1882–1945', role:'Premier rocketeur pratique',
    bio:'Physicien américain moqué par la presse (dont le New York Times) pour ses idées sur les fusées dans le vide spatial, il lance néanmoins la première fusée à carburant liquide en 1926. Il dépose 214 brevets en propulsion spatiale. Le centre Goddard de la NASA, l\'un des plus importants du monde, honore sa mémoire.' },
  { name:'Sergueï Korolev', dates:'1907–1966', role:'Concepteur en chef soviétique',
    bio:'Ingénieur ukraino-soviétique, il survit au Goulag stalinien et dirige en secret le programme spatial soviétique. Son identité est classifiée jusqu\'à sa mort — il est désigné comme le « Concepteur en chef » dans les communications officielles. Il réalise Spoutnik, Vostok (Gagarine) et planifie le voyage lunaire. Sa mort prématurée en 1966 est un facteur décisif dans l\'échec soviétique à envoyer des hommes sur la Lune.' },
  { name:'Youri Gagarine', dates:'1934–1968', role:'Premier homme dans l\'espace',
    bio:'Pilote soviétique sélectionné parmi 3 000 candidats pour son courage, sa petite stature (le cockpit était exigu) et sa personnalité charismatique. Son vol du 12 avril 1961 dure 108 minutes. Devenu icône mondiale, il meurt dans un accident d\'avion d\'entraînement en mars 1968. La cause exacte n\'a jamais été officiellement établie, alimentant les théories.' },
  { name:'Wernher von Braun', dates:'1912–1977', role:'Architecte des V2 et Saturn V',
    bio:'Ingénieur allemand passionné d\'espace dès l\'enfance, il développe la V2 pour les nazis (avec travail forcé à Dora), puis est transféré aux États-Unis via l\'Opération Paperclip. Il dirige le programme Saturn V, lanceur d\'Apollo 11. Figure ambiguë de l\'histoire : génie technique indiscutable, compromis éthiques indéniables.' },
  { name:'Katherine Johnson', dates:'1918–2020', role:'Mathématicienne essentielle de la NASA',
    bio:'Mathématicienne afro-américaine dont les calculs orbitaux ont été essentiels pour Mercury, Apollo et la navette spatiale. En 1962, John Glenn refuse de décoller pour son orbite avant que Johnson ait personnellement vérifié les calculs de l\'ordinateur. Son histoire est racontée dans « Les Figures de l\'ombre » (film 2016). Médaille présidentielle de la Liberté en 2015.' },
  { name:'Neil Armstrong', dates:'1930–2012', role:'Premier homme sur la Lune',
    bio:'Pilote d\'essai et astronaute américain, il commande Apollo 11 et pose le pied sur la Lune le 20 juillet 1969. Discret et réservé, il refuse le statut d\'icône qui lui est imposé. Sa phrase — « Un petit pas pour un homme, un bond de géant pour l\'humanité » — reste l\'une des plus citées du XXe siècle.' },
  { name:'Valentina Terechkova', dates:'1937–', role:'Première femme dans l\'espace',
    bio:'Ouvrière en usine textile et parachutiste amateur, elle est sélectionnée pour Vostok 6 en 1963. En 3 jours, elle effectue 48 orbites — plus que tous les astronautes américains réunis à ce stade. Elle reste la seule femme à avoir effectué un vol spatial solo. Engagée en politique en Russie, elle a proposé un voyage sans retour vers Mars si elle en avait l\'occasion.' },
]

// ─── Composants Conquête spatiale ─────────────────────────────────────────────

function ConquestWikiImg({ src, alt, fallbackQuery, height }) {
  const [thumbUrl, setThumbUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (!src || fetched.current) return
    fetched.current = true
    const filename = decodeURIComponent(src.split('/').pop())
    const enc = encodeURIComponent('File:' + filename)
    fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${enc}&prop=imageinfo&iiprop=thumburl&iiurlwidth=480&format=json&origin=*`)
      .then(r => r.json())
      .then(d => {
        const page = Object.values(d.query?.pages || {})[0]
        const tu = page?.imageinfo?.[0]?.thumburl
        if (tu) { setThumbUrl(tu); setLoading(false) }
        else throw new Error('no thumb')
      })
      .catch(() => {
        if (fallbackQuery) {
          fetchNASAImages(fallbackQuery, 1)
            .then(photos => { if (photos.length) setThumbUrl(photos[0].thumbUrl) })
            .catch(() => {})
            .finally(() => setLoading(false))
        } else {
          setThumbUrl(src)
          setLoading(false)
        }
      })
  }, [src])

  if (!src) return null
  const h = height || 200
  const imgStyle = { width:'100%', height:h, objectFit:'cover', borderRadius:12, marginBottom:14, display:'block' }

  if (loading) return (
    <div style={{ ...imgStyle, background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', gap:5 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:5, height:5, borderRadius:'50%', background:'var(--faint)',
            animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*0.18}s` }} />
        ))}
      </div>
    </div>
  )
  if (!thumbUrl) return null
  return (
    <img src={thumbUrl} alt={alt} loading="lazy"
      onError={() => {
        if (fallbackQuery && !thumbUrl?.includes('nasa')) {
          fetchNASAImages(fallbackQuery, 1)
            .then(photos => { if (photos.length) setThumbUrl(photos[0].thumbUrl) })
            .catch(() => {})
        }
      }}
      style={imgStyle} />
  )
}

function ConquestNasaImg({ query, alt }) {
  const [url, setUrl] = useState(null)
  const fetched = useRef(false)
  useEffect(() => {
    if (fetched.current || !query) return
    fetched.current = true
    fetchNASAImages(query, 1)
      .then(photos => { if (photos.length) setUrl(photos[0].thumbUrl) })
      .catch(() => {})
  }, [query])
  if (!url) return (
    <div style={{ height:64, borderRadius:12, background:'var(--surface-2)', marginBottom:14,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', gap:5 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:5, height:5, borderRadius:'50%', background:'var(--faint)',
            animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*0.18}s` }} />
        ))}
      </div>
    </div>
  )
  return (
    <img src={url} alt={alt || query}
      style={{ width:'100%', height:200, objectFit:'cover',
        borderRadius:12, marginBottom:14, display:'block' }} />
  )
}

function ConquestSection({ section }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:15.5, fontWeight:600, fontFamily:'var(--sans)',
        color:'var(--text)', marginBottom:12, paddingBottom:9,
        borderBottom:'1px solid var(--line)' }}>
        {section.heading}
      </div>
      {section.wikiImg
        ? <ConquestWikiImg src={section.wikiImg} alt={section.heading} fallbackQuery={section.nasaQuery} />
        : section.nasaQuery
          ? <ConquestNasaImg query={section.nasaQuery} alt={section.heading} />
          : null}
      <p className="body serif-body" style={{ fontSize:14, lineHeight:1.68, margin:'0 0 12px' }}>
        {section.text}
      </p>
      <AiInfoPanel cacheKey={`cq_${section.aiKey}`} buildPrompt={section.aiPrompt} />
    </div>
  )
}

function WikiSummarySheet({ wikiPage, label, open, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!open) { fetched.current = false; setData(null); return }
    if (!wikiPage || fetched.current) return
    fetched.current = true
    setLoading(true)
    fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => {
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(d => { setData(d); setLoading(false) })
          .catch(() => setLoading(false))
      })
  }, [open, wikiPage])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const root = document.getElementById('root')
  if (!root) return null

  return createPortal(
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label || wikiPage}>
        <div className="sheet-grip" />
        <button onClick={onClose} aria-label="Fermer"
          style={{ position:'absolute', top:14, right:16, width:32, height:32, borderRadius:999,
            border:'1px solid var(--line-2)', background:'rgba(255,255,255,.03)', color:'var(--dim)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <IcClose size={16} />
        </button>
        <div className="sheet-scroll">
          <div style={{ padding:'0 0 24px' }}>
            {loading && (
              <div style={{ display:'flex', justifyContent:'center', padding:'36px 0' }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--faint)',
                      animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*0.18}s` }} />
                  ))}
                </div>
              </div>
            )}
            {data && (
              <>
                {data.thumbnail?.source && (
                  <img src={data.thumbnail.source} alt={data.title}
                    style={{ width:'100%', maxHeight:220, objectFit:'cover', borderRadius:14, marginBottom:16, display:'block' }} />
                )}
                <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)', color:'var(--text)', marginBottom:5 }}>
                  {data.title}
                </div>
                {data.description && (
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--gold)', marginBottom:13, letterSpacing:'.03em' }}>
                    {data.description}
                  </div>
                )}
                {data.extract && (
                  <p className="body serif-body" style={{ fontSize:13.5, lineHeight:1.72, color:'var(--dim)', margin:'0 0 18px' }}>
                    {data.extract}
                  </p>
                )}
                <AiInfoPanel
                  cacheKey={`wiki_${wikiPage}`}
                  buildPrompt={`Donne-moi 3 faits fascinants et peu connus sur : ${data.title}. ${data.description ? 'Contexte : ' + data.description : ''}`}
                />
                {data.content_urls?.desktop?.page && (
                  <a href={data.content_urls.desktop.page} target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-block', marginTop:16, fontSize:12, fontFamily:'var(--mono)',
                      color:'var(--gold)', textDecoration:'none', borderBottom:'1px solid var(--gold)', paddingBottom:2 }}>
                    Lire l&apos;article complet sur Wikipédia →
                  </a>
                )}
              </>
            )}
            {!loading && !data && (
              <div style={{ textAlign:'center', padding:'36px 0', color:'var(--faint)', fontSize:13 }}>
                Article non disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    root
  )
}

function ConquestAnnexes({ onWikiOpen }) {
  const [sub, setSub] = useState('timeline')
  const SUBS = [
    { key:'timeline', label:'Chronologie' },
    { key:'glossary', label:'Glossaire' },
    { key:'missions', label:'Missions' },
    { key:'bios', label:'Biographies' },
  ]
  const chevron = { fontSize:11, color:'var(--faint)', marginLeft:'auto', flexShrink:0 }
  return (
    <div>
      <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:18 }}>
        {SUBS.map(s => (
          <button key={s.key} className={'chip' + (sub === s.key ? ' on' : '')}
            onClick={() => setSub(s.key)}>{s.label}</button>
        ))}
      </div>

      {sub === 'timeline' && (
        <div>
          {CONQUEST_TIMELINE.map((t, i) => (
            <button key={i} onClick={() => onWikiOpen({ wikiPage: t.wikiPage, label: t.event })}
              style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer',
                display:'flex', gap:12, paddingTop:10, paddingBottom:10,
                borderBottom:'1px solid var(--line)', alignItems:'flex-start' }}>
              <div style={{ flexShrink:0, width:52 }}>
                <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--gold)',
                  letterSpacing:'.06em', marginBottom:2 }}>{t.year}</div>
                <div style={{ fontSize:16 }}>{t.flag}</div>
              </div>
              <div className="body" style={{ fontSize:13, lineHeight:1.5, color:'var(--dim)', flex:1 }}>{t.event}</div>
              <span style={chevron}>›</span>
            </button>
          ))}
        </div>
      )}

      {sub === 'glossary' && (
        <div>
          {CONQUEST_GLOSSARY.map((g, i) => (
            <button key={i} onClick={() => onWikiOpen({ wikiPage: g.wikiPage, label: g.term })}
              style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer',
                paddingTop:10, paddingBottom:10, borderBottom:'1px solid var(--line)',
                display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:600, fontFamily:'var(--sans)',
                  color:'var(--gold)', marginBottom:3 }}>{g.term}</div>
                <div className="body" style={{ fontSize:13, lineHeight:1.5, color:'var(--dim)' }}>{g.def}</div>
              </div>
              <span style={chevron}>›</span>
            </button>
          ))}
        </div>
      )}

      {sub === 'missions' && (
        <div>
          {CONQUEST_MISSIONS.map((m, i) => (
            <button key={i} onClick={() => onWikiOpen({ wikiPage: m.wikiPage, label: m.name })}
              style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:0, cursor:'pointer',
                paddingTop:11, paddingBottom:11, borderBottom:'1px solid var(--line)',
                display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap', marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:600, fontFamily:'var(--sans)', color:'var(--text)' }}>{m.name}</span>
                  <span className="meta" style={{ fontSize:11 }}>{m.year}</span>
                  <span style={{ fontSize:10, fontFamily:'var(--mono)', padding:'1px 7px', borderRadius:99,
                    background:'var(--surface-2)', border:'1px solid var(--line)', color:'var(--faint)' }}>{m.agency}</span>
                </div>
                <div className="meta" style={{ color:'var(--gold)', fontSize:11, marginBottom:2 }}>{m.dest}</div>
                <div className="body" style={{ fontSize:12.5, lineHeight:1.5, color:'var(--dim)' }}>{m.note}</div>
              </div>
              <span style={chevron}>›</span>
            </button>
          ))}
        </div>
      )}

      {sub === 'bios' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {CONQUEST_BIOS.map((b, i) => (
            <div key={i} style={{ borderRadius:14, padding:'14px 15px',
              background:'var(--surface-1)', border:'1px solid var(--line)' }}>
              <div style={{ fontSize:15, fontWeight:600, fontFamily:'var(--sans)',
                color:'var(--text)', marginBottom:2 }}>{b.name}</div>
              <div className="meta" style={{ color:'var(--gold)', marginBottom:7 }}>
                {b.dates} · {b.role}
              </div>
              <div className="body serif-body" style={{ fontSize:13, lineHeight:1.6, color:'var(--dim)' }}>{b.bio}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

const CONQUEST_CHAPTER_COLORS = {
  intro:'#3d6b9e', ch1:'#7b4a9e', ch2:'#4a9e6b', ch3:'#6b9e4a',
  ch4:'#9e7b4a', ch5:'#4a6b9e', ch6:'#9e4a4a', conclusion:'#4a7b9e', annexes:'#5a5a7e',
}

const CONQUEST_ALL = [
  ...CONQUEST,
  { id:'annexes', num:'', label:'Annexes', badge:'Annexes',
    title:'Chronologie · Glossaire · Missions · Biographies',
    sub:'Dates clés · Termes · Missions marquantes · Pionniers',
    color:'#2a2a3a', heroImg:null, sections:[] },
]

function ConquestCard({ chapter, onOpen }) {
  const accent = CONQUEST_CHAPTER_COLORS[chapter.id] || '#4a7b9e'
  return (
    <button onClick={() => onOpen(chapter)} className="press"
      style={{ width:'100%', textAlign:'left', cursor:'pointer',
        background:'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
        border:'1px solid var(--line)', borderRadius:'var(--r-l)', overflow:'hidden', padding:0 }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${accent},${accent}88)` }} />
      <div style={{ padding:'14px 16px 15px' }}>
        <div style={{ marginBottom:6 }}>
          <span style={{ fontSize:10.5, fontFamily:'var(--mono)', letterSpacing:'.08em',
            color:accent, background:`${accent}16`,
            border:`1px solid ${accent}40`, padding:'2px 9px', borderRadius:99 }}>
            {chapter.num ? `CH ${chapter.num}` : chapter.badge}
          </span>
        </div>
        <div className="h-card" style={{ fontSize:16, marginBottom: chapter.sub ? 4 : 0 }}>
          {chapter.title}
        </div>
        {chapter.sub && (
          <div className="body tight" style={{ fontSize:12, color:'var(--faint)', lineHeight:1.4 }}>
            {chapter.sub}
          </div>
        )}
        {chapter.sections.length > 0 && (
          <div style={{ marginTop:8, fontSize:11, fontFamily:'var(--mono)',
            color:accent, letterSpacing:'.04em' }}>
            {chapter.sections.length} section{chapter.sections.length > 1 ? 's' : ''} · Lire →
          </div>
        )}
        {chapter.id === 'annexes' && (
          <div style={{ marginTop:8, fontSize:11, fontFamily:'var(--mono)',
            color:accent, letterSpacing:'.04em' }}>
            Chronologie · Glossaire · Missions · Biographies →
          </div>
        )}
      </div>
    </button>
  )
}

function ConquestDetail({ chapter, onWikiOpen }) {
  if (!chapter) return null
  const accent = CONQUEST_CHAPTER_COLORS[chapter.id] || '#4a7b9e'
  return (
    <div>
      {chapter.heroImg && (
        <div style={{ borderRadius:14, overflow:'hidden', marginBottom:16, height:190,
          background:'var(--surface-2)' }}>
          <img src={chapter.heroImg} alt={chapter.title}
            onError={e => { e.target.style.display = 'none' }}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>
      )}
      {chapter.num && (
        <div style={{ fontSize:11, fontFamily:'var(--mono)', color:accent,
          letterSpacing:'.1em', textTransform:'uppercase', marginBottom:5 }}>
          Chapitre {chapter.num}
        </div>
      )}
      {!chapter.num && chapter.badge && chapter.id !== 'annexes' && (
        <div style={{ fontSize:11, fontFamily:'var(--mono)', color:accent,
          letterSpacing:'.1em', textTransform:'uppercase', marginBottom:5 }}>
          {chapter.label}
        </div>
      )}
      <div className="h-sec" style={{ fontSize:22, marginBottom: chapter.sub ? 5 : 18 }}>
        {chapter.title}
      </div>
      {chapter.sub && (
        <div className="meta" style={{ marginBottom:20, color:'var(--faint)' }}>{chapter.sub}</div>
      )}
      {chapter.id === 'annexes'
        ? <ConquestAnnexes onWikiOpen={onWikiOpen} />
        : chapter.sections.map((s, i) => <ConquestSection key={i} section={s} />)
      }
    </div>
  )
}

function ConquestView() {
  const [selected, setSelected] = useState(null)
  const [wikiItem, setWikiItem] = useState(null)
  return (
    <div className="enter">
      <p className="body" style={{ padding:'6px 18px 10px', fontSize:12.5, color:'var(--faint)' }}>
        De Spoutnik à Mars — histoire, enjeux et futur de la conquête spatiale
      </p>
      <div className="pad" style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {CONQUEST_ALL.map(ch => (
          <ConquestCard key={ch.id} chapter={ch} onOpen={setSelected} />
        ))}
      </div>
      <Sheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <ConquestDetail chapter={selected} onWikiOpen={setWikiItem} />}
      </Sheet>
      <WikiSummarySheet
        open={!!wikiItem}
        wikiPage={wikiItem?.wikiPage}
        label={wikiItem?.label}
        onClose={() => setWikiItem(null)}
      />
    </div>
  )
}

// ─── Segments ─────────────────────────────────────────────────────────────────

const SEGMENTS = [
  { key: 'solar', label: 'Système solaire' },
  { key: 'jwst', label: 'James Webb' },
  { key: 'conquest', label: 'Conquête spatiale' },
  { key: 'anomaly', label: 'Anomalies' },
  { key: 'theory', label: 'Théories' },
]

function Segmented({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 18px 4px', scrollbarWidth: 'none' }}>
      {SEGMENTS.map(s => (
        <button key={s.key} className={'chip' + (value === s.key ? ' on' : '')} onClick={() => onChange(s.key)}>{s.label}</button>
      ))}
    </div>
  )
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const [seg, setSeg] = useState('solar')
  const [planet, setPlanet] = useState(null)
  const [moonsFor, setMoonsFor] = useState(null)
  const [anom, setAnom] = useState(null)
  const [theo, setTheo] = useState(null)
  const [sunOpen, setSunOpen] = useState(false)

  const profile = useMemo(() => onbLoad(), [])
  const lat = profile.location?.lat ?? 48.8566
  const lng = profile.location?.lng ?? 2.3522
  const now = useMemo(() => new Date(), [])
  const planetPositions = useMemo(() => {
    try { return getPlanetPositions(now, lat, lng) } catch { return [] }
  }, [now, lat, lng])

  const getPos = (p) => {
    const astroId = ASTRO_ID[p.id] ?? p.id
    return planetPositions.find(x => x.id === astroId) ?? null
  }

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow="Explorer le cosmos" title="Explorer" right={<SettingsBtn />} />
      <TipBanner tipKey="explore" />
      <Segmented value={seg} onChange={setSeg} />
      <div style={{ marginTop: 6 }}>
        {seg === 'solar'    && <SolarView onPick={setPlanet} onSun={() => setSunOpen(true)} onMoons={setMoonsFor} planetPositions={planetPositions} />}
        {seg === 'jwst'     && <JwstView />}
        {seg === 'conquest' && <ConquestView />}
        {seg === 'anomaly'  && <AnomalyView onPick={setAnom} />}
        {seg === 'theory'   && <TheoryView onPick={setTheo} />}
      </div>

      {/* Fiche planète */}
      <Sheet open={!!planet} onClose={() => setPlanet(null)}>
        {planet && <PlanetSheetContent planet={planet} pos={getPos(planet)} />}
      </Sheet>

      {/* Lunes */}
      <MoonsSheet planet={moonsFor} open={!!moonsFor} onClose={() => setMoonsFor(null)} />

      {/* Fiche Soleil */}
      <SunSheet open={sunOpen} onClose={() => setSunOpen(false)} />

      {/* Fiche anomalie */}
      <Sheet open={!!anom} onClose={() => setAnom(null)}>
        {anom && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: anom.color, boxShadow: `0 0 16px ${anom.color}` }} />
              <div className="h-sec" style={{ fontSize: 25, flex: 1 }}>{anom.name}</div>
            </div>
            <div className="tag" style={{ marginBottom: 16 }}>{anom.tag}</div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62, margin: '0 0 14px' }}>{anom.body}</p>
            <AiInfoPanel cacheKey={`explore_anom_${anom.id}`} style={{ marginBottom: 4 }} buildPrompt={`Anomalie astronomique : ${anom.name} (${anom.tag}).
${anom.body}
En 3 à 4 phrases, vulgarise ce phénomène davantage : pourquoi est-il inexpliqué ou surprenant, quelles hypothèses existent, et ce que cela signifie pour notre compréhension de l\'univers ?`} />
            <WikiLink url={anom.wikiUrl} />
            <div className="card-2" style={{ padding: '4px 16px', marginTop: 16 }}>
              {anom.facts.map((f, i) => <DataRow key={i} k={f[0]} v={f[1]} accent={i === 0} />)}
            </div>
          </div>
        )}
      </Sheet>

      {/* Fiche théorie */}
      <Sheet open={!!theo} onClose={() => setTheo(null)}>
        {theo && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28,
                color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>{theo.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="meta" style={{ color: 'var(--gold)', marginBottom: 4 }}>{theo.when}</div>
                <div className="h-sec" style={{ fontSize: 23 }}>{theo.name}</div>
              </div>
            </div>
            <p className="body serif-body" style={{ fontSize: 15.5, lineHeight: 1.62, color: 'var(--text)', margin: '0 0 14px' }}>{theo.short}</p>
            <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.62, margin: '0 0 16px' }}>{theo.body}</p>
            <AiInfoPanel cacheKey={`explore_theo_${theo.id}`} style={{ marginBottom: 4 }} buildPrompt={`Théorie cosmologique : ${theo.name} (${theo.when}).
${theo.short}
${theo.body}
En 3 à 4 phrases, développe les implications de cette théorie pour un passionné d\'astronomie : les questions ouvertes qu\'elle soulève, les observations qui la soutiennent ou la challengent, et une conséquence concrète si elle était confirmée.`} />
            <WikiLink url={theo.wikiUrl} />
          </div>
        )}
      </Sheet>
    </div>
  )
}
