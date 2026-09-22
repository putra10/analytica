import { ArrowDown, ArrowRight, Combine } from 'lucide-react'
import type { Group } from '../../lib/group-theory'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard } from '../ui/MathCard'
import { Tex } from '../ui/FormulaBlock'

export const HUES = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55%)`
const TINT = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55% / 0.14)`

/** Unicode element labels → TeX (subscripts, superscripts, minus, spaces inside cycles). */
export const labelTex = (s: string) =>
  s.replace(/([₀-₉]+)/g, (m) => `_{${[...m].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('')}}`)
    .replace(/([⁰-⁹]+)/g, (m) => `^{${[...m].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`)
    .replace(/−/g, '-').replace(/ /g, '\\,')

/** Blocks are wide enough to read; past this many cosets we show a prefix and say so. */
const MAX_BLOCKS = 12

interface Props {
  g: Group
  /** the selected subgroup, or undefined when none is picked */
  H?: number[]
  cs: { rep: number; elems: number[] }[]
  side: 'left' | 'right'
  normal: boolean
}

/**
 * Herstein 2.6, "memadatkan G": each coset of H is one block of G on the left and collapses to
 * a single point of G/H on the right, under the natural map ψ(a) = Ha. The block colours are the
 * ones the Cayley table is painted with, so a colour means the same coset in both views.
 */
export function CosetCollapse({ g, H, cs, side, normal }: Props) {
  const t = useT()
  if (!H) {
    return (
      <MathCard title={t('Ilustrasi: memadatkan G menjadi G/N', 'Illustration: collapsing G onto G/N')} icon={<Combine size={16} />} className="lg:col-span-3">
        <p className="text-sm text-slate-500">{t('Pilih subgrup H di panel kanan untuk melihat koset-kosetnya memadat menjadi titik.', 'Pick a subgroup H in the right-hand panel to watch its cosets collapse to points.')}</p>
      </MathCard>
    )
  }

  const S = normal ? 'N' : 'H'
  // the coset of the identity is the subgroup itself: write N, not Ne (as the lecture slides do)
  const name = (rep: number) =>
    rep === g.e ? S : side === 'right' ? `${S}${labelTex(g.labels[rep])}` : `${labelTex(g.labels[rep])}${S}`
  const shown = cs.slice(0, MAX_BLOCKS)

  return (
    <MathCard
      title={<>{t('Ilustrasi: memadatkan G menjadi ', 'Illustration: collapsing G onto ')}<Tex tex={`G/${S}`} /></>}
      icon={<Combine size={16} />}
      className="lg:col-span-3"
    >
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        {t(<>Setiap koset — satu blok warna di kiri — menjadi satu titik tunggal di <Tex tex={`G/${S}`} />. Warnanya sama dengan warna pada tabel Cayley di atas.</>,
           <>Every coset — one coloured block on the left — becomes a single point of <Tex tex={`G/${S}`} />. The colours are the ones the Cayley table above is painted with.</>)}
      </p>

      <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* G: the cosets partition it into [G:H] blocks of equal size (Lagrange). */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-center text-[11px] text-slate-500"><Tex tex="G" /></div>
          <div className="flex min-w-0 flex-wrap gap-1 rounded-[var(--radius-sm)] border border-border p-1">
            {shown.map((c, i) => (
              <div
                key={c.rep}
                className="min-w-0 flex-1 basis-24 rounded-[var(--radius-sm)] border p-1.5"
                style={{ background: TINT(cs.length, i), borderColor: HUES(cs.length, i) }}
              >
                <div className="mb-1 flex min-w-0 items-center justify-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: HUES(cs.length, i) }} />
                  <Tex tex={name(c.rep)} className="text-[11px]" />
                </div>
                <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] text-slate-400">
                  {c.elems.map((x) => <span key={x}>{g.labels[x]}</span>)}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-500">
            {cs.length > MAX_BLOCKS
              ? t(`${MAX_BLOCKS} dari ${cs.length} koset; masing-masing berukuran ${H.length}.`, `${MAX_BLOCKS} of ${cs.length} cosets; each of size ${H.length}.`)
              : t(`${cs.length} koset, masing-masing berukuran ${H.length} (Lagrange).`, `${cs.length} cosets, each of size ${H.length} (Lagrange).`)}
          </p>
        </div>

        {/* the natural map ψ(a) = Ha */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-slate-500">
          <Tex tex={`a \\longmapsto ${side === 'right' ? `${S}a` : `a${S}`}`} className="text-[11px]" />
          <ArrowDown size={18} className="sm:hidden" />
          <ArrowRight size={18} className="hidden sm:block" />
        </div>

        {/* G/H: one point per coset */}
        <div className="min-w-0 shrink-0 sm:w-40">
          <div className="mb-1 text-center text-[11px] text-slate-500"><Tex tex={`G/${S}`} /></div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 rounded-[var(--radius-sm)] border border-border p-2 sm:flex-col sm:flex-nowrap sm:justify-start">
            {shown.map((c, i) => (
              <div key={c.rep} className="flex min-w-0 items-center gap-1.5">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border" style={{ background: TINT(cs.length, i), borderColor: HUES(cs.length, i) }} />
                <Tex tex={name(c.rep)} className="text-[11px]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className={cn('mt-3 text-xs leading-relaxed', normal ? 'text-slate-400' : 'text-rose-300')}>
        {normal
          ? t(<>Karena <Tex tex="N \lhd G" />, hasil kali koset <Tex tex="(Na)(Nb) = N(ab)" /> tidak bergantung pada wakil yang dipilih, sehingga titik-titik di kanan benar-benar membentuk grup — lihat tabel <Tex tex="G/N" /> di bawah. Pemetaan <Tex tex="\psi(a) = Na" /> adalah homomorfisma pada dengan <Tex tex="\ker\psi = N" />.</>,
             <>Because <Tex tex="N \lhd G" />, the coset product <Tex tex="(Na)(Nb) = N(ab)" /> does not depend on the representatives chosen, so the points on the right really do form a group — see the <Tex tex="G/N" /> table below. The map <Tex tex="\psi(a) = Na" /> is an onto homomorphism with <Tex tex="\ker\psi = N" />.</>)
          : t(<>H tidak normal: koset-kosetnya tetap mempartisi G (Lagrange berlaku untuk setiap subgrup), tetapi titik-titik di kanan hanya sebuah himpunan. Hasil kali <Tex tex="(Ha)(Hb) = H(ab)" /> bergantung pada wakil yang dipilih, jadi <Tex tex="G/H" /> bukan grup.</>,
             <>H is not normal: its cosets still partition G (Lagrange holds for every subgroup), but the points on the right are only a set. The product <Tex tex="(Ha)(Hb) = H(ab)" /> depends on the representatives chosen, so <Tex tex="G/H" /> is not a group.</>)}
      </p>
    </MathCard>
  )
}
