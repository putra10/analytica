import { useMemo, useState } from 'react'
import { Waypoints } from 'lucide-react'
import { GROUP_CATALOG, cyclic, homomorphisms, range, smallGeneratingSet, type Group, type Hom } from '../../lib/group-theory'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { CollapseDiagram, type Block, type Target } from './CollapseDiagram'
import { compact, labelTex, pal } from './pic-utils'

const setTex = (labels: string[], elems: number[]) => `\\{${elems.map((i) => labelTex(labels[i])).join(',\\ ')}\\}`

/**
 * Herstein 2.5 and 2.7.1 made visible: pick a homomorphism φ: G → H and G splits into the
 * fibres of φ (bags). The bag over e′ is ker φ, the others are its cosets, and the points they
 * land on are φ(G), so |G| = |ker φ|·|φ(G)| and G/ker φ ≅ φ(G) can be read off the picture.
 */
export function KernelLab({ g, extra }: { g: Group; extra?: { id: string; make: () => Group } }) {
  const t = useT()
  const catalog = useMemo(() => [...GROUP_CATALOG, ...(extra ? [extra] : [])], [extra])
  const [hid, setHid] = useState('Z2')
  const h = useMemo(() => (hid === 'Z2' ? cyclic(2) : (catalog.find((c) => c.id === hid) ?? catalog[0]).make()), [hid, catalog])
  const [pick, setPick] = useState(0)
  // biggest image first, so the default pick is the most informative map rather than the trivial one
  const homs = useMemo(
    () => homomorphisms(g, h).sort((a, b) => b.image.length - a.image.length || a.imgs.join().localeCompare(b.imgs.join())),
    [g, h],
  )
  const gens = useMemo(() => smallGeneratingSet(g), [g])
  const tag = `${g.id}:${g.order}|${h.id}:${h.order}`
  const [seen, setSeen] = useState(tag)
  if (seen !== tag) { setSeen(tag); setPick(0) }
  const hom: Hom | undefined = homs[Math.min(pick, homs.length - 1)]

  const body = () => {
    if (!homs.length) return <p className="text-sm text-slate-500">{t('G memerlukan terlalu banyak pembangkit untuk mencacah homomorfismanya di sini.', 'G needs too many generators to enumerate its homomorphisms here.')}</p>
    if (!hom) return null
    const n = hom.image.length
    const colorOf = (y: number) => pal(hom.image.indexOf(y), n)
    const blocks: Block[] = hom.image.map((y) => ({
      key: y, name: `φ⁻¹(${compact(h.labels[y])})`, elems: range(g.order).filter((a) => hom.map[a] === y).map((a) => compact(g.labels[a])),
      color: colorOf(y), tag: y === h.e ? 'ker φ' : undefined,
    }))
    const targets: Target[] = range(h.order).map((y) => ({ key: y, name: compact(h.labels[y]), color: hom.image.includes(y) ? colorOf(y) : 'var(--border-strong)', dimmed: !hom.image.includes(y) }))
    const onto = n === h.order, injective = hom.kernel.length === 1
    return (
      <>
        <p className="mb-2 text-[12px] text-slate-400">
          {t(<>Homomorfisma <Tex tex={`\\varphi: ${g.tex} \\to ${h.tex}`} /> ({homs.length} buah), ditentukan oleh bayangan pembangkit:</>,
             <>Homomorphisms <Tex tex={`\\varphi: ${g.tex} \\to ${h.tex}`} /> ({homs.length} of them), fixed by the images of the generators:</>)}
        </p>
        <div className="mb-3 flex max-h-32 flex-wrap gap-1 overflow-auto">
          {homs.map((x, i) => (
            <Chip key={i} active={i === Math.min(pick, homs.length - 1)} onClick={() => setPick(i)} className="px-1.5 py-0.5 text-[10px]">
              {gens.map((a, k) => `${compact(g.labels[a])}↦${compact(h.labels[x.imgs[k]])}`).join(', ')}
            </Chip>
          ))}
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CollapseDiagram blocks={blocks} targets={targets} leftName="G" label={t('Serat-serat φ dan bayangannya', 'The fibres of φ and their images')} />
          <div className="min-w-0 space-y-2">
            <p className="text-[13px] leading-relaxed text-slate-300">
              {t(`Atas: ${blocks.length} kantong, masing-masing ${hom.kernel.length} unsur = |ker φ|. Bawah: unsur-unsur ${h.name}; yang pucat tidak dikenai φ.`,
                 `Top: ${blocks.length} bags of ${hom.kernel.length} elements each = |ker φ|. Bottom: the elements of ${h.name}; the faded ones are not hit by φ.`)}
            </p>
            <FormulaBlock tex={`\\ker\\varphi = ${setTex(g.labels, hom.kernel)}`} />
            <FormulaBlock tex={`|G| = |\\ker\\varphi|\\cdot|\\varphi(G)|:\\ ${g.order} = ${hom.kernel.length} \\cdot ${n}`} />
            <FormulaBlock tex={`G/\\ker\\varphi \\cong \\varphi(G)`} />
            <p className={cn('text-[13px] leading-relaxed', injective || onto ? 'text-emerald-300' : 'text-slate-400')}>
              {injective ? t('ker φ = {e}, jadi φ satu-satu: tidak ada yang dilipat.', 'ker φ = {e}, so φ is one-to-one: nothing is folded.') : t(`Setiap titik yang dikenai berasal dari ${hom.kernel.length} unsur G: itulah seberapa banyak φ melipat.`, `Every point that is hit comes from ${hom.kernel.length} elements of G: that is how much φ folds.`)}
              {onto ? t(' φ juga pada.', ' φ is also onto.') : t(` φ(G) hanya subgrup berorde ${n} di ${h.name}.`, ` φ(G) is only a subgroup of order ${n} in ${h.name}.`)}
            </p>
            <p className="text-[12px] leading-relaxed text-slate-400">
              {t('Kantong ker φ berisi unsur yang jatuh ke e′; kantong lainnya tepat koset-kosetnya, jadi kernel selalu normal (2.5.5). Memadatkan setiap kantong menjadi satu titik memberi G/ker φ, dan itu sama dengan φ(G) (2.7.1).',
                 'The ker φ bag holds the elements sent to e′; the other bags are exactly its cosets, so a kernel is always normal (2.5.5). Collapsing each bag to a point gives G/ker φ, which is φ(G) (2.7.1).')}
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <MathCard title={<>{t('Homomorfisma, kernel dan serat', 'Homomorphisms, kernels and fibres')} <Tex tex="\varphi: G \to H" /></>} icon={<Waypoints size={16} />} className="lg:col-span-3">
      <p className="mb-1 text-[12px] text-slate-400">{t('Grup tujuan H:', 'Target group H:')}</p>
      <div className="mb-3 flex flex-wrap gap-1">
        {[{ id: 'Z2', make: () => cyclic(2) }, ...catalog].map((c) => <Chip key={c.id} active={c.id === hid} onClick={() => setHid(c.id)} className="px-1.5 py-0.5 text-[10px]">{c.make().name}</Chip>)}
      </div>
      {body()}
    </MathCard>
  )
}
