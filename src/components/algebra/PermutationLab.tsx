import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, ListOrdered, Shuffle } from 'lucide-react'
import { compose, cycleTex, cycles, inverse, isEven, order, parsePerm, transpositions, twoRowTex, type Perm } from '../../lib/permutations'
import { useT } from '../../lib/i18n'
import { MathCard, Chip, TextField } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { C, T, type P } from '../stories/kit'
import { Bend, LabLayout, Link, Node, Pic, PicCard, Steps } from './pics'
import { clockAt, pal, textW } from './pic-utils'

const lcmStr = (p: Perm) => cycles(p).map((c) => c.length).join(', ') || '1'

/** The n symbols on a circle, an arrow i → σ(i) for every moved symbol, one colour per cycle. */
function LoopPicture({ p, name }: { p: Perm; name: string }) {
  const t = useT()
  const n = p.length, cs = cycles(p), ctr: P = [150, 152], R = n > 9 ? 116 : 106, at = clockAt(ctr, R, n)
  const r = n > 9 ? 13 : 15, size = n > 9 ? 12 : 14
  const colorOf = new Map<number, string>()
  cs.forEach((c, k) => c.forEach((x) => colorOf.set(x - 1, pal(k, cs.length))))
  // the cycles as text, wrapped to the side panel
  const lines: { s: string; color: string }[] = []
  cs.forEach((c, k) => {
    let cur = '('
    c.forEach((x, j) => {
      const piece = `${x}${j < c.length - 1 ? ' ' : ')'}`
      if (textW(cur + piece, 16) > 160) { lines.push({ s: cur, color: pal(k, cs.length) }); cur = '  ' }
      cur += piece
    })
    lines.push({ s: cur, color: pal(k, cs.length) })
  })
  const shown = lines.slice(0, 6)
  return (
    <Pic h={300} label={t('Permutasi sebagai panah dan putaran', 'A permutation as arrows and loops')}>
      <circle cx={ctr[0]} cy={ctr[1]} r={R} fill="none" stroke={C.faint} />
      {p.map((y, i) => {
        if (y === i) {
          const a = -Math.PI / 2 + (2 * Math.PI * i) / n, o: P = [at(i)[0] + (r + 9) * Math.cos(a), at(i)[1] + (r + 9) * Math.sin(a)]
          return <circle key={i} cx={o[0]} cy={o[1]} r={8} fill="none" stroke={C.mu} strokeWidth="1.8" />
        }
        return <Bend key={i} p={at(i)} q={at(y)} color={colorOf.get(i)!} bend={0.16} r={r + 3} width={2.5} />
      })}
      {p.map((y, i) => <Node key={i} at={at(i)} label={String(i + 1)} r={r} size={size} fill={y === i ? C.bg : colorOf.get(i)!} stroke={y === i ? C.ln : colorOf.get(i)!} />)}
      <T x={300} y={40} anchor="start" size={18} weight={700} color={C.a}>{name} =</T>
      {cs.length === 0 && <T x={300} y={70} anchor="start" size={16}>e</T>}
      {shown.map((l, i) => <T key={i} x={300} y={70 + i * 24} anchor="start" size={16} weight={600} color={l.color}>{l.s}</T>)}
      {lines.length > 6 && <T x={300} y={70 + 6 * 24} anchor="start" size={14} color={C.mu}>…</T>}
      <T x={300} y={242} anchor="start" size={15}>o({name}) = {order(p)}</T>
      <rect x={300} y={256} width={110} height={28} rx={14} fill={isEven(p) ? C.g : C.r} fillOpacity=".18" stroke={isEven(p) ? C.g : C.r} />
      <T x={355} y={275} size={14} weight={700} color={isEven(p) ? C.g : C.r}>{isEven(p) ? t('genap +1', 'even +1') : t('ganjil −1', 'odd −1')}</T>
    </Pic>
  )
}

