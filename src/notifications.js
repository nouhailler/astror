const PREFS_KEY = 'astror_notif_prefs_v1'

export function loadNotifPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {} } catch { return {} }
}

export function saveNotifPrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch {}
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function scheduleNotification(title, body, delayMs) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null
  const id = setTimeout(() => {
    new Notification(title, { body, icon: '/icon-192.png', badge: '/favicon.svg' })
  }, Math.max(0, delayMs))
  return id
}

export function cancelNotification(id) {
  if (id != null) clearTimeout(id)
}

export function notifyISS(issData) {
  if (!issData || Notification.permission !== 'granted') return
  new Notification("ISS en vue", {
    body: `Station spatiale en orbite · altitude ${issData.altitude} km · ${issData.velocity} km/h`,
    icon: '/icon-192.png',
  })
}

export function scheduleEventReminder(eventTitle, eventDate, minutesBefore = 60) {
  const now = Date.now()
  const target = new Date(eventDate).getTime() - minutesBefore * 60000
  if (target <= now) return null
  return scheduleNotification(
    `Rappel : ${eventTitle}`,
    `Dans ${minutesBefore} minutes`,
    target - now
  )
}
