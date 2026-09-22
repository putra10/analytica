import { useMemo, useState } from 'react'
import { Waypoints } from 'lucide-react'
import { homomorphisms, range, smallGeneratingSet, type Group, type Hom } from '../../lib/group-theory'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { CollapseDiagram, HUES, TINT, labelTex, type Block, type Target } from './CollapseDiagram'

const setTex = (labels: string[], elems: number[]) => `\\{${elems.map((i) => labelTex(labels[i])).join(',\\ ')}\\}`

/**
 * Herstein 2.5 and 2.7.1 made visible: pick a homomorphism φ: G → H and the domain splits into the
 * fibres of φ. The fibre over e′ is ker φ, the others are exactly its cosets, and the points they
 * land on are φ(G) — so |G| = |ker φ|·|φ(G)| and G/ker φ ≅ φ(G) can be read off the picture.
 */
export function KernelLab({ g, h }: { g: Group; h: Group }) {
  const t = useT()
  const [pick, setPick] = useState(0)
  // biggest image first, so the default pick is the most informative map rather than the trivial one
  const homs = useMemo(
    () => homomorphisms(g, h).sort((a, b) => b.image.length - a.image.length || a.imgs.join().localeCompare(b.imgs.join())),
    [g, h],
  )
  const gens = useMemo(() => smallGeneratingSet(g), [g])
  // changing either group invalidates the chosen map: start again at the first one
  const tag = `${g.id}:${g.order}|${h.id}:${h.order}`
  const [seen, setSeen] = useState(tag)
  if (seen !== tag) { setSeen(tag); setPick(0) }
  const hom: Hom | undefined = homs[Math.min(pick, homs.length - 1)]

  const body = () => {
    if (!homs.length) {
      return <p className="text-sm text-slate-500">{t('G memerlukan terlalu banyak pembangkit untuk mencacah homomorfismanya di sini.', 'G needs too many generators to enumerate its homomorphisms here.')}</p>
    }
    if (!hom) return null

    // one block per element of the image: the elements of G that φ sends there
    const parts = hom.image.map((y) => ({ y, elems: range(g.order).filter((a) => hom.map[a] === y) }))
    const hueOf = (y: number) => HUES(hom.image.length, hom.image.indexOf(y))
    const tintOf = (y: number) => TINT(hom.image.length, hom.image.indexOf(y))
    const blocks: Block[] = parts.map((p) => ({
      key: p.y,
      tex: `\\varphi^{-1}(${labelTex(h.labels[p.y])})`,
      elems: p.elems.map((a) => g.labels[a]),
      hue: hueOf(p.y), tint: tintOf(p.y),
      tag: p.y === h.e ? 'ker φ' : undefined,
    }))
    // every element of H, so that φ(G) ≤ H is visible: the ones outside the image stay hollow
    const targets: Target[] = range(h.order).map((y) => ({
      key: y,
      tex: labelTex(h.labels[y]),
      hue: hueOf(y), tint: tintOf(y),
      dimmed: !hom.image.includes(y),
    }))
    const onto = hom.image.length === h.order
    const injective = hom.kernel.length === 1

    return (
      <>
        <p className="mb-2 text-[11px] text-slate-500">
          {t(<>Homomorfisma <Tex tex={`\\varphi: ${g.tex} \\to ${h.tex}`} /> ({homs.length} buah), diberikan oleh bayangan pembangkit:</>,
             <>Homomorphisms <Tex tex={`\\varphi: ${g.tex} \\to ${h.tex}`} /> ({homs.length} of them), given by the images of the generators:</>)}
        </p>
        <div className="mb-3 flex flex-wrap gap-1">
          {homs.map((x, i) => (
            <Chip key={i} active={i === Math.min(pick, homs.length - 1)} onClick={() => setPick(i)} className="px-1.5 py-0.5 text-[10px]">
              {gens.map((a, k) => `${g.labels[a]}↦${h.labels[x.imgs[k]]}`).join(', ')}
            </Chip>
          ))}
        </div>

        <CollapseDiagram
          blocks={blocks}
          targets={targets}
          leftTex="G"
          rightTex={h.tex}
          mapTex="a \longmapsto \varphi(a)"
          targetsWide
          note={t(
            `${parts.length} serat, masing-masing berukuran ${hom.kernel.length} = |ker φ|.`,
            `${parts.length} fibres, each of size ${hom.kernel.length} = |ker φ|.`,
          )}
        />

        <div className="mt-3 space-y-1">
          <FormulaBlock tex={`\\ker\\varphi = ${setTex(g.labels, hom.kernel)},\\qquad \\varphi(G) = ${setTex(h.labels, hom.image)}`} />
          <FormulaBlock tex={`|G| = |\\ker\\varphi|\\cdot|\\varphi(G)|:\\quad ${g.order} = ${hom.kernel.length} \\cdot ${hom.image.length};\\qquad G/\\ker\\varphi \\cong \\varphi(G)`} />
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {t(<>Blok bertanda <b>ker φ</b> adalah unsur-unsur yang jatuh ke <Tex tex="e'" />; blok lainnya persis koset-kosetnya. Itulah isi 2.5.5: kernel selalu normal. Memadatkan setiap blok menjadi satu titik menghasilkan <Tex tex="G/\ker\varphi" />, dan hasilnya sama dengan <Tex tex="\varphi(G)" /> — teorema homomorfisma pertama (2.7.1).</>,
             <>The block tagged <b>ker φ</b> holds the elements sent to <Tex tex="e'" />; the other blocks are exactly its cosets. That is 2.5.5: a kernel is always normal. Collapsing each block to a point gives <Tex tex="G/\ker\varphi" />, and what you get is <Tex tex="\varphi(G)" /> — the first homomorphism theorem (2.7.1).</>)}
        </p>
        <p className={cn('mt-1 text-xs', injective || onto ? 'text-emerald-300' : 'text-slate-400')}>
          {injective
            ? t(<><Tex tex="\ker\varphi = \{e\}" />, jadi φ satu-satu: tidak ada yang dilupakan.</>, <><Tex tex="\ker\varphi = \{e\}" />, so φ is one-to-one: nothing is forgotten.</>)
            : t(<>Setiap titik di kanan ditarik dari {hom.kernel.length} unsur G: itulah "berapa banyak yang dilupakan φ".</>, <>Every point on the right is hit by {hom.kernel.length} elements of G: that is "how much φ forgets".</>)}
          {onto
            ? t(' φ juga pada, jadi bayangannya seluruh H.', ' φ is also onto, so its image is all of H.')
            : t(` Titik pucat bukan bayangan siapa pun: φ(G) hanya subgrup berorde ${hom.image.length} di H.`, ` The hollow points are hit by nobody: φ(G) is only a subgroup of order ${hom.image.length} in H.`)}
        </p>
      </>
    )
  }

  return (
    <MathCard
      title={<>{t('Homomorfisma, kernel dan serat', 'Homomorphisms, kernels and fibres')} <Tex tex="\varphi: G \to H" /></>}
      icon={<Waypoints size={16} />}
      className="lg:col-span-3"
    >
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        {t(<>Pilih φ, lalu lihat G terbelah menjadi serat-seratnya: satu blok untuk setiap bayangan. Blok yang jatuh ke <Tex tex="e'" /> adalah <Tex tex="\ker\varphi" />. Grup pembanding H diatur pada kartu isomorfisma di bawah.</>,
           <>Pick a φ and watch G split into its fibres: one block per image. The block landing on <Tex tex="e'" /> is <Tex tex="\ker\varphi" />. The comparison group H is set on the isomorphism card below.</>)}
      </p>
      {body()}
    </MathCard>
  )
}
