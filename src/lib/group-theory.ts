import { allPerms, compose as permCompose, cycleTex, isEven, parsePerm, type Perm } from './permutations'

/** Finite group given by its multiplication table (Herstein Ch. 2). Elements are indices 0..order-1. */
export interface Group {
  id: string
  name: string
  tex: string
  order: number
  labels: string[]
  table: number[][]
  e: number
  description: { id: string; en: string }
}

export const mul = (g: Group, a: number, b: number) => g.table[a][b]
export const inverse = (g: Group, a: number) => g.table[a].indexOf(g.e)
export function elementOrder(g: Group, a: number): number {
  let x = a, n = 1
  while (x !== g.e) { x = mul(g, x, a); n++ }
  return n
}
export const isAbelian = (g: Group) => g.table.every((row, a) => row.every((x, b) => x === g.table[b][a]))
export const center = (g: Group) => range(g.order).filter((z) => range(g.order).every((x) => mul(g, z, x) === mul(g, x, z)))
export const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Closure of a set of generators. */
export function generate(g: Group, gens: number[]): number[] {
  const set = new Set<number>([g.e, ...gens])
  let grew = true
  while (grew) {
    grew = false
    for (const a of [...set]) for (const b of [...set]) {
      const c = mul(g, a, b)
      if (!set.has(c)) { set.add(c); grew = true }
    }
  }
  return [...set].sort((a, b) => a - b)
}

export const isCyclic = (g: Group) => range(g.order).some((a) => elementOrder(g, a) === g.order)
export const generators = (g: Group) => range(g.order).filter((a) => elementOrder(g, a) === g.order)

/**
 * All subgroups, as sorted element lists (ascending by order).
 * ponytail: enumerates closures of ≤ 2 generators; every group offered here has all subgroups 2-generated.
 */
export function subgroups(g: Group): number[][] {
  const seen = new Map<string, number[]>()
  const add = (h: number[]) => seen.set(h.join(','), h)
  add([g.e])
  for (let a = 0; a < g.order; a++) {
    add(generate(g, [a]))
    for (let b = a + 1; b < g.order; b++) add(generate(g, [a, b]))
  }
  return [...seen.values()].sort((x, y) => x.length - y.length || x.join(',').localeCompare(y.join(',')))
}

export const leftCoset = (g: Group, a: number, H: number[]) => H.map((h) => mul(g, a, h)).sort((x, y) => x - y)
export const rightCoset = (g: Group, a: number, H: number[]) => H.map((h) => mul(g, h, a)).sort((x, y) => x - y)

/** Distinct cosets with a representative each (smallest element). */
export function cosets(g: Group, H: number[], side: 'left' | 'right'): { rep: number; elems: number[] }[] {
  const out: { rep: number; elems: number[] }[] = []
  const covered = new Set<number>()
  for (let a = 0; a < g.order; a++) {
    if (covered.has(a)) continue
    const c = side === 'left' ? leftCoset(g, a, H) : rightCoset(g, a, H)
    c.forEach((x) => covered.add(x))
    out.push({ rep: a, elems: c })
  }
  return out
}

export const isNormal = (g: Group, H: number[]) =>
  range(g.order).every((a) => leftCoset(g, a, H).join(',') === rightCoset(g, a, H).join(','))

/** Factor group G/N as a Group whose elements are the cosets (Herstein 2.6). */
export function quotient(g: Group, N: number[]): Group {
  const cs = cosets(g, N, 'left')
  const idx = new Map<string, number>()
  cs.forEach((c, i) => idx.set(c.elems.join(','), i))
  const table = cs.map((a) => cs.map((b) => idx.get(leftCoset(g, mul(g, a.rep, b.rep), N).join(','))!))
  return {
    id: `${g.id}/N`, name: `${g.name}/N`, tex: `${g.tex}/N`, order: cs.length,
    labels: cs.map((c) => `${g.labels[c.rep]}N`), table, e: idx.get(leftCoset(g, g.e, N).join(','))!,
    description: { id: 'grup faktor', en: 'factor group' },
  }
}

