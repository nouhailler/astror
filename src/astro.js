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
    let ms = dawnAstro.date.getTime() - duskAstro.date.getTime()
    if (ms < 0) ms += 86400000
    nightLen = fmtDur(ms)
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

function azToDir(az) {
  return ['N', 'N-E', 'E', 'S-E', 'S', 'S-O', 'O', 'N-O'][Math.round(az / 45) % 8]
}

export function getAstrophotoData(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)

  const sunset    = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, date, 1)
  let blueStart = null, blueEnd = null, duskAstro = null, dawnAstro = null
  try { blueStart = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1,  -4) } catch {}
  try { blueEnd   = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1,  -8) } catch {}
  try { duskAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1, -18) } catch {}
  try { dawnAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, +1, date, 1, -18) } catch {}

  const moonSet = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, date, 1)
  const phase   = Astronomy.MoonPhase(date)
  const illum   = Math.round((1 - Math.cos(phase * Math.PI / 180)) / 2 * 100)

  // Durée nuit
  let nightLen = null
  if (duskAstro && dawnAstro) {
    let ms = dawnAstro.date.getTime() - duskAstro.date.getTime()
    if (ms < 0) ms += 86400000
    nightLen = fmtDur(ms)
  }

  // Centre galactique au milieu de la nuit
  let gcAlt = null, gcAz = null
  try {
    const midDate = duskAstro && dawnAstro
      ? new Date((duskAstro.date.getTime() + (dawnAstro.date >= duskAstro.date ? dawnAstro.date.getTime() : dawnAstro.date.getTime() + 86400000)) / 2)
      : (() => { const d = new Date(date); d.setHours(23, 0, 0, 0); return d })()
    const hor = Astronomy.Horizon(midDate, obs, 17 + 45 / 60 + 40 / 3600, -(29 + 0.5 / 60), 'normal')
    gcAlt = Math.round(hor.altitude)
    gcAz  = Math.round(hor.azimuth)
  } catch {}

  // Lune — impact astrophoto
  const moonDownBeforeNight = !!(moonSet && duskAstro && moonSet.date < duskAstro.date)
  let moonLabel, moonSub
  if (illum < 5 || moonDownBeforeNight) {
    moonLabel = moonDownBeforeNight ? 'Couchée' : 'Nouvelle'
    moonSub   = 'Aucune pollution lumineuse'
  } else if (illum < 30) {
    moonLabel = 'Favorable'; moonSub = `${illum} % illuminée`
  } else if (illum < 60) {
    moonLabel = 'Modérée'; moonSub = `${illum} % · gêne partielle`
  } else {
    moonLabel = 'Gênante'; moonSub = `${illum} % · éviter le ciel profond`
  }

  // Qualité saison Voie Lactée
  let seasonLabel, seasonSub
  if (gcAlt === null || gcAlt <= 0) {
    seasonLabel = 'Hors saison'; seasonSub = 'Centre galactique non visible'
  } else if (gcAlt > 25) {
    seasonLabel = 'Excellente'; seasonSub = `Centre galactique à ${gcAlt}°`
  } else if (gcAlt > 10) {
    seasonLabel = 'Favorable'; seasonSub = `Centre galactique à ${gcAlt}°`
  } else {
    seasonLabel = 'Médiocre'; seasonSub = `Centre galactique bas (${gcAlt}°)`
  }

  // Description fenêtre
  let nightDesc
  if (!duskAstro) {
    nightDesc = 'Nuit blanche — pas de nuit astronomique ce soir.'
  } else {
    const parts = [nightLen ? `${nightLen} de nuit astronomique` : 'Nuit astronomique']
    if (moonDownBeforeNight || illum < 5) parts.push('Lune absente')
    else if (illum >= 60) parts.push(`Lune ${illum} % (gênante)`)
    else parts.push(`Lune ${illum} %`)
    nightDesc = parts.join(' · ') + '.'
  }

  return {
    sunset:      fmtTime(sunset),
    blueHour:    blueStart && blueEnd ? `${fmtTime(blueStart)} – ${fmtTime(blueEnd)}` : fmtTime(blueStart),
    duskAstro:   fmtTime(duskAstro),
    dawnAstro:   fmtTime(dawnAstro),
    nightLen:    nightLen || '--',
    nightWindow: duskAstro && dawnAstro
      ? `${fmtTime(duskAstro)} → ${fmtTime(dawnAstro)}`
      : duskAstro ? `Après ${fmtTime(duskAstro)}` : 'Nuit blanche',
    nightDesc,
    moonLabel, moonSub, illum,
    gcDir:    gcAlt !== null && gcAlt > 0 && gcAz !== null ? azToDir(gcAz) : '--',
    gcSub:    gcAlt !== null ? (gcAlt > 0 ? `Altitude ${gcAlt}° à minuit` : 'Non visible ce soir') : '--',
    seasonLabel, seasonSub,
    hasNight: !!duskAstro,
  }
}

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

