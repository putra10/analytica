import type { ReactNode } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { cn } from '../../lib/utils'

interface Props {
  title?: ReactNode
  icon?: ReactNode
  /** small mono chip before the title, e.g. "01" */
  number?: string
  children: ReactNode
  className?: string
}

export function MathCard({ title, icon, number, children, className }: Props) {
  return (
    <section className={cn('rounded-[var(--radius)] border border-border bg-card p-4 shadow-[var(--shadow-sm)]', className)}>
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-tight text-slate-100">
          {number && <span className="section-number">{number}</span>}
          {icon && <span className="text-accent">{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}

/** Pill button used for presets / toggles (transitlab's mode chips). */
export function Chip({
  active, onClick, children, className, disabled,
}: { active?: boolean; onClick: () => void; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40',
        active
          ? 'border-slate-100 bg-slate-100 text-accent-ink'
          : 'border-border bg-card text-slate-300 hover:border-slate-700 hover:text-slate-100',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Labelled row with a toggle switch. */
export function Toggle({ label, checked, onChange, disabled }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-center justify-between gap-3 text-xs text-slate-300', disabled && 'pointer-events-none opacity-40')}>
      <span>{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="relative h-5 w-9 shrink-0 rounded-full bg-slate-700 transition-colors data-[state=checked]:bg-accent"
      >
        <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-[var(--surface)] shadow transition-transform data-[state=checked]:translate-x-4" />
      </Switch.Root>
    </label>
  )
}

/** Text field for user-typed formulas; red border when `invalid`. */
export function TextField({ value, onChange, placeholder, invalid, mono = true, className, onEnter }: { value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean; mono?: boolean; className?: string; onEnter?: () => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder}
      spellCheck={false}
      className={cn(
        'w-full rounded-[var(--radius-sm)] border bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500',
        mono && 'font-mono',
        invalid ? 'border-rose-300' : 'border-border focus:border-slate-700',
        className,
      )}
    />
  )
}