/** A generating set of size ≤ 2 (or the whole element list if none). */
export function smallGeneratingSet(g: Group): number[] {
  for (let a = 0; a < g.order; a++) if (generate(g, [a]).length === g.order) return [a]
  for (let a = 0; a < g.order; a++) for (let b = a + 1; b < g.order; b++) if (generate(g, [a, b]).length === g.order) return [a, b]
  return range(g.order)
}

/** Multiset of element orders, e.g. {1:1, 2:3, 3:2}. */
export const orderProfile = (g: Group) => {
  const m = new Map<number, number>()
  for (let a = 0; a < g.order; a++) { const o = elementOrder(g, a); m.set(o, (m.get(o) ?? 0) + 1) }
  return [...m.entries()].sort((x, y) => x[0] - y[0])
}

export interface IsoResult {
  isomorphic: boolean
  /** reason when not isomorphic */
  reason?: 'order' | 'abelian' | 'profile' | 'search'
  /** map G → H when found */
  map?: number[]
}

/** Extend a partial homomorphism from generator images; returns null on inconsistency. */
function extendHom(g: Group, h: Group, gens: number[], imgs: number[]): number[] | null {
  const map = new Array<number>(g.order).fill(-1)
  map[g.e] = h.e
  gens.forEach((x, i) => { map[x] = imgs[i] })
  const queue = [g.e, ...gens]
  while (queue.length) {
    const x = queue.shift()!
    for (let i = 0; i < gens.length; i++) {
      const y = mul(g, x, gens[i])
      const fy = mul(h, map[x], imgs[i])
      if (map[y] === -1) { map[y] = fy; queue.push(y) }
      else if (map[y] !== fy) return null
    }
  }
  if (map.includes(-1)) return null
  for (let a = 0; a < g.order; a++) for (let b = 0; b < g.order; b++) if (map[mul(g, a, b)] !== mul(h, map[a], map[b])) return null
  return map
}

/** Decide G ≅ H (Herstein 2.5): invariants first, then a search over generator images. */
export function isomorphism(g: Group, h: Group): IsoResult {
  if (g.order !== h.order) return { isomorphic: false, reason: 'order' }
  if (isAbelian(g) !== isAbelian(h)) return { isomorphic: false, reason: 'abelian' }
  const pg = orderProfile(g), ph = orderProfile(h)
  if (pg.length !== ph.length || pg.some(([o, c], i) => ph[i][0] !== o || ph[i][1] !== c)) return { isomorphic: false, reason: 'profile' }
  const gens = smallGeneratingSet(g)
  const ords = gens.map((x) => elementOrder(g, x))
  const candidates = gens.map((_, i) => range(h.order).filter((y) => elementOrder(h, y) === ords[i]))
  const rec = (i: number, imgs: number[]): number[] | null => {
    if (i === gens.length) {
      const map = extendHom(g, h, gens, imgs)
      return map && new Set(map).size === g.order ? map : null
    }
    for (const y of candidates[i]) { const r = rec(i + 1, [...imgs, y]); if (r) return r }
    return null
  }
  const map = rec(0, [])
  return map ? { isomorphic: true, map } : { isomorphic: false, reason: 'search' }
}

/** Homomorphism from a cyclic group (a) determined by φ(a) = h; valid iff ord(h) | ord(a). */
export function cyclicHom(g: Group, a: number, h: Group, img: number): { map: number[]; kernel: number[]; image: number[] } | null {
  const n = elementOrder(g, a)
  if (n % elementOrder(h, img) !== 0 || n !== g.order) return null
  const map = new Array<number>(g.order)
  let x = g.e, y = h.e
  for (let k = 0; k < n; k++) { map[x] = y; x = mul(g, x, a); y = mul(h, y, img) }
  const kernel = range(g.order).filter((z) => map[z] === h.e).sort((p, q) => p - q)
  const image = [...new Set(map)].sort((p, q) => p - q)
  return { map, kernel, image }
}

// ---------- constructions ----------

const build = (id: string, name: string, tex: string, labels: string[], table: number[][], description: Group['description']): Group => ({
  id, name, tex, order: labels.length, labels, table, e: 0, description,
})
const sub = (n: number) => String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d])
const sup = (n: number) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])

