// Tests unitaires du pipeline : narration, cache vocal, sous-titres,
// chronologie, validation, robustesse. Moteur TTS factice (aucun Piper requis).
import { mkdtempSync, rmSync, existsSync, unlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import type { CaptureEvent, CaptureManifest, VideoScenario } from '../types/video.types'
import { generateVoice, holdsFromManifest } from '../scripts/generate-voice'
import { buildTimeline } from '../scripts/build-timeline'
import { validateScenario, collectDemoIds } from '../scripts/validate'
import { splitSentences, estimateWords, pronounce, collectNarrations } from '../scripts/lib/narration'
import { buildCues, toSrt, toVtt, toYoutubeChapters, wrapLines } from '../scripts/lib/subtitles'
import { MockEngine } from '../scripts/tts/engine'
import { StudioError, mediaDurationMs } from '../scripts/lib/util'
import { VIDEO_SCENARIOS } from '../scenarios'
import { DEFAULT_VIDEO } from '../scenarios/from-demo'

const tmp = mkdtempSync(path.join(os.tmpdir(), 'astror-video-'))
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

function scenario(texts: string[], extra: Partial<VideoScenario['video']> = {}): VideoScenario {
  return {
    id: 'test-scn',
    video: { ...DEFAULT_VIDEO, title: 'Test', voice: 'fr-siwis', ...extra },
    scenario: { name: 'test-scn', label: 'Test', steps: texts.map((t) => ({ type: 'narrate' as const, text: t })) },
  }
}

function opts(name: string, engine = new MockEngine()) {
  return { engine, cacheDir: path.join(tmp, name, 'cache'), manifestFile: path.join(tmp, name, 'voice.json') }
}

describe('narration', () => {
  it('découpe en phrases sans couper les nombres ni les abréviations', () => {
    expect(splitSentences('Bonjour. Voici M. Dupont. Il est 21 h 30 ! Fin…')).toEqual(['Bonjour.', 'Voici M. Dupont.', 'Il est 21 h 30 !', 'Fin…'])
  })
  it('estime le minutage des mots dans la durée exacte de la phrase', () => {
    const w = estimateWords('La Lune arrive en tête.', 2000)
    expect(w).toHaveLength(5)
    expect(w[0].start).toBe(0)
    expect(w.at(-1)!.end).toBe(2000)
    for (let i = 1; i < w.length; i++) expect(w[i].start).toBeGreaterThanOrEqual(w[i - 1].start)
  })
  it('prononciation : appliquée au TTS seulement', () => {
    expect(pronounce('Lever à 14 h 59 sur astror.swinux.ch', 'fr')).toBe('Lever à 14 heures 59 sur astror point swinux point ch')
  })
  it('réutilise le texte narrate existant, sans duplication, et respecte narration:false', () => {
    const scn = scenario(['A.', 'B.'])
    scn.scenario.steps.push({ type: 'highlight', target: 'x', narrate: 'Affiché', video: { narration: false } })
    scn.scenario.steps.push({ type: 'highlight', target: 'x', narrate: 'Affiché', video: { narration: { text: 'Parlé' } } })
    expect(collectNarrations(scn).map((n) => n.text)).toEqual(['A.', 'B.', 'Parlé'])
  })
})

describe('génération vocale et cache', () => {
  it('génère un WAV par phrase et mesure sa durée réelle', async () => {
    const o = opts('gen')
    const m = await generateVoice(scenario(['Première phrase. Deuxième phrase.']), o)
    const seg = m.segments[0]
    expect(seg.sentences).toHaveLength(2)
    for (const s of seg.sentences) {
      const wav = path.join(o.cacheDir, `${s.hash}.wav`)
      expect(existsSync(wav)).toBe(true)
      expect(Math.abs((await mediaDurationMs(wav)) - s.durationMs)).toBeLessThanOrEqual(1)
    }
    expect(seg.totalMs).toBe(seg.pauseBeforeMs + seg.speechMs + seg.pauseAfterMs)
    expect(holdsFromManifest(m)[0]).toBe(seg.totalMs)
  })

  it('cache : aucune régénération si rien ne change', async () => {
    const engine = new MockEngine()
    const o = opts('cache', engine)
    await generateVoice(scenario(['Un. Deux.']), o)
    expect(engine.calls).toBe(2)
    const m2 = await generateVoice(scenario(['Un. Deux.']), o)
    expect(engine.calls).toBe(2)
    expect(m2.cache).toEqual({ hits: 2, misses: 0 })
  })

  it('cache : modifier une phrase n’invalide que cette phrase', async () => {
    const engine = new MockEngine()
    const o = opts('invalidate', engine)
    await generateVoice(scenario(['Un. Deux.']), o)
    const m = await generateVoice(scenario(['Un. Trois.']), o)
    expect(engine.calls).toBe(3)
    expect(m.cache).toEqual({ hits: 1, misses: 1 })
  })

  it('cache : changer la voix ou le débit invalide', async () => {
    const engine = new MockEngine()
    const o = opts('voice', engine)
    await generateVoice(scenario(['Un.']), o)
    await generateVoice(scenario(['Un.'], { voice: 'fr-tom' }), o)
    expect(engine.calls).toBe(2)
  })

  it('fichier audio manquant : régénéré automatiquement', async () => {
    const engine = new MockEngine()
    const o = opts('missing', engine)
    const m = await generateVoice(scenario(['Un.']), o)
    unlinkSync(path.join(o.cacheDir, `${m.segments[0].sentences[0].hash}.wav`))
    await generateVoice(scenario(['Un.']), o)
    expect(engine.calls).toBe(2)
  })

  it('cache corrompu (WAV remplacé) : erreur explicite', async () => {
    const o = opts('corrupt')
    const m = await generateVoice(scenario(['Une phrase assez longue pour durer.']), o)
    const wav = path.join(o.cacheDir, `${m.segments[0].sentences[0].hash}.wav`)
    const { toneWav } = await import('../scripts/tts/engine')
    writeFileSync(wav, toneWav(0.2))
    await expect(generateVoice(scenario(['Une phrase assez longue pour durer.']), o)).rejects.toThrow(/incohérent/)
  })

  it('erreur de synthèse : StudioError et aucun fichier partiel en cache', async () => {
    const engine = new MockEngine()
    engine.failOn = (t) => t.includes('boum')
    const o = opts('fail', engine)
    await expect(generateVoice(scenario(['Ça va. Et boum.']), o)).rejects.toBeInstanceOf(StudioError)
    expect(existsSync(o.manifestFile)).toBe(false)
  })

  it('mode sans voix : durées estimées, aucun fichier', async () => {
    const engine = new MockEngine()
    const m = await generateVoice(scenario(['Texte affiché seulement.'], { voiceEnabled: false }), opts('silent', engine))
    expect(engine.calls).toBe(0)
    expect(m.voiceEnabled).toBe(false)
    expect(m.segments[0].sentences[0].file).toBe('')
    expect(m.segments[0].totalMs).toBeGreaterThan(2000)
  })
})

describe('sous-titres', () => {
  it('au plus deux lignes de 42 caractères, horodatages croissants sans chevauchement', () => {
    const long = 'Le calendrier céleste annonce les prochains rendez-vous, comme la superlune ou la pluie d’étoiles filantes des Géminides.'
    const words = estimateWords(long, 7000)
    const cues = buildCues([
      { text: 'Bonjour.', startMs: 0, endMs: 900 },
      { text: long, startMs: 1500, endMs: 8500, words },
    ], { maxCharsPerLine: 42, maxLines: 2, minCueMs: 1200 })
    for (const c of cues) {
      expect(c.lines.length).toBeLessThanOrEqual(2)
      for (const l of c.lines) expect(l.length).toBeLessThanOrEqual(42)
      expect(c.endMs).toBeGreaterThan(c.startMs)
    }
    for (let i = 1; i < cues.length; i++) expect(cues[i].startMs).toBeGreaterThanOrEqual(cues[i - 1].endMs)
    expect(cues.map((c) => c.lines.join(' ')).join(' ')).toBe(`Bonjour. ${long}`)
  })
  it('formats SRT et WebVTT', () => {
    const cues = [{ index: 1, startMs: 61500, endMs: 63250, lines: ['Ligne un', 'Ligne deux'] }]
    expect(toSrt(cues)).toBe('1\n00:01:01,500 --> 00:01:03,250\nLigne un\nLigne deux\n')
    expect(toVtt(cues)).toMatch(/^WEBVTT\n\n1\n00:01:01\.500 --> 00:01:03\.250 line:88%\nLigne un\nLigne deux\n$/)
    expect(toYoutubeChapters([{ title: 'Intro', startMs: 0 }, { title: 'Ciel', startMs: 75000 }])).toBe('00:00 Intro\n01:15 Ciel\n')
    expect(wrapLines('a b c', 3)).toEqual(['a b', 'c'])
  })
})

describe('chronologie', () => {
  async function fixture(holdOk = true) {
    const scn = scenario(['Phrase une. Phrase deux.', 'Phrase trois.'])
    scn.scenario.steps[1].video = { chapter: 'Deuxième' }
    const voice = await generateVoice(scn, opts(`tl-${holdOk}`))
    const seg0 = voice.segments[0]
    const show1 = 1.0 + (holdOk ? seg0.totalMs / 1000 + 0.6 : 1.0)
    const ev = (type: string, videoT: number, step?: number): CaptureEvent => ({ type: type as CaptureEvent['type'], t: videoT * 1000, epoch: 0, videoT, step })
    const end = show1 + voice.segments[1].totalMs / 1000 + 0.5
    const events = [
      ev('sync:mark', 0.3), ev('scenario:start', 1.0),
      ev('step:start', 1.0, 0), ev('narration:show', 1.0, 0), ev('step:end', show1 - 0.6, 0),
      ev('step:start', show1, 1), ev('narration:show', show1, 1), ev('step:end', end, 1),
      ev('scenario:end', end),
    ]
    const capture: CaptureManifest = {
      scenarioId: scn.id, recordedAt: '', ok: true, viewport: { width: 430, height: 932, deviceScaleFactor: 2 }, clock: '',
      video: { file: 'screen.mp4', width: 860, height: 1864, fps: 30, durationS: end + 1.5, frames: 0 },
      sync: { markVideoT: 0.3, method: 'frame-scan', screencastDriftMs: 10 }, events,
      network: { mode: 'offline', fixtures: [], harHits: 0, blocked: [], failed: [] }, storeRestored: true,
    }
    return { scn, voice, capture, show1 }
  }

  it('place chaque phrase à l’instant de sa narration dans la capture', async () => {
    const { scn, voice, capture, show1 } = await fixture()
    const tl = await buildTimeline(scn, { voice, capture, writeFiles: false })
    expect(tl.intro).toBeNull()
    const trim = 0.9
    const s0 = tl.sentences[0]
    expect(s0.from).toBe(Math.round(((1.0 - trim) * 1000 + voice.segments[0].sentences[0].offsetMs) / 1000 * 30))
    const s2 = tl.sentences.find((s) => s.segment === 'step-1')!
    expect(Math.abs(s2.from - Math.round((show1 - trim) * 30 + (voice.segments[1].sentences[0].offsetMs / 1000) * 30))).toBeLessThanOrEqual(1)
    expect(tl.cues).toHaveLength(3)
    expect(tl.chapters.map((c) => c.title)).toEqual(['Deuxième'])
    expect(tl.chapters[0].from).toBe(0)                               // YouTube : 1er chapitre à 00:00
    expect(tl.durationInFrames).toBe(tl.body.durationInFrames)
  })

  it('narration absente de la capture : séquence manquante détectée', async () => {
    const { scn, voice, capture } = await fixture()
    capture.events = capture.events.filter((e) => !(e.type === 'narration:show' && e.step === 1))
    await expect(buildTimeline(scn, { voice, capture, writeFiles: false })).rejects.toThrow(/Séquence manquante/)
  })

  it('voix plus longue que l’étape filmée : chevauchement refusé', async () => {
    const { scn, voice, capture } = await fixture(false)
    await expect(buildTimeline(scn, { voice, capture, writeFiles: false })).rejects.toThrow(/superposées/)
  })

  it('capture en échec : refusée', async () => {
    const { scn, voice, capture } = await fixture()
    capture.ok = false; capture.error = 'Élément introuvable'
    await expect(buildTimeline(scn, { voice, capture, writeFiles: false })).rejects.toThrow(/La capture a échoué/)
  })
})

describe('validation des scénarios', () => {
  const ids = collectDemoIds()
  it('trouve les data-demo-id réels du code source', () => {
    for (const id of ['sky-compass', 'sky-list-first', 'ai-input', 'eph-moon', 'tab-sky', 'tool-moon']) expect(ids.exact.has(id)).toBe(true)
    expect(ids.prefixes).toEqual(expect.arrayContaining(['sky-filter-', 'seg-', 'explore-seg-']))
  })
  it('tous les scénarios vidéo livrés sont valides (dont les démos existantes)', () => {
    for (const s of VIDEO_SCENARIOS) {
      const r = validateScenario(s, ids)
      expect(r.errors, s.id).toEqual([])
    }
  })
  it('détecte cible inconnue, onglet inconnu, horloge absente, graine hors préfixe', () => {
    const bad = scenario(['x'])
    bad.video.clock = 'hier'
    bad.video.seed = { secret: '1' }
    bad.scenario.steps.push({ type: 'click', target: 'n-existe-pas' })
    bad.scenario.steps.push({ type: 'navigate', to: 'nulle-part' as 'sky' })
    const r = validateScenario(bad, ids)
    expect(r.ok).toBe(false)
    expect(r.errors.join('\n')).toMatch(/n-existe-pas/)
    expect(r.errors.join('\n')).toMatch(/onglet inconnu/)
    expect(r.errors.join('\n')).toMatch(/clock/)
    expect(r.errors.join('\n')).toMatch(/secret/)
  })
  it('le tutoriel de présentation dure entre 2 et 4 minutes (estimation)', () => {
    const p = VIDEO_SCENARIOS.find((s) => s.id === 'astror-presentation-fr')!
    const r = validateScenario(p, ids)
    expect(r.stats.estimatedMs).toBeGreaterThan(120000)
    expect(r.stats.estimatedMs).toBeLessThan(240000)
  })
})
