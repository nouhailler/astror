import { useState } from 'react'
import { ToolPage, ToolSection, ToolSeg, Metric, MetricGrid } from './tool-ui'
import { AiInfoPanel } from './ui'

function MoonDisc({ size = 124, illum = 73 }) {
  const off = Math.round(size * (1 - illum / 100) * 0.9)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div className="glow-orb" style={{ width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 34%, #eef1f6 0%, #c4c9d4 55%, #9aa0ad 100%)',
        boxShadow: `inset ${off}px 0 ${Math.round(size * 0.12)}px 0 rgba(8,11,22,.92), 0 0 40px rgba(180,200,240,.18)` }} />
      <span style={{ position: 'absolute', top: '30%', left: '58%', width: 12, height: 12, borderRadius: '50%', background: 'rgba(120,126,140,.5)' }} />
      <span style={{ position: 'absolute', top: '52%', left: '66%', width: 8, height: 8, borderRadius: '50%', background: 'rgba(120,126,140,.45)' }} />
      <span style={{ position: 'absolute', top: '62%', left: '50%', width: 16, height: 16, borderRadius: '50%', background: 'rgba(120,126,140,.4)' }} />
    </div>
  )
}

function PhaseGlyph({ illum, size = 30 }) {
  const off = Math.round(size * (1 - illum / 100) * 0.9)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: illum < 4 ? '#222838' : 'radial-gradient(circle at 40% 36%, #eef1f6, #aeb4c0)',
      boxShadow: illum < 4 ? 'inset 0 0 0 1px var(--line-2)' : `inset ${off}px 0 ${Math.round(size * 0.1)}px 0 rgba(8,11,22,.95)` }} />
  )
}

const MOON_PHASES = [
  { name: 'Nouvelle Lune', date: '16 juin', illum: 0 },
  { name: 'Premier quartier', date: '23 juin', illum: 50 },
  { name: 'Pleine Lune', date: '30 juin', illum: 100 },
  { name: 'Dernier quartier', date: '8 juil.', illum: 50 },
]

const MOON_SEAS = [
  { name: 'Mer de la Tranquillité', lat: 'Mare Tranquillitatis', note: 'Site d\'Apollo 11. Visible dès le premier quartier.' },
  { name: 'Mer des Crises', lat: 'Mare Crisium', note: 'Bassin isolé près du limbe est, frappant à la Lune croissante.' },
  { name: 'Mer de la Sérénité', lat: 'Mare Serenitatis', note: 'Vaste plaine de lave, bords nets au terminateur.' },
  { name: 'Océan des Tempêtes', lat: 'Oceanus Procellarum', note: 'La plus grande étendue, mieux vue à la Lune gibbeuse.' },
]

const MOON_CRATERS = [
  { name: 'Copernic', diam: '93 km', note: 'Remparts en terrasses et pic central, spectaculaire au 150×.' },
  { name: 'Tycho', diam: '85 km', note: 'Système de rayons éclatant à la Pleine Lune.' },
  { name: 'Clavius', diam: '231 km', note: 'Immense cratère du sud, chaîne de cratères en arc.' },
  { name: 'Platon', diam: '101 km', note: 'Fond sombre et lisse, bord net au terminateur.' },
]

