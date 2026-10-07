import { GEOMETRY_DECKS, GEOMETRY_PRACTICE } from '../../content/geometry-slide-topics'
import type { Section } from '../../content/summary'
import type { SummaryLesson, VisualKind } from '../../content/summary-lessons'
import { FormulaBlock } from './FormulaBlock'

type Lang = 'id' | 'en'
export function GeometrySlideMap({ sec, lessons, lang, onPick }: { sec: Section; lessons: SummaryLesson[][]; lang: Lang; onPick: (part: number, entry: number) => void }) {
  const topics = lessons.flatMap((part, p) => part.map((lesson, e) => ({ kind: lesson.visual, p, e, title: sec.parts[p].entries[e].title })))
  return <details className="min-w-0 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5" data-geometry-slide-map>
    <summary className="cursor-pointer text-sm font-semibold text-slate-100">{lang === 'id' ? `Belajar mengikuti ${GEOMETRY_DECKS.length} berkas slide · ${topics.length} topik` : `Study the ${GEOMETRY_DECKS.length} slide files · ${topics.length} topics`}</summary>
    <p className="mt-3 max-w-[75ch] text-sm leading-7 text-slate-300">{lang === 'id' ? 'Ikuti urutan kuliah dari insidensi dan vektor sampai transformasi. Mulai dengan gambarnya, baca definisi, lalu ikuti alasan setiap langkah. Coba contoh dan cek pemahaman sebelum membuka jawaban; perhatikan syarat agar rumus berlaku.' : 'Follow the lecture order from incidence and vectors through transformations. Start with the picture, read the definition, then follow the reason for each step. Try the example and knowledge check before revealing the answer; pay attention to when each formula applies.'}</p>
    <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
      {GEOMETRY_DECKS.map((deck, i) => <section key={deck.file} data-slide-file={deck.file} className="min-w-0 rounded-lg border border-border bg-card p-3">
        <h3 className="text-xs font-semibold leading-6 text-slate-100"><span className="mr-2 font-mono text-accent">{String(i + 1).padStart(2, '0')}</span>{deck.title[lang]}</h3>
        <div className="mt-2 flex flex-wrap gap-2">{deck.topics.map(kind => {
          const item = topics.find(topic => topic.kind === kind)
          return item && <button type="button" key={kind} onClick={() => onPick(item.p, item.e)} className="max-w-full rounded-lg border border-border px-2.5 py-2 text-left text-xs leading-5 text-slate-300 hover:border-accent hover:text-accent">{item.title[lang]}</button>
        })}</div>
      </section>)}
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-400">{lang === 'id' ? 'Gambar 3D memakai proyeksi ke layar; ukuran dan ketegaklurusan dibaca dari koordinat dan persamaannya. Notasi dan syarat dijelaskan di tiap topik; hasil contoh diperiksa dengan substitusi atau sifat geometrinya.' : 'The 3D pictures are projections onto the screen; read lengths and perpendicularity from their coordinates and equations. Each topic explains its notation and hypotheses; examples are checked by substitution or their geometric properties.'}</p>
  </details>
}

export function GeometrySlidePractice({ kind, lang }: { kind: VisualKind; lang: Lang }) {
  const decks = GEOMETRY_DECKS.filter(deck => deck.topics.includes(kind))
  const exercises = GEOMETRY_PRACTICE[kind] ?? []
  return <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5" data-slide-practice={kind}>
    <p className="eyebrow">{lang === 'id' ? 'Bahan kuliah & latihan ujian' : 'Lecture material & exam practice'}</p>
    <p className="mt-2 text-xs leading-6 text-slate-400">{decks.map(deck => deck.title[lang]).join(' · ')}</p>
    {exercises.length > 0 && <div className="mt-4 space-y-3">{exercises.map((exercise, i) => <details key={i} className="min-w-0 rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold leading-7 text-slate-100">{i + 1}. {exercise.question[lang]}</summary>
      <p className="mt-3 text-sm leading-7 text-slate-300">{exercise.solution[lang]}</p>
      <div className="mt-3 min-w-0 overflow-x-auto"><FormulaBlock tex={exercise.tex} /></div>
    </details>)}</div>}
    {exercises.length === 0 && <p className="mt-3 text-sm leading-7 text-slate-300">{lang === 'id' ? 'Kerjakan contoh dan cek pemahaman di atas tanpa membuka jawaban dulu. Gambarkan situasinya, tuliskan syaratnya, dan jelaskan alasan setiap langkah dengan kata-katamu sendiri.' : 'Try the worked example and knowledge check above before revealing the answer. Sketch the situation, state the hypotheses, and explain each step in your own words.'}</p>}
    <details className="mt-4 text-xs text-slate-400"><summary className="cursor-pointer">{lang === 'id' ? 'Berkas rujukan topik ini' : 'Source files for this topic'}</summary><ul className="mt-2 list-disc space-y-1 pl-4">{decks.map(deck => <li key={deck.file} className="break-all leading-6">{deck.file}</li>)}</ul></details>
  </section>
}
