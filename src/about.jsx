import { Sheet } from './ui'
import {
  IcGlobe, IcMail, IcGithub, IcBook, IcRocket, IcAlert,
} from './icons'

const REPO_URL = 'https://github.com/nouhailler/astror'
const DOCS_URL = 'https://nouhailler.github.io/astror/'
const PORTFOLIO_URL = 'https://swinux.ch/applications/'
const WEBSITE_URL = 'https://swinux.ch'
const SUPPORT_EMAIL = 'contact@swinux.ch'

const CREDITS = [
  { name: 'React', role: 'Bibliothèque d’interface utilisateur', url: 'https://react.dev' },
  { name: 'Vite', role: 'Outil de build et serveur de développement', url: 'https://vitejs.dev' },
  { name: 'vite-plugin-pwa / Workbox', role: 'Application web progressive & mise à jour automatique', url: 'https://vite-pwa-org.netlify.app' },
  { name: 'astronomy-engine', role: 'Calculs astronomiques (Lune, Soleil, planètes, événements)', url: 'https://github.com/cosinekitty/astronomy' },
  { name: 'satellite.js', role: 'Calcul des passages de satellites (ISS…) à partir de TLE', url: 'https://github.com/shashwatak/satellite.js' },
]

function diagnostics() {
  let standalone = false
  try { standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true } catch {}
  return [
    `Astror v${__APP_VERSION__}${__GIT_SHA__ ? ` (${__GIT_SHA__})` : ''}`,
    `Build : ${new Date(__BUILD_DATE__).toLocaleString('fr-FR')}`,
    `Mode : ${standalone ? 'application installée (PWA)' : 'navigateur'}`,
    `Plateforme : ${navigator.platform || 'inconnue'} · Langue : ${navigator.language}`,
    `Navigateur : ${navigator.userAgent}`,
  ].join('\n')
}

function supportMailto() {
  const body = `Décrivez votre question ou votre problème ici.\n\n\n---\nInformations de diagnostic (merci de les conserver) :\n${diagnostics()}`
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Support Astror')}&body=${encodeURIComponent(body)}`
}

function issueUrl() {
  const body = `**Décrivez le bug et comment le reproduire**\n\n\n---\n${diagnostics()}`
  return `${REPO_URL}/issues/new?body=${encodeURIComponent(body)}`
}

function Row({ Ic, label, sub, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="press" style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 14,
      textDecoration: 'none', color: 'inherit',
    }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
        <Ic size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="h-card" style={{ fontSize: 14, display: 'block' }}>{label}</span>
        {sub && <span className="meta" style={{ fontSize: 11, display: 'block', marginTop: 1, wordBreak: 'break-all' }}>{sub}</span>}
      </span>
    </a>
  )
}

export default function AboutSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} aria-label="À propos d'Astror">
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
        <img src="/swinux-logo.png" alt="Swinux" width={48} height={48}
          style={{ borderRadius: 12, flexShrink: 0, background: '#fff' }} />
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>À propos</div>
          <div className="h-sec" style={{ fontSize: 23 }}>Astror</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '13px 15px', marginBottom: 20,
        borderRadius: 14, background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="meta">Version</span>
          <span className="data" style={{ color: 'var(--gold)' }}>{__APP_VERSION__}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="meta">Build</span>
          <span className="data">{__GIT_SHA__ || '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="meta">Publié le</span>
          <span className="data">{new Date(__BUILD_DATE__).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 6, letterSpacing: '.14em' }}>Développeur</div>
      <div className="card-2" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '13px 15px', borderBottom: '1px solid var(--line)' }}>
          <div className="h-card" style={{ fontSize: 14, marginBottom: 2 }}>Patrick Nouhailler</div>
          <div className="meta" style={{ fontSize: 11.5 }}>Conception et développement</div>
        </div>
        <Row Ic={IcGlobe} label="swinux.ch" sub="Site & portfolio" href={WEBSITE_URL} />
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <Row Ic={IcRocket} label="Portfolio des applications" sub={PORTFOLIO_URL} href={PORTFOLIO_URL} />
        </div>
      </div>

      <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 6, letterSpacing: '.14em' }}>Support</div>
      <div className="card-2" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <Row Ic={IcMail} label="Contacter le support" sub={SUPPORT_EMAIL} href={supportMailto()} />
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <Row Ic={IcAlert} label="Signaler un bug" sub="Ouvre une issue GitHub pré-remplie" href={issueUrl()} />
        </div>
      </div>
      <p className="body tight" style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: -12, marginBottom: 20, lineHeight: 1.5 }}>
        Les deux liens ci-dessus pré-remplissent automatiquement votre message avec la version, le build,
        l'appareil et le système utilisés — à vous de vérifier puis d'envoyer.
      </p>

      <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 6, letterSpacing: '.14em' }}>Liens</div>
      <div className="card-2" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <Row Ic={IcGithub} label="Dépôt source (GitHub)" sub={REPO_URL} href={REPO_URL} />
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <Row Ic={IcBook} label="Documentation" sub={DOCS_URL} href={DOCS_URL} />
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <Row Ic={IcBook} label="README" sub={`${REPO_URL}#readme`} href={`${REPO_URL}#readme`} />
        </div>
        <div style={{ borderTop: '1px solid var(--line)' }}>
          <Row Ic={IcAlert} label="Signaler un problème" sub="Issues GitHub" href={`${REPO_URL}/issues/new`} />
        </div>
      </div>

      <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 8, letterSpacing: '.14em' }}>Crédits open-source</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {CREDITS.map((c) => (
          <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit', padding: '10px 13px', borderRadius: 12,
              background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
            <div className="h-card" style={{ fontSize: 13, marginBottom: 2 }}>{c.name}</div>
            <div className="meta" style={{ fontSize: 11 }}>{c.role}</div>
          </a>
        ))}
      </div>
    </Sheet>
  )
}
