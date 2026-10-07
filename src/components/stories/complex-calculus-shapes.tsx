import type { CalculusKind } from '../../content/complex-calculus-topics'
import { C, T, Dot, Arrow, Grid, At, plane, fn, arc, type P, type Lang } from './kit'

type Props = { kind: CalculusKind; frame: number; value: number; lang: Lang }

function CircleDirection({ center, radius, color = C.a, clockwise = false }: { center: P; radius: number; color?: string; clockwise?: boolean }) {
  const sign = clockwise ? -1 : 1
  return <Arrow from={[center[0] + sign * 15, center[1] - radius]} to={[center[0] - sign * 15, center[1] - radius]} color={color} head={8} />
}

function RealParameter({ frame, value, lang }: Omit<Props, 'kind'>) {
  const t = value * Math.PI, p = plane([125, 175], 80), z = p(Math.cos(t), Math.sin(t))
  const graph = (q: number, y: number): P => [285 + 150 * q / Math.PI, 163 - 55 * y]
  return <g>
    <T x={125} y={30} size={17}>{lang === 'id' ? 'Lintasan kompleks z(t)' : 'Complex path z(t)'}</T>
    <T x={355} y={30} size={17}>{lang === 'id' ? 'Dua komponen real' : 'Two real components'}</T>
    <Grid map={p} x={[-1.2, 1.2]} y={[-.25, 1.4]} />
    <path d={arc([125, 175], 80, 0, Math.PI)} stroke={C.a} strokeWidth={4} fill="none" />
    <Dot at={p(1, 0)} color={C.mu} r={4} /><Dot at={p(-1, 0)} color={C.mu} r={4} />
    <T x={212} y={198} size={13}>1</T><T x={39} y={198} size={13}>−1</T>
    <Arrow from={[125, 175]} to={z} color={C.a} width={2} /><Dot at={z} color={C.a} />
    <At frame={frame} from={1}><Arrow from={z} to={[z[0] - 35 * Math.sin(t), z[1] - 35 * Math.cos(t)]} color={C.g} /><T x={125} y={222} color={C.g} size={14}>z′(t) = i eⁱᵗ</T></At>
    <path d="M285,88 V228 M275,163 H446" stroke={C.ln} fill="none" />
    <path d={fn(q => graph(q, Math.cos(q)), 0, Math.PI)} stroke={C.v} strokeWidth={2.5} fill="none" />
    <path d={fn(q => graph(q, Math.sin(q)), 0, Math.PI)} stroke={C.y} strokeWidth={2.5} fill="none" />
    <path d={`M${graph(t, 0)[0]},87 V230`} stroke={C.mu} strokeDasharray="4 4" />
    <Dot at={graph(t, Math.cos(t))} color={C.v} r={5} /><Dot at={graph(t, Math.sin(t))} color={C.y} r={5} />
    <T x={305} y={62} size={13} color={C.v}>cos t</T><T x={398} y={62} size={13} color={C.y}>sin t</T>
    <T x={284} y={245} size={13}>0</T><T x={438} y={245} size={13}>π</T>
    <T x={240} y={283} size={15} color={frame >= 2 ? C.g : C.mu}>{frame >= 2 ? 'f(z(t)) dz = f(z(t)) z′(t) dt' : 'z(t) = cos t + i sin t'}</T>
  </g>
}

