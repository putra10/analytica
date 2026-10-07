import { DiagramViewport } from '../ui/DiagramViewport'
import { useLang } from '../../lib/i18n'
import type { ReactNode as DiagramNode } from 'react'
import { useMemo, useState } from 'react'
import { useT } from '../../lib/i18n'
import type { VisualKind } from '../../content/summary-lessons'
import type { Complex } from '../../lib/complex-math'
import { C, abs, toTex } from '../../lib/complex-math'
import { ComplexSyllabusError, indexedExperiment, indexedFamily, realParameterExperiment, infinityResidueExperiment, factorOrderExperiment, type IndexedFamily, type SyllabusText } from '../../lib/complex-syllabus'
import { Tex } from '../ui/FormulaBlock'

const inputClass = 'mt-1 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-slate-100'
function Field({ label, value, onChange, numeric = false }: { label: string; value: string | number; onChange: (value: string) => void; numeric?: boolean }) {
  return <label className="block min-w-0 text-xs text-slate-400">{label}<input className={inputClass} aria-label={label} value={value} inputMode={numeric ? 'decimal' : 'text'} maxLength={300} spellCheck={false} onChange={e => onChange(e.target.value)} /></label>
}
function safe<T>(f: () => T): { ok: true; value: T } | { ok: false; error: SyllabusText } {
  try { return { ok: true, value: f() } } catch (e) {
    return { ok: false, error: e instanceof ComplexSyllabusError ? e.text : { id: 'Rumus atau nilai belum valid. Periksa masukan dan hindari titik yang tidak terdefinisi.', en: 'The formula or value is invalid. Check inputs and avoid undefined points.' } }
  }
}
function numberInput(value: string): number {
  if (!value.trim()) throw new ComplexSyllabusError('Isi setiap masukan numerik.', 'Fill in every numeric input.')
  return Number(value)
}
function ErrorNote({ error }: { error: SyllabusText }) { const t = useT(); return <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{t(error.id, error.en)}</p> }
function Value({ label, value }: { label: string; value: Complex }) { return <div className="min-w-0 rounded-lg border border-border p-3"><p className="text-xs text-slate-400">{label}</p><Tex block tex={String.raw`\approx ${toTex(value, 6)}`} /></div> }

function Trace({ points, target, label }: { points: Complex[]; target?: Complex; label: string }) {
  const t = useT(), all = target ? [...points, target, C(0)] : [...points, C(0)]
  const minX = Math.min(...all.map(z => z.re)), maxX = Math.max(...all.map(z => z.re)), minY = Math.min(...all.map(z => z.im)), maxY = Math.max(...all.map(z => z.im))
  const span = Math.max(maxX - minX, maxY - minY, 1e-6), centerX = minX / 2 + maxX / 2, centerY = minY / 2 + maxY / 2
  const map = (z: Complex): [number, number] => [240 + (z.re - centerX) * 210 / span, 135 - (z.im - centerY) * 210 / span]
  const path = points.map((z, j) => `${j ? 'L' : 'M'}${map(z).join(',')}`).join(' '), origin = map(C(0)), end = map(points[points.length - 1]), start = map(points[0])
  return <figure className="min-w-0 rounded-lg border border-border bg-card p-2"><LabDiagram><svg viewBox="0 0 480 280" className="block w-full" role="img" aria-label={label}>
    <title>{label}</title><path d={`M20,${origin[1]}H460 M${origin[0]},25V245`} stroke="var(--border)" />
    <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
    {points.filter((_, j) => j % Math.max(1, Math.floor(points.length / 80)) === 0).map((z, j) => <circle key={j} cx={map(z)[0]} cy={map(z)[1]} r="2" fill="var(--accent)" />)}
    <circle cx={start[0]} cy={start[1]} r="4" fill="var(--warn)" /><circle cx={end[0]} cy={end[1]} r="4" fill="var(--success)" />
    {target && <circle cx={map(target)[0]} cy={map(target)[1]} r="7" fill="none" stroke="var(--violet)" strokeWidth="2" />}
    <text x="449" y="267" fontSize="12" fill="var(--fg-2)">Re</text><text x="20" y="20" fontSize="12" fill="var(--fg-2)">Im</text>
  </svg></LabDiagram><figcaption className="px-2 pb-1 text-xs leading-relaxed text-slate-400">{label} · {t('Skala otomatis sama pada kedua sumbu. Kuning: awal; hijau: akhir; lingkaran ungu: target. Garis hanya menghubungkan sampel.', 'Automatic equal scale on both axes. Yellow: start; green: end; purple ring: target. Lines only connect samples.')}</figcaption></figure>
}

