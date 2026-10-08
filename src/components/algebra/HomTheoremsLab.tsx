import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, Grid3x3, Layers, ListOrdered } from 'lucide-react'
import { GROUP_CATALOG, correspondenceTheorem, isNormal, secondIsoTheorem, subgroups, thirdIsoTheorem, type Group } from '../../lib/group-theory'
import { topicFromHash } from '../../content/syllabus-activities'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip } from '../ui/MathCard'
import { Tex } from '../ui/FormulaBlock'
import { C, T } from '../stories/kit'
import { KernelLab } from './KernelLab'
import { LabLayout, Pic, PicCard, Steps } from './pics'
import { compact, cosetName, labelTex, layoutBags, pal } from './pic-utils'

type Thm = 'first' | 'corr' | 'second' | 'third'
type Step = { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }
const FROM_TOPIC: Record<string, Thm> = { firstIso: 'first', correspondence: 'corr', secondIso: 'second', thirdIso: 'third' }

const setTex = (g: Group, xs: number[]) => `\\{${xs.map((i) => labelTex(g.labels[i])).join(',\\ ')}\\}`
const short = (g: Group, xs: number[], max = 4) => xs.length === 1 && xs[0] === g.e ? '{e}' : xs.length === g.order ? 'G' : `{${xs.slice(0, max).map((x) => compact(g.labels[x])).join(', ')}${xs.length > max ? ', …' : ''}}`
const sub = (A: number[], B: number[]) => A.every((x) => B.includes(x))

/** Homomorphism theorems (Herstein 2.7) on any catalog group: first (kernel panel), correspondence, second, third. */
export function HomTheoremsLab() {
  const t = useT()
  const [thm, setThm] = useState<Thm>(() => FROM_TOPIC[topicFromHash() ?? ''] ?? 'second')
  const [gid, setGid] = useState('S4')
  const g = useMemo(() => (GROUP_CATALOG.find((c) => c.id === gid) ?? GROUP_CATALOG[0]).make(), [gid])
  const subs = useMemo(() => subgroups(g), [g])
  const normals = useMemo(() => subs.filter((h) => isNormal(g, h)), [g, subs])
  const names: Record<Thm, string> = {
    first: t('Pertama: G/ker φ ≅ φ(G)', 'First: G/ker φ ≅ φ(G)'),
    corr: t('Korespondensi', 'Correspondence'),
    second: t('Kedua: HN/N ≅ H/(H∩N)', 'Second: HN/N ≅ H/(H∩N)'),
    third: t('Ketiga: (G/K)/(N/K) ≅ G/N', 'Third: (G/K)/(N/K) ≅ G/N'),
  }
  return (
    <div className="min-w-0 space-y-4">
      <MathCard title={t('Teorema dan grup', 'Theorem and group')} icon={<Grid3x3 size={16} />}>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(names) as Thm[]).map((k) => <Chip key={k} active={thm === k} onClick={() => setThm(k)}>{names[k]}</Chip>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {GROUP_CATALOG.map((c) => <Chip key={c.id} active={c.id === gid} onClick={() => setGid(c.id)}>{c.make().name}</Chip>)}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{t(`|G| = ${g.order}; ${subs.length} subgrup, ${normals.length} di antaranya normal.`, `|G| = ${g.order}; ${subs.length} subgroups, ${normals.length} of them normal.`)}</p>
      </MathCard>
      {thm === 'first' && <div className="grid gap-4 lg:grid-cols-3"><KernelLab g={g} /></div>}
      {thm !== 'first' && <Panel key={`${thm}-${g.id}`} thm={thm} g={g} subs={subs} normals={normals} />}
    </div>
  )
}