function Branches({ frame, value, lang }: Omit<Props, 'kind'>) {
  const t = value * Math.PI, left: P = [120, 156], right: P = [354, 156]
  const p = plane(left, 72), w = plane(right, 72), z = p(Math.cos(t), Math.sin(t)), root = w(Math.cos(t / 2), Math.sin(t / 2))
  return <g>
    <T x={120} y={30} size={16}>z = eⁱᵗ</T><T x={354} y={30} size={16}>g(z) = eⁱᵗᐟ²</T>
    <Grid map={p} x={[-1.3, 1.3]} y={[-1.3, 1.3]} /><Grid map={w} x={[-1.3, 1.3]} y={[-1.3, 1.3]} />
    <path d="M26,156 H120" stroke={C.r} strokeWidth={4} strokeDasharray="7 4" /><Dot at={left} color={C.r} hollow />
    <path d={arc(left, 72, 0, Math.PI / 2)} stroke={C.a} strokeWidth={4} fill="none" />
    <Arrow from={left} to={z} color={C.a} /><Dot at={z} color={C.a} />
    <T x={64} y={255} color={C.r} size={13}>{lang === 'id' ? 'celah Log' : 'Log cut'}</T>
    <path d={arc(left, 28, 0, t || .001)} stroke={C.y} strokeWidth={2} fill="none" /><T x={157} y={144} size={13} color={C.y}>t</T>
    <At frame={frame} from={1}>
      <path d={arc(right, 72, 0, Math.PI / 4)} stroke={C.g} strokeWidth={4} fill="none" />
      <Arrow from={right} to={root} color={C.g} /><Dot at={root} color={C.g} />
      <Dot at={w(-Math.cos(t / 2), -Math.sin(t / 2))} color={C.r} />
      <T x={354} y={251} color={C.r} size={13}>{lang === 'id' ? 'titik merah: −g(z)' : 'red point: −g(z)'}</T>
      <T x={392} y={144} color={C.g} size={13}>t/2</T>
    </At>
    <T x={240} y={283} size={14}>{frame >= 2 ? 'I(0,t) = ⅔ (e³ⁱᵗᐟ² − 1)' : (lang === 'id' ? 'Satu pilihan akar pada seluruh busur' : 'One root choice along the entire arc')}</T>
  </g>
}

function Domains({ frame, lang }: Omit<Props, 'kind'>) {
  const left: P = [120, 155], right: P = [354, 155], r = 73 / (frame + 1)
  return <g>
    <T x={120} y={29} size={17}>{lang === 'id' ? 'Cakram: tanpa lubang' : 'Disk: no hole'}</T>
    <T x={354} y={29} size={17}>{lang === 'id' ? 'Anulus: ada lubang' : 'Annulus: a hole'}</T>
    <circle cx={120} cy={155} r={99} fill={C.soft} stroke={C.mu} strokeDasharray="5 5" />
    <circle cx={120} cy={155} r={r} stroke={C.g} strokeWidth={3} fill="none" /><CircleDirection center={left} radius={r} color={C.g} />
    <Dot at={left} color={C.g} r={3} />
    <circle cx={354} cy={155} r={99} fill={C.soft} stroke={C.mu} strokeDasharray="5 5" />
    <circle cx={354} cy={155} r={25} fill={C.bg} stroke={C.r} strokeWidth={2} /><T x={354} y={160} size={13} color={C.r}>0</T>
    <circle cx={354} cy={155} r={73} stroke={C.a} strokeWidth={3} fill="none" /><CircleDirection center={right} radius={73} />
    <At frame={frame} from={2}><circle cx={354} cy={155} r={46} stroke={C.y} strokeWidth={3} fill="none" /><CircleDirection center={right} radius={46} color={C.y} clockwise={frame >= 3} /></At>
    <T x={120} y={270} size={14} color={C.g}>{lang === 'id' ? 'loop bisa dikontraksi' : 'loop can contract'}</T>
    <T x={354} y={270} size={14} color={C.r}>{frame >= 3 ? '∮∂A dz/z = 0' : '∮ dz/z = 2πi ≠ 0'}</T>
    <T x={240} y={294} size={12}>{frame >= 3 ? (lang === 'id' ? 'Batas anulus: luar CCW + dalam CW → 0' : 'Annular boundary: outer CCW + inner CW → 0') : (lang === 'id' ? 'Deformasi harus tetap di domain analitik' : 'Deformation must stay in the analytic domain')}</T>
  </g>
}

