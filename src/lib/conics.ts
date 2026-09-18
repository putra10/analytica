import { eigen2Sym, type Vec2 } from './matrix-math'
import { fmt, signed } from './utils'

/** General conic (Vaisman 3.3.1):  a11 x² + a22 y² + 2a12 xy + 2a10 x + 2a20 y + a00 = 0 */
export interface Conic {
  a11: number; a12: number; a22: number
  a10: number; a20: number; a00: number
}

export const evalConic = (c: Conic, x: number, y: number) =>
  c.a11 * x * x + 2 * c.a12 * x * y + c.a22 * y * y + 2 * c.a10 * x + 2 * c.a20 * y + c.a00

export type ConicType =
  | 'imaginary-ellipse' | 'ellipse' | 'circle' | 'hyperbola' | 'parabola'
  | 'real-crossing-lines' | 'imaginary-crossing-lines' | 'real-parallel-lines' | 'imaginary-parallel-lines' | 'coincident-lines'
  | 'degenerate'

/** Class number in Vaisman's Theorem 3.4.5 */
export const CONIC_TYPE_INDEX: Record<ConicType, number> = {
  'imaginary-ellipse': 1, ellipse: 2, circle: 2, hyperbola: 3, parabola: 4,
  'real-crossing-lines': 5, 'imaginary-crossing-lines': 6, 'real-parallel-lines': 7, 'imaginary-parallel-lines': 8, 'coincident-lines': 9,
  degenerate: 0,
}

export const CONIC_TYPE_LABEL: Record<ConicType, { id: string; en: string }> = {
  'imaginary-ellipse': { id: 'elips imajiner', en: 'imaginary ellipse' },
  ellipse: { id: 'elips (real)', en: 'real ellipse' },
  circle: { id: 'lingkaran', en: 'circle' },
  hyperbola: { id: 'hiperbola', en: 'hyperbola' },
  parabola: { id: 'parabola', en: 'parabola' },
  'real-crossing-lines': { id: 'sepasang garis real berpotongan', en: 'pair of real crossing lines' },
  'imaginary-crossing-lines': { id: 'sepasang garis imajiner berpotongan (satu titik real)', en: 'pair of imaginary crossing lines (one real point)' },
  'real-parallel-lines': { id: 'sepasang garis real sejajar', en: 'pair of real parallel lines' },
  'imaginary-parallel-lines': { id: 'sepasang garis imajiner sejajar', en: 'pair of imaginary parallel lines' },
  'coincident-lines': { id: 'sepasang garis berimpit', en: 'pair of coincident lines' },
  degenerate: { id: 'bukan konik (a11 = a12 = a22 = 0)', en: 'not a conic (a11 = a12 = a22 = 0)' },
}

export interface ConicAnalysis {
  type: ConicType
  /** I = tr A, δ = det A, Δ = det Ã */
  I: number
  delta: number
  Delta: number
  /** eigenvalues of A (principal directions), canonical order */
  s: Vec2
  axes: [Vec2, Vec2]
  /** canonical frame origin (centre when δ ≠ 0, vertex for a parabola) */
  origin: Vec2
  /** parabola parameter p (canonical y'² = 2p x' form uses s2 y'² − 2p x' = 0) */
  p: number
  k: number
  rank: number
  /** rotation angle of the canonical frame (rad) */
  theta: number
  canonicalTex: string
  /** semi-axes / foci where meaningful */
  a?: number
  b?: number
  foci?: Vec2[]
  /** asymptote directions (hyperbola) or line directions (crossing lines) in world coords */
  asymptotes?: Vec2[]
}

const rot = (v: Vec2, axes: [Vec2, Vec2], o: Vec2): Vec2 => [o[0] + v[0] * axes[0][0] + v[1] * axes[1][0], o[1] + v[0] * axes[0][1] + v[1] * axes[1][1]]

