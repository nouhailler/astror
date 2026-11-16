// Fond « ciel nocturne » : dégradé de l'app, nébuleuses discrètes, étoiles
// scintillant doucement. Déterministe (random(seed)) : chaque rendu est identique.
import React, { useMemo } from 'react'
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion'
import { T } from './theme'

export const Starfield: React.FC<{ count?: number; seed?: string; drift?: number }> = ({ count = 220, seed = 'astror', drift = 0.012 }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: random(`${seed}-x-${i}`) * width,
    y: random(`${seed}-y-${i}`) * height,
    r: 0.5 + random(`${seed}-r-${i}`) ** 3 * 1.9,
    a: 0.25 + random(`${seed}-a-${i}`) * 0.6,
    p: random(`${seed}-p-${i}`) * Math.PI * 2,
    gold: random(`${seed}-g-${i}`) > 0.93,
  })), [count, seed, width, height])
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {stars.map((s, i) => {
        const tw = 0.75 + 0.25 * Math.sin(frame / 38 + s.p)
        const x = (s.x + frame * drift * (1 + s.r)) % width
        return <circle key={i} cx={x} cy={s.y} r={s.r} fill={s.gold ? T.gold2 : '#dfe7ff'} opacity={s.a * tw} />
      })}
    </svg>
  )
}

export const Background: React.FC<{ seed?: string }> = ({ seed }) => (
  <AbsoluteFill style={{ background: `radial-gradient(140% 95% at 50% -10%, #0e1838 0%, #070c1c 46%, ${T.bg} 100%)` }}>
    <AbsoluteFill style={{
      background:
        'radial-gradient(38% 34% at 82% 18%, rgba(176,138,224,.16), transparent 70%),' +
        'radial-gradient(40% 32% at 14% 78%, rgba(126,166,230,.12), transparent 70%)',
    }} />
    <Starfield seed={seed} />
  </AbsoluteFill>
)
