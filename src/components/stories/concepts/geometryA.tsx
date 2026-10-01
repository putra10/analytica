import { At, Arrow, C, Clip, Dot, Grid, T, arc, b, f, fn, pl, plane, tr, type P, type Story } from '../kit'

/** Number for SVG labels: at most 2 decimals, real minus sign. */
const fmt = (n: number, d = 2) => String(+n.toFixed(d)).replace('-', '−')
/** Number for KaTeX. */
const tx = (n: number, d = 2) => String(+n.toFixed(d))
const DEG = Math.PI / 180
type M3 = (x: number, y: number, z: number) => P
/** Oblique 3D view: x to the right, y receding up-right, z up. */
const ob = (o: P, s: number): M3 => (x, y, z) => [o[0] + s * (x + .55 * y), o[1] - s * (z + .35 * y)]
/** Orthographic view (turned by az, tilted down by el): a sphere stays an exact circle. */
const orth = (o: P, s: number, az = .5, el = .35): M3 => {
  const ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el)
  return (x, y, z) => [o[0] + s * (x * ca + y * sa), o[1] - s * (z * ce + (-x * sa + y * ca) * se)]
}
/** Right-angle mark at `at` between two screen directions. */
const RA = ({ at, a, c, size = 11, color = C.mu }: { at: P; a: P; c: P; size?: number; color?: string }) => {
  const n = (v: P): P => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l * size, v[1] / l * size] }, p = n(a), q = n(c)
  return <path d={`M${at[0] + p[0]},${at[1] + p[1]} l${q[0]},${q[1]} l${-p[0]},${-p[1]}`} fill="none" stroke={color} strokeWidth="1.5" />
}
const sub = (a: P, c: P): P => [a[0] - c[0], a[1] - c[1]]
/** Vertical plane through the z-axis, spanned by the horizontal unit direction u and z. */
const page = (m: M3, u: [number, number], A = 2.1, H = 1.5) =>
  pl([m(-A * u[0], -A * u[1], -H), m(A * u[0], A * u[1], -H), m(A * u[0], A * u[1], H), m(-A * u[0], -A * u[1], H)], true)
/** Horizontal square |x|, |y| ≤ a at height z. */
const sqr = (m: M3, a: number, z: number) => pl([m(-a, -a, z), m(a, -a, z), m(a, a, z), m(-a, a, z)], true)
/** Tangent point from Q to the circle (c, R), on side sgn. */
const tangentPt = (Q: P, c: P, R: number, sgn: number): P => {
  const d = Math.hypot(Q[0] - c[0], Q[1] - c[1]), a = Math.atan2(Q[1] - c[1], Q[0] - c[0]) + sgn * Math.acos(R / d)
  return [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]
}

// ================================================================ basis:0 division points
const sp = plane([50, 250], 36)
const division: Story = {
  title: b('Titik pembagi adalah rata-rata berbobot', 'A division point is a weighted average'),
  control: { label: b('Perbandingan k = AM : MB', 'Ratio k = AM : MB'), min: 0, max: 6, step: .5, initial: 2 },
  frames: [
    f('A = (0, 0) dan B = (6, 3). M membagi AB dengan AM = k · MB. Untuk k = 2 panah M − A = (4, 2) tepat dua kali panah B − M = (2, 1). Geser k.', 'A = (0, 0) and B = (6, 3). M divides AB with AM = k · MB. For k = 2 the arrow M − A = (4, 2) is exactly twice the arrow B − M = (2, 1). Move k.', String.raw`M-A=k\,(B-M)`),
    f('Kumpulkan M di kiri: (1 + k)M = A + kB. Jadi M adalah rata-rata berbobot: beban 1 di A dan beban k di B. M condong ke ujung yang lebih berat. Untuk k = 2: M = ⅓A + ⅔B = (4, 2).', 'Collect M on the left: (1 + k)M = A + kB. So M is a weighted average: weight 1 at A and weight k at B. M leans towards the heavier end. For k = 2: M = ⅓A + ⅔B = (4, 2).', String.raw`(1+k)M=A+kB\ \Rightarrow\ M=\frac{A+kB}{1+k}`),
    f('Beban sama, k = 1, memberi titik tengah (3, 3/2): rata-rata biasa kedua ujung. k = 0 memberi M = A. Penyebut 1 + k tidak boleh nol, jadi k ≠ −1.', 'Equal weights, k = 1, give the midpoint (3, 3/2): the plain average of the endpoints. k = 0 gives M = A. The denominator 1 + k must not be zero, so k ≠ −1.', String.raw`k=1:\ M=\frac{A+B}{2}=\left(3,\tfrac32\right)`),
  ],
  readout: k => String.raw`M=\frac{A+${tx(k)}B}{1+${tx(k)}}=(${tx(6 * k / (1 + k))},\ ${tx(3 * k / (1 + k))})`,
  draw: (fr, k, lang) => {
    const t = tr(lang), A = sp(0, 0), B = sp(6, 3), m: P = [6 * k / (1 + k), 3 * k / (1 + k)], M = sp(m[0], m[1])
    const wA = 1 / (1 + k), wB = k / (1 + k), rB = 10 * Math.sqrt(k), mid = sp(3, 1.5)
    return <>
      <Grid map={sp} x={[0, 6]} y={[0, 4]} />
      <path d={pl([A, B])} stroke={C.ln} strokeWidth="2" />
      <Dot at={A} color={C.fg} />
      <Dot at={B} color={C.fg} />
      <At until={0} frame={fr}>
        <Arrow from={A} to={M} color={C.g} width={4} />
        <Arrow from={M} to={B} color={C.v} width={4} />
        <T x={300} y={70} anchor="start" size={15}>k = {fmt(k)}</T>
        <T x={300} y={104} anchor="start" size={14} color={C.g} weight={600}>M − A = ({fmt(m[0])}, {fmt(m[1])})</T>
        <T x={300} y={130} anchor="start" size={14} color={C.v} weight={600}>B − M = ({fmt(6 - m[0])}, {fmt(3 - m[1])})</T>
        <T x={300} y={166} anchor="start" size={15}>M − A = {fmt(k)} · (B − M)</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <path d={`M${M[0]},${M[1] + 8} l-9,16 h18 Z`} fill={C.y} />
        <circle cx={A[0]} cy={A[1]} r={10} fill={C.g} />
        <T x={A[0]} y={A[1] + 5} size={13} weight={700} color={C.bg} halo={false}>1</T>
        {k > 0 && <circle cx={B[0]} cy={B[1]} r={rB} fill={C.v} />}
        {k > 0 && <T x={B[0]} y={B[1] + 5} size={13} weight={700} color={C.bg} halo={false}>{fmt(k)}</T>}
        <T x={300} y={70} anchor="start" size={14} color={C.mu}>{t('beban', 'weights')}</T>
        <T x={300} y={96} anchor="start" size={14} color={C.g}>A: 1/(1 + k) = {fmt(wA)}</T>
        <T x={300} y={120} anchor="start" size={14} color={C.v}>B: k/(1 + k) = {fmt(wB)}</T>
        <T x={300} y={156} anchor="start" size={15}>M = {fmt(wA)}A + {fmt(wB)}B</T>
        <T x={300} y={182} anchor="start" size={16} weight={700} color={C.a}>= ({fmt(m[0])}, {fmt(m[1])})</T>
      </At>
      <At from={2} frame={fr}>
        <circle cx={mid[0]} cy={mid[1]} r={9} fill="none" stroke={C.y} strokeWidth="2.5" />
        <T x={mid[0] + 8} y={mid[1] + 28} anchor="start" size={13} color={C.y}>{t('titik tengah', 'midpoint')}</T>
        <T x={300} y={70} anchor="start" size={15} color={C.y}>k = 1: M = (A + B)/2</T>
        <T x={300} y={96} anchor="start" size={15} color={C.y} weight={600}>= (3, 1.5)</T>
        <T x={300} y={140} anchor="start" size={15}>k = {fmt(k)}: M = ({fmt(m[0])}, {fmt(m[1])})</T>
        <T x={300} y={180} anchor="start" size={14} color={C.r}>k = −1: 1 + k = 0 ✗</T>
      </At>
      <Dot at={M} color={C.a} r={7} />
      <T x={A[0] - 4} y={A[1] + 26} anchor="start" weight={700}>A</T>
      <T x={B[0] + (fr === 1 ? Math.max(rB, 6) + 6 : 10)} y={B[1] - 6} anchor="start" weight={700}>B</T>
      <T x={M[0] - 12} y={M[1] - 12} anchor="end" weight={700} color={C.a}>M</T>
    </>
  },
}

// ================================================================ basis:1 independence and unique coordinates
const lb = plane([60, 230], 40)
const independence: Story = {
  title: b('Basis: luas tidak nol berarti alamat tunggal', 'A basis: nonzero area means a unique address'),
  control: { label: b('e₂ = (1, s): s', 'e₂ = (1, s): s'), min: -1, max: 3, step: .5, initial: 2 },
  controlFrom: 1,
  frames: [
    f('Kolom matriks B adalah e₁ = (2, 0) dan e₂ = (1, 0). Keduanya sejajar, jadi jajar genjangnya gepeng: det B = 0. Hanya titik di sumbu x yang tercapai, dan (4, 0) = 2e₁ = 4e₂ = e₁ + 2e₂: banyak cara.', 'The columns of B are e₁ = (2, 0) and e₂ = (1, 0). They are parallel, so the parallelogram is flat: det B = 0. Only points on the x-axis are reached, and (4, 0) = 2e₁ = 4e₂ = e₁ + 2e₂: many ways.', String.raw`\det\begin{pmatrix}2&1\\0&0\end{pmatrix}=0`),
    f('Miringkan e₂ menjadi (1, s). Luas jajar genjang adalah det B = 2·s − 1·0 = 2s. Untuk s = 2 luasnya 4. Hanya di s = 0 luasnya kembali nol.', 'Tilt e₂ to (1, s). The parallelogram area is det B = 2·s − 1·0 = 2s. For s = 2 the area is 4. Only at s = 0 does it drop back to zero.', String.raw`\det B=\begin{vmatrix}2&1\\0&s\end{vmatrix}=2s`),
    f('Selesaikan Bc = v untuk v = (4, 2): c₂ = 2/s dan c₁ = 2 − 1/s. Untuk s = 2: v = 1,5·e₁ + 1·e₂, dan tidak ada pasangan lain. Selama det B ≠ 0 setiap v punya tepat satu alamat.', 'Solve Bc = v for v = (4, 2): c₂ = 2/s and c₁ = 2 − 1/s. For s = 2: v = 1.5·e₁ + 1·e₂, and no other pair works. As long as det B ≠ 0 every v has exactly one address.', String.raw`c=B^{-1}v:\quad c_2=\frac{2}{s},\ c_1=2-\frac1s`),
  ],
  readout: s => s === 0 ? String.raw`s=0:\ \det B=0` : String.raw`s=${tx(s)}:\ \det B=${tx(2 * s)},\quad (4,2)=${tx(2 - 1 / s)}\,e_1+${tx(2 / s)}\,e_2`,
  draw: (fr, sv, lang) => {
    const t = tr(lang), s = fr === 0 ? 0 : sv, flat = Math.abs(s) < 1e-9, O = lb(0, 0), v = lb(4, 2)
    const c2 = flat ? 0 : 2 / s, c1 = flat ? 0 : 2 - 1 / s, mid = lb(2 * c1, 0)
    return <>
      <Grid map={lb} x={[-1, 6]} y={[-1, 4]} />
      {!flat && <path d={pl([O, lb(2, 0), lb(3, s), lb(1, s)], true)} fill={C.a} fillOpacity=".18" />}
      {flat && <path d={pl([lb(-1, 0), lb(6, 0)])} stroke={C.r} strokeWidth="8" strokeOpacity=".18" />}
      <At from={2} frame={fr}>
        {!flat && <g>
          <Arrow from={O} to={mid} color={C.a} width={2.5} dash="6 4" />
          <Arrow from={mid} to={v} color={C.g} width={2.5} dash="6 4" />
        </g>}
      </At>
      <Arrow from={O} to={lb(2, 0)} color={C.a} width={flat ? 7 : 4} />
      <Arrow from={O} to={lb(1, s)} color={flat ? C.r : C.g} width={flat ? 3 : 4} />
      <T x={lb(2, 0)[0] - 6} y={lb(0, 0)[1] + (s < 0 ? -12 : 24)} color={C.a} weight={700}>e₁</T>
      <T x={lb(1, s)[0] + (flat ? -24 : -10)} y={lb(1, s)[1] + (flat ? -12 : s > 0 ? 0 : 16)} anchor="end" color={flat ? C.r : C.g} weight={700}>e₂</T>
      <Dot at={v} color={flat ? C.r : C.v} r={7} hollow={flat} />
      <T x={v[0] + 12} y={v[1] - 10} anchor="start" weight={700} color={flat ? C.r : C.v}>v = (4, 2){flat ? ' ?' : ''}</T>
      <At until={0} frame={fr}>
        <T x={316} y={70} anchor="start" size={15} color={C.a}>e₁ = (2, 0)</T>
        <T x={316} y={96} anchor="start" size={15} color={C.r}>e₂ = (1, 0)</T>
        <T x={316} y={132} anchor="start" size={17} weight={700} color={C.r}>det B = 0</T>
        <T x={316} y={156} anchor="start" size={13} color={C.mu}>{t('luas 0, gepeng', 'area 0, flat')}</T>
        <T x={316} y={196} anchor="start" size={13} color={C.y}>(4, 0) = 2e₁ = 4e₂</T>
        <T x={316} y={218} anchor="start" size={13} color={C.y}>= e₁ + 2e₂</T>
      </At>
      <At from={1} frame={fr}>
        <T x={316} y={70} anchor="start" size={15} color={C.a}>e₁ = (2, 0)</T>
        <T x={316} y={96} anchor="start" size={15} color={flat ? C.r : C.g}>e₂ = (1, {fmt(s)})</T>
        <T x={316} y={132} anchor="start" size={17} weight={700} color={flat ? C.r : C.a}>det B = {fmt(2 * s)}</T>
        <T x={316} y={156} anchor="start" size={13} color={C.mu}>{flat ? t('luas 0, bukan basis', 'area 0, not a basis') : t('luas ≠ 0: basis', 'area ≠ 0: a basis')}</T>
      </At>
      <At from={2} frame={fr}>
        {flat
          ? <T x={316} y={196} anchor="start" size={14} color={C.r}>{t('tak ada c', 'no c exists')}</T>
          : <g>
            <T x={316} y={196} anchor="start" size={15} color={C.a}>c₁ = {fmt(c1)}</T>
            <T x={316} y={220} anchor="start" size={15} color={C.g}>c₂ = {fmt(c2)}</T>
            <T x={316} y={252} anchor="start" size={13} color={C.mu}>{t('satu-satunya', 'the only one')}</T>
          </g>}
      </At>
    </>
  },
}

