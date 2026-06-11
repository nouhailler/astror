import { useState, useMemo, useEffect, useRef } from 'react'
import { IcPin, IcSearch, IcCompass, IcClose } from './icons'
import { ScreenHeader, IconBtn, SettingsBtn, HeaderTools, ChipRow, SectionTitle, DataRow, Sheet, AiInfoPanel } from './ui'
import { TipBanner } from './tips'
import { SKY_OBJECTS, CONSTELLATIONS } from './data'
import { getSkyPositions, getConstellationPoints } from './astro'
import { onbLoad } from './onboarding'

// Projection azimutale équidistante : zénith au centre, horizon au bord,
// N en haut, E à droite (cohérent avec les cardinaux du dôme et le pointage)
function project(alt, az) {
  const rad = az * Math.PI / 180
  const r = ((90 - alt) / 90) * 50
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad) }
}

function angleDiff(target, current) {
  return ((target - current + 540) % 360) - 180
}

function useCompass(enabled = true) {
  const [orient, setOrient] = useState(null)
  const [supported, setSupported] = useState(null) // null=détection, true=ok, false=non dispo
  const [dbg, setDbg] = useState({ abs: 0, rel: 0, lastAlpha: '—', lastAbsolute: '—' })

  useEffect(() => {
    if (!enabled) { setOrient(null); setSupported(null); return }
    let hasData = false
    let absCount = 0, relCount = 0

    function process(e) {
      const isAbs = e.type === 'deviceorientationabsolute'
      if (isAbs) absCount++; else relCount++
      setDbg({ abs: absCount, rel: relCount, lastAlpha: e.alpha?.toFixed(1) ?? 'null', lastAbsolute: String(e.absolute) })

      if (e.alpha == null) return
      hasData = true
      const heading = (360 - e.alpha + 360) % 360
      const elevation = 90 - Math.abs(e.beta ?? 0)
      setOrient({ heading, elevation })
      setSupported(true)
    }

    window.addEventListener('deviceorientationabsolute', process)
    window.addEventListener('deviceorientation', process)

    const timeout = setTimeout(() => {
      if (!hasData) setSupported(false)
    }, 5000)

    return () => {
      window.removeEventListener('deviceorientationabsolute', process)
      window.removeEventListener('deviceorientation', process)
      clearTimeout(timeout)
    }
  }, [enabled])

  return { orient, supported, dbg }
}

// iOS 13+ exige une permission explicite pour DeviceOrientation
async function ensureOrientationPermission() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function') {
      return (await DeviceOrientationEvent.requestPermission()) === 'granted'
    }
  } catch {}
  return true
}

const RADAR_R = 110  // radius of the radar display in px
const DEG_PER_PX = 1.6  // degrees per pixel displacement

