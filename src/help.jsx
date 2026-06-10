import { useState, useEffect } from 'react'
import {
  IcSky, IcMoon, IcOrbit, IcBook, IcGrid, IcSpark, IcTele, IcComet,
  IcCamera, IcSat, IcCap, IcUsers, IcGem, IcHelp, IcCheck,
  IcPlay, IcEye, IcCompass, IcLayers, IcBell, IcPlanet, IcPlus,
  IcSliders, IcClock, IcCloud, IcCal, IcPin, IcStar, IcRocket, IcTrophy,
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
    intro: "Un voyage guidé dans le cosmos : les planètes en direct, les images du James Webb, un grand article sur la conquête spatiale avec annexes interactives, et les grandes questions ouvertes de l'astrophysique.",
    points: [
      "Système solaire : fiche de chaque planète (diamètre, distance, composition, lunes avec photos NASA) avec badge « Visible ce soir » calculé en direct et panel IA",
      "Conquête spatiale : article complet « De Spoutnik à Mars » en 10 chapitres — touchez Chronologie, Glossaire ou Missions pour ouvrir une fiche Wikipédia avec photo, résumé et panel IA",
      "James Webb, Anomalies cosmiques et grandes Théories (matière noire, trous noirs, inflation…) — chaque entrée enrichie par un panel IA et un lien Wikipédia",
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

// ─── Contenu démo ────────────────────────────────────────────────────────────

export const DEMO_CONTENT = {
  sky: { title: 'Carte du Ciel', icon: IcSky, steps: [
    { icon: IcEye,     action: 'Touchez une étoile ou planète',   desc: "Un panneau s'ouvre avec magnitude, altitude, azimut, distance et une fiche enrichie par l'IA." },
    { icon: IcCompass, action: 'Activez le mode boussole',        desc: "Pointez votre téléphone vers le ciel. Une flèche et un radar vous guident précisément vers l'objet sélectionné." },
    { icon: IcLayers,  action: 'Filtrez par catégorie',           desc: "Affichez uniquement planètes, étoiles ou ciel profond. La liste « Visibles ce soir » se trie par éclat." },
  ]},
  eph: { title: 'Éphémérides', icon: IcMoon, steps: [
    { icon: IcMoon,    action: 'Consultez la phase lunaire',      desc: "Phase exacte, illumination, âge en jours, distance Terre-Lune et conseil IA pour observer ce soir." },
    { icon: IcSky,     action: 'Vérifiez la fenêtre solaire',     desc: "Lever/coucher du Soleil, crépuscule nautique et astronomique — la limite du ciel vraiment noir." },
    { icon: IcBell,    action: 'Activez les alertes',             desc: "Passages ISS, conjonctions Lune-planète : activez les notifications pour ne rien manquer." },
  ]},
  explore: { title: 'Explorer', icon: IcOrbit, steps: [
    { icon: IcPlanet,  action: 'Ouvrez une fiche planète',           desc: "Diamètre, distance, composition, lunes avec photos NASA, badge « Visible ce soir » et panel IA contextuel." },
    { icon: IcRocket,  action: 'Lisez la Conquête spatiale',          desc: "Article complet en 10 chapitres. Dans les Annexes, touchez une date, un terme ou une mission pour ouvrir sa fiche Wikipédia avec photo et résumé." },
    { icon: IcSpark,   action: 'Explorez anomalies et théories',      desc: "Matière noire, trous noirs, inflation… chaque entrée enrichie par l'IA et liée à Wikipédia." },
  ]},
  feed: { title: 'Veille', icon: IcBook, steps: [
    { icon: IcSky,     action: 'Photo du jour NASA',              desc: "La photo astronomique du jour (APOD) renouvelée chaque nuit — chargée en direct avec titre et description." },
    { icon: IcBook,    action: 'Lisez les actualités',            desc: "Articles éducatifs récents chargés en temps réel : missions, découvertes, astrophysique." },
    { icon: IcPlus,    action: 'Gérez votre bibliothèque',        desc: "Ajoutez vos propres ressources (conférences, YouTube, livres) — elles apparaissent dans la bibliothèque." },
  ]},
  tools: { title: 'Outils', icon: IcGrid, steps: [
    { icon: IcGrid,    action: 'Touchez une tuile',               desc: "Chaque tuile ouvre un module complet : Observer, Lune, Planètes, Événements, Astrophoto, Satellites…" },
    { icon: IcSpark,   action: "Consultez l'IA dans chaque outil", desc: "Chaque module dispose d'un panel IA contextuel adapté à votre position, niveau et matériel." },
    { icon: IcSliders, action: 'Personnalisez via les Paramètres', desc: "Modifiez votre ville, matériel et niveau — chaque outil s'adapte en conséquence." },
  ]},
  ai: { title: 'Assistant', icon: IcSpark, steps: [
    { icon: IcSpark,   action: 'Posez votre question',            desc: "Tapez librement : observations du soir, choix d'instrument, astrophysique, cosmologie…" },
    { icon: IcGrid,    action: 'Utilisez les suggestions',        desc: "11 catégories prêtes à l'emploi — touchez une suggestion pour démarrer une conversation guidée." },
    { icon: IcSliders, action: 'Configurez votre clé API',        desc: "Saisissez votre clé Anthropic ou OpenRouter dans les Paramètres pour activer les réponses en direct." },
  ]},
  tool_observe: { title: 'Observer', icon: IcTele, steps: [
    { icon: IcCloud,   action: 'Vérifiez les conditions',         desc: "Nuages, seeing, transparence et indice Bortle en temps réel avant de sortir votre télescope." },
    { icon: IcClock,   action: 'Choisissez votre créneau',        desc: "Les créneaux optimaux de la nuit sont calculés pour votre position : Excellent / Bon / Médiocre." },
    { icon: IcBook,    action: 'Parcourez les catalogues',        desc: "Messier, NGC, Caldwell ou « Visibles ce soir » — triés par difficulté selon votre matériel." },
  ]},
  tool_moon: { title: 'Lune', icon: IcMoon, steps: [
    { icon: IcMoon,    action: 'Lisez le disque lunaire',         desc: "Phase, illumination, âge et distance en un coup d'œil. L'IA vous dit quelles zones observer ce soir." },
    { icon: IcCal,     action: 'Planifiez les prochaines phases', desc: "Nouvelle, Premier quartier, Pleine, Dernier quartier — avec dates précises calculées pour votre lieu." },
    { icon: IcPin,     action: 'Explorez la cartographie',        desc: "Touchez une mer ou un cratère pour ouvrir sa fiche d'observation générée par l'IA." },
  ]},
  tool_planets: { title: 'Planètes', icon: IcOrbit, steps: [
    { icon: IcEye,     action: 'Lisez le tableau du soir',        desc: "Magnitude, taille apparente et visibilité de chaque planète pour cette nuit — mis à jour en direct." },
    { icon: IcTele,    action: "Simulez l'oculaire",              desc: "Choisissez une planète pour voir ce que vous observerez : bandes de Jupiter, anneaux de Saturne à l'échelle." },
    { icon: IcCal,     action: 'Anticipez les événements',        desc: "Conjonctions, oppositions et élongations à venir avec dates et séparations angulaires." },
  ]},
  tool_events: { title: 'Événements', icon: IcComet, steps: [
    { icon: IcCal,     action: 'Filtrez par catégorie',           desc: "Éclipses, pluies de météores ou événements spéciaux — calendrier sur 18 mois en un coup d'œil." },
    { icon: IcComet,   action: "Préparez avec l'IA",              desc: "Touchez un événement pour le panel IA : meilleur moment, matériel conseillé, position précise." },
    { icon: IcBell,    action: 'Activez les notifications',       desc: "Ne manquez plus aucun passage ISS, éclipse ou pluie d'étoiles filantes — alerte personnalisée par type." },
  ]},
  tool_astrophoto: { title: 'Astrophoto', icon: IcCamera, steps: [
    { icon: IcClock,   action: 'Vérifiez la fenêtre de nuit',     desc: "Heure bleue, crépuscule astronomique, seeing et météo en direct — pour choisir le bon moment." },
    { icon: IcSky,     action: 'Localisez la Voie Lactée',        desc: "Position du cœur galactique et interférence lunaire pour planifier vos poses grand champ." },
    { icon: IcCamera,  action: 'Calculez votre temps de pose',    desc: "Entrez focale et capteur (plein format, APS-C, MFT) — règles 500 et NPF calculées instantanément." },
  ]},
  tool_satellites: { title: 'Satellites', icon: IcSat, steps: [
    { icon: IcSat,     action: "Suivez l'ISS en direct",          desc: "Altitude, vitesse, position géographique et statut — mis à jour toutes les 10 secondes." },
    { icon: IcClock,   action: 'Planifiez le prochain passage',   desc: "Heure, durée, direction et altitude maximale pour les passages ISS visibles depuis votre ville." },
    { icon: IcRocket,  action: 'Explorez les missions',           desc: "Missions en cours, lancements à venir, distances de Voyager 1/2 et New Horizons depuis le Soleil." },
  ]},
  tool_education: { title: 'Apprendre', icon: IcCap, steps: [
    { icon: IcCap,     action: 'Lancez un quiz',                  desc: "40 questions en 6 catégories — une explication détaillée s'affiche après chaque réponse." },
    { icon: IcBook,    action: 'Consultez le glossaire',          desc: "50 termes astronomiques — touchez un mot pour sa définition approfondie générée par l'IA." },
    { icon: IcSky,     action: 'Restez informé',                  desc: "Photo du jour NASA et articles éducatifs chargés en direct : une nouveauté chaque jour." },
  ]},
  tool_community: { title: 'Communauté', icon: IcUsers, steps: [
    { icon: IcUsers,   action: 'Parcourez le fil Mastodon',       desc: "Photos d'astrophotographie en direct depuis #astrophotography — nouvelles photos à chaque visite." },
    { icon: IcTrophy,  action: 'Consultez le classement',         desc: "Connectez votre Google Sheets dans les Paramètres pour afficher un classement de photos en direct." },
    { icon: IcPin,     action: 'Découvrez les sorties',           desc: "Actualités d'événements astronomiques en direct (SAF, Le Monde Espace)." },
  ]},
  tool_extras: { title: 'Explorations', icon: IcGem, steps: [
    { icon: IcGem,     action: 'Explorez les échelles cosmiques', desc: "9 visuels de l'Everest à l'Univers observable — glissez pour prendre du recul sur l'immensité." },
    { icon: IcComet,   action: 'Simulez un impact',               desc: "Choisissez la masse de l'impacteur — cratère, énergie et équivalent TNT se calculent en direct." },
    { icon: IcStar,    action: 'Découvrez votre Top 10',          desc: "Liste personnalisée selon votre GPS et la saison, avec fiches détaillées et conseil IA par objet." },
  ]},
}

// ─── Sheet de démonstration ───────────────────────────────────────────────────

export function DemoSheet({ open, onClose, demoKey }) {
  const [step, setStep] = useState(0)
  const d = DEMO_CONTENT[demoKey]
  const DIcon = d?.icon || IcPlay

  useEffect(() => { if (open) setStep(0) }, [open, demoKey])

  if (!d) return null
  const s = d.steps[step]
  const SIcon = s.icon || IcSpark
  const total = d.steps.length

  return (
    <Sheet open={open} onClose={onClose}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 22 }}>
        <span style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
          background: 'var(--gold-soft)', border: '1px solid var(--gold-line)' }}>
          <DIcon size={24} />
        </span>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcPlay size={11} style={{ color: 'var(--gold)' }} />
            Démonstration
          </div>
          <div className="h-sec" style={{ fontSize: 22 }}>{d.title}</div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
        {d.steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} aria-label={`Étape ${i + 1}`}
            style={{ width: i === step ? 26 : 8, height: 8, borderRadius: 999, padding: 0,
              background: i === step ? 'var(--gold)' : 'var(--line-2)',
              border: 0, cursor: 'pointer', transition: 'all .22s ease' }} />
        ))}
      </div>

      {/* Contenu de l'étape */}
      <div style={{ borderRadius: 18, background: 'var(--surface-1)', border: '1px solid var(--line)',
        padding: '30px 20px 26px', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
          background: 'var(--gold-soft)', border: '1px solid var(--gold-line)', marginBottom: 18 }}>
          <SIcon size={32} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.1em',
          color: 'var(--faint)', marginBottom: 10, textTransform: 'uppercase' }}>
          Étape {step + 1} / {total}
        </div>
        <div className="h-sec" style={{ fontSize: 17, marginBottom: 12 }}>{s.action}</div>
        <p className="body" style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--dim)', margin: 0 }}>{s.desc}</p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="chip" onClick={() => setStep(i => i - 1)} disabled={step === 0}
          style={{ flex: 1, height: 44, opacity: step === 0 ? .35 : 1 }}>
          ← Précédent
        </button>
        {step < total - 1
          ? <button className="chip on" onClick={() => setStep(i => i + 1)} style={{ flex: 1, height: 44 }}>Suivant →</button>
          : <button className="chip on" onClick={onClose} style={{ flex: 1, height: 44 }}>Terminé ✓</button>
        }
      </div>
    </Sheet>
  )
}


export function TopBar({ onHome, onHelp, onDemo }) {
  return (
    <div className="appbar">
      <button className="brand" onClick={onHome} aria-label="Retour à l'accueil">
        <span style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#1a130a', background: 'linear-gradient(160deg,var(--gold-2),var(--gold-3))' }}><IcSpark size={15} /></span>
        <span className="bw">Astror</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="help-btn press" onClick={onDemo} aria-label="Démonstration de cet écran"
          style={{ color: 'var(--gold)' }}>
          <IcPlay size={17} />
        </button>
        <button className="help-btn press" onClick={onHelp} aria-label="Aide sur cet écran">
          <IcHelp size={19} />
        </button>
      </div>
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
