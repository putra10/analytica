import type { VisualKind } from '../content/summary-lessons'
import { parse, freeVars, type Node } from './expr'

type V = [number, number, number]
type M = [V, V, V]
export type GeometryText = { id: string; en: string }
export type GeometryField = { key: string; label: GeometryText; value: string; multiline?: boolean }
export type GeometryExperiment = { title: GeometryText; fields: GeometryField[]; note: GeometryText }
export type GeometryObservation = { lines: GeometryText[]; points: { name: string; p: V; color?: string }[]; paths: { points: V[]; color?: string; dashed?: boolean }[]; values: Record<string, number | string | number[]>; error?: GeometryText }
const b = (id: string, en: string): GeometryText => ({ id, en })
const f = (key: string, id: string, en: string, value: string, multiline = false): GeometryField => ({ key, label: b(id, en), value, multiline })
const fmt = (v: number) => Math.abs(v) < 1e-10 ? '0' : String(+v.toPrecision(6))
const vt = (v: number[]) => `(${v.map(fmt).join(', ')})`
const add = (u: V, v: V): V => u.map((x, i) => x + v[i]) as V
const sub = (u: V, v: V): V => u.map((x, i) => x - v[i]) as V
const mul = (u: V, k: number): V => u.map(x => x * k) as V
const dot = (u: V, v: V) => u.reduce((s, x, i) => s + x * v[i], 0)
const cross = (u: V, v: V): V => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
const norm = (u: V) => Math.hypot(...u)
const mv = (a: M, v: V): V => a.map(row => dot(row, v)) as V
const det = (a: M) => dot(a[0], cross(a[1], a[2]))
const transpose = (a: M): M => [0, 1, 2].map(i => a.map(row => row[i]) as V) as M
const mm = (a: M, c: M): M => a.map(row => transpose(c).map(col => dot(row, col)) as V) as M
const zero = (x: number, scale = 1) => Math.abs(x) <= 1e-8 * Math.max(1, scale)
function scalar(s: string): number { const x = Number(s); if (!s.trim() || !Number.isFinite(x) || Math.abs(x) > 1e6) throw Error('finite'); return x }
function vector(s: string): V { const p = s.replace(/[()[\]]/g, '').split(/[\s,]+/).filter(Boolean).map(scalar); if (p.length !== 2 && p.length !== 3) throw Error('vector'); return [p[0], p[1], p[2] ?? 0] }
function matrix(s: string): M { const raw = s.trim().split(/[;\n]+/); if (raw.length !== 3 || raw.some(row => row.replace(/[()[\]]/g, '').split(/[\s,]+/).filter(Boolean).length !== 3)) throw Error('matrix'); return raw.map(vector) as M }

/** RREF reports inconsistency and nonunique solutions, rather than pretending every frame is invertible. */
export function geometryLinearSolve(a: number[][], rhs: number[]) {
  const n = a[0].length, rows = a.map((row, i) => [...row, rhs[i]]), scale = Math.max(1, ...a.flat().map(Math.abs)), rhsScale = Math.max(1, ...rhs.map(Math.abs)), pivots: number[] = []
  let r = 0
  for (let c = 0; c < n && r < rows.length; c++) {
    let pivot = r
    for (let j = r + 1; j < rows.length; j++) if (Math.abs(rows[j][c]) > Math.abs(rows[pivot][c])) pivot = j
    if (zero(rows[pivot][c], scale)) continue
    ;[rows[r], rows[pivot]] = [rows[pivot], rows[r]]
    const t = rows[r][c]
    for (let k = c; k <= n; k++) rows[r][k] /= t
    for (let j = 0; j < rows.length; j++) if (j !== r) { const v = rows[j][c]; for (let k = c; k <= n; k++) rows[j][k] -= v * rows[r][k] }
    pivots.push(c); r++
  }
  const inconsistent = rows.some(row => row.slice(0, n).every(x => zero(x, scale)) && !zero(row[n], rhsScale))
  const solution = Array(n).fill(0) as number[]
  pivots.forEach((c, i) => { solution[c] = rows[i][n] })
  return { rank: pivots.length, status: inconsistent ? 'none' : pivots.length === n ? 'unique' : 'family', solution }
}

