// Transitions discrètes : fondu d'entrée/sortie d'une séquence, et « respiration »
// (léger fondu ou glissé) de l'écran du téléphone au début d'une étape.
import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'

/** Fondu à l'ouverture et à la fermeture de la séquence courante. */
export const Fade: React.FC<{ children: React.ReactNode; inFrames?: number; outFrames?: number; duration: number }> = ({
  children, inFrames = 14, outFrames = 14, duration,
}) => {
  const f = useCurrentFrame()
  const o = Math.min(
    inFrames ? interpolate(f, [0, inFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1,
    outFrames ? interpolate(f, [duration - outFrames, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1,
  )
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}

/** Effet appliqué au contenu de l'écran autour d'un instant `at` (images absolues). */
export function stepTransitionStyle(frame: number, transitions: { at: number; kind: 'fade' | 'slide' }[]): React.CSSProperties {
  for (const t of transitions) {
    const d = frame - t.at
    if (d < -6 || d > 14) continue
    if (t.kind === 'fade') {
      const o = interpolate(d, [-6, 0, 14], [1, 0.35, 1], { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      return { opacity: o }
    }
    const x = interpolate(d, [0, 14], [28, 0], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const o = interpolate(d, [0, 10], [0.4, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return { transform: `translateX(${x}px)`, opacity: o }
  }
  return {}
}

/** Petit utilitaire : apparition (opacité + translation verticale) à partir d'une image. */
export function useAppear(start: number, length = 18, distance = 18): React.CSSProperties {
  const f = useCurrentFrame()
  const p = interpolate(f, [start, start + length], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return { opacity: p, transform: `translateY(${(1 - p) * distance}px)` }
}
