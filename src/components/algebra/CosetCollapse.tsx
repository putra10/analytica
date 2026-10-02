import { Combine } from 'lucide-react'
import { isAbelian, mul, quotient, range, type Group } from '../../lib/group-theory'
import { useT } from '../../lib/i18n'
import { MathCard } from '../ui/MathCard'
import { Tex } from '../ui/FormulaBlock'
import { CollapseDiagram, type Block, type Target } from './CollapseDiagram'
import { TablePic } from './pics'
import { additive, compact, cosetName, pal } from './pic-utils'

/** Bags are wide enough to read; past this many cosets we show a prefix and say so. */
const MAX_BLOCKS = 12

interface Props {
  g: Group
  H?: number[]
  cs: { rep: number; elems: number[] }[]
  side: 'left' | 'right'
  normal: boolean
}

/**
 * Herstein 2.6, "memadatkan G": every coset of N is one bag of G and collapses to one point of
 * G/N under ψ(a) = Na; when N is normal the points multiply as a group, shown in its own table
 * with the same colours.
 */
export function CosetCollapse({ g, H, cs, side, normal }: Props) {
  const t = useT()
  const title = <>{t('Grup faktor: setiap koset menjadi satu unsur', 'Factor group: every coset becomes one element')}</>
  if (!H) {
    return (
      <MathCard title={title} icon={<Combine size={16} />} className="lg:col-span-3">
        <p className="text-sm text-slate-500">{t('Pilih subgrup H di panel kanan untuk melihat koset-kosetnya dipadatkan menjadi titik.', 'Pick a subgroup H in the right-hand panel to watch its cosets collapse to points.')}</p>
      </MathCard>
    )
  }
  const S = normal ? 'N' : 'H'
  const shown = cs.slice(0, MAX_BLOCKS)
  const blocks: Block[] = shown.map((c, i) => ({ key: c.rep, name: cosetName(g, c.rep, side, S), elems: c.elems.map((x) => compact(g.labels[x])), color: pal(i, cs.length) }))
  const targets: Target[] = shown.map((c, i) => ({ key: c.rep, name: cosetName(g, c.rep, side, S), color: pal(i, cs.length) }))
  const Q = normal && H.length < g.order ? quotient(g, H) : null
  // quotient() lists cosets in the same order as cosets(g, H, 'left'), which equals cs when N is normal
  const qName = (i: number) => cosetName(g, cs[i]?.rep ?? 0, side, S)

  return (
    <MathCard title={title} icon={<Combine size={16} />} className="lg:col-span-3">
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <CollapseDiagram blocks={blocks} targets={targets} leftName="G" label={t('Koset G dipadatkan menjadi titik', 'Cosets of G collapsing to points')} />
          <p className="text-[13px] leading-relaxed text-slate-300">
            {t(`Atas: G terbagi menjadi ${cs.length} kantong, masing-masing berisi ${H.length} unsur. Bawah: setiap kantong menjadi satu titik, lewat peta a ↦ ${side === 'right' && !additive(g.id) ? `${S}a` : additive(g.id) ? `a+${S}` : `a${S}`}.`,
               `Top: G splits into ${cs.length} bags of ${H.length} elements each. Bottom: every bag becomes one point, via the map a ↦ ${side === 'right' && !additive(g.id) ? `${S}a` : additive(g.id) ? `a+${S}` : `a${S}`}.`)}
            {cs.length > MAX_BLOCKS && t(` Ditampilkan ${MAX_BLOCKS} dari ${cs.length} koset.`, ` Showing ${MAX_BLOCKS} of ${cs.length} cosets.`)}
          </p>
        </div>
        <div className="min-w-0 space-y-2">
          {Q ? (
            <>
              <TablePic
                heads={range(Q.order).map(qName)}
                text={(r, c) => qName(mul(Q, r, c))}
                tone={(r, c) => pal(mul(Q, r, c), cs.length)}
                sym={additive(g.id) ? '+' : '·'}
                title={`G/N, |G/N| = ${Q.order}`}
                label={t('Tabel grup faktor G/N', 'Table of the factor group G/N')}
              />
              <p className="text-[13px] leading-relaxed text-slate-300">
                {t(<>Kalikan kantong dengan mengambil wakil mana saja: <Tex tex="(Na)(Nb) = N(ab)" />. Hasilnya tidak bergantung pada wakil karena N normal. Warnanya sama dengan warna kantong. </>,
                   <>Multiply bags by picking any representatives: <Tex tex="(Na)(Nb) = N(ab)" />. The answer does not depend on the representatives because N is normal. The colours match the bags. </>)}
                {isAbelian(Q) ? t('G/N abelian.', 'G/N is abelian.') : t('G/N tak-abelian.', 'G/N is non-abelian.')}
              </p>
            </>
          ) : normal ? (
            <p className="text-[13px] text-slate-400">{t('N = G atau N = {e}: grup faktornya trivial atau sama dengan G. Pilih subgrup normal sejati.', 'N = G or N = {e}: the factor group is trivial or G itself. Pick a proper normal subgroup.')}</p>
          ) : (
            <p className="text-[13px] leading-relaxed text-rose-300">
              {t(<>H tidak normal: kantong-kantongnya tetap mempartisi G (Lagrange berlaku untuk setiap subgrup), tetapi <Tex tex="(Ha)(Hb) = H(ab)" /> bergantung pada wakil yang dipilih. Jadi titik-titik di bawah hanya himpunan, bukan grup.</>,
                 <>H is not normal: its bags still partition G (Lagrange holds for every subgroup), but <Tex tex="(Ha)(Hb) = H(ab)" /> depends on the representatives. So the points below are only a set, not a group.</>)}
            </p>
          )}
        </div>
      </div>
    </MathCard>
  )
}
