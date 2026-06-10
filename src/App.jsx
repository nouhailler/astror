import { useState, useEffect } from 'react'
import { IcSky, IcMoon, IcGlobe, IcBell, IcWrench, IcSpark } from './icons'
import { TopBar, HelpSheet } from './help'
import SettingsSheet from './settings'
import Onboarding, { onbWasSeen, onbMarkSeen, onbLoad, onbSave } from './onboarding'
import SkyScreen from './sky'
import EphScreen from './ephemerides'
import ExploreScreen from './explore'
import FeedScreen from './feed'
import OutilsScreen from './tools'
import AssistantScreen from './assistant'
import './app.css'

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
  const [onboarded, setOnboarded] = useState(() => onbWasSeen())
  const [tab, setTab] = useState('sky')
  const [helpKey, setHelpKey] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profile, setProfile] = useState(() => onbLoad())
  const [toolDeepLink, setToolDeepLink] = useState(null)

  const handleProfileChange = (p) => { setProfile(p); onbSave(p) }

  useEffect(() => {
    window.openAstrorSettings = () => setSettingsOpen(true)
    window.openAstrorTool = (key) => { setTab('tools'); setToolDeepLink(key) }
    return () => { delete window.openAstrorSettings; delete window.openAstrorTool }
  }, [])

  if (!onboarded) {
    return (
      <Onboarding
        onFinish={(p) => { onbSave(p); setProfile(p); onbMarkSeen(); setOnboarded(true) }}
        onSkip={() => { onbMarkSeen(); setOnboarded(true) }}
      />
    )
  }

  return (
    <div className="app-root">
      <div className="safe-top" />
      <TopBar onHelp={() => setHelpKey(HELP_KEYS[tab])} onHome={() => setTab('sky')} />
      <div className="screen-area">
        {tab === 'sky' && <SkyScreen />}
        {tab === 'eph' && <EphScreen />}
        {tab === 'explore' && <ExploreScreen />}
        {tab === 'feed' && <FeedScreen />}
        {tab === 'tools' && <OutilsScreen deepLink={toolDeepLink} onDeepLinkConsumed={() => setToolDeepLink(null)} />}
        {tab === 'ai' && <AssistantScreen />}
      </div>
      <TabBar tab={tab} onChange={setTab} />

      <HelpSheet open={!!helpKey} helpKey={helpKey} onClose={() => setHelpKey(null)} />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onChange={handleProfileChange}
        onReplay={() => { setSettingsOpen(false); setOnboarded(false) }}
      />
    </div>
  )
}
