import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { IcSky, IcMoon, IcGlobe, IcBell, IcWrench, IcSpark } from './icons'
import { TopBar, HelpSheet, DemoSheet } from './help'
import SettingsSheet from './settings'
import NavMenuSheet from './navmenu'
import Onboarding, { onbWasSeen, onbMarkSeen, onbLoad, onbSave } from './onboarding'
import SkyScreen from './sky' // onglet par défaut : chargé d'emblée
import { registerDemoHost } from './demo/bridge'
import { startDemo, getDemoParam } from './demo'
import './app.css'

// Autres onglets chargés à la demande (code-splitting)
const EphScreen       = lazy(() => import('./ephemerides'))
const ExploreScreen   = lazy(() => import('./explore'))
const FeedScreen      = lazy(() => import('./feed'))
const OutilsScreen    = lazy(() => import('./tools'))
const AssistantScreen = lazy(() => import('./assistant'))

function ScreenLoader() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
          animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  )
}

const TABS = [
  { key: 'sky', label: 'Ciel', Ic: IcSky },
  { key: 'eph', label: 'Éphém.', Ic: IcMoon },
  { key: 'explore', label: 'Explorer', Ic: IcGlobe },
  { key: 'feed', label: 'Veille', Ic: IcBell },
  { key: 'tools', label: 'Outils', Ic: IcWrench },
  { key: 'ai', label: 'Assistant', Ic: IcSpark },
]

const HELP_KEYS = { sky: 'sky', eph: 'eph', explore: 'explore', feed: 'feed', tools: 'tools', ai: 'ai' }

function TabBar({ tab, onChange }) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="Navigation principale">
      {TABS.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          data-demo-id={`tab-${t.key}`}
          className={'tab-btn' + (tab === t.key ? ' active' : '')}
          role="tab" aria-selected={tab === t.key} aria-label={t.label}>
          <t.Ic size={22} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  const demoParam = getDemoParam()  // ?demo=<scénario> : mode démo au chargement
  const [onboarded, setOnboarded] = useState(() => onbWasSeen() || !!demoParam)
  const [tab, setTab] = useState('sky')
  const [helpKey, setHelpKey] = useState(null)
  const [demoKey, setDemoKey] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState(() => onbLoad())
  const [toolDeepLink, setToolDeepLink] = useState(null)
  const [exploreDeepLink, setExploreDeepLink] = useState(null)
  const [feedDeepLink, setFeedDeepLink] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleProfileChange = (p) => { setProfile(p); onbSave(p) }

  // Navigation depuis le menu hamburger (toutes les fonctionnalités par catégorie).
  const handleMenuNavigate = (nav) => {
    if (nav.settings) { setSettingsOpen(true); return }
    setTab(nav.tab)
    if (nav.tool) setToolDeepLink(nav.tool)
    if (nav.sub === undefined) return
    if (nav.tab === 'explore') setExploreDeepLink(nav.sub)
    if (nav.tab === 'feed') setFeedDeepLink(nav.sub)
  }

  // Onglet courant exposé au moteur démo sans re-souscription à chaque changement.
  const tabRef = useRef(tab)
  tabRef.current = tab

  // Hôte de navigation du mode démo (bridge). Enregistré une seule fois.
  useEffect(() => {
    return registerDemoHost({
      navigate: ({ tab: t, tool }) => {
        if (tool) { setTab('tools'); setToolDeepLink(tool) }
        else if (t) setTab(t)
      },
      getTab: () => tabRef.current,
      openSettings: () => setSettingsOpen(true),
    })
  }, [])

  // Démarrage automatique via ?demo=<scénario>.
  useEffect(() => {
    if (demoParam) startDemo(demoParam)
  }, [demoParam])

  useEffect(() => {
    window.openAstrorSettings = () => setSettingsOpen(true)
    window.openAstrorTool = (key) => { setTab('tools'); setToolDeepLink(key) }
    window.openAstrorDemo = (key) => setDemoKey(key)
    return () => { delete window.openAstrorSettings; delete window.openAstrorTool; delete window.openAstrorDemo }
  }, [])

  if (!onboarded) {
    return (
      <Onboarding
        initial={profile}
        onFinish={(p) => { onbSave(p); setProfile(p); onbMarkSeen(); setOnboarded(true) }}
        onSkip={() => { onbMarkSeen(); setOnboarded(true) }}
      />
    )
  }

  return (
    <div className="app-root">
      <div className="safe-top" />
      <TopBar onMenu={() => setMenuOpen(true)} onHelp={() => setHelpKey(HELP_KEYS[tab])} onDemo={() => setDemoKey(HELP_KEYS[tab])} onHome={() => setTab('sky')} />
      <div className="screen-area">
        <Suspense fallback={<ScreenLoader />}>
          {tab === 'sky' && <SkyScreen />}
          {tab === 'eph' && <EphScreen />}
          {tab === 'explore' && <ExploreScreen deepLink={exploreDeepLink} onDeepLinkConsumed={() => setExploreDeepLink(null)} />}
          {tab === 'feed' && <FeedScreen deepLink={feedDeepLink} onDeepLinkConsumed={() => setFeedDeepLink(null)} />}
          {tab === 'tools' && <OutilsScreen deepLink={toolDeepLink} onDeepLinkConsumed={() => setToolDeepLink(null)} />}
          {tab === 'ai' && <AssistantScreen />}
        </Suspense>
      </div>
      <TabBar tab={tab} onChange={setTab} />

      <NavMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleMenuNavigate} />
      <HelpSheet open={!!helpKey} helpKey={helpKey} onClose={() => setHelpKey(null)} />
      <DemoSheet open={!!demoKey} demoKey={demoKey} onClose={() => setDemoKey(null)} />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onChange={handleProfileChange}
        onReplay={() => { setSettingsOpen(false); setOnboarded(false) }}
        onStartDemo={(name) => { setSettingsOpen(false); startDemo(name) }}
      />
    </div>
  )
}
