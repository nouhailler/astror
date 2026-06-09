export const SKY_OBJECTS = [
  { id:'jupiter', kind:'Planète', name:'Jupiter', mag:-2.4, alt:52, az:148, x:62, y:34, r:5.2, color:'#e9c98a', cons:'Taureau',
    info:'Géante gazeuse, la plus brillante ce soir. Les quatre lunes galiléennes sont visibles aux jumelles.', dist:'4,9 UA', rise:'18:42', set:'04:10' },
  { id:'saturn', kind:'Planète', name:'Saturne', mag:0.7, alt:24, az:205, x:40, y:60, r:4, color:'#e7d6a6', cons:'Verseau',
    info:'Anneaux inclinés à 9°. Un télescope de 60 mm suffit pour les distinguer.', dist:'9,6 UA', rise:'15:30', set:'00:55' },
  { id:'venus', kind:'Planète', name:'Vénus', mag:-4.1, alt:11, az:255, x:24, y:74, r:4.6, color:'#fdf3d0', cons:'Poissons',
    info:'Étoile du soir éclatante, bas sur l\'horizon ouest après le coucher du Soleil.', dist:'0,72 UA', rise:'09:10', set:'20:48' },
  { id:'mars', kind:'Planète', name:'Mars', mag:0.9, alt:38, az:110, x:74, y:46, r:3.6, color:'#e0916f', cons:'Cancer',
    info:'Teinte rouge orangée caractéristique. Opposition prochaine en janvier 2027.', dist:'1,4 UA', rise:'21:05', set:'07:30' },
  { id:'vega', kind:'Étoile', name:'Véga', mag:0.0, alt:78, az:300, x:48, y:18, r:3, color:'#cfe0ff', cons:'Lyre',
    info:'Étoile la plus brillante de la Lyre, sommet du Triangle d\'été. À 25 années-lumière.', dist:'25 al', rise:'—', set:'—' },
  { id:'deneb', kind:'Étoile', name:'Deneb', mag:1.25, alt:71, az:330, x:55, y:24, r:2.6, color:'#dbe6ff', cons:'Cygne',
    info:'Supergéante bleue, l\'une des étoiles les plus lumineuses connues (≈ 200 000 L☉).', dist:'2 600 al', rise:'—', set:'—' },
  { id:'m31', kind:'Galaxie', name:'M31 — Andromède', mag:3.4, alt:44, az:48, x:80, y:30, r:2.4, color:'#b9c6e8', cons:'Andromède', deep:true,
    info:'Galaxie spirale, l\'objet le plus lointain visible à l\'œil nu (2,5 M al). Idéale aux jumelles.', dist:'2,5 M al', rise:'—', set:'—' },
  { id:'m13', kind:'Amas', name:'M13 — Hercule', mag:5.8, alt:64, az:285, x:44, y:30, r:2, color:'#cdbfe8', cons:'Hercule', deep:true,
    info:'Amas globulaire de ~300 000 étoiles. Spectaculaire dans un 200 mm.', dist:'22 000 al', rise:'—', set:'—' },
  { id:'m57', kind:'Nébuleuse', name:'M57 — Anneau', mag:8.8, alt:75, az:305, x:50, y:21, r:1.7, color:'#9fd6c2', cons:'Lyre', deep:true,
    info:'Nébuleuse planétaire en anneau. Nécessite un télescope ; visible entre Sheliak et Sulafat.', dist:'2 300 al', rise:'—', set:'—' },
]

export const CONSTELLATIONS = [
  { name:'Cygne', pts:[[55,24],[52,33],[49,42],[46,30],[58,30],[48,52]], lines:[[0,1],[1,2],[3,1],[1,4],[2,5]] },
  { name:'Lyre', pts:[[48,18],[50,21],[46,24]], lines:[[0,1],[1,2],[2,0]] },
]

export const SUN_MOON = {
  sunrise:'05:51', sunset:'21:54', dawnAstro:'03:42', duskAstro:'00:05',
  moonPhase:'Gibbeuse croissante', moonIllum:73, moonAge:9.4, moonrise:'15:22', moonset:'02:48',
  nightLen:'3 h 37', lunarDist:'389 400 km',
}

