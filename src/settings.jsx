import { IcPin, IcStar, IcSpark, IcChevron, IcCheck } from './icons'
import { Sheet } from './ui'
import {
  ONB_LEVELS, ONB_LOCATIONS, ONB_INTERESTS, ONB_GEAR, ONB_ALERTS, DEFAULT_PROFILE
} from './onboarding'

function SettingsSection({ label }) {
  return (
    <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 11, letterSpacing: '.16em' }}>{label}</div>
  )
}

export default function SettingsSheet({ open, onClose, profile, onChange, onReplay }) {
  const p = profile || DEFAULT_PROFILE
  const update = (patch) => onChange({ ...p, ...patch })
  const toggleArr = (key, val) => {
    const arr = p[key] || []
    update({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }
  const toggleAlert = (k) => update({ alerts: { ...p.alerts, [k]: !p.alerts?.[k] } })

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Astror</div>
      <div className="h-sec" style={{ fontSize: 25, marginBottom: 18 }}>Paramètres</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 15, borderRadius: 16,
        background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)', marginBottom: 22 }}>
        <span style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
          background: 'radial-gradient(circle at 35% 30%, #1c2950, #0d1326)', border: '1px solid var(--gold-line)' }}>
          <IcStar size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h-card" style={{ fontSize: 15 }}>Observateur {p.level.toLowerCase()}</div>
          <div className="meta" style={{ color: 'var(--gold)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
            <IcPin size={12} /> {p.location}
          </div>
        </div>
      </div>

      <button onClick={onReplay} className="press" style={{ width: '100%', textAlign: 'left', display: 'flex',
        alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: 16, cursor: 'pointer', marginBottom: 26,
        background: 'linear-gradient(180deg, rgba(217,179,108,.14), rgba(217,179,108,.05))', border: '1px solid var(--gold-line)' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(160deg,var(--gold-2),var(--gold))' }}><IcSpark size={21} /></span>
        <span style={{ flex: 1 }}>
          <span className="h-card" style={{ display: 'block', fontSize: 15 }}>Revoir l'introduction</span>
          <span className="body tight" style={{ fontSize: 12.5 }}>Relancer la prise en main pas à pas</span>
        </span>
        <IcChevron size={18} className="arrow" />
      </button>

      <SettingsSection label="Niveau d'expérience" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_LEVELS.map(lv => (
          <button key={lv.k} className={'chip' + (p.level === lv.k ? ' on' : '')} style={{ height: 38 }}
            onClick={() => update({ level: lv.k })}>{lv.k}</button>
        ))}
      </div>

      <SettingsSection label="Localisation" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_LOCATIONS.map(loc => (
          <button key={loc} className={'chip' + (p.location === loc ? ' on' : '')} style={{ height: 38 }}
            onClick={() => update({ location: loc })}>{loc.replace(', FR', '')}</button>
        ))}
      </div>

      <SettingsSection label="Centres d'intérêt" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_INTERESTS.map(it => (
          <button key={it} className={'chip' + (p.interests.includes(it) ? ' on' : '')} style={{ height: 38 }}
            onClick={() => toggleArr('interests', it)}>
            {p.interests.includes(it) && <IcCheck size={13} />} {it}
          </button>
        ))}
      </div>

      <SettingsSection label="Matériel" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_GEAR.map(g => (
          <button key={g.k} className={'chip' + (p.gear.includes(g.k) ? ' on' : '')} style={{ height: 38 }}
            onClick={() => toggleArr('gear', g.k)}>
            {p.gear.includes(g.k) && <IcCheck size={13} />} {g.k}
          </button>
        ))}
      </div>

      <SettingsSection label="Alertes" />
      <div className="card-2" style={{ overflow: 'hidden', marginBottom: 22 }}>
        {ONB_ALERTS.map((a, i) => (
          <div key={a.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
            borderBottom: i < ONB_ALERTS.length - 1 ? '1px solid var(--line)' : 0 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="h-card" style={{ fontSize: 14, display: 'block' }}>{a.label}</span>
              <span className="body tight" style={{ fontSize: 11.5 }}>{a.sub}</span>
            </span>
            <button className={'switch' + (p.alerts?.[a.k] ? ' on' : '')} onClick={() => toggleAlert(a.k)}><i /></button>
          </div>
        ))}
      </div>

      <div className="meta" style={{ textAlign: 'center', color: 'var(--faint)', padding: '4px 0 2px' }}>
        Astror · version 1.0 — préférences enregistrées sur cet appareil
      </div>
    </Sheet>
  )
}
