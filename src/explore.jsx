import { useState, useEffect, useMemo, useRef } from 'react'
import { IcOrbit, IcChevron, IcClose } from './icons'
import { ScreenHeader, SettingsBtn, DataRow, Sheet, AiInfoPanel } from './ui'
import { PLANETS, ANOMALIES, THEORIES } from './data'
import { getPlanetPositions } from './astro'
import { fetchJWSTImages, fetchNASAImages } from './api'
import { onbLoad } from './onboarding'

const ASTRO_ID = { mercure: 'mercury', saturne: 'saturn' }

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

// ─── Visuel planète (photo réelle + fallback CSS) ─────────────────────────────

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

function PlanetPhoto({ p, size = 92, borderRadius = '50%' }) {
  const [imgOk, setImgOk] = useState(!!p.img)
  if (!imgOk) return <PlanetOrb p={p} size={size} />
  return (
    <div style={{ width: size, height: size, borderRadius, overflow: 'hidden', flexShrink: 0,
      boxShadow: `0 0 28px ${p.color}55, 0 4px 18px rgba(0,0,0,.55)` }}>
      <img src={p.img} alt={p.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => setImgOk(false)} />
    </div>
  )
}

// ─── Carte planète (grille) ───────────────────────────────────────────────────

function PlanetCard({ p, pos, onPick }) {
  return (
    <button onClick={() => onPick(p)} className="press" style={{ flexShrink: 0, width: 150,
      background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
      borderRadius: 'var(--r-l)', padding: 18, cursor: 'pointer', textAlign: 'left' }}>
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
  )
}

// ─── Fiche planète (Sheet) ────────────────────────────────────────────────────

function PlanetSheetContent({ planet, pos }) {
  const [imgOk, setImgOk] = useState(!!planet.img)

  return (
    <div>
      {/* Hero photo */}
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

      {/* Galerie NASA dynamique */}
      <PhotoGallery
        query={planet.nameEn || planet.name + ' planet NASA'}
        title="Photos NASA · JPL"
      />
    </div>
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
      {/* Hero */}
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
        buildPrompt="Le Soleil — étoile naine jaune G2V, âge 4,6 Ga, luminosité 3,83×10²⁶ W, rotation différentielle (25 j à l'équateur, 35 j aux pôles). En 4 phrases, décris les phénomènes les plus spectaculaires observables (couronne, éruptions, taches, proéminences) et leur impact sur la Terre et les observateurs." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 4 }}>
        <DataRow k="Diamètre" v="1,39 M km" accent />
        <DataRow k="Masse" v="1,99 × 10³⁰ kg" />
        <DataRow k="Température surface" v="5 500 °C" />
        <DataRow k="Température couronne" v="> 1 000 000 °C" />
        <DataRow k="Distance Terre" v="1 UA · 150 M km" />
        <DataRow k="Âge" v="4,6 milliards d'ans" />
      </div>

      {/* Galerie Couronne + Taches */}
      <PhotoGallery query="solar corona chromosphere sunspot" title="Couronne · Chromosphère · Taches" />

      {/* Galerie Éruptions + Proéminences */}
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

function SolarView({ onPick, onSun, planetPositions }) {
  return (
    <div className="enter">
      <p className="body" style={{ padding: '6px 18px 4px', fontSize: 12.5 }}>
        Huit planètes en orbite autour du Soleil. Touchez pour les caractéristiques et les photos.
      </p>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '12px 18px 18px', scrollbarWidth: 'none' }}>
        {PLANETS.map(p => {
          const astroId = ASTRO_ID[p.id] ?? p.id
          const pos = planetPositions.find(x => x.id === astroId)
          return <PlanetCard key={p.id} p={p} pos={pos} onPick={onPick} />
        })}
      </div>

      {/* Carte Soleil cliquable */}
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
        {seg === 'solar'   && <SolarView onPick={setPlanet} onSun={() => setSunOpen(true)} planetPositions={planetPositions} />}
        {seg === 'jwst'    && <JwstView />}
        {seg === 'anomaly' && <AnomalyView onPick={setAnom} />}
        {seg === 'theory'  && <TheoryView onPick={setTheo} />}
      </div>

      {/* Fiche planète */}
      <Sheet open={!!planet} onClose={() => setPlanet(null)}>
        {planet && <PlanetSheetContent planet={planet} pos={getPos(planet)} />}
      </Sheet>

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
En 3 à 4 phrases, vulgarise ce phénomène davantage : pourquoi est-il inexpliqué ou surprenant, quelles hypothèses existent, et ce que cela signifie pour notre compréhension de l'univers ?`} />
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
En 3 à 4 phrases, développe les implications de cette théorie pour un passionné d'astronomie : les questions ouvertes qu'elle soulève, les observations qui la soutiennent ou la challengent, et une conséquence concrète si elle était confirmée.`} />
            <WikiLink url={theo.wikiUrl} />
          </div>
        )}
      </Sheet>
    </div>
  )
}
