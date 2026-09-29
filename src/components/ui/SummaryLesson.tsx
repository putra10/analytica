import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react'
import type { SummaryLesson as Lesson } from '../../content/summary-lessons'
import type { WorkedExample } from '../../content/summary-examples'
import type { Entry } from '../../content/summary'
import { SUMMARY_DEFINITIONS } from '../../content/summary-definitions'
import { VISUAL_THEOREMS } from '../../content/summary-theorems'
import { SUMMARY_CONCEPTS } from '../../content/summary-concepts'
import { TheoremMiniLab } from './TheoremMiniLab'
import { DerivationVisual } from './DerivationVisual'
import { FormulaBlock } from './FormulaBlock'
import { cn } from '../../lib/utils'

export function SummaryLesson({ lesson, example, entry, lang, theoremExplorer }: { lesson: Lesson; example: WorkedExample; entry: Entry; lang: 'id' | 'en'; theoremExplorer?:ReactNode }) {
  const [stage, setStage] = useState(0)
  const [mode, setMode] = useState<'definition' | 'derivation'>('definition')
  const t = (id: string, en: string) => lang === 'id' ? id : en
  const step = lesson.steps[stage]
  const definition = SUMMARY_DEFINITIONS[lesson.visual]
  const concepts=[...SUMMARY_CONCEPTS[lesson.visual],...(VISUAL_THEOREMS[lesson.visual]??[])]
  const [concept,setConcept]=useState(-1)
  return <article className="min-w-0 space-y-6" data-lesson={lesson.visual}>
    <section className="min-w-0 rounded-xl border border-accent/40 bg-accent/5 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{t('Penjelasan visual dalam topik ini','Visual explanations in this topic')} · {1+concepts.length+(theoremExplorer?1:0)}</h3>
      <p className="mt-2 text-xs leading-6 text-slate-300">{t('Setiap pilihan memiliki gambar, alasan matematis, syarat, dan contoh sendiri.','Each choice has its own picture, mathematical reasoning, conditions, and example.')}</p>
      <label className="mt-3 block text-xs text-slate-400">{t('Konsep untuk divisualisasikan','Concept to visualize')}
        <select value={concept} onChange={e=>setConcept(Number(e.target.value))} className="mt-2 w-full min-w-0 rounded-lg border border-border bg-slate-900 p-3 text-sm text-slate-100">
          <option value={-1}>{definition.name[lang]}</option>
          {concepts.map((item,i)=><option key={i} value={i}>{item.title[lang]}</option>)}
          {theoremExplorer&&<option value={concepts.length}>{t('Korespondensi & tiga teorema isomorfisma','Correspondence & three isomorphism theorems')}</option>}
        </select>
      </label>
      <div className="mt-3 hidden flex-wrap gap-2 md:flex">
        {[definition.name[lang],...concepts.map(item=>item.title[lang]),...(theoremExplorer?[t('Korespondensi & isomorfisma','Correspondence & isomorphisms')]:[])].map((name,i)=><button type="button" key={i} aria-pressed={concept===i-1} onClick={()=>setConcept(i-1)} className={cn('rounded-lg border px-3 py-2 text-left text-xs leading-5',concept===i-1?'border-accent bg-accent/15 text-slate-100':'border-border bg-card text-slate-300')}>{name}</button>)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <button type="button" disabled={concept===-1} onClick={()=>setConcept(concept-1)} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-slate-300 disabled:opacity-40"><ChevronLeft size={14}/>{t('Konsep sebelumnya','Previous concept')}</button>
        <button type="button" disabled={concept===concepts.length-(theoremExplorer?0:1)} onClick={()=>setConcept(concept+1)} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-slate-300 disabled:opacity-40">{t('Konsep berikutnya','Next concept')}<ChevronRight size={14}/></button>
      </div>
    </section>
    {concept>=0?(concept===concepts.length?theoremExplorer:<TheoremMiniLab theorems={concepts} selectedIndex={concept} lang={lang}/>):<>
    <div>
      <p className="eyebrow">{t('Pertanyaan yang dijawab', 'The question we are answering')}</p>
      <h3 className="font-display mt-2 text-[clamp(22px,3vw,30px)] leading-snug text-slate-100">{lesson.question[lang]}</h3>
    </div>
    <section className="min-w-0 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[var(--shadow-sm)]" aria-label={t('Definisi dan penurunan visual', 'Visual definition and derivation')}>
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('Definisi atau penurunan', 'Definition or derivation')}>
          <button type="button" aria-pressed={mode==='definition'} onClick={()=>setMode('definition')} className={cn('rounded-lg border px-3 py-2 text-sm font-semibold',mode==='definition'?'border-accent bg-accent/10 text-slate-100':'border-border text-slate-400')}>{t('Definisi & gambar','Definition & picture')}</button>
          <button type="button" aria-pressed={mode==='derivation'} onClick={()=>setMode('derivation')} className={cn('rounded-lg border px-3 py-2 text-sm font-semibold',mode==='derivation'?'border-accent bg-accent/10 text-slate-100':'border-border text-slate-400')}>{t('Dari mana rumusnya?','Where does the formula come from?')}</button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{mode==='definition'?t('Kenali objek dan arti simbolnya dahulu, lalu buka penurunan untuk memahami hubungan matematikanya.','First identify the objects and symbols, then open the derivation to understand the mathematical relationship.'):t('Ikuti alasan dan gambar bersamaan. Setiap langkah menghasilkan langkah berikutnya.', 'Follow the reasoning and picture together. Each step leads to the next.')}</p>
        {mode==='derivation'&&<div className="mt-4 grid gap-2 sm:grid-cols-3" role="group" aria-label={t('Pilih langkah penjelasan', 'Choose an explanation step')}>
          {lesson.steps.map((item, i) => <button key={i} type="button" aria-pressed={stage === i} onClick={() => setStage(i)} className={cn('flex items-start gap-2 rounded-lg border p-3 text-left text-xs leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent', stage === i ? 'border-accent bg-accent/10 text-slate-100' : 'border-border text-slate-400 hover:bg-slate-900 hover:text-slate-100')}>
            <span className="font-mono text-accent">0{i + 1}</span><span>{item.title[lang]}</span>
          </button>)}
        </div>}
      </div>
      <div className="grid min-w-0 gap-5 p-4 sm:p-5 xl:grid-cols-2 xl:items-start">
        <DerivationVisual kind={lesson.visual} stage={mode==='definition'?2:stage} lang={lang} />
        <div className="min-w-0 space-y-4" aria-live="polite" aria-atomic="true">
          <p className="font-mono text-[11px] uppercase tracking-wide text-accent">{mode==='definition'?t('Apa artinya?','What does it mean?'):`${t('Langkah', 'Step')} ${stage + 1} / ${lesson.steps.length}`}</p>
          <h5 className="text-lg font-semibold text-slate-100">{mode==='definition'?definition.name[lang]:step.title[lang]}</h5>
          <p className="text-sm leading-7 text-slate-300">{mode==='definition'?definition.text[lang]:step.text[lang]}</p>
          <div className="min-w-0 rounded-lg border border-border bg-slate-900 p-3"><FormulaBlock tex={mode==='definition'?definition.tex:step.tex} /></div>
          {mode==='definition'?<>
            <p className="text-sm leading-7 text-slate-300"><span className="font-semibold text-accent">{t('Cara membaca gambar: ','How to read the picture: ')}</span>{definition.picture[lang]}</p>
            <button type="button" onClick={()=>{setMode('derivation');setStage(0)}} className="inline-flex items-center gap-1 rounded-lg border border-accent px-3 py-2 text-xs text-accent">{t('Ikuti penurunannya','Follow the derivation')}<ChevronRight size={14} /></button>
          </>:<div className="flex items-center justify-between gap-2 pt-2">
            <button type="button" onClick={() => setStage(stage - 1)} disabled={stage === 0} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-slate-200 hover:border-accent disabled:cursor-default disabled:opacity-35"><ChevronLeft size={14} />{t('Sebelumnya', 'Previous')}</button>
            <button type="button" onClick={() => setStage(stage + 1)} disabled={stage === lesson.steps.length - 1} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-slate-200 hover:border-accent disabled:cursor-default disabled:opacity-35">{t('Berikutnya', 'Next')}<ChevronRight size={14} /></button>
          </div>}
        </div>
      </div>
    </section>
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5" aria-label={t('Syarat dan batas penggunaan', 'Conditions and limits')}>
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-100"><CheckCircle2 size={17} className="text-accent" />{t('Kapan rumus ini boleh digunakan?', 'When can you use this formula?')}</h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">{lesson.conditions.map((condition, i) => <li key={i}>{condition[lang]}</li>)}</ul>
      <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
        <p className="flex items-start gap-2 text-xs font-semibold text-amber-400"><AlertTriangle size={15} className="shrink-0" />{t('Apa yang gagal jika syaratnya hilang?', 'What fails when a condition is missing?')}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{lesson.failure[lang]}</p>
      </div>
    </section>
    <section className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5" aria-label={t('Contoh lengkap', 'Worked example')}>
      <h4 className="text-sm font-semibold text-slate-100">{t('Contoh: dari soal sampai makna hasil', 'Example: from the question to its meaning')}</h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{example.prompt[lang]}</p>
      <ol className="mt-4 space-y-4">{lesson.exampleSteps.map((item, i) => <li key={i} className="min-w-0 border-l-2 border-accent/50 pl-4">
        <p className="text-sm font-semibold text-slate-100">{i + 1}. {item.title[lang]}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.text[lang]}</p>
        <div className="mt-2 min-w-0 rounded-lg bg-slate-900 px-3 py-2"><FormulaBlock tex={item.tex} /></div>
      </li>)}</ol>
      <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-slate-300"><span className="font-semibold text-accent">{t('Maknanya: ', 'What it means: ')}</span>{example.reading[lang]}</p>
    </section>
    <details className="rounded-[var(--radius)] border border-accent/35 bg-accent/5 p-4 sm:p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-100">{t('Coba jelaskan sebelum membuka jawaban', 'Try explaining before revealing the answer')}<span className="mt-2 block text-sm font-normal leading-relaxed text-slate-300">{lesson.check.question[lang]}</span></summary>
      <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-slate-300">{lesson.check.answer[lang]}</p>
    </details>
    <details className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
      <summary className="cursor-pointer text-sm font-semibold text-slate-300"><BookOpen size={15} className="mr-2 inline" />{t('Hubungkan kembali ke rumus dan istilah buku', 'Connect back to the textbook formulas and terminology')}</summary>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{entry.intuition[lang]}</p>
      <div className="mt-3 min-w-0 rounded-lg bg-slate-900 px-3 py-2">{entry.formulas.map((tex, i) => <FormulaBlock key={i} tex={tex} />)}</div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{entry.insight[lang]}</p>
      {entry.pitfall && <p className="mt-3 text-sm leading-relaxed text-amber-400">{entry.pitfall[lang]}</p>}
    </details>
    </>}
  </article>
}