// ================================================================ products:0 dot product and projection
const dpm = plane([190, 196], 34)
const projectionVec: Story = {
  title: b('Proyeksi: berapa banyak u searah v', 'Projection: how much of u points along v'),
  control: { label: b('Sudut θ antara u dan v (derajat)', 'Angle θ between u and v (degrees)'), min: 0, max: 180, step: 5, initial: 60 },
  frames: [
    f('v = (5, 0) di sumbu x dan |u| = 4. Jatuhkan garis tegak lurus dari ujung u ke garis v. Kakinya memberi komponen mendatar u, yaitu |u| cos θ. Untuk θ = 60°: 4 · ½ = 2.', 'v = (5, 0) on the x-axis and |u| = 4. Drop a perpendicular from the tip of u to the line of v. Its foot gives u’s horizontal component, |u| cos θ. At θ = 60°: 4 · ½ = 2.', String.raw`|u|\cos\theta=4\cos60^\circ=2`),
    f('Kalikan dengan |v| = 5 untuk mendapat u·v = 20 cos θ = 10. Vektor proyeksi adalah (u·v/|v|²) v = (10/25) v = 0,4 v = (2, 0): panah ungu tepat sampai kaki tegak lurus.', 'Multiply by |v| = 5 to get u·v = 20 cos θ = 10. The projection vector is (u·v/|v|²) v = (10/25) v = 0.4 v = (2, 0): the violet arrow ends exactly at the foot.', String.raw`\operatorname{proj}_vu=\frac{u\cdot v}{|v|^2}\,v=\frac{10}{25}(5,0)=(2,0)`),
    f('Geser θ. Lancip (hijau): proyeksi searah v dan u·v > 0. Tepat 90°: kaki jatuh di titik asal, u·v = 0. Tumpul (merah): proyeksi menunjuk berlawanan dan u·v < 0.', 'Move θ. Acute (green): the projection points along v and u·v > 0. Exactly 90°: the foot lands at the origin, u·v = 0. Obtuse (red): the projection points the other way and u·v < 0.', String.raw`\theta<90^\circ\Rightarrow u\cdot v>0,\quad \theta=90^\circ\Rightarrow u\cdot v=0`),
  ],
  readout: d => { const c = Math.cos(d * DEG); return String.raw`\theta=${d}^\circ:\ u\cdot v=20\cos\theta=${tx(20 * c)},\ \operatorname{proj}_vu=${tx(.8 * c)}\,v=(${tx(4 * c)},0)` },
  draw: (fr, d, lang) => {
    const t = tr(lang), th = d * DEG, c = Math.cos(th), O = dpm(0, 0), U = dpm(4 * c, 4 * Math.sin(th)), F = dpm(4 * c, 0), V = dpm(5, 0)
    const zero = Math.abs(c) < .02, sc = zero ? C.mu : c > 0 ? C.g : C.r
    return <>
      <At from={2} frame={fr}>
        <path d={`M${O[0]},${O[1]} L${O[0] + 150},${O[1]} A150 150 0 0 0 ${O[0]},${O[1] - 150} Z`} fill={C.g} fillOpacity=".1" />
        <path d={`M${O[0]},${O[1]} L${O[0]},${O[1] - 150} A150 150 0 0 0 ${O[0] - 150},${O[1]} Z`} fill={C.r} fillOpacity=".1" />
        <path d={`M${O[0]},${O[1]} V${O[1] - 158}`} stroke={C.mu} strokeDasharray="3 4" />
        <T x={O[0] + 112} y={O[1] - 128} size={14} weight={700} color={C.g}>u·v &gt; 0</T>
        <T x={O[0] - 112} y={O[1] - 128} size={14} weight={700} color={C.r}>u·v &lt; 0</T>
        <T x={O[0]} y={O[1] - 162} size={13} color={C.mu}>u·v = 0</T>
      </At>
      <path d={`M10,${O[1]} H470`} stroke={C.ln} strokeDasharray="2 6" />
      <path d={`M${U[0]},${U[1]} V${O[1]}`} stroke={C.y} strokeWidth="1.5" strokeDasharray="5 5" />
      {!zero && Math.sin(th) > .05 && <RA at={F} a={[0, -1]} c={[c > 0 ? -1 : 1, 0]} size={9} />}
      <At until={0} frame={fr}>
        <path d={`M${O[0]},${O[1] + 1} H${F[0]}`} stroke={sc} strokeWidth="9" strokeLinecap="round" opacity=".5" />
      </At>
      <At from={1} frame={fr}>
        {!zero && <Arrow from={O} to={F} color={C.v} width={5} />}
      </At>
      <Arrow from={O} to={V} color={C.a} width={3.5} />
      <T x={V[0] + 6} y={O[1] - 10} anchor="start" color={C.a} weight={700}>v</T>
      <Arrow from={O} to={U} color={C.fg} width={3.5} />
      <T x={U[0] + (c >= 0 ? 12 : -12)} y={U[1] + 4} anchor={c >= 0 ? 'start' : 'end'} weight={700}>u</T>
      <path d={arc(O, 30, 0, th)} fill="none" stroke={C.fg} strokeWidth="1.5" />
      <T x={O[0] + 44 * Math.cos(th / 2)} y={O[1] - 44 * Math.sin(th / 2) + 5} size={14}>θ</T>
      <At until={0} frame={fr}>
        <T x={240} y={262} size={15} color={sc} weight={600}>|u| cos θ = 4 · {fmt(c, 3)} = {fmt(4 * c)}</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={240} y={248} size={15}>u·v = 4 · 5 · cos θ = {fmt(20 * c)}</T>
        <T x={240} y={276} size={15} weight={700} color={C.v}>proj = ({fmt(20 * c)}/25) v = ({fmt(4 * c)}, 0)</T>
      </At>
      <At from={2} frame={fr}>
        <T x={240} y={262} size={16} weight={700} color={sc}>u·v = {fmt(20 * c)}: {zero ? t('tegak lurus', 'perpendicular') : c > 0 ? t('lancip', 'acute') : t('tumpul', 'obtuse')}</T>
      </At>
    </>
  },
}

// ================================================================ products:1 cross product and area
const cr = plane([110, 200], 30), c3 = ob([150, 165], 34)
const crossArea: Story = {
  title: b('Panjang u × v adalah luas jajar genjang', 'The length of u × v is a parallelogram area'),
  control: { label: b('Sudut θ antara u dan v (derajat)', 'Angle θ between u and v (degrees)'), min: 0, max: 180, step: 5, initial: 60 },
  frames: [
    f('u = (4, 0, 0) dan v panjangnya 3 dengan sudut θ. Alas jajar genjang |u| = 4, tingginya |v| sin θ = 3 sin θ. Luas = 12 sin θ; untuk θ = 60° itu ≈ 10,39.', 'u = (4, 0, 0) and v has length 3 at angle θ. The parallelogram’s base is |u| = 4, its height |v| sin θ = 3 sin θ. Area = 12 sin θ; at θ = 60° that is ≈ 10.39.', String.raw`S=|u|\,|v|\sin\theta=4\cdot3\sin\theta`),
    f('Grafik kanan: luas nol saat sejajar (θ = 0° atau 180°) karena jajar genjangnya gepeng, dan maksimum 12 saat tegak lurus (θ = 90°).', 'Right graph: the area is zero for parallel sides (θ = 0° or 180°) because the parallelogram is flat, and maximal, 12, at a right angle (θ = 90°).', String.raw`\theta=0^\circ,180^\circ\Rightarrow S=0;\quad \theta=90^\circ\Rightarrow S=12`),
    f('Dalam ruang, u × v = (0, 0, 12 sin θ): tegak lurus u dan v sekaligus, panjangnya tepat luas tadi. Aturan tangan kanan: jari dari u ke v, ibu jari ke atas.', 'In space, u × v = (0, 0, 12 sin θ): perpendicular to both u and v, with length exactly that area. Right-hand rule: fingers from u to v, thumb up.', String.raw`u\times v=(0,0,12\sin\theta),\quad |u\times v|=S`),
    f('Tukar urutannya: v × u menunjuk ke bawah dengan panjang sama. Luasnya sama, arahnya terbalik: v × u = −(u × v).', 'Swap the order: v × u points down with the same length. Same area, opposite direction: v × u = −(u × v).', String.raw`v\times u=-(u\times v)=(0,0,-12\sin\theta)`),
  ],
  readout: d => String.raw`\theta=${d}^\circ:\ S=12\sin${d}^\circ=${tx(12 * Math.sin(d * DEG))}`,
  draw: (fr, d, lang) => {
    const t = tr(lang), th = d * DEG, S = 12 * Math.sin(th), vx = 3 * Math.cos(th), vy = 3 * Math.sin(th)
    const O = cr(0, 0), U = cr(4, 0), V = cr(vx, vy), W = cr(4 + vx, vy), H = cr(vx, 0)
    const g = (a: number, s: number): P => [338 + 120 * a / 180, 172 - 5 * s]
    const n = S / 4, O3 = c3(0, 0, 0)
    return <>
      <At until={1} frame={fr}>
        <path d={`M14,${O[1]} H320`} stroke={C.ln} strokeDasharray="2 6" />
        <path d={pl([O, U, W, V], true)} fill={C.a} fillOpacity=".2" stroke={C.a} strokeWidth="1.5" />
        <path d={pl([V, H])} stroke={C.y} strokeWidth="2" strokeDasharray="5 4" />
        {vy > .2 && <RA at={H} a={[0, -1]} c={[1, 0]} size={8} />}
        <Arrow from={O} to={U} color={C.a} width={4} />
        <Arrow from={O} to={V} color={C.g} width={4} />
        <T x={cr(2, 0)[0]} y={O[1] + 24} color={C.a} weight={700}>u</T>
        <T x={V[0] + (vx >= 0 ? -10 : 10)} y={V[1] - 8} anchor={vx >= 0 ? 'end' : 'start'} color={C.g} weight={700}>v</T>
        {vy > .5 && <T x={H[0] + (vx > 2 ? -8 : 8)} y={(V[1] + H[1]) / 2 + 5} anchor={vx > 2 ? 'end' : 'start'} size={13} color={C.y}>{fmt(vy)}</T>}
        <path d={arc(O, 22, 0, th)} fill="none" stroke={C.fg} strokeWidth="1.5" />
      </At>
      <At until={0} frame={fr}>
        <T x={330} y={70} anchor="start" size={15} color={C.a}>{t('alas', 'base')} |u| = 4</T>
        <T x={330} y={96} anchor="start" size={15} color={C.y}>{t('tinggi', 'height')} = {fmt(vy)}</T>
        <T x={330} y={132} anchor="start" size={17} weight={700}>S = {fmt(S)}</T>
        <T x={330} y={156} anchor="start" size={13} color={C.mu}>= 4 · 3 sin {d}°</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <path d={`M338,172 H460 M338,172 V104`} stroke={C.ln} strokeWidth="1.4" />
        <path d={fn(a => g(a, 12 * Math.sin(a * DEG)), 0, 180)} fill="none" stroke={C.a} strokeWidth="2.5" />
        <path d={`M${g(d, 0)[0]},172 V${g(d, S)[1]}`} stroke={C.y} strokeDasharray="3 3" />
        <Dot at={g(d, S)} color={C.y} r={5} />
        <T x={338} y={190} size={12} color={C.mu}>0°</T>
        <T x={398} y={190} size={12} color={C.mu}>90°</T>
        <T x={458} y={190} size={12} color={C.mu} anchor="end">180°</T>
        <T x={344} y={98} anchor="start" size={13} color={C.mu}>S {t('maks', 'max')} = 12</T>
        <T x={338} y={224} anchor="start" size={16} weight={700} color={C.y}>S = {fmt(S)}</T>
        <T x={338} y={250} anchor="start" size={13} color={C.mu}>{Math.abs(S) < .05 ? t('sejajar: gepeng', 'parallel: flat') : d === 90 ? t('tegak lurus: maks', 'perpendicular: max') : ''}</T>
      </At>
      <At from={2} frame={fr}>
        <path d={pl([O3, c3(4, 0, 0), c3(4 + vx, vy, 0), c3(vx, vy, 0)], true)} fill={C.a} fillOpacity=".2" stroke={C.a} strokeWidth="1.5" />
        <Arrow from={O3} to={c3(4, 0, 0)} color={C.a} width={4} />
        <Arrow from={O3} to={c3(vx, vy, 0)} color={C.g} width={4} />
        <T x={c3(2, 0, 0)[0]} y={O3[1] + 24} color={C.a} weight={700}>u</T>
        <T x={c3(vx, vy, 0)[0] - 10} y={c3(vx, vy, 0)[1] - 6} anchor="end" color={C.g} weight={700}>v</T>
        {n > .1 && <Arrow from={O3} to={c3(0, 0, n)} color={C.v} width={4} />}
        <T x={O3[0] - 10} y={Math.min(c3(0, 0, n)[1] + 6, O3[1] - 10)} anchor="end" color={C.v} weight={700}>u × v</T>
        <T x={330} y={60} anchor="start" size={15} color={C.v}>u × v = (0, 0, S)</T>
        <T x={330} y={86} anchor="start" size={15}>S = {fmt(S)}</T>
        <T x={330} y={110} anchor="start" size={13} color={C.mu}>{t('panah digambar S/4', 'arrow drawn at S/4')}</T>
      </At>
      <At from={3} frame={fr}>
        {n > .1 && <Arrow from={O3} to={c3(0, 0, -n)} color={C.r} width={4} />}
        <T x={O3[0] - 10} y={Math.max(c3(0, 0, -n)[1], O3[1] + 22)} anchor="end" color={C.r} weight={700}>v × u</T>
        <T x={330} y={150} anchor="start" size={15} color={C.r}>v × u = (0, 0, −S)</T>
        <T x={330} y={176} anchor="start" size={15} color={C.r} weight={700}>= −(u × v)</T>
      </At>
    </>
  },
}

