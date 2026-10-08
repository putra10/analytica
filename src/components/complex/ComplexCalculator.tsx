import { useMemo, useState } from 'react'
import { useLang, useT } from '../../lib/i18n'
import { calculate, type Bi } from '../../lib/complex-studio'
import { Tex } from '../ui/FormulaBlock'
import { Rich, Steps } from '../../pages/ComplexStudio'
import { ArgandPlane } from '../complex-studio/ArgandPlane'

const EXAMPLES = ['z^2 + 1', '1/(z^2 + 1)', 'exp(z)/z^2', 'sin(z)/z', '(z^2+1)/(z(z-2)^2)', 'conj(z)', '|z|^2']

/** Type f(z) once and read off everything the course asks about it: value, analyticity, derivative, zeros, residues, series, integral. */
export function ComplexCalculator() {
  const t = useT(), { lang } = useLang()
  const [fx, setFx] = useState('(z^2+1)/(z(z-2)^2)'), [z0, setZ0] = useState('1+i'), [path, setPath] = useState('circle(0, 3)')
  const [sketch, setSketch] = useState(false)
  const pick = (b: Bi) => lang === 'id' ? b.id : b.en
  const jobs: [string, string, string][] = [
    ['def', t('Fungsi', 'Function'), `f(z) = ${fx}`],
    ['val', t(`Nilai di z₀ = ${z0}`, `Value at z₀ = ${z0}`), `f(${z0})`],
    ['cr', t('Analitik? (Cauchy-Riemann)', 'Analytic? (Cauchy-Riemann)'), 'cr(f)'],
    ['der', t("Turunan f'(z)", "Derivative f'(z)"), 'derivative(f)'],
    ['der0', t("f'(z₀)", "f'(z₀)"), `derivative(f, ${z0})`],
    ['zero', t('Pembuat nol', 'Zeros'), 'zeros(f)'],
    ['res', t('Titik singular & residu', 'Singular points & residues'), 'residues(f)'],
    ['tay', t('Deret Taylor di z₀', 'Taylor series at z₀'), `taylor(f, ${z0}, 4)`],
    ['int', t(`Integral ∮ f dz pada ${path}`, `Integral ∮ f dz on ${path}`), `integral(f, ${path})`],
  ]
  const results = useMemo(() => calculate(jobs.map(([id, , text]) => ({ id, text }))), [fx, z0, path]) // eslint-disable-line react-hooks/exhaustive-deps
  const head = results[0]
  const field = 'mt-1 block w-full min-w-0 rounded-lg border border-border bg-[var(--surface-2)] px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-accent'
  return <div className="space-y-4">
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="min-w-0 text-xs text-slate-400">f(z) =<input value={fx} onChange={(e) => setFx(e.target.value)} spellCheck={false} autoCapitalize="off" maxLength={200} className={field} /></label>
        <label className="min-w-0 text-xs text-slate-400">{t('titik z₀', 'point z₀')}<input value={z0} onChange={(e) => setZ0(e.target.value)} spellCheck={false} maxLength={60} className={field} /></label>
        <label className="min-w-0 text-xs text-slate-400">{t('lintasan C', 'path C')}<input value={path} onChange={(e) => setPath(e.target.value)} spellCheck={false} maxLength={120} className={field} /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400">{t('Contoh:', 'Examples:')}</span>
        {EXAMPLES.map((e) => <button key={e} onClick={() => setFx(e)} className="rounded-full border border-border px-2.5 py-1 font-mono text-slate-300 hover:border-accent hover:text-accent">{e}</button>)}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{t('Lintasan: circle(c, r), segment(a, b), atau polygon(a, b, c, …). Tulis perkalian sebagai z*w atau 2z; fungsi: exp, log, Log, sin, cos, sinh, cosh, sqrt, conj, abs.', 'Paths: circle(c, r), segment(a, b), or polygon(a, b, c, …). Write products as z*w or 2z; functions: exp, log, Log, sin, cos, sinh, cosh, sqrt, conj, abs.')}</p>
    </section>

    {head.error ? <p className="rounded-xl border border-[var(--danger)] p-4 text-sm text-rose-300"><Rich text={pick(head.error)} /></p> : <>
      <div className="grid gap-3 md:grid-cols-2">
        {results.slice(1).map((r, i) => <section key={r.entry.id} className="min-w-0 rounded-xl border border-border bg-card p-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{jobs[i + 1][1]}</h3>
          {r.error ? <p className="mt-1.5 text-sm text-slate-400"><Rich text={pick(r.error)} /></p> : <>
            {r.answer && <Tex block tex={r.answer} className="text-[15px]" />}
            {r.note && <p className="text-xs text-slate-400">{pick(r.note)}</p>}
            {r.steps.length > 0 && <Steps steps={r.steps} />}
          </>}
        </section>)}
      </div>
      <details className="rounded-xl border border-border bg-card" onToggle={(e) => setSketch(e.currentTarget.open)}>
        <summary className="cursor-pointer px-4 py-3 text-sm text-slate-300">{t('Tampilkan sketsa di bidang kompleks (opsional)', 'Show a sketch on the complex plane (optional)')}</summary>
        {sketch && <div className="border-t border-border"><ArgandPlane rows={results} focus={null} /></div>}
      </details>
    </>}
  </div>
}
