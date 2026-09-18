import { useMemo, useState } from 'react'
import { BookOpen, Grid3x3, Layers } from 'lucide-react'
import { znInfo, range } from '../../lib/rings'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { Layout } from '../ui/Layout'
import { MathCard, Chip } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

const HUES = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55%)`
const setTex = (xs: number[]) => (xs.length ? `\\{${xs.join(',\\ ')}\\}` : '\\varnothing')

function Table({ n, op, symbol, colorBy, highlight }: { n: number; op: (a: number, b: number) => number; symbol: string; colorBy?: (x: number) => number; highlight?: (x: number) => boolean }) {
  const cell = n > 12 ? 'h-5 min-w-5 text-[9px]' : 'h-7 min-w-7 text-[11px]'
  return (
    <table className="border-separate border-spacing-0.5 font-mono">
      <thead><tr><th className={cn('text-slate-500', cell)}>{symbol}</th>{range(n).map((b) => <th key={b} className={cn('font-normal text-slate-300', cell)}>{b}</th>)}</tr></thead>
      <tbody>
        {range(n).map((a) => (
          <tr key={a}>
            <th className={cn('font-normal text-slate-300', cell)}>{a}</th>
            {range(n).map((b) => {
              const x = op(a, b)
              const hl = highlight?.(x)
              return <td key={b} className={cn('rounded-sm text-center text-slate-900', cell, hl === false && 'opacity-25')} style={{ background: HUES(n, colorBy ? colorBy(x) : x) }}>{x}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function RingLab() {
  const t = useT()
  const [n, setN] = useState(12)
  const [idealD, setIdealD] = useState<number | null>(null)
  const info = useMemo(() => znInfo(n), [n])
  const ideal = idealD ? info.ideals.find((i) => i.d === idealD) : undefined
  const d = ideal?.d ?? 1

  return (
    <Layout
      canvas={
        <div className="flex h-full w-full gap-6 overflow-auto p-4">
          <div>
            <p className="mb-1 text-[11px] text-slate-500"><Tex tex={`(\\mathbb{Z}_{${n}}, +)`} /></p>
            <Table n={n} op={(a, b) => (a + b) % n} symbol="+" colorBy={ideal ? (x) => x % d : undefined} />
          </div>
          <div>
            <p className="mb-1 text-[11px] text-slate-500"><Tex tex={`(\\mathbb{Z}_{${n}}, \\cdot)`} /></p>
            <Table n={n} op={(a, b) => (a * b) % n} symbol="·" colorBy={ideal ? (x) => x % d : undefined} highlight={ideal ? (x) => x % d === 0 : undefined} />
          </div>
        </div>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span>{t('Gelanggang', 'Ring')} <Tex tex="\mathbb{Z}_n" /></span>} icon={<Grid3x3 size={16} />}>
            <Slider label={<Tex tex="n" />} value={n} min={2} max={16} step={1} onChange={(v) => { setN(v); setIdealD(null) }} format={(v) => String(v)} />
            <div className="mt-3 space-y-1 text-xs text-slate-300">
              <FormulaBlock tex={`U(\\mathbb{Z}_{${n}}) = ${setTex(info.units)},\\quad \\varphi(${n}) = ${info.units.length}`} />
              <FormulaBlock tex={`\\text{${t('pembagi nol', 'zero divisors')}} = ${setTex(info.zeroDivisors)}`} />
              <FormulaBlock tex={`\\text{${t('nilpoten', 'nilpotent')}} = ${setTex(info.nilpotents)},\\quad \\text{${t('idempoten', 'idempotent')}} = ${setTex(info.idempotents)}`} />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {info.isField
                ? t(`${n} prima: setiap unsur tak nol mempunyai invers, jadi Z${n} adalah lapangan (daerah integral berhingga).`, `${n} is prime: every nonzero element is invertible, so Z${n} is a field (a finite integral domain).`)
                : t(`${n} bukan prima: ada pembagi nol, jadi Z${n} bukan daerah integral (dan bukan lapangan).`, `${n} is not prime: there are zero divisors, so Z${n} is not an integral domain (hence not a field).`)}
            </p>
          </MathCard>
          <MathCard title={t('Ideal', 'Ideals')} icon={<Layers size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              <Chip active={idealD === null} onClick={() => setIdealD(null)}>{t('tidak ada', 'none')}</Chip>
              {info.ideals.map((i) => <Chip key={i.d} active={idealD === i.d} onClick={() => setIdealD(i.d)}>({i.d})</Chip>)}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t('Setiap ideal Zₙ adalah (d) = dZₙ dengan d | n. Tabel diwarnai menurut koset a + (d); sel × yang memudar bukan anggota ideal.', 'Every ideal of Zₙ is (d) = dZₙ with d | n. The tables are coloured by coset a + (d); faded × cells are not in the ideal.')}
            </p>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Ideal & gelanggang kuosien', 'Ideal & quotient ring')} icon={<Layers size={16} />}>
            {ideal ? (
              <div className="space-y-1">
                <FormulaBlock tex={`I = (${ideal.d}) = ${setTex(ideal.elems)},\\quad |I| = ${ideal.elems.length}`} />
                <FormulaBlock tex={`\\mathbb{Z}_{${n}}/I \\cong \\mathbb{Z}_{${ideal.d}},\\quad |\\mathbb{Z}_{${n}}/I| = ${n}/${ideal.elems.length} = ${ideal.d}`} />
                <p className="text-xs text-slate-400">
                  {t('Koset-koset: ', 'Cosets: ')}{range(ideal.d).map((r) => `${r} + I`).join(', ')}.{' '}
                  {ideal.maximal
                    ? t(<><Tex tex={`${ideal.d}`} /> prima, jadi I maksimal dan <Tex tex={`\\mathbb{Z}_{${n}}/I`} /> lapangan (Teorema 4.4.2).</>, <><Tex tex={`${ideal.d}`} /> is prime, so I is maximal and <Tex tex={`\\mathbb{Z}_{${n}}/I`} /> is a field (Theorem 4.4.2).</>)
                    : t(<><Tex tex={`${ideal.d}`} /> bukan prima: I termuat dalam ideal yang lebih besar {`(${info.ideals.find((j) => j.maximal && ideal.d % j.d === 0)?.d ?? '?'})`}, jadi tidak maksimal dan kuosiennya bukan lapangan.</>, <><Tex tex={`${ideal.d}`} /> is not prime: I sits inside the larger ideal {`(${info.ideals.find((j) => j.maximal && ideal.d % j.d === 0)?.d ?? '?'})`}, so it is not maximal and the quotient is not a field.</>)}
                </p>
              </div>
            ) : <p className="text-sm text-slate-500">{t('Pilih ideal (d).', 'Pick an ideal (d).')}</p>}
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t(<>Ideal <Tex tex="I" /> adalah subgrup aditif dengan <Tex tex="rI \subseteq I" /> untuk semua <Tex tex="r" /> (4.3). Homomorfisma <Tex tex="\mathbb{Z}_n \to \mathbb{Z}_n/I" />, <Tex tex="a \mapsto a + I" />, berkernel <Tex tex="I" />; teorema homomorfisma gelanggang: <Tex tex="R/\ker\varphi \cong \varphi(R)" />.</>,
                 <>An ideal <Tex tex="I" /> is an additive subgroup with <Tex tex="rI \subseteq I" /> for all <Tex tex="r" /> (4.3). The homomorphism <Tex tex="\mathbb{Z}_n \to \mathbb{Z}_n/I" />, <Tex tex="a \mapsto a + I" />, has kernel <Tex tex="I" />; ring homomorphism theorem: <Tex tex="R/\ker\varphi \cong \varphi(R)" />.</>)}
            </p>
          </MathCard>
          <MathCard title={t('Kisi ideal Zₙ', 'Ideal lattice of Zₙ')} icon={<Grid3x3 size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {[{ d: 1, elems: range(n), maximal: false }, ...info.ideals].map((i) => (
                <span key={i.d} className={cn('rounded-md border px-2 py-1 font-mono text-xs', i.maximal ? 'border-amber-400/50 text-amber-300' : 'border-border text-slate-300')}>
                  ({i.d}){i.d === 1 ? ` = Z${n}` : i.d === n ? ' = (0)' : ''}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t(<>Ideal maksimal (kuning) tepat adalah <Tex tex="(p)" /> dengan <Tex tex="p" /> prima pembagi <Tex tex={`${n}`} />: {info.ideals.filter((i) => i.maximal).map((i) => `(${i.d})`).join(', ') || t('tidak ada (Zₙ lapangan, (0) maksimal)', 'none')}. <Tex tex="(d_1) \subseteq (d_2) \iff d_2 \mid d_1" />.</>,
                 <>The maximal ideals (yellow) are exactly <Tex tex="(p)" /> for primes <Tex tex="p" /> dividing <Tex tex={`${n}`} />: {info.ideals.filter((i) => i.maximal).map((i) => `(${i.d})`).join(', ') || 'none (Zₙ is a field, (0) is maximal)'}. <Tex tex="(d_1) \subseteq (d_2) \iff d_2 \mid d_1" />.</>)}
            </p>
          </MathCard>
          <MathCard title={t('Teori (Herstein Bab 4)', 'Theory (Herstein Ch. 4)')} icon={<BookOpen size={16} />}>
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              {t(
                <>
                  <p><Tex tex="\mathbb{Z}_n" /> adalah gelanggang komutatif dengan satuan; <Tex tex="a" /> adalah unit iff <Tex tex="\gcd(a,n)=1" />, dan pembagi nol iff <Tex tex="\gcd(a,n) > 1" /> (setiap unsur tak nol adalah salah satunya).</p>
                  <p>Daerah integral berhingga adalah lapangan: karena itu <Tex tex="\mathbb{Z}_p" /> lapangan iff <Tex tex="p" /> prima. Karakteristik <Tex tex="\mathbb{Z}_n" /> adalah <Tex tex="n" />.</p>
                  <p>Teorema 4.4.2: jika <Tex tex="R" /> komutatif dengan satuan, <Tex tex="R/M" /> lapangan iff <Tex tex="M" /> ideal maksimal.</p>
                </>,
                <>
                  <p><Tex tex="\mathbb{Z}_n" /> is a commutative ring with unit; <Tex tex="a" /> is a unit iff <Tex tex="\gcd(a,n)=1" />, and a zero divisor iff <Tex tex="\gcd(a,n) > 1" /> (every nonzero element is one or the other).</p>
                  <p>A finite integral domain is a field: hence <Tex tex="\mathbb{Z}_p" /> is a field iff <Tex tex="p" /> is prime. The characteristic of <Tex tex="\mathbb{Z}_n" /> is <Tex tex="n" />.</p>
                  <p>Theorem 4.4.2: for <Tex tex="R" /> commutative with unit, <Tex tex="R/M" /> is a field iff <Tex tex="M" /> is a maximal ideal.</p>
                </>,
              )}
            </div>
          </MathCard>
        </div>
      }
    />
  )
}
