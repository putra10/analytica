import { COMPLEX_MODULES, COMPLEX_PRACTICE, COMPLEX_SOURCES } from '../../content/complex-course-topics'
import type { Section } from '../../content/summary'
import type { SummaryLesson, VisualKind } from '../../content/summary-lessons'
import { FormulaBlock } from './FormulaBlock'

type Lang = 'id' | 'en'
export function ComplexCourseMap({ sec, lessons, lang, onPick }: { sec: Section; lessons: SummaryLesson[][]; lang: Lang; onPick: (part: number, entry: number) => void }) {
  const topics = lessons.flatMap((part, p) => part.map((lesson, e) => ({ kind: lesson.visual, p, e, title: sec.parts[p].entries[e].title })))
  const t = (id: string, en: string) => lang === 'id' ? id : en
  return <details className="min-w-0 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5" data-complex-course-map>
    <summary className="cursor-pointer text-sm font-semibold text-slate-100">{t('Belajar mengikuti silabus dan 2 buku', 'Study by syllabus and 2 books')} · {topics.length} {t('topik', 'topics')}</summary>
    <p className="mt-3 max-w-[75ch] text-sm leading-7 text-slate-300">{t('Ikuti Modul 01–11 untuk lingkup UTS dan Modul 01–19 untuk lingkup UAS sesuai SAP. Buka topik, ikuti gambar serta penurunannya, lalu kerjakan contoh sebelum membaca jawaban. Satu topik dapat membantu beberapa modul.', 'Follow Modules 01–11 for the midterm and Modules 01–19 for the final according to the syllabus. Open a topic, follow its picture and derivation, then try the example before reading the answer. One topic can support several modules.')}</p>
    <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
      {COMPLEX_MODULES.map(module => <section key={module.code} data-complex-module={module.code} className="min-w-0 rounded-lg border border-border bg-card p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">{module.phase === 'book' ? t('Pendalaman buku', 'Book enrichment') : module.phase === 'uts' ? 'UTS · UAS' : 'UAS'}</p>
        <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-100">{module.phase !== 'book' && <span className="mr-2 font-mono text-accent">{module.code}</span>}{module.title[lang]}</h3>
        <div className="mt-2 flex flex-wrap gap-2">{module.topics.map(kind => {
          const item = topics.find(topic => topic.kind === kind)
          return item && <button type="button" key={kind} onClick={() => onPick(item.p, item.e)} className="max-w-full rounded-lg border border-border px-2.5 py-2 text-left text-xs leading-5 text-slate-300 hover:border-accent hover:text-accent">{item.title[lang]}</button>
        })}</div>
      </section>)}
    </div>
    <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs leading-6 text-slate-400">
      <p>Brown &amp; Churchill — <span className="italic">Complex Variables and Applications</span>, 8th ed. · {t('Nomor § merujuk bagian, bukan halaman.', '§ numbers refer to sections, not pages.')}</p>
      <p>Zill — <span className="italic">Advanced Engineering Mathematics</span>, 6th ed. · {t('Bagian 17–19 menjadi rujukan utama fungsi kompleks.', 'Chapters 17–19 provide the main complex functions references.')}</p>
      <p>{t('Peta mengikuti SAP Fungsi Kompleks Ganjil 26_27.pdf. Rujukan spesifik kedua buku tersedia di setiap topik. Beberapa pendalaman memakai teorema Brown dengan latar terkait dari Zill; bagian pendukung diberi keterangan.', 'The map follows SAP Fungsi Kompleks Ganjil 26_27.pdf. Each topic lists specific references to both books. Some further topics use a Brown theorem with related Zill background; supporting sections are identified.')}</p>
    </div>
  </details>
}

export function ComplexCoursePractice({ kind, lang }: { kind: VisualKind; lang: Lang }) {
  const source = COMPLEX_SOURCES[kind]
  const modules = COMPLEX_MODULES.filter(module => module.topics.includes(kind))
  const exercises = COMPLEX_PRACTICE[kind] ?? []
  const t = (id: string, en: string) => lang === 'id' ? id : en
  return <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5" data-complex-practice={kind}>
    <p className="eyebrow">{t('Rujukan & latihan', 'References & practice')}</p>
    <p className="mt-2 text-xs leading-6 text-slate-400">{modules.map(module => module.phase === 'book' ? module.title[lang] : 'Modul ' + module.code).join(' · ')}</p>
    <dl className="mt-3 space-y-2 text-xs leading-6">
      <div><dt className="font-semibold text-slate-100">Brown &amp; Churchill, 8th ed.</dt><dd className="text-slate-400">{source?.brown}</dd></div>
      <div><dt className="font-semibold text-slate-100">Zill, 6th ed.</dt><dd className="text-slate-400">{source?.zill}</dd></div>
    </dl>
    {exercises.length > 0 ? <div className="mt-4 space-y-3">{exercises.map((exercise, i) => <details key={i} className="min-w-0 rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold leading-7 text-slate-100">{i + 1}. {exercise.question[lang]}</summary>
      <p className="mt-3 text-sm leading-7 text-slate-300">{exercise.solution[lang]}</p>
      <div className="mt-3 min-w-0 overflow-x-auto"><FormulaBlock tex={exercise.tex} /></div>
    </details>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-300">{t('Ulangi contoh lengkap dan pertanyaan cek pemahaman di atas tanpa membuka jawaban. Sebutkan domain, syarat, dan alasan setiap langkah; periksa hasil dengan substitusi atau definisinya.', 'Try the worked example and knowledge check above before revealing the answer. State the domain, hypotheses, and reason for every step; check the result by substitution or the definition.')}</p>}
  </section>
}