// ================================================================ products:2 triple product and volume
const tp = ob([110, 205], 34)
const triple: Story = {
  title: b('Hasil kali tripel: luas alas kali tinggi', 'Triple product: base area times height'),
  control: { label: b('Tinggi h pada w = (1, 1, h)', 'Height h in w = (1, 1, h)'), min: -2, max: 3, step: .5, initial: 2 },
  controlFrom: 1,
  frames: [
    f('Alas direntang u = (3, 0, 0) dan v = (0, 2, 0). Hasil kali silangnya u × v = (0, 0, 6): tegak lurus alas, dan panjangnya 6 = luas alas.', 'The base is spanned by u = (3, 0, 0) and v = (0, 2, 0). Their cross product u × v = (0, 0, 6): perpendicular to the base, with length 6 = the base area.', String.raw`u\times v=(0,0,6),\quad |u\times v|=6`),
    f('Rusuk ketiga w = (1, 1, h). Dot dengan u × v mengambil hanya komponen tegaknya: w·(u × v) = 6h. Itu luas alas 6 kali tinggi h, yaitu volume kotak miring. Untuk h = 2: 12.', 'The third edge w = (1, 1, h). Dotting with u × v keeps only its vertical part: w·(u × v) = 6h. That is base area 6 times height h, the volume of the slanted box. For h = 2: 12.', String.raw`\det(u,v,w)=\begin{vmatrix}3&0&0\\0&2&0\\1&1&h\end{vmatrix}=6h`),
    f('Volume ini bertanda. h < 0: w turun ke bawah alas dan determinan negatif (merah); volume geometris adalah nilai mutlaknya. h = 0: kotak runtuh menjadi bidang, ketiga vektor koplanar dan determinannya 0.', 'This volume is signed. h < 0: w dips below the base and the determinant is negative (red); the geometric volume is its absolute value. h = 0: the box collapses into a plane, the three vectors are coplanar and the determinant is 0.', String.raw`h=0:\ \det(u,v,w)=0\iff w\in\operatorname{span}(u,v)`),
  ],
  readout: h => String.raw`w=(1,1,${tx(h)}):\ \det(u,v,w)=6\cdot${tx(h)}=${tx(6 * h)}`,
  draw: (fr, hv, lang) => {
    const t = tr(lang), h = fr === 0 ? 2 : hv, base: [number, number, number][] = [[0, 0, 0], [3, 0, 0], [3, 2, 0], [0, 2, 0]]
    const top = base.map(([x, y, z]) => tp(x + 1, y + 1, z + h)), bs = base.map(([x, y, z]) => tp(x, y, z))
    const col = Math.abs(h) < 1e-9 ? C.y : h > 0 ? C.a : C.r
    return <>
      <path d={pl(bs, true)} fill={C.g} fillOpacity=".2" stroke={C.g} strokeWidth="2" />
      <Arrow from={bs[0]} to={bs[1]} color={C.g} width={3.5} />
      <Arrow from={bs[0]} to={bs[3]} color={C.g} width={3.5} />
      <T x={tp(1.5, 0, 0)[0]} y={bs[0][1] + 24} color={C.g} weight={700}>u</T>
      <T x={bs[3][0] - 10} y={bs[3][1] - 4} anchor="end" color={C.g} weight={700}>v</T>
      <At until={0} frame={fr}>
        <Arrow from={tp(1.5, 1, 0)} to={tp(1.5, 1, 2.4)} color={C.v} width={4} />
        <T x={tp(1.5, 1, 2.4)[0] + 12} y={tp(1.5, 1, 2.4)[1] + 4} anchor="start" color={C.v} weight={700}>u × v = (0, 0, 6)</T>
        <T x={tp(1.5, 1, 0)[0] + 30} y={tp(1.5, 1, 0)[1] + 6} anchor="start" size={14} color={C.g}>{t('luas', 'area')} 6</T>
        <T x={316} y={240} anchor="start" size={13} color={C.mu}>{t('panah: arah saja', 'arrow: direction only')}</T>
      </At>
      <At from={1} frame={fr}>
        {base.map((_, i) => <path key={i} d={pl([bs[i], top[i]])} stroke={col} strokeWidth="1.5" strokeOpacity=".8" />)}
        <path d={pl(top, true)} fill={col} fillOpacity=".18" stroke={col} strokeWidth="2" />
        <Arrow from={bs[0]} to={top[0]} color={col} width={3.5} />
        <T x={(bs[0][0] + top[0][0]) / 2 - 10} y={(bs[0][1] + top[0][1]) / 2} anchor="end" color={col} weight={700}>w</T>
        <path d={pl([top[0], tp(1, 1, 0)])} stroke={C.y} strokeWidth="2" strokeDasharray="5 4" />
        {Math.abs(h) > .3 && <T x={top[0][0] + 8} y={(top[0][1] + tp(1, 1, 0)[1]) / 2 + 5} anchor="start" size={14} weight={700} color={C.y}>h</T>}
        <T x={320} y={56} anchor="start" size={14} color={C.g}>u = (3, 0, 0)</T>
        <T x={320} y={78} anchor="start" size={14} color={C.g}>v = (0, 2, 0)</T>
        <T x={320} y={100} anchor="start" size={14} color={col}>w = (1, 1, {fmt(h)})</T>
        <T x={320} y={134} anchor="start" size={15}>det(u, v, w)</T>
        <T x={320} y={160} anchor="start" size={17} weight={700} color={col}>= 6 · {fmt(h)} = {fmt(6 * h)}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={320} y={196} anchor="start" size={14} weight={600} color={col}>{h > 0 ? t('positif', 'positive') : h < 0 ? t('negatif: terbalik', 'negative: flipped') : t('0: koplanar', '0: coplanar')}</T>
        <T x={320} y={220} anchor="start" size={13} color={C.mu}>{t('volume', 'volume')} = |6h| = {fmt(Math.abs(6 * h))}</T>
      </At>
    </>
  },
}

// ================================================================ plane:0 parametric line
const lp = plane([104, 236], 28)
const paramLine: Story = {
  title: b('Satu titik dan satu arah tidak nol', 'One point and one nonzero direction'),
  control: { label: b('Parameter t', 'Parameter t'), min: -2, max: 3, step: .5, initial: 1.5 },
  frames: [
    f('p = (1, 1) dan d = (2, 1). Setiap t memberi satu titik r = p + td; semua t bersama mengisi seluruh garis. Geser t: t negatif mundur melawan arah d.', 'p = (1, 1) and d = (2, 1). Each t gives one point r = p + td; all t together fill the whole line. Move t: negative t walks backwards against d.', String.raw`r=p+td,\quad \frac{x-1}{2}=\frac{y-1}{1}=t`),
    f('Mengapa d ≠ 0? Dengan d = (0, 0) setiap t memberi titik yang sama: r = p. Geser t, titiknya tidak bergerak. Tidak ada garis.', 'Why d ≠ 0? With d = (0, 0) every t gives the same point: r = p. Move t, the point does not move. There is no line.', String.raw`d=(0,0):\ r=p\ \ \forall t`),
    f('d = (2, 0) sah, tetapi komponen keduanya nol. Maka y = 1 tetap untuk semua t, garisnya mendatar. Jangan menulis (y − 1)/0: tulis (x − 1)/2 = t dan y = 1.', 'd = (2, 0) is valid, but its second component is zero. Then y = 1 stays fixed for every t, a horizontal line. Do not write (y − 1)/0: write (x − 1)/2 = t and y = 1.', String.raw`d=(2,0):\ \frac{x-1}{2}=t,\quad y=1`),
  ],
  readout: t => String.raw`t=${tx(t)}`,
  draw: (fr, tt, lang) => {
    const t = tr(lang), d: P = fr === 0 ? [2, 1] : fr === 1 ? [0, 0] : [2, 0]
    const p = lp(1, 1), r = lp(1 + d[0] * tt, 1 + d[1] * tt), tc = fr === 1 ? C.r : tt > 0 ? C.g : tt < 0 ? C.r : C.mu
    const ends: [P, P] = fr === 0 ? [lp(-3, -1), lp(7, 4)] : [lp(-3, 1), lp(7, 1)]
    return <>
      <Grid map={lp} x={[-3, 7]} y={[-1, 4]} />
      {fr !== 1 && <path d={pl(ends)} stroke={C.a} strokeWidth="2.5" strokeOpacity=".5" />}
      {fr !== 1 && [-2, -1, 0, 1, 2, 3].map(s => { const q = lp(1 + d[0] * s, 1 + d[1] * s); return <g key={s}><circle cx={q[0]} cy={q[1]} r={3} fill={C.mu} /><T x={q[0] + 6} y={q[1] + 20} size={12} color={C.mu}>{fmt(s)}</T></g> })}
      {fr !== 1 && tt !== 0 && <Arrow from={p} to={r} color={tc} width={6} />}
      {fr !== 1 && <Arrow from={p} to={lp(1 + d[0], 1 + d[1])} color={C.a} width={3.5} />}
      <Dot at={p} color={C.fg} />
      <T x={p[0] - 10} y={p[1] - 12} anchor="end" weight={700}>p</T>
      <Dot at={r} color={tc} r={fr === 1 ? 10 : 7} hollow={fr === 1} />
      {fr !== 1 && <T x={r[0] + 4} y={r[1] - 14} color={tc} weight={700}>r</T>}
      <T x={318} y={60} anchor="start" size={15}>t = {fmt(tt)}</T>
      <T x={318} y={86} anchor="start" size={15} color={fr === 1 ? C.r : C.a}>d = ({d[0]}, {d[1]})</T>
      <At until={0} frame={fr}>
        <T x={318} y={120} anchor="start" size={15}>x = 1 + 2t = {fmt(1 + 2 * tt)}</T>
        <T x={318} y={146} anchor="start" size={15}>y = 1 + t = {fmt(1 + tt)}</T>
        <T x={20} y={34} anchor="start" size={13} color={C.mu}>{t('angka kecil = nilai t', 'small numbers = values of t')}</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={318} y={120} anchor="start" size={15} color={C.r}>r = (1, 1)</T>
        <T x={318} y={146} anchor="start" size={13} color={C.mu}>{t('untuk setiap t', 'for every t')}</T>
        <T x={318} y={176} anchor="start" size={15} weight={700} color={C.r}>{t('bukan garis', 'not a line')}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={318} y={120} anchor="start" size={15}>x = 1 + 2t = {fmt(1 + 2 * tt)}</T>
        <T x={318} y={146} anchor="start" size={15} color={C.g} weight={600}>y = 1 {t('(tetap)', '(fixed)')}</T>
        <T x={318} y={182} anchor="start" size={15} color={C.r}>(y − 1)/0 ✗</T>
      </At>
    </>
  },
}

