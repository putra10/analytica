import type { VisualKind } from '../../content/summary-lessons'
import { At, Arrow, C, Clip, Dot, Grid, RightAngle, T, arc, b, f, fn, pl, plane, tr, type P, type Story } from './kit'

// ---------------------------------------------------------------- complex: modulus & conjugate
const O1: P = [70, 150], U1 = 26
const cp = (x: number, y: number): P => [O1[0] + U1 * x, O1[1] - U1 * y]

const conjugate: Story = {
  title: b('Modulus dan konjugat lewat satu titik: 3 + 4i', 'Modulus and conjugate through one point: 3 + 4i'),
  frames: [
    f('Bilangan kompleks adalah sebuah titik. 3 + 4i artinya: jalan 3 langkah ke kanan (bagian real), lalu 4 langkah ke atas (bagian imajiner).', 'A complex number is a point. 3 + 4i means: walk 3 steps right (the real part), then 4 steps up (the imaginary part).', String.raw`z=3+4i\;\leftrightarrow\;(3,4)`),
    f('Modulus |z| adalah jarak lurus dari 0 ke titik itu. Dua langkah tadi membentuk segitiga siku-siku, jadi Pythagoras memberi 5.', 'The modulus |z| is the straight-line distance from 0 to the point. The two walks form a right triangle, so Pythagoras gives 5.', String.raw`|z|=\sqrt{3^2+4^2}=5`),
    f('Konjugat membalik tanda bagian imajiner. Secara gambar: cerminkan titik terhadap sumbu real. Sudutnya berubah dari +53° menjadi −53°, panjangnya tetap 5.', 'The conjugate flips the sign of the imaginary part. In the picture: mirror the point across the real axis. Its angle goes from +53° to −53°; its length stays 5.', String.raw`\bar z=3-4i`),
    f('Perkalian kompleks menjumlahkan sudut dan mengalikan panjang. Sudut: 53° + (−53°) = 0°. Panjang: 5 × 5 = 25. Jadi z·z̄ jatuh tepat di sumbu real, di 25.', 'Complex multiplication adds angles and multiplies lengths. Angle: 53° + (−53°) = 0°. Length: 5 × 5 = 25. So z·z̄ lands exactly on the real axis, at 25.', String.raw`z\bar z=(3+4i)(3-4i)=25=|z|^2`),
    f('Inilah trik pembagian: kalikan atas dan bawah dengan konjugat penyebut. Penyebut berubah menjadi bilangan real 25, dan pembagian oleh bilangan real itu mudah.', 'This is the division trick: multiply top and bottom by the conjugate of the denominator. The denominator turns into the real number 25, and dividing by a real number is easy.', String.raw`\frac1{3+4i}=\frac{3-4i}{(3+4i)(3-4i)}=\frac{3-4i}{25}`),
  ],
  draw: (k, _v, lang) => {
    const t = (id: string, en: string) => lang === 'id' ? id : en
    const z = cp(3, 4), zb = cp(3, -4), foot = cp(3, 0)
    const y0 = O1[1], gapA = 300, gapB = 322, p25 = 440
    return <>
      {Array.from({ length: 8 }, (_, i) => <path key={`v${i}`} d={`M${cp(i - 1, 0)[0]},${cp(0, 4.5)[1]} V${cp(0, -4.5)[1]}`} stroke={C.faint} />)}
      {Array.from({ length: 9 }, (_, i) => <path key={`h${i}`} d={`M${cp(-1, 0)[0]},${cp(0, i - 4)[1]} H${cp(6, 0)[0]}`} stroke={C.faint} />)}
      <path d={`M${cp(-1, 0)[0]},${y0} H470 M${O1[0]},22 V278`} stroke={C.ln} strokeWidth="1.4" />
      <T x={470} y={y0 + 22} color={C.mu} size={13} anchor="end">{t('sumbu real', 'real axis')}</T>
      <T x={O1[0] + 8} y={24} color={C.mu} size={13} anchor="start">{t('sumbu imajiner', 'imaginary axis')}</T>
      <T x={O1[0] - 12} y={y0 + 18} color={C.mu} size={13}>0</T>
      <At from={3} frame={k}>
        <rect x={gapA} y={y0 - 12} width={gapB - gapA} height={24} fill="var(--surface)" />
        <path d={`M${gapA - 4},${y0 + 9} L${gapA + 4},${y0 - 9} M${gapB - 4},${y0 + 9} L${gapB + 4},${y0 - 9}`} stroke={C.ln} strokeWidth="1.4" />
        <path d={`M${O1[0]},${y0} H${gapA}`} stroke={C.v} strokeWidth="5" opacity=".75" />
        <Arrow from={[gapB, y0]} to={[p25, y0]} color={C.v} width={5} />
        <Dot at={[p25, y0]} color={C.v} r={7} />
        <path d={`M${cp(5, 0)[0]},${y0 - 6} V${y0 + 6}`} stroke={C.mu} strokeWidth="1.5" />
        <T x={cp(5, 0)[0]} y={y0 + 22} color={C.mu} size={12}>5</T>
        <T x={p25} y={112} color={C.v} anchor="end" weight={700} size={18}>z · z̄ = 25</T>
        <T x={p25} y={132} color={C.mu} size={13} anchor="end">{t('sudut 0°, panjang 5 × 5', 'angle 0°, length 5 × 5')}</T>
      </At>
      <Arrow from={O1} to={foot} color={C.a} />
      <Arrow from={foot} to={z} color={C.g} />
      <At from={0} until={1} frame={k}>
        <T x={(O1[0] + foot[0]) / 2} y={y0 + 22} color={C.a} weight={700}>3</T>
        <T x={foot[0] + 22} y={(foot[1] + z[1]) / 2 + 5} color={C.g} weight={700}>4i</T>
      </At>
      <Dot at={z} color={C.fg} />
      <T x={z[0] + 12} y={z[1] - 6} anchor="start" weight={600} size={17}>z = 3 + 4i</T>
      <At from={1} frame={k}>
        <path d={`M${O1[0]},${y0} L${z[0]},${z[1]}`} stroke={C.y} strokeWidth="4.5" strokeLinecap="round" />
        <path d={`M${foot[0] - 10},${foot[1]} V${foot[1] - 10} H${foot[0]}`} fill="none" stroke={C.mu} />
        <T x={94} y={88} color={C.y} size={22} weight={700}>5</T>
      </At>
      <At from={2} frame={k}>
        <path d={`M${z[0]},${z[1]} L${zb[0]},${zb[1]}`} stroke={C.r} strokeWidth="1.5" strokeDasharray="5 5" />
        <path d={`M${O1[0]},${y0} L${zb[0]},${zb[1]}`} stroke={C.r} strokeWidth="3.5" />
        <Dot at={zb} color={C.r} />
        <T x={zb[0] + 12} y={zb[1] + 6} anchor="start" color={C.r} weight={600} size={17}>z̄ = 3 − 4i</T>
        <path d={`M${O1[0] + 34},${y0} A34 34 0 0 0 ${O1[0] + 20.4},${y0 - 27.2}`} fill="none" stroke={C.fg} strokeWidth="1.8" />
        <path d={`M${O1[0] + 34},${y0} A34 34 0 0 1 ${O1[0] + 20.4},${y0 + 27.2}`} fill="none" stroke={C.r} strokeWidth="1.8" />
        <T x={122} y={130} size={13}>53°</T>
        <T x={124} y={182} size={13} color={C.r}>−53°</T>
        <T x={foot[0] + 8} y={204} size={12} color={C.mu} anchor="start">{t('cermin', 'mirror')}</T>
      </At>
      <At from={4} frame={k}>
        <rect x={280} y={196} width={184} height={64} rx={10} fill="var(--accent-soft)" stroke={C.a} />
        <T x={372} y={222} color={C.a} size={14} weight={600}>{t('penyebut menjadi real', 'denominator becomes real')}</T>
        <T x={372} y={246} size={15}>1/(3+4i) = (3 − 4i)/25</T>
      </At>
    </>
  },
}

const rad = (d: number) => d * Math.PI / 180
/** Subscript inside a T label, e.g. u<Sb>x</Sb>. */
const Sb = ({ children }: { children: string }) => <tspan baselineShift="sub" fontSize="72%">{children}</tspan>
const circ = (c: P, r: number) => `M${c[0] - r},${c[1]} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`

