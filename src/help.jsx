import {
  IcSky, IcMoon, IcOrbit, IcBook, IcGrid, IcSpark, IcTele, IcComet,
  IcCamera, IcSat, IcCap, IcUsers, IcGem, IcHelp, IcCheck
} from './icons'
import { Sheet } from './ui'

export const HELP_CONTENT = {
  sky: { title: 'Ciel', icon: IcSky,
    intro: "La carte du ciel de ce soir, calculée pour votre position et orientée vers le zénith.",
    points: ["Touchez un astre pour ses détails : magnitude, altitude, distance", "Filtrez par planètes, étoiles ou ciel profond", "Liste « Maintenant visible » triée par éclat"] },
  eph: { title: 'Éphémérides', icon: IcMoon,
    intro: "Tous les horaires et événements du jour : Lune, Soleil et alertes d'observation.",
    points: ["Phase lunaire, illumination et distance Terre-Lune", "Lever / coucher du Soleil et crépuscules astronomiques", "Alertes : passages de l'ISS, conjonctions, stations spatiales"] },
  explore: { title: 'Explorer', icon: IcOrbit,
    intro: "Un voyage guidé dans le cosmos, du système solaire aux confins de l'univers.",
    points: ["Les 8 planètes et le Soleil avec leurs caractéristiques", "Images du télescope spatial James Webb", "Anomalies cosmiques et grandes théories"] },
  feed: { title: 'Veille', icon: IcBook,
    intro: "L'actualité spatiale et les ressources pour aller plus loin.",
    points: ["Actualités, conférences, personnalités et bibliothèque", "Ajoutez vos propres entrées avec le bouton « Ajouter »", "Photos du ciel : les meilleures sources en ligne"] },
  tools: { title: 'Outils', icon: IcGrid,
    intro: "Votre boîte à outils d'observateur : dix modules pour préparer, observer et apprendre.",
    points: ["Observer, Lune, Planètes, Événements, Astrophoto…", "Satellites, Apprendre, Communauté, Assistant IA", "Touchez une tuile pour ouvrir un module"] },
  ai: { title: 'Assistant', icon: IcSpark,
    intro: "Un assistant expert en astronomie, disponible à tout moment.",
    points: ["Posez vos questions sur le ciel, la théorie ou le matériel", "Réponses précises et concises", "Touchez une suggestion pour démarrer"] },
  tool_observe: { title: 'Observer', icon: IcTele,
    intro: "Préparez votre session d'observation de A à Z.",
    points: ["Conditions du ciel : nuages, seeing, transparence, Bortle", "Meilleurs créneaux et horaires de lever / coucher", "Journal personnel et catalogues (Messier, NGC, IC, Caldwell)"] },
  tool_moon: { title: 'Lune', icon: IcMoon,
    intro: "Tout sur la Lune, en temps réel.",
    points: ["Phase actuelle, âge, illumination, distance", "Calendrier des prochaines phases", "Cartographie : mers, cratères et zones à observer"] },
  tool_planets: { title: 'Planètes', icon: IcOrbit,
    intro: "Les planètes ce soir, et un aperçu dans l'oculaire.",
    points: ["Position, magnitude et taille apparente", "Conjonctions, oppositions et élongations", "Simulation de chaque planète au télescope"] },
  tool_events: { title: 'Événements', icon: IcComet,
    intro: "Ne manquez aucun rendez-vous céleste.",
    points: ["Éclipses, pluies de météores, comètes, superlunes", "Passages de l'ISS et occultations", "Notifications personnalisables"] },
  tool_astrophoto: { title: 'Astrophoto', icon: IcCamera,
    intro: "Planifiez et réglez vos prises de vue.",
    points: ["Fenêtres de pose, heure bleue, Voie Lactée", "Temps d'exposition (règles 500 / NPF)", "Simulateur de champ et de cadrage"] },
  tool_satellites: { title: 'Satellites', icon: IcSat,
    intro: "Suivez ce qui orbite au-dessus de vous.",
    points: ["Position de l'ISS et passages visibles ce soir", "Starlink et autres satellites brillants", "Missions en cours, lancements et sondes lointaines"] },
  tool_education: { title: 'Apprendre', icon: IcCap,
    intro: "Apprenez l'astronomie à votre rythme.",
    points: ["Quiz éclair et défis quotidiens", "Parcours pédagogiques progressifs", "Contenus : histoire, cosmologie, astrophysique"] },
  tool_community: { title: 'Communauté', icon: IcUsers,
    intro: "Partagez et rencontrez d'autres passionnés.",
    points: ["Fil de partage d'observations et de photos", "Classement des meilleures images", "Sorties, clubs et soirées d'observation"] },
  tool_ai: { title: "Aide à l'observation", icon: IcSpark,
    intro: "Une IA qui connaît votre ciel et votre matériel.",
    points: ["« Que puis-je observer ce soir avec un Dobson 200 mm ? »", "Conseils adaptés à votre position et vos instruments", "Suggestions prêtes à l'emploi"] },
  tool_extras: { title: 'Explorations', icon: IcGem,
    intro: "Des explorations ludiques pour prendre du recul sur le cosmos.",
    points: ["Générateur de Top 10 des objets du soir", "Échelle interactive de l'Univers", "Simulateur d'impact et cartes immersives"] },
}

export function TopBar({ onHome, onHelp }) {
  return (
    <div className="appbar">
      <button className="brand" onClick={onHome} aria-label="Retour à l'accueil">
        <span style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1a130a', background: 'linear-gradient(160deg,var(--gold-2),var(--gold-3))' }}><IcSpark size={15} /></span>
        <span className="bw">Astror</span>
      </button>
      <button className="help-btn press" onClick={onHelp} aria-label="Aide sur cet écran">
        <IcHelp size={19} />
      </button>
    </div>
  )
}

export function HelpSheet({ open, onClose, helpKey }) {
  const h = HELP_CONTENT[helpKey] || HELP_CONTENT.sky
  const HelpIcon = h.icon || IcHelp
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
        <span style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--gold)', background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
          <HelpIcon size={24} />
        </span>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Aide</div>
          <div className="h-sec" style={{ fontSize: 23 }}>{h.title}</div>
        </div>
      </div>
      <p className="body serif-body" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{h.intro}</p>
      <div className="eyebrow dim" style={{ color: 'var(--faint)', marginBottom: 12 }}>Ce que vous pouvez faire</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {h.points.map((pt, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--gold)', display: 'flex' }}><IcCheck size={17} /></span>
            <span className="body" style={{ fontSize: 13.5, lineHeight: 1.5 }}>{pt}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, padding: '12px 14px', borderRadius: 12,
        background: 'var(--surface-1)', border: '1px solid var(--line)' }}>
        <IcSpark size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span className="meta" style={{ color: 'var(--dim)' }}>Touchez « Astror » en haut à gauche pour revenir à l'accueil.</span>
      </div>
    </Sheet>
  )
}
