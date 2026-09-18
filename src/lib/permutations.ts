/**
 * Permutations of {1, …, n}, Herstein Ch. 3.
 * Stored 0-based: p[i] = σ(i+1) − 1.  Products are right-to-left: (στ)(s) = σ(τ(s)).
 */
export type Perm = number[]

export const identity = (n: number): Perm => Array.from({ length: n }, (_, i) => i)
export const compose = (s: Perm, t: Perm): Perm => t.map((x) => s[x])
export const inverse = (s: Perm): Perm => { const r = new Array(s.length); s.forEach((x, i) => { r[x] = i }); return r }
export const equal = (a: Perm, b: Perm) => a.length === b.length && a.every((x, i) => x === b[i])
export const key = (p: Perm) => p.join(',')

/** Disjoint cycles, each of length ≥ 2, 1-based, starting from the smallest element. */
export function cycles(p: Perm): number[][] {
  const seen = new Array(p.length).fill(false)
  const out: number[][] = []
  for (let i = 0; i < p.length; i++) {
    if (seen[i] || p[i] === i) { seen[i] = true; continue }
    const c: number[] = []
    let j = i
    while (!seen[j]) { seen[j] = true; c.push(j + 1); j = p[j] }
    out.push(c)
  }
  return out
}

export const order = (p: Perm) => cycles(p).reduce((l, c) => lcm(l, c.length), 1)
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

/** Parity: a k-cycle is a product of k − 1 transpositions. */
export const isEven = (p: Perm) => cycles(p).reduce((s, c) => s + c.length - 1, 0) % 2 === 0
export const sign = (p: Perm) => (isEven(p) ? 1 : -1)

/** (a1 a2 … ak) = (a1 ak)(a1 ak−1)…(a1 a2), Herstein Lemma 3.2.? */
export const transpositions = (p: Perm): [number, number][] =>
  cycles(p).flatMap((c) => c.slice(1).reverse().map((x) => [c[0], x] as [number, number]))

export const cycleTex = (p: Perm) => {
  const cs = cycles(p)
  return cs.length ? cs.map((c) => `(${c.join('\\;')})`).join('') : 'e'
}
export const twoRowTex = (p: Perm) =>
  `\\begin{pmatrix} ${p.map((_, i) => i + 1).join(' & ')} \\\\ ${p.map((x) => x + 1).join(' & ')} \\end{pmatrix}`

/**
 * Parse "2 3 1" (one-line), "(1 2 3)(4 5)" (cycles), or "e". Cycles compose right-to-left.
 * Returns null when malformed or out of range.
 */
export function parsePerm(text: string, n: number): Perm | null {
  const s = text.trim()
  if (s === '' || s === 'e' || s === '()') return identity(n)
  if (s.includes('(')) {
    const groups = [...s.matchAll(/\(([^()]*)\)/g)].map((m) => m[1].trim().split(/[\s,]+/).filter(Boolean).map(Number))
    if (!groups.length || groups.some((g) => g.some((x) => !Number.isInteger(x) || x < 1 || x > n) || new Set(g).size !== g.length)) return null
    let p = identity(n)
    // rightmost cycle acts first
    for (let k = groups.length - 1; k >= 0; k--) {
      const c = groups[k]
      const q = identity(n)
      c.forEach((x, i) => { q[x - 1] = c[(i + 1) % c.length] - 1 })
      p = compose(q, p)
    }
    return p
  }
  const nums = s.split(/[\s,]+/).filter(Boolean).map(Number)
  if (nums.length !== n || nums.some((x) => !Number.isInteger(x) || x < 1 || x > n) || new Set(nums).size !== n) return null
  return nums.map((x) => x - 1)
}

/** All permutations of n (n ≤ 5 in practice). */
export function allPerms(n: number): Perm[] {
  const out: Perm[] = []
  const rec = (cur: number[], rest: number[]) => {
    if (!rest.length) { out.push(cur); return }
    rest.forEach((x, i) => rec([...cur, x], [...rest.slice(0, i), ...rest.slice(i + 1)]))
  }
  rec([], identity(n))
  return out
}
