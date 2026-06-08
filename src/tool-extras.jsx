import { useState } from 'react'
import { IcSpark, IcGlobe, IcTimer, IcOrbit } from './icons'
import { ToolPage, ToolHero, ToolSection, ToolSeg } from './tool-ui'
import { Sheet } from './ui'

const SCALE = [
  { name: 'Montagne Everest', size: '8 849 m', px: 3 },
  { name: 'Lune', size: '3 474 km', px: 9 },
  { name: 'Terre', size: '12 742 km', px: 14 },
  { name: 'Jupiter', size: '139 820 km', px: 28 },
  { name: 'Soleil', size: '1,39 millions km', px: 52 },
  { name: 'Étoile R Doradus', size: '1,2 UA', px: 80 },
  { name: 'Système Solaire', size: '287,5 UA', px: 110 },
  { name: 'Voie Lactée', size: '100 000 al', px: 160 },
  { name: 'Univers observable', size: '93 milliards al', px: 210 },
]

const TOP_POOL = [
  { name: 'M42 — Nébuleuse d\'Orion', cat: 'Nébuleuse', mag: 4.0, gear: 'Œil nu' },
  { name: 'M45 — Pléiades', cat: 'Amas ouvert', mag: 1.6, gear: 'Jumelles' },
  { name: 'M13 — Amas d\'Hercule', cat: 'Amas globulaire', mag: 5.8, gear: 'Lunette 80' },
  { name: 'M31 — Andromède', cat: 'Galaxie', mag: 3.4, gear: 'Jumelles' },
  { name: 'M57 — Nébuleuse de l\'Anneau', cat: 'Nébuleuse planétaire', mag: 8.8, gear: 'Télescope' },
  { name: 'M51 — Galaxie du Tourbillon', cat: 'Galaxie', mag: 8.4, gear: 'Télescope' },
  { name: 'M1 — Nébuleuse du Crabe', cat: 'Reste de supernova', mag: 8.4, gear: 'Télescope' },
  { name: 'M44 — Ruche', cat: 'Amas ouvert', mag: 3.7, gear: 'Jumelles' },
  { name: 'NGC 869/884 — Double amas', cat: 'Amas ouvert', mag: 4.3, gear: 'Jumelles' },
  { name: 'Albireo', cat: 'Étoile double', mag: 3.1, gear: 'Lunette 60' },
  { name: 'M81/M82 — Bode & Cigare', cat: 'Galaxies', mag: 6.9, gear: 'Télescope' },
  { name: 'M104 — Sombrero', cat: 'Galaxie', mag: 8.0, gear: 'Télescope' },
]

const EXPLORATIONS = [
  { title: 'Voyage vers le Soleil', desc: 'Volez de la Terre vers le Soleil à la vitesse de la lumière. 8 minutes pour 150 millions de km.', icon: <IcOrbit size={26} /> },
  { title: 'Les lunes de Jupiter', desc: '95 lunes gravitent autour de Jupiter. Europa possède un océan sous sa croûte de glace.', icon: <IcGlobe size={26} /> },
  { title: 'L\'échelle du Système Solaire', desc: 'Si le Soleil était une balle de basketball, Neptune serait à 800 mètres.', icon: <IcTimer size={26} /> },
  { title: 'La Toile cosmique', desc: 'Les galaxies ne sont pas seules : elles s\'assemblent en filaments séparés par des vides de 300 millions d\'al.', icon: <IcSpark size={26} /> },
]

