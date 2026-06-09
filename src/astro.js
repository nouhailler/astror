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

const METEOR_SHOWERS = [
  { name: 'Quadrantides',   mm: 1,  dd: 3,  tag: '~120/h', detail: 'Pluie intense mais brève (pic de quelques heures). Radiant dans le Bouvier, météores rapides à 41 km/s.' },
  { name: 'Lyrids',         mm: 4,  dd: 22, tag: '~20/h',  detail: 'Issue de la comète Thatcher. Météores rapides avec traînées occasionnelles, radiant près de Véga.' },
  { name: 'Êta Aquariides', mm: 5,  dd: 6,  tag: '~50/h',  detail: 'Débris de la comète de Halley (66 km/s). Favorables dans l\'hémisphère sud ; radiant dans le Verseau.' },
  { name: 'Perséides',      mm: 8,  dd: 12, tag: '~100/h', detail: 'La plus populaire de l\'année, issue de Swift-Tuttle. Météores brillants avec traînées persistantes.' },
  { name: 'Orionides',      mm: 10, dd: 21, tag: '~25/h',  detail: 'Autres débris de Halley. Météores très rapides à 66 km/s, radiant dans Orion.' },
  { name: 'Léonides',       mm: 11, dd: 17, tag: '~15/h',  detail: 'Issue de Tempel-Tuttle. Peut devenir tempête de météores lors des retours de la comète.' },
  { name: 'Géminides',      mm: 12, dd: 14, tag: '~120/h', detail: 'La plus riche de l\'année, issue de l\'astéroïde (3200) Phaéthon. Météores lents et colorés.' },
  { name: 'Ursides',        mm: 12, dd: 22, tag: '~10/h',  detail: 'Issue de la comète Tuttle. Radiant circumpolaire dans la Petite Ourse.' },
]

function fmtUtc(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' TU'
}

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

