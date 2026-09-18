import { eigen3Sym } from './matrix-math'
import { marchingSquares } from './marching'
import { fmt, signed } from './utils'

export type Vec3 = [number, number, number]

/**
 * General quadric in Vaisman's notation (3.3.6):
 *   f(r) = r·Tr + 2 ā·r + α = 0,   T symmetric with entries a_ij, ā = (a10, a20, a30), α = a00.
 */
export interface Quadric {
  A: number[][]
  a: Vec3
  alpha: number
}

export const dot3 = (u: Vec3, v: Vec3) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
export const cross3 = (u: Vec3, v: Vec3): Vec3 => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
export const scale3 = (u: Vec3, s: number): Vec3 => [u[0] * s, u[1] * s, u[2] * s]
export const add3 = (u: Vec3, v: Vec3): Vec3 => [u[0] + v[0], u[1] + v[1], u[2] + v[2]]
export const sub3 = (u: Vec3, v: Vec3): Vec3 => [u[0] - v[0], u[1] - v[1], u[2] - v[2]]
export const norm3 = (u: Vec3) => Math.hypot(u[0], u[1], u[2])
export const unit3 = (u: Vec3): Vec3 => scale3(u, 1 / (norm3(u) || 1))
export const matVec3 = (A: number[][], v: Vec3): Vec3 => [dot3(A[0] as Vec3, v), dot3(A[1] as Vec3, v), dot3(A[2] as Vec3, v)]

export const det3 = (m: number[][]) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
  m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
  m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])

export const det4 = (m: number[][]) => {
  let d = 0
  for (let c = 0; c < 4; c++) {
    const minor = m.slice(1).map((row) => row.filter((_, j) => j !== c))
    d += (c % 2 ? -1 : 1) * m[0][c] * det3(minor)
  }
  return d
}

/** Evaluate f(r). */
export const evalQuadric = ({ A, a, alpha }: Quadric, r: Vec3) => dot3(r, matVec3(A, r)) + 2 * dot3(a, r) + alpha

/** Large matrix Ã (3.3.8). */
export function largeMatrix({ A, a, alpha }: Quadric): number[][] {
  return [
    [A[0][0], A[0][1], A[0][2], a[0]],
    [A[1][0], A[1][1], A[1][2], a[1]],
    [A[2][0], A[2][1], A[2][2], a[2]],
    [a[0], a[1], a[2], alpha],
  ]
}

export interface Invariants {
  /** trace of A */
  I: number
  /** sum of principal 2x2 minors of A */
  J: number
  /** δ = det A */
  delta: number
  /** Δ = det Ã */
  Delta: number
}

export function invariants(q: Quadric): Invariants {
  const { A } = q
  return {
    I: A[0][0] + A[1][1] + A[2][2],
    J: A[0][0] * A[1][1] - A[0][1] * A[1][0] + A[0][0] * A[2][2] - A[0][2] * A[2][0] + A[1][1] * A[2][2] - A[1][2] * A[2][1],
    delta: det3(A),
    Delta: det4(largeMatrix(q)),
  }
}

// ---------- reduction to canonical frame (Vaisman 3.4) ----------

export type QuadricType =
  | 'imaginary-ellipsoid' | 'ellipsoid' | 'hyperboloid-2' | 'hyperboloid-1'
  | 'elliptic-paraboloid' | 'hyperbolic-paraboloid'
  | 'imaginary-cone' | 'cone'
  | 'imaginary-cylinder' | 'elliptic-cylinder' | 'hyperbolic-cylinder' | 'parabolic-cylinder'
  | 'imaginary-concurrent-planes' | 'concurrent-planes' | 'parallel-planes' | 'imaginary-parallel-planes' | 'coincident-planes'
  | 'degenerate'

/** Class number in Vaisman's Theorem 3.4.6 */
export const TYPE_INDEX: Record<QuadricType, number> = {
  'imaginary-ellipsoid': 1, ellipsoid: 2, 'hyperboloid-2': 3, 'hyperboloid-1': 4,
  'elliptic-paraboloid': 5, 'hyperbolic-paraboloid': 6, 'imaginary-cone': 7, cone: 8,
  'imaginary-cylinder': 9, 'elliptic-cylinder': 10, 'hyperbolic-cylinder': 11, 'parabolic-cylinder': 12,
  'imaginary-concurrent-planes': 13, 'concurrent-planes': 14, 'parallel-planes': 15, 'imaginary-parallel-planes': 16, 'coincident-planes': 17,
  degenerate: 0,
}

