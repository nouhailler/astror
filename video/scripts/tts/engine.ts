// Interface abstraite de synthèse vocale : remplacer Piper par un autre moteur
// local (eSpeak NG, Coqui, Kokoro…) = implémenter TtsEngine et l'enregistrer
// dans getTtsEngine(). Aucun moteur cloud n'est requis.
import { writeFileSync } from 'node:fs'
import type { VoiceConfig } from '../../config/video.config'
import { PiperEngine } from './piper'

export interface TtsRequest {
  text: string
  voice: VoiceConfig
  /** Débit relatif supplémentaire (multiplie voice.rate). */
  rate?: number
  /** Fichier WAV à produire. */
  out: string
}

export interface TtsResult {
  out: string
  /** Vrai si le moteur a fourni des alignements exploitables. */
  alignments: boolean
}

export interface TtsEngine {
  readonly id: string
  /** Version du moteur : entre dans l'empreinte du cache. */
  version(): Promise<string>
  /** Vérifie que le moteur et ses modèles sont installés ; lève une StudioError sinon. */
  check(voices: VoiceConfig[]): Promise<void>
  /** Empreinte d'un modèle (contenu de sa configuration). */
  modelFingerprint(voice: VoiceConfig): string
  synthesize(reqs: TtsRequest[]): Promise<TtsResult[]>
}

/**
 * Moteur factice (tests, CI sans Piper) : produit une tonalité douce dont la
 * durée dépend du texte. Jamais utilisé pour une vidéo publiée.
 */
export class MockEngine implements TtsEngine {
  readonly id = 'mock'
  failOn?: (text: string) => boolean
  calls = 0
  async version() { return '1' }
  async check() { /* toujours disponible */ }
  modelFingerprint(voice: VoiceConfig) { return `mock:${voice.model}` }
  async synthesize(reqs: TtsRequest[]): Promise<TtsResult[]> {
    return reqs.map((r) => {
      this.calls++
      if (this.failOn?.(r.text)) throw new Error(`Échec simulé de synthèse : ${r.text}`)
      const rate = 22050
      const seconds = Math.max(0.4, r.text.length * 0.06 / ((r.voice.rate || 1) * (r.rate || 1)))
      writeFileSync(r.out, toneWav(seconds, rate))
      return { out: r.out, alignments: false }
    })
  }
}

export function toneWav(seconds: number, rate = 22050): Buffer {
  const n = Math.round(seconds * rate)
  const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 220 * i) / rate) * 3000), 44 + i * 2)
  return buf
}

const engines = new Map<string, TtsEngine>()

export function getTtsEngine(id: string): TtsEngine {
  if (!engines.has(id)) {
    if (id === 'piper') engines.set(id, new PiperEngine())
    else if (id === 'mock') engines.set(id, new MockEngine())
    else throw new Error(`Moteur TTS inconnu : ${id}`)
  }
  return engines.get(id)!
}

export function setTtsEngine(id: string, engine: TtsEngine): void {
  engines.set(id, engine)
}
