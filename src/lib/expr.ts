/**
 * Small expression language for user-typed formulas.
 *   f(z) = z^2 + c,  (z-1)/(z+1),  exp(1/z),  sin(z)/z,  conj(z),  |z|^2 …
 *   x^2 + 8y^2 - 4xy - 8x + 6y - 5 = 0   (polynomial equations in x, y, z)
 * Compiles to a complex evaluator (JS) and to GLSL for the shader.
 */
import * as Cx from './complex-math'
import type { Complex } from './complex-math'

export type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; name: string }
  | { t: 'neg'; a: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { t: 'call'; fn: string; a: Node }

const FUNCS = ['exp', 'log', 'ln', 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh', 'sqrt', 'conj', 'abs', 're', 'im', 'arg'] as const
type Fn = (typeof FUNCS)[number]
const FUNCS_BY_LENGTH = [...FUNCS].sort((a, b) => b.length - a.length)

// ---------- tokenizer / parser (precedence climbing) ----------

type Tok = { k: 'num'; v: number } | { k: 'id'; v: string } | { k: 'op'; v: string }

function tokenize(src: string): Tok[] {
  const s = src.replace(/−/g, '-').replace(/·|×/g, '*').replace(/\s+/g, '')
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/[0-9.]/.test(ch)) {
      const m = s.slice(i).match(/^\d*\.?\d+(?:e[+-]?\d+)?|^\d+\.?/i)!
      out.push({ k: 'num', v: parseFloat(m[0]) }); i += m[0].length
    } else if (/[a-zA-Z]/.test(ch)) {
      // split a run of letters into known names: "sinz" → sin z, "xy" → x y (implicit product)
      let name = s.slice(i).match(/^[a-zA-Z]+/)![0]
      i += name.length
      name = name.toLowerCase()
      while (name.length) {
        const take = FUNCS_BY_LENGTH.find((f) => name.startsWith(f)) ?? (name.startsWith('pi') ? 'pi' : name[0])
        out.push({ k: 'id', v: take })
        name = name.slice(take.length)
      }
    } else if ('+-*/^()|'.includes(ch)) { out.push({ k: 'op', v: ch }); i++ }
    else throw new Error(`unexpected '${ch}'`)
  }
  return out
}

export function parse(src: string): Node {
  const toks = tokenize(src)
  let p = 0
  const peek = () => toks[p]
  const eat = (v?: string) => { const t = toks[p]; if (!t || (v !== undefined && !(t.k === 'op' && t.v === v))) throw new Error(`expected ${v ?? 'token'}`); p++; return t }
  const isOp = (v: string) => { const t = peek(); return t && t.k === 'op' && t.v === v }

  const primary = (): Node => {
    const t = peek()
    if (!t) throw new Error('unexpected end')
    if (t.k === 'num') { p++; return { t: 'num', v: t.v } }
    if (t.k === 'op' && t.v === '(') { p++; const e = expr(); eat(')'); return e }
    if (t.k === 'op' && t.v === '|') { p++; const e = expr(); eat('|'); return { t: 'call', fn: 'abs', a: e } }
    if (t.k === 'op' && t.v === '-') { p++; return { t: 'neg', a: unary() } }
    if (t.k === 'op' && t.v === '+') { p++; return unary() }
    if (t.k === 'id') {
      p++
      if ((FUNCS as readonly string[]).includes(t.v)) {
        const arg = isOp('(') ? (() => { p++; const e = expr(); eat(')'); return e })() : unary()
        return { t: 'call', fn: t.v, a: arg }
      }
      return { t: 'var', name: t.v }
    }
    throw new Error(`unexpected '${t.v}'`)
  }
  const power = (): Node => {
    const base = primary()
    if (isOp('^')) { p++; return { t: 'bin', op: '^', a: base, b: unary() } }
    return base
  }
  const unary = (): Node => power()
  const term = (): Node => {
    let a = unary()
    for (;;) {
      if (isOp('*')) { p++; a = { t: 'bin', op: '*', a, b: unary() } }
      else if (isOp('/')) { p++; a = { t: 'bin', op: '/', a, b: unary() } }
      else {
        // implicit multiplication: 2z, z(z+1), (z-1)(z+1), zc
        const t = peek()
        if (t && (t.k === 'num' || t.k === 'id' || (t.k === 'op' && t.v === '('))) a = { t: 'bin', op: '*', a, b: unary() }
        else break
      }
    }
    return a
  }
  const expr = (): Node => {
    let a = term()
    while (isOp('+') || isOp('-')) { const op = (eat() as { v: '+' | '-' }).v; a = { t: 'bin', op, a, b: term() } }
    return a
  }
  const e = expr()
  if (p !== toks.length) throw new Error('trailing input')
  return e
}

export const freeVars = (n: Node, out = new Set<string>()): Set<string> => {
  if (n.t === 'var') out.add(n.name)
  else if (n.t === 'neg') freeVars(n.a, out)
  else if (n.t === 'bin') { freeVars(n.a, out); freeVars(n.b, out) }
  else if (n.t === 'call') freeVars(n.a, out)
  return out
}

