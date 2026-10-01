import { At, Arrow, C, T, b, f, pl, tr, type P, type Story } from '../kit'

// ---------------------------------------------------------------- local helpers (style copied from algebra.tsx)
const rad = (d: number) => d * Math.PI / 180
/** n points on a circle, 0 at the top, going clockwise like a clock face. */
const clock = (c: P, r: number, n: number) => (k: number): P => { const a = rad(-90 + 360 * k / n); return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)] }
const Node = ({ at, label, fill, stroke = fill, r = 15, size = 14, ink }: { at: P; label: string | number; fill: string; stroke?: string; r?: number; size?: number; ink?: string }) =>
  <g style={{ transition: 'all .45s' }}><circle cx={at[0]} cy={at[1]} r={r} fill={fill} stroke={stroke} strokeWidth="2" /><T halo={false} x={at[0]} y={at[1] + size / 3} size={size} weight={600} color={ink ?? (fill === C.bg ? C.fg : C.bg)}>{label}</T></g>
const gcd = (a: number, m: number): number => m ? gcd(m, a % m) : a
const three = [C.a, C.r, C.g], six = [C.a, C.r, C.g, C.y, C.v, C.mu]
const sup = (n: number) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('')
const set = (xs: (string | number)[]) => `{${xs.join(', ')}}`
const pw = (a: number, e: number, n: number) => { let r = 1; for (let i = 0; i < e; i++) r = (r * a) % n; return r }

/** Curved arrow between two node rims; a back-and-forth pair bends apart instead of overlapping. */
const Bent = ({ p, q, color, bend = 12, r1 = 17, r2 = 19, width = 2.5 }: { p: P; q: P; color: string; bend?: number; r1?: number; r2?: number; width?: number }) => {
  const d = Math.hypot(q[0] - p[0], q[1] - p[1]), u = [(q[0] - p[0]) / d, (q[1] - p[1]) / d]
  const s: P = [p[0] + u[0] * r1, p[1] + u[1] * r1], e: P = [q[0] - u[0] * r2, q[1] - u[1] * r2]
  const c: P = [(s[0] + e[0]) / 2 - u[1] * bend, (s[1] + e[1]) / 2 + u[0] * bend]
  const a = Math.atan2(e[1] - c[1], e[0] - c[0]), h = 10
  return <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all .45s' }}>
    <path d={`M${s[0]},${s[1]} Q${c[0]},${c[1]} ${e[0]},${e[1]}`} />
    <path d={`M${e[0] - h * Math.cos(a - .45)},${e[1] - h * Math.sin(a - .45)} L${e[0]},${e[1]} L${e[0] - h * Math.cos(a + .45)},${e[1] - h * Math.sin(a + .45)}`} />
  </g>
}
/** Rounded label for a group element such as (123). */
const Pill = ({ at, label, color = C.ln, fill, w = 56, size = 14 }: { at: P; label: string; color?: string; fill?: boolean; w?: number; size?: number }) =>
  <g><rect x={at[0] - w / 2} y={at[1] - 14} width={w} height={28} rx={14} fill={fill ? color : C.bg} fillOpacity={fill ? .28 : 1} stroke={color} strokeWidth="2" style={{ transition: 'all .45s' }} /><T halo={false} x={at[0]} y={at[1] + 5} size={size} weight={600}>{label}</T></g>
type Row = string | [string, string?, number?, number?]
/** Left-aligned text panel: each row is text or [text, color, size, weight]. */
const Lines = ({ x, y, gap = 24, rows }: { x: number; y: number; gap?: number; rows: Row[] }) => <>{rows.map((r, i) => {
  const [s, c = C.fg, z = 14, w = 500] = typeof r === 'string' ? [r] as [string] : r
  return s ? <T key={i} x={x} y={y + i * gap} anchor="start" size={z} weight={w} color={c}>{s}</T> : null
})}</>
/** Operation table of Zn with optional cell highlights. */
const Table = ({ n, x0, y0, cell, op, sym, hl }: { n: number; x0: number; y0: number; cell: number; op: (r: number, c: number) => number; sym: string; hl: (r: number, c: number) => string | undefined }) => {
  const z = cell * .4
  return <g>
    <T x={x0 + cell / 2} y={y0 + cell * .66} size={z} weight={700} color={C.v}>{sym}</T>
    {Array.from({ length: n }, (_, i) => <g key={i}>
      <T x={x0 + (i + 1.5) * cell} y={y0 + cell * .66} size={z} weight={700} color={C.mu}>{i}</T>
      <T x={x0 + cell / 2} y={y0 + (i + 1.66) * cell} size={z} weight={700} color={C.mu}>{i}</T>
    </g>)}
    {Array.from({ length: n * n }, (_, i) => { const r = Math.floor(i / n), c = i % n, h = hl(r, c); return <g key={i}>
      <rect x={x0 + (c + 1) * cell} y={y0 + (r + 1) * cell} width={cell} height={cell} fill={h ?? 'transparent'} fillOpacity=".3" stroke={C.faint} style={{ transition: 'fill .45s' }} />
      <T x={x0 + (c + 1.5) * cell} y={y0 + (r + 1.66) * cell} size={z} weight={h ? 700 : 400}>{op(r, c)}</T>
    </g> })}
  </g>
}

// S3 with right-to-left composition: mul(a, c) means "c first, then a".
const S3: Record<string, number[]> = { e: [1, 2, 3], '(12)': [2, 1, 3], '(13)': [3, 2, 1], '(23)': [1, 3, 2], '(123)': [2, 3, 1], '(132)': [3, 1, 2] }
const E3 = Object.keys(S3)
const mul = (a: string, c: string) => { const r = S3[c].map(x => S3[a][x - 1]).join(); return E3.find(k => S3[k].join() === r)! }
const inv = (a: string) => E3.find(k => mul(a, k) === 'e')!
const conj = (g: string, x: string) => mul(mul(inv(g), x), g)
const ord = (a: string) => { let k = 1, p = a; while (p !== 'e') { p = mul(p, a); k++ } return k }
const sortS3 = (xs: string[]) => E3.filter(x => xs.includes(x))
const A3 = ['e', '(123)', '(132)'], H12 = ['e', '(12)']

