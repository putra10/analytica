import type { ReactNode } from 'react'
import { At, Arrow, C, Dot, Grid, RightAngle, T, arc, b, f, pl, plane, tr, type P, type Story } from '../kit'

const rad = (d: number) => d * Math.PI / 180
const mn = (s: string | number) => String(s).replace(/-/g, '−')
/** Rounded number with a real minus sign. */
const fx = (n: number, d = 2) => mn(Number(n.toFixed(d)) || 0)
/** Point at distance r (px) and math angle d (degrees) from c. */
const at = (c: P, r: number, d: number): P => [c[0] + r * Math.cos(rad(d)), c[1] - r * Math.sin(rad(d))]
const Ang = ({ c, r, a0, a1, color = C.mu, w = 2 }: { c: P; r: number; a0: number; a1: number; color?: string; w?: number }) =>
  <path d={arc(c, r, rad(a0), rad(a1))} fill="none" stroke={color} strokeWidth={w} />
const circ = (c: P, r: number) => `M${c[0] - r},${c[1]} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`
const Sup = ({ children }: { children: ReactNode }) => <tspan baselineShift="super" fontSize="68%">{children}</tspan>
const Sb = ({ children }: { children: ReactNode }) => <tspan baselineShift="sub" fontSize="72%">{children}</tspan>
/** Label just outside the tip of a ray from c at angle d. */
const Tip = ({ c, r, d, color, children, size = 15 }: { c: P; r: number; d: number; color: string; children: ReactNode; size?: number }) => {
  const p = at(c, r, d), cs = Math.cos(rad(d)), sn = Math.sin(rad(d))
  return <T x={p[0]} y={p[1] + 5 + (sn < -0.5 ? 6 : 0)} anchor={cs > 0.35 ? 'start' : cs < -0.35 ? 'end' : 'middle'} size={size} weight={700} color={color}>{children}</T>
}
const Axes = ({ c, w, h }: { c: P; w: number; h: number }) => <path d={`M${c[0] - w},${c[1]} H${c[0] + w} M${c[0]},${c[1] - h} V${c[1] + h}`} stroke={C.ln} strokeWidth="1.3" />

// ================================================================ triangle:0 complex multiplication
const M1 = plane([60, 250], 55)
const mult: Story = {
  title: b('Perkalian (1 + i)(2 + i): empat potong, satu panah', 'Multiplying (1 + i)(2 + i): four pieces, one arrow'),
  frames: [
    f('Dua masukan: z = 1 + i (ungu) dan w = 2 + i (hijau). Kita cari z·w tanpa rumus hafalan.', 'Two inputs: z = 1 + i (violet) and w = 2 + i (green). We want z·w without a memorized formula.', String.raw`z=1+i,\quad w=2+i`),
    f('Kembangkan seperti aljabar biasa: 1·2 = 2, 1·i = i, i·2 = 2i, dan i·i = i² = −1. Jalani keempat potongan itu (kuning): 2 ke kanan, 1 ke atas, 2 ke atas, 1 ke kiri. Kita tiba di 1 + 3i.', 'Expand as in ordinary algebra: 1·2 = 2, 1·i = i, i·2 = 2i, and i·i = i² = −1. Walk the four pieces (amber): 2 right, 1 up, 2 up, 1 left. We land at 1 + 3i.', String.raw`(1+i)(2+i)=2+i+2i+i^2=1+3i`),
    f('Hasil yang sama dibaca sebagai putar dan skala. Sudut dijumlahkan: 45° + 26,6° = 71,6°. Panjang dikalikan: √2 · √5 = √10 ≈ 3,16. Itulah tepat sudut dan panjang 1 + 3i.', 'The same result read as turn and scale. Angles add: 45° + 26.6° = 71.6°. Lengths multiply: √2 · √5 = √10 ≈ 3.16. Those are exactly the angle and length of 1 + 3i.', String.raw`|zw|=\sqrt2\cdot\sqrt5=\sqrt{10}=|1+3i|`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), O = M1(0, 0), Z = M1(1, 1), W = M1(2, 1), Pr = M1(1, 3), X = 300
    const walk: [P, P][] = [[O, M1(2, 0)], [M1(2, 0), W], [W, M1(2, 3)], [M1(2, 3), Pr]]
    return <>
      <Grid map={M1} x={[-0.6, 3.8]} y={[-0.4, 3.6]} />
      <T x={O[0] - 10} y={O[1] + 18} size={13} color={C.mu}>0</T>
      <At from={1} until={1} frame={k}>
        {walk.map(([p, q], i) => <Arrow key={i} from={p} to={q} color={C.y} width={2.5} head={9} />)}
        <T x={M1(1, 0)[0]} y={O[1] + 20} size={14} weight={700} color={C.y}>2</T>
        <T x={W[0] + 10} y={M1(0, .5)[1] + 5} anchor="start" size={14} weight={700} color={C.y}>i</T>
        <T x={W[0] + 10} y={M1(0, 2)[1] + 5} anchor="start" size={14} weight={700} color={C.y}>2i</T>
        <T x={M1(1.5, 0)[0]} y={Pr[1] - 12} size={14} weight={700} color={C.y}>−1</T>
      </At>
      <At from={2} frame={k}>
        <Ang c={O} r={34} a0={0} a1={45} color={C.a} />
        <Ang c={O} r={50} a0={0} a1={26.57} color={C.g} />
        <Ang c={O} r={68} a0={0} a1={71.57} color={C.v} w={2.5} />
      </At>
      <At from={1} frame={k}>
        <Arrow from={O} to={Pr} color={C.v} width={3.5} />
        <Dot at={Pr} color={C.v} />
        <T x={Pr[0] - 10} y={Pr[1] + 5} anchor="end" weight={700} color={C.v}>zw</T>
      </At>
      <Arrow from={O} to={Z} color={C.a} />
      <Arrow from={O} to={W} color={C.g} />
      <T x={Z[0] - 8} y={Z[1] - 4} anchor="end" weight={700} color={C.a}>z</T>
      <T x={W[0] + 10} y={W[1] - 4} anchor="start" weight={700} color={C.g}>w</T>
      <At until={0} frame={k}>
        <T x={X} y={70} anchor="start" size={17} weight={700} color={C.a}>z = 1 + i</T>
        <T x={X} y={98} anchor="start" size={17} weight={700} color={C.g}>w = 2 + i</T>
        <T x={X} y={136} anchor="start" size={16} color={C.mu}>z · w = ?</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={58} anchor="start" size={13} color={C.mu}>{t('empat potong', 'four pieces')}</T>
        {['1 · 2 = 2', '1 · i = i', 'i · 2 = 2i', 'i · i = −1'].map((s, i) => <T key={s} x={X} y={86 + i * 24} anchor="start" size={15} color={C.y}>{s}</T>)}
        <T x={X} y={200} anchor="start" size={17} weight={700} color={C.v}>zw = 1 + 3i</T>
      </At>
      <At from={2} frame={k}>
        <T x={X} y={58} anchor="start" size={13} color={C.mu}>{t('sudut dijumlah', 'angles add')}</T>
        <T x={X} y={84} anchor="start" size={15}><tspan fill={C.a}>45°</tspan> + <tspan fill={C.g}>26.6°</tspan> = <tspan fill={C.v}>71.6°</tspan></T>
        <T x={X} y={118} anchor="start" size={13} color={C.mu}>{t('panjang dikali', 'lengths multiply')}</T>
        <T x={X} y={144} anchor="start" size={15}>√2 · √5 = √10 ≈ 3.16</T>
        <T x={X} y={200} anchor="start" size={17} weight={700} color={C.v}>zw = 1 + 3i</T>
      </At>
    </>
  },
}

// ================================================================ triangle:1 division and conjugation
const D1 = plane([50, 190], 50)
const divide: Story = {
  title: b('Pembagian (1 + i)/(2 + i): konjugat membuat penyebut real', 'Dividing (1 + i)/(2 + i): the conjugate makes the denominator real'),
  frames: [
    f('Bagi z = 1 + i oleh w = 2 + i. Hasil bagi q adalah bilangan yang bila dikalikan w kembali menjadi z. Jadi q harus membatalkan putaran dan skala yang dibuat w.', 'Divide z = 1 + i by w = 2 + i. The quotient q is the number that, multiplied by w, gives z back. So q must undo the turn and the scaling made by w.', String.raw`q=\frac{z}{w}\iff q\,w=z`),
    f('Kalikan atas dan bawah dengan konjugat w̄ = 2 − i (cermin w, merah). Penyebut menjadi w·w̄ = 2² + 1² = 5, bilangan real. Pembilang menjadi (1 + i)(2 − i) = 3 + i (kuning).', 'Multiply top and bottom by the conjugate w̄ = 2 − i (the mirror of w, red). The denominator becomes w·w̄ = 2² + 1² = 5, a real number. The numerator becomes (1 + i)(2 − i) = 3 + i (amber).', String.raw`\frac{1+i}{2+i}=\frac{(1+i)(2-i)}{(2+i)(2-i)}=\frac{3+i}{5}`),
    f('Sekarang bagi tiap koordinat dengan 5: q = 0,6 + 0,2i. Panah q searah dengan 3 + i, hanya 5 kali lebih pendek. Cek: sudutnya 45° − 26,6° = 18,4° dan panjangnya √2/√5 ≈ 0,63.', 'Now divide each coordinate by 5: q = 0.6 + 0.2i. The arrow q points along 3 + i, just 5 times shorter. Check: its angle is 45° − 26.6° = 18.4° and its length √2/√5 ≈ 0.63.', String.raw`q=0.6+0.2i,\quad q\,w=(0.6+0.2i)(2+i)=1+i`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), O = D1(0, 0), Z = D1(1, 1), W = D1(2, 1), Wb = D1(2, -1), N = D1(3, 1), Q = D1(.6, .2), X = 262
    return <>
      <Grid map={D1} x={[-0.6, 3.4]} y={[-1.6, 1.8]} />
      <T x={O[0] - 10} y={O[1] + 18} size={13} color={C.mu}>0</T>
      <At from={1} frame={k}>
        <path d={pl([W, Wb])} stroke={C.r} strokeWidth="1.5" strokeDasharray="5 5" />
        <Arrow from={O} to={Wb} color={C.r} />
        <T x={Wb[0] + 10} y={Wb[1] + 12} anchor="start" weight={700} color={C.r}>w̄</T>
        <Arrow from={O} to={N} color={C.y} width={3.5} />
        <T x={N[0] + 8} y={N[1] + 5} anchor="start" weight={700} color={C.y}>z w̄</T>
      </At>
      <Arrow from={O} to={Z} color={C.a} />
      <Arrow from={O} to={W} color={C.g} />
      <T x={Z[0] - 8} y={Z[1] - 6} anchor="end" weight={700} color={C.a}>z</T>
      <T x={W[0]} y={W[1] - 12} weight={700} color={C.g}>w</T>
      <At from={2} frame={k}>
        <Arrow from={O} to={Q} color={C.v} width={4} head={9} />
        <Dot at={Q} color={C.v} r={4} />
        <T x={Q[0] + 2} y={Q[1] + 24} weight={700} color={C.v}>q</T>
      </At>
      <At until={0} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.a}>z = 1 + i</T>
        <T x={X} y={88} anchor="start" size={17} weight={700} color={C.g}>w = 2 + i</T>
        <T x={X} y={126} anchor="start" size={13} color={C.mu}>{t('cari q dengan', 'find q with')}</T>
        <T x={X} y={150} anchor="start" size={17} weight={600}>q · w = z</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={58} anchor="start" size={16} weight={700} color={C.r}>w̄ = 2 − i</T>
        <T x={X} y={86} anchor="start" size={15}>w · w̄ = 4 + 1 = 5</T>
        <T x={X} y={120} anchor="start" size={15}>z · w̄ = (1 + i)(2 − i)</T>
        <T x={X} y={144} anchor="start" size={15}>= 2 − i + 2i + 1</T>
        <T x={X} y={170} anchor="start" size={16} weight={700} color={C.y}>= 3 + i</T>
      </At>
      <At from={2} frame={k}>
        <T x={X} y={58} anchor="start" size={15} color={C.v}>q = (3 + i) / 5</T>
        <T x={X} y={84} anchor="start" size={17} weight={700} color={C.v}>= 0.6 + 0.2i</T>
        <T x={X} y={120} anchor="start" size={13} color={C.mu}>{t('panjang', 'length')}</T>
        <T x={X} y={142} anchor="start" size={15}>√2 / √5 ≈ 0.63</T>
        <T x={X} y={176} anchor="start" size={13} color={C.mu}>{t('sudut', 'angle')}</T>
        <T x={X} y={198} anchor="start" size={15}>45° − 26.6° = 18.4°</T>
      </At>
    </>
  },
}

