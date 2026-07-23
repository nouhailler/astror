import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { IcChevron, IcSliders, IcClose, IcCheck, IcSpark } from './icons'
import { callAI, getOpenRouterKey, getSelectedModel, getApiKey } from './claudeApi'

export function ScreenHeader({ eyebrow, title, right }) {
  return (
    <div style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'flex-end',
                  justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
        <div className="h-screen">{title}</div>
      </div>
      {right}
    </div>
  )
}

export function IconBtn({ children, onClick, badge, demoId }) {
  return (
    <button onClick={onClick} className="press" data-demo-id={demoId} style={{
      position: 'relative', width: 40, height: 40, flexShrink: 0,
      borderRadius: 999, border: '1px solid var(--line-2)',
      background: 'rgba(255,255,255,0.03)', color: 'var(--dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>
      {children}
      {badge && <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7,
        borderRadius: 999, background: 'var(--gold)', boxShadow: '0 0 0 2px var(--surface-1)' }} />}
    </button>
  )
}

export function SettingsBtn() {
  return (
    <IconBtn onClick={() => window.openAstrorSettings && window.openAstrorSettings()}
      demoId="settings-btn">
      <IcSliders size={18} />
    </IconBtn>
  )
}

export function HeaderTools({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
}

export function ChipRow({ items, value, onChange, style, demoIdPrefix }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 18px 2px',
                  scrollbarWidth: 'none', ...style }}>
      {items.map((it) => {
        const key = typeof it === 'string' ? it : it.key
        const label = typeof it === 'string' ? it : it.label
        return (
          <button key={key} className={'chip' + (value === key ? ' on' : '')}
                  data-demo-id={demoIdPrefix ? `${demoIdPrefix}-${key}` : undefined}
                  onClick={() => onChange(key)}>{label}</button>
        )
      })}
    </div>
  )
}

export function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  margin: '26px 0 12px' }}>
      <div className="h-sec">{children}</div>
      {action && (onAction
        ? <button onClick={onAction} style={{ background: 'none', border: 0, cursor: 'pointer',
            color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em',
            textTransform: 'uppercase' }}>{action}</button>
        : <span style={{ color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '.08em' }}>{action}</span>
      )}
    </div>
  )
}

