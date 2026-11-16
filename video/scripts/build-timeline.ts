// Construction de la chronologie finale à partir :
//   - du manifeste de voix (durées audio réelles) ;
//   - du manifeste de capture (événements horodatés dans screen.mp4).
// Chaque phrase est placée à l'instant exact où sa narration est apparue dans
// l'enregistrement (narration:show) + sa position dans le segment. Rien n'est
// supposé : une narration sans événement correspondant est une erreur.
import { writeFileSync } from 'node:fs'
import { videoConfig } from '../config/video.config'
import type {
  CaptureManifest, Timeline, TimelineSentence, VideoScenario, VoiceManifest, VoiceSegment,
} from '../types/video.types'
import { files, paths, rel } from './lib/paths'
import { buildCues, toSrt, toVtt, toYoutubeChapters, type CueSource } from './lib/subtitles'
import { StudioError, ensureDir, readJson, writeJson } from './lib/util'
import { loadVoiceFor } from './record'
import { generateVoice } from './generate-voice'

export interface TimelineOptions {
  voice?: VoiceManifest
  capture?: CaptureManifest
  writeFiles?: boolean
  log?: (m: string) => void
}

export async function buildTimeline(scn: VideoScenario, opts: TimelineOptions = {}): Promise<Timeline> {
  const fps = scn.video.fps
  const F = (ms: number) => Math.round((ms / 1000) * fps)
  const voice = opts.voice ?? loadVoiceFor(scn) ?? (await generateVoice(scn))   // sans voix : estimations
  const cap = opts.capture ?? readJson<CaptureManifest>(files.capture(scn.id), 'Manifeste de capture (lancer « npm run video:record »)')
  if (!cap.ok) throw new StudioError(`La capture a échoué : ${cap.error}`)
  const seg = (key: string) => voice.segments.find((s) => s.key === key)
  const sentences: TimelineSentence[] = []
  const cueSrc: CueSource[] = []
  const audioSrc = (file: string) => (file ? `audio/${file.split('/').pop()}` : '')

  const place = (s: VoiceSegment, segStartFrame: number, subtitle?: string) => {
    for (const x of s.sentences) {
      const from = segStartFrame + F(x.offsetMs)
      sentences.push({
        text: x.text, src: audioSrc(x.file), from, durationInFrames: Math.max(1, F(x.durationMs)), segment: s.key,
        words: x.words.map((w) => ({ word: w.word, from: from + F(w.start) })),
      })
    }
    if (subtitle) {
      const first = s.sentences[0]; const last = s.sentences.at(-1)
      if (first && last) {
        cueSrc.push({ text: subtitle, startMs: ((segStartFrame / fps) * 1000) + first.offsetMs,
          endMs: ((segStartFrame / fps) * 1000) + last.offsetMs + last.durationMs })
      }
    } else {
      for (const x of s.sentences) {
        const start = (segStartFrame / fps) * 1000 + x.offsetMs
        cueSrc.push({ text: x.text, startMs: start, endMs: start + x.durationMs, words: x.words })
      }
    }
  }

  // ── Introduction ───────────────────────────────────────────────────────
  let cursor = 0
  let intro: Timeline['intro'] = null
  if (scn.video.intro) {
    const s = seg('intro')
    const dur = Math.max(F(scn.video.intro.minDurationMs ?? 4500), s ? F(s.totalMs) : 0)
    intro = { from: 0, durationInFrames: dur, card: scn.video.intro }
    if (s) place(s, 0)
    cursor = dur
  }

  // ── Corps : passage utile de l'enregistrement ─────────────────────────────
  const ev = cap.events
  const start = ev.find((e) => e.type === 'scenario:start')
  const end = ev.find((e) => e.type === 'scenario:end')
  if (!start || !end) throw new StudioError('Capture incomplète : scenario:start / scenario:end absents')
  const trimStartS = Math.max(0, start.videoT - 0.1)
  const endS = Math.min(cap.video.durationS - 0.05, end.videoT + Math.min(1.0, videoConfig.capture.tailMs / 1000))
  if (endS <= trimStartS) throw new StudioError('Capture vide (fin avant le début)')
  const bodyFrom = cursor
  const bodyDur = F((endS - trimStartS) * 1000)
  const atBody = (videoT: number) => bodyFrom + F((videoT - trimStartS) * 1000)

  for (const s of voice.segments.filter((x) => x.kind === 'step')) {
    const show = ev.find((e) => e.type === 'narration:show' && e.step === s.step)
    if (!show) throw new StudioError(`Séquence manquante : aucune narration affichée pour l'étape ${s.step} dans l'enregistrement`)
    const step = scn.scenario.steps[s.step!]
    place(s, atBody(show.videoT), step.video?.subtitle)
  }
  cursor = bodyFrom + bodyDur

  // ── Conclusion ───────────────────────────────────────────────────────────
  let outro: Timeline['outro'] = null
  if (scn.video.outro) {
    const s = seg('outro')
    const dur = Math.max(F(scn.video.outro.minDurationMs ?? 7000), s ? F(s.totalMs) : 0)
    outro = { from: cursor, durationInFrames: dur, card: scn.video.outro }
    if (s) place(s, cursor)
    cursor += dur
  }

  // ── Contrôles de synchronisation ─────────────────────────────────────────
  sentences.sort((a, b) => a.from - b.from)
  for (let i = 1; i < sentences.length; i++) {
    const prev = sentences[i - 1]
    const overlap = prev.from + prev.durationInFrames - sentences[i].from
    if (overlap > 2) {
      throw new StudioError(`Narrations superposées (${overlap} images) : « ${prev.text.slice(0, 40)}… » et « ${sentences[i].text.slice(0, 40)}… »`)
    }
  }
  for (const s of sentences.filter((x) => x.segment.startsWith('step-'))) {
    if (s.from + s.durationInFrames > bodyFrom + bodyDur + 1) {
      throw new StudioError(`La narration « ${s.text.slice(0, 40)}… » dépasse la fin de l'enregistrement`)
    }
  }

  // ── Chapitres, zooms, transitions ───────────────────────────────────────
  const chapters: Timeline['chapters'] = []
  if (intro) chapters.push({ title: 'Introduction', from: 0 })
  scn.scenario.steps.forEach((st, i) => {
    const title = st.video?.chapter ?? (i === 0 ? scn.video.firstChapter : undefined)
    if (!title) return
    const e = ev.find((x) => x.type === 'step:start' && x.step === i)
    if (e) chapters.push({ title, from: Math.max(bodyFrom, atBody(e.videoT)) })
  })
  if (outro) chapters.push({ title: 'Conclusion', from: outro.from })
  if (chapters.length && chapters[0].from !== 0) chapters[0].from = 0

  const zooms: Timeline['zooms'] = []
  const transitions: Timeline['transitions'] = []
  scn.scenario.steps.forEach((st, i) => {
    if (st.video?.zoom && st.video.zoom > 1) {
      const hl = ev.find((x) => x.type === 'highlight:show' && x.step === i)
      const stepEnd = ev.find((x) => x.type === 'step:end' && x.step === i)
      const d = hl?.data as { rect?: { x: number; y: number; width: number; height: number }; viewport?: { width: number; height: number } } | undefined
      if (hl && stepEnd && d?.rect && d.viewport) {
        zooms.push({ from: atBody(hl.videoT), to: atBody(stepEnd.videoT), scale: st.video.zoom,
          cx: (d.rect.x + d.rect.width / 2) / d.viewport.width, cy: (d.rect.y + d.rect.height / 2) / d.viewport.height })
      }
    }
    const tr = st.video?.transition
    if (tr === 'fade' || tr === 'slide') {
      const e = ev.find((x) => x.type === 'step:start' && x.step === i)
      if (e) transitions.push({ at: atBody(e.videoT), kind: tr })
    }
  })

  const cues = buildCues(cueSrc, videoConfig.subtitles)
  const tl: Timeline = {
    id: scn.id,
    title: scn.video.title,
    description: scn.video.description,
    language: scn.video.language,
    fps,
    width: scn.video.resolution.width,
    height: scn.video.resolution.height,
    durationInFrames: cursor,
    intro,
    body: { from: bodyFrom, durationInFrames: bodyDur, src: 'screen.mp4', trimStartFrames: F(trimStartS * 1000),
      screen: { width: cap.video.width, height: cap.video.height } },
    outro,
    sentences,
    chapters,
    zooms,
    transitions,
    cues,
    subtitles: { burnIn: scn.video.subtitles?.burnIn ?? videoConfig.subtitles.burnIn },
  }

  if (opts.writeFiles !== false) {
    writeJson(files.timeline(scn.id), tl)
    ensureDir(paths.output)
    if (scn.video.subtitles?.export !== false) {
      writeFileSync(files.srt(scn.id), toSrt(cues))
      writeFileSync(files.vtt(scn.id), toVtt(cues))
    }
    writeFileSync(files.chapters(scn.id), toYoutubeChapters(chapters.map((c) => ({ title: c.title, startMs: (c.from / fps) * 1000 }))))
    opts.log?.(`${(cursor / fps).toFixed(1)} s · ${sentences.length} phrases · ${cues.length} sous-titres · ${chapters.length} chapitres → ${rel(files.timeline(scn.id))}`)
  }
  return tl
}
