// Conclusion paramétrable : logo, bénéfices, liens (application, dépôt), invitation.
import React from 'react'
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TimelineSentence, VideoCard } from '../types/video.types'
import { Background } from './Background'
import { Logo } from './Intro'
import { NarrationOverlay } from './NarrationOverlay'
import { T } from './theme'
import { Fade, useAppear } from './Transition'

const Bullet: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const st = useAppear(delay, 18, 14)
  return (
    <div style={{ ...st, display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: T.serif, fontSize: 36, color: T.text, lineHeight: 1.3 }}>
      <span style={{ color: T.gold, fontSize: 26 }}>✦</span>{text}
    </div>
  )
}

export const Outro: React.FC<{ card: VideoCard; duration: number; sentences: TimelineSentence[]; offset: number }> = ({ card, duration, sentences, offset }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const logo = spring({ frame: f - 4, fps, config: { damping: 15 } })
  const head = useAppear(10, 20, 14)
  const links = useAppear(30 + (card.bullets?.length ?? 0) * 8, 22, 14)
  return (
    <Fade duration={duration} inFrames={16} outFrames={24}>
      <Background seed="outro" />
      <AbsoluteFill style={{ padding: '120px 160px', flexDirection: 'row', gap: 120, alignItems: 'center' }}>
        <div style={{ flex: '0 0 560px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ transform: `scale(${0.7 + 0.3 * logo})`, opacity: logo, transformOrigin: 'left center' }}><Logo size={112} /></div>
          <div style={{ ...head, marginTop: 30, fontFamily: T.serif, fontWeight: 500, fontSize: 34, letterSpacing: '0.42em', color: T.gold2 }}>ASTROR</div>
          {card.title && <div style={{ ...head, marginTop: 18, fontFamily: T.serif, fontSize: 66, lineHeight: 1.06, color: T.text }}>{card.title}</div>}
          {card.tagline && <div style={{ ...head, marginTop: 18, fontFamily: T.serif, fontStyle: 'italic', fontSize: 32, color: T.dim }}>{card.tagline}</div>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {(card.bullets ?? []).map((b, i) => <Bullet key={i} text={b} delay={22 + i * 8} />)}
          {card.links?.length ? (
            <div style={{ ...links, marginTop: 34, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {card.links.map((l) => (
                <div key={l.url} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 24px', borderRadius: 18,
                  background: T.goldSoft, border: `1px solid ${T.goldLine}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.gold, minWidth: 190 }}>{l.label}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 30, color: T.text }}>{l.url.replace(/^https?:\/\//, '')}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 70, left: 160, right: 160 }}>
        <NarrationOverlay sentences={sentences} offset={offset} segmentPrefix="outro" fontSize={28} maxWidth={1500} />
      </div>
    </Fade>
  )
}