function Maximum({ frame, lang }: Omit<Props, 'kind'>) {
  const p = plane([130, 155], 90), a = .55 + frame * .09, z = p(a, .2), next = p(a + .12, .2)
  return <g>
    <T x={240} y={30} size={18}>{lang === 'id' ? 'f(z) = z pada cakram unit' : 'f(z) = z on the unit disk'}</T>
    {[.25, .5, .75, 1].map(r => <g key={r}><circle cx={130} cy={155} r={90 * r} fill="none" stroke={r === 1 ? C.g : C.ln} strokeWidth={r === 1 ? 3 : 1.5} /><T x={130} y={155 + 90 * r - 4} size={11} color={C.mu}>{r}</T></g>)}
    <Arrow from={p(0, 0)} to={z} color={C.a} width={2} /><Dot at={z} color={C.a} />
    <At frame={frame} from={1}><Arrow from={z} to={next} color={C.y} width={3} /><Dot at={next} color={C.y} r={4} /></At>
    <T x={130} y={274} size={14} color={C.g}>|z| = 1</T>
    <path d="M278,239 H446 M290,247 V72" stroke={C.ln} fill="none" />
    <path d="M290,239 L435,94" stroke={C.a} strokeWidth={3} /><Dot at={[435, 94]} color={C.g} />
    <T x={440} y={257} size={13}>r = 1</T><T x={296} y={59} size={13} anchor="start">|f| = r</T>
    <T x={362} y={179} size={13}>{lang === 'id' ? 'terus meningkat' : 'keeps increasing'}</T>
    <T x={362} y={209} size={13} color={C.g}>{lang === 'id' ? 'maksimum di batas' : 'maximum at boundary'}</T>
    <At frame={frame} from={3}><T x={360} y={280} size={12}>{lang === 'id' ? 'kontinu pada cakram tertutup' : 'continuous on the closed disk'}</T></At>
  </g>
}

function PowerSeries({ frame, value, lang }: Omit<Props, 'kind'>) {
  const n = Math.round(value), error = Math.pow(.7, n + 1) / .3
  return <g>
    <T x={240} y={30} size={17}>{lang === 'id' ? 'Σ zⁿ: satu batas galat untuk disk' : 'Σ zⁿ: one error bound for the disk'}</T>
    <circle cx={125} cy={155} r={90} fill="none" stroke={C.r} strokeWidth={2} strokeDasharray="6 4" />
    <circle cx={125} cy={155} r={63} fill={C.soft} stroke={C.a} strokeWidth={3} />
    <Dot at={[125, 155]} color={C.mu} r={3} /><Arrow from={[125, 155]} to={[188, 155]} color={C.a} />
    <T x={154} y={144} size={13} color={C.a}>r = 0.7</T><T x={125} y={258} size={14} color={C.r}>R = 1</T>
    {frame === 0 ? <g>
      <T x={356} y={75} size={14}>{lang === 'id' ? 'Contoh radius dari koefisien' : 'Coefficient-radius examples'}</T>
      <T x={356} y={116} size={17}>aₙ = 1/n → R = 1</T>
      <T x={356} y={155} size={17} color={C.r}>aₙ = n! → R = 0</T>
      <T x={356} y={194} size={17} color={C.g}>aₙ = 1/n! → R = ∞</T>
      <T x={356} y={235} size={12}>{lang === 'id' ? 'Lingkaran batas: uji tersendiri' : 'Boundary circle: separate tests'}</T>
    </g> : <g>
    <T x={356} y={66} size={14}>{lang === 'id' ? 'Batas rᴺ⁺¹ / (1 − r)' : 'Bound rᴺ⁺¹ / (1 − r)'}</T>
    <path d="M276,216 H450 M286,216 V87" stroke={C.ln} fill="none" />
    {Array.from({ length: 13 }, (_, k) => { const h = Math.pow(.7, k + 1) / .3 * 48; return <rect key={k} x={291 + k * 11} y={216 - h} width={7} height={h} fill={k === n ? C.y : C.mu} opacity={k === n ? 1 : .35} /> })}
    <T x={295} y={235} size={12}>0</T><T x={428} y={235} size={12}>12</T><T x={445} y={253} size={12}>N</T>
    <T x={355} y={93} size={14} color={C.y}>N = {n}, ≤ {error.toFixed(4)}</T>
    </g>}
    <T x={240} y={282} size={13}>{frame >= 3 ? (lang === 'id' ? 'Di interior: integral dan turunan per suku sah' : 'Inside: termwise integrals and derivatives are valid') : (lang === 'id' ? 'Batas tidak bergantung titik z pada disk kecil' : 'The bound is independent of z in the smaller disk')}</T>
  </g>
}

