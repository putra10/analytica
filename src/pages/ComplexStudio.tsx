import { SyllabusWorkbench } from '../components/ui/SyllabusWorkbench'
import { useEffect, useMemo, useState } from 'react'
import { useLang, useT } from '../lib/i18n'
import { calculate, ROW_COLORS, type Bi, type Entry, type Step } from '../lib/complex-studio'
import { Tex } from '../components/ui/FormulaBlock'
import { ArgandPlane } from '../components/complex-studio/ArgandPlane'

const KEY = 'analytica-complex-studio-v1'
const rows = (texts: string[]): Entry[] => texts.map((text) => ({ id: crypto.randomUUID(), text }))

/** One example set per syllabus block, in the style of Brown & Churchill / Zill exercises. */
const EXAMPLES: { id: string; en: string; rows: string[] }[] = [
  { id: 'Bilangan & akar', en: 'Numbers & roots', rows: ['z = 3+4i', 'w = 2e^(i*pi/3)', 'z*w', 'z/w', 'conj(z)', 'polar(-1+i)', 'pow(-1+i, 7)', 'roots(-8i, 3)', 'region(1 < |z-i| <= 2)'] },
  { id: 'Fungsi, limit, CR', en: 'Functions, limits, CR', rows: ['f(z) = z^2 + 1', 'f(1+i)', 'cr(f)', 'cr(|z|^2)', 'derivative(f, 2-i)', 'derivative(|z|^2, 0)', 'limit(conj(z)/z, 0)', 'limit((z^2-1)/(z-1), 1)', 'harmonic(y^3 - 3x^2*y)'] },
  { id: 'Fungsi elementer', en: 'Elementary functions', rows: ['Log(-1)', 'log(1+sqrt(3)i)', 'i^i', 'pow(-8, 1/3)', 'exp(2+pi*i/4)', 'sin(1+2i)', 'cosh(i*pi)', 'cr(exp(z))'] },
  { id: 'Integral', en: 'Integrals', rows: ['C = circle(0, 2)', 'integral(1/z, C)', 'integral(z^2, segment(0, 1+i))', 'integral(conj(z), segment(0, 1+i))', 'S = polygon(1+i, -1+i, -1-i, 1-i)', 'integral(1/(z^2+4), S)', 'ml(1/(z^2+1), circle(0, 3))', 'cauchy(exp(z), 1, C)', 'cauchy(exp(2z), 0, C, 3)'] },
  { id: 'Deret & residu', en: 'Series & residues', rows: ['taylor(1/(1-z), 0, 5)', 'laurent(1/(z*(z-1)), 0, 4)', 'laurent(1/(z*(z-1)), 0, 4, 2)', 'classify(sin(z)/z, 0)', 'classify(exp(1/z), 0)', 'residue(exp(z)/z^2, 0)', 'residue(1/(z^2+1)^2, i)', 'zeros(z^3 - z)', 'residues((5z-2)/(z(z-1)), circle(0, 2))'] },
]

const HELP: [string, Bi][] = [
  ['z = 3+4i', { id: 'bilangan bernama (satu huruf kecil)', en: 'named number (one lowercase letter)' }],
  ['z*w, z/w, conj(z), abs(z)', { id: 'aritmetika, konjugat, modulus', en: 'arithmetic, conjugate, modulus' }],
  ['arg(z), Arg(z), polar(z)', { id: 'argumen dan bentuk polar', en: 'argument and polar form' }],
  ['pow(z, n), roots(w, n)', { id: 'de Moivre, akar ke-n', en: 'de Moivre, nth roots' }],
  ['log(z), Log(z), z^c', { id: 'logaritma, pangkat kompleks', en: 'logarithm, complex power' }],
  ['region(1 < |z-i| <= 2)', { id: 'daerah di bidang', en: 'region in the plane' }],
  ['f(z) = z^2 + 1, f(1+i)', { id: 'fungsi dan nilainya', en: 'function and its value' }],
  ['cr(f), derivative(f, z0)', { id: 'Cauchy-Riemann, turunan', en: 'Cauchy-Riemann, derivative' }],
  ['harmonic(x^2 - y^2)', { id: 'uji Laplace, konjugat harmonik', en: 'Laplace test, harmonic conjugate' }],
  ['limit(f, z0), limit(f, inf)', { id: 'limit lewat beberapa lintasan', en: 'limit along several paths' }],
  ['C = circle(c, r), segment(a, b), polygon(a, b, c)', { id: 'lintasan', en: 'paths' }],
  ['integral(f, C), ml(f, C)', { id: 'integral kontur, batas ML', en: 'contour integral, ML bound' }],
  ['cauchy(f, a, C, n)', { id: 'rumus integral Cauchy', en: 'Cauchy integral formula' }],
  ['taylor(f, a, n), laurent(f, a, n, ρ)', { id: 'deret Taylor / Laurent', en: 'Taylor / Laurent series' }],
  ['residue(f, a), residues(f, C), classify(f, a), zeros(f)', { id: 'residu, jenis titik singular, nol', en: 'residues, singularity type, zeros' }],
]