function relTimeLabel(date) {
  const diffMs = Date.now() - date.getTime()
  const diffM  = Math.floor(diffMs / 60000)
  const diffH  = Math.floor(diffMs / 3600000)
  const diffD  = Math.floor(diffMs / 86400000)
  if (diffM < 2)  return 'à l\'instant'
  if (diffM < 60) return `il y a ${diffM} min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD === 1) return 'hier'
  return `il y a ${diffD} j.`
}

export function getRecentAstroEvents(daysBack = 7) {
  const now   = new Date()
  const start = new Date(now.getTime() - daysBack * 86400000)
  const inRange = d => d >= start && d <= now
  const events = []

  // ── Phases de Lune ──────────────────────────────────────────────────────────
  const PHASES = [
    { deg: 0,   title: 'Nouvelle Lune',    iconKey: 'moon',   body: 'Ciel à son obscurité maximale — nuit idéale pour le ciel profond et la Voie Lactée.' },
    { deg: 90,  title: 'Premier quartier', iconKey: 'moon',   body: 'Lune visible le soir jusqu\'à minuit. Terminateur parfait pour les détails de relief.' },
    { deg: 180, title: 'Pleine Lune',      iconKey: 'moon',   body: 'Nuit lumineuse — idéale pour observer la Lune en détail, défavorable au ciel profond.' },
    { deg: 270, title: 'Dernier quartier', iconKey: 'moon',   body: 'Lune visible en seconde moitié de nuit, ciel profond en début de nuit.' },
  ]
  for (const p of PHASES) {
    try {
      const r = Astronomy.SearchMoonPhase(p.deg, start, daysBack + 2)
      if (r && inRange(r.date)) {
        events.push({ iconKey: p.iconKey, title: p.title, date: r.date,
          relTime: relTimeLabel(r.date), body: p.body, tag: null })
      }
    } catch {}
  }

  // ── Superlunes ───────────────────────────────────────────────────────────────
  try {
    let t = new Date(start.getTime() - 16 * 86400000)
    for (let g = 0; g < 2; g++) {
      const fm = Astronomy.SearchMoonPhase(180, t, 35)
      if (!fm) break
      let ap = Astronomy.SearchLunarApsis(new Date(fm.date.getTime() - 16 * 86400000))
      for (let j = 0; j < 3; j++) {
        if (ap.kind === 0) {
          const diff = Math.abs(fm.date.getTime() - ap.time.date.getTime()) / 86400000
          if (diff <= 1.5 && ap.dist_km < 360000 && inRange(fm.date)) {
            events.push({ iconKey: 'moon', title: 'Superlune',
              date: fm.date, relTime: relTimeLabel(fm.date),
              body: `Pleine Lune au périgée à ${Math.round(ap.dist_km).toLocaleString('fr-FR')} km — ~14 % plus grande et ~30 % plus lumineuse qu'à l'apogée.`,
              tag: 'Périgée' })
          }
          break
        }
        ap = Astronomy.NextLunarApsis(ap)
      }
      t = new Date(fm.date.getTime() + 26 * 86400000)
    }
  } catch {}

  // ── Éclipses lunaires ────────────────────────────────────────────────────────
  try {
    const e = Astronomy.SearchLunarEclipse(start)
    if (e && inRange(e.peak.date) && (e.kind === 'total' || e.kind === 'partial')) {
      const dur = e.kind === 'total' ? Math.round(e.sd_total * 2) : Math.round(e.sd_partial * 2)
      events.push({ iconKey: 'eclipse',
        title: e.kind === 'total' ? 'Éclipse totale de Lune' : 'Éclipse partielle de Lune',
        date: e.peak.date, relTime: relTimeLabel(e.peak.date),
        body: e.kind === 'total'
          ? `Lune de sang. Totalité de ${dur} min, maximum à ${fmtUtc(e.peak.date)}.`
          : `Ombrage partiel. Maximum à ${fmtUtc(e.peak.date)}.`,
        tag: e.kind === 'total' ? 'Totale' : 'Partielle' })
    }
  } catch {}

  // ── Éclipses solaires ────────────────────────────────────────────────────────
  try {
    const s = Astronomy.SearchGlobalSolarEclipse(start)
    if (s && inRange(s.peak.date) && (s.kind === 'total' || s.kind === 'annular')) {
      events.push({ iconKey: 'eclipse',
        title: s.kind === 'total' ? 'Éclipse totale de Soleil' : 'Éclipse annulaire de Soleil',
        date: s.peak.date, relTime: relTimeLabel(s.peak.date),
        body: `Maximum à ${fmtUtc(s.peak.date)}. Protection solaire obligatoire hors totalité.`,
        tag: s.kind === 'total' ? 'Totale' : 'Annulaire' })
    }
  } catch {}

  // ── Oppositions planétaires ──────────────────────────────────────────────────
  for (const [body, name] of [
    [Astronomy.Body.Mars, 'Mars'], [Astronomy.Body.Jupiter, 'Jupiter'],
    [Astronomy.Body.Saturn, 'Saturne'], [Astronomy.Body.Uranus, 'Uranus'],
    [Astronomy.Body.Neptune, 'Neptune'],
  ]) {
    try {
      const opp = Astronomy.SearchRelativeLongitude(body, 180, start)
      if (opp && inRange(opp.date)) {
        const illum = Astronomy.Illumination(body, opp.date)
        events.push({ iconKey: 'planet', title: `Opposition de ${name}`,
          date: opp.date, relTime: relTimeLabel(opp.date),
          body: `${name} était à sa distance minimale de la Terre (mag ${illum.mag.toFixed(1)}) — la meilleure nuit pour l'observer.`,
          tag: `mag ${illum.mag.toFixed(1)}` })
      }
    } catch {}
  }

  // ── Pluies de météores (pics annuels fixes) ──────────────────────────────────
  const yr = now.getFullYear()
  for (const shower of METEOR_SHOWERS) {
    for (const y of [yr - 1, yr]) {
      const d = new Date(y, shower.mm - 1, shower.dd)
      if (inRange(d)) {
        events.push({ iconKey: 'meteor', title: `${shower.name} — pic du maximum`,
          date: d, relTime: relTimeLabel(d),
          body: shower.detail, tag: shower.tag })
      }
    }
  }

  return events.sort((a, b) => b.date - a.date) // plus récent en premier
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

