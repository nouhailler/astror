// Génération de la narration vocale d'un scénario.
//
// Pour chaque narration : découpage en phrases → synthèse locale (Piper) d'un
// WAV par phrase → mesure de la durée RÉELLE (ffprobe) → manifeste voice.json.
// Le cache est adressé par contenu : empreinte(moteur, version, modèle, débit,
// volume, langue, texte). Un texte modifié invalide donc sa seule phrase.
import { existsSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { videoConfig, type VoiceConfig } from '../config/video.config'
import type { VideoScenario, VoiceManifest, VoiceSegment, VoiceSentence } from '../types/video.types'
import { collectNarrations, splitSentences, estimateWords, readingTimeMs, pronounce } from './lib/narration'
import { files, paths } from './lib/paths'
import { StudioError, ensureDir, mediaDurationMs, readJson, sha256, writeJson } from './lib/util'
import { getTtsEngine, type TtsEngine, type TtsRequest } from './tts/engine'

export interface VoiceOptions {
  force?: boolean
  /** Remplace le moteur configuré (tests). */
  engine?: TtsEngine
  cacheDir?: string
  manifestFile?: string
  log?: (msg: string) => void
}

interface CacheMeta { text: string; durationMs: number; alignments: boolean; engine: string; createdAt: string }

function voiceConf(key: string): VoiceConfig {
  const v = (videoConfig.voices as Record<string, VoiceConfig>)[key]
  if (!v) throw new StudioError(`Voix inconnue : « ${key} » (voir video/config/video.config.ts)`)
  return v
}

export async function generateVoice(scn: VideoScenario, opts: VoiceOptions = {}): Promise<VoiceManifest> {
  const log = opts.log ?? (() => {})
  const cacheDir = ensureDir(opts.cacheDir ?? paths.ttsCache)
  const items = collectNarrations(scn)
  const manifestFile = opts.manifestFile ?? files.voice(scn.id)

  // Mode sans voix : durées estimées, aucune synthèse.
  if (!scn.video.voiceEnabled) {
    const segments: VoiceSegment[] = items.map((it) => {
      const sentences = splitSentences(it.text)
      let offset = it.pauseBeforeMs
      const out: VoiceSentence[] = sentences.map((text) => {
        const d = readingTimeMs(text)
        const s: VoiceSentence = { text, file: '', hash: '', offsetMs: offset, durationMs: d,
          words: estimateWords(text, d), wordTiming: 'estimated' }
        offset += d + 200
        return s
      })
      const speechMs = Math.max(0, offset - 200 - it.pauseBeforeMs)
      return { key: it.key, kind: it.kind, step: it.step, text: it.text, language: it.language, voice: 'none',
        pauseBeforeMs: it.pauseBeforeMs, pauseAfterMs: it.pauseAfterMs, speechMs,
        totalMs: it.pauseBeforeMs + speechMs + it.pauseAfterMs, sentences: out }
    })
    const manifest: VoiceManifest = { scenarioId: scn.id, engine: 'none', generatedAt: new Date().toISOString(),
      voiceEnabled: false, segments, cache: { hits: 0, misses: 0 } }
    writeJson(manifestFile, manifest)
    return manifest
  }

  // Résolution des moteurs et vérification de l'installation.
  const byEngine = new Map<string, TtsEngine>()
  const engineFor = (v: VoiceConfig) => {
    const e = opts.engine ?? getTtsEngine(v.engine)
    byEngine.set(e.id, e)
    return e
  }
  const voices = [...new Set(items.map((i) => i.voice))].map(voiceConf)
  for (const v of voices) await engineFor(v).check([v])

  // Plan : une entrée par phrase, avec son empreinte.
  interface Planned { seg: number; text: string; spoken: string; hash: string; wav: string; meta: string; voice: VoiceConfig; rate?: number; engine: TtsEngine }
  const planned: Planned[] = []
  for (const [segIdx, it] of items.entries()) {
    const voice = voiceConf(it.voice)
    if (voice.language !== it.language) {
      throw new StudioError(`La voix « ${it.voice} » (${voice.language}) ne correspond pas à la langue « ${it.language} » (${it.key})`)
    }
    const engine = engineFor(voice)
    const ver = await engine.version()
    for (const text of splitSentences(it.text)) {
      const spoken = pronounce(text, it.language)
      const hash = sha256(engine.id, ver, voice.model, engine.modelFingerprint(voice),
        (voice.rate || 1) * (it.rate || 1), voice.volume ?? 1, it.language, spoken).slice(0, 24)
      planned.push({ seg: segIdx, text, spoken, hash, wav: path.join(cacheDir, `${hash}.wav`),
        meta: path.join(cacheDir, `${hash}.json`), voice, rate: it.rate, engine })
    }
  }

  // Synthèse des phrases absentes du cache (ou forcées, ou dont le WAV a disparu).
  const missing = planned.filter((p) => opts.force || !existsSync(p.wav) || !existsSync(p.meta))
  const unique = [...new Map(missing.map((p) => [p.hash, p])).values()]
  if (unique.length) log(`synthèse de ${unique.length} phrase(s)…`)
  for (const engine of byEngine.values()) {
    const reqs: TtsRequest[] = unique.filter((p) => p.engine === engine)
      .map((p) => ({ text: p.spoken, voice: p.voice, rate: p.rate, out: p.wav }))
    let results
    try {
      results = await engine.synthesize(reqs)
    } catch (e) {
      for (const r of reqs) if (existsSync(r.out)) unlinkSync(r.out)   // pas de fichier partiel en cache
      throw e instanceof StudioError ? e : new StudioError(`Échec de génération vocale : ${(e as Error).message}`)
    }
    for (const r of results) {
      const p = unique.find((u) => u.wav === r.out)!
      if (!existsSync(r.out)) throw new StudioError(`Fichier audio non produit : ${r.out}`)
      const durationMs = await mediaDurationMs(r.out)
      const meta: CacheMeta = { text: p.spoken, durationMs, alignments: r.alignments, engine: engine.id, createdAt: new Date().toISOString() }
      writeJson(p.meta, meta)
    }
  }

  // Assemblage du manifeste avec les durées réelles.
  const segments: VoiceSegment[] = []
  for (const [segIdx, it] of items.entries()) {
    const voice = voiceConf(it.voice)
    const mine = planned.filter((p) => p.seg === segIdx)
    let offset = it.pauseBeforeMs
    const sentences: VoiceSentence[] = []
    for (const [k, p] of mine.entries()) {
      if (!existsSync(p.wav)) throw new StudioError(`Fichier audio manquant après génération : ${p.wav}`)
      const meta = readJson<CacheMeta>(p.meta, 'métadonnées audio')
      // Durée re-mesurée : détecte un WAV tronqué ou remplacé.
      const durationMs = await mediaDurationMs(p.wav)
      if (Math.abs(durationMs - meta.durationMs) > 20) {
        throw new StudioError(`Cache audio incohérent pour « ${p.text.slice(0, 40)}… » : relancer avec --force`)
      }
      sentences.push({
        text: p.text, file: path.relative(paths.video, p.wav), hash: p.hash, offsetMs: offset, durationMs,
        words: estimateWords(p.text, durationMs), wordTiming: 'estimated',
      })
      offset += durationMs + (k < mine.length - 1 ? voice.sentenceGapMs : 0)
    }
    const speechMs = offset - it.pauseBeforeMs
    segments.push({
      key: it.key, kind: it.kind, step: it.step, text: it.text, language: it.language, voice: it.voice,
      pauseBeforeMs: it.pauseBeforeMs, pauseAfterMs: it.pauseAfterMs, speechMs,
      totalMs: it.pauseBeforeMs + speechMs + it.pauseAfterMs, sentences,
    })
  }

  const manifest: VoiceManifest = {
    scenarioId: scn.id,
    engine: [...byEngine.keys()].join(','),
    generatedAt: new Date().toISOString(),
    voiceEnabled: true,
    segments,
    cache: { hits: planned.length - missing.length, misses: missing.length },
  }
  writeJson(manifestFile, manifest)
  return manifest
}

/** Durées minimales d'étape pour le moteur (mode capture), par index d'étape. */
export function holdsFromManifest(m: VoiceManifest): Record<number, number> {
  const out: Record<number, number> = {}
  for (const s of m.segments) if (s.kind === 'step' && s.step != null) out[s.step] = s.totalMs
  return out
}
