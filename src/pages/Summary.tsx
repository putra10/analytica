import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { SUMMARY } from '../content/summary'
import { PART_VISUALS, SUMMARY_EXAMPLES } from '../content/summary-examples'
import { SUMMARY_LESSONS } from '../content/summary-lessons'
import { SUMMARY_CONCEPTS } from '../content/summary-concepts'
import { VISUAL_THEOREMS } from '../content/summary-theorems'
import { useLang, useT } from '../lib/i18n'
import { href } from '../lib/router'
import { SummaryConceptVisual } from '../components/ui/SummaryConceptVisual'
import { SummaryLesson } from '../components/ui/SummaryLesson'
import { SummaryOverview } from '../components/ui/SummaryOverview'
import { TheoremExplorer } from '../components/algebra/TheoremExplorer'
import { cn } from '../lib/utils'

type Point = [number, number]

function sampledPath(fn: (t: number) => Point, project: (p: Point) => Point, from = 0, to = 1, steps = 80, close = false) {
  const points = Array.from({ length: steps + 1 }, (_, i) => project(fn(from + ((to - from) * i) / steps)))
  return `${points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}${close ? ' Z' : ''}`
}

function MappingSummaryVisual({ t }: { t: ReturnType<typeof useT> }) {
  const square = (x: number, y: number): Point => [x * x - y * y, 2 * x * y]
  const z = (p: Point): Point => [65 + (p[0] + 0.25) * 130, 251 - (p[1] + 0.25) * 130]
  const w = (p: Point): Point => [438 + (p[0] + 1.2) * 100, 251 - (p[1] + 0.2) * 100]
  const levels = [0, 0.25, 0.5, 0.75, 1]
  const mappedBoundary = sampledPath((t) => {
    const p: Point = t <= 1 ? [t, 0] : t <= 2 ? [1, t - 1] : t <= 3 ? [3 - t, 1] : [0, 4 - t]
    return square(p[0], p[1])
  }, w, 0, 4, 160, true)

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="border-b border-border px-5 py-4">
        <span className="eyebrow">{t('Panduan visual', 'Visual walkthrough')}</span>
        <h2 className="font-display mt-1 text-[25px] text-slate-100">{t('Bagaimana daerah berubah di bawah w = z²', 'How a region changes under w = z²')}</h2>
        <p className="mt-1 max-w-[72ch] text-[13px] leading-relaxed text-slate-400">
          {t('Ikuti persegi satuan pada bidang z. Setiap titik z = x + iy dikirim ke satu titik w = u + iv; kisi berwarna membantu melihat bagaimana seluruh daerah dan kurvanya berubah.', 'Follow the unit square in the z-plane. Each point z = x + iy is sent to a point w = u + iv; the colored grid shows how the region and its curves transform.')}
        </p>
      </div>
      <div className="px-3 pt-3 sm:px-5">
        <svg viewBox="0 0 720 290" role="img" aria-label={t('Persegi satuan dan kisi kartesius di bidang z dipetakan oleh w sama dengan z kuadrat menjadi daerah melengkung di bidang w.', 'The unit square and Cartesian grid in the z-plane map under w equals z squared to a curved region in the w-plane.')} className="h-auto w-full">
          <defs>
            <clipPath id="summary-z-clip"><rect x="30" y="48" width="270" height="210" rx="8" /></clipPath>
            <clipPath id="summary-w-clip"><rect x="420" y="10" width="270" height="248" rx="8" /></clipPath>
          </defs>
          <text x="165" y="28" textAnchor="middle" className="fill-slate-200" fontSize="14" fontWeight="600">{t('bidang z', 'z-plane')}</text>
          <text x="555" y="28" textAnchor="middle" className="fill-slate-200" fontSize="14" fontWeight="600">{t('bidang w', 'w-plane')}</text>
          <text x="360" y="145" textAnchor="middle" className="fill-accent" fontSize="15" fontWeight="600">w = z²</text>
          <path d="M340 156 H380 M373 149 L380 156 L373 163" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <g clipPath="url(#summary-z-clip)">
            <path d="M30 121 H300 M30 186 H300 M97.5 48 V258 M162.5 48 V258 M227.5 48 V258" stroke="var(--border)" strokeWidth="1" />
            <path d={`M${z([0, 0])[0]},${z([0, 0])[1]} L${z([1, 0])[0]},${z([1, 0])[1]} L${z([1, 1])[0]},${z([1, 1])[1]} L${z([0, 1])[0]},${z([0, 1])[1]} Z`} fill="var(--accent)" fillOpacity="0.08" stroke="none" />
            {levels.map((c) => <path key={`z-x-${c}`} d={sampledPath((y) => [c, y], z)} fill="none" stroke="var(--accent)" strokeWidth={c === 0 || c === 1 ? 2.2 : 1.5} opacity="0.9" />)}
            {levels.map((c) => <path key={`z-y-${c}`} d={sampledPath((x) => [x, c], z)} fill="none" stroke="var(--danger)" strokeWidth={c === 0 || c === 1 ? 2.2 : 1.5} opacity="0.9" />)}
            <path d="M30 218.5 H300 M97.5 48 V258" stroke="var(--hint)" strokeWidth="1.2" />
          </g>
          <g clipPath="url(#summary-w-clip)">
            {levels.map((c) => <path key={`w-x-${c}`} d={sampledPath((y) => square(c, y), w)} fill="none" stroke="var(--accent)" strokeWidth={c === 0 || c === 1 ? 2.2 : 1.5} opacity="0.9" />)}
            {levels.map((c) => <path key={`w-y-${c}`} d={sampledPath((x) => square(x, c), w)} fill="none" stroke="var(--danger)" strokeWidth={c === 0 || c === 1 ? 2.2 : 1.5} opacity="0.9" />)}
            <path d={mappedBoundary} fill="var(--accent)" fillOpacity="0.07" stroke="var(--accent)" strokeWidth="2.3" />
            <path d="M438 231 H678 M558 10 V258" stroke="var(--hint)" strokeWidth="1.2" />
          </g>
          <text x="45" y="275" className="fill-slate-400" fontSize="11">{t('persegi satuan: 0 ≤ x, y ≤ 1', 'unit square: 0 ≤ x, y ≤ 1')}</text>
          <text x="435" y="275" className="fill-slate-400" fontSize="11">{t('garis ungu: x tetap · garis merah: y tetap', 'violet: fixed x · red: fixed y')}</text>
        </svg>
      </div>
      <div className="grid gap-4 px-5 pb-5 pt-2 text-[13px] leading-relaxed text-slate-400 md:grid-cols-3">
        <div><h3 className="mb-1 font-semibold text-slate-100">{t('1. Petakan titik', '1. Map a point')}</h3><p>{t('Tulis w = z² = (x² − y²) + i(2xy). Jadi u = x² − y² dan v = 2xy; setiap titik pada persegi punya bayangan yang dapat dihitung langsung.', 'Write w = z² = (x² − y²) + i(2xy). Thus u = x² − y² and v = 2xy; every point in the square has an image you can calculate directly.')}</p></div>
        <div><h3 className="mb-1 font-semibold text-slate-100">{t('2. Ikuti garis kisi', '2. Follow the grid lines')}</h3><p>{t('Garis x = c menjadi parabola u = c² − v²/(4c²), sedangkan y = c menjadi u = v²/(4c²) − c² (untuk c ≠ 0). Garis yang lurus di z dapat melengkung di w.', 'A line x = c becomes the parabola u = c² − v²/(4c²), while y = c becomes u = v²/(4c²) − c² (for c ≠ 0). Straight lines in z can curve in w.')}</p></div>
        <div><h3 className="mb-1 font-semibold text-slate-100">{t('3. Baca sudut dengan hati-hati', '3. Read angles carefully')}</h3><p>{t('Dalam koordinat kutub, z² = r²e^{i2θ}: sudut digandakan. Pemetaan mempertahankan sudut lokal saat turunannya tidak nol; di z = 0, f′(z) = 2z = 0, sehingga titik itu istimewa.', 'In polar form, z² = r²e^{i2θ}: angles double. The map preserves local angles where its derivative is nonzero; at z = 0, f′(z) = 2z = 0, so that point is exceptional.')}</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-slate-900/40 px-5 py-3 text-xs text-slate-400">
        <span>{t('Coba ubah fungsi dan daerah untuk melihat bayangannya langsung.', 'Change the function and region to explore their images directly.')}</span>
        <a href="#/app/complex" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-slate-200 no-underline hover:border-accent hover:text-accent">{t('Buka laboratorium pemetaan', 'Open mapping lab')} <ArrowUpRight size={12} /></a>
      </div>
    </section>
  )
}

