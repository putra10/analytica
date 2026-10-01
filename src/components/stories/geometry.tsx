import type { VisualKind } from '../../content/summary-lessons'
import { At, Arrow, C, Clip, Dot, Grid, T, arc, b, f, pl, plane, tr, type P, type Story } from './kit'

/** Number for SVG labels: at most 2 decimals, real minus sign. */
const fmt = (n: number, d = 2) => String(+n.toFixed(d)).replace('-', '−')
/** Number for KaTeX. */
const tx = (n: number, d = 2) => String(+n.toFixed(d))
/** Oblique 3D view: x to the right, y receding up-right, z up. */
const ob = (o: P, s: number) => (x: number, y: number, z: number): P => [o[0] + s * (x + .55 * y), o[1] - s * (z + .35 * y)]
/** Right-angle mark at `at` between two screen directions. */
const RA = ({ at, a, c, size = 11, color = C.mu }: { at: P; a: P; c: P; size?: number; color?: string }) => {
  const n = (v: P): P => { const l = Math.hypot(v[0], v[1]); return [v[0] / l * size, v[1] / l * size] }, p = n(a), q = n(c)
  return <path d={`M${at[0] + p[0]},${at[1] + p[1]} l${q[0]},${q[1]} l${-p[0]},${-p[1]}`} fill="none" stroke={color} strokeWidth="1.5" />
}
/** "ax + by = 0" with clean signs and unit coefficients. */
const lin2 = (a: number, c: number) => {
  const term = (n: number, v: string, first: boolean) => n === 0 ? '' : `${n < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '}${Math.abs(n) === 1 ? '' : fmt(Math.abs(n))}${v}`
  return term(a, 'x', true) + term(c, 'y', a === 0) + ' = 0'
}

