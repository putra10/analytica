/** Ring theory helpers, Herstein Ch. 4: Z_n, ideals, polynomial rings over Z_p and Q. */

export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
export const isPrime = (n: number) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d)
export const range = (n: number) => Array.from({ length: n }, (_, i) => i)
export const mod = (a: number, n: number) => ((a % n) + n) % n

// ---------- Z_n ----------

export interface ZnInfo {
  n: number
  units: number[]
  zeroDivisors: number[]
  nilpotents: number[]
  idempotents: number[]
  /** proper ideals dZ_n for d | n, 1 < d */
  ideals: { d: number; elems: number[]; maximal: boolean }[]
  isField: boolean
  characteristic: number
}

export function znInfo(n: number): ZnInfo {
  const units = range(n).filter((a) => gcd(a, n) === 1)
  const zeroDivisors = range(n).filter((a) => a !== 0 && range(n).some((b) => b !== 0 && (a * b) % n === 0))
  const nilpotents = range(n).filter((a) => { let x = a; for (let k = 0; k < n; k++) { if (x === 0) return true; x = (x * a) % n } return false })
  const idempotents = range(n).filter((a) => (a * a) % n === a)
  const ideals = range(n + 1).filter((d) => d > 1 && d <= n && n % d === 0).map((d) => ({ d, elems: range(n).filter((a) => a % d === 0), maximal: isPrime(d) }))
  return { n, units, zeroDivisors, nilpotents, idempotents, ideals, isField: isPrime(n), characteristic: n }
}

// ---------- rationals ----------

export interface Q { num: number; den: number }
export const q = (num: number, den = 1): Q => {
  if (den === 0) throw new Error('division by zero')
  const g = gcd(num, den) || 1
  const s = den < 0 ? -1 : 1
  return { num: (s * num) / g, den: (s * den) / g }
}
export const qAdd = (a: Q, b: Q) => q(a.num * b.den + b.num * a.den, a.den * b.den)
export const qSub = (a: Q, b: Q) => q(a.num * b.den - b.num * a.den, a.den * b.den)
export const qMul = (a: Q, b: Q) => q(a.num * b.num, a.den * b.den)
export const qDiv = (a: Q, b: Q) => q(a.num * b.den, a.den * b.num)
export const qZero = (a: Q) => a.num === 0
export const qTex = (a: Q) => (a.den === 1 ? String(a.num) : `${a.num < 0 ? '-' : ''}\\tfrac{${Math.abs(a.num)}}{${a.den}}`)

// ---------- polynomials ----------

/** Coefficient field: Z_p (p prime) or Q. */
export type Field = { kind: 'Zp'; p: number } | { kind: 'Q' }

/** Coefficients c[i] of x^i; over Z_p stored as numbers in [0,p), over Q as Q. Always trimmed. */
export type Poly = Q[]

const F = (f: Field) => ({
  zero: q(0),
  one: q(1),
  norm: (a: Q): Q => (f.kind === 'Zp' ? q(mod(a.num, f.p)) : a),
  add: (a: Q, b: Q): Q => (f.kind === 'Zp' ? q(mod(a.num + b.num, f.p)) : qAdd(a, b)),
  sub: (a: Q, b: Q): Q => (f.kind === 'Zp' ? q(mod(a.num - b.num, f.p)) : qSub(a, b)),
  mul: (a: Q, b: Q): Q => (f.kind === 'Zp' ? q(mod(a.num * b.num, f.p)) : qMul(a, b)),
  inv: (a: Q): Q => {
    if (f.kind === 'Q') return qDiv(q(1), a)
    for (let x = 1; x < f.p; x++) if (mod(a.num * x, f.p) === 1) return q(x)
    throw new Error('not invertible')
  },
})

export const trim = (p: Poly): Poly => { const r = [...p]; while (r.length && qZero(r[r.length - 1])) r.pop(); return r }
export const deg = (p: Poly) => p.length - 1 // −1 for the zero polynomial
export const isZeroPoly = (p: Poly) => p.length === 0

