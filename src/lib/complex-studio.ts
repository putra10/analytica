/**
 * Complex Functions Studio engine. Each row is a number, a function, a path or a command;
 * every answer carries bilingual hand working (KaTeX) and marks for the Argand plane.
 * Symbolic where the input allows (polynomial / rational u, v; derivatives; exact surds and
 * multiples of π are recognised in the numbers), numeric with stated checks otherwise.
 */
import * as Cx from './complex-math'
import type { Complex } from './complex-math'
import { evaluate, freeVars, parse, type Node } from './expr'

const { C } = Cx
const TAU = 2 * Math.PI

// ------------------------------------------------------------------ public types

export interface Bi { id: string; en: string }
export interface Step extends Bi { tex?: string }
export type Tone = 'point' | 'root' | 'pole' | 'essential' | 'removable' | 'branch' | 'zero'
export type Mark =
  | { kind: 'point'; z: Complex; label?: string; tone?: Tone; vector?: boolean }
  | { kind: 'circle'; c: Complex; r: number; dashed?: boolean; arrow?: boolean }
  | { kind: 'poly'; pts: Complex[]; closed?: boolean; dashed?: boolean; arrow?: boolean; infinite?: boolean }
  | { kind: 'region'; test: (z: Complex) => boolean; box: [number, number, number, number] }
export interface Entry { id: string; text: string }
export interface Row {
  entry: Entry; name: string; answer?: string; note?: Bi; steps: Step[]; marks: Mark[]; error?: Bi
  /** main numeric value (for checks and later rows) */
  value?: Complex; values?: Complex[]
}

type Env = Record<string, Complex>
interface Fn { name: string; ast: Node; env: Env; f: (z: Complex) => Complex; analytic: boolean; xy: boolean }
type Path = { kind: 'circle'; c: Complex; r: number } | { kind: 'segment'; a: Complex; b: Complex } | { kind: 'polygon'; pts: Complex[] }
interface Ctx { nums: Env; fns: Record<string, Fn>; paths: Record<string, Path> }
interface Out { answer: string; note?: Bi; steps: Step[]; marks: Mark[]; value?: Complex; values?: Complex[]; path?: Path; fn?: Fn }

const st = (id: string, en: string, tex?: string): Step => ({ id, en, tex })
const bi = (id: string, en: string): Bi => ({ id, en })
class StudioError extends Error {
  bi: Bi
  constructor(b: Bi) { super(b.en); this.bi = b }
}
function fail(id: string, en: string): never { throw new StudioError(bi(id, en)) }

// ------------------------------------------------------------------ exact-value recognition

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }

/** Best rational p/q (q ≤ maxQ) within a relative 1e-10, by continued fractions. */
function ratio(x: number, maxQ: number, tol = 1e-10): [number, number] | null {
  if (!Number.isFinite(x)) return null
  const sign = x < 0 ? -1 : 1, v = Math.abs(x)
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0, a = v
  for (let i = 0; i < 40; i++) {
    const ai = Math.floor(a), h2 = ai * h1 + h0, k2 = ai * k1 + k0
    if (k2 > maxQ) break
    h0 = h1; h1 = h2; k0 = k1; k1 = k2
    if (Math.abs(h1 / k1 - v) <= tol * Math.max(1, v)) return [sign * h1, k1]
    const frac = a - ai
    if (frac < 1e-15) break
    a = 1 / frac
  }
  return null
}
const fracTex = (p: number, q: number) => q === 1 ? String(p) : `${p < 0 ? '-' : ''}\\frac{${Math.abs(p)}}{${q}}`
const piTex = (p: number, q: number) => { const a = Math.abs(p), top = a === 1 ? '\\pi' : `${a}\\pi`; return (p < 0 ? '-' : '') + (q === 1 ? top : `\\frac{${top}}{${q}}`) }
function surd(x: number): string | null {
  const sq = ratio(x * x, 1000)
  if (!sq || sq[0] <= 0) return null
  let n = sq[0] * sq[1], out = 1
  if (n > 1e7) return null
  for (let d = 2; d * d <= n; d++) while (n % (d * d) === 0) { n /= d * d; out *= d }
  if (n === 1) return null
  const g = gcd(out, sq[1]), num = out / g, den = sq[1] / g, body = `${num === 1 ? '' : num}\\sqrt{${n}}`
  return (x < 0 ? '-' : '') + (den === 1 ? body : `\\frac{${body}}{${den}}`)
}
/** (a + b√k)/q for small integers, e.g. (1 + √3)/2 */
function sumSurd(x: number): string | null {
  for (let q = 1; q <= 12; q++) for (let m = 1; m <= 12; m++) for (const b of [m, -m]) for (const k of [2, 3, 5, 6]) {
    const a = x * q - b * Math.sqrt(k), ar = Math.round(a)
    if (ar === 0 || Math.abs(a - ar) > 1e-9 || Math.abs(ar) > 60 || gcd(gcd(ar, b), q) !== 1) continue
    const top = `${ar} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sqrt{${k}}`
    return q === 1 ? top : `\\frac{${top}}{${q}}`
  }
  return null
}
const dec = (x: number) => {
  const a = Math.abs(x)
  if (a >= 1e6 || a < 1e-4) { const [m, e] = x.toExponential(3).split('e'); return `${+m}\\times 10^{${+e}}` }
  return String(+x.toPrecision(5))
}
/** TeX for a real number: exact (fraction, surd, multiple of π) when recognisable. */
export function rx(x: number): { tex: string; exact: boolean } {
  if (Number.isNaN(x)) return { tex: '\\text{?}', exact: false }
  if (!Number.isFinite(x)) return { tex: x > 0 ? '\\infty' : '-\\infty', exact: true }
  if (Math.abs(x) < 1e-10) return { tex: '0', exact: true }
  const r = ratio(x, 5040); if (r) return { tex: fracTex(...r), exact: true }
  const p = ratio(x / Math.PI, 24); if (p && Math.abs(p[0]) <= 200) return { tex: piTex(...p), exact: true }
  for (const [k, kt] of [[Math.E, 'e'], [Math.PI * Math.E, '\\pi e']] as const) {
    const q = ratio(x / k, 12)
    if (q && Math.abs(q[0]) <= 60) { const a = Math.abs(q[0]), top = `${a === 1 ? '' : a}${kt}`; return { tex: (q[0] < 0 ? '-' : '') + (q[1] === 1 ? top : `\\frac{${top}}{${q[1]}}`), exact: true } }
  }
  const s = surd(x) ?? sumSurd(x); if (s) return { tex: s, exact: true }
  return { tex: dec(x), exact: false }
}
const hasOps = (t: string) => / [+-] /.test(t) && !t.startsWith('\\frac')
/** TeX for a complex number a + bi. */
export function cx(z: Complex): { tex: string; exact: boolean } {
  const a = rx(z.re), b = rx(z.im), exact = a.exact && b.exact
  if (b.tex === '0') return { tex: a.tex, exact }
  const neg = b.tex.startsWith('-'), babs = neg ? b.tex.slice(1) : b.tex
  const im = babs === '1' ? 'i' : hasOps(babs) ? `\\left(${babs}\\right)i` : babs.includes('\\') ? `${babs}\\,i` : `${babs}i`
  if (a.tex === '0') return { tex: (neg ? '-' : '') + im, exact }
  return { tex: `${a.tex} ${neg ? '-' : '+'} ${im}`, exact }
}
const show = (z: Complex) => { const c = cx(z); return c.exact ? c.tex : `\\approx ${c.tex}` }
const eqs = (z: Complex) => { const c = cx(z); return `${c.exact ? '=' : '\\approx'} ${c.tex}` }
const eqr = (x: number) => { const c = rx(x); return `${c.exact ? '=' : '\\approx'} ${c.tex}` }
/** Parenthesise a TeX value that would be ambiguous as a factor. */
const pp = (t: string) => /^-|.[+-]|\\times/.test(t) ? `\\left(${t}\\right)` : t
const ppz = (z: Complex) => pp(cx(z).tex)
const tidy = (z: Complex): Complex => { const s = 1e-12 * Math.max(1, Cx.abs(z)); return C(Math.abs(z.re) < s ? 0 : z.re, Math.abs(z.im) < s ? 0 : z.im) }
const near = (a: Complex, b: Complex, tol = 1e-6) => Cx.abs(Cx.sub(a, b)) < tol * (1 + Cx.abs(a))
const Arg = (z: Complex) => { const t = Math.atan2(z.im === 0 ? 0 : z.im, z.re); return t <= -Math.PI + 1e-15 ? Math.PI : t }
/** "e^{iθ}" style polar TeX. */
function expTex(r: number, th: number): string {
  const rT = rx(r).tex, tT = rx(th).tex
  const ang = tT === '0' ? '' : tT.startsWith('-') ? `-i${tT.slice(1)}` : `i${tT}`
  return `${Math.abs(r - 1) < 1e-12 && ang ? '' : rT}${ang ? `e^{${ang}}` : ''}`
}
/** Plain-text label for the SVG picture (not TeX). */
const lab = (z: Complex) => {
  const f = (x: number) => String(+x.toFixed(2)), a = Math.abs(z.re) < 5e-3 ? 0 : z.re, b = Math.abs(z.im) < 5e-3 ? 0 : z.im
  const s = b === 0 ? f(a) : `${a === 0 ? '' : f(a)}${b < 0 ? '-' : a === 0 ? '' : '+'}${Math.abs(b) === 1 ? '' : f(Math.abs(b))}i`
  return s.replace(/-/g, '−')
}
const SUB = '₀₁₂₃₄₅₆₇₈₉', subs = (k: number) => String(k).split('').map((d) => SUB[+d]).join('')
/** TeX for z − a, e.g. z + 1, z − (1 + i). */
const zm = (a: Complex) => {
  if (a.re === 0 && a.im === 0) return 'z'
  const t = cx(a).tex
  return t.startsWith('-') && !hasOps(t.slice(1)) ? `z + ${t.slice(1)}` : hasOps(t) ? `z - \\left(${t}\\right)` : `z - ${t}`
}
const fact = (n: number) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f }

// ------------------------------------------------------------------ expression trees

const prec = (n: Node) => n.t === 'bin' ? (n.op === '+' || n.op === '-' ? 1 : n.op === '^' ? 3 : 2) : n.t === 'neg' ? 1.5 : n.t === 'call' && n.fn === 'exp' ? 3 : 4
const FN_TEX: Record<string, string> = { exp: 'e^{#}', log: '\\operatorname{Log}#', ln: '\\ln#', sin: '\\sin#', cos: '\\cos#', tan: '\\tan#', sinh: '\\sinh#', cosh: '\\cosh#', tanh: '\\tanh#', sqrt: '\\sqrt{#}', conj: '\\overline{#}', abs: '\\left|#\\right|', re: '\\operatorname{Re}#', im: '\\operatorname{Im}#', arg: '\\operatorname{Arg}#' }
/** TeX of an expression tree; `sub` replaces variable names (for substitution steps). */
export function texNode(n: Node, sub: Record<string, string> = {}): string {
  const t = (m: Node) => texNode(m, sub)
  const w = (m: Node, min: number) => prec(m) < min ? `\\left(${t(m)}\\right)` : t(m)
  switch (n.t) {
    case 'num': return Number.isInteger(n.v) ? String(n.v) : String(+n.v.toPrecision(8))
    case 'var': return sub[n.name] ?? (n.name === 'pi' ? '\\pi' : n.name)
    case 'neg': return `-${w(n.a, 2)}`
    case 'call': return FN_TEX[n.fn].replace('#', ['exp', 'sqrt', 'conj', 'abs'].includes(n.fn) ? t(n.a) : `\\left(${t(n.a)}\\right)`)
    case 'bin':
      switch (n.op) {
        case '+': return n.b.t === 'neg' ? `${t(n.a)} - ${w(n.b.a, 2)}` : `${t(n.a)} + ${t(n.b)}`
        case '-': return `${t(n.a)} - ${w(n.b, 2)}`
        case '/': return `\\frac{${t(n.a)}}{${t(n.b)}}`
        case '^': return `${w(n.a, 4)}^{${t(n.b)}}`
        case '*': {
          const a = w(n.a, 2), b = w(n.b, 2)
          if (/\d$/.test(a) && /^\d/.test(b)) return `${a} \\cdot ${b}`
          return /[a-zA-Z]$/.test(a) && /^[a-zA-Z]/.test(b) ? `${a}\\,${b}` : `${a}${b}`
        }
      }
  }
  throw new Error('bad node')
}

const num = (v: number): Node => v < 0 ? { t: 'neg', a: { t: 'num', v: -v } } : { t: 'num', v }
const bin = (op: '+' | '-' | '*' | '/' | '^', a: Node, b: Node): Node => ({ t: 'bin', op, a, b })
const call = (fn: string, a: Node): Node => ({ t: 'call', fn, a })
const isNum = (n: Node, v?: number) => n.t === 'num' && (v === undefined || n.v === v)
const hasZ = (n: Node) => freeVars(n).has('z')

/** Light algebraic clean-up (0, 1, constant folding) so derivatives read like hand work. */
function simp(n: Node): Node {
  if (n.t === 'neg') { const a = simp(n.a); return isNum(a, 0) ? a : a.t === 'neg' ? a.a : { t: 'neg', a } }
  if (n.t === 'call') return call(n.fn, simp(n.a))
  if (n.t !== 'bin') return n
  const a = simp(n.a), b = simp(n.b)
  if (a.t === 'num' && b.t === 'num' && n.op !== '/') {
    const v = n.op === '+' ? a.v + b.v : n.op === '-' ? a.v - b.v : n.op === '*' ? a.v * b.v : a.v ** b.v
    if (Number.isInteger(v) && Math.abs(v) < 1e9) return num(v)
  }
  switch (n.op) {
    case '+': if (isNum(a, 0)) return b; if (isNum(b, 0)) return a; if (b.t === 'neg') return bin('-', a, b.a); break
    case '-': if (isNum(b, 0)) return a; if (isNum(a, 0)) return simp({ t: 'neg', a: b }); if (b.t === 'neg') return bin('+', a, b.a); break
    case '*':
      if (isNum(a, 0) || isNum(b, 0)) return num(0)
      if (isNum(a, 1)) return b
      if (isNum(b, 1)) return a
      if (a.t === 'neg') return simp({ t: 'neg', a: bin('*', a.a, b) })
      if (b.t === 'neg') return simp({ t: 'neg', a: bin('*', a, b.a) })
      if (b.t === 'num' && a.t !== 'num') return simp(bin('*', b, a))
      if (a.t === 'num' && b.t === 'bin' && b.op === '*' && b.a.t === 'num') return simp(bin('*', num(a.v * b.a.v), b.b))
      break
    case '/': if (isNum(a, 0)) return num(0); if (isNum(b, 1)) return a; break
    case '^': if (isNum(b, 1)) return a; if (isNum(b, 0)) return num(1); break
  }
  return bin(n.op, a, b)
}

/** Symbolic d/dz for expressions built from analytic functions. */
function dz(n: Node, env: Env): Node {
  if (!hasZ(n)) {
    const fv = freeVars(n)
    if (fv.has('x') || fv.has('y')) fail('Turunan kompleks memerlukan f sebagai fungsi z (bukan x, y terpisah).', 'A complex derivative needs f written in z (not separate x, y).')
    return num(0)
  }
  switch (n.t) {
    case 'var': return num(1)
    case 'neg': return { t: 'neg', a: dz(n.a, env) }
    case 'num': return num(0)
    case 'call': {
      const a = n.a, outer: Record<string, () => Node> = {
        exp: () => n, log: () => bin('/', num(1), a), ln: () => bin('/', num(1), a), sin: () => call('cos', a), cos: () => ({ t: 'neg', a: call('sin', a) }),
        tan: () => bin('/', num(1), bin('^', call('cos', a), num(2))), sinh: () => call('cosh', a), cosh: () => call('sinh', a),
        tanh: () => bin('/', num(1), bin('^', call('cosh', a), num(2))), sqrt: () => bin('/', num(1), bin('*', num(2), n)),
      }
      if (!outer[n.fn]) fail(`${n.fn}(·) tidak analitik, jadi tidak ada aturan turunan kompleks.`, `${n.fn}(·) is not analytic, so there is no complex derivative rule.`)
      return bin('*', outer[n.fn](), dz(a, env))
    }
    case 'bin': {
      const { a, b } = n
      switch (n.op) {
        case '+': case '-': return bin(n.op, dz(a, env), dz(b, env))
        case '*': return bin('+', bin('*', dz(a, env), b), bin('*', a, dz(b, env)))
        case '/': return bin('/', bin('-', bin('*', dz(a, env), b), bin('*', a, dz(b, env))), bin('^', b, num(2)))
        case '^': {
          if (!hasZ(b)) {
            const e = evaluate(b, env)
            const bn = Math.abs(e.im) < 1e-14 ? num(e.re) : b, em = Math.abs(e.im) < 1e-14 ? num(e.re - 1) : bin('-', b, num(1))
            return bin('*', bin('*', bn, bin('^', a, em)), dz(a, env))
          }
          if (!hasZ(a)) {
            const base = bin('*', n, dz(b, env))
            return a.t === 'var' && a.name === 'e' ? base : bin('*', base, call('log', a))
          }
          return dz(call('exp', bin('*', b, call('log', a))), env)
        }
      }
    }
  }
  throw new Error('bad node')
}

const NONANALYTIC = new Set(['conj', 'abs', 're', 'im', 'arg'])
const isAnalytic = (n: Node): boolean =>
  n.t === 'var' ? n.name !== 'x' && n.name !== 'y' : n.t === 'num' ? true : n.t === 'neg' ? isAnalytic(n.a) : n.t === 'call' ? !NONANALYTIC.has(n.fn) && isAnalytic(n.a) : isAnalytic(n.a) && isAnalytic(n.b)

