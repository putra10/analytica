/**
 * Finite commutative rings with 1 given by their tables (Herstein Ch. 4): Z_n, products and
 * F_p[x]/(f). Used by the isomorphism checker to decide R ≅ S and to show an explicit map.
 */
import { deg, isPrime, mod, pDivMod, pMul, parsePoly, q, range, trim, type Field, type Poly } from './rings'

export interface FRing {
  name: string
  tex: string
  labels: string[]
  add: number[][]
  mul: number[][]
  zero: number
  one: number
}

const sub = (n: number) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d])
const sup = (n: number) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])

export function ringZn(n: number): FRing {
  return {
    name: `Z${sub(n)}`, tex: `\\mathbb{Z}_{${n}}`, labels: range(n).map(String),
    add: range(n).map((a) => range(n).map((b) => (a + b) % n)),
    mul: range(n).map((a) => range(n).map((b) => (a * b) % n)),
    zero: 0, one: n === 1 ? 0 : 1,
  }
}

export function ringProduct(r: FRing, s: FRing): FRing {
  const m = r.labels.length, n = s.labels.length
  const idx = (a: number, b: number) => a * n + b
  return {
    name: `${r.name}×${s.name}`, tex: `${r.tex}\\times ${s.tex}`,
    labels: range(m * n).map((i) => `(${r.labels[Math.floor(i / n)]},${s.labels[i % n]})`),
    add: range(m * n).map((i) => range(m * n).map((j) => idx(r.add[Math.floor(i / n)][Math.floor(j / n)], s.add[i % n][j % n]))),
    mul: range(m * n).map((i) => range(m * n).map((j) => idx(r.mul[Math.floor(i / n)][Math.floor(j / n)], s.mul[i % n][j % n]))),
    zero: idx(r.zero, s.zero), one: idx(r.one, s.one),
  }
}

/** Plain-text polynomial with superscripts, e.g. "x²+2x+1" (no spaces, for small pictures). */
export function polyText(p: Poly, v = 'x'): string {
  if (!p.length) return '0'
  const parts: string[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]
    if (c.num === 0) continue
    const neg = c.num < 0, a = Math.abs(c.num), coef = c.den !== 1 ? `${a}/${c.den}` : i > 0 && a === 1 ? '' : String(a)
    const mono = i === 0 ? '' : i === 1 ? v : `${v}${sup(i)}`
    parts.push(`${parts.length ? (neg ? '−' : '+') : neg ? '−' : ''}${coef}${mono}`)
  }
  return parts.join('')
}

/** Polynomials of degree < d over Z_p, indexed like base-p numbers (constant term is the lowest digit). */
export function residues(p: number, d: number): Poly[] {
  return range(p ** d).map((k) => trim(range(d).map((i) => q(Math.floor(k / p ** i) % p))))
}
export const residueIndex = (p: number, r: Poly) => r.reduce((acc, c, i) => acc + c.num * p ** i, 0)

