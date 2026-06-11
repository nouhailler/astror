import { useState, useEffect, useRef } from 'react'
import * as satellite from 'satellite.js'

export function getGBooksKey() { return localStorage.getItem('astror_gbooks_key_v1') || '' }
export function saveGBooksKey(k) { localStorage.setItem('astror_gbooks_key_v1', k.trim()) }

export async function searchBooks(query) {
  const key = getGBooksKey()
  if (key) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&lr=lang_fr&printType=books&maxResults=10&key=${key}`
      const res = await fetch(url)
      if (res.ok) {
        const d = await res.json()
        if (d.items?.length) {
          return d.items.map(item => {
            const vi = item.volumeInfo || {}
            const thumb = vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || ''
            return {
              id: item.id,
              title: vi.title || '',
              author: (vi.authors || []).join(', '),
              year: (vi.publishedDate || '').slice(0, 4),
              note: (vi.description || '').slice(0, 220),
              url: vi.canonicalVolumeLink || vi.infoLink || '',
              coverUrl: thumb ? thumb.replace('http://', 'https://') : '',
              source: 'google',
            }
          })
        }
      }
    } catch {}
  }
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&language=fre&limit=10&fields=title,author_name,first_publish_year,key,cover_i`
  )
  if (!res.ok) throw new Error('Open Library error')
  const d = await res.json()
  return (d.docs || []).map((item, idx) => ({
    id: item.key ? item.key.replace('/works/', '') : `ol-${idx}`,
    title: item.title || '',
    author: (item.author_name || []).slice(0, 2).join(', '),
    year: String(item.first_publish_year || ''),
    note: '',
    url: item.key ? `https://openlibrary.org${item.key}` : '',
    coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
    source: 'openlibrary',
  }))
}