/** Reduce to the canonical orthogonal frame (Vaisman 3.4, conic case). */
export function analyzeConic(c: Conic): ConicAnalysis {
  const I = c.a11 + c.a22
  const delta = c.a11 * c.a22 - c.a12 * c.a12
  const Delta =
    c.a11 * (c.a22 * c.a00 - c.a20 * c.a20) -
    c.a12 * (c.a12 * c.a00 - c.a20 * c.a10) +
    c.a10 * (c.a12 * c.a20 - c.a22 * c.a10)
  const eig = eigen2Sym(c.a11, c.a12, c.a22)
  const maxAbs = Math.max(...eig.values.map(Math.abs))
  const tol = Math.max(maxAbs * 1e-7, 1e-9)
  let s = eig.values.map((v) => (Math.abs(v) < tol ? 0 : v)) as Vec2
  let axes = eig.vectors.map((v) => v as Vec2) as [Vec2, Vec2]
  let aR = axes.map((v) => v[0] * c.a10 + v[1] * c.a20) as Vec2
  let alpha = c.a00
  const rank = s.filter((v) => v !== 0).length
  const empty: ConicAnalysis = { type: 'degenerate', I, delta, Delta, s: [0, 0], axes: [[1, 0], [0, 1]], origin: [0, 0], p: 0, k: alpha, rank, theta: 0, canonicalTex: '' }
  if (rank === 0) return empty

  let npos = s.filter((v) => v > 0).length, nneg = s.filter((v) => v < 0).length
  if (nneg > npos) { s = [-s[0], -s[1]]; aR = [-aR[0], -aR[1]]; alpha = -alpha; const t = npos; npos = nneg; nneg = t }
  // positive first, then negative, then zero
  if (s[0] <= 0 && s[1] > 0) { s = [s[1], s[0]]; axes = [axes[1], axes[0]]; aR = [aR[1], aR[0]] }
  if (s[0] === 0 && s[1] !== 0) { s = [s[1], s[0]]; axes = [axes[1], axes[0]]; aR = [aR[1], aR[0]] }
  // right-handed
  if (axes[0][0] * axes[1][1] - axes[0][1] * axes[1][0] < 0) { axes[1] = [-axes[1][0], -axes[1][1]]; aR[1] = -aR[1] }
  // parabola: canonical  s1 x'² − 2p y' = 0  with p > 0
  if (rank === 1 && aR[1] > tol) { axes = [[-axes[0][0], -axes[0][1]], [-axes[1][0], -axes[1][1]]]; aR = [-aR[0], -aR[1]] }

  const u: Vec2 = [0, 0]
  for (let i = 0; i < 2; i++) if (s[i] !== 0) u[i] = -aR[i] / s[i]
  let k = alpha
  for (let i = 0; i < 2; i++) k += s[i] * u[i] * u[i] + 2 * aR[i] * u[i]
  let p = 0
  let type: ConicType
  const kz = Math.abs(k) < tol ? 0 : k
  if (rank === 2) {
    if (npos === 2) type = kz > 0 ? 'imaginary-ellipse' : kz < 0 ? (Math.abs(s[0] - s[1]) < 1e-6 * maxAbs ? 'circle' : 'ellipse') : 'imaginary-crossing-lines'
    else type = kz !== 0 ? 'hyperbola' : 'real-crossing-lines'
  } else if (Math.abs(aR[1]) > tol) {
    p = -aR[1]
    u[1] = -k / (2 * aR[1])
    k = 0
    type = 'parabola'
  } else type = s[0] * kz < 0 ? 'real-parallel-lines' : s[0] * kz > 0 ? 'imaginary-parallel-lines' : 'coincident-lines'
  if (Math.abs(k) < tol) k = 0

  const origin = rot(u, axes, [0, 0])
  const theta = Math.atan2(axes[0][1], axes[0][0])
  const terms: string[] = []
  const vars = ["x'", "y'"]
  s.forEach((v, i) => { if (v !== 0) terms.push(`${terms.length ? signed(v) : fmt(v)}\\,${vars[i]}^2`) })
  if (p !== 0) terms.push(`${signed(-2 * p)}\\,y'`)
  if (k !== 0) terms.push(signed(k))
  const out: ConicAnalysis = { type, I, delta, Delta, s, axes, origin, p, k, rank, theta, canonicalTex: `${terms.join(' ')} = 0` }

  if (type === 'ellipse' || type === 'circle') {
    const a = Math.sqrt(-k / s[0]), b = Math.sqrt(-k / s[1]) // s1 ≥ s2 > 0  ⇒  a ≤ b: major axis along y'
    out.a = a; out.b = b
    const f = Math.sqrt(Math.abs(a * a - b * b))
    out.foci = a >= b ? [rot([f, 0], axes, origin), rot([-f, 0], axes, origin)] : [rot([0, f], axes, origin), rot([0, -f], axes, origin)]
  } else if (type === 'hyperbola') {
    // s1 > 0 > s2. k < 0: x'²/a² − y'²/b² = 1 ; k > 0: y'²/b² − x'²/a² = 1
    const a = Math.sqrt(Math.abs(k / s[0])), b = Math.sqrt(Math.abs(k / s[1]))
    out.a = a; out.b = b
    const f = Math.hypot(a, b)
    out.foci = k < 0 ? [rot([f, 0], axes, origin), rot([-f, 0], axes, origin)] : [rot([0, f], axes, origin), rot([0, -f], axes, origin)]
    const m = Math.sqrt(s[0] / -s[1])
    out.asymptotes = [[axes[0][0] + m * axes[1][0], axes[0][1] + m * axes[1][1]], [axes[0][0] - m * axes[1][0], axes[0][1] - m * axes[1][1]]]
  } else if (type === 'parabola') {
    // s1 x'² = 2p y'  ⇒  x'² = 2(p/s1) y', focus at (0, p/(2 s1))
    out.foci = [rot([0, p / (2 * s[0])], axes, origin)]
  } else if (type === 'real-crossing-lines') {
    const m = Math.sqrt(s[0] / -s[1])
    out.asymptotes = [[axes[0][0] + m * axes[1][0], axes[0][1] + m * axes[1][1]], [axes[0][0] - m * axes[1][0], axes[0][1] - m * axes[1][1]]]
  }
  return out
}

