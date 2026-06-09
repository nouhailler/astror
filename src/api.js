import { useState, useEffect, useRef } from 'react'
import * as satellite from 'satellite.js'

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