export async function fetchConfImage(name, place) {
  // Build query candidates from the conference name
  const noYear = name.replace(/\s*\d{4}\s*/g, ' ').trim()
  const parts = noYear.split(/\s*[—–]\s*/)
  const candidates = [...new Set([
    parts[0].trim(),                              // "European Astronomical Society"
    parts.length > 1 ? parts[1].trim() : null,   // "EAS" or "General Assembly"
    noYear.split(/\s+/).slice(0, 3).join(' '),    // first 3 words
  ].filter(Boolean).filter(s => s.length > 3))]

  for (const q of candidates) {
    for (const lang of ['en', 'fr']) {
      try {
        const res = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`
        )
        const d = await res.json()
        if (d.thumbnail?.source && d.type === 'standard') return d.thumbnail.source
      } catch {}
    }
  }

  // Fallback: host city (most reliable — cities almost always have a Wikipedia photo)
  if (place) {
    const city = place.split(/[,、]/)[0].trim()
    for (const lang of ['fr', 'en']) {
      try {
        const res = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
        )
        const d = await res.json()
        if (d.thumbnail?.source && d.type === 'standard') return d.thumbnail.source
      } catch {}
    }
  }
  return null
}

async function fetchWikiCategoryImages(category, limit = 4) {
  const params = new URLSearchParams({
    action: 'query', generator: 'categorymembers',
    gcmtitle: category, gcmtype: 'file', gcmlimit: String(limit),
    gcmsort: 'timestamp', gcmdir: 'descending',
    prop: 'imageinfo', iiprop: 'url|mime', iiurlwidth: '500',
    format: 'json', origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return Object.values(data.query?.pages || {})
    .map(p => {
      const ii = p.imageinfo?.[0]
      if (!ii?.thumburl) return null
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(ii.mime)) return null
      return ii.thumburl
    })
    .filter(Boolean)
    .slice(0, limit)
}

export async function fetchSitePhotos(siteId) {
  switch (siteId) {
    case 's1': {
      const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&count=6')
      if (!res.ok) return []
      const items = await res.json()
      return items.filter(i => i.media_type === 'image').map(i => i.url).slice(0, 4)
    }
    case 's2':
      return fetchWikiCategoryImages('Category:Images_by_the_Hubble_Space_Telescope', 4)
    case 's3':
      return fetchWikiCategoryImages('Category:Images_by_the_James_Webb_Space_Telescope', 4)
    case 's4':
      return fetchWikiCategoryImages('Category:Astrophotography', 4)
    case 's5':
      return fetchWikiCategoryImages('Category:Images_from_the_European_Southern_Observatory', 4)
    default:
      return []
  }
}

export async function fetchBookCover(title, author) {
  const q = [title, author].filter(Boolean).join(' ')
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=cover_i&limit=5`
    )
    if (!res.ok) return null
    const d = await res.json()
    const coverId = d.docs?.find(b => b.cover_i)?.cover_i
    return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null
  } catch { return null }
}

const AZ_DIRS = ['N', 'N-E', 'E', 'S-E', 'S', 'S-O', 'O', 'N-O']
function azDir(az) { return AZ_DIRS[Math.round(az / 45) % 8] }

function computePasses(tle1, tle2, lat, lng, minElDeg = 10) {
  const satrec = satellite.twoline2satrec(tle1, tle2)
  const obsGd = {
    longitude: satellite.degreesToRadians(lng),
    latitude:  satellite.degreesToRadians(lat),
    height: 0.05,
  }
  const now = new Date()
  const end = new Date(now.getTime() + 24 * 3600000)
  const stepMs = 15000
  const passes = []

  let inPass = false, passStart = null, riseAz = 0, lastAz = 0, maxEl = 0

  for (let t = new Date(now); t <= end; t = new Date(t.getTime() + stepMs)) {
    const pv = satellite.propagate(satrec, t)
    if (!pv.position) continue
    const gmst = satellite.gstime(t)
    const ecf  = satellite.eciToEcf(pv.position, gmst)
    const look = satellite.ecfToLookAngles(obsGd, ecf)
    const el   = satellite.radiansToDegrees(look.elevation)
    const az   = satellite.radiansToDegrees(look.azimuth)

    if (el >= minElDeg) {
      if (!inPass) { inPass = true; passStart = new Date(t); riseAz = az; maxEl = el }
      if (el > maxEl) maxEl = el
      lastAz = az
    } else if (inPass) {
      inPass = false
      const dur = Math.round((t.getTime() - passStart.getTime()) / 60000)
      passes.push({
        time:    passStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isoTime: passStart.toISOString(),
        dir:     `${azDir(riseAz)} → ${azDir(lastAz)}`,
        alt:     `${Math.round(maxEl)}°`,
        dur:     `${dur} min`,
        bright:  maxEl > 40,
      })
    }
  }
  return passes
}

async function fetchTleCelestrak(catnr) {
  const res = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${catnr}&FORMAT=TLE`)
  if (!res.ok) throw new Error('TLE fetch failed')
  const lines = (await res.text()).trim().split('\n').map(l => l.trim())
  const i1 = lines.findIndex(l => l.startsWith('1 '))
  if (i1 < 0 || !lines[i1 + 1]?.startsWith('2 ')) throw new Error('TLE parse failed')
  return [lines[i1], lines[i1 + 1]]
}

export async function fetchISSPasses(lat = 48.8566, lng = 2.3522) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles', { signal: ctrl.signal })
    if (res.ok) {
      const { line1, line2 } = await res.json()
      return computePasses(line1, line2, lat, lng)
    }
  } catch {} // wheretheiss indisponible ou trop lent → secours Celestrak
  finally { clearTimeout(timer) }
  const [l1, l2] = await fetchTleCelestrak(25544)
  return computePasses(l1, l2, lat, lng)
}

// Tiangong (NORAD 48274)
export async function fetchTiangongPasses(lat = 48.8566, lng = 2.3522) {
  const [l1, l2] = await fetchTleCelestrak(48274)
  return computePasses(l1, l2, lat, lng)
}

export function useLiveData(fetcher, intervalMs = 0) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    let timer = null

    async function load() {
      try {
        const result = await fetcher()
        if (alive.current) { setData(result); setError(null) }
      } catch (err) {
        if (alive.current) setError(err)
      } finally {
        if (alive.current) setLoading(false)
      }
    }

    load()
    if (intervalMs > 0) timer = setInterval(load, intervalMs)
    return () => { alive.current = false; if (timer) clearInterval(timer) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error }
}

export async function fetchISSPosition() {
  const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
  if (!res.ok) throw new Error('ISS API error')
  const d = await res.json()
  return {
    lat: d.latitude,
    lng: d.longitude,
    altitude: Math.round(d.altitude),
    velocity: Math.round(d.velocity).toLocaleString('fr-FR'),
    visibility: d.visibility,
  }
}

export async function fetchWeather(lat = 48.8566, lng = 2.3522) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,cloud_cover,relative_humidity_2m&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather API error')
  const d = await res.json()
  const cur = d.current
  const clouds = cur.cloud_cover
  const humidity = cur.relative_humidity_2m
  const temp = Math.round(cur.temperature_2m)

  const seeingVal = clouds < 10 ? 5 : clouds < 25 ? 4 : clouds < 50 ? 3 : clouds < 75 ? 2 : 1
  const transVal  = clouds < 10 ? 5 : clouds < 25 ? 4 : clouds < 50 ? 3 : clouds < 75 ? 2 : 1

  const seeingLabels = ['Mauvais', 'Médiocre', 'Moyen', 'Bon', 'Excellent']
  const transLabels  = ['Mauvaise', 'Médiocre', 'Moyenne', 'Bonne', 'Excellente']

  return {
    seeing: seeingLabels[seeingVal - 1],
    seeingVal,
    transparency: transLabels[transVal - 1],
    transVal,
    bortle: 4,
    clouds,
    humidity,
    temp,
    moonInterf: false,
  }
}

export async function fetchSpaceNews() {
  const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=10&ordering=-published_at')
  if (!res.ok) throw new Error('News API error')
  const d = await res.json()
  return (d.results || []).map(a => ({
    id: String(a.id),
    title: a.title,
    url: a.url,
    org: a.news_site,
    cat: 'Actualité',
    detail: a.summary,
    when: new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    tag: 'publié',
  }))
}

export async function fetchJWSTImages() {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: 'Category:Images_by_the_James_Webb_Space_Telescope',
    gcmtype: 'file',
    gcmlimit: '30',
    gcmsort: 'timestamp',
    gcmdir: 'descending',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!res.ok) throw new Error('Wikimedia error')
  const data = await res.json()
  const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return Object.values(data.query?.pages || {})
    .map(p => {
      const ii = p.imageinfo?.[0]
      if (!ii?.thumburl) return null
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(ii.mime)) return null
      const meta = ii.extmetadata || {}
      const rawName = strip(meta.ObjectName?.value || p.title.replace('File:', '').replace(/\.[^.]+$/, ''))
      const desc = strip(meta.ImageDescription?.value || '')
      const date = (meta.DateTimeOriginal?.value || meta.DateTime?.value || '').slice(0, 10)
      return {
        id: String(p.pageid),
        name: rawName,
        desc: desc || rawName,
        thumbUrl: ii.thumburl,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        date,
      }
    })
    .filter(Boolean)
    .slice(0, 12)
}

export async function fetchEduNews() {
  const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=8&ordering=-published_at')
  if (!res.ok) throw new Error('EduNews error')
  const d = await res.json()
  return (d.results || []).map(a => {
    const s = (a.title + ' ' + (a.summary || '')).toLowerCase()
    let cat = 'Actualité spatiale'
    if (s.includes('webb') || s.includes('jwst') || s.includes('hubble') || s.includes('telescope')) cat = 'Télescopes'
    else if (s.includes('artemis') || s.includes('moon') || s.includes('lune')) cat = 'Lune'
    else if (s.includes('mars') || s.includes('perseverance') || s.includes('curiosity')) cat = 'Mars'
    else if (s.includes('iss') || s.includes('space station') || s.includes('astronaut')) cat = 'ISS'
    else if (s.includes('spacex') || s.includes('falcon') || s.includes('starship') || s.includes('rocket') || s.includes('launch')) cat = 'Lanceurs'
    else if (s.includes('galaxy') || s.includes('galaxie') || s.includes('nebula') || s.includes('nébuleuse') || s.includes('star ') || s.includes('étoile')) cat = 'Astronomie'
    else if (s.includes('exoplanet') || s.includes('exoplanète')) cat = 'Exoplanètes'
    return {
      cat,
      title: a.title,
      read: '3 min',
      body: a.summary || '',
      date: new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      imageUrl: a.image_url || null,
      url: a.url || null,
    }
  })
}

const AU_KM = 149_597_870.7
const PROBE_REF_MS = 1749513600000 // 2026-06-10T00:00:00Z — distances de référence

export function computeProbeDistances() {
  const dt = (Date.now() - PROBE_REF_MS) / 1000
  const fmt = km => (km / 1e9).toFixed(2).replace('.', ',') + ' Mds km'
  const au  = km => (km / AU_KM).toFixed(1).replace('.', ',') + ' UA'
  const v1  = 24_800_000_000 + 17.04 * dt
  const v2  = 20_600_000_000 + 15.41 * dt
  const nh  =  8_900_000_000 + 14.00 * dt
  return [
    { name: 'Voyager 1',          dist: fmt(v1), detail: au(v1) + ' · interstellaire',     speed: '17,0 km/s' },
    { name: 'Voyager 2',          dist: fmt(v2), detail: au(v2) + ' · interstellaire',     speed: '15,4 km/s' },
    { name: 'New Horizons',       dist: fmt(nh), detail: au(nh) + ' · ceinture de Kuiper', speed: '14,0 km/s' },
    { name: 'Parker Solar Probe', dist: '0,046 UA min', detail: 'Orbite solaire · périhélie 6,9 M km', speed: '692 km/s max' },
  ]
}

const MISSION_DEFS = [
  { name: 'James Webb (JWST)', org: 'NASA / ESA / CSA', status: 'En service',          color: 'var(--good)', search: 'James+Webb+Space+Telescope' },
  { name: 'Perseverance',      org: 'NASA · Mars 2020', status: 'Active',              color: 'var(--good)', search: 'Perseverance+Mars' },
  { name: 'JUICE',             org: 'ESA',              status: 'En transit',           color: 'var(--warn)', search: 'JUICE+ESA' },
  { name: 'Artemis',           org: 'NASA',             status: 'Prép. Artemis III',    color: 'var(--blue)', search: 'Artemis+NASA+Moon' },
]

export async function fetchMissionsNews() {
  return Promise.all(MISSION_DEFS.map(async m => {
    try {
      const res = await fetch(
        `https://api.spaceflightnewsapi.net/v4/articles/?limit=1&ordering=-published_at&search=${m.search}`
      )
      if (!res.ok) throw new Error()
      const d = await res.json()
      const a = d.results?.[0]
      if (!a) return { ...m }
      return {
        ...m,
        note: a.summary || '',
        newsDate: new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
        newsUrl: a.url,
      }
    } catch {
      return { ...m }
    }
  }))
}