/** Z_p[x]/(f): residues of degree < deg f with multiplication reduced mod f. */
export function ringPolyQuotient(p: number, f: Poly): FRing {
  const F: Field = { kind: 'Zp', p }, d = deg(f), res = residues(p, d)
  const add = res.map((a) => res.map((b) => residueIndex(p, trim(range(d).map((i) => q(mod((a[i]?.num ?? 0) + (b[i]?.num ?? 0), p)))))))
  const mul = res.map((a) => res.map((b) => residueIndex(p, pDivMod(F, pMul(F, a, b), f).r)))
  return { name: `Z${sub(p)}[x]/(${polyText(f)})`, tex: `\\mathbb{Z}_{${p}}[x]/(${polyText(f).replace(/([⁰-⁹]+)/g, (m) => `^{${[...m].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`).replace(/−/g, '-')})`, labels: res.map((r) => polyText(r)), add, mul, zero: 0, one: d === 0 ? 0 : 1 }
}

/** Parse "Z6", "Z_6", "Z2xZ3", "Z2[x]/(x^2+x+1)", "F2[x]/(x^2+x+1)" and products of these. */
export function parseRing(text: string, maxOrder = 64): FRing {
  const s = text.trim().replace(/[₀-₉]/g, (d) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(d))).replace(/\s+/g, '').replace(/[²³⁴⁵]/g, (c) => `^${'  ²³⁴⁵'.indexOf(c)}`)
  if (!s) throw new Error('empty')
  // split on × or on an "x" that sits between two factors (not inside [x] or a polynomial)
  const factors: string[] = []
  let depth = 0, cur = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(' || c === '[') depth++
    if (c === ')' || c === ']') depth--
    if (depth === 0 && (c === '×' || c === '*' || ((c === 'x' || c === 'X') && /[ZF]/i.test(s[i + 1] ?? '')))) { factors.push(cur); cur = ''; continue }
    cur += c
  }
  factors.push(cur)
  const rings = factors.map((f) => {
    const zn = f.match(/^[ZF]_?(\d+)$/i)
    if (zn) { const n = +zn[1]; if (n < 1 || n > maxOrder) throw new Error('out of range'); return ringZn(n) }
    const pq = f.match(/^[ZF]_?(\d+)\[x\]\/\((.+)\)$/i)
    if (!pq) throw new Error('not recognised')
    const p = +pq[1]
    if (!isPrime(p)) throw new Error('p must be prime')
    const poly = parsePoly(pq[2], { kind: 'Zp', p })
    if (!poly || deg(poly) < 1) throw new Error('bad polynomial')
    if (p ** deg(poly) > maxOrder) throw new Error('too large')
    return ringPolyQuotient(p, poly)
  })
  if (rings.reduce((n, r) => n * r.labels.length, 1) > maxOrder) throw new Error('too large')
  return rings.reduce((a, b) => ringProduct(a, b))
}

// ---------- invariants ----------

/** Additive order of a. */
export const addOrder = (r: FRing, a: number) => { let x = a, k = 1; while (x !== r.zero) { x = r.add[x][a]; k++ } return k }

export function ringInvariants(r: FRing) {
  const n = r.labels.length, all = range(n), nz = all.filter((a) => a !== r.zero)
  const units = all.filter((a) => all.some((b) => r.mul[a][b] === r.one && r.one !== r.zero))
  const zeroDivisors = nz.filter((a) => nz.some((b) => r.mul[a][b] === r.zero))
  const nilpotents = all.filter((a) => { let x = a; for (let k = 0; k <= n; k++) { if (x === r.zero) return true; x = r.mul[x][a] } return false })
  const idempotents = all.filter((a) => r.mul[a][a] === a)
  const char = addOrder(r, r.one)
  return { order: n, char, units, zeroDivisors, nilpotents, idempotents, field: n > 1 && units.length === n - 1 }
}

export type RingIsoReason = 'order' | 'char' | 'units' | 'field' | 'zeroDivisors' | 'nilpotents' | 'idempotents' | 'search'
export interface RingIsoResult { isomorphic: boolean; reason?: RingIsoReason; map?: number[]; gens: number[]; tried: number }

/** Smallest set of elements that, together with 1, generates R under + and ·. */
export function ringGenerators(r: FRing): number[] {
  const gens: number[] = []
  let span = closure(r, [r.one])
  for (let a = 0; a < r.labels.length && span.size < r.labels.length; a++) {
    if (span.has(a)) continue
    gens.push(a)
    span = closure(r, [r.one, ...gens])
  }
  return gens
}
function closure(r: FRing, start: number[]): Set<number> {
  const set = new Set([r.zero, ...start])
  let grew = true
  while (grew) {
    grew = false
    for (const a of [...set]) for (const b of [...set]) for (const c of [r.add[a][b], r.mul[a][b]]) if (!set.has(c)) { set.add(c); grew = true }
  }
  return set
}

/** Extend 1 ↦ 1, gens ↦ imgs to a ring homomorphism; null when inconsistent. */
function extendRingHom(r: FRing, s: FRing, gens: number[], imgs: number[]): number[] | null {
  const n = r.labels.length, map = new Array<number>(n).fill(-1)
  const set = (a: number, y: number) => { if (map[a] === -1) { map[a] = y; return true } return map[a] === y }
  if (!set(r.zero, s.zero) || !set(r.one, s.one)) return null
  for (let i = 0; i < gens.length; i++) if (!set(gens[i], imgs[i])) return null
  let grew = true
  while (grew) {
    grew = false
    const known = range(n).filter((a) => map[a] !== -1)
    for (const a of known) for (const b of known) {
      for (const [x, y] of [[r.add[a][b], s.add[map[a]][map[b]]], [r.mul[a][b], s.mul[map[a]][map[b]]]]) {
        if (map[x] === -1) { map[x] = y; grew = true } else if (map[x] !== y) return null
      }
    }
  }
  return map.includes(-1) ? null : map
}

/**
 * Decide R ≅ S: compare invariants (order, characteristic, units, field or not, zero divisors,
 * nilpotents, idempotents), then search images of ring generators. A ring isomorphism of rings
 * with 1 sends 1 to 1, so Z_n-like rings (generated by 1) need no search at all.
 */
export function ringIsomorphism(r: FRing, s: FRing): RingIsoResult {
  const a = ringInvariants(r), b = ringInvariants(s), gens = ringGenerators(r)
  const fail = (reason: RingIsoReason): RingIsoResult => ({ isomorphic: false, reason, gens, tried: 0 })
  if (a.order !== b.order) return fail('order')
  if (a.char !== b.char) return fail('char')
  if (a.units.length !== b.units.length) return fail('units')
  if (a.field !== b.field) return fail('field')
  if (a.zeroDivisors.length !== b.zeroDivisors.length) return fail('zeroDivisors')
  if (a.nilpotents.length !== b.nilpotents.length) return fail('nilpotents')
  if (a.idempotents.length !== b.idempotents.length) return fail('idempotents')
  const sig = (t: FRing, inv: typeof a, x: number) => [addOrder(t, x), inv.units.includes(x), inv.zeroDivisors.includes(x), inv.nilpotents.includes(x), inv.idempotents.includes(x)].join()
  const cands = gens.map((g) => range(s.labels.length).filter((y) => sig(s, b, y) === sig(r, a, g)))
  let tried = 0
  const rec = (i: number, imgs: number[]): number[] | null => {
    if (i === gens.length) {
      tried++
      const map = extendRingHom(r, s, gens, imgs)
      if (!map || new Set(map).size !== map.length) return null
      for (let x = 0; x < map.length; x++) for (let y = 0; y < map.length; y++) if (map[r.add[x][y]] !== s.add[map[x]][map[y]] || map[r.mul[x][y]] !== s.mul[map[x]][map[y]]) return null
      return map
    }
    for (const y of cands[i]) { const m = rec(i + 1, [...imgs, y]); if (m) return m }
    return null
  }
  const map = rec(0, [])
  return map ? { isomorphic: true, map, gens, tried } : { isomorphic: false, reason: 'search', gens, tried }
}
