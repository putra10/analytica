/**
 * Studio commands with hand-style working (steps). The maths comes from the lib engines
 * (circles, conics, quadrics, geometry3d, matrix-math); this file only orchestrates and explains.
 */
import type { L, Out, Shape, Step, V } from './studio'
import { intRow, par, poly, tx, txa, txt, txta, vt, vtxt } from './exact'
import * as Circ from './circles'
import { analyzeConic, evalConic, CONIC_TYPE_INDEX, CONIC_TYPE_LABEL, type Conic } from './conics'
import { cross3, det3, dot3, invariants, largeMatrix, norm3, reduceQuadric, scale3, sub3, add3, TYPE_INDEX, TYPE_LABEL, type Quadric } from './quadrics'
import { twoLines } from './geometry3d'
import { eigen3Sym } from './matrix-math'
import type { QuadCoeffs } from './expr'

export interface Ctx { shape(s: string): Shape; point(s: string): V; scalar(s: string): number }
type Ln = Extract<Shape, { kind: 'line' | 'segment' }>
type Pl = Extract<Shape, { kind: 'plane' }>
type Ball = Extract<Shape, { kind: 'circle' | 'sphere' }>
type Tr = Extract<Shape, { kind: 'transform' }>
type Cn = Extract<Shape, { kind: 'conic' }>

const EPS = 1e-9
const zero = (x: number) => Math.abs(x) < EPS
const lab = (id: string, en: string): L => ({ id, en })
const st = (id: string, en: string, tex?: string): Step => ({ text: lab(id, en), tex })
const fx = (tex: string): Step => ({ tex })
const lines = (...ls: string[]) => (ls.length === 1 ? ls[0] : `\\begin{gathered}${ls.join(' \\\\ ')}\\end{gathered}`)
const pm = (rows: number[][]) => `\\begin{pmatrix}${rows.map((r) => r.map(tx).join(' & ')).join(' \\\\ ')}\\end{pmatrix}`
const isLine = (s: Shape): s is Ln => s.kind === 'line' || s.kind === 'segment'
const flat = (...ss: Shape[]) => ss.every((s) => (s.kind === 'point' ? zero(s.p[2]) : isLine(s) ? zero(s.p[2]) && zero(s.v[2]) : s.kind === 'circle' ? zero(s.p[2]) && !s.n : !['plane', 'sphere', 'quadric'].includes(s.kind)))
const pt = (p: number[], d3: boolean) => vt(d3 ? p : p.slice(0, 2))
const ptt = (p: number[], d3: boolean) => vtxt(d3 ? p : p.slice(0, 2))
const XYZ = ['x', 'y', 'z']
const GREEK = ['\\alpha', '\\beta', '\\gamma']
const deg = (rad: number) => { const d = (rad * 180) / Math.PI; return Math.abs(d - Math.round(d)) < 1e-7 ? Math.round(d) : d }
const fmtDeg = (d: number) => String(+d.toPrecision(6))

/** "√s = value" without repeating when s is already a perfect square. */
const rootTex = (s: number) => { const a = `\\sqrt{${tx(s)}}`, b = txa(Math.sqrt(s)); return b.startsWith(a) ? b : `${a} = ${b}` }
/** \frac{n}{d} = value, without repeating an identical right side. */
const ratio = (n: string, d: string, val: number, sign = '') => { const a = `${sign}\\frac{${n}}{${d}}`, b = txa(val); return a === b ? a : `${a} = ${b}` }
const normTex = (v: number[]) => `\\sqrt{${v.map((x) => `${par(x)}^2`).join(' + ')}} = ${rootTex(v.reduce((a, x) => a + x * x, 0))}`

/** a·body + b·body + … + c, signs merged. Bodies already carry their own separator ("\cdot(2)" or "(…)"). */
function combo(cs: number[], bodies: string[], c = 0): string {
  let s = ''
  cs.forEach((a, i) => {
    if (zero(a)) return
    const coef = Math.abs(Math.abs(a) - 1) < 1e-12 && bodies[i].startsWith('(') ? '' : tx(Math.abs(a))
    s += s ? ` ${a < 0 ? '-' : '+'} ${coef}${bodies[i]}` : `${a < 0 ? '-' : ''}${coef}${bodies[i]}`
  })
  if (!zero(c)) s += s ? ` ${c < 0 ? '-' : '+'} ${tx(Math.abs(c))}` : tx(c)
  return s || '0'
}
const linSub = (cs: number[], vs: number[], c = 0) => combo(cs, vs.map((v) => `\\cdot${par(v)}`), c)
const shift = (x: string, a: number) => (zero(a) ? x : poly([[1, x], [-a, '']]))

// ---------- lines and planes as equations ----------

/** a x + b y + c = 0 of a 2D line, small integers when possible. */
const eq2 = (l: { p: V; v: V }) => { const a = l.v[1], b = -l.v[0]; return intRow([a, b, -(a * l.p[0] + b * l.p[1])]) }
const eq2Tex = (e: number[]) => `${poly([[e[0], 'x'], [e[1], 'y'], [e[2], '']])} = 0`
const line2 = (a: number, b: number, c: number): Ln => { const n2 = a * a + b * b; return { kind: 'line', p: [(-a * c) / n2, (-b * c) / n2, 0], v: [b, -a, 0] } }
const planeRow = (s: Pl) => intRow([...s.n, s.D])
const planeTex = (e: number[]) => `${poly([[e[0], 'x'], [e[1], 'y'], [e[2], 'z'], [e[3], '']])} = 0`
function line3Tex(p: V, v: V): string {
  const d = intRow(v)
  const param = XYZ.map((x, i) => `${x} = ${poly([[p[i], ''], [d[i], 't']])}`).join(',\\quad ')
  return d.every((x) => !zero(x)) ? lines(param, XYZ.map((x, i) => `\\frac{${shift(x, p[i])}}{${tx(d[i])}}`).join(' = ')) : param
}
const lineTex = (l: { p: V; v: V }, d3: boolean) => (d3 ? line3Tex(l.p, l.v) : eq2Tex(eq2(l)))
const lineSummary = (l: { p: V; v: V }, d3: boolean): L => {
  if (!d3) { const e = eq2(l), s = `${poly([[e[0], 'x'], [e[1], 'y'], [e[2], '']], txt)} = 0`; return lab(s, s) }
  const s = `(${l.p.map(txt).join(', ')}) + t(${intRow(l.v).map(txt).join(', ')})`
  return lab(`r = ${s}`, `r = ${s}`)
}
const planeSummary = (s: Pl): L => { const e = planeRow(s), x = `${poly([[e[0], 'x'], [e[1], 'y'], [e[2], 'z'], [e[3], '']], txt)} = 0`; return lab(x, x) }

// ---------- circles and spheres ----------

const dimOf = (b: Ball) => (b.kind === 'sphere' ? 3 : 2)
const sigmaOf = (b: Ball) => b.p.slice(0, dimOf(b)).reduce((a, x) => a + x * x, 0) - b.r * b.r
const genTex = (b: Ball) => { const vs = XYZ.slice(0, dimOf(b)); return `${poly([...vs.map((x): [number, string] => [1, `${x}^2`]), ...vs.map((x, i): [number, string] => [-2 * b.p[i], x]), [sigmaOf(b), '']])} = 0` }
const sqLeft = (m: number[], d: number) => XYZ.slice(0, d).map((x, i) => (zero(m[i]) ? `${x}^2` : `(${shift(x, m[i])})^2`)).join(' + ')
const toCircle = (b: Ball): Circ.Circle => Circ.fromCentre(b.p[0], b.p[1], b.r)
const ballSummary = (m: number[], r: number, d3: boolean): L => lab(`pusat ${ptt(m, d3)}, r = ${txta(r)}`, `centre ${ptt(m, d3)}, r = ${txta(r)}`)

function ballFromEq(k: number, lin: number[], c0: number, d3: boolean, typed: string): { m: V; r2: number; steps: Step[] } {
  const d = d3 ? 3 : 2, vs = XYZ.slice(0, d)
  const m = lin.slice(0, d).map((a) => -a / k), s = c0 / k
  const steps: Step[] = [st('Persamaan yang diberikan:', 'Given equation:', typed)]
  if (!zero(k - 1)) steps.push(st(`Bagi kedua ruas dengan ${txt(k)}:`, `Divide both sides by ${txt(k)}:`, `${poly([...vs.map((x): [number, string] => [1, `${x}^2`]), ...vs.map((x, i): [number, string] => [-2 * m[i], x]), [s, '']])} = 0`))
  steps.push(st(`Bandingkan dengan bentuk umum ${d3 ? 'bola' : 'lingkaran'} (Vaisman 3.1):`, `Compare with the general form of a ${d3 ? 'sphere' : 'circle'} (Vaisman 3.1):`, lines(
    `${vs.map((x) => `${x}^2`).join(' + ')} ${vs.map((x, i) => `- 2${GREEK[i]} ${x}`).join(' ')} + \\sigma = 0`,
    `${vs.map((_, i) => `${GREEK[i]} = ${tx(m[i])}`).join(',\\; ')},\\; \\sigma = ${tx(s)}`)))
  const r2 = m.reduce((a, x) => a + x * x, 0) - s
  steps.push(st('Lengkapkan kuadrat:', 'Complete the squares:', lines(
    `${sqLeft(m, d)} = ${vs.map((_, i) => `${GREEK[i]}^2`).join(' + ')} - \\sigma`,
    `= ${m.map((x) => `${par(x)}^2`).join(' + ')} - ${par(s)} = ${tx(r2)}`)))
  if (r2 > EPS) steps.push(st('Pusat dan jari-jari:', 'Centre and radius:', `M = ${pt(m, d3)},\\quad \\rho = ${rootTex(r2)}`))
  else steps.push(r2 < -EPS
    ? st('ρ² < 0: tidak ada titik real (lingkaran/bola imajiner).', 'ρ² < 0: no real points (imaginary circle/sphere).')
    : st('ρ² = 0: hanya satu titik real (lingkaran/bola titik).', 'ρ² = 0: a single real point (point circle/sphere).'))
  return { m: [m[0], m[1], m[2] ?? 0], r2, steps }
}

function ballDef(kind: 'circle' | 'sphere', p: V, r: number): Out {
  const b: Ball = { kind, p, r }, d = dimOf(b)
  return {
    shape: b, summary: ballSummary(p, r, d === 3),
    steps: [st('Persamaan pusat-jari-jari, lalu dijabarkan ke bentuk umum:', 'Centre-radius equation, expanded to the general form:', lines(`${sqLeft(p, d)} = ${par(r)}^2 = ${tx(r * r)}`, genTex(b)))],
  }
}

// ---------- quadratic equations ----------

/** Coefficients of a degree-≤2 polynomial f(x,y,z) in Vaisman's convention (cross and linear terms carry the factor 2). */
export function quadOf(f: (x: number, y: number, z: number) => number): QuadCoeffs | null {
  const a00 = f(0, 0, 0)
  const sq = (g: (t: number) => number) => ({ a: (g(1) + g(-1)) / 2 - a00, l: (g(1) - g(-1)) / 4 })
  const X = sq((t) => f(t, 0, 0)), Y = sq((t) => f(0, t, 0)), Z = sq((t) => f(0, 0, t))
  const cross = (v: number, aa: number, bb: number, la: number, lb: number) => (v - aa - bb - 2 * la - 2 * lb - a00) / 2
  const c: QuadCoeffs = {
    a11: X.a, a22: Y.a, a33: Z.a, a10: X.l, a20: Y.l, a30: Z.l, a00,
    a12: cross(f(1, 1, 0), X.a, Y.a, X.l, Y.l), a13: cross(f(1, 0, 1), X.a, Z.a, X.l, Z.l), a23: cross(f(0, 1, 1), Y.a, Z.a, Y.l, Z.l),
  }
  const model = (x: number, y: number, z: number) => c.a11 * x * x + c.a22 * y * y + c.a33 * z * z + 2 * c.a12 * x * y + 2 * c.a13 * x * z + 2 * c.a23 * y * z + 2 * c.a10 * x + 2 * c.a20 * y + 2 * c.a30 * z + c.a00
  for (const [x, y, z] of [[2, -1.5, 0.7], [-0.3, 2.2, -1.1], [1.7, 0.4, 2.3], [-2.6, -1.3, 0.9]]) {
    const v = f(x, y, z)
    if (!Number.isFinite(v) || Math.abs(v - model(x, y, z)) > 1e-7 * (1 + Math.abs(v))) return null
  }
  return Object.values(c).every(Number.isFinite) ? c : null
}

