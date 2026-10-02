import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Grid3x3, Layers, ListOrdered } from 'lucide-react'
import {
  GROUP_CATALOG, center, cosets, elementOrder, generators, isAbelian, isCyclic, isNormal, leftCoset, mul,
  orderProfile, permutationGroupFrom, rightCoset, subgroups, type Group,
} from '../../lib/group-theory'
import { useLang, useT } from '../../lib/i18n'
import { MathCard, Chip, TextField, Toggle } from '../ui/MathCard'
import { Tex } from '../ui/FormulaBlock'
import { C, T, type P } from '../stories/kit'
import { CosetCollapse } from './CosetCollapse'
import { KernelLab } from './KernelLab'
import { CayleyPic, LabLayout, Link, Node, Pic, PicCard, Steps } from './pics'
import { additive, clockAt, compact, cosetName, labelTex, layoutBags, pal, textW } from './pic-utils'

const setTex = (g: Group, elems: number[]) => `\\{${elems.map((i) => labelTex(g.labels[i])).join(',\\ ')}\\}`
const setTxt = (g: Group, elems: number[], max = 5) => `{${elems.slice(0, max).map((i) => compact(g.labels[i])).join(', ')}${elems.length > max ? ', …' : ''}}`

/**
 * Cyclic groups on a clock (the powers of a generator going round), cosets of H as coloured
 * polygons, like the Z₁₂ stories; any other group as coloured bags of cosets.
 */
function CosetPicture({ g, H, cs, side }: { g: Group; H?: number[]; cs: { rep: number; elems: number[] }[]; side: 'left' | 'right' }) {
  const t = useT()
  const cyc = isCyclic(g) && g.order <= 24
  const cosetOf = new Map<number, number>()
  cs.forEach((c, i) => c.elems.forEach((x) => cosetOf.set(x, i)))
  const lagrange = H ? `${g.order} = ${cs.length} × ${H.length}` : `|G| = ${g.order}`

  if (cyc) {
    const a = generators(g)[0], n = g.order
    // powers[k] = a^k, so the clock shows "keep applying a"
    const powers: number[] = [g.e]
    for (let k = 1; k < n; k++) powers.push(mul(g, powers[k - 1], a))
    const slot = new Map(powers.map((x, k) => [x, k]))
    const ctr: P = [150, 152], R = n > 16 ? 118 : 110, at = clockAt(ctr, R, n)
    const r = n > 16 ? 12 : 15, size = n > 16 ? 11 : 14
    const lines = H ? cs.slice(0, 6).map((c, i) => ({ s: `${cosetName(g, c.rep, side)} = ${setTxt(g, c.elems, 4)}`, color: pal(i, cs.length) })) : []
    const fs = Math.min(14, ...lines.map((l) => (14 * 160) / Math.max(textW(l.s, 14), 1)))
    return (
      <Pic h={300} label={t('Grup siklik pada jam', 'A cyclic group on a clock')}>
        <circle cx={ctr[0]} cy={ctr[1]} r={R} fill="none" stroke={C.faint} />
        {H && cs.map((c, i) => {
          const pts = c.elems.map((x) => slot.get(x)!).sort((p, q) => p - q).map(at)
          return pts.length > 1 && <path key={i} d={pts.map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + (pts.length > 2 ? ' Z' : '')} fill={pal(i, cs.length)} fillOpacity=".12" stroke={pal(i, cs.length)} strokeWidth="2.5" />
        })}
        {!H && powers.map((_, k) => <Link key={k} p={at(k)} q={at((k + 1) % n)} color={C.a} width={1.8} r1={r + 2} r2={r + 4} />)}
        {powers.map((x, k) => {
          const i = cosetOf.get(x)
          return <Node key={x} at={at(k)} label={compact(g.labels[x])} r={r} size={size} fill={H && i !== undefined ? pal(i, cs.length) : C.bg} stroke={H && i !== undefined ? pal(i, cs.length) : C.a} />
        })}
        <T x={300} y={42} anchor="start" size={18} weight={700} color={C.a}>G = ⟨{compact(g.labels[a])}⟩</T>
        <T x={300} y={66} anchor="start" size={13} color={C.mu}>{H ? t('koset: H yang diputar', 'cosets: H rotated') : `${t('panah: langkah', 'arrows: step')} ${additive(g.id) ? '+' : '·'}${compact(g.labels[a])}`}</T>
        {lines.map((l, i) => (
          <g key={i}>
            <rect x={300} y={88 + i * 28} width={12} height={12} rx={3} fill={l.color} />
            <T x={318} y={99 + i * 28} anchor="start" size={fs}>{l.s}</T>
          </g>
        ))}
        {cs.length > 6 && H && <T x={318} y={99 + 6 * 28} anchor="start" size={13} color={C.mu}>… {t(`${cs.length} koset`, `${cs.length} cosets`)}</T>}
        <T x={300} y={282} anchor="start" size={16} weight={700} color={C.v}>{lagrange}</T>
      </Pic>
    )
  }

  const bags = H
    ? cs.slice(0, 12).map((c, i) => ({ title: cosetName(g, c.rep, side), color: pal(i, cs.length), items: c.elems.map((x) => compact(g.labels[x])) }))
    : [{ title: `G, |G| = ${g.order}`, color: C.a, items: g.labels.map(compact) }]
  const L = layoutBags(bags, 480, 14)
  return (
    <Pic h={L.bottom + 42} label={t('Koset sebagai kantong', 'Cosets as bags')}>
      {L.node}
      <T x={240} y={L.bottom + 28} size={15} weight={700} color={C.v}>{H ? `|G| = [G:H] · |H|:  ${lagrange}${cs.length > 12 ? t('  (12 kantong pertama)', '  (first 12 bags)') : ''}` : t('pilih subgrup H untuk membaginya', 'pick a subgroup H to split it')}</T>
    </Pic>
  )
}

