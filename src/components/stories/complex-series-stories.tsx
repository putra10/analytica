import { COMPLEX_SERIES_TOPICS, type SeriesKind } from '../../content/complex-series-topics'
import { ComplexSeriesScene } from './complex-series-shapes'
import { b, type Story } from './kit'

const controls: Partial<Record<SeriesKind, NonNullable<Story['control']>>> = {
  cxSequences: { label: b('Radius disk ε', 'Disk radius ε'), min: .1, max: .5, step: .05, initial: .25 },
  cxSeriesConvergence: { label: b('Indeks suku / jumlah parsial N', 'Term / partial-sum index N'), min: 1, max: 12, step: 1, initial: 5 },
  cxZeros: { label: b('Orde nol m', 'Zero order m'), min: 1, max: 4, step: 1, initial: 2 },
  cxZeroPole: { label: b('Orde penyebut s', 'Denominator order s'), min: 1, max: 3, step: 1, initial: 2 },
  cxLocalBehavior: { label: b('Jarak ke singularitas t', 'Distance to singularity t'), min: .1, max: 1, step: .1, initial: .5 },
  cxResidueInfinity: { label: b('Radius kontur R', 'Contour radius R'), min: 2, max: 5, step: .5, initial: 2 },
  cxResidueApplications: { label: b('Radius setengah lingkaran R', 'Semicircle radius R'), min: 2, max: 10, step: 1, initial: 3 },
}
const readouts: Record<SeriesKind, (value: number) => string> = {
  cxSequences: eps => String.raw`\varepsilon=${eps.toFixed(2)},\quad N=\lfloor1/\varepsilon\rfloor+1=${Math.floor(1/eps)+1}`,
  cxSeriesConvergence: n => String.raw`q=i/2,\quad N=${n},\quad |S-S_N|=2^{-N}/\sqrt5\approx${(2**(-n)/Math.sqrt(5)).toFixed(5)}`,
  cxZeros: m => String.raw`f(z)=z^{${m}},\quad f(0)=\cdots=f^{(${m-1})}(0)=0,\quad f^{(${m})}(0)=${[1,1,2,6,24][m]}`,
  cxZeroPole: s => String.raw`F_s(z)=(e^z-1)/z^s,\quad s=${s},\quad r-s=${1-s}`,
  cxLocalBehavior: t => String.raw`t=${t.toFixed(1)},\quad e^{1/t}\approx${Math.exp(1/t).toFixed(2)},\quad e^{-1/t}\approx${Math.exp(-1/t).toFixed(5)}`,
  cxResidueInfinity: r => String.raw`R=${r.toFixed(1)},\quad |w|=1/R=${(1/r).toFixed(2)},\quad\operatorname{Res}_\infty f=-5`,
  cxResidueApplications: r => String.raw`R=${r},\quad\left|\int_{\Gamma_R}f\,dz\right|\le\pi R/(R^2-1)\approx${(Math.PI*r/(r*r-1)).toFixed(3)}`,
}
export const COMPLEX_SERIES_STORIES = Object.fromEntries((Object.keys(COMPLEX_SERIES_TOPICS) as SeriesKind[]).map(kind => {
  const item = COMPLEX_SERIES_TOPICS[kind]
  return [kind, {
    title: item.entry.title,
    zoomable: true,
    frames: item.lesson.steps.map(step => ({ caption: step.text, tex: step.tex })),
    control: controls[kind],
    readout: readouts[kind],
    draw: (frame, value, lang) => <ComplexSeriesScene kind={kind} frame={frame} value={value} lang={lang} />,
  } satisfies Story]
})) as Record<SeriesKind, Story>
