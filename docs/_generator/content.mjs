// Source de vérité du contenu documentaire Astror.
// Toute affirmation ici doit être vérifiable dans le code source (src/) — voir DOCUMENTATION_SPEC.md §41.
// Ne jamais ajouter un comportement qui n'existe pas dans le code ; marquer "À vérifier" sinon.

export const APP_VERSION = '1.1.0';
export const DOC_VERSION = '1.1.0';
export const DOC_UPDATED = '2026-08-29';

const verify = (text) => `<div class="callout verify"><div class="callout-title">À vérifier</div><p>${text}</p></div>`;
const legalNote = (text) => `<div class="callout legal"><div class="callout-title">À valider juridiquement</div><p>${text}</p></div>`;
const tbl = (html) => `<div class="table-wrap">${html}</div>`;

// ============================================================================
// NAVIGATION (§7) — structure en chapitres/sous-chapitres repliables (§5)
// ============================================================================
export const NAV = [
  {
    id: 'start', icon: '🚀', title: 'Bien démarrer',
    pages: [{ id: 'getting-started', title: 'Installer et démarrer', path: '/getting-started/' }],
  },
  {
    id: 'about', icon: '🧭', title: "Comprendre l'application",
    pages: [{ id: 'about', title: "Qu'est-ce qu'Astror", path: '/about/' }],
  },
  {
    id: 'guide', icon: '📖', title: 'Guide utilisateur',
    pages: [
      { id: 'guide-index', title: "Vue d'ensemble", path: '/guide/' },
      { id: 'guide-ciel', title: 'Ciel', path: '/guide/ciel/' },
      { id: 'guide-ephemerides', title: 'Éphémérides', path: '/guide/ephemerides/' },
      { id: 'guide-explorer', title: 'Explorer', path: '/guide/explorer/' },
      { id: 'guide-veille', title: 'Veille', path: '/guide/veille/' },
      { id: 'guide-assistant', title: 'Assistant', path: '/guide/assistant/' },
    ],
    groups: [{
      label: 'Outils',
      pages: [
        { id: 'guide-tool-observe', title: 'Observer', path: '/guide/outils/observer/' },
        { id: 'guide-tool-moon', title: 'Lune', path: '/guide/outils/lune/' },
        { id: 'guide-tool-planets', title: 'Planètes', path: '/guide/outils/planetes/' },
        { id: 'guide-tool-events', title: 'Événements', path: '/guide/outils/evenements/' },
        { id: 'guide-tool-astrophoto', title: 'Astrophoto', path: '/guide/outils/astrophoto/' },
        { id: 'guide-tool-satellites', title: 'Satellites', path: '/guide/outils/satellites/' },
        { id: 'guide-tool-education', title: 'Apprendre', path: '/guide/outils/apprendre/' },
        { id: 'guide-tool-community', title: 'Communauté', path: '/guide/outils/communaute/' },
        { id: 'guide-tool-ai', title: 'Assistant IA', path: '/guide/outils/assistant-ia/' },
        { id: 'guide-tool-extras', title: 'Explorations', path: '/guide/outils/explorations/' },
      ],
    }],
  },
  {
    id: 'features', icon: '🧩', title: 'Fonctionnalités',
    pages: [
      { id: 'features-index', title: "Vue d'ensemble", path: '/features/' },
      { id: 'feat-onboarding', title: 'Profil observateur (onboarding)', path: '/features/profil-observateur/' },
      { id: 'feat-sky', title: 'Carte du ciel interactive', path: '/features/carte-du-ciel/' },
      { id: 'feat-constellations', title: 'Fiches des 88 constellations', path: '/features/constellations/' },
      { id: 'feat-ephemerides', title: 'Éphémérides et alertes', path: '/features/ephemerides-alertes/' },
      { id: 'feat-solar', title: 'Système solaire', path: '/features/systeme-solaire/' },
      { id: 'feat-jwst', title: 'Galerie James Webb', path: '/features/james-webb/' },
      { id: 'feat-conquest', title: 'Conquête spatiale', path: '/features/conquete-spatiale/' },
      { id: 'feat-feed', title: 'Veille spatiale', path: '/features/veille-spatiale/' },
      { id: 'feat-assistant', title: 'Assistant IA', path: '/features/assistant-ia/' },
      { id: 'feat-observe', title: "Outil Observer (journal & conditions)", path: '/features/observer-journal/' },
      { id: 'feat-moon-tool', title: 'Outil Lune', path: '/features/outil-lune/' },
      { id: 'feat-planets-tool', title: 'Outil Planètes', path: '/features/outil-planetes/' },
      { id: 'feat-events-tool', title: 'Outil Événements & notifications', path: '/features/evenements-notifications/' },
      { id: 'feat-astrophoto', title: 'Outil Astrophoto', path: '/features/astrophoto/' },
      { id: 'feat-satellites', title: 'Outil Satellites', path: '/features/satellites/' },
      { id: 'feat-education', title: 'Outil Apprendre (quiz, XP, parcours)', path: '/features/apprendre/' },
      { id: 'feat-community', title: 'Outil Communauté', path: '/features/communaute/' },
      { id: 'feat-extras', title: 'Outil Explorations', path: '/features/explorations/' },
      { id: 'feat-tips', title: 'Astuces contextuelles', path: '/features/astuces-contextuelles/' },
      { id: 'feat-demo', title: 'Mode démo (visites guidées)', path: '/features/mode-demo/' },
      { id: 'feat-export', title: 'Export et import des données', path: '/features/export-import/' },
      { id: 'feat-ai-keys', title: 'Clés API pour l’IA', path: '/features/cles-api-ia/' },
      { id: 'feat-updates', title: 'Mises à jour automatiques', path: '/features/mises-a-jour/' },
    ],
  },
  { id: 'settings', icon: '⚙️', title: 'Paramètres', pages: [{ id: 'settings', title: 'Tous les paramètres', path: '/settings/' }] },
  { id: 'permissions', icon: '🔐', title: 'Permissions', pages: [{ id: 'permissions', title: 'Permissions utilisées', path: '/permissions/' }] },
  { id: 'data', icon: '🗄️', title: 'Données et confidentialité', pages: [{ id: 'data', title: 'Données et confidentialité', path: '/data/' }] },
  { id: 'offline', icon: '📡', title: 'Fonctionnement hors connexion', pages: [{ id: 'offline', title: 'Hors connexion', path: '/offline/' }] },
  {
    id: 'troubleshooting', icon: '🛠️', title: 'Dépannage',
    pages: [
      { id: 'ts-index', title: "Vue d'ensemble", path: '/troubleshooting/' },
      { id: 'ts-gps', title: 'La localisation ne fonctionne pas', path: '/troubleshooting/localisation/' },
      { id: 'ts-compass', title: 'La boussole ne fonctionne pas', path: '/troubleshooting/boussole/' },
      { id: 'ts-notif', title: 'Les notifications n’arrivent pas', path: '/troubleshooting/notifications/' },
      { id: 'ts-weather', title: 'Météo indisponible', path: '/troubleshooting/meteo/' },
      { id: 'ts-ai', title: "L’assistant IA ne répond pas", path: '/troubleshooting/assistant-ia/' },
      { id: 'ts-images', title: 'Les images ne se chargent pas', path: '/troubleshooting/images/' },
      { id: 'ts-iss', title: 'Passages ISS/Tiangong indisponibles', path: '/troubleshooting/iss/' },
      { id: 'ts-import', title: 'L’import de données échoue', path: '/troubleshooting/import/' },
    ],
  },
  { id: 'faq', icon: '❓', title: 'FAQ', pages: [{ id: 'faq', title: 'Questions fréquentes', path: '/faq/' }] },
  {
    id: 'reference', icon: '📘', title: 'Référence',
    pages: [
      { id: 'reference-index', title: "Vue d'ensemble", path: '/reference/' },
      { id: 'reference-settings', title: 'Tableau des paramètres', path: '/reference/settings/' },
      { id: 'reference-errors', title: 'Codes et messages d’erreur', path: '/reference/errors/' },
      { id: 'reference-glossary', title: 'Glossaire', path: '/reference/glossary/' },
      { id: 'reference-compatibility', title: 'Compatibilité', path: '/reference/compatibility/' },
      { id: 'reference-limitations', title: 'Limites connues', path: '/reference/limitations/' },
      { id: 'reference-apis', title: 'APIs externes (technique)', path: '/reference/apis/' },
    ],
  },
  { id: 'versions', icon: '🔄', title: 'Versions', pages: [{ id: 'versions', title: 'Historique des versions', path: '/versions/' }] },
  { id: 'legal', icon: '⚖️', title: 'Informations légales', pages: [{ id: 'legal', title: 'Informations légales', path: '/legal/' }] },
  { id: 'support', icon: '📩', title: 'Support', pages: [{ id: 'support', title: 'Obtenir de l’aide', path: '/support/' }] },
];

// ============================================================================
// CONTENU DES PAGES
// ============================================================================
export const PAGES = {};
// ---- Bien démarrer ----
PAGES['getting-started'] = {
  description: "Installation de la PWA Astror, compatibilité, premier lancement, onboarding et désinstallation.",
  html: `
<div class="eyebrow">Bien démarrer</div>
<h1>Installer et démarrer</h1>
<p class="lede">Astror est une application web progressive (PWA) : elle s'installe depuis le navigateur, sans passer par un store.</p>

<h2>Présentation</h2>
<p>Astror est un compagnon d'observation astronomique en français : carte du ciel en direct, éphémérides, outils d'observation et d'astrophotographie, veille de l'actualité spatiale et assistant conversationnel. La plupart des calculs astronomiques (Lune, Soleil, planètes, événements) sont effectués localement sur l'appareil, sans connexion requise.</p>

<h2>Installation PWA</h2>
<h3>Android (Chrome)</h3>
<ol>
  <li>Ouvrir l'adresse de l'application dans Chrome.</li>
  <li>Menu ⋮ → « Installer l'application » (ou bandeau d'installation automatique).</li>
  <li>Astror apparaît sur l'écran d'accueil comme une application native, en plein écran (mode <code>standalone</code>).</li>
</ol>
<h3>iOS (Safari)</h3>
<ol>
  <li>Ouvrir l'adresse de l'application dans Safari (l'installation PWA depuis un autre navigateur iOS n'est pas prise en charge par iOS lui-même).</li>
  <li>Bouton Partager → « Sur l'écran d'accueil ».</li>
  <li>L'icône et le nom affichés viennent du manifeste de l'application (icône 512×512, nom « Astror »).</li>
</ol>
${verify("le comportement exact de certaines fonctionnalités (boussole, notifications) peut varier légèrement entre Safari iOS et Chrome Android ; seules les contraintes explicitement gérées dans le code sont documentées (voir Permissions).")}
<h3>Ordinateur (desktop)</h3>
<p>Les navigateurs basés sur Chromium (Chrome, Edge) proposent une installation PWA via l'icône d'installation dans la barre d'adresse. ${verify("le support d'installation PWA sur Firefox desktop et sur les autres navigateurs n'est pas vérifié spécifiquement pour Astror.")}</p>

<h2>Premier lancement</h2>
<p>Au tout premier lancement (ou tant que l'introduction n'a pas été vue), Astror affiche un onboarding en 7 étapes avant de laisser accéder au reste de l'application. Détail complet : <a href="../features/profil-observateur/">Profil observateur (onboarding)</a>.</p>
${tbl(`<table><caption>Parcours du premier lancement</caption>
<tr><th>Étape</th><th>Contenu</th><th>Permission demandée</th><th>Si refusé / ignoré</th></tr>
<tr><td>0 — Bienvenue</td><td>Écran de présentation</td><td>Aucune</td><td>—</td></tr>
<tr><td>1 — Localisation</td><td>Ville d'observation, via géolocalisation ou liste de 6 villes</td><td>Géolocalisation (optionnelle, au clic)</td><td>Reste sur Paris par défaut jusqu'à choix manuel</td></tr>
<tr><td>2 — Expérience</td><td>Niveau : Débutant / Amateur / Confirmé</td><td>Aucune</td><td>Reste sur « Amateur »</td></tr>
<tr><td>3 — Intérêts</td><td>Sélection multiple (7 choix)</td><td>Aucune</td><td>Reste sur défauts</td></tr>
<tr><td>4 — Matériel</td><td>Sélection multiple (4 choix)</td><td>Aucune</td><td>Reste sur « Jumelles »</td></tr>
<tr><td>5 — Alertes</td><td>4 interrupteurs de préférence (ISS, conjonctions, météores, éclipses)</td><td>Aucune à ce stade (préférence seulement)</td><td>Reste sur les valeurs par défaut</td></tr>
<tr><td>6 — Récapitulatif</td><td>Résumé, bouton « Explorer le ciel »</td><td>Aucune</td><td>—</td></tr>
</table>`)}
<p>Un bouton « Passer » permet de sauter l'onboarding aux étapes 0 à 5 (pas sur la dernière). L'onboarding peut être rejoué à tout moment depuis <strong>Paramètres → Revoir l'introduction</strong>.</p>

<h2>Configuration initiale</h2>
<p>Les choix de l'onboarding forment le « profil » de l'utilisateur (position, niveau, intérêts, matériel, alertes). Il est stocké localement et modifiable ensuite dans les Paramètres — voir <a href="../settings/">Paramètres</a>.</p>

<h2>Permissions initiales</h2>
<p>Aucune permission n'est demandée automatiquement à l'ouverture. La géolocalisation n'est demandée que si l'utilisateur clique explicitement sur le bouton de détection GPS. Les notifications et l'orientation de l'appareil (boussole) ne sont demandées que plus tard, au moment de l'usage réel (activation d'une alerte, activation du mode boussole). Détail : <a href="../permissions/">Permissions</a>.</p>

<h2>Première utilisation</h2>
<p>Une fois l'onboarding terminé, l'application s'ouvre sur l'onglet <strong>Ciel</strong> (carte du ciel en direct).</p>

<h2>Désinstallation</h2>
<p>La désinstallation suit le mécanisme standard du système (retirer l'icône sur Android/iOS, ou désinstaller depuis le navigateur sur desktop). <strong>Toutes les données locales (profil, journal, statistiques, clés API) sont stockées dans le stockage du navigateur associé à l'application et sont supprimées avec elle.</strong> Pensez à exporter vos données avant de désinstaller — voir <a href="../features/export-import/">Export et import des données</a>.</p>

<h2>Mise à jour</h2>
<p>Astror utilise un service worker en mode <code>autoUpdate</code> (Workbox) : les nouvelles versions de l'application sont téléchargées et appliquées automatiquement en arrière-plan, sans action requise de l'utilisateur ; les nouveaux fichiers sont utilisés dès la navigation ou le rechargement suivant.</p>
`,
};

