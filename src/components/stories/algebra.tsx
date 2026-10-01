import type { VisualKind } from '../../content/summary-lessons'
import { At, Arrow, C, Dot, T, b, f, fn, pl, plane, tr, Clip, type P, type Story } from './kit'

const rad = (d: number) => d * Math.PI / 180
/** n points on a circle, 0 at the top, going clockwise like a clock face. */
const clock = (c: P, r: number, n: number) => (k: number): P => { const a = rad(-90 + 360 * k / n); return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)] }
const Node = ({ at, label, fill, stroke = fill, r = 15, size = 14, ink }: { at: P; label: string | number; fill: string; stroke?: string; r?: number; size?: number; ink?: string }) =>
  <g style={{ transition: 'all .45s' }}><circle cx={at[0]} cy={at[1]} r={r} fill={fill} stroke={stroke} strokeWidth="2" /><T halo={false} x={at[0]} y={at[1] + size / 3} size={size} weight={600} color={ink ?? (fill === C.bg ? C.fg : C.bg)}>{label}</T></g>
/** Arrow between two node circles, trimmed so it starts and ends at their rims. */
const link = (p: P, q: P, r1 = 17, r2 = 19): [P, P] => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]), u = [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; return [[p[0] + u[0] * r1, p[1] + u[1] * r1], [q[0] - u[0] * r2, q[1] - u[1] * r2]] }
const three = [C.a, C.r, C.g]
const gcd = (a: number, m: number): number => m ? gcd(m, a % m) : a

