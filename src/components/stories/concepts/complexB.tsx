import type { ReactNode } from 'react'
import { At, Arrow, C, Clip, Dot, RightAngle, T, arc, b, f, fn, pl, plane, tr, type Lang, type P, type Story } from '../kit'

const PI = Math.PI
/** Fixed decimals with a real minus sign, and a decimal comma in Indonesian. */
const num = (lang: Lang, x: number, d = 2) => { const s = x.toFixed(d).replace('-', '−'); return lang === 'id' ? s.replace('.', ',') : s }
const mi = (n: number) => String(n).replace('-', '−')
const onC = (c: P, r: number, a: number): P => [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]
/** Arrowhead on a circle at math angle a, pointing counterclockwise (or clockwise). */
const Tip = ({ c, r, a, color, cw = false, span = .3 }: { c: P; r: number; a: number; color: string; cw?: boolean; span?: number }) =>
  <Arrow from={onC(c, r, cw ? a + span : a - span)} to={onC(c, r, a)} color={color} width={2.5} head={9} />
const Cross = ({ at, color, s = 7 }: { at: P; color: string; s?: number }) =>
  <path d={`M${at[0] - s},${at[1] - s} L${at[0] + s},${at[1] + s} M${at[0] - s},${at[1] + s} L${at[0] + s},${at[1] - s}`} stroke={color} strokeWidth="3" strokeLinecap="round" />
/** base with a raised exponent; the hair space after it brings the baseline back down. */
const Pw = ({ e, children }: { e: string; children?: ReactNode }) => <>{children}<tspan dy={-7} fontSize="0.72em">{e}</tspan><tspan dy={7}>{'\u200a'}</tspan></>
const sup = (n: number) => String(n).split('').map(ch => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(ch)]).join('')
/** Scientific notation for very large or small positive numbers. */
const sci = (lang: Lang, v: number) => { if (v >= .01 && v < 1e4) return num(lang, v, 2); const e = Math.floor(Math.log10(v)); return `${num(lang, v / 10 ** e, 1)} × 10${sup(e)}` }

type Z = [number, number]
const zdiv = (a: Z, w: Z): Z => { const d = w[0] ** 2 + w[1] ** 2; return [(a[0] * w[0] + a[1] * w[1]) / d, (a[1] * w[0] - a[0] * w[1]) / d] }
const zsin = ([x, y]: Z): Z => [Math.sin(x) * Math.cosh(y), Math.cos(x) * Math.sinh(y)]
const zmul = (a: Z, w: Z): Z => [a[0] * w[0] - a[1] * w[1], a[0] * w[1] + a[1] * w[0]]

// ================================================================ harmonic:0 constructing a conjugate
const HO: P = [130, 155], hp = plane(HO, 50), HL = 2.4
const vLevel = (c: number) => [fn(x => hp(x, c / (2 * x)), Math.abs(c) / 5, HL), fn(x => hp(-x, -c / (2 * x)), Math.abs(c) / 5, HL)]
const uLevel = (c: number) => c > 0
  ? [1, -1].map(s => fn(y => hp(s * Math.sqrt(c + y * y), y), -HL, HL, 60))
  : [1, -1].map(s => fn(x => hp(x, s * Math.sqrt(x * x - c)), -HL, HL, 60))