const conicOf = (q: QuadCoeffs): Conic => ({ a11: q.a11, a12: q.a12, a22: q.a22, a10: q.a10, a20: q.a20, a00: q.a00 })
const quadricOf = (q: QuadCoeffs): Quadric => ({ A: [[q.a11, q.a12, q.a13], [q.a12, q.a22, q.a23], [q.a13, q.a23, q.a33]], a: [q.a10, q.a20, q.a30], alpha: q.a00 })
const conicTex = (c: Conic) => `${poly([[c.a11, 'x^2'], [2 * c.a12, 'xy'], [c.a22, 'y^2'], [2 * c.a10, 'x'], [2 * c.a20, 'y'], [c.a00, '']])} = 0`
const quadricTex = (q: Quadric) => `${poly([[q.A[0][0], 'x^2'], [q.A[1][1], 'y^2'], [q.A[2][2], 'z^2'], [2 * q.A[0][1], 'xy'], [2 * q.A[0][2], 'xz'], [2 * q.A[1][2], 'yz'], [2 * q.a[0], 'x'], [2 * q.a[1], 'y'], [2 * q.a[2], 'z'], [q.alpha, '']])} = 0`
const conicShape = (c: Conic): Cn => ({ kind: 'conic', c, f: (x, y) => evalConic(c, x, y) })
const hint = (what: string) => st(`Gunakan classify(${what}) untuk invarian, pusat, arah utama dan bentuk kanonik.`, `Use classify(${what}) for the invariants, centre, principal directions and canonical form.`)

/** A second-degree equation becomes a circle/sphere when it is one, else a conic/quadric. */
export function fromQuadratic(q: QuadCoeffs, useZ: boolean): Out {
  if (!useZ) {
    const c = conicOf(q)
    if (zero(q.a12) && zero(q.a11 - q.a22) && !zero(q.a11)) {
      const r = ballFromEq(q.a11, [q.a10, q.a20], q.a00, false, conicTex(c))
      if (r.r2 > EPS) return { shape: { kind: 'circle', p: r.m, r: Math.sqrt(r.r2) }, steps: r.steps, summary: ballSummary(r.m, Math.sqrt(r.r2), false) }
      return { shape: conicShape(c), steps: r.steps, summary: conicLabel(c) }
    }
    if ([c.a11, c.a12, c.a22].every(zero)) throw Error('Equation does not define a line or conic')
    return { shape: conicShape(c), steps: [st('Persamaan berderajat dua dalam x, y: sebuah konik.', 'A second-degree equation in x, y: a conic.', conicTex(c)), hint('C')], summary: conicLabel(c) }
  }
  const Q = quadricOf(q)
  if ([q.a12, q.a13, q.a23].every(zero) && zero(q.a11 - q.a22) && zero(q.a11 - q.a33) && !zero(q.a11)) {
    const r = ballFromEq(q.a11, [q.a10, q.a20, q.a30], q.a00, true, quadricTex(Q))
    if (r.r2 > EPS) return { shape: { kind: 'sphere', p: r.m, r: Math.sqrt(r.r2) }, steps: r.steps, summary: ballSummary(r.m, Math.sqrt(r.r2), true) }
    return { shape: { kind: 'quadric', q: Q }, steps: r.steps, summary: quadricLabel(Q) }
  }
  if (Q.A.flat().every(zero)) throw Error('Equation does not define a plane or quadric')
  return { shape: { kind: 'quadric', q: Q }, steps: [st('Persamaan berderajat dua dalam x, y, z: sebuah kuadrik.', 'A second-degree equation in x, y, z: a quadric.', quadricTex(Q)), hint('Q')], summary: quadricLabel(Q) }
}

function conicLabel(c: Conic): L { const a = analyzeConic(c), l = CONIC_TYPE_LABEL[a.type]; return lab(`konik: ${l.id}`, `conic: ${l.en}`) }
function quadricLabel(q: Quadric): L { const r = reduceQuadric(q), l = TYPE_LABEL[r.type]; return lab(`kuadrik: ${l.id}`, `quadric: ${l.en}`) }

/** Canonical line 3D form (x-x0)/l = (y-y0)/m = (z-z0)/n, each part linear in one coordinate. */
export function canonicalLine(parts: ((x: number, y: number, z: number) => number)[]): Out {
  const p: V = [0, 0, 0], v: V = [0, 0, 0], used = new Set<number>()
  for (const f of parts) {
    const b = f(0, 0, 0), a = [f(1, 0, 0) - b, f(0, 1, 0) - b, f(0, 0, 1) - b]
    const k = a.findIndex((x) => !zero(x))
    if (k < 0 || a.filter((x) => !zero(x)).length !== 1 || used.has(k) || !zero(f(2 * Number(k === 0), 2 * Number(k === 1), 2 * Number(k === 2)) - (2 * a[k] + b))) throw Error('Use the canonical form (x-x0)/l = (y-y0)/m = (z-z0)/n')
    used.add(k); p[k] = -b / a[k]; v[k] = 1 / a[k]
  }
  if (parts.length !== 3) throw Error('Use the canonical form (x-x0)/l = (y-y0)/m = (z-z0)/n')
  const l: Ln = { kind: 'line', p, v: intRow(v) as V }
  return { shape: l, summary: lineSummary(l, true), steps: [st('Bentuk kanonik: titik dan vektor arah dibaca dari pembilang dan penyebut.', 'Canonical form: read the point from the numerators and the direction from the denominators.', lines(`P_0 = ${vt(p)},\\quad \\bar v = ${vt(l.v)}`, line3Tex(p, l.v)))] }
}

// ---------- classification: conics ----------

function conicFrom(s: Shape): Conic {
  if (s.kind === 'conic') return s.c
  if (s.kind === 'circle' && !s.n) { const c = toCircle(s); return { a11: 1, a12: 0, a22: 1, a10: -c.alpha, a20: -c.beta, a00: c.sigma } }
  if (s.kind === 'curve') { const q = quadOf((x, y) => (s.axis === 'x' ? x - s.f(0, y) : y - s.f(x, 0))); if (q) return conicOf(q) }
  if (s.kind === 'implicit') { const q = quadOf((x, y) => s.f(x, y)); if (q) return conicOf(q) }
  throw Error('Not a second-degree curve')
}

function classifyConic(c: Conic): Out {
  const an = analyzeConic(c)
  if (an.type === 'degenerate') throw Error('Not a second-degree equation (a11 = a12 = a22 = 0)')
  const { a11, a12, a22, a10, a20, a00 } = c, { I, delta, Delta } = an
  const label = CONIC_TYPE_LABEL[an.type], idx = CONIC_TYPE_INDEX[an.type]
  const steps: Step[] = [
    st('Bentuk umum (Vaisman 3.3.1); koefisien suku xy, x, y dibagi 2:', 'General form (Vaisman 3.3.1); the xy, x, y coefficients are halved:', lines(conicTex(c),
      'a_{11}x^2 + 2a_{12}xy + a_{22}y^2 + 2a_{10}x + 2a_{20}y + a_{00} = 0',
      `a_{11} = ${tx(a11)},\\; a_{12} = ${tx(a12)},\\; a_{22} = ${tx(a22)},\\; a_{10} = ${tx(a10)},\\; a_{20} = ${tx(a20)},\\; a_{00} = ${tx(a00)}`)),
    st('Matriks kecil A dan matriks besar Ã:', 'Small matrix A and large matrix Ã:', `A = ${pm([[a11, a12], [a12, a22]])},\\qquad \\tilde A = ${pm([[a11, a12, a10], [a12, a22, a20], [a10, a20, a00]])}`),
  ]
  const m1 = a22 * a00 - a20 * a20, m2 = a12 * a00 - a20 * a10, m3 = a12 * a20 - a22 * a10
  steps.push(st('Invarian ortogonal:', 'Orthogonal invariants:', lines(
    `I = a_{11} + a_{22} = ${tx(a11)} + ${par(a22)} = ${tx(I)}`,
    `\\delta = \\det A = a_{11}a_{22} - a_{12}^2 = ${par(a11)}\\cdot${par(a22)} - ${par(a12)}^2 = ${tx(delta)}`,
    `\\Delta = \\det\\tilde A = a_{11}(a_{22}a_{00} - a_{20}^2) - a_{12}(a_{12}a_{00} - a_{20}a_{10}) + a_{10}(a_{12}a_{20} - a_{22}a_{10})`,
    `= ${par(a11)}\\cdot${par(m1)} - ${par(a12)}\\cdot${par(m2)} + ${par(a10)}\\cdot${par(m3)} = ${tx(Delta)}`)))
  const g = delta > EPS ? lab('δ > 0: tipe eliptik.', 'δ > 0: elliptic type.') : delta < -EPS ? lab('δ < 0: tipe hiperbolik.', 'δ < 0: hyperbolic type.') : lab('δ = 0: tipe parabolik.', 'δ = 0: parabolic type.')
  const dg = zero(Delta) ? lab(' Δ = 0: degenerasi (sepasang garis).', ' Δ = 0: degenerate (a pair of lines).') : lab(' Δ ≠ 0: tak-degenerasi.', ' Δ ≠ 0: nondegenerate.')
  const el = delta > EPS && !zero(Delta)
  steps.push({ text: lab(g.id + dg.id + (el ? ' Elips real jika IΔ < 0, imajiner jika IΔ > 0.' : ''), g.en + dg.en + (el ? ' Real ellipse if IΔ < 0, imaginary if IΔ > 0.' : '')), tex: el ? `I\\Delta = ${par(I)}\\cdot${par(Delta)} = ${tx(I * Delta)}` : undefined })
  const disc = I * I - 4 * delta, sq = Math.sqrt(Math.max(disc, 0))
  steps.push(st('Persamaan karakteristik det(A − sI) = 0 (nilai eigen):', 'Characteristic equation det(A − sI) = 0 (eigenvalues):', lines(
    `s^2 - Is + \\delta = 0 \\;\\Rightarrow\\; ${poly([[1, 's^2'], [-I, 's'], [delta, '']])} = 0`,
    `s = \\frac{${tx(I)} \\pm \\sqrt{${tx(disc)}}}{2} \\;\\Rightarrow\\; s = ${tx((I + sq) / 2)},\\; s = ${tx((I - sq) / 2)}`)))
  const flip = Math.abs(an.s[0] + an.s[1] - I) > 1e-6 * (1 + Math.abs(I))
  if (flip) steps.push(st('Nilai eigen negatif lebih banyak, maka persamaan dikalikan −1 dahulu (s₁, s₂ berganti tanda).', 'There are more negative eigenvalues, so the equation is first multiplied by −1 (s₁, s₂ change sign).'))
  const [e1, e2] = an.axes, th = deg(an.theta)
  steps.push(st('Arah utama (vektor eigen satuan) dan sudut rotasi:', 'Principal directions (unit eigenvectors) and rotation angle:', lines(
    `s_1 = ${tx(an.s[0])}:\\; \\bar e_1 = ${vt(e1)},\\qquad s_2 = ${tx(an.s[1])}:\\; \\bar e_2 = ${vt(e2)}`,
    ...(zero(a12) ? [] : [`\\tan 2\\theta = \\frac{2a_{12}}{a_{11} - a_{22}} = ${zero(a11 - a22) ? '\\infty' : tx((2 * a12) / (a11 - a22))}`]),
    `\\cos\\theta = ${tx(e1[0])},\\; \\sin\\theta = ${tx(e1[1])},\\; \\theta \\approx ${fmtDeg(+th.toFixed(4))}^\\circ`)))
  if (!zero(delta)) {
    const x0 = (a12 * a20 - a22 * a10) / delta, y0 = (a12 * a10 - a11 * a20) / delta
    steps.push(st('Pusat: selesaikan sistem pusat (∂f/∂x = ∂f/∂y = 0):', 'Centre: solve the centre system (∂f/∂x = ∂f/∂y = 0):', lines(
      `\\begin{cases} ${poly([[a11, 'x'], [a12, 'y'], [a10, '']])} = 0 \\\\ ${poly([[a12, 'x'], [a22, 'y'], [a20, '']])} = 0 \\end{cases}`,
      `x_0 = \\frac{a_{12}a_{20} - a_{22}a_{10}}{\\delta} = ${tx(x0)},\\quad y_0 = \\frac{a_{12}a_{10} - a_{11}a_{20}}{\\delta} = ${tx(y0)}`,
      `f(x_0, y_0) = \\frac{\\Delta}{\\delta} = ${tx(Delta / delta)}`)))
  } else steps.push(st(an.type === 'parabola' ? 'δ = 0: tidak ada pusat. Titik asal kerangka kanonik adalah puncak parabola:' : 'δ = 0: tidak ada pusat tunggal (garis pusat). Titik asal kerangka kanonik:', an.type === 'parabola' ? 'δ = 0: no centre. The origin of the canonical frame is the vertex of the parabola:' : 'δ = 0: no unique centre (a line of centres). Origin of the canonical frame:', `O' = ${vt(an.origin)}`))
  const [s1, s2] = an.s, k = an.k, p = an.p, o = an.origin
  const nf = conicNormal(an.type, s1, s2, k, p)
  steps.push(st('Ganti koordinat (rotasi, lalu translasi ke O′) dan dapatkan bentuk kanonik:', 'Change coordinates (rotate, then translate to O′) to get the canonical form:', lines(
    `x = ${poly([[o[0], ''], [e1[0], "x'"], [e2[0], "y'"]])},\\quad y = ${poly([[o[1], ''], [e1[1], "x'"], [e2[1], "y'"]])}`,
    `${poly([[s1, "x'^2"], [s2, "y'^2"], [-2 * p, "y'"], [k, '']])} = 0`, ...nf)))
  steps.push(st(`Jenis: ${label.id} (kelas ${idx}, Teorema 3.4.5).`, `Type: ${label.en} (class ${idx}, Theorem 3.4.5).`))
  const dash = (v: number[], at: number[] = o): Ln & { dash: true } => ({ kind: 'line', p: [at[0], at[1], 0], v: [v[0], v[1], 0], dash: true })
  const items: Shape[] = [dash(e1), dash(e2), { kind: 'point', p: [o[0], o[1], 0] }]
  if (an.asymptotes && an.type === 'hyperbola') items.push(...an.asymptotes.map((v) => dash(v)))
  if (an.type === 'real-crossing-lines') items.push(...an.asymptotes!.map((v): Ln => ({ kind: 'line', p: [o[0], o[1], 0], v: [v[0], v[1], 0] })))
  if (an.type === 'coincident-lines') items.push({ kind: 'line', p: [o[0], o[1], 0], v: [e2[0], e2[1], 0] })
  if (an.type === 'real-parallel-lines') { const h = Math.sqrt(-k / s1); for (const sg of [1, -1]) items.push({ kind: 'line', p: [o[0] + sg * h * e1[0], o[1] + sg * h * e1[1], 0], v: [e2[0], e2[1], 0] }) }
  return { shape: { kind: 'group', items }, steps, summary: lab(`${label.id} (kelas ${idx})`, `${label.en} (class ${idx})`) }
}