// ---------------------------------------------------------------- geometry: dot product as a shadow
const O2: P = [220, 230], U2 = 48, UL = 3 * Math.SQRT2
const dotProduct: Story = {
  title: b('Hasil kali titik adalah bayangan', 'The dot product is a shadow'),
  control: { label: b('Putar u: sudut θ (derajat)', 'Turn u: angle θ (degrees)'), min: 0, max: 180, step: 5, initial: 45 },
  frames: [
    f('Dua panah u dan v berangkat dari titik yang sama. θ adalah sudut di antara keduanya. Di sini v = (4, 0) dan |u| = 3√2.', 'Two arrows u and v start from the same point. θ is the angle between them. Here v = (4, 0) and |u| = 3√2.'),
    f('Sorotkan cahaya tegak lurus ke garis v. Bayangan u jatuh di atas v dan panjangnya |u| cos θ. Untuk θ = 45° bayangannya tepat 3.', 'Shine light perpendicular onto the line of v. The shadow of u falls on v with length |u| cos θ. At θ = 45° the shadow is exactly 3.', String.raw`\text{shadow}=|u|\cos\theta`),
    f('Hasil kali titik = panjang v × panjang bayangan u. Pada 45°: 4 × 3 = 12, sama dengan rumus koordinat 3·4 + 3·0.', 'Dot product = length of v × length of u’s shadow. At 45°: 4 × 3 = 12, the same as the coordinate formula 3·4 + 3·0.', String.raw`u\cdot v=|u||v|\cos\theta=u_1v_1+u_2v_2`),
    f('Geser penggeser. Di 90° bayangan hilang, jadi u·v = 0: tegak lurus artinya hasil kali titik nol. Lewat 90° bayangan menunjuk ke belakang (merah), jadi u·v negatif.', 'Move the slider. At 90° the shadow vanishes, so u·v = 0: perpendicular means a zero dot product. Past 90° the shadow points backwards (red), so u·v is negative.', String.raw`u\perp v\iff u\cdot v=0`),
  ],
  readout: (deg) => { const c = Math.cos(deg * Math.PI / 180); return String.raw`\theta=${deg}^\circ:\quad u\cdot v=4\times${(UL * c).toFixed(2)}=${(4 * UL * c).toFixed(2)}` },
  draw: (k, deg, lang) => {
    const t = (id: string, en: string) => lang === 'id' ? id : en
    const th = deg * Math.PI / 180, c = Math.cos(th), L = UL * U2
    const tip: P = [O2[0] + L * c, O2[1] - L * Math.sin(th)], foot: P = [tip[0], O2[1]], vTip: P = [O2[0] + 4 * U2, O2[1]]
    const shadowColor = Math.abs(c) < .02 ? C.mu : c > 0 ? C.g : C.r
    const arcEnd: P = [O2[0] + 40 * c, O2[1] - 40 * Math.sin(th)]
    return <>
      <path d={`M10,${O2[1]} H470`} stroke={C.ln} strokeDasharray="2 6" />
      <At from={1} frame={k}>
        {[-1, 1].map(i => <Arrow key={i} from={[tip[0] + i * 38, 12]} to={[tip[0] + i * 38, 40]} color={C.y} width={1.5} />)}
        <T x={tip[0] + (tip[0] > 380 ? -58 : 58)} y={34} color={C.y} size={12} anchor={tip[0] > 380 ? 'end' : 'start'}>{t('cahaya', 'light')}</T>
        <path d={`M${tip[0]},${tip[1]} V${O2[1]}`} stroke={C.y} strokeWidth="1.5" strokeDasharray="5 5" />
        <path d={`M${O2[0]},${O2[1] + 1} H${foot[0]}`} stroke={shadowColor} strokeWidth="9" strokeLinecap="round" opacity=".55" />
        <T x={(O2[0] + foot[0]) / 2} y={O2[1] + 28} color={shadowColor} size={14} weight={600}>{t('bayangan', 'shadow')} = {(UL * c).toFixed(2)}</T>
        {Math.abs(c) < .02 && <path d={`M${O2[0] + 12},${O2[1]} V${O2[1] - 12} H${O2[0]}`} fill="none" stroke={C.fg} />}
      </At>
      <Arrow from={O2} to={vTip} color={C.a} width={3.5} />
      <T x={vTip[0] + 4} y={O2[1] - 10} color={C.a} weight={700} anchor="start">v</T>
      <Arrow from={O2} to={tip} color={C.fg} width={3.5} />
      {tip[0] < 40
        ? <T x={tip[0]} y={tip[1] - 14} weight={700}>u</T>
        : <T x={tip[0] + (c >= 0 ? 12 : -12)} y={tip[1] + 4} weight={700} anchor={c >= 0 ? 'start' : 'end'}>u</T>}
      <path d={`M${O2[0] + 40},${O2[1]} A40 40 0 0 0 ${arcEnd[0]},${arcEnd[1]}`} fill="none" stroke={C.fg} strokeWidth="1.5" />
      <T x={O2[0] + 58 * Math.cos(th / 2)} y={O2[1] - 58 * Math.sin(th / 2) + 5} size={14}>θ</T>
      <At from={2} frame={k}>
        <T x={240} y={284} size={16} weight={600} color={C.v}>u·v = 4 × {(UL * c).toFixed(2)} = {(4 * UL * c).toFixed(2)}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- basis: arrows, slanted grids, division point
const sq = plane([60, 262], 40)
const sk = (a: number, c: number): P => [50 + 56 * a + 28 * c, 250 - 56 * c]
const s28 = (x: number, y: number): P => [50 + 28 * x, 250 - 28 * y]
const sec = plane([50, 250], 36)
const basis: Story = {
  title: b('Basis: kisi miring untuk memberi alamat setiap titik', 'A basis: a slanted grid that gives every point an address'),
  frames: [
    f('Vektor adalah panah yang boleh digeser tanpa berubah. Untuk menjumlah, sambungkan ekor v ke ujung u: (4, 1) + (1, 3) = (5, 4). Urutan sebaliknya memberi diagonal jajar genjang yang sama.', 'A vector is an arrow you may slide around without changing it. To add, attach the tail of v to the tip of u: (4, 1) + (1, 3) = (5, 4). The other order gives the same diagonal of the parallelogram.', String.raw`\bar u+\bar v=(4,1)+(1,3)=(5,4)`),
    f('Basis = dua panah yang tidak sejajar, di sini e₁ = (2, 0) dan e₂ = (1, 2). Salinan keduanya membentuk kisi miring yang menutup seluruh bidang. Di ruang dibutuhkan tiga vektor yang tidak sebidang.', 'A basis = two arrows that are not parallel, here e₁ = (2, 0) and e₂ = (1, 2). Copies of them form a slanted grid that covers the whole plane. In space you need three vectors that are not coplanar.', String.raw`\det(e_1,e_2)=\begin{vmatrix}2&1\\0&2\end{vmatrix}=4\ne0`),
    f('P = (3, 2) terhadap basis ini artinya: 3 langkah sepanjang e₁, lalu 2 langkah sepanjang e₂. Di kisi biasa titik yang sama adalah (8, 4). Karena e₁ dan e₂ tidak sejajar, hanya ada satu cara: koordinatnya tunggal.', 'P = (3, 2) in this basis means: 3 steps along e₁, then 2 steps along e₂. In the usual grid the same point is (8, 4). Because e₁ and e₂ are not parallel there is only one way: the coordinates are unique.', String.raw`P=3e_1+2e_2=3(2,0)+2(1,2)=(8,4)`),
    f('Jika e₂ = (4, 0) sejajar e₁, jajar genjangnya gepeng: luasnya det = 0. Titik di luar garis, seperti (8, 4), tidak bisa dicapai, dan titik pada garis dicapai dengan banyak cara. Itu bukan basis.', 'If e₂ = (4, 0) is parallel to e₁, the parallelogram is flat: its area det = 0. A point off the line, such as (8, 4), cannot be reached, and a point on the line is reached in many ways. That is not a basis.', String.raw`\begin{vmatrix}2&4\\0&0\end{vmatrix}=0,\quad (8,0)=4e_1=2e_2=2e_1+e_2`),
    f('Titik pembagi: M pada AB dengan AM = k · MB. Untuk A = (0, 0), B = (6, 3) dan k = 2 diperoleh M = (4, 2), dua kali lebih jauh dari A daripada dari B. k = 1 memberi titik tengah. Geser k.', 'Division point: M on AB with AM = k · MB. For A = (0, 0), B = (6, 3) and k = 2 we get M = (4, 2), twice as far from A as from B. k = 1 gives the midpoint. Move k.', String.raw`M=\frac{A+kB}{1+k},\quad k\ne-1`),
  ],
  control: { label: b('Perbandingan k', 'Ratio k'), min: 0, max: 6, step: .5, initial: 2 },
  controlFrom: 4,
  readout: k => String.raw`M=\frac{(0,0)+${tx(k)}\,(6,3)}{1+${tx(k)}}=(${tx(6 * k / (1 + k))},\ ${tx(3 * k / (1 + k))})`,
  draw: (k, kk, lang) => {
    const t = tr(lang), M: P = [6 * kk / (1 + kk), 3 * kk / (1 + kk)], Mp = sec(M[0], M[1])
    return <>
      <At until={0} frame={k}>
        <Grid map={sq} x={[0, 6]} y={[0, 5]} />
        <path d={pl([sq(0, 0), sq(4, 1), sq(5, 4), sq(1, 3)], true)} fill={C.soft} fillOpacity=".35" stroke="none" />
        <Arrow from={sq(4, 1)} to={sq(5, 4)} color={C.g} width={2} dash="6 5" />
        <Arrow from={sq(1, 3)} to={sq(5, 4)} color={C.a} width={2} dash="6 5" />
        <Arrow from={sq(0, 0)} to={sq(4, 1)} color={C.a} width={3.5} />
        <Arrow from={sq(0, 0)} to={sq(1, 3)} color={C.g} width={3.5} />
        <Arrow from={sq(0, 0)} to={sq(5, 4)} color={C.v} width={3.5} />
        <T x={sq(2, .5)[0] + 6} y={sq(2, .5)[1] + 24} color={C.a} weight={700}>u</T>
        <T x={sq(.5, 1.5)[0] - 14} y={sq(.5, 1.5)[1]} color={C.g} weight={700} anchor="end">v</T>
        <T x={sq(5, 4)[0] + 10} y={sq(5, 4)[1] - 6} color={C.v} weight={700} anchor="start">u + v</T>
        <T x={318} y={150} anchor="start" color={C.a} weight={600}>u = (4, 1)</T>
        <T x={318} y={176} anchor="start" color={C.g} weight={600}>v = (1, 3)</T>
        <T x={318} y={208} anchor="start" color={C.v} weight={700}>u + v = (5, 4)</T>
      </At>
      <At from={1} until={2} frame={k}>
        {[0, 1, 2, 3, 4].map(a => <path key={`a${a}`} d={pl([sk(a, 0), sk(a, 3)])} stroke={C.ln} strokeOpacity=".7" />)}
        {[0, 1, 2, 3].map(c => <path key={`c${c}`} d={pl([sk(0, c), sk(4, c)])} stroke={C.ln} strokeOpacity=".7" />)}
        <path d={pl([sk(0, 0), sk(1, 0), sk(1, 1), sk(0, 1)], true)} fill={C.soft} fillOpacity=".6" stroke="none" />
        <Arrow from={sk(0, 0)} to={sk(1, 0)} color={C.a} width={3.5} />
        <Arrow from={sk(0, 0)} to={sk(0, 1)} color={C.g} width={3.5} />
        <T x={sk(.5, 0)[0]} y={272} color={C.a} weight={700}>e₁</T>
        <T x={sk(0, .5)[0] - 8} y={sk(0, .5)[1] + 4} color={C.g} weight={700} anchor="end">e₂</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={320} y={212} anchor="start" color={C.a} weight={600}>e₁ = (2, 0)</T>
        <T x={320} y={238} anchor="start" color={C.g} weight={600}>e₂ = (1, 2)</T>
        <T x={320} y={266} anchor="start" size={15}>{t('luas sel', 'cell area')} = det = 4</T>
      </At>
      <At from={2} until={2} frame={k}>
        {[0, 1, 2].map(a => <Arrow key={a} from={sk(a, 0)} to={sk(a + 1, 0)} color={C.a} width={3} head={9} />)}
        {[0, 1].map(c => <Arrow key={c} from={sk(3, c)} to={sk(3, c + 1)} color={C.g} width={3} head={9} />)}
        <T x={sk(2, 0)[0]} y={272} color={C.a} weight={700}>3e₁</T>
        <T x={sk(3, 1)[0] + 14} y={sk(3, 1)[1] + 4} color={C.g} weight={700} anchor="start">2e₂</T>
        <Dot at={sk(3, 2)} color={C.v} r={7} />
        <T x={sk(3, 2)[0] + 12} y={sk(3, 2)[1] - 12} color={C.v} weight={700} anchor="start">P = (3, 2)</T>
        <T x={320} y={212} anchor="start" size={15}>P = 3e₁ + 2e₂</T>
        <T x={320} y={238} anchor="start" size={15}>= (6, 0) + (2, 4)</T>
        <T x={320} y={266} anchor="start" size={15} weight={700} color={C.v}>= (8, 4)</T>
      </At>
      <At from={3} until={3} frame={k}>
        <path d="M14,250 H466" stroke={C.ln} strokeDasharray="4 6" />
        <Arrow from={s28(0, 0)} to={s28(4, 0)} color={C.r} width={6} />
        <Arrow from={s28(0, 0)} to={s28(2, 0)} color={C.a} width={3.5} />
        <T x={s28(1, 0)[0]} y={272} color={C.a} weight={700}>e₁</T>
        <T x={s28(3.4, 0)[0]} y={236} color={C.r} weight={700}>e₂</T>
        <Dot at={s28(8, 4)} color={C.r} r={8} hollow />
        <T x={s28(8, 4)[0]} y={s28(8, 4)[1] + 5} color={C.r} size={13} weight={700} halo={false}>?</T>
        <T x={s28(8, 4)[0] + 16} y={s28(8, 4)[1] + 5} color={C.r} anchor="start" size={15}>(8, 4): {t('tak tercapai', 'unreachable')}</T>
        <Dot at={s28(8, 0)} color={C.y} r={6} />
        <T x={s28(8, 0)[0]} y={272} color={C.y} size={15} weight={600}>(8, 0)</T>
        <T x={20} y={40} anchor="start" size={15} color={C.r} weight={600}>e₂ = (4, 0) = 2e₁: det = 2·0 − 4·0 = 0</T>
        <T x={20} y={66} anchor="start" size={14} color={C.mu}>{t('jajar genjang gepeng, luasnya 0', 'the parallelogram is flat, area 0')}</T>
        <T x={20} y={180} anchor="start" size={14} color={C.y}>(8, 0) = 4e₁ = 2e₂ = 2e₁ + e₂</T>
        <T x={20} y={202} anchor="start" size={13} color={C.mu}>{t('banyak cara: tidak tunggal', 'many ways: not unique')}</T>
      </At>
      <At from={4} frame={k}>
        <Grid map={sec} x={[0, 6]} y={[0, 4]} />
        <path d={pl([sec(0, 0), Mp])} stroke={C.g} strokeWidth="5" strokeLinecap="round" />
        <path d={pl([Mp, sec(6, 3)])} stroke={C.v} strokeWidth="5" strokeLinecap="round" />
        <Dot at={sec(0, 0)} color={C.fg} />
        <Dot at={sec(6, 3)} color={C.fg} />
        <Dot at={Mp} color={C.a} r={7} />
        <T x={sec(0, 0)[0] + 4} y={272} anchor="start" weight={700}>A</T>
        <T x={sec(6, 3)[0] + 10} y={sec(6, 3)[1] - 8} anchor="start" weight={700}>B</T>
        <T x={Mp[0] - 12} y={Mp[1] - 14} anchor="end" weight={700} color={C.a}>M</T>
        <T x={316} y={60} anchor="start" size={15}>A = (0, 0)</T>
        <T x={316} y={86} anchor="start" size={15}>B = (6, 3)</T>
        <T x={316} y={120} anchor="start" size={15} weight={600}>k = {fmt(kk)}</T>
        <T x={316} y={154} anchor="start" size={17} weight={700} color={C.a}>M = ({fmt(M[0])}, {fmt(M[1])})</T>
        <T x={316} y={196} anchor="start" size={15}><tspan fill={C.g}>AM</tspan> : <tspan fill={C.v}>MB</tspan> = {fmt(kk)} : 1</T>
        <T x={316} y={222} anchor="start" size={13} color={C.mu}>{kk === 1 ? t('titik tengah', 'the midpoint') : kk === 0 ? t('M = A', 'M = A') : t('M membagi AB', 'M divides AB')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- lines and planes
const ln = plane([114, 240], 28)
const o2 = ob([170, 190], 44), o3 = ob([175, 165], 48)
const page = (m: (x: number, y: number, z: number) => P, u: [number, number], A = 2.1, H = 1.5) =>
  pl([m(-A * u[0], -A * u[1], -H), m(A * u[0], A * u[1], -H), m(A * u[0], A * u[1], H), m(-A * u[0], -A * u[1], H)], true)
const unit = (x: number, y: number): [number, number] => { const l = Math.hypot(x, y); return [x / l, y / l] }
const planeStory: Story = {
  title: b('Garis memakai arah, bidang memakai normal', 'A line uses a direction, a plane uses a normal'),
  frames: [
    f('Garis = satu titik p ditambah t kali arah d. Di sini p = (1, 1) dan d = (2, 1). Geser t: t > 0 maju searah d, t < 0 mundur ke belakang, dan t = 0 tepat di p.', 'A line = one point p plus t times a direction d. Here p = (1, 1) and d = (2, 1). Move t: t > 0 moves along d, t < 0 goes backwards, and t = 0 sits exactly at p.', String.raw`\bar r=\bar r_0+t\,\bar v:\quad (x,y)=(1,1)+t\,(2,1)`),
    f('Setiap koordinat memakai t yang sama: x = 1 + 2t dan y = 1 + t. Selesaikan masing-masing untuk t lalu samakan. Itulah persamaan simetrik; di ruang ditambah (z − z₀)/n.', 'Every coordinate uses the same t: x = 1 + 2t and y = 1 + t. Solve each one for t and set them equal. That is the symmetric equation; in space add (z − z₀)/n.', String.raw`\frac{x-1}{2}=\frac{y-1}{1}=t,\qquad \frac{x-x_0}{l}=\frac{y-y_0}{m}=\frac{z-z_0}{n}`),
    f('Bidang = satu titik P₀ ditambah semua arah yang tegak lurus normal N. Titik R ada di bidang tepat jika R − P₀ tegak lurus N. Dengan N = (2, 1, 2) dan P₀ = (1, 2, 0) diperoleh 2x + y + 2z − 4 = 0.', 'A plane = one point P₀ plus every direction perpendicular to a normal N. A point R lies in the plane exactly when R − P₀ is perpendicular to N. With N = (2, 1, 2) and P₀ = (1, 2, 0) we get 2x + y + 2z − 4 = 0.', String.raw`\bar N\cdot(\bar r-\bar r_0)=0\iff 2(x-1)+(y-2)+2z=0`),
    f('Dua bidang yang tidak sejajar berpotongan pada sebuah garis. Garis itu ada di kedua bidang, jadi tegak lurus N₁ dan N₂ sekaligus: arahnya N₁ × N₂. Untuk y = 0 dan y − x = 0 hasilnya (0, 0, 1), yaitu sumbu z.', 'Two non-parallel planes meet in a line. That line lies in both planes, so it is perpendicular to N₁ and N₂ at once: its direction is N₁ × N₂. For y = 0 and y − x = 0 this gives (0, 0, 1), the z-axis.', String.raw`\bar N_1\times\bar N_2=(0,1,0)\times(-1,1,0)=(0,0,1)`),
    f('Pensil bidang: π₁ + t·π₂ = 0, di sini y + t(y − x) = 0. Setiap t memberi bidang lain, tetapi semuanya memuat garis potong yang sama. Geser t: bidang berputar di sekitar sumbu z seperti halaman buku.', 'Pencil of planes: π₁ + t·π₂ = 0, here y + t(y − x) = 0. Each t gives another plane, but all of them contain the same common line. Move t: the plane turns around the z-axis like a page of a book.', String.raw`\lambda\pi_1+\mu\pi_2=0,\quad \lambda=1,\ \mu=t`),
  ],
  control: { label: b('Parameter t', 'Parameter t'), min: -2, max: 3, step: 1, initial: 2 },
  draw: (k, tt, lang) => {
    const t = tr(lang), p = ln(1, 1), r = ln(1 + 2 * tt, 1 + tt), tc = tt > 0 ? C.g : tt < 0 ? C.r : C.mu
    const corner = ln(1 + 2 * tt, 1), u = unit(1 + tt, tt)
    return <>
      <At until={1} frame={k}>
        <Grid map={ln} x={[-3, 7]} y={[-1, 4]} />
        <path d={pl([ln(-3, -1), ln(7, 4)])} stroke={C.a} strokeWidth="2" strokeOpacity=".45" />
        {[-2, -1, 0, 1, 2, 3].map(s => { const q = ln(1 + 2 * s, 1 + s); return <g key={s}><circle cx={q[0]} cy={q[1]} r={3} fill={C.mu} /><At until={0} frame={k}><T x={q[0]} y={q[1] - 12} size={12} color={C.mu}>{fmt(s)}</T></At></g> })}
        {tt !== 0 && <Arrow from={p} to={r} color={tc} width={7} />}
        <Arrow from={p} to={ln(3, 2)} color={C.a} width={3.5} />
        <Dot at={p} color={C.fg} />
        <T x={p[0] + 4} y={p[1] + 24} anchor="start" weight={700}>p</T>
        <T x={ln(2, 1.5)[0] - 6} y={ln(2, 1.5)[1] - 12} color={C.a} weight={700}>d</T>
        <Dot at={r} color={tc} r={7} />
        {tt !== 0 && <T x={r[0] + (tt > 0 ? -10 : 10)} y={r[1] + (tt > 0 ? -12 : 24)} anchor={tt > 0 ? 'end' : 'start'} color={tc} weight={700}>r(t)</T>}
      </At>
      <At until={0} frame={k}>
        <T x={24} y={104} anchor="start" size={14} color={C.mu}>{t('angka kecil = nilai t', 'small numbers = values of t')}</T>
        <T x={318} y={176} anchor="start" size={15}>t = {fmt(tt)}</T>
        <T x={318} y={202} anchor="start" size={15}>(1, 1) {tt < 0 ? '−' : '+'} {fmt(Math.abs(tt))}·(2, 1)</T>
        <T x={318} y={230} anchor="start" size={17} weight={700} color={tc}>= ({fmt(1 + 2 * tt)}, {fmt(1 + tt)})</T>
        <T x={318} y={262} anchor="start" size={13} color={C.mu}>{tt > 0 ? t('maju searah d', 'forward along d') : tt < 0 ? t('mundur: t negatif', 'backwards: t negative') : t('t = 0: tepat di p', 't = 0: exactly at p')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {tt !== 0 && <g>
          <path d={pl([p, corner, r])} fill="none" stroke={C.y} strokeWidth="2.5" strokeDasharray="6 4" />
          <T x={(p[0] + corner[0]) / 2} y={p[1] + (tt > 0 ? 22 : -10)} color={C.y} size={15} weight={700}>2t</T>
          <T x={corner[0] - 6} y={(corner[1] + r[1]) / 2 + 5} color={C.y} size={15} weight={700} anchor="end">t</T>
        </g>}
        <T x={318} y={170} anchor="start" size={15}>x = 1 + 2t = {fmt(1 + 2 * tt)}</T>
        <T x={318} y={194} anchor="start" size={15}>y = 1 + t = {fmt(1 + tt)}</T>
        <T x={318} y={226} anchor="start" size={15} color={C.y}>(x − 1)/2 = {fmt(tt)}</T>
        <T x={318} y={250} anchor="start" size={15} color={C.y}>(y − 1)/1 = {fmt(tt)}</T>
        <T x={318} y={276} anchor="start" size={13} color={C.mu}>{t('t yang sama', 'the same t')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={pl([o2(-2, -2, 0), o2(2, -2, 0), o2(2, 2, 0), o2(-2, 2, 0)], true)} fill={C.soft} fillOpacity=".55" stroke={C.a} strokeWidth="2" />
        {[0, 60, 120, 180, 240, 300].map(d => { const a = d * Math.PI / 180; return <Arrow key={d} from={o2(0, 0, 0)} to={o2(1.3 * Math.cos(a), 1.3 * Math.sin(a), 0)} color={C.mu} width={1.5} dash="4 4" head={7} /> })}
        <Arrow from={o2(0, 0, 0)} to={o2(1.6, .4, 0)} color={C.g} width={3.5} />
        <Arrow from={o2(0, 0, 0)} to={o2(0, 0, 2)} color={C.v} width={3.5} />
        <RA at={o2(0, 0, 0)} a={[0, -1]} c={[o2(1.6, .4, 0)[0] - o2(0, 0, 0)[0], o2(1.6, .4, 0)[1] - o2(0, 0, 0)[1]]} color={C.fg} />
        <Dot at={o2(0, 0, 0)} color={C.fg} />
        <Dot at={o2(1.6, .4, 0)} color={C.g} />
        <T x={o2(0, 0, 0)[0] - 12} y={o2(0, 0, 0)[1] + 22} anchor="end" weight={700}>P₀</T>
        <T x={o2(1.6, .4, 0)[0] + 10} y={o2(1.6, .4, 0)[1] + 20} anchor="start" color={C.g} weight={700}>R</T>
        <T x={o2(0, 0, 2)[0] + 12} y={o2(0, 0, 2)[1] + 6} anchor="start" color={C.v} weight={700}>N = (2, 1, 2)</T>
        <T x={o2(-2, -2, 0)[0] + 6} y={o2(-2, -2, 0)[1] + 24} anchor="start" color={C.a} weight={700}>π</T>
        <T x={318} y={128} anchor="start" size={15}>P₀ = (1, 2, 0)</T>
        <T x={318} y={154} anchor="start" size={15} color={C.g}>R = (0, 4, 0)</T>
        <T x={318} y={180} anchor="start" size={15} color={C.g}>R − P₀ = (−1, 2, 0)</T>
        <T x={318} y={212} anchor="start" size={15}>N·(R − P₀)</T>
        <T x={318} y={238} anchor="start" size={15}>= −2 + 2 + 0 = 0</T>
        <T x={318} y={272} anchor="start" size={13} color={C.mu}>{t('skema, bukan skala', 'schematic, not to scale')}</T>
      </At>
      <At from={3} frame={k}>
        <path d={pl([o3(0, 0, -2), o3(0, 0, 2.15)])} stroke={C.v} strokeWidth="2" strokeOpacity=".35" />
        <g opacity={k === 4 ? .45 : 1} style={{ transition: 'opacity .45s' }}>
          <path d={page(o3, [1, 0])} fill={C.g} fillOpacity=".14" stroke={C.g} strokeWidth="2" />
          <path d={page(o3, unit(1, 1))} fill={C.y} fillOpacity=".14" stroke={C.y} strokeWidth="2" />
          <T x={o3(2.1, 0, -1.5)[0] + 8} y={o3(2.1, 0, -1.5)[1] + 18} anchor="start" color={C.g} weight={700} size={15}>π₁: y = 0</T>
          <T x={o3(-1.5, -1.5, -1.5)[0] - 20} y={o3(-1.5, -1.5, -1.5)[1] + 22} anchor="start" color={C.y} weight={700} size={15}>π₂: y − x = 0</T>
        </g>
        <path d={pl([o3(0, 0, -1.9), o3(0, 0, 1.9)])} stroke={C.v} strokeWidth="4" />
        <Arrow from={o3(0, 0, 1.5)} to={o3(0, 0, 2.35)} color={C.v} width={4} />
      </At>
      <At from={3} until={3} frame={k}>
        <Arrow from={o3(0, 0, 0)} to={o3(0, 1.4, 0)} color={C.g} width={3} head={9} />
        <Arrow from={o3(0, 0, 0)} to={o3(-1, 1, 0)} color={C.y} width={3} head={9} />
        <T x={o3(0, 1.4, 0)[0] + 8} y={o3(0, 1.4, 0)[1] + 4} anchor="start" color={C.g} weight={700} size={15}>N₁</T>
        <T x={o3(-1, 1, 0)[0] - 8} y={o3(-1, 1, 0)[1] + 2} anchor="end" color={C.y} weight={700} size={15}>N₂</T>
        <T x={318} y={60} anchor="start" size={15} color={C.g}>N₁ = (0, 1, 0)</T>
        <T x={318} y={86} anchor="start" size={15} color={C.y}>N₂ = (−1, 1, 0)</T>
        <T x={318} y={124} anchor="start" size={15} weight={700} color={C.v}>N₁ × N₂ = (0, 0, 1)</T>
        <T x={318} y={150} anchor="start" size={13} color={C.mu}>{t('arah garis potong', 'direction of the')}</T>
        <T x={318} y={172} anchor="start" size={13} color={C.mu}>{t('= sumbu z', 'common line = z-axis')}</T>
      </At>
      <At from={4} frame={k}>
        <path d={page(o3, u)} fill={C.a} fillOpacity=".22" stroke={C.a} strokeWidth="3" style={{ transition: 'd .3s' }} />
        <T x={318} y={60} anchor="start" size={15}>t = {fmt(tt)}</T>
        <T x={318} y={86} anchor="start" size={15}>y {tt < 0 ? '−' : '+'} {fmt(Math.abs(tt))}·(y − x) = 0</T>
        <T x={318} y={118} anchor="start" size={17} weight={700} color={C.a}>{lin2(-tt, 1 + tt)}</T>
        <T x={318} y={150} anchor="start" size={13} color={C.mu}>{t('selalu memuat sumbu z', 'always holds the z-axis')}</T>
        <T x={318} y={172} anchor="start" size={13} color={C.mu}>{t('t = 0 memberi π₁', 't = 0 gives π₁')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- angles, distances, relative position
const o4 = ob([150, 200], 40), pd = plane([50, 250], 40)
const A3 = Math.atan2(3, 4)
const mini = (cx: number) => ob([cx, 196], 24)
const projection: Story = {
  title: b('Sudut dan jarak: semuanya lewat normal', 'Angles and distances: everything goes through the normal'),
  frames: [
    f('Sudut garis dengan bidang diukur terhadap bayangan garis di bidang, bukan terhadap normal. Sudut dengan normal adalah 90° − α, jadi rumusnya memakai sinus. Untuk d = (4, 0, 3) dan bidang z = 0: sin α = 3/5, α ≈ 36,9°.', 'The angle between a line and a plane is measured against the line’s shadow in the plane, not against the normal. The angle with the normal is 90° − α, so the formula uses a sine. For d = (4, 0, 3) and the plane z = 0: sin α = 3/5, α ≈ 36.9°.', String.raw`\sin\alpha=\frac{|\bar N\cdot\bar v|}{|\bar N||\bar v|}=\frac{|0\cdot4+0\cdot0+1\cdot3|}{1\cdot5}=\frac35`),
    f('Jarak titik ke bidang = panjang tegak lurus yang dijatuhkan. Potongan 2D: garis 3x + 4y − 12 = 0 dan titik M₀ = (5, 3). Kakinya H = (16/5, 3/5) dan M₀H = 3. Jalan miring mana pun lebih panjang.', 'Distance from a point to a plane = length of the dropped perpendicular. 2D cross-section: the line 3x + 4y − 12 = 0 and the point M₀ = (5, 3). The foot is H = (16/5, 3/5) and M₀H = 3. Any slanted path is longer.', String.raw`\overrightarrow{HM_0}=\left(\tfrac95,\tfrac{12}5\right)=\tfrac35(3,4),\quad |HM_0|=3`),
    f('Mengapa dibagi panjang normal? Masukkan M₀ ke ruas kiri: 3·5 + 4·3 − 12 = 15. Itu sama dengan N · M₁M₀ untuk M₁ = (4, 0) di garis, yaitu |N| kali jarak. |N| = 5, jadi jarak = 15/5 = 3. Di ruang sama saja, ditambah Cz₀ dan C².', 'Why divide by the normal’s length? Plug M₀ into the left side: 3·5 + 4·3 − 12 = 15. That equals N · M₁M₀ for M₁ = (4, 0) on the line, which is |N| times the distance. |N| = 5, so distance = 15/5 = 3. In space it is the same, plus Cz₀ and C².', String.raw`\operatorname{dist}=\frac{|3\cdot5+4\cdot3-12|}{\sqrt{3^2+4^2}}=\frac{15}{5}=3`),
    f('Dua garis di ruang punya tiga kemungkinan. Berpotongan: bertemu di satu titik. Sejajar: arahnya sama dan tidak pernah bertemu. Bersilangan: tidak sejajar dan tidak bertemu, karena berada di "lantai" dan "langit-langit" yang berbeda.', 'Two lines in space have three options. Intersecting: they meet at one point. Parallel: same direction, never meet. Skew: not parallel and never meet, because they live on a different "floor" and "ceiling".'),
    f('Hasil kali campuran memutuskan. Jika v₁ × v₂ = 0, garisnya sejajar. Jika tidak, (M₁M₂, v₁, v₂) = 0 berarti sebidang, jadi berpotongan; bukan 0 berarti bersilangan. Contoh kanan memberi 2, dan jaraknya 2/|v₁ × v₂| = 2.', 'The mixed product decides. If v₁ × v₂ = 0, the lines are parallel. Otherwise (M₁M₂, v₁, v₂) = 0 means coplanar, so intersecting; nonzero means skew. The right example gives 2, and the distance is 2/|v₁ × v₂| = 2.', String.raw`M_1=(0,0,0),\ M_2=(0,0,2):\ \begin{vmatrix}0&0&2\\1&0&0\\0&1&0\end{vmatrix}=2\ne0,\quad \operatorname{dist}=\frac{2}{|v_1\times v_2|}=2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), O = o4(0, 0, 0), M0 = pd(5, 3), H = pd(3.2, .6), M1 = pd(4, 0)
    const floor = (m: (x: number, y: number, z: number) => P, z: number) => pl([m(-2, -2, z), m(2, -2, z), m(2, 2, z), m(-2, 2, z)], true)
    const tests: [string, string, string][] = [
      [t('berpotongan', 'intersecting'), 'v₁ × v₂ ≠ 0', '(M₁M₂, v₁, v₂) = 0'],
      [t('sejajar', 'parallel'), 'v₁ × v₂ = 0', ''],
      [t('bersilangan', 'skew'), 'v₁ × v₂ ≠ 0', '(M₁M₂, v₁, v₂) ≠ 0'],
    ]
    const cx = [87, 240, 393]
    return <>
      <At until={0} frame={k}>
        <path d={pl([o4(-1.5, -1.5, 0), o4(4.6, -1.5, 0), o4(4.6, 1.5, 0), o4(-1.5, 1.5, 0)], true)} fill={C.soft} fillOpacity=".5" stroke={C.a} strokeWidth="2" />
        <path d={pl([o4(4, 0, 3), o4(4, 0, 0)])} stroke={C.y} strokeWidth="1.5" strokeDasharray="5 5" />
        <RA at={o4(4, 0, 0)} a={[-1, 0]} c={[0, -1]} />
        <Arrow from={O} to={o4(4, 0, 0)} color={C.mu} width={3} dash="7 5" />
        <Arrow from={O} to={o4(0, 0, 2.5)} color={C.v} width={3.5} />
        <Arrow from={O} to={o4(4, 0, 3)} color={C.fg} width={3.5} />
        <path d={arc(O, 54, 0, A3)} fill="none" stroke={C.g} strokeWidth="2.5" />
        <path d={arc(O, 36, A3, Math.PI / 2)} fill="none" stroke={C.y} strokeWidth="2.5" />
        <T x={O[0] + 72 * Math.cos(A3 / 2)} y={O[1] - 72 * Math.sin(A3 / 2) + 5} color={C.g} weight={700}>α</T>
        <T x={O[0] + 54 * Math.cos(1.11)} y={O[1] - 54 * Math.sin(1.11) + 5} color={C.y} weight={700}>β</T>
        <T x={o4(0, 0, 2.5)[0] + 12} y={o4(0, 0, 2.5)[1] + 4} anchor="start" color={C.v} weight={700} size={15}>N = (0, 0, 1)</T>
        <T x={o4(4, 0, 3)[0] + 10} y={o4(4, 0, 3)[1]} anchor="start" weight={700} size={15}>d = (4, 0, 3)</T>
        <T x={o4(2.6, 0, 0)[0]} y={o4(0, 0, 0)[1] + 16} size={13} color={C.mu}>{t('bayangan d', 'shadow of d')}</T>
        <T x={o4(-1.5, -1.5, 0)[0]} y={o4(-1.5, -1.5, 0)[1] + 24} anchor="start" color={C.a} weight={700} size={15}>π: z = 0</T>
        <T x={380} y={112} anchor="start" size={15} color={C.g} weight={600}>sin α = 3/5</T>
        <T x={380} y={136} anchor="start" size={15} color={C.g}>α ≈ 36.9°</T>
        <T x={380} y={160} anchor="start" size={15} color={C.y}>β = 90° − α</T>
        <T x={380} y={184} anchor="start" size={15} color={C.y}>≈ 53.1°</T>
      </At>
      <At from={1} until={2} frame={k}>
        <Grid map={pd} x={[0, 6]} y={[0, 5]} />
        <Clip id="proj-line" x={12} y={14} w={290} h={274}>
          <path d={pl([pd(-.8, 3.6), pd(4.6667, -.5)])} stroke={C.a} strokeWidth="3.5" />
        </Clip>
        <T x={24} y={92} anchor="start" size={15} color={C.a} weight={600}>3x + 4y − 12 = 0</T>
        <path d={pl([M0, H])} stroke={C.g} strokeWidth="4" />
        <RA at={H} a={[4, 3]} c={[M0[0] - H[0], M0[1] - H[1]]} color={C.g} />
        <Dot at={M0} color={C.fg} r={7} />
        <Dot at={H} color={C.g} />
        <T x={M0[0] + 10} y={M0[1] - 10} anchor="start" weight={700}>M₀</T>
        <T x={H[0] - 12} y={H[1] + 4} anchor="end" weight={700} color={C.g}>H</T>
        <T x={(M0[0] + H[0]) / 2 - 12} y={(M0[1] + H[1]) / 2 - 4} anchor="end" weight={700} color={C.g}>3</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([M0, pd(0, 3)])} stroke={C.r} strokeWidth="2.5" strokeDasharray="7 5" />
        <Dot at={pd(0, 3)} color={C.r} r={5} />
        <T x={pd(2.5, 3)[0]} y={pd(2.5, 3)[1] - 10} color={C.r} weight={700}>5</T>
        <T x={316} y={120} anchor="start" size={15}>M₀ = (5, 3)</T>
        <T x={316} y={146} anchor="start" size={15} color={C.g}>H = (16/5, 3/5)</T>
        <T x={316} y={180} anchor="start" size={17} weight={700} color={C.g}>M₀H = 3</T>
        <T x={316} y={206} anchor="start" size={15} color={C.r}>{t('miring', 'slanted')}: 5 &gt; 3</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Arrow from={M1} to={M0} color={C.y} width={3} dash="7 5" />
        <Arrow from={M1} to={pd(5.8, 2.4)} color={C.g} width={2.5} dash="4 4" />
        <path d={pl([pd(5.8, 2.4), M0])} stroke={C.mu} strokeDasharray="2 4" />
        <Dot at={M1} color={C.y} />
        <T x={M1[0] - 6} y={M1[1] + 22} anchor="end" weight={700} color={C.y}>M₁</T>
        <T x={316} y={84} anchor="start" size={15}>3·5 + 4·3 − 12</T>
        <T x={316} y={110} anchor="start" size={15}>= <tspan fill={C.y}>N·M₁M₀</tspan> = 15</T>
        <T x={316} y={144} anchor="start" size={15}>|N| = √(9 + 16) = 5</T>
        <T x={316} y={180} anchor="start" size={17} weight={700} color={C.g}>{t('jarak', 'dist')} = 15/5 = 3</T>
        <T x={316} y={214} anchor="start" size={13} color={C.mu}>{t('bayangan M₁M₀ pada N', 'shadow of M₁M₀ on N')}</T>
      </At>
      <At from={3} frame={k}>
        {cx.map((c, i) => <T key={i} x={c} y={92} size={15} weight={700} color={[C.a, C.g, C.r][i]}>{tests[i][0]}</T>)}
        <path d={floor(mini(cx[0]), 0)} fill={C.soft} fillOpacity=".5" stroke={C.ln} />
        <path d={pl([mini(cx[0])(-2, 0, 0), mini(cx[0])(2, 0, 0)])} stroke={C.a} strokeWidth="3.5" />
        <path d={pl([mini(cx[0])(-1, -2, 0), mini(cx[0])(1, 2, 0)])} stroke={C.g} strokeWidth="3.5" />
        <Dot at={mini(cx[0])(0, 0, 0)} color={C.fg} r={5} />
        <path d={floor(mini(cx[1]), 0)} fill={C.soft} fillOpacity=".5" stroke={C.ln} />
        <path d={pl([mini(cx[1])(-2, -1, 0), mini(cx[1])(2, -1, 0)])} stroke={C.a} strokeWidth="3.5" />
        <path d={pl([mini(cx[1])(-2, 1, 0), mini(cx[1])(2, 1, 0)])} stroke={C.g} strokeWidth="3.5" />
        <path d={floor(mini(cx[2]), 0)} fill={C.soft} fillOpacity=".5" stroke={C.ln} />
        {[[-2, -2], [2, -2], [2, 2], [-2, 2]].map(([x, y]) => <path key={`${x}${y}`} d={pl([mini(cx[2])(x, y, 0), mini(cx[2])(x, y, 2.6)])} stroke={C.ln} strokeDasharray="3 4" />)}
        <path d={floor(mini(cx[2]), 2.6)} fill={C.soft} fillOpacity=".25" stroke={C.ln} strokeDasharray="4 4" />
        <path d={pl([mini(cx[2])(-2, 0, 0), mini(cx[2])(2, 0, 0)])} stroke={C.a} strokeWidth="3.5" />
        <path d={pl([mini(cx[2])(0, -2, 2.6), mini(cx[2])(0, 2, 2.6)])} stroke={C.g} strokeWidth="3.5" />
      </At>
      <At from={4} frame={k}>
        <path d={pl([mini(cx[2])(0, 0, 0), mini(cx[2])(0, 0, 2.6)])} stroke={C.r} strokeWidth="2.5" strokeDasharray="5 4" />
        <T x={mini(cx[2])(0, 0, 1.3)[0] + 8} y={mini(cx[2])(0, 0, 1.3)[1] + 5} anchor="start" size={14} weight={700} color={C.r}>2</T>
        {cx.map((c, i) => <g key={i}>
          <T x={c} y={246} size={13} color={i === 1 ? C.g : C.fg}>{tests[i][1]}</T>
          {tests[i][2] && <T x={c} y={268} size={13} color={i === 2 ? C.r : C.a}>{tests[i][2]}</T>}
        </g>)}
      </At>
    </>
  },
}

// ---------------------------------------------------------------- circle: power of a point and the polar
const pw = plane([54, 178], 28), O5 = pw(2, 1), TH = 20 * Math.PI / 180
const power: Story = {
  title: b('Kuasa titik: satu angka untuk singgung dan tali busur', 'Power of a point: one number for tangents and chords'),
  frames: [
    f('Lingkaran berpusat O = (2, 1) dengan jari-jari 3: (x − 2)² + (y − 1)² = 9. Uraikan kuadratnya: x² + y² − 4x − 2y − 4 = 0. Dari bentuk umum terbaca pusat (α, β) = (2, 1) dan ρ² = α² + β² − σ = 4 + 1 + 4 = 9.', 'Circle with centre O = (2, 1) and radius 3: (x − 2)² + (y − 1)² = 9. Expand the squares: x² + y² − 4x − 2y − 4 = 0. From the general form we read the centre (α, β) = (2, 1) and ρ² = α² + β² − σ = 4 + 1 + 4 = 9.', String.raw`x^2+y^2-2\alpha x-2\beta y+\sigma=0,\quad \alpha=2,\ \beta=1,\ \sigma=-4`),
    f('Kuasa titik P: masukkan P ke ruas kiri. Untuk P = (7, 1): 49 + 1 − 28 − 2 − 4 = 16. Garis singgung PT tegak lurus jari-jari OT, jadi menurut Pythagoras PT² = OP² − 3² = 25 − 9 = 16. Kuasa = kuadrat panjang singgung.', 'Power of a point P: plug P into the left side. For P = (7, 1): 49 + 1 − 28 − 2 − 4 = 16. The tangent PT is perpendicular to the radius OT, so by Pythagoras PT² = OP² − 3² = 25 − 9 = 16. Power = squared tangent length.', String.raw`p(P)=|OP|^2-\rho^2=PT^2`),
    f('Tarik garis potong mana pun melalui P. Hasil kali kedua jaraknya selalu sama dengan kuasa: PA · PB = 2 · 8 = 16, dan garis miring juga memberi PC · PD = 16. Geser P: kedua hasil kali tetap sama.', 'Draw any secant through P. The product of its two distances always equals the power: PA · PB = 2 · 8 = 16, and the slanted line also gives PC · PD = 16. Move P: the two products stay equal.', String.raw`\overline{PA}\cdot\overline{PB}=\overline{PC}\cdot\overline{PD}=p(P)`),
    f('Tanda kuasa memberi tahu letak P. Positif: di luar. Nol: tepat pada lingkaran. Negatif: di dalam, karena P berada di antara A dan B sehingga satu jarak berarahnya negatif. Geser P melewati lingkaran.', 'The sign of the power tells where P is. Positive: outside. Zero: exactly on the circle. Negative: inside, because P lies between A and B, so one directed distance is negative. Slide P across the circle.', String.raw`p(P)>0\iff|OP|>\rho,\qquad p(P)<0\iff|OP|<\rho`),
    f('Dari P di luar ada dua garis singgung, menyentuh di T₁ dan T₂. Garis melalui T₁ dan T₂ adalah garis kutub P. Persamaannya dari polarisasi: x² menjadi x·x₀, x menjadi (x + x₀)/2. Untuk P = (7, 1): 5x − 19 = 0, jadi x = 19/5.', 'From an outside P there are two tangents, touching at T₁ and T₂. The line through T₁ and T₂ is the polar of P. Its equation comes from polarising: x² becomes x·x₀, x becomes (x + x₀)/2. For P = (7, 1): 5x − 19 = 0, so x = 19/5.', String.raw`xx_0+yy_0-\alpha(x+x_0)-\beta(y+y_0)+\sigma=0`),
  ],
  control: { label: b('Posisi P = (x₀, 1): x₀', 'Position P = (x₀, 1): x₀'), min: 3, max: 8, step: .5, initial: 7 },
  controlFrom: 1,
  readout: x0 => String.raw`P=(${tx(x0)},1):\ p(P)=${tx(x0)}^2+1^2-4\cdot${tx(x0)}-2\cdot1-4=${tx(x0 * x0 - 4 * x0 - 5)}`,
  draw: (k, x0, lang) => {
    const t = tr(lang), dx = x0 - 2, pow = dx * dx - 9, P = pw(x0, 1)
    const out = pow > 1e-9, on = Math.abs(pow) < 1e-9
    const sign = out ? C.g : on ? C.y : C.r
    const cphi = Math.min(1, 3 / dx), sphi = Math.sqrt(1 - cphi * cphi)
    const T1 = pw(2 + 3 * cphi, 1 + 3 * sphi), T2 = pw(2 + 3 * cphi, 1 - 3 * sphi)
    const disc = Math.sqrt(9 - dx * dx * Math.sin(TH) ** 2), s1 = dx * Math.cos(TH) - disc, s2 = dx * Math.cos(TH) + disc
    const along = (s: number) => pw(x0 - s * Math.cos(TH), 1 + s * Math.sin(TH))
    const Cp = along(s1), Dp = along(s2), polX = 2 + 9 / dx, polP = pw(polX, 0)[0]
    const par = (n: number) => n < 0 ? `(${fmt(n)})` : fmt(n)
    return <>
      <At from={3} until={3} frame={k}>
        <circle cx={O5[0]} cy={O5[1]} r={84} fill={C.r} fillOpacity=".1" />
        <T x={O5[0]} y={O5[1] + 52} size={16} weight={700} color={C.r}>p &lt; 0</T>
        <T x={O5[0]} y={52} size={16} weight={700} color={C.y}>p = 0 {t('pada lingkaran', 'on the circle')}</T>
        <T x={250} y={80} size={16} weight={700} color={C.g}>p &gt; 0</T>
      </At>
      <circle cx={O5[0]} cy={O5[1]} r={84} fill="none" stroke={C.a} strokeWidth="3" />
      <Dot at={O5} color={C.a} r={5} />
      <T x={O5[0] - 8} y={O5[1] + 22} anchor="end" color={C.a} weight={700}>O</T>
      <T x={240} y={284} size={15} weight={600}>x² + y² − 4x − 2y − 4 = 0</T>
      <At until={0} frame={k}>
        <path d={pl([O5, pw(2 + 3 * Math.SQRT1_2, 1 - 3 * Math.SQRT1_2)])} stroke={C.fg} strokeWidth="2" />
        <T x={pw(3.06, -.06)[0] - 10} y={pw(3.06, -.06)[1] + 18} weight={700} size={15}>3</T>
        <T x={300} y={70} anchor="start" size={15}>(x − 2)² + (y − 1)² = 9</T>
        <T x={300} y={110} anchor="start" size={15} color={C.a}>α = 2, β = 1</T>
        <T x={300} y={136} anchor="start" size={15} color={C.a}>σ = −4</T>
        <T x={300} y={170} anchor="start" size={15}>ρ² = 4 + 1 + 4 = 9</T>
        <T x={300} y={196} anchor="start" size={15}>ρ = 3</T>
      </At>
      <At from={1} until={1} frame={k}>
        {dx >= 3 && <g>
          <path d={pl([O5, P])} stroke={C.mu} strokeWidth="1.5" strokeDasharray="5 5" />
          <path d={pl([O5, T1])} stroke={C.fg} strokeWidth="2" />
          <path d={pl([P, T1])} stroke={C.v} strokeWidth="3.5" />
          {!on && <RA at={T1} a={[O5[0] - T1[0], O5[1] - T1[1]]} c={[P[0] - T1[0], P[1] - T1[1]]} />}
          <Dot at={T1} color={C.v} r={5} />
          <T x={T1[0]} y={T1[1] - 12} color={C.v} weight={700}>T</T>
          <T x={(O5[0] + T1[0]) / 2 - 10} y={(O5[1] + T1[1]) / 2} anchor="end" weight={700} size={15}>3</T>
        </g>}
        <T x={300} y={60} anchor="start" size={15}>P = ({fmt(x0)}, 1)</T>
        <T x={300} y={88} anchor="start" size={17} weight={700} color={sign}>p(P) = {fmt(pow)}</T>
        <T x={300} y={116} anchor="start" size={15}>OP² − ρ² = {fmt(dx * dx)} − 9</T>
        {dx >= 3
          ? <T x={300} y={150} anchor="start" size={15} color={C.v} weight={600}>PT = √{fmt(pow)} = {fmt(Math.sqrt(pow))}</T>
          : <><T x={300} y={150} anchor="start" size={15} color={C.r}>{t('P di dalam:', 'P is inside:')}</T><T x={300} y={174} anchor="start" size={15} color={C.r}>{t('tanpa singgung', 'no tangent')}</T></>}
      </At>
      <At from={2} until={2} frame={k}>
        <path d={pl([pw(-1.6, 1), pw(Math.max(x0, 5) + .5, 1)])} stroke={C.y} strokeWidth="2.5" />
        <path d={pl([along(Math.min(s1, 0) - .5), along(s2 + .6)])} stroke={C.g} strokeWidth="2.5" />
        {[[pw(5, 1), 'A', 0], [pw(-1, 1), 'B', 0], [Cp, 'C', 1], [Dp, 'D', 1]].map(([q, name, i]) => <g key={name as string}>
          <Dot at={q as P} color={i ? C.g : C.y} r={5} />
          {!(on && (name === 'A' || name === 'C')) && <T x={(q as P)[0] + (name === 'B' ? -6 : 6)} y={(q as P)[1] + (name === 'C' && s1 < 0 ? 24 : name === 'A' && x0 <= 5 ? -10 : i ? -12 : 22)} anchor={name === 'B' ? 'end' : 'start'} color={i ? C.g : C.y} weight={700} size={15}>{name as string}</T>}
        </g>)}
        <T x={300} y={60} anchor="start" size={14} color={C.y}>PA · PB = {par(x0 - 5)} · {fmt(x0 + 1)}</T>
        <T x={300} y={84} anchor="start" size={15} weight={700} color={C.y}>= {fmt(pow)}</T>
        <T x={300} y={120} anchor="start" size={14} color={C.g}>PC · PD = {par(s1)} · {fmt(s2)}</T>
        <T x={300} y={144} anchor="start" size={15} weight={700} color={C.g}>= {fmt(s1 * s2)}</T>
        <T x={300} y={176} anchor="start" size={13} color={C.mu}>{t('sama dengan p(P)', 'equal to p(P)')} = {fmt(pow)}</T>
      </At>
      <At from={3} until={3} frame={k}>
        <T x={300} y={110} anchor="start" size={22} weight={700} color={sign}>p(P) = {fmt(pow)}</T>
        <T x={300} y={140} anchor="start" size={15} color={sign}>{out ? t('P di luar', 'P is outside') : on ? t('P pada lingkaran', 'P is on the circle') : t('P di dalam', 'P is inside')}</T>
        <T x={300} y={166} anchor="start" size={13} color={C.mu}>|OP| = {fmt(dx)}, ρ = 3</T>
      </At>
      <At from={4} frame={k}>
        {out && <g>
          <path d={pl([P, T1])} stroke={C.fg} strokeWidth="2" />
          <path d={pl([P, T2])} stroke={C.fg} strokeWidth="2" />
          <Dot at={T1} color={C.v} r={5} /><Dot at={T2} color={C.v} r={5} />
          <T x={T1[0] + 8} y={T1[1] - 10} anchor="start" color={C.v} weight={700} size={15}>T₁</T>
          <T x={T2[0] + 8} y={T2[1] + 22} anchor="start" color={C.v} weight={700} size={15}>T₂</T>
        </g>}
        {polP <= 292
          ? <path d={`M${polP},16 V260`} stroke={C.v} strokeWidth="3.5" />
          : <T x={292} y={40} anchor="end" size={13} color={C.v}>{t('kutub di x = ', 'polar at x = ')}{fmt(polX)} →</T>}
        <T x={300} y={60} anchor="start" size={15}>P = ({fmt(x0)}, 1)</T>
        <T x={300} y={88} anchor="start" size={15} color={C.v}>{t('kutub', 'polar')}: {dx === 1 ? '' : fmt(dx)}x − {fmt(2 * x0 + 5)} = 0</T>
        <T x={300} y={116} anchor="start" size={17} weight={700} color={C.v}>x = {fmt(polX)}</T>
        <T x={300} y={146} anchor="start" size={13} color={C.mu}>{out ? t('melalui T₁ dan T₂', 'through T₁ and T₂') : on ? t('= garis singgung di P', '= the tangent at P') : t('P di dalam: kutub di luar', 'P inside: polar outside')}</T>
      </At>
      <At from={1} frame={k}>
        <Dot at={P} color={k === 3 ? sign : C.fg} r={7} />
        <T x={P[0] + (on ? -10 : 2)} y={P[1] + 26} anchor={on ? 'end' : 'middle'} weight={700} color={k === 3 ? sign : C.fg}>P</T>
      </At>
    </>
  },
}

export const GEOMETRY_STORIES: Partial<Record<VisualKind, Story>> = { products: dotProduct, basis, plane: planeStory, projection, power }
