import { useState } from 'react'
import { IcPin, IcStar, IcSpark, IcChevron, IcCheck } from './icons'
import { Sheet } from './ui'
import {
  ONB_LEVELS, ONB_LOCATIONS, ONB_LOCATION_COORDS, ONB_INTERESTS, ONB_GEAR, ONB_ALERTS, DEFAULT_PROFILE
} from './onboarding'
import {
  getApiKey, saveApiKey, testApiKey,
  getOpenRouterKey, saveOpenRouterKey, fetchFreeModels, getSelectedModel, saveSelectedModel,
} from './claudeApi'

function SettingsSection({ label }) {
  return (
    <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 11, letterSpacing: '.16em' }}>{label}</div>
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
      display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
      borderRadius: 12, cursor: state === 'loading' ? 'default' : 'pointer',
      background: 'linear-gradient(180deg, rgba(217,179,108,.10), rgba(217,179,108,.04))',
      border: '1px solid var(--gold-line)', opacity: state === 'loading' ? 0.7 : 1,
      fontSize: 12.5, color: 'var(--gold)', fontFamily: 'var(--sans)',
    }}>
      <IcPin size={14} />
      {state === 'loading' ? 'Détection…' : state === 'done' ? 'Détecté ✓' : 'GPS'}
    </button>
  )
}

