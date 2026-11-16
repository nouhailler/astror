// Extraction des narrations d'un scénario vidéo et découpage du texte.
// Le texte parlé provient en priorité de `step.video.narration.text`, sinon du
// texte déjà présent dans l'étape (`narrate` ou `text` pour une étape narrate).
import { videoConfig } from '../../config/video.config'
import type { VideoScenario, VideoStep, VideoNarration } from '../../types/video.types'

export interface NarrationItem {
  key: string
  kind: 'intro' | 'step' | 'outro'
  step?: number
  text: string
  language: string
  voice: string
  rate?: number
  pauseBeforeMs: number
  pauseAfterMs: number
}

function displayedText(step: VideoStep): string | undefined {
  if (step.type === 'narrate') return step.text
  if ('narrate' in step) return step.narrate
  return undefined
}

/** Applique les règles de prononciation de la langue (texte envoyé au TTS uniquement). */
export function pronounce(text: string, language: string): string {
  let out = text
  for (const [re, rep] of videoConfig.pronunciations[language] ?? []) out = out.replace(re, rep)
  return out
}

/** Nettoie un texte affiché pour la synthèse (symboles d'interface non prononçables). */
export function speakable(text: string): string {
  return text
    .replace(/[✕✓▶›→←↑↓]/g, ' ')
    .replace(/\bÉchap\b/g, 'Échap')
    .replace(/\s+/g, ' ')
    .trim()
}

export function voiceFor(scn: VideoScenario, n?: VideoNarration | null): string {
  const lang = n?.language ?? scn.video.language
  const key = n?.voice ?? scn.video.voice ?? videoConfig.defaultVoice[lang]
  if (!key) throw new Error(`Aucune voix configurée pour la langue « ${lang} »`)
  return key
}

export function collectNarrations(scn: VideoScenario): NarrationItem[] {
  const items: NarrationItem[] = []
  const base = videoConfig.narration
  const lang = scn.video.language
  if (scn.video.intro && scn.video.intro.narration) {
    items.push({ key: 'intro', kind: 'intro', text: scn.video.intro.narration, language: lang,
      voice: voiceFor(scn), pauseBeforeMs: 700, pauseAfterMs: 700 })
  }
  scn.scenario.steps.forEach((step, i) => {
    const meta = step.video
    if (meta?.narration === false) return
    const n = meta?.narration || undefined
    const text = n?.text ?? displayedText(step)
    if (!text || !text.trim()) return
    items.push({
      key: `step-${i}`, kind: 'step', step: i,
      text: speakable(text),
      language: n?.language ?? lang,
      voice: voiceFor(scn, n),
      rate: n?.rate,
      pauseBeforeMs: n?.pauseBeforeMs ?? base.pauseBeforeMs,
      pauseAfterMs: (n?.pauseAfterMs ?? base.pauseAfterMs) + (meta?.readingPause ?? 0),
    })
  })
  if (scn.video.outro && scn.video.outro.narration) {
    items.push({ key: 'outro', kind: 'outro', text: scn.video.outro.narration, language: lang,
      voice: voiceFor(scn), pauseBeforeMs: 700, pauseAfterMs: 1200 })
  }
  return items
}

/**
 * Découpe en phrases (ponctuation forte), sans couper « M. », « 18 h 42 »,
 * ni les points de suspension en milieu de phrase.
 */
export function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const out: string[] = []
  let cur = ''
  const tokens = clean.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Ý«"0-9])/u)
  for (const t of tokens) {
    cur = cur ? `${cur} ${t}` : t
    // Abréviations courantes : on ne coupe pas après elles.
    if (/\b(M|Mme|Dr|St|av|J\.-C|etc)\.$/.test(cur)) continue
    out.push(cur)
    cur = ''
  }
  if (cur) out.push(cur)
  return out
}

/**
 * Minutage estimé des mots d'une phrase : répartition proportionnelle au nombre
 * de caractères (ponctuation exclue). Utilisé uniquement si le moteur TTS ne
 * fournit pas d'alignements — signalé `wordTiming: 'estimated'`.
 */
export function estimateWords(sentence: string, durationMs: number): { word: string; start: number; end: number }[] {
  const words = sentence.split(/\s+/).filter(Boolean)
  const weight = (w: string) => Math.max(1, w.replace(/[^\p{L}\p{N}]/gu, '').length) + 1
  const total = words.reduce((s, w) => s + weight(w), 0)
  let acc = 0
  return words.map((word) => {
    const start = Math.round((acc / total) * durationMs)
    acc += weight(word)
    return { word, start, end: Math.round((acc / total) * durationMs) }
  })
}

/** Estimation de lecture (mode sans voix) — même règle que le moteur interactif. */
export function readingTimeMs(text: string): number {
  return Math.min(6500, Math.max(2200, text.length * 55))
}
