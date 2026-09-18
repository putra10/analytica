import { useEffect, useRef } from 'react'
import { apply, det2, type Eigen2, type Mat2, type Vec2 } from '../../lib/matrix-math'

interface Props {
  /** matrix currently drawn (interpolated during animation) */
  matrix: Mat2
  eigen: Eigen2
  testVec: Vec2
  onTestVec: (v: Vec2) => void
  /** index into eigen.vectors when the test vector is snapped, else null */
  snapped: number | null
  /** translation part c of the affine map x' = Bx + c */
  translation?: Vec2
  /** draw the unit circle / triangle and their images */
  showShapes?: boolean
}

const UNIT = 44 // px per unit
const HANDLE_R = 14

export function MatrixTransformCanvas({ matrix, eigen, testVec, onTestVec, snapped, translation = [0, 0], showShapes = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragging = useRef(false)
  const propsRef = useRef({ matrix, eigen, testVec, snapped, translation, showShapes })
  propsRef.current = { matrix, eigen, testVec, snapped, translation, showShapes }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr
      canvas.height = H * dpr
    }
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const { matrix: m, eigen: e, testVec: v, snapped: snap, translation: tr, showShapes } = propsRef.current
    const cx = W / 2, cy = H / 2
    const P = (p: Vec2): Vec2 => [cx + p[0] * UNIT, cy - p[1] * UNIT]
    /** affine image  Bx + c */
    const T = (p: Vec2): Vec2 => { const q = apply(m, p); return [q[0] + tr[0], q[1] + tr[1]] }
    const line = (a: Vec2, b: Vec2, color: string, width = 1, dash: number[] = []) => {
      ctx.beginPath()
      ctx.setLineDash(dash)
      ctx.strokeStyle = color
      ctx.lineWidth = width
      const pa = P(a), pb = P(b)
      ctx.moveTo(pa[0], pa[1])
      ctx.lineTo(pb[0], pb[1])
      ctx.stroke()
      ctx.setLineDash([])
    }
    const arrow = (vec: Vec2, color: string, width = 2.5, label?: string) => {
      const len = Math.hypot(vec[0], vec[1])
      if (len < 1e-6) return
      const tip = P(vec)
      const o = P([0, 0])
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = width
      ctx.moveTo(o[0], o[1])
      ctx.lineTo(tip[0], tip[1])
      ctx.stroke()
      const ang = Math.atan2(tip[1] - o[1], tip[0] - o[0])
      const hs = 9
      ctx.beginPath()
      ctx.moveTo(tip[0], tip[1])
      ctx.lineTo(tip[0] - hs * Math.cos(ang - 0.45), tip[1] - hs * Math.sin(ang - 0.45))
      ctx.lineTo(tip[0] - hs * Math.cos(ang + 0.45), tip[1] - hs * Math.sin(ang + 0.45))
      ctx.closePath()
      ctx.fill()
      if (label) {
        ctx.font = '600 13px ui-monospace, monospace'
        ctx.fillText(label, tip[0] + 8, tip[1] - 8)
      }
    }

    const N = Math.ceil(Math.max(W, H) / UNIT / 2) + 2
    const EXT = 3 * N

    // faint original grid
    for (let k = -N; k <= N; k++) {
      line([k, -N], [k, N], '#1e293b')
      line([-N, k], [N, k], '#1e293b')
    }
    // transformed grid (lines stay lines under a linear map)
    for (let k = -EXT; k <= EXT; k++) {
      const major = k === 0
      line(T([k, -EXT]), T([k, EXT]), major ? '#7dd3fc' : 'rgba(56,189,248,0.28)', major ? 1.5 : 1)
      line(T([-EXT, k]), T([EXT, k]), major ? '#c4b5fd' : 'rgba(167,139,250,0.28)', major ? 1.5 : 1)
    }

    if (showShapes) {
      // unit circle → ellipse, and an asymmetric "flag" triangle to show orientation
      const poly = (pts: Vec2[], color: string, fill: string) => {
        ctx.beginPath()
        pts.forEach((p, k) => { const q = P(p); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]) })
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()
      }
      const circle = Array.from({ length: 64 }, (_, k) => [Math.cos((k / 64) * Math.PI * 2), Math.sin((k / 64) * Math.PI * 2)] as Vec2)
      poly(circle, 'rgba(226,232,240,0.5)', 'transparent')
      poly(circle.map(T), '#f472b6', 'rgba(244,114,182,0.15)')
      const flag: Vec2[] = [[-2, -2], [-1, -2], [-2, -0.5]]
      poly(flag, 'rgba(226,232,240,0.5)', 'rgba(226,232,240,0.08)')
      poly(flag.map(T), '#fb923c', 'rgba(251,146,60,0.2)')
    }

    // det parallelogram (drawn at the image of the origin)
    const o = T([0, 0])
    const i = apply(m, [1, 0]), j = apply(m, [0, 1])
    const det = det2(m)
    const corners = [o, [o[0] + i[0], o[1] + i[1]], [o[0] + i[0] + j[0], o[1] + i[1] + j[1]], [o[0] + j[0], o[1] + j[1]]].map((p) => P(p as Vec2))
    ctx.beginPath()
    corners.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.fillStyle = det < 0 ? 'rgba(244,63,94,0.28)' : 'rgba(52,211,153,0.25)'
    ctx.fill()
    ctx.strokeStyle = det < 0 ? '#f43f5e' : '#34d399'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = det < 0 ? '#fda4af' : '#6ee7b7'
    ctx.font = '600 12px ui-monospace, monospace'
    const mid = P([o[0] + (i[0] + j[0]) / 2, o[1] + (i[1] + j[1]) / 2])
    ctx.fillText(`det = ${det.toFixed(2)}`, mid[0] + 6, mid[1])

    // eigen directions
    e.vectors.forEach((ev, k) => {
      const hot = snap === k
      line([-ev[0] * EXT, -ev[1] * EXT], [ev[0] * EXT, ev[1] * EXT], hot ? '#fde68a' : 'rgba(253,224,71,0.45)', hot ? 2 : 1, [6, 6])
    })

    // basis vectors (from the image of the origin)
    const arrowFrom = (from: Vec2, vec: Vec2, color: string, label: string) => {
      ctx.save(); ctx.translate(P(from)[0] - P([0, 0])[0], P(from)[1] - P([0, 0])[1]); arrow(vec, color, 3, label); ctx.restore()
    }
    arrowFrom(o, i, '#f59e0b', 'B î')
    arrowFrom(o, j, '#22c55e', 'B ĵ')
    if (tr[0] || tr[1]) { arrow(tr, '#94a3b8', 1.5, 'c'); }

    // test vector and its linear image (translation shown separately)
    const tv = apply(m, v)
    arrow(tv, '#e2e8f0', 2.5, 'B v')
    arrow(v, snap !== null ? '#fde047' : '#38bdf8', 2.5, 'v')

    // drag handle
    const tip = P(v)
    ctx.beginPath()
    ctx.arc(tip[0], tip[1], 6, 0, Math.PI * 2)
    ctx.fillStyle = snap !== null ? '#fde047' : '#0ea5e9'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()
    if (snap !== null) {
      ctx.beginPath()
      ctx.arc(tip[0], tip[1], 12, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(253,224,71,0.6)'
      ctx.stroke()
      ctx.fillStyle = '#fde047'
      ctx.font = '600 13px ui-monospace, monospace'
      ctx.fillText(`λ = ${e.values[snap].toFixed(2)}`, tip[0] + 14, tip[1] + 18)
    }
  }

  useEffect(draw, [matrix, eigen, testVec, snapped, translation, showShapes])
  useEffect(() => {
    const ro = new ResizeObserver(draw)
    ro.observe(canvasRef.current!)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toWorld = (e: React.PointerEvent<HTMLCanvasElement>): Vec2 => {
    const r = e.currentTarget.getBoundingClientRect()
    return [(e.clientX - r.left - r.width / 2) / UNIT, -(e.clientY - r.top - r.height / 2) / UNIT]
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full touch-none rounded-lg"
      style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
      onPointerDown={(e) => {
        const [x, y] = toWorld(e)
        const v = propsRef.current.testVec
        if (Math.hypot(x - v[0], y - v[1]) * UNIT <= HANDLE_R) {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
        }
      }}
      onPointerMove={(e) => dragging.current && onTestVec(toWorld(e))}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    />
  )
}
