// ASTROR VIDEO STUDIO — interface en ligne de commande.
//
//   npm run video:list
//   npm run video:validate -- --scenario <id>
//   npm run video:audio    -- --scenario <id> [--force]
//   npm run video:record   -- --scenario <id> [--no-build] [--network replay|refresh|offline] [--headed]
//   npm run video:render   -- --scenario <id>
//   npm run video:generate -- --scenario <id>   (toutes les étapes, dans l'ordre)
//   npm run video:preview  -- --scenario <id>   (Remotion Studio)
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import type { VideoScenario } from '../types/video.types'
import { buildTimeline } from './build-timeline'
import { generateVoice } from './generate-voice'
import { files, paths, rel } from './lib/paths'
import { listScenarios, loadScenario } from './lib/scenarios'
import { StudioError, fmtMs, hasBinary, parseArgs, writeJson } from './lib/util'
import { record } from './record'
import { render } from './render'
import { validateScenario } from './validate'

const C = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  gold: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
}

function banner() { console.log(`\n${C.bold(C.gold('ASTROR VIDEO STUDIO'))}\n`) }

/** Exécute une étape numérotée « [i/n] Libellé ……… OK ». */
async function stage<T>(i: number, n: number, label: string, fn: (log: (m: string) => void) => Promise<T>): Promise<T> {
  const head = `[${i}/${n}] ${label}`.padEnd(40)
  const t0 = Date.now()
  process.stdout.write(head)
  let dirty = false
  const log = (m: string) => {
    if (!dirty) { process.stdout.write('\n'); dirty = true }
    console.log(C.dim(`      · ${m}`))
  }
  try {
    const r = await fn(log)
    const took = C.dim(`(${fmtMs(Date.now() - t0)})`)
    console.log(dirty ? `${' '.repeat(40)}${C.green('OK')} ${took}` : `${C.green('OK')} ${took}`)
    return r
  } catch (e) {
    console.log(dirty ? `${' '.repeat(40)}${C.red('ÉCHEC')}` : C.red('ÉCHEC'))
    throw e
  }
}

async function preflight(needs: { ffmpeg?: boolean }) {
  if (needs.ffmpeg && !(await hasBinary('ffmpeg'))) throw new StudioError('ffmpeg introuvable dans le PATH (apt install ffmpeg)')
  if (needs.ffmpeg && !(await hasBinary('ffprobe'))) throw new StudioError('ffprobe introuvable dans le PATH (apt install ffmpeg)')
}

function doValidate(scn: VideoScenario, log: (m: string) => void) {
  const r = validateScenario(scn)
  for (const w of r.warnings) log(`⚠ ${w}`)
  if (!r.ok) throw new StudioError(`Scénario invalide :\n${r.errors.map((e) => `  ✗ ${e}`).join('\n')}`)
  log(`${r.stats.steps} étapes, ${r.stats.narrations} narrations, durée estimée ≈ ${fmtMs(r.stats.estimatedMs)}`)
  return r
}