export const ALERTS = [
  { id:1, icon:'iss', title:'Passage de l\'ISS', when:'Ce soir · 22:41 → 22:47', detail:'Mag −3,8 · culmine à 78° · trajectoire SO → NE. Visible à l\'œil nu pendant 6 minutes.', live:true },
  { id:2, icon:'conj', title:'Conjonction Lune – Saturne', when:'Demain · 23:10', detail:'Séparation de 1,4°. Belle composition aux jumelles, bas sur l\'horizon sud-est.' },
  { id:3, icon:'iri', title:'Station chinoise Tiangong', when:'8 juin · 04:12', detail:'Mag −1,9 · passage rapide à 41° d\'élévation, direction SO.' },
]

export const EVENTS = [
  { id:'a', date:'2026-08-12', label:'Perséides — maximum', kind:'Pluie de météores', zhr:'~100/h', detail:'L\'une des plus actives de l\'année. Radiant dans Persée, conditions favorables (Lune à 18 %).' },
  { id:'b', date:'2026-09-07', label:'Éclipse totale de Lune', kind:'Éclipse', zhr:'82 min', detail:'Totalité visible depuis l\'Europe, l\'Afrique et l\'Asie. Lune de sang à 03:11 TU.' },
  { id:'c', date:'2026-08-02', label:'Éclipse totale de Soleil', kind:'Éclipse', zhr:'2 min 18 s', detail:'Bande de totalité traversant l\'Espagne. Partielle depuis toute la France.' },
  { id:'d', date:'2026-12-14', label:'Géminides — maximum', kind:'Pluie de météores', zhr:'~120/h', detail:'La plus riche pluie annuelle. Météores lents et brillants issus de (3200) Phaéthon.' },
  { id:'e', date:'2027-01-19', label:'Opposition de Mars', kind:'Planète', zhr:'14,0″', detail:'Mars au plus proche : diamètre apparent maximal, idéal pour l\'imagerie planétaire.' },
]

export const CONDITIONS = {
  seeing:'Bon', seeingVal:3, transparency:'Excellente', transVal:4,
  bortle:4, clouds:8, humidity:62, temp:14, moonInterf:'Modérée',
}

export const PLANETS = [
  { id:'mercure', name:'Mercure', sub:'Planète tellurique', color:'#b8a48a', glow:'#cdb79c',
    diam:'4 879 km', mass:'0,055 M⊕', day:'176 j', year:'88 j', moons:0, temp:'−173 → 427 °C', dist:'0,39 UA',
    note:'La plus petite planète et la plus proche du Soleil. Sans atmosphère notable, criblée de cratères.' },
  { id:'venus', name:'Vénus', sub:'Planète tellurique', color:'#d9b779', glow:'#e7cd96',
    diam:'12 104 km', mass:'0,815 M⊕', day:'243 j', year:'225 j', moons:0, temp:'464 °C', dist:'0,72 UA',
    note:'Effet de serre extrême sous une atmosphère de CO₂. Rotation rétrograde, la plus lente du système.' },
  { id:'terre', name:'Terre', sub:'Planète tellurique', color:'#6f9fd0', glow:'#8fc0e8',
    diam:'12 742 km', mass:'1 M⊕', day:'24 h', year:'365,25 j', moons:1, temp:'15 °C moy.', dist:'1 UA',
    note:'La seule planète connue abritant la vie. Hydrosphère liquide et champ magnétique protecteur.' },
  { id:'mars', name:'Mars', sub:'Planète tellurique', color:'#c5704a', glow:'#dd8a63',
    diam:'6 779 km', mass:'0,107 M⊕', day:'24,6 h', year:'687 j', moons:2, temp:'−63 °C moy.', dist:'1,52 UA',
    note:'La planète rouge. Olympus Mons culmine à 22 km. Indices d\'eau liquide passée.' },
  { id:'jupiter', name:'Jupiter', sub:'Géante gazeuse', color:'#cda972', glow:'#e3c391',
    diam:'139 820 km', mass:'318 M⊕', day:'9,9 h', year:'11,9 ans', moons:95, temp:'−108 °C', dist:'5,2 UA',
    note:'La plus massive. La Grande Tache rouge est un anticyclone plus large que la Terre.' },
  { id:'saturne', name:'Saturne', sub:'Géante gazeuse', color:'#d8c188', glow:'#ecd9a4',
    diam:'116 460 km', mass:'95 M⊕', day:'10,7 h', year:'29,5 ans', moons:146, temp:'−139 °C', dist:'9,5 UA',
    note:'Système d\'anneaux de glace iconique. Densité inférieure à celle de l\'eau.' },
  { id:'uranus', name:'Uranus', sub:'Géante de glace', color:'#9fd3d8', glow:'#bce6ea',
    diam:'50 724 km', mass:'14,5 M⊕', day:'17,2 h', year:'84 ans', moons:28, temp:'−197 °C', dist:'19,2 UA',
    note:'Inclinée à 98° : elle roule sur son orbite. Atmosphère de méthane bleu-vert.' },
  { id:'neptune', name:'Neptune', sub:'Géante de glace', color:'#5a7fd6', glow:'#7f9fe8',
    diam:'49 244 km', mass:'17 M⊕', day:'16,1 h', year:'165 ans', moons:16, temp:'−201 °C', dist:'30,1 UA',
    note:'Vents les plus violents du système solaire (2 100 km/h). Découverte par le calcul en 1846.' },
]

