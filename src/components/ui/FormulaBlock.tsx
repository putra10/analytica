import { useMemo } from 'react'
import katex from 'katex'
import { cn } from '../../lib/utils'

interface Props {
  tex: string
  block?: boolean
  className?: string
}

/** KaTeX wrapper. Inline by default; `block` renders display-mode math. */
export function Tex({ tex, block = false, className }: Props) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false, strict: false }),
    [tex, block],
  )
  return block ? (
    <div className={cn('tex-scroll min-w-0 max-w-full overflow-x-auto overscroll-x-contain py-1 text-slate-100', className)} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className={cn('text-slate-100', className)} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export const FormulaBlock = (p: Omit<Props, 'block'>) => <Tex block {...p} />
