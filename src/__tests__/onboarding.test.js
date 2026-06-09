import { describe, it, expect, beforeEach } from 'vitest'
import { onbLoad, onbSave, DEFAULT_PROFILE } from '../onboarding'

describe('onbLoad / onbSave', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns DEFAULT_PROFILE when localStorage is empty', () => {
    const p = onbLoad()
    expect(p.location).toEqual(DEFAULT_PROFILE.location)
    expect(p.level).toBe('Amateur')
  })

  it('saves and reloads profile correctly', () => {
    const custom = { ...DEFAULT_PROFILE, level: 'Confirmé' }
    onbSave(custom)
    const loaded = onbLoad()
    expect(loaded.level).toBe('Confirmé')
  })

  it('migrates old string location to object', () => {
    localStorage.setItem('astror_profile_v1', JSON.stringify({ location: 'Paris, FR', level: 'Débutant' }))
    const p = onbLoad()
    expect(typeof p.location).toBe('object')
    expect(p.location.city).toBe('Paris')
    expect(p.location.lat).toBeCloseTo(48.8566, 2)
  })

  it('keeps object location intact', () => {
    const loc = { city: 'Lyon', lat: 45.764, lng: 4.836 }
    onbSave({ ...DEFAULT_PROFILE, location: loc })
    const p = onbLoad()
    expect(p.location.city).toBe('Lyon')
    expect(p.location.lat).toBeCloseTo(45.764, 2)
  })
})
