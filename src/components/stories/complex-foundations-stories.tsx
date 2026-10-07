import { COMPLEX_FOUNDATIONS_TOPICS, type FoundationsKind } from '../../content/complex-foundations-topics'
import { ComplexFoundationsScene } from './complex-foundations-shapes'
import { b, type Story } from './kit'
export const COMPLEX_FOUNDATIONS_STORIES = Object.fromEntries((Object.keys(COMPLEX_FOUNDATIONS_TOPICS) as FoundationsKind[]).map(kind=>{
  const item=COMPLEX_FOUNDATIONS_TOPICS[kind]
  return [kind,{
    title:item.entry.title, zoomable:true,
    frames:item.lesson.steps.map(step=>({caption:step.text,tex:step.tex})),
    ...(kind==='cxLimitProof'?{control:{label:b('Toleransi keluaran ε', 'Output tolerance ε'),min:.15,max:.9,step:.15,initial:.6},readout:(eps:number)=>String.raw`\varepsilon=${eps.toFixed(2)},\quad\delta=\min(1,\varepsilon/3)=${(eps/3).toFixed(2)}`} : {}),
    draw:(frame,value,lang)=><ComplexFoundationsScene kind={kind} frame={frame} value={value} lang={lang}/>,
  } satisfies Story]
})) as Record<FoundationsKind,Story>