// ---------------------------------------------------------------- groups: moves of a triangle
const Tri = ({ c, r, labels }: { c: P; r: number; labels: number[] }) => {
  const v = [90, 210, 330].map((d): P => [c[0] + r * Math.cos(rad(d)), c[1] - r * Math.sin(rad(d))])
  return <g><path d={pl(v, true)} fill={C.soft} stroke={C.ln} strokeWidth="2" />{v.map((p, i) => <Node key={i} at={p} label={labels[i]} fill={three[labels[i] - 1]} r={r > 50 ? 14 : 11} size={r > 50 ? 14 : 12} />)}</g>
}
const group: Story = {
  title: b('Grup = gerakan yang bisa digabung dan dibatalkan', 'A group = moves you can combine and undo'),
  frames: [
    f('Ambil segitiga sama sisi. Ada 6 gerakan yang menaruhnya kembali tepat di garis luarnya: 3 putaran (0°, 120°, 240°) dan 3 pencerminan. Himpunan gerakan ini, dengan "lakukan satu lalu yang lain" sebagai operasi, adalah grup S₃.', 'Take an equilateral triangle. There are 6 moves that put it back exactly in its outline: 3 turns (0°, 120°, 240°) and 3 flips. These moves, with "do one, then the other" as the operation, form the group S₃.', String.raw`|S_3|=6`),
    f('Contoh satu gerakan: r = putar 120° berlawanan jarum jam. Warna sudut menunjukkan ke mana setiap sudut pergi: 1 pindah ke kiri bawah, 2 ke kanan bawah, 3 ke atas.', 'One move: r = turn 120° counterclockwise. The corner colors show where each corner goes: 1 moves to bottom left, 2 to bottom right, 3 to the top.'),
    f('Empat aturan grup terlihat di sini. Tertutup: dua gerakan berturut-turut adalah gerakan lagi. Identitas: e = diam. Invers: putar 240° (r²) membatalkan r, jadi r²r = e. Asosiatif: menggabungkan gerakan tidak bergantung cara mengelompokkan.', 'The four group rules show up here. Closure: two moves in a row are again a move. Identity: e = do nothing. Inverse: turning 240° (r²) undoes r, so r²r = e. Associativity: combining moves does not depend on grouping.', String.raw`r^2r=e,\qquad r^{-1}=r^2`),
    f('Urutan penting! f = cermin terhadap sumbu tegak. "r dulu lalu f" dan "f dulu lalu r" memberi susunan berbeda. Jadi grup tidak harus komutatif: fr ≠ rf.', 'Order matters! f = flip across the vertical axis. "r first, then f" and "f first, then r" give different arrangements. So a group need not be commutative: fr ≠ rf.', String.raw`fr\ne rf`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={0} frame={k}>
        <path d="M150,48 V218" stroke={C.mu} strokeDasharray="5 5" />
        <Tri c={[150, 150]} r={80} labels={[1, 2, 3]} />
        <T x={290} y={90} anchor="start" size={18} weight={700}>{t('6 gerakan', '6 moves')}</T>
        <T x={290} y={124} anchor="start" size={15}>{t('putar 0°, 120°, 240°', 'turn 0°, 120°, 240°')}</T>
        <T x={290} y={152} anchor="start" size={15}>{t('cermin di 3 sumbu', 'flip on 3 axes')}</T>
        <T x={290} y={196} anchor="start" size={13} color={C.mu}>{t('putus-putus: sumbu cermin', 'dashed: a flip axis')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <Tri c={[110, 165]} r={65} labels={[1, 2, 3]} />
        <Arrow from={[200, 165]} to={[275, 165]} color={C.v} />
        <T x={238} y={150} color={C.v} weight={600}>r</T>
        <T x={238} y={192} color={C.mu} size={13}>{t('putar 120°', 'turn 120°')}</T>
        <Tri c={[365, 165]} r={65} labels={[3, 1, 2]} />
        <T x={110} y={268} color={C.mu} size={13}>{t('sebelum', 'before')}</T>
        <T x={365} y={268} color={C.mu} size={13}>{t('sesudah', 'after')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Tri c={[75, 150]} r={48} labels={[1, 2, 3]} />
        <Arrow from={[132, 150]} to={[185, 150]} color={C.v} /><T x={158} y={138} color={C.v} weight={600}>r</T>
        <Tri c={[240, 150]} r={48} labels={[3, 1, 2]} />
        <Arrow from={[297, 150]} to={[350, 150]} color={C.g} /><T x={323} y={138} color={C.g} weight={600}>r²</T>
        <Tri c={[405, 150]} r={48} labels={[1, 2, 3]} />
        <T x={240} y={250} size={17} weight={600}>r² r = e</T>
        <T x={240} y={274} size={13} color={C.mu}>{t('kembali ke awal: r² adalah invers r', 'back to the start: r² is the inverse of r')}</T>
      </At>
      <At from={3} frame={k}>
        <Tri c={[70, 95]} r={40} labels={[1, 2, 3]} />
        <Arrow from={[120, 95]} to={[200, 95]} color={C.v} /><T x={160} y={80} color={C.v} size={14} weight={600}>{t('r dulu, lalu f', 'r first, then f')}</T>
        <Tri c={[250, 95]} r={40} labels={[3, 2, 1]} /><T x={310} y={100} anchor="start" size={16} weight={600}>fr</T>
        <Tri c={[70, 215]} r={40} labels={[1, 2, 3]} />
        <Arrow from={[120, 215]} to={[200, 215]} color={C.y} /><T x={160} y={200} color={C.y} size={14} weight={600}>{t('f dulu, lalu r', 'f first, then r')}</T>
        <Tri c={[250, 215]} r={40} labels={[2, 1, 3]} /><T x={310} y={220} anchor="start" size={16} weight={600}>rf</T>
        <T x={322} y={166} size={26} weight={700} color={C.r}>≠</T>
        <T x={348} y={163} anchor="start" size={15} color={C.r} weight={600}>{t('urutan penting', 'order matters')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cyclic subgroups: stepping around Z12
const CK: P = [150, 150], hour12 = clock(CK, 112, 12)
const cyclic: Story = {
  title: b('Subgrup siklik: terus melangkah dengan langkah yang sama', 'Cyclic subgroups: keep taking the same step'),
  frames: [
    f('Mulai dari 0 di jam Z₁₂ dan terus tambahkan 3: 0, 3, 6, 9, lalu kembali ke 0. Empat jam ini membentuk subgrup siklik ⟨3⟩ yang dibangkitkan oleh 3. Ordenya 4.', 'Start at 0 on the Z₁₂ clock and keep adding 3: 0, 3, 6, 9, then back to 0. These four hours form the cyclic subgroup ⟨3⟩ generated by 3. Its order is 4.', String.raw`\langle3\rangle=\{0,3,6,9\}`),
    f('Coba langkah 5: 0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7. Semua jam dikunjungi, jadi 5 membangkitkan seluruh Z₁₂. Grup yang dibangkitkan satu unsur disebut siklik.', 'Try step 5: 0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7. Every hour is visited, so 5 generates all of Z₁₂. A group generated by one element is called cyclic.', String.raw`\langle5\rangle=\mathbb Z_{12}`),
    f('⟨3⟩ lolos uji subgrup: memuat 0, jumlah dua anggota tetap di dalam (6 + 9 = 15 = 3), dan invers setiap anggota juga di dalam (3 + 9 = 0, 6 + 6 = 0).', '⟨3⟩ passes the subgroup test: it contains 0, the sum of two members stays inside (6 + 9 = 15 = 3), and every member’s inverse is inside too (3 + 9 = 0, 6 + 6 = 0).', String.raw`a,b\in H\Rightarrow a+b\in H,\ -a\in H`),
    f('Sekarang geser penggeser. Ukuran ⟨g⟩ selalu 12 ÷ fpb(g, 12), jadi selalu pembagi 12. Z₁₂ punya tepat satu subgrup untuk setiap pembagi: 1, 2, 3, 4, 6, 12.', 'Now move the slider. The size of ⟨g⟩ is always 12 ÷ gcd(g, 12), so it always divides 12. Z₁₂ has exactly one subgroup for each divisor: 1, 2, 3, 4, 6, 12.', String.raw`|\langle g\rangle|=\frac{12}{\gcd(g,12)}`),
  ],
  control: { label: b('Langkah g', 'Step g'), min: 1, max: 11, step: 1, initial: 4 },
  controlFrom: 3,
  readout: g => String.raw`|\langle${g}\rangle|=12/\gcd(${g},12)=12/${gcd(g, 12)}=${12 / gcd(g, 12)}`,
  draw: (k, value, lang) => {
    const t = tr(lang), g = k === 1 ? 5 : k === 3 ? value : 3, order = 12 / gcd(g, 12)
    const visits = Array.from({ length: order + 1 }, (_, j) => (j * g) % 12), inside = new Set(visits)
    const lines = Array.from({ length: Math.ceil(visits.length / 5) }, (_, i) => visits.slice(i * 5, i * 5 + 5).join(' → ') + (i * 5 + 5 < visits.length ? ' →' : ''))
    return <>
      <circle cx={CK[0]} cy={CK[1]} r={112} fill="none" stroke={C.faint} />
      <path d={pl(visits.map(hour12))} fill={C.soft} fillOpacity=".5" stroke={C.a} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'all .45s' }} />
      <At from={2} until={2} frame={k}>
        <path d={pl([hour12(3), hour12(9)])} stroke={C.r} strokeWidth="2" strokeDasharray="6 5" />
      </At>
      {Array.from({ length: 12 }, (_, n) => <Node key={n} at={hour12(n)} label={n} fill={inside.has(n) ? C.a : C.bg} stroke={inside.has(n) ? C.a : C.ln} />)}
      <T x={292} y={60} anchor="start" size={20} weight={700} color={C.a}>⟨{g}⟩</T>
      <T x={292} y={92} anchor="start" size={13} color={C.mu}>{t('urutan kunjungan', 'visiting order')}</T>
      {lines.map((line, i) => <T key={i} x={292} y={116 + i * 22} anchor="start" size={14}>{line}</T>)}
      <T x={292} y={196} anchor="start" size={17} weight={600}>{t('orde', 'order')} = {order}</T>
      <At from={2} until={2} frame={k}>
        <T x={292} y={226} anchor="start" size={15} color={C.r}>3 + 9 = 12 = 0</T>
        <T x={292} y={250} anchor="start" size={13} color={C.mu}>{t('invers saling berhadapan', 'inverses sit opposite')}</T>
      </At>
      <At from={1} until={1} frame={k}><T x={292} y={226} anchor="start" size={15} color={C.g} weight={600}>{t('semua 12 jam: siklik', 'all 12 hours: cyclic')}</T></At>
    </>
  },
}

// ---------------------------------------------------------------- cosets: tile the clock
const CC: P = [150, 150], hourC = clock(CC, 112, 12), cosetColors = [C.a, C.r, C.g, C.y]
const cosets: Story = {
  title: b('Koset menutup grup tanpa tumpang tindih', 'Cosets tile the group without overlap'),
  frames: [
    f('Z₁₂ adalah jam dengan 12 angka. Operasinya menambah jam dan membungkus di 12: misalnya 9 + 5 = 14 = 2.', 'Z₁₂ is a clock with 12 hours. The operation adds hours and wraps around at 12: for example 9 + 5 = 14 = 2.'),
    f('H = {0, 4, 8} adalah subgrup: jumlah dua anggota H selalu kembali ke H (4 + 8 = 12 = 0). Di jam, H membentuk segitiga.', 'H = {0, 4, 8} is a subgroup: adding two members of H always lands back in H (4 + 8 = 12 = 0). On the clock, H forms a triangle.', String.raw`H=\{0,4,8\}`),
    f('Geser setiap anggota H sejauh 1 jam: 1 + H = {1, 5, 9}. Bentuknya sama, hanya diputar. Itulah koset.', 'Shift every member of H by one hour: 1 + H = {1, 5, 9}. Same shape, just rotated. That is a coset.', String.raw`1+H=\{1,5,9\}`),
    f('Geser 2 dan 3 jam memberi dua salinan lagi. Empat segitiga, masing-masing 3 titik, mengisi seluruh 12 titik tanpa ada yang dipakai dua kali.', 'Shifting by 2 and 3 hours gives two more copies. Four triangles of 3 points each cover all 12 points, none used twice.', String.raw`12=4\times3`),
    f('Teorema Lagrange: koset selalu berukuran sama dan tidak saling tumpang tindih, jadi ukuran subgrup harus membagi ukuran grup. Subgrup berukuran 5 di Z₁₂ mustahil.', 'Lagrange’s theorem: cosets always have equal size and never overlap, so a subgroup’s size must divide the group’s size. A subgroup of size 5 in Z₁₂ is impossible.', String.raw`|G|=[G:H]\,|H|\implies |H|\mid|G|`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const shown = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : 4
    const cosetOf = (n: number) => n % 4 < shown ? n % 4 : -1
    const inner = (n: number): P => [CC[0] + (hourC(n)[0] - CC[0]) * .72, CC[1] + (hourC(n)[1] - CC[1]) * .72], end = inner(2), r = 112 * .72
    return <>
      <circle cx={CC[0]} cy={CC[1]} r={112} fill="none" stroke={C.ln} />
      {[0, 1, 2, 3].map(s => <At key={s} from={s === 0 ? 1 : s === 1 ? 2 : 3} frame={k}>
        <path d={pl([hourC(s), hourC(s + 4), hourC(s + 8)], true)} fill={cosetColors[s]} fillOpacity=".12" stroke={cosetColors[s]} strokeWidth="2.5" />
      </At>)}
      <At until={0} frame={k}>
        <g stroke={C.v} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d={`M${inner(9)} A${r} ${r} 0 0 1 ${end}`} />
          <path d={`M${end[0] - 4},${end[1] - 12} L${end[0]},${end[1]} L${end[0] - 13},${end[1] + 2}`} />
        </g>
        <T x={CC[0]} y={CC[1] - 30} color={C.v} size={16} weight={600}>+5</T>
      </At>
      {Array.from({ length: 12 }, (_, n) => {
        const s = cosetOf(n), hot = k === 0 && (n === 9 || n === 2)
        return <Node key={n} at={hourC(n)} label={n} fill={s >= 0 ? cosetColors[s] : hot ? C.v : C.bg} stroke={s >= 0 ? cosetColors[s] : hot ? C.v : C.ln} />
      })}
      <At until={0} frame={k}><T x={300} y={120} anchor="start" size={18} color={C.v} weight={600}>9 + 5 = 14</T><T x={300} y={150} anchor="start" size={18} color={C.v} weight={600}>14 → 2</T><T x={300} y={178} anchor="start" size={13} color={C.mu}>{t('lewat 12, mulai lagi dari 0', 'past 12, start again at 0')}</T></At>
      {['H = {0, 4, 8}', '1+H = {1, 5, 9}', '2+H = {2, 6, 10}', '3+H = {3, 7, 11}'].map((txt, s) => <At key={s} from={s === 0 ? 1 : s === 1 ? 2 : 3} frame={k}>
        <rect x={296} y={58 + s * 38} width={14} height={14} rx={3} fill={cosetColors[s]} />
        <T x={318} y={70 + s * 38} anchor="start" size={15}>{txt}</T>
      </At>)}
      <At from={3} frame={k}><T x={296} y={232} anchor="start" size={17} weight={700} color={C.v}>12 = 4 × 3</T><T x={296} y={254} anchor="start" size={13} color={C.mu}>{t('4 koset × 3 anggota', '4 cosets × 3 members')}</T></At>
    </>
  },
}

// ---------------------------------------------------------------- kernel: fold a 12-hour clock onto a 3-hour clock
const K1: P = [130, 150], h12 = clock(K1, 100, 12), K2: P = [385, 140], h3 = clock(K2, 55, 3)
const kernel: Story = {
  title: b('Homomorfisma melipat; kernel adalah yang jatuh ke 0', 'A homomorphism folds; the kernel is what lands on 0'),
  frames: [
    f('φ(a) = sisa a dibagi 3 mengirim jam 12 ke jam 3. Misalnya 7 ↦ 1 dan 5 ↦ 2. Banyak jam jatuh ke jam yang sama: informasi "dilipat".', 'φ(a) = remainder of a divided by 3 sends the 12-hour clock to a 3-hour clock. For example 7 ↦ 1 and 5 ↦ 2. Many hours land on the same hour: information gets "folded".', String.raw`\varphi:\mathbb Z_{12}\to\mathbb Z_3,\ a\mapsto a\bmod3`),
    f('φ menghormati operasi: jumlahkan dulu lalu petakan, atau petakan dulu lalu jumlahkan, hasilnya sama. 7 + 5 = 12 = 0 ↦ 0, dan 1 + 2 = 3 = 0. Inilah arti homomorfisma.', 'φ respects the operation: add first then map, or map first then add, and you get the same answer. 7 + 5 = 12 = 0 ↦ 0, and 1 + 2 = 3 = 0. That is what a homomorphism means.', String.raw`\varphi(a+b)=\varphi(a)+\varphi(b)`),
    f('Kernel adalah semua yang jatuh ke 0: Ker φ = {0, 3, 6, 9}. Kernel mengukur seberapa banyak yang dilipat. φ satu-satu tepat ketika kernel hanya {0}.', 'The kernel is everything that lands on 0: Ker φ = {0, 3, 6, 9}. It measures how much is folded. φ is one-to-one exactly when the kernel is just {0}.', String.raw`\operatorname{Ker}\varphi=\{a:\varphi(a)=0\}=\{0,3,6,9\}`),
    f('Setiap keluaran punya tepat 4 asal, yaitu koset kernel: 1 + K jatuh ke 1, 2 + K jatuh ke 2. Kernel selalu subgrup normal: memutar dengan a lalu a⁻¹ tidak membawa keluar dari K.', 'Every output has exactly 4 sources, the cosets of the kernel: 1 + K lands on 1, 2 + K lands on 2. A kernel is always a normal subgroup: conjugating by a never leaves K.', String.raw`a^{-1}Ka=K\quad(K\lhd G)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const color = (n: number) => k >= 3 || (k === 2 && n % 3 === 0) || (k <= 1 && (n === 7 || n === 5 || (k === 1 && n === 0))) ? three[n % 3] : C.bg
    const arrows = k <= 1 ? [7, 5, ...(k === 1 ? [0] : [])] : k === 2 ? [0, 3, 6, 9] : []
    return <>
      <circle cx={K1[0]} cy={K1[1]} r={100} fill="none" stroke={C.faint} />
      <circle cx={K2[0]} cy={K2[1]} r={55} fill="none" stroke={C.faint} />
      {arrows.map(n => { const [p, q] = link(h12(n), h3(n % 3), 16, 21); return <Arrow key={`${k}-${n}`} from={p} to={q} color={three[n % 3]} width={2} dash="6 4" /> })}
      {Array.from({ length: 12 }, (_, n) => <Node key={n} at={h12(n)} label={n} fill={color(n)} stroke={color(n) === C.bg ? C.ln : color(n)} r={14} />)}
      {[0, 1, 2].map(n => <Node key={n} at={h3(n)} label={n} fill={three[n]} r={18} size={16} />)}
      <T x={28} y={32} anchor="start" size={14} color={C.mu}>ℤ₁₂</T>
      <T x={K2[0]} y={60} size={14} color={C.mu}>ℤ₃</T>
      <At until={1} frame={k}><T x={385} y={236} size={15}>7 ↦ 1,  5 ↦ 2</T></At>
      <At from={1} until={1} frame={k}><T x={385} y={262} size={15} color={C.v} weight={600}>7 + 5 = 0 ↦ 0 = 1 + 2</T></At>
      <At from={2} until={2} frame={k}><T x={385} y={240} size={16} weight={600} color={C.a}>Ker φ = {'{0, 3, 6, 9}'}</T><T x={385} y={264} size={13} color={C.mu}>{t('semua yang jatuh ke 0', 'everything landing on 0')}</T></At>
      <At from={3} frame={k}>
        {['K = {0,3,6,9} ↦ 0', '1+K = {1,4,7,10} ↦ 1', '2+K = {2,5,8,11} ↦ 2'].map((s, i) => <T key={i} x={278} y={226 + i * 24} anchor="start" size={14} color={three[i]} weight={600}>{s}</T>)}
      </At>
    </>
  },
}

// ---------------------------------------------------------------- factor groups: the folded classes become elements
const bagX = (i: number) => 18 + i * 92
const quotient: Story = {
  title: b('Grup faktor: setiap koset menjadi satu unsur', 'Factor group: each coset becomes one element'),
  frames: [
    f('Kumpulkan Z₁₂ ke dalam koset dari K = {0, 3, 6, 9}. Hasilnya tiga kantong: [0], [1], [2]. Mulai sekarang setiap kantong dianggap satu unsur.', 'Gather Z₁₂ into the cosets of K = {0, 3, 6, 9}. You get three bags: [0], [1], [2]. From now on each bag counts as one element.', String.raw`\mathbb Z_{12}/K=\{[0],[1],[2]\}`),
    f('Menjumlahkan kantong: ambil wakil mana saja lalu jumlahkan. [1] + [2]: 4 + 5 = 9 ada di [0]; 7 + 11 = 18 = 6 juga di [0]. Wakil berbeda, kantong hasil sama. Ini hanya selalu berhasil karena K normal.', 'Adding bags: pick any representative and add. [1] + [2]: 4 + 5 = 9 is in [0]; 7 + 11 = 18 = 6 is also in [0]. Different representatives, same resulting bag. This always works only because K is normal.', String.raw`(a+K)+(b+K)=(a+b)+K`),
    f('Tiga kantong dengan penjumlahan ini membentuk grup baru berukuran 12 ÷ 4 = 3: grup faktor G/K. Ia berputar seperti jam 3.', 'The three bags with this addition form a new group of size 12 ÷ 4 = 3: the factor group G/K. It cycles like a 3-hour clock.', String.raw`|G/K|=|G|/|K|=12/4=3`),
    f('Teorema isomorfisma pertama: kantong-kantong ini persis keluaran φ(a) = a mod 3. Kantong [a] ↦ φ(a) adalah isomorfisma. Jadi G dibagi kernel sama dengan bayangan φ.', 'First isomorphism theorem: these bags are exactly the outputs of φ(a) = a mod 3. The map [a] ↦ φ(a) is an isomorphism. So G divided by the kernel equals the image of φ.', String.raw`G/\operatorname{Ker}\varphi\cong\varphi(G)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), c3: P = [395, 115], h = clock(c3, 52, 3)
    return <>
      {[0, 1, 2].map(i => <g key={i}>
        <rect x={bagX(i)} y={40} width={82} height={140} rx={16} fill={three[i]} fillOpacity=".1" stroke={three[i]} strokeWidth="2.5" />
        {[i, i + 3, i + 6, i + 9].map((n, j) => <Node key={n} at={[bagX(i) + 24 + (j % 2) * 34, 76 + Math.floor(j / 2) * 62]} label={n} fill={k === 1 && [4, 5, 9].includes(n) ? three[i] : C.bg} stroke={three[i]} ink={k === 1 && [4, 5, 9].includes(n) ? C.bg : three[i]} />)}
        <T x={bagX(i) + 41} y={204} size={17} weight={700} color={three[i]}>[{i}]</T>
      </g>)}
      <At from={1} until={1} frame={k}>
        <T x={20} y={244} anchor="start" size={15}>[1] + [2]:  <tspan fill={C.r}>4</tspan> + <tspan fill={C.g}>5</tspan> = <tspan fill={C.a}>9</tspan> ∈ [0]</T>
        <T x={20} y={270} anchor="start" size={15}>{t('atau', 'or')}  <tspan fill={C.r}>7</tspan> + <tspan fill={C.g}>11</tspan> = 18 = <tspan fill={C.a}>6</tspan> ∈ [0]</T>
        <T x={395} y={150} size={15} color={C.v} weight={600}>{t('hasil sama ✓', 'same result ✓')}</T>
      </At>
      <At from={2} frame={k}>
        <circle cx={c3[0]} cy={c3[1]} r={52} fill="none" stroke={C.faint} />
        {[0, 1, 2].map(i => { const [p, q] = link(h(i), h((i + 1) % 3), 22, 24); return <Arrow key={i} from={p} to={q} color={C.mu} width={2} /> })}
        {[0, 1, 2].map(i => <Node key={i} at={h(i)} label={`[${i}]`} fill={three[i]} r={20} size={13} />)}
        <T x={395} y={214} size={15} weight={600}>|G/K| = 12/4 = 3</T>
        <T x={395} y={236} size={13} color={C.mu}>{t('panah: tambah [1]', 'arrows: add [1]')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={20} y={250} anchor="start" size={15}>[0] ↦ 0,   [1] ↦ 1,   [2] ↦ 2</T>
        <T x={20} y={276} anchor="start" size={17} weight={700} color={C.v}>ℤ₁₂ / Ker φ ≅ ℤ₃</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- permutations: loops and their order
const sigma = [2, 3, 1, 5, 4]
const TC: P = [115, 150], triPos = (i: number): P => { const a = rad(90 - 120 * i); return [TC[0] + 72 * Math.cos(a), TC[1] - 72 * Math.sin(a)] }
const pairPos = (i: number): P => [262, i ? 210 : 90]
const cycles: Story = {
  title: b('Permutasi = loop panah; orde = kapan semua pulang', 'Permutation = loops of arrows; order = when everyone is home'),
  frames: [
    f('Permutasi σ mengirim setiap angka ke tempat baru: 1 → 2, 2 → 3, 3 → 1, 4 → 5, 5 → 4. Baris atas adalah posisi awal, panah menunjuk ke mana tiap angka pergi.', 'A permutation σ sends each number to a new place: 1 → 2, 2 → 3, 3 → 1, 4 → 5, 5 → 4. The top row is the start; arrows show where each number goes.', String.raw`\sigma=\begin{pmatrix}1&2&3&4&5\\2&3&1&5&4\end{pmatrix}`),
    f('Ikuti panahnya: 1 → 2 → 3 → 1 adalah satu loop, dan 4 → 5 → 4 adalah loop lain. Itulah dekomposisi siklus σ = (1 2 3)(4 5). Loop yang terpisah tidak saling mengganggu.', 'Follow the arrows: 1 → 2 → 3 → 1 is one loop, and 4 → 5 → 4 is another. That is the cycle decomposition σ = (1 2 3)(4 5). Separate loops never interfere.', String.raw`\sigma=(1\,2\,3)(4\,5)`),
    f('Terapkan σ berulang kali dengan penggeser k. Penanda pada loop-3 pulang setiap 3 langkah, penanda pada loop-2 setiap 2 langkah.', 'Apply σ again and again with the slider k. The marker on the 3-loop is home every 3 steps, the marker on the 2-loop every 2 steps.'),
    f('Keduanya pulang bersamaan pertama kali di k = 6 = kpk(3, 2). Jadi orde permutasi adalah kpk panjang siklusnya: σ⁶ = e.', 'Both are home together for the first time at k = 6 = lcm(3, 2). So the order of a permutation is the lcm of its cycle lengths: σ⁶ = e.', String.raw`o(\sigma)=\operatorname{lcm}(3,2)=6`),
  ],
  control: { label: b('Berapa kali σ diterapkan, k', 'Times σ is applied, k'), min: 0, max: 12, step: 1, initial: 0 },
  controlFrom: 2,
  readout: k => String.raw`k=${k}:\quad k\bmod3=${k % 3},\quad k\bmod2=${k % 2}${k % 6 === 0 ? String.raw`\quad\Rightarrow\ \sigma^{${k}}=e` : ''}`,
  draw: (k, value, lang) => {
    const t = tr(lang), steps = k >= 2 ? value : 0, a3 = steps % 3, a2 = steps % 2, home = a3 === 0 && a2 === 0
    const top = (i: number): P => [80 + i * 80, 70], bot = (i: number): P => [80 + i * 80, 220]
    return <>
      <At until={0} frame={k}>
        {sigma.map((s, i) => { const [p, q] = link(top(i), bot(s - 1)); return <Arrow key={i} from={p} to={q} color={i < 3 ? C.a : C.r} width={2.5} /> })}
        {sigma.map((_, i) => <g key={i}><Node at={top(i)} label={i + 1} fill={C.bg} stroke={i < 3 ? C.a : C.r} ink={C.fg} r={17} size={15} /><Node at={bot(i)} label={i + 1} fill={C.bg} stroke={i < 3 ? C.a : C.r} ink={C.fg} r={17} size={15} /></g>)}
        <T x={240} y={36} size={13} color={C.mu}>{t('awal', 'start')}</T>
        <T x={240} y={268} size={13} color={C.mu}>{t('sesudah σ', 'after σ')}</T>
      </At>
      <At from={1} frame={k}>
        {[0, 1, 2].map(i => { const [p, q] = link(triPos(i), triPos((i + 1) % 3), 20, 22); return <Arrow key={i} from={p} to={q} color={C.a} width={2.5} /> })}
        <Arrow from={[275, 112]} to={[275, 188]} color={C.r} width={2.5} />
        <Arrow from={[249, 188]} to={[249, 112]} color={C.r} width={2.5} />
        {[0, 1, 2].map(i => <Node key={i} at={triPos(i)} label={i + 1} fill={C.bg} stroke={C.a} ink={C.fg} r={18} size={15} />)}
        {[0, 1].map(i => <Node key={i} at={pairPos(i)} label={i + 4} fill={C.bg} stroke={C.r} ink={C.fg} r={18} size={15} />)}
        <T x={TC[0]} y={262} size={16} weight={600} color={C.a}>(1 2 3)</T>
        <T x={262} y={262} size={16} weight={600} color={C.r}>(4 5)</T>
      </At>
      <At from={2} frame={k}>
        <circle cx={triPos(a3)[0]} cy={triPos(a3)[1]} r={25} fill="none" stroke={C.a} strokeWidth="4" style={{ transition: 'all .35s' }} />
        <circle cx={pairPos(a2)[0]} cy={pairPos(a2)[1]} r={25} fill="none" stroke={C.r} strokeWidth="4" style={{ transition: 'all .35s' }} />
        <T x={330} y={80} anchor="start" size={18} weight={700}>k = {steps}</T>
        <T x={330} y={116} anchor="start" size={15} color={C.a}>{t('loop-3', '3-loop')}: {a3 === 0 ? t('pulang ✓', 'home ✓') : t('jalan', 'away')}</T>
        <T x={330} y={142} anchor="start" size={15} color={C.r}>{t('loop-2', '2-loop')}: {a2 === 0 ? t('pulang ✓', 'home ✓') : t('jalan', 'away')}</T>
        {home && steps > 0 && <T x={330} y={182} anchor="start" size={17} weight={700} color={C.g}>σ<tspan baselineShift="super" fontSize={12}>{steps}</tspan> = e</T>}
      </At>
      <At from={3} frame={k}><T x={330} y={230} anchor="start" size={15} weight={600} color={C.v}>{t('orde = kpk(3, 2) = 6', 'order = lcm(3, 2) = 6')}</T></At>
    </>
  },
}

// ---------------------------------------------------------------- parity: count swaps
const Card = ({ x, y, n }: { x: number; y: number; n: number }) => <g style={{ transition: 'all .45s' }}><rect x={x - 24} y={y - 32} width={48} height={64} rx={8} fill={three[n - 1]} fillOpacity=".15" stroke={three[n - 1]} strokeWidth="2.5" /><T x={x} y={y + 7} size={20} weight={700} color={three[n - 1]}>{n}</T></g>
const parity: Story = {
  title: b('Paritas: hitung tukar-menukar, genap atau ganjil', 'Parity: count the swaps, even or odd'),
  frames: [
    f('Transposisi hanya menukar dua benda. (1 2) menukar 1 dan 2, yang lain diam.', 'A transposition swaps just two things. (1 2) swaps 1 and 2; everything else stays put.', String.raw`(1\,2):\ 1\mapsto2,\ 2\mapsto1`),
    f('Setiap siklus adalah rangkaian tukar. Cek (1 2 3) = (1 3)(1 2), dibaca kanan ke kiri: (1 2) dulu. Ikuti tiap angka melalui kedua tukar; hasilnya sama dengan (1 2 3).', 'Every cycle is a chain of swaps. Check (1 2 3) = (1 3)(1 2), read right to left: (1 2) first. Follow each number through both swaps; the result matches (1 2 3).', String.raw`(1\,2\,3)=(1\,3)(1\,2)`),
    f('Banyaknya tukar bisa berbeda-beda, tetapi genap/ganjilnya tidak pernah berubah. Siklus panjang k butuh k − 1 tukar. Hati-hati: siklus panjang genap adalah permutasi ganjil.', 'The number of swaps can vary, but whether it is even or odd never changes. A cycle of length k needs k − 1 swaps. Careful: a cycle of even length is an odd permutation.', String.raw`\sigma=\tau_1\cdots\tau_m\ \Rightarrow\ \operatorname{sgn}\sigma=(-1)^m`),
    f('Permutasi genap membentuk grup alternating Aₙ, tepat setengah Sₙ. Untuk S₃: 3 genap, 3 ganjil. Komposisi dua ganjil adalah genap, seperti (−1)(−1) = +1.', 'The even permutations form the alternating group Aₙ, exactly half of Sₙ. For S₃: 3 even, 3 odd. Two odd ones compose to an even one, just like (−1)(−1) = +1.', String.raw`|A_n|=\frac{n!}{2}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), col = [70, 190, 310, 420]
    const rows: [number, number, number][] = [[1, 2, 2], [2, 1, 3], [3, 3, 1]]
    const badges: [string, string, number][] = [['(1 2)', '1', -1], ['(1 2 3)', '2', 1], ['(1 2 3 4)', '3', -1], ['(1 2 3)(4 5)', '2 + 1 = 3', -1]]
    return <>
      <At until={0} frame={k}>
        {[1, 2, 3].map((n, i) => <Card key={n} x={120 + i * 90} y={80} n={n} />)}
        {[2, 1, 3].map((n, i) => <Card key={n} x={120 + i * 90} y={220} n={n} />)}
        <Arrow from={[124, 118]} to={[202, 182]} color={C.a} width={2} />
        <Arrow from={[206, 118]} to={[128, 182]} color={C.r} width={2} />
        <T x={360} y={86} anchor="start" size={14} color={C.mu}>{t('sebelum', 'before')}</T>
        <T x={360} y={226} anchor="start" size={14} color={C.mu}>{t('sesudah (1 2)', 'after (1 2)')}</T>
        <T x={300} y={156} size={13} color={C.mu}>{t('3 tidak bergerak', '3 stays')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {['x', '(1 2)', '(1 3)', '(1 2 3)'].map((h, i) => <T key={h} x={col[i]} y={50} size={15} weight={700} color={i === 3 ? C.v : C.mu}>{h}</T>)}
        <T x={250} y={74} size={12} color={C.mu}>{t('(1 2) dulu, lalu (1 3)', '(1 2) first, then (1 3)')}</T>
        {rows.map(([x, y, z], r) => <g key={r}>
          <Node at={[col[0], 115 + r * 58]} label={x} fill={three[x - 1]} r={17} size={15} />
          <Arrow from={[col[0] + 22, 115 + r * 58]} to={[col[1] - 22, 115 + r * 58]} color={C.mu} width={2} />
          <Node at={[col[1], 115 + r * 58]} label={y} fill={three[y - 1]} r={17} size={15} />
          <Arrow from={[col[1] + 22, 115 + r * 58]} to={[col[2] - 22, 115 + r * 58]} color={C.mu} width={2} />
          <Node at={[col[2], 115 + r * 58]} label={z} fill={three[z - 1]} r={17} size={15} />
          <T x={col[3]} y={120 + r * 58} size={16} weight={600} color={C.v}>{x} ↦ {z} ✓</T>
        </g>)}
      </At>
      <At from={2} until={2} frame={k}>
        {[t('permutasi', 'permutation'), t('jumlah tukar', 'swaps'), t('paritas', 'parity')].map((h, i) => <T key={h} x={[90, 250, 400][i]} y={50} size={14} weight={700} color={C.mu}>{h}</T>)}
        {badges.map(([p, s, sign], i) => <g key={p}>
          <T x={90} y={98 + i * 50} size={17} weight={600}>{p}</T>
          <T x={250} y={98 + i * 50} size={16}>{s}</T>
          <rect x={350} y={78 + i * 50} width={100} height={28} rx={14} fill={sign > 0 ? C.g : C.r} fillOpacity=".18" stroke={sign > 0 ? C.g : C.r} />
          <T x={400} y={98 + i * 50} size={14} weight={700} color={sign > 0 ? C.g : C.r}>{sign > 0 ? t('genap +1', 'even +1') : t('ganjil −1', 'odd −1')}</T>
        </g>)}
      </At>
      <At from={3} frame={k}>
        {[[t('genap: A₃', 'even: A₃'), ['e', '(1 2 3)', '(1 3 2)'], C.g, 30], [t('ganjil', 'odd'), ['(1 2)', '(1 3)', '(2 3)'], C.r, 250]].map(([h, items, c, x]) => <g key={String(h)}>
          <rect x={Number(x)} y={40} width={200} height={190} rx={14} fill={String(c)} fillOpacity=".1" stroke={String(c)} strokeWidth="2" />
          <T x={Number(x) + 100} y={70} size={16} weight={700} color={String(c)}>{h}</T>
          {(items as string[]).map((s, i) => <T key={s} x={Number(x) + 100} y={115 + i * 38} size={18}>{s}</T>)}
        </g>)}
        <T x={240} y={270} size={16} weight={600} color={C.v}>|A₃| = 3 = 3!/2</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- rings: multiplication tables
const Table = ({ n, x0, y0, k, cell = 28 }: { n: number; x0: number; y0: number; k: number; cell?: number }) => <g>
  {Array.from({ length: n }, (_, i) => <g key={i}>
    <T x={x0 + (i + 1.5) * cell} y={y0 + cell * .68} size={13} weight={700} color={C.mu}>{i}</T>
    <T x={x0 + cell / 2} y={y0 + (i + 1) * cell + cell * .68} size={13} weight={700} color={C.mu}>{i}</T>
  </g>)}
  <T x={x0 + cell / 2} y={y0 + cell * .68} size={13} weight={700} color={C.v}>×</T>
  {Array.from({ length: n * n }, (_, i) => {
    const a = Math.floor(i / n), c = i % n, v = (a * c) % n, zd = k >= 1 && v === 0 && a && c, unit = k >= 2 && v === 1
    return <g key={i}>
      <rect x={x0 + (c + 1) * cell} y={y0 + (a + 1) * cell} width={cell} height={cell} fill={zd ? C.r : unit ? C.g : 'none'} fillOpacity=".3" stroke={C.faint} style={{ transition: 'fill .45s' }} />
      <T x={x0 + (c + 1.5) * cell} y={y0 + (a + 1) * cell + cell * .68} size={13} weight={zd || unit ? 700 : 400}>{v}</T>
    </g>
  })}
</g>
const ring: Story = {
  title: b('Gelanggang: tabel perkalian yang bercerita', 'Rings: what the multiplication table tells you'),
  frames: [
    f('Gelanggang punya + dan × yang bekerja sama lewat sifat distributif. Z₆ adalah contohnya; inilah tabel perkaliannya (sisa bagi 6).', 'A ring has + and × that cooperate through the distributive law. Z₆ is an example; here is its multiplication table (remainders mod 6).', String.raw`a(b+c)=ab+ac`),
    f('Sel merah: hasil 0 dari dua bilangan yang bukan 0. Misalnya 2 · 3 = 6 = 0. Bilangan seperti 2, 3, 4 disebut pembagi nol. Akibatnya pembatalan gagal: 2 · 3 = 2 · 0 tetapi 3 ≠ 0.', 'Red cells: a product of 0 from two nonzero numbers. For example 2 · 3 = 6 = 0. Numbers like 2, 3, 4 are called zero divisors. As a result cancellation fails: 2 · 3 = 2 · 0 but 3 ≠ 0.', String.raw`2\cdot3\equiv0\pmod 6`),
    f('Sel hijau: hasil 1. Baris dengan sel hijau adalah unit (punya invers): 1 dan 5, tepat bilangan yang fpb-nya dengan 6 sama dengan 1. Setiap bilangan tak nol di Zₙ adalah unit atau pembagi nol.', 'Green cells: a product of 1. Rows with a green cell are units (they have inverses): 1 and 5, exactly the numbers with gcd 1 with 6. Every nonzero element of Zₙ is a unit or a zero divisor.', b(String.raw`[a]\ \text{unit}\iff\gcd(a,n)=1`, String.raw`[a]\ \text{unit}\iff\gcd(a,n)=1`)),
    f('Bandingkan Z₅: tidak ada sel merah, dan setiap baris tak nol punya tepat satu sel hijau. Semua bilangan tak nol punya invers, jadi Z₅ adalah lapangan. Zₙ lapangan tepat ketika n prima.', 'Compare Z₅: no red cells, and every nonzero row has exactly one green cell. Every nonzero number has an inverse, so Z₅ is a field. Zₙ is a field exactly when n is prime.', b(String.raw`\mathbb Z_n\ \text{lapangan}\iff n\ \text{prima}`, String.raw`\mathbb Z_n\ \text{field}\iff n\ \text{prime}`)),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <T x={118} y={34} size={15} weight={700}>{t('× di ℤ₆', '× in ℤ₆')}</T>
      <Table n={6} x0={20} y0={48} k={k} />
      <At until={2} frame={k}>
        <At until={0} frame={k}>
          <T x={245} y={90} anchor="start" size={15}>2 · (3 + 4) = 2 · 1 = 2</T>
          <T x={245} y={118} anchor="start" size={15}>2·3 + 2·4 = 0 + 2 = 2 ✓</T>
          <T x={245} y={150} anchor="start" size={13} color={C.mu}>{t('distributif berlaku', 'distributive law holds')}</T>
        </At>
        <At from={1} frame={k}><T x={245} y={100} anchor="start" size={15} weight={600} color={C.r}>{t('merah: pembagi nol', 'red: zero divisors')}</T><T x={245} y={126} anchor="start" size={14}>2 · 3 = 0, 3 · 4 = 0</T></At>
        <At from={2} frame={k}><T x={245} y={176} anchor="start" size={15} weight={600} color={C.g}>{t('hijau: unit 1 dan 5', 'green: units 1 and 5')}</T><T x={245} y={202} anchor="start" size={14}>5 · 5 = 25 = 1</T></At>
      </At>
      <At from={3} frame={k}>
        <T x={378} y={34} size={15} weight={700}>{t('× di ℤ₅', '× in ℤ₅')}</T>
        <Table n={5} x0={294} y0={48} k={k} />
        <T x={378} y={250} size={14} weight={600} color={C.g}>{t('tanpa merah: lapangan', 'no red: a field')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ideals: multiples of 3 on the number line
const nx = (n: number) => 40 + (n + 6) * 25, LY = 150
const ideal: Story = {
  title: b('Ideal: himpunan yang menelan perkalian', 'Ideals: sets that swallow multiplication'),
  frames: [
    f('Di ℤ, ambil semua kelipatan 3: …, −6, −3, 0, 3, 6, 9, …. Himpunan ini ditulis (3).', 'In ℤ, take all multiples of 3: …, −6, −3, 0, 3, 6, 9, …. This set is written (3).', String.raw`(3)=\{3m:m\in\mathbb Z\}`),
    f('(3) menelan perkalian: bilangan bulat apa pun dikali kelipatan 3 tetap kelipatan 3 (2 · 3 = 6, −1 · 6 = −6). Jumlah dua kelipatan 3 juga tetap di dalam. Sifat menelan ini yang membuat (3) ideal.', '(3) swallows multiplication: any integer times a multiple of 3 is still a multiple of 3 (2 · 3 = 6, −1 · 6 = −6). The sum of two multiples of 3 stays inside too. This swallowing property is what makes (3) an ideal.', String.raw`r\in\mathbb Z,\ a\in I\Rightarrow ra\in I`),
    f('Gelanggang kuosien ℤ/(3): anggap dua bilangan sama jika selisihnya di (3). Garis bilangan menjadi tiga warna yang berulang: [0], [1], [2]. Ini sama dengan ℤ₃.', 'The quotient ring ℤ/(3): treat two numbers as equal when their difference lies in (3). The number line turns into three repeating colors: [0], [1], [2]. This is the same as ℤ₃.', String.raw`\mathbb Z/(3)\cong\mathbb Z_3`),
    f('(3) maksimal: tidak ada ideal di antara (3) dan ℤ, karena 3 prima. Tandanya ℤ/(3) lapangan: 2 · 2 = 4 = 1. Sebaliknya (6) tidak maksimal, sebab (6) ⊂ (3) ⊂ ℤ, dan di ℤ/(6) ada 2 · 3 = 0.', '(3) is maximal: no ideal fits between (3) and ℤ, because 3 is prime. The sign is that ℤ/(3) is a field: 2 · 2 = 4 = 1. By contrast (6) is not maximal, since (6) ⊂ (3) ⊂ ℤ, and ℤ/(6) has 2 · 3 = 0.', b(String.raw`M\ \text{maksimal}\iff R/M\ \text{lapangan}`, String.raw`M\ \text{maximal}\iff R/M\ \text{field}`)),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), ns = Array.from({ length: 17 }, (_, i) => i - 6), m3 = (n: number) => ((n % 3) + 3) % 3
    const hop = (a: number, c: number, color: string, label: string) => <g><path d={`M${nx(a)},${LY - 14} Q${(nx(a) + nx(c)) / 2},${LY - 14 - Math.abs(nx(c) - nx(a)) * .45} ${nx(c)},${LY - 14}`} fill="none" stroke={color} strokeWidth="2.5" /><Dot at={[nx(c), LY - 14]} color={color} r={4} /><T x={(nx(a) + nx(c)) / 2} y={LY - 20 - Math.abs(nx(c) - nx(a)) * .25} size={14} weight={600} color={color}>{label}</T></g>
    return <>
      <path d={`M25,${LY} H455`} stroke={C.ln} strokeWidth="1.5" />
      {ns.map(n => { const fill = k >= 2 ? three[m3(n)] : m3(n) === 0 ? C.a : C.bg; return <g key={n}>
        <circle cx={nx(n)} cy={LY} r={9} fill={fill} stroke={fill === C.bg ? C.ln : fill} strokeWidth="2" style={{ transition: 'fill .45s' }} />
        {k >= 3 && n % 6 === 0 && <circle cx={nx(n)} cy={LY} r={14} fill="none" stroke={C.v} strokeWidth="2.5" />}
        <T x={nx(n)} y={LY + 30} size={13} color={m3(n) === 0 || k >= 2 ? C.fg : C.mu} weight={m3(n) === 0 ? 700 : 400}>{String(n).replace('-', '−')}</T>
      </g> })}
      <At until={0} frame={k}><T x={240} y={240} size={17} weight={600} color={C.a}>(3) = {'{…, −6, −3, 0, 3, 6, 9, …}'}</T></At>
      <At from={1} until={1} frame={k}>
        {hop(3, 6, C.g, '× 2')}
        {hop(6, -6, C.r, '× (−1)')}
        <T x={240} y={232} size={15}>{t('kelipatan 3 × bilangan bulat apa pun', 'multiple of 3 × any integer')}</T>
        <T x={240} y={256} size={15} weight={600} color={C.a}>= {t('tetap kelipatan 3', 'still a multiple of 3')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        {['[0] = {…, −3, 0, 3, …}', '[1] = {…, −2, 1, 4, …}', '[2] = {…, −1, 2, 5, …}'].map((s, i) => <T key={i} x={240} y={222 + i * 24} size={14} weight={600} color={three[i]}>{s}</T>)}
      </At>
      <At from={3} frame={k}>
        {['(6)', '(3)', 'ℤ'].map((s, i) => <g key={s}><rect x={110 + i * 100} y={40} width={64} height={36} rx={10} fill={i === 1 ? C.soft : 'none'} stroke={i === 0 ? C.v : C.a} strokeWidth="2" /><T x={142 + i * 100} y={64} size={16} weight={700}>{s}</T>{i < 2 && <T x={192 + i * 100} y={64} size={18}>⊂</T>}</g>)}
        <T x={240} y={232} size={15} color={C.g} weight={600}>ℤ/(3): 2 · 2 = 4 = 1 → {t('lapangan, (3) maksimal', 'field, (3) maximal')}</T>
        <T x={240} y={258} size={15} color={C.v}>ℤ/(6): 2 · 3 = 0 → {t('(6) tidak maksimal', '(6) not maximal')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- polynomial division: like integers
const pp = plane([270, 160], 60), py = (x: number, y: number) => pp(x, y / 5), pq = (x: number, y: number) => pp(x, y * 2 / 3)
const division: Story = {
  title: b('Polinom dibagi seperti bilangan bulat', 'Polynomials divide like integers'),
  frames: [
    f('Ingat pembagian bilangan bulat: 17 = 3 · 5 + 2. Tiga blok berisi 5, dan sisa 2 lebih kecil dari 5.', 'Recall integer division: 17 = 3 · 5 + 2. Three blocks of 5, and a remainder 2 that is smaller than 5.', String.raw`17=3\cdot5+2,\quad 0\le2<5`),
    f('F[x] bekerja sama, dengan derajat sebagai ukuran. Bagi f = x³ + 2x + 1 oleh g = x + 1: hasil bagi x² − x + 3, sisa −2. Derajat sisa (0) lebih kecil dari derajat g (1).', 'F[x] works the same way, with degree as the size. Divide f = x³ + 2x + 1 by g = x + 1: quotient x² − x + 3, remainder −2. The remainder’s degree (0) is smaller than g’s degree (1).', String.raw`f=qg+r,\ \deg r<\deg g`),
    f('Teorema sisa: membagi oleh x − a memberi sisa f(a). Di sini x + 1 = x − (−1), dan grafik f melewati (−1, −2): sisa −2. Jika f(a) = 0 maka x − a adalah faktor.', 'Remainder theorem: dividing by x − a leaves remainder f(a). Here x + 1 = x − (−1), and the graph of f passes through (−1, −2): remainder −2. If f(a) = 0 then x − a is a factor.', String.raw`f(-1)=-1-2+1=-2`),
    f('Polinom tak tereduksi berperan seperti bilangan prima. x² − 2 tak tereduksi atas ℚ, sebab akarnya ±√2 tidak rasional, tetapi atas ℝ ia = (x − √2)(x + √2). x² + 1 tidak memotong sumbu sama sekali.', 'Irreducible polynomials play the role of primes. x² − 2 is irreducible over ℚ, since its roots ±√2 are not rational, but over ℝ it equals (x − √2)(x + √2). x² + 1 never crosses the axis at all.', b(String.raw`x^2-2=(x-\sqrt2)(x+\sqrt2)\ \text{atas}\ \mathbb R`, String.raw`x^2-2=(x-\sqrt2)(x+\sqrt2)\ \text{over}\ \mathbb R`)),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={1} frame={k}>
        {Array.from({ length: 17 }, (_, i) => { const blk = Math.floor(i / 5), left = blk === 3; return <rect key={i} x={40 + i * 22 + blk * 8} y={50} width={18} height={30} rx={4} fill={left ? C.r : blk % 2 ? C.v : C.a} fillOpacity={left ? .8 : .6} /> })}
        {[0, 1, 2].map(i => <T key={i} x={40 + i * 118 + 53} y={102} size={14} color={C.mu}>5</T>)}
        <T x={40 + 15 * 22 + 24 + 20} y={102} size={14} color={C.r} weight={600}>{t('sisa 2', 'rem. 2')}</T>
        <T x={240} y={140} size={18} weight={600}>17 = 3 · 5 + 2</T>
      </At>
      <At from={1} until={1} frame={k}>
        {[[t('dibagi', 'dividend'), '17', 'x³ + 2x + 1', C.fg], [t('pembagi', 'divisor'), '5', 'x + 1', C.a], [t('hasil bagi', 'quotient'), '3', 'x² − x + 3', C.v], [t('sisa', 'remainder'), '2', '−2', C.r]].map(([h, n, poly, c], i) => <g key={i}>
          <T x={78 + i * 108} y={184} size={13} color={C.mu}>{h}</T>
          <T x={78 + i * 108} y={214} size={18} weight={700} color={c}>{n}</T>
          <T x={78 + i * 108} y={244} size={16} weight={600} color={c}>{poly}</T>
        </g>)}
        <T x={240} y={278} size={14} color={C.r}>{t('ukuran sisa < ukuran pembagi: 2 < 5, derajat 0 < 1', 'remainder smaller than divisor: 2 < 5, degree 0 < 1')}</T>
      </At>
      <At from={2} frame={k}>
        <Clip id="div-plot" x={30} y={20} w={420} h={262}>
          <path d={`M30,${pp(0, 0)[1]} H450 M${pp(0, 0)[0]},20 V282`} stroke={C.ln} strokeWidth="1.4" />
          {[-3, -2, -1, 1, 2].map(x => <T key={x} x={pp(x, 0)[0]} y={pp(0, 0)[1] - 8} size={12} color={C.mu}>{String(x).replace('-', '−')}</T>)}
          <At until={2} frame={k}>
            <path d={fn(x => py(x, x ** 3 + 2 * x + 1), -2.2, 1.8)} fill="none" stroke={C.a} strokeWidth="3" />
            <path d={`M${py(-1, -2)[0]},${py(-1, -2)[1]} H${pp(0, 0)[0]}`} stroke={C.r} strokeDasharray="5 5" />
            <Dot at={py(-1, -2)} color={C.r} r={7} />
            <T x={py(-1, -2)[0] - 12} y={py(-1, -2)[1] + 26} anchor="end" size={15} weight={600} color={C.r}>f(−1) = −2 = {t('sisa', 'remainder')}</T>
            <T x={py(1.5, 7.4)[0] - 10} y={60} anchor="end" size={15} color={C.a} weight={600}>y = x³ + 2x + 1</T>
          </At>
          <At from={3} frame={k}>
            <path d={fn(x => pq(x, x * x - 2), -2.6, 2.6)} fill="none" stroke={C.a} strokeWidth="3" />
            <path d={fn(x => pq(x, x * x + 1), -2.6, 2.6)} fill="none" stroke={C.g} strokeWidth="3" />
            {[-1, 1].map(s => <g key={s}><Dot at={pp(s * Math.SQRT2, 0)} color={C.a} r={6} /><T x={pp(s * Math.SQRT2, 0)[0] + s * 16} y={pp(0, 0)[1] + 22} size={14} weight={600} color={C.a}>{s < 0 ? '−√2' : '√2'}</T></g>)}
            <path d="M44,236 h26" stroke={C.g} strokeWidth="3" /><T x={78} y={241} anchor="start" size={15} weight={600} color={C.g}>x² + 1</T>
            <path d="M44,262 h26" stroke={C.a} strokeWidth="3" /><T x={78} y={267} anchor="start" size={15} weight={600} color={C.a}>x² − 2</T>
            <T x={440} y={270} anchor="end" size={13} color={C.mu}>{t('akar ±√2 tidak rasional', 'roots ±√2 are not rational')}</T>
          </At>
        </Clip>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- Eisenstein: a three-box checklist
const Box = ({ x, v, term, tone }: { x: number; v: number; term: string; tone?: string }) => <g>
  <rect x={x} y={60} width={76} height={56} rx={10} fill={tone ?? C.bg} fillOpacity={tone ? .15 : 1} stroke={tone ?? C.ln} strokeWidth="2" style={{ transition: 'all .45s' }} />
  <T x={x + 38} y={96} size={22} weight={700}>{v}</T>
  <T x={x + 38} y={138} size={14} color={C.mu}>{term}</T>
</g>
const eisenstein: Story = {
  title: b('Eisenstein: daftar periksa tiga syarat', 'Eisenstein: a three-item checklist'),
  frames: [
    f('Apakah f = x³ + 6x + 3 bisa difaktorkan atas ℚ? Tulis koefisiennya dalam kotak: 1, 0, 6, 3. Pilih prima p = 3.', 'Can f = x³ + 6x + 3 be factored over ℚ? Put its coefficients in boxes: 1, 0, 6, 3. Pick the prime p = 3.', String.raw`f=1x^3+0x^2+6x+3,\quad p=3`),
    f('Syarat 1: p membagi semua koefisien kecuali yang terdepan. 3 | 0, 3 | 6, 3 | 3. Lolos.', 'Condition 1: p divides every coefficient except the leading one. 3 | 0, 3 | 6, 3 | 3. Passed.', String.raw`p\mid a_1,\dots,a_n`),
    f('Syarat 2: p tidak membagi koefisien terdepan: 3 ∤ 1. Syarat 3: p² tidak membagi suku konstan: 9 ∤ 3. Keduanya lolos.', 'Condition 2: p does not divide the leading coefficient: 3 ∤ 1. Condition 3: p² does not divide the constant term: 9 ∤ 3. Both pass.', String.raw`p\nmid a_0,\quad p^2\nmid a_n`),
    f('Ketiganya lolos, jadi f tak tereduksi atas ℚ. Lemma Gauss menjamin bahwa memfaktorkan atas ℚ tidak lebih mudah daripada atas ℤ, sehingga pemeriksaan bilangan bulat ini cukup.', 'All three pass, so f is irreducible over ℚ. Gauss’s lemma guarantees that factoring over ℚ is no easier than over ℤ, so this integer check is enough.', b(String.raw`\Rightarrow f\ \text{tak tereduksi atas}\ \mathbb Q`, String.raw`\Rightarrow f\ \text{irreducible over}\ \mathbb Q`)),
    f('Kalau tidak ada prima yang cocok, coba geser x. x⁴ + x³ + x² + x + 1 gagal untuk semua p, tetapi setelah x diganti x + 1 koefisiennya 1, 5, 10, 10, 5, dan p = 5 lolos. Ingat: Eisenstein syarat cukup, bukan perlu.', 'If no prime fits, try shifting x. x⁴ + x³ + x² + x + 1 fails for every p, but after replacing x by x + 1 the coefficients are 1, 5, 10, 10, 5, and p = 5 passes. Remember: Eisenstein is sufficient, not necessary.', String.raw`f(x+1)=x^4+5x^3+10x^2+10x+5`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), coeffs = [1, 0, 6, 3], terms = ['x³', 'x²', 'x', '1']
    const tone = (i: number) => k >= 2 && i === 0 ? C.g : k >= 1 && i > 0 ? C.g : undefined
    return <>
      <At until={3} frame={k}>
        {coeffs.map((v, i) => <Box key={i} x={40 + i * 100} v={v} term={terms[i]} tone={tone(i)} />)}
        <T x={445} y={96} size={17} weight={700} color={C.v}>p = 3</T>
        <At from={1} frame={k}>{[1, 2, 3].map(i => <T key={i} x={78 + i * 100} y={170} size={15} weight={600} color={C.g}>3 | {coeffs[i]} ✓</T>)}</At>
        <At from={2} frame={k}>
          <T x={78} y={170} size={15} weight={600} color={C.g}>3 ∤ 1 ✓</T>
          <T x={378} y={192} size={15} weight={600} color={C.g}>9 ∤ 3 ✓</T>
        </At>
        {[t('① p membagi semua kecuali terdepan', '① p divides all but the leading one'), t('② p ∤ koefisien terdepan', '② p ∤ leading coefficient'), t('③ p² ∤ suku konstan', '③ p² ∤ constant term')].map((txt, i) => {
          const ok = k >= (i === 0 ? 1 : 2)
          return <T key={i} x={36} y={228 + i * 24} anchor="start" size={14} weight={ok ? 600 : 400} color={ok ? C.g : C.mu}>{txt} {ok ? '✓' : '…'}</T>
        })}
        <At from={3} frame={k}>
          <rect x={330} y={214} width={130} height={62} rx={12} fill={C.soft} stroke={C.a} strokeWidth="2" />
          <T x={395} y={240} size={15} weight={700} color={C.a}>{t('tak tereduksi', 'irreducible')}</T>
          <T x={395} y={263} size={15} weight={700} color={C.a}>{t('atas ℚ', 'over ℚ')}</T>
        </At>
      </At>
      <At from={4} frame={k}>
        <T x={240} y={36} size={15}>x⁴ + x³ + x² + x + 1: <tspan fill={C.r} fontWeight={700}>{t('tidak ada p ✗', 'no p works ✗')}</tspan></T>
        {[1, 5, 10, 10, 5].map((v, i) => <Box key={i} x={22 + i * 88} v={v} term={['x⁴', 'x³', 'x²', 'x', '1'][i]} tone={C.g} />)}
        <T x={240} y={180} size={15} color={C.mu}>{t('setelah x ↦ x + 1', 'after x ↦ x + 1')}</T>
        <T x={240} y={222} size={16} weight={600} color={C.g}>p = 5: 5 | 5, 10, 10, 5 ✓</T>
        <T x={240} y={250} size={16} weight={600} color={C.g}>5 ∤ 1 ✓{'    '}25 ∤ 5 ✓</T>
      </At>
    </>
  },
}

export const ALGEBRA_STORIES: Partial<Record<VisualKind, Story>> = { group, cyclic, cosets, kernel, quotient, cycles, parity, ring, ideal, division, eisenstein }