export function cyclic(n: number): Group {
  return build(`Z${n}`, `Z${sub(n)}`, `\\mathbb{Z}_{${n}}`, range(n).map(String), range(n).map((a) => range(n).map((b) => (a + b) % n)),
    { id: `Bilangan bulat modulo ${n} terhadap penjumlahan: grup siklik berorde ${n}, dibangun oleh 1.`, en: `Integers modulo ${n} under addition: the cyclic group of order ${n}, generated by 1.` })
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
export function units(n: number): Group {
  const U = range(n).filter((a) => a > 0 && gcd(a, n) === 1)
  return build(`U${n}`, `U${sub(n)}`, `U_{${n}}`, U.map(String), U.map((a) => U.map((b) => U.indexOf((a * b) % n))),
    { id: `Kelas residu yang relatif prima terhadap ${n}, terhadap perkalian modulo ${n}. Ordenya φ(${n}) = ${U.length}.`, en: `Residue classes coprime to ${n} under multiplication mod ${n}. Its order is φ(${n}) = ${U.length}.` })
}

/** Dihedral group of order 2n: r^k s^e with s r = r^{-1} s. */
export function dihedral(n: number): Group {
  const idx = (k: number, e: number) => ((k % n) + n) % n + n * e
  const labels = range(2 * n).map((i) => { const k = i % n, e = i >= n ? 1 : 0; return `${k === 0 ? '' : k === 1 ? 'r' : `r${sup(k)}`}${e ? 's' : ''}` || 'e' })
  const table = range(2 * n).map((i) => range(2 * n).map((j) => {
    const a = i % n, b = i >= n ? 1 : 0, c = j % n, d = j >= n ? 1 : 0
    return idx(a + (b ? -c : c), (b + d) % 2)
  }))
  return build(`D${n}`, `D${sub(n)}`, `D_{${n}}`, labels, table,
    { id: `Grup simetri segi-${n} beraturan, berorde ${2 * n}: rotasi r (orde ${n}) dan pencerminan s dengan sr = r⁻¹s. Tak-abelian.`, en: `Symmetries of the regular ${n}-gon, order ${2 * n}: a rotation r (order ${n}) and a reflection s with sr = r⁻¹s. Non-abelian.` })
}

function permGroup(id: string, name: string, tex: string, perms: Perm[], description: Group['description']): Group {
  const keys = perms.map((p) => p.join(','))
  const eIdx = keys.indexOf(perms[0].map((_, i) => i).join(','))
  const ordered = [perms[eIdx], ...perms.filter((_, i) => i !== eIdx)]
  const k2 = ordered.map((p) => p.join(','))
  const table = ordered.map((s) => ordered.map((t) => k2.indexOf(permCompose(s, t).join(','))))
  return build(id, name, tex, ordered.map((p) => cycleTex(p).replace(/\\;/g, ' ')), table, description)
}

export const symmetric = (n: number) => permGroup(`S${n}`, `S${sub(n)}`, `S_{${n}}`, allPerms(n),
  { id: `Semua permutasi dari {1,…,${n}}, berorde ${n}! Hasil kali στ berarti "τ dahulu, lalu σ" (Herstein).`, en: `All permutations of {1,…,${n}}, order ${n}!. The product στ means "first τ, then σ" (Herstein).` })
export const alternating = (n: number) => permGroup(`A${n}`, `A${sub(n)}`, `A_{${n}}`, allPerms(n).filter(isEven),
  { id: `Permutasi genap dari S${sub(n)}: subgrup normal berindeks 2.`, en: `Even permutations of S${sub(n)}: a normal subgroup of index 2.` })

export function quaternion(): Group {
  // elements: ±1, ±i, ±j, ±k  as (unit 0..3, sign 0/1)
  const labels = ['1', '−1', 'i', '−i', 'j', '−j', 'k', '−k']
  const M = [[0, 1, 2, 3], [1, 0, 3, 2], [2, 3, 0, 1], [3, 2, 1, 0]] // |unit product|
  const S = [[1, 1, 1, 1], [1, -1, 1, -1], [1, -1, -1, 1], [1, 1, -1, -1]] // sign of unit product (row·col)
  const table = range(8).map((a) => range(8).map((b) => {
    const ua = a >> 1, sa = a & 1 ? -1 : 1, ub = b >> 1, sb = b & 1 ? -1 : 1
    const u = M[ua][ub], s = sa * sb * S[ua][ub]
    return u * 2 + (s < 0 ? 1 : 0)
  }))
  return build('Q8', 'Q₈', 'Q_8', labels, table,
    { id: 'Grup kuaternion berorde 8: i² = j² = k² = ijk = −1. Tak-abelian, tetapi setiap subgrupnya normal.', en: 'The quaternion group of order 8: i² = j² = k² = ijk = −1. Non-abelian, yet every subgroup is normal.' })
}

export function product(m: number, n: number): Group {
  const labels = range(m * n).map((i) => `(${Math.floor(i / n)},${i % n})`)
  const table = range(m * n).map((i) => range(m * n).map((j) => {
    const a = Math.floor(i / n), b = i % n, c = Math.floor(j / n), d = j % n
    return ((a + c) % m) * n + ((b + d) % n)
  }))
  return build(`Z${m}xZ${n}`, `Z${sub(m)}×Z${sub(n)}`, `\\mathbb{Z}_{${m}}\\times\\mathbb{Z}_{${n}}`, labels, table,
    { id: `Hasil kali langsung: operasi komponen demi komponen. Siklik iff gcd(${m},${n}) = 1.`, en: `Direct product with componentwise operation. Cyclic iff gcd(${m},${n}) = 1.` })
}

/**
 * Subgroup of S_n generated by user-typed permutations in cycle notation, e.g. "(1 2 3 4), (1 3)".
 * n is the largest symbol mentioned. Throws on bad input or when the closure exceeds `max` elements.
 */
export function permutationGroupFrom(text: string, max = 120): Group {
  const parts = text.split(/[,;]/).map((x) => x.trim()).filter(Boolean)
  if (!parts.length) throw new Error('no generators')
  const n = Math.max(1, ...parts.flatMap((x) => (x.match(/\d+/g) ?? []).map(Number)))
  const gens = parts.map((x) => { const p = parsePerm(x, n); if (!p) throw new Error(`bad permutation: ${x}`); return p })
  const seen = new Map<string, Perm>()
  const e = gens[0].map((_, i) => i)
  seen.set(e.join(','), e)
  const queue = [e]
  while (queue.length) {
    const x = queue.shift()!
    for (const g of gens) {
      const y = permCompose(g, x)
      const k = y.join(',')
      if (!seen.has(k)) { if (seen.size >= max) throw new Error(`group larger than ${max}`); seen.set(k, y); queue.push(y) }
    }
  }
  const perms = [...seen.values()]
  return permGroup('custom', `⟨${parts.join(', ')}⟩`, `\langle ${parts.map((x) => x.replace(/ /g, '\,')).join(',\ ')} \rangle`, perms,
    { id: `Subgrup S${sub(n)} yang dibangun oleh permutasi yang Anda ketik (tertutup terhadap hasil kali). Orde ${perms.length}.`, en: `The subgroup of S${sub(n)} generated by your permutations (closed under products). Order ${perms.length}.` })
}

export const GROUP_CATALOG: { id: string; make: () => Group }[] = [
  { id: 'Z4', make: () => cyclic(4) },
  { id: 'Z5', make: () => cyclic(5) },
  { id: 'Z6', make: () => cyclic(6) },
  { id: 'Z8', make: () => cyclic(8) },
  { id: 'Z12', make: () => cyclic(12) },
  { id: 'Z2xZ2', make: () => product(2, 2) },
  { id: 'Z2xZ3', make: () => product(2, 3) },
  { id: 'Z2xZ4', make: () => product(2, 4) },
  { id: 'U8', make: () => units(8) },
  { id: 'U10', make: () => units(10) },
  { id: 'U12', make: () => units(12) },
  { id: 'U15', make: () => units(15) },
  { id: 'S3', make: () => symmetric(3) },
  { id: 'S4', make: () => symmetric(4) },
  { id: 'A4', make: () => alternating(4) },
  { id: 'D3', make: () => dihedral(3) },
  { id: 'D4', make: () => dihedral(4) },
  { id: 'D6', make: () => dihedral(6) },
  { id: 'Q8', make: () => quaternion() },
]
