// Moteur Piper (TTS neuronal local, hors ligne). Exécuté dans le venv
// video/.venv via un petit script Python par lot (un chargement de modèle par lot).
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VoiceConfig } from '../../config/video.config'
import { paths } from '../lib/paths'
import { StudioError, run, sha256 } from '../lib/util'
import type { TtsEngine, TtsRequest, TtsResult } from './engine'

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'piper_synth.py')

export class PiperEngine implements TtsEngine {
  readonly id = 'piper'
  private ver: string | null = null

  private python(): string {
    const py = process.env.ASTROR_PIPER_PYTHON || paths.venvPython
    if (!existsSync(py)) {
      throw new StudioError(
        `Piper n'est pas installé (Python introuvable : ${py}).\n` +
        '  → npm run video:setup   (crée video/.venv, installe piper-tts et télécharge les voix)',
      )
    }
    return py
  }

  modelPath(voice: VoiceConfig): string {
    return path.join(paths.models, `${voice.model}.onnx`)
  }

  async version(): Promise<string> {
    if (this.ver) return this.ver
    const r = await run(this.python(), ['-c', 'from importlib.metadata import version; print(version("piper-tts"))'])
    if (r.code !== 0) throw new StudioError('piper-tts absent du venv video/.venv → npm run video:setup', r.stderr)
    this.ver = r.stdout.trim()
    return this.ver
  }

  async check(voices: VoiceConfig[]): Promise<void> {
    await this.version()
    for (const v of voices) {
      const m = this.modelPath(v)
      if (!existsSync(m) || !existsSync(`${m}.json`)) {
        throw new StudioError(`Modèle vocal manquant : ${v.model} (${m}).\n  → npm run video:setup`)
      }
    }
  }

  modelFingerprint(voice: VoiceConfig): string {
    // La configuration JSON du modèle identifie le modèle (et change avec lui).
    const cfg = `${this.modelPath(voice)}.json`
    return existsSync(cfg) ? sha256(readFileSync(cfg)) : `missing:${voice.model}`
  }

  async synthesize(reqs: TtsRequest[]): Promise<TtsResult[]> {
    if (!reqs.length) return []
    const items = reqs.map((r) => ({
      model: this.modelPath(r.voice),
      text: r.text,
      out: r.out,
      // Piper : length_scale > 1 = plus lent. Débit 1.1 → 1/1.1.
      length_scale: 1 / ((r.voice.rate || 1) * (r.rate || 1)),
      volume: r.voice.volume ?? 1,
    }))
    const res = await run(this.python(), [SCRIPT], { input: JSON.stringify({ items }) })
    let payload: { ok: boolean; error?: string; results?: { out: string; samples: number; alignments: boolean }[] }
    try {
      payload = JSON.parse(res.stdout.trim().split('\n').pop() || '{}')
    } catch {
      throw new StudioError('Réponse Piper illisible', res.stderr.slice(-2000))
    }
    if (res.code !== 0 || !payload.ok || !payload.results) {
      throw new StudioError(`Échec de la synthèse Piper : ${payload.error ?? `code ${res.code}`}`, res.stderr.slice(-2000))
    }
    return payload.results.map((r) => ({ out: r.out, alignments: r.alignments }))
  }
}