function parseOrFail(s: string): Node {
  try { return parse(s) } catch (e) {
    const m = e instanceof Error ? e.message : String(e)
    return fail(`Tidak dapat membaca "${s}" (${m}).`, `Cannot read "${s}" (${m}).`)
  }
}
function makeFn(src: string, ctx: Ctx, name = '', xy = false): Fn {
  const ast = parseOrFail(src)
  const env: Env = { ...ctx.nums }
  delete env.z
  for (const v of freeVars(ast)) {
    if (xy && v === 'z') fail('Fungsi u(x, y) hanya memakai x dan y.', 'A function u(x, y) uses x and y only.')
    if (!['z', 'x', 'y', 'i', 'e', 'pi'].includes(v) && !(v in env)) fail(`Variabel ${v} belum didefinisikan.`, `Unknown variable ${v}.`)
  }
  const e: Env = { ...env }
  const f = (z: Complex) => { e.z = z; e.x = C(z.re); e.y = C(z.im); return evaluate(ast, e) }
  return { name, ast, env, f, analytic: isAnalytic(ast), xy }
}
const fnTex = (F: Fn) => texNode(F.ast)
const fnArg = (s: string, ctx: Ctx) => ctx.fns[s.trim()] ?? makeFn(s, ctx)
function numArg(s: string, ctx: Ctx): Complex {
  const t = s.trim()
  if (!t) fail('Argumen kosong.', 'Empty argument.')
  const ast = parseOrFail(t)
  for (const v of freeVars(ast)) if (!['i', 'e', 'pi'].includes(v) && !(v in ctx.nums)) fail(`${v} belum didefinisikan sebagai bilangan (tulis misalnya ${v} = 1+i di baris sebelumnya).`, `${v} is not defined as a number (write e.g. ${v} = 1+i in an earlier row).`)
  const z = evaluate(ast, ctx.nums)
  if (!Cx.isFinite(z)) fail(`Nilai "${t}" tidak terdefinisi.`, `"${t}" is undefined.`)
  return tidy(z)
}
function intArg(s: string | undefined, ctx: Ctx, lo: number, hi: number, def?: number): number {
  if (s === undefined || !s.trim()) { if (def !== undefined) return def; return fail('Bilangan bulat diperlukan.', 'An integer is required.') }
  const v = numArg(s, ctx)
  if (Math.abs(v.im) > 1e-12 || !Number.isInteger(Math.round(v.re)) || Math.abs(v.re - Math.round(v.re)) > 1e-9 || v.re < lo || v.re > hi) fail(`Gunakan bilangan bulat ${lo} sampai ${hi}.`, `Use an integer from ${lo} to ${hi}.`)
  return Math.round(v.re)
}

// ------------------------------------------------------------------ polynomials in z

type Poly = Complex[]
const ptrim = (p: Poly) => { const q = [...p]; while (q.length > 1 && Cx.abs(q[q.length - 1]) < 1e-13) q.pop(); return q }
const padd = (a: Poly, b: Poly, s = 1): Poly => Array.from({ length: Math.max(a.length, b.length) }, (_, k) => C((a[k]?.re ?? 0) + s * (b[k]?.re ?? 0), (a[k]?.im ?? 0) + s * (b[k]?.im ?? 0)))
const pmul = (a: Poly, b: Poly): Poly => { const r = Array.from({ length: a.length + b.length - 1 }, () => C(0)); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = Cx.add(r[i + j], Cx.mul(x, y)) })); return r }
const pev = (p: Poly, z: Complex) => p.reduceRight((acc, c) => Cx.add(Cx.mul(acc, z), c), C(0))
const constInt = (n: Node, env: Env): number | null => {
  const fv = freeVars(n)
  if (fv.has('z') || fv.has('x') || fv.has('y')) return null
  const v = evaluate(n, env), r = Math.round(v.re)
  return Math.abs(v.im) < 1e-12 && Math.abs(v.re - r) < 1e-12 ? r : null
}
function polyZ(n: Node, env: Env): Poly | null {
  const fv = freeVars(n)
  if (fv.has('x') || fv.has('y')) return null
  if (!fv.has('z')) { const v = evaluate(n, env); return Cx.isFinite(v) ? [v] : null }
  if (n.t === 'var') return [C(0), C(1)]
  if (n.t === 'neg') { const a = polyZ(n.a, env); return a && a.map(Cx.neg) }
  if (n.t !== 'bin') return null
  if (n.op === '^') {
    const e = constInt(n.b, env), a = polyZ(n.a, env)
    if (e === null || e < 0 || e > 40 || !a) return null
    let r: Poly = [C(1)]
    for (let k = 0; k < e; k++) r = pmul(r, a)
    return r
  }
  const a = polyZ(n.a, env), b = polyZ(n.b, env)
  if (!a || !b) return null
  if (n.op === '+') return padd(a, b)
  if (n.op === '-') return padd(a, b, -1)
  if (n.op === '*') return pmul(a, b)
  const bt = ptrim(b)
  return bt.length === 1 ? a.map((c) => Cx.div(c, bt[0])) : null
}
/** All roots with multiplicity (Durand-Kerner, clustered). */
function polyRoots(p0: Poly): Complex[] {
  const p = ptrim(p0), n = p.length - 1
  if (n < 1) return []
  const m = p.map((c) => Cx.div(c, p[n]))
  let zs = Array.from({ length: n }, (_, k) => { let z = C(1); for (let j = 0; j < k; j++) z = Cx.mul(z, C(0.4, 0.9)); return z })
  for (let it = 0; it < 1000; it++) {
    let delta = 0
    zs = zs.map((z, k) => {
      let den = C(1)
      zs.forEach((w, j) => { if (j !== k) den = Cx.mul(den, Cx.sub(z, w)) })
      const step = Cx.div(pev(m, z), den)
      delta = Math.max(delta, Cx.abs(step))
      return Cx.isFinite(step) ? Cx.sub(z, step) : z
    })
    if (delta < 1e-16) break
  }
  const out: Complex[] = [], used = zs.map(() => false)
  zs.forEach((z, k) => {
    if (used[k]) return
    const group = zs.map((w, j) => (!used[j] && Cx.abs(Cx.sub(w, z)) < 2e-3 * (1 + Cx.abs(z)) ? j : -1)).filter((j) => j >= 0)
    let s = C(0)
    for (const j of group) { used[j] = true; s = Cx.add(s, zs[j]) }
    const c = tidy(Cx.scale(s, 1 / group.length))
    for (let j = 0; j < group.length; j++) out.push(c)
  })
  return out
}
function polyTex(p: Poly, v = 'z'): string {
  let s = ''
  for (let k = p.length - 1; k >= 0; k--) {
    const c = p[k]
    if (Cx.abs(c) < 1e-12) continue
    const mono = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`
    let ct = cx(c).tex, neg = false
    const pure = Math.abs(c.im) < 1e-12 || Math.abs(c.re) < 1e-12
    if (pure && ct.startsWith('-')) { neg = true; ct = ct.slice(1) }
    if (!pure || hasOps(ct)) ct = `\\left(${ct}\\right)`
    if (mono && ct === '1') ct = ''
    s += s ? (neg ? ' - ' : ' + ') : neg ? '-' : ''
    s += ct + mono
  }
  return s || '0'
}

// ------------------------------------------------------------------ polynomials in x, y (for u, v)

type P2 = Map<number, Complex>
const K = 64
const P2c = (c: Complex): P2 => new Map([[0, c]])
function p2add(a: P2, b: P2, s = 1): P2 { const r = new Map(a); for (const [k, v] of b) { const o = r.get(k) ?? C(0); r.set(k, C(o.re + s * v.re, o.im + s * v.im)) } return r }
function p2mul(a: P2, b: P2): P2 { const r: P2 = new Map(); for (const [k1, v1] of a) for (const [k2, v2] of b) r.set(k1 + k2, Cx.add(r.get(k1 + k2) ?? C(0), Cx.mul(v1, v2))); return r }
const p2map = (a: P2, f: (c: Complex) => Complex): P2 => new Map([...a].map(([k, v]) => [k, f(v)]))
const p2deg = (a: P2) => Math.max(0, ...[...a].filter(([, v]) => Cx.abs(v) > 1e-12).map(([k]) => Math.floor(k / K) + (k % K)))
const p2zero = (a: P2) => [...a.values()].every((v) => Cx.abs(v) < 1e-9)
const p2const = (a: P2) => [...a].every(([k, v]) => k === 0 || Cx.abs(v) < 1e-12)
function p2d(a: P2, w: 'x' | 'y'): P2 {
  const r: P2 = new Map()
  for (const [k, v] of a) { const i = Math.floor(k / K), j = k % K, e = w === 'x' ? i : j; if (e > 0) r.set(k - (w === 'x' ? K : 1), Cx.scale(v, e)) }
  return r
}
function p2int(a: P2, w: 'x' | 'y'): P2 {
  const r: P2 = new Map()
  for (const [k, v] of a) { const i = Math.floor(k / K), j = k % K, e = w === 'x' ? i : j; r.set(k + (w === 'x' ? K : 1), Cx.scale(v, 1 / (e + 1))) }
  return r
}
const p2eval = (a: P2, x: number, y: number) => { let s = C(0); for (const [k, v] of a) s = Cx.add(s, Cx.scale(v, x ** Math.floor(k / K) * y ** (k % K))); return s }
function p2tex(a: P2): string {
  const terms = [...a].filter(([, v]) => Math.abs(v.re) > 1e-10).map(([k, v]) => ({ i: Math.floor(k / K), j: k % K, c: v.re }))
    .sort((p, q) => q.i + q.j - (p.i + p.j) || q.i - p.i)
  let s = ''
  for (const { i, j, c } of terms) {
    const mono = (i ? (i === 1 ? 'x' : `x^{${i}}`) : '') + (j ? (j === 1 ? 'y' : `y^{${j}}`) : '')
    let ct = rx(Math.abs(c)).tex
    if (mono && ct === '1') ct = ''
    if (hasOps(ct)) ct = `\\left(${ct}\\right)`
    s += s ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''
    s += ct + mono
  }
  return s || '0'
}

interface R2 { n: P2; d: P2 }
/** f as a quotient of polynomials in x, y (complex coefficients), or null. */
function toR2(n: Node, env: Env): R2 | null {
  const fv = freeVars(n), one = P2c(C(1))
  if (!fv.has('z') && !fv.has('x') && !fv.has('y')) { const v = evaluate(n, env); return Cx.isFinite(v) ? { n: P2c(v), d: one } : null }
  let r: R2 | null = null
  switch (n.t) {
    case 'var': r = { n: n.name === 'z' ? new Map([[K, C(1)], [1, C(0, 1)]]) : new Map([[n.name === 'x' ? K : 1, C(1)]]), d: one }; break
    case 'neg': { const a = toR2(n.a, env); r = a && { n: p2map(a.n, Cx.neg), d: a.d }; break }
    case 'call': {
      const a = toR2(n.a, env)
      if (!a) return null
      if (n.fn === 'conj') r = { n: p2map(a.n, Cx.conj), d: p2map(a.d, Cx.conj) }
      else if (n.fn === 're' || n.fn === 'im') {
        const N = p2mul(a.n, p2map(a.d, Cx.conj)), D = p2map(p2mul(a.d, p2map(a.d, Cx.conj)), (c) => C(c.re))
        r = { n: p2map(N, (c) => C(n.fn === 're' ? c.re : c.im)), d: D }
      } else return null
      break
    }
    case 'bin': {
      if (n.op === '^') {
        const e = constInt(n.b, env)
        if (e === null || Math.abs(e) > 12) return null
        let base: R2 | null
        let k = Math.abs(e)
        if (n.a.t === 'call' && n.a.fn === 'abs' && k % 2 === 0) {
          const g = toR2(n.a.a, env)
          if (!g) return null
          base = { n: p2mul(g.n, p2map(g.n, Cx.conj)), d: p2mul(g.d, p2map(g.d, Cx.conj)) }; k /= 2
        } else base = toR2(n.a, env)
        if (!base) return null
        let p: R2 = { n: one, d: one }
        for (let j = 0; j < k; j++) p = { n: p2mul(p.n, base.n), d: p2mul(p.d, base.d) }
        r = e < 0 ? { n: p.d, d: p.n } : p
        break
      }
      const a = toR2(n.a, env), b = toR2(n.b, env)
      if (!a || !b) return null
      const same = p2zero(p2add(a.d, b.d, -1))
      if (n.op === '+' || n.op === '-') { const s = n.op === '+' ? 1 : -1; r = same ? { n: p2add(a.n, b.n, s), d: a.d } : { n: p2add(p2mul(a.n, b.d), p2mul(b.n, a.d), s), d: p2mul(a.d, b.d) } }
      else if (n.op === '*') r = { n: p2mul(a.n, b.n), d: p2mul(a.d, b.d) }
      else r = { n: p2mul(a.n, b.d), d: p2mul(a.d, b.n) }
    }
  }
  if (!r || p2deg(r.n) > 24 || p2deg(r.d) > 24) return null
  return r
}
/** u = U/D, v = V/D with D real. */
function uvOf(r: R2) {
  let U = p2map(p2mul(r.n, p2map(r.d, Cx.conj)), (c) => C(c.re)), V = p2map(p2mul(r.n, p2map(r.d, Cx.conj)), (c) => C(c.im))
  let D = p2map(p2mul(r.d, p2map(r.d, Cx.conj)), (c) => C(c.re))
  if (p2const(D)) { const d = D.get(0)!.re; U = p2map(U, (c) => Cx.scale(c, 1 / d)); V = p2map(V, (c) => Cx.scale(c, 1 / d)); D = P2c(C(1)) }
  return { U, V, D }
}
const quoTex = (num: P2, D: P2, sq = false) => p2const(D) ? p2tex(num) : `\\frac{${p2tex(num)}}{${sq ? `\\left(${p2tex(D)}\\right)^2` : p2tex(D)}}`
/** numerator of ∂(N/D)/∂w over D² (or the plain partial when D = 1) */
const quoD = (N: P2, D: P2, w: 'x' | 'y') => p2const(D) ? p2d(N, w) : p2add(p2mul(p2d(N, w), D), p2mul(N, p2d(D, w)), -1)

// ------------------------------------------------------------------ singularities

interface Sing { z: Complex; branch: boolean }
function newtonZeros(node: Node, env: Env, c: Complex, R: number): Complex[] {
  let d: Node
  try { d = simp(dz(node, env)) } catch { return [] }
  const e: Env = { ...env }, F = (z: Complex) => { e.z = z; return evaluate(node, e) }, G = (z: Complex) => { e.z = z; return evaluate(d, e) }
  const out: Complex[] = []
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
    let z = C(c.re + (R * i) / 5 + 0.013, c.im + (R * j) / 5 + 0.007)
    for (let k = 0; k < 80; k++) {
      const step = Cx.div(F(z), G(z))
      if (!Cx.isFinite(step)) break
      z = Cx.sub(z, step)
      if (Cx.abs(step) < 1e-15 * (1 + Cx.abs(z))) break
    }
    if (Cx.isFinite(z) && Cx.abs(F(z)) < 1e-9 && Cx.abs(Cx.sub(z, c)) <= R && !out.some((w) => near(w, z))) out.push(tidy(z))
  }
  return out
}
/** Isolated singular points (zeros of denominators) and branch points of f near c. */
function singular(F: Fn, c: Complex, R: number): Sing[] {
  const dens: { node: Node; branch: boolean }[] = []
  const walk = (n: Node) => {
    if (n.t === 'neg' || n.t === 'call') walk(n.a)
    if (n.t === 'bin') { walk(n.a); walk(n.b) }
    if (n.t === 'bin' && n.op === '/') dens.push({ node: n.b, branch: false })
    if (n.t === 'bin' && n.op === '^' && hasZ(n.a)) { const k = constInt(n.b, F.env); if (k === null) dens.push({ node: n.a, branch: true }); else if (k < 0) dens.push({ node: n.a, branch: false }) }
    if (n.t === 'call') {
      if (n.fn === 'tan') dens.push({ node: call('cos', n.a), branch: false })
      if (n.fn === 'tanh') dens.push({ node: call('cosh', n.a), branch: false })
      if (['log', 'ln', 'sqrt'].includes(n.fn)) dens.push({ node: n.a, branch: true })
    }
  }
  walk(F.ast)
  const out: Sing[] = []
  for (const { node, branch } of dens) {
    if (!hasZ(node) || !isAnalytic(node)) continue
    const p = polyZ(node, F.env)
    for (const z of p ? polyRoots(p) : newtonZeros(node, F.env, c, R)) {
      const o = out.find((s) => near(s.z, z))
      if (o) o.branch ||= branch
      else out.push({ z, branch })
    }
  }
  return out.sort((a, b) => Cx.abs(Cx.sub(a.z, c)) - Cx.abs(Cx.sub(b.z, c)))
}
const hasDenominators = (n: Node): boolean => n.t === 'bin' ? n.op === '/' || (n.op === '^' && hasZ(n.a) && !(n.b.t === 'num' && Number.isInteger(n.b.v))) || hasDenominators(n.a) || hasDenominators(n.b) : n.t === 'neg' ? hasDenominators(n.a) : n.t === 'call' ? ['tan', 'tanh', 'log', 'ln', 'sqrt'].includes(n.fn) || hasDenominators(n.a) : false

type KindName = 'removable' | 'pole' | 'essential' | 'branch'
interface Kind { kind: KindName; m: number }
/** Order of the singularity from the growth |f(a + t d)| ~ t^{-m} along 8 directions. */
function orderAt(f: (z: Complex) => Complex, a: Complex, scale: number): Kind {
  const slopes: number[] = []
  for (let k = 0; k < 8; k++) {
    const d = Cx.polar(1, (k * Math.PI) / 4 + 0.37)
    const v1 = Cx.abs(f(Cx.add(a, Cx.scale(d, 1e-3 * scale)))), v2 = Cx.abs(f(Cx.add(a, Cx.scale(d, 1e-5 * scale))))
    if (!Number.isFinite(v1) || !Number.isFinite(v2)) return { kind: 'essential', m: 0 }
    slopes.push(v1 === 0 && v2 === 0 ? -1 : (Math.log(v2) - Math.log(v1)) / Math.log(100))
  }
  const hi = Math.max(...slopes), lo = Math.min(...slopes)
  if (hi < 0.5) return { kind: 'removable', m: 0 }
  if (hi - lo > 0.3 || !Number.isFinite(lo)) return { kind: 'essential', m: 0 }
  const mean = slopes.reduce((s, x) => s + x, 0) / slopes.length, m = Math.round(mean)
  return Math.abs(mean - m) < 0.15 ? { kind: 'pole', m } : { kind: 'essential', m: 0 }
}
/** Laurent / Taylor coefficients c_k = (1/2πi)∮ f(z)(z−a)^{−k−1} dz on |z − a| = ρ. */
function coeffs(f: (z: Complex) => Complex, a: Complex, rho: number, ks: number[], N = 512): Complex[] {
  const w = Array.from({ length: N }, (_, j) => f(Cx.add(a, Cx.polar(rho, (TAU * j) / N))))
  if (!w.every(Cx.isFinite)) fail('f tidak terdefinisi pada lingkaran sampel; pilih titik atau jari-jari lain.', 'f is undefined on the sampling circle; choose another point or radius.')
  return ks.map((k) => {
    let s = C(0)
    w.forEach((v, j) => { s = Cx.add(s, Cx.mul(v, Cx.polar(1, (-k * TAU * j) / N))) })
    return tidy(Cx.scale(s, rho ** -k / N))
  })
}
const dNear = (a: Complex, sings: Sing[]) => Math.min(Infinity, ...sings.filter((s) => !near(s.z, a, 1e-7)).map((s) => Cx.abs(Cx.sub(s.z, a))))
const KIND_TEXT: Record<KindName, Bi> = {
  removable: bi('titik singular yang dapat dihapuskan', 'removable singularity'),
  pole: bi('kutub', 'pole'), essential: bi('titik singular esensial', 'essential singularity'), branch: bi('titik cabang (tidak terisolasi)', 'branch point (not isolated)'),
}
const kindBi = (k: Kind): Bi => k.kind === 'pole' ? bi(`kutub orde ${k.m}`, `pole of order ${k.m}`) : KIND_TEXT[k.kind]
const toneOf = (k: KindName): Tone => k === 'pole' ? 'pole' : k

interface ResInfo { kind: Kind; res: Complex; method: Bi; steps: Step[]; rho: number }
/** Classify a and compute Res(f, a) with the hand method that fits. */
function residueAt(F: Fn, a: Complex, sings: Sing[]): ResInfo {
  const at = `z_0 = ${cx(a).tex}`, za = a.re === 0 && a.im === 0 ? 'z' : `\\left(${zm(a)}\\right)`
  const self = sings.find((s) => near(s.z, a, 1e-7))
  if (self?.branch) fail(`${cx(a).tex} adalah titik cabang: bukan titik singular terisolasi, jadi residu tidak didefinisikan.`, `${cx(a).tex} is a branch point: not an isolated singularity, so the residue is not defined.`)
  const dn = dNear(a, sings), scale = Math.min(1, dn / 2), rho = Math.min(0.5, 0.4 * dn)
  const kind = orderAt(F.f, a, scale)
  const numeric = coeffs(F.f, a, rho, [-1])[0]
  const steps: Step[] = []
  if (kind.kind === 'removable') {
    steps.push(st(`$f$ terbatas di sekitar $${at}$ (limitnya ada), jadi titik ini dapat dihapuskan atau $f$ analitik di sana. Deret Laurent tidak punya pangkat negatif, sehingga residunya 0.`, `$f$ stays bounded near $${at}$ (the limit exists), so the point is removable or $f$ is analytic there. The Laurent series has no negative powers, so the residue is 0.`, `\\operatorname*{Res}_{z=${cx(a).tex}} f(z) = 0`))
    return { kind, res: C(0), method: bi('dapat dihapuskan: Res = 0', 'removable: Res = 0'), steps, rho }
  }
  if (kind.kind === 'essential') {
    steps.push(st(`$|f|$ tidak berperilaku seperti $|z-z_0|^{-m}$: di beberapa arah membesar tanpa batas, di arah lain tidak. Jadi $${at}$ adalah titik singular esensial; bagian utama deret Laurent memuat tak hingga banyak suku.`, `$|f|$ does not behave like $|z-z_0|^{-m}$: it blows up in some directions but not in others. So $${at}$ is an essential singularity; the principal part of the Laurent series has infinitely many terms.`))
    steps.push(st(`Residu adalah koefisien $a_{-1}$ dari suku $1/(z-z_0)$ pada deret Laurent. Nilainya dihitung numerik dengan $a_{-1} = \\frac{1}{2\\pi i}\\oint_{|z-z_0|=${rx(rho).tex}} f(z)\\,dz$.`, `The residue is the coefficient $a_{-1}$ of $1/(z-z_0)$ in the Laurent series. It is computed numerically as $a_{-1} = \\frac{1}{2\\pi i}\\oint_{|z-z_0|=${rx(rho).tex}} f(z)\\,dz$.`, `\\operatorname*{Res}_{z=${cx(a).tex}} f(z) = a_{-1} ${eqs(numeric)}`))
    return { kind, res: numeric, method: bi('esensial: koefisien Laurent a₋₁', 'essential: Laurent coefficient a₋₁'), steps, rho }
  }
  const m = kind.m
  const top = F.ast.t === 'bin' && F.ast.op === '/' ? F.ast : null
  if (m === 1) {
    if (top && isAnalytic(top.b)) {
      const env = { ...F.env, z: a }, p = evaluate(top.a, env), q = evaluate(top.b, env)
      let dq: Node | null = null
      try { dq = simp(dz(top.b, F.env)) } catch { dq = null }
      const q1 = dq ? evaluate(dq, env) : C(NaN)
      if (dq && Cx.abs(q) < 1e-8 && Cx.isFinite(q1) && Cx.abs(q1) > 1e-10 && Cx.abs(p) > 1e-12) {
        const res = tidy(Cx.div(p, q1))
        steps.push(st(`Tulis $f = p/q$ dengan $p(z) = ${texNode(top.a)}$ dan $q(z) = ${texNode(top.b)}$. Karena $q(z_0) = 0$, $q'(z_0) \\ne 0$ dan $p(z_0) \\ne 0$, $z_0$ adalah kutub sederhana dan`, `Write $f = p/q$ with $p(z) = ${texNode(top.a)}$ and $q(z) = ${texNode(top.b)}$. Since $q(z_0) = 0$, $q'(z_0) \\ne 0$ and $p(z_0) \\ne 0$, $z_0$ is a simple pole and`, `\\operatorname*{Res}_{z=z_0} \\frac{p}{q} = \\frac{p(z_0)}{q'(z_0)},\\qquad q'(z) = ${texNode(dq)}`))
        steps.push(st(`Substitusi $${at}$:`, `Substitute $${at}$:`, `\\operatorname*{Res} = \\frac{${cx(p).tex}}{${cx(q1).tex}} ${eqs(res)}`))
        return { kind, res, method: bi('kutub sederhana: Res = p(z₀)/q′(z₀)', 'simple pole: Res = p(z₀)/q′(z₀)'), steps, rho }
      }
    }
    steps.push(st(`$(z-z_0)f(z)$ mempunyai limit berhingga yang tidak nol, jadi $z_0$ kutub sederhana dan`, `$(z-z_0)f(z)$ has a finite nonzero limit, so $z_0$ is a simple pole and`, `\\operatorname*{Res}_{z=${cx(a).tex}} f(z) = \\lim_{z\\to ${cx(a).tex}} ${za} f(z) ${eqs(numeric)}`))
    return { kind, res: numeric, method: bi('kutub sederhana: Res = lim (z−z₀)f(z)', 'simple pole: Res = lim (z−z₀)f(z)'), steps, rho }
  }
  steps.push(st(`$|f(z)|$ tumbuh seperti $|z-z_0|^{-${m}}$, jadi $z_0$ kutub orde ${m}. Rumus residu kutub orde $m$:`, `$|f(z)|$ grows like $|z-z_0|^{-${m}}$, so $z_0$ is a pole of order ${m}. Residue formula for a pole of order $m$:`, `\\operatorname*{Res}_{z=z_0} f = \\frac{1}{(m-1)!}\\lim_{z\\to z_0}\\frac{d^{m-1}}{dz^{m-1}}\\Big[(z-z_0)^m f(z)\\Big]`))
  const qp = top ? polyZ(top.b, F.env) : null
  if (top && qp) {
    let r = ptrim(qp)
    for (let k = 0; k < m; k++) {
      const n = r.length - 1, q: Poly = new Array(n)
      let acc = C(0)
      for (let j = n; j >= 1; j--) { acc = Cx.add(Cx.mul(acc, a), r[j]); q[j - 1] = acc }
      r = q.length ? q : [C(0)]
    }
    const g = `\\frac{${texNode(top.a)}}{${polyTex(r)}}`
    steps.push(st(`Di sini $q(z) = ${texNode(top.b)}$ memuat faktor $${za}^{${m}}$, jadi`, `Here $q(z) = ${texNode(top.b)}$ contains the factor $${za}^{${m}}$, so`, `g(z) = ${za}^{${m}} f(z) = ${polyTex(r) === '1' ? texNode(top.a) : g}`))
  } else steps.push(st(`Misalkan $g(z) = (z-z_0)^{${m}} f(z)$, yang analitik di $z_0$.`, `Let $g(z) = (z-z_0)^{${m}} f(z)$, which is analytic at $z_0$.`))
  steps.push(st(`Nilai $\\frac{g^{(${m - 1})}(z_0)}{${m - 1}!}$ sama dengan koefisien Laurent $a_{-1}$; dihitung dan dicek dengan $\\frac{1}{2\\pi i}\\oint f\\,dz$ pada $|z-z_0| = ${rx(rho).tex}$:`, `The value $\\frac{g^{(${m - 1})}(z_0)}{${m - 1}!}$ equals the Laurent coefficient $a_{-1}$; computed and checked with $\\frac{1}{2\\pi i}\\oint f\\,dz$ on $|z-z_0| = ${rx(rho).tex}$:`, `\\operatorname*{Res}_{z=${cx(a).tex}} f(z) ${eqs(numeric)}`))
  return { kind, res: numeric, method: bi(`kutub orde ${m}: Res = (1/${m - 1}!) lim d${m > 2 ? `^${m - 1}` : ''}/dz${m > 2 ? `^${m - 1}` : ''}[(z−z₀)^${m} f]`, `pole of order ${m}: Res = (1/${m - 1}!) lim d${m > 2 ? `^${m - 1}` : ''}/dz${m > 2 ? `^${m - 1}` : ''}[(z−z₀)^${m} f]`), steps, rho }
}

// ------------------------------------------------------------------ paths

function makePath(name: string, args: string[], ctx: Ctx): Path {
  if (name === 'circle') {
    if (args.length !== 2) fail('circle(c, r) memerlukan pusat dan jari-jari.', 'circle(c, r) needs a centre and a radius.')
    const c = numArg(args[0], ctx), r = numArg(args[1], ctx)
    if (Math.abs(r.im) > 1e-12 || r.re <= 0) fail('Jari-jari harus bilangan real positif.', 'The radius must be a positive real number.')
    return { kind: 'circle', c, r: r.re }
  }
  if (name === 'segment') {
    if (args.length !== 2) fail('segment(a, b) memerlukan dua titik.', 'segment(a, b) needs two points.')
    const a = numArg(args[0], ctx), b = numArg(args[1], ctx)
    if (near(a, b, 1e-12)) fail('Titik awal dan akhir harus berbeda.', 'Start and end points must differ.')
    return { kind: 'segment', a, b }
  }
  if (args.length < 3) fail('polygon(a, b, c, ...) memerlukan minimal tiga titik sudut.', 'polygon(a, b, c, ...) needs at least three vertices.')
  return { kind: 'polygon', pts: args.map((s) => numArg(s, ctx)) }
}
function pathArg(s: string, ctx: Ctx): Path {
  const t = s.trim()
  if (ctx.paths[t]) return ctx.paths[t]
  const c = splitCall(t)
  if (c && ['circle', 'segment', 'polygon'].includes(c.name)) return makePath(c.name, c.args, ctx)
  return fail(`"${t}" bukan lintasan. Gunakan circle(c, r), segment(a, b), polygon(...) atau nama lintasan.`, `"${t}" is not a path. Use circle(c, r), segment(a, b), polygon(...) or a path name.`)
}
const edges = (P: Path): [Complex, Complex][] => P.kind === 'segment' ? [[P.a, P.b]] : P.kind === 'polygon' ? P.pts.map((p, i) => [p, P.pts[(i + 1) % P.pts.length]]) : []
const closed = (P: Path) => P.kind !== 'segment'
const pathLength = (P: Path) => P.kind === 'circle' ? TAU * P.r : edges(P).reduce((s, [a, b]) => s + Cx.abs(Cx.sub(b, a)), 0)
function samplePath(P: Path, n: number): Complex[] {
  if (P.kind === 'circle') return Array.from({ length: n }, (_, k) => Cx.add(P.c, Cx.polar(P.r, (TAU * k) / n)))
  const E = edges(P), per = Math.max(2, Math.ceil(n / E.length))
  return E.flatMap(([a, b]) => Array.from({ length: per + 1 }, (_, k) => Cx.add(a, Cx.scale(Cx.sub(b, a), k / per))))
}
function bounds(P: Path): { c: Complex; R: number } {
  if (P.kind === 'circle') return { c: P.c, R: P.r * 1.02 }
  const pts = P.kind === 'segment' ? [P.a, P.b] : P.pts, c = Cx.scale(pts.reduce(Cx.add, C(0)), 1 / pts.length)
  return { c, R: 1.02 * Math.max(...pts.map((p) => Cx.abs(Cx.sub(p, c)))) }
}
function onPath(P: Path, a: Complex): boolean {
  if (P.kind === 'circle') return Math.abs(Cx.abs(Cx.sub(a, P.c)) - P.r) < 1e-7 * (1 + P.r)
  return edges(P).some(([p, q]) => { const d = Cx.sub(q, p), t = Math.max(0, Math.min(1, ((a.re - p.re) * d.re + (a.im - p.im) * d.im) / (d.re ** 2 + d.im ** 2))); return Cx.abs(Cx.sub(a, Cx.add(p, Cx.scale(d, t)))) < 1e-7 })
}
/** Winding number n(C, a) of a closed path. */
function winding(P: Path, a: Complex): number {
  if (P.kind === 'circle') return Cx.abs(Cx.sub(a, P.c)) < P.r ? 1 : 0
  return Math.round(edges(P).reduce((s, [p, q]) => s + Arg(Cx.div(Cx.sub(q, a), Cx.sub(p, a))), 0) / TAU)
}
function integrate(P: Path, f: (z: Complex) => Complex): Complex {
  let I: Complex
  if (P.kind === 'circle') {
    const N = 4096
    let s = C(0)
    for (let k = 0; k < N; k++) { const e = Cx.polar(P.r, (TAU * k) / N); s = Cx.add(s, Cx.mul(f(Cx.add(P.c, e)), C(-e.im, e.re))) }
    I = Cx.scale(s, TAU / N)
  } else {
    I = C(0)
    for (const [a, b] of edges(P)) {
      const d = Cx.sub(b, a), N = 2000
      let s = C(0)
      for (let k = 0; k <= N; k++) s = Cx.add(s, Cx.scale(f(Cx.add(a, Cx.scale(d, k / N))), k === 0 || k === N ? 1 : k % 2 ? 4 : 2))
      I = Cx.add(I, Cx.mul(Cx.scale(s, 1 / (3 * N)), d))
    }
  }
  if (!Cx.isFinite(I)) fail('f tidak terdefinisi di suatu titik pada lintasan.', 'f is undefined at a point on the path.')
  return tidy(I)
}
const sumTex = (a: Complex, b: string) => a.re === 0 && a.im === 0 ? b : `${cx(a).tex} + ${b}`
function pathTex(P: Path): { z: string; dz: string; t: string } {
  if (P.kind === 'circle') {
    const r = Math.abs(P.r - 1) < 1e-12 ? '' : rx(P.r).tex
    return { z: sumTex(P.c, `${r}e^{it}`), dz: `${r}ie^{it}`, t: '0 \\le t \\le 2\\pi' }
  }
  const [a, b] = P.kind === 'segment' ? [P.a, P.b] : [P.pts[0], P.pts[1]], d = Cx.sub(b, a)
  return { z: sumTex(a, `${ppz(d) === '1' ? '' : ppz(d)}t`), dz: cx(d).tex, t: '0 \\le t \\le 1' }
}
function pathSteps(P: Path, F: Fn): Step[] {
  const sub = (zt: string) => texNode(F.ast, { z: `\\left(${zt}\\right)`, x: '\\operatorname{Re}z', y: '\\operatorname{Im}z' })
  if (P.kind === 'circle') {
    const p = pathTex(P)
    return [
      st(`Parametrisasi lingkaran $|${zm(P.c)}| = ${rx(P.r).tex}$ berlawanan arah jarum jam:`, `Parametrise the circle $|${zm(P.c)}| = ${rx(P.r).tex}$ counterclockwise:`, `z(t) = ${p.z},\\quad ${p.t},\\qquad z'(t) = ${p.dz}`),
      st('Substitusi ke definisi integral kontur $\\int_C f(z)\\,dz = \\int_a^b f(z(t))\\,z\'(t)\\,dt$:', 'Substitute into the definition $\\int_C f(z)\\,dz = \\int_a^b f(z(t))\\,z\'(t)\\,dt$:', `\\oint_C f(z)\\,dz = \\int_0^{2\\pi} ${sub(p.z)}\\cdot ${p.dz}\\,dt`),
    ]
  }
  return edges(P).map(([a, b], i) => {
    const d = Cx.sub(b, a), zt = sumTex(a, `${ppz(d) === '1' ? '' : ppz(d)}t`)
    return st(P.kind === 'segment' ? `Parametrisasi ruas garis dari $${cx(a).tex}$ ke $${cx(b).tex}$:` : `Sisi ${i + 1}: dari $${cx(a).tex}$ ke $${cx(b).tex}$.`, P.kind === 'segment' ? `Parametrise the segment from $${cx(a).tex}$ to $${cx(b).tex}$:` : `Side ${i + 1}: from $${cx(a).tex}$ to $${cx(b).tex}$.`,
      `z(t) = ${zt},\\ 0 \\le t \\le 1,\\ z'(t) = ${cx(d).tex};\\quad \\int = \\int_0^1 ${sub(zt)}\\cdot ${ppz(d)}\\,dt`)
  })
}
function pathMarks(P: Path): Mark[] {
  if (P.kind === 'circle') return [{ kind: 'circle', c: P.c, r: P.r, arrow: true }]
  return [{ kind: 'poly', pts: P.kind === 'segment' ? [P.a, P.b] : P.pts, closed: P.kind === 'polygon', arrow: true }]
}
const singMarks = (list: { z: Complex; kind: KindName }[]): Mark[] => list.map((s) => ({ kind: 'point', z: s.z, tone: toneOf(s.kind), label: lab(s.z) }))

