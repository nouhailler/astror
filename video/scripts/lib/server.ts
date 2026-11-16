// Build de production + serveur local `vite preview` pour la capture.
// On filme le build de production (pas le serveur de dev) : pas de HMR, pas de
// double montage StrictMode, code identique à celui servi aux utilisateurs.
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { videoConfig } from '../../config/video.config'
import { paths } from './paths'
import { StudioError, runOk, sleep } from './util'

const VITE = path.join(paths.root, 'node_modules', 'vite', 'bin', 'vite.js')

export async function buildApp(): Promise<void> {
  await runOk(process.execPath, [VITE, 'build', '--logLevel', 'error'], { cwd: paths.root })
  if (!existsSync(path.join(paths.dist, 'index.html'))) throw new StudioError('Build de l’app incomplet : dist/index.html absent')
}

export interface AppServer { url: string; stop: () => void }

export async function startPreview(port = videoConfig.app.port): Promise<AppServer> {
  if (!existsSync(path.join(paths.dist, 'index.html'))) throw new StudioError('dist/ absent : lancer sans --no-build')
  const host = videoConfig.app.host
  const url = `http://${host}:${port}`
  let proc: ChildProcess | null = spawn(process.execPath,
    [VITE, 'preview', '--port', String(port), '--strictPort', '--host', host], { cwd: paths.root, stdio: ['ignore', 'pipe', 'pipe'] })
  let stderr = ''
  proc.stderr?.on('data', (d) => { stderr += d })
  let exited = false
  proc.on('exit', () => { exited = true })
  const stop = () => { if (proc && !exited) proc.kill('SIGTERM'); proc = null }
  const t0 = Date.now()
  while (Date.now() - t0 < 20000) {
    if (exited) throw new StudioError(`Le serveur local n’a pas démarré (port ${port} occupé ?)`, stderr)
    try {
      const r = await fetch(url)
      if (r.ok) return { url, stop }
    } catch { /* pas encore prêt */ }
    await sleep(250)
  }
  stop()
  throw new StudioError(`Serveur local injoignable sur ${url}`, stderr)
}
