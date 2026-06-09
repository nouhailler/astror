import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadNotifPrefs, saveNotifPrefs, scheduleNotification } from '../notifications'

describe('loadNotifPrefs / saveNotifPrefs', () => {
  beforeEach(() => { localStorage.clear() })

  it('returns empty object when no prefs', () => {
    expect(loadNotifPrefs()).toEqual({})
  })

  it('saves and reloads prefs', () => {
    saveNotifPrefs({ iss: true, meteor: false })
    expect(loadNotifPrefs()).toEqual({ iss: true, meteor: false })
  })
})

describe('scheduleNotification', () => {
  beforeEach(() => {
    vi.stubGlobal('Notification', { permission: 'denied' })
  })

  it('returns null when permission is not granted', () => {
    const id = scheduleNotification('Test', 'Body', 1000)
    expect(id).toBeNull()
  })
})
