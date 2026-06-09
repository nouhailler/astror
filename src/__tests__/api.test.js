import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchISSPosition, fetchWeather } from '../api'

describe('fetchISSPosition', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => { vi.restoreAllMocks() })

  it('returns structured ISS data', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 48.5, longitude: 2.3, altitude: 418.4,
        velocity: 27580, visibility: 'daylight',
      }),
    })
    const d = await fetchISSPosition()
    expect(d.altitude).toBe(418)
    expect(d.lat).toBeCloseTo(48.5)
    expect(typeof d.velocity).toBe('string')
  })

  it('throws when API returns non-ok', async () => {
    fetch.mockResolvedValue({ ok: false })
    await expect(fetchISSPosition()).rejects.toThrow()
  })
})

describe('fetchWeather', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })
  afterEach(() => { vi.restoreAllMocks() })

  it('computes seeing and transparency from cloud cover', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 18, cloud_cover: 5, relative_humidity_2m: 50 },
      }),
    })
    const d = await fetchWeather(48.8566, 2.3522)
    expect(d.seeingVal).toBe(5)
    expect(d.transVal).toBe(5)
    expect(d.temp).toBe(18)
    expect(d.clouds).toBe(5)
  })

  it('returns bortle 4', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 20, cloud_cover: 80, relative_humidity_2m: 70 },
      }),
    })
    const d = await fetchWeather(48.8566, 2.3522)
    expect(d.bortle).toBe(4)
    expect(d.seeingVal).toBe(1)
  })
})
