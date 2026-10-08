import { useState } from 'react'
import { useLang, useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { COURSE_TOPICS, SYLLABUS_ACTIVITIES, summaryHref, topicFromHash } from '../../content/syllabus-activities'
import type { VisualKind } from '../../content/summary-lessons'
import { SubTabs } from '../navigation/TabNav'
import { GroupLab } from './GroupLab'
import { HomTheoremsLab } from './HomTheoremsLab'
import { PermutationLab } from './PermutationLab'
import { RingLab } from './RingLab'
import { PolynomialLab } from './PolynomialLab'
import { IsoLab } from './IsoLab'
import { AlgebraSyllabusLab } from './AlgebraSyllabusLab'

const SUBS = ['sets', 'groups', 'thm', 'perm', 'rings', 'poly', 'iso'] as const
type Sub = typeof SUBS[number]
const isSub = (s: string | null): s is Sub => SUBS.includes(s as Sub)
const MAIN: Partial<Record<Sub, () => React.JSX.Element>> = { groups: GroupLab, thm: HomTheoremsLab, perm: PermutationLab, rings: RingLab, poly: PolynomialLab, iso: IsoLab }
/** Topics without a dedicated lab sit in the tab of their chapter. */
const CHAPTER_TAB: Sub[] = ['sets', 'groups', 'perm', 'rings']
const tabOf = (kind: VisualKind, p: number): Sub => { const lab = SYLLABUS_ACTIVITIES.algebra[kind]?.lab; return lab && lab !== 'syllabus' && isSub(lab) ? lab : CHAPTER_TAB[p] }

type Bi = { id: string; en: string }
const ABOUT: Record<Sub, [Bi, Bi]> = {
  sets: [{ id: 'Himpunan', en: 'Sets' }, { id: 'Ketik himpunan kecil dan lihat anggota, subset, himpunan kuasa, irisan/gabungan, dan hukum De Morgan dihitung langsung.', en: 'Type small sets and see members, subsets, power sets, unions/intersections and De Morgan\'s laws computed for you.' }],
  groups: [{ id: 'Grup, subgrup, koset', en: 'Groups, subgroups, cosets' }, { id: 'Pilih grup (Zₙ, S₃, D₄, …) untuk melihat tabel operasinya. Pilih subgrup H: kosetnya diwarnai, hitungan Lagrange ditulis, dan jika H normal tampil grup faktor G/H.', en: 'Pick a group (Zₙ, S₃, D₄, …) to see its operation table. Pick a subgroup H: its cosets are coloured, the Lagrange count is written out, and if H is normal the factor group G/H appears.' }],
  thm: [{ id: 'Teorema homomorfisme', en: 'Homomorphism theorems' }, { id: 'Pilih teorema (I, korespondensi, II, III) dan grupnya; kedua sisi isomorfisma dihitung dan digambar supaya terlihat mengapa ukurannya sama.', en: 'Pick a theorem (I, correspondence, II, III) and a group; both sides of the isomorphism are computed and drawn so you can see why they match.' }],
  perm: [{ id: 'Permutasi Sₙ', en: 'Permutations Sₙ' }, { id: 'Ketik permutasi seperti (1 2 3)(4 5). Kamu dapat siklus, orde, invers, paritas (genap/ganjil), dan komposisi στ langkah demi langkah.', en: 'Type a permutation like (1 2 3)(4 5). You get its cycles, order, inverse, parity (even/odd) and the composition στ step by step.' }],
  rings: [{ id: 'Gelanggang & ideal', en: 'Rings & ideals' }, { id: 'Pilih n untuk Zₙ: tabel tambah/kali, unit (punya invers), pembagi nol, ideal dan gelanggang kuosiennya, termasuk kapan ideal maksimal.', en: 'Pick n for Zₙ: addition/multiplication tables, units (with inverses), zero divisors, ideals and their quotient rings, including when an ideal is maximal.' }],
  poly: [{ id: 'Polinom', en: 'Polynomials' }, { id: 'Ketik polinom atas Zₚ atau Q: pembagian panjang, FPB dan Bézout, akar, dan uji tak tereduksi (akar rasional, Eisenstein, reduksi mod p).', en: 'Type polynomials over Zₚ or Q: long division, gcd and Bézout, roots, and irreducibility tests (rational roots, Eisenstein, reduction mod p).' }],
  iso: [{ id: 'Isomorfisma', en: 'Isomorphism' }, { id: 'Bandingkan dua grup atau gelanggang: invarian (orde, abelian, siklik, pusat) menunjukkan mengapa mereka sama atau berbeda, dan peta isomorfismanya jika ada.', en: 'Compare two groups or rings: invariants (order, abelian, cyclic, centre) show why they are or are not the same, and the isomorphism itself when one exists.' }],
}

export function AlgebraModule() {
  const t = useT(), { lang } = useLang()
  const [sub, setSub] = useState<Sub>(() => {
    const q = new URLSearchParams(location.hash.split('?')[1] ?? ''), lab = q.get('lab'), topic = COURSE_TOPICS.algebra.find((x) => x.kind === topicFromHash())
    return isSub(lab) ? lab : topic ? tabOf(topic.kind, topic.p) : 'sets'
  })
  const [tool, setTool] = useState<string>(() => { const k = topicFromHash(); return k && SYLLABUS_ACTIVITIES.algebra[k as VisualKind]?.lab === 'syllabus' ? k : 'main' })
  const covered = COURSE_TOPICS.algebra.filter((x) => tabOf(x.kind, x.p) === sub)
  const extras = covered.filter((x) => SYLLABUS_ACTIVITIES.algebra[x.kind]?.lab === 'syllabus')
  const Main = MAIN[sub]
  const active = Main ? (extras.some((x) => x.kind === tool) ? tool : 'main') : (extras.some((x) => x.kind === tool) ? tool : extras[0]?.kind)
  const [title, about] = ABOUT[sub]
  return (
    <div className="space-y-4">
      <SubTabs active={sub} onChange={(s) => { setSub(s); setTool('main') }} tabs={SUBS.map((id) => ({ id, label: t(ABOUT[id][0].id, ABOUT[id][0].en) }))} />
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-slate-100">{lang === 'id' ? title.id : title.en}</h2>
        <p className="mt-1 max-w-[80ch] text-sm leading-relaxed text-slate-300">{lang === 'id' ? about.id : about.en}</p>
        {covered.length > 0 && <p className="mt-3 text-xs leading-relaxed text-slate-400">{t('Topik kuliah yang dicakup: ', 'Course topics covered: ')}
          {covered.map((x, i) => <span key={x.kind}>{i > 0 && ' · '}<a href={summaryHref('algebra', x.kind)} className="text-slate-300 underline decoration-dotted hover:text-accent">{x.p + 1}.{x.e + 1} {x.entry.title[lang]}</a></span>)}</p>}
        {(Main ? extras.length > 0 : extras.length > 1) && <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {Main && <button onClick={() => setTool('main')} aria-pressed={active === 'main'} className={cn('rounded-full border px-3 py-1.5', active === 'main' ? 'border-accent bg-accent text-accent-ink' : 'border-border text-slate-300 hover:border-accent')}>{t('Alat utama', 'Main tool')}</button>}
          {extras.map((x) => <button key={x.kind} onClick={() => setTool(x.kind)} aria-pressed={active === x.kind} className={cn('rounded-full border px-3 py-1.5', active === x.kind ? 'border-accent bg-accent text-accent-ink' : 'border-border text-slate-300 hover:border-accent')}>{SYLLABUS_ACTIVITIES.algebra[x.kind]!.tool[lang]}</button>)}
        </div>}
      </section>
      <div key={`${sub}-${active}`} className="min-w-0">
        {active === 'main' && Main ? <Main /> : active ? <AlgebraSyllabusLab kind={active as VisualKind} /> : null}
      </div>
    </div>
  )
}