export async function fetchAPODArticle() {
  const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')
  if (!res.ok) throw new Error('APOD error')
  const d = await res.json()
  return {
    cat: 'NASA · APOD',
    title: d.title,
    read: '3 min',
    body: d.explanation || '',
    date: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    imageUrl: d.media_type === 'image' ? d.url : null,
    isToday: true,
  }
}

export async function fetchLaunches() {
  const res = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&mode=list')
  if (!res.ok) throw new Error('Launches API error')
  const d = await res.json()
  return (d.results || []).map(l => ({
    org: l.launch_service_provider?.name || '—',
    title: l.name,
    date: new Date(l.net).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    tag: l.status?.abbrev === 'Success' ? 'réussi' : l.status?.abbrev === 'Go' ? 'confirmé' : 'à venir',
  }))
}

// ─── Communauté ──────────────────────────────────────────────────────────────

function relTime(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60)     return 'à l\'instant'
  if (s < 3600)   return `il y a ${Math.round(s / 60)} min`
  if (s < 86400)  return `il y a ${Math.round(s / 3600)} h`
  if (s < 604800) return `il y a ${Math.round(s / 86400)} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function stripHtml(html) {
  return (html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function initials(name) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export async function fetchCommunityFeed() {
  const r = await fetch('https://mastodon.social/api/v1/timelines/tag/astrophotography?limit=8&only_media=true')
  if (!r.ok) throw new Error('mastodon error')
  const posts = await r.json()
  if (!Array.isArray(posts) || !posts.length) throw new Error('no posts')

  return posts.map(p => {
    const name = p.account.display_name || p.account.acct.split('@')[0]
    const text = stripHtml(p.content)
    const tags = (p.tags || []).map(t => t.name.toLowerCase())
    const imgs = (p.media_attachments || []).filter(a => a.type === 'image')

    let label = 'astrophotographie'
    if (tags.some(t => ['moon','lune'].includes(t)))              label = 'Lune'
    else if (tags.some(t => ['galaxy','galaxie'].includes(t)))    label = 'galaxie'
    else if (tags.some(t => ['nebula','nébuleuse'].includes(t)))  label = 'nébuleuse'
    else if (tags.some(t => ['milkyway','voielactee'].includes(t))) label = 'Voie Lactée'
    else if (tags.includes('jupiter'))  label = 'Jupiter'
    else if (tags.some(t => ['saturn','saturne'].includes(t)))    label = 'Saturne'
    else if (tags.includes('mars'))     label = 'Mars'
    else if (tags.includes('sun') || tags.includes('soleil')) label = 'Soleil'
    else if (text) label = text.split(' ').slice(0, 3).join(' ')

    return {
      user:     name,
      init:     initials(name),
      when:     relTime(p.created_at),
      obj:      text.slice(0, 140),
      imgUrl:   imgs[0]?.preview_url || null,
      likes:    p.favourites_count,
      comments: p.replies_count,
      reblogs:  p.reblogs_count,
      label:    'photo · ' + label,
      link:     p.url,
      top:      p.favourites_count >= 5 || p.reblogs_count >= 3,
    }
  })
}

// ─── Communauté · Sorties & Classement ───────────────────────────────────────

const COM_SHEET_KEY = 'astror_community_sheet_v1'
export const getCommunitySheetUrl  = () => localStorage.getItem(COM_SHEET_KEY) || ''
export const saveCommunitySheetUrl = (u) => localStorage.setItem(COM_SHEET_KEY, u.trim())

function classifyEventTag(title, cats = []) {
  const t = (title + ' ' + cats.join(' ')).toLowerCase()
  if (/nuit.{0,12}étoile|soirée.{0,10}obs|séance\s+d.obs/i.test(t)) return 'Soirée'
  if (/star.?party|sortie\s+d.obs/i.test(t)) return 'Sortie'
  if (/club|réunion|assemblée/i.test(t)) return 'Club'
  if (/atelier|initiation|formation/i.test(t)) return 'Atelier'
  if (/conférence|congrès|symposium/i.test(t)) return 'Conférence'
  return 'Actualité'
}

const RSS_FEEDS = [
  { url: 'https://www.saf-astronomie.fr/feed/',             source: 'SAF' },
  { url: 'https://www.lemonde.fr/espace/rss_full.xml',      source: 'Le Monde Espace' },
]

export async function fetchAstroClubEvents() {
  const settled = await Promise.allSettled(RSS_FEEDS.map(async ({ url, source }) => {
    const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
    if (!r.ok) throw new Error()
    const d = await r.json()
    if (d.status !== 'ok' || !d.items?.length) throw new Error()
    return d.items.map(item => {
      const desc = (item.description || item.content || '')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)
      const pubDate = item.pubDate ? new Date(item.pubDate) : null
      return {
        title: item.title || '',
        link:  item.link  || '',
        date:  pubDate ? pubDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
        _iso:  pubDate ? pubDate.toISOString() : '',
        place: source,
        desc,
        tag: classifyEventTag(item.title, item.categories),
      }
    })
  }))
  const items = settled.flatMap(r => r.status === 'fulfilled' ? r.value : [])
  if (!items.length) throw new Error('no-events')
  return items.sort((a, b) => b._iso.localeCompare(a._iso)).slice(0, 10)
}

function parseCsvLine(line) {
  const cols = []; let cur = '', inQ = false
  for (const c of line) {
    if (c === '"') inQ = !inQ
    else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
    else cur += c
  }
  cols.push(cur.trim())
  return cols
}

// ─── NASA Images API ──────────────────────────────────────────────────────────

export async function fetchNASAImages(query, limit = 6) {
  const r = await fetch(
    `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=${limit + 4}`
  )
  if (!r.ok) throw new Error('nasa-api')
  const d = await r.json()
  return (d.collection?.items || [])
    .filter(it => it.links?.[0]?.href)
    .slice(0, limit)
    .map(it => ({
      thumbUrl: it.links[0].href,
      caption:  (it.data?.[0]?.title || '').replace(/^NASA\//, '').trim(),
    }))
}

export async function fetchCommunityRanking(sheetUrl) {
  if (!sheetUrl) throw new Error('no-sheet')
  const m = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (!m) throw new Error('invalid-url')
  const csvUrl = `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv`
  let csv
  try {
    const r = await fetch(csvUrl)
    if (!r.ok) throw new Error()
    csv = await r.text()
  } catch {
    const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`)
    if (!r.ok) throw new Error('sheet-error')
    csv = await r.text()
  }
  if (csv.charCodeAt(0) === 0xFEFF) csv = csv.slice(1)
  const lines = csv.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error('empty-sheet')
  return lines.slice(1).map((line, i) => {
    const [rankStr = '', user = '', title = '', votesStr = '0', desc = ''] = parseCsvLine(line)
    return { rank: parseInt(rankStr) || i + 1, user, title, votes: parseInt(votesStr) || 0, desc }
  }).filter(r => r.title).slice(0, 10)
}