export interface Reduced {
  type: QuadricType
  /** canonical frame axes (unit, right-handed) */
  axes: [Vec3, Vec3, Vec3]
  /** origin of the canonical frame (the centre when it exists) */
  origin: Vec3
  /** eigenvalues s1, s2, s3 of A in the canonical order */
  s: Vec3
  /** parameter p of paraboloids / parabolic cylinders (canonical 2p·z or 2p·y term) */
  p: number
  /** constant term of the canonical equation */
  k: number
  rank: number
  /** canonical equation in TeX, in the frame (x', y', z') */
  canonicalTex: string
}

const EPS = 1e-9

export function reduceQuadric(q: Quadric): Reduced {
  const eig = eigen3Sym(q.A)
  const maxAbs = Math.max(...eig.values.map(Math.abs), 0)
  const tol = Math.max(maxAbs * 1e-7, EPS)
  let s = eig.values.map((v) => (Math.abs(v) < tol ? 0 : v))
  let vecs = eig.vectors.map((v) => v as Vec3)
  let aR = vecs.map((v) => dot3(v, q.a))
  let alpha = q.alpha
  const rank = s.filter((v) => v !== 0).length
  if (rank === 0) {
    return { type: 'degenerate', axes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], origin: [0, 0, 0], s: [0, 0, 0], p: 0, k: alpha, rank, canonicalTex: '' }
  }

  // normalise sign so that #positive ≥ #negative
  let npos = s.filter((v) => v > 0).length, nneg = s.filter((v) => v < 0).length
  const negate = () => { s = s.map((v) => -v); aR = aR.map((v) => -v); alpha = -alpha; const t = npos; npos = nneg; nneg = t }
  if (nneg > npos) negate()

  // order: positive (|s| desc), negative, zero
  const order = [0, 1, 2].sort((i, j) => {
    const cls = (v: number) => (v > 0 ? 0 : v < 0 ? 1 : 2)
    return cls(s[i]) - cls(s[j]) || Math.abs(s[j]) - Math.abs(s[i])
  })
  s = order.map((i) => s[i]); vecs = order.map((i) => vecs[i]); aR = order.map((i) => aR[i])

  let p = 0
  if (rank === 1) {
    // rotate axes 2,3 so the remaining linear term lies along axis 2
    const qn = Math.hypot(aR[1], aR[2])
    if (qn > tol) {
      // point axis 2 against the gradient so the canonical form reads  s1 x'² − 2p y' = 0  with p > 0
      const e2 = unit3(add3(scale3(vecs[1], -aR[1]), scale3(vecs[2], -aR[2])))
      vecs = [vecs[0], e2, cross3(vecs[0], e2)]
      aR = [aR[0], -qn, 0]
    } else aR = [aR[0], 0, 0]
  }
  // right-handed
  if (dot3(cross3(vecs[0], vecs[1]), vecs[2]) < 0) { vecs[2] = scale3(vecs[2], -1); aR[2] = -aR[2] }
  // paraboloid: make the canonical linear coefficient negative so that  s1x² + s2y² = 2p z  with p > 0
  if (rank === 2 && Math.abs(aR[2]) > tol && aR[2] > 0) { vecs[1] = scale3(vecs[1], -1); vecs[2] = scale3(vecs[2], -1); aR[1] = -aR[1]; aR[2] = -aR[2] }

  // translation: complete squares along non-degenerate axes
  const u: Vec3 = [0, 0, 0]
  for (let i = 0; i < 3; i++) if (s[i] !== 0) u[i] = -aR[i] / s[i]
  let k = alpha
  for (let i = 0; i < 3; i++) k += s[i] * u[i] * u[i] + 2 * aR[i] * u[i]

  let type: QuadricType
  const kz = Math.abs(k) < tol ? 0 : k
  if (rank === 3) {
    if (npos === 3) type = kz > 0 ? 'imaginary-ellipsoid' : kz < 0 ? 'ellipsoid' : 'imaginary-cone'
    else type = kz > 0 ? 'hyperboloid-2' : kz < 0 ? 'hyperboloid-1' : 'cone'
  } else if (rank === 2) {
    if (Math.abs(aR[2]) > tol) {
      p = -aR[2]
      u[2] = -k / (2 * aR[2])
      k = 0
      type = npos === 2 ? 'elliptic-paraboloid' : 'hyperbolic-paraboloid'
    } else if (npos === 2) type = kz > 0 ? 'imaginary-cylinder' : kz < 0 ? 'elliptic-cylinder' : 'imaginary-concurrent-planes'
    else type = kz !== 0 ? 'hyperbolic-cylinder' : 'concurrent-planes'
  } else {
    if (Math.abs(aR[1]) > tol) {
      p = -aR[1]
      u[1] = -k / (2 * aR[1])
      k = 0
      type = 'parabolic-cylinder'
    } else type = s[0] * kz < 0 ? 'parallel-planes' : s[0] * kz > 0 ? 'imaginary-parallel-planes' : 'coincident-planes'
  }
  if (Math.abs(k) < tol) k = 0

  const origin = add3(add3(scale3(vecs[0], u[0]), scale3(vecs[1], u[1])), scale3(vecs[2], u[2]))

  const terms: string[] = []
  const vars = ["x'", "y'", "z'"]
  s.forEach((v, i) => { if (v !== 0) terms.push(`${terms.length ? signed(v) : fmt(v)}\\,${vars[i]}^2`) })
  if (p !== 0) terms.push(`${signed(-2 * p)}\\,${rank === 2 ? "z'" : "y'"}`)
  if (k !== 0) terms.push(signed(k))
  const canonicalTex = `${terms.join(' ')} = 0`

  return { type, axes: vecs as [Vec3, Vec3, Vec3], origin, s: s as Vec3, p, k, rank, canonicalTex }
}

