import { useState, useEffect, useRef } from 'react'

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
