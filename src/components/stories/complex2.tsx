import type { ReactNode } from 'react'
import type { VisualKind } from '../../content/summary-lessons'
import { At, Arrow, C, Dot, T, arc, b, f, fn, tr, type Lang, type P, type Story } from './kit'

const PI = Math.PI
const rad = (d: number) => d * PI / 180
/** Fixed decimals with a real minus sign, and a decimal comma in Indonesian. */
const num = (lang: Lang, x: number, d = 2) => { const s = x.toFixed(d).replace('-', '−'); return lang === 'id' ? s.replace('.', ',') : s }
const onCircle = (c: P, r: number, a: number): P => [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]
/** Arrowhead sitting on a circle at math angle a, pointing counterclockwise (or clockwise). */
const CircTip = ({ c, r, a, color, cw = false, span = .35 }: { c: P; r: number; a: number; color: string; cw?: boolean; span?: number }) =>
  <Arrow from={onCircle(c, r, cw ? a + span : a - span)} to={onCircle(c, r, a)} color={color} width={2.5} head={9} />
const Cross = ({ at, color, s = 7 }: { at: P; color: string; s?: number }) =>
  <path d={`M${at[0] - s},${at[1] - s} L${at[0] + s},${at[1] + s} M${at[0] - s},${at[1] + s} L${at[0] + s},${at[1] - s}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
const Sup = ({ children }: { children: string }) => <tspan dy={-7} fontSize="0.7em">{children}</tspan>

// ---------------------------------------------------------------- branch: log i has a column of values
const ZO: P = [120, 160], ZR = 70, WX = 330, WY0 = 165, WPI = 40
const wy = (im: number) => WY0 - WPI * im / PI
const branch: Story = {
  title: b('Logaritma kompleks: satu titik, tak hingga banyak nilai', 'Complex logarithm: one point, infinitely many values'),
  frames: [
    f('log membalik eksponensial: panjang |z| menjadi bagian real ln|z|, sudut z menjadi bagian imajiner. Untuk z = i: |i| = 1 sehingga ln 1 = 0, dan sudutnya 90° = π/2. Satu jawaban: log i = iπ/2.', 'log undoes the exponential: the length |z| becomes the real part ln|z|, the angle of z becomes the imaginary part. For z = i: |i| = 1 so ln 1 = 0, and the angle is 90° = π/2. One answer: log i = iπ/2.', String.raw`\log i=\ln|i|+i\arg i=0+i\tfrac{\pi}{2}`),
    f('Tetapi sudut 90° + 360° = 450° juga menunjuk ke i, begitu pula 90° − 360° = −270°. Setiap putaran penuh menambah 2π pada sudut. Jadi log i punya tak hingga banyak nilai: satu kolom titik berjarak 2π di bidang w.', 'But the angle 90° + 360° = 450° also points at i, and so does 90° − 360° = −270°. Every full turn adds 2π to the angle. So log i has infinitely many values: a column of points 2π apart in the w-plane.', String.raw`\log i=i\left(\tfrac{\pi}{2}+2\pi k\right),\quad k\in\mathbb Z`),
    f('Cabang utama Log: potong bidang z sepanjang sumbu real negatif dan batasi sudut pada (−π, π]. Di bidang w ini adalah satu pita −π < Im w ≤ π, dan pita itu hanya memuat satu nilai: Log i = iπ/2.', 'The principal branch Log: cut the z-plane along the negative real axis and keep the angle in (−π, π]. In the w-plane this is one strip −π < Im w ≤ π, and the strip holds just one value: Log i = iπ/2.', String.raw`\operatorname{Log}z=\ln|z|+i\operatorname{Arg}z,\quad -\pi<\operatorname{Arg}z\le\pi`),
    f('Seberangi potongan. Tepat di atas −1 sudutnya hampir π, jadi Log mendekati iπ. Tepat di bawah −1 sudutnya hampir −π, jadi Log mendekati −iπ. Nilainya melompat 2πi: Log tidak kontinu di potongan.', 'Cross the cut. Just above −1 the angle is almost π, so Log approaches iπ. Just below −1 the angle is almost −π, so Log approaches −iπ. The value jumps by 2πi: Log is discontinuous on the cut.', String.raw`\operatorname{Log}(-1\pm i0)=\pm i\pi`),
    f('Pangkat kompleks memakai log, z^c = e^(c log z), jadi ikut bernilai banyak. Contoh: i^(−2i) = e^(−2i · i(π/2 + 2πk)) = e^(π + 4πk). Setiap k memberi bilangan real positif yang berbeda; nilai utama (k = 0) adalah e^π ≈ 23,14.', 'Complex powers use log, z^c = e^(c log z), so they are multivalued too. Example: i^(−2i) = e^(−2i · i(π/2 + 2πk)) = e^(π + 4πk). Each k gives a different positive real number; the principal value (k = 0) is e^π ≈ 23.14.', String.raw`i^{-2i}=e^{-2i\log i}=e^{\pi+4\pi k}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), zi: P = [ZO[0], ZO[1] - ZR]
    const spiral = fn(s => { const r = 14 + 18 * s / (2.5 * PI); return [ZO[0] + r * Math.cos(s), ZO[1] - r * Math.sin(s)] }, 0, 2.5 * PI, 120)
    return <>
      <path d="M235,18 V286" stroke={C.faint} />
      <T x={120} y={28} size={13} color={C.mu}>{t('bidang z', 'z-plane')}</T>
      <circle cx={ZO[0]} cy={ZO[1]} r={ZR} fill="none" stroke={C.ln} strokeDasharray="4 4" />
      <path d={`M22,${ZO[1]} H222 M${ZO[0]},56 V262`} stroke={C.ln} strokeWidth="1.4" />
      <T x={ZO[0] + ZR + 7} y={ZO[1] + 18} size={13} color={C.mu}>1</T>
      <At until={0} frame={k}>
        <path d={arc(ZO, 28, 0, PI / 2)} fill="none" stroke={C.a} strokeWidth="2.5" />
        <T x={152} y={136} size={14} color={C.a}>90°</T>
        <Arrow from={[134, 96]} to={[318, 143]} color={C.mu} width={1.5} dash="5 5" head={9} />
        <T x={226} y={108} size={14} color={C.mu} weight={600}>log</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={spiral} fill="none" stroke={C.y} strokeWidth="2.5" />
        <T x={120} y={284} size={13} color={C.y}>90° + 360° = 450°</T>
      </At>
      <At from={2} frame={k}>
        <path d={`M${ZO[0]},${ZO[1]} H22`} stroke={C.r} strokeWidth="4" />
        <Dot at={ZO} color={C.r} r={5} hollow />
        <T x={22} y={284} size={13} color={C.r} anchor="start">{t('potongan cabang', 'branch cut')}</T>
      </At>
      <At until={2} frame={k}><Dot at={zi} color={C.fg} /><T x={zi[0] + 10} y={zi[1] - 9} anchor="start" size={15} weight={600}>z = i</T></At>
      <At from={4} frame={k}><Dot at={zi} color={C.fg} /><T x={zi[0] + 10} y={zi[1] - 9} anchor="start" size={15} weight={600}>z = i</T></At>
      <At from={3} until={3} frame={k}>
        <Dot at={[50, 152]} color={C.g} r={5} /><Dot at={[50, 168]} color={C.r} r={5} />
        <T x={56} y={140} size={13} color={C.g}>{t('sudut ≈ π', 'angle ≈ π')}</T>
        <T x={58} y={188} size={13} color={C.r}>{t('sudut ≈ −π', 'angle ≈ −π')}</T>
      </At>

      <At from={2} until={3} frame={k}>
        <rect x={250} y={wy(PI)} width={212} height={2 * WPI} fill={C.soft} opacity=".8" />
        <path d={`M250,${wy(PI)} H462`} stroke={C.a} strokeWidth="2" />
        <path d={`M250,${wy(-PI)} H462`} stroke={C.a} strokeWidth="2" strokeDasharray="6 5" />
      </At>
      <At until={3} frame={k}>
        <T x={350} y={28} size={13} color={C.mu}>{t('bidang w = log z', 'w-plane: w = log z')}</T>
        <path d={`M250,${WY0} H462 M${WX},44 V286`} stroke={C.ln} strokeWidth="1.4" />
        {[[2 * PI, '2π'], [PI, 'π'], [-PI, '−π'], [-2 * PI, '−2π']].map(([v, s]) => <g key={s as string}>
          <path d={`M${WX - 5},${wy(v as number)} H${WX + 5}`} stroke={C.ln} strokeWidth="1.4" />
          <T x={WX - 9} y={wy(v as number) + (v === PI ? -5 : v === -PI ? 15 : 4)} size={12} color={C.mu} anchor="end">{s}</T>
        </g>)}
        <T x={254} y={WY0 - 8} size={12} color={C.mu} anchor="start">Re w</T>
      </At>
      <At from={2} until={2} frame={k}><T x={460} y={196} size={13} color={C.a} anchor="end">{t('pita utama', 'principal strip')}</T></At>
      <At from={1} until={2} frame={k}>
        <g style={{ opacity: k === 2 ? .3 : 1, transition: 'opacity .45s' }}>
          <Dot at={[WX, wy(2.5 * PI)]} color={C.y} />
          <T x={WX + 12} y={wy(2.5 * PI) + 5} size={14} color={C.y} anchor="start">i5π/2</T>
          <Dot at={[WX, wy(-1.5 * PI)]} color={C.y} />
          <T x={WX + 12} y={wy(-1.5 * PI) + 5} size={14} color={C.y} anchor="start">−i3π/2</T>
          <T x={WX} y={50} size={16} color={C.mu}>⋮</T>
          <T x={WX} y={270} size={16} color={C.mu}>⋮</T>
        </g>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={`M398,${wy(2.5 * PI)} H406 V${wy(PI / 2)} H398`} fill="none" stroke={C.y} strokeWidth="1.8" />
        <T x={412} y={110} size={15} color={C.y} anchor="start" weight={600}>2π</T>
      </At>
      <At until={2} frame={k}>
        <Dot at={[WX, wy(PI / 2)]} color={C.a} />
        <T x={WX + 12} y={wy(PI / 2) + 5} size={14} color={C.a} anchor="start" weight={600}>iπ/2</T>
      </At>
      <At from={3} until={3} frame={k}>
        <Dot at={[WX, wy(PI)]} color={C.g} />
        <T x={WX + 12} y={wy(PI) - 6} size={14} color={C.g} anchor="start" weight={600}>iπ</T>
        <Dot at={[WX, wy(-PI)]} color={C.r} />
        <T x={WX + 12} y={wy(-PI) + 17} size={14} color={C.r} anchor="start" weight={600}>−iπ</T>
        <Arrow from={[384, wy(PI) + 4]} to={[384, wy(-PI) - 4]} color={C.r} width={2.5} head={9} />
        <T x={393} y={152} size={13} color={C.r} anchor="start">{t('lompat', 'jump')}</T>
        <T x={393} y={172} size={15} color={C.r} anchor="start" weight={700}>2πi</T>
      </At>

      <At from={4} frame={k}>
        <T x={352} y={28} size={13} color={C.mu}>{t('pangkat kompleks', 'complex power')}</T>
        <T x={352} y={70} size={17} weight={700}>i<Sup>−2i</Sup><tspan dy={7}> = e</tspan><Sup>π + 4πk</Sup></T>
        <T x={252} y={120} size={14} anchor="start" color={C.mu}>k = −1:  e<Sup>−3π</Sup><tspan dy={7}> ≈ {num(lang, 0.00008, 5)}</tspan></T>
        <T x={252} y={160} size={15} anchor="start" color={C.a} weight={700}>k = 0:  e<Sup>π</Sup><tspan dy={7}> ≈ {num(lang, Math.exp(PI), 2)}</tspan></T>
        <T x={252} y={200} size={14} anchor="start" color={C.mu}>k = 1:  e<Sup>5π</Sup><tspan dy={7}> ≈ {t('6,6 juta', '6.6 million')}</tspan></T>
        <T x={352} y={248} size={13} color={C.a}>{t('nilai utama: k = 0', 'principal value: k = 0')}</T>
        <T x={352} y={270} size={13} color={C.mu}>{t('semuanya bilangan real positif', 'all positive real numbers')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- trig: sin leaves [−1, 1] off the real axis
const TX0 = 50, TUX = 340 / (2 * PI), TY0 = 235, TUY = 50
const tp = (x: number, y: number): P => [TX0 + TUX * x, TY0 - TUY * y]
const absSin = (y: number) => (x: number) => Math.sqrt(Math.sin(x) ** 2 + Math.sinh(y) ** 2)
const trig: Story = {
  title: b('sin z tidak lagi terbatas oleh 1', 'sin z is no longer bounded by 1'),
  frames: [
    f('Di sumbu real, sin x adalah gelombang biasa: selalu di antara −1 dan 1, dengan nol tepat di x = 0, π, 2π, …', 'On the real axis, sin x is the usual wave: always between −1 and 1, with zeros exactly at x = 0, π, 2π, …', String.raw`\sin z=\frac{e^{iz}-e^{-iz}}{2i}`),
    f('Untuk masukan kompleks kita ukur besarnya |sin(x + iy)|. Pada y = 0 (sumbu real) grafiknya |sin x|: bagian negatif terlipat ke atas, nolnya tetap di 0, π, 2π.', 'For complex inputs we measure the size |sin(x + iy)|. At y = 0 (the real axis) the graph is |sin x|: the negative parts fold up, and the zeros stay at 0, π, 2π.', String.raw`|\sin(x+iy)|^2=\sin^2x+\sinh^2y`),
    f('Naik sedikit dari sumbu real: y = 0,5 dan y = 1. Kurvanya terangkat dari 0, karena sinh²y > 0 untuk y ≠ 0. Jadi sin z tidak punya nol di luar sumbu real.', 'Move a little off the real axis: y = 0.5 and y = 1. The curves lift off 0, because sinh²y > 0 for y ≠ 0. So sin z has no zeros off the real axis.', String.raw`\sin z=0\iff z=k\pi`),
    f('Pada y = 2, |sin z| tidak pernah kurang dari sinh 2 ≈ 3,63, jauh di atas 1. Batas |sin z| ≤ 1 hanya berlaku di sumbu real. Di sumbu imajiner sin(iy) = i sinh y, yang tumbuh seperti eʸ/2.', 'At y = 2, |sin z| never drops below sinh 2 ≈ 3.63, far above 1. The bound |sin z| ≤ 1 only holds on the real axis. On the imaginary axis sin(iy) = i sinh y, which grows like eʸ/2.', String.raw`\sin(iy)=i\sinh y,\qquad |\sin(x+2i)|\ge\sinh2\approx3.63`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), x2 = 2 * PI
    const curve = (y: number) => fn(x => tp(x, absSin(y)(x)), 0, x2, 140)
    const endY = (y: number) => tp(x2, absSin(y)(x2))[1]
    return <>
      {[1, 2, 3].map(v => <g key={v}>
        <path d={`M${TX0},${tp(0, v)[1]} H392`} stroke={C.faint} strokeDasharray={v === 1 ? '5 4' : undefined} />
        <T x={42} y={tp(0, v)[1] + 4} size={12} color={C.mu} anchor="end">{v}</T>
      </g>)}
      <path d={`M40,${TY0} H392 M${TX0},28 V${k === 0 ? 288 : 248}`} stroke={C.ln} strokeWidth="1.4" />
      <T x={44} y={254} size={12} color={C.mu} anchor="end">0</T>
      <T x={tp(PI, 0)[0] - 6} y={254} size={12} color={C.mu} anchor="end">π</T>
      <T x={tp(x2, 0)[0] + 6} y={254} size={12} color={C.mu} anchor="start">2π</T>
      <T x={TX0 + 8} y={22} size={12} color={C.mu} anchor="start">{k === 0 ? 'sin x' : '|sin(x + iy)|'}</T>
      <At until={0} frame={k}>
        <path d={`M${TX0},${tp(0, -1)[1]} H392`} stroke={C.faint} strokeDasharray="5 4" />
        <T x={42} y={tp(0, -1)[1] + 4} size={12} color={C.mu} anchor="end">−1</T>
        <path d={fn(x => tp(x, Math.sin(x)), 0, x2, 140)} fill="none" stroke={C.a} strokeWidth="3" />
      </At>
      <At until={1} frame={k}>{[0, PI, x2].map(x => <Dot key={x} at={tp(x, 0)} color={C.a} r={5} />)}</At>
      <At from={1} frame={k}>
        <path d={curve(0)} fill="none" stroke={C.a} strokeWidth="3" />
        <T x={398} y={endY(0) + 4} size={13} color={C.a} anchor="start">y = 0</T>
      </At>
      <At from={2} frame={k}>
        <path d={curve(.5)} fill="none" stroke={C.g} strokeWidth="3" />
        <T x={398} y={endY(.5) + 4} size={13} color={C.g} anchor="start">y = {num(lang, .5, 1)}</T>
        <path d={curve(1)} fill="none" stroke={C.y} strokeWidth="3" />
        <T x={398} y={endY(1) + 4} size={13} color={C.y} anchor="start">y = 1</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={70} y={108} size={15} anchor="start">|sin z|² = sin²x + sinh²y</T>
        <T x={70} y={127} size={13} anchor="start" color={C.mu}>{t('y ≠ 0: selalu > 0, tanpa nol', 'y ≠ 0: always > 0, no zeros')}</T>
      </At>
      <At from={3} frame={k}>
        <path d={curve(2)} fill="none" stroke={C.r} strokeWidth="3" />
        <T x={398} y={endY(2) + 4} size={13} color={C.r} anchor="start">y = 2</T>
        <T x={70} y={108} size={15} anchor="start" color={C.r} weight={600}>|sin z| ≥ sinh 2 ≈ {num(lang, Math.sinh(2), 2)}</T>
        <T x={70} y={127} size={13} anchor="start" color={C.mu}>{t('batas 1 hanya di sumbu real', 'the bound 1 holds only on the real axis')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- integral: ∮ dz/z stacks up to 2πi
const IO: P = [125, 155], IR = 80, CX = 300, CY0 = 155, CU = 19
const gcd = (a: number, m: number): number => m ? gcd(m, a % m) : a
/** deg as a multiple of π, e.g. 150 → [5, 6] meaning 5π/6 */
const piFrac = (deg: number): [number, number] => { const n = Math.round(deg / 30), g = gcd(n, 6) || 1; return [n / g, 6 / g] }
const piText = (deg: number, i = '') => { const [p, q] = piFrac(deg); return p === 0 ? '0' : `${p === 1 ? '' : p}π${i}${q === 1 ? '' : '/' + q}` }
const piTex = (deg: number) => { const [p, q] = piFrac(deg); return p === 0 ? '0' : q === 1 ? `${p === 1 ? '' : p}\\pi` : `\\tfrac{${p === 1 ? '' : p}\\pi}{${q}}` }
const integral: Story = {
  title: b('∮ dz/z: menumpuk potongan kecil sampai 2πi', '∮ dz/z: stacking small pieces up to 2πi'),
  control: { label: b('Sudut yang sudah ditempuh θ (derajat)', 'Angle travelled so far θ (degrees)'), min: 0, max: 360, step: 30, initial: 150 },
  controlFrom: 1,
  readout: deg => String.raw`\theta=${deg}^\circ=${piTex(deg)}:\quad\left|\int f\,dz\right|=${piTex(deg)}`,
  frames: [
    f('Hitung ∮ dz/z mengelilingi lingkaran satuan. Integral kontur bukan luas: potong lintasan menjadi langkah kecil dz (panah hijau, menyinggung lingkaran), kalikan setiap langkah dengan f(z) = 1/z, lalu jumlahkan.', 'Compute ∮ dz/z around the unit circle. A contour integral is not an area: chop the path into small steps dz (green arrows, tangent to the circle), multiply each step by f(z) = 1/z, then add them up.', String.raw`\oint_C f(z)\,dz=\int_a^b f(z(t))\,z'(t)\,dt`),
    f('Dengan z = eⁱᵗ: dz = i eⁱᵗ dt dan 1/z = e⁻ⁱᵗ, jadi f dz = i dt. Setiap potongan (ungu) menunjuk lurus ke atas, ke arah i. Geser penggeser: potongan ditumpuk menjadi satu kolom. Pada 360° tingginya 2π, jadi ∮ dz/z = 2πi.', 'With z = eⁱᵗ: dz = i eⁱᵗ dt and 1/z = e⁻ⁱᵗ, so f dz = i dt. Every piece (violet) points straight up, in the direction i. Move the slider: the pieces stack into one column. At 360° it is 2π tall, so ∮ dz/z = 2πi.', String.raw`f\,dz=e^{-it}\cdot ie^{it}\,dt=i\,dt\ \Rightarrow\ \oint\frac{dz}{z}=2\pi i`),
    f('Balik arahnya (searah jarum jam). Setiap dz menunjuk ke arah sebaliknya, jadi setiap potongan f dz = −i dt menunjuk ke bawah. Satu putaran memberi −2πi.', 'Reverse the direction (clockwise). Every dz points the other way, so every piece f dz = −i dt points down. One turn gives −2πi.', String.raw`\oint_{-C}\frac{dz}{z}=-\oint_C\frac{dz}{z}=-2\pi i`),
    f('Batas ML: |1/z| = 1 di seluruh lingkaran, jadi M = 1, dan panjang busur yang ditempuh adalah L = θ. Maka |∫| ≤ M·L. Di sini batas itu tepat tercapai karena semua potongan searah: satu putaran memberi 2π ≤ 2π.', 'The ML bound: |1/z| = 1 on the whole circle, so M = 1, and the arc travelled has length L = θ. So |∫| ≤ M·L. Here the bound is reached exactly because all pieces point the same way: one turn gives 2π ≤ 2π.', String.raw`\left|\int_C f\,dz\right|\le ML=1\cdot2\pi`),
  ],
  draw: (k, value, lang) => {
    const t = tr(lang), deg = k === 0 ? 360 : value, n = Math.round(deg / 30), cw = k === 2, sg = cw ? -1 : 1
    const th = rad(deg), h = CU * PI / 6, tipY = CY0 - sg * n * h
    const pts = Array.from({ length: 12 }, (_, j) => sg * rad(15 + 30 * j))
    const total = n === 0 ? '0' : (cw ? '−' : '') + piText(deg, 'i')
    return <>
      <circle cx={IO[0]} cy={IO[1]} r={IR} fill="none" stroke={C.ln} strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={`M30,${IO[1]} H220 M${IO[0]},62 V248`} stroke={C.faint} />
      <Dot at={IO} color={C.mu} r={3} />
      <At until={0} frame={k}>
        {pts.map((a, j) => { const p = onCircle(IO, IR, a); return <Arrow key={j} from={p} to={[p[0] - 24 * Math.sin(a), p[1] - 24 * Math.cos(a)]} color={C.g} width={2.5} head={8} /> })}
        <T x={214} y={112} size={15} color={C.g} anchor="start" weight={700}>dz</T>
      </At>
      <At from={1} frame={k}>
        {deg >= 360 ? <circle cx={IO[0]} cy={IO[1]} r={IR} fill="none" stroke={C.a} strokeWidth="3.5" />
          : deg > 0 && <path d={arc(IO, IR, 0, sg * th)} fill="none" stroke={C.a} strokeWidth="3.5" />}
        {deg > 0 && <CircTip c={IO} r={IR} a={sg * Math.min(th, rad(354))} color={C.a} cw={cw} />}
        {pts.slice(0, n).map((a, j) => { const p = onCircle(IO, IR, a); return <Arrow key={j} from={p} to={[p[0], p[1] - sg * 22]} color={C.v} width={2.5} head={8} /> })}
        <T x={214} y={cw ? 236 : 82} size={14} color={C.v} anchor="start" weight={600}>f dz = {cw ? '−' : ''}i dt</T>
      </At>
      <Dot at={[IO[0] + IR, IO[1]]} color={C.fg} r={5} />

      <At from={1} frame={k}>
        <T x={CX} y={22} size={13} color={C.mu}>Σ f dz</T>
        <path d={`M${CX},${CY0 - 2 * PI * CU - 4} V${CY0 + 2 * PI * CU + 4}`} stroke={C.faint} strokeWidth="1.5" />
        {[[2, '2πi'], [1, 'πi'], [0, '0'], [-1, '−πi'], [-2, '−2πi']].map(([m, s]) => <g key={s as string}>
          <path d={`M${CX - 5},${CY0 - (m as number) * PI * CU} H${CX + 5}`} stroke={C.ln} strokeWidth="1.5" />
          <T x={CX - 10} y={CY0 - (m as number) * PI * CU + 4} size={12} color={C.mu} anchor="end">{s}</T>
        </g>)}
        {n > 0 && <>
          <Arrow from={[CX, CY0]} to={[CX, tipY]} color={C.v} width={6} head={12} />
          {Array.from({ length: n - 1 }, (_, j) => <path key={j} d={`M${CX - 5},${CY0 - sg * (j + 1) * h} H${CX + 5}`} stroke={C.bg} strokeWidth="2" />)}
        </>}
        <T x={CX + 14} y={tipY + (cw ? 4 : 10)} size={18} color={C.v} anchor="start" weight={700}>{total}</T>
      </At>
      <At from={3} frame={k}>
        <T x={IO[0]} y={268} size={13} color={C.mu}>{t('|1/z| = 1 di lingkaran', '|1/z| = 1 on the circle')}</T>
        <T x={338} y={204} size={14} anchor="start">M = {t('maks', 'max')} |1/z| = 1</T>
        <T x={338} y={228} size={14} anchor="start">L = θ = {piText(deg)}</T>
        <T x={338} y={252} size={14} anchor="start" weight={600}>|∫| ≤ M·L = {piText(deg)}</T>
        <T x={338} y={276} size={13} anchor="start" color={C.g}>{t('tepat:', 'tight:')} |∫| = {piText(deg)}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- primitive: endpoints only, Goursat, and a hole
const PO: P = [150, 180], PU = 100
const pp = (x: number, y: number): P => [PO[0] + PU * x, PO[1] - PU * y]
const GQ = 56, GX = 40, GY = 50
const primitive: Story = {
  title: b('Antiturunan: hanya ujung yang dihitung', 'Antiderivatives: only the endpoints count'),
  frames: [
    f('Dua jalan dari A = −1 ke B = 1: ruas garis lurus dan setengah lingkaran atas. Untuk f(z) = z² keduanya memberi 2/3, karena F(z) = z³/3 adalah antiturunan: hanya F di kedua ujung yang dihitung.', 'Two paths from A = −1 to B = 1: the straight segment and the upper semicircle. For f(z) = z² both give 2/3, because F(z) = z³/3 is an antiderivative: only F at the two ends counts.', String.raw`\int_A^B z^2\,dz=F(B)-F(A)=\tfrac13-\left(-\tfrac13\right)=\tfrac23`),
    f('Gabungkan keduanya: pergi lewat busur, pulang lewat garis lurus. Lintasan tertutup memberi 2/3 − 2/3 = 0. Jika ada antiturunan di seluruh daerah, setiap integral tertutup bernilai nol.', 'Join them: go out along the arc, come back along the segment. The closed path gives 2/3 − 2/3 = 0. If there is an antiderivative on the whole region, every closed integral is zero.', String.raw`\oint z^2\,dz=F(A)-F(A)=0`),
    f('Cauchy-Goursat: analitik saja sudah cukup. Potong daerah menjadi kotak kecil, masing-masing dikelilingi berlawanan jarum jam. Sisi dalam dilewati dua kali dengan arah berlawanan (merah), jadi saling menghapus. Yang tersisa hanya batas luar.', 'Cauchy-Goursat: being analytic is already enough. Chop the region into small squares, each traced counterclockwise. Every inner edge is traced twice in opposite directions (red), so they cancel. Only the outer boundary is left.', String.raw`\oint_C f\,dz=\sum_k\oint_{\partial Q_k}f\,dz`),
    f('Lubang merusak argumen ini. f = 1/z tidak terdefinisi di 0. Lingkaran yang mengelilingi 0 memberi 2πi, bukan 0. Lingkaran di sampingnya, yang tidak mengelilingi lubang, tetap memberi 0.', 'A hole breaks the argument. f = 1/z is undefined at 0. A circle around 0 gives 2πi, not 0. A circle beside it, which does not go around the hole, still gives 0.', String.raw`\oint_{|z|=1}\frac{dz}{z}=2\pi i,\qquad\oint_{|z-3|=1}\frac{dz}{z}=0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), A = pp(-1, 0), B = pp(1, 0)
    const HO: P = [120, 150], HO2: P = [330, 150], HR = 70
    return <>
      <At until={1} frame={k}>
        <path d={`M28,${PO[1]} H272 M${PO[0]},60 V232`} stroke={C.faint} strokeWidth="1.4" />
        <At from={1} until={1} frame={k}><path d={arc(PO, PU, PI, 0) + ' Z'} fill={C.soft} opacity=".8" /></At>
        <path d={arc(PO, PU, PI, 0)} fill="none" stroke={C.a} strokeWidth="3.5" />
        <CircTip c={PO} r={PU} a={PI / 2} color={C.a} cw />
        <At until={0} frame={k}><Arrow from={A} to={[PO[0] + 10, PO[1]]} color={C.g} width={3.5} /><path d={`M${PO[0]},${PO[1]} H${B[0]}`} stroke={C.g} strokeWidth="3.5" /></At>
        <At from={1} until={1} frame={k}><Arrow from={B} to={[PO[0] - 10, PO[1]]} color={C.g} width={3.5} /><path d={`M${PO[0]},${PO[1]} H${A[0]}`} stroke={C.g} strokeWidth="3.5" /></At>
        <Dot at={A} color={C.fg} /><Dot at={B} color={C.fg} />
        <T x={A[0]} y={A[1] + 26} size={15} weight={600}>A = −1</T>
        <T x={B[0]} y={B[1] + 26} size={15} weight={600}>B = 1</T>
        <T x={PO[0] + 6} y={PO[1] + 18} size={12} color={C.mu} anchor="start">0</T>
        <T x={300} y={64} size={17} anchor="start" weight={700}>F(z) = z³/3</T>
      </At>
      <At until={0} frame={k}>
        <T x={300} y={104} size={15} anchor="start" color={C.a}>{t('busur', 'arc')}: 2/3</T>
        <T x={300} y={130} size={15} anchor="start" color={C.g}>{t('garis lurus', 'segment')}: 2/3</T>
        <T x={300} y={176} size={15} anchor="start">F(B) − F(A)</T>
        <T x={300} y={200} size={15} anchor="start">= 1/3 − (−1/3) = 2/3</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={300} y={104} size={15} anchor="start" color={C.a}>{t('pergi (busur)', 'out (arc)')}: +2/3</T>
        <T x={300} y={130} size={15} anchor="start" color={C.g}>{t('pulang (garis)', 'back (segment)')}: −2/3</T>
        <T x={300} y={184} size={22} anchor="start" color={C.v} weight={700}>∮ z² dz = 0</T>
      </At>

      <At from={2} until={2} frame={k}>
        {Array.from({ length: 9 }, (_, q) => {
          const x = GX + GQ * (q % 3), y = GY + GQ * Math.floor(q / 3), i = 7, a = 18, z = 38
          const red = (side: string) => (q === 3 && side === 'r') || (q === 4 && side === 'l')
          const col = (side: string) => red(side) ? C.r : C.a
          return <g key={q}>
            <rect x={x} y={y} width={GQ} height={GQ} fill="none" stroke={C.faint} />
            <path d={`M${x + i},${y + i} H${x + GQ - i} V${y + GQ - i} H${x + i} Z`} fill="none" stroke={C.a} strokeOpacity=".25" />
            <Arrow from={[x + a, y + GQ - i]} to={[x + z, y + GQ - i]} color={col('b')} width={2} head={6} />
            <Arrow from={[x + GQ - i, y + z]} to={[x + GQ - i, y + a]} color={col('r')} width={red('r') ? 2.5 : 2} head={6} />
            <Arrow from={[x + z, y + i]} to={[x + a, y + i]} color={col('t')} width={2} head={6} />
            <Arrow from={[x + i, y + a]} to={[x + i, y + z]} color={col('l')} width={red('l') ? 2.5 : 2} head={6} />
          </g>
        })}
        <rect x={GX} y={GY} width={3 * GQ} height={3 * GQ} fill="none" stroke={C.a} strokeWidth="3.5" />
        <T x={240} y={80} size={14} anchor="start" color={C.mu}>{t('tiap kotak kecil:', 'each small square:')}</T>
        <T x={240} y={102} size={14} anchor="start" color={C.a}>{t('putaran positif', 'one positive loop')}</T>
        <T x={240} y={140} size={14} anchor="start" color={C.r}>{t('sisi dalam:', 'inner edges:')}</T>
        <T x={240} y={162} size={14} anchor="start" color={C.r}>{t('dua arah, saling hapus', 'two ways, they cancel')}</T>
        <T x={240} y={200} size={14} anchor="start" color={C.a} weight={600}>{t('tersisa:', 'left over:')}</T>
        <T x={240} y={222} size={14} anchor="start" color={C.a} weight={600}>{t('hanya batas luar', 'the outer boundary')}</T>
        <T x={124} y={252} size={13} color={C.mu}>{t('f analitik di setiap kotak', 'f analytic in every square')}</T>
      </At>

      <At from={3} frame={k}>
        <path d={`M24,${HO[1]} H462`} stroke={C.faint} strokeWidth="1.4" />
        <T x={240} y={36} size={16} weight={600}>f(z) = 1/z</T>
        <circle cx={HO[0]} cy={HO[1]} r={HR} fill="none" stroke={C.r} strokeWidth="3" />
        <CircTip c={HO} r={HR} a={PI / 2} color={C.r} /><CircTip c={HO} r={HR} a={-PI / 2} color={C.r} />
        <Dot at={HO} color={C.r} r={6} hollow />
        <T x={HO[0]} y={HO[1] + 24} size={13} color={C.r}>{t('lubang di 0', 'hole at 0')}</T>
        <circle cx={HO2[0]} cy={HO2[1]} r={HR} fill="none" stroke={C.g} strokeWidth="3" />
        <CircTip c={HO2} r={HR} a={PI / 2} color={C.g} /><CircTip c={HO2} r={HR} a={-PI / 2} color={C.g} />
        <Dot at={HO2} color={C.g} r={4} />
        <T x={HO2[0]} y={HO2[1] + 22} size={13} color={C.mu}>3</T>
        <T x={HO[0]} y={252} size={17} color={C.r} weight={700}>∮ dz/z = 2πi</T>
        <T x={HO2[0]} y={252} size={17} color={C.g} weight={700}>∮ dz/z = 0</T>
        <T x={HO[0]} y={276} size={13} color={C.mu}>{t('mengelilingi 0', 'goes around 0')}</T>
        <T x={HO2[0]} y={276} size={13} color={C.mu}>{t('tidak mengelilingi 0', 'does not go around 0')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- cauchy: the circle knows the center
const KO: P = [160, 155], KU = 72
const cauchy: Story = {
  title: b('Lingkaran menentukan nilai di pusatnya', 'The circle determines the value at its center'),
  control: { label: b('Jari-jari lingkaran r', 'Circle radius r'), min: .5, max: 1.5, step: .1, initial: 1.2 },
  readout: v => { const r = Math.round(v * 10) / 10, e = (r * r + 1).toFixed(2), s = (1 - r * r).toFixed(2); return String.raw`r=${r}:\quad\tfrac14\left[2(${e})+2(${s})\right]=1=f(0)` },
  frames: [
    f('Ambil f(z) = z² + 1 dan lingkaran berjari-jari r di sekitar 0. Catat nilai f di empat titik mata angin: di ±r nilainya r² + 1, di ±ir nilainya 1 − r².', 'Take f(z) = z² + 1 and a circle of radius r around 0. Record f at the four compass points: at ±r the value is r² + 1, at ±ir it is 1 − r².', String.raw`f(\pm r)=r^2+1,\qquad f(\pm ir)=1-r^2`),
    f('Rata-ratakan keempatnya: (r² + 1) dan (1 − r²) saling mengimbangi, hasilnya selalu 1 = f(0). Geser r: nilai di lingkaran berubah, rata-ratanya tidak. Rumus integral Cauchy adalah rata-rata seperti ini atas seluruh lingkaran.', 'Average the four: (r² + 1) and (1 − r²) balance out, and the result is always 1 = f(0). Move r: the values on the circle change, their average does not. The Cauchy integral formula is this kind of average over the whole circle.', String.raw`f(a)=\frac1{2\pi i}\oint\frac{f(z)}{z-a}\,dz=\frac1{2\pi}\int_0^{2\pi}f(a+re^{it})\,dt`),
    f('Turunan juga dibaca dari lingkaran yang sama: turunkan rumus tadi terhadap a. Setiap f⁽ⁿ⁾(a) adalah integral di lingkaran, jadi fungsi analitik dapat diturunkan tak hingga kali. Di sini f′(0) = 0 dan f″(0) = 2.', 'Derivatives are read off the same circle: differentiate the formula in a. Every f⁽ⁿ⁾(a) is an integral over the circle, so an analytic function can be differentiated infinitely often. Here f′(0) = 0 and f″(0) = 2.', String.raw`f^{(n)}(a)=\frac{n!}{2\pi i}\oint\frac{f(z)}{(z-a)^{n+1}}\,dz`),
    f('Liouville: dari rumus turunan dan batas ML, |f′(a)| ≤ M/R untuk lingkaran berjari-jari R. Jika f entire dan terbatas (|f| ≤ M di mana-mana), perbesar R: M/R menuju 0, jadi f′ = 0 dan f konstan. z² + 1 tidak terbatas, jadi tidak terkena.', 'Liouville: from the derivative formula and the ML bound, |f′(a)| ≤ M/R on a circle of radius R. If f is entire and bounded (|f| ≤ M everywhere), let R grow: M/R goes to 0, so f′ = 0 and f is constant. z² + 1 is unbounded, so it escapes.', String.raw`|f'(a)|\le\frac{M}{R}\xrightarrow{R\to\infty}0`),
  ],
  draw: (k, v, lang) => {
    const t = tr(lang), r = Math.round(v * 10) / 10, R = r * KU, e = r * r + 1, s = 1 - r * r
    const E: P = [KO[0] + R, KO[1]], W: P = [KO[0] - R, KO[1]], N: P = [KO[0], KO[1] - R], S: P = [KO[0], KO[1] + R]
    const sv = s < -0.004 ? `(${num(lang, s)})` : num(lang, Math.abs(s))
    const LO: P = [110, 160], bars = [1, 2, 4, 8]
    return <>
      <At until={2} frame={k}>
        <path d={`M30,${KO[1]} H300 M${KO[0]},30 V282`} stroke={C.faint} strokeWidth="1.4" />
        <circle cx={KO[0]} cy={KO[1]} r={R} fill={C.soft} fillOpacity=".5" stroke={C.a} strokeWidth="3" />
        <Dot at={KO} color={C.v} r={6} />
        <Dot at={E} color={C.g} /><Dot at={W} color={C.g} /><Dot at={N} color={C.y} /><Dot at={S} color={C.y} />
        <T x={E[0] + 10} y={E[1] - 8} size={14} color={C.g} anchor="start" weight={600}>{num(lang, e)}</T>
        <T x={W[0] - 10} y={W[1] - 8} size={14} color={C.g} anchor="end" weight={600}>{num(lang, e)}</T>
        <T x={N[0] + 10} y={N[1] - 8} size={14} color={C.y} anchor="start" weight={600}>{num(lang, s)}</T>
        <T x={S[0] + 10} y={S[1] + 18} size={14} color={C.y} anchor="start" weight={600}>{num(lang, s)}</T>
        <T x={322} y={56} size={16} anchor="start" weight={700}>f(z) = z² + 1</T>
        <T x={322} y={88} size={14} anchor="start" color={C.g}>f(±r) = r² + 1</T>
        <T x={322} y={112} size={14} anchor="start" color={C.y}>f(±ir) = 1 − r²</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={322} y={152} size={13} anchor="start" color={C.mu}>{t('rata-rata 4 titik:', 'average of 4 points:')}</T>
        <T x={322} y={176} size={14} anchor="start">2·{num(lang, e)} + 2·{sv}</T>
        <T x={322} y={200} size={14} anchor="start">= 4 ⇒ 4 ÷ 4 = 1</T>
        <T x={322} y={234} size={20} anchor="start" color={C.v} weight={700}>= f(0)</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={322} y={152} size={13} anchor="start" color={C.mu}>{t('dari lingkaran:', 'from the circle:')}</T>
        <T x={322} y={180} size={15} anchor="start" color={C.v}>f(0) = 1</T>
        <T x={322} y={204} size={15} anchor="start">f′(0) = 0</T>
        <T x={322} y={228} size={15} anchor="start">f″(0) = 2</T>
        <T x={322} y={256} size={13} anchor="start" color={C.mu}>{t('f⁽ⁿ⁾ ada untuk semua n', 'f⁽ⁿ⁾ exists for every n')}</T>
      </At>

      <At from={3} frame={k}>
        {[1, 2, 4].map(m => <circle key={m} cx={LO[0]} cy={LO[1]} r={22 * m} fill="none" stroke={C.a} strokeWidth="2.5" strokeOpacity={1 - m / 8} />)}
        <Dot at={LO} color={C.v} r={5} />
        <T x={LO[0] + 6} y={LO[1] - 5} size={13} color={C.v} anchor="start" weight={600}>a</T>
        <T x={124} y={284} size={13} color={C.mu}>R = 1, 2, 4, 8, …</T>
        <T x={355} y={52} size={16} weight={700}>|f′(a)| ≤ M/R</T>
        <T x={355} y={74} size={13} color={C.mu}>M = 1</T>
        <path d="M262,240 H462" stroke={C.ln} strokeWidth="1.4" />
        {bars.map((m, j) => { const x = 270 + 46 * j, hgt = 140 / m; return <g key={m}>
          <rect x={x} y={240 - hgt} width={34} height={hgt} fill={C.v} opacity={.85} rx={3} />
          <T x={x + 17} y={234 - hgt} size={13} color={C.v}>{num(lang, 1 / m, m === 1 ? 0 : m === 2 ? 1 : m === 4 ? 2 : 3)}</T>
          <T x={x + 17} y={258} size={13} color={C.mu}>R = {m}</T>
        </g> })}
        <T x={355} y={282} size={13} color={C.g}>{t('R → ∞: f′(a) = 0', 'R → ∞: f′(a) = 0')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- series: 1/(1 − z) inside and outside the disc
const BX = 44, BW = 20, BS = 28, BY = 250, BU = 80, BTOP = 40
const SO: P = [375, 150], SU = 55
const partial = (z: number, N: number) => Array.from({ length: N + 1 }, (_, j) => z ** j).reduce((a, c) => a + c, 0)
const series: Story = {
  title: b('Deret geometri: berlaku di dalam cakram saja', 'The geometric series: valid only inside a disc'),
  control: { label: b('Banyak suku: sampai zᴺ', 'Number of terms: up to zᴺ'), min: 0, max: 8, step: 1, initial: 4 },
  readout: N => String.raw`N=${N}:\quad S_N(0.5)=${partial(.5, N).toFixed(4)},\quad S_N(1.5)=${partial(1.5, N).toFixed(2)}`,
  frames: [
    f('Deret geometri: 1/(1 − z) = 1 + z + z² + ⋯. Di z = 0,5 jumlah parsialnya 1; 1,5; 1,75; 1,875; … dan mendekati 2 = 1/(1 − 0,5). Geser N untuk menambah suku.', 'The geometric series: 1/(1 − z) = 1 + z + z² + ⋯. At z = 0.5 the partial sums are 1, 1.5, 1.75, 1.875, … and approach 2 = 1/(1 − 0.5). Move N to add terms.', String.raw`S_N(z)=1+z+\cdots+z^N=\frac{1-z^{N+1}}{1-z}`),
    f('Di mana deret ini berlaku? Deret Taylor di 0 berlaku pada cakram terbesar yang tidak memuat singularitas. 1/(1 − z) meledak di z = 1, jadi jari-jari kekonvergenannya tepat 1.', 'Where does the series work? A Taylor series at 0 is valid on the largest disc that contains no singularity. 1/(1 − z) blows up at z = 1, so the radius of convergence is exactly 1.', String.raw`\frac1{1-z}=\sum_{n=0}^\infty z^n,\quad |z|<1`),
    f('Di luar cakram, misalnya z = 1,5, suku zⁿ makin besar: jumlah parsialnya 1; 2,5; 4,75; 8,1; … meledak (batang merah, terpotong), padahal 1/(1 − 1,5) = −2. Di sana deret ini tidak berlaku.', 'Outside the disc, say z = 1.5, the terms zⁿ keep growing: the partial sums 1, 2.5, 4.75, 8.1, … blow up (red bars, cut off), although 1/(1 − 1.5) = −2. The series is not valid there.', String.raw`z=1.5:\ S_N=\frac{1.5^{N+1}-1}{0.5}\to\infty`),
    f('Deret Laurent menambahkan pangkat negatif dan hidup di cincin. f(z) = 1/(z(1 − z)) punya kutub di 0 dan 1. Pada 0 < |z| < 1: f = 1/z + 1 + z + ⋯. Pada |z| > 1: f = −1/z² − 1/z³ − ⋯. Fungsi sama, dua deret berbeda.', 'A Laurent series adds negative powers and lives on a ring. f(z) = 1/(z(1 − z)) has poles at 0 and 1. On 0 < |z| < 1: f = 1/z + 1 + z + ⋯. On |z| > 1: f = −1/z² − 1/z³ − ⋯. One function, two different series.', String.raw`\frac1{z(1-z)}=\sum_{n=-1}^\infty z^n\ (0<|z|<1),\quad -\sum_{n=2}^\infty z^{-n}\ (|z|>1)`),
  ],
  draw: (k, N, lang) => {
    const t = tr(lang), z = k === 2 ? 1.5 : .5, LO: P = [150, 160], LU = 70
    const sums = Array.from({ length: N + 1 }, (_, j) => partial(z, j))
    return <>
      <At until={2} frame={k}>
        <path d={`M36,${BY} H300`} stroke={C.ln} strokeWidth="1.4" />
        {[1, 2].map(v => <g key={v}>
          <path d={`M36,${BY - BU * v} H300`} stroke={C.faint} />
          <T x={30} y={BY - BU * v + 4} size={12} color={C.mu} anchor="end">{v}</T>
        </g>)}
        <At until={1} frame={k}>
          <path d={`M36,${BY - 2 * BU} H300`} stroke={C.g} strokeWidth="2" strokeDasharray="6 5" />
          <T x={40} y={58} size={13} color={C.g} anchor="start">{t('target', 'target')}: 1/(1 − {num(lang, .5, 1)}) = 2</T>
        </At>
        {sums.map((s, j) => { const x = BX + BS * j, top = Math.max(BTOP, BY - BU * s), cut = BY - BU * s < BTOP; return <g key={j}>
          <rect x={x} y={top} width={BW} height={BY - top} fill={z > 1 ? C.r : C.a} opacity={j === N ? 1 : .55} rx={2} />
          {cut && <path d={`M${x - 2},${top + 8} L${x + 7},${top + 3} L${x + 13},${top + 11} L${x + 22},${top + 6}`} stroke={C.bg} strokeWidth="3" fill="none" />}
        </g> })}
        {Array.from({ length: 9 }, (_, j) => <T key={j} x={BX + BS * j + BW / 2} y={268} size={12} color={j <= N ? C.fg : C.mu}>{j}</T>)}
        <T x={300} y={268} size={12} color={C.mu} anchor="end">N</T>
        <T x={BX + BS * N + BW / 2} y={z > 1 ? Math.max(BTOP, BY - BU * sums[N]) - 7 : (BY - BU * sums[N] - 7 > BY - 2 * BU + 16 ? BY - BU * sums[N] - 7 : BY - 2 * BU - 10)} size={13} weight={700} color={z > 1 ? C.r : C.a}>{num(lang, sums[N], z > 1 ? 1 : 3)}</T>
        <T x={168} y={288} size={13} color={C.mu}>S<tspan dy={4} fontSize="0.75em">N</tspan><tspan dy={-4}>({num(lang, z, 1)})</tspan></T>

        <T x={SO[0]} y={56} size={13} color={C.mu}>{t('bidang z', 'z-plane')}</T>
        <path d={`M316,${SO[1]} H464 M${SO[0]},72 V232`} stroke={C.faint} strokeWidth="1.4" />
        <At from={1} frame={k}>
          <circle cx={SO[0]} cy={SO[1]} r={SU} fill={C.g} fillOpacity=".15" stroke={C.g} strokeWidth="2.5" />
          <path d={`M${SO[0]},${SO[1]} L${onCircle(SO, SU, rad(125))}`} stroke={C.g} strokeWidth="1.5" strokeDasharray="4 3" />
          <T x={SO[0] - 30} y={SO[1] - 64} size={13} color={C.g} anchor="end">R = 1</T>
          <Cross at={[SO[0] + SU, SO[1]]} color={C.r} />
          <T x={SO[0] + SU + 10} y={SO[1] + 24} size={13} color={C.r} anchor="start">1</T>
        </At>
        <Dot at={[SO[0] + SU * z, SO[1]]} color={z > 1 ? C.r : C.a} />
        <T x={SO[0] + SU * z - (z > 1 ? 6 : 0)} y={SO[1] - 12} size={13} color={z > 1 ? C.r : C.a} weight={600}>{num(lang, z, 1)}</T>
      </At>

      <At from={3} frame={k}>
        <path d={`M14,26 H286 V286 H14 Z M${LO[0] - LU},${LO[1]} a${LU},${LU} 0 1,0 ${2 * LU},0 a${LU},${LU} 0 1,0 ${-2 * LU},0 Z`} fill={C.y} fillOpacity=".15" fillRule="evenodd" />
        <circle cx={LO[0]} cy={LO[1]} r={LU} fill={C.g} fillOpacity=".18" stroke={C.ln} strokeWidth="1.5" strokeDasharray="5 4" />
        <Cross at={LO} color={C.r} /><Cross at={[LO[0] + LU, LO[1]]} color={C.r} />
        <T x={LO[0]} y={LO[1] + 26} size={13} color={C.r}>0</T>
        <T x={LO[0] + LU + 14} y={LO[1] + 24} size={13} color={C.r} anchor="start">1</T>
        <T x={LO[0]} y={LO[1] - 30} size={14} color={C.g} weight={600}>0 &lt; |z| &lt; 1</T>
        <T x={LO[0]} y={56} size={14} color={C.y} weight={600}>|z| &gt; 1</T>
        <T x={298} y={60} size={15} anchor="start" weight={700}>f(z) = 1/(z(1 − z))</T>
        <T x={298} y={108} size={14} anchor="start" color={C.g} weight={600}>0 &lt; |z| &lt; 1:</T>
        <T x={298} y={132} size={14} anchor="start" color={C.g}>1/z + 1 + z + z² + ⋯</T>
        <T x={298} y={182} size={14} anchor="start" color={C.y} weight={600}>|z| &gt; 1:</T>
        <T x={298} y={206} size={14} anchor="start" color={C.y}>−1/z² − 1/z³ − ⋯</T>
        <T x={298} y={256} size={13} anchor="start" color={C.mu}>{t('satu fungsi, dua deret', 'one function, two series')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- singularities: three behaviours of |f| near 0
const SPX = [12, 166, 320], SPW = 148, SBASE = 225, SUY = 55, STOP = 45, SMAX = (SBASE - STOP) / SUY
const sp = (panel: number, half: number) => (x: number, y: number): P => [SPX[panel] + SPW / 2 + (65 / half) * x, SBASE - SUY * y]
const singularities: Story = {
  title: b('Tiga jenis singularitas terisolasi', 'Three kinds of isolated singularity'),
  frames: [
    f('sin z / z tidak terdefinisi di 0 (0/0), tetapi grafik |f| mendekati 1 dengan mulus dari kedua sisi. Yang hilang hanya satu titik.', 'sin z / z is undefined at 0 (0/0), but the graph of |f| approaches 1 smoothly from both sides. Only one point is missing.'),
    f('Tambal lubangnya dengan f(0) = 1, dan fungsinya menjadi analitik di 0. Inilah singularitas yang dapat dihapuskan.', 'Patch the hole with f(0) = 1, and the function becomes analytic at 0. This is a removable singularity.', String.raw`\frac{\sin z}{z}=1-\frac{z^2}{3!}+\frac{z^4}{5!}-\cdots`),
    f('1/z²: |f| meledak ke ∞ dari kedua sisi. Tidak ada nilai yang dapat menambalnya. Ini kutub, berorde 2.', '1/z²: |f| blows up to ∞ from both sides. No value can patch it. This is a pole, of order 2.', String.raw`\left|\frac1{z^2}\right|\to\infty`),
    f('e^(1/z): dari kiri (x < 0) nilainya menuju 0, dari kanan meledak, dan di sumbu imajiner |e^(1/(iy))| = 1 sambil terus berputar. Tidak ada limit sama sekali: singularitas esensial.', 'e^(1/z): from the left (x < 0) it tends to 0, from the right it explodes, and on the imaginary axis |e^(1/(iy))| = 1 while it keeps spinning. There is no limit at all: an essential singularity.', String.raw`\left|e^{1/(iy)}\right|=\left|e^{-i/y}\right|=1`),
    f('Aturan deret Laurent di sekitar 0: tanpa pangkat negatif berarti dapat dihapuskan, berhingga banyak berarti kutub, tak hingga banyak berarti esensial.', 'The Laurent rule around 0: no negative powers means removable, finitely many means a pole, infinitely many means essential.', String.raw`e^{1/z}=1+\frac1z+\frac1{2!\,z^2}+\frac1{3!\,z^3}+\cdots`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), p1 = sp(0, 3), p2 = sp(1, 2), p3 = sp(2, 2)
    const panel = (i: number, from: number, title: ReactNode) => {
      const x0 = SPX[i], cx = x0 + SPW / 2
      return <At from={from} frame={k}>
        <rect x={x0} y={14} width={SPW} height={272} rx={8} fill="none" stroke={C.faint} />
        <path d={`M${x0 + 8},${SBASE} H${x0 + SPW - 8}`} stroke={C.ln} strokeWidth="1.4" />
        <path d={`M${cx},${STOP} V${SBASE}`} stroke={C.faint} strokeDasharray="4 4" />
        <path d={`M${x0 + 8},${SBASE - SUY} H${x0 + SPW - 8}`} stroke={C.faint} />
        <T x={x0 + 8} y={SBASE - SUY - 4} size={12} color={C.mu} anchor="start">1</T>
        <T x={cx} y={SBASE + 16} size={12} color={C.mu}>0</T>
        <T x={cx} y={34} size={15} weight={700}>{title}</T>
      </At>
    }
    const kinds: [number, string, string, string][] = [[1, C.g, t('dapat dihapus', 'removable'), t('tanpa pangkat negatif', 'no negative powers')], [2, C.r, t('kutub orde 2', 'pole of order 2'), t('berhingga banyak', 'finitely many')], [3, C.v, t('esensial', 'essential'), t('tak hingga banyak', 'infinitely many')]]
    return <>
      {panel(0, 0, 'sin z / z')}
      {panel(1, 2, '1/z²')}
      {panel(2, 3, <>e<Sup>1/z</Sup></>)}
      <path d={fn(x => p1(x, Math.abs(x) < 1e-9 ? 1 : Math.abs(Math.sin(x) / x)), -3, 3, 120)} fill="none" stroke={C.g} strokeWidth="3" />
      <At until={0} frame={k}>
        <Dot at={p1(0, 1)} color={C.g} hollow />
        <T x={p1(0, 0)[0]} y={p1(0, 1)[1] - 16} size={14} color={C.r} weight={600}>0/0 ?</T>
      </At>
      <At from={1} frame={k}>
        <Dot at={p1(0, 1)} color={C.g} />
        <T x={p1(0, 0)[0]} y={p1(0, 1)[1] - 16} size={14} color={C.g} weight={600}>f(0) = 1</T>
      </At>
      <At from={2} frame={k}>
        <path d={fn(x => p2(x, 1 / x ** 2), -2, -1 / Math.sqrt(SMAX), 80)} fill="none" stroke={C.r} strokeWidth="3" />
        <path d={fn(x => p2(x, 1 / x ** 2), 1 / Math.sqrt(SMAX), 2, 80)} fill="none" stroke={C.r} strokeWidth="3" />
        <T x={p2(0, 0)[0] - 36} y={66} size={17} color={C.r} weight={700}>∞</T>
        <T x={p2(0, 0)[0] + 36} y={66} size={17} color={C.r} weight={700}>∞</T>
      </At>
      <At from={3} frame={k}>
        <path d={`M${SPX[2] + 8},${SBASE - SUY} H${SPX[2] + SPW - 8}`} stroke={C.y} strokeWidth="2" strokeDasharray="6 4" />
        <path d={fn(x => p3(x, Math.exp(1 / x)), -2, -.02, 100)} fill="none" stroke={C.v} strokeWidth="3" />
        <path d={fn(x => p3(x, Math.exp(1 / x)), 1 / Math.log(SMAX), 2, 100)} fill="none" stroke={C.v} strokeWidth="3" />
        <T x={p3(0, 0)[0] + 58} y={66} size={17} color={C.v} weight={700}>∞</T>
        <T x={SPX[2] + 8} y={72} size={12} color={C.y} anchor="start">{t('sumbu iy:', 'on iy:')}</T>
        <T x={SPX[2] + 8} y={88} size={12} color={C.y} anchor="start">|f| = 1,</T>
        <T x={SPX[2] + 8} y={104} size={12} color={C.y} anchor="start">{t('berputar', 'spinning')}</T>
        <T x={p3(-1.6, 0)[0]} y={SBASE - 10} size={12} color={C.v}>→ 0</T>
      </At>
      {kinds.map(([from, col, name, rule], i) => <g key={i}>
        <At from={from} frame={k}><T x={SPX[i] + SPW / 2} y={258} size={15} color={col} weight={700}>{name}</T></At>
        <At from={4} frame={k}><T x={SPX[i] + SPW / 2} y={278} size={12} color={C.mu}>{rule}</T></At>
      </g>)}
    </>
  },
}

// ---------------------------------------------------------------- residue: the contour only sees residues
const RO: P = [140, 155], RU = 70
const residue: Story = {
  title: b('Residu: integral hanya melihat koefisien 1/(z − a)', 'Residues: the integral only sees the 1/(z − a) coefficient'),
  control: { label: b('Jari-jari kontur R', 'Contour radius R'), min: .25, max: 1.75, step: .5, initial: .75 },
  controlFrom: 2,
  readout: R => R < 1 ? String.raw`R=${R}:\quad\oint=2\pi i\,(-1)=-2\pi i` : String.raw`R=${R}:\quad\oint=2\pi i\,(-1+1)=0`,
  frames: [
    f('f(z) = 1/(z(z − 1)) punya dua kutub: z = 0 dan z = 1. Pecahan parsial memberi f = −1/z + 1/(z − 1). Residu adalah koefisien 1/(z − a): −1 di 0 dan +1 di 1.', 'f(z) = 1/(z(z − 1)) has two poles: z = 0 and z = 1. Partial fractions give f = −1/z + 1/(z − 1). The residue is the coefficient of 1/(z − a): −1 at 0 and +1 at 1.', String.raw`\frac1{z(z-1)}=-\frac1z+\frac1{z-1}`),
    f('Mengapa hanya koefisien itu? Integralkan suku demi suku mengelilingi a: setiap pangkat (z − a)ⁿ memberi 0, kecuali n = −1 yang memberi 2πi. Kontur hanya "melihat" residu.', 'Why only that coefficient? Integrate term by term around a: every power (z − a)ⁿ gives 0, except n = −1, which gives 2πi. The contour only "sees" the residue.', String.raw`\oint(z-a)^n\,dz=\begin{cases}2\pi i,&n=-1\\0,&n\ne-1\end{cases}`),
    f('Teorema residu: ∮ = 2πi × (jumlah residu di dalam kontur). Geser R. Untuk R < 1 hanya kutub 0 yang di dalam, jadi ∮ = 2πi · (−1) = −2πi.', 'The residue theorem: ∮ = 2πi × (sum of the residues inside the contour). Move R. For R < 1 only the pole 0 is inside, so ∮ = 2πi · (−1) = −2πi.', String.raw`\oint_{|z|=R}f\,dz=2\pi i\sum_{|a|<R}\operatorname{Res}(f,a)`),
    f('Jalan pintas untuk kutub sederhana: Res = lim (z − a) f(z). Di 0: z · f = 1/(z − 1) → −1. Di 1: (z − 1) · f = 1/z → 1. Sama dengan pecahan parsial.', 'Shortcut for a simple pole: Res = lim (z − a) f(z). At 0: z · f = 1/(z − 1) → −1. At 1: (z − 1) · f = 1/z → 1. The same as the partial fractions.', String.raw`\operatorname{Res}_0f=\lim_{z\to0}\frac1{z-1}=-1,\qquad\operatorname{Res}_1f=\lim_{z\to1}\frac1z=1`),
    f('Untuk R > 1 kedua kutub di dalam: −1 + 1 = 0, jadi ∮ = 0 walaupun ada dua singularitas di dalam. Geser R melewati 1 dan lihat hasilnya melompat dari −2πi ke 0.', 'For R > 1 both poles are inside: −1 + 1 = 0, so ∮ = 0 even though two singularities are inside. Move R past 1 and watch the result jump from −2πi to 0.', String.raw`\oint_{|z|=R>1}f\,dz=2\pi i\,(-1+1)=0`),
  ],
  draw: (k, R, lang) => {
    const t = tr(lang), both = R > 1, live = k === 2 || k === 4
    const P0 = RO, P1: P = [RO[0] + RU, RO[1]]
    const c1 = k < 2 || k === 3 || both ? C.g : C.mu
    return <>
      <path d={`M14,${RO[1]} H272 M${RO[0]},26 V284`} stroke={C.faint} strokeWidth="1.4" />
      <At from={2} frame={k}>
        <circle cx={RO[0]} cy={RO[1]} r={R * RU} fill={C.soft} fillOpacity=".55" stroke={C.a} strokeWidth="3" style={{ transition: 'r .3s' }} />
        <CircTip c={RO} r={R * RU} a={PI / 4} color={C.a} span={.35 / R} /><CircTip c={RO} r={R * RU} a={-3 * PI / 4} color={C.a} span={.35 / R} />
      </At>
      <At from={1} until={1} frame={k}>
        <circle cx={P0[0]} cy={P0[1]} r={48} fill="none" stroke={C.v} strokeWidth="2.5" strokeDasharray="6 4" />
        <CircTip c={P0} r={48} a={PI / 2} color={C.v} span={.4} />
      </At>
      <Cross at={P0} color={C.r} /><Cross at={P1} color={c1} />
      <T x={128} y={182} size={13} color={C.mu} anchor="end">0</T>
      <T x={P1[0]} y={182} size={13} color={C.mu}>1</T>
      <At until={0} frame={k}>
        <T x={P0[0] - 6} y={128} size={13} color={C.r} weight={600} anchor="end">Res = −1</T>
        <T x={P1[0] + 8} y={128} size={13} color={C.g} weight={600}>Res = +1</T>
      </At>

      <At until={0} frame={k}>
        <T x={290} y={64} size={15} anchor="start" weight={700}>f(z) = 1/(z(z − 1))</T>
        <T x={290} y={94} size={15} anchor="start">= −1/z + 1/(z − 1)</T>
        <T x={290} y={146} size={15} anchor="start" color={C.r} weight={600}>{t('residu di 0', 'residue at 0')}: −1</T>
        <T x={290} y={174} size={15} anchor="start" color={C.g} weight={600}>{t('residu di 1', 'residue at 1')}: +1</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={290} y={64} size={15} anchor="start" weight={700}>∮ (z − a)ⁿ dz</T>
        {[[-2, '0'], [-1, '2πi'], [0, '0'], [1, '0'], [2, '0']].map(([m, v], j) => <T key={j} x={290} y={100 + 26 * j} size={15} anchor="start" color={m === -1 ? C.v : C.mu} weight={m === -1 ? 700 : 400}>n = {String(m).replace('-', '−')}:  {v}</T>)}
        <T x={290} y={250} size={13} anchor="start" color={C.mu}>{t('hanya n = −1 tersisa', 'only n = −1 survives')}</T>
      </At>
      <At from={2} until={4} frame={k}>
        <g style={{ opacity: live ? 1 : 0, transition: 'opacity .45s' }}>
          <T x={290} y={64} size={13} anchor="start" color={C.mu}>{t('kutub di dalam:', 'poles inside:')}</T>
          <T x={290} y={90} size={15} anchor="start" weight={600}>{both ? t('0 dan 1', '0 and 1') : t('hanya 0', 'only 0')}</T>
          <T x={290} y={130} size={13} anchor="start" color={C.mu}>{t('jumlah residu:', 'sum of residues:')}</T>
          <T x={290} y={156} size={15} anchor="start" weight={600}>{both ? '−1 + 1 = 0' : '−1'}</T>
          <T x={290} y={210} size={24} anchor="start" color={C.v} weight={700}>∮ = {both ? '0' : '−2πi'}</T>
          <T x={290} y={240} size={13} anchor="start" color={C.mu}>R = {num(lang, R)}</T>
        </g>
      </At>
      <At from={3} until={3} frame={k}>
        <T x={290} y={60} size={14} anchor="start" weight={700}>Res = lim (z − a) f(z)</T>
        <T x={290} y={104} size={14} anchor="start" color={C.r} weight={600}>a = 0:</T>
        <T x={290} y={128} size={14} anchor="start" color={C.r}>z · f = 1/(z − 1) → −1</T>
        <T x={290} y={174} size={14} anchor="start" color={C.g} weight={600}>a = 1:</T>
        <T x={290} y={198} size={14} anchor="start" color={C.g}>(z − 1) · f = 1/z → 1</T>
      </At>
    </>
  },
}

export const COMPLEX2_STORIES: Partial<Record<VisualKind, Story>> = { branch, trig, integral, primitive, cauchy, series, singularities, residue }
