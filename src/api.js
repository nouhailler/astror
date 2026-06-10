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

export async function fetchISSPasses(lat = 48.8566, lng = 2.3522) {
  const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles')
  if (!res.ok) throw new Error('TLE fetch failed')
  const { line1, line2 } = await res.json()
  return computePasses(line1, line2, lat, lng)
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
