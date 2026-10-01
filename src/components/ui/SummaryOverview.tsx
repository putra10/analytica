import type { Section } from '../../content/summary'
import type { SummaryLesson } from '../../content/summary-lessons'
import { TopicThumb } from './DerivationVisual'
import { Tex } from './FormulaBlock'
import { STORIES, StoryThumb } from './VisualStory'
import { cn } from '../../lib/utils'

/** Picture-first map of a course: every topic as a thumbnail with its key formula. */
export function SummaryOverview({ sec, lessons, lang, current, onPick, title, hint }: {
  sec: Section; lessons: SummaryLesson[][]; lang: 'id' | 'en'; current: [number, number]; onPick: (part: number, entry: number) => void; title: string; hint: string
}) {
  // Open on wide screens only; on phones the map would push the topic far below the fold.
  return <details open={window.matchMedia('(min-width: 1024px)').matches} className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
    <summary className="cursor-pointer text-sm font-semibold text-slate-100">{title}</summary>
    <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>
    <div className="mt-4 space-y-6">
      {sec.parts.map((part, i) => <section key={i} aria-label={part.title[lang]}>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300"><span className="font-mono text-accent">{String(i + 1).padStart(2, '0')}</span>{part.title[lang]}</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {part.entries.map((entry, j) => <button key={j} type="button" onClick={() => onPick(i, j)} aria-current={current[0] === i && current[1] === j ? 'true' : undefined}
            className={cn('min-w-0 overflow-hidden rounded-xl border text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', current[0] === i && current[1] === j ? 'border-accent bg-accent/10' : 'border-border bg-slate-900')}>
            {STORIES[lessons[i][j].visual] ? <StoryThumb kind={lessons[i][j].visual} lang={lang} /> : <TopicThumb kind={lessons[i][j].visual} lang={lang} />}
            <span className="block min-w-0 border-t border-border px-3 py-2">
              <span className="block text-xs font-semibold leading-snug text-slate-100">{entry.title[lang]}</span>
              <span className="mt-1 block overflow-x-auto text-[11px] text-slate-300"><Tex tex={entry.formulas[0]} /></span>
            </span>
          </button>)}
        </div>
      </section>)}
    </div>
  </details>
}
