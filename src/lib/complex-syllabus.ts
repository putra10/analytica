import { parse, evaluate, freeVars, type Node } from './expr'
import * as Cx from './complex-math'
import type { Complex } from './complex-math'

export interface SyllabusText { id: string; en: string }
export class ComplexSyllabusError extends Error {
  readonly text: SyllabusText
  constructor(id: string, en: string) { super(en); this.text = { id, en } }
}
const fail = (id: string, en: string): never => { throw new ComplexSyllabusError(id, en) }
const finite = (z: Complex): Complex => {
  if (!Cx.isFinite(z) || Cx.abs(z) > 1e100) fail('Nilai tidak hingga atau terlalu besar. Periksa penyebut dan rentang.', 'A value is nonfinite or too large. Check denominators and the range.')
  return z
}
const integer = (n: number, min: number, max: number) => {
  if (!Number.isInteger(n) || n < min || n > max) fail(`Gunakan bilangan bulat ${min}–${max}.`, `Use an integer from ${min} to ${max}.`)
}
function expression(src: string, variables: string[]): Node {
  if (!src.trim() || src.length > 300) fail('Isi rumus dengan paling banyak 300 karakter.', 'Enter a formula of at most 300 characters.')
  let ast: Node
  try { ast = parse(src) } catch { return fail('Rumus belum valid. Gunakan + − * / ^ dan tanda kurung.', 'The formula is invalid. Use + − * / ^ and parentheses.') }
  const unknown = [...freeVars(ast)].filter(v => ![...variables, 'i', 'e', 'pi'].includes(v))
  if (unknown.length) fail(`Variabel ${unknown[0]} tidak didukung di sini.`, `Variable ${unknown[0]} is not supported here.`)
  return ast
}
export function syllabusNumber(src: string): Complex { return finite(evaluate(expression(src, []), {})) }

export interface IndexedPoint { n: number; term: Complex; sum: Complex }
export function indexedExperiment(src: string, count: number, target: string) {
  integer(count, 2, 500)
  const ast = expression(src, ['n']), limit = syllabusNumber(target)
  let sum = Cx.C(0)
  const points: IndexedPoint[] = []
  for (let n = 1; n <= count; n++) {
    const term = finite(evaluate(ast, { n: Cx.C(n) }))
    sum = finite(Cx.add(sum, term)); points.push({ n, term, sum })
  }
  const tail = points.slice(-Math.min(20, count)), last = points[count - 1]
  const termError = Cx.abs(Cx.sub(last.term, limit)), sumError = Cx.abs(Cx.sub(last.sum, limit))
  let termDiameter = 0, sumDiameter = 0
  for (const a of tail) for (const b of tail) {
    termDiameter = Math.max(termDiameter, Cx.abs(Cx.sub(a.term, b.term)))
    sumDiameter = Math.max(sumDiameter, Cx.abs(Cx.sub(a.sum, b.sum)))
  }
  const previous = points[count - 2].term
  const ratio = Cx.abs(previous) > 0 ? Cx.abs(last.term) / Cx.abs(previous) : null
  return { points, limit, termError, sumError, termDiameter, sumDiameter, ratio }
}

