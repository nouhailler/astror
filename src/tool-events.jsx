import { useState, useEffect } from 'react'
import { IcSat, IcZap, IcMoon, IcComet, IcStar } from './icons'
import { ToolPage, ToolSection, ToolSeg } from './tool-ui'
import { AiInfoPanel } from './ui'
import { requestPermission, getPermission, scheduleEventReminder, loadNotifPrefs, saveNotifPrefs } from './notifications'

const EVT_CATS = [
  { key: 'all', label: 'Tout' },
  { key: 'eclipse', label: 'Éclipses' },
  { key: 'meteor', label: 'Météores' },
  { key: 'comet', label: 'Comètes' },
  { key: 'iss', label: 'ISS' },
  { key: 'special', label: 'Spécial' },
]

const EVENTS_FULL = [
  { cat: 'iss', Ic: IcSat, title: "Passage de l'ISS", date: 'Ce soir · 22:41', tag: 'Visible', live: true, detail: "Mag −3,8 · culmine à 78° · trajectoire SO → NE, visible 6 minutes à l'œil nu." },
  { cat: 'meteor', Ic: IcZap, title: 'Perséides — maximum', date: '2026-08-12', isoDate: '2026-08-12', tag: '~100/h', detail: 'Radiant dans Persée. Conditions idéales : Lune à 18 %. Météores rapides et brillants.' },
  { cat: 'eclipse', Ic: IcMoon, title: 'Éclipse totale de Lune', date: '2026-09-07', isoDate: '2026-09-07', tag: 'Totale', detail: 'Totalité visible depuis l\'Europe. Lune de sang à 03:11 TU, durée 82 min.' },
  { cat: 'comet', Ic: IcComet, title: 'Comète C/2025 R2', date: 'Oct. 2026', tag: 'mag 6,5', detail: 'Possiblement visible aux jumelles dans le Bouvier au périhélie. À surveiller.' },
  { cat: 'special', Ic: IcMoon, title: 'Superlune', date: '2026-11-05', isoDate: '2026-11-05', tag: 'Périgée', detail: 'Pleine Lune au plus proche (356 800 km) : 14 % plus large et 30 % plus brillante.' },
  { cat: 'eclipse', Ic: IcMoon, title: 'Éclipse totale de Soleil', date: '2027-08-02', isoDate: '2027-08-02', tag: 'Totale', detail: "Bande de totalité traversant l'Espagne. Partielle depuis toute la France." },
  { cat: 'special', Ic: IcStar, title: 'Occultation de Saturne', date: '2026-12-14', isoDate: '2026-12-14', tag: 'Occult.', detail: 'La Lune occulte Saturne. Disparition à 19:52, réapparition à 20:48 (côté sombre).' },
  { cat: 'meteor', Ic: IcZap, title: 'Géminides — maximum', date: '2026-12-14', isoDate: '2026-12-14', tag: '~120/h', detail: 'La plus riche pluie annuelle. Météores lents issus de (3200) Phaéthon.' },
]

const NOTIFS_RECENT = [
  { Ic: IcStar, color: 'var(--gold)', title: 'Jupiter bien placé', body: 'Jupiter passe au méridien dans 15 minutes — l\'instant idéal pour l\'observer.', time: 'il y a 2 min' },
  { Ic: IcSat, color: 'var(--blue)', title: 'ISS visible à 22:14', body: 'Passage brillant (mag −3,2) au-dessus de Paris, direction sud-ouest.', time: 'il y a 1 h' },
  { Ic: IcZap, color: 'var(--violet)', title: 'Pic des Perséides cette nuit', body: "Jusqu'à 100 météores/h après minuit. Éloignez-vous des lumières.", time: "aujourd'hui" },
  { Ic: IcMoon, color: 'var(--good)', title: 'Lune couchée à 02:48', body: 'Le ciel atteint son obscurité maximale — parfait pour le ciel profond.', time: 'hier' },
]

const NOTIF_SETTINGS = [
  { k: 'iss', label: "Passages de l'ISS" },
  { k: 'planet', label: 'Planètes bien placées' },
  { k: 'meteor', label: 'Pluies de météores' },
  { k: 'eclipse', label: 'Éclipses & occultations' },
]