function conicNormal(type: string, s1: number, s2: number, k: number, p: number): string[] {
  const fr = (v: string, d: number) => `\\frac{${v}^2}{${tx(d)}}`
  if (type === 'ellipse' || type === 'circle') {
    const A = -k / s1, B = -k / s2, a = Math.sqrt(Math.max(A, B)), b = Math.sqrt(Math.min(A, B)), c = Math.sqrt(a * a - b * b)
    return [`${fr("x'", A)} + ${fr("y'", B)} = 1`, `\\text{semi-axes } ${txa(a)},\\; ${txa(b)};\\quad c = ${txa(c)},\\; e = \\frac{c}{a} = ${txa(c / a)}`]
  }
  if (type === 'imaginary-ellipse') return [`${fr("x'", k / s1)} + ${fr("y'", k / s2)} = -1`]
  if (type === 'hyperbola') {
    const [lead, other] = k < 0 ? [["x'", -k / s1], ["y'", k / s2]] as const : [["y'", -k / s2], ["x'", k / s1]] as const
    const a = Math.sqrt(lead[1]), b = Math.sqrt(other[1]), c = Math.hypot(a, b)
    return [`${fr(lead[0], lead[1])} - ${fr(other[0], other[1])} = 1`, `a = ${txa(a)},\\; b = ${txa(b)},\\; c = ${txa(c)},\\; e = ${txa(c / a)}`]
  }
  if (type === 'parabola') return [`x'^2 = ${tx((2 * p) / s1)}\\,y'`]
  if (type === 'real-crossing-lines') return [`y' = \\pm ${tx(Math.sqrt(s1 / -s2))}\\,x'`]
  if (type === 'real-parallel-lines') return [`x' = \\pm ${tx(Math.sqrt(-k / s1))}`]
  if (type === 'imaginary-parallel-lines') return [`x'^2 = ${tx(-k / s1)} < 0`]
  if (type === 'coincident-lines') return ["x'^2 = 0"]
  return []
}

// ---------- classification: quadrics ----------

function quadricFrom(s: Shape): Quadric {
  if (s.kind === 'quadric') return s.q
  if (s.kind === 'sphere') return { A: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], a: scale3(s.p, -1), alpha: dot3(s.p, s.p) - s.r * s.r }
  if (s.kind === 'surface') { const q = quadOf((x, y, z) => z - s.f(x, y)); if (q) return quadricOf(q) }
  throw Error('Not a second-degree surface')
}

function quadricNormal(s: number[], k: number, p: number, rank: number): string {
  const vs = ["x'", "y'", "z'"]
  if (p !== 0) return rank === 2 ? `${poly([[s[0], "x'^2"], [s[1], "y'^2"]])} = ${tx(2 * p)}\\,z'` : `x'^2 = ${tx((2 * p) / s[0])}\\,y'`
  if (k === 0) return ''
  let out = ''
  s.forEach((v, i) => { if (v === 0) return; const c = v / -k, term = `\\frac{${vs[i]}^2}{${tx(1 / Math.abs(c))}}`; out += out ? ` ${c < 0 ? '-' : '+'} ${term}` : `${c < 0 ? '-' : ''}${term}` })
  return `${out} = 1`
}

function classifyQuadric(q: Quadric): Out {
  const red = reduceQuadric(q), inv = invariants(q)
  if (red.type === 'degenerate') throw Error('Not a second-degree equation (all aij = 0)')
  const A = q.A, a = q.a, label = TYPE_LABEL[red.type], idx = TYPE_INDEX[red.type]
  const m = [A[0][0] * A[1][1] - A[0][1] ** 2, A[0][0] * A[2][2] - A[0][2] ** 2, A[1][1] * A[2][2] - A[1][2] ** 2]
  const steps: Step[] = [
    st('Bentuk umum (Vaisman 3.3.6); koefisien suku campuran dan linear dibagi 2:', 'General form (Vaisman 3.3.6); mixed and linear coefficients are halved:', lines(quadricTex(q),
      `a_{11} = ${tx(A[0][0])},\\; a_{22} = ${tx(A[1][1])},\\; a_{33} = ${tx(A[2][2])},\\; a_{12} = ${tx(A[0][1])},\\; a_{13} = ${tx(A[0][2])},\\; a_{23} = ${tx(A[1][2])}`,
      `a_{10} = ${tx(a[0])},\\; a_{20} = ${tx(a[1])},\\; a_{30} = ${tx(a[2])},\\; a_{00} = ${tx(q.alpha)}`)),
    st('Matriks kecil A dan matriks besar Ã:', 'Small matrix A and large matrix Ã:', `A = ${pm(A)},\\qquad \\tilde A = ${pm(largeMatrix(q))}`),
    st('Invarian ortogonal:', 'Orthogonal invariants:', lines(
      `I = a_{11} + a_{22} + a_{33} = ${tx(inv.I)}`,
      `J = (a_{11}a_{22} - a_{12}^2) + (a_{11}a_{33} - a_{13}^2) + (a_{22}a_{33} - a_{23}^2) = ${m.map(par).join(' + ')} = ${tx(inv.J)}`,
      `\\delta = \\det A = ${tx(inv.delta)},\\qquad \\Delta = \\det\\tilde A = ${tx(inv.Delta)}`)),
  ]
  const raw = eigen3Sym(A).values.map((v) => (Math.abs(v) < 1e-9 ? 0 : v))
  steps.push(st('Persamaan karakteristik det(A − sI) = 0:', 'Characteristic equation det(A − sI) = 0:', lines(
    `s^3 - Is^2 + Js - \\delta = 0 \\;\\Rightarrow\\; ${poly([[1, 's^3'], [-inv.I, 's^2'], [inv.J, 's'], [-inv.delta, '']])} = 0`,
    `s = ${raw.map(tx).join(',\\; s = ')}`)))
  const flip = Math.abs(red.s[0] + red.s[1] + red.s[2] - inv.I) > 1e-6 * (1 + Math.abs(inv.I))
  if (flip) steps.push(st('Nilai eigen negatif lebih banyak, maka persamaan dikalikan −1 dahulu.', 'There are more negative eigenvalues, so the equation is first multiplied by −1.'))
  steps.push(st('Arah utama (vektor eigen satuan, basis tangan kanan):', 'Principal directions (unit eigenvectors, right-handed basis):', lines(...red.axes.map((v, i) => `s_${i + 1} = ${tx(red.s[i])}:\\; \\bar e_${i + 1} = ${vt(v)}`))))
  if (!zero(inv.delta)) {
    const rhs = a.map((x) => -x), col = (j: number) => det3(A.map((row, i) => row.map((x, jj) => (jj === j ? rhs[i] : x))))
    const c = [0, 1, 2].map((j) => col(j) / inv.delta)
    steps.push(st('Pusat: selesaikan Aξ + a = 0 (aturan Cramer):', 'Centre: solve Aξ + a = 0 (Cramer\'s rule):', lines(
      `\\begin{cases} ${A.map((row, i) => `${poly([[row[0], 'x'], [row[1], 'y'], [row[2], 'z'], [a[i], '']])} = 0`).join(' \\\\ ')} \\end{cases}`,
      `x_0 = ${tx(c[0])},\\; y_0 = ${tx(c[1])},\\; z_0 = ${tx(c[2])},\\qquad f(x_0, y_0, z_0) = \\frac{\\Delta}{\\delta} = ${tx(inv.Delta / inv.delta)}`)))
  } else steps.push(st(red.type.includes('paraboloid') ? 'δ = 0: tidak ada pusat. Titik asal kerangka kanonik adalah puncak:' : 'δ = 0: tidak ada pusat tunggal. Titik asal kerangka kanonik:', red.type.includes('paraboloid') ? 'δ = 0: no centre. The canonical origin is the vertex:' : 'δ = 0: no unique centre. Canonical origin:', `O' = ${vt(red.origin)}`))
  const { s, k, p, rank } = red, nf = quadricNormal(s, k, p, rank)
  steps.push(st('Bentuk kanonik dalam kerangka O′x′y′z′:', 'Canonical form in the frame O′x′y′z′:', lines(`${poly([[s[0], "x'^2"], [s[1], "y'^2"], [s[2], "z'^2"], [-2 * p, rank === 2 ? "z'" : "y'"], [k, '']])} = 0`, ...(nf ? [nf] : []))))
  steps.push(st(`Jenis: ${label.id} (kelas ${idx} dari 17, Teorema 3.4.6).`, `Type: ${label.en} (class ${idx} of 17, Theorem 3.4.6).`))
  const items: Shape[] = [...red.axes.map((v): Shape => ({ kind: 'line', p: red.origin, v, dash: true })), { kind: 'point', p: red.origin }]
  return { shape: { kind: 'group', items }, steps, summary: lab(`${label.id} (kelas ${idx})`, `${label.en} (class ${idx})`) }
}

// ---------- transformations ----------

type M2 = [number, number, number, number]
const cl = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x)
const mapP = (T: Tr, p: number[]): V => [T.m[0] * p[0] + T.m[1] * p[1] + T.c[0], T.m[2] * p[0] + T.m[3] * p[1] + T.c[1], 0]
const trTex = (T: Tr) => `\\begin{cases} x' = ${poly([[T.m[0], 'x'], [T.m[1], 'y'], [T.c[0], '']])} \\\\ y' = ${poly([[T.m[2], 'x'], [T.m[3], 'y'], [T.c[1], '']])} \\end{cases}`
const trMat = (T: Tr) => `\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = ${pm([[T.m[0], T.m[1]], [T.m[2], T.m[3]]])}\\begin{pmatrix} x \\\\ y \\end{pmatrix} + ${pm([[T.c[0]], [T.c[1]]])}`
function trOut(m: M2, c: [number, number], extra: Step[] = []): Out {
  const T: Tr = { kind: 'transform', m: m.map(cl) as M2, c: [cl(c[0]), cl(c[1])] }
  const s = `x' = ${poly([[T.m[0], 'x'], [T.m[1], 'y'], [T.c[0], '']], txt)}, y' = ${poly([[T.m[2], 'x'], [T.m[3], 'y'], [T.c[1], '']], txt)}`
  return { shape: T, summary: lab(s, s), steps: [...extra, st('Persamaan transformasi:', 'Equations of the map:', lines(trTex(T), trMat(T)))] }
}
const pointAbout = (P: V, m: M2): [number, number] => [P[0] - (m[0] * P[0] + m[1] * P[1]), P[1] - (m[2] * P[0] + m[3] * P[1])]

