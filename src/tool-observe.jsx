import { useState, useEffect, useMemo } from 'react'
import { IcStar, IcTele, IcSky, IcMoon, IcTrash, IcCheck } from './icons'
import { Sheet } from './ui'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { SKY_OBJECTS } from './data'
import { getMoonData, getSunData, getPlanetPositions, getObsWindows } from './astro'
import { fetchWeather, useLiveData } from './api'
import { onbLoad } from './onboarding'

function IcCal({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.2"/><path d="M4 9.5h16M8 3.5v3M16 3.5v3"/></svg>
}
function IcPin({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
}

function QualityBar({ val, max = 4, color = 'var(--gold)' }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ flex: 1, height: 4, borderRadius: 9, background: i < val ? color : 'var(--surface-3)' }} />
      ))}
    </div>
  )
}

const CATALOGS = {
  messier: { label: 'Messier', items: [
    { id: 'M31', name: 'Galaxie d\'Andromède', type: 'Galaxie', mag: 3.4, cons: 'Andromède', vis: true },
    { id: 'M42', name: 'Nébuleuse d\'Orion', type: 'Nébuleuse', mag: 4.0, cons: 'Orion', vis: false },
    { id: 'M13', name: 'Amas d\'Hercule', type: 'Amas globulaire', mag: 5.8, cons: 'Hercule', vis: true },
    { id: 'M57', name: 'Nébuleuse de l\'Anneau', type: 'Nébuleuse planétaire', mag: 8.8, cons: 'Lyre', vis: true },
    { id: 'M45', name: 'Les Pléiades', type: 'Amas ouvert', mag: 1.6, cons: 'Taureau', vis: false },
    { id: 'M27', name: 'Nébuleuse Dumbbell', type: 'Nébuleuse planétaire', mag: 7.4, cons: 'Petit Renard', vis: true },
  ] },
  ngc: { label: 'NGC', items: [
    { id: 'NGC 7000', name: 'Nébuleuse Amérique du Nord', type: 'Nébuleuse', mag: 4.0, cons: 'Cygne', vis: true },
    { id: 'NGC 869', name: 'Double amas de Persée', type: 'Amas ouvert', mag: 3.7, cons: 'Persée', vis: true },
    { id: 'NGC 6960', name: 'Dentelles du Cygne', type: 'Rémanent', mag: 7.0, cons: 'Cygne', vis: true },
    { id: 'NGC 253', name: 'Galaxie du Sculpteur', type: 'Galaxie', mag: 7.1, cons: 'Sculpteur', vis: false },
  ] },
  ic: { label: 'IC', items: [
    { id: 'IC 5146', name: 'Nébuleuse du Cocon', type: 'Nébuleuse', mag: 7.2, cons: 'Cygne', vis: true },
    { id: 'IC 1396', name: 'Nébuleuse de la Trompe', type: 'Nébuleuse', mag: 3.5, cons: 'Céphée', vis: true },
    { id: 'IC 434', name: 'Nébuleuse Tête de Cheval', type: 'Nébuleuse sombre', mag: 6.8, cons: 'Orion', vis: false },
  ] },
  caldwell: { label: 'Caldwell', items: [
    { id: 'C14', name: 'Double amas', type: 'Amas ouvert', mag: 4.3, cons: 'Persée', vis: true },
    { id: 'C20', name: 'Nébuleuse Amérique du Nord', type: 'Nébuleuse', mag: 4.0, cons: 'Cygne', vis: true },
    { id: 'C33', name: 'Dentelle Est du Cygne', type: 'Rémanent', mag: 7.0, cons: 'Cygne', vis: true },
  ] },
}

const OBS_JOURNAL_SEED = [
  { id: 's1', date: '2 juin 2026', loc: 'Paris, FR', obj: 'Jupiter & lunes galiléennes', note: 'Quatre lunes alignées, bandes nuageuses visibles au 150×. Turbulence modérée.', gear: 'Télescope 200 mm' },
  { id: 's2', date: '28 mai 2026', loc: 'Forêt de Rambouillet', obj: 'M13 — Amas d\'Hercule', note: 'Ciel Bortle 4, amas résolu jusqu\'au cœur. Magnifique aux 25 mm.', gear: 'Dobson 250 mm' },
]

