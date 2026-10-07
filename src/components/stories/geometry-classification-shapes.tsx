import { At, Arrow, C, Dot, Grid, T, arc, fn, plane, pl } from './kit'
import type { Lang, P } from './kit'
import { CONIC_CASES, QUADRIC_CASES } from '../../content/geometry-classification-topics'

type Props = { frame: number; value: number; lang: Lang }
const choose = (lang: Lang, id: string, en: string) => lang === 'id' ? id : en
const curve = (f: (t: number) => P, lo: number, hi: number, color = C.a) => <path d={fn(f, lo, hi)} fill="none" stroke={color} strokeWidth="2.4" />

export function TangentScene({ frame, lang }: Props) {
  const m = plane([195, 162], 39)
  return <g>
    <Grid map={m} x={[-3, 5]} y={[-2.5, 3]} />
    <circle cx={195} cy={162} r={78} fill="none" stroke={C.a} strokeWidth="2.5" />
    <T x={195} y={274} size={15}>x² + y² = 4</T>
    <Dot at={m(3, 0)} color={C.y} /><T x={345} y={150} color={C.y} size={15}>P(3,0)</T>
    <At frame={frame} from={1}>
      <path d={pl([m(4 / 3, -2.5), m(4 / 3, 3)])} stroke={C.y} strokeWidth={3} />
      <T x={310} y={50} size={14} color={C.y}>{choose(lang, 'Polar: x = 4/3', 'Polar: x = 4/3')}</T>
    </At>
    <At frame={frame} from={2}>
      <Dot at={m(0, 2)} color={C.g} /><T x={174} y={72} color={C.g} size={15}>Q(0,2)</T>
      <path d={pl([m(-3, 2), m(5, 2)])} stroke={C.g} strokeWidth={3} />
      <T x={386} y={75} size={14} color={C.g}>{choose(lang, 'Singgung: y = 2', 'Tangent: y = 2')}</T>
    </At>
    <At frame={frame} from={3}>
      <Arrow from={m(0, 2)} to={m(0, 3.3)} color={C.v} />
      <path d={pl([m(0, -2.3), m(0, 3.3)])} stroke={C.v} strokeWidth={2} strokeDasharray="5 4" />
      <T x={109} y={42} size={14} color={C.v}>{choose(lang, 'Normal: x = 0', 'Normal: x = 0')}</T>
    </At>
  </g>
}

export function CenterScene({ frame, lang }: Props) {
  if (frame < 2) {
    const m = plane([150, 155], 36)
    const h: P = m(1, 0), p: P = m(1 + 82 / 36 * Math.cos(.6), 54 / 36 * Math.sin(.6)), q: P = m(1 - 82 / 36 * Math.cos(.6), -54 / 36 * Math.sin(.6))
    return <g>
      <Grid map={m} x={[-2.5, 4.5]} y={[-2.8, 2.8]} />
      <ellipse cx={h[0]} cy={h[1]} rx={82} ry={54} fill="none" stroke={C.a} strokeWidth={3} />
      <path d={pl([p, q])} stroke={C.y} strokeWidth={2} />
      <Dot at={p} color={C.y} /><Dot at={q} color={C.y} /><Dot at={h} color={C.g} />
      <T x={h[0]} y={h[1] + 29} color={C.g} size={15}>h</T>
      <T x={p[0] + 16} y={p[1] - 14} color={C.y} size={15}>h + u</T>
      <T x={q[0] - 4} y={q[1] + 28} color={C.y} size={15}>h − u</T>
      <At frame={frame} from={1}><T x={240} y={275} color={C.g} size={18}>Ah + a = 0</T></At>
    </g>
  }
  const left = plane([125, 145], 35), right = plane([342, 145], 30)
  return <g>
    <T x={125} y={34} color={C.g} size={16}>{choose(lang, 'Banyak pusat', 'Many centers')}</T>
    <path d={pl([left(-1, -2.5), left(-1, 2.5)])} stroke={C.a} strokeWidth={3} />
    <path d={pl([left(1, -2.5), left(1, 2.5)])} stroke={C.a} strokeWidth={3} />
    <path d={pl([left(0, -2.5), left(0, 2.5)])} stroke={C.g} strokeWidth={2} strokeDasharray="5 4" />
    {[-1.5, -.5, .5, 1.5].map(y => <Dot key={y} at={left(0, y)} color={C.g} r={4} />)}
    <T x={125} y={250} size={15}>x² = 1</T><T x={125} y={277} size={14}>h = (0,t)</T>
    <T x={350} y={34} color={C.r} size={16}>{choose(lang, 'Tanpa pusat', 'No center')}</T>
    {curve(t => right(t * t / 2 - 1.5, t), -2.6, 2.6)}
    <T x={350} y={250} size={15}>y² = 2x</T><T x={350} y={277} color={C.r} size={14}>Ah = −a ⇒ 0 = 1</T>
  </g>
}