export const JWST = [
  { id:'jw1', slot:'jw-carina', name:'Falaises cosmiques', target:'NGC 3324 · Carène', instr:'NIRCam', date:'Juil. 2022',
    note:'Bordure de la nébuleuse de la Carène. Les pics atteignent 7 années-lumière de haut.' },
  { id:'jw2', slot:'jw-srings', name:'Anneaux de Saturne', target:'Saturne', instr:'NIRCam', date:'Juin 2023',
    note:'Anneaux d\'une netteté inédite en proche infrarouge ; le disque apparaît sombre (méthane).' },
  { id:'jw3', slot:'jw-pillars', name:'Piliers de la Création', target:'M16 · Aigle', instr:'NIRCam + MIRI', date:'Oct. 2022',
    note:'Colonnes de gaz et poussière où naissent de nouvelles étoiles, revisitées par Webb.' },
  { id:'jw4', slot:'jw-deep', name:'Premier champ profond', target:'SMACS 0723', instr:'NIRCam', date:'Juil. 2022',
    note:'Amas de galaxies agissant comme lentille gravitationnelle ; certaines galaxies à 13 Mds d\'al.' },
  { id:'jw5', slot:'jw-phantom', name:'Galaxie fantôme', target:'M74', instr:'MIRI', date:'Août 2022',
    note:'Spirale parfaite vue de face ; le moyen infrarouge révèle les filaments de poussière.' },
  { id:'jw6', slot:'jw-neptune', name:'Neptune et ses anneaux', target:'Neptune', instr:'NIRCam', date:'Sept. 2022',
    note:'Première image nette des anneaux de Neptune depuis Voyager 2 (1989).' },
]

export const ANOMALIES = [
  { id:'dm', name:'Matière noire', tag:'~27 % de l\'univers', color:'#7ea6e6',
    wikiUrl:'https://fr.wikipedia.org/wiki/Matière_noire',
    short:'Masse invisible qui ne rayonne pas mais courbe la lumière et structure les galaxies.',
    body:'Postulée pour expliquer la rotation des galaxies, trop rapide pour la seule matière visible. Candidats : WIMPs, axions, neutrinos stériles. Aucune détection directe à ce jour ; les contraintes se resserrent (LZ, XENONnT).',
    facts:[['Fraction d\'énergie','26,8 %'],['Preuve clé','Courbes de rotation'],['Détection','Indirecte / gravitationnelle']] },
  { id:'de', name:'Énergie noire', tag:'~68 % de l\'univers', color:'#b08ae0',
    wikiUrl:'https://fr.wikipedia.org/wiki/Énergie_noire',
    short:'Composante qui accélère l\'expansion de l\'univers depuis ~5 milliards d\'années.',
    body:'Mise en évidence en 1998 via les supernovæ de type Ia. Décrite par la constante cosmologique Λ (w ≈ −1). Les relevés DESI (2024-25) suggèrent une possible évolution de w, ce qui défierait le modèle standard.',
    facts:[['Fraction d\'énergie','68,3 %'],['Paramètre','w ≈ −1'],['Découverte','SN Ia, 1998 (Nobel 2011)']] },
  { id:'cr', name:'Rayons cosmiques', tag:'Particules ultra-énergétiques', color:'#84d3a9',
    wikiUrl:'https://fr.wikipedia.org/wiki/Rayon_cosmique',
    short:'Noyaux et particules accélérés à des énergies inaccessibles aux accélérateurs terrestres.',
    body:'Principalement des protons. Les événements les plus extrêmes (« Oh-My-God », 3×10²⁰ eV) dépassent la limite GZK. Origines probables : supernovæ, AGN, sursauts gamma. Observés par Pierre Auger et Telescope Array.',
    facts:[['Énergie record','3,2 × 10²⁰ eV'],['Composition','~90 % protons'],['Observatoire','Pierre Auger']] },
  { id:'h0', name:'Tension de Hubble', tag:'Crise cosmologique', color:'#e7bd6e',
    wikiUrl:'https://fr.wikipedia.org/wiki/Tension_de_Hubble',
    short:'Désaccord persistant entre deux mesures du taux d\'expansion de l\'univers.',
    body:'L\'univers primordial (CMB, Planck) donne H₀ ≈ 67,4 km/s/Mpc ; l\'univers local (céphéides + SN Ia, SH0ES) donne ≈ 73. L\'écart dépasse 5σ — soit une erreur systématique, soit une physique nouvelle.',
    facts:[['Planck (CMB)','67,4 km/s/Mpc'],['SH0ES (local)','73,0 km/s/Mpc'],['Tension','> 5 σ']] },
  { id:'bh', name:'Trous noirs', tag:'Singularités gravitationnelles', color:'#9aa6c4',
    wikiUrl:'https://fr.wikipedia.org/wiki/Trou_noir',
    short:'Régions où la gravité empêche toute fuite, y compris de la lumière.',
    body:'Du stellaire (quelques M☉) au supermassif (millions à milliards de M☉). Premières images par l\'EHT : M87* (2019) et Sgr A* (2022). Les ondes gravitationnelles (LIGO/Virgo) sondent leurs fusions.',
    facts:[['Sgr A* (Voie lactée)','4,3 M☉ millions'],['1ʳᵉ image','M87*, 2019'],['Ondes grav.','LIGO/Virgo, 2015']] },
]