type Panel = 'vectors' | 'incidence' | 'ratio' | 'frame' | 'parametric' | 'quadratic' | 'maps' | 'inversion' | 'planes' | 'spheres'
const panels: Partial<Record<VisualKind, Panel>> = {
  freeVectors: 'vectors', products: 'vectors', incidence: 'incidence', signedRatio: 'ratio', basis: 'frame', affineFrames: 'frame', geoAffineFrame: 'frame',
  curveSurface: 'parametric', geoTangent: 'quadratic', geoCenter: 'quadratic', geoConjugate: 'quadratic', quadraticMatrix: 'quadratic', asymptoticDirections: 'quadratic', quadricRulings: 'quadratic',
  affine: 'maps', isometry: 'maps', geoMotions: 'maps', geoSimilarity: 'maps', geoComposition: 'maps', geoInversion: 'inversion', halfSpaces: 'planes', pencilsBundles: 'planes', radicalSystems: 'spheres', circlePencil: 'spheres', sphereTangency: 'spheres',
}
export function geometryExperiment(kind: VisualKind): GeometryExperiment {
  const panel = panels[kind] ?? 'vectors'
  const configs: Record<Panel, GeometryExperiment> = {
    vectors: { title: b('Vektor bebas dan hasil kali di ℝ³', 'Free vectors and products in ℝ³'), fields: [f('u', 'Vektor u', 'Vector u', '1, 2, 0'), f('v', 'Vektor v', 'Vector v', '0, 1, 2'), f('w', 'Vektor w', 'Vector w', '2, 0, 1'), f('k', 'Skalar k', 'Scalar k', '2')], note: b('Panah menampilkan vektor pada satu titik pangkal. Memindahkan pangkal tidak mengubah vektor bebas. Sudut dihitung dalam ruang, bukan pada proyeksi gambar.', 'Arrows place vectors at one common tail. Moving the tail does not change a free vector. Angles are computed in space, not in the projected picture.') },
    incidence: { title: b('Insidensi titik–garis–bidang', 'Point–line–plane incidence'), fields: [f('a', 'Titik A', 'Point A', '0, 0, 0'), f('b', 'Titik B', 'Point B', '2, 0, 0'), f('c', 'Titik C', 'Point C', '0, 2, 0'), f('p', 'Titik P yang diuji', 'Test point P', '1, 1, 0')], note: b('Tiga titik tidak segaris menentukan satu bidang. Toleransi numerik menguji data ini; percobaan tidak membuktikan aksioma insidensi untuk semua titik.', 'Three noncollinear points determine one plane. Numerical tolerances check these inputs; the experiment does not prove incidence axioms for every point.') },
    ratio: { title: b('Pembagian ruas dengan parameter bertanda', 'Signed segment division'), fields: [f('a', 'Titik A', 'Point A', '-2, 0, 0'), f('b', 'Titik B', 'Point B', '3, 1, 0'), f('t', 'Parameter t (boleh di luar [0,1])', 'Parameter t (may be outside [0,1])', '.4')], note: b('P=A+t(B−A). Rasio koordinat bertanda AP/PB=t/(1−t); rasio tidak terdefinisi saat P=B. Nilai t di luar [0,1] berarti pembagian luar.', 'P=A+t(B−A). The signed coordinate ratio AP/PB=t/(1−t) is undefined at P=B. Values outside [0,1] give external division.') },
    frame: { title: b('Koordinat dalam basis dan kerangka afin', 'Coordinates in a basis and affine frame'), fields: [f('matrix', 'Matriks B: vektor basis sebagai KOLOM', 'Matrix B: basis vectors as COLUMNS', '1, 1, 0; 0, 1, 0; 0, 0, 1', true), f('o', 'Asal kerangka O', 'Frame origin O', '1, 0, 0'), f('p', 'Titik P', 'Point P', '3, 2, 1')], note: b('Selesaikan Bc=P−O. Basis tidak harus ortogonal; matriks singular tidak memberi koordinat unik. Untuk bidang, gunakan komponen z=0 dan basis ketiga (0,0,1).', 'Solve Bc=P−O. A basis need not be orthogonal; a singular matrix gives no unique coordinates. For a plane use z=0 and third basis vector (0,0,1).') },
    parametric: { title: b('Kurva dan permukaan parametrik', 'Parametric curves and surfaces'), fields: [f('x', 'Kurva x(t)', 'Curve x(t)', 'cos(t)'), f('y', 'Kurva y(t)', 'Curve y(t)', 'sin(t)'), f('z', 'Kurva z(t)', 'Curve z(t)', 't/3'), f('t', 'Parameter kurva t', 'Curve parameter t', '1'), f('sx', 'Permukaan x(u,v)', 'Surface x(u,v)', 'u'), f('sy', 'Permukaan y(u,v)', 'Surface y(u,v)', 'v'), f('sz', 'Permukaan z(u,v)', 'Surface z(u,v)', 'u^2-v^2'), f('u', 'Parameter u', 'Parameter u', '.5'), f('v', 'Parameter v', 'Parameter v', '.5')], note: b('Kurva disampling pada −π≤t≤π, permukaan pada −2≤u,v≤2. Turunan memakai beda pusat h=10⁻⁴: hasil merupakan perkiraan lokal. Grafik tidak menjamin regularitas di semua parameter.', 'The curve is sampled on −π≤t≤π and surface on −2≤u,v≤2. Derivatives use centered differences h=10⁻⁴ and are local approximations. The plot does not establish regularity at every parameter.') },
    quadratic: { title: b('Bentuk kuadrat, polar, pusat dan arah', 'Quadratic forms, polars, centers and directions'), fields: [f('matrix', 'Matriks simetris A (3×3)', 'Symmetric matrix A (3×3)', '1,0,0; 0,1,0; 0,0,-1', true), f('a', 'Vektor a pada 2aᵀx', 'Vector a in 2aᵀx', '0,0,0'), f('alpha', 'Konstanta α', 'Constant α', kind === 'quadricRulings' ? '-1' : '0'), f('p', 'Titik p', 'Point p', kind === 'quadricRulings' ? '1,0,0' : '1,0,1'), f('u', 'Arah u', 'Direction u', kind === 'quadricRulings' ? '0,1,1' : '1,0,1'), f('v', 'Arah v', 'Direction v', '1,0,-1')], note: b('F(x)=xᵀAx+2aᵀx+α. Gambar menunjukkan p, arah dan bidang polar/singgung yang sah, bukan seluruh lokus kuadrik. Nilai nol memakai toleransi; klasifikasi lengkap tetap tersedia di Studio.', 'F(x)=xᵀAx+2aᵀx+α. The diagram shows p, directions and a valid polar/tangent plane, not the entire quadric locus. Zero checks use a tolerance; complete classification remains in Studio.') },
    maps: { title: b('Transformasi afin 3D dan urutan komposisi', '3D affine maps and composition order'), fields: [f('matrix', 'Matriks M untuk T(x)=Mx+c', 'Matrix M for T(x)=Mx+c', '0,-1,0; 1,0,0; 0,0,1', true), f('c', 'Translasi c', 'Translation c', '1,0,0'), f('second', 'Matriks N untuk S(x)=Nx+d', 'Matrix N for S(x)=Nx+d', '1,0,0; 0,1,0; 0,0,2', true), f('d', 'Translasi d', 'Translation d', '0,1,0'), f('p', 'Titik P', 'Point P', '2,1,1'), f('q', 'Titik Q', 'Point Q', '0,1,0')], note: b('S∘T memakai NM dan Nc+d; urutan umumnya tidak dapat ditukar. Isometri diuji dari MᵀM=I, similaritas dari MᵀM=k²I dengan k>0. Kesesuaian satu panjang saja tidak cukup.', 'S∘T uses NM and Nc+d; order generally matters. Isometry is checked by MᵀM=I, similarity by MᵀM=k²I with k>0. Agreement of a single length is insufficient.') },
    inversion: { title: b('Inversi terhadap pusat dan kuasa', 'Inversion about a center with a power'), fields: [f('o', 'Pusat O', 'Center O', '0,0,0'), f('p', 'Titik P', 'Point P', '2,1,0'), f('k', 'Kuasa k ≠ 0', 'Power k ≠ 0', '4')], note: b('I(P)=O+k(P−O)/|P−O|². Pusat dikeluarkan dari domain. k<0 membalik arah radial dan tidak mempunyai titik tetap real; inversi bukan transformasi afin.', 'I(P)=O+k(P−O)/|P−O|². The center is excluded from the domain. Negative k reverses radial direction and has no real fixed points; inversion is not affine.') },
    planes: { title: b('Setengah ruang dan pensil bidang', 'Half spaces and plane pencils'), fields: [f('u', 'Normal n₁', 'Normal n₁', '1,0,0'), f('d1', 'Konstanta d₁', 'Constant d₁', '-1'), f('v', 'Normal n₂', 'Normal n₂', '0,1,0'), f('d2', 'Konstanta d₂', 'Constant d₂', '-1'), f('t', 'Parameter λ', 'Parameter λ', '.5'), f('p', 'Titik P', 'Point P', '2,2,1')], note: b('Fλ=(1−λ)F₁+λF₂. Titik pada kedua bidang tetap pada setiap anggota. Nilai tanda n·P+d menentukan sisi dengan normal terpilih; mengalikan persamaan dengan −1 menukar label sisi.', 'Fλ=(1−λ)F₁+λF₂. A point on both planes belongs to every member. The sign of n·P+d identifies a side relative to the chosen normal; negating the equation swaps the side labels.') },
    spheres: { title: b('Pensil bola dan sistem radikal', 'Sphere pencils and radical systems'), fields: [f('o', 'Pusat M₁', 'Center M₁', '0,0,0'), f('r1', 'Jari-jari r₁ > 0', 'Radius r₁ > 0', '2'), f('p', 'Pusat M₂', 'Center M₂', '2,0,0'), f('r2', 'Jari-jari r₂ > 0', 'Radius r₂ > 0', '2'), f('q', 'Pusat M₃', 'Center M₃', '0,2,1'), f('r3', 'Jari-jari r₃ > 0', 'Radius r₃ > 0', '2'), f('t', 'Bobot λ untuk λF₁+(1−λ)F₂', 'Weight λ for λF₁+(1−λ)F₂', '.5')], note: b('Persamaan bola dinormalisasi sehingga koefisien |x|²=1. Radius kuadrat negatif menghasilkan lokus real kosong; dua bidang radikal yang konsisten memberi garis/keluarga, bukan otomatis satu pusat.', 'Sphere equations are normalized to coefficient 1 for |x|². Negative squared radius gives an empty real locus; consistent radical planes give a line/family, not automatically one center.') },
  }
  return configs[panel]
}