export function getObsWindows(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  let dusk6 = null, duskAstro = null, dawnAstro = null
  try { dusk6     = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1,  -6) } catch {}
  try { duskAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, -1, date, 1, -18) } catch {}
  try { dawnAstro = Astronomy.SearchAltitude(Astronomy.Body.Sun, obs, +1, date, 1, -18) } catch {}

  if (!duskAstro) return []

  const moonSet = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, date, 1)
  const moonDuringNight = moonSet
    && moonSet.date > duskAstro.date
    && (!dawnAstro || moonSet.date < dawnAstro.date)

  const windows = []

  if (dusk6) {
    windows.push({
      t: `${fmtTime(dusk6)} – ${fmtTime(duskAstro)}`,
      label: 'Crépuscule terminé',
      q: 'Correct',
      note: 'Fond de ciel encore lumineux, premières étoiles visibles',
      val: 2,
    })
  }

  if (moonDuringNight) {
    windows.push({
      t: `${fmtTime(duskAstro)} – ${fmtTime(moonSet)}`,
      label: 'Bonne fenêtre',
      q: 'Bon',
      note: 'Nuit astronomique · Lune encore présente',
      val: 3,
    })
    windows.push({
      t: `${fmtTime(moonSet)} – ${fmtTime(dawnAstro)}`,
      label: 'Fenêtre optimale',
      q: 'Excellent',
      note: 'Lune couchée · ciel le plus sombre',
      val: 4,
    })
  } else {
    windows.push({
      t: `${fmtTime(duskAstro)} – ${dawnAstro ? fmtTime(dawnAstro) : 'aube'}`,
      label: 'Nuit astronomique',
      q: 'Excellent',
      note: 'Ciel sombre · aucune pollution lunaire',
      val: 4,
    })
  }

  return windows
}

// ─── Positions live pour la carte du ciel ────────────────────────────────────