// ================================================================ triangle:2 triangle inequality
const TO: P = [50, 200], TU = 30
const triIneq: Story = {
  title: b('Ketaksamaan segitiga: jalan langsung tidak pernah lebih panjang', 'Triangle inequality: the direct route is never longer'),
  frames: [
    f('a = 3 dan b = 4i. Jalan dua sisi: dari 0 ke a (panjang 3), lalu dari a ke a + b (panjang 4), total 7. Panah merah langsung ke a + b = 3 + 4i hanya sepanjang 5. Dan 5 juga tidak kurang dari |3 − 4| = 1.', 'a = 3 and b = 4i. The two-leg journey: from 0 to a (length 3), then from a to a + b (length 4), 7 in total. The red direct arrow to a + b = 3 + 4i is only 5 long. And 5 is not below |3 − 4| = 1 either.', String.raw`1\le|3+4i|=5\le3+4=7`),
    f('Putar b dengan penggeser (|b| tetap 4). |a + b| berubah, tetapi tidak pernah melewati 7. Batas atas tercapai di 0°: b searah a, segitiganya rebah menjadi satu garis, dan 3 + 4 = 7.', 'Turn b with the slider (|b| stays 4). |a + b| changes, but never goes past 7. The upper bound is reached at 0°: b points the same way as a, the triangle collapses into a line, and 3 + 4 = 7.', String.raw`|a+b|\le|a|+|b|`),
    f('Batas bawah: |a + b| tidak pernah kurang dari |3 − 4| = 1. Itu tercapai di 180°: b berbalik melawan a dan yang tersisa hanya 1. Jadi |a + b| selalu di antara 1 dan 7.', 'Lower bound: |a + b| never drops below |3 − 4| = 1. It is reached at 180°: b turns back against a and only 1 is left. So |a + b| always lies between 1 and 7.', String.raw`\big||a|-|b|\big|\le|a+b|`),
  ],
  control: { label: b('Sudut antara a dan b (°)', 'Angle between a and b (°)'), min: 0, max: 180, step: 5, initial: 90 },
  controlFrom: 1,
  readout: p => String.raw`|a+b|=\sqrt{25+24\cos${p}^\circ}=${fx(Math.sqrt(25 + 24 * Math.cos(rad(p))))}`,
  draw: (k, v, lang) => {
    const t = tr(lang), phi = k ? v : 90, A: P = [TO[0] + 3 * TU, TO[1]], S = at(A, 4 * TU, phi), s = Math.sqrt(25 + 24 * Math.cos(rad(phi)))
    const nb = [-(S[1] - A[1]) / (4 * TU), (S[0] - A[0]) / (4 * TU)], ls = Math.hypot(S[0] - TO[0], S[1] - TO[1]) || 1
    const ns = [(S[1] - TO[1]) / ls, -(S[0] - TO[0]) / ls], X = 300, u = 20
    const rows: [string, number, string, number][] = [[`|a| + |b| = 7`, 7, C.y, 64], [`|a + b| = ${fx(s)}`, s, C.r, 124], ['||a| − |b|| = 1', 1, C.mu, 184]]
    const eq = Math.abs(s - 7) < 1e-6 ? t('= batas atas', '= upper bound') : Math.abs(s - 1) < 1e-6 ? t('= batas bawah', '= lower bound') : ''
    return <>
      <Grid map={plane(TO, TU)} x={[-1.2, 7.6]} y={[-2.6, 5.6]} />
      <Arrow from={TO} to={A} color={C.a} />
      <Arrow from={A} to={S} color={C.g} />
      <Arrow from={TO} to={S} color={C.r} width={3.5} />
      <T x={(TO[0] + A[0]) / 2} y={TO[1] + 22} weight={700} color={C.a}>a</T>
      <T x={(A[0] + S[0]) / 2 + 16 * nb[0]} y={(A[1] + S[1]) / 2 + 16 * nb[1] + 5} weight={700} color={C.g}>b</T>
      <T x={(TO[0] + S[0]) / 2 + 20 * ns[0]} y={(TO[1] + S[1]) / 2 + 20 * ns[1] + 5} weight={700} color={C.r}>a + b</T>
      {rows.map(([s0, val, col, y], i) => <g key={i}>
        <T x={X} y={y} anchor="start" size={15} weight={600} color={col}>{s0}</T>
        <rect x={X} y={y + 9} width={u * val} height={10} rx={3} fill={col} style={{ transition: 'width .3s' }} />
      </g>)}
      <At from={1} until={1} frame={k}><rect x={X - 8} y={44} width={170} height={46} rx={8} fill="none" stroke={C.y} strokeWidth="2" /></At>
      <At from={2} frame={k}><rect x={X - 8} y={164} width={170} height={46} rx={8} fill="none" stroke={C.mu} strokeWidth="2" /></At>
      <T x={X} y={246} anchor="start" size={16} weight={600}>1 ≤ <tspan fill={C.r}>{fx(s)}</tspan> ≤ 7</T>
      {eq && <T x={X} y={272} anchor="start" size={15} weight={700} color={C.g}>{eq}</T>}
    </>
  },
}

// ================================================================ polar:0 multiplication adds angles
const PC: P = [165, 150], PU = 55
const polarMul: Story = {
  title: b('Perkalian kutub: sudut dijumlah, lalu dibungkus', 'Polar multiplication: angles add, then wrap'),
  frames: [
    f('Dua masukan: z₁ beradius 1 dengan sudut θ₁ = 30°, dan z₂ beradius 2 dengan sudut 60°. Lingkaran putus-putus menandai radius 1 dan 2.', 'Two inputs: z₁ has radius 1 and angle θ₁ = 30°, and z₂ has radius 2 and angle 60°. The dashed circles mark radius 1 and 2.', String.raw`z_1=e^{i\,30^\circ},\quad z_2=2e^{i\,60^\circ}`),
    f('Hasil kali: radius dikalikan, 1 · 2 = 2, dan sudut dijumlahkan, 30° + 60° = 90°. Jadi z₁z₂ = 2e^(i90°) = 2i, tepat di sumbu imajiner.', 'The product: radii multiply, 1 · 2 = 2, and angles add, 30° + 60° = 90°. So z₁z₂ = 2e^(i90°) = 2i, right on the imaginary axis.', String.raw`z_1z_2=1\cdot2\,e^{i(30^\circ+60^\circ)}=2i`),
    f('Geser θ₁. Panah hasil selalu 60° di depan z₁ dan radiusnya tetap 2. Jika jumlah sudut melewati 180°, nilai utama Arg dibungkus kembali ke (−180°, 180°] dengan mengurangi 360°.', 'Move θ₁. The product arrow always stays 60° ahead of z₁ and its radius stays 2. When the angle sum passes 180°, the principal value Arg is wrapped back into (−180°, 180°] by subtracting 360°.', String.raw`\operatorname{Arg}(z_1z_2)\equiv\theta_1+\theta_2\pmod{360^\circ}`),
  ],
  control: { label: b('Sudut θ₁ (°)', 'Angle θ₁ (°)'), min: 0, max: 355, step: 5, initial: 30 },
  controlFrom: 2,
  readout: th => { const s = th + 60, w = s > 180 ? s - 360 : s; return String.raw`z_1z_2=2e^{i\,${s}^\circ}` + (w !== s ? String.raw`=2e^{i(${mn(w)}^\circ)}` : '') },
  draw: (k, v, lang) => {
    const t = tr(lang), th = k < 2 ? 30 : v, s = th + 60, w = s > 180 ? s - 360 : s, X = 305
    const z1 = at(PC, PU, th), z2 = at(PC, 2 * PU, 60), p = at(PC, 2 * PU, s), sm = s % 360
    const lab = Math.abs(sm - 60) < 20 ? sm + (sm < 60 ? -16 : 16) : s
    return <>
      <Axes c={PC} w={140} h={135} />
      <circle cx={PC[0]} cy={PC[1]} r={PU} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <circle cx={PC[0]} cy={PC[1]} r={2 * PU} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <Ang c={PC} r={20} a0={0} a1={th % 360} color={C.a} />
      <Ang c={PC} r={32} a0={0} a1={60} color={C.g} />
      <At from={1} frame={k}>
        <Ang c={PC} r={44} a0={0} a1={s % 360} color={C.v} w={2.5} />
        <Arrow from={PC} to={p} color={C.v} width={3.5} />
        <Dot at={p} color={C.v} />
        {s % 360 !== 60 && <Tip c={PC} r={2 * PU + 10} d={lab} color={C.v}>z₁z₂</Tip>}
      </At>
      <Arrow from={PC} to={z2} color={C.g} />
      <Arrow from={PC} to={z1} color={C.a} />
      <Tip c={PC} r={2 * PU + 10} d={60} color={C.g}>{k >= 1 && s % 360 === 60 ? 'z₂ = z₁z₂' : 'z₂'}</Tip>
      <Tip c={PC} r={PU + 10} d={th} color={C.a}>z₁</Tip>
      <T x={X} y={50} anchor="start" size={16} weight={700} color={C.a}>z₁ = 1 ∠{th}°</T>
      <T x={X} y={76} anchor="start" size={16} weight={700} color={C.g}>z₂ = 2 ∠60°</T>
      <At from={1} frame={k}>
        <T x={X} y={192} anchor="start" size={15}>1 · 2 = 2</T>
        <T x={X} y={216} anchor="start" size={15}>{th}° + 60° = {s}°</T>
        <T x={X} y={244} anchor="start" size={17} weight={700} color={C.v}>z₁z₂ = 2 ∠{s}°</T>
        {w !== s && <T x={X} y={272} anchor="start" size={15} weight={600} color={C.r}>−360° ⇒ Arg = {mn(w)}°</T>}
      </At>
      <At until={0} frame={k}><T x={X} y={120} anchor="start" size={13} color={C.mu}>{t('putus-putus: radius 1 dan 2', 'dashed: radius 1 and 2')}</T></At>
    </>
  },
}