// ---------- meshes ----------

export interface Surface {
  positions: Float32Array
  indices: Uint16Array
}

const TAU = Math.PI * 2

function patch(fn: (u: number, v: number) => Vec3, u0: number, u1: number, v0: number, v1: number, nu = 64, nv = 64): Surface {
  const positions = new Float32Array((nu + 1) * (nv + 1) * 3)
  const indices = new Uint16Array(nu * nv * 6)
  let p = 0
  for (let i = 0; i <= nu; i++) {
    const u = u0 + ((u1 - u0) * i) / nu
    for (let j = 0; j <= nv; j++) {
      const v = v0 + ((v1 - v0) * j) / nv
      const [x, y, z] = fn(u, v)
      positions[p++] = x; positions[p++] = y; positions[p++] = z
    }
  }
  let k = 0
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1
    indices[k++] = a; indices[k++] = b; indices[k++] = a + 1
    indices[k++] = b; indices[k++] = b + 1; indices[k++] = a + 1
  }
  return { positions, indices }
}

/** Surfaces of the quadric in world coordinates (canonical patches mapped through the frame). R = visible extent. */
export function quadricSurfaces(red: Reduced, R = 3): Surface[] {
  const { type, s, k, p, axes, origin } = red
  const toWorld = (c: Vec3): Vec3 => add3(origin, add3(add3(scale3(axes[0], c[0]), scale3(axes[1], c[1])), scale3(axes[2], c[2])))
  const P = (fn: (u: number, v: number) => Vec3, u0: number, u1: number, v0: number, v1: number, nu?: number, nv?: number) =>
    patch((u, v) => toWorld(fn(u, v)), u0, u1, v0, v1, nu, nv)
  const sq = (x: number) => Math.sqrt(Math.abs(x))
  const a = s[0] ? sq(k / s[0]) : 0, b = s[1] ? sq(k / s[1]) : 0, c = s[2] ? sq(k / s[2]) : 0
  const plane = (fn: (u: number, v: number) => Vec3) => P(fn, -R, R, -R, R, 4, 4)

  switch (type) {
    case 'ellipsoid':
      return [P((u, v) => [a * Math.sin(u) * Math.cos(v), b * Math.sin(u) * Math.sin(v), c * Math.cos(u)], 0, Math.PI, 0, TAU)]
    case 'hyperboloid-1': {
      const U = Math.asinh(R / c)
      return [P((u, v) => [a * Math.cosh(u) * Math.cos(v), b * Math.cosh(u) * Math.sin(v), c * Math.sinh(u)], -U, U, 0, TAU)]
    }
    case 'hyperboloid-2': {
      const U = Math.acosh(Math.max(1, R / c))
      return [1, -1].map((sg) => P((u, v) => [a * Math.sinh(u) * Math.cos(v), b * Math.sinh(u) * Math.sin(v), sg * c * Math.cosh(u)], 0, U, 0, TAU, 40, 64))
    }
    case 'cone': {
      const ca = 1 / sq(s[0]), cb = 1 / sq(s[1]), cc = 1 / sq(s[2])
      return [P((u, v) => [ca * u * Math.cos(v), cb * u * Math.sin(v), cc * u], -R / cc, R / cc, 0, TAU)]
    }
    case 'elliptic-paraboloid': {
      const rmax = Math.sqrt(2 * p * R)
      return [P((r, v) => [(r * Math.cos(v)) / sq(s[0]), (r * Math.sin(v)) / sq(s[1]), (r * r) / (2 * p)], 0, rmax, 0, TAU)]
    }
    case 'hyperbolic-paraboloid': {
      const e = Math.sqrt(2 * p * R)
      return [P((u, v) => [u / sq(s[0]), v / sq(s[1]), (u * u - v * v) / (2 * p)], -e, e, -e, e)]
    }
    case 'elliptic-cylinder':
      return [P((u, v) => [a * Math.cos(v), b * Math.sin(v), u], -R, R, 0, TAU, 8, 64)]
    case 'hyperbolic-cylinder': {
      // after normalisation: s1 > 0, s2 < 0. k < 0 → x'²/a² − y'²/b² = 1 ; k > 0 → y'²/b² − x'²/a² = 1
      const U = Math.asinh(R / Math.max(a, b, 1e-6))
      if (k < 0) return [1, -1].map((sg) => P((u, v) => [sg * a * Math.cosh(u), b * Math.sinh(u), v], -U, U, -R, R, 48, 8))
      return [1, -1].map((sg) => P((u, v) => [a * Math.sinh(u), sg * b * Math.cosh(u), v], -U, U, -R, R, 48, 8))
    }
    case 'parabolic-cylinder': {
      const e = Math.sqrt(2 * p * R / Math.abs(s[0]))
      return [P((u, v) => [u, (s[0] * u * u) / (2 * p), v], -e, e, -R, R, 48, 8)]
    }
    case 'concurrent-planes': {
      // s1 x² + s2 y² = 0, s1 > 0 > s2 :  y = ± sqrt(s1/-s2) x
      const m = Math.sqrt(s[0] / -s[1])
      return [1, -1].map((sg) => plane((u, v) => [u, sg * m * u, v]))
    }
    case 'parallel-planes': {
      const x = Math.sqrt(-k / s[0])
      return [1, -1].map((sg) => plane((u, v) => [sg * x, u, v]))
    }
    case 'coincident-planes':
      return [plane((u, v) => [0, u, v])]
    default:
      return [] // imaginary loci have no real points
  }
}

