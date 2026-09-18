import { useState } from 'react'
import { quadraticCoeffs, type QuadCoeffs } from '../../lib/expr'
import { useT } from '../../lib/i18n'
import { TextField } from './MathCard'

interface Props {
  placeholder: string
  /** receives the parsed coefficients; return an error message to reject */
  onApply: (c: QuadCoeffs) => string | null
  hint?: string
}

/** "Type the equation from the problem" field: parses a quadratic in x, y, z on Enter or blur. */
export function EquationField({ placeholder, onApply, hint }: Props) {
  const t = useT()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const apply = () => {
    if (!text.trim()) { setError(null); return }
    try {
      const err = onApply(quadraticCoeffs(text))
      setError(err)
    } catch (e) { setError((e as Error).message) }
  }
  return (
    <div>
      <label className="mb-1 block text-[11px] text-slate-500">{t('Tempel persamaan dari soal, lalu Enter:', 'Paste the equation from a problem, then Enter:')}</label>
      <TextField value={text} onChange={(v) => { setText(v); setError(null) }} onEnter={apply} placeholder={placeholder} invalid={!!error} />
      <p className="mt-1 text-[11px] text-slate-500">{error ? <span className="text-rose-300">{error}</span> : hint ?? t('Bentuk "… = …" atau "… = 0"; pangkat dengan ^, perkalian implisit (4xy).', 'Form "… = …" or "… = 0"; powers with ^, implicit products (4xy).')}</p>
    </div>
  )
}