export function Stat({ label, value, unit, sub }) {
  return (
    <div>
      <div className="meta" style={{ marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.12em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="data" style={{ fontSize: 21, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
        {unit && <span className="data" style={{ fontSize: 12, color: 'var(--faint)' }}>{unit}</span>}
      </div>
      {sub && <div className="meta" style={{ marginTop: 3, color: 'var(--gold)' }}>{sub}</div>}
    </div>
  )
}

export function DataRow({ k, v, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 13, color: 'var(--dim)' }}>{k}</span>
      <span className="data" style={{ fontSize: 13.5, color: accent ? 'var(--gold)' : 'var(--text)',
        fontWeight: 500 }}>{v}</span>
    </div>
  )
}

export function LinkRow({ icon, title, sub, right, tag, onClick }) {
  return (
    <button onClick={onClick} className="press" style={{ width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px',
      background: 'none', border: 0, borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
      {icon && <span style={{ color: 'var(--gold)', flexShrink: 0, display: 'flex' }}>{icon}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="h-card" style={{ fontSize: 14.5 }}>{title}</span>
          {tag}
        </span>
        {sub && <span style={{ display: 'block', fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{sub}</span>}
      </span>
      {right || <IcChevron size={17} className="arrow" />}
    </button>
  )
}

export function Sheet({ open, onClose, children, 'aria-label': ariaLabel }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div className="sheet-grip" />
        <button onClick={onClose} aria-label="Fermer" style={{ position: 'absolute', top: 14, right: 16,
          width: 32, height: 32, borderRadius: 999, border: '1px solid var(--line-2)',
          background: 'rgba(255,255,255,.03)', color: 'var(--dim)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IcClose size={16} />
        </button>
        <div className="sheet-scroll">{children}</div>
      </div>
    </>
  )
}

export function Bar({ pct }) {
  return <div className="bar"><i style={{ width: Math.max(0, Math.min(100, pct)) + '%' }} /></div>
}

export function Eyebrow({ children, dim }) {
  return <div className={'eyebrow' + (dim ? ' dim' : '')}>{children}</div>
}

export function useCountdown(targetISO) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30)
    return () => clearInterval(t)
  }, [])
  const diff = new Date(targetISO).getTime() - now
  if (diff <= 0) return 'en cours'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d}j ${String(h).padStart(2, '0')}h`
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

const AI_CACHE_LS = 'astror_ai_cache_v1'

export function loadAiCache(key) {
  try { return JSON.parse(localStorage.getItem(AI_CACHE_LS) || '{}')[key]?.text ?? null } catch { return null }
}
export function saveAiCache(key, text) {
  try {
    const d = JSON.parse(localStorage.getItem(AI_CACHE_LS) || '{}')
    d[key] = { text, ts: Date.now() }
    localStorage.setItem(AI_CACHE_LS, JSON.stringify(d))
  } catch {}
}
export function clearAiCache(key) {
  try {
    const d = JSON.parse(localStorage.getItem(AI_CACHE_LS) || '{}')
    delete d[key]
    localStorage.setItem(AI_CACHE_LS, JSON.stringify(d))
  } catch {}
}

export function AiInfoPanel({ buildPrompt, cacheKey, label = 'Analyse IA', style: outerStyle }) {
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState(() => cacheKey ? loadAiCache(cacheKey) : null)
  const aiConnected = !!(getOpenRouterKey() && getSelectedModel()) || !!getApiKey()

  const doFetch = async () => {
    setInfo('loading')
    try {
      const prompt = typeof buildPrompt === 'function' ? buildPrompt() : buildPrompt
      const reply = await callAI([{ role: 'user', content: prompt }])
      const text = reply.trim()
      if (cacheKey) saveAiCache(cacheKey, text)
      setInfo(text)
    } catch {
      setInfo('Erreur de connexion. Réessayez.')
    }
  }

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && aiConnected && info == null) await doFetch()
  }

  const refresh = async (e) => {
    e.stopPropagation()
    if (cacheKey) clearAiCache(cacheKey)
    await doFetch()
  }

  const hasCached = info != null && info !== 'loading'

  return (
    <div style={outerStyle}>
      <button onClick={toggle} className="press" style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 11px 4px 9px', borderRadius: 99, cursor: 'pointer',
        background: open ? 'rgba(217,179,108,.14)' : 'rgba(217,179,108,.07)',
        border: `1px solid ${open ? 'var(--gold-line)' : 'rgba(217,179,108,.18)'}`,
        color: 'var(--gold)', fontSize: 11.5, fontFamily: 'var(--mono)',
        textTransform: 'uppercase', letterSpacing: '.07em',
      }}>
        <IcSpark size={12} />{label}
        {hasCached && !open && <span style={{ marginLeft: 2, fontSize: 9, opacity: 0.55 }}>✓</span>}
      </button>
      {open && (
        <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 13,
          background: 'rgba(217,179,108,.04)', border: '1px solid var(--gold-line)' }}>
          {!aiConnected ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <IcSpark size={14} style={{ color: 'var(--faint)', flexShrink: 0, marginTop: 2, opacity: 0.5 }} />
              <span className="body tight" style={{ fontSize: 12.5, color: 'var(--faint)', lineHeight: 1.5 }}>
                Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'analyse.
              </span>
            </div>
          ) : info === 'loading' ? (
            <div style={{ display: 'flex', gap: 5, padding: '2px 0' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
                  animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <IcSpark size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 3 }} />
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--dim)',
                  fontFamily: 'var(--serif)' }}>{info}</p>
              </div>
              <button onClick={refresh} style={{ marginTop: 10, fontSize: 11, color: 'var(--faint)',
                background: 'none', border: 0, cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)',
                textTransform: 'uppercase', letterSpacing: '.06em' }}>
                ↻ Regénérer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Fiche Wikipédia : résumé + image + panel IA (portal au-dessus des sheets)
export function WikiSummarySheet({ wikiPage, label, open, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!open) { fetched.current = false; setData(null); return }
    if (!wikiPage || fetched.current) return
    fetched.current = true
    setLoading(true)
    fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => {
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`)
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(d => { setData(d); setLoading(false) })
          .catch(() => setLoading(false))
      })
  }, [open, wikiPage])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const root = document.getElementById('root')
  if (!root) return null

  return createPortal(
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label || wikiPage}>
        <div className="sheet-grip" />
        <button onClick={onClose} aria-label="Fermer"
          style={{ position:'absolute', top:14, right:16, width:32, height:32, borderRadius:999,
            border:'1px solid var(--line-2)', background:'rgba(255,255,255,.03)', color:'var(--dim)',
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <IcClose size={16} />
        </button>
        <div className="sheet-scroll">
          <div style={{ padding:'0 0 24px' }}>
            {loading && (
              <div style={{ display:'flex', justifyContent:'center', padding:'36px 0' }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--faint)',
                      animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*0.18}s` }} />
                  ))}
                </div>
              </div>
            )}
            {data && (
              <>
                {data.thumbnail?.source && (
                  <img src={data.thumbnail.source} alt={data.title}
                    style={{ width:'100%', maxHeight:220, objectFit:'cover', borderRadius:14, marginBottom:16, display:'block' }} />
                )}
                <div style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)', color:'var(--text)', marginBottom:5 }}>
                  {data.title}
                </div>
                {data.description && (
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--gold)', marginBottom:13, letterSpacing:'.03em' }}>
                    {data.description}
                  </div>
                )}
                {data.extract && (
                  <p className="body serif-body" style={{ fontSize:13.5, lineHeight:1.72, color:'var(--dim)', margin:'0 0 18px' }}>
                    {data.extract}
                  </p>
                )}
                <AiInfoPanel
                  cacheKey={`wiki_${wikiPage}`}
                  buildPrompt={`Donne-moi 3 faits fascinants et peu connus sur : ${data.title}. ${data.description ? 'Contexte : ' + data.description : ''}`}
                />
                {data.content_urls?.desktop?.page && (
                  <a href={data.content_urls.desktop.page} target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-block', marginTop:16, fontSize:12, fontFamily:'var(--mono)',
                      color:'var(--gold)', textDecoration:'none', borderBottom:'1px solid var(--gold)', paddingBottom:2 }}>
                    Lire l&apos;article complet sur Wikipédia →
                  </a>
                )}
              </>
            )}
            {!loading && !data && (
              <div style={{ textAlign:'center', padding:'36px 0', color:'var(--faint)', fontSize:13 }}>
                Article non disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    root
  )
}
