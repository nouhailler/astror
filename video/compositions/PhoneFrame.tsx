// Maquette de téléphone contenant la capture réelle de l'app (screen.mp4).
// Zooms légers optionnels, centrés sur l'élément mis en évidence.
import React from 'react'
import { Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from 'remotion'
import type { Timeline } from '../types/video.types'
import { T } from './theme'
import { stepTransitionStyle } from './Transition'

export const PHONE = { screenHeight: 880, bezel: 13, radius: 58 }

function zoomAt(frame: number, zooms: Timeline['zooms']): { s: number; ox: number; oy: number } {
  for (const z of zooms) {
    if (frame < z.from - 1 || frame > z.to + 14) continue
    const inP = interpolate(frame, [z.from, z.from + 16], [0, 1], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const outP = interpolate(frame, [z.to - 2, z.to + 12], [1, 0], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const p = Math.min(inP, outP)
    return { s: 1 + (z.scale - 1) * p, ox: z.cx * 100, oy: z.cy * 100 }
  }
  return { s: 1, ox: 50, oy: 50 }
}

export const PhoneFrame: React.FC<{ tl: Timeline; offset: number; x: number; y: number }> = ({ tl, offset, x, y }) => {
  const local = useCurrentFrame()
  const abs = local + offset
  const { screen, src, trimStartFrames } = tl.body
  const scale = PHONE.screenHeight / screen.height
  const w = Math.round(screen.width * scale)
  const h = PHONE.screenHeight
  const z = zoomAt(abs, tl.zooms)
  const tr = stepTransitionStyle(abs, tl.transitions)
  return (
    <div style={{
      position: 'absolute', left: x - w / 2 - PHONE.bezel, top: y - h / 2 - PHONE.bezel,
      width: w + PHONE.bezel * 2, height: h + PHONE.bezel * 2, borderRadius: PHONE.radius,
      background: 'linear-gradient(160deg, #1b2440, #070b16 60%, #121a30)',
      boxShadow: `0 0 0 1px ${T.goldLine}, 0 40px 90px rgba(0,0,0,.65), 0 0 120px rgba(126,166,230,.10)`,
      padding: PHONE.bezel,
    }}>
      <div style={{ width: w, height: h, borderRadius: PHONE.radius - PHONE.bezel, overflow: 'hidden', position: 'relative', background: T.bg }}>
        <div style={{ width: '100%', height: '100%', transform: `scale(${z.s})`, transformOrigin: `${z.ox}% ${z.oy}%`, ...tr }}>
          <OffthreadVideo src={staticFile(src)} trimBefore={trimStartFrames} muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>
    </div>
  )
}