function ScaleExplorer() {
  const [idx, setIdx] = useState(4)
  const cur = SCALE[idx]
  const orbSize = cur.px

  return (
    <div style={{ padding: 18, borderRadius: 18, background: 'radial-gradient(circle at 50% 0%, #0c1128, #040609)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, position: 'relative' }}>
        <div style={{ width: orbSize, height: orbSize, borderRadius: '50%', flexShrink: 0, transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
          background: 'radial-gradient(circle at 36% 32%, var(--gold-2), var(--gold) 40%, #8c5c18)',
          boxShadow: `0 0 ${orbSize * 0.4}px rgba(217,179,108,0.4)` }} />
        <div className="eyebrow" style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center' }}>
          {cur.name} · {cur.size}
        </div>
      </div>
      <input type="range" min={0} max={SCALE.length - 1} step={1} value={idx} onChange={e => setIdx(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--gold)', marginTop: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span className="meta">Everest</span>
        <span className="meta">Univers observable</span>
      </div>
    </div>
  )
}

function ImpactSim() {
  const [mass, setMass] = useState(5)
  const joules = (10 ** mass).toExponential(1)
  const mt = (10 ** (mass - 15.6)).toFixed(mass < 18 ? 2 : 0)
  const crater = (10 ** ((mass - 15) / 3)).toFixed(1)

  return (
    <div style={{ padding: 16, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span className="field-label" style={{ margin: 0 }}>Masse (log kg)</span>
        <span className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>10^{mass} kg</span>
      </div>
      <input type="range" min={3} max={30} step={1} value={mass} onChange={e => setMass(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: 14 }} />
      <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="metric"><div className="m-k">Énergie</div><div className="m-v" style={{ fontSize: 13 }}>{joules} J</div></div>
        <div className="metric"><div className="m-k">Équiv. TNT</div><div className="m-v" style={{ fontSize: 13 }}>{parseFloat(mt) < 0.01 ? '<0.01' : mt} Mt</div></div>
        <div className="metric"><div className="m-k">Cratère</div><div className="m-v" style={{ fontSize: 13 }}>{crater} km</div></div>
      </div>
    </div>
  )
}

function Top10() {
  const [list, setList] = useState(null)
  const gen = () => {
    const shuffled = [...TOP_POOL].sort(() => Math.random() - 0.5)
    setList(shuffled.slice(0, 10))
  }

  if (!list) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="body tight" style={{ marginBottom: 14, fontSize: 13.5 }}>Génère un Top 10 d'objets du ciel profond adapté à ce soir.</div>
        <button className="btn-primary" onClick={gen}><IcSpark size={17} /> Générer</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 14px', borderRadius: 12,
            background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, width: 24, textAlign: 'center',
              color: i < 3 ? 'var(--gold)' : 'var(--faint)', flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div className="h-card" style={{ fontSize: 13.5 }}>{o.name}</div>
              <div className="meta" style={{ marginTop: 2 }}>{o.cat} · mag {o.mag}</div>
            </div>
            <span className="tag neutral" style={{ fontSize: 10 }}>{o.gear}</span>
          </div>
        ))}
      </div>
      <button onClick={gen} style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '14px auto 0', background: 'none', border: 0,
        cursor: 'pointer', color: 'var(--gold)', fontFamily: 'var(--serif)', fontSize: 13.5, fontWeight: 500 }}>
        <IcSpark size={15} /> Nouvelle sélection
      </button>
    </div>
  )
}

export default function ExtrasPage({ onBack }) {
  const [seg, setSeg] = useState('scale')
  const [expl, setExpl] = useState(null)

  return (
    <ToolPage title="Explorations" onBack={onBack}>
      <ToolHero
        title="Explorations cosmiques"
        sub="Simulateurs, top 10 et voyages interactifs"
        icon={<IcOrbit size={28} />}
      />
      <ToolSeg
        items={[{ key: 'scale', label: 'Échelle' }, { key: 'impact', label: 'Impact' }, { key: 'top10', label: 'Top 10' }, { key: 'maps', label: 'Voyages' }]}
        value={seg} onChange={setSeg}
      />

      {seg === 'scale' && (
        <div className="enter">
          <ToolSection title="Explorateur d'échelles">
            <ScaleExplorer />
          </ToolSection>
        </div>
      )}

      {seg === 'impact' && (
        <div className="enter">
          <ToolSection title="Simulateur d'impact">
            <ImpactSim />
          </ToolSection>
        </div>
      )}

      {seg === 'top10' && (
        <div className="enter">
          <ToolSection title="Top 10 de ce soir">
            <Top10 />
          </ToolSection>
        </div>
      )}

      {seg === 'maps' && (
        <div className="enter pad" style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EXPLORATIONS.map((e, i) => (
            <button key={i} onClick={() => setExpl(e)} className="press" style={{ textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 15, padding: 16, borderRadius: 18, cursor: 'pointer',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>{e.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="h-card" style={{ fontSize: 15, marginBottom: 5 }}>{e.title}</div>
                <div className="body tight" style={{ fontSize: 12.5 }}>{e.desc.slice(0, 72)}…</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!expl} onClose={() => setExpl(null)}>
        {expl && (
          <div>
            <span style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', marginBottom: 16 }}>{expl.icon}</span>
            <div className="h-sec" style={{ fontSize: 22, marginBottom: 12 }}>{expl.title}</div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.62 }}>{expl.desc}</p>
          </div>
        )}
      </Sheet>
    </ToolPage>
  )
}