function planePaths(n: V, d: number): GeometryObservation['paths'] {
  if (norm(n) < 1e-10) return []
  const center = mul(n, -d / dot(n, n)), u0 = cross(n, Math.abs(n[0]) < .9 * norm(n) ? [1, 0, 0] : [0, 1, 0]), u = mul(u0, 2 / norm(u0)), v0 = cross(n, u), v = mul(v0, 2 / norm(v0))
  return [{ points: [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([s, t]) => add(center, add(mul(u, s), mul(v, t)))), color: 'var(--violet)', dashed: true }]
}
const funcs: Record<string, (x: number) => number> = { sin: Math.sin, cos: Math.cos, tan: Math.tan, sinh: Math.sinh, cosh: Math.cosh, exp: Math.exp, log: Math.log, ln: Math.log, abs: Math.abs, sqrt: Math.sqrt }
function parameterFunction(source: string, variables: string[]) {
  if (source.length > 180) throw Error('expression')
  const ast = parse(source)
  if ([...freeVars(ast)].some(v => ![...variables, 'pi', 'e'].includes(v))) throw Error('variables')
  const evalNode = (n: Node, env: Record<string, number>): number => {
    if (n.t === 'num') return n.v
    if (n.t === 'var') return n.name === 'pi' ? Math.PI : n.name === 'e' ? Math.E : env[n.name]
    if (n.t === 'neg') return -evalNode(n.a, env)
    if (n.t === 'call') { if (!funcs[n.fn]) throw Error('function'); return funcs[n.fn](evalNode(n.a, env)) }
    const a = evalNode(n.a, env), c = evalNode(n.b, env)
    return n.op === '+' ? a + c : n.op === '-' ? a - c : n.op === '*' ? a * c : n.op === '/' ? a / c : a ** c
  }
  return (env: Record<string, number>) => { const x = evalNode(ast, env); if (!Number.isFinite(x) || Math.abs(x) > 1e6) throw Error('domain'); return x }
}

