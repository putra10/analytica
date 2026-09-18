import { useEffect, useRef, type PointerEvent } from 'react'
import type { Vec2 } from '../../lib/matrix-math'

export interface View2D {
  W: number
  H: number
  /** world → pixel */
  P: (p: Vec2) => Vec2
  /** pixel → world */
  Q: (px: Vec2) => Vec2
  unit: number
}

interface Props {
  /** pixels per world unit */
  unit: number
  /** world coordinates of the canvas centre */
  center?: Vec2
  draw: (ctx: CanvasRenderingContext2D, v: View2D) => void
  /** redraw when any of these change */
  deps: unknown[]
  onPointer?: (world: Vec2, phase: 'down' | 'move' | 'up', e: PointerEvent<HTMLCanvasElement>) => void
  className?: string
}

/** Fixed-scale 2D canvas with dpr handling; origin at the centre, y up. */
export function Canvas2D({ unit, center = [0, 0], draw, deps, onPointer, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  const view = (W: number, H: number): View2D => ({
    W, H, unit,
    P: (p) => [W / 2 + (p[0] - center[0]) * unit, H / 2 - (p[1] - center[1]) * unit],
    Q: (px) => [center[0] + (px[0] - W / 2) / unit, center[1] - (px[1] - H / 2) / unit],
  })

  const render = () => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = canvas.clientWidth, H = canvas.clientHeight
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr }
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    drawRef.current(ctx, view(W, H))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(render, deps)
  useEffect(() => {
    const ro = new ResizeObserver(render)
    ro.observe(ref.current!)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const world = (e: PointerEvent<HTMLCanvasElement>): Vec2 => {
    const r = e.currentTarget.getBoundingClientRect()
    return view(r.width, r.height).Q([e.clientX - r.left, e.clientY - r.top])
  }

  return (
    <canvas
      ref={ref}
      className={className ?? 'h-full w-full touch-none rounded-lg'}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer?.(world(e), 'down', e) }}
      onPointerMove={(e) => onPointer?.(world(e), 'move', e)}
      onPointerUp={(e) => onPointer?.(world(e), 'up', e)}
      onPointerCancel={(e) => onPointer?.(world(e), 'up', e)}
    />
  )
}

// ---------- drawing helpers ----------

export function drawGrid(ctx: CanvasRenderingContext2D, v: View2D, step = 1) {
  const [x0, y1] = v.Q([0, 0]), [x1, y0] = v.Q([v.W, v.H])
  ctx.lineWidth = 1
  for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
    const [px] = v.P([x, 0])
    ctx.strokeStyle = Math.abs(x) < 1e-9 ? '#475569' : '#1e293b'
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, v.H); ctx.stroke()
  }
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
    const [, py] = v.P([0, y])
    ctx.strokeStyle = Math.abs(y) < 1e-9 ? '#475569' : '#1e293b'
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(v.W, py); ctx.stroke()
  }
  ctx.fillStyle = '#64748b'
  ctx.font = '10px ui-monospace, monospace'
  const [ox, oy] = v.P([0, 0])
  for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) if (x !== 0 && Number.isInteger(x)) ctx.fillText(String(x), v.P([x, 0])[0] - 3, Math.min(Math.max(oy + 12, 12), v.H - 4))
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) if (y !== 0 && Number.isInteger(y)) ctx.fillText(String(y), Math.min(Math.max(ox + 4, 4), v.W - 14), v.P([0, y])[1] + 3)
}

/** Infinite line a x + b y + c = 0 clipped to the canvas. */
export function drawLine(ctx: CanvasRenderingContext2D, v: View2D, a: number, b: number, c: number, color: string, width = 1.5, dash: number[] = []) {
  const n2 = a * a + b * b
  if (n2 < 1e-12) return
  const foot: Vec2 = [(-a * c) / n2, (-b * c) / n2]
  const dir: Vec2 = [-b / Math.sqrt(n2), a / Math.sqrt(n2)]
  const L = (v.W + v.H) / v.unit
  const p1 = v.P([foot[0] - L * dir[0], foot[1] - L * dir[1]]), p2 = v.P([foot[0] + L * dir[0], foot[1] + L * dir[1]])
  ctx.setLineDash(dash)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke()
  ctx.setLineDash([])
}

export function drawPoint(ctx: CanvasRenderingContext2D, v: View2D, p: Vec2, color: string, label?: string, r = 5) {
  const [x, y] = v.P(p)
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color; ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke()
  if (label) { ctx.fillStyle = color; ctx.font = '600 12px ui-monospace, monospace'; ctx.fillText(label, x + 8, y - 8) }
}

export function drawSegments(ctx: CanvasRenderingContext2D, v: View2D, seg: number[], color: string, width = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  for (let i = 0; i + 3 < seg.length; i += 4) {
    const a = v.P([seg[i], seg[i + 1]]), b = v.P([seg[i + 2], seg[i + 3]])
    ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1])
  }
  ctx.stroke()
}
