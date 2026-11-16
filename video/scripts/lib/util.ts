// Utilitaires communs : erreurs explicites, processus, JSON, empreintes, ffprobe.
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

/** Erreur de production : arrête proprement le pipeline avec un message lisible. */
export class StudioError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message)
    this.name = 'StudioError'
  }
}

export function ensureDir(dir: string): string {
  mkdirSync(dir, { recursive: true })
  return dir
}

export function readJson<T>(file: string, what = 'fichier'): T {
  if (!existsSync(file)) throw new StudioError(`${what} introuvable : ${file}`)
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  } catch (e) {
    throw new StudioError(`${what} illisible (${file}) : ${(e as Error).message}`)
  }
}

export function writeJson(file: string, data: unknown): void {
  ensureDir(path.dirname(file))
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

export function sha256(...parts: (string | number | Buffer)[]): string {
  const h = createHash('sha256')
  for (const p of parts) { h.update(typeof p === 'number' ? String(p) : p); h.update('\0') }
  return h.digest('hex')
}

export interface RunResult { code: number; stdout: string; stderr: string }

/** Lance une commande et collecte stdout/stderr (stdin optionnel). */
export function run(cmd: string, args: string[], opts: { input?: string; cwd?: string; quiet?: boolean } = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: opts.cwd, stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    p.stdout.on('data', (d) => { stdout += d })
    p.stderr.on('data', (d) => { stderr += d })
    p.on('error', (e) => reject(new StudioError(`Impossible de lancer « ${cmd} » : ${e.message}`)))
    p.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }))
    if (opts.input != null) p.stdin.end(opts.input)
    else p.stdin.end()
  })
}

export async function runOk(cmd: string, args: string[], opts: { input?: string; cwd?: string } = {}): Promise<RunResult> {
  const r = await run(cmd, args, opts)
  if (r.code !== 0) {
    throw new StudioError(`« ${cmd} ${args.slice(0, 4).join(' ')}… » a échoué (code ${r.code})`, r.stderr.slice(-2000))
  }
  return r
}

export interface ProbeStream {
  codec_type: string; codec_name: string; width?: number; height?: number
  r_frame_rate?: string; sample_rate?: string; channels?: number; nb_frames?: string
}
export interface Probe { streams: ProbeStream[]; format: { duration: string; bit_rate?: string } }

export async function ffprobe(file: string): Promise<Probe> {
  if (!existsSync(file)) throw new StudioError(`Fichier média introuvable : ${file}`)
  const r = await runOk('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file])
  return JSON.parse(r.stdout) as Probe
}

/** Durée réelle d'un média (ms), mesurée par ffprobe. */
export async function mediaDurationMs(file: string): Promise<number> {
  const p = await ffprobe(file)
  const d = Number(p.format.duration)
  if (!Number.isFinite(d) || d <= 0) throw new StudioError(`Durée invalide pour ${file}`)
  return Math.round(d * 1000)
}

export async function hasBinary(cmd: string): Promise<boolean> {
  try {
    const r = await run(cmd, ['-version'])
    return r.code === 0
  } catch {
    return false
  }
}

export function parseArgs(argv: string[]): { _: string[]; [k: string]: string | boolean | string[] } {
  const out: { _: string[]; [k: string]: string | boolean | string[] } = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=', 2)
      if (v != null) out[k] = v
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i]
      else out[k] = true
    } else out._.push(a)
  }
  return out
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function fmtMs(ms: number): string {
  const s = Math.round(ms / 100) / 10
  return s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${s} s`
}