function initial(): Entry[] {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (Array.isArray(s) && s.length <= 60 && s.every((r: Entry) => typeof r.id === 'string' && typeof r.text === 'string' && r.text.length <= 300)) return s
  } catch { /* start with the first example set */ }
  return rows(EXAMPLES[0].rows)
}

/** Text with inline $math$ segments. */
const Rich = ({ text }: { text: string }) => <>{text.split('$').map((part, i) => i % 2 ? <Tex key={i} tex={part} /> : <span key={i}>{part}</span>)}</>

function Steps({ steps }: { steps: Step[] }) {
  const t = useT(), { lang } = useLang(), [open, setOpen] = useState(false)
  return <details className="mt-2 rounded-lg border border-border bg-slate-800/40" onToggle={(e) => setOpen(e.currentTarget.open)}>
    <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-accent">{t('Langkah', 'Steps')} <span className="text-slate-500">({steps.length})</span></summary>
    {open && <ol className="list-decimal space-y-2 px-3 pb-3 pl-8 text-[13px] leading-relaxed text-slate-300">
      {steps.map((s, i) => <li key={i} className="min-w-0">
        <p><Rich text={lang === 'id' ? s.id : s.en} /></p>
        {s.tex && <Tex block tex={s.tex} className="text-[13px]" />}
      </li>)}
    </ol>}
  </details>
}

