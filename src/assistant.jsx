import { useState, useRef, useEffect } from 'react'
import { IcSpark, IcSend } from './icons'
import { SettingsBtn } from './ui'
import { callAI } from './claudeApi'

const PRIME = "Tu es Astror, un assistant expert en astronomie, astrophysique et cosmologie, intégré à une application pour astronomes amateurs confirmés. Réponds toujours en français, de façon précise, rigoureuse et concise (4 à 6 phrases maximum). Emploie des données chiffrées et des termes techniques quand c'est pertinent, sans jargon inutile. Si la question sort de l'astronomie, ramène poliment au sujet."

const CATEGORIES = [
  {
    label: 'Utilisation de Astror',
    questions: [
      "À quoi sert l'onglet Ciel et comment lire la carte du ciel ?",
      "Comment configurer ma position et mon matériel dans Astror ?",
      "Comment fonctionne le journal d'observation et comment l'utiliser ?",
      "Que calcule l'outil Éphémérides et quelles données sont en temps réel ?",
      "Comment prédire un passage de l'ISS au-dessus de chez moi ?",
      "Comment utiliser l'outil Astrophoto pour planifier une session ?",
      "Comment activer les notifications pour les événements célestes ?",
      "Quelle différence entre l'onglet Assistant et l'outil Assistant IA ?",
      "Comment fonctionne le quiz dans l'onglet Apprendre ?",
      "Astror fonctionne-t-il sans connexion internet ?",
    ],
  },
  {
    label: 'Observer',
    questions: [
      'Que puis-je observer ce soir avec un Dobson 200 mm ?',
      'Quels objets sont visibles depuis ma position à 23 h ?',
      "Comment trouver la galaxie d'Andromède ce soir ?",
    ],
  },
  {
    label: 'Instruments',
    questions: [
      "Quelle monture choisir pour débuter l'astrophoto avec un budget de 500 € ?",
      "Quelle est la différence entre un télescope Newton et un Schmidt-Cassegrain ?",
      "Comment collimater un télescope Newton 150/750 ?",
    ],
  },
  {
    label: 'Astrophoto',
    questions: [
      "Le ciel est-il bon pour l'astrophoto cette nuit ?",
      "Quel temps de pose pour M42 avec un APS-C à f/5 ?",
      "Comment réduire le bruit de fond sur une photo de nébuleuse ?",
    ],
  },
  {
    label: 'Système solaire',
    questions: [
      "Quand Saturne sera-t-il en opposition cette année ?",
      "Quelle est la meilleure période pour observer Mars ?",
      "Comment distinguer une comète d'un astéroïde au télescope ?",
    ],
  },
  {
    label: 'Ciel profond',
    questions: [
      "Conseille-moi 3 cibles faciles pour débuter l'observation du ciel profond.",
      "Quelle est la différence entre un amas ouvert et un amas globulaire ?",
      "Quelles nébuleuses sont visibles à l'œil nu depuis une zone Bortle 4 ?",
    ],
  },
  {
    label: 'Astrophysique',
    questions: [
      "Comment se forme un trou noir stellaire ?",
      "Quelle est la différence entre une naine blanche et une étoile à neutrons ?",
      "Pourquoi les étoiles massives vivent-elles moins longtemps que les naines rouges ?",
    ],
  },
  {
    label: 'Cosmologie',
    questions: [
      "Qu'est-ce que la matière noire et comment sait-on qu'elle existe ?",
      "Quelle est la différence entre le Big Bang et l'inflation cosmique ?",
      "Comment JWST observe-t-il les premières galaxies de l'univers ?",
    ],
  },
  {
    label: 'Conquête spatiale',
    questions: [
      "Quelles sont les prochaines missions habitées vers la Lune ?",
      "Comment fonctionne la vie à bord de l'ISS ?",
      "Quelles sont les avancées récentes du programme Artemis de la NASA ?",
    ],
  },
  {
    label: 'Agences spatiales',
    questions: [
      "Quelle est la différence entre la NASA, l'ESA et Roscosmos en termes de missions ?",
      "Quelles missions l'ESA prépare-t-elle pour 2025–2030 ?",
      "Comment SpaceX a-t-il changé l'industrie spatiale depuis 2015 ?",
    ],
  },
  {
    label: 'Fusées & lanceurs',
    questions: [
      "Quelle est la différence entre Ariane 6 et le Falcon 9 de SpaceX ?",
      "Comment fonctionne le système de récupération des premiers étages de fusée ?",
      "Quels sont les lanceurs capables d'atteindre la Lune aujourd'hui ?",
    ],
  },
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
  const [activeCat, setActiveCat] = useState('Utilisation de Astror')
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
      const reply = await callAI(messages)
      setMsgs(m => [...m.filter(x => !x.loading), { role: 'bot', text: (reply || '').trim() || '…' }])
    } catch (e) {
      const msg = e.message === 'no-key'
        ? "Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant."
        : "Erreur de connexion. Vérifiez votre clé API dans les Paramètres."
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

      {/* Panel suggestions — hors de la zone de scroll, toujours visible en haut */}
      {msgs.length <= 1 && (
        <div style={{ flexShrink: 0, overflowY: 'auto', maxHeight: '55vh',
          padding: '12px 18px 10px', borderBottom: '1px solid var(--line)' }}>
          <div className="meta" style={{ marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.12em' }}>Suggestions</div>
          {/* Chips catégories */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setActiveCat(c.label)}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
                  fontFamily: 'var(--mono)', letterSpacing: '.04em',
                  background: activeCat === c.label ? 'var(--gold-soft)' : 'var(--surface-1)',
                  border: '1px solid ' + (activeCat === c.label ? 'var(--gold-line)' : 'var(--line)'),
                  color: activeCat === c.label ? 'var(--gold)' : 'var(--faint)' }}>
                {c.label}
              </button>
            ))}
          </div>
          {/* Questions de la catégorie active */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(CATEGORIES.find(c => c.label === activeCat)?.questions ?? []).map(s => (
              <button key={s} className="press" onClick={() => send(s)} style={{ textAlign: 'left',
                padding: '11px 14px', borderRadius: 13, cursor: 'pointer', fontSize: 13,
                color: 'var(--dim)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line-2)',
                fontFamily: 'var(--serif)' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {msgs.length > 1 && (
        <div ref={scrollRef} className="screen" style={{ flex: 1, padding: '16px 18px 8px' }}>
          {msgs.map((m, i) => <Bubble key={i} m={m} />)}
        </div>
      )}
      {msgs.length <= 1 && <div ref={scrollRef} style={{ flex: 1 }} />}

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
