import type { Vec2 } from './matrix-math'

/** General equation of a circle (Vaisman 3.1.3):  x² + y² − 2αx − 2βy + σ = 0,  centre (α, β), ρ² = α² + β² − σ */
export interface Circle {
  alpha: number
  beta: number
  sigma: number
}

export const fromCentre = (cx: number, cy: number, r: number): Circle => ({ alpha: cx, beta: cy, sigma: cx * cx + cy * cy - r * r })
export const radius2 = (c: Circle) => c.alpha * c.alpha + c.beta * c.beta - c.sigma
export const radius = (c: Circle) => Math.sqrt(Math.max(radius2(c), 0))
export const isReal = (c: Circle) => radius2(c) > 0

/** Power of M with respect to Γ (Prop. 3.1.9): the left-hand side evaluated at M. */
export const power = (c: Circle, m: Vec2) => m[0] * m[0] + m[1] * m[1] - 2 * c.alpha * m[0] - 2 * c.beta * m[1] + c.sigma

/** A line  a x + b y + c = 0 */
export interface Line2 {
  a: number
  b: number
  c: number
}

/** Polar line of M0 (polarisation 3.1.21):  x x0 + y y0 − α(x + x0) − β(y + y0) + σ = 0 */
export const polar = (c: Circle, m: Vec2): Line2 => ({ a: m[0] - c.alpha, b: m[1] - c.beta, c: c.sigma - c.alpha * m[0] - c.beta * m[1] })

/** Radical axis of two circles: equal power. */
export const radicalAxis = (c1: Circle, c2: Circle): Line2 => ({ a: 2 * (c2.alpha - c1.alpha), b: 2 * (c2.beta - c1.beta), c: c1.sigma - c2.sigma })

/** Member λΓ1 + (1 − λ)Γ2 of the pencil (normalised so the x² + y² coefficient stays 1). */
export const pencil = (c1: Circle, c2: Circle, l: number): Circle => ({
  alpha: l * c1.alpha + (1 - l) * c2.alpha,
  beta: l * c1.beta + (1 - l) * c2.beta,
  sigma: l * c1.sigma + (1 - l) * c2.sigma,
})

/** Intersection points of a line with a circle (the contact points of the tangents through the pole of the line). */
export function lineCircle(l: Line2, c: Circle): Vec2[] {
  // parametrise the line by its foot point + direction
  const n2 = l.a * l.a + l.b * l.b
  if (n2 < 1e-12) return []
  const foot: Vec2 = [(-l.a * l.c) / n2, (-l.b * l.c) / n2]
  const dir: Vec2 = [-l.b / Math.sqrt(n2), l.a / Math.sqrt(n2)]
  // (foot + t dir − centre)² = ρ²
  const dx = foot[0] - c.alpha, dy = foot[1] - c.beta
  const bq = dx * dir[0] + dy * dir[1]
  const cq = dx * dx + dy * dy - radius2(c)
  const disc = bq * bq - cq
  if (disc < 0) return []
  const r = Math.sqrt(disc)
  return [-bq + r, -bq - r].map((t) => [foot[0] + t * dir[0], foot[1] + t * dir[1]] as Vec2)
}

/** Intersection of two circles = intersection of either with the radical axis. */
export const circleCircle = (c1: Circle, c2: Circle) => lineCircle(radicalAxis(c1, c2), c1)

/** Tangent lines from M0 to Γ (only when M0 is exterior). */
export function tangentsFrom(c: Circle, m: Vec2): Vec2[] {
  if (power(c, m) <= 0) return []
  return lineCircle(polar(c, m), c)
}
