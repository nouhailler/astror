import { registerSW } from 'virtual:pwa-register'

const LS_LAST_CHECK = 'astror_pwa_last_check_v1'
const LS_LAST_UPDATE = 'astror_pwa_last_update_v1'
const CHECK_INTERVAL_MS = 60 * 60 * 1000 // 1 h

function setNow(key) {
  try { localStorage.setItem(key, new Date().toISOString()) } catch {}
}

let registration = null

/** À appeler une fois au démarrage de l'app (main.jsx). */
export function initPwaUpdate() {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg || null
      if (registration) {
        setNow(LS_LAST_CHECK)
        setInterval(() => { registration.update().catch(() => {}); setNow(LS_LAST_CHECK) }, CHECK_INTERVAL_MS)
      }
    },
    // Nouvelle version détectée et déjà installée en arrière-plan : on l'applique
    // automatiquement (rechargement immédiat), sans invite — mise à jour "silencieuse".
    onNeedRefresh() { setNow(LS_LAST_UPDATE); location.reload() },
    onOfflineReady() {},
  })
}

/**
 * Force une vérification immédiate (bouton "Vérifier les mises à jour" dans Paramètres).
 * N'échoue jamais : un problème réseau ou l'absence de service worker (dev) laisse
 * simplement la date de dernière vérification à jour, sans bloquer l'appelant.
 */
export async function checkForUpdate() {
  setNow(LS_LAST_CHECK)
  try {
    if (registration) { await registration.update(); return }
    // Repli si onRegisteredSW n'a pas encore fourni la registration (ex. juste après le premier chargement).
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) await reg.update()
    }
  } catch {}
}

export function getLastCheck() {
  try { return localStorage.getItem(LS_LAST_CHECK) } catch { return null }
}
export function getLastUpdate() {
  try { return localStorage.getItem(LS_LAST_UPDATE) } catch { return null }
}
