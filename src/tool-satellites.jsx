import { useState, useMemo, useEffect } from 'react'
import { IcSat, IcRocket, IcPin } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { AiInfoPanel } from './ui'
import { fetchISSPosition, fetchISSPasses, fetchLaunches, fetchMissionsNews, computeProbeDistances, useLiveData } from './api'
import { onbLoad } from './onboarding'

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
  const city = profile.location?.city ?? 'Paris'
  const today = useMemo(() => new Date(), [])

  const { data: iss, loading: issLoading } = useLiveData(fetchISSPosition, 10000)
  const { data: passes, loading: passesLoading } = useLiveData(() => fetchISSPasses(lat, lng), 3600000)
  const { data: launches } = useLiveData(fetchLaunches)
  const { data: missions, loading: missionsLoading } = useLiveData(fetchMissionsNews)
  const [probes, setProbes] = useState(() => computeProbeDistances())
  useEffect(() => {
    const t = setInterval(() => setProbes(computeProbeDistances()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <ToolPage title="Satellites" onBack={onBack} demoKey="tool_satellites">
      <ToolSeg items={[{ key: 'track', label: 'Suivi' }, { key: 'explore', label: 'Exploration' }]} value={seg} onChange={setSeg} />

      {seg === 'track' && (
        <div className="enter">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 0', gap: 8 }}>
            <span className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IcPin size={13} /> {city}
            </span>
            <span className="meta">
              {today.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

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

          <div className="pad" style={{ marginTop: 4 }}>
            <AiInfoPanel
              cacheKey={`sat_other_${today.toISOString().slice(0, 10)}_${lat.toFixed(1)}_${lng.toFixed(1)}`}
              label="Tiangong · Starlink · Hubble"
              buildPrompt={`Je suis à ${city} (latitude ${lat.toFixed(2)}°, longitude ${lng.toFixed(2)}°) le ${today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
Peux-tu me donner des informations sur les prochains passages visibles de ces satellites depuis ma position ?
- Station Tiangong (chinoise)
- Constellation Starlink (SpaceX)
- Télescope spatial Hubble (HST)
Pour chaque satellite, indique des horaires approximatifs ou les ressources fiables (sites, apps) pour les suivre précisément.`}
            />
          </div>
        </div>
      )}

      {seg === 'explore' && (
        <div className="enter">
          <ToolSection title="Missions en cours" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {missionsLoading && !missions && [0, 1, 2, 3].map(i => (
                <div key={i} style={{ padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ height: 14, flex: 1, borderRadius: 6, background: 'var(--surface-2)',
                      animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.12 + 's' }} />
                    <div style={{ height: 14, width: 60, borderRadius: 6, background: 'var(--surface-2)',
                      animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.12 + 's' }} />
                  </div>
                  <div style={{ height: 11, width: '40%', borderRadius: 6, marginBottom: 8, background: 'var(--surface-2)',
                    animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.18 + 's' }} />
                  <div style={{ height: 10, width: '90%', borderRadius: 6, background: 'var(--surface-2)',
                    animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.22 + 's' }} />
                </div>
              ))}
              {(missions || []).map(m => (
                <div key={m.name} style={{ padding: 14, borderRadius: 14,
                  background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <span className="h-card" style={{ fontSize: 14.5, flex: 1 }}>{m.name}</span>
                    <span className="tag neutral" style={{ borderColor: m.color, color: m.color, flexShrink: 0 }}>{m.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="meta" style={{ color: 'var(--gold)' }}>{m.org}</span>
                    {m.newsDate && (
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99,
                        background: 'rgba(132,211,169,.08)', border: '1px solid rgba(132,211,169,.25)',
                        color: 'var(--good)', fontFamily: 'var(--mono)' }}>
                        {m.newsDate}
                      </span>
                    )}
                  </div>
                  {m.note && <div className="body tight" style={{ fontSize: 12.5, marginBottom: m.newsUrl ? 10 : 0 }}>{m.note}</div>}
                  {m.newsUrl && (
                    <a href={m.newsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11.5, color: 'var(--gold)', fontFamily: 'var(--mono)',
                        textDecoration: 'none', letterSpacing: '.04em' }}>
                      Lire l'article →
                    </a>
                  )}
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
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="dot pulse" style={{ background: 'var(--good)', width: 7, height: 7 }} />
              <span className="meta" style={{ color: 'var(--good)', fontSize: 11 }}>distances en temps réel</span>
            </div>
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {probes.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px',
                  borderBottom: i < probes.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="h-card" style={{ fontSize: 13.5, display: 'block' }}>{p.name}</span>
                    <span className="meta" style={{ marginTop: 2 }}>{p.detail}</span>
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="data" style={{ fontSize: 13, color: 'var(--gold)', display: 'block',
                      fontVariantNumeric: 'tabular-nums' }}>{p.dist}</span>
                    {p.speed && <span className="meta" style={{ marginTop: 2, fontSize: 10.5 }}>{p.speed}</span>}
                  </span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}
    </ToolPage>
  )
}
