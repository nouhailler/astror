// Encadré explicatif synchronisé avec la voix : la phrase en cours s'affiche
// dès que la voix commence ; les mots déjà prononcés passent en pleine lumière
// (minutage mot à mot réel si le TTS le fournit, sinon estimé au sein de la
// phrase, dont les bornes sont, elles, exactes). Le texte reste affiché après
// la voix jusqu'à la phrase suivante.
import React from 'react'
import { Easing, interpolate, useCurrentFrame } from 'remotion'
import type { TimelineSentence } from '../types/video.types'
import { T } from './theme'

export function currentSentence(sentences: TimelineSentence[], frame: number, segmentPrefix?: string): TimelineSentence | null {
  let cur: TimelineSentence | null = null
  for (const s of sentences) {
    if (segmentPrefix && !s.segment.startsWith(segmentPrefix)) continue
    if (s.from <= frame) cur = s
    else break
  }
  return cur
}

export const NarrationOverlay: React.FC<{
  sentences: TimelineSentence[]
  offset: number
  /** Ne montre que les phrases de ces segments (ex. 'step-'). */
  segmentPrefix?: string
  fontSize?: number
  align?: 'left' | 'center'
  maxWidth?: number
}> = ({ sentences, offset, segmentPrefix, fontSize = 44, align = 'left', maxWidth = 900 }) => {
  const abs = useCurrentFrame() + offset
  const s = currentSentence(sentences, abs, segmentPrefix)
  if (!s) return null
  const d = abs - s.from
  const appear = interpolate(d, [0, 12], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const speaking = abs < s.from + s.durationInFrames
  return (
    <div style={{ opacity: appear, transform: `translateY(${(1 - appear) * 14}px)`, maxWidth, textAlign: align }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <VoiceBars active={speaking} frame={abs} />
      </div>
      <p style={{ margin: 0, fontFamily: T.serif, fontWeight: 400, fontSize, lineHeight: 1.36, color: T.text, letterSpacing: '-0.005em' }}>
        {s.words.map((w, i) => {
          const lit = interpolate(abs, [w.from - 2, w.from + 4], [0.34, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          return <span key={i} style={{ opacity: lit }}>{w.word}{i < s.words.length - 1 ? ' ' : ''}</span>
        })}
      </p>
    </div>
  )
}

/** Petit égaliseur doré : indique que la voix parle. */
const VoiceBars: React.FC<{ active: boolean; frame: number }> = ({ active, frame }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 22 }}>
    {[0, 1, 2, 3].map((i) => {
      const h = active ? 6 + Math.abs(Math.sin(frame / (3.2 + i * 0.7) + i)) * 16 : 4
      return <span key={i} style={{ width: 4, height: h, borderRadius: 2, background: T.gold, opacity: active ? 0.95 : 0.4 }} />
    })}
  </div>
)
