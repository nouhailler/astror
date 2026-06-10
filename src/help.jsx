import {
  IcSky, IcMoon, IcOrbit, IcBook, IcGrid, IcSpark, IcTele, IcComet,
  IcCamera, IcSat, IcCap, IcUsers, IcGem, IcHelp, IcCheck
} from './icons'
import { Sheet } from './ui'

export const HELP_CONTENT = {
  sky: { title: 'Carte du Ciel', icon: IcSky,
    intro: "La carte du ciel en temps réel, calculée pour votre position GPS et l'heure actuelle. Touchez un astre pour ses informations complètes, ou activez le mode boussole pour le retrouver dans le ciel.",
    points: [
      "Touchez un astre pour ses détails : type, magnitude, altitude, azimut, distance et fiche enrichie avec panel IA contextuel",
      "Mode boussole : pointez votre téléphone vers le ciel, une flèche directionnelle et un radar vous guident avec précision vers l'objet choisi",
      "Filtres par catégorie (planètes, étoiles, ciel profond) et liste « Visibles ce soir » triée par éclat — mise à jour en direct",
    ] },

  eph: { title: 'Éphémérides', icon: IcMoon,
    intro: "Tous les horaires et données astronomiques du jour pour votre position : Lune, Soleil, alertes en temps réel et prochains événements avec compte à rebours.",
    points: [
      "Lune : phase exacte, illumination, âge (en jours), distance Terre-Lune et horaires de lever / coucher calculés pour votre lieu",
      "Soleil : lever, coucher, crépuscule nautique et crépuscule astronomique — la limite après laquelle le ciel est vraiment noir",
      "Alertes activables : passages de l'ISS, conjonctions Lune-planète, stations spatiales — avec compte à rebours jusqu'au prochain événement",
    ] },

  explore: { title: 'Explorer', icon: IcOrbit,
    intro: "Un voyage guidé dans le cosmos : les 8 planètes du système solaire en direct, les dernières images du James Webb et les grandes questions ouvertes de l'astrophysique.",
    points: [
      "Système solaire : fiche de chaque planète (diamètre, distance, composition, lunes…) avec badge « Visible ce soir » calculé en direct et panel IA",
      "James Webb : dernières images chargées depuis la NASA avec description et lien vers l'article d'origine",
      "Anomalies cosmiques et grandes théories (matière noire, trous noirs, inflation…) — chaque entrée enrichie par un panel IA et un lien Wikipédia",
    ] },

  feed: { title: 'Veille', icon: IcBook,
    intro: "L'actualité spatiale et les ressources pour approfondir vos connaissances : photo du jour NASA, articles éducatifs et bibliothèque de liens sélectionnés.",
    points: [
      "Photo astronomique du jour (APOD) chargée en direct depuis la NASA avec titre et description",
      "Actualités spatiales éducatives récupérées en temps réel — articles, missions, découvertes",
      "Bibliothèque de ressources : conférences, chaînes YouTube, livres de référence et sites spécialisés — ajoutez vos propres entrées",
    ] },

  tools: { title: 'Outils', icon: IcGrid,
    intro: "Votre boîte à outils d'astronome amateur : dix modules pour préparer vos sessions, observer, photographier, apprendre et rester informé — tous personnalisés selon votre profil.",
    points: [
      "Préparation et observation : Observer, Lune, Planètes, Événements, Astrophoto, Satellites",
      "Apprendre et explorer : Quiz, Parcours, Glossaire, Explorations cosmiques, Assistant IA",
      "Touchez une tuile pour ouvrir le module ; chaque outil est adapté à votre position GPS, votre matériel et votre niveau",
    ] },

  ai: { title: 'Assistant', icon: IcSpark,
    intro: "Un assistant conversationnel expert en astronomie, disponible à tout moment. Il connaît votre position, votre niveau et vos instruments pour vous conseiller de façon concrète.",
    points: [
      "Posez vos questions librement : observation du soir, choix d'instrument, astrophysique, conquête spatiale, cosmologie…",
      "11 catégories de suggestions prêtes à l'emploi : Utilisation d'Astror, Observer, Instruments, Astrophoto, Système solaire, Ciel profond…",
      "Alimenté par Claude (Anthropic) ou OpenRouter — configurez votre clé API dans les Paramètres pour activer les réponses en temps réel",
    ] },

  tool_observe: { title: 'Observer', icon: IcTele,
    intro: "Préparez votre session d'observation de A à Z : conditions météo en direct, meilleurs créneaux de la nuit, horaires de lever/coucher et catalogues d'objets classés par difficulté.",
    points: [
      "Conditions en direct (via API météo) : couverture nuageuse, seeing (turbulence atmosphérique en arcsec), transparence et indice Bortle — chacun avec barre de qualité colorée",
      "Créneaux optimaux de la nuit : horaires calculés pour votre position avec note Excellent / Bon / Médiocre et impact des nuages en temps réel",
      "Journal personnel (ajout et suppression de sessions avec date, lieu, objet, notes et matériel) + catalogues : Visibles ce soir, Recommandés pour votre matériel, Messier, NGC, IC, Caldwell",
    ] },

  tool_moon: { title: 'Lune', icon: IcMoon,
    intro: "Tout sur la Lune en temps réel : phase exacte, données orbitales actuelles et cartographie interactive des mers et cratères les plus spectaculaires.",
    points: [
      "Disque lunaire animé avec phase exacte, illumination (%), âge en jours, distance Terre-Lune et diamètre apparent — plus un conseil IA sur les zones à observer ce soir",
      "Calendrier des 4 prochaines phases (nouvelle Lune, premier quartier, pleine Lune, dernier quartier) avec dates précises",
      "Cartographie : 4 mers majeures (dont Mare Tranquillitatis, site d'Apollo 11) et 4 cratères remarquables (Copernic, Tycho, Clavius, Platon) — chacun avec fiche IA d'observation",
    ] },

  tool_planets: { title: 'Planètes', icon: IcOrbit,
    intro: "Les 7 planètes ce soir : position, magnitude, taille angulaire, et simulation visuelle dans l'oculaire pour savoir exactement ce que vous verrez avec votre télescope.",
    points: [
      "Tableau des 7 planètes (Vénus à Neptune) : magnitude, taille apparente en arcsec, niveau de visibilité et position de ce soir — avec panel IA récapitulatif",
      "Simulation oculaire réaliste : bandes nuageuses et tache rouge de Jupiter, anneaux de Saturne avec inclinaison actuelle, taille à l'échelle selon la focale",
      "Conjonctions, oppositions et élongations à venir : dates, séparations angulaires et détails pour chaque événement planétaire",
    ] },

  tool_events: { title: 'Événements', icon: IcComet,
    intro: "Ne manquez aucun rendez-vous céleste sur les 18 prochains mois : éclipses, pluies de météores, comètes, événements spéciaux — et notifications pour être alerté à l'avance.",
    points: [
      "Calendrier sur 18 mois filtrable par catégorie (éclipses, météores, spécial) — chaque événement avec date, description et panel IA de préparation à l'observation",
      "Panneau « 7 derniers jours » dans l'onglet Notifications pour retrouver les événements passés récents",
      "Notifications personnalisables par type : passages ISS, planètes bien placées, pluies de météores, éclipses — activées avec accord de votre navigateur",
    ] },

  tool_astrophoto: { title: 'Astrophoto', icon: IcCamera,
    intro: "Planifiez vos prises de vue et calculez vos réglages : fenêtre de nuit astronomique, conditions seeing/météo en direct, Voie Lactée et calculateurs d'exposition calibrés.",
    points: [
      "Fenêtre de nuit : coucher du Soleil, heure bleue, crépuscule astronomique et aube — avec météo en direct (seeing, transparence, nuages, humidité, température)",
      "Position du cœur galactique et saison Voie Lactée pour choisir la meilleure nuit, plus l'état de la Lune (interférence lumineuse)",
      "Calculateurs de temps de pose (règle 500 et règle NPF haute résolution) selon votre focale et capteur (plein format, APS-C, Micro 4/3), et simulateur de cadrage avec M31 et la Lune à l'échelle",
    ] },

  tool_satellites: { title: 'Satellites', icon: IcSat,
    intro: "Suivez en temps réel ce qui orbite au-dessus de vous : position live de l'ISS, passages visibles calculés pour votre ville, missions spatiales actuelles et sondes aux confins du système solaire.",
    points: [
      "ISS en direct : altitude, vitesse orbitale, position géographique (lat/lng) et statut (côté jour, éclipsée ou visible) — mis à jour toutes les 10 secondes",
      "Passages ISS dans les 24 h : heure, durée, direction et altitude maximale — plus Tiangong, Starlink et Hubble détaillés par l'IA selon votre position",
      "Exploration : missions spatiales en cours avec actualités, lancements à venir, et distances en temps réel de Voyager 1/2, New Horizons et Pioneer 10/11 depuis le Soleil",
    ] },

  tool_education: { title: 'Apprendre', icon: IcCap,
    intro: "Apprenez l'astronomie à votre rythme : quiz interactif sur 40 questions, contenus d'actualité et glossaire de 50 termes avec définitions enrichies par l'IA.",
    points: [
      "Quiz : 40 questions réparties en 6 catégories (Système solaire, Cosmologie, Astrophysique, Observation, Histoire, Instruments) avec explication détaillée de chaque réponse",
      "Contenus : photo du jour NASA (APOD) et articles éducatifs récents chargés en direct depuis le web",
      "Glossaire de 50 termes astronomiques — cliquez un terme pour ouvrir une fiche avec définition approfondie générée par l'IA",
    ] },

  tool_community: { title: 'Communauté', icon: IcUsers,
    intro: "Partagez vos observations et rencontrez d'autres passionnés : fil de partage, galerie de photos et événements locaux.",
    points: [
      "Fil de partage : publiez vos observations, comptes-rendus de session et anecdotes de la nuit",
      "Galerie et classement des meilleures photos astrophotographiques de la communauté",
      "Événements locaux : soirées d'observation, clubs, rencontres et sorties en groupe",
    ] },

  tool_ai: { title: "Aide à l'observation", icon: IcSpark,
    intro: "Un assistant IA personnalisé qui connaît votre ville, votre niveau et votre matériel déclarés à l'installation. Posez-lui n'importe quelle question sur le ciel de ce soir ou sur l'astronomie en général.",
    points: [
      "Contexte personnel : l'IA sait depuis quelle ville vous observez, votre niveau (débutant, amateur, confirmé) et vos instruments (à l'œil nu, jumelles, lunette, télescope…)",
      "Suggestions organisées en 11 catégories : utilisation d'Astror, observation, instruments, astrophoto, système solaire, ciel profond, astrophysique, cosmologie, conquête spatiale…",
      "Nécessite une clé API (Anthropic ou OpenRouter) — saisissez-la dans les Paramètres (⚙️) pour activer les réponses en temps réel ; sans clé, des réponses types sont affichées",
    ] },

  tool_extras: { title: 'Explorations', icon: IcGem,
    intro: "Des explorations interactives pour prendre du recul sur l'immensité du cosmos : simulateurs visuels, top 10 personnalisé selon votre position et la saison, et six voyages immersifs enrichis par l'IA.",
    points: [
      "Explorateur d'échelles : 9 visuels distincts de l'Everest (8 849 m) à l'Univers observable — montagne, Lune cratérisée, Terre avec continents, Jupiter rayé, Soleil, géante rouge, anneaux orbitaux, Voie Lactée spiralée, toile cosmique",
      "Simulateur d'impact : choisissez la masse de l'impacteur (de 10³ à 10³⁰ kg) et observez le cratère s'agrandir en temps réel sur une Terre à l'échelle, avec énergie, équivalent TNT et diamètre calculés",
      "Top 10 personnalisé : liste générée selon votre GPS et la saison avec fiches détaillées + conseil IA par objet — 6 voyages immersifs (du Soleil aux trous noirs) avec textes enrichis, données clés et analyse IA",
    ] },
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
