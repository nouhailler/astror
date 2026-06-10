import { useState, useMemo } from 'react'
import { IcSky, IcMoon, IcStar, IcPin } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { AiInfoPanel } from './ui'
import { getAstrophotoData } from './astro'
import { fetchWeather, useLiveData } from './api'
import { onbLoad } from './onboarding'

function ScoreDots({ val, max = 5 }) {
  const color = val >= 4 ? 'var(--good)' : val === 3 ? 'var(--gold)' : 'var(--bad)'
  return (
    <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
          background: i < val ? color : 'var(--surface-2)',
          border: `1px solid ${i < val ? color : 'var(--line)'}` }} />
      ))}
    </span>
  )
}

function IcCloud({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.3A3.6 3.6 0 0 1 17 18Z"/></svg>
}

const AP_SENSORS = [
  { key: 'ff',   label: 'Plein format', w: 36,   h: 24,   crop: 1.0  },
  { key: 'apsc', label: 'APS-C',        w: 23.5, h: 15.6, crop: 1.53 },
  { key: 'm43',  label: 'Micro 4/3',    w: 17.3, h: 13,   crop: 2.0  },
]

function ApFraming({ fovH, fovV }) {
  const boxW = 280
  const ppd = boxW / fovH
  const boxH = Math.min(220, fovV * ppd)
  const moon = 0.52 * ppd
  const m31w = 3.2 * ppd, m31h = 1.0 * ppd
  return (
    <div style={{ width: boxW, height: boxH, margin: '0 auto', position: 'relative', borderRadius: 6,
      background: 'radial-gradient(circle at 50% 50%, #070b16, #03050c)', border: '1px solid var(--gold-line)',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,.7)', overflow: 'hidden' }}>
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', [x ? 'right' : 'left']: 6, [y ? 'bottom' : 'top']: 6, width: 10, height: 10,
          borderTop: y ? 0 : '1.5px solid var(--gold)', borderBottom: y ? '1.5px solid var(--gold)' : 0,
          borderLeft: x ? 0 : '1.5px solid var(--gold)', borderRight: x ? '1.5px solid var(--gold)' : 0 }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-35deg)',
        width: Math.max(8, m31w), height: Math.max(4, m31h), borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(207,224,255,.5), rgba(150,180,235,.08) 70%, transparent)' }} />
      <div className="glow-orb" style={{ position: 'absolute', left: '22%', top: '70%', width: Math.max(4, moon), height: Math.max(4, moon),
        borderRadius: '50%', background: 'radial-gradient(circle at 40% 36%, #eef1f6, #aeb4c0)' }} />
      <span className="meta" style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', color: 'var(--faint)' }}>
        Cadre {fovH.toFixed(1)}° × {fovV.toFixed(1)}° · M31 & Lune à l'échelle
      </span>
    </div>
  )
}