function IndexedLab({ series }: { series: boolean }) {
  const t = useT(), [family, setFamily] = useState<IndexedFamily>('geometric'), [custom, setCustom] = useState('(1+i)/n'), [q, setQ] = useState('0.5+0.25i'), [p, setP] = useState('1'), [count, setCount] = useState('60'), [limit, setLimit] = useState('0')
  const data = useMemo(() => safe(() => {
    const info = indexedFamily(family, q, numberInput(p), series), expression = family === 'custom' ? custom : info.expression
    const target = info.target ? `${info.target.re}+(${info.target.im})i` : limit
    return { ...indexedExperiment(expression, numberInput(count), target), info, expression }
  }), [family, q, p, series, custom, count, limit])
  const formula = data.ok ? data.value.expression : custom
  return <div className="space-y-4" data-complex-experiment={series ? 'series' : 'sequence'}>
    <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs text-slate-400">{t('Keluarga', 'Family')}<select aria-label={t('Keluarga', 'Family')} className={inputClass} value={family} onChange={e => setFamily(e.target.value as IndexedFamily)}>
      <option value="geometric">q^n</option><option value="p">1/n^p</option>{series && <option value="alternating">(−1)^(n−1)/n^p</option>}<option value="custom">{t('Kustom', 'Custom')}</option>
    </select></label><Field label="N (2–500)" value={count} numeric onChange={setCount} />
      {family === 'geometric' && <Field label="q" value={q} onChange={setQ} />}{(family === 'p' || family === 'alternating') && <Field label="p (−10…10)" value={p} numeric onChange={setP} />}
      <Field label={t('Rumus suku aₙ (ubah → kustom)', 'Term aₙ formula (edit → custom)')} value={formula} onChange={v => { setCustom(v); setFamily('custom') }} />
      <Field label={t('Target L kustom (bukan hasil solver)', 'Custom target L (not a solver result)')} value={limit} onChange={setLimit} />
    </div>
    <p className="text-xs text-slate-400">{t('Indeks mulai dari n=1. Fungsi exp, log, sin, cos, sqrt, abs, re, im, conj tersedia. Target otomatis dipakai hanya saat keluarga mempunyai limit yang diketahui.', 'Indices start at n=1. Functions exp, log, sin, cos, sqrt, abs, re, im, conj are available. An automatic target is used only when the family has a known limit.')}</p>
    {!data.ok ? <ErrorNote error={data.error} /> : <>
      <p className="rounded-lg border border-border p-3 text-sm leading-relaxed">{t(data.value.info.conclusion.id, data.value.info.conclusion.en)}</p>
      <Trace points={data.value.points.map(pt => series ? pt.sum : pt.term)} target={data.value.limit} label={series ? t('Jumlah parsial Sₙ di bidang kompleks', 'Partial sums Sₙ in the complex plane') : t('Suku aₙ di bidang kompleks', 'Terms aₙ in the complex plane')} />
      <div className="grid gap-3 sm:grid-cols-2"><Value label={series ? 'S_N' : 'a_N'} value={series ? data.value.points.at(-1)!.sum : data.value.points.at(-1)!.term} /><Value label={t('Target yang dibandingkan', 'Comparison target')} value={data.value.limit} /></div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-slate-400">{series ? '|S_N−L|' : '|a_N−L|'}</dt><dd className="font-mono">{(series ? data.value.sumError : data.value.termError).toPrecision(5)}</dd></div><div><dt className="text-slate-400">{t('Diameter maksimal 20 sampel akhir', 'Diameter of up to 20 final samples')}</dt><dd className="font-mono">{(series ? data.value.sumDiameter : data.value.termDiameter).toPrecision(5)}</dd></div><div><dt className="text-slate-400">|a_N|</dt><dd className="font-mono">{abs(data.value.points.at(-1)!.term).toPrecision(5)}</dd></div><div><dt className="text-slate-400">|a_N/a_(N−1)| {t('(sampel)', '(sample)')}</dt><dd className="font-mono">{data.value.ratio?.toPrecision(5) ?? t('tak terdefinisi', 'undefined')}</dd></div></dl>
      <details className="rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm text-accent">{t('Lihat sepuluh sampel terakhir', 'See the final ten samples')}</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th>n</th><th>aₙ</th><th>Sₙ</th></tr></thead><tbody>{data.value.points.slice(-10).map(pt => <tr key={pt.n}><td className="py-1">{pt.n}</td><td><Tex tex={toTex(pt.term, 5)} /></td><td><Tex tex={toTex(pt.sum, 5)} /></td></tr>)}</tbody></table></div></details>
      <p className="text-xs leading-relaxed text-slate-400">{t('Diameter ekor kecil dan rasio satu pasangan belum membuktikan konvergensi. Suku menuju 0 adalah syarat perlu deret, bukan cukup: bandingkan Σ1/n. Kriteria keluarga di atas berasal dari teorema, sedangkan titik dan galat ditampilkan sebagai nilai numerik.', 'A small sampled tail and a ratio of one pair do not prove convergence. Terms tending to 0 are necessary for a series, not sufficient: compare Σ1/n. Family conclusions above follow from theorems; plotted points and errors are numerical values.')}</p>
    </>}
  </div>
}

