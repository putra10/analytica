import type { ReactNode } from 'react'
import * as RS from '@radix-ui/react-slider'
import { RotateCcw } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  /** shows a reset button when provided */
  defaultValue?: number
  disabled?: boolean
  format?: (v: number) => string
}

export function Slider({
  label, value, min, max, step = 0.01, onChange, defaultValue, disabled,
  format = (v) => v.toFixed(2),
}: Props) {
  return (
    <div className={cn('space-y-1.5', disabled && 'pointer-events-none opacity-40')}>
      <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
        <span className="min-w-0 text-slate-300">{label}</span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-slate-400">
          {format(value)}
          {defaultValue !== undefined && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              title="Reset"
              className="rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-slate-100"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </span>
      </div>
      <RS.Root
        className="relative flex h-4 w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      >
        <RS.Track className="relative h-1 grow rounded-full bg-slate-700/70">
          <RS.Range className="absolute h-full rounded-full bg-accent" />
        </RS.Track>
        <RS.Thumb className="block h-3.5 w-3.5 rounded-full border-2 border-accent bg-[var(--surface)] shadow transition-transform hover:scale-110 focus:outline-none" />
      </RS.Root>
    </div>
  )
}