function classifyTransform(T: Tr): Out {
  const [a, b, c, d] = T.m, [e, f] = T.c, det = a * d - b * c
  const g = [[a * a + c * c, a * b + c * d], [a * b + c * d, b * b + d * d]]
  const steps: Step[] = [st('Transformasi:', 'The map:', lines(trTex(T), trMat(T)))]
  steps.push(st(zero(det) ? 'det M = 0: pemetaan singular, bukan transformasi afin (tidak bijektif).' : 'det M ≠ 0: transformasi afin (bijektif). Luas dikali |det M|.', zero(det) ? 'det M = 0: singular map, not an affine transformation (not bijective).' : 'det M ≠ 0: an affine transformation (bijective). Areas scale by |det M|.', `\\det M = ad - bc = ${par(a)}\\cdot${par(d)} - ${par(b)}\\cdot${par(c)} = ${tx(det)}`))
  const ortho = zero(g[0][0] - 1) && zero(g[1][1] - 1) && zero(g[0][1])
  const simil = !zero(g[0][0]) && zero(g[0][0] - g[1][1]) && zero(g[0][1])
  const k = Math.sqrt(g[0][0])
  steps.push(st(ortho ? 'MᵀM = I: M ortogonal, jadi T isometri (mempertahankan jarak).' : simil ? `MᵀM = k²I dengan k = ${txt(k)}: T kesebangunan (similaritas) dengan rasio k.` : 'MᵀM bukan kelipatan I: T bukan isometri maupun kesebangunan.', ortho ? 'MᵀM = I: M is orthogonal, so T is an isometry (preserves distance).' : simil ? `MᵀM = k²I with k = ${txt(k)}: T is a similarity with ratio k.` : 'MᵀM is not a multiple of I: T is neither an isometry nor a similarity.', `M^{T}M = ${pm(g)}`))
  if (!zero(det)) steps.push(det > 0 ? st('det M > 0: orientasi dipertahankan (transformasi sejati).', 'det M > 0: orientation preserved (proper).') : st('det M < 0: orientasi dibalik.', 'det M < 0: orientation reversed.'))
  // fixed points: (M - I)X + c = 0
  const r1 = [a - 1, b, e], r2 = [c, d - 1, f], D = r1[0] * r2[1] - r1[1] * r2[0]
  let fixed: { kind: 'point'; p: V } | { kind: 'line'; e: number[] } | { kind: 'all' } | { kind: 'none' }
  if (!zero(D)) fixed = { kind: 'point', p: [(r1[1] * f - r2[1] * e) / D, (r2[0] * e - r1[0] * f) / D, 0] }
  else if ([r1[0], r1[1], r2[0], r2[1]].every(zero)) fixed = zero(e) && zero(f) ? { kind: 'all' } : { kind: 'none' }
  else {
    const consistent = zero(r1[0] * r2[2] - r1[2] * r2[0]) && zero(r1[1] * r2[2] - r1[2] * r2[1]) && zero(r1[0] * r2[1] - r1[1] * r2[0])
    const row = zero(r1[0]) && zero(r1[1]) ? r2 : r1
    fixed = consistent ? { kind: 'line', e: intRow(row) } : { kind: 'none' }
  }
  const sys = `\\begin{cases} ${poly([[a - 1, 'x'], [b, 'y'], [e, '']])} = 0 \\\\ ${poly([[c, 'x'], [d - 1, 'y'], [f, '']])} = 0 \\end{cases}`
  steps.push(st('Titik tetap: T(X) = X, yaitu (M − I)X + c = 0:', 'Fixed points: T(X) = X, i.e. (M − I)X + c = 0:', lines(sys,
    fixed.kind === 'point' ? `X_0 = ${pt(fixed.p, false)}` : fixed.kind === 'line' ? `\\text{${'fixed line'}: } ${eq2Tex(fixed.e)}` : fixed.kind === 'all' ? '\\text{every point}' : '\\text{no solution}')))
  let name: L
  const rot = deg(Math.atan2(c, a))
  if (zero(det)) name = lab('pemetaan singular (bukan afin)', 'singular map (not affine)')
  else if (ortho && det > 0) name = fixed.kind === 'all' ? lab('identitas', 'identity') : fixed.kind === 'none' ? lab(`translasi oleh ${vtxt([e, f])}`, `translation by ${vtxt([e, f])}`) : lab(`rotasi ${fmtDeg(rot)}° terhadap ${ptt((fixed as { p: V }).p, false)}`, `rotation by ${fmtDeg(rot)}° about ${ptt((fixed as { p: V }).p, false)}`)
  else if (ortho) name = fixed.kind === 'line' ? lab('pencerminan terhadap garis titik tetap', 'reflection in the line of fixed points') : lab('pencerminan geser', 'glide reflection')
  else if (simil && zero(b) && zero(c) && zero(a - d)) name = lab(`homoteti rasio ${txt(a)} pusat ${ptt((fixed as { p: V }).p, false)}`, `homothety with ratio ${txt(a)} about ${ptt((fixed as { p: V }).p, false)}`)
  else if (simil) name = det > 0 ? lab(`kesebangunan spiral: rotasi ${fmtDeg(rot)}° dan rasio ${txt(k)} terhadap ${ptt((fixed as { p: V }).p, false)}`, `spiral similarity: rotation ${fmtDeg(rot)}° and ratio ${txt(k)} about ${ptt((fixed as { p: V }).p, false)}`) : lab(`kesebangunan berlawanan arah, rasio ${txt(k)}`, `orientation-reversing similarity, ratio ${txt(k)}`)
  else name = lab(`transformasi afin (bukan kesebangunan), |det| = ${txt(Math.abs(det))}`, `affine transformation (not a similarity), |det| = ${txt(Math.abs(det))}`)
  steps.push(st(`Kesimpulan: ${name.id}.`, `Conclusion: ${name.en}.`))
  const items: Shape[] = fixed.kind === 'point' ? [{ kind: 'point', p: fixed.p }] : fixed.kind === 'line' ? [line2(fixed.e[0], fixed.e[1], fixed.e[2])] : []
  return { shape: items.length ? { kind: 'group', items } : { kind: 'value', value: name.en }, steps, summary: name }
}

function applyTransform(T: Tr, X: Shape): Out {
  const pos = (p: V, n: string) => { const q = mapP(T, p); return { q, tex: `${n}' = ${pm([[T.m[0], T.m[1]], [T.m[2], T.m[3]]])}${pm([[p[0]], [p[1]]])} + ${pm([[T.c[0]], [T.c[1]]])} = ${pm([[q[0]], [q[1]]])}` } }
  if (X.kind === 'transform') {
    const m: M2 = [T.m[0] * X.m[0] + T.m[1] * X.m[2], T.m[0] * X.m[1] + T.m[1] * X.m[3], T.m[2] * X.m[0] + T.m[3] * X.m[2], T.m[2] * X.m[1] + T.m[3] * X.m[3]]
    const c = mapP(T, X.c)
    return trOut(m, [c[0], c[1]], [st('Komposisi T∘S: M = M_T M_S, c = M_T c_S + c_T.', 'Composition T∘S: M = M_T M_S, c = M_T c_S + c_T.', `M = ${pm([[T.m[0], T.m[1]], [T.m[2], T.m[3]]])}${pm([[X.m[0], X.m[1]], [X.m[2], X.m[3]]])} = ${pm([[m[0], m[1]], [m[2], m[3]]])},\\quad c = ${pm([[c[0]], [c[1]]])}`)])
  }
  if (X.kind === 'point') { const r = pos(X.p, 'P'); return { shape: { kind: 'point', p: r.q }, summary: lab(ptt(r.q, false), ptt(r.q, false)), steps: [st('Peta titik: P′ = MP + c.', 'Image of the point: P′ = MP + c.', r.tex)] } }
  if (isLine(X)) {
    const a = pos(X.p, 'A'), b = pos(add3(X.p, X.v), 'B'), l: Ln = { kind: X.kind, p: a.q, v: sub3(b.q, a.q) }
    if (norm3(l.v) < EPS) throw Error('The map collapses this line to a point')
    return { shape: l, summary: lineSummary(l, false), steps: [st('Peta garis adalah garis melalui peta dua titiknya:', 'The image of a line is the line through the images of two of its points:', lines(a.tex, b.tex)), st('Persamaan bayangan:', 'Equation of the image:', eq2Tex(eq2(l)))] }
  }
  const det = T.m[0] * T.m[3] - T.m[1] * T.m[2]
  if (zero(det)) throw Error('The map is singular (det = 0): it has no inverse')
  const g00 = T.m[0] ** 2 + T.m[2] ** 2, g11 = T.m[1] ** 2 + T.m[3] ** 2, g01 = T.m[0] * T.m[1] + T.m[2] * T.m[3]
  if (X.kind === 'circle' && !X.n && zero(g00 - g11) && zero(g01)) {
    const c = pos(X.p, 'M'), k = Math.sqrt(g00), r = X.r * k
    return { shape: { kind: 'circle', p: c.q, r }, summary: ballSummary(c.q, r, false), steps: [st(`T kesebangunan dengan rasio k = ${txt(k)}: bayangan lingkaran adalah lingkaran.`, `T is a similarity with ratio k = ${txt(k)}: the image of a circle is a circle.`, lines(c.tex, `r' = k\\,r = ${tx(k)}\\cdot${par(X.r)} = ${txa(r)}`)), st('Persamaan bayangan:', 'Equation of the image:', genTex({ kind: 'circle', p: c.q, r }))] }
  }
  if (!['circle', 'conic', 'implicit', 'curve'].includes(X.kind) || (X.kind === 'circle' && X.n)) throw Error('apply works on 2D points, lines, circles, conics, curves and maps')
  const inv = [T.m[3] / det, -T.m[1] / det, -T.m[2] / det, T.m[0] / det], ic = [-(inv[0] * T.c[0] + inv[1] * T.c[1]), -(inv[2] * T.c[0] + inv[3] * T.c[1])]
  const back = (x: number, y: number) => [inv[0] * x + inv[1] * y + ic[0], inv[2] * x + inv[3] * y + ic[1]]
  const invStep = st('Balikkan transformasi, X = M⁻¹(X′ − c), lalu substitusikan ke persamaan semula:', 'Invert the map, X = M⁻¹(X′ − c), and substitute into the original equation:', `x = ${poly([[inv[0], "x'"], [inv[1], "y'"], [ic[0], '']])},\\quad y = ${poly([[inv[2], "x'"], [inv[3], "y'"], [ic[1], '']])}`)
  const f0 = X.kind === 'implicit' ? X.f : X.kind === 'curve' ? (x: number, y: number) => (X.axis === 'x' ? x - X.f(0, y) : y - X.f(x, 0)) : (() => { const c = conicFrom(X); return (x: number, y: number) => evalConic(c, x, y) })()
  const f = (x: number, y: number) => { const [u, v] = back(x, y); return f0(u, v) }
  const q = quadOf((x, y) => f(x, y))
  if (q && ![q.a11, q.a12, q.a22].every(zero)) {
    const o = fromQuadratic(q, false)
    return { ...o, steps: [invStep, st('Hasil (tanda aksen dihilangkan):', 'Result (primes dropped):', conicTex(conicOf(q))), ...(o.steps ?? []).slice(1)] }
  }
  return { shape: { kind: 'implicit', f }, steps: [invStep] }
}

// ---------- lines, planes: relations ----------

const REL: Record<string, L> = {
  intersect: lab('berpotongan', 'intersecting'), parallel: lab('sejajar', 'parallel'), coincident: lab('berimpit', 'coincident'),
  skew: lab('bersilangan', 'skew'), contained: lab('garis terletak pada bidang', 'the line lies in the plane'),
}
const vmat = (rows: number[][]) => `\\begin{vmatrix}${rows.map((r) => r.map(tx).join(' & ')).join(' \\\\ ')}\\end{vmatrix}`

function linesRelation(l: Ln, m: Ln): { rel: string; steps: Step[] } {
  const d3 = !flat(l, m), w = sub3(m.p, l.p)
  const steps: Step[] = [st('Titik dan vektor arah:', 'Points and direction vectors:', `P_1 = ${pt(l.p, d3)},\\; \\bar v_1 = ${pt(l.v, d3)};\\quad P_2 = ${pt(m.p, d3)},\\; \\bar v_2 = ${pt(m.v, d3)}`)]
  if (!d3) {
    const D = l.v[0] * m.v[1] - l.v[1] * m.v[0]
    steps.push(st('Uji kesejajaran vektor arah:', 'Test whether the directions are parallel:', `\\det(\\bar v_1, \\bar v_2) = ${vmat([[l.v[0], l.v[1]], [m.v[0], m.v[1]]])} = ${tx(D)}`))
    if (!zero(D)) return { rel: 'intersect', steps: [...steps, st('det ≠ 0: kedua garis berpotongan di satu titik.', 'det ≠ 0: the lines meet in one point.')] }
    const E = w[0] * l.v[1] - w[1] * l.v[0]
    steps.push(st(zero(E) ? 'det = 0 dan P₂ terletak pada garis pertama: berimpit.' : 'det = 0 dan P₂ tidak terletak pada garis pertama: sejajar.', zero(E) ? 'det = 0 and P₂ lies on the first line: coincident.' : 'det = 0 and P₂ is not on the first line: parallel.', `\\det(\\overrightarrow{P_1P_2}, \\bar v_1) = ${tx(E)}`))
    return { rel: zero(E) ? 'coincident' : 'parallel', steps }
  }
  const cr = cross3(l.v, m.v), mixed = dot3(w, cr)
  steps.push(fx(`\\bar v_1 \\times \\bar v_2 = ${vt(cr)}`))
  if (norm3(cr) < EPS) {
    const e = cross3(w, l.v)
    steps.push(st(norm3(e) < EPS ? 'Vektor arah sejajar dan P₂ pada garis pertama: berimpit.' : 'Vektor arah sejajar tetapi P₂ tidak pada garis pertama: sejajar.', norm3(e) < EPS ? 'Parallel directions and P₂ lies on the first line: coincident.' : 'Parallel directions but P₂ is not on the first line: parallel.', `\\overrightarrow{P_1P_2} \\times \\bar v_1 = ${vt(e)}`))
    return { rel: norm3(e) < EPS ? 'coincident' : 'parallel', steps }
  }
  steps.push(st('Hasil kali campuran (sebidang jika = 0):', 'Mixed product (coplanar iff = 0):', `(\\overrightarrow{P_1P_2}, \\bar v_1, \\bar v_2) = ${vmat([w, l.v, m.v])} = ${tx(mixed)}`))
  steps.push(zero(mixed) ? st('= 0 dan v₁ × v₂ ≠ 0: kedua garis berpotongan.', '= 0 and v₁ × v₂ ≠ 0: the lines intersect.') : st('≠ 0: kedua garis bersilangan (tidak sebidang).', '≠ 0: the lines are skew (not coplanar).'))
  return { rel: zero(mixed) ? 'intersect' : 'skew', steps }
}

