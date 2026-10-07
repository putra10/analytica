import { COMPLEX_BASIC_PRACTICE } from './complex-basic-practice'
import { COMPLEX_FOUNDATIONS_TOPICS, type FoundationsKind } from './complex-foundations-topics'
import { COMPLEX_CALCULUS_TOPICS, type CalculusKind } from './complex-calculus-topics'
import { COMPLEX_SERIES_TOPICS, type SeriesKind } from './complex-series-topics'
import { b, type CourseTopic, type CourseDefinition, type CourseSources, type CourseExercise } from './complex-course-model'
import type { VisualKind } from './summary-lessons'
import type { PartVisual } from './summary-examples'
import type { VisualTheorem } from './summary-theorems'

export type ComplexCourseKind = FoundationsKind | CalculusKind | SeriesKind
export const COMPLEX_COURSE_TOPICS: Record<ComplexCourseKind, CourseTopic> = { ...COMPLEX_FOUNDATIONS_TOPICS, ...COMPLEX_CALCULUS_TOPICS, ...COMPLEX_SERIES_TOPICS }
export const COMPLEX_SECTIONS: { title: { id: string; en: string }; order: VisualKind[] }[] = [
  { title: b('Bilangan kompleks dan daerah', 'Complex numbers and regions'), order: ['triangle', 'polar', 'roots', 'disc'] },
  { title: b('Limit, turunan, dan fungsi analitik', 'Limits, derivatives, and analytic functions'), order: ['map', 'derivative', 'cxLimitProof', 'cxDerivativeRules', 'cr', 'harmonic', 'cxHarmonicConjugate', 'cxAnalyticIdentity'] },
  { title: b('Fungsi elementer dan cabang', 'Elementary functions and branches'), order: ['exp', 'branch', 'trig', 'cxElementaryDerivatives', 'cxInverseFunctions'] },
  { title: b('Integral dan teorema Cauchy', 'Integration and Cauchy theorems'), order: ['cxRealParameter', 'integral', 'cxContourBranches', 'primitive', 'cxDomains', 'cauchy', 'cxMaximum'] },
  { title: b('Barisan, deret, Taylor, dan Laurent', 'Sequences, series, Taylor, and Laurent'), order: ['cxSequences', 'cxSeriesConvergence', 'cxPowerSeries', 'series', 'cxTaylorCoefficients', 'cxLaurentCoefficients'] },
  { title: b('Nol, kutub, dan perilaku lokal', 'Zeros, poles, and local behavior'), order: ['singularities', 'cxZeros', 'cxZeroPole', 'cxLocalBehavior'] },
  { title: b('Residu dan penggunaannya', 'Residues and their applications'), order: ['residue', 'cxResidueInfinity', 'cxResidueApplications'] },
]
const BASE_ORDER = ['triangle', 'polar', 'roots', 'disc', 'map', 'derivative', 'cr', 'harmonic', 'exp', 'branch', 'trig', 'integral', 'primitive', 'cauchy', 'series', 'singularities', 'residue']
export function extendComplex<T>(base: T[][], additions: Record<string, T>): T[][] {
  const original = Object.fromEntries(BASE_ORDER.map((kind, i) => [kind, base.flat()[i]]))
  return COMPLEX_SECTIONS.map(section => section.order.map(kind => additions[kind] ?? original[kind]))
}
export const COMPLEX_ENTRIES = Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.entry]))
export const COMPLEX_LESSONS = Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.lesson]))
export const COMPLEX_EXAMPLES = Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.example]))
export const COMPLEX_DEFINITIONS = Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.definition])) as Record<ComplexCourseKind, CourseDefinition>
export const COMPLEX_CONCEPTS = Object.fromEntries(Object.keys(COMPLEX_COURSE_TOPICS).map(kind => [kind, [] as VisualTheorem[]])) as Record<ComplexCourseKind, VisualTheorem[]>
const source = (brown: string, zill: string): CourseSources => ({ brown, zill })
export const COMPLEX_SOURCES: Partial<Record<VisualKind, CourseSources>> = {
  triangle: source('§§1–5', '§17.1'), polar: source('§§6–8', '§17.2'), roots: source('§§9–10', '§17.2'), disc: source('§11', '§17.3'),
  map: source('§§12–14', '§17.4; §20.1'), derivative: source('§§15–20', '§17.4'), cr: source('§§21–23', '§17.5'), harmonic: source('§§24–26', '§17.5'),
  exp: source('§29', '§17.6'), branch: source('§§30–33', '§17.6'), trig: source('§§34–35', '§17.7'),
  integral: source('§§37–43', '§18.1'), primitive: source('§§44–49', '§§18.2–18.3'), cauchy: source('§§50–53', '§18.4'),
  series: source('§§57–62', '§§19.2–19.3'), singularities: source('§§68, 72, 77', '§§19.3–19.4'), residue: source('§§69–70, 73–74', '§19.5'),
  ...Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.sources])),
}
type CourseModule = { code: string; title: { id: string; en: string }; topics: VisualKind[]; phase: 'uts' | 'uas' | 'book' }
const module = (code: string, id: string, en: string, topics: VisualKind[], phase: CourseModule['phase']): CourseModule => ({ code, title: b(id, en), topics, phase })
export const COMPLEX_MODULES: CourseModule[] = [
  module('01', 'Operasi dan sifat aljabar', 'Operations and algebraic properties', ['triangle'], 'uts'),
  module('02', 'Vektor, moduli, dan konjugat', 'Vectors, moduli, and conjugates', ['triangle'], 'uts'),
  module('03', 'Bentuk eksponensial dan pangkat', 'Exponential form and powers', ['polar'], 'uts'),
  module('04', 'Argumen, pembagian, dan akar', 'Arguments, quotients, and roots', ['polar', 'roots'], 'uts'),
  module('05', 'Daerah di bidang kompleks', 'Regions in the complex plane', ['disc'], 'uts'),
  module('06', 'Fungsi dan pemetaan', 'Functions and mappings', ['map'], 'uts'),
  module('07', 'Limit, tak hingga, dan kekontinuan', 'Limits, infinity, and continuity', ['derivative', 'cxLimitProof'], 'uts'),
  module('08', 'Turunan dan aturan turunan', 'Derivatives and derivative rules', ['derivative', 'cxDerivativeRules'], 'uts'),
  module('09', 'CR, analitik, dan harmonik', 'CR, analyticity, and harmonic functions', ['cr', 'harmonic', 'cxHarmonicConjugate'], 'uts'),
  module('10', 'Eksponensial, logaritma, dan cabang', 'Exponential, logarithms, and branches', ['exp', 'branch'], 'uts'),
  module('11', 'Identitas log, pangkat, dan trigonometri', 'Log identities, powers, and trigonometry', ['branch', 'trig', 'cxElementaryDerivatives'], 'uts'),
  module('12', 'Fungsi w(t), integral definit, dan kontur', 'Functions w(t), definite integrals, and contours', ['cxRealParameter', 'integral'], 'uas'),
  module('13', 'Integral kontur dan taksiran ML', 'Contour integrals and ML bounds', ['integral', 'cxContourBranches'], 'uas'),
  module('14', 'Antiturunan dan kebebasan lintasan', 'Antiderivatives and path independence', ['primitive'], 'uas'),
  module('15', 'Cauchy–Goursat dan domain berlubang', 'Cauchy–Goursat and domains with holes', ['primitive', 'cxDomains'], 'uas'),
  module('16', 'Rumus Cauchy dan Liouville', 'Cauchy formulas and Liouville', ['cauchy'], 'uas'),
  module('17', 'Barisan dan deret konvergen', 'Convergent sequences and series', ['cxSequences', 'cxSeriesConvergence', 'cxPowerSeries'], 'uas'),
  module('18A', 'Deret Taylor dan Laurent', 'Taylor and Laurent series', ['series', 'cxTaylorCoefficients', 'cxLaurentCoefficients'], 'uas'),
  module('18B', 'Residu dan teorema residu', 'Residues and the residue theorem', ['residue', 'cxResidueInfinity'], 'uas'),
  module('19', 'Singularitas, nol, kutub, dan perilaku lokal', 'Singularities, zeros, poles, and local behavior', ['singularities', 'cxZeros', 'cxZeroPole', 'cxLocalBehavior', 'cxAnalyticIdentity', 'cxResidueApplications'], 'uas'),
  module('+', 'Pendalaman dari buku', 'Further study from the books', ['cxInverseFunctions', 'cxMaximum'], 'book'),
]
export const COMPLEX_PRACTICE: Partial<Record<VisualKind, CourseExercise[]>> = { ...COMPLEX_BASIC_PRACTICE, ...Object.fromEntries(Object.entries(COMPLEX_COURSE_TOPICS).map(([kind, item]) => [kind, item.practice])) }
export function complexPartVisuals(original: PartVisual[]): PartVisual[] {
  const oldPart: Record<string, number> = { triangle: 0, map: 1, exp: 2, integral: 3, singularities: 4, residue: 4 }
  return COMPLEX_SECTIONS.map(section => {
    const kind = section.order[0]
    const item = COMPLEX_COURSE_TOPICS[kind as ComplexCourseKind]
    if (!item) return { ...original[oldPart[kind]], title: section.title }
    const steps = item.lesson.steps
    const indexes = [...new Set([0, Math.floor((steps.length - 1) / 2), steps.length - 1])]
    return { title: section.title, caption: item.definition.picture, steps: indexes.map(i => ({ label: steps[i].title, tex: steps[i].tex })) }
  })
}
