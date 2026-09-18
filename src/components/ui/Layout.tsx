import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/** The always-dark visualization stage (like the camera panel in ASL Transcriber). */
export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('stage h-[420px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-stage)] sm:h-[540px]', className)}>{children}</div>
)

/** Canvas left, controls right, theory full-width below. */
export const Layout = ({ canvas, controls, theory }: { canvas: ReactNode; controls: ReactNode; theory: ReactNode }) => (
  <div className="space-y-4">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Panel>{canvas}</Panel>
      <div>{controls}</div>
    </div>
    {theory}
  </div>
)

/** Small labelled numeric input used for coefficient grids. */
export function NumInput({ label, value, onChange, step = 0.1, className }: { label: ReactNode; value: number; onChange: (v: number) => void; step?: number; className?: string }) {
  return (
    <label className={cn('flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-slate-900 px-2 py-1 focus-within:border-slate-700', className)}>
      <span className="shrink-0 font-mono text-[11px] text-slate-500">{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isInteger(value) ? value : +value.toFixed(4)}
        onChange={(e) => { const v = parseFloat(e.target.value); onChange(Number.isFinite(v) ? v : 0) }}
        className="w-full min-w-0 bg-transparent font-mono text-sm text-slate-100 outline-none"
      />
    </label>
  )
}