export default function AstrophotoPage({ onBack }) {
  const [seg, setSeg] = useState('plan')
  const [focal, setFocal] = useState(50)
  const [sensor, setSensor] = useState('ff')

  const profile = useMemo(() => onbLoad(), [])
  const lat  = profile.location?.lat  ?? 48.8566
  const lng  = profile.location?.lng  ?? 2.3522
  const city = profile.location?.city ?? 'Paris'
  const now  = useMemo(() => new Date(), [])
  const ap   = useMemo(() => getAstrophotoData(now, lat, lng), [lat, lng, now])

  const { data: weather, loading: wxLoading } = useLiveData(() => fetchWeather(lat, lng))

  const s = AP_SENSORS.find(x => x.key === sensor)
  const expo = Math.round((500 / (focal * s.crop)) * 10) / 10
  const npf  = Math.round((300 / (focal * s.crop)) * 10) / 10
  const fovH = 2 * Math.atan(s.w / (2 * focal)) * 180 / Math.PI
  const fovV = 2 * Math.atan(s.h / (2 * focal)) * 180 / Math.PI

  const apTimes = [
    { label: 'Coucher du Soleil', time: ap.sunset,    Ic: IcSky,   note: "Début de l'heure dorée" },
    { label: 'Heure bleue',       time: ap.blueHour,  Ic: IcCloud, note: 'Ciel indigo, premières étoiles' },
    { label: 'Crépuscule astro.', time: ap.duskAstro, Ic: IcMoon,  note: 'Nuit noire — ciel profond' },
    { label: 'Aube astronomique', time: ap.dawnAstro, Ic: IcStar,  note: 'Fin de la fenêtre de pose' },
  ]

  return (
    <ToolPage title="Astrophoto" onBack={onBack}>
      <ToolSeg items={[{ key: 'plan', label: 'Planifier' }, { key: 'tools', label: 'Outils' }]} value={seg} onChange={setSeg} />

      {seg === 'plan' && (
        <div className="enter">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 18px 0', gap: 8 }}>
            <span className="meta" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IcPin size={13} /> {city}
            </span>
            <span className="meta">
              {now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="pad" style={{ paddingTop: 14 }}>
            <div style={{ padding: 16, borderRadius: 18,
              background: ap.hasNight
                ? 'linear-gradient(180deg, rgba(217,179,108,.1), var(--surface-1))'
                : 'linear-gradient(180deg, rgba(226,141,126,.08), var(--surface-1))',
              border: `1px solid ${ap.hasNight ? 'var(--gold-line)' : 'rgba(226,141,126,.3)'}` }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Fenêtre de prise de vue</div>
              <div className="h-sec" style={{ fontSize: 24 }}>{ap.nightWindow}</div>
              <div className="body tight" style={{ fontSize: 12.5, marginTop: 6 }}>{ap.nightDesc}</div>
            </div>
          </div>

          {/* ── Carte météo / seeing ── */}
          <div className="pad" style={{ paddingTop: 0 }}>
            {wxLoading && !weather && (
              <div style={{ padding: 16, borderRadius: 18, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                <div style={{ height: 12, width: '50%', borderRadius: 6, marginBottom: 14,
                  background: 'var(--surface-2)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                {[0, 1].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ height: 11, width: 80, borderRadius: 6, background: 'var(--surface-2)',
                      animation: 'pulse 1.4s ease-in-out infinite', animationDelay: i * 0.15 + 's' }} />
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[0,1,2,3,4].map(j => <span key={j} style={{ width: 9, height: 9, borderRadius: '50%',
                        background: 'var(--surface-2)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: j * 0.08 + 's' }} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {weather && (() => {
              const good = weather.seeingVal >= 4 && weather.clouds < 25
              const mid  = weather.seeingVal >= 3 && weather.clouds < 60
              const verdict = good ? 'Excellentes conditions' : mid ? 'Conditions correctes' : 'Conditions difficiles'
              const verdictColor = good ? 'var(--good)' : mid ? 'var(--gold)' : 'var(--bad)'
              const bg  = good
                ? 'linear-gradient(180deg,rgba(132,211,169,.1),var(--surface-1))'
                : mid
                  ? 'linear-gradient(180deg,rgba(217,179,108,.08),var(--surface-1))'
                  : 'linear-gradient(180deg,rgba(226,141,126,.08),var(--surface-1))'
              const bd  = good ? 'rgba(132,211,169,.3)' : mid ? 'var(--gold-line)' : 'rgba(226,141,126,.3)'
              return (
                <div style={{ padding: 16, borderRadius: 18, background: bg, border: `1px solid ${bd}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
                    <div className="eyebrow" style={{ flex: 1 }}>Conditions ce soir</div>
                    <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, fontFamily: 'var(--mono)',
                      color: verdictColor, background: `${verdictColor}18`, border: `1px solid ${verdictColor}44` }}>
                      {verdict}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
                    {[
                      { label: 'Seeing',       val: weather.seeingVal,  text: weather.seeing },
                      { label: 'Transparence', val: weather.transVal,   text: weather.transparency },
                    ].map(row => {
                      const c = row.val >= 4 ? 'var(--good)' : row.val === 3 ? 'var(--gold)' : 'var(--bad)'
                      return (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="m-k" style={{ width: 90, flexShrink: 0 }}>{row.label}</span>
                          <ScoreDots val={row.val} />
                          <span className="data" style={{ fontSize: 12.5, color: c, marginLeft: 4 }}>{row.text}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
                    {[
                      { k: 'Nuages',    v: weather.clouds + '%' },
                      { k: 'Humidité', v: weather.humidity + '%' },
                      { k: 'Temp.',    v: weather.temp + '°C' },
                    ].map((m, i, arr) => (
                      <div key={m.k} style={{ flex: 1, padding: '10px 0', textAlign: 'center',
                        borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 0,
                        background: 'var(--surface-1)' }}>
                        <div className="m-k" style={{ marginBottom: 3 }}>{m.k}</div>
                        <div className="data" style={{ fontSize: 15 }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          <ToolSection title="Lumière du soir">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {apTimes.map((t, i) => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
                  borderBottom: i < apTimes.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span style={{ color: 'var(--gold)', display: 'flex' }}><t.Ic size={17} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="h-card" style={{ fontSize: 13.5, display: 'block' }}>{t.label}</span>
                    <span className="meta" style={{ marginTop: 2 }}>{t.note}</span>
                  </span>
                  <span className="data" style={{ fontSize: 13, color: 'var(--gold)' }}>{t.time}</span>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="Voie Lactée & alignements">
            <div className="metric-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="metric">
                <div className="m-k">Cœur galactique</div>
                <div className="m-v" style={{ fontSize: 16 }}>{ap.gcDir}</div>
                <div className="m-sub">{ap.gcSub}</div>
              </div>
              <div className="metric">
                <div className="m-k">Saison</div>
                <div className="m-v" style={{ fontSize: 16 }}>{ap.seasonLabel}</div>
                <div className="m-sub">{ap.seasonSub}</div>
              </div>
              <div className="metric">
                <div className="m-k">Lune</div>
                <div className="m-v" style={{ fontSize: 16 }}>{ap.moonLabel}</div>
                <div className="m-sub">{ap.moonSub}</div>
              </div>
              <div className="metric">
                <div className="m-k">Heure bleue</div>
                <div className="m-v" style={{ fontSize: 16 }}>{ap.blueHour ? ap.blueHour.split(' ')[0] : '--'}</div>
                <div className="m-sub">Durée ≈ 20–30 min</div>
              </div>
            </div>
          </ToolSection>

          <div className="pad" style={{ marginTop: -8 }}>
            <AiInfoPanel
              cacheKey={`astrophoto_plan_${new Date().toISOString().slice(0, 10)}_wx${weather?.clouds ?? 'x'}`}
              buildPrompt={`Conditions astrophoto ce soir à ${city} :
- Fenêtre de nuit astronomique : ${ap.nightWindow} (${ap.nightLen})
- Lune : ${ap.moonLabel} (${ap.illum}% illuminée)
- Centre galactique : ${ap.gcDir}, ${ap.gcSub}
- Saison Voie Lactée : ${ap.seasonLabel}
- Météo : ${weather ? `nuages ${weather.clouds}%, humidité ${weather.humidity}%, ${weather.temp}°C, seeing ${weather.seeing}, transparence ${weather.transparency}` : 'données indisponibles'}
En 4 phrases, quels objets recommandes-tu de photographier ce soir (galaxies, nébuleuses, planètes, Voie Lactée) selon ces conditions ? Quel réglage ISO/temps de pose convient ?`}
            />
          </div>
        </div>
      )}

      {seg === 'tools' && (
        <div className="enter pad" style={{ paddingTop: 16 }}>
          <div style={{ padding: 16, borderRadius: 16, background: 'var(--surface-1)', border: '1px solid var(--line)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span className="field-label" style={{ margin: 0 }}>Focale</span>
              <span className="data" style={{ fontSize: 15, color: 'var(--gold)' }}>{focal} mm</span>
            </div>
            <p className="meta" style={{ margin: '0 0 8px', lineHeight: 1.5 }}>
              Distance focale de votre objectif. Courte (14–35 mm) = grand champ, idéal pour la Voie Lactée et les grands panoramas. Longue (100–300 mm) = détails sur nébuleuses et galaxies, mais les temps de pose autorisés diminuent.
            </p>
            <input type="range" min="14" max="300" step="1" value={focal} onChange={e => setFocal(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--gold)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="meta" style={{ fontSize: 10 }}>14 mm · grand angle</span>
              <span className="meta" style={{ fontSize: 10 }}>300 mm · téléphoto</span>
            </div>

            <div className="field-label" style={{ margin: '16px 0 2px' }}>Capteur</div>
            <p className="meta" style={{ margin: '0 0 9px', lineHeight: 1.5 }}>
              La taille du capteur détermine le champ réel. Le facteur crop (×{s.crop}) est multiplié à la focale : un objectif 50 mm sur APS-C donne un champ équivalent à {Math.round(focal * s.crop)} mm en plein format.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {AP_SENSORS.map(se => (
                <button key={se.key} className={'chip' + (sensor === se.key ? ' on' : '')} style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setSensor(se.key)}>{se.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--gold-line)' }}>
              <div className="m-k" style={{ marginBottom: 6 }}>Pose max · règle 500</div>
              <div className="data" style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 6 }}>{expo}<span style={{ fontSize: 13, marginLeft: 3 }}>s</span></div>
              <p className="meta" style={{ margin: 0, lineHeight: 1.5 }}>
                Durée maximale sans monture motorisée avant que les étoiles deviennent des traits. Formule : 500 ÷ (focale × crop). Au-delà, la rotation de la Terre crée un filé d'étoiles.
              </p>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
              <div className="m-k" style={{ marginBottom: 6 }}>Pose stricte · NPF</div>
              <div className="data" style={{ fontSize: 22, marginBottom: 6 }}>{npf}<span style={{ fontSize: 13, marginLeft: 3 }}>s</span></div>
              <p className="meta" style={{ margin: 0, lineHeight: 1.5 }}>
                Règle NPF (North Pole Formula), plus précise pour les capteurs haute résolution. Formule : 300 ÷ (focale × crop). Recommandée si votre appareil dépasse 24 Mpx.
              </p>
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: 'radial-gradient(100% 80% at 50% 0%, #0a0f1f, #05070f)', border: '1px solid var(--line)' }}>
            <div className="field-label" style={{ marginBottom: 12 }}>Simulateur de cadrage</div>
            <ApFraming fovH={fovH} fovV={fovV} />
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}><div className="data" style={{ fontSize: 16, color: 'var(--text)' }}>{fovH.toFixed(1)}°</div><div className="meta">champ horizontal</div></div>
              <div style={{ textAlign: 'center' }}><div className="data" style={{ fontSize: 16, color: 'var(--text)' }}>{fovV.toFixed(1)}°</div><div className="meta">champ vertical</div></div>
              <div style={{ textAlign: 'center' }}><div className="data" style={{ fontSize: 16, color: 'var(--text)' }}>×{s.crop}</div><div className="meta">facteur crop</div></div>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
