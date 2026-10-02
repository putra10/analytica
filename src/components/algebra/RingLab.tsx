import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, Grid3x3, Layers, ListOrdered } from 'lucide-react'
import { znInfo, range } from '../../lib/rings'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { C, T, type P } from '../stories/kit'
import { LabLayout, Node, Pic, PicCard, Steps, TablePic } from './pics'
import { clockAt, pal, textW } from './pic-utils'

const setTex = (xs: number[]) => (xs.length ? `\\{${xs.join(',\\ ')}\\}` : '\\varnothing')
const short = (xs: number[], max = 6) => `{${xs.slice(0, max).join(', ')}${xs.length > max ? ', …' : ''}}`

/** Z_n on a clock: units green, zero divisors red; with an ideal (d), its cosets as coloured polygons. */
function RingClock({ n, d }: { n: number; d?: number }) {
  const t = useT()
  const info = znInfo(n), ctr: P = [150, 152], R = 110, at = clockAt(ctr, R, n)
  const unit = new Set(info.units), zd = new Set(info.zeroDivisors)
  const lines: { s: string; color: string }[] = d
    ? range(Math.min(d, 6)).map((r) => ({ s: `${r === 0 ? 'I' : `${r}+I`} = ${short(range(n).filter((x) => x % d === r), 4)}`, color: pal(r, d) }))
    : [
        { s: `${t('unit', 'units')}: ${short(info.units)}`, color: C.g },
        { s: `${t('pembagi nol', 'zero div.')}: ${short(info.zeroDivisors, 4)}`, color: C.r },
      ]
  const fs = Math.min(14, ...lines.map((l) => (14 * 160) / Math.max(textW(l.s, 14), 1)))
  return (
    <Pic h={300} label={t('Zn pada jam', 'Zn on a clock')}>
      <circle cx={ctr[0]} cy={ctr[1]} r={R} fill="none" stroke={C.faint} />
      {d && range(d).map((r) => {
        const pts = range(n).filter((x) => x % d === r).map(at)
        return pts.length > 1 && <path key={r} d={pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + (pts.length > 2 ? ' Z' : '')} fill={pal(r, d)} fillOpacity=".12" stroke={pal(r, d)} strokeWidth="2.5" />
      })}
      {range(n).map((x) => {
        const fill = d ? pal(x % d, d) : unit.has(x) ? C.g : zd.has(x) ? C.r : C.bg
        return <Node key={x} at={at(x)} label={String(x)} r={14} size={13} fill={fill} stroke={fill === C.bg ? C.ln : fill} />
      })}
      <T x={300} y={42} anchor="start" size={18} weight={700} color={C.a}>{d ? `I = (${d})` : `ℤ${String(n).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[+c])}`}</T>
      {lines.map((l, i) => (
        <g key={i}>
          <rect x={300} y={62 + i * 28} width={12} height={12} rx={3} fill={l.color} />
          <T x={318} y={73 + i * 28} anchor="start" size={fs}>{l.s}</T>
        </g>
      ))}
      {d && d > 6 && <T x={318} y={73 + 6 * 28} anchor="start" size={13} color={C.mu}>… {d} {t('koset', 'cosets')}</T>}
      <T x={300} y={282} anchor="start" size={16} weight={700} color={C.v}>{d ? `ℤ/(${d}): ${n} ÷ ${n / d} = ${d}` : `φ(${n}) = ${info.units.length}`}</T>
    </Pic>
  )
}

/** Euclid on (n, a) with the Bézout coefficients carried along, as a student writes it. */
function euclid(n: number, a: number) {
  const rows: { x: number; y: number; q: number; r: number }[] = []
  let [x, y] = [n, a], [s0, s1, t0, t1] = [1, 0, 0, 1]
  while (y) {
    const q = Math.floor(x / y), r = x % y
    rows.push({ x, y, q, r })
    ;[x, y] = [y, r]
    ;[s0, s1] = [s1, s0 - q * s1]
    ;[t0, t1] = [t1, t0 - q * t1]
  }
  return { rows, g: x, s: s0, t: t0 } // s·n + t·a = g
}