// ================================================================ polar:1 inverse and negative powers
const IC: P = [165, 150], IU = 60
const polarInv: Story = {
  title: b('Invers: sudut dicerminkan, radius dibalik', 'The inverse: mirror the angle, flip the radius'),
  frames: [
    f('Ambil z = 2e^(i40°): radius 2, sudut 40°. Kita cari w dengan z·w = 1, yaitu titik 1 di sumbu real (lingkaran putus-putus = radius 1).', 'Take z = 2e^(i40°): radius 2, angle 40°. We look for w with z·w = 1, the point 1 on the real axis (dashed circle = radius 1).', String.raw`z=2e^{i\,40^\circ},\quad z\,w=1`),
    f('Perkalian mengalikan radius dan menjumlahkan sudut. Supaya hasilnya 1: 2 · ρ = 1, jadi ρ = 0,5, dan 40° + α = 0°, jadi α = −40°. Invers z⁻¹ = 0,5e^(−i40°) adalah cermin sudut z, di dalam lingkaran satuan.', 'Multiplication multiplies radii and adds angles. To land on 1: 2 · ρ = 1, so ρ = 0.5, and 40° + α = 0°, so α = −40°. The inverse z⁻¹ = 0.5e^(−i40°) mirrors the angle of z, inside the unit circle.', String.raw`z^{-1}=\tfrac12e^{-i\,40^\circ}`),
    f('Pangkat negatif adalah pangkat dari invers: z⁻² = (z⁻¹)² = 0,25e^(−i80°). Radius 0,5² = 0,25 dan sudut 2 · (−40°) = −80°. Titiknya makin dekat ke 0.', 'Negative powers are powers of the inverse: z⁻² = (z⁻¹)² = 0.25e^(−i80°). Radius 0.5² = 0.25 and angle 2 · (−40°) = −80°. The point moves closer to 0.', String.raw`z^{-2}=(z^{-1})^2=\tfrac14e^{-i\,80^\circ}`),
    f('Geser r. Makin jauh z, makin dekat z⁻¹ ke 0, karena radiusnya 1/r. Hasil kali radiusnya selalu r · 1/r = 1 dan sudutnya selalu 40° − 40° = 0°. Untuk z = 0 tidak ada invers.', 'Move r. The farther z goes, the closer z⁻¹ gets to 0, because its radius is 1/r. The radii always multiply to r · 1/r = 1 and the angles always add to 40° − 40° = 0°. z = 0 has no inverse.', String.raw`(re^{i\theta})^{-1}=r^{-1}e^{-i\theta}`),
  ],
  control: { label: b('Radius r', 'Radius r'), min: 0.5, max: 2, step: 0.1, initial: 2 },
  controlFrom: 3,
  readout: r => String.raw`z=${fx(r)}e^{i\,40^\circ}\Rightarrow z^{-1}=${fx(1 / r)}e^{-i\,40^\circ}`,
  draw: (k, v, lang) => {
    const t = tr(lang), r = k === 3 ? Number(v.toFixed(1)) : 2, X = 305, one: P = [IC[0] + IU, IC[1]]
    const z = at(IC, IU * r, 40), w = at(IC, IU / r, -40), w2 = at(IC, IU / 4, -80)
    return <>
      <Axes c={IC} w={150} h={135} />
      <circle cx={IC[0]} cy={IC[1]} r={IU} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <circle cx={one[0]} cy={one[1]} r={5} fill={C.bg} stroke={C.fg} strokeWidth="2" />
      <T x={one[0] + 8} y={one[1] - 8} anchor="start" size={14} weight={700}>1</T>
      <Ang c={IC} r={22} a0={0} a1={40} color={C.a} />
      <Arrow from={IC} to={z} color={C.a} />
      <Tip c={IC} r={IU * r + 10} d={40} color={C.a}>z</Tip>
      <At from={1} frame={k}>
        <Ang c={IC} r={22} a0={0} a1={-40} color={C.v} />
        <Arrow from={IC} to={w} color={C.v} width={3.5} head={9} />
        <Dot at={w} color={C.v} r={4} />
        <Tip c={IC} r={IU / r + 14} d={-40} color={C.v}>z⁻¹</Tip>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={pl([IC, w2])} stroke={C.y} strokeWidth="3.5" strokeLinecap="round" />
        <Dot at={w2} color={C.y} r={4} />
        <T x={IC[0] - 2} y={IC[1] + 42} anchor="end" size={15} weight={700} color={C.y}>z⁻²</T>
      </At>
      <At until={0} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.a}>z = 2e<Sup>i40°</Sup></T>
        <T x={X} y={96} anchor="start" size={13} color={C.mu}>{t('cari w dengan', 'find w with')}</T>
        <T x={X} y={120} anchor="start" size={17} weight={600}>z · w = 1</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={52} anchor="start" size={13} color={C.mu}>{t('radius', 'radius')}</T>
        <T x={X} y={76} anchor="start" size={15}>2 · ρ = 1 ⇒ ρ = 0.5</T>
        <T x={X} y={108} anchor="start" size={13} color={C.mu}>{t('sudut', 'angle')}</T>
        <T x={X} y={132} anchor="start" size={15}>40° + α = 0°</T>
        <T x={X} y={156} anchor="start" size={15}>α = −40°</T>
        <T x={X} y={194} anchor="start" size={17} weight={700} color={C.v}>z⁻¹ = 0.5e<Sup>−i40°</Sup></T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={X} y={56} anchor="start" size={16} weight={600}>z⁻² = (z⁻¹)²</T>
        <T x={X} y={88} anchor="start" size={15}>0.5² = 0.25</T>
        <T x={X} y={114} anchor="start" size={15}>2 · (−40°) = −80°</T>
        <T x={X} y={152} anchor="start" size={17} weight={700} color={C.y}>z⁻² = 0.25e<Sup>−i80°</Sup></T>
      </At>
      <At from={3} frame={k}>
        <T x={X} y={56} anchor="start" size={16} weight={700} color={C.a}>r = {fx(r)}</T>
        <T x={X} y={84} anchor="start" size={16} weight={700} color={C.v}>1/r = {fx(1 / r)}</T>
        <T x={X} y={124} anchor="start" size={15}>r · 1/r = 1</T>
        <T x={X} y={150} anchor="start" size={15}>40° − 40° = 0°</T>
      </At>
    </>
  },
}

// ================================================================ roots:0 roots of a target other than 1
const RL: P = [110, 150], RR: P = [350, 150]
const rootsTarget: Story = {
  title: b('Akar pangkat tiga dari −8i: akar radius, bagi sudut', 'Cube roots of −8i: root the radius, divide the angle'),
  frames: [
    f('Target −8i (kiri, digambar dengan skala sendiri) punya radius 8 dan sudut −90°. Kita cari semua w dengan w³ = −8i.', 'The target −8i (left, drawn at its own scale) has radius 8 and angle −90°. We want every w with w³ = −8i.', String.raw`-8i=8e^{-i\,90^\circ}`),
    f('Pangkat tiga memangkatkan radius dan mengalikan sudut dengan 3. Jadi mundur: radius akar = ∛8 = 2 dan sudut = −90° ÷ 3 = −30°. Akar pertama w₀ = 2e^(−i30°) = √3 − i.', 'Cubing cubes the radius and triples the angle. So go backwards: root radius = ∛8 = 2 and angle = −90° ÷ 3 = −30°. The first root is w₀ = 2e^(−i30°) = √3 − i.', String.raw`w_0=2e^{-i\,30^\circ}=\sqrt3-i`),
    f('Sudut target juga bisa ditulis −90° + 360° = 270° atau −90° + 720° = 630°. Dibagi 3: 90° dan 210°. Jadi ada tiga akar, 2i dan −√3 − i, berjarak 120° pada lingkaran radius 2.', 'The target angle can also be written −90° + 360° = 270° or −90° + 720° = 630°. Divided by 3: 90° and 210°. So there are three roots, 2i and −√3 − i, 120° apart on the circle of radius 2.', String.raw`w_k=2e^{i(-90^\circ+360^\circ k)/3},\ k=0,1,2`),
    f('Geser sudut target θ. Ketiga akar berputar bersama, tetapi hanya sepertiga dari perubahan θ (lingkaran kosong = posisi awal). Radius 2 tidak berubah karena radius target tetap 8.', 'Move the target angle θ. All three roots turn together, but only by one third of the change in θ (hollow dots = starting positions). The radius 2 does not change because the target radius stays 8.', String.raw`w_k=8^{1/3}e^{i(\theta+360^\circ k)/3}`),
  ],
  control: { label: b('Sudut target θ (°)', 'Target angle θ (°)'), min: -180, max: 180, step: 6, initial: -90 },
  controlFrom: 3,
  readout: th => String.raw`\theta=${mn(th)}^\circ\Rightarrow\alpha_k=${mn(th / 3)}^\circ+120^\circ k`,
  draw: (k, v, lang) => {
    const t = tr(lang), th = k === 3 ? v : -90, cols = [C.a, C.g, C.y]
    const ang = [0, 1, 2].map(j => (th + 360 * j) / 3), pts = ang.map(a => at(RR, 100, a)), tg = at(RL, 88, th)
    return <>
      <T x={15} y={30} anchor="start" size={14} weight={600} color={C.mu}>{t('target w³', 'target w³')}</T>
      <T x={465} y={30} anchor="end" size={14} weight={600} color={C.mu}>{t('akar w', 'roots w')}</T>
      <Axes c={RL} w={100} h={100} />
      <circle cx={RL[0]} cy={RL[1]} r={88} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <Arrow from={RL} to={tg} color={C.y} width={3.5} />
      <Dot at={tg} color={C.y} />
      {Math.cos(rad(th)) < -0.35
        ? <T x={14} y={tg[1] + (Math.sin(rad(th)) > 0 ? -14 : 24)} anchor="start" size={14} weight={700} color={C.y}>{`8 ∠${mn(th)}°`}</T>
        : <Tip c={RL} r={100} d={th} color={C.y} size={14}>{k === 3 ? `8 ∠${mn(th)}°` : '−8i'}</Tip>}
      <Axes c={RR} w={115} h={112} />
      <circle cx={RR[0]} cy={RR[1]} r={100} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <At until={0} frame={k}><T x={RL[0]} y={284} size={14}>{t('radius 8, sudut −90°', 'radius 8, angle −90°')}</T></At>
      <At from={2} frame={k}><path d={pl(pts, true)} fill={C.soft} fillOpacity=".6" stroke={C.v} strokeWidth="2" /></At>
      <At from={3} frame={k}>{[-30, 90, 210].map(a => <circle key={a} cx={at(RR, 100, a)[0]} cy={at(RR, 100, a)[1]} r={6} fill={C.bg} stroke={C.mu} strokeWidth="2" />)}</At>
      {pts.map((p, j) => <At key={j} from={j ? 2 : 1} frame={k}>
        <Arrow from={RR} to={p} color={cols[j]} />
        <Dot at={p} color={cols[j]} />
        <Tip c={RR} r={114} d={ang[j]} color={cols[j]}>{`w${'₀₁₂'[j]}`}</Tip>
      </At>)}
      <At from={1} until={1} frame={k}><T x={RR[0]} y={284} size={14}>∛8 = 2,  −90° ÷ 3 = −30°</T></At>
      <At from={2} until={2} frame={k}><T x={RR[0]} y={284} size={14}>α = −30°, 90°, 210°</T></At>
      <At from={3} frame={k}>
        <T x={RL[0]} y={284} size={14}>θ = {mn(th)}°</T>
        <T x={RR[0]} y={284} size={14}>α = {mn(th / 3)}° + 120°k</T>
      </At>
    </>
  },
}