export const THEORIES = [
  { id:'bb', name:'Big Bang', when:'Modèle standard', icon:'•',
    wikiUrl:'https://fr.wikipedia.org/wiki/Big_Bang',
    short:'L\'univers en expansion à partir d\'un état chaud et dense il y a 13,8 Mds d\'années.',
    body:'Soutenu par trois piliers : l\'expansion (loi de Hubble-Lemaître), le fond diffus cosmologique à 2,7 K, et l\'abondance des éléments légers (nucléosynthèse primordiale).' },
  { id:'infl', name:'Inflation cosmique', when:'10⁻³⁶ s après t=0', icon:'↑',
    wikiUrl:'https://fr.wikipedia.org/wiki/Inflation_cosmologique',
    short:'Expansion exponentielle fulgurante de l\'univers très primordial.',
    body:'Proposée par Guth (1980), elle résout les problèmes de l\'horizon et de la platitude, et explique l\'origine quantique des fluctuations à grande échelle observées dans le CMB.' },
  { id:'lcdm', name:'Modèle ΛCDM', when:'Cadre de concordance', icon:'Λ',
    wikiUrl:'https://fr.wikipedia.org/wiki/Modèle_de_concordance',
    short:'Univers plat composé d\'énergie noire (Λ) et de matière noire froide.',
    body:'Le modèle standard de la cosmologie : 68 % d\'énergie noire, 27 % de matière noire, 5 % de matière ordinaire. Ajuste remarquablement le CMB et les grandes structures.' },
  { id:'mw', name:'Multivers', when:'Hypothèse spéculative', icon:'∞',
    wikiUrl:'https://fr.wikipedia.org/wiki/Multivers',
    short:'Notre univers serait l\'un parmi une multitude d\'autres.',
    body:'Issu de l\'inflation éternelle ou de l\'interprétation des mondes multiples. Débattu : difficilement falsifiable, il reste à la frontière de la physique et de la philosophie.' },
  { id:'string', name:'Théorie des cordes', when:'Gravité quantique', icon:'≈',
    wikiUrl:'https://fr.wikipedia.org/wiki/Théorie_des_cordes',
    short:'Les particules seraient des cordes vibrantes dans un espace à 10/11 dimensions.',
    body:'Candidate à l\'unification de la mécanique quantique et de la relativité générale. Élégante mathématiquement mais sans prédiction expérimentale confirmée à ce jour.' },
]

