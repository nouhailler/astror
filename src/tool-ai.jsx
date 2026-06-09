import { useState, useRef, useEffect } from 'react'
import { IcSpark, IcSend, IcArrowLeft } from './icons'
import { onbLoad } from './onboarding'
import { callAI } from './claudeApi'

const AI_SUGGEST = [
  'Que puis-je observer ce soir avec un Dobson 200 mm ?',
  'Quels objets sont visibles depuis ma position à 23 h ?',
  "Comment trouver la galaxie d'Andromède ce soir ?",
  "Le ciel est-il bon pour l'astrophoto cette nuit ?",
  'Conseille-moi 3 cibles faciles pour débuter',
]

const AI_FALLBACK = {
  default: "Entrez votre clé API Anthropic dans les Paramètres pour activer l'assistant en temps réel.",
  dobson: "Avec un Dobson 200 mm ce soir, visez d'abord Jupiter (mag −2,4, au méridien vers 23 h) : bandes nuageuses et lunes galiléennes au 150×. Puis M13, l'amas d'Hercule (mag 5,8), résolu jusqu'au cœur. Terminez par M57, la nébuleuse de l'Anneau dans la Lyre, bien placée au zénith. Attendez minuit, après le coucher de la Lune, pour le meilleur contraste.",
  paris: "Depuis Paris à 23 h (Bortle 4), privilégiez les cibles brillantes : Jupiter et Saturne sont hauts, la Lune gibbeuse montre son terminateur. Côté ciel profond, M13, M57 et le Double amas de Persée percent malgré la pollution lumineuse. Évitez les galaxies faibles, trop diluées par les lumières de la ville.",
}

function pickFallback(q) {
  const s = q.toLowerCase()
  if (s.includes('dobson') || s.includes('200')) return AI_FALLBACK.dobson
  if (s.includes('paris') || s.includes('23')) return AI_FALLBACK.paris
  return AI_FALLBACK.default
}

function AiBubble({ m }) {
  const user = m.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {!user && (
        <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginRight: 9, marginTop: 2, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a', background: 'linear-gradient(180deg,var(--gold-2),var(--gold))' }}>
          <IcSpark size={17} />
        </span>
      )}
      <div style={{ maxWidth: '80%', padding: user ? '11px 15px' : '12px 16px',
        borderRadius: user ? '18px 18px 5px 18px' : '5px 18px 18px 18px',
        background: user ? 'linear-gradient(180deg,var(--surface-3),var(--surface-2))' : 'rgba(217,179,108,0.07)',
        border: user ? '1px solid var(--line-2)' : '1px solid var(--gold-line)',
        fontSize: 13.8, lineHeight: 1.56, color: 'var(--text)', fontFamily: user ? 'var(--sans)' : 'var(--serif)' }}>
        {m.loading
          ? <span style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: i * 0.18 + 's' }} />)}</span>
          : m.text}
      </div>
    </div>
  )
}

export default function AiPage({ onBack }) {
  const profile = onbLoad()
  const city = profile.location?.city || 'la France'
  const gear = (profile.gear && profile.gear.length) ? profile.gear.join(', ') : "à l'œil nu et aux jumelles"
  const prime = `Tu es Astror, un assistant expert en astronomie d'observation, intégré à une application mobile. L'utilisateur observe depuis ${city}, son niveau est "${profile.level || 'amateur'}" et son matériel est : ${gear}. Réponds toujours en français, de façon concrète et pratique. Sois précis et concis (4 à 6 phrases), avec des données chiffrées utiles.`

  const [msgs, setMsgs] = useState([{ role: 'bot', text: `Bonsoir. Je connais votre ciel (${city}) et votre matériel — demandez-moi quoi observer ce soir, comment trouver un objet, ou si les conditions sont bonnes.` }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight }, [msgs, busy])

  async function send(text) {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    const next = [...msgs, { role: 'user', text: q }]
    setMsgs([...next, { role: 'bot', loading: true }])
    setBusy(true)
    try {
      const history = next.filter(m => !m.loading).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      const messages = [
        { role: 'user', content: prime },
        { role: 'assistant', content: 'Compris. Je conseille selon le ciel, la position et le matériel.' },
        ...history,
      ]
      const reply = await callAI(messages)
      setMsgs(m => [...m.filter(x => !x.loading), { role: 'bot', text: (reply || '').trim() || '…' }])
    } catch (e) {
      const fb = e.message === 'no-key'
        ? "Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant."
        : pickFallback(q)
      setMsgs(m => [...m.filter(x => !x.loading), { role: 'bot', text: fb }])
    } finally { setBusy(false) }
  }

  return (
    <div className="screen" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div className="tool-head">
        <button className="tool-back press" onClick={onBack} aria-label="Retour"><IcArrowLeft size={19} /></button>
        <div style={{ flex: 1 }}>
          <div className="h-sec" style={{ fontSize: 18 }}>Aide à l'observation</div>
          <div className="meta" style={{ color: 'var(--good)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <span className="dot pulse" style={{ background: 'var(--good)' }} /> IA · {city}
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 18px 8px' }}>
        {msgs.map((m, i) => <AiBubble key={i} m={m} />)}
        {msgs.length <= 1 && (
          <div style={{ marginTop: 8 }}>
            <div className="eyebrow dim" style={{ marginBottom: 10 }}>Suggestions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AI_SUGGEST.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="press" style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 12,
                  background: 'var(--surface-1)', border: '1px solid var(--line-2)', color: 'var(--dim)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--serif)' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px calc(22px + var(--sab))', borderTop: '1px solid var(--line)', background: 'rgba(6,9,18,.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-1)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '5px 5px 5px 16px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Posez votre question…" aria-label="Message à l'assistant"
            style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--sans)' }} />
          <button onClick={() => send()} disabled={busy || !input.trim()} className="press"
            aria-label="Envoyer"
            style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, border: 0,
            cursor: busy || !input.trim() ? 'default' : 'pointer', opacity: busy || !input.trim() ? 0.4 : 1, color: '#1a130a',
            background: 'linear-gradient(180deg,var(--gold-2),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IcSend size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
