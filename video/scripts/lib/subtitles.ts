// Sous-titres : découpage en répliques de 1 à 2 lignes, export SRT / WebVTT,
// chapitrage YouTube. Les horodatages viennent de la chronologie réelle.
import type { TimelineCue } from '../../types/video.types'

export interface CueSource {
  text: string
  startMs: number
  endMs: number
  /** Minutage des mots relatif à startMs (pour couper une longue phrase). */
  words?: { word: string; start: number }[]
}

/** Répartit des mots sur `maxLines` lignes de `maxChars` caractères max. */
export function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w
    else { lines.push(cur); cur = w }
  }
  if (cur) lines.push(cur)
  return lines
}

/** Équilibre deux lignes (évite une 2e ligne d'un seul mot). */
function balance(lines: string[], maxChars: number): string[] {
  if (lines.length !== 2) return lines
  const all = lines.join(' ').split(' ')
  let best = lines
  let bestDiff = Math.abs(lines[0].length - lines[1].length)
  for (let k = 1; k < all.length; k++) {
    const a = all.slice(0, k).join(' ')
    const b = all.slice(k).join(' ')
    if (a.length > maxChars || b.length > maxChars) continue
    const d = Math.abs(a.length - b.length)
    if (d < bestDiff) { best = [a, b]; bestDiff = d }
  }
  return best
}

export function buildCues(sources: CueSource[], opts: { maxCharsPerLine: number; maxLines: number; minCueMs: number }): TimelineCue[] {
  const cues: TimelineCue[] = []
  const sorted = [...sources].sort((a, b) => a.startMs - b.startMs)
  sorted.forEach((src, si) => {
    const nextStart = sorted[si + 1]?.startMs ?? Infinity
    const lines = wrapLines(src.text, opts.maxCharsPerLine)
    // Paquets de maxLines lignes ; chaque paquet commence au premier de ses mots.
    const chunks: string[][] = []
    for (let i = 0; i < lines.length; i += opts.maxLines) chunks.push(lines.slice(i, i + opts.maxLines))
    const words = src.words ?? []
    let wordIdx = 0
    const starts = chunks.map((chunk, ci) => {
      if (ci === 0) return src.startMs
      const nPrev = chunks.slice(0, ci).flat().join(' ').split(/\s+/).length
      wordIdx = nPrev
      const w = words[wordIdx]
      if (w) return src.startMs + w.start
      // Repli : proportionnel au nombre de caractères.
      const before = chunks.slice(0, ci).flat().join(' ').length
      const total = lines.join(' ').length
      return src.startMs + Math.round(((src.endMs - src.startMs) * before) / total)
    })
    chunks.forEach((chunk, ci) => {
      const start = starts[ci]
      let end = ci + 1 < chunks.length ? starts[ci + 1] : src.endMs
      // Prolonge un peu la dernière réplique pour la lecture, sans chevaucher la suivante.
      if (ci === chunks.length - 1) end = Math.min(Math.max(end + 300, start + opts.minCueMs), nextStart - 40)
      end = Math.max(end, start + 200)
      cues.push({ index: cues.length + 1, startMs: Math.round(start), endMs: Math.round(end), lines: balance(chunk, opts.maxCharsPerLine) })
    })
  })
  return cues
}

function ts(ms: number, sep: ',' | '.'): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const r = Math.round(ms % 1000)
  const p = (n: number, l = 2) => String(n).padStart(l, '0')
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(r, 3)}`
}

export function toSrt(cues: TimelineCue[]): string {
  return cues.map((c, i) => `${i + 1}\n${ts(c.startMs, ',')} --> ${ts(c.endMs, ',')}\n${c.lines.join('\n')}\n`).join('\n')
}

export function toVtt(cues: TimelineCue[]): string {
  return 'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${ts(c.startMs, '.')} --> ${ts(c.endMs, '.')} line:88%\n${c.lines.join('\n')}\n`).join('\n')
}

/** Chapitrage au format description YouTube (premier chapitre à 00:00). */
export function toYoutubeChapters(chapters: { title: string; startMs: number }[]): string {
  const fmt = (ms: number) => {
    const t = Math.floor(ms / 1000)
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return chapters.map((c) => `${fmt(c.startMs)} ${c.title}`).join('\n') + '\n'
}