const SKY_BODIES = {
  jupiter: Astronomy.Body.Jupiter,
  saturn:  Astronomy.Body.Saturn,
  venus:   Astronomy.Body.Venus,
  mars:    Astronomy.Body.Mars,
}

function fmtAU(au) {
  return au.toFixed(2).replace('.', ',') + ' UA'
}

// Constellations traversées par la Lune (noms anglais d'astronomy-engine → FR)
const CONS_FR = {
  Aries:'Bélier', Taurus:'Taureau', Gemini:'Gémeaux', Cancer:'Cancer', Leo:'Lion',
  Virgo:'Vierge', Libra:'Balance', Scorpius:'Scorpion', Ophiuchus:'Ophiuchus',
  Sagittarius:'Sagittaire', Capricornus:'Capricorne', Aquarius:'Verseau', Pisces:'Poissons',
  Cetus:'Baleine', Orion:'Orion', Sextans:'Sextant', Auriga:'Cocher', Scutum:'Écu',
  Corvus:'Corbeau', Crater:'Coupe', Hydra:'Hydre',
}

/**
 * Enrichit les SKY_OBJECTS avec alt/az/mag/lever/coucher calculés en direct.
 * Lune et planètes via leur éphéméride ; objets fixes via ra/dec (J2000).
 * En cas d'échec, les valeurs statiques de data.js servent de secours.
 */
export function getSkyPositions(objects, date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  return objects.map(o => {
    try {
      if (o.id === 'moon') {
        const eq    = Astronomy.Equator(Astronomy.Body.Moon, date, obs, true, true)
        const hor   = Astronomy.Horizon(date, obs, eq.ra, eq.dec, 'normal')
        const illum = Astronomy.Illumination(Astronomy.Body.Moon, date)
        const phase = Astronomy.MoonPhase(date)
        const pct   = Math.round((1 - Math.cos(phase * Math.PI / 180)) / 2 * 100)
        const rise  = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, +1, date, 1)
        const set   = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, date, 1)
        const km    = Math.round(illum.geo_dist * 149597870.7)
        let cons = o.cons
        try {
          const eqj = Astronomy.Equator(Astronomy.Body.Moon, date, obs, false, true)
          const c = Astronomy.Constellation(eqj.ra, eqj.dec)
          cons = CONS_FR[c.name] || c.name
        } catch {}
        return { ...o, alt: Math.round(hor.altitude), az: Math.round(hor.azimuth),
          mag: +illum.mag.toFixed(1), rise: fmtTime(rise), set: fmtTime(set),
          dist: km.toLocaleString('fr-FR') + ' km', cons,
          info: `${phaseName(phase)} · ${pct} % illuminée. ${o.info}` }
      }
      const body = SKY_BODIES[o.id]
      if (body) {
        const eq    = Astronomy.Equator(body, date, obs, true, true)
        const hor   = Astronomy.Horizon(date, obs, eq.ra, eq.dec, 'normal')
        const illum = Astronomy.Illumination(body, date)
        const rise  = Astronomy.SearchRiseSet(body, obs, +1, date, 1)
        const set   = Astronomy.SearchRiseSet(body, obs, -1, date, 1)
        return { ...o, alt: Math.round(hor.altitude), az: Math.round(hor.azimuth),
          mag: +illum.mag.toFixed(1), rise: fmtTime(rise), set: fmtTime(set),
          dist: fmtAU(illum.geo_dist) }
      }
      if (o.ra != null) {
        const hor = Astronomy.Horizon(date, obs, o.ra, o.dec, 'normal')
        // un seul slot étoile, redéfini pour chaque objet
        Astronomy.DefineStar(Astronomy.Body.Star1, o.ra, o.dec, 1000)
        let r = null, s = null
        try { r = Astronomy.SearchRiseSet(Astronomy.Body.Star1, obs, +1, date, 1) } catch {}
        try { s = Astronomy.SearchRiseSet(Astronomy.Body.Star1, obs, -1, date, 1) } catch {}
        return { ...o, alt: Math.round(hor.altitude), az: Math.round(hor.azimuth),
          rise: r ? fmtTime(r) : '—', set: s ? fmtTime(s) : '—' }
      }
      return o
    } catch { return o }
  })
}

function sunAltitude(date, obs) {
  const eq = Astronomy.Equator(Astronomy.Body.Sun, date, obs, true, true)
  return Astronomy.Horizon(date, obs, eq.ra, eq.dec, 'normal').altitude
}

