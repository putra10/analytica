import type { ReactNode } from 'react'
import { At, Arrow, C, Clip, Dot, Grid, T, arc, b, f, fn, pl, plane, tr, type Frame, type P, type Story } from '../kit'

/** Number for SVG labels: at most d decimals, real minus sign. */
const fmt = (n: number, d = 2) => { const s = String(+n.toFixed(d)); return (s === '-0' ? '0' : s).replace('-', '−') }
/** Number for KaTeX. */
const tx = (n: number, d = 2) => { const s = String(+n.toFixed(d)); return s === '-0' ? '0' : s }
/** Right-angle mark at `at` between two screen directions. */
const RA = ({ at, a, c, size = 10, color = C.mu }: { at: P; a: P; c: P; size?: number; color?: string }) => {
  const n = (v: P): P => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l * size, v[1] / l * size] }, p = n(a), q = n(c)
  return <path d={`M${at[0] + p[0]},${at[1] + p[1]} l${q[0]},${q[1]} l${-p[0]},${-p[1]}`} fill="none" stroke={color} strokeWidth="1.5" />
}
/** "ax + by" with clean signs; zero terms dropped. */
const lin = (terms: [number, string][], d = 2) => {
  const out = terms.filter(([n]) => Math.abs(n) > 1e-9).map(([n, v], i) => {
    const m = Math.abs(n), c = Math.abs(m - 1) < 1e-9 && v ? '' : fmt(m, d)
    return `${n < 0 ? (i ? ' − ' : '−') : i ? ' + ' : ''}${c}${v}`
  }).join('')
  return out || '0'
}
/** Orientation marker: a turning arrow around c, counterclockwise for sgn = 1. */
const Turn = ({ c, r, sgn, color }: { c: P; r: number; sgn: number; color: string }) => {
  const a0 = 1.3, a1 = a0 + sgn * 4.4, end: P = [c[0] + r * Math.cos(a1), c[1] - r * Math.sin(a1)]
  const tg: P = [-Math.sin(a1) * sgn, -Math.cos(a1) * sgn]
  return <g><path d={arc(c, r, a0, a1)} fill="none" stroke={color} strokeWidth="2" /><Arrow from={[end[0] - tg[0] * 12, end[1] - tg[1] * 12]} to={end} color={color} width={2} head={6} /></g>
}
/** A matrix with brackets; rows of [text, color]. */
const Mat = ({ x, y, rows, w = 40, h = 30, size = 17 }: { x: number; y: number; rows: [string, string][][]; w?: number; h?: number; size?: number }) => {
  const H = rows.length * h, W = rows[0].length * w
  return <g>
    <path d={`M${x + 7},${y} H${x} V${y + H} H${x + 7} M${x + W + 9},${y} H${x + W + 16} V${y + H} H${x + W + 9}`} fill="none" stroke={C.fg} strokeWidth="2" />
    {rows.map((r, i) => r.map(([s, c], j) => <T key={`${i}-${j}`} x={x + 8 + w * (j + .5)} y={y + h * (i + .5) + size * .35} color={c} size={size} weight={700}>{s}</T>))}
  </g>
}
/** Rounded coefficient box. */
const Box = ({ x, y, w, h = 38, color, children, size = 16 }: { x: number; y: number; w: number; h?: number; color: string; children: ReactNode; size?: number }) => <g>
  <rect x={x} y={y} width={w} height={h} rx={8} fill={color} fillOpacity=".12" stroke={color} strokeWidth="1.8" />
  <T x={x + w / 2} y={y + h / 2 + size * .35} color={color} size={size} weight={700}>{children}</T>
</g>

/** Schematic 3D view: azimuth 30°, flattened depth. A horizontal circle of radius r appears as an ellipse s·r by KQ·s·r. */
const AZ = Math.PI / 6, KQ = .35, CA = Math.cos(AZ), SA = Math.sin(AZ)
const proj = (c: P, s: number) => (x: number, y: number, z: number): P => [c[0] + s * (x * CA - y * SA), c[1] - s * (z + KQ * (x * SA + y * CA))]
/** Horizontal circle: back half dashed, front half solid (or both solid). */
const Ring = ({ c, rx, ry, color, width = 1.5, full, opacity = 1 }: { c: P; rx: number; ry: number; color: string; width?: number; full?: boolean; opacity?: number }) =>
  <g fill="none" stroke={color} strokeWidth={width} opacity={opacity}>
    <path d={`M${c[0] - rx},${c[1]} A${rx} ${ry} 0 0 1 ${c[0] + rx},${c[1]}`} strokeDasharray={full ? undefined : '4 4'} />
    <path d={`M${c[0] - rx},${c[1]} A${rx} ${ry} 0 0 0 ${c[0] + rx},${c[1]}`} />
  </g>
/** Screen parallelogram for the horizontal plane z = h (centre cy), half-width w px. */
const hPlane = (cx: number, cy: number, w: number) => { const d = .15 * w, e = KQ * w; return pl([[cx - w - d, cy + e], [cx + w - d, cy + e], [cx + w + d, cy - e], [cx - w + d, cy - e]], true) }

// ================================================================ conic:0 tangent lines
const te = plane([150, 150], 33), tq = plane([110, 150], 40)
const tangent: Story = {
  title: b('Garis singgung konik dari gradien', 'The tangent to a conic from the gradient'),
  control: { label: b('Posisi P pada elips: parameter t (derajat)', 'Position of P on the ellipse: parameter t (degrees)'), min: 0, max: 355, step: 5, initial: 40 },
  frames: [
    f('Elips x²/9 + y²/4 = 1 bersumbu 3 dan 2. Titik P = (3 cos t, 2 sin t) selalu berada di elips. Geser t untuk memindahkan P.', 'The ellipse x²/9 + y²/4 = 1 has semiaxes 3 and 2. The point P = (3 cos t, 2 sin t) always lies on it. Move t to slide P.', String.raw`F(x,y)=\frac{x^2}{9}+\frac{y^2}{4}-1=0`),
    f('Gradien ∇F(P) = (2x₀/9, 2y₀/4) tegak lurus elips di P dan menunjuk ke luar. Panah kuning ini menjadi normal garis singgung.', 'The gradient ∇F(P) = (2x₀/9, 2y₀/4) is perpendicular to the ellipse at P and points outward. This amber arrow is the normal of the tangent line.', String.raw`\nabla F(P)=\left(\tfrac{2x_0}{9},\ \tfrac{2y_0}{4}\right)`),
    f('Garis singgung = semua titik r dengan ∇F(P)·(r − P) = 0. Karena x₀²/9 + y₀²/4 = 1, konstantanya menjadi 1: xx₀/9 + yy₀/4 = 1. Geser t: garis hijau berputar, normal tetap tegak lurus.', 'Tangent line = all points r with ∇F(P)·(r − P) = 0. Since x₀²/9 + y₀²/4 = 1, the constant becomes 1: xx₀/9 + yy₀/4 = 1. Move t: the green line turns while the normal stays perpendicular.', String.raw`\nabla F(P)\cdot(r-P)=0\iff\frac{xx_0}{9}+\frac{yy_0}{4}=1`),
    f('Parabola buku y² = 2px dengan p = 1, di P = (2, 2). Gradien F = y² − 2x di P adalah (−2, 4), dan aturan yang sama memberi yy₀ = p(x + x₀), yaitu 2y = x + 2. Garis ini menyentuh parabola tepat sekali.', 'The textbook parabola y² = 2px with p = 1, at P = (2, 2). The gradient of F = y² − 2x at P is (−2, 4), and the same rule gives yy₀ = p(x + x₀), that is 2y = x + 2. This line touches the parabola exactly once.', String.raw`yy_0=p(x+x_0):\quad 2y=x+2`),
  ],
  draw: (k, deg, lang) => {
    const t = tr(lang), a = deg * Math.PI / 180, x0 = 3 * Math.cos(a), y0 = 2 * Math.sin(a), P0 = te(x0, y0)
    const gx = 2 * x0 / 9, gy = y0 / 2, gl = Math.hypot(gx, gy), nx = gx / gl, ny = gy / gl
    const N = te(x0 + 1.2 * nx, y0 + 1.2 * ny), Mn = te(x0 + .9 * nx, y0 + .9 * ny)
    /** ∇F label beside the outer part of the arrow, on the upper side (right side if the arrow is vertical). */
    const side = nx > 1e-9 || (Math.abs(nx) <= 1e-9 && ny < 0) ? 1 : -1, gL: P = [Mn[0] - side * ny * 14, Mn[1] - side * nx * 14 + 5]
    const qP = tq(2, 2), qn = [-2 / Math.sqrt(20), 4 / Math.sqrt(20)]
    return <>
      <At until={2} frame={k}>
        <Grid map={te} x={[-3.9, 3.9]} y={[-3.3, 3.3]} grid={false} />
        <path d={fn(s => te(3 * Math.cos(s), 2 * Math.sin(s)), 0, 2 * Math.PI, 120)} fill="none" stroke={C.a} strokeWidth="3" />
        <T x={14} y={284} color={C.a} size={15} weight={700} anchor="start">x²/9 + y²/4 = 1</T>
        <Dot at={P0} color={C.fg} r={6} />
        <T x={P0[0] - (nx > 0 ? 14 : -14)} y={P0[1] + (ny > 0 ? 22 : -12)} anchor={nx > 0 ? 'end' : 'start'} weight={700}>P</T>
        <T x={300} y={44} anchor="start" size={15}>P = ({fmt(x0)}, {fmt(y0)})</T>
      </At>
      <At until={0} frame={k}>
        <T x={300} y={72} anchor="start" size={14} color={C.mu}>x₀²/9 + y₀²/4 = 1</T>
      </At>
      <At from={1} until={2} frame={k}>
        <Arrow from={P0} to={N} color={C.y} width={3.5} />
        <T x={gL[0]} y={gL[1]} color={C.y} weight={700} size={15}>∇F</T>
        <T x={300} y={78} anchor="start" size={15} color={C.y}>∇F(P) = ({fmt(gx)}, {fmt(gy)})</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Clip id="gb-tan" x={12} y={14} w={270} h={274}>
          <path d={pl([te(x0 - 7 * ny, y0 + 7 * nx), te(x0 + 7 * ny, y0 - 7 * nx)])} stroke={C.g} strokeWidth="3" />
        </Clip>
        <RA at={P0} a={[-ny, -nx]} c={[nx, -ny]} color={C.fg} />
        <T x={300} y={124} anchor="start" size={15} color={C.g}>xx₀/9 + yy₀/4 = 1</T>
        <T x={300} y={152} anchor="start" size={16} weight={700} color={C.g}>{lin([[x0 / 9, 'x'], [y0 / 4, 'y']])} = 1</T>
        <T x={300} y={186} anchor="start" size={13} color={C.mu}>{t('normal ⟂ garis singgung', 'normal ⟂ tangent')}</T>
      </At>
      <At from={3} frame={k}>
        <Grid map={tq} x={[-2.4, 4.6]} y={[-3.3, 3.3]} grid={false} />
        <path d={fn(y => tq(y * y / 2, y), -3, 3)} fill="none" stroke={C.a} strokeWidth="3" />
        <Clip id="gb-tan2" x={12} y={14} w={280} h={274}>
          <path d={pl([tq(-2.4, -.2), tq(4.6, 3.3)])} stroke={C.g} strokeWidth="3" />
        </Clip>
        <Arrow from={qP} to={tq(2 + 1.1 * qn[0], 2 + 1.1 * qn[1])} color={C.y} width={3.5} />
        <Dot at={qP} color={C.fg} />
        <T x={qP[0] + 12} y={qP[1] + 20} anchor="start" weight={700}>P = (2, 2)</T>
        <T x={tq(3, -2.45)[0]} y={tq(3, -2.45)[1] + 24} color={C.a} weight={700} size={15}>y² = 2x</T>
        <T x={300} y={60} anchor="start" size={15}>y² = 2px, p = 1</T>
        <T x={300} y={90} anchor="start" size={15} color={C.y}>∇F(P) = (−2, 4)</T>
        <T x={300} y={128} anchor="start" size={15} color={C.g}>yy₀ = p(x + x₀)</T>
        <T x={300} y={156} anchor="start" size={17} weight={700} color={C.g}>2y = x + 2</T>
        <T x={300} y={190} anchor="start" size={13} color={C.mu}>{t('satu titik sentuh', 'one touching point')}</T>
      </At>
    </>
  },
}

// ================================================================ conic:1 eccentricity and directrices
const ee = plane([162, 150], 34), SQ5 = Math.sqrt(5), E1 = SQ5 / 3, DX = 9 / SQ5
const eccentricity: Story = {
  title: b('Eksentrisitas: rasio jarak ke fokus dan ke direktriks', 'Eccentricity: the focus-to-directrix distance ratio'),
  control: { label: b('Posisi P: parameter t (derajat)', 'Position of P: parameter t (degrees)'), min: 0, max: 355, step: 5, initial: 60 },
  controlFrom: 1,
  frames: [
    f('Elips a = 3, b = 2: c = √(9 − 4) = √5 ≈ 2.24, jadi e = c/a = √5/3 ≈ 0.745. Setiap fokus punya direktriks sendiri, x = ±a/e = ±9/√5 ≈ ±4.02, di luar elips.', 'Ellipse a = 3, b = 2: c = √(9 − 4) = √5 ≈ 2.24, so e = c/a = √5/3 ≈ 0.745. Each focus has its own directrix, x = ±a/e = ±9/√5 ≈ ±4.02, outside the ellipse.', String.raw`e=\frac{c}{a}=\frac{\sqrt5}{3},\qquad d_{1,2}:\ x=\pm\frac{a}{e}=\pm\frac{9}{\sqrt5}`),
    f('Ambil P pada elips. Segmen hijau menuju fokus F₂ = (√5, 0), segmen kuning tegak lurus ke direktriks kanan d₂. Geser P: kedua panjang berubah.', 'Take P on the ellipse. The green segment goes to the focus F₂ = (√5, 0), the amber one perpendicular to the right directrix d₂. Move P: both lengths change.'),
    f('Rasionya tidak berubah: PF₂ / dist(P, d₂) ≈ 0.745 = e untuk setiap P. Sebabnya PF₂ = a − ex₀ dan dist = a/e − x₀ = (a − ex₀)/e.', 'The ratio never changes: PF₂ / dist(P, d₂) ≈ 0.745 = e for every P. The reason: PF₂ = a − ex₀ and dist = a/e − x₀ = (a − ex₀)/e.', String.raw`\frac{PF_2}{\operatorname{dist}(P,d_2)}=\frac{a-ex_0}{a/e-x_0}=e`),
    f('Pasangan kiri bekerja sama: PF₁ = a + ex₀ dan dist(P, d₁) = a/e + x₀, rasionya juga e. Karena e < 1, P selalu lebih dekat ke fokus daripada ke direktriksnya.', 'The left pair works the same way: PF₁ = a + ex₀ and dist(P, d₁) = a/e + x₀, again with ratio e. Since e < 1, P is always closer to the focus than to its directrix.', String.raw`PF_1=a+ex_0=e\,(a/e+x_0)`),
  ],
  readout: deg => { const x0 = 3 * Math.cos(deg * Math.PI / 180); return String.raw`x_0=${tx(x0)}:\ \frac{${tx(3 - E1 * x0)}}{${tx(DX - x0)}}=${tx(E1, 3)},\quad\frac{${tx(3 + E1 * x0)}}{${tx(DX + x0)}}=${tx(E1, 3)}` },
  draw: (k, deg, lang) => {
    const t = tr(lang), a = (k >= 1 ? deg : 60) * Math.PI / 180, x0 = 3 * Math.cos(a), y0 = 2 * Math.sin(a), P0 = ee(x0, y0)
    const right = k <= 2, Fp = ee(right ? SQ5 : -SQ5, 0), Dp = ee(right ? DX : -DX, y0)
    const pf = right ? 3 - E1 * x0 : 3 + E1 * x0, pd = right ? DX - x0 : DX + x0
    return <>
      <Grid map={ee} x={[-4.4, 4.4]} y={[-3.6, 3.6]} grid={false} />
      {[-1, 1].map(s => <g key={s}>
        <path d={`M${ee(s * DX, 0)[0]},22 V278`} stroke={C.y} strokeWidth="2.5" strokeDasharray="7 5" opacity={k >= 1 && (s > 0) !== right ? .35 : 1} />
        <T x={ee(s * DX, 0)[0] + (s > 0 ? -8 : 8)} y={34} anchor={s > 0 ? 'end' : 'start'} color={C.y} weight={700} size={15}>{s > 0 ? 'd₂' : 'd₁'}</T>
        <Dot at={ee(s * SQ5, 0)} color={C.g} r={5} />
        <T x={ee(s * SQ5, 0)[0]} y={ee(0, 0)[1] + 24} color={C.g} weight={700} size={15}>{s > 0 ? 'F₂' : 'F₁'}</T>
      </g>)}
      <path d={fn(s => ee(3 * Math.cos(s), 2 * Math.sin(s)), 0, 2 * Math.PI, 120)} fill="none" stroke={C.a} strokeWidth="3" />
      <At until={0} frame={k}>
        <T x={312} y={60} anchor="start" size={15}>a = 3, b = 2</T>
        <T x={312} y={88} anchor="start" size={15} color={C.g}>c = √5 ≈ 2.24</T>
        <T x={312} y={116} anchor="start" size={16} weight={700}>e = √5/3 ≈ 0.745</T>
        <T x={312} y={150} anchor="start" size={15} color={C.y}>a/e = 9/√5</T>
        <T x={312} y={174} anchor="start" size={15} color={C.y}>≈ 4.02</T>
      </At>
      <At from={1} frame={k}>
        <path d={pl([P0, Fp])} stroke={C.g} strokeWidth="3.5" />
        <path d={pl([P0, Dp])} stroke={C.y} strokeWidth="3.5" />
        <RA at={Dp} a={[right ? -1 : 1, 0]} c={[0, y0 >= 0 ? 1 : -1]} />
        <Dot at={P0} color={C.fg} r={6} />
        <T x={P0[0]} y={P0[1] + (y0 >= 0 ? -14 : 26)} weight={700}>P</T>
        <T x={312} y={60} anchor="start" size={15} color={C.g}>{right ? 'PF₂' : 'PF₁'} = {fmt(pf)}</T>
        <T x={312} y={88} anchor="start" size={15} color={C.y}>{right ? 'dist(P, d₂)' : 'dist(P, d₁)'} = {fmt(pd)}</T>
      </At>
      <At from={2} frame={k}>
        <T x={312} y={130} anchor="start" size={15}>{fmt(pf)} / {fmt(pd)}</T>
        <T x={312} y={162} anchor="start" size={22} weight={700} color={C.v}>= {fmt(pf / pd, 3)}</T>
        <T x={312} y={192} anchor="start" size={15} color={C.v}>= e {t('selalu', 'always')}</T>
      </At>
    </>
  },
}