export function observeGeometry(kind: VisualKind, input: Record<string, string>): GeometryObservation {
  const out: GeometryObservation = { lines: [], points: [], paths: [], values: {} }, line = (id: string, en = id) => out.lines.push(b(id, en)), point = (name: string, p: V, color?: string) => out.points.push({ name, p, color }), path = (...points: V[]) => out.paths.push({ points }), V = (key: string) => vector(input[key]), S = (key: string) => scalar(input[key])
  try {
    const panel = panels[kind] ?? 'vectors'
    if (panel === 'vectors') {
      const u = V('u'), v = V('v'), w = V('w'), k = S('k'), cr = cross(u, v), volume = dot(cr, w)
      out.values = { sum: add(u, v), dot: dot(u, v), cross: cr, triple: volume, volume: Math.abs(volume) }
      point('O', [0, 0, 0]); point('u', u); point('v', v); point('u+v', add(u, v)); point('u×v', cr); path([0, 0, 0], u, add(u, v), v, [0, 0, 0]); path([0, 0, 0], cr)
      line(`u+v=${vt(add(u, v))}; ku=${vt(mul(u, k))}; u·v=${fmt(dot(u, v))}`)
      line(`u×v=${vt(cr)}; |u×v|=${fmt(norm(cr))}; (u×v)·w=${fmt(volume)}`)
      line(`Volume paralelipiped = ${fmt(Math.abs(volume))}; orientasi ${volume > 0 ? '+' : volume < 0 ? '−' : '0'}`, `Parallelepiped volume = ${fmt(Math.abs(volume))}; orientation ${volume > 0 ? '+' : volume < 0 ? '−' : '0'}`)
      line(norm(u) && norm(v) ? `θ=${fmt(Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (norm(u) * norm(v))))) * 180 / Math.PI)}°` : 'θ tidak terdefinisi: ada vektor nol', norm(u) && norm(v) ? `θ=${fmt(Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (norm(u) * norm(v))))) * 180 / Math.PI)}°` : 'θ is undefined: a vector is zero')
    } else if (panel === 'incidence') {
      const a = V('a'), c = V('c'), bb = V('b'), p = V('p'), u = sub(bb, a), v = sub(c, a), n = cross(u, v)
      point('A', a); point('B', bb); point('C', c); point('P', p); path(a, bb, c, a)
      line(`(B−A)×(C−A)=${vt(n)}`)
      if (zero(norm(u))) line('A=B: garis AB tidak unik.', 'A=B: the line AB is not unique.')
      else line(`Jarak P ke garis AB = ${fmt(norm(cross(sub(p, a), u)) / norm(u))}`, `Distance from P to line AB = ${fmt(norm(cross(sub(p, a), u)) / norm(u))}`)
      if (zero(norm(n))) line('A,B,C segaris/berimpit: bidang unik tidak ada.', 'A,B,C are collinear/coincident: no unique plane.')
      else { const residual = dot(n, sub(p, a)); line(`n·(P−A)=${fmt(residual)} → ${zero(residual, norm(n) * norm(sub(p, a))) ? 'P pada bidang' : 'P di luar bidang'}`, `n·(P−A)=${fmt(residual)} → ${zero(residual, norm(n) * norm(sub(p, a))) ? 'P lies on the plane' : 'P lies outside the plane'}`); out.paths.push(...planePaths(n, -dot(n, a))) }
    } else if (panel === 'ratio') {
      const a = V('a'), bb = V('b'), t = S('t'), p = add(a, mul(sub(bb, a), t))
      point('A', a); point('B', bb); point('P', p); path(a, bb); path(a, p)
      line(`P=(1−t)A+tB=${vt(p)}`); line(zero(1 - t) ? 't=1: AP/PB tidak terdefinisi (P=B).' : `AP/PB=${fmt(t / (1 - t))}`, zero(1 - t) ? 't=1: AP/PB is undefined (P=B).' : `AP/PB=${fmt(t / (1 - t))}`)
      if (zero(norm(sub(bb, a)))) line('A=B: ruas degenerat; rasio jarak tidak mempunyai arti.', 'A=B: degenerate segment; a distance ratio is not meaningful.')
      else line(t < 0 || t > 1 ? 'Pembagian luar.' : t === 0 || t === 1 ? 'Titik ujung.' : 'Pembagian dalam.', t < 0 || t > 1 ? 'External division.' : t === 0 || t === 1 ? 'Endpoint.' : 'Internal division.')
    } else if (panel === 'frame') {
      const m = matrix(input.matrix), o = V('o'), p = V('p'), rhs = sub(p, o), solved = geometryLinearSolve(m, rhs), columns = transpose(m)
      out.values = { determinant: det(m), rank: solved.rank, status: solved.status, coordinates: solved.solution, reconstructed: add(o, mv(m, solved.solution as V)) }
      point('O', o); point('P', p); columns.forEach((v, i) => { point(`b${i + 1}`, add(o, v)); path(o, add(o, v)) })
      line(`det B=${fmt(det(m))}; rank B=${solved.rank}`)
      if (solved.status !== 'unique') line(solved.status === 'none' ? 'P tidak berada pada rentang kerangka; tidak ada koordinat.' : 'Kerangka singular: koordinat tidak unik.', solved.status === 'none' ? 'P is outside the frame span; no coordinates.' : 'Singular frame: coordinates are not unique.')
      else { const c = solved.solution as V; line(`c=B⁻¹(P−O)=${vt(c)}; O+Bc=${vt(add(o, mv(m, c)))}`); let cursor = o; columns.forEach((v, i) => { const next = add(cursor, mul(v, c[i])); path(cursor, next); cursor = next }); line(`BᵀB=${mm(transpose(m), m).map(vt).join('; ')}`) }
    } else if (panel === 'parametric') {
      const curveFns = ['x', 'y', 'z'].map(k => parameterFunction(input[k], ['t'])), surfaceFns = ['sx', 'sy', 'sz'].map(k => parameterFunction(input[k], ['u', 'v'])), curve = (t: number): V => curveFns.map(fn => fn({ t })) as V, surface = (u: number, v: number): V => surfaceFns.map(fn => fn({ u, v })) as V, t = S('t'), u = S('u'), v = S('v'), h = 1e-4, p = curve(t), q = surface(u, v), tangent = mul(sub(curve(t + h), curve(t - h)), 1 / (2 * h)), su = mul(sub(surface(u + h, v), surface(u - h, v)), 1 / (2 * h)), sv = mul(sub(surface(u, v + h), surface(u, v - h)), 1 / (2 * h)), n = cross(su, sv)
      point('r(t)', p); point('s(u,v)', q); path(p, add(p, tangent)); path(q, add(q, mul(n, norm(n) ? 1 / norm(n) : 0)))
      out.paths.push({ points: Array.from({ length: 121 }, (_, i) => curve(-Math.PI + 2 * Math.PI * i / 120)), color: 'var(--warn)' })
      for (let j = -2; j <= 2; j += .5) for (const flip of [false, true]) out.paths.push({ points: Array.from({ length: 41 }, (_, i) => surface(flip ? j : -2 + i / 10, flip ? -2 + i / 10 : j)), color: 'var(--border-strong)' })
      line(`r(t)=${vt(p)}; r′(t)≈${vt(tangent)}; |r′|≈${fmt(norm(tangent))}`); line(`sᵤ≈${vt(su)}; sᵥ≈${vt(sv)}; sᵤ×sᵥ≈${vt(n)}`)
      line(zero(norm(n)) ? 'Normal numerik nol: parameterisasi dapat singular di titik ini.' : 'Normal numerik bukan nol: kandidat bidang singgung lokal.', zero(norm(n)) ? 'The numerical normal vanishes: the parametrization may be singular here.' : 'The numerical normal is nonzero: a candidate local tangent plane.')
    } else if (panel === 'quadratic') {
      const a = matrix(input.matrix), l = V('a'), alpha = S('alpha'), p = V('p'), u = V('u'), v = V('v'), ap = add(mv(a, p), l), fp = dot(p, mv(a, p)) + 2 * dot(l, p) + alpha
      if (!a.every((row, i) => row.every((x, j) => zero(x - a[j][i])))) throw Error('symmetric')
      point('p', p); point('p+u', add(p, u)); point('p+v', add(p, v)); path(p, add(p, u)); path(p, add(p, v))
      line(`F(p)=${fmt(fp)}; ∇F(p)=2(Ap+a)=${vt(mul(ap, 2))}`)
      const polarConstant = dot(l, p) + alpha
      if (zero(norm(ap))) line(zero(polarConstant) ? 'Polar degenerat: seluruh ruang (0=0); tidak ada bidang unik.' : 'Polar degenerat: lokus kosong (konstanta ≠ 0).', zero(polarConstant) ? 'Degenerate polar: all space (0=0); no unique plane.' : 'Degenerate polar: empty locus (nonzero constant).')
      else { line(`Polar: ${vt(ap)}·x + ${fmt(polarConstant)} = 0`); out.paths.push(...planePaths(ap, polarConstant)); line(zero(fp) ? 'p pada lokus dan gradien bukan nol: polar adalah bidang singgung.' : 'p bukan pada lokus: ini polar, bukan bidang singgung di p.', zero(fp) ? 'p lies on the locus and the gradient is nonzero: the polar is the tangent plane.' : 'p is off the locus: this is a polar, not a tangent plane at p.') }
      const q = dot(u, mv(a, u)), conjugate = dot(u, mv(a, v)), first = 2 * dot(ap, u)
      out.values = { functionValue: fp, gradient: mul(ap, 2), polarNormal: ap, polarConstant, conjugate, directionQuadratic: q, lineCoefficients: [fp, first, q] }
      line(`uᵀAv=${fmt(conjugate)}; uᵀAu=${fmt(q)}`)
      line(`F(p+tu)=F(p)+(${fmt(first)})t+(${fmt(q)})t²`)
      line(zero(norm(u)) ? 'u=0: bukan arah garis.' : zero(fp) && zero(first) && zero(q) ? 'Ketiga koefisien nol: seluruh garis p+tu berada pada lokus (dalam toleransi).' : 'Garis p+tu tidak seluruhnya berada pada lokus.', zero(norm(u)) ? 'u=0: not a line direction.' : zero(fp) && zero(first) && zero(q) ? 'All three coefficients vanish: the entire line p+tu lies on the locus (within tolerance).' : 'The line p+tu is not wholly contained in the locus.')
      const centers = geometryLinearSolve(a, mul(l, -1)); line(`rank A=${centers.rank}; det A=${fmt(det(a))}`)
      line(centers.status === 'none' ? 'Ax=−a tidak konsisten: tidak ada pusat aljabar.' : `Pusat aljabar ${centers.status === 'unique' ? 'unik' : 'berkeluarga'}: ${vt(centers.solution)}${centers.status === 'family' ? ' + ker A' : ''}`, centers.status === 'none' ? 'Ax=−a is inconsistent: no algebraic center.' : `Algebraic center ${centers.status === 'unique' ? 'unique' : 'family'}: ${vt(centers.solution)}${centers.status === 'family' ? ' + ker A' : ''}`)
    } else if (panel === 'maps') {
      const m = matrix(input.matrix), n = matrix(input.second), c = V('c'), d = V('d'), p = V('p'), q = V('q'), tp = add(mv(m, p), c), sp = add(mv(n, tp), d), reverse = add(mv(m, add(mv(n, p), d)), c), tq = add(mv(m, q), c), gram = mm(transpose(m), m), k2 = gram[0][0], similarity = k2 > 0 && gram.every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? k2 : 0)) <= 1e-8 * k2)), fullRank = geometryLinearSolve(m, [0,0,0]).rank === 3
      out.values = { firstImage: tp, composedImage: sp, reverseImage: reverse, compositionMatrix: mm(n, m).flat(), compositionTranslation: add(mv(n, c), d), gram: gram.flat(), determinant: det(m), similarity: similarity ? 'yes' : 'no' }
      point('P', p); point('T(P)', tp); point('S(T(P))', sp); point('T(S(P))', reverse); point('Q', q); point('T(Q)', tq); path(p, tp, sp); path(p, reverse); path(p, q); path(tp, tq)
      line(`T(P)=${vt(tp)}; S(T(P))=${vt(sp)}; T(S(P))=${vt(reverse)}`); line(`NM=${mm(n, m).map(vt).join('; ')}; Nc+d=${vt(add(mv(n, c), d))}`); line(`MᵀM=${gram.map(vt).join('; ')}; det M=${fmt(det(m))}`)
      line(similarity ? `Similaritas: k=${fmt(Math.sqrt(k2))}${zero(k2 - 1) ? ' (isometri)' : ''}; ${det(m) < 0 ? 'orientasi berbalik' : 'orientasi tetap'}.` : !fullRank ? 'Peta singular dalam toleransi: bukan transformasi afin invertibel.' : 'Afin invertibel, tetapi bukan similaritas/isometri.', similarity ? `Similarity: k=${fmt(Math.sqrt(k2))}${zero(k2 - 1) ? ' (isometry)' : ''}; orientation ${det(m) < 0 ? 'reverses' : 'preserves'}.` : !fullRank ? 'Numerically singular map: not an invertible affine transformation.' : 'Invertible affine map, but not a similarity/isometry.')
      line(`|PQ|=${fmt(norm(sub(p, q)))}; |T(P)T(Q)|=${fmt(norm(sub(tp, tq)))}`)
    } else if (panel === 'inversion') {
      const o = V('o'), p = V('p'), k = S('k'), u = sub(p, o), r2 = dot(u, u)
      if (k === 0 || r2 === 0) throw Error('inversion')
      const image = add(o, mul(u, k / r2)), twice = add(o, mul(sub(image, o), k / dot(sub(image, o), sub(image, o))))
      out.values = { image, doubleImage: twice, radiusProduct: norm(u) * norm(sub(image, o)), power: k }
      point('O', o); point('P', p); point('I(P)', image); path(o, p); path(o, image)
      const r = Math.sqrt(Math.abs(k)); out.paths.push({ points: Array.from({ length: 81 }, (_, i) => add(o, [r * Math.cos(i * Math.PI / 40), r * Math.sin(i * Math.PI / 40), 0])), dashed: true })
      line(`I(P)=${vt(image)}; I(I(P))=${vt(twice)}`); line(`|OP|·|OI(P)|=${fmt(norm(u) * norm(sub(image, o)))}=|k|`)
      line(k > 0 ? `Titik tetap: bola |P−O|=√k=${fmt(r)} (irisan lingkaran ditampilkan).` : 'k<0: tidak ada titik tetap real; arah radial berlawanan.', k > 0 ? `Fixed points: sphere |P−O|=√k=${fmt(r)} (a circle section is shown).` : 'k<0: no real fixed points; the radial direction reverses.')
    } else if (panel === 'planes') {
      const n1 = V('u'), n2 = V('v'), d1 = S('d1'), d2 = S('d2'), t = S('t'), p = V('p'), n = add(mul(n1, 1 - t), mul(n2, t)), d = (1 - t) * d1 + t * d2
      point('P', p); out.paths.push(...planePaths(n1, d1), ...planePaths(n2, d2), ...planePaths(n, d))
      line(`nλ=${vt(n)}; dλ=${fmt(d)}; Fλ(P)=${fmt(dot(n, p) + d)}`)
      if (zero(norm(n))) line(zero(d) ? 'Anggota degenerat: seluruh ruang.' : 'Anggota degenerat: kosong.', zero(d) ? 'Degenerate member: all space.' : 'Degenerate member: empty.')
      else line(`Jarak bertanda = ${fmt((dot(n, p) + d) / norm(n))}`, `Signed distance = ${fmt((dot(n, p) + d) / norm(n))}`)
      const solved = geometryLinearSolve([n1, n2], [-d1, -d2]); line(solved.status === 'none' ? 'Dua bidang pembentuk tidak berpotongan.' : `Titik pada irisan: ${vt(solved.solution)}; rank=${solved.rank}.`, solved.status === 'none' ? 'The generating planes do not intersect.' : `One point on the intersection: ${vt(solved.solution)}; rank=${solved.rank}.`)
    } else if (panel === 'spheres') {
      const c1 = V('o'), c2 = V('p'), c3 = V('q'), r1 = S('r1'), r2 = S('r2'), r3 = S('r3'), t = S('t')
      if ([r1, r2, r3].some(r => r <= 0)) throw Error('radius')
      const sig1 = dot(c1, c1) - r1 * r1, sig2 = dot(c2, c2) - r2 * r2, sig3 = dot(c3, c3) - r3 * r3, n12 = mul(sub(c2, c1), 2), n13 = mul(sub(c3, c1), 2), d12 = sig1 - sig2, d13 = sig1 - sig3, center = add(mul(c1, t), mul(c2, 1 - t)), radius2 = dot(center, center) - (t * sig1 + (1 - t) * sig2), common = geometryLinearSolve([n12, n13], [-d12, -d13])
      point('M₁', c1); point('M₂', c2); point('M₃', c3); point('Mλ', center); out.paths.push(...planePaths(n12, d12), ...planePaths(n13, d13))
      for (const [c, r] of [[c1, r1], [c2, r2], ...(radius2 > 0 ? [[center, Math.sqrt(radius2)]] : [])] as [V, number][]) for (const axis of [0, 1, 2]) out.paths.push({ points: Array.from({ length: 65 }, (_, i) => { const v: V = [0, 0, 0]; v[(axis + 1) % 3] = r * Math.cos(i * Math.PI / 32); v[(axis + 2) % 3] = r * Math.sin(i * Math.PI / 32); return add(c, v) }), color: 'var(--border-strong)' })
      line(`Radikal 12: ${vt(n12)}·x+${fmt(d12)}=0; Radikal 13: ${vt(n13)}·x+${fmt(d13)}=0`, `Radical 12: ${vt(n12)}·x+${fmt(d12)}=0; Radical 13: ${vt(n13)}·x+${fmt(d13)}=0`)
      line(common.status === 'none' ? 'Sistem radikal tidak konsisten.' : `Sistem radikal rank=${common.rank}: ${vt(common.solution)} + ker N.`, common.status === 'none' ? 'The radical system is inconsistent.' : `Radical system rank=${common.rank}: ${vt(common.solution)} + ker N.`)
      line(`Pensil: Mλ=${vt(center)}; rλ²=${fmt(radius2)}`, `Pencil: Mλ=${vt(center)}; rλ²=${fmt(radius2)}`)
      line(radius2 < -1e-8 ? 'Tidak ada bola real pada parameter ini.' : zero(radius2) ? 'Anggota hanya satu titik.' : `Bola real: rλ=${fmt(Math.sqrt(radius2))}.`, radius2 < -1e-8 ? 'There is no real sphere at this parameter.' : zero(radius2) ? 'The member is a single point.' : `Real sphere: rλ=${fmt(Math.sqrt(radius2))}.`)
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : ''
    out.error = reason === 'symmetric' ? b('A harus simetris: aᵢⱼ=aⱼᵢ.', 'A must be symmetric: aᵢⱼ=aⱼᵢ.') : reason === 'inversion' ? b('Inversi membutuhkan k≠0 dan P≠O.', 'Inversion requires k≠0 and P≠O.') : reason === 'radius' ? b('Semua jari-jari harus positif.', 'Every radius must be positive.') : b('Periksa masukan: vektor berisi 2/3 angka, matriks 3 baris, nilai berhingga ≤10⁶. Ekspresi hanya memakai parameter yang tertera dan fungsi real; semua sampel harus terdefinisi.', 'Check inputs: vectors need 2/3 numbers, matrices need 3 rows, and values must be finite with magnitude ≤10⁶. Expressions use only the stated parameters and real functions; every sample must be defined.')
    out.points = []; out.paths = []; out.lines = []; out.values = {}
  }
  return out
}
