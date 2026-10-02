import { useMemo, useState, type ReactNode } from 'react'
import { ListOrdered, Scale } from 'lucide-react'
import { elementOrder, groupInvariants, isomorphism, parseGroup, range, type Group } from '../../lib/group-theory'
import { parseRing, ringInvariants, ringIsomorphism, type FRing } from '../../lib/finite-ring'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip, TextField } from '../ui/MathCard'
import { Tex } from '../ui/FormulaBlock'
import { C, T } from '../stories/kit'
import { CayleyPic, LabLayout, Pic, PicCard, Steps, TablePic } from './pics'
import { compact, labelTex, pal, textW } from './pic-utils'

type Step = { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }
type Row = { name: ReactNode; a: string; b: string }

const GROUP_PAIRS: [string, string][] = [
  ['Z6', 'Z2xZ3'], ['Z4', 'Z2xZ2'], ['U8', 'Z2xZ2'], ['U10', 'Z4'], ['S3', 'Z6'], ['S3', 'D3'], ['D4', 'Q8'], ['A4', 'D6'],
  ['(1 2 3 4), (1 3)', 'D4'], ['Z2xZ4', 'Z8'], ['U15', 'Z2xZ4'],
]
const RING_PAIRS: [string, string][] = [
  ['Z6', 'Z2xZ3'], ['Z4', 'Z2xZ2'], ['Z2[x]/(x^2+x+1)', 'Z2xZ2'], ['Z2[x]/(x^2+x)', 'Z2xZ2'], ['Z2[x]/(x^2)', 'Z4'],
  ['Z3[x]/(x^2+1)', 'Z3[x]/(x^2+x+2)'], ['Z12', 'Z2xZ6'], ['Z10', 'Z2xZ5'],
]
const pretty = (s: string) => s.replace(/x(?=Z)/g, '×').replace(/\^2/g, '²').replace(/\^3/g, '³')
const profileText = (p: [number, number][]) => p.map(([o, c]) => `${c}×${o}`).join(', ')

