import { useState } from 'react'
import { IcSat, IcRocket } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'

const SAT_PASSES = [
  { name: 'ISS', mag: '−3,8', time: '22:41', dir: 'SO → NE', alt: '78°', dur: '6 min', bright: true },
  { name: 'Tiangong', mag: '−1,9', time: '04:12', dir: 'SO → E', alt: '41°', dur: '4 min' },
  { name: 'Starlink (train)', mag: '+3,5', time: '23:18', dir: 'O → E', alt: '55°', dur: '3 min' },
  { name: 'Hubble (HST)', mag: '+2,1', time: '00:54', dir: 'SO → SE', alt: '32°', dur: '5 min' },
]

const SAT_MISSIONS = [
  { name: 'James Webb (JWST)', org: 'NASA/ESA', status: 'En service', note: 'Au point L2, à 1,5 M km. Observe l\'univers en infrarouge depuis 2022.', color: 'var(--good)' },
  { name: 'Perseverance', org: 'NASA', status: 'Active', note: 'Cratère Jezero, Mars. Collecte d\'échantillons pour retour futur.', color: 'var(--good)' },
  { name: 'JUICE', org: 'ESA', status: 'En transit', note: 'Survol de Vénus en 2026, arrivée dans le système de Jupiter en 2031.', color: 'var(--warn)' },
  { name: 'Voyager 1', org: 'NASA', status: 'Espace interstellaire', note: 'À 24,8 milliards de km. Sonde la plus lointaine, lancée en 1977.', color: 'var(--blue)' },
]

const SAT_LAUNCHES = [
  { org: 'SpaceX', title: 'Starship — vol orbital V3', date: '12 juin 2026', tag: 'à venir' },
  { org: 'NASA', title: 'Artemis II — autour de la Lune', date: 'Fév. 2026', tag: 'proche' },
  { org: 'ESA', title: 'Ariane 6 — vol commercial', date: '4 juil. 2026', tag: 'à venir' },
]

const SAT_PROBES = [
  { name: 'Voyager 1', dist: '24,8 Mds km', detail: '167 UA · interstellaire' },
  { name: 'Voyager 2', dist: '20,6 Mds km', detail: '138 UA · interstellaire' },
  { name: 'New Horizons', dist: '8,9 Mds km', detail: '60 UA · ceinture de Kuiper' },
  { name: 'Parker Solar Probe', dist: '0,05 UA', detail: 'Périhélie · couronne solaire' },
]

export default function SatellitesPage({ onBack }) {
  const [seg, setSeg] = useState('track')

  return (
    <ToolPage title="Satellites" onBack={onBack}>
      <ToolSeg items={[{ key: 'track', label: 'Suivi' }, { key: 'explore', label: 'Exploration' }]} value={seg} onChange={setSeg} />

      {seg === 'track' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 14 }}>
            <div style={{ padding: 16, borderRadius: 18, background: 'linear-gradient(180deg, rgba(126,166,230,.12), var(--surface-1))', border: '1px solid rgba(126,166,230,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--blue)', background: 'rgba(126,166,230,.12)', border: '1px solid rgba(126,166,230,.3)' }}><IcSat size={20} /></span>
                <div style={{ flex: 1 }}>
                  <div className="h-card" style={{ fontSize: 15 }}>Station spatiale (ISS)</div>
                  <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, color: 'var(--good)' }}>
                    <span className="dot pulse" style={{ background: 'var(--good)' }} /> En orbite · au-dessus du Pacifique
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[['Altitude', '418 km'], ['Vitesse', '27 600 km/h'], ['Prochain passage', '22:41']].map(([k, v]) => (
                  <div key={k}>
                    <div className="meta" style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</div>
                    <div className="data" style={{ fontSize: 14, color: 'var(--text)', marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ToolSection title="Passages visibles ce soir">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {SAT_PASSES.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderRadius: 13,
                  background: p.bright ? 'linear-gradient(180deg, rgba(217,179,108,.08), var(--surface-1))' : 'var(--surface-1)',
                  border: '1px solid ' + (p.bright ? 'var(--gold-line)' : 'var(--line)') }}>
                  <div style={{ textAlign: 'center', width: 50, flexShrink: 0 }}>
                    <div className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>{p.time}</div>
                    <div className="meta" style={{ marginTop: 2 }}>{p.dur}</div>
                  </div>
                  <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-card" style={{ fontSize: 14 }}>{p.name}</div>
                    <div className="meta" style={{ marginTop: 2 }}>{p.dir} · culmine {p.alt}</div>
                  </div>
                  <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>mag {p.mag}</span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'explore' && (
        <div className="enter">
          <ToolSection title="Missions en cours" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SAT_MISSIONS.map(m => (
                <div key={m.name} style={{ padding: 14, borderRadius: 14, background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span className="h-card" style={{ fontSize: 14.5, flex: 1 }}>{m.name}</span>
                    <span className="tag neutral" style={{ borderColor: m.color, color: m.color }}>{m.status}</span>
                  </div>
                  <div className="meta" style={{ color: 'var(--gold)', marginBottom: 5 }}>{m.org}</div>
                  <div className="body tight" style={{ fontSize: 12.5 }}>{m.note}</div>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="Lancements à venir">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {SAT_LAUNCHES.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
                  borderBottom: i < SAT_LAUNCHES.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}><IcRocket size={16} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="h-card" style={{ fontSize: 13.5, display: 'block' }}>{l.title}</span>
                    <span className="meta" style={{ marginTop: 2 }}>{l.org}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span className="data" style={{ fontSize: 12, color: 'var(--gold)', display: 'block' }}>{l.date}</span>
                    <span className="tag neutral" style={{ marginTop: 4 }}>{l.tag}</span>
                  </span>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="Sondes dans l'espace lointain">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {SAT_PROBES.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px',
                  borderBottom: i < SAT_PROBES.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ flex: 1 }}>
                    <span className="h-card" style={{ fontSize: 13.5, display: 'block' }}>{p.name}</span>
                    <span className="meta" style={{ marginTop: 2 }}>{p.detail}</span>
                  </span>
                  <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>{p.dist}</span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}
    </ToolPage>
  )
}