function linePlaneRelation(l: Ln, p: Pl): { rel: string; nv: number; c0: number; steps: Step[] } {
  const nv = dot3(p.n, l.v), c0 = dot3(p.n, l.p) + p.D
  const steps = [st('Bandingkan vektor normal n dengan vektor arah v:', 'Compare the normal n with the direction v:', lines(`\\bar n\\cdot\\bar v = ${dotTex(p.n, l.v)} = ${tx(nv)}`, ...(zero(nv) ? [`\\bar n\\cdot P_0 + D = ${tx(c0)}`] : [])))]
  const rel = !zero(nv) ? 'intersect' : zero(c0) ? 'contained' : 'parallel'
  steps.push(rel === 'intersect' ? st('n·v ≠ 0: garis menembus bidang.', 'n·v ≠ 0: the line meets the plane.') : rel === 'contained' ? st('n·v = 0 dan P₀ pada bidang: garis terletak pada bidang.', 'n·v = 0 and P₀ is in the plane: the line lies in the plane.') : st('n·v = 0 dan P₀ tidak pada bidang: garis sejajar bidang.', 'n·v = 0 and P₀ is not in the plane: the line is parallel to the plane.'))
  return { rel, nv, c0, steps }
}
const dotTex = (u: number[], v: number[]) => u.map((x, i) => `${par(x)}\\cdot${par(v[i])}`).join(' + ')

function planesRelation(a: Pl, b: Pl): { rel: string; v: V; steps: Step[] } {
  const v = cross3(a.n, b.n)
  const steps = [st('Hasil kali silang kedua normal:', 'Cross product of the normals:', `\\bar n_1 \\times \\bar n_2 = ${vt(a.n)} \\times ${vt(b.n)} = ${vt(v)}`)]
  if (norm3(v) > EPS) return { rel: 'intersect', v, steps: [...steps, st('≠ 0: kedua bidang berpotongan pada sebuah garis.', '≠ 0: the planes meet in a line.')] }
  const p0 = scale3(a.n, -a.D / dot3(a.n, a.n)), on = zero(dot3(b.n, p0) + b.D)
  return { rel: on ? 'coincident' : 'parallel', v, steps: [...steps, on ? st('= 0 dan koefisiennya sebanding: berimpit.', '= 0 and the coefficients are proportional: coincident.') : st('= 0 tetapi D tidak sebanding: sejajar.', '= 0 but D is not proportional: parallel.')] }
}

// ---------- distance / angle / intersect ----------

function distPointLineSteps(P: V, l: Ln, d3: boolean): { d: number; steps: Step[] } {
  if (!d3) {
    const [A, B, C] = eq2(l), num = A * P[0] + B * P[1] + C, d = Math.abs(num) / Math.hypot(A, B)
    return { d, steps: [st('Persamaan garis dan rumus jarak titik ke garis:', 'Line equation and the point-to-line distance formula:', lines(eq2Tex([A, B, C]), `d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}} = \\frac{|${linSub([A, B], [P[0], P[1]], C)}|}{\\sqrt{${par(A)}^2 + ${par(B)}^2}} = ${ratio(tx(Math.abs(num)), tx(Math.hypot(A, B)), d)}`))] }
  }
  const w = sub3(P, l.p), c = cross3(w, l.v), d = norm3(c) / norm3(l.v)
  return { d, steps: [st('Ambil P₀ pada garis; jarak = |P₀P × v| / |v|:', 'Take P₀ on the line; distance = |P₀P × v| / |v|:', lines(`\\overrightarrow{P_0P} = ${vt(w)},\\quad \\overrightarrow{P_0P}\\times\\bar v = ${vt(c)}`, `d = \\frac{${tx(norm3(c as V))}}{${tx(norm3(l.v as V))}} = ${txa(d)}`))] }
}
function distPointPlaneSteps(P: V, p: Pl): { d: number; steps: Step[] } {
  const e = planeRow(p), num = e[0] * P[0] + e[1] * P[1] + e[2] * P[2] + e[3], den = Math.hypot(e[0], e[1], e[2]), d = Math.abs(num) / den
  return { d, steps: [st('Rumus jarak titik ke bidang:', 'Point-to-plane distance formula:', lines(planeTex(e), `d = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}} = \\frac{|${linSub(e.slice(0, 3), P, e[3])}|}{\\sqrt{${e.slice(0, 3).map((x) => `${par(x)}^2`).join(' + ')}}} = ${ratio(tx(Math.abs(num)), tx(den), d)}`))] }
}

function distance(a: Shape, b: Shape): Out {
  if (b.kind === 'point' && a.kind !== 'point') [a, b] = [b, a]
  if (b.kind === 'plane' && isLine(a)) [a, b] = [b, a]
  const d3 = !flat(a, b)
  const val = (d: number, steps: Step[]): Out => ({ shape: { kind: 'value', value: d }, steps, summary: lab(`d = ${txta(d)}`, `d = ${txta(d)}`) })
  if (a.kind === 'point') {
    if (b.kind === 'point') { const v = sub3(b.p, a.p); return val(norm3(v), [st('Rumus jarak dua titik:', 'Distance between two points:', `d = ${normTex(d3 ? v : v.slice(0, 2))}`)]) }
    if (isLine(b)) { const r = distPointLineSteps(a.p, b, d3); return val(r.d, r.steps) }
    if (b.kind === 'plane') { const r = distPointPlaneSteps(a.p, b); return val(r.d, r.steps) }
    if (b.kind === 'circle' || b.kind === 'sphere') { const pm_ = norm3(sub3(a.p, b.p)), d = Math.abs(pm_ - b.r); return val(d, [st('Jarak ke lingkaran/bola = ||PM| − ρ|:', 'Distance to a circle/sphere = ||PM| − ρ|:', `|PM| = ${txa(pm_)},\\quad d = |${tx(pm_)} - ${tx(b.r)}| = ${txa(d)}`)]) }
  }
  if (isLine(a) && isLine(b)) {
    const r = linesRelation(a, b)
    if (r.rel === 'intersect' || r.rel === 'coincident') return val(0, [...r.steps, st('Garis bertemu, jadi jaraknya 0.', 'The lines meet, so the distance is 0.')])
    if (r.rel === 'parallel') { const q = distPointLineSteps(b.p, a, d3); return val(q.d, [...r.steps, st('Garis sejajar: jarak = jarak P₂ ke garis pertama.', 'Parallel lines: distance = distance from P₂ to the first line.'), ...q.steps]) }
    const w = sub3(b.p, a.p), c = cross3(a.v, b.v), mixed = dot3(w, c), d = Math.abs(mixed) / norm3(c)
    return val(d, [...r.steps, st('Jarak dua garis bersilangan (Vaisman 2.3):', 'Distance between skew lines (Vaisman 2.3):', `d = \\frac{|(\\overrightarrow{P_1P_2}, \\bar v_1, \\bar v_2)|}{|\\bar v_1\\times\\bar v_2|} = \\frac{${tx(Math.abs(mixed))}}{${tx(norm3(c as V))}} = ${txa(d)}`)])
  }
  if (a.kind === 'plane' && isLine(b)) {
    const r = linePlaneRelation(b, a)
    if (r.rel !== 'parallel') return val(0, [...r.steps, st('Garis memotong/terletak pada bidang: jarak 0.', 'The line meets the plane: distance 0.')])
    const q = distPointPlaneSteps(b.p, a); return val(q.d, [...r.steps, st('Jarak = jarak sebarang titik garis ke bidang:', 'Distance = distance from any point of the line to the plane:'), ...q.steps])
  }
  if (a.kind === 'plane' && b.kind === 'plane') {
    const r = planesRelation(a, b)
    if (r.rel !== 'parallel') return val(0, [...r.steps, st('Bidang bertemu: jarak 0.', 'The planes meet: distance 0.')])
    const p0 = scale3(a.n, -a.D / dot3(a.n, a.n)), q = distPointPlaneSteps(p0, b)
    return val(q.d, [...r.steps, st('Ambil titik pada bidang pertama:', 'Take a point of the first plane:', `P_0 = ${vt(p0)}`), ...q.steps])
  }
  throw Error('Use point, line or plane pairs (or a point and a circle/sphere)')
}

function angle(a: Shape, b: Shape): Out {
  if (b.kind === 'plane' && isLine(a)) [a, b] = [b, a]
  const res = (fn: 'cos' | 'sin', u: number[], v: number[], why: Step): Out => {
    const d = Math.abs(dot3(u as V, v as V)), nn = norm3(u as V) * norm3(v as V), c = d / nn, ang = deg(fn === 'cos' ? Math.acos(Math.min(1, c)) : Math.asin(Math.min(1, c)))
    return { shape: { kind: 'value', value: ang }, summary: lab(`φ = ${fmtDeg(ang)}°`, `φ = ${fmtDeg(ang)}°`), steps: [why, fx(`\\${fn}\\varphi = \\frac{|${dotTex(u, v)}|}{${tx(norm3(u as V))}\\cdot ${tx(norm3(v as V))}} = ${txa(c)} \\;\\Rightarrow\\; \\varphi = ${fmtDeg(ang)}^\\circ`)] }
  }
  if (isLine(a) && isLine(b)) return res('cos', a.v, b.v, st('Sudut dua garis dari vektor arahnya:', 'Angle between two lines from their directions:', '\\cos\\varphi = \\frac{|\\bar v_1\\cdot\\bar v_2|}{|\\bar v_1||\\bar v_2|}'))
  if (a.kind === 'plane' && isLine(b)) return res('sin', a.n, b.v, st('Sudut garis dan bidang (komplemen sudut dengan normal):', 'Angle between a line and a plane (complement of the angle with the normal):', '\\sin\\varphi = \\frac{|\\bar n\\cdot\\bar v|}{|\\bar n||\\bar v|}'))
  if (a.kind === 'plane' && b.kind === 'plane') return res('cos', a.n, b.n, st('Sudut dua bidang dari normalnya:', 'Angle between two planes from their normals:', '\\cos\\varphi = \\frac{|\\bar n_1\\cdot\\bar n_2|}{|\\bar n_1||\\bar n_2|}'))
  throw Error('Angle needs two lines, two planes, or a line and a plane')
}