PAGES['about'] = {
  description: "Ce qu'est Astror, sa philosophie (calculs locaux + IA optionnelle) et l'organisation de ses 6 onglets.",
  html: `
<div class="eyebrow">Comprendre l'application</div>
<h1>Qu'est-ce qu'Astror</h1>
<p class="lede">Astror est une application mobile PWA pour astronomes amateurs, entièrement en français.</p>

<h2>Philosophie</h2>
<ul>
  <li><strong>Calculs locaux en priorité</strong> — les positions de la Lune, du Soleil, des planètes, les événements astronomiques (éclipses, pluies de météores, conjonctions) sont calculés directement sur l'appareil via la bibliothèque <code>astronomy-engine</code>, sans dépendre d'un serveur.</li>
  <li><strong>Données enrichies via des API publiques</strong> — météo, position de l'ISS, actualités spatiales, images Wikimedia/NASA, etc. Toutes ces sources sont publiques et ne nécessitent pas de compte (sauf configuration optionnelle, voir plus bas).</li>
  <li><strong>IA optionnelle</strong> — un assistant conversationnel et des panneaux « Analyse IA » contextuels sont disponibles si l'utilisateur configure sa propre clé API (OpenRouter ou Anthropic). Sans clé, l'application reste pleinement utilisable, seuls ces compléments sont indisponibles.</li>
  <li><strong>Aucun compte utilisateur</strong> — pas d'inscription, pas de backend applicatif : toutes les données personnelles restent dans le navigateur (voir <a href="../data/">Données et confidentialité</a>).</li>
</ul>

<h2>Les 6 onglets principaux</h2>
${tbl(`<table>
<tr><th>Onglet</th><th>Rôle</th></tr>
<tr><td><strong>Ciel</strong></td><td>Carte du ciel visible en direct, boussole de pointage, fiches d'objets</td></tr>
<tr><td><strong>Éphémérides</strong></td><td>Lune, Soleil, météo locale, alertes et calendrier céleste</td></tr>
<tr><td><strong>Explorer</strong></td><td>Système solaire, James Webb, Conquête spatiale, Anomalies, Théories, constellations</td></tr>
<tr><td><strong>Veille</strong></td><td>Actualités spatiales, conférences, personnalités, bibliothèque, photos</td></tr>
<tr><td><strong>Outils</strong></td><td>10 modules spécialisés (Observer, Lune, Planètes, Événements, Astrophoto, Satellites, Apprendre, Communauté, Assistant IA, Explorations)</td></tr>
<tr><td><strong>Assistant</strong></td><td>Chat libre avec un assistant IA spécialisé astronomie</td></tr>
</table>`)}
<p>Chaque écran propose une aide contextuelle (bouton « ? ») et une visite guidée statique (bouton lecture ▶) accessibles depuis la barre du haut. Voir <a href="../guide/">Guide utilisateur</a> pour le détail de chaque écran, et <a href="../features/mode-demo/">Mode démo</a> pour les visites guidées automatiques pilotées.</p>
`,
};
// ---- Guide utilisateur ----
PAGES['guide-index'] = {
  description: "Vue d'ensemble du guide utilisateur : les 6 onglets principaux et les 10 outils d'Astror.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Vue d'ensemble</h1>
<p class="lede">Chaque écran important d'Astror est documenté séparément : objectif, éléments d'interface, actions possibles et navigation.</p>
<div class="grid-cards">
  <a class="card" href="ciel/"><div class="card-title">🌌 Ciel</div><div class="card-sub">Carte du ciel, boussole, pointage</div></a>
  <a class="card" href="ephemerides/"><div class="card-title">🌙 Éphémérides</div><div class="card-sub">Lune, Soleil, alertes, calendrier</div></a>
  <a class="card" href="explorer/"><div class="card-title">🪐 Explorer</div><div class="card-sub">Système solaire, JWST, Conquête, constellations</div></a>
  <a class="card" href="veille/"><div class="card-title">📰 Veille</div><div class="card-sub">Actualités, conférences, bibliothèque</div></a>
  <a class="card" href="assistant/"><div class="card-title">💬 Assistant</div><div class="card-sub">Chat IA spécialisé astronomie</div></a>
</div>
<h2>Outils</h2>
<div class="grid-cards">
  <a class="card" href="outils/observer/"><div class="card-title">Observer</div><div class="card-sub">Journal & catalogue</div></a>
  <a class="card" href="outils/lune/"><div class="card-title">Lune</div><div class="card-sub">Phases & carte</div></a>
  <a class="card" href="outils/planetes/"><div class="card-title">Planètes</div><div class="card-sub">Éphémérides</div></a>
  <a class="card" href="outils/evenements/"><div class="card-title">Événements</div><div class="card-sub">Alertes & passages</div></a>
  <a class="card" href="outils/astrophoto/"><div class="card-title">Astrophoto</div><div class="card-sub">Calculs & fenêtres</div></a>
  <a class="card" href="outils/satellites/"><div class="card-title">Satellites</div><div class="card-sub">ISS & missions</div></a>
  <a class="card" href="outils/apprendre/"><div class="card-title">Apprendre</div><div class="card-sub">Quiz & parcours</div></a>
  <a class="card" href="outils/communaute/"><div class="card-title">Communauté</div><div class="card-sub">Fil & classement</div></a>
  <a class="card" href="outils/assistant-ia/"><div class="card-title">Assistant IA</div><div class="card-sub">Aide contextuelle</div></a>
  <a class="card" href="outils/explorations/"><div class="card-title">Explorations</div><div class="card-sub">Simulateurs</div></a>
</div>
`,
};

PAGES['guide-ciel'] = {
  description: "Écran Ciel : carte du ciel en direct, boussole de pointage, curseur temporel, fiche d'objet.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Ciel</h1>
<p class="lede">Carte du ciel visible « ce soir » depuis votre position, avec pointage assisté par boussole.</p>
<h2>Accès</h2><p>Premier onglet de la barre de navigation principale.</p>
<h2>Éléments de l'interface</h2>
${tbl(`<table>
<tr><th>Élément</th><th>Description</th></tr>
<tr><td>Filtres (Tout / Planètes / Étoiles / Ciel profond)</td><td>Restreignent les objets affichés sur le dôme</td></tr>
<tr><td>Dôme SVG</td><td>Étoiles, traits de constellations, objets cliquables, une étoile filante animée</td></tr>
<tr><td>Bouton boussole (rond, en haut à gauche)</td><td>Active/désactive le mode boussole (orientation réelle du téléphone)</td></tr>
<tr><td>Bouton « N »</td><td>Réinitialise une rotation manuelle de la carte</td></tr>
<tr><td>Curseur temporel</td><td>Simule le ciel jusqu'à +12 h dans le futur, par pas de 15 min</td></tr>
<tr><td>Liste « Maintenant visible »</td><td>Objets triés par magnitude (les plus brillants d'abord)</td></tr>
</table>`)}
<h2>Actions</h2>
<ul>
  <li><strong>Glisser sur le dôme</strong> → fait pivoter la carte manuellement.</li>
  <li><strong>Toucher un objet</strong> → ouvre sa fiche (magnitude, constellation, altitude/azimut, distance, lever/coucher, bouton « Pointer vers l'objet »).</li>
  <li><strong>Activer la boussole</strong> → demande la permission d'orientation de l'appareil (iOS), puis affiche un radar plein écran qui guide le geste jusqu'à l'alignement.</li>
</ul>
<h2>Cas particuliers</h2>
<p>Si aucun objet du catalogue n'est au-dessus de l'horizon, la liste affiche un message dédié. Si le capteur d'orientation ne répond pas sous 5 secondes, un panneau de diagnostic apparaît avec des instructions (autoriser les capteurs dans le navigateur, calibrer en formant un « 8 » avec le téléphone) et un repli en orientation manuelle (cap/hauteur affichés en texte).</p>
<h2>Pour aller plus loin</h2>
<p><a href="../../features/carte-du-ciel/">Fonctionnalité détaillée : Carte du ciel interactive</a> · <a href="../../features/constellations/">Fiches des 88 constellations</a> · <a href="../../troubleshooting/boussole/">Dépannage boussole</a></p>
`,
};

PAGES['guide-ephemerides'] = {
  description: "Écran Éphémérides : Lune, Soleil, météo locale, alertes ISS/conjonctions, calendrier céleste.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Éphémérides</h1>
<p class="lede">Vue synthétique de la nuit : Lune, Soleil, conditions d'observation, alertes et calendrier céleste.</p>
<h2>Éléments de l'interface</h2>
${tbl(`<table>
<tr><th>Élément</th><th>Description</th></tr>
<tr><td>Carte Lune</td><td>Phase, % d'illumination, âge en jours, lever/coucher, distance</td></tr>
<tr><td>Carte Soleil</td><td>Lever, coucher, aube/crépuscule astronomiques, durée de nuit noire</td></tr>
<tr><td>Alertes (icône cloche)</td><td>Passages ISS/Tiangong visibles de nuit, conjonctions Lune-planète</td></tr>
<tr><td>Calendrier céleste</td><td>6 prochains événements avec compte à rebours</td></tr>
<tr><td>Conditions d'observation</td><td>Seeing, transparence, indice de Bortle, nuages, humidité, température</td></tr>
</table>`)}
<h2>Actions</h2>
<ul>
  <li><strong>Activer une alerte</strong> → demande la permission de notification si elle n'est pas déjà accordée.</li>
  <li><strong>Toucher une alerte ou un événement</strong> → ouvre une fiche détaillée avec un panneau « Analyse IA » et, pour les alertes, un interrupteur de notification dédié.</li>
</ul>
<h2>Cas particuliers</h2>
<p>Si tous les passages ISS des prochaines 24 h ont lieu de jour, un message informatif l'indique explicitement plutôt que de ne rien afficher. Si la météo ne charge pas, la carte affiche « Données météo indisponibles ». Si la permission de notification a été refusée dans le navigateur, un bandeau l'indique et invite à l'autoriser manuellement dans les paramètres du navigateur.</p>
<h2>Pour aller plus loin</h2>
<p><a href="../../features/ephemerides-alertes/">Fonctionnalité détaillée : Éphémérides et alertes</a> · <a href="../../troubleshooting/meteo/">Dépannage météo</a> · <a href="../../troubleshooting/iss/">Dépannage ISS</a></p>
`,
};

PAGES['guide-explorer'] = {
  description: "Écran Explorer : Système solaire, James Webb, Conquête spatiale, Anomalies, Théories, constellations.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Explorer</h1>
<p class="lede">Cinq sous-onglets pour explorer le cosmos : Système solaire, James Webb, Conquête spatiale, Anomalies, Théories.</p>
${tbl(`<table>
<tr><th>Sous-onglet</th><th>Contenu</th></tr>
<tr><td><strong>Système solaire</strong></td><td>Carrousel des 8 planètes avec badge de visibilité en direct, fiches des lunes (photos NASA), fiche Soleil, et section « Les 88 constellations » (recherche + filtres)</td></tr>
<tr><td><strong>James Webb</strong></td><td>Grille d'images récentes issues de Wikimedia Commons, triées par date, avec description et lien vers Wikimedia</td></tr>
<tr><td><strong>Conquête spatiale</strong></td><td>Article « De Spoutnik à Mars » en 10 chapitres + Annexes interactives (Chronologie, Glossaire, Missions, Biographies)</td></tr>
<tr><td><strong>Anomalies</strong></td><td>Phénomènes non expliqués, avec panneau IA et lien Wikipédia externe</td></tr>
<tr><td><strong>Théories</strong></td><td>Grandes théories (matière noire, trous noirs…), avec panneau IA et lien Wikipédia externe</td></tr>
</table>`)}
<h2>Actions notables</h2>
<ul>
  <li>Dans la Conquête spatiale → Annexes, les entrées de <strong>Chronologie</strong>, <strong>Glossaire</strong> et <strong>Missions</strong> sont cliquables et ouvrent une fiche Wikipédia complète. Les <strong>Biographies</strong> sont affichées en cartes non cliquables (pas de fiche Wikipédia associée dans cette section).</li>
  <li>Dans « Les 88 constellations », toucher une carte ouvre sa fiche complète (histoire, données, lien Wikipédia).</li>
</ul>
<h2>Cas particuliers</h2>
<p>Si les images (JWST, galeries de planètes/lunes) ne se chargent pas, l'onglet James Webb affiche un message explicite invitant à vérifier la connexion ; les autres galeries échouent silencieusement (aucune image affichée, pas de message).</p>
<h2>Pour aller plus loin</h2>
<p><a href="../../features/systeme-solaire/">Système solaire</a> · <a href="../../features/james-webb/">Galerie James Webb</a> · <a href="../../features/conquete-spatiale/">Conquête spatiale</a> · <a href="../../features/constellations/">Constellations</a></p>
`,
};

PAGES['guide-veille'] = {
  description: "Écran Veille : actualités, conférences, personnalités, bibliothèque, photos du ciel.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Veille</h1>
<p class="lede">Cinq sous-onglets pour suivre l'actualité spatiale : Actualités, Conférences, Personnalités, Bibliothèque, Photos du ciel.</p>
${tbl(`<table>
<tr><th>Sous-onglet</th><th>Contenu</th></tr>
<tr><td>Actualités</td><td>Dernières actualités spatiales (Spaceflight News API)</td></tr>
<tr><td>Conférences</td><td>Catalogue d'événements + affiches générées, images Wikipédia</td></tr>
<tr><td>Personnalités</td><td>Figures de l'astronomie/spatial avec photo Wikipédia</td></tr>
<tr><td>Bibliothèque</td><td>Recherche de livres (Google Books ou Open Library) + ajout à sa liste</td></tr>
<tr><td>Photos du ciel</td><td>Vignettes issues de sites/catégories (APOD, Hubble, JWST, ESO, Astrobin)</td></tr>
</table>`)}
<h2>Actions</h2>
<ul>
  <li>Bouton <strong>+ Ajouter</strong> (sur les 4 premiers sous-onglets) → formulaire d'ajout personnel, avec auto-complétion Wikipédia pour les personnalités. Les éléments ajoutés sont marqués « Enregistré sur cet appareil ».</li>
  <li>Suppression possible uniquement pour les éléments ajoutés par l'utilisateur — le catalogue par défaut n'est pas modifiable.</li>
</ul>
<h2>Cas particuliers</h2>
<p>Recherche de livres en échec réseau → « Erreur de recherche. Vérifiez votre connexion. » Recherche sans résultat → « Aucun résultat ». Les autres enrichissements (images, actualités) échouent silencieusement en cas de coupure réseau.</p>
<h2>Pour aller plus loin</h2>
<p><a href="../../features/veille-spatiale/">Fonctionnalité détaillée : Veille spatiale</a></p>
`,
};

PAGES['guide-assistant'] = {
  description: "Écran Assistant : chat libre avec un assistant IA spécialisé astronomie.",
  html: `
<div class="eyebrow">Guide utilisateur</div>
<h1>Assistant</h1>
<p class="lede">Chat avec un assistant IA spécialisé en astronomie, réponses concises (4 à 6 phrases).</p>
<h2>Éléments de l'interface</h2>
<ul>
  <li><strong>Panneau de suggestions</strong> : 11 catégories de questions prêtes à l'emploi (Utilisation d'Astror, Observer, Instruments, Astrophoto, Système solaire, Ciel profond, Astrophysique, Cosmologie, Conquête spatiale, Agences spatiales, Fusées & lanceurs).</li>
  <li><strong>Zone de chat</strong> avec indicateur de saisie animé.</li>
  <li><strong>Champ de saisie</strong> + bouton d'envoi.</li>
</ul>
<h2>Prérequis</h2>
<p>Nécessite une clé API configurée dans <strong>Paramètres</strong> (OpenRouter ou Anthropic). Sans clé : « Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant. »</p>
<h2>Cas particuliers</h2>
<p>L'historique de conversation n'est pas conservé entre deux ouvertures de l'écran (pas de sauvegarde locale du chat). Toute erreur réseau ou de clé invalide affiche : « Erreur de connexion. Vérifiez votre clé API dans les Paramètres. »</p>
<h2>Pour aller plus loin</h2>
<p><a href="../../features/assistant-ia/">Fonctionnalité détaillée : Assistant IA</a> · <a href="../../features/cles-api-ia/">Configurer une clé API</a> · <a href="../../troubleshooting/assistant-ia/">Dépannage</a></p>
`,
};
// ---- Guide : Outils ----
PAGES['guide-tool-observe'] = {
  description: "Outil Observer : conditions d'observation, meilleurs créneaux, journal personnel, catalogues d'objets.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Observer</h1>
<p class="lede">Préparer une session d'observation et tenir un journal personnel.</p>
<h2>Accès</h2><p>Onglet Outils → Observer.</p>
<h2>3 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Préparer</td><td>Nuages, seeing, transparence, pollution lumineuse (Bortle), meilleurs créneaux de la nuit, lever/coucher Soleil/Lune/planètes visibles</td></tr>
<tr><td>Journal</td><td>Liste de sessions personnelles ; bouton « + Note » pour ajouter un objet observé et des commentaires</td></tr>
<tr><td>Objets</td><td>Catalogues filtrables : Visibles ce soir, Recommandés, Messier, NGC, IC, Caldwell</td></tr>
</table>`)}
<h2>Cas particuliers</h2>
<p>« Nuit blanche — pas de nuit astronomique ce soir à cette latitude » si aucune fenêtre n'est calculable. Journal vide : « Aucune session enregistrée pour l'instant. » L'indice de Bortle affiché est une valeur fixe (4), pas une mesure géolocalisée réelle.</p>
<p><a href="../../../features/observer-journal/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-moon'] = {
  description: "Outil Lune : suivi de phase et cartographie lunaire (mers, cratères recommandés).",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Lune</h1>
<p class="lede">Suivi de phase et cartographie lunaire.</p>
<h2>2 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Suivi lunaire</td><td>Disque lunaire stylisé, phase, métriques, panneau IA</td></tr>
<tr><td>Cartographie</td><td>Grand disque, zones recommandées, listes des mers et cratères avec bouton IA « Approfondir »</td></tr>
</table>`)}
<p>Depuis la version 1.1.0, la phase, l'illumination, l'âge, la distance et le diamètre apparent sont calculés en direct (astronomy-engine) et non plus figés — voir <a href="../../../features/outil-lune/">Détails complets de la fonctionnalité</a>.</p>
`,
};

PAGES['guide-tool-planets'] = {
  description: "Outil Planètes : éphémérides et simulateur d'oculaire.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Planètes</h1>
<p class="lede">Éphémérides planétaires et simulateur d'oculaire.</p>
<h2>2 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Éphémérides</td><td>Liste des 7 planètes visibles, panneau IA de synthèse, oppositions et élongations à venir</td></tr>
<tr><td>Observation</td><td>Simulateur d'oculaire par planète (anneaux de Saturne, bandes de Jupiter en CSS), taille apparente, magnitude, phase, distance, barre de visibilité</td></tr>
</table>`)}
<p>Depuis la version 1.1.0, ces données sont calculées en direct (astronomy-engine) et non plus figées — voir <a href="../../../features/outil-planetes/">Détails complets de la fonctionnalité</a>.</p>
`,
};

PAGES['guide-tool-events'] = {
  description: "Outil Événements : calendrier céleste et notifications de rappel.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Événements</h1>
<p class="lede">Calendrier des événements astronomiques (18 mois à venir, 7 jours passés) et notifications de rappel.</p>
<h2>2 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>À venir</td><td>Filtre par catégorie (Tout/Éclipses/Météores/Spécial), panneau IA par événement</td></tr>
<tr><td>Notifications</td><td>Bannière si permission refusée, événements des 7 derniers jours, 4 interrupteurs (ISS, planètes bien placées, météores, éclipses)</td></tr>
</table>`)}
<h2>Cas particuliers</h2>
<p>« Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du navigateur pour les activer. » si la permission a été refusée. Le rappel est programmé 60 minutes avant l'événement et repose sur un minuteur local : il ne se déclenche pas si l'application est fermée.</p>
<p><a href="../../../features/evenements-notifications/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-astrophoto'] = {
  description: "Outil Astrophoto : planification de session, règles des 500/NPF, simulateur de cadrage.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Astrophoto</h1>
<p class="lede">Planifier une session photo et calculer les réglages d'exposition.</p>
<h2>2 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Planifier</td><td>Fenêtre de nuit, heure bleue, crépuscule/aube astronomiques, météo/seeing, orientation de la Voie Lactée</td></tr>
<tr><td>Outils</td><td>Curseur focale, sélecteur de capteur (Plein format/APS-C/Micro 4/3), calcul en direct des règles des 500 et NPF, simulateur de cadrage visuel (M31, Lune à l'échelle)</td></tr>
</table>`)}
<h2>Formules utilisées</h2>
<p><code>Pose 500 = 500 / (focale × crop)</code> · <code>Pose NPF = 300 / (focale × crop)</code> · <code>Champ de vue = 2·atan(capteur / (2·focale)) × 180/π</code></p>
<p><a href="../../../features/astrophoto/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-satellites'] = {
  description: "Outil Satellites : ISS en direct, passages visibles, missions, lancements, sondes lointaines.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Satellites</h1>
<p class="lede">Suivi ISS en direct, passages visibles, missions en cours et distances des sondes lointaines.</p>
<h2>2 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Suivi</td><td>Position ISS (altitude/vitesse, mise à jour toutes les 10 s), passages visibles sur 24 h, panneau IA pour Tiangong/Starlink/Hubble</td></tr>
<tr><td>Exploration</td><td>Missions en cours (JWST, Perseverance, JUICE, Artemis), prochains lancements, distances des sondes lointaines (Voyager 1/2, New Horizons, Parker Solar Probe)</td></tr>
</table>`)}
<h2>Cas particuliers</h2>
<p>« Aucun passage visible depuis votre position dans les 24 prochaines heures. » ou « Impossible de récupérer les données de passage. » selon le cas. Le calcul de passage nécessite une connexion pour récupérer les données orbitales à jour (TLE), même si la propagation est ensuite locale.</p>
<p><a href="../../../features/satellites/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-education'] = {
  description: "Outil Apprendre : quiz, défi du jour, XP, parcours pédagogiques, glossaire de 47 termes.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Apprendre</h1>
<p class="lede">Quiz, défis, parcours pédagogiques et glossaire pour progresser en astronomie.</p>
<h2>3 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Apprentissage</td><td>XP et streak, défi du jour, quiz de 40 questions (6 catégories, mode chrono, joker 50/50), 4 parcours pédagogiques avec leçons complètes</td></tr>
<tr><td>Contenus</td><td>Photo du jour NASA (APOD), actualités éducatives, 4 articles de fond</td></tr>
<tr><td>Glossaire</td><td>47 termes recherchables, bouton « Approfondir avec l'IA »</td></tr>
</table>`)}
<h2>Cas particuliers</h2>
<p>Le joker 50/50 ne peut être utilisé qu'une fois par partie de 5 questions. Un seul défi du jour est validable par jour calendaire. Sans clé IA configurée : « Configurez une clé API dans les Paramètres pour activer les réponses IA. »</p>
<p><a href="../../../features/apprendre/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-community'] = {
  description: "Outil Communauté : fil Mastodon, classement configurable, sorties et actualités RSS.",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Communauté</h1>
<p class="lede">Fil d'actualité communautaire, classement et sorties de clubs d'astronomie.</p>
<h2>3 segments</h2>
${tbl(`<table><tr><th>Segment</th><th>Source</th><th>Repli si indisponible</th></tr>
<tr><td>Fil</td><td>Mastodon public (hashtag #astrophotography)</td><td>Publications de démonstration + bannière explicite</td></tr>
<tr><td>Classement</td><td>Google Sheets public, URL à configurer dans Paramètres</td><td>Classement de démonstration tant que l'URL n'est pas configurée</td></tr>
<tr><td>Sorties</td><td>Flux RSS de clubs d'astronomie</td><td>Événements de démonstration + bannière explicite</td></tr>
</table>`)}
<h2>Cas particuliers</h2>
<p>« Impossible de charger la feuille. Vérifiez que l'URL est correcte et que la feuille est partagée en lecture publique. » si l'URL du classement est invalide.</p>
<p><a href="../../../features/communaute/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-ai'] = {
  description: "Outil Assistant IA : chat contextuel utilisant le profil de l'utilisateur (position, niveau, matériel).",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Assistant IA</h1>