async function doAudio(scn: VideoScenario, force: boolean, log: (m: string) => void) {
  const m = await generateVoice(scn, { force, log })
  const total = m.segments.reduce((s, x) => s + x.totalMs, 0)
  log(`${m.segments.length} narrations, voix ${fmtMs(total)} · cache : ${m.cache.hits} réutilisé(s), ${m.cache.misses} généré(s)`)
  return m
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const cmd = args._[0]
  banner()

  switch (cmd) {
    case 'list': {
      for (const s of listScenarios()) {
        const st = [
          existsSync(files.voice(s.id)) ? 'voix' : null,
          existsSync(files.capture(s.id)) ? 'capture' : null,
          existsSync(files.mp4(s.id)) ? 'MP4' : null,
        ].filter(Boolean).join(', ')
        console.log(`  ${C.bold(s.id.padEnd(28))} ${s.video.title}`)
        console.log(C.dim(`  ${''.padEnd(28)} ${s.scenario.steps.length} étapes · ${s.video.language} · ${st || 'rien de produit'}`))
      }
      return
    }
    case 'validate': {
      const scn = loadScenario(args.scenario as string)
      await stage(1, 1, 'Validation du scénario', async (log) => doValidate(scn, log))
      return
    }
    case 'audio': {
      const scn = loadScenario(args.scenario as string)
      await preflight({ ffmpeg: true })
      await stage(1, 1, 'Génération de la voix', (log) => doAudio(scn, !!args.force, log))
      console.log(`\n${C.dim(rel(files.voice(scn.id)))}`)
      return
    }
    case 'record': {
      const scn = loadScenario(args.scenario as string)
      await preflight({ ffmpeg: true })
      const m = await stage(1, 1, 'Enregistrement du parcours', (log) => record(scn, {
        build: args['no-build'] !== true, network: args.network as 'replay', headed: !!args.headed, log }))
      console.log(`\n${C.dim(rel(files.screen(scn.id)))} — ${m.video.durationS} s, synchro ${m.sync.method}`)
      return
    }
    case 'timeline': {
      const scn = loadScenario(args.scenario as string)
      await stage(1, 1, 'Construction de la chronologie', async (log) => buildTimeline(scn, { log }))
      return
    }
    case 'render': {
      const scn = loadScenario(args.scenario as string)
      await preflight({ ffmpeg: true })
      await stage(1, 2, 'Composition de la vidéo', async (log) => buildTimeline(scn, { log }))
      const out = await stage(2, 2, 'Exportation MP4', (log) => render(scn, { log }))
      console.log(`\nVidéo générée :\n${C.bold(rel(out.mp4))}`)
      return
    }
    case 'generate': {
      const scn = loadScenario(args.scenario as string)
      await preflight({ ffmpeg: true })
      const N = 6
      await stage(1, N, 'Validation du scénario', async (log) => doValidate(scn, log))
      await stage(2, N, 'Préparation des données', async (log) => {
        log(`horloge simulée ${scn.video.clock} · ${scn.video.location?.city ?? 'Paris'} · réseau ${args.network ?? 'replay'}`)
      })
      await stage(3, N, 'Génération de la voix', (log) => doAudio(scn, !!args.force, log))
      await stage(4, N, 'Enregistrement du parcours', (log) => record(scn, {
        build: args['no-build'] !== true, network: args.network as 'replay', headed: !!args.headed, log }))
      await stage(5, N, 'Composition de la vidéo', async (log) => buildTimeline(scn, { log }))
      const out = await stage(6, N, 'Exportation MP4', (log) => render(scn, { log }))
      console.log(`\nVidéo générée :\n${C.bold(rel(out.mp4))}`)
      console.log(C.dim(`Sous-titres : ${rel(out.srt)} · ${rel(out.vtt)}\nChapitres  : ${rel(out.chapters)}\nRapport    : ${rel(out.report)}`))
      return
    }
    case 'preview': {
      const scn = loadScenario(args.scenario as string)
      const tl = files.timeline(scn.id)
      if (!existsSync(tl)) {
        await stage(1, 1, 'Construction de la chronologie', async (log) => buildTimeline(scn, { log }))
      }
      const { preparePublicDir } = await import('./render')
      const pub = await preparePublicDir(scn)
      const bin = path.join(paths.root, 'node_modules', '.bin', 'remotion')
      console.log(C.dim('Remotion Studio — Ctrl+C pour quitter'))
      spawn(bin, ['studio', path.join(paths.compositions, 'index.ts'), `--props=${tl}`, `--public-dir=${pub}`],
        { stdio: 'inherit', cwd: paths.root })
      return
    }
    default:
      console.log('Commandes : list | validate | audio | record | timeline | render | generate | preview')
      console.log(C.dim('Options   : --scenario <id> [--force] [--no-build] [--network replay|refresh|offline] [--headed]'))
      if (cmd) process.exitCode = 1
  }
}

main().catch((e) => {
  const err = e as StudioError
  console.error(`\n${C.red('✗ Production interrompue')} : ${err.message}`)
  if (err.details) console.error(C.dim(typeof err.details === 'string' ? err.details : JSON.stringify(err.details, null, 2)))
  const scnId = parseArgs(process.argv.slice(2)).scenario
  if (typeof scnId === 'string') {
    try {
      writeJson(files.report(scnId), { ok: false, error: err.message, details: err.details ?? null, at: new Date().toISOString() })
      console.error(C.dim(`Rapport : ${rel(files.report(scnId))}`))
    } catch { /* ignore */ }
  }
  process.exitCode = 1
})
