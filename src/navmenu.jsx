import { Sheet } from './ui'
import {
  IcSky, IcMoon, IcGlobe, IcBell, IcWrench, IcSpark,
  IcEye, IcPlanet, IcCal, IcCamera, IcSat, IcBook, IcUsers, IcOrbit, IcRocket, IcChevron,
} from './icons'

// Index complet des fonctionnalités d'Astror, classées par catégorie.
// `nav` décrit la destination : { tab } ou { tab, sub } (sous-onglet Explorer/Veille) ou { tab, tool } (Outils) ou { settings: true }.
const CATEGORIES = [
  {
    label: 'Ciel & pointage', Ic: IcSky,
    items: [
      { label: 'Ciel', sub: 'Carte du ciel en direct', Ic: IcSky, nav: { tab: 'sky' } },
      { label: 'Observer', sub: 'Journal & conditions', Ic: IcEye, nav: { tab: 'tools', tool: 'observe' } },
      { label: 'Satellites', sub: 'ISS & passages visibles', Ic: IcSat, nav: { tab: 'tools', tool: 'satellites' } },
    ],
  },
  {
    label: 'Éphémérides', Ic: IcMoon,
    items: [
      { label: 'Éphémérides', sub: 'Lune, Soleil, alertes', Ic: IcMoon, nav: { tab: 'eph' } },
      { label: 'Lune', sub: 'Phases & cartographie', Ic: IcMoon, nav: { tab: 'tools', tool: 'moon' } },
      { label: 'Planètes', sub: 'Éphémérides & oculaire', Ic: IcPlanet, nav: { tab: 'tools', tool: 'planets' } },
      { label: 'Événements', sub: 'Calendrier & notifications', Ic: IcCal, nav: { tab: 'tools', tool: 'events' } },
    ],
  },
  {
    label: 'Explorer le cosmos', Ic: IcGlobe,
    items: [
      { label: 'Système solaire', sub: 'Planètes, lunes, constellations', Ic: IcGlobe, nav: { tab: 'explore', sub: 'solar' } },
      { label: 'James Webb', sub: 'Dernières images', Ic: IcGlobe, nav: { tab: 'explore', sub: 'jwst' } },
      { label: 'Conquête spatiale', sub: 'Article & annexes', Ic: IcRocket, nav: { tab: 'explore', sub: 'conquest' } },
      { label: 'Anomalies', sub: 'Phénomènes inexpliqués', Ic: IcGlobe, nav: { tab: 'explore', sub: 'anomaly' } },
      { label: 'Théories', sub: 'Matière noire, trous noirs…', Ic: IcGlobe, nav: { tab: 'explore', sub: 'theory' } },
    ],
  },
  {
    label: 'Astrophotographie', Ic: IcCamera,
    items: [
      { label: 'Astrophoto', sub: 'Calculs & simulateur de cadrage', Ic: IcCamera, nav: { tab: 'tools', tool: 'astrophoto' } },
      { label: 'Explorations', sub: 'Simulateurs (échelle, impact…)', Ic: IcOrbit, nav: { tab: 'tools', tool: 'extras' } },
    ],
  },
  {
    label: 'Veille spatiale', Ic: IcBell,
    items: [
      { label: 'Actualités', sub: 'Dernières nouvelles spatiales', Ic: IcBell, nav: { tab: 'feed', sub: 'news' } },
      { label: 'Conférences', sub: 'Événements à venir', Ic: IcBell, nav: { tab: 'feed', sub: 'conf' } },
      { label: 'Personnalités', sub: 'Figures de l’astronomie', Ic: IcUsers, nav: { tab: 'feed', sub: 'people' } },
      { label: 'Bibliothèque', sub: 'Recherche de livres', Ic: IcBook, nav: { tab: 'feed', sub: 'books' } },
      { label: 'Photos du ciel', sub: 'APOD, Hubble, JWST, ESO…', Ic: IcBell, nav: { tab: 'feed', sub: 'sites' } },
    ],
  },
  {
    label: 'Apprendre & communauté', Ic: IcBook,
    items: [
      { label: 'Apprendre', sub: 'Quiz, XP, parcours, glossaire', Ic: IcBook, nav: { tab: 'tools', tool: 'education' } },
      { label: 'Communauté', sub: 'Fil, classement, sorties', Ic: IcUsers, nav: { tab: 'tools', tool: 'community' } },
    ],
  },
  {
    label: 'Assistant IA', Ic: IcSpark,
    items: [
      { label: 'Assistant', sub: 'Chat libre spécialisé astronomie', Ic: IcSpark, nav: { tab: 'ai' } },
      { label: 'Assistant IA', sub: 'Aide contextuelle (profil, matériel)', Ic: IcSpark, nav: { tab: 'tools', tool: 'ai' } },
    ],
  },
  {
    label: 'Réglages', Ic: IcWrench,
    items: [
      { label: 'Paramètres', sub: 'Profil, alertes, clés IA, sauvegarde', Ic: IcWrench, nav: { settings: true } },
    ],
  },
]

function MenuRow({ item, onNavigate }) {
  return (
    <button onClick={() => onNavigate(item.nav)} className="press" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
      borderRadius: 14, textAlign: 'left', cursor: 'pointer', background: 'transparent', border: 'none',
    }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
        <item.Ic size={17} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="h-card" style={{ fontSize: 14, display: 'block' }}>{item.label}</span>
        <span className="meta" style={{ fontSize: 11, display: 'block', marginTop: 1 }}>{item.sub}</span>
      </span>
      <IcChevron size={16} style={{ color: 'var(--faint)', flexShrink: 0 }} />
    </button>
  )
}

export default function NavMenuSheet({ open, onClose, onNavigate }) {
  const go = (nav) => { onNavigate(nav); onClose() }

  return (
    <Sheet open={open} onClose={onClose} aria-label="Toutes les fonctionnalités">
      <div className="eyebrow" style={{ marginBottom: 4 }}>Astror</div>
      <div className="h-sec" style={{ fontSize: 23, marginBottom: 18 }}>Toutes les fonctionnalités</div>
      {CATEGORIES.map((cat) => (
        <div key={cat.label} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <cat.Ic size={15} style={{ color: 'var(--faint)' }} />
            <span className="eyebrow dim" style={{ color: 'var(--faint)', letterSpacing: '.14em' }}>{cat.label}</span>
          </div>
          <div className="card-2" style={{ overflow: 'hidden' }}>
            {cat.items.map((item, i) => (
              <div key={item.label} style={{ borderBottom: i < cat.items.length - 1 ? '1px solid var(--line)' : 0 }}>
                <MenuRow item={item} onNavigate={go} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Sheet>
  )
}