// ------------------------------------------------------------------ numbers

function polarSteps(z: Complex, name = 'z'): Step[] {
  const x = z.re, y = z.im, r = Cx.abs(z), th = Arg(z), steps: Step[] = []
  steps.push(st(`Modulus adalah jarak dari 0 ke titik $(x, y) = (${rx(x).tex}, ${rx(y).tex})$:`, `The modulus is the distance from 0 to the point $(x, y) = (${rx(x).tex}, ${rx(y).tex})$:`,
    `|${name}| = \\sqrt{x^2 + y^2} = \\sqrt{${pp(rx(x).tex)}^2 + ${pp(rx(y).tex)}^2} = \\sqrt{${rx(x * x + y * y).tex}} ${eqr(r)}`))
  if (r === 0) { steps.push(st('Untuk z = 0 argumen tidak didefinisikan.', 'For z = 0 the argument is undefined.')); return steps }
  if (x === 0 || y === 0) {
    steps.push(st('Titik terletak pada sumbu, jadi argumen utama dibaca langsung dari gambar.', 'The point lies on an axis, so the principal argument is read off the picture.', `\\operatorname{Arg} ${name} = ${rx(th).tex}`))
  } else {
    const al = Math.atan(Math.abs(y / x)), q = x > 0 ? (y > 0 ? 'I' : 'IV') : y > 0 ? 'II' : 'III'
    const rule = { I: '\\Theta = \\alpha', II: '\\Theta = \\pi - \\alpha', III: '\\Theta = -\\pi + \\alpha', IV: '\\Theta = -\\alpha' }[q]
    steps.push(st('Sudut acuan (lancip) terhadap sumbu real:', 'Reference (acute) angle with the real axis:', `\\alpha = \\arctan\\left|\\frac{y}{x}\\right| = \\arctan ${pp(rx(Math.abs(y / x)).tex)} ${eqr(al)}`))
    steps.push(st(`Titik di kuadran ${q}, jadi $${rule}$ dengan $-\\pi < \\Theta \\le \\pi$:`, `The point is in quadrant ${q}, so $${rule}$ with $-\\pi < \\Theta \\le \\pi$:`, `\\operatorname{Arg} ${name} = \\Theta ${eqr(th)}`))
  }
  steps.push(st('Bentuk polar dan eksponensial:', 'Polar and exponential form:', `${name} = r(\\cos\\Theta + i\\sin\\Theta) = ${expTex(r, th) || '1'}`))
  return steps
}
const pointMark = (z: Complex, label?: string, tone: Tone = 'point'): Mark => ({ kind: 'point', z, label, tone, vector: tone === 'point' })

