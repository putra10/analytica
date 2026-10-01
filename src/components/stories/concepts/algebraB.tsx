import type { ReactNode } from 'react'
import { At, Arrow, C, Dot, T, b, f, fn, pl, tr, Clip, type P, type Story } from '../kit'

// ---------------------------------------------------------------- local helpers (copied in spirit from algebra.tsx)
const three = [C.a, C.r, C.g], four = [C.a, C.r, C.g, C.y]
const mod = (a: number, n: number) => ((a % n) + n) % n
const gcd = (a: number, m: number): number => m ? gcd(m, a % m) : Math.abs(a)
const neg = (n: number | string) => String(n).replace('-', '−')
const Node = ({ at, label, fill, stroke = fill, r = 15, size = 14, ink }: { at: P; label: ReactNode; fill: string; stroke?: string; r?: number; size?: number; ink?: string }) =>
  <g style={{ transition: 'all .45s' }}><circle cx={at[0]} cy={at[1]} r={r} fill={fill} stroke={stroke} strokeWidth="2" /><T halo={false} x={at[0]} y={at[1] + size / 3} size={size} weight={600} color={ink ?? (fill === C.bg ? C.fg : C.bg)}>{label}</T></g>
/** Arrow between two node circles, trimmed so it starts and ends at their rims. */
const link = (p: P, q: P, r1 = 17, r2 = 19): [P, P] => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]), u = [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; return [[p[0] + u[0] * r1, p[1] + u[1] * r1], [q[0] - u[0] * r2, q[1] - u[1] * r2]] }
const Link = ({ p, q, color, width = 2.5, r1 = 17, r2 = 19, dash }: { p: P; q: P; color: string; width?: number; r1?: number; r2?: number; dash?: string }) => { const [a, z] = link(p, q, r1, r2); return <Arrow from={a} to={z} color={color} width={width} dash={dash} head={9} /> }
/** Rounded box with a centered label; `tone` tints it. */
const Chip = ({ x, y, w, h = 30, label, tone, size = 15, weight = 600, ink }: { x: number; y: number; w: number; h?: number; label: ReactNode; tone?: string; size?: number; weight?: number; ink?: string }) =>
  <g style={{ transition: 'all .45s' }}><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} fill={tone ?? C.bg} fillOpacity={tone ? .15 : 1} stroke={tone ?? C.ln} strokeWidth="2" /><T x={x} y={y + size / 3} size={size} weight={weight} color={ink ?? C.fg}>{label}</T></g>
/** Operation table with headers; `tone(r, c)` colors a cell. */
const Grid2 = ({ x0, y0, cell, heads, val, sym, tone }: { x0: number; y0: number; cell: number; heads: string[]; val: (r: number, c: number) => string; sym: string; tone?: (r: number, c: number) => string | undefined }) => {
  const ty = cell / 2 + 4.5
  return <g>
    <T x={x0 + cell / 2} y={y0 + ty} size={14} weight={700} color={C.v}>{sym}</T>
    {heads.map((h, i) => <g key={i}>
      <T x={x0 + (i + 1.5) * cell} y={y0 + ty} size={13} weight={700} color={C.mu}>{h}</T>
      <T x={x0 + cell / 2} y={y0 + (i + 1) * cell + ty} size={13} weight={700} color={C.mu}>{h}</T>
    </g>)}
    {heads.map((_, r) => heads.map((_, c) => { const tn = tone?.(r, c); return <g key={`${r}-${c}`}>
      <rect x={x0 + (c + 1) * cell} y={y0 + (r + 1) * cell} width={cell} height={cell} fill={tn ?? 'none'} fillOpacity=".3" stroke={C.faint} style={{ transition: 'fill .45s' }} />
      <T x={x0 + (c + 1.5) * cell} y={y0 + (r + 1) * cell + ty} size={13} weight={tn ? 700 : 400}>{val(r, c)}</T>
    </g> }))}
  </g>
}