// ---------- plane slicing ----------

export interface Plane {
  /** normal (A, B, C) */
  n: Vec3
  /** D in  A x + B y + C z + D = 0 */
  D: number
}

export type ConicKind = 'circle' | 'ellipse' | 'imaginary-ellipse' | 'parabola' | 'hyperbola' | 'lines' | 'point' | 'empty'

export interface Slice {
  segments: Float32Array
  kind: ConicKind
  /** conic in in-plane orthonormal coordinates (s, t):  a11 s² + 2a12 st + a22 t² + 2a10 s + 2a20 t + a00 = 0 */
  conic: { a11: number; a12: number; a22: number; a10: number; a20: number; a00: number }
  delta: number
  Delta: number
}

const EMPTY: Slice = { segments: new Float32Array(0), kind: 'empty', conic: { a11: 0, a12: 0, a22: 0, a10: 0, a20: 0, a00: 0 }, delta: 0, Delta: 0 }

/** Intersect the quadric with the plane; the restriction to the plane is a conic (Prop. 3.3.2). */
export function slicePlane(q: Quadric, plane: Plane, R = 6): Slice {
  const len = norm3(plane.n)
  if (len < 1e-6) return EMPTY
  const n = scale3(plane.n, 1 / len)
  const p0 = scale3(n, -plane.D / len)
  const helper: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  const e1 = unit3(cross3(n, helper))
  const e2 = cross3(n, e1)
  const { A, a } = q
  const Ae1 = matVec3(A, e1), Ae2 = matVec3(A, e2), Ap = matVec3(A, p0)
  const conic = {
    a11: dot3(e1, Ae1), a12: dot3(e1, Ae2), a22: dot3(e2, Ae2),
    a10: dot3(e1, Ap) + dot3(a, e1), a20: dot3(e2, Ap) + dot3(a, e2),
    a00: evalQuadric(q, p0),
  }
  const g = (s: number, t: number) =>
    conic.a11 * s * s + 2 * conic.a12 * s * t + conic.a22 * t * t + 2 * conic.a10 * s + 2 * conic.a20 * t + conic.a00
  const seg2 = marchingSquares(g, -R, R, -R, R, 160)
  const segments = new Float32Array((seg2.length / 2) * 3)
  for (let i = 0, j = 0; i < seg2.length; i += 2) {
    const s = seg2[i], t = seg2[i + 1]
    segments[j++] = p0[0] + s * e1[0] + t * e2[0]
    segments[j++] = p0[1] + s * e1[1] + t * e2[1]
    segments[j++] = p0[2] + s * e1[2] + t * e2[2]
  }
  const delta = conic.a11 * conic.a22 - conic.a12 * conic.a12
  const Delta = det3([[conic.a11, conic.a12, conic.a10], [conic.a12, conic.a22, conic.a20], [conic.a10, conic.a20, conic.a00]])
  const eps = 1e-9
  let kind: ConicKind
  if (Math.abs(conic.a11) < eps && Math.abs(conic.a12) < eps && Math.abs(conic.a22) < eps) kind = seg2.length ? 'lines' : 'empty'
  else if (Math.abs(Delta) < eps) kind = delta > eps ? 'point' : seg2.length ? 'lines' : 'empty'
  else if (delta > eps) kind = seg2.length ? (Math.abs(conic.a11 - conic.a22) < 1e-4 && Math.abs(conic.a12) < 1e-4 ? 'circle' : 'ellipse') : 'imaginary-ellipse'
  else if (delta < -eps) kind = 'hyperbola'
  else kind = 'parabola'
  return { segments, kind, conic, delta, Delta }
}

