// Rendu final avec Remotion (H.264 + AAC) puis vérification de l'export :
// codec, résolution, cadence, présence et niveau de l'audio, durée attendue.
import { copyFileSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { videoConfig } from '../config/video.config'
import type { Timeline, VideoScenario } from '../types/video.types'
import { files, paths, rel } from './lib/paths'
import { StudioError, ensureDir, ffprobe, readJson, run, writeJson } from './lib/util'

export interface RenderOptions { log?: (m: string) => void }

export interface RenderOutput { mp4: string; srt: string; vtt: string; chapters: string; report: string }

/** Rassemble les médias servis à Remotion (staticFile) dans build/<id>/public. */
export async function preparePublicDir(scn: VideoScenario): Promise<string> {
  const pub = path.join(paths.build(scn.id), 'public')
  rmSync(pub, { recursive: true, force: true })
  ensureDir(path.join(pub, 'audio'))
  const screen = files.screen(scn.id)
  if (!existsSync(screen)) throw new StudioError(`Enregistrement absent : ${rel(screen)} (lancer « npm run video:record »)`)
  copyFileSync(screen, path.join(pub, 'screen.mp4'))
  const tl = readJson<Timeline>(files.timeline(scn.id), 'Chronologie')
  for (const s of tl.sentences) {
    if (!s.src) continue
    const src = path.join(paths.ttsCache, path.basename(s.src))
    if (!existsSync(src)) throw new StudioError(`Fichier audio manquant : ${rel(src)} (relancer « npm run video:audio »)`)
    copyFileSync(src, path.join(pub, s.src))
  }
  for (const f of ['logo.svg', 'swinux-logo.png']) {
    const p = path.join(paths.assets, f)
    if (existsSync(p)) copyFileSync(p, path.join(pub, f))
  }
  return pub
}

/** Volume moyen (dB) d'une piste audio, via le filtre volumedetect. */
async function meanVolumeDb(file: string): Promise<number> {
  const r = await run('ffmpeg', ['-v', 'info', '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-'])
  const m = r.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/)
  return m ? Number(m[1]) : -Infinity
}

export interface ExportCheck { ok: boolean; problems: string[]; facts: Record<string, unknown> }

export async function verifyExport(mp4: string, tl: Timeline): Promise<ExportCheck> {
  const problems: string[] = []
  const p = await ffprobe(mp4)
  const v = p.streams.find((s) => s.codec_type === 'video')
  const a = p.streams.find((s) => s.codec_type === 'audio')
  const duration = Number(p.format.duration)
  const expected = tl.durationInFrames / tl.fps
  if (!v) problems.push('aucune piste vidéo')
  else {
    if (v.codec_name !== 'h264') problems.push(`codec vidéo ${v.codec_name} ≠ h264`)
    if (v.width !== tl.width || v.height !== tl.height) problems.push(`résolution ${v.width}×${v.height} ≠ ${tl.width}×${tl.height}`)
    const [num, den] = (v.r_frame_rate ?? '0/1').split('/').map(Number)
    if (Math.abs(num / den - tl.fps) > 0.01) problems.push(`cadence ${v.r_frame_rate} ≠ ${tl.fps}`)
  }
  const hasVoice = tl.sentences.some((s) => s.src)
  let vol: number | null = null
  if (hasVoice) {
    if (!a) problems.push('aucune piste audio alors que la narration est activée')
    else {
      if (a.codec_name !== 'aac') problems.push(`codec audio ${a.codec_name} ≠ aac`)
      vol = await meanVolumeDb(mp4)
      if (vol < -45) problems.push(`piste audio quasi muette (${vol} dB)`)
    }
  }
  if (Math.abs(duration - expected) > 0.15) problems.push(`durée ${duration.toFixed(2)} s ≠ attendue ${expected.toFixed(2)} s (séquence manquante ?)`)
  // Lisibilité : décodage complet du fichier.
  const dec = await run('ffmpeg', ['-v', 'error', '-i', mp4, '-f', 'null', '-'])
  if (dec.code !== 0 || dec.stderr.trim()) problems.push(`erreurs de décodage : ${dec.stderr.trim().slice(0, 300)}`)
  return {
    ok: problems.length === 0,
    problems,
    facts: { durationS: +duration.toFixed(3), expectedS: +expected.toFixed(3), video: v ? `${v.codec_name} ${v.width}×${v.height} @ ${v.r_frame_rate}` : null,
      audio: a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch` : null, meanVolumeDb: vol },
  }
}

export async function render(scn: VideoScenario, opts: RenderOptions = {}): Promise<RenderOutput> {
  const log = opts.log ?? (() => {})
  const tl = readJson<Timeline>(files.timeline(scn.id), 'Chronologie')
  const pub = await preparePublicDir(scn)
  const { bundle } = await import('@remotion/bundler')
  const { renderMedia, selectComposition } = await import('@remotion/renderer')

  log('préparation de la composition (bundle Remotion)…')
  const serveUrl = await bundle({
    entryPoint: path.join(paths.compositions, 'index.ts'),
    publicDir: pub,
    outDir: path.join(paths.build(scn.id), 'bundle'),
  })
  const inputProps = tl as unknown as Record<string, unknown>
  const composition = await selectComposition({ serveUrl, id: 'AstrorTutorial', inputProps })
  ensureDir(paths.output)
  const mp4 = files.mp4(scn.id)
  const tmp = `${mp4}.partial.mp4`
  rmSync(tmp, { force: true })
  let lastPct = -10
  await renderMedia({
    composition, serveUrl, inputProps, codec: 'h264', audioCodec: 'aac', crf: videoConfig.output.crf,
    pixelFormat: 'yuv420p', outputLocation: tmp, concurrency: videoConfig.output.concurrency,
    chromiumOptions: { gl: 'swangle' },
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100)
      if (pct >= lastPct + 10) { lastPct = pct; log(`rendu ${pct} %`) }
    },
  })

  // Un export n'est publié que s'il passe toutes les vérifications.
  const check = await verifyExport(tmp, tl)
  const report = {
    ok: check.ok, scenario: scn.id, title: scn.video.title, at: new Date().toISOString(),
    output: rel(mp4), checks: check, chapters: tl.chapters.length, cues: tl.cues.length, sentences: tl.sentences.length,
  }
  writeJson(files.report(scn.id), report)
  if (!check.ok) {
    throw new StudioError(`Export refusé :\n${check.problems.map((p) => `  ✗ ${p}`).join('\n')}`, { partial: rel(tmp) })
  }
  rmSync(mp4, { force: true })
  copyFileSync(tmp, mp4)
  rmSync(tmp, { force: true })
  log(`${check.facts.video} · ${check.facts.audio ?? 'sans audio'} · ${check.facts.durationS} s`)
  return { mp4, srt: files.srt(scn.id), vtt: files.vtt(scn.id), chapters: files.chapters(scn.id), report: files.report(scn.id) }
}