function RealParameterLab() {
  const t = useT(), [src, setSrc] = useState('cos(t)+i*sin(t)'), [at, setAt] = useState('1'), [h, setH] = useState('0.01'), [a, setA] = useState('0'), [b, setB] = useState('3.141592653589793')
  const data = useMemo(() => safe(() => realParameterExperiment(src, numberInput(at), numberInput(h), numberInput(a), numberInput(b))), [src, at, h, a, b])
  return <div className="space-y-4" data-complex-experiment="real-parameter"><Field label="w(t), t ∈ ℝ" value={src} onChange={setSrc} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Field label="t₀" value={at} numeric onChange={setAt} /><Field label="h" value={h} numeric onChange={setH} /><Field label="a" value={a} numeric onChange={setA} /><Field label="b" value={b} numeric onChange={setB} /></div>
    {!data.ok ? <ErrorNote error={data.error} /> : <>
      <Tex block tex={String.raw`w'(t_0)\approx\frac{w(t_0+h/2)-w(t_0-h/2)}h;\qquad\int_a^b w(t)\,dt\approx\text{Simpson}_{200}`} />
      <Trace points={data.value.points.map(pt => pt.z)} target={data.value.at} label={t('Lintasan w(t), dari a ke b', 'Trace of w(t), from a to b')} />
      <div className="grid gap-3 sm:grid-cols-2"><Value label={t('Turunan numerik w′(t₀)', 'Numerical derivative w′(t₀)')} value={data.value.derivative} /><Value label={t('Integral definit numerik', 'Numerical definite integral')} value={data.value.integral} /><Value label={t('Kuosien selisih kiri', 'Left difference quotient')} value={data.value.left} /><Value label={t('Kuosien selisih kanan', 'Right difference quotient')} value={data.value.right} /></div>
      <p className="text-xs leading-relaxed text-slate-400">{t('Perubahan saat h dibagi dua', 'Change when h is halved')}: {data.value.derivativeDifference.toPrecision(4)}. {t('Selisih Simpson 100 dan 200 panel', 'Difference between Simpson with 100 and 200 panels')}: {data.value.integralDifference.toPrecision(4)}.</p>
      <p className="text-sm leading-relaxed">{t('Turunan terhadap parameter real memerlukan limit kiri dan kanan sama. Untuk w=u+iv, w′=u′+iv′; aturan ini tidak mensyaratkan CR. Coba abs(t) pada t₀=0: selisih simetris nol, tetapi kuosien kiri dan kanan berbeda sehingga turunan tidak ada.', 'A derivative with respect to a real parameter needs equal left and right limits. For w=u+iv, w′=u′+iv′; CR is not required. Try abs(t) at t₀=0: the symmetric difference is zero, but left and right quotients disagree, so no derivative exists.')}</p>
      <p className="text-xs leading-relaxed text-slate-400">{t('Dua resolusi bukan batas galat tersertifikasi. Rumus boleh memiliki titik singular di antara sampel; pastikan fungsi kontinu untuk integral biasa. Ini menghitung ∫w(t)dt, bukan ∫f(z)dz tanpa faktor z′(t).', 'Two resolutions are not a certified error bound. A formula may have singular points between samples; establish continuity for an ordinary integral. This computes ∫w(t)dt, not ∫f(z)dz without the factor z′(t).')}</p>
    </>}
  </div>
}