function Taylor({ frame, value, lang }: Omit<Props, 'kind'>) {
  const count = Math.max(1, Math.round(value)), p = plane([121, 152], 79), graph = (x: number, y: number): P => [355 + 35 * x, 168 - 35 * y]
  const factorial = (n: number) => { let answer = 1; for (let j = 2; j <= n; j++) answer *= j; return answer }
  const polynomial = (x: number) => Array.from({ length: count }, (_, k) => (-1) ** k * x ** (2 * k + 1) / factorial(2 * k + 1)).reduce((a, v) => a + v, 0)
  return <g>
    <T x={120} y={30} size={16}>{lang === 'id' ? 'Lingkaran koefisien Cρ' : 'Coefficient circle Cρ'}</T>
    <T x={357} y={30} size={16}>{lang === 'id' ? 'Irisan real: sin x' : 'Real slice: sin x'}</T>
    <circle cx={121} cy={152} r={89} stroke={C.mu} strokeDasharray="5 4" fill={C.soft} />
    <circle cx={121} cy={152} r={62} stroke={C.a} strokeWidth={3} fill="none" /><CircleDirection center={[121, 152]} radius={62} />
    <Dot at={[121, 152]} color={C.mu} r={4} /><T x={121} y={177} size={13}>z₀</T>
    <Dot at={p(.32, .2)} color={C.g} /><T x={162} y={131} size={13} color={C.g}>z</T>
    <Dot at={p(.5, .6)} color={C.a} /><T x={171} y={91} size={13} color={C.a}>s</T>
    <T x={120} y={266} size={13}>|z−z₀| &lt; ρ &lt; R</T>
    <path d="M263,168 H448 M355,72 V263" stroke={C.ln} fill="none" />
    <path d={fn(x => graph(x, Math.sin(x)), -2.6, 2.6)} stroke={C.g} strokeWidth={4} fill="none" />
    <At frame={frame} from={2}><path d={fn(x => graph(x, polynomial(x)), -2.6, 2.6)} stroke={C.y} strokeWidth={2.5} strokeDasharray="7 4" fill="none" /></At>
    <T x={355} y={64} size={13} color={C.g}>sin x</T><T x={355} y={282} size={13} color={C.y}>P{2 * count - 1}(x); a₁ = 1, a₃ = −1/6</T>
  </g>
}

function Laurent({ frame, value, lang }: Omit<Props, 'kind'>) {
  const outer = value === 1, center: P = [130, 153], radius = outer ? 80 : 20
  return <g>
    <T x={240} y={28} size={17}>f(z) = 1 / [z(z − 1)]</T>
    <circle cx={130} cy={153} r={102} fill={outer ? C.soft : 'none'} stroke={C.faint} strokeDasharray="3 5" />
    <circle cx={130} cy={153} r={40} fill={outer ? C.bg : C.soft} stroke={C.r} strokeWidth={2} strokeDasharray="6 4" />
    <path d="M22,153 H237 M130,45 V260" stroke={C.ln} />
    <circle cx={130} cy={153} r={radius} fill="none" stroke={C.a} strokeWidth={3.5} /><CircleDirection center={center} radius={radius} />
    <Dot at={center} color={C.r} /><Dot at={[170, 153]} color={C.r} />
    <T x={124} y={178} size={13}>0</T><T x={176} y={178} size={13}>1</T>
    <T x={130} y={280} size={14} color={C.a}>{outer ? 'ρ = 2; |z| > 1' : 'ρ = ½; 0 < |z| < 1'}</T>
    <T x={356} y={75} size={16}>{lang === 'id' ? 'Koefisien pada anulus ini' : 'This annulus’s coefficients'}</T>
    <T x={356} y={119} size={19} color={C.y}>{outer ? 'z⁻² + z⁻³ + z⁻⁴ + …' : '−z⁻¹ − 1 − z − z² − …'}</T>
    <At frame={frame} from={1}><T x={356} y={163} size={21} color={C.a}>c₋₁ = {outer ? '0' : '−1'}</T></At>
    <At frame={frame} from={3}>
      <T x={356} y={207} size={18} color={C.g}>∮ f(z) dz = {outer ? '0' : '−2πi'}</T>
      <T x={355} y={249} size={12} color={C.r}>{lang === 'id' ? 'ρ = 1 tidak sah: melewati pole' : 'ρ = 1 is invalid: it crosses a pole'}</T>
    </At>
  </g>
}

export function ComplexCalculusScene(props: Props) {
  switch (props.kind) {
    case 'cxRealParameter': return <RealParameter {...props} />
    case 'cxContourBranches': return <Branches {...props} />
    case 'cxDomains': return <Domains {...props} />
    case 'cxMaximum': return <Maximum {...props} />
    case 'cxPowerSeries': return <PowerSeries {...props} />
    case 'cxTaylorCoefficients': return <Taylor {...props} />
    case 'cxLaurentCoefficients': return <Laurent {...props} />
  }
}