function powSteps(z: Complex, n: number, zt: string): Out {
  if (Cx.abs(z) === 0) { if (n <= 0) fail('0 tidak dapat dipangkatkan bilangan bulat non-positif.', '0 cannot be raised to a non-positive integer power.'); return { answer: `${pp(zt)}^{${n}} = 0`, steps: [], marks: [], value: C(0) } }
  const r = Cx.abs(z), th = Arg(z)
  let v = C(1), base = n < 0 ? Cx.inv(z) : z, k = Math.abs(n)
  while (k) { if (k & 1) v = Cx.mul(v, base); base = Cx.mul(base, base); k >>= 1 }
  v = tidy(v)
  const raw = n * th, red = Math.atan2(Math.sin(raw), Math.cos(raw)), turns = Math.round((raw - red) / TAU)
  const steps = [
    ...polarSteps(z),
    st('Teorema de Moivre: pangkatkan modulus, kalikan argumen.', 'De Moivre: raise the modulus to the power, multiply the argument.', `z^{${n}} = r^{${n}}e^{i\\,${n}\\Theta} = ${pp(rx(r).tex)}^{${n}}\\,e^{i\\left(${n}\\cdot ${pp(rx(th).tex)}\\right)} = ${rx(r ** n).tex}\\,e^{i\\left(${rx(raw).tex}\\right)}`),
  ]
  if (turns) steps.push(st(`Kurangi kelipatan $2\\pi$ (${turns} putaran) agar sudut di $(-\\pi, \\pi]$:`, `Remove multiples of $2\\pi$ (${turns} turns) to bring the angle into $(-\\pi, \\pi]$:`, `${rx(raw).tex} - ${turns === 1 ? '' : turns}2\\pi = ${rx(red).tex}`))
  steps.push(st('Kembali ke bentuk kartesius:', 'Back to Cartesian form:', `z^{${n}} = ${rx(r ** n).tex}\\left(\\cos ${pp(rx(red).tex)} + i\\sin ${pp(rx(red).tex)}\\right) ${eqs(v)}`))
  return { answer: `${pp(zt)}^{${n}} ${eqs(v)}`, note: bi('Teorema de Moivre', "De Moivre's theorem"), steps, marks: [pointMark(z, 'z'), pointMark(v, `z^${n}`)], value: v }
}
function cpowSteps(z: Complex, c: Complex, zt: string, ct: string): Out {
  if (Cx.abs(z) === 0) fail('Pangkat kompleks 0^c tidak didefinisikan melalui log (log 0 tidak ada).', 'The complex power 0^c is not defined through log (log 0 does not exist).')
  const L = C(Math.log(Cx.abs(z)), Arg(z)), w = tidy(Cx.mul(c, L)), v = tidy(Cx.exp(w))
  const steps = [
    st('Definisi pangkat kompleks dan nilai utamanya (pakai Log, cabang utama):', 'Definition of a complex power and its principal value (use Log, the principal branch):', `z^c = e^{c\\log z},\\qquad \\text{P.V. } z^c = e^{c\\,\\operatorname{Log} z}`),
    st('Log basis:', 'Log of the base:', `\\operatorname{Log} ${pp(zt)} = \\ln|z| + i\\operatorname{Arg} z = ${cx(L).tex}`),
    st('Kalikan dengan pangkat:', 'Multiply by the exponent:', `c\\operatorname{Log} z = ${pp(ct)}\\left(${cx(L).tex}\\right) = ${cx(w).tex}`),
    st('Eksponensialkan: $e^{X+iY} = e^X(\\cos Y + i\\sin Y)$.', 'Exponentiate: $e^{X+iY} = e^X(\\cos Y + i\\sin Y)$.', `\\text{P.V. } ${pp(zt)}^{${ct}} = e^{${cx(w).tex}} ${eqs(v)}`),
  ]
  const rat = Math.abs(c.im) < 1e-12 ? ratio(c.re, 60) : null
  const family = (k: number) => tidy(Cx.exp(Cx.mul(c, C(L.re, L.im + TAU * k))))
  if (rat) steps.push(st(`Semua nilai: $e^{c(\\operatorname{Log} z + 2k\\pi i)}$. Karena $c = ${fracTex(...rat)}$ rasional, hanya ada ${rat[1]} nilai berbeda ($k = 0, \\dots, ${rat[1] - 1}$).`, `All values: $e^{c(\\operatorname{Log} z + 2k\\pi i)}$. Since $c = ${fracTex(...rat)}$ is rational there are only ${rat[1]} distinct values ($k = 0, \\dots, ${rat[1] - 1}$).`, Array.from({ length: Math.min(rat[1], 8) }, (_, k) => `k=${k}:\\ ${show(family(k))}`).join(',\\quad ')))
  else steps.push(st('Semua nilai: $e^{c(\\operatorname{Log} z + 2k\\pi i)}$, $k \\in \\mathbb{Z}$; tak hingga banyak nilai berbeda, misalnya:', 'All values: $e^{c(\\operatorname{Log} z + 2k\\pi i)}$, $k \\in \\mathbb{Z}$; infinitely many different values, for example:', [-1, 1].map((k) => `k=${k}:\\ ${show(family(k))}`).join(',\\quad ')))
  const vals = rat ? Array.from({ length: Math.min(rat[1], 24) }, (_, k) => family(k)) : [v]
  return { answer: `\\text{P.V. } ${pp(zt)}^{${ct}} = e^{${cx(w).tex}} ${eqs(v)}`, note: bi('pangkat kompleks lewat Log (nilai utama)', 'complex power via Log (principal value)'), steps, marks: vals.map((u, k) => pointMark(u, k ? undefined : 'P.V.', k ? 'root' : 'point')), value: v, values: vals }
}

/** Steps for the outermost operation of a numeric expression. */
function opSteps(ast: Node, ctx: Ctx): { steps: Step[]; out?: Out } {
  const ev = (n: Node) => tidy(evaluate(n, ctx.nums))
  if (ast.t === 'bin') {
    const A = ev(ast.a), B = ev(ast.b), a = A.re, b = A.im, c = B.re, d = B.im
    if (ast.op === '+' || ast.op === '-') {
      const s = ast.op === '+' ? 1 : -1
      return { steps: [st('Jumlahkan/kurangkan bagian real dan bagian imajiner secara terpisah:', 'Add/subtract real parts and imaginary parts separately:', `\\left(${cx(A).tex}\\right) ${ast.op} \\left(${cx(B).tex}\\right) = (${rx(a).tex} ${ast.op} ${pp(rx(c).tex)}) + (${rx(b).tex} ${ast.op} ${pp(rx(d).tex)})i ${eqs(C(a + s * c, b + s * d))}`)] }
    }
    if (ast.op === '*') return { steps: [st('Kalikan seperti binomial dan pakai $i^2 = -1$: $(a+bi)(c+di) = (ac - bd) + (ad + bc)i$.', 'Multiply out like binomials and use $i^2 = -1$: $(a+bi)(c+di) = (ac - bd) + (ad + bc)i$.', `\\left(${cx(A).tex}\\right)\\left(${cx(B).tex}\\right) = (${rx(a * c).tex} - ${pp(rx(b * d).tex)}) + (${rx(a * d).tex} + ${pp(rx(b * c).tex)})i ${eqs(Cx.mul(A, B))}`)] }
    if (ast.op === '/') {
      if (Cx.abs(B) === 0) fail('Pembagian dengan nol.', 'Division by zero.')
      const N = tidy(Cx.mul(A, Cx.conj(B)))
      return { steps: [st('Kalikan pembilang dan penyebut dengan konjugat penyebut; penyebut menjadi $|w|^2$ yang real.', 'Multiply top and bottom by the conjugate of the denominator; the denominator becomes the real number $|w|^2$.', `\\frac{${cx(A).tex}}{${cx(B).tex}} = \\frac{\\left(${cx(A).tex}\\right)\\left(${cx(Cx.conj(B)).tex}\\right)}{${pp(rx(c).tex)}^2 + ${pp(rx(d).tex)}^2} = \\frac{${cx(N).tex}}{${rx(c * c + d * d).tex}} ${eqs(Cx.div(A, B))}`)] }
    }
    if (ast.op === '^') {
      const k = constInt(ast.b, ctx.nums)
      if (k !== null && Math.abs(k) <= 1000) return { steps: [], out: powSteps(A, k, cx(A).tex) }
      return { steps: [], out: cpowSteps(A, B, cx(A).tex, cx(B).tex) }
    }
  }
  if (ast.t === 'call') {
    const A = ev(ast.a), x = rx(A.re).tex, y = rx(A.im).tex
    const table: Record<string, [string, string, string]> = {
      exp: ['e^{x+iy} = e^x(\\cos y + i\\sin y)', `e^{${x}}\\left(\\cos ${pp(y)} + i\\sin ${pp(y)}\\right)`, 'eksponensial'],
      sin: ['\\sin(x+iy) = \\sin x\\cosh y + i\\cos x\\sinh y', `\\sin ${pp(x)}\\cosh ${pp(y)} + i\\cos ${pp(x)}\\sinh ${pp(y)}`, 'sinus'],
      cos: ['\\cos(x+iy) = \\cos x\\cosh y - i\\sin x\\sinh y', `\\cos ${pp(x)}\\cosh ${pp(y)} - i\\sin ${pp(x)}\\sinh ${pp(y)}`, 'kosinus'],
      sinh: ['\\sinh(x+iy) = \\sinh x\\cos y + i\\cosh x\\sin y', `\\sinh ${pp(x)}\\cos ${pp(y)} + i\\cosh ${pp(x)}\\sin ${pp(y)}`, 'sinus hiperbolik'],
      cosh: ['\\cosh(x+iy) = \\cosh x\\cos y + i\\sinh x\\sin y', `\\cosh ${pp(x)}\\cos ${pp(y)} + i\\sinh ${pp(x)}\\sin ${pp(y)}`, 'kosinus hiperbolik'],
    }
    const row = table[ast.fn]
    if (row) return { steps: [st(`Pisahkan $z = x + iy$ dengan $x = ${x}$, $y = ${y}$ dan pakai rumus:`, `Split $z = x + iy$ with $x = ${x}$, $y = ${y}$ and use:`, `${row[0]}\\;\\Rightarrow\\; ${row[1]}`)] }
    if (ast.fn === 'log' || ast.fn === 'ln') return { steps: [], out: logOut(A, cx(A).tex, true) }
    if (ast.fn === 'sqrt') return { steps: [st('Akar utama: $\\sqrt{z} = \\sqrt{r}\\,e^{i\\Theta/2}$ (cabang utama).', 'Principal root: $\\sqrt{z} = \\sqrt{r}\\,e^{i\\Theta/2}$ (principal branch).', `\\sqrt{${cx(A).tex}} = \\sqrt{${rx(Cx.abs(A)).tex}}\\,e^{i\\,${pp(rx(Arg(A) / 2).tex)}}`)] }
  }
  return { steps: [] }
}
function logOut(z: Complex, zt: string, principal: boolean): Out {
  if (Cx.abs(z) === 0) fail('log 0 tidak didefinisikan.', 'log 0 is undefined.')
  const r = Cx.abs(z), th = Arg(z), lnr = Math.log(r), L = tidy(C(lnr, th))
  const lnT = Math.abs(r - 1) < 1e-12 ? '0' : rx(lnr).exact ? rx(lnr).tex : `\\ln ${pp(rx(r).tex)}`
  const steps = [...polarSteps(z), st('Logaritma: $\\log z = \\ln r + i(\\Theta + 2k\\pi)$, $k \\in \\mathbb{Z}$; cabang utama $\\operatorname{Log} z$ memakai $k = 0$ dan $-\\pi < \\Theta \\le \\pi$ (potongan cabang: sumbu real negatif).', 'Logarithm: $\\log z = \\ln r + i(\\Theta + 2k\\pi)$, $k \\in \\mathbb{Z}$; the principal branch $\\operatorname{Log} z$ takes $k = 0$ and $-\\pi < \\Theta \\le \\pi$ (branch cut: the negative real axis).',
    `\\log ${pp(zt)} = ${lnT} + i\\left(${rx(th).tex} + 2k\\pi\\right)`)]
  steps.push(st('Nilai utama:', 'Principal value:', `\\operatorname{Log} ${pp(zt)} = ${lnT === '0' ? '' : lnT + ' + '}${rx(th).tex === '0' ? '0' : cx(C(0, th)).tex} ${eqs(L)}`))
  const answer = principal ? `\\operatorname{Log} ${pp(zt)} ${eqs(L)}` : `\\log ${pp(zt)} = ${lnT} + i\\left(${rx(th).tex} + 2k\\pi\\right),\\ k \\in \\mathbb{Z}`
  return { answer, note: principal ? bi('cabang utama: −π < Θ ≤ π', 'principal branch: −π < Θ ≤ π') : bi('fungsi bernilai banyak', 'multi-valued'), steps, marks: [{ kind: 'poly', pts: [C(0), C(-1e4)], dashed: true, infinite: true }, pointMark(z, 'z')], value: L, values: principal ? [L] : [-1, 0, 1].map((k) => C(lnr, th + TAU * k)) }
}

// ------------------------------------------------------------------ commands