// ================================================================ plane:1 plane through points, two-plane intersection
const pp = ob([170, 205], 50), o3 = ob([175, 165], 48)
const planePts: Story = {
  title: b('Normal dari tiga titik, garis dari dua normal', 'A normal from three points, a line from two normals'),
  frames: [
    f('Tiga titik tidak segaris: A = (2, 0, 0), B = (0, 2, 0), C = (0, 0, 2). Dua arah di bidang: AB = (−2, 2, 0) dan AC = (−2, 0, 2). Normalnya AB × AC = (4, 4, 4).', 'Three noncollinear points: A = (2, 0, 0), B = (0, 2, 0), C = (0, 0, 2). Two directions in the plane: AB = (−2, 2, 0) and AC = (−2, 0, 2). The normal is AB × AC = (4, 4, 4).', String.raw`n=\overrightarrow{AB}\times\overrightarrow{AC}=(4,4,4)`),
    f('Normal tegak lurus semua arah di bidang: n·AB = −8 + 8 + 0 = 0 dan n·AC = 0. Titik r ada di bidang tepat jika n·(r − A) = 0, yaitu 4(x − 2) + 4y + 4z = 0, atau x + y + z = 2.', 'The normal is perpendicular to every direction in the plane: n·AB = −8 + 8 + 0 = 0 and n·AC = 0. A point r is in the plane exactly when n·(r − A) = 0, that is 4(x − 2) + 4y + 4z = 0, or x + y + z = 2.', String.raw`n\cdot(r-A)=0\iff x+y+z=2`),
    f('Dua bidang x = 0 dan y = 0 punya normal e₁ dan e₂. Garis potongnya ada di kedua bidang, jadi tegak lurus kedua normal: arahnya e₁ × e₂ = e₃. Itulah sumbu z.', 'The planes x = 0 and y = 0 have normals e₁ and e₂. Their common line lies in both planes, so it is perpendicular to both normals: its direction is e₁ × e₂ = e₃. That is the z-axis.', String.raw`d=n_1\times n_2=e_1\times e_2=e_3`),
  ],
  draw: (fr, _v, lang) => {
    const t = tr(lang), A = pp(2, 0, 0), B = pp(0, 2, 0), Cc = pp(0, 0, 2), G = pp(2 / 3, 2 / 3, 2 / 3), N = pp(1.75, 1.75, 1.75)
    return <>
      <At until={1} frame={fr}>
        {[[2.7, 0, 0], [0, 2.7, 0], [0, 0, 2.6]].map(([x, y, z], i) => <path key={i} d={pl([pp(0, 0, 0), pp(x, y, z)])} stroke={C.ln} strokeWidth="1.4" />)}
        <T x={pp(2.7, 0, 0)[0] + 4} y={pp(2.7, 0, 0)[1] + 18} size={13} color={C.mu}>x</T>
        <T x={pp(0, 2.7, 0)[0] + 10} y={pp(0, 2.7, 0)[1]} size={13} color={C.mu}>y</T>
        <T x={pp(0, 0, 2.6)[0] - 10} y={pp(0, 0, 2.6)[1] + 4} size={13} color={C.mu}>z</T>
        <path d={pl([A, B, Cc], true)} fill={C.a} fillOpacity=".2" stroke={C.a} strokeWidth="2" />
        <Arrow from={A} to={B} color={C.g} width={3.5} />
        <Arrow from={A} to={Cc} color={C.y} width={3.5} />
        <Arrow from={G} to={N} color={C.v} width={4} />
        {[A, B, Cc].map((q, i) => <Dot key={i} at={q} color={C.fg} r={5} />)}
        <T x={A[0] + 4} y={A[1] + 22} weight={700}>A</T>
        <T x={B[0] - 2} y={B[1] + 22} weight={700}>B</T>
        <T x={Cc[0] - 12} y={Cc[1] - 4} anchor="end" weight={700}>C</T>
        <T x={N[0] - 8} y={N[1] - 8} anchor="end" color={C.v} weight={700}>n</T>
        <T x={(A[0] + B[0]) / 2 + 14} y={(A[1] + B[1]) / 2 + 2} anchor="start" size={14} color={C.g} weight={700}>AB</T>
        <T x={(A[0] + Cc[0]) / 2 - 10} y={(A[1] + Cc[1]) / 2 - 6} anchor="end" size={14} color={C.y} weight={700}>AC</T>
      </At>
      <At until={0} frame={fr}>
        <T x={330} y={110} anchor="start" size={14} color={C.g}>AB = (−2, 2, 0)</T>
        <T x={330} y={134} anchor="start" size={14} color={C.y}>AC = (−2, 0, 2)</T>
        <T x={330} y={170} anchor="start" size={15} weight={700} color={C.v}>n = (4, 4, 4)</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={330} y={110} anchor="start" size={14}>n·AB = 0 ✓</T>
        <T x={330} y={134} anchor="start" size={14}>n·AC = 0 ✓</T>
        <T x={330} y={170} anchor="start" size={15} weight={700} color={C.a}>x + y + z = 2</T>
        <T x={330} y={196} anchor="start" size={13} color={C.mu}>A: 2 + 0 + 0 = 2 ✓</T>
      </At>
      <At from={2} frame={fr}>
        <path d={page(o3, [0, 1])} fill={C.g} fillOpacity=".14" stroke={C.g} strokeWidth="2" />
        <path d={page(o3, [1, 0])} fill={C.y} fillOpacity=".14" stroke={C.y} strokeWidth="2" />
        <path d={pl([o3(0, 0, -1.9), o3(0, 0, 1.9)])} stroke={C.v} strokeWidth="4" />
        <Arrow from={o3(0, 0, 1.5)} to={o3(0, 0, 2.35)} color={C.v} width={4} />
        <Arrow from={o3(0, 0, 0)} to={o3(1.3, 0, 0)} color={C.g} width={3} head={9} />
        <Arrow from={o3(0, 0, 0)} to={o3(0, 1.5, 0)} color={C.y} width={3} head={9} />
        <T x={o3(1.3, 0, 0)[0] + 6} y={o3(1.3, 0, 0)[1] + 18} anchor="start" color={C.g} weight={700} size={15}>e₁</T>
        <T x={o3(0, 1.5, 0)[0] + 8} y={o3(0, 1.5, 0)[1] + 4} anchor="start" color={C.y} weight={700} size={15}>e₂</T>
        <T x={o3(0, 0, 2.35)[0] + 12} y={o3(0, 0, 2.35)[1] + 8} anchor="start" color={C.v} weight={700} size={15}>e₃</T>
        <T x={330} y={70} anchor="start" size={14} color={C.g}>x = 0: n₁ = e₁</T>
        <T x={330} y={94} anchor="start" size={14} color={C.y}>y = 0: n₂ = e₂</T>
        <T x={330} y={130} anchor="start" size={15} weight={700} color={C.v}>e₁ × e₂ = e₃</T>
        <T x={330} y={154} anchor="start" size={13} color={C.mu}>{t('= sumbu z', '= the z-axis')}</T>
      </At>
      <T x={470} y={284} anchor="end" size={12} color={C.mu}>{t('skema, bukan skala', 'schematic, not to scale')}</T>
    </>
  },
}

// ================================================================ plane:2 plane pencils
const pc = ob([175, 170], 48)
const pencilPlanes: Story = {
  title: b('Pensil bidang: semua halaman memuat satu poros', 'A pencil of planes: every page holds one spine'),
  control: { label: b('Sudut θ: λ = cos θ, μ = sin θ', 'Angle θ: λ = cos θ, μ = sin θ'), min: 0, max: 180, step: 15, initial: 45 },
  controlFrom: 1,
  frames: [
    f('Dua bidang dasar π₁: x = 0 dan π₂: y = 0 berpotongan di sumbu z. Setiap titik (0, 0, z) memenuhi kedua persamaan.', 'Two base planes π₁: x = 0 and π₂: y = 0 meet in the z-axis. Every point (0, 0, z) satisfies both equations.', String.raw`\pi_1:\ x=0,\quad \pi_2:\ y=0`),
    f('Gabungkan: λx + μy = 0 dengan λ = cos θ, μ = sin θ. Titik (0, 0, z) memberi λ·0 + μ·0 = 0, jadi setiap anggota memuat sumbu z. Geser θ: bidang berputar seperti halaman buku. (λ, μ) = (0, 0) dilarang, karena 0 = 0 bukan bidang.', 'Combine: λx + μy = 0 with λ = cos θ, μ = sin θ. A point (0, 0, z) gives λ·0 + μ·0 = 0, so every member contains the z-axis. Move θ: the plane turns like a book page. (λ, μ) = (0, 0) is forbidden, since 0 = 0 is not a plane.', String.raw`\lambda\pi_1+\mu\pi_2=0,\quad(\lambda,\mu)\ne(0,0)`),
    f('Pensil menjawab soal: bidang mana melalui P = (−1, 1, 1) dan memuat sumbu z? Masukkan P: −λ + μ = 0, jadi λ = μ dan bidangnya x + y = 0 (θ = 45°). Geser θ ke 45°.', 'The pencil solves problems: which plane through P = (−1, 1, 1) contains the z-axis? Plug in P: −λ + μ = 0, so λ = μ and the plane is x + y = 0 (θ = 45°). Move θ to 45°.', String.raw`P:\ -\lambda+\mu=0\Rightarrow x+y=0`),
  ],
  readout: d => { const l = Math.cos(d * DEG), m = Math.sin(d * DEG); return String.raw`\theta=${d}^\circ:\ ${tx(l)}\,x+${tx(m)}\,y=0` },
  draw: (fr, dv, lang) => {
    const t = tr(lang), d = fr === 0 ? 45 : dv, th = d * DEG, l = Math.cos(th), m = Math.sin(th), u: [number, number] = [-m, l]
    const atP = -l + m, hit = Math.abs(atP) < 1e-6, P0 = pc(-1, 1, 1)
    return <>
      <path d={pl([pc(0, 0, -2), pc(0, 0, 2.15)])} stroke={C.v} strokeWidth="2" strokeOpacity=".35" />
      <g opacity={fr === 0 ? 1 : .35} style={{ transition: 'opacity .45s' }}>
        <path d={page(pc, [0, 1])} fill={C.g} fillOpacity=".14" stroke={C.g} strokeWidth="2" />
        <path d={page(pc, [1, 0])} fill={C.y} fillOpacity=".14" stroke={C.y} strokeWidth="2" />
      </g>
      <At until={0} frame={fr}>
        <T x={pc(0, 2.1, 1.5)[0] + 4} y={pc(0, 2.1, 1.5)[1] - 8} anchor="start" color={C.g} weight={700} size={15}>π₁: x = 0</T>
        <T x={pc(2.1, 0, 1.5)[0] - 4} y={pc(2.1, 0, 1.5)[1] - 10} anchor="end" color={C.y} weight={700} size={15}>π₂: y = 0</T>
        <T x={330} y={250} anchor="start" size={14} color={C.v}>π₁ ∩ π₂ = {t('sumbu z', 'z-axis')}</T>
      </At>
      <At from={1} frame={fr}>
        <path d={page(pc, u)} fill={C.a} fillOpacity=".22" stroke={C.a} strokeWidth="3" />
        <T x={330} y={60} anchor="start" size={15}>θ = {d}°</T>
        <T x={330} y={86} anchor="start" size={14}>λ = {fmt(l)}, μ = {fmt(m)}</T>
        <T x={330} y={114} anchor="start" size={15} weight={700} color={C.a}>{fmt(l)}x + {fmt(m)}y = 0</T>
        <T x={330} y={140} anchor="start" size={13} color={C.mu}>(0, 0, z): 0 = 0 ✓</T>
      </At>
      <path d={pl([pc(0, 0, -1.9), pc(0, 0, 1.9)])} stroke={C.v} strokeWidth="4" />
      <T x={pc(0, 0, 2.15)[0] + 10} y={pc(0, 0, 2.15)[1] + 4} anchor="start" size={14} color={C.v} weight={700}>z</T>
      <At from={2} frame={fr}>
        <Dot at={P0} color={hit ? C.g : C.r} r={7} />
        <T x={P0[0] - 10} y={P0[1] - 8} anchor="end" weight={700} color={hit ? C.g : C.r}>P</T>
        <T x={330} y={180} anchor="start" size={14}>P = (−1, 1, 1)</T>
        <T x={330} y={204} anchor="start" size={14} color={hit ? C.g : C.r}>−λ + μ = {fmt(atP)}</T>
        <T x={330} y={228} anchor="start" size={13} color={hit ? C.g : C.mu}>{hit ? t('P di bidang ✓', 'P is on it ✓') : t('belum: geser θ', 'not yet: move θ')}</T>
      </At>
      <T x={470} y={284} anchor="end" size={12} color={C.mu}>{t('skema, bukan skala', 'schematic, not to scale')}</T>
    </>
  },
}

// ================================================================ projection:0 angles with the normal
const AO: P = [150, 200]
const anglesNormal: Story = {
  title: b('Sudut garis dan bidang adalah pelengkap sudut dengan normal', 'The line–plane angle complements the angle with the normal'),
  control: { label: b('Arah d = (4, m): m', 'Direction d = (4, m): m'), min: 0, max: 8, step: 1, initial: 3 },
  frames: [
    f('Irisan 2D: garis mendatar mewakili bidang π, normal n = (0, 1) tegak di atasnya. d = (4, 3) membuat sudut α dengan bidang dan β dengan normal. Keduanya selalu berjumlah 90°.', '2D section: the horizontal line represents the plane π, with normal n = (0, 1) standing on it. d = (4, 3) makes angle α with the plane and β with the normal. They always add to 90°.', String.raw`\alpha+\beta=90^\circ`),
    f('Dot product hanya memberi sudut dengan normal: cos β = |n·d|/(|n||d|) = 3/5. Karena α = 90° − β, angka yang sama adalah sin α. Jadi sudut garis dan bidang memakai sinus: α ≈ 36,87°.', 'The dot product only gives the angle with the normal: cos β = |n·d|/(|n||d|) = 3/5. Since α = 90° − β, the same number is sin α. So the line–plane angle uses a sine: α ≈ 36.87°.', String.raw`\sin\alpha=\cos\beta=\frac{|n\cdot d|}{|n||d|}=\frac{3}{\sqrt{4^2+3^2}}=\frac35`),
    f('Dua bidang: sudutnya sama dengan sudut kedua normal, jadi memakai kosinus. π₂ miring searah (4, 3), normalnya n₂ = (−3, 4): cos φ = |n₁·n₂|/(|n₁||n₂|) = 4/5, φ ≈ 36,87°. Dua garis memakai arahnya dengan cara yang sama.', 'Two planes: their angle equals the angle between the normals, so it uses a cosine. π₂ tilts along (4, 3), its normal n₂ = (−3, 4): cos φ = |n₁·n₂|/(|n₁||n₂|) = 4/5, φ ≈ 36.87°. Two lines use their directions the same way.', String.raw`\cos\varphi=\frac{|n_1\cdot n_2|}{|n_1||n_2|}=\frac{4}{5}`),
  ],
  readout: m => { const L = Math.hypot(4, m), a = Math.atan2(m, 4) / DEG; return String.raw`d=(4,${m}):\ \sin\alpha=\frac{${m}}{${tx(L)}},\ \alpha=${tx(a)}^\circ,\ \beta=${tx(90 - a)}^\circ` },
  draw: (fr, m) => {
    const L = Math.hypot(4, m), a = Math.atan2(m, 4), ad = a / DEG
    const D: P = [AO[0] + 150 * Math.cos(a), AO[1] - 150 * Math.sin(a)], N: P = [AO[0], AO[1] - 120]
    const N2: P = [AO[0] - 110 * Math.sin(a), AO[1] - 110 * Math.cos(a)]
    return <>
      <path d={`M20,${AO[1]} H300`} stroke={C.a} strokeWidth="3.5" />
      <T x={24} y={AO[1] + 24} anchor="start" color={C.a} weight={700}>π</T>
      <Arrow from={AO} to={N} color={C.v} width={3.5} />
      <T x={N[0] + 10} y={N[1] + 6} anchor="start" color={C.v} weight={700}>n</T>
      <At until={1} frame={fr}>
        <Arrow from={AO} to={D} color={C.fg} width={3.5} />
        <T x={D[0] + 10} y={D[1] + 4} anchor="start" weight={700}>d</T>
        {a > .02 && <path d={arc(AO, 56, 0, a)} fill="none" stroke={C.g} strokeWidth="2.5" />}
        <path d={arc(AO, 36, a, Math.PI / 2)} fill="none" stroke={C.y} strokeWidth="2.5" />
        {a > .2 && <T x={AO[0] + 74 * Math.cos(a / 2)} y={AO[1] - 74 * Math.sin(a / 2) + 5} color={C.g} weight={700}>α</T>}
        <T x={AO[0] + 52 * Math.cos((a + Math.PI / 2) / 2)} y={AO[1] - 52 * Math.sin((a + Math.PI / 2) / 2) + 5} color={C.y} weight={700}>β</T>
        <T x={316} y={60} anchor="start" size={15}>d = (4, {m})</T>
      </At>
      <At until={0} frame={fr}>
        <T x={316} y={96} anchor="start" size={15} color={C.g}>α = {fmt(ad)}°</T>
        <T x={316} y={122} anchor="start" size={15} color={C.y}>β = {fmt(90 - ad)}°</T>
        <T x={316} y={156} anchor="start" size={16} weight={700}>α + β = 90°</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={316} y={96} anchor="start" size={15}>n·d = {m}</T>
        <T x={316} y={122} anchor="start" size={15}>|n||d| = {fmt(L)}</T>
        <T x={316} y={156} anchor="start" size={15} color={C.y}>cos β = {fmt(m / L, 3)}</T>
        <T x={316} y={182} anchor="start" size={16} weight={700} color={C.g}>= sin α</T>
      </At>
      <At from={2} frame={fr}>
        <Clip id="ga-pi2" x={12} y={14} w={300} h={272}>
          <path d={pl([[AO[0] - 160 * Math.cos(a), AO[1] + 160 * Math.sin(a)], [AO[0] + 160 * Math.cos(a), AO[1] - 160 * Math.sin(a)]])} stroke={C.g} strokeWidth="3.5" />
        </Clip>
        <Arrow from={AO} to={N2} color={C.g} width={3} />
        <T x={N2[0] - 8} y={N2[1] - 6} anchor="end" color={C.g} weight={700}>n₂</T>
        <T x={AO[0] + 150 * Math.cos(a) + 6} y={AO[1] - 150 * Math.sin(a) - 8} anchor="start" color={C.g} weight={700}>π₂</T>
        {a > .02 && <path d={arc(AO, 70, 0, a)} fill="none" stroke={C.y} strokeWidth="2.5" />}
        {a > .02 && <path d={arc(AO, 40, Math.PI / 2, Math.PI / 2 + a)} fill="none" stroke={C.y} strokeWidth="2.5" />}
        {a > .2 && <T x={AO[0] + 86 * Math.cos(a / 2)} y={AO[1] - 86 * Math.sin(a / 2) + 5} color={C.y} weight={700}>φ</T>}
        {a > .2 && <T x={AO[0] + 54 * Math.cos(Math.PI / 2 + a / 2)} y={AO[1] - 54 * Math.sin(Math.PI / 2 + a / 2) + 5} color={C.y} weight={700}>φ</T>}
        <T x={316} y={60} anchor="start" size={15} color={C.v}>n₁ = (0, 1)</T>
        <T x={316} y={86} anchor="start" size={15} color={C.g}>n₂ = ({m === 0 ? 0 : `−${m}`}, 4)</T>
        <T x={316} y={120} anchor="start" size={15}>cos φ = 4/{fmt(L)}</T>
        <T x={316} y={146} anchor="start" size={16} weight={700} color={C.y}>φ = {fmt(ad)}°</T>
      </At>
    </>
  },
}

