// Générateur statique de la documentation Astror.
// Lit ./content.mjs (source de vérité du contenu) et écrit les pages HTML dans /docs.
// Aucune dépendance externe — Node natif (fs/path).
import { NAV, PAGES, APP_VERSION, DOC_VERSION, DOC_UPDATED } from './content.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(__dirname, '..');

// ---- 1. Aplatir la navigation (ordre = ordre de lecture / précédent-suivant) ----
const flat = []; // { id, title, path, chapterId, chapterTitle, chapterIcon, groupLabel }
for (const ch of NAV) {
  for (const p of ch.pages || []) {
    flat.push({ ...p, chapterId: ch.id, chapterTitle: ch.title, chapterIcon: ch.icon });
  }
  for (const g of ch.groups || []) {
    for (const p of g.pages) {
      flat.push({ ...p, chapterId: ch.id, chapterTitle: ch.title, chapterIcon: ch.icon, groupLabel: g.label });
    }
  }
}

const byPath = new Map(flat.map((p) => [p.path, p]));

// ---- 2. Vérifications de cohérence (§47 liens cassés) ----
const missingContent = [];
for (const p of flat) {
  if (!PAGES[p.id]) missingContent.push(p.id);
}
if (missingContent.length) {
  console.error('Pages référencées dans NAV mais sans contenu dans PAGES:', missingContent);
  process.exit(1);
}

// ---- 3. Rendu du sommaire (accordéon <details>, zéro JS requis pour la navigation elle-même) ----
function renderSide(currentPath) {
  let out = '<div class="side-title">Sommaire</div><nav aria-label="Sommaire de la documentation">';
  for (const ch of NAV) {
    const allPages = [...(ch.pages || []), ...(ch.groups || []).flatMap((g) => g.pages)];
    const count = allPages.length;
    const containsCurrent = allPages.some((p) => p.path === currentPath);
    out += `<details${containsCurrent ? ' open' : ''}><summary><span class="chapter-icon">${ch.icon}</span><span>${ch.title}</span><span class="count">${count}</span><span class="chev">›</span></summary>`;
    for (const p of ch.pages || []) {
      out += `<a href="${relLink(currentPath, p.path)}"${p.path === currentPath ? ' aria-current="page"' : ''}>${p.title}</a>`;
    }
    for (const g of ch.groups || []) {
      out += `<div class="sub-label">${g.label}</div><div class="sub">`;
      for (const p of g.pages) {
        out += `<a href="${relLink(currentPath, p.path)}"${p.path === currentPath ? ' aria-current="page"' : ''}>${p.title}</a>`;
      }
      out += `</div>`;
    }
    out += `</details>`;
  }
  out += '</nav>';
  return out;
}

// ---- 4. Gabarit de page ----
function pageShell({ title, description, currentPath, breadcrumb, bodyHtml, prevNext, favicon = '🔭' }) {
  const crumbsHtml = breadcrumb
    .map((c, i) => (c.href ? `<a href="${c.href}">${c.label}</a>` : `<span>${c.label}</span>`))
    .join('<span class="sep">/</span>');

  const pnHtml = prevNext
    ? `<div class="prevnext">
        ${prevNext.prev ? `<a href="${relLink(currentPath, prevNext.prev.path)}"><span class="dir">← Précédent</span>${prevNext.prev.title}</a>` : '<span></span>'}
        ${prevNext.next ? `<a class="next" href="${relLink(currentPath, prevNext.next.path)}"><span class="dir">Suivant →</span>${prevNext.next.title}</a>` : '<span></span>'}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title} — Documentation Astror</title>
<meta name="description" content="${description}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${favicon}</text></svg>">
<link rel="stylesheet" href="${relRoot(currentPath)}assets/css/doc.css">
</head>
<body>
<header class="topbar">
  <button id="navToggle" class="tb-link" aria-label="Ouvrir le sommaire" aria-expanded="false">☰</button>
  <a class="brand" href="${relRoot(currentPath)}"><span class="dot"></span> Astror <span class="small" style="font-family:var(--mono);font-weight:400;">docs</span></a>
  <div class="sp"></div>
  <a class="tb-link" href="${relRoot(currentPath)}search/">🔍 Rechercher</a>
</header>
<div class="shell">
  <aside class="side">${renderSide(currentPath)}</aside>
  <main class="main">
    <div class="crumbs">${crumbsHtml}</div>
    ${bodyHtml}
    ${pnHtml}
    <footer class="doc-footer">Astror v${APP_VERSION} · Documentation v${DOC_VERSION} · mise à jour ${DOC_UPDATED}<br><a href="${relRoot(currentPath)}legal/">Informations légales</a> · <a href="${relRoot(currentPath)}support/">Support</a></footer>
  </main>
</div>
<script src="${relRoot(currentPath)}assets/js/doc.js" defer></script>
</body>
</html>`;
}