const harmonicConj: Story = {
  title: b('Membangun konjugat: integralkan, lalu periksa', 'Building a conjugate: integrate, then check'),
  frames: [
    f('Diberikan u = x² − y². CR pertama: vᵧ = uₓ = 2x. Pada setiap garis tegak, v naik dengan laju 2x: laju 2 di x = 1, laju −1 di x = −0,5. Integralkan terhadap y: v = 2xy + g(x), dengan g(x) belum diketahui.', 'Given u = x² − y². First CR: vᵧ = uₓ = 2x. On each vertical line, v rises at rate 2x: rate 2 at x = 1, rate −1 at x = −0.5. Integrate in y: v = 2xy + g(x), where g(x) is still unknown.', String.raw`v_y=u_x=2x\implies v=2xy+g(x)`),
    f('CR kedua mengunci g: vₓ = 2y + g′(x) harus sama dengan −uᵧ = 2y, jadi g′(x) = 0 dan g konstan. Hasilnya v = 2xy + C; kurva hijau adalah v = ±1, ±2. Dengan C = 0, u + iv = z².', 'The second CR pins down g: vₓ = 2y + g′(x) must equal −uᵧ = 2y, so g′(x) = 0 and g is constant. The result is v = 2xy + C; the green curves are v = ±1, ±2. With C = 0, u + iv = z².', String.raw`2y+g'(x)=-u_y=2y\implies v=2xy+C`),
    f('Konstruksi ini selalu berhasil lokal, tetapi globalnya perlu domain simply connected. Di anulus 1 < |z| < 2, u = ln|z| harmonik dan kandidat konjugatnya arg z. Satu putaran menambah 2π, jadi v kembali dengan nilai berbeda: tidak ada konjugat bernilai tunggal.', 'This construction always works locally, but globally it needs a simply connected domain. On the annulus 1 < |z| < 2, u = ln|z| is harmonic and its candidate conjugate is arg z. One turn adds 2π, so v comes back with a different value: there is no single-valued conjugate.', String.raw`u=\ln|z|,\quad v=\arg z,\quad\oint dv=2\pi\ne0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 268, AO: P = [130, 150]
    const rateArrows = [[1, C.a], [-.5, C.r], [1.8, C.a]] as const
    return <>
      <At until={1} frame={k}>
        <Clip id="hc0-box" x={HO[0] - 105} y={HO[1] - 105} w={210} h={210}>
          <path d={`M${HO[0] - 105},${HO[1]} H${HO[0] + 105} M${HO[0]},${HO[1] - 105} V${HO[1] + 105}`} stroke={C.ln} strokeWidth="1.2" />
          <g opacity=".35">{[1, 2, -1, -2].map(c => uLevel(c).map((d, i) => <path key={`${c}${i}`} d={d} fill="none" stroke={C.a} strokeWidth="2" />))}</g>
          <At from={1} frame={k}>{[1, 2, -1, -2].map(c => vLevel(c).map((d, i) => <path key={`${c}${i}`} d={d} fill="none" stroke={C.g} strokeWidth="2.5" />))}</At>
          <At until={0} frame={k}>
            {rateArrows.map(([x, col]) => <g key={x}>
              <path d={pl([hp(x, -2.1), hp(x, 2.1)])} stroke={col} strokeWidth="1.5" strokeDasharray="5 4" />
              <Arrow from={hp(x, x > 0 ? -.4 : .4)} to={hp(x, x > 0 ? -.4 + .45 * x : .4 + .45 * x)} color={col} width={3} head={8} />
            </g>)}
          </At>
        </Clip>
        <rect x={HO[0] - 105} y={HO[1] - 105} width={210} height={210} fill="none" stroke={C.faint} />
        <At until={0} frame={k}>
          <T x={hp(1, 0)[0]} y={HO[1] - 112} size={13} color={C.a}>2</T>
          <T x={hp(-.5, 0)[0]} y={HO[1] - 112} size={13} color={C.r}>−1</T>
          <T x={hp(1.8, 0)[0]} y={HO[1] - 112} size={13} color={C.a}>3,6</T>
          <T x={HO[0]} y={284} size={13} color={C.mu}>{t('panah: laju vᵧ = 2x di garis itu', 'arrows: rate vᵧ = 2x on that line')}</T>
          <T x={X} y={60} anchor="start" size={17} weight={700}>u = x² − y²</T>
          <T x={X} y={96} anchor="start" size={15}>vᵧ = uₓ = 2x</T>
          <T x={X} y={128} anchor="start" size={13} color={C.mu}>{t('integralkan terhadap y:', 'integrate in y:')}</T>
          <T x={X} y={154} anchor="start" size={16} weight={700} color={C.a}>v = 2xy + g(x)</T>
          <T x={X} y={190} anchor="start" size={13} color={C.r}>{t('g(x) belum diketahui', 'g(x) still unknown')}</T>
        </At>
        <At from={1} frame={k}>
          <T x={HO[0]} y={284} size={13} color={C.mu}>{t('ungu pudar: u, hijau: v', 'faint violet: u, green: v')}</T>
          <T x={X} y={60} anchor="start" size={15}>vₓ = 2y + g′(x)</T>
          <T x={X} y={88} anchor="start" size={15}>−uᵧ = 2y</T>
          <T x={X} y={122} anchor="start" size={15} color={C.r}>⇒ g′(x) = 0</T>
          <T x={X} y={160} anchor="start" size={17} weight={700} color={C.g}>v = 2xy + C</T>
          <T x={X} y={200} anchor="start" size={15} color={C.v} weight={600}>u + iv = z² + iC</T>
        </At>
      </At>
      <At from={2} frame={k}>
        <path d={`M${AO[0] - 110},${AO[1] - 110} h220 v220 h-220 Z M${AO[0] - 100},${AO[1]} a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0 Z`} fill="none" />
        <path d={`M${AO[0] - 100},${AO[1]} a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0 Z M${AO[0] - 50},${AO[1]} a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0 Z`} fill={C.soft} fillRule="evenodd" stroke={C.ln} strokeWidth="1.5" />
        {[60, 75, 90].map(r => <circle key={r} cx={AO[0]} cy={AO[1]} r={r} fill="none" stroke={C.a} strokeWidth="2" opacity=".6" />)}
        <circle cx={AO[0]} cy={AO[1]} r={68} fill="none" stroke={C.g} strokeWidth="3" />
        <Tip c={AO} r={68} a={PI / 2} color={C.g} /><Tip c={AO} r={68} a={-PI / 2} color={C.g} />
        <path d={`M${AO[0] + 50},${AO[1]} H${AO[0] + 100}`} stroke={C.r} strokeWidth="3.5" />
        <Dot at={onC(AO, 68, 0)} color={C.fg} r={5} />
        <T x={AO[0] + 106} y={AO[1] - 10} anchor="start" size={13} color={C.r}>{t('arg: 0 dan 2π', 'arg: 0 and 2π')}</T>
        <T x={AO[0]} y={AO[1] + 5} size={13} color={C.mu}>{t('lubang', 'hole')}</T>
        <T x={AO[0]} y={284} size={13} color={C.mu}>{t('ungu: u = ln|z| konstan', 'violet: u = ln|z| constant')}</T>
        <T x={X} y={60} anchor="start" size={15} weight={700}>1 &lt; |z| &lt; 2</T>
        <T x={X} y={90} anchor="start" size={15} color={C.a}>u = ln|z|</T>
        <T x={X} y={116} anchor="start" size={15} color={C.g}>v = arg z ?</T>
        <T x={X} y={152} anchor="start" size={13} color={C.mu}>{t('satu putaran hijau:', 'one green turn:')}</T>
        <T x={X} y={176} anchor="start" size={15} color={C.r}>v: 0 → 2π</T>
        <T x={X} y={212} anchor="start" size={13} color={C.r}>{t('tidak bernilai tunggal', 'not single-valued')}</T>
      </At>
    </>
  },
}

// ================================================================ harmonic:1 zero derivative implies constant
const blob = fn(t => [160 + 120 * Math.cos(t) + 10 * Math.cos(3 * t), 155 - 100 * Math.sin(t) + 8 * Math.sin(2 * t)], 0, 2 * PI, 120) + ' Z'
const zeroDeriv: Story = {
  title: b('f′ = 0 di domain terhubung: f tidak bisa berubah', 'f′ = 0 on a connected domain: f cannot change'),
  frames: [
    f('D adalah satu daerah terhubung dan f′(z) = 0 di setiap titik D. Hubungkan A dan B dengan lintasan patah-patah di dalam D. Pada setiap langkah kecil Δz, perubahan f kira-kira f′(z)·Δz = 0·Δz = 0.', 'D is one connected region and f′(z) = 0 at every point of D. Join A and B by a broken-line path inside D. Over each small step Δz, f changes by about f′(z)·Δz = 0·Δz = 0.', String.raw`\frac{d}{dt}f(\gamma(t))=f'(\gamma(t))\,\gamma'(t)=0`),
    f('Tidak ada perubahan di sepanjang lintasan, jadi nilai di A terbawa sampai B: jika f(A) = 2, maka f = 2 di setiap titik lintasan, juga di B. Setiap titik D dapat dicapai seperti ini, jadi f = 2 di seluruh D.', 'Nothing changes along the path, so the value at A is carried to B: if f(A) = 2, then f = 2 at every point of the path, B included. Every point of D can be reached this way, so f = 2 on all of D.', String.raw`f(B)-f(A)=\int_\gamma f'(z)\,dz=0`),
    f('Syarat terhubung penting. Di sini D adalah dua cakram terpisah. Ambil f = 2 di cakram kiri dan f = −1 di cakram kanan: f′ = 0 di mana-mana, tetapi f tidak konstan, karena tidak ada lintasan di dalam D yang menghubungkan keduanya.', 'Connectedness matters. Here D is two separate discs. Take f = 2 on the left disc and f = −1 on the right one: f′ = 0 everywhere, yet f is not constant, because no path inside D joins them.', String.raw`f'\equiv0,\quad f(z_1)=2\ne-1=f(z_2)`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 312, pts: P[] = [[80, 190], [125, 118], [195, 188], [245, 110]], L: P = [95, 150], R: P = [240, 150]
    return <>
      <At until={1} frame={k}>
        <path d={blob} fill={C.soft} fillOpacity=".6" stroke={C.a} strokeWidth="2.5" />
        <T x={92} y={84} size={16} weight={700} color={C.a}>D</T>
        {pts.slice(1).map((p, i) => <Arrow key={i} from={pts[i]} to={p} color={C.v} width={3} />)}
        {pts.map((p, i) => <Dot key={i} at={p} color={C.fg} r={i === 0 || i === 3 ? 6 : 4} />)}
        <T x={pts[0][0] - 10} y={pts[0][1] + 20} size={15} weight={700}>A</T>
        <T x={pts[3][0] + 8} y={pts[3][1] - 10} size={15} weight={700} anchor="start">B</T>
        <T x={X} y={60} anchor="start" size={15}>f′(z) = 0 {t('di', 'in')} D</T>
        <T x={X} y={96} anchor="start" size={13} color={C.mu}>{t('langkah kecil Δz:', 'small step Δz:')}</T>
        <T x={X} y={120} anchor="start" size={15} color={C.v}>Δf ≈ f′(z)·Δz = 0</T>
      </At>
      <At from={1} until={1} frame={k}>
        {pts.map((p, i) => <T key={i} x={p[0] + (i === 3 ? -14 : 12)} y={p[1] + (i === 3 ? 24 : i === 1 ? -8 : 6)} anchor={i === 3 ? 'end' : 'start'} size={14} weight={700} color={C.g}>f = 2</T>)}
        <T x={X} y={164} anchor="start" size={15}>f(A) = 2</T>
        <T x={X} y={190} anchor="start" size={15}>f(B) = 2</T>
        <T x={X} y={226} anchor="start" size={15} weight={700} color={C.g}>{t('f konstan di D', 'f constant on D')}</T>
      </At>
      <At from={2} frame={k}>
        <circle cx={L[0]} cy={L[1]} r={62} fill={C.soft} stroke={C.a} strokeWidth="2.5" />
        <circle cx={R[0]} cy={R[1]} r={62} fill={C.soft} stroke={C.g} strokeWidth="2.5" />
        <T x={L[0]} y={L[1] + 6} size={17} weight={700} color={C.a}>f = 2</T>
        <T x={R[0]} y={R[1] + 6} size={17} weight={700} color={C.g}>f = −1</T>
        <path d={`M${L[0] + 30},${L[1] + 40} Q${(L[0] + R[0]) / 2},${L[1] + 80} ${R[0] - 30},${R[1] + 40}`} fill="none" stroke={C.r} strokeWidth="2" strokeDasharray="6 5" />
        <Cross at={[(L[0] + R[0]) / 2, L[1] + 60]} color={C.r} />
        <T x={(L[0] + R[0]) / 2} y={250} size={13} color={C.r}>{t('keluar dari D', 'leaves D')}</T>
        <T x={X} y={70} anchor="start" size={15}>f′ = 0 {t('di kedua', 'on both')}</T>
        <T x={X} y={94} anchor="start" size={15}>{t('cakram', 'discs')}</T>
        <T x={X} y={132} anchor="start" size={15} color={C.r} weight={700}>2 ≠ −1</T>
        <T x={X} y={170} anchor="start" size={13} color={C.mu}>{t('D tidak terhubung', 'D is not connected')}</T>
        <T x={X} y={192} anchor="start" size={13} color={C.mu}>{t('konstanta per komponen', 'one constant per piece')}</T>
      </At>
    </>
  },
}

// ================================================================ exp:0 periodicity and no zeros
const EZo: P = [110, 152], ezp = plane(EZo, 17), EWo: P = [350, 150]
const expPeriod: Story = {
  title: b('eᶻ berulang setiap 2πi dan tidak pernah nol', 'eᶻ repeats every 2πi and is never zero'),
  frames: [
    f('Ambil z₀ = 0,5 + iπ/3 dan geser naik atau turun sejauh 2π. Ketiga masukan memberi panah keluaran yang sama: panjang e^0,5 ≈ 1,65 dan sudut 60°. Pergeseran 2π pada y adalah satu putaran penuh sudut.', 'Take z₀ = 0.5 + iπ/3 and shift it up or down by 2π. All three inputs give the same output arrow: length e^0.5 ≈ 1.65 and angle 60°. A shift of 2π in y is one full turn of the angle.', String.raw`e^{z+2\pi i}=e^z\,e^{2\pi i}=e^z\cdot1`),
    f('Calon nol yang menggoda: z = iπ. Sudutnya 180°, jadi e^(iπ) = −1. Hasilnya negatif, tetapi bukan nol, karena panjangnya tetap e⁰ = 1.', 'A tempting candidate for a zero: z = iπ. Its angle is 180°, so e^(iπ) = −1. The result is negative, but not zero, because its length is still e⁰ = 1.', String.raw`e^{i\pi}=\cos\pi+i\sin\pi=-1`),
    f('Panjang hanya bergantung pada x: |eᶻ| = eˣ. Geser x ke kiri. Garis tegak di x menjadi lingkaran berjari-jari eˣ. Pada x = −3 jari-jarinya e⁻³ ≈ 0,05: mengecil terus, tetapi tidak pernah 0. Jadi eᶻ tidak pernah nol.', 'The length depends only on x: |eᶻ| = eˣ. Move x to the left. The vertical line at x becomes a circle of radius eˣ. At x = −3 the radius is e⁻³ ≈ 0.05: it keeps shrinking, but never reaches 0. So eᶻ is never zero.', String.raw`|e^{x+iy}|=e^x>0`),
  ],
  control: { label: b('Bagian real x', 'Real part x'), min: -3, max: 1, step: .5, initial: -1 },
  controlFrom: 2,
  readout: x => String.raw`x=${x}:\quad|e^{z}|=e^{${x}}\approx${Math.exp(x).toFixed(3)}`,
  draw: (k, x, lang) => {
    const t = tr(lang), a = PI / 3, r0 = Math.exp(.5) * 40, tip = onC(EWo, r0, a)
    return <>
      <path d="M232,24 V282" stroke={C.faint} />
      <T x={30} y={30} size={16} weight={700} color={C.mu} anchor="start">z</T>
      <T x={452} y={30} size={16} weight={700} color={C.mu}>w = eᶻ</T>
      <path d={`M20,${EZo[1]} H215 M${EZo[0]},22 V282`} stroke={C.ln} strokeWidth="1.3" />
      {[1, -1].map(s => <g key={s}>
        <path d={pl([ezp(-5, s * PI), ezp(5, s * PI)])} stroke={C.faint} strokeDasharray="5 4" />
        <T x={22} y={ezp(0, s * PI)[1] - 4} size={12} color={C.mu} anchor="start">{s > 0 ? 'π' : '−π'}</T>
      </g>)}
      <path d={`M240,${EWo[1]} H466 M${EWo[0]},34 V266`} stroke={C.ln} strokeWidth="1.3" />
      <circle cx={EWo[0]} cy={EWo[1]} r={40} fill="none" stroke={C.ln} strokeDasharray="4 4" />
      <T x={EWo[0] + 44} y={EWo[1] + 16} size={12} color={C.mu} anchor="start">1</T>
      <At until={0} frame={k}>
        {[-1, 0, 1].map(j => { const p = ezp(.5, a + 2 * PI * j); return <g key={j}>
          <Dot at={p} color={j ? C.g : C.a} r={5} />
          <T x={p[0] + 10} y={p[1] + 5} size={13} anchor="start" weight={600} color={j ? C.g : C.a}>{j === 0 ? 'z₀' : j > 0 ? 'z₀ + 2πi' : 'z₀ − 2πi'}</T>
        </g> })}
        <Arrow from={[96, ezp(0, a)[1] - 4]} to={[96, ezp(0, a + 2 * PI)[1] + 6]} color={C.mu} width={1.8} head={7} />
        <T x={90} y={ezp(0, a + PI)[1] + 4} size={13} anchor="end" color={C.mu}>2π</T>
        <Arrow from={EWo} to={tip} color={C.a} width={3.5} />
        <path d={arc(EWo, 22, 0, a)} fill="none" stroke={C.g} strokeWidth="2" />
        <T x={EWo[0] + 34} y={EWo[1] - 8} size={12} color={C.g} anchor="start">60°</T>
        <T x={tip[0] + 8} y={tip[1] - 6} size={14} anchor="start" weight={600} color={C.a}>≈ 1,65</T>
        <T x={353} y={284} size={13}>{t('ketiganya → panah yang sama', 'all three → the same arrow')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <Dot at={ezp(0, PI)} color={C.r} r={5} />
        <T x={EZo[0] + 10} y={ezp(0, PI)[1] - 6} size={14} anchor="start" weight={600} color={C.r}>iπ</T>
        <Arrow from={EWo} to={[EWo[0] - 40, EWo[1]]} color={C.r} width={3.5} head={9} />
        <Dot at={[EWo[0] - 40, EWo[1]]} color={C.r} r={5} />
        <T x={EWo[0] - 44} y={EWo[1] - 12} size={14} weight={700} color={C.r}>−1</T>
        <circle cx={EWo[0]} cy={EWo[1]} r={4} fill={C.bg} stroke={C.fg} strokeWidth="2" />
        <T x={353} y={252} size={15} weight={700} color={C.r}>e^(iπ) = −1 ≠ 0</T>
        <T x={353} y={276} size={13} color={C.mu}>{t('panjang tetap 1', 'length still 1')}</T>
      </At>
      <At from={2} frame={k}>
        <path d={pl([ezp(x, -7.5), ezp(x, 7.5)])} stroke={C.a} strokeWidth="2.5" strokeDasharray="6 4" />
        <Dot at={ezp(x, a)} color={C.a} r={5} />
        <T x={ezp(x, 0)[0] + 6} y={EZo[1] + 18} size={13} anchor="start" weight={600} color={C.a}>x = {mi(x)}</T>
        <circle cx={EWo[0]} cy={EWo[1]} r={40 * Math.exp(x)} fill="none" stroke={C.a} strokeWidth="2.5" />
        <Dot at={onC(EWo, 40 * Math.exp(x), a)} color={C.a} r={4} />
        <circle cx={EWo[0]} cy={EWo[1]} r={2.5} fill={C.r} />
        <T x={EWo[0] - 10} y={EWo[1] + 22} size={13} anchor="end" color={C.r}>{t('0: tidak pernah', '0: never')}</T>
        <T x={353} y={272} size={15} weight={600} color={C.a}>|eᶻ| = {num(lang, Math.exp(x), 3)} &gt; 0</T>
      </At>
    </>
  },
}

// ================================================================ exp:1 addition law and derivative
const EAo: P = [70, 245], eap = plane(EAo, 60), EQo: P = [40, 160], eqp = plane(EQo, 120)
const expLaw: Story = {
  title: b('eᶻ⁺ʷ = eᶻeʷ dan (eᶻ)′ = eᶻ', 'eᶻ⁺ʷ = eᶻeʷ and (eᶻ)′ = eᶻ'),
  frames: [
    f('Penjumlahan masukan menjadi perkalian keluaran. z = 0,5 + iπ/6 memberi panjang 1,65 dan sudut 30°; w = 0,2 + iπ/3 memberi panjang 1,22 dan sudut 60°. Untuk z + w panjangnya dikalikan, 1,65 × 1,22 = 2,01, dan sudutnya dijumlahkan, 90°.', 'Adding inputs becomes multiplying outputs. z = 0.5 + iπ/6 gives length 1.65 and angle 30°; w = 0.2 + iπ/3 gives length 1.22 and angle 60°. For z + w the lengths multiply, 1.65 × 1.22 = 2.01, and the angles add, 90°.', String.raw`e^{z+w}=e^ze^w:\quad e^{0.5}e^{0.2}=e^{0.7}\approx2.01,\ 30^\circ+60^\circ=90^\circ`),
    f('Untuk turunan: e^(z+h) − eᶻ = eᶻ(eʰ − 1), jadi cukup lihat (eʰ − 1)/h. Titik-titik adalah nilainya untuk h dari 8 arah dengan |h| sama. Perkecil |h|: semua titik merapat ke 1, dari arah mana pun.', 'For the derivative: e^(z+h) − eᶻ = eᶻ(eʰ − 1), so it is enough to look at (eʰ − 1)/h. The dots are its values for h in 8 directions with the same |h|. Shrink |h|: every dot closes in on 1, from every direction.', String.raw`\frac{e^{z+h}-e^z}{h}=e^z\cdot\frac{e^h-1}{h},\quad\frac{e^h-1}{h}=1+\frac h2+\frac{h^2}{6}+\cdots`),
    f('Maka (eᶻ)′ = eᶻ · 1 = eᶻ di setiap titik. Masukan 0 dan 2πi memberi keluaran yang sama, 1, dan turunan yang sama, 1. Periodisitas tidak mengganggu turunan lokal, dan tidak ada cabang yang perlu dipilih.', 'So (eᶻ)′ = eᶻ · 1 = eᶻ at every point. Inputs 0 and 2πi give the same output, 1, and the same derivative, 1. Periodicity does not disturb the local derivative, and no branch has to be chosen.', String.raw`(e^z)'=e^z,\qquad(e^z)'\big|_{z=0}=(e^z)'\big|_{z=2\pi i}=1`),
  ],
  control: { label: b('Ukuran |h|', 'Size |h|'), min: .1, max: 1, step: .1, initial: .8 },
  controlFrom: 1,
  readout: v => { const h = Math.round(v * 10) / 10; return String.raw`h=${h}:\ \frac{e^h-1}{h}\approx${((Math.exp(h) - 1) / h).toFixed(3)},\quad h=-${h}:\ \approx${((1 - Math.exp(-h)) / h).toFixed(3)}` },
  draw: (k, v, lang) => {
    const t = tr(lang), X = 272, h = Math.round(v * 10) / 10
    const ez = eap(1.6487 * Math.cos(PI / 6), 1.6487 * Math.sin(PI / 6)), ew = eap(1.2214 * Math.cos(PI / 3), 1.2214 * Math.sin(PI / 3)), es = eap(0, 2.0138)
    const qs = Array.from({ length: 8 }, (_, j) => { const hz: Z = [h * Math.cos(j * PI / 4), h * Math.sin(j * PI / 4)], e = Math.exp(hz[0]); return zdiv([e * Math.cos(hz[1]) - 1, e * Math.sin(hz[1])], hz) })
    return <>
      <At until={0} frame={k}>
        <path d={`M30,${EAo[1]} H250 M${EAo[0]},282 V100`} stroke={C.ln} strokeWidth="1.3" />
        <path d={arc(EAo, 60, 0, PI / 2)} fill="none" stroke={C.ln} strokeDasharray="4 4" />
        <T x={EAo[0] + 60} y={EAo[1] + 18} size={12} color={C.mu}>1</T>
        <path d={arc(EAo, 26, 0, PI / 6)} fill="none" stroke={C.a} strokeWidth="2" />
        <path d={arc(EAo, 40, 0, PI / 3)} fill="none" stroke={C.g} strokeWidth="2" />
        <Arrow from={EAo} to={ez} color={C.a} width={3.5} />
        <Arrow from={EAo} to={ew} color={C.g} width={3.5} />
        <Arrow from={EAo} to={es} color={C.v} width={4} />
        <T x={ez[0] + 8} y={ez[1] + 4} size={15} anchor="start" weight={700} color={C.a}>eᶻ</T>
        <T x={ew[0] + 6} y={ew[1] - 8} size={15} anchor="start" weight={700} color={C.g}>eʷ</T>
        <T x={es[0] + 10} y={es[1] + 6} size={15} anchor="start" weight={700} color={C.v}>eᶻ⁺ʷ</T>
        <T x={X} y={52} anchor="start" size={14} color={C.a}>z = 0,5 + iπ/6</T>
        <T x={X} y={76} anchor="start" size={14} color={C.g}>w = 0,2 + iπ/3</T>
        <T x={X} y={116} anchor="start" size={13} color={C.mu}>{t('panjang dikalikan:', 'lengths multiply:')}</T>
        <T x={X} y={140} anchor="start" size={15}>{num(lang, 1.65)} × {num(lang, 1.22)} = {num(lang, 2.01)}</T>
        <T x={X} y={176} anchor="start" size={13} color={C.mu}>{t('sudut dijumlahkan:', 'angles add:')}</T>
        <T x={X} y={200} anchor="start" size={15}>30° + 60° = 90°</T>
        <T x={X} y={244} anchor="start" size={17} weight={700} color={C.v}>eᶻ⁺ʷ = eᶻ · eʷ</T>
      </At>
      <At from={1} frame={k}>
        <path d={`M20,${EQo[1]} H262 M${EQo[0]},40 V280`} stroke={C.ln} strokeWidth="1.3" />
        <T x={EQo[0] - 6} y={EQo[1] + 18} size={12} color={C.mu} anchor="end">0</T>
        <circle cx={eqp(1, 0)[0]} cy={EQo[1]} r={60 * h} fill="none" stroke={C.ln} strokeDasharray="4 4" />
        {qs.map((q, j) => <Dot key={j} at={eqp(q[0], q[1])} color={C.a} r={4.5} />)}
        <Dot at={eqp(1, 0)} color={C.g} r={6} />
        <T x={eqp(1, 0)[0]} y={EQo[1] + 92} size={15} weight={700} color={C.g}>1</T>
        <path d={`M${eqp(1, 0)[0]},${EQo[1] + 8} V${EQo[1] + 76}`} stroke={C.g} strokeWidth="1.2" strokeDasharray="3 3" />
        <T x={140} y={36} size={13} color={C.mu}>{t('nilai (eʰ − 1)/h', 'values of (eʰ − 1)/h')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X + 8} y={60} anchor="start" size={15}>|h| = {num(lang, h, 1)}</T>
        <T x={X + 8} y={92} anchor="start" size={13} color={C.mu}>{t('8 arah h', '8 directions of h')}</T>
        <T x={X + 8} y={124} anchor="start" size={14}>h = {num(lang, h, 1)}: {num(lang, (Math.exp(h) - 1) / h, 3)}</T>
        <T x={X + 8} y={150} anchor="start" size={14}>h = −{num(lang, h, 1)}: {num(lang, (1 - Math.exp(-h)) / h, 3)}</T>
        <T x={X + 8} y={190} anchor="start" size={15} weight={700} color={C.g}>{t('semua → 1', 'all → 1')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={X + 8} y={60} anchor="start" size={16} weight={700} color={C.v}>(eᶻ)′ = eᶻ · 1</T>
        <T x={X + 8} y={104} anchor="start" size={14}>z = 0: e⁰ = 1</T>
        <T x={X + 8} y={130} anchor="start" size={14}>z = 2πi: <Pw e="2πi">e</Pw> = 1</T>
        <T x={X + 8} y={170} anchor="start" size={14} color={C.g}>{t('turunan 1 di keduanya', 'derivative 1 at both')}</T>
        <T x={X + 8} y={206} anchor="start" size={13} color={C.mu}>{t('tanpa pilihan cabang', 'no branch choice')}</T>
      </At>
    </>
  },
}

// ================================================================ branch:0 complex powers and branch choice
const BO: P = [125, 152], BR = 90
const branchPow: Story = {
  title: b('i^c: berapa nilai yang muncul saat cabang k berubah?', 'i^c: how many values appear as the branch k changes?'),
  frames: [
    f('Pangkat kompleks memakai logaritma: i^c = e^(c log i), dengan log i = i(π/2 + 2πk). Mengganti cabang k mengalikan hasil dengan e^(2πikc). Untuk c = 2 faktor itu e^(4πik) = 1: geser k, titiknya tetap di −1.', 'A complex power uses a logarithm: i^c = e^(c log i), with log i = i(π/2 + 2πk). Changing the branch k multiplies the result by e^(2πikc). For c = 2 that factor is e^(4πik) = 1: move k and the point stays at −1.', String.raw`i^c=e^{c\log i}=e^{ic(\pi/2+2\pi k)},\quad c=2:\ i^2=-1`),
    f('Untuk c = 1/2 faktornya e^(iπk) = ±1. Geser k: titik melompat bolak-balik antara e^(iπ/4) dan −e^(iπ/4). Jadi i^(1/2) punya dua nilai.', 'For c = 1/2 the factor is e^(iπk) = ±1. Move k: the point jumps back and forth between e^(iπ/4) and −e^(iπ/4). So i^(1/2) has two values.', String.raw`i^{1/2}=e^{i(\pi/4+\pi k)}=\pm e^{i\pi/4}`),
    f('Untuk c = 1/3 faktornya e^(2πik/3): tiga nilai, di sudut 30°, 150° dan 270°. Pangkat bilangan bulat tidak bergantung pada cabang; pangkat pecahan bergantung.', 'For c = 1/3 the factor is e^(2πik/3): three values, at angles 30°, 150° and 270°. Integer powers do not depend on the branch; fractional powers do.', String.raw`i^{1/3}=e^{i(\pi/6+2\pi k/3)}`),
    f('Untuk c = −2i faktornya e^(4πk), bilangan real positif, jadi nilainya tidak pernah berulang: i^(−2i) = e^(π+4πk). Skala di gambar adalah ln dari nilainya. Nilai utama (k = 0) adalah e^π ≈ 23,14, tetapi itu hanya satu pilihan.', 'For c = −2i the factor is e^(4πk), a positive real number, so the values never repeat: i^(−2i) = e^(π+4πk). The scale in the picture is the ln of the value. The principal value (k = 0) is e^π ≈ 23.14, but it is only one choice.', String.raw`i^{-2i}=e^{-2i\cdot i(\pi/2+2\pi k)}=e^{\pi+4\pi k}`),
  ],
  control: { label: b('Bilangan cabang k', 'Branch integer k'), min: -3, max: 3, step: 1, initial: 0 },
  readout: k => String.raw`k=${k}:\quad\log i=i\left(\tfrac{\pi}{2}${k === 0 ? '' : (k > 0 ? '+' : '-') + Math.abs(2 * k) + '\\pi'}\right)`,
  draw: (fr, kv, lang) => {
    const t = tr(lang), k = Math.round(kv), X = 262
    const cs = [2, 1 / 2, 1 / 3], c = cs[Math.min(fr, 2)]
    const ang = (j: number) => c * (PI / 2 + 2 * PI * j)
    const distinct = [...new Set(Array.from({ length: 7 }, (_, j) => Math.round(((ang(j - 3) % (2 * PI)) + 2 * PI) % (2 * PI) * 1000) / 1000))]
    const cur = onC(BO, BR, ang(k)), cName = ['2', '1/2', '1/3'][Math.min(fr, 2)]
    const lx = (j: number) => 30 + (PI * (1 + 4 * j) + 36) * 420 / 78
    const ex = ['−11π', '−7π', '−3π', 'π', '5π', '9π', '13π'][k + 3]
    const cx = Math.min(400, Math.max(80, lx(k)))
    return <>
      <At until={2} frame={fr}>
        <path d={`M${BO[0] - 110},${BO[1]} H${BO[0] + 110} M${BO[0]},${BO[1] - 112} V${BO[1] + 112}`} stroke={C.ln} strokeWidth="1.3" />
        <circle cx={BO[0]} cy={BO[1]} r={BR} fill="none" stroke={C.ln} strokeDasharray="4 4" />
        <T x={BO[0] + BR + 6} y={BO[1] + 16} size={12} color={C.mu} anchor="start">1</T>
        {distinct.map(a => <Dot key={a} at={onC(BO, BR, a)} color={C.a} r={7} hollow />)}
        <Arrow from={BO} to={cur} color={C.v} width={3.5} />
        <Dot at={cur} color={C.v} r={6} />
        <T x={X} y={52} anchor="start" size={18} weight={700}>c = {cName}</T>
        <T x={X} y={84} anchor="start" size={14}>{t('faktor cabang', 'branch factor')}: <Pw e="2πikc">e</Pw></T>
        <T x={X} y={110} anchor="start" size={15} color={C.a}>{['= e^(4πik) = 1', '= e^(iπk) = ±1', '= e^(2πik/3)'][Math.min(fr, 2)]}</T>
        <T x={X} y={150} anchor="start" size={16} weight={700} color={C.a}>{[t('1 nilai: −1', '1 value: −1'), t('2 nilai', '2 values'), t('3 nilai', '3 values')][Math.min(fr, 2)]}</T>
        <T x={X} y={184} anchor="start" size={13} color={C.mu}>{t('lingkaran: semua nilai', 'rings: all values')}</T>
        <T x={X} y={206} anchor="start" size={13} color={C.v}>{t(`panah: cabang k = ${mi(k)}`, `arrow: branch k = ${mi(k)}`)}</T>
      </At>
      <At from={3} frame={fr}>
        <T x={240} y={50} size={14} color={C.mu}>{t('skala ln: ln(nilai) = π + 4πk', 'ln scale: ln(value) = π + 4πk')}</T>
        <path d="M24,160 H456" stroke={C.ln} strokeWidth="2" />
        {Array.from({ length: 7 }, (_, j) => <g key={j}>
          <path d={`M${lx(j - 3)},152 V168`} stroke={j - 3 === k ? C.v : C.ln} strokeWidth="2" />
          <T x={lx(j - 3)} y={188} size={12} color={j - 3 === k ? C.v : C.mu}>{mi(j - 3)}</T>
        </g>)}
        <T x={456} y={188} size={12} color={C.mu} anchor="end">k</T>
        <Dot at={[lx(k), 160]} color={C.v} r={7} />
        <T x={cx} y={128} size={16} weight={700} color={C.v}><Pw e={ex}>e</Pw> ≈ {sci(lang, Math.exp(PI * (1 + 4 * k)))}</T>
        <T x={240} y={240} size={14}>{t('setiap k: bilangan real positif berbeda', 'each k: a different positive real number')}</T>
        <T x={240} y={266} size={13} color={C.mu}>{t('k = 0 memberi nilai utama e^π ≈ 23,14', 'k = 0 gives the principal value e^π ≈ 23.14')}</T>
      </At>
    </>
  },
}

// ================================================================ branch:1 the principal Log product rule
const LO: P = [115, 152], LR = 80, RX = 300
const ry = (deg: number) => 193 - deg * 230 / 540
const logProduct: Story = {
  title: b('Log(z₁z₂) dan Log z₁ + Log z₂ dapat berbeda 2πi', 'Log(z₁z₂) and Log z₁ + Log z₂ can differ by 2πi'),
  frames: [
    f('Nilai utama Arg berada di (−180°, 180°]. Arg(−1) = 180° = π dan Arg(i) = 90° = π/2, keduanya di dalam rentang, ditandai pita di penggaris sudut.', 'The principal Arg lies in (−180°, 180°]. Arg(−1) = 180° = π and Arg(i) = 90° = π/2, both inside the range, shown as the band on the angle ruler.', String.raw`\operatorname{Log}(-1)=i\pi,\quad\operatorname{Log}i=i\tfrac{\pi}{2}`),
    f('Perkalian menjumlahkan sudut: 180° + 90° = 270°, dan memang (−1)·i = −i. Tetapi 270° keluar dari pita nilai utama.', 'Multiplication adds angles: 180° + 90° = 270°, and indeed (−1)·i = −i. But 270° leaves the principal band.', String.raw`\operatorname{Log}(-1)+\operatorname{Log}i=i\tfrac{3\pi}{2}`),
    f('Nilai utama untuk −i memakai −90°: arah yang sama, tetapi satu putaran lebih rendah. Jadi Log((−1)i) = −iπ/2, sedangkan Log(−1) + Log(i) = 3iπ/2. Selisihnya 2πi.', 'The principal value for −i uses −90°: the same direction, but one turn lower. So Log((−1)i) = −iπ/2, while Log(−1) + Log(i) = 3iπ/2. They differ by 2πi.', String.raw`\operatorname{Log}(-i)=-i\tfrac{\pi}{2}=i\tfrac{3\pi}{2}-2\pi i`),
    f('Untuk log bernilai banyak aturan ini benar sebagai himpunan: log(−i) memuat semua −90° + 360°k, termasuk 270°. Yang gagal hanya pilihan nilai utama, jadi periksa apakah jumlah sudutnya tetap di (−π, π].', 'For the multivalued log the rule holds as sets: log(−i) contains every −90° + 360°k, including 270°. Only the principal choice fails, so check whether the angle sum stays in (−π, π].', String.raw`\log(-i)=\{i(-\tfrac{\pi}{2}+2\pi k)\}\ni i\tfrac{3\pi}{2}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), mark = (deg: number, col: string, label: string, from: number, until = 99, hollow = false) =>
      <At from={from} until={until} frame={k}>
        <Dot at={[RX, ry(deg)]} color={col} r={6} hollow={hollow} />
        <T x={RX + 14} y={ry(deg) + 5} anchor="start" size={13} weight={600} color={col}>{label}</T>
      </At>
    return <>
      <path d={`M${LO[0] - 100},${LO[1]} H${LO[0] + 100} M${LO[0]},${LO[1] - 100} V${LO[1] + 100}`} stroke={C.ln} strokeWidth="1.3" />
      <circle cx={LO[0]} cy={LO[1]} r={LR} fill="none" stroke={C.ln} strokeDasharray="4 4" />
      <path d={arc(LO, 28, 0, PI)} fill="none" stroke={C.a} strokeWidth="2.5" />
      <path d={arc(LO, 42, 0, PI / 2)} fill="none" stroke={C.g} strokeWidth="2.5" />
      <Arrow from={LO} to={[LO[0] - LR, LO[1]]} color={C.a} width={3} />
      <Arrow from={LO} to={[LO[0], LO[1] - LR]} color={C.g} width={3} />
      <T x={LO[0] - LR - 4} y={LO[1] - 10} size={15} weight={700} color={C.a}>−1</T>
      <T x={LO[0] + 10} y={LO[1] - LR - 4} size={15} weight={700} color={C.g} anchor="start">i</T>
      <At from={1} frame={k}>
        <path d={arc(LO, 60, 0, 1.5 * PI)} fill="none" stroke={C.v} strokeWidth="3" />
        <Arrow from={onC(LO, 60, 1.5 * PI - .35)} to={onC(LO, 60, 1.5 * PI)} color={C.v} width={3} head={9} />
        <Dot at={[LO[0], LO[1] + LR]} color={C.v} r={6} />
        <T x={LO[0] + 12} y={LO[1] + LR + 18} size={15} weight={700} color={C.v} anchor="start">−i</T>
        <T x={LO[0] - 64} y={LO[1] + 52} size={13} weight={600} color={C.v}>270°</T>
      </At>
      <At from={2} frame={k}>
        <path d={arc(LO, 60, 0, -PI / 2)} fill="none" stroke={C.r} strokeWidth="3" />
        <Arrow from={onC(LO, 60, -PI / 2 + .35)} to={onC(LO, 60, -PI / 2)} color={C.r} width={3} head={9} />
        <T x={LO[0] + 58} y={LO[1] + 56} size={13} weight={600} color={C.r}>−90°</T>
      </At>

      <rect x={RX - 8} y={ry(180)} width={16} height={ry(-180) - ry(180)} fill={C.soft} stroke={C.a} strokeWidth="1" />
      <path d={`M${RX},${ry(360)} V${ry(-180)}`} stroke={C.ln} strokeWidth="2" />
      {[360, 180, 0, -180].map(d => <g key={d}>
        <path d={`M${RX - 5},${ry(d)} H${RX + 5}`} stroke={C.ln} strokeWidth="2" />
        <T x={RX - 12} y={ry(d) + 4} anchor="end" size={12} color={C.mu}>{mi(d)}°</T>
      </g>)}
      <T x={RX} y={22} size={12} color={C.mu}>{t('sudut', 'angle')}</T>
      {mark(180, C.a, 'Arg(−1) = 180°', 0, 0)}
      {mark(90, C.g, 'Arg(i) = 90°', 0, 0)}
      {mark(270, C.v, '180° + 90° = 270°', 1, 2)}
      <At from={1} until={1} frame={k}><T x={RX + 14} y={ry(270) + 24} anchor="start" size={12} color={C.r}>{t('di luar pita', 'outside the band')}</T></At>
      {mark(-90, C.r, 'Arg(−i) = −90°', 2, 2)}
      <At from={2} until={2} frame={k}>
        <Arrow from={[RX + 22, ry(270) + 16]} to={[RX + 22, ry(-90) - 14]} color={C.r} width={2} dash="5 4" head={8} />
        <T x={RX + 30} y={ry(90) + 5} anchor="start" size={13} weight={700} color={C.r}>−360° = −2π</T>
      </At>
      <At from={3} frame={k}>
        {mark(270, C.g, 'log(−i) ∋ 270°', 3, 99, true)}
        {mark(-90, C.g, 'Log(−i): −90°', 3, 99, true)}
        <T x={RX + 14} y={ry(90) + 5} anchor="start" size={13} color={C.mu}>−90° + 360°k</T>
      </At>
      <At from={2} frame={k}><T x={LO[0]} y={286} size={13}>Log(−i) = −iπ/2</T></At>
    </>
  },
}

// ================================================================ trig:0 zeros of sine and cosine
const TO: P = [240, 92], tp = plane(TO, 32), TWo: P = [385, 218]
const trigZeros: Story = {
  title: b('Nol sin z dan cos z hanya di sumbu real', 'The zeros of sin z and cos z lie only on the real axis'),
  frames: [
    f('sin z = 0 berarti e^(iz) = e^(−iz), yaitu e^(2iz) = 1. Tulis z = x + iy: e^(2iz) = e^(−2y)·e^(2ix). Panjangnya harus 1, jadi y = 0; sudutnya kelipatan 2π, jadi x = kπ. Titik ungu adalah nol sinus.', 'sin z = 0 means e^(iz) = e^(−iz), that is e^(2iz) = 1. Write z = x + iy: e^(2iz) = e^(−2y)·e^(2ix). Its length must be 1, so y = 0; its angle is a multiple of 2π, so x = kπ. The violet dots are the zeros of sine.', String.raw`\sin z=0\iff e^{2iz}=1\iff z=k\pi`),
    f('Mengapa harus y = 0? w = e^(2iz) mengirim garis mendatar setinggi y ke lingkaran berjari-jari e^(−2y). y = 0,5 memberi 0,37 dan y = −0,5 memberi 2,72. Hanya y = 0 yang mendarat di lingkaran satuan, tempat target 1 berada.', 'Why must y = 0? w = e^(2iz) sends the horizontal line at height y to the circle of radius e^(−2y). y = 0.5 gives 0.37 and y = −0.5 gives 2.72. Only y = 0 lands on the unit circle, where the target 1 lives.', String.raw`|e^{2i(x+iy)}|=e^{-2y}=1\iff y=0`),
    f('Kosinus sama: cos z = 0 berarti e^(2iz) = −1, jadi y = 0 dan 2x = π + 2πk. Nol kosinus (hijau) ada di π/2 + kπ, tepat di tengah antara nol sinus. Tidak ada nol di luar sumbu real.', 'Cosine works the same way: cos z = 0 means e^(2iz) = −1, so y = 0 and 2x = π + 2πk. The cosine zeros (green) sit at π/2 + kπ, exactly halfway between the sine zeros. There are no zeros off the real axis.', String.raw`\cos z=0\iff e^{2iz}=-1\iff z=\tfrac{\pi}{2}+k\pi`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 26
    return <>
      <path d={`M24,${TO[1]} H456 M${TO[0]},40 V146`} stroke={C.ln} strokeWidth="1.3" />
      <T x={30} y={34} size={13} color={C.mu} anchor="start">{t('bidang z', 'z-plane')}</T>
      {[-2, -1, 0, 1, 2].map(j => <g key={j}>
        <Dot at={tp(j * PI, 0)} color={C.a} r={6} />
        <T x={tp(j * PI, 0)[0]} y={TO[1] + 28} size={13} color={C.a}>{['−2π', '−π', '0', 'π', '2π'][j + 2]}</T>
      </g>)}
      <At from={1} until={1} frame={k}>
        <path d={pl([tp(-6.8, .5), tp(6.8, .5)])} stroke={C.g} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d={pl([tp(-6.8, -.5), tp(6.8, -.5)])} stroke={C.y} strokeWidth="2.5" strokeDasharray="6 4" />
        <path d={pl([tp(-6.8, 0), tp(6.8, 0)])} stroke={C.a} strokeWidth="2.5" />
        <T x={392} y={tp(0, .5)[1] - 5} size={12} color={C.g}>y = {num(lang, .5, 1)}</T>
        <T x={392} y={tp(0, -.5)[1] + 14} size={12} color={C.y}>y = −{num(lang, .5, 1)}</T>
        <path d={`M${TWo[0] - 68},${TWo[1]} H${TWo[0] + 68} M${TWo[0]},${TWo[1] - 66} V${TWo[1] + 66}`} stroke={C.ln} strokeWidth="1.2" />
        <circle cx={TWo[0]} cy={TWo[1]} r={22 * Math.exp(1)} fill="none" stroke={C.y} strokeWidth="2.5" />
        <circle cx={TWo[0]} cy={TWo[1]} r={22} fill="none" stroke={C.a} strokeWidth="3" />
        <circle cx={TWo[0]} cy={TWo[1]} r={22 * Math.exp(-1)} fill="none" stroke={C.g} strokeWidth="2.5" />
        <Dot at={[TWo[0] + 22, TWo[1]]} color={C.v} r={5} />
        <T x={TWo[0] + 28} y={TWo[1] - 8} size={13} anchor="start" weight={700} color={C.v}>1</T>
        <T x={TWo[0] + 70} y={TWo[1] - 66} size={13} anchor="end" color={C.mu}>w = e^(2iz)</T>
        <T x={X} y={180} anchor="start" size={14} color={C.g}>y = {num(lang, .5, 1)} → |w| = e⁻¹ ≈ {num(lang, Math.exp(-1))}</T>
        <T x={X} y={206} anchor="start" size={14} color={C.a}>y = 0 → |w| = 1</T>
        <T x={X} y={232} anchor="start" size={14} color={C.y}>y = −{num(lang, .5, 1)} → |w| = e ≈ {num(lang, Math.E)}</T>
        <T x={X} y={266} anchor="start" size={13} color={C.mu}>{t('target 1 hanya di y = 0', 'target 1 only at y = 0')}</T>
      </At>
      <At until={0} frame={k}>
        <T x={X} y={180} anchor="start" size={15}>sin z = 0 ⇔ e^(2iz) = 1</T>
        <T x={X} y={208} anchor="start" size={15}>e^(2iz) = e^(−2y) · e^(2ix)</T>
        <T x={X} y={240} anchor="start" size={15} color={C.a}>{t('panjang', 'length')}: e^(−2y) = 1 ⇒ y = 0</T>
        <T x={X} y={268} anchor="start" size={15} color={C.a}>{t('sudut', 'angle')}: 2x = 2πk ⇒ x = kπ</T>
      </At>
      <At from={2} frame={k}>
        {[-1.5, -.5, .5, 1.5].map(j => <g key={j}>
          <Dot at={tp(j * PI, 0)} color={C.g} r={6} />
          <T x={tp(j * PI, 0)[0]} y={TO[1] - 14} size={12} color={C.g}>{['−3π/2', '−π/2', 'π/2', '3π/2'][j + 1.5]}</T>
        </g>)}
        <T x={X} y={186} anchor="start" size={15}>cos z = 0 ⇔ e^(2iz) = −1</T>
        <T x={X} y={214} anchor="start" size={15}>y = 0,  2x = π + 2πk</T>
        <T x={X} y={244} anchor="start" size={15} weight={700} color={C.g}>x = π/2 + kπ</T>
        <T x={X} y={274} anchor="start" size={13} color={C.mu}>{t('ungu: nol sin, hijau: nol cos, bergantian', 'violet: sin zeros, green: cos zeros, alternating')}</T>
      </At>
    </>
  },
}

// ================================================================ trig:1 sine magnitude off the real axis
const SO: P = [60, 262], SU = 46, sp = plane(SO, SU)
const sineMag: Story = {
  title: b('|sin z| sebagai sisi miring: sin x dan sinh y', '|sin z| as a hypotenuse: sin x and sinh y'),
  frames: [
    f('Mulai di sumbu imajiner, x = 0: sin(iy) = i sinh y, panah lurus ke atas. Geser y. Pada y = 1 tingginya sudah sinh 1 ≈ 1,18, lebih dari 1, dan pada y = 2 sekitar 3,63.', 'Start on the imaginary axis, x = 0: sin(iy) = i sinh y, an arrow pointing straight up. Move y. At y = 1 its height is already sinh 1 ≈ 1.18, more than 1, and at y = 2 about 3.63.', String.raw`\sin(iy)=\frac{e^{-y}-e^{y}}{2i}=i\sinh y`),
    f('Untuk x = π/3 panahnya punya dua komponen: real sin x cosh y (kuning) dan imajiner cos x sinh y (hijau). Keduanya tumbuh bersama y.', 'For x = π/3 the arrow has two components: real part sin x cosh y (amber) and imaginary part cos x sinh y (green). Both grow with y.', String.raw`\sin(x+iy)=\sin x\cosh y+i\cos x\sinh y`),
    f('Kuadratkan dan jumlahkan, lalu pakai cosh²y = 1 + sinh²y: |sin z|² = sin²x + sinh²y. Jadi |sin z| adalah sisi miring segitiga siku-siku bersisi sin x dan sinh y (pink). Busur putus-putus menunjukkan panjangnya sama. Batas 1 hanya berlaku bila y = 0.', 'Square and add, then use cosh²y = 1 + sinh²y: |sin z|² = sin²x + sinh²y. So |sin z| is the hypotenuse of a right triangle with legs sin x and sinh y (pink). The dashed arc shows the lengths agree. The bound 1 only holds when y = 0.', String.raw`|\sin z|^2=\sin^2x\cosh^2y+\cos^2x\sinh^2y=\sin^2x+\sinh^2y`),
  ],
  control: { label: b('Bagian imajiner y', 'Imaginary part y'), min: 0, max: 2, step: .25, initial: 1 },
  readout: y => String.raw`y=${y}:\quad\sinh y\approx${Math.sinh(y).toFixed(3)},\quad\cosh y\approx${Math.cosh(y).toFixed(3)}`,
  draw: (k, y, lang) => {
    const t = tr(lang), X = 262, sx = Math.sin(PI / 3), cx = Math.cos(PI / 3), sh = Math.sinh(y), ch = Math.cosh(y)
    const re = sx * ch, im = cx * sh, mod = Math.hypot(re, im), up = sp(0, sh), w = sp(re, im), tri = sp(sx, sh)
    return <>
      <path d={`M14,${SO[1]} H244 M${SO[0]},30 V282`} stroke={C.ln} strokeWidth="1.3" />
      <path d={arc(SO, SU, 0, PI)} fill="none" stroke={C.ln} strokeDasharray="4 4" />
      <path d={`M${SO[0]},${SO[1] - SU} H244`} stroke={C.faint} strokeDasharray="4 4" />
      <T x={SO[0] - 6} y={SO[1] - SU + 4} anchor="end" size={12} color={C.mu}>1</T>
      <T x={240} y={30} anchor="end" size={13} color={C.mu}>{t('bidang w = sin z', 'w-plane: w = sin z')}</T>
      <At until={0} frame={k}>
        <Arrow from={SO} to={up} color={C.a} width={3.5} />
        <T x={up[0] + 10} y={up[1] + 5} anchor="start" size={14} weight={600} color={C.a}>i sinh y</T>
        <T x={X} y={56} anchor="start" size={17} weight={700}>x = 0</T>
        <T x={X} y={88} anchor="start" size={15}>sin(iy) = i sinh y</T>
        <T x={X} y={124} anchor="start" size={15} color={C.a}>sinh {num(lang, y)} ≈ {num(lang, sh)}</T>
        <T x={X} y={152} anchor="start" size={15} weight={700} color={sh > 1 ? C.r : C.g}>{sh > 1 ? t('lebih dari 1', 'more than 1') : '≤ 1'}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <path d={pl([SO, sp(re, 0)])} stroke={C.y} strokeWidth="3" strokeDasharray="6 4" />
        <path d={pl([sp(re, 0), w])} stroke={C.g} strokeWidth="3" strokeDasharray="6 4" />
        <T x={X} y={56} anchor="start" size={17} weight={700}>x = π/3</T>
        <T x={X} y={92} anchor="start" size={14} color={C.y}>Re = sin x cosh y</T>
        <T x={X + 16} y={114} anchor="start" size={14} color={C.y}>≈ {num(lang, sx)} · {num(lang, ch)} = {num(lang, re)}</T>
        <T x={X} y={146} anchor="start" size={14} color={C.g}>Im = cos x sinh y</T>
        <T x={X + 16} y={168} anchor="start" size={14} color={C.g}>≈ {num(lang, cx)} · {num(lang, sh)} = {num(lang, im)}</T>
      </At>
      <At from={1} frame={k}>
        <Arrow from={SO} to={w} color={C.a} width={3.5} />
        <Dot at={w} color={C.a} r={4} />
        <T x={X} y={206} anchor="start" size={16} weight={700} color={C.a}>|sin z| ≈ {num(lang, mod)}</T>
      </At>
      <At from={2} frame={k}>
        <path d={pl([SO, sp(sx, 0), tri], true)} fill={C.v} fillOpacity=".12" stroke={C.v} strokeWidth="3" strokeLinejoin="round" />
        <RightAngle at={sp(sx, 0)} a={PI / 2} size={8} color={C.v} />
        {Math.abs(Math.atan2(sh, sx) - Math.atan2(im, re)) > .05 && <path d={arc(SO, mod * SU, Math.atan2(im, re), Math.atan2(sh, sx))} fill="none" stroke={C.fg} strokeWidth="1.5" strokeDasharray="4 4" />}
        <T x={X} y={56} anchor="start" size={14} weight={700}>|sin z|² = sin²x + sinh²y</T>
        <T x={X} y={88} anchor="start" size={14}>= {num(lang, sx * sx)} + {num(lang, sh * sh)} = {num(lang, sx * sx + sh * sh)}</T>
        <T x={X} y={120} anchor="start" size={13} color={C.v}>{t('segitiga pink:', 'pink triangle:')}</T>
        <T x={X} y={142} anchor="start" size={13} color={C.v}>{t(`sisi ${num(lang, sx)} dan ${num(lang, sh)}`, `legs ${num(lang, sx)} and ${num(lang, sh)}`)}</T>
        <T x={X} y={240} anchor="start" size={13} color={C.mu}>{t('busur: panjang sama', 'arc: equal lengths')}</T>
      </At>
    </>
  },
}

// ================================================================ integral:0 the ML estimate
const MO: P = [130, 222], MU = 38
const mlBound: Story = {
  title: b('Taksiran ML: lintasan memanjang, f mengecil', 'The ML estimate: longer path, smaller f'),
  frames: [
    f('Lintasan: setengah lingkaran atas berjari-jari R, dari R ke −R. Panjangnya L = πR. Geser R: lintasan memanjang sebanding dengan R.', 'The path: the upper semicircle of radius R, from R to −R. Its length is L = πR. Move R: the path grows in proportion to R.', String.raw`L=\int_C|dz|=\pi R`),
    f('M membatasi |f| di seluruh lintasan. Untuk f = 1/z, |f| = 1/R di setiap titik busur, jadi M = 1/R. Garis kuning menunjukkan |f|: makin besar R, makin pendek.', 'M bounds |f| along the whole path. For f = 1/z, |f| = 1/R at every point of the arc, so M = 1/R. The amber ticks show |f|: the larger R, the shorter they are.', String.raw`M=\max_C|f|=\frac1R`),
    f('Taksiran ML: |∫f dz| ≤ M·L. Persegi panjang bersisi L dan M berubah bentuk saat R digeser, tetapi luasnya tetap π. Di sini integral sebenarnya iπ, jadi batas itu tercapai.', 'The ML estimate: |∫f dz| ≤ M·L. The rectangle with sides L and M changes shape as R moves, but its area stays π. Here the actual integral is iπ, so the bound is attained.', String.raw`\left|\int_C\frac{dz}{z}\right|=|i\pi|\le ML=\frac1R\cdot\pi R=\pi`),
    f('ML hanya batas atas. Untuk f = 1/z² pada busur yang sama: M = 1/R², jadi ML = π/R, sedangkan integral sebenarnya 2/R. Karena 2 < π, batasnya tidak tercapai.', 'ML is only an upper bound. For f = 1/z² on the same arc: M = 1/R², so ML = π/R, while the actual integral is 2/R. Since 2 < π, the bound is not attained.', String.raw`\left|\int_C\frac{dz}{z^2}\right|=\left|\Big[-\frac1z\Big]_R^{-R}\right|=\frac2R<\frac{\pi}{R}=ML`),
  ],
  control: { label: b('Jari-jari R', 'Radius R'), min: .5, max: 2.5, step: .25, initial: 1.5 },
  readout: R => String.raw`R=${R}:\quad L=\pi R\approx${(PI * R).toFixed(2)},\quad M=\tfrac1R\approx${(1 / R).toFixed(2)}`,
  draw: (k, R, lang) => {
    const t = tr(lang), X = 262, r = R * MU, sq = k === 3
    const tick = sq ? 12 / (R * R) : 24 / R
    const W = PI * R * 22, H = 22 / R
    return <>
      <path d={`M20,${MO[1]} H245 M${MO[0]},${MO[1] + 30} V30`} stroke={C.ln} strokeWidth="1.3" />
      <path d={arc(MO, r, 0, PI)} fill="none" stroke={C.a} strokeWidth="3.5" />
      <Tip c={MO} r={r} a={PI / 2} color={C.a} />
      <Dot at={[MO[0] + r, MO[1]]} color={C.fg} r={4} /><Dot at={[MO[0] - r, MO[1]]} color={C.fg} r={4} />
      <T x={MO[0] + r} y={MO[1] + 20} size={13}>R</T>
      <T x={MO[0] - r} y={MO[1] + 20} size={13}>−R</T>
      <T x={MO[0] + 8} y={MO[1] + 20} size={12} color={C.mu} anchor="start">0</T>
      <At from={1} frame={k}>
        {Array.from({ length: 7 }, (_, j) => { const a = (j + 1) * PI / 8; return <path key={j} d={pl([onC(MO, r + 3, a), onC(MO, r + 3 + tick, a)])} stroke={C.y} strokeWidth="3" strokeLinecap="round" /> })}
      </At>
      <At until={1} frame={k}>
        <T x={X} y={56} anchor="start" size={17} weight={700}>f(z) = 1/z</T>
        <T x={X} y={90} anchor="start" size={15}>R = {num(lang, R)}</T>
        <T x={X} y={120} anchor="start" size={15} color={C.a}>L = πR ≈ {num(lang, PI * R)}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={160} anchor="start" size={15} color={C.y}>|f| = 1/|z| = 1/R</T>
        <T x={X} y={188} anchor="start" size={15} color={C.y} weight={700}>M = {num(lang, 1 / R)}</T>
        <T x={X} y={224} anchor="start" size={13} color={C.mu}>{t('busur besar, f kecil', 'big arc, small f')}</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={X} y={56} anchor="start" size={16} weight={700} color={C.v}>M·L = (1/R)(πR) = π</T>
        <T x={X} y={82} anchor="start" size={13} color={C.mu}>{t('untuk setiap R', 'for every R')}</T>
        <T x={X} y={114} anchor="start" size={15}>|∫ dz/z| = |iπ| = π</T>
        <T x={X} y={138} anchor="start" size={13} color={C.g}>{t('batas tercapai', 'bound attained')}</T>
        <rect x={X} y={258 - H} width={W} height={H} fill={C.v} fillOpacity=".25" stroke={C.v} strokeWidth="2" />
        <T x={X + W / 2} y={276} size={13} color={C.a}>L ≈ {num(lang, PI * R)}</T>
        <T x={X} y={250 - H} anchor="start" size={13} color={C.y}>M ≈ {num(lang, 1 / R)}</T>
        <T x={X + 4} y={176} anchor="start" size={13} color={C.v}>{t('luas = π', 'area = π')}</T>
      </At>
      <At from={3} frame={k}>
        <T x={X} y={56} anchor="start" size={17} weight={700}>f(z) = 1/z²</T>
        <T x={X} y={88} anchor="start" size={14}>M = 1/R², L = πR</T>
        <T x={X} y={118} anchor="start" size={15} color={C.y}>ML = π/R ≈ {num(lang, PI / R)}</T>
        <T x={X} y={148} anchor="start" size={15} color={C.g} weight={700}>|∫| = 2/R ≈ {num(lang, 2 / R)}</T>
        <T x={X} y={184} anchor="start" size={13} color={C.mu}>{t('ML hanya batas atas', 'ML is only an upper bound')}</T>
      </At>
    </>
  },
}

// ================================================================ integral:1 parameterization and orientation
const OO: P = [135, 205], OR = 100
const tangentAt = (a: number, r: number, cw: boolean, len = 15): [P, P] => {
  const p = onC(OO, r, a), d: P = cw ? [Math.sin(a), Math.cos(a)] : [-Math.sin(a), -Math.cos(a)]
  return [[p[0] - d[0] * len, p[1] - d[1] * len], [p[0] + d[0] * len, p[1] + d[1] * len]]
}
const orientation: Story = {
  title: b('Arah lintasan menentukan tanda integral', 'The path direction decides the sign of the integral'),
  frames: [
    f('Parametrisasi z(t) = 2eⁱᵗ, t dari 0 ke π, berjalan berlawanan jarum jam dari 2 ke −2. dz = 2ieⁱᵗ dt adalah panah kecil yang menyinggung lintasan (hijau). Untuk f = 1/z: f dz = i dt, jadi integralnya iπ.', 'The parameterization z(t) = 2eⁱᵗ, t from 0 to π, runs counterclockwise from 2 to −2. dz = 2ieⁱᵗ dt is a small arrow tangent to the path (green). For f = 1/z: f dz = i dt, so the integral is iπ.', String.raw`\int_C\frac{dz}{z}=\int_0^\pi\frac{2ie^{it}}{2e^{it}}\,dt=i\pi`),
    f('Jalani busur yang sama dari −2 ke 2: z̃(s) = 2e^(i(π−s)). Setiap dz menunjuk ke arah sebaliknya (merah), jadi f dz = −i ds dan integralnya −iπ.', 'Walk the same arc from −2 to 2: z̃(s) = 2e^(i(π−s)). Every dz points the opposite way (red), so f dz = −i ds and the integral is −iπ.', String.raw`\int_{-C}\frac{dz}{z}=\int_0^\pi(-i)\,ds=-i\pi`),
    f('Membalik arah membalik tanda: +iπ menjadi −iπ. Taksiran ML tidak berubah, karena M = ½ dan L = 2π tidak bergantung arah: |±iπ| ≤ π. Jadi selalu sebutkan titik awal, titik akhir, dan interval parameter.', 'Reversing the direction flips the sign: +iπ becomes −iπ. The ML estimate does not change, because M = ½ and L = 2π do not depend on direction: |±iπ| ≤ π. So always state the start point, end point and parameter interval.', String.raw`\int_{-C}f\,dz=-\int_Cf\,dz,\qquad ML=\tfrac12\cdot2\pi=\pi`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 262, RA: P = [330, 155]
    const arrows = (cw: boolean, r: number, col: string) => [PI / 6, PI / 2, 5 * PI / 6].map(a => { const [p, q] = tangentAt(a, r, cw); return <Arrow key={a} from={p} to={q} color={col} width={3} head={8} /> })
    return <>
      <path d={`M20,${OO[1]} H250 M${OO[0]},${OO[1] + 40} V70`} stroke={C.ln} strokeWidth="1.3" />
      <path d={arc(OO, OR, 0, PI)} fill="none" stroke={C.a} strokeWidth="3.5" />
      <Dot at={[OO[0] + OR, OO[1]]} color={C.fg} r={4} /><Dot at={[OO[0] - OR, OO[1]]} color={C.fg} r={4} />
      <T x={OO[0] + OR} y={OO[1] + 22} size={14}>2</T>
      <T x={OO[0] - OR} y={OO[1] + 22} size={14}>−2</T>
      <At until={0} frame={k}>
        <T x={OO[0] + OR} y={OO[1] + 42} size={13} color={C.g}>t = 0</T>
        <T x={OO[0] - OR} y={OO[1] + 42} size={13} color={C.g}>t = π</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={OO[0] - OR} y={OO[1] + 42} size={13} color={C.r}>s = 0</T>
        <T x={OO[0] + OR} y={OO[1] + 42} size={13} color={C.r}>s = π</T>
      </At>
      <At until={0} frame={k}>{arrows(false, OR + 14, C.g)}</At>
      <At from={2} frame={k}>{arrows(false, OR + 14, C.g)}</At>
      <At from={1} frame={k}>{arrows(true, OR - 14, C.r)}</At>
      <At until={0} frame={k}>
        <T x={X} y={56} anchor="start" size={15}>z(t) = 2eⁱᵗ, t: 0 → π</T>
        <T x={X} y={86} anchor="start" size={15} color={C.g}>dz = 2i eⁱᵗ dt</T>
        <T x={X} y={116} anchor="start" size={15}>f dz = i dt</T>
        <T x={X} y={160} anchor="start" size={22} weight={700} color={C.a}>∫ = iπ</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={56} anchor="start" size={15}>z̃(s) = 2e^(i(π − s))</T>
        <T x={X} y={86} anchor="start" size={15} color={C.r}>dz̃ = −2i e^(i(π − s)) ds</T>
        <T x={X} y={116} anchor="start" size={15}>f dz̃ = −i ds</T>
        <T x={X} y={160} anchor="start" size={22} weight={700} color={C.r}>∫ = −iπ</T>
      </At>
      <At from={2} frame={k}>
        <path d={`M${RA[0] - 30},${RA[1]} H${RA[0] + 30} M${RA[0]},${RA[1] - 70} V${RA[1] + 70}`} stroke={C.ln} strokeWidth="1.3" />
        <Arrow from={RA} to={[RA[0], RA[1] - 50]} color={C.g} width={3.5} />
        <Arrow from={RA} to={[RA[0], RA[1] + 50]} color={C.r} width={3.5} />
        <T x={RA[0] + 10} y={RA[1] - 44} anchor="start" size={15} weight={700} color={C.g}>+iπ</T>
        <T x={RA[0] + 10} y={RA[1] + 56} anchor="start" size={15} weight={700} color={C.r}>−iπ</T>
        <T x={392} y={70} anchor="start" size={14}>|±iπ| = π</T>
        <T x={392} y={120} anchor="start" size={14}>M = ½</T>
        <T x={392} y={144} anchor="start" size={14}>L = 2π</T>
        <T x={392} y={176} anchor="start" size={15} weight={700} color={C.v}>ML = π</T>
        <T x={350} y={270} size={13} color={C.mu}>{t('ML tidak melihat arah', 'ML does not see direction')}</T>
      </At>
    </>
  },
}

// ================================================================ integral:2 only the −1 power survives
const PO: P = [100, 150], PR = 78, PS: P = [385, 250], PL = 2 * PI / 12 * 36
const powerCircle: Story = {
  title: b('∮ zⁿ dz: potongan berputar dan saling hapus', '∮ zⁿ dz: the pieces turn and cancel'),
  frames: [
    f('Pada lingkaran z = Reⁱᵗ: zⁿ dz = iRⁿ⁺¹e^(i(n+1)t) dt. Setiap panah menunjukkan arah satu potongan kecil. Untuk n = 1, arahnya berputar dua kali saat t mengelilingi lingkaran sekali.', 'On the circle z = Reⁱᵗ: zⁿ dz = iRⁿ⁺¹e^(i(n+1)t) dt. Each arrow shows the direction of one small piece. For n = 1 the direction turns twice while t goes once around the circle.', String.raw`z^n\,dz=iR^{n+1}e^{i(n+1)t}\,dt`),
    f('Jumlahkan potongan-potongan itu ujung ke pangkal. Karena arahnya berputar penuh, rantainya menutup dan kembali ke titik awal: integralnya 0.', 'Add the pieces head to tail. Because their directions turn all the way around, the chain closes up and returns to its starting point: the integral is 0.', String.raw`\oint_{|z|=1}z\,dz=i\int_0^{2\pi}e^{2it}\,dt=0`),
    f('Untuk n = −1, n + 1 = 0: integrannya konstan i dan semua panah menunjuk lurus ke atas. Tidak ada yang membatalkan; rantainya menjadi kolom setinggi 2π.', 'For n = −1, n + 1 = 0: the integrand is the constant i and every arrow points straight up. Nothing cancels; the chain becomes a column 2π tall.', String.raw`\oint_{|z|=1}\frac{dz}{z}=\int_0^{2\pi}i\,dt=2\pi i`),
    f('Coba pangkat lain dengan penggeser. Setiap n ≠ −1 memberi rantai tertutup, jadi integral 0. Hanya n = −1 yang bertahan. Karena itu integral kontur hanya membaca koefisien 1/z, yaitu residu.', 'Try other powers with the slider. Every n ≠ −1 gives a closed chain, so the integral is 0. Only n = −1 survives. That is why a contour integral only reads the 1/z coefficient, the residue.', String.raw`\oint_{|z|=R}z^n\,dz=\begin{cases}2\pi i&n=-1\\0&n\ne-1\end{cases}`),
  ],
  control: { label: b('Pangkat n', 'Power n'), min: -4, max: 3, step: 1, initial: 0 },
  controlFrom: 3,
  readout: n => String.raw`n=${n}:\quad\oint z^{${n}}\,dz=${n === -1 ? '2\\pi i' : '0'}`,
  draw: (k, v, lang) => {
    const t = tr(lang), n = k <= 1 ? 1 : k === 2 ? -1 : Math.round(v), m = n + 1
    const dirs = Array.from({ length: 12 }, (_, j) => PI / 2 + m * 2 * PI * j / 12)
    const chain: P[] = [PS]
    dirs.forEach(a => { const q = chain[chain.length - 1]; chain.push([q[0] + PL * Math.cos(a), q[1] - PL * Math.sin(a)]) })
    return <>
      <circle cx={PO[0]} cy={PO[1]} r={PR} fill="none" stroke={C.ln} strokeWidth="2" />
      <Tip c={PO} r={PR} a={PI * .75} color={C.ln} />
      <Dot at={PO} color={C.mu} r={3} />
      <T x={PO[0]} y={30} size={16} weight={700} color={C.a}>n = {mi(n)}</T>
      {dirs.map((a, j) => { const p = onC(PO, PR, 2 * PI * j / 12); return <g key={j} style={{ transition: 'all .45s' }}>
        <Dot at={p} color={C.fg} r={2.5} />
        <Arrow from={p} to={[p[0] + 24 * Math.cos(a), p[1] - 24 * Math.sin(a)]} color={j === 0 ? C.y : C.v} width={2.5} head={7} />
      </g> })}
      <T x={12} y={286} anchor="start" size={13} color={C.mu}>{t('kuning: potongan pertama, t = 0', 'amber: first piece, t = 0')}</T>
      <At until={0} frame={k}>
        <T x={262} y={70} anchor="start" size={15}>z = eⁱᵗ</T>
        <T x={262} y={100} anchor="start" size={15}>zⁿ dz = i e^(i(n+1)t) dt</T>
        <T x={262} y={140} anchor="start" size={15} weight={700} color={C.a}>n = 1: {t('arah berputar 2×', 'direction turns 2×')}</T>
        <T x={262} y={176} anchor="start" size={13} color={C.mu}>{t('panah: arah tiap potongan', 'arrows: direction of each piece')}</T>
      </At>
      <At from={1} frame={k}>
        {chain.slice(1).map((q, j) => <Arrow key={j} from={chain[j]} to={q} color={j === 0 ? C.y : C.v} width={2.5} head={6} />)}
        <circle cx={PS[0]} cy={PS[1]} r={5} fill={C.bg} stroke={m === 0 ? C.mu : C.g} strokeWidth="2.5" />
        <T x={PS[0]} y={287} size={15} weight={700} color={m === 0 ? C.v : C.g}>{m === 0 ? t('jumlah = 2πi', 'sum = 2πi') : t('jumlah = 0', 'sum = 0')}</T>
        <At from={0} frame={m === 0 ? 1 : -1}>
          <path d={`M${PS[0] + 14},${PS[1]} H${PS[0] + 22} V${PS[1] - 12 * PL} H${PS[0] + 14}`} fill="none" stroke={C.v} strokeWidth="1.8" />
          <T x={PS[0] + 30} y={PS[1] - 6 * PL + 5} size={15} weight={700} color={C.v} anchor="start">2π</T>
        </At>
        <T x={262} y={40} anchor="start" size={13} color={C.mu}>{t('ujung ke pangkal:', 'head to tail:')}</T>
      </At>
    </>
  },
}

// ================================================================ primitive:0 Cauchy–Goursat by nested squares
const GX = 40, GY = 50, GS = 200
const QSEQ: [number, number][] = [[1, 0], [0, 1], [1, 1], [0, 0], [1, 0]]
const nested = (n: number): [number, number, number] => { let x = GX, y = GY, s = GS; for (let i = 0; i < n; i++) { s /= 2; x += QSEQ[i][0] * s; y += QSEQ[i][1] * s } return [x, y, s] }
const Loop = ({ x, y, s, i, color, w = 2, head = 6, hl }: { x: number; y: number; s: number; i: number; color: string; w?: number; head?: number; hl?: string }) => <g>
  <Arrow from={[x + s / 3, y + s - i]} to={[x + 2 * s / 3, y + s - i]} color={color} width={w} head={head} />
  <Arrow from={[x + s - i, y + 2 * s / 3]} to={[x + s - i, y + s / 3]} color={hl === 'r' ? C.r : color} width={w} head={head} />
  <Arrow from={[x + 2 * s / 3, y + i]} to={[x + s / 3, y + i]} color={color} width={w} head={head} />
  <Arrow from={[x + i, y + s / 3]} to={[x + i, y + 2 * s / 3]} color={hl === 'l' ? C.r : color} width={w} head={head} />
</g>
const goursat: Story = {
  title: b('Cauchy–Goursat: bagi empat, terus, sampai hampir linear', 'Cauchy–Goursat: quarter, repeat, until almost linear'),
  frames: [
    f('f analitik pada dan di dalam persegi Q. Sebut I = |∮ f dz| mengelilingi batas Q. Kita ingin menunjukkan I = 0 dengan membagi persegi berulang-ulang.', 'f is analytic on and inside the square Q. Call I = |∮ f dz| around the boundary of Q. We want to show I = 0 by subdividing the square again and again.', String.raw`I=\left|\oint_{\partial Q}f(z)\,dz\right|`),
    f('Bagi Q menjadi 4 persegi, masing-masing dikelilingi berlawanan jarum jam. Sisi dalam dilewati dua kali dengan arah berlawanan (merah) dan saling menghapus, jadi integral Q adalah jumlah empat integral kecil. Paling sedikit satu, Q₁, berukuran ≥ I/4.', 'Split Q into 4 squares, each traced counterclockwise. Inner edges are traced twice in opposite directions (red) and cancel, so the integral over Q is the sum of the four small ones. At least one of them, Q₁, has size ≥ I/4.', String.raw`\oint_{\partial Q}=\sum_{j=1}^4\oint_{\partial Q^{(j)}}\implies\left|\oint_{\partial Q_1}\right|\ge\frac I4`),
    f('Ulangi di Q₁, lalu Q₂, dan seterusnya. Geser n: persegi Qₙ bersisi 1/2ⁿ (dengan sisi Q = 1) dan integralnya masih ≥ I/4ⁿ. Persegi-persegi bersarang ini menyusut ke satu titik z₀.', 'Repeat in Q₁, then Q₂, and so on. Move n: the square Qₙ has side 1/2ⁿ (taking Q to have side 1) and its integral is still ≥ I/4ⁿ. These nested squares shrink to one point z₀.', String.raw`\left|\oint_{\partial Q_n}f\,dz\right|\ge\frac{I}{4^n},\quad Q_n\to z_0`),
    f('Dekat z₀ fungsi analitik hampir linear: f = f(z₀) + f′(z₀)(z − z₀) + r(z) dengan |r| ≤ ε|z − z₀|. Bagian linear punya antiturunan, jadi integralnya 0. Sisanya ≤ ε·diameter·keliling = 4√2ε/4ⁿ. Jadi I ≤ 4√2ε untuk setiap ε, artinya I = 0.', 'Near z₀ an analytic function is almost linear: f = f(z₀) + f′(z₀)(z − z₀) + r(z) with |r| ≤ ε|z − z₀|. The linear part has an antiderivative, so its integral is 0. The rest is ≤ ε·diameter·perimeter = 4√2ε/4ⁿ. So I ≤ 4√2ε for every ε, which means I = 0.', String.raw`\frac{I}{4^n}\le\left|\oint_{\partial Q_n}r\,dz\right|\le\varepsilon\cdot\frac{\sqrt2}{2^n}\cdot\frac{4}{2^n}\implies I\le4\sqrt2\,\varepsilon`),
  ],
  control: { label: b('Tingkat pembagian n', 'Subdivision level n'), min: 1, max: 5, step: 1, initial: 2 },
  controlFrom: 2,
  readout: n => String.raw`n=${n}:\quad\left|\oint_{\partial Q_n}f\,dz\right|\ge\frac{I}{4^{${n}}}=\frac{I}{${4 ** n}}`,
  draw: (k, v, lang) => {
    const t = tr(lang), X = 262, n = k === 3 ? 5 : Math.round(v)
    const [zx, zy, zs] = nested(5), z0: P = [zx + zs / 2, zy + zs / 2], h = GS / 2
    return <>
      <rect x={GX} y={GY} width={GS} height={GS} fill={C.soft} fillOpacity=".4" stroke={C.a} strokeWidth="3.5" />
      <At until={0} frame={k}>
        <Loop x={GX} y={GY} s={GS} i={0} color={C.a} w={3.5} head={11} />
        <T x={GX + h} y={GY + h + 6} size={18} weight={700} color={C.a}>Q</T>
        <T x={X} y={70} anchor="start" size={16} weight={700}>I = |∮ f dz|</T>
        <T x={X} y={102} anchor="start" size={14} color={C.mu}>{t('f analitik di Q', 'f analytic on Q')}</T>
        <T x={X} y={140} anchor="start" size={15}>{t('tujuan: I = 0', 'goal: I = 0')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <rect x={GX + h} y={GY} width={h} height={h} fill={C.y} fillOpacity=".25" />
        <path d={`M${GX + h},${GY} V${GY + GS} M${GX},${GY + h} H${GX + GS}`} stroke={C.ln} strokeWidth="1.5" />
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([c, r]) => <Loop key={`${c}${r}`} x={GX + c * h} y={GY + r * h} s={h} i={10} color={C.a} hl={r === 0 ? (c === 0 ? 'r' : 'l') : undefined} />)}
        <T x={GX + 1.5 * h} y={GY + h / 2 + 5} size={15} weight={700} color={C.y}>Q₁</T>
        <T x={X} y={70} anchor="start" size={15}>I ≤ {t('jumlah 4 putaran', 'sum of 4 loops')}</T>
        <T x={X} y={100} anchor="start" size={13} color={C.r}>{t('sisi dalam saling hapus', 'inner edges cancel')}</T>
        <T x={X} y={140} anchor="start" size={15} weight={700} color={C.y}>|∮ Q₁| ≥ I/4</T>
      </At>
      <At from={2} frame={k}>
        {Array.from({ length: n }, (_, i) => { const [x, y, s] = nested(i + 1); return <rect key={i} x={x} y={y} width={s} height={s} fill={i === n - 1 ? C.y : 'none'} fillOpacity=".35" stroke={C.y} strokeWidth={i === n - 1 ? 2.5 : 1.5} /> })}
      </At>
      <At from={2} until={2} frame={k}>
        <T x={X} y={70} anchor="start" size={16} weight={700} color={C.y}>n = {n}</T>
        <T x={X} y={102} anchor="start" size={15}>{t('sisi', 'side')} Qₙ = 1/{2 ** n}</T>
        <T x={X} y={130} anchor="start" size={15}>{t('keliling', 'perimeter')} = 4/{2 ** n}</T>
        <T x={X} y={166} anchor="start" size={15} weight={700} color={C.y}>|∮ Qₙ| ≥ I/{4 ** n}</T>
        <T x={X} y={204} anchor="start" size={13} color={C.mu}>{t('menyusut ke satu titik z₀', 'shrinking to one point z₀')}</T>
      </At>
      <At from={3} frame={k}>
        <Dot at={z0} color={C.v} r={4} />
        <path d={`M${z0[0] + 5},${z0[1] - 5} L${GX + GS + 4},${GY - 26}`} stroke={C.v} strokeWidth="1.2" />
        <T x={GX + GS + 8} y={GY - 28} anchor="start" size={14} weight={700} color={C.v}>z₀</T>
        <T x={X} y={76} anchor="start" size={14}>f = {t('(linear)', '(linear)')} + r(z)</T>
        <T x={X} y={104} anchor="start" size={14} color={C.g}>∮ {t('linear', 'linear')} = 0</T>
        <T x={X} y={132} anchor="start" size={14}>|r(z)| ≤ ε|z − z₀|</T>
        <T x={X} y={164} anchor="start" size={14}>|∮ Qₙ| ≤ ε·√2·4/4ⁿ</T>
        <T x={X} y={192} anchor="start" size={14} color={C.y}>|∮ Qₙ| ≥ I/4ⁿ</T>
        <T x={X} y={232} anchor="start" size={17} weight={700} color={C.v}>I ≤ 4√2 ε → 0</T>
      </At>
    </>
  },
}

// ================================================================ primitive:1 holes and deformation
const DO: P = [130, 150], DU = 60
const outer = fn(t => { const r = 96 + 12 * Math.sin(3 * t) + 8 * Math.cos(5 * t); return [DO[0] + r * Math.cos(t), DO[1] - r * Math.sin(t)] }, 0, 2 * PI, 160) + ' Z'
const outerAt = (t: number): P => { const r = 96 + 12 * Math.sin(3 * t) + 8 * Math.cos(5 * t); return [DO[0] + r * Math.cos(t), DO[1] - r * Math.sin(t)] }
const holes: Story = {
  title: b('Kontur di sekitar lubang: mengecil boleh, menghilang tidak', 'A contour around a hole: it may shrink, but not vanish'),
  frames: [
    f('f(z) = 1/z analitik di setiap titik kontur C, tetapi tidak di 0, lubang di dalamnya. Integralnya mengelilingi C adalah 2πi, bukan 0. Analitik di sepanjang lintasan saja tidak cukup.', 'f(z) = 1/z is analytic at every point of the contour C, but not at 0, a hole inside it. Its integral around C is 2πi, not 0. Being analytic along the path alone is not enough.', String.raw`\oint_C\frac{dz}{z}=2\pi i\ne0`),
    f('Deformasi: di daerah hijau antara C dan lingkaran |z| = r, f analitik. Cauchy–Goursat pada daerah itu memberi ∮ C = ∮ lingkaran kecil. Geser r: hasilnya tetap 2πi.', 'Deformation: in the green region between C and the circle |z| = r, f is analytic. Cauchy–Goursat on that region gives ∮ over C = ∮ over the small circle. Move r: the result stays 2πi.', String.raw`\oint_C\frac{dz}{z}=\oint_{|z|=r}\frac{dz}{z}=\int_0^{2\pi}i\,dt=2\pi i`),
    f('Lingkaran itu tidak dapat disusutkan ke satu titik tanpa melewati 0. Karena integral tertutupnya bukan 0, 1/z tidak punya antiturunan global di C tanpa 0: Log z bertambah 2πi setiap satu putaran. Di domain simply connected masalah ini tidak muncul.', 'The circle cannot be shrunk to a point without crossing 0. Since its closed integral is not 0, 1/z has no global antiderivative on C without 0: Log z gains 2πi on every turn. On a simply connected domain this problem does not arise.', String.raw`F'=\tfrac1z\implies\oint_CF'\,dz=0\ne2\pi i`),
  ],
  control: { label: b('Jari-jari lingkaran dalam r', 'Inner circle radius r'), min: .2, max: 1.2, step: .2, initial: .8 },
  controlFrom: 1,
  readout: v => { const r = Math.round(v * 10) / 10; return String.raw`r=${r}:\quad\oint_{|z|=${r}}\frac{dz}{z}=2\pi i` },
  draw: (k, v, lang) => {
    const t = tr(lang), X = 270, r = Math.round(v * 10) / 10 * DU
    return <>
      <path d={`M14,${DO[1]} H250 M${DO[0]},22 V280`} stroke={C.faint} strokeWidth="1.3" />
      <At from={1} until={1} frame={k}>
        <path d={`${outer} M${DO[0] - r},${DO[1]} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`} fill={C.g} fillOpacity=".2" fillRule="evenodd" />
        <circle cx={DO[0]} cy={DO[1]} r={r} fill="none" stroke={C.g} strokeWidth="3" />
        <Tip c={DO} r={r} a={PI / 2} color={C.g} span={Math.min(.6, 12 / r)} />
      </At>
      <path d={outer} fill="none" stroke={C.a} strokeWidth="3.5" />
      <Arrow from={outerAt(PI / 2 - .12)} to={outerAt(PI / 2 + .02)} color={C.a} width={3} head={10} />
      <Arrow from={outerAt(-PI / 2 - .12)} to={outerAt(-PI / 2 + .02)} color={C.a} width={3} head={10} />
      <T x={outerAt(PI / 4)[0] + 6} y={outerAt(PI / 4)[1] - 6} anchor="start" size={16} weight={700} color={C.a}>C</T>
      <circle cx={DO[0]} cy={DO[1]} r={5} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
      <At until={0} frame={k}>
        <T x={DO[0]} y={DO[1] + 24} size={13} color={C.r}>{t('lubang di 0', 'hole at 0')}</T>
        <T x={X} y={60} anchor="start" size={17} weight={700}>f(z) = 1/z</T>
        <T x={X} y={94} anchor="start" size={14}>{t('analitik di sepanjang C', 'analytic along C')}</T>
        <T x={X} y={130} anchor="start" size={16} weight={700} color={C.r}>∮ C dz/z = 2πi</T>
        <T x={X} y={156} anchor="start" size={13} color={C.mu}>{t('bukan 0', 'not 0')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={60} anchor="start" size={13} color={C.mu}>{t('di daerah hijau:', 'in the green region:')}</T>
        <T x={X} y={84} anchor="start" size={14}>{t('f analitik', 'f analytic')}</T>
        <T x={X} y={120} anchor="start" size={15} weight={700} color={C.g}>∮ C = ∮ |z| = r</T>
        <T x={X} y={150} anchor="start" size={15} color={C.g}>= 2πi</T>
        <T x={X} y={186} anchor="start" size={14}>r = {num(lang, r / DU, 1)}</T>
        <T x={X} y={210} anchor="start" size={13} color={C.mu}>{t('untuk setiap r', 'for every r')}</T>
      </At>
      <At from={2} frame={k}>
        <path d={arc(DO, 34, .15, 2 * PI - .25)} fill="none" stroke={C.y} strokeWidth="2.5" />
        <Arrow from={onC(DO, 34, 2 * PI - .6)} to={onC(DO, 34, 2 * PI - .2)} color={C.y} width={2.5} head={8} />
        <T x={DO[0] + 40} y={DO[1] - 26} anchor="start" size={13} weight={600} color={C.y}>arg: +2π</T>
        <Cross at={[DO[0], DO[1]]} color={C.r} s={9} />
        <T x={X} y={60} anchor="start" size={14}>{t('susut ke titik?', 'shrink to a point?')}</T>
        <T x={X} y={84} anchor="start" size={14} color={C.r}>{t('harus melewati 0', 'must cross 0')}</T>
        <T x={X} y={124} anchor="start" size={14}>{t('antiturunan Log z:', 'antiderivative Log z:')}</T>
        <T x={X} y={148} anchor="start" size={15} weight={700} color={C.y}>{t('1 putaran: +2πi', '1 turn: +2πi')}</T>
        <T x={X} y={184} anchor="start" size={13} color={C.r}>{t('tidak ada antiturunan', 'no global')}</T>
        <T x={X} y={204} anchor="start" size={13} color={C.r}>{t('global di C tanpa 0', 'antiderivative on C∖{0}')}</T>
      </At>
    </>
  },
}

// ================================================================ cauchy:0 the derivative formula as weighted averages
const CWo: P = [66, 150], cwp = plane(CWo, 26)
const cauchyCurves: ((t: number) => P)[] = [
  t => cwp(2 + 3 * Math.cos(t) + Math.cos(2 * t), 3 * Math.sin(t) + Math.sin(2 * t)),
  t => cwp(3 + 3 * Math.cos(t), -Math.sin(t)),
  t => cwp(1 + 3 * Math.cos(t) + 2 * Math.cos(2 * t), -3 * Math.sin(t) - 2 * Math.sin(2 * t)),
]
const cauchyDeriv: Story = {
  title: b('Rumus turunan Cauchy: rata-rata dengan bobot berputar', 'Cauchy’s derivative formula: averages with a turning weight'),
  frames: [
    f('Ambil f(z) = z² + 3z + 2 dan lingkaran |z| = 1. Kurva ungu adalah nilai f(eⁱᵗ) saat t mengelilingi lingkaran; titik-titik adalah 12 sampel. Rumus Cauchy dengan n = 0: rata-rata nilai ini (titik pink) sama dengan f(0) = 2.', 'Take f(z) = z² + 3z + 2 and the circle |z| = 1. The violet curve shows the values f(eⁱᵗ) as t goes around the circle; the dots are 12 samples. Cauchy’s formula with n = 0: the average of these values (the pink dot) equals f(0) = 2.', String.raw`f(0)=\frac1{2\pi i}\oint\frac{f(z)}{z}\,dz=\frac1{2\pi}\int_0^{2\pi}f(e^{it})\,dt=2`),
    f('Untuk turunan pertama, kernelnya 1/z²: kalikan setiap nilai dengan e^(−it) sebelum dirata-ratakan. Suku 3z menjadi konstanta 3, suku lain tetap berputar dan hilang dalam rata-rata. Hasilnya 3 = f′(0).', 'For the first derivative the kernel is 1/z²: multiply each value by e^(−it) before averaging. The term 3z becomes the constant 3, the other terms keep turning and vanish in the average. The result is 3 = f′(0).', String.raw`f'(0)=\frac{1!}{2\pi i}\oint\frac{f(z)}{z^2}\,dz=\frac1{2\pi}\int_0^{2\pi}f(e^{it})e^{-it}\,dt=3`),
    f('Turunan kedua: kernel 2!/z³, kalikan dengan e^(−2it). Kini suku z² yang menjadi konstan, yaitu 1. Rumusnya memberi f″(0) = 2!·1 = 2, cocok dengan turunan langsung (z² + 3z + 2)″ = 2.', 'Second derivative: kernel 2!/z³, multiply by e^(−2it). Now the z² term becomes the constant, namely 1. The formula gives f″(0) = 2!·1 = 2, matching the direct derivative (z² + 3z + 2)″ = 2.', String.raw`f''(0)=\frac{2!}{2\pi i}\oint\frac{f(z)}{z^3}\,dz=2!\cdot1=2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 258, cols = [C.a, C.g, C.y], avg = [2, 3, 1]
    return <>
      <path d={`M20,${CWo[1]} H240 M${CWo[0]},30 V275`} stroke={C.ln} strokeWidth="1.3" />
      {[1, 2, 3, 4, 5, 6].map(x => <g key={x}><path d={`M${cwp(x, 0)[0]},${CWo[1] - 4} V${CWo[1] + 4}`} stroke={C.ln} /><T x={cwp(x, 0)[0]} y={CWo[1] + 18} size={11} color={C.mu}>{x}</T></g>)}
      {cauchyCurves.map((g, i) => { const c = cwp(avg[i], 0); return <At key={i} from={i} until={i} frame={k}>
        <path d={fn(g, 0, 2 * PI, 160)} fill="none" stroke={cols[i]} strokeWidth="3" />
        {Array.from({ length: 12 }, (_, j) => { const p = g(2 * PI * j / 12); return <g key={j}><path d={pl([p, c])} stroke={cols[i]} strokeWidth="1" opacity=".35" /><Dot at={p} color={cols[i]} r={3.5} /></g> })}
        <Dot at={c} color={C.v} r={7} />
        <T x={c[0]} y={CWo[1] - 14} size={14} weight={700} color={C.v}>{avg[i]}</T>
      </At> })}
      <T x={X} y={40} anchor="start" size={15} weight={700}>f(z) = z² + 3z + 2</T>
      <At until={0} frame={k}>
        <T x={X} y={80} anchor="start" size={14} color={C.a}>{t('nilai', 'values')} f(eⁱᵗ)</T>
        <T x={X} y={104} anchor="start" size={14}>= e²ⁱᵗ + 3eⁱᵗ + 2</T>
        <T x={X} y={144} anchor="start" size={15} weight={700} color={C.v}>{t('rata-rata', 'average')} = 2 = f(0)</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={80} anchor="start" size={14} color={C.g}>f(eⁱᵗ) · e⁻ⁱᵗ</T>
        <T x={X} y={104} anchor="start" size={14}>= eⁱᵗ + 3 + 2e⁻ⁱᵗ</T>
        <T x={X} y={144} anchor="start" size={15} weight={700} color={C.v}>{t('rata-rata', 'average')} = 3 = f′(0)</T>
      </At>
      <At from={2} frame={k}>
        <T x={X} y={80} anchor="start" size={14} color={C.y}>f(eⁱᵗ) · e⁻²ⁱᵗ</T>
        <T x={X} y={104} anchor="start" size={14}>= 1 + 3e⁻ⁱᵗ + 2e⁻²ⁱᵗ</T>
        <T x={X} y={144} anchor="start" size={15} weight={700} color={C.v}>{t('rata-rata', 'average')} = 1</T>
        <T x={X} y={170} anchor="start" size={15} weight={700} color={C.v}>f″(0) = 2! · 1 = 2</T>
      </At>
      <T x={X} y={216} anchor="start" size={13} color={C.mu}>{t('suku yang berputar', 'turning terms')}</T>
      <T x={X} y={236} anchor="start" size={13} color={C.mu}>{t('hilang di rata-rata;', 'vanish in the average;')}</T>
      <T x={X} y={256} anchor="start" size={13} color={C.mu}>{t('hanya konstanta tersisa', 'only the constant stays')}</T>
    </>
  },
}

// ================================================================ cauchy:1 estimates and Liouville
const KLo: P = [120, 150], GO: P = [272, 255], gx = (R: number) => GO[0] + 47 * R, gy = (B: number) => GO[1] - 33 * B
const liouville: Story = {
  title: b('Batas M/R: kapan memaksa f′ = 0?', 'The bound M/R: when does it force f′ = 0?'),
  frames: [
    f('Estimasi Cauchy: jika |f| ≤ M pada lingkaran berjari-jari R, maka |f′(a)| ≤ M/R. Contoh f = eᶻ di a = 0: pada lingkaran |f| paling besar e^R, jadi batasnya e^R/R. Geser R: batas selalu ≥ 1 = f′(0), paling tajam di R = 1.', 'Cauchy estimate: if |f| ≤ M on a circle of radius R, then |f′(a)| ≤ M/R. Example f = eᶻ at a = 0: on the circle |f| is at most e^R, so the bound is e^R/R. Move R: the bound is always ≥ 1 = f′(0), and sharpest at R = 1.', String.raw`|f^{(n)}(a)|\le\frac{n!M}{R^n},\quad n=1:\ |f'(0)|\le\frac{e^R}{R}`),
    f('Liouville: misalkan f entire dan |f| ≤ 2 di seluruh C. Maka M = 2 berlaku untuk setiap lingkaran, sebesar apa pun. Geser R ke kanan: batas 2/R turun menuju 0. Jadi f′(a) = 0 di setiap a, dan f konstan.', 'Liouville: suppose f is entire and |f| ≤ 2 on all of C. Then M = 2 works for every circle, however large. Move R to the right: the bound 2/R drops toward 0. So f′(a) = 0 at every a, and f is constant.', String.raw`|f'(a)|\le\frac{2}{R}\xrightarrow{R\to\infty}0`),
    f('Terbatas pada satu cakram tidak cukup. f = z terbatas di setiap cakram, tetapi M ikut tumbuh bersama R: M = R. Batasnya R/R = 1 dan tidak pernah turun; memang f′ = 1.', 'Being bounded on one disc is not enough. f = z is bounded on every disc, but M grows with R: M = R. The bound is R/R = 1 and never drops; indeed f′ = 1.', String.raw`f=z:\quad\frac{M(R)}{R}=\frac RR=1`),
  ],
  control: { label: b('Jari-jari R', 'Radius R'), min: .5, max: 4, step: .25, initial: 1 },
  draw: (k, R, lang) => {
    const t = tr(lang), bounds = [(r: number) => Math.exp(r) / r, (r: number) => 2 / r, () => 1], cols = [C.a, C.v, C.y]
    const B = bounds[k](R), on = B <= 6
    const mLabel = [<>M = <Pw e="R">e</Pw> ≈ {num(lang, Math.exp(R))}</>, <>M = 2</>, <>M = R = {num(lang, R)}</>][k]
    return <>
      <path d={`M14,${KLo[1]} H232 M${KLo[0]},40 V262`} stroke={C.faint} strokeWidth="1.3" />
      <circle cx={KLo[0]} cy={KLo[1]} r={R * 26} fill={C.soft} fillOpacity=".4" stroke={cols[k]} strokeWidth="3" style={{ transition: 'r .3s' }} />
      <Dot at={KLo} color={C.fg} r={4} />
      <T x={KLo[0] - 8} y={KLo[1] + 18} size={12} anchor="end" color={C.mu}>0</T>
      <T x={20} y={34} anchor="start" size={15} weight={700} color={cols[k]}>{[<>f = <Pw e="z">e</Pw></>, t('|f| ≤ 2 di seluruh C', '|f| ≤ 2 on all of C'), 'f = z'][k]}</T>
      <T x={20} y={284} anchor="start" size={14} color={cols[k]}>{mLabel}</T>
      <At until={0} frame={k}><Dot at={[KLo[0] + R * 26, KLo[1]]} color={C.r} r={5} /></At>

      <path d={`M${GO[0]},${GO[1]} H462 M${GO[0]},${GO[1]} V48`} stroke={C.ln} strokeWidth="1.3" />
      {[1, 2, 3, 4].map(r => <T key={r} x={gx(r)} y={GO[1] + 16} size={11} color={C.mu}>{r}</T>)}
      {[1, 2, 4, 6].map(v => <T key={v} x={GO[0] - 6} y={gy(v) + 4} size={11} color={C.mu} anchor="end">{v}</T>)}
      <T x={462} y={GO[1] + 30} size={12} color={C.mu} anchor="end">R</T>
      <T x={GO[0] + 6} y={42} size={12} color={C.mu} anchor="start">{t('batas |f′(a)|', 'bound on |f′(a)|')}</T>
      <path d={`M${GO[0]},${gy(1)} H462`} stroke={C.g} strokeWidth="1.5" strokeDasharray="5 4" />
      <Clip id="liou-g" x={GO[0]} y={48} w={194} h={GO[1] - 48}>
        <path d={fn(r => [gx(r), gy(bounds[k](r))], .5, 4, 100)} fill="none" stroke={cols[k]} strokeWidth="3" />
      </Clip>
      {on ? <><Dot at={[gx(R), gy(B)]} color={cols[k]} r={6} /><T x={gx(R) + (R > 3 ? -10 : 10)} y={gy(B) - 10} anchor={R > 3 ? 'end' : 'start'} size={14} weight={700} color={cols[k]}>{num(lang, B)}</T></>
        : <T x={Math.min(gx(R), 446)} y={64} size={13} weight={700} color={cols[k]}>↑ {num(lang, B, 1)}</T>}
      <At until={0} frame={k}><T x={460} y={gy(1) + 16} anchor="end" size={12} color={C.g}>f′(0) = 1</T></At>
      <At from={1} until={1} frame={k}><T x={460} y={gy(1) - 8} anchor="end" size={12} color={C.v}>2/R → 0</T></At>
      <At from={2} frame={k}><T x={460} y={gy(1) + 16} anchor="end" size={12} color={C.y}>R/R = 1</T></At>
    </>
  },
}

// ================================================================ cauchy:2 fundamental theorem of algebra
const FO: P = [125, 150], FU = 55, fp = plane(FO, FU)
const fta: Story = {
  title: b('Teorema dasar aljabar lewat z³ − 1', 'The fundamental theorem of algebra through z³ − 1'),
  frames: [
    f('P(z) = z³ − 1 berderajat 3 dan punya tepat 3 akar: 1 dan −½ ± i√3/2, semuanya di lingkaran satuan. Teorema dasar aljabar: setiap polinom kompleks berderajat n ≥ 1 punya n akar, kelipatan ikut dihitung.', 'P(z) = z³ − 1 has degree 3 and exactly 3 roots: 1 and −½ ± i√3/2, all on the unit circle. The fundamental theorem of algebra: every complex polynomial of degree n ≥ 1 has n roots, counted with multiplicity.', String.raw`z^3-1=(z-1)\left(z+\tfrac12-i\tfrac{\sqrt3}2\right)\left(z+\tfrac12+i\tfrac{\sqrt3}2\right)`),
    f('Mengapa paling sedikit satu akar? Andaikan P tidak pernah nol, maka 1/P entire. Untuk |z| ≥ 2: |P| ≥ |z|³ − 1 ≥ 7, jadi |1/P| ≤ 1/7. Di cakram |z| ≤ 2, 1/P kontinu sehingga terbatas. Liouville membuat 1/P konstan, padahal P tidak konstan: kontradiksi.', 'Why at least one root? Suppose P is never zero; then 1/P is entire. For |z| ≥ 2: |P| ≥ |z|³ − 1 ≥ 7, so |1/P| ≤ 1/7. On the disc |z| ≤ 2, 1/P is continuous and hence bounded. Liouville makes 1/P constant, yet P is not constant: a contradiction.', String.raw`|z|\ge2\implies|z^3-1|\ge|z|^3-1\ge7`),
    f('Setelah satu akar ditemukan, faktorkan: z³ − 1 = (z − 1)(z² + z + 1). Terapkan argumen yang sama pada faktor berderajat 2, dan seterusnya. Setiap langkah menurunkan derajat satu, jadi totalnya tepat n akar.', 'Once one root is found, factor it out: z³ − 1 = (z − 1)(z² + z + 1). Apply the same argument to the degree-2 factor, and so on. Each step lowers the degree by one, so there are exactly n roots in total.', String.raw`z^2+z+1=0\iff z=-\tfrac12\pm i\tfrac{\sqrt3}2`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 262, roots: P[] = [fp(1, 0), fp(-.5, Math.sqrt(3) / 2), fp(-.5, -Math.sqrt(3) / 2)]
    const rootsView = (cols: string[]) => <>
      {roots.map((p, i) => <Dot key={i} at={p} color={cols[i]} r={7} />)}
      <T x={roots[0][0] + 12} y={roots[0][1] - 8} anchor="start" size={14} weight={700} color={cols[0]}>1</T>
      <T x={roots[1][0]} y={roots[1][1] - 14} size={13} weight={600} color={cols[1]}>−½ + i√3/2</T>
      <T x={roots[2][0]} y={roots[2][1] + 24} size={13} weight={600} color={cols[2]}>−½ − i√3/2</T>
    </>
    return <>
      <At from={1} until={1} frame={k}>
        <path d={`M14,22 H236 V278 H14 Z M${FO[0] - 110},${FO[1]} a110,110 0 1,0 220,0 a110,110 0 1,0 -220,0 Z`} fill={C.y} fillOpacity=".18" fillRule="evenodd" />
        <circle cx={FO[0]} cy={FO[1]} r={110} fill={C.g} fillOpacity=".15" stroke={C.ln} strokeWidth="2" strokeDasharray="6 4" />
        <T x={18} y={38} anchor="start" size={13} weight={600} color={C.y}>|1/P| ≤ 1/7</T>
        <T x={FO[0]} y={FO[1] + 50} size={14} weight={600} color={C.g}>{t('terbatas', 'bounded')}</T>
        <T x={FO[0] + 78} y={FO[1] - 82} size={12} color={C.mu}>|z| = 2</T>
      </At>
      <path d={`M14,${FO[1]} H236 M${FO[0]},22 V278`} stroke={C.ln} strokeWidth="1.3" />
      <circle cx={FO[0]} cy={FO[1]} r={FU} fill="none" stroke={C.ln} strokeDasharray="4 4" />
      <At until={0} frame={k}>
        {rootsView([C.v, C.v, C.v])}
        <T x={X} y={60} anchor="start" size={17} weight={700}>P(z) = z³ − 1</T>
        <T x={X} y={94} anchor="start" size={15}>{t('derajat 3', 'degree 3')}</T>
        <T x={X} y={124} anchor="start" size={15} weight={700} color={C.v}>{t('3 akar', '3 roots')}</T>
        <T x={X} y={150} anchor="start" size={13} color={C.mu}>{t('semua di |z| = 1', 'all on |z| = 1')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={50} anchor="start" size={13} color={C.mu}>{t('andaikan P ≠ 0 di mana-mana', 'suppose P ≠ 0 everywhere')}</T>
        <T x={X} y={76} anchor="start" size={15}>⇒ 1/P entire</T>
        <T x={X} y={110} anchor="start" size={14} color={C.y}>|z| ≥ 2: |P| ≥ 8 − 1 = 7</T>
        <T x={X} y={136} anchor="start" size={14} color={C.g}>|z| ≤ 2: {t('kontinu, terbatas', 'continuous, bounded')}</T>
        <T x={X} y={172} anchor="start" size={15}>{t('Liouville: 1/P konstan', 'Liouville: 1/P constant')}</T>
        <T x={X} y={206} anchor="start" size={16} weight={700} color={C.r}>{t('kontradiksi', 'contradiction')}</T>
      </At>
      <At from={2} frame={k}>
        {rootsView([C.a, C.g, C.g])}
        <T x={X} y={52} anchor="start" size={15} color={C.a} weight={700}>{t('akar 1: z = 1', 'root 1: z = 1')}</T>
        <T x={X} y={82} anchor="start" size={15}>z³ − 1</T>
        <T x={X + 10} y={106} anchor="start" size={15}>= (z − 1)(z² + z + 1)</T>
        <T x={X} y={144} anchor="start" size={15} color={C.g}>z² + z + 1 = 0:</T>
        <T x={X + 10} y={168} anchor="start" size={15} color={C.g}>z = −½ ± i√3/2</T>
        <T x={X} y={210} anchor="start" size={16} weight={700} color={C.v}>{t('3 akar = derajat 3', '3 roots = degree 3')}</T>
      </At>
    </>
  },
}

// ================================================================ series:0 Taylor series and radius
const TSo: P = [120, 190], TSu = 70, tsp = plane(TSo, TSu)
const taylorRadius: Story = {
  title: b('Sisa deret 1/(1 − z) adalah zⁿ⁺¹/(1 − z)', 'The remainder of 1/(1 − z) is zⁿ⁺¹/(1 − z)'),
  frames: [
    f('Jumlah parsial Sₙ = 1 + z + ⋯ + zⁿ memenuhi (1 − z)Sₙ = 1 − zⁿ⁺¹: suku tengah saling hapus. Di z = 0,5 panah 1, 0,5, 0,25, … menumpuk menuju 2. Sisa merah adalah zⁿ⁺¹/(1 − z) = 0,5ⁿ.', 'The partial sum Sₙ = 1 + z + ⋯ + zⁿ satisfies (1 − z)Sₙ = 1 − zⁿ⁺¹: the middle terms cancel. At z = 0.5 the arrows 1, 0.5, 0.25, … pile up toward 2. The red remainder is zⁿ⁺¹/(1 − z) = 0.5ⁿ.', String.raw`(1-z)S_n=1-z^{n+1}\implies S_n=\frac1{1-z}-\frac{z^{n+1}}{1-z}`),
    f('Untuk z kompleks, misalnya z = 0,5 + 0,5i, setiap suku diputar 45° dan diperpendek menjadi 0,71 kali. Panah-panahnya berpilin menuju 1/(1 − z) = 1 + i. Sisanya |z|ⁿ⁺¹/|1 − z| = 0,71ⁿ menuju 0.', 'For a complex z, say z = 0.5 + 0.5i, each term is turned by 45° and shortened to 0.71 times. The arrows spiral in toward 1/(1 − z) = 1 + i. The remainder |z|ⁿ⁺¹/|1 − z| = 0.71ⁿ goes to 0.', String.raw`\frac1{1-(0.5+0.5i)}=\frac1{0.5-0.5i}=1+i`),
    f('Sisa menuju 0 tepat ketika |z| < 1. Batas itu datang dari singularitas terdekat: 1/(1 − z) meledak di z = 1, berjarak 1 dari pusat 0, jadi jari-jari kekonvergenannya 1. Di z = 1,2i sisanya justru membesar. Titik di batas |z| = 1 perlu diperiksa terpisah.', 'The remainder goes to 0 exactly when |z| < 1. That limit comes from the nearest singularity: 1/(1 − z) blows up at z = 1, at distance 1 from the center 0, so the radius of convergence is 1. At z = 1.2i the remainder grows instead. Points on the boundary |z| = 1 need a separate check.', String.raw`\frac1{1-z}=\sum_{n=0}^\infty z^n,\quad|z|<1`),
  ],
  control: { label: b('Suku terakhir zⁿ', 'Last term zⁿ'), min: 0, max: 10, step: 1, initial: 3 },
  readout: n => String.raw`n=${n}:\quad0.5^{${n}}\approx${(.5 ** n).toFixed(4)},\quad\left(\tfrac{\sqrt2}{2}\right)^{${n}}\approx${(Math.SQRT1_2 ** n).toFixed(4)}`,
  draw: (k, nv, lang) => {
    const t = tr(lang), X = 286, n = Math.round(nv), z: Z = k === 0 ? [.5, 0] : [.5, .5], target: Z = k === 0 ? [2, 0] : [1, 1]
    const S: Z[] = [[0, 0]]
    let p: Z = [1, 0]
    for (let j = 0; j <= n; j++) { const s = S[S.length - 1]; S.push([s[0] + p[0], s[1] + p[1]]); p = zmul(p, z) }
    const last = S[S.length - 1], rem = Math.hypot(target[0] - last[0], target[1] - last[1])
    return <>
      <path d={`M14,${TSo[1]} H268 M${TSo[0]},30 V282`} stroke={C.ln} strokeWidth="1.3" />
      {[1, 2].map(x => <T key={x} x={tsp(x, 0)[0]} y={TSo[1] + 18} size={12} color={C.mu}>{x}</T>)}
      <T x={TSo[0] - 6} y={TSo[1] + 18} size={12} color={C.mu} anchor="end">0</T>
      <At until={1} frame={k}>
        {S.slice(1).map((q, j) => { const a = tsp(S[j][0], S[j][1]), bq = tsp(q[0], q[1]), len = Math.hypot(bq[0] - a[0], bq[1] - a[1]); return <Arrow key={j} from={a} to={bq} color={C.a} width={len < 8 ? 2 : 3} head={Math.min(9, len * .45)} /> })}
        <path d={pl([tsp(last[0], last[1]), tsp(target[0], target[1])])} stroke={C.r} strokeWidth="3.5" />
        <circle cx={tsp(target[0], target[1])[0]} cy={tsp(target[0], target[1])[1]} r={7} fill="none" stroke={C.g} strokeWidth="2.5" />
        <T x={tsp(target[0], target[1])[0] + (k === 0 ? 0 : 12)} y={tsp(target[0], target[1])[1] + (k === 0 ? -14 : -8)} anchor={k === 0 ? 'middle' : 'start'} size={14} weight={700} color={C.g}>{k === 0 ? '2' : '1 + i'}</T>
        <T x={X} y={52} anchor="start" size={16} weight={700}>z = {k === 0 ? num(lang, .5, 1) : `${num(lang, .5, 1)} + ${num(lang, .5, 1)}i`}</T>
        <T x={X} y={86} anchor="start" size={14}>n = {n}</T>
        <T x={X} y={112} anchor="start" size={14} color={C.a}>Sₙ ≈ {num(lang, last[0], 3)}{k === 0 ? '' : ` + ${num(lang, last[1], 3)}i`}</T>
        <T x={X} y={146} anchor="start" size={14} color={C.r}>{t('sisa', 'remainder')} = {k === 0 ? '0,5ⁿ' : '0,71ⁿ'}</T>
        <T x={X + 16} y={170} anchor="start" size={15} weight={700} color={C.r}>≈ {num(lang, rem, 4)}</T>
        <T x={X} y={210} anchor="start" size={13} color={C.mu}>(1 − z)Sₙ = 1 − zⁿ⁺¹</T>
      </At>
      <At from={2} frame={k}>
        <circle cx={TSo[0]} cy={TSo[1]} r={TSu} fill={C.g} fillOpacity=".15" stroke={C.g} strokeWidth="2.5" />
        <Cross at={tsp(1, 0)} color={C.r} />
        <Dot at={tsp(.5, 0)} color={C.a} r={5} />
        <Dot at={tsp(.5, .5)} color={C.a} r={5} />
        <T x={tsp(.5, .5)[0] + 8} y={tsp(.5, .5)[1] - 8} anchor="start" size={12} color={C.a}>0,5 + 0,5i</T>
        <Dot at={tsp(0, 1.2)} color={C.r} r={6} hollow />
        <T x={TSo[0] + 10} y={tsp(0, 1.2)[1] - 6} anchor="start" size={13} weight={600} color={C.r}>{num(lang, 1.2, 1)}i</T>
        <T x={tsp(1, 0)[0] + 10} y={TSo[1] - 10} anchor="start" size={13} color={C.r}>{t('meledak', 'blows up')}</T>
        <T x={X} y={56} anchor="start" size={14}>{t('pusat 0, singular di 1', 'center 0, singular at 1')}</T>
        <T x={X} y={88} anchor="start" size={17} weight={700} color={C.g}>R = |1 − 0| = 1</T>
        <T x={X} y={128} anchor="start" size={14} color={C.g}>|z| &lt; 1: |z|ⁿ → 0</T>
        <T x={X} y={156} anchor="start" size={14} color={C.r}>|z| &gt; 1: |z|ⁿ → ∞</T>
        <T x={X} y={184} anchor="start" size={13} color={C.r}>1,2ⁿ: {t('membesar', 'grows')}</T>
      </At>
    </>
  },
}

// ================================================================ series:1 Laurent series on two annuli
const LAo: P = [105, 150], LAu = 46, lap = plane(LAo, LAu), cX = (e: number) => 275 + 26 * (e + 4), CB = 165, CU = 55
const laurent: Story = {
  title: b('Satu fungsi, dua anulus, dua deret Laurent', 'One function, two annuli, two Laurent series'),
  frames: [
    f('f(z) = 1/(z(1 − z)) punya kutub di 0 dan 1. Lingkaran |z| = 1 membagi bidang menjadi dua anulus: hijau 0 < |z| < 1 dan kuning |z| > 1. Uji dengan dua titik: f(0,5) = 4 dan f(2) = −0,5.', 'f(z) = 1/(z(1 − z)) has poles at 0 and 1. The circle |z| = 1 splits the plane into two annuli: green 0 < |z| < 1 and amber |z| > 1. Test with two points: f(0.5) = 4 and f(2) = −0.5.', String.raw`f(z)=\frac1{z(1-z)}=\frac1z+\frac1{1-z}`),
    f('Di anulus hijau, 1/(1 − z) = 1 + z + z² + ⋯ karena |z| < 1. Jadi f = 1/z + 1 + z + z² + ⋯: koefisien cₙ = 1 untuk n ≥ −1. Cek di z = 0,5: 2 + (1 + 0,5 + 0,25 + ⋯) = 2 + 2 = 4.', 'In the green annulus, 1/(1 − z) = 1 + z + z² + ⋯ because |z| < 1. So f = 1/z + 1 + z + z² + ⋯: coefficients cₙ = 1 for n ≥ −1. Check at z = 0.5: 2 + (1 + 0.5 + 0.25 + ⋯) = 2 + 2 = 4.', String.raw`0<|z|<1:\ f=z^{-1}+1+z+z^2+\cdots`),
    f('Di anulus kuning, |z| > 1, deret tadi tidak berlaku. Tulis 1/(1 − z) = −z⁻¹/(1 − z⁻¹) = −z⁻¹ − z⁻² − ⋯. Suku z⁻¹ saling hapus dengan 1/z, jadi f = −z⁻² − z⁻³ − ⋯. Cek di z = 2: −¼ − ⅛ − ⋯ = −½.', 'In the amber annulus, |z| > 1, that series fails. Write 1/(1 − z) = −z⁻¹/(1 − z⁻¹) = −z⁻¹ − z⁻² − ⋯. The z⁻¹ term cancels against 1/z, so f = −z⁻² − z⁻³ − ⋯. Check at z = 2: −¼ − ⅛ − ⋯ = −½.', String.raw`|z|>1:\ f=\frac1z-\frac1z-\frac1{z^2}-\frac1{z^3}-\cdots=-z^{-2}-z^{-3}-\cdots`),
    f('Bahkan koefisien z⁻¹ berbeda: 1 di dalam, 0 di luar. Integral memperlihatkannya: lingkaran |z| = ½ memberi 2πi·1, lingkaran |z| = 2 memberi 2πi·0 = 0, karena residu −1 di kutub 1 membatalkan residu +1 di 0. Pilih anulus dulu, baru kembangkan.', 'Even the z⁻¹ coefficient differs: 1 inside, 0 outside. The integrals show it: the circle |z| = ½ gives 2πi·1, the circle |z| = 2 gives 2πi·0 = 0, because the residue −1 at the pole 1 cancels the residue +1 at 0. Choose the annulus first, then expand.', String.raw`\oint_{|z|=1/2}f\,dz=2\pi i\cdot1,\qquad\oint_{|z|=2}f\,dz=2\pi i\cdot0=0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), inner = [-1, 0, 1, 2, 3], outerE = [-4, -3, -2]
    const bar = (e: number, val: number, col: string, dx: number, w: number) => <rect key={`${e}${col}`} x={cX(e) - w / 2 + dx} y={val > 0 ? CB - CU * val : CB} width={w} height={CU * Math.abs(val)} fill={col} rx={2} />
    return <>
      <path d={`M14,34 H226 V262 H14 Z M${LAo[0] - LAu},${LAo[1]} a${LAu},${LAu} 0 1,0 ${2 * LAu},0 a${LAu},${LAu} 0 1,0 ${-2 * LAu},0 Z`} fill={C.y} fillOpacity=".16" fillRule="evenodd" />
      <circle cx={LAo[0]} cy={LAo[1]} r={LAu} fill={C.g} fillOpacity=".2" stroke={C.ln} strokeWidth="1.5" strokeDasharray="5 4" />
      <path d={`M14,${LAo[1]} H226 M${LAo[0]},34 V262`} stroke={C.faint} strokeWidth="1.2" />
      <Cross at={LAo} color={C.r} s={6} /><Cross at={lap(1, 0)} color={C.r} s={6} />
      <At until={2} frame={k}>
        <Dot at={lap(.5, 0)} color={C.g} r={5} />
        <Dot at={lap(2, 0)} color={C.y} r={5} />
        <T x={lap(.5, 0)[0]} y={LAo[1] + 22} size={12} color={C.g} weight={700}>0,5</T>
        <T x={lap(2, 0)[0]} y={LAo[1] + 22} size={12} color={C.y} weight={700}>2</T>
        <T x={20} y={284} anchor="start" size={13} weight={600} color={C.g}>0 &lt; |z| &lt; 1</T>
        <T x={124} y={284} anchor="start" size={13} weight={600} color={C.y}>|z| &gt; 1</T>
      </At>
      <At from={3} frame={k}>
        <circle cx={LAo[0]} cy={LAo[1]} r={LAu / 2} fill="none" stroke={C.g} strokeWidth="3" />
        <Tip c={LAo} r={LAu / 2} a={PI / 2} color={C.g} span={.6} />
        <circle cx={LAo[0]} cy={LAo[1]} r={2 * LAu} fill="none" stroke={C.y} strokeWidth="3" />
        <Tip c={LAo} r={2 * LAu} a={PI / 2} color={C.y} span={.2} />
        <T x={18} y={284} anchor="start" size={13} weight={700} color={C.g}>|z| = ½: 2πi</T>
        <T x={124} y={284} anchor="start" size={13} weight={700} color={C.y}>|z| = 2: 0</T>
      </At>
      <At until={0} frame={k}>
        <T x={252} y={64} anchor="start" size={16} weight={700}>f = 1/(z(1 − z))</T>
        <T x={252} y={100} anchor="start" size={13} color={C.mu}>{t('kutub di 0 dan 1', 'poles at 0 and 1')}</T>
        <T x={252} y={140} anchor="start" size={15} color={C.g} weight={600}>f(0,5) = 4</T>
        <T x={252} y={170} anchor="start" size={15} color={C.y} weight={600}>f(2) = −0,5</T>
      </At>
      <At from={1} frame={k}>
        <rect x={cX(-1) - 13} y={44} width={26} height={226} fill={C.v} fillOpacity=".1" stroke={C.v} strokeWidth="1" />
        <path d={`M262,${CB} H468`} stroke={C.ln} strokeWidth="1.4" />
        {[-4, -3, -2, -1, 0, 1, 2, 3].map(e => <T key={e} x={cX(e)} y={284} size={11} color={e === -1 ? C.v : C.mu}>{mi(e)}</T>)}
        <T x={262} y={36} anchor="start" size={12} color={C.mu}>{t('koefisien cₙ, n di bawah', 'coefficient cₙ, n below')}</T>
      </At>
      <At from={1} until={1} frame={k}>{inner.map(e => bar(e, 1, C.g, 0, 18))}<T x={cX(-1)} y={66} size={13} weight={700} color={C.g}>c₋₁ = 1</T></At>
      <At from={2} until={2} frame={k}>{outerE.map(e => bar(e, -1, C.y, 0, 18))}<T x={cX(-1)} y={66} size={13} weight={700} color={C.y}>c₋₁ = 0</T></At>
      <At from={3} frame={k}>
        {inner.map(e => bar(e, 1, C.g, -6, 10))}{outerE.map(e => bar(e, -1, C.y, 6, 10))}
        <T x={cX(-1)} y={62} size={13} weight={700} color={C.g}>c₋₁ = 1</T>
        <T x={cX(-1)} y={246} size={13} weight={700} color={C.y}>c₋₁ = 0</T>
      </At>
    </>
  },
}

// ================================================================ singularities:0 removable
const RMo: P = [40, 150], rmp = plane(RMo, 120)
const sincCurve = (r: number) => fn(th => { const w = zdiv(zsin([r * Math.cos(th), r * Math.sin(th)]), [r * Math.cos(th), r * Math.sin(th)]); return rmp(w[0], w[1]) }, 0, 2 * PI, 120) + ' Z'
const removable: Story = {
  title: b('sin z / z: terbatas di sekitar 0, jadi lubangnya bisa diisi', 'sin z / z: bounded near 0, so the hole can be filled'),
  frames: [
    f('sin z / z tidak terdefinisi di 0, tetapi deret Laurent-nya 1 − z²/6 + z⁴/120 − ⋯ tidak punya pangkat negatif sama sekali. Kotak untuk z⁻¹, z⁻², z⁻³ semuanya kosong.', 'sin z / z is undefined at 0, but its Laurent series 1 − z²/6 + z⁴/120 − ⋯ has no negative powers at all. The boxes for z⁻¹, z⁻², z⁻³ are all empty.', String.raw`\frac{\sin z}{z}=\frac{z-z^3/3!+z^5/5!-\cdots}{z}=1-\frac{z^2}{6}+\frac{z^4}{120}-\cdots`),
    f('Lihat nilai f pada lingkaran kompleks |z| = r, bukan hanya sumbu real. Kurvanya mengelilingi 1 dan |f| tidak pernah melebihi sinh r / r. Geser r ke 0: kurvanya menyusut ke titik 1. Fungsinya terbatas dekat 0.', 'Look at the values of f on the complex circle |z| = r, not just the real axis. The curve circles around 1 and |f| never exceeds sinh r / r. Slide r toward 0: the curve shrinks onto the point 1. The function is bounded near 0.', String.raw`\left|\frac{\sin z}{z}\right|\le\frac{\sinh r}{r}\quad(|z|=r)`),
    f('Isi lubang dengan f(0) = 1, limit tadi. Kini deret pangkatnya berlaku juga di 0, jadi f analitik di sana. Teorema Riemann: terbatas di lingkungan terhapus sudah cukup agar singularitas dapat dihapuskan.', 'Fill the hole with f(0) = 1, that limit. Now the power series holds at 0 too, so f is analytic there. Riemann’s theorem: being bounded on a punctured neighborhood is already enough for the singularity to be removable.', String.raw`\lim_{z\to0}\frac{\sin z}{z}=1`),
  ],
  control: { label: b('Jari-jari r', 'Radius r'), min: .2, max: 2, step: .2, initial: 1.4 },
  controlFrom: 1,
  readout: v => { const r = Math.round(v * 10) / 10; return String.raw`r=${r}:\quad\max_{|z|=r}\left|\frac{\sin z}{z}\right|=\frac{\sinh r}{r}\approx${(Math.sinh(r) / r).toFixed(3)}` },
  draw: (k, v, lang) => {
    const t = tr(lang), X = 276, r = Math.round(v * 10) / 10, one = rmp(1, 0)
    const coef = [['z⁻³', ''], ['z⁻²', ''], ['z⁻¹', ''], ['1', '1'], ['z', '0'], ['z²', '−⅙']]
    return <>
      <path d={`M20,${RMo[1]} H262 M${RMo[0]},30 V272`} stroke={C.ln} strokeWidth="1.3" />
      <T x={RMo[0] - 6} y={RMo[1] + 18} size={12} color={C.mu} anchor="end">0</T>
      <path d={`M${one[0]},${RMo[1] - 4} V${RMo[1] + 4}`} stroke={C.ln} strokeWidth="1.5" />
      <T x={one[0] + 8} y={RMo[1] + 18} size={12} color={C.mu} anchor="start">1</T>
      <T x={150} y={30} size={13} color={C.mu}>{t('bidang nilai w = f(z)', 'value plane w = f(z)')}</T>
      <At until={0} frame={k}>
        <circle cx={one[0]} cy={one[1]} r={6} fill={C.bg} stroke={C.a} strokeWidth="2.5" />
        <T x={one[0]} y={one[1] - 16} size={14} weight={600} color={C.r}>f(0) = 0/0 ?</T>
        <T x={X} y={56} anchor="start" size={14} weight={700}>sin z / z =</T>
        <T x={X} y={80} anchor="start" size={14}>1 − z²/6 + z⁴/120 − ⋯</T>
        {coef.map(([lab, val], i) => <g key={i}>
          <rect x={X + 30 * i} y={112} width={26} height={30} rx={4} fill={val ? C.soft : 'none'} stroke={val ? C.a : C.ln} strokeDasharray={val ? undefined : '4 3'} />
          <T x={X + 30 * i + 13} y={132} size={12} weight={600} color={C.a}>{val}</T>
          <T x={X + 30 * i + 13} y={160} size={12} color={val ? C.fg : C.mu}>{lab}</T>
        </g>)}
        <T x={X} y={196} anchor="start" size={14} weight={700} color={C.g}>{t('tanpa pangkat negatif', 'no negative powers')}</T>
      </At>
      <At from={1} frame={k}>
        <path d={sincCurve(r)} fill={C.a} fillOpacity=".08" stroke={C.a} strokeWidth="3" />
        <T x={X} y={56} anchor="start" size={15}>|z| = r = {num(lang, r, 1)}</T>
        <T x={X} y={86} anchor="start" size={14}>{t('maks', 'max')} |f| = sinh r / r</T>
        <T x={X + 16} y={110} anchor="start" size={15} weight={700} color={C.a}>≈ {num(lang, Math.sinh(r) / r, 3)}</T>
        <T x={X} y={146} anchor="start" size={14} color={C.g}>{t('terbatas dekat 0', 'bounded near 0')}</T>
      </At>
      <At from={1} until={1} frame={k}><circle cx={one[0]} cy={one[1]} r={6} fill={C.bg} stroke={C.a} strokeWidth="2.5" /></At>
      <At from={2} frame={k}>
        {[.5, 1].map(q => <path key={q} d={sincCurve(q)} fill="none" stroke={C.a} strokeWidth="1.5" opacity=".45" />)}
        <Dot at={one} color={C.v} r={6} />
        <T x={X} y={190} anchor="start" size={17} weight={700} color={C.v}>f(0) := 1</T>
        <T x={X} y={216} anchor="start" size={14}>{t('f analitik di 0', 'f analytic at 0')}</T>
        <T x={X} y={244} anchor="start" size={13} color={C.mu}>{t('terbatas ⇒ dapat dihapus', 'bounded ⇒ removable')}</T>
      </At>
    </>
  },
}

// ================================================================ singularities:1 poles and pole order
const PBX = [52, 132, 212], PBW = 48, PBB = 252, PBU = 12.5
const poleOrder: Story = {
  title: b('Orde kutub: setengahkan jarak, lihat kelipatannya', 'Pole order: halve the distance, watch the factor'),
  frames: [
    f('f = 1/z² di lingkaran |z| = r: |f| = 1/r². Untuk r = 1, ½, ¼ nilainya 1, 4, 16. Setiap kali r dibagi dua, |f| menjadi 4 kali. 4 = 2², dan pangkat 2 itulah orde kutubnya.', 'f = 1/z² on the circle |z| = r: |f| = 1/r². For r = 1, ½, ¼ the values are 1, 4, 16. Each time r is halved, |f| becomes 4 times larger. 4 = 2², and that exponent 2 is the order of the pole.', String.raw`\left|\frac1{z^2}\right|=\frac1{r^2}:\quad1,\ 4,\ 16`),
    f('Orde m adalah pangkat terkecil yang menjinakkan ledakan: (z − a)ᵐ f tetap terbatas dan tidak nol. Di sini z·f masih meledak, z²·f = 1 pas (batang hijau), dan z³·f sudah menuju 0, terlalu banyak.', 'The order m is the smallest power that tames the blow-up: (z − a)ᵐ f stays bounded and nonzero. Here z·f still blows up, z²·f = 1 is just right (green bars), and z³·f already tends to 0, too much.', String.raw`f=\frac{\phi(z)}{(z-a)^m},\ \phi(a)\ne0\iff(z-a)^mf\to\phi(a)\ne0`),
    f('Syarat φ(a) ≠ 0 penting. sin z / z³ terlihat seperti orde 3, tetapi sin z = z·φ(z) dengan φ(0) = 1. Jadi f = φ/z², orde 2: setengahkan r dan |f| menjadi sekitar 4 kali, bukan 8.', 'The condition φ(a) ≠ 0 matters. sin z / z³ looks like order 3, but sin z = z·φ(z) with φ(0) = 1. So f = φ/z², order 2: halve r and |f| grows about 4 times, not 8.', String.raw`\frac{\sin z}{z^3}=\frac{1-z^2/6+\cdots}{z^2}`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 286, rs = [1, .5, .25]
    const vals = k === 2 ? rs.map(r => Math.sin(r) / r ** 3) : rs.map(r => 1 / (r * r)), col = k === 2 ? C.y : C.r
    return <>
      <path d={`M30,${PBB} H272`} stroke={C.ln} strokeWidth="1.4" />
      {rs.map((_, i) => { const hgt = PBU * vals[i]; return <g key={i}>
        <rect x={PBX[i]} y={PBB - hgt} width={PBW} height={hgt} fill={col} opacity=".85" rx={3} style={{ transition: 'all .45s' }} />
        <T x={PBX[i] + PBW / 2} y={PBB - hgt - 8} size={14} weight={700} color={col}>{num(lang, vals[i], k === 2 ? 2 : 0)}</T>
        <T x={PBX[i] + PBW / 2} y={272} size={13} color={C.mu}>r = {['1', '½', '¼'][i]}</T>
      </g> })}
      {[0, 1].map(i => <T key={i} x={PBX[i] + PBW + 16} y={PBB - PBU * vals[i] - 30} size={13} weight={700} color={col}>×{num(lang, vals[i + 1] / vals[i], k === 2 ? 2 : 0)}</T>)}
      <At from={1} until={1} frame={k}>
        {rs.map((_, i) => <rect key={i} x={PBX[i] + 12} y={PBB - PBU} width={PBW - 24} height={PBU} fill={C.g} />)}
      </At>
      <At until={0} frame={k}>
        <T x={X} y={60} anchor="start" size={17} weight={700}>f = 1/z²</T>
        <T x={X} y={94} anchor="start" size={14}>r → r/2: |f| × 4</T>
        <T x={X} y={128} anchor="start" size={16} weight={700} color={C.r}>4 = 2²: {t('orde 2', 'order 2')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={56} anchor="start" size={14} color={C.mu}>{t('kalikan zᵐ:', 'multiply by zᵐ:')}</T>
        <T x={X} y={88} anchor="start" size={14} color={C.r}>z·f: 1, 2, 4 → ∞</T>
        <T x={X} y={116} anchor="start" size={15} weight={700} color={C.g}>z²·f: 1, 1, 1</T>
        <T x={X} y={144} anchor="start" size={14} color={C.mu}>z³·f: 1, ½, ¼ → 0</T>
        <T x={X} y={184} anchor="start" size={16} weight={700}>{t('orde m = 2', 'order m = 2')}</T>
      </At>
      <At from={2} frame={k}>
        <T x={X} y={56} anchor="start" size={16} weight={700}>f = sin z / z³</T>
        <T x={X} y={88} anchor="start" size={13} color={C.mu}>{t('nilai di z = r', 'values at z = r')}</T>
        <T x={X} y={116} anchor="start" size={14} color={C.y}>×{num(lang, 4.56)}, ×{num(lang, 4.13)} → ×4</T>
        <T x={X} y={140} anchor="start" size={14} color={C.r}>{t('bukan ×8', 'not ×8')}</T>
        <T x={X} y={176} anchor="start" size={13}>sin z = z·φ(z), φ(0) = 1</T>
        <T x={X} y={206} anchor="start" size={15} weight={700} color={C.y}>f = φ/z²: {t('orde 2', 'order 2')}</T>
      </At>
    </>
  },
}

// ================================================================ singularities:2 Casorati–Weierstrass
const CZo: P = [120, 150], CWw: P = [355, 150]
const czp = (z: Z): P => [CZo[0] + 1000 * z[0], CZo[1] - 1000 * z[1]], cwq = (w: Z): P => [CWw[0] + 45 * w[0], CWw[1] - 45 * w[1]]
const preimage = (logw: Z, kk: number): Z => zdiv([1, 0], [logw[0], logw[1] + 2 * PI * kk])
const CW_TARGETS: { w: Z; log: Z; k: number; col: string; lab: string }[] = [
  { w: [2, 0], log: [Math.LN2, 0], k: 2, col: C.g, lab: '2' },
  { w: [-1, 0], log: [0, PI], k: -3, col: C.y, lab: '−1' },
  { w: [0, 1.5], log: [Math.log(1.5), PI / 2], k: -2, col: C.v, lab: '1,5i' },
]
const casorati: Story = {
  title: b('Casorati–Weierstrass: daerah kecil, nilai di mana-mana', 'Casorati–Weierstrass: a tiny region, values everywhere'),
  frames: [
    f('e^(1/z) punya singularitas esensial di 0. Ambil lingkungan terhapus yang kecil, 0 < |z| < 0,1 (gambar kiri diperbesar). Pertanyaannya: ke mana saja nilai f dari daerah kecil ini jatuh?', 'e^(1/z) has an essential singularity at 0. Take a small punctured neighborhood, 0 < |z| < 0.1 (the left picture is magnified). The question: where do the values of f from this small region land?', String.raw`f(z)=e^{1/z},\quad0<|z|<0.1`),
    f('Target 2: e^(1/z) = 2 bila 1/z = ln 2 + 2πik. Untuk k = 2, z ≈ 0,004 − 0,079i, di dalam cakram kecil, dan nilainya tepat 2. Dengan k lebih besar, z makin dekat ke 0.', 'Target 2: e^(1/z) = 2 when 1/z = ln 2 + 2πik. For k = 2, z ≈ 0.004 − 0.079i, inside the small disc, and the value is exactly 2. With larger k, z gets even closer to 0.', String.raw`z_k=\frac1{\ln2+2\pi ik},\quad e^{1/z_k}=2`),
    f('Target lain juga tercapai: −1 dari z = i/(5π) ≈ 0,064i dan 1,5i dari z ≈ 0,003 + 0,091i. Casorati–Weierstrass: untuk setiap target dan setiap ε, nilai f dari 0 < |z| < ε masuk ke dekat target itu. Nilainya rapat di C.', 'Other targets are reached too: −1 from z = i/(5π) ≈ 0.064i and 1.5i from z ≈ 0.003 + 0.091i. Casorati–Weierstrass: for every target and every ε, values of f from 0 < |z| < ε come close to that target. The values are dense in C.', String.raw`\overline{f(\{0<|z|<\varepsilon\})}=\mathbb C`),
    f('Bandingkan dengan kutub 1/z: dari 0 < |z| < 0,1 nilainya selalu |w| > 10, jauh dari 2, −1 dan 1,5i. Inilah alasan teorema: jika satu cakram target terhindari, 1/(f − w₀) terbatas, sehingga singularitasnya kutub atau dapat dihapus, bukan esensial.', 'Compare with the pole 1/z: from 0 < |z| < 0.1 its values always have |w| > 10, far from 2, −1 and 1.5i. This is the reason behind the theorem: if a target disc were avoided, 1/(f − w₀) would be bounded, making the singularity a pole or removable, not essential.', String.raw`0<|z|<0.1\implies\left|\frac1z\right|>10`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang)
    return <>
      <path d="M240,24 V270" stroke={C.faint} />
      <T x={CZo[0]} y={26} size={13} color={C.mu}>{t('bidang z (diperbesar)', 'z-plane (magnified)')}</T>
      <T x={CWw[0]} y={26} size={13} color={C.mu}>{t('bidang w', 'w-plane')}</T>
      <circle cx={CZo[0]} cy={CZo[1]} r={100} fill={C.soft} fillOpacity=".6" stroke={C.a} strokeWidth="2.5" strokeDasharray="6 4" />
      <path d={`M14,${CZo[1]} H230 M${CZo[0]},44 V256`} stroke={C.faint} strokeWidth="1.2" />
      <circle cx={CZo[0]} cy={CZo[1]} r={4} fill={C.bg} stroke={C.r} strokeWidth="2" />
      <T x={CZo[0] + 72} y={CZo[1] + 86} size={13} color={C.a} anchor="start">0,1</T>
      <path d={`M250,${CWw[1]} H462 M${CWw[0]},44 V256`} stroke={C.ln} strokeWidth="1.3" />
      {CW_TARGETS.map((g, i) => { const p = cwq(g.w), z = preimage(g.log, g.k), q = czp(z), from = i === 0 ? 0 : 2; return <g key={i}>
        <At from={from} frame={k}>
          <circle cx={p[0]} cy={p[1]} r={14} fill="none" stroke={g.col} strokeWidth="2" strokeDasharray="4 3" />
          <T x={p[0] + (i === 1 ? -4 : 18)} y={p[1] + (i === 1 ? 30 : 5)} anchor={i === 1 ? 'middle' : 'start'} size={14} weight={700} color={g.col}>{g.lab}</T>
        </At>
        <At from={Math.max(1, from)} until={2} frame={k}>
          <Dot at={q} color={g.col} r={5.5} />
          <T x={q[0] + 12} y={q[1] + 5} anchor="start" size={13} weight={600} color={g.col}>→ {g.lab}</T>
          <Dot at={p} color={g.col} r={5} />
        </At>
        <At from={3} frame={k}><Cross at={p} color={C.r} s={6} /></At>
      </g> })}
      <At until={0} frame={k}><T x={CWw[0]} y={284} size={13} color={C.mu}>{t('target: cakram kecil di sekitar 2', 'target: a small disc around 2')}</T></At>
      <At from={1} until={1} frame={k}><T x={CWw[0]} y={284} size={13} weight={600} color={C.g}>e^(1/z) = 2 {t('tepat', 'exactly')}</T></At>
      <At from={2} until={2} frame={k}><T x={CWw[0]} y={284} size={13} weight={600} color={C.v}>{t('setiap target tercapai', 'every target is reached')}</T></At>
      <At from={3} frame={k}>
        <T x={CZo[0]} y={284} size={14} weight={700} color={C.r}>f = 1/z</T>
        <T x={CWw[0]} y={276} size={13} weight={600} color={C.r}>|w| &gt; 10: {t('di luar gambar', 'off the picture')}</T>
        {[[462, 150, 470, 150], [355, 44, 355, 30], [355, 256, 355, 270]].map(([x1, y1, x2, y2], i) => <Arrow key={i} from={[x1 - (x2 - x1) * 2, y1 - (y2 - y1) * 1]} to={[x2, y2]} color={C.r} width={2} head={6} />)}
      </At>
    </>
  },
}

// ================================================================ singularities:3 great Picard
const PZo: P = [125, 50], pzp = (z: Z): P => [PZo[0] + 1200 * z[0], PZo[1] - 1200 * z[1]]
const picard: Story = {
  title: b('Picard besar: nilai 2 dicapai tak hingga kali', 'Great Picard: the value 2 is hit infinitely often'),
  frames: [
    f('Picard besar untuk e^(1/z): ambil target 2. Persamaan e^(1/z) = 2 dipenuhi oleh z_k = 1/(ln 2 + 2πik) untuk setiap bilangan bulat k. Geser k: |z_k| ≈ 1/(2πk) menyusut ke 0, dan setiap z_k memberi tepat 2. Nilai 2 dicapai tak hingga kali dekat 0.', 'Great Picard for e^(1/z): take the target 2. The equation e^(1/z) = 2 is solved by z_k = 1/(ln 2 + 2πik) for every integer k. Move k: |z_k| ≈ 1/(2πk) shrinks to 0, and every z_k gives exactly 2. The value 2 is attained infinitely often near 0.', String.raw`z_k=\frac1{\ln2+2\pi ik},\quad e^{1/z_k}=2,\quad z_k\to0`),
    f('Target lain berperilaku sama. Untuk −1: 1/z = iπ(2k + 1), jadi z_k = −i/((2k + 1)π), titik kuning di sumbu imajiner. Setiap w ≠ 0 punya log w, jadi z_k = 1/(log w + 2πik) selalu ada.', 'Other targets behave the same way. For −1: 1/z = iπ(2k + 1), so z_k = −i/((2k + 1)π), the amber dots on the imaginary axis. Every w ≠ 0 has a log w, so z_k = 1/(log w + 2πik) always exists.', String.raw`e^{1/z}=-1\iff z_k=\frac{-i}{(2k+1)\pi}`),
    f('Hanya w = 0 yang tidak pernah dicapai, karena e^ζ ≠ 0 untuk setiap ζ. Teorema Picard besar: dekat singularitas esensial, setiap nilai kecuali paling banyak satu dicapai tak hingga kali. Di sini pengecualiannya 0. Ini lebih kuat dari Casorati–Weierstrass, yang hanya menjamin mendekati.', 'Only w = 0 is never attained, because e^ζ ≠ 0 for every ζ. The great Picard theorem: near an essential singularity, every value with at most one exception is attained infinitely often. Here the exception is 0. This is stronger than Casorati–Weierstrass, which only promises getting close.', String.raw`e^{1/z}\ne0\quad(z\ne0)`),
  ],
  control: { label: b('Indeks k', 'Index k'), min: 1, max: 8, step: 1, initial: 1 },
  readout: k => String.raw`k=${k}:\quad|z_k|=\frac{1}{|\ln2+${2 * k}\pi i|}\approx${(1 / Math.hypot(Math.LN2, 2 * PI * k)).toFixed(4)}`,
  draw: (fr, v, lang) => {
    const t = tr(lang), X = 272, k = Math.round(v)
    const A = (j: number) => zdiv([1, 0], [Math.LN2, 2 * PI * j]), B = (j: number): Z => [0, -1 / ((2 * j + 1) * PI)]
    const ks = [1, 2, 3, 4, 5, 6, 7, 8], za = A(k), zb = B(k)
    return <>
      <path d={`M20,${PZo[1]} H250 M${PZo[0]},30 V285`} stroke={C.ln} strokeWidth="1.3" />
      <circle cx={PZo[0]} cy={PZo[1]} r={5} fill={C.bg} stroke={C.r} strokeWidth="2.5" />
      <T x={PZo[0] - 10} y={PZo[1] - 8} anchor="end" size={13} color={C.r}>0</T>
      <T x={248} y={PZo[1] - 8} anchor="end" size={12} color={C.mu}>{t('bidang z, diperbesar', 'z-plane, magnified')}</T>
      <path d={`M${PZo[0] + 60},${PZo[1] + 4} V${PZo[1] - 4}`} stroke={C.ln} /><T x={PZo[0] + 60} y={PZo[1] + 18} size={11} color={C.mu}>{num(lang, .05)}</T>
      {ks.map(j => <Dot key={j} at={pzp(A(j))} color={C.g} r={j === k ? 6 : 3.5} hollow={j > k} />)}
      <T x={pzp(za)[0] + 12} y={pzp(za)[1] + 5} anchor="start" size={14} weight={700} color={C.g}>z{['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'][k - 1]}</T>
      <At from={1} frame={fr}>
        {ks.map(j => <Dot key={j} at={pzp(B(j))} color={C.y} r={j === k ? 6 : 3.5} hollow={j > k} />)}
        <T x={PZo[0] - 12} y={pzp(zb)[1] + 5} anchor="end" size={14} weight={700} color={C.y}>−1</T>
      </At>
      <At until={0} frame={fr}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.g}>e^(1/z) = 2</T>
        <T x={X} y={92} anchor="start" size={14}>z_k = 1/(ln 2 + 2πik)</T>
        <T x={X} y={126} anchor="start" size={15}>k = {k}: |z_k| ≈ {num(lang, Math.hypot(...za), 4)}</T>
        <T x={X} y={160} anchor="start" size={13} color={C.mu}>{t('k → ∞: z_k → 0', 'k → ∞: z_k → 0')}</T>
        <T x={X} y={182} anchor="start" size={13} color={C.mu}>{t('selalu nilai 2', 'always the value 2')}</T>
      </At>
      <At from={1} until={1} frame={fr}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.y}>e^(1/z) = −1</T>
        <T x={X} y={92} anchor="start" size={14}>z_k = −i/((2k + 1)π)</T>
        <T x={X} y={126} anchor="start" size={15}>k = {k}: |z_k| ≈ {num(lang, -zb[1], 4)}</T>
        <T x={X} y={166} anchor="start" size={13} color={C.mu}>{t('setiap w ≠ 0: sama', 'every w ≠ 0: the same')}</T>
      </At>
      <At from={2} frame={fr}>
        <T x={X} y={60} anchor="start" size={17} weight={700} color={C.r}>e^(1/z) = 0 ?</T>
        <T x={X} y={92} anchor="start" size={14}>e^ζ ≠ 0 {t('untuk semua', 'for every')} ζ</T>
        <T x={X} y={128} anchor="start" size={15} weight={700} color={C.r}>{t('0 tidak pernah dicapai', '0 is never attained')}</T>
        <T x={X} y={162} anchor="start" size={13} color={C.mu}>{t('satu-satunya', 'the one')}</T>
        <T x={X} y={182} anchor="start" size={13} color={C.mu}>{t('pengecualian', 'exception')}</T>
      </At>
    </>
  },
}

// ================================================================ residue:0 simple pole p/q′
const QO: P = [140, 165], qp = (x: number, y: number): P => [QO[0] + 38 * x, QO[1] - 18 * y]
const simpleRes: Story = {
  title: b('Residu kutub sederhana: p(a)/q′(a)', 'Simple-pole residue: p(a)/q′(a)'),
  frames: [
    f('f(z) = (z + 1)/(z² − 4) = p/q. Penyebut q = z² − 4 nol di ±2, dan q′(z) = 2z tidak nol di sana: q′(2) = 4, q′(−2) = −4. Jadi keduanya kutub sederhana. Gambar adalah grafik q di sumbu real.', 'f(z) = (z + 1)/(z² − 4) = p/q. The denominator q = z² − 4 vanishes at ±2, and q′(z) = 2z is not zero there: q′(2) = 4, q′(−2) = −4. So both are simple poles. The picture is the graph of q on the real axis.', String.raw`f=\frac pq,\quad q(\pm2)=0,\ q'(\pm2)=\pm4\ne0`),
    f('Dekat a = 2, q hampir sama dengan garis singgungnya (hijau): q(z) ≈ q′(2)(z − 2) = 4(z − 2). Faktor (z − 2) itulah penyebab ledakan.', 'Near a = 2, q is almost its tangent line (green): q(z) ≈ q′(2)(z − 2) = 4(z − 2). That factor (z − 2) is what causes the blow-up.', String.raw`q(z)=q'(2)(z-2)+(z-2)^2=4(z-2)+(z-2)^2`),
    f('Kalikan dengan z − 2 dan faktor itu terhapus: (z − 2)f → p(2)/q′(2) = 3/4. Di −2 dengan cara sama: p(−2)/q′(−2) = (−1)/(−4) = 1/4.', 'Multiply by z − 2 and that factor cancels: (z − 2)f → p(2)/q′(2) = 3/4. At −2 the same way: p(−2)/q′(−2) = (−1)/(−4) = 1/4.', String.raw`\operatorname{Res}_2f=\frac{p(2)}{q'(2)}=\frac34,\qquad\operatorname{Res}_{-2}f=\frac{-1}{-4}=\frac14`),
    f('Perhatikan pembilangnya. Jika p = z − 2, maka p(2) = 0 dan rumusnya memberi residu 0. Memang f = (z − 2)/(z² − 4) = 1/(z + 2) dekat 2: singularitasnya dapat dihapuskan, bukan kutub.', 'Watch the numerator. If p = z − 2, then p(2) = 0 and the formula gives residue 0. Indeed f = (z − 2)/(z² − 4) = 1/(z + 2) near 2: the singularity is removable, not a pole.', String.raw`\frac{z-2}{z^2-4}=\frac1{z+2},\quad\operatorname{Res}_2=\frac04=0`),
  ],
  draw: (k, _v, lang) => {
    const t = tr(lang), X = 280, a2 = qp(2, 0), am2 = qp(-2, 0)
    return <>
      <path d={`M20,${QO[1]} H262 M${QO[0]},40 V262`} stroke={C.ln} strokeWidth="1.3" />
      <Clip id="sres" x={18} y={40} w={246} h={222}>
        <path d={fn(x => qp(x, x * x - 4), -3.2, 3.2)} fill="none" stroke={C.a} strokeWidth="3" />
        <At from={1} until={1} frame={k}><path d={pl([qp(1, -4), qp(3, 4)])} stroke={C.g} strokeWidth="2.5" strokeDasharray="6 4" /></At>
      </Clip>
      <T x={qp(-3, 5)[0] + 6} y={52} anchor="start" size={13} color={C.a}>q(x) = x² − 4</T>
      <T x={am2[0]} y={QO[1] + 24} size={13} color={C.mu}>−2</T>
      <T x={a2[0]} y={QO[1] + 24} size={13} color={C.mu}>2</T>
      <Cross at={am2} color={C.r} />
      <At until={2} frame={k}><Cross at={a2} color={C.r} /></At>
      <At from={1} until={1} frame={k}><circle cx={a2[0]} cy={a2[1]} r={26} fill="none" stroke={C.g} strokeWidth="1.5" /></At>
      <At from={3} frame={k}><circle cx={a2[0]} cy={a2[1]} r={7} fill={C.bg} stroke={C.g} strokeWidth="3" /></At>
      <At until={0} frame={k}>
        <T x={X} y={52} anchor="start" size={15} weight={700}>f = (z + 1)/(z² − 4)</T>
        <T x={X} y={84} anchor="start" size={14}>p = z + 1</T>
        <T x={X} y={108} anchor="start" size={14}>q = (z − 2)(z + 2)</T>
        <T x={X} y={142} anchor="start" size={14}>q′ = 2z</T>
        <T x={X} y={166} anchor="start" size={14} color={C.r}>q′(2) = 4, q′(−2) = −4</T>
        <T x={X} y={200} anchor="start" size={14} weight={700} color={C.r}>{t('2 kutub sederhana', '2 simple poles')}</T>
      </At>
      <At from={1} until={1} frame={k}>
        <T x={X} y={60} anchor="start" size={14} color={C.mu}>{t('dekat a = 2:', 'near a = 2:')}</T>
        <T x={X} y={90} anchor="start" size={15} color={C.g}>q(z) ≈ q′(2)(z − 2)</T>
        <T x={X + 12} y={116} anchor="start" size={15} color={C.g}>= 4(z − 2)</T>
      </At>
      <At from={2} until={2} frame={k}>
        <T x={X} y={56} anchor="start" size={14}>(z − 2)·f → p(2)/q′(2)</T>
        <T x={X + 12} y={84} anchor="start" size={17} weight={700} color={C.v}>= 3/4</T>
        <T x={X} y={126} anchor="start" size={14}>a = −2: p(−2)/q′(−2)</T>
        <T x={X + 12} y={154} anchor="start" size={17} weight={700} color={C.v}>= (−1)/(−4) = 1/4</T>
      </At>
      <At from={3} frame={k}>
        <T x={X} y={56} anchor="start" size={15} weight={700}>p = z − 2</T>
        <T x={X} y={88} anchor="start" size={14} color={C.g}>p(2) = 0 ⇒ Res = 0</T>
        <T x={X} y={120} anchor="start" size={14}>f = 1/(z + 2) {t('dekat 2', 'near 2')}</T>
        <T x={X} y={152} anchor="start" size={14} weight={700} color={C.g}>{t('dapat dihapuskan', 'removable')}</T>
      </At>
    </>
  },
}

// ================================================================ residue:1 higher-order pole
const colX = (e: number) => 240 + 48 * e, R1 = 70, R2 = 180, BOX = 40
const EXP_COEF = ['1', '1', '1/2', '1/6', '1/24']
const higherRes: Story = {
  title: b('Kutub orde m: koefisien ke-(m − 1) pindah ke z⁻¹', 'Pole of order m: the (m − 1)th coefficient moves to z⁻¹'),
  frames: [
    f('Kembangkan pembilang regular φ(z) = eᶻ di 0: koefisiennya 1, 1, 1/2, 1/6, 1/24, … di pangkat 0, 1, 2, 3, 4.', 'Expand the regular numerator φ(z) = eᶻ at 0: its coefficients 1, 1, 1/2, 1/6, 1/24, … sit at powers 0, 1, 2, 3, 4.', String.raw`e^z=1+z+\frac{z^2}{2!}+\frac{z^3}{3!}+\cdots`),
    f('Membagi dengan z² menggeser setiap koefisien dua kolom ke kiri. Koefisien suku linear, 1, mendarat di kolom z⁻¹. Jadi residu eᶻ/z² di 0 adalah 1, walaupun kutubnya berorde 2.', 'Dividing by z² shifts every coefficient two columns to the left. The linear-term coefficient, 1, lands in the z⁻¹ column. So the residue of eᶻ/z² at 0 is 1, even though the pole has order 2.', String.raw`\frac{e^z}{z^2}=\frac1{z^2}+\frac1z+\frac12+\frac z6+\cdots`),
    f('Umumnya, membagi dengan zᵐ membawa koefisien ke-(m − 1) ke kolom z⁻¹. Koefisien itu φ⁽ᵐ⁻¹⁾(0)/(m − 1)!. Geser m: untuk eᶻ/z³ residunya 1/2, untuk eᶻ/z⁴ residunya 1/6. Orde kutub bukan residu.', 'In general, dividing by zᵐ brings the (m − 1)th coefficient into the z⁻¹ column. That coefficient is φ⁽ᵐ⁻¹⁾(0)/(m − 1)!. Move m: for eᶻ/z³ the residue is 1/2, for eᶻ/z⁴ it is 1/6. The pole order is not the residue.', String.raw`\operatorname{Res}_a\frac{\phi(z)}{(z-a)^m}=\frac{\phi^{(m-1)}(a)}{(m-1)!}`),
  ],
  control: { label: b('Orde kutub m', 'Pole order m'), min: 1, max: 4, step: 1, initial: 3 },
  controlFrom: 2,
  readout: m => String.raw`m=${m}:\quad\operatorname{Res}_0\frac{e^z}{z^{${m}}}=\frac1{(${m}-1)!}=${['1', '1', '\\tfrac12', '\\tfrac16'][m - 1]}`,
  draw: (k, v, lang) => {
    const t = tr(lang), m = k === 1 ? 2 : Math.round(v)
    const box = (e: number, y: number, label: string, hot: boolean) => <g style={{ transition: 'all .45s' }}>
      <rect x={colX(e) - BOX / 2} y={y} width={BOX} height={34} rx={5} fill={hot ? C.v : C.soft} stroke={hot ? C.v : C.a} strokeWidth="1.5" style={{ transition: 'all .45s' }} />
      <T x={colX(e)} y={y + 22} size={13} weight={700} halo={false} color={hot ? C.bg : C.fg}>{label}</T>
    </g>
    return <>
      {Array.from({ length: 9 }, (_, j) => j - 4).map(e => <T key={e} x={colX(e)} y={44} size={13} color={e === -1 ? C.v : C.mu}>{e === 0 ? '1' : e === 1 ? 'z' : `z${sup(e)}`}</T>)}
      <At from={1} frame={k}>
        <rect x={colX(-1) - 25} y={28} width={50} height={204} rx={6} fill={C.v} fillOpacity=".08" stroke={C.v} strokeWidth="1.5" />
        <T x={colX(-1)} y={250} size={14} weight={700} color={C.v}>Res</T>
      </At>
      <T x={22} y={R1 + 22} anchor="start" size={15} weight={700} color={C.a}>eᶻ:</T>
      {EXP_COEF.map((c, i) => <g key={i}>{box(i, R1, c, false)}</g>)}
      <At from={1} frame={k}>
        {EXP_COEF.map((c, i) => <g key={i}>
          <Arrow from={[colX(i), R1 + 38]} to={[colX(i - m), R2 - 4]} color={C.mu} width={1.5} head={7} />
          {box(i - m, R2, c, i - m === -1)}
        </g>)}
        <T x={466} y={R2 + 22} anchor="end" size={15} weight={700} color={C.a}>÷ z{sup(m)}</T>
        <T x={240} y={282} size={15} weight={700} color={C.v}>{t('orde', 'order')} {m}: Res = 1/({m} − 1)! = {EXP_COEF[m - 1]}</T>
      </At>
      <At until={0} frame={k}><T x={240} y={180} size={14} color={C.mu}>e<tspan dy={-6} fontSize="0.72em">z</tspan><tspan dy={6}> = 1 + z + z²/2! + z³/3! + ⋯</tspan></T></At>
    </>
  },
}

/** Concept-view stories, keyed "<VisualKind>:<index in the topic's concept list>". */
export const CONCEPTS: Record<string, Story> = {
  'harmonic:0': harmonicConj, 'harmonic:1': zeroDeriv,
  'exp:0': expPeriod, 'exp:1': expLaw,
  'branch:0': branchPow, 'branch:1': logProduct,
  'trig:0': trigZeros, 'trig:1': sineMag,
  'integral:0': mlBound, 'integral:1': orientation, 'integral:2': powerCircle,
  'primitive:0': goursat, 'primitive:1': holes,
  'cauchy:0': cauchyDeriv, 'cauchy:1': liouville, 'cauchy:2': fta,
  'series:0': taylorRadius, 'series:1': laurent,
  'singularities:0': removable, 'singularities:1': poleOrder, 'singularities:2': casorati, 'singularities:3': picard,
  'residue:0': simpleRes, 'residue:1': higherRes,
}
