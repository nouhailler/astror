import { useState } from 'react'
import { IcMegaphone, IcPlay, IcClose } from './icons'

// ─── Annonces ─────────────────────────────────────────────────────────────────
// Messages ponctuels de l'équipe (nouveauté, vidéo, actualité du projet).
// Codées en dur : publier une nouvelle annonce = ajouter une entrée ici puis
// déployer (commit + push → Cloudflare Pages). Chaque annonce n'est montrée qu'une fois
// par appareil ; l'utilisateur voit toujours la plus ancienne non vue, une à la fois.

export const ANNOUNCEMENTS = [
  {
    id: 'yt-presentation-2026-09',
    title: 'Nouveau · Vidéo de présentation',
    body: "Une vidéo YouTube explique en détail le fonctionnement d'Astror : carte du ciel, outils, assistant IA et plus encore.",
    ctaLabel: 'Regarder la vidéo',
    url: 'https://youtu.be/PNfHchBu2v4',
  },
]

// ─── Persistance ──────────────────────────────────────────────────────────────

const ANN_LS = 'astror_announcements_v1'

function loadDismissed() {
  try { return JSON.parse(localStorage.getItem(ANN_LS) || '[]') } catch { return [] }
}
function saveDismissed(ids) {
  try { localStorage.setItem(ANN_LS, JSON.stringify(ids)) } catch {}
}

// ─── Bandeau d'annonce ────────────────────────────────────────────────────────

export function AnnouncementBanner({ style }) {
  const [dismissed, setDismissed] = useState(loadDismissed)
  const ann = ANNOUNCEMENTS.find(a => !dismissed.includes(a.id))
  if (!ann) return null

  const dismiss = () => {
    const next = [...dismissed, ann.id]
    saveDismissed(next)
    setDismissed(next)
  }

  return (
    <div style={{ padding: '4px 18px 8px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px',
        borderRadius: 14, background: 'rgba(126,166,230,.07)', border: '1px solid rgba(126,166,230,.32)' }}>
        <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--blue)', display: 'flex' }}>
          <IcMegaphone size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 3 }}>
            <span className="eyebrow" style={{ fontSize: 10, color: 'var(--blue)' }}>{ann.title}</span>
          </div>
          <p className="body" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'var(--dim)' }}>
            {ann.body}
          </p>
          <a href={ann.url} target="_blank" rel="noopener noreferrer"
            style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--blue)', fontFamily: 'var(--mono)', fontSize: 10.5,
              letterSpacing: '.07em', textTransform: 'uppercase', textDecoration: 'none' }}>
            <IcPlay size={11} /> {ann.ctaLabel}
          </a>
        </div>
        <button onClick={dismiss} aria-label="Masquer cette annonce"
          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, padding: 0,
            border: 0, background: 'none', color: 'var(--faint)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcClose size={14} />
        </button>
      </div>
    </div>
  )
}