// ---------- presets ----------

export interface QuadricPreset {
  id: string
  label: { id: string; en: string }
  q: Quadric
  /** book reference */
  ref?: string
}

const diag = (x: number, y: number, z: number) => [[x, 0, 0], [0, y, 0], [0, 0, z]]
const Z3: Vec3 = [0, 0, 0]

export const QUADRIC_PRESETS: QuadricPreset[] = [
  { id: 'ellipsoid', label: { id: 'Elipsoid', en: 'Ellipsoid' }, q: { A: diag(1 / 1.96, 1, 1 / 1.44), a: Z3, alpha: -1 } },
  { id: 'hyper1', label: { id: 'Hiperboloid 1 lembar', en: 'Hyperboloid, 1 sheet' }, q: { A: diag(1, 1, -1 / 1.44), a: Z3, alpha: -1 } },
  { id: 'hyper2', label: { id: 'Hiperboloid 2 lembar', en: 'Hyperboloid, 2 sheets' }, q: { A: diag(1, 1, -1 / 1.44), a: Z3, alpha: 1 } },
  { id: 'ellParab', label: { id: 'Paraboloid eliptik', en: 'Elliptic paraboloid' }, q: { A: diag(1, 1 / 1.96, 0), a: [0, 0, -0.5], alpha: 0 } },
  { id: 'hypParab', label: { id: 'Paraboloid hiperbolik', en: 'Hyperbolic paraboloid' }, q: { A: diag(1, -1, 0), a: [0, 0, -0.5], alpha: 0 } },
  { id: 'cone', label: { id: 'Kerucut', en: 'Cone' }, q: { A: diag(1, 1, -1 / 1.44), a: Z3, alpha: 0 } },
  { id: 'cylinder', label: { id: 'Silinder eliptik', en: 'Elliptic cylinder' }, q: { A: diag(1 / 1.96, 1, 0), a: Z3, alpha: -1 } },
  { id: 'hcyl', label: { id: 'Silinder hiperbolik', en: 'Hyperbolic cylinder' }, q: { A: diag(1, -1, 0), a: Z3, alpha: -1 } },
  { id: 'pcyl', label: { id: 'Silinder parabolik', en: 'Parabolic cylinder' }, q: { A: diag(1, 0, 0), a: [0, -0.5, 0], alpha: 0 } },
  { id: 'planes', label: { id: 'Sepasang bidang', en: 'Pair of planes' }, q: { A: diag(1, -0.5, 0), a: Z3, alpha: 0 } },
  // Vaisman Example 3.4.3:  x² + y² − 3z² − 2xy − 6xz − 6yz + 2x + 2y + 4z = 0  → two-sheeted hyperboloid
  { id: 'v343', label: { id: 'Contoh 3.4.3', en: 'Example 3.4.3' }, ref: 'Vaisman 3.4.3', q: { A: [[1, -1, -3], [-1, 1, -3], [-3, -3, -3]], a: [1, 1, 2], alpha: 0 } },
  // Exercise 3.4.2 (1): 3x² + y² − z² + 6xz − 4y = 0
  { id: 'v3421', label: { id: 'Latihan 3.4.2 (1)', en: 'Exercise 3.4.2 (1)' }, ref: 'Vaisman 3.4.2', q: { A: [[3, 0, 3], [0, 1, 0], [3, 0, -1]], a: [0, -2, 0], alpha: 0 } },
  // Exercise 3.4.2 (2): 2x² + y² + 3z² − 4yz + 2x − 6z + 1 = 0
  { id: 'v3422', label: { id: 'Latihan 3.4.2 (2)', en: 'Exercise 3.4.2 (2)' }, ref: 'Vaisman 3.4.2', q: { A: [[2, 0, 0], [0, 1, -2], [0, -2, 3]], a: [1, 0, -3], alpha: 1 } },
  // Exercise 3.4.2 (5): 4x² + 2y² + z² − 4xy − 2yz − 2y + 2z − 4 = 0
  { id: 'v3425', label: { id: 'Latihan 3.4.2 (5)', en: 'Exercise 3.4.2 (5)' }, ref: 'Vaisman 3.4.2', q: { A: [[4, -2, 0], [-2, 2, -1], [0, -1, 1]], a: [0, -1, 1], alpha: -4 } },
]