/** Invariants side by side; the first row that differs is red, the matching ones green. */
function InvariantTable({ rows, names }: { rows: Row[]; names: [string, string] }) {
  const t = useT()
  const first = rows.findIndex((r) => r.a !== r.b)
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[300px] border-separate border-spacing-y-1 text-[13px]">
        <thead>
          <tr className="text-left text-[11px] text-slate-500">
            <th className="font-normal">{t('invarian', 'invariant')}</th>
            <th className="px-2 font-mono font-normal">{names[0]}</th>
            <th className="px-2 font-mono font-normal">{names[1]}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const same = r.a === r.b
            return (
              <tr key={i} className={cn(i === first && 'font-semibold')}>
                <td className="pr-2 text-slate-300">{r.name}</td>
                <td className={cn('px-2 font-mono', same ? 'text-slate-200' : 'text-rose-300')}>{r.a}</td>
                <td className={cn('px-2 font-mono', same ? 'text-slate-200' : 'text-rose-300')}>{r.b}</td>
                <td className={cn('text-right', same ? 'text-emerald-300' : 'text-rose-300')}>{same ? '✓' : '✗'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** The map element by element: one small card per element, x on top, φ(x) below, same colour. */
function MapPicture({ from, to, map, gens, label }: { from: string[]; to: string[]; map: number[]; gens: number[]; label: string }) {
  const t = useT()
  const n = from.length
  const w = Math.max(34, ...from.map((s) => textW(s, 13) + 16), ...to.map((s) => textW(s, 13) + 16))
  const cols = Math.max(1, Math.floor(456 / (w + 8))), rows = Math.ceil(n / cols), ch = 92
  const h = 34 + rows * ch + 6
  return (
    <Pic h={h} label={label}>
      <T x={16} y={24} anchor="start" size={13} color={C.mu}>{t('atas: x, bawah: φ(x); bingkai tebal = pembangkit', 'top: x, bottom: φ(x); thick frame = generator')}</T>
      {from.map((s, i) => {
        const col = i % cols, row = Math.floor(i / cols)
        const cx = 12 + (480 - 24 - cols * (w + 8) + 8) / 2 + col * (w + 8) + w / 2, y = 38 + row * ch
        const color = pal(i, n), g = gens.includes(i)
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={y} width={w} height={26} rx={13} fill={color} fillOpacity=".18" stroke={color} strokeWidth={g ? 3.5 : 2} />
            <T x={cx} y={y + 18} size={13} weight={600} halo={false}>{s}</T>
            <path d={`M${cx},${y + 30} V${y + 50}`} stroke={color} strokeWidth="2" />
            <path d={`M${cx - 5},${y + 44} L${cx},${y + 51} L${cx + 5},${y + 44}`} fill="none" stroke={color} strokeWidth="2" />
            <rect x={cx - w / 2} y={y + 54} width={w} height={26} rx={13} fill={color} fillOpacity=".18" stroke={color} strokeWidth={g ? 3.5 : 2} />
            <T x={cx} y={y + 72} size={13} weight={600} halo={false}>{to[map[i]]}</T>
          </g>
        )
      })}
    </Pic>
  )
}

/** Element-order profile: one row per order, a dot per element of G (violet) and of H (green). */
function ProfilePicture({ g, h }: { g: Group; h: Group }) {
  const t = useT()
  const pg = new Map(groupInvariants(g).profile), ph = new Map(groupInvariants(h).profile)
  const orders = [...new Set([...pg.keys(), ...ph.keys()])].sort((a, b) => a - b)
  const H = 54 + orders.length * 30 + 10
  const dots = (k: number, x0: number, y: number, color: string) => {
    const shown = Math.min(k, 12)
    return (
      <g>
        {range(shown).map((i) => <circle key={i} cx={x0 + i * 12} cy={y - 5} r={4.5} fill={color} />)}
        <T x={x0 + shown * 12 + 6} y={y} anchor="start" size={13} weight={600} color={color}>{k}</T>
      </g>
    )
  }
  return (
    <Pic h={H} label={t('Profil orde unsur', 'Element-order profile')}>
      <T x={150} y={30} anchor="start" size={14} weight={700} color={C.a}>{compact(g.name)}</T>
      <T x={318} y={30} anchor="start" size={14} weight={700} color={C.g}>{compact(h.name)}</T>
      {orders.map((o, i) => {
        const y = 60 + i * 30, a = pg.get(o) ?? 0, b = ph.get(o) ?? 0
        return (
          <g key={o}>
            {a !== b && <rect x={10} y={y - 20} width={460} height={28} rx={8} fill={C.r} fillOpacity=".1" stroke={C.r} />}
            <T x={20} y={y} anchor="start" size={14} color={a !== b ? C.r : C.mu} weight={a !== b ? 700 : 500}>{t('orde', 'order')} {o}</T>
            {dots(a, 150, y, C.a)}
            {dots(b, 318, y, C.g)}
          </g>
        )
      })}
    </Pic>
  )
}

function GroupIso() {
  const t = useT()
  const [aText, setA] = useState('D4')
  const [bText, setB] = useState('Q8')
  const parse = (s: string) => { try { return { g: parseGroup(s) } } catch { return { g: null } } }
  const A = useMemo(() => parse(aText).g, [aText])
  const B = useMemo(() => parse(bText).g, [bText])
  const res = useMemo(() => (A && B ? isomorphism(A, B) : null), [A, B])
  const ia = A && groupInvariants(A), ib = B && groupInvariants(B)
  const yes = (v: boolean) => (v ? t('ya', 'yes') : t('tidak', 'no'))
  const rows: Row[] = ia && ib ? [
    { name: t('orde |G|', 'order |G|'), a: String(ia.order), b: String(ib.order) },
    { name: t('abelian', 'abelian'), a: yes(ia.abelian), b: yes(ib.abelian) },
    { name: t('siklik', 'cyclic'), a: yes(ia.cyclic), b: yes(ib.cyclic) },
    { name: t('ukuran pusat |Z(G)|', 'centre size |Z(G)|'), a: String(ia.center), b: String(ib.center) },
    { name: t('profil orde (banyak×orde)', 'order profile (count×order)'), a: profileText(ia.profile), b: profileText(ib.profile) },
  ] : []
  const reasonText: Record<string, string> = {
    order: t('Ordenya berbeda, jadi tidak ada bijeksi sama sekali.', 'The orders differ, so there is not even a bijection.'),
    abelian: t('Yang satu abelian, yang lain tidak. Isomorfisma mengawetkan ab = ba, jadi mustahil.', 'One is abelian and the other is not. An isomorphism preserves ab = ba, so this is impossible.'),
    cyclic: t('Yang satu siklik, yang lain tidak: pembangkit harus dikirim ke pembangkit, dan yang kedua tidak punya unsur berorde |G|.', 'One is cyclic and the other is not: a generator must go to a generator, and the second has no element of order |G|.'),
    center: t('Ukuran pusat berbeda. Isomorfisma memetakan pusat ke pusat, jadi ukurannya harus sama.', 'The centres have different sizes. An isomorphism maps centre onto centre, so the sizes must match.'),
    profile: t('Banyaknya unsur untuk suatu orde berbeda. Isomorfisma mengawetkan orde setiap unsur.', 'The number of elements of some order differs. An isomorphism preserves the order of every element.'),
    search: t('Semua invarian sama, tetapi tidak ada pilihan bayangan pembangkit yang menjadi isomorfisma.', 'All invariants agree, but no choice of generator images gives an isomorphism.'),
  }

  const steps = (): Step[] => {
    if (!A || !B || !res || !ia || !ib) return []
    const out: Step[] = []
    const keys = ['order', 'abelian', 'cyclic', 'center', 'profile'] as const
    const texs = [`|G| = ${ia.order},\\ |H| = ${ib.order}`, '', '', `|Z(G)| = ${ia.center},\\ |Z(H)| = ${ib.center}`, '']
    const say = [t('Bandingkan orde.', 'Compare the orders.'), t('Bandingkan keabelan (cek ab = ba di tabel).', 'Compare commutativity (check ab = ba in the table).'), t('Apakah ada unsur berorde |G| (siklik)?', 'Is there an element of order |G| (cyclic)?'), t('Bandingkan pusat Z(G) = {z : zx = xz untuk semua x}.', 'Compare the centres Z(G) = {z : zx = xz for all x}.'), t('Hitung banyak unsur tiap orde.', 'Count the elements of each order.')]
    for (let i = 0; i < keys.length; i++) {
      const differ = res.reason === keys[i]
      out.push({ text: <>{say[i]} {differ ? reasonText[keys[i]] : t('Sama.', 'Same.')}</>, tex: texs[i] || `${rows[i].a.replace(/×/g, '\\times ')}\\ \\text{vs}\\ ${rows[i].b.replace(/×/g, '\\times ')}`, tone: differ ? 'bad' : undefined })
      if (differ) return [...out, { text: t('Kesimpulan: tidak isomorfik.', 'Conclusion: not isomorphic.'), tex: `${A.tex} \\not\\cong ${B.tex}`, tone: 'bad' }]
    }
    const gens = res.gens
    out.push({
      text: t(`Semua invarian sama, jadi cari φ. G dibangun oleh ${gens.map((x) => compact(A.labels[x])).join(' dan ')}; φ harus mengirim setiap pembangkit ke unsur H dengan orde yang sama.`, `All invariants agree, so look for φ. G is generated by ${gens.map((x) => compact(A.labels[x])).join(' and ')}; φ must send each generator to an element of H of the same order.`),
      tex: gens.map((x) => `o(${labelTex(A.labels[x])}) = ${elementOrder(A, x)}`).join(',\\ '),
    })
    if (res.isomorphic && res.map) {
      out.push({ text: t(`Setelah ${res.tried} percobaan, pilihan ini meluas secara konsisten ke seluruh G (φ(xy) = φ(x)φ(y) dicek untuk semua pasangan) dan satu-satu.`, `After ${res.tried} tries, this choice extends consistently to all of G (φ(xy) = φ(x)φ(y) checked for every pair) and is one-to-one.`), tex: gens.map((x) => `\\varphi(${labelTex(A.labels[x])}) = ${labelTex(B.labels[res.map![x]])}`).join(',\\quad '), tone: 'good' })
      out.push({ text: t('Kesimpulan: isomorfik.', 'Conclusion: isomorphic.'), tex: `${A.tex} \\cong ${B.tex}`, tone: 'good' })
    } else out.push({ text: t(`Tidak satu pun dari ${res.tried} pilihan bayangan pembangkit menghasilkan homomorfisma bijektif.`, `None of the ${res.tried} choices of generator images gives a bijective homomorphism.`), tex: `${A.tex} \\not\\cong ${B.tex}`, tone: 'bad' })
    return out
  }

  const inv = res?.map ? (() => { const r: number[] = []; res.map!.forEach((y, x) => { r[y] = x }); return r })() : null
  const small = !!A && A.order <= 24
  return (
    <LabLayout
      picture={
        !A || !B || !res ? <PicCard title={t('Masukan tidak terbaca', 'Input not recognised')}><p className="text-sm text-slate-400">{t('Contoh: Z6, U8, S3, A4, D4, Q8, Z2xZ3, (1 2 3), (1 2)', 'Examples: Z6, U8, S3, A4, D4, Q8, Z2xZ3, (1 2 3), (1 2)')}</p></PicCard> : (
          <>
            {res.isomorphic && res.map && inv ? (
              <>
                {small && (
                  <PicCard eyebrow={t('Isomorfisma eksplisit', 'An explicit isomorphism')} title={t('φ dari unsur ke unsur', 'φ element by element')}
                    caption={t('Setiap warna dipakai untuk x dan φ(x). Pembangkit menentukan semuanya: φ(ab) = φ(a)φ(b).', 'Each colour is used for x and φ(x). The generators fix everything: φ(ab) = φ(a)φ(b).')}>
                    <MapPicture from={A.labels.map(compact)} to={B.labels.map(compact)} map={res.map} gens={res.gens} label={t('Peta isomorfisma', 'The isomorphism map')} />
                  </PicCard>
                )}
                {small && (
                  <PicCard eyebrow={t('Dua tabel Cayley', 'Two Cayley tables')} title={t('Warna yang sama, pola yang sama', 'Same colours, same pattern')}
                    caption={t('Baris dan kolom H disusun sebagai φ(x) dan diwarnai seperti x. Kedua tabel bermotif sama: hanya nama unsurnya yang berganti.', 'H’s rows and columns are listed as φ(x) and coloured like x. The two tables have the same pattern: only the names change.')}>
                    <div className="grid min-w-0 gap-3 xl:grid-cols-2">
                      <CayleyPic g={A} tone={(x) => pal(x, A.order)} label={`${A.name}`} title={compact(A.name)} />
                      <CayleyPic g={B} order={res.map} tone={(y) => pal(inv[y], A.order)} label={`${B.name}`} title={compact(B.name)} />
                    </div>
                  </PicCard>
                )}
                {!small && <PicCard title={t('Isomorfik', 'Isomorphic')}><p className="text-sm text-slate-400">{t('Grup terlalu besar untuk digambar unsur demi unsur; lihat bayangan pembangkit di langkah-langkah.', 'The groups are too large to draw element by element; see the generator images in the steps.')}</p></PicCard>}
              </>
            ) : (
              <PicCard eyebrow={t('Mengapa tidak isomorfik', 'Why not isomorphic')} title={t('Profil orde unsur', 'Element-order profile')}
                caption={t('Satu titik per unsur, dikelompokkan menurut ordenya. Baris merah: banyaknya berbeda, padahal isomorfisma mengawetkan orde.', 'One dot per element, grouped by order. Red rows: the counts differ, yet an isomorphism preserves orders.')}>
                <ProfilePicture g={A} h={B} />
              </PicCard>
            )}
          </>
        )
      }
      controls={
        <div className="space-y-4">
          <MathCard title={t('Dua grup', 'Two groups')} icon={<Scale size={16} />}>
            {([['G', aText, setA, A], ['H', bText, setB, B]] as const).map(([name, text, set, val]) => (
              <label key={name} className="mb-2 block">
                <span className="text-[11px] text-slate-400">{name}</span>
                <TextField value={text} onChange={set} invalid={!val} placeholder="Z6, D4, Q8, Z2xZ3, (1 2 3), (1 2)" />
              </label>
            ))}
            <p className="text-[11px] text-slate-500">{t('Ketik Zn, Un, Sn, An, Dn, Q8, hasil kali seperti Z2xZ3, atau pembangkit permutasi seperti (1 2 3 4), (1 3).', 'Type Zn, Un, Sn, An, Dn, Q8, products like Z2xZ3, or permutation generators like (1 2 3 4), (1 3).')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {GROUP_PAIRS.map(([a, b], i) => <Chip key={i} active={a === aText && b === bText} onClick={() => { setA(a); setB(b) }} className="px-2 py-0.5 text-[11px]">{pretty(a)} / {pretty(b)}</Chip>)}
            </div>
          </MathCard>
          {A && B && res && (
            <MathCard title={t('Keputusan', 'Verdict')}>
              <p className={cn('text-lg font-semibold', res.isomorphic ? 'text-emerald-300' : 'text-rose-300')}><Tex tex={`${A.tex} ${res.isomorphic ? '\\cong' : '\\not\\cong'} ${B.tex}`} /></p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{res.isomorphic ? t('Isomorfik: ada bijeksi yang mengawetkan operasi (lihat gambar).', 'Isomorphic: there is a bijection preserving the operation (see the picture).') : reasonText[res.reason!]}</p>
              <div className="mt-3"><InvariantTable rows={rows} names={['G', 'H']} /></div>
            </MathCard>
          )}
        </div>
      }
      theory={
        <MathCard title={t('Langkah demi langkah: menentukan G ≅ H', 'Step by step: deciding G ≅ H')} icon={<ListOrdered size={16} />}>
          <Steps steps={steps()} />
          <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{t('Urutan kerja: invarian murah dulu (orde, abelian, siklik, pusat, profil orde). Satu perbedaan cukup untuk "tidak isomorfik". Jika semuanya sama, tunjukkan peta eksplisit: tentukan bayangan pembangkit, perluas, lalu cek bijektif dan homomorfisma.', 'Order of work: cheap invariants first (order, abelian, cyclic, centre, order profile). One difference is enough for "not isomorphic". If they all agree, exhibit a map: choose generator images, extend, then check it is bijective and a homomorphism.')}</p>
        </MathCard>
      }
    />
  )
}

function RingIso() {
  const t = useT()
  const [aText, setA] = useState('Z6')
  const [bText, setB] = useState('Z2xZ3')
  const parse = (s: string) => { try { return parseRing(s) } catch { return null } }
  const R = useMemo(() => parse(aText), [aText])
  const S = useMemo(() => parse(bText), [bText])
  const res = useMemo(() => (R && S ? ringIsomorphism(R, S) : null), [R, S])
  const ia = R && ringInvariants(R), ib = S && ringInvariants(S)
  const yes = (v: boolean) => (v ? t('ya', 'yes') : t('tidak', 'no'))
  const rows: Row[] = ia && ib ? [
    { name: t('banyak unsur', 'number of elements'), a: String(ia.order), b: String(ib.order) },
    { name: t('karakteristik', 'characteristic'), a: String(ia.char), b: String(ib.char) },
    { name: t('banyak unit', 'number of units'), a: String(ia.units.length), b: String(ib.units.length) },
    { name: t('lapangan', 'field'), a: yes(ia.field), b: yes(ib.field) },
    { name: t('pembagi nol', 'zero divisors'), a: String(ia.zeroDivisors.length), b: String(ib.zeroDivisors.length) },
    { name: t('nilpoten', 'nilpotents'), a: String(ia.nilpotents.length), b: String(ib.nilpotents.length) },
    { name: t('idempoten', 'idempotents'), a: String(ia.idempotents.length), b: String(ib.idempotents.length) },
  ] : []
  const reasonText: Record<string, string> = {
    order: t('Banyak unsurnya berbeda.', 'They have different numbers of elements.'),
    char: t('Karakteristiknya berbeda: isomorfisma mengirim 1 ke 1, jadi 1 + 1 + … + 1 = 0 harus terjadi pada langkah yang sama.', 'The characteristics differ: an isomorphism sends 1 to 1, so 1 + 1 + … + 1 = 0 must happen after the same number of steps.'),
    units: t('Banyak unit berbeda: isomorfisma mengirim unit ke unit.', 'The numbers of units differ: an isomorphism sends units to units.'),
    field: t('Yang satu lapangan, yang lain tidak.', 'One is a field and the other is not.'),
    zeroDivisors: t('Banyak pembagi nol berbeda: ab = 0 dengan a, b ≠ 0 diawetkan.', 'The numbers of zero divisors differ: ab = 0 with a, b ≠ 0 is preserved.'),
    nilpotents: t('Banyak unsur nilpoten (aᵏ = 0) berbeda.', 'The numbers of nilpotent elements (aᵏ = 0) differ.'),
    idempotents: t('Banyak idempoten (a² = a) berbeda.', 'The numbers of idempotents (a² = a) differ.'),
    search: t('Semua invarian sama, tetapi tidak ada pilihan bayangan pembangkit yang menjadi isomorfisma.', 'All invariants agree, but no choice of generator images gives an isomorphism.'),
  }
  const keys = ['order', 'char', 'units', 'field', 'zeroDivisors', 'nilpotents', 'idempotents'] as const

  const steps = (): Step[] => {
    if (!R || !S || !res || !ia || !ib) return []
    const out: Step[] = []
    for (let i = 0; i < keys.length; i++) {
      const differ = res.reason === keys[i]
      out.push({ text: <>{t('Bandingkan', 'Compare')} {rows[i].name}: {rows[i].a} {t('dan', 'and')} {rows[i].b}. {differ ? reasonText[keys[i]] : ''}</>, tone: differ ? 'bad' : undefined })
      if (differ) return [...out, { text: t('Kesimpulan: tidak isomorfik.', 'Conclusion: not isomorphic.'), tex: `${R.tex} \\not\\cong ${S.tex}`, tone: 'bad' }]
    }
    if (res.isomorphic && res.map) {
      out.push(res.gens.length === 0
        ? { text: t(`Semua invarian sama. Setiap unsur R adalah k · 1, dan φ(1) = 1 wajib, jadi φ(k · 1) = k · 1 sudah menentukan semuanya.`, `All invariants agree. Every element of R is k · 1, and φ(1) = 1 is forced, so φ(k · 1) = k · 1 determines everything.`), tex: range(R.labels.length).map((k) => `${k}\\cdot 1 \\mapsto ${labelTex(S.labels[res.map![nTimes(R, k)]])}`).slice(0, 8).join(',\\ ') + (R.labels.length > 8 ? ',\\ \\dots' : '') }
        : { text: t(`Semua invarian sama. R dibangun oleh 1 dan ${res.gens.map((x) => R.labels[x]).join(', ')}; φ(1) = 1 wajib, lalu pilih bayangan pembangkit dengan sifat yang sama.`, `All invariants agree. R is generated by 1 and ${res.gens.map((x) => R.labels[x]).join(', ')}; φ(1) = 1 is forced, then choose images of the generators with the same properties.`), tex: res.gens.map((x) => `\\varphi(${labelTex(R.labels[x])}) = ${labelTex(S.labels[res.map![x]])}`).join(',\\quad ') })
      out.push({ text: t('Cek φ(a + b) = φ(a) + φ(b) dan φ(ab) = φ(a)φ(b) untuk semua pasangan, dan φ bijektif.', 'Check φ(a + b) = φ(a) + φ(b) and φ(ab) = φ(a)φ(b) for every pair, and that φ is bijective.'), tone: 'good' })
      out.push({ text: t('Kesimpulan: isomorfik.', 'Conclusion: isomorphic.'), tex: `${R.tex} \\cong ${S.tex}`, tone: 'good' })
    } else out.push({ text: t(`Tidak satu pun dari ${res.tried} pilihan menghasilkan isomorfisma.`, `None of the ${res.tried} choices gives an isomorphism.`), tex: `${R.tex} \\not\\cong ${S.tex}`, tone: 'bad' })
    return out
  }

  const tone = (X: FRing) => (r: number, c: number, order: number[]) => {
    const v = X.mul[order[r]][order[c]]
    return v === X.zero && order[r] !== X.zero && order[c] !== X.zero ? C.r : v === X.one ? C.g : undefined
  }
  const small = !!R && R.labels.length <= 16
  const natural = R ? range(R.labels.length) : []
  return (
    <LabLayout
      picture={
        !R || !S || !res ? <PicCard title={t('Masukan tidak terbaca', 'Input not recognised')}><p className="text-sm text-slate-400">{t('Contoh: Z6, Z2xZ3, Z2[x]/(x^2+x+1), F3[x]/(x^2+1)', 'Examples: Z6, Z2xZ3, Z2[x]/(x^2+x+1), F3[x]/(x^2+1)')}</p></PicCard> : (
          <>
            {res.isomorphic && res.map && small && (
              <PicCard eyebrow={t('Isomorfisma eksplisit', 'An explicit isomorphism')} title={t('φ dari unsur ke unsur', 'φ element by element')}
                caption={t('φ(1) = 1 dan φ mengawetkan + dan ×. Warna yang sama untuk a dan φ(a).', 'φ(1) = 1 and φ preserves + and ×. The same colour for a and φ(a).')}>
                <MapPicture from={R.labels} to={S.labels} map={res.map} gens={res.gens} label={t('Peta isomorfisma gelanggang', 'The ring isomorphism')} />
              </PicCard>
            )}
            {small && (
              <PicCard eyebrow={t('Tabel perkalian', 'Multiplication tables')} title={res.isomorphic ? t('Setelah diganti nama, tabelnya sama', 'After renaming, the tables are the same') : t('Merah = pembagi nol, hijau = hasil 1', 'Red = zero divisors, green = product 1')}
                caption={res.isomorphic ? t('Baris S disusun sebagai φ(a): sel merah dan hijau jatuh di tempat yang sama.', 'S’s rows are listed as φ(a): the red and green cells land in the same places.') : t('Bandingkan pola merah dan hijau: banyaknya unit dan pembagi nol harus sama jika isomorfik.', 'Compare the red and green patterns: the numbers of units and zero divisors would have to match if they were isomorphic.')}>
                <div className="grid min-w-0 gap-3 xl:grid-cols-2">
                  <TablePic heads={R.labels} text={(r, c) => R.labels[R.mul[r][c]]} tone={(r, c) => tone(R)(r, c, natural)} sym="×" title={pretty(aText)} label={pretty(aText)} maxCell={60} />
                  {(() => { const o = res.isomorphic && res.map ? res.map : range(S.labels.length); return <TablePic heads={o.map((x) => S.labels[x])} text={(r, c) => S.labels[S.mul[o[r]][o[c]]]} tone={(r, c) => tone(S)(r, c, o)} sym="×" title={pretty(bText)} label={pretty(bText)} maxCell={60} /> })()}
                </div>
              </PicCard>
            )}
            {!small && <PicCard title={res.isomorphic ? t('Isomorfik', 'Isomorphic') : t('Tidak isomorfik', 'Not isomorphic')}><p className="text-sm text-slate-400">{t('Gelanggang terlalu besar untuk tabel; lihat invarian dan langkah-langkah.', 'The rings are too large for tables; see the invariants and the steps.')}</p></PicCard>}
          </>
        )
      }
      controls={
        <div className="space-y-4">
          <MathCard title={t('Dua gelanggang', 'Two rings')} icon={<Scale size={16} />}>
            {([['R', aText, setA, R], ['S', bText, setB, S]] as const).map(([name, text, set, val]) => (
              <label key={name} className="mb-2 block">
                <span className="text-[11px] text-slate-400">{name}</span>
                <TextField value={text} onChange={set} invalid={!val} placeholder="Z6, Z2xZ3, Z2[x]/(x^2+x+1)" />
              </label>
            ))}
            <p className="text-[11px] text-slate-500">{t('Ketik Zn, hasil kali seperti Z2xZ3, atau Zp[x]/(f) dengan p prima (paling banyak 64 unsur).', 'Type Zn, products like Z2xZ3, or Zp[x]/(f) with p prime (at most 64 elements).')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RING_PAIRS.map(([a, b], i) => <Chip key={i} active={a === aText && b === bText} onClick={() => { setA(a); setB(b) }} className="px-2 py-0.5 text-[11px]">{pretty(a)} / {pretty(b)}</Chip>)}
            </div>
          </MathCard>
          {R && S && res && (
            <MathCard title={t('Keputusan', 'Verdict')}>
              <p className={cn('text-lg font-semibold', res.isomorphic ? 'text-emerald-300' : 'text-rose-300')}><Tex tex={`${R.tex} ${res.isomorphic ? '\\cong' : '\\not\\cong'} ${S.tex}`} /></p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{res.isomorphic ? t('Isomorfik sebagai gelanggang: ada bijeksi yang mengawetkan + dan ×.', 'Isomorphic as rings: there is a bijection preserving + and ×.') : reasonText[res.reason!]}</p>
              {ia?.field && ib?.field && res.isomorphic && <p className="mt-1 text-[12px] text-emerald-300">{t(`Keduanya lapangan dengan ${ia.order} unsur.`, `Both are fields with ${ia.order} elements.`)}</p>}
              <div className="mt-3"><InvariantTable rows={rows} names={['R', 'S']} /></div>
            </MathCard>
          )}
        </div>
      }
      theory={
        <MathCard title={t('Langkah demi langkah: menentukan R ≅ S', 'Step by step: deciding R ≅ S')} icon={<ListOrdered size={16} />}>
          <Steps steps={steps()} />
          <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{t('Isomorfisma gelanggang dengan satuan mengirim 1 ke 1, unit ke unit, pembagi nol ke pembagi nol, dan mengawetkan karakteristik. Contoh: ℤ6 ≅ ℤ2 × ℤ3 (Teorema Sisa Cina), tetapi ℤ4 ≇ ℤ2 × ℤ2 karena karakteristiknya 4 dan 2.', 'A ring isomorphism of rings with 1 sends 1 to 1, units to units, zero divisors to zero divisors, and keeps the characteristic. Example: ℤ6 ≅ ℤ2 × ℤ3 (Chinese Remainder Theorem), but ℤ4 ≇ ℤ2 × ℤ2 because their characteristics are 4 and 2.')}</p>
        </MathCard>
      }
    />
  )
}

/** Index of k·1 in R. */
function nTimes(r: FRing, k: number) { let x = r.zero; for (let i = 0; i < k; i++) x = r.add[x][r.one]; return x }

export function IsoLab() {
  const t = useT()
  const [mode, setMode] = useState<'group' | 'ring'>('group')
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <Chip active={mode === 'group'} onClick={() => setMode('group')}>{t('Grup', 'Groups')}</Chip>
        <Chip active={mode === 'ring'} onClick={() => setMode('ring')}>{t('Gelanggang', 'Rings')}</Chip>
      </div>
      {mode === 'group' ? <GroupIso /> : <RingIso />}
    </div>
  )
}