export function pAdd(f: Field, a: Poly, b: Poly): Poly {
  const k = F(f)
  return trim(range(Math.max(a.length, b.length)).map((i) => k.add(a[i] ?? k.zero, b[i] ?? k.zero)))
}
export function pSub(f: Field, a: Poly, b: Poly): Poly {
  const k = F(f)
  return trim(range(Math.max(a.length, b.length)).map((i) => k.sub(a[i] ?? k.zero, b[i] ?? k.zero)))
}
export function pMul(f: Field, a: Poly, b: Poly): Poly {
  const k = F(f)
  if (!a.length || !b.length) return []
  const out: Q[] = range(a.length + b.length - 1).map(() => k.zero)
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = k.add(out[i + j], k.mul(x, y)) }))
  return trim(out)
}
export const pScale = (f: Field, a: Poly, c: Q): Poly => trim(a.map((x) => F(f).mul(x, c)))

/** Division algorithm (Herstein Lemma 4.5.?): a = q·b + r with deg r < deg b. */
export function pDivMod(f: Field, a: Poly, b: Poly): { q: Poly; r: Poly } {
  const k = F(f)
  if (!b.length) throw new Error('division by zero polynomial')
  let r = [...a]
  const qo: Q[] = range(Math.max(a.length - b.length + 1, 0)).map(() => k.zero)
  const lbInv = k.inv(b[b.length - 1])
  while (r.length >= b.length && r.length) {
    const c = k.mul(r[r.length - 1], lbInv)
    const s = r.length - b.length
    qo[s] = c
    b.forEach((y, j) => { r[s + j] = k.sub(r[s + j], k.mul(c, y)) })
    r = trim(r)
  }
  return { q: trim(qo), r }
}

export function pGcd(f: Field, a: Poly, b: Poly): Poly {
  let x = trim(a), y = trim(b)
  while (y.length) { const { r } = pDivMod(f, x, y); x = y; y = r }
  if (!x.length) return x
  return pScale(f, x, F(f).inv(x[x.length - 1])) // monic
}

export const pEval = (f: Field, a: Poly, x: Q): Q => a.reduceRight((acc, c) => F(f).add(F(f).mul(acc, x), c), F(f).zero)

/** Roots in Z_p by exhaustive search. */
export const zpRoots = (p: number, a: Poly) => range(p).filter((x) => qZero(pEval({ kind: 'Zp', p }, a, q(x))))

/** All monic polynomials of degree d over Z_p. */
function monics(p: number, d: number): Poly[] {
  const out: Poly[] = []
  const rec = (coeffs: number[]) => {
    if (coeffs.length === d) { out.push([...coeffs.map((c) => q(c)), q(1)]); return }
    for (let c = 0; c < p; c++) rec([...coeffs, c])
  }
  rec([])
  return out
}

export interface Irreducibility {
  irreducible: boolean | null
  /** explanation key + detail */
  reason: string
  detail?: string
  factor?: Poly
}

/** Irreducibility over Z_p: search for a monic factor of degree ≤ deg/2. */
export function zpIrreducible(p: number, a: Poly): Irreducibility {
  const d = deg(a)
  if (d < 1) return { irreducible: null, reason: 'degree' }
  if (d === 1) return { irreducible: true, reason: 'linear' }
  const roots = zpRoots(p, a)
  if (roots.length) return { irreducible: false, reason: 'root', detail: String(roots[0]), factor: [q(mod(-roots[0], p)), q(1)] }
  if (d <= 3) return { irreducible: true, reason: 'no-root' }
  const f: Field = { kind: 'Zp', p }
  for (let k = 2; k <= d / 2; k++) for (const g of monics(p, k)) if (!pDivMod(f, a, g).r.length) return { irreducible: false, reason: 'factor', factor: g }
  return { irreducible: true, reason: 'no-factor' }
}

