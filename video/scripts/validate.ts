// Validation statique d'un scénario vidéo, avant toute production :
//   - structure des étapes (types connus, champs requis) ;
//   - cibles data-demo-id réellement présentes dans le code source de l'app ;
//   - onglets / outils existants ;
//   - narrations présentes et langues/voix configurées ;
//   - métadonnées vidéo cohérentes (résolution, fps, horloge).
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { videoConfig } from '../config/video.config'
import type { VideoScenario } from '../types/video.types'
import { collectNarrations, readingTimeMs } from './lib/narration'
import { paths } from './lib/paths'

const TABS = ['sky', 'eph', 'explore', 'feed', 'tools', 'ai']
const TOOLS = ['observe', 'moon', 'planets', 'events', 'astrophoto', 'satellites', 'education', 'community', 'ai', 'extras']

export interface ValidationReport {
  ok: boolean
  errors: string[]
  warnings: string[]
  stats: { steps: number; narrations: number; estimatedMs: number }
}

/** Identifiants data-demo-id présents dans src/ : littéraux et motifs dynamiques connus. */
export function collectDemoIds(srcDir = paths.src): { exact: Set<string>; prefixes: string[] } {
  const exact = new Set<string>()
  const prefixes: string[] = []
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? (d.name === '__tests__' ? [] : walk(path.join(dir, d.name)))
      : /\.(jsx?|tsx?)$/.test(d.name) ? [path.join(dir, d.name)] : [])
  for (const f of walk(srcDir)) {
    const code = readFileSync(f, 'utf8')
    for (const m of code.matchAll(/data-demo-id="([^"]+)"/g)) exact.add(m[1])
    for (const m of code.matchAll(/demoId="([^"]+)"/g)) exact.add(m[1])
    for (const m of code.matchAll(/data-demo-id=\{i === 0 \? '([^']+)'/g)) exact.add(m[1])
    for (const m of code.matchAll(/data-demo-id=\{[^}]*?'([^'$]+)'\s*\}/g)) exact.add(m[1])
    for (const m of code.matchAll(/demoIdPrefix="([^"]+)"/g)) prefixes.push(`${m[1]}-`)
    for (const m of code.matchAll(/data-demo-id=\{`([a-z-]+)-\$\{/g)) prefixes.push(`${m[1]}-`)
  }
  // Motifs `tab-${key}` / `tool-${key}` : on les remplace par les valeurs connues.
  for (const t of TABS) exact.add(`tab-${t}`)
  for (const t of TOOLS) exact.add(`tool-${t}`)
  return { exact, prefixes: [...new Set(prefixes)].filter((p) => p !== 'tab-' && p !== 'tool-') }
}

export function validateScenario(scn: VideoScenario, ids = collectDemoIds()): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const v = scn.video

  if (!/^[a-z0-9-]+$/.test(scn.id)) errors.push(`id invalide « ${scn.id} » (minuscules, chiffres, tirets)`)
  if (!v.title?.trim()) errors.push('video.title manquant')
  if (!v.resolution || v.resolution.width % 2 || v.resolution.height % 2) errors.push('video.resolution doit avoir des dimensions paires')
  if (![24, 25, 30, 50, 60].includes(v.fps)) errors.push(`video.fps non standard : ${v.fps}`)
  if (!v.clock || Number.isNaN(Date.parse(v.clock))) errors.push('video.clock doit être une date ISO 8601 (ciel reproductible)')
  if (!videoConfig.defaultVoice[v.language] && !v.voice) errors.push(`Aucune voix configurée pour la langue « ${v.language} »`)
  for (const k of Object.keys(v.seed ?? {})) if (!k.startsWith('astror_')) errors.push(`seed : clé « ${k} » hors préfixe astror_`)

  const steps = scn.scenario.steps
  if (!steps.length) errors.push('Scénario vide')

  const targetOk = (t: string) => ids.exact.has(t) || ids.prefixes.some((p) => t.startsWith(p))
  steps.forEach((s, i) => {
    const where = `étape ${i} (${s.type})`
    switch (s.type) {
      case 'navigate':
        if (!s.to && !s.tool) errors.push(`${where} : « to » ou « tool » requis`)
        if (s.to && !TABS.includes(s.to)) errors.push(`${where} : onglet inconnu « ${s.to} »`)
        if (s.tool && !TOOLS.includes(s.tool)) errors.push(`${where} : outil inconnu « ${s.tool} »`)
        break
      case 'click': case 'highlight': case 'type':
        if (!s.target) errors.push(`${where} : « target » requis`)
        else if (!targetOk(s.target)) errors.push(`${where} : data-demo-id « ${s.target} » absent du code source (src/)`)
        if (s.type === 'type' && !s.text) errors.push(`${where} : « text » requis`)
        break
      case 'wait':
        if (!(s.ms > 0)) errors.push(`${where} : « ms » > 0 requis`)
        break
      case 'narrate':
        if (!s.text?.trim()) errors.push(`${where} : « text » requis`)
        break
      default:
        errors.push(`${where} : type d'étape inconnu`)
    }
    if (s.video?.zoom != null && (s.video.zoom < 1 || s.video.zoom > 1.6)) warnings.push(`${where} : zoom ${s.video.zoom} hors plage conseillée [1 ; 1.6]`)
    if (s.video?.zoom && s.type !== 'highlight' && s.type !== 'click') warnings.push(`${where} : zoom sans élément ciblé, ignoré`)
  })

  let narr: ReturnType<typeof collectNarrations> = []
  try { narr = collectNarrations(scn) } catch (e) { errors.push((e as Error).message) }
  for (const n of narr) {
    const voice = (videoConfig.voices as Record<string, { language: string }>)[n.voice]
    if (!voice) errors.push(`${n.key} : voix inconnue « ${n.voice} »`)
    else if (voice.language !== n.language) errors.push(`${n.key} : voix « ${n.voice} » ≠ langue « ${n.language} »`)
    if (n.text.length > 320) warnings.push(`${n.key} : narration longue (${n.text.length} car.), à découper`)
  }
  if (v.voiceEnabled && !narr.length) errors.push('voiceEnabled est vrai mais aucune narration')

  const chapters = steps.filter((s) => s.video?.chapter).length
  if (!chapters) warnings.push('Aucun chapitre (video.chapter) : pas de chapitrage YouTube')

  const estimatedMs = narr.reduce((s, n) => s + readingTimeMs(n.text) + n.pauseBeforeMs + n.pauseAfterMs, 0)
    + steps.length * videoConfig.capture.breathMs
  return { ok: errors.length === 0, errors, warnings, stats: { steps: steps.length, narrations: narr.length, estimatedMs } }
}
