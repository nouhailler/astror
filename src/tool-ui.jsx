import { IcArrowLeft } from './icons'

export function ToolPage({ title, onBack, children }) {
  return (
    <div className="screen pad-b">
      <div className="tool-head">
        <button className="tool-back press" onClick={onBack}><IcArrowLeft size={19} /></button>
        <div className="h-sec" style={{ fontSize: 19 }}>{title}</div>
      </div>
      <div style={{ padding: '6px 0 0' }}>{children}</div>
    </div>
  )
}

export function ToolHero({ eyebrow, title, sub }) {
  return (
    <div className="pad" style={{ padding: '16px 18px 6px' }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
      <div className="h-screen" style={{ fontSize: 29, marginBottom: sub ? 9 : 0 }}>{title}</div>
      {sub && <p className="body" style={{ fontSize: 13.5, maxWidth: 330 }}>{sub}</p>}
    </div>
  )
}

export function ToolSection({ title, action, onAction, children, style }) {
  return (
    <div className="pad" style={style}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '24px 0 12px' }}>
        <div className="h-sec" style={{ fontSize: 18 }}>{title}</div>
        {action && <button onClick={onAction} style={{ background: 'none', border: 0, cursor: 'pointer',
          color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>{action}</button>}
      </div>
      {children}
    </div>
  )
}

export function ToolSeg({ items, value, onChange }) {
  return (
    <div className="pad" style={{ padding: '2px 18px 2px' }}>
      <div className="seg-row">
        {items.map(it => {
          const k = typeof it === 'string' ? it : it.key
          const l = typeof it === 'string' ? it : it.label
          return <button key={k} className={'chip' + (value === k ? ' on' : '')} onClick={() => onChange(k)}>{l}</button>
        })}
      </div>
    </div>
  )
}

export function Metric({ k, v, u, sub, accent }) {
  return (
    <div className="metric">
      <div className="m-k">{k}</div>
      <div className="m-v" style={accent ? { color: 'var(--gold)' } : null}>{v}{u && <span className="u">{u}</span>}</div>
      {sub && <div className="m-sub">{sub}</div>}
    </div>
  )
}

export function MetricGrid({ cols = 2, children, style }) {
  return <div className="metric-grid pad" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, ...style }}>{children}</div>
}

export function ToolRow({ icon, title, sub, right, tag, onClick, last }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={onClick ? 'press' : ''} style={{ width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', cursor: onClick ? 'pointer' : 'default',
      background: 'none', border: 0, borderBottom: last ? 0 : '1px solid var(--line)' }}>
      {icon && <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)',
        border: '1px solid var(--gold-line)' }}>{icon}</span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="h-card" style={{ fontSize: 14.5 }}>{title}</span>
          {tag}
        </span>
        {sub && <span className="body tight" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{sub}</span>}
      </span>
      {right}
    </Tag>
  )
}