export const TYPE_LABEL: Record<QuadricType, { id: string; en: string }> = {
  'imaginary-ellipsoid': { id: 'elipsoid imajiner', en: 'imaginary ellipsoid' },
  ellipsoid: { id: 'elipsoid (real)', en: 'real ellipsoid' },
  'hyperboloid-2': { id: 'hiperboloid dua lembar', en: 'two-sheeted hyperboloid' },
  'hyperboloid-1': { id: 'hiperboloid satu lembar', en: 'one-sheeted hyperboloid' },
  'elliptic-paraboloid': { id: 'paraboloid eliptik', en: 'elliptic paraboloid' },
  'hyperbolic-paraboloid': { id: 'paraboloid hiperbolik', en: 'hyperbolic paraboloid' },
  'imaginary-cone': { id: 'kerucut imajiner (satu titik real)', en: 'imaginary cone (one real point)' },
  cone: { id: 'kerucut (real)', en: 'real cone' },
  'imaginary-cylinder': { id: 'silinder imajiner', en: 'imaginary cylinder' },
  'elliptic-cylinder': { id: 'silinder eliptik', en: 'elliptic cylinder' },
  'hyperbolic-cylinder': { id: 'silinder hiperbolik', en: 'hyperbolic cylinder' },
  'parabolic-cylinder': { id: 'silinder parabolik', en: 'parabolic cylinder' },
  'imaginary-concurrent-planes': { id: 'sepasang bidang imajiner berpotongan (satu garis real)', en: 'pair of imaginary concurrent planes (one real line)' },
  'concurrent-planes': { id: 'sepasang bidang real berpotongan', en: 'pair of real concurrent planes' },
  'parallel-planes': { id: 'sepasang bidang real sejajar', en: 'pair of real parallel planes' },
  'imaginary-parallel-planes': { id: 'sepasang bidang imajiner sejajar', en: 'pair of imaginary parallel planes' },
  'coincident-planes': { id: 'sepasang bidang berimpit', en: 'pair of coincident planes' },
  degenerate: { id: 'bukan kuadrik (semua a_ij = 0)', en: 'not a quadric (all a_ij = 0)' },
}

export const CONIC_KIND_LABEL: Record<ConicKind, { id: string; en: string }> = {
  circle: { id: 'lingkaran', en: 'a circle' },
  ellipse: { id: 'elips', en: 'an ellipse' },
  'imaginary-ellipse': { id: 'elips imajiner (tidak ada titik real)', en: 'an imaginary ellipse (no real points)' },
  parabola: { id: 'parabola', en: 'a parabola' },
  hyperbola: { id: 'hiperbola', en: 'a hyperbola' },
  lines: { id: 'konik terdegenerasi (sepasang garis)', en: 'a degenerate conic (pair of lines)' },
  point: { id: 'satu titik (sepasang garis imajiner)', en: 'a single point (imaginary lines)' },
  empty: { id: 'himpunan kosong: bidang tidak memotong permukaan', en: 'nothing: the plane misses the surface' },
}