export function ConjugateScene({ frame, lang }: Props) {
  const m = plane([220, 146], 51)
  const segments = [-.4, -.2, 0, .2, .4].map(d => {
    // m0=(4d,-d), v=(1,1); midpoint condition m0^T A v=0.
    const length = Math.sqrt(Math.max(0, (1 - 5 * d * d) / 1.25))
    return { d, length }
  }).filter(x => x.length > 0)
  return <g>
    <ellipse cx={220} cy={146} rx={102} ry={51} stroke={C.a} strokeWidth={3} fill="none" />
    {segments.map(({ d, length }) => <g key={d}>
      <path d={pl([m(4 * d - length, -d - length), m(4 * d + length, -d + length)])} stroke={C.y} strokeWidth={2} />
      <At frame={frame} from={1}><Dot at={m(4 * d, -d)} color={C.g} r={4} /></At>
    </g>)}
    <Arrow from={m(-2.9, -1.2)} to={m(-1.8, -.1)} color={C.y} /><T x={60} y={243} color={C.y} size={15}>v = (1,1)</T>
    <At frame={frame} from={2}>
      <path d={pl([m(-2.3, .575), m(2.3, -.575)])} stroke={C.g} strokeWidth={3} />
      <T x={340} y={221} color={C.g} size={15}>w = (4,−1)</T>
      <T x={240} y={272} color={C.g} size={17}>wᵀAv = 0</T>
    </At>
    <At frame={frame} from={3}>
      <Arrow from={m(0, 0)} to={m(2.4, 0)} color={C.v} /><Arrow from={m(0, 0)} to={m(0, 1.5)} color={C.v} />
      <T x={240} y={28} color={C.v} size={15}>{choose(lang, 'Sumbu utama: Av = λv', 'Principal axes: Av = λv')}</T>
    </At>
  </g>
}

export function ConicClassScene({ value, lang }: Props) {
  const k = Math.round(value), c = CONIC_CASES[k] ?? CONIC_CASES[0]
  const m = plane([240, 154], 35)
  return <g>
    <Grid map={m} x={[-5.7, 5.7]} y={[-2.8, 2.8]} />
    <T x={240} y={30} size={15}>{c.name[lang]}</T>
    {k === 0 && <ellipse cx={240} cy={154} rx={70} ry={35} fill="none" stroke={C.a} strokeWidth={3} />}
    {k === 2 && [-1, 1].map(sign => <g key={sign}>{curve(t => m(sign * Math.cosh(t), Math.sinh(t)), -1.7, 1.7)}</g>)}
    {k === 3 && curve(t => m(t * t / 2, t), -2.6, 2.6)}
    {k === 4 && [-1, 1].map(sign => <path key={sign} d={pl([m(-2.6, -2.6 * sign), m(2.6, 2.6 * sign)])} stroke={C.a} strokeWidth={3} />)}
    {k === 5 && <Dot at={m(0, 0)} color={C.a} />}
    {k === 6 && [-1, 1].map(x => <path key={x} d={pl([m(x, -2.8), m(x, 2.8)])} stroke={C.a} strokeWidth={3} />)}
    {k === 8 && <path d={pl([m(0, -2.8), m(0, 2.8)])} stroke={C.a} strokeWidth={4} />}
    {(k === 1 || k === 7) && <T x={240} y={150} size={21} color={C.r}>{choose(lang, 'Tidak ada titik real', 'No real points')}</T>}
    <T x={240} y={285} size={14} color={C.mu}>{choose(lang, 'Pilih kelas dengan slider', 'Select a class with the slider')}</T>
  </g>
}

