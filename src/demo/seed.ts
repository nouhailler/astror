// Isolation des données du mode démo.
//
// Le « store » d'Astror est le localStorage (clés préfixées `astror_`).
// Pour garantir « aucune écriture dans le store réel », on procède ainsi :
//   1. snapshot() capture l'intégralité des clés astror_ au démarrage ;
//   2. applySeed() installe un profil/état de démo cohérent et neutre ;
//   3. restore() remet exactement l'état capturé (ajouts supprimés, valeurs
//      modifiées ou effacées rétablies) quand la démo se termine.
//
// Résultat : la démo s'exécute sur une graine isolée, et l'état persistant de
// l'utilisateur est rendu intact, quel que soit le moment de la sortie (Échap).

const PREFIX = 'astror_'

type Snapshot = Record<string, string | null>

let snapshot: Snapshot | null = null

/** Capture toutes les clés astror_ actuelles. */
export function snapshotStore(): void {
  const snap: Snapshot = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) snap[k] = localStorage.getItem(k)
    }
  } catch { /* localStorage indisponible : rien à isoler */ }
  snapshot = snap
}

/**
 * Restaure l'état capturé. Toute clé astror_ créée ou modifiée pendant la démo
 * est ramenée à sa valeur d'origine (ou supprimée si elle n'existait pas).
 */
export function restoreStore(): void {
  if (!snapshot) return
  try {
    // 1. Retirer / rétablir les clés présentes actuellement.
    const current: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) current.push(k)
    }
    for (const k of current) {
      if (!(k in snapshot)) localStorage.removeItem(k)
    }
    // 2. Réécrire les valeurs d'origine.
    for (const [k, v] of Object.entries(snapshot)) {
      if (v == null) localStorage.removeItem(k)
      else localStorage.setItem(k, v)
    }
  } catch { /* ignore */ }
  snapshot = null
}

// Profil de démonstration : neutre, cohérent, indépendant du profil réel.
const DEMO_PROFILE = {
  location: { city: 'Paris', lat: 48.8566, lng: 2.3522 },
  level: 'Amateur',
  interests: ['Planètes', 'Ciel profond', 'Lune & Soleil'],
  gear: ['Jumelles', 'Télescope'],
  alerts: { iss: true, conj: true, meteor: true, eclipse: false },
}

/**
 * Installe la graine de démo. À n'appeler qu'APRÈS snapshotStore().
 * - marque l'app comme « déjà vue » pour éviter l'onboarding pendant la démo ;
 * - pose un profil de démonstration lisible.
 */
export function applySeed(): void {
  try {
    localStorage.setItem('astror_onboarded_v1', '1')
    localStorage.setItem('astror_profile_v1', JSON.stringify(DEMO_PROFILE))
  } catch { /* ignore */ }
}