// ================================================================ projection:1 point-to-line distance
const pq = plane([40, 150], 34)
const pointLine: Story = {
  title: b('Jarak titik ke garis: tinggi jajar genjang', 'Point-to-line distance: a parallelogram’s height'),
  control: { label: b('P = (2, h): h', 'P = (2, h): h'), min: -3, max: 3, step: .5, initial: 2 },
  frames: [
    f('Garis ℓ adalah sumbu x melalui A = (0, 0), dan P = (2, h). Kaki tegak lurus H = (2, 0), jadi jaraknya |h|. Jalan miring AP = √(4 + h²) selalu lebih panjang.', 'The line ℓ is the x-axis through A = (0, 0), and P = (2, h). The perpendicular foot is H = (2, 0), so the distance is |h|. The slanted path AP = √(4 + h²) is always longer.', String.raw`\operatorname{dist}(P,\ell)=|PH|=|h|`),
    f('Arah garis d = (3, 0). Jajar genjang pada d dan P − A = (2, h) punya alas |d| = 3 dan tinggi |h|. Hasil kali silang mengukur luasnya: |(P − A) × d| = |2·0 − h·3| = 3|h|. Bagi dengan alas 3: tersisa |h|.', 'Line direction d = (3, 0). The parallelogram on d and P − A = (2, h) has base |d| = 3 and height |h|. The cross product measures its area: |(P − A) × d| = |2·0 − h·3| = 3|h|. Divide by the base 3: |h| remains.', String.raw`\frac{|(P-A)\times d|}{|d|}=\frac{3|h|}{3}=|h|`),
    f('Ganti d dengan (6, 0). Luasnya menjadi 6|h|, tetapi alasnya juga 6, jadi hasil bagi tetap |h|. Panjang arah tidak mengubah jarak.', 'Replace d by (6, 0). The area becomes 6|h|, but the base is also 6, so the quotient is still |h|. The length of the direction does not change the distance.', String.raw`\frac{6|h|}{6}=|h|`),
  ],
  readout: h => String.raw`h=${tx(h)}:\ \operatorname{dist}=${tx(Math.abs(h))},\quad |AP|=\sqrt{4+${tx(h * h)}}=${tx(Math.hypot(2, h))}`,
  draw: (fr, h, lang) => {
    const t = tr(lang), A = pq(0, 0), P = pq(2, h), H = pq(2, 0), dl = fr === 2 ? 6 : 3, up = h >= 0 ? 1 : -1
    return <>
      <Grid map={pq} x={[-0.5, 8]} y={[-3, 3]} axes={false} />
      <path d={`M14,${A[1]} H312`} stroke={C.a} strokeWidth="3" />
      <T x={300} y={A[1] + 22} anchor="end" color={C.a} weight={700}>ℓ</T>
      <At from={1} frame={fr}>
        <path d={pl([A, pq(dl, 0), pq(dl + 2, h), P], true)} fill={C.y} fillOpacity=".18" stroke={C.y} strokeWidth="1.5" />
        <Arrow from={A} to={pq(dl, 0)} color={C.v} width={5} />
        <Arrow from={A} to={P} color={C.y} width={2.5} />
        <T x={pq(dl, 0)[0] - 4} y={A[1] - up * 10 + (up > 0 ? 18 : 6)} color={C.v} weight={700} anchor="end">d</T>
        {Math.abs(h) > .3 && <T x={pq(dl / 2 + 2, h / 2)[0]} y={pq(dl / 2 + 2, h / 2)[1] + 5} size={14} weight={600}>{t('luas', 'area')} {fmt(dl * Math.abs(h))}</T>}
      </At>
      <At until={0} frame={fr}>
        <path d={pl([A, P])} stroke={C.r} strokeWidth="2.5" strokeDasharray="7 5" />
        {Math.abs(h) > .3 && <T x={(A[0] + P[0]) / 2 - 10} y={(A[1] + P[1]) / 2 - 4} anchor="end" size={14} color={C.r} weight={600}>{fmt(Math.hypot(2, h))}</T>}
      </At>
      <path d={pl([P, H])} stroke={C.g} strokeWidth="4" />
      {Math.abs(h) > .3 && <RA at={H} a={[0, -up]} c={[-1, 0]} size={9} />}
      {Math.abs(h) > .3 && <T x={H[0] + 8} y={(H[1] + P[1]) / 2 + 5} anchor="start" size={14} color={C.g} weight={700}>{fmt(Math.abs(h))}</T>}
      <Dot at={A} color={C.fg} r={5} />
      <T x={A[0] - 4} y={A[1] + (up > 0 ? 22 : -10)} anchor="end" weight={700}>A</T>
      <Dot at={P} color={C.fg} r={7} />
      <T x={P[0] - 4} y={P[1] - up * 14 + (up > 0 ? 0 : 6)} anchor="end" weight={700}>P</T>
      <At until={0} frame={fr}>
        <T x={325} y={70} anchor="start" size={15}>P = (2, {fmt(h)})</T>
        <T x={325} y={104} anchor="start" size={15} color={C.g} weight={700}>PH = |h| = {fmt(Math.abs(h))}</T>
        <T x={325} y={130} anchor="start" size={15} color={C.r}>AP = √(4 + h²)</T>
        <T x={325} y={156} anchor="start" size={15} color={C.r}>= {fmt(Math.hypot(2, h))}</T>
      </At>
      <At from={1} frame={fr}>
        <T x={325} y={60} anchor="start" size={14} color={C.v}>d = ({dl}, 0)</T>
        <T x={325} y={84} anchor="start" size={14} color={C.y}>P − A = (2, {fmt(h)})</T>
        <T x={325} y={116} anchor="start" size={14}>|(P − A) × d|</T>
        <T x={325} y={140} anchor="start" size={14}>= {dl}|h| = {fmt(dl * Math.abs(h))}</T>
        <T x={325} y={174} anchor="start" size={15} weight={700} color={C.g}>÷ {dl} = {fmt(Math.abs(h))}</T>
      </At>
    </>
  },
}

// ================================================================ projection:2 distance between skew lines
const sk = ob([110, 250], 34)
const skewDist: Story = {
  title: b('Jarak garis bersilangan lewat normal bersama', 'Skew-line distance through the common normal'),
  control: { label: b('Ketinggian h garis kedua', 'Height h of the second line'), min: 0, max: 3, step: .5, initial: 2 },
  frames: [
    f('ℓ₁ = (t, 0, 0) berarah x di lantai z = 0. ℓ₂ = (2, s, h) berarah y di langit-langit z = h. Untuk h = 2 keduanya tidak sejajar dan tidak pernah bertemu: bersilangan.', 'ℓ₁ = (t, 0, 0) runs along x on the floor z = 0. ℓ₂ = (2, s, h) runs along y on the ceiling z = h. For h = 2 they are not parallel and never meet: skew.', String.raw`\ell_1:\ (t,0,0),\quad \ell_2:\ (2,s,h)`),
    f('n = d₁ × d₂ = (1, 0, 0) × (0, 1, 0) = (0, 0, 1) tegak lurus kedua arah. Ruas merah sejajar n dari (2, 0, 0) ke (2, 0, h) menyentuh kedua garis secara tegak lurus: panjangnya |h| = 2, jalan terpendek.', 'n = d₁ × d₂ = (1, 0, 0) × (0, 1, 0) = (0, 0, 1) is perpendicular to both directions. The red segment along n from (2, 0, 0) to (2, 0, h) meets both lines at right angles: its length |h| = 2 is the shortest path.', String.raw`n=d_1\times d_2=(0,0,1)`),
    f('Rumusnya memakai titik mana saja: A₁ = (0, 0, 0) dan A₂ = (2, 1, 2). A₂ − A₁ panjangnya 3, tetapi komponennya pada n hanya 2. Jarak = |(A₂ − A₁)·n|/|n| = 2/1 = 2. Di h = 0 garisnya berpotongan.', 'The formula works with any points: A₁ = (0, 0, 0) and A₂ = (2, 1, 2). A₂ − A₁ has length 3, but its component along n is only 2. Distance = |(A₂ − A₁)·n|/|n| = 2/1 = 2. At h = 0 the lines intersect.', String.raw`d=\frac{|(A_2-A_1)\cdot(d_1\times d_2)|}{|d_1\times d_2|}=\frac{|(2,1,2)\cdot(0,0,1)|}{1}=2`),
  ],
  readout: h => String.raw`h=${tx(h)}:\ (A_2-A_1)\cdot n=(2,1,${tx(h)})\cdot(0,0,1)=${tx(h)}`,
  draw: (fr, h, lang) => {
    const t = tr(lang), rect = (z: number) => pl([sk(-1, -2, z), sk(4, -2, z), sk(4, 3, z), sk(-1, 3, z)], true)
    const B1 = sk(2, 0, 0), B2 = sk(2, 0, h), A1 = sk(0, 0, 0), A2 = sk(2, 1, h), A2f = sk(2, 1, 0)
    return <>
      <path d={rect(0)} fill={C.soft} fillOpacity=".45" stroke={C.ln} />
      {h > 0 && <path d={rect(h)} fill={C.soft} fillOpacity=".15" stroke={C.ln} strokeDasharray="4 4" />}
      <T x={sk(-1, -2, 0)[0] + 4} y={sk(-1, -2, 0)[1] - 6} anchor="start" size={12} color={C.mu}>z = 0</T>
      {h > 0 && <T x={sk(-1, -2, h)[0] + 4} y={sk(-1, -2, h)[1] - 6} anchor="start" size={12} color={C.mu}>z = {fmt(h)}</T>}
      <path d={pl([sk(-1, 0, 0), sk(4, 0, 0)])} stroke={C.a} strokeWidth="3.5" />
      <T x={sk(4, 0, 0)[0] + 6} y={sk(4, 0, 0)[1] + 18} anchor="start" color={C.a} weight={700}>ℓ₁</T>
      <At from={2} frame={fr}>
        <path d={pl([A1, A2f])} stroke={C.mu} strokeWidth="1.5" strokeDasharray="3 4" />
        <path d={pl([A2f, A2])} stroke={C.y} strokeWidth="2" strokeDasharray="5 4" />
        <Arrow from={A1} to={A2} color={C.y} width={3} />
        <Dot at={A1} color={C.y} r={5} />
        <T x={A1[0] - 8} y={A1[1] + 18} anchor="end" weight={700} color={C.y}>A₁</T>
      </At>
      <path d={pl([sk(2, -2, h), sk(2, 3, h)])} stroke={C.g} strokeWidth="3.5" />
      <T x={sk(2, 3, h)[0] + 6} y={sk(2, 3, h)[1] - 4} anchor="start" color={C.g} weight={700}>ℓ₂</T>
      <At from={1} frame={fr}>
        {h > 0 && <g>
          <path d={pl([B1, B2])} stroke={C.r} strokeWidth="3.5" />
          <RA at={B1} a={[1, 0]} c={[0, -1]} size={9} />
          <RA at={B2} a={[.55, -.35]} c={[0, 1]} size={9} />
          <T x={B1[0] - 8} y={(B1[1] + B2[1]) / 2 + 5} anchor="end" color={C.r} weight={700}>{fmt(h)}</T>
        </g>}
      </At>
      <At from={2} frame={fr}>
        <Dot at={A2} color={C.y} r={5} />
        <T x={A2[0] + 8} y={A2[1] - 8} anchor="start" weight={700} color={C.y}>A₂</T>
      </At>
      {h === 0 && <Dot at={B1} color={C.r} r={6} />}
      <At until={0} frame={fr}>
        <T x={312} y={60} anchor="start" size={14} color={C.a}>d₁ = (1, 0, 0)</T>
        <T x={312} y={84} anchor="start" size={14} color={C.g}>d₂ = (0, 1, 0)</T>
        <T x={312} y={118} anchor="start" size={14} color={h > 0 ? C.fg : C.r}>{h > 0 ? t('tidak bertemu', 'never meet') : t('h = 0: berpotongan', 'h = 0: they meet')}</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={312} y={60} anchor="start" size={14} color={C.r}>n = d₁ × d₂</T>
        <T x={312} y={84} anchor="start" size={14} color={C.r}>= (0, 0, 1)</T>
        <T x={312} y={118} anchor="start" size={16} weight={700} color={C.r}>{t('jarak', 'dist')} = {fmt(h)}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={312} y={60} anchor="start" size={14} color={C.y}>A₂ − A₁ = (2, 1, {fmt(h)})</T>
        <T x={312} y={84} anchor="start" size={14}>|A₂ − A₁| = {fmt(Math.hypot(2, 1, h))}</T>
        <T x={312} y={112} anchor="start" size={14}>· n = {fmt(h)}, |n| = 1</T>
        <T x={312} y={142} anchor="start" size={16} weight={700} color={C.r}>{t('jarak', 'dist')} = {fmt(h)}</T>
      </At>
      <T x={470} y={284} anchor="end" size={12} color={C.mu}>{t('skema', 'schematic')}</T>
    </>
  },
}