function splitArgs(s: string): string[] {
  let depth = 0, start = 0
  const parts: string[] = []
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++
    if (s[i] === ')') depth--
    if (s[i] === ',' && depth === 0) { parts.push(s.slice(start, i).trim()); start = i + 1 }
  }
  parts.push(s.slice(start).trim())
  return parts
}
function splitCall(src: string): { name: string; args: string[] } | null {
  const m = src.match(/^([A-Za-z]+)\s*\(/)
  if (!m) return null
  let depth = 0
  for (let i = m[0].length - 1; i < src.length; i++) {
    if (src[i] === '(') depth++
    if (src[i] === ')') { depth--; if (depth === 0) return i === src.length - 1 ? { name: m[1], args: splitArgs(src.slice(m[0].length, i)) } : null }
  }
  return fail('Kurung tidak seimbang.', 'Unbalanced parentheses.')
}
const need = (args: string[], lo: number, hi: number, usage: string) => { if (args.length < lo || args.length > hi || args.some((a) => !a)) fail(`Penulisan: ${usage}`, `Usage: ${usage}`) }

function numberOut(src: string, ctx: Ctx): Out {
  const ast = parseOrFail(src)
  for (const v of freeVars(ast)) {
    if (v in ctx.nums) continue
    if (v === 'z' || v === 'x' || v === 'y') fail(`${v} belum didefinisikan. Untuk fungsi tulis f(z) = ..., untuk bilangan tulis ${v === 'z' ? 'z = 3+4i' : 'nama = nilai'}.`, `${v} is not defined. For a function write f(z) = ..., for a number write ${v === 'z' ? 'z = 3+4i' : 'name = value'}.`)
    if (!['i', 'e', 'pi'].includes(v) && !(v in ctx.nums)) fail(`${v} belum didefinisikan.`, `${v} is not defined.`)
  }
  const v = tidy(evaluate(ast, ctx.nums))
  if (!Cx.isFinite(v)) fail('Hasilnya tidak terdefinisi (misalnya pembagian dengan nol).', 'The result is undefined (e.g. division by zero).')
  const names = [...freeVars(ast)].filter((n) => n in ctx.nums)
  const steps: Step[] = []
  if (names.length) steps.push(st('Substitusi nilai yang sudah didefinisikan:', 'Substitute the values defined above:', `${texNode(ast)} = ${texNode(ast, Object.fromEntries(names.map((n) => [n, `\\left(${cx(ctx.nums[n]).tex}\\right)`])))}`))
  const op = opSteps(ast, ctx)
  if (op.out) return { ...op.out, steps: [...steps, ...op.out.steps] }
  steps.push(...op.steps, ...polarSteps(v, 'w'))
  const lit = texNode(ast), val = cx(v)
  const answer = lit.replace(/\s/g, '') === val.tex.replace(/\s|\\,/g, '') ? val.tex : `${lit} ${eqs(v)}`
  return { answer, steps, marks: [pointMark(v)], value: v }
}

type Cmd = (args: string[], ctx: Ctx) => Out
const COMMANDS: Record<string, Cmd> = {
  conj: (args, ctx) => {
    need(args, 1, 1, 'conj(z)')
    const z = numArg(args[0], ctx), v = Cx.conj(z)
    return { answer: `\\overline{${cx(z).tex}} = ${cx(v).tex}`, steps: [st('Konjugat membalik tanda bagian imajiner: cerminan terhadap sumbu real.', 'The conjugate flips the sign of the imaginary part: a mirror image in the real axis.', `\\overline{x + iy} = x - iy,\\qquad \\overline{${cx(z).tex}} = ${cx(v).tex}`), st('Sifat yang berguna:', 'Useful facts:', `z\\bar z = |z|^2 = ${rx(Cx.abs(z) ** 2).tex},\\quad z + \\bar z = 2\\operatorname{Re} z = ${rx(2 * z.re).tex}`)], marks: [pointMark(z, 'z'), pointMark(v, 'z̄'), { kind: 'poly', pts: [z, v], dashed: true }], value: v }
  },
  abs: (args, ctx) => {
    need(args, 1, 1, 'abs(z)')
    const z = numArg(args[0], ctx), r = Cx.abs(z)
    return { answer: `\\left|${cx(z).tex}\\right| ${eqr(r)}`, steps: polarSteps(z).slice(0, 1), marks: [pointMark(z, 'z'), { kind: 'circle', c: C(0), r, dashed: true }], value: C(r) }
  },
  arg: (args, ctx) => {
    need(args, 1, 1, 'arg(z)')
    const z = numArg(args[0], ctx), th = Arg(z)
    if (Cx.abs(z) === 0) fail('arg 0 tidak didefinisikan.', 'arg 0 is undefined.')
    return { answer: `\\arg ${pp(cx(z).tex)} = ${rx(th).tex} + 2k\\pi,\\ k \\in \\mathbb{Z}`, note: bi('arg bernilai banyak; Arg adalah nilai utama', 'arg is multi-valued; Arg is the principal value'), steps: polarSteps(z).slice(1, -1), marks: [pointMark(z, 'z')], value: C(th) }
  },
  Arg: (args, ctx) => {
    need(args, 1, 1, 'Arg(z)')
    const z = numArg(args[0], ctx), th = Arg(z)
    if (Cx.abs(z) === 0) fail('Arg 0 tidak didefinisikan.', 'Arg 0 is undefined.')
    return { answer: `\\operatorname{Arg} ${pp(cx(z).tex)} ${eqr(th)}`, note: bi('nilai utama, −π < Arg z ≤ π', 'principal value, −π < Arg z ≤ π'), steps: polarSteps(z).slice(1, -1), marks: [pointMark(z, 'z')], value: C(th) }
  },
  polar: (args, ctx) => {
    need(args, 1, 1, 'polar(z)')
    const z = numArg(args[0], ctx), r = Cx.abs(z), th = Arg(z)
    return { answer: `${pp(cx(z).tex)} = ${expTex(r, th) || '1'} = ${rx(r).tex}\\left(\\cos ${pp(rx(th).tex)} + i\\sin ${pp(rx(th).tex)}\\right)`, note: bi(`r ≈ ${+r.toFixed(4)}, Θ ≈ ${+th.toFixed(4)} rad`, `r ≈ ${+r.toFixed(4)}, Θ ≈ ${+th.toFixed(4)} rad`), steps: polarSteps(z), marks: [pointMark(z, 'z'), { kind: 'circle', c: C(0), r, dashed: true }], value: z }
  },
  pow: (args, ctx) => {
    need(args, 2, 2, 'pow(z, n)')
    const z = numArg(args[0], ctx), c = numArg(args[1], ctx)
    const k = Math.abs(c.im) < 1e-12 && Number.isInteger(c.re) ? c.re : null
    return k !== null && Math.abs(k) <= 1000 ? powSteps(z, k, cx(z).tex) : cpowSteps(z, c, cx(z).tex, cx(c).tex)
  },
  roots: (args, ctx) => {
    need(args, 2, 2, 'roots(w, n)')
    const w = numArg(args[0], ctx), n = intArg(args[1], ctx, 1, 24)
    if (Cx.abs(w) === 0) return { answer: '0', steps: [], marks: [pointMark(C(0))], value: C(0), values: [C(0)] }
    const r = Cx.abs(w), th = Arg(w), R = r ** (1 / n)
    const Rt = rx(R).exact ? rx(R).tex : n === 2 ? `\\sqrt{${rx(r).tex}}` : `\\sqrt[${n}]{${rx(r).tex}}`
    const roots = Array.from({ length: n }, (_, k) => tidy(Cx.polar(R, (th + TAU * k) / n)))
    const steps = [...polarSteps(w, 'w'),
      st(`Akar pangkat ${n}: modulus diambil akarnya, sudut dibagi ${n} lalu ditambah kelipatan $2\\pi/${n}$.`, `The ${n}th roots: take the root of the modulus, divide the angle by ${n}, then add multiples of $2\\pi/${n}$.`, `c_k = \\sqrt[${n}]{r}\\,\\exp\\!\\left[i\\left(\\frac{\\Theta}{${n}} + \\frac{2k\\pi}{${n}}\\right)\\right] = ${Rt}\\,\\exp\\!\\left[i\\left(${rx(th / n).tex} + \\frac{2k\\pi}{${n}}\\right)\\right],\\ k = 0, \\dots, ${n - 1}`),
      ...roots.map((c, k) => st(`$k = ${k}$:`, `$k = ${k}$:`, `c_{${k}} = ${Rt}\\,e^{i${pp(rx((th + TAU * k) / n).tex)}} ${eqs(c)}`)),
      st(`Akar-akarnya adalah titik sudut segi-${n} beraturan pada lingkaran berjari-jari $${Rt}$.`, `The roots are the vertices of a regular ${n}-gon on the circle of radius $${Rt}$.`)]
    return { answer: roots.map((c, k) => `c_{${k}} ${eqs(c)}`).join(',\\quad '), note: bi(`${n} akar berbeda`, `${n} distinct roots`), steps, marks: [{ kind: 'circle', c: C(0), r: R, dashed: true }, ...(n > 2 ? [{ kind: 'poly', pts: roots, closed: true, dashed: true } as Mark] : []), ...roots.map((c, k) => pointMark(c, `c${subs(k)}`, "root")), pointMark(w, 'w')], value: roots[0], values: roots }
  },
  log: (args, ctx) => { need(args, 1, 1, 'log(z)'); const z = numArg(args[0], ctx); return logOut(z, cx(z).tex, false) },
  Log: (args, ctx) => { need(args, 1, 1, 'Log(z)'); const z = numArg(args[0], ctx); return logOut(z, cx(z).tex, true) },
  cr: (args, ctx) => { need(args, 1, 1, 'cr(f)'); return crOut(fnArg(args[0], ctx)) },
  derivative: (args, ctx) => { need(args, 1, 2, 'derivative(f, z0)'); return derivativeOut(fnArg(args[0], ctx), args[1] ? numArg(args[1], ctx) : null) },
  harmonic: (args, ctx) => { need(args, 1, 1, 'harmonic(u)'); return harmonicOut(args[0], ctx) },
  limit: (args, ctx) => { need(args, 2, 2, 'limit(f, z0)'); return limitOut(fnArg(args[0], ctx), /^(inf|oo|infinity)$/i.test(args[1].trim()) ? null : numArg(args[1], ctx)) },
  integral: (args, ctx) => { need(args, 2, 2, 'integral(f, C)'); return integralOut(fnArg(args[0], ctx), pathArg(args[1], ctx)) },
  ml: (args, ctx) => { need(args, 2, 2, 'ml(f, C)'); return mlOut(fnArg(args[0], ctx), pathArg(args[1], ctx)) },
  cauchy: (args, ctx) => { need(args, 3, 4, 'cauchy(f, a, C, n)'); return cauchyOut(fnArg(args[0], ctx), numArg(args[1], ctx), pathArg(args[2], ctx), intArg(args[3], ctx, 0, 8, 0)) },
  residue: (args, ctx) => { need(args, 2, 2, 'residue(f, a)'); return residueOut(fnArg(args[0], ctx), numArg(args[1], ctx)) },
  residues: (args, ctx) => { need(args, 1, 2, 'residues(f, C)'); return residuesOut(fnArg(args[0], ctx), args[1] ? pathArg(args[1], ctx) : null) },
  classify: (args, ctx) => { need(args, 2, 2, 'classify(f, a)'); return classifyOut(fnArg(args[0], ctx), numArg(args[1], ctx)) },
  zeros: (args, ctx) => { need(args, 1, 1, 'zeros(f)'); return zerosOut(fnArg(args[0], ctx)) },
  taylor: (args, ctx) => { need(args, 2, 3, 'taylor(f, a, n)'); return seriesOut(fnArg(args[0], ctx), numArg(args[1], ctx), intArg(args[2], ctx, 1, 20, 5), false, null) },
  laurent: (args, ctx) => {
    need(args, 2, 4, 'laurent(f, a, n, ρ)')
    const rho = args[3] ? numArg(args[3], ctx) : null
    if (rho && (Math.abs(rho.im) > 1e-12 || rho.re <= 0)) fail('ρ harus bilangan real positif (jari-jari di dalam anulus).', 'ρ must be a positive real number (a radius inside the annulus).')
    return seriesOut(fnArg(args[0], ctx), numArg(args[1], ctx), intArg(args[2], ctx, 1, 20, 4), true, rho ? rho.re : null)
  },
  region: (args, ctx) => { if (args.length !== 1) fail('Penulisan: region(|z - 1| < 2)', 'Usage: region(|z - 1| < 2)'); return regionOut(args[0], ctx) },
  circle: (args, ctx) => pathOut(makePath('circle', args, ctx)),
  segment: (args, ctx) => pathOut(makePath('segment', args, ctx)),
  polygon: (args, ctx) => pathOut(makePath('polygon', args, ctx)),
}


function pathOut(P: Path): Out {
  const p = pathTex(P), L = pathLength(P)
  const steps = P.kind === 'circle' ? [st('Parametrisasi (arah positif = berlawanan jarum jam):', 'Parametrisation (positive direction = counterclockwise):', `z(t) = ${p.z},\\ ${p.t},\\quad z'(t) = ${p.dz}`)] : edges(P).map(([a, b], i) => st(`Sisi ${i + 1}:`, `Side ${i + 1}:`, `z(t) = ${sumTex(a, `${ppz(Cx.sub(b, a)) === '1' ? '' : ppz(Cx.sub(b, a))}t`)},\\ 0 \\le t \\le 1`))
  steps.push(st('Panjang lintasan $L = \\int_a^b |z\'(t)|\\,dt$:', 'Length $L = \\int_a^b |z\'(t)|\\,dt$:', `L ${eqr(L)}`))
  const answer = P.kind === 'circle' ? `|${zm(P.c)}| = ${rx(P.r).tex}` : P.kind === 'segment' ? `[${cx(P.a).tex},\\ ${cx(P.b).tex}]` : `${P.pts.map((q) => cx(q).tex).join(' \\to ')} \\to ${cx(P.pts[0]).tex}`
  return { answer, note: bi(`lintasan, L ≈ ${dec(L)}`, `path, L ≈ ${dec(L)}`), steps, marks: pathMarks(P), path: P }
}

function crOut(F: Fn): Out {
  if (F.xy) fail('cr(f) memerlukan f(z); untuk u(x, y) gunakan harmonic(u).', 'cr(f) needs f(z); for u(x, y) use harmonic(u).')
  const steps: Step[] = [st('Tulis $z = x + iy$ dan pisahkan $f = u + iv$.', 'Write $z = x + iy$ and split $f = u + iv$.', `f(z) = ${fnTex(F)}`)]
  const R = toR2(F.ast, F.env)
  if (R) {
    const { U, V, D } = uvOf(R)
    steps.push(st('Bagian real dan imajiner:', 'Real and imaginary parts:', `u(x,y) = ${quoTex(U, D)},\\qquad v(x,y) = ${quoTex(V, D)}`))
    const ux = quoD(U, D, 'x'), uy = quoD(U, D, 'y'), vx = quoD(V, D, 'x'), vy = quoD(V, D, 'y')
    steps.push(st('Turunan parsial:', 'Partial derivatives:', `\\begin{aligned} u_x &= ${quoTex(ux, D, true)}, & v_y &= ${quoTex(vy, D, true)},\\\\ u_y &= ${quoTex(uy, D, true)}, & v_x &= ${quoTex(vx, D, true)} \\end{aligned}`))
    const E1 = p2add(ux, vy, -1), E2 = p2add(uy, vx)
    if (p2zero(E1) && p2zero(E2)) {
      const where = p2const(D) ? bi('di seluruh bidang', 'on the whole plane') : bi('di setiap titik dengan penyebut tidak nol', 'at every point where the denominator is nonzero')
      steps.push(st(`$u_x = v_y$ dan $u_y = -v_x$ berlaku identik, ${where.id}. Turunan parsialnya kontinu, jadi $f$ analitik di sana dan $f'(z) = u_x + iv_x$.`, `$u_x = v_y$ and $u_y = -v_x$ hold identically, ${where.en}. The partials are continuous, so $f$ is analytic there and $f'(z) = u_x + iv_x$.`, `f'(z) = ${quoTex(ux, D, true)} + i\\left(${quoTex(vx, D, true)}\\right)`))
      return { answer: `u_x = v_y,\\ u_y = -v_x\\ \\text{${'✓'}}`, note: bi(`Persamaan Cauchy-Riemann berlaku ${where.id}: f analitik`, `Cauchy-Riemann holds ${where.en}: f is analytic`), steps, marks: singMarks(singular(F, C(0), 6).map((s) => ({ z: s.z, kind: s.branch ? 'branch' : 'pole' }))) }
    }
    steps.push(st('Syarat Cauchy-Riemann menjadi dua persamaan (pembilangnya):', 'The Cauchy-Riemann conditions become two equations (numerators):', `u_x = v_y \\iff ${p2tex(E1)} = 0,\\qquad u_y = -v_x \\iff ${p2tex(E2)} = 0`))
    const set = solveSet(E1, E2, D)
    steps.push(st(set.text.id, set.text.en))
    if (set.where) steps.push(st('Di titik tersebut turunan ada (parsial kontinu) dan $f\' = u_x + iv_x$. Karena himpunan itu tidak memuat cakram terbuka, $f$ tidak analitik di mana pun.', 'At those points the derivative exists (continuous partials) and $f\' = u_x + iv_x$. Since the set contains no open disc, $f$ is analytic nowhere.'))
    else steps.push(st('Karena Cauchy-Riemann gagal di setiap titik, $f\'(z)$ tidak ada di mana pun dan $f$ tidak analitik.', 'Since Cauchy-Riemann fails everywhere, $f\'(z)$ exists nowhere and $f$ is not analytic.'))
    return { answer: set.answer, note: bi('Cauchy-Riemann tidak berlaku identik: f tidak analitik', 'Cauchy-Riemann does not hold identically: f is not analytic'), steps, marks: set.marks }
  }
  const el = F.ast.t === 'call' && F.ast.a.t === 'var' && F.ast.a.name === 'z' ? ELEMENTARY[F.ast.fn] : undefined
  if (el) {
    steps.push(st('Rumus baku (dengan $z = x + iy$):', 'Standard formula (with $z = x + iy$):', `u = ${el[0]},\\qquad v = ${el[1]}`))
    steps.push(st('Turunan parsial:', 'Partial derivatives:', `\\begin{aligned} u_x &= ${el[2]}, & v_y &= ${el[5]},\\\\ u_y &= ${el[3]}, & v_x &= ${el[4]} \\end{aligned}`))
    steps.push(st('Jadi $u_x = v_y$ dan $u_y = -v_x$ di setiap titik, dan semua parsial kontinu: $f$ entire, dengan $f\'(z) = u_x + iv_x$.', 'So $u_x = v_y$ and $u_y = -v_x$ everywhere and all partials are continuous: $f$ is entire, with $f\'(z) = u_x + iv_x$.', `f'(z) = ${el[2]} + i\\left(${el[4]}\\right)`))
    return { answer: 'u_x = v_y,\\ u_y = -v_x\\ \\text{✓}', note: bi('Cauchy-Riemann berlaku di seluruh bidang: f entire', 'Cauchy-Riemann holds on the whole plane: f is entire'), steps, marks: [] }
  }
  // numeric fallback
  const pts = [C(0.31, 0.72), C(-1.17, 0.43), C(0.83, -1.09)]
  const checks = pts.map((z) => ({ z, c: Cx.cauchyRiemann(F.f, z) })).filter((p) => Number.isFinite(p.c.violation))
  const ok = checks.length > 0 && checks.every((p) => p.c.violation < 1e-5)
  steps.push(st('u dan v tidak berbentuk polinomial/rasional dalam x, y, jadi Cauchy-Riemann dicek numerik (beda pusat, h ≈ 10⁻⁴) di beberapa titik:', 'u and v are not polynomial/rational in x, y, so Cauchy-Riemann is checked numerically (central differences, h ≈ 10⁻⁴) at sample points:',
    checks.map((p) => `z = ${cx(p.z).tex}:\\ u_x - v_y \\approx ${dec(p.c.ux - p.c.vy)},\\ u_y + v_x \\approx ${dec(p.c.uy + p.c.vx)}`).join('\\\\ ')))
  steps.push(ok ? st(F.analytic ? 'Selisihnya nol (dalam galat numerik). Ini konsisten dengan teorema: komposisi fungsi analitik (eksponen, trigonometri, polinomial, hasil bagi) analitik di mana pun terdefinisi.' : 'Selisihnya nol pada titik sampel, tetapi ini bukan bukti untuk seluruh bidang.', F.analytic ? 'The differences vanish (within numerical error). This matches the theorem: compositions of analytic functions (exponential, trig, polynomials, quotients) are analytic wherever defined.' : 'The differences vanish at the samples, but that is not a proof for the whole plane.')
    : st('Selisihnya tidak nol: Cauchy-Riemann gagal di titik sampel, jadi f tidak analitik di sana.', 'The differences are nonzero: Cauchy-Riemann fails at the samples, so f is not analytic there.'))
  return { answer: ok ? 'u_x = v_y,\\ u_y = -v_x\\ \\text{(numerik / numeric)}' : 'u_x \\ne v_y\\ \\text{atau/or}\\ u_y \\ne -v_x', note: ok ? bi('Cauchy-Riemann berlaku di titik sampel (cek numerik)', 'Cauchy-Riemann holds at the samples (numeric check)') : bi('Cauchy-Riemann gagal (cek numerik)', 'Cauchy-Riemann fails (numeric check)'), steps, marks: checks.map((p) => pointMark(p.z, undefined, 'root')) }
}
const ELEMENTARY: Record<string, string[]> = {
  exp: ['e^x\\cos y', 'e^x\\sin y', 'e^x\\cos y', '-e^x\\sin y', 'e^x\\sin y', 'e^x\\cos y'],
  sin: ['\\sin x\\cosh y', '\\cos x\\sinh y', '\\cos x\\cosh y', '\\sin x\\sinh y', '-\\sin x\\sinh y', '\\cos x\\cosh y'],
  cos: ['\\cos x\\cosh y', '-\\sin x\\sinh y', '-\\sin x\\cosh y', '\\cos x\\sinh y', '-\\cos x\\sinh y', '-\\sin x\\cosh y'],
  sinh: ['\\sinh x\\cos y', '\\cosh x\\sin y', '\\cosh x\\cos y', '-\\sinh x\\sin y', '\\sinh x\\sin y', '\\cosh x\\cos y'],
  cosh: ['\\cosh x\\cos y', '\\sinh x\\sin y', '\\sinh x\\cos y', '-\\cosh x\\sin y', '\\cosh x\\sin y', '\\sinh x\\cos y'],
}
const snap = (x: number) => { const r = Math.round(x * 12) / 12; return Math.abs(x - r) < 1e-4 ? r : x }
/** Where E1 = E2 = 0 (and D ≠ 0): exact for linear equations, Levenberg-Marquardt search otherwise. */
function solveSet(E1: P2, E2: P2, D: P2): { text: Bi; answer: string; marks: Mark[]; where: boolean } {
  const lin = (E: P2) => ({ a: E.get(K)?.re ?? 0, b: E.get(1)?.re ?? 0, c: E.get(0)?.re ?? 0 })
  const okD = (x: number, y: number) => Cx.abs(p2eval(D, x, y)) > 1e-12
  const pointsAns = (ps: Complex[]) => {
    const ok = ps.filter((p) => okD(p.re, p.im))
    if (!ok.length) return { text: bi('Tidak ada titik yang memenuhi kedua persamaan: Cauchy-Riemann gagal di setiap titik.', 'No point satisfies both equations: Cauchy-Riemann fails everywhere.'), answer: '\\text{CR: ✗}', marks: [], where: false }
    const list = ok.map((p) => cx(p).tex).join(',\\ ')
    return { text: bi(`Kedua persamaan hanya dipenuhi di $z = ${list}$.`, `Both equations hold only at $z = ${list}$.`), answer: `\\text{CR}\\iff z = ${list}`, marks: ok.map((p) => pointMark(p, lab(p), "root")), where: true }
  }
  if (p2deg(E1) <= 1 && p2deg(E2) <= 1) {
    const eqs2 = [lin(E1), lin(E2)].filter((e) => Math.hypot(e.a, e.b, e.c) > 1e-10)
    if (eqs2.some((e) => Math.hypot(e.a, e.b) < 1e-10)) return pointsAns([])
    const lineAns = (e: { a: number; b: number; c: number }) => {
      const L: P2 = new Map([[K, C(e.a)], [1, C(e.b)], [0, C(e.c)]]), n = Math.hypot(e.a, e.b), p0 = C(-e.a * e.c / n ** 2, -e.b * e.c / n ** 2), dir = C(-e.b / n, e.a / n)
      return { text: bi(`Kedua syarat dipenuhi tepat pada garis $${p2tex(L)} = 0$.`, `Both conditions hold exactly on the line $${p2tex(L)} = 0$.`), answer: `\\text{CR}\\iff ${p2tex(L)} = 0`, marks: [{ kind: 'poly', pts: [Cx.add(p0, Cx.scale(dir, -1e3)), Cx.add(p0, Cx.scale(dir, 1e3))], infinite: true } as Mark], where: true }
    }
    if (eqs2.length === 1) return lineAns(eqs2[0])
    const [e, f] = eqs2, det = e.a * f.b - e.b * f.a
    if (Math.abs(det) > 1e-12) return pointsAns([C(snap((e.b * f.c - f.b * e.c) / det), snap((f.a * e.c - e.a * f.c) / det))])
    return Math.abs(e.a * f.c - f.a * e.c) + Math.abs(e.b * f.c - f.b * e.c) < 1e-10 ? lineAns(e) : pointsAns([])
  }
  const ev = (p: P2, x: number, y: number) => p2eval(p, x, y).re
  const G = [E1, E2].map((E) => [p2d(E, 'x'), p2d(E, 'y')])
  const sols: Complex[] = []
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    let x = i + 0.11, y = j + 0.07, lam = 1e-3
    const S = (x: number, y: number) => ev(E1, x, y) ** 2 + ev(E2, x, y) ** 2
    for (let it = 0; it < 300; it++) {
      const r = [ev(E1, x, y), ev(E2, x, y)], J = G.map(([gx, gy]) => [ev(gx, x, y), ev(gy, x, y)])
      const s0 = r[0] ** 2 + r[1] ** 2
      if (s0 < 1e-28) break
      const a11 = J[0][0] ** 2 + J[1][0] ** 2 + lam, a22 = J[0][1] ** 2 + J[1][1] ** 2 + lam, a12 = J[0][0] * J[0][1] + J[1][0] * J[1][1]
      const g1 = J[0][0] * r[0] + J[1][0] * r[1], g2 = J[0][1] * r[0] + J[1][1] * r[1], det = a11 * a22 - a12 * a12
      const dx = -(a22 * g1 - a12 * g2) / det, dy = -(a11 * g2 - a12 * g1) / det
      if (S(x + dx, y + dy) < s0) { x += dx; y += dy; lam /= 3 } else lam *= 4
      if (lam > 1e12) break
    }
    if (S(x, y) < 1e-16 && Math.abs(x) < 50 && Math.abs(y) < 50 && !sols.some((s) => Math.hypot(s.re - x, s.im - y) < 1e-3)) sols.push(C(snap(x), snap(y)))
  }
  if (sols.length > 6) return { text: bi('Kedua persamaan dipenuhi sepanjang suatu kurva (bukan cakram terbuka).', 'Both equations hold along a curve (not an open disc).'), answer: '\\text{CR hanya pada kurva / only on a curve}', marks: sols.map((p) => pointMark(p, undefined, 'root')), where: true }
  return pointsAns(sols)
}