<p class="lede">Chat IA dont le contexte (position, niveau, matériel) est automatiquement injecté depuis le profil.</p>
<h2>Utilisation</h2>
<p>Saisir une question ou choisir une suggestion parmi 10 catégories thématiques. L'historique de conversation est conservé en mémoire seulement (perdu à la fermeture de l'outil).</p>
<h2>Cas particuliers</h2>
<p>Sans clé API : « Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant. » En cas d'échec réseau avec une clé configurée : réponses de repli génériques choisies par mots-clés.</p>
<p><a href="../../../features/assistant-ia/">Détails complets de la fonctionnalité</a></p>
`,
};

PAGES['guide-tool-extras'] = {
  description: "Outil Explorations : simulateurs pédagogiques (échelle, impact, top 10, voyages).",
  html: `
<div class="eyebrow">Guide utilisateur — Outils</div>
<h1>Explorations</h1>
<p class="lede">Quatre simulateurs pédagogiques, entièrement fonctionnels hors connexion.</p>
${tbl(`<table><tr><th>Segment</th><th>Contenu</th></tr>
<tr><td>Échelle</td><td>Curseur parcourant 9 objets, de l'Everest à l'Univers observable</td></tr>
<tr><td>Impact</td><td>Simulateur de masse d'impact (énergie, équivalent TNT, diamètre de cratère)</td></tr>
<tr><td>Top 10</td><td>Sélection de 10 objets du ciel profond, favorisant les objets « de saison »</td></tr>
<tr><td>Voyages</td><td>6 fiches interactives (Soleil, lunes de Jupiter, échelle du système solaire, toile cosmique, étoile à neutrons, trou noir)</td></tr>
</table>`)}
<p><a href="../../../features/explorations/">Détails complets de la fonctionnalité</a></p>
`,
};
// ---- Fonctionnalités ----
PAGES['features-index'] = {
  description: "Liste de toutes les fonctionnalités documentées d'Astror.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Vue d'ensemble</h1>
<p class="lede">Chaque fonctionnalité est documentée selon la même structure : description, prérequis, utilisation, données, fonctionnement hors connexion, limites et erreurs.</p>
<div class="grid-cards">
  <a class="card" href="profil-observateur/"><div class="card-title">Profil observateur</div><div class="card-sub">Onboarding + édition</div></a>
  <a class="card" href="carte-du-ciel/"><div class="card-title">Carte du ciel</div><div class="card-sub">Boussole, curseur temporel</div></a>
  <a class="card" href="constellations/"><div class="card-title">Constellations</div><div class="card-sub">88 fiches</div></a>
  <a class="card" href="ephemerides-alertes/"><div class="card-title">Éphémérides & alertes</div><div class="card-sub">Lune, Soleil, ISS</div></a>
  <a class="card" href="systeme-solaire/"><div class="card-title">Système solaire</div><div class="card-sub">Planètes, lunes</div></a>
  <a class="card" href="james-webb/"><div class="card-title">James Webb</div><div class="card-sub">Galerie d'images</div></a>
  <a class="card" href="conquete-spatiale/"><div class="card-title">Conquête spatiale</div><div class="card-sub">Article + annexes</div></a>
  <a class="card" href="veille-spatiale/"><div class="card-title">Veille spatiale</div><div class="card-sub">Actus, bibliothèque</div></a>
  <a class="card" href="assistant-ia/"><div class="card-title">Assistant IA</div><div class="card-sub">Chat & panneaux IA</div></a>
  <a class="card" href="observer-journal/"><div class="card-title">Observer</div><div class="card-sub">Journal & conditions</div></a>
  <a class="card" href="outil-lune/"><div class="card-title">Outil Lune</div><div class="card-sub">Phases & carte</div></a>
  <a class="card" href="outil-planetes/"><div class="card-title">Outil Planètes</div><div class="card-sub">Éphémérides</div></a>
  <a class="card" href="evenements-notifications/"><div class="card-title">Événements</div><div class="card-sub">Notifications</div></a>
  <a class="card" href="astrophoto/"><div class="card-title">Astrophoto</div><div class="card-sub">Calculs & cadrage</div></a>
  <a class="card" href="satellites/"><div class="card-title">Satellites</div><div class="card-sub">ISS & sondes</div></a>
  <a class="card" href="apprendre/"><div class="card-title">Apprendre</div><div class="card-sub">Quiz, XP, parcours</div></a>
  <a class="card" href="communaute/"><div class="card-title">Communauté</div><div class="card-sub">Fil & classement</div></a>
  <a class="card" href="explorations/"><div class="card-title">Explorations</div><div class="card-sub">Simulateurs</div></a>
  <a class="card" href="astuces-contextuelles/"><div class="card-title">Astuces contextuelles</div><div class="card-sub">Bandeaux d'aide</div></a>
  <a class="card" href="mode-demo/"><div class="card-title">Mode démo</div><div class="card-sub">Visites guidées</div></a>
  <a class="card" href="export-import/"><div class="card-title">Export / import</div><div class="card-sub">Sauvegarde des données</div></a>
  <a class="card" href="cles-api-ia/"><div class="card-title">Clés API IA</div><div class="card-sub">OpenRouter, Anthropic</div></a>
</div>
`,
};

