import { useState, useMemo } from 'react'
import {
  IcPin, IcEye, IcBino, IcTele, IcCompass, IcStar, IcOrbit, IcBell,
  IcArrowLeft, IcCheck, IcSpark
} from './icons'

const ONB_STORE = 'astror_profile_v1'
const ONB_FLAG  = 'astror_onboarded_v1'

export const ONB_LOCATION_COORDS = {
  'Paris':     { lat: 48.8566, lng: 2.3522 },
  'Lyon':      { lat: 45.7640, lng: 4.8357 },
  'Marseille': { lat: 43.2965, lng: 5.3698 },
  'Toulouse':  { lat: 43.6047, lng: 1.4442 },
  'Bordeaux':  { lat: 44.8378, lng: -0.5792 },
  'Nantes':    { lat: 47.2184, lng: -1.5536 },
}

export const DEFAULT_PROFILE = {
  location: { city: 'Paris', lat: 48.8566, lng: 2.3522 },
  level: 'Amateur',
  interests: ['Planètes', 'Ciel profond'],
  gear: ['Jumelles'],
  alerts: { iss: true, conj: true, meteor: true, eclipse: false },
}

function migrateLocation(loc) {
  if (!loc) return DEFAULT_PROFILE.location
  if (typeof loc === 'object' && loc.lat != null) return loc
  const city = String(loc).replace(', FR', '').trim()
  const coords = ONB_LOCATION_COORDS[city]
  return coords ? { city, ...coords } : { city, lat: 48.8566, lng: 2.3522 }
}

export function onbLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem(ONB_STORE)) || {}
    const merged = Object.assign({}, DEFAULT_PROFILE, saved)
    merged.location = migrateLocation(saved.location)
    return merged
  } catch { return { ...DEFAULT_PROFILE } }
}
export function onbSave(p) { try { localStorage.setItem(ONB_STORE, JSON.stringify(p)) } catch {} }
export function onbWasSeen() { try { return !!localStorage.getItem(ONB_FLAG) } catch { return false } }
export function onbMarkSeen() { try { localStorage.setItem(ONB_FLAG, '1') } catch {} }

export const ONB_LOCATIONS = Object.keys(ONB_LOCATION_COORDS)
export const ONB_LEVELS = [
  { k: 'Débutant', d: 'Je découvre le ciel nocturne' },
  { k: 'Amateur',  d: "J'observe régulièrement" },
  { k: 'Confirmé', d: 'Je maîtrise mon matériel' },
]
export const ONB_INTERESTS = ['Planètes', 'Lune & Soleil', 'Constellations', 'Ciel profond', 'Astrophotographie', 'Cosmologie', 'Actualités spatiales']
export const ONB_GEAR = [
  { k: "À l'œil nu", Ic: IcEye },
  { k: 'Jumelles',   Ic: IcBino },
  { k: 'Télescope',  Ic: IcTele },
  { k: 'Lunette',    Ic: IcCompass },
]
export const ONB_ALERTS = [
  { k: 'iss',    label: "Passages de l'ISS",          sub: "Survols visibles à l'œil nu" },
  { k: 'conj',   label: 'Conjonctions planétaires',    sub: 'Rapprochements remarquables' },
  { k: 'meteor', label: 'Pluies de météores',           sub: 'Perséides, Géminides…' },
  { k: 'eclipse',label: 'Éclipses',                    sub: 'Solaires et lunaires' },
]

function OnbStars() {
  const stars = useMemo(() => Array.from({ length: 48 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 1.8 + 0.6, o: Math.random() * 0.55 + 0.25,
  })), [])
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.9 }}>
      {stars.map((st, i) => (
        <span key={i} className="onb-star" style={{
          left: st.x + '%', top: st.y + '%', width: st.s, height: st.s, opacity: st.o,
          boxShadow: st.s > 1.7 ? '0 0 4px #cfe0ff' : 'none',
        }} />
      ))}
    </div>
  )
}

function OptCheck({ on }) {
  return <span className="opt-check">{on && <IcCheck size={14} />}</span>
}

function StepShell({ eyebrow, title, sub, children }) {
  return (
    <div className="onb-anim" style={{ paddingTop: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 9 }}>{eyebrow}</div>
      <div className="h-screen" style={{ fontSize: 29, marginBottom: 9 }}>{title}</div>
      {sub && <p className="body" style={{ fontSize: 13.5, marginBottom: 22, maxWidth: 320 }}>{sub}</p>}
      {children}
    </div>
  )
}

function RecapRow({ ic, k, v, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
      borderBottom: last ? 0 : '1px solid var(--line)' }}>
      <span style={{ color: 'var(--gold)', display: 'flex' }}>{ic}</span>
      <span className="meta" style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '.1em' }}>{k}</span>
      <span className="h-card" style={{ fontSize: 14 }}>{v}</span>
    </div>
  )
}