function relRoot(currentPath) {
  // currentPath ex: /guide/outils/observer/  -> profondeur = nombre de segments non vides
  const depth = currentPath.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

// Lien relatif entre deux chemins racine-absolus (ex: /guide/x/ -> /features/y/),
// pour que le site reste fonctionnel quel que soit le sous-répertoire de publication.
function relLink(fromPath, toPath) {
  return relRoot(fromPath) + toPath.replace(/^\//, '');
}

function writeHtml(relPath, html) {
  const filePath = path.join(DOCS_ROOT, relPath, 'index.html');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
}

// ---- 5. Génère chaque page listée dans NAV ----
let count = 0;
flat.forEach((navPage, i) => {
  const content = PAGES[navPage.id];
  const breadcrumb = [{ label: 'Accueil', href: relRoot(navPage.path) }, { label: navPage.chapterTitle }];
  if (navPage.groupLabel) breadcrumb.push({ label: navPage.groupLabel });
  breadcrumb.push({ label: navPage.title });

  const prev = flat[i - 1] ? { title: flat[i - 1].title, path: flat[i - 1].path } : null;
  const next = flat[i + 1] ? { title: flat[i + 1].title, path: flat[i + 1].path } : null;

  const html = pageShell({
    title: navPage.title,
    description: content.description,
    currentPath: navPage.path,
    breadcrumb,
    bodyHtml: content.html,
    prevNext: { prev, next },
  });
  writeHtml(navPage.path, html);
  count++;
});

// ---- 6. Page d'accueil (§6) ----
const homeHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Documentation Astror</title>
<meta name="description" content="Documentation complète de l'application Astror : guide, fonctionnalités, paramètres, permissions, données, dépannage, FAQ.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔭</text></svg>">
<link rel="stylesheet" href="assets/css/doc.css">
</head>
<body>
<header class="topbar">
  <a class="brand" href="."><span class="dot"></span> Astror <span class="small" style="font-family:var(--mono);font-weight:400;">docs</span></a>
  <div class="sp"></div>
  <a class="tb-link" href="search/">🔍 Rechercher</a>
</header>
<div class="home-hero">
  <div class="eyebrow">Documentation</div>
  <h1>Astror</h1>
  <p>Compagnon d'observation astronomique — PWA en français pour astronomes amateurs : carte du ciel, éphémérides, outils d'observation et d'astrophoto, veille spatiale et assistant IA.</p>
  <div class="home-meta">
    <span class="badge">Version app ${APP_VERSION}</span>
    <span class="badge">Doc v${DOC_VERSION}</span>
    <span class="badge">Mise à jour ${DOC_UPDATED}</span>
  </div>
</div>
<div class="quicklinks">
  <a href="getting-started/"><span class="ic">🚀</span> Commencer</a>
  <a href="guide/"><span class="ic">📖</span> Guide utilisateur</a>
  <a href="features/"><span class="ic">🧩</span> Fonctionnalités</a>
  <a href="settings/"><span class="ic">⚙️</span> Paramètres</a>
  <a href="data/"><span class="ic">🔐</span> Données et confidentialité</a>
  <a href="troubleshooting/"><span class="ic">🛠️</span> Dépannage</a>
  <a href="faq/"><span class="ic">❓</span> FAQ</a>
  <a href="reference/"><span class="ic">📘</span> Référence</a>
  <a href="versions/"><span class="ic">🔄</span> Versions</a>
  <a href="legal/"><span class="ic">⚖️</span> Informations légales</a>
  <a href="support/"><span class="ic">📩</span> Support</a>
</div>
<main class="main" style="max-width:900px;margin:0 auto;">
  ${renderSide('')}
</main>
<footer class="doc-footer">Astror v${APP_VERSION} · Documentation v${DOC_VERSION} · mise à jour ${DOC_UPDATED} · <a href="https://github.com/nouhailler/astror">Dépôt GitHub</a></footer>
<script src="assets/js/doc.js" defer></script>
</body>
</html>`;
fs.writeFileSync(path.join(DOCS_ROOT, 'index.html'), homeHtml, 'utf8');

// ---- 7. Page de recherche (§32) + index JSON→JS ----
const searchIndex = flat.map((p) => ({
  title: p.title,
  cat: p.groupLabel ? `${p.chapterTitle} / ${p.groupLabel}` : p.chapterTitle,
  excerpt: (PAGES[p.id].description || '').slice(0, 140),
  url: p.path,
}));
fs.mkdirSync(path.join(DOCS_ROOT, 'assets', 'js'), { recursive: true });
fs.writeFileSync(
  path.join(DOCS_ROOT, 'assets', 'js', 'search-data.js'),
  `window.ASTROR_SEARCH_INDEX = ${JSON.stringify(searchIndex, null, 0)};\n`,
  'utf8'
);

const searchHtml = pageShell({
  title: 'Recherche',
  description: 'Recherche dans la documentation Astror.',
  currentPath: '/search/',
  breadcrumb: [{ label: 'Accueil', href: '../' }, { label: 'Recherche' }],
  bodyHtml: `<div class="eyebrow">Recherche</div>
<h1>Rechercher dans la documentation</h1>
<p class="lede">Recherche dans les titres, catégories et résumés de toutes les pages.</p>
<div class="search-box"><input id="searchInput" type="search" placeholder="Ex. boussole, géolocalisation, ISS, quiz…" autocomplete="off"></div>
<div id="searchEmpty" class="small" style="display:none"></div>
<div id="searchResults"></div>`,
  prevNext: null,
}).replace('</body>', `<script src="../assets/js/search-data.js"></script></body>`);
writeHtml('/search/', searchHtml);

console.log(`Documentation générée : ${count} pages + accueil + recherche.`);
