import { useState, useEffect, useMemo, useRef } from 'react'
import { IcOrbit, IcChevron, IcArrowLeft, IcWave, IcSpark, IcRocket } from './icons'
import { ScreenHeader, SettingsBtn, DataRow, Sheet, AiInfoPanel } from './ui'
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

// ─── Segments ─────────────────────────────────────────────────────────────────

const SEGMENTS = [
  { key: 'solar', label: 'Système solaire' },
  { key: 'jwst', label: 'James Webb' },
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
      <Segmented value={seg} onChange={setSeg} />
      <div style={{ marginTop: 6 }}>
        {seg === 'solar'   && <SolarView onPick={setPlanet} onSun={() => setSunOpen(true)} onMoons={setMoonsFor} planetPositions={planetPositions} />}
        {seg === 'jwst'    && <JwstView />}
        {seg === 'anomaly' && <AnomalyView onPick={setAnom} />}
        {seg === 'theory'  && <TheoryView onPick={setTheo} />}
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
