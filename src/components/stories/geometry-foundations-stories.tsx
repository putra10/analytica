import { FOUNDATIONS_TOPICS, type FoundationsKind } from '../../content/geometry-foundations-topics'
import { FoundationsScene } from './geometry-foundations-shapes'
import { b, type Story } from './kit'

const controls: Partial<Record<FoundationsKind, Story['control']>> = {
  signedRatio: {label:b('Posisi t : C=(1−t)A+tB', 'Position t : C=(1−t)A+tB'),min:-.75,max:2,step:.25,initial:.5},
  curveSurface: {label:b('Tinggi v pada silinder', 'Cylinder height v'),min:0,max:3.2,step:.4,initial:1.6},
  lineSystems: {label:b('0 berpotongan · 1 sejajar · 2 bersilangan', '0 intersecting · 1 parallel · 2 skew'),min:0,max:2,step:1,initial:2},
  halfSpaces: {label:b('Koordinat x dari B', 'x coordinate of B'),min:1,max:4,step:.5,initial:4},
}
export const FOUNDATIONS_STORIES = Object.fromEntries(
  (Object.keys(FOUNDATIONS_TOPICS) as FoundationsKind[]).map(kind => {
    const lesson=FOUNDATIONS_TOPICS[kind]
    return [kind, {
      title:lesson.entry.title, zoomable:true,
      frames:lesson.lesson.steps.map(step=>({caption:step.text,tex:step.tex})),
      control:controls[kind], controlFrom:kind==='curveSurface'||kind==='lineSystems'?1:0,
      draw:(frame,value,lang)=><FoundationsScene kind={kind} frame={frame} value={value} lang={lang}/>,
    } satisfies Story]
  }),
) as Record<FoundationsKind, Story>