// ================================================================ roots:1 sum of roots of unity
const SS: P = [105, 150], SU = 70, rootCols = [C.a, C.g, C.y, C.v]
const rootSum: Story = {
  title: b('Jumlah akar satuan: panah-panahnya saling menghapus', 'Sum of the roots of unity: the arrows cancel out'),
  frames: [
    f('Lima akar satuan orde 5: 1, ω, ω², ω³, ω⁴ dengan ω = e^(2πi/5), berjarak 72° pada lingkaran satuan. Berapa jumlah kelima panah ini?', 'The five 5th roots of unity: 1, ω, ω², ω³, ω⁴ with ω = e^(2πi/5), 72° apart on the unit circle. What is the sum of these five arrows?', String.raw`S=1+\omega+\omega^2+\omega^3+\omega^4`),
    f('Sambungkan panah-panah itu ujung ke pangkal (kanan). Setiap panah berbelok 72° dari sebelumnya, jadi jalannya membentuk segi lima beraturan dan kembali tepat ke titik awal. Jumlahnya 0.', 'Join the arrows head to tail (right). Each arrow turns 72° from the previous one, so the path forms a regular pentagon and returns exactly to its start. The sum is 0.', String.raw`S=0`),
    f('Mengapa pasti 0? Kalikan semua akar dengan ω: setiap panah berputar 72° ke posisi akar berikutnya, jadi himpunannya sama dan ωS = S. Karena ω ≠ 1, (1 − ω)S = 0 memaksa S = 0.', 'Why must it be 0? Multiply every root by ω: each arrow turns 72° onto the next root, so the set is unchanged and ωS = S. Since ω ≠ 1, (1 − ω)S = 0 forces S = 0.', String.raw`(1-\omega)S=1-\omega^5=0`),
    f('Ubah n dengan penggeser. Untuk setiap n > 1 jalannya menutup menjadi segi-n beraturan. Untuk n = 2: 1 + (−1) = 0. Hanya n = 1 yang gagal, karena akarnya hanya 1.', 'Change n with the slider. For every n > 1 the path closes into a regular n-gon. For n = 2: 1 + (−1) = 0. Only n = 1 fails, since its only root is 1.', String.raw`n>1\Rightarrow\sum_{k=0}^{n-1}\omega^k=0`),
  ],
  control: { label: b('Banyak akar n', 'Number of roots n'), min: 2, max: 9, step: 1, initial: 5 },
  controlFrom: 3,
  readout: n => String.raw`1+\omega+\cdots+\omega^{${n - 1}}=0,\quad\omega=e^{2\pi i/${n}}`,
  draw: (k, v, lang) => {
    const t = tr(lang), n = k === 3 ? v : 5, step = 360 / n
    const vs: [number, number][] = [[0, 0]]
    for (let j = 0; j < n; j++) { const [x, y] = vs[j]; vs.push([x + Math.cos(rad(step * j)), y + Math.sin(rad(step * j))]) }
    const xs = vs.map(p => p[0]), ys = vs.map(p => p[1])
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2
    const cp = ([x, y]: [number, number]): P => [350 + SU * (x - cx), 155 - SU * (y - cy)]
    return <>
      <circle cx={SS[0]} cy={SS[1]} r={SU} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <T x={SS[0]} y={36} size={16} weight={700}>n = {n}</T>
      {Array.from({ length: n }, (_, j) => <Arrow key={j} from={SS} to={at(SS, SU, step * j)} color={rootCols[j % 4]} width={2.5} head={9} />)}
      <Dot at={SS} color={C.fg} r={3} />
      <Tip c={SS} r={SU + 22} d={0} color={rootCols[0]}>1</Tip>
      <Tip c={SS} r={SU + (n === 2 ? 12 : 22)} d={step} color={rootCols[1]}>ω</Tip>
      <At from={1} frame={k}>
        <T x={350} y={30} size={14} weight={600} color={C.mu}>{t('ujung ke pangkal', 'head to tail')}</T>
        {Array.from({ length: n }, (_, j) => <Arrow key={j} from={cp(vs[j])} to={cp(vs[j + 1])} color={rootCols[j % 4]} width={3} head={9} />)}
        <Dot at={cp(vs[0])} color={C.g} r={6} />
        <T x={cp(vs[0])[0]} y={cp(vs[0])[1] + 24} size={13} weight={600} color={C.g}>{t('awal = akhir', 'start = end')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        {Array.from({ length: n }, (_, j) => <g key={j}>
          <Ang c={SS} r={82} a0={step * j + 8} a1={step * (j + 1) - 12} color={C.mu} w={1.6} />
          <Arrow from={at(SS, 82, step * (j + 1) - 18)} to={at(SS, 82, step * (j + 1) - 5)} color={C.mu} width={1.6} head={7} />
        </g>)}
        <T x={SS[0]} y={260} size={16} weight={700} color={C.v}>ω · S = S</T>
        <T x={SS[0]} y={282} size={13} color={C.mu}>{t('putar 72°: himpunan sama', 'turn 72°: same set')}</T>
      </At>
    </>
  },
}

// ================================================================ disc:0 open, closed, or neither
const DY = 118, DR = 62, DX = [85, 240, 395]
const OutClip = ({ id, c, r }: { id: string; c: P; r: number }) =>
  <defs><clipPath id={id}><path d={`M0,0 H480 V300 H0 Z ${circ(c, r)}`} clipRule="evenodd" /></clipPath></defs>
const Leak = ({ id, c, at: q, r }: { id: string; c: P; at: P; r: number }) => <>
  <OutClip id={id} c={c} r={DR} />
  <g clipPath={`url(#${id})`}><circle cx={q[0]} cy={q[1]} r={r} fill={C.r} fillOpacity=".55" /></g>
  <circle cx={q[0]} cy={q[1]} r={r} fill="none" stroke={C.r} strokeWidth="2" />
  <Dot at={q} color={C.fg} r={4} />
</>
const openClosed: Story = {
  title: b('Terbuka, tertutup, atau bukan keduanya', 'Open, closed, or neither'),
  frames: [
    f('Cakram |z| < 1: tepinya putus-putus, artinya tidak ikut. Ambil titik mana saja di dalam, misalnya p: selalu ada cakram kecil (hijau) di sekitarnya yang seluruhnya di dalam. Jadi himpunan ini terbuka.', 'The disc |z| < 1: its edge is dashed, meaning it is left out. Take any point inside, say p: there is always a small disc (green) around it lying completely inside. So this set is open.', String.raw`|z|<1`),
    f('Cakram |z| ≤ 1 memuat seluruh tepinya (garis penuh), jadi tertutup. Tetapi titik tepi 1 ikut himpunan, dan setiap cakram kecil di sekitarnya keluar sebagian (merah). Jadi tidak terbuka.', 'The disc |z| ≤ 1 contains its whole edge (solid line), so it is closed. But the edge point 1 belongs to the set, and every small disc around it pokes outside (red). So it is not open.', String.raw`|z|\le1`),
    f('Himpunan 0 < |z| ≤ 1: tepi luar ikut, pusat 0 dibuang. Titik 1 ikut tetapi bocor keluar, jadi tidak terbuka. Titik 0 adalah titik batas yang tidak ikut, jadi tidak tertutup. Bukan keduanya.', 'The set 0 < |z| ≤ 1: the outer edge is in, the center 0 is removed. The point 1 is in but leaks outside, so the set is not open. The point 0 is a boundary point left out, so it is not closed. Neither.', String.raw`0<|z|\le1`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), c = DX.map((x): P => [x, DY])
    const labels: [string, string, string, string, string][] = [
      ['|z| < 1', t('terbuka', 'open'), C.g, t('tepi tidak ikut', 'edge left out'), C.mu],
      ['|z| ≤ 1', t('tertutup', 'closed'), C.g, t('tidak terbuka', 'not open'), C.r],
      ['0 < |z| ≤ 1', t('bukan keduanya', 'neither'), C.r, t('1 ikut, 0 tidak', '1 in, 0 out'), C.mu],
    ]
    return <>
      {c.map((p, i) => <At key={i} from={i} frame={k}>
        <path d={circ(p, DR)} fill={C.soft} stroke={C.a} strokeWidth="2.5" strokeDasharray={i ? undefined : '7 5'} />
        <T x={p[0]} y={212} size={16} weight={700}>{labels[i][0]}</T>
        <T x={p[0]} y={238} size={15} weight={700} color={labels[i][2]}>{labels[i][1]}</T>
        <T x={p[0]} y={262} size={13} color={labels[i][4]}>{labels[i][3]}</T>
      </At>)}
      <At frame={k}>
        <circle cx={at(c[0], 30, 35)[0]} cy={at(c[0], 30, 35)[1]} r={16} fill={C.g} fillOpacity=".25" stroke={C.g} strokeWidth="2" />
        <Dot at={at(c[0], 30, 35)} color={C.g} r={4} />
        <T x={at(c[0], 30, 35)[0] - 22} y={at(c[0], 30, 35)[1] + 4} anchor="end" size={14} weight={700} color={C.g}>p</T>
      </At>
      <At from={1} frame={k}>
        <Leak id="cA-b" c={c[1]} at={[c[1][0] + DR, DY]} r={15} />
        <T x={c[1][0] + DR - 4} y={DY - 22} anchor="end" size={14} weight={700}>1</T>
      </At>
      <At from={2} frame={k}>
        <Leak id="cA-c" c={c[2]} at={[c[2][0] + DR, DY]} r={15} />
        <T x={c[2][0] + DR - 4} y={DY - 22} anchor="end" size={14} weight={700}>1</T>
        <circle cx={c[2][0]} cy={DY} r={6} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
        <T x={c[2][0]} y={DY + 26} size={14} weight={700} color={C.r}>0</T>
      </At>
    </>
  },
}

// ================================================================ disc:1 connectedness and domains
const CL1: P = [60, 125], CL2: P = [170, 125], AN: P = [355, 125]
const connected: Story = {
  title: b('Terhubung dan domain: bisakah dua titik disambung?', 'Connected and domains: can two points be joined?'),
  frames: [
    f('Domain = terbuka + terhubung. Kiri: dua cakram terbuka yang terpisah. Masing-masing terbuka, tetapi dari p ke q setiap jalan harus melewati celah di luar himpunan. Dua komponen: bukan domain.', 'Domain = open + connected. Left: two separate open discs. Each one is open, but every path from p to q has to cross the gap outside the set. Two components: not a domain.', String.raw`A\cup B,\ \ \overline A\cap\overline B=\varnothing`),
    f('Kanan: anulus 1 < |z| < 2. Garis lurus dari p ke q menembus lubang, tetapi jalan hijau memutar lewat atas dan tetap di dalam. Terbuka dan terhubung: anulus adalah domain.', 'Right: the annulus 1 < |z| < 2. The straight segment from p to q crosses the hole, but the green path goes around the top and stays inside. Open and connected: the annulus is a domain.', String.raw`D=\{1<|z|<2\}`),
    f('Terhubung tidak berarti tanpa lubang. Lingkaran kuning di dalam anulus mengelilingi lubang, jadi tidak bisa dikerutkan ke satu titik tanpa keluar dari himpunan. Anulus terhubung tetapi tidak terhubung sederhana (simply connected).', 'Connected does not mean hole-free. The amber loop inside the annulus goes around the hole, so it cannot shrink to a point without leaving the set. The annulus is connected but not simply connected.', String.raw`|z|=1.5\ \ \text{loop}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), p: P = [AN[0] - 60, AN[1]], q: P = [AN[0] + 60, AN[1]]
    return <>
      <T x={115} y={30} size={14} weight={600} color={C.mu}>{t('dua cakram terpisah', 'two separate discs')}</T>
      {[CL1, CL2].map((c, i) => <path key={i} d={circ(c, 42)} fill={C.soft} stroke={C.a} strokeWidth="2.5" strokeDasharray="7 5" />)}
      <path d={pl([CL1, CL2])} stroke={C.r} strokeWidth="2" strokeDasharray="5 5" />
      <T x={115} y={131} size={18} weight={700} color={C.r}>✗</T>
      <Dot at={CL1} color={C.g} /><Dot at={CL2} color={C.g} />
      <T x={CL1[0]} y={CL1[1] - 12} weight={700} color={C.g}>p</T>
      <T x={CL2[0]} y={CL2[1] - 12} weight={700} color={C.g}>q</T>
      <T x={115} y={210} size={15}>{t('dua komponen', 'two components')}</T>
      <T x={115} y={234} size={15} weight={700} color={C.r}>{t('bukan domain', 'not a domain')}</T>
      <At from={1} frame={k}>
        <T x={AN[0]} y={30} size={14} weight={600} color={C.mu}>{t('anulus', 'annulus')}</T>
        <path d={`${circ(AN, 80)} ${circ(AN, 40)}`} fill={C.soft} fillRule="evenodd" stroke={C.a} strokeWidth="2.5" strokeDasharray="7 5" />
        <T x={AN[0]} y={232} size={15} weight={600}>{'1 < |z| < 2'}</T>
        <T x={AN[0]} y={256} size={13} weight={600} color={C.g}>{t('terbuka dan terhubung: domain', 'open and connected: domain')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([p, q])} stroke={C.r} strokeWidth="1.8" strokeDasharray="5 5" />
        <T x={AN[0]} y={AN[1] + 6} size={18} weight={700} color={C.r}>✗</T>
        <path d={arc(AN, 60, Math.PI, 0)} fill="none" stroke={C.g} strokeWidth="3.5" />
      </At>
      <At from={2} frame={k}>
        <circle cx={AN[0]} cy={AN[1]} r={60} fill="none" stroke={C.y} strokeWidth="3.5" strokeDasharray="9 5" />
        <Arrow from={at(AN, 60, 100)} to={at(AN, 60, 116)} color={C.y} width={3} head={9} />
        <T x={AN[0]} y={280} size={13} weight={600} color={C.y}>{t('lingkar tidak bisa dikerutkan', 'the loop cannot shrink')}</T>
      </At>
      <At from={1} frame={k}>
        <Dot at={p} color={C.g} /><Dot at={q} color={C.g} />
        <T x={p[0]} y={p[1] + 22} weight={700} color={C.g}>p</T>
        <T x={q[0]} y={q[1] + 22} weight={700} color={C.g}>q</T>
      </At>
    </>
  },
}

// ================================================================ disc:2 bounded sets and accumulation points
const BC: P = [150, 150], ZX = 40, ZY = 170, ZU = 400
const accumulation: Story = {
  title: b('Terbatas dan titik akumulasi: S = {1/n}', 'Bounded sets and accumulation points: S = {1/n}'),
  frames: [
    f('S = {1, 1/2, 1/3, …}. Semua titiknya berada di dalam lingkaran berjari-jari 2 (kuning), jadi S terbatas: satu cakram berhingga memuat seluruh himpunan.', 'S = {1, 1/2, 1/3, …}. All its points lie inside the circle of radius 2 (amber), so S is bounded: one finite disc contains the whole set.', String.raw`|1/n|\le1<2`),
    f('Perbesar ruas 0 sampai 1. Titik-titiknya menumpuk dekat 0. Geser ε: cakram sekecil apa pun di sekitar 0 tetap memuat tak hingga banyak anggota (hijau), yaitu semua 1/n dengan n > 1/ε. Itulah titik akumulasi.', 'Zoom in on 0 to 1. The points pile up near 0. Move ε: however small the disc around 0, it still holds infinitely many members (green), namely every 1/n with n > 1/ε. That is an accumulation point.', String.raw`n>1/\varepsilon\Rightarrow0<\tfrac1n<\varepsilon`),
    f('Tetapi 0 sendiri bukan anggota S (lingkaran kosong). Titik akumulasi tidak harus ikut himpunan. Karena S tidak memuat titik batas 0, S tidak tertutup walaupun terbatas.', 'But 0 itself is not a member of S (hollow circle). An accumulation point need not belong to the set. Since S misses the boundary point 0, S is not closed even though it is bounded.', String.raw`0\notin S,\quad 0\in\overline S`),
  ],
  control: { label: b('Jari-jari ε', 'Radius ε'), min: 0.05, max: 0.3, step: 0.05, initial: 0.15 },
  controlFrom: 1,
  readout: e => { const ep = Number(e.toFixed(2)), N = Math.floor(1 / ep + 1e-9); return String.raw`\varepsilon=${ep}:\ n>${N}\Rightarrow\tfrac1n<${ep}` },
  draw: (k, v, lang) => {
    const t = tr(lang), e = Number(v.toFixed(2)), X = 300, ns = Array.from({ length: 80 }, (_, i) => i + 1)
    return <>
      <At until={0} frame={k}>
        <Axes c={BC} w={135} h={135} />
        <circle cx={BC[0]} cy={BC[1]} r={120} fill="none" stroke={C.y} strokeWidth="2.5" strokeDasharray="7 5" />
        <T x={56} y={62} size={14} weight={700} color={C.y}>R = 2</T>
        {ns.slice(0, 30).map(n => <Dot key={n} at={[BC[0] + 60 / n, BC[1]]} color={C.a} r={3.5} />)}
        <T x={BC[0] + 60} y={BC[1] - 12} size={13} weight={600} color={C.a}>1</T>
        <T x={BC[0] + 30} y={BC[1] - 12} size={13} weight={600} color={C.a}>1/2</T>
        <T x={BC[0] - 10} y={BC[1] + 18} size={13} color={C.mu}>0</T>
        <T x={X} y={70} anchor="start" size={15} weight={600}>S = {'{1, 1/2, 1/3, …}'}</T>
        <T x={X} y={106} anchor="start" size={13} color={C.mu}>{t('semua titik:', 'every point:')}</T>
        <T x={X} y={130} anchor="start" size={15}>{'|z| ≤ 1 < 2'}</T>
        <T x={X} y={168} anchor="start" size={16} weight={700} color={C.g}>{t('terbatas ✓', 'bounded ✓')}</T>
      </At>
      <At from={1} frame={k}>
        <defs><clipPath id="cA-eps"><rect x={10} y={12} width={460} height={278} /></clipPath></defs>
        <g clipPath="url(#cA-eps)"><circle cx={ZX} cy={ZY} r={ZU * e} fill={C.g} fillOpacity=".12" stroke={C.g} strokeWidth="2" strokeDasharray="6 4" style={{ transition: 'r .3s' }} /></g>
        <path d={`M20,${ZY} H462`} stroke={C.ln} strokeWidth="1.4" />
        {ns.map(n => <Dot key={n} at={[ZX + ZU / n, ZY]} color={1 / n < e ? C.g : C.a} r={3} />)}
        {[1, 2, 3, 4].map(n => <T key={n} x={ZX + ZU / n} y={ZY - 14} size={13} weight={600} color={C.a}>{n === 1 ? '1' : `1/${n}`}</T>)}
        <circle cx={ZX} cy={ZY} r={6} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
        <T x={ZX} y={ZY - 14} size={13} weight={700} color={C.r}>0</T>
        <T x={460} y={36} anchor="end" size={13} color={C.mu}>{t('diperbesar: 0 sampai 1', 'zoomed in: 0 to 1')}</T>
        <T x={ZX + ZU * e + 6} y={ZY - 34} anchor="start" size={14} weight={700} color={C.g}>ε = {e}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={310} y={240} size={15}>n {'>'} {Math.floor(1 / e + 1e-9)} ⇒ 1/n {'<'} {e}</T>
        <T x={310} y={264} size={14} weight={600} color={C.g}>{t('tak hingga banyak titik di dalam', 'infinitely many points inside')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={ZX} y={ZY + 30} size={14} weight={700} color={C.r}>0 ∉ S</T>
        <T x={310} y={240} size={15} weight={600}>{t('0: titik akumulasi', '0: accumulation point')}</T>
        <T x={310} y={264} size={14} weight={600} color={C.r}>{t('terbatas, tetapi tidak tertutup', 'bounded, but not closed')}</T>
      </At>
    </>
  },
}

// ================================================================ map:0 regions and conformality
const ZI: P = [40, 235], ZIU = 150, ZO: P = [335, 235], ZOU = 120
const sector = (o: P, r: number, a: number) => { const p0 = at(o, r, 0), p1 = at(o, r, a); return `M${o[0]},${o[1]} L${p0[0]},${p0[1]} A${r} ${r} 0 0 0 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z` }
const conformal: Story = {
  title: b('z²: sudut global digandakan, sudut lokal terjaga', 'z²: global angles double, local angles are kept'),
  frames: [
    f('Sektor masukan bersudut α (geser penggeser). Karena (re^(iθ))² = r²e^(2iθ), sudut yang diukur dari titik 0 digandakan: sektor 90° menjadi setengah bidang 180°, sektor 40° menjadi 80°.', 'The input sector has angle α (use the slider). Since (re^(iθ))² = r²e^(2iθ), angles measured from 0 double: a 90° sector becomes a 180° half plane, a 40° sector becomes 80°.', String.raw`\rho=r^2,\quad\phi=2\theta`),
    f('Secara lokal lain ceritanya. Di z₀ = 0,8e^(iα/2), dua arah kecil yang tegak lurus dikalikan dengan bilangan yang sama f′(z₀) = 2z₀ = 1,6e^(iα/2): keduanya diputar α/2 dan diperbesar 1,6 kali. Sudut perpotongannya tetap 90°.', 'Locally the story is different. At z₀ = 0.8e^(iα/2), two small perpendicular directions are multiplied by the same number f′(z₀) = 2z₀ = 1.6e^(iα/2): both turn by α/2 and stretch 1.6 times. Their crossing angle stays 90°.', String.raw`f'(z_0)=2z_0=1.6\,e^{i\alpha/2}`),
    f('Di 0 turunannya f′(0) = 0, jadi alasan itu gagal. Dua tepi sektor yang bertemu di 0 dengan sudut α keluar dengan sudut 2α (merah). Konformalitas hanya berlaku di titik dengan f′ ≠ 0.', 'At 0 the derivative is f′(0) = 0, so that argument fails. The two sector edges meeting at 0 at angle α come out at angle 2α (red). Conformality only holds where f′ ≠ 0.', String.raw`f'(0)=0:\ \alpha\mapsto2\alpha`),
  ],
  control: { label: b('Sudut sektor α (°)', 'Sector angle α (°)'), min: 20, max: 90, step: 10, initial: 90 },
  readout: a => String.raw`${a}^\circ\mapsto${2 * a}^\circ,\quad f'(z_0)=1.6\,e^{i\,${a / 2}^\circ}`,
  draw: (k, a, lang) => {
    const t = tr(lang), z0 = at(ZI, 0.8 * ZIU, a / 2), w0 = at(ZO, 0.64 * ZOU, a), Li = 30, Lo = 30 * 1.6 * ZOU / ZIU
    const red = k === 2
    return <>
      <path d={`M${ZI[0] - 15},${ZI[1]} H${ZI[0] + 170} M${ZI[0]},${ZI[1] + 12} V60`} stroke={C.ln} strokeWidth="1.3" />
      <path d={`M${ZO[0] - 135},${ZO[1]} H${ZO[0] + 135} M${ZO[0]},${ZO[1] + 12} V95`} stroke={C.ln} strokeWidth="1.3" />
      <T x={115} y={30} size={14} weight={600} color={C.mu}>{t('bidang z', 'z-plane')}</T>
      <T x={ZO[0]} y={30} size={14} weight={600} color={C.mu}>{t('bidang w', 'w-plane')}</T>
      <Arrow from={[200, 62]} to={[262, 62]} color={C.v} width={2.5} />
      <T x={231} y={50} size={15} weight={700} color={C.v}>w = z²</T>
      <path d={sector(ZI, ZIU, a)} fill={C.soft} fillOpacity=".7" />
      <path d={sector(ZO, ZOU, 2 * a)} fill={C.soft} fillOpacity=".7" />
      <path d={pl([ZI, at(ZI, ZIU, 0)])} stroke={C.g} strokeWidth="3" />
      <path d={pl([ZI, at(ZI, ZIU, a)])} stroke={C.y} strokeWidth="3" />
      <path d={pl([ZO, at(ZO, ZOU, 0)])} stroke={C.g} strokeWidth="3" />
      <path d={pl([ZO, at(ZO, ZOU, 2 * a)])} stroke={C.y} strokeWidth="3" />
      <Ang c={ZI} r={28} a0={0} a1={a} color={red ? C.r : C.fg} w={red ? 3 : 1.8} />
      <Ang c={ZO} r={28} a0={0} a1={2 * a} color={red ? C.r : C.fg} w={red ? 3 : 1.8} />
      <T x={at(ZI, 44, a / 2)[0]} y={at(ZI, 44, a / 2)[1] + 5} size={13} weight={700} color={red ? C.r : C.fg}>{a}°</T>
      <T x={at(ZO, 48, a)[0]} y={at(ZO, 48, a)[1] + 5} size={13} weight={700} color={red ? C.r : C.fg}>{2 * a}°</T>
      <At from={1} until={1} frame={k}>
        <Arrow from={z0} to={at(z0, Li, a / 2)} color={C.a} width={3} head={8} />
        <Arrow from={z0} to={at(z0, Li, a / 2 + 90)} color={C.v} width={3} head={8} />
        <RightAngle at={z0} a={rad(a / 2)} size={8} color={C.fg} />
        <Dot at={z0} color={C.fg} r={3.5} />
        <Arrow from={w0} to={at(w0, Lo, a)} color={C.a} width={3} head={8} />
        <Arrow from={w0} to={at(w0, Lo, a + 90)} color={C.v} width={3} head={8} />
        <RightAngle at={w0} a={rad(a)} size={8} color={C.fg} />
        <Dot at={w0} color={C.fg} r={3.5} />
        <T x={240} y={262} size={14} weight={600}>f′(z₀) = 1.6 ∠{a / 2}°</T>
        <T x={240} y={284} size={14} weight={600} color={C.g}>{t('di z₀: tetap 90°', 'at z₀: still 90°')}</T>
      </At>
      <At until={0} frame={k}>
        <T x={240} y={262} size={14} weight={600}>{t('sudut dari 0 dikali 2', 'angles from 0 times 2')}</T>
        <T x={240} y={284} size={14}>{a}° ↦ {2 * a}°</T>
      </At>
      <At from={2} frame={k}>
        <Dot at={ZI} color={C.r} r={5} /><Dot at={ZO} color={C.r} r={5} />
        <T x={240} y={262} size={14} weight={600} color={C.r}>f′(0) = 0</T>
        <T x={240} y={284} size={14} color={C.r}>{t('di 0', 'at 0')}: {a}° ↦ {2 * a}°</T>
      </At>
    </>
  },
}

// ================================================================ map:1 exponential: lines to circles and rays
const EZ: P = [95, 150], EU = 40, EW: P = [340, 150], EWU = 45
const expLines: Story = {
  title: b('eᶻ: garis tegak menjadi lingkaran, garis datar menjadi sinar', 'eᶻ: vertical lines become circles, horizontal lines become rays'),
  frames: [
    f('Pisahkan e^(x+iy) = eˣ · e^(iy): x hanya mengatur panjang, y hanya mengatur sudut. Garis tegak x = 0,5 (ungu) punya panjang tetap e^0,5 ≈ 1,65, jadi dipetakan ke lingkaran berjari-jari 1,65.', 'Split e^(x+iy) = eˣ · e^(iy): x only sets the length, y only sets the angle. The vertical line x = 0.5 (violet) has the fixed length e^0.5 ≈ 1.65, so it maps to the circle of radius 1.65.', String.raw`x=0.5\mapsto|w|=e^{0.5}\approx1.65`),
    f('Geser y: titik 0,5 + iy naik di garis, dan bayangannya berputar di lingkaran dengan sudut y radian. Dari y = −π sampai π titiknya mengelilingi lingkaran tepat sekali; y + 2π kembali ke titik yang sama.', 'Move y: the point 0.5 + iy climbs the line, and its image turns around the circle at angle y radians. From y = −π to π it goes around exactly once; y + 2π returns to the same point.', String.raw`e^{z+2\pi i}=e^z`),
    f('Garis datar pada ketinggian y (hijau) punya sudut tetap y, jadi menjadi sinar dari 0 bersudut y. Titik x = −1, 0, 1 jatuh di jarak e⁻¹ ≈ 0,37, 1, dan e ≈ 2,72. Titik 0 sendiri tidak pernah tercapai.', 'The horizontal line at height y (green) has the fixed angle y, so it becomes a ray from 0 at angle y. The points x = −1, 0, 1 land at distances e⁻¹ ≈ 0.37, 1 and e ≈ 2.72. The point 0 itself is never reached.', String.raw`y=c\mapsto\arg w=c,\quad e^x>0`),
  ],
  control: { label: b('Tinggi y (radian)', 'Height y (radians)'), min: -3.1, max: 3.1, step: 0.1, initial: 0.8 },
  controlFrom: 1,
  readout: y => { const v = Number(y.toFixed(1)); return String.raw`e^{0.5${v < 0 ? '-' : '+'}${Math.abs(v)}i}\approx1.65\,e^{${v}i}` },
  draw: (k, v) => {
    const y = Number(v.toFixed(1)), z = plane(EZ, EU), w = plane(EW, EWU), R = Math.exp(0.5) * EWU, dg = y * 180 / Math.PI
    const pin = z(0.5, y), pout = at(EW, R, dg)
    return <>
      <Grid map={z} x={[-1.5, 1.5]} y={[-3.3, 3.3]} grid={false} />
      {[1, -1].map(s => <g key={s}><path d={`M${EZ[0] - 5},${z(0, s * Math.PI)[1]} h10`} stroke={C.ln} strokeWidth="1.4" />{!(k >= 2 && Math.abs(y - s * Math.PI) < 0.3) && <T x={EZ[0] - 9} y={z(0, s * Math.PI)[1] + 5} anchor="end" size={13} color={C.mu}>{s > 0 ? 'π' : '−π'}</T>}</g>)}
      <Grid map={w} x={[-2.7, 2.7]} y={[-2.9, 2.9]} grid={false} />
      <T x={20} y={30} anchor="start" size={14} weight={600} color={C.mu}>z</T>
      <T x={465} y={30} anchor="end" size={14} weight={600} color={C.mu}>w = eᶻ</T>
      <Arrow from={[165, 40]} to={[225, 40]} color={C.v} width={2.5} />
      <T x={195} y={30} size={14} weight={700} color={C.v}>eᶻ</T>
      <path d={pl([z(0.5, -Math.PI), z(0.5, Math.PI)])} stroke={C.a} strokeWidth="3" />
      <T x={z(0.5, 0)[0] + 8} y={k >= 2 && y < -2 ? 58 : 272} anchor="start" size={14} weight={700} color={C.a}>x = 0.5</T>
      <circle cx={EW[0]} cy={EW[1]} r={R} fill="none" stroke={C.a} strokeWidth="3" />
      <T x={200} y={84} anchor="start" size={14} weight={700} color={C.a}>|w| ≈ 1.65</T>
      <At from={2} frame={k}>
        <path d={pl([z(-1.5, y), z(1, y)])} stroke={C.g} strokeWidth="3" />
        <Arrow from={EW} to={at(EW, Math.E * EWU, dg)} color={C.g} width={3} />
        {[-1, 0, 1].map(x => <g key={x}><Dot at={z(x, y)} color={C.g} r={4.5} /><Dot at={at(EW, Math.exp(x) * EWU, dg)} color={C.g} r={4.5} /></g>)}
        <T x={z(-1, y)[0]} y={z(-1, y)[1] - 10} size={12} weight={600} color={C.g}>−1</T>
        <T x={z(0, y)[0] - 8} y={z(0, y)[1] - 10} size={12} weight={600} color={C.g}>0</T>
        <T x={z(1, y)[0] + 4} y={z(1, y)[1] - 10} size={12} weight={600} color={C.g}>1</T>
        <circle cx={EW[0]} cy={EW[1]} r={5} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
      </At>
      <At from={1} frame={k}>
        <path d={pl([EW, pout])} stroke={C.v} strokeWidth="1.5" strokeDasharray="4 4" />
        <Ang c={EW} r={18} a0={0} a1={dg} color={C.v} />
        <Dot at={pin} color={C.v} r={6} />
        <Dot at={pout} color={C.v} r={6} />
      </At>
    </>
  },
}

// ================================================================ derivative:0 limits from every direction
const LZ: P = [115, 150], LW: P = [355, 150], LR = 80
const directions: Story = {
  title: b('Limit dari semua arah: z̄/z di dekat 0', 'Limits from every direction: z̄/z near 0'),
  frames: [
    f('Dekati 0 sepanjang sumbu real (hijau): z = x, jadi z̄/z = x/x = 1 di setiap titik. Dari arah ini limitnya tampak 1 (kanan: titik 1 di lingkaran satuan).', 'Approach 0 along the real axis (green): z = x, so z̄/z = x/x = 1 at every point. From this direction the limit looks like 1 (right: the point 1 on the unit circle).', String.raw`\frac{\bar x}{x}=1`),
    f('Dekati sepanjang sumbu imajiner (merah): z = iy, jadi z̄/z = −iy/iy = −1. Dua arah, dua jawaban berbeda: limit z̄/z di 0 tidak ada.', 'Approach along the imaginary axis (red): z = iy, so z̄/z = −iy/iy = −1. Two directions, two different answers: z̄/z has no limit at 0.', String.raw`\frac{\overline{iy}}{iy}=-1`),
    f('Geser arah φ. Pada garis z = te^(iφ), z̄/z = e^(−2iφ): nilainya tetap sepanjang garis, tetapi berubah dengan arah, dan seluruh lingkaran satuan muncul. Dua arah cukup untuk menyangkal limit, tetapi tidak pernah cukup untuk membuktikannya.', 'Move the direction φ. On the line z = te^(iφ), z̄/z = e^(−2iφ): constant along the line, but changing with the direction, and the whole unit circle shows up. Two directions suffice to disprove a limit, but never to prove one.', String.raw`z=te^{i\varphi}\Rightarrow\frac{\bar z}{z}=e^{-2i\varphi}`),
  ],
  control: { label: b('Arah φ (°)', 'Direction φ (°)'), min: 0, max: 180, step: 5, initial: 45 },
  controlFrom: 2,
  readout: p => String.raw`\varphi=${p}^\circ\Rightarrow\frac{\bar z}{z}=e^{-i\,${2 * p}^\circ}`,
  draw: (k, p, lang) => {
    const t = tr(lang), out = at(LW, LR, -2 * p)
    return <>
      <Axes c={LZ} w={100} h={110} />
      <Axes c={LW} w={110} h={110} />
      <circle cx={LW[0]} cy={LW[1]} r={LR} fill="none" stroke={C.ln} strokeDasharray="4 5" />
      <T x={20} y={30} anchor="start" size={14} weight={600} color={C.mu}>z → 0</T>
      <T x={465} y={30} anchor="end" size={14} weight={600} color={C.mu}>z̄ / z</T>
      <Arrow from={[LZ[0] + 95, LZ[1]]} to={[LZ[0] + 12, LZ[1]]} color={C.g} />
      <Arrow from={[LZ[0] - 95, LZ[1]]} to={[LZ[0] - 12, LZ[1]]} color={C.g} />
      <Dot at={[LW[0] + LR, LW[1]]} color={C.g} r={7} />
      <T x={LW[0] + LR + 12} y={LW[1] - 10} anchor="start" size={15} weight={700} color={C.g}>1</T>
      <At from={1} frame={k}>
        <Arrow from={[LZ[0], LZ[1] - 100]} to={[LZ[0], LZ[1] - 12]} color={C.r} />
        <Arrow from={[LZ[0], LZ[1] + 100]} to={[LZ[0], LZ[1] + 12]} color={C.r} />
        <Dot at={[LW[0] - LR, LW[1]]} color={C.r} r={7} />
        <T x={LW[0] - LR - 12} y={LW[1] - 10} anchor="end" size={15} weight={700} color={C.r}>−1</T>
      </At>
      <At from={1} until={1} frame={k}><T x={LW[0]} y={278} size={17} weight={700}>1 ≠ −1</T></At>
      <At from={2} frame={k}>
        <Arrow from={at(LZ, 100, p)} to={at(LZ, 12, p)} color={C.v} />
        <Arrow from={at(LZ, 100, p + 180)} to={at(LZ, 12, p + 180)} color={C.v} />
        <Ang c={LZ} r={26} a0={0} a1={p} color={C.v} />
        <T x={at(LZ, 40, p / 2)[0]} y={at(LZ, 40, p / 2)[1] + 5} size={13} weight={700} color={C.v}>φ</T>
        <Ang c={LW} r={26} a0={0} a1={-2 * p} color={C.v} />
        <path d={pl([LW, out])} stroke={C.v} strokeWidth="1.5" strokeDasharray="4 4" />
        <Dot at={out} color={C.v} r={7} />
        <T x={LW[0]} y={278} size={15} weight={600} color={C.v}>{t('sudut', 'angle')} −2φ = {mn(-2 * p)}°</T>
      </At>
      <circle cx={LZ[0]} cy={LZ[1]} r={5} fill={C.bg} stroke={C.fg} strokeWidth="2" />
    </>
  },
}

// ================================================================ derivative:1 component limits and continuity
const CI: P = [110, 150], CO: P = [330, 150], CU = 140, dirs = [30, 120, 210, 300], dels = [.3, .2, .12, .06, .02], dirCols = [C.a, C.g, C.y, C.v]
const sqOff = (d: number, ph: number): [number, number] => { const x = 1 + d * Math.cos(rad(ph)), y = d * Math.sin(rad(ph)); return [x * x - y * y - 1, 2 * x * y] }
const components: Story = {
  title: b('Limit lewat komponen: f(z) = z² menuju 1', 'Limits through components: f(z) = z² tends to 1'),
  frames: [
    f('Dekati z₀ = 1 dari empat arah (empat warna). Titik masukan berjarak 0,3; 0,2; 0,12; 0,06; 0,02 dari 1.', 'Approach z₀ = 1 from four directions (four colors). The input points lie 0.3, 0.2, 0.12, 0.06, 0.02 away from 1.', String.raw`z=1+\delta e^{i\varphi},\ \delta\to0`),
    f('Petakan dengan f(z) = z². Semua keluaran, dari arah mana pun, menumpuk ke 1. Jadi lim f(z) = 1 untuk z → 1.', 'Map them by f(z) = z². All outputs, from every direction, pile up at 1. So lim f(z) = 1 as z → 1.', String.raw`\lim_{z\to1}z^2=1`),
    f('Lihat per komponen, u = x² − y² dan v = 2xy. Titik terjauh di arah 30° memberi f ≈ 1,565 + 0,378i, jadi u − 1 ≈ 0,56 dan v ≈ 0,38. Karena |f − 1|² = (u − 1)² + v², jarak kecil sama artinya dengan kedua komponen kecil.', 'Look at the components u = x² − y² and v = 2xy. The farthest point in direction 30° gives f ≈ 1.565 + 0.378i, so u − 1 ≈ 0.56 and v ≈ 0.38. Since |f − 1|² = (u − 1)² + v², a small distance means exactly that both components are small.', String.raw`|f-1|^2=(u-1)^2+v^2`),
    f('Nilai limit 1 sama dengan nilai fungsi f(1) = 1² = 1, jadi z² kontinu di 1. Kalau f tidak didefinisikan di 1, limitnya tetap ada, tetapi f tidak bisa disebut kontinu di sana.', 'The limit 1 equals the function value f(1) = 1² = 1, so z² is continuous at 1. If f were undefined at 1, the limit would still exist, but f could not be called continuous there.', String.raw`\lim_{z\to1}f(z)=f(1)=1`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), [du, dv] = sqOff(.3, 30), S: P = [CO[0] + CU * du, CO[1] - CU * dv], F: P = [S[0], CO[1]]
    return <>
      <T x={CI[0]} y={36} size={14} weight={600} color={C.mu}>{t('masukan z → 1', 'inputs z → 1')}</T>
      <path d={`M25,${CI[1]} H190`} stroke={C.ln} strokeWidth="1.3" />
      {dirs.map((ph, i) => dels.map(d => <Dot key={`${ph}${d}`} at={at(CI, CU * d, ph)} color={dirCols[i]} r={4} />))}
      <Dot at={CI} color={C.fg} r={5} />
      <T x={CI[0] + 14} y={CI[1] + 20} anchor="start" size={13} weight={700}>1</T>
      <At from={1} frame={k}>
        <T x={CO[0] + 20} y={36} size={14} weight={600} color={C.mu}>{t('keluaran z²', 'outputs z²')}</T>
        <Arrow from={[170, 110]} to={[232, 110]} color={C.v} width={2.5} />
        <T x={201} y={98} size={15} weight={700} color={C.v}>z²</T>
        <path d={`M205,${CO[1]} H465`} stroke={C.ln} strokeWidth="1.3" />
        {dirs.map((ph, i) => dels.map(d => { const [a, c] = sqOff(d, ph); return <Dot key={`${ph}${d}`} at={[CO[0] + CU * a, CO[1] - CU * c]} color={dirCols[i]} r={4} /> }))}
        <Dot at={CO} color={C.fg} r={5} />
        <T x={CO[0] + 14} y={CO[1] + 20} anchor="start" size={13} weight={700}>1</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={pl([CO, F])} stroke={C.g} strokeWidth="3.5" />
        <path d={pl([F, S])} stroke={C.y} strokeWidth="3.5" />
        <path d={pl([CO, S])} stroke={C.v} strokeWidth="2" strokeDasharray="5 4" />
        <RightAngle at={F} a={Math.PI / 2} size={9} color={C.fg} />
        <T x={110} y={270} size={15} weight={700} color={C.g}>u − 1 ≈ 0.56</T>
        <T x={250} y={270} size={15} weight={700} color={C.y}>v ≈ 0.38</T>
        <T x={385} y={270} size={15} weight={700} color={C.v}>|f − 1| ≈ 0.68</T>
      </At>
      <At from={3} frame={k}>
        <circle cx={CO[0]} cy={CO[1]} r={11} fill="none" stroke={C.g} strokeWidth="2.5" />
        <T x={240} y={270} size={15} weight={700} color={C.g}>lim f = 1 = f(1): {t('kontinu', 'continuous')}</T>
      </At>
    </>
  },
}

// ================================================================ derivative:2 limits at infinity through inversion
const VL: P = [125, 150], VLU = 25, VR: P = [360, 150], VRU = 100
const infinity: Story = {
  title: b('Limit di tak hingga lewat inversi ζ = 1/z', 'Limits at infinity through the inversion ζ = 1/z'),
  frames: [
    f('"z → ∞" artinya z keluar dari setiap lingkaran. Lingkungan ∞ adalah daerah di luar lingkaran |z| = R (diarsir). Di sini R = 2, dan titik z = 2e^(i35°) ada di tepinya.', '"z → ∞" means z leaves every circle. A neighborhood of ∞ is the region outside the circle |z| = R (shaded). Here R = 2, and the point z = 2e^(i35°) sits on its edge.', String.raw`\{\,|z|>R\,\}`),
    f('Inversi ζ = 1/z membalik jarak: |1/z| = 1/|z|. Luar lingkaran R = 2 dikirim ke dalam lingkaran 1/2 di sekitar 0, dan sudut 35° menjadi −35°. Jadi z → ∞ sama dengan ζ → 0, limit biasa di 0.', 'The inversion ζ = 1/z flips distances: |1/z| = 1/|z|. The outside of the circle R = 2 is sent inside the circle 1/2 around 0, and the angle 35° becomes −35°. So z → ∞ is the same as ζ → 0, an ordinary limit at 0.', String.raw`z\to\infty\iff\zeta=1/z\to0`),
    f('Geser R. Makin besar R, makin kecil 1/R, dan hasil kali panjangnya selalu R · 1/R = 1. Untuk f → ∞ pakai trik yang sama pada nilai fungsi: cek 1/f → 0.', 'Move R. The bigger R, the smaller 1/R, and the lengths always multiply to R · 1/R = 1. For f → ∞ use the same trick on the values: check 1/f → 0.', String.raw`f\to\infty\iff1/f\to0`),
  ],
  control: { label: b('Radius R', 'Radius R'), min: 1, max: 4, step: 0.5, initial: 2 },
  controlFrom: 2,
  readout: R => String.raw`|z|=${R}\Rightarrow|1/z|=${fx(1 / R, 3)}`,
  draw: (k, v, lang) => {
    const t = tr(lang), R = k === 2 ? v : 2, z = at(VL, VLU * R, 35), w = at(VR, VRU / R, -35)
    return <>
      <defs><clipPath id="cA-inf"><rect x={14} y={14} width={222} height={252} /></clipPath></defs>
      <g clipPath="url(#cA-inf)"><path d={`M14,14 H236 V266 H14 Z ${circ(VL, VLU * R)}`} fill={C.a} fillOpacity=".14" fillRule="evenodd" /></g>
      <Axes c={VL} w={105} h={110} />
      <circle cx={VL[0]} cy={VL[1]} r={VLU} fill="none" stroke={C.ln} strokeDasharray="3 4" />
      <circle cx={VL[0]} cy={VL[1]} r={VLU * R} fill="none" stroke={C.a} strokeWidth="2.5" strokeDasharray="7 5" />
      <Arrow from={VL} to={z} color={C.a} />
      <Dot at={z} color={C.a} r={5} />
      <T x={20} y={32} anchor="start" size={14} weight={700} color={C.a}>{t('dekat ∞: |z| > R', 'near ∞: |z| > R')}</T>
      <T x={VL[0]} y={288} size={14} weight={600} color={C.a}>R = {R}</T>
      <At from={1} frame={k}>
        <Axes c={VR} w={110} h={110} />
        <circle cx={VR[0]} cy={VR[1]} r={VRU} fill="none" stroke={C.ln} strokeDasharray="3 4" />
        <circle cx={VR[0]} cy={VR[1]} r={VRU / R} fill={C.g} fillOpacity=".18" stroke={C.g} strokeWidth="2.5" strokeDasharray="7 5" />
        <Arrow from={VR} to={w} color={C.v} width={3.5} head={9} />
        <Dot at={w} color={C.v} r={5} />
        <T x={465} y={32} anchor="end" size={14} weight={700} color={C.g}>{t('dekat 0: |ζ| < 1/R', 'near 0: |ζ| < 1/R')}</T>
        <T x={VR[0] + VRU + 4} y={VR[1] + 18} anchor="end" size={12} color={C.mu}>1</T>
        <Arrow from={[200, 279]} to={[285, 279]} color={C.v} width={2.5} />
        <T x={243} y={268} size={14} weight={700} color={C.v}>ζ = 1/z</T>
        <T x={VR[0]} y={288} size={14} weight={600} color={C.g}>1/R = {fx(1 / R, 3)}</T>
      </At>
    </>
  },
}

// ================================================================ cr:0 necessary CR and sufficient CR
const QI: P = [80, 180], QO: P = [300, 190], QS = 55
const crSuff: Story = {
  title: b('CR perlu, tetapi CR di satu titik belum cukup', 'CR is necessary, but CR at one point is not enough'),
  frames: [
    f('Di dekat satu titik, fungsi yang terdiferensialkan real bekerja seperti matriks 2×2 pada dua panah kecil 1 dan i. Contoh f = x + 2iy: panah 1 tetap sepanjang 1, panah i menjadi sepanjang 2. Itu bukan perkalian kompleks, karena uₓ = 1 ≠ 2 = v_y.', 'Near one point, a real-differentiable function acts like a 2×2 matrix on two small arrows 1 and i. Example f = x + 2iy: the arrow 1 keeps length 1, the arrow i gets length 2. That is not a complex multiplication, because uₓ = 1 ≠ 2 = v_y.', String.raw`f=x+2iy:\ u_x=1\ne2=v_y`),
    f('Matriks berbentuk CR, misalnya dari f = z² di z₀ = 1 + 0,5i (uₓ = v_y = 2, vₓ = −u_y = 1), mengirim kedua panah ke 2 + i dan −1 + 2i: tetap tegak lurus, panjang sama √5. Itu perkalian dengan f′(z₀) = 2 + i.', 'A matrix of CR shape, for example from f = z² at z₀ = 1 + 0.5i (uₓ = v_y = 2, vₓ = −u_y = 1), sends the arrows to 2 + i and −1 + 2i: still perpendicular, equal length √5. That is multiplication by f′(z₀) = 2 + i.', String.raw`Df=\begin{pmatrix}2&-1\\1&2\end{pmatrix}`),
    f('CR di satu titik saja belum cukup. f = √|xy| (v = 0): di 0 semua turunan parsial bernilai 0, jadi CR berlaku. Tetapi sepanjang diagonal y = x nilainya u = |t|, sebuah pojok tanpa pendekatan linear. f′(0) tidak ada.', 'CR at one point alone is not enough. f = √|xy| (v = 0): at 0 every partial derivative is 0, so CR holds. But along the diagonal y = x its value is u = |t|, a corner with no linear approximation. f′(0) does not exist.', String.raw`f=\sqrt{|xy|}:\ u_x=u_y=v_x=v_y=0`),
    f('Syarat cukup: CR berlaku di sekitar titik dan turunan parsialnya kontinu. Untuk z², uₓ = v_y = 2x dan u_y = −vₓ = −2y kontinu di mana-mana. Di setiap titik kedua panah tetap tegak lurus dan sama panjang, dan berubah mulus: z² analitik dengan f′ = 2z.', 'Sufficient condition: CR holds around the point and the partial derivatives are continuous. For z², uₓ = v_y = 2x and u_y = −vₓ = −2y are continuous everywhere. At every point both arrows stay perpendicular with equal length and change smoothly: z² is analytic with f′ = 2z.', String.raw`u_x=v_y=2x,\ u_y=-v_x=-2y\Rightarrow f'(z)=2z`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), m = (x: number, y: number): P => [QO[0] + QS * x, QO[1] - QS * y]
    const GO: P = [40, 270], GU = 90, X = 300
    return <>
      <At until={1} frame={k}>
        <T x={QI[0]} y={60} size={14} weight={600} color={C.mu}>{t('masukan', 'input')}</T>
        <T x={QO[0] + 50} y={36} size={14} weight={600} color={C.mu}>{t('keluaran', 'output')}</T>
        <path d={pl([QI, [QI[0] + QS, QI[1]], [QI[0] + QS, QI[1] - QS], [QI[0], QI[1] - QS]], true)} fill={C.soft} stroke={C.ln} />
        <Arrow from={QI} to={[QI[0] + QS, QI[1]]} color={C.a} />
        <Arrow from={QI} to={[QI[0], QI[1] - QS]} color={C.g} />
        <T x={QI[0] + QS / 2} y={QI[1] + 22} weight={700} color={C.a}>1</T>
        <T x={QI[0] - 10} y={QI[1] - QS / 2 + 5} anchor="end" weight={700} color={C.g}>i</T>
        <Arrow from={[150, 205]} to={[220, 205]} color={C.mu} width={2} />
        <T x={185} y={194} size={14} weight={700} color={C.mu}>Df</T>
        <Dot at={QO} color={C.fg} r={4} />
      </At>
      <At until={0} frame={k}>
        <path d={pl([QO, m(1, 0), m(1, 2), m(0, 2)], true)} fill={C.r} fillOpacity=".1" stroke={C.ln} />
        <Arrow from={QO} to={m(1, 0)} color={C.a} />
        <Arrow from={QO} to={m(0, 2)} color={C.g} />
        <T x={m(.5, 0)[0]} y={QO[1] + 22} weight={700} color={C.a}>1</T>
        <T x={QO[0] - 10} y={m(0, 1)[1] + 5} anchor="end" weight={700} color={C.g}>2i</T>
        <T x={465} y={110} anchor="end" size={14} weight={600} color={C.r}>{t('panjang 1 dan 2', 'lengths 1 and 2')}</T>
        <T x={240} y={258} size={15} weight={600}>f = x + 2iy</T>
        <T x={240} y={282} size={15} weight={700} color={C.r}>u<Sb>x</Sb> = 1 ≠ 2 = v<Sb>y</Sb>  ✗</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([QO, m(2, 1), m(1, 3), m(-1, 2)], true)} fill={C.g} fillOpacity=".1" stroke={C.ln} />
        <Arrow from={QO} to={m(2, 1)} color={C.a} />
        <Arrow from={QO} to={m(-1, 2)} color={C.g} />
        <RightAngle at={QO} a={Math.atan2(1, 2)} size={12} color={C.fg} />
        <T x={m(2, 1)[0] + 8} y={m(2, 1)[1] + 5} anchor="start" weight={700} color={C.a}>2 + i</T>
        <T x={m(-1, 2)[0] - 8} y={m(-1, 2)[1] + 5} anchor="end" weight={700} color={C.g}>−1 + 2i</T>
        <T x={240} y={258} size={15} weight={600}>u<Sb>x</Sb> = v<Sb>y</Sb> = 2,  v<Sb>x</Sb> = −u<Sb>y</Sb> = 1</T>
        <T x={240} y={282} size={14} weight={600} color={C.g}>{t('= kali (2 + i): tegak lurus, sama panjang √5', '= times (2 + i): perpendicular, both √5')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d="M40,210 H292" stroke={C.ln} strokeWidth="1.4" />
        <T x={292} y={228} anchor="end" size={13} color={C.mu}>t</T>
        <path d="M50,210 H290" stroke={C.g} strokeWidth="4" />
        <path d="M50,90 L170,210 L290,90" fill="none" stroke={C.r} strokeWidth="3.5" strokeLinejoin="round" />
        <Dot at={[170, 210]} color={C.fg} r={5} />
        <T x={170} y={236} size={14} weight={600} color={C.g}>{t('sumbu x dan y: u = 0', 'x and y axes: u = 0')}</T>
        <T x={170} y={70} size={14} weight={600} color={C.r}>{t('diagonal y = x: u = |t|', 'diagonal y = x: u = |t|')}</T>
        <T x={X + 10} y={60} anchor="start" size={16} weight={700}>f = √|xy|</T>
        <T x={X + 10} y={92} anchor="start" size={13} color={C.mu}>{t('di 0:', 'at 0:')}</T>
        <T x={X + 10} y={116} anchor="start" size={15}>u<Sb>x</Sb> = u<Sb>y</Sb> = 0</T>
        <T x={X + 10} y={140} anchor="start" size={15}>v<Sb>x</Sb> = v<Sb>y</Sb> = 0</T>
        <T x={X + 10} y={170} anchor="start" size={15} weight={600} color={C.g}>{t('CR berlaku ✓', 'CR holds ✓')}</T>
        <T x={X + 10} y={208} anchor="start" size={15} color={C.r}>{t('tetapi ada pojok:', 'but a corner:')}</T>
        <T x={X + 10} y={232} anchor="start" size={15} weight={700} color={C.r}>{t('f′(0) tidak ada', 'no f′(0)')}</T>
      </At>
      <At from={3} frame={k}>
        {[.5, 1, 1.5].flatMap(x => [.5, 1, 1.5].map(y => { const c: P = [GO[0] + GU * x, GO[1] - GU * y], s = 6
          return <g key={`${x}${y}`}>
            <Arrow from={c} to={[c[0] + s * 2 * x, c[1] - s * 2 * y]} color={C.a} width={2.5} head={7} />
            <Arrow from={c} to={[c[0] - s * 2 * y, c[1] - s * 2 * x]} color={C.g} width={2.5} head={7} />
            <Dot at={c} color={C.fg} r={2.5} />
          </g> }))}
        <T x={130} y={268} size={13} color={C.mu}>{t('panah-panah untuk z² di 9 titik', 'arrows for z² at 9 points')}</T>
        <T x={X} y={60} anchor="start" size={16} weight={700}>f = z²</T>
        <T x={X} y={92} anchor="start" size={15}>u<Sb>x</Sb> = v<Sb>y</Sb> = 2x</T>
        <T x={X} y={116} anchor="start" size={15}>u<Sb>y</Sb> = −v<Sb>x</Sb> = −2y</T>
        <T x={X} y={148} anchor="start" size={15} weight={600} color={C.g}>{t('kontinu di mana-mana', 'continuous everywhere')}</T>
        <T x={X} y={186} anchor="start" size={15}>{t('CR + kontinu', 'CR + continuous')}</T>
        <T x={X} y={212} anchor="start" size={17} weight={700} color={C.g}>⇒ f′ = 2z ✓</T>
      </At>
    </>
  },
}

// ================================================================ cr:1 CR in polar coordinates
const PO: P = [40, 265], PS = 65
const crPolar: Story = {
  title: b('CR dalam koordinat kutub: langkah sudut sepanjang rΔθ', 'CR in polar coordinates: an angle step has length rΔθ'),
  frames: [
    f('Di z = re^(iθ) dengan θ = 30° ada dua langkah kecil. Langkah radial Δr = 0,4 (hijau) panjangnya 0,4. Langkah sudut Δθ = 15° (kuning) adalah busur sepanjang kira-kira rΔθ. Geser r: busur ikut memanjang walaupun Δθ tetap.', 'At z = re^(iθ) with θ = 30° there are two small steps. The radial step Δr = 0.4 (green) has length 0.4. The angle step Δθ = 15° (amber) is an arc of length about rΔθ. Move r: the arc grows although Δθ stays fixed.', String.raw`\text{|arc|}\approx r\,\Delta\theta`),
    f('Arah radial dan arah sudut saling tegak lurus, seperti sumbu x dan y yang diputar. Per satuan panjang, turunan ke arah sudut adalah (1/r)∂/∂θ. Masukkan ke CR uₓ = v_y, u_y = −vₓ lalu kalikan dengan r: r u_r = v_θ dan u_θ = −r v_r.', 'The radial and angular directions are perpendicular, like rotated x and y axes. Per unit length, the derivative in the angular direction is (1/r)∂/∂θ. Put that into CR uₓ = v_y, u_y = −vₓ and multiply by r: r u_r = v_θ and u_θ = −r v_r.', String.raw`u_r=\tfrac1r v_\theta,\ \tfrac1r u_\theta=-v_r\iff ru_r=v_\theta,\ u_\theta=-rv_r`),
    f('Cek dengan f = z² = r²e^(2iθ): u = r² cos 2θ, v = r² sin 2θ. Di θ = 30°, r u_r = v_θ = r² dan u_θ = −r v_r = −√3 r², berapa pun r > 0. Di r = 0 sudut tidak terdefinisi, jadi bentuk kutub butuh r > 0.', 'Check with f = z² = r²e^(2iθ): u = r² cos 2θ, v = r² sin 2θ. At θ = 30°, r u_r = v_θ = r² and u_θ = −r v_r = −√3 r², for any r > 0. At r = 0 the angle is undefined, so the polar form needs r > 0.', String.raw`ru_r=2r^2\cos2\theta=v_\theta,\quad u_\theta=-2r^2\sin2\theta=-rv_r`),
  ],
  control: { label: b('Radius r', 'Radius r'), min: 1, max: 3, step: 0.25, initial: 2 },
  readout: r => String.raw`r=${r}:\ \Delta r=0.4,\ r\,\Delta\theta=${r}\cdot\tfrac{\pi}{12}\approx${fx(r * Math.PI / 12)}`,
  draw: (k, r, lang) => {
    const t = tr(lang), R = PS * r, Z = at(PO, R, 30), Zr = at(PO, R + PS * .4, 30), X = 300, s3 = Math.sqrt(3) * r * r, rl = at(PO, R + 18, 37.5)
    return <>
      <path d={`M${PO[0] - 10},${PO[1]} H280 M${PO[0]},${PO[1] + 10} V22`} stroke={C.ln} strokeWidth="1.3" />
      <Ang c={PO} r={R} a0={0} a1={90} color={C.faint} w={1.5} />
      <path d={pl([PO, at(PO, R + 50, 30)])} stroke={C.ln} strokeDasharray="4 4" />
      <path d={pl([PO, at(PO, R + 50, 45)])} stroke={C.ln} strokeDasharray="4 4" />
      <Ang c={PO} r={34} a0={30} a1={45} color={C.y} w={2.5} />
      <T x={at(PO, 50, 70)[0]} y={at(PO, 50, 70)[1] + 5} size={13} weight={700} color={C.y}>Δθ</T>
      <Ang c={PO} r={R} a0={30} a1={45} color={C.y} w={4} />
      <Dot at={at(PO, R, 45)} color={C.y} r={4} />
      <Arrow from={Z} to={Zr} color={C.g} width={3.5} head={9} />
      <T x={(Z[0] + Zr[0]) / 2 + 8} y={(Z[1] + Zr[1]) / 2 + 18} anchor="start" size={14} weight={700} color={C.g}>Δr</T>
      <T x={rl[0]} y={rl[1] + 4} anchor="start" size={14} weight={700} color={C.y}>rΔθ</T>
      <Dot at={Z} color={C.fg} r={5} />
      <T x={Z[0] + 4} y={Z[1] + 20} anchor="start" size={14} weight={700}>z</T>
      <At from={1} until={1} frame={k}>
        <Arrow from={Z} to={at(Z, 44, 30)} color={C.g} width={2.5} head={8} />
        <Arrow from={Z} to={at(Z, 44, 120)} color={C.y} width={2.5} head={8} />
        <RightAngle at={Z} a={rad(30)} size={9} color={C.fg} />
      </At>
      <At until={0} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700}>r = {r}</T>
        <T x={X} y={92} anchor="start" size={15} weight={600} color={C.g}>Δr = 0.4</T>
        <T x={X} y={118} anchor="start" size={15} weight={600} color={C.y}>rΔθ ≈ {fx(r * Math.PI / 12)}</T>
        <T x={X} y={152} anchor="start" size={13} color={C.mu}>{t('Δθ tetap 15°,', 'Δθ stays 15°,')}</T>
        <T x={X} y={172} anchor="start" size={13} color={C.mu}>{t('busur ikut r', 'the arc grows with r')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={56} anchor="start" size={13} color={C.mu}>{t('arah lokal', 'local directions')}</T>
        <T x={X} y={82} anchor="start" size={15} color={C.g}>∂/∂x → ∂/∂r</T>
        <T x={X} y={106} anchor="start" size={15} color={C.y}>∂/∂y → (1/r) ∂/∂θ</T>
        <T x={X} y={142} anchor="start" size={13} color={C.mu}>{t('CR menjadi', 'CR becomes')}</T>
        <T x={X} y={168} anchor="start" size={17} weight={700} color={C.v}>r u<Sb>r</Sb> = v<Sb>θ</Sb></T>
        <T x={X} y={196} anchor="start" size={17} weight={700} color={C.v}>u<Sb>θ</Sb> = −r v<Sb>r</Sb></T>
      </At>
      <At from={2} frame={k}>
        <T x={X} y={52} anchor="start" size={15} weight={700}>f = z², θ = 30°</T>
        <T x={X} y={78} anchor="start" size={13} color={C.mu}>u = r² cos 2θ, v = r² sin 2θ</T>
        <T x={X} y={110} anchor="start" size={15}>r u<Sb>r</Sb> = {fx(r * r)}</T>
        <T x={X} y={134} anchor="start" size={15}>v<Sb>θ</Sb> = {fx(r * r)}  <tspan fill={C.g}>✓</tspan></T>
        <T x={X} y={168} anchor="start" size={15}>u<Sb>θ</Sb> = {fx(-s3)}</T>
        <T x={X} y={192} anchor="start" size={15}>−r v<Sb>r</Sb> = {fx(-s3)}  <tspan fill={C.g}>✓</tspan></T>
      </At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'triangle:0': mult, 'triangle:1': divide, 'triangle:2': triIneq,
  'polar:0': polarMul, 'polar:1': polarInv,
  'roots:0': rootsTarget, 'roots:1': rootSum,
  'disc:0': openClosed, 'disc:1': connected, 'disc:2': accumulation,
  'map:0': conformal, 'map:1': expLines,
  'derivative:0': directions, 'derivative:1': components, 'derivative:2': infinity,
  'cr:0': crSuff, 'cr:1': crPolar,
}