export type IndexedFamily = 'custom' | 'geometric' | 'p' | 'alternating'
export function indexedFamily(family: IndexedFamily, qText: string, p: number, series: boolean): { expression: string; conclusion: SyllabusText; target?: Complex } {
  if (family === 'custom') return { expression: '', conclusion: { id: 'Rumus kustom: ini data hingga, bukan keputusan konvergensi. Buktikan syarat limit atau kriteria Cauchy untuk seluruh ekor.', en: 'Custom formula: finite data do not decide convergence. Prove the limit conditions or the Cauchy criterion for the whole tail.' } }
  if (family === 'geometric') {
    const q = syllabusNumber(qText), r = Cx.abs(q), formula = `(${qText})^n`
    const exactUnit = (Math.abs(q.re) === 1 && q.im === 0) || (q.re === 0 && Math.abs(q.im) === 1)
    if (Math.abs(r - 1) <= 1e-12 && !exactUnit) return { expression: formula, conclusion: { id: '|q| numerik terlalu dekat dengan 1 untuk memutuskan cabang kriteria secara andal. Hitung |q| secara eksak: <1 konvergen, >1 divergen; =1 memerlukan kasus q=1 untuk barisan.', en: 'The numerical |q| is too close to 1 to decide the criterion reliably. Compute |q| exactly: <1 converges, >1 diverges; =1 needs the q=1 exception for sequences.' } }
    if (r < 1) return { expression: formula, target: series ? Cx.div(q, Cx.sub(Cx.C(1), q)) : Cx.C(0), conclusion: { id: series ? '|q|<1: Σ dari n=1 q^n konvergen absolut ke q/(1−q). Sisa sesudah N suku adalah q^(N+1)/(1−q).' : '|q|<1: q^n→0 karena |q|^n→0.', en: series ? '|q|<1: Σ from n=1 of q^n converges absolutely to q/(1−q). Its remainder after N terms is q^(N+1)/(1−q).' : '|q|<1: q^n→0 because |q|^n→0.' } }
    if (!series && q.re === 1 && q.im === 0) return { expression: formula, target: Cx.C(1), conclusion: { id: 'q=1: barisan konstan 1, sehingga limitnya 1.', en: 'q=1: the sequence is constantly 1, so its limit is 1.' } }
    return { expression: formula, conclusion: { id: series ? '|q|≥1: suku q^n tidak menuju 0, sehingga deret divergen.' : '|q|≥1 dan q≠1: q^n tidak konvergen. Untuk |q|=1, beda suku berturut-turut bermodulus |q−1|; untuk |q|>1 modulus tumbuh.', en: series ? '|q|≥1: the terms q^n do not tend to 0, so the series diverges.' : '|q|≥1 and q≠1: q^n does not converge. For |q|=1 successive differences have magnitude |q−1|; for |q|>1 magnitudes grow.' } }
  }
  if (!Number.isFinite(p) || Math.abs(p) > 10) fail('Gunakan pangkat real p antara −10 dan 10.', 'Use a real exponent p between −10 and 10.')
  if (family === 'alternating') return { expression: `(-1)^(n-1)/n^(${p})`, conclusion: { id: p > 1 ? 'p>1: konvergen absolut, karena jumlah modulus adalah deret p.' : p > 0 ? '0<p≤1: konvergen bersyarat oleh uji selang-seling; jumlah modulus divergen. Galat truncation ≤1/(N+1)^p.' : 'p≤0: suku tidak menuju 0, sehingga deret divergen.', en: p > 1 ? 'p>1: absolutely convergent because the magnitude sum is a p-series.' : p > 0 ? '0<p≤1: conditionally convergent by the alternating test; the magnitude sum diverges. Truncation error ≤1/(N+1)^p.' : 'p≤0: terms do not approach 0, so the series diverges.' } }
  return { expression: `1/n^(${p})`, ...(!series && p > 0 ? { target: Cx.C(0) } : !series && p === 0 ? { target: Cx.C(1) } : {}), conclusion: { id: series ? p > 1 ? 'p>1: deret p konvergen absolut oleh uji integral. Sisa berada antara integral dari N+1 dan integral dari N sampai tak hingga.' : 'p≤1: deret p divergen oleh uji integral (atau suku tidak menuju 0 jika p≤0).' : p > 0 ? 'p>0: 1/n^p→0.' : p === 0 ? 'p=0: barisan konstan 1.' : 'p<0: 1/n^p tumbuh tanpa batas.', en: series ? p > 1 ? 'p>1: the p-series converges absolutely by the integral test. Its remainder lies between the integrals from N+1 and N to infinity.' : 'p≤1: the p-series diverges by the integral test (or the term test when p≤0).' : p > 0 ? 'p>0: 1/n^p→0.' : p === 0 ? 'p=0: the sequence is constantly 1.' : 'p<0: 1/n^p grows without bound.' } }
}