const project3 = (x: number, y: number, z: number): P => [240 + 46 * x - 23 * y, 160 - 40 * z + 15 * y]
const wire = (f: (u: number, v: number) => [number, number, number], ua: number, ub: number, va: number, vb: number, color = C.a) => <g stroke={color} strokeWidth={1.3} fill="none">
  {Array.from({ length: 9 }, (_, i) => va + (vb - va) * i / 8).map((v, i) => <path key={`v${i}`} d={fn(u => project3(...f(u, v)), ua, ub, 54)} />)}
  {Array.from({ length: 13 }, (_, i) => ua + (ub - ua) * i / 12).map((u, i) => <path key={`u${i}`} d={fn(v => project3(...f(u, v)), va, vb, 30)} />)}
</g>
export function QuadricClassScene({ value, lang }: Props) {
  const k = Math.round(value), item = QUADRIC_CASES[k] ?? QUADRIC_CASES[0]
  let surface
  const circle = (radius: number, z: number, t: number): [number, number, number] => [radius * Math.cos(t), radius * Math.sin(t), z]
  if (k === 0) surface = wire((u, v) => [Math.cos(u) * Math.sin(v), Math.sin(u) * Math.sin(v), Math.cos(v)], 0, 2 * Math.PI, 0, Math.PI)
  if (k === 2) surface = wire((u, v) => circle(Math.sqrt(1 + v * v), v, u), 0, 2 * Math.PI, -1.6, 1.6)
  if (k === 3) surface = [-1, 1].map(sign => <g key={sign}>{wire((u, v) => circle(Math.sinh(v), sign * Math.cosh(v), u), 0, 2 * Math.PI, 0, 1.05)}</g>)
  if (k === 4) surface = wire((u, v) => circle(v, v * v / 2, u), 0, 2 * Math.PI, 0, 1.7)
  if (k === 5) surface = wire((u, v) => [u, v, (u * u - v * v) / 2], -1.65, 1.65, -1.65, 1.65)
  if (k === 6) surface = wire((u, v) => circle(Math.abs(v), v, u), 0, 2 * Math.PI, -1.8, 1.8)
  if (k === 7) surface = <Dot at={project3(0, 0, 0)} color={C.a} />
  if (k === 8) surface = wire((u, v) => circle(1, v, u), 0, 2 * Math.PI, -1.9, 1.9)
  if (k === 9) surface = [-1, 1].map(sign => <g key={sign}>{wire((u, v) => [sign * Math.cosh(u), Math.sinh(u), v], -1.1, 1.1, -1.7, 1.7)}</g>)
  if (k === 10) surface = wire((u, v) => [u * u / 2, u, v], -1.8, 1.8, -1.7, 1.7)
  if (k === 12) surface = [-1, 1].map(sign => <g key={sign}>{wire((u, v) => [u, sign * u, v], -1.5, 1.5, -1.7, 1.7)}</g>)
  if (k === 13) surface = <path d={pl([project3(0, 0, -2), project3(0, 0, 2)])} stroke={C.a} strokeWidth={4} />
  if (k === 14) surface = [-1, 1].map(x => <g key={x}>{wire((u, v) => [x, u, v], -1.5, 1.5, -1.7, 1.7)}</g>)
  if (k === 16) surface = wire((u, v) => [0, u, v], -1.5, 1.5, -1.7, 1.7)
  const empty = k === 1 || k === 11 || k === 15
  return <g>
    <T x={240} y={25} size={14}>{item.name[lang]}</T>
    {[project3(2.8, 0, 0), project3(0, 2.5, 0), project3(0, 0, 2.6)].map((p, i) => <g key={i}><Arrow from={project3(0, 0, 0)} to={p} color={C.ln} width={1.5} /><T x={p[0] + 10} y={p[1] + 7} color={C.mu} size={14}>{['X', 'Y', 'Z'][i]}</T></g>)}
    {surface}
    {empty && <T x={240} y={130} size={21} color={C.r}>{choose(lang, 'Tidak ada titik real', 'No real points')}</T>}
    <T x={240} y={282} size={13} color={C.mu}>{choose(lang, 'Proyeksi miring 3D · pilih kelas', '3D oblique projection · select a class')}</T>
  </g>
}