/** Composition στ as a ladder: τ acts first (top to middle), then σ (middle to bottom). */
function Ladder({ first, second, names }: { first: Perm; second: Perm; names: [string, string] }) {
  const t = useT()
  const n = first.length, gap = n > 1 ? Math.min(52, (462 - 96) / (n - 1)) : 0, x0 = Math.max(96, 270 - ((n - 1) * gap) / 2)
  const x = (i: number) => x0 + i * gap, r = n > 9 ? 11 : 14, size = n > 9 ? 11 : 13
  const ys = [44, 152, 260]
  return (
    <Pic h={300} label={t('Komposisi sebagai tangga', 'Composition as a ladder')}>
      <T x={14} y={ys[0] + 5} anchor="start" size={14} color={C.mu}>x</T>
      <T x={14} y={ys[1] + 5} anchor="start" size={14} color={C.a}>{names[1]}(x)</T>
      <T x={14} y={ys[2] + 5} anchor="start" size={14} color={C.g}>{names[0]}({names[1]}(x))</T>
      {first.map((y, i) => <Link key={`a${i}`} p={[x(i), ys[0]]} q={[x(y), ys[1]]} color={i === 0 ? C.v : C.a} width={i === 0 ? 3 : 1.6} r1={r + 1} r2={r + 3} />)}
      {first.map((y, i) => <Link key={`b${i}`} p={[x(y), ys[1]]} q={[x(second[y]), ys[2]]} color={i === 0 ? C.v : C.g} width={i === 0 ? 3 : 1.6} r1={r + 1} r2={r + 3} />)}
      {ys.map((yy, row) => first.map((_, i) => <Node key={`${row}-${i}`} at={[x(i), yy]} label={String(i + 1)} r={r} size={size} fill={C.bg} stroke={C.ln} />))}
      <T x={x0 - 34} y={(ys[0] + ys[1]) / 2 + 5} size={14} weight={700} color={C.a}>{names[1]}</T>
      <T x={x0 - 34} y={(ys[1] + ys[2]) / 2 + 5} size={14} weight={700} color={C.g}>{names[0]}</T>
    </Pic>
  )
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
  const shownName = { s: 'σ', t: 'τ', st: 'στ', ts: 'τσ' }[view]
  const texName = { s: '\\sigma', t: '\\tau', st: '\\sigma\\tau', ts: '\\tau\\sigma' }[view]

  // the walk a student writes: start at the smallest unused symbol and follow it home
  const decomposition = (p: Perm, name: string) => {
    const cs = cycles(p), fixed = p.flatMap((y, i) => (y === i ? [i + 1] : []))
    const out: { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }[] = cs.map((c, k) => ({
      text: k === 0
        ? t(`Mulai dari ${c[0]} dan ikuti panah sampai kembali ke ${c[0]}: itu satu siklus.`, `Start at ${c[0]} and follow the arrows until you are back at ${c[0]}: that is one cycle.`)
        : t(`Ambil simbol terkecil yang belum dipakai, ${c[0]}, dan ulangi.`, `Take the smallest unused symbol, ${c[0]}, and repeat.`),
      tex: `${[...c, c[0]].join(' \\to ')} \\;\\Rightarrow\\; (${c.join('\\;')})`,
    }))
    if (!cs.length) out.push({ text: t('Setiap simbol tetap: ini identitas.', 'Every symbol stays put: this is the identity.'), tex: `${name} = e` })
    if (fixed.length && cs.length) out.push({ text: t(`Simbol tetap ${fixed.join(', ')} tidak ditulis.`, `The fixed symbols ${fixed.join(', ')} are left out.`), tex: `${name} = ${cycleTex(p)}` })
    out.push({ text: t('Orde = KPK panjang siklus-siklus yang saling lepas.', 'Order = lcm of the lengths of the disjoint cycles.'), tex: `o(${name}) = \\operatorname{lcm}(${lcmStr(p)}) = ${order(p)}` })
    const tr = transpositions(p)
    if (cs.length) out.push({
      text: t('Pecah setiap siklus k unsur menjadi k − 1 transposisi: (a₁ a₂ … a_k) = (a₁ a_k)(a₁ a_{k−1}) … (a₁ a₂).', 'Break each k-cycle into k − 1 transpositions: (a₁ a₂ … a_k) = (a₁ a_k)(a₁ a_{k−1}) … (a₁ a₂).'),
      tex: `${name} = ${tr.map(([a, b]) => `(${a}\\;${b})`).join('')}`,
    })
    out.push({
      text: t(`${tr.length} transposisi, jadi ${name.replace(/\\/g, '')} ${isEven(p) ? 'genap' : 'ganjil'}.`, `${tr.length} transpositions, so it is ${isEven(p) ? 'even' : 'odd'}.`),
      tex: `\\operatorname{sgn}(${name}) = (-1)^{${tr.length}} = ${isEven(p) ? '+1' : '-1'}${isEven(p) ? `\\;\\Rightarrow\\; ${name} \\in A_{${n}}` : ''}`,
      tone: isEven(p) ? 'good' : 'bad',
    })
    if (cs.length) out.push({ text: t('Invers: baca setiap siklus mundur.', 'Inverse: read every cycle backwards.'), tex: `${name}^{-1} = ${cycleTex(inverse(p))}` })
    return out
  }

  const compositionSteps = (outer: Perm, inner: Perm, names: [string, string], tex: [string, string]) => {
    const prod = compose(outer, inner)
    const rows = inner.map((y, i) => `${i + 1} & \\xrightarrow{${tex[1]}} & ${y + 1} & \\xrightarrow{${tex[0]}} & ${outer[y] + 1}`)
    return [
      { text: t(`Konvensi Herstein: ${names[0]}${names[1]} berarti ${names[1]} dahulu, lalu ${names[0]}.`, `Herstein's convention: ${names[0]}${names[1]} means ${names[1]} first, then ${names[0]}.`), tex: `(${tex[0]}${tex[1]})(x) = ${tex[0]}(${tex[1]}(x))` },
      { text: t('Lacak setiap simbol lewat kedua langkah (tangga di gambar).', 'Track every symbol through both steps (the ladder in the picture).'), tex: `\\begin{array}{ccccc}${rows.join('\\\\')}\\end{array}` },
      { text: t('Baca hasilnya sebagai siklus.', 'Read the result off as cycles.'), tex: `${tex[0]}${tex[1]} = ${twoRowTex(prod)} = ${cycleTex(prod)}` },
    ]
  }

  return (
    <LabLayout
      picture={
        <>
          <PicCard eyebrow={t('Gambar', 'Picture')} title={t(`${shownName}: panah i → ${shownName}(i), satu warna per siklus`, `${shownName}: arrows i → ${shownName}(i), one colour per cycle`)}
            caption={t('Ikuti panah dari satu simbol sampai kembali: itulah satu siklus. Lingkaran kecil berarti simbol itu tetap.', 'Follow the arrows from a symbol until you return: that is one cycle. A small loop means the symbol stays put.')}>
            {shown ? <LoopPicture p={shown} name={shownName} /> : <p className="text-sm text-rose-300">{t('Permutasi tidak valid.', 'Invalid permutation.')}</p>}
          </PicCard>
          {sigma && tau && (view === 'st' || view === 'ts') && (
            <PicCard eyebrow={t('Komposisi', 'Composition')} title={view === 'st' ? t('στ: τ dahulu, lalu σ', 'στ: first τ, then σ') : t('τσ: σ dahulu, lalu τ', 'τσ: first σ, then τ')}
              caption={t('Jalur ungu mengikuti simbol 1 lewat kedua langkah.', 'The violet path follows symbol 1 through both steps.')}>
              <Ladder first={view === 'st' ? tau : sigma} second={view === 'st' ? sigma : tau} names={view === 'st' ? ['σ', 'τ'] : ['τ', 'σ']} />
            </PicCard>
          )}
        </>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex={`S_{${n}}`} /></span>} icon={<Shuffle size={16} />}>
            <Slider label={<Tex tex="n" />} value={n} min={2} max={13} step={1} onChange={(v) => setN(v)} format={(v) => String(v)} />
            <div className="mt-3 space-y-2">
              {([['σ', sText, setSText, sigma], ['τ', tText, setTText, tau]] as const).map(([name, text, set, val]) => (
                <label key={name} className="block">
                  <span className="text-[11px] text-slate-400">{name}</span>
                  <TextField value={text} onChange={set} invalid={!val} placeholder="(1 2 3)(4 5)  ·  2 3 1 5 4  ·  1 2 3 / 2 3 1" />
                </label>
              ))}
              <p className="text-[11px] text-slate-500">{t('Notasi siklus, notasi satu baris (baris bawah saja), atau dua baris dipisah "/": baris atas / baris bawah, mis. 3 1 2 / 1 2 3.', 'Cycle notation, one-line notation (bottom row only), or both rows separated by "/": top row / bottom row, e.g. 3 1 2 / 1 2 3.')}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => <Chip key={i} onClick={() => { setN(ex.n); setSText(ex.s); setTText(ex.t) }}>{ex.label}</Chip>)}
            </div>
          </MathCard>
          <MathCard title={t('Tampilkan', 'Show')}>
            <div className="grid grid-cols-4 gap-1.5">
              {(['s', 't', 'st', 'ts'] as const).map((k) => <Chip key={k} active={view === k} onClick={() => setView(k)}>{{ s: 'σ', t: 'τ', st: 'στ', ts: 'τσ' }[k]}</Chip>)}
            </div>
            {sigma && tau && st && ts && (
              <p className="mt-2 text-xs text-slate-400">
                {st.every((x, i) => x === ts[i]) ? t('στ = τσ: keduanya komut (mis. siklus saling lepas).', 'στ = τσ: they commute (e.g. disjoint cycles).') : t('στ ≠ τσ: Sₙ tak-abelian untuk n ≥ 3.', 'στ ≠ τσ: Sₙ is non-abelian for n ≥ 3.')}
              </p>
            )}
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={<>{t('Langkah demi langkah: siklus, orde, paritas', 'Step by step: cycles, order, parity')} <Tex tex={texName} /></>} icon={<ListOrdered size={16} />}>
            {shown ? (
              <>
                <FormulaBlock tex={`${texName} = ${twoRowTex(shown)}`} />
                <Steps steps={decomposition(shown, texName)} className="mt-2" />
              </>
            ) : <p className="text-xs text-rose-300">{t('Permutasi tidak valid.', 'Invalid permutation.')}</p>}
          </MathCard>
          <MathCard title={t('Langkah demi langkah: hasil kali', 'Step by step: the product')} icon={<ListOrdered size={16} />}>
            {sigma && tau ? <Steps steps={view === 'ts' ? compositionSteps(tau, sigma, ['τ', 'σ'], ['\\tau', '\\sigma']) : compositionSteps(sigma, tau, ['σ', 'τ'], ['\\sigma', '\\tau'])} />
              : <p className="text-xs text-rose-300">{t('σ atau τ tidak valid.', 'σ or τ is invalid.')}</p>}
          </MathCard>
          <MathCard title={t('Teori (Herstein Bab 3)', 'Theory (Herstein Ch. 3)')} icon={<BookOpen size={16} />}>
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              {t(
                <>
                  <p>Setiap permutasi adalah hasil kali siklus-siklus saling lepas, tunggal kecuali urutannya (Teorema 3.2.2). Ordenya adalah KPK panjang siklus-siklusnya (Teorema 3.2.4).</p>
                  <p>Siklus <Tex tex="(a_1\,a_2\cdots a_k) = (a_1\,a_k)(a_1\,a_{k-1})\cdots(a_1\,a_2)" /> adalah hasil kali <Tex tex="k-1" /> transposisi (Teorema 3.2.5). Paritas banyaknya transposisi tidak bergantung pada dekomposisi, jadi genap dan ganjil terdefinisi dengan baik.</p>
                  <p>Permutasi genap membentuk grup alternating <Tex tex="A_n" />, subgrup normal berindeks 2 dalam <Tex tex="S_n" /> (kernel dari homomorfisma tanda <Tex tex="S_n \to \{1,-1\}" />), <Tex tex="|A_n| = n!/2" />.</p>
                </>,
                <>
                  <p>Every permutation is a product of disjoint cycles, unique up to order (Theorem 3.2.2). Its order is the lcm of the cycle lengths (Theorem 3.2.4).</p>
                  <p>A cycle <Tex tex="(a_1\,a_2\cdots a_k) = (a_1\,a_k)(a_1\,a_{k-1})\cdots(a_1\,a_2)" /> is a product of <Tex tex="k-1" /> transpositions (Theorem 3.2.5). The parity of the number of transpositions does not depend on the decomposition, so even and odd are well defined.</p>
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

