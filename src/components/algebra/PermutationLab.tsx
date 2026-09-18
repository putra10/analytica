import { useMemo, useState } from 'react'
import { BookOpen, Shuffle } from 'lucide-react'
import { compose, cycleTex, cycles, inverse, isEven, order, parsePerm, transpositions, twoRowTex, type Perm } from '../../lib/permutations'
import { useT } from '../../lib/i18n'
import { Canvas2D, type View2D } from '../ui/Canvas2D'
import { Layout } from '../ui/Layout'
import { MathCard, Chip } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb923c', '#2dd4bf', '#f87171']

/** Cycle diagram: the n points on a circle with arrows i → σ(i). */
function drawPerm(ctx: CanvasRenderingContext2D, v: View2D, p: Perm, label: string) {
  const n = p.length
  const R = Math.min(v.W, v.H) * 0.36
  const pos = (i: number): [number, number] => [v.W / 2 + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), v.H / 2 + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)]
  const cyc = cycles(p)
  const colorOf = new Map<number, string>()
  cyc.forEach((c, k) => c.forEach((x) => colorOf.set(x - 1, COLORS[k % COLORS.length])))
  ctx.font = '600 14px ui-monospace, monospace'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(label, 16, 24)
  for (let i = 0; i < n; i++) {
    const j = p[i]
    const [x1, y1] = pos(i), [x2, y2] = pos(j)
    const color = colorOf.get(i) ?? '#475569'
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2
    if (i === j) {
      // fixed point: small loop
      ctx.beginPath(); ctx.arc(x1 + 14 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y1 + 14 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2), 9, 0, Math.PI * 2); ctx.stroke()
      continue
    }
    // curved arrow bending toward the centre
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    const cx = mx + (v.W / 2 - mx) * 0.35, cy = my + (v.H / 2 - my) * 0.35
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke()
    const ang = Math.atan2(y2 - cy, x2 - cx)
    const hx = x2 - 16 * Math.cos(ang), hy = y2 - 16 * Math.sin(ang)
    ctx.beginPath(); ctx.moveTo(hx + 9 * Math.cos(ang), hy + 9 * Math.sin(ang)); ctx.lineTo(hx - 6 * Math.cos(ang - 0.5), hy - 6 * Math.sin(ang - 0.5)); ctx.lineTo(hx - 6 * Math.cos(ang + 0.5), hy - 6 * Math.sin(ang + 0.5)); ctx.closePath(); ctx.fill()
  }
  for (let i = 0; i < n; i++) {
    const [x, y] = pos(i)
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'; ctx.fill()
    ctx.strokeStyle = colorOf.get(i) ?? '#475569'; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = '#e2e8f0'; ctx.font = '600 13px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(i + 1), x, y)
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
  }
}

// several taken from Herstein's problems (3.1 #1, 3.2 #2-3) and the 13-card shuffle
const EXAMPLES: { n: number; s: string; t: string; label: string }[] = [
  { n: 5, s: '(1 2 3)(4 5)', t: '(2 5)', label: '(1 2 3)(4 5)' },
  { n: 6, s: '6 4 5 2 1 3', t: '2 3 4 5 6 1', label: '3.1 #1(a)' },
  { n: 9, s: '3 1 4 2 7 6 9 8 5', t: '(1 2 3)', label: '3.2 #2(a)' },
  { n: 7, s: '(1 2 3 5 7)(2 4 7 6)', t: '(1 2)(1 3)(1 4)', label: '3.2 #3(a)' },
  { n: 13, s: '3 4 5 6 7 8 9 10 11 12 13 1 2', t: '(1 12 11 10 9 8 7 6 5 4 3 2)', label: 'shuffle' },
  { n: 4, s: '(1 2 3 4)', t: '(1 3)', label: 'D₄ ⊂ S₄' },
]