export interface ConicPreset {
  id: string
  label: string
  ref?: string
  c: Conic
}

export const CONIC_PRESETS: ConicPreset[] = [
  { id: 'ellipse', label: 'x²/4 + y²/1 = 1', c: { a11: 0.25, a12: 0, a22: 1, a10: 0, a20: 0, a00: -1 } },
  { id: 'hyperbola', label: 'x²/4 − y² = 1', c: { a11: 0.25, a12: 0, a22: -1, a10: 0, a20: 0, a00: -1 } },
  { id: 'parabola', label: 'y² = 2x', c: { a11: 0, a12: 0, a22: 1, a10: -1, a20: 0, a00: 0 } },
  { id: 'rotated', label: '5x² + 24xy − 2y² + 4x − 1 = 0', ref: 'Vaisman 3.3.22', c: { a11: 5, a12: 12, a22: -2, a10: 2, a20: 0, a00: -1 } },
  { id: 'v3411', label: 'x² + 8y² − 4xy − 8x + 6y − 5 = 0', ref: 'Vaisman 3.4.11', c: { a11: 1, a12: -2, a22: 8, a10: -4, a20: 3, a00: -5 } },
  { id: 'v3411a', label: '3x² + 3y² − 2xy + 4x − 4y − 4 = 0', ref: 'Vaisman 3.4.1 (1)', c: { a11: 3, a12: -1, a22: 3, a10: 2, a20: -2, a00: -4 } },
  { id: 'v3411b', label: '3x² − y² + 2xy + 8x + 10y + 14 = 0', ref: 'Vaisman 3.4.1 (2)', c: { a11: 3, a12: 1, a22: -1, a10: 4, a20: 5, a00: 14 } },
  { id: 'v3411c', label: '9x² + 16y² + 24xy − 40x + 30y = 0', ref: 'Vaisman 3.4.1 (3)', c: { a11: 9, a12: 12, a22: 16, a10: -20, a20: 15, a00: 0 } },
  { id: 'lines', label: 'x² − y² = 0', c: { a11: 1, a12: 0, a22: -1, a10: 0, a20: 0, a00: 0 } },
]