export function InvariantScene({ frame, lang }: Props) {
  const left = plane([120, 135], 34), right = plane([357, 135], 53)
  return <g>
    <T x={120} y={34} size={15}>{choose(lang, 'Bingkai x,y', 'Frame x,y')}</T>
    <Grid map={left} x={[-2.6, 2.6]} y={[-1.7, 1.7]} />
    <ellipse cx={120} cy={135} rx={68} ry={34} fill="none" stroke={C.a} strokeWidth={3} />
    <T x={120} y={226} size={15}>x²/4 + y² = 1</T>
    <At frame={frame} from={1}>
      <Arrow from={[215, 135]} to={[267, 135]} color={C.y} width={2} />
      <T x={240} y={105} size={14} color={C.y}>x = 2u</T>
      <T x={357} y={34} size={15}>{choose(lang, 'Koordinat u,v', 'Coordinates u,v')}</T>
      <Grid map={right} x={[-1.5, 1.5]} y={[-1.5, 1.5]} />
      <circle cx={357} cy={135} r={53} fill="none" stroke={C.g} strokeWidth={3} />
      <T x={357} y={226} size={15}>u² + v² = 1</T>
    </At>
    <At frame={frame} from={2}>
      <T x={120} y={256} size={14}>δ = 1/4, Δ = −1/4</T>
      <T x={357} y={256} color={C.g} size={14}>δ′ = 1, Δ′ = −1</T>
    </At>
    <At frame={frame} from={3}><T x={240} y={285} size={14} color={C.y}>{choose(lang, 'Lokus sama · skala plot berbeda', 'Same locus · different plot scales')}</T></At>
  </g>
}

export function CompositionScene({ frame, lang }: Props) {
  const m = plane([202, 199], 59)
  return <g>
    <Grid map={m} x={[-1.5, 4]} y={[-.7, 2.8]} />
    <Dot at={m(1, 0)} color={C.fg} /><T x={290} y={222} size={15}>P = (1,0)</T>
    <T x={240} y={28} size={16}>{choose(lang, 'T: +(1,0) · R: putar 90°', 'T: +(1,0) · R: rotate 90°')}</T>
    <At frame={frame} from={1}>
      <Arrow from={m(1, 0)} to={m(2, 0)} color={C.a} />
      <path d={arc(m(0, 0), 118, 0, Math.PI / 2)} stroke={C.a} strokeWidth={2} fill="none" strokeDasharray="5 4" />
      <Dot at={m(0, 2)} color={C.a} /><T x={137} y={67} color={C.a} size={15}>R ∘ T: (0,2)</T>
    </At>
    <At frame={frame} from={2}>
      <path d={arc(m(0, 0), 59, 0, Math.PI / 2)} stroke={C.y} strokeWidth={2} fill="none" />
      <Arrow from={m(0, 1)} to={m(1, 1)} color={C.y} />
      <Dot at={m(1, 1)} color={C.y} /><T x={343} y={124} color={C.y} size={15}>T ∘ R: (1,1)</T>
    </At>
    <At frame={frame} from={3}><T x={240} y={281} size={17} color={C.r}>R ∘ T ≠ T ∘ R</T></At>
  </g>
}