/** Points where a line meets a circle/sphere: substitute the parametric line, solve the quadratic in t. */
function lineBall(l: Ln, b: Ball, d3: boolean): { pts: V[]; steps: Step[] } {
  const d = d3 ? 3 : 2, w = sub3(l.p, b.p).slice(0, d), v = l.v.slice(0, d)
  const A = v.reduce((s, x) => s + x * x, 0), B = 2 * w.reduce((s, x, i) => s + x * v[i], 0), C = w.reduce((s, x) => s + x * x, 0) - b.r * b.r, disc = B * B - 4 * A * C
  const steps = [st('Substitusikan persamaan parametrik garis ke persamaan pusat-jari-jari:', 'Substitute the parametric line into the centre-radius equation:', lines(
    XYZ.slice(0, d).map((x, i) => `${x} = ${poly([[l.p[i], ''], [l.v[i], 't']])}`).join(',\\; '),
    `${w.map((x, i) => `(${poly([[x, ''], [v[i], 't']])})^2`).join(' + ')} = ${tx(b.r * b.r)}`,
    `${poly([[A, 't^2'], [B, 't'], [C, '']])} = 0,\\quad D = b^2 - 4ac = ${tx(disc)}`))]
  if (disc < -EPS) return { pts: [], steps: [...steps, st('D < 0: tidak ada titik potong real.', 'D < 0: no real intersection.')] }
  const ts = zero(disc) ? [-B / (2 * A)] : [(-B + Math.sqrt(disc)) / (2 * A), (-B - Math.sqrt(disc)) / (2 * A)]
  const pts = ts.map((t) => add3(l.p, scale3(l.v, t)))
  steps.push(st(ts.length === 1 ? 'D = 0: garis menyinggung.' : 'D > 0: dua titik potong.', ts.length === 1 ? 'D = 0: the line is tangent.' : 'D > 0: two intersection points.', lines(ts.map((t, i) => `t_${i + 1} = ${tx(t)}`).join(',\\; '), pts.map((p, i) => `T_${i + 1} = ${pt(p, d3)}`).join(',\\quad '))))
  return { pts, steps }
}
const pointsOut = (pts: V[], steps: Step[], d3: boolean): Out => pts.length
  ? { shape: pts.length === 1 ? { kind: 'point', p: pts[0] } : { kind: 'group', items: pts.map((p): Shape => ({ kind: 'point', p })) }, steps, summary: lab(pts.map((p) => ptt(p, d3)).join(', '), pts.map((p) => ptt(p, d3)).join(', ')) }
  : { shape: { kind: 'value', value: 'no intersection' }, steps, summary: lab('tidak berpotongan', 'no intersection') }

function intersect(a: Shape, b: Shape): Out {
  const order = ['point', 'line', 'segment', 'plane', 'circle', 'sphere']
  if (order.indexOf(a.kind) > order.indexOf(b.kind)) [a, b] = [b, a]
  const d3 = !flat(a, b)
  if (isLine(a) && isLine(b)) {
    const r = linesRelation(a, b)
    if (r.rel !== 'intersect') return { shape: { kind: 'value', value: r.rel }, steps: r.steps, summary: REL[r.rel] }
    if (!d3) {
      const [a1, b1, c1] = eq2(a), [a2, b2, c2] = eq2(b), D = a1 * b2 - a2 * b1, p: V = [(b1 * c2 - b2 * c1) / D, (c1 * a2 - c2 * a1) / D, 0]
      return { shape: { kind: 'point', p }, summary: lab(ptt(p, false), ptt(p, false)), steps: [...r.steps, st('Selesaikan sistem dengan aturan Cramer:', 'Solve the system with Cramer\'s rule:', lines(`\\begin{cases} ${eq2Tex([a1, b1, c1])} \\\\ ${eq2Tex([a2, b2, c2])} \\end{cases}`, `x = \\frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1} = ${tx(p[0])},\\quad y = \\frac{c_1a_2 - c_2a_1}{a_1b_2 - a_2b_1} = ${tx(p[1])}`))] }
    }
    const p = twoLines(a, b).point!, t = dot3(sub3(p, a.p), a.v) / dot3(a.v, a.v), s = dot3(sub3(p, b.p), b.v) / dot3(b.v, b.v)
    return { shape: { kind: 'point', p }, summary: lab(ptt(p, true), ptt(p, true)), steps: [...r.steps, st('Samakan kedua persamaan parametrik dan selesaikan t, s:', 'Equate the parametric equations and solve for t, s:', lines(`\\begin{cases} ${XYZ.map((_, i) => `${poly([[a.p[i], ''], [a.v[i], 't']])} = ${poly([[b.p[i], ''], [b.v[i], 's']])}`).join(' \\\\ ')} \\end{cases}`, `t = ${tx(t)},\\; s = ${tx(s)} \\;\\Rightarrow\\; I = ${vt(p)}`))] }
  }
  if (isLine(a) && b.kind === 'plane') {
    const r = linePlaneRelation(a, b)
    if (r.rel !== 'intersect') return { shape: { kind: 'value', value: r.rel }, steps: r.steps, summary: REL[r.rel] }
    const e = planeRow(b), k = dot3(e.slice(0, 3) as V, b.n) / dot3(b.n, b.n)
    const nv = r.nv * k, c0 = r.c0 * k, t = -c0 / nv, p = add3(a.p, scale3(a.v, t))
    return { shape: { kind: 'point', p }, summary: lab(ptt(p, true), ptt(p, true)), steps: [...r.steps, st('Substitusikan persamaan parametrik garis ke persamaan bidang:', 'Substitute the parametric line into the plane equation:', lines(
      `${combo(e.slice(0, 3), [0, 1, 2].map((i) => `(${poly([[a.p[i], ''], [a.v[i], 't']])})`), e[3])} = 0`,
      `${poly([[nv, 't'], [c0, '']])} = 0 \\;\\Rightarrow\\; t = ${tx(t)}`, `I = ${vt(p)}`))] }
  }
  if (a.kind === 'plane' && b.kind === 'plane') {
    const r = planesRelation(a, b)
    if (r.rel !== 'intersect') return { shape: { kind: 'value', value: r.rel }, steps: r.steps, summary: REL[r.rel] }
    const k = [0, 1, 2].reduce((m, i) => (Math.abs(r.v[i]) > Math.abs(r.v[m]) ? i : m), 0), [i, j] = [0, 1, 2].filter((x) => x !== k)
    const e1 = planeRow(a), e2 = planeRow(b), D = e1[i] * e2[j] - e1[j] * e2[i]
    const p: V = [0, 0, 0]; p[i] = (-e1[3] * e2[j] + e2[3] * e1[j]) / D; p[j] = (-e2[3] * e1[i] + e1[3] * e2[i]) / D
    const l: Ln = { kind: 'line', p, v: intRow(r.v) as V }
    return { shape: l, summary: lineSummary(l, true), steps: [...r.steps, st(`Cari satu titik bersama: ambil ${XYZ[k]} = 0 lalu selesaikan:`, `Find one common point: put ${XYZ[k]} = 0 and solve:`, lines(`\\begin{cases} ${planeTex(e1)} \\\\ ${planeTex(e2)} \\end{cases}`, `P_0 = ${vt(p)}`)), st('Garis potong:', 'Line of intersection:', line3Tex(p, l.v))] }
  }
  if (isLine(a) && (b.kind === 'circle' || b.kind === 'sphere')) { const r = lineBall(a, b, d3); return pointsOut(r.pts, r.steps, d3) }
  if (a.kind === 'circle' && b.kind === 'circle' && !d3) {
    const ax = Circ.radicalAxis(toCircle(a), toCircle(b))
    if (zero(ax.a) && zero(ax.b)) throw Error('Concentric circles: no intersection points (or the same circle)')
    const e = intRow([ax.a, ax.b, ax.c]), r = lineBall(line2(e[0], e[1], e[2]), a, false)
    return pointsOut(r.pts, [st('Kurangkan kedua persamaan: titik potong terletak pada sumbu radikal.', 'Subtract the equations: the common points lie on the radical axis.', lines(genTex(a), genTex(b), eq2Tex(e))), ...r.steps], false)
  }
  if (a.kind === 'plane' && b.kind === 'sphere') return spherePlane(b, a)
  throw Error('Unsupported object pair for this calculation')
}

function spherePlane(s: Ball, p: Pl): Out {
  const q = distPointPlaneSteps(s.p, p), d = q.d
  const steps = [st('Jarak pusat bola ke bidang:', 'Distance from the centre of the sphere to the plane:'), ...q.steps]
  if (d > s.r + EPS) return { shape: { kind: 'value', value: 'no intersection' }, steps: [...steps, st('d > ρ: bidang tidak memotong bola.', 'd > ρ: the plane misses the sphere.')], summary: lab('tidak berpotongan', 'no intersection') }
  const t = -(dot3(p.n, s.p) + p.D) / dot3(p.n, p.n), c = add3(s.p, scale3(p.n, t)), r2 = s.r * s.r - d * d
  steps.push(st('Pusat lingkaran = proyeksi pusat bola ke bidang (garis M + t n):', 'Centre of the circle = projection of the centre onto the plane (line M + t n):', lines(`t = -\\frac{\\bar n\\cdot M + D}{|\\bar n|^2} = ${tx(t)}`, `M' = ${vt(c)}`)))
  if (r2 < EPS) return { shape: { kind: 'point', p: c }, steps: [...steps, st('d = ρ: bidang menyinggung bola di satu titik.', 'd = ρ: the plane touches the sphere at one point.')], summary: lab(`titik singgung ${ptt(c, true)}`, `point of contact ${ptt(c, true)}`) }
  const r = Math.sqrt(r2)
  steps.push(st('Jari-jari lingkaran irisan (Pythagoras):', 'Radius of the section circle (Pythagoras):', `r = \\sqrt{\\rho^2 - d^2} = \\sqrt{${tx(s.r * s.r)} - ${tx(d * d)}} = ${txa(r)}`))
  return { shape: { kind: 'circle', p: c, r, n: p.n }, steps, summary: ballSummary(c, r, true) }
}

function position(a: Shape, b: Shape): Out {
  if (b.kind === 'plane' && isLine(a)) [a, b] = [b, a]
  const r = isLine(a) && isLine(b) ? linesRelation(a, b) : a.kind === 'plane' && isLine(b) ? linePlaneRelation(b, a) : a.kind === 'plane' && b.kind === 'plane' ? planesRelation(a, b) : null
  if (!r) throw Error('position needs two lines, two planes, or a line and a plane')
  return { shape: { kind: 'value', value: r.rel }, steps: r.steps, summary: REL[r.rel] }
}

// ---------- constructions ----------

function foot(P: V, X: Ln | Pl): { f: V; steps: Step[] } {
  if (X.kind === 'plane') {
    const t = -(dot3(X.n, P) + X.D) / dot3(X.n, X.n), f = add3(P, scale3(X.n, t))
    return { f, steps: [st('Garis melalui P dengan arah normal, P + t n, dipotongkan dengan bidang:', 'Line through P along the normal, P + t n, meets the plane:', lines(`t = -\\frac{\\bar n\\cdot P + D}{|\\bar n|^2} = ${ratio(tx(dot3(X.n, P) + X.D), tx(dot3(X.n, X.n)), t, '-')}`, `P' = ${vt(f)}`))] }
  }
  const d3 = !flat(X, { kind: 'point', p: P }), t = dot3(sub3(P, X.p), X.v) / dot3(X.v, X.v), f = add3(X.p, scale3(X.v, t))
  return { f, steps: [st('Titik kaki F = P₀ + t v dengan (P − F)·v = 0:', 'Foot F = P₀ + t v with (P − F)·v = 0:', lines(`t = \\frac{\\overrightarrow{P_0P}\\cdot\\bar v}{|\\bar v|^2} = ${ratio(tx(dot3(sub3(P, X.p), X.v)), tx(dot3(X.v, X.v)), t)}`, `F = ${pt(f, d3)}`))] }
}

