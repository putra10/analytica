/**
 * Marching squares for the zero set of g on [x0,x1]×[y0,y1].
 * Returns flat segments [ax, ay, bx, by, ...].
 * ponytail: saddle cells (4 crossings) paired naively; fine at these resolutions.
 */
export function marchingSquares(
  g: (x: number, y: number) => number,
  x0: number, x1: number, y0: number, y1: number,
  N = 160,
): number[] {
  const hx = (x1 - x0) / N, hy = (y1 - y0) / N
  const vals = new Float64Array((N + 1) * (N + 1))
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) vals[i * (N + 1) + j] = g(x0 + i * hx, y0 + j * hy)
  const out: number[] = []
  const pts: number[] = []
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const v00 = vals[i * (N + 1) + j], v10 = vals[(i + 1) * (N + 1) + j]
      const v01 = vals[i * (N + 1) + j + 1], v11 = vals[(i + 1) * (N + 1) + j + 1]
      if (!Number.isFinite(v00 + v10 + v01 + v11)) continue
      const sx = x0 + i * hx, sy = y0 + j * hy
      pts.length = 0
      const edge = (va: number, vb: number, ax: number, ay: number, bx: number, by: number) => {
        if ((va < 0) !== (vb < 0)) {
          const k = va / (va - vb)
          pts.push(ax + (bx - ax) * k, ay + (by - ay) * k)
        }
      }
      edge(v00, v10, sx, sy, sx + hx, sy)
      edge(v10, v11, sx + hx, sy, sx + hx, sy + hy)
      edge(v11, v01, sx + hx, sy + hy, sx, sy + hy)
      edge(v01, v00, sx, sy + hy, sx, sy)
      for (let k = 0; k + 3 < pts.length; k += 4) out.push(pts[k], pts[k + 1], pts[k + 2], pts[k + 3])
    }
  }
  return out
}