export function AffineFrameScene({ frame, lang }: Props) {
  const m = plane([207, 167], 45)
  const a = m(0, 0), e1 = m(1, 0), e2 = m(0, 1), a1 = m(1, 1), b1 = m(-1, 1), c1 = m(1, -1)
  return <g>
    <Grid map={m} x={[-3, 5]} y={[-2.1, 2.8]} />
    <path d={pl([a, e1, e2], true)} stroke={C.a} strokeWidth={2} fill={C.soft} />
    <T x={282} y={182} size={14} color={C.a}>P₁=(1,0)</T><T x={168} y={103} size={14} color={C.a}>P₂=(0,1)</T>
    <Dot at={a} color={C.a} /><T x={176} y={191} size={14}>P₀</T>
    <At frame={frame} from={1}>
      <path d={pl([a1, b1, c1], true)} stroke={C.g} strokeWidth={3} fill="none" />
      <Arrow from={a1} to={b1} color={C.g} /><Arrow from={a1} to={c1} color={C.y} />
      <T x={301} y={112} size={14} color={C.g}>P′₀=(1,1)</T>
      <T x={111} y={104} size={14} color={C.g}>(−2,0)</T><T x={290} y={231} size={14} color={C.y}>(0,−2)</T>
    </At>
    <At frame={frame} from={2}><T x={240} y={32} size={17}>φ(r) = −2r + (1,1)</T></At>
    <At frame={frame} from={3}><T x={240} y={279} color={C.g} size={15}>{choose(lang, 'det A = 4 · orientasi tetap', 'det A = 4 · same orientation')}</T></At>
  </g>
}

export function SimilarityScene({ frame, value, lang }: Props) {
  const k = value / 2
  const m = plane([236, 156], 40)
  const source: P[] = [[.7, .25], [1.35, .25], [.7, .95]]
  const dest = source.map(([x, y]): P => [k * x, k * y])
  return <g>
    <Grid map={m} x={[-4.8, 4.8]} y={[-2.6, 2.6]} />
    <Dot at={m(0, 0)} color={C.fg} /><T x={221} y={179} size={14}>c</T>
    {source.map((p, i) => <path key={i} d={pl([m(0, 0), m(...p), m(...dest[i])])} stroke={C.ln} strokeDasharray="5 4" />)}
    <path d={pl(source.map(p => m(...p)), true)} fill={C.soft} stroke={C.a} strokeWidth={2.5} />
    <path d={pl(dest.map(p => m(...p)), true)} fill="none" stroke={C.g} strokeWidth={3} />
    <T x={240} y={30} color={C.g} size={17}>k = {k.toFixed(1)}</T>
    {k === 0 && <T x={240} y={240} color={C.r} size={16}>{choose(lang, 'Semua titik runtuh ke c', 'All points collapse to c')}</T>}
    <At frame={frame} from={1}><T x={240} y={278} color={C.y} size={15}>{choose(lang, 'Panjang ×|k| · luas ×k²', 'Length ×|k| · area ×k²')}</T></At>
    <At frame={frame} from={2}><T x={240} y={57} size={14}>{choose(lang, 'Sudut tetap jika k ≠ 0', 'Angles fixed if k ≠ 0')}</T></At>
  </g>
}