function construct(op: 'parallel' | 'perpendicular' | 'projection', a: Shape, b: Shape): Out {
  if (op === 'projection') {
    if (a.kind === 'point' && (isLine(b) || b.kind === 'plane')) { const d3 = !flat(a, b), r = foot(a.p, b); return { shape: { kind: 'point', p: r.f }, steps: r.steps, summary: lab(ptt(r.f, d3), ptt(r.f, d3)) } }
    if (isLine(a) && b.kind === 'plane') {
      const A = foot(a.p, b), B = foot(add3(a.p, a.v), b), v = sub3(B.f, A.f)
      if (norm3(v) < EPS) return { shape: { kind: 'point', p: A.f }, steps: A.steps, summary: lab('garis tegak lurus bidang: proyeksinya titik', 'line perpendicular to the plane: its projection is a point') }
      const l: Ln = { kind: 'line', p: A.f, v: intRow(v) as V }
      return { shape: l, summary: lineSummary(l, true), steps: [st('Proyeksikan dua titik garis ke bidang:', 'Project two points of the line onto the plane:'), ...A.steps, ...B.steps, st('Garis proyeksi:', 'Projected line:', line3Tex(l.p, l.v))] }
    }
    throw Error('projection needs (point, line), (point, plane) or (line, plane)')
  }
  if (op === 'perpendicular' && isLine(a) && isLine(b)) {
    const r = linesRelation(a, b)
    if (r.rel !== 'skew') throw Error('The common perpendicular is defined here for skew lines')
    const w = sub3(b.p, a.p), A = dot3(a.v, a.v), B = dot3(a.v, b.v), C = dot3(b.v, b.v), E = dot3(w, a.v), F = dot3(w, b.v), D = A * C - B * B
    const t = (E * C - B * F) / D, s = (B * E - A * F) / D, P1 = add3(a.p, scale3(a.v, t)), P2 = add3(b.p, scale3(b.v, s))
    const l: Ln = { kind: 'segment', p: P1, v: sub3(P2, P1) }
    return { shape: l, summary: lab(`${vtxt(P1)} – ${vtxt(P2)}, |P₁P₂| = ${txta(norm3(l.v))}`, `${vtxt(P1)} – ${vtxt(P2)}, |P₁P₂| = ${txta(norm3(l.v))}`), steps: [...r.steps,
      st('Titik kaki P₁ = A + t v₁, P₂ = B + s v₂ dengan P₁P₂ ⟂ v₁ dan P₁P₂ ⟂ v₂:', 'Feet P₁ = A + t v₁, P₂ = B + s v₂ with P₁P₂ ⟂ v₁ and P₁P₂ ⟂ v₂:', lines(`\\begin{cases} ${poly([[A, 't'], [-B, 's']])} = ${tx(E)} \\\\ ${poly([[B, 't'], [-C, 's']])} = ${tx(F)} \\end{cases}`, `t = ${tx(t)},\\; s = ${tx(s)}`, `P_1 = ${vt(P1)},\\quad P_2 = ${vt(P2)}`)),
      st('Garis tegak lurus persekutuan (ruas P₁P₂) dan panjangnya:', 'Common perpendicular (segment P₁P₂) and its length:', lines(line3Tex(P1, sub3(P2, P1)), `|P_1P_2| = ${tx(norm3(l.v as V))}`))] }
  }
  if (a.kind !== 'point') throw Error(`${op} needs a point first, e.g. ${op}(P, l)`)
  const P = a.p, d3 = !flat(a, b)
  if (b.kind === 'plane') {
    if (op === 'parallel') { const D = -dot3(b.n, P), q: Pl = { kind: 'plane', n: b.n, D }; return { shape: q, summary: planeSummary(q), steps: [st('Bidang sejajar memakai normal yang sama; D dari titik P:', 'A parallel plane has the same normal; D comes from P:', lines(`D = -\\bar n\\cdot P = -(${dotTex(b.n, P)}) = ${tx(D)}`, planeTex(planeRow(q))))] } }
    const l: Ln = { kind: 'line', p: P, v: intRow(b.n) as V }
    return { shape: l, summary: lineSummary(l, true), steps: [st('Garis tegak lurus bidang berarah normal bidang:', 'A line perpendicular to a plane has the plane\'s normal as direction:', lines(`\\bar v = \\bar n = ${vt(l.v)}`, line3Tex(P, l.v)))] }
  }
  if (!isLine(b)) throw Error(`${op} needs a line or a plane as the second argument`)
  if (op === 'parallel') { const l: Ln = { kind: 'line', p: P, v: intRow(b.v) as V }; return { shape: l, summary: lineSummary(l, d3), steps: [st('Garis sejajar memakai vektor arah yang sama:', 'A parallel line uses the same direction vector:', lines(`\\bar v = ${pt(l.v, d3)}`, lineTex(l, d3)))] } }
  if (!d3) { const l: Ln = { kind: 'line', p: P, v: [-b.v[1], b.v[0], 0] }; return { shape: l, summary: lineSummary(l, false), steps: [st('Arah garis tegak lurus adalah normal garis semula:', 'The perpendicular direction is the normal of the given line:', lines(`\\bar v = (${tx(-b.v[1])}, ${tx(b.v[0])})`, eq2Tex(eq2(l))))] } }
  const r = foot(P, b), v = sub3(r.f, P)
  if (norm3(v) < EPS) throw Error('P lies on the line: in space there are infinitely many perpendiculars')
  const l: Ln = { kind: 'line', p: P, v: intRow(v) as V }
  return { shape: l, summary: lineSummary(l, true), steps: [...r.steps, st('Garis tegak lurus melalui P dan F:', 'The perpendicular through P and F:', lines(`\\overrightarrow{PF} = ${vt(v)}`, line3Tex(P, l.v)))] }
}

// ---------- circles: power, polar, tangent, radical, pencil ----------

const asBall = (s: Shape, op: string): Ball => { if ((s.kind === 'circle' && !s.n) || s.kind === 'sphere') return s; throw Error(`${op} needs a circle or sphere`) }

function power(P: V, b: Ball): Out {
  const d = dimOf(b), vs = XYZ.slice(0, d), m = b.p, sg = sigmaOf(b)
  const val = vs.reduce((s, _, i) => s + (P[i] - m[i]) ** 2, 0) - b.r * b.r
  const sub = combo([...vs.map(() => 1), ...vs.map((_, i) => -2 * m[i])], [...vs.map((_, i) => `(${tx(P[i])})^2`), ...vs.map((_, i) => `\\cdot${par(P[i])}`)], sg)
  const where = zero(val) ? lab('p = 0: P terletak pada lingkaran/bola.', 'p = 0: P lies on the circle/sphere.') : val > 0 ? lab('p > 0: P di luar; panjang garis singgung dari P adalah √p.', 'p > 0: P is outside; the tangent length from P is √p.') : lab('p < 0: P di dalam.', 'p < 0: P is inside.')
  return { shape: { kind: 'value', value: val }, summary: lab(`p(P) = ${txt(val)} (${val > EPS ? 'di luar' : val < -EPS ? 'di dalam' : 'pada'})`, `p(P) = ${txt(val)} (${val > EPS ? 'outside' : val < -EPS ? 'inside' : 'on it'})`), steps: [
    st('Kuasa titik P: substitusikan P ke ruas kiri persamaan umum (Prop. 3.1.9).', 'Power of P: substitute P into the left side of the general equation (Prop. 3.1.9).', lines(genTex(b), `p(P) = ${sub} = ${tx(val)}`)),
    st('Cek: p(P) = |PM|² − ρ².', 'Check: p(P) = |PM|² − ρ².', `${tx(val + b.r * b.r)} - ${tx(b.r * b.r)} = ${tx(val)}`),
    { text: where, tex: val > EPS ? `\\sqrt{p} = ${txa(Math.sqrt(val))}` : undefined }] }
}

function polar(P: V, b: Ball): Out {
  const d = dimOf(b), vs = XYZ.slice(0, d), m = b.p, sg = sigmaOf(b)
  const coef = vs.map((_, i) => P[i] - m[i]), c0 = sg - vs.reduce((s, _, i) => s + m[i] * P[i], 0)
  if (coef.every(zero)) throw Error('The centre has no polar (it would be the line at infinity)')
  const pol = Circ.polar(toCircle(b), [P[0], P[1]])
  const e = d === 2 ? intRow([pol.a, pol.b, pol.c]) : intRow([...coef, c0])
  const general = `${vs.map((x) => `${x}${x}_0`).join(' + ')} ${vs.map((x, i) => `- ${GREEK[i]}(${x} + ${x}_0)`).join(' ')} + \\sigma = 0`
  const sub = `${vs.map((x, i) => `${par(P[i])}${x}`).join(' + ')} ${vs.map((x, i) => `- ${par(m[i])}(${x} + ${par(P[i])})`).join(' ')} + ${par(sg)} = 0`
  const shape: Shape = d === 2 ? line2(e[0], e[1], e[2]) : { kind: 'plane', n: [e[0], e[1], e[2]], D: e[3] }
  const res = d === 2 ? eq2Tex(e) : planeTex(e)
  return { shape, summary: d === 2 ? lineSummary(shape as Ln, false) : planeSummary(shape as Pl), steps: [
    st(`${d === 2 ? 'Garis' : 'Bidang'} polar (kutub) dari P: gandakan persamaan (polarisasi, Vaisman 3.1.21):`, `Polar ${d === 2 ? 'line' : 'plane'} of P: polarise the equation (Vaisman 3.1.21):`, lines(general, sub, res)),
    ...(zero(coef.reduce((a, x) => a + x * x, 0) - b.r * b.r) ? [st('P pada lingkaran/bola, jadi polarnya adalah garis/bidang singgung di P.', 'P lies on the circle/sphere, so its polar is the tangent at P.')] : [])] }
}

function tangent(P: V, b: Ball, pick?: number): Out {
  const pw = Number((power(P, b).shape as { value: number }).value)
  if (zero(pw)) { const o = polar(P, b); return { ...o, steps: [st('p(P) = 0: P pada lingkaran/bola; garis/bidang singgung di P adalah polarnya.', 'p(P) = 0: P is on the circle/sphere; the tangent at P is its polar.'), ...o.steps!] } }
  if (pw < 0) throw Error('P is inside: there is no tangent through P')
  if (b.kind === 'sphere') throw Error('From an outside point the tangents to a sphere form a cone; use polar(P,s) for the plane of contact')
  const pol = polar(P, b), ts = Circ.tangentsFrom(toCircle(b), [P[0], P[1]])
  const tl = ts.map((T): Ln => ({ kind: 'line', p: P, v: [T[0] - P[0], T[1] - P[1], 0] }))
  const steps: Step[] = [st('p(P) > 0: P di luar, ada dua garis singgung; panjang singgung √p.', 'p(P) > 0: P is outside, there are two tangents; tangent length √p.', `p(P) = ${tx(pw)},\\quad \\sqrt{p} = ${txa(Math.sqrt(pw))}`),
    st('Titik singgung terletak pada polar P (tali busur singgung):', 'The points of contact lie on the polar of P (chord of contact):', pol.steps![0].tex),
    st('Potongkan polar dengan lingkaran:', 'Intersect the polar with the circle:', ts.map((T, i) => `T_${i + 1} = ${vt(T)}`).join(',\\quad ')),
    st('Garis singgung PT₁ dan PT₂:', 'Tangent lines PT₁ and PT₂:', lines(...tl.map((l) => eq2Tex(eq2(l)))))]
  if (pick === 1 || pick === 2) return { shape: tl[pick - 1], steps, summary: lineSummary(tl[pick - 1], false) }
  const s = tl.map((l) => lineSummary(l, false).en).join(';  ')
  return { shape: { kind: 'group', items: tl }, steps, summary: lab(s, s) }
}

function radical(bs: Ball[]): Out {
  if (bs.length === 2) {
    const [a, b] = bs
    if (a.kind !== b.kind) throw Error('Use two circles or two spheres')
    const d = dimOf(a), coef = XYZ.slice(0, d).map((_, i) => 2 * (b.p[i] - a.p[i])), c0 = sigmaOf(a) - sigmaOf(b)
    if (coef.every(zero)) throw Error('Concentric circles/spheres have no radical axis')
    const e = intRow([...coef, c0])
    const shape: Shape = d === 2 ? line2(e[0], e[1], e[2]) : { kind: 'plane', n: [e[0], e[1], e[2]], D: e[3] }
    return { shape, summary: d === 2 ? lineSummary(shape as Ln, false) : planeSummary(shape as Pl), steps: [st(`${d === 2 ? 'Sumbu' : 'Bidang'} radikal: tempat titik dengan kuasa sama, p₁(X) = p₂(X), jadi kurangkan kedua persamaan:`, `Radical ${d === 2 ? 'axis' : 'plane'}: points of equal power, p₁(X) = p₂(X), so subtract the equations:`, lines(`\\Gamma_1: ${genTex(a)}`, `\\Gamma_2: ${genTex(b)}`, `\\Gamma_1 - \\Gamma_2: ${d === 2 ? eq2Tex(e) : planeTex(e)}`))] }
  }
  if (bs.some((b) => b.kind !== 'circle')) throw Error('The radical centre needs three circles')
  const l12 = Circ.radicalAxis(toCircle(bs[0]), toCircle(bs[1])), l13 = Circ.radicalAxis(toCircle(bs[0]), toCircle(bs[2]))
  const e1 = intRow([l12.a, l12.b, l12.c]), e2 = intRow([l13.a, l13.b, l13.c]), D = e1[0] * e2[1] - e2[0] * e1[1]
  const steps = [st('Sumbu radikal Γ₁Γ₂ dan Γ₁Γ₃:', 'Radical axes Γ₁Γ₂ and Γ₁Γ₃:', lines(eq2Tex(e1), eq2Tex(e2)))]
  if (zero(D)) return { shape: { kind: 'value', value: 'no radical centre' }, steps: [...steps, st('Sumbu-sumbunya sejajar (pusat segaris): tidak ada pusat radikal.', 'The axes are parallel (collinear centres): no radical centre.')], summary: lab('tidak ada pusat radikal', 'no radical centre') }
  const p: V = [(e1[1] * e2[2] - e2[1] * e1[2]) / D, (e1[2] * e2[0] - e2[2] * e1[0]) / D, 0]
  return { shape: { kind: 'point', p }, summary: lab(`pusat radikal ${ptt(p, false)}`, `radical centre ${ptt(p, false)}`), steps: [...steps, st('Pusat radikal = titik potong kedua sumbu (kuasanya sama terhadap ketiga lingkaran):', 'Radical centre = intersection of the axes (equal power to all three circles):', `R = ${vt(p.slice(0, 2))},\\quad p_1(R) = p_2(R) = p_3(R) = ${tx(Circ.power(toCircle(bs[0]), [p[0], p[1]]))}`)] }
}