function GeolocButton({ onDetected }) {
  const [state, setState] = useState('idle')

  const detect = () => {
    if (!navigator.geolocation) return
    setState('loading')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || 'Ma position'
          onDetected({ city, lat, lng })
        } catch {
          onDetected({ city: `${lat.toFixed(2)}°N`, lat, lng })
        }
        setState('done')
      },
      () => setState('error')
    )
  }

  return (
    <button onClick={detect} disabled={state === 'loading'} className="press" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      borderRadius: 14, cursor: state === 'loading' ? 'default' : 'pointer',
      background: 'linear-gradient(180deg, rgba(217,179,108,.10), rgba(217,179,108,.04))',
      border: '1px solid var(--gold-line)', opacity: state === 'loading' ? 0.7 : 1,
    }}>
      <span style={{ color: 'var(--gold)', display: 'flex' }}><IcPin size={20} /></span>
      <span className="h-card" style={{ flex: 1, fontSize: 14 }}>
        {state === 'loading' ? 'Détection en cours…' : state === 'done' ? 'Position détectée ✓' : 'Détecter ma position GPS'}
      </span>
    </button>
  )
}

export default function Onboarding({ initial, onFinish, onSkip }) {
  const STEPS = 7
  const [step, setStep] = useState(0)
  const [p, setP] = useState(() => ({ ...DEFAULT_PROFILE, ...(initial || {}) }))

  const set = (patch) => setP(prev => ({ ...prev, ...patch }))
  const toggle = (key, val) => setP(prev => {
    const arr = prev[key] || []
    return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
  })
  const toggleAlert = (k) => setP(prev => ({ ...prev, alerts: { ...prev.alerts, [k]: !prev.alerts?.[k] } }))

  const next = () => setStep(s => Math.min(STEPS - 1, s + 1))
  const back = () => setStep(s => Math.max(0, s - 1))
  const finish = () => onFinish(p)

  const primaryLabel = step === 0 ? 'Commencer' : step === STEPS - 1 ? 'Explorer le ciel' : 'Continuer'
  const onPrimary = step === STEPS - 1 ? finish : next

  const currentCity = p.location?.city || ''

  let body = null
  if (step === 0) {
    body = (
      <div className="onb-anim" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', paddingTop: 30 }}>
        <span style={{ width: 76, height: 76, borderRadius: 24, margin: '0 auto 26px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(160deg,var(--gold-2),var(--gold-3))',
          boxShadow: '0 0 50px rgba(217,179,108,.45)' }}>
          <IcSpark size={40} />
        </span>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Compagnon d'observation</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 52, lineHeight: 1, letterSpacing: '-.02em', marginBottom: 18 }}>Astror</div>
        <p className="body serif-body" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 300, margin: '0 auto', color: 'var(--dim)' }}>
          Le ciel de ce soir, calculé pour votre position. Repérez les astres, suivez l'actualité spatiale et apprenez à observer.
        </p>
      </div>
    )
  } else if (step === 1) {
    body = (
      <StepShell eyebrow="Étape 1" title="Où observez-vous ?"
        sub="Pour calculer le ciel visible et les heures de lever et coucher.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <GeolocButton onDetected={loc => set({ location: loc })} />
          <div className="eyebrow dim" style={{ textAlign: 'center', margin: '4px 0 2px' }}>ou choisissez une ville</div>
          {ONB_LOCATIONS.map(city => {
            const coords = ONB_LOCATION_COORDS[city]
            const loc = { city, ...coords }
            const selected = currentCity === city
            return (
              <button key={city} className={'opt' + (selected ? ' on' : '')} onClick={() => set({ location: loc })}>
                <span className="opt-ic"><IcPin size={20} /></span>
                <span style={{ flex: 1 }} className="h-card">{city}</span>
                <OptCheck on={selected} />
              </button>
            )
          })}
        </div>
      </StepShell>
    )
  } else if (step === 2) {
    body = (
      <StepShell eyebrow="Étape 2" title="Votre expérience"
        sub="Nous adapterons les explications et les suggestions d'observation.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ONB_LEVELS.map(lv => (
            <button key={lv.k} className={'opt' + (p.level === lv.k ? ' on' : '')} onClick={() => set({ level: lv.k })}>
              <span style={{ flex: 1 }}>
                <span className="h-card" style={{ display: 'block' }}>{lv.k}</span>
                <span className="body tight" style={{ fontSize: 12.5 }}>{lv.d}</span>
              </span>
              <OptCheck on={p.level === lv.k} />
            </button>
          ))}
        </div>
      </StepShell>
    )
  } else if (step === 3) {
    body = (
      <StepShell eyebrow="Étape 3" title="Qu'aimez-vous observer ?"
        sub="Choisissez-en autant que vous voulez. Votre fil sera personnalisé.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {ONB_INTERESTS.map(it => (
            <button key={it} className={'chip' + (p.interests.includes(it) ? ' on' : '')}
              style={{ height: 40, fontSize: 13.5 }} onClick={() => toggle('interests', it)}
              aria-pressed={p.interests.includes(it)}>
              {p.interests.includes(it) && <IcCheck size={14} />} {it}
            </button>
          ))}
        </div>
      </StepShell>
    )
  } else if (step === 4) {
    body = (
      <StepShell eyebrow="Étape 4" title="Votre matériel"
        sub="Pour des conseils d'observation adaptés à vos instruments.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ONB_GEAR.map(g => (
            <button key={g.k} className={'opt' + (p.gear.includes(g.k) ? ' on' : '')} onClick={() => toggle('gear', g.k)}>
              <span className="opt-ic"><g.Ic size={20} /></span>
              <span style={{ flex: 1 }} className="h-card">{g.k}</span>
              <OptCheck on={p.gear.includes(g.k)} />
            </button>
          ))}
        </div>
      </StepShell>
    )
  } else if (step === 5) {
    body = (
      <StepShell eyebrow="Étape 5" title="Vous prévenir des rendez-vous"
        sub="Activez les alertes qui vous intéressent. Modifiable à tout moment.">
        <div className="card-2" style={{ overflow: 'hidden' }}>
          {ONB_ALERTS.map((a, i) => (
            <div key={a.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px',
              borderBottom: i < ONB_ALERTS.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="h-card" style={{ fontSize: 14.5, display: 'block' }}>{a.label}</span>
                <span className="body tight" style={{ fontSize: 12 }}>{a.sub}</span>
              </span>
              <button className={'switch' + (p.alerts?.[a.k] ? ' on' : '')}
                onClick={() => toggleAlert(a.k)}
                aria-pressed={!!p.alerts?.[a.k]}
                aria-label={a.label}><i /></button>
            </div>
          ))}
        </div>
      </StepShell>
    )
  } else {
    const intN = p.interests.length
    body = (
      <div className="onb-anim" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', paddingTop: 20 }}>
        <span style={{ width: 70, height: 70, borderRadius: '50%', margin: '0 auto 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(160deg,var(--gold-2),var(--gold))',
          boxShadow: '0 0 46px rgba(217,179,108,.5)' }}>
          <IcCheck size={36} />
        </span>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Profil enregistré</div>
        <div className="h-screen" style={{ fontSize: 30, marginBottom: 22 }}>Tout est prêt</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left',
          background: 'var(--surface-1)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', maxWidth: 320, margin: '0 auto', width: '100%' }}>
          <RecapRow ic={<IcPin size={17} />} k="Lieu" v={p.location?.city || 'Paris'} />
          <RecapRow ic={<IcStar size={17} />} k="Niveau" v={p.level} />
          <RecapRow ic={<IcOrbit size={17} />} k="Intérêts" v={intN + (intN > 1 ? ' thèmes' : ' thème')} />
          <RecapRow ic={<IcBell size={17} />} k="Alertes" v={Object.values(p.alerts).filter(Boolean).length + ' actives'} last />
        </div>
      </div>
    )
  }

  return (
    <div className="onb">
      <OnbStars />
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, padding: 'calc(var(--sat) + 60px) 22px 8px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40 }}>
          {step > 0 && step < STEPS - 1 && (
            <button onClick={back} className="press" style={{ width: 40, height: 40, borderRadius: 999,
              border: '1px solid var(--line-2)', background: 'rgba(255,255,255,.03)', color: 'var(--dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label="Étape précédente">
              <IcArrowLeft size={19} />
            </button>
          )}
        </div>
        <div className="onb-dots" style={{ flex: 1, justifyContent: 'center' }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={i === step ? 'on' : i < step ? 'done' : ''} />
          ))}
        </div>
        <div style={{ width: 40, textAlign: 'right' }}>
          {step < STEPS - 1 && (
            <button onClick={onSkip} style={{ background: 'none', border: 0, cursor: 'pointer',
              color: 'var(--faint)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.06em' }}>Passer</button>
          )}
        </div>
      </div>
      <div className="onb-body" style={{ position: 'relative', zIndex: 1 }}>{body}</div>
      <div className="onb-foot" style={{ position: 'relative', zIndex: 1 }}>
        <button className="btn-primary" onClick={onPrimary}>{primaryLabel}</button>
      </div>
    </div>
  )
}
