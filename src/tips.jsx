import { useState, useEffect } from 'react'
import { IcBulb, IcClose } from './icons'

// ─── Astuces par écran ────────────────────────────────────────────────────────
// Complémentaires de l'Aide (?) et de la Démo (▶) : gestes concrets et
// fonctions faciles à manquer. 3 astuces par écran, défilables.

export const TIPS = {
  sky: [
    "Touchez un astre sur la carte pour ouvrir sa fiche : magnitude, altitude, distance et analyse IA.",
    "Dans la fiche d'un objet, lancez le mode boussole : pointez le téléphone vers le ciel, le radar vous guide jusqu'à lui.",
    "Les boutons ▶ et ? en haut à droite ouvrent une démo pas à pas et l'aide de chaque écran d'Astror.",
  ],
  eph: [
    "Touchez la cloche en haut à droite pour gérer vos alertes : passages ISS, conjonctions, stations spatiales.",
    "Le crépuscule astronomique marque le moment où le ciel devient vraiment noir — idéal pour le ciel profond.",
    "Les comptes à rebours des prochains événements se mettent à jour en direct, calculés pour votre position.",
  ],
  explore: [
    "Naviguez entre Système solaire, James Webb, Conquête, Anomalies et Théories avec les onglets sous le titre.",
    "Dans la Conquête spatiale, touchez une date, un terme ou une mission des Annexes pour ouvrir sa fiche Wikipédia.",
    "Le badge « Visible ce soir » des planètes est calculé en direct pour votre position GPS.",
  ],
  feed: [
    "La photo du jour NASA (APOD) est renouvelée chaque nuit — touchez-la pour lire sa description complète.",
    "Le bouton « + Ajouter » enregistre vos propres ressources : conférences, chaînes YouTube, livres…",
    "Changez de catégorie avec les puces sous le titre : actualités, conférences, personnalités, livres.",
  ],
  tools: [
    "Chaque tuile ouvre un module complet, adapté à votre position GPS, votre matériel et votre niveau.",
    "Modifiez votre profil (ville, matériel, niveau) dans les Paramètres ⚙ : tous les outils s'adaptent aussitôt.",
    "Dans chaque outil, le bouton ▶ en haut à droite lance une démonstration guidée du module.",
  ],
  ai: [
    "Touchez une catégorie de suggestions puis une question pour démarrer — ou écrivez librement la vôtre.",
    "L'assistant connaît votre ville, votre niveau et vos instruments : ses conseils sont personnalisés.",
    "Pour des réponses en temps réel, saisissez une clé API (Anthropic ou OpenRouter) dans les Paramètres ⚙.",
  ],
  tool_observe: [
    "Vérifiez les conditions en direct (nuages, seeing, transparence, Bortle) avant de sortir votre matériel.",
    "Ajoutez vos sessions au journal : date, lieu, objets observés, notes et matériel — tout reste sur votre appareil.",
    "Parcourez les catalogues Messier, NGC, IC et Caldwell, triés par difficulté selon votre instrument.",
  ],
  tool_moon: [
    "Le conseil IA sous le disque lunaire vous indique les meilleures zones à observer ce soir.",
    "Le terminateur (limite jour/nuit) est l'endroit le plus spectaculaire : les reliefs y sont en ombres portées.",
    "Touchez une mer ou un cratère de la carte pour ouvrir sa fiche d'observation détaillée.",
  ],
  tool_planets: [
    "Le simulateur d'oculaire montre ce que vous verrez réellement selon la focale choisie : essayez plusieurs valeurs.",
    "Une opposition est le meilleur moment pour observer une planète : elle est au plus près de la Terre.",
    "Le tableau du soir est recalculé en direct : magnitude, taille apparente et visibilité de chaque planète.",
  ],
  tool_events: [
    "Filtrez le calendrier par catégorie : éclipses, pluies de météores ou événements spéciaux.",
    "Touchez un événement pour le panel IA : meilleur moment, matériel conseillé et position dans le ciel.",
    "Activez les notifications par type dans l'onglet dédié pour être alerté avant chaque rendez-vous céleste.",
  ],
  tool_astrophoto: [
    "La fenêtre de nuit indique l'heure bleue et le crépuscule astronomique — vos meilleurs créneaux de prise de vue.",
    "Entrez votre focale et votre capteur : les règles 500 et NPF calculent le temps de pose maximal sans filé d'étoiles.",
    "Surveillez l'interférence lunaire : une Lune brillante écrase le contraste de la Voie Lactée.",
  ],
  tool_satellites: [
    "La position de l'ISS est mise à jour toutes les 10 secondes : altitude, vitesse et statut d'éclairement.",
    "Un passage visible de l'ISS ressemble à une étoile brillante et rapide — aucun instrument nécessaire.",
    "Descendez jusqu'aux sondes lointaines : les distances de Voyager 1/2 et New Horizons sont calculées en direct.",
  ],
  tool_education: [
    "Après chaque réponse du quiz, lisez l'explication détaillée : c'est là qu'on apprend le plus.",
    "Touchez un terme du glossaire pour une définition approfondie générée par l'IA.",
    "Revenez chaque jour : la photo NASA et les articles éducatifs sont renouvelés en continu.",
  ],
  tool_community: [
    "Le fil charge des photos d'astrophotographie en direct depuis Mastodon — tirez la liste pour en voir d'autres.",
    "Connectez un Google Sheets dans les Paramètres pour afficher le classement photo de votre club.",
    "Consultez les sorties : soirées d'observation et événements astronomiques près de chez vous.",
  ],
  tool_ai: [
    "Cet assistant connaît votre profil : posez des questions précises, ses réponses tiennent compte de votre matériel.",
    "Explorez les 11 catégories de suggestions, de l'utilisation d'Astror jusqu'à la cosmologie.",
    "Sans clé API, des réponses types sont affichées — ajoutez votre clé dans les Paramètres ⚙ pour le temps réel.",
  ],
  tool_extras: [
    "Dans l'explorateur d'échelles, avancez visuel par visuel : de l'Everest à l'Univers observable.",
    "Faites glisser la masse de l'impacteur : cratère, énergie et équivalent TNT se recalculent en direct.",
    "Votre Top 10 est généré selon votre position GPS et la saison — chaque objet a sa fiche et son conseil IA.",
  ],
}