function OpenRouterSection() {
  const [key, setKey] = useState(() => getOpenRouterKey())
  const [models, setModels] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(() => getSelectedModel())
  const [status, setStatus] = useState('')

  const load = async () => {
    if (!key.trim()) return
    saveOpenRouterKey(key)
    setLoading(true)
    setStatus('')
    try {
      const list = await fetchFreeModels(key.trim())
      setModels(list)
      setStatus('ok')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const pick = (modelId) => {
    setSelected(modelId)
    saveSelectedModel(modelId)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <SettingsSection label="Assistant IA · OpenRouter (prioritaire)" />
      <div style={{ marginBottom: 8 }}>
        <input
          type="password"
          className="input"
          placeholder="sk-or-v1-…"
          value={key}
          onChange={e => { setKey(e.target.value); setStatus('') }}
          aria-label="Clé API OpenRouter"
        />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button className="chip" style={{ height: 34, fontSize: 12.5 }} onClick={load}
          disabled={!key.trim() || loading}>
          {loading ? 'Chargement…' : 'Modèles gratuits'}
        </button>
        {status === 'ok' && <span style={{ fontSize: 12, color: 'var(--good)' }}>✓ {models?.length} modèles</span>}
        {status === 'error' && <span style={{ fontSize: 12, color: 'var(--bad)' }}>Clé invalide</span>}
      </div>

      {selected && (
        <div style={{ marginBottom: 10, padding: '8px 13px', borderRadius: 11,
          background: 'rgba(126,166,230,.08)', border: '1px solid rgba(126,166,230,.25)' }}>
          <div className="meta" style={{ fontSize: 11, marginBottom: 2 }}>Modèle actif</div>
          <div style={{ fontSize: 12.5, color: 'var(--blue)', fontFamily: 'var(--sans)', wordBreak: 'break-all' }}>{selected}</div>
        </div>
      )}

      {models && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7,
          maxHeight: 280, overflowY: 'auto', paddingRight: 2 }}>
          {models.map(m => {
            const active = selected === m.id
            const ctxK = m.context >= 1000 ? `${Math.round(m.context / 1000)}k` : String(m.context)
            return (
              <button key={m.id} onClick={() => pick(m.id)} className="press"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
                  borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                  background: active ? 'rgba(126,166,230,.12)' : 'var(--surface-1)',
                  border: `1px solid ${active ? 'rgba(126,166,230,.4)' : 'var(--line)'}` }}>
                <span style={{ width: 16, flexShrink: 0, color: 'var(--blue)' }}>
                  {active && <IcCheck size={14} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="h-card" style={{ fontSize: 13, display: 'block' }}>{m.name}</span>
                  <span className="meta" style={{ fontSize: 11 }}>ctx {ctxK}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="body tight" style={{ fontSize: 11.5, marginTop: 10, color: 'var(--faint)', lineHeight: 1.5 }}>
        Accès à des dizaines de modèles IA gratuits via openrouter.ai. Prioritaire sur la clé Anthropic.
      </div>
    </div>
  )
}

function ApiKeySection() {
  const [key, setKey] = useState(() => getApiKey())
  const [status, setStatus] = useState('')

  const save = () => { saveApiKey(key); setStatus('saved') }
  const test = async () => {
    if (!key.trim()) return
    setStatus('testing')
    try {
      await testApiKey(key.trim())
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <SettingsSection label="Assistant IA · Clé API" />
      <div style={{ marginBottom: 8 }}>
        <input
          type="password"
          className="input"
          placeholder="sk-ant-api03-…"
          value={key}
          onChange={e => { setKey(e.target.value); setStatus('') }}
          aria-label="Clé API Anthropic"
        />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="chip" style={{ height: 34, fontSize: 12.5 }} onClick={save}>Enregistrer</button>
        <button className="chip" style={{ height: 34, fontSize: 12.5 }} onClick={test}
          disabled={!key.trim() || status === 'testing'}>
          {status === 'testing' ? 'Test…' : 'Tester'}
        </button>
        {status === 'ok' && <span style={{ fontSize: 12, color: 'var(--good)' }}>✓ Clé valide</span>}
        {status === 'error' && <span style={{ fontSize: 12, color: 'var(--bad)' }}>Clé invalide</span>}
        {status === 'saved' && <span style={{ fontSize: 12, color: 'var(--good)' }}>Enregistrée</span>}
      </div>
      <div className="body tight" style={{ fontSize: 11.5, marginTop: 9, color: 'var(--faint)', lineHeight: 1.5 }}>
        Clé API Anthropic pour l'assistant IA. Stockée sur cet appareil uniquement.
      </div>
    </div>
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
  const currentCity = p.location?.city || ''

  return (
    <Sheet open={open} onClose={onClose} aria-label="Paramètres">
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
            <IcPin size={12} /> {currentCity || 'Paris'}
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
            onClick={() => update({ level: lv.k })} aria-pressed={p.level === lv.k}>{lv.k}</button>
        ))}
      </div>

      <SettingsSection label="Localisation" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        {ONB_LOCATIONS.map(city => {
          const coords = ONB_LOCATION_COORDS[city]
          return (
            <button key={city} className={'chip' + (currentCity === city ? ' on' : '')} style={{ height: 38 }}
              onClick={() => update({ location: { city, ...coords } })}
              aria-pressed={currentCity === city}>{city}</button>
          )
        })}
        {currentCity && !ONB_LOCATIONS.includes(currentCity) && (
          <button className="chip on" style={{ height: 38 }} aria-pressed={true}>{currentCity}</button>
        )}
      </div>
      <div style={{ marginBottom: 24 }}>
        <GeolocButton onDetected={loc => update({ location: loc })} />
      </div>

      <SettingsSection label="Centres d'intérêt" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_INTERESTS.map(it => (
          <button key={it} className={'chip' + (p.interests.includes(it) ? ' on' : '')} style={{ height: 38 }}
            onClick={() => toggleArr('interests', it)} aria-pressed={p.interests.includes(it)}>
            {p.interests.includes(it) && <IcCheck size={13} />} {it}
          </button>
        ))}
      </div>

      <SettingsSection label="Matériel" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {ONB_GEAR.map(g => (
          <button key={g.k} className={'chip' + (p.gear.includes(g.k) ? ' on' : '')} style={{ height: 38 }}
            onClick={() => toggleArr('gear', g.k)} aria-pressed={p.gear.includes(g.k)}>
            {p.gear.includes(g.k) && <IcCheck size={13} />} {g.k}
          </button>
        ))}
      </div>

      <SettingsSection label="Alertes" />
      <div className="card-2" style={{ overflow: 'hidden', marginBottom: 26 }}>
        {ONB_ALERTS.map((a, i) => (
          <div key={a.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
            borderBottom: i < ONB_ALERTS.length - 1 ? '1px solid var(--line)' : 0 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="h-card" style={{ fontSize: 14, display: 'block' }}>{a.label}</span>
              <span className="body tight" style={{ fontSize: 11.5 }}>{a.sub}</span>
            </span>
            <button className={'switch' + (p.alerts?.[a.k] ? ' on' : '')}
              onClick={() => toggleAlert(a.k)}
              aria-pressed={!!p.alerts?.[a.k]}
              aria-label={a.label}><i /></button>
          </div>
        ))}
      </div>

      <OpenRouterSection />

      <ApiKeySection />

      <div className="meta" style={{ textAlign: 'center', color: 'var(--faint)', padding: '4px 0 2px' }}>
        Astror · version 1.0 — préférences enregistrées sur cet appareil
      </div>
    </Sheet>
  )
}
