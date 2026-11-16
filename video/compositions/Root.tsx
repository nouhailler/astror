// Enregistrement de la composition Remotion. Durée et dimensions sont lues
// dans la chronologie passée en inputProps (timeline.json).
import React from 'react'
import { Composition } from 'remotion'
import type { Timeline } from '../types/video.types'
import { VideoComposition } from './VideoComposition'

const PLACEHOLDER = {
  id: 'apercu', title: 'Aperçu', language: 'fr', fps: 30, width: 1920, height: 1080, durationInFrames: 90,
  intro: null, outro: null, sentences: [], chapters: [], zooms: [], transitions: [], cues: [], subtitles: { burnIn: false },
  body: { from: 0, durationInFrames: 90, src: 'screen.mp4', trimStartFrames: 0, screen: { width: 860, height: 1864 } },
} satisfies Timeline

export const Root: React.FC = () => (
  <Composition
    id="AstrorTutorial"
    component={VideoComposition as unknown as React.FC<Record<string, unknown>>}
    defaultProps={PLACEHOLDER as unknown as Record<string, unknown>}
    durationInFrames={PLACEHOLDER.durationInFrames}
    fps={30}
    width={1920}
    height={1080}
    calculateMetadata={({ props }) => {
      const tl = props as unknown as Timeline
      return { durationInFrames: tl.durationInFrames, fps: tl.fps, width: tl.width, height: tl.height }
    }}
  />
)
