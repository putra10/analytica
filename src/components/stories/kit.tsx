import type { ReactNode } from 'react'
import type { Bilingual } from '../../content/summary-examples'

/** Shared drawing kit for picture stories. Every scene is a 480 × 300 SVG. */
export type Lang = 'id' | 'en'
export type P = [number, number]
export type Frame = { caption: Bilingual; tex?: string | Bilingual }
export type Story = {
  title: Bilingual
  frames: Frame[]
  control?: { label: Bilingual; min: number; max: number; step: number; initial: number }
  /** first frame at which the slider and readout apply (default 0) */
  controlFrom?: number
  draw: (frame: number, value: number, lang: Lang) => ReactNode
  readout?: (value: number) => string
}

export const C = { a: 'var(--accent)', r: 'var(--danger)', g: 'var(--success)', y: 'var(--warn)', v: 'var(--violet)', fg: 'var(--fg)', mu: 'var(--muted)', ln: 'var(--border-strong)', faint: 'var(--border)', soft: 'var(--accent-soft)', bg: 'var(--surface)' }
export const b = (id: string, en: string): Bilingual => ({ id, en })
export const f = (id: string, en: string, tex?: string | Bilingual): Frame => ({ caption: b(id, en), tex })
export const tr = (lang: Lang) => (id: string, en: string) => lang === 'id' ? id : en

/** Visible from frame `from` through frame `until`; fades so each step adds one idea. */
export const At = ({ from = 0, until = 99, frame, children }: { from?: number; until?: number; frame: number; children: ReactNode }) =>
  <g style={{ opacity: frame >= from && frame <= until ? 1 : 0, transition: 'opacity .45s ease' }}>{children}</g>

/** Text with a halo in the background color so it stays legible over grid lines. */
export const T = ({ x, y, children, color = C.fg, size = 16, anchor = 'middle', weight = 500, halo = true }: { x: number; y: number; children: ReactNode; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; halo?: boolean }) =>
  <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} stroke={halo ? C.bg : 'none'} strokeWidth={size / 4} strokeLinejoin="round" paintOrder="stroke">{children}</text>

export const Arrow = ({ from, to, color, width = 3, dash, head = 11 }: { from: P; to: P; color: string; width?: number; dash?: string; head?: number }) => {
  const a = Math.atan2(to[1] - from[1], to[0] - from[0])
  return <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={`M${from[0]},${from[1]} L${to[0]},${to[1]}`} strokeDasharray={dash} />
    {Math.hypot(to[0] - from[0], to[1] - from[1]) > head + 3 && <path d={`M${to[0] - head * Math.cos(a - .45)},${to[1] - head * Math.sin(a - .45)} L${to[0]},${to[1]} L${to[0] - head * Math.cos(a + .45)},${to[1] - head * Math.sin(a + .45)}`} />}
  </g>
}
export const Dot = ({ at, color, r = 6, hollow }: { at: P; color: string; r?: number; hollow?: boolean }) =>
  <circle cx={at[0]} cy={at[1]} r={r} fill={hollow ? C.bg : color} stroke={color} strokeWidth={hollow ? 2.5 : 0} />

export const pl = (pts: P[], close = false) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + (close ? ' Z' : '')
export const fn = (g: (t: number) => P, a: number, z: number, n = 90) => pl(Array.from({ length: n + 1 }, (_, i) => g(a + (z - a) * i / n)))
/** Math-oriented plane: x right, y up, `u` pixels per unit. */
export const plane = (o: P, u: number) => (x: number, y: number): P => [o[0] + u * x, o[1] - u * y]
/** Arc around c from math angle a0 to a1 (radians, counterclockwise positive). */
export const arc = (c: P, r: number, a0: number, a1: number) => {
  const p = (a: number) => `${(c[0] + r * Math.cos(a)).toFixed(1)},${(c[1] - r * Math.sin(a)).toFixed(1)}`
  return `M${p(a0)} A${r} ${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${a1 > a0 ? 0 : 1} ${p(a1)}`
}
export const RightAngle = ({ at, a, size = 10, color = C.mu }: { at: P; a: number; size?: number; color?: string }) => {
  const d = (t: number): P => [size * Math.cos(t), -size * Math.sin(t)], p = d(a), q = d(a + Math.PI / 2)
  return <path d={`M${at[0] + p[0]},${at[1] + p[1]} l${q[0]},${q[1]} l${-p[0]},${-p[1]}`} fill="none" stroke={color} strokeWidth="1.5" />
}

/** Faint unit grid and axes for a plane mapper over x ∈ [x0, x1], y ∈ [y0, y1]. */
export const Grid = ({ map, x, y, step = 1, axes = true, grid = true }: { map: (x: number, y: number) => P; x: [number, number]; y: [number, number]; step?: number; axes?: boolean; grid?: boolean }) => {
  const xs: number[] = [], ys: number[] = []
  for (let v = Math.ceil(x[0] / step) * step; v <= x[1]; v += step) xs.push(v)
  for (let v = Math.ceil(y[0] / step) * step; v <= y[1]; v += step) ys.push(v)
  return <g>
    {grid && xs.map(v => <path key={`x${v}`} d={pl([map(v, y[0]), map(v, y[1])])} stroke={C.faint} />)}
    {grid && ys.map(v => <path key={`y${v}`} d={pl([map(x[0], v), map(x[1], v)])} stroke={C.faint} />)}
    {axes && y[0] <= 0 && y[1] >= 0 && <path d={pl([map(x[0], 0), map(x[1], 0)])} stroke={C.ln} strokeWidth="1.4" />}
    {axes && x[0] <= 0 && x[1] >= 0 && <path d={pl([map(0, y[0]), map(0, y[1])])} stroke={C.ln} strokeWidth="1.4" />}
  </g>
}
/** Clip children to a rectangle. Ids only need to be unique per scene. */
export const Clip = ({ id, x, y, w, h, children }: { id: string; x: number; y: number; w: number; h: number; children: ReactNode }) =>
  <><defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} /></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></>