// ---------------------------------------------------------------- polar form and de Moivre: 1 + i
const PO: P = [215, 200], pp = plane(PO, 44)
const polar: Story = {
  title: b('Bentuk kutub: kalikan panjang, jumlahkan sudut', 'Polar form: multiply lengths, add angles'),
  frames: [
    f('1 + i bisa dibaca dua cara. Sebagai jalan: 1 ke kanan, lalu 1 ke atas. Atau sebagai panah: panjang √2 pada sudut 45°. Cara kedua adalah bentuk eksponensial r·e^(iθ).', '1 + i can be read two ways. As a walk: 1 right, then 1 up. Or as an arrow: length √2 at angle 45°. The second way is the exponential form r·e^(iθ).', String.raw`1+i=\sqrt2\,e^{i\pi/4}`),
    f('Kalikan dengan i. Bilangan i punya panjang 1 dan sudut 90°, jadi panjang tetap √2 dan sudut menjadi 45° + 90° = 135°. Hasilnya i(1 + i) = −1 + i: titiknya hanya diputar 90°.', 'Multiply by i. The number i has length 1 and angle 90°, so the length stays √2 and the angle becomes 45° + 90° = 135°. The result is i(1 + i) = −1 + i: the point is just turned 90°.', String.raw`i(1+i)=i+i^2=-1+i`),
    f('Sekarang kuadratkan. Panjang dikalikan: √2 · √2 = 2. Sudut dijumlahkan: 45° + 45° = 90°. Jadi (1 + i)² = 2i, tepat di sumbu imajiner.', 'Now square it. Lengths multiply: √2 · √2 = 2. Angles add: 45° + 45° = 90°. So (1 + i)² = 2i, right on the imaginary axis.', String.raw`(1+i)^2=1+2i+i^2=2i`),
    f('Terus kalikan dengan 1 + i: setiap kali panjang dikali √2 dan sudut ditambah 45°. Titik-titiknya membentuk spiral: z³ = −2 + 2i, lalu z⁴ = −4 (panjang 4, sudut 180°). Inilah rumus de Moivre.', 'Keep multiplying by 1 + i: each time the length is multiplied by √2 and 45° is added. The points spiral outward: z³ = −2 + 2i, then z⁴ = −4 (length 4, angle 180°). That is de Moivre’s formula.', String.raw`(re^{i\theta})^n=r^ne^{in\theta}:\ (1+i)^4=4e^{i\pi}=-4`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), z = pp(1, 1), z2 = pp(0, 2), z3 = pp(-2, 2), z4 = pp(-4, 0), zi = pp(-1, 1), X = 325
    return <>
      <Grid map={pp} x={[-4.4, 2.2]} y={[-1.8, 3.6]} />
      <T x={PO[0] - 10} y={PO[1] + 18} size={13} color={C.mu}>0</T>
      <At until={0} frame={k}>
        <Arrow from={PO} to={pp(1, 0)} color={C.y} width={2.5} />
        <Arrow from={pp(1, 0)} to={z} color={C.g} width={2.5} />
        <T x={pp(.5, 0)[0]} y={PO[1] + 20} color={C.y} weight={700}>1</T>
        <T x={z[0] + 8} y={pp(0, .5)[1] + 5} color={C.g} weight={700} anchor="start">1</T>
        <path d={arc(PO, 20, 0, rad(45))} fill="none" stroke={C.fg} strokeWidth="1.6" />
        <T x={PO[0] + 30} y={PO[1] - 12} size={13}>45°</T>
        <T x={229} y={170} color={C.a} weight={700} anchor="end">√2</T>
        <T x={X} y={60} anchor="start" size={18} weight={700}>1 + i</T>
        <T x={X} y={92} anchor="start" size={15}>{t('jalan', 'walk')} (<tspan fill={C.y}>1</tspan>, <tspan fill={C.g}>1</tspan>)</T>
        <T x={X} y={118} anchor="start" size={13} color={C.mu}>{t('atau', 'or')}</T>
        <T x={X} y={144} anchor="start" size={15} color={C.a}>{t('panjang √2', 'length √2')}</T>
        <T x={X} y={168} anchor="start" size={15} color={C.a}>{t('sudut 45°', 'angle 45°')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={arc(PO, 30, rad(45), rad(135))} fill="none" stroke={C.r} strokeWidth="2" />
        <T x={PO[0]} y={160} size={13} color={C.r} weight={600}>+90°</T>
        <Arrow from={PO} to={zi} color={C.v} />
        <Dot at={zi} color={C.v} />
        <T x={zi[0] - 8} y={zi[1] - 8} anchor="end" color={C.v} weight={600}>−1 + i</T>
        <T x={X} y={60} anchor="start" size={18} weight={700} color={C.v}>× i</T>
        <T x={X} y={92} anchor="start" size={15}>{t('panjang × 1', 'length × 1')}</T>
        <T x={X} y={116} anchor="start" size={15}>{t('sudut + 90°', 'angle + 90°')}</T>
        <T x={X} y={150} anchor="start" size={15} weight={600} color={C.v}>i(1 + i) = −1 + i</T>
      </At>
      <At from={2} frame={k}>
        <Arrow from={PO} to={z2} color={C.v} />
        <Dot at={z2} color={C.v} />
        <T x={z2[0] + 10} y={z2[1] + 4} anchor="start" color={C.v} weight={600}>z² = 2i</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={arc(PO, 26, 0, rad(45))} fill="none" stroke={C.a} strokeWidth="2" />
        <path d={arc(PO, 26, rad(45), rad(90))} fill="none" stroke={C.v} strokeWidth="2" />
        <T x={X} y={60} anchor="start" size={18} weight={700} color={C.v}>(1 + i)²</T>
        <T x={X} y={92} anchor="start" size={15}>√2 · √2 = 2</T>
        <T x={X} y={116} anchor="start" size={15}>45° + 45° = 90°</T>
        <T x={X} y={150} anchor="start" size={17} weight={700} color={C.v}>= 2i</T>
      </At>
      <At from={3} frame={k}>
        <path d={fn(th => { const r = 2 ** (2 * th / Math.PI); return pp(r * Math.cos(th), r * Math.sin(th)) }, 0, Math.PI)} fill="none" stroke={C.v} strokeWidth="2" strokeDasharray="6 5" />
        <Arrow from={PO} to={z3} color={C.v} width={2} />
        <Arrow from={PO} to={z4} color={C.v} width={2} />
        <Dot at={z3} color={C.v} /><Dot at={z4} color={C.v} r={7} />
        <T x={z3[0]} y={z3[1] - 12} color={C.v} weight={600}>z³</T>
        <T x={z4[0] + 11} y={z4[1] + 24} color={C.v} weight={700}>z⁴ = −4</T>
        {['z = √2 ∠45°', 'z² = 2 ∠90°', 'z³ = 2√2 ∠135°', 'z⁴ = 4 ∠180°'].map((s, i) => <T key={s} x={X} y={60 + i * 26} anchor="start" size={14} color={i ? C.v : C.a}>{s}</T>)}
        <T x={X} y={172} anchor="start" size={17} weight={700} color={C.v}>= −4</T>
        <T x={X} y={206} anchor="start" size={13} color={C.mu}>{t('tiap langkah:', 'each step:')}</T>
        <T x={X} y={226} anchor="start" size={13} color={C.mu}>{t('× √2 dan + 45°', '× √2 and + 45°')}</T>
      </At>
      <Arrow from={PO} to={z} color={C.a} />
      <Dot at={z} color={C.a} />
      <T x={z[0] + 8} y={z[1] - 8} anchor="start" weight={600} color={C.a}>1 + i</T>
    </>
  },
}

// ---------------------------------------------------------------- roots: w³ = 8
const RO: P = [150, 150], rp = plane(RO, 50)
const rootAt = (j: number) => rp(2 * Math.cos(rad(120 * j)), 2 * Math.sin(rad(120 * j)))
const roots: Story = {
  title: b('Akar pangkat tiga dari 8: tiga titik, bukan satu', 'Cube roots of 8: three points, not one'),
  frames: [
    f('Cari semua w dengan w³ = 8. Satu jawaban jelas: w = 2, karena 2 · 2 · 2 = 8. Di gambar, w = 2 punya panjang 2 dan sudut 0°.', 'Find every w with w³ = 8. One answer is obvious: w = 2, because 2 · 2 · 2 = 8. In the picture, w = 2 has length 2 and angle 0°.', String.raw`w^3=8=8e^{i0}`),
    f('Pangkat tiga memangkatkan panjang dan mengalikan sudut dengan 3. Ambil titik dengan panjang 2 di sudut 120°: panjangnya menjadi 2³ = 8 dan sudutnya 3 · 120° = 360°, satu putaran penuh kembali ke arah 0°. Jadi titik ini juga memenuhi w³ = 8.', 'Cubing cubes the length and triples the angle. Take the point of length 2 at angle 120°: its length becomes 2³ = 8 and its angle 3 · 120° = 360°, one full turn back to direction 0°. So this point also satisfies w³ = 8.', String.raw`\left(2e^{2\pi i/3}\right)^3=8e^{2\pi i}=8`),
    f('Sudut 240° juga berhasil: 3 · 240° = 720°, dua putaran penuh. Sudut berikutnya, 360°, memberi w = 2 lagi. Jadi hanya ada 3 akar yang berbeda.', 'Angle 240° works too: 3 · 240° = 720°, two full turns. The next angle, 360°, gives w = 2 again. So there are only 3 distinct roots.', String.raw`3\theta=0^\circ+360^\circ k\ \Rightarrow\ \theta=0^\circ,\,120^\circ,\,240^\circ`),
    f('Ketiga akar berjarak 120° pada lingkaran berjari-jari ∛8 = 2: titik sudut segitiga sama sisi. Secara umum, wⁿ = z₀ punya n akar yang membentuk segi-n beraturan.', 'The three roots sit 120° apart on the circle of radius ∛8 = 2: the corners of an equilateral triangle. In general, wⁿ = z₀ has n roots forming a regular n-gon.', String.raw`c_k=2e^{2k\pi i/3},\quad k=0,1,2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), [w0, w1, w2] = [0, 1, 2].map(rootAt), X = 296
    return <>
      <Grid map={rp} x={[-2.6, 2.6]} y={[-2.6, 2.6]} />
      <circle cx={RO[0]} cy={RO[1]} r={100} fill="none" stroke={C.ln} strokeWidth="1.5" strokeDasharray="5 5" />
      <T x={X} y={50} anchor="start" size={18} weight={700}>w³ = 8</T>
      <At from={3} frame={k}><path d={pl([w0, w1, w2], true)} fill={C.soft} fillOpacity=".6" stroke={C.v} strokeWidth="2.5" /></At>
      <At until={0} frame={k}>
        <T x={X} y={84} anchor="start" size={15} color={C.g} weight={600}>2 · 2 · 2 = 8 ✓</T>
        <T x={X} y={116} anchor="start" size={15} color={C.a}>w₀ = 2</T>
        <T x={X} y={140} anchor="start" size={14}>{t('panjang 2, sudut 0°', 'length 2, angle 0°')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={arc(RO, 34, 0, rad(120))} fill="none" stroke={C.g} strokeWidth="2" />
        <T x={RO[0] + 23} y={RO[1] - 36} size={13} color={C.g} weight={600}>120°</T>
        <T x={X} y={84} anchor="start" size={15} color={C.g} weight={600}>w₁: {t('sudut', 'angle')} 120°</T>
        <T x={X} y={110} anchor="start" size={14}>{t('panjang', 'length')} 2³ = 8</T>
        <T x={X} y={134} anchor="start" size={14}>{t('sudut', 'angle')} 3 × 120° = 360°</T>
        <T x={X} y={158} anchor="start" size={14} color={C.g} weight={600}>= 0° ⇒ w₁³ = 8 ✓</T>
      </At>
      <At from={2} until={2} frame={k}>
        <path d={arc(RO, 22, 0, rad(240))} fill="none" stroke={C.y} strokeWidth="2" />
        <T x={RO[0] - 38} y={RO[1] + 20} size={13} color={C.y} weight={600}>240°</T>
        <T x={X} y={84} anchor="start" size={15} color={C.y} weight={600}>w₂: {t('sudut', 'angle')} 240°</T>
        <T x={X} y={110} anchor="start" size={14}>3 × 240° = 720°</T>
        <T x={X} y={134} anchor="start" size={14} color={C.y} weight={600}>= 0° ⇒ w₂³ = 8 ✓</T>
        <T x={X} y={172} anchor="start" size={13} color={C.mu}>{t('sudut 360° → w₀ lagi', 'angle 360° → w₀ again')}</T>
        <T x={X} y={196} anchor="start" size={15} weight={700}>{t('hanya 3 akar', 'only 3 roots')}</T>
      </At>
      <At from={3} frame={k}>
        {[['w₀ = 2', C.a], ['w₁ = −1 + i√3', C.g], ['w₂ = −1 − i√3', C.y]].map(([s, c], i) => <T key={s} x={X} y={86 + i * 26} anchor="start" size={15} weight={600} color={c}>{s}</T>)}
        <T x={X} y={180} anchor="start" size={14}>{t('berjarak 120°', '120° apart')}</T>
        <T x={X} y={204} anchor="start" size={14} color={C.v} weight={600}>{t('segitiga sama sisi', 'equilateral triangle')}</T>
      </At>
      <At from={1} frame={k}><Arrow from={RO} to={w1} color={C.g} /><Dot at={w1} color={C.g} /><T x={w1[0] - 10} y={w1[1] - 8} anchor="end" color={C.g} weight={700}>w₁</T></At>
      <At from={2} frame={k}><Arrow from={RO} to={w2} color={C.y} /><Dot at={w2} color={C.y} /><T x={w2[0] - 10} y={w2[1] + 20} anchor="end" color={C.y} weight={700}>w₂</T></At>
      <Arrow from={RO} to={w0} color={C.a} />
      <Dot at={w0} color={C.a} />
      <T x={w0[0] + 8} y={w0[1] - 10} anchor="start" color={C.a} weight={700}>w₀</T>
    </>
  },
}

// ---------------------------------------------------------------- regions: open disc, interior, boundary, domain
const DO: P = [150, 150], DU = 110
const disc: Story = {
  title: b('Terbuka, batas, dan domain: uji dengan cakram kecil', 'Open, boundary and domain: test with a small disc'),
  frames: [
    f('Himpunan |z| < 1 berisi semua titik yang jaraknya dari 0 kurang dari 1: cakram satuan tanpa tepinya. Tepi |z| = 1 digambar putus-putus karena tidak ikut.', 'The set |z| < 1 holds every point whose distance from 0 is less than 1: the unit disc without its edge. The edge |z| = 1 is dashed because it is left out.', String.raw`\{z:|z|<1\}`),
    f('Ambil P = 0.6. Jaraknya ke tepi 0.4, jadi cakram kecil berjari-jari ε = 0.2 di sekitar P masih seluruhnya di dalam. P titik interior. Setiap titik di dalam punya ruang seperti ini, jadi |z| < 1 terbuka.', 'Take P = 0.6. Its distance to the edge is 0.4, so a small disc of radius ε = 0.2 around P lies completely inside. P is an interior point. Every point inside has room like this, so |z| < 1 is open.', String.raw`|w-0.6|<0.2\Rightarrow|w|<0.8<1`),
    f('Q = 1 ada di tepi. Sekecil apa pun cakram di sekitar Q, sebagian selalu keluar (merah): titik 1 + ε/2 sudah di luar. Jadi Q titik batas. Cakram tertutup |z| ≤ 1 memuat tepinya (garis penuh), maka tidak terbuka.', 'Q = 1 is on the edge. However small the disc around Q, part of it always pokes outside (red): the point 1 + ε/2 is already outside. So Q is a boundary point. The closed disc |z| ≤ 1 contains its edge (solid line), so it is not open.', String.raw`|1+\varepsilon/2|>1`),
    f('Domain = terbuka + terhubung. Anulus 1 < |z| < 2 terbuka (kedua tepinya putus-putus) dan terhubung: dari A ke B ada garis patah yang memutari lubang tanpa keluar. Garis lurus memang menembus lubang, tetapi satu jalan saja sudah cukup.', 'Domain = open + connected. The annulus 1 < |z| < 2 is open (both edges dashed) and connected: from A to B a broken line goes around the hole without leaving. The straight segment does cross the hole, but one path is enough.', String.raw`D=\{1<|z|<2\}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), P0: P = [DO[0] + .6 * DU, DO[1]], Q: P = [DO[0] + DU, DO[1]], X = 300
    const ring = plane(DO, 60), A = ring(1.5, 0), B = ring(-1.5, 0)
    const path = [0, 45, 90, 135, 180].map(d => ring(1.5 * Math.cos(rad(d)), 1.5 * Math.sin(rad(d))))
    return <>
      <path d={`M25,${DO[1]} H275 M${DO[0]},25 V275`} stroke={C.ln} strokeWidth="1.2" />
      <At until={2} frame={k}>
        <path d={circ(DO, DU)} fill={C.soft} stroke={C.a} strokeWidth="2.5" strokeDasharray="8 6" />
        <T x={DO[0]} y={98} size={18} weight={700} color={C.a}>{'|z| < 1'}</T>
        <T x={DO[0] - 10} y={DO[1] + 18} size={13} color={C.mu}>0</T>
      </At>
      <At until={0} frame={k}>
        <T x={X} y={70} anchor="start" size={15}>{t('tepi putus-putus:', 'dashed edge:')}</T>
        <T x={X} y={94} anchor="start" size={15}>{t('|z| = 1 tidak ikut', '|z| = 1 is left out')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <circle cx={P0[0]} cy={P0[1]} r={.2 * DU} fill={C.g} fillOpacity=".25" stroke={C.g} strokeWidth="2.5" />
        <Dot at={P0} color={C.g} r={5} />
        <T x={P0[0]} y={P0[1] - 30} color={C.g} weight={700}>P</T>
        <T x={X} y={70} anchor="start" size={16} weight={700} color={C.g}>P = 0.6</T>
        <T x={X} y={98} anchor="start" size={14}>{t('jarak ke tepi: 0.4', 'distance to edge: 0.4')}</T>
        <T x={X} y={122} anchor="start" size={14}>{t('ε = 0.2: muat ✓', 'ε = 0.2: fits ✓')}</T>
        <T x={X} y={154} anchor="start" size={15} weight={600} color={C.g}>{t('P titik interior', 'P is interior')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <defs><clipPath id="cdisc-out"><path d={`M0,0 H480 V300 H0 Z ${circ(DO, DU)}`} clipRule="evenodd" /></clipPath></defs>
        <g clipPath="url(#cdisc-out)">{[27.5, 14].map(r => <circle key={r} cx={Q[0]} cy={Q[1]} r={r} fill={C.r} fillOpacity=".5" />)}</g>
        {[27.5, 14].map(r => <circle key={r} cx={Q[0]} cy={Q[1]} r={r} fill="none" stroke={C.y} strokeWidth="2" />)}
        <Dot at={Q} color={C.fg} r={4} />
        <Dot at={[Q[0] + 13.75, Q[1]]} color={C.r} r={3} />
        <T x={Q[0] + 12} y={Q[1] - 32} anchor="start" color={C.r} weight={700}>Q</T>
        <T x={X} y={62} anchor="start" size={16} weight={700} color={C.r}>{t('Q = 1: titik batas', 'Q = 1: boundary')}</T>
        <T x={X} y={88} anchor="start" size={14}>{t('setiap cakram kecil', 'every small disc')}</T>
        <T x={X} y={110} anchor="start" size={14}>{t('keluar sebagian (merah)', 'pokes outside (red)')}</T>
        <path d={circ([316, 214], 12)} fill={C.soft} stroke={C.a} strokeWidth="2" strokeDasharray="4 3" />
        <T x={338} y={219} anchor="start" size={13}>{t('|z| < 1: terbuka', '|z| < 1: open')}</T>
        <path d={circ([316, 252], 12)} fill={C.soft} stroke={C.a} strokeWidth="2" />
        <T x={338} y={257} anchor="start" size={13}>{t('|z| ≤ 1: tertutup', '|z| ≤ 1: closed')}</T>
      </At>
      <At from={3} frame={k}>
        <path d={`${circ(DO, 120)} ${circ(DO, 60)}`} fill={C.soft} fillRule="evenodd" stroke={C.a} strokeWidth="2.5" strokeDasharray="8 6" />
        <path d={pl([A, B])} stroke={C.r} strokeWidth="1.8" strokeDasharray="5 5" />
        <T x={DO[0]} y={DO[1] + 6} size={18} weight={700} color={C.r}>✗</T>
        <path d={pl(path)} fill="none" stroke={C.g} strokeWidth="3.5" strokeLinejoin="round" />
        <Dot at={A} color={C.g} /><Dot at={B} color={C.g} />
        <T x={A[0]} y={A[1] + 24} weight={700} color={C.g}>A</T>
        <T x={B[0]} y={B[1] + 24} weight={700} color={C.g}>B</T>
        <T x={X} y={62} anchor="start" size={17} weight={700}>{'1 < |z| < 2'}</T>
        <T x={X} y={94} anchor="start" size={15}>{t('terbuka ✓', 'open ✓')}</T>
        <T x={X} y={118} anchor="start" size={15}>{t('terhubung ✓', 'connected ✓')}</T>
        <T x={X} y={150} anchor="start" size={17} weight={700} color={C.v}>= domain</T>
        <T x={X} y={190} anchor="start" size={13} color={C.g}>{t('hijau: garis patah', 'green: broken line')}</T>
        <T x={X} y={210} anchor="start" size={13} color={C.g}>{t('memutari lubang', 'around the hole')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- mappings: w = z²
const MZ: P = [115, 170], mz = plane(MZ, 60), MW: P = [360, 160], mw = plane(MW, 28)
const sq = (x: number, y: number) => mw(x * x - y * y, 2 * x * y)
const mapping: Story = {
  title: b('w = z² sebagai pemetaan dua bidang', 'w = z² as a map between two planes'),
  frames: [
    f('Grafik w = f(z) butuh empat dimensi, jadi kita gambar dua bidang: masukan z di kiri, keluaran w di kanan. Untuk w = z², titik 1 + i dikirim ke (1 + i)² = 2i. Panjang √2 menjadi 2, sudut 45° menjadi 90°.', 'The graph of w = f(z) would need four dimensions, so we draw two planes: input z on the left, output w on the right. Under w = z², the point 1 + i goes to (1 + i)² = 2i. Length √2 becomes 2, angle 45° becomes 90°.', String.raw`w=z^2:\quad u=x^2-y^2,\ v=2xy`),
    f('Garis datar y = 1 menjadi parabola u = x² − 1, v = 2x. Ikuti tiga titik: x = −1 ↦ −2i, x = 0 ↦ −1, x = 1 ↦ 2i. Garis lurus bisa melengkung setelah dipetakan.', 'The horizontal line y = 1 becomes the parabola u = x² − 1, v = 2x. Follow three points: x = −1 ↦ −2i, x = 0 ↦ −1, x = 1 ↦ 2i. A straight line can bend once it is mapped.', String.raw`y=1:\ u=x^2-1,\ v=2x`),
    f('Dalam bentuk kutub, z² mengkuadratkan panjang dan menggandakan sudut. Jadi kuadran pertama (sudut 0° sampai 90°) terbuka menjadi setengah bidang atas (0° sampai 180°).', 'In polar form, z² squares the length and doubles the angle. So the first quadrant (angles 0° to 90°) opens up into the upper half plane (0° to 180°).', String.raw`re^{i\theta}\mapsto r^2e^{2i\theta}`),
    f('Garis kisi x = c (ungu) dan y = c (hijau) menjadi parabola, dan di bidang w parabola-parabola itu tetap berpotongan tegak lurus. Pemetaan ini konformal: sudut terjaga di mana f′(z) = 2z ≠ 0. Di 0, f′ = 0 dan sudut 90° di pojok malah menjadi 180°.', 'Grid lines x = c (violet) and y = c (green) become parabolas, and in the w-plane they still cross at right angles. The map is conformal: angles are kept wherever f′(z) = 2z ≠ 0. At 0, f′ = 0 and the 90° corner turns into 180°.', b(String.raw`f'(z)=2z\ne0\ \Rightarrow\ \text{konformal}`, String.raw`f'(z)=2z\ne0\ \Rightarrow\ \text{conformal}`)),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), cs = [.4, .8, 1.2], three = [C.y, C.g, C.a]
    return <>
      <Grid map={mz} x={[-1.6, 1.6]} y={[-1.3, 1.9]} />
      <Grid map={mw} x={[-3, 3.6]} y={[-3.2, 3.2]} />
      <T x={MZ[0]} y={36} size={14} color={C.mu} weight={600}>{t('bidang z', 'z-plane')}</T>
      <T x={MW[0] + 8} y={36} size={14} color={C.mu} weight={600}>{t('bidang w', 'w-plane')}</T>
      <Arrow from={[220, 125]} to={[264, 125]} color={C.v} width={2.5} />
      <T x={242} y={112} size={15} weight={700} color={C.v}>w = z²</T>
      <At until={0} frame={k}>
        <Arrow from={MZ} to={mz(1, 1)} color={C.a} /><Dot at={mz(1, 1)} color={C.a} />
        <path d={arc(MZ, 24, 0, rad(45))} fill="none" stroke={C.fg} strokeWidth="1.6" />
        <T x={MZ[0] + 36} y={MZ[1] - 10} size={13}>45°</T>
        <T x={mz(1, 1)[0] + 8} y={mz(1, 1)[1] - 8} anchor="start" weight={600} color={C.a}>1 + i</T>
        <Arrow from={MW} to={mw(0, 2)} color={C.v} /><Dot at={mw(0, 2)} color={C.v} />
        <path d={arc(MW, 20, 0, rad(90))} fill="none" stroke={C.fg} strokeWidth="1.6" />
        <T x={MW[0] + 26} y={MW[1] - 22} size={13}>90°</T>
        <T x={mw(0, 2)[0] + 9} y={mw(0, 2)[1] - 4} anchor="start" weight={600} color={C.v}>2i</T>
        <T x={MZ[0]} y={278} size={14}>√2 ∠45°</T>
        <T x={MW[0]} y={278} size={14} color={C.v}>2 ∠90°</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([mz(-1.6, 1), mz(1.6, 1)])} stroke={C.v} strokeWidth="3" />
        <path d={fn(x => sq(x, 1), -1.6, 1.6)} fill="none" stroke={C.v} strokeWidth="3" />
        {[-1, 0, 1].map((x, i) => <g key={x}>
          <Dot at={mz(x, 1)} color={three[i]} /><Dot at={sq(x, 1)} color={three[i]} />
          <T x={mz(x, 1)[0]} y={mz(x, 1)[1] - 12} size={14} weight={600} color={three[i]}>{['−1 + i', 'i', '1 + i'][i]}</T>
        </g>)}
        <T x={sq(-1, 1)[0] + 8} y={sq(-1, 1)[1] - 8} anchor="start" size={14} weight={600} color={three[0]}>−2i</T>
        <T x={sq(0, 1)[0] - 10} y={sq(0, 1)[1] + 5} anchor="end" size={14} weight={600} color={three[1]}>−1</T>
        <T x={sq(1, 1)[0] + 8} y={sq(1, 1)[1] + 16} anchor="start" size={14} weight={600} color={three[2]}>2i</T>
        <T x={240} y={282} size={14} color={C.v}>y = 1 ↦ u = x² − 1, v = 2x</T>
      </At>
      <At from={2} until={2} frame={k}>
        <rect x={MZ[0]} y={mz(0, 1.9)[1]} width={1.6 * 60} height={1.9 * 60} fill={C.a} fillOpacity=".12" />
        <rect x={mw(-3, 0)[0]} y={mw(0, 3.2)[1]} width={6.6 * 28} height={3.2 * 28} fill={C.a} fillOpacity=".12" />
        {[0, 45, 90].map((d, i) => { const a = rad(d), c = [C.a, C.g, C.r][i], e = mz(1.4 * Math.cos(a), 1.4 * Math.sin(a)), g = mw(3 * Math.cos(2 * a), 3 * Math.sin(2 * a)); return <g key={d}>
          <path d={pl([MZ, e])} stroke={c} strokeWidth="3" />
          <path d={pl([MW, g])} stroke={c} strokeWidth="3" />
        </g> })}
        <T x={mz(1.4, 0)[0] + 4} y={MZ[1] + 18} anchor="start" size={13} color={C.a} weight={600}>0°</T>
        <T x={mz(1, 1)[0] + 6} y={mz(1, 1)[1] - 2} anchor="start" size={13} color={C.g} weight={600}>45°</T>
        <T x={MZ[0]} y={mz(0, 1.4)[1] - 8} size={13} color={C.r} weight={600}>90°</T>
        <T x={mw(3, 0)[0] - 4} y={MW[1] + 18} anchor="end" size={13} color={C.a} weight={600}>0°</T>
        <T x={MW[0] + 6} y={mw(0, 3)[1] + 6} anchor="start" size={13} color={C.g} weight={600}>90°</T>
        <T x={mw(-3, 0)[0] + 2} y={MW[1] + 18} anchor="start" size={13} color={C.r} weight={600}>180°</T>
        <T x={240} y={282} size={14} color={C.v}>{t('sudut × 2: kuadran ↦ setengah bidang', 'angle × 2: quadrant ↦ half plane')}</T>
      </At>
      <At from={3} frame={k}>
        {cs.map(c => <g key={c}>
          <path d={pl([mz(c, 0), mz(c, 1.2)])} stroke={C.a} strokeWidth="2.5" />
          <path d={pl([mz(0, c), mz(1.2, c)])} stroke={C.g} strokeWidth="2.5" />
          <path d={fn(y => sq(c, y), 0, 1.2, 40)} fill="none" stroke={C.a} strokeWidth="2.5" />
          <path d={fn(x => sq(x, c), 0, 1.2, 40)} fill="none" stroke={C.g} strokeWidth="2.5" />
        </g>)}
        <RightAngle at={mz(.8, .8)} a={0} size={10} color={C.fg} />
        <RightAngle at={sq(.8, .8)} a={rad(45)} size={10} color={C.fg} />
        <path d={arc(MZ, 12, 0, rad(90))} fill="none" stroke={C.r} strokeWidth="2" />
        <path d={arc(MW, 12, 0, rad(180))} fill="none" stroke={C.r} strokeWidth="2" />
        <Dot at={MZ} color={C.r} r={4} /><Dot at={MW} color={C.r} r={4} />
        <T x={240} y={262} size={14} color={C.g} weight={600}>{t('f′ ≠ 0: tetap 90°', 'f′ ≠ 0: still 90°')}</T>
        <T x={240} y={284} size={14} color={C.r}>{t('di 0: f′(0) = 0, sudut 90° ↦ 180°', 'at 0: f′(0) = 0, angle 90° ↦ 180°')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- limits and the derivative as local multiplication
const Turn = ({ c, ccw, color, r = 11 }: { c: P; ccw: boolean; color: string; r?: number }) => {
  const a0 = rad(ccw ? -60 : 240), a1 = rad(ccw ? 210 : -30), e: P = [c[0] + r * Math.cos(a1), c[1] - r * Math.sin(a1)]
  const th = ccw ? Math.atan2(-Math.cos(a1), -Math.sin(a1)) : Math.atan2(Math.cos(a1), Math.sin(a1))
  const h = (s: number) => `${e[0] - 6 * Math.cos(th + s)},${e[1] - 6 * Math.sin(th + s)}`
  return <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d={arc(c, r, a0, a1)} /><path d={`M${h(.5)} L${e[0]},${e[1]} L${h(-.5)}`} /></g>
}
const derivative: Story = {
  title: b('Turunan kompleks: limit dari segala arah', 'The complex derivative: a limit from every direction'),
  frames: [
    f('Di kalkulus real, h → 0 hanya dari kiri atau kanan. Di bidang kompleks, h boleh mendekati 0 dari arah mana saja: kanan, atas, miring. Limit harus sama untuk semua arah itu.', 'In real calculus, h → 0 only from the left or the right. In the complex plane, h may approach 0 from any direction: right, up, diagonal. The limit must agree for all of them.', String.raw`f'(z_0)=\lim_{h\to0}\frac{f(z_0+h)-f(z_0)}{h}`),
    f('Contoh limit yang gagal: z̄/z di dekat 0. Sepanjang sumbu real nilainya selalu 1. Sepanjang sumbu imajiner nilainya selalu −1. Dua arah memberi dua jawaban, jadi limitnya tidak ada.', 'A limit that fails: z̄/z near 0. Along the real axis its value is always 1. Along the imaginary axis it is always −1. Two directions give two answers, so the limit does not exist.', String.raw`\frac{\bar z}{z}=\frac{x}{x}=1,\qquad \frac{\bar z}{z}=\frac{-iy}{iy}=-1`),
    f('Turunan adalah perkalian lokal. Untuk f(z) = z² di z₀ = 1 + i, f′(z₀) = 2z₀ = 2 + 2i. Persegi kecil di dekat z₀ menjadi persegi yang diputar 45° dan diperbesar |2 + 2i| = 2√2 ≈ 2.83 kali.', 'The derivative is local multiplication. For f(z) = z² at z₀ = 1 + i, f′(z₀) = 2z₀ = 2 + 2i. A tiny square near z₀ becomes a square turned 45° and stretched |2 + 2i| = 2√2 ≈ 2.83 times.', String.raw`f(z_0+h)\approx f(z_0)+f'(z_0)\,h,\quad f'(1+i)=2\sqrt2\,e^{i\pi/4}`),
    f('Bandingkan z̄. Langkah h tetap h, tetapi langkah ih menjadi −ih: persegi dicerminkan dan arah putarnya berbalik. Perkalian dengan bilangan kompleks hanya bisa memutar dan memperbesar, tidak pernah mencerminkan. Jadi z̄ tidak punya turunan.', 'Compare z̄. The step h stays h, but the step ih becomes −ih: the square is mirrored and its turning direction flips. Multiplying by a complex number can only turn and stretch, never mirror. So z̄ has no derivative.', String.raw`\frac{\overline{h}}{h}=1,\qquad \frac{\overline{ih}}{ih}=-1`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), D0: P = [140, 150], X = 282
    const Z: P = [70, 190], s = 40, B: P = [350, 240], S = s * 2 * Math.SQRT2
    const d45: P = [S * Math.SQRT1_2, -S * Math.SQRT1_2], P1: P = [B[0] + d45[0], B[1] + d45[1]], P2: P = [B[0] - d45[0], B[1] + d45[1]], top: P = [B[0], B[1] + 2 * d45[1]]
    const M: P = [330, 130]
    return <>
      <At until={0} frame={k}>
        <path d="M30,150 H190" stroke={C.ln} strokeWidth="1.5" />
        <Arrow from={[36, 150]} to={[100, 150]} color={C.a} />
        <Arrow from={[184, 150]} to={[120, 150]} color={C.a} />
        <Dot at={[110, 150]} color={C.fg} />
        <path d="M222,40 V262" stroke={C.faint} />
        {Array.from({ length: 8 }, (_, i) => { const a = rad(i * 45 + 22.5), u: P = [Math.cos(a), -Math.sin(a)]; return <Arrow key={i} from={[340 + 100 * u[0], 150 + 100 * u[1]]} to={[340 + 16 * u[0], 150 + 16 * u[1]]} color={i % 2 ? C.g : C.v} width={2.5} /> })}
        <Dot at={[340, 150]} color={C.fg} />
        <T x={110} y={200} size={15} weight={600}>{t('garis real: 2 arah', 'real line: 2 ways')}</T>
        <T x={340} y={282} size={15} weight={600}>{t('bidang kompleks: semua arah', 'complex plane: every way')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={`M${D0[0] - 115},${D0[1]} H${D0[0] + 115} M${D0[0]},35 V265`} stroke={C.ln} strokeWidth="1.4" />
        {[100, 64, 34].flatMap(d => [-1, 1].map(sg => <g key={`${d}${sg}`}>
          <Dot at={[D0[0] + sg * d, D0[1]]} color={C.g} r={4.5} />
          <T x={D0[0] + sg * d} y={D0[1] - 10} size={13} weight={700} color={C.g}>1</T>
          <Dot at={[D0[0], D0[1] + sg * d]} color={C.r} r={4.5} />
          <T x={D0[0] + 9} y={D0[1] + sg * d + 5} anchor="start" size={13} weight={700} color={C.r}>−1</T>
        </g>))}
        <circle cx={D0[0]} cy={D0[1]} r={7} fill={C.bg} stroke={C.fg} strokeWidth="2" />
        <T x={X} y={60} anchor="start" size={17} weight={700}>{t('z̄/z di dekat 0', 'z̄/z near 0')}</T>
        <T x={X} y={94} anchor="start" size={14} color={C.g}>{t('sumbu real:', 'real axis:')} x/x = 1</T>
        <T x={X} y={122} anchor="start" size={14} color={C.r}>{t('sumbu imajiner:', 'imaginary axis:')}</T>
        <T x={X} y={144} anchor="start" size={14} color={C.r}>(−iy)/(iy) = −1</T>
        <T x={X} y={184} anchor="start" size={18} weight={700}>1 ≠ −1</T>
        <T x={X} y={208} anchor="start" size={14} color={C.mu}>{t('limit tidak ada', 'no limit')}</T>
      </At>
      <At from={2} frame={k}>
        <path d={pl([Z, [Z[0] + s, Z[1]], [Z[0] + s, Z[1] - s], [Z[0], Z[1] - s]], true)} fill={C.soft} stroke={C.ln} strokeWidth="1.5" />
        <Arrow from={Z} to={[Z[0] + s, Z[1]]} color={C.a} width={3} head={9} />
        <Arrow from={Z} to={[Z[0], Z[1] - s]} color={C.g} width={3} head={9} />
        <Turn c={[Z[0] + s / 2, Z[1] - s / 2]} ccw color={C.fg} />
        <Dot at={Z} color={C.fg} r={4} />
        <T x={Z[0] + s / 2} y={Z[1] + 20} size={14} weight={700} color={C.a}>h</T>
        <T x={Z[0] - 8} y={Z[1] - s / 2 + 5} anchor="end" size={14} weight={700} color={C.g}>ih</T>
        <T x={Z[0] - 6} y={Z[1] + 18} anchor="end" size={13}>z₀</T>
        <T x={90} y={70} size={14} color={C.mu}>{t('dekat z₀ = 1 + i', 'near z₀ = 1 + i')}</T>
        <Arrow from={[128, 170]} to={[214, 170]} color={C.v} width={2.5} />
      </At>
      <At from={2} until={2} frame={k}>
        <T x={171} y={158} size={15} weight={700} color={C.v}>× (2 + 2i)</T>
        <T x={171} y={192} size={13} color={C.v}>↺ 45°, × 2.83</T>
        <path d={pl([B, P1, top, P2], true)} fill={C.soft} stroke={C.ln} strokeWidth="1.5" />
        <Arrow from={B} to={P1} color={C.a} />
        <Arrow from={B} to={P2} color={C.g} />
        <Turn c={[B[0], B[1] + d45[1]]} ccw color={C.fg} r={14} />
        <Dot at={B} color={C.fg} r={4} />
        <T x={(B[0] + P1[0]) / 2 + 14} y={(B[1] + P1[1]) / 2 + 18} anchor="start" size={14} weight={700} color={C.a}>f′·h</T>
        <T x={(B[0] + P2[0]) / 2 - 14} y={(B[1] + P2[1]) / 2 + 18} anchor="end" size={14} weight={700} color={C.g}>f′·ih</T>
        <T x={B[0]} y={B[1] + 22} size={13}>f(z₀) = 2i</T>
        <T x={350} y={50} size={14} color={C.mu}>f(z) = z²</T>
      </At>
      <At from={3} frame={k}>
        <T x={171} y={158} size={15} weight={700} color={C.r}>z̄</T>
        <T x={171} y={192} size={13} color={C.r}>{t('cermin', 'mirror')}</T>
        <path d={pl([M, [M[0] + s, M[1]], [M[0] + s, M[1] + s], [M[0], M[1] + s]], true)} fill={C.r} fillOpacity=".12" stroke={C.ln} strokeWidth="1.5" />
        <Arrow from={M} to={[M[0] + s, M[1]]} color={C.a} width={3} head={9} />
        <Arrow from={M} to={[M[0], M[1] + s]} color={C.g} width={3} head={9} />
        <Turn c={[M[0] + s / 2, M[1] + s / 2]} ccw={false} color={C.r} />
        <Dot at={M} color={C.fg} r={4} />
        <T x={M[0] + s / 2} y={M[1] - 10} size={14} weight={700} color={C.a}>h</T>
        <T x={M[0] - 8} y={M[1] + s / 2 + 5} anchor="end" size={14} weight={700} color={C.g}>−ih</T>
        <T x={240} y={250} size={14}>z̄: h ↦ h, ih ↦ −ih</T>
        <T x={240} y={274} size={14} color={C.r} weight={600}>{t('arah putar berbalik: bukan perkalian', 'turning flips: not a multiplication')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- Cauchy-Riemann: two steps, one multiplier
const CZ: P = [80, 200], CW: P = [330, 200], st = 40
const cr: Story = {
  title: b('Cauchy-Riemann: dua langkah, satu pengali', 'Cauchy-Riemann: two steps, one multiplier'),
  frames: [
    f('Ambil f(z) = z² di z₀ = 1 + i, jadi u = x² − y² dan v = 2xy. Melangkah kecil ke kanan sejauh h: keluaran bergeser (uₓ + i vₓ)h = (2x + 2iy)h = (2 + 2i)h.', 'Take f(z) = z² at z₀ = 1 + i, so u = x² − y² and v = 2xy. Take a small step right by h: the output moves by (uₓ + i vₓ)h = (2x + 2iy)h = (2 + 2i)h.', String.raw`f(z_0+h)-f(z_0)\approx(u_x+iv_x)\,h=(2+2i)\,h`),
    f('Sekarang melangkah ke atas sejauh ih. Keluaran bergeser (u_y + i v_y)h = (−2y + 2ix)h = (−2 + 2i)h.', 'Now step up by ih. The output moves by (u_y + i v_y)h = (−2y + 2ix)h = (−2 + 2i)h.', String.raw`f(z_0+ih)-f(z_0)\approx(u_y+iv_y)\,h=(-2+2i)\,h`),
    f('Bandingkan: panah kedua tepat panah pertama diputar 90° dengan panjang sama, karena −2 + 2i = i(2 + 2i). Itu wajib jika f′ ada, sebab f′ · ih = i · (f′ · h). Samakan bagian real dan imajiner: uₓ = v_y dan u_y = −vₓ.', 'Compare: the second arrow is exactly the first one turned 90° with the same length, because −2 + 2i = i(2 + 2i). That is forced when f′ exists, since f′ · ih = i · (f′ · h). Match real and imaginary parts: uₓ = v_y and u_y = −vₓ.', String.raw`u_y+iv_y=i(u_x+iv_x)\iff u_x=v_y,\ \ u_y=-v_x`),
    f('Untuk z̄ = x − iy: langkah kanan h tetap h, tetapi langkah atas ih menjadi −ih, diputar −90° bukan +90°. uₓ = 1 tetapi v_y = −1, jadi CR gagal dan z̄ tidak punya turunan.', 'For z̄ = x − iy: the right step h stays h, but the up step ih becomes −ih, turned −90° instead of +90°. uₓ = 1 but v_y = −1, so CR fails and z̄ has no derivative.', String.raw`u=x,\ v=-y:\quad u_x=1\ne-1=v_y`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), L = st * 2 * Math.SQRT2, e1: P = [CW[0] + L * Math.SQRT1_2, CW[1] - L * Math.SQRT1_2], e2: P = [CW[0] - L * Math.SQRT1_2, CW[1] - L * Math.SQRT1_2]
    return <>
      <T x={CZ[0]} y={40} size={14} color={C.mu} weight={600}>{t('langkah masukan', 'input steps')}</T>
      <T x={CW[0]} y={40} size={14} color={C.mu} weight={600}>{t('langkah keluaran', 'output steps')}</T>
      <Arrow from={[140, 200]} to={[214, 200]} color={C.mu} width={2} />
      <At until={2} frame={k}><T x={177} y={190} size={14} weight={700} color={C.v}>f = z²</T></At>
      <At from={3} frame={k}><T x={177} y={190} size={14} weight={700} color={C.r}>f = z̄</T></At>
      <Arrow from={CZ} to={[CZ[0] + st, CZ[1]]} color={C.a} />
      <T x={CZ[0] + st / 2} y={CZ[1] + 20} size={15} weight={700} color={C.a}>h</T>
      <Dot at={CZ} color={C.fg} r={4} />
      <T x={CZ[0] - 8} y={CZ[1] + 20} anchor="end" size={13}>z₀</T>
      <Dot at={CW} color={C.fg} r={4} />
      <At from={1} frame={k}>
        <Arrow from={CZ} to={[CZ[0], CZ[1] - st]} color={C.g} />
        <T x={CZ[0] - 8} y={CZ[1] - st / 2 + 5} anchor="end" size={15} weight={700} color={C.g}>ih</T>
      </At>
      <At until={2} frame={k}>
        <Arrow from={CW} to={e1} color={C.a} />
        <T x={e1[0]} y={e1[1] - 10} size={14} weight={700} color={C.a}>(2 + 2i)h</T>
        <T x={CW[0]} y={240} size={14} color={C.a}>u<Sb>x</Sb> + i v<Sb>x</Sb> = 2 + 2i</T>
      </At>
      <At from={1} until={2} frame={k}>
        <Arrow from={CW} to={e2} color={C.g} />
        <T x={e2[0]} y={e2[1] - 10} size={14} weight={700} color={C.g}>(−2 + 2i)h</T>
        <T x={CW[0]} y={264} size={14} color={C.g}>u<Sb>y</Sb> + i v<Sb>y</Sb> = −2 + 2i</T>
      </At>
      <At from={2} until={2} frame={k}>
        <RightAngle at={CW} a={rad(45)} size={14} color={C.v} />
        <T x={16} y={84} anchor="start" size={15} weight={600} color={C.v}>−2 + 2i = i(2 + 2i)</T>
        <T x={16} y={108} anchor="start" size={13} color={C.mu}>{t('putar 90°, panjang sama', 'turned 90°, same length')}</T>
        <T x={16} y={140} anchor="start" size={16} weight={700} color={C.v}>u<Sb>x</Sb> = v<Sb>y</Sb>,  u<Sb>y</Sb> = −v<Sb>x</Sb></T>
      </At>
      <At from={3} frame={k}>
        <Arrow from={CW} to={[CW[0], CW[1] - st]} color={C.mu} width={2} dash="4 4" />
        <T x={CW[0] + 8} y={CW[1] - st + 4} anchor="start" size={13} color={C.mu}>{t('seharusnya (+90°)', 'needed (+90°)')}</T>
        <path d={arc(CW, 20, 0, rad(-90))} fill="none" stroke={C.r} strokeWidth="2" />
        <Arrow from={CW} to={[CW[0] + st, CW[1]]} color={C.a} />
        <Arrow from={CW} to={[CW[0], CW[1] + st]} color={C.g} />
        <T x={CW[0] + st + 8} y={CW[1] + 5} anchor="start" size={14} weight={700} color={C.a}>h</T>
        <T x={CW[0] - 8} y={CW[1] + st - 2} anchor="end" size={14} weight={700} color={C.g}>−ih</T>
        <T x={CW[0] + 30} y={CW[1] + 30} anchor="start" size={13} color={C.r} weight={600}>−90°</T>
        <T x={240} y={276} size={15} color={C.r} weight={600}>u<Sb>x</Sb> = 1 ≠ −1 = v<Sb>y</Sb>  ✗</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- harmonic: level curves of x² − y² and 2xy
const HO: P = [150, 150], hp = plane(HO, 50), HR = 2.7
const levelU = (c: number) => c > 0
  ? [1, -1].map(s => fn(y => hp(s * Math.sqrt(c + y * y), y), -HR, HR, 60))
  : [1, -1].map(s => fn(x => hp(x, s * Math.sqrt(-c + x * x)), -HR, HR, 60))
const levelV = (c: number) => { const m = Math.abs(c) / 2, lo = m / HR; return [1, -1].map(s => fn(x => c > 0 ? hp(s * x, s * m / x) : hp(-s * x, s * m / x), lo, HR, 60)) }
const harmonic: Story = {
  title: b('Fungsi harmonik: lengkungan yang seimbang', 'Harmonic functions: curvature in balance'),
  frames: [
    f('Bagian real dari z² adalah u = x² − y². Kurva levelnya hiperbola: ungu untuk u = 1, 2, 3 (kiri-kanan), merah untuk u = −1, −2, −3 (atas-bawah), dan dua diagonal putus-putus untuk u = 0.', 'The real part of z² is u = x² − y². Its level curves are hyperbolas: violet for u = 1, 2, 3 (left and right), red for u = −1, −2, −3 (top and bottom), and the two dashed diagonals for u = 0.', String.raw`u=\operatorname{Re}z^2=x^2-y^2`),
    f('Harmonik artinya lengkungan saling mengimbangi: uₓₓ = 2 (naik ke kiri-kanan) dan u_yy = −2 (turun ke atas-bawah), jumlahnya 0. Akibatnya rata-rata u pada lingkaran sama dengan nilai di pusat: + di kiri-kanan, − di atas-bawah, rata-ratanya 0 = u(0).', 'Harmonic means the curvatures cancel: uₓₓ = 2 (rising to the left and right) and u_yy = −2 (falling to the top and bottom), summing to 0. So the average of u on a circle equals its value at the center: + on the left and right, − on top and bottom, average 0 = u(0).', String.raw`u_{xx}+u_{yy}=2-2=0`),
    f('Konjugat harmoniknya v = 2xy, didapat dari CR: v_y = uₓ = 2x dan vₓ = −u_y = 2y. Kurva level v (hijau) juga hiperbola, diputar 45°.', 'Its harmonic conjugate is v = 2xy, found from CR: v_y = uₓ = 2x and vₓ = −u_y = 2y. The level curves of v (green) are hyperbolas too, turned by 45°.', String.raw`v_y=u_x=2x,\qquad v_x=-u_y=2y`),
    f('Kurva u dan kurva v selalu berpotongan tegak lurus. Contoh: u = 1 dan v = 1 bertemu di (1.099, 0.455) dengan sudut 90°. Bersama-sama mereka membentuk fungsi analitik u + iv = z².', 'The u-curves and v-curves always cross at right angles. Example: u = 1 and v = 1 meet at (1.099, 0.455) at 90°. Together they form the analytic function u + iv = z².', String.raw`u+iv=x^2-y^2+2ixy=(x+iy)^2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 296, faded = k >= 2 ? .3 : 1
    const cross = hp(Math.SQRT2 ** .5 * Math.cos(Math.PI / 8), Math.SQRT2 ** .5 * Math.sin(Math.PI / 8))
    return <>
      <Clip id="charm-box" x={HO[0] - HR * 50} y={HO[1] - HR * 50} w={HR * 100} h={HR * 100}>
        <Grid map={hp} x={[-HR, HR]} y={[-HR, HR]} />
        <g style={{ opacity: faded, transition: 'opacity .45s' }}>
          <path d={pl([hp(-HR, -HR), hp(HR, HR)]) + ' ' + pl([hp(-HR, HR), hp(HR, -HR)])} stroke={C.mu} strokeWidth="1.8" strokeDasharray="6 5" />
          {[1, 2, 3, -1, -2, -3].map(c => levelU(c).map((d, i) => <path key={`${c}${i}`} d={d} fill="none" stroke={c > 0 ? C.a : C.r} strokeWidth="2.5" />))}
        </g>
        <At from={2} frame={k}>{[1, 2, 3, -1, -2, -3].map(c => levelV(c).map((d, i) => <path key={`${c}${i}`} d={d} fill="none" stroke={C.g} strokeWidth="2.5" />))}</At>
        <At from={3} frame={k}>
          <path d={levelU(1)[0]} fill="none" stroke={C.a} strokeWidth="4.5" />
          <path d={levelV(1)[0]} fill="none" stroke={C.g} strokeWidth="4.5" />
        </At>
      </Clip>
      <rect x={HO[0] - HR * 50} y={HO[1] - HR * 50} width={HR * 100} height={HR * 100} fill="none" stroke={C.faint} />
      <At until={1} frame={k}>
        {[1, 2, 3].map(c => <T key={c} x={hp(Math.sqrt(c), 0)[0] - 3} y={HO[1] - 5} anchor="end" size={12} weight={700} color={C.a}>{c}</T>)}
        {[1, 2, 3].map(c => <T key={c} x={HO[0] + 7} y={hp(0, Math.sqrt(c))[1] + 13} anchor="start" size={12} weight={700} color={C.r}>−{c}</T>)}
      </At>
      <At until={0} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700}>u = x² − y²</T>
        <T x={X} y={92} anchor="start" size={15} color={C.a}>u = 1, 2, 3</T>
        <T x={X} y={116} anchor="start" size={15} color={C.r}>u = −1, −2, −3</T>
        <T x={X} y={140} anchor="start" size={15} color={C.mu}>{t('putus-putus: u = 0', 'dashed: u = 0')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        {[0, 1, 2, 3].map(q => <path key={q} d={arc(HO, 60, rad(q * 90 - 45), rad(q * 90 + 45))} fill="none" stroke={q % 2 ? C.r : C.a} strokeWidth="5" />)}
        <Dot at={HO} color={C.v} r={6} />
        <T x={X} y={60} anchor="start" size={16} weight={700}>u<Sb>xx</Sb> = 2</T>
        <T x={X} y={84} anchor="start" size={13} color={C.mu}>{t('naik ke kiri-kanan', 'rises left and right')}</T>
        <T x={X} y={114} anchor="start" size={16} weight={700}>u<Sb>yy</Sb> = −2</T>
        <T x={X} y={138} anchor="start" size={13} color={C.mu}>{t('turun ke atas-bawah', 'falls up and down')}</T>
        <T x={X} y={170} anchor="start" size={16} weight={700} color={C.v}>{t('jumlah = 0', 'sum = 0')}</T>
        <T x={X} y={206} anchor="start" size={13}>{t('rata-rata di lingkaran', 'average on the circle')}</T>
        <T x={X} y={228} anchor="start" size={15} weight={600} color={C.v}>= u(0) = 0</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.g}>v = 2xy</T>
        <T x={X} y={84} anchor="start" size={14} color={C.g}>v = ±1, ±2, ±3</T>
        <T x={X} y={120} anchor="start" size={15}>v<Sb>y</Sb> = u<Sb>x</Sb> = 2x ✓</T>
        <T x={X} y={146} anchor="start" size={15}>v<Sb>x</Sb> = −u<Sb>y</Sb> = 2y ✓</T>
      </At>
      <At from={3} frame={k}>
        <RightAngle at={cross} a={rad(-22.5)} size={11} color={C.fg} />
        <Dot at={cross} color={C.fg} r={4} />
        <T x={X} y={60} anchor="start" size={15} weight={700}><tspan fill={C.a}>u = 1</tspan> ⊥ <tspan fill={C.g}>v = 1</tspan></T>
        <T x={X} y={86} anchor="start" size={14}>{t('di', 'at')} (1.099, 0.455)</T>
        <T x={X} y={130} anchor="start" size={18} weight={700} color={C.v}>u + iv = z²</T>
        <T x={X} y={156} anchor="start" size={13} color={C.mu}>{t('analitik', 'analytic')}</T>
      </At>
    </>
  },
}

// ---------------------------------------------------------------- exponential: length e^x, angle y
const EZ: P = [110, 198], ez = plane(EZ, 24), EW: P = [345, 150], ew = plane(EW, 40)
const polarW = (r: number, a: number) => ew(r * Math.cos(a), r * Math.sin(a))
const expo: Story = {
  title: b('eᶻ: x mengatur panjang, y mengatur sudut', 'eᶻ: x sets the length, y sets the angle'),
  frames: [
    f('e^(x + iy) = eˣ · e^(iy): bagian real x mengatur panjang, bagian imajiner y mengatur sudut. Contoh z = 1 + iπ/3: panjang e¹ ≈ 2.72 dan sudut π/3 = 60°.', 'e^(x + iy) = eˣ · e^(iy): the real part x sets the length, the imaginary part y sets the angle. Example z = 1 + iπ/3: length e¹ ≈ 2.72 and angle π/3 = 60°.', String.raw`e^{1+i\pi/3}=e\cdot e^{i\pi/3}`),
    f('Garis tegak x = −1, 0, 1 (y bebas) menjadi lingkaran berjari-jari e⁻¹ ≈ 0.37, 1, dan e ≈ 2.72. Bergerak naik di garis itu berarti berputar di lingkaran.', 'The vertical lines x = −1, 0, 1 (y free) become circles of radius e⁻¹ ≈ 0.37, 1 and e ≈ 2.72. Moving up the line means going around the circle.', String.raw`|e^{x+iy}|=e^x`),
    f('Garis datar y = π/3 (x bebas) menjadi sinar bersudut 60°. Titik x = −1, 0, 1 jatuh di jarak e⁻¹, 1, e pada sinar itu. Makin ke kiri makin dekat ke 0, tetapi 0 sendiri tidak pernah dicapai.', 'The horizontal line y = π/3 (x free) becomes the ray at angle 60°. The points x = −1, 0, 1 land at distances e⁻¹, 1, e on that ray. Further left gets closer to 0, but 0 itself is never reached.', String.raw`\arg e^{x+iy}=y`),
    f('Pita −π < y ≤ π sudah menutup seluruh bidang w tepat satu kali. Naik 2π memberi keluaran yang sama, jadi eᶻ periodik dengan periode 2πi. Karena eˣ > 0, w = 0 tidak pernah dicapai.', 'The strip −π < y ≤ π already covers the whole w-plane exactly once. Moving up by 2π gives the same output, so eᶻ is periodic with period 2πi. Since eˣ > 0, w = 0 is never reached.', String.raw`e^{z+2\pi i}=e^z,\qquad e^z\ne0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), a = Math.PI / 3, z1 = ez(1, a), z2 = ez(1, a + 2 * Math.PI), w = polarW(Math.E, a), three = [C.y, C.a, C.g]
    return <>
      <Grid map={ez} x={[-2, 2]} y={[-3.6, 7.2]} />
      <Grid map={ew} x={[-3, 3]} y={[-3, 3.2]} />
      <T x={46} y={40} size={18} weight={700} color={C.mu}>z</T>
      <T x={452} y={40} size={18} weight={700} color={C.mu}>w</T>
      <At until={2} frame={k}>
        <Arrow from={[168, 150]} to={[218, 150]} color={C.v} width={2.5} />
        <T x={193} y={138} size={15} weight={700} color={C.v}>eᶻ</T>
      </At>
      <At until={0} frame={k}>
        <Arrow from={EZ} to={ez(1, 0)} color={C.a} width={2.5} head={8} />
        <Arrow from={ez(1, 0)} to={z1} color={C.g} width={2.5} head={8} />
        <Dot at={z1} color={C.fg} r={4.5} />
        <T x={z1[0] - 8} y={z1[1] - 8} anchor="end" size={14} weight={600}>1 + iπ/3</T>
        <Arrow from={EW} to={w} color={C.a} />
        <path d={arc(EW, 26, 0, a)} fill="none" stroke={C.g} strokeWidth="2.5" />
        <T x={EW[0] + 40} y={EW[1] - 14} size={13} weight={600} color={C.g}>60°</T>
        <T x={358} y={96} anchor="end" size={14} weight={600} color={C.a}>e ≈ 2.72</T>
        <Dot at={w} color={C.fg} r={4.5} />
        <T x={EW[0]} y={286} size={13}>|w| = e ≈ 2.72,  arg w = 60°</T>
      </At>
      <At from={1} until={2} frame={k}>
        {[-1, 0, 1].map((x, i) => <g key={x}>
          <path d={pl([ez(x, -3.6), ez(x, 7.2)])} stroke={three[i]} strokeWidth="2.5" />
          <circle cx={EW[0]} cy={EW[1]} r={40 * Math.exp(x)} fill="none" stroke={three[i]} strokeWidth="2.5" />
          <T x={ez(x, 0)[0] + 3} y={EZ[1] + 16} anchor="start" size={13} weight={700} color={three[i]}>{String(x).replace('-', '−')}</T>
          <T x={EW[0] - 5} y={EW[1] - 40 * Math.exp(x) - 4} anchor="end" size={13} weight={700} color={three[i]}>{['e⁻¹', '1', 'e'][i]}</T>
        </g>)}
      </At>
      <At from={1} until={1} frame={k}><T x={EW[0]} y={286} size={13}>x = c ↦ |w| = eᶜ</T></At>
      <At from={2} until={2} frame={k}>
        <path d={pl([ez(-2, a), ez(2, a)])} stroke={C.v} strokeWidth="3" />
        <path d={pl([EW, polarW(3.1, a)])} stroke={C.v} strokeWidth="3" />
        {[-1, 0, 1].map((x, i) => <g key={x}><Dot at={ez(x, a)} color={three[i]} r={4.5} /><Dot at={polarW(Math.exp(x), a)} color={three[i]} r={4.5} /></g>)}
        <circle cx={EW[0]} cy={EW[1]} r={4} fill={C.bg} stroke={C.r} strokeWidth="2" />
        <T x={EW[0]} y={286} size={13}>y = π/3 ↦ {t('sinar 60°', 'ray at 60°')}</T>
      </At>
      <At from={3} frame={k}>
        <rect x={ez(-2, 0)[0]} y={ez(0, Math.PI)[1]} width={4 * 24} height={2 * Math.PI * 24} fill={C.a} fillOpacity=".15" />
        <path d={pl([ez(-2, Math.PI), ez(2, Math.PI)])} stroke={C.a} strokeWidth="2" />
        <path d={pl([ez(-2, -Math.PI), ez(2, -Math.PI)])} stroke={C.a} strokeWidth="2" strokeDasharray="6 5" />
        <T x={ez(-2, 0)[0] - 4} y={ez(0, Math.PI)[1] + 5} anchor="end" size={13} color={C.a} weight={600}>π</T>
        <T x={ez(-2, 0)[0] - 4} y={ez(0, -Math.PI)[1] + 5} anchor="end" size={13} color={C.a} weight={600}>−π</T>
        <rect x={ew(-3, 0)[0]} y={ew(0, 3.2)[1]} width={6 * 40} height={6.2 * 40} fill={C.a} fillOpacity=".1" />
        <Arrow from={z1} to={[z2[0], z2[1] + 6]} color={C.mu} width={2} dash="5 4" />
        <T x={z1[0] + 6} y={100} anchor="start" size={13} weight={600} color={C.mu}>+2πi</T>
        <Arrow from={z1} to={[w[0] - 7, w[1] + 3]} color={C.v} width={2} dash="5 4" />
        <Arrow from={z2} to={[w[0] - 7, w[1] - 2]} color={C.v} width={2} dash="5 4" />
        <Dot at={z1} color={C.a} r={4.5} /><Dot at={z2} color={C.r} r={4.5} />
        <T x={z1[0] - 8} y={z1[1] + 5} anchor="end" size={13} weight={700} color={C.a}>z₁</T>
        <T x={z2[0] - 8} y={z2[1] + 5} anchor="end" size={13} weight={700} color={C.r}>z₂</T>
        <Dot at={w} color={C.v} r={5} />
        <T x={w[0] + 8} y={w[1] + 18} anchor="start" size={13} weight={600} color={C.v}>{t('sama', 'same')}</T>
        <circle cx={EW[0]} cy={EW[1]} r={5} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
        <T x={EW[0] + 10} y={EW[1] + 20} anchor="start" size={13} weight={600} color={C.r}>{t('0 tak tercapai', '0 never hit')}</T>
        <T x={EW[0]} y={286} size={13}>{t('pita −π < y ≤ π menutup w sekali', 'strip −π < y ≤ π covers w once')}</T>
      </At>
    </>
  },
}

export const COMPLEX_STORIES: Partial<Record<VisualKind, Story>> = { triangle: conjugate, polar, roots, disc, map: mapping, derivative, cr, harmonic, exp: expo }
