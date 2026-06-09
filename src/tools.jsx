import { useState, useEffect } from 'react'
import { IcEye, IcMoon, IcPlanet, IcCal, IcCamera, IcSat, IcBook, IcUsers, IcSpark, IcOrbit } from './icons'
import { ScreenHeader } from './ui'

import ObservePage from './tool-observe'
import MoonPage from './tool-moon'
import PlanetsPage from './tool-planets'
import EventsPage from './tool-events'
import AstrophotoPage from './tool-astrophoto'
import SatellitesPage from './tool-satellites'
import EducationPage from './tool-education'
import CommunityPage from './tool-community'
import AiPage from './tool-ai'
import ExtrasPage from './tool-extras'

const TOOLS = [
  { key: 'observe', label: 'Observer', sub: 'Journal & cataogue', Ic: IcEye, Page: ObservePage },
  { key: 'moon', label: 'Lune', sub: 'Phases & carte', Ic: IcMoon, Page: MoonPage },
  { key: 'planets', label: 'Planètes', sub: 'Ephémérides', Ic: IcPlanet, Page: PlanetsPage },
  { key: 'events', label: 'Événements', sub: 'Alertes & passages', Ic: IcCal, Page: EventsPage },
  { key: 'astrophoto', label: 'Astrophoto', sub: 'Calculs & fenêtres', Ic: IcCamera, Page: AstrophotoPage },
  { key: 'satellites', label: 'Satellites', sub: 'ISS & missions', Ic: IcSat, Page: SatellitesPage },
  { key: 'education', label: 'Apprendre', sub: 'Quiz & parcours', Ic: IcBook, Page: EducationPage },
  { key: 'community', label: 'Communauté', sub: 'Photos & sorties', Ic: IcUsers, Page: CommunityPage },
  { key: 'ai', label: 'Assistant IA', sub: 'Aide contextuelle', Ic: IcSpark, Page: AiPage },
  { key: 'extras', label: 'Explorations', sub: 'Simulateurs', Ic: IcOrbit, Page: ExtrasPage },
]

function ToolsHub({ onOpen }) {
  return (
    <div className="screen">
      <ScreenHeader title="Outils" />
      <div className="screen-scroll">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '14px 16px calc(16px + var(--sab))' }}>
          {TOOLS.map(t => (
            <button key={t.key} onClick={() => onOpen(t.key)} className="press" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column',
              gap: 10, padding: 15, borderRadius: 18, cursor: 'pointer',
              background: 'linear-gradient(180deg,var(--surface-2),var(--surface-1))', border: '1px solid var(--line)' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}><t.Ic size={20} /></span>
              <div>
                <div className="h-card" style={{ fontSize: 14.5, marginBottom: 2 }}>{t.label}</div>
                <div className="meta" style={{ fontSize: 11 }}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OutilsScreen({ deepLink, onDeepLinkConsumed }) {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (deepLink) { setOpen(deepLink); onDeepLinkConsumed?.() }
  }, [deepLink])

  const tool = TOOLS.find(t => t.key === open)

  if (tool) {
    const { Page } = tool
    return <Page onBack={() => setOpen(null)} />
  }

  return <ToolsHub onOpen={setOpen} />
}
