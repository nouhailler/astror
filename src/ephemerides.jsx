import { useState, useMemo } from 'react'
import { IcRocket, IcMoon, IcStar, IcBell } from './icons'
import { ScreenHeader, IconBtn, SettingsBtn, HeaderTools, SectionTitle, DataRow, Stat, Sheet, useCountdown, AiInfoPanel } from './ui'
import { TipBanner } from './tips'
import { ALERTS, EVENTS } from './data'
import { getMoonData, getSunData } from './astro'
import { fetchWeather, useLiveData } from './api'
import { onbLoad } from './onboarding'
import { requestPermission, getPermission, loadNotifPrefs, saveNotifPrefs } from './notifications'

const ALERT_NOTIF_SETTINGS = [
  { k: 'iss',  label: "Passages de l'ISS",         sub: 'Alertes avant chaque passage visible' },
  { k: 'conj', label: 'Conjonctions planétaires',   sub: 'Rapprochements Lune-planète, etc.' },
  { k: 'iri',  label: 'Stations spatiales',         sub: 'Tiangong et autres passages' },
]

function Moon({ illum = 73, size = 116 }) {
  const p = illum / 100
  const lit = '#e9e3d0'
  const ex = Math.abs(p - 0.5) * 2 * size
  const gibbous = p > 0.5
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', position: 'relative',
      overflow: 'hidden', background: '#0d1326',
      boxShadow: '0 0 40px rgba(233,227,208,.18), inset 0 0 18px rgba(0,0,0,.5)' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: lit }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: ex,
        transform: 'translateX(-50%)', borderRadius: '50%', background: gibbous ? lit : '#0d1326' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', mixBlendMode: 'multiply',
        background: 'radial-gradient(circle at 66% 34%, rgba(120,110,90,.35) 0 7%, transparent 9%), radial-gradient(circle at 78% 60%, rgba(120,110,90,.28) 0 5%, transparent 7%), radial-gradient(circle at 60% 72%, rgba(120,110,90,.25) 0 4%, transparent 6%)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset -10px -8px 22px rgba(0,0,0,.45)' }} />
    </div>
  )
}

const ALERT_ICON = {
  iss: <IcRocket size={18} />, conj: <IcMoon size={18} />, iri: <IcStar size={18} />,
}

