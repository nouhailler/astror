// Titre du chapitre en cours (numéro + intitulé), animé à chaque changement,
// et barre de progression des chapitres en bas de l'écran.
import React from 'react'
import { Easing, interpolate, useCurrentFrame } from 'remotion'
import type { Timeline } from '../types/video.types'
import { T } from './theme'

export function currentChapter(chapters: Timeline['chapters'], frame: number): { index: number; title: string; from: number } | null {
  let cur: { index: number; title: string; from: number } | null = null
  chapters.forEach((c, i) => { if (c.from <= frame) cur = { index: i, ...c } })
  return cur
}

export const ChapterTitle: React.FC<{ chapters: Timeline['chapters']; offset: number }> = ({ chapters, offset }) => {
  const abs = useCurrentFrame() + offset
  const c = currentChapter(chapters, abs)
  if (!c) return null
  const d = abs - c.from
  const p = interpolate(d, [0, 20], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const line = interpolate(d, [6, 30], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <div style={{ fontFamily: T.mono, fontSize: 20, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.gold, marginBottom: 14 }}>
        Chapitre {String(c.index + 1).padStart(2, '0')}
      </div>
      <div style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 68, lineHeight: 1.08, color: T.text }}>{c.title}</div>
      <div style={{ height: 2, width: 120 * line, marginTop: 26, background: `linear-gradient(90deg, ${T.gold}, transparent)` }} />
    </div>
  )
}

export const ChapterProgress: React.FC<{ tl: Timeline; offset: number; width: number }> = ({ tl, offset, width }) => {
  const abs = useCurrentFrame() + offset
  const total = tl.durationInFrames
  const c = currentChapter(tl.chapters, abs)
  return (
    <div style={{ width }}>
      <div style={{ position: 'relative', height: 3, borderRadius: 2, background: T.line2 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: 3, borderRadius: 2, width: `${(abs / total) * 100}%`,
          background: `linear-gradient(90deg, ${T.gold3}, ${T.gold2})` }} />
        {tl.chapters.map((ch, i) => (
          <span key={i} style={{ position: 'absolute', top: -4, left: `${(ch.from / total) * 100}%`, width: 2, height: 11,
            background: i === c?.index ? T.gold2 : T.faint, opacity: i === c?.index ? 1 : 0.6 }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: T.mono, fontSize: 16,
        letterSpacing: '0.08em', color: T.faint }}>
        <span>{c ? `${String(c.index + 1).padStart(2, '0')} / ${String(tl.chapters.length).padStart(2, '0')}` : ''}</span>
        <span>astror.swinux.ch</span>
      </div>
    </div>
  )
}