export function GroupLab() {
  const t = useT()
  const { lang } = useLang()
  const [gid, setGid] = useState('Z12')
  const [subIdx, setSubIdx] = useState<number | null>(null)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [customText, setCustomText] = useState('(1 2 3 4), (1 3)')
  const customGroup = useMemo(() => {
    try { return { ok: true as const, g: permutationGroupFrom(customText) } } catch (e) { return { ok: false as const, error: (e as Error).message } }
  }, [customText])
  // while the custom generators are being typed they are often unparseable; fall back to a catalog group
  const resolve = useCallback(
    (id: string) => (id === 'custom' && customGroup.ok ? customGroup.g : (GROUP_CATALOG.find((c) => c.id === id) ?? GROUP_CATALOG[0]).make()),
    [customGroup],
  )
  const g = useMemo(() => resolve(gid), [gid, resolve])
  const subs = useMemo(() => subgroups(g), [g])
  const H = subIdx !== null ? subs[subIdx] : undefined
  const normal = H ? isNormal(g, H) : false
  const cs = useMemo(() => (H ? cosets(g, H, side) : []), [g, H, side])
  const abelian = isAbelian(g)
  const cyc = isCyclic(g)
  const gens = cyc ? generators(g) : []
  const Z = center(g)
  const add = additive(g.id)
  const extra = useMemo(() => (customGroup.ok ? { id: 'custom', make: () => customGroup.g } : undefined), [customGroup])

  const pick = (id: string) => { setGid(id); setSubIdx(null) }
  const cosetIdx = new Map<number, number>()
  cs.forEach((c, i) => c.elems.forEach((x) => cosetIdx.set(x, i)))

  // hand-written working: list the cosets, count them (Lagrange), then test normality
  const steps = () => {
    if (!H) return [{ text: t('Pilih subgrup H untuk melihat langkah-langkah daftar koset dan hitungan Lagrange.', 'Pick a subgroup H to see the coset listing and the Lagrange count worked out.') }]
    const name = (rep: number) => labelTex(cosetName(g, rep, side))
    const out: { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }[] = [
      { text: t('Tulis H dan hitung ukurannya.', 'Write down H and count it.'), tex: `H = ${setTex(g, H)},\\quad |H| = ${H.length}` },
    ]
    cs.slice(0, 4).forEach((c, i) => {
      if (i === 0) return
      out.push({
        text: t(`Ambil unsur yang belum tercakup, a = ${compact(g.labels[c.rep])}, lalu ${add ? 'tambahkan a ke' : side === 'right' ? 'kalikan dari kanan dengan a' : 'kalikan dari kiri dengan a'} setiap anggota H.`,
                `Take an element not covered yet, a = ${compact(g.labels[c.rep])}, and ${add ? 'add a to' : side === 'right' ? 'multiply on the right by a' : 'multiply on the left by a'} every member of H.`),
        tex: `${name(c.rep)} = ${setTex(g, c.elems)}`,
      })
    })
    if (cs.length > 4) out.push({ text: t(`Ulangi sampai semua unsur tercakup: total ${cs.length} koset, tidak ada yang tumpang tindih.`, `Repeat until every element is covered: ${cs.length} cosets in all, none overlapping.`) })
    out.push({ text: t('Lagrange: koset sama besar dan saling lepas, jadi ukuran grup = banyak koset × ukuran H.', 'Lagrange: the cosets have equal size and do not overlap, so the group size = number of cosets × size of H.'), tex: `|G| = [G:H]\\,|H|:\\quad ${g.order} = ${cs.length} \\cdot ${H.length}` })
    if (normal) out.push({ text: t('Untuk setiap a, koset kiri aH sama dengan koset kanan Ha, jadi H normal dan G/H adalah grup.', 'For every a the left coset aH equals the right coset Ha, so H is normal and G/H is a group.'), tex: `aH = Ha\\ \\forall a \\Rightarrow H \\lhd G,\\quad |G/H| = ${cs.length}`, tone: 'good' })
    else {
      const a = g.labels.findIndex((_, x) => leftCoset(g, x, H).join() !== rightCoset(g, x, H).join())
      out.push({ text: t(`Cek normal: untuk a = ${compact(g.labels[a])} koset kiri dan kanan berbeda, jadi H tidak normal.`, `Normality check: for a = ${compact(g.labels[a])} the left and right cosets differ, so H is not normal.`), tex: `${labelTex(g.labels[a])}H = ${setTex(g, leftCoset(g, a, H))} \\neq H${labelTex(g.labels[a])} = ${setTex(g, rightCoset(g, a, H))}`, tone: 'bad' })
    }
    return out
  }

  return (
    <LabLayout
      picture={
        <>
          <PicCard eyebrow={t('Gambar', 'Picture')} title={cyc && g.order <= 24 ? t('Grup siklik di jam, koset sebagai bangun yang diputar', 'A cyclic group on a clock, cosets as rotated shapes') : t('Koset sebagai kantong', 'Cosets as bags')}
            caption={H ? t(`Setiap warna satu koset. ${cs.length} koset × ${H.length} unsur = ${g.order}: ukuran subgrup membagi ukuran grup.`, `Each colour is one coset. ${cs.length} cosets × ${H.length} elements = ${g.order}: a subgroup's size divides the group's size.`) : t('Pilih subgrup H di panel kanan; G akan terbagi menjadi koset-kosetnya.', 'Pick a subgroup H on the right; G will split into its cosets.')}>
            <CosetPicture g={g} H={H} cs={cs} side={side} />
          </PicCard>
          <PicCard eyebrow={t('Tabel Cayley', 'Cayley table')} title={`${g.name}: ${t('baris · kolom', 'row · column')}`}
            caption={H ? t('Sel diwarnai menurut koset hasil kalinya, dengan warna yang sama seperti gambar di atas.', 'Cells are coloured by the coset of their product, with the same colours as the picture above.') : t('Sel hijau = e. Setiap baris memuat e tepat sekali, di kolom invers unsur baris itu.', 'Green cells = e. Every row has e exactly once, in the column of that row’s inverse.')}>
            <CayleyPic g={g} sym={add ? '+' : '·'} label={t('Tabel Cayley', 'Cayley table')} tone={(x) => (H ? pal(cosetIdx.get(x) ?? 0, cs.length) : x === g.e ? C.g : undefined)} />
          </PicCard>
        </>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={t('Grup G', 'Group G')} icon={<Grid3x3 size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {GROUP_CATALOG.map((c) => <Chip key={c.id} active={c.id === gid} onClick={() => pick(c.id)}>{c.make().name}</Chip>)}
              <Chip active={gid === 'custom'} onClick={() => pick('custom')}>{t('Kustom ⟨…⟩', 'Custom ⟨…⟩')}</Chip>
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-[11px] text-slate-500">{t('Subgrup Sₙ yang dibangun oleh permutasi (notasi siklus, pisahkan koma):', 'Subgroup of Sₙ generated by permutations (cycle notation, comma separated):')}</label>
              <TextField value={customText} onChange={(v) => { setCustomText(v); if (gid !== 'custom') pick('custom') }} placeholder="(1 2 3 4), (1 3)" invalid={gid === 'custom' && !customGroup.ok} />
              {gid === 'custom' && !customGroup.ok && <p className="mt-1 text-[11px] text-rose-300">{t('Tidak dapat dibaca. Contoh: (1 2 3 4), (1 3)', 'Cannot read this. Example: (1 2 3 4), (1 3)')}</p>}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{g.description[lang]}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-300">
              <span><Tex tex={`|G| = ${g.order}`} /></span>
              <span>{abelian ? t('abelian', 'abelian') : t('tak-abelian', 'non-abelian')}</span>
              <span>{cyc ? <>{t('siklik', 'cyclic')}, <Tex tex={`G = (${labelTex(g.labels[gens[0]])})`} /></> : t('tidak siklik', 'not cyclic')}</span>
              <span className="min-w-0 overflow-x-auto"><Tex tex={`|Z(G)| = ${Z.length}`} /></span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t('Orde unsur: ', 'Element orders: ')}
              {orderProfile(g).map(([o, c]) => `${c}×${t('orde', 'order')} ${o}`).join(', ')}
            </p>
          </MathCard>

          <MathCard title={<span>{t('Subgrup', 'Subgroups')} <Tex tex="H \le G" /></span>} icon={<Layers size={16} />}>
            <div className="flex max-h-48 flex-wrap gap-1.5 overflow-auto">
              {subs.map((s, i) => (
                <Chip key={i} active={subIdx === i} onClick={() => setSubIdx(subIdx === i ? null : i)}>
                  {s.length === 1 ? '{e}' : s.length === g.order ? 'G' : `|H|=${s.length}: ${s.slice(0, 3).map((x) => compact(g.labels[x])).join(',')}${s.length > 3 ? ',…' : ''}`}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {t(`${subs.length} subgrup. Orde setiap subgrup membagi |G| (Lagrange).`, `${subs.length} subgroups. Every subgroup order divides |G| (Lagrange).`)}
            </p>
            {H && !add && <div className="mt-2"><Toggle label={t('Koset kanan Ha (mati: koset kiri aH)', 'Right cosets Ha (off: left cosets aH)')} checked={side === 'right'} onChange={(v) => setSide(v ? 'right' : 'left')} /></div>}
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Langkah demi langkah: koset dan Lagrange', 'Step by step: cosets and Lagrange')} icon={<ListOrdered size={16} />} className="lg:col-span-1">
            <Steps steps={steps()} />
            {H && <p className="mt-3 text-[12px] text-slate-400">{t(`Akibat Lagrange: orde setiap unsur membagi ${g.order}. Di sini orde unsur: ${[...new Set(g.labels.map((_, x) => elementOrder(g, x)))].sort((p, q) => p - q).join(', ')}.`, `Consequence of Lagrange: every element order divides ${g.order}. Here the element orders are ${[...new Set(g.labels.map((_, x) => elementOrder(g, x)))].sort((p, q) => p - q).join(', ')}.`)}</p>}
          </MathCard>
          <div className="min-w-0 lg:col-span-2"><CosetCollapse g={g} H={H} cs={cs} side={side} normal={normal} /></div>
          <KernelLab g={g} extra={extra} />
        </div>
      }
    />
  )
}
