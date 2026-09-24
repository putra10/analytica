import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Lightbulb } from 'lucide-react'
import { SUMMARY } from '../content/summary'
import { PART_VISUALS, SUMMARY_EXAMPLES, SUMMARY_METHODS } from '../content/summary-examples'
import { useLang, useT } from '../lib/i18n'
import { href } from '../lib/router'
import { FormulaBlock } from '../components/ui/FormulaBlock'
import { SummaryConceptVisual } from '../components/ui/SummaryConceptVisual'
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
  const [active, setActive] = useState(section ?? SUMMARY[0].id)
  useEffect(() => { if (section) setActive(section) }, [section])
  const sec = SUMMARY.find((s) => s.id === active) ?? SUMMARY[0]

  return (
    <div className="space-y-6 py-4">
      <div>
        <span className="eyebrow">{t('Ringkasan rumus & teori', 'Formula & theory summary')}</span>
        <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t('Yang perlu diingat, per topik.', 'What to remember, topic by topic.')}</h1>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-slate-400">
          {t('Disarikan dari buku kuliah (Brown & Churchill, Vaisman, Herstein) dengan nomor pasal dan teorema. Setiap kelompok topik memiliki diagram; setiap contoh menunjukkan cara mulai, perhitungan, dan makna hasilnya. Tautan "coba" membuka laboratorium yang sesuai.',
             'Distilled from the course textbooks (Brown & Churchill, Vaisman, Herstein) with section and theorem numbers. Every topic group has a diagram; each example shows how to start, the calculation, and what its result means. The "try" links open the matching lab.')}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUMMARY.map((s, i) => (
          <a key={s.id} href={href({ page: 'summary', section: s.id })} onClick={() => setActive(s.id)}
            className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium no-underline', active === s.id ? 'border-slate-100 bg-slate-100 text-accent-ink' : 'border-border bg-card text-slate-400 hover:text-slate-100')}>
            <span className="font-mono text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>{s.title[lang]}
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-20 space-y-1 text-xs">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">{sec.source}</p>
            {sec.parts.map((p, i) => (
              <a key={i} href={`#/summary/${sec.id}#p${i}`} onClick={(e) => { e.preventDefault(); document.getElementById(`${sec.id}-p${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                className="block rounded-md px-2 py-1 text-slate-400 no-underline hover:bg-slate-900 hover:text-slate-100">
                {p.title[lang]}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-8 sm:space-y-10">
          {sec.parts.map((part, i) => (
            <section key={i} id={`${sec.id}-p${i}`} className="scroll-mt-20">
              <h2 className="font-display mb-4 flex items-start gap-3 text-[22px] text-slate-100 sm:text-[26px]">
                <span className="section-number mt-1.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>{part.title[lang]}
              </h2>
              {PART_VISUALS[sec.id]?.[i] && <SummaryConceptVisual course={sec.id} part={i} visual={PART_VISUALS[sec.id][i]} lang={lang} />}
              {sec.id === 'complex' && i === 1 && <div className="mb-5"><MappingSummaryVisual t={t} /></div>}
              <div className="space-y-4">
                {part.entries.map((e, j) => (
                  <article key={j} className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-slate-100">{e.title[lang]}</h3>
                      {e.lab && <a href={e.lab} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-slate-400 no-underline hover:text-accent">{t('coba', 'try')} <ArrowUpRight size={11} /></a>}
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{e.intuition[lang]}</p>
                    <div className="mt-3 min-w-0 space-y-1 rounded-[var(--radius-sm)] bg-slate-900 px-3 py-2">
                      {e.formulas.map((f, k) => <FormulaBlock key={k} tex={f} />)}
                    </div>
                    {SUMMARY_EXAMPLES[sec.id]?.[i]?.[j] && (
                      <div className="mt-3 rounded-[var(--radius-sm)] border border-border bg-slate-900/40 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{t('Contoh dikerjakan', 'Worked example')}</p>
                        <p className="mt-1 text-[13px] text-slate-300">{SUMMARY_EXAMPLES[sec.id][i][j].prompt[lang]}</p>
                        <div className="mt-3 space-y-2 border-l-2 border-accent/50 pl-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t('1 · Cara mulai', '1 · How to start')}</p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-300">{SUMMARY_METHODS[sec.id]?.[i]?.[j]?.[lang]}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t('2 · Hitung', '2 · Calculate')}</p>
                            <div className="mt-1 overflow-x-auto"><FormulaBlock tex={SUMMARY_EXAMPLES[sec.id][i][j].work} /></div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t('3 · Makna hasil', '3 · What it means')}</p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">{SUMMARY_EXAMPLES[sec.id][i][j].reading[lang]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-slate-300">
                      <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" /><span>{e.insight[lang]}</span>
                    </p>
                    {e.pitfall && (
                      <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed text-slate-400">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-300" /><span>{e.pitfall[lang]}</span>
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