/** Irreducibility over Q via rational roots, Eisenstein, and reduction mod p (Herstein 4.6). */
export function qIrreducible(a: Poly): Irreducibility {
  const d = deg(a)
  if (d < 1) return { irreducible: null, reason: 'degree' }
  if (d === 1) return { irreducible: true, reason: 'linear' }
  // clear denominators → integer coefficients
  const L = a.reduce((l, c) => (l * c.den) / gcd(l, c.den), 1)
  const ints = a.map((c) => (c.num * L) / c.den)
  const g = ints.reduce((x, y) => gcd(x, y), 0) || 1
  const prim = ints.map((c) => c / g)
  // rational root test
  const divisors = (n: number) => { n = Math.abs(n); const out: number[] = []; for (let k = 1; k <= n; k++) if (n % k === 0) out.push(k); return out }
  const a0 = prim[0], an = prim[d]
  if (a0 === 0) return { irreducible: false, reason: 'root', detail: '0', factor: [q(0), q(1)] }
  for (const r of divisors(a0)) for (const s of divisors(an)) for (const sg of [1, -1]) {
    const x = q(sg * r, s)
    if (qZero(pEval({ kind: 'Q' }, a, x))) return { irreducible: false, reason: 'root', detail: qTex(x), factor: [q(-x.num, x.den), q(1)] }
  }
  if (d <= 3) return { irreducible: true, reason: 'no-root' }
  // Eisenstein
  for (const p of range(60).filter(isPrime)) {
    if (an % p === 0) continue
    if (prim.slice(0, d).every((c) => c % p === 0) && a0 % (p * p) !== 0) return { irreducible: true, reason: 'eisenstein', detail: String(p) }
  }
  // mod p reduction
  for (const p of [2, 3, 5, 7, 11, 13]) {
    if (an % p === 0) continue
    const red = zpIrreducible(p, trim(prim.map((c) => q(mod(c, p)))))
    if (red.irreducible) return { irreducible: true, reason: 'mod-p', detail: String(p) }
  }
  return { irreducible: null, reason: 'undetermined' }
}

// ---------- parsing / printing ----------

/** Parse "x^3 + 2x - 1", "2x2+x", "1/2 x^2 - 3" etc. Returns null when malformed. */
export function parsePoly(text: string, f: Field): Poly | null {
  const s = text.replace(/\s+/g, '').replace(/−/g, '-').replace(/\*/g, '')
  if (!s) return null
  const terms = s.match(/[+-]?[^+-]+/g)
  if (!terms) return null
  const coeffs: Q[] = []
  for (const term of terms) {
    const m = term.match(/^([+-]?)(\d+(?:\/\d+)?)?(x(?:\^?(\d+))?)?$/)
    if (!m || (!m[2] && !m[3])) return null
    const sign = m[1] === '-' ? -1 : 1
    let c: Q = q(1)
    if (m[2]) { const [n, dn] = m[2].split('/').map(Number); if (dn === 0) return null; c = q(n, dn ?? 1) }
    c = q(sign * c.num, c.den)
    const e = m[3] ? (m[4] ? +m[4] : 1) : 0
    while (coeffs.length <= e) coeffs.push(q(0))
    coeffs[e] = f.kind === 'Zp' ? q(mod(coeffs[e].num + c.num, f.p)) : qAdd(coeffs[e], c)
  }
  if (f.kind === 'Zp' && coeffs.some((c) => c.den !== 1)) return null
  return trim(coeffs)
}

export function polyTex(p: Poly, v = 'x'): string {
  if (!p.length) return '0'
  const parts: string[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]
    if (qZero(c)) continue
    const neg = c.num < 0
    const ab = q(Math.abs(c.num), c.den)
    const coef = i > 0 && ab.num === 1 && ab.den === 1 ? '' : qTex(ab)
    const mono = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`
    parts.push(`${parts.length ? (neg ? ' - ' : ' + ') : neg ? '-' : ''}${coef}${mono}`)
  }
  return parts.join('')
}
