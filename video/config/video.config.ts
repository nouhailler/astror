// Configuration d'Astror Video Studio (outillage local, hors bundle de l'app).

export interface VoiceConfig {
  /** Moteur TTS (voir scripts/tts/). */
  engine: 'piper' | 'mock'
  /** Modèle Piper (fichier <model>.onnx dans video/models/). */
  model: string
  language: string
  /** 1 = débit natif du modèle ; > 1 plus rapide. Converti en length_scale Piper. */
  rate: number
  volume: number
  /** Silence entre deux phrases d'une même narration (ms). */
  sentenceGapMs: number
}

export const videoConfig = {
  /** Serveur local de l'app (build de production servi par `vite preview`). */
  app: { port: 4317, host: '127.0.0.1' },

  capture: {
    /** L'app est une PWA mobile portrait : on la filme au format téléphone. */
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    jpegQuality: 92,
    /** Délai max pour un élément ou un écran (ms). */
    stepTimeoutMs: 10000,
    /** Respiration entre deux étapes (ms). */
    breathMs: 650,
    /** Image conservée après la dernière étape (ms). */
    tailMs: 1200,
    /** Délai global max d'une prise (ms). */
    maxDurationMs: 15 * 60 * 1000,
  },

  output: { width: 1920, height: 1080, fps: 30, crf: 18, concurrency: 2 },

  narration: { pauseBeforeMs: 300, pauseAfterMs: 550 },

  /** Voix par clé. Ajouter une langue = ajouter une entrée + télécharger le modèle. */
  voices: {
    'fr-siwis': { engine: 'piper', model: 'fr_FR-siwis-medium', language: 'fr', rate: 1.0, volume: 1.0, sentenceGapMs: 280 },
    'fr-tom': { engine: 'piper', model: 'fr_FR-tom-medium', language: 'fr', rate: 1.05, volume: 1.0, sentenceGapMs: 280 },
    'en-alba': { engine: 'piper', model: 'en_GB-alba-medium', language: 'en', rate: 1.0, volume: 1.0, sentenceGapMs: 260 },
  } satisfies Record<string, VoiceConfig>,

  /** Voix par défaut de chaque langue. */
  defaultVoice: { fr: 'fr-siwis', en: 'en-alba' } as Record<string, string>,

  /**
   * Prononciation : réécritures appliquées UNIQUEMENT au texte envoyé au TTS.
   * Les sous-titres et encadrés gardent le texte écrit.
   */
  pronunciations: {
    fr: [
      [/\b(\d{1,2}) h (\d{2})\b/g, '$1 heures $2'],
      [/\b(\d{1,2}) h\b/g, '$1 heures'],
      [/astror\.swinux\.ch/gi, 'astror point swinux point ch'],
      [/github\.com\/nouhailler\/astror/gi, 'github point com, slash nouhailler, slash astror'],
      [/\bASTROR\b/g, 'Astror'],
      [/\bOpenRouter\b/g, 'Open Router'],
      [/\bJames Webb\b/g, 'James Ouèbe'],
      [/\bISS\b/g, 'I S S'],
      [/\bIA\b/g, 'I A'],
    ],
    en: [[/\bASTROR\b/g, 'Astror']],
  } as Record<string, [RegExp, string][]>,

  subtitles: { maxCharsPerLine: 42, maxLines: 2, minCueMs: 1200, burnIn: false },

  /**
   * Réseau pendant la capture :
   *  - replay  : fixtures + cache HAR rejoué (créé automatiquement à la 1re prise) ;
   *  - refresh : fixtures + réseau réel, le cache HAR est réenregistré ;
   *  - offline : fixtures uniquement, tout le reste est bloqué.
   * Les APIs d'IA payantes sont TOUJOURS bloquées.
   */
  network: { mode: 'replay' as 'replay' | 'refresh' | 'offline' },
}

export type VideoConfig = typeof videoConfig
export type VoiceKey = keyof typeof videoConfig.voices