export function Summary({ section }: { section?: string }) {
  const t = useT()
  const { lang } = useLang()
  const sec = SUMMARY.find((s) => s.id === section) ?? SUMMARY[0]
  const active = sec.id
  const [selection, setSelection] = useState({ course: active, part: 0, entry: 0 })
  const [query,setQuery]=useState('')
  const position = selection.course === active ? selection : { part: 0, entry: 0 }
  const part = sec.parts[position.part] ?? sec.parts[0]
  const entry = part.entries[position.entry] ?? part.entries[0]
  const topics = sec.parts.flatMap((p, i) => p.entries.map((e, j) => ({ part: i, entry: j, title: e.title })))
  const visualCount=SUMMARY_LESSONS[active].flat().reduce((count,lesson)=>count+1+SUMMARY_CONCEPTS[lesson.visual].length+(VISUAL_THEOREMS[lesson.visual]?.length??0),0)+(active==='algebra'?1:0)
  const topicIndex = topics.findIndex(p => p.part === position.part && p.entry === position.entry)
  const choose = (partIndex: number, entryIndex: number) => setSelection({ course: active, part: partIndex, entry: entryIndex })
  const move = (offset: number) => {
    const next = topics[topicIndex + offset]
    if (next) { choose(next.part, next.entry); document.getElementById('summary-topic')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <span className="eyebrow">{t('Ringkasan yang menjelaskan', 'A summary that explains')}</span>
        <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t('Pahami asal rumusnya.', 'Understand where the formula comes from.')}</h1>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-slate-400">
          {t('Pilih subbagian kuliah, lalu ikuti gambar dan penurunannya langkah demi langkah. Setiap topik menjelaskan syarat penggunaan, apa yang bisa gagal, dan contoh dengan alasan di setiap langkah. Rumus buku tersedia setelah penjelasan.',
             'Choose a lecture subsection, then follow its picture and derivation step by step. Every topic explains its conditions, what can fail, and a worked example with reasons for each step. The textbook formulas follow the explanation.')}
        </p>
      </div>

      <div className="course-cards grid gap-3 sm:grid-cols-3">
        {SUMMARY.map((s, i) => (
          <a key={s.id} href={href({ page: 'summary', section: s.id })} onClick={()=>setQuery('')} aria-current={active === s.id ? 'page' : undefined}
            className={cn('flex min-w-0 items-center gap-3 rounded-xl border px-4 py-4 text-sm font-semibold no-underline', active === s.id ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-card text-slate-300 hover:border-accent')}>
            <span className="course-number font-mono">{String(i + 1).padStart(2, '0')}</span><span>{s.title[lang]}<span className="mt-1 block text-xs font-normal text-slate-400">{s.parts.reduce((n,p)=>n+p.entries.length,0)} {t('topik visual','visual topics')}</span></span>
          </a>
        ))}
      </div>

      <SummaryOverview sec={sec} lessons={SUMMARY_LESSONS[active]} lang={lang} current={[position.part, position.entry]} onPick={(p, e) => { choose(p, e); document.getElementById('summary-topic')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        title={t('Peta visual mata kuliah: klik gambar untuk membuka topik', 'Visual course map: click a picture to open its topic')}
        hint={t('Setiap kartu menunjukkan gambar kunci dan rumus utama sebuah topik, dikelompokkan menurut subbagian kuliah.', 'Each card shows a topic’s key picture and main formula, grouped by lecture subsection.')} />
      <p className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-slate-300">{t(`${topics.length} dari ${topics.length} topik memiliki penjelasan visual · ${visualCount} pilihan konsep`,`${topics.length} of ${topics.length} topics have visual explanations · ${visualCount} concept views`)}</p>
      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label={t('Subbagian dan topik kuliah', 'Lecture subsections and topics')}>
          <div className="sticky top-20 max-h-[calc(100dvh-100px)] space-y-3 overflow-y-auto pr-2 text-xs">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">{sec.source}</p>
            {sec.parts.map((p, i) => (
              <div key={i}>
                <button type="button" onClick={() => choose(i, 0)} className={cn('w-full rounded-md px-2 py-2 text-left font-semibold leading-relaxed hover:bg-slate-900', position.part === i ? 'text-accent' : 'text-slate-300')}>{p.title[lang]}</button>
                {position.part === i && <div className="mt-1 space-y-1 border-l border-border pl-2">{p.entries.map((e, j) => <button key={j} type="button" onClick={() => choose(i, j)} aria-current={position.entry === j ? 'true' : undefined} className={cn('w-full rounded-md px-2 py-2 text-left leading-relaxed', position.entry === j ? 'bg-accent/10 text-slate-100' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100')}>{e.title[lang]}</button>)}</div>}
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-5" id="summary-topic">
          <section className="topic-search">
            <label htmlFor="topic-search" className="text-xs font-semibold text-slate-300">{t('Cari topik dalam mata kuliah ini','Find a topic in this course')}</label>
            <input id="topic-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Misalnya: koset, Taylor, konik…','Try: cosets, Taylor, conics…')} className="mt-2 w-full min-w-0 rounded-lg border border-border bg-card px-4 py-3 text-sm"/>
            {query.trim()&&<div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-2" aria-live="polite">{topics.filter(item=>item.title[lang].toLowerCase().includes(query.toLowerCase().trim())).map(item=><button key={`${item.part}-${item.entry}`} type="button" onClick={()=>{choose(item.part,item.entry);setQuery('')}} className="block w-full rounded-lg px-3 py-3 text-left text-sm text-slate-300 hover:bg-accent-soft">{item.title[lang]}</button>)}{!topics.some(item=>item.title[lang].toLowerCase().includes(query.toLowerCase().trim()))&&<p className="px-3 py-3 text-sm text-slate-400">{t('Tidak ada topik yang cocok. Coba istilah lain.','No matching topics. Try another term.')}</p>}</div>}
          </section>
          <div className="grid min-w-0 gap-3 rounded-[var(--radius)] border border-border bg-card p-4 sm:grid-cols-2">
            <label className="min-w-0 text-xs text-slate-400">{t('Subbagian kuliah', 'Lecture subsection')}<select value={position.part} onChange={e => choose(Number(e.target.value), 0)} className="mt-2 w-full min-w-0 rounded-lg border border-border bg-slate-900 p-2.5 text-sm text-slate-100">{sec.parts.map((p, i) => <option key={i} value={i}>{i + 1}. {p.title[lang]}</option>)}</select></label>
            <label className="min-w-0 text-xs text-slate-400">{t('Topik yang ingin dipahami', 'Topic to understand')}<select value={position.entry} onChange={e => choose(position.part, Number(e.target.value))} className="mt-2 w-full min-w-0 rounded-lg border border-border bg-slate-900 p-2.5 text-sm text-slate-100">{part.entries.map((e, i) => <option key={i} value={i}>{position.part + 1}.{i + 1}  {e.title[lang]}</option>)}</select></label>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0 flex-1"><p className="text-xs leading-relaxed text-slate-400">{part.title[lang]} · {topicIndex + 1}/{topics.length}</p><h2 className="mt-2 text-lg font-semibold leading-snug text-slate-100">{entry.title[lang]}</h2></div>
            {entry.lab && <a href={entry.lab} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs text-slate-300 no-underline hover:border-accent hover:text-accent">{t('Eksplorasi di lab', 'Explore in the lab')}<ArrowUpRight size={13} /></a>}
          </div>
          <SummaryLesson key={`${sec.id}-${position.part}-${position.entry}`} lesson={SUMMARY_LESSONS[sec.id][position.part][position.entry]} example={SUMMARY_EXAMPLES[sec.id][position.part][position.entry]} entry={entry} lang={lang} theoremExplorer={sec.id==='algebra'&&position.part===0&&position.entry===4?<TheoremExplorer lang={lang}/>:undefined} />
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <button type="button" disabled={topicIndex === 0} onClick={() => move(-1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-xs text-slate-300 hover:border-accent disabled:opacity-35"><ChevronLeft size={14} />{t('Topik sebelumnya', 'Previous topic')}</button>
            <button type="button" disabled={topicIndex === topics.length - 1} onClick={() => move(1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-xs text-slate-300 hover:border-accent disabled:opacity-35">{t('Topik berikutnya', 'Next topic')}<ChevronRight size={14} /></button>
          </div>
          <details className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm text-slate-300">{t('Lihat hubungan topik dalam subbagian ini', 'See how this subsection’s topics connect')}</summary>
            <div className="mt-4">{PART_VISUALS[sec.id]?.[position.part] && <SummaryConceptVisual course={sec.id} part={position.part} visual={PART_VISUALS[sec.id][position.part]} lang={lang} />}{sec.id === 'complex' && position.part === 1 && <MappingSummaryVisual t={t} />}</div>
          </details>
        </div>
      </div>
    </div>
  )
}