function InfinityLab() {
  const t = useT(), [src, setSrc] = useState('(5z-2)/(z*(z-1))'), [radius, setRadius] = useState('2')
  const data = useMemo(() => safe(() => infinityResidueExperiment(src, numberInput(radius))), [src, radius])
  return <div className="space-y-4" data-complex-experiment="infinity"><Field label="f(z)=P(z)/Q(z)" value={src} onChange={setSrc} /><Field label={t('Radius R untuk pemeriksaan lingkaran', 'Radius R for the circle cross-check')} value={radius} numeric onChange={setRadius} />
    {!data.ok ? <ErrorNote error={data.error} /> : <><Tex block tex={String.raw`\operatorname{Res}_{\infty}f=-[z^{-1}]f(z)=-\operatorname{Res}_{w=0}\frac{f(1/w)}{w^2}`} /><div className="grid gap-3 sm:grid-cols-2"><Value label={t('Koefisien z⁻¹ dari pembagian deret formal', 'Coefficient of z⁻¹ from formal series division')} value={data.value.coefficient} /><Value label="Res∞ f" value={data.value.residue} /></div>
      <p className="text-sm leading-relaxed">{t('Derajat P dan Q', 'Degrees of P and Q')}: {data.value.degreeNumerator}, {data.value.degreeDenominator}. {t('Balik koefisien: P(1/w)/Q(1/w)=w^(deg Q−deg P)·P̃(w)/Q̃(w). Bagi deret P̃/Q̃ sampai indeks yang menghasilkan w¹; koefisien w¹ menjadi koefisien z⁻¹. Jika indeks negatif, koefisiennya nol.', 'Reverse coefficients: P(1/w)/Q(1/w)=w^(deg Q−deg P)·P̃(w)/Q̃(w). Divide P̃/Q̃ through the index producing w¹; its coefficient is the coefficient of z⁻¹. If this index is negative, the coefficient is zero.')}</p>
      <Trace points={data.value.points} label={t('Lingkaran z=Reⁱᶿ, orientasi positif', 'Circle z=Reⁱᶿ, positive orientation')} /><Value label={t('(1/2πi)∮ f(z)dz, estimasi pada lingkaran', '(1/2πi)∮ f(z)dz, sampled circle estimate')} value={data.value.finiteResidueSum} />
      <p className="text-xs leading-relaxed text-slate-400">{t('Selisih dengan −Res∞', 'Difference from −Res∞')}: {data.value.discrepancy.toPrecision(4)}. {t('Perubahan 256→512 sampel', 'Change from 256 to 512 samples')}: {data.value.sampleDifference.toPrecision(4)}.</p>
      <p className="text-xs leading-relaxed text-slate-400">{t('Pembagian koefisien memakai aljabar fungsi rasional dengan aritmetika floating point. Pemeriksaan lingkaran cocok dengan −Res∞ hanya jika semua kutub finite berada di dalam dan tidak ada di lintasan. Perubahan kecil antar resolusi tidak membuktikan syarat ini; lingkaran yang tepat melewati kutub harus ditolak.', 'Coefficient division uses rational-function algebra with floating-point arithmetic. The circle check equals −Res∞ only if every finite pole lies inside and none lies on the path. A small resolution change does not prove this condition; a circle passing through a pole must be rejected.')}</p>
    </>}
  </div>
}