export function MotionScene({ frame, value, lang }: Props) {
  const theta = value * Math.PI / 180
  if (frame < 3) {
    const m = plane([235, 158], 57)
    const p: P = m(1.3, .65)
    const q: P = frame === 1 ? m(1.3, -.65) : frame === 2 ? m(-1.3, -.65) : m(1.3 * Math.cos(theta) - .65 * Math.sin(theta), 1.3 * Math.sin(theta) + .65 * Math.cos(theta))
    return <g>
      <Grid map={m} x={[-3.4, 3.4]} y={[-1.9, 1.9]} />
      <Arrow from={m(0, 0)} to={p} color={C.a} /><Arrow from={m(0, 0)} to={q} color={C.g} />
      <Dot at={p} color={C.a} /><Dot at={q} color={C.g} />
      <T x={p[0] + 12} y={p[1] - 10} color={C.a} size={15}>P</T><T x={q[0] + 12} y={q[1] + 21} color={C.g} size={15}>P′</T>
      {frame === 1 && <path d={pl([m(-3.3, 0), m(3.3, 0)])} stroke={C.y} strokeWidth={3} />}
      <T x={240} y={30} size={16}>{frame === 1 ? choose(lang, 'Refleksi garis y = 0', 'Reflection in y = 0') : frame === 2 ? choose(lang, 'Simetri pusat = rotasi 180°', 'Central symmetry = 180° rotation') : choose(lang, 'Rotasi bidang', 'Plane rotation')}</T>
      <T x={240} y={280} color={frame === 1 ? C.r : C.g} size={16}>det Q = {frame === 1 ? '−1' : '+1'}</T>
    </g>
  }
  return <g>
    <Arrow from={project3(0, 0, -2.5)} to={project3(0, 0, 2.8)} color={C.ln} width={2} />
    <T x={259} y={52} size={14}>z</T>
    <path d={fn(t => project3(Math.cos(t), Math.sin(t), t / Math.PI - 2), 0, 4 * Math.PI, 140)} stroke={C.a} strokeWidth={3} fill="none" />
    {[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI].map(t => <Dot key={t} at={project3(Math.cos(t), Math.sin(t), t / Math.PI - 2)} color={C.g} r={4} />)}
    <T x={240} y={29} size={16}>{choose(lang, 'Jejak gerak spiral', 'Screw-motion trajectory')}</T>
    <T x={240} y={281} color={C.g} size={15}>{choose(lang, 'Putar + translasi sejajar sumbu', 'Rotation + translation along axis')}</T>
  </g>
}

export function InversionScene({ frame, value, lang }: Props) {
  const rho = value / 10, k = 4
  const m = plane([168, 155], 47)
  return <g>
    <Grid map={m} x={[-2.6, 5.8]} y={[-2.5, 2.5]} />
    <circle cx={168} cy={155} r={94} fill="none" stroke={C.ln} strokeDasharray="5 4" />
    <T x={76} y={273} color={C.mu} size={14}>ρ = 2</T>
    <Dot at={m(0, 0)} color={C.r} hollow r={5} /><T x={149} y={177} color={C.r} size={14}>O</T>
    <Arrow from={m(0, 0)} to={m(Math.max(rho, k / rho), 0)} color={C.ln} width={1.5} />
    <Dot at={m(rho, 0)} color={C.a} r={5} /><T x={m(rho, 0)[0]} y={133} color={C.a} size={14}>P</T>
    <Dot at={m(k / rho, 0)} color={C.g} r={5} /><T x={m(k / rho, 0)[0]} y={183} color={C.g} size={14}>P′</T>
    <T x={240} y={29} size={17}>ρρ′ = 4</T>
    <At frame={frame} from={2}>
      <path d={pl([m(1, -2.4), m(1, 2.4)])} stroke={C.y} strokeWidth={3} />
      <circle cx={m(2, 0)[0]} cy={155} r={94} fill="none" stroke={C.v} strokeWidth={2.5} />
      <Dot at={m(0, 0)} color={C.r} hollow r={6} />
      <T x={236} y={53} color={C.y} size={14}>x = 1</T><T x={323} y={260} color={C.v} size={14}>(x′−2)² + y′² = 4</T>
    </At>
    <At frame={frame} from={3}><T x={240} y={292} color={C.mu} size={13}>{choose(lang, 'Sudut lokal tetap · O dikecualikan', 'Local angles preserved · O excluded')}</T></At>
  </g>
}