/** Vrai si le ciel est sombre (Soleil sous −6°) à cet instant et ce lieu. */
export function isDarkAt(date, lat = 48.8566, lng = 2.3522) {
  try { return sunAltitude(date, new Astronomy.Observer(lat, lng, 0)) < -6 } catch { return true }
}

/**
 * Conjonctions Lune – planète des prochains jours : minimum de séparation
 * angulaire (échantillonnage 1 h, raffinement 5 min), retenu si < 6°.
 */
export function getMoonConjunctions(date = new Date(), lat = 48.8566, lng = 2.3522, days = 10) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  const bodies = [
    [Astronomy.Body.Venus, 'Vénus'], [Astronomy.Body.Mars, 'Mars'],
    [Astronomy.Body.Jupiter, 'Jupiter'], [Astronomy.Body.Saturn, 'Saturne'],
  ]
  const sepAt = (body, t) => Astronomy.AngleBetween(
    Astronomy.GeoVector(Astronomy.Body.Moon, t, true),
    Astronomy.GeoVector(body, t, true))

  const out = []
  for (const [body, name] of bodies) {
    try {
      let best = null, bestH = 0
      for (let h = 0; h <= days * 24; h++) {
        const t = new Date(date.getTime() + h * 3600000)
        const sep = sepAt(body, t)
        if (!best || sep < best.sep) { best = { t, sep }; bestH = h }
      }
      // minimum en bord de fenêtre → la vraie conjonction est hors fenêtre
      if (!best || best.sep > 6 || bestH === 0 || bestH === days * 24) continue
      for (let m = -55; m <= 55; m += 5) {
        const t = new Date(best.t.getTime() + m * 60000)
        const sep = sepAt(body, t)
        if (sep < best.sep) best = { t, sep }
      }
      const eq  = Astronomy.Equator(Astronomy.Body.Moon, best.t, obs, true, true)
      const hor = Astronomy.Horizon(best.t, obs, eq.ra, eq.dec, 'normal')
      const sepLabel = best.sep.toFixed(1).replace('.', ',')
      const dark = sunAltitude(best.t, obs) < -6
      let detail
      if (dark && hor.altitude > 0) {
        detail = `Séparation de ${sepLabel}°. Direction ${azToDir(hor.azimuth)}, à ${Math.round(hor.altitude)}° de hauteur — belle composition aux jumelles.`
      } else if (!dark) {
        detail = `Séparation de ${sepLabel}° au maximum (en plein jour). La Lune reste voisine de ${name} — cherchez-les ensemble la nuit la plus proche.`
      } else {
        detail = `Séparation de ${sepLabel}° au maximum (sous l'horizon à cet instant). Observez le rapprochement en début ou fin de nuit.`
      }
      out.push({
        id: `conj_${name}_${best.t.toISOString().slice(0, 10)}`,
        icon: 'conj',
        title: `Conjonction Lune – ${name}`,
        date: best.t,
        detail,
      })
    } catch {}
  }
  return out.sort((a, b) => a.date - b.date)
}

/**
 * Projette les figures de constellations : chaque sommet [ra, dec] → {alt, az}.
 */
export function getConstellationPoints(constellations, date = new Date(), lat = 48.8566, lng = 2.3522) {
  const obs = new Astronomy.Observer(lat, lng, 0)
  return constellations.map(c => ({
    id: c.id,
    name: c.name,
    lines: c.lines,
    pts: c.stars.map(([ra, dec]) => {
      try {
        const hor = Astronomy.Horizon(date, obs, ra, dec, 'normal')
        return { alt: hor.altitude, az: hor.azimuth }
      } catch { return { alt: -90, az: 0 } }
    }),
  }))
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
      const mkm = Math.round(illum.geo_dist * 149.6)
      return {
        id, name,
        alt: hor.altitude.toFixed(1),
        az:  hor.azimuth.toFixed(0),
        mag: illum.mag.toFixed(1),
        rise: fmtTime(rise),
        set:  fmtTime(set),
        visible: hor.altitude > 5,
        distLabel: mkm >= 1000 ? `${(mkm / 1000).toFixed(1)} Mds km` : `${mkm} M km`,
      }
    } catch {
      return { id, name, alt: null, az: null, mag: null, rise: '--:--', set: '--:--', visible: false }
    }
  })
}
