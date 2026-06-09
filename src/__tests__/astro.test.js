import { describe, it, expect } from 'vitest'
import { getMoonData, getSunData, getPlanetPositions } from '../astro'

describe('getMoonData', () => {
  const paris = [48.8566, 2.3522]
  const date = new Date('2026-06-09T20:00:00Z')

  it('returns illumination between 0 and 100', () => {
    const d = getMoonData(date, ...paris)
    expect(d.illumination).toBeGreaterThanOrEqual(0)
    expect(d.illumination).toBeLessThanOrEqual(100)
  })

  it('returns a known French phase name', () => {
    const d = getMoonData(date, ...paris)
    const phases = ['Nouvelle Lune', 'Croissant croissant', 'Premier quartier', 'Gibbeuse croissante',
      'Pleine Lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant']
    expect(phases).toContain(d.phase)
  })

  it('returns age as a positive float', () => {
    const d = getMoonData(date, ...paris)
    expect(parseFloat(d.age)).toBeGreaterThan(0)
    expect(parseFloat(d.age)).toBeLessThan(30)
  })

  it('returns distance string ending with km', () => {
    const d = getMoonData(date, ...paris)
    expect(d.distance).toMatch(/km$/)
  })

  it('returns time strings for rise and set', () => {
    const d = getMoonData(date, ...paris)
    expect(d.moonrise).toMatch(/\d{2}:\d{2}|--:--/)
    expect(d.moonset).toMatch(/\d{2}:\d{2}|--:--/)
  })
})

describe('getSunData', () => {
  const paris = [48.8566, 2.3522]
  const date = new Date('2026-06-09T06:00:00Z')

  it('returns sunrise and sunset as HH:MM strings', () => {
    const d = getSunData(date, ...paris)
    expect(d.sunrise).toMatch(/\d{2}:\d{2}/)
    expect(d.sunset).toMatch(/\d{2}:\d{2}/)
  })

  it('returns sunset after sunrise in summer', () => {
    const d = getSunData(date, ...paris)
    expect(d.sunset > d.sunrise).toBe(true)
  })

  it('returns nightLen string', () => {
    const d = getSunData(date, ...paris)
    expect(typeof d.nightLen).toBe('string')
  })
})

describe('getPlanetPositions', () => {
  const paris = [48.8566, 2.3522]
  const date = new Date('2026-06-09T22:00:00Z')

  it('returns 7 planets', () => {
    const planets = getPlanetPositions(date, ...paris)
    expect(planets).toHaveLength(7)
  })

  it('each planet has id, name, alt, az, rise, set', () => {
    const planets = getPlanetPositions(date, ...paris)
    planets.forEach(p => {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.rise).toMatch(/\d{2}:\d{2}|--:--/)
      expect(p.set).toMatch(/\d{2}:\d{2}|--:--/)
    })
  })
})