// ---------- complex evaluation ----------

const cpow = (a: Complex, b: Complex): Complex => {
  if (Cx.abs(a) === 0) return b.re > 0 ? Cx.C(0) : Cx.C(NaN, NaN)
  // integer powers exactly, to keep polynomials clean
  if (b.im === 0 && Number.isInteger(b.re) && Math.abs(b.re) <= 64) {
    let r = Cx.C(1), base = a, n = Math.abs(b.re)
    while (n) { if (n & 1) r = Cx.mul(r, base); base = Cx.mul(base, base); n >>= 1 }
    return b.re < 0 ? Cx.inv(r) : r
  }
  return Cx.exp(Cx.mul(b, Cx.log(a)))
}
const ctan = (z: Complex) => Cx.div(Cx.sin(z), Cx.cos(z))
const csinh = (z: Complex): Complex => Cx.C(Math.sinh(z.re) * Math.cos(z.im), Math.cosh(z.re) * Math.sin(z.im))
const ccosh = (z: Complex): Complex => Cx.C(Math.cosh(z.re) * Math.cos(z.im), Math.sinh(z.re) * Math.sin(z.im))

export function evaluate(n: Node, env: Record<string, Complex>): Complex {
  switch (n.t) {
    case 'num': return Cx.C(n.v)
    case 'var': {
      if (n.name === 'i') return Cx.C(0, 1)
      if (n.name === 'pi') return Cx.C(Math.PI)
      if (n.name === 'e') return Cx.C(Math.E)
      const v = env[n.name]
      if (!v) throw new Error(`unknown variable ${n.name}`)
      return v
    }
    case 'neg': return Cx.neg(evaluate(n.a, env))
    case 'bin': {
      const a = evaluate(n.a, env), b = evaluate(n.b, env)
      switch (n.op) {
        case '+': return Cx.add(a, b)
        case '-': return Cx.sub(a, b)
        case '*': return Cx.mul(a, b)
        case '/': return Cx.div(a, b)
        case '^': return cpow(a, b)
      }
      break
    }
    case 'call': {
      const a = evaluate(n.a, env)
      switch (n.fn as Fn) {
        case 'exp': return Cx.exp(a)
        case 'log': case 'ln': return Cx.log(a)
        case 'sin': return Cx.sin(a)
        case 'cos': return Cx.cos(a)
        case 'tan': return ctan(a)
        case 'sinh': return csinh(a)
        case 'cosh': return ccosh(a)
        case 'tanh': return Cx.div(csinh(a), ccosh(a))
        case 'sqrt': return Cx.sqrt(a)
        case 'conj': return Cx.conj(a)
        case 'abs': return Cx.C(Cx.abs(a))
        case 're': return Cx.C(a.re)
        case 'im': return Cx.C(a.im)
        case 'arg': return Cx.C(Cx.arg(a))
      }
    }
  }
  throw new Error('bad node')
}

/** Compile f(z; c). Throws on syntax errors or unknown variables. */
export function compileComplex(src: string): { f: (z: Complex, c: Complex) => Complex; glsl: string; tex: string } {
  const ast = parse(src)
  const bad = [...freeVars(ast)].filter((v) => !['z', 'c', 'i', 'e', 'pi'].includes(v))
  if (bad.length) throw new Error(`unknown variable ${bad[0]}`)
  return { f: (z, c) => evaluate(ast, { z, c }), glsl: toGLSL(ast), tex: toTex(ast) }
}

// ---------- GLSL ----------

function toGLSL(n: Node): string {
  switch (n.t) {
    case 'num': return `vec2(${n.v.toExponential(8)}, 0.0)`
    case 'var': return n.name === 'i' ? 'vec2(0.0, 1.0)' : n.name === 'pi' ? 'vec2(3.14159265358979, 0.0)' : n.name === 'e' ? 'vec2(2.71828182845905, 0.0)' : n.name === 'z' ? 'z' : 'uC'
    case 'neg': return `(-${toGLSL(n.a)})`
    case 'bin': {
      const a = toGLSL(n.a), b = toGLSL(n.b)
      switch (n.op) {
        case '+': return `(${a} + ${b})`
        case '-': return `(${a} - ${b})`
        case '*': return `cmul(${a}, ${b})`
        case '/': return `cdiv(${a}, ${b})`
        case '^': {
          if (n.b.t === 'num' && Number.isInteger(n.b.v) && n.b.v >= 0 && n.b.v <= 8) return `cpowi(${a}, ${n.b.v})`
          return `cpow(${a}, ${b})`
        }
      }
      break
    }
    case 'call': {
      const a = toGLSL(n.a)
      const map: Record<string, string> = { exp: 'cexp', log: 'clog', ln: 'clog', sin: 'csin', cos: 'ccos', tan: 'ctan', sinh: 'csinh', cosh: 'ccosh', tanh: 'ctanh', sqrt: 'csqrt', conj: 'cconj', abs: 'cabs', re: 'cre', im: 'cim', arg: 'carg' }
      return `${map[n.fn]}(${a})`
    }
  }
  throw new Error('bad node')
}

