import type { ReactNode } from 'react'
import { Arrow, C, T, type P } from '../stories/kit'
import { compact, textW } from './pic-utils'
import { mul, range, type Group } from '../../lib/group-theory'
import { Tex } from '../ui/FormulaBlock'
import { cn } from '../../lib/utils'

/**
 * Drawing helpers for the algebra labs, in the style of the Summary picture stories (kit.tsx):
 * theme colours, haloed labels, round nodes, coloured tables and "bags".
 */

/** A round node, or a pill when the label is wider than the circle. */
export function Node({ at, label, fill, stroke = fill, r = 15, size = 14, ink, faint }: { at: P; label: string; fill: string; stroke?: string; r?: number; size?: number; ink?: string; faint?: boolean }) {
  const w = textW(label, size) + 12
  const color = ink ?? (fill === C.bg ? C.fg : C.bg)
  return (
    <g style={{ transition: 'all .45s', opacity: faint ? 0.35 : 1 }}>
      {w <= 2 * r ? <circle cx={at[0]} cy={at[1]} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
        : <rect x={at[0] - w / 2} y={at[1] - r} width={w} height={2 * r} rx={r} fill={fill} stroke={stroke} strokeWidth="2" />}
      <T halo={false} x={at[0]} y={at[1] + size / 3} size={size} weight={600} color={color}>{label}</T>
    </g>
  )
}

/** Arrow between two node centres, trimmed to their rims. */
export function Link({ p, q, color, width = 2.5, r1 = 17, r2 = 19, dash }: { p: P; q: P; color: string; width?: number; r1?: number; r2?: number; dash?: string }) {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, u = [(q[0] - p[0]) / d, (q[1] - p[1]) / d]
  return <Arrow from={[p[0] + u[0] * r1, p[1] + u[1] * r1]} to={[q[0] - u[0] * r2, q[1] - u[1] * r2]} color={color} width={width} dash={dash} head={9} />
}