// ================================================================ power:0 centre and radius
const cp = plane([94, 116], 32), CO = cp(2, -1)
const completeSq: Story = {
  title: b('Melengkapkan kuadrat: pusat dan radius', 'Completing the square: centre and radius'),
  control: { label: b('Konstanta σ', 'Constant σ'), min: -11, max: 8, step: 1, initial: -4 },
  frames: [
    f('x² + y² − 4x + 2y + σ = 0. Lengkapkan kuadrat: x² − 4x = (x − 2)² − 4 dan y² + 2y = (y + 1)² − 1. Pusatnya terbaca langsung: (2, −1), apa pun σ.', 'x² + y² − 4x + 2y + σ = 0. Complete the squares: x² − 4x = (x − 2)² − 4 and y² + 2y = (y + 1)² − 1. The centre reads off directly: (2, −1), whatever σ is.', String.raw`(x-2)^2+(y+1)^2=5-\sigma`),
    f('Pindahkan konstanta ke kanan: R² = α² + β² − σ = 4 + 1 − σ = 5 − σ. Untuk σ = −4: R² = 9, R = 3. Geser σ: pusat diam, hanya radiusnya berubah.', 'Move the constants to the right: R² = α² + β² − σ = 4 + 1 − σ = 5 − σ. For σ = −4: R² = 9, R = 3. Move σ: the centre stays, only the radius changes.', String.raw`R^2=\alpha^2+\beta^2-\sigma=5-\sigma`),
    f('Tanda R² menentukan apa yang ada. σ < 5: R² > 0, lingkaran nyata. σ = 5: R² = 0, hanya titik (2, −1). σ > 5: R² < 0, tidak ada titik nyata sama sekali.', 'The sign of R² decides what exists. σ < 5: R² > 0, a real circle. σ = 5: R² = 0, only the point (2, −1). σ > 5: R² < 0, no real points at all.', String.raw`R^2>0:\ \bigcirc,\quad R^2=0:\ \cdot,\quad R^2<0:\ \varnothing`),
  ],
  readout: s => String.raw`\sigma=${s}:\ R^2=5-(${s})=${5 - s}` + (5 - s > 0 ? String.raw`,\ R=${tx(Math.sqrt(5 - s))}` : ''),
  draw: (fr, s, lang) => {
    const t = tr(lang), R2 = 5 - s, R = R2 > 0 ? Math.sqrt(R2) : 0, col = R2 > 0 ? C.a : R2 === 0 ? C.y : C.r
    return <>
      <Grid map={cp} x={[-2, 6]} y={[-5, 3]} />
      {R2 > 0 && <circle cx={CO[0]} cy={CO[1]} r={32 * R} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="3" />}
      <At from={1} frame={fr}>
        {R2 > 0 && <path d={pl([CO, cp(2 + R, -1)])} stroke={C.g} strokeWidth="2.5" />}
        {R2 > 0 && <T x={CO[0] + 16 * R} y={CO[1] - 8} color={C.g} weight={700} size={15}>R</T>}
      </At>
      <Dot at={CO} color={R2 < 0 ? C.r : R2 === 0 ? C.y : C.fg} r={R2 === 0 ? 7 : 5} hollow={R2 < 0} />
      <T x={CO[0] - 8} y={CO[1] + 22} anchor="end" size={14} weight={600}>(2, −1)</T>
      <At until={0} frame={fr}>
        <T x={300} y={50} anchor="start" size={14}>x² − 4x = (x − 2)² − 4</T>
        <T x={300} y={74} anchor="start" size={14}>y² + 2y = (y + 1)² − 1</T>
        <T x={300} y={110} anchor="start" size={15} weight={600}>(x − 2)² + (y + 1)²</T>
        <T x={300} y={134} anchor="start" size={15} weight={600}>= 5 − σ</T>
        <T x={300} y={170} anchor="start" size={14} color={C.a}>α = 2, β = −1</T>
      </At>
      <At from={1} frame={fr}>
        <T x={300} y={60} anchor="start" size={15}>σ = {fmt(s)}</T>
        <T x={300} y={88} anchor="start" size={15}>R² = 5 − ({fmt(s)}) = {fmt(R2)}</T>
        <T x={300} y={118} anchor="start" size={17} weight={700} color={col}>{R2 > 0 ? `R = ${fmt(R)}` : R2 === 0 ? 'R = 0' : 'R² < 0'}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={300} y={162} anchor="start" size={16} weight={700} color={col}>{R2 > 0 ? t('lingkaran nyata', 'a real circle') : R2 === 0 ? t('satu titik', 'one point') : t('kosong ∅', 'empty ∅')}</T>
        <T x={300} y={188} anchor="start" size={13} color={C.mu}>{R2 > 0 ? 'σ < 5' : R2 === 0 ? 'σ = 5' : 'σ > 5'}</T>
      </At>
    </>
  },
}

// ================================================================ power:1 power from secants
const sc = plane([130, 150], 50)
const secantPower: Story = {
  title: b('Kuasa titik: hasil kali jarak berarah', 'Point power: a product of directed distances'),
  control: { label: b('Arah garis potong φ (derajat)', 'Secant direction φ (degrees)'), min: 0, max: 40, step: 5, initial: 20 },
  controlFrom: 1,
  frames: [
    f('Lingkaran x² + y² = 4 (radius 2) dan P = (3, 0). Garis mendatar P + t(1, 0) memotong di x = −2 dan x = 2, yaitu t₁ = −2 − 3 = −5 dan t₂ = 2 − 3 = −1. Hasil kalinya 5 = 3² − 4.', 'Circle x² + y² = 4 (radius 2) and P = (3, 0). The horizontal line P + t(1, 0) meets it at x = −2 and x = 2, so t₁ = −2 − 3 = −5 and t₂ = 2 − 3 = −1. Their product is 5 = 3² − 4.', String.raw`t_1t_2=(-5)(-1)=5=|P-O|^2-R^2`),
    f('Putar garis potong dengan sudut φ. Substitusi P + td ke |X|² = 4 memberi t² + 6t cos φ + 5 = 0. Menurut Vieta hasil kali akarnya selalu suku tetap 5, apa pun arahnya. Geser φ.', 'Turn the secant by an angle φ. Substituting P + td into |X|² = 4 gives t² + 6t cos φ + 5 = 0. By Vieta the product of the roots is always the constant term 5, whatever the direction. Move φ.', String.raw`t^2+2t\,(P-O)\cdot d+|P-O|^2-R^2=0\Rightarrow t_1t_2=5`),
    f('Titik di dalam, P = (1, 0): satu potongan di belakang (t₁ < 0) dan satu di depan (t₂ > 0). Hasil kalinya negatif: (−3)(1) = −3 = 1² − 4, dan tetap −3 untuk setiap arah. Karena itu jaraknya harus berarah.', 'An interior point, P = (1, 0): one intersection behind (t₁ < 0) and one ahead (t₂ > 0). The product is negative: (−3)(1) = −3 = 1² − 4, and it stays −3 for every direction. That is why the distances must be directed.', String.raw`P=(1,0):\ t_1t_2=1^2-4=-3`),
  ],
  readout: d => String.raw`\varphi=${d}^\circ`,
  draw: (fr, dv, lang) => {
    const t = tr(lang), p = fr === 2 ? 1 : 3, ph = fr === 0 ? 0 : dv * DEG, c = Math.cos(ph), s = Math.sin(ph)
    const disc = Math.sqrt(4 - p * p * s * s), t1 = -p * c - disc, t2 = -p * c + disc
    const at = (tt: number) => sc(p + tt * c, tt * s), P = sc(p, 0), X1 = at(t1), X2 = at(t2), O = sc(0, 0)
    const nrm: P = [-s, -c]
    return <>
      <circle cx={O[0]} cy={O[1]} r={100} fill="none" stroke={C.a} strokeWidth="3" />
      <Dot at={O} color={C.a} r={4} />
      <T x={O[0] - 8} y={O[1] + 20} anchor="end" color={C.a} weight={700}>O</T>
      <T x={20} y={34} anchor="start" size={14} color={C.a}>x² + y² = 4</T>
      <Clip id="ga-sec" x={12} y={14} w={310} h={272}>
        <path d={pl([at(t1 - .6), at(Math.max(t2, 0) + .6)])} stroke={C.ln} strokeWidth="2" />
      </Clip>
      <path d={pl([P, X1])} stroke={C.y} strokeWidth="9" strokeLinecap="round" opacity=".35" />
      <path d={pl([P, X2])} stroke={C.g} strokeWidth="3.5" />
      <Dot at={X1} color={C.y} r={6} />
      <Dot at={X2} color={C.g} r={6} />
      <T x={X1[0] + 16 * nrm[0]} y={X1[1] + 16 * nrm[1] + 4} color={C.y} weight={700} size={15}>X₁</T>
      <T x={X2[0] + 16 * nrm[0]} y={X2[1] + 16 * nrm[1] + 4} color={C.g} weight={700} size={15}>X₂</T>
      <Dot at={P} color={C.fg} r={7} />
      <T x={P[0] + 4} y={P[1] + 24} weight={700}>P</T>
      <T x={332} y={60} anchor="start" size={15}>P = ({p}, 0)</T>
      <T x={332} y={94} anchor="start" size={15} color={C.y}>t₁ = {fmt(t1)}</T>
      <T x={332} y={120} anchor="start" size={15} color={C.g}>t₂ = {fmt(t2)}</T>
      <T x={332} y={156} anchor="start" size={18} weight={700} color={C.v}>t₁t₂ = {fmt(t1 * t2)}</T>
      <T x={332} y={186} anchor="start" size={13} color={C.mu}>|OP|² − R² = {p * p} − 4</T>
      <At from={1} frame={fr}>
        <T x={332} y={220} anchor="start" size={14}>φ = {fr === 0 ? 0 : dv}°</T>
        <T x={332} y={244} anchor="start" size={13} color={C.mu}>{t('arah lain,', 'other direction,')}</T>
        <T x={332} y={264} anchor="start" size={13} color={C.mu}>{t('hasil sama', 'same result')}</T>
      </At>
    </>
  },
}

