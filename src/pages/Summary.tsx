import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowUpRight, Lightbulb } from 'lucide-react'
import { SUMMARY } from '../content/summary'
import { useLang, useT } from '../lib/i18n'
import { href } from '../lib/router'
import { FormulaBlock } from '../components/ui/FormulaBlock'
import { cn } from '../lib/utils'

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
          {t('Disarikan dari buku kuliah (Brown & Churchill, Vaisman, Herstein) dengan nomor pasal dan teorema. Tiap butir: mengapa konsep itu ada, rumusnya, satu hal untuk diingat, dan jebakan yang sering muncul. Tautan "coba" membuka laboratorium yang sesuai.',
             'Distilled from the course textbooks (Brown & Churchill, Vaisman, Herstein) with section and theorem numbers. Each item: why the concept exists, the formulas, one thing to remember, and the usual trap. The "try" links open the matching lab.')}
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
