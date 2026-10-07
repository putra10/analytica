import type { ReactNode } from 'react'
import type { MetricKind } from '../../content/geometry-metric-topics'
import { Arrow, At, C, Dot, Grid, T, fn, plane, pl, tr, type Lang, type P } from './kit'

const Segment = ({ a, z, color = C.mu, dash }: { a: P; z: P; color?: string; dash?: string }) => <path d={pl([a, z])} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} />
const Circle = ({ at, r, color = C.a }: { at: P; r: number; color?: string }) => <circle cx={at[0]} cy={at[1]} r={r} stroke={color} strokeWidth={2.5} fill="none" />

function CircleData({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([165, 155], 35), O = map(0, 0), points: P[] = [[2, 0], [0, 2], [-2, 0]]
  const angle = value * Math.PI / 180, M = map(2 * Math.cos(angle), 2 * Math.sin(angle))
  const inset = (x: number, y: number, z: number): P => [365 + 18 * x - 12 * y, 208 - 22 * z + 6 * x + 9 * y]
  return <>
    <Grid map={map} x={[-3, 3]} y={[-3, 3]} grid={false} />
    <Circle at={O} r={70} /> <Dot at={O} color={C.a} /> <T x={150} y={172} size={14}>O</T>
    <Arrow from={O} to={M} color={C.r} /> <Dot at={M} color={C.r} /> <T x={M[0] + 14} y={M[1] - 10} size={14}>M</T>
    <T x={165} y={30} size={15}>{t('Jarak tetap R=2', 'Fixed distance R=2')}</T>
    <At from={1} frame={frame}>
      {points.map((p, i) => <g key={i}><Dot at={map(...p)} color={C.y} /><T x={map(...p)[0] + 12} y={map(...p)[1] + 17} size={13}>{`P${i + 1}`}</T></g>)}
      <Segment a={map(-2.5, -2.5)} z={map(2.5, 2.5)} color={C.g} dash="5 5" />
      <Segment a={map(0, -2.5)} z={map(0, 2.5)} color={C.g} dash="5 5" />
      <T x={164} y={264} color={C.g} size={13}>{t('Garis sumbu → pusat', 'Bisectors → center')}</T>
    </At>
    <At from={2} frame={frame}>
      <T x={370} y={62} size={14}>{t('Bola: 4 titik', 'Sphere: 4 points')}</T>
      <T x={370} y={82} size={13}>{t('tidak sebidang', 'noncoplanar')}</T>
      {([[0, 0, 0], [3, 0, 0], [0, 3, 0], [0, 0, 3]] as [number, number, number][]).map((p, i, a) => <g key={i}>{a.slice(i + 1).map((q, j) => <Segment key={j} a={inset(...p)} z={inset(...q)} />)}<Dot at={inset(...p)} color={C.v} /></g>)}
    </At>
    <At from={3} frame={frame}>
      <Segment a={map(2 * Math.cos(angle), 0)} z={M} color={C.y} dash="4 4" />
      <T x={370} y={265} size={13} color={C.r}>{`t=${Math.round(value)}°`}</T>
    </At>
  </>
}

function Secant({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([180, 150], 35), h = value, disc = 4 - h * h, O = map(0, 0), H = map(0, h)
  return <>
    <Circle at={O} r={70} /><Dot at={O} color={C.a} /><T x={166} y={168} size={14}>O</T>
    <Segment a={map(-3.5, h)} z={map(3.5, h)} color={C.r} />
    <T x={350} y={53} color={C.r} size={16}>{`y=${h.toFixed(1)}`}</T>
    <At from={1} frame={frame}>
      <Segment a={O} z={H} color={C.g} dash="5 4" /><T x={197} y={(O[1] + H[1]) / 2} size={14} color={C.g}>{`d=${Math.abs(h).toFixed(1)}`}</T>
      <T x={365} y={113} size={15}>{`Δ=${disc.toFixed(2)}`}</T>
    </At>
    <At from={2} frame={frame}>
      {disc >= -1e-9 && [-1, 1].map((sign, i) => <Dot key={i} at={map(sign * Math.sqrt(Math.max(0, disc)), h)} color={C.y} />)}
      <T x={350} y={167} size={14} color={C.y}>{disc > 1e-9 ? t('2 titik', '2 points') : Math.abs(disc) < 1e-9 ? t('1 titik', '1 point') : t('Tidak ada titik', 'No real points')}</T>
      <T x={240} y={277} size={15}>{t('Irisan pusat: 2D dan 3D', 'Central section: 2D and 3D')}</T>
    </At>
  </>
}

function SphereTangency({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([126, 153], 35), R = 2, p = value, contactX = R * R / p, contactY = Math.sqrt(Math.max(0, R * R - contactX * contactX)), O = map(0, 0), P0 = map(p, 0), top = map(contactX, contactY), bottom = map(contactX, -contactY)
  return <>
    <Circle at={O} r={70} /><Dot at={O} color={C.a} /><T x={113} y={172} size={14}>O</T><Dot at={P0} color={C.r} /><T x={P0[0] + 12} y={P0[1] + 19} size={14}>P</T>
    <Segment a={P0} z={top} color={C.y} /><Segment a={P0} z={bottom} color={C.y} />
    <Dot at={top} color={C.y} /><Dot at={bottom} color={C.y} />
    <At from={1} frame={frame}>
      <Segment a={map(contactX, -2.8)} z={map(contactX, 2.8)} color={C.g} dash="5 4" />
      <T x={127} y={38} color={C.g} size={14}>{t('Irisan bidang polar', 'Polar-plane section')}</T>
      <T x={354} y={76} size={14}>{`x=4/${p.toFixed(1)}`}</T>
      <T x={355} y={102} size={13}>{t('Kontak membentuk', 'Contacts form a')}</T><T x={355} y={121} size={13}>{t('lingkaran pada bola', 'circle on the sphere')}</T>
    </At>
    <At from={2} frame={frame}>
      <T x={240} y={267} size={14} color={C.y}>{t('Putar sekitar OP → kerucut', 'Revolve around OP → cone')}</T>
    </At>
    <At from={3} frame={frame}>
      <T x={355} y={165} color={C.v} size={13}>{t('Arah tetap → silinder', 'Fixed direction → cylinder')}</T>
      <ellipse cx={355} cy={199} rx={38} ry={11} fill="none" stroke={C.v} strokeWidth={2} />
      <ellipse cx={355} cy={245} rx={38} ry={11} fill="none" stroke={C.v} strokeWidth={2} />
      <Segment a={[317, 199]} z={[317, 245]} color={C.v} /><Segment a={[393, 199]} z={[393, 245]} color={C.v} />
    </At>
  </>
}

function RadicalSystems({ frame, lang }: { frame: number; lang: Lang }) {
  const t = tr(lang), map = plane([95, 190], 36), centers: P[] = [[0, 0], [2, 0], [0, 2]], M = map(1, 1)
  return <>
    {centers.map((p, i) => <g key={i}><Circle at={map(...p)} r={36} color={[C.a, C.v, C.y][i]} /><Dot at={map(...p)} color={[C.a, C.v, C.y][i]} /></g>)}
    <T x={126} y={44} size={14}>{t('R₁=R₂=R₃=1', 'R₁=R₂=R₃=1')}</T>
    <At from={1} frame={frame}><Segment a={map(1, -1)} z={map(1, 3)} color={C.g} dash="5 4" /><Segment a={map(-1, 1)} z={map(3, 1)} color={C.g} dash="5 4" /><Dot at={M} color={C.r} /><T x={M[0] + 40} y={M[1] - 9} size={14}>M=(1,1)</T><T x={125} y={271} size={13}>{t('Kuasa sama = 1, bukan 0', 'Equal power = 1, not 0')}</T></At>
    <At from={2} frame={frame}>
      <Circle at={[354, 140]} r={55} color={C.mu} />
      <Segment a={[292, 107]} z={[416, 107]} color={C.v} /><Segment a={[354, 140]} z={[354, 107]} color={C.g} /><Segment a={[354, 107]} z={[398, 107]} color={C.r} /><Segment a={[354, 140]} z={[398, 107]} color={C.y} />
      <T x={343} y={127} size={13} color={C.g}>d</T><T x={377} y={98} size={13} color={C.r}>r</T><T x={385} y={139} size={13} color={C.y}>R</T>
      <T x={355} y={48} size={14}>{t('Irisan bola–bidang', 'Sphere–plane slice')}</T><T x={354} y={210} size={14}>r²+d²=R²</T>
    </At>
    <At from={3} frame={frame}><T x={353} y={245} size={13}>{t('Sudut: pakai normal radius', 'Angle: use radial normals')}</T></At>
  </>
}

function CirclePencil({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([205, 147], 26), A = map(0, 2), B0 = map(0, -2), centers = [-2, 2]
  return <>
    {centers.map((h, i) => <Circle key={i} at={map(h, 0)} r={26 * Math.sqrt(h * h + 4)} color={i ? C.v : C.mu} />)}
    <Dot at={A} color={C.r} /><Dot at={B0} color={C.r} /><T x={A[0] + 16} y={A[1] - 8} size={14}>A</T><T x={B0[0] + 16} y={B0[1] + 19} size={14}>B</T>
    <T x={240} y={28} size={15}>{t('Titik dasar tetap', 'Fixed base points')}</T>
    <At from={1} frame={frame}>
      <Circle at={map(value, 0)} r={26 * Math.sqrt(value * value + 4)} color={C.a} /><Dot at={map(value, 0)} color={C.a} />
      <T x={240} y={268} size={14}>{`(x−h)²+y²=h²+4, h=${value.toFixed(1)}`}</T>
    </At>
    <At from={2} frame={frame}><Segment a={map(0, -4.2)} z={map(0, 4.2)} color={C.g} dash="5 4" /><T x={407} y={143} color={C.g} size={14}>x=0</T><T x={407} y={163} size={12}>{t('radikal', 'radical')}</T></At>
  </>
}

function FocusDirectrix({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([116, 152], 29), F = map(1, 0), M = map(value * value / 4, value), N = map(-1, value)
  return <>
    <Grid map={map} x={[-2, 6]} y={[-4.5, 4.5]} grid={false} />
    <path d={fn(s => map(s * s / 4, s), -4.2, 4.2)} fill="none" stroke={C.a} strokeWidth={3} />
    <Segment a={map(-1, -4.3)} z={map(-1, 4.3)} color={C.g} dash="5 4" />
    <Dot at={F} color={C.r} /><T x={F[0] + 16} y={F[1] + 18} size={14}>F</T><Dot at={M} color={C.y} /><T x={M[0] + 13} y={M[1] - 8} size={14}>M</T>
    <T x={72} y={282} size={14} color={C.g}>x=−1</T>
    <At from={1} frame={frame}><Segment a={M} z={F} color={C.r} /><Segment a={M} z={N} color={C.g} /><Dot at={N} color={C.g} /><T x={390} y={51} size={15}>e=1</T><T x={390} y={77} size={14}>MF=MN</T><T x={390} y={103} size={13}>{`=${(1 + value * value / 4).toFixed(2)}`}</T></At>
    <At from={2} frame={frame}><T x={391} y={170} size={13}>{t('0<e<1: elips', '0<e<1: ellipse')}</T><T x={391} y={194} size={13}>{t('e=1: parabola', 'e=1: parabola')}</T><T x={391} y={218} size={13}>{t('e>1: hiperbola', 'e>1: hyperbola')}</T></At>
    <At from={3} frame={frame}><T x={391} y={268} size={13}>{`t=${value.toFixed(1)}`}</T></At>
  </>
}

function QuadraticMatrix({ frame, lang }: { frame: number; lang: Lang }) {
  const t = tr(lang), entries = [['1', '2', '−1'], ['2', '3', '3'], ['−1', '3', '−5']], cell = 49, ox = 66, oy = 73
  return <>
    <T x={145} y={35} size={14}>{t('Matriks besar Ã', 'Large matrix Ã')}</T>
    {entries.map((row, i) => row.map((v, j) => {
      const color = i < 2 && j < 2 ? C.a : i === 2 && j === 2 ? C.y : C.r
      return <g key={`${i}${j}`}><rect x={ox + j * cell} y={oy + i * cell} width={cell - 3} height={cell - 3} rx={5} fill={C.bg} stroke={color} strokeWidth={2} /><T x={ox + j * cell + 23} y={oy + i * cell + 30} size={19} color={color}>{v}</T></g>
    }))}
    <At from={1} frame={frame}><T x={343} y={83} size={14} color={C.a}>{t('Kuadrat: A', 'Quadratic: A')}</T><T x={343} y={114} size={14} color={C.r}>{t('Linear: a dan aᵀ', 'Linear: a and aᵀ')}</T><T x={343} y={145} size={14} color={C.y}>{t('Konstanta: α', 'Constant: α')}</T></At>
    <At from={2} frame={frame}><T x={344} y={201} size={14}>{t('Garis P+tv', 'Line P+tv')}</T><Arrow from={[345, 213]} to={[345, 236]} color={C.g} head={7} /><T x={344} y={260} size={15}>qt²+2Bt+f(P)</T></At>
    <At from={3} frame={frame}><T x={144} y={266} size={13}>{t('5 syarat bebas: konik', '5 independent constraints')}</T><T x={144} y={285} size={12}>{t('9 syarat bebas: kuadrik', '9 for a quadric')}</T></At>
  </>
}

function Asymptotic({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), map = plane([175, 150], 37), h = value
  return <>
    <Grid map={map} x={[-3.5, 3.5]} y={[-3, 3]} grid={false} />
    {[-1, 1].map(sign => <path key={sign} d={fn(u => map(sign * Math.cosh(u), Math.sinh(u)), -1.75, 1.75)} fill="none" stroke={C.a} strokeWidth={2.5} />)}
    <Segment a={map(-2.8, -2.8)} z={map(2.8, 2.8)} color={C.mu} dash="5 4" />
    <At from={1} frame={frame}><Segment a={map(-2.5, -2.5 + h)} z={map(2.5, 2.5 + h)} color={C.r} /><T x={379} y={61} size={14} color={C.r}>{`y=x+${h.toFixed(1)}`}</T><T x={379} y={87} size={14}>q(1,1)=0</T></At>
    <At from={2} frame={frame}><T x={378} y={146} size={14}>{Math.abs(h) < .01 ? t('Tidak berpotongan', 'No intersection') : t('Satu potongan', 'One intersection')}</T><T x={378} y={171} size={13}>{Math.abs(h) < .01 ? '−1=0' : `−2ht−h²−1=0`}</T>
      {Math.abs(h) > .01 && (() => { const x = -(h * h + 1) / (2 * h), y = x + h; return Math.abs(x) < 3.5 && Math.abs(y) < 3 ? <Dot at={map(x, y)} color={C.y} /> : null })()}
    </At>
    <At from={3} frame={frame}><T x={374} y={230} size={13}>{t('Parabola: arah ada,', 'Parabola: direction,')}</T><T x={374} y={250} size={13}>{t('asimtot tidak ada', 'but no asymptote')}</T></At>
    <T x={176} y={285} size={14}>x²−y²=1</T>
  </>
}

function Rulings({ frame, value, lang }: { frame: number; value: number; lang: Lang }) {
  const t = tr(lang), project = (x: number, y: number, z: number): P => [235 + 50 * x - 28 * y, 145 + 16 * x + 18 * y - 44 * z]
  if (frame === 0) return <>
    {[-1.5, -.75, 0, .75, 1.5].map(k => <g key={k}>
      <path d={fn(v => project((k + v) / 2, (k - v) / 2, k * v), -1.5, 1.5, 2)} fill="none" stroke={C.a} strokeWidth={2} />
      <path d={fn(u => project((u + k) / 2, (u - k) / 2, u * k), -1.5, 1.5, 2)} fill="none" stroke={C.r} strokeWidth={2} />
    </g>)}
    <T x={240} y={32} size={15}>{t('Pelana: z=UV=x²−y²', 'Saddle: z=UV=x²−y²')}</T><T x={135} y={277} color={C.a} size={14}>{t('U tetap', 'Fixed U')}</T><T x={350} y={277} color={C.r} size={14}>{t('V tetap', 'Fixed V')}</T>
  </>
  const theta = value * Math.PI / 180, line = (a: number, sign: number, u: number) => project(Math.cos(a) - u * Math.sin(a), Math.sin(a) + u * Math.cos(a), sign * u)
  return <>
    {Array.from({ length: 12 }, (_, i) => i * Math.PI / 6).map(a => <g key={a}><Segment a={line(a, 1, -1.6)} z={line(a, 1, 1.6)} color={C.ln} /><Segment a={line(a, -1, -1.6)} z={line(a, -1, 1.6)} color={C.ln} /></g>)}
    <path d={fn(a => project(Math.cos(a), Math.sin(a), 0), 0, Math.PI * 2)} fill="none" stroke={C.y} strokeWidth={2} />
    <Segment a={line(theta, 1, -1.6)} z={line(theta, 1, 1.6)} color={C.a} /><Segment a={line(theta, -1, -1.6)} z={line(theta, -1, 1.6)} color={C.r} /><Dot at={line(theta, 1, 0)} color={C.y} />
    <T x={240} y={24} size={14}>{t('Hiperboloid satu lembar', 'One-sheet hyperboloid')}</T>
    <T x={240} y={273} size={14}>{frame >= 2 ? 'X²+Y²−Z²=1+t²−t²=1' : t('Dua garis melalui titik pinggang', 'Two lines through a waist point')}</T>
    <At from={3} frame={frame}><T x={240} y={295} size={12}>{t('Ellipsoid: q(v)>0 → tanpa garis', 'Ellipsoid: q(v)>0 → no lines')}</T></At>
  </>
}

const scenes: Record<MetricKind, (frame: number, value: number, lang: Lang) => ReactNode> = {
  circleSphereData: (frame, value, lang) => <CircleData {...{ frame, value, lang }} />,
  secantDiscriminant: (frame, value, lang) => <Secant {...{ frame, value, lang }} />,
  sphereTangency: (frame, value, lang) => <SphereTangency {...{ frame, value, lang }} />,
  radicalSystems: (frame, _value, lang) => <RadicalSystems {...{ frame, lang }} />,
  circlePencil: (frame, value, lang) => <CirclePencil {...{ frame, value, lang }} />,
  focusDirectrix: (frame, value, lang) => <FocusDirectrix {...{ frame, value, lang }} />,
  quadraticMatrix: (frame, _value, lang) => <QuadraticMatrix {...{ frame, lang }} />,
  asymptoticDirections: (frame, value, lang) => <Asymptotic {...{ frame, value, lang }} />,
  quadricRulings: (frame, value, lang) => <Rulings {...{ frame, value, lang }} />,
}

export function MetricScene({ kind, frame, value, lang }: { kind: MetricKind; frame: number; value: number; lang: Lang }) {
  return scenes[kind](frame, value, lang)
}