// ---------------------------------------------------------------- cycles:0 composition, right factor first
const sig12 = [2, 1, 3], tau23 = [1, 3, 2]
const Ladder = ({ x0, first, second, only }: { x0: number; first: number[]; second: number[]; only?: number }) => {
  const pos = (row: number, n: number): P => [x0 + (n - 1) * 55, 62 + row * 90]
  return <g>
    {[1, 2, 3].map(s => {
      const m = first[s - 1], e = second[m - 1], on = only === undefined || only === s, col = on ? three[s - 1] : C.faint
      return <g key={s}><Link p={pos(0, s)} q={pos(1, m)} color={col} width={on ? 3 : 2} /><Link p={pos(1, m)} q={pos(2, e)} color={col} width={on ? 3 : 2} /></g>
    })}
    {[0, 1, 2].map(row => [1, 2, 3].map(n => <Node key={`${row}-${n}`} at={pos(row, n)} label={n} fill={C.bg} stroke={C.ln} ink={C.fg} />))}
  </g>
}
const composition: Story = {
  title: b('Komposisi permutasi: faktor kanan bekerja dulu', 'Permutation composition: the right factor acts first'),
  frames: [
    f('Ambil σ = (1 2) dan τ = (2 3). Produk στ dibaca seperti komposisi fungsi: τ bekerja dulu, baru σ. Ikuti 1: τ menahan 1, lalu σ mengirim 1 ke 2.', 'Take σ = (1 2) and τ = (2 3). The product στ reads like function composition: τ acts first, then σ. Follow 1: τ fixes 1, then σ sends 1 to 2.', String.raw`(\sigma\tau)(1)=\sigma(\tau(1))=\sigma(1)=2`),
    f('Lakukan hal yang sama untuk 2 dan 3: 2 ↦ 3 ↦ 3 dan 3 ↦ 2 ↦ 1. Jadi στ mengirim 1 → 2 → 3 → 1, yaitu στ = (1 2 3).', 'Do the same for 2 and 3: 2 ↦ 3 ↦ 3 and 3 ↦ 2 ↦ 1. So στ sends 1 → 2 → 3 → 1, that is στ = (1 2 3).', String.raw`\sigma\tau=(1\,2\,3)`),
    f('Balik urutannya: τσ berarti σ dulu, baru τ. Sekarang 1 ↦ 2 ↦ 3, sehingga τσ = (1 3 2). Hasilnya berbeda, jadi S₃ tidak abelian.', 'Reverse the order: τσ means σ first, then τ. Now 1 ↦ 2 ↦ 3, so τσ = (1 3 2). The results differ, so S₃ is not abelian.', String.raw`\tau\sigma=(1\,3\,2)\ne\sigma\tau`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <T x={240} y={26} size={15} weight={600}>τ = (2 3),   σ = (1 2)</T>
      <Ladder x0={80} first={tau23} second={sig12} only={k === 0 ? 1 : undefined} />
      <T x={44} y={113} size={17} weight={700} color={C.mu}>τ</T>
      <T x={44} y={203} size={17} weight={700} color={C.mu}>σ</T>
      <At from={1} frame={k}><T x={135} y={286} size={16} weight={700} color={C.v}>στ = (1 2 3)</T></At>
      <At until={1} frame={k}><T x={250} y={80} anchor="start" size={15} weight={600}>{t('στ: τ dulu, lalu σ', 'στ: τ first, then σ')}</T></At>
      <At until={0} frame={k}>
        <T x={250} y={118} anchor="start" size={18} weight={700} color={C.a}>1 ↦ 1 ↦ 2</T>
        <T x={250} y={148} anchor="start" size={13} color={C.mu}>{t('τ menahan 1, σ mengirimnya ke 2', 'τ fixes 1, σ sends it to 2')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {['1 ↦ 1 ↦ 2', '2 ↦ 3 ↦ 3', '3 ↦ 2 ↦ 1'].map((s, i) => <T key={s} x={250} y={118 + i * 30} anchor="start" size={17} weight={700} color={three[i]}>{s}</T>)}
        <T x={250} y={228} anchor="start" size={13} color={C.mu}>{t('baris tengah: sesudah τ', 'middle row: after τ')}</T>
      </At>
      <At from={2} frame={k}>
        <Ladder x0={330} first={sig12} second={tau23} />
        <T x={296} y={113} size={17} weight={700} color={C.mu}>σ</T>
        <T x={296} y={203} size={17} weight={700} color={C.mu}>τ</T>
        <T x={385} y={286} size={16} weight={700} color={C.v}>τσ = (1 3 2)</T>
        <T x={252} y={160} size={30} weight={700} color={C.r}>≠</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cycles:1 disjoint cycles, inverse, lcm order
const SQ: P = [100, 150], sqPos = (i: number): P => [SQ[0] + 68 * Math.sin(i * Math.PI / 2), SQ[1] - 68 * Math.cos(i * Math.PI / 2)]
const twoPos = (i: number): P => [232, i ? 205 : 95]
const disjoint: Story = {
  title: b('Siklus lepas: komut, dibalik, dan pulang bersama di KPK', 'Disjoint cycles: they commute, reverse, and return together at the LCM'),
  frames: [
    f('σ = (1 2 3 4)(5 6) terdiri dari dua loop yang tidak berbagi angka. Siklus lepas seperti ini komut: (1 2 3 4)(5 6) = (5 6)(1 2 3 4), karena masing-masing hanya menggerakkan angkanya sendiri.', 'σ = (1 2 3 4)(5 6) is made of two loops that share no number. Disjoint cycles like these commute: (1 2 3 4)(5 6) = (5 6)(1 2 3 4), since each one only moves its own numbers.', String.raw`(1\,2\,3\,4)(5\,6)=(5\,6)(1\,2\,3\,4)`),
    f('Invers: balik arah setiap panah. σ⁻¹ = (4 3 2 1)(6 5) = (1 4 3 2)(5 6). Siklus dua adalah invers dirinya sendiri.', 'Inverse: reverse every arrow. σ⁻¹ = (4 3 2 1)(6 5) = (1 4 3 2)(5 6). A 2-cycle is its own inverse.', String.raw`\sigma^{-1}=(1\,4\,3\,2)(5\,6)`),
    f('Geser k untuk menerapkan σ berulang kali. Loop-4 pulang setiap 4 langkah, loop-2 setiap 2 langkah. Keduanya pulang bersama pertama kali di k = kpk(4, 2) = 4, bukan 4 · 2 = 8.', 'Move k to apply σ again and again. The 4-loop is home every 4 steps, the 2-loop every 2 steps. They are first home together at k = lcm(4, 2) = 4, not 4 · 2 = 8.', String.raw`o(\sigma)=\operatorname{lcm}(4,2)=4`),
  ],
  control: { label: b('Berapa kali σ diterapkan, k', 'Times σ is applied, k'), min: 0, max: 12, step: 1, initial: 0 },
  controlFrom: 2,
  readout: k => String.raw`k=${k}:\quad k\bmod4=${k % 4},\quad k\bmod2=${k % 2}${k > 0 && k % 4 === 0 ? String.raw`\quad\Rightarrow\ \sigma^{${k}}=e` : ''}`,
  draw: (k, value, lang) => {
    const t = tr(lang), rev = k === 1, steps = k >= 2 ? value : 0, a4 = steps % 4, a2 = steps % 2
    const col4 = rev ? C.v : C.a, col2 = rev ? C.v : C.g
    return <>
      {[0, 1, 2, 3].map(i => rev
        ? <Link key={`r${i}`} p={sqPos((i + 1) % 4)} q={sqPos(i)} color={col4} />
        : <Link key={`f${i}`} p={sqPos(i)} q={sqPos((i + 1) % 4)} color={col4} />)}
      <Arrow from={[245, 117]} to={[245, 183]} color={col2} width={2.5} head={9} />
      <Arrow from={[219, 183]} to={[219, 117]} color={col2} width={2.5} head={9} />
      {[0, 1, 2, 3].map(i => <Node key={i} at={sqPos(i)} label={i + 1} fill={C.bg} stroke={C.a} ink={C.fg} r={17} size={15} />)}
      {[0, 1].map(i => <Node key={i} at={twoPos(i)} label={i + 5} fill={C.bg} stroke={C.g} ink={C.fg} r={17} size={15} />)}
      <T x={100} y={268} size={15} weight={600} color={C.a}>(1 2 3 4)</T>
      <T x={232} y={268} size={15} weight={600} color={C.g}>(5 6)</T>
      <At until={0} frame={k}>
        <T x={290} y={70} anchor="start" size={15} weight={600}>σ = (1 2 3 4)(5 6)</T>
        <T x={290} y={98} anchor="start" size={15} weight={600}>   = (5 6)(1 2 3 4)</T>
        <T x={290} y={136} anchor="start" size={13} color={C.mu}>{t('tidak ada angka bersama', 'no shared numbers')}</T>
        <T x={290} y={162} anchor="start" size={15} weight={600} color={C.g}>{t('jadi keduanya komut', 'so they commute')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={290} y={70} anchor="start" size={15} weight={600} color={C.v}>σ⁻¹ = (4 3 2 1)(6 5)</T>
        <T x={290} y={98} anchor="start" size={15} weight={600} color={C.v}>     = (1 4 3 2)(5 6)</T>
        <T x={290} y={136} anchor="start" size={13} color={C.mu}>{t('balik setiap panah', 'reverse every arrow')}</T>
        <T x={290} y={162} anchor="start" size={15} weight={600} color={C.g}>σ σ⁻¹ = e</T>
      </At>
      <At from={2} frame={k}>
        <circle cx={sqPos(a4)[0]} cy={sqPos(a4)[1]} r={24} fill="none" stroke={C.a} strokeWidth="4" style={{ transition: 'all .35s' }} />
        <circle cx={twoPos(a2)[0]} cy={twoPos(a2)[1]} r={24} fill="none" stroke={C.g} strokeWidth="4" style={{ transition: 'all .35s' }} />
        <T x={290} y={70} anchor="start" size={18} weight={700}>k = {steps}</T>
        <T x={290} y={102} anchor="start" size={15} color={C.a}>{t('loop-4', '4-loop')}: {a4 === 0 ? t('pulang ✓', 'home ✓') : t('jalan', 'away')}</T>
        <T x={290} y={128} anchor="start" size={15} color={C.g}>{t('loop-2', '2-loop')}: {a2 === 0 ? t('pulang ✓', 'home ✓') : t('jalan', 'away')}</T>
        <T x={290} y={186} anchor="start" size={15} weight={600} color={C.v}>{t('orde = kpk(4, 2) = 4', 'order = lcm(4, 2) = 4')}</T>
        <T x={290} y={210} anchor="start" size={13} color={C.mu}>{t('bukan 4 · 2 = 8', 'not 4 · 2 = 8')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cycles:2 why |S_n| = n!
const perms3 = [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], cyc3 = ['e', '(2 3)', '(1 2)', '(1 2 3)', '(1 3 2)', '(1 3)']
const leafY = (j: number) => 50 + 44 * j
const countPerms: Story = {
  title: b('Mengapa |Sₙ| = n!: pohon pilihan', 'Why |Sₙ| = n!: a tree of choices'),
  frames: [
    f('Hitung bijeksi dari {1, 2, 3} ke dirinya sendiri. Input 1 boleh dikirim ke mana saja: 3 pilihan.', 'Count the bijections from {1, 2, 3} to itself. Input 1 may go anywhere: 3 choices.'),
    f('Input 2 tidak boleh memakai keluaran yang sudah diambil 1, jadi tinggal 2 pilihan di setiap cabang. Sudah ada 3 × 2 = 6 cabang.', 'Input 2 may not reuse the output already taken by 1, so each branch has only 2 choices left. That makes 3 × 2 = 6 branches.'),
    f('Input 3 hanya punya 1 keluaran tersisa. Pohon berakhir dengan 3 × 2 × 1 = 6 daun, dan setiap daun adalah satu permutasi di S₃. Secara umum |Sₙ| = n!.', 'Input 3 has just 1 output left. The tree ends in 3 × 2 × 1 = 6 leaves, and each leaf is one permutation in S₃. In general |Sₙ| = n!.', String.raw`|S_3|=3\cdot2\cdot1=6,\quad |S_n|=n!`),
    f('Bandingkan dengan fungsi biasa yang boleh mengulang keluaran: 3 × 3 × 3 = 27. Contoh 1 ↦ 2, 2 ↦ 2, 3 ↦ 1 adalah fungsi, tetapi bukan permutasi. Larangan mengulang itulah yang menurunkan pilihan satu per satu.', 'Compare with ordinary functions, which may repeat outputs: 3 × 3 × 3 = 27. For example 1 ↦ 2, 2 ↦ 2, 3 ↦ 1 is a function but not a permutation. Forbidding repeats is what lowers the choices one by one.', String.raw`3^3=27\ne6=3!`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={2} frame={k}>
        <Dot at={[36, 160]} color={C.fg} r={6} />
        <T x={36} y={140} size={13} color={C.mu}>{t('mulai', 'start')}</T>
        {[0, 1, 2].map(a => <g key={a}>
          <path d={`M42,160 L95,${72 + 88 * a}`} stroke={C.ln} strokeWidth="2" />
          <Chip x={120} y={72 + 88 * a} w={50} h={26} size={13} label={`1↦${a + 1}`} tone={three[a]} />
        </g>)}
        <At from={1} frame={k}>{perms3.map((p, j) => <g key={j}>
          <path d={`M145,${72 + 88 * Math.floor(j / 2)} L185,${leafY(j)}`} stroke={C.ln} strokeWidth="2" />
          <Chip x={210} y={leafY(j)} w={50} h={26} size={13} label={`2↦${p[1]}`} tone={three[p[0] - 1]} />
        </g>)}</At>
        <At from={2} frame={k}>{perms3.map((p, j) => <g key={j}>
          <path d={`M235,${leafY(j)} L270,${leafY(j)}`} stroke={C.ln} strokeWidth="2" />
          <Chip x={295} y={leafY(j)} w={50} h={26} size={13} label={`3↦${p[2]}`} tone={three[p[0] - 1]} />
          <T x={332} y={leafY(j) + 5} anchor="start" size={14} weight={600} color={C.v}>{cyc3[j]}</T>
        </g>)}</At>
        <T x={120} y={26} size={18} weight={700}>3</T>
        <At from={1} frame={k}><T x={210} y={26} size={18} weight={700}>× 2</T></At>
        <At from={2} frame={k}><T x={295} y={26} size={18} weight={700}>× 1</T><T x={370} y={26} size={18} weight={700} color={C.v}>= 6</T></At>
      </At>
      <At from={3} frame={k}>
        {[[t('bijeksi', 'bijections'), '3 · 2 · 1 = 6', t('keluaran tidak boleh berulang', 'outputs may not repeat'), C.g, 20], [t('semua fungsi', 'all functions'), '3 · 3 · 3 = 27', t('keluaran boleh berulang', 'outputs may repeat'), C.y, 250]].map(([h, n, d, c, x]) => <g key={String(h)}>
          <rect x={Number(x)} y={36} width={210} height={150} rx={14} fill={String(c)} fillOpacity=".1" stroke={String(c)} strokeWidth="2" />
          <T x={Number(x) + 105} y={70} size={16} weight={700} color={String(c)}>{h}</T>
          <T x={Number(x) + 105} y={120} size={22} weight={700}>{n}</T>
          <T x={Number(x) + 105} y={160} size={13} color={C.mu}>{d}</T>
        </g>)}
        <T x={240} y={232} size={16} weight={600}>1 ↦ 2,  2 ↦ 2,  3 ↦ 1</T>
        <T x={240} y={262} size={14} weight={600} color={C.r}>{t('fungsi, bukan permutasi: 2 dipakai dua kali ✗', 'a function, not a permutation: 2 is used twice ✗')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- parity:0 a k-cycle is k − 1 swaps around a pivot
const STAR: P = [130, 150]
const starPos = (j: number, n: number): P => { const a = -Math.PI / 2 + 2 * Math.PI * j / n; return [STAR[0] + 100 * Math.cos(a), STAR[1] + 100 * Math.sin(a)] }
const Star = ({ k }: { k: number }) => <g>
  {Array.from({ length: k - 1 }, (_, j) => { const p = starPos(j, k - 1), m: P = [STAR[0] + (p[0] - STAR[0]) * .55, STAR[1] + (p[1] - STAR[1]) * .55]; return <g key={j}>
    <path d={pl([STAR, p])} stroke={C.a} strokeWidth="3" style={{ transition: 'all .45s' }} />
    <Node at={p} label={j + 2} fill={C.bg} stroke={C.a} ink={C.fg} r={16} />
    <Node at={m} label={j + 1} fill={C.y} r={10} size={12} />
  </g> })}
  <Node at={STAR} label={1} fill={C.a} r={18} size={15} />
</g>
const swapRows = [[1, 2, 2, 2], [2, 1, 3, 3], [3, 3, 1, 4], [4, 4, 4, 1]]
const pivot: Story = {
  title: b('Siklus panjang k = k − 1 tukar di sekitar satu poros', 'A k-cycle = k − 1 swaps around one pivot'),
  frames: [
    f('Tahan 1 sebagai poros. Siklus (1 2 3 4) sama dengan tiga tukar yang semuanya melibatkan 1: (1 2) dulu, lalu (1 3), lalu (1 4). Dibaca kanan ke kiri: (1 4)(1 3)(1 2).', 'Hold 1 as the pivot. The cycle (1 2 3 4) equals three swaps that all involve 1: (1 2) first, then (1 3), then (1 4). Read right to left: (1 4)(1 3)(1 2).', String.raw`(1\,2\,3\,4)=(1\,4)(1\,3)(1\,2)`),
    f('Cek dengan melacak setiap angka melewati tiga tukar: 1 ↦ 2, 2 ↦ 3, 3 ↦ 4, 4 ↦ 1. Itu persis (1 2 3 4). Tiga tukar berarti ganjil, walau panjang siklusnya 4.', 'Check by tracking each number through the three swaps: 1 ↦ 2, 2 ↦ 3, 3 ↦ 4, 4 ↦ 1. That is exactly (1 2 3 4). Three swaps means odd, even though the cycle has length 4.'),
    f('Geser k: siklus panjang k selalu butuh k − 1 jari-jari, yaitu k − 1 tukar. Tandanya (−1)^(k−1): panjang ganjil memberi permutasi genap, panjang genap memberi permutasi ganjil.', 'Move k: a cycle of length k always needs k − 1 spokes, that is k − 1 swaps. Its sign is (−1)^(k−1): odd length gives an even permutation, even length gives an odd one.', String.raw`\operatorname{sgn}(a_1\cdots a_k)=(-1)^{k-1}`),
  ],
  control: { label: b('Panjang siklus k', 'Cycle length k'), min: 2, max: 8, step: 1, initial: 4 },
  controlFrom: 2,
  readout: k => String.raw`\operatorname{sgn}(1\,2\cdots${k})=(-1)^{${k - 1}}=${(k - 1) % 2 ? '-1' : '+1'}`,
  draw: (k, value, lang) => {
    const t = tr(lang), kk = k === 2 ? value : 4, even = (kk - 1) % 2 === 0, cols = [50, 150, 250, 350]
    return <>
      <g style={{ opacity: k === 1 ? 0 : 1, transition: 'opacity .45s' }}><Star k={kk} /></g>
      <At until={0} frame={k}>
        <T x={262} y={80} anchor="start" size={18} weight={700}>(1 2 3 4)</T>
        <T x={262} y={112} anchor="start" size={17} weight={600}>= (1 4)(1 3)(1 2)</T>
        <T x={262} y={148} anchor="start" size={13} color={C.mu}>{t('poros 1; kuning = urutan tukar', 'pivot 1; amber = order of swaps')}</T>
        <T x={262} y={190} anchor="start" size={16} weight={600} color={C.r}>{t('3 tukar → ganjil', '3 swaps → odd')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {['x', '(1 2)', '(1 3)', '(1 4)', 'σ(x)'].map((h, i) => <T key={h} x={i < 4 ? cols[i] : 430} y={48} size={15} weight={700} color={i === 4 ? C.v : C.mu}>{h}</T>)}
        <T x={240} y={74} size={13} color={C.mu}>{t('kanan ke kiri: (1 2) dulu', 'right to left: (1 2) first')}</T>
        {swapRows.map((row, r) => <g key={r}>
          {row.map((v, i) => <g key={i}>
            {i > 0 && <Arrow from={[cols[i - 1] + 20, 110 + r * 46]} to={[cols[i] - 20, 110 + r * 46]} color={C.mu} width={2} head={8} />}
            <Node at={[cols[i], 110 + r * 46]} label={v} fill={four[v - 1]} r={15} />
          </g>)}
          <T x={430} y={115 + r * 46} size={16} weight={600} color={C.v}>{row[0]} ↦ {row[3]} ✓</T>
        </g>)}
      </At>
      <At from={2} frame={k}>
        <T x={262} y={80} anchor="start" size={18} weight={700}>k = {kk}</T>
        <T x={262} y={112} anchor="start" size={15} weight={600}>({Array.from({ length: kk }, (_, i) => i + 1).join(' ')})</T>
        <T x={262} y={146} anchor="start" size={15}>{kk - 1} {t('jari-jari = ', 'spokes = ')}{kk - 1} {t('tukar', 'swaps')}</T>
        <rect x={262} y={168} width={130} height={32} rx={16} fill={even ? C.g : C.r} fillOpacity=".18" stroke={even ? C.g : C.r} />
        <T x={327} y={190} size={15} weight={700} color={even ? C.g : C.r}>{even ? t('genap +1', 'even +1') : t('ganjil −1', 'odd −1')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- parity:1 A4 is the kernel of the sign
const evenRows: [string, number][] = [['e', 1], ['(a b c)', 8], ['(a b)(c d)', 3]], oddRows: [string, number][] = [['(a b)', 6], ['(a b c d)', 6]]
const signKernel: Story = {
  title: b('Aₙ = kernel tanda: normal, indeks dua', 'Aₙ = kernel of the sign: normal, index two'),
  frames: [
    f('S₄ punya 24 permutasi. Kelompokkan menurut tanda: identitas, 8 siklus-3, dan 3 tukar ganda (a b)(c d) genap; 6 transposisi dan 6 siklus-4 ganjil. Tepat 12 dan 12.', 'S₄ has 24 permutations. Group them by sign: the identity, 8 three-cycles and 3 double swaps (a b)(c d) are even; 6 transpositions and 6 four-cycles are odd. Exactly 12 and 12.', String.raw`24=(1+8+3)+(6+6)=12+12`),
    f('Tanda sgn adalah homomorfisma S₄ → {+1, −1}: sgn(στ) = sgn σ · sgn τ. Semua yang jatuh ke +1 adalah kernelnya, yaitu A₄. Kotak ganjil adalah koset (1 2)A₄, jadi indeksnya 24 / 12 = 2.', 'The sign sgn is a homomorphism S₄ → {+1, −1}: sgn(στ) = sgn σ · sgn τ. Everything landing on +1 is its kernel, which is A₄. The odd box is the coset (1 2)A₄, so the index is 24 / 12 = 2.', String.raw`A_4=\ker(\operatorname{sgn}),\quad[S_4:A_4]=24/12=2`),
    f('Kernel selalu normal. Contoh: konjugasi (1 2 3) oleh (1 2) memberi (1 3 2), masih genap, karena sgn(gσg⁻¹) = sgn σ. Jadi gA₄g⁻¹ = A₄.', 'A kernel is always normal. Example: conjugating (1 2 3) by (1 2) gives (1 3 2), still even, because sgn(gσg⁻¹) = sgn σ. So gA₄g⁻¹ = A₄.', String.raw`\operatorname{sgn}(g\sigma g^{-1})=\operatorname{sgn}\sigma`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const box = (x: number, title: string, rows: [string, number][], c: string, dx: number) => <g>
      <rect x={x} y={44} width={210} height={150} rx={14} fill={c} fillOpacity=".08" stroke={c} strokeWidth="2" />
      <T x={x + 105} y={72} size={15} weight={700} color={c}>{title}</T>
      {rows.map(([l, n], i) => <g key={l}>
        <T x={x + 12} y={104 + i * 32} anchor="start" size={13} weight={600}>{l}</T>
        {Array.from({ length: n }, (_, d) => { const hot = k === 2 && x < 100 && i === 1 && d < 2; return <circle key={d} cx={x + dx + d * 14} cy={100 + i * 32} r={hot ? 6.5 : 5.5} fill={hot ? C.v : c} stroke={hot ? C.v : 'none'} strokeWidth="3" style={{ transition: 'all .45s' }} /> })}
      </g>)}
    </g>
    return <>
      {box(20, t('genap: A₄ (12)', 'even: A₄ (12)'), evenRows, C.g, 98)}
      {box(250, t('ganjil (12)', 'odd (12)'), oddRows, C.r, 90)}
      <At from={1} until={1} frame={k}>
        <Arrow from={[125, 198]} to={[125, 228]} color={C.g} width={2.5} />
        <Arrow from={[355, 198]} to={[355, 228]} color={C.r} width={2.5} />
        <T x={240} y={224} size={15} weight={700} color={C.v}>sgn</T>
        <Node at={[125, 252]} label="+1" fill={C.g} r={19} size={14} />
        <Node at={[355, 252]} label="−1" fill={C.r} r={19} size={14} />
        <T x={152} y={257} anchor="start" size={14} weight={600} color={C.g}>= ker</T>
        <T x={382} y={257} anchor="start" size={14} weight={600} color={C.r}>(1 2)A₄</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={234} size={16} weight={600}>(1 2)(1 2 3)(1 2) = (1 3 2)</T>
        <T x={240} y={262} size={14} weight={600} color={C.g}>{t('konjugasi menjaga tanda: tetap di A₄', 'conjugating keeps the sign: still in A₄')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- parity:2 A5 is simple: class sizes
const a5 = [{ n: 1, l: 'e' }, { n: 15, l: '(ab)(cd)' }, { n: 20, l: '(abc)' }, { n: 12, l: '(12345)' }, { n: 12, l: '(13524)' }]
const a4 = [{ n: 1, l: 'e' }, { n: 3, l: '(ab)(cd)' }, { n: 4, l: '(abc)' }, { n: 4, l: '(acb)' }]
const classColors = [C.mu, C.y, C.a, C.g, C.v]
const pickSizes = (v: number) => [1, ...a5.slice(1).filter((_, i) => v >> i & 1).map(c => c.n)]
const simpleA5: Story = {
  title: b('A₅ sederhana: hanya 1 dan 60 yang muat', 'A₅ is simple: only 1 and 60 fit'),
  frames: [
    f('A₅ punya 60 anggota yang terbagi menjadi kelas konjugasi berukuran 1, 15, 20, 12, 12. Subgrup normal tertutup terhadap konjugasi, jadi ia harus gabungan kelas utuh, dan selalu memuat kelas {e}.', 'A₅ has 60 elements split into conjugacy classes of sizes 1, 15, 20, 12, 12. A normal subgroup is closed under conjugation, so it must be a union of whole classes, always including the class {e}.', String.raw`60=1+15+20+12+12`),
    f('Pilih kelas dengan penggeser (16 pilihan). Ukuran gabungan harus membagi 60 (Lagrange): 1 + 15 = 16, 1 + 20 = 21, 1 + 12 = 13 dan seterusnya. Tidak ada yang lolos kecuali 1 dan 60, jadi A₅ sederhana.', 'Pick classes with the slider (16 choices). The union size must divide 60 (Lagrange): 1 + 15 = 16, 1 + 20 = 21, 1 + 12 = 13 and so on. Nothing passes except 1 and 60, so A₅ is simple.', String.raw`N\triangleleft A_5\implies|N|\in\{1,60\}`),
    f('Batas n ≥ 5 penting. Di A₄ kelasnya berukuran 1, 3, 4, 4, dan 1 + 3 = 4 membagi 12: itulah subgrup normal V₄ = {e, (1 2)(3 4), (1 3)(2 4), (1 4)(2 3)}. Jadi A₄ tidak sederhana.', 'The bound n ≥ 5 matters. In A₄ the classes have sizes 1, 3, 4, 4, and 1 + 3 = 4 divides 12: that is the normal subgroup V₄ = {e, (1 2)(3 4), (1 3)(2 4), (1 4)(2 3)}. So A₄ is not simple.', String.raw`V_4\triangleleft A_4,\quad|V_4|=4\mid12`),
  ],
  control: { label: b('Gabungan kelas (16 pilihan)', 'Union of classes (16 choices)'), min: 0, max: 15, step: 1, initial: 1 },
  controlFrom: 1,
  readout: v => { const s = pickSizes(v), n = s.reduce((a, c) => a + c, 0); return String.raw`|N|=${s.join('+')}=${n},\quad ${n}${60 % n ? String.raw`\nmid` : String.raw`\mid`}60` },
  draw: (k, value, lang) => {
    const t = tr(lang), v = k >= 1 ? value : 15, sizes = pickSizes(v), n = sizes.reduce((a, c) => a + c, 0), ok = 60 % n === 0
    let x = 40
    const segs = a5.map((c, i) => { const s = { ...c, x, w: c.n * 7, on: i === 0 || k === 0 || (v >> (i - 1) & 1) === 1, i }; x += c.n * 7; return s })
    let x4 = 40
    const segs4 = a4.map((c, i) => { const s = { ...c, x: x4, w: c.n * 35, i }; x4 += c.n * 35; return s })
    return <>
      <T x={14} y={74} anchor="start" size={14} weight={700}>A₅</T>
      {segs.map(s => <g key={s.i}>
        <rect x={s.x} y={52} width={s.w} height={34} fill={classColors[s.i]} fillOpacity={s.on ? .75 : .1} stroke={C.bg} strokeWidth="1.5" style={{ transition: 'fill-opacity .35s' }} />
        <T x={s.x + s.w / 2} y={44} size={14} weight={700} color={s.on ? C.fg : C.mu}>{s.n}</T>
        <T x={s.x + s.w / 2 + (s.i === 0 ? 2 : 0)} y={108} size={13} color={C.mu}>{s.l}</T>
      </g>)}
      <At from={1} frame={k}>
        <T x={240} y={150} size={18} weight={700}>|N| = {sizes.join(' + ')} = {n}</T>
        <T x={240} y={180} size={15} weight={600} color={ok ? C.g : C.r}>{ok ? `${n} | 60 ✓ ${n === 1 ? t('(N = {e})', '(N = {e})') : n === 60 ? '(N = A₅)' : ''}` : `${n} ∤ 60 ✗ ${t('bukan subgrup', 'not a subgroup')}`}</T>
      </At>
      <At from={2} frame={k}>
        <T x={14} y={240} anchor="start" size={14} weight={700}>A₄</T>
        {segs4.map(s => <g key={s.i}>
          <rect x={s.x} y={222} width={s.w} height={30} fill={s.i < 2 ? C.g : C.ln} fillOpacity={s.i < 2 ? .75 : .25} stroke={C.bg} strokeWidth="1.5" />
          <T halo={false} x={s.x + s.w / 2} y={242} size={13} weight={700} color={s.i < 2 ? C.bg : C.fg}>{s.i === 0 ? '1' : `${s.n}: ${s.l}`}</T>
        </g>)}
        <T x={240} y={278} size={15} weight={600} color={C.g}>1 + 3 = 4 | 12 → V₄ ◁ A₄</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ring:0 two tables joined by distributivity
const z6 = ['0', '1', '2', '3', '4', '5']
const Mat = ({ x, y, m, color = C.fg }: { x: number; y: number; m: number[][]; color?: string }) => <g>
  <path d={`M${x - 22},${y - 27} h-6 v48 h6 M${x + 22},${y - 27} h6 v48 h-6`} fill="none" stroke={C.mu} strokeWidth="2" />
  {m.map((row, i) => row.map((v, j) => <T key={`${i}${j}`} x={x + (j ? 11 : -11)} y={y - 8 + i * 22} size={16} weight={600} color={color}>{v}</T>))}
</g>
const distribute: Story = {
  title: b('Dua tabel, satu jembatan: distributif', 'Two tables, one bridge: distributivity'),
  frames: [
    f('Gelanggang memakai dua tabel berbeda pada himpunan yang sama. Di ℤ₆: 2 + 4 = 0 tetapi 2 · 4 = 2. Penjumlahan harus grup abelian, perkalian asosiatif.', 'A ring uses two different tables on the same set. In ℤ₆: 2 + 4 = 0 but 2 · 4 = 2. Addition must be an abelian group, multiplication associative.', String.raw`2+4\equiv0,\quad2\cdot4\equiv2\pmod6`),
    f('Distributif menghubungkan keduanya. Jalur pertama untuk a = 2, b = 1, c = 3: jumlahkan dulu di tabel + (1 + 3 = 4), lalu kalikan di tabel × (2 · 4 = 8 = 2).', 'Distributivity links them. First path for a = 2, b = 1, c = 3: add first in the + table (1 + 3 = 4), then multiply in the × table (2 · 4 = 8 = 2).', String.raw`a(b+c)=2\cdot4=2`),
    f('Jalur kedua: kalikan dulu (2 · 1 = 2, 2 · 3 = 0), lalu jumlahkan (2 + 0 = 2). Kedua jalur sampai di 2. Itulah a(b + c) = ab + ac.', 'Second path: multiply first (2 · 1 = 2, 2 · 3 = 0), then add (2 + 0 = 2). Both paths arrive at 2. That is a(b + c) = ab + ac.', String.raw`ab+ac=2+0=2=a(b+c)`),
    f('Kalau perkalian tidak komutatif, hati-hati. Untuk matriks A dan B ini AB ≠ BA, sehingga (A + B)² = A² + AB + BA + B² = I, sedangkan rumus A² + 2AB + B² memberi 2AB, yang salah.', 'If multiplication is not commutative, be careful. For these matrices A and B, AB ≠ BA, so (A + B)² = A² + AB + BA + B² = I, while the formula A² + 2AB + B² gives 2AB, which is wrong.', String.raw`(A+B)^2=A^2+AB+BA+B^2\ne A^2+2AB+B^2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const plusTone = (r: number, c: number) => k === 1 && r === 1 && c === 3 ? C.y : k === 2 && r === 2 && c === 0 ? C.v : undefined
    const timesTone = (r: number, c: number) => k === 1 && r === 2 && c === 4 ? C.v : k === 2 && r === 2 && (c === 1 || c === 3) ? C.y : undefined
    return <>
      <At until={2} frame={k}>
        <T x={107} y={34} size={15} weight={700}>{t('+ di ℤ₆', '+ in ℤ₆')}</T>
        <T x={352} y={34} size={15} weight={700}>{t('× di ℤ₆', '× in ℤ₆')}</T>
        <Grid2 x0={20} y0={44} cell={25} heads={z6} sym="+" val={(r, c) => String((r + c) % 6)} tone={plusTone} />
        <Grid2 x0={265} y0={44} cell={25} heads={z6} sym="×" val={(r, c) => String((r * c) % 6)} tone={timesTone} />
        <At until={0} frame={k}><T x={240} y={252} size={16}>2 + 4 = 6 = 0,   {t('tetapi', 'but')}   2 · 4 = 8 = 2</T></At>
        <At from={1} frame={k}><T x={240} y={250} size={16} weight={600}>a(b + c) = 2 · (1 + 3) = 2 · 4 = 2</T></At>
        <At from={2} frame={k}><T x={240} y={278} size={16} weight={600}>ab + ac = 2 · 1 + 2 · 3 = 2 + 0 = 2 ✓</T></At>
      </At>
      <At from={3} frame={k}>
        <T x={44} y={74} size={17} weight={700}>A =</T><Mat x={108} y={70} m={[[0, 1], [0, 0]]} />
        <T x={214} y={74} size={17} weight={700}>B =</T><Mat x={278} y={70} m={[[0, 0], [1, 0]]} />
        <T x={44} y={154} size={17} weight={700}>AB =</T><Mat x={108} y={150} m={[[1, 0], [0, 0]]} color={C.a} />
        <T x={214} y={154} size={17} weight={700}>BA =</T><Mat x={278} y={150} m={[[0, 0], [0, 1]]} color={C.g} />
        <T x={380} y={156} size={18} weight={700} color={C.r}>AB ≠ BA</T>
        <T x={380} y={74} size={14} color={C.mu}>A² = B² = 0</T>
        <T x={240} y={226} size={16} weight={600} color={C.g}>(A + B)² = A² + AB + BA + B² = I ✓</T>
        <T x={240} y={258} size={16} weight={600} color={C.r}>A² + 2AB + B² = 2AB ≠ I ✗</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ring:1 units vs zero divisors in Z12
const zx = (i: number) => 42 + i * 36
const inv12 = (a: number) => Array.from({ length: 12 }, (_, x) => x).find(x => (a * x) % 12 === 1)
const unitsZ12: Story = {
  title: b('Unit atau pembagi nol: kalikan semua dengan a', 'Unit or zero divisor: multiply everything by a'),
  frames: [
    f('Kalikan setiap x di ℤ₁₂ dengan a = 5. Panah mengenai semua 12 keluaran, termasuk 1: 5 · 5 = 25 = 1. Jadi 5 unit dengan invers 5, karena fpb(5, 12) = 1.', 'Multiply every x in ℤ₁₂ by a = 5. The arrows hit all 12 outputs, including 1: 5 · 5 = 25 = 1. So 5 is a unit with inverse 5, because gcd(5, 12) = 1.', String.raw`\gcd(5,12)=1,\quad5\cdot5=25\equiv1`),
    f('Sekarang a = 8, dengan fpb(8, 12) = 4. Keluaran hanya 0, 4, 8, dan panah merah menunjukkan 8 · 3 = 0 dengan 3 ≠ 0: 8 pembagi nol. Pembatalan gagal: 8 · 1 = 8 · 4 tetapi 1 ≠ 4.', 'Now a = 8, with gcd(8, 12) = 4. The only outputs are 0, 4, 8, and the red arrows show 8 · 3 = 0 with 3 ≠ 0: 8 is a zero divisor. Cancellation fails: 8 · 1 = 8 · 4 but 1 ≠ 4.', String.raw`8\cdot\tfrac{12}{4}=8\cdot3\equiv0`),
    f('Geser a. Jika fpb(a, 12) = 1, panah mengenai 1 dan a unit. Jika d = fpb(a, 12) > 1, maka a · (12/d) = 0 dan a pembagi nol. Tidak ada pilihan ketiga.', 'Move a. If gcd(a, 12) = 1, an arrow hits 1 and a is a unit. If d = gcd(a, 12) > 1, then a · (12/d) = 0 and a is a zero divisor. There is no third option.', String.raw`[a]\in\mathbb Z_{12}^\times\iff\gcd(a,12)=1`),
  ],
  control: { label: b('Pengali a', 'Multiplier a'), min: 1, max: 11, step: 1, initial: 7 },
  controlFrom: 2,
  readout: a => { const d = gcd(a, 12); return d === 1 ? String.raw`\gcd(${a},12)=1,\quad ${a}\cdot${inv12(a)}=${a * inv12(a)!}\equiv1` : String.raw`\gcd(${a},12)=${d},\quad ${a}\cdot${12 / d}=${a * 12 / d}\equiv0` },
  draw: (k, value, lang) => {
    const t = tr(lang), a = k === 0 ? 5 : k === 1 ? 8 : value, d = gcd(a, 12), hit = new Set(Array.from({ length: 12 }, (_, x) => (a * x) % 12)), iv = inv12(a)
    return <>
      <T x={240} y={30} size={14} color={C.mu}>x</T>
      <T x={240} y={222} size={14} color={C.mu}>{a} · x  (mod 12)</T>
      {Array.from({ length: 12 }, (_, x) => { const y = (a * x) % 12, good = d === 1 && y === 1, bad = d > 1 && y === 0 && x > 0
        return <Link key={`${a}-${x}`} p={[zx(x), 62]} q={[zx(y), 182]} r1={14} r2={15} color={good ? C.g : bad ? C.r : C.ln} width={good || bad ? 3 : 1.5} /> })}
      {Array.from({ length: 12 }, (_, x) => <g key={x}>
        <Node at={[zx(x), 62]} label={x} fill={C.bg} stroke={C.ln} ink={C.fg} r={13} size={13} />
        <Node at={[zx(x), 182]} label={x} fill={hit.has(x) ? C.a : C.bg} stroke={hit.has(x) ? C.a : C.faint} ink={hit.has(x) ? C.bg : C.mu} r={13} size={13} />
      </g>)}
      {d === 1
        ? <><T x={240} y={252} size={16} weight={600} color={C.g}>{a} · {iv} = {a * iv!} = 1  →  {a}⁻¹ = {iv}</T>
          <T x={240} y={278} size={14} color={C.mu}>{t('semua 12 keluaran kena: unit', 'all 12 outputs are hit: a unit')}</T></>
        : <><T x={240} y={252} size={16} weight={600} color={C.r}>{a} · {12 / d} = {a * 12 / d} = 0,  {t('padahal', 'yet')} {12 / d} ≠ 0</T>
          <T x={240} y={278} size={14} color={C.mu}>{a === 8 ? t('8 · 1 = 8 · 4 = 8, tetapi 1 ≠ 4: pembatalan gagal', '8 · 1 = 8 · 4 = 8, but 1 ≠ 4: cancelling fails') : t(`hanya ${12 / d} keluaran kena: pembagi nol`, `only ${12 / d} outputs are hit: a zero divisor`)}</T></>}
    </>
  },
}

// ---------------------------------------------------------------- ring:2 rings, domains, fields as nested boxes
const hierarchy: Story = {
  title: b('Gelanggang ⊃ daerah integral ⊃ lapangan', 'Rings ⊃ integral domains ⊃ fields'),
  frames: [
    f('Mulai dari gelanggang komutatif dengan 1. ℤ₆ termasuk di sini, tetapi 2 · 3 = 0: ada pembagi nol, jadi pembatalan bisa gagal.', 'Start with commutative rings with 1. ℤ₆ belongs here, but 2 · 3 = 0: it has zero divisors, so cancellation can fail.', String.raw`2\cdot3\equiv0\pmod6`),
    f('Tambah syarat "tanpa pembagi nol": daerah integral. ℤ lolos, karena hasil kali dua bilangan bulat tak nol tidak pernah 0. Tetapi 2 tidak punya invers bulat: 2x = 1 tidak punya solusi di ℤ.', 'Add the condition "no zero divisors": integral domains. ℤ passes, since a product of two nonzero integers is never 0. But 2 has no integer inverse: 2x = 1 has no solution in ℤ.', String.raw`ab=0\Rightarrow a=0\ \lor\ b=0`),
    f('Tambah syarat "setiap a ≠ 0 punya invers": lapangan. Di ℤ₅, 2 · 3 = 6 = 1, dan semua anggota tak nol punya pasangan. Setiap lapangan otomatis daerah integral: jika ab = 0 dan a ≠ 0, kalikan dengan a⁻¹ untuk mendapat b = 0.', 'Add the condition "every a ≠ 0 has an inverse": fields. In ℤ₅, 2 · 3 = 6 = 1, and every nonzero element has a partner. Every field is automatically a domain: if ab = 0 and a ≠ 0, multiply by a⁻¹ to get b = 0.', String.raw`ab=0,\ a\ne0\Rightarrow b=a^{-1}ab=0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <rect x={16} y={16} width={448} height={270} rx={18} fill={C.r} fillOpacity=".05" stroke={C.r} strokeWidth="2" />
      <T x={30} y={44} anchor="start" size={15} weight={700} color={C.r}>{t('gelanggang komutatif dengan 1', 'commutative rings with 1')}</T>
      <T x={30} y={70} anchor="start" size={13} color={C.mu}>{t('juga: ℤ₈, ℤ₁₂', 'also: ℤ₈, ℤ₁₂')}</T>
      <T x={270} y={44} anchor="start" size={15} weight={700}>ℤ₆: 2 · 3 = 0</T>
      <T x={270} y={70} anchor="start" size={13} color={C.r}>{t('punya pembagi nol', 'has zero divisors')}</T>
      <At from={1} frame={k}>
        <rect x={36} y={90} width={408} height={186} rx={16} fill={C.y} fillOpacity=".06" stroke={C.y} strokeWidth="2" />
        <T x={50} y={118} anchor="start" size={15} weight={700} color={C.y}>{t('daerah integral', 'integral domains')}</T>
        <T x={50} y={142} anchor="start" size={13} color={C.mu}>{t('juga: ℤ[x]', 'also: ℤ[x]')}</T>
        <T x={270} y={118} anchor="start" size={15} weight={700}>ℤ: 2⁻¹ ∉ ℤ</T>
        <T x={270} y={142} anchor="start" size={13} color={C.y}>{t('tanpa pembagi nol', 'no zero divisors')}</T>
      </At>
      <At from={2} frame={k}>
        <rect x={56} y={162} width={368} height={104} rx={14} fill={C.g} fillOpacity=".08" stroke={C.g} strokeWidth="2" />
        <T x={70} y={190} anchor="start" size={15} weight={700} color={C.g}>{t('lapangan', 'fields')}</T>
        <T x={70} y={214} anchor="start" size={13} color={C.mu}>{t('juga: ℚ, ℝ', 'also: ℚ, ℝ')}</T>
        <T x={270} y={190} anchor="start" size={15} weight={700}>ℤ₅: 2 · 3 = 1</T>
        <T x={270} y={214} anchor="start" size={13} color={C.g}>{t('setiap a ≠ 0 punya invers', 'every a ≠ 0 is invertible')}</T>
        <T x={240} y={250} size={13} color={C.mu}>{t('lapangan ⇒ daerah integral, tidak sebaliknya', 'field ⇒ domain, not the other way')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ring:3 finite domain: multiplication by a is a shuffle
const finiteField: Story = {
  title: b('Daerah integral hingga: kali a mengacak semua sisa', 'Finite domain: multiplying by a shuffles every remainder'),
  frames: [
    f('Di 𝔽₅ = ℤ₅, kalikan setiap anggota dengan 2: 0 ↦ 0, 1 ↦ 2, 2 ↦ 4, 3 ↦ 1, 4 ↦ 3. Karena tidak ada pembagi nol, 2x = 2y memaksa x = y: tidak ada dua panah yang bertemu.', 'In 𝔽₅ = ℤ₅, multiply every element by 2: 0 ↦ 0, 1 ↦ 2, 2 ↦ 4, 3 ↦ 1, 4 ↦ 3. With no zero divisors, 2x = 2y forces x = y: no two arrows meet.', String.raw`2x=2y\Rightarrow2(x-y)=0\Rightarrow x=y`),
    f('Lima masukan, lima keluaran berbeda: di himpunan hingga, satu-satu berarti semua kena. Keluaran 1 datang dari 3, jadi 2 · 3 = 1 dan 2⁻¹ = 3.', 'Five inputs, five different outputs: on a finite set, one-to-one means everything is hit. Output 1 comes from 3, so 2 · 3 = 1 and 2⁻¹ = 3.', String.raw`2\cdot3=6\equiv1\pmod5`),
    f('Syarat hingga penting. Di ℤ, x ↦ 2x juga satu-satu, tetapi hanya mengenai bilangan genap. 1 tidak pernah kena, jadi 2 tidak punya invers: ℤ daerah integral, bukan lapangan.', 'Finiteness matters. In ℤ, x ↦ 2x is also one-to-one, but it only hits even numbers. 1 is never hit, so 2 has no inverse: ℤ is a domain, not a field.'),
    f('Coba sendiri di 𝔽₇: geser a. Panah selalu mengacak ketujuh sisa, dan panah hijau menunjukkan b dengan ab = 1.', 'Try it yourself in 𝔽₇: move a. The arrows always shuffle all seven remainders, and the green arrow shows the b with ab = 1.'),
  ],
  control: { label: b('Pengali a di 𝔽₇', 'Multiplier a in 𝔽₇'), min: 1, max: 6, step: 1, initial: 3 },
  controlFrom: 3,
  readout: a => { const iv = [0, 1, 4, 5, 2, 3, 6][a]; return String.raw`${a}\cdot${iv}=${a * iv}\equiv1\pmod7` },
  draw: (k, value, lang) => {
    const t = tr(lang), x5 = (i: number) => 80 + i * 80, x7 = (i: number) => 60 + i * 60, a = value, iv = [0, 1, 4, 5, 2, 3, 6][a]
    return <>
      <At until={1} frame={k}>
        <T x={24} y={75} size={15} color={C.mu}>x</T><T x={24} y={195} size={15} color={C.mu}>2x</T>
        {[0, 1, 2, 3, 4].map(x => <Link key={x} p={[x5(x), 70]} q={[x5((2 * x) % 5), 190]} r1={16} r2={17} color={k === 1 && x === 3 ? C.g : C.a} width={k === 1 && x === 3 ? 3.5 : 2.5} />)}
        {[0, 1, 2, 3, 4].map(x => <g key={x}><Node at={[x5(x), 70]} label={x} fill={C.bg} stroke={C.ln} ink={C.fg} /><Node at={[x5(x), 190]} label={x} fill={C.a} /></g>)}
        <At until={0} frame={k}><T x={240} y={245} size={16} weight={600}>2x = 2y ⇒ x = y</T><T x={240} y={272} size={14} color={C.mu}>{t('tidak ada dua panah ke titik yang sama', 'no two arrows reach the same point')}</T></At>
        <At from={1} frame={k}><T x={240} y={245} size={17} weight={700} color={C.g}>2 · 3 = 6 = 1  →  2⁻¹ = 3</T><T x={240} y={272} size={14} color={C.mu}>{t('5 masukan, 5 keluaran berbeda: semua kena', '5 inputs, 5 different outputs: all are hit')}</T></At>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={24} y={75} size={15} color={C.mu}>x</T><T x={24} y={195} size={15} color={C.mu}>2x</T>
        {Array.from({ length: 7 }, (_, x) => <Arrow key={x} from={[x7(x), 84]} to={[x7(x), 176]} color={C.a} width={2.5} head={9} />)}
        {Array.from({ length: 7 }, (_, x) => <Node key={x} at={[x7(x), 70]} label={x} fill={C.bg} stroke={C.ln} ink={C.fg} r={13} size={13} />)}
        {Array.from({ length: 13 }, (_, j) => <Node key={j} at={[60 + 30 * j, 190]} label={j} fill={j % 2 ? C.bg : C.a} stroke={j === 1 ? C.r : j % 2 ? C.faint : C.a} ink={j % 2 ? C.mu : C.bg} r={11} size={12} />)}
        <T x={456} y={75} size={16} color={C.mu}>…</T><T x={456} y={195} size={16} color={C.mu}>…</T>
        <T x={240} y={245} size={16} weight={600} color={C.r}>{t('1 tidak pernah kena: 2 tak punya invers di ℤ', '1 is never hit: 2 has no inverse in ℤ')}</T>
        <T x={240} y={272} size={14} color={C.mu}>{t('ℤ tak hingga: satu-satu tidak berarti semua kena', 'ℤ is infinite: one-to-one does not mean onto')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={24} y={75} size={15} color={C.mu}>x</T><T x={24} y={195} size={15} color={C.mu}>{a}x</T>
        {Array.from({ length: 7 }, (_, x) => <Link key={`${a}-${x}`} p={[x7(x), 70]} q={[x7((a * x) % 7), 190]} r1={16} r2={17} color={x === iv ? C.g : C.a} width={x === iv ? 3.5 : 2} />)}
        {Array.from({ length: 7 }, (_, x) => <g key={x}><Node at={[x7(x), 70]} label={x} fill={C.bg} stroke={C.ln} ink={C.fg} /><Node at={[x7(x), 190]} label={x} fill={C.a} /></g>)}
        <T x={240} y={250} size={17} weight={700} color={C.g}>{a} · {iv} = {a * iv} = 1  →  {a}⁻¹ = {iv}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ideal:0 subring vs ideal
const absorb: Story = {
  title: b('Ideal menelan perkalian dari luar; subgelanggang tidak', 'An ideal swallows multiplication from outside; a subring need not'),
  frames: [
    f('ℤ adalah subgelanggang ℚ: jumlah, selisih, dan hasil kali dua bilangan bulat tetap bulat. Tetapi itu hanya ketertutupan di dalam.', 'ℤ is a subring of ℚ: sums, differences and products of two integers stay integers. But that is only closure inside.', String.raw`a,b\in\mathbb Z\Rightarrow a\pm b,\ ab\in\mathbb Z`),
    f('ℤ bukan ideal ℚ. Ideal harus menelan perkalian oleh anggota mana pun dari gelanggang besar: 1 ∈ ℤ dikali ½ ∈ ℚ memberi ½, yang keluar dari ℤ.', 'ℤ is not an ideal of ℚ. An ideal must swallow multiplication by any element of the big ring: 1 ∈ ℤ times ½ ∈ ℚ gives ½, which leaves ℤ.', String.raw`\tfrac12\cdot1=\tfrac12\notin\mathbb Z`),
    f('Bandingkan (2) = bilangan genap di dalam ℤ. Pengali boleh datang dari luar kantong: 3 · 4 = 12 dan (−5) · 6 = −30 tetap genap. Kelipatan 2 dikali bilangan bulat apa pun tetap kelipatan 2, jadi (2) ideal ℤ.', 'Compare (2) = the even numbers inside ℤ. The multiplier may come from outside the bag: 3 · 4 = 12 and (−5) · 6 = −30 stay even. A multiple of 2 times any integer is still a multiple of 2, so (2) is an ideal of ℤ.', String.raw`r\in\mathbb Z,\ a\in(2)\Rightarrow ra\in(2)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={1} frame={k}>
        <rect x={16} y={22} width={448} height={262} rx={18} fill="none" stroke={C.mu} strokeWidth="2" />
        <T x={36} y={52} anchor="start" size={18} weight={700} color={C.mu}>ℚ</T>
        <rect x={40} y={70} width={260} height={196} rx={16} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="2.5" />
        <T x={58} y={98} anchor="start" size={18} weight={700} color={C.a}>ℤ</T>
        {['2 + 3 = 5', '2 · 3 = 6', '2 − 3 = −1'].map((s, i) => <T key={s} x={60} y={136 + i * 28} anchor="start" size={15} weight={600} color={C.g}>{s} ✓</T>)}
        <Node at={[250, 226]} label="1" fill={C.a} r={17} size={15} />
        {[['⅔', 360, 100], ['−¾', 420, 150], ['½', 380, 226]].map(([s, x, y]) => <Node key={String(s)} at={[Number(x), Number(y)]} label={s} fill={C.bg} stroke={C.mu} ink={C.fg} r={17} size={15} />)}
        <At from={1} frame={k}>
          <Arrow from={[269, 226]} to={[360, 226]} color={C.r} width={3} />
          <T x={312} y={214} size={15} weight={700} color={C.r}>× ½</T>
          <T x={380} y={268} size={15} weight={700} color={C.r}>½ ∉ ℤ ✗</T>
        </At>
      </At>
      <At from={2} frame={k}>
        <rect x={16} y={22} width={448} height={262} rx={18} fill="none" stroke={C.a} strokeWidth="2" />
        <T x={36} y={52} anchor="start" size={18} weight={700} color={C.a}>ℤ</T>
        <rect x={40} y={70} width={250} height={200} rx={16} fill={C.g} fillOpacity=".1" stroke={C.g} strokeWidth="2.5" />
        <T x={58} y={98} anchor="start" size={16} weight={700} color={C.g}>(2) = {t('genap', 'evens')}</T>
        <Arrow from={[106, 140]} to={[202, 140]} color={C.g} width={3} />
        <Arrow from={[106, 210]} to={[202, 210]} color={C.g} width={3} />
        <T x={154} y={128} size={14} weight={700} color={C.y}>× 3</T>
        <T x={154} y={198} size={14} weight={700} color={C.y}>× (−5)</T>
        {[['4', 85, 140], ['12', 225, 140], ['6', 85, 210], ['−30', 225, 210]].map(([s, x, y]) => <Node key={String(s)} at={[Number(x), Number(y)]} label={s} fill={C.g} r={19} size={14} />)}
        <T x={165} y={256} size={13} color={C.mu}>…, −2, 0, 2, 8, …</T>
        {[['3', 350, 120], ['−5', 350, 200], ['1', 420, 160], ['7', 420, 240]].map(([s, x, y]) => <Node key={String(s)} at={[Number(x), Number(y)]} label={s} fill={C.bg} stroke={Number(x) < 400 ? C.y : C.mu} ink={C.fg} r={17} size={14} />)}
        <T x={385} y={274} size={13} color={C.mu}>{t('di luar (2)', 'outside (2)')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ideal:1 Z -> Z3, kernel and quotient
const ix = (n: number) => 46 + (n + 3) * 35, tx3 = [120, 240, 360]
const quotientRing: Story = {
  title: b('Homomorfisma gelanggang: kernel ideal, kuosien = bayangan', 'Ring homomorphism: kernel is an ideal, quotient = image'),
  frames: [
    f('φ: ℤ → ℤ₃ mengirim n ke sisanya modulo 3, dan menghormati + serta ×. Banyak bilangan digabung ke satu keluaran. Yang jatuh ke [0] adalah kernel: kelipatan 3, yaitu ideal (3).', 'φ: ℤ → ℤ₃ sends n to its remainder mod 3, and respects both + and ×. Many numbers merge into one output. What lands on [0] is the kernel: the multiples of 3, the ideal (3).', String.raw`\ker\varphi=(3)`),
    f('φ(7) = φ(1) karena selisihnya 7 − 1 = 6 ada di kernel. Jadi koset a + (3) mencatat tepat bilangan yang digabung.', 'φ(7) = φ(1) because their difference 7 − 1 = 6 lies in the kernel. So the coset a + (3) records exactly the merged numbers.', String.raw`\varphi(a)=\varphi(b)\iff a-b\in\ker\varphi`),
    f('Kalikan kelas dengan wakil mana saja: 1 · 2, 4 · 5, 7 · (−1) semuanya jatuh di [2]. Pilihan wakil tidak berpengaruh karena ideal menelan perkalian. Maka [a][b] = [ab] terdefinisi, dan ℤ/(3) ≅ ℤ₃.', 'Multiply classes using any representatives: 1 · 2, 4 · 5, 7 · (−1) all land in [2]. The choice does not matter because the ideal swallows multiplication. So [a][b] = [ab] is well defined, and ℤ/(3) ≅ ℤ₃.', String.raw`(a+3s)(b+3t)=ab+3(at+sb+3st)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), ns = Array.from({ length: 12 }, (_, i) => i - 3)
    const hot = (n: number) => k === 1 ? n === 1 || n === 7 : k === 2 ? [1, 4, 7, 2, 5, -1].includes(n) : true
    return <>
      {ns.map(n => <path key={n} d={pl([[ix(n), 74], [tx3[mod(n, 3)], 152]])} stroke={three[mod(n, 3)]} strokeWidth={k === 1 && hot(n) ? 3 : 1.5} strokeOpacity={hot(n) ? .8 : .2} style={{ transition: 'all .45s' }} />)}
      {ns.map(n => <g key={n} style={{ opacity: hot(n) || k === 0 ? 1 : .35, transition: 'opacity .45s' }}><Node at={[ix(n), 60]} label={neg(n)} fill={three[mod(n, 3)]} r={13} size={13} /></g>)}
      {[0, 1, 2].map(c => <Node key={c} at={[tx3[c], 175]} label={`[${c}]`} fill={three[c]} r={22} size={15} />)}
      <T x={436} y={180} size={14} color={C.mu}>ℤ₃</T>
      <At until={0} frame={k}>
        <T x={240} y={234} size={16} weight={600} color={C.a}>Ker φ = {'{…, −3, 0, 3, 6, …}'} = (3)</T>
        <T x={240} y={262} size={14} color={C.mu}>{t('φ(n) = sisa n dibagi 3', 'φ(n) = remainder of n divided by 3')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={`M${ix(1)},40 V30 H${ix(7)} V40`} fill="none" stroke={C.v} strokeWidth="2" />
        <T x={(ix(1) + ix(7)) / 2} y={24} size={14} weight={600} color={C.v}>7 − 1 = 6 ∈ (3)</T>
        <T x={240} y={240} size={16} weight={600}>φ(7) = φ(1) = [1]</T>
        <T x={240} y={266} size={14} color={C.mu}>{t('sama keluaran ⟺ selisih di kernel', 'same output ⟺ difference in the kernel')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={228} size={15}>[1]·[2]:  1·2 = 2,   4·5 = 20,   7·(−1) = −7</T>
        <T x={240} y={252} size={15} weight={700} color={C.g}>{t('semuanya di [2] ✓', 'all in [2] ✓')}</T>
        <T x={240} y={278} size={15}>[1] + [2]:  4 + 5 = 9 ∈ [0] ✓</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ideal:2 maximal ideals in Z[i]
const gl = (a: number, bb: number): P => [52 + 24 * a, 238 - 24 * bb]
const latticePts = Array.from({ length: 9 }, (_, a) => Array.from({ length: 10 }, (_, j) => [a, j - 1] as [number, number])).flat()
const gaussian: Story = {
  title: b('Ideal maksimal di ℤ[i]: kisi bilangan bulat Gauss', 'Maximal ideals in ℤ[i]: the Gaussian integer lattice'),
  frames: [
    f('Bilangan bulat Gauss a + bi membentuk kisi. Ideal (3) adalah titik-titik 3m + 3ni (biru). Setiap titik bergeser ke tepat satu wakil di kotak 3 × 3, jadi ℤ[i]/(3) punya 9 anggota.', 'The Gaussian integers a + bi form a lattice. The ideal (3) is the points 3m + 3ni (blue). Every point shifts to exactly one representative in the 3 × 3 box, so ℤ[i]/(3) has 9 elements.', String.raw`\mathbb Z[i]/(3)=\{a+bi:\ a,b\in\{0,1,2\}\}`),
    f('Kuosien ini lapangan. Contoh: (1 + i)(2 + i) = 1 + 3i, dan 1 + 3i bergeser 3i ke 1. Jadi (1 + i)⁻¹ = 2 + i. Alasannya: i² = −1 = 2 di 𝔽₃, dan x² + 1 tidak punya akar di 𝔽₃ (0, 1, 2 memberi 1, 2, 2).', 'This quotient is a field. Example: (1 + i)(2 + i) = 1 + 3i, and 1 + 3i shifts by 3i to 1. So (1 + i)⁻¹ = 2 + i. The reason: i² = −1 = 2 in 𝔽₃, and x² + 1 has no root in 𝔽₃ (0, 1, 2 give 1, 2, 2).', String.raw`(1+i)(2+i)=1+3i\equiv1\pmod3`),
    f('Modulo 5 gagal: (2 + i)(2 − i) = 4 − i² = 5 ≡ 0, padahal kedua faktor bukan kelipatan 5. Ideal (2 + i) (hijau) memuat (5) (cincin merah) dan lebih besar, jadi (5) tidak maksimal di ℤ[i] walau 5 prima di ℤ.', 'Modulo 5 fails: (2 + i)(2 − i) = 4 − i² = 5 ≡ 0, although neither factor is a multiple of 5. The ideal (2 + i) (green) contains (5) (red rings) and is bigger, so (5) is not maximal in ℤ[i] even though 5 is prime in ℤ.', String.raw`(5)\subsetneq(2+i)\subsetneq\mathbb Z[i]`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), in3 = (a: number, c: number) => c >= 0 && a % 3 === 0 && c % 3 === 0, in2i = (a: number, c: number) => mod(a - 2 * c, 5) === 0
    return <>
      <path d={`M${gl(-0.6, 0)[0]},${gl(0, 0)[1]} H${gl(8.6, 0)[0]} M${gl(0, 0)[0]},${gl(0, -1.4)[1]} V${gl(0, 8.6)[1]}`} stroke={C.ln} strokeWidth="1.4" />
      <T x={258} y={242} anchor="start" size={12} color={C.mu}>Re</T>
      <T x={52} y={28} size={12} color={C.mu}>Im</T>
      <At until={1} frame={k}><rect x={gl(-0.5, 2.5)[0]} y={gl(0, 2.5)[1]} width={72} height={72} rx={6} fill={C.a} fillOpacity=".12" stroke={C.a} strokeDasharray="5 4" /></At>
      {latticePts.map(([a, c]) => <circle key={`${a},${c}`} cx={gl(a, c)[0]} cy={gl(a, c)[1]} r={2.5} fill={C.ln} />)}
      <At until={1} frame={k}>{latticePts.filter(([a, c]) => in3(a, c)).map(([a, c]) => <Dot key={`${a},${c}`} at={gl(a, c)} color={C.a} r={6} />)}</At>
      <At from={1} until={1} frame={k}>
        <path d={`M${gl(1, 3)[0] - 4},${gl(1, 3)[1] + 4} Q26,202 ${gl(1, 0)[0] - 6},${gl(1, 0)[1] - 5}`} fill="none" stroke={C.v} strokeWidth="2" strokeDasharray="5 4" />
        <Dot at={gl(1, 1)} color={C.y} r={7} /><Dot at={gl(2, 1)} color={C.g} r={7} /><Dot at={gl(1, 3)} color={C.v} r={7} /><Dot at={gl(1, 0)} color={C.v} r={7} hollow />
      </At>
      <At from={2} frame={k}>
        {latticePts.filter(([a, c]) => in2i(a, c)).map(([a, c]) => <Dot key={`${a},${c}`} at={gl(a, c)} color={C.g} r={5} />)}
        {latticePts.filter(([a, c]) => a % 5 === 0 && mod(c, 5) === 0 && c >= 0).map(([a, c]) => <circle key={`${a},${c}`} cx={gl(a, c)[0]} cy={gl(a, c)[1]} r={10} fill="none" stroke={C.r} strokeWidth="2.5" />)}
        <Dot at={gl(2, 1)} color={C.g} r={7} /><Dot at={gl(2, -1)} color={C.r} r={7} />
        <T x={gl(2, 1)[0] + 9} y={gl(2, 1)[1] - 8} anchor="start" size={12} weight={700} color={C.g}>2+i</T>
        <T x={gl(2, -1)[0] + 10} y={gl(2, -1)[1] + 5} anchor="start" size={12} weight={700} color={C.r}>2−i</T>
      </At>
      <At until={0} frame={k}>
        <T x={276} y={70} anchor="start" size={18} weight={700}>ℤ[i] / (3)</T>
        <Dot at={[282, 100]} color={C.a} r={6} /><T x={294} y={105} anchor="start" size={15}>(3) = {'{3m + 3ni}'}</T>
        <T x={276} y={144} anchor="start" size={15} weight={600}>{t('9 kelas:', '9 classes:')}</T>
        <T x={276} y={168} anchor="start" size={13}>a + bi,  a, b ∈ {'{0, 1, 2}'}</T>
        <T x={276} y={200} anchor="start" size={13} color={C.mu}>{t('kotak putus-putus = wakil', 'dashed box = representatives')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={276} y={70} anchor="start" size={16} weight={600}><tspan fill={C.y}>(1 + i)</tspan><tspan fill={C.g}>(2 + i)</tspan></T>
        <T x={276} y={98} anchor="start" size={15}>= 2 + 3i + i² = <tspan fill={C.v}>1 + 3i</tspan></T>
        <T x={276} y={128} anchor="start" size={15} weight={600} color={C.v}>1 + 3i ≡ 1  (mod 3)</T>
        <T x={276} y={162} anchor="start" size={16} weight={700} color={C.g}>(1 + i)⁻¹ = 2 + i</T>
        <T x={276} y={200} anchor="start" size={13} color={C.mu}>x² + 1 {t('di', 'over')} 𝔽₃: 1, 2, 2 ≠ 0</T>
      </At>
      <At from={2} frame={k}>
        <T x={276} y={70} anchor="start" size={16} weight={600}>(2 + i)(2 − i)</T>
        <T x={276} y={98} anchor="start" size={16} weight={600} color={C.r}>= 4 − i² = 5 ≡ 0</T>
        <T x={276} y={136} anchor="start" size={15}>(5) ⊊ (2 + i) ⊊ ℤ[i]</T>
        <T x={276} y={164} anchor="start" size={15} weight={600} color={C.r}>{t('(5) tidak maksimal', '(5) is not maximal')}</T>
        <Dot at={[282, 208]} color={C.g} r={5} /><T x={294} y={213} anchor="start" size={13}>{t('anggota (2 + i)', 'members of (2 + i)')}</T>
        <circle cx={282} cy={236} r={8} fill="none" stroke={C.r} strokeWidth="2.5" /><T x={294} y={241} anchor="start" size={13}>{t('anggota (5)', 'members of (5)')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- ideal:3 maximal <-> field, inside Z6
const maximalField: Story = {
  title: b('Ideal maksimal ⟺ kuosiennya lapangan', 'Maximal ideal ⟺ the quotient is a field'),
  frames: [
    f('Ideal-ideal ℤ₆ tersusun dari bawah ke atas: (0) ⊂ (2), (3) ⊂ ℤ₆. (2) dan (3) maksimal: tidak ada ideal proper di antara mereka dan ℤ₆. (0) tidak maksimal, karena (2) ada di atasnya.', 'The ideals of ℤ₆ stack from bottom to top: (0) ⊂ (2), (3) ⊂ ℤ₆. (2) and (3) are maximal: no proper ideal fits between them and ℤ₆. (0) is not maximal, since (2) sits above it.'),
    f('Lihat kuosiennya. ℤ₆/(2) punya dua kelas {0, 2, 4} dan {1, 3, 5}, yaitu 𝔽₂; ℤ₆/(3) adalah 𝔽₃. Keduanya lapangan. ℤ₆/(0) = ℤ₆ bukan lapangan karena 2 · 3 = 0.', 'Look at the quotients. ℤ₆/(2) has two classes {0, 2, 4} and {1, 3, 5}, which is 𝔽₂; ℤ₆/(3) is 𝔽₃. Both are fields. ℤ₆/(0) = ℤ₆ is not a field because 2 · 3 = 0.', String.raw`\mathbb Z_6/(2)\cong\mathbb F_2,\quad\mathbb Z_6/(3)\cong\mathbb F_3`),
    f('Mengapa maksimal memberi invers: ambil a = 3 di luar M = (2). M + (3) memuat 4 + 3 = 7 = 1, jadi seluruh ℤ₆. Dari 1 = 4 + 1 · 3 didapat [1][3] = [1] di kuosien: [3] punya invers.', 'Why maximal gives inverses: take a = 3 outside M = (2). M + (3) contains 4 + 3 = 7 = 1, so it is all of ℤ₆. From 1 = 4 + 1 · 3 we get [1][3] = [1] in the quotient: [3] has an inverse.', String.raw`1=m+ra\Rightarrow[r][a]=[1]`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), top: P = [140, 52], l: P = [82, 150], r: P = [212, 150], bot: P = [147, 248]
    const edge = (p: P, q: P, c: string) => <path d={pl([[p[0], p[1] + 17], [q[0], q[1] - 17]])} stroke={c} strokeWidth="2.5" />
    return <>
      {edge(top, l, C.g)}{edge(top, r, C.g)}{edge(l, bot, C.ln)}{edge(r, bot, C.ln)}
      <Chip x={top[0]} y={top[1]} w={150} h={34} label="ℤ₆ = (1)" />
      <Chip x={l[0]} y={l[1]} w={128} h={34} size={14} label="(2) = {0, 2, 4}" tone={C.g} />
      <Chip x={r[0]} y={r[1]} w={104} h={34} size={14} label="(3) = {0, 3}" tone={C.g} />
      <Chip x={bot[0]} y={bot[1]} w={96} h={34} size={14} label="(0) = {0}" tone={k === 1 ? C.r : undefined} />
      <At until={0} frame={k}>
        <T x={288} y={80} anchor="start" size={15} weight={700} color={C.g}>{t('maksimal: (2), (3)', 'maximal: (2), (3)')}</T>
        <T x={288} y={106} anchor="start" size={13} color={C.mu}>{t('tidak ada ideal di antara', 'nothing in between')}</T>
        <T x={288} y={126} anchor="start" size={13} color={C.mu}>{t('mereka dan ℤ₆', 'them and ℤ₆')}</T>
        <T x={288} y={196} anchor="start" size={15} weight={600}>(0) ⊊ (2) ⊊ ℤ₆</T>
        <T x={288} y={220} anchor="start" size={13} color={C.r}>{t('(0) bukan maksimal', '(0) is not maximal')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={288} y={64} anchor="start" size={16} weight={700} color={C.g}>ℤ₆/(2) ≅ 𝔽₂ ✓</T>
        <T x={288} y={88} anchor="start" size={13} color={C.mu}>{'{0, 2, 4}, {1, 3, 5}'}</T>
        <T x={288} y={130} anchor="start" size={16} weight={700} color={C.g}>ℤ₆/(3) ≅ 𝔽₃ ✓</T>
        <T x={288} y={154} anchor="start" size={13} color={C.mu}>{'{0, 3}, {1, 4}, {2, 5}'}</T>
        <T x={288} y={210} anchor="start" size={15} weight={700} color={C.r}>ℤ₆/(0) = ℤ₆ ✗</T>
        <T x={288} y={234} anchor="start" size={13} color={C.r}>2 · 3 = 0</T>
      </At>
      <At from={2} frame={k}>
        <T x={288} y={64} anchor="start" size={15} weight={600}>M = (2),  a = 3 ∉ M</T>
        <T x={288} y={96} anchor="start" size={15}>4 + 3 = 7 = 1</T>
        <T x={288} y={124} anchor="start" size={15}>⇒ M + (3) = ℤ₆</T>
        <T x={288} y={164} anchor="start" size={15} weight={600} color={C.v}>1 = 4 + 1 · 3</T>
        <T x={288} y={192} anchor="start" size={15} weight={600} color={C.g}>⇒ [1][3] = [1]</T>
        <T x={288} y={226} anchor="start" size={13} color={C.mu}>{t('[3] punya invers di ℤ₆/(2)', '[3] is invertible in ℤ₆/(2)')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:0 degrees add; long division by coefficients
const dcol = [90, 160, 230, 300]
const DRow = ({ y, vals, color = C.fg }: { y: number; vals: (string | null)[]; color?: string }) => <g>
  {vals.map((v, i) => v === null ? null : <T key={i} x={dcol[i]} y={y} size={17} weight={600} color={v === '0' ? C.mu : color}>{v}</T>)}
</g>
const longDivision: Story = {
  title: b('Derajat hasil kali dan algoritma pembagian', 'Product degree and the division algorithm'),
  frames: [
    f('Atas lapangan, suku utama tidak pernah hilang: x · x² = x³, jadi derajat hasil kali = jumlah derajat (1 + 2 = 3). Di ℤ₆ bisa gagal: (2x + 1)(3x + 1) = 5x + 1, karena 2 · 3 = 0.', 'Over a field, leading terms never vanish: x · x² = x³, so the degree of a product is the sum of degrees (1 + 2 = 3). In ℤ₆ this can fail: (2x + 1)(3x + 1) = 5x + 1, because 2 · 3 = 0.', String.raw`\deg(fg)=\deg f+\deg g`),
    f('Bagi f = x³ + 1 oleh g = x + 1, cukup dengan koefisien. Suku utama: x³ ÷ x = x². Kurangkan x² · (x + 1) = x³ + x²; suku x³ hilang dan sisanya −x² + 1.', 'Divide f = x³ + 1 by g = x + 1 using only coefficients. Leading terms: x³ ÷ x = x². Subtract x² · (x + 1) = x³ + x²; the x³ term disappears and −x² + 1 is left.', String.raw`x^3+1-x^2(x+1)=-x^2+1`),
    f('Ulangi: −x² ÷ x = −x, kurangkan, tersisa x + 1; lalu x ÷ x = 1, kurangkan, tersisa 0. Setiap langkah membuang satu suku utama, jadi derajat sisa terus turun.', 'Repeat: −x² ÷ x = −x, subtract, leaving x + 1; then x ÷ x = 1, subtract, leaving 0. Each step removes one leading term, so the remainder degree keeps dropping.', String.raw`x^3+1=(x+1)(x^2-x+1)+0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), line = (y: number) => <path d={`M60,${y} H330`} stroke={C.ln} strokeWidth="1.5" />
    return <>
      <At until={0} frame={k}>
        <T x={30} y={52} anchor="start" size={13} color={C.mu}>{t('atas ℚ (lapangan)', 'over ℚ (a field)')}</T>
        <T x={30} y={84} anchor="start" size={17} weight={600}>(<tspan fill={C.a}>x</tspan> + 1)(<tspan fill={C.a}>x²</tspan> − x + 1) = <tspan fill={C.a}>x³</tspan> + 1</T>
        <T x={30} y={114} anchor="start" size={15} weight={600} color={C.g}>deg 1 + deg 2 = deg 3 ✓</T>
        <T x={30} y={164} anchor="start" size={13} color={C.mu}>{t('atas ℤ₆ (bukan lapangan)', 'over ℤ₆ (not a field)')}</T>
        <T x={30} y={196} anchor="start" size={17} weight={600}>(<tspan fill={C.r}>2x</tspan> + 1)(<tspan fill={C.r}>3x</tspan> + 1) = <tspan fill={C.r}>6x²</tspan> + 5x + 1</T>
        <T x={30} y={226} anchor="start" size={15}>= 5x + 1,  {t('karena', 'since')} 2 · 3 = 6 = 0</T>
        <T x={30} y={258} anchor="start" size={15} weight={600} color={C.r}>deg 1 + deg 1 ≠ deg 1 ✗</T>
      </At>
      <At from={1} frame={k}>
        {['x³', 'x²', 'x', '1'].map((s, i) => <T key={s} x={dcol[i]} y={40} size={14} weight={700} color={C.mu}>{s}</T>)}
        <DRow y={72} vals={['1', '0', '0', '1']} />
        <T x={345} y={72} anchor="start" size={14} weight={600}>f = x³ + 1</T>
        <DRow y={104} vals={['1', '1', null, null]} color={C.a} />
        <T x={345} y={104} anchor="start" size={14} color={C.a}>− x² · (x + 1)</T>
        {line(114)}
        <DRow y={140} vals={['0', '−1', '0', '1']} />
        <T x={345} y={140} anchor="start" size={14} color={C.mu}>= −x² + 1</T>
        <T x={345} y={40} anchor="start" size={15} weight={700} color={C.v}>q = x²{k >= 2 ? ' − x + 1' : ''}</T>
      </At>
      <At from={2} frame={k}>
        <DRow y={172} vals={[null, '−1', '−1', null]} color={C.a} />
        <T x={345} y={172} anchor="start" size={14} color={C.a}>− (−x) · (x + 1)</T>
        {line(182)}
        <DRow y={208} vals={[null, '0', '1', '1']} />
        <T x={345} y={208} anchor="start" size={14} color={C.mu}>= x + 1</T>
        <DRow y={240} vals={[null, null, '1', '1']} color={C.a} />
        <T x={345} y={240} anchor="start" size={14} color={C.a}>− 1 · (x + 1)</T>
        {line(250)}
        <DRow y={276} vals={[null, null, '0', '0']} />
        <T x={345} y={276} anchor="start" size={15} weight={700} color={C.g}>r = 0</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:1 irreducible depends on the field
const fieldDep: Story = {
  title: b('Tak tereduksi atau tidak: tergantung lapangannya', 'Irreducible or not: it depends on the field'),
  frames: [
    f('x² − 2 berderajat 2, jadi tereduksi tepat jika punya akar. Calon akar rasional ±1, ±2 memberi −1 dan 2, bukan 0: atas ℚ pohonnya berhenti. Atas ℝ, √2 tersedia dan x² − 2 pecah menjadi dua faktor linear.', 'x² − 2 has degree 2, so it is reducible exactly when it has a root. The rational candidates ±1, ±2 give −1 and 2, not 0: over ℚ the tree stops. Over ℝ, √2 is available and x² − 2 splits into two linear factors.', String.raw`x^2-2=(x-\sqrt2)(x+\sqrt2)`),
    f('Status yang sama bisa berubah lagi saat lapangan diperbesar. x² + 1 tak tereduksi atas ℚ dan ℝ, tetapi atas ℂ menjadi (x − i)(x + i).', 'The status can change again as the field grows. x² + 1 is irreducible over ℚ and ℝ, but over ℂ it becomes (x − i)(x + i).', String.raw`x^2+1=(x-i)(x+i)`),
    f('Hati-hati: "tanpa akar" hanya cukup untuk derajat 2 dan 3. x⁴ + 4 selalu ≥ 4, jadi tanpa akar real, namun atas ℚ ia sama dengan (x² + 2x + 2)(x² − 2x + 2).', 'Careful: "no roots" is enough only in degrees 2 and 3. x⁴ + 4 is always ≥ 4, so it has no real root, yet over ℚ it equals (x² + 2x + 2)(x² − 2x + 2).', String.raw`x^4+4=(x^2+2)^2-(2x)^2=(x^2+2x+2)(x^2-2x+2)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), irr = t('tak tereduksi', 'irreducible'), cols = [175, 290, 405]
    return <>
      <At until={0} frame={k}>
        <T x={120} y={40} size={16} weight={700} color={C.mu}>{t('atas ℚ', 'over ℚ')}</T>
        <T x={360} y={40} size={16} weight={700} color={C.mu}>{t('atas ℝ', 'over ℝ')}</T>
        <path d="M240,24 V270" stroke={C.faint} strokeWidth="1.5" />
        <Chip x={120} y={95} w={96} label="x² − 2" tone={C.a} />
        <T x={120} y={150} size={13} color={C.mu}>f(±1) = −1, f(±2) = 2</T>
        <Chip x={120} y={200} w={130} size={14} label={`${irr} ✓`} tone={C.a} />
        <Chip x={360} y={95} w={96} label="x² − 2" tone={C.a} />
        <path d="M345,111 L305,175 M375,111 L415,175" stroke={C.ln} strokeWidth="2" />
        <Chip x={300} y={192} w={90} label="x − √2" tone={C.g} />
        <Chip x={420} y={192} w={90} label="x + √2" tone={C.g} />
        <T x={240} y={262} size={14} color={C.mu}>±√2 ∉ ℚ,  ±√2 ∈ ℝ</T>
      </At>
      <At from={1} until={1} frame={k}>
        {['ℚ', 'ℝ', 'ℂ'].map((s, i) => <T key={s} x={cols[i]} y={60} size={18} weight={700} color={C.mu}>{s}</T>)}
        <T x={62} y={125} size={16} weight={700}>x² − 2</T>
        <T x={62} y={195} size={16} weight={700}>x² + 1</T>
        {[[irr, '(x−√2)(x+√2)', '(x−√2)(x+√2)'], [irr, irr, '(x−i)(x+i)']].map((row, r) => row.map((s, c) => <T key={`${r}${c}`} x={cols[c]} y={125 + r * 70} size={14} weight={600} color={s === irr ? C.a : C.g}>{s}</T>))}
        <path d="M20,90 H460 M20,160 H460" stroke={C.faint} />
        <T x={240} y={258} size={13} color={C.mu}>{t('akar di lapangan lebih besar membuka faktor baru', 'roots in a bigger field open up new factors')}</T>
      </At>
      <At from={2} frame={k}>
        <Chip x={240} y={50} w={96} label="x⁴ + 4" tone={C.a} />
        <path d="M220,66 L145,128 M260,66 L335,128" stroke={C.ln} strokeWidth="2" />
        <Chip x={135} y={146} w={140} label="x² + 2x + 2" tone={C.g} />
        <Chip x={345} y={146} w={140} label="x² − 2x + 2" tone={C.g} />
        <T x={240} y={208} size={14} color={C.mu}>x⁴ + 4 ≥ 4 &gt; 0: {t('tanpa akar real', 'no real root')}</T>
        <T x={240} y={236} size={15} weight={700} color={C.r}>{t('tetap tereduksi atas ℚ', 'still reducible over ℚ')}</T>
        <T x={240} y={266} size={14}>(x² + 2)² − (2x)² = x⁴ + 4</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:2 Euclid in Q[x], degree staircase
const euclid: Story = {
  title: b('Ideal utama lewat Euclid: derajat terus turun', 'Principal ideals via Euclid: the degree keeps falling'),
  frames: [
    f('Ideal (f, g) memuat semua af + bg. Jalankan algoritma Euclid untuk f = x³ − 1 dan g = x² − 1: x³ − 1 = x · (x² − 1) + (x − 1). Sisa x − 1 berderajat 1, lebih kecil dari 2.', 'The ideal (f, g) contains every af + bg. Run Euclid’s algorithm on f = x³ − 1 and g = x² − 1: x³ − 1 = x · (x² − 1) + (x − 1). The remainder x − 1 has degree 1, smaller than 2.', String.raw`x^3-1=x(x^2-1)+(x-1)`),
    f('Bagi lagi: x² − 1 = (x + 1)(x − 1) + 0. Derajat turun 3, 2, 1, lalu sisa 0, jadi proses pasti berhenti. Sisa tak nol terakhir adalah fpb: x − 1.', 'Divide again: x² − 1 = (x + 1)(x − 1) + 0. The degrees fall 3, 2, 1, then remainder 0, so the process must stop. The last nonzero remainder is the gcd: x − 1.', String.raw`\gcd(f,g)=x-1`),
    f('Substitusi balik: x − 1 = 1 · f − x · g, jadi x − 1 ada di ideal. Ia anggota tak nol berderajat terkecil, dan setiap af + bg kelipatannya. Maka (f, g) = (x − 1): ideal utama.', 'Back substitution: x − 1 = 1 · f − x · g, so x − 1 lies in the ideal. It is the nonzero member of smallest degree, and every af + bg is a multiple of it. So (f, g) = (x − 1): a principal ideal.', String.raw`x-1=1\cdot f-x\cdot g,\quad(f,g)=(x-1)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const bars: [string, number, string, number][] = [['f = x³ − 1', 3, C.a, 0], ['g = x² − 1', 2, C.a, 0], ['x − 1', 1, k >= 1 ? C.g : C.y, 0], ['0', 0, C.mu, 1]]
    return <>
      <path d="M30,200 H450" stroke={C.ln} strokeWidth="1.5" />
      {bars.map(([l, d, c, from], i) => <At key={i} from={from} frame={k}>
        {d > 0
          ? <rect x={50 + i * 105} y={200 - d * 45} width={80} height={d * 45} rx={6} fill={c} fillOpacity=".25" stroke={c} strokeWidth="2.5" style={{ transition: 'all .45s' }} />
          : <path d="M365,200 h80" stroke={C.mu} strokeWidth="3" strokeDasharray="6 4" />}
        <T x={90 + i * 105} y={192 - d * 45} size={14} weight={700} color={c}>{l}</T>
        <T x={90 + i * 105} y={222} size={13} color={C.mu}>{d > 0 ? `deg ${d}` : t('nol', 'zero')}</T>
      </At>)}
      <At until={1} frame={k}><T x={240} y={252} size={15}>x³ − 1 = x · (x² − 1) + (x − 1)</T></At>
      <At from={1} until={1} frame={k}>
        <T x={240} y={278} size={15}>x² − 1 = (x + 1)(x − 1) + 0  ⇒  <tspan fill={C.g} fontWeight={700}>{t('fpb', 'gcd')} = x − 1</tspan></T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={252} size={16} weight={600} color={C.g}>x − 1 = 1 · f − x · g</T>
        <T x={240} y={278} size={16} weight={700} color={C.v}>(f, g) = (x − 1)</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:3 F2[x]/(x^2+x+1) is a 4-element field
const f4 = ['0', '1', 'x', 'x+1'], f4bits: [number, number][] = [[0, 0], [1, 0], [0, 1], [1, 1]]
/** Multiply a0 + a1 x by b0 + b1 x in F2[x] modulo x^2 = s0 + s1 x. */
const mulF2 = (r: number, c: number, s: [number, number]) => {
  const [a0, a1] = f4bits[r], [b0, b1] = f4bits[c], top = a1 * b1
  const c0 = (a0 * b0 + top * s[0]) % 2, c1 = (a0 * b1 + a1 * b0 + top * s[1]) % 2
  return f4bits.findIndex(([p, q]) => p === c0 && q === c1)
}
const buildField: Story = {
  title: b('Polinom tak tereduksi membangun lapangan: 𝔽₂[x]/(x² + x + 1)', 'An irreducible polynomial builds a field: 𝔽₂[x]/(x² + x + 1)'),
  frames: [
    f('Di 𝔽₂[x] modulo x² + x + 1, setiap polinom tereduksi ke sisa berderajat < 2: hanya 0, 1, x, x + 1. Aturan hitungnya x² = x + 1 (karena −1 = 1 di 𝔽₂). Contoh: x³ = x · x² = x² + x = 1.', 'In 𝔽₂[x] modulo x² + x + 1, every polynomial reduces to a remainder of degree < 2: only 0, 1, x, x + 1. The rule is x² = x + 1 (since −1 = 1 in 𝔽₂). Example: x³ = x · x² = x² + x = 1.', String.raw`x^2\equiv x+1,\quad x^3\equiv1`),
    f('Tabel perkalian keempat kelas: setiap baris tak nol memuat 1 (hijau), jadi setiap anggota tak nol punya invers, misalnya x · (x + 1) = 1. Ini lapangan dengan 4 anggota, karena x² + x + 1 tak tereduksi: 0 dan 1 bukan akarnya.', 'The multiplication table of the four classes: every nonzero row contains a 1 (green), so every nonzero element has an inverse, for example x · (x + 1) = 1. This is a field with 4 elements, because x² + x + 1 is irreducible: 0 and 1 are not roots.', String.raw`x(x+1)=x^2+x\equiv1`),
    f('Bandingkan x² + 1 = (x + 1)², yang tereduksi di 𝔽₂. Di 𝔽₂[x]/(x² + 1), (x + 1)(x + 1) = 0 dengan faktor tak nol (merah): pembagi nol, jadi bukan lapangan.', 'Compare x² + 1 = (x + 1)², which is reducible over 𝔽₂. In 𝔽₂[x]/(x² + 1), (x + 1)(x + 1) = 0 with nonzero factors (red): a zero divisor, so not a field.', String.raw`(x+1)^2=x^2+1\equiv0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    const tone = (s: [number, number]) => (r: number, c: number) => { const v = mulF2(r, c, s); return v === 1 ? C.g : v === 0 && r && c ? C.r : undefined }
    return <>
      <At until={0} frame={k}>
        {f4.map((s, i) => <Chip key={s} x={90 + i * 100} y={90} w={74} h={40} size={18} label={s === 'x+1' ? 'x + 1' : s} tone={C.a} />)}
        <T x={240} y={44} size={14} color={C.mu}>{t('4 sisa berderajat < 2', '4 remainders of degree < 2')}</T>
        <T x={240} y={170} size={22} weight={700} color={C.v}>x² = x + 1</T>
        <T x={240} y={200} size={13} color={C.mu}>{t('dari x² + x + 1 = 0 dan −1 = 1 di 𝔽₂', 'from x² + x + 1 = 0 and −1 = 1 in 𝔽₂')}</T>
        <T x={240} y={250} size={16} weight={600}>x³ = x · x² = x² + x = (x + 1) + x = 1</T>
      </At>
      <At from={1} frame={k}>
        <T x={120} y={36} size={14} weight={700}>mod x² + x + 1</T>
        <Grid2 x0={20} y0={46} cell={40} heads={f4} sym="×" val={(r, c) => f4[mulF2(r, c, [1, 1])]} tone={tone([1, 1])} />
      </At>
      <At from={1} until={1} frame={k}>
        <T x={256} y={86} anchor="start" size={16}>x · x = x + 1</T>
        <T x={256} y={116} anchor="start" size={16} weight={700} color={C.g}>x · (x + 1) = 1</T>
        <T x={256} y={146} anchor="start" size={16}>(x + 1)² = x</T>
        <T x={256} y={186} anchor="start" size={13} color={C.g}>{t('setiap baris tak nol memuat 1', 'every nonzero row has a 1')}</T>
        <T x={256} y={222} anchor="start" size={18} weight={700} color={C.v}>x⁻¹ = x + 1</T>
      </At>
      <At from={2} frame={k}>
        <T x={355} y={36} size={14} weight={700}>mod x² + 1</T>
        <Grid2 x0={255} y0={46} cell={40} heads={f4} sym="×" val={(r, c) => f4[mulF2(r, c, [1, 0])]} tone={tone([1, 0])} />
        <T x={120} y={276} size={15} weight={700} color={C.g}>{t('lapangan 𝔽₄ ✓', 'the field 𝔽₄ ✓')}</T>
        <T x={355} y={276} size={15} weight={700} color={C.r}>(x + 1)² = 0 ✗</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:4 p^d classes
const subs = '₀₁₂₃₄₅', sups = '⁰¹²³⁴⁵⁶'
const classCount: Story = {
  title: b('Hitung kelas: d slot, masing-masing p pilihan', 'Counting classes: d slots, p choices each'),
  frames: [
    f('Setiap kelas di 𝔽₂[x]/(q), dengan deg q = 2, punya tepat satu wakil sisa a₁x + a₀. Ada dua slot, masing-masing 0 atau 1: 2 · 2 = 4 kelas, yaitu 0, 1, x, x + 1.', 'Every class in 𝔽₂[x]/(q), with deg q = 2, has exactly one remainder representative a₁x + a₀. There are two slots, each 0 or 1: 2 · 2 = 4 classes, namely 0, 1, x, x + 1.', String.raw`2\cdot2=2^2=4`),
    f('Dengan p = 3 dan d = 2, setiap slot punya 3 pilihan: 3 · 3 = 9 kelas. Hitungan ini tidak peduli apakah q tak tereduksi; q = x² juga memberi 9 kelas, hanya saja bukan lapangan.', 'With p = 3 and d = 2, each slot has 3 choices: 3 · 3 = 9 classes. The count does not care whether q is irreducible; q = x² also gives 9 classes, it just is not a field.', String.raw`3\cdot3=3^2=9`),
    f('Geser d untuk p = 2: ada d slot koefisien, masing-masing 2 pilihan bebas. Setiap titik adalah satu kelas, dan jumlahnya 2 · 2 ⋯ 2 = 2^d.', 'Move d for p = 2: there are d coefficient slots, each with 2 free choices. Each dot is one class, and there are 2 · 2 ⋯ 2 = 2^d of them.', String.raw`\#=p^d`),
  ],
  control: { label: b('Derajat d (p = 2)', 'Degree d (p = 2)'), min: 1, max: 6, step: 1, initial: 3 },
  controlFrom: 2,
  readout: d => String.raw`2^{${d}}=${2 ** d}`,
  draw: (k, value, lang) => {
    const t = tr(lang), d = value, n = 2 ** d
    const label3 = (a1: number, a0: number) => a1 === 0 ? String(a0) : `${a1 === 1 ? '' : a1}x${a0 ? ` + ${a0}` : ''}`
    return <>
      <At until={0} frame={k}>
        <Chip x={90} y={80} w={56} h={44} size={18} label="a₁" tone={C.a} /><T x={135} y={86} size={18} weight={600}>x +</T>
        <Chip x={190} y={80} w={56} h={44} size={18} label="a₀" tone={C.g} />
        <T x={90} y={134} size={15} color={C.a}>0 / 1</T><T x={190} y={134} size={15} color={C.g}>0 / 1</T>
        <T x={140} y={186} size={20} weight={700} color={C.v}>2 · 2 = 4</T>
        {['0', '1', 'x', 'x + 1'].map((s, i) => <Chip key={s} x={370} y={60 + i * 50} w={90} h={36} size={16} label={s} />)}
        <T x={240} y={262} size={13} color={C.mu}>{t('wakil unik: sisa berderajat < 2', 'unique representative: remainder of degree < 2')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {[0, 1, 2].map(a0 => <T key={a0} x={100 + a0 * 95} y={44} size={14} color={C.mu}>a₀ = {a0}</T>)}
        {[0, 1, 2].map(a1 => [0, 1, 2].map(a0 => <Chip key={`${a1}${a0}`} x={100 + a0 * 95} y={84 + a1 * 60} w={82} h={36} size={15} label={label3(a1, a0)} tone={three[a1]} />))}
        <T x={330} y={90} anchor="start" size={14} color={C.mu}>{t('baris: a₁ = 0, 1, 2', 'rows: a₁ = 0, 1, 2')}</T>
        <T x={330} y={150} anchor="start" size={20} weight={700} color={C.v}>3 · 3 = 9</T>
        <T x={240} y={272} size={13} color={C.mu}>𝔽₃[x]/(q),  deg q = 2</T>
      </At>
      <At from={2} frame={k}>
        {Array.from({ length: d }, (_, i) => <g key={i}>
          <Chip x={240 + (i - (d - 1) / 2) * 62} y={56} w={50} h={40} size={16} label={`a${subs[d - 1 - i]}`} tone={C.a} />
          <T x={240 + (i - (d - 1) / 2) * 62} y={98} size={13} color={C.mu}>× 2</T>
        </g>)}
        {Array.from({ length: n }, (_, j) => { const cols = Math.min(n, 8), rows = Math.ceil(n / 8); return <circle key={j} cx={180 + ((j % 8) - (cols - 1) / 2) * 17} cy={190 + (Math.floor(j / 8) - (rows - 1) / 2) * 17} r={6} fill={C.v} /> })}
        <T x={380} y={196} size={22} weight={700} color={C.v}>2{sups[d]} = {n}</T>
        <T x={380} y={222} size={13} color={C.mu}>{t('kelas', 'classes')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- division:5 unique factorization
const PB = ({ x, y, label, tone = C.a }: { x: number; y: number; label: string; tone?: string }) => <Chip x={x} y={y} w={label.length * 8.6 + 20} h={30} size={15} label={label} tone={tone} />
const uniqueFact: Story = {
  title: b('Faktorisasi tunggal: dua jalur, daun yang sama', 'Unique factorization: two routes, the same leaves'),
  frames: [
    f('Faktorkan 2x³ + 2 atas ℚ. Jalur kiri: (2x + 2)(x² − x + 1), lalu 2x + 2 = 2(x + 1). Berhenti ketika semua daun tak tereduksi: x² − x + 1 tanpa akar real (diskriminan −3).', 'Factor 2x³ + 2 over ℚ. Left route: (2x + 2)(x² − x + 1), then 2x + 2 = 2(x + 1). Stop when every leaf is irreducible: x² − x + 1 has no real root (discriminant −3).', String.raw`2x^3+2=2(x+1)(x^2-x+1)`),
    f('Jalur kanan mulai dengan (x + 1)(2x² − 2x + 2), tetapi daunnya sama: 2, x + 1, x² − x + 1. Faktorisasi tunggal: hanya urutan dan faktor konstanta (unit) yang bisa berbeda. Memilih faktor monik menghapus ambiguitas itu.', 'The right route starts with (x + 1)(2x² − 2x + 2), but the leaves are the same: 2, x + 1, x² − x + 1. Unique factorization: only the order and constant (unit) factors may differ. Choosing monic factors removes that ambiguity.', String.raw`f=c\,p_1^{m_1}\cdots p_r^{m_r}`),
    f('Lapangan menentukan daunnya. Atas 𝔽₃, (x + 1)³ = x³ + 3x² + 3x + 1 = x³ + 1, jadi 2x³ + 2 = 2(x + 1)³. x² − x + 1 bukan lagi daun, karena di 𝔽₃ ia sama dengan (x + 1)².', 'The field decides the leaves. Over 𝔽₃, (x + 1)³ = x³ + 3x² + 3x + 1 = x³ + 1, so 2x³ + 2 = 2(x + 1)³. x² − x + 1 is no longer a leaf, since over 𝔽₃ it equals (x + 1)².', String.raw`2x^3+2=2(x+1)^3\quad(\mathbb F_3)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), ln = (d: string) => <path d={d} stroke={C.ln} strokeWidth="2" fill="none" />
    return <>
      <At until={1} frame={k}>
        <PB x={240} y={36} label="2x³ + 2" tone={C.v} />
        {ln('M205,50 L95,97 M220,51 L190,97')}
        <PB x={80} y={112} label="2x + 2" tone={C.y} />
        <PB x={190} y={112} label="x² − x + 1" tone={C.g} />
        {ln('M70,127 L42,175 M90,127 L98,175 M190,127 V175')}
        <PB x={38} y={190} label="2" tone={C.y} /><PB x={98} y={190} label="x + 1" /><PB x={190} y={190} label="x² − x + 1" tone={C.g} />
        <T x={190} y={222} size={12} color={C.mu}>(−1)² − 4 = −3 &lt; 0</T>
        <T x={125} y={256} size={15} weight={600}>2 · (x + 1)(x² − x + 1)</T>
      </At>
      <At from={1} until={1} frame={k}>
        {ln('M275,51 L295,97 M290,49 L395,97')}
        <PB x={295} y={112} label="x + 1" />
        <PB x={400} y={112} label="2x² − 2x + 2" tone={C.y} />
        {ln('M295,127 L285,175 M385,127 L340,175 M410,127 L412,175')}
        <PB x={285} y={190} label="x + 1" /><PB x={337} y={190} label="2" tone={C.y} /><PB x={412} y={190} label="x² − x + 1" tone={C.g} />
        <T x={360} y={256} size={15} weight={600}>2 · (x + 1)(x² − x + 1)</T>
        <T x={243} y={257} size={18} weight={700} color={C.g}>=</T>
        <T x={240} y={282} size={13} color={C.mu}>{t('daun sama; hanya urutan dan konstanta 2 yang berpindah', 'same leaves; only the order and the constant 2 move')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={30} size={14} weight={700} color={C.mu}>{t('atas 𝔽₃', 'over 𝔽₃')}</T>
        <PB x={240} y={62} label="2x³ + 2" tone={C.v} />
        {ln('M215,77 L125,135 M232,77 L210,135 M248,77 L290,135 M265,77 L365,135')}
        <PB x={120} y={150} label="2" tone={C.y} />
        {[210, 290, 370].map(x => <PB key={x} x={x} y={150} label="x + 1" />)}
        <T x={240} y={214} size={15}>(x + 1)³ = x³ + 3x² + 3x + 1 = x³ + 1</T>
        <T x={240} y={244} size={15}>x² − x + 1 = x² + 2x + 1 = (x + 1)²</T>
        <T x={240} y={274} size={13} color={C.mu}>{t('lapangan lain, daun lain', 'another field, other leaves')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- eisenstein:0 content and primitive part
const CBox = ({ x, y, v, term, tone, w = 64 }: { x: number; y: number; v: string | number; term?: string; tone?: string; w?: number }) => <g>
  <Chip x={x} y={y} w={w} h={44} size={20} label={neg(v)} tone={tone} />
  {term && <T x={x} y={y + 40} size={13} color={C.mu}>{term}</T>}
</g>
const content: Story = {
  title: b('Isi koefisien dan polinom primitif', 'Coefficient content and primitive polynomials'),
  frames: [
    f('Isi (content) polinom bulat adalah fpb koefisiennya. f = 6x² + 9x + 3 punya fpb(6, 9, 3) = 3. Keluarkan 3: f = 3(2x² + 3x + 1), dan 2x² + 3x + 1 primitif karena fpb koefisiennya 1.', 'The content of an integer polynomial is the gcd of its coefficients. f = 6x² + 9x + 3 has gcd(6, 9, 3) = 3. Pull out 3: f = 3(2x² + 3x + 1), and 2x² + 3x + 1 is primitive because its coefficient gcd is 1.', String.raw`6x^2+9x+3=3(2x^2+3x+1)`),
    f('Lemma Gauss: hasil kali dua polinom primitif tetap primitif. (2x² + 3x + 1)(x + 2) = 2x³ + 7x² + 7x + 2, fpb 1. Alasannya terlihat modulo prima: modulo 2 kedua faktor tidak nol (x + 1 dan x), dan hasil kalinya x² + x juga tidak nol.', 'Gauss’s lemma: a product of two primitive polynomials is primitive. (2x² + 3x + 1)(x + 2) = 2x³ + 7x² + 7x + 2, gcd 1. The reason shows modulo a prime: mod 2 both factors are nonzero (x + 1 and x), and their product x² + x is nonzero too.', String.raw`\bar f\,\bar g=(x+1)\,x=x^2+x\ne0\quad(\mathbb F_2[x])`),
    f('Akibatnya isi ikut dikalikan. cont(6x² + 9x + 3) = 3 dan cont(2x + 4) = 2, maka hasil kalinya 12x³ + 42x² + 42x + 12 punya isi 3 · 2 = 6.', 'So content multiplies. cont(6x² + 9x + 3) = 3 and cont(2x + 4) = 2, so their product 12x³ + 42x² + 42x + 12 has content 3 · 2 = 6.', String.raw`\operatorname{cont}(fg)=\operatorname{cont}(f)\operatorname{cont}(g)=3\cdot2=6`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={0} frame={k}>
        {[6, 9, 3].map((v, i) => <CBox key={i} x={70 + i * 90} y={66} v={v} term={['x²', 'x', '1'][i]} tone={C.a} />)}
        {[0, 1, 2].map(i => <g key={i}><Arrow from={[70 + i * 90, 124]} to={[70 + i * 90, 166]} color={C.v} width={2.5} /><T x={86 + i * 90} y={150} anchor="start" size={13} weight={600} color={C.v}>÷3</T></g>)}
        {[2, 3, 1].map((v, i) => <CBox key={i} x={70 + i * 90} y={194} v={v} tone={C.g} />)}
        <T x={318} y={66} anchor="start" size={15} weight={600}>{t('fpb', 'gcd')}(6, 9, 3) = 3</T>
        <T x={318} y={94} anchor="start" size={15} weight={700} color={C.a}>cont(f) = 3</T>
        <T x={318} y={194} anchor="start" size={14} weight={600} color={C.g}>f₀ = 2x² + 3x + 1</T>
        <T x={318} y={220} anchor="start" size={13} color={C.mu}>{t('fpb(2, 3, 1) = 1: primitif', 'gcd(2, 3, 1) = 1: primitive')}</T>
        <T x={160} y={270} size={15} weight={600}>f = 3 · f₀</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={240} y={40} size={15} weight={600}>(2x² + 3x + 1)(x + 2) = 2x³ + 7x² + 7x + 2</T>
        <T x={40} y={106} size={14} color={C.mu}>ℤ</T>
        {[2, 7, 7, 2].map((v, i) => <CBox key={i} x={110 + i * 90} y={100} v={v} term={['x³', 'x²', 'x', '1'][i]} tone={C.a} />)}
        <T x={40} y={206} size={14} color={C.mu}>mod 2</T>
        {[0, 1, 1, 0].map((v, i) => <CBox key={i} x={110 + i * 90} y={200} v={v} tone={v ? C.g : undefined} />)}
        <T x={240} y={270} size={15} weight={600} color={C.g}>(x + 1) · x = x² + x ≠ 0 {t('di', 'in')} 𝔽₂[x]</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={60} size={16}>cont(6x² + 9x + 3) = <tspan fill={C.a} fontWeight={700}>3</tspan></T>
        <T x={240} y={92} size={16}>cont(2x + 4) = <tspan fill={C.y} fontWeight={700}>2</tspan></T>
        <T x={240} y={146} size={15}>(6x² + 9x + 3)(2x + 4) = 12x³ + 42x² + 42x + 12</T>
        <T x={240} y={190} size={17} weight={700} color={C.g}>cont = {t('fpb', 'gcd')}(12, 42, 42, 12) = 6 = 3 · 2</T>
        <T x={240} y={230} size={14} color={C.mu}>= 6 · (2x³ + 7x² + 7x + 2)</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- eisenstein:1 shift x -> x + 1 via Pascal rows
const ecx = [170, 230, 290, 350, 410], binom = (n: number, r: number): number => r < 0 || r > n ? 0 : r === 0 || r === n ? 1 : binom(n - 1, r - 1) + binom(n - 1, r)
const shiftTrick: Story = {
  title: b('Trik substitusi: geser x, lalu Eisenstein lolos', 'The substitution trick: shift x, then Eisenstein passes'),
  frames: [
    f('f = x⁴ + x³ + x² + x + 1 punya semua koefisien 1. Tidak ada prima yang membagi 1, jadi uji Eisenstein langsung gagal untuk setiap p.', 'f = x⁴ + x³ + x² + x + 1 has every coefficient equal to 1. No prime divides 1, so the Eisenstein test fails right away for every p.', String.raw`f=x^4+x^3+x^2+x+1`),
    f('Ganti x dengan x + 1. Uraikan setiap pangkat dengan baris segitiga Pascal, lalu jumlahkan per kolom: x³ dapat 4 + 1 = 5, x² dapat 6 + 3 + 1 = 10, x dapat 4 + 3 + 2 + 1 = 10, konstanta 1 + 1 + 1 + 1 + 1 = 5.', 'Replace x by x + 1. Expand each power with a row of Pascal’s triangle, then add each column: x³ gets 4 + 1 = 5, x² gets 6 + 3 + 1 = 10, x gets 4 + 3 + 2 + 1 = 10, the constant 1 + 1 + 1 + 1 + 1 = 5.', String.raw`f(x+1)=x^4+5x^3+10x^2+10x+5`),
    f('Sekarang p = 5 lolos: 5 membagi 5, 10, 10, 5; 5 ∤ 1; 25 ∤ 5. Jadi f(x + 1) tak tereduksi. Substitusi bisa dibalik (x ↦ x − 1), sehingga faktorisasi f akan menjadi faktorisasi f(x + 1). Maka f juga tak tereduksi.', 'Now p = 5 passes: 5 divides 5, 10, 10, 5; 5 ∤ 1; 25 ∤ 5. So f(x + 1) is irreducible. The substitution can be undone (x ↦ x − 1), so any factorization of f would give one of f(x + 1). Hence f is irreducible too.', String.raw`f=gh\iff f(x+1)=g(x+1)\,h(x+1)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), sums = [1, 5, 10, 10, 5]
    return <>
      {['x⁴', 'x³', 'x²', 'x', '1'].map((s, i) => <T key={s} x={ecx[i]} y={30} size={14} weight={700} color={C.mu}>{s}</T>)}
      <T x={60} y={67} size={15} weight={700}>f(x)</T>
      {[0, 1, 2, 3, 4].map(i => <Chip key={i} x={ecx[i]} y={62} w={44} h={30} size={16} label="1" tone={k === 0 ? C.r : C.mu} />)}
      <At until={0} frame={k}><T x={290} y={112} size={15} weight={600} color={C.r}>{t('tidak ada prima p yang membagi 1 ✗', 'no prime p divides 1 ✗')}</T></At>
      <At from={1} until={1} frame={k}>
        {[4, 3, 2, 1, 0].map((n, r) => <g key={n}>
          <T x={60} y={113 + r * 26} size={14} weight={600} color={C.a}>{n === 0 ? '1' : n === 1 ? '(x+1)' : `(x+1)${sups[n]}`}</T>
          {[0, 1, 2, 3, 4].map(i => { const v = binom(n, 4 - i); return v ? <T key={i} x={ecx[i]} y={113 + r * 26} size={15} weight={600}>{v}</T> : null })}
        </g>)}
        <path d="M140,226 H440" stroke={C.ln} strokeWidth="1.5" />
        <T x={455} y={232} size={16} weight={700} color={C.mu}>+</T>
      </At>
      <At from={1} frame={k}>
        <T x={60} y={265} size={15} weight={700} color={C.v}>f(x+1)</T>
        {sums.map((v, i) => <Chip key={i} x={ecx[i]} y={260} w={48} h={32} size={16} label={v} tone={k === 2 ? (i ? C.g : C.y) : C.v} />)}
      </At>
      <At from={2} frame={k}>
        <T x={290} y={112} size={16} weight={600} color={C.g}>5 | 5, 10, 10, 5 ✓</T>
        <T x={290} y={142} size={16} weight={600} color={C.g}>5 ∤ 1 ✓      25 ∤ 5 ✓</T>
        <T x={290} y={182} size={15} weight={700} color={C.v}>⇒ f(x + 1) {t('tak tereduksi', 'irreducible')}</T>
        <T x={290} y={210} size={15} weight={700} color={C.v}>⇒ f {t('tak tereduksi', 'irreducible')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- eisenstein:2 Gauss: rational factors become integer factors
const gaussLemma: Story = {
  title: b('Lemma Gauss: faktor pecahan bisa dibuat bulat', 'Gauss’s lemma: fractional factors can be made integral'),
  frames: [
    f('Atas ℚ, f = x² + 5x + 6 bisa ditulis dengan faktor berpecahan: ((2/3)x + 4/3)((3/2)x + 9/2). Cek: (2/3)(3/2) = 1, suku tengah 3 + 2 = 5, konstanta (4/3)(9/2) = 6.', 'Over ℚ, f = x² + 5x + 6 can be written with fractional factors: ((2/3)x + 4/3)((3/2)x + 9/2). Check: (2/3)(3/2) = 1, middle term 3 + 2 = 5, constant (4/3)(9/2) = 6.', String.raw`x^2+5x+6=\left(\tfrac23x+\tfrac43\right)\left(\tfrac32x+\tfrac92\right)`),
    f('Keluarkan isi setiap faktor: (2/3)x + 4/3 = (2/3)(x + 2) dan (3/2)x + 9/2 = (3/2)(x + 3). Konstanta pecahannya saling hapus: (2/3)(3/2) = 1, tersisa faktor bulat monik (x + 2)(x + 3).', 'Pull the content out of each factor: (2/3)x + 4/3 = (2/3)(x + 2) and (3/2)x + 9/2 = (3/2)(x + 3). The fractional constants cancel: (2/3)(3/2) = 1, leaving monic integer factors (x + 2)(x + 3).', String.raw`\tfrac23\cdot\tfrac32=1`),
    f('Mengapa selalu saling hapus? x + 2 dan x + 3 primitif, dan menurut Gauss hasil kalinya juga primitif. Karena f primitif, konstanta c dalam f = c(x + 2)(x + 3) harus ±1, dan karena f monik, c = 1.', 'Why do they always cancel? x + 2 and x + 3 are primitive, and by Gauss their product is primitive too. Since f is primitive, the constant c in f = c(x + 2)(x + 3) must be ±1, and since f is monic, c = 1.', String.raw`\operatorname{cont}(f)=1=|c|\cdot\operatorname{cont}\big((x+2)(x+3)\big)=|c|`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), ln = (d: string) => <path d={d} stroke={C.ln} strokeWidth="2" fill="none" />
    return <>
      <PB x={240} y={40} label="x² + 5x + 6" tone={C.v} />
      {ln('M215,55 L150,120 M265,55 L330,120')}
      <PB x={130} y={136} label="(2/3)x + 4/3" tone={C.r} />
      <PB x={350} y={136} label="(3/2)x + 9/2" tone={C.r} />
      <At until={0} frame={k}><T x={240} y={200} size={14} color={C.mu}>{t('pecahan di kedua faktor', 'fractions in both factors')}</T></At>
      <At from={1} frame={k}>
        {ln('M115,151 L88,196 M145,151 L172,196 M335,151 L308,196 M365,151 L392,196')}
        <PB x={85} y={212} label="2/3" tone={C.y} /><PB x={175} y={212} label="x + 2" tone={C.g} />
        <PB x={305} y={212} label="3/2" tone={C.y} /><PB x={395} y={212} label="x + 3" tone={C.g} />
      </At>
      <At from={1} until={1} frame={k}><T x={240} y={266} size={15} weight={600}><tspan fill={C.y}>2/3 · 3/2 = 1</tspan>  ⇒  x² + 5x + 6 = <tspan fill={C.g}>(x + 2)(x + 3)</tspan></T></At>
      <At from={2} frame={k}>
        <T x={240} y={256} size={14}>{t('primitif · primitif = primitif', 'primitive · primitive = primitive')}  ⇒  c = ±1</T>
        <T x={240} y={281} size={14} weight={600} color={C.g}>{t('f monik ⇒ c = 1: faktor bulat monik', 'f monic ⇒ c = 1: monic integer factors')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- eisenstein:3 rational root test on 2x^2 + x - 3
const rrCands = [[-3, -1, 1, 3], [-1.5, -0.5, 0.5, 1.5]], rrLabel = [['−3', '−1', '1', '3'], ['−3/2', '−1/2', '1/2', '3/2']]
const rrF = (x: number) => 2 * x * x + x - 3
const rrx = (x: number) => 240 + 56 * x, rry = (y: number) => 180 - 6 * y
const rationalRoot: Story = {
  title: b('Uji akar rasional: daftar calon, lalu saring', 'Rational root test: list the candidates, then filter'),
  frames: [
    f('Untuk 2x² + x − 3, akar rasional u/v (bentuk paling sederhana) harus punya u ∣ −3 dan v ∣ 2. Jadi u ∈ {±1, ±3} dan v ∈ {1, 2}: delapan calon.', 'For 2x² + x − 3, a rational root u/v (in lowest terms) must have u ∣ −3 and v ∣ 2. So u ∈ {±1, ±3} and v ∈ {1, 2}: eight candidates.', String.raw`u\mid-3,\quad v\mid2`),
    f('Calon hanyalah daftar periksa, bukan jaminan. Grafik y = 2x² + x − 3 hanya memotong sumbu di dua dari delapan calon: −3/2 dan 1.', 'Candidates are only a checklist, not a guarantee. The graph of y = 2x² + x − 3 crosses the axis at just two of the eight candidates: −3/2 and 1.'),
    f('Substitusi menyaring calon: f(1) = 0 dan f(−3/2) = 4,5 − 1,5 − 3 = 0, sisanya bukan 0. Jadi 2x² + x − 3 = (x − 1)(2x + 3).', 'Substitution filters the candidates: f(1) = 0 and f(−3/2) = 4.5 − 1.5 − 3 = 0, the others are not 0. So 2x² + x − 3 = (x − 1)(2x + 3).', String.raw`2x^2+x-3=(x-1)(2x+3)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), isRoot = (c: number) => Math.abs(rrF(c)) < 1e-9
    return <>
      <g style={{ opacity: k === 1 ? 0 : 1, transition: 'opacity .45s' }}>
        <T x={95} y={46} size={14} color={C.mu}>u =</T>
        {rrLabel[0].map((s, i) => <T key={i} x={180 + i * 80} y={46} size={14} weight={700} color={C.mu}>{s}</T>)}
        {[1, 2].map((v, r) => <T key={v} x={95} y={r ? 180 : 110} size={14} color={C.mu}>v = {v}</T>)}
        {rrCands.map((row, r) => row.map((c, i) => { const hot = k === 2 && isRoot(c); return <g key={`${r}${i}`}>
          <Chip x={180 + i * 80} y={r ? 175 : 105} w={62} h={32} size={15} label={rrLabel[r][i]} tone={hot ? C.g : k === 2 ? C.mu : C.a} />
          <At from={2} frame={k}><T x={180 + i * 80} y={(r ? 175 : 105) + 36} size={13} weight={hot ? 700 : 400} color={hot ? C.g : C.mu}>f = {neg(rrF(c))}</T></At>
        </g> }))}
        <At until={0} frame={k}>
          <T x={240} y={250} size={15} weight={600}>u ∣ a₀ = −3,   v ∣ a₂ = 2</T>
          <T x={240} y={276} size={13} color={C.mu}>{t('8 calon, belum tentu akar', '8 candidates, not necessarily roots')}</T>
        </At>
        <At from={2} frame={k}><T x={240} y={268} size={16} weight={700} color={C.g}>2x² + x − 3 = (x − 1)(2x + 3)</T></At>
      </g>
      <At from={1} until={1} frame={k}>
        <Clip id="rr-plot" x={30} y={20} w={420} h={256}>
          <path d={`M30,${rry(0)} H450 M${rrx(0)},20 V276`} stroke={C.ln} strokeWidth="1.4" />
          <path d={fn(x => [rrx(x), rry(rrF(x))], -3.3, 2.9)} fill="none" stroke={C.a} strokeWidth="3" />
        </Clip>
        {rrCands.flat().map(c => isRoot(c) ? <Dot key={c} at={[rrx(c), rry(0)]} color={C.g} r={7} /> : <Dot key={c} at={[rrx(c), rry(0)]} color={C.mu} r={5} hollow />)}
        <T x={rrx(-1.5) - 6} y={rry(0) + 24} anchor="end" size={14} weight={700} color={C.g}>−3/2</T>
        <T x={rrx(1) + 6} y={rry(0) + 24} anchor="start" size={14} weight={700} color={C.g}>1</T>
        {[-3, 3].map(c => <T key={c} x={rrx(c)} y={rry(0) + 24} size={13} color={C.mu}>{neg(c)}</T>)}
        <T x={rrx(2.1) + 8} y={rry(rrF(2.1))} anchor="start" size={14} weight={600} color={C.a}>y = 2x² + x − 3</T>
        <T x={444} y={272} anchor="end" size={12} color={C.mu}>{t('skala y diperkecil', 'y axis compressed')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- eisenstein:4 reduce mod 2
const modP: Story = {
  title: b('Irreduksibilitas lewat reduksi modulo p', 'Irreducibility by reducing modulo p'),
  frames: [
    f('Di 𝔽₂, cek x² + x + 1 di kedua titik: x = 0 memberi 1, x = 1 memberi 1 + 1 + 1 = 1. Tidak ada akar, dan karena derajatnya 2, ia tak tereduksi di 𝔽₂[x].', 'In 𝔽₂, check x² + x + 1 at both points: x = 0 gives 1, x = 1 gives 1 + 1 + 1 = 1. There is no root, and since the degree is 2, it is irreducible in 𝔽₂[x].', String.raw`\bar f(0)=1,\quad\bar f(1)=3\equiv1`),
    f('Ambil f = 3x² + 7x + 5 di ℤ[x]. Reduksi tiap koefisien modulo 2: 3, 7, 5 menjadi 1, 1, 1, yaitu x² + x + 1. Koefisien utama 3 ganjil, jadi derajat tidak turun.', 'Take f = 3x² + 7x + 5 in ℤ[x]. Reduce each coefficient mod 2: 3, 7, 5 become 1, 1, 1, which is x² + x + 1. The leading coefficient 3 is odd, so the degree does not drop.', String.raw`\bar f=x^2+x+1\in\mathbb F_2[x]`),
    f('Jika f = gh atas ℚ, Gauss memberi faktor bulat berderajat 1, dan reduksinya memfaktorkan x² + x + 1 di 𝔽₂: kontradiksi. Jadi f tak tereduksi atas ℚ. Awas: 2x² + 3x + 1 = (2x + 1)(x + 1) tereduksi menjadi x + 1, derajatnya turun, sehingga uji ini tidak berlaku.', 'If f = gh over ℚ, Gauss gives integer factors of degree 1, and reducing them factors x² + x + 1 over 𝔽₂: a contradiction. So f is irreducible over ℚ. Careful: 2x² + 3x + 1 = (2x + 1)(x + 1) reduces to x + 1, the degree drops, so the test does not apply.', String.raw`\deg\bar f=\deg f=2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={0} frame={k}>
        <T x={240} y={40} size={18} weight={700}>x² + x + 1 {t('di', 'over')} 𝔽₂</T>
        {[['x = 0', '0 + 0 + 1 = 1'], ['x = 1', '1 + 1 + 1 = 3 = 1']].map(([h, v], i) => <g key={h}>
          <rect x={30 + i * 225} y={70} width={195} height={100} rx={14} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="2" />
          <T x={127 + i * 225} y={100} size={16} weight={700} color={C.a}>{h}</T>
          <T x={127 + i * 225} y={130} size={15}>{v}</T>
          <T x={127 + i * 225} y={156} size={14} weight={600} color={C.r}>≠ 0</T>
        </g>)}
        <T x={240} y={214} size={15} weight={600} color={C.g}>{t('tanpa akar, derajat 2 ⇒ tak tereduksi di 𝔽₂', 'no root, degree 2 ⇒ irreducible over 𝔽₂')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={60} y={72} size={15} weight={700}>f</T>
        {[3, 7, 5].map((v, i) => <CBox key={i} x={150 + i * 100} y={66} v={v} term={['x²', 'x', '1'][i]} tone={C.a} />)}
        {[0, 1, 2].map(i => <g key={i}><Arrow from={[150 + i * 100, 124]} to={[150 + i * 100, 162]} color={C.v} width={2.5} /><T x={164 + i * 100} y={148} anchor="start" size={13} weight={600} color={C.v}>mod 2</T></g>)}
        <T x={60} y={196} size={15} weight={700}>f̄</T>
        {[1, 1, 1].map((v, i) => <CBox key={i} x={150 + i * 100} y={190} v={v} tone={C.g} />)}
        <T x={240} y={252} size={15} weight={600} color={C.g}>f̄ = x² + x + 1</T>
        <T x={240} y={278} size={13} color={C.mu}>{t('3 ganjil: derajat tetap 2', '3 is odd: the degree stays 2')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={240} y={42} size={15} weight={600} color={C.a}>3x² + 7x + 5 = g · h ?</T>
        <T x={240} y={68} size={13} color={C.mu}>{t('Gauss: g, h bulat, masing-masing derajat 1', 'Gauss: g, h integral, each of degree 1')}</T>
        <T x={240} y={96} size={15}>mod 2:  x² + x + 1 = (x + a)(x + b)</T>
        <T x={240} y={124} size={15} weight={600} color={C.r}>{t('⇒ ada akar di 𝔽₂ ✗ mustahil', '⇒ a root in 𝔽₂ ✗ impossible')}</T>
        <path d="M40,148 H440" stroke={C.faint} strokeWidth="1.5" />
        <T x={240} y={180} size={14} weight={700} color={C.y}>{t('awas', 'careful')}: 2x² + 3x + 1 = (2x + 1)(x + 1)</T>
        <T x={240} y={210} size={15}>mod 2:  0x² + x + 1 = x + 1</T>
        <T x={240} y={244} size={13} color={C.r}>{t('2 membagi koefisien utama: derajat turun,', '2 divides the leading coefficient: the degree drops,')}</T>
        <T x={240} y={266} size={13} color={C.r}>{t('jadi uji ini tidak berlaku', 'so the test does not apply')}</T>
      </At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'cycles:0': composition, 'cycles:1': disjoint, 'cycles:2': countPerms,
  'parity:0': pivot, 'parity:1': signKernel, 'parity:2': simpleA5,
  'ring:0': distribute, 'ring:1': unitsZ12, 'ring:2': hierarchy, 'ring:3': finiteField,
  'ideal:0': absorb, 'ideal:1': quotientRing, 'ideal:2': gaussian, 'ideal:3': maximalField,
  'division:0': longDivision, 'division:1': fieldDep, 'division:2': euclid, 'division:3': buildField, 'division:4': classCount, 'division:5': uniqueFact,
  'eisenstein:0': content, 'eisenstein:1': shiftTrick, 'eisenstein:2': gaussLemma, 'eisenstein:3': rationalRoot, 'eisenstein:4': modP,
}
