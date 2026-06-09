import { useState, useMemo } from 'react'
import { IcSat, IcRocket } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { fetchISSPosition, fetchISSPasses, fetchLaunches, useLiveData } from './api'
import { onbLoad } from './onboarding'

const SAT_MISSIONS = [
  { name: 'James Webb (JWST)', org: 'NASA/ESA', status: 'En service', note: "Au point L2, à 1,5 M km. Observe l'univers en infrarouge depuis 2022.", color: 'var(--good)' },
  { name: 'Perseverance', org: 'NASA', status: 'Active', note: "Cratère Jezero, Mars. Collecte d'échantillons pour retour futur.", color: 'var(--good)' },
  { name: 'JUICE', org: 'ESA', status: 'En transit', note: 'Survol de Vénus en 2026, arrivée dans le système de Jupiter en 2031.', color: 'var(--warn)' },
  { name: 'Voyager 1', org: 'NASA', status: 'Espace interstellaire', note: 'À 24,8 milliards de km. Sonde la plus lointaine, lancée en 1977.', color: 'var(--blue)' },
]


const SAT_PROBES = [
  { name: 'Voyager 1', dist: '24,8 Mds km', detail: '167 UA · interstellaire' },
  { name: 'Voyager 2', dist: '20,6 Mds km', detail: '138 UA · interstellaire' },
  { name: 'New Horizons', dist: '8,9 Mds km', detail: '60 UA · ceinture de Kuiper' },
  { name: 'Parker Solar Probe', dist: '0,05 UA', detail: 'Périhélie · couronne solaire' },
]

function ISSLiveCard({ iss, loading }) {
  return (
    <div style={{ padding: 16, borderRadius: 18, background: 'linear-gradient(180deg, rgba(126,166,230,.12), var(--surface-1))', border: '1px solid rgba(126,166,230,.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--blue)', background: 'rgba(126,166,230,.12)', border: '1px solid rgba(126,166,230,.3)' }}><IcSat size={20} /></span>
        <div style={{ flex: 1 }}>
          <div className="h-card" style={{ fontSize: 15 }}>Station spatiale (ISS)</div>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, color: 'var(--good)' }}>
            <span className="dot pulse" style={{ background: 'var(--good)' }} />
            {loading ? 'Connexion…' : iss ? `En orbite · ${iss.visibility === 'daylight' ? 'côté jour' : iss.visibility === 'eclipsed' ? 'éclipsée' : 'visible'}` : 'En orbite'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[
          ['Altitude', iss ? iss.altitude + ' km' : '—'],
          ['Vitesse', iss ? iss.velocity + ' km/h' : '—'],
          ['Position', iss ? `${iss.lat?.toFixed(1)}° / ${iss.lng?.toFixed(1)}°` : '—'],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="meta" style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>{k}</div>
            <div className="data" style={{ fontSize: 14, color: 'var(--text)', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SatellitesPage({ onBack }) {
  const [seg, setSeg] = useState('track')
  const profile = useMemo(() => onbLoad(), [])
  const lat = profile.location?.lat ?? 48.8566
  const lng = profile.location?.lng ?? 2.3522

  const { data: iss, loading: issLoading } = useLiveData(fetchISSPosition, 10000)
  const { data: passes, loading: passesLoading } = useLiveData(() => fetchISSPasses(lat, lng), 3600000)
  const { data: launches } = useLiveData(fetchLaunches)

  return (
    <ToolPage title="Satellites" onBack={onBack}>
      <ToolSeg items={[{ key: 'track', label: 'Suivi' }, { key: 'explore', label: 'Exploration' }]} value={seg} onChange={setSeg} />

      {seg === 'track' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 14 }}>
            <ISSLiveCard iss={iss} loading={issLoading} />
          </div>

          <ToolSection title="Passages ISS — 24 h">
            {passesLoading && (
              <div style={{ padding: '14px 15px', color: 'var(--faint)', fontSize: 13 }}>Calcul des passages…</div>
            )}
            {!passesLoading && passes && passes.length === 0 && (
              <div style={{ padding: '14px 15px', color: 'var(--faint)', fontSize: 13 }}>Aucun passage visible depuis votre position dans les 24 prochaines heures.</div>
            )}
            {!passesLoading && passes && passes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {passes.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderRadius: 13,
                    background: p.bright ? 'linear-gradient(180deg, rgba(217,179,108,.08), var(--surface-1))' : 'var(--surface-1)',
                    border: '1px solid ' + (p.bright ? 'var(--gold-line)' : 'var(--line)') }}>
                    <div style={{ textAlign: 'center', width: 50, flexShrink: 0 }}>
                      <div className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>{p.time}</div>
                      <div className="meta" style={{ marginTop: 2 }}>{p.dur}</div>
                    </div>
                    <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="h-card" style={{ fontSize: 14 }}>ISS</div>
                      <div className="meta" style={{ marginTop: 2 }}>{p.dir} · culmine {p.alt}</div>
                    </div>
                    {p.bright && <span className="tag neutral" style={{ flexShrink: 0 }}>Belle passe</span>}
                  </div>
                ))}
              </div>
            )}
            {!passesLoading && !passes && (
              <div style={{ padding: '14px 15px', color: 'var(--faint)', fontSize: 13 }}>Impossible de récupérer les données de passage.</div>
            )}
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
              {(launches || []).map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
                  borderBottom: i < (launches.length - 1) ? '1px solid var(--line)' : 0 }}>
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
              {!launches && (
                <div style={{ padding: '14px 15px', color: 'var(--faint)', fontSize: 13 }}>Chargement…</div>
              )}
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
