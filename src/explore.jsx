import { useState } from 'react'
import { IcOrbit, IcChevron } from './icons'
import { ScreenHeader, SettingsBtn, DataRow, Sheet } from './ui'
import { PLANETS, JWST, ANOMALIES, THEORIES } from './data'

function Orb({ p, size = 96 }) {
  const ring = p.id === 'saturne' || p.id === 'uranus'
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

function SolarView({ onPick }) {
  return (
    <div className="enter">
      <p className="body" style={{ padding: '6px 18px 4px', fontSize: 12.5 }}>
        Huit planètes en orbite autour du Soleil. Touchez pour les caractéristiques physiques.
      </p>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '12px 18px 18px', scrollbarWidth: 'none' }}>
        {PLANETS.map(p => (
          <button key={p.id} onClick={() => onPick(p)} className="press" style={{ flexShrink: 0, width: 150,
            background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)',
            borderRadius: 'var(--r-l)', padding: 18, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Orb p={p} size={92} /></div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 3 }}>{p.dist}</div>
            <div className="h-card" style={{ fontSize: 16 }}>{p.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>{p.sub}</div>
          </button>
        ))}
      </div>
      <div className="pad">
        <div className="card" style={{ padding: 16, display: 'flex', gap: 13, alignItems: 'center' }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)',
            border: '1px solid var(--gold-line)', flexShrink: 0 }}><IcOrbit size={20} /></span>
          <div style={{ flex: 1 }}>
            <div className="h-card" style={{ fontSize: 14 }}>Le Soleil</div>
            <div className="body tight" style={{ fontSize: 12 }}>Étoile naine jaune · 1,39 M km · 99,86 % de la masse du système</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function JwstView() {
  return (
    <div className="enter">
      <p className="body" style={{ padding: '6px 18px 8px', fontSize: 12.5 }}>
        Images récentes du télescope spatial James Webb.
      </p>
      <div className="pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {JWST.map(j => (
          <div key={j.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-m)', overflow: 'hidden' }}>
            <div className="ph" style={{ height: 120, background: 'radial-gradient(circle at 50% 50%, #1a2647, #060c1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="meta" style={{ fontSize: 10, color: 'var(--faint)', textAlign: 'center', padding: '0 8px' }}>{j.target}</span>
            </div>
            <div style={{ padding: '11px 12px 13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span className="tag neutral">{j.instr}</span>
                <span className="meta" style={{ fontSize: 9.5 }}>{j.date}</span>
              </div>
              <div className="h-card" style={{ fontSize: 13.5, lineHeight: 1.2 }}>{j.name}</div>
              <div className="meta" style={{ color: 'var(--gold)', margin: '3px 0 6px' }}>{j.target}</div>
              <div className="body tight" style={{ fontSize: 11.5 }}>{j.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

export default function ExploreScreen() {
  const [seg, setSeg] = useState('solar')
  const [planet, setPlanet] = useState(null)
  const [anom, setAnom] = useState(null)
  const [theo, setTheo] = useState(null)

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow="Explorer le cosmos" title="Explorer" right={<SettingsBtn />} />
      <Segmented value={seg} onChange={setSeg} />
      <div style={{ marginTop: 6 }}>
        {seg === 'solar'  && <SolarView onPick={setPlanet} />}
        {seg === 'jwst'   && <JwstView />}
        {seg === 'anomaly'&& <AnomalyView onPick={setAnom} />}
        {seg === 'theory' && <TheoryView onPick={setTheo} />}
      </div>

      <Sheet open={!!planet} onClose={() => setPlanet(null)}>
        {planet && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 16px' }}><Orb p={planet} size={128} /></div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div className="tag" style={{ marginBottom: 8 }}>{planet.sub}</div>
              <div className="h-sec" style={{ fontSize: 28 }}>{planet.name}</div>
            </div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, textAlign: 'center', margin: '0 0 18px' }}>{planet.note}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <DataRow k="Diamètre" v={planet.diam} accent />
              <DataRow k="Masse" v={planet.mass} />
              <DataRow k="Jour" v={planet.day} />
              <DataRow k="Année" v={planet.year} />
              <DataRow k="Lunes" v={planet.moons} />
              <DataRow k="Distance" v={planet.dist} />
              <DataRow k="Température" v={planet.temp} />
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={!!anom} onClose={() => setAnom(null)}>
        {anom && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: anom.color, boxShadow: `0 0 16px ${anom.color}` }} />
              <div className="h-sec" style={{ fontSize: 25, flex: 1 }}>{anom.name}</div>
            </div>
            <div className="tag" style={{ marginBottom: 16 }}>{anom.tag}</div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62, margin: '0 0 18px' }}>{anom.body}</p>
            <div className="card-2" style={{ padding: '4px 16px' }}>
              {anom.facts.map((f, i) => <DataRow key={i} k={f[0]} v={f[1]} accent={i === 0} />)}
            </div>
          </div>
        )}
      </Sheet>

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
            <p className="body serif-body" style={{ fontSize: 14.5, lineHeight: 1.62, margin: 0 }}>{theo.body}</p>
          </div>
        )}
      </Sheet>
    </div>
  )
}