// ---------------------------------------------------------------- group:0  four axioms in the Z4 table
const z4 = (r: number, c: number) => (r + c) % 4
const axioms: Story = {
  title: b('Empat aksioma grup, dicek di tabel ℤ₄', 'The four group axioms, checked in the ℤ₄ table'),
  frames: [
    f('Tabel penjumlahan ℤ₄ (sisa bagi 4). Pemeriksaan pertama, tertutup: ke-16 hasilnya selalu salah satu dari 0, 1, 2, 3. Misalnya 3 + 2 = 5, yang menjadi 1.', 'The addition table of ℤ₄ (remainders mod 4). First check, closure: all 16 results are one of 0, 1, 2, 3. For example 3 + 2 = 5, which becomes 1.', String.raw`a+b\bmod4\in\{0,1,2,3\}`),
    f('Pemeriksaan kedua, identitas: baris 0 dan kolom 0 hanya menyalin judulnya, karena 0 + a = a + 0 = a. Jadi 0 adalah identitas.', 'Second check, identity: row 0 and column 0 just copy the headers, because 0 + a = a + 0 = a. So 0 is the identity.', String.raw`0+a=a+0=a`),
    f('Pemeriksaan ketiga, asosiatif: (1 + 2) + 3 dan 1 + (2 + 3) sama-sama 2. Sifat ini tidak terlihat dari pola tabel; ℤ₄ mewarisinya dari penjumlahan bilangan bulat.', 'Third check, associativity: (1 + 2) + 3 and 1 + (2 + 3) both give 2. This is not visible in the table pattern; ℤ₄ inherits it from integer addition.', String.raw`(1+2)+3=1+(2+3)=2`),
    f('Pemeriksaan keempat, invers: geser a. Di baris a, angka 0 muncul tepat sekali, yaitu di kolom −a (sisa bagi 4). Jadi setiap anggota punya invers.', 'Fourth check, inverses: move a. In row a, the number 0 appears exactly once, in column −a (mod 4). So every element has an inverse.', String.raw`a+(-a)\equiv0\pmod4`),
  ],
  control: { label: b('Anggota a', 'Element a'), min: 0, max: 3, step: 1, initial: 1 },
  controlFrom: 3,
  readout: a => String.raw`${a}+${(4 - a) % 4}=${a + (4 - a) % 4}\equiv0\pmod4`,
  draw: (k, a, lang) => {
    const t = tr(lang), x = 262
    const hl = (r: number, c: number) => k === 0 ? (r === 3 && c === 2 ? C.v : undefined)
      : k === 1 ? (r === 0 || c === 0 ? C.g : undefined)
      : k === 2 ? ((r === 1 && c === 2) || (r === 3 && c === 3) ? C.v : (r === 2 && c === 3) || (r === 1 && c === 1) ? C.y : undefined)
      : r === a ? (z4(r, c) === 0 ? C.g : C.a) : undefined
    return <>
      <T x={124} y={36} size={14} color={C.mu}>{t('penjumlahan di ℤ₄', 'addition in ℤ₄')}</T>
      <Table n={4} x0={24} y0={48} cell={40} op={z4} sym="+" hl={hl} />
      <At until={0} frame={k}>
        <rect x={64} y={88} width={160} height={160} fill="none" stroke={C.a} strokeWidth="3" rx={4} />
        <Lines x={x} y={90} gap={28} rows={[['ℤ₄ = {0, 1, 2, 3}', C.fg, 16, 700], ['3 + 2 = 5 ≡ 1', C.v, 15, 600], [t('16 hasil, semua di ℤ₄', '16 results, all in ℤ₄'), C.mu, 14], [t('tertutup ✓', 'closure ✓'), C.g, 15, 700]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <Lines x={x} y={90} gap={28} rows={[['0 + a = a + 0 = a', C.fg, 16, 700], [t('baris 0 = baris judul', 'row 0 = the header row'), C.mu, 14], [t('kolom 0 = kolom judul', 'column 0 = the header column'), C.mu, 14], [t('identitas: 0 ✓', 'identity: 0 ✓'), C.g, 15, 700]]} />
      </At>
      <At from={2} until={2} frame={k}>
        <Lines x={x} y={90} gap={28} rows={[['(1 + 2) + 3 = 3 + 3 = 2', C.v, 15, 600], ['1 + (2 + 3) = 1 + 1 = 2', C.y, 15, 600], [t('sama ✓', 'equal ✓'), C.g, 15, 700], [t('tidak terlihat dari tabel,', 'not visible in the table,'), C.mu, 13], [t('diwarisi dari + di ℤ', 'inherited from + on ℤ'), C.mu, 13]]} />
      </At>
      <At from={3} frame={k}>
        <Lines x={x} y={90} gap={28} rows={[[`a = ${a}`, C.a, 17, 700], [`−a = ${(4 - a) % 4}`, C.g, 16, 600], [`${a} + ${(4 - a) % 4} = ${a + (4 - a) % 4} ≡ 0`, C.fg, 15], [t('setiap baris memuat', 'every row contains'), C.mu, 13], [t('tepat satu 0: invers ✓', 'exactly one 0: inverses ✓'), C.g, 14, 600]]} />
      </At>
    </>
  },
}

// ---------------------------------------------------------------- group:1  cancellation and unique solutions
const cancellation: Story = {
  title: b('Pembatalan: setiap persamaan punya tepat satu solusi', 'Cancellation: every equation has exactly one solution'),
  frames: [
    f('Pada ℤ₄, persamaan a + x = 3 punya tepat satu solusi untuk setiap a. Di tabel: setiap baris memuat angka 3 tepat sekali.', 'In ℤ₄, the equation a + x = 3 has exactly one solution for every a. In the table: every row contains a 3 exactly once.', String.raw`a+x=3`),
    f('Mengapa: tambahkan invers −a di kiri kedua ruas. Untuk a = 2: x = (−2) + 3 = 2 + 3 ≡ 1. Dengan cara yang sama a + b = a + c memaksa b = c, jadi satu baris tidak pernah memuat angka yang sama dua kali.', 'Why: add the inverse −a on the left of both sides. For a = 2: x = (−2) + 3 = 2 + 3 ≡ 1. In the same way a + b = a + c forces b = c, so a row never contains the same number twice.', String.raw`a+x=b\Rightarrow x=(-a)+b`),
    f('Pembatalan butuh invers. Di ℤ₆ dengan perkalian, 2 · 1 = 2 · 4 = 2 padahal 1 ≠ 4: baris 2 berulang karena 2 tidak punya invers perkalian.', 'Cancellation needs inverses. In ℤ₆ under multiplication, 2 · 1 = 2 · 4 = 2 although 1 ≠ 4: row 2 repeats because 2 has no multiplicative inverse.', String.raw`2\cdot1\equiv2\cdot4\pmod6,\quad1\ne4`),
    f('Tanpa komutatif, urutan harus dijaga. Di S₃, a x = b diselesaikan oleh x = a⁻¹b = (23). Menulis b a⁻¹ memberi (13), dan itu salah.', 'Without commutativity, keep the order. In S₃, a x = b is solved by x = a⁻¹b = (23). Writing b a⁻¹ gives (13), which is wrong.', String.raw`ax=b\Rightarrow x=a^{-1}b\ne ba^{-1}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), x = 262, a = '(12)', bb = '(123)', good = mul(inv(a), bb), bad = mul(bb, inv(a))
    const hl = (r: number, c: number) => k === 0 ? (z4(r, c) === 3 ? C.g : undefined)
      : k === 1 ? (r === 2 ? (c === 1 ? C.g : C.a) : undefined)
      : r === 2 ? C.g : undefined
    return <>
      <At until={2} frame={k}>
        <T x={124} y={36} size={14} color={C.mu}>{t('penjumlahan di ℤ₄', 'addition in ℤ₄')}</T>
        <Table n={4} x0={24} y0={48} cell={40} op={z4} sym="+" hl={hl} />
      </At>
      <At until={0} frame={k}>
        <Lines x={x} y={72} gap={28} rows={[['a + x = 3', C.fg, 17, 700], ['a = 0 → x = 3', C.g, 15], ['a = 1 → x = 2', C.g, 15], ['a = 2 → x = 1', C.g, 15], ['a = 3 → x = 0', C.g, 15], [t('tepat satu 3 per baris', 'exactly one 3 per row'), C.mu, 13]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <Lines x={x} y={72} gap={28} rows={[['2 + x = 3', C.fg, 17, 700], [t('tambah −2 = 2 di kiri:', 'add −2 = 2 on the left:'), C.mu, 13], ['x = 2 + 3 = 5 ≡ 1', C.g, 16, 700], ['a + b = a + c ⇒ b = c', C.fg, 14], [t('baris tak pernah berulang', 'a row never repeats'), C.mu, 13]]} />
      </At>
      <At from={2} until={2} frame={k}>
        <T x={x} y={70} anchor="start" size={14} weight={700}>{t('× di ℤ₆, baris 2', '× in ℤ₆, row 2')}</T>
        {[0, 1, 2, 3, 4, 5].map(c => { const bad2 = c === 1 || c === 4; return <g key={c}>
          <T x={x + 16 + c * 32} y={100} size={13} weight={700} color={C.mu}>{c}</T>
          <rect x={x + c * 32} y={108} width={32} height={32} fill={bad2 ? C.r : 'transparent'} fillOpacity=".3" stroke={C.faint} />
          <T x={x + 16 + c * 32} y={130} size={15} weight={bad2 ? 700 : 400}>{(2 * c) % 6}</T>
        </g> })}
        <Lines x={x} y={172} gap={26} rows={[['2 · 1 = 2 · 4 = 2', C.r, 15, 600], [t('tetapi 1 ≠ 4:', 'but 1 ≠ 4:'), C.fg, 14], [t('2 tidak punya invers', '2 has no inverse'), C.r, 14, 600], [t('baris 2 di ℤ₄: tanpa ulang ✓', 'row 2 in ℤ₄: no repeats ✓'), C.g, 13]]} />
      </At>
      <At from={3} frame={k}>
        <T x={240} y={50} size={15} weight={600}>{t('Di S₃ (tidak komutatif): a x = b', 'In S₃ (not commutative): a x = b')}</T>
        <T x={240} y={80} size={15}>a = {a},   b = {bb}</T>
        <T x={240} y={128} size={16} weight={700} color={C.g}>x = a⁻¹b = {a}{bb} = {good}</T>
        <T x={240} y={156} size={15} color={C.g}>a x = {a}{good} = {mul(a, good)} ✓</T>
        <T x={240} y={204} size={16} weight={700} color={C.r}>x = b a⁻¹ = {bb}{a} = {bad}</T>
        <T x={240} y={232} size={15} color={C.r}>a x = {a}{bad} = {mul(a, bad)} ≠ {bb} ✗</T>
        <T x={240} y={272} size={13} color={C.mu}>{t('dibaca kanan ke kiri: faktor kanan bekerja dulu', 'read right to left: the right factor acts first')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- group:2  (ab)^-1 = b^-1 a^-1
const GX = (v: number) => 50 + (v - 1) * 60, GR = [42, 98, 154, 210, 266]
const apply = (pos: number[], perm: string) => pos.map(p => S3[perm][p - 1])
const st0 = [1, 2, 3], st1 = apply(st0, '(23)'), st2 = apply(st1, '(12)')
const good3 = apply(st2, '(12)'), good4 = apply(good3, '(23)'), bad3 = apply(st2, '(23)'), bad4 = apply(bad3, '(12)')
/** One row of positions 1..3; each position shows the token (with its color) that sits there. */
const TokRow = ({ pos, y }: { pos: number[]; y: number }) => <>{[1, 2, 3].map(v => { const tok = pos.indexOf(v) + 1; return <Node key={v} at={[GX(v), y]} label={tok} fill={three[tok - 1]} r={14} /> })}</>
const TokArrows = ({ a, z, r }: { a: number[]; z: number[]; r: number }) => <>{[0, 1, 2].map(i => <Arrow key={i} from={[GX(a[i]), GR[r] + 16]} to={[GX(z[i]), GR[r + 1] - 16]} color={three[i]} width={2.5} head={9} />)}</>
const SymBox = ({ x, y, s, color }: { x: number; y: number; s: string; color: string }) => <g><rect x={x - 24} y={y - 20} width={48} height={40} rx={8} fill={C.bg} stroke={color} strokeWidth="2" /><T x={x} y={y + 7} size={18} weight={600}>{s}</T></g>
const hump = (x1: number, x2: number, y: number, h: number) => `M${x1},${y} Q${(x1 + x2) / 2},${y - 2 * h} ${x2},${y}`
const reverseOrder: Story = {
  title: b('Invers hasil kali: batalkan yang terakhir lebih dulu', 'Inverse of a product: undo the last action first'),
  frames: [
    f('Lakukan τ = (23) lalu σ = (12). Ikuti warna: 1 berakhir di 2, 2 di 3, dan 3 di 1. Gabungannya στ = (123), dibaca kanan ke kiri.', 'Do τ = (23), then σ = (12). Follow the colors: 1 ends at 2, 2 at 3, and 3 at 1. The combination is στ = (123), read right to left.', String.raw`\sigma\tau=(1\,2\,3)`),
    f('Untuk kembali, batalkan tindakan terakhir lebih dulu: σ lagi, lalu τ (keduanya invers dirinya sendiri). Setiap warna pulang ke tempatnya.', 'To go back, undo the last action first: σ again, then τ (each is its own inverse). Every color returns home.', String.raw`(\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}=\tau\sigma`),
    f('Urutan salah, τ dulu lalu σ, tidak membatalkan apa pun: 1 berakhir di 3. Hasil totalnya (132), bukan identitas.', 'The wrong order, τ first then σ, undoes nothing: 1 ends at 3. The total result is (132), not the identity.', String.raw`\sigma^{-1}\tau^{-1}\,\sigma\tau=(1\,3\,2)\ne e`),
    f('Secara aljabar: pada σ τ τ⁻¹ σ⁻¹ pasangan dalam τ τ⁻¹ bersebelahan dan hilang dulu, lalu σ σ⁻¹. Pada σ τ σ⁻¹ τ⁻¹ pasangannya bersilang dan tidak bisa hilang, kecuali σ dan τ komut.', 'Algebraically: in σ τ τ⁻¹ σ⁻¹ the inner pair τ τ⁻¹ sits side by side and cancels first, then σ σ⁻¹. In σ τ σ⁻¹ τ⁻¹ the pairs cross and cannot cancel unless σ and τ commute.', String.raw`(ab)(b^{-1}a^{-1})=a(bb^{-1})a^{-1}=e`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), lab = (r: number, s: string, c = C.mu) => <T x={226} y={(GR[r] + GR[r + 1]) / 2 + 5} anchor="start" size={14} weight={600} color={c}>{s}</T>
    return <>
      <At until={2} frame={k}>
        <TokArrows a={st0} z={st1} r={0} /><TokArrows a={st1} z={st2} r={1} />
        <TokRow pos={st0} y={GR[0]} /><TokRow pos={st1} y={GR[1]} /><TokRow pos={st2} y={GR[2]} />
        {lab(0, 'τ = (23)')}{lab(1, 'σ = (12)')}
      </At>
      <At until={0} frame={k}>
        <Lines x={318} y={80} gap={30} rows={[[t('τ dulu, lalu σ', 'τ first, then σ'), C.mu, 14], ['1 ↦ 2, 2 ↦ 3, 3 ↦ 1', C.fg, 15], [`στ = ${mul('(12)', '(23)')}`, C.v, 18, 700]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <TokArrows a={st2} z={good3} r={2} /><TokArrows a={good3} z={good4} r={3} />
        <TokRow pos={good3} y={GR[3]} /><TokRow pos={good4} y={GR[4]} />
        {lab(2, 'σ⁻¹ = σ', C.g)}{lab(3, 'τ⁻¹ = τ', C.g)}
        <Lines x={318} y={80} gap={30} rows={[[t('batalkan: σ dulu,', 'undo: σ first,'), C.fg, 15], [t('lalu τ', 'then τ'), C.fg, 15], [t('semua pulang ✓', 'everyone is home ✓'), C.g, 16, 700], ['(στ)⁻¹ = τσ', C.v, 17, 700]]} />
      </At>
      <At from={2} until={2} frame={k}>
        <TokArrows a={st2} z={bad3} r={2} /><TokArrows a={bad3} z={bad4} r={3} />
        <TokRow pos={bad3} y={GR[3]} /><TokRow pos={bad4} y={GR[4]} />
        {lab(2, 'τ⁻¹ = τ', C.r)}{lab(3, 'σ⁻¹ = σ', C.r)}
        <Lines x={318} y={80} gap={30} rows={[[t('urutan salah:', 'wrong order:'), C.r, 15, 700], [t('τ dulu, lalu σ', 'τ first, then σ'), C.fg, 15], ['1 ↦ 3 ✗', C.r, 16, 700], [`${t('hasil', 'result')} ${mul(mul('(12)', '(23)'), mul('(12)', '(23)'))} ≠ e`, C.r, 15]]} />
      </At>
      <At from={3} frame={k}>
        <path d={hump(150, 210, 88, 14)} fill="none" stroke={C.g} strokeWidth="2.5" />
        <path d={hump(90, 270, 88, 30)} fill="none" stroke={C.g} strokeWidth="2.5" />
        {['σ', 'τ', 'τ⁻¹', 'σ⁻¹'].map((s, i) => <SymBox key={s} x={90 + i * 60} y={110} s={s} color={C.g} />)}
        <T x={310} y={117} anchor="start" size={20} weight={700} color={C.g}>= e ✓</T>
        <T x={180} y={156} size={14} color={C.mu}>σ(ττ⁻¹)σ⁻¹ = σσ⁻¹ = e</T>
        <path d={hump(90, 210, 202, 22)} fill="none" stroke={C.r} strokeWidth="2.5" />
        <path d={hump(150, 270, 202, 22)} fill="none" stroke={C.r} strokeWidth="2.5" />
        {['σ', 'τ', 'σ⁻¹', 'τ⁻¹'].map((s, i) => <SymBox key={s} x={90 + i * 60} y={224} s={s} color={C.r} />)}
        <T x={310} y={231} anchor="start" size={20} weight={700} color={C.r}>≠ e ✗</T>
        <T x={180} y={272} size={14} color={C.mu}>(στ)(στ) = {mul(mul('(12)', '(23)'), mul('(12)', '(23)'))}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cyclic:0  subgroup test and finiteness
const L6: P = [115, 125], R6: P = [355, 125], hL = clock(L6, 72, 6), hR = clock(R6, 72, 6)
const nlx = (n: number) => 45 + (n + 3) * 35
const subgroupTest: Story = {
  title: b('Uji subgrup, dan mengapa syarat hingga penting', 'The subgroup test, and why finiteness matters'),
  frames: [
    f('Dua subset ℤ₆: H = {0, 2, 4} dan S = {0, 1, 2}. Keduanya bukan kosong dan memuat 0. Mana yang subgrup?', 'Two subsets of ℤ₆: H = {0, 2, 4} and S = {0, 1, 2}. Both are nonempty and contain 0. Which one is a subgroup?', String.raw`H=\{0,2,4\},\quad S=\{0,1,2\}`),
    f('Uji ab⁻¹, dalam notasi tambah a − b: semua 9 selisih anggota H tetap di H, jadi H subgrup. S gagal: 1 + 2 = 3 berada di luar S.', 'The ab⁻¹ test, written additively as a − b: all 9 differences of members of H stay in H, so H is a subgroup. S fails: 1 + 2 = 3 lies outside S.', String.raw`a-b\in H\ (a,b\in H),\qquad 1+2=3\notin S`),
    f('Untuk subset hingga, tertutup terhadap + saja sudah cukup. Tambah 2 terus: 2, 4, 6 ≡ 0. Pangkat pasti berulang, sehingga 0 muncul, dan langkah sebelum kembali adalah invers: 2 + 4 = 0.', 'For a finite subset, closure under + alone is enough. Keep adding 2: 2, 4, 6 ≡ 0. Powers must repeat, so 0 shows up, and the step before returning is the inverse: 2 + 4 = 0.', String.raw`2+4\equiv0\Rightarrow -2=4\in H`),
    f('Syarat hingga penting. Bilangan bulat positif tertutup terhadap penjumlahan (1 + 2 = 3), tetapi tidak memuat 0 maupun −1. Jadi ℤ⁺ bukan subgrup ℤ.', 'Finiteness matters. The positive integers are closed under addition (1 + 2 = 3), but contain neither 0 nor −1. So ℤ⁺ is not a subgroup of ℤ.', String.raw`\mathbb Z^+ +\mathbb Z^+\subseteq\mathbb Z^+,\quad 0\notin\mathbb Z^+`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), H = [0, 2, 4], S = [0, 1, 2]
    return <>
      <At until={2} frame={k}>
        <At from={1} frame={k}><path d={pl(H.map(hL), true)} fill={C.soft} fillOpacity=".6" stroke={C.a} strokeWidth="2" /></At>
        <circle cx={L6[0]} cy={L6[1]} r={72} fill="none" stroke={C.faint} />
        <At from={2} frame={k}>{[0, 2, 4].map(n => <Bent key={n} p={hL(n)} q={hL((n + 2) % 6)} color={C.v} bend={-16} />)}</At>
        {Array.from({ length: 6 }, (_, n) => <Node key={n} at={hL(n)} label={n} r={16} fill={H.includes(n) ? C.a : C.bg} stroke={H.includes(n) ? C.a : C.ln} />)}
        <T x={L6[0]} y={28} size={15} weight={700} color={C.a}>H = {set(H)}</T>
      </At>
      <At until={1} frame={k}>
        <circle cx={R6[0]} cy={R6[1]} r={72} fill="none" stroke={C.faint} />
        <At from={1} frame={k}><Bent p={hR(1)} q={hR(3)} color={C.r} bend={-18} /></At>
        {Array.from({ length: 6 }, (_, n) => { const fill = S.includes(n) ? C.y : k >= 1 && n === 3 ? C.r : C.bg; return <Node key={n} at={hR(n)} label={n} r={16} fill={fill} stroke={fill === C.bg ? C.ln : fill} /> })}
        <T x={R6[0]} y={28} size={15} weight={700} color={C.y}>S = {set(S)}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={L6[0]} y={240} size={15}>2 − 4 = −2 ≡ 4 ∈ H</T>
        <T x={L6[0]} y={264} size={13} color={C.g} weight={600}>{t('semua 9 selisih tetap di H ✓', 'all 9 differences stay in H ✓')}</T>
        <T x={R6[0]} y={240} size={15} color={C.r} weight={600}>1 + 2 = 3 ∉ S ✗</T>
        <T x={R6[0]} y={264} size={13} color={C.r}>{t('bukan subgrup', 'not a subgroup')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Lines x={250} y={70} gap={28} rows={[[t('H hingga: cukup cek +', 'H finite: + is enough'), C.fg, 15, 700], ['2 → 4 → 6 ≡ 0', C.v, 16, 600], [t('pangkat kembali ke 0,', 'powers come back to 0,'), C.mu, 14], [t('jadi 0 ∈ H, dan', 'so 0 ∈ H, and'), C.mu, 14], ['2 + 4 = 0 ⇒ −2 = 4 ∈ H', C.g, 15, 600]]} />
      </At>
      <At from={3} frame={k}>
        <T x={240} y={70} size={17} weight={700} color={C.a}>ℤ⁺ = {'{1, 2, 3, …}'}</T>
        <path d="M25,150 H455" stroke={C.ln} strokeWidth="1.5" />
        <path d={`M${nlx(1)},136 Q${nlx(2)},100 ${nlx(3)},136`} fill="none" stroke={C.g} strokeWidth="2.5" />
        <T x={nlx(2)} y={108} size={14} weight={600} color={C.g}>+2</T>
        {Array.from({ length: 12 }, (_, i) => i - 3).map(n => <g key={n}>
          <circle cx={nlx(n)} cy={150} r={9} fill={n > 0 ? C.a : C.bg} stroke={n > 0 ? C.a : C.ln} strokeWidth="2" />
          {(n === 0 || n === -1) && <circle cx={nlx(n)} cy={150} r={15} fill="none" stroke={C.r} strokeWidth="2" strokeDasharray="4 3" />}
          <T x={nlx(n)} y={182} size={13} color={n > 0 ? C.fg : C.mu}>{String(n).replace('-', '−')}</T>
        </g>)}
        <T x={240} y={218} size={15} color={C.g} weight={600}>{t('1 + 2 = 3: tertutup ✓', '1 + 2 = 3: closed ✓')}</T>
        <T x={240} y={244} size={15} color={C.r} weight={600}>{t('tetapi 0 ∉ ℤ⁺ dan −1 ∉ ℤ⁺ ✗', 'but 0 ∉ ℤ⁺ and −1 ∉ ℤ⁺ ✗')}</T>
        <T x={240} y={270} size={13} color={C.mu}>{t('tak hingga: jalan pintas hingga tidak berlaku', 'infinite: the finite shortcut does not apply')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cyclic:1  element order and returning powers
const Z10: P = [110, 120], h10 = clock(Z10, 82, 10)
const elementOrder: Story = {
  title: b('Orde anggota: berapa langkah sampai pulang', 'Element order: how many steps until home'),
  frames: [
    f('Di ℤ₁₀ ambil a = 4 dan terus tambahkan 4: 0, 4, 8, 2, 6, lalu kembali ke 0. Butuh 5 langkah, jadi orde 4 adalah 5. Orde menghitung langkah, bukan nilai angkanya.', 'In ℤ₁₀ take a = 4 and keep adding 4: 0, 4, 8, 2, 6, then back to 0. It takes 5 steps, so the order of 4 is 5. Order counts steps, not the value of the number.', String.raw`o(4)=5`),
    f('Setelah pulang, siklus berulang: k · 4 ≡ 0 tepat ketika k = 0, 5, 10, 15, …, yaitu kelipatan orde. Ini aturan aᵏ = e ⟺ o(a) | k.', 'After returning, the cycle repeats: k · 4 ≡ 0 exactly when k = 0, 5, 10, 15, …, the multiples of the order. This is the rule aᵏ = e ⟺ o(a) | k.', String.raw`k\cdot4\equiv0\pmod{10}\iff5\mid k`),
    f('Geser a. Orde selalu 10 dibagi fpb(a, 10): a = 5 kembali setelah 2 langkah, a = 3 butuh semua 10 langkah.', 'Move a. The order is always 10 divided by gcd(a, 10): a = 5 returns after 2 steps, a = 3 needs all 10 steps.', String.raw`o(a)=\frac{10}{\gcd(a,10)}`),
  ],
  control: { label: b('Anggota a', 'Element a'), min: 1, max: 9, step: 1, initial: 4 },
  controlFrom: 2,
  readout: a => String.raw`o(${a})=10/\gcd(${a},10)=10/${gcd(a, 10)}=${10 / gcd(a, 10)}`,
  draw: (k, value, lang) => {
    const t = tr(lang), a = k === 2 ? value : 4, o = 10 / gcd(a, 10)
    const visits = Array.from({ length: o + 1 }, (_, j) => (j * a) % 10), inside = new Set(visits)
    const lines = Array.from({ length: Math.ceil(visits.length / 6) }, (_, i) => visits.slice(i * 6, i * 6 + 6).join(' → ') + (i * 6 + 6 < visits.length ? ' →' : ''))
    return <>
      <circle cx={Z10[0]} cy={Z10[1]} r={82} fill="none" stroke={C.faint} />
      {visits.slice(0, -1).map((v, j) => <Bent key={`${a}-${j}`} p={h10(v)} q={h10(visits[j + 1])} color={C.v} bend={o === 2 ? 14 : 6} r1={15} r2={17} width={2} />)}
      {Array.from({ length: 10 }, (_, n) => <Node key={n} at={h10(n)} label={n} r={14} size={13} fill={inside.has(n) ? C.a : C.bg} stroke={inside.has(n) ? C.a : C.ln} />)}
      <T x={225} y={44} anchor="start" size={18} weight={700} color={C.a}>a = {a}</T>
      {lines.map((s, i) => <T key={i} x={225} y={72 + i * 22} anchor="start" size={14}>{s}</T>)}
      <At until={0} frame={k}>
        <Lines x={225} y={124} gap={26} rows={[[t('5 langkah sampai pulang', '5 steps until home'), C.mu, 14], ['o(4) = 5', C.fg, 17, 700], [t('bukan 4: orde ≠ nilai', 'not 4: order ≠ value'), C.r, 14, 600]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <Lines x={225} y={124} gap={26} rows={[['k · 4 ≡ 0 (mod 10)', C.fg, 15], ['⟺ 10 | 4k ⟺ 5 | k', C.fg, 15], ['k = 0, 5, 10, 15, …', C.g, 15, 700], ['k · a = 0 ⟺ o(a) | k', C.v, 14, 600]]} />
      </At>
      <At from={2} frame={k}>
        <Lines x={225} y={130} gap={26} rows={[[t('o(a) = 10 / fpb(a, 10)', 'o(a) = 10 / gcd(a, 10)'), C.mu, 14], [`o(${a}) = 10 / ${gcd(a, 10)} = ${o}`, C.fg, 17, 700]]} />
      </At>
      {Array.from({ length: 16 }, (_, j) => { const zero = (j * a) % 10 === 0, on = k === 0 ? j === o : zero; return <g key={j}>
        <T x={37 + j * 27} y={245} size={11} color={C.mu}>{j}</T>
        <rect x={24 + j * 27} y={252} width={27} height={28} fill={on ? C.g : k === 0 && j < o ? C.a : 'transparent'} fillOpacity={on ? .35 : .12} stroke={C.faint} style={{ transition: 'fill .45s' }} />
        <T x={37 + j * 27} y={271} size={13} weight={zero ? 700 : 400}>{(j * a) % 10}</T>
      </g> })}
      <T x={14} y={245} anchor="start" size={11} color={C.mu}>k</T>
    </>
  },
}

// ---------------------------------------------------------------- cyclic:2  centralizers, center, conjugation
const gx = (j: number) => 68 + j * 36, gy = (i: number) => 50 + i * 36
const TRI: Record<string, P> = { '(12)': [150, 70], '(13)': [70, 210], '(23)': [230, 210] }
const centralizer: Story = {
  title: b('Centralizer dan pusat dari tabel komut S₃', 'Centralizers and the center from the S₃ commuting table'),
  frames: [
    f('Tabel komut S₃: baris a, kolom g, sel hijau jika ga = ag. Baris (12) hijau hanya di e dan (12), jadi C((12)) = {e, (12)}. Misalnya (12)(13) = (132) tetapi (13)(12) = (123).', 'The commuting table of S₃: row a, column g, green when ga = ag. Row (12) is green only at e and (12), so C((12)) = {e, (12)}. For example (12)(13) = (132) but (13)(12) = (123).', String.raw`C((1\,2))=\{e,(1\,2)\}`),
    f('Setiap baris adalah satu centralizer. Ukurannya 6, 2, 2, 2, 3, 3, dan masing-masing subgrup: jika x dan y komut dengan a, maka xy dan x⁻¹ juga.', 'Each row is one centralizer. Their sizes are 6, 2, 2, 2, 3, 3, and each is a subgroup: if x and y commute with a, so do xy and x⁻¹.', String.raw`x,y\in C(a)\Rightarrow xy,\ x^{-1}\in C(a)`),
    f('Pusat berisi anggota yang komut dengan semua anggota: kolom yang hijau penuh. Hanya kolom e. Jadi Z(S₃) = {e}, irisan semua centralizer.', 'The center holds the elements commuting with everything: the fully green columns. Only column e. So Z(S₃) = {e}, the intersection of all centralizers.', String.raw`Z(S_3)=\bigcap_a C(a)=\{e\}`),
    f('Konjugasi g⁻¹xg memindahkan (12) ke transposisi lain. Dengan g = (13), subgrup H = {e, (12)} menjadi {e, (23)}: konjugat subgrup tetap subgrup, tetapi tidak harus sama dengan H.', 'Conjugation g⁻¹xg moves (12) to another transposition. With g = (13), the subgroup H = {e, (12)} becomes {e, (23)}: a conjugate subgroup is still a subgroup, but need not equal H.', String.raw`(1\,3)^{-1}(1\,2)(1\,3)=(2\,3)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), x = 300
    const sizes = E3.map(a => E3.filter(g => mul(g, a) === mul(a, g)).length).join(', ')
    return <>
      <At until={2} frame={k}>
        {E3.map((g, j) => <T key={g} x={gx(j) + 18} y={42} size={11} weight={700} color={k === 2 && g === 'e' ? C.v : C.mu}>{g}</T>)}
        {E3.map((a, i) => <g key={a}>
          <T x={60} y={gy(i) + 23} anchor="end" size={12} weight={700} color={k === 0 && a === '(12)' ? C.a : C.mu}>{a}</T>
          {E3.map((g, j) => { const on = mul(g, a) === mul(a, g) && (k >= 1 || a === '(12)'); return <rect key={g} x={gx(j)} y={gy(i)} width={36} height={36} fill={on ? C.g : 'transparent'} fillOpacity=".4" stroke={C.faint} style={{ transition: 'fill .45s' }} /> })}
        </g>)}
        <At until={0} frame={k}><rect x={gx(0)} y={gy(1)} width={216} height={36} fill="none" stroke={C.a} strokeWidth="2.5" /></At>
        <At from={2} frame={k}><rect x={gx(0)} y={gy(0)} width={36} height={216} fill="none" stroke={C.v} strokeWidth="3" /></At>
      </At>
      <At until={0} frame={k}>
        <Lines x={x} y={70} gap={28} rows={[[t('hijau: ga = ag', 'green: ga = ag'), C.g, 14, 600], ['C((12)) = {e, (12)}', C.a, 15, 700], [`(12)(13) = ${mul('(12)', '(13)')}`, C.fg, 14], [`(13)(12) = ${mul('(13)', '(12)')}`, C.fg, 14], [t('tidak komut ✗', 'do not commute ✗'), C.r, 14, 600]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <Lines x={x} y={70} gap={28} rows={[[t('baris a = C(a)', 'row a = C(a)'), C.fg, 15, 700], [t('ukuran:', 'sizes:'), C.mu, 14], [sizes, C.fg, 15], [t('semua membagi 6;', 'all divide 6;'), C.mu, 14], [t('tiap C(a) subgrup ✓', 'each C(a) a subgroup ✓'), C.g, 14, 600]]} />
      </At>
      <At from={2} until={2} frame={k}>
        <Lines x={x} y={70} gap={28} rows={[[t('kolom penuh = komut', 'full column = commutes'), C.fg, 14], [t('dengan semua anggota', 'with every element'), C.fg, 14], ['Z(S₃) = ⋂ C(a)', C.v, 15, 600], ['= {e}', C.v, 20, 700]]} />
      </At>
      <At from={3} frame={k}>
        {([['(12)', '(13)', '(23)'], ['(12)', '(23)', '(13)'], ['(13)', '(23)', '(12)']] as const).map(([p, q, g]) => {
          const P1 = TRI[p], P2 = TRI[q], d = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]), u = [(P2[0] - P1[0]) / d, (P2[1] - P1[1]) / d]
          const s: P = [P1[0] + u[0] * 30, P1[1] + u[1] * 30], e: P = [P2[0] - u[0] * 30, P2[1] - u[1] * 30]
          const m: P = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2], dc = [m[0] - 150, m[1] - 163], dl = Math.hypot(dc[0], dc[1])
          return <g key={g}><Arrow from={s} to={e} color={C.mu} width={2} head={9} /><Arrow from={e} to={s} color={C.mu} width={2} head={9} />
            <T x={m[0] + dc[0] / dl * 24} y={m[1] + dc[1] / dl * 24 + 5} size={13} weight={600} color={C.v}>{g}</T></g>
        })}
        {Object.entries(TRI).map(([s, at]) => <Pill key={s} at={at} label={s} color={s === '(12)' ? C.a : s === '(23)' ? C.r : C.ln} fill={s !== '(13)'} />)}
        <T x={150} y={272} size={12} color={C.mu}>{t('ungu: g yang mengonjugasi', 'violet: the conjugating g')}</T>
        <Lines x={x} y={64} gap={28} rows={[[t('konjugasi g⁻¹xg', 'conjugation g⁻¹xg'), C.fg, 15, 700], [t('memindahkan (12)', 'moves (12)'), C.mu, 14], [t('ke transposisi lain', 'to another transposition'), C.mu, 14], ['H = {e, (12)}', C.a, 15, 600], [t('dengan g = (13):', 'with g = (13):'), C.mu, 14], [`g⁻¹Hg = ${set(sortS3(H12.map(h => conj('(13)', h))))} ≠ H`, C.r, 14, 600]]} />
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cosets:0  Lagrange in Z15
const cx15 = (j: number) => 40 + j * 60, cy15 = (i: number) => 80 + i * 58, five = [C.a, C.r, C.g, C.y, C.v]
const lagrange: Story = {
  title: b('Lagrange: koset memotong grup menjadi bagian sama besar', 'Lagrange: cosets cut a group into equal pieces'),
  frames: [
    f('Susun ℤ₁₅ dalam 5 kolom. Kolom pertama adalah H = {0, 5, 10}, subgrup karena 5 + 10 = 15 ≡ 0.', 'Arrange ℤ₁₅ in 5 columns. The first column is H = {0, 5, 10}, a subgroup because 5 + 10 = 15 ≡ 0.', String.raw`H=\{0,5,10\}\le\mathbb Z_{15}`),
    f('Geser H sejauh 1: h ↦ h + 1 mengirim 0, 5, 10 ke 1, 6, 11. Geseran ini satu-satu dan bisa dibalik, jadi koset 1 + H punya ukuran sama dengan H.', 'Shift H by 1: h ↦ h + 1 sends 0, 5, 10 to 1, 6, 11. The shift is one-to-one and can be undone, so the coset 1 + H has the same size as H.', String.raw`h\mapsto h+1:\ H\to1+H`),
    f('Lima geseran memberi lima kolom. Kolom berbeda tidak berbagi anggota, dan setiap anggota ℤ₁₅ ada di tepat satu kolom. Jadi 15 = 5 × 3.', 'Five shifts give five columns. Different columns share no element, and every element of ℤ₁₅ lies in exactly one column. So 15 = 5 × 3.', String.raw`|G|=[G:H]\,|H|=5\cdot3`),
    f('Teorema Lagrange: karena |G| = [G : H] · |H|, ukuran subgrup selalu membagi 15. Subgrup berukuran 4 di ℤ₁₅ mustahil.', 'Lagrange’s theorem: since |G| = [G : H] · |H|, a subgroup’s size always divides 15. A subgroup of size 4 in ℤ₁₅ is impossible.', String.raw`|H|\mid|G|,\quad 4\nmid15`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), x = 312, shown = k === 0 ? 1 : k === 1 ? 2 : 5
    return <>
      <At from={1} until={1} frame={k}>{[0, 1, 2].map(i => <Arrow key={i} from={[cx15(0) + 18, cy15(i)]} to={[cx15(1) - 18, cy15(i)]} color={C.r} width={2.5} head={9} />)}</At>
      {[0, 1, 2, 3, 4].map(j => <g key={j}>
        {[0, 1, 2].map(i => <Node key={i} at={[cx15(j), cy15(i)]} label={j + 5 * i} r={16} fill={j < shown ? five[j] : C.bg} stroke={j < shown ? five[j] : C.ln} />)}
        <At from={j === 0 ? 0 : j === 1 ? 1 : 2} frame={k}><T x={cx15(j)} y={244} size={14} weight={700} color={five[j]}>{j ? `${j}+H` : 'H'}</T></At>
      </g>)}
      <At until={0} frame={k}><Lines x={x} y={80} gap={30} rows={[['ℤ₁₅ = {0, 1, …, 14}', C.fg, 15, 600], ['H = {0, 5, 10}', C.a, 16, 700], ['5 + 10 = 15 ≡ 0', C.fg, 15], [t('H subgrup ✓', 'H is a subgroup ✓'), C.g, 15, 600]]} /></At>
      <At from={1} until={1} frame={k}><Lines x={x} y={80} gap={30} rows={[['h ↦ h + 1', C.r, 17, 700], ['0 ↦ 1, 5 ↦ 6, 10 ↦ 11', C.fg, 13], [t('satu-satu, jadi', 'one-to-one, so'), C.mu, 14], ['|1 + H| = |H| = 3', C.fg, 15, 700]]} /></At>
      <At from={2} until={2} frame={k}><Lines x={x} y={80} gap={28} rows={[[t('5 koset, tanpa', '5 cosets, no'), C.fg, 14], [t('tumpang tindih;', 'overlaps;'), C.fg, 14], [t('tiap anggota tepat', 'each element in'), C.mu, 14], [t('di satu kolom', 'exactly one column'), C.mu, 14], ['15 = 5 × 3', C.v, 20, 700]]} /></At>
      <At from={3} frame={k}><Lines x={x} y={80} gap={28} rows={[['|G| = [G : H] · |H|', C.fg, 15, 600], [t('maka |H| membagi 15', 'so |H| divides 15'), C.fg, 14], [t('ukuran mungkin:', 'possible sizes:'), C.mu, 14], ['1, 3, 5, 15', C.g, 16, 700], [t('ukuran 4? 4 ∤ 15 ✗', 'size 4? 4 ∤ 15 ✗'), C.r, 15, 600]]} /></At>
    </>
  },
}

// ---------------------------------------------------------------- cosets:1  when two cosets coincide (S3, right vs left)
const repOrder = ['e', '(12)', '(13)', '(132)', '(23)', '(123)']
const rightCos = (g: string) => [g, mul('(12)', g)], leftCos = (g: string) => [g, mul(g, '(12)')]
const cosetEquality: Story = {
  title: b('Dua koset yang berbagi satu anggota adalah koset yang sama', 'Two cosets sharing one element are the same coset'),
  frames: [
    f('Koset kanan Hg = {g, (12)g} dari H = {e, (12)} di S₃. Ada enam wakil, tetapi hanya tiga kotak: H(13) dan H(132) sama-sama {(13), (132)}. Dua koset yang berbagi satu anggota sama seluruhnya.', 'Right cosets Hg = {g, (12)g} of H = {e, (12)} in S₃. There are six representatives but only three boxes: H(13) and H(132) are both {(13), (132)}. Two cosets sharing one element are identical.', String.raw`H(1\,3)=H(1\,3\,2)=\{(1\,3),(1\,3\,2)\}`),
    f('Tes cepat tanpa mendaftar: Ha = Hb tepat ketika ab⁻¹ ∈ H. (13)(132)⁻¹ = (12) ∈ H, jadi kotaknya sama. (13)(23)⁻¹ = (132) ∉ H, jadi kotaknya berbeda.', 'A quick test without listing: Ha = Hb exactly when ab⁻¹ ∈ H. (13)(132)⁻¹ = (12) ∈ H, so the boxes agree. (13)(23)⁻¹ = (132) ∉ H, so the boxes differ.', String.raw`Ha=Hb\iff ab^{-1}\in H`),
    f('Hati-hati dengan konvensi. Koset kiri gH = {g, g(12)} membagi S₃ secara lain: (13) berpasangan dengan (123), bukan (132). Untuk koset kiri, tesnya a⁻¹b ∈ H.', 'Mind the convention. Left cosets gH = {g, g(12)} split S₃ differently: (13) pairs with (123), not (132). For left cosets the test is a⁻¹b ∈ H.', String.raw`aH=bH\iff a^{-1}b\in H`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), boxes = ['e', '(13)', '(23)'], hot = (s: string) => k === 1 && (s === '(13)' || s === '(132)') ? C.v : k === 1 && s === '(23)' ? C.r : C.ln
    return <>
      <At until={1} frame={k}>
        {repOrder.map((g, i) => { const bi = Math.floor(i / 2); return <g key={g}>
          <Arrow from={[78, 52 + i * 38]} to={[148, 70 + bi * 77]} color={three[bi]} width={2} head={8} />
          <Pill at={[48, 52 + i * 38]} label={g} w={54} color={hot(g)} fill={hot(g) !== C.ln} />
        </g> })}
        {boxes.map((g, bi) => <g key={g}>
          <T x={150} y={36 + bi * 77} anchor="start" size={12} weight={700} color={three[bi]}>{g === 'e' ? 'H' : `H${g}`}</T>
          <rect x={150} y={40 + bi * 77} width={150} height={60} rx={12} fill={three[bi]} fillOpacity=".1" stroke={three[bi]} strokeWidth="2.5" />
          {rightCos(g).map((s, j) => <Pill key={s} at={[190 + j * 70, 70 + bi * 77]} label={s} w={58} color={hot(s) === C.ln ? three[bi] : hot(s)} fill={hot(s) !== C.ln} />)}
        </g>)}
      </At>
      <At until={0} frame={k}>
        <Lines x={316} y={70} gap={28} rows={[['Hg = {g, (12)g}', C.fg, 15, 600], [t('6 wakil, 3 koset', '6 reps, 3 cosets'), C.mu, 14], [t('berbagi satu anggota', 'sharing one element'), C.fg, 14], [t('⇒ koset sama', '⇒ same coset'), C.g, 15, 700]]} />
      </At>
      <At from={1} until={1} frame={k}>
        <Lines x={316} y={60} gap={27} rows={[['(13)(132)⁻¹', C.v, 15, 600], [`= (13)${inv('(132)')} = ${mul('(13)', inv('(132)'))}`, C.fg, 14], [t('∈ H ✓ sama', '∈ H ✓ same'), C.g, 15, 700], ['', C.fg], [`(13)(23)⁻¹ = ${mul('(13)', inv('(23)'))}`, C.r, 14, 600], [t('∉ H ✗ beda', '∉ H ✗ different'), C.r, 15, 700]]} />
      </At>
      <At from={2} frame={k}>
        {[[t('kanan: Hg', 'right: Hg'), 25, rightCos, '(132)'], [t('kiri: gH', 'left: gH'), 265, leftCos, '(123)']].map(([title, x0, cos, partner]) => <g key={String(x0)}>
          <T x={Number(x0) + 95} y={52} size={15} weight={700}>{String(title)}</T>
          {boxes.map((g, bi) => <g key={g}>
            <rect x={Number(x0)} y={68 + bi * 62} width={190} height={50} rx={12} fill={three[bi]} fillOpacity=".1" stroke={three[bi]} strokeWidth="2" />
            {(cos as typeof rightCos)(g).map((s, j) => { const c = s === '(13)' ? C.v : s === partner ? C.g : three[bi]; return <Pill key={s} at={[Number(x0) + 55 + j * 80, 93 + bi * 62]} label={s} w={60} color={c} fill={c === C.v || c === C.g} /> })}
          </g>)}
        </g>)}
        <T x={240} y={272} size={13}>{t('(13) bersama (132) di kanan, bersama (123) di kiri', '(13) pairs with (132) on the right, with (123) on the left')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cosets:2  Euler and Fermat
const EC: P = [120, 150]
const eulerFermat: Story = {
  title: b('Euler dan Fermat: pangkat unit selalu pulang', 'Euler and Fermat: powers of a unit always come home'),
  frames: [
    f('Unit modulo 9 adalah sisa yang fpb-nya dengan 9 sama dengan 1: 1, 2, 4, 5, 7, 8. Mereka membentuk grup U₉ terhadap perkalian, dengan φ(9) = 6 anggota. Contoh: 2 · 5 = 10 ≡ 1.', 'The units modulo 9 are the remainders with gcd 1 with 9: 1, 2, 4, 5, 7, 8. They form the group U₉ under multiplication, with φ(9) = 6 elements. Example: 2 · 5 = 10 ≡ 1.', String.raw`U_9=\{1,2,4,5,7,8\},\quad\varphi(9)=6`),
    f('Kalikan dengan 2 terus: 2, 4, 8, 7, 5, 1. Setelah 6 langkah kembali ke 1, jadi orde 2 adalah 6 dan 2⁶ ≡ 1 (mod 9).', 'Keep multiplying by 2: 2, 4, 8, 7, 5, 1. After 6 steps it is back at 1, so the order of 2 is 6 and 2⁶ ≡ 1 (mod 9).', String.raw`2^6=64\equiv1\pmod9`),
    f('Geser a. Menurut Lagrange orde setiap unit membagi 6 (misalnya o(4) = 3, o(8) = 2), jadi a⁶ ≡ 1 selalu. Untuk a = 3 atau 6 syarat fpb(a, 9) = 1 gagal dan pangkatnya jatuh ke 0.', 'Move a. By Lagrange every unit’s order divides 6 (for example o(4) = 3, o(8) = 2), so a⁶ ≡ 1 always. For a = 3 or 6 the condition gcd(a, 9) = 1 fails and the powers fall to 0.', String.raw`\gcd(a,9)=1\Rightarrow a^{\varphi(9)}=a^6\equiv1\pmod9`),
    f('Fermat adalah kasus prima: modulo 7 semua sisa 1 sampai 6 adalah unit, φ(7) = 6, jadi a⁶ ≡ 1 (mod 7) bila 7 ∤ a. Coba a = 3: 3, 2, 6, 4, 5, 1. Untuk a = 7 hasilnya 0.', 'Fermat is the prime case: modulo 7 every remainder 1 to 6 is a unit, φ(7) = 6, so a⁶ ≡ 1 (mod 7) when 7 ∤ a. Try a = 3: 3, 2, 6, 4, 5, 1. For a = 7 the result is 0.', String.raw`7\nmid a\Rightarrow a^{p-1}=a^6\equiv1\pmod7`),
  ],
  control: { label: b('Basis a', 'Base a'), min: 1, max: 8, step: 1, initial: 4 },
  controlFrom: 2,
  readout: a => String.raw`${a}^6\equiv${pw(a, 6, 9)}\pmod9,\qquad ${a}^6\equiv${pw(a, 6, 7)}\pmod7`,
  draw: (k, value, lang) => {
    const t = tr(lang), n = k === 3 ? 7 : 9, a = k <= 1 ? 2 : value, pos = clock(EC, 92, n), unit = gcd(a, n) === 1
    const seq = [1]; for (let x = (a % n); ; x = (x * a) % n) { const seen = seq.includes(x); seq.push(x); if (seen) break }
    let o = 0; if (unit) { o = 1; while (pw(a, o, n) !== 1) o++ }
    return <>
      <circle cx={EC[0]} cy={EC[1]} r={92} fill="none" stroke={C.faint} />
      <At from={1} frame={k}>{seq.slice(0, -1).map((v, j) => v === seq[j + 1] ? null : <Bent key={`${n}-${a}-${j}`} p={pos(v)} q={pos(seq[j + 1])} color={unit ? C.v : C.r} bend={10} r1={16} r2={18} width={2} />)}</At>
      {Array.from({ length: n }, (_, x) => { const u = gcd(x, n) === 1; return <Node key={`${n}-${x}`} at={pos(x)} label={x} r={16} fill={u ? C.a : C.bg} stroke={x === 1 && k >= 1 ? C.g : u ? C.a : C.ln} ink={u ? C.bg : C.mu} /> })}
      <At from={1} frame={k}><circle cx={pos(1)[0]} cy={pos(1)[1]} r={21} fill="none" stroke={C.g} strokeWidth="2.5" /></At>
      <At until={0} frame={k}>
        <Lines x={250} y={70} gap={30} rows={[['U₉ = {1, 2, 4, 5, 7, 8}', C.a, 15, 700], [t('fpb(x, 9) = 1', 'gcd(x, 9) = 1'), C.mu, 14], ['φ(9) = 6', C.fg, 18, 700], ['2 · 5 = 10 ≡ 1', C.fg, 15], [t('0, 3, 6: bukan unit', '0, 3, 6: not units'), C.mu, 14]]} />
      </At>
      <At from={1} frame={k}>
        <T x={255} y={42} anchor="start" size={14} color={C.mu}>{t(`pangkat ${a} (mod ${n})`, `powers of ${a} (mod ${n})`)}</T>
        {[1, 2, 3, 4, 5, 6].map(j => { const r = pw(a, j, n); return <T key={j} x={255} y={68 + (j - 1) * 24} anchor="start" size={15} weight={j === 6 ? 700 : 500} color={j === 6 ? (r === 1 ? C.g : C.r) : C.fg}>{a}{sup(j)} ≡ {r}{j === 6 ? (r === 1 ? ' ✓' : ' ✗') : ''}</T> })}
        <T x={255} y={222} anchor="start" size={15} weight={600} color={unit ? C.v : C.r}>{unit ? t(`o(${a}) = ${o}, membagi 6`, `o(${a}) = ${o}, divides 6`) : n === 9 ? t(`fpb(${a}, 9) = ${gcd(a, 9)} ≠ 1`, `gcd(${a}, 9) = ${gcd(a, 9)} ≠ 1`) : t('7 | a: bukan unit', '7 | a: not a unit')}</T>
        <T x={255} y={248} anchor="start" size={14} color={C.mu}>{n === 9 ? 'φ(9) = 6' : t('p = 7 prima, φ(7) = 6', 'p = 7 prime, φ(7) = 6')}</T>
      </At>
      <T x={22} y={34} anchor="start" size={15} weight={700} color={C.mu}>{n === 9 ? 'mod 9' : 'mod 7'}</T>
    </>
  },
}

// ---------------------------------------------------------------- cosets:3  prime-order groups are cyclic
const Z5c: P = [120, 152], h5 = clock(Z5c, 90, 5), Z6c: P = [365, 118], h6 = clock(Z6c, 62, 6)
const primeCyclic: Story = {
  title: b('Grup berorde prima selalu siklik', 'A group of prime order is always cyclic'),
  frames: [
    f('ℤ₅ punya 5 anggota, dan 5 prima. Mulai dari 0 dan tambah 2 terus: 0, 2, 4, 1, 3, lalu kembali ke 0. Semua sisa dikunjungi, jadi 2 membangun seluruh ℤ₅.', 'ℤ₅ has 5 elements, and 5 is prime. Start at 0 and keep adding 2: 0, 2, 4, 1, 3, then back to 0. Every remainder is visited, so 2 generates all of ℤ₅.', String.raw`\langle2\rangle=\{0,2,4,1,3\}=\mathbb Z_5`),
    f('Ini bukan kebetulan. Orde 2 membagi 5 menurut Lagrange, jadi hanya 1 atau 5. Orde 1 hanya milik identitas 0, maka orde 2 adalah 5.', 'This is no accident. By Lagrange the order of 2 divides 5, so it is 1 or 5. Only the identity 0 has order 1, so the order of 2 is 5.', String.raw`o(a)\mid5,\ a\ne0\Rightarrow o(a)=5`),
    f('Geser a: setiap anggota bukan nol membangun ℤ₅, sebagai segi lima atau sebagai bintang. Grup berorde prima selalu siklik.', 'Move a: every nonzero element generates ℤ₅, as a pentagon or as a star. A group of prime order is always cyclic.', String.raw`a\ne0\Rightarrow\langle a\rangle=\mathbb Z_5`),
    f('Bandingkan ℤ₆, yang ordenya bukan prima: a = 2 hanya mencapai {0, 2, 4} dan a = 3 hanya {0, 3}. Subgrup sejati boleh ada di sini, karena 6 punya pembagi 2 dan 3.', 'Compare ℤ₆, whose order is not prime: a = 2 only reaches {0, 2, 4} and a = 3 only {0, 3}. Proper subgroups can exist here, because 6 has divisors 2 and 3.', String.raw`\langle2\rangle=\{0,2,4\}\subsetneq\mathbb Z_6`),
  ],
  control: { label: b('Pembangkit a', 'Generator a'), min: 1, max: 4, step: 1, initial: 3 },
  controlFrom: 2,
  readout: a => String.raw`o(${a})\mid5,\ ${a}\ne0\ \Rightarrow\ o(${a})=5`,
  draw: (k, value, lang) => {
    const t = tr(lang), a = k <= 1 ? 2 : value
    const v5 = Array.from({ length: 6 }, (_, j) => (j * a) % 5)
    const o6 = 6 / gcd(a, 6), v6 = Array.from({ length: o6 + 1 }, (_, j) => (j * a) % 6), in6 = new Set(v6)
    return <>
      <T x={22} y={34} anchor="start" size={16} weight={700} color={C.mu}>ℤ₅</T>
      <circle cx={Z5c[0]} cy={Z5c[1]} r={90} fill="none" stroke={C.faint} />
      {v5.slice(0, -1).map((v, j) => <Bent key={`${a}-${j}`} p={h5(v)} q={h5(v5[j + 1])} color={C.v} bend={6} />)}
      {Array.from({ length: 5 }, (_, n) => <Node key={n} at={h5(n)} label={n} r={17} size={15} fill={C.a} />)}
      <At until={0} frame={k}><Lines x={245} y={74} gap={30} rows={[['|ℤ₅| = 5', C.fg, 17, 700], [t('5 prima', '5 is prime'), C.mu, 14], ['0 → 2 → 4 → 1 → 3 → 0', C.v, 14, 600], ['⟨2⟩ = ℤ₅ ✓', C.g, 17, 700]]} /></At>
      <At from={1} until={1} frame={k}><Lines x={245} y={74} gap={30} rows={[[t('o(2) membagi 5 (Lagrange)', 'o(2) divides 5 (Lagrange)'), C.fg, 14], [t('pembagi 5: hanya 1 dan 5', 'divisors of 5: only 1 and 5'), C.fg, 14], [t('o(2) ≠ 1 karena 2 ≠ 0', 'o(2) ≠ 1 because 2 ≠ 0'), C.r, 14], ['o(2) = 5', C.g, 18, 700]]} /></At>
      <At from={2} until={2} frame={k}><Lines x={245} y={74} gap={30} rows={[[`a = ${a}`, C.a, 18, 700], [v5.join(' → '), C.v, 14, 600], [`⟨${a}⟩ = ℤ₅ ✓`, C.g, 17, 700], [t('setiap a ≠ 0 membangun ℤ₅', 'every a ≠ 0 generates ℤ₅'), C.mu, 13]]} /></At>
      <At from={3} frame={k}>
        <circle cx={Z6c[0]} cy={Z6c[1]} r={62} fill="none" stroke={C.faint} />
        {v6.slice(0, -1).map((v, j) => <Bent key={`${a}-${j}`} p={h6(v)} q={h6(v6[j + 1])} color={C.y} bend={o6 === 2 ? 12 : 5} r1={15} r2={17} width={2} />)}
        {Array.from({ length: 6 }, (_, n) => <Node key={n} at={h6(n)} label={n} r={14} size={13} fill={in6.has(n) ? C.y : C.bg} stroke={in6.has(n) ? C.y : C.ln} />)}
        <T x={Z6c[0]} y={222} size={14} color={C.mu}>{t('ℤ₆: 6 bukan prima', 'ℤ₆: 6 is not prime')}</T>
        <T x={Z6c[0]} y={246} size={15} weight={600}>⟨{a}⟩ = {set([...in6].sort((x, y) => x - y))}</T>
        <T x={Z6c[0]} y={270} size={14} weight={700} color={o6 === 6 ? C.g : C.r}>{o6 === 6 ? '= ℤ₆ ✓' : t('bukan seluruh ℤ₆ ✗', 'not all of ℤ₆ ✗')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- kernel:0  homomorphisms preserve operations
const SQ = [{ a: 4, c: 5, n: 3 }, { a: 4, c: 5, n: 3 }, { a: 4, c: 8, n: 3 }, { a: 7, c: 8, n: 5 }]
const Box = ({ at, label, color }: { at: P; label: string; color: string }) => <g><rect x={at[0] - 55} y={at[1] - 20} width={110} height={40} rx={10} fill={C.bg} stroke={color} strokeWidth="2.5" /><T x={at[0]} y={at[1] + 6} size={17} weight={700} color={color}>{label}</T></g>
const preserve: Story = {
  title: b('Homomorfisma: jumlahkan dulu atau petakan dulu, sama saja', 'Homomorphism: add first or map first, same result'),
  frames: [
    f('Diagram untuk φ: ℤ₁₂ → ℤ₃, φ(a) = sisa a dibagi 3. Jalur atas lalu kanan: jumlahkan dulu di ℤ₁₂, 4 + 5 = 9, lalu petakan: 9 ↦ 0.', 'A diagram for φ: ℤ₁₂ → ℤ₃, φ(a) = remainder of a divided by 3. Top, then right: add first in ℤ₁₂, 4 + 5 = 9, then map: 9 ↦ 0.', String.raw`\varphi(4+5)=\varphi(9)=0`),
    f('Jalur kiri lalu bawah: petakan dulu, 4 ↦ 1 dan 5 ↦ 2, lalu jumlahkan di ℤ₃: 1 + 2 = 3 ≡ 0. Kedua jalur tiba di tempat sama. Itulah arti homomorfisma.', 'Left, then bottom: map first, 4 ↦ 1 and 5 ↦ 2, then add in ℤ₃: 1 + 2 = 3 ≡ 0. Both paths arrive at the same place. That is what a homomorphism means.', String.raw`\varphi(4+5)=\varphi(4)+\varphi(5)`),
    f('Akibatnya identitas dan invers ikut terjaga. 4 dan 8 saling invers di ℤ₁₂ (4 + 8 = 12 ≡ 0), dan bayangannya 1 dan 2 saling invers di ℤ₃.', 'As a consequence identity and inverses are preserved. 4 and 8 are inverses in ℤ₁₂ (4 + 8 = 12 ≡ 0), and their images 1 and 2 are inverses in ℤ₃.', String.raw`\varphi(0)=0,\quad\varphi(-a)=-\varphi(a)`),
    f('Target harus cocok. Sisa bagi 5 dari ℤ₁₂ ke ℤ₅ gagal: jalur atas memberi 15 ≡ 3 ↦ 3, jalur bawah memberi 2 + 3 ≡ 0. Penyebabnya 12 bukan kelipatan 5.', 'The target must fit. Remainder mod 5 from ℤ₁₂ to ℤ₅ fails: the top path gives 15 ≡ 3 ↦ 3, the bottom path gives 2 + 3 ≡ 0. The reason is that 12 is not a multiple of 5.', String.raw`\varphi(7+8)=3\ne0=\varphi(7)+\varphi(8)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), { a, c, n } = SQ[k], top = (a + c) % 12, right = top % n, bl = [a % n, c % n], bottom = (bl[0] + bl[1]) % n, ok = right === bottom
    const TL: P = [120, 60], TR: P = [360, 60], BL: P = [120, 195], BR: P = [360, 195]
    const notes: [string, string, string, string][] = [
      ['4 + 5 = 9 ↦ 9 mod 3 = 0', 'jalur 1: jumlahkan dulu, lalu petakan', 'path 1: add first, then map', C.v],
      ['4 ↦ 1,  5 ↦ 2,  1 + 2 = 3 ≡ 0', 'jalur 2: petakan dulu, lalu jumlahkan; sama ✓', 'path 2: map first, then add; same ✓', C.y],
      ['φ(0) = 0,   φ(8) = 2 ≡ −1 = −φ(4)', 'identitas dan invers ikut terjaga ✓', 'identity and inverses are preserved ✓', C.g],
      ['7 + 8 = 15 ≡ 3 ↦ 3,   2 + 3 = 5 ≡ 0', 'ℤ₁₂ → ℤ₅: 12 bukan kelipatan 5, gagal ✗', 'ℤ₁₂ → ℤ₅: 12 is not a multiple of 5, fails ✗', C.r],
    ]
    return <>
      <T x={18} y={66} anchor="start" size={15} weight={700} color={C.mu}>ℤ₁₂</T>
      <T x={18} y={201} anchor="start" size={15} weight={700} color={k === 3 ? C.r : C.mu}>{k === 3 ? 'ℤ₅' : 'ℤ₃'}</T>
      <Arrow from={[178, 60]} to={[302, 60]} color={C.v} width={3} />
      <T x={240} y={46} size={13} color={C.v}>+ (mod 12)</T>
      <Arrow from={[360, 83]} to={[360, 170]} color={C.v} width={3} />
      <T x={374} y={132} anchor="start" size={16} weight={700} color={C.v}>φ</T>
      <At from={1} frame={k}>
        <Arrow from={[120, 83]} to={[120, 170]} color={C.y} width={3} />
        <T x={106} y={132} anchor="end" size={16} weight={700} color={C.y}>φ</T>
        <Arrow from={[178, 195]} to={[302, 195]} color={C.y} width={3} />
        <T x={240} y={225} size={13} color={C.y}>+ (mod {n})</T>
        <Box at={BL} label={`${bl[0]}, ${bl[1]}`} color={C.y} />
      </At>
      <Box at={TL} label={`${a}, ${c}`} color={C.fg} />
      <Box at={TR} label={String(top)} color={C.v} />
      <Box at={BR} label={k === 0 ? String(right) : ok ? `${right} ✓` : `${right} ≠ ${bottom}`} color={k === 0 ? C.v : ok ? C.g : C.r} />
      <T x={240} y={258} size={15} weight={600} color={notes[k][3]}>{notes[k][0]}</T>
      <T x={240} y={282} size={13} color={k === 3 ? C.r : C.mu}>{t(notes[k][1], notes[k][2])}</T>
    </>
  },
}

// ---------------------------------------------------------------- kernel:1  trivial kernel iff injective
const kx = (i: number) => 46 + i * 46
const injective: Story = {
  title: b('Kernel trivial tepat ketika tidak ada yang bergabung', 'Trivial kernel exactly when nothing merges'),
  frames: [
    f('φ(x) = 2x dari ℤ₆ ke ℤ₆ adalah homomorfisma. Panah berwarna sama tiba di tempat sama: 1 dan 4 sama-sama ke 2. Kernelnya, yang jatuh ke 0, adalah {0, 3}.', 'φ(x) = 2x from ℤ₆ to ℤ₆ is a homomorphism. Arrows of one color land in the same place: 1 and 4 both go to 2. Its kernel, everything landing on 0, is {0, 3}.', String.raw`\ker\varphi=\{0,3\}`),
    f('Penggabungan selalu lewat kernel: φ(4) = φ(1) berarti φ(4 − 1) = 0, jadi 4 − 1 = 3 ada di kernel. Setiap pasangan yang bergabung berselisih 3.', 'Merging always goes through the kernel: φ(4) = φ(1) means φ(4 − 1) = 0, so 4 − 1 = 3 is in the kernel. Every merged pair differs by 3.', String.raw`\varphi(a)=\varphi(b)\Rightarrow a-b\in\ker\varphi`),
    f('Sekarang ψ(x) = 5x. Hanya 0 yang jatuh ke 0, jadi ker ψ = {0}, dan tidak ada dua panah yang bertemu: ψ injektif.', 'Now ψ(x) = 5x. Only 0 lands on 0, so ker ψ = {0}, and no two arrows meet: ψ is injective.', b(String.raw`\ker\psi=\{0\}\iff\psi\ \text{injektif}`, String.raw`\ker\psi=\{0\}\iff\psi\ \text{injective}`)),
    f('Geser m untuk φ(x) = m·x. Setiap bayangan menerima tepat |ker φ| panah, dan |ker φ| = fpb(m, 6). Injektif tepat saat kernel hanya {0}: m = 1 atau 5.', 'Move m for φ(x) = m·x. Every image receives exactly |ker φ| arrows, and |ker φ| = gcd(m, 6). It is injective exactly when the kernel is just {0}: m = 1 or 5.', String.raw`|\ker\varphi|=\gcd(m,6)`),
  ],
  control: { label: b('Pengali m', 'Multiplier m'), min: 0, max: 5, step: 1, initial: 3 },
  controlFrom: 3,
  readout: m => { const ker = [0, 1, 2, 3, 4, 5].filter(x => (m * x) % 6 === 0); return String.raw`\ker=\{${ker.join(',')}\},\quad|\ker|=\gcd(${m},6)=${gcd(m, 6)}` },
  draw: (k, value, lang) => {
    const t = tr(lang), m = k <= 1 ? 2 : k === 2 ? 5 : value, xs = [0, 1, 2, 3, 4, 5]
    const img = (x: number) => (m * x) % 6, ker = xs.filter(x => img(x) === 0), targets = [...new Set(xs.map(img))].sort((p, q) => p - q), inj = ker.length === 1
    const col = (y: number) => inj ? C.g : six[targets.indexOf(y)]
    const name = k === 2 ? 'ψ' : 'φ'
    return <>
      {xs.map(x => <Arrow key={`${m}-${x}`} from={[kx(x), 79]} to={[kx(img(x)), 188]} color={col(img(x))} width={k === 0 && (x === 1 || x === 4) ? 3.5 : 2.2} head={9} />)}
      {xs.map(x => <Node key={x} at={[kx(x), 62]} label={x} r={15} fill={ker.includes(x) ? C.a : C.bg} stroke={ker.includes(x) ? C.a : C.ln} />)}
      {xs.map(y => { const hit = targets.includes(y); return <Node key={y} at={[kx(y), 205]} label={y} r={15} fill={y === 0 ? C.a : C.bg} stroke={hit ? col(y) : C.faint} ink={hit || y === 0 ? undefined : C.mu} /> })}
      <T x={kx(0) - 22} y={36} anchor="start" size={13} color={C.mu}>x</T>
      <T x={kx(0) - 22} y={246} anchor="start" size={13} color={C.mu}>{name}(x)</T>
      <At until={0} frame={k}><Lines x={305} y={64} gap={30} rows={[['φ(x) = 2x', C.fg, 17, 700], [t('atas: x, bawah: φ(x)', 'top: x, bottom: φ(x)'), C.mu, 12], ['1 ↦ 2, 4 ↦ 2', C.r, 15, 600], ['ker φ = {0, 3}', C.a, 16, 700]]} /></At>
      <At from={1} until={1} frame={k}><Lines x={305} y={64} gap={28} rows={[['φ(4) = φ(1)', C.fg, 15], ['⇒ φ(4 − 1) = 0', C.fg, 15], ['⇒ 3 ∈ ker φ', C.a, 15, 700], [t('pasangan bergabung', 'merged pairs'), C.mu, 13], [t('berselisih 3:', 'differ by 3:'), C.mu, 13], ['0~3, 1~4, 2~5', C.fg, 14, 600]]} /></At>
      <At from={2} until={2} frame={k}><Lines x={305} y={64} gap={30} rows={[['ψ(x) = 5x', C.fg, 17, 700], ['ker ψ = {0}', C.a, 16, 700], [t('tidak ada yang', 'nothing'), C.mu, 14], [t('bergabung', 'merges'), C.mu, 14], [t('injektif ✓', 'injective ✓'), C.g, 16, 700]]} /></At>
      <At from={3} frame={k}><Lines x={305} y={64} gap={30} rows={[[`φ(x) = ${m}x`, C.fg, 17, 700], [`ker = ${ker.length === 6 ? 'ℤ₆' : set(ker)}`, C.a, 15, 700], [t(`fpb(${m}, 6) = ${gcd(m, 6)}`, `gcd(${m}, 6) = ${gcd(m, 6)}`), C.fg, 14], [t(`tiap bayangan: ${ker.length} panah`, `each image: ${ker.length} arrow${ker.length > 1 ? 's' : ''}`), C.mu, 13], [inj ? t('injektif ✓', 'injective ✓') : t('tidak injektif ✗', 'not injective ✗'), inj ? C.g : C.r, 15, 700]]} /></At>
    </>
  },
}

// ---------------------------------------------------------------- kernel:2  normality is setwise stability
const normalStable: Story = {
  title: b('Normal: himpunannya stabil, anggotanya boleh bertukar', 'Normal: the set is stable, its members may swap'),
  frames: [
    f('Konjugasi oleh g = (23) mengirim x ke g⁻¹xg. Pada A₃ = {e, (123), (132)}, dua siklus tiga bertukar tempat, tetapi himpunannya tetap A₃. Normal berarti stabil sebagai himpunan, bukan setiap anggota diam.', 'Conjugation by g = (23) sends x to g⁻¹xg. In A₃ = {e, (123), (132)} the two 3-cycles swap places, but the set is still A₃. Normal means stable as a set, not that every member stays put.', String.raw`(2\,3)^{-1}A_3(2\,3)=A_3`),
    f('Pada H = {e, (12)}, konjugasi oleh (23) mengirim (12) ke (13), yang berada di luar H. Jadi H tidak normal.', 'In H = {e, (12)}, conjugation by (23) sends (12) to (13), which lies outside H. So H is not normal.', String.raw`(2\,3)^{-1}(1\,2)(2\,3)=(1\,3)\notin H`),
    f('Normal harus diperiksa untuk semua g. H stabil hanya untuk g = e dan (12); A₃ stabil untuk keenamnya. A₃ adalah kernel dari tanda sgn, dan kernel selalu normal: sgn(g⁻¹kg) = sgn(g)⁻¹ · 1 · sgn(g) = 1.', 'Normality must be checked for all g. H is stable only for g = e and (12); A₃ is stable for all six. A₃ is the kernel of the sign map, and kernels are always normal: sgn(g⁻¹kg) = sgn(g)⁻¹ · 1 · sgn(g) = 1.', String.raw`\operatorname{sgn}(g^{-1}kg)=\operatorname{sgn}(g)^{-1}\cdot1\cdot\operatorname{sgn}(g)=1`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), g = '(23)'
    const scene = (xs: string[], title: string, ys: number[]) => {
      const out = xs.map(x => conj(g, x)), base = new Set(xs)
      const rightList = xs.filter(x => out.includes(x)).concat(out.filter(y => !base.has(y)))
      return <>
        <T x={100} y={52} size={16} weight={700} color={C.a}>{title}</T>
        <T x={380} y={52} size={16} weight={700} color={C.v}>g⁻¹{title}g</T>
        <T x={240} y={52} size={15} weight={600}>g = {g}</T>
        <rect x={40} y={ys[0] - 30} width={120} height={ys[ys.length - 1] - ys[0] + 60} rx={14} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="2" />
        <rect x={320} y={ys[0] - 30} width={120} height={ys[ys.length - 1] - ys[0] + 60} rx={14} fill={C.v} fillOpacity=".08" stroke={C.v} strokeWidth="2" />
        {xs.map((x, i) => { const j = rightList.indexOf(conj(g, x)); return <Arrow key={x} from={[134, ys[i]]} to={[346, ys[j]]} color={three[i]} width={2.5} head={10} /> })}
        {xs.map((x, i) => <Pill key={x} at={[100, ys[i]]} label={x} w={60} color={three[i]} />)}
        {rightList.map((y, j) => <Pill key={y} at={[380, ys[j]]} label={y} w={60} color={base.has(y) ? three[xs.indexOf(y)] : C.r} fill={!base.has(y)} />)}
      </>
    }
    const hRows = E3.map(h => { const s = sortS3(H12.map(x => conj(h, x))), a = sortS3(A3.map(x => conj(h, x))); return { h, s, a, sOk: s.join() === H12.join(), aOk: a.join() === A3.join() } })
    return <>
      <At until={0} frame={k}>
        {scene(A3, 'A₃', [95, 150, 205])}
        <T x={240} y={258} size={14} color={C.mu}>(123) ↔ (132) {t('bertukar', 'swap')}</T>
        <T x={240} y={282} size={15} weight={700} color={C.g}>{t('himpunan sama: A₃ ✓', 'same set: A₃ ✓')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {scene(H12, 'H', [110, 170])}
        <T x={240} y={252} size={15} weight={600} color={C.r}>(12) ↦ {conj(g, '(12)')} ∉ H</T>
        <T x={240} y={278} size={15} weight={700} color={C.r}>{t('H tidak stabil: tidak normal ✗', 'H is not stable: not normal ✗')}</T>
      </At>
      <At from={2} frame={k}>
        {['g', 'g⁻¹Hg', 'g⁻¹A₃g'].map((s, i) => <T key={s} x={[60, 220, 385][i]} y={42} size={15} weight={700} color={C.mu}>{s}</T>)}
        {hRows.map((r, i) => <g key={r.h}>
          <T x={60} y={76 + i * 30} size={14} weight={600}>{r.h}</T>
          <T x={220} y={76 + i * 30} size={14} color={r.sOk ? C.g : C.r}>{set(r.s)} {r.sOk ? '✓' : '✗'}</T>
          <T x={385} y={76 + i * 30} size={14} color={r.aOk ? C.g : C.r}>{set(r.a)} {r.aOk ? '✓' : '✗'}</T>
        </g>)}
        <T x={240} y={268} size={14} weight={600}>{t(`H gagal untuk ${hRows.filter(r => !r.sOk).length} dari 6 g; A₃ selalu stabil`, `H fails for ${hRows.filter(r => !r.sOk).length} of the 6 g; A₃ is always stable`)}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- quotient:0  representatives must not matter
const leftBoxes = ['e', '(13)', '(23)'].map(g => leftCos(g))
const qbx = (i: number) => 18 + i * 152
const wellDefined: Story = {
  title: b('Perkalian koset: wakil yang dipilih tidak boleh berpengaruh', 'Coset multiplication: the chosen representative must not matter'),
  frames: [
    f('Koset kiri dari H = {e, (12)} di S₃ adalah tiga kotak. Coba definisikan perkalian kotak: pilih wakil dari tiap kotak, kalikan, lalu lihat kotak hasilnya. Kalikan kotak H dengan kotak (13)H.', 'The left cosets of H = {e, (12)} in S₃ are three boxes. Try to multiply boxes: pick a representative from each box, multiply, then see which box the result lands in. Multiply box H by box (13)H.', String.raw`(aH)(bH)\overset{?}{=}abH`),
    f('Dengan wakil e dan (13): e · (13) = (13), yang ada di kotak (13)H.', 'With representatives e and (13): e · (13) = (13), which is in box (13)H.', String.raw`e\cdot(1\,3)=(1\,3)\in(1\,3)H`),
    f('Ganti wakil e dengan (12), dari kotak yang sama. Sekarang (12)(13) = (132), yang ada di kotak (23)H. Kotak sama, hasil berbeda: perkalian ini tidak terdefinisi dengan baik, karena H tidak normal.', 'Replace representative e by (12), from the same box. Now (12)(13) = (132), which is in box (23)H. Same boxes, different result: this multiplication is not well defined, because H is not normal.', String.raw`(1\,2)(1\,3)=(1\,3\,2)\in(2\,3)H\ne(1\,3)H`),
    f('Dengan subgrup normal N = A₃ masalahnya hilang. Kotaknya genap dan ganjil, dan ganjil kali ganjil selalu genap, apa pun wakilnya. Jadi (aN)(bN) = abN terdefinisi.', 'With the normal subgroup N = A₃ the problem disappears. The boxes are even and odd, and odd times odd is always even, whatever the representatives. So (aN)(bN) = abN is well defined.', String.raw`(aN)(bN)=abN\quad(N\triangleleft G)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), r1 = mul('e', '(13)'), r2 = mul('(12)', '(13)')
    const hotIn = (s: string) => (k >= 1 && s === '(13)') ? C.v : k === 1 && s === 'e' ? C.v : k === 2 && s === '(12)' ? C.r : k === 1 && s === r1 ? C.g : k === 2 && s === r2 ? C.r : undefined
    const pillX = (s: string): P => { const i = leftBoxes.findIndex(bx => bx.includes(s)), j = leftBoxes[i].indexOf(s); return [qbx(i) + 38 + j * 64, 78] }
    const even = ['e', '(123)', '(132)'], odd = ['(12)', '(13)', '(23)']
    return <>
      <At until={2} frame={k}>
        {leftBoxes.map((bx, i) => <g key={i}>
          <T x={qbx(i) + 70} y={32} size={14} weight={700} color={three[i]}>{i ? `${bx[0]}H` : 'H'}</T>
          <rect x={qbx(i)} y={44} width={140} height={68} rx={14} fill={three[i]} fillOpacity=".1" stroke={three[i]} strokeWidth="2.5" />
          {bx.map(s => { const h = hotIn(s); return <Pill key={s} at={pillX(s)} label={s} w={56} color={h ?? three[i]} fill={!!h} /> })}
        </g>)}
      </At>
      <At until={0} frame={k}>
        <T x={240} y={170} size={20} weight={700}>H · (13)H = ?</T>
        <T x={240} y={208} size={14} color={C.mu}>{t('pilih wakil dari tiap kotak, kalikan,', 'pick a representative from each box, multiply,')}</T>
        <T x={240} y={232} size={14} color={C.mu}>{t('lalu lihat kotak hasilnya', 'then see which box the result is in')}</T>
      </At>
      <At from={1} until={2} frame={k}>
        <Arrow from={[pillX(r1)[0] + 12, 152]} to={[pillX(r1)[0], 96]} color={C.g} width={2.5} head={9} />
        <T x={200} y={170} size={16} weight={600} color={C.g}>e · (13) = {r1} ∈ (13)H</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Arrow from={[pillX(r2)[0] - 8, 188]} to={[pillX(r2)[0], 96]} color={C.r} width={2.5} head={9} />
        <T x={200} y={206} size={16} weight={600} color={C.r}>(12) · (13) = {r2} ∈ (23)H</T>
        <T x={240} y={248} size={14}>{t('wakil berbeda dari kotak yang sama,', 'different reps from the same box,')}</T>
        <T x={240} y={272} size={15} weight={700} color={C.r}>{t('kotak hasil berbeda ✗', 'different result boxes ✗')}</T>
      </At>
      <At from={3} frame={k}>
        {[[t('A₃ (genap)', 'A₃ (even)'), even, C.g, 20], [t('(12)A₃ (ganjil)', '(12)A₃ (odd)'), odd, C.r, 255]].map(([title, xs, c, x0]) => <g key={String(x0)}>
          <T x={Number(x0) + 102} y={32} size={14} weight={700} color={String(c)}>{String(title)}</T>
          <rect x={Number(x0)} y={44} width={205} height={68} rx={14} fill={String(c)} fillOpacity=".1" stroke={String(c)} strokeWidth="2.5" />
          {(xs as string[]).map((s, j) => <Pill key={s} at={[Number(x0) + 36 + j * 67, 78]} label={s} w={58} color={String(c)} />)}
        </g>)}
        {[['(12)', '(13)'], ['(12)', '(23)'], ['(13)', '(13)']].map(([p, q], i) => <T key={i} x={240} y={156 + i * 28} size={16} weight={600} color={C.g}>{p}{q} = {mul(p, q)} ∈ A₃ ✓</T>)}
        <T x={240} y={252} size={14}>{t('ganjil · ganjil selalu genap:', 'odd · odd is always even:')}</T>
        <T x={240} y={276} size={15} weight={700} color={C.g}>{t('pilihan wakil tidak berpengaruh ✓', 'the choice of reps does not matter ✓')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- quotient:1  abelian quotient of a nonabelian group
const abelianQuotient: Story = {
  title: b('Kuosien abelian dari grup yang tidak abelian', 'An abelian quotient of a nonabelian group'),
  frames: [
    f('Ambil σ = (12) dan τ = (23) di S₃. στ = (123) tetapi τσ = (132): urutan mengubah hasil, jadi S₃ tidak abelian.', 'Take σ = (12) and τ = (23) in S₃. στ = (123) but τσ = (132): the order changes the result, so S₃ is not abelian.', String.raw`\sigma\tau=(1\,2\,3)\ne(1\,3\,2)=\tau\sigma`),
    f('Kelompokkan S₃ menurut koset A₃: kotak genap dan kotak ganjil. στ dan τσ sama-sama genap, jadi di S₃/A₃ keduanya kelas yang sama: [σ][τ] = [τ][σ].', 'Group S₃ by the cosets of A₃: an even box and an odd box. στ and τσ are both even, so in S₃/A₃ they are the same class: [σ][τ] = [τ][σ].', String.raw`[\sigma][\tau]=[\sigma\tau]=[\tau\sigma]=[\tau][\sigma]`),
    f('Alasannya: [a][b] = [b][a] tepat ketika komutator aba⁻¹b⁻¹ ada di N. Di sini στσ⁻¹τ⁻¹ = (132) ∈ A₃: kegagalan komut tertelan oleh N. S₃/A₃ hanya mencatat tanda, grup dua anggota yang abelian.', 'The reason: [a][b] = [b][a] exactly when the commutator aba⁻¹b⁻¹ lies in N. Here στσ⁻¹τ⁻¹ = (132) ∈ A₃: the failure to commute is swallowed by N. S₃/A₃ only records the sign, an abelian group with two elements.', String.raw`\sigma\tau\sigma^{-1}\tau^{-1}=(1\,3\,2)\in A_3`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), st = mul('(12)', '(23)'), ts = mul('(23)', '(12)'), comm = mul(mul(st, inv('(12)')), inv('(23)'))
    const place = (s: string): P => k === 0 ? [50 + E3.indexOf(s) * 76, 160] : A3.includes(s) ? [65 + A3.indexOf(s) * 63, 160] : [290 + ['(12)', '(13)', '(23)'].indexOf(s) * 63, 160]
    const ring = (s: string) => s === st ? C.v : s === ts ? C.y : C.ln
    return <>
      <T x={240} y={34} size={14} color={C.mu}>σ = (12),   τ = (23)</T>
      <T x={240} y={62} size={16} weight={600} color={C.v}>στ = (12)(23) = {st}</T>
      <T x={240} y={88} size={16} weight={600} color={C.y}>τσ = (23)(12) = {ts}</T>
      <At from={1} frame={k}>
        <T x={127} y={117} size={13} weight={700} color={C.g}>{t('A₃ = genap', 'A₃ = even')}</T>
        <T x={353} y={117} size={13} weight={700} color={C.r}>{t('(12)A₃ = ganjil', '(12)A₃ = odd')}</T>
        <rect x={30} y={125} width={195} height={70} rx={14} fill={C.g} fillOpacity=".1" stroke={C.g} strokeWidth="2.5" />
        <rect x={255} y={125} width={195} height={70} rx={14} fill={C.r} fillOpacity=".1" stroke={C.r} strokeWidth="2.5" />
      </At>
      {E3.map(s => <g key={s} style={{ transform: `translate(${place(s)[0]}px, ${place(s)[1]}px)`, transition: 'transform .5s ease' }}><Pill at={[0, 0]} label={s} w={56} color={ring(s)} fill={ring(s) !== C.ln} /></g>)}
      <At until={0} frame={k}>
        <T x={240} y={236} size={20} weight={700} color={C.r}>στ ≠ τσ</T>
        <T x={240} y={264} size={14} color={C.mu}>{t('S₃ tidak abelian', 'S₃ is not abelian')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={240} y={236} size={15} weight={700} color={C.g}>{t('keduanya genap: kelas sama', 'both even: the same class')}</T>
        <T x={240} y={264} size={15}>[σ][τ] = [στ] = A₃ = [τσ] = [τ][σ]</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={236} size={15} weight={600}>στσ⁻¹τ⁻¹ = {st}{st} = {comm} ∈ A₃ ✓</T>
        <T x={240} y={264} size={15} weight={700} color={C.g}>S₃/A₃ ≅ {'{+1, −1}'}: {t('abelian', 'abelian')} ✓</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- quotient:2  Cauchy's theorem for groups
const ZC: P = [122, 150], h12 = clock(ZC, 100, 12)
const PRIMES = [2, 3, 5, 7]
const cauchyGroup: Story = {
  title: b('Teorema Cauchy: prima yang membagi orde punya siklus', 'Cauchy’s theorem: a prime dividing the order has a cycle'),
  frames: [
    f('|ℤ₁₂| = 12 = 2² · 3. Prima p = 3 membagi 12, dan teorema Cauchy menjanjikan anggota berorde 3. Di ℤ₁₂ itu a = 12/3 = 4: 0 → 4 → 8 → 0.', '|ℤ₁₂| = 12 = 2² · 3. The prime p = 3 divides 12, and Cauchy’s theorem promises an element of order 3. In ℤ₁₂ it is a = 12/3 = 4: 0 → 4 → 8 → 0.', String.raw`3\mid12\Rightarrow o(4)=3`),
    f('Geser p. Untuk p = 2 anggotanya 6 (0 → 6 → 0). Untuk prima yang tidak membagi 12, seperti 5 dan 7, tidak ada anggota berorde p menurut Lagrange. Untuk p = 4 atau 6 teorema tidak berbicara, karena p bukan prima.', 'Move p. For p = 2 the element is 6 (0 → 6 → 0). For primes that do not divide 12, like 5 and 7, there is no element of order p by Lagrange. For p = 4 or 6 the theorem says nothing, because p is not prime.', String.raw`p\mid|G|\Rightarrow\exists a:\ o(a)=p`),
    f('Teorema berlaku juga untuk grup tak siklik. S₃ berorde 6 = 2 · 3 punya (12) berorde 2 dan (123) berorde 3, tetapi tidak punya anggota berorde 6. Jaminannya hanya untuk prima.', 'The theorem also holds for noncyclic groups. S₃ of order 6 = 2 · 3 has (12) of order 2 and (123) of order 3, but no element of order 6. The guarantee is only for primes.', String.raw`|S_3|=6,\quad o((1\,2))=2,\ o((1\,2\,3))=3`),
  ],
  control: { label: b('Bilangan p', 'Number p'), min: 2, max: 7, step: 1, initial: 2 },
  controlFrom: 1,
  readout: p => PRIMES.includes(p) ? (12 % p === 0 ? String.raw`p=${p}\mid12\Rightarrow o(${12 / p})=${p}` : String.raw`${p}\nmid12`) : String.raw`${p}=2\cdot${p / 2}`,
  draw: (k, value, lang) => {
    const t = tr(lang), p = k === 0 ? 3 : value, div = 12 % p === 0, prime = PRIMES.includes(p), a = 12 / p
    const visits = div ? Array.from({ length: p + 1 }, (_, j) => (j * a) % 12) : [0], inside = new Set(visits), col = prime ? C.a : C.mu
    const x = 255, s3 = E3.filter(s => ord(s) === p)
    return <>
      <circle cx={ZC[0]} cy={ZC[1]} r={100} fill="none" stroke={C.faint} />
      {div && visits.slice(0, -1).map((v, j) => <Bent key={`${p}-${j}`} p={h12(v)} q={h12(visits[j + 1])} color={prime ? C.v : C.mu} bend={p === 2 ? 14 : 5} r1={15} r2={17} width={2} />)}
      {Array.from({ length: 12 }, (_, n) => <Node key={n} at={h12(n)} label={n} r={14} size={13} fill={div && inside.has(n) ? col : C.bg} stroke={div && inside.has(n) ? col : C.ln} />)}
      <At until={1} frame={k}>
        <Lines x={x} y={48} gap={26} rows={[['|ℤ₁₂| = 12 = 2² · 3', C.fg, 15, 600], [`p = ${p}`, C.a, 18, 700],
          ...(prime && div ? [[`${p} | 12 ✓`, C.g, 15], [`a = 12/${p} = ${a}`, C.fg, 15], [visits.join(' → '), C.v, 15, 600], [`o(${a}) = ${p}`, C.g, 17, 700], [t('dijamin Cauchy', 'guaranteed by Cauchy'), C.g, 14]] as Row[]
            : prime ? [[`${p} ∤ 12`, C.r, 16, 700], [t('tidak ada anggota', 'no element'), C.fg, 14], [t(`berorde ${p} (Lagrange)`, `of order ${p} (Lagrange)`), C.fg, 14]] as Row[]
            : [[`${p} = 2 · ${p / 2}`, C.mu, 15], [t('bukan prima: Cauchy', 'not prime: Cauchy'), C.fg, 14], [t('tidak menjanjikan apa pun', 'promises nothing'), C.fg, 14], [t(`ℤ₁₂ siklik: o(${a}) = ${p}`, `ℤ₁₂ is cyclic: o(${a}) = ${p}`), C.mu, 13]] as Row[])]} />
      </At>
      <At from={2} frame={k}>
        <T x={x} y={40} anchor="start" size={14} color={C.mu}>ℤ₁₂: {div ? `o(${a}) = ${p}` : t(`tidak ada orde ${p}`, `no order ${p}`)}</T>
        <T x={x} y={74} anchor="start" size={15} weight={700}>S₃, |S₃| = 6 = 2 · 3</T>
        {E3.map((s, i) => { const on = ord(s) === p; return <Pill key={s} at={[300 + (i % 3) * 65, 106 + Math.floor(i / 3) * 38]} label={s} w={58} color={on ? C.g : C.ln} fill={on} /> })}
        <Lines x={x} y={190} gap={24} rows={s3.length ? [[t(`orde ${p}: ${s3.join(', ')} ✓`, `order ${p}: ${s3.join(', ')} ✓`), C.g, 13, 600], [prime ? t('dijamin Cauchy', 'guaranteed by Cauchy') : '', C.g, 13]]
          : 6 % p === 0 ? [[t('6 | 6, tetapi tidak ada', '6 | 6, but no element'), C.r, 13, 600], [t('anggota berorde 6:', 'of order 6:'), C.r, 13, 600], [t('6 bukan prima', '6 is not prime'), C.mu, 13]]
          : [[t(`${p} ∤ 6: tidak ada orde ${p}`, `${p} ∤ 6: no order ${p}`), C.r, 13, 600]]} />
      </At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'group:0': axioms,
  'group:1': cancellation,
  'group:2': reverseOrder,
  'cyclic:0': subgroupTest,
  'cyclic:1': elementOrder,
  'cyclic:2': centralizer,
  'cosets:0': lagrange,
  'cosets:1': cosetEquality,
  'cosets:2': eulerFermat,
  'cosets:3': primeCyclic,
  'kernel:0': preserve,
  'kernel:1': injective,
  'kernel:2': normalStable,
  'quotient:0': wellDefined,
  'quotient:1': abelianQuotient,
  'quotient:2': cauchyGroup,
}