function derivativeOut(F: Fn, z0: Complex | null): Out {
  if (F.analytic) {
    const d = simp(dz(F.ast, F.env)), dt = texNode(d)
    const steps = [st('Pakai aturan turunan (sama seperti kalkulus real: pangkat, hasil kali, hasil bagi, rantai, $(e^z)\' = e^z$, $(\\sin z)\' = \\cos z$, ...):', 'Use the differentiation rules (as in real calculus: power, product, quotient, chain, $(e^z)\' = e^z$, $(\\sin z)\' = \\cos z$, ...):', `f(z) = ${fnTex(F)}\\;\\Rightarrow\\; f'(z) = ${dt}`)]
    if (!z0) return { answer: `f'(z) = ${dt}`, steps, marks: [] }
    const e = { ...F.env, z: z0 }, v = tidy(evaluate(d, e))
    if (!Cx.isFinite(v)) fail(`f'(z) tidak terdefinisi di $${cx(z0).tex}$ (titik singular).`, `f'(z) is undefined at $${cx(z0).tex}$ (a singular point).`)
    steps.push(st('Substitusi $z_0$:', 'Substitute $z_0$:', `f'(${cx(z0).tex}) = ${texNode(d, { z: `\\left(${cx(z0).tex}\\right)` })} ${eqs(v)}`))
    return { answer: `f'(${cx(z0).tex}) ${eqs(v)}`, note: bi('aturan turunan', 'differentiation rules'), steps, marks: [pointMark(z0, 'z₀', 'root')], value: v }
  }
  if (!z0) fail('f memuat x, y, z̄, |z|, Re atau Im. Beri titik: derivative(f, z0); turunan dicek lewat Cauchy-Riemann di titik itu.', 'f involves x, y, z̄, |z|, Re or Im. Give a point: derivative(f, z0); the derivative is checked with Cauchy-Riemann there.')
  const p = z0!, R = toR2(F.ast, F.env)
  let ux: number, uy: number, vx: number, vy: number
  if (R) {
    const { U, V, D } = uvOf(R), d2 = p2eval(D, p.re, p.im).re ** 2 || 1
    const val = (N: P2, w: 'x' | 'y') => p2eval(quoD(N, D, w), p.re, p.im).re / (p2const(D) ? 1 : d2)
    ux = val(U, 'x'); uy = val(U, 'y'); vx = val(V, 'x'); vy = val(V, 'y')
  } else { const c = Cx.cauchyRiemann(F.f, p); ux = c.ux; uy = c.uy; vx = c.vx; vy = c.vy }
  const tol = R ? 1e-9 : 1e-5, ok = Math.abs(ux - vy) < tol * (1 + Math.abs(ux)) && Math.abs(uy + vx) < tol * (1 + Math.abs(uy))
  const steps = [...crOut(F).steps.slice(0, 3), st(`Nilai di $z_0 = ${cx(p).tex}$${R ? '' : ' (numerik)'}:`, `Values at $z_0 = ${cx(p).tex}$${R ? '' : ' (numeric)'}:`, `u_x = ${rx(ux).tex},\\ v_y = ${rx(vy).tex},\\ u_y = ${rx(uy).tex},\\ v_x = ${rx(vx).tex}`)]
  if (!ok) {
    steps.push(st('Cauchy-Riemann gagal di $z_0$, jadi $f\'(z_0)$ tidak ada.', 'Cauchy-Riemann fails at $z_0$, so $f\'(z_0)$ does not exist.'))
    return { answer: `f'(${cx(p).tex})\\ \\text{tidak ada / does not exist}`, steps, marks: [pointMark(p, 'z₀', 'root')] }
  }
  const v = tidy(C(ux, vx))
  steps.push(st('Cauchy-Riemann berlaku di $z_0$ dan parsialnya kontinu, jadi $f\'(z_0)$ ada:', 'Cauchy-Riemann holds at $z_0$ and the partials are continuous, so $f\'(z_0)$ exists:', `f'(z_0) = u_x + iv_x ${eqs(v)}`))
  return { answer: `f'(${cx(p).tex}) ${eqs(v)}`, note: bi('lewat Cauchy-Riemann di satu titik', 'via Cauchy-Riemann at a single point'), steps, marks: [pointMark(p, 'z₀', 'root')], value: v }
}

function harmonicOut(arg: string, ctx: Ctx): Out {
  const U = ctx.fns[arg.trim()] ?? makeFn(arg, ctx, '', true)
  if (freeVars(U.ast).has('z')) fail('Tulis u sebagai fungsi x dan y, misalnya harmonic(x^2 - y^2).', 'Write u in x and y, e.g. harmonic(x^2 - y^2).')
  const ut = texNode(U.ast), R = toR2(U.ast, U.env)
  const poly = R && p2const(R.d) ? uvOf(R) : null
  if (!poly || !p2zero(poly.V)) {
    const pts = [C(0.4, 0.3), C(-0.8, 1.1), C(1.3, -0.6)], lap = pts.map((z) => Cx.cauchyRiemann((w) => C(U.f(w).re), z).laplaceU)
    const ok = lap.every((x) => Math.abs(x) < 1e-3)
    return { answer: ok ? `\\Delta u \\approx 0\\ \\text{(numerik / numeric)}` : `\\Delta u \\ne 0`, note: bi('u bukan polinomial: Laplace dicek numerik; konjugat simbolik hanya untuk u polinomial', 'u is not a polynomial: Laplace checked numerically; symbolic conjugate only for polynomial u'),
      steps: [st('Uji Laplace numerik (beda hingga) di beberapa titik:', 'Numerical Laplace test (finite differences) at sample points:', pts.map((z, k) => `u_{xx}+u_{yy}\\big|_{${cx(z).tex}} \\approx ${dec(lap[k])}`).join(',\\quad '))], marks: pts.map((z) => pointMark(z, undefined, 'root')) }
  }
  const u = poly.U, ux = p2d(u, 'x'), uy = p2d(u, 'y'), uxx = p2d(ux, 'x'), uyy = p2d(uy, 'y'), lap = p2add(uxx, uyy)
  const steps = [st('Turunan parsial pertama dan kedua:', 'First and second partial derivatives:', `u_x = ${p2tex(ux)},\\quad u_y = ${p2tex(uy)},\\quad u_{xx} = ${p2tex(uxx)},\\quad u_{yy} = ${p2tex(uyy)}`),
    st('Persamaan Laplace:', "Laplace's equation:", `u_{xx} + u_{yy} = ${p2tex(lap)}`)]
  if (!p2zero(lap)) {
    steps.push(st('Tidak nol, jadi u tidak harmonik dan tidak mempunyai konjugat harmonik.', 'Not zero, so u is not harmonic and has no harmonic conjugate.'))
    return { answer: `u_{xx} + u_{yy} = ${p2tex(lap)} \\ne 0`, note: bi('tidak harmonik', 'not harmonic'), steps, marks: [] }
  }
  const v1 = p2int(ux, 'y'), phiP = p2add(p2map(uy, Cx.neg), p2d(v1, 'x'), -1), phi = p2int(phiP, 'x'), v = p2add(v1, phi)
  steps.push(st('u harmonik. Cari v dari $v_y = u_x$: integralkan terhadap y (konstanta integrasi bergantung pada x).', 'u is harmonic. Find v from $v_y = u_x$: integrate in y (the constant may depend on x).', `v = \\int u_x\\,dy = ${p2tex(v1)} + \\varphi(x)`))
  steps.push(st('Pakai $v_x = -u_y$ untuk menentukan $\\varphi$:', 'Use $v_x = -u_y$ to find $\\varphi$:', `${p2tex(p2d(v1, 'x'))} + \\varphi'(x) = ${p2tex(p2map(uy, Cx.neg))}\\;\\Rightarrow\\; \\varphi'(x) = ${p2tex(phiP)},\\ \\varphi(x) = ${p2tex(phi)} + C`))
  const fz: Poly = []
  for (const [k, c] of u) if (k % K === 0) fz[k / K] = Cx.add(fz[k / K] ?? C(0), c)
  for (const [k, c] of v) if (k % K === 0) fz[k / K] = Cx.add(fz[k / K] ?? C(0), C(-c.im, c.re))
  const fp = Array.from({ length: fz.length }, (_, k) => fz[k] ?? C(0))
  steps.push(st('Konjugat harmonik dan fungsi analitiknya ($f(z) = u(z, 0) + iv(z, 0)$, metode Milne-Thomson):', 'The harmonic conjugate and the analytic function ($f(z) = u(z, 0) + iv(z, 0)$, Milne-Thomson):', `v(x,y) = ${p2tex(v)} + C,\\qquad f(z) = u + iv = ${polyTex(fp)} + iC`))
  return { answer: `v(x,y) = ${p2tex(v)} + C`, note: bi(`harmonik ✓; f(z) = u + iv analitik`, `harmonic ✓; f(z) = u + iv is analytic`), steps: [st('Fungsi yang diberikan:', 'Given function:', `u(x,y) = ${ut}`), ...steps], marks: [] }
}

function limitOut(F: Fn, z0: Complex | null): Out {
  const g = z0 ? F.f : (w: Complex) => F.f(Cx.inv(w)), a = z0 ?? C(0)
  const paths: { id: string; en: string; tex: string; d: (t: number) => Complex }[] = [
    { id: 'sumbu real dari kanan', en: 'real axis from the right', tex: 'z_0 + t', d: (t) => C(t, 0) },
    { id: 'sumbu real dari kiri', en: 'real axis from the left', tex: 'z_0 - t', d: (t) => C(-t, 0) },
    { id: 'sumbu imajiner', en: 'imaginary axis', tex: 'z_0 + it', d: (t) => C(0, t) },
    { id: 'garis y = x', en: 'line y = x', tex: 'z_0 + (1+i)t', d: (t) => C(t, t) },
    { id: 'parabola', en: 'parabola', tex: 'z_0 + t + it^2', d: (t) => C(t, t * t) },
  ]
  const t1 = 1e-4, t2 = 1e-6
  const vals = paths.map((p) => {
    const v1 = g(Cx.add(a, p.d(t1))), v2 = g(Cx.add(a, p.d(t2)))
    if (!Cx.isFinite(v2) || Cx.abs(v2) > 1e7) return C(Infinity)
    return tidy(Cx.scale(Cx.sub(Cx.scale(v2, 100), v1), 1 / 99))
  })
  const zt = z0 ? cx(z0).tex : '\\infty', lim = `\\lim_{z\\to ${zt}} f(z)`
  const steps = [st(z0 ? 'Dekati $z_0$ sepanjang beberapa lintasan $z = z(t)$, $t \\to 0^+$, dan bandingkan nilainya (galat orde $t$ dihapus dengan ekstrapolasi Richardson):' : 'Substitusi $z = 1/w$ lalu $w \\to 0$ sepanjang beberapa lintasan:', z0 ? 'Approach $z_0$ along several paths $z = z(t)$, $t \\to 0^+$, and compare (the order-$t$ error is removed by Richardson extrapolation):' : 'Substitute $z = 1/w$ and let $w \\to 0$ along several paths:', `f(z) = ${fnTex(F)}`),
    ...paths.map((p, k) => st(`${p.id}:`, `${p.en}:`, `${z0 ? `z = ${p.tex}` : `w = ${p.tex.replace('z_0 ', '0 ')}`}\\;\\Rightarrow\\; f \\to ${Cx.isFinite(vals[k]) ? show(vals[k]) : '\\infty'}`))]
  const inf = vals.every((v) => !Cx.isFinite(v)), fin = vals.filter(Cx.isFinite)
  if (inf) {
    steps.push(st('$|f| \\to \\infty$ di semua lintasan.', '$|f| \\to \\infty$ along every path.'))
    return { answer: `${lim} = \\infty`, steps, marks: z0 ? [pointMark(z0, 'z₀', 'root')] : [], value: C(Infinity) }
  }
  const L = fin[0], agree = fin.length === vals.length && fin.every((v) => Cx.abs(Cx.sub(v, L)) < 1e-5 * (1 + Cx.abs(L)))
  if (!agree) {
    const k = vals.findIndex((v) => !Cx.isFinite(v) || Cx.abs(Cx.sub(v, L)) >= 1e-5 * (1 + Cx.abs(L)))
    steps.push(st(`Lintasan "${paths[0].id}" dan "${paths[k].id}" memberi nilai berbeda, jadi limitnya tidak ada.`, `The paths "${paths[0].en}" and "${paths[k].en}" give different values, so the limit does not exist.`))
    return { answer: `${lim}\\ \\text{tidak ada / does not exist}`, note: bi('contoh penyangkal: dua lintasan, dua nilai', 'counterexample: two paths, two values'), steps, marks: z0 ? [pointMark(z0, 'z₀', 'root')] : [] }
  }
  let v = L
  if (z0) {
    const f0 = F.f(z0)
    if (Cx.isFinite(f0) && Cx.abs(Cx.sub(f0, L)) < 1e-6 * (1 + Cx.abs(L))) { v = tidy(f0); steps.push(st('f terdefinisi dan kontinu di $z_0$, jadi limitnya cukup dengan substitusi:', 'f is defined and continuous at $z_0$, so the limit is found by substitution:', `f(${zt}) ${eqs(v)}`)) }
  }
  steps.push(st('Semua lintasan memberi nilai yang sama. (Kesepakatan pada beberapa lintasan adalah bukti numerik, bukan bukti formal; untuk bukti gunakan sifat limit atau definisi ε-δ.)', 'Every path gives the same value. (Agreement on finitely many paths is numerical evidence, not a proof; for a proof use the limit laws or the ε-δ definition.)'))
  return { answer: `${lim} ${eqs(v)}`, steps, marks: z0 ? [pointMark(z0, 'z₀', 'root')] : [], value: v }
}

function insideInfo(F: Fn, P: Path) {
  const { c, R } = bounds(P), sings = singular(F, c, R * 1.5 + 1)
  const on = sings.filter((s) => onPath(P, s.z))
  if (on.length) fail(`Titik singular $${cx(on[0].z).tex}$ terletak pada lintasan; integralnya tidak terdefinisi (sebagai integral biasa).`, `The singular point $${cx(on[0].z).tex}$ lies on the path; the integral is undefined (as an ordinary integral).`)
  const inside = sings.map((s) => ({ ...s, n: winding(P, s.z) })).filter((s) => s.n !== 0)
  return { sings, inside }
}

