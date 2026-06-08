import { useState, useMemo, useEffect } from 'react'
import { IcPin, IcSearch, IcCompass, IcClose } from './icons'
import { ScreenHeader, IconBtn, SettingsBtn, HeaderTools, ChipRow, SectionTitle, DataRow, Sheet } from './ui'
import { SKY_OBJECTS, CONSTELLATIONS } from './data'

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

function SkyDome({ filter, onPick }) {
  const stars = useStarfield(150)
  const visible = SKY_OBJECTS.filter(o => filter === 'all'
    || (filter === 'planet' && o.kind === 'Planète')
    || (filter === 'star' && o.kind === 'Étoile')
    || (filter === 'deep' && o.deep))

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1', margin: '4px 0 2px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 38%, #122044 0%, #0a132b 55%, #060c1c 100%)',
        border: '1px solid var(--line-2)',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,.6), 0 0 0 6px rgba(120,150,220,.03)' }} />
      {[0.33, 0.66].map((f, i) => (
        <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px dashed rgba(150,180,235,.10)', inset: `${f * 50}%` }} />
      ))}
      {[['N', '50%', '2%', 'translateX(-50%)'], ['S', '50%', '94%', 'translateX(-50%)'],
        ['E', '94%', '50%', 'translateY(-50%)'], ['O', '2%', '50%', 'translateY(-50%)']].map(([l, lf, tp, tr]) => (
        <span key={l} className="meta" style={{ position: 'absolute', left: lf, top: tp, transform: tr,
          color: 'var(--gold)', fontSize: 11, fontWeight: 600 }}>{l}</span>
      ))}

      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {(filter === 'all' || filter === 'star') && CONSTELLATIONS.map((c, ci) =>
          c.lines.map((ln, li) => (
            <line key={ci + '-' + li}
              x1={c.pts[ln[0]][0]} y1={c.pts[ln[0]][1]} x2={c.pts[ln[1]][0]} y2={c.pts[ln[1]][1]}
              stroke="rgba(126,166,230,.30)" strokeWidth="0.3" />
          ))
        )}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.32} fill="#dce6ff" opacity={s.o}>
            <animate attributeName="opacity" values={`${s.o};${s.o * 0.4};${s.o}`}
              dur={`${3 + s.d}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {visible.map(o => (
        <button key={o.id} onClick={() => onPick(o)} className="press"
          style={{ position: 'absolute', left: o.x + '%', top: o.y + '%', transform: 'translate(-50%,-50%)',
            background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 3, zIndex: 5 }}>
          <span style={{ width: o.r * 2.4, height: o.r * 2.4, borderRadius: '50%', background: o.color,
            boxShadow: `0 0 ${o.r * 3}px ${o.color}, 0 0 4px ${o.color}` }} />
          <span className="meta" style={{ fontSize: 8.5, color: 'var(--dim)', whiteSpace: 'nowrap',
            textShadow: '0 1px 4px #000' }}>{o.name.split(' — ')[0]}</span>
        </button>
      ))}

      <span style={{ position: 'absolute', top: '20%', left: '78%', width: 60, height: 1,
        background: 'linear-gradient(90deg, transparent, #fff)', borderRadius: 2,
        animation: 'shoot 9s ease-in 2s infinite', pointerEvents: 'none' }} />
    </div>
  )
}

function SkySheet({ o, onClose }) {
  return (
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
          <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--dim)', margin: '0 0 20px' }}>{o.info}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <DataRow k="Magnitude" v={`${o.mag > 0 ? '+' : ''}${o.mag.toFixed(1)}`} accent />
            <DataRow k="Constellation" v={o.cons} />
            <DataRow k="Altitude" v={`${o.alt}°`} />
            <DataRow k="Azimut" v={`${o.az}°`} />
            <DataRow k="Distance" v={o.dist} />
            <DataRow k="Lever / Coucher" v={o.rise === '—' ? 'circumpolaire' : `${o.rise} / ${o.set}`} />
          </div>
          <button className="press" style={{ width: '100%', marginTop: 22, height: 50, borderRadius: 14,
            border: 0, cursor: 'pointer', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 14.5,
            color: '#1a130a', background: 'linear-gradient(180deg,var(--gold-2),var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IcCompass size={18} /> Pointer vers l'objet
          </button>
        </div>
      )}
    </Sheet>
  )
}

export default function SkyScreen() {
  const [filter, setFilter] = useState('all')
  const [pick, setPick] = useState(null)

  const chips = [
    { key: 'all', label: 'Tout' }, { key: 'planet', label: 'Planètes' },
    { key: 'star', label: 'Étoiles' }, { key: 'deep', label: 'Ciel profond' },
  ]
  const list = SKY_OBJECTS.filter(o => o.alt > 0).sort((a, b) => a.mag - b.mag)

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow="Ciel en direct" title="Ce soir"
        right={<HeaderTools><IconBtn><IcSearch size={19} /></IconBtn><SettingsBtn /></HeaderTools>} />

      <div className="pad" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 12.5 }}>
          <IcPin size={15} style={{ color: 'var(--gold)' }} /> Paris, FR · 48,85° N
        </span>
        <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--faint)' }} />
        <span style={{ color: 'var(--dim)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IcClock size={15} style={{ color: 'var(--gold)' }} /><LiveClock />
        </span>
      </div>

      <ChipRow items={chips} value={filter} onChange={setFilter} style={{ marginBottom: 4 }} />

      <div className="pad">
        <SkyDome filter={filter} onPick={setPick} />
        <p className="meta" style={{ textAlign: 'center', marginTop: 2 }}>
          Touchez un astre · planisphère orienté vers le zénith
        </p>
      </div>

      <div className="pad">
        <SectionTitle action="Magnitude ↑">Maintenant visible</SectionTitle>
        <div className="card-2" style={{ overflow: 'hidden' }}>
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
