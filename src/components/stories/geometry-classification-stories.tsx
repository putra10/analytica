import { CLASSIFICATION_TOPICS, CONIC_CASES, QUADRIC_CASES } from '../../content/geometry-classification-topics'
import type { ClassificationKind } from '../../content/geometry-classification-topics'
import { b } from './kit'
import type { Story } from './kit'
import { AffineFrameScene, CenterScene, CompositionScene, ConicClassScene, ConjugateScene, InvariantScene, InversionScene, MotionScene, QuadricClassScene, SimilarityScene, TangentScene } from './geometry-classification-shapes'

const story = (kind: ClassificationKind, draw: Story['draw'], control?: Story['control'], readout?: Story['readout']): Story => ({
  title: CLASSIFICATION_TOPICS[kind].entry.title,
  frames: CLASSIFICATION_TOPICS[kind].lesson.steps.map(step => ({ caption: step.text, tex: step.tex })),
  zoomable: true, draw, control, readout,
})
export const CLASSIFICATION_STORIES: Record<ClassificationKind, Story> = {
  geoTangent: story('geoTangent', (frame, value, lang) => <TangentScene frame={frame} value={value} lang={lang} />),
  geoCenter: story('geoCenter', (frame, value, lang) => <CenterScene frame={frame} value={value} lang={lang} />),
  geoConjugate: story('geoConjugate', (frame, value, lang) => <ConjugateScene frame={frame} value={value} lang={lang} />),
  geoConicClass: story('geoConicClass', (frame, value, lang) => <ConicClassScene frame={frame} value={value - 1} lang={lang} />, { label: b('Kelas konik (1–9)', 'Conic class (1–9)'), min: 1, max: 9, step: 1, initial: 1 }, value => CONIC_CASES[Math.round(value) - 1]?.equation ?? ''),
  geoQuadricClass: story('geoQuadricClass', (frame, value, lang) => <QuadricClassScene frame={frame} value={value - 1} lang={lang} />, { label: b('Kelas kuadrik (1–17)', 'Quadric class (1–17)'), min: 1, max: 17, step: 1, initial: 1 }, value => QUADRIC_CASES[Math.round(value) - 1]?.equation ?? ''),
  geoInvariants: story('geoInvariants', (frame, value, lang) => <InvariantScene frame={frame} value={value} lang={lang} />),
  geoComposition: story('geoComposition', (frame, value, lang) => <CompositionScene frame={frame} value={value} lang={lang} />),
  geoAffineFrame: story('geoAffineFrame', (frame, value, lang) => <AffineFrameScene frame={frame} value={value} lang={lang} />),
  geoSimilarity: story('geoSimilarity', (frame, value, lang) => <SimilarityScene frame={frame} value={value} lang={lang} />, { label: b('Dua kali rasio k', 'Twice the ratio k'), min: -4, max: 4, step: 1, initial: 4 }, value => String.raw`k=${value / 2},\quad |k|=${Math.abs(value / 2)}`),
  geoMotions: story('geoMotions', (frame, value, lang) => <MotionScene frame={frame} value={value} lang={lang} />, { label: b('Sudut rotasi (derajat)', 'Rotation angle (degrees)'), min: 0, max: 360, step: 15, initial: 90 }, value => String.raw`\theta=${value}^\circ`),
  geoInversion: story('geoInversion', (frame, value, lang) => <InversionScene frame={frame} value={value} lang={lang} />, { label: b('Sepuluh kali jarak ρ', 'Ten times the distance ρ'), min: 10, max: 40, step: 1, initial: 10 }, value => String.raw`\rho=${(value / 10).toFixed(1)},\quad\rho'=\frac4\rho=${(40 / value).toFixed(2)}`),
}
