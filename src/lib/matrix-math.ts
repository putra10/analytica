import { fmt, signed } from './utils'

/** Row-major 2x2: [a, b, c, d] = [[a, b], [c, d]] */
export type Mat2 = [number, number, number, number]
export type Vec2 = [number, number]

export const IDENTITY: Mat2 = [1, 0, 0, 1]

export const apply = (m: Mat2, v: Vec2): Vec2 => [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]]
export const det2 = (m: Mat2) => m[0] * m[3] - m[1] * m[2]
export const trace2 = (m: Mat2) => m[0] + m[3]
export const lerpMat = (a: Mat2, b: Mat2, t: number): Mat2 =>
  a.map((x, i) => x + (b[i] - x) * t) as Mat2
export const norm2 = (v: Vec2) => Math.hypot(v[0], v[1])
export const normalize = (v: Vec2): Vec2 => {
  const n = norm2(v) || 1
  return [v[0] / n, v[1] / n]
}

export interface Eigen2 {
  /** false when the eigenvalues are a complex-conjugate pair */
  real: boolean
  /** real parts (equal when complex) */
  values: [number, number]
  /** |imaginary part| when complex, else 0 */
  imag: number
  /** unit eigenvectors, one per distinct real eigen-direction (0, 1 or 2) */
  vectors: Vec2[]
}

export function eigen2(m: Mat2): Eigen2 {
  const [a, b, c, d] = m
  const tr = a + d
  const det = a * d - b * c
  const disc = (tr * tr) / 4 - det
  if (disc < -1e-12) return { real: false, values: [tr / 2, tr / 2], imag: Math.sqrt(-disc), vectors: [] }

  const s = Math.sqrt(Math.max(disc, 0))
  const l1 = tr / 2 + s
  const l2 = tr / 2 - s

  // Null vector of (A - λI): pick whichever row is non-trivial.
  const vec = (l: number): Vec2 | null => {
    if (Math.abs(b) > 1e-9) return normalize([b, l - a])
    if (Math.abs(c) > 1e-9) return normalize([l - d, c])
    if (Math.abs(a - l) < 1e-9) return [1, 0]
    if (Math.abs(d - l) < 1e-9) return [0, 1]
    return null
  }

  let vectors: Vec2[]
  if (s < 1e-9) {
    const scalar = Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9
    // scalar matrix: every direction is an eigenvector; defective (shear): a single one
    vectors = scalar ? [[1, 0], [0, 1]] : [vec(l1)].filter((v): v is Vec2 => v !== null)
  } else {
    vectors = [vec(l1), vec(l2)].filter((v): v is Vec2 => v !== null)
  }
  return { real: true, values: [l1, l2], imag: 0, vectors }
}

/** det(λI - T) = λ² - tr(T) λ + det(T), as TeX */
export function charPolyTex(m: Mat2): string {
  const tr = trace2(m)
  const det = det2(m)
  return `\\lambda^2 ${signed(-tr)}\\lambda ${signed(det)}`
}

export function eigenvaluesTex(e: Eigen2): string {
  if (!e.real) return `\\lambda = ${fmt(e.values[0])} \\pm ${fmt(e.imag)}i`
  return `\\lambda_1 = ${fmt(e.values[0])},\\quad \\lambda_2 = ${fmt(e.values[1])}`
}

export interface Svd2 {
  sigma: [number, number]
  /** rotation angle (rad) of V, the input basis */
  thetaV: number
  /** rotation angle (rad) of U, the output basis */
  thetaU: number
}

/** Analytic 2x2 SVD: T = U Σ Vᵀ with U, V rotations (up to reflection). */
export function svd2(m: Mat2): Svd2 {
  const [a, b, c, d] = m
  const p = a * a + c * c
  const q = b * b + d * d
  const r = a * b + c * d
  const mid = (p + q) / 2
  const rad = Math.sqrt(((p - q) / 2) ** 2 + r * r)
  const s1 = Math.sqrt(Math.max(mid + rad, 0))
  const s2 = Math.sqrt(Math.max(mid - rad, 0))
  const thetaV = 0.5 * Math.atan2(2 * r, p - q)
  const v1: Vec2 = [Math.cos(thetaV), Math.sin(thetaV)]
  const u1 = apply(m, v1)
  const thetaU = Math.atan2(u1[1], u1[0])
  return { sigma: [s1, s2], thetaV, thetaU }
}

/** Angle in [0, π/2] between two directions (sign-insensitive). */
export function directionAngle(u: Vec2, v: Vec2): number {
  const cos = Math.abs(u[0] * v[0] + u[1] * v[1]) / ((norm2(u) || 1) * (norm2(v) || 1))
  return Math.acos(Math.min(1, cos))
}

export interface SymEigen {
  values: number[]
  /** unit eigenvectors, vectors[i] pairs with values[i] */
  vectors: number[][]
}

/** Closed-form eigen-decomposition of a symmetric 2x2 [[a, b], [b, d]]. */
export function eigen2Sym(a: number, b: number, d: number): SymEigen {
  if (Math.abs(b) < 1e-12) {
    return Math.abs(a) >= Math.abs(d)
      ? { values: [a, d], vectors: [[1, 0], [0, 1]] }
      : { values: [d, a], vectors: [[0, 1], [-1, 0]] }
  }
  const mid = (a + d) / 2
  const r = Math.sqrt(((a - d) / 2) ** 2 + b * b)
  const l1 = mid + r, l2 = mid - r
  const v1 = normalize([b, l1 - a])
  const v2: Vec2 = [-v1[1], v1[0]]
  return Math.abs(l1) >= Math.abs(l2) ? { values: [l1, l2], vectors: [v1, v2] } : { values: [l2, l1], vectors: [v2, [-v1[0], -v1[1]]] }
}

/**
 * Cyclic Jacobi eigen-decomposition of a symmetric 3x3 matrix.
 * Sorted by |value| descending; eigenvectors form a right-handed orthonormal basis.
 */
export function eigen3Sym(M: number[][]): SymEigen {
  const A = M.map((r) => [...r])
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) off += A[p][q] * A[p][q]
    if (off < 1e-22) break
    for (let p = 0; p < 3; p++) {
      for (let q = p + 1; q < 3; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q])
        const tt = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(tt * tt + 1), s = tt * c
        for (let k = 0; k < 3; k++) {
          const akp = A[k][p], akq = A[k][q]
          A[k][p] = c * akp - s * akq
          A[k][q] = s * akp + c * akq
        }
        for (let k = 0; k < 3; k++) {
          const apk = A[p][k], aqk = A[q][k]
          A[p][k] = c * apk - s * aqk
          A[q][k] = s * apk + c * aqk
        }
        for (let k = 0; k < 3; k++) {
          const vkp = V[k][p], vkq = V[k][q]
          V[k][p] = c * vkp - s * vkq
          V[k][q] = s * vkp + c * vkq
        }
      }
    }
  }
  const idx = [0, 1, 2].sort((i, j) => Math.abs(A[j][j]) - Math.abs(A[i][i]))
  const values = idx.map((i) => A[i][i])
  const vectors = idx.map((i) => [V[0][i], V[1][i], V[2][i]])
  // right-handed
  const [x, y, z] = vectors
  const det = x[0] * (y[1] * z[2] - y[2] * z[1]) - x[1] * (y[0] * z[2] - y[2] * z[0]) + x[2] * (y[0] * z[1] - y[1] * z[0])
  if (det < 0) vectors[2] = z.map((v) => -v)
  return { values, vectors }
}
