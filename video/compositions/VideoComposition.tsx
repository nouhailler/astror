// Composition principale : intro → démonstration réelle (téléphone + encadrés
// synchronisés) → conclusion. Toutes les positions temporelles viennent de la
// chronologie (timeline.json), elle-même issue des événements de capture et
// des durées audio réelles.
import React from 'react'
import { AbsoluteFill, Audio, Img, Sequence, staticFile } from 'remotion'
import type { Timeline } from '../types/video.types'
import { Background } from './Background'
import { ChapterProgress, ChapterTitle } from './ChapterTitle'
import { Intro } from './Intro'
import { NarrationOverlay } from './NarrationOverlay'
import { Outro } from './Outro'
import { PhoneFrame } from './PhoneFrame'
import { SubtitleOverlay } from './SubtitleOverlay'
import { T } from './theme'
import { Fade } from './Transition'

const Body: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const { from, durationInFrames } = tl.body
  return (
    <Fade duration={durationInFrames} inFrames={tl.intro ? 16 : 0} outFrames={tl.outro ? 14 : 0}>
      <Background seed="body" />
      <PhoneFrame tl={tl} offset={from} x={520} y={540} />
      <div style={{ position: 'absolute', left: 860, top: 118, width: 940, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Img src={staticFile('logo.svg')} style={{ width: 40, height: 40 }} />
        <span style={{ fontFamily: T.serif, fontWeight: 500, fontSize: 24, letterSpacing: '0.38em', color: T.gold2 }}>ASTROR</span>
        <span style={{ fontFamily: T.mono, fontSize: 16, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.faint, marginLeft: 8 }}>
          {tl.title.length > 48 ? 'Tutoriel' : tl.title}
        </span>
      </div>
      <div style={{ position: 'absolute', left: 860, top: 236, width: 940 }}>
        <ChapterTitle chapters={tl.chapters} offset={from} />
      </div>
      <div style={{ position: 'absolute', left: 860, top: 520, width: 940 }}>
        <NarrationOverlay sentences={tl.sentences} offset={from} segmentPrefix="step-" />
      </div>
      <div style={{ position: 'absolute', left: 860, bottom: 92 }}>
        <ChapterProgress tl={tl} offset={from} width={940} />
      </div>
    </Fade>
  )
}

export const VideoComposition: React.FC<Timeline> = (tl) => (
  <AbsoluteFill style={{ background: T.bg }}>
    {tl.intro && (
      <Sequence from={tl.intro.from} durationInFrames={tl.intro.durationInFrames} name="Introduction">
        <Intro card={tl.intro.card} duration={tl.intro.durationInFrames} sentences={tl.sentences} offset={tl.intro.from} />
      </Sequence>
    )}
    <Sequence from={tl.body.from} durationInFrames={tl.body.durationInFrames} name="Démonstration">
      <Body tl={tl} />
    </Sequence>
    {tl.outro && (
      <Sequence from={tl.outro.from} durationInFrames={tl.outro.durationInFrames} name="Conclusion">
        <Outro card={tl.outro.card} duration={tl.outro.durationInFrames} sentences={tl.sentences} offset={tl.outro.from} />
      </Sequence>
    )}
    {/* Piste vocale : une phrase = un fichier, posé à son image exacte. */}
    {tl.sentences.filter((s) => s.src).map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.durationInFrames + 2} name={`voix ${s.segment}`} layout="none">
        <Audio src={staticFile(s.src)} />
      </Sequence>
    ))}
    {tl.subtitles.burnIn && <SubtitleOverlay cues={tl.cues} />}
  </AbsoluteFill>
)