const PLANET_IDS = ['venus', 'jupiter', 'saturn', 'mars']

function ObjectList({ cat, gear }) {
  let items, hint
  if (cat === 'visible') {
    items = SKY_OBJECTS.filter(o => o.alt > 8).map(o => ({ id: o.name, name: o.kind, type: o.kind, mag: o.mag, cons: o.cons, vis: true, _alt: o.alt, _name: o.name }))
    hint = 'Au-dessus de l\'horizon en ce moment, calculé pour votre position.'
  } else if (cat === 'reco') {
    const big = (gear || []).some(g => /Télescope|Dobson|Lunette/i.test(g))
    items = CATALOGS.messier.items.concat(CATALOGS.ngc.items).filter(o => big ? o.mag < 8 : o.mag < 5).slice(0, 6)
    hint = (gear && gear.length) ? `Adaptés à votre matériel (${gear.join(', ')}).` : 'Adaptés à un matériel d\'amateur.'
  } else {
    items = CATALOGS[cat]?.items || []
    hint = `Catalogue ${CATALOGS[cat]?.label || cat} — objets remarquables.`
  }
  return (
    <div>
      <p className="meta" style={{ marginBottom: 12, color: 'var(--faint)' }}>{hint}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 13,
            background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
              <IcStar size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span className="h-card" style={{ fontSize: 13.5 }}>{o._name || o.id}</span>
                {o.id && o._name && <span className="meta" style={{ color: 'var(--faint)' }}>{o.id}</span>}
              </div>
              <div className="meta" style={{ marginTop: 2 }}>{o.type} · {o.cons}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>mag {o.mag}</div>
              {o.vis && <div className="meta" style={{ color: 'var(--good)', marginTop: 2 }}>visible</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ObsAddSheet({ open, onClose, onAdd, loc, gear }) {
  const [obj, setObj] = useState('')
  const [note, setNote] = useState('')
  useEffect(() => { if (open) { setObj(''); setNote('') } }, [open])
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const submit = () => {
    if (!obj.trim()) return
    onAdd({ date: today, loc: loc || 'Ma position', obj: obj.trim(), note: note.trim(), gear: gear || '' })
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Journal</div>
      <div className="h-sec" style={{ fontSize: 24, marginBottom: 4 }}>Nouvelle session</div>
      <div className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <IcCal size={12} /> {today} <span style={{ color: 'var(--faint)' }}>·</span> <IcPin size={12} /> {loc || 'Ma position'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Objet observé <span style={{ color: 'var(--gold)' }}>*</span></label>
          <input className="input" placeholder="Jupiter, M31, comète…" value={obj} onChange={e => setObj(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Notes personnelles</label>
          <textarea className="textarea" placeholder="Conditions, instrument, grossissement, ressenti…" value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 24 }} disabled={!obj.trim()} onClick={submit}>
        <IcCheck size={18} /> Enregistrer la session
      </button>
    </Sheet>
  )
}

export default function ObservePage({ onBack }) {
  const [seg, setSeg] = useState('prep')
  const [cat, setCat] = useState('messier')
  const [journal, setJournal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('astror_journal_v1')) || OBS_JOURNAL_SEED } catch (e) { return OBS_JOURNAL_SEED }
  })
  const [adding, setAdding] = useState(false)

  const profile = useMemo(() => onbLoad(), [])
  const lat = profile.location?.lat ?? 48.8566
  const lng = profile.location?.lng ?? 2.3522
  const city = profile.location?.city ?? 'Paris'
  const now = useMemo(() => new Date(), [])

  const { data: weather } = useLiveData(() => fetchWeather(lat, lng), 3600000)

  const sun     = useMemo(() => getSunData(now, lat, lng),         [now, lat, lng])
  const moon    = useMemo(() => getMoonData(now, lat, lng),        [now, lat, lng])
  const planets = useMemo(() => getPlanetPositions(now, lat, lng), [now, lat, lng])
  const windows = useMemo(() => getObsWindows(now, lat, lng),      [now, lat, lng])

  const riseSet = useMemo(() => [
    { name: 'Soleil', Ic: IcSky,  rise: sun.sunrise,   set: sun.sunset,   accent: false },
    { name: 'Lune',   Ic: IcMoon, rise: moon.moonrise, set: moon.moonset, accent: false },
    ...PLANET_IDS
      .map(id => planets.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({ name: p.name, Ic: IcStar, rise: p.rise, set: p.set, accent: true })),
  ], [sun, moon, planets])

  // Dériver les métriques de conditions depuis la météo
  const clouds = weather?.clouds ?? null
  const cloudLabel = clouds === null ? '—'
    : clouds < 10 ? 'Ciel dégagé'
    : clouds < 25 ? 'Quelques cirrus'
    : clouds < 50 ? 'Part. nuageux'
    : clouds < 75 ? 'Très nuageux'
    : 'Couvert'
  const cloudQBar  = clouds === null ? 0 : clouds < 10 ? 4 : clouds < 25 ? 3 : clouds < 50 ? 2 : clouds < 75 ? 1 : 0
  const cloudColor = cloudQBar >= 3 ? 'var(--good)' : cloudQBar >= 2 ? 'var(--gold)' : 'var(--warn)'

  const sv = weather?.seeingVal ?? null
  const seeingBar   = sv === null ? 0 : Math.max(1, sv - 1)
  const seeingColor = sv !== null ? (sv >= 4 ? 'var(--good)' : sv < 3 ? 'var(--warn)' : 'var(--gold)') : 'var(--gold)'
  const fwhm        = sv ? ['≈ 5+″', '≈ 4,5″', '≈ 3,5″', '≈ 2,5″', '≈ 1,5″'][sv - 1] + ' FWHM' : '—'

  const tv = weather?.transVal ?? null
  const transBar   = tv === null ? 0 : Math.max(1, tv - 1)
  const transColor = tv !== null ? (tv >= 4 ? 'var(--good)' : tv < 3 ? 'var(--warn)' : 'var(--gold)') : 'var(--gold)'
  const humidity   = weather?.humidity ?? null
  const humidLabel = humidity === null ? '—' : humidity < 40 ? 'Faible humidité' : humidity < 70 ? 'Humidité mod.' : 'Humidité élevée'

  const saveJournal = (list) => { setJournal(list); try { localStorage.setItem('astror_journal_v1', JSON.stringify(list)) } catch (e) {} }
  const addSession  = (s) => saveJournal([{ id: 'j' + Date.now(), ...s }, ...journal])
  const delSession  = (id) => saveJournal(journal.filter(x => x.id !== id))

  return (
    <ToolPage title="Observer" onBack={onBack}>
      <ToolSeg items={[{ key: 'prep', label: 'Préparer' }, { key: 'journal', label: 'Journal' }, { key: 'objets', label: 'Objets' }]}
        value={seg} onChange={setSeg} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 0', gap: 8 }}>
        <span className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <IcPin size={13} /> {city}
        </span>
        <span className="meta">
          {now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {seg === 'prep' && (
        <div className="enter">
          <ToolSection title="Conditions ce soir" action={weather ? now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null}>
            <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="metric">
                <div className="m-k">Couverture nuageuse</div>
                <div className="m-v">{clouds !== null ? <>{clouds}<span className="u">%</span></> : '—'}</div>
                <div className="m-sub">{cloudLabel}</div>
                <QualityBar val={cloudQBar} color={cloudColor} />
              </div>
              <div className="metric">
                <div className="m-k">Turbulence (seeing)</div>
                <div className="m-v">{weather?.seeing ?? '—'}</div>
                <div className="m-sub">{fwhm}</div>
                <QualityBar val={seeingBar} color={seeingColor} />
              </div>
              <div className="metric">
                <div className="m-k">Transparence</div>
                <div className="m-v">{weather?.transparency ?? '—'}</div>
                <div className="m-sub">{humidLabel}</div>
                <QualityBar val={transBar} color={transColor} />
              </div>
              <div className="metric">
                <div className="m-k">Pollution lumineuse</div>
                <div className="m-v">Bortle 4</div>
                <div className="m-sub">Ciel péri-urbain</div>
                <QualityBar val={2} color="var(--warn)" />
              </div>
            </div>
          </ToolSection>

          <ToolSection title="Meilleurs créneaux">
            {windows.length === 0 ? (
              <div style={{ padding: '12px 14px', color: 'var(--faint)', fontSize: 13 }}>
                Nuit blanche — pas de nuit astronomique ce soir à cette latitude.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {windows.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 13, padding: 14, borderRadius: 14,
                    background: w.val === 4 ? 'linear-gradient(180deg, rgba(132,211,169,.08), var(--surface-1))' : 'var(--surface-1)',
                    border: '1px solid ' + (w.val === 4 ? 'rgba(132,211,169,.3)' : 'var(--line)') }}>
                    <span style={{ width: 4, borderRadius: 9, flexShrink: 0, background: w.val === 4 ? 'var(--good)' : w.val === 3 ? 'var(--gold)' : 'var(--faint)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span className="data" style={{ fontSize: 14, color: 'var(--text)' }}>{w.t}</span>
                        <span className={'tag' + (w.val === 4 ? ' live' : w.val === 2 ? ' neutral' : '')}>{w.q}</span>
                      </div>
                      <div className="h-card" style={{ fontSize: 13.5, margin: '5px 0 3px' }}>{w.label}</div>
                      <div className="body tight" style={{ fontSize: 12 }}>{w.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ToolSection>

          <ToolSection title="Lever & coucher">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', padding: '9px 15px', borderBottom: '1px solid var(--line)' }}>
                <span className="meta" style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '.1em' }}>Astre</span>
                <span className="meta" style={{ width: 64, textAlign: 'right', textTransform: 'uppercase' }}>Lever</span>
                <span className="meta" style={{ width: 64, textAlign: 'right', textTransform: 'uppercase' }}>Coucher</span>
              </div>
              {riseSet.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', padding: '11px 15px',
                  borderBottom: i < riseSet.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ color: r.accent ? 'var(--gold)' : 'var(--dim)', display: 'flex' }}><r.Ic size={15} /></span>
                    <span className="h-card" style={{ fontSize: 13.5 }}>{r.name}</span>
                  </span>
                  <span className="data" style={{ width: 64, textAlign: 'right', fontSize: 13, color: 'var(--dim)' }}>{r.rise}</span>
                  <span className="data" style={{ width: 64, textAlign: 'right', fontSize: 13, color: 'var(--dim)' }}>{r.set}</span>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'journal' && (
        <div className="enter">
          <ToolSection title="Journal d'observation" action="+ Note" onAction={() => setAdding(true)} style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {journal.length === 0 && <div className="body" style={{ fontSize: 13 }}>Aucune session enregistrée pour l'instant.</div>}
              {journal.map(s => (
                <div key={s.id} style={{ position: 'relative', padding: 15, borderRadius: 16,
                  background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
                  <button className="del-btn press" onClick={() => delSession(s.id)}><IcTrash size={14} /></button>
                  <div className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    <IcCal size={12} /> {s.date}<span style={{ color: 'var(--faint)' }}>·</span><IcPin size={12} /> {s.loc}
                  </div>
                  <div className="h-card" style={{ fontSize: 15, marginBottom: 5, paddingRight: 24 }}>{s.obj}</div>
                  <div className="body tight serif-body" style={{ fontSize: 13, marginBottom: 8 }}>{s.note}</div>
                  {s.gear && <span className="tag neutral"><IcTele size={11} /> {s.gear}</span>}
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}

      {seg === 'objets' && (
        <div className="enter">
          <div style={{ paddingTop: 10 }}>
            <ToolSeg items={[
              { key: 'visible', label: 'Visibles ce soir' }, { key: 'reco', label: 'Recommandés' },
              { key: 'messier', label: 'Messier' }, { key: 'ngc', label: 'NGC' }, { key: 'ic', label: 'IC' }, { key: 'caldwell', label: 'Caldwell' },
            ]} value={cat} onChange={setCat} />
          </div>
          <div className="pad" style={{ marginTop: 14 }}>
            <ObjectList cat={cat} gear={profile.gear} />
          </div>
        </div>
      )}

      <ObsAddSheet open={adding} onClose={() => setAdding(false)} onAdd={addSession} loc={city} gear={(profile.gear || [])[0]} />
    </ToolPage>
  )
}