function simpson(f: (t: number) => Complex, a: number, b: number, n: number) {
  const h = (b - a) / n
  let total = Cx.add(f(a), f(b))
  for (let j = 1; j < n; j++) total = Cx.add(total, Cx.scale(f(a + j * h), j % 2 ? 4 : 2))
  return finite(Cx.scale(total, h / 3))
}
export function realParameterExperiment(src: string, t0: number, h: number, a: number, b: number) {
  if (![t0, h, a, b].every(Number.isFinite) || h < 1e-6 || h > .25 || Math.max(Math.abs(t0), Math.abs(a), Math.abs(b)) > 1000 || a === b) fail('Gunakan t₀,a,b hingga (|nilai|≤1000), a≠b, dan 10⁻⁶≤h≤0.25.', 'Use finite t₀,a,b (magnitude≤1000), a≠b, and 10⁻⁶≤h≤0.25.')
  const ast = expression(src, ['t']), f = (t: number) => finite(evaluate(ast, { t: Cx.C(t) }))
  const central = (step: number) => Cx.scale(Cx.sub(f(t0 + step), f(t0 - step)), 1 / (2 * step))
  const left = Cx.scale(Cx.sub(f(t0), f(t0 - h)), 1 / h), right = Cx.scale(Cx.sub(f(t0 + h), f(t0)), 1 / h)
  const coarse = central(h), derivative = central(h / 2), integralCoarse = simpson(f, a, b, 100), integral = simpson(f, a, b, 200)
  const points = Array.from({ length: 81 }, (_, j) => ({ t: a + (b - a) * j / 80, z: f(a + (b - a) * j / 80) }))
  return { points, at: f(t0), left, right, derivative, derivativeDifference: Cx.abs(Cx.sub(derivative, coarse)), sideDifference: Cx.abs(Cx.sub(left, right)), integral, integralDifference: Cx.abs(Cx.sub(integral, integralCoarse)) }
}

type Poly = Complex[]
interface Rational { p: Poly; q: Poly }
const trim = (p: Poly): Poly => { const r = p.slice(); while (r.length > 1 && r[r.length - 1].re === 0 && r[r.length - 1].im === 0) r.pop(); return r }
const polyAdd = (a: Poly, b: Poly, sign = 1): Poly => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, j) => Cx.add(a[j] ?? Cx.C(0), Cx.scale(b[j] ?? Cx.C(0), sign))))
const polyMul = (a: Poly, b: Poly): Poly => {
  if (a.length + b.length > 66) fail('Derajat rasional dibatasi 64. Sederhanakan rumus terlebih dahulu.', 'Rational degree is limited to 64. Simplify the formula first.')
  const r = Array.from({ length: a.length + b.length - 1 }, () => Cx.C(0))
  a.forEach((v, j) => b.forEach((w, k) => { r[j + k] = finite(Cx.add(r[j + k], Cx.mul(v, w))) }))
  return trim(r)
}
function rational(n: Node): Rational {
  const one = [Cx.C(1)]
  if (!freeVars(n).has('z')) return { p: [finite(evaluate(n, {}))], q: one }
  if (n.t === 'var' && n.name === 'z') return { p: [Cx.C(0), Cx.C(1)], q: one }
  if (n.t === 'neg') { const r = rational(n.a); return { p: r.p.map(Cx.neg), q: r.q } }
  if (n.t !== 'bin') return fail('Residu di tak hingga di lab ini memerlukan fungsi rasional P(z)/Q(z).', 'This infinity-residue lab requires a rational function P(z)/Q(z).')
  const a = rational(n.a)
  if (n.op === '^') {
    if (freeVars(n.b).has('z')) return fail('Pangkat harus bilangan bulat konstan.', 'The exponent must be a constant integer.')
    const exponent = finite(evaluate(n.b, {}))
    integer(exponent.re, -20, 20)
    if (exponent.im !== 0) return fail('Pangkat harus real dan bulat.', 'The exponent must be real and integral.')
    let p = one, q = one
    for (let j = 0; j < Math.abs(exponent.re); j++) { p = polyMul(p, exponent.re < 0 ? a.q : a.p); q = polyMul(q, exponent.re < 0 ? a.p : a.q) }
    return { p, q }
  }
  const b = rational(n.b)
  if (n.op === '+') return { p: polyAdd(polyMul(a.p, b.q), polyMul(b.p, a.q)), q: polyMul(a.q, b.q) }
  if (n.op === '-') return { p: polyAdd(polyMul(a.p, b.q), polyMul(b.p, a.q), -1), q: polyMul(a.q, b.q) }
  if (n.op === '*') return { p: polyMul(a.p, b.p), q: polyMul(a.q, b.q) }
  return { p: polyMul(a.p, b.q), q: polyMul(a.q, b.p) }
}
export function infinityResidueExperiment(src: string, radius: number) {
  if (!Number.isFinite(radius) || radius <= 0 || radius > 1000) fail('Gunakan radius 0<R≤1000.', 'Use a radius 0<R≤1000.')
  const ast = expression(src, ['z']), { p, q } = rational(ast)
  if (q.every(v => Cx.abs(v) === 0)) fail('Penyebut identik nol.', 'The denominator is identically zero.')
  const difference = p.length - q.length, k = difference + 1, pr = p.slice().reverse(), qr = q.slice().reverse(), coefficients: Complex[] = []
  if (k >= 0) for (let j = 0; j <= k; j++) {
    let top = pr[j] ?? Cx.C(0)
    for (let m = 1; m <= j; m++) top = Cx.sub(top, Cx.mul(qr[m] ?? Cx.C(0), coefficients[j - m]))
    coefficients.push(finite(Cx.div(top, qr[0])))
  }
  const coefficient = k >= 0 ? coefficients[k] : Cx.C(0), residue = Cx.neg(coefficient)
  // The large circle is a numerical cross-check; it is not assumed to enclose all poles.
  const sample = (n: number) => {
    let total = Cx.C(0), minDenominator = Infinity
    const denominatorScale = q.reduce((sum, coefficient, j) => sum + Cx.abs(coefficient) * radius ** j, 0)
    for (let j = 0; j < n; j++) {
      const z = Cx.polar(radius, 2 * Math.PI * j / n)
      const denominator = q.reduceRight((v, c) => Cx.add(Cx.mul(v, z), c), Cx.C(0))
      if (Cx.abs(denominator) <= 1e-10 * denominatorScale) fail('Sampel kontur terlalu dekat dengan nol penyebut. Pilih radius lain.', 'A contour sample is too close to a denominator zero. Choose another radius.')
      const f = finite(evaluate(ast, { z })); total = Cx.add(total, Cx.mul(f, z))
      minDenominator = Math.min(minDenominator, Cx.abs(denominator))
    }
    return { finiteSum: Cx.scale(total, 1 / n), minDenominator }
  }
  const coarse = sample(256), fine = sample(512)
  return { degreeNumerator: p.length - 1, degreeDenominator: q.length - 1, k, coefficient, residue, finiteResidueSum: fine.finiteSum, discrepancy: Cx.abs(Cx.add(residue, fine.finiteSum)), sampleDifference: Cx.abs(Cx.sub(coarse.finiteSum, fine.finiteSum)), minSampledDenominator: fine.minDenominator, points: Array.from({ length: 81 }, (_, j) => Cx.polar(radius, 2 * Math.PI * j / 80)) }
}