function integralOut(F: Fn, P: Path): Out {
  const I = integrate(P, F.f), steps = pathSteps(P, F)
  const L = closed(P) ? `\\oint_C ${fnTex(F).length < 40 ? fnTex(F) : 'f(z)'}\\,dz` : `\\int_C ${fnTex(F).length < 40 ? fnTex(F) : 'f(z)'}\\,dz`
  steps.push(st('Integral dihitung numerik (trapesium pada lingkaran, Simpson pada ruas):', 'The integral is evaluated numerically (trapezoid on circles, Simpson on segments):', `${L} ${eqs(I)}`))
  let value = I, note: Bi | undefined
  const marks = pathMarks(P)
  if (P.kind === 'segment') {
    const p = F.analytic ? polyZ(F.ast, F.env) : null
    if (p) {
      const Fp: Poly = [C(0), ...p.map((c, k) => Cx.scale(c, 1 / (k + 1)))], v = tidy(Cx.sub(pev(Fp, P.b), pev(Fp, P.a)))
      steps.push(st('f polinomial, jadi punya antiturunan $F$ dengan $F\' = f$, dan integral hanya bergantung pada titik ujung:', 'f is a polynomial, so it has an antiderivative $F$ with $F\' = f$, and the integral depends only on the end points:', `F(z) = ${polyTex(Fp)},\\qquad \\int_C f\\,dz = F(${cx(P.b).tex}) - F(${cx(P.a).tex}) ${eqs(v)}`))
      value = v; note = bi('teorema dasar: F(b) − F(a)', 'fundamental theorem: F(b) − F(a)')
    } else if (!F.analytic) note = bi('f tidak analitik: hasil bergantung pada lintasan', 'f is not analytic: the value depends on the path')
  } else if (F.analytic) {
    const { inside, sings } = insideInfo(F, P)
    if (inside.some((s) => s.branch) || sings.some((s) => s.branch)) {
      steps.push(st('f memuat cabang (log, akar, pangkat tak bulat): teorema Cauchy-Goursat/residu hanya berlaku bila potongan cabang tidak memotong daerah di dalam C. Hasil di atas numerik.', 'f contains a branch (log, root, non-integer power): Cauchy-Goursat / residues apply only if the branch cut stays outside the region bounded by C. The value above is numeric.'))
    } else if (!inside.length) {
      steps.push(st('f analitik pada dan di dalam lintasan tertutup sederhana C, jadi menurut teorema Cauchy-Goursat:', 'f is analytic on and inside the simple closed contour C, so by the Cauchy-Goursat theorem:', `${L} = 0`))
      value = C(0); note = bi('teorema Cauchy-Goursat', 'Cauchy-Goursat theorem')
    } else {
      const res = inside.map((s) => ({ ...s, r: residueAt(F, s.z, sings) }))
      const total = tidy(res.reduce((acc, s) => Cx.add(acc, Cx.scale(s.r.res, s.n)), C(0))), v = tidy(Cx.mul(C(0, TAU), total))
      steps.push(st('Titik singular di dalam C dan residunya:', 'Singular points inside C and their residues:', res.map((s) => `\\operatorname*{Res}_{z=${cx(s.z).tex}} f ${eqs(s.r.res)}`).join(',\\quad ')))
      steps.push(st('Teorema residu Cauchy:', "Cauchy's residue theorem:", `${L} = 2\\pi i\\sum_k \\operatorname*{Res}_{z=z_k} f = 2\\pi i\\left(${cx(total).tex}\\right) ${eqs(v)}`))
      if (Cx.abs(Cx.sub(v, I)) < 1e-6 * (1 + Cx.abs(v))) value = v
      note = bi('teorema residu (dicek numerik)', 'residue theorem (checked numerically)')
      marks.push(...singMarks(res.map((s) => ({ z: s.z, kind: s.r.kind.kind }))))
    }
  } else note = bi('f tidak analitik: hanya nilai numerik, teorema Cauchy tidak berlaku', 'f is not analytic: numeric value only, Cauchy theorems do not apply')
  return { answer: `${L} ${eqs(value)}`, note, steps, marks, value }
}

function mlOut(F: Fn, P: Path): Out {
  const pts = samplePath(P, 4000), mods = pts.map((z) => Cx.abs(F.f(z)))
  if (!mods.every(Number.isFinite)) fail('f tidak terdefinisi di suatu titik pada lintasan.', 'f is undefined at a point on the path.')
  const k = mods.indexOf(Math.max(...mods)), M = mods[k], L = pathLength(P), I = integrate(P, F.f)
  const steps = [st('Ketaksamaan ML: jika $|f(z)| \\le M$ pada C dan C panjangnya L, maka', 'The ML inequality: if $|f(z)| \\le M$ on C and C has length L, then', '\\left|\\int_C f(z)\\,dz\\right| \\le ML'),
    st(P.kind === 'circle' ? 'Panjang lingkaran $L = 2\\pi r$:' : 'Panjang lintasan (jumlah panjang sisi):', P.kind === 'circle' ? 'Circumference $L = 2\\pi r$:' : 'Path length (sum of side lengths):', `L ${eqr(L)}`),
    st('M dicari dengan menyampel 4000 titik C (dengan tangan biasanya pakai ketaksamaan segitiga, misalnya $|z^2+1| \\ge |z|^2 - 1$ untuk penyebut):', 'M is found by sampling 4000 points of C (by hand one usually uses the triangle inequality, e.g. $|z^2+1| \\ge |z|^2 - 1$ for a denominator):', `M = \\max_{z\\in C}|f(z)| ${eqr(M)}\\ \\text{di/at}\\ z ${eqs(pts[k])}`),
    st('Batas dan nilai sebenarnya untuk perbandingan:', 'The bound, and the actual value for comparison:', `\\left|\\int_C f\\,dz\\right| \\le ML ${eqr(M * L)},\\qquad \\left|\\int_C f\\,dz\\right| ${eqr(Cx.abs(I))}`)]
  return { answer: `\\left|\\int_C f\\,dz\\right| \\le ML ${eqr(M * L)}`, note: bi('M ditaksir dari sampel; nilai maksimum sebenarnya bisa sedikit lebih besar', 'M is estimated from samples; the true maximum can be slightly larger'), steps, marks: [...pathMarks(P), pointMark(pts[k], 'M', 'root')], value: C(M * L) }
}

function cauchyOut(F: Fn, a: Complex, P: Path, n: number): Out {
  if (!closed(P)) fail('Rumus integral Cauchy memerlukan lintasan tertutup (circle atau polygon).', 'The Cauchy integral formula needs a closed path (circle or polygon).')
  if (!F.analytic) fail('f harus analitik (fungsi dari z saja).', 'f must be analytic (a function of z only).')
  if (onPath(P, a)) fail('a terletak pada lintasan.', 'a lies on the path.')
  const w = winding(P, a)
  const integrand = (z: Complex) => { let d = Cx.sub(z, a), p = d; for (let k = 0; k < n; k++) p = Cx.mul(p, d); return Cx.div(F.f(z), p) }
  const I = integrate(P, integrand), den = n === 0 ? '(z - a)' : `(z - a)^{${n + 1}}`
  const head = `\\oint_C \\frac{${fnTex(F)}}{${n === 0 ? zm(a) : `\\left(${zm(a)}\\right)^{${n + 1}}`}}\\,dz`
  const steps = [st('Rumus integral Cauchy (diperumum) untuk f analitik pada dan di dalam C, dengan a di dalam C:', 'Cauchy integral formula (generalised) for f analytic on and inside C, with a inside C:', `\\oint_C \\frac{f(z)}{${den}}\\,dz = \\frac{2\\pi i}{${n}!}f^{(${n})}(a)`)]
  const { inside } = insideInfo(F, P)
  if (inside.length) steps.push(st(`Perhatian: f sendiri mempunyai titik singular di dalam C (${inside.map((s) => `$${cx(s.z).tex}$`).join(', ')}), jadi rumus ini tidak berlaku langsung; nilai numerik di bawah tetap benar. Gunakan residues(...).`, `Warning: f itself has singular points inside C (${inside.map((s) => `$${cx(s.z).tex}$`).join(', ')}), so the formula does not apply directly; the numeric value below is still correct. Use residues(...).`))
  if (w === 0) {
    steps.push(st('a di luar C, sehingga integran analitik di dalam C dan (Cauchy-Goursat) integralnya 0.', 'a is outside C, so the integrand is analytic inside C and (Cauchy-Goursat) the integral is 0.', `${head} = 0`))
    return { answer: `${head} = 0`, note: bi('a di luar C', 'a is outside C'), steps, marks: [...pathMarks(P), pointMark(a, 'a', 'root')], value: C(0) }
  }
  let d = F.ast
  for (let k = 0; k < n; k++) d = simp(dz(d, F.env))
  const fa = tidy(evaluate(d, { ...F.env, z: a })), v = tidy(Cx.scale(Cx.mul(C(0, TAU * w), fa), 1 / fact(n)))
  if (n > 0) steps.push(st(`Turunan ke-${n}:`, `The ${n}th derivative:`, `f^{(${n})}(z) = ${texNode(d)}`))
  steps.push(st('Substitusi a:', 'Substitute a:', `f^{(${n})}(${cx(a).tex}) ${eqs(fa)}`))
  steps.push(st(w === 1 ? 'Hasil:' : `C mengelilingi a sebanyak ${w} kali, jadi kalikan dengan ${w}:`, w === 1 ? 'Result:' : `C winds around a ${w} times, so multiply by ${w}:`, `${head} = ${w === 1 ? '' : w}\\frac{2\\pi i}{${n}!}\\left(${cx(fa).tex}\\right) ${eqs(v)}`))
  steps.push(st('Cek numerik langsung:', 'Direct numerical check:', `${head} ${eqs(I)}`))
  return { answer: `${head} ${eqs(inside.length ? I : v)}`, note: bi('rumus integral Cauchy', 'Cauchy integral formula'), steps, marks: [...pathMarks(P), pointMark(a, 'a', 'root')], value: inside.length ? I : v }
}

function residueOut(F: Fn, a: Complex): Out {
  if (!F.analytic) fail('Residu memerlukan f analitik di sekitar titik (fungsi dari z saja).', 'Residues need f analytic near the point (a function of z only).')
  const sings = singular(F, a, 10), r = residueAt(F, a, sings)
  return { answer: `\\operatorname*{Res}_{z=${cx(a).tex}} f(z) ${eqs(r.res)}`, note: r.method, steps: [st('Fungsi:', 'Function:', `f(z) = ${fnTex(F)}`), ...r.steps], marks: singMarks([{ z: a, kind: r.kind.kind }]), value: r.res }
}

function residuesOut(F: Fn, P: Path | null): Out {
  if (!F.analytic) fail('Residu memerlukan f analitik (fungsi dari z saja).', 'Residues need f analytic (a function of z only).')
  let list: { z: Complex; branch: boolean; n: number }[]
  let sings: Sing[]
  if (P) {
    if (!closed(P)) fail('Teorema residu memerlukan lintasan tertutup.', 'The residue theorem needs a closed path.')
    const info = insideInfo(F, P); sings = info.sings; list = info.inside
  } else { sings = singular(F, C(0), 10); list = sings.slice(0, 12).map((s) => ({ ...s, n: 1 })) }
  const steps: Step[] = [st(P ? 'Cari titik singular f (nol penyebut) di dalam C:' : 'Cari titik singular f (nol penyebut; pencarian numerik di |z| ≤ 10 untuk penyebut non-polinomial):', P ? 'Find the singular points of f (zeros of denominators) inside C:' : 'Find the singular points of f (zeros of denominators; numerical search in |z| ≤ 10 for non-polynomial denominators):', `f(z) = ${fnTex(F)}`)]
  if (list.some((s) => s.branch)) fail('f mempunyai titik cabang di sini; teorema residu tidak berlaku.', 'f has a branch point here; the residue theorem does not apply.')
  if (!list.length) {
    steps.push(st(P ? 'Tidak ada titik singular di dalam C, jadi menurut Cauchy-Goursat integralnya 0.' : 'Tidak ditemukan titik singular terisolasi.', P ? 'No singular points inside C, so by Cauchy-Goursat the integral is 0.' : 'No isolated singular points were found.', P ? '\\oint_C f\\,dz = 0' : undefined))
    return { answer: P ? '\\oint_C f\\,dz = 0' : '\\text{tidak ada / none}', steps, marks: P ? pathMarks(P) : [], value: C(0) }
  }
  const res = list.map((s) => ({ ...s, r: residueAt(F, s.z, sings) }))
  for (const s of res) steps.push(st(`$z = ${cx(s.z).tex}$: ${kindBi(s.r.kind).id}; ${s.r.method.id}.${s.n !== 1 ? ` Indeks lintasan ${s.n}.` : ''}`, `$z = ${cx(s.z).tex}$: ${kindBi(s.r.kind).en}; ${s.r.method.en}.${s.n !== 1 ? ` Winding number ${s.n}.` : ''}`, `\\operatorname*{Res}_{z=${cx(s.z).tex}} f ${eqs(s.r.res)}`))
  const marks = [...(P ? pathMarks(P) : []), ...singMarks(res.map((s) => ({ z: s.z, kind: s.r.kind.kind })))]
  if (!P) return { answer: res.map((s) => `\\operatorname*{Res}_{${cx(s.z).tex}} ${eqs(s.r.res)}`).join(',\\quad '), steps, marks, values: res.map((s) => s.r.res), value: res[0].r.res }
  const total = tidy(res.reduce((acc, s) => Cx.add(acc, Cx.scale(s.r.res, s.n)), C(0))), v = tidy(Cx.mul(C(0, TAU), total)), I = integrate(P, F.f)
  steps.push(st('Teorema residu Cauchy:', "Cauchy's residue theorem:", `\\oint_C f\\,dz = 2\\pi i \\sum_k n(C, z_k)\\operatorname*{Res}_{z=z_k} f = 2\\pi i\\left(${cx(total).tex}\\right) ${eqs(v)}`))
  steps.push(st('Cek numerik langsung:', 'Direct numerical check:', `\\oint_C f\\,dz ${eqs(I)}`))
  return { answer: `\\oint_C f\\,dz = 2\\pi i\\sum\\operatorname{Res} ${eqs(v)}`, note: bi(`${res.length} titik singular di dalam C`, `${res.length} singular point${res.length > 1 ? 's' : ''} inside C`), steps, marks, value: v, values: res.map((s) => s.r.res) }
}