function Panel({ thm, g, subs, normals }: { thm: Exclude<Thm, 'first'>; g: Group; subs: number[][]; normals: number[][] }) {
  const t = useT()
  const proper = normals.filter((n) => n.length > 1 && n.length < g.order)
  // defaults that show something: second/corr use the smallest proper normal N; third uses the largest N with a smaller normal K inside
  const [n, setN] = useState(() => {
    if (thm !== 'third') return normals.indexOf(proper[0] ?? normals[0])
    const N = [...proper].reverse().find((N) => normals.some((K) => K.length > 1 && K.length < N.length && sub(K, N))) ?? proper.at(-1) ?? normals.at(-1)!
    return normals.indexOf(N)
  })
  const N = normals[n]
  const [h, setH] = useState(() => Math.max(0, subs.findIndex((H) => H.length > 1 && !sub(H, N) && !sub(N, H))))
  const Ks = normals.filter((K) => sub(K, N))
  const [k, setK] = useState(() => { const K = [...Ks].reverse().find((K) => K.length < N.length && K.length > 1) ?? Ks[0]; return Ks.indexOf(K) })
  const H = subs[h], K = Ks[Math.min(k, Ks.length - 1)]

  const chips = (list: number[][], active: number, pick: (i: number) => void, label: (S: number[]) => string = (S) => `|${S.length}|: ${short(g, S, 3)}`) => (
    <div className="flex max-h-40 flex-wrap gap-1.5 overflow-auto">{list.map((S, i) => <Chip key={i} active={i === active} onClick={() => pick(i)}>{label(S)}</Chip>)}</div>
  )
  const controls = (
    <div className="space-y-4">
      <MathCard title={<span>{t('Subgrup normal', 'Normal subgroup')} <Tex tex="N \lhd G" /></span>} icon={<Layers size={16} />}>
        {chips(normals, n, (i) => { setN(i); setK(0) })}
        <p className="mt-2 text-[11px] text-slate-500">{t('Hanya subgrup normal yang ditawarkan: G/N hanya grup jika N normal.', 'Only normal subgroups are offered: G/N is a group only when N is normal.')}</p>
      </MathCard>
      {thm === 'second' && <MathCard title={<span>{t('Subgrup sembarang', 'Any subgroup')} <Tex tex="H \le G" /></span>} icon={<Layers size={16} />}>
        {chips(subs, h, setH)}
        <p className="mt-2 text-[11px] text-slate-500">{t('H tidak perlu normal.', 'H need not be normal.')}</p>
      </MathCard>}
      {thm === 'third' && <MathCard title={<span>{t('Subgrup normal di dalam N', 'Normal subgroup inside N')} <Tex tex="K \subseteq N" /></span>} icon={<Layers size={16} />}>
        {chips(Ks, Math.min(k, Ks.length - 1), setK)}
        <p className="mt-2 text-[11px] text-slate-500">{t('K harus normal di G dan termuat di N.', 'K must be normal in G and contained in N.')}</p>
      </MathCard>}
    </div>
  )

  let picture: ReactNode, steps: Step[], theory: ReactNode
  if (thm === 'second') {
    const r = secondIsoTheorem(g, H, N)
    const top = layoutBags(r.top.map((c, i) => ({ title: cosetName(g, c.rep, 'left', 'N'), color: pal(i, r.top.length), items: c.elems.map((x) => compact(g.labels[x])), ring: c.elems.includes(g.e) })), 480, 40)
    const bot = layoutBags(r.bottom.map((c, i) => ({ title: cosetName(g, c.rep, 'left', 'D'), color: pal(r.map[i], r.top.length), items: c.elems.map((x) => compact(g.labels[x])), ring: c.elems.includes(g.e) })), 480, top.bottom + 46)
    picture = (
      <PicCard eyebrow={t('Gambar', 'Picture')} title={t('Atas: HN dibagi koset N. Bawah: H dibagi koset D = H∩N.', 'Top: HN split into N-cosets. Bottom: H split into cosets of D = H∩N.')}
        caption={t(`Warna yang sama = pasangan h·D ↦ h·N. Ada ${r.top.length} kantong di atas dan ${r.bottom.length} di bawah, satu-satu berpasangan: itulah isomorfismanya.`, `Same colour = the pair h·D ↦ h·N. ${r.top.length} bags on top and ${r.bottom.length} below, matched one to one: that is the isomorphism.`)}>
        <Pic h={bot.bottom + 16} label={t('Teorema homomorfisma kedua', 'Second homomorphism theorem')}>
          <T x={240} y={26} size={14} weight={700} color={C.mu}>{`HN/N  (|HN| = ${r.HN.length})`}</T>
          {top.node}
          <T x={240} y={top.bottom + 32} size={14} weight={700} color={C.mu}>{`H/(H∩N)  (|H| = ${H.length}, |H∩N| = ${r.meet.length})`}</T>
          {bot.node}
        </Pic>
      </PicCard>
    )
    steps = [
      { text: t('N normal, H subgrup sembarang.', 'N is normal, H is any subgroup.'), tex: `N = ${setTex(g, N)} \\lhd G,\\quad H = ${setTex(g, H)}` },
      { text: t('Bentuk HN = {hn}. Karena N normal, HN subgrup.', 'Form HN = {hn}. Because N is normal, HN is a subgroup.'), tex: `|HN| = \\frac{|H|\\,|N|}{|H\\cap N|} = \\frac{${H.length}\\cdot${N.length}}{${r.meet.length}} = ${r.HN.length}`, tone: r.HNisSubgroup ? 'good' : 'bad' },
      { text: t('Irisan H∩N normal di H.', 'The intersection H∩N is normal in H.'), tex: `H\\cap N = ${setTex(g, r.meet)}` },
      { text: t('Peta φ: H → HN/N, φ(h) = hN. Homomorfisma, dan pada karena hnN = hN.', 'Map φ: H → HN/N, φ(h) = hN. It is a homomorphism, and onto because hnN = hN.'), tex: `\\varphi(h)=hN,\\quad |HN/N| = ${r.top.length}` },
      { text: t('ker φ = {h ∈ H : hN = N} = H∩N.', 'ker φ = {h ∈ H : hN = N} = H∩N.'), tex: `\\ker\\varphi = H\\cap N` },
      { text: t('Teorema pertama memberi kesimpulannya; hitungan cocok.', 'The first theorem gives the conclusion; the counts agree.'), tex: `HN/N \\cong H/(H\\cap N):\\quad ${r.top.length} = ${H.length}/${r.meet.length}`, tone: r.wellDefined && r.bijective ? 'good' : 'bad' },
    ]
    theory = t('Teorema kedua: jika H ≤ G dan N ◁ G, maka HN ≤ G, H∩N ◁ H, dan HN/N ≅ H/(H∩N). Yang perlu diingat untuk ujian: bangun φ(h) = hN, tunjukkan pada, hitung kernelnya, lalu pakai teorema pertama.', 'Second theorem: if H ≤ G and N ◁ G, then HN ≤ G, H∩N ◁ H, and HN/N ≅ H/(H∩N). For the exam: build φ(h) = hN, show it is onto, compute its kernel, then apply the first theorem.')
  } else if (thm === 'third') {
    const r = thirdIsoTheorem(g, N, K)
    const L = layoutBags(r.GN.map((c, i) => ({
      title: cosetName(g, c.rep, 'left', 'N'), color: pal(i, r.GN.length), ring: i === r.home,
      items: r.GK.flatMap((d, j) => (r.map[j] === i ? [cosetName(g, d.rep, 'left', 'K')] : [])),
    })), 480, 40)
    picture = (
      <PicCard eyebrow={t('Gambar', 'Picture')} title={t('Setiap kantong satu unsur G/N; pil di dalamnya unsur G/K yang runtuh ke sana.', 'Each bag is one element of G/N; the pills inside are the elements of G/K that collapse onto it.')}
        caption={t(`Kantong bergaris tebal adalah N: isinya tepat N/K (${r.NK.length} koset K) = kernel peta gK ↦ gN. ${r.GK.length} pil ÷ ${r.NK.length} per kantong = ${r.GN.length} kantong.`, `The thick bag is N: it holds exactly N/K (${r.NK.length} cosets of K) = the kernel of gK ↦ gN. ${r.GK.length} pills ÷ ${r.NK.length} per bag = ${r.GN.length} bags.`)}>
        <Pic h={L.bottom + 16} label={t('Teorema homomorfisma ketiga', 'Third homomorphism theorem')}>
          <T x={240} y={26} size={14} weight={700} color={C.mu}>{`G/K → G/N   (|K| = ${K.length}, |N| = ${N.length})`}</T>
          {L.node}
        </Pic>
      </PicCard>
    )
    steps = [
      { text: t('K ⊆ N, keduanya normal di G.', 'K ⊆ N, both normal in G.'), tex: `K = ${setTex(g, K)} \\subseteq N = ${setTex(g, N)}` },
      { text: t('Peta ψ: G/K → G/N, ψ(gK) = gN. Terdefinisi baik: jika gK = g′K maka g⁻¹g′ ∈ K ⊆ N, jadi gN = g′N.', 'Map ψ: G/K → G/N, ψ(gK) = gN. Well defined: if gK = g′K then g⁻¹g′ ∈ K ⊆ N, so gN = g′N.'), tex: `\\psi(gK) = gN`, tone: r.wellDefined ? 'good' : 'bad' },
      { text: t('ψ homomorfisma dan pada.', 'ψ is a homomorphism and onto.'), tex: `|G/K| = ${r.GK.length},\\quad |G/N| = ${r.GN.length}`, tone: r.onto ? 'good' : 'bad' },
      { text: t('ker ψ = {nK : n ∈ N} = N/K.', 'ker ψ = {nK : n ∈ N} = N/K.'), tex: `\\ker\\psi = N/K,\\quad |N/K| = ${r.NK.length}`, tone: r.kernelIsNK ? 'good' : 'bad' },
      { text: t('Teorema pertama pada ψ memberi kesimpulannya.', 'The first theorem applied to ψ gives the result.'), tex: `(G/K)/(N/K) \\cong G/N:\\quad ${r.GK.length}/${r.NK.length} = ${r.GN.length}`, tone: 'good' },
    ]
    theory = t('Teorema ketiga: jika K ⊆ N dengan K, N ◁ G, maka N/K ◁ G/K dan (G/K)/(N/K) ≅ G/N. "Pecahan disederhanakan": K saling menghapus. Kuncinya membuktikan ψ terdefinisi baik, karena itu memakai K ⊆ N.', 'Third theorem: if K ⊆ N with K, N ◁ G, then N/K ◁ G/K and (G/K)/(N/K) ≅ G/N. The fraction "cancels" K. The key step is that ψ is well defined, which uses K ⊆ N.')
  } else {
    const r = correspondenceTheorem(g, N)
    picture = (
      <PicCard eyebrow={t('Tabel', 'Table')} title={t('Subgrup H ⊇ N di G  ↔  subgrup H/N di G/N', 'Subgroups H ⊇ N in G  ↔  subgroups H/N in G/N')}
        caption={t(`${r.rows.length} subgrup G memuat N, dan G/N (orde ${r.Q.order}) punya tepat ${r.quotientSubgroups} subgrup. Subgrup yang tidak memuat N tidak muncul di kiri.`, `${r.rows.length} subgroups of G contain N, and G/N (order ${r.Q.order}) has exactly ${r.quotientSubgroups} subgroups. Subgroups not containing N do not appear on the left.`)}>
        <div className="max-h-[420px] min-w-0 overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-2">H ≤ G</th><th className="p-2">|H|</th><th className="p-2">H/N ≤ G/N</th><th className="p-2">|H/N|</th><th className="p-2">{t('normal?', 'normal?')}</th></tr></thead>
            <tbody>{r.rows.map((row, i) => (
              <tr key={i} className="border-t border-border" style={{ color: pal(i, r.rows.length) }}>
                <td className="p-2 font-mono">{short(g, row.H, 3)}</td><td className="p-2">{row.H.length}</td>
                <td className="p-2 font-mono">{`{${row.image.slice(0, 3).map((c) => cosetName(g, c.rep, 'left', 'N')).join(', ')}${row.image.length > 3 ? ', …' : ''}}`}</td><td className="p-2">{row.image.length}</td>
                <td className={cn('p-2', row.normal ? 'text-emerald-300' : 'text-slate-400')}>{row.normal ? '◁ ↔ ◁' : t('tidak ↔ tidak', 'no ↔ no')}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </PicCard>
    )
    steps = [
      { text: t('Ambil proyeksi π: G → G/N, π(g) = gN. Homomorfisma pada dengan kernel N.', 'Take the projection π: G → G/N, π(g) = gN. An onto homomorphism with kernel N.'), tex: `N = ${setTex(g, N)},\\quad |G/N| = ${r.Q.order}` },
      { text: t('Ke kanan: H ⊇ N dikirim ke π(H) = H/N.', 'Rightwards: H ⊇ N goes to π(H) = H/N.'), tex: `H \\mapsto H/N = \\{hN : h\\in H\\}` },
      { text: t('Ke kiri: subgrup H̄ dari G/N dikirim ke π⁻¹(H̄), yang selalu memuat N.', 'Leftwards: a subgroup H̄ of G/N goes to π⁻¹(H̄), which always contains N.'), tex: `\\bar H \\mapsto \\pi^{-1}(\\bar H) \\supseteq N` },
      { text: t('Kedua arah saling invers, jadi bijeksi. Hitungan di tabel cocok.', 'The two directions are inverse to each other, so this is a bijection. The table counts agree.'), tex: `\\#\\{H : N\\subseteq H\\le G\\} = ${r.rows.length} = \\#\\{\\text{subgroups of } G/N\\} = ${r.quotientSubgroups}`, tone: r.rows.length === r.quotientSubgroups ? 'good' : 'bad' },
      { text: t('Normalitas dan indeks ikut terbawa.', 'Normality and index are preserved.'), tex: `H\\lhd G \\iff H/N \\lhd G/N,\\quad [G:H] = [G/N:H/N]`, tone: r.rows.every((x) => x.normal === x.normalInQ) ? 'good' : 'bad' },
    ]
    theory = t('Teorema korespondensi: untuk N ◁ G, H ↦ H/N adalah bijeksi dari subgrup G yang memuat N ke subgrup G/N, menjaga inklusi, indeks dan normalitas. Jadi untuk mencari subgrup G/N, cukup cari subgrup G yang memuat N.', 'Correspondence theorem: for N ◁ G, H ↦ H/N is a bijection from the subgroups of G containing N to the subgroups of G/N, preserving inclusion, index and normality. So to find the subgroups of G/N, find the subgroups of G that contain N.')
  }

  return (
    <LabLayout picture={picture} controls={controls} theory={
      <div className="grid gap-4 lg:grid-cols-3">
        <MathCard title={t('Langkah demi langkah (bukti)', 'Step by step (proof)')} icon={<ListOrdered size={16} />} className="lg:col-span-2"><Steps steps={steps} /></MathCard>
        <MathCard title={t('Teori (Herstein 2.7)', 'Theory (Herstein 2.7)')} icon={<BookOpen size={16} />}>
          <p className="text-xs leading-relaxed text-slate-400">{theory}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{t('Lab memeriksa grup hingga ini secara lengkap; ujian tetap meminta bukti umum seperti langkah di samping.', 'The lab checks this finite group exhaustively; an exam still asks for the general proof, as in the steps.')}</p>
        </MathCard>
      </div>
    } />
  )
}
