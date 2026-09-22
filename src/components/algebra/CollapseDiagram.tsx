import type { ReactNode } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Tex } from '../ui/FormulaBlock'

export const HUES = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55%)`
export const TINT = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55% / 0.14)`

/** Unicode element labels → TeX (subscripts, superscripts, minus, spaces inside cycles). */
export const labelTex = (s: string) =>
  s.replace(/([₀-₉]+)/g, (m) => `_{${[...m].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('')}}`)
    .replace(/([⁰-⁹]+)/g, (m) => `^{${[...m].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`)
    .replace(/−/g, '-').replace(/ /g, '\\,')

/** A block on the left: one part of the domain, drawn with its elements inside. */
export interface Block {
  key: string | number
  /** TeX for the block's name */
  tex: string
  /** raw element labels listed inside the block */
  elems: string[]
  hue: string
  tint: string
  /** draws a ring and a tag, used to point out ker φ */
  tag?: string
}

/** A point on the right: one element of the codomain. */
export interface Target {
  key: string | number
  tex: string
  hue: string
  tint: string
  /** greyed out: in the codomain but outside the image */
  dimmed?: boolean
}

/**
 * The "collapsing" picture used for G/N and for a homomorphism: a domain split into blocks on the
 * left, an arrow carrying the map, and one point per block on the right. Stacks vertically on
 * phones, where the arrow turns to point down.
 */
export function CollapseDiagram({
  blocks, targets, mapTex, leftTex, rightTex, note, targetsWide,
}: {
  blocks: Block[]
  targets: Target[]
  mapTex: string
  leftTex: string
  rightTex: string
  note?: ReactNode
  /** lay the right-hand points out in a grid rather than a single column */
  targetsWide?: boolean
}) {
  return (
    <>
      <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-center text-[11px] text-slate-500"><Tex tex={leftTex} /></div>
          <div className="flex min-w-0 flex-wrap gap-1 rounded-[var(--radius-sm)] border border-border p-1">
            {blocks.map((b) => (
              <div
                key={b.key}
                className={cn('min-w-0 flex-1 basis-24 rounded-[var(--radius-sm)] border p-1.5', b.tag && 'ring-2 ring-slate-100/70')}
                style={{ background: b.tint, borderColor: b.hue }}
              >
                <div className="mb-1 flex min-w-0 flex-wrap items-center justify-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: b.hue }} />
                  <Tex tex={b.tex} className="text-[11px]" />
                  {b.tag && <span className="rounded-full bg-slate-100 px-1.5 text-[9px] font-semibold text-accent-ink">{b.tag}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-slate-400">
                  {b.elems.map((x, i) => <span key={i}>{x}</span>)}
                </div>
              </div>
            ))}
          </div>
          {note && <p className="mt-1 text-center text-[11px] text-slate-500">{note}</p>}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-slate-500">
          <Tex tex={mapTex} className="text-[11px]" />
          <ArrowDown size={18} className="sm:hidden" />
          <ArrowRight size={18} className="hidden sm:block" />
        </div>

        <div className={cn('min-w-0 shrink-0', targetsWide ? 'sm:w-56' : 'sm:w-40')}>
          <div className="mb-1 text-center text-[11px] text-slate-500"><Tex tex={rightTex} /></div>
          <div className={cn(
            'flex flex-wrap justify-center gap-x-3 gap-y-1 rounded-[var(--radius-sm)] border border-border p-2',
            !targetsWide && 'sm:flex-col sm:flex-nowrap sm:justify-start',
          )}>
            {targets.map((tg) => (
              <div key={tg.key} className={cn('flex min-w-0 items-center gap-1.5', tg.dimmed && 'opacity-35')}>
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border"
                  style={tg.dimmed
                    ? { background: 'transparent', borderColor: 'var(--color-border, #64748b)' }
                    : { background: tg.tint, borderColor: tg.hue }}
                />
                <Tex tex={tg.tex} className="text-[11px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