// ---------- TeX (light-weight, for the readout) ----------

const prec = (n: Node) => (n.t === 'bin' ? (n.op === '+' || n.op === '-' ? 1 : n.op === '^' ? 3 : 2) : n.t === 'neg' ? 1.5 : 4)
function toTex(n: Node): string {
  const wrap = (m: Node, min: number) => (prec(m) < min ? `\\left(${toTex(m)}\\right)` : toTex(m))
  switch (n.t) {
    case 'num': return Number.isInteger(n.v) ? String(n.v) : String(+n.v.toPrecision(6))
    case 'var': return n.name === 'pi' ? '\\pi' : n.name
    case 'neg': return `-${wrap(n.a, 2)}`
    case 'bin':
      switch (n.op) {
        case '+': return `${toTex(n.a)} + ${toTex(n.b)}`
        case '-': return `${toTex(n.a)} - ${wrap(n.b, 2)}`
        case '*': return `${wrap(n.a, 2)}\\,${wrap(n.b, 2)}`
        case '/': return `\\frac{${toTex(n.a)}}{${toTex(n.b)}}`
        case '^': return `${wrap(n.a, 4)}^{${toTex(n.b)}}`
      }
      break
    case 'call': {
      const names: Record<string, string> = { exp: 'e^{#}', log: '\\operatorname{Log}#', ln: '\\operatorname{Log}#', sin: '\\sin#', cos: '\\cos#', tan: '\\tan#', sinh: '\\sinh#', cosh: '\\cosh#', tanh: '\\tanh#', sqrt: '\\sqrt{#}', conj: '\\overline{#}', abs: '\\left|#\\right|', re: '\\operatorname{Re}#', im: '\\operatorname{Im}#', arg: '\\arg#' }
      const inner = ['exp', 'sqrt', 'conj', 'abs'].includes(n.fn) ? toTex(n.a) : `\\left(${toTex(n.a)}\\right)`
      return names[n.fn].replace('#', inner)
    }
  }
  throw new Error('bad node')
}

// ---------- real polynomial equations (conics, quadrics, circles) ----------

/** "lhs = rhs" → lhs − rhs as a real-valued function of (x, y, z). */
function realFunction(src: string): (x: number, y: number, z: number) => number {
  const [lhs, rhs = '0'] = src.split('=')
  if (src.split('=').length > 2) throw new Error('too many =')
  const L = parse(lhs), R = parse(rhs)
  const bad = [...freeVars(L), ...freeVars(R)].filter((v) => !['x', 'y', 'z', 'e', 'pi'].includes(v))
  if (bad.length) throw new Error(`unknown variable ${bad[0]}`)
  return (x, y, z) => {
    const env = { x: Cx.C(x), y: Cx.C(y), z: Cx.C(z) }
    return evaluate(L, env).re - evaluate(R, env).re
  }
}

export interface QuadCoeffs {
  a11: number; a22: number; a33: number
  a12: number; a13: number; a23: number
  a10: number; a20: number; a30: number
  a00: number
}

/**
 * Extract the coefficients of a degree-≤2 polynomial equation in x, y, z (Vaisman's a_ij convention,
 * cross and linear terms carry the factor 2). Throws if the input is not quadratic.
 */
export function quadraticCoeffs(src: string): QuadCoeffs {
  const f = realFunction(src)
  const a00 = f(0, 0, 0)
  const sq = (fx: (t: number) => number) => ({ a: (fx(1) + fx(-1)) / 2 - a00, l: (fx(1) - fx(-1)) / 4 })
  const X = sq((t) => f(t, 0, 0)), Y = sq((t) => f(0, t, 0)), Z = sq((t) => f(0, 0, t))
  const cross = (v: number, aa: number, bb: number, la: number, lb: number) => (v - aa - bb - 2 * la - 2 * lb - a00) / 2
  const c: QuadCoeffs = {
    a11: X.a, a22: Y.a, a33: Z.a, a10: X.l, a20: Y.l, a30: Z.l, a00,
    a12: cross(f(1, 1, 0), X.a, Y.a, X.l, Y.l),
    a13: cross(f(1, 0, 1), X.a, Z.a, X.l, Z.l),
    a23: cross(f(0, 1, 1), Y.a, Z.a, Y.l, Z.l),
  }
  // verify it really is quadratic: compare with the model at a couple of generic points
  const model = (x: number, y: number, z: number) =>
    c.a11 * x * x + c.a22 * y * y + c.a33 * z * z + 2 * c.a12 * x * y + 2 * c.a13 * x * z + 2 * c.a23 * y * z + 2 * c.a10 * x + 2 * c.a20 * y + 2 * c.a30 * z + c.a00
  for (const [x, y, z] of [[2, -1.5, 0.7], [-0.3, 2.2, -1.1], [1.7, 0.4, 2.3]]) {
    const v = f(x, y, z)
    if (!Number.isFinite(v) || Math.abs(v - model(x, y, z)) > 1e-7 * (1 + Math.abs(v))) throw new Error('not a quadratic polynomial')
  }
  return c
}