/** Complex Functions studio: type a number or f(z) from a problem and get the answer with its working. */
export function ComplexStudio() {
  const t = useT(), { lang } = useLang()
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [focus, setFocus] = useState<string | null>(null)
  const results = useMemo(() => calculate(entries), [entries])
  const pick = (b: Bi) => lang === 'id' ? b.id : b.en
  useEffect(() => { const id = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch { /* private mode */ } }, 400); return () => clearTimeout(id) }, [entries])
  const update = (id: string, text: string) => setEntries((es) => es.map((e) => e.id === id ? { ...e, text } : e))
  const append = () => setEntries((es) => es.length < 60 ? [...es, ...rows([''])] : es)

  return <div className="space-y-5">
    <header className="pt-2">
      <span className="eyebrow">{t('Studio · Fungsi Kompleks', 'Studio · Complex Functions')}</span>
      <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t('Studio Fungsi Kompleks', 'Complex Functions Studio')}</h1>
      <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-slate-400">{t('Ketik bilangan, fungsi, atau perintah dari soal. Setiap baris dihitung langsung, lengkap dengan langkah pengerjaan. Baris berikutnya boleh memakai nama dari baris sebelumnya.', 'Type a number, function or command from a problem. Each row is computed live, with its working. Later rows can use names defined above.')}</p>
    </header>

    <SyllabusWorkbench course="complex" onLoad={texts=>{setEntries(rows(texts));setFocus(null)}} />

    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400">{t('Muat contoh:', 'Load examples:')}</span>
      {EXAMPLES.map((ex) => <button key={ex.en} onClick={() => { setEntries(rows(ex.rows)); setFocus(null) }} className="rounded-full border border-border px-3 py-1.5 text-xs text-slate-300 hover:border-accent hover:text-accent">{pick(ex)}</button>)}
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="min-w-0 space-y-2 lg:order-1 order-2">
        {results.map((r, i) => <div key={r.entry.id} className="min-w-0 rounded-xl border border-border bg-card p-3 shadow-sm focus-within:border-accent" onFocus={() => setFocus(r.entry.id)}>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.error ? 'transparent' : ROW_COLORS[i % ROW_COLORS.length], border: `2px solid ${ROW_COLORS[i % ROW_COLORS.length]}` }} />
            <span className="font-mono">{r.name}</span>
            <button aria-label={t(`Hapus baris ${i + 1}`, `Delete row ${i + 1}`)} onClick={() => setEntries((es) => es.filter((e) => e.id !== r.entry.id))} className="ml-auto px-1 text-lg leading-none text-slate-500 hover:text-rose-300">×</button>
          </div>
          <input aria-label={t(`Baris ${i + 1}`, `Row ${i + 1}`)} value={r.entry.text} maxLength={300} spellCheck={false} autoCapitalize="off" autoCorrect="off"
            onChange={(e) => update(r.entry.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') append() }}
            className="mt-1.5 block w-full min-w-0 rounded-lg border border-border bg-slate-800 px-2.5 py-2 font-mono text-[13px] text-slate-100 outline-none focus:border-accent" />
          {r.error ? <p className="mt-2 text-xs text-rose-300"><Rich text={pick(r.error)} /></p> : <>
            {r.answer && <Tex block tex={r.answer} className="mt-1 text-[15px]" />}
            {r.note && <p className="text-xs text-slate-400">{pick(r.note)}</p>}
            {r.steps.length > 0 && <Steps steps={r.steps} />}
          </>}
        </div>)}
        <button onClick={append} disabled={entries.length >= 60} className="w-full rounded-xl border border-dashed border-slate-700 px-3 py-2.5 text-sm text-slate-300 hover:border-accent hover:text-accent disabled:opacity-40">+ {t('Tambah baris', 'Add row')}</button>
        <p className="text-[11px] text-slate-500">{t('Disimpan di browser ini.', 'Saved in this browser.')}</p>
      </div>
      <aside className="order-1 min-w-0 lg:order-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:sticky lg:top-20">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-[11px] text-slate-400">
            <span className="font-mono">{t('BIDANG KOMPLEKS', 'ARGAND PLANE')}</span>
            {focus && <button onClick={() => setFocus(null)} className="text-accent">{t('Tampilkan semua', 'Show all')}</button>}
          </div>
          <ArgandPlane rows={results} focus={focus} />
          <p className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-slate-400">{t('Titik dan panah: bilangan · ×: kutub · ⊗: titik singular esensial · ▢: titik cabang · lingkaran berongga: nol · garis putus-putus: lingkaran akar, anulus, atau batas daerah. Baris yang sedang diedit ditonjolkan.', 'Dots and arrows: numbers · ×: poles · ⊗: essential singularities · ▢: branch points · hollow dots: zeros · dashed: root circles, annuli or region boundaries. The row being edited is highlighted.')}</p>
        </div>
      </aside>
    </div>

    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-display text-2xl text-slate-100">{t('Perintah', 'Commands')}</h2>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {HELP.map(([code, d]) => <div key={code} className="min-w-0"><dt className="font-mono text-xs text-slate-200 [overflow-wrap:anywhere]">{code}</dt><dd className="text-xs text-slate-400">{pick(d)}</dd></div>)}
      </dl>
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">{t('Simbolik: aritmetika dan bentuk polar (nilai eksak seperti √2, π/4 dikenali), u dan v untuk fungsi polinomial/rasional dalam z, z̄, x, y, turunan, konjugat harmonik polinomial, antiturunan polinomial. Numerik (dengan pengecekan yang disebutkan di langkah): integral kontur, limit lewat lintasan, residu orde tinggi, koefisien Taylor/Laurent, pencarian titik singular untuk penyebut non-polinomial.', 'Symbolic: arithmetic and polar form (exact values such as √2, π/4 are recognised), u and v for functions polynomial/rational in z, z̄, x, y, derivatives, polynomial harmonic conjugates, polynomial antiderivatives. Numeric (with the checks stated in the steps): contour integrals, limits along paths, higher-order residues, Taylor/Laurent coefficients, singular-point search for non-polynomial denominators.')}</p>
    </section>
  </div>
}