function CondBar({ label, value, level, max = 5 }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span className="meta" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
        <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>{value}</span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 5, borderRadius: 99,
            background: i < level ? 'linear-gradient(90deg,var(--gold-3),var(--gold-2))' : 'var(--surface-3)' }} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ e, onClick }) {
  const cd = useCountdown(e.date)
  const d = new Date(e.date)
  const day = d.toLocaleDateString('fr-FR', { day: '2-digit' })
  const mon = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  return (
    <button onClick={onClick} className="press" style={{ width: '100%', display: 'flex', alignItems: 'center',
      gap: 14, padding: '14px 15px', background: 'none', border: 0, borderBottom: '1px solid var(--line)',
      textAlign: 'left', cursor: 'pointer' }}>
      <span style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
        <span className="data" style={{ display: 'block', fontSize: 22, fontWeight: 500, color: 'var(--text)', lineHeight: 1 }}>{day}</span>
        <span className="meta" style={{ textTransform: 'uppercase', fontSize: 9.5 }}>{mon}</span>
      </span>
      <span style={{ width: 1, height: 34, background: 'var(--line-2)', flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="h-card" style={{ fontSize: 14.5 }}>{e.label}</span>
        <span style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          <span className="meta" style={{ color: 'var(--gold)' }}>{e.kind}</span>
          <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--faint)' }} />
          <span className="meta">{e.zhr}</span>
        </span>
      </span>
      <span style={{ textAlign: 'right', flexShrink: 0 }}>
        <span className="meta" style={{ display: 'block', fontSize: 9 }}>DANS</span>
        <span className="data" style={{ fontSize: 13, color: 'var(--text)' }}>{cd}</span>
      </span>
    </button>
  )
}

export default function EphScreen() {
  const profile = useMemo(() => onbLoad(), [])
  const lat = profile.location?.lat ?? 48.8566
  const lng = profile.location?.lng ?? 2.3522
  const city = profile.location?.city || 'Paris'

  const now = useMemo(() => new Date(), [])
  const moon = useMemo(() => getMoonData(now, lat, lng), [lat, lng, now])
  const sun  = useMemo(() => getSunData(now, lat, lng), [lat, lng, now])

  const { data: weather, loading: wLoading } = useLiveData(() => fetchWeather(lat, lng))
  const [evt, setEvt] = useState(null)
  const [alertSheet, setAlertSheet] = useState(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState(() => ({ iss: true, conj: true, iri: false, ...loadNotifPrefs() }))
  const [permission, setPermission] = useState(() => getPermission())

  const toggleAlert = async (k, newVal) => {
    if (newVal && permission !== 'granted') {
      const perm = await requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return
    }
    setNotifPrefs(v => {
      const next = { ...v, [k]: newVal }
      saveNotifPrefs(next)
      return next
    })
  }

  const dateLabel = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + city

  return (
    <div className="screen pad-b">
      <ScreenHeader eyebrow={dateLabel} title="Éphémérides"
        right={<HeaderTools><IconBtn badge onClick={() => setManageOpen(true)}><IcBell size={19} /></IconBtn><SettingsBtn /></HeaderTools>} />

      <TipBanner tipKey="eph" />

      <div className="pad">
        <div className="card enter" style={{ padding: 18, display: 'flex', gap: 18, alignItems: 'center' }}>
          <Moon illum={moon.illumination} />
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Lune</div>
            <div className="h-sec" style={{ fontSize: 19, marginBottom: 2 }}>{moon.phase}</div>
            <div className="body tight" style={{ fontSize: 12.5 }}>{moon.illumination}% illuminée · {moon.age} j</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div>
                <div className="meta" style={{ fontSize: 9 }}>LEVER</div>
                <div className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>{moon.moonrise}</div>
              </div>
              <div>
                <div className="meta" style={{ fontSize: 9 }}>COUCHER</div>
                <div className="data" style={{ fontSize: 14, color: 'var(--gold)' }}>{moon.moonset}</div>
              </div>
              <div>
                <div className="meta" style={{ fontSize: 9 }}>DISTANCE</div>
                <div className="data" style={{ fontSize: 14, color: 'var(--text)' }}>{moon.distance}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-2" style={{ marginTop: 12, padding: '4px 16px' }}>
          <DataRow k="Lever du Soleil" v={sun.sunrise} accent />
          <DataRow k="Coucher du Soleil" v={sun.sunset} accent />
          <DataRow k="Aube astronomique" v={sun.dawnAstro} />
          <DataRow k="Crépuscule astronomique" v={sun.duskAstro} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--dim)' }}>Nuit noire</span>
            <span className="data" style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>{sun.nightLen}</span>
          </div>
        </div>
      </div>

      <div className="pad">
        <SectionTitle action="Gérer" onAction={() => setManageOpen(true)}>Alertes</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ALERTS.map(a => (
            <button key={a.id} onClick={() => setAlertSheet(a)} className="card press"
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: 14, display: 'flex', gap: 13 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
                {ALERT_ICON[a.icon]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="h-card">{a.title}</span>
                  {a.live && <span className="tag live"><span className="dot pulse" style={{ background: 'var(--good)' }} /> EN DIRECT</span>}
                </div>
                <div className="meta" style={{ color: 'var(--gold)', margin: '4px 0 6px' }}>{a.when}</div>
                <div className="body tight" style={{ fontSize: 12.5 }}>{a.detail}</div>
              </div>
              <span style={{ alignSelf: 'center', color: 'var(--faint)', flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pad">
        <SectionTitle action="Tout voir" onAction={() => window.openAstrorTool?.('events')}>Calendrier céleste</SectionTitle>
        <AiInfoPanel cacheKey="ephem_calendar" buildPrompt={() => {
          const sorted = [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date))
          const lines = sorted.map(e => {
            const d = new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            return `- ${e.label} (${d}, ${e.kind}) : ${e.detail}`
          }).join('\n')
          return `Voici les prochains événements du calendrier astronomique :\n${lines}\n\nEn 4 à 5 phrases, explique quels sont les plus spectaculaires, lesquels nécessitent un équipement particulier, et donne une astuce pratique pour préparer l'observation du prochain événement.`
        }} />
        <div className="card-2" style={{ overflow: 'hidden' }}>
          {[...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => (
            <EventRow key={e.id} e={e} onClick={() => setEvt(e)} />
          ))}
        </div>
      </div>

      <div className="pad">
        <SectionTitle action={weather ? now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null}>Conditions d'observation</SectionTitle>
        <AiInfoPanel cacheKey="ephem_conditions" buildPrompt={() => {
          if (!weather) return "En 4 à 5 phrases, explique à un astronome amateur comment évaluer les conditions d'observation : seeing, transparence, indice de Bortle, humidité. Quels sont les critères les plus importants selon le type d'observation (planètes, ciel profond, astrophoto) ?"
          return `Conditions d'observation actuelles :
- Seeing : ${weather.seeing} (${weather.seeingVal}/5)
- Transparence : ${weather.transparency} (${weather.transVal}/5)
- Indice de Bortle : ${weather.bortle}
- Couverture nuageuse : ${weather.clouds} %
- Humidité : ${weather.humidity} %
- Température : ${weather.temp} °C

En 4 à 5 phrases, analyse ces conditions pour la nuit : qu'est-il raisonnable d'observer avec un télescope amateur ? Quels types d'objets sont favorisés ou défavorisés ? Y a-t-il des précautions à prendre ?`
        }} />
        <div className="card" style={{ padding: 18 }}>
          {wLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 13, padding: '12px 0' }}>Chargement météo…</div>
          ) : weather ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 20px' }}>
                <CondBar label="Seeing" value={weather.seeing} level={weather.seeingVal} />
                <CondBar label="Transparence" value={weather.transparency} level={weather.transVal} />
              </div>
              <hr className="hair" style={{ margin: '18px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Stat label="Bortle" value={weather.bortle} sub="périurbain" />
                <Stat label="Nuages" value={weather.clouds} unit="%" />
                <Stat label="Humidité" value={weather.humidity} unit="%" />
                <Stat label="Temp." value={weather.temp} unit="°C" />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 13, padding: '12px 0' }}>Données météo indisponibles</div>
          )}
        </div>
      </div>

      {/* ── Détail alerte ── */}
      <Sheet open={!!alertSheet} onClose={() => setAlertSheet(null)}>
        {alertSheet && (() => {
          const notifSetting = ALERT_NOTIF_SETTINGS.find(s => s.k === alertSheet.icon)
          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
                  {ALERT_ICON[alertSheet.icon]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {alertSheet.live && (
                    <span className="tag live" style={{ display: 'inline-flex', marginBottom: 7 }}>
                      <span className="dot pulse" style={{ background: 'var(--good)' }} /> EN DIRECT
                    </span>
                  )}
                  <div className="h-sec" style={{ fontSize: 22 }}>{alertSheet.title}</div>
                  <div className="meta" style={{ color: 'var(--gold)', marginTop: 4 }}>{alertSheet.when}</div>
                </div>
              </div>

              <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>
                {alertSheet.detail}
              </p>

              <AiInfoPanel
                cacheKey={`alert_${alertSheet.id}`}
                style={{ marginBottom: 18 }}
                buildPrompt={`Événement astronomique : ${alertSheet.title}
Quand : ${alertSheet.when}
Détails : ${alertSheet.detail}

En 4 phrases concrètes, explique comment observer au mieux cet événement : à quelle heure se préparer, où regarder dans le ciel, quel équipement conseilles-tu (œil nu, jumelles, télescope), et donne une astuce pratique pour ne pas le rater.`}
              />

              {notifSetting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px',
                  borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <IcBell size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="h-card" style={{ display: 'block', fontSize: 14, marginBottom: 3 }}>
                      Notifications
                    </span>
                    <span className="meta">{notifSetting.sub}</span>
                  </span>
                  <button
                    className={'switch' + (notifPrefs[notifSetting.k] ? ' on' : '')}
                    onClick={() => toggleAlert(notifSetting.k, !notifPrefs[notifSetting.k])}
                    aria-pressed={!!notifPrefs[notifSetting.k]}
                    aria-label={'Notifications · ' + notifSetting.label}
                  ><i /></button>
                </div>
              )}
            </div>
          )
        })()}
      </Sheet>

      <Sheet open={manageOpen} onClose={() => setManageOpen(false)} aria-label="Gérer les alertes">
        <div className="h-sec" style={{ fontSize: 22, marginBottom: 6 }}>Alertes</div>
        <p className="body" style={{ fontSize: 13, marginBottom: 20 }}>
          Choisissez les événements pour lesquels vous souhaitez être notifié.
        </p>
        {permission === 'denied' && (
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 14,
            background: 'rgba(226,141,126,.08)', border: '1px solid rgba(226,141,126,.3)',
            fontSize: 13, color: 'var(--bad)' }}>
            Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du navigateur.
          </div>
        )}
        <div className="card-2" style={{ overflow: 'hidden' }}>
          {ALERT_NOTIF_SETTINGS.map((s, i) => (
            <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px',
              borderBottom: i < ALERT_NOTIF_SETTINGS.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
                {ALERT_ICON[s.k]}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="h-card" style={{ display: 'block', fontSize: 14 }}>{s.label}</span>
                <span className="meta" style={{ display: 'block', marginTop: 2 }}>{s.sub}</span>
              </span>
              <button
                className={'switch' + (notifPrefs[s.k] ? ' on' : '')}
                onClick={() => toggleAlert(s.k, !notifPrefs[s.k])}
                aria-pressed={!!notifPrefs[s.k]}
                aria-label={s.label}
              ><i /></button>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet open={!!evt} onClose={() => setEvt(null)}>
        {evt && (
          <div>
            <div className="tag" style={{ marginBottom: 10 }}>{evt.kind}</div>
            <div className="h-sec" style={{ fontSize: 25, marginBottom: 6 }}>{evt.label}</div>
            <div className="meta" style={{ color: 'var(--gold)', marginBottom: 16 }}>
              {new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6 }}>{evt.detail}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginTop: 8 }}>
              <DataRow k="Type" v={evt.kind} />
              <DataRow k="Intensité / durée" v={evt.zhr} accent />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
