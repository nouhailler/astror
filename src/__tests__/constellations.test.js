import { describe, it, expect } from 'vitest'
import { CONSTELLATIONS_88 } from '../constellations'

describe('CONSTELLATIONS_88', () => {
  it('contains exactly 88 constellations with unique ids', () => {
    expect(CONSTELLATIONS_88).toHaveLength(88)
    expect(new Set(CONSTELLATIONS_88.map(c => c.id)).size).toBe(88)
  })

  it('every entry has the required fields', () => {
    CONSTELLATIONS_88.forEach(c => {
      expect(c.fr).toBeTruthy()
      expect(c.la).toBeTruthy()
      expect(c.star).toBeTruthy()
      expect(['Hiver', 'Printemps', 'Été', 'Automne']).toContain(c.season)
      expect(['N', 'S', 'Équ']).toContain(c.hemi)
      expect(c.area).toBeGreaterThan(0)
      expect(c.hist.length).toBeGreaterThan(60)
      expect(c.wiki).toBeTruthy()
    })
  })

  it('has the 12 zodiac constellations', () => {
    expect(CONSTELLATIONS_88.filter(c => c.zodiac)).toHaveLength(12)
  })

  it('ranks Hydra first and Crux last by area', () => {
    expect(CONSTELLATIONS_88.find(c => c.id === 'hya').rank).toBe(1)
    expect(CONSTELLATIONS_88.find(c => c.id === 'cru').rank).toBe(88)
  })
})