const integerPower = (z: Complex, n: number): Complex => { let v = Cx.C(1); for (let j = 0; j < Math.abs(n); j++) v = Cx.mul(v, z); return n < 0 ? Cx.inv(v) : v }
export function factorOrderExperiment(aText: string, cText: string, m: number, n: number, radius: number) {
  integer(m, 0, 12); integer(n, 0, 12)
  const center = syllabusNumber(aText), leading = syllabusNumber(cText)
  if (Cx.abs(leading) === 0) fail('c harus bukan nol; fungsi nol identik tidak memiliki orde nol hingga.', 'c must be nonzero; the identically zero function has no finite zero order.')
  if (!Number.isFinite(radius) || radius < .01 || radius > 5) fail('Gunakan radius 0.01–5.', 'Use a radius from 0.01 to 5.')
  const order = m - n, f = (w: Complex) => finite(Cx.mul(leading, integerPower(w, order)))
  const inputs = Array.from({ length: 97 }, (_, j) => Cx.add(center, Cx.polar(radius, 2 * Math.PI * j / 96))), images = inputs.map(z => f(Cx.sub(z, center)))
  const classification: SyllabusText = order < 0 ? { id: `Kutub orde ${-order}; penyebut membuat a dikeluarkan.`, en: `Pole of order ${-order}; the denominator excludes a.` } : order > 0 ? { id: n > 0 ? `Singularitas removable pada domain asal. Setelah diperluas ke a, terdapat nol orde ${order}.` : `Nol orde ${order} di a; fungsi terdefinisi di titik itu.`, en: n > 0 ? `Removable singularity on the original domain. Its extension has a zero of order ${order} at a.` : `A zero of order ${order} at a; the function is defined there.` } : { id: n > 0 ? 'Singularitas removable; perluasan bernilai c≠0 sehingga bukan nol.' : 'Fungsi konstan c≠0; a titik regular dan bukan nol.', en: n > 0 ? 'Removable singularity; the extension equals c≠0 and is not a zero.' : 'The constant c≠0; a is regular and is not a zero.' }
  return { center, leading, order, classification, inputs, images, modulus: Cx.abs(leading) * radius ** order, innerModulus: Cx.abs(leading) * (radius / 2) ** order }
}