export function getUpcomingAstroEvents(monthsAhead = 18) {
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + monthsAhead)
  const events = []

  // Éclipses lunaires (total + partial seulement)
  try {
    let e = Astronomy.SearchLunarEclipse(now)
    let guard = 0
    while (e && e.peak.date < end && guard++ < 20) {
      if (e.kind === 'total' || e.kind === 'partial') {
        const durMin = e.kind === 'total' ? Math.round(e.sd_total * 2) : Math.round(e.sd_partial * 2)
        events.push({
          id: `lunar_${toISO(e.peak.date)}`,
          cat: 'eclipse',
          title: e.kind === 'total' ? 'Éclipse totale de Lune' : 'Éclipse partielle de Lune',
          isoDate: toISO(e.peak.date),
          tag: e.kind === 'total' ? 'Totale' : 'Partielle',
          detail: e.kind === 'total'
            ? `Lune de sang. Totalité de ${durMin} min, maximum à ${fmtUtc(e.peak.date)}. Visible à l'œil nu depuis l'hémisphère favorable.`
            : `Ombrage partiel maximal à ${fmtUtc(e.peak.date)}.`,
        })
      }
      e = Astronomy.NextLunarEclipse(e.peak)
    }
  } catch {}

  // Éclipses solaires (total + annulaire seulement)
  try {
    let s = Astronomy.SearchGlobalSolarEclipse(now)
    let guard = 0
    while (s && s.peak.date < end && guard++ < 20) {
      if (s.kind === 'total' || s.kind === 'annular') {
        events.push({
          id: `solar_${toISO(s.peak.date)}`,
          cat: 'eclipse',
          title: s.kind === 'total' ? 'Éclipse totale de Soleil' : 'Éclipse annulaire de Soleil',
          isoDate: toISO(s.peak.date),
          tag: s.kind === 'total' ? 'Totale' : 'Annulaire',
          detail: s.kind === 'total'
            ? `Bande de totalité traversant la Terre. Maximum à ${fmtUtc(s.peak.date)}. Lunettes ISO 12312-2 obligatoires hors totalité.`
            : `Anneau de feu visible depuis la bande centrale. Maximum à ${fmtUtc(s.peak.date)}. Ne jamais regarder sans protection.`,
        })
      }
      s = Astronomy.NextGlobalSolarEclipse(s.peak)
    }
  } catch {}

  // Superlunes (pleine lune à moins de 362 000 km)
  try {
    let t = now
    let guard = 0
    while (t < end && guard++ < 30) {
      const fm = Astronomy.SearchMoonPhase(180, t, 35)
      if (!fm || fm.date >= end) break
      // Cherche périgée dans une fenêtre de ±15 jours
      let ap = Astronomy.SearchLunarApsis(new Date(fm.date.getTime() - 16 * 86400000))
      let found = false
      for (let i = 0; i < 3 && !found; i++) {
        if (ap.kind === 0) {
          const diffDays = Math.abs(fm.date.getTime() - ap.time.date.getTime()) / 86400000
          if (diffDays <= 1.5 && ap.dist_km < 360000) {
            events.push({
              id: `supermoon_${toISO(fm.date)}`,
              cat: 'special',
              title: 'Superlune',
              isoDate: toISO(fm.date),
              tag: 'Périgée',
              detail: `Pleine Lune au périgée (${Math.round(ap.dist_km).toLocaleString('fr-FR')} km). Paraît ~14 % plus grande et ~30 % plus lumineuse qu'à l'apogée.`,
            })
            found = true
          }
        }
        ap = Astronomy.NextLunarApsis(ap)
      }
      t = new Date(fm.date.getTime() + 26 * 86400000)
    }
  } catch {}

  // Oppositions planétaires (Mars, Jupiter, Saturne)
  const OUTER = [
    { body: Astronomy.Body.Mars,    name: 'Mars',    synodic: 780,
      detail: (mag) => `Mars au plus proche de la Terre (mag ${mag}). Diamètre apparent maximal — idéal pour observer les calottes polaires et les tempêtes de sable.` },
    { body: Astronomy.Body.Jupiter, name: 'Jupiter', synodic: 399,
      detail: (mag) => `Jupiter (mag ${mag}) au méridien à minuit. Bandes nuageuses, Grande Tache Rouge et lunes galiléennes visibles aux jumelles.` },
    { body: Astronomy.Body.Saturn,  name: 'Saturne', synodic: 378,
      detail: (mag) => `Saturne (mag ${mag}) et ses anneaux au mieux de visibilité. Vue spectaculaire dès 50× de grossissement.` },
  ]
  for (const p of OUTER) {
    try {
      let t = now
      let guard = 0
      while (t < end && guard++ < 5) {
        const opp = Astronomy.SearchRelativeLongitude(p.body, 180, t)
        if (!opp || opp.date >= end) break
        const illum = Astronomy.Illumination(p.body, opp.date)
        events.push({
          id: `opp_${p.name}_${toISO(opp.date)}`,
          cat: 'special',
          title: `Opposition de ${p.name}`,
          isoDate: toISO(opp.date),
          tag: `mag ${illum.mag.toFixed(1)}`,
          detail: p.detail(illum.mag.toFixed(1)),
        })
        t = new Date(opp.date.getTime() + (p.synodic - 30) * 86400000)
      }
    } catch {}
  }

  // Pluies de météores (dates fixes annuelles)
  const yr = now.getFullYear()
  for (const shower of METEOR_SHOWERS) {
    for (let y = yr; y <= yr + 2; y++) {
      const d = new Date(y, shower.mm - 1, shower.dd)
      if (d > now && d < end) {
        events.push({
          id: `meteor_${shower.name.toLowerCase().replace(/\s/g, '_')}_${y}`,
          cat: 'meteor',
          title: `${shower.name} — maximum`,
          isoDate: toISO(d),
          tag: shower.tag,
          detail: shower.detail,
        })
      }
    }
  }

  return events.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate))
}

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