// ================================================================ power:2 why the polar passes through the tangency points
const po = plane([100, 150], 40), PO = po(0, 0)
const polarWhy: Story = {
  title: b('Garis kutub melalui kedua titik singgung', 'The polar passes through both tangency points'),
  control: { label: b('Posisi P = (p, 0): p', 'Position P = (p, 0): p'), min: 1, max: 5, step: .5, initial: 3 },
  controlFrom: 2,
  frames: [
    f('Lingkaran berpusat O dengan R = 2, dan P = (3, 0). PT menyinggung di T tepat jika PT tegak lurus jari-jari OT: (P − T)·(T − O) = 0. Selain itu T ada di lingkaran: |T − O|² = 4.', 'Circle with centre O and R = 2, and P = (3, 0). PT touches at T exactly when PT is perpendicular to the radius OT: (P − T)·(T − O) = 0. Also T lies on the circle: |T − O|² = 4.', String.raw`(P-T)\cdot(T-O)=0,\quad |T-O|^2=R^2`),
    f('Tulis P − T = (P − O) − (T − O), lalu uraikan: (P − O)·(T − O) − |T − O|² = 0, jadi (P − O)·(T − O) = R² = 4. Dengan P − O = (3, 0) dan T = (x, y): 3x = 4, x = 4/3. Persamaan ini linear, jadi T₁ dan T₂ terletak pada satu garis: garis kutub.', 'Write P − T = (P − O) − (T − O) and expand: (P − O)·(T − O) − |T − O|² = 0, so (P − O)·(T − O) = R² = 4. With P − O = (3, 0) and T = (x, y): 3x = 4, x = 4/3. This equation is linear, so T₁ and T₂ lie on one line: the polar.', String.raw`(P-O)\cdot(T-O)=R^2\ \Rightarrow\ 3x=4`),
    f('Geser P = (p, 0): kutubnya px = 4, yaitu x = 4/p, selalu melalui kedua titik singgung. Di p = 2 kutubnya menjadi garis singgung di P. Untuk p < 2, P di dalam: tidak ada titik singgung nyata, tetapi kutubnya tetap ada di luar lingkaran.', 'Move P = (p, 0): its polar is px = 4, that is x = 4/p, always through both tangency points. At p = 2 the polar becomes the tangent at P. For p < 2, P is inside: there are no real tangency points, but the polar still exists outside the circle.', String.raw`(p,0)\cdot(x,y)=4\ \Rightarrow\ x=\frac4p`),
  ],
  readout: p => String.raw`p=${tx(p)}:\ x=\frac{4}{${tx(p)}}=${tx(4 / p)}`,
  draw: (fr, pv, lang) => {
    const t = tr(lang), p = fr < 2 ? 3 : pv, xp = 4 / p, out = p > 2 + 1e-9, on = Math.abs(p - 2) < 1e-9
    const yT = out ? Math.sqrt(4 - xp * xp) : 0, T1 = po(xp, yT), T2 = po(xp, -yT), P = po(p, 0), X = po(xp, 0)[0]
    return <>
      <circle cx={PO[0]} cy={PO[1]} r={80} fill="none" stroke={C.a} strokeWidth="3" />
      <path d={pl([PO, P])} stroke={C.mu} strokeWidth="1.5" strokeDasharray="5 5" />
      <Dot at={PO} color={C.a} r={5} />
      <T x={PO[0] - 8} y={PO[1] + 22} anchor="end" color={C.a} weight={700}>O</T>
      {out && <g>
        <path d={pl([PO, T1])} stroke={C.fg} strokeWidth="2" />
        <path d={pl([P, T1])} stroke={C.g} strokeWidth="3" />
        <RA at={T1} a={sub(PO, T1)} c={sub(P, T1)} size={9} />
        <Dot at={T1} color={C.v} r={6} />
        <T x={T1[0] + 4} y={T1[1] - 14} color={C.v} weight={700}>T₁</T>
        <T x={(PO[0] + T1[0]) / 2 - 8} y={(PO[1] + T1[1]) / 2} anchor="end" size={14} weight={700}>2</T>
      </g>}
      <At from={1} frame={fr}>
        {out && <g>
          <path d={pl([PO, T2])} stroke={C.fg} strokeWidth="2" />
          <path d={pl([P, T2])} stroke={C.g} strokeWidth="3" />
          <Dot at={T2} color={C.v} r={6} />
          <T x={T2[0] + 4} y={T2[1] + 24} color={C.v} weight={700}>T₂</T>
        </g>}
        <path d={`M${X},18 V282`} stroke={C.v} strokeWidth="3.5" strokeOpacity=".85" />
        <T x={X + 8} y={34} anchor="start" size={14} color={C.v} weight={700}>x = {fmt(xp)}</T>
      </At>
      <Dot at={P} color={C.fg} r={7} />
      <T x={P[0] + 2} y={P[1] + 26} weight={700}>P</T>
      <At until={0} frame={fr}>
        <T x={318} y={70} anchor="start" size={13}>(P − T)·(T − O) = 0</T>
        <T x={318} y={96} anchor="start" size={13}>|T − O|² = 4</T>
        <T x={318} y={130} anchor="start" size={14} color={C.v}>T₁ = (4/3, 1.49)</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={318} y={70} anchor="start" size={13}>(P − O)·(T − O) = 4</T>
        <T x={318} y={96} anchor="start" size={14}>(3, 0)·(x, y) = 4</T>
        <T x={318} y={130} anchor="start" size={16} weight={700} color={C.v}>3x = 4</T>
        <T x={318} y={156} anchor="start" size={13} color={C.mu}>{t('T₁ dan T₂ memenuhinya', 'T₁ and T₂ satisfy it')}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={318} y={70} anchor="start" size={15}>P = ({fmt(p)}, 0)</T>
        <T x={318} y={96} anchor="start" size={15} color={C.v}>{fmt(p)}x = 4</T>
        <T x={318} y={124} anchor="start" size={16} weight={700} color={C.v}>x = {fmt(xp)}</T>
        <T x={318} y={156} anchor="start" size={13} color={out ? C.g : on ? C.y : C.r}>{out ? t('P di luar: 2 singgung', 'P outside: 2 tangents') : on ? t('kutub = singgung di P', 'polar = tangent at P') : t('P di dalam: tak ada T', 'P inside: no T')}</T>
      </At>
    </>
  },
}

// ================================================================ radical:0 circle pencils and the radical centre
const rc = plane([150, 150], 26)
const C1: P = [-1, 0], C2: P = [2, 0], R1 = Math.sqrt(5), R2 = Math.sqrt(8), Q0: P = [0, 3]
const circlePencil: Story = {
  title: b('Pensil lingkaran, sumbu radikal, pusat radikal', 'Circle pencils, radical axes, the radical centre'),
  control: { label: b('Anggota (1 − t)f₁ + t·f₂: t', 'Member (1 − t)f₁ + t·f₂: t'), min: -0.2, max: 1.2, step: .1, initial: .5 },
  controlFrom: 1,
  frames: [
    f('f₁ = x² + y² + 2x − 4 (pusat (−1, 0)) dan f₂ = x² + y² − 4x − 4 (pusat (2, 0)). Keduanya melalui titik dasar (0, 2) dan (0, −2): masukkan x = 0, y = ±2 dan keduanya 0.', 'f₁ = x² + y² + 2x − 4 (centre (−1, 0)) and f₂ = x² + y² − 4x − 4 (centre (2, 0)). Both pass through the base points (0, 2) and (0, −2): plug in x = 0, y = ±2 and both give 0.', String.raw`f_1(0,\pm2)=f_2(0,\pm2)=0`),
    f('Anggota pensil (1 − t)f₁ + t·f₂ = x² + y² + (2 − 6t)x − 4 = 0. Di titik dasar f₁ = f₂ = 0, jadi kombinasinya juga 0: setiap anggota melalui (0, ±2). Geser t: pusatnya (3t − 1, 0) bergeser di garis pusat.', 'The pencil member (1 − t)f₁ + t·f₂ = x² + y² + (2 − 6t)x − 4 = 0. At the base points f₁ = f₂ = 0, so the combination is 0 too: every member passes through (0, ±2). Move t: its centre (3t − 1, 0) slides along the line of centres.', String.raw`\lambda f_1+\mu f_2=0`),
    f('Pilih λ = 1, μ = −1: x² + y² lenyap dan f₁ − f₂ = 6x = 0, garis x = 0. Di garis ini kuasa terhadap kedua lingkaran sama. Contoh Q = (0, 3): f₁ = 9 − 4 = 5 = f₂, jadi kedua garis singgung dari Q panjangnya √5.', 'Choose λ = 1, μ = −1: x² + y² cancels and f₁ − f₂ = 6x = 0, the line x = 0. On this line the power to both circles is equal. Example Q = (0, 3): f₁ = 9 − 4 = 5 = f₂, so both tangents from Q have length √5.', String.raw`f_1-f_2=6x=0,\quad f_1(Q)=f_2(Q)=5`),
    f('Tambahkan f₃: pusat (3, 4), radius 1. Sumbu f₁f₃: x + y = 3,5 dan sumbu f₂f₃: x + 4y = 14. Keduanya bertemu di (0; 3,5), tepat pada x = 0. Kuasa sama pertama-kedua dan kedua-ketiga memaksa pertama-ketiga: pusat radikal, kuasanya 8,25 untuk ketiganya.', 'Add f₃: centre (3, 4), radius 1. Axis f₁f₃: x + y = 3.5 and axis f₂f₃: x + 4y = 14. They meet at (0, 3.5), right on x = 0. Equal power for first–second and second–third forces first–third: the radical centre, with power 8.25 to all three.', String.raw`f_1(0,3.5)=f_2(0,3.5)=f_3(0,3.5)=8.25`),
  ],
  readout: t => String.raw`t=${tx(t)}:\ x^2+y^2+(${tx(2 - 6 * t)})\,x-4=0`,
  draw: (fr, tv, lang) => {
    const t = tr(lang), tt = fr === 0 ? .5 : tv, mc = 3 * tt - 1, mr = Math.hypot(mc, 2), M = rc(mc, 0)
    const c1 = rc(C1[0], C1[1]), c2 = rc(C2[0], C2[1]), Bu = rc(0, 2), Bd = rc(0, -2), Q = rc(Q0[0], Q0[1])
    const T1 = tangentPt(Q0, C1, R1, 1), T2 = tangentPt(Q0, C2, R2, -1), RCp = rc(0, 3.5), c3p = rc(3, 4)
    const line = (g: (x: number) => number) => pl([rc(-6, g(-6)), rc(8, g(8))])
    return <>
      <Clip id="ga-rad" x={12} y={14} w={292} h={272}>
        <At from={1} frame={fr}>
          <g opacity={fr === 1 ? 1 : .3} style={{ transition: 'opacity .45s' }}>
            <circle cx={M[0]} cy={M[1]} r={26 * mr} fill="none" stroke={C.a} strokeWidth="3" />
          </g>
        </At>
        <circle cx={c1[0]} cy={c1[1]} r={26 * R1} fill="none" stroke={C.g} strokeWidth="2.5" />
        <circle cx={c2[0]} cy={c2[1]} r={26 * R2} fill="none" stroke={C.y} strokeWidth="2.5" />
        <At from={2} frame={fr}>
          <path d={`M${Bu[0]},14 V286`} stroke={C.v} strokeWidth="3" />
        </At>
        <At from={3} frame={fr}>
          <path d={line(x => 3.5 - x)} stroke={C.r} strokeWidth="2.5" strokeDasharray="7 4" />
          <path d={line(x => (14 - x) / 4)} stroke={C.a} strokeWidth="2.5" strokeDasharray="7 4" />
          <circle cx={c3p[0]} cy={c3p[1]} r={26} fill="none" stroke={C.r} strokeWidth="2.5" />
        </At>
      </Clip>
      <Dot at={c1} color={C.g} r={4} />
      <Dot at={c2} color={C.y} r={4} />
      <T x={rc(-2.9, 1.8)[0]} y={rc(-2.9, 1.8)[1]} anchor="end" color={C.g} weight={700}>f₁</T>
      <T x={rc(4.1, 2.3)[0]} y={rc(4.1, 2.3)[1]} anchor="start" color={C.y} weight={700}>f₂</T>
      <At until={1} frame={fr}>
        <Dot at={Bu} color={C.fg} r={6} />
        <Dot at={Bd} color={C.fg} r={6} />
        <T x={Bu[0] + 8} y={Bu[1] - 10} anchor="start" size={13} weight={600}>(0, 2)</T>
        <T x={Bd[0] + 8} y={Bd[1] + 20} anchor="start" size={13} weight={600}>(0, −2)</T>
      </At>
      <At until={0} frame={fr}>
        <T x={312} y={60} anchor="start" size={13} color={C.g}>f₁ = x² + y² + 2x − 4</T>
        <T x={312} y={84} anchor="start" size={13} color={C.y}>f₂ = x² + y² − 4x − 4</T>
        <T x={312} y={120} anchor="start" size={14}>(0, ±2): 4 − 4 = 0</T>
        <T x={312} y={144} anchor="start" size={13} color={C.mu}>{t('untuk keduanya', 'for both')}</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <Dot at={M} color={C.a} r={4} />
        <T x={312} y={60} anchor="start" size={15}>t = {fmt(tt)}</T>
        <T x={312} y={86} anchor="start" size={13}>x² + y² + ({fmt(2 - 6 * tt)})x − 4</T>
        <T x={312} y={120} anchor="start" size={14} color={C.a}>{t('pusat', 'centre')} ({fmt(mc)}, 0)</T>
        <T x={312} y={144} anchor="start" size={14} color={C.a}>r = {fmt(mr)}</T>
        <T x={312} y={178} anchor="start" size={13} color={C.mu}>(0, ±2) ✓</T>
      </At>
      <At from={2} until={2} frame={fr}>
        <path d={pl([Q, rc(T1[0], T1[1])])} stroke={C.g} strokeWidth="3" />
        <path d={pl([Q, rc(T2[0], T2[1])])} stroke={C.y} strokeWidth="3" />
        <Dot at={rc(T1[0], T1[1])} color={C.g} r={4} />
        <Dot at={rc(T2[0], T2[1])} color={C.y} r={4} />
        <Dot at={Q} color={C.v} r={6} />
        <T x={Q[0] + 8} y={Q[1] - 10} anchor="start" weight={700} color={C.v}>Q</T>
        <T x={312} y={60} anchor="start" size={14} color={C.v}>f₁ − f₂ = 6x</T>
        <T x={312} y={84} anchor="start" size={14} color={C.v}>x = 0</T>
        <T x={312} y={120} anchor="start" size={14}>Q = (0, 3)</T>
        <T x={312} y={144} anchor="start" size={14}>f₁(Q) = f₂(Q) = 5</T>
        <T x={312} y={168} anchor="start" size={14}>{t('singgung', 'tangents')}: √5</T>
      </At>
      <At from={3} frame={fr}>
        <Dot at={RCp} color={C.fg} r={6} />
        <T x={c3p[0] + 30} y={c3p[1] + 4} anchor="start" color={C.r} weight={700}>f₃</T>
        <T x={312} y={52} anchor="start" size={13} color={C.v}>f₁ − f₂: x = 0</T>
        <T x={312} y={74} anchor="start" size={13} color={C.r}>f₁ − f₃: x + y = 3.5</T>
        <T x={312} y={96} anchor="start" size={13} color={C.a}>f₂ − f₃: x + 4y = 14</T>
        <T x={312} y={130} anchor="start" size={15} weight={700}>(0, 3.5)</T>
        <T x={312} y={154} anchor="start" size={13} color={C.mu}>{t('kuasa', 'power')} = 8.25</T>
        <T x={312} y={176} anchor="start" size={13} color={C.mu}>{t('untuk ketiganya', 'for all three')}</T>
      </At>
    </>
  },
}

