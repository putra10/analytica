import { useState } from 'react'
import type { Step } from '../../lib/studio'
import { useT } from '../../lib/i18n'
import { Tex } from '../ui/FormulaBlock'

/** Expandable hand-style working for one Studio row. KaTeX renders only while open. */
export function StepsPanel({ steps }: { steps: Step[] }) {
  const t = useT(), [open, setOpen] = useState(false)
  return (
    <details className="studio-steps" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{t('Langkah', 'Steps')} <span>({steps.length})</span></summary>
      {open && (
        <ol>
          {steps.map((s, i) => (
            <li key={i}>
              {s.text && <p>{t(s.text.id, s.text.en)}</p>}
              {s.tex && <Tex block tex={s.tex} />}
            </li>
          ))}
        </ol>
      )}
    </details>
  )
}
