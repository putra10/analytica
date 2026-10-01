import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { VisualKind } from '../../content/summary-lessons'
import type { Lang, Story } from '../stories/kit'
import { COMPLEX_STORIES } from '../stories/complex'
import { COMPLEX2_STORIES } from '../stories/complex2'
import { GEOMETRY_STORIES } from '../stories/geometry'
import { GEOMETRY2_STORIES } from '../stories/geometry2'
import { ALGEBRA_STORIES } from '../stories/algebra'
import { CONCEPTS as CA } from '../stories/concepts/complexA'
import { CONCEPTS as CB } from '../stories/concepts/complexB'
import { CONCEPTS as GA } from '../stories/concepts/geometryA'
import { CONCEPTS as GB } from '../stories/concepts/geometryB'
import { CONCEPTS as AA } from '../stories/concepts/algebraA'
import { CONCEPTS as AB } from '../stories/concepts/algebraB'
import { FormulaBlock } from './FormulaBlock'
import { cn } from '../../lib/utils'

export const STORIES: Partial<Record<VisualKind, Story>> = { ...COMPLEX_STORIES, ...COMPLEX2_STORIES, ...GEOMETRY_STORIES, ...GEOMETRY2_STORIES, ...ALGEBRA_STORIES }
/** Stories for the extra concept views, keyed "<kind>:<index>" into [...SUMMARY_CONCEPTS[kind], ...VISUAL_THEOREMS[kind]]. */
export const CONCEPT_STORIES: Record<string, Story> = { ...CA, ...CB, ...GA, ...GB, ...AA, ...AB }

const Scene = ({ story, frame, value, lang }: { story: Story; frame: number; value: number; lang: Lang }) =>
  <svg viewBox="0 0 480 300" role="img" aria-label={story.frames[frame].caption[lang]} className="h-auto w-full">
    <rect x="1" y="1" width="478" height="298" rx="14" fill="var(--surface)" stroke="var(--border)" />
    {story.draw(frame, value, lang)}
  </svg>

/** The finished picture of a story, for overview cards. */
export const StoryThumb = ({ kind, lang }: { kind: VisualKind; lang: Lang }) => {
  const story = STORIES[kind]
  return story ? <Scene story={story} frame={story.frames.length - 1} value={story.control?.initial ?? 0} lang={lang} /> : null
}

/** A picture told in steps: each frame adds one idea to the same drawing, with one plain sentence. */
export function VisualStory({ kind, lang }: { kind: VisualKind; lang: Lang }) {
  const story = STORIES[kind]
  return story ? <StoryPlayer story={story} lang={lang} /> : null
}

export function StoryPlayer({ story, lang }: { story: Story; lang: Lang }) {
  const [frame, setFrame] = useState(0)
  const [value, setValue] = useState(story.control?.initial ?? 0)
  const t = (id: string, en: string) => lang === 'id' ? id : en
  const cur = story.frames[frame], last = story.frames.length - 1, live = frame >= (story.controlFrom ?? 0)
  return <section className="min-w-0 overflow-hidden rounded-[var(--radius)] border border-accent/50 bg-card shadow-[var(--shadow-sm)]" aria-label={story.title[lang]}>
    <div className="border-b border-border px-4 py-3 sm:px-5">
      <p className="eyebrow">{t('Cerita bergambar', 'Picture story')}</p>
      <h3 className="mt-1 text-base font-semibold text-slate-100">{story.title[lang]}</h3>
    </div>
    <div className="grid min-w-0 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
      <div className="min-w-0">
        <Scene story={story} frame={frame} value={value} lang={lang} />
        {story.control && live && <label className="mt-3 block rounded-lg border border-accent/50 bg-slate-900 p-3 text-xs text-slate-300">
          <span className="flex justify-between gap-2"><span>{story.control.label[lang]}</span><output className="font-mono text-accent">{value}</output></span>
          <input type="range" aria-label={story.control.label[lang]} min={story.control.min} max={story.control.max} step={story.control.step} value={value} onChange={e => setValue(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
        </label>}
      </div>
      <div className="min-w-0 space-y-4" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-wide text-accent">{t('Langkah', 'Step')} {frame + 1} / {story.frames.length}</p>
        <p className="text-[15px] leading-7 text-slate-100">{cur.caption[lang]}</p>
        {cur.tex && <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-slate-900 px-3 py-1"><FormulaBlock tex={typeof cur.tex === 'string' ? cur.tex : cur.tex[lang]} /></div>}
        {story.readout && live && <div className="min-w-0 overflow-x-auto rounded-lg border border-border bg-slate-900 px-3 py-1"><FormulaBlock tex={story.readout(value)} /></div>}
        <div className="flex items-center gap-1.5" role="group" aria-label={t('Pilih langkah', 'Choose a step')}>
          {story.frames.map((_, i) => <button key={i} type="button" aria-label={`${t('Langkah', 'Step')} ${i + 1}`} aria-pressed={i === frame} onClick={() => setFrame(i)} className={cn('h-2.5 rounded-full transition-all', i === frame ? 'w-7 bg-accent' : 'w-2.5 bg-slate-600 hover:bg-slate-400')} />)}
        </div>
        <div className="flex justify-between gap-2">
          <button type="button" disabled={frame === 0} onClick={() => setFrame(frame - 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-slate-200 hover:border-accent disabled:opacity-35"><ChevronLeft size={14} />{t('Sebelumnya', 'Back')}</button>
          <button type="button" disabled={frame === last} onClick={() => setFrame(frame + 1)} className="inline-flex items-center gap-1 rounded-lg border border-accent bg-accent/10 px-3 py-2 text-xs font-semibold text-accent disabled:opacity-35">{t('Langkah berikutnya', 'Next step')}<ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  </section>
}
