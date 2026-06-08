import { useState, useEffect, useRef, useMemo } from 'react'
import { IcChevron, IcSliders, IcClose, IcCheck } from './icons'

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

export function IconBtn({ children, onClick, badge }) {
  return (
    <button onClick={onClick} className="press" style={{
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
    <IconBtn onClick={() => window.openAstrorSettings && window.openAstrorSettings()}>
      <IcSliders size={18} />
    </IconBtn>
  )
}

export function HeaderTools({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
}

export function ChipRow({ items, value, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 18px 2px',
                  scrollbarWidth: 'none', ...style }}>
      {items.map((it) => {
        const key = typeof it === 'string' ? it : it.key
        const label = typeof it === 'string' ? it : it.label
        return (
          <button key={key} className={'chip' + (value === key ? ' on' : '')}
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
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 0, cursor: 'pointer',
          color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em',
          textTransform: 'uppercase' }}>{action}</button>
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

export function Sheet({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog">
        <div className="sheet-grip" />
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