export default function MoonPage({ onBack }) {
  const [seg, setSeg] = useState('suivi')
  const illum = 73, age = 9.4

  return (
    <ToolPage title="Lune" onBack={onBack} demoKey="tool_moon">
      <ToolSeg items={[{ key: 'suivi', label: 'Suivi lunaire' }, { key: 'carte', label: 'Cartographie' }]} value={seg} onChange={setSeg} />

      {seg === 'suivi' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 12 }}>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', padding: 18, borderRadius: 20,
              background: 'radial-gradient(120% 100% at 80% 0%, #141d3a, #0a1020)', border: '1px solid var(--line)' }}>
              <MoonDisc size={118} illum={illum} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Phase actuelle</div>
                <div className="h-sec" style={{ fontSize: 21, lineHeight: 1.1 }}>Gibbeuse croissante</div>
                <div className="data" style={{ fontSize: 13, color: 'var(--gold)', marginTop: 8 }}>{illum}% illuminée</div>
                <div className="meta" style={{ marginTop: 3 }}>Âge : {age} jours</div>
              </div>
            </div>
          </div>

          <MetricGrid cols={2} style={{ marginTop: 16 }}>
            <Metric k="Illumination" v={illum} u="%" accent />
            <Metric k="Âge lunaire" v={age} u="j" />
            <Metric k="Distance Terre-Lune" v="389 400" u="km" />
            <Metric k="Diamètre apparent" v="30,7" u="′" />
          </MetricGrid>
          <div className="pad" style={{ marginTop: 4 }}>
            <AiInfoPanel cacheKey="moon_suivi" buildPrompt={`Phase lunaire ce soir : Gibbeuse croissante, ${illum}% illuminée, âge ${age} jours, distance 389 400 km.
En 4 phrases, que recommandes-tu d'observer sur la Lune ce soir ? Quelles zones sont bien éclairées par le terminateur et méritent d'être observées avec un télescope amateur de 100 à 200 mm ?`} />
          </div>

          <ToolSection title="Calendrier des phases">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {MOON_PHASES.map((ph, i) => (
                <div key={ph.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 15px',
                  borderBottom: i < MOON_PHASES.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <PhaseGlyph illum={ph.illum} size={32} />
                  <span className="h-card" style={{ flex: 1, fontSize: 14 }}>{ph.name}</span>
                  <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>{ph.date}</span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'carte' && (
        <div className="enter">
          <div className="pad" style={{ paddingTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 18px',
              background: 'radial-gradient(100% 80% at 50% 30%, #101733, #0a1020)', borderRadius: 20, border: '1px solid var(--line)' }}>
              <MoonDisc size={210} illum={73} />
            </div>
            <p className="meta" style={{ textAlign: 'center', marginTop: 12, color: 'var(--faint)' }}>
              Le terminateur révèle le relief en ce moment — le meilleur endroit où observer le contraste.
            </p>
          </div>

          <div className="pad" style={{ marginTop: 8 }}>
            <div style={{ padding: 15, borderRadius: 16, background: 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))', border: '1px solid var(--gold-line)' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Zones recommandées · gibbeuse croissante</div>
              <div className="body tight serif-body" style={{ fontSize: 13.5 }}>
                Pointez le terminateur entre la <strong style={{ color: 'var(--text)' }}>Mer de la Sérénité</strong> et le cratère
                <strong style={{ color: 'var(--text)' }}> Copernic</strong> : l'éclairage rasant fait ressortir remparts et pics centraux.
              </div>
            </div>
          </div>

          <ToolSection title="Mers lunaires">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {MOON_SEAS.map((m, i) => (
                <div key={m.name} style={{ padding: 14, borderRadius: 13, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="h-card" style={{ fontSize: 14 }}>{m.name}</span>
                    <span className="meta" style={{ color: 'var(--faint)', fontStyle: 'italic' }}>{m.lat}</span>
                  </div>
                  <div className="body tight" style={{ fontSize: 12, marginTop: 4, marginBottom: 10 }}>{m.note}</div>
                  <AiInfoPanel cacheKey={`moon_sea_${i}`} buildPrompt={`Mer lunaire : ${m.name} (${m.lat}). ${m.note}
En 3 phrases, décris ce qu'un astronome amateur peut observer dans cette région avec un télescope de 100-200 mm, à quelle phase lunaire c'est le plus spectaculaire, et un détail géologique notable.`} />
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="Cratères remarquables">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {MOON_CRATERS.map((c, i) => (
                <div key={c.name} style={{ padding: '13px 15px', borderBottom: i < MOON_CRATERS.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="h-card" style={{ fontSize: 14 }}>{c.name}</span>
                    <span className="data" style={{ fontSize: 12, color: 'var(--gold)' }}>⌀ {c.diam}</span>
                  </div>
                  <div className="body tight" style={{ fontSize: 12, marginTop: 4, marginBottom: 10 }}>{c.note}</div>
                  <AiInfoPanel cacheKey={`moon_crater_${i}`} buildPrompt={`Cratère lunaire ${c.name} (diamètre ${c.diam}) : ${c.note}
En 3 phrases, explique comment observer ce cratère avec un télescope amateur, à quelle phase la lumière est la plus favorable, et ce qu'on peut y voir de remarquable.`} />
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}
    </ToolPage>
  )
}
