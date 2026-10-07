import { COMPLEX_CALCULUS_TOPICS, type CalculusKind } from '../../content/complex-calculus-topics'
import { ComplexCalculusScene } from './complex-calculus-shapes'
import { b, type Story } from './kit'

const controls: Partial<Record<CalculusKind, Pick<Story, 'control' | 'readout'>>> = {
  cxRealParameter: {
    control: { label: b('Parameter t / π', 'Parameter t / π'), min: 0, max: 1, step: .05, initial: .35 },
    readout: q => String.raw`t=${q.toFixed(2)}\pi,\quad z=(${Math.cos(q * Math.PI).toFixed(3)})+i(${Math.sin(q * Math.PI).toFixed(3)}),\quad z'=(${(-Math.sin(q * Math.PI)).toFixed(3)})+i(${Math.cos(q * Math.PI).toFixed(3)})`,
  },
  cxContourBranches: {
    control: { label: b('Sudut t / π', 'Angle t / π'), min: 0, max: .5, step: .025, initial: .25 },
    readout: q => String.raw`t=${q.toFixed(3)}\pi,\quad g(e^{it})=e^{it/2},\quad I(0,t)=\frac23(e^{3it/2}-1)`,
  },
  cxPowerSeries: {
    control: { label: b('Derajat N (jumlah suku N+1)', 'Degree N (N+1 terms)'), min: 0, max: 12, step: 1, initial: 7 },
    readout: n => String.raw`r=0.7,\quad\sup_{|z|\le r}|S-S_${n}|\le\frac{r^{${n + 1}}}{1-r}=${(Math.pow(.7, n + 1) / .3).toFixed(4)}`,
  },
  cxTaylorCoefficients: {
    control: { label: b('Jumlah suku ganjil sin z', 'Number of odd sine terms'), min: 1, max: 4, step: 1, initial: 3 },
    readout: n => String.raw`P_${2 * n - 1}(z)=\sum_{k=0}^{${n - 1}}\frac{(-1)^kz^{2k+1}}{(2k+1)!},\quad R_{\sin}=\infty`,
  },
  cxLaurentCoefficients: {
    control: { label: b('Anulus: 0 = dalam, 1 = luar', 'Annulus: 0 = inner, 1 = outer'), min: 0, max: 1, step: 1, initial: 0 },
    readout: n => n === 0 ? String.raw`\rho=\tfrac12,\quad 0<|z|<1,\quad c_{-1}=-1,\quad\oint f\,dz=-2\pi i` : String.raw`\rho=2,\quad |z|>1,\quad c_{-1}=0,\quad\oint f\,dz=0`,
  },
}

export const COMPLEX_CALCULUS_STORIES = Object.fromEntries((Object.keys(COMPLEX_CALCULUS_TOPICS) as CalculusKind[]).map(kind => {
  const item = COMPLEX_CALCULUS_TOPICS[kind]
  return [kind, {
    title: item.entry.title,
    zoomable: true,
    frames: item.lesson.steps.map(step => ({ caption: step.text, tex: step.tex })),
    ...controls[kind],
    ...(kind === 'cxPowerSeries' ? { controlFrom: 1 } : {}),
    draw: (frame, value, lang) => <ComplexCalculusScene kind={kind} frame={frame} value={value} lang={lang} />,
  } satisfies Story]
})) as Record<CalculusKind, Story>
