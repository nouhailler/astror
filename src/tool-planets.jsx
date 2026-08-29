import { useMemo, useState } from 'react'
import { ToolPage, ToolSection, ToolSeg, Metric, MetricGrid } from './tool-ui'
import { AiInfoPanel } from './ui'
import { PLANETS } from './data'
import { onbLoad } from './onboarding'
import { getPlanetObservationData, getPlanetEvents } from './astro'

const OBS_ORDER = ['venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'mercure']
const TYPE_COLOR = { Opposition: 'var(--blue)', Élongation: 'var(--violet)' }

function Eyepiece({ planet, obs }) {
  const field = 220
  const px = Math.max(10, Math.min(150, obs.ang * 3.2))
  const isSat = planet.id === 'saturne'
  const isJup = planet.id === 'jupiter'
  return (
    <div style={{ width: field, height: field, borderRadius: '50%', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 50%, #060912 60%, #02040a 100%)',
      border: '1px solid var(--line-2)', boxShadow: 'inset 0 0 40px rgba(0,0,0,.8)' }}>
      {[[20, 30], [78, 18], [85, 62], [30, 80], [62, 88], [12, 60]].map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: x + '%', top: y + '%', width: 2, height: 2, borderRadius: '50%', background: '#cfe0ff', opacity: .7 }} />
      ))}
      <span style={{ position: 'absolute', left: '50%', top: 8, bottom: 8, width: 1, background: 'rgba(150,180,235,.08)' }} />
      <span style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1, background: 'rgba(150,180,235,.08)' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        {isSat && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: px * 2.2, height: px * 0.8,
            transform: 'translate(-50%,-50%) rotate(-18deg)', borderRadius: '50%',
            border: '3px solid rgba(231,214,166,.85)', boxShadow: 'inset 0 0 0 2px rgba(231,214,166,.25)' }} />
        )}
        <div className="glow-orb" style={{ width: px, height: px, borderRadius: '50%',
          background: isJup
            ? 'repeating-linear-gradient(180deg, #e3c391 0 14%, #cda972 14% 22%, #d8b985 22% 38%, #c19a63 38% 46%, #e3c391 46% 60%)'
            : `radial-gradient(circle at 38% 34%, ${planet.glow}, ${planet.color} 70%)`,
          boxShadow: `inset -6px -6px 14px rgba(0,0,0,.45), 0 0 26px ${planet.color}88`, position: 'relative' }}>
          {isJup && <span style={{ position: 'absolute', left: '62%', top: '58%', width: px * 0.22, height: px * 0.13, borderRadius: '50%', background: '#b8654a', opacity: .85 }} />}
        </div>
      </div>
      <div className="meta" style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: 'var(--faint)' }}>
        Champ ≈ 0,5° · oculaire 10 mm
      </div>
    </div>
  )
}

