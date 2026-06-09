import * as Astronomy from 'astronomy-engine'

function phaseName(deg) {
  if (deg < 22.5 || deg >= 337.5) return 'Nouvelle Lune'
  if (deg < 67.5)  return 'Croissant croissant'
  if (deg < 112.5) return 'Premier quartier'
  if (deg < 157.5) return 'Gibbeuse croissante'
  if (deg < 202.5) return 'Pleine Lune'
  if (deg < 247.5) return 'Gibbeuse décroissante'
  if (deg < 292.5) return 'Dernier quartier'
  return 'Croissant décroissant'
}

function fmtTime(astroTime) {
  if (!astroTime) return '--:--'
  return astroTime.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDur(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m} min`
}

export function getMoonData(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  const phase = Astronomy.MoonPhase(date)
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, date)
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, +1, date, 1)
  const set  = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, date, 1)
  const illuminationPct = Math.round((1 - Math.cos(phase * Math.PI / 180)) / 2 * 100)
  const age = ((phase / 360) * 29.5305).toFixed(1)
  const distKm = Math.round(illum.geo_dist * 149597870.7)

  return {
    phase: phaseName(phase),
    illumination: illuminationPct,
    age: parseFloat(age),
    moonrise: fmtTime(rise),
    moonset:  fmtTime(set),
    distance: distKm.toLocaleString('fr-FR') + ' km',
  }
}

export function getSunData(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, date, 1)
  const set  = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, date, 1)

  let dawnAstro = null, duskAstro = null
  try { dawnAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, +1, date, 1, -18) } catch {}
  try { duskAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1, -18) } catch {}

  let nightLen = '--h--'
  if (dawnAstro && duskAstro) {
    nightLen = fmtDur(dawnAstro.date.getTime() + 86400000 - duskAstro.date.getTime())
  }

  return {
    sunrise: fmtTime(rise),
    sunset:  fmtTime(set),
    dawnAstro: fmtTime(dawnAstro),
    duskAstro: fmtTime(duskAstro),
    nightLen,
  }
}

const PLANETS = [
  { body: Astronomy.Body.Mercury, name: 'Mercure', id: 'mercury' },
  { body: Astronomy.Body.Venus,   name: 'Vénus',   id: 'venus'   },
  { body: Astronomy.Body.Mars,    name: 'Mars',     id: 'mars'    },
  { body: Astronomy.Body.Jupiter, name: 'Jupiter',  id: 'jupiter' },
  { body: Astronomy.Body.Saturn,  name: 'Saturne',  id: 'saturn'  },
  { body: Astronomy.Body.Uranus,  name: 'Uranus',   id: 'uranus'  },
  { body: Astronomy.Body.Neptune, name: 'Neptune',  id: 'neptune' },
]

export function getPlanetPositions(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  return PLANETS.map(({ body, name, id }) => {
    try {
      const eq  = Astronomy.Equator(body, date, obs, true, true)
      const hor = Astronomy.Horizon(date, obs, eq.ra, eq.dec, 'normal')
      const illum = Astronomy.Illumination(body, date)
      const rise = Astronomy.SearchRiseSet(body, obs, +1, date, 1)
      const set  = Astronomy.SearchRiseSet(body, obs, -1, date, 1)
      return {
        id, name,
        alt: hor.altitude.toFixed(1),
        az:  hor.azimuth.toFixed(0),
        mag: illum.mag.toFixed(1),
        rise: fmtTime(rise),
        set:  fmtTime(set),
        visible: hor.altitude > 5,
      }
    } catch {
      return { id, name, alt: null, az: null, mag: null, rise: '--:--', set: '--:--', visible: false }
    }
  })
}
