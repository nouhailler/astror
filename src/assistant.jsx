import { useState, useRef, useEffect } from 'react'
import { IcSpark, IcSend } from './icons'
import { SettingsBtn } from './ui'
import { callClaude, getApiKey } from './claudeApi'

const PRIME = "Tu es Astror, un assistant expert en astronomie, astrophysique et cosmologie, intégré à une application pour astronomes amateurs confirmés. Réponds toujours en français, de façon précise, rigoureuse et concise (4 à 6 phrases maximum). Emploie des données chiffrées et des termes techniques quand c'est pertinent, sans jargon inutile. Si la question sort de l'astronomie, ramène poliment au sujet."

const SUGGESTIONS = [
  'Comment observer Saturne ce soir ?',
  'Explique la tension de Hubble simplement',
  'Quelle est la différence entre matière et énergie noire ?',
  "Pourquoi le ciel profond demande-t-il l'obscurité ?",
  'Conseille-moi un télescope pour les nébuleuses',
]

function Typing() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
          animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  )
}

function Bubble({ m }) {
  const user = m.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: user ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {!user && (
        <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginRight: 9, marginTop: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(180deg,var(--gold-2),var(--gold))' }}>
          <IcSpark size={17} />
        </span>
      )}
      <div style={{ maxWidth: '78%', padding: user ? '11px 15px' : '12px 16px',
        borderRadius: user ? '18px 18px 5px 18px' : '5px 18px 18px 18px',
        background: user ? 'linear-gradient(180deg,var(--surface-3),var(--surface-2))' : 'rgba(217,179,108,0.07)',
        border: user ? '1px solid var(--line-2)' : '1px solid var(--gold-line)',
        fontSize: 13.8, lineHeight: 1.56, color: 'var(--text)',
        fontFamily: user ? 'var(--sans)' : 'var(--serif)' }}>
        {m.loading ? <Typing /> : m.text}
      </div>
    </div>
  )
}

export default function AssistantScreen() {
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: "Bonsoir. Je suis votre assistant astronomique. Posez-moi une question sur le ciel de ce soir, une théorie, un objet à observer ou votre matériel." },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, busy])

  async function send(text) {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    const next = [...msgs, { role: 'user', text: q }]
    setMsgs([...next, { role: 'bot', loading: true }])
    setBusy(true)
    try {
      const history = next.filter(m => !m.loading).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant', content: m.text,
      }))
      const messages = [
        { role: 'user', content: PRIME },
        { role: 'assistant', content: 'Compris. Je suis prêt à répondre en expert.' },
        ...history,
      ]
      const reply = await callClaude(messages, getApiKey())
      setMsgs(m => [...m.filter(x => !x.loading), { role: 'bot', text: (reply || '').trim() || '…' }])
    } catch (e) {
      const msg = e.message === 'no-key'
        ? "Entrez votre clé API Anthropic dans les Paramètres pour activer l'assistant."
        : "Erreur de connexion à l'assistant. Vérifiez votre clé API dans les Paramètres."
      setMsgs(m => [...m.filter(x => !x.loading), { role: 'bot', text: msg }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#1a130a',
          background: 'linear-gradient(180deg,var(--gold-2),var(--gold))',
          boxShadow: '0 0 24px rgba(217,179,108,.35)' }}><IcSpark size={22} /></span>
        <div style={{ flex: 1 }}>
          <div className="h-sec" style={{ fontSize: 19 }}>Assistant Astror</div>
          <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, whiteSpace: 'nowrap' }}>
            <span className="dot pulse" style={{ background: 'var(--good)' }} /> Expert astronomie · en ligne
          </div>
        </div>
        <SettingsBtn />
      </div>
      <hr className="hair" />

      <div ref={scrollRef} className="screen" style={{ flex: 1, padding: '16px 18px 8px' }}>
        {msgs.map((m, i) => <Bubble key={i} m={m} />)}
        {msgs.length <= 1 && (
          <div style={{ marginTop: 8 }}>
            <div className="meta" style={{ marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.12em' }}>Suggestions</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="press" onClick={() => send(s)} style={{ textAlign: 'left',
                  padding: '10px 14px', borderRadius: 13, cursor: 'pointer', fontSize: 12.8, color: 'var(--dim)',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line-2)',
                  fontFamily: 'var(--serif)' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px calc(14px + var(--sab))', borderTop: '1px solid var(--line)',
        background: 'linear-gradient(180deg, rgba(8,12,24,0), rgba(8,12,24,.6))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)',
          border: '1px solid var(--line-2)', borderRadius: 999, padding: '6px 6px 6px 18px' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Posez votre question…" aria-label="Message à l'assistant"
            style={{ flex: 1, background: 'none', border: 0, outline: 'none',
              color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: 14 }} />
          <button onClick={() => send()} disabled={busy} className="press"
            aria-label="Envoyer"
            style={{ width: 40, height: 40, flexShrink: 0,
            borderRadius: '50%', border: 0, cursor: busy ? 'default' : 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#1a130a', opacity: busy ? 0.5 : 1,
            background: 'linear-gradient(180deg,var(--gold-2),var(--gold))' }}>
            <IcSend size={19} />
          </button>
        </div>
      </div>
    </div>
  )
}
