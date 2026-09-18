import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/** Number formatted for display / KaTeX; kills "-0" and float noise. */
export function fmt(x: number, d = 2): string {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : x < 0 ? '-\\infty' : '?'
  const v = +x.toFixed(d)
  return v === 0 ? '0' : String(v)
}

/** Signed term for polynomial display: "+ 2.5" / "- 2.5". */
export const signed = (x: number, d = 2) => `${x < 0 ? '-' : '+'} ${fmt(Math.abs(x), d)}`
