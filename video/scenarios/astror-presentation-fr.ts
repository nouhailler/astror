// Tutoriel « Découvrez ASTROR, votre compagnon d'observation astronomique ».
//
// Scénario du moteur de démo (src/demo) — étapes standard navigate / click /
// highlight / type / narrate — enrichi de métadonnées vidéo (chapitres, zooms,
// transitions). Le texte parlé est celui de `narrate` : aucune duplication.
//
// Soirée de référence : Paris, vendredi 20 novembre 2026, 21 h 30 (horloge
// simulée). Les valeurs citées (Lune à 82 %, Saturne seule planète affichée,
// Géminides…) sont celles calculées par Astror pour cette date : elles ont été
// vérifiées sur la capture. Changer `clock` impose de relire ces narrations.
import { DEFAULT_VIDEO, type AstrorVideoScenario } from './from-demo'

const presentation: AstrorVideoScenario = {
  id: 'astror-presentation-fr',
  video: {
    ...DEFAULT_VIDEO,
    title: 'Découvrez ASTROR, votre compagnon d’observation astronomique',
    description: 'Tour d’horizon d’Astror : carte du ciel, éphémérides, exploration du cosmos, outils d’observation et assistant.',
    language: 'fr',
    voiceEnabled: true,
    voice: 'fr-siwis',
    intro: {
      eyebrow: 'Tutoriel · Présentation',
      title: 'Découvrez ASTROR',
      tagline: 'Votre compagnon d’observation astronomique',
      narration: 'Bienvenue dans ASTROR, votre compagnon d’observation astronomique. Cette application vous accompagne pour explorer le ciel, comprendre les phénomènes célestes et préparer vos observations.',
      minDurationMs: 6000,
    },
    outro: {
      title: 'Le ciel de ce soir, dans votre poche',
      tagline: 'Gratuit, open source, en français',
      bullets: [
        'Une carte du ciel calculée en direct pour votre position',
        'Éphémérides, alertes et calendrier céleste',
        'Dix outils pour observer et photographier',
        'Un assistant expert en astronomie',
      ],
      links: [
        { label: 'Application', url: 'https://astror.swinux.ch' },
        { label: 'Code source', url: 'https://github.com/nouhailler/astror' },
      ],
      narration: 'ASTROR est gratuit, open source, et s’installe sur votre téléphone comme une application. Rendez-vous sur astror.swinux.ch pour découvrir le ciel de ce soir. Bonnes observations !',
      minDurationMs: 9000,
    },
    subtitles: { export: true, burnIn: false },
    firstChapter: 'La carte du ciel',
  },
  scenario: {
    name: 'astror-presentation-fr',
    label: 'Présentation d’Astror',
    description: 'Les grandes fonctionnalités d’Astror en trois minutes.',
    steps: [
      // ── 1. Carte du ciel ────────────────────────────────────────────────
      { type: 'navigate', to: 'sky',
        narrate: 'Tout commence par l’onglet Ciel : une carte du ciel calculée en temps réel pour votre position. Nous sommes à Paris, un soir de novembre.' },
      { type: 'click', target: 'sky-filter-planet',
        narrate: 'Les filtres isolent une famille d’astres. Ce soir, seule Saturne est affichée parmi les planètes.' },
      { type: 'click', target: 'sky-filter-all',
        narrate: 'Revenons au ciel complet, avec ses étoiles et ses constellations.' },
      { type: 'highlight', target: 'sky-time', label: 'Voyage dans le temps',
        narrate: 'Ce curseur fait avancer le ciel jusqu’à douze heures plus tard, pour savoir ce qui sera visible dans la nuit.' },
      { type: 'highlight', target: 'sky-list-first', video: { zoom: 1.2 },
        narrate: 'Sous la carte, les astres visibles sont classés par éclat. La Lune arrive en tête.' },
      { type: 'click', target: 'sky-list-first',
        narrate: 'Touchez un astre pour ouvrir sa fiche détaillée.' },
      { type: 'wait', ms: 1800 },

      // ── 2. Éphémérides ──────────────────────────────────────────────────
      { type: 'navigate', to: 'eph', video: { chapter: 'Les éphémérides', transition: 'fade' },
        narrate: 'L’onglet Éphémérides résume la soirée : la Lune, le Soleil, les événements à venir et les conditions d’observation.' },
      { type: 'highlight', target: 'eph-moon', label: 'Lune', video: { zoom: 1.3 },
        narrate: 'Ce soir, la Lune est gibbeuse croissante, éclairée à 82 %, avec ses heures de lever et de coucher.' },
      { type: 'highlight', target: 'eph-sun', label: 'Soleil',
        narrate: 'Le coucher du Soleil et le crépuscule astronomique indiquent quand commence la vraie nuit noire.' },
      { type: 'highlight', target: 'eph-calendar', label: 'Calendrier céleste',
        narrate: 'Le calendrier céleste annonce les prochains rendez-vous, comme la superlune ou la pluie d’étoiles filantes des Géminides.' },
      { type: 'highlight', target: 'eph-conditions', label: 'Conditions',
        narrate: 'Enfin, les conditions d’observation : nuages, humidité, turbulence et pollution lumineuse.' },

      // ── 3. Explorer ─────────────────────────────────────────────────────
      { type: 'navigate', to: 'explore', video: { chapter: 'Explorer le cosmos', transition: 'fade' },
        narrate: 'Explorer vous emmène plus loin : le système solaire, le télescope James Webb, la conquête spatiale, les anomalies cosmiques et les grandes théories.' },
      { type: 'highlight', target: 'explore-planets', label: 'Système solaire',
        narrate: 'Chaque planète a sa fiche, avec ses caractéristiques, ses photos, et sa visibilité calculée pour ce soir.' },
      { type: 'click', target: 'explore-seg-conquest',
        narrate: 'La conquête spatiale se parcourt comme un récit illustré, avec sa chronologie, son glossaire et ses missions.' },
      { type: 'wait', ms: 1200 },

      // ── 4. Outils ───────────────────────────────────────────────────────
      { type: 'navigate', to: 'tools', video: { chapter: 'Les outils', transition: 'fade' },
        narrate: 'L’onglet Outils réunit dix modules pour préparer et mener vos observations. En voici quelques-uns.' },
      { type: 'navigate', tool: 'observe', video: { transition: 'slide' },
        narrate: 'Observer prépare votre soirée : météo, meilleurs créneaux, et objets à viser.' },
      { type: 'click', target: 'seg-journal',
        narrate: 'Il tient aussi votre journal d’observation : chaque séance est notée, avec l’objet, le matériel et vos impressions.' },
      { type: 'navigate', tool: 'moon', video: { transition: 'slide' },
        narrate: 'L’outil Lune détaille la phase du jour, le calendrier des phases, et une carte des mers et des cratères.' },
      { type: 'navigate', tool: 'planets', video: { transition: 'slide' },
        narrate: 'Planètes donne la position de chacune ce soir, et simule ce que vous verrez dans votre oculaire.' },
      { type: 'navigate', tool: 'events', video: { transition: 'slide' },
        narrate: 'Événements rassemble éclipses, pluies de météores et phénomènes remarquables, avec des rappels.' },
      { type: 'navigate', tool: 'astrophoto', video: { transition: 'slide' },
        narrate: 'Pour l’astrophotographie : la fenêtre de prise de vue de la nuit, et des calculs d’exposition.' },
      { type: 'navigate', tool: 'satellites', video: { transition: 'slide' },
        narrate: 'Satellites suit la Station spatiale internationale et calcule ses prochains passages au-dessus de chez vous.' },
      { type: 'navigate', tool: 'education', video: { transition: 'slide' },
        narrate: 'Et pour apprendre en s’amusant : un défi du jour, des quiz par thème, et un glossaire.' },

      // ── 5. Assistant ────────────────────────────────────────────────────
      { type: 'navigate', to: 'ai', video: { chapter: 'L’assistant', transition: 'fade' },
        narrate: 'Reste l’assistant : un expert en astronomie qui tient compte de votre position et de votre matériel.' },
      { type: 'highlight', target: 'ai-suggestions', label: 'Suggestions',
        narrate: 'Des questions prêtes à l’emploi sont classées par thème.' },
      { type: 'type', target: 'ai-input', text: 'Que puis-je observer ce soir avec des jumelles ?',
        narrate: 'Vous pouvez aussi poser librement votre propre question.' },
      { type: 'narrate', title: 'Assistant',
        text: 'Pour obtenir les réponses, il suffit d’ajouter votre propre clé OpenRouter ou Anthropic dans les réglages. Aucune clé n’est utilisée dans cette démonstration.' },
    ],
  },
}

export default presentation