// ================================================================ radical:1 spheres and tangent planes
const sv = orth([150, 170], 30), SO = sv(0, 0, 0), s2 = plane([150, 165], 30)
const spherePlane: Story = {
  title: b('Bidang singgung tegak lurus jari-jari', 'A tangent plane is perpendicular to the radius'),
  control: { label: b('Titik singgung T: sudut φ (derajat)', 'Contact point T: angle φ (degrees)'), min: 0, max: 180, step: 15, initial: 60 },
  controlFrom: 2,
  frames: [
    f('Bola dengan pusat O = (1, 2, 3) dan R = 3: semua titik berjarak 3 dari O, (x − 1)² + (y − 2)² + (z − 3)² = 9. Puncaknya T = (1, 2, 6), dan T − O = (0, 0, 3).', 'Sphere with centre O = (1, 2, 3) and R = 3: all points at distance 3 from O, (x − 1)² + (y − 2)² + (z − 3)² = 9. Its top is T = (1, 2, 6), and T − O = (0, 0, 3).', String.raw`|r-O|^2=R^2=9`),
    f('Bidang singgung di T tegak lurus jari-jari, jadi T − O = (0, 0, 3) adalah normalnya: 3(z − 6) = 0, yaitu z = 6. Cek titik r = (3, 2, 6) di bidang: (T − O)·(r − O) = (0, 0, 3)·(2, 0, 3) = 9 = R².', 'The tangent plane at T is perpendicular to the radius, so T − O = (0, 0, 3) is its normal: 3(z − 6) = 0, that is z = 6. Check r = (3, 2, 6) on the plane: (T − O)·(r − O) = (0, 0, 3)·(2, 0, 3) = 9 = R².', String.raw`(T-O)\cdot(r-T)=0\iff(T-O)\cdot(r-O)=R^2`),
    f('Irisan melalui pusat menunjukkan hal yang sama dalam 2D. Geser T keliling lingkaran: garis singgung selalu tegak lurus OT dan menyentuh tepat sekali. Untuk setiap titik r pada garis itu (T − O)·(r − O) = 9.', 'A cross-section through the centre shows the same thing in 2D. Slide T around the circle: the tangent line is always perpendicular to OT and touches exactly once. For every point r on that line (T − O)·(r − O) = 9.', String.raw`(T-O)\cdot(r-O)=|T-O|^2+(T-O)\cdot(r-T)=9+0`),
  ],
  readout: d => { const c = 3 * Math.cos(d * DEG), s = 3 * Math.sin(d * DEG); return String.raw`T-O=(${tx(c)},\ ${tx(s)})` },
  draw: (fr, d, lang) => {
    const t = tr(lang), Tp = sv(0, 0, 3), rP = sv(2, 0, 3), ph = d * DEG, Tv: P = [3 * Math.cos(ph), 3 * Math.sin(ph)], dir: P = [-Math.sin(ph), Math.cos(ph)]
    const T2 = s2(Tv[0], Tv[1]), rv: P = [Tv[0] + 2 * dir[0], Tv[1] + 2 * dir[1]], O2 = s2(0, 0)
    return <>
      <At until={1} frame={fr}>
        <circle cx={SO[0]} cy={SO[1]} r={90} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="3" />
        <path d={fn(a => sv(3 * Math.cos(a), 3 * Math.sin(a), 0), 0, 2 * Math.PI)} fill="none" stroke={C.a} strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity=".7" />
        <Arrow from={SO} to={Tp} color={C.v} width={3.5} />
        <Dot at={SO} color={C.fg} r={5} />
        <T x={SO[0] - 10} y={SO[1] + 20} anchor="end" weight={700}>O</T>
        <T x={SO[0] + 8} y={(SO[1] + Tp[1]) / 2 + 10} anchor="start" size={14} color={C.v} weight={700}>R = 3</T>
        <Dot at={Tp} color={C.v} r={6} />
        <T x={Tp[0] - 10} y={Tp[1] - 8} anchor="end" weight={700} color={C.v}>T</T>
        <T x={300} y={220} anchor="start" size={14}>O = (1, 2, 3)</T>
        <T x={300} y={244} anchor="start" size={14} color={C.v}>T = (1, 2, 6)</T>
      </At>
      <At until={0} frame={fr}>
        <T x={300} y={60} anchor="start" size={14}>(x − 1)² + (y − 2)²</T>
        <T x={300} y={84} anchor="start" size={14}>+ (z − 3)² = 9</T>
        <T x={300} y={120} anchor="start" size={14} color={C.v}>T − O = (0, 0, 3)</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <path d={sqr(sv, 2.6, 3)} fill={C.g} fillOpacity=".16" stroke={C.g} strokeWidth="2" />
        <path d={pl([SO, rP])} stroke={C.mu} strokeWidth="1.5" strokeDasharray="4 4" />
        <path d={pl([Tp, rP])} stroke={C.g} strokeWidth="2.5" />
        <RA at={Tp} a={sub(SO, Tp)} c={sub(rP, Tp)} size={10} color={C.fg} />
        <Dot at={rP} color={C.g} r={5} />
        <T x={rP[0] + 8} y={rP[1] + 4} anchor="start" weight={700} color={C.g}>r</T>
        <T x={300} y={60} anchor="start" size={15} weight={700} color={C.g}>z = 6</T>
        <T x={300} y={86} anchor="start" size={14}>r = (3, 2, 6)</T>
        <T x={300} y={112} anchor="start" size={13}>(0, 0, 3)·(2, 0, 3) = 9</T>
      </At>
      <At from={2} frame={fr}>
        <circle cx={O2[0]} cy={O2[1]} r={90} fill="none" stroke={C.a} strokeWidth="3" />
        <Clip id="ga-tan" x={12} y={14} w={290} h={272}>
          <path d={pl([s2(Tv[0] - 3.4 * dir[0], Tv[1] - 3.4 * dir[1]), s2(Tv[0] + 3.4 * dir[0], Tv[1] + 3.4 * dir[1])])} stroke={C.g} strokeWidth="3" />
        </Clip>
        <path d={pl([O2, T2])} stroke={C.v} strokeWidth="3" />
        <path d={pl([O2, s2(rv[0], rv[1])])} stroke={C.mu} strokeWidth="1.5" strokeDasharray="4 4" />
        <RA at={T2} a={sub(O2, T2)} c={sub(s2(rv[0], rv[1]), T2)} size={10} color={C.fg} />
        <Dot at={O2} color={C.fg} r={5} />
        <T x={O2[0] + (Tv[0] > 0 ? -10 : 10)} y={O2[1] + 20} anchor={Tv[0] > 0 ? 'end' : 'start'} weight={700}>O</T>
        <Dot at={T2} color={C.v} r={6} />
        <T x={s2(Tv[0] * 1.13, Tv[1] * 1.13)[0]} y={s2(Tv[0] * 1.13, Tv[1] * 1.13)[1] + 5} weight={700} color={C.v}>T</T>
        <Dot at={s2(rv[0], rv[1])} color={C.g} r={5} />
        <T x={s2(rv[0], rv[1])[0] + 10} y={s2(rv[0], rv[1])[1] - 6} anchor="start" weight={700} color={C.g}>r</T>
        <T x={314} y={60} anchor="start" size={14} color={C.v}>T − O =</T>
        <T x={314} y={84} anchor="start" size={14} color={C.v}>({fmt(Tv[0])}, {fmt(Tv[1])})</T>
        <T x={314} y={116} anchor="start" size={14}>(T − O)·(r − O)</T>
        <T x={314} y={140} anchor="start" size={16} weight={700} color={C.g}>= {fmt(Tv[0] * rv[0] + Tv[1] * rv[1])}</T>
        <T x={314} y={170} anchor="start" size={13} color={C.mu}>{t('irisan 2D', '2D section')}</T>
      </At>
      <At until={1} frame={fr}>
        <T x={470} y={284} anchor="end" size={12} color={C.mu}>{t('skema', 'schematic')}</T>
      </At>
    </>
  },
}

// ================================================================ radical:2 sphere-plane intersection
const sv2 = orth([165, 165], 18), s3 = plane([150, 160], 24)
const sphereSlice: Story = {
  title: b('Bidang memotong bola: r² + d² = R²', 'A plane slices a sphere: r² + d² = R²'),
  control: { label: b('Jarak d pusat ke bidang', 'Distance d from centre to plane'), min: 0, max: 6, step: .5, initial: 3 },
  frames: [
    f('Bola R = 5 dan bidang mendatar berjarak d = 3 dari pusat. Irisannya adalah lingkaran (ungu). Geser d: lingkarannya mengecil saat bidang menjauh dari pusat.', 'A sphere with R = 5 and a horizontal plane at distance d = 3 from the centre. The slice is a circle (violet). Move d: the circle shrinks as the plane moves away from the centre.', String.raw`R=5,\ d=3`),
    f('Lihat irisan 2D melalui pusat dan normal bidang. Jari-jari bola R = 5 menjadi sisi miring segitiga siku-siku dengan sisi d = 3 dan r. Pythagoras: r² = 25 − 9 = 16, jadi r = 4.', 'Look at the 2D section through the centre and the plane’s normal. The sphere radius R = 5 becomes the hypotenuse of a right triangle with legs d = 3 and r. Pythagoras: r² = 25 − 9 = 16, so r = 4.', String.raw`r^2+d^2=R^2\ \Rightarrow\ r=\sqrt{25-9}=4`),
    f('Tiga kasus. d < 5: lingkaran dengan r = √(25 − d²). d = 5: bidang hanya menyentuh di satu titik, bidang singgung. d > 5: tidak ada irisan, karena 25 − d² negatif.', 'Three cases. d < 5: a circle with r = √(25 − d²). d = 5: the plane touches at a single point, a tangent plane. d > 5: no intersection, since 25 − d² is negative.', String.raw`d<R:\ r=\sqrt{R^2-d^2},\quad d=R:\ r=0,\quad d>R:\ \varnothing`),
  ],
  readout: d => { const r2 = 25 - d * d; return String.raw`d=${tx(d)}:\ r^2=25-${tx(d * d)}=${tx(r2)}` + (r2 >= 0 ? String.raw`,\ r=${tx(Math.sqrt(r2))}` : '') },
  draw: (fr, d, lang) => {
    const t = tr(lang), r2 = 25 - d * d, r = r2 > 0 ? Math.sqrt(r2) : 0, cut = r2 >= 0, col = r2 > 0 ? C.v : r2 === 0 ? C.y : C.r
    const O3 = sv2(0, 0, 0), O = s3(0, 0), Cd = s3(0, d), Q = s3(r, d)
    return <>
      <At until={0} frame={fr}>
        <circle cx={O3[0]} cy={O3[1]} r={90} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="3" />
        <path d={sqr(sv2, 5.5, d)} fill={C.g} fillOpacity=".14" stroke={C.g} strokeWidth="2" />
        {r2 > 0 && <path d={fn(a => sv2(r * Math.cos(a), r * Math.sin(a), d), 0, 2 * Math.PI)} fill="none" stroke={C.v} strokeWidth="3.5" />}
        {r2 === 0 && <Dot at={sv2(0, 0, 5)} color={C.y} r={6} />}
        <Dot at={O3} color={C.fg} r={5} />
        <path d={pl([O3, sv2(0, 0, d)])} stroke={C.y} strokeWidth="2" strokeDasharray="5 4" />
        <T x={O3[0] - 10} y={O3[1] + 20} anchor="end" weight={700}>O</T>
        <T x={318} y={60} anchor="start" size={15}>R = 5</T>
        <T x={318} y={86} anchor="start" size={15} color={C.y}>d = {fmt(d)}</T>
        <T x={318} y={120} anchor="start" size={16} weight={700} color={col}>{r2 >= 0 ? `r = ${fmt(r)}` : t('tak ada irisan', 'no slice')}</T>
        <T x={470} y={284} anchor="end" size={12} color={C.mu}>{t('skema', 'schematic')}</T>
      </At>
      <At from={1} frame={fr}>
        <circle cx={O[0]} cy={O[1]} r={120} fill={C.a} fillOpacity=".06" stroke={C.a} strokeWidth="3" />
        <path d={`M14,${Cd[1]} H300`} stroke={C.g} strokeWidth="2.5" />
        <T x={20} y={Cd[1] < 30 ? Cd[1] + 20 : Cd[1] - 8} anchor="start" size={13} color={C.g}>{t('bidang', 'plane')}</T>
        {cut && <path d={pl([s3(-r, d), Q])} stroke={col} strokeWidth="5" strokeOpacity=".5" />}
        {d > .2 && <path d={pl([O, Cd])} stroke={C.y} strokeWidth="3" />}
        {r2 > 0 && <path d={pl([O, Q])} stroke={C.a} strokeWidth="2.5" />}
        {r2 > 0 && d > .3 && <RA at={Cd} a={[0, 1]} c={[1, 0]} size={9} />}
        <Dot at={O} color={C.fg} r={5} />
        <T x={O[0] - 10} y={O[1] + 20} anchor="end" weight={700}>O</T>
        {d > .4 && <T x={O[0] - 8} y={(O[1] + Cd[1]) / 2 + 5} anchor="end" weight={700} color={C.y}>d</T>}
        {r2 > .5 && <T x={(Cd[0] + Q[0]) / 2} y={Cd[1] - 10} weight={700} color={col}>r</T>}
        {r2 > 0 && <T x={(O[0] + Q[0]) / 2 + 10} y={(O[1] + Q[1]) / 2 + 16} anchor="start" weight={700} color={C.a}>R = 5</T>}
        {cut && <Dot at={Q} color={col} r={5} />}
        <T x={312} y={60} anchor="start" size={15}>r² + d² = R²</T>
        <T x={312} y={90} anchor="start" size={15}>r² = 25 − {fmt(d * d)}</T>
        <T x={312} y={116} anchor="start" size={15}>= {fmt(r2)}</T>
        <T x={312} y={148} anchor="start" size={17} weight={700} color={col}>{r2 >= 0 ? `r = ${fmt(r)}` : 'r² < 0'}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={312} y={190} anchor="start" size={15} weight={700} color={col}>{r2 > 0 ? t('lingkaran', 'a circle') : r2 === 0 ? t('satu titik singgung', 'one tangent point') : t('kosong', 'empty')}</T>
        <T x={312} y={214} anchor="start" size={13} color={C.mu}>{r2 > 0 ? 'd < 5' : r2 === 0 ? 'd = 5' : 'd > 5'}</T>
      </At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'basis:0': division,
  'basis:1': independence,
  'products:0': projectionVec,
  'products:1': crossArea,
  'products:2': triple,
  'plane:0': paramLine,
  'plane:1': planePts,
  'plane:2': pencilPlanes,
  'projection:0': anglesNormal,
  'projection:1': pointLine,
  'projection:2': skewDist,
  'power:0': completeSq,
  'power:1': secantPower,
  'power:2': polarWhy,
  'radical:0': circlePencil,
  'radical:1': spherePlane,
  'radical:2': sphereSlice,
}
