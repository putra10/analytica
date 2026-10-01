import type { VisualKind } from '../../content/summary-lessons'
import { At, Arrow, C, Clip, Dot, Grid, RightAngle, T, arc, b, f, fn, pl, plane, tr, type P, type Story } from './kit'

const rad = (d: number) => d * Math.PI / 180
/** Fixed decimals with a real minus sign and never "−0.00". */
const nf = (v: number, d = 2) => { const s = v.toFixed(d); return (Number(s) === 0 ? (0).toFixed(d) : s).replace('-', '−') }
/** Short number for TeX readouts: 1.5, -2, 0. */
const tx = (v: number, d = 2) => String(Number(v.toFixed(d)))
const dist = (p: P, q: P) => Math.hypot(p[0] - q[0], p[1] - q[1])
/** A matrix drawn as text with square brackets; (x, y) = left edge and first baseline. */
const Mat = ({ x, y, rows, col = 28, size = 14, color = C.fg }: { x: number; y: number; rows: string[][]; col?: number; size?: number; color?: string }) => {
  const gap = size * 1.4, top = y - size * .95, bot = y + (rows.length - 1) * gap + size * .4, w = rows[0].length * col + 8
  return <g>
    <path d={`M${x + 5},${top} h-5 V${bot} h5 M${x + w - 5},${top} h5 V${bot} h-5`} fill="none" stroke={color} strokeWidth="1.5" />
    {rows.map((r, i) => r.map((v, j) => <T key={`${i}-${j}`} x={x + 4 + col * (j + .5)} y={y + i * gap} size={size} color={color}>{v}</T>))}
  </g>
}

