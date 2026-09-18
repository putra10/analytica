import { add3, cross3, dot3, norm3, scale3, sub3, unit3, type Vec3 } from './quadrics'

/** Straight line  r = r0 + λ v  (Vaisman 2.2) */
export interface Line3 {
  p: Vec3
  v: Vec3
}

/** Plane  A x + B y + C z + D = 0 */
export interface Plane3 {
  n: Vec3
  D: number
}

const EPS = 1e-9

export const distPointPlane = (p: Vec3, pl: Plane3) => Math.abs(dot3(pl.n, p) + pl.D) / norm3(pl.n)

/** Foot of the perpendicular from p onto the plane. */
export const projectOnPlane = (p: Vec3, pl: Plane3): Vec3 => sub3(p, scale3(pl.n, (dot3(pl.n, p) + pl.D) / dot3(pl.n, pl.n)))

export const distPointLine = (p: Vec3, l: Line3) => norm3(cross3(sub3(p, l.p), l.v)) / norm3(l.v)

export interface LinePlane {
  relation: 'intersect' | 'parallel' | 'contained'
  point?: Vec3
  /** angle between the line and the plane, rad */
  angle: number
}

export function linePlane(l: Line3, pl: Plane3): LinePlane {
  const nv = dot3(pl.n, l.v)
  const angle = Math.asin(Math.min(1, Math.abs(nv) / (norm3(pl.n) * norm3(l.v))))
  if (Math.abs(nv) < EPS) return { relation: Math.abs(dot3(pl.n, l.p) + pl.D) < EPS ? 'contained' : 'parallel', angle }
  const t = -(dot3(pl.n, l.p) + pl.D) / nv
  return { relation: 'intersect', point: add3(l.p, scale3(l.v, t)), angle }
}

export interface TwoLines {
  relation: 'intersect' | 'parallel' | 'coincident' | 'skew'
  point?: Vec3
  /** shortest distance */
  distance: number
  /** endpoints of the common perpendicular (skew case) */
  perpendicular?: [Vec3, Vec3]
  /** angle between direction vectors, rad, in [0, π/2] */
  angle: number
}

/** Relative position of two lines (Vaisman 2.3). */
export function twoLines(l1: Line3, l2: Line3): TwoLines {
  const w = sub3(l2.p, l1.p)
  const c = cross3(l1.v, l2.v)
  const angle = Math.acos(Math.min(1, Math.abs(dot3(l1.v, l2.v)) / (norm3(l1.v) * norm3(l2.v))))
  if (norm3(c) < EPS) {
    const d = distPointLine(l2.p, l1)
    return { relation: d < EPS ? 'coincident' : 'parallel', distance: d, angle }
  }
  const triple = dot3(w, c)
  // (p1 + s v1 − p2 − u v2) ⟂ v1, v2   ⇒  2x2 system in (s, u)
  const a = dot3(l1.v, l1.v), b = dot3(l1.v, l2.v), d = dot3(l2.v, l2.v)
  const e = dot3(w, l1.v), f = dot3(w, l2.v)
  const det = a * d - b * b
  const s = (e * d - b * f) / det, u = (b * e - a * f) / det
  const P1 = add3(l1.p, scale3(l1.v, s)), P2 = add3(l2.p, scale3(l2.v, u))
  if (Math.abs(triple) < EPS) return { relation: 'intersect', point: P1, distance: 0, angle }
  return { relation: 'skew', distance: Math.abs(triple) / norm3(c), perpendicular: [P1, P2], angle }
}

export const anglePlanes = (a: Plane3, b: Plane3) => Math.acos(Math.min(1, Math.abs(dot3(a.n, b.n)) / (norm3(a.n) * norm3(b.n))))

export interface TwoPlanes {
  relation: 'intersect' | 'parallel' | 'coincident'
  line?: Line3
  angle: number
  distance: number
}

export function twoPlanes(a: Plane3, b: Plane3): TwoPlanes {
  const v = cross3(a.n, b.n)
  const angle = anglePlanes(a, b)
  if (norm3(v) < EPS) {
    // parallel: distance between them
    const p = scale3(a.n, -a.D / dot3(a.n, a.n))
    const dist = distPointPlane(p, b)
    return { relation: dist < EPS ? 'coincident' : 'parallel', angle, distance: dist }
  }
  // a point on both planes: solve with the third equation v·r = 0
  const M = [a.n, b.n, v]
  const rhs: Vec3 = [-a.D, -b.D, 0]
  const det = dot3(M[0], cross3(M[1], M[2]))
  const p: Vec3 = [
    dot3(rhs, cross3(M[1], M[2])) / det,
    dot3(M[0], cross3(rhs, M[2])) / det,
    dot3(M[0], cross3(M[1], rhs)) / det,
  ]
  return { relation: 'intersect', line: { p, v: unit3(v) }, angle, distance: 0 }
}

/** Plane through three non-collinear points. */
export function planeThrough(a: Vec3, b: Vec3, c: Vec3): Plane3 {
  const n = cross3(sub3(b, a), sub3(c, a))
  return { n, D: -dot3(n, a) }
}