export default function PlanetsPage({ onBack }) {
  const [seg, setSeg] = useState('eph')
  const [sel, setSel] = useState('jupiter')
  const planet = PLANETS.find(p => p.id === sel) || PLANETS[0]
  const profile = useMemo(() => onbLoad(), [])
  const { lat, lng } = profile.location
  const obsData = useMemo(() => getPlanetObservationData(new Date(), lat, lng), [lat, lng])
  const planetEvents = useMemo(() => getPlanetEvents(12), [])
  const obs = obsData[sel] || obsData.jupiter

  return (
    <ToolPage title="Planètes" onBack={onBack} demoKey="tool_planets">
      <ToolSeg items={[{ key: 'eph', label: 'Éphémérides' }, { key: 'obs', label: 'Observation' }]} value={seg} onChange={setSeg} />

      {seg === 'eph' && (
        <div className="enter">
          <ToolSection title="Position ce soir" style={{ paddingTop: 2 }}>
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {OBS_ORDER.map((id, i) => {
                const p = PLANETS.find(x => x.id === id); if (!p) return null
                const o = obsData[id]
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px',
                    borderBottom: i < OBS_ORDER.length - 1 ? '1px solid var(--line)' : 0 }}>
                    <span className="glow-orb" style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: `radial-gradient(circle at 38% 34%, ${p.glow}, ${p.color})` }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="h-card" style={{ fontSize: 14 }}>{p.name}</span>
                      <span className="meta" style={{ display: 'block', marginTop: 2 }}>{p.sub} · {p.dist}</span>
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>mag {o.mag}</span>
                      <span className="meta" style={{ display: 'block', marginTop: 2 }}>{String(o.ang).replace('.', ',')}″</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </ToolSection>

          <div className="pad" style={{ marginTop: -4 }}>
            <AiInfoPanel cacheKey="planets_eph" buildPrompt={`Planètes visibles ce soir :
${OBS_ORDER.map(id => { const p = PLANETS.find(x => x.id === id); const o = obsData[id]; return p ? `- ${p.name} : mag ${o.mag}, ${o.ang}″, ${o.vis.toLowerCase()}, ${o.when}` : '' }).filter(Boolean).join('\n')}
En 4 phrases, quelle est la priorité d'observation ce soir ? Quelle planète offre le plus beau spectacle, et quel matériel recommander pour chacune ?`} />
          </div>
          <ToolSection title="Oppositions & élongations">
            {planetEvents.length === 0 && (
              <div className="meta" style={{ padding: '10px 4px' }}>Aucun événement notable dans les 12 prochains mois.</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planetEvents.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <span style={{ width: 4, borderRadius: 9, flexShrink: 0, background: TYPE_COLOR[e.type] || 'var(--gold)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="meta" style={{ color: TYPE_COLOR[e.type], textTransform: 'uppercase', letterSpacing: '.1em' }}>{e.type}</span>
                      <span className="data" style={{ fontSize: 12, color: 'var(--dim)' }}>
                        {e.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="h-card" style={{ fontSize: 14, margin: '5px 0 3px' }}>{e.title}</div>
                    <div className="body tight" style={{ fontSize: 12 }}>{e.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'obs' && (
        <div className="enter">
          <div style={{ paddingTop: 10 }}>
            <ToolSeg items={OBS_ORDER.map(id => ({ key: id, label: (PLANETS.find(p => p.id === id) || {}).name }))} value={sel} onChange={setSel} />
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', borderRadius: 20,
              background: 'radial-gradient(90% 80% at 50% 30%, #0a0f1f, #05070f)', border: '1px solid var(--line)' }}>
              <Eyepiece planet={planet} obs={obs} />
            </div>
          </div>

          <MetricGrid cols={2} style={{ marginTop: 16 }}>
            <Metric k="Taille apparente" v={String(obs.ang).replace('.', ',')} u="″" accent />
            <Metric k="Magnitude" v={obs.mag} />
            <Metric k="Phase éclairée" v={obs.phase} />
            <Metric k="Distance" v={planet.dist} />
          </MetricGrid>

          <div className="pad" style={{ marginTop: 16 }}>
            <div style={{ padding: 15, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="eyebrow">Visibilité</span>
                <span style={{ flex: 1 }} />
                <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>{obs.vis}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i} style={{ flex: 1, height: 4, borderRadius: 9, background: i < obs.visVal ? 'var(--gold)' : 'var(--surface-3)' }} />
                ))}
              </div>
              <div className="body tight serif-body" style={{ fontSize: 13 }}>{obs.when}. {planet.note}</div>
              <div style={{ marginTop: 12 }}>
                <AiInfoPanel cacheKey={`planets_obs_${planet.id}`} buildPrompt={`Planète ${planet.name} ce soir : magnitude ${obs.mag}, diamètre apparent ${obs.ang}″, phase ${obs.phase}, visibilité "${obs.vis}", ${obs.when}.
${planet.note}
En 4 phrases, que peut-on concrètement voir de ${planet.name} avec un télescope amateur ? Quel grossissement recommander, et quels détails chercher à la surface ou dans l'atmosphère ?`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