function PointerOverlay({ object: o, onClose }) {
  const { orient, supported, dbg } = useCompass()
  const animRef = useRef(null)
  const dotRef = useRef({ x: 0, y: 0 })
  const dotElRef = useRef(null)

  const dAz  = orient ? angleDiff(o.az, orient.heading) : null
  const dAlt = orient ? (o.alt - orient.elevation) : null
  const totalErr = dAz != null ? Math.sqrt(dAz ** 2 + (dAlt ?? 0) ** 2) : null
  const locked = totalErr != null && totalErr < 5

  // smooth dot position with rAF
  useEffect(() => {
    if (dAz == null || dAlt == null) return
    const targetX = Math.max(-RADAR_R, Math.min(RADAR_R, dAz * DEG_PER_PX))
    const targetY = Math.max(-RADAR_R, Math.min(RADAR_R, -dAlt * DEG_PER_PX))

    function step() {
      dotRef.current.x += (targetX - dotRef.current.x) * 0.25
      dotRef.current.y += (targetY - dotRef.current.y) * 0.25
      if (dotElRef.current) {
        dotElRef.current.style.transform =
          `translate(calc(-50% + ${dotRef.current.x}px), calc(-50% + ${dotRef.current.y}px))`
      }
      animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [dAz, dAlt])

  const dirText = () => {
    if (dAz == null) return ''
    const h = Math.abs(dAz) < 3 ? '' : dAz > 0 ? `Tournez à droite ${Math.round(Math.abs(dAz))}°` : `Tournez à gauche ${Math.round(Math.abs(dAz))}°`
    const v = Math.abs(dAlt) < 3 ? '' : dAlt > 0 ? `Inclinez vers le haut ${Math.round(Math.abs(dAlt))}°` : `Inclinez vers le bas ${Math.round(Math.abs(dAlt))}°`
    if (locked) return 'Aligné ✓'
    return [h, v].filter(Boolean).join(' · ') || 'Quasi aligné'
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(4,6,14,.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px' }}>

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0,
        padding: 'calc(var(--sat) + 18px) 20px 18px',
        display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--line)' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: o.color, flexShrink: 0,
          boxShadow: `0 0 18px ${o.color}` }} />
        <div style={{ flex: 1 }}>
          <div className="h-sec" style={{ fontSize: 20 }}>{o.name}</div>
          <div className="meta" style={{ color: 'var(--gold)', marginTop: 2 }}>
            Az {o.az}° · Alt {o.alt}°
          </div>
        </div>
        <button onClick={onClose} className="press" aria-label="Fermer"
          style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line-2)',
            background: 'rgba(255,255,255,.03)', color: 'var(--dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IcClose size={20} />
        </button>
      </div>

      {/* Radar */}
      {supported === false ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--line-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            color: 'var(--faint)' }}>
            <IcCompass size={36} />
          </div>
          <div className="h-card" style={{ marginBottom: 10 }}>Capteur boussole indisponible</div>
          {/* Panneau de diagnostic temporaire */}
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gold)', background: 'rgba(255,200,0,.07)',
            border: '1px solid rgba(255,200,0,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            textAlign: 'left', width: 280 }}>
            <div>events absolute: <b>{dbg.abs}</b></div>
            <div>events relative: <b>{dbg.rel}</b></div>
            <div>last alpha: <b>{dbg.lastAlpha}</b></div>
            <div>last e.absolute: <b>{dbg.lastAbsolute}</b></div>
            {dbg.abs === 0 && dbg.rel === 0 && (
              <div style={{ marginTop: 6, color: 'var(--warn)', fontSize: 11 }}>
                Aucun événement reçu → Chrome bloque les capteurs.<br />
                Chrome → ⋮ → Paramètres → Paramètres des sites → Capteurs → Autoriser
              </div>
            )}
            {(dbg.abs > 0 || dbg.rel > 0) && dbg.lastAlpha === 'null' && (
              <div style={{ marginTop: 6, color: 'var(--warn)', fontSize: 11 }}>
                Événements reçus mais alpha=null → agitez le téléphone en 8 pour calibrer la boussole
              </div>
            )}
          </div>
          <p className="body" style={{ color: 'var(--faint)', fontSize: 13.5, maxWidth: 280, lineHeight: 1.6 }}>
            Orientez-vous manuellement :<br />
            Cap <strong style={{ color: 'var(--gold)' }}>{o.az}°</strong> (azimut) ·{' '}
            à <strong style={{ color: 'var(--gold)' }}>{o.alt}°</strong> au-dessus de l'horizon
          </p>
        </div>
      ) : supported === null ? (
        <div style={{ color: 'var(--faint)', fontSize: 13 }}>Détection du capteur…</div>
      ) : (
        <>
          {/* Compass circle */}
          <div style={{ position: 'relative', width: RADAR_R * 2, height: RADAR_R * 2 }}>
            {/* Outer ring */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${locked ? 'var(--good)' : 'var(--line-2)'}`,
              boxShadow: locked ? '0 0 24px rgba(132,211,169,.25), inset 0 0 24px rgba(132,211,169,.06)' : 'none',
              transition: 'border-color .3s, box-shadow .3s' }} />
            {/* Inner rings */}
            {[0.5, 0.25].map((f, i) => (
              <div key={i} style={{ position: 'absolute', borderRadius: '50%',
                border: '1px dashed var(--line)', inset: `${(1 - f) * RADAR_R}px` }} />
            ))}
            {/* Cardinal marks */}
            {[['N', 0], ['E', 90], ['S', 180], ['O', 270]].map(([l, deg]) => {
              const rad = (deg - 90) * Math.PI / 180
              const cx = RADAR_R + Math.cos(rad) * (RADAR_R - 14)
              const cy = RADAR_R + Math.sin(rad) * (RADAR_R - 14)
              return (
                <span key={l} className="meta" style={{ position: 'absolute', left: cx, top: cy,
                  transform: 'translate(-50%, -50%)', fontSize: 10, color: 'var(--faint)' }}>{l}</span>
              )
            })}
            {/* Target crosshair (center = where you need to point) */}
            <div style={{ position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1,
                background: 'var(--gold)', transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
                background: 'var(--gold)', transform: 'translateX(-50%)' }} />
              <div style={{ position: 'absolute', inset: 6, borderRadius: '50%',
                border: `1.5px solid ${locked ? 'var(--good)' : 'var(--gold)'}`,
                transition: 'border-color .3s' }} />
            </div>
            {/* Device heading dot */}
            <div ref={dotElRef} style={{ position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: 16, height: 16, borderRadius: '50%',
              background: locked ? 'var(--good)' : 'var(--blue)',
              boxShadow: locked ? '0 0 12px var(--good)' : '0 0 8px var(--blue)',
              border: '2px solid rgba(255,255,255,.3)',
              transition: 'background .3s, box-shadow .3s', zIndex: 2 }} />
          </div>

          {/* Lock badge */}
          {locked && (
            <div style={{ marginTop: 18, padding: '7px 18px', borderRadius: 999,
              background: 'rgba(132,211,169,.12)', border: '1px solid rgba(132,211,169,.4)',
              color: 'var(--good)', fontSize: 13, fontWeight: 600, letterSpacing: '.06em' }}>
              ALIGNÉ ✓
            </div>
          )}

          {/* Direction text */}
          {!locked && (
            <div className="body" style={{ marginTop: 18, textAlign: 'center',
              fontSize: 14, color: 'var(--dim)', maxWidth: 280 }}>{dirText()}</div>
          )}

          {/* Numeric readout */}
          <div style={{ marginTop: locked ? 16 : 12, display: 'flex', gap: 28, justifyContent: 'center' }}>
            {[
              ['Azimut', orient ? Math.round(orient.heading) + '°' : '—', dAz != null ? (dAz > 0 ? `+${Math.round(dAz)}°→` : `${Math.round(dAz)}°←`) : ''],
              ['Altitude', orient ? Math.round(orient.elevation) + '°' : '—', dAlt != null ? (dAlt > 0 ? `+${Math.round(dAlt)}°↑` : `${Math.round(dAlt)}°↓`) : ''],
            ].map(([label, val, diff]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="meta" style={{ marginBottom: 4 }}>{label}</div>
                <div className="data" style={{ fontSize: 20, color: 'var(--text)' }}>{val}</div>
                <div className="meta" style={{ color: Math.abs(parseFloat(diff)) < 5 ? 'var(--good)' : 'var(--gold)', marginTop: 2 }}>{diff}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer hint */}
      <div className="meta" style={{ position: 'absolute', bottom: 'calc(var(--sab) + 20px)',
        textAlign: 'center', color: 'var(--faint)', fontSize: 11.5, maxWidth: 280 }}>
        Pointez l'appareil comme une lunette · point bleu = votre direction
      </div>
    </div>
  )
}

function useStarfield(n) {
  return useMemo(() => {
    const out = []
    let seed = 7
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2
      const r = Math.sqrt(rnd()) * 49
      out.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, s: rnd() * 1.6 + 0.4, o: rnd() * 0.5 + 0.25, d: rnd() * 4 })
    }
    return out
  }, [n])
}

function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id) }, [])
  const hh = String(t.getHours()).padStart(2, '0')
  const mm = String(t.getMinutes()).padStart(2, '0')
  const ss = String(t.getSeconds()).padStart(2, '0')
  return <span className="data">{hh}:{mm}<span style={{ color: 'var(--faint)' }}>:{ss}</span></span>
}

function IcClock({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>
    </svg>
  )
}

function SkyDome({ filter, objects, constellations, onPick }) {
  const stars = useStarfield(150)
  const [rot, setRot] = useState(0)              // rotation manuelle (degrés)
  const [compassOn, setCompassOn] = useState(false)
  const { orient, supported } = useCompass(compassOn)
  const domeRef = useRef(null)
  const drag = useRef(null)
  const moved = useRef(false)

  // boussole indisponible après détection → on revient en mode manuel
  useEffect(() => {
    if (compassOn && supported === false) setCompassOn(false)
  }, [compassOn, supported])

  // le haut de la carte indique la direction visée
  const ang = compassOn && orient ? -orient.heading : rot

  const toggleCompass = async () => {
    if (!compassOn && !(await ensureOrientationPermission())) return
    setCompassOn(v => !v)
  }

  const center = () => {
    const r = domeRef.current.getBoundingClientRect()
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
  }
  const onDown = (e) => {
    if (compassOn) return
    const { cx, cy } = center()
    moved.current = false
    drag.current = { cx, cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), r0: rot, x0: e.clientX, y0: e.clientY }
  }
  const onMove = (e) => {
    if (!drag.current) return
    if (Math.hypot(e.clientX - drag.current.x0, e.clientY - drag.current.y0) > 6) moved.current = true
    if (!moved.current) return
    const a = Math.atan2(e.clientY - drag.current.cy, e.clientX - drag.current.cx)
    setRot(drag.current.r0 + (a - drag.current.a0) * 180 / Math.PI)
  }
  const onUp = () => { drag.current = null }
  const pick = (o) => { if (!moved.current) onPick(o) }

  const rotated = Math.round(((rot % 360) + 360) % 360) !== 0
  const visible = objects.filter(o => o.alt > 0).filter(o => filter === 'all'
    || (filter === 'planet' && o.kind === 'Planète')
    || (filter === 'star' && o.kind === 'Étoile')
    || (filter === 'deep' && o.deep))

  return (
    <>
    <div ref={domeRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      onPointerLeave={onUp} onPointerCancel={onUp}
      style={{ position: 'relative', width: '100%', aspectRatio: '1', margin: '4px 0 2px',
        touchAction: 'pan-y' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 38%, #122044 0%, #0a132b 55%, #060c1c 100%)',
        border: '1px solid var(--line-2)',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,.6), 0 0 0 6px rgba(120,150,220,.03)' }} />
      {[0.33, 0.66].map((f, i) => (
        <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px dashed rgba(150,180,235,.10)', inset: `${f * 50}%` }} />
      ))}

      {/* Couche rotative : cardinaux, constellations, étoiles, objets */}
      <div style={{ position: 'absolute', inset: 0, transform: `rotate(${ang}deg)` }}>
        {[['N', '50%', '2%', 'translateX(-50%)'], ['S', '50%', '94%', 'translateX(-50%)'],
          ['E', '94%', '50%', 'translateY(-50%)'], ['O', '2%', '50%', 'translateY(-50%)']].map(([l, lf, tp, tr]) => (
          <span key={l} className="meta" style={{ position: 'absolute', left: lf, top: tp, transform: tr,
            color: 'var(--gold)', fontSize: 11, fontWeight: 600 }}>
            <span style={{ display: 'inline-block', transform: `rotate(${-ang}deg)` }}>{l}</span>
          </span>
        ))}

        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {(filter === 'all' || filter === 'star') && constellations.map((c, ci) =>
            c.lines.map((ln, li) => {
              const a = c.pts[ln[0]], b = c.pts[ln[1]]
              if (a.alt <= 0 || b.alt <= 0) return null
              const pa = project(a.alt, a.az), pb = project(b.alt, b.az)
              return (
                <line key={ci + '-' + li} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke="rgba(126,166,230,.30)" strokeWidth="0.3" />
              )
            })
          )}
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.32} fill="#dce6ff" opacity={s.o}>
              <animate attributeName="opacity" values={`${s.o};${s.o * 0.4};${s.o}`}
                dur={`${3 + s.d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {visible.map(o => {
          const p = project(o.alt, o.az)
          return (
          <button key={o.id} onClick={() => pick(o)} className="press"
            style={{ position: 'absolute', left: p.x + '%', top: p.y + '%',
              transform: `translate(-50%,-50%) rotate(${-ang}deg)`,
              background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 3, zIndex: 5 }}>
            <span style={{ width: o.r * 2.4, height: o.r * 2.4, borderRadius: '50%', background: o.color,
              boxShadow: `0 0 ${o.r * 3}px ${o.color}, 0 0 4px ${o.color}` }} />
            <span className="meta" style={{ fontSize: 8.5, color: 'var(--dim)', whiteSpace: 'nowrap',
              textShadow: '0 1px 4px #000' }}>{o.name.split(' — ')[0]}</span>
          </button>
          )
        })}
      </div>

      <span style={{ position: 'absolute', top: '20%', left: '78%', width: 60, height: 1,
        background: 'linear-gradient(90deg, transparent, #fff)', borderRadius: 2,
        animation: 'shoot 9s ease-in 2s infinite', pointerEvents: 'none' }} />

      {/* Contrôles d'orientation */}
      <button onClick={toggleCompass} aria-pressed={compassOn} aria-label="Aligner la carte avec la boussole"
        className="press" style={{ position: 'absolute', top: 6, left: 6, zIndex: 6,
          width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
          border: `1px solid ${compassOn ? 'var(--gold-line)' : 'var(--line-2)'}`,
          background: compassOn ? 'var(--gold-soft)' : 'rgba(8,12,24,.55)',
          color: compassOn ? 'var(--gold)' : 'var(--dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IcCompass size={17} />
      </button>
      {!compassOn && rotated && (
        <button onClick={() => setRot(0)} aria-label="Remettre le Nord en haut"
          className="press" style={{ position: 'absolute', top: 6, right: 6, zIndex: 6,
            width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
            border: '1px solid var(--line-2)', background: 'rgba(8,12,24,.55)', color: 'var(--gold)',
            fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          N
        </button>
      )}
    </div>
    <p className="meta" style={{ textAlign: 'center', marginTop: 2 }}>
      {compassOn
        ? (orient ? 'Carte alignée sur la boussole · le haut indique votre direction'
                  : 'Recherche de la boussole…')
        : 'Touchez un astre · glissez pour orienter la carte'}
    </p>
    </>
  )
}

function SkySheet({ o, onClose }) {
  const [pointing, setPointing] = useState(false)
  return (
    <>
      <Sheet open={!!o} onClose={onClose}>
        {o && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={{ width: 54, height: 54, borderRadius: '50%', background: o.color, flexShrink: 0,
                boxShadow: `0 0 26px ${o.color}, inset -6px -6px 14px rgba(0,0,0,.35)` }} />
              <div style={{ flex: 1 }}>
                <div className="tag" style={{ marginBottom: 6 }}>{o.kind}</div>
                <div className="h-sec" style={{ fontSize: 24 }}>{o.name}</div>
              </div>
              <button onClick={onClose} className="press" style={{ background: 'none', border: 0, color: 'var(--faint)', cursor: 'pointer' }}>
                <IcClose size={22} />
              </button>
            </div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 16px' }}>{o.info}</p>
            <AiInfoPanel cacheKey={`sky_${o.id}`} style={{ marginBottom: 20 }} buildPrompt={`Objet céleste : ${o.name} (${o.kind}, constellation ${o.cons}).
Magnitude : ${o.mag}, altitude : ${o.alt}°, distance : ${o.dist}.
${o.info}
En 4 phrases, que peut-on observer de ${o.name} ce soir avec un télescope amateur ? Quel grossissement utiliser, et quel est le détail le plus intéressant à chercher ?`} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <DataRow k="Magnitude" v={`${o.mag > 0 ? '+' : ''}${o.mag.toFixed(1)}`} accent />
              <DataRow k="Constellation" v={o.cons} />
              <DataRow k="Altitude" v={`${o.alt}°`} />
              <DataRow k="Azimut" v={`${o.az}°`} />
              <DataRow k="Distance" v={o.dist} />
              <DataRow k="Lever / Coucher" v={o.rise === '—' ? 'circumpolaire' : `${o.rise} / ${o.set}`} />
            </div>
            <button onClick={() => setPointing(true)} className="press"
              style={{ width: '100%', marginTop: 22, height: 50, borderRadius: 14,
              border: 0, cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14.5,
              color: '#1a130a', background: 'linear-gradient(180deg,var(--gold-2),var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <IcCompass size={18} /> Pointer vers l'objet
            </button>
          </div>
        )}
      </Sheet>
      {pointing && o && <PointerOverlay object={o} onClose={() => setPointing(false)} />}
    </>
  )
}

export default function SkyScreen() {
  const [filter, setFilter] = useState('all')
  const [pick, setPick] = useState(null)

  const loc = useMemo(() => {
    const p = onbLoad()
    return p.location?.lat != null ? p.location : { city: 'Paris', lat: 48.8566, lng: 2.3522 }
  }, [])

  // positions recalculées chaque minute (temps réel) ou à l'heure simulée
  const [now, setNow] = useState(() => new Date())
  const [offsetMin, setOffsetMin] = useState(0) // curseur temporel : 0 à +12 h
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  const simDate = useMemo(() => new Date(now.getTime() + offsetMin * 60000), [now, offsetMin])
  const simulating = offsetMin > 0
  const simLabel = simDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const objects = useMemo(() => getSkyPositions(SKY_OBJECTS, simDate, loc.lat, loc.lng), [simDate, loc])
  const constellations = useMemo(() => getConstellationPoints(CONSTELLATIONS, simDate, loc.lat, loc.lng), [simDate, loc])

  const chips = [
    { key: 'all', label: 'Tout' }, { key: 'planet', label: 'Planètes' },
    { key: 'star', label: 'Étoiles' }, { key: 'deep', label: 'Ciel profond' },
  ]
  const list = objects.filter(o => o.alt > 0).sort((a, b) => a.mag - b.mag)
  const latLabel = `${Math.abs(loc.lat).toFixed(2).replace('.', ',')}° ${loc.lat >= 0 ? 'N' : 'S'}`

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow="Ciel en direct" title="Ce soir"
        right={<HeaderTools><IconBtn><IcSearch size={19} /></IconBtn><SettingsBtn /></HeaderTools>} />

      <TipBanner tipKey="sky" />

      <div className="pad" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12.5 }}>
          <IcPin size={15} style={{ color: 'var(--gold)' }} /> {loc.city || 'Position'} · {latLabel}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--faint)' }} />
        <span style={{ color: 'var(--dim)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IcClock size={15} style={{ color: 'var(--gold)' }} /><LiveClock />
        </span>
      </div>

      <ChipRow items={chips} value={filter} onChange={setFilter} style={{ marginBottom: 4 }} />

      <div className="pad">
        <SkyDome filter={filter} objects={objects} constellations={constellations} onPick={setPick} />

        {/* Curseur temporel : de maintenant à +12 h */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 10 }}>
          <IcClock size={15} style={{ color: simulating ? 'var(--gold)' : 'var(--faint)', flexShrink: 0 }} />
          <input type="range" min={0} max={720} step={15} value={offsetMin}
            onChange={e => setOffsetMin(+e.target.value)}
            aria-label="Simuler le ciel à une heure ultérieure"
            style={{ flex: 1, accentColor: 'var(--gold)', cursor: 'pointer' }} />
          <span className="data" style={{ width: 44, textAlign: 'right', fontSize: 13,
            color: simulating ? 'var(--gold)' : 'var(--faint)' }}>{simLabel}</span>
        </div>
        {simulating && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 7 }}>
            <span className="meta" style={{ color: 'var(--gold)' }}>
              Ciel simulé à {simLabel}{simDate.getDate() !== now.getDate() ? ' (demain)' : ''}
            </span>
            <button onClick={() => setOffsetMin(0)} className="press"
              style={{ padding: '3px 10px', borderRadius: 99, cursor: 'pointer', fontSize: 10.5,
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em',
                background: 'rgba(255,255,255,.04)', border: '1px solid var(--line-2)', color: 'var(--dim)' }}>
              Maintenant
            </button>
          </div>
        )}
      </div>

      <div className="pad">
        <SectionTitle action="Magnitude ↑">{simulating ? `Visible à ${simLabel}` : 'Maintenant visible'}</SectionTitle>
        <div className="card-2" style={{ overflow: 'hidden' }}>
          {list.length === 0 && (
            <div className="body tight" style={{ padding: '16px 15px', fontSize: 13, color: 'var(--faint)' }}>
              Aucun objet du catalogue au-dessus de l'horizon en ce moment.
            </div>
          )}
          {list.map((o, i) => (
            <button key={o.id} onClick={() => setPick(o)} className="press" style={{ width: '100%',
              display: 'flex', alignItems: 'center', gap: 13, padding: '12px 15px', background: 'none',
              border: 0, borderBottom: i < list.length - 1 ? '1px solid var(--line)' : 0,
              textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: o.color, flexShrink: 0,
                boxShadow: `0 0 8px ${o.color}` }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="h-card" style={{ fontSize: 14.5 }}>{o.name}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--faint)', marginTop: 1 }}>
                  {o.kind} · {o.cons}
                </span>
              </span>
              <span style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className="data" style={{ fontSize: 13.5, color: 'var(--gold)', whiteSpace: 'nowrap' }}>mag {o.mag > 0 ? '+' : ''}{o.mag.toFixed(1)}</span>
                <span className="meta" style={{ display: 'block', marginTop: 1 }}>{o.alt}° alt</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <SkySheet o={pick} onClose={() => setPick(null)} />
    </div>
  )
}