/** Curved arrow p → q bending to the left of the direction of travel, trimmed by r at both ends. */
export function Bend({ p, q, color, bend = 0.25, r = 17, width = 2.5 }: { p: P; q: P; color: string; bend?: number; r?: number; width?: number }) {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
  const m: P = [(p[0] + q[0]) / 2 + ((q[1] - p[1]) * bend), (p[1] + q[1]) / 2 - ((q[0] - p[0]) * bend)]
  const trim = (a: P, b: P): P => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [a[0] + ((b[0] - a[0]) * r) / l, a[1] + ((b[1] - a[1]) * r) / l] }
  const s = trim(p, m), e = trim(q, m), ang = Math.atan2(e[1] - m[1], e[0] - m[0]), h = 9
  return (
    <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${s[0]},${s[1]} Q${m[0]},${m[1]} ${e[0]},${e[1]}`} />
      {d > 2 * r + 6 && <path d={`M${e[0] - h * Math.cos(ang - 0.45)},${e[1] - h * Math.sin(ang - 0.45)} L${e[0]},${e[1]} L${e[0] - h * Math.cos(ang + 0.45)},${e[1] - h * Math.sin(ang + 0.45)}`} />}
    </g>
  )
}

/**
 * The SVG frame every lab picture sits in: the stories' rounded surface card. `w` × `h` is the
 * drawing box; wide drawings (big tables) keep a readable minimum width and scroll sideways
 * inside their own wrapper instead of shrinking to nothing.
 */
export function Pic({ w = 480, h, label, children, minW, className }: { w?: number; h: number; label: string; children: ReactNode; minW?: number; className?: string }) {
  return (
    <div className={cn('min-w-0 max-w-full self-start overflow-x-auto overscroll-x-contain', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="mx-auto block h-auto w-full" style={{ minWidth: minW, maxWidth: Math.max(w * 1.35, 480), aspectRatio: `${w} / ${h}` }}>
        <rect x="1" y="1" width={w - 2} height={h - 2} rx="14" fill="var(--surface)" stroke="var(--border)" />
        {children}
      </svg>
    </div>
  )
}

/**
 * Operation table in the stories' style: muted headers, faint grid, cells tinted by `tone`.
 * Returns the picture with its natural size; `text(r, c)` is the cell label (empty to leave it bare).
 */
export function TablePic({ heads, text, tone, sym, label, title, maxCell = 46 }: {
  heads: string[]; text: (r: number, c: number) => string; tone?: (r: number, c: number) => string | undefined
  sym: string; label: string; title?: string; maxCell?: number
}) {
  const n = heads.length
  let longest = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) longest = Math.max(longest, textW(text(r, c), 12))
  heads.forEach((h) => { longest = Math.max(longest, textW(h, 12)) })
  const cell = Math.min(Math.max(24, Math.ceil(longest + 10)), maxCell)
  const size = (longest + 6 > cell ? Math.max(8, Math.floor((12 * (cell - 6)) / longest)) : 12)
  const top = title ? 34 : 12, x0 = 12, w = x0 * 2 + (n + 1) * cell, h = top + (n + 1) * cell + 12
  const ty = cell / 2 + size / 3
  return (
    <Pic w={Math.max(w, 120)} h={h} label={label} minW={Math.min(w, (n + 1) * 22 + 24)}>
      {title && <T x={x0 + 2} y={24} anchor="start" size={14} weight={700}>{title}</T>}
      <T x={x0 + cell / 2} y={top + ty} size={size + 1} weight={700} color={C.v}>{sym}</T>
      {heads.map((hd, i) => (
        <g key={i}>
          <T x={x0 + (i + 1.5) * cell} y={top + ty} size={size} weight={700} color={C.mu}>{hd}</T>
          <T x={x0 + cell / 2} y={top + (i + 1) * cell + ty} size={size} weight={700} color={C.mu}>{hd}</T>
        </g>
      ))}
      {heads.map((_, r) => heads.map((_, c) => {
        const tn = tone?.(r, c)
        return (
          <g key={`${r}-${c}`}>
            <rect x={x0 + (c + 1) * cell} y={top + (r + 1) * cell} width={cell} height={cell} fill={tn ?? 'none'} fillOpacity=".32" stroke={C.faint} style={{ transition: 'fill .45s' }}>
              <title>{`${heads[r]} ${sym} ${heads[c]} = ${text(r, c)}`}</title>
            </rect>
            <T x={x0 + (c + 1.5) * cell} y={top + (r + 1) * cell + ty} size={size} weight={tn ? 650 : 400} halo={false}>{text(r, c)}</T>
          </g>
        )
      }))}
    </Pic>
  )
}

/** Step-by-step working, numbered, each step a plain sentence and optionally one formula. */
export function Steps({ steps, className }: { steps: { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }[]; className?: string }) {
  return (
    <ol className={cn('min-w-0 space-y-2.5', className)}>
      {steps.map((s, i) => (
        <li key={i} className="flex min-w-0 gap-2.5">
          <span className={cn('mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]', s.tone === 'good' ? 'border-emerald-300 text-emerald-300' : s.tone === 'bad' ? 'border-rose-300 text-rose-300' : 'border-accent/60 text-accent')}>{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className={cn('text-[13px] leading-relaxed', s.tone === 'good' ? 'text-emerald-300' : s.tone === 'bad' ? 'text-rose-300' : 'text-slate-300')}>{s.text}</p>
            {s.tex && <div className="mt-1 min-w-0 overflow-x-auto rounded-lg border border-border bg-slate-900 px-2"><Tex block tex={s.tex} /></div>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Picture column on the left (theme-following card, like the Summary stories), controls on the right, theory below. */
export const LabLayout = ({ picture, controls, theory }: { picture: ReactNode; controls: ReactNode; theory: ReactNode }) => (
  <div className="min-w-0 space-y-4">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">{picture}</div>
      <div className="min-w-0">{controls}</div>
    </div>
    {theory}
  </div>
)

/** A titled picture card with a one-line caption under the drawing. */
export function PicCard({ eyebrow, title, caption, children, className }: { eyebrow?: ReactNode; title: ReactNode; caption?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 overflow-hidden rounded-[var(--radius)] border border-accent/50 bg-card shadow-[var(--shadow-sm)]', className)}>
      <div className="border-b border-border px-4 py-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h3 className="mt-0.5 text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="min-w-0 space-y-3 p-3 sm:p-4">
        {children}
        {caption && <p className="text-[13px] leading-relaxed text-slate-300">{caption}</p>}
      </div>
    </section>
  )
}

/** Cayley table of g; `order` lists the rows/columns (default 0..n−1), `tone(x)` colours a cell by its product x. */
export function CayleyPic({ g, order, tone, label, title, sym = '·' }: { g: Group; order?: number[]; tone?: (x: number) => string | undefined; label: string; title?: string; sym?: string }) {
  const o = order ?? range(g.order)
  return <TablePic heads={o.map((a) => compact(g.labels[a]))} text={(r, c) => compact(g.labels[mul(g, o[r], o[c])])} tone={tone && ((r, c) => tone(mul(g, o[r], o[c])))} sym={sym} label={label} title={title} />
}
