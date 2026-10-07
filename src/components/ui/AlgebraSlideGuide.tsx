import { ALGEBRA_DECKS, ALGEBRA_PRACTICE } from '../../content/algebra-slide-guide'
import type { Section } from '../../content/summary'
import type { SummaryLesson, VisualKind } from '../../content/summary-lessons'
import { FormulaBlock } from './FormulaBlock'

type Lang = 'id' | 'en'
export function AlgebraSlideMap({ sec, lessons, lang, onPick }: { sec: Section; lessons: SummaryLesson[][]; lang: Lang; onPick: (part: number, entry: number) => void }) {
  const topics = lessons.flatMap((part, p) => part.map((lesson, e) => ({ kind: lesson.visual, p, e, title: sec.parts[p].entries[e].title })))
  return <details className="min-w-0 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5" data-algebra-slide-map>
    <summary className="cursor-pointer text-sm font-semibold text-slate-100">{lang === 'id' ? `Belajar mengikuti 15 berkas slide · ${topics.length} topik` : `Study the 15 slide files · ${topics.length} topics`}</summary>
    <p className="mt-3 max-w-[75ch] text-sm leading-7 text-slate-300">{lang === 'id' ? 'Mulai dari Bab 1, lalu pilih materi sesuai urutan kuliah. Ikuti cerita bergambar, baca definisi, buka penurunan, lalu kerjakan cek pemahaman sebelum melihat jawaban. Setiap berkas di folder referensi mempunyai topik yang dapat dibuka di bawah.' : 'Start with Chapter 1, then follow the lecture order. Walk through the picture story, read the definition, open the derivation, then try the knowledge check before revealing its answer. Every file in the reference folder has linked topics below.'}</p>
    <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
      {ALGEBRA_DECKS.map((deck, i) => <section key={deck.file} data-slide-file={deck.file} className="min-w-0 rounded-lg border border-border bg-card p-3">
        <h3 className="text-xs font-semibold leading-6 text-slate-100"><span className="mr-2 font-mono text-accent">{String(i + 1).padStart(2, '0')}</span>{deck.title[lang]}</h3>
        <div className="mt-2 flex flex-wrap gap-2">{deck.topics.map(kind => {
          const item = topics.find(topic => topic.kind === kind)
          return item && <button type="button" key={kind} onClick={() => onPick(item.p, item.e)} className="max-w-full rounded-lg border border-border px-2.5 py-2 text-left text-xs leading-5 text-slate-300 hover:border-accent hover:text-accent">{item.title[lang]}</button>
        })}</div>
      </section>)}
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-400">{lang === 'id' ? 'Cakupan mengikuti berkas yang tersedia, termasuk yang berlabel PREVIEW. Penjelasan memakai notasi ⊆ untuk subset yang boleh sama; komposisi permutasi dibaca kanan ke kiri.' : 'Coverage follows the supplied files, including those labeled PREVIEW. Explanations use ⊆ for subsets that may be equal; permutation composition is read right to left.'}</p>
  </details>
}

export function AlgebraSlidePractice({ kind, lang }: { kind: VisualKind; lang: Lang }) {
  const decks = ALGEBRA_DECKS.filter(deck => deck.topics.includes(kind))
  const exercises = ALGEBRA_PRACTICE[kind] ?? []
  return <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5" data-slide-practice={kind}>
    <p className="eyebrow">{lang === 'id' ? 'Bahan kuliah & latihan ujian' : 'Lecture material & exam practice'}</p>
    <p className="mt-2 text-xs leading-6 text-slate-400">{decks.map(deck => deck.title[lang]).join(' · ')}</p>
    {exercises.length > 0 && <div className="mt-4 space-y-3">{exercises.map((exercise, i) => <details key={i} className="min-w-0 rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold leading-7 text-slate-100">{i + 1}. {exercise.question[lang]}</summary>
      <p className="mt-3 text-sm leading-7 text-slate-300">{exercise.solution[lang]}</p>
      <div className="mt-3 min-w-0 overflow-x-auto"><FormulaBlock tex={exercise.tex} /></div>
    </details>)}</div>}
    {exercises.length === 0 && <p className="mt-3 text-sm leading-7 text-slate-300">{lang === 'id' ? 'Coba contoh bertahap dan cek pemahaman di atas tanpa melihat jawabannya. Jelaskan alasan setiap langkah dengan kata-katamu sendiri, lalu cocokkan.' : 'Try the worked example and knowledge check above before looking at the answer. Explain each step in your own words, then compare.'}</p>}
    <details className="mt-4 text-xs text-slate-400"><summary className="cursor-pointer">{lang === 'id' ? 'Berkas rujukan topik ini' : 'Source files for this topic'}</summary><ul className="mt-2 list-disc space-y-1 pl-4">{decks.map(deck => <li key={deck.file} className="break-all leading-6">{deck.file}</li>)}</ul></details>
  </section>
}