PAGES['feat-onboarding'] = {
  description: "Profil observateur : les 7 étapes de l'onboarding et leur édition ultérieure dans les Paramètres.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Profil observateur (onboarding)</h1>
<h2>Description</h2>
<p>Un court questionnaire en 7 étapes construit le « profil » utilisé dans toute l'application : position d'observation, niveau, centres d'intérêt, matériel et préférences d'alertes.</p>
<h2>Objectif</h2>
<p>Adapter les calculs (position) et le contenu affiché sans compte utilisateur.</p>
<h2>Prérequis</h2><p>Aucun. La géolocalisation est optionnelle.</p>
<h2>Comment l'utiliser</h2>
<p>Affiché automatiquement au premier lancement ; peut être rejoué à tout moment via <strong>Paramètres → Revoir l'introduction</strong>. Détail des 7 étapes : <a href="../../getting-started/">Bien démarrer</a>.</p>
<h2>Options</h2>
<p>Chaque champ du profil reste modifiable individuellement ensuite, sans repasser par l'onboarding complet — voir <a href="../../settings/">Paramètres</a>.</p>
<h2>Paramètres associés</h2>
<p>Niveau d'expérience, Localisation, Centres d'intérêt, Matériel, Alertes (voir <a href="../../reference/settings/">tableau des paramètres</a>).</p>
<h2>Données utilisées</h2>
<p>Stocké en clair dans <code>localStorage['astror_profile_v1']</code> : <code>{ location:{city,lat,lng}, level, interests[], gear[], alerts:{iss,conj,meteor,eclipse} }</code>. Flag séparé <code>astror_onboarded_v1</code> indiquant si l'introduction a déjà été vue.</p>
<h2>Résultat</h2>
<p>Le profil pilote la position par défaut (carte du ciel, calculs astro, météo), les alertes proposées et le contexte donné à l'assistant IA.</p>
<h2>Fonctionnement hors connexion</h2>
<p>Entièrement fonctionnel hors connexion, sauf : la détection GPS + conversion en nom de ville (dépend d'un service de géocodage externe — sans réseau, le profil garde des coordonnées brutes du type « 48.8°N »).</p>
<h2>Limites</h2>
<p>Aucune connue. <span class="small">(Depuis la version 1.1.0 : « Revoir l'introduction » pré-remplit désormais l'onboarding avec le profil actuel au lieu de repartir des valeurs par défaut.)</span></p>
<h2>Erreurs possibles</h2>
<p>Si la géolocalisation est refusée par le navigateur, aucun message d'erreur explicite n'est affiché : le bouton repasse simplement à son état initial.</p>
<h2>Dépannage</h2>
<p><a href="../../troubleshooting/localisation/">La localisation ne fonctionne pas</a></p>
<h2>FAQ</h2>
<p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-sky'] = {
  description: "Carte du ciel : projection en direct, boussole AR, rotation manuelle, curseur temporel +12h.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Carte du ciel interactive</h1>
<h2>Description</h2>
<p>Représentation du ciel visible depuis la position de l'utilisateur, avec pointage assisté par la boussole du téléphone.</p>
<h2>Objectif</h2><p>Aider à localiser un objet céleste dans le ciel réel.</p>
<h2>Prérequis</h2><p>Position du profil (par défaut Paris). La boussole nécessite l'autorisation du capteur d'orientation.</p>
<h2>Comment l'utiliser</h2>
<ol>
  <li>Filtrer par catégorie si besoin (Tout / Planètes / Étoiles / Ciel profond).</li>
  <li>Faire glisser la carte pour la faire pivoter manuellement, ou activer la boussole pour un alignement automatique sur l'orientation réelle du téléphone.</li>
  <li>Toucher un objet pour voir sa fiche puis, si besoin, lancer le pointage guidé (« Pointer vers l'objet »).</li>
  <li>Déplacer le curseur temporel (jusqu'à +12 h, pas de 15 min) pour prévisualiser le ciel futur.</li>
</ol>
<h2>Options</h2>
<p>Filtres d'affichage, mode boussole on/off, rotation manuelle avec réinitialisation (bouton « N »).</p>
<h2>Paramètres associés</h2>
<p>Aucun réglage persistant propre à cette fonctionnalité ; la position utilisée vient du profil (<a href="../../features/profil-observateur/">Profil observateur</a>).</p>
<h2>Données utilisées</h2>
<p>Aucune donnée locale propre. Position lue depuis le profil.</p>
<h2>Résultat</h2>
<p>Carte SVG interactive + overlay de pointage en plein écran avec indicateur d'alignement.</p>
<h2>Fonctionnement hors connexion</h2>
<p><span class="badge ok">100 % hors ligne</span> — toutes les positions sont calculées localement (astronomy-engine). Seul le panneau « Analyse IA » de la fiche d'un objet nécessite une clé API et le réseau.</p>
<h2>Limites</h2>
<p>Le mode boussole dépend du capteur du téléphone : il peut être bloqué par le navigateur (notamment Chrome desktop) ou nécessiter une calibration manuelle. Si aucune donnée d'orientation n'arrive sous 5 secondes, l'application repasse automatiquement en mode manuel.</p>
<h2>Erreurs possibles</h2>
<ul>
  <li>« Capteur boussole indisponible » — capteur non détecté.</li>
  <li>« Aucun objet du catalogue au-dessus de l'horizon en ce moment. » — liste vide selon filtre/heure.</li>
</ul>
<h2>Dépannage</h2><p><a href="../../troubleshooting/boussole/">La boussole ne fonctionne pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-constellations'] = {
  description: "Fiches des 88 constellations UAI : recherche, filtres, histoire, lien Wikipédia.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Fiches des 88 constellations</h1>
<h2>Description</h2>
<p>Base de données complète des 88 constellations reconnues par l'Union astronomique internationale, avec recherche et fiches détaillées.</p>
<h2>Objectif</h2><p>Documentation de référence sur les constellations, accessible depuis l'onglet Ciel (traits sur la carte) et Explorer (liste complète).</p>
<h2>Prérequis</h2><p>Aucun. Le lien vers la fiche Wikipédia complète nécessite une connexion.</p>
<h2>Comment l'utiliser</h2>
<p>Dans Explorer → Système solaire → « Les 88 constellations » : rechercher par nom (français, latin) ou étoile principale, filtrer par Zodiaque/Boréales/Australes, puis toucher une carte pour ouvrir sa fiche. Sur la carte du ciel, toucher un tracé de constellation ouvre la même fiche.</p>
<h2>Options</h2><p>Recherche texte libre, filtres Toutes/Zodiaque/Boréales/Australes.</p>
<h2>Données utilisées</h2><p>Aucune donnée personnelle. Contenu statique embarqué dans l'application (nom, étoile principale, saison, hémisphère, superficie, histoire/mythologie, lien Wikipédia).</p>
<h2>Résultat</h2><p>Fiche avec tags (Zodiaque/Hémisphère/Saison), historique, panneau IA, données chiffrées et bouton « Fiche Wikipédia » ouvrant un résumé complet.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">Fiches disponibles hors ligne</span> — le contenu de base (histoire, données) est embarqué. Le résumé Wikipédia et le panneau IA nécessitent une connexion.</p>
<h2>Limites</h2><p>Recherche par préfixe uniquement pour les noms abrégés (ex. « Écu » retrouve « Écu de Sobieski ») — une faute de frappe peut ne donner aucun résultat.</p>
<h2>Erreurs possibles</h2><p>« Aucune constellation ne correspond à cette recherche. » Le résumé Wikipédia affiche « Article non disponible » si les versions française et anglaise échouent toutes les deux.</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/images/">Les images ne se chargent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-ephemerides'] = {
  description: "Lune, Soleil, météo, alertes ISS/conjonctions et calendrier céleste calculé.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Éphémérides et alertes</h1>
<h2>Description</h2><p>Synthèse quotidienne : position de la Lune et du Soleil, conditions d'observation, alertes de passages et calendrier des événements célestes.</p>
<h2>Objectif</h2><p>Savoir en un coup d'œil ce qu'il se passe cette nuit et être prévenu des événements notables.</p>
<h2>Prérequis</h2><p>Position du profil. Les alertes nécessitent la permission de notification du navigateur.</p>
<h2>Comment l'utiliser</h2><p>Consulter l'écran Éphémérides ; activer les interrupteurs d'alerte souhaités (ISS, conjonctions, météores, éclipses) ; toucher un événement pour le détail et l'analyse IA.</p>
<h2>Options</h2><p>4 types d'alerte activables indépendamment.</p>
<h2>Paramètres associés</h2><p>Préférences d'alerte du profil (<a href="../../settings/">Paramètres</a>) ; préférences de notification séparées (<code>astror_notif_prefs_v1</code>, partagées avec l'outil Événements).</p>
<h2>Données utilisées</h2><p><code>astror_notif_prefs_v1</code> (préférences de notification).</p>
<h2>Résultat</h2><p>Notifications programmées localement (60 min avant un événement pour les alertes d'événement) + affichage synthétique.</p>
<h2>Fonctionnement hors connexion</h2>
${tbl(`<table><tr><th>Élément</th><th>Hors ligne</th><th>En ligne</th></tr>
<tr><td>Lune, Soleil, conjonctions, calendrier</td><td>✓ Calcul local</td><td>—</td></tr>
<tr><td>Météo (conditions d'observation)</td><td>✗</td><td>Open-Meteo</td></tr>
<tr><td>Passages ISS/Tiangong</td><td>Partiel (calcul local, données orbitales à télécharger)</td><td>wheretheiss.at / Celestrak</td></tr>
</table>`)}
<h2>Limites</h2><p>Les notifications reposent sur un minuteur local : elles ne se déclenchent pas si l'application ou l'onglet est fermé.</p>
<h2>Erreurs possibles</h2><p>« Données météo indisponibles » · « Les notifications sont bloquées dans votre navigateur… » · aucune alerte affichée si les deux sources de données ISS/Tiangong échouent (pas de message dédié dans ce cas précis).</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/meteo/">Météo indisponible</a> · <a href="../../troubleshooting/notifications/">Notifications</a> · <a href="../../troubleshooting/iss/">Passages ISS</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-solar'] = {
  description: "Système solaire : 8 planètes avec visibilité en direct, lunes, Soleil, galeries photo.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Système solaire</h1>
<h2>Description</h2><p>Fiches des 8 planètes, de leurs lunes principales et du Soleil, avec indicateur de visibilité calculé en direct.</p>
<h2>Objectif</h2><p>Découvrir chaque corps du système solaire et savoir s'il est observable ce soir.</p>
<h2>Prérequis</h2><p>Aucun pour la consultation ; position du profil pour le badge de visibilité.</p>
<h2>Comment l'utiliser</h2><p>Faire défiler le carrousel des planètes ; toucher une planète pour sa fiche ; bouton lunes pour la liste détaillée (tags Eau/Vie potentielle/Mission) ; galerie photo NASA sur chaque fiche.</p>
<h2>Données utilisées</h2><p>Aucune donnée personnelle stockée. Position du profil utilisée pour le calcul de visibilité.</p>
<h2>Résultat</h2><p>Badge « Visible ce soir » / « Non visible » par planète, calculé via astronomy-engine.</p>
<h2>Fonctionnement hors connexion</h2><p>Calcul de visibilité et données descriptives : <span class="badge ok">hors ligne</span>. Galeries photo NASA/Wikimedia : <span class="badge no">nécessitent Internet</span>.</p>
<h2>Limites</h2><p>Le calcul de position planétaire est entouré d'un repli silencieux (liste vide) en cas d'erreur de calcul interne.</p>
<h2>Erreurs possibles</h2><p>Galeries vides si le réseau est indisponible, sans message dédié.</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/images/">Les images ne se chargent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-jwst'] = {
  description: "Galerie d'images récentes du télescope James Webb, issues de Wikimedia Commons.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Galerie James Webb</h1>
<h2>Description</h2><p>Grille des images les plus récentes du télescope spatial James Webb, triées par date.</p>
<h2>Objectif</h2><p>Voir les dernières observations du JWST sans quitter l'application.</p>
<h2>Prérequis</h2><p>Connexion Internet requise.</p>
<h2>Comment l'utiliser</h2><p>Faire défiler la grille ; bouton « ↻ Actualiser » pour relancer le chargement ; toucher une image pour la description complète et le lien Wikimedia Commons.</p>
<h2>Données utilisées</h2><p>Aucune donnée personnelle.</p>
<h2>Résultat</h2><p>Grille d'images avec description et date.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge no">Nécessite Internet</span> — aucune image n'est mise en cache par le service worker.</p>
<h2>Limites</h2><p>Dépend entièrement de la disponibilité et du contenu de la catégorie Wikimedia Commons associée au JWST.</p>
<h2>Erreurs possibles</h2><p>« Impossible de charger les images. Vérifiez votre connexion et réessayez. »</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/images/">Les images ne se chargent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-conquest'] = {
  description: "Article « De Spoutnik à Mars » en 10 chapitres, avec annexes Chronologie/Glossaire/Missions/Biographies.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Conquête spatiale</h1>
<h2>Description</h2><p>Article complet « De Spoutnik à Mars — histoire, enjeux et futur de la conquête spatiale », structuré en 10 chapitres, complété par des annexes interactives.</p>
<h2>Objectif</h2><p>Offrir une lecture longue et documentée de l'histoire spatiale, avec approfondissement à la demande (Wikipédia, IA).</p>
<h2>Prérequis</h2><p>Aucun pour la lecture ; les liens Wikipédia et le panneau IA nécessitent une connexion.</p>
<h2>Comment l'utiliser</h2>
<p>Choisir un chapitre dans la liste (Introduction, 6 chapitres thématiques, Conclusion) puis lire les sections illustrées ; chaque section propose un panneau « Analyse IA ». Depuis la carte « Annexes », 4 sous-chapitres :</p>
${tbl(`<table><tr><th>Annexe</th><th>Contenu</th><th>Interactif ?</th></tr>
<tr><td>Chronologie</td><td>33 dates clés</td><td>Oui — ouvre une fiche Wikipédia</td></tr>
<tr><td>Glossaire</td><td>16 termes spatiaux</td><td>Oui — ouvre une fiche Wikipédia</td></tr>
<tr><td>Missions</td><td>15 missions emblématiques</td><td>Oui — ouvre une fiche Wikipédia</td></tr>
<tr><td>Biographies</td><td>8 pionniers</td><td>Non — cartes statiques, sans fiche Wikipédia liée</td></tr>
</table>`)}
<h2>Données utilisées</h2><p>Aucune donnée personnelle. Contenu éditorial statique embarqué.</p>
<h2>Résultat</h2><p>Lecture immersive avec images Wikimedia et approfondissement à la demande.</p>
<h2>Fonctionnement hors connexion</h2><p>Texte des chapitres et annexes : <span class="badge ok">disponible hors ligne</span>. Images, fiches Wikipédia et panneaux IA : <span class="badge no">nécessitent Internet</span>.</p>
<h2>Limites</h2><p>Les Biographies ne sont pas cliquables, contrairement aux trois autres annexes qui ont une mise en page similaire — une incohérence d'interaction à connaître.</p>
<h2>Erreurs possibles</h2><p>Une image de section peut ne pas s'afficher (repli silencieux sur une source alternative, puis absence d'image sans message si tout échoue).</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/images/">Les images ne se chargent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-feed'] = {
  description: "Veille spatiale : actualités, conférences, personnalités, bibliothèque, photos, ajout personnel.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Veille spatiale</h1>
<h2>Description</h2><p>Cinq flux de contenu pour suivre l'actualité et la culture spatiale, avec possibilité d'ajouter ses propres entrées.</p>
<h2>Objectif</h2><p>Centraliser actualités, événements, personnalités et lectures liées à l'astronomie et au spatial.</p>
<h2>Prérequis</h2><p>Connexion requise pour les contenus dynamiques (actualités, images, recherche de livres). Les entrées ajoutées manuellement restent visibles hors ligne.</p>
<h2>Comment l'utiliser</h2><p>Parcourir chaque sous-onglet ; utiliser « + Ajouter » pour enregistrer une entrée personnelle (conférence, personnalité — avec auto-complétion Wikipédia, livre, etc.) ; supprimer une entrée personnelle avec l'icône corbeille.</p>
<h2>Options</h2><p>Boutons de rafraîchissement manuels pour les images de conférences et les couvertures de livres.</p>
<h2>Paramètres associés</h2><p>Clé Google Books optionnelle (<a href="../../features/cles-api-ia/">voir Clés API</a>) pour prioriser la recherche de livres sur Google Books plutôt qu'Open Library.</p>
<h2>Données utilisées</h2>
${tbl(`<table><tr><th>Clé</th><th>Contenu</th></tr>
<tr><td><code>astror_veille_v1</code></td><td>Entrées ajoutées par l'utilisateur</td></tr>
<tr><td><code>astror_wiki_thumbs_v1</code></td><td>Cache des vignettes Wikipédia des personnalités</td></tr>
<tr><td><code>astror_book_covers_v1</code></td><td>Cache des couvertures de livres</td></tr>
<tr><td><code>astror_conf_imgs_v1</code></td><td>Cache des images de conférences</td></tr>
<tr><td><code>astror_site_photos_v1</code></td><td>Cache des vignettes par site photo</td></tr>
</table>`)}
<h2>Résultat</h2><p>Contenu enrichi automatiquement (photos, résumés) tant que le réseau est disponible ; conservé en cache localement une fois récupéré.</p>
<h2>Fonctionnement hors connexion</h2><p>Catalogues par défaut et entrées personnelles : <span class="badge ok">visibles hors ligne</span>. Actualités, recherche de livres, nouvelles images : <span class="badge no">nécessitent Internet</span>.</p>
<h2>Limites</h2><p>Seules les entrées ajoutées par l'utilisateur sont supprimables ; le catalogue par défaut ne peut pas être modifié depuis l'interface.</p>
<h2>Erreurs possibles</h2><p>« Erreur de recherche. Vérifiez votre connexion. » · « Aucun résultat » pour la recherche de livres. Les autres échecs réseau sont silencieux.</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/images/">Les images ne se chargent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};
PAGES['feat-assistant'] = {
  description: "Assistant IA : chat, panneaux « Analyse IA » contextuels, priorité OpenRouter → Anthropic.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Assistant IA</h1>
<h2>Description</h2><p>Astror intègre l'IA à deux niveaux : un chat libre (onglet Assistant et outil « Assistant IA ») et des panneaux « Analyse IA » ponctuels disséminés sur la plupart des fiches (objets, planètes, alertes, glossaire…).</p>
<h2>Objectif</h2><p>Fournir des explications contextuelles générées à la demande, sans backend propre à Astror.</p>
<h2>Prérequis</h2><p>Une clé API personnelle configurée dans Paramètres : OpenRouter ou Anthropic. Voir <a href="../cles-api-ia/">Clés API pour l'IA</a>.</p>
<h2>Comment l'utiliser</h2><p>Configurer une clé dans Paramètres, puis utiliser le chat ou toucher un bouton « Analyse IA » / « Approfondir » sur une fiche.</p>
<h2>Options</h2><p>Choix du modèle OpenRouter (liste des modèles gratuits « :free ») si cette clé est utilisée.</p>
<h2>Paramètres associés</h2><p>Clé OpenRouter + modèle, Clé Anthropic (voir <a href="../../reference/settings/">tableau des paramètres</a>).</p>
<h2>Données utilisées</h2><p><code>astror_ai_cache_v1</code> : cache des réponses des panneaux « Analyse IA », par clé de contenu — évite de renvoyer une requête tant que le contenu n'a pas changé et qu'on ne clique pas sur « Régénérer ». Le chat (Assistant, Assistant IA) n'a pas d'historique persistant.</p>
<h2>Résultat</h2><p>Ordre de priorité du moteur utilisé : <strong>1) OpenRouter</strong> (si clé + modèle configurés) → <strong>2) Anthropic</strong> (si clé configurée) → <strong>3) intégration hôte</strong> si disponible → sinon message invitant à configurer une clé.</p>
<h2>Fonctionnement hors connexion</h2><p>Une réponse déjà mise en cache (<code>astror_ai_cache_v1</code>) reste consultable hors ligne. Toute nouvelle question nécessite une connexion et une clé valide.</p>
<h2>Limites</h2><p>Le modèle Anthropic utilisé est fixé (<code>claude-haiku-4-5-20251001</code>), non configurable. Les clés API sont stockées en clair dans le navigateur (voir <a href="../../data/">Données et confidentialité</a>).</p>
<h2>Erreurs possibles</h2>
<ul>
  <li>« Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant/l'analyse. »</li>
  <li>« Erreur de connexion. Vérifiez votre clé API dans les Paramètres. »</li>
  <li>« Clé invalide » (lors du test de la clé dans Paramètres).</li>
</ul>
<h2>Dépannage</h2><p><a href="../../troubleshooting/assistant-ia/">L'assistant IA ne répond pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-observe'] = {
  description: "Conditions d'observation, meilleurs créneaux, journal personnel et catalogues d'objets.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Observer — journal et conditions</h1>
<h2>Description</h2><p>Prépare une session d'observation (conditions du soir, créneaux de qualité) et tient un journal personnel des sessions passées.</p>
<h2>Objectif</h2><p>Savoir quand et quoi observer, garder une trace de ses observations.</p>
<h2>Prérequis</h2><p>Position du profil. Météo optionnelle (dégrade sans bloquer l'outil).</p>
<h2>Comment l'utiliser</h2><p>Consulter les meilleurs créneaux dans « Préparer » ; ajouter une session dans « Journal » (objet observé, notes) ; parcourir les catalogues (Messier, NGC, IC, Caldwell, Visibles ce soir, Recommandés) dans « Objets ».</p>
<h2>Données utilisées</h2><p><code>astror_journal_v1</code> — tableau de sessions <code>{id, date, lieu, objet, note, matériel}</code>, pré-rempli d'exemples au premier usage.</p>
<h2>Résultat</h2><p>Liste de créneaux classés par qualité, journal personnel persistant.</p>
<h2>Fonctionnement hors connexion</h2><p>Calculs de créneaux/lever/coucher : <span class="badge ok">hors ligne</span>. Carte météo : <span class="badge no">nécessite Internet</span> (échoue silencieusement, affichage à blanc).</p>
<h2>Limites</h2><p>L'indice de pollution lumineuse (Bortle) est fixé à 4, pas une mesure géolocalisée réelle.</p>
<h2>Erreurs possibles</h2><p>« Nuit blanche — pas de nuit astronomique ce soir à cette latitude. » · « Aucune session enregistrée pour l'instant. »</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/meteo/">Météo indisponible</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-moon-tool'] = {
  description: "Suivi de phase lunaire (calcul en direct) et cartographie (mers, cratères).",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Lune</h1>
<h2>Description</h2><p>Suivi de la phase lunaire réelle et cartographie des mers et cratères recommandés à l'observation.</p>
<h2>Prérequis</h2><p>Aucun.</p>
<h2>Comment l'utiliser</h2><p>Segment « Suivi lunaire » pour la phase, l'illumination, l'âge, la distance et le diamètre apparent du jour, plus le calendrier des 4 prochains quartiers ; segment « Cartographie » pour les zones recommandées, avec bouton IA « Approfondir » sur chaque mer/cratère.</p>
<h2>Données utilisées</h2><p>Position du profil (<a href="../profil-observateur/">Profil observateur</a>), utilisée pour les heures de lever/coucher.</p>
<h2>Résultat</h2><p>Depuis la version 1.1.0, la phase, l'illumination, l'âge, la distance Terre-Lune, le diamètre apparent et le calendrier des quartiers sont calculés en direct via <code>astronomy-engine</code> (auparavant des valeurs figées) ; les mers/cratères recommandés à l'écran « Cartographie » s'adaptent à la phase réelle du moment.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">100 % hors ligne</span> (calcul local). Panneaux IA : nécessitent une connexion et une clé configurée.</p>
<h2>Limites</h2><p>La liste des mers et cratères recommandés reste un contenu descriptif fixe ; seule leur pertinence (texte affiché) s'adapte à la phase courante, pas leur sélection.</p>
<h2>Erreurs possibles</h2><p>Aucune identifiée (pas de dépendance réseau critique).</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-planets-tool'] = {
  description: "Éphémérides planétaires (calcul en direct) et simulateur d'oculaire.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Planètes</h1>
<h2>Description</h2><p>Fiche d'éphémérides par planète, calculée en direct pour la position de l'utilisateur, et simulateur visuel d'oculaire.</p>
<h2>Prérequis</h2><p>Aucun.</p>
<h2>Comment l'utiliser</h2><p>Segment « Éphémérides » pour la liste triée des 7 planètes observables et les prochaines oppositions/élongations ; segment « Observation » pour choisir une planète et voir le rendu simulé dans l'oculaire.</p>
<h2>Données utilisées</h2><p>Position du profil (<a href="../profil-observateur/">Profil observateur</a>), utilisée pour l'altitude au méridien de chaque planète.</p>
<h2>Résultat</h2><p>Depuis la version 1.1.0, magnitude, taille apparente, phase éclairée et visibilité sont calculées en direct via <code>astronomy-engine</code> (auparavant des tableaux figés valables jusqu'à janvier 2027). La liste « Oppositions & élongations » (anciennement « Conjonctions & oppositions ») provient d'un calcul réel des prochaines oppositions (planètes externes) et plus grandes élongations (Mercure, Vénus) sur les 12 prochains mois ; les conjonctions planète-planète, qui n'étaient pas réellement calculées, ont été retirées plutôt que laissées inexactes.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">100 % hors ligne</span> (calcul local).</p>
<h2>Limites</h2><p>Le classement de « visibilité » (Difficile/Visible/Bonne/Excellente) est un repère de confort basé sur la hauteur au méridien, pas une norme astronomique.</p>
<h2>Erreurs possibles</h2><p>Aucune identifiée.</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-events-tool'] = {
  description: "Calendrier d'événements astronomiques calculés et notifications de rappel programmées.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Événements et notifications</h1>
<h2>Description</h2><p>Calendrier des événements astronomiques calculés (éclipses, oppositions, pluies de météores…) sur 18 mois, avec activation de rappels notifiés.</p>
<h2>Prérequis</h2><p>Permission de notification du navigateur pour les rappels.</p>
<h2>Comment l'utiliser</h2><p>Filtrer les événements à venir par catégorie ; dans « Notifications », activer les catégories souhaitées (ISS, planètes bien placées, météores, éclipses).</p>
<h2>Données utilisées</h2><p><code>astror_notif_prefs_v1</code> — préférences par catégorie, partagées avec l'écran Éphémérides.</p>
<h2>Résultat</h2><p>Notification programmée localement 60 minutes avant l'événement concerné.</p>
<h2>Fonctionnement hors connexion</h2><p>Calcul du calendrier : <span class="badge ok">hors ligne</span>. Déclenchement de la notification : dépend d'un minuteur local actif, donc <strong>l'application doit rester ouverte ou en arrière-plan récent</strong> — pas de notification push serveur.</p>
<h2>Limites</h2><p>Pas de rappel si l'application/l'onglet est complètement fermé entre la programmation et l'échéance.</p>
<h2>Erreurs possibles</h2><p>« Aucun événement dans cette catégorie pour les 18 prochains mois. » · « Aucun événement notable ces 7 derniers jours. » · « Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du navigateur pour les activer. »</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/notifications/">Les notifications n'arrivent pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-astrophoto'] = {
  description: "Planification de session photo, règles des 500/NPF, simulateur de cadrage.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Astrophoto</h1>
<h2>Description</h2><p>Aide à la planification d'une session d'astrophotographie et calculateurs d'exposition.</p>
<h2>Prérequis</h2><p>Position du profil. Météo optionnelle.</p>
<h2>Comment l'utiliser</h2><p>Segment « Planifier » pour la fenêtre de nuit et l'orientation de la Voie Lactée ; segment « Outils » pour régler focale/capteur et voir les poses maximales calculées, ainsi que le simulateur de cadrage.</p>
<h2>Options</h2><p>Focale (14–300 mm), type de capteur (Plein format / APS-C / Micro 4/3).</p>
<h2>Données utilisées</h2><p>Aucune donnée locale propre.</p>
<h2>Résultat</h2><p>Pose maximale (règles des 500 et NPF), champ de vue simulé avec M31 et la Lune à l'échelle.</p>
<h2>Fonctionnement hors connexion</h2><p>Calculs de nuit/Voie Lactée et exposition : <span class="badge ok">hors ligne</span>. Carte météo/seeing : <span class="badge no">nécessite Internet</span> (reste en squelette de chargement si indisponible, sans message).</p>
<h2>Limites</h2><p>Les formules (règle des 500/NPF) sont des approximations classiques, pas une mesure de qualité d'image réelle.</p>
<h2>Erreurs possibles</h2><p>Aucun message dédié en cas d'échec météo (état de chargement permanent).</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/meteo/">Météo indisponible</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-satellites'] = {
  description: "Position ISS en direct, passages visibles (satellite.js + TLE), missions et sondes lointaines.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Satellites</h1>
<h2>Description</h2><p>Suivi de la Station spatiale internationale en direct, prédiction des passages visibles, missions en cours et distances des sondes lointaines.</p>
<h2>Prérequis</h2><p>Connexion Internet pour toutes les données dynamiques ; position du profil pour les passages.</p>
<h2>Comment l'utiliser</h2><p>Consulter la position ISS (rafraîchie toutes les 10 s) et la liste des passages sur 24 h ; explorer les missions en cours et les distances des sondes lointaines.</p>
<h2>Mécanisme technique</h2><p>Les passages sont calculés avec <strong>satellite.js</strong> à partir d'un jeu de données orbitales (TLE) récupéré en direct (wheretheiss.at, avec repli automatique sur Celestrak en cas d'échec) ; la propagation elle-même est ensuite locale.</p>
<h2>Données utilisées</h2><p>Aucune donnée locale propre.</p>
<h2>Résultat</h2><p>Position, passages visibles, missions, distances de sondes recalculées chaque seconde côté client (formule d'extrapolation, pas une API).</p>
<h2>Fonctionnement hors connexion</h2><p>Distances des sondes lointaines : <span class="badge ok">calcul local</span>. Position ISS, passages, missions, lancements : <span class="badge no">nécessitent Internet</span>.</p>
<h2>Limites</h2><p>Sans connexion pour obtenir un jeu de données orbitales à jour, aucun passage ne peut être calculé, même si la propagation est locale.</p>
<h2>Erreurs possibles</h2><p>« Aucun passage visible depuis votre position dans les 24 prochaines heures. » · « Impossible de récupérer les données de passage. »</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/iss/">Passages ISS/Tiangong indisponibles</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-education'] = {
  description: "Quiz de 40 questions, défi du jour, XP, 4 parcours pédagogiques, glossaire de 47 termes.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Apprendre</h1>
<h2>Description</h2><p>Ensemble d'outils de gamification pour apprendre l'astronomie : quiz, défi quotidien, système de points d'expérience (XP), parcours guidés et glossaire.</p>
<h2>Objectif</h2><p>Rendre l'apprentissage progressif et motivant.</p>
<h2>Prérequis</h2><p>Aucun pour le quiz/parcours/glossaire. Connexion requise pour le contenu « Contenus » (actualités, APOD) et les réponses IA du glossaire.</p>
<h2>Comment l'utiliser</h2>
<ul>
  <li><strong>Quiz</strong> : 40 questions réparties en 6 catégories, filtrables ; mode chrono (15 s/question, bonus si rapide) ; joker 50/50 (une utilisation par partie de 5 questions).</li>
  <li><strong>Défi du jour</strong> : un défi tiré d'un pool de 28, validable une fois par jour calendaire.</li>
  <li><strong>Parcours</strong> : 4 parcours (Premiers pas, Lire une carte du ciel, Choisir et régler son télescope, Initiation à l'astrophoto), 8 à 12 leçons chacun, progression sauvegardée.</li>
  <li><strong>Glossaire</strong> : 47 termes recherchables, avec approfondissement IA à la demande.</li>
</ul>
<h2>Données utilisées</h2>
${tbl(`<table><tr><th>Clé</th><th>Contenu</th></tr>
<tr><td><code>astror_xp_v1</code></td><td>XP total, date du dernier défi complété</td></tr>
<tr><td><code>astror_quiz_v1</code></td><td>Streak, meilleur score, total de parties jouées</td></tr>
<tr><td><code>astror_parcours_v2</code></td><td>Progression (leçons lues) par parcours</td></tr>
</table>`)}
<h2>Résultat</h2><p>XP cumulée : +10 par bonne réponse de quiz (+5 bonus en mode chrono rapide), +15 par leçon lue, points variables par défi.</p>
<h2>Fonctionnement hors connexion</h2><p>Quiz, défi, parcours, glossaire (hors IA) : <span class="badge ok">100 % hors ligne</span>. Onglet « Contenus » (actualités, APOD) et réponses IA : <span class="badge no">nécessitent Internet</span>.</p>
<h2>Limites</h2><p>Un seul défi validable par jour ; joker limité à une utilisation par partie.</p>
<h2>Erreurs possibles</h2><p>« Configurez une clé API dans les Paramètres pour activer les réponses IA. » · « Erreur de connexion. Vérifiez votre clé API dans les Paramètres. »</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/assistant-ia/">L'assistant IA ne répond pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-community'] = {
  description: "Fil communautaire Mastodon, classement configurable via Google Sheets, sorties via flux RSS.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Communauté</h1>
<h2>Description</h2><p>Trois flux communautaires : un fil de publications, un classement et une liste de sorties/actualités de clubs, chacun avec un contenu de démonstration en repli si la source réelle est indisponible ou non configurée.</p>
<h2>Prérequis</h2><p>Connexion pour les données réelles. Le classement nécessite en plus une configuration manuelle (URL d'une feuille Google Sheets publique) dans les Paramètres.</p>
<h2>Comment l'utiliser</h2><p>Consulter les 3 segments ; pour activer un vrai classement, renseigner l'URL de sa feuille de calcul Google Sheets partagée en lecture publique dans Paramètres → Communauté.</p>
<h2>Options / Paramètres associés</h2><p>URL de la feuille de classement communautaire (<a href="../../reference/settings/">tableau des paramètres</a>).</p>
${tbl(`<table><tr><th>Segment</th><th>Source réelle</th><th>Repli si indisponible</th></tr>
<tr><td>Fil</td><td>Mastodon public (#astrophotography)</td><td>Publications de démonstration + bannière</td></tr>
<tr><td>Classement</td><td>Google Sheets (URL fournie par l'utilisateur)</td><td>Classement de démonstration + bannière « DÉMO » tant que non configuré</td></tr>
<tr><td>Sorties</td><td>Flux RSS de clubs d'astronomie</td><td>Événements de démonstration + bannière</td></tr>
</table>`)}
<h2>Données utilisées</h2><p><code>astror_community_sheet_v1</code> — URL de la feuille de classement.</p>
<h2>Fonctionnement hors connexion</h2><p>Bascule automatiquement sur les données de démonstration statiques pour les 3 segments, avec bannière explicative.</p>
<h2>Limites</h2><p>Le classement reste en mode démonstration tant qu'aucune URL n'est configurée — ce n'est pas un défaut réseau mais un choix de configuration laissé à l'utilisateur.</p>
<h2>Erreurs possibles</h2><p>« Impossible de charger la feuille. Vérifiez que l'URL est correcte et que la feuille est partagée en lecture publique. »</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-extras'] = {
  description: "Quatre simulateurs pédagogiques statiques : Échelle, Impact, Top 10, Voyages.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Outil Explorations</h1>
<h2>Description</h2><p>Quatre simulateurs et contenus pédagogiques indépendants, entièrement fonctionnels hors connexion.</p>
<h2>Comment l'utiliser</h2>
<ul>
  <li><strong>Échelle</strong> — curseur parcourant 9 objets de l'Everest à l'Univers observable.</li>
  <li><strong>Impact</strong> — curseur de masse d'impact, calcule énergie, équivalent TNT et diamètre de cratère (formules empiriques).</li>
  <li><strong>Top 10</strong> — sélection de 10 objets du ciel profond parmi un pool de 12, favorisant les objets de saison.</li>
  <li><strong>Voyages</strong> — 6 fiches pédagogiques interactives avec panneau IA d'approfondissement.</li>
</ul>
<h2>Données utilisées</h2><p>Aucune.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">100 % hors ligne</span> (hors panneaux IA optionnels des Voyages).</p>
<h2>Limites</h2><p>Contenu entièrement statique — le Top 10 ne prend pas en compte la position réelle dans son calcul de sélection (elle est seulement affichée).</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};
PAGES['feat-tips'] = {
  description: "Bandeaux d'astuces contextuelles affichés sur les 16 écrans principaux d'Astror.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Astuces contextuelles</h1>
<h2>Description</h2><p>Un bandeau « Astuce » propose 3 à 6 conseils défilables par écran (gestes, fonctions faciles à manquer), complémentaire de l'aide (bouton « ? ») et de la démo (bouton « ▶ »).</p>
<h2>Objectif</h2><p>Signaler des fonctions ou gestes utiles sans devoir ouvrir l'aide complète.</p>
<h2>Prérequis</h2><p>Aucun.</p>
<h2>Comment l'utiliser</h2><p>Le bandeau apparaît automatiquement en haut des 6 onglets principaux et des 10 outils, tant qu'il n'a pas été masqué sur cet écran. Bouton « Astuce suivante » pour faire défiler les conseils de l'écran ; bouton de fermeture pour masquer le bandeau de cet écran (le masquage est mémorisé par écran, pas par astuce individuelle).</p>
<h2>Options</h2><p>Paramètres → « Réafficher les astuces » réinitialise le masquage sur tous les écrans d'un coup.</p>
<h2>Données utilisées</h2><p><code>astror_tips_v1</code> — liste des écrans dont le bandeau a été masqué.</p>
<h2>Résultat</h2><p>Un bandeau discret, non bloquant, qui ne réapparaît plus sur un écran une fois fermé (jusqu'à réinitialisation).</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">100 % hors ligne</span> — contenu texte statique.</p>
<h2>Limites</h2><p>Le masquage s'applique à tout le bandeau d'un écran, pas à une astuce précise : fermer le bandeau masque l'ensemble des conseils de cet écran, pas seulement celui affiché au moment de la fermeture.</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-updates'] = {
  description: "Mise à jour automatique de l'app en arrière-plan, avec vérification manuelle possible.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Mises à jour automatiques</h1>
<h2>Description</h2><p>Astror vérifie périodiquement si une nouvelle version est disponible et l'applique automatiquement, sans action requise.</p>
<h2>Objectif</h2><p>Garantir que l'utilisateur dispose toujours de la dernière version, sans étape d'installation manuelle (pas de store d'applications).</p>
<h2>Prérequis</h2><p>Aucun. Nécessite une connexion au moment de la vérification pour détecter une nouvelle version.</p>
<h2>Comment l'utiliser</h2>
<p>Rien à faire : la vérification se fait automatiquement toutes les heures en arrière-plan. Depuis Paramètres → Mises à jour, un bouton « Vérifier les mises à jour » permet de forcer une vérification immédiate.</p>
<h2>Options</h2><p>Aucun réglage on/off — la vérification automatique est toujours active.</p>
<h2>Données utilisées</h2>
${tbl(`<table><tr><th>Clé</th><th>Contenu</th></tr>
<tr><td><code>astror_pwa_last_check_v1</code></td><td>Date/heure de la dernière vérification (auto ou manuelle)</td></tr>
<tr><td><code>astror_pwa_last_update_v1</code></td><td>Date/heure de la dernière mise à jour effectivement appliquée</td></tr>
</table>`)}
<h2>Résultat</h2><p>Si une nouvelle version est trouvée, elle est téléchargée puis appliquée automatiquement : l'application se recharge seule avec la nouvelle version, sans invite de confirmation. Paramètres affiche la version installée et sa date de publication (date de build).</p>
<h2>Fonctionnement hors connexion</h2><p>La vérification échoue silencieusement sans réseau (aucune erreur affichée) ; l'application continue de fonctionner normalement avec la version déjà installée, précachée par le service worker — voir <a href="../../offline/">Hors connexion</a>.</p>
<h2>Fonctionnement en ligne</h2><p>Vérification automatique toutes les heures ; vérification immédiate possible via le bouton dédié.</p>
<h2>Limites</h2><p>La mise à jour se recharge sans avertissement préalable : un rechargement en pleine saisie (ex. formulaire d'ajout dans Veille) pourrait interrompre l'utilisateur. Aucune confirmation n'est demandée avant application.</p>
<h2>Erreurs possibles</h2><p>Aucun message d'erreur dédié n'est affiché en cas d'échec de vérification (réseau indisponible, etc.) — le bouton affiche simplement « ✓ À jour » après le délai standard, que la vérification ait réussi ou échoué silencieusement.</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-demo'] = {
  description: "Visites guidées automatiques qui pilotent réellement l'interface, sans jamais toucher vos données.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Mode démo (visites guidées automatiques)</h1>
<h2>Description</h2><p>Un moteur de démonstration pilote réellement l'application (navigation, clics, saisie de texte) pour montrer son fonctionnement, avec narration à l'écran.</p>
<p class="small">À ne pas confondre avec le bouton « ▶ » de chaque écran, qui ouvre une simple fiche explicative statique (voir <a href="../../guide/">Guide utilisateur</a>) — le mode démo décrit ici pilote réellement l'interface.</p>
<h2>Objectif</h2><p>Présenter les fonctionnalités sans risque pour les données réelles de l'utilisateur (démonstrations, captures d'écran, découverte de l'application).</p>
<h2>Prérequis</h2><p>Aucun.</p>
<h2>Comment l'utiliser</h2>
<ul>
  <li>Depuis <strong>Paramètres → Visites guidées (mode démo)</strong>, choisir un scénario.</li>
  <li>Ou ouvrir l'application avec <code>?demo=nom-du-scenario</code> dans l'URL (saute automatiquement l'onboarding).</li>
  <li>Pendant la démo : bouton pause/lecture, étape suivante, vitesse ×0,5/×1/×2, bouton ✕ ou touche <code>Échap</code> pour quitter à tout moment.</li>
</ul>
<h2>Scénarios disponibles</h2>
${tbl(`<table><tr><th>Nom</th><th>Résumé</th></tr>
<tr><td>Visite guidée complète</td><td>Survol des 6 écrans principaux</td></tr>
<tr><td>Carte du ciel</td><td>Filtres, fiche d'un astre, boussole, curseur temporel</td></tr>
<tr><td>Boîte à outils</td><td>Modules d'observation + ouverture de l'outil Lune</td></tr>
<tr><td>Assistant IA</td><td>Suggestions par thème + saisie d'une question (sans envoi réseau)</td></tr>
</table>`)}
<h2>Données utilisées</h2><p><strong>Aucune donnée réelle n'est modifiée.</strong> Au démarrage, l'état actuel du profil et de l'onboarding est sauvegardé, puis remplacé temporairement par un profil de démonstration neutre (Paris, niveau Amateur). À la sortie — y compris via <code>Échap</code> à tout moment — l'état d'origine est restauré exactement.</p>
<h2>Résultat</h2><p>Retour automatique à l'écran de départ et aux données réelles à la fin ou à l'arrêt de la visite.</p>
<h2>Fonctionnement hors connexion</h2><p>Le moteur lui-même ne dépend pas du réseau ; les écrans visités peuvent afficher les mêmes limitations hors ligne que documentées ailleurs (météo, images...).</p>
<h2>Limites</h2><p>Le scénario « Assistant IA » simule la saisie d'une question mais n'envoie jamais réellement de requête réseau. Respecte la préférence système « mouvement réduit » (animations instantanées si activée).</p>
<h2>Erreurs possibles</h2><p>Aucune identifiée.</p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-export'] = {
  description: "Exporter ou importer l'intégralité des données locales d'Astror au format JSON.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Export et import des données</h1>
<h2>Description</h2><p>Depuis les Paramètres, il est possible de télécharger un fichier JSON contenant toutes les données locales d'Astror, et de le réimporter plus tard ou sur un autre appareil.</p>
<h2>Objectif</h2><p>Sauvegarder ses données avant une désinstallation, changer d'appareil, ou dépanner l'application.</p>
<h2>Prérequis</h2><p>Aucun.</p>
<h2>Comment l'utiliser</h2>
<ol>
  <li><strong>Exporter</strong> : Paramètres → « Exporter mes données » → un fichier <code>.json</code> est téléchargé, contenant toutes les clés <code>localStorage</code> préfixées <code>astror_</code>.</li>
  <li><strong>Importer</strong> : Paramètres → « Importer » → choisir un fichier <code>.json</code> au format <code>{ app:'astror', data:{...} }</code>.</li>
</ol>
<h2>Données utilisées</h2><p>Toutes les clés <code>astror_*</code> — voir le détail complet dans <a href="../../data/">Données et confidentialité</a>. <strong>Le fichier exporté inclut les clés API IA en clair</strong> si elles sont configurées : ne le partagez pas.</p>
<h2>Résultat</h2><p>Import : les clés du fichier écrasent les valeurs existantes, puis l'application recharge automatiquement après 1,2 seconde.</p>
<h2>Fonctionnement hors connexion</h2><p><span class="badge ok">100 % hors ligne</span> — export et import sont des opérations purement locales.</p>
<h2>Limites</h2>
<ul>
  <li><strong>Aucune confirmation ni fusion à l'import</strong> : les valeurs existantes sont écrasées silencieusement par celles du fichier importé.</li>
  <li>Ce n'est pas une synchronisation automatique entre appareils : chaque export/import est une action manuelle et ponctuelle.</li>
</ul>
<h2>Erreurs possibles</h2><p>Message d'échec si le fichier n'a pas le format attendu (import refusé).</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/import/">L'import de données échoue</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};

PAGES['feat-ai-keys'] = {
  description: "Configurer une clé OpenRouter, Anthropic ou Google Books ; ordre de priorité et stockage.",
  html: `
<div class="eyebrow">Fonctionnalités</div>
<h1>Clés API pour l'IA</h1>
<h2>Description</h2><p>Astror n'a pas de backend : pour utiliser les fonctionnalités IA (chat, panneaux « Analyse IA »), l'utilisateur fournit sa propre clé API personnelle.</p>
<h2>Objectif</h2><p>Permettre l'usage de l'IA sans que l'éditeur d'Astror n'ait à opérer ni facturer de service d'IA.</p>
<h2>Comment l'utiliser</h2>
${tbl(`<table><tr><th>Fournisseur</th><th>Où l'obtenir</th><th>Configuration</th><th>Priorité</th></tr>
<tr><td>OpenRouter</td><td>openrouter.ai (mentionné en toutes lettres dans l'app, pas de lien cliquable)</td><td>Coller la clé puis cliquer « Modèles gratuits » — choisir un modèle dans la liste des modèles « :free »</td><td>1 — utilisée en priorité si clé + modèle renseignés</td></tr>
<tr><td>Anthropic (Claude)</td><td>console Anthropic (externe à l'app)</td><td>Coller la clé puis « Enregistrer » ; bouton « Tester » disponible sans sauvegarder</td><td>2 — utilisée si pas d'OpenRouter configuré</td></tr>
<tr><td>Google Books (optionnel)</td><td>Google Cloud Console (externe à l'app)</td><td>Coller la clé puis « Enregistrer »</td><td>Priorise Google Books sur Open Library pour la recherche de livres (Veille → Bibliothèque), sans lien avec l'assistant IA</td></tr>
</table>`)}
<h2>Données utilisées</h2>
${tbl(`<table><tr><th>Clé</th><th>Contenu</th></tr>
<tr><td><code>astror_or_key_v1</code> / <code>astror_or_model_v1</code></td><td>Clé et modèle OpenRouter</td></tr>
<tr><td><code>astror_api_key_v1</code></td><td>Clé Anthropic</td></tr>
<tr><td><code>astror_gbooks_key_v1</code></td><td>Clé Google Books</td></tr>
</table>`)}
<h2>Résultat</h2><p>Les fonctionnalités IA (chat, panneaux « Analyse IA ») deviennent actives dès qu'une clé valide est configurée.</p>
<h2>Limites</h2>
<ul>
  <li><strong>Stockage en clair, non chiffré</strong>, dans le stockage local du navigateur — n'importe quel script exécuté dans ce même navigateur pourrait théoriquement y accéder.</li>
  <li>Ces clés sont incluses en clair dans le fichier d'export de données (voir <a href="../export-import/">Export et import</a>) — ne partagez jamais ce fichier.</li>
</ul>
<p class="small">Depuis la version 1.1.0, chacune des 3 clés dispose d'un bouton « Effacer » dédié dans Paramètres (visible dès qu'une valeur est saisie ou enregistrée).</p>
<h2>Erreurs possibles</h2><p>« Clé invalide » — aucune distinction affichée entre clé erronée, réseau indisponible ou quota dépassé, tous les cas remontant le même message générique.</p>
<h2>Dépannage</h2><p><a href="../../troubleshooting/assistant-ia/">L'assistant IA ne répond pas</a></p>
<h2>FAQ</h2><p><a href="../../faq/">Voir la FAQ</a></p>
`,
};
// ---- Paramètres (§14) ----
PAGES['settings'] = {
  description: "Tous les paramètres exposés dans l'écran Paramètres d'Astror : profil, alertes, clés IA, sauvegarde.",
  html: `
<div class="eyebrow">Paramètres</div>
<h1>Tous les paramètres</h1>
<p class="lede">L'écran Paramètres édite directement le même profil que l'onboarding — chaque modification est appliquée et enregistrée immédiatement, sans bouton « Enregistrer » (sauf mention contraire ci-dessous).</p>

<h2>Profil observateur</h2>
${tbl(`<table>
<tr><th>Paramètre</th><th>Type</th><th>Défaut</th><th>Valeurs possibles</th><th>Application</th></tr>
<tr><td>Niveau d'expérience</td><td>Sélection unique</td><td>Amateur</td><td>Débutant, Amateur, Confirmé</td><td>Immédiate</td></tr>
<tr><td>Localisation (ville)</td><td>Sélection unique + détection GPS</td><td>Paris (48,8566 / 2,3522)</td><td>Paris, Lyon, Marseille, Toulouse, Bordeaux, Nantes, ou position GPS détectée</td><td>Immédiate</td></tr>
<tr><td>Centres d'intérêt</td><td>Cases à cocher multiples</td><td>Planètes, Ciel profond</td><td>7 choix (Planètes, Lune & Soleil, Constellations, Ciel profond, Astrophotographie, Cosmologie, Actualités spatiales)</td><td>Immédiate</td></tr>
<tr><td>Matériel</td><td>Cases à cocher multiples</td><td>Jumelles</td><td>À l'œil nu, Jumelles, Télescope, Lunette</td><td>Immédiate</td></tr>
<tr><td>Alertes (ISS, conjonctions, météores, éclipses)</td><td>4 interrupteurs</td><td>ISS/conjonctions/météores activés, éclipses désactivé</td><td>Vrai/Faux chacun</td><td>Immédiate (active/désactive la demande de notification)</td></tr>
</table>`)}

<h2>Intelligence artificielle</h2>
${tbl(`<table>
<tr><th>Paramètre</th><th>Type</th><th>Défaut</th><th>Application</th></tr>
<tr><td>Clé API OpenRouter</td><td>Texte masqué</td><td>Vide</td><td>Enregistrée dès le clic sur « Modèles gratuits » (avant même la validation) ; bouton « Effacer » pour la retirer</td></tr>
<tr><td>Modèle OpenRouter</td><td>Sélection dans une liste dynamique (modèles « :free »)</td><td>Aucun</td><td>Immédiate au clic sur un modèle</td></tr>
<tr><td>Clé API Anthropic</td><td>Texte masqué</td><td>Vide</td><td>Bouton « Enregistrer » explicite ; bouton « Tester » ne sauvegarde pas ; bouton « Effacer » pour la retirer</td></tr>
</table>`)}
<p class="small">Priorité d'utilisation : OpenRouter (si clé + modèle) → Anthropic (si clé) → sinon fonctionnalités IA indisponibles. Détail : <a href="../features/cles-api-ia/">Clés API pour l'IA</a>.</p>

<h2>Intégrations optionnelles</h2>
${tbl(`<table>
<tr><th>Paramètre</th><th>Type</th><th>Défaut</th><th>Effet</th></tr>
<tr><td>Clé API Google Books</td><td>Texte masqué</td><td>Vide</td><td>Si renseignée, priorise Google Books sur Open Library pour la recherche de livres (Veille → Bibliothèque) ; bouton « Effacer » pour la retirer</td></tr>
<tr><td>URL Google Sheets communauté</td><td>Texte (URL)</td><td>Vide</td><td>Active le vrai classement communautaire (Outils → Communauté) à la place des données de démonstration</td></tr>
</table>`)}

<h2>Mises à jour</h2>
<p>Depuis la version 1.1.0, un bloc dédié affiche la version installée, la date de publication du build et la date de dernière vérification, avec un bouton « Vérifier les mises à jour ».</p>
${tbl(`<table>
<tr><th>Élément</th><th>Comportement</th></tr>
<tr><td>Vérification automatique</td><td>Toutes les heures en arrière-plan ; toute mise à jour trouvée est appliquée automatiquement (rechargement de l'app), sans invite</td></tr>
<tr><td>Bouton « Vérifier les mises à jour »</td><td>Force une vérification immédiate ; affiche « ✓ À jour » si rien de nouveau</td></tr>
</table>`)}
<p class="small">Détail technique : <a href="../reference/apis/">APIs externes</a> ne couvre pas ce mécanisme — voir directement <code>src/pwaUpdate.js</code>.</p>

<h2>Actions</h2>
${tbl(`<table>
<tr><th>Action</th><th>Effet</th></tr>
<tr><td>Revoir l'introduction</td><td>Relance l'onboarding en 7 étapes, pré-rempli avec le profil actuel</td></tr>
<tr><td>Réafficher les astuces</td><td>Réinitialise les bandeaux d'astuces masqués sur tous les écrans</td></tr>
<tr><td>Visites guidées (mode démo)</td><td>Lance une visite guidée automatique pilotée — voir <a href="../features/mode-demo/">Mode démo</a></td></tr>
<tr><td>Exporter mes données</td><td>Télécharge un fichier JSON de sauvegarde — voir <a href="../features/export-import/">Export/Import</a></td></tr>
<tr><td>Importer</td><td>Restaure des données depuis un fichier JSON (écrase les valeurs existantes, sans confirmation)</td></tr>
</table>`)}

<p>Référence complète, y compris le stockage exact de chaque paramètre : <a href="../reference/settings/">Tableau des paramètres</a>.</p>
`,
};

// ---- Permissions (§16) ----
PAGES['permissions'] = {
  description: "Les 3 permissions navigateur utilisées par Astror : géolocalisation, notifications, orientation.",
  html: `
<div class="eyebrow">Permissions</div>
<h1>Permissions utilisées</h1>
<p class="lede">Astror ne demande aucune permission automatiquement au lancement : chacune n'est sollicitée qu'au moment où l'utilisateur déclenche une action qui en a besoin.</p>

${tbl(`<table>
<tr><th>Permission</th><th>Pourquoi</th><th>Quand elle est demandée</th><th>Obligatoire ?</th><th>Si refusée</th><th>Comment réactiver</th></tr>
<tr>
  <td><strong>Géolocalisation</strong></td>
  <td>Centrer les calculs (Lune, Soleil, planètes, événements, carte du ciel) sur la position réelle</td>
  <td>Au clic sur le bouton de détection GPS — onboarding étape 1, ou Paramètres → Localisation</td>
  <td>Non — une ville peut être choisie manuellement dans une liste de 6 villes</td>
  <td>Aucun message d'erreur affiché ; l'utilisateur doit choisir une ville manuellement</td>
  <td>Android/Chrome : icône de cadenas ou « i » dans la barre d'adresse → Autorisations → Position. iOS/Safari : Réglages iOS → Safari (ou Réglages du site) → Position</td>
</tr>
<tr>
  <td><strong>Notifications</strong></td>
  <td>Prévenir d'un passage ISS/Tiangong, d'une conjonction, ou d'un événement du calendrier</td>
  <td>À l'activation d'un interrupteur d'alerte — écran Éphémérides ou Outils → Événements</td>
  <td>Non — l'application reste utilisable, seules les alertes programmées sont indisponibles</td>
  <td>L'interrupteur repasse/reste désactivé ; bandeau « Les notifications sont bloquées dans votre navigateur… » si déjà explicitement refusées</td>
  <td>Android/Chrome : Paramètres du site → Notifications → Autoriser. iOS/Safari (PWA) : Réglages iOS → Notifications → Astror</td>
</tr>
<tr>
  <td><strong>Orientation de l'appareil</strong> (boussole, iOS 13+)</td>
  <td>Aligner la carte du ciel sur l'orientation réelle du téléphone (pointage assisté)</td>
  <td>Au clic sur le bouton boussole de l'écran Ciel</td>
  <td>Non — la carte reste utilisable en rotation manuelle (glisser au doigt)</td>
  <td>Le mode boussole ne s'active pas ; repli automatique en orientation manuelle si aucune donnée ne parvient sous 5 s</td>
  <td>Android/Chrome : Paramètres des sites → Capteurs de mouvement → Autoriser. iOS/Safari : la permission est redemandée à chaque nouvel appel si elle n'a pas été accordée — relancer simplement le mode boussole</td>
</tr>
</table>`)}

<h2>Permissions non utilisées</h2>
<p>Astror n'utilise ni caméra, ni microphone, ni contacts, ni Bluetooth, ni accès aux fichiers au-delà d'une sélection ponctuelle de fichier lors de l'import de données (§ <a href="../features/export-import/">Export et import</a>).</p>

<h2>Dépannage</h2>
<p><a href="../troubleshooting/localisation/">La localisation ne fonctionne pas</a> · <a href="../troubleshooting/boussole/">La boussole ne fonctionne pas</a> · <a href="../troubleshooting/notifications/">Les notifications n'arrivent pas</a></p>
`,
};
// ---- Données et confidentialité (§17, §18) ----
PAGES['data'] = {
  description: "Toutes les données stockées localement par Astror, leur origine, leur finalité et l'export/suppression.",
  html: `
<div class="eyebrow">Données et confidentialité</div>
<h1>Données et confidentialité</h1>
<p class="lede">Astror n'a pas de compte utilisateur ni de serveur applicatif propre : toutes les données personnelles restent dans le stockage local (<code>localStorage</code>) du navigateur, sur l'appareil de l'utilisateur.</p>

<h2>Stockage local — toutes les clés</h2>
${tbl(`<table>
<tr><th>Clé</th><th>Contenu</th><th>Origine</th><th>Transmise à un tiers ?</th></tr>
<tr><td><code>astror_profile_v1</code></td><td>Position, niveau, intérêts, matériel, préférences d'alertes</td><td>Onboarding / Paramètres</td><td>Non (sauf via le contexte envoyé à l'IA si configurée)</td></tr>
<tr><td><code>astror_onboarded_v1</code></td><td>Indicateur « introduction déjà vue »</td><td>Onboarding</td><td>Non</td></tr>
<tr><td><code>astror_journal_v1</code></td><td>Sessions d'observation personnelles</td><td>Outil Observer</td><td>Non</td></tr>
<tr><td><code>astror_veille_v1</code></td><td>Entrées ajoutées par l'utilisateur (conférences, personnalités, livres…)</td><td>Onglet Veille</td><td>Non</td></tr>
<tr><td><code>astror_quiz_v1</code></td><td>Statistiques de quiz (streak, meilleur score, total joué)</td><td>Outil Apprendre</td><td>Non</td></tr>
<tr><td><code>astror_xp_v1</code></td><td>XP total, date du dernier défi complété</td><td>Outil Apprendre</td><td>Non</td></tr>
<tr><td><code>astror_parcours_v2</code></td><td>Progression des leçons par parcours</td><td>Outil Apprendre</td><td>Non</td></tr>
<tr><td><code>astror_notif_prefs_v1</code></td><td>Préférences de notification par catégorie d'événement</td><td>Éphémérides / Outil Événements</td><td>Non</td></tr>
<tr><td><code>astror_tips_v1</code></td><td>Bandeaux d'astuces déjà masqués</td><td>Toute l'application</td><td>Non</td></tr>
<tr><td><code>astror_api_key_v1</code></td><td><strong>Clé API Anthropic</strong> (en clair)</td><td>Paramètres</td><td>Oui — envoyée à <code>api.anthropic.com</code> à chaque requête IA</td></tr>
<tr><td><code>astror_or_key_v1</code> / <code>astror_or_model_v1</code></td><td><strong>Clé + modèle OpenRouter</strong> (en clair)</td><td>Paramètres</td><td>Oui — envoyée à <code>openrouter.ai</code> à chaque requête IA</td></tr>
<tr><td><code>astror_gbooks_key_v1</code></td><td>Clé Google Books (en clair)</td><td>Paramètres</td><td>Oui — envoyée à l'API Google Books lors d'une recherche de livre</td></tr>
<tr><td><code>astror_community_sheet_v1</code></td><td>URL de la feuille Google Sheets du classement communautaire</td><td>Paramètres</td><td>L'URL est utilisée pour interroger Google Sheets directement depuis l'appareil</td></tr>
<tr><td><code>astror_ai_cache_v1</code></td><td>Cache des réponses IA (panneaux « Analyse IA »)</td><td>Usage de l'IA</td><td>Non (copie locale des réponses déjà reçues)</td></tr>
<tr><td><code>astror_wiki_thumbs_v1</code></td><td>Cache de vignettes Wikipédia des personnalités</td><td>Onglet Veille</td><td>Non</td></tr>
<tr><td><code>astror_book_covers_v1</code></td><td>Cache des couvertures de livres</td><td>Onglet Veille</td><td>Non</td></tr>
<tr><td><code>astror_conf_imgs_v1</code></td><td>Cache des images de conférences</td><td>Onglet Veille</td><td>Non</td></tr>
<tr><td><code>astror_site_photos_v1</code></td><td>Cache de vignettes par site photo</td><td>Onglet Veille</td><td>Non</td></tr>
<tr><td><code>astror_pwa_last_check_v1</code></td><td>Date/heure de la dernière vérification de mise à jour</td><td>Mécanisme de mise à jour (Paramètres)</td><td>Non</td></tr>
<tr><td><code>astror_pwa_last_update_v1</code></td><td>Date/heure de la dernière mise à jour appliquée</td><td>Mécanisme de mise à jour (Paramètres)</td><td>Non</td></tr>
</table>`)}

<h2>Données envoyées à des services externes</h2>
<p>En dehors des clés API elles-mêmes, Astror interroge des API publiques sans authentification pour enrichir l'affichage : position/passages ISS, météo, actualités, images Wikimedia/NASA, résumés Wikipédia, recherche de livres. Ces requêtes contiennent les paramètres nécessaires à la demande (coordonnées de position pour la météo et les passages, terme de recherche pour les livres/Wikipédia) mais aucune donnée d'identification personnelle. Liste complète : <a href="../reference/apis/">APIs externes</a>.</p>
<p>Lorsque l'assistant IA est utilisé, le texte de la question et le contexte du profil (position, niveau, matériel — pas de nom ni d'identifiant) sont envoyés au fournisseur d'IA choisi (Anthropic ou OpenRouter), conformément à leurs propres politiques de confidentialité respectives.</p>

<h2>Durée de conservation</h2>
<p>Les données locales sont conservées indéfiniment jusqu'à suppression manuelle (effacement des données du site dans le navigateur) ou désinstallation de l'application/du navigateur.</p>

<h2>Export, suppression, portabilité</h2>
<ul>
  <li><strong>Export</strong> : Paramètres → « Exporter mes données » (fichier JSON complet). Voir <a href="../features/export-import/">Export et import</a>.</li>
  <li><strong>Suppression</strong> : aucune fonction « Effacer toutes mes données » dédiée dans l'interface ${verify("à confirmer : seule la suppression manuelle des données du site depuis les réglages du navigateur permet un effacement complet et certain.")}</li>
  <li><strong>Partage</strong> : Astror ne partage aucune donnée avec des tiers autres que les services strictement nécessaires à la fonctionnalité demandée (IA, météo, recherche de livres, etc.), et uniquement à l'initiative de l'utilisateur.</li>
</ul>

<h2>Synchronisation</h2>
<p>Astror ne propose pas de compte utilisateur ni de synchronisation automatique entre appareils. Le transfert de données d'un appareil à l'autre se fait uniquement par export/import manuel d'un fichier JSON.</p>

${legalNote("cette page décrit le comportement observé dans le code source. Elle ne remplace pas une politique de confidentialité formelle, qui reste à rédiger et valider (voir Informations légales).")}
`,
};

// ---- Hors connexion (§19) ----
PAGES['offline'] = {
  description: "Ce qui fonctionne sans Internet dans Astror (calculs astro locaux) et ce qui nécessite une connexion.",
  html: `
<div class="eyebrow">Fonctionnement hors connexion</div>
<h1>Hors connexion</h1>
<p class="lede">Astror est installable comme PWA et reste utilisable hors connexion pour tout ce qui repose sur des calculs locaux. Les contenus enrichis (météo, images, actualités, IA) nécessitent une connexion.</p>

${tbl(`<table>
<tr><th>Fonction</th><th style="text-align:right">Hors ligne</th><th style="text-align:right">En ligne</th><th>Synchronisation</th></tr>
<tr><td>Lune, Soleil, planètes, événements célestes (calculs astronomy-engine)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Carte du ciel, boussole de pointage</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Fiches des 88 constellations (texte)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Journal d'observation, quiz, XP, parcours, glossaire (hors IA)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Simulateurs (Échelle, Impact, Top 10, Astrophoto — calculs)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Distances des sondes lointaines (Voyager, New Horizons…)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Notifications déjà programmées (si l'app reste ouverte)</td><td style="text-align:right">✅</td><td style="text-align:right">—</td><td>—</td></tr>
<tr><td>Détection GPS → nom de ville</td><td style="text-align:right">Partiel (coordonnées brutes)</td><td style="text-align:right">✅ (nom de ville)</td><td>—</td></tr>
<tr><td>Position ISS en direct</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>Rafraîchi toutes les 10 s</td></tr>
<tr><td>Passages ISS/Tiangong prédits</td><td style="text-align:right">Partiel*</td><td style="text-align:right">✅</td><td>Rafraîchi toutes les heures</td></tr>
<tr><td>Météo / seeing / transparence</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>Chargement unique (Observer : 1×/heure)</td></tr>
<tr><td>Actualités, lancements, missions, APOD</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>Chargement unique</td></tr>
<tr><td>Galeries d'images (JWST, planètes, lunes, conférences)</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>Manuel (bouton Actualiser)</td></tr>
<tr><td>Fiches Wikipédia (constellations, conquête spatiale)</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>À l'ouverture de la fiche</td></tr>
<tr><td>Recherche/couvertures de livres</td><td style="text-align:right">❌</td><td style="text-align:right">✅</td><td>À la demande</td></tr>
<tr><td>Fil communautaire, sorties, classement</td><td style="text-align:right">Repli démo</td><td style="text-align:right">✅</td><td>Chargement unique</td></tr>
<tr><td>Assistant IA / panneaux « Analyse IA »</td><td style="text-align:right">Repli cache uniquement**</td><td style="text-align:right">✅</td><td>À la demande</td></tr>
</table>`)}
<p class="small">* Le calcul de trajectoire est local (satellite.js), mais nécessite d'avoir pu télécharger des données orbitales (TLE) à jour au moins une fois récemment.<br>** Une réponse déjà obtenue et mise en cache (<code>astror_ai_cache_v1</code>) reste consultable hors ligne ; toute nouvelle question nécessite une connexion.</p>

<h2>Ce que fait le service worker</h2>
<p>Le service worker (Workbox, mode <code>autoUpdate</code>) précache l'ensemble des fichiers de l'application (HTML, JS, CSS, icônes) afin que l'interface se charge hors ligne. <strong>Il ne met en cache aucune réponse d'API externe</strong> : chaque appel réseau applicatif (météo, ISS, actualités, images, IA…) échoue simplement s'il n'y a pas de connexion, avec le comportement décrit ci-dessus au cas par cas.</p>

<h2>Comportement en cas de perte de réseau</h2>
<p>Astror ne détecte pas explicitement l'état de connexion (pas de bandeau « hors ligne » global) : chaque fonctionnalité réagit indépendamment à l'échec de sa propre requête (message d'erreur, repli silencieux, ou dernière valeur connue conservée à l'écran). Voir le détail par fonctionnalité dans <a href="../features/">Fonctionnalités</a> et par écran dans <a href="../guide/">Guide utilisateur</a>.</p>

<h2>Comportement après reconnexion</h2>
<p>Les données qui se rafraîchissent automatiquement (ISS, météo si un intervalle est actif) reprennent normalement au prochain cycle. Les autres contenus nécessitent une actualisation manuelle (bouton « ↻ » ou réouverture de l'écran).</p>
`,
};
// ---- Dépannage (§21) ----
PAGES['ts-index'] = {
  description: "Index des articles de dépannage Astror.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>Vue d'ensemble</h1>
<p class="lede">Un article par problème courant. Si le problème persiste après avoir suivi les étapes, voir <a href="../support/">Support</a>.</p>
<div class="grid-cards">
  <a class="card" href="localisation/"><div class="card-title">Localisation</div></a>
  <a class="card" href="boussole/"><div class="card-title">Boussole</div></a>
  <a class="card" href="notifications/"><div class="card-title">Notifications</div></a>
  <a class="card" href="meteo/"><div class="card-title">Météo</div></a>
  <a class="card" href="assistant-ia/"><div class="card-title">Assistant IA</div></a>
  <a class="card" href="images/"><div class="card-title">Images</div></a>
  <a class="card" href="iss/"><div class="card-title">Passages ISS</div></a>
  <a class="card" href="import/"><div class="card-title">Import de données</div></a>
</div>
`,
};

PAGES['ts-gps'] = {
  description: "La détection GPS échoue ou affiche la mauvaise ville.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>La localisation ne fonctionne pas</h1>
<h2>Symptôme</h2><p>Le bouton de détection GPS ne renvoie rien, ou la ville affichée est incorrecte.</p>
<h2>Causes possibles</h2>
<ul>
  <li>Permission de géolocalisation refusée dans le navigateur.</li>
  <li>Service de localisation désactivé au niveau du système (Android/iOS).</li>
  <li>Le service de conversion coordonnées → nom de ville est indisponible (pas de réseau ou service externe en panne) : l'app affiche alors des coordonnées brutes au lieu d'un nom de ville.</li>
</ul>
<h2>Diagnostic</h2><p>Vérifier que la localisation est activée dans les réglages du système, puis dans les autorisations du site pour le navigateur utilisé.</p>
<h2>Solution</h2>
<ol>
  <li>Autoriser la localisation pour le site dans le navigateur (icône de cadenas/informations dans la barre d'adresse → Autorisations).</li>
  <li>Réessayer le bouton de détection dans Paramètres ou pendant l'onboarding.</li>
  <li>À défaut, choisir une ville manuellement dans la liste proposée (Paris, Lyon, Marseille, Toulouse, Bordeaux, Nantes).</li>
</ol>
<h2>Si le problème persiste</h2><p>Choisir une ville manuellement — cela n'empêche aucune autre fonctionnalité de l'application.</p>
<h2>Informations à fournir au support</h2><p>Navigateur et version, système d'exploitation, si le message d'autorisation du navigateur est apparu ou non.</p>
<p><a href="../../permissions/">Voir aussi : Permissions</a></p>
`,
};

PAGES['ts-compass'] = {
  description: "Le mode boussole de la carte du ciel ne s'active pas ou reste imprécis.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>La boussole ne fonctionne pas</h1>
<h2>Symptôme</h2><p>Le message « Capteur boussole indisponible » s'affiche, ou le pointage reste imprécis.</p>
<h2>Causes possibles</h2>
<ul>
  <li>Le navigateur bloque l'accès aux capteurs de mouvement/orientation.</li>
  <li>Permission d'orientation refusée (Safari iOS 13+).</li>
  <li>Le capteur du téléphone a besoin d'une calibration.</li>
</ul>
<h2>Diagnostic</h2><p>Le panneau de diagnostic affiché par l'application indique si des événements d'orientation sont reçus ou non, et si l'angle mesuré (alpha) reste vide.</p>
<h2>Solution</h2>
<ul>
  <li><strong>Chrome (surtout desktop)</strong> : Menu ⋮ → Paramètres → Paramètres des sites → Capteurs → Autoriser.</li>
  <li><strong>Événements reçus mais imprécis</strong> : agiter le téléphone en formant un « 8 » pour calibrer la boussole du système.</li>
  <li><strong>Safari iOS</strong> : relancer le mode boussole pour redéclencher la demande d'autorisation d'orientation.</li>
</ul>
<h2>Si le problème persiste</h2><p>Utiliser la carte en mode manuel : faire glisser l'écran pour orienter la carte, et suivre le cap/hauteur affichés en texte.</p>
<h2>Informations à fournir au support</h2><p>Modèle de téléphone, navigateur, si le panneau de diagnostic indique « aucun événement reçu » ou « alpha=null ».</p>
<p><a href="../../features/carte-du-ciel/">Voir aussi : Carte du ciel interactive</a></p>
`,
};

PAGES['ts-notif'] = {
  description: "Les rappels d'événements ou d'alertes ISS ne se déclenchent pas.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>Les notifications n'arrivent pas</h1>
<h2>Symptôme</h2><p>Une alerte est activée mais aucune notification ne s'affiche à l'heure prévue.</p>
<h2>Causes possibles</h2>
<ul>
  <li>Permission de notification refusée ou bloquée dans le navigateur.</li>
  <li>L'application (ou l'onglet) a été fermée entre la programmation et l'échéance — les rappels reposent sur un minuteur local, pas sur une notification push serveur.</li>
</ul>
<h2>Diagnostic</h2><p>Ouvrir l'écran Éphémérides ou Outils → Événements → Notifications : un bandeau explicite indique si la permission est bloquée.</p>
<h2>Solution</h2>
<ol>
  <li>Autoriser les notifications pour le site dans les réglages du navigateur.</li>
  <li>Réactiver l'interrupteur d'alerte concerné.</li>
  <li>Garder l'application ouverte (ou en arrière-plan récent) jusqu'à l'échéance de l'événement pour que le rappel se déclenche.</li>
</ol>
<h2>Si le problème persiste</h2><p>Consulter directement le calendrier dans Éphémérides ou Outils → Événements, qui reste à jour même sans notification.</p>
<h2>Informations à fournir au support</h2><p>Navigateur, système d'exploitation, capture du bandeau d'état affiché.</p>
<p><a href="../../permissions/">Voir aussi : Permissions</a></p>
`,
};

PAGES['ts-weather'] = {
  description: "La carte météo affiche « Données météo indisponibles ».",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>Météo indisponible</h1>
<h2>Symptôme</h2><p>« Données météo indisponibles », ou la carte météo reste vide/en chargement.</p>
<h2>Causes possibles</h2>
<ul>
  <li>Pas de connexion Internet.</li>
  <li>Le service Open-Meteo est temporairement indisponible.</li>
</ul>
<h2>Diagnostic</h2><p>Vérifier que d'autres fonctionnalités en ligne de l'application (actualités, images) fonctionnent également ; si non, le problème est réseau.</p>
<h2>Solution</h2>
<ol>
  <li>Vérifier la connexion Internet de l'appareil.</li>
  <li>Réouvrir l'écran concerné (Éphémérides, Observer, Astrophoto) pour relancer la requête.</li>
</ol>
<h2>Si le problème persiste</h2><p>Les calculs astronomiques (lever/coucher, phases, événements) restent disponibles et fiables même sans météo.</p>
<h2>Informations à fournir au support</h2><p>Heure et lieu approximatifs, écran concerné, état de la connexion.</p>
<p><a href="../../offline/">Voir aussi : Hors connexion</a></p>
`,
};

PAGES['ts-ai'] = {
  description: "L'assistant IA affiche une erreur de connexion ou ne répond pas.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>L'assistant IA ne répond pas</h1>
<h2>Symptôme</h2><p>« Configurez une clé OpenRouter ou Anthropic dans les Paramètres pour activer l'assistant. » ou « Erreur de connexion. Vérifiez votre clé API dans les Paramètres. »</p>
<h2>Causes possibles</h2>
<ul>
  <li>Aucune clé API configurée.</li>
  <li>Clé invalide, expirée ou quota dépassé chez le fournisseur (OpenRouter/Anthropic).</li>
  <li>Pas de connexion Internet.</li>
</ul>
<h2>Diagnostic</h2><p>Dans Paramètres, utiliser le bouton « Tester » (clé Anthropic) ou « Modèles gratuits » (clé OpenRouter) : un statut « Clé invalide » confirme un problème de clé plutôt que de réseau.</p>
<h2>Solution</h2>
<ol>
  <li>Configurer une clé API valide dans Paramètres (voir <a href="../../features/cles-api-ia/">Clés API pour l'IA</a>).</li>
  <li>Si la clé était déjà configurée, vérifier qu'elle n'a pas expiré ou atteint son quota côté fournisseur.</li>
  <li>Vérifier la connexion Internet.</li>
</ol>
<h2>Si le problème persiste</h2><p>Essayer l'autre fournisseur (Anthropic si OpenRouter échoue, ou inversement) — un seul suffit pour activer l'IA.</p>
<h2>Informations à fournir au support</h2><p>Fournisseur IA utilisé (OpenRouter/Anthropic), message d'erreur exact affiché.</p>
`,
};

PAGES['ts-images'] = {
  description: "Les galeries d'images (JWST, planètes, conquête spatiale) ne se chargent pas.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>Les images ne se chargent pas</h1>
<h2>Symptôme</h2><p>Galerie vide, ou message « Impossible de charger les images. Vérifiez votre connexion et réessayez. » (galerie James Webb).</p>
<h2>Causes possibles</h2>
<ul>
  <li>Pas de connexion Internet.</li>
  <li>Wikimedia Commons ou l'API NASA Images sont temporairement indisponibles.</li>
</ul>
<h2>Diagnostic</h2><p>Vérifier la connexion, puis utiliser le bouton « ↻ Actualiser » présent sur la plupart des galeries.</p>
<h2>Solution</h2>
<ol>
  <li>Vérifier la connexion Internet.</li>
  <li>Toucher « ↻ Actualiser » pour relancer le chargement.</li>
</ol>
<h2>Si le problème persiste</h2><p>Le texte et les données (fiches constellations, chapitres de la Conquête spatiale) restent disponibles même sans les images associées.</p>
<h2>Informations à fournir au support</h2><p>Écran concerné, message affiché le cas échéant.</p>
`,
};

PAGES['ts-iss'] = {
  description: "Aucun passage ISS/Tiangong n'apparaît, ou message d'échec de récupération.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>Passages ISS/Tiangong indisponibles</h1>
<h2>Symptôme</h2><p>« Aucun passage visible depuis votre position dans les 24 prochaines heures. » ou « Impossible de récupérer les données de passage. »</p>
<h2>Causes possibles</h2>
<ul>
  <li>Aucun passage réellement visible dans la fenêtre calculée (message normal, pas une erreur).</li>
  <li>Les deux sources de données orbitales (wheretheiss.at puis Celestrak en secours) sont indisponibles.</li>
  <li>Pas de connexion Internet.</li>
</ul>
<h2>Diagnostic</h2><p>Si le message est « Aucun passage visible… », c'est un résultat normal du calcul, pas un dysfonctionnement. Le message « Impossible de récupérer les données » indique un échec réseau.</p>
<h2>Solution</h2>
<ol>
  <li>Vérifier la connexion Internet et réessayer plus tard.</li>
  <li>La position ISS en direct (carte « ISS en orbite ») se rafraîchit automatiquement toutes les 10 secondes une fois la connexion rétablie.</li>
</ol>
<h2>Si le problème persiste</h2><p>Consulter les distances des sondes lointaines dans le même écran, qui restent disponibles sans réseau (calcul local).</p>
<h2>Informations à fournir au support</h2><p>Heure de consultation, message exact affiché.</p>
`,
};

PAGES['ts-import'] = {
  description: "Le fichier de sauvegarde importé est refusé par l'application.",
  html: `
<div class="eyebrow">Dépannage</div>
<h1>L'import de données échoue</h1>
<h2>Symptôme</h2><p>L'import d'un fichier de sauvegarde ne fonctionne pas ou l'application n'applique pas les données attendues.</p>
<h2>Causes possibles</h2>
<ul>
  <li>Le fichier n'est pas un export généré par Astror (format <code>{ app:'astror', data:{...} }</code> attendu).</li>
  <li>Le fichier a été modifié manuellement et n'est plus un JSON valide.</li>
</ul>
<h2>Diagnostic</h2><p>Vérifier que le fichier provient bien du bouton « Exporter mes données » d'Astror et n'a pas été édité.</p>
<h2>Solution</h2>
<ol>
  <li>Réessayer avec le fichier original, non modifié.</li>
  <li>Si le fichier est correct et que l'import échoue quand même, exporter à nouveau les données actuelles avant toute nouvelle tentative, pour ne pas perdre l'état courant.</li>
</ol>
<h2>Si le problème persiste</h2><p>Reconfigurer manuellement les paramètres concernés plutôt que de dépendre de l'import.</p>
<h2>Informations à fournir au support</h2><p>Comment le fichier a été obtenu, taille approximative du fichier.</p>
<p><a href="../../features/export-import/">Voir aussi : Export et import des données</a></p>
`,
};
// ---- FAQ (§22) ----
PAGES['faq'] = {
  description: "Questions fréquentes sur l'installation, la localisation, le hors-ligne, les données et l'IA.",
  html: `
<div class="eyebrow">FAQ</div>
<h1>Questions fréquentes</h1>
<div class="faq">
<details><summary>Comment installer l'application ?</summary><div class="faq-body">Depuis le navigateur (Chrome sur Android, Safari sur iOS), utiliser l'option « Installer l'application » ou « Ajouter à l'écran d'accueil ». Détail : <a href="../getting-started/">Bien démarrer</a>.</div></details>
<details><summary>Pourquoi Astror demande-t-il ma localisation ?</summary><div class="faq-body">Pour centrer les calculs (Lune, Soleil, planètes, carte du ciel) sur votre position réelle. C'est optionnel : une ville peut être choisie manuellement. Détail : <a href="../permissions/">Permissions</a>.</div></details>
<details><summary>Pourquoi la boussole ne fonctionne-t-elle pas ?</summary><div class="faq-body">Le capteur d'orientation peut être bloqué par le navigateur ou nécessiter une calibration. Voir <a href="../troubleshooting/boussole/">Dépannage boussole</a>.</div></details>
<details><summary>Puis-je utiliser Astror sans Internet ?</summary><div class="faq-body">Oui pour tous les calculs astronomiques (Lune, Soleil, planètes, événements, carte du ciel, journal, quiz). La météo, les images, les actualités et l'assistant IA nécessitent une connexion. Détail : <a href="../offline/">Hors connexion</a>.</div></details>
<details><summary>Où sont mes données ?</summary><div class="faq-body">Uniquement sur votre appareil, dans le stockage local du navigateur. Astror n'a pas de compte utilisateur ni de serveur applicatif. Détail : <a href="../data/">Données et confidentialité</a>.</div></details>
<details><summary>Comment supprimer mes données ?</summary><div class="faq-body">Il n'existe pas de bouton « Tout effacer » dédié dans l'application ; effacer les données du site depuis les réglages du navigateur (ou désinstaller l'application) supprime toutes les données locales.</div></details>
<details><summary>Comment exporter mes données ?</summary><div class="faq-body">Paramètres → « Exporter mes données » télécharge un fichier JSON complet. Ne le partagez pas s'il contient une clé API. Détail : <a href="../features/export-import/">Export et import</a>.</div></details>
<details><summary>Comment réinitialiser l'application ?</summary><div class="faq-body">« Revoir l'introduction » dans Paramètres relance le questionnaire de profil. Pour repartir de zéro complètement, effacer les données du site dans le navigateur.</div></details>
<details><summary>Pourquoi l'assistant IA ne répond pas ?</summary><div class="faq-body">Il faut configurer une clé API personnelle (OpenRouter ou Anthropic) dans Paramètres — Astror n'inclut pas de clé par défaut. Détail : <a href="../features/cles-api-ia/">Clés API pour l'IA</a>.</div></details>
<details><summary>Astror est-il gratuit ?</summary><div class="faq-body">L'application et toutes ses fonctionnalités de calcul sont gratuites. Les fonctionnalités IA nécessitent une clé personnelle, dont le coût dépend de l'offre du fournisseur choisi (OpenRouter propose des modèles gratuits « :free »).</div></details>
</div>
`,
};

// ---- Référence (§23–§27) ----
PAGES['reference-index'] = {
  description: "Index de la section référence : paramètres, erreurs, glossaire, compatibilité, limites, APIs.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Vue d'ensemble</h1>
<div class="grid-cards">
  <a class="card" href="settings/"><div class="card-title">Tableau des paramètres</div></a>
  <a class="card" href="errors/"><div class="card-title">Codes et messages d'erreur</div></a>
  <a class="card" href="glossary/"><div class="card-title">Glossaire</div></a>
  <a class="card" href="compatibility/"><div class="card-title">Compatibilité</div></a>
  <a class="card" href="limitations/"><div class="card-title">Limites connues</div></a>
  <a class="card" href="apis/"><div class="card-title">APIs externes (technique)</div></a>
  <a class="card" href="../permissions/"><div class="card-title">Permissions</div></a>
  <a class="card" href="../data/"><div class="card-title">Données</div></a>
</div>
`,
};

PAGES['reference-settings'] = {
  description: "Tableau de référence : tous les paramètres, leur identifiant interne et leur clé de stockage.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Tableau des paramètres</h1>
<p class="lede">Vue technique — voir <a href="../../settings/">Paramètres</a> pour la présentation orientée utilisateur.</p>
${tbl(`<table>
<tr><th>Paramètre</th><th>Type</th><th>Défaut</th><th>Stockage (localStorage)</th></tr>
<tr><td>Niveau d'expérience</td><td>enum</td><td><code>Amateur</code></td><td><code>astror_profile_v1.level</code></td></tr>
<tr><td>Localisation</td><td>objet {city,lat,lng}</td><td><code>{Paris, 48.8566, 2.3522}</code></td><td><code>astror_profile_v1.location</code></td></tr>
<tr><td>Centres d'intérêt</td><td>tableau de chaînes</td><td><code>[Planètes, Ciel profond]</code></td><td><code>astror_profile_v1.interests</code></td></tr>
<tr><td>Matériel</td><td>tableau de chaînes</td><td><code>[Jumelles]</code></td><td><code>astror_profile_v1.gear</code></td></tr>
<tr><td>Alertes ISS/conjonctions/météores/éclipses</td><td>objet de booléens</td><td><code>{iss:true, conj:true, meteor:true, eclipse:false}</code></td><td><code>astror_profile_v1.alerts</code></td></tr>
<tr><td>Clé API OpenRouter</td><td>chaîne</td><td>vide</td><td><code>astror_or_key_v1</code></td></tr>
<tr><td>Modèle OpenRouter</td><td>chaîne (id de modèle)</td><td>vide</td><td><code>astror_or_model_v1</code></td></tr>
<tr><td>Clé API Anthropic</td><td>chaîne</td><td>vide</td><td><code>astror_api_key_v1</code></td></tr>
<tr><td>Clé API Google Books</td><td>chaîne</td><td>vide</td><td><code>astror_gbooks_key_v1</code></td></tr>
<tr><td>URL Google Sheets communauté</td><td>chaîne (URL)</td><td>vide</td><td><code>astror_community_sheet_v1</code></td></tr>
<tr><td>Préférences de notification (événements)</td><td>objet de booléens</td><td>selon type</td><td><code>astror_notif_prefs_v1</code></td></tr>
<tr><td>Astuces masquées</td><td>liste</td><td>vide</td><td><code>astror_tips_v1</code></td></tr>
<tr><td>Dernière vérification de mise à jour</td><td>date ISO</td><td>vide</td><td><code>astror_pwa_last_check_v1</code></td></tr>
<tr><td>Dernière mise à jour appliquée</td><td>date ISO</td><td>vide</td><td><code>astror_pwa_last_update_v1</code></td></tr>
</table>`)}
`,
};

PAGES['reference-errors'] = {
  description: "Tous les messages d'erreur affichés à l'utilisateur, trouvés dans le code source d'Astror.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Codes et messages d'erreur</h1>
<p class="lede">Astror n'utilise pas de codes d'erreur numérotés à destination de l'utilisateur ; voici les messages textuels réels affichés à l'écran, avec leur signification et la solution associée.</p>
${tbl(`<table>
<tr><th>Message</th><th>Signification</th><th>Solution</th></tr>
<tr><td>« Données météo indisponibles »</td><td>Échec de récupération de la météo (Open-Meteo)</td><td><a href="../../troubleshooting/meteo/">Dépannage météo</a></td></tr>
<tr><td>« Capteur boussole indisponible »</td><td>Aucun événement d'orientation reçu du téléphone</td><td><a href="../../troubleshooting/boussole/">Dépannage boussole</a></td></tr>
<tr><td>« Les notifications sont bloquées dans votre navigateur… »</td><td>Permission de notification explicitement refusée</td><td><a href="../../troubleshooting/notifications/">Dépannage notifications</a></td></tr>
<tr><td>« Configurez une clé OpenRouter ou Anthropic dans les Paramètres… »</td><td>Aucune clé API IA configurée</td><td><a href="../../features/cles-api-ia/">Clés API pour l'IA</a></td></tr>
<tr><td>« Erreur de connexion. Vérifiez votre clé API dans les Paramètres. »</td><td>Échec réseau ou clé invalide lors d'un appel IA</td><td><a href="../../troubleshooting/assistant-ia/">Dépannage assistant IA</a></td></tr>
<tr><td>« Clé invalide »</td><td>Le test de clé (Paramètres) a échoué</td><td>Vérifier la clé saisie ; regénérer si besoin chez le fournisseur</td></tr>
<tr><td>« Impossible de charger les images. Vérifiez votre connexion et réessayez. »</td><td>Échec Wikimedia Commons (galerie James Webb)</td><td><a href="../../troubleshooting/images/">Dépannage images</a></td></tr>
<tr><td>« Aucun passage visible depuis votre position dans les 24 prochaines heures. »</td><td>Résultat normal du calcul de passages ISS/satellites</td><td>Aucune action requise</td></tr>
<tr><td>« Impossible de récupérer les données de passage. »</td><td>Échec réseau des sources de données orbitales (TLE)</td><td><a href="../../troubleshooting/iss/">Dépannage passages ISS</a></td></tr>
<tr><td>« Erreur de recherche. Vérifiez votre connexion. »</td><td>Échec de la recherche de livres (Veille → Bibliothèque)</td><td>Vérifier la connexion et réessayer</td></tr>
<tr><td>« Impossible de charger la feuille. Vérifiez que l'URL est correcte et que la feuille est partagée en lecture publique. »</td><td>URL de classement communautaire invalide ou feuille non publique</td><td>Corriger l'URL dans Paramètres → Communauté</td></tr>
<tr><td>« Fil en direct indisponible — publications de démonstration affichées. »</td><td>Échec Mastodon (Outils → Communauté)</td><td>Aucune action requise, réessayer plus tard</td></tr>
<tr><td>« Actualités en direct indisponibles… événements de démonstration affichés. »</td><td>Échec des flux RSS (Outils → Communauté → Sorties)</td><td>Aucune action requise, réessayer plus tard</td></tr>
<tr><td>« Nuit blanche — pas de nuit astronomique ce soir à cette latitude. »</td><td>Aucune fenêtre d'observation calculable (latitude/saison)</td><td>Aucune action requise, résultat normal</td></tr>
</table>`)}
`,
};

PAGES['reference-glossary'] = {
  description: "Glossaire des principaux termes techniques utilisés dans l'interface d'Astror.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Glossaire</h1>
<p class="lede">Termes transverses à l'application. Un glossaire beaucoup plus complet (47 termes astronomiques) est disponible directement dans l'outil <a href="../../guide/outils/apprendre/">Apprendre</a>. Voir aussi les <a href="../limitations/">limites connues</a>.</p>
${tbl(`<table>
<tr><th>Terme</th><th>Définition</th><th>Utilisation dans Astror</th></tr>
<tr><td>PWA (Progressive Web App)</td><td>Application web installable comme une application native, avec fonctionnement hors ligne partiel</td><td>Astror s'installe et se lance ainsi, sans passer par un store d'applications</td></tr>
<tr><td>TLE (Two-Line Element)</td><td>Jeu de données orbitales standard décrivant la trajectoire d'un satellite</td><td>Utilisé pour calculer les passages visibles de l'ISS et de Tiangong</td></tr>
<tr><td>Indice de Bortle</td><td>Échelle de 1 à 9 mesurant la pollution lumineuse d'un ciel nocturne</td><td>Affiché dans Observer (valeur actuellement fixe, voir <a href="../limitations/">Limites connues</a>)</td></tr>
<tr><td>Règle des 500 / règle NPF</td><td>Formules empiriques donnant le temps de pose maximal en astrophotographie avant apparition de filé d'étoiles</td><td>Calculées dans l'outil Astrophoto</td></tr>
<tr><td>Seeing</td><td>Mesure de la turbulence atmosphérique affectant la netteté d'observation</td><td>Estimé à partir des données météo (Observer, Astrophoto)</td></tr>
<tr><td>APOD</td><td>Astronomy Picture of the Day, photo quotidienne publiée par la NASA</td><td>Affichée dans Outils → Apprendre → Contenus</td></tr>
<tr><td>Conjonction</td><td>Alignement apparent de deux objets célestes dans le ciel</td><td>Calculée entre la Lune et les planètes (Éphémérides)</td></tr>
</table>`)}
`,
};

PAGES['reference-compatibility'] = {
  description: "Compatibilité navigateur/OS d'Astror, d'après les contraintes explicites du code.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Compatibilité</h1>
<p class="lede">Astror n'effectue pas de détection de navigateur générale ; les contraintes ci-dessous sont celles explicitement gérées dans le code.</p>
<ul>
  <li><strong>iOS 13+ (Safari)</strong> : l'accès à l'orientation de l'appareil (boussole) nécessite une autorisation explicite via <code>DeviceOrientationEvent.requestPermission()</code>, gérée automatiquement par Astror lors de l'activation du mode boussole.</li>
  <li><strong>Android (Chrome)</strong> : l'événement d'orientation « absolue » est utilisé en priorité, avec repli sur l'événement relatif standard si indisponible.</li>
  <li><strong>Meta-tags iOS PWA</strong> présents dans l'application (mode plein écran, style de barre de statut, nom affiché) pour une intégration soignée à l'écran d'accueil iOS.</li>
  <li><strong>Manifeste PWA</strong> : mode d'affichage <code>standalone</code>, orientation <code>portrait</code>, icônes 192×192 et 512×512.</li>
</ul>
${verify("le support d'installation PWA sur desktop (Chrome/Edge/Firefox) et le comportement exact sur d'autres navigateurs Android (Firefox, Samsung Internet) n'ont pas été testés spécifiquement pour Astror — seules les plateformes ci-dessus sont couvertes par du code dédié.")}
<h2>Navigateur minimal</h2>
<p>Astror utilise des API web modernes standard (ES modules, Fetch, Notifications, Geolocation, DeviceOrientation, localStorage) ; un navigateur à jour (moins de 2 ans) est recommandé.</p>
`,
};

PAGES['reference-limitations'] = {
  description: "Limites techniques et fonctionnelles connues d'Astror, documentées honnêtement.",
  html: `
<div class="eyebrow">Référence</div>
<h1>Limites connues</h1>
<ul>
  <li><strong>Outil Lune</strong> : les valeurs de phase, illumination et âge affichées sont des constantes statiques, pas un calcul dynamique — voir <a href="../../features/outil-lune/">Outil Lune</a>.</li>
  <li><strong>Outil Planètes</strong> : magnitudes, diamètres apparents et dates de conjonctions/oppositions sont des tableaux statiques valables jusqu'à janvier 2027 — voir <a href="../../features/outil-planetes/">Outil Planètes</a>.</li>
  <li><strong>Indice de Bortle</strong> fixé à 4 dans l'outil Observer, pas une mesure géolocalisée réelle de pollution lumineuse.</li>
  <li><strong>Notifications</strong> reposent sur un minuteur local : elles ne se déclenchent pas si l'application est complètement fermée avant l'échéance (pas de notification push serveur).</li>
  <li><strong>Historique de chat</strong> (Assistant, Assistant IA) non persisté : perdu à la fermeture de l'écran.</li>
  <li><strong>Import de données</strong> : écrase silencieusement les données existantes, sans confirmation ni fusion.</li>
  <li><strong>Clés API</strong> stockées en clair dans le navigateur, incluses telles quelles dans l'export de données.</li>
  <li><strong>Classement communautaire</strong> reste en mode démonstration tant qu'aucune feuille Google Sheets n'est configurée manuellement.</li>
  <li><strong>i18n</strong> : l'interface est entièrement en français, sans option de changement de langue.</li>
  <li><strong>Biographies de la Conquête spatiale</strong> ne sont pas cliquables, contrairement aux autres annexes (Chronologie, Glossaire, Missions).</li>
</ul>
`,
};

PAGES['reference-apis'] = {
  description: "Détail technique (niveau 3) de toutes les APIs externes utilisées par Astror.",
  html: `
<div class="eyebrow">Référence — niveau technique</div>
<h1>APIs externes</h1>
<p class="lede">Aucune de ces API n'exige de compte pour les fonctionnalités de base d'Astror, à l'exception des clés IA et des intégrations optionnelles indiquées.</p>
${tbl(`<table>
<tr><th>Service</th><th>URL de base</th><th>Usage</th><th>Clé requise</th></tr>
<tr><td>Where The ISS At</td><td><code>api.wheretheiss.at</code></td><td>Position et TLE de l'ISS</td><td>Non</td></tr>
<tr><td>Celestrak</td><td><code>celestrak.org</code></td><td>Secours TLE ISS + TLE Tiangong</td><td>Non</td></tr>
<tr><td>Open-Meteo</td><td><code>api.open-meteo.com</code></td><td>Météo locale</td><td>Non</td></tr>
<tr><td>Spaceflight News API v4</td><td><code>api.spaceflightnewsapi.net</code></td><td>Actualités spatiales</td><td>Non</td></tr>
<tr><td>The Space Devs (Launch Library 2)</td><td><code>lldev.thespacedevs.com</code></td><td>Prochains lancements</td><td>Non</td></tr>
<tr><td>NASA APOD</td><td><code>api.nasa.gov</code></td><td>Photo astronomique du jour</td><td><code>DEMO_KEY</code> publique intégrée</td></tr>
<tr><td>NASA Images API</td><td><code>images-api.nasa.gov</code></td><td>Secours d'images</td><td>Non</td></tr>
<tr><td>Wikimedia Commons</td><td><code>commons.wikimedia.org</code></td><td>Galeries d'images par catégorie</td><td>Non</td></tr>
<tr><td>Wikipédia (FR puis EN)</td><td><code>fr.wikipedia.org</code> / <code>en.wikipedia.org</code></td><td>Résumés d'articles</td><td>Non</td></tr>
<tr><td>Open Library</td><td><code>openlibrary.org</code></td><td>Recherche de livres + couvertures</td><td>Non</td></tr>
<tr><td>Google Books</td><td><code>www.googleapis.com/books</code></td><td>Recherche de livres (prioritaire si clé fournie)</td><td>Optionnelle, saisie par l'utilisateur</td></tr>
<tr><td>Mastodon (mastodon.social)</td><td><code>mastodon.social</code></td><td>Fil communautaire</td><td>Non</td></tr>
<tr><td>rss2json (proxy RSS)</td><td><code>api.rss2json.com</code></td><td>Flux RSS de clubs d'astronomie</td><td>Non</td></tr>
<tr><td>Google Sheets (export CSV)</td><td><code>docs.google.com</code></td><td>Classement communautaire</td><td>Non (URL fournie par l'utilisateur)</td></tr>
<tr><td>OpenStreetMap Nominatim</td><td><code>nominatim.openstreetmap.org</code></td><td>Géocodage inverse (coordonnées → ville)</td><td>Non</td></tr>
<tr><td>Anthropic Messages API</td><td><code>api.anthropic.com</code></td><td>Assistant IA</td><td>Oui, saisie par l'utilisateur</td></tr>
<tr><td>OpenRouter</td><td><code>openrouter.ai</code></td><td>Assistant IA (modèles alternatifs)</td><td>Oui, saisie par l'utilisateur</td></tr>
</table>`)}
<p class="small">Détail des messages d'erreur associés à chaque service : <a href="../errors/">Codes et messages d'erreur</a>.</p>
`,
};
// ---- Versions (§28, §29) ----
PAGES['versions'] = {
  description: "Historique des évolutions d'Astror, d'après le changelog du projet.",
  html: `
<div class="eyebrow">Versions</div>
<h1>Historique des versions</h1>
<p class="lede">Depuis la version <strong>1.1.0</strong>, Astror suit un vrai numéro de version sémantique (<code>package.json</code>), incrémenté à chaque changement notable et détaillé dans <code>CHANGELOG.md</code>. Les entrées antérieures, non versionnées individuellement à l'époque, restent groupées par date de session.</p>

<h2>Version 1.1.0 — 2026-08-29</h2>
<h3>Corrections</h3>
<ul>
  <li><strong>Outil Lune</strong> : phase, illumination, âge, distance et diamètre apparent étaient des constantes figées ; calculés en direct désormais (<code>astronomy-engine</code>). Calendrier des phases affichant 4 dates réelles à venir.</li>
  <li><strong>Outil Planètes</strong> : magnitude, taille apparente, phase et visibilité étaient des tableaux figés (valables jusqu'à janvier 2027) ; calculés en direct désormais. La liste « Oppositions & élongations » provient d'un calcul réel (les conjonctions planète-planète, non calculées, ont été retirées du libellé).</li>
  <li><strong>Onboarding rejoué</strong> (« Revoir l'introduction ») repartait des valeurs par défaut au lieu du profil actuel ; corrigé.</li>
</ul>
<h3>Ajouts</h3>
<ul>
  <li>Bouton « Effacer » pour retirer isolément une clé API (OpenRouter, Anthropic, Google Books).</li>
  <li>Bloc « Mises à jour » dans Paramètres : version installée, date de publication, date de dernière vérification, bouton « Vérifier les mises à jour ». Vérification automatique en arrière-plan (toutes les heures), application silencieuse dès qu'une mise à jour est prête.</li>
  <li>Site de documentation complet publié sur GitHub Pages, avec lien depuis Paramètres.</li>
</ul>

<h2>Session — 2026-06-10 (3) — Conquête spatiale : annexes interactives</h2>
<ul>
  <li>Chronologie, Glossaire et Missions rendus cliquables, ouvrant une fiche Wikipédia complète (composant <code>WikiSummarySheet</code>).</li>
  <li>Correction des images de la Conquête spatiale (miniatures Wikimedia au lieu d'URLs pleine taille).</li>
</ul>

<h2>Session — 2026-06-10 (2) — Conquête spatiale</h2>
<ul>
  <li>Nouvel onglet Conquête spatiale dans Explorer : article en 10 chapitres + annexes (Chronologie 34 dates, Glossaire 16 termes, Missions 15, Biographies 8).</li>
  <li>Corrections de plusieurs URLs d'images Wikimedia cassées.</li>
</ul>

<h2>Session — 2026-06-10 (1) — Quiz et enrichissements</h2>
<ul>
  <li>Pool de questions du quiz étendu de 20 à 40, réparties en 6 catégories.</li>
  <li>Ajout du mode chrono et du joker 50/50.</li>
</ul>

<h2>Session — 2026-06-09 (2) — Éducation, Veille, Communauté</h2>
<ul>
  <li>Glossaire de 47 termes, défi du jour, score XP global, parcours pédagogiques.</li>
  <li>Veille : images réelles pour conférences, couvertures de livres, photos de personnalités.</li>
</ul>

<h2>Session — 2026-06-09 (1) — Connexion aux données dynamiques</h2>
<ul>
  <li>Calculs astronomiques locaux (<code>astro.js</code>, astronomy-engine).</li>
  <li>Intégration ISS en direct, météo, actualités, lancements.</li>
  <li>Assistant IA (wrapper OpenRouter/Anthropic), boussole AR.</li>
</ul>

<h2>2026-06-08 — Initialisation du projet</h2>
<ul>
  <li>Build initial : 6 onglets, 9 outils, onboarding 7 étapes, design system, PWA, 21 tests Vitest.</li>
</ul>

<h2>Évolutions plus récentes (non datées individuellement dans le changelog)</h2>
<p>D'après l'historique Git du dépôt : ajout des 88 fiches de constellations reliées à la carte du ciel, 19 figures de constellations sur le dôme visuel, alertes ISS/conjonctions réelles (suppression des données factices), export/import des données, optimisations de performance (precache −80 %, découpage du code), et mode démo (visites guidées automatiques pilotées).</p>
`,
};

// ---- Informations légales (§30) ----
PAGES['legal'] = {
  description: "Mentions légales, confidentialité, conditions d'utilisation — statut actuel et éléments manquants.",
  html: `
<div class="eyebrow">Informations légales</div>
<h1>Informations légales</h1>
${legalNote("cette page ne contient aucun contenu juridique définitif. Le code source d'Astror ne comporte, à ce jour, aucune mention légale, politique de confidentialité ou conditions d'utilisation intégrées à l'application (recherche effectuée sur l'ensemble du dossier src/, sans résultat). La rédaction de ces documents nécessite une validation humaine et n'a pas été générée ici, conformément à la règle imposée par la spécification documentaire du projet.")}

<h2>Ce qui existe aujourd'hui</h2>
<p>Aucun lien « Mentions légales », « Politique de confidentialité » ou « Conditions d'utilisation » n'est actuellement accessible depuis l'application elle-même (onboarding, Paramètres, Aide).</p>

<h2>Ce qui devrait être couvert (structure à valider par un professionnel du droit)</h2>
<ul>
  <li><strong>Mentions légales</strong> — éditeur de l'application, hébergement (Netlify), contact.</li>
  <li><strong>Politique de confidentialité</strong> — voir les faits vérifiés dans <a href="../data/">Données et confidentialité</a>, qui peuvent servir de base factuelle à la rédaction juridique (aucune collecte serveur, stockage local uniquement, transmission à des API tierces sur action de l'utilisateur).</li>
  <li><strong>Conditions d'utilisation</strong> — notamment le fait que les fonctionnalités IA dépendent de clés API tierces fournies par l'utilisateur, sous la responsabilité de ces fournisseurs (OpenRouter, Anthropic, Google).</li>
  <li><strong>Licences et crédits</strong> — dépendances open-source utilisées (React, Vite, astronomy-engine, satellite.js — voir <a href="../reference/apis/">APIs externes</a> pour les services tiers, et le dépôt GitHub pour les licences des bibliothèques).</li>
</ul>

<h2>Action recommandée</h2>
<p>Faire rédiger et valider ces documents par une personne compétente en droit du numérique avant toute publication grand public de l'application, puis ajouter les liens correspondants dans l'écran Paramètres/Aide de l'application (recommandation §34 de la spécification documentaire).</p>
`,
};

// ---- Support (§31) ----
PAGES['support'] = {
  description: "Comment signaler un problème ou demander de l'aide sur Astror.",
  html: `
<div class="eyebrow">Support</div>
<h1>Obtenir de l'aide</h1>
<h2>Signaler un problème</h2>
<p>Astror est un projet open-source hébergé sur GitHub : <a href="https://github.com/nouhailler/astror">github.com/nouhailler/astror</a>. Ouvrir une « Issue » sur ce dépôt est le meilleur moyen de signaler un bug ou de proposer une amélioration.</p>

<h2>Informations utiles à fournir</h2>
<ul>
  <li>Version de l'application (voir en bas de l'écran Paramètres).</li>
  <li>Appareil et système d'exploitation (ex. iPhone / iOS 18, Android 14…).</li>
  <li>Navigateur utilisé (Safari, Chrome…) et s'il s'agit de l'application installée (PWA) ou d'un onglet de navigateur.</li>
  <li>Message d'erreur exact affiché, le cas échéant (voir <a href="../reference/errors/">Codes et messages d'erreur</a>).</li>
  <li>État de la connexion réseau au moment du problème.</li>
  <li>Étapes précises permettant de reproduire le problème.</li>
</ul>

<h2>Avant de signaler un problème</h2>
<p>Consulter d'abord la section <a href="../troubleshooting/">Dépannage</a> et la <a href="../faq/">FAQ</a>, qui couvrent les problèmes les plus courants (localisation, boussole, notifications, météo, assistant IA, images).</p>

<h2>Sauvegarder ses données avant de contacter le support</h2>
<p>Si la manipulation proposée implique de réinitialiser l'application, exporter d'abord ses données : <a href="../features/export-import/">Export et import des données</a>.</p>
`,
};
// ---PAGES-INSERT---