export default function EventsPage({ onBack }) {
  const [seg, setSeg] = useState('upcoming')
  const [cat, setCat] = useState('all')
  const [notif, setNotif] = useState(() => ({ iss: true, planet: true, meteor: true, eclipse: false, ...loadNotifPrefs() }))
  const [permission, setPermission] = useState(() => getPermission())
  const list = EVENTS_FULL.filter(e => cat === 'all' || e.cat === cat)

  useEffect(() => { saveNotifPrefs(notif) }, [notif])

  const toggleNotif = async (k, newVal) => {
    if (newVal && permission !== 'granted') {
      const perm = await requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return
    }
    setNotif(v => {
      const next = { ...v, [k]: newVal }
      if (newVal && k !== 'iss') {
        const evt = EVENTS_FULL.find(e => e.cat === k && e.isoDate)
        if (evt) scheduleEventReminder(evt.title, evt.isoDate, 60)
      }
      return next
    })
  }

  return (
    <ToolPage title="Événements" onBack={onBack}>
      <ToolSeg items={[{ key: 'upcoming', label: 'À venir' }, { key: 'notif', label: 'Notifications' }]} value={seg} onChange={setSeg} />

      {seg === 'upcoming' && (
        <div className="enter">
          <div style={{ paddingTop: 10 }}>
            <ToolSeg items={EVT_CATS} value={cat} onChange={setCat} />
          </div>
          <div className="pad" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
            {list.map((e, i) => (
              <div key={i} style={{ padding: 15, borderRadius: 16,
                background: e.live ? 'linear-gradient(180deg, rgba(132,211,169,.08), var(--surface-1))' : 'linear-gradient(180deg,var(--surface-2),var(--surface-1))',
                border: '1px solid ' + (e.live ? 'rgba(132,211,169,.3)' : 'var(--line)') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
                    <e.Ic size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-card" style={{ fontSize: 14.5 }}>{e.title}</div>
                    <div className="meta" style={{ color: 'var(--gold)', marginTop: 2 }}>
                      {e.isoDate ? new Date(e.isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : e.date}
                    </div>
                  </div>
                  <span className={'tag' + (e.live ? ' live' : ' neutral')}>
                    {e.live && <span className="dot pulse" style={{ background: 'var(--good)' }} />}{e.tag}
                  </span>
                </div>
                <div className="body tight" style={{ fontSize: 12.5, marginBottom: 10 }}>{e.detail}</div>
                <AiInfoPanel cacheKey={`event_${i}`} buildPrompt={`Événement astronomique : ${e.title}.
Date : ${e.isoDate ? new Date(e.isoDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : e.date}, ${e.detail}
En 3 à 4 phrases, explique comment préparer et observer cet événement : matériel recommandé, heure idéale, point précis dans le ciel, et conseil pratique pour ne pas le rater.`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {seg === 'notif' && (
        <div className="enter">
          {permission === 'denied' && (
            <div style={{ margin: '14px 18px 0', padding: 14, borderRadius: 14, background: 'rgba(226,141,126,.08)', border: '1px solid rgba(226,141,126,.3)', fontSize: 13, color: 'var(--bad)' }}>
              Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du navigateur pour les activer.
            </div>
          )}

          <ToolSection title="Notifications récentes" style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NOTIFS_RECENT.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 15,
                  background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: n.color, background: 'rgba(255,255,255,.03)', border: '1px solid var(--line-2)' }}>
                    <n.Ic size={19} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                      <span className="h-card" style={{ fontSize: 14 }}>{n.title}</span>
                      <span className="meta" style={{ flexShrink: 0 }}>{n.time}</span>
                    </div>
                    <div className="body tight" style={{ fontSize: 12.5, marginTop: 3 }}>{n.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection title="M'avertir pour…">
            <div className="card-2" style={{ overflow: 'hidden' }}>
              {NOTIF_SETTINGS.map((s, i) => (
                <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px',
                  borderBottom: i < NOTIF_SETTINGS.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <span className="h-card" style={{ flex: 1, fontSize: 14 }}>{s.label}</span>
                  <button
                    className={'switch' + (notif[s.k] ? ' on' : '')}
                    onClick={() => toggleNotif(s.k, !notif[s.k])}
                    aria-pressed={!!notif[s.k]}
                    aria-label={s.label}
                  ><i /></button>
                </div>
              ))}
            </div>
          </ToolSection>
        </div>
      )}
    </ToolPage>
  )
}
