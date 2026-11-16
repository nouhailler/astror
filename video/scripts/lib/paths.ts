// Chemins du sous-système vidéo. Tout ce qui est généré vit dans des dossiers
// ignorés par git (voir .gitignore) : audio/, cache/, recordings/, build/, output/.
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const VIDEO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const ROOT_DIR = path.resolve(VIDEO_DIR, '..')

export const paths = {
  root: ROOT_DIR,
  video: VIDEO_DIR,
  src: path.join(ROOT_DIR, 'src'),
  dist: path.join(ROOT_DIR, 'dist'),
  models: path.join(VIDEO_DIR, 'models'),
  venvPython: path.join(VIDEO_DIR, '.venv', 'bin', 'python'),
  assets: path.join(VIDEO_DIR, 'assets'),
  fixtures: path.join(VIDEO_DIR, 'fixtures'),
  ttsCache: path.join(VIDEO_DIR, 'cache', 'tts'),
  networkCache: path.join(VIDEO_DIR, 'cache', 'network'),
  compositions: path.join(VIDEO_DIR, 'compositions'),
  audio: (id: string) => path.join(VIDEO_DIR, 'audio', id),
  recording: (id: string) => path.join(VIDEO_DIR, 'recordings', id),
  build: (id: string) => path.join(VIDEO_DIR, 'build', id),
  output: path.join(VIDEO_DIR, 'output'),
}

export const files = {
  voice: (id: string) => path.join(paths.audio(id), 'voice.json'),
  capture: (id: string) => path.join(paths.recording(id), 'capture.json'),
  screen: (id: string) => path.join(paths.recording(id), 'screen.mp4'),
  timeline: (id: string) => path.join(paths.build(id), 'timeline.json'),
  har: (id: string) => path.join(paths.networkCache, `${id}.har`),
  mp4: (id: string) => path.join(paths.output, `${id}.mp4`),
  srt: (id: string) => path.join(paths.output, `${id}.srt`),
  vtt: (id: string) => path.join(paths.output, `${id}.vtt`),
  chapters: (id: string) => path.join(paths.output, `${id}.chapters.txt`),
  report: (id: string) => path.join(paths.output, `${id}.report.json`),
}

export function rel(p: string): string {
  return path.relative(ROOT_DIR, p) || '.'
}
