// Sous-titres incrustés (optionnels : subtitles.burnIn). Mêmes répliques que
// les fichiers SRT/VTT exportés. Bas d'écran, 2 lignes max, fort contraste.
import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { TimelineCue } from '../types/video.types'
import { T } from './theme'

export const SubtitleOverlay: React.FC<{ cues: TimelineCue[]; bottom?: number }> = ({ cues, bottom = 54 }) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()
  const ms = (frame / fps) * 1000
  const cue = cues.find((c) => ms >= c.startMs && ms < c.endMs)
  if (!cue) return null
  return (
    <div style={{ position: 'absolute', left: 0, width, bottom, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(4,6,14,.82)', border: `1px solid ${T.line2}`,
        fontFamily: T.sans, fontWeight: 500, fontSize: 34, lineHeight: 1.32, color: '#fff', textAlign: 'center' }}>
        {cue.lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  )
}
