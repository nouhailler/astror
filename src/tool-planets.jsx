import { useState } from 'react'
import { ToolPage, ToolSection, ToolSeg, Metric, MetricGrid } from './tool-ui'
import { PLANETS } from './data'

const PLANET_OBS = {
  mercure: { ang: 7.2, mag: '−0,3', vis: 'Difficile', when: 'Aube, bas sur l\'horizon', phase: '62%', visVal: 1 },
  venus:   { ang: 24.1, mag: '−4,1', vis: 'Éclatante', when: 'Ouest, après le coucher', phase: '68%', visVal: 4 },
  mars:    { ang: 6.1, mag: '+0,9', vis: 'Visible', when: 'Haut vers minuit', phase: '93%', visVal: 3 },
  jupiter: { ang: 44.8, mag: '−2,4', vis: 'Excellente', when: 'Au méridien à 23 h', phase: '100%', visVal: 4 },
  saturne: { ang: 17.9, mag: '+0,7', vis: 'Bonne', when: 'Anneaux inclinés à 9°', phase: '100%', visVal: 3 },
  uranus:  { ang: 3.6, mag: '+5,7', vis: 'Aux jumelles', when: 'Limite de l\'œil nu', phase: '100%', visVal: 2 },
  neptune: { ang: 2.3, mag: '+7,8', vis: 'Au télescope', when: 'Petit disque bleuté', phase: '100%', visVal: 1 },
}
const OBS_ORDER = ['venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'mercure']

const ORBITAL = [
  { type: 'Conjonction', title: 'Lune – Saturne', date: '9 juin 2026', detail: 'Séparation de 1,4° au sud-est' },
  { type: 'Élongation', title: 'Vénus — Est', date: '4 juil. 2026', detail: '46° du Soleil · étoile du soir' },
  { type: 'Conjonction', title: 'Vénus – Jupiter', date: '12 août 2026', detail: 'Rapprochement serré de 0,9°' },
  { type: 'Opposition', title: 'Mars', date: '19 janv. 2027', detail: 'Diamètre apparent maximal 14,0″' },
]
const TYPE_COLOR = { Conjonction: 'var(--gold)', Opposition: 'var(--blue)', Élongation: 'var(--violet)' }

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
  const obs = PLANET_OBS[sel] || PLANET_OBS.jupiter

  return (
    <ToolPage title="Planètes" onBack={onBack}>
      <ToolSeg items={[{ key: 'eph', label: 'Éphémérides' }, { key: 'obs', label: 'Observation' }]} value={seg} onChange={setSeg} />

      {seg === 'eph' && (
        <div className="enter">
          <ToolSection title="Position ce soir" style={{ paddingTop: 2 }}>
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {OBS_ORDER.map((id, i) => {
                const p = PLANETS.find(x => x.id === id); if (!p) return null
                const o = PLANET_OBS[id]
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
                      <span className="meta" style={{ display: 'block', marginTop: 2 }}>{o.ang}″</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </ToolSection>

          <ToolSection title="Conjonctions & oppositions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ORBITAL.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <span style={{ width: 4, borderRadius: 9, flexShrink: 0, background: TYPE_COLOR[e.type] || 'var(--gold)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="meta" style={{ color: TYPE_COLOR[e.type], textTransform: 'uppercase', letterSpacing: '.1em' }}>{e.type}</span>
                      <span className="data" style={{ fontSize: 12, color: 'var(--dim)' }}>{e.date}</span>
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
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