function FactorLab({ kind }: { kind: VisualKind }) {
  const t = useT(), [a, setA] = useState('0'), [c, setC] = useState('1+i'), [m, setM] = useState(kind === 'cxLocalBehavior' ? '1' : '3'), [n, setN] = useState(kind === 'cxZeros' ? '0' : kind === 'cxLocalBehavior' ? '3' : '1'), [radius, setRadius] = useState('0.5')
  const data = useMemo(() => safe(() => factorOrderExperiment(a, c, numberInput(m), numberInput(n), numberInput(radius))), [a, c, m, n, radius])
  return <div className="space-y-4" data-complex-experiment="order"><Tex block tex={String.raw`f(z)=\frac{c(z-a)^m}{(z-a)^n},\quad c\ne0;\qquad \operatorname{ord}_a f=m-n`} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Field label="a" value={a} onChange={setA} /><Field label="c ≠ 0" value={c} onChange={setC} /><Field label="m (0–12)" value={m} numeric onChange={setM} /><Field label="n (0–12)" value={n} numeric onChange={setN} /><Field label="r (0.01–5)" value={radius} numeric onChange={setRadius} /></div>
    {!data.ok ? <ErrorNote error={data.error} /> : <><p className="rounded-lg border border-border p-3 text-sm">{t(data.value.classification.id, data.value.classification.en)}</p><div className="grid gap-3 md:grid-cols-2"><Trace points={data.value.inputs} target={data.value.center} label={t('Satu putaran mengelilingi a', 'One turn around a')} /><Trace points={data.value.images} label={t(`Citra: ${data.value.order} putaran bertanda`, `Image: ${data.value.order} signed turns`)} /></div><p className="text-sm leading-relaxed">|f| {t('pada r', 'at r')}: {data.value.modulus.toPrecision(5)}; {t('pada r/2', 'at r/2')}: {data.value.innerModulus.toPrecision(5)}. {t('Orde positif membuat modulus mengecil dan putaran positif; orde negatif membuat modulus membesar dan putaran terbalik.', 'Positive order decreases the modulus and gives positive winding; negative order increases the modulus and reverses winding.')}</p><p className="text-xs leading-relaxed text-slate-400">{t('Orde di sini berasal tepat dari pangkat faktor yang Anda deklarasikan, bukan tebakan Newton atau ambang numerik. Jika n>0, a tetap dikeluarkan dari fungsi asal walaupun faktor dapat dicoret; perluasan removable harus disebut terpisah. Model ini adalah monomial lokal, bukan klasifikasi otomatis fungsi arbitrer.', 'The order comes exactly from the factor exponents you declare, not Newton guesses or numerical thresholds. If n>0, a remains excluded from the original function even after cancellation; a removable extension is a separate function. This is a local monomial model, not automatic classification of arbitrary formulas.')}</p></>}
  </div>
}

export function ComplexSyllabusLab({ kind }: { kind: VisualKind }) {
  const t = useT()
  const mode = kind === 'cxSequences' ? 'sequence' : kind === 'cxSeriesConvergence' || kind === 'cxPowerSeries' ? 'series' : kind === 'cxRealParameter' ? 'real' : kind === 'cxResidueInfinity' ? 'infinity' : ['cxZeros', 'cxZeroPole', 'cxLocalBehavior'].includes(kind) ? 'order' : null
  if (!mode) return null
  return <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4" data-complex-syllabus-lab={kind} data-syllabus-experiment={kind}><h3 className="font-display text-2xl">{t('Eksperimen yang dapat dihitung ulang', 'An experiment you can recalculate')}</h3>{mode === 'sequence' || mode === 'series' ? <IndexedLab key={mode} series={mode === 'series'} /> : mode === 'real' ? <RealParameterLab /> : mode === 'infinity' ? <InfinityLab /> : <FactorLab key={kind} kind={kind} />}</section>
}

function LabDiagram({children}:{children:DiagramNode}){const {lang}=useLang();return <DiagramViewport lang={lang}>{children}</DiagramViewport>}