// ---------------------------------------------------------------- radical axis: equal power, radical centre, pencil
const RU = 23, RM = plane([150, 170], RU)
const RC: { c: P; r: number; col: string; name: string; lab: P }[] = [
  { c: [-2, 0], r: Math.sqrt(14), col: C.a, name: 'C₁', lab: [-4.9, 3.4] },
  { c: [3, 0], r: 3, col: C.g, name: 'C₂', lab: [5.4, 3] },
  { c: [-1, 4], r: 1, col: C.y, name: 'C₃', lab: [-2.6, 5.3] },
]
/** Contact point of a tangent from p to circle i; side (±1) picks one of the two. */
const touch = (p: P, i: number, side: number): P => {
  const { c, r } = RC[i], phi = Math.atan2(p[1] - c[1], p[0] - c[0]) + side * Math.acos(r / dist(p, c))
  return [c[0] + r * Math.cos(phi), c[1] + r * Math.sin(phi)]
}
const Tangent = ({ from, i, side, at = .5, off, label = true }: { from: P; i: number; side: number; at?: number; off: P; label?: boolean }) => {
  const a = RM(...from), z = RM(...touch(from, i, side))
  return <g>
    <path d={pl([a, z])} stroke={RC[i].col} strokeWidth="2.5" strokeLinecap="round" />
    <Dot at={z} color={RC[i].col} r={4} />
    {label && <T x={a[0] + (z[0] - a[0]) * at + off[0]} y={a[1] + (z[1] - a[1]) * at + off[1]} size={14} weight={700} color={RC[i].col}>2</T>}
  </g>
}
const radical: Story = {
  title: b('Sumbu radikal: tempat kuasa terhadap dua lingkaran sama', 'Radical axis: where the power to two circles agrees'),
  frames: [
    f('Kuasa titik P terhadap lingkaran adalah |PA|² − ρ², yaitu kuadrat panjang garis singgungnya. Untuk P = (1, −3): terhadap C₁ kuasanya 18 − 14 = 4, terhadap C₂ juga 13 − 9 = 4. Jadi kedua garis singgung sama panjang, yaitu 2.', 'The power of P with respect to a circle is |PA|² − ρ², the square of its tangent length. For P = (1, −3): with respect to C₁ it is 18 − 14 = 4, with respect to C₂ also 13 − 9 = 4. So both tangents have the same length, 2.', String.raw`p(P,\Gamma)=|PA|^2-\rho^2=|PT|^2`),
    f('Semua titik dengan kuasa sama membentuk garis. Kurangkan kedua persamaan: x² dan y² lenyap, tersisa 10x − 10 = 0, yaitu x = 1. Sumbu radikal ini tegak lurus garis pusat dan melalui kedua titik potong (1, ±√5).', 'All points with equal power form a line. Subtract the two equations: x² and y² cancel, leaving 10x − 10 = 0, that is x = 1. This radical axis is perpendicular to the line of centres and passes through both intersection points (1, ±√5).', String.raw`C_1-C_2=10x-10=0\ \Rightarrow\ x=1`),
    f('Tambahkan lingkaran ketiga C₃ (pusat (−1, 4), ρ = 1). Tiga pasangan memberi tiga sumbu radikal, dan ketiganya bertemu di satu titik R = (1, 3): pusat radikal. Dari R ketiga garis singgung sama panjang, yaitu 2. Sumbu C₂C₃ tetap ada walaupun kedua lingkaran itu tidak berpotongan.', 'Add a third circle C₃ (centre (−1, 4), ρ = 1). Three pairs give three radical axes, and all three meet at one point R = (1, 3): the radical centre. From R all three tangents have the same length, 2. The axis of C₂ and C₃ exists even though those two circles do not meet.', String.raw`x=1,\quad x+4y=13,\quad y=x+2\ \Rightarrow\ R=(1,3)`),
    f('Pensil lingkaran: C₁ + λC₂ = 0. Geser λ: setiap anggota melewati dua titik potong yang sama dan pusatnya tetap di garis pusat, jadi semuanya berbagi sumbu radikal x = 1. Di λ = −1 suku kuadrat hilang dan anggotanya adalah garis itu sendiri.', 'A pencil of circles: C₁ + λC₂ = 0. Move λ: every member passes through the same two intersection points and its centre stays on the line of centres, so they all share the radical axis x = 1. At λ = −1 the quadratic part cancels and the member is that line itself.', String.raw`C_1+\lambda C_2=0`),
  ],
  control: { label: b('Parameter pensil λ', 'Pencil parameter λ'), min: -3, max: 5, step: .1, initial: 1 },
  controlFrom: 3,
  readout: l => { const q = 4 - 6 * l; return String.raw`\lambda=${tx(l, 1)}:\ ${tx(1 + l, 1)}(x^2+y^2)${q < 0 ? '' : '+'}${tx(q, 1)}x-10=0` },
  draw: (k, lam, lang) => {
    const t = tr(lang), P0: P = [1, -3], R: P = [1, 3], line = Math.abs(1 + lam) < 1e-6
    const al = line ? 0 : (3 * lam - 2) / (1 + lam), rho = line ? 0 : Math.sqrt(al * al + 10 / (1 + lam))
    const circ = (i: number) => { const [cx, cy] = RM(...RC[i].c); return <circle cx={cx} cy={cy} r={RC[i].r * RU} fill="none" stroke={RC[i].col} strokeWidth="3" /> }
    const x0 = 302
    return <>
      <Clip id="rad-plot" x={12} y={12} w={280} h={276}>
        <Grid map={RM} x={[-6, 6.5]} y={[-5.5, 7]} />
        <g style={{ opacity: k === 3 ? .35 : 1, transition: 'opacity .45s' }}>{circ(0)}{circ(1)}</g>
        <At from={1} frame={k}><path d={pl([RM(1, -6), RM(1, 7.5)])} stroke={C.v} strokeWidth={k === 3 && line ? 4.5 : 3} /></At>
        <At from={2} until={2} frame={k}>
          {circ(2)}
          <path d={pl([RM(-7, 5), RM(7, 1.5)])} stroke={C.v} strokeWidth="3" />
          <path d={pl([RM(-8, -6), RM(5.5, 7.5)])} stroke={C.v} strokeWidth="3" />
        </At>
        <At from={3} frame={k}>{!line && <circle cx={RM(al, 0)[0]} cy={RM(al, 0)[1]} r={rho * RU} fill={C.soft} fillOpacity=".35" stroke={C.v} strokeWidth="3.5" />}{!line && <Dot at={RM(al, 0)} color={C.v} r={4.5} />}</At>
      </Clip>
      {[0, 1].map(i => <g key={i}>
        <Dot at={RM(...RC[i].c)} color={RC[i].col} r={4} />
        <T x={RM(...RC[i].lab)[0]} y={RM(...RC[i].lab)[1]} size={16} weight={700} color={RC[i].col}>{RC[i].name}</T>
      </g>)}
      <At until={0} frame={k}>
        <Tangent from={P0} i={0} side={-1} at={.65} off={[0, 19]} />
        <Tangent from={P0} i={1} side={1} at={.7} off={[0, 19]} />
        <Dot at={RM(...P0)} color={C.fg} r={5} />
        <T x={RM(...P0)[0]} y={RM(...P0)[1] + 23} size={15} weight={700}>P</T>
        <T x={x0} y={44} anchor="start" size={15} weight={600}>P = (1, −3)</T>
        <T x={x0} y={76} anchor="start" size={13} color={C.mu}>p(P) = |PA|² − ρ²</T>
        <T x={x0} y={108} anchor="start" size={15} color={C.a} weight={600}>C₁: 18 − 14 = 4</T>
        <T x={x0} y={134} anchor="start" size={15} color={C.g} weight={600}>C₂: 13 − 9 = 4</T>
        <T x={x0} y={170} anchor="start" size={14} color={C.v} weight={600}>{t('singgung = √4 = 2', 'tangent = √4 = 2')}</T>
      </At>
      <At from={1} frame={k}>
        {[-1, 1].map(s => <Dot key={s} at={RM(1, s * Math.sqrt(5))} color={C.v} r={5} />)}
      </At>
      <At from={1} until={1} frame={k}>
        <RightAngle at={RM(1, 0)} a={0} size={11} color={C.fg} />
        <T x={RM(1, 0)[0] + 8} y={RM(1, 6)[1]} anchor="start" size={15} weight={700} color={C.v}>x = 1</T>
        <T x={x0} y={44} anchor="start" size={14} color={C.a}>C₁ = x²+y²+4x−10</T>
        <T x={x0} y={68} anchor="start" size={14} color={C.g}>C₂ = x²+y²−6x</T>
        <T x={x0} y={102} anchor="start" size={14} color={C.v} weight={600}>C₁ − C₂ = 10x − 10</T>
        <T x={x0} y={128} anchor="start" size={16} color={C.v} weight={700}>⇒ x = 1</T>
        <T x={x0} y={164} anchor="start" size={13} color={C.mu}>{t('⟂ garis pusat', '⟂ line of centres')}</T>
        <T x={x0} y={186} anchor="start" size={13} color={C.mu}>{t('lewat (1, ±√5)', 'through (1, ±√5)')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={RM(...RC[2].lab)[0]} y={RM(...RC[2].lab)[1]} size={16} weight={700} color={RC[2].col}>{RC[2].name}</T>
        <Tangent from={R} i={0} side={-1} at={.7} off={[13, 4]} />
        <Tangent from={R} i={1} side={-1} at={.75} off={[0, -9]} />
        <Tangent from={R} i={2} side={-1} at={.75} off={[0, 18]} />
        <Dot at={RM(...R)} color={C.fg} r={5.5} />
        <T x={RM(...R)[0] - 6} y={RM(...R)[1] - 16} anchor="end" size={16} weight={700}>R</T>
        <T x={x0} y={44} anchor="start" size={13} color={C.y} weight={600}>C₃ = x²+y²+2x−8y+16</T>
        <T x={x0} y={76} anchor="start" size={13}>C₁−C₂: x = 1</T>
        <T x={x0} y={98} anchor="start" size={13}>C₁−C₃: x + 4y = 13</T>
        <T x={x0} y={120} anchor="start" size={13}>C₂−C₃: y = x + 2</T>
        <T x={x0} y={156} anchor="start" size={16} color={C.v} weight={700}>R = (1, 3)</T>
        <T x={x0} y={182} anchor="start" size={13} color={C.mu}>{t('3 singgung, semua 2', '3 tangents, all 2')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={x0} y={44} anchor="start" size={15} color={C.v} weight={600}>C₁ + λC₂ = 0</T>
        <T x={x0} y={76} anchor="start" size={15} weight={600}>λ = {nf(lam, 1)}</T>
        {line
          ? <T x={x0} y={104} anchor="start" size={14} color={C.v} weight={600}>{t('garis x = 1', 'the line x = 1')}</T>
          : <><T x={x0} y={104} anchor="start" size={14}>{t('pusat', 'centre')} ({nf(al)}, 0)</T><T x={x0} y={130} anchor="start" size={14}>ρ = {nf(rho)}</T></>}
        <T x={x0} y={166} anchor="start" size={13} color={C.mu}>{t('semua lewat', 'all pass through')}</T>
        <T x={x0} y={188} anchor="start" size={13} color={C.mu}>(1, ±√5)</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- conics: focal distances and eccentricity
const CU = 24, CM = plane([160, 150], CU), EM = plane([190, 150], 36)
/** Focus at the origin, directrix x = −2: |PF| = e·|PD| in polar form. */
const pol = (e: number, th: number): P => { const r = 2 * e / (1 - e * Math.cos(th)); return [r * Math.cos(th), r * Math.sin(th)] }
const conic: Story = {
  title: b('Konik dari aturan jarak', 'Conics from a distance rule'),
  frames: [
    f('Elips x²/25 + y²/9 = 1 punya fokus F₁ = (−4, 0) dan F₂ = (4, 0), karena c² = 25 − 9 = 16. Geser titik P: kedua jarak berubah, tetapi jumlahnya selalu 10 = 2a.', 'The ellipse x²/25 + y²/9 = 1 has foci F₁ = (−4, 0) and F₂ = (4, 0), since c² = 25 − 9 = 16. Move the point P: both distances change, but their sum is always 10 = 2a.', String.raw`|PF_1|+|PF_2|=2a=10,\quad c^2=a^2-b^2`),
    f('Hiperbola x²/9 − y²/16 = 1: sekarang c² = 9 + 16 = 25, fokus (±5, 0). Yang tetap adalah selisih jarak: |PF₁| − |PF₂| = 6 = 2a. Jauh dari pusat kurvanya mendekati asimtot y = ±4x/3.', 'Hyperbola x²/9 − y²/16 = 1: now c² = 9 + 16 = 25, foci (±5, 0). What stays fixed is the difference of distances: |PF₁| − |PF₂| = 6 = 2a. Far from the centre the curve hugs the asymptotes y = ±4x/3.', String.raw`\big||PF_1|-|PF_2|\big|=2a=6,\quad y=\pm\tfrac{b}{a}x`),
    f('Parabola y² = 4x (p = 2) hanya punya satu fokus F = (1, 0) dan satu garis direktriks x = −1. Setiap titiknya berjarak sama ke fokus dan ke direktriks.', 'The parabola y² = 4x (p = 2) has one focus F = (1, 0) and one directrix line x = −1. Each of its points is equally far from the focus and from the directrix.', String.raw`y^2=2px,\quad F\big(\tfrac p2,0\big),\quad x=-\tfrac p2`),
    f('Satu keluarga: tetapkan fokus F dan direktriks d, lalu minta |PF| = e · |PD|. Eksentrisitas e < 1 memberi elips, e = 1 parabola, e > 1 hiperbola. Pada elips e = ½ di sini, rasionya selalu 0,5.', 'One family: fix a focus F and a directrix d, then ask for |PF| = e · |PD|. Eccentricity e < 1 gives an ellipse, e = 1 a parabola, e > 1 a hyperbola. On the ellipse e = ½ here, the ratio is always 0.5.', String.raw`\frac{|PF|}{|PD|}=e`),
  ],
  control: { label: b('Geser titik P', 'Move the point P'), min: -1, max: 1, step: .02, initial: .35 },
  draw: (k, v, lang) => {
    const t = tr(lang), th = v * Math.PI, x0 = 304
    const E: P = [5 * Math.cos(th), 3 * Math.sin(th)], H: P = [3 * Math.cosh(1.1 * v), 4 * Math.sinh(1.1 * v)], yy = 4.5 * v, Q: P = [yy * yy / 4, yy]
    const F1: P = [-4, 0], F2: P = [4, 0], G1: P = [-5, 0], G2: P = [5, 0], PF: P = [1, 0], D: P = [-1, yy]
    const EP = pol(.5, th), ED: P = [-2, EP[1]]
    const seg = (p: P, q: P, col: string, map = CM) => <path d={pl([map(...p), map(...q)])} stroke={col} strokeWidth="3" strokeLinecap="round" />
    const foc = (p: P, name: string, up: boolean) => <g><Dot at={CM(...p)} color={C.fg} r={4.5} /><T x={CM(...p)[0]} y={CM(...p)[1] + (up ? -11 : 22)} size={14} weight={600}>{name}</T></g>
    return <>
      <Clip id="con-plot" x={12} y={12} w={284} h={276}>
        <At until={2} frame={k}><path d={`M12,150 H296 M160,12 V288`} stroke={C.ln} strokeWidth="1.2" /></At>
        <At until={0} frame={k}>
          <path d={fn(s => CM(5 * Math.cos(s), 3 * Math.sin(s)), 0, 2 * Math.PI)} fill="none" stroke={C.a} strokeWidth="3" />
          {seg(E, F1, C.y)}{seg(E, F2, C.g)}
        </At>
        <At from={1} until={1} frame={k}>
          <path d={pl([CM(-8, -32 / 3), CM(8, 32 / 3)]) + pl([CM(-8, 32 / 3), CM(8, -32 / 3)]).replace('M', ' M')} stroke={C.mu} strokeWidth="1.5" strokeDasharray="6 5" />
          {[1, -1].map(s => <path key={s} d={fn(u => CM(s * 3 * Math.cosh(u), 4 * Math.sinh(u)), -1.7, 1.7)} fill="none" stroke={C.a} strokeWidth="3" />)}
          {seg(H, G1, C.y)}{seg(H, G2, C.g)}
        </At>
        <At from={2} until={2} frame={k}>
          <path d={pl([CM(-1, -7), CM(-1, 7)])} stroke={C.mu} strokeWidth="2.5" />
          <path d={fn(u => CM(u * u / 4, u), -6.5, 6.5)} fill="none" stroke={C.a} strokeWidth="3" />
          {seg(Q, PF, C.y)}{seg(Q, D, C.g)}
          <Dot at={CM(...D)} color={C.g} r={4} />
        </At>
        <At from={3} frame={k}>
          <path d={pl([EM(-2, -5), EM(-2, 5)])} stroke={C.mu} strokeWidth="2.5" />
          <path d={fn(s => EM(...pol(.5, s)), 0, 2 * Math.PI)} fill="none" stroke={C.a} strokeWidth="3" />
          <path d={fn(s => EM(...pol(1, s)), .3, 2 * Math.PI - .3, 160)} fill="none" stroke={C.g} strokeWidth="3" />
          <path d={fn(s => EM(...pol(2, s)), rad(61), rad(299), 160)} fill="none" stroke={C.r} strokeWidth="3" />
          <path d={fn(s => EM(...pol(2, s)), rad(-59), rad(59), 160)} fill="none" stroke={C.r} strokeWidth="3" />
          {seg(EP, [0, 0], C.y, EM)}{seg(EP, ED, C.g, EM)}
          <Dot at={EM(...ED)} color={C.g} r={4} />
          <Dot at={EM(...EP)} color={C.fg} r={5.5} />
          <Dot at={EM(0, 0)} color={C.fg} r={4.5} />
          <T x={EM(0, 0)[0] - 18 * Math.cos(th)} y={EM(0, 0)[1] + 18 * Math.sin(th) + 5} size={14} weight={600}>F</T>
          <T x={EM(-2, 0)[0] - 8} y={30} anchor="end" size={14} weight={600} color={C.mu}>d</T>
        </At>
      </Clip>
      <At until={0} frame={k}>
        {foc(F1, 'F₁', E[1] < 0)}{foc(F2, 'F₂', E[1] < 0)}
        <Dot at={CM(...E)} color={C.fg} r={5.5} />
        <T x={CM(...E)[0] + 18 * Math.cos(th)} y={CM(...E)[1] - 18 * Math.sin(th) + 5} size={15} weight={700}>P</T>
        <T x={x0} y={46} anchor="start" size={15} weight={600} color={C.a}>x²/25 + y²/9 = 1</T>
        <T x={x0} y={72} anchor="start" size={13} color={C.mu}>a = 5, b = 3, c = 4</T>
        <T x={x0} y={112} anchor="start" size={15} color={C.y} weight={600}>|PF₁| = {nf(dist(E, F1))}</T>
        <T x={x0} y={138} anchor="start" size={15} color={C.g} weight={600}>|PF₂| = {nf(dist(E, F2))}</T>
        <T x={x0} y={174} anchor="start" size={16} color={C.v} weight={700}>{t('jumlah', 'sum')} = {nf(dist(E, F1) + dist(E, F2))}</T>
        <T x={x0} y={198} anchor="start" size={13} color={C.mu}>= 2a</T>
      </At>
      <At from={1} until={1} frame={k}>
        {foc(G1, 'F₁', H[1] < 0)}{foc(G2, 'F₂', H[1] < 0)}
        <Dot at={CM(...H)} color={C.fg} r={5.5} />
        <T x={CM(...H)[0] + 11} y={CM(...H)[1] + 5} anchor="start" size={15} weight={700}>P</T>
        <T x={x0} y={46} anchor="start" size={15} weight={600} color={C.a}>x²/9 − y²/16 = 1</T>
        <T x={x0} y={72} anchor="start" size={13} color={C.mu}>a = 3, b = 4, c = 5</T>
        <T x={x0} y={112} anchor="start" size={15} color={C.y} weight={600}>|PF₁| = {nf(dist(H, G1))}</T>
        <T x={x0} y={138} anchor="start" size={15} color={C.g} weight={600}>|PF₂| = {nf(dist(H, G2))}</T>
        <T x={x0} y={174} anchor="start" size={16} color={C.v} weight={700}>{t('selisih', 'difference')} = {nf(dist(H, G1) - dist(H, G2))}</T>
        <T x={x0} y={198} anchor="start" size={13} color={C.mu}>= 2a</T>
        <T x={x0} y={236} anchor="start" size={13} color={C.mu}>{t('asimtot', 'asymptotes')} y = ±4x/3</T>
      </At>
      <At from={2} until={2} frame={k}>
        {foc(PF, 'F', yy < 0)}
        <Dot at={CM(...Q)} color={C.fg} r={5.5} />
        <T x={CM(...Q)[0] + 11} y={CM(...Q)[1] + (yy < 0 ? 16 : -6)} anchor="start" size={15} weight={700}>P</T>
        <T x={CM(-1, 0)[0] - 6} y={30} anchor="end" size={14} weight={600} color={C.mu}>d</T>
        <T x={x0} y={46} anchor="start" size={15} weight={600} color={C.a}>y² = 4x  (p = 2)</T>
        <T x={x0} y={72} anchor="start" size={13} color={C.mu}>F = (1, 0), d: x = −1</T>
        <T x={x0} y={112} anchor="start" size={15} color={C.y} weight={600}>|PF| = {nf(dist(Q, PF))}</T>
        <T x={x0} y={138} anchor="start" size={15} color={C.g} weight={600}>|PD| = {nf(dist(Q, D))}</T>
        <T x={x0} y={174} anchor="start" size={16} color={C.v} weight={700}>{t('sama ✓', 'equal ✓')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={267} y={152} anchor="start" size={14} weight={700} color={C.a}>e = ½</T>
        <T x={286} y={282} anchor="start" size={14} weight={700} color={C.g}>e = 1</T>
        <T x={170} y={282} anchor="end" size={14} weight={700} color={C.r}>e = 2</T>
        <T x={x0} y={46} anchor="start" size={15} weight={600}>e = |PF| / |PD|</T>
        <T x={x0} y={80} anchor="start" size={14} color={C.a} weight={600}>e &lt; 1: {t('elips', 'ellipse')}</T>
        <T x={x0} y={104} anchor="start" size={14} color={C.g} weight={600}>e = 1: parabola</T>
        <T x={x0} y={128} anchor="start" size={14} color={C.r} weight={600}>e &gt; 1: {t('hiperbola', 'hyperbola')}</T>
        <T x={x0} y={170} anchor="start" size={15} color={C.y} weight={600}>|PF| = {nf(dist(EP, [0, 0]))}</T>
        <T x={x0} y={196} anchor="start" size={15} color={C.g} weight={600}>|PD| = {nf(dist(EP, ED))}</T>
        <T x={x0} y={230} anchor="start" size={16} color={C.v} weight={700}>{t('rasio', 'ratio')} = {nf(dist(EP, [0, 0]) / dist(EP, ED))}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- quadrics: slices z = h and rulings
const AZ = rad(25), EL = rad(20)
/** Orthographic view turned 25° and tilted 20° from above. */
const proj = (c: P, u: number) => (x: number, y: number, z: number): P =>
  [c[0] + u * (x * Math.cos(AZ) - y * Math.sin(AZ)), c[1] - u * (z * Math.cos(EL) + (x * Math.sin(AZ) + y * Math.cos(AZ)) * Math.sin(EL))]
type Pr = ReturnType<typeof proj>
/** Section parameter where an x²/4 + y² = k ring reaches furthest left/right on screen (the outline). */
const TS = Math.atan2(-Math.sin(AZ), 2 * Math.cos(AZ))
/** Surfaces x²/4 + y² = kk(z), over z-intervals `parts`. */
type Surf = { kk: (z: number) => number; parts: [number, number][] }
const SURF: Surf[] = [
  { kk: z => 1 - z * z, parts: [[-1, 1]] },
  { kk: z => 1 + z * z, parts: [[-2, 2]] },
  { kk: z => z * z - 1, parts: [[-2.6, -1], [1, 2.6]] },
  { kk: z => 2 * z, parts: [[0, 2]] },
]
const ringPath = (pr: Pr, kk: number, z: number) => { const q = Math.sqrt(Math.max(kk, 0)); return fn(s => pr(2 * q * Math.cos(s), q * Math.sin(s), z), 0, 2 * Math.PI, 72) + ' Z' }
/** Meridian at angle ph, sampled densely near the ends where the radius behaves like a square root. */
const meridian = (pr: Pr, s: Surf, [a, z1]: [number, number], ph: number) =>
  fn(w => { const z = a + (z1 - a) * (1 - Math.cos(Math.PI * w)) / 2, q = Math.sqrt(Math.max(s.kk(z), 0)); return pr(2 * q * Math.cos(ph), q * Math.sin(ph), z) }, 0, 1, 48)
const inPart = (s: Surf, h: number) => s.parts.some(([a, z1]) => h >= a - 1e-9 && h <= z1 + 1e-9)
const Wire = ({ s, pr, h, plane: showPlane = true, pw: pw0 }: { s: Surf; pr: Pr; h: number; plane?: boolean; pw?: [number, number] }) => {
  const zs: number[] = []
  s.parts.forEach(([a, z1]) => { for (let z = a; z <= z1 + 1e-9; z += (z1 - a) / 4) zs.push(z) })
  const mk = Math.sqrt(Math.max(...zs.map(s.kk))), pw = pw0 ?? [Math.min(2 * mk + .4, 4.5), Math.min(mk + .4, 2.2)]
  const kh = s.kk(h), cut = inPart(s, h) && kh > -1e-9
  return <g fill="none">
    {showPlane && <path d={pl([pr(-pw[0], -pw[1], h), pr(pw[0], -pw[1], h), pr(pw[0], pw[1], h), pr(-pw[0], pw[1], h)], true)} fill={C.soft} fillOpacity=".45" stroke={C.a} strokeOpacity=".5" />}
    {zs.filter(z => s.kk(z) > 1e-6).map(z => <path key={z} d={ringPath(pr, s.kk(z), z)} stroke={C.ln} strokeWidth="1" />)}
    {s.parts.map((p, i) => <g key={i}>
      {Array.from({ length: 12 }, (_, j) => j * Math.PI / 6).map(ph => <path key={ph} d={meridian(pr, s, p, ph)} stroke={C.faint} strokeWidth="1" />)}
      {[TS, TS + Math.PI].map(ph => <path key={ph} d={meridian(pr, s, p, ph)} stroke={C.mu} strokeWidth="2" />)}
    </g>)}
    {cut && (kh > 1e-6 ? <path d={ringPath(pr, kh, h)} stroke={C.a} strokeWidth="3.5" /> : <Dot at={pr(0, 0, h)} color={C.a} r={5} />)}
  </g>
}
/** Join sampled points into a path, lifting the pen wherever a point is missing. */
const brk = (pts: (P | null)[]) => { let d = '', pen = false; for (const p of pts) { if (!p) { pen = false; continue } d += `${pen ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)} `; pen = true } return d }
const sad = (x: number, y: number) => (x * x / 4 - y * y) / 2
const SX = 3, SY = 1.6
const saddleCut = (pr: Pr, h: number) => {
  const ts = Array.from({ length: 161 }, (_, i) => -3 + 6 * i / 160), ok = (x: number, y: number) => Math.abs(x) <= SX && Math.abs(y) <= SY
  if (Math.abs(h) < 1e-6) return [1, -1].map(s => pl([pr(-SX, s * -SX / 2, 0), pr(SX, s * SX / 2, 0)])).join(' ')
  const q = Math.sqrt(2 * Math.abs(h))
  return [1, -1].map(s => brk(ts.map(u => { const [x, y] = h > 0 ? [s * 2 * q * Math.cosh(u), q * Math.sinh(u)] : [2 * q * Math.sinh(u), s * q * Math.cosh(u)]; return ok(x, y) ? pr(x, y, h) : null }))).join(' ')
}
const Q3 = proj([130, 155], 24), QP = [proj([130, 160], 40), Q3, Q3], QE = proj([105, 215], 20), QS = proj([350, 172], 20)
const SC: P = [390, 160], SU = [30, 15, 20]
const quadric: Story = {
  title: b('Mengenali kuadrik dengan mengirisnya', 'Recognise a quadric by slicing it'),
  frames: [
    f('Elipsoid x²/4 + y² + z² = 1. Potong dengan bidang z = h: irisannya elips x²/4 + y² = 1 − h² (kanan). Geser h: elipsnya mengecil, menjadi titik di h = ±1, dan kosong untuk |h| > 1.', 'Ellipsoid x²/4 + y² + z² = 1. Cut it with the plane z = h: the slice is the ellipse x²/4 + y² = 1 − h² (right). Move h: the ellipse shrinks, becomes a point at h = ±1, and is empty for |h| > 1.', String.raw`z=h:\quad \frac{x^2}{4}+y^2=1-h^2`),
    f('Hiperboloid satu lembar x²/4 + y² − z² = 1: irisannya x²/4 + y² = 1 + h², selalu elips, paling kecil di pinggang h = 0. Tidak pernah kosong, jadi permukaannya satu potong. Irisan dengan bidang y = 0 adalah hiperbola x²/4 − z² = 1.', 'One-sheeted hyperboloid x²/4 + y² − z² = 1: the slice x²/4 + y² = 1 + h² is always an ellipse, smallest at the waist h = 0. It is never empty, so the surface is one piece. Its slice by the plane y = 0 is the hyperbola x²/4 − z² = 1.', String.raw`\frac{x^2}{4}+y^2=1+h^2>0`),
    f('Hiperboloid dua lembar x²/4 + y² − z² = −1: irisannya x²/4 + y² = h² − 1. Untuk |h| < 1 ruas kanan negatif, jadi irisannya kosong: ada celah, dan permukaannya terbelah menjadi dua lembar.', 'Two-sheeted hyperboloid x²/4 + y² − z² = −1: the slice is x²/4 + y² = h² − 1. For |h| < 1 the right side is negative, so the slice is empty: there is a gap, and the surface splits into two sheets.', String.raw`\frac{x^2}{4}+y^2=h^2-1<0\ \ (|h|<1)`),
    f('Paraboloid. Mangkuk x²/4 + y² = 2z: irisannya elips untuk h > 0, satu titik di h = 0, kosong untuk h < 0. Pelana x²/4 − y² = 2z: irisannya hiperbola yang membuka ke arah x untuk h > 0, ke arah y untuk h < 0, dan dua garis di h = 0.', 'Paraboloids. The bowl x²/4 + y² = 2z: its slice is an ellipse for h > 0, one point at h = 0, empty for h < 0. The saddle x²/4 − y² = 2z: its slice is a hyperbola opening along x for h > 0, along y for h < 0, and two lines at h = 0.', String.raw`\frac{x^2}{4}+y^2=2h\qquad\frac{x^2}{4}-y^2=2h`),
    f('Generator: hiperboloid satu lembar memuat garis lurus utuh. Garis (2, t, t) memenuhi 1 + t² − t² = 1 untuk setiap t. Memutar garis ini mengelilingi permukaan memberi satu keluarga (ungu); keluarga kedua (hijau) miring ke arah lain. Pelana juga punya dua keluarga.', 'Rulings: the one-sheeted hyperboloid contains entire straight lines. The line (2, t, t) satisfies 1 + t² − t² = 1 for every t. Sweeping this line around the surface gives one family (violet); a second family (green) leans the other way. The saddle has two families too.', String.raw`\tfrac x2-z=\lambda(1-y),\quad \lambda\big(\tfrac x2+z\big)=1+y`),
  ],
  control: { label: b('Tinggi irisan h (bidang z = h)', 'Slice height h (plane z = h)'), min: -2, max: 2, step: .1, initial: .8 },
  draw: (k, h, lang) => {
    const t = tr(lang), x0 = 300
    const heads: [string, string, string][] = [
      ['x²/4 + y² + z² = 1', 'elipsoid', 'ellipsoid'],
      ['x²/4 + y² − z² = 1', 'hiperboloid satu lembar', 'one-sheeted hyperboloid'],
      ['x²/4 + y² − z² = −1', 'hiperboloid dua lembar', 'two-sheeted hyperboloid'],
    ]
    const si = k <= 2 ? k : 1, kh = SURF[si].kk(h)
    const fam = (sg: number) => Array.from({ length: 12 }, (_, j) => j * Math.PI / 6).map(ph => {
      const at = (u: number) => Q3(2 * (Math.cos(ph) - sg * u * Math.sin(ph)), Math.sin(ph) + sg * u * Math.cos(ph), u)
      return <path key={ph} d={pl([at(-2), at(2)])} stroke={sg > 0 ? C.v : C.g} strokeWidth={sg > 0 ? 2 : 1.5} strokeOpacity={sg > 0 ? .8 : .7} strokeDasharray={sg > 0 ? undefined : '5 4'} />
    })
    const epk = 2 * h, sadType = Math.abs(h) < 1e-6 ? t('2 garis', '2 lines') : h > 0 ? t('hiperbola (arah x)', 'hyperbola (along x)') : t('hiperbola (arah y)', 'hyperbola (along y)')
    return <>
      {[0, 1, 2].map(i => <At key={i} from={i} until={i === 1 ? 1 : i} frame={k}>
        <Wire s={SURF[i]} pr={QP[i]} h={h} />
        <T x={14} y={32} anchor="start" size={15} weight={600}>{heads[i][0]}</T>
        <T x={14} y={54} anchor="start" size={13} color={C.mu}>{t(heads[i][1], heads[i][2])}</T>
      </At>)}
      <At until={2} frame={k}>
        <path d={`M${SC[0] - 78},${SC[1]} H${SC[0] + 78} M${SC[0]},${SC[1] - 62} V${SC[1] + 62}`} stroke={C.ln} strokeWidth="1.2" />
        <T x={SC[0] + 80} y={SC[1] + 18} anchor="end" size={12} color={C.mu}>x</T>
        <T x={SC[0] + 8} y={SC[1] - 52} anchor="start" size={12} color={C.mu}>y</T>
        <T x={SC[0]} y={70} size={15} weight={700} color={C.a}>z = {nf(h, 1)}</T>
        {kh > 1e-6
          ? <ellipse cx={SC[0]} cy={SC[1]} rx={2 * Math.sqrt(kh) * SU[si]} ry={Math.sqrt(kh) * SU[si]} fill={C.soft} fillOpacity=".5" stroke={C.a} strokeWidth="3" />
          : kh > -1e-6 ? <Dot at={SC} color={C.a} r={5} /> : null}
        <T x={SC[0]} y={250} size={14}>x²/4 + y² = {nf(kh)}</T>
        <T x={SC[0]} y={274} size={14} weight={700} color={kh > 1e-6 ? C.g : kh > -1e-6 ? C.y : C.r}>{kh > 1e-6 ? t('elips', 'ellipse') : kh > -1e-6 ? t('satu titik', 'one point') : t('kosong', 'empty')}</T>
      </At>
      <At from={3} until={3} frame={k}>
        <Wire s={SURF[3]} pr={QE} h={h} pw={[4.1, 2.1]} />
        <g fill="none">
          <path d={pl([QS(-3.2, -1.8, h), QS(3.2, -1.8, h), QS(3.2, 1.8, h), QS(-3.2, 1.8, h)], true)} fill={C.soft} fillOpacity=".45" stroke={C.a} strokeOpacity=".5" />
          {Array.from({ length: 9 }, (_, i) => -SY + i * SY / 4).map(y => <path key={`y${y}`} d={fn(x => QS(x, y, sad(x, y)), -SX, SX, 40)} stroke={Math.abs(Math.abs(y) - SY) < 1e-6 ? C.mu : C.ln} strokeWidth={Math.abs(Math.abs(y) - SY) < 1e-6 ? 2 : 1} />)}
          {Array.from({ length: 9 }, (_, i) => -SX + i * SX / 4).map(x => <path key={`x${x}`} d={fn(y => QS(x, y, sad(x, y)), -SY, SY, 30)} stroke={Math.abs(Math.abs(x) - SX) < 1e-6 ? C.mu : C.faint} strokeWidth={Math.abs(Math.abs(x) - SX) < 1e-6 ? 2 : 1} />)}
          <path d={saddleCut(QS, h)} stroke={C.a} strokeWidth="3.5" />
        </g>
        <T x={105} y={32} size={15} weight={600}>x²/4 + y² = 2z</T>
        <T x={105} y={54} size={13} color={C.mu}>{t('mangkuk (eliptik)', 'bowl (elliptic)')}</T>
        <T x={350} y={32} size={15} weight={600}>x²/4 − y² = 2z</T>
        <T x={350} y={54} size={13} color={C.mu}>{t('pelana (hiperbolik)', 'saddle (hyperbolic)')}</T>
        <T x={105} y={270} size={14} weight={700} color={epk > 1e-6 ? C.g : epk > -1e-6 ? C.y : C.r}>z = {nf(h, 1)}: {epk > 1e-6 ? t('elips', 'ellipse') : epk > -1e-6 ? t('satu titik', 'one point') : t('kosong', 'empty')}</T>
        <T x={350} y={270} size={14} weight={700} color={C.g}>{sadType}</T>
      </At>
      <At from={4} frame={k}>
        <Wire s={SURF[1]} pr={Q3} h={h} plane={false} />
        {fam(-1)}{fam(1)}
        <path d={pl([Q3(2, -2, -2), Q3(2, 2, 2)])} stroke={C.v} strokeWidth="4" strokeLinecap="round" />
        <T x={14} y={32} anchor="start" size={15} weight={600}>x²/4 + y² − z² = 1</T>
        <T x={x0} y={60} anchor="start" size={14} color={C.mu}>{t('garis tebal:', 'thick line:')}</T>
        <T x={x0} y={86} anchor="start" size={14} weight={700} color={C.v}>(x, y, z) = (2, t, t)</T>
        <T x={x0} y={122} anchor="start" size={14}>x²/4 + y² − z²</T>
        <T x={x0} y={146} anchor="start" size={14} weight={600} color={C.g}>= 1 + t² − t² = 1 ✓</T>
        <T x={x0} y={190} anchor="start" size={13} color={C.v}>{t('ungu: keluarga 1', 'violet: family 1')}</T>
        <T x={x0} y={212} anchor="start" size={13} color={C.g}>{t('hijau: keluarga 2', 'green: family 2')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- general theory: matrices, centre, principal directions
const GM = plane([105, 115], 45)
const gEll = (s: number): P => [1 + Math.cos(s) + Math.SQRT2 * Math.sin(s), -1 + Math.cos(s) - Math.SQRT2 * Math.sin(s)]
const eigen: Story = {
  title: b('Matriks konik: pusat dan arah utama', 'The matrix of a conic: centre and principal directions'),
  frames: [
    f('Persamaan derajat dua 3x² + 2xy + 3y² − 4x + 4y − 4 = 0 adalah elips miring. Bagian kuadratnya disimpan di matriks A, seluruh persamaan di Ã. Suku silang dan linear dibagi dua: 2xy memberi a₁₂ = 1, −4x memberi a₁₀ = −2.', 'The second-degree equation 3x² + 2xy + 3y² − 4x + 4y − 4 = 0 is a tilted ellipse. Its quadratic part goes into the matrix A, the whole equation into Ã. Cross and linear terms are halved: 2xy gives a₁₂ = 1, −4x gives a₁₀ = −2.', String.raw`\xi^tA\xi+2a^t\xi+a_{00}=0,\quad A=\begin{pmatrix}3&1\\1&3\end{pmatrix},\ a=\begin{pmatrix}-2\\2\end{pmatrix}`),
    f('Pusat ξ adalah titik tempat gradien nol: Aξ + a = 0. Setiap baris sistem itu adalah garis (3x + y − 2 = 0 dan x + 3y + 2 = 0), dan keduanya berpotongan di ξ = (1, −1). Konik simetris terhadap pusatnya: tali busur MM′ melalui ξ terbagi dua sama panjang.', 'The centre ξ is where the gradient vanishes: Aξ + a = 0. Each row of that system is a line (3x + y − 2 = 0 and x + 3y + 2 = 0), and they cross at ξ = (1, −1). The conic is symmetric about its centre: the chord MM′ through ξ is cut in half.', String.raw`A\xi+a=0:\ \begin{cases}3x+y-2=0\\x+3y+2=0\end{cases}\Rightarrow\ \xi=(1,-1)`),
    f('Arah utama = vektor eigen A: arah w dengan Aw sejajar w. Putar w dengan penggeser. Biasanya Aw miring menjauhi w, tetapi di 45° Aw = 4w dan di 135° Aw = 2w. Nilai eigen 4 dan 2 adalah akar s² − 6s + 8 = 0.', 'Principal directions = eigenvectors of A: directions w with Aw parallel to w. Turn w with the slider. Usually Aw tilts away from w, but at 45° Aw = 4w and at 135° Aw = 2w. The eigenvalues 4 and 2 are the roots of s² − 6s + 8 = 0.', String.raw`Aw=sw,\quad s^2-Is+\delta=s^2-6s+8=0`),
    f('Kedua arah eigen adalah sumbu simetri elips. Dalam koordinat sepanjang sumbu itu suku silang hilang: 4x′² + 2y′² = 8. Nilai eigen menentukan skala, setengah sumbu² = 8/s: √2 sepanjang (1, 1) dan 2 sepanjang (1, −1). Nilai eigen besar, sumbu pendek.', 'The two eigen-directions are the symmetry axes of the ellipse. In coordinates along them the cross term is gone: 4x′² + 2y′² = 8. The eigenvalues set the scale, semi-axis² = 8/s: √2 along (1, 1) and 2 along (1, −1). Larger eigenvalue, shorter axis.', String.raw`s_1x'^2+s_2y'^2+\tfrac{\Delta}{\delta}=0:\quad 4x'^2+2y'^2-8=0`),
  ],
  control: { label: b('Arah w: sudut θ (derajat)', 'Direction w: angle θ (degrees)'), min: 0, max: 180, step: 5, initial: 20 },
  controlFrom: 2,
  readout: d => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)), e = d % 90 === 45; return String.raw`\theta=${d}^\circ:\ Aw=(${tx(3 * c + s)},\ ${tx(c + 3 * s)})${e ? `=${d === 45 ? 4 : 2}w` : ''}` },
  draw: (k, deg, lang) => {
    const t = tr(lang), x0 = 302, ctr: P = [1, -1], c = Math.cos(rad(deg)), s = Math.sin(rad(deg))
    const w: P = [c, s], Aw: P = [3 * c + s, c + 3 * s], eig = Math.abs(w[0] * Aw[1] - w[1] * Aw[0]) < 1e-6
    const add = (p: P, q: P, m = 1): P => [p[0] + m * q[0], p[1] + m * q[1]]
    const M = gEll(2), M2: P = [2 - M[0], -2 - M[1]], tip = (q: P, d: number): P => { const L = Math.hypot(...q); return GM(...add(ctr, q, 1 + d / (45 * L))) }
    // Aw label past the tip, unless that leaves the plot: then beside the arrow near its tip, on the upper side.
    const awLab = ((): P => {
      const p = tip(Aw, 16); if (p[0] > 20 && p[0] < 280 && p[1] > 20 && p[1] < 285) return p
      const a = GM(...ctr), e = GM(...add(ctr, Aw)), dx = e[0] - a[0], dy = e[1] - a[1], l = Math.hypot(dx, dy), sg = dx > 0 ? 1 : -1
      return [a[0] + .85 * dx + 16 * sg * dy / l, a[1] + .85 * dy - 16 * sg * dx / l]
    })()
    return <>
      <Clip id="eig-plot" x={12} y={12} w={280} h={276}>
        <Grid map={GM} x={[-2.4, 4.2]} y={[-4, 2.4]} />
        <At from={1} until={1} frame={k}>
          <path d={pl([GM(-1.2, 5.6), GM(2.6, -5.8)])} stroke={C.y} strokeWidth="2.5" />
          <path d={pl([GM(-2.6, 0.2), GM(4.6, -2.2)])} stroke={C.g} strokeWidth="2.5" />
        </At>
        <At from={3} frame={k}>
          <path d={pl([GM(...add(ctr, [1, 1], -3)), GM(...add(ctr, [1, 1], 3))])} stroke={C.y} strokeWidth="1.5" strokeDasharray="6 5" />
          <path d={pl([GM(...add(ctr, [1, -1], -3)), GM(...add(ctr, [1, -1], 3))])} stroke={C.g} strokeWidth="1.5" strokeDasharray="6 5" />
        </At>
        <path d={fn(u => GM(...gEll(u)), 0, 2 * Math.PI)} fill="none" stroke={C.a} strokeWidth="3" />
        <At from={3} frame={k}>
          <path d={pl([GM(...ctr), GM(2, 0)])} stroke={C.y} strokeWidth="4" strokeLinecap="round" />
          <path d={pl([GM(...ctr), GM(1 + Math.SQRT2, -1 - Math.SQRT2)])} stroke={C.g} strokeWidth="4" strokeLinecap="round" />
        </At>
      </Clip>
      <At from={1} frame={k}><Dot at={GM(...ctr)} color={C.v} r={5.5} /></At>
      <At until={0} frame={k}>
        <T x={GM(0, 0)[0] - 6} y={GM(0, 0)[1] - 6} anchor="end" size={13} color={C.mu}>O</T>
        <T x={x0} y={40} anchor="start" size={15} weight={600} color={C.a}>3x² + 2xy + 3y²</T>
        <T x={x0} y={62} anchor="start" size={15} weight={600} color={C.a}>− 4x + 4y − 4 = 0</T>
        <T x={x0} y={104} anchor="start" size={15} weight={700}>A =</T>
        <Mat x={338} y={98} rows={[['3', '1'], ['1', '3']]} col={26} />
        <T x={x0} y={174} anchor="start" size={15} weight={700}>Ã =</T>
        <Mat x={338} y={160} rows={[['3', '1', '−2'], ['1', '3', '2'], ['−2', '2', '−4']]} col={32} />
        <T x={x0} y={242} anchor="start" size={13} color={C.mu}>2xy → a₁₂ = 1</T>
        <T x={x0} y={264} anchor="start" size={13} color={C.mu}>−4x → a₁₀ = −2</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([GM(...M), GM(...M2)])} stroke={C.fg} strokeWidth="2" strokeDasharray="5 4" />
        {[M, M2].map((p, i) => <Dot key={i} at={GM(...p)} color={C.fg} r={4.5} />)}
        <T x={GM(...M)[0] + 10} y={GM(...M)[1] + 6} anchor="start" size={15} weight={700}>M</T>
        <T x={GM(...M2)[0] - 10} y={GM(...M2)[1] - 2} anchor="end" size={15} weight={700}>M′</T>
        <T x={GM(...ctr)[0] + 12} y={GM(...ctr)[1] + 5} anchor="start" size={16} weight={700} color={C.v}>ξ</T>
        <T x={x0} y={44} anchor="start" size={15} weight={600}>Aξ + a = 0</T>
        <T x={x0} y={76} anchor="start" size={14} color={C.y} weight={600}>3x + y − 2 = 0</T>
        <T x={x0} y={100} anchor="start" size={14} color={C.g} weight={600}>x + 3y + 2 = 0</T>
        <T x={x0} y={138} anchor="start" size={16} color={C.v} weight={700}>ξ = (1, −1)</T>
        <T x={x0} y={172} anchor="start" size={13} color={C.mu}>δ = det A = 8 ≠ 0</T>
        <T x={x0} y={194} anchor="start" size={13} color={C.mu}>{t('pusat tunggal', 'unique centre')}</T>
        <T x={x0} y={228} anchor="start" size={13} color={C.mu}>|Mξ| = |ξM′|</T>
      </At>
      <At from={2} frame={k}>
        <g style={{ opacity: k === 3 ? .35 : 1, transition: 'opacity .45s' }}>
          <Arrow from={GM(...ctr)} to={GM(...add(ctr, Aw))} color={eig ? C.g : C.v} width={3} />
          <Arrow from={GM(...ctr)} to={GM(...add(ctr, w))} color={C.fg} width={3.5} />
          <At until={2} frame={k}>
            <T x={tip(w, 14)[0]} y={tip(w, 14)[1] + 5} size={15} weight={700}>w</T>
            <T x={awLab[0]} y={awLab[1] + 5} size={15} weight={700} color={eig ? C.g : C.v}>Aw</T>
          </At>
        </g>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={x0} y={44} anchor="start" size={15} weight={600}>Aw = s·w ?</T>
        <T x={x0} y={76} anchor="start" size={14}>w = ({nf(c)}, {nf(s)})</T>
        <T x={x0} y={100} anchor="start" size={14} color={eig ? C.g : C.v}>Aw = ({nf(Aw[0])}, {nf(Aw[1])})</T>
        {eig
          ? <T x={x0} y={136} anchor="start" size={16} weight={700} color={C.g}>Aw = {deg === 45 ? 4 : 2}w ✓</T>
          : <T x={x0} y={136} anchor="start" size={14} weight={600} color={C.r}>{t('tidak sejajar', 'not parallel')}</T>}
        <T x={x0} y={180} anchor="start" size={13} color={C.mu}>s² − 6s + 8 = 0</T>
        <T x={x0} y={202} anchor="start" size={13} color={C.mu}>s = 4, s = 2</T>
      </At>
      <At from={3} frame={k}>
        <T x={GM(1.5, -0.5)[0] + 12} y={GM(1.5, -0.5)[1] + 2} anchor="start" size={15} weight={700} color={C.y}>√2</T>
        <T x={GM(1.71, -1.71)[0] - 12} y={GM(1.71, -1.71)[1] + 6} anchor="end" size={15} weight={700} color={C.g}>2</T>
        <T x={x0} y={44} anchor="start" size={15} weight={600}>4x′² + 2y′² = 8</T>
        <T x={x0} y={80} anchor="start" size={13} color={C.y} weight={600}>s = 4 → √(8/4) = √2</T>
        <T x={x0} y={104} anchor="start" size={13} color={C.g} weight={600}>s = 2 → √(8/2) = 2</T>
        <T x={x0} y={140} anchor="start" size={13} color={C.mu}>{t('s besar,', 'larger s,')}</T>
        <T x={x0} y={160} anchor="start" size={13} color={C.mu}>{t('sumbu pendek', 'shorter axis')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- reduction: translate, rotate, classify
const RD = plane([125, 110], 40), S5 = Math.sqrt(5), S6 = Math.sqrt(6)
const rEll = (s: number): P => [1 + (2 * Math.cos(s) + S6 * Math.sin(s)) / S5, -1 + (Math.cos(s) - 2 * S6 * Math.sin(s)) / S5]
const rotCoef = (d: number) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return { a11: 5 * c * c + 4 * s * c + 2 * s * s, a12: -3 * s * c + 2 * (c * c - s * s), a22: 5 * s * s - 4 * s * c + 2 * c * c } }
const reduce: Story = {
  title: b('Reduksi ke bentuk kanonik: geser, putar, baca', 'Reduction to canonical form: translate, rotate, read off'),
  frames: [
    f('Mulai dari 5x² + 4xy + 2y² − 6x − 3 = 0: elips miring yang tidak berpusat di O. Kumpulkan koefisien (suku silang dan linear dibagi dua) ke A dan Ã, lalu hitung invariannya: I = tr A = 7, δ = det A = 6, Δ = det Ã = −36.', 'Start from 5x² + 4xy + 2y² − 6x − 3 = 0: a tilted ellipse not centred at O. Collect the coefficients (cross and linear terms halved) into A and Ã, then compute the invariants: I = tr A = 7, δ = det A = 6, Δ = det Ã = −36.', String.raw`A=\begin{pmatrix}5&2\\2&2\end{pmatrix},\quad \tilde A=\begin{pmatrix}5&2&-3\\2&2&0\\-3&0&-3\end{pmatrix}`),
    f('Invarian sudah memberi jenisnya sebelum reduksi dikerjakan: δ > 0 tipe elips, δ < 0 tipe hiperbola, δ = 0 tipe parabola, dan Δ = 0 berarti degenerat. Di sini δ = 6 > 0, Δ = −36 ≠ 0 dan IΔ < 0, jadi elips real.', 'The invariants give the type before any reduction is done: δ > 0 ellipse type, δ < 0 hyperbola type, δ = 0 parabola type, and Δ = 0 means degenerate. Here δ = 6 > 0, Δ = −36 ≠ 0 and IΔ < 0, so a real ellipse.', b(String.raw`\delta=6>0,\ \Delta=-36\ne0,\ I\Delta<0\ \Rightarrow\ \text{elips real}`, String.raw`\delta=6>0,\ \Delta=-36\ne0,\ I\Delta<0\ \Rightarrow\ \text{real ellipse}`)),
    f('Langkah 1, geser: pusat memenuhi Aξ + a = 0, yaitu 5x + 2y − 3 = 0 dan 2x + 2y = 0, jadi ξ = (1, −1). Pindahkan titik asal ke sana (koordinat X, Y): suku linear hilang dan konstantanya menjadi Δ/δ = −36/6 = −6.', 'Step 1, translate: the centre solves Aξ + a = 0, that is 5x + 2y − 3 = 0 and 2x + 2y = 0, so ξ = (1, −1). Move the origin there (coordinates X, Y): the linear terms vanish and the constant becomes Δ/δ = −36/6 = −6.', String.raw`5X^2+4XY+2Y^2-6=0,\quad \tfrac{\Delta}{\delta}=-6`),
    f('Langkah 2, putar: geser φ. Koefisien x′y′ berubah dan menjadi 0 tepat saat sumbu x′ searah vektor eigen (2, 1), di φ ≈ 26,6°. Yang tersisa di diagonal adalah nilai eigen 6 dan 1: 6x′² + y′² = 6, jadi x′² + y′²/6 = 1, setengah sumbu 1 dan √6. Sesuai ramalan: elips.', 'Step 2, rotate: move φ. The x′y′ coefficient changes and becomes 0 exactly when the x′ axis points along the eigenvector (2, 1), at φ ≈ 26.6°. What remains on the diagonal are the eigenvalues 6 and 1: 6x′² + y′² = 6, so x′² + y′²/6 = 1, semi-axes 1 and √6. As predicted: an ellipse.', String.raw`\tan2\varphi=\frac{2a_{12}}{a_{11}-a_{22}}=\frac43\ \Rightarrow\ \frac{x'^2}{1}+\frac{y'^2}{6}=1`),
  ],
  control: { label: b('Sudut putar φ (derajat)', 'Rotation angle φ (degrees)'), min: 0, max: 90, step: .5, initial: 10 },
  controlFrom: 3,
  readout: d => { const { a11, a12, a22 } = rotCoef(d), q = 2 * a12; return String.raw`\varphi=${d}^\circ:\ ${tx(a11, 1)}x'^2${q < -.05 ? '' : '+'}${tx(q, 1)}x'y'+${tx(a22, 1)}y'^2=6` },
  draw: (k, phi, lang) => {
    const t = tr(lang), x0 = 302, ctr: P = [1, -1], { a11, a12, a22 } = rotCoef(phi), done = Math.abs(2 * a12) < .05
    const u: P = [Math.cos(rad(phi)), Math.sin(rad(phi))], vv: P = [-u[1], u[0]]
    const along = (d: P, m: number) => RD(ctr[0] + m * d[0], ctr[1] + m * d[1])
    const rows: [string, string][] = [['δ > 0: elips', 'δ > 0: ellipse'], ['δ < 0: hiperbola', 'δ < 0: hyperbola'], ['δ = 0: parabola', 'δ = 0: parabola'], ['Δ = 0: degenerat', 'Δ = 0: degenerate']]
    return <>
      <Clip id="red-plot" x={12} y={12} w={280} h={276}>
        <Grid map={RD} x={[-2.8, 4.3]} y={[-4.5, 2.7]} />
        <At from={2} frame={k}>
          <path d={`M12,${RD(0, -1)[1]} H292 M${RD(1, 0)[0]},12 V288`} stroke={C.v} strokeWidth="1.5" strokeDasharray="6 5" />
        </At>
        <path d={fn(s => RD(...rEll(s)), 0, 2 * Math.PI)} fill="none" stroke={C.a} strokeWidth="3" />
        <At from={3} frame={k}>
          <path d={pl([along(u, -3.4), along(u, 3.4)])} stroke={done ? C.g : C.y} strokeWidth="2.5" />
          <path d={pl([along(vv, -3.4), along(vv, 3.4)])} stroke={done ? C.g : C.y} strokeWidth="2.5" />
        </At>
      </Clip>
      <T x={RD(0, 0)[0] - 7} y={RD(0, 0)[1] - 7} anchor="end" size={13} color={C.mu}>O</T>
      <At from={2} frame={k}>
        <Dot at={RD(...ctr)} color={C.v} r={5} />
      </At>
      <At from={2} until={2} frame={k}>
        <T x={286} y={RD(0, -1)[1] - 8} anchor="end" size={14} weight={700} color={C.v}>X</T>
        <T x={RD(1, 0)[0] + 8} y={28} anchor="start" size={14} weight={700} color={C.v}>Y</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Arrow from={RD(0, 0)} to={RD(...ctr)} color={C.v} width={2.5} />
        <T x={RD(...ctr)[0] + 10} y={RD(...ctr)[1] + 20} anchor="start" size={14} weight={600} color={C.v}>ξ = (1, −1)</T>
      </At>
      <At from={3} frame={k}>
        <T x={along(u, 3.4)[0] - 4} y={Math.max(along(u, 3.4)[1] - 8, 28)} anchor="end" size={15} weight={700} color={done ? C.g : C.y}>x′</T>
        <T x={along(vv, 2.9)[0] + 10} y={along(vv, 2.9)[1] + 4} anchor="start" size={15} weight={700} color={done ? C.g : C.y}>y′</T>
      </At>
      <At until={0} frame={k}>
        <T x={x0} y={40} anchor="start" size={15} weight={600} color={C.a}>5x² + 4xy + 2y²</T>
        <T x={x0} y={62} anchor="start" size={15} weight={600} color={C.a}>− 6x − 3 = 0</T>
        <T x={x0} y={104} anchor="start" size={15} weight={700}>A =</T>
        <Mat x={338} y={98} rows={[['5', '2'], ['2', '2']]} col={26} />
        <T x={x0} y={174} anchor="start" size={15} weight={700}>Ã =</T>
        <Mat x={338} y={160} rows={[['5', '2', '−3'], ['2', '2', '0'], ['−3', '0', '−3']]} col={32} />
        <T x={x0} y={240} anchor="start" size={15} weight={600} color={C.v}>I = 7,  δ = 6</T>
        <T x={x0} y={264} anchor="start" size={15} weight={600} color={C.v}>Δ = −36</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={x0} y={40} anchor="start" size={13} color={C.mu}>{t('jenis dari invarian', 'type from invariants')}</T>
        <rect x={x0 - 6} y={57} width={164} height={24} rx={6} fill={C.soft} stroke={C.a} />
        {rows.map((r, i) => <T key={i} x={x0} y={74 + i * 26} anchor="start" size={14} weight={i ? 400 : 700} color={i ? C.mu : C.a}>{t(r[0], r[1])}</T>)}
        <T x={x0} y={200} anchor="start" size={14} color={C.v} weight={600}>δ = 6, Δ = −36</T>
        <T x={x0} y={224} anchor="start" size={14} color={C.v} weight={600}>IΔ = −252 &lt; 0</T>
        <T x={x0} y={256} anchor="start" size={15} color={C.g} weight={700}>{t('⇒ elips real ✓', '⇒ real ellipse ✓')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={x0} y={44} anchor="start" size={15} weight={600}>Aξ + a = 0</T>
        <T x={x0} y={70} anchor="start" size={13}>5x + 2y − 3 = 0</T>
        <T x={x0} y={92} anchor="start" size={13}>2x + 2y = 0</T>
        <T x={x0} y={124} anchor="start" size={16} weight={700} color={C.v}>ξ = (1, −1)</T>
        <T x={x0} y={164} anchor="start" size={15} weight={600} color={C.a}>5X² + 4XY + 2Y²</T>
        <T x={x0} y={186} anchor="start" size={15} weight={600} color={C.a}>− 6 = 0</T>
        <T x={x0} y={222} anchor="start" size={13} color={C.mu}>Δ/δ = −36/6 = −6</T>
      </At>
      <At from={3} frame={k}>
        <T x={x0} y={44} anchor="start" size={16} weight={700}>φ = {nf(phi, 1)}°</T>
        <T x={x0} y={80} anchor="start" size={14}>a′₁₁ = {nf(a11, 1)}</T>
        <T x={x0} y={104} anchor="start" size={14} weight={700} color={done ? C.g : C.r}>2a′₁₂ = {nf(2 * a12, 1)}</T>
        <T x={x0} y={128} anchor="start" size={14}>a′₂₂ = {nf(a22, 1)}</T>
        {done
          ? <><T x={x0} y={170} anchor="start" size={15} weight={700} color={C.v}>6x′² + y′² = 6</T><T x={x0} y={196} anchor="start" size={15} weight={700} color={C.v}>x′² + y′²/6 = 1</T><T x={x0} y={226} anchor="start" size={13} color={C.mu}>{t('setengah sumbu 1, √6', 'semi-axes 1, √6')}</T></>
          : <T x={x0} y={170} anchor="start" size={13} color={C.mu}>{t('suku x′y′ masih ada', 'x′y′ term still there')}</T>}
      </At>
    </>
  },
}

// ---------------------------------------------------------------- affine maps: what survives, what does not
const AF = plane([60, 235], 40)
const affine: Story = {
  title: b('Transformasi afin: garis tetap garis, ukuran berubah', 'Affine maps: lines stay lines, sizes change'),
  frames: [
    f('Transformasi afin x′ = Bx + c memindahkan seluruh petak. Di sini B = (1 ½; 0 k) dan c = (4, 0). Garis tetap garis dan garis sejajar tetap sejajar: persegi menjadi jajar genjang. Geser k untuk menggerakkan petaknya.', 'An affine map x′ = Bx + c moves the whole grid. Here B = (1 ½; 0 k) and c = (4, 0). Lines stay lines and parallel lines stay parallel: squares become parallelograms. Move k to move the grid.', String.raw`x'=Bx+c,\quad B=\begin{pmatrix}1&\tfrac12\\0&k\end{pmatrix},\ c=\begin{pmatrix}4\\0\end{pmatrix}`),
    f('Titik tengah tetap titik tengah: M = (1, 1), di tengah P = (0, 2) dan Q = (2, 0), dibawa ke M′ yang tepat di tengah P′ dan Q′. Lebih umum, perbandingan sederhana tiga titik segaris tidak berubah.', 'Midpoints stay midpoints: M = (1, 1), halfway between P = (0, 2) and Q = (2, 0), goes to M′, exactly halfway between P′ and Q′. More generally, the simple ratio of three collinear points is unchanged.', String.raw`T\Big(\frac{P+Q}{2}\Big)=\frac{T(P)+T(Q)}{2}`),
    f('Tetapi panjang dan sudut berubah. Sisi tegak sepanjang 2 menjadi √(1 + 4k²), dan sudut siku 90° mengecil. Untuk k = 1,5: panjangnya √10 ≈ 3,16 dan sudutnya ≈ 71,6°.', 'But lengths and angles change. The vertical side of length 2 becomes √(1 + 4k²), and the right angle of 90° shrinks. For k = 1.5: the length is √10 ≈ 3.16 and the angle ≈ 71.6°.', String.raw`B\begin{pmatrix}0\\2\end{pmatrix}=\begin{pmatrix}1\\2k\end{pmatrix},\quad \sqrt{1+4k^2}\ne2`),
    f('Lingkaran menjadi elips, dan setiap luas dikali |det B| = k. Persegi seluas 4 menjadi 4k, lingkaran seluas π menjadi πk. Di k = 1 bentuknya tetap berubah, tetapi luasnya sama.', 'A circle becomes an ellipse, and every area is multiplied by |det B| = k. The square of area 4 becomes 4k, the circle of area π becomes πk. At k = 1 the shape still changes, but the area stays the same.', String.raw`S'=|\det B|\,S`),
  ],
  control: { label: b('Entri k di B', 'Entry k of B'), min: .25, max: 2, step: .05, initial: 1.5 },
  readout: v => String.raw`k=${tx(v)}:\ \det B=${tx(v)},\quad 4\to${tx(4 * v)},\quad \pi\to${tx(Math.PI * v)}`,
  draw: (k, v, lang) => {
    const t = tr(lang), x0 = 352, Tm = (x: number, y: number): P => AF(x + y / 2 + 4, v * y)
    const ang = Math.atan2(2 * v, 1), lenV = Math.sqrt(1 + 4 * v * v)
    const lines = [0, 1, 2].flatMap(i => [[[i, 0], [i, 2]], [[0, i], [2, i]]] as [P, P][])
    const P0: P = [0, 2], Q0: P = [2, 0], M0: P = [1, 1]
    return <>
      <At from={3} frame={k}>
        <path d={pl([AF(0, 0), AF(2, 0), AF(2, 2), AF(0, 2)], true)} fill={C.mu} fillOpacity=".12" />
        <path d={pl([Tm(0, 0), Tm(2, 0), Tm(2, 2), Tm(0, 2)], true)} fill={C.soft} fillOpacity=".6" />
      </At>
      {lines.map(([p, q], i) => <path key={`o${i}`} d={pl([AF(...p), AF(...q)])} stroke={C.mu} strokeWidth={i < 2 || i > 3 ? 2 : 1.2} />)}
      {lines.map(([p, q], i) => <path key={`n${i}`} d={pl([Tm(...p), Tm(...q)])} stroke={C.a} strokeWidth={i < 2 || i > 3 ? 3 : 1.6} />)}
      <Arrow from={[150, 272]} to={[212, 272]} color={C.mu} width={2} />
      <T x={181} y={264} size={14} weight={700} color={C.mu}>T</T>
      <T x={14} y={34} anchor="start" size={15} weight={600}>x′ = x + ½y + 4</T>
      <T x={14} y={58} anchor="start" size={15} weight={600}>y′ = {nf(v)}y</T>
      <T x={x0} y={52} anchor="start" size={15} weight={700}>B =</T>
      <Mat x={386} y={46} rows={[['1', '½'], ['0', nf(v)]]} col={36} color={C.a} />
      <At until={0} frame={k}>
        <T x={x0} y={130} anchor="start" size={14} color={C.g} weight={600}>{t('garis → garis ✓', 'line → line ✓')}</T>
        <T x={x0} y={156} anchor="start" size={14} color={C.g} weight={600}>∥ → ∥ ✓</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([AF(...P0), AF(...Q0)])} stroke={C.y} strokeWidth="3" />
        <path d={pl([Tm(...P0), Tm(...Q0)])} stroke={C.y} strokeWidth="3" />
        {[[P0, 'P'], [Q0, 'Q'], [M0, 'M']].map(([p, n]) => <g key={String(n)}>
          <Dot at={AF(...(p as P))} color={n === 'M' ? C.v : C.y} r={5} />
          <Dot at={Tm(...(p as P))} color={n === 'M' ? C.v : C.y} r={5} />
        </g>)}
        <T x={AF(...P0)[0] - 8} y={AF(...P0)[1] - 6} anchor="end" size={14} weight={700}>P</T>
        <T x={AF(...Q0)[0] + 6} y={AF(...Q0)[1] + 18} anchor="start" size={14} weight={700}>Q</T>
        <T x={AF(...M0)[0] + 9} y={AF(...M0)[1] - 7} anchor="start" size={14} weight={700} color={C.v}>M</T>
        <T x={Tm(...P0)[0] - 8} y={Tm(...P0)[1] - 6} anchor="end" size={14} weight={700}>P′</T>
        <T x={Tm(...Q0)[0] + 6} y={Tm(...Q0)[1] + 18} anchor="start" size={14} weight={700}>Q′</T>
        <T x={Tm(...M0)[0] + 9} y={Tm(...M0)[1] - 7} anchor="start" size={14} weight={700} color={C.v}>M′</T>
        <T x={x0} y={130} anchor="start" size={14}>PM : MQ</T>
        <T x={x0} y={156} anchor="start" size={14} color={C.g} weight={600}>= 1 : 1 ✓</T>
      </At>
      <At from={2} until={2} frame={k}>
        <RightAngle at={AF(0, 0)} a={0} size={12} color={C.fg} />
        <T x={AF(0, 0)[0] + 18} y={AF(0, 0)[1] - 16} anchor="start" size={13} weight={600}>90°</T>
        <T x={AF(0, 1)[0] - 8} y={AF(0, 1)[1] + 5} anchor="end" size={15} weight={700}>2</T>
        <path d={arc(Tm(0, 0), 26, 0, ang)} fill="none" stroke={C.r} strokeWidth="2" />
        <T x={Tm(0, 0)[0] + 40 * Math.cos(ang / 2) + 4} y={Tm(0, 0)[1] - 40 * Math.sin(ang / 2) + 6} anchor="start" size={13} weight={600} color={C.r}>{nf(ang * 180 / Math.PI, 1)}°</T>
        <T x={Tm(0, 1)[0] - 10} y={Tm(0, 1)[1] + 5} anchor="end" size={15} weight={700} color={C.r}>{nf(lenV)}</T>
        <T x={x0} y={130} anchor="start" size={14} color={C.r} weight={600}>90° → {nf(ang * 180 / Math.PI, 1)}°</T>
        <T x={x0} y={156} anchor="start" size={14} color={C.r} weight={600}>2 → {nf(lenV)}</T>
      </At>
      <At from={3} frame={k}>
        <circle cx={AF(1, 1)[0]} cy={AF(1, 1)[1]} r={40} fill="none" stroke={C.mu} strokeWidth="2" strokeDasharray="5 4" />
        <path d={fn(s => Tm(1 + Math.cos(s), 1 + Math.sin(s)), 0, 2 * Math.PI)} fill={C.a} fillOpacity=".18" stroke={C.v} strokeWidth="3" />
        <T x={x0} y={130} anchor="start" size={14} weight={600}>det B = {nf(v)}</T>
        <T x={x0} y={160} anchor="start" size={14} color={C.v} weight={600}>□ 4 → {nf(4 * v)}</T>
        <T x={x0} y={186} anchor="start" size={14} color={C.v} weight={600}>○ π → {nf(Math.PI * v)}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- isometries and similarities: the letter F
const IM = plane([150, 155], 22)
const FP: P[] = [[.5, .5], [1, .5], [1, 1.5], [2, 1.5], [2, 2], [1, 2], [1, 2.5], [2.5, 2.5], [2.5, 3], [.5, 3]]
type Map2 = (p: P) => P
const isometry: Story = {
  title: b('Isometri menjaga jarak; kesebangunan menjaga bentuk', 'Isometries keep distances; similarities keep shape'),
  frames: [
    f('Rotasi B = R(θ): kolomnya vektor satuan yang saling tegak lurus, jadi BᵗB = I. Karena itu hasil kali skalar tetap, sehingga panjang dan sudut tetap: sisi atas F tetap 2 dan sudut siku tetap 90°. det B = +1, jadi F tidak terbalik.', 'Rotation B = R(θ): its columns are perpendicular unit vectors, so BᵗB = I. Therefore scalar products are kept, so lengths and angles are kept: the top edge of F stays 2 and the right angle stays 90°. det B = +1, so F is not flipped.', String.raw`B^tB=I\ \Rightarrow\ Bu\cdot Bv=u^tB^tBv=u\cdot v`),
    f('Pencerminan pada garis bersudut θ/2 juga memenuhi BᵗB = I: panjang dan sudut tetap. Tetapi det B = −1 dan orientasinya terbalik: huruf F terbaca seperti di cermin. Rotasi mana pun tidak bisa melakukan ini.', 'Reflection in the line at angle θ/2 also satisfies BᵗB = I: lengths and angles are kept. But det B = −1 and the orientation flips: the letter F reads as in a mirror. No rotation can do this.', String.raw`S=\begin{pmatrix}\cos\theta&\sin\theta\\\sin\theta&-\cos\theta\end{pmatrix},\quad \det S=-1`),
    f('Setiap isometri bidang = transformasi ortogonal lalu translasi: x′ = Bx + c. Di sini F diputar dulu (garis putus-putus), lalu digeser oleh c = (2, −1). Translasi tidak mengubah jarak, jadi gabungannya tetap isometri.', 'Every plane isometry = an orthogonal map followed by a translation: x′ = Bx + c. Here F is first rotated (dashed), then shifted by c = (2, −1). A translation does not change distances, so the composite is still an isometry.', String.raw`x'=Bx+c,\quad B^tB=I`),
    f('Kesebangunan = isometri dikali faktor skala k: x′ = kBx + c (di sini c = 0). Dengan k = 1,5 setiap panjang dikali 1,5, jadi sisi atas 2 menjadi 3, tetapi semua sudut tetap: sudut siku tetap 90°. Bentuknya sama, hanya ukurannya berubah.', 'A similarity = an isometry times a scale factor k: x′ = kBx + c (here c = 0). With k = 1.5 every length is multiplied by 1.5, so the top edge 2 becomes 3, but every angle stays: the right angle stays 90°. Same shape, only the size changes.', String.raw`x'=kBx+c,\quad (kB)^t(kB)=k^2I`),
  ],
  control: { label: b('Sudut θ di B (derajat)', 'Angle θ in B (degrees)'), min: 0, max: 360, step: 5, initial: 60 },
  draw: (k, deg, lang) => {
    const t = tr(lang), x0 = 302, th = rad(deg), c = Math.cos(th), s = Math.sin(th)
    const rot: Map2 = ([x, y]) => [x * c - y * s, x * s + y * c], refl: Map2 = ([x, y]) => [x * c + y * s, x * s - y * c]
    const move: Map2 = p => { const q = rot(p); return [q[0] + 2, q[1] - 1] }, grow: Map2 = p => { const q = rot(p); return [1.5 * q[0], 1.5 * q[1]] }
    const shape = (g: Map2, col: string, dash?: string, fill = true) => <path d={pl(FP.map(p => IM(...g(p))), true)} fill={fill ? col : 'none'} fillOpacity=".18" stroke={col} strokeWidth={dash ? 2 : 3} strokeDasharray={dash} strokeLinejoin="round" />
    const marks = (g: Map2, a: number, col: string, len: string) => <g>
      <RightAngle at={IM(...g([.5, 3]))} a={a} size={9} color={C.fg} />
      <T x={IM(...g([1.5, 3.45]))[0]} y={IM(...g([1.5, 3.45]))[1] + 5} size={14} weight={700} color={col}>{len}</T>
    </g>
    const mat = (rows: string[][]) => <Mat x={x0} y={72} rows={rows} col={50} size={14} />
    return <>
      <Clip id="iso-plot" x={12} y={12} w={280} h={276}>
        <Grid map={IM} x={[-7, 7]} y={[-7, 7]} />
        {shape(p => p, C.mu, '5 4', false)}
        <At until={0} frame={k}>
          {shape(rot, C.a)}
          <path d={arc(IM(0, 0), 26, 0, th)} fill="none" stroke={C.v} strokeWidth="2" />
          {marks(rot, th - Math.PI / 2, C.a, '2')}
        </At>
        <At from={1} until={1} frame={k}>
          <path d={pl([IM(-8 * Math.cos(th / 2), -8 * Math.sin(th / 2)), IM(8 * Math.cos(th / 2), 8 * Math.sin(th / 2))])} stroke={C.y} strokeWidth="2" strokeDasharray="7 5" />
          {shape(refl, C.r)}
          {marks(refl, th, C.r, '2')}
        </At>
        <At from={2} until={2} frame={k}>
          {shape(rot, C.a, '4 4', false)}
          {shape(move, C.a)}
          <Arrow from={IM(...rot([.5, .5]))} to={IM(...move([.5, .5]))} color={C.v} width={2.5} />
          {marks(move, th - Math.PI / 2, C.a, '2')}
        </At>
        <At from={3} frame={k}>
          {shape(grow, C.g)}
          {marks(grow, th - Math.PI / 2, C.g, '3')}
        </At>
      </Clip>
      <Dot at={IM(0, 0)} color={C.fg} r={4} />
      <T x={IM(0, 0)[0] - 8} y={IM(0, 0)[1] + 18} anchor="end" size={13} color={C.mu}>O</T>
      <At until={0} frame={k}>
        <T x={x0} y={40} anchor="start" size={15} weight={600}>B = R({deg}°)</T>
        {mat([[nf(c), nf(-s)], [nf(s), nf(c)]])}
        <T x={x0} y={140} anchor="start" size={14} color={C.g} weight={600}>BᵗB = I ✓</T>
        <T x={x0} y={164} anchor="start" size={14} weight={600}>det B = +1</T>
        <T x={x0} y={200} anchor="start" size={14} color={C.g} weight={600}>2 → 2 ✓</T>
        <T x={x0} y={224} anchor="start" size={14} color={C.g} weight={600}>90° → 90° ✓</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={x0} y={40} anchor="start" size={15} weight={600}>B = S({deg}°)</T>
        {mat([[nf(c), nf(s)], [nf(s), nf(-c)]])}
        <T x={x0} y={140} anchor="start" size={14} color={C.g} weight={600}>BᵗB = I ✓</T>
        <T x={x0} y={164} anchor="start" size={14} weight={700} color={C.r}>det B = −1</T>
        <T x={x0} y={200} anchor="start" size={14} weight={600} color={C.r}>{t('F terbalik', 'F is mirrored')}</T>
        <T x={x0} y={224} anchor="start" size={13} color={C.mu}>{t('cermin: garis θ/2', 'mirror: line at θ/2')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={x0} y={40} anchor="start" size={15} weight={600}>x′ = Bx + c</T>
        <T x={x0} y={70} anchor="start" size={14}>B = R({deg}°)</T>
        <T x={x0} y={94} anchor="start" size={14} color={C.v} weight={600}>c = (2, −1)</T>
        <T x={x0} y={140} anchor="start" size={14} color={C.g} weight={600}>2 → 2 ✓</T>
        <T x={x0} y={164} anchor="start" size={14} color={C.g} weight={600}>90° → 90° ✓</T>
      </At>
      <At from={3} frame={k}>
        <T x={x0} y={40} anchor="start" size={15} weight={600}>x′ = kBx</T>
        <T x={x0} y={70} anchor="start" size={14}>B = R({deg}°), k = 1.5</T>
        <T x={x0} y={110} anchor="start" size={14} color={C.y} weight={600}>2 → 3</T>
        <T x={x0} y={134} anchor="start" size={14} color={C.g} weight={600}>90° → 90° ✓</T>
        <T x={x0} y={170} anchor="start" size={13} color={C.mu}>{t('bentuk sama,', 'same shape,')}</T>
        <T x={x0} y={190} anchor="start" size={13} color={C.mu}>{t('ukuran × 1.5', 'size × 1.5')}</T>
      </At>
    </>
  },
}

export const GEOMETRY2_STORIES: Partial<Record<VisualKind, Story>> = { radical, conic, quadric, eigen, reduce, affine, isometry }