export const NEWS = [
  { id:'n1', cat:'Lancement', org:'SpaceX', title:'Starship — vol d\'essai orbital V3', when:'12 juin 2026', tag:'à venir',
    detail:'Premier vol de la version 3 depuis Starbase, avec tentative de récupération du Super Heavy.' },
  { id:'n2', cat:'Mission', org:'ESA', title:'JUICE — survol de Vénus', when:'31 août 2026', tag:'trajet',
    detail:'Assistance gravitationnelle vers Jupiter ; arrivée dans le système jovien prévue en 2031.' },
  { id:'n3', cat:'Programme', org:'NASA', title:'Artemis II — équipage autour de la Lune', when:'Fév. 2026', tag:'proche',
    detail:'Premier vol habité du programme : survol lunaire sans alunissage, 10 jours de mission.' },
  { id:'n4', cat:'Science', org:'ESA', title:'Euclid — 1ʳᵉ livraison de données', when:'Mars 2026', tag:'publié',
    detail:'Cartographie de millions de galaxies pour sonder énergie noire et matière noire.' },
]

export const CONFERENCES = [
  { id:'c1', name:'European Astronomical Society — EAS 2026', place:'Cracovie, Pologne', date:'22–26 juin 2026', topic:'Réunion annuelle européenne' },
  { id:'c2', name:'COSPAR Scientific Assembly', place:'Florence, Italie', date:'18–26 juil. 2026', topic:'Recherche spatiale' },
  { id:'c3', name:'IAU — General Assembly', place:'Le Cap, Afrique du Sud', date:'3–14 août 2027', topic:'Union astronomique internationale' },
  { id:'c4', name:'Rencontres du Ciel et de l\'Espace', place:'Cité des sciences, Paris', date:'7–8 nov. 2026', topic:'Grand public & amateurs' },
]

export const PEOPLE = [
  { id:'p1', name:'Adam Riess', role:'Prix Nobel 2011', field:'Tension de Hubble',
    note:'Codécouvreur de l\'accélération de l\'expansion. Mène l\'équipe SH0ES, au cœur du débat sur H₀.' },
  { id:'p2', name:'Brian Schmidt', role:'Prix Nobel 2011', field:'Énergie noire',
    note:'Codirigea le High-z Supernova Search qui révéla l\'expansion accélérée de l\'univers.' },
  { id:'p3', name:'Andrea Ghez', role:'Prix Nobel 2020', field:'Trou noir galactique',
    note:'A démontré la présence de Sgr A* au centre de la Voie lactée par le suivi des étoiles.' },
  { id:'p4', name:'Jocelyn Bell Burnell', role:'Découverte des pulsars', field:'Astrophysique',
    note:'Détecta le premier pulsar en 1967, ouvrant l\'étude des étoiles à neutrons.' },
  { id:'p5', name:'Françoise Combes', role:'Collège de France', field:'Dynamique des galaxies',
    note:'Spécialiste de la matière noire et de la formation des galaxies ; médaille d\'or du CNRS.' },
]

export const BOOKS = [
  { id:'b1', title:'L\'Univers à portée de main', author:'Christophe Galfard', year:'2015', note:'Vulgarisation narrative du cosmos, de l\'atome aux confins.' },
  { id:'b2', title:'Astrophysique pour les pressés', author:'Neil deGrasse Tyson', year:'2017', note:'L\'essentiel de la cosmologie moderne en chapitres courts.' },
  { id:'b3', title:'Trous noirs et distorsions du temps', author:'Kip Thorne', year:'1994', note:'Référence sur la relativité générale par un prix Nobel.' },
  { id:'b4', title:'La Plus Belle Histoire du monde', author:'Reeves, de Rosnay…', year:'1996', note:'Du Big Bang à l\'humain, raconté à plusieurs voix.' },
  { id:'b5', title:'Dernières nouvelles des trous noirs', author:'Aurélien Barrau', year:'2021', note:'État de l\'art accessible sur la gravité extrême.' },
]

export const PHOTO_SITES = [
  { id:'s1', name:'NASA — APOD', url:'apod.nasa.gov', note:'L\'image astronomique du jour, depuis 1995.' },
  { id:'s2', name:'ESA/Hubble', url:'esahubble.org', note:'Archives haute résolution de Hubble.' },
  { id:'s3', name:'Webb Space Telescope', url:'webbtelescope.org', note:'Galerie officielle des images du JWST.' },
  { id:'s4', name:'Astrobin', url:'astrobin.com', note:'Plateforme de référence des astrophotographes amateurs.' },
  { id:'s5', name:'ESO', url:'eso.org/public/images', note:'Observatoires européens au Chili (VLT, ALMA).' },
]