// ================================================================ conic:2 hyperbola: fixed difference
const hp = plane([150, 150], 28), BS = 20
const hyperbolaDiff: Story = {
  title: b('Hiperbola: selisih dua jarak fokus tetap 2a', 'Hyperbola: the two focal distances differ by 2a'),
  control: { label: b('Posisi P: parameter t', 'Position of P: parameter t'), min: -1.5, max: 1.5, step: .1, initial: .8 },
  frames: [
    f('Hiperbola x²/4 − y² = 1: a = 2, b = 1, dan c² = a² + b² = 5, jadi fokus F₋ = (−√5, 0) dan F₊ = (√5, 0). Titik P = (2 cosh t, sinh t) ada di cabang kanan karena cosh²t − sinh²t = 1.', 'Hyperbola x²/4 − y² = 1: a = 2, b = 1, and c² = a² + b² = 5, so the foci are F₋ = (−√5, 0) and F₊ = (√5, 0). The point P = (2 cosh t, sinh t) is on the right branch because cosh²t − sinh²t = 1.', String.raw`\frac{x^2}{4}-y^2=1,\quad c^2=a^2+b^2=5`),
    f('Tarik P ke kedua fokus. Ke F₋ (ungu) jauh, ke F₊ (merah) dekat. Geser t: kedua panjang berubah, batangnya di kanan ikut berubah.', 'Join P to both foci. To F₋ (violet) is long, to F₊ (red) is short. Move t: both lengths change, and so do the bars on the right.'),
    f('Selisihnya selalu sama: |PF₋| − |PF₊| = 4 = 2a. Batang ungu dikurangi batang merah menyisakan potongan hijau yang panjangnya tetap, ke mana pun P digeser.', 'The difference is always the same: |PF₋| − |PF₊| = 4 = 2a. The violet bar minus the red bar leaves a green piece of fixed length, wherever P goes.', String.raw`|PF_-|-|PF_+|=2a=4`),
    f('Di cabang kiri tandanya terbalik: P′ = (−2 cosh t, sinh t) lebih dekat ke F₋, jadi |PF₊| − |PF₋| = 4. Nilai mutlak selisih menyatukan kedua cabang.', 'On the left branch the sign flips: P′ = (−2 cosh t, sinh t) is closer to F₋, so |PF₊| − |PF₋| = 4. The absolute value of the difference covers both branches.', String.raw`\big||PF_-|-|PF_+|\big|=2a`),
  ],
  readout: tt => { const x = 2 * Math.cosh(tt), y = Math.sinh(tt), d1 = Math.hypot(x + SQ5, y), d2 = Math.hypot(x - SQ5, y); return String.raw`t=${tx(tt)}:\ |PF_-|-|PF_+|=${tx(d1, 3)}-${tx(d2, 3)}=${tx(d1 - d2, 3)}` },
  draw: (k, tt, lang) => {
    const t = tr(lang), left = k >= 3, x = (left ? -2 : 2) * Math.cosh(tt), y = Math.sinh(tt), P0 = hp(x, y)
    const Fm = hp(-SQ5, 0), Fp = hp(SQ5, 0), dm = Math.hypot(x + SQ5, y), dp = Math.hypot(x - SQ5, y)
    const long = Math.max(dm, dp), short = Math.min(dm, dp), longC = dm > dp ? C.v : C.r, shortC = dm > dp ? C.r : C.v
    const longL = dm > dp ? '|PF₋|' : '|PF₊|', shortL = dm > dp ? '|PF₊|' : '|PF₋|'
    return <>
      <Grid map={hp} x={[-4.9, 4.9]} y={[-4.6, 4.6]} grid={false} />
      <Clip id="gb-hyp" x={12} y={14} w={276} h={274}>
        {[-1, 1].map(s => <path key={`a${s}`} d={pl([hp(-5, -2.5 * s), hp(5, 2.5 * s)])} stroke={C.mu} strokeDasharray="4 5" />)}
        {[-1, 1].map(s => <path key={s} d={fn(u => hp(2 * s * Math.cosh(u), Math.sinh(u)), -2.3, 2.3)} fill="none" stroke={C.a} strokeWidth="3" />)}
      </Clip>
      <Dot at={Fm} color={C.v} r={5} /><Dot at={Fp} color={C.r} r={5} />
      <T x={Fm[0]} y={Fm[1] + 24} color={C.v} weight={700} size={15}>F₋</T>
      <T x={Fp[0]} y={Fp[1] + 24} color={C.r} weight={700} size={15}>F₊</T>
      <At from={1} frame={k}>
        <path d={pl([P0, Fm])} stroke={C.v} strokeWidth="3" />
        <path d={pl([P0, Fp])} stroke={C.r} strokeWidth="3" />
        <T x={305} y={96} anchor="start" size={15} color={longC}>{longL} = {fmt(long)}</T>
        <rect x={305} y={104} width={long * BS} height={10} rx={3} fill={longC} />
        <T x={305} y={148} anchor="start" size={15} color={shortC}>{shortL} = {fmt(short)}</T>
        <rect x={305} y={156} width={short * BS} height={10} rx={3} fill={shortC} />
      </At>
      <Dot at={P0} color={C.fg} r={6} />
      {(() => { const flip = left && P0[0] < 40; return <T x={P0[0] + (left && !flip ? -12 : 12)} y={P0[1] + (flip && y < 0 ? 22 : -10)} anchor={left && !flip ? 'end' : 'start'} weight={700}>{left ? 'P′' : 'P'}</T> })()}
      <At until={0} frame={k}>
        <T x={305} y={60} anchor="start" size={15}>a = 2, b = 1</T>
        <T x={305} y={88} anchor="start" size={15}>c = √5 ≈ 2.24</T>
        <T x={305} y={124} anchor="start" size={15}>P = ({fmt(x)}, {fmt(y)})</T>
      </At>
      <At from={2} frame={k}>
        <rect x={305 + short * BS} y={102} width={(long - short) * BS} height={14} rx={3} fill="none" stroke={C.g} strokeWidth="2.5" />
        <path d={`M${305 + short * BS},186 V194 H${305 + long * BS} V186`} fill="none" stroke={C.g} strokeWidth="2" />
        <T x={305 + (short + long) / 2 * BS} y={216} color={C.g} size={18} weight={700}>{fmt(long - short)} = 2a</T>
        <path d={`M${305 + short * BS},120 V186 M${305 + long * BS},120 V186`} stroke={C.g} strokeDasharray="3 4" />
      </At>
      <At from={2} until={2} frame={k}>
        <T x={305} y={52} anchor="start" size={14} color={C.mu}>{t('cabang kanan', 'right branch')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={305} y={52} anchor="start" size={14} color={C.mu}>{t('cabang kiri', 'left branch')}</T>
      </At>
    </>
  },
}

// ================================================================ conic:3 parabola: focus and directrix
const pp = plane([130, 150], 40)
const parabolaFD: Story = {
  title: b('Parabola: sama jauh dari fokus dan direktriks', 'Parabola: equally far from focus and directrix'),
  control: { label: b('Koordinat y₀ dari P', 'Coordinate y₀ of P'), min: -3, max: 3, step: .25, initial: 2 },
  controlFrom: 1,
  frames: [
    f('Fokus F = (1, 0) dan direktriks x = −1, jadi p = 1. Titik puncak O = (0, 0) ada tepat di tengah: berjarak 1 ke fokus dan 1 ke direktriks.', 'Focus F = (1, 0) and directrix x = −1, so p = 1. The vertex O = (0, 0) sits exactly halfway: distance 1 to the focus and 1 to the directrix.'),
    f('Ambil P lain pada kurva. Segmen merah ke F, segmen ungu tegak lurus ke direktriks. Untuk P = (1, 2) keduanya 2. Geser P: keduanya selalu sama, yaitu x₀ + 1.', 'Take another P on the curve. The red segment goes to F, the violet one perpendicular to the directrix. For P = (1, 2) both are 2. Move P: they are always equal, namely x₀ + 1.', String.raw`|PF|=\sqrt{(x_0-1)^2+y_0^2},\quad |PD|=x_0+1`),
    f('Kuadratkan kesamaannya: (x − 1)² + y² = (x + 1)². Suku x² dan 1 saling menghapus, sisanya −2x + y² = 2x, yaitu y² = 4x. Itulah persamaan parabola ini.', 'Square the equality: (x − 1)² + y² = (x + 1)². The x² and 1 terms cancel, leaving −2x + y² = 2x, that is y² = 4x. That is the equation of this parabola.', String.raw`\sqrt{(x-1)^2+y^2}=|x+1|\implies y^2=4x`),
  ],
  readout: y0 => { const x0 = y0 * y0 / 4; return String.raw`P=(${tx(x0, 3)},${tx(y0)}):\ |PF|=${tx(Math.hypot(x0 - 1, y0), 3)}=|PD|` },
  draw: (k, yv, lang) => {
    const t = tr(lang), y0 = k >= 1 ? yv : 2, x0 = y0 * y0 / 4, P0 = pp(x0, y0), F = pp(1, 0), D = pp(-1, y0), O = pp(0, 0)
    return <>
      <Grid map={pp} x={[-2.2, 3.6]} y={[-3.4, 3.4]} grid={false} />
      <path d={`M${pp(-1, 0)[0]},18 V282`} stroke={C.y} strokeWidth="3" />
      <T x={pp(-1, 0)[0] - 8} y={32} anchor="end" color={C.y} weight={700} size={15}>x = −1</T>
      <path d={fn(y => pp(y * y / 4, y), -3.4, 3.4)} fill="none" stroke={C.a} strokeWidth="3" />
      <T x={pp(2.9, 3.4)[0]} y={y0 > 2 ? pp(2.9, -3.4)[1] + 6 : pp(2.9, 3.4)[1] + 6} anchor="start" color={C.a} weight={700} size={15}>y² = 4x</T>
      <Dot at={F} color={C.r} r={6} />
      <T x={F[0] + 4} y={F[1] + 24} color={C.r} weight={700} size={15}>F</T>
      <At until={0} frame={k}>
        <path d={pl([O, F])} stroke={C.r} strokeWidth="3" />
        <path d={pl([O, pp(-1, 0)])} stroke={C.v} strokeWidth="3" />
        <Dot at={O} color={C.fg} r={6} />
        <T x={O[0] - 6} y={O[1] + 22} weight={700} size={15}>O</T>
        <T x={(O[0] + F[0]) / 2} y={O[1] - 10} color={C.r} weight={700} size={15}>1</T>
        <T x={(O[0] + pp(-1, 0)[0]) / 2} y={O[1] - 10} color={C.v} weight={700} size={15}>1</T>
        <T x={300} y={60} anchor="start" size={15} color={C.r}>F = (1, 0)</T>
        <T x={300} y={88} anchor="start" size={15} color={C.y}>{t('direktriks', 'directrix')}: x = −1</T>
        <T x={300} y={116} anchor="start" size={15}>p = 1</T>
      </At>
      <At from={1} frame={k}>
        <path d={pl([P0, F])} stroke={C.r} strokeWidth="3.5" />
        <path d={pl([P0, D])} stroke={C.v} strokeWidth="3.5" />
        <RA at={D} a={[1, 0]} c={[0, y0 >= 0 ? 1 : -1]} />
        <Dot at={D} color={C.v} r={4} />
        <T x={D[0] + 8} y={D[1] + (y0 >= 0 ? -8 : 20)} anchor="start" color={C.v} weight={700} size={15}>D</T>
        <Dot at={P0} color={C.fg} r={6} />
        <T x={P0[0] + 10} y={P0[1] + (y0 >= 0 ? -10 : 22)} anchor="start" weight={700}>P</T>
        <T x={300} y={52} anchor="start" size={15}>P = ({fmt(x0, 3)}, {fmt(y0)})</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={300} y={90} anchor="start" size={16} weight={600} color={C.r}>|PF| = {fmt(Math.hypot(x0 - 1, y0), 3)}</T>
        <T x={300} y={118} anchor="start" size={16} weight={600} color={C.v}>|PD| = {fmt(x0 + 1, 3)}</T>
        <T x={300} y={150} anchor="start" size={14} color={C.mu}>{t('selalu sama', 'always equal')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={300} y={90} anchor="start" size={14} color={C.r}>(x₀ − 1)² + y₀²</T>
        <T x={300} y={114} anchor="start" size={15} weight={600} color={C.r}>= {fmt((x0 - 1) ** 2 + y0 * y0, 3)}</T>
        <T x={300} y={144} anchor="start" size={14} color={C.v}>(x₀ + 1)²</T>
        <T x={300} y={168} anchor="start" size={15} weight={600} color={C.v}>= {fmt((x0 + 1) ** 2, 3)}</T>
        <T x={300} y={206} anchor="start" size={15} weight={700} color={C.a}>y₀² = 4x₀:</T>
        <T x={300} y={230} anchor="start" size={15} weight={700} color={C.a}>{fmt(y0 * y0, 3)} = {fmt(4 * x0, 3)}</T>
      </At>
    </>
  },
}

// ================================================================ quadric:0-4 surfaces of revolution, sliced
type Q = {
  key: string; title: [string, string]; eq: string; s: number; c: P; parts: [number, number][]; r2: (z: number) => number
  levels: number[]; rims: number[]; isc: number; h: [number, number, number]; note: [string, string][]
  prof: string; profName: [string, string]; frames: Frame[]
}
const QX = 305, QI: P = [390, 212]
const quadric = (q: Q): Story => ({
  title: b(q.title[0], q.title[1]),
  frames: q.frames,
  control: { label: b('Tinggi bidang potong z = h', 'Height of the slicing plane z = h'), min: q.h[0], max: q.h[1], step: .1, initial: q.h[2] },
  controlFrom: 1,
  readout: h => {
    const v = q.r2(h), base = String.raw`z=${tx(h)}:\ x^2+y^2=${tx(v)}`
    return base + (v > 1e-9 ? String.raw`\Rightarrow r=${tx(Math.sqrt(v))}` : v > -1e-9 ? String.raw`\Rightarrow (0,0,${tx(h)})` : String.raw`<0\Rightarrow\emptyset`)
  },
  draw: (k, hv, lang) => {
    const t = tr(lang), V = proj(q.c, q.s), h = k >= 1 ? hv : q.h[2], R = (z: number) => Math.sqrt(Math.max(0, q.r2(z)))
    const v = q.r2(h), r = Math.sqrt(Math.max(0, v)), hc = V(0, 0, h), empty = v < -1e-9, point = !empty && v < 1e-9
    const rmax = Math.max(...q.parts.flatMap(([a, z]) => [R(a), R(z)]))
    const Wp = 1.1 * q.s * rmax, X = 1.1 * rmax, zlo = Math.min(...q.parts.map(p => p[0])), zhi = Math.max(...q.parts.map(p => p[1]))
    const id = `gb-q-${q.key}`
    return <>
      <path d={pl([V(0, 0, zlo - .15), V(0, 0, zhi + .15)])} stroke={C.ln} strokeDasharray="3 5" />
      <T x={V(0, 0, zhi + .15)[0] + 8} y={V(0, 0, zhi + .15)[1] + 6} anchor="start" color={C.mu} size={13}>z</T>
      {q.levels.map(z => <Ring key={z} c={V(0, 0, z)} rx={q.s * R(z)} ry={q.s * KQ * R(z)} color={C.a} opacity={.7} full={q.rims.includes(z)} />)}
      {q.parts.map(([a, z1], i) => <g key={i}>{[-1, 1].map(sg => <path key={sg} d={fn(z => [q.c[0] + sg * q.s * R(z), q.c[1] - q.s * z], a, z1, 90)} fill="none" stroke={C.a} strokeWidth="3" />)}</g>)}
      <T x={QX} y={40} anchor="start" size={16} weight={700} color={C.a}>{q.eq}</T>
      <At until={0} frame={k}>
        {q.note.map(([i, e], j) => <T key={j} x={QX} y={74 + 24 * j} anchor="start" size={14} color={C.mu}>{t(i, e)}</T>)}
        <T x={QX} y={280} anchor="start" size={13} color={C.mu}>{t('gambar skematis', 'schematic picture')}</T>
      </At>
      <At from={1} frame={k}>
        <Clip id={id} x={12} y={14} w={284} h={274}>
          <path d={hPlane(hc[0], hc[1], Wp)} fill={C.y} fillOpacity=".13" stroke={C.y} strokeWidth="1.5" />
          {!empty && !point && <Ring c={hc} rx={q.s * r} ry={q.s * KQ * r} color={C.v} width={3.5} full />}
          {point && <Dot at={hc} color={C.v} r={6} />}
        </Clip>
        <T x={hc[0] + Wp + .15 * Wp - 4} y={Math.max(30, Math.min(282, hc[1] - KQ * Wp - 6))} anchor="end" size={14} color={C.y} weight={700}>z = {fmt(h, 1)}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={QX} y={72} anchor="start" size={15} color={C.y}>z = h = {fmt(h, 1)}</T>
        <T x={QX} y={98} anchor="start" size={15} color={empty ? C.r : C.v}>x² + y² = {fmt(v)}</T>
        <T x={QX} y={124} anchor="start" size={16} weight={700} color={empty ? C.r : C.v}>{empty ? t('< 0: kosong', '< 0: empty') : point ? t('satu titik', 'one point') : `r = ${fmt(r)}`}</T>
        <path d={`M${QI[0] - 62},${QI[1]} H${QI[0] + 62} M${QI[0]},${QI[1] - 58} V${QI[1] + 58}`} stroke={C.ln} />
        <T x={QI[0] + 66} y={QI[1] + 5} anchor="start" size={13} color={C.mu}>x</T>
        <T x={QI[0] + 6} y={QI[1] - 54} anchor="start" size={13} color={C.mu}>y</T>
        {!empty && !point && <circle cx={QI[0]} cy={QI[1]} r={q.isc * r} fill={C.v} fillOpacity=".12" stroke={C.v} strokeWidth="3" />}
        {point && <Dot at={QI} color={C.v} r={5} />}
        {empty && <T x={QI[0] + 30} y={QI[1] - 24} size={24} weight={700} color={C.r}>∅</T>}
      </At>
      <At from={2} frame={k}>
        <path d={pl([V(-X, 0, zlo - .1), V(X, 0, zlo - .1), V(X, 0, zhi + .1), V(-X, 0, zhi + .1)], true)} fill={C.g} fillOpacity=".1" stroke={C.g} strokeWidth="1.5" />
        {q.parts.map(([a, z1], i) => <g key={i}>{[-1, 1].map(sg => <path key={sg} d={fn(z => V(sg * R(z), 0, z), a, z1, 90)} fill="none" stroke={C.g} strokeWidth="3.5" />)}</g>)}
        <T x={QX} y={72} anchor="start" size={15} color={C.g}>{t('bidang tegak', 'vertical plane')} y = 0:</T>
        <T x={QX} y={100} anchor="start" size={16} weight={700} color={C.g}>{q.prof}</T>
        <T x={QX} y={126} anchor="start" size={15} color={C.g}>{t(q.profName[0], q.profName[1])}</T>
        <path d={`M${QI[0] - 62},${QI[1]} H${QI[0] + 62} M${QI[0]},${QI[1] - 58} V${QI[1] + 58}`} stroke={C.ln} />
        <T x={QI[0] + 66} y={QI[1] + 5} anchor="start" size={13} color={C.mu}>x</T>
        <T x={QI[0] + 6} y={QI[1] - 54} anchor="start" size={13} color={C.mu}>z</T>
        {q.parts.map(([a, z1], i) => <g key={i}>{[-1, 1].map(sg => <path key={sg} d={fn(z => [QI[0] + sg * q.isc * R(z), QI[1] - q.isc * z], a, z1, 90)} fill="none" stroke={C.g} strokeWidth="3" />)}</g>)}
      </At>
    </>
  },
})

const ellipsoid = quadric({
  key: 'ell', title: ['Elipsoid: semua tanda positif, permukaan tertutup', 'Ellipsoid: all signs positive, a closed surface'], eq: 'x² + y² + z² = 1', s: 105, c: [150, 152],
  parts: [[-1, 1]], r2: z => 1 - z * z, levels: [-.7, 0, .7], rims: [], isc: 50, h: [-1.2, 1.2, .6],
  note: [['tanda +, +, +', 'signs +, +, +'], ['dan ruas kanan 1,', 'and right side 1,'], ['jadi |x|, |y|, |z| ≤ 1', 'so |x|, |y|, |z| ≤ 1']],
  prof: 'x² + z² = 1', profName: ['lingkaran', 'a circle'],
  frames: [
    f('Semua tanda positif: x² + y² + z² = 1. Setiap kuadrat paling besar 1, jadi |x|, |y|, |z| ≤ 1. Permukaannya tertutup dan terbatas, tersusun dari lingkaran-lingkaran mendatar.', 'All signs positive: x² + y² + z² = 1. Each square is at most 1, so |x|, |y|, |z| ≤ 1. The surface is closed and bounded, built from horizontal circles.', String.raw`x^2+y^2+z^2=1`),
    f('Potong dengan bidang z = h: x² + y² = 1 − h², lingkaran berjari-jari √(1 − h²). Untuk h = 0.6 jari-jarinya 0.8. Geser h melewati 1: ruas kanan negatif dan penampangnya kosong.', 'Cut with the plane z = h: x² + y² = 1 − h², a circle of radius √(1 − h²). For h = 0.6 the radius is 0.8. Slide h past 1: the right side turns negative and the section is empty.', String.raw`z=h:\ x^2+y^2=1-h^2`),
    f('Bidang tegak y = 0 memberi x² + z² = 1, juga lingkaran. Semua penampang kurva tertutup, maka permukaannya tertutup. Dengan a, b, c berbeda lingkaran-lingkaran ini menjadi elips.', 'The vertical plane y = 0 gives x² + z² = 1, again a circle. Every section is a closed curve, so the surface is closed. With different a, b, c these circles become ellipses.', String.raw`y=0:\ x^2+z^2=1`),
  ],
})
const oneSheet = quadric({
  key: 'one', title: ['Hiperboloid satu lembar: tidak pernah kosong', 'One-sheet hyperboloid: never empty'], eq: 'x² + y² − z² = 1', s: 62, c: [150, 152],
  parts: [[-1.4, 1.4]], r2: z => 1 + z * z, levels: [-1.4, -.7, 0, .7, 1.4], rims: [1.4], isc: 30, h: [-1.4, 1.4, 1],
  note: [['tanda +, +, −', 'signs +, +, −'], ['dan ruas kanan 1:', 'and right side 1:'], ['x² + y² = 1 + z² ≥ 1', 'x² + y² = 1 + z² ≥ 1']],
  prof: 'x² − z² = 1', profName: ['hiperbola', 'a hyperbola'],
  frames: [
    f('Dua kuadrat positif dan satu negatif, ruas kanan 1: x² + y² = 1 + z². Setiap tinggi z memberi lingkaran, jadi permukaannya satu lembar yang terhubung, seperti menara pendingin.', 'Two positive squares and one negative, right side 1: x² + y² = 1 + z². Every height z gives a circle, so the surface is one connected sheet, like a cooling tower.', String.raw`x^2+y^2-z^2=1`),
    f('Bidang z = h memberi x² + y² = 1 + h². Ruas kanan selalu ≥ 1, jadi penampang tidak pernah kosong. Leher tersempit di h = 0 berjari-jari 1; di h = 1 jari-jarinya √2 ≈ 1.41.', 'The plane z = h gives x² + y² = 1 + h². The right side is always ≥ 1, so the section is never empty. The narrowest neck is at h = 0 with radius 1; at h = 1 the radius is √2 ≈ 1.41.', String.raw`z=h:\ x^2+y^2=1+h^2\ge1`),
    f('Bidang tegak y = 0 memberi x² − z² = 1: hiperbola. Permukaan ini adalah hiperbola itu yang diputar mengelilingi sumbu z.', 'The vertical plane y = 0 gives x² − z² = 1: a hyperbola. The surface is that hyperbola spun around the z-axis.', String.raw`y=0:\ x^2-z^2=1`),
  ],
})
const twoSheets = quadric({
  key: 'two', title: ['Hiperboloid dua lembar: celah di tengah', 'Two-sheet hyperboloid: a gap in the middle'], eq: 'x² + y² − z² = −1', s: 50, c: [150, 150],
  parts: [[-1.9, -1], [1, 1.9]], r2: z => z * z - 1, levels: [-1.9, -1.4, 1.4, 1.9], rims: [-1.9, 1.9], isc: 28, h: [-1.9, 1.9, 1.5],
  note: [['ruas kanan negatif:', 'negative right side:'], ['x² + y² = z² − 1 ≥ 0', 'x² + y² = z² − 1 ≥ 0'], ['butuh |z| ≥ 1', 'needs |z| ≥ 1']],
  prof: 'z² − x² = 1', profName: ['hiperbola atas-bawah', 'an up-down hyperbola'],
  frames: [
    f('Ruas kanan negatif: x² + y² = z² − 1. Ruas kiri tidak pernah negatif, jadi harus z² ≥ 1. Ada dua lembar terpisah: satu di z ≥ 1, satu di z ≤ −1.', 'Negative right side: x² + y² = z² − 1. The left side is never negative, so z² ≥ 1 is needed. There are two separate sheets: one at z ≥ 1, one at z ≤ −1.', String.raw`x^2+y^2-z^2=-1`),
    f('Bidang z = h memberi x² + y² = h² − 1. Untuk |h| < 1 ruas kanan negatif dan penampangnya kosong: itulah celah di antara kedua lembar. Untuk h = 1.5 jari-jarinya √1.25 ≈ 1.12.', 'The plane z = h gives x² + y² = h² − 1. For |h| < 1 the right side is negative and the section is empty: that is the gap between the sheets. For h = 1.5 the radius is √1.25 ≈ 1.12.', String.raw`z=h:\ x^2+y^2=h^2-1`),
    f('Bidang tegak y = 0 memberi z² − x² = 1: hiperbola yang membuka ke atas dan ke bawah. Kedua cabangnya, diputar mengelilingi sumbu z, menjadi kedua lembar.', 'The vertical plane y = 0 gives z² − x² = 1: a hyperbola opening up and down. Its two branches, spun around the z-axis, become the two sheets.', String.raw`y=0:\ z^2-x^2=1`),
  ],
})
const cone = quadric({
  key: 'cone', title: ['Kerucut kuadrik: penampang menyusut ke puncak', 'Quadric cone: sections shrink to the vertex'], eq: 'x² + y² − z² = 0', s: 62, c: [150, 152],
  parts: [[-1.5, 1.5]], r2: z => z * z, levels: [-1.5, -.75, .75, 1.5], rims: [-1.5, 1.5], isc: 34, h: [-1.5, 1.5, 1],
  note: [['ruas kanan 0:', 'right side 0:'], ['x² + y² = z²', 'x² + y² = z²'], ['jari-jari = |z|', 'radius = |z|']],
  prof: 'x² = z', profName: ['dua garis x = ±z', 'two lines x = ±z'],
  frames: [
    f('Ruas kanan nol: x² + y² = z². Penampang di tinggi z adalah lingkaran berjari-jari |z|, jadi penampang mengecil secara linear menuju puncak di titik asal.', 'Zero right side: x² + y² = z². The section at height z is a circle of radius |z|, so the sections shrink linearly toward the vertex at the origin.', String.raw`x^2+y^2-z^2=0`),
    f('Bidang z = h memberi lingkaran berjari-jari |h|. Untuk h = 1 jari-jarinya 1. Tepat di h = 0 lingkarannya menyusut menjadi satu titik: puncak kerucut.', 'The plane z = h gives a circle of radius |h|. For h = 1 the radius is 1. Exactly at h = 0 the circle shrinks to one point: the vertex of the cone.', String.raw`z=h:\ x^2+y^2=h^2`),
    f('Bidang tegak y = 0 memberi x² = z², yaitu dua garis x = ±z. Kerucut tersusun dari garis-garis lurus yang semuanya melewati puncak.', 'The vertical plane y = 0 gives x² = z², that is two lines x = ±z. The cone is made of straight lines that all pass through the vertex.', String.raw`y=0:\ x^2=z^2\iff x=\pm z`),
  ],
})
cone.draw = ((d) => (k, hv, lang) => d(k, hv, lang))(cone.draw)
const bowl = quadric({
  key: 'bowl', title: ['Paraboloid eliptik: mangkuk', 'Elliptic paraboloid: a bowl'], eq: 'x² + y² = 2z', s: 60, c: [150, 248],
  parts: [[0, 2]], r2: z => 2 * z, levels: [.5, 1.2, 2], rims: [2], isc: 26, h: [-.5, 2, .5],
  note: [['x², y² bertanda sama,', 'x², y² with the same sign,'], ['z hanya berpangkat satu', 'z only to the first power'], ['x² + y² ≥ 0 ⇒ z ≥ 0', 'x² + y² ≥ 0 ⇒ z ≥ 0']],
  prof: 'x² = 2z', profName: ['parabola', 'a parabola'],
  frames: [
    f('Kuadrat x dan y bertanda sama, z hanya berpangkat satu: x² + y² = 2z. Ruas kiri ≥ 0, jadi z ≥ 0. Permukaannya mangkuk yang terbuka ke atas.', 'The x and y squares have the same sign, z appears only to the first power: x² + y² = 2z. The left side is ≥ 0, so z ≥ 0. The surface is a bowl opening upward.', String.raw`x^2+y^2=2z`),
    f('Bidang z = h memberi lingkaran berjari-jari √(2h). Untuk h = 0.5 jari-jarinya 1, untuk h = 2 jari-jarinya 2. Di h = 0 hanya titik dasar, dan untuk h < 0 penampangnya kosong.', 'The plane z = h gives a circle of radius √(2h). For h = 0.5 the radius is 1, for h = 2 it is 2. At h = 0 there is only the bottom point, and for h < 0 the section is empty.', String.raw`z=h:\ x^2+y^2=2h`),
    f('Bidang tegak y = 0 memberi x² = 2z: parabola. Mangkuk ini adalah parabola yang diputar mengelilingi sumbu z.', 'The vertical plane y = 0 gives x² = 2z: a parabola. The bowl is that parabola spun around the z-axis.', String.raw`y=0:\ x^2=2z`),
  ],
})

// ================================================================ quadric:5 hyperbolic paraboloid (saddle)
const sd = proj([150, 150], 62), SI = 30
/** Points (x, y) of x² − y² = 2h inside the square |x|, |y| ≤ 1.5, as polylines. */
const saddleSection = (h: number): [number, number][][] => {
  if (Math.abs(h) < 1e-9) return [[[-1.5, -1.5], [1.5, 1.5]], [[-1.5, 1.5], [1.5, -1.5]]]
  const N = 60
  if (h > 0) { const Y = Math.sqrt(Math.max(0, 2.25 - 2 * h)); return [1, -1].map(s => Array.from({ length: N + 1 }, (_, i) => { const y = -Y + 2 * Y * i / N; return [s * Math.sqrt(2 * h + y * y), y] as [number, number] })) }
  const X = Math.sqrt(Math.max(0, 2.25 + 2 * h)); return [1, -1].map(s => Array.from({ length: N + 1 }, (_, i) => { const x = -X + 2 * X * i / N; return [x, s * Math.sqrt(x * x - 2 * h)] as [number, number] }))
}
const saddle: Story = {
  title: b('Paraboloid hiperbolik: pelana dengan penampang hiperbola', 'Hyperbolic paraboloid: a saddle with hyperbolic sections'),
  control: { label: b('Tinggi bidang potong z = h', 'Height of the slicing plane z = h'), min: -1, max: 1, step: .1, initial: .5 },
  controlFrom: 1,
  frames: [
    f('Kuadrat bertanda berlawanan: x² − y² = 2z. Sepanjang sumbu x permukaan naik, z = x²/2 (hijau); sepanjang sumbu y turun, z = −y²/2 (merah). Bentuknya pelana.', 'Squares of opposite sign: x² − y² = 2z. Along the x-axis the surface rises, z = x²/2 (green); along the y-axis it falls, z = −y²/2 (red). It is a saddle.', String.raw`x^2-y^2=2z`),
    f('Bidang z = h memberi x² − y² = 2h: hiperbola. Untuk h = 0.5 hiperbolanya x² − y² = 1, cabangnya membuka ke kiri dan kanan (arah x).', 'The plane z = h gives x² − y² = 2h: a hyperbola. For h = 0.5 it is x² − y² = 1, its branches opening left and right (along x).', String.raw`z=h:\ x^2-y^2=2h`),
    f('Geser h ke negatif: cabangnya kini membuka ke arah y. Tepat di h = 0, x² − y² = 0 terurai menjadi dua garis y = ±x. Penampang mendatar pelana tidak pernah kosong.', 'Slide h negative: the branches now open along y. Exactly at h = 0, x² − y² = 0 splits into two lines y = ±x. A horizontal section of the saddle is never empty.', String.raw`h=0:\ (x-y)(x+y)=0`),
  ],
  readout: h => String.raw`z=${tx(h)}:\ x^2-y^2=${tx(2 * h)}`,
  draw: (k, hv, lang) => {
    const t = tr(lang), h = k >= 1 ? hv : .5, Z = (x: number, y: number) => (x * x - y * y) / 2, hc = sd(0, 0, h)
    const ticks = [-1.5, -1, -.5, 0, .5, 1, 1.5], sec = saddleSection(h), ax = Math.abs(h) < 1e-9 ? 0 : h > 0 ? 1 : -1
    return <>
      {ticks.map(c => <g key={c} opacity={Math.abs(c) === 1.5 ? 1 : .55}>
        <path d={fn(y => sd(c, y, Z(c, y)), -1.5, 1.5, 40)} fill="none" stroke={C.a} strokeWidth={Math.abs(c) === 1.5 ? 2.5 : 1.3} />
        <path d={fn(x => sd(x, c, Z(x, c)), -1.5, 1.5, 40)} fill="none" stroke={C.a} strokeWidth={Math.abs(c) === 1.5 ? 2.5 : 1.3} />
      </g>)}
      <At until={0} frame={k}>
        <path d={fn(x => sd(x, 0, Z(x, 0)), -1.5, 1.5, 40)} fill="none" stroke={C.g} strokeWidth="4" />
        <path d={fn(y => sd(0, y, Z(0, y)), -1.5, 1.5, 40)} fill="none" stroke={C.r} strokeWidth="4" />
        <T x={sd(1.5, 0, 1.125)[0] + 10} y={sd(1.5, 0, 1.125)[1]} anchor="start" color={C.g} weight={700} size={15}>x</T>
        <T x={sd(0, -1.5, -1.125)[0] + 12} y={sd(0, -1.5, -1.125)[1] + 6} anchor="start" color={C.r} weight={700} size={15}>y</T>
        <T x={QX} y={40} anchor="start" size={16} weight={700} color={C.a}>x² − y² = 2z</T>
        <T x={QX} y={76} anchor="start" size={15} color={C.g}>y = 0: z = x²/2</T>
        <T x={QX} y={100} anchor="start" size={14} color={C.g}>{t('naik: ∪', 'rises: ∪')}</T>
        <T x={QX} y={132} anchor="start" size={15} color={C.r}>x = 0: z = −y²/2</T>
        <T x={QX} y={156} anchor="start" size={14} color={C.r}>{t('turun: ∩', 'falls: ∩')}</T>
        <T x={QX} y={280} anchor="start" size={13} color={C.mu}>{t('gambar skematis', 'schematic picture')}</T>
      </At>
      <At from={1} frame={k}>
        <Clip id="gb-sad" x={12} y={14} w={284} h={274}>
          <path d={hPlane(hc[0], hc[1], 118)} fill={C.y} fillOpacity=".13" stroke={C.y} strokeWidth="1.5" />
          {sec.map((ps, i) => <path key={i} d={pl(ps.map(([x, y]) => sd(x, y, h)))} fill="none" stroke={C.v} strokeWidth="3.5" />)}
        </Clip>
        <T x={QX} y={40} anchor="start" size={16} weight={700} color={C.a}>x² − y² = 2z</T>
        <rect x={QI[0] - 1.5 * SI} y={QI[1] - 1.5 * SI} width={3 * SI} height={3 * SI} fill="none" stroke={C.faint} />
        <path d={`M${QI[0] - 56},${QI[1]} H${QI[0] + 56} M${QI[0]},${QI[1] - 56} V${QI[1] + 56}`} stroke={C.ln} />
        <T x={QI[0] + 60} y={QI[1] + 5} anchor="start" size={13} color={C.mu}>x</T>
        <T x={QI[0] + 6} y={QI[1] - 52} anchor="start" size={13} color={C.mu}>y</T>
        {sec.map((ps, i) => <path key={i} d={pl(ps.map(([x, y]) => [QI[0] + SI * x, QI[1] - SI * y]))} fill="none" stroke={C.v} strokeWidth="3" />)}
      </At>
      <At from={1} until={1} frame={k}>
        <T x={QX} y={72} anchor="start" size={15} color={C.y}>z = h = {fmt(h, 1)}</T>
        <T x={QX} y={98} anchor="start" size={15} weight={700} color={C.v}>x² − y² = {fmt(2 * h, 1)}</T>
        <T x={QX} y={124} anchor="start" size={14} color={C.v}>{ax === 0 ? t('dua garis', 'two lines') : t('hiperbola', 'a hyperbola')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={QX} y={72} anchor="start" size={14} weight={ax > 0 ? 700 : 400} color={ax > 0 ? C.v : C.mu}>h &gt; 0: {t('buka ke arah x', 'opens along x')}</T>
        <T x={QX} y={98} anchor="start" size={14} weight={ax === 0 ? 700 : 400} color={ax === 0 ? C.v : C.mu}>h = 0: y = ±x</T>
        <T x={QX} y={124} anchor="start" size={14} weight={ax < 0 ? 700 : 400} color={ax < 0 ? C.v : C.mu}>h &lt; 0: {t('buka ke arah y', 'opens along y')}</T>
      </At>
    </>
  },
}

// ================================================================ quadric:6 two families of rulings on z = x² − y²
const rs = proj([150, 150], 95)
/** Point of z = x² − y² with x − y = s, x + y = u. */
const ru = (s: number, u: number): P => rs((s + u) / 2, (u - s) / 2, s * u)
const SV = [-1, -.75, -.5, -.25, 0, .25, .5, .75, 1]
const rulings: Story = {
  title: b('Garis lurus di dalam pelana', 'Straight lines inside a saddle'),
  control: { label: b('Pilih garis: s', 'Choose the line: s'), min: -1, max: 1, step: .1, initial: .4 },
  controlFrom: 1,
  frames: [
    f('Pelana z = x² − y² tampak melengkung ke segala arah: potongan y = 0 adalah parabola ke atas (hijau), potongan x = 0 parabola ke bawah (merah). Namun x² − y² = (x − y)(x + y).', 'The saddle z = x² − y² looks curved in every direction: the cut y = 0 is an upward parabola (green), the cut x = 0 a downward one (red). But x² − y² = (x − y)(x + y).', String.raw`z=x^2-y^2=(x-y)(x+y)`),
    f('Tetapkan x − y = s. Persamaannya menjadi z = s(x + y). Dengan s tetap, keduanya linear dalam x, y, z: itu sebuah garis, dan setiap titiknya memenuhi persamaan pelana. Geser s.', 'Fix x − y = s. The equation becomes z = s(x + y). With s fixed both are linear in x, y, z: that is a line, and every point of it satisfies the saddle equation. Move s.', String.raw`x-y=s,\quad z=s(x+y)`),
    f('Setiap s memberi satu garis. Garis-garis ungu ini membentuk keluarga pertama; bersama-sama mereka menyapu seluruh pelana.', 'Each s gives one line. These violet lines form the first family; together they sweep out the whole saddle.'),
    f('Tukar peran: x + y = s dan z = s(x − y) memberi keluarga kedua (hijau). Melalui setiap titik pelana lewat tepat satu garis dari setiap keluarga.', 'Swap the roles: x + y = s and z = s(x − y) give the second family (green). Through every point of the saddle passes exactly one line of each family.', String.raw`x+y=s,\quad z=s(x-y)`),
  ],
  readout: s => String.raw`x-y=${tx(s)},\ z=${tx(s)}(x+y):\ (${tx((s + .5) / 2, 3)},${tx((.5 - s) / 2, 3)},${tx(s / 2, 3)})\Rightarrow x^2-y^2=${tx(s / 2, 3)}`,
  draw: (k, sv, lang) => {
    const t = tr(lang), s = k >= 1 ? sv : .4, chk = ru(s, .5), X = (s + .5) / 2, Y = (.5 - s) / 2
    return <>
      <path d={pl([ru(-1, -1), ru(1, -1), ru(1, 1), ru(-1, 1)], true)} fill={C.a} fillOpacity=".06" stroke={C.a} strokeWidth="2.5" />
      <At until={0} frame={k}>
        {[-.5, .5].map(c => <g key={c} opacity=".5">
          <path d={fn(y => rs(c, y, c * c - y * y), -(1 - Math.abs(c)), 1 - Math.abs(c), 30)} fill="none" stroke={C.a} strokeWidth="1.5" />
          <path d={fn(x => rs(x, c, x * x - c * c), -(1 - Math.abs(c)), 1 - Math.abs(c), 30)} fill="none" stroke={C.a} strokeWidth="1.5" />
        </g>)}
        <path d={fn(x => rs(x, 0, x * x), -1, 1, 40)} fill="none" stroke={C.g} strokeWidth="4" />
        <path d={fn(y => rs(0, y, -y * y), -1, 1, 40)} fill="none" stroke={C.r} strokeWidth="4" />
        <T x={rs(1, 0, 1)[0] + 10} y={rs(1, 0, 1)[1] + 4} anchor="start" color={C.g} weight={700} size={15}>y = 0</T>
        <T x={rs(0, -1, -1)[0] + 10} y={rs(0, -1, -1)[1] + 6} anchor="start" color={C.r} weight={700} size={15}>x = 0</T>
        <T x={QX} y={40} anchor="start" size={16} weight={700} color={C.a}>z = x² − y²</T>
        <T x={QX} y={76} anchor="start" size={15} color={C.g}>y = 0: z = x²</T>
        <T x={QX} y={102} anchor="start" size={15} color={C.r}>x = 0: z = −y²</T>
        <T x={QX} y={140} anchor="start" size={14} color={C.mu}>{t('|x| + |y| ≤ 1 digambar', '|x| + |y| ≤ 1 is drawn')}</T>
      </At>
      <At from={2} frame={k}>
        {SV.map(c => <path key={c} d={pl([ru(c, -1), ru(c, 1)])} stroke={C.a} strokeWidth="1.8" opacity=".8" />)}
      </At>
      <At from={3} frame={k}>
        {SV.map(c => <path key={c} d={pl([ru(-1, c), ru(1, c)])} stroke={C.g} strokeWidth="1.8" opacity=".8" />)}
      </At>
      <At from={1} frame={k}>
        <path d={pl([ru(s, -1), ru(s, 1)])} stroke={C.r} strokeWidth="4" />
        <Dot at={chk} color={C.fg} r={5} />
        <T x={QX} y={40} anchor="start" size={16} weight={700} color={C.a}>z = x² − y²</T>
        <T x={QX} y={72} anchor="start" size={15} color={C.r}>x − y = {fmt(s, 1)}</T>
        <T x={QX} y={96} anchor="start" size={15} color={C.r}>z = {fmt(s, 1)}(x + y)</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={QX} y={136} anchor="start" size={14} color={C.mu}>{t('titik dengan x + y = 0.5:', 'point with x + y = 0.5:')}</T>
        <T x={QX} y={160} anchor="start" size={14}>({fmt(X, 3)}, {fmt(Y, 3)}, {fmt(s / 2, 3)})</T>
        <T x={QX} y={186} anchor="start" size={14}>x² − y² = {fmt(X * X - Y * Y, 3)}</T>
        <T x={QX} y={210} anchor="start" size={14} color={C.g} weight={700}>= z ✓</T>
      </At>
      <At from={2} frame={k}>
        <T x={QX} y={140} anchor="start" size={14} color={C.a} weight={600}>{t('keluarga 1', 'family 1')}: x − y = s</T>
      </At>
      <At from={3} frame={k}>
        <T x={QX} y={166} anchor="start" size={14} color={C.g} weight={600}>{t('keluarga 2', 'family 2')}: x + y = s</T>
        <T x={QX} y={200} anchor="start" size={13} color={C.mu}>{t('satu garis tiap keluarga', 'one line of each family')}</T>
        <T x={QX} y={220} anchor="start" size={13} color={C.mu}>{t('melalui setiap titik', 'through every point')}</T>
      </At>
    </>
  },
}

// ================================================================ eigen:0 quadratic-form matrix and invariants
const ip = plane([372, 178], 36)
const formMatrix: Story = {
  title: b('Dari bentuk kuadrat ke matriks simetris', 'From a quadratic form to a symmetric matrix'),
  frames: [
    f('Bentuk kuadrat x² + 2xy + y² punya tiga koefisien: 1 di x², 2 di xy, dan 1 di y².', 'The quadratic form x² + 2xy + y² has three coefficients: 1 at x², 2 at xy, and 1 at y².', String.raw`x^2+2xy+y^2`),
    f('Simpan di matriks simetris A. Diagonal memuat koefisien x² dan y². Dalam xᵀAx suku xy muncul dua kali (dari a₁₂ dan a₂₁), jadi koefisien 2 dibagi dua: a₁₂ = a₂₁ = 1.', 'Store it in a symmetric matrix A. The diagonal holds the x² and y² coefficients. In xᵀAx the xy term appears twice (from a₁₂ and a₂₁), so the coefficient 2 is halved: a₁₂ = a₂₁ = 1.', String.raw`x^TAx=a_{11}x^2+2a_{12}xy+a_{22}y^2`),
    f('Invarian: I = tr A = 2 dan δ = det A = 0. Putar sumbu 45° ke arah vektor eigen (1, 1) dan (1, −1): A menjadi diag(2, 0). Trace tetap 2, determinan tetap 0. Kurva x² + 2xy + y² = 1 adalah dua garis x + y = ±1.', 'Invariants: I = tr A = 2 and δ = det A = 0. Rotate the axes 45° onto the eigenvectors (1, 1) and (1, −1): A becomes diag(2, 0). The trace stays 2, the determinant stays 0. The curve x² + 2xy + y² = 1 is the two lines x + y = ±1.', String.raw`Q^TAQ=\begin{pmatrix}2&0\\0&0\end{pmatrix},\quad I=2,\ \delta=0`),
    f('Matriks diperbesar Ã juga menyimpan suku linear, dibagi dua dengan aturan yang sama, dan konstanta. Untuk x² + 2xy + y² + 4x − 2 = 0: a = (2, 0), a₀₀ = −2, dan Δ = det Ã = −4.', 'The augmented matrix Ã also stores the linear terms, halved by the same rule, and the constant. For x² + 2xy + y² + 4x − 2 = 0: a = (2, 0), a₀₀ = −2, and Δ = det Ã = −4.', String.raw`\widetilde A=\begin{pmatrix}1&1&2\\1&1&0\\2&0&-2\end{pmatrix},\quad \Delta=-4`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <At until={1} frame={k}>
        <Box x={30} y={22} w={120} color={C.a}>x²: 1</Box>
        <Box x={180} y={22} w={120} color={C.y}>xy: 2</Box>
        <Box x={330} y={22} w={120} color={C.g}>y²: 1</Box>
      </At>
      <At until={0} frame={k}>
        <T x={240} y={150} size={26} weight={700}><tspan fill={C.a}>1</tspan>·x² + <tspan fill={C.y}>2</tspan>·xy + <tspan fill={C.g}>1</tspan>·y²</T>
        <T x={240} y={200} size={15} color={C.mu}>{t('tiga koefisien, empat tempat di matriks 2 × 2', 'three coefficients, four slots in a 2 × 2 matrix')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={46} y={186} size={18} weight={700} anchor="end">A =</T>
        <Mat x={56} y={140} w={50} h={40} size={20} rows={[[['1', C.a], ['1', C.y]], [['1', C.y], ['1', C.g]]]} />
        <Arrow from={[70, 62]} to={[85, 140]} color={C.a} width={2} head={8} />
        <Arrow from={[390, 62]} to={[146, 192]} color={C.g} width={2} head={8} dash="5 4" />
        <Arrow from={[220, 62]} to={[140, 148]} color={C.y} width={2} head={8} />
        <Arrow from={[230, 62]} to={[96, 192]} color={C.y} width={2} head={8} />
        <T x={240} y={104} size={15} weight={700} color={C.y} anchor="start">2 = 1 + 1</T>
        {[['x', 'x'], ['x', 'y'], ['y', 'x'], ['y', 'y']].map(([r, c], i) => {
          const cx = 290 + 80 * (i % 2), cy = 150 + 44 * Math.floor(i / 2), col = i === 0 ? C.a : i === 3 ? C.g : C.y
          return <g key={i}><rect x={cx} y={cy} width={74} height={38} rx={6} fill={col} fillOpacity=".1" stroke={col} /><T x={cx + 37} y={cy + 25} size={15} color={col} weight={600}>1·{r}{c}</T></g>
        })}
        <T x={329} y={142} size={13} color={C.mu}>x</T><T x={409} y={142} size={13} color={C.mu}>y</T>
        <T x={280} y={174} size={13} color={C.mu} anchor="end">x</T><T x={280} y={218} size={13} color={C.mu} anchor="end">y</T>
        <T x={370} y={262} size={15} weight={600}>= x² + 2xy + y²</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={46} y={86} size={18} weight={700} anchor="end">A =</T>
        <Mat x={56} y={44} w={46} h={36} size={18} rows={[[['1', C.a], ['1', C.y]], [['1', C.y], ['1', C.g]]]} />
        <T x={24} y={160} anchor="start" size={16} weight={600}>I = tr A = 1 + 1 = 2</T>
        <T x={24} y={190} anchor="start" size={16} weight={600}>δ = det A = 1 − 1 = 0</T>
        <T x={24} y={232} anchor="start" size={15} color={C.v}>QᵀAQ = diag(2, 0)</T>
        <T x={24} y={258} anchor="start" size={14} color={C.v}>tr = 2, det = 0 {t('tetap', 'unchanged')}</T>
        <Grid map={ip} x={[-2.3, 2.3]} y={[-2.3, 2.3]} grid={false} />
        <Clip id="gb-form" x={282} y={90} w={182} h={176}>
          {[-1, 1].map(c => <path key={c} d={pl([ip(c - 3, 3), ip(c + 3, -3)])} stroke={C.a} strokeWidth="3" />)}
          <path d={pl([ip(-3, -3), ip(3, 3)])} stroke={C.v} strokeWidth="1.8" strokeDasharray="6 4" />
          <path d={pl([ip(-3, 3), ip(3, -3)])} stroke={C.v} strokeWidth="1.8" strokeDasharray="6 4" />
        </Clip>
        <T x={ip(1.6, 1.6)[0] + 4} y={ip(1.6, 1.6)[1] - 2} anchor="start" size={14} color={C.v} weight={700}>λ = 2</T>
        <T x={ip(1.6, -1.6)[0] + 4} y={ip(1.6, -1.6)[1] + 12} anchor="start" size={14} color={C.v} weight={700}>λ = 0</T>
        <T x={372} y={78} size={15} color={C.a} weight={600}>(x + y)² = 1</T>
      </At>
      <At from={3} frame={k}>
        {([['x²: 1', C.a], ['xy: 2', C.y], ['y²: 1', C.g], ['x: 4', C.v], ['1: −2', C.mu]] as [string, string][]).map(([s, c], i) =>
          <Box key={i} x={17 + 90 * i} y={22} w={82} color={c} size={15}>{s}</Box>)}
        <T x={46} y={168} size={18} weight={700} anchor="end">Ã =</T>
        <Mat x={56} y={108} w={52} h={40} size={19} rows={[[['1', C.a], ['1', C.y], ['2', C.v]], [['1', C.y], ['1', C.g], ['0', C.v]], [['2', C.v], ['0', C.v], ['−2', C.mu]]]} />
        <rect x={62} y={110} width={106} height={78} rx={6} fill="none" stroke={C.ln} strokeDasharray="4 4" />
        <Arrow from={[340, 62]} to={[196, 118]} color={C.v} width={2} head={8} />
        <Arrow from={[330, 62]} to={[96, 230]} color={C.v} width={2} head={8} dash="5 4" />
        <T x={290} y={96} size={15} weight={700} color={C.v} anchor="start">4 = 2 + 2</T>
        <T x={250} y={150} anchor="start" size={15} color={C.v}>a = (2, 0)</T>
        <T x={250} y={176} anchor="start" size={15} color={C.mu}>a₀₀ = −2</T>
        <T x={250} y={210} anchor="start" size={15}>δ = det A = 0</T>
        <T x={250} y={236} anchor="start" size={16} weight={700}>Δ = det Ã = −4</T>
        <T x={250} y={268} anchor="start" size={13} color={C.mu}>{t('kotak putus-putus = A', 'dashed box = A')}</T>
      </At>
    </>
  },
}

// ================================================================ eigen:1 conic centres from Ah + a = 0
const ca = plane([80, 190], 30), cb = plane([90, 150], 30), CX = 262
const centers: Story = {
  title: b('Pusat konik: satu, tidak ada, atau tak hingga', 'Conic centres: one, none, or infinitely many'),
  frames: [
    f('Lingkaran x² + y² − 4x − 2y − 4 = 0: A = I dan a = (−2, −1). Geser titik asal ke h dengan x = X + h. Untuk h = (2, 1) suku linear hilang: X² + Y² = 9.', 'Circle x² + y² − 4x − 2y − 4 = 0: A = I and a = (−2, −1). Move the origin to h with x = X + h. For h = (2, 1) the linear terms vanish: X² + Y² = 9.', String.raw`x=X+h:\ \text{linear}=2(Ah+a)^TX`),
    f('Pusat memenuhi Ah + a = 0. Setiap baris sistem adalah garis: h₁ − 2 = 0 (kuning) dan h₂ − 1 = 0 (hijau). A invertibel, jadi kedua garis berpotongan di satu titik: pusat (2, 1).', 'The centre satisfies Ah + a = 0. Each row of the system is a line: h₁ − 2 = 0 (amber) and h₂ − 1 = 0 (green). A is invertible, so the two lines cross at one point: the centre (2, 1).', String.raw`\begin{pmatrix}1&0\\0&1\end{pmatrix}h+\begin{pmatrix}-2\\-1\end{pmatrix}=0\Rightarrow h=(2,1)`),
    f('Parabola y² − 4x = 0: A = diag(0, 1) singular dan a = (−2, 0). Baris pertama menjadi 0·h₁ + 0·h₂ − 2 = 0, yaitu 0 = 2: mustahil. Parabola tidak punya pusat.', 'Parabola y² − 4x = 0: A = diag(0, 1) is singular and a = (−2, 0). The first row becomes 0·h₁ + 0·h₂ − 2 = 0, that is 0 = 2: impossible. The parabola has no centre.', String.raw`\begin{pmatrix}0&0\\0&1\end{pmatrix}h+\begin{pmatrix}-2\\0\end{pmatrix}=0:\ 0=2`),
    f('Dua garis sejajar y² − 1 = 0: A sama, tetapi a = (0, 0). Baris pertama 0 = 0 selalu benar, baris kedua h₂ = 0. Seluruh garis y = 0 terdiri dari pusat.', 'Two parallel lines y² − 1 = 0: same A, but a = (0, 0). The first row 0 = 0 always holds, the second gives h₂ = 0. The whole line y = 0 consists of centres.', String.raw`\begin{pmatrix}0&0\\0&1\end{pmatrix}h=0\Rightarrow h=(t,0)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), O = ca(2, 1)
    return <>
      <At until={1} frame={k}>
        <Grid map={ca} x={[-1.6, 5.6]} y={[-2.6, 4.6]} />
        <circle cx={O[0]} cy={O[1]} r={90} fill="none" stroke={C.a} strokeWidth="3" />
        <Dot at={O} color={C.v} r={6} />
        <T x={ca(0, 0)[0] - 8} y={ca(0, 0)[1] + 20} anchor="end" weight={700} size={15}>O</T>
        <T x={CX} y={40} anchor="start" size={13} weight={600} color={C.a}>x² + y² − 4x − 2y − 4 = 0</T>
        <T x={CX} y={66} anchor="start" size={15}>A = I, a = (−2, −1)</T>
      </At>
      <At until={0} frame={k}>
        <path d={pl([ca(-1.6, 1), ca(5.6, 1)])} stroke={C.v} strokeWidth="1.8" strokeDasharray="6 4" />
        <path d={pl([ca(2, -2.6), ca(2, 4.6)])} stroke={C.v} strokeWidth="1.8" strokeDasharray="6 4" />
        <T x={ca(5.5, 1)[0]} y={ca(5.5, 1)[1] - 8} anchor="end" color={C.v} weight={700} size={15}>X</T>
        <T x={ca(2, 4.5)[0] + 8} y={ca(2, 4.5)[1] + 6} anchor="start" color={C.v} weight={700} size={15}>Y</T>
        <Arrow from={ca(0, 0)} to={O} color={C.v} width={3} />
        <T x={ca(1, .5)[0] + 4} y={ca(1, .5)[1] + 20} color={C.v} weight={700} size={15}>h</T>
        <T x={CX} y={104} anchor="start" size={15} color={C.v}>x = X + h, h = (2, 1)</T>
        <T x={CX} y={138} anchor="start" size={17} weight={700} color={C.g}>X² + Y² = 9</T>
        <T x={CX} y={162} anchor="start" size={13} color={C.mu}>{t('tanpa suku linear', 'no linear terms')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([ca(2, -2.6), ca(2, 4.6)])} stroke={C.y} strokeWidth="3" />
        <path d={pl([ca(-1.6, 1), ca(5.6, 1)])} stroke={C.g} strokeWidth="3" />
        <Dot at={O} color={C.v} r={7} />
        <T x={O[0] + 10} y={O[1] - 10} anchor="start" color={C.v} weight={700} size={15}>(2, 1)</T>
        <T x={CX} y={104} anchor="start" size={15} color={C.y}>1·h₁ + 0·h₂ − 2 = 0</T>
        <T x={CX} y={130} anchor="start" size={15} color={C.g}>0·h₁ + 1·h₂ − 1 = 0</T>
        <T x={CX} y={166} anchor="start" size={16} weight={700} color={C.v}>h = (2, 1)</T>
        <T x={CX} y={190} anchor="start" size={14} color={C.v}>{t('tepat satu pusat', 'exactly one centre')}</T>
      </At>
      <At from={2} frame={k}>
        <Grid map={cb} x={[-1.6, 5.6]} y={[-4.2, 4.2]} />
        <T x={cb(0, 0)[0] - 8} y={cb(0, 0)[1] + 20} anchor="end" weight={700} size={15}>O</T>
        <T x={CX} y={66} anchor="start" size={15}>A = diag(0, 1)</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={fn(y => cb(y * y / 4, y), -4.1, 4.1)} fill="none" stroke={C.a} strokeWidth="3" />
        <path d={pl([cb(-1.6, 0), cb(5.6, 0)])} stroke={C.g} strokeWidth="2.5" strokeDasharray="7 4" />
        <T x={CX} y={40} anchor="start" size={15} weight={600} color={C.a}>y² − 4x = 0</T>
        <T x={CX} y={92} anchor="start" size={15}>a = (−2, 0)</T>
        <T x={CX} y={128} anchor="start" size={15} color={C.r}>0·h₁ + 0·h₂ − 2 = 0</T>
        <T x={CX} y={152} anchor="start" size={15} color={C.r} weight={700}>0 = 2 ✗</T>
        <T x={CX} y={182} anchor="start" size={15} color={C.g}>h₂ = 0</T>
        <T x={CX} y={218} anchor="start" size={16} weight={700} color={C.r}>{t('tidak ada pusat', 'no centre')}</T>
      </At>
      <At from={3} frame={k}>
        {[-1, 1].map(c => <path key={c} d={pl([cb(-1.6, c), cb(5.6, c)])} stroke={C.a} strokeWidth="3" />)}
        <path d={pl([cb(-1.6, 0), cb(5.6, 0)])} stroke={C.v} strokeWidth="5" opacity=".8" />
        {[0, 1.5, 3, 4.5].map(x => <Dot key={x} at={cb(x, 0)} color={C.v} r={4} />)}
        <T x={cb(5.5, 1)[0]} y={cb(5.5, 1)[1] - 8} anchor="end" color={C.a} weight={700} size={15}>y = 1</T>
        <T x={cb(5.5, -1)[0]} y={cb(5.5, -1)[1] + 20} anchor="end" color={C.a} weight={700} size={15}>y = −1</T>
        <T x={CX} y={40} anchor="start" size={15} weight={600} color={C.a}>y² − 1 = 0</T>
        <T x={CX} y={92} anchor="start" size={15}>a = (0, 0)</T>
        <T x={CX} y={128} anchor="start" size={15} color={C.mu}>0·h₁ + 0·h₂ = 0 ✓</T>
        <T x={CX} y={152} anchor="start" size={15} color={C.g}>h₂ = 0</T>
        <T x={CX} y={188} anchor="start" size={16} weight={700} color={C.v}>{t('garis pusat y = 0', 'a line of centres y = 0')}</T>
      </At>
    </>
  },
}

// ================================================================ reduce:0 eigenvalue signs and conic type
const rp = plane([150, 150], 40)
const qName = (q: number, t: (i: string, e: string) => string) => q > 1e-9 ? t('elips', 'an ellipse') : q < -1e-9 ? t('hiperbola', 'a hyperbola') : t('dua garis X = ±1', 'two lines X = ±1')
const signClass: Story = {
  title: b('Tanda eigenvalue menentukan jenis konik', 'Eigenvalue signs decide the conic type'),
  control: { label: b('Eigenvalue kedua q', 'Second eigenvalue q'), min: -2, max: 2, step: .25, initial: .5 },
  frames: [
    f('Setelah rotasi dan translasi persamaannya X² + qY² = 1, dengan eigenvalue λ₁ = 1 dan λ₂ = q. Untuk q = 0.5 keduanya positif: jumlah dua kuadrat positif sama dengan 1 memberi elips.', 'After rotation and translation the equation is X² + qY² = 1, with eigenvalues λ₁ = 1 and λ₂ = q. For q = 0.5 both are positive: two positive squares adding to 1 give an ellipse.', String.raw`X^2+qY^2=1,\quad \delta=\lambda_1\lambda_2=q`),
    f('Geser q ke bawah nol. Tanda eigenvalue berlawanan, δ = q < 0, dan kurvanya menjadi hiperbola X² − |q|Y² = 1 dengan puncak tetap di X = ±1.', 'Slide q below zero. The eigenvalue signs are opposite, δ = q < 0, and the curve becomes the hyperbola X² − |q|Y² = 1 with its vertices still at X = ±1.', String.raw`q<0:\ X^2-|q|Y^2=1`),
    f('Tepat di q = 0 satu arah tidak punya kuadrat. X² = 1 hanyalah dua garis sejajar X = ±1, bukan parabola.', 'Exactly at q = 0 one direction has no square. X² = 1 is just two parallel lines X = ±1, not a parabola.', String.raw`q=0:\ X^2=1\iff X=\pm1`),
    f('Parabola butuh suku linear pada arah eigenvalue nol: X² + Y = 1 (kuning) memakai Y yang tadinya hilang. Kurva kuning melewati (±1, 0), titik yang sama dengan garis tadi.', 'A parabola needs a linear term in the zero-eigenvalue direction: X² + Y = 1 (amber) uses the Y that was missing. The amber curve passes through (±1, 0), the same points as the lines.', String.raw`X^2+Y=1`),
  ],
  readout: q => String.raw`\lambda_1=1,\ \lambda_2=q=${tx(q)},\ \delta=${tx(q)}`,
  draw: (k, q, lang) => {
    const t = tr(lang), col = q > 1e-9 ? C.a : q < -1e-9 ? C.r : C.y
    let curve: ReactNode
    if (q > 1e-9) curve = <path d={fn(s => rp(Math.cos(s), Math.sin(s) / Math.sqrt(q)), 0, 2 * Math.PI, 120)} fill="none" stroke={col} strokeWidth="3.5" />
    else if (q < -1e-9) { const m = Math.asinh(3.4 * Math.sqrt(-q)); curve = <>{[-1, 1].map(s => <path key={s} d={fn(u => rp(s * Math.cosh(u), Math.sinh(u) / Math.sqrt(-q)), -m, m)} fill="none" stroke={col} strokeWidth="3.5" />)}</> }
    else curve = <>{[-1, 1].map(s => <path key={s} d={pl([rp(s, -3.4), rp(s, 3.4)])} stroke={col} strokeWidth="3.5" />)}</>
    return <>
      <Grid map={rp} x={[-3.4, 3.4]} y={[-3.4, 3.4]} />
      <T x={rp(3.3, 0)[0]} y={rp(3.3, 0)[1] - 8} anchor="end" size={14} color={C.mu}>X</T>
      <T x={rp(0, 3.3)[0] + 8} y={rp(0, 3.3)[1] + 6} anchor="start" size={14} color={C.mu}>Y</T>
      <Clip id="gb-sign" x={12} y={14} w={276} h={274}>{curve}</Clip>
      <At from={3} frame={k}>
        <Clip id="gb-sign2" x={12} y={14} w={276} h={274}>
          <path d={fn(x => rp(x, 1 - x * x), -2.3, 2.3)} fill="none" stroke={C.y} strokeWidth="3" strokeDasharray="8 5" />
        </Clip>
        <T x={305} y={210} anchor="start" size={15} weight={700} color={C.y}>X² + Y = 1</T>
        <T x={305} y={234} anchor="start" size={14} color={C.y}>{t('parabola', 'a parabola')}</T>
      </At>
      <Dot at={rp(1, 0)} color={C.fg} r={4} /><Dot at={rp(-1, 0)} color={C.fg} r={4} />
      <T x={305} y={50} anchor="start" size={15}>λ₁ = 1</T>
      <T x={305} y={76} anchor="start" size={15} color={col}>λ₂ = q = {fmt(q)}</T>
      <T x={305} y={102} anchor="start" size={15} color={col}>δ = λ₁λ₂ = {fmt(q)}</T>
      <T x={305} y={136} anchor="start" size={15} color={C.mu}>{q > 1e-9 ? t('tanda sama', 'same signs') : q < -1e-9 ? t('tanda berlawanan', 'opposite signs') : t('satu eigenvalue nol', 'one zero eigenvalue')}</T>
      <T x={305} y={164} anchor="start" size={17} weight={700} color={col}>{qName(q, t)}</T>
    </>
  },
}

// ================================================================ reduce:1 degenerate quadrics: cylinders and planes
const dc = plane([150, 150], 80), dv = proj([150, 160], 70)
const degenerate: Story = {
  title: b('Koordinat yang hilang memberi silinder dan bidang', 'A missing coordinate gives cylinders and planes'),
  control: { label: b('Tinggi bidang potong z = h', 'Height of the slicing plane z = h'), min: -1.2, max: 1.2, step: .1, initial: .5 },
  controlFrom: 1,
  frames: [
    f('Di bidang, x² + y² = 1 adalah lingkaran berjari-jari 1. Perhatikan: z sama sekali tidak muncul di persamaan ini.', 'In the plane, x² + y² = 1 is the circle of radius 1. Notice: z does not appear in this equation at all.', String.raw`x^2+y^2=1`),
    f('Di ruang, z bebas: setiap titik lingkaran boleh punya z berapa pun. Penampang di setiap tinggi z = h adalah lingkaran yang sama berjari-jari 1, tanpa menyempit. Hasilnya silinder.', 'In space, z is free: every circle point may have any z. The section at every height z = h is the same circle of radius 1, with no narrowing. The result is a cylinder.', String.raw`x^2+y^2=1,\ z\in\mathbb R`),
    f('Jika persamaannya menjadi x² = 1, solusinya x = 1 atau x = −1, dengan y dan z bebas: dua bidang sejajar. Setiap bidang z = h memotongnya menjadi dua garis.', 'If the equation becomes x² = 1, its solutions are x = 1 or x = −1 with y and z free: two parallel planes. Every plane z = h cuts them in two lines.', String.raw`x^2=1\iff x=\pm1`),
    f('Keempat persamaan ini sama-sama punya det A = 0 (z tidak muncul), tetapi hasilnya berbeda. Rank, suku linear, dan konstanta yang menentukan jenisnya.', 'All four equations have det A = 0 (z does not appear), yet the results differ. Rank, linear terms and the constant decide the type.'),
  ],
  readout: h => String.raw`z=${tx(h)}:\ x^2+y^2=1\Rightarrow r=1`,
  draw: (k, hv, lang) => {
    const t = tr(lang), h = k >= 1 ? hv : .5, hc = dv(0, 0, h)
    const cards: [string, [string, string], [string, string], string][] = [
      ['x² + y² = 1', ['silinder', 'a cylinder'], ['rank 2, konstanta ≠ 0', 'rank 2, constant ≠ 0'], C.a],
      ['x² + y² = 0', ['satu garis: sumbu z', 'one line: the z-axis'], ['rank 2, konstanta 0', 'rank 2, constant 0'], C.v],
      ['x² = 1', ['dua bidang sejajar', 'two parallel planes'], ['rank 1, konstanta ≠ 0', 'rank 1, constant ≠ 0'], C.g],
      ['y² = 2x', ['silinder parabolik', 'a parabolic cylinder'], ['rank 1, suku linear', 'rank 1, linear term'], C.y],
    ]
    const pV = (sx: number, y: number, z: number) => dv(sx, y, z)
    return <>
      <At until={0} frame={k}>
        <Grid map={dc} x={[-1.6, 1.6]} y={[-1.6, 1.6]} grid={false} />
        <circle cx={150} cy={150} r={80} fill="none" stroke={C.a} strokeWidth="3.5" />
        <path d={pl([dc(0, 0), dc(Math.SQRT1_2, Math.SQRT1_2)])} stroke={C.fg} strokeWidth="2" />
        <T x={dc(.2, .5)[0]} y={dc(.2, .5)[1]} size={15} weight={700}>1</T>
        <T x={305} y={60} anchor="start" size={16} weight={700} color={C.a}>x² + y² = 1</T>
        <T x={305} y={92} anchor="start" size={15} color={C.mu}>{t('z tidak muncul', 'z does not appear')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([dv(0, 0, -1.4), dv(0, 0, 1.4)])} stroke={C.ln} strokeDasharray="3 5" />
        {[-1.2, -.6, 0, .6, 1.2].map(z => <Ring key={z} c={dv(0, 0, z)} rx={70} ry={70 * KQ} color={C.a} opacity={.7} full={z === 1.2} />)}
        {[-1, 1].map(s => <path key={s} d={`M${150 + 70 * s},${dv(0, 0, -1.2)[1]} V${dv(0, 0, 1.2)[1]}`} stroke={C.a} strokeWidth="3" />)}
        <Clip id="gb-cyl" x={12} y={14} w={284} h={274}>
          <path d={hPlane(hc[0], hc[1], 92)} fill={C.y} fillOpacity=".13" stroke={C.y} strokeWidth="1.5" />
          <Ring c={hc} rx={70} ry={70 * KQ} color={C.v} width={3.5} full />
        </Clip>
        <T x={305} y={40} anchor="start" size={16} weight={700} color={C.a}>x² + y² = 1</T>
        <T x={305} y={72} anchor="start" size={15} color={C.y}>z = h = {fmt(h, 1)}</T>
        <T x={305} y={98} anchor="start" size={15} color={C.v}>x² + y² = 1</T>
        <T x={305} y={124} anchor="start" size={16} weight={700} color={C.v}>r = 1 {t('selalu', 'always')}</T>
        <path d={`M${QI[0] - 62},${QI[1]} H${QI[0] + 62} M${QI[0]},${QI[1] - 58} V${QI[1] + 58}`} stroke={C.ln} />
        <circle cx={QI[0]} cy={QI[1]} r={44} fill={C.v} fillOpacity=".12" stroke={C.v} strokeWidth="3" />
      </At>
      <At from={2} until={2} frame={k}>
        <path d={pl([dv(0, 0, -1.4), dv(0, 0, 1.4)])} stroke={C.ln} strokeDasharray="3 5" />
        {[-1, 1].map(s => <path key={s} d={pl([pV(s, -1.3, -1.2), pV(s, 1.3, -1.2), pV(s, 1.3, 1.2), pV(s, -1.3, 1.2)], true)} fill={C.g} fillOpacity=".14" stroke={C.g} strokeWidth="2.5" />)}
        <Clip id="gb-pln" x={12} y={14} w={284} h={274}>
          <path d={hPlane(hc[0], hc[1], 118)} fill={C.y} fillOpacity=".1" stroke={C.y} strokeWidth="1.5" />
        </Clip>
        {[-1, 1].map(s => <path key={s} d={pl([pV(s, -1.3, h), pV(s, 1.3, h)])} stroke={C.v} strokeWidth="4" />)}
        <T x={pV(1, -1.3, -1.2)[0] + 8} y={pV(1, -1.3, -1.2)[1] + 4} anchor="start" color={C.g} weight={700} size={15}>x = 1</T>
        <T x={pV(-1, -1.3, -1.2)[0] - 8} y={pV(-1, -1.3, -1.2)[1] + 4} anchor="end" color={C.g} weight={700} size={15}>x = −1</T>
        <T x={305} y={40} anchor="start" size={16} weight={700} color={C.g}>x² = 1</T>
        <T x={305} y={72} anchor="start" size={15} color={C.g}>{t('dua bidang', 'two planes')} x = ±1</T>
        <T x={305} y={98} anchor="start" size={15} color={C.y}>z = h = {fmt(h, 1)}</T>
        <T x={305} y={124} anchor="start" size={15} color={C.v}>{t('dua garis', 'two lines')}</T>
        <path d={`M${QI[0] - 62},${QI[1]} H${QI[0] + 62} M${QI[0]},${QI[1] - 58} V${QI[1] + 58}`} stroke={C.ln} />
        {[-1, 1].map(s => <path key={s} d={`M${QI[0] + 44 * s},${QI[1] - 56} V${QI[1] + 56}`} stroke={C.v} strokeWidth="3" />)}
      </At>
      <At from={3} frame={k}>
        {cards.map(([eq, res, det, col], i) => {
          const x = 18 + 226 * (i % 2), y = 22 + 134 * Math.floor(i / 2)
          return <g key={i}>
            <rect x={x} y={y} width={218} height={122} rx={10} fill={col} fillOpacity=".08" stroke={col} strokeWidth="1.8" />
            <T x={x + 14} y={y + 32} anchor="start" size={17} weight={700} color={col}>{eq}</T>
            <T x={x + 14} y={y + 66} anchor="start" size={15} weight={600}>{t(res[0], res[1])}</T>
            <T x={x + 14} y={y + 96} anchor="start" size={13} color={C.mu}>{t(det[0], det[1])}</T>
          </g>
        })}
      </At>
    </>
  },
}

// ================================================================ reduce:2 classification after reduction: X² ± Y² = k
const sv = plane([118, 190], 45), tv = plane([362, 150], 50), tw = plane([150, 150], 55)
const kSets: Story = {
  title: b('Ruas kanan k menentukan himpunan nyata', 'The right-hand constant k decides the real set'),
  control: { label: b('Konstanta ruas kanan k', 'Right-hand constant k'), min: -2, max: 2, step: .25, initial: 1 },
  frames: [
    f('Bentuk tereduksi X² + Y² = k. Ruas kiri adalah mangkuk z = X² + Y² (kiri: dilihat dari samping). Himpunan nyata adalah tempat mangkuk dipotong garis tinggi k (kanan: dilihat dari atas). Untuk k = 1: lingkaran berjari-jari 1.', 'Reduced form X² + Y² = k. The left side is the bowl z = X² + Y² (left: side view). The real set is where the bowl meets height k (right: top view). For k = 1: a circle of radius 1.', String.raw`X^2+Y^2=k`),
    f('Geser k melewati nol. k > 0: lingkaran berjari-jari √k. k = 0: hanya titik (0, 0). k < 0: kosong, karena jumlah dua kuadrat tidak pernah negatif. Koefisien kuadratnya tidak berubah sama sekali.', 'Slide k across zero. k > 0: a circle of radius √k. k = 0: only the point (0, 0). k < 0: empty, because a sum of two squares is never negative. The square coefficients do not change at all.', String.raw`k>0:\ r=\sqrt k,\quad k=0:\ (0,0),\quad k<0:\ \emptyset`),
    f('Tanda berlawanan: X² − Y² = k. Sekarang k > 0 memberi hiperbola kiri-kanan, k < 0 hiperbola atas-bawah, dan k = 0 dua garis Y = ±X. Himpunannya tidak pernah kosong.', 'Opposite signs: X² − Y² = k. Now k > 0 gives a left-right hyperbola, k < 0 an up-down hyperbola, and k = 0 the two lines Y = ±X. The set is never empty.', String.raw`X^2-Y^2=k`),
  ],
  draw: (k, kk, lang) => {
    const t = tr(lang), kc = k >= 1 ? kk : 1, r = Math.sqrt(Math.max(0, kc)), col = kc > 1e-9 ? C.a : kc < -1e-9 ? C.r : C.y
    const ky = sv(0, kc)[1]
    let hyp: ReactNode
    if (Math.abs(kc) < 1e-9) hyp = <>{[-1, 1].map(s => <path key={s} d={pl([tw(-2.3, -2.3 * s), tw(2.3, 2.3 * s)])} stroke={C.y} strokeWidth="3.5" />)}</>
    else { const a = Math.sqrt(Math.abs(kc)), m = Math.acosh(2.4 / a); hyp = <>{[-1, 1].map(s => <path key={s} d={fn(u => kc > 0 ? tw(s * a * Math.cosh(u), a * Math.sinh(u)) : tw(a * Math.sinh(u), s * a * Math.cosh(u)), -m, m)} fill="none" stroke={C.a} strokeWidth="3.5" />)}</> }
    return <>
      <At until={1} frame={k}>
        <Grid map={sv} x={[-2.2, 2.2]} y={[-2.1, 3.9]} grid={false} />
        <Clip id="gb-ks" x={12} y={14} w={222} h={274}>
          <path d={fn(x => sv(x, x * x), -2.1, 2.1)} fill="none" stroke={C.mu} strokeWidth="3" />
          <path d={`M18,${ky} H222`} stroke={col} strokeWidth="2.5" strokeDasharray="7 4" />
        </Clip>
        <T x={sv(2.05, 3.6)[0] + 4} y={sv(2.05, 3.6)[1] + 30} anchor="start" size={13} color={C.mu}>z</T>
        <T x={22} y={ky - 8} anchor="start" size={15} weight={700} color={col}>z = k = {fmt(kc)}</T>
        {kc > 1e-9 && [-1, 1].map(s => <Dot key={s} at={sv(s * r, kc)} color={col} r={6} />)}
        {Math.abs(kc) <= 1e-9 && <Dot at={sv(0, 0)} color={col} r={6} />}
        <T x={118} y={284} size={13} color={C.mu}>{t('samping: z = X²', 'side: z = X²')}</T>
        <Grid map={tv} x={[-1.9, 1.9]} y={[-1.9, 1.9]} />
        {kc > 1e-9 && <circle cx={tv(0, 0)[0]} cy={tv(0, 0)[1]} r={50 * r} fill={col} fillOpacity=".1" stroke={col} strokeWidth="3.5" />}
        {Math.abs(kc) <= 1e-9 && <Dot at={tv(0, 0)} color={col} r={6} />}
        {kc < -1e-9 && <T x={tv(.8, .8)[0]} y={tv(.8, .8)[1]} size={28} weight={700} color={C.r}>∅</T>}
        <T x={362} y={270} size={16} weight={700} color={col}>X² + Y² = {fmt(kc)}</T>
        <T x={362} y={36} size={14} color={C.mu}>{t('atas', 'top')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={470} y={60} anchor="end" size={15} weight={700} color={col}>{kc > 1e-9 ? `r = √k = ${fmt(r)}` : kc < -1e-9 ? t('kosong', 'empty') : t('satu titik', 'one point')}</T>
      </At>
      <At from={2} frame={k}>
        <Grid map={tw} x={[-2.4, 2.4]} y={[-2.4, 2.4]} />
        <Clip id="gb-ks2" x={12} y={14} w={276} h={274}>{hyp}</Clip>
        <T x={305} y={50} anchor="start" size={16} weight={700} color={C.a}>X² − Y² = {fmt(kc)}</T>
        <T x={305} y={84} anchor="start" size={14} weight={kc > 1e-9 ? 700 : 400} color={kc > 1e-9 ? C.a : C.mu}>k &gt; 0:</T>
        <T x={317} y={103} anchor="start" size={14} weight={kc > 1e-9 ? 700 : 400} color={kc > 1e-9 ? C.a : C.mu}>{t('hiperbola kiri-kanan', 'left-right hyperbola')}</T>
        <T x={305} y={134} anchor="start" size={14} weight={Math.abs(kc) < 1e-9 ? 700 : 400} color={Math.abs(kc) < 1e-9 ? C.y : C.mu}>k = 0: Y = ±X</T>
        <T x={305} y={166} anchor="start" size={14} weight={kc < -1e-9 ? 700 : 400} color={kc < -1e-9 ? C.a : C.mu}>k &lt; 0:</T>
        <T x={317} y={185} anchor="start" size={14} weight={kc < -1e-9 ? 700 : 400} color={kc < -1e-9 ? C.a : C.mu}>{t('hiperbola atas-bawah', 'up-down hyperbola')}</T>
        <T x={305} y={222} anchor="start" size={14} color={C.g}>{t('tidak pernah kosong', 'never empty')}</T>
      </At>
    </>
  },
}

// ================================================================ affine:0 translation, homothety, orientation
const ap = plane([140, 160], 38)
const TRI: P[] = [[.4, .4], [1.6, .4], [.4, 1.6]]
const homothety: Story = {
  title: b('Translasi dan homoteti', 'Translation and homothety'),
  control: { label: b('Faktor homoteti k', 'Homothety factor k'), min: -1.5, max: 2, step: .25, initial: 2 },
  controlFrom: 1,
  frames: [
    f('Translasi T(x) = x + c dengan c = (1.5, 0.5): setiap titik segitiga bergeser dengan panah yang sama. Bentuk, ukuran, dan orientasi tidak berubah.', 'Translation T(x) = x + c with c = (1.5, 0.5): every point of the triangle moves by the same arrow. Shape, size and orientation do not change.', String.raw`T(x)=x+c,\quad c=(1.5,\,0.5)`),
    f('Homoteti berpusat O dengan faktor k: T(x) = kx. Setiap titik bergerak sepanjang sinar dari O, jaraknya ke O dikali |k|. Untuk k = 2 sisi menjadi dua kali, luas empat kali: faktor luas k² = det(kI).', 'Homothety about O with factor k: T(x) = kx. Every point moves along its ray from O, its distance to O multiplied by |k|. For k = 2 the sides double and the area quadruples: area factor k² = det(kI).', String.raw`T(x)=kx,\quad \det(kI)=k^2`),
    f('Geser k ke negatif, misalnya −1.5: segitiga pindah ke sisi seberang O. Urutan A → B → C tetap berlawanan arah jarum jam, karena det(kI) = k² > 0. Di bidang, homoteti negatif = putaran 180° yang diskalakan.', 'Slide k negative, say −1.5: the triangle moves to the opposite side of O. The order A → B → C stays counterclockwise, because det(kI) = k² > 0. In the plane, a negative homothety = a scaled 180° turn.', String.raw`k<0:\ \det(kI)=k^2>0`),
    f('Bandingkan refleksi (x, y) → (x, −y): determinannya −1, sehingga urutan A → B → C menjadi searah jarum jam. Tanda determinan negatif membalik orientasi.', 'Compare the reflection (x, y) → (x, −y): its determinant is −1, so the order A → B → C becomes clockwise. A negative determinant reverses orientation.', String.raw`\det\begin{pmatrix}1&0\\0&-1\end{pmatrix}=-1`),
  ],
  readout: kk => String.raw`T(x)=${tx(kk)}x:\quad 0.72\to${tx(.72 * kk * kk, 3)},\quad \det(kI)=${tx(kk * kk, 4)}`,
  draw: (k, kk, lang) => {
    const t = tr(lang), names = ['A', 'B', 'C']
    const map = (g: (p: P) => P) => TRI.map(g)
    const img = k === 3 ? map(([x, y]) => [x, -y]) : k === 0 ? map(([x, y]) => [x + 1.5, y + .5]) : map(([x, y]) => [kk * x, kk * y])
    const cen = (ps: P[]): P => ap((ps[0][0] + ps[1][0] + ps[2][0]) / 3, (ps[0][1] + ps[1][1] + ps[2][1]) / 3)
    const cross = (ps: P[]) => (ps[1][0] - ps[0][0]) * (ps[2][1] - ps[0][1]) - (ps[1][1] - ps[0][1]) * (ps[2][0] - ps[0][0])
    const sg = Math.sign(cross(img)), deg = Math.abs(kk) < 1e-9 && k >= 1 && k <= 2
    const ic = cen(img), icol = sg < 0 ? C.r : C.v
    const lab = TRI.map((p, i) => { const q = ap(p[0], p[1]); return { x: q[0] + (i === 1 ? 10 : -8), y: q[1] + (i === 2 ? -6 : k === 3 ? 5 : 18), a: i === 1 ? 'start' as const : 'end' as const } })
    /** Primed labels: radial from the image centroid, turned away from boxes already taken (original labels, O). */
    const taken = lab.map(l => l.a === 'start' ? [l.x, l.y - 13, l.x + 12, l.y + 3] : [l.x - 12, l.y - 13, l.x, l.y + 3])
    if (k === 1 || k === 2) taken.push([ap(0, 0)[0] - 24, ap(0, 0)[1] - 22, ap(0, 0)[0] - 6, ap(0, 0)[1] - 4])
    const plab = img.map(p => {
      const q = ap(p[0], p[1]), a0 = Math.atan2(q[1] - ic[1], q[0] - ic[0])
      for (const da of [0, .8, -.8, 1.6, -1.6, 2.4, -2.4, Math.PI]) {
        const c: P = [q[0] + 17 * Math.cos(a0 + da), q[1] + 17 * Math.sin(a0 + da)], bx = [c[0] - 10, c[1] - 9, c[0] + 10, c[1] + 9]
        if (!taken.some(t => t[0] < bx[2] && bx[0] < t[2] && t[1] < bx[3] && bx[1] < t[3])) { taken.push(bx); return c }
      }
      return [q[0] + 17 * Math.cos(a0), q[1] + 17 * Math.sin(a0)] as P
    })
    return <>
      <Grid map={ap} x={[-2.8, 3.6]} y={[-2.7, 3.6]} />
      <path d={pl(TRI.map(p => ap(p[0], p[1])), true)} fill={C.a} fillOpacity=".18" stroke={C.a} strokeWidth="3" />
      {lab.map((l, i) => <T key={i} x={l.x} y={l.y} anchor={l.a} color={C.a} weight={700} size={14}>{names[i]}</T>)}
      <Turn c={cen(TRI)} r={9} sgn={1} color={C.a} />
      <At from={1} until={2} frame={k}>
        {TRI.map((p, i) => { const far = Math.max(1, Math.abs(kk)) * (kk < 0 ? -1 : 1); return <path key={i} d={pl([kk < 0 ? ap(p[0], p[1]) : ap(0, 0), ap(far * p[0], far * p[1])])} fill="none" stroke={C.mu} strokeDasharray="3 5" /> })}
        <Dot at={ap(0, 0)} color={C.fg} r={5} />
        <T x={ap(0, 0)[0] - 8} y={ap(0, 0)[1] - 8} anchor="end" weight={700} size={15}>O</T>
      </At>
      {!deg && <g>
        {k === 0 && TRI.map((p, i) => <Arrow key={i} from={ap(p[0], p[1])} to={ap(img[i][0], img[i][1])} color={C.g} width={2} head={8} />)}
        <path d={pl(img.map(p => ap(p[0], p[1])), true)} fill={icol} fillOpacity=".18" stroke={icol} strokeWidth="3" />
        {img.map((p, i) => { const q = ap(p[0], p[1])
          // reflection: mirror the original label offsets, so A′, B′ sit beside their points and C′ below
          return k === 3 ? <T key={i} x={q[0] + (i === 1 ? 10 : -8)} y={q[1] + (i === 2 ? 16 : 5)} anchor={i === 1 ? 'start' : 'end'} color={icol} weight={700} size={14}>{names[i]}′</T>
            : <T key={i} x={plab[i][0]} y={plab[i][1] + 5} color={icol} weight={700} size={14}>{names[i]}′</T> })}
        {Math.abs(cross(img)) > .3 && <Turn c={ic} r={Math.min(16, 9 * Math.max(1, Math.abs(k === 0 || k === 3 ? 1 : kk)))} sgn={sg} color={icol} />}
      </g>}
      {deg && <Dot at={ap(0, 0)} color={C.r} r={7} />}
      <At until={0} frame={k}>
        <T x={318} y={60} anchor="start" size={15} color={C.g}>c = (1.5, 0.5)</T>
        <T x={318} y={90} anchor="start" size={15}>{t('luas', 'area')} 0.72 → 0.72</T>
        <T x={318} y={118} anchor="start" size={14} color={C.mu}>{t('orientasi tetap', 'orientation kept')}</T>
      </At>
      <At from={1} until={2} frame={k}>
        <T x={318} y={60} anchor="start" size={16} weight={700}>k = {fmt(kk)}</T>
        <T x={318} y={90} anchor="start" size={15}>{t('luas', 'area')} 0.72 → {fmt(.72 * kk * kk, 3)}</T>
        <T x={318} y={118} anchor="start" size={15} color={C.v}>× k² = {fmt(kk * kk, 4)}</T>
        <T x={318} y={150} anchor="start" size={14} color={deg ? C.r : C.mu}>{deg ? t('k = 0: runtuh ke O', 'k = 0: collapses to O') : kk < 0 ? t('sisi seberang O', 'opposite side of O') : t('sisi yang sama', 'same side')}</T>
        <T x={318} y={174} anchor="start" size={14} color={C.mu}>{deg ? '' : t('arah putar tetap', 'turning sense kept')}</T>
      </At>
      <At from={3} frame={k}>
        <path d={pl([ap(-2.8, 0), ap(3.6, 0)])} stroke={C.y} strokeWidth="2.5" strokeDasharray="7 4" />
        <T x={318} y={60} anchor="start" size={15}>(x, y) → (x, −y)</T>
        <T x={318} y={90} anchor="start" size={16} weight={700} color={C.r}>det = −1</T>
        <T x={318} y={118} anchor="start" size={14} color={C.r}>{t('orientasi terbalik', 'orientation reversed')}</T>
        <T x={318} y={146} anchor="start" size={14} color={C.mu}>{t('luas tetap 0.72', 'area stays 0.72')}</T>
      </At>
    </>
  },
}

// ================================================================ affine:1 fixed points of an affine map
const fa = plane([200, 150], 45), RING = Array.from({ length: 8 }, (_, i) => i * Math.PI / 4)
const fixedPts: Story = {
  title: b('Titik tetap: selesaikan (B − I)x = −c', 'Fixed points: solve (B − I)x = −c'),
  frames: [
    f('T(x) = 2x + (1, 0). Panah membawa setiap titik hijau ke bayangannya. Contoh: O = (0, 0) pergi ke (1, 0). Semua panah tampak menjauh dari satu titik.', 'T(x) = 2x + (1, 0). The arrows carry each green point to its image. Example: O = (0, 0) goes to (1, 0). All arrows seem to point away from one spot.', String.raw`T(x)=2x+\begin{pmatrix}1\\0\end{pmatrix}`),
    f('Titik tetap memenuhi T(x) = x: 2x + (1, 0) = x, jadi (B − I)x = −c memberi x = (−1, 0). Cek: 2(−1, 0) + (1, 0) = (−1, 0). B − I = I invertibel, jadi titik tetapnya tunggal.', 'A fixed point satisfies T(x) = x: 2x + (1, 0) = x, so (B − I)x = −c gives x = (−1, 0). Check: 2(−1, 0) + (1, 0) = (−1, 0). B − I = I is invertible, so the fixed point is unique.', String.raw`(B-I)x=-c:\ (2-1)x=-(1,0)\Rightarrow x=(-1,0)`),
    f('Translasi bukan nol T(x) = x + (1, 0): B − I = 0, jadi persamaannya 0 = −(1, 0), mustahil. Semua titik bergeser sama jauh; tidak ada yang tetap.', 'A nonzero translation T(x) = x + (1, 0): B − I = 0, so the equation reads 0 = −(1, 0), impossible. Every point moves by the same amount; none stays put.', String.raw`(B-I)x=0\ne-c`),
    f('B − I singular tetapi sistemnya konsisten: T(x, y) = (x, 2 − y) memberi 0 = 0 dan −2y = −2. Seluruh garis y = 1 tetap: itulah cermin refleksi ini.', 'B − I singular but the system consistent: T(x, y) = (x, 2 − y) gives 0 = 0 and −2y = −2. The whole line y = 1 stays fixed: it is the mirror of this reflection.', String.raw`\begin{pmatrix}0&0\\0&-2\end{pmatrix}\begin{pmatrix}x\\y\end{pmatrix}=\begin{pmatrix}0\\-2\end{pmatrix}\Rightarrow y=1`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), F = fa(-1, 0)
    return <>
      <Grid map={fa} x={[-3.6, 2]} y={[-2.5, 2.5]} />
      <At until={1} frame={k}>
        {RING.map(a => { const p = fa(-1 + Math.cos(a), Math.sin(a)), q = fa(-1 + 2 * Math.cos(a), 2 * Math.sin(a)); return <g key={a}><Arrow from={p} to={q} color={C.v} width={2.5} head={8} /><Dot at={p} color={C.g} r={5} /></g> })}
        <T x={fa(0, 0)[0] + 6} y={fa(0, 0)[1] + 20} anchor="start" weight={700} size={14}>O</T>
        <T x={305} y={50} anchor="start" size={15}>T(x) = 2x + (1, 0)</T>
        <T x={305} y={78} anchor="start" size={15}>O → (1, 0)</T>
      </At>
      <At from={1} until={1} frame={k}>
        <circle cx={F[0]} cy={F[1]} r={9} fill="none" stroke={C.r} strokeWidth="3" />
        <Dot at={F} color={C.r} r={5} />
        <T x={F[0] - 4} y={F[1] - 16} color={C.r} weight={700} size={15}>(−1, 0)</T>
        <T x={305} y={118} anchor="start" size={15}>2x + (1, 0) = x</T>
        <T x={305} y={144} anchor="start" size={16} weight={700} color={C.r}>x = (−1, 0)</T>
        <T x={305} y={176} anchor="start" size={14} color={C.mu}>2(−1, 0) + (1, 0)</T>
        <T x={305} y={198} anchor="start" size={14} color={C.mu}>= (−1, 0) ✓</T>
        <T x={305} y={230} anchor="start" size={14} color={C.mu}>{t('B − I = I: invertibel', 'B − I = I: invertible')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        {RING.map(a => { const p = fa(-1 + Math.cos(a), Math.sin(a)), q = fa(Math.cos(a), Math.sin(a)); return <g key={a}><Arrow from={p} to={q} color={C.v} width={2.5} head={8} /><Dot at={p} color={C.g} r={5} /></g> })}
        <T x={305} y={50} anchor="start" size={15}>T(x) = x + (1, 0)</T>
        <T x={305} y={84} anchor="start" size={15}>B − I = 0</T>
        <T x={305} y={110} anchor="start" size={16} weight={700} color={C.r}>0 = −(1, 0) ✗</T>
        <T x={305} y={140} anchor="start" size={14} color={C.r}>{t('tidak ada titik tetap', 'no fixed point')}</T>
      </At>
      <At from={3} frame={k}>
        <path d={pl([fa(-3.6, 1), fa(2, 1)])} stroke={C.r} strokeWidth="3.5" />
        {[-2.5, -1.5, -.5, .5].map(x => <g key={x}><Arrow from={fa(x, 0)} to={fa(x, 2)} color={C.v} width={2.5} head={8} /><Dot at={fa(x, 0)} color={C.g} r={5} /></g>)}
        {[-3, -2, -1, 0, 1].map(x => <Dot key={x} at={fa(x, 1)} color={C.r} r={4} />)}
        <T x={fa(1.9, 1)[0]} y={fa(1.9, 1)[1] - 10} anchor="end" color={C.r} weight={700} size={15}>y = 1</T>
        <T x={305} y={50} anchor="start" size={15}>T(x, y) = (x, 2 − y)</T>
        <T x={305} y={84} anchor="start" size={15} color={C.mu}>0·x = 0 ✓</T>
        <T x={305} y={110} anchor="start" size={15}>−2y = −2</T>
        <T x={305} y={140} anchor="start" size={16} weight={700} color={C.r}>{t('garis tetap', 'fixed line')} y = 1</T>
      </At>
    </>
  },
}

// ================================================================ affine:2 the determinant measures area change
const dp = plane([150, 200], 48)
const detArea: Story = {
  title: b('Determinan = faktor perubahan luas', 'The determinant = the area change factor'),
  control: { label: b('Regangan s pada A = diag(s, 1)', 'Stretch s in A = diag(s, 1)'), min: -2, max: 2.5, step: .25, initial: 2 },
  frames: [
    f('A = diag(s, 1) meregangkan arah x sebesar s. Persegi satuan (luas 1) menjadi persegi panjang selebar |s|, jadi luasnya |det A| = |s|. Untuk s = 2 luasnya 2.', 'A = diag(s, 1) stretches the x-direction by s. The unit square (area 1) becomes a rectangle of width |s|, so its area is |det A| = |s|. For s = 2 the area is 2.', String.raw`\det\begin{pmatrix}s&0\\0&1\end{pmatrix}=s`),
    f('Daerah lain juga: bagi cakram berjari-jari 0.9 menjadi kotak-kotak kecil. Setiap kotak dikali faktor |det A| yang sama, jadi luas π·0.9² ≈ 2.54 menjadi |s| kali lipat.', 'Other regions too: split a disc of radius 0.9 into small squares. Every square is multiplied by the same factor |det A|, so the area π·0.9² ≈ 2.54 becomes |s| times as large.', String.raw`\text{area}(A\Omega)=|\det A|\,\text{area}(\Omega)`),
    f('Geser s ke negatif. Gambarnya tercermin: putaran dari e₁ ke e₂ yang semula berlawanan jarum jam menjadi searah jarum jam. Luasnya tetap |s|, tetapi tanda det A = s negatif menandai orientasi terbalik.', 'Slide s negative. The picture is mirrored: the turn from e₁ to e₂, counterclockwise before, becomes clockwise. The area is still |s|, but the negative sign of det A = s marks reversed orientation.', String.raw`\det A<0\iff\text{orientation reversed}`),
  ],
  readout: s => String.raw`\det A=${tx(s)},\quad 1\to${tx(Math.abs(s))},\quad ${tx(Math.PI * .81, 2)}\to${tx(Math.PI * .81 * Math.abs(s), 2)}`,
  draw: (k, s, lang) => {
    const t = tr(lang), cells: P[] = []
    for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) { const x = (i + .5) * .3, y = (j + .5) * .3; if (Math.hypot(x, y) < .9) cells.push([i * .3, j * .3]) }
    const col = s < 0 ? C.r : C.v, flat = Math.abs(s) < 1e-9
    return <>
      <Grid map={dp} x={[-2.2, 2.7]} y={[-.8, 3.6]} />
      <At until={0} frame={k}>
        <path d={pl([dp(0, 0), dp(1, 0), dp(1, 1), dp(0, 1)], true)} fill="none" stroke={C.a} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d={pl([dp(0, 0), dp(s, 0), dp(s, 1), dp(0, 1)], true)} fill={col} fillOpacity=".2" stroke={col} strokeWidth="3" />
      </At>
      <At from={2} frame={k}>
        <path d={pl([dp(0, 0), dp(1, 0), dp(1, 1), dp(0, 1)], true)} fill="none" stroke={C.a} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d={pl([dp(0, 0), dp(s, 0), dp(s, 1), dp(0, 1)], true)} fill={col} fillOpacity=".2" stroke={col} strokeWidth="3" />
        {!flat && <Arrow from={dp(0, 0)} to={dp(s, 0)} color={col} width={3.5} />}
        <Arrow from={dp(0, 0)} to={dp(0, 1)} color={C.g} width={3.5} />
        <T x={dp(s, 0)[0] + (s < 0 ? -6 : 6)} y={dp(0, 0)[1] + 22} anchor={s < 0 ? 'end' : 'start'} color={col} weight={700} size={15}>Ae₁</T>
        <T x={dp(0, 1)[0] + (s < 0 ? 8 : -8)} y={dp(0, 1)[1] - 6} anchor={s < 0 ? 'start' : 'end'} color={C.g} weight={700} size={15}>Ae₂</T>
        {!flat && <Turn c={dp(s / 2, .5)} r={12} sgn={Math.sign(s)} color={col} />}
      </At>
      <At from={1} until={1} frame={k}>
        {cells.map(([x, y], i) => <path key={`o${i}`} d={pl([dp(x, y + 1.6), dp(x + .3, y + 1.6), dp(x + .3, y + 1.9), dp(x, y + 1.9)], true)} fill="none" stroke={C.a} strokeOpacity=".5" />)}
        <circle cx={dp(0, 1.6)[0]} cy={dp(0, 1.6)[1]} r={.9 * 48} fill="none" stroke={C.a} strokeWidth="2.5" strokeDasharray="6 4" />
        {cells.map(([x, y], i) => <path key={`n${i}`} d={pl([dp(s * x, y + 1.6), dp(s * (x + .3), y + 1.6), dp(s * (x + .3), y + 1.9), dp(s * x, y + 1.9)], true)} fill={col} fillOpacity=".14" stroke={col} strokeOpacity=".7" />)}
        <ellipse cx={dp(0, 1.6)[0]} cy={dp(0, 1.6)[1]} rx={Math.max(.5, Math.abs(s) * .9 * 48)} ry={.9 * 48} fill="none" stroke={col} strokeWidth="3" />
      </At>
      <T x={318} y={60} anchor="start" size={16} weight={700} color={col}>det A = s = {fmt(s)}</T>
      <At until={0} frame={k}>
        <T x={318} y={92} anchor="start" size={15}>{t('luas', 'area')}: 1 → {fmt(Math.abs(s))}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={318} y={92} anchor="start" size={15}>{t('cakram', 'disc')}: 2.54 → {fmt(Math.PI * .81 * Math.abs(s))}</T>
        <T x={318} y={118} anchor="start" size={14} color={C.mu}>{t('tiap kotak', 'each square')}:</T>
        <T x={318} y={138} anchor="start" size={14} color={C.mu}>0.09 → {fmt(.09 * Math.abs(s), 3)}</T>
      </At>
      <At from={2} frame={k}>
        <T x={318} y={92} anchor="start" size={15}>{t('luas', 'area')}: 1 → |s| = {fmt(Math.abs(s))}</T>
        <T x={318} y={124} anchor="start" size={14} color={col}>{flat ? t('s = 0: luas 0', 's = 0: area 0') : s < 0 ? t('searah jarum jam:', 'clockwise:') : t('berlawanan jarum jam', 'counterclockwise')}</T>
        {s < 0 && <T x={318} y={144} anchor="start" size={14} color={col}>{t('orientasi terbalik', 'orientation reversed')}</T>}
        <T x={318} y={176} anchor="start" size={13} color={C.mu}>{t('translasi: luas tetap', 'translation: area kept')}</T>
      </At>
    </>
  },
}

// ================================================================ isometry:0 reflection and reflecting twice
const mp = plane([150, 150], 34)
const MT: P[] = [[1, .5], [3, .5], [1.5, 2.5]]
const reflection: Story = {
  title: b('Refleksi: dua kali kembali ke awal', 'Reflection: twice brings you back'),
  frames: [
    f('Cermin y = 0. Refleksi (x, y) → (x, −y) membawa segitiga ABC ke A′B′C′. C = (1.5, 2.5) dan C′ = (1.5, −2.5) sama-sama berjarak 2.5 dari cermin.', 'Mirror y = 0. The reflection (x, y) → (x, −y) sends triangle ABC to A′B′C′. C = (1.5, 2.5) and C′ = (1.5, −2.5) are both 2.5 away from the mirror.', String.raw`\sigma(x,y)=(x,-y)`),
    f('Uraikan C: komponen sejajar cermin (1.5, hijau) tetap, komponen tegak lurus (2.5, merah) dibalik menjadi −2.5. Akibatnya urutan A → B → C berbalik arah: det σ = −1.', 'Split C: the component along the mirror (1.5, green) is kept, the perpendicular one (2.5, red) is flipped to −2.5. As a result the order A → B → C turns the other way: det σ = −1.', String.raw`\det\begin{pmatrix}1&0\\0&-1\end{pmatrix}=-1`),
    f('Refleksikan sekali lagi: −(−2.5) = 2.5, jadi C′ kembali ke C dan seluruh segitiga kembali ke tempatnya. Dua kali refleksi pada cermin yang sama adalah identitas.', 'Reflect once more: −(−2.5) = 2.5, so C′ returns to C and the whole triangle goes back. Reflecting twice in the same mirror is the identity.', String.raw`\sigma(\sigma(x,y))=(x,y),\quad\sigma^2=\mathrm{id}`),
    f('Dua cermin berbeda tidak memberi identitas. Refleksi pada y = 0 lalu pada y = x memetakan (x, y) → (x, −y) → (−y, x): putaran 90°, dua kali sudut 45° antara kedua cermin.', 'Two different mirrors do not give the identity. Reflecting in y = 0 and then in y = x maps (x, y) → (x, −y) → (−y, x): a 90° turn, twice the 45° angle between the mirrors.', String.raw`(x,y)\mapsto(x,-y)\mapsto(-y,x)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), names = ['A', 'B', 'C']
    /** bTop: B label above its vertex (the rotated copy, where the dashed arc passes right of B″). */
    const tri = (ps: P[], col: string, lab: string, dy: number, bTop = false) => <g>
      <path d={pl(ps.map(p => mp(p[0], p[1])), true)} fill={col} fillOpacity=".18" stroke={col} strokeWidth="3" />
      {ps.map((p, i) => { const up = bTop && i === 1; return <T key={i} x={mp(p[0], p[1])[0] + (up ? 0 : i === 1 ? 12 : -10)} y={mp(p[0], p[1])[1] + (up ? -10 : i === 2 ? dy : 5)} anchor={up ? 'middle' : i === 1 ? 'start' : 'end'} color={col} weight={700} size={14}>{names[i]}{lab}</T> })}
    </g>
    const mir = MT.map(([x, y]) => [x, -y] as P), rot = MT.map(([x, y]) => [-y, x] as P)
    const cen = (ps: P[]) => mp((ps[0][0] + ps[1][0] + ps[2][0]) / 3, (ps[0][1] + ps[1][1] + ps[2][1]) / 3)
    return <>
      <Grid map={mp} x={[-3.4, 4]} y={[-3.4, 3.4]} />
      <path d={pl([mp(-3.4, 0), mp(4, 0)])} stroke={C.y} strokeWidth="3" />
      <T x={mp(-3.4, 0)[0] + 4} y={mp(-3.4, 0)[1] - 8} anchor="start" color={C.y} weight={700} size={14}>y = 0</T>
      {tri(MT, C.a, '', -8)}
      <Turn c={cen(MT)} r={10} sgn={1} color={C.a} />
      <At until={2} frame={k}>
        {tri(mir, C.v, '′', 20)}
        <Turn c={cen(mir)} r={10} sgn={-1} color={C.v} />
      </At>
      <At until={0} frame={k}>
        <path d={pl([mp(1.5, 2.5), mp(1.5, -2.5)])} stroke={C.mu} strokeDasharray="4 4" />
        <T x={mp(1.5, 1.25)[0] - 6} y={mp(1.5, 1.25)[1] + 5} anchor="end" size={14} weight={700}>2.5</T>
        <T x={mp(1.5, -1.25)[0] - 6} y={mp(1.5, -1.25)[1] + 5} anchor="end" size={14} weight={700}>2.5</T>
        <T x={318} y={60} anchor="start" size={15} color={C.a}>C = (1.5, 2.5)</T>
        <T x={318} y={88} anchor="start" size={15} color={C.v}>C′ = (1.5, −2.5)</T>
      </At>
      <At from={1} until={1} frame={k}>
        <Arrow from={mp(0, 0)} to={mp(1.5, 0)} color={C.g} width={3.5} head={9} />
        <Arrow from={mp(1.5, 0)} to={mp(1.5, 2.5)} color={C.r} width={3.5} head={9} />
        <Arrow from={mp(1.5, 0)} to={mp(1.5, -2.5)} color={C.r} width={3.5} head={9} dash="6 4" />
        <T x={318} y={60} anchor="start" size={15} color={C.g}>{t('sejajar', 'parallel')}: 1.5 → 1.5</T>
        <T x={318} y={88} anchor="start" size={15} color={C.r}>{t('tegak', 'normal')}: 2.5 → −2.5</T>
        <T x={318} y={124} anchor="start" size={15} weight={700} color={C.v}>det σ = −1</T>
        <T x={318} y={150} anchor="start" size={14} color={C.mu}>{t('arah putar terbalik', 'turning sense flips')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={`M${mp(3.4, -1.5)[0]},${mp(3.4, -1.5)[1]} C${mp(4.2, -.6)[0]},${mp(4.2, -.6)[1]} ${mp(4.2, .6)[0]},${mp(4.2, .6)[1]} ${mp(3.5, 1.4)[0]},${mp(3.5, 1.4)[1]}`} fill="none" stroke={C.g} strokeWidth="2.5" />
        <Arrow from={mp(3.62, 1.2)} to={mp(3.5, 1.4)} color={C.g} width={2.5} head={8} />
        <T x={318} y={60} anchor="start" size={15}>C → C′ → C</T>
        <T x={318} y={88} anchor="start" size={15}>2.5 → −2.5 → 2.5</T>
        <T x={318} y={124} anchor="start" size={17} weight={700} color={C.g}>σ² = id</T>
      </At>
      <At from={3} frame={k}>
        <Clip id="gb-mir" x={12} y={14} w={290} h={274}>
          <path d={pl([mp(-3.4, -3.4), mp(3.4, 3.4)])} stroke={C.g} strokeWidth="3" />
        </Clip>
        <T x={mp(3.3, 3.3)[0] - 6} y={mp(3.3, 3.3)[1] + 4} anchor="end" color={C.g} weight={700} size={14}>y = x</T>
        {tri(mir, C.v, '′', 20)}
        {tri(rot, C.r, '″', -8, true)}
        <Turn c={cen(rot)} r={10} sgn={1} color={C.r} />
        <path d={arc(mp(0, 0), 2.9 * 34, Math.atan2(2.5, 1.5), Math.atan2(1.5, -2.5))} fill="none" stroke={C.r} strokeWidth="2" strokeDasharray="5 4" />
        <T x={318} y={60} anchor="start" size={15}>(x, y) → (x, −y)</T>
        <T x={318} y={88} anchor="start" size={15}>→ (−y, x)</T>
        <T x={318} y={124} anchor="start" size={16} weight={700} color={C.r}>{t('putaran 90°', 'a 90° turn')}</T>
        <T x={318} y={150} anchor="start" size={14} color={C.mu}>90° = 2 × 45°</T>
        <T x={318} y={176} anchor="start" size={14} color={C.mu}>{t('bukan identitas', 'not the identity')}</T>
      </At>
    </>
  },
}

// ================================================================ isometry:1 similarity: distances multiply by k
const so = plane([40, 252], 18), si = plane([226, 268], 18), RT = 20 * Math.PI / 180
const simil: Story = {
  title: b('Kesebangunan: semua jarak dikali k yang sama', 'Similarity: every distance times the same k'),
  control: { label: b('Faktor skala k', 'Scale factor k'), min: .5, max: 2, step: .1, initial: 1.5 },
  controlFrom: 1,
  frames: [
    f('Segitiga siku-siku dengan sisi 3, 4, 5 dan sudut 90°, 36.9°, 53.1°.', 'A right triangle with sides 3, 4, 5 and angles 90°, 36.9°, 53.1°.'),
    f('Kesebangunan T(x) = kQx + c: putar dengan Q (di sini 20°), kalikan k, lalu geser. Setiap sisi dikali k yang sama: 3k, 4k, 5k. Untuk k = 1.5: 4.5, 6, 7.5. Geser k.', 'A similarity T(x) = kQx + c: rotate by Q (here 20°), multiply by k, then shift. Every side is multiplied by the same k: 3k, 4k, 5k. For k = 1.5: 4.5, 6, 7.5. Move k.', String.raw`B=kQ,\quad Q^TQ=I`),
    f('Sudutnya tidak berubah: 90°, 36.9°, 53.1°. Sebabnya |Bv|² = k² vᵀQᵀQv = k²|v|²: setiap vektor diperpanjang dengan faktor yang sama, jadi bentuknya terjaga.', 'The angles do not change: 90°, 36.9°, 53.1°. The reason: |Bv|² = k² vᵀQᵀQv = k²|v|²: every vector is stretched by the same factor, so the shape is kept.', String.raw`|Bv|^2=k^2v^TQ^TQv=k^2|v|^2`),
    f('Luas dikali k²: luas 6 menjadi 6k², untuk k = 1.5 luasnya 13.5. Di ruang, volume dikali k³.', 'Area is multiplied by k²: area 6 becomes 6k², for k = 1.5 it is 13.5. In space, volume is multiplied by k³.', String.raw`\text{area}\cdot k^2,\quad\text{volume}\cdot k^3`),
  ],
  readout: kk => String.raw`k=${tx(kk, 1)}:\ (3,4,5)\to(${tx(3 * kk)},${tx(4 * kk)},${tx(5 * kk)}),\quad 6\to${tx(6 * kk * kk)}`,
  draw: (k, kv, lang) => {
    const t = tr(lang), kk = k >= 1 ? kv : 1.5, c = Math.cos(RT), s = Math.sin(RT)
    const A = so(0, 0), B = so(4, 0), Cc = so(0, 3)
    const A2 = si(0, 0), B2 = si(4 * kk * c, 4 * kk * s), C2 = si(-3 * kk * s, 3 * kk * c)
    const angB = Math.atan2(3, 4)
    const mid = (p: P, q: P, o: P, d = 14): [number, number] => { const m: P = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], v = [m[0] - o[0], m[1] - o[1]], l = Math.hypot(v[0], v[1]) || 1; return [m[0] + v[0] / l * d, m[1] + v[1] / l * d + 5] }
    const g1 = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3] as P, g2 = [(A2[0] + B2[0] + C2[0]) / 3, (A2[1] + B2[1] + C2[1]) / 3] as P
    return <>
      <path d={pl([A, B, Cc], true)} fill={C.a} fillOpacity=".18" stroke={C.a} strokeWidth="3" />
      <RA at={A} a={[1, 0]} c={[0, -1]} color={C.a} />
      <T x={mid(A, B, g1)[0]} y={mid(A, B, g1)[1]} size={14} weight={700} color={C.a}>4</T>
      <T x={mid(A, Cc, g1)[0]} y={mid(A, Cc, g1)[1]} size={14} weight={700} color={C.a}>3</T>
      <T x={mid(B, Cc, g1)[0]} y={mid(B, Cc, g1)[1]} size={14} weight={700} color={C.a}>5</T>
      <At until={0} frame={k}>
        <path d={arc(B, 22, Math.PI - angB, Math.PI)} fill="none" stroke={C.y} strokeWidth="2" />
        <T x={B[0] + 8} y={B[1] - 8} anchor="start" size={14} color={C.y}>36.9°</T>
        <T x={300} y={60} anchor="start" size={15}>{t('sisi', 'sides')}: 3, 4, 5</T>
        <T x={300} y={88} anchor="start" size={15}>{t('sudut', 'angles')}: 90°, 36.9°, 53.1°</T>
        <T x={300} y={116} anchor="start" size={15}>{t('luas', 'area')} = ½·3·4 = 6</T>
      </At>
      <At from={1} frame={k}>
        <path d={pl([A2, B2, C2], true)} fill={C.v} fillOpacity=".18" stroke={C.v} strokeWidth="3" />
        <RA at={A2} a={[c, -s]} c={[-s, -c]} color={C.v} />
        <T x={mid(A2, B2, g2)[0]} y={mid(A2, B2, g2)[1]} size={14} weight={700} color={C.v}>{fmt(4 * kk)}</T>
        <T x={mid(A2, C2, g2)[0]} y={mid(A2, C2, g2)[1]} size={14} weight={700} color={C.v}>{fmt(3 * kk)}</T>
        <T x={mid(B2, C2, g2, 18)[0]} y={mid(B2, C2, g2, 18)[1]} size={14} weight={700} color={C.v}>{fmt(5 * kk)}</T>
        <T x={300} y={40} anchor="start" size={16} weight={700} color={C.v}>k = {fmt(kk, 1)}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={300} y={68} anchor="start" size={14}>{fmt(3 * kk)}/3 = {fmt(4 * kk)}/4</T>
        <T x={300} y={92} anchor="start" size={14}>= {fmt(5 * kk)}/5 = {fmt(kk, 1)}</T>
      </At>
      <At from={2} frame={k}>
        <path d={arc(B, 22, Math.PI - angB, Math.PI)} fill="none" stroke={C.y} strokeWidth="2" />
        <path d={arc(B2, 22, Math.PI - angB + RT, Math.PI + RT)} fill="none" stroke={C.y} strokeWidth="2" />
      </At>
      <At from={2} until={2} frame={k}>
        <T x={300} y={68} anchor="start" size={14} color={C.y}>36.9° → 36.9°</T>
        <T x={300} y={92} anchor="start" size={14} color={C.y}>90° → 90°</T>
      </At>
      <At from={3} frame={k}>
        <T x={300} y={68} anchor="start" size={14}>{t('luas', 'area')}: 6 → {fmt(6 * kk * kk)}</T>
        <T x={300} y={92} anchor="start" size={14} color={C.v}>= 6 × {fmt(kk * kk)} = 6k²</T>
      </At>
    </>
  },
}

// ================================================================ isometry:2 circle inversion is not affine
const vp = plane([150, 150], 50)
const inversion: Story = {
  title: b('Inversi lingkaran bukan transformasi afin', 'Circle inversion is not an affine map'),
  control: { label: b('Jarak d = OM', 'Distance d = OM'), min: .5, max: 2.5, step: .1, initial: 2 },
  frames: [
    f('Inversi terhadap lingkaran satuan (k = 1): M′ ada di sinar yang sama dari O dengan OM · OM′ = 1. Untuk OM = 2 diperoleh OM′ = 0.5. Titik di luar lingkaran pergi ke dalam, dan sebaliknya.', 'Inversion in the unit circle (k = 1): M′ lies on the same ray from O with OM · OM′ = 1. For OM = 2 we get OM′ = 0.5. Points outside the circle go inside, and vice versa.', String.raw`M'=O+\frac{M-O}{|M-O|^2}`),
    f('Titik pada lingkaran satuan (OM = 1) tetap. Inversi dua kali mengembalikan titik: 1/(1/d) = d. Geser d melewati 1 dan lihat M dan M′ bertukar sisi.', 'Points on the unit circle (OM = 1) stay fixed. Inverting twice returns the point: 1/(1/d) = d. Slide d past 1 and watch M and M′ swap sides.', String.raw`OM\cdot OM'=1,\quad M''=M`),
    f('Garis x = d yang tidak melewati O menjadi lingkaran melalui O berdiameter 1/d. Dua garis sejajar x = ±d menjadi dua lingkaran yang bersinggungan di O: kesejajaran hilang.', 'The line x = d, which misses O, becomes a circle through O with diameter 1/d. The two parallel lines x = ±d become two circles touching at O: parallelism is lost.', String.raw`x=d\ \mapsto\ \Big(x-\tfrac{1}{2d}\Big)^2+y^2=\tfrac{1}{4d^2}`),
    f('Peta afin membawa titik tengah ke titik tengah. Inversi tidak: d, 1.5d, 2d berjarak sama, tetapi bayangannya 1/d, 1/(1.5d), 1/(2d) tidak. Penyebut |M − O|² bergantung pada M.', 'An affine map sends midpoints to midpoints. Inversion does not: d, 1.5d, 2d are equally spaced, but their images 1/d, 1/(1.5d), 1/(2d) are not. The denominator |M − O|² depends on M.', String.raw`\frac{1}{1.5d}\ne\frac12\Big(\frac1d+\frac1{2d}\Big)=\frac{3}{4d}`),
  ],
  readout: d => String.raw`OM=${tx(d, 1)}\Rightarrow OM'=\frac{1}{${tx(d, 1)}}=${tx(1 / d, 3)}`,
  draw: (k, d, lang) => {
    const t = tr(lang), O = vp(0, 0), M = vp(d, 0), Mi = vp(1 / d, 0), on = Math.abs(d - 1) < 1e-9
    const NL = (x: number) => 40 + 80 * x, im = [1 / d, 1 / (1.5 * d), 1 / (2 * d)], mid = (im[0] + im[2]) / 2
    return <>
      <At until={2} frame={k}>
        <Grid map={vp} x={[-2.6, 2.6]} y={[-2.6, 2.6]} grid={false} />
        <circle cx={O[0]} cy={O[1]} r={50} fill="none" stroke={C.a} strokeWidth="3" />
        <Dot at={O} color={C.fg} r={5} />
        <T x={O[0] - 8} y={O[1] + 20} anchor="end" weight={700} size={14}>O</T>
        <T x={vp(-.71, .71)[0] - 6} y={vp(-.71, .71)[1] - 6} anchor="end" color={C.a} weight={700} size={14}>r = 1</T>
      </At>
      <At until={1} frame={k}>
        <Dot at={M} color={C.g} r={7} />
        <T x={M[0]} y={M[1] - 14} color={C.g} weight={700}>M</T>
        {!on && <Dot at={Mi} color={C.v} r={7} />}
        {!on && <T x={Mi[0]} y={Mi[1] + 26} color={C.v} weight={700}>M′</T>}
        <T x={305} y={60} anchor="start" size={15} color={C.g}>OM = {fmt(d, 1)}</T>
        <T x={305} y={88} anchor="start" size={15} color={C.v}>OM′ = 1/{fmt(d, 1)} = {fmt(1 / d, 3)}</T>
        <T x={305} y={116} anchor="start" size={15}>OM · OM′ = 1</T>
      </At>
      <At from={1} until={1} frame={k}>
        {!on && <>
          <path d={`M${M[0]},${M[1] + 8} Q${(M[0] + Mi[0]) / 2},${M[1] + 46} ${Mi[0] + 4},${Mi[1] + 12}`} fill="none" stroke={C.v} strokeWidth="2" />
          <path d={`M${Mi[0]},${Mi[1] - 10} Q${(M[0] + Mi[0]) / 2},${M[1] - 50} ${M[0] - 4},${M[1] - 12}`} fill="none" stroke={C.g} strokeWidth="2" />
        </>}
        {[50, 140, 230, 320].map(a => { const r = a * Math.PI / 180; return <Dot key={a} at={vp(Math.cos(r), Math.sin(r))} color={C.y} r={5} /> })}
        <T x={305} y={156} anchor="start" size={15} color={C.y}>{t('pada lingkaran: tetap', 'on the circle: fixed')}</T>
        <T x={305} y={184} anchor="start" size={15}>M → M′ → M</T>
        <T x={305} y={208} anchor="start" size={14} color={C.mu}>1/(1/d) = d</T>
      </At>
      <At from={2} until={2} frame={k}>
        <Clip id="gb-inv" x={12} y={14} w={284} h={274}>
          {[-1, 1].map(s => <g key={s}>
            <path d={`M${vp(s * d, 0)[0]},14 V288`} stroke={C.g} strokeWidth="3" />
            <circle cx={vp(s / (2 * d), 0)[0]} cy={O[1]} r={50 / (2 * d)} fill="none" stroke={C.v} strokeWidth="3" />
          </g>)}
        </Clip>
        <Dot at={O} color={C.r} r={5} />
        <T x={305} y={60} anchor="start" size={15} color={C.g}>x = ±{fmt(d, 1)}: {t('sejajar', 'parallel')}</T>
        <T x={305} y={92} anchor="start" size={15} color={C.v}>{t('lingkaran', 'circles')} r = {fmt(1 / (2 * d), 3)}</T>
        <T x={305} y={116} anchor="start" size={15} color={C.v}>{t('pusat', 'centres')} (±{fmt(1 / (2 * d), 3)}, 0)</T>
        <T x={305} y={148} anchor="start" size={15} color={C.r}>{t('bertemu di O', 'they meet at O')}</T>
      </At>
      <At from={3} frame={k}>
        {[110, 220].map((y, i) => <g key={y}>
          <path d={`M${NL(0)},${y} H${NL(5.2)}`} stroke={C.ln} strokeWidth="1.5" />
          {[0, 1, 2, 3, 4, 5].map(n => <g key={n}><path d={`M${NL(n)},${y - 5} V${y + 5}`} stroke={C.ln} /><T x={NL(n)} y={y + 22} size={12} color={C.mu}>{n}</T></g>)}
          <T x={14} y={y - (i ? 66 : 50)} anchor="start" size={14} weight={700} color={i ? C.v : C.g}>{i ? t('bayangan', 'images') : t('titik asli', 'original points')}</T>
        </g>)}
        {[d, 1.5 * d, 2 * d].map((x, i) => <g key={i}><Dot at={[NL(x), 110]} color={i === 1 ? C.y : C.g} r={i === 1 ? 7 : 6} /><T x={NL(x)} y={110 - 14 - (i === 1 ? 14 : 0)} size={13} color={i === 1 ? C.y : C.g} weight={700}>{fmt(x, 2)}</T></g>)}
        <Dot at={[NL(mid), 220]} color={C.y} r={7} hollow />
        {/* images bunch up for large d: 1/(2d) is labelled below the line, the other two above in two rows */}
        {im.map((x, i) => <g key={i}><Dot at={[NL(x), 220]} color={C.v} r={i === 1 ? 7 : 6} /><T x={NL(x)} y={i === 2 ? 262 : 220 - 14 - (i === 1 ? 16 : 0)} size={13} color={C.v} weight={700}>{fmt(x, 3)}</T></g>)}
        <T x={NL(2.6)} y={272} anchor="start" size={14} color={C.y}>{t('tengah bayangan', 'midpoint of images')} = {fmt(mid, 3)}</T>
        <T x={NL(2.6)} y={156} anchor="start" size={14} color={C.y}>{t('tengah', 'midpoint')} {fmt(1.5 * d, 2)} → {fmt(im[1], 3)}</T>
      </At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'conic:0': tangent, 'conic:1': eccentricity, 'conic:2': hyperbolaDiff, 'conic:3': parabolaFD,
  'quadric:0': ellipsoid, 'quadric:1': oneSheet, 'quadric:2': twoSheets, 'quadric:3': cone, 'quadric:4': bowl, 'quadric:5': saddle, 'quadric:6': rulings,
  'eigen:0': formMatrix, 'eigen:1': centers,
  'reduce:0': signClass, 'reduce:1': degenerate, 'reduce:2': kSets,
  'affine:0': homothety, 'affine:1': fixedPts, 'affine:2': detArea,
  'isometry:0': reflection, 'isometry:1': simil, 'isometry:2': inversion,
}