export function RingLab() {
  const t = useT()
  const [n, setN] = useState(12)
  const [a, setA] = useState(5)
  const [op, setOp] = useState<'mul' | 'add'>('mul')
  const [idealD, setIdealD] = useState<number | null>(null)
  const info = useMemo(() => znInfo(n), [n])
  const ideal = idealD ? info.ideals.find((i) => i.d === idealD) : undefined
  const d = ideal?.d
  const aa = Math.min(a, n - 1)
  const e = euclid(n, aa)

  const unitSteps = () => {
    const out: { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }[] = [
      { text: t(`Algoritma Euclid untuk fpb(${n}, ${aa}): bagi terus dengan sisa sampai sisanya 0.`, `Euclid's algorithm for gcd(${n}, ${aa}): keep dividing with remainder until the remainder is 0.`), tex: `\\begin{aligned}${e.rows.map((r) => `${r.x} &= ${r.q}\\cdot ${r.y} + ${r.r}`).join('\\\\')}\\end{aligned}` },
      { text: t(`Sisa tak nol terakhir adalah fpb.`, `The last nonzero remainder is the gcd.`), tex: `\\gcd(${n}, ${aa}) = ${e.g}` },
    ]
    if (aa === 0) return [{ text: t('0 bukan unit dan bukan pembagi nol menurut definisi; pilih a ≠ 0.', '0 is neither a unit nor a zero divisor by definition; pick a ≠ 0.') }]
    if (e.g === 1) {
      const inv = ((e.t % n) + n) % n
      out.push({ text: t('Mundur lewat langkah-langkah itu memberi kombinasi Bézout.', 'Working back up the steps gives the Bézout combination.'), tex: `${e.s}\\cdot ${n} + ${e.t}\\cdot ${aa} = 1` })
      out.push({ text: t(`Baca modulo ${n}: suku kelipatan ${n} hilang, jadi ${aa} unit.`, `Read it mod ${n}: the multiple of ${n} vanishes, so ${aa} is a unit.`), tex: `${aa}^{-1} = ${inv},\\quad ${aa}\\cdot ${inv} = ${aa * inv} = ${Math.floor((aa * inv) / n)}\\cdot ${n} + 1 \\equiv 1`, tone: 'good' })
    } else {
      out.push({ text: t(`fpb = ${e.g} > 1: kalikan ${aa} dengan ${n}/${e.g} = ${n / e.g} ≠ 0 dan hasilnya kelipatan ${n}.`, `gcd = ${e.g} > 1: multiply ${aa} by ${n}/${e.g} = ${n / e.g} ≠ 0 and the result is a multiple of ${n}.`), tex: `${aa}\\cdot ${n / e.g} = ${aa * (n / e.g)} = ${(aa * (n / e.g)) / n}\\cdot ${n} \\equiv 0`, tone: 'bad' })
      out.push({ text: t(`Jadi ${aa} pembagi nol, dan tidak mungkin unit (ua = 1 dikali ${n / e.g} memberi ${n / e.g} = 0, mustahil).`, `So ${aa} is a zero divisor, and it cannot be a unit (multiplying ua = 1 by ${n / e.g} would give ${n / e.g} = 0, impossible).`), tone: 'bad' })
    }
    return out
  }

  const tableTone = (r: number, c: number) => {
    const v = op === 'mul' ? (r * c) % n : (r + c) % n
    if (d) return op === 'mul' ? (v % d === 0 ? C.a : undefined) : pal(v % d, d)
    if (op === 'add') return v === 0 ? C.g : undefined
    return v === 0 && r && c ? C.r : v === 1 ? C.g : undefined
  }

  return (
    <LabLayout
      picture={
        <>
          <PicCard eyebrow={t('Tabel', 'Table')} title={op === 'mul' ? t(`Perkalian di ℤ${n}`, `Multiplication in ℤ${n}`) : t(`Penjumlahan di ℤ${n}`, `Addition in ℤ${n}`)}
            caption={d
              ? op === 'mul' ? t(`Sel ungu: hasil kali di I = (${d}). Baris dan kolom kelipatan ${d} seluruhnya ungu: I menelan perkalian, itulah ideal.`, `Violet cells: products in I = (${d}). Rows and columns of multiples of ${d} are entirely violet: I swallows multiplication, which is what makes it an ideal.`)
                : t(`Warna = koset a + I. Tabel terbagi menjadi ${d} warna yang berulang: ℤ${n}/(${d}) ≅ ℤ${d}.`, `Colour = coset a + I. The table splits into ${d} repeating colours: ℤ${n}/(${d}) ≅ ℤ${d}.`)
              : op === 'mul' ? t('Sel merah: hasil 0 dari dua unsur tak nol (pembagi nol). Sel hijau: hasil 1, jadi barisnya unit.', 'Red cells: 0 from two nonzero elements (zero divisors). Green cells: product 1, so that row is a unit.')
                : t('Sel hijau: hasil 0, jadi kolomnya invers aditif barisnya.', 'Green cells: sum 0, so the column is the additive inverse of the row.')}>
            <div className="flex gap-1.5">
              <Chip active={op === 'mul'} onClick={() => setOp('mul')}>×</Chip>
              <Chip active={op === 'add'} onClick={() => setOp('add')}>+</Chip>
            </div>
            <TablePic heads={range(n).map(String)} text={(r, c) => String(op === 'mul' ? (r * c) % n : (r + c) % n)} tone={tableTone} sym={op === 'mul' ? '×' : '+'} label={t('Tabel operasi', 'Operation table')} />
          </PicCard>
          <PicCard eyebrow={t('Gambar', 'Picture')} title={d ? t(`Koset ideal (${d}) di jam ℤ${n}`, `Cosets of the ideal (${d}) on the ℤ${n} clock`) : t(`Unit dan pembagi nol di jam ℤ${n}`, `Units and zero divisors on the ℤ${n} clock`)}
            caption={d ? t(`Setiap koset adalah salinan I yang diputar. Ada ${d} koset, jadi gelanggang kuosiennya punya ${d} unsur.`, `Each coset is a rotated copy of I. There are ${d} cosets, so the quotient ring has ${d} elements.`) : t(`Hijau: fpb(a, ${n}) = 1, unit. Merah: fpb(a, ${n}) > 1, pembagi nol. Tidak ada pilihan ketiga untuk a ≠ 0.`, `Green: gcd(a, ${n}) = 1, a unit. Red: gcd(a, ${n}) > 1, a zero divisor. There is no third option for a ≠ 0.`)}>
            <RingClock n={n} d={d} />
          </PicCard>
        </>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span>{t('Gelanggang', 'Ring')} <Tex tex="\mathbb{Z}_n" /></span>} icon={<Grid3x3 size={16} />}>
            <Slider label={<Tex tex="n" />} value={n} min={2} max={16} step={1} onChange={(v) => { setN(v); setIdealD(null) }} format={(v) => String(v)} />
            <div className="mt-3">
              <Slider label={t('unsur a (untuk langkah-langkah)', 'element a (for the steps)')} value={aa} min={0} max={n - 1} step={1} onChange={setA} format={(v) => String(v)} />
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-300">
              <FormulaBlock tex={`U(\\mathbb{Z}_{${n}}) = ${setTex(info.units)},\\quad \\varphi(${n}) = ${info.units.length}`} />
              <FormulaBlock tex={`\\text{${t('pembagi nol', 'zero divisors')}} = ${setTex(info.zeroDivisors)}`} />
              <FormulaBlock tex={`\\text{${t('nilpoten', 'nilpotent')}} = ${setTex(info.nilpotents)},\\quad \\text{${t('idempoten', 'idempotent')}} = ${setTex(info.idempotents)}`} />
            </div>
            <p className={cn('mt-2 text-xs', info.isField ? 'text-emerald-300' : 'text-slate-400')}>
              {info.isField
                ? t(`${n} prima: setiap unsur tak nol mempunyai invers, jadi ℤ${n} lapangan.`, `${n} is prime: every nonzero element is invertible, so ℤ${n} is a field.`)
                : t(`${n} bukan prima: ada pembagi nol, jadi ℤ${n} bukan daerah integral (dan bukan lapangan).`, `${n} is not prime: there are zero divisors, so ℤ${n} is not an integral domain (hence not a field).`)}
            </p>
          </MathCard>
          <MathCard title={t('Ideal', 'Ideals')} icon={<Layers size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={idealD === null} onClick={() => setIdealD(null)}>{t('tidak ada', 'none')}</Chip>
              {info.ideals.map((i) => <Chip key={i.d} active={idealD === i.d} onClick={() => setIdealD(i.d)}>({i.d})</Chip>)}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t('Setiap ideal ℤₙ adalah (d) = dℤₙ dengan d | n.', 'Every ideal of ℤₙ is (d) = dℤₙ with d | n.')}
            </p>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t(`Langkah demi langkah: apakah ${aa} unit di ℤ${n}?`, `Step by step: is ${aa} a unit in ℤ${n}?`)} icon={<ListOrdered size={16} />}>
            <Steps steps={unitSteps()} />
          </MathCard>
          <MathCard title={t('Ideal & gelanggang kuosien', 'Ideal & quotient ring')} icon={<Layers size={16} />}>
            {ideal ? (
              <Steps steps={[
                { text: t('Tulis ideal sebagai himpunan kelipatan d.', 'Write the ideal as the set of multiples of d.'), tex: `I = (${ideal.d}) = ${setTex(ideal.elems)},\\quad |I| = ${ideal.elems.length}` },
                { text: t('Koset-kosetnya a + I untuk a = 0, …, d − 1; banyaknya n / |I|.', 'Its cosets are a + I for a = 0, …, d − 1; there are n / |I| of them.'), tex: `|\\mathbb{Z}_{${n}}/I| = ${n}/${ideal.elems.length} = ${ideal.d},\\quad \\mathbb{Z}_{${n}}/I \\cong \\mathbb{Z}_{${ideal.d}}` },
                ideal.maximal
                  ? { text: t(`${ideal.d} prima, jadi ℤ${ideal.d} lapangan; maka I maksimal (Teorema 4.4.2).`, `${ideal.d} is prime, so ℤ${ideal.d} is a field; hence I is maximal (Theorem 4.4.2).`), tone: 'good' as const }
                  : { text: t(`${ideal.d} bukan prima: I termuat dalam ideal (${info.ideals.find((j) => j.maximal && ideal.d % j.d === 0)?.d ?? '?'}) yang lebih besar, jadi tidak maksimal dan kuosiennya bukan lapangan.`, `${ideal.d} is not prime: I sits inside the larger ideal (${info.ideals.find((j) => j.maximal && ideal.d % j.d === 0)?.d ?? '?'}), so it is not maximal and the quotient is not a field.`), tone: 'bad' as const },
              ]} />
            ) : <p className="text-sm text-slate-500">{t('Pilih ideal (d).', 'Pick an ideal (d).')}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[{ d: 1, maximal: false }, ...info.ideals].map((i) => (
                <span key={i.d} className={cn('rounded-md border px-2 py-1 font-mono text-xs', i.maximal ? 'border-amber-300 text-amber-300' : 'border-border text-slate-300')}>
                  ({i.d}){i.d === 1 ? ` = ℤ${n}` : i.d === n ? ' = (0)' : ''}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t(<>Kuning: ideal maksimal, tepat <Tex tex="(p)" /> untuk prima <Tex tex="p \mid n" />. <Tex tex="(d_1) \subseteq (d_2) \iff d_2 \mid d_1" />.</>, <>Amber: maximal ideals, exactly <Tex tex="(p)" /> for primes <Tex tex="p \mid n" />. <Tex tex="(d_1) \subseteq (d_2) \iff d_2 \mid d_1" />.</>)}
            </p>
          </MathCard>
          <MathCard title={t('Teori (Herstein Bab 4)', 'Theory (Herstein Ch. 4)')} icon={<BookOpen size={16} />}>
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              {t(
                <>
                  <p><Tex tex="\mathbb{Z}_n" /> adalah gelanggang komutatif dengan satuan; <Tex tex="a" /> unit iff <Tex tex="\gcd(a,n)=1" />, dan pembagi nol iff <Tex tex="\gcd(a,n) > 1" /> (setiap unsur tak nol adalah salah satunya).</p>
                  <p>Daerah integral berhingga adalah lapangan: karena itu <Tex tex="\mathbb{Z}_p" /> lapangan iff <Tex tex="p" /> prima. Karakteristik <Tex tex="\mathbb{Z}_n" /> adalah <Tex tex="n" />.</p>
                  <p>Ideal <Tex tex="I" /> adalah subgrup aditif dengan <Tex tex="rI \subseteq I" /> untuk semua <Tex tex="r" /> (4.3). Teorema 4.4.2: untuk <Tex tex="R" /> komutatif dengan satuan, <Tex tex="R/M" /> lapangan iff <Tex tex="M" /> ideal maksimal.</p>
                </>,
                <>
                  <p><Tex tex="\mathbb{Z}_n" /> is a commutative ring with unit; <Tex tex="a" /> is a unit iff <Tex tex="\gcd(a,n)=1" />, and a zero divisor iff <Tex tex="\gcd(a,n) > 1" /> (every nonzero element is one or the other).</p>
                  <p>A finite integral domain is a field: hence <Tex tex="\mathbb{Z}_p" /> is a field iff <Tex tex="p" /> is prime. The characteristic of <Tex tex="\mathbb{Z}_n" /> is <Tex tex="n" />.</p>
                  <p>An ideal <Tex tex="I" /> is an additive subgroup with <Tex tex="rI \subseteq I" /> for all <Tex tex="r" /> (4.3). Theorem 4.4.2: for <Tex tex="R" /> commutative with unit, <Tex tex="R/M" /> is a field iff <Tex tex="M" /> is a maximal ideal.</p>
                </>,
              )}
            </div>
          </MathCard>
        </div>
      }
    />
  )
}

