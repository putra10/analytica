/**
 * Exact-looking display of floating results: integers, fractions p/q and surds k√m/q are recognised
 * (denominator up to 10^4, relative tolerance 1e-11), everything else is shown as a 6-digit decimal.
 */
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

/** p/q with q ≤ maxDen, or null. */
export function rational(x: number, maxDen = 10000): [number, number] | null {
  if (!Number.isFinite(x)) return null
  const tol = 1e-11 * (1 + Math.abs(x))
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0, r = Math.abs(x)
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(r)
    const h = a * h1 + h0, k = a * k1 + k0
    if (k > maxDen) return null
    if (Math.abs(h / k - Math.abs(x)) <= tol) return [Math.sign(x) * h, k]
    h0 = h1; h1 = h; k0 = k1; k1 = k
    if (r - a < 1e-12) return null
    r = 1 / (r - a)
  }
  return null
}

type Form = { kind: 'rat'; p: number; q: number } | { kind: 'surd'; sign: number; k: number; m: number; q: number } | { kind: 'dec'; x: number }

function form(x: number): Form {
  if (Math.abs(x) < 1e-10) return { kind: 'rat', p: 0, q: 1 }
  const r = rational(x)
  if (r) return { kind: 'rat', p: r[0], q: r[1] }
  const r2 = rational(x * x)
  if (r2 && r2[0] * r2[1] < 1e8) {
    // √(p/q) = √(pq)/q, pull squares out of pq
    let m = r2[0] * r2[1], k = 1
    for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f }
    if (m > 1) { const g = gcd(k, r2[1]); return { kind: 'surd', sign: Math.sign(x), k: k / g, m, q: r2[1] / g } }
  }
  return { kind: 'dec', x }
}

const dec = (x: number) => { const s = String(+x.toPrecision(6)); return s.includes('e') ? x.toFixed(6) : s }

/** TeX for a number. */
export function tx(x: number): string {
  if (!Number.isFinite(x)) return '\\infty'
  const f = form(x)
  if (f.kind === 'dec') return dec(f.x)
  if (f.kind === 'rat') return f.q === 1 ? String(f.p) : `${f.p < 0 ? '-' : ''}\\frac{${Math.abs(f.p)}}{${f.q}}`
  const num = `${f.k === 1 ? '' : f.k}\\sqrt{${f.m}}`
  return `${f.sign < 0 ? '-' : ''}${f.q === 1 ? num : `\\frac{${num}}{${f.q}}`}`
}

/** Plain text for a number (√, /). */
export function txt(x: number): string {
  if (!Number.isFinite(x)) return 'undefined'
  const f = form(x)
  if (f.kind === 'dec') return dec(f.x)
  if (f.kind === 'rat') return f.q === 1 ? String(f.p) : `${f.p}/${f.q}`
  return `${f.sign < 0 ? '-' : ''}${f.k === 1 ? '' : f.k}√${f.m}${f.q === 1 ? '' : '/' + f.q}`
}

/** Is the display exact (not a rounded decimal)? */
export const isExact = (x: number) => form(x).kind !== 'dec'

/** TeX with "≈ decimal" appended for surds. */
export const txa = (x: number) => { const f = form(x); return f.kind === 'surd' ? `${tx(x)} \\approx ${dec(x)}` : tx(x) }
/** Plain text with "≈ decimal" appended for surds. */
export const txta = (x: number) => { const f = form(x); return f.kind === 'surd' ? `${txt(x)} ≈ ${dec(x)}` : txt(x) }

/** Number wrapped in parentheses when negative (for substitutions). */
export const par = (x: number) => (tx(x).startsWith('-') ? `(${tx(x)})` : tx(x))

/** Polynomial TeX from [coefficient, monomial] pairs; zero terms dropped, 1·x written x. */
export function poly(terms: [number, string][], num = tx): string {
  let out = ''
  for (const [c, m] of terms) {
    if (Math.abs(c) < 1e-10) continue
    const neg = c < 0, a = Math.abs(c)
    const coef = m && Math.abs(a - 1) < 1e-10 ? '' : num(a)
    const body = `${coef}${m}`
    out += out ? ` ${neg ? '-' : '+'} ${body}` : `${neg ? '-' : ''}${body}`
  }
  return out || '0'
}

/** Vector TeX (a, b, c). */
export const vt = (v: number[]) => `(${v.map(tx).join(', ')})`
export const vtxt = (v: number[]) => `(${v.map(txt).join(', ')})`

/** Scale a coefficient row to small coprime integers when all entries are rational (leading entry positive). */
export function intRow(v: number[]): number[] {
  const rs = v.map((x) => rational(x, 1000))
  let out = v
  if (rs.every(Boolean)) {
    const lcm = rs.reduce((l, r) => (l * r![1]) / gcd(l, r![1]), 1)
    const ints = rs.map((r) => (r![0] * lcm) / r![1])
    const g = ints.reduce((a, b) => gcd(a, Math.round(b)), 0) || 1
    out = ints.map((x) => Math.round(x) / g)
  }
  const lead = out.find((x) => Math.abs(x) > 1e-10) ?? 1
  return lead < 0 ? out.map((x) => -x || 0) : out
}