function pencil(a: Ball, b: Ball, l: number): Out {
  if (a.kind !== 'circle' || b.kind !== 'circle') throw Error('pencil needs two circles')
  const c = Circ.pencil(toCircle(a), toCircle(b), l), r2 = Circ.radius2(c)
  const m: V = [c.alpha, c.beta, 0]
  const steps = [st('Anggota berkas: Γ_λ = λΓ₁ + (1 − λ)Γ₂ = 0 (koefisien x² + y² tetap 1).', 'Member of the pencil: Γ_λ = λΓ₁ + (1 − λ)Γ₂ = 0 (the x² + y² coefficient stays 1).', lines(`${tx(l)}\\left(${genTex(a).replace(' = 0', '')}\\right) + ${par(1 - l)}\\left(${genTex(b).replace(' = 0', '')}\\right) = 0`,
    `${poly([[1, 'x^2'], [1, 'y^2'], [-2 * c.alpha, 'x'], [-2 * c.beta, 'y'], [c.sigma, '']])} = 0`)),
  st('Pusat dan jari-jari:', 'Centre and radius:', `M = ${vt([c.alpha, c.beta])},\\quad \\rho^2 = \\alpha^2 + \\beta^2 - \\sigma = ${tx(r2)}`)]
  if (r2 <= EPS) return { shape: { kind: 'point', p: m }, steps: [...steps, st('ρ² ≤ 0: anggota ini lingkaran titik/imajiner.', 'ρ² ≤ 0: this member is a point or imaginary circle.')], summary: lab('lingkaran titik/imajiner', 'point or imaginary circle') }
  return { shape: { kind: 'circle', p: m, r: Math.sqrt(r2) }, steps, summary: ballSummary(m, Math.sqrt(r2), false) }
}

// ---------- dispatcher ----------

export const COMMANDS = ['point', 'line', 'segment', 'circle', 'sphere', 'plane', 'distance', 'intersect', 'angle', 'area', 'volume', 'center', 'centre', 'radius', 'power', 'polar', 'tangent', 'radical', 'pencil', 'classify', 'position', 'parallel', 'perpendicular', 'projection', 'affine', 'rotate', 'reflect', 'translate', 'scale', 'apply']

export function command(op: string, args: string[], ctx: Ctx): Out {
  const need = (...ns: number[]) => { if (!ns.includes(args.length)) throw Error(`${op} needs ${ns.join(' or ')} argument${ns.at(-1) === 1 ? '' : 's'}`) }
  const obj = (i: number) => ctx.shape(args[i])
  switch (op) {
    case 'point': return { shape: { kind: 'point', p: ctx.point(`(${args.join(',')})`) } }
    case 'line': case 'segment': {
      need(2); const p = ctx.point(args[0]), q = ctx.point(args[1]), v = sub3(q, p)
      if (norm3(v) < 1e-10) throw Error('Choose two distinct points')
      const d3 = !(zero(p[2]) && zero(q[2])), l: Ln = { kind: op, p, v }
      const steps = [st('Vektor arah dari dua titik:', 'Direction vector from the two points:', `\\bar v = \\overrightarrow{AB} = ${pt(q, d3)} - ${pt(p, d3)} = ${pt(v, d3)}`), d3 ? st('Persamaan parametrik dan kanonik:', 'Parametric and canonical equations:', line3Tex(p, v)) : st('Persamaan umum: v₂(x − x_A) − v₁(y − y_A) = 0:', 'General equation: v₂(x − x_A) − v₁(y − y_A) = 0:', eq2Tex(eq2(l)))]
      if (op === 'segment') steps.push(st('Panjang ruas:', 'Segment length:', `|AB| = ${normTex(d3 ? v : v.slice(0, 2))}`))
      return { shape: l, steps, summary: op === 'segment' ? lab(`panjang ${txta(norm3(v))}`, `length ${txta(norm3(v))}`) : lineSummary(l, d3) }
    }
    case 'circle': case 'sphere': {
      need(2); const p = ctx.point(args[0])
      // second argument: a radius, or a point on the circle (so dragging that point resizes it)
      let r: number; try { r = norm3(sub3(ctx.point(args[1]), p)) } catch { r = ctx.scalar(args[1]) }
      if (r <= 0) throw Error('Radius must be positive'); return ballDef(op, p, r) }
    case 'plane': {
      need(3, 4)
      if (args.length === 4) { const [a, b, c, D] = args.map(ctx.scalar); const n: V = [a, b, c]; if (norm3(n) < 1e-10) throw Error('Plane normal cannot be zero'); const s: Pl = { kind: 'plane', n, D }; return { shape: s, summary: planeSummary(s) } }
      const [A, B, C] = args.map(ctx.point), u = sub3(B, A), w = sub3(C, A), n = cross3(u, w)
      if (norm3(n) < 1e-10) throw Error('The three points are collinear')
      const s: Pl = { kind: 'plane', n, D: -dot3(n, A) }
      return { shape: s, summary: planeSummary(s), steps: [st('Normal = hasil kali silang dua vektor pada bidang:', 'Normal = cross product of two vectors in the plane:', lines(`\\overrightarrow{AB} = ${vt(u)},\\; \\overrightarrow{AC} = ${vt(w)}`, `\\bar n = \\overrightarrow{AB}\\times\\overrightarrow{AC} = ${vt(n)}`)), st('Bidang melalui A: n·(X − A) = 0:', 'Plane through A: n·(X − A) = 0:', planeTex(planeRow(s)))] }
    }
    case 'distance': need(2); return distance(obj(0), obj(1))
    case 'angle': need(2); return angle(obj(0), obj(1))
    case 'intersect': need(2); return intersect(obj(0), obj(1))
    case 'position': need(2); return position(obj(0), obj(1))
    case 'parallel': case 'perpendicular': case 'projection': need(2); return construct(op, obj(0), obj(1))
    case 'area': case 'volume': {
      need(1); const a = obj(0)
      if (op === 'area' && (a.kind === 'circle' || a.kind === 'sphere')) { const v = Math.PI * a.r ** 2 * (a.kind === 'sphere' ? 4 : 1); return { shape: { kind: 'value', value: v }, steps: [st(a.kind === 'sphere' ? 'Luas permukaan bola:' : 'Luas lingkaran:', a.kind === 'sphere' ? 'Surface area of a sphere:' : 'Area of a circle:', `${a.kind === 'sphere' ? 'L = 4\\pi\\rho^2' : 'L = \\pi\\rho^2'} = ${a.kind === 'sphere' ? '4' : ''}\\pi\\cdot${par(a.r)}^2 = ${tx(v / Math.PI)}\\pi \\approx ${+v.toPrecision(6)}`)] } }
      if (op === 'volume' && a.kind === 'sphere') { const v = (4 / 3) * Math.PI * a.r ** 3; return { shape: { kind: 'value', value: v }, steps: [st('Volume bola:', 'Volume of a sphere:', `V = \\tfrac{4}{3}\\pi\\rho^3 = \\tfrac{4}{3}\\pi\\cdot${par(a.r)}^3 = ${tx(v / Math.PI)}\\pi \\approx ${+v.toPrecision(6)}`)] } }
      throw Error('Unsupported object pair for this calculation')
    }
    case 'center': case 'centre': {
      need(1); const a = obj(0)
      if (a.kind === 'circle' || a.kind === 'sphere') { const d3 = a.kind === 'sphere' || !zero(a.p[2]); return { shape: { kind: 'point', p: a.p }, summary: lab(ptt(a.p, d3), ptt(a.p, d3)), steps: [st('Dari bentuk umum: pusat (α, β(, γ)).', 'From the general form: centre (α, β(, γ)).', genTex(a))] } }
      const cls = classify(a), g = cls.shape.kind === 'group' ? cls.shape.items.find((s) => s.kind === 'point') : undefined
      const hasCentre = a.kind === 'conic' || a.kind === 'curve' || a.kind === 'implicit' ? !zero(analyzeConic(conicFrom(a)).delta) : !zero(invariants(quadricFrom(a)).delta)
      if (!g || !hasCentre) throw Error('δ = 0: no unique centre (see classify for the vertex or the line of centres)')
      const step = cls.steps!.find((s) => s.text?.en.startsWith('Centre'))!
      return { shape: g, steps: [step], summary: lab(ptt((g as { p: V }).p, a.kind === 'quadric'), ptt((g as { p: V }).p, a.kind === 'quadric')) }
    }
    case 'radius': { need(1); const a = obj(0); if (a.kind !== 'circle' && a.kind !== 'sphere') throw Error('radius needs a circle or sphere'); return { shape: { kind: 'value', value: a.r }, summary: lab(`r = ${txta(a.r)}`, `r = ${txta(a.r)}`), steps: [st('ρ² = α² + β² (+ γ²) − σ dari bentuk umum:', 'ρ² = α² + β² (+ γ²) − σ from the general form:', lines(genTex(a), `\\rho = ${rootTex(a.r * a.r)}`))] } }
    case 'power': need(2); return power(ctx.point(args[0]), asBall(obj(1), op))
    case 'polar': need(2); return polar(ctx.point(args[0]), asBall(obj(1), op))
    case 'tangent': need(2, 3); return tangent(ctx.point(args[0]), asBall(obj(1), op), args[2] ? ctx.scalar(args[2]) : undefined)
    case 'radical': need(2, 3); return radical(args.map((_, i) => asBall(obj(i), op)))
    case 'pencil': need(3); return pencil(asBall(obj(0), op), asBall(obj(1), op), ctx.scalar(args[2]))
    case 'classify': need(1); return classify(obj(0))
    case 'affine': { need(6); const [a, b, c, d, e, f] = args.map(ctx.scalar); return trOut([a, b, c, d], [e, f]) }
    case 'rotate': {
      need(1, 2); const th = ctx.scalar(args[0]), r = (th * Math.PI) / 180, m: M2 = [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)].map(cl) as M2
      const P = args[1] ? ctx.point(args[1]) : ([0, 0, 0] as V), c = pointAbout(P, m)
      return trOut(m, c, [st(`Rotasi sebesar θ = ${fmtDeg(th)}° terhadap ${ptt(P, false)}: X′ = P + R_θ(X − P).`, `Rotation by θ = ${fmtDeg(th)}° about ${ptt(P, false)}: X′ = P + R_θ(X − P).`, `R_\\theta = \\begin{pmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix} = ${pm([[m[0], m[1]], [m[2], m[3]]])}`)])
    }
    case 'reflect': {
      need(1); const s = obj(0)
      if (s.kind === 'point') return trOut([-1, 0, 0, -1], [2 * s.p[0], 2 * s.p[1]], [st('Pencerminan terhadap titik P (setengah putaran): X′ = 2P − X.', 'Reflection in the point P (half-turn): X′ = 2P − X.')])
      if (!isLine(s) || !flat(s)) throw Error('reflect needs a 2D line or a point')
      const n2 = s.v[0] ** 2 + s.v[1] ** 2, c2 = (s.v[0] ** 2 - s.v[1] ** 2) / n2, s2 = (2 * s.v[0] * s.v[1]) / n2, m: M2 = [c2, s2, s2, -c2]
      return trOut(m, pointAbout(s.p, m), [st('Pencerminan terhadap garis berarah v (sudut φ): X′ = P₀ + S(X − P₀).', 'Reflection in the line with direction v (angle φ): X′ = P₀ + S(X − P₀).', lines(`\\cos 2\\varphi = \\frac{v_1^2 - v_2^2}{|\\bar v|^2} = ${tx(c2)},\\; \\sin 2\\varphi = \\frac{2v_1v_2}{|\\bar v|^2} = ${tx(s2)}`, `S = ${pm([[m[0], m[1]], [m[2], m[3]]])}`))])
    }
    case 'translate': { need(1, 2); const v = args.length === 2 ? [ctx.scalar(args[0]), ctx.scalar(args[1])] : ctx.point(args[0]); return trOut([1, 0, 0, 1], [v[0], v[1]], [st('Translasi: X′ = X + v.', 'Translation: X′ = X + v.')]) }
    case 'scale': { need(1, 2); const k = ctx.scalar(args[0]), P = args[1] ? ctx.point(args[1]) : ([0, 0, 0] as V), m: M2 = [k, 0, 0, k]; return trOut(m, pointAbout(P, m), [st(`Homoteti rasio ${txt(k)} pusat ${ptt(P, false)}: X′ = P + k(X − P).`, `Homothety with ratio ${txt(k)} about ${ptt(P, false)}: X′ = P + k(X − P).`)]) }
    case 'apply': { need(2); const T = obj(0); if (T.kind !== 'transform') throw Error('apply(T, X): T must be a map such as affine(...) or rotate(...)'); return applyTransform(T, obj(1)) }
  }
  throw Error(`Unknown command: ${op}`)
}

function classify(s: Shape): Out {
  if (s.kind === 'transform') return classifyTransform(s)
  if (s.kind === 'quadric' || s.kind === 'sphere' || s.kind === 'surface') return classifyQuadric(quadricFrom(s))
  return classifyConic(conicFrom(s))
}