// ─── Persistance ──────────────────────────────────────────────────────────────

const TIPS_LS = 'astror_tips_v1'

function loadHidden() {
  try { return JSON.parse(localStorage.getItem(TIPS_LS) || '{}') } catch { return {} }
}
function saveHidden(d) {
  try { localStorage.setItem(TIPS_LS, JSON.stringify(d)) } catch {}
}

/** Réaffiche toutes les astuces (bouton dans les Paramètres). */
export function resetTips() {
  try { localStorage.removeItem(TIPS_LS) } catch {}
  window.dispatchEvent(new Event('astror-tips-reset'))
}

// ─── Bandeau d'astuce ─────────────────────────────────────────────────────────

export function TipBanner({ tipKey, style }) {
  const tips = TIPS[tipKey]
  const [hidden, setHidden] = useState(() => !!loadHidden()[tipKey])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const onReset = () => { setHidden(false); setIdx(0) }
    window.addEventListener('astror-tips-reset', onReset)
    return () => window.removeEventListener('astror-tips-reset', onReset)
  }, [])

  if (!tips || !tips.length || hidden) return null

  const dismiss = () => {
    const d = loadHidden()
    d[tipKey] = true
    saveHidden(d)
    setHidden(true)
  }

  return (
    <div style={{ padding: '4px 18px 8px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px',
        borderRadius: 14, background: 'rgba(217,179,108,.05)', border: '1px solid var(--gold-line)' }}>
        <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--gold)', display: 'flex' }}>
          <IcBulb size={17} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Astuce</span>
            {tips.length > 1 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--faint)',
                letterSpacing: '.08em' }}>{idx + 1}/{tips.length}</span>
            )}
          </div>
          <p className="body" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'var(--dim)' }}>
            {tips[idx]}
          </p>
          {tips.length > 1 && (
            <button onClick={() => setIdx(i => (i + 1) % tips.length)}
              style={{ marginTop: 7, padding: 0, background: 'none', border: 0, cursor: 'pointer',
                color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 10.5,
                letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Astuce suivante →
            </button>
          )}
        </div>
        <button onClick={dismiss} aria-label="Masquer les astuces de cet écran"
          style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 999, padding: 0,
            border: 0, background: 'none', color: 'var(--faint)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcClose size={14} />
        </button>
      </div>
    </div>
  )
}