export function PermutationLab() {
  const t = useT()
  const [n, setN] = useState(5)
  const [sText, setSText] = useState('(1 2 3)(4 5)')
  const [tText, setTText] = useState('(2 5)')
  const [view, setView] = useState<'s' | 't' | 'st' | 'ts'>('s')
  const sigma = useMemo(() => parsePerm(sText, n), [sText, n])
  const tau = useMemo(() => parsePerm(tText, n), [tText, n])
  const st = sigma && tau ? compose(sigma, tau) : null
  const ts = sigma && tau ? compose(tau, sigma) : null
  const shown = view === 's' ? sigma : view === 't' ? tau : view === 'st' ? st : ts
  const shownLabel = view === 's' ? 'σ' : view === 't' ? 'τ' : view === 'st' ? 'στ' : 'τσ'

  const info = (p: Perm, name: string) => {
    const tr = transpositions(p)
    return (
      <div className="space-y-1">
        <FormulaBlock tex={`${name} = ${twoRowTex(p)} = ${cycleTex(p)}`} />
        <FormulaBlock tex={`${name}^{-1} = ${cycleTex(inverse(p))},\\quad o(${name}) = \\operatorname{lcm}(${cycles(p).map((c) => c.length).join(', ') || '1'}) = ${order(p)}`} />
        <FormulaBlock tex={`${name} = ${tr.length ? tr.map(([a, b]) => `(${a}\\;${b})`).join('') : 'e'}:\\ ${tr.length}\\ \\text{${t('transposisi', 'transpositions')}} \\Rightarrow ${isEven(p) ? '\\text{' + t('genap', 'even') + '}' : '\\text{' + t('ganjil', 'odd') + '}'}${isEven(p) ? `,\\ ${name} \\in A_{${n}}` : ''}`} />
      </div>
    )
  }

  return (
    <Layout
      canvas={<Canvas2D unit={1} draw={(ctx, v) => shown && drawPerm(ctx, v, shown, shownLabel)} deps={[shown, shownLabel]} />}
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex={`S_{${n}}`} /></span>} icon={<Shuffle size={16} />}>
            <Slider label={<Tex tex="n" />} value={n} min={2} max={13} step={1} onChange={(v) => setN(v)} format={(v) => String(v)} />
            <div className="mt-3 space-y-2">
              {[['σ', sText, setSText, sigma], ['τ', tText, setTText, tau]].map(([name, text, set, val]) => (
                <label key={name as string} className="block">
                  <span className="text-[11px] text-slate-400">{name as string}</span>
                  <input
                    value={text as string}
                    onChange={(e) => (set as (s: string) => void)(e.target.value)}
                    className={`mt-0.5 w-full rounded-md border bg-slate-900/60 px-2 py-1 font-mono text-sm text-slate-100 outline-none ${val ? 'border-border' : 'border-rose-500/60'}`}
                    placeholder="(1 2 3)(4 5)  atau  2 3 1 5 4"
                  />
                </label>
              ))}
              <p className="text-[11px] text-slate-500">{t('Notasi siklus atau notasi satu baris (baris kedua dari simbol dua baris).', 'Cycle notation or one-line notation (second row of the two-row symbol).')}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => <Chip key={i} onClick={() => { setN(ex.n); setSText(ex.s); setTText(ex.t) }}>{ex.label}</Chip>)}
            </div>
          </MathCard>
          <MathCard title={t('Diagram', 'Diagram')}>
            <div className="grid grid-cols-4 gap-1.5">
              {(['s', 't', 'st', 'ts'] as const).map((k) => <Chip key={k} active={view === k} onClick={() => setView(k)}>{{ s: 'σ', t: 'τ', st: 'στ', ts: 'τσ' }[k]}</Chip>)}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{t('Panah i → σ(i); tiap siklus berwarna sendiri.', 'Arrows i → σ(i); each cycle has its own colour.')}</p>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Dekomposisi siklus', 'Cycle decomposition')} icon={<Shuffle size={16} />}>
            {sigma ? info(sigma, '\\sigma') : <p className="text-xs text-rose-300">σ {t('tidak valid', 'is invalid')}</p>}
            <div className="mt-2 border-t border-border pt-2">{tau ? info(tau, '\\tau') : <p className="text-xs text-rose-300">τ {t('tidak valid', 'is invalid')}</p>}</div>
          </MathCard>
          <MathCard title={t('Hasil kali', 'Products')} icon={<Shuffle size={16} />}>
            {st && ts ? (
              <div className="space-y-1">
                <FormulaBlock tex={`\\sigma\\tau = ${twoRowTex(st)} = ${cycleTex(st)}`} />
                <FormulaBlock tex={`\\tau\\sigma = ${twoRowTex(ts)} = ${cycleTex(ts)}`} />
                <p className="text-xs text-slate-400">
                  {st.every((x, i) => x === ts[i]) ? t('στ = τσ: keduanya komut (mis. siklus saling lepas).', 'στ = τσ: they commute (e.g. disjoint cycles).') : t('στ ≠ τσ: Sₙ tak-abelian untuk n ≥ 3.', 'στ ≠ τσ: Sₙ is non-abelian for n ≥ 3.')}
                </p>
                <p className="text-xs text-slate-400">
                  {t(<>Konvensi Herstein: <Tex tex="(\sigma\tau)(s) = \sigma(\tau(s))" />, jadi <Tex tex="\tau" /> bekerja lebih dahulu. Baca kolom <Tex tex="k" /> dari <Tex tex="\tau" />, lalu cari hasilnya pada baris atas <Tex tex="\sigma" />.</>,
                     <>Herstein's convention: <Tex tex="(\sigma\tau)(s) = \sigma(\tau(s))" />, so <Tex tex="\tau" /> acts first. Read column <Tex tex="k" /> of <Tex tex="\tau" />, then look the result up in the top row of <Tex tex="\sigma" />.</>)}
                </p>
              </div>
            ) : <p className="text-xs text-slate-500">…</p>}
          </MathCard>
          <MathCard title={t('Teori (Herstein Bab 3)', 'Theory (Herstein Ch. 3)')} icon={<BookOpen size={16} />}>
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              {t(
                <>
                  <p>Setiap permutasi adalah hasil kali siklus-siklus saling lepas, tunggal kecuali urutannya (Teorema 3.2.2). Ordenya adalah KPK panjang siklus-siklusnya (Teorema 3.2.4).</p>
                  <p>Siklus <Tex tex="(a_1\,a_2\cdots a_k) = (a_1\,a_k)(a_1\,a_{k-1})\cdots(a_1\,a_2)" /> adalah hasil kali <Tex tex="k-1" /> transposisi (Teorema 3.2.5). Paritas banyaknya transposisi tidak bergantung pada dekomposisi: permutasi genap/ganjil terdefinisi dengan baik.</p>
                  <p>Permutasi genap membentuk grup alternating <Tex tex="A_n" />, subgrup normal berindeks 2 dalam <Tex tex="S_n" /> (kernel dari homomorfisma tanda <Tex tex="S_n \to \{1,-1\}" />), <Tex tex="|A_n| = n!/2" />.</p>
                </>,
                <>
                  <p>Every permutation is a product of disjoint cycles, unique up to order (Theorem 3.2.2). Its order is the lcm of the cycle lengths (Theorem 3.2.4).</p>
                  <p>A cycle <Tex tex="(a_1\,a_2\cdots a_k) = (a_1\,a_k)(a_1\,a_{k-1})\cdots(a_1\,a_2)" /> is a product of <Tex tex="k-1" /> transpositions (Theorem 3.2.5). The parity of the number of transpositions does not depend on the decomposition: even/odd permutations are well defined.</p>
                  <p>The even permutations form the alternating group <Tex tex="A_n" />, a normal subgroup of index 2 in <Tex tex="S_n" /> (the kernel of the sign homomorphism <Tex tex="S_n \to \{1,-1\}" />), <Tex tex="|A_n| = n!/2" />.</p>
                </>,
              )}
            </div>
          </MathCard>
        </div>
      }
    />
  )
}