function classifyOut(F: Fn, a: Complex): Out {
  if (!F.analytic) fail('Klasifikasi memerlukan f analitik di sekitar titik.', 'Classification needs f analytic near the point.')
  const sings = singular(F, a, 10), self = sings.find((s) => near(s.z, a, 1e-7))
  if (self?.branch) return { answer: `${cx(a).tex}:\\ \\text{titik cabang / branch point}`, note: KIND_TEXT.branch, steps: [st('f memuat log, akar, atau pangkat tak bulat yang argumennya nol di sini: titik cabang, bukan titik singular terisolasi (setiap lingkungan memotong potongan cabang).', 'f contains a log, root or non-integer power whose argument vanishes here: a branch point, not an isolated singularity (every neighbourhood meets the branch cut).')], marks: singMarks([{ z: a, kind: 'branch' }]) }
  const dn = dNear(a, sings), rho = Math.min(0.5, 0.4 * dn), k = orderAt(F.f, a, Math.min(1, dn / 2))
  const steps: Step[] = [st('Fungsi:', 'Function:', `f(z) = ${fnTex(F)}`)]
  const za = a.re === 0 && a.im === 0 ? 'z' : `\\left(${zm(a)}\\right)`
  if (k.kind === 'removable') {
    const c0 = coeffs(F.f, a, rho, [0])[0]
    steps.push(st('$f$ terbatas di sekitar $z_0$ dan limitnya ada:', '$f$ stays bounded near $z_0$ and the limit exists:', `\\lim_{z\\to ${cx(a).tex}} f(z) ${eqs(c0)}`))
    steps.push(st(`Deret Laurent tidak mempunyai pangkat negatif. Jika f tidak terdefinisi di $z_0$, definisikan $f(z_0) = ${show(c0)}$ agar f analitik di sana.`, `The Laurent series has no negative powers. If f is undefined at $z_0$, set $f(z_0) = ${show(c0)}$ to make f analytic there.`))
  } else if (k.kind === 'pole') {
    const cs = coeffs(F.f, a, rho, Array.from({ length: k.m }, (_, j) => -(k.m - j)))
    steps.push(st(`$|f(z)|$ tumbuh seperti $|z - z_0|^{-${k.m}}$; uji: $(z-z_0)^{${k.m}}f(z)$ mempunyai limit berhingga tidak nol.`, `$|f(z)|$ grows like $|z - z_0|^{-${k.m}}$; test: $(z-z_0)^{${k.m}}f(z)$ has a finite nonzero limit.`, `\\lim_{z\\to ${cx(a).tex}} ${za}^{${k.m}} f(z) ${eqs(cs[0])} \\ne 0`))
    steps.push(st('Bagian utama deret Laurent (berhingga):', 'Principal part of the Laurent series (finite):', cs.map((c, j) => `\\frac{${cx(c).tex}}{${za}${k.m - j > 1 ? `^{${k.m - j}}` : ''}}`).join(' + ').replace(/\+ \\frac\{-/g, '- \\frac{')))
  } else {
    const cs = coeffs(F.f, a, rho, [-1, -2, -3, -4, -5])
    steps.push(st('Tidak ada m dengan $(z-z_0)^m f$ terbatas: $|f|$ membesar tanpa batas di beberapa arah dan tetap kecil di arah lain.', 'No m makes $(z-z_0)^m f$ bounded: $|f|$ blows up in some directions and stays small in others.'))
    steps.push(st('Koefisien negatif Laurent tidak berhenti (numerik):', 'The negative Laurent coefficients do not stop (numeric):', cs.map((c, j) => `a_{-${j + 1}} ${eqs(c)}`).join(',\\ ') + ',\\ \\dots'))
  }
  return { answer: `${cx(a).tex}:\\ \\text{${kindBi(k).id} / ${kindBi(k).en}}`, note: kindBi(k), steps, marks: singMarks([{ z: a, kind: k.kind }]) }
}

function zerosOut(F: Fn): Out {
  if (!F.analytic) fail('zeros(f) memerlukan f analitik (fungsi dari z).', 'zeros(f) needs an analytic f (a function of z).')
  const top = F.ast.t === 'bin' && F.ast.op === '/' ? F.ast : null, numer = top ? top.a : F.ast
  const p = polyZ(numer, F.env)
  let zs: { z: Complex; m: number }[]
  if (p) {
    const roots = polyRoots(p)
    zs = roots.filter((z, i) => roots.findIndex((w) => near(w, z)) === i).map((z) => ({ z, m: roots.filter((w) => near(w, z)).length }))
  } else {
    zs = newtonZeros(numer, F.env, C(0), 6).map((z) => {
      let d = numer, m = 0
      while (m < 6) { const v = Cx.abs(evaluate(d, { ...F.env, z })); if (v > 1e-7) break; d = simp(dz(d, F.env)); m++ }
      return { z, m: Math.max(1, m) }
    })
  }
  const sings = singular(F, C(0), 6)
  zs = zs.filter((s) => !sings.some((t) => near(t.z, s.z, 1e-6)) || Cx.isFinite(F.f(s.z)) && Cx.abs(F.f(s.z)) < 1e-9)
  const steps = [st(p ? 'Nol f adalah nol pembilang (polinomial); orde = multiplisitas akar:' : 'Nol dicari numerik (metode Newton di |z| ≤ 6); orde = banyaknya turunan yang nol di titik itu:', p ? 'The zeros of f are the zeros of the (polynomial) numerator; order = multiplicity of the root:' : 'Zeros found numerically (Newton in |z| ≤ 6); order = number of vanishing derivatives there:', `f(z) = ${fnTex(F)}`),
    ...zs.map((s) => st(`orde ${s.m}`, `order ${s.m}`, `z = ${show(s.z)}`))]
  if (top && sings.length) steps.push(st('Titik yang juga membuat penyebut nol tidak dihitung sebagai nol f.', 'Points that also make the denominator zero are not counted as zeros of f.'))
  return { answer: zs.length ? zs.map((s) => `${show(s.z)}${s.m > 1 ? `\\ (m=${s.m})` : ''}`).join(',\\quad ') : '\\text{tidak ada / none}', note: bi(`${zs.length} nol`, `${zs.length} zero${zs.length === 1 ? '' : 's'}`), steps, marks: zs.map((s) => pointMark(s.z, lab(s.z), "zero")), values: zs.map((s) => s.z) }
}

function termTex(c: Complex, k: number, base: string): { tex: string; neg: boolean } {
  const cc = cx(c), pure = Math.abs(c.im) < 1e-12 || Math.abs(c.re) < 1e-12
  let t = cc.tex, neg = false
  if (pure && t.startsWith('-')) { neg = true; t = t.slice(1) }
  if (!pure || hasOps(t)) t = `\\left(${t}\\right)`
  const pw = (m: number) => m === 1 ? base : `${base}^{${m}}`
  if (k === 0) return { tex: t, neg }
  if (k > 0) return { tex: `${t === '1' ? '' : t}${pw(k)}`, neg }
  const fr = t.match(/^\\frac\{(\d+)\}\{(\d+)\}$/)
  if (fr) return { tex: `\\frac{${fr[1]}}{${fr[2]}${pw(-k)}}`, neg }
  return { tex: /^\d+$/.test(t) ? `\\frac{${t}}{${pw(-k)}}` : `\\frac{${t}}{${pw(-k)}}`, neg }
}
function seriesOut(F: Fn, a: Complex, n: number, laurent: boolean, rhoIn: number | null): Out {
  if (!F.analytic) fail('f tidak analitik (memuat z̄, |z|, x, y, Re atau Im), jadi tidak punya deret pangkat dalam z.', 'f is not analytic (it involves z̄, |z|, x, y, Re or Im), so it has no power series in z.')
  const sings = singular(F, a, 20), ds = sings.map((s) => Cx.abs(Cx.sub(s.z, a))).sort((p, q) => p - q)
  const atCentre = ds.length > 0 && ds[0] < 1e-7, others = ds.filter((d) => d >= 1e-7)
  if (!laurent && atCentre) fail('f tidak analitik di titik pusat; gunakan laurent(f, a, n).', 'f is not analytic at the centre; use laurent(f, a, n).')
  if (sings.some((s) => s.branch && Cx.abs(Cx.sub(s.z, a)) < 1e-7)) fail('Pusat adalah titik cabang; tidak ada deret Laurent di sekitarnya.', 'The centre is a branch point; there is no Laurent series around it.')
  let inner = 0, outer = others[0] ?? Infinity, rho: number
  if (rhoIn !== null) {
    if (ds.some((d) => Math.abs(d - rhoIn) < 1e-9)) fail('ρ tepat melewati titik singular; pilih ρ lain.', 'ρ passes through a singular point; choose another ρ.')
    inner = Math.max(0, ...ds.filter((d) => d < rhoIn)); outer = Math.min(Infinity, ...ds.filter((d) => d > rhoIn)); rho = rhoIn
  } else rho = Number.isFinite(outer) ? outer / 2 : 1
  const entire = !hasDenominators(F.ast)
  const ks = laurent ? Array.from({ length: 2 * n + 1 }, (_, j) => j - n) : Array.from({ length: n + 1 }, (_, j) => j)
  const cs = coeffs(F.f, a, rho, ks, 1024)
  const base = a.re === 0 && a.im === 0 ? 'z' : `\\left(${zm(a)}\\right)`
  let series = ''
  ks.forEach((k, j) => { if (Cx.abs(cs[j]) < 1e-10) return; const t = termTex(cs[j], k, base); series += series ? (t.neg ? ' - ' : ' + ') + t.tex : (t.neg ? '-' : '') + t.tex })
  series = (series || '0') + ' + \\cdots'
  const zt = cx(a).tex, absz = a.re === 0 && a.im === 0 ? '|z|' : `|z - ${ppz(a)}|`
  const ann = laurent ? `${rx(inner).tex} < ${absz} < ${Number.isFinite(outer) ? rx(outer).tex : '\\infty'}` : `${absz} < ${Number.isFinite(outer) ? rx(outer).tex : '\\infty'}`
  const steps: Step[] = [st('Fungsi:', 'Function:', `f(z) = ${fnTex(F)}`)]
  if (laurent) steps.push(st(`Titik singular terdekat menentukan anulus konvergensi di sekitar $z_0 = ${zt}$${sings.length ? ` (titik singular: ${sings.slice(0, 6).map((s) => `$${cx(s.z).tex}$`).join(', ')})` : ''}:`, `The nearest singular points fix the annulus of convergence around $z_0 = ${zt}$${sings.length ? ` (singular points: ${sings.slice(0, 6).map((s) => `$${cx(s.z).tex}$`).join(', ')})` : ''}:`, ann))
  else steps.push(st(entire ? 'f entire (tanpa titik singular), jadi jari-jari konvergensi tak hingga.' : Number.isFinite(outer) ? 'Jari-jari konvergensi = jarak dari pusat ke titik singular terdekat:' : 'Tidak ditemukan titik singular dalam jarak 20 dari pusat:', entire ? 'f is entire (no singular points), so the radius of convergence is infinite.' : Number.isFinite(outer) ? 'Radius of convergence = distance from the centre to the nearest singular point:' : 'No singular point was found within distance 20 of the centre:', `R = ${Number.isFinite(outer) ? rx(outer).tex : entire ? '\\infty' : '\\ge 20'}`))
  steps.push(st(laurent ? 'Koefisien Laurent (dihitung numerik dengan integral kontur pada lingkaran di dalam anulus):' : 'Koefisien Taylor $c_k = f^{(k)}(z_0)/k!$ (dihitung numerik dengan rumus Cauchy):', laurent ? 'Laurent coefficients (computed numerically with a contour integral on a circle inside the annulus):' : 'Taylor coefficients $c_k = f^{(k)}(z_0)/k!$ (computed numerically with the Cauchy formula):', `c_k = \\frac{1}{2\\pi i}\\oint_{|z - z_0| = ${rx(rho).tex}}\\frac{f(z)}{(z-z_0)^{k+1}}\\,dz`))
  steps.push(st('Nilai koefisien:', 'Coefficient values:', ks.map((k, j) => `c_{${k}} ${eqs(cs[j])}`).join(',\\quad ')))
  if (laurent) {
    const neg = ks.filter((k, j) => k < 0 && Cx.abs(cs[j]) > 1e-10)
    steps.push(st(neg.length ? `Bagian utama (pangkat negatif) memuat ${neg.length === n ? `paling sedikit ${n}` : neg.length} suku.` : 'Tidak ada pangkat negatif: di anulus ini deret Laurent adalah deret Taylor.', neg.length ? `The principal part (negative powers) has ${neg.length === n ? `at least ${n}` : neg.length} term${neg.length > 1 ? 's' : ''}.` : 'No negative powers: in this annulus the Laurent series is a Taylor series.'))
  }
  const marks: Mark[] = [pointMark(a, 'z₀', 'root'), ...singMarks(sings.slice(0, 12).map((s) => ({ z: s.z, kind: s.branch ? 'branch' : 'pole' })))]
  if (Number.isFinite(outer)) marks.push({ kind: 'circle', c: a, r: outer, dashed: true })
  if (laurent && inner > 0) marks.push({ kind: 'circle', c: a, r: inner, dashed: true })
  return { answer: `f(z) = ${series},\\quad ${ann}`, note: laurent ? bi('deret Laurent', 'Laurent series') : bi(`deret Taylor, R = ${Number.isFinite(outer) ? dec(outer) : entire ? '∞' : '≥ 20'}`, `Taylor series, R = ${Number.isFinite(outer) ? dec(outer) : entire ? '∞' : '≥ 20'}`), steps, marks, values: cs }
}

function regionOut(src: string, ctx: Ctx): Out {

  const parts = src.split(/(<=|>=|≤|≥|<|>)/)
  if (parts.length !== 3 && parts.length !== 5) fail('Tulis satu atau dua ketaksamaan, misalnya region(1 < |z - i| <= 2).', 'Write one or two inequalities, e.g. region(1 < |z - i| <= 2).')
  const sides = parts.filter((_, i) => i % 2 === 0).map((s) => makeFn(s, ctx)), ops = parts.filter((_, i) => i % 2 === 1).map((o) => o === '≤' ? '<=' : o === '≥' ? '>=' : o)
  const cmp = (a: number, o: string, b: number) => o === '<' ? a < b : o === '<=' ? a <= b + 1e-12 : o === '>' ? a > b : a >= b - 1e-12
  const test = (z: Complex) => { const v = sides.map((F) => F.f(z).re); return ops.every((o, k) => cmp(v[k], o, v[k + 1])) }
  const strict = ops.every((o) => o === '<' || o === '>'), nonstrict = ops.every((o) => o === '<=' || o === '>=')
  // recognise |z - a| against constants
  const disc = sides.map((F) => {
    if (F.ast.t !== 'call' || F.ast.fn !== 'abs') return null
    const p = polyZ(F.ast.a, F.env)
    if (!p || ptrim(p).length !== 2) return null
    return { a: tidy(Cx.neg(Cx.div(p[0], p[1]))), k: Cx.abs(p[1]) }
  })
  const consts = sides.map((F) => hasZ(F.ast) || freeVars(F.ast).has('x') || freeVars(F.ast).has('y') ? null : F.f(C(0)).re)
  const steps: Step[] = [], marks: Mark[] = []
  let shape: Bi | null = null, box: [number, number, number, number] = [-5, -5, 5, 5]
  const di = disc.findIndex((d) => d), d = di >= 0 ? disc[di]! : null
  if (d && disc.filter(Boolean).length === 1 && consts.every((c, k) => k === di || c !== null)) {
    const rs = consts.map((c) => c === null ? null : c / d.k), at = cx(d.a).tex
    steps.push(st(`$|z - z_0|$ adalah jarak dari z ke $z_0 = ${at}$. Dengan $z = x + iy$:`, `$|z - z_0|$ is the distance from z to $z_0 = ${at}$. With $z = x + iy$:`, `|z - z_0|^2 = \\left(x ${d.a.re ? (d.a.re > 0 ? '- ' : '+ ') + rx(Math.abs(d.a.re)).tex : ''}\\right)^2 + \\left(y ${d.a.im ? (d.a.im > 0 ? '- ' : '+ ') + rx(Math.abs(d.a.im)).tex : ''}\\right)^2`))
    const rad = rs.filter((r): r is number => r !== null && r > 0)
    rad.forEach((r) => marks.push({ kind: 'circle', c: d.a, r, dashed: true }))
    const R = Math.max(1, ...rad)
    box = [d.a.re - R, d.a.im - R, d.a.re + R, d.a.im + R]
    if (sides.length === 3 && di === 1) shape = bi(`anulus (cincin) berpusat $${at}$ dengan jari-jari ${rad.map((r) => `$${rx(r).tex}$`).join(' dan ')}`, `an annulus centred at $${at}$ with radii ${rad.map((r) => `$${rx(r).tex}$`).join(' and ')}`)
    else if (sides.length === 2) {
      const less = (di === 0) === ops[0].startsWith('<'), r = rs[1 - di] ?? 0
      shape = less ? bi(`${nonstrict ? 'cakram tertutup' : 'cakram terbuka'} berpusat $${at}$, jari-jari $${rx(r).tex}$`, `the ${nonstrict ? 'closed' : 'open'} disc centred at $${at}$ with radius $${rx(r).tex}$`) : bi(`bagian luar lingkaran berpusat $${at}$, jari-jari $${rx(r).tex}$`, `the exterior of the circle centred at $${at}$ with radius $${rx(r).tex}$`)
    }
  } else {
    const rs = sides.map((F) => { const R = toR2(F.ast, F.env); return R ? uvOf(R) : null })
    if (rs.every((r) => r && p2const(r.D))) steps.push(st('Dengan $z = x + iy$ ketaksamaannya menjadi:', 'With $z = x + iy$ the inequality becomes:', rs.map((r) => p2tex(r!.U)).map((t, k) => k ? `${ops[k - 1].replace('<=', '\\le').replace('>=', '\\ge')} ${t}` : t).join(' ')))
  }
  const bounded = Array.from({ length: 64 }, (_, k) => Cx.polar(1e3, (TAU * k) / 64)).every((z) => !test(z))
  steps.push(st(`Sifat: ${strict ? 'terbuka (semua ketaksamaan tegas, fungsi kontinu)' : nonstrict ? 'tertutup (ketaksamaan tak tegas)' : 'tidak terbuka dan tidak tertutup'}; ${bounded ? 'terbatas' : 'tidak terbatas'}${shape && strict ? '; terhubung, jadi merupakan domain' : ''}.`, `Properties: ${strict ? 'open (strict inequalities of continuous functions)' : nonstrict ? 'closed (non-strict inequalities)' : 'neither open nor closed'}; ${bounded ? 'bounded' : 'unbounded'}${shape && strict ? '; connected, so it is a domain' : ''}.`))
  if (!shape) steps.push(st('Gambar menunjukkan titik-titik yang memenuhi ketaksamaan (disampel pada grid).', 'The picture shows the points satisfying the inequality (sampled on a grid).'))
  marks.unshift({ kind: 'region', test, box })
  const answer = `\\{z : ${src.replace(/<=|≤/g, '\\le ').replace(/>=|≥/g, '\\ge ').replace(/\|/g, '|')}\\}`
  return { answer, note: shape ?? bi(bounded ? 'daerah terbatas' : 'daerah tak terbatas', bounded ? 'bounded region' : 'unbounded region'), steps, marks }
}

function defineOut(name: string, src: string, ctx: Ctx, xy: boolean): Out {
  const F = makeFn(src, ctx, name, xy)
  const head = xy ? `${name}(x,y) = ${fnTex(F)}` : `${name}(z) = ${fnTex(F)}`
  const steps: Step[] = []
  let marks: Mark[] = []
  if (!xy) {
    const R = toR2(F.ast, F.env)
    if (R) { const { U, V, D } = uvOf(R); steps.push(st('Dengan $z = x + iy$, $f = u + iv$:', 'With $z = x + iy$, $f = u + iv$:', `u = ${quoTex(U, D)},\\qquad v = ${quoTex(V, D)}`)) }
    if (F.analytic) {
      const sings = singular(F, C(0), 6).slice(0, 12)
      if (sings.length) steps.push(st('f tidak terdefinisi (titik singular atau titik cabang) di:', 'f is undefined (singular or branch points) at:', sings.map((s) => cx(s.z).tex).join(',\\ ')))
      marks = singMarks(sings.map((s) => ({ z: s.z, kind: s.branch ? 'branch' : 'pole' })))
    } else steps.push(st('f memuat z̄, |z|, x, y, Re atau Im: periksa analitisitas dengan cr(...).', 'f involves z̄, |z|, x, y, Re or Im: check analyticity with cr(...).'))
  }
  return { answer: head, note: xy ? bi('fungsi real u(x, y)', 'real function u(x, y)') : bi('fungsi f(z)', 'function f(z)'), steps, marks, fn: F }
}

function command(src: string, ctx: Ctx): Out {
  const c = splitCall(src)
  if (c) {
    const F = ctx.fns[c.name]
    if (F && c.args.length === 1 && c.name.length === 1) {
      const z0 = numArg(c.args[0], ctx), v = tidy(F.f(z0))
      if (!Cx.isFinite(v)) fail(`${c.name} tidak terdefinisi di $${cx(z0).tex}$.`, `${c.name} is undefined at $${cx(z0).tex}$.`)
      const steps = [st('Substitusi:', 'Substitute:', `${c.name}(${cx(z0).tex}) = ${texNode(F.ast, F.xy ? { x: pp(rx(z0.re).tex), y: pp(rx(z0.im).tex) } : { z: `\\left(${cx(z0).tex}\\right)`, x: pp(rx(z0.re).tex), y: pp(rx(z0.im).tex) })} ${eqs(v)}`)]
      if (!F.xy) { const op = opSteps(F.ast, { ...ctx, nums: { ...F.env, z: z0, x: C(z0.re), y: C(z0.im) } }); if (!op.out) steps.push(...op.steps) }
      return { answer: `${c.name}(${cx(z0).tex}) ${eqs(v)}`, steps, marks: [pointMark(z0, 'z₀', 'root'), pointMark(v, `${c.name}(z₀)`)], value: v }
    }
    if (Object.hasOwn(COMMANDS, c.name)) return COMMANDS[c.name](c.args, ctx)
  }
  if (/[<>≤≥]/.test(src)) return regionOut(src, ctx)
  return numberOut(src, ctx)
}

const NUM_NAME = /^[a-df-hj-wz]$/

export function calculate(entries: Entry[]): Row[] {
  const ctx: Ctx = { nums: Object.create(null), fns: Object.create(null), paths: Object.create(null) }

  const taken = (n: string) => n in ctx.nums || n in ctx.fns || n in ctx.paths
  return entries.map((entry, index) => {
    let name = `#${index + 1}`
    try {
      const src = entry.text.trim().replace(/−/g, '-').replace(/π/g, 'pi').replace(/∞/g, 'inf')
      if (!src) fail('Ketik bilangan, fungsi, atau perintah.', 'Type a number, a function or a command.')
      if (src.length > 300) fail('Batasi baris sampai 300 karakter.', 'Keep a row below 300 characters.')
      const def = src.match(/^([a-z])\s*\(\s*(z|x\s*,\s*y)\s*\)\s*=([^=<>].*)$/)
      if (def) {
        name = def[1]
        if (['i', 'e', 'x', 'y', 'z'].includes(name)) fail('Nama fungsi: satu huruf kecil selain i, e, x, y, z.', 'Function name: one lowercase letter other than i, e, x, y, z.')
        if (taken(name)) fail(`Nama ${name} sudah dipakai.`, `The name ${name} is already used.`)
        const out = defineOut(name, def[3].trim(), ctx, def[2] !== 'z')
        ctx.fns[name] = out.fn!
        return { entry, name, answer: out.answer, note: out.note, steps: out.steps, marks: out.marks }
      }
      const asg = src.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=([^=<>].*)$/)
      const rhs = asg ? asg[2].trim() : src
      if (asg) { name = asg[1]; if (taken(name)) fail(`Nama ${name} sudah dipakai.`, `The name ${name} is already used.`) }
      const out = command(rhs, ctx)
      let answer = out.answer
      if (asg) {
        if (out.path) ctx.paths[name] = out.path
        else if (out.value && !out.values?.length || out.value && out.values?.length === 1) {
          if (!NUM_NAME.test(name)) fail('Nama bilangan: satu huruf kecil selain i, e, x, y (huruf itu dipakai di ekspresi).', 'Number name: one lowercase letter other than i, e, x, y (it is used inside expressions).')
          ctx.nums[name] = out.value
        } else fail('Hasil baris ini tidak bisa disimpan sebagai satu bilangan atau lintasan.', 'This result cannot be stored as one number or path.')
        answer = `${name} ${out.path ? ':' : '='} ${answer}`
        if (!out.path) out.marks = out.marks.map((m) => m.kind === 'point' && m.vector && !m.label ? { ...m, label: name } : m)
      }
      return { entry, name, answer, note: out.note, steps: out.steps, marks: out.marks, value: out.value, values: out.values }
    } catch (e) {
      const error = e instanceof StudioError ? e.bi : bi(`Ekspresi tidak valid: ${e instanceof Error ? e.message : e}`, `Invalid expression: ${e instanceof Error ? e.message : e}`)
      return { entry, name, steps: [], marks: [], error }
    }
  })
}

/** Row colours for the Argand plane (theme tokens, as in the picture stories). */
export const ROW_COLORS = ['var(--accent)', 'var(--success)', 'var(--warn)', 'var(--violet)', 'var(--fg-2)']
