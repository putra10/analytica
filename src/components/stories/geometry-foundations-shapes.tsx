import type { FoundationsKind } from '../../content/geometry-foundations-topics'
import { Arrow, At, C, Dot, Grid, T, plane, pl, tr, type Lang, type P } from './kit'

const ob = (x: number, y: number, z: number): P => [205 + 38 * (x + .55 * y), 230 - 38 * (z + .35 * y)]
const line = (a: P, z: P, color: string, dash?: string) => <path d={pl([a, z])} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={dash} />
const unitCircle = (z: number, radius = 1): P[] => Array.from({ length: 49 }, (_, i) => ob(radius * Math.cos(i * Math.PI / 24), radius * Math.sin(i * Math.PI / 24), z))
const axes = () => <>{line(ob(-2, 0, 0), ob(2.8, 0, 0), C.ln)}{line(ob(0, -2, 0), ob(0, 2.8, 0), C.ln)}{line(ob(0, 0, -.2), ob(0, 0, 4.3), C.ln)}<T x={318} y={246} size={12}>x</T><T x={275} y={198} size={12}>y</T><T x={205} y={56} size={12}>z</T></>

export function FoundationsScene({ kind, frame: k, value, lang }: {kind: FoundationsKind; frame: number; value: number; lang: Lang}) {
  const t = tr(lang)
  if (kind === 'incidence') {
    const a: P = [80, 240], z: P = [380, 240], c: P = [230, 40], d: P = [278, 173]
    return <>
      <At from={1} frame={k}><path d={pl([a, z, c], true)} fill={C.soft} fillOpacity=".5" stroke={C.a} strokeWidth="2" /><T x={135} y={85} color={C.a} size={15}>π = ABC</T><T x={365} y={90} color={C.v} size={15}>D ∉ π</T></At>
      {[a, z, c].map((p, i, arr) => <g key={i}>{line(p, arr[(i + 1) % 3], C.ln)}{line(p, d, C.ln, '5 5')}</g>)}
      <At from={2} frame={k}>{line(a, z, C.g)}<T x={220} y={270} color={C.g} size={15}>l = AB ⊂ π</T></At>
      {[a, z, c, d].map((p, i) => <g key={i}><Dot at={p} color={i === 3 ? C.v : C.a} /><T x={p[0] + (i === 1 ? 18 : -15)} y={p[1] + (i === 2 ? -12 : 5)} size={16}>{['A', 'B', 'C', 'D'][i]}</T></g>)}
      <T x={240} y={294} size={12} color={C.mu}>{t('Skema: garis = pasangan, bidang = tripel', 'Schematic: lines = pairs, planes = triples')}</T>
    </>
  }
  if (kind === 'freeVectors') {
    const p = plane([60, 252], 33)
    return <><Grid map={p} x={[0, 10]} y={[0, 6]} />
      <Arrow from={p(1, 1)} to={p(4, 3)} color={C.a} /><Dot at={p(1, 1)} color={C.a} r={4} /><T x={87} y={234} size={13}>A</T><T x={196} y={140} size={13}>B</T>
      <T x={355} y={75} color={C.a} size={15}>v = (3, 2)</T>
      <At from={1} frame={k}><Arrow from={p(1, 3)} to={p(4, 5)} color={C.g} /><T x={83} y={164} size={13} color={C.g}>A′</T><T x={200} y={80} size={13} color={C.g}>B′</T><T x={355} y={102} size={14} color={C.g}>B′ − A′ = B − A</T></At>
      <At from={2} frame={k}><Arrow from={p(8, 3)} to={p(5, 1)} color={C.v} /><Arrow from={p(6, 4)} to={p(6+3/Math.sqrt(13),4+2/Math.sqrt(13))} color={C.y} /><T x={355} y={147} size={15} color={C.v}>−v = (−3, −2)</T><T x={350} y={174} size={14}>|v| = |−v| = √13</T><T x={350} y={204} size={13} color={C.y}>v / √13: {t('satuan', 'unit')}</T></At>
    </>
  }
  if (kind === 'signedRatio') {
    const p = (x: number): P => [150 + x * 24, 160], c = 6 * value, kap = Math.abs(1 - value) < 1e-9 ? null : value / (1 - value)
    return <>{line([20, 160], [455, 160], C.ln)}<Arrow from={[435, 160]} to={[465, 160]} color={C.mu} />
      {line(p(0), p(6), C.a)}<Dot at={p(0)} color={C.a} /><Dot at={p(6)} color={C.a} /><T x={150} y={195}>A = 0</T><T x={294} y={195}>B = 6</T>
      <Dot at={p(c)} color={value > 0 && value < 1 ? C.g : C.v} r={8} /><T x={p(c)[0]} y={125} color={C.g}>C = {+c.toFixed(2)}</T>
      <At from={1} frame={k}><T x={240} y={50} size={17}>{t('AC berarah', 'signed AC')} = {+c.toFixed(2)}</T><T x={240} y={80} size={17}>{t('CB berarah', 'signed CB')} = {+(6 - c).toFixed(2)}</T></At>
      <At from={2} frame={k}><T x={240} y={240} size={16} color={kap === null ? C.r : C.g}>κ = {kap === null ? t('tidak terdefinisi', 'undefined') : +kap.toFixed(2)}</T><T x={240} y={274} size={14}>{value > 0 && value < 1 ? t('pembagian dalam', 'internal division') : value === 1 ? t('C = B: penyebut nol', 'C = B: denominator zero') : t('pembagian luar / ujung', 'external division / endpoint')}</T></At>
    </>
  }
  if (kind === 'affineFrames') {
    const p = plane([75, 246], 65), tip = p(2, 1)
    return <><Grid map={p} x={[0, 4]} y={[0, 3]} /><Arrow from={p(0, 0)} to={tip} color={C.v} /><T x={tip[0] + 25} y={tip[1] - 13} color={C.v}>v = (2, 1)</T>
      <At until={1} frame={k}><Arrow from={p(0, 0)} to={p(1, 0)} color={C.a} /><Arrow from={p(0, 0)} to={p(1, 1)} color={C.g} /><Arrow from={p(1, 0)} to={tip} color={C.g} dash="4 4" /><T x={107} y={270} color={C.a}>e₁</T><T x={98} y={207} color={C.g}>e₂</T><T x={360} y={65} size={15}>v = e₁ + e₂</T><T x={360} y={95} size={13}>{t('koordinat miring', 'oblique coordinates')}</T><T x={360} y={122} size={17} color={C.g}>(1, 1)</T></At>
      <At from={1} until={1} frame={k}><T x={360} y={165} size={14}>G = [1 1; 1 2]</T><T x={360} y={194} size={16}>|v|² = 1 + 2 + 2</T><T x={360} y={222} size={17} color={C.v}>= 5</T></At>
      <At from={2} frame={k}><Arrow from={p(0, 0)} to={p(1, 0)} color={C.a} /><Arrow from={p(0, 0)} to={p(0, 1)} color={C.g} />{line(p(2, 0), tip, C.mu, '4 4')}<T x={360} y={65} size={15}>v = 2i + j</T><T x={360} y={95} size={13}>{t('koordinat ortonormal', 'orthonormal coordinates')}</T><T x={360} y={125} size={17} color={C.g}>(2, 1)</T><T x={360} y={178} size={16}>G = I</T><T x={360} y={213} size={17}>|v|² = 2² + 1² = 5</T></At>
    </>
  }
  if (kind === 'curveSurface') {
    if (k === 2) return <><T x={240} y={46} size={17}>{t('Dua syarat harus independen', 'Two constraints must be independent')}</T><rect x="25" y="75" width="210" height="150" fill={C.soft} rx="15" /><rect x="245" y="75" width="210" height="150" fill={C.soft} rx="15" /><T x={130} y={113} size={16}>x² + y² = 1</T><T x={130} y={145} size={16}>2x² + 2y² = 2</T><T x={130} y={188} size={14} color={C.y}>{t('syarat sama: silinder', 'same constraint: cylinder')}</T><T x={350} y={113} size={15}>x² + y² + z² = 0</T><Dot at={[350, 162]} color={C.v} /><T x={350} y={199} size={14}>{t('satu titik saja', 'only one point')}</T><T x={240} y={268} size={14}>{t('Jumlah persamaan ≠ otomatis dimensi', 'Equation count ≠ automatic dimension')}</T></>
    const z = k === 0 ? 0 : value
    return <>{axes()}
      <At from={1} frame={k}>{[0, .8, 1.6, 2.4, 3.2].map(h => <path key={h} d={pl(unitCircle(h), true)} fill="none" stroke={C.ln} />)}{[0, Math.PI / 2, Math.PI, 3 * Math.PI / 2].map(a => <g key={a}>{line(ob(Math.cos(a), Math.sin(a), 0), ob(Math.cos(a), Math.sin(a), 3.2), C.ln)}</g>)}</At>
      <path d={pl(unitCircle(z), true)} fill={C.soft} fillOpacity=".4" stroke={C.a} strokeWidth="3" />
      <Dot at={ob(Math.cos(.7), Math.sin(.7), z)} color={C.v} r={7} />
      <T x={240} y={280} size={14}>{k === 0 ? '(cos t, sin t, 0): 1 '+t('parameter', 'parameter') : '(cos u, sin u, v): 2 '+t('parameter', 'parameters')}</T>
      <T x={390} y={65} size={14}>{k === 0 ? 'z = 0' : 'v = '+value.toFixed(1)}</T>
    </>
  }
  if (kind === 'lineSystems') {
    if (k === 2) return <><T x={240} y={40} size={17}>{t('Periksa konsistensi', 'Check consistency')}</T>{['x = 0', 'x = 1', 'y = 0', '2y = 0'].map((v, i) => <T key={v} x={130} y={85 + i * 35} size={20} color={i < 2 ? C.r : C.a}>{v}</T>)}<T x={348} y={105} size={15}>rank A = 2</T><T x={348} y={140} size={15}>rank [A | b] = 3</T><T x={348} y={185} size={17} color={C.r}>{t('Tidak ada solusi', 'No solution')}</T><T x={240} y={260} size={14}>det [A | b] = 0 ≠ {t('jaminan solusi', 'a guarantee of a solution')}</T></>
    const mode = k === 0 ? 1 : value, h = mode === 2 ? 2 : 0
    return <>{axes()}{line(ob(-3, 0, 0), ob(3, 0, 0), C.a)}{mode === 1 ? line(ob(-3, 1.5, 0), ob(3, 1.5, 0), C.g) : line(ob(0, -3, h), ob(0, 3, h), C.g)}<Dot at={ob(0, 0, 0)} color={C.a} /><At from={1} frame={k}>{mode === 2 && <>{line(ob(0, 0, 0), ob(0, 0, 2), C.r, '5 5')}<Dot at={ob(0, 0, 2)} color={C.g} /></>}</At><T x={240} y={45} size={18}>{[t('Berpotongan', 'Intersecting'), t('Sejajar berbeda', 'Distinct parallel'), t('Bersilangan', 'Skew')][mode]}</T><T x={240} y={270} size={15}>{mode === 1 ? 'u × v = 0, (q−p) × u ≠ 0' : '(q−p)·(u × v) = '+h}</T></>
  }
  if (kind === 'spatialDistances') {
    if (k === 0) {
      const p = plane([90, 245], 40)
      return <><Grid map={p} x={[0, 7]} y={[0, 4]} />{line(p(0, 0), p(7, 0), C.a)}{line(p(2, 0), p(2, 3), C.g)}{line(p(0, 0), p(2, 3), C.v)}<Dot at={p(2, 3)} color={C.v} /><Dot at={p(2, 0)} color={C.g} /><T x={170} y={100} color={C.v}>P = (2, 3)</T><T x={170} y={273} color={C.g}>Q = (2, 0)</T><T x={318} y={100} size={16}>u = (1, 0)</T><T x={318} y={140} size={16}>t = (P·u) / |u|²</T><T x={318} y={172} size={16}>= 2</T><T x={318} y={209} size={17} color={C.g}>d = 3</T></>
    }
    return <>{axes()}{[0, 2].map(h => <path key={h} d={pl([ob(-2, -2, h), ob(2, -2, h), ob(2, 2, h), ob(-2, 2, h)], true)} fill={C.soft} fillOpacity=".3" stroke={C.ln} />)}{line(ob(-3, 0, 0), ob(3, 0, 0), C.a)}{line(ob(0, -3, 2), ob(0, 3, 2), C.g)}{line(ob(0, 0, 0), ob(0, 0, 2), C.v)}<Dot at={ob(0, 0, 0)} color={C.a} /><Dot at={ob(0, 0, 2)} color={C.g} /><T x={230} y={190} color={C.v}>2</T><T x={370} y={76} size={16}>n = e₁ × e₂ = e₃</T><T x={370} y={108} size={15}>d = |(q−p)·n|</T><At from={2} frame={k}><T x={370} y={148} size={15}>P₂ − P₁ = (−t,s,2)</T><T x={370} y={178} size={15}>−t = 0, s = 0</T><T x={370} y={211} size={17} color={C.v}>|P₂ − P₁| = 2</T></At><T x={240} y={282} size={14}>{t('Proyeksi 3D: normal bersama e₃', '3D projection: common normal e₃')}</T></>
  }
  if (kind === 'halfSpaces') {
    const p = plane([60, 246], 70), fa = -2, fb = value - 2, cross = fa / (fa - fb), mp = p(value * cross, 0)
    return <><path d={pl([p(0, 0), p(2, 0), p(0, 2)], true)} fill={C.r} fillOpacity=".12" /><path d={pl([p(2, 0), p(5, 0), p(5, 3), p(0, 3), p(0, 2)], true)} fill={C.g} fillOpacity=".12" /><Grid map={p} x={[0, 5]} y={[0, 3]} />{line(p(0, 2), p(2, 0), C.fg)}<T x={150} y={102} size={15}>F = x+y−2 = 0</T><T x={99} y={198} size={14} color={C.r}>F &lt; 0</T><T x={296} y={100} size={14} color={C.g}>F &gt; 0</T>{line(p(0, 0), p(value, 0), C.v)}<Dot at={p(0, 0)} color={C.r} /><Dot at={p(value, 0)} color={fb < 0 ? C.r : fb === 0 ? C.y : C.g} /><T x={60} y={274}>A</T><T x={p(value, 0)[0]} y={274}>B</T><At from={1} frame={k}><T x={356} y={151} size={14}>F(A) = −2</T><T x={356} y={180} size={14}>F(B) = {fb.toFixed(1)}</T></At><At from={2} frame={k}>{value >= 2 && <Dot at={mp} color={C.y} r={8} />}<T x={356} y={216} size={14} color={C.y}>{value > 2 ? 't* = '+cross.toFixed(2) : value === 2 ? t('ujung pada batas', 'endpoint on boundary') : t('tidak menyeberang', 'no crossing')}</T></At></>
  }
  if (kind === 'pencilsBundles') {
    if (k === 2) return <>{axes()}{[0, 1, 2].map(i => <path key={i} d={pl(i === 0 ? [ob(0,-2,-1),ob(0,2,-1),ob(0,2,3),ob(0,-2,3)] : i===1 ? [ob(-2,0,-1),ob(2,0,-1),ob(2,0,3),ob(-2,0,3)] : [ob(-2,-2,0),ob(2,-2,0),ob(2,2,0),ob(-2,2,0)],true)} fill={[C.a,C.g,C.v][i]} fillOpacity=".12" stroke={[C.a,C.g,C.v][i]} />)}<Dot at={ob(0,0,0)} color={C.y} r={7} /><T x={240} y={30} size={16}>{t('Bundel bidang melalui O', 'Plane bundle through O')}</T><T x={240} y={285} size={17}>λx + μy + νz = 0</T></>
    const p=plane([220,170],32)
    return <>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/8;return <g key={i}>{line(p(-5*Math.cos(a),-5*Math.sin(a)),p(5*Math.cos(a),5*Math.sin(a)),C.ln)}</g>})}<Dot at={p(0,0)} color={C.y} r={7}/><T x={240} y={30} size={17}>{t('Semua garis memuat titik basis', 'All lines contain the base point')}</T><At from={1} frame={k}>{line(p(-4,2),p(4,-2),C.g)}<Dot at={p(3,-1.5)} color={C.g}/><T x={340} y={210} color={C.g}>A</T><T x={240} y={281} size={16}>λF₁(A) + μF₂(A) = 0</T></At></>
  }
  return <>{axes()}
    {k === 0 ? <>{[0,1,2,3].map(h=><path key={h} d={pl(unitCircle(h),true)} fill="none" stroke={h===value?C.a:C.ln}/>) }{[0,Math.PI/2,Math.PI,3*Math.PI/2].map(a=><g key={a}>{line(ob(Math.cos(a),Math.sin(a),0),ob(Math.cos(a),Math.sin(a),3),C.a)}</g>)}<T x={390} y={68} size={16}>x²+y² = 1</T><T x={390} y={99} size={14}>{t('z bebas', 'z is free')}</T></> : <>{[-1,1,2,3].map(h=><path key={h} d={pl(unitCircle(h,Math.abs(h)),true)} fill="none" stroke={C.ln}/>) }{[0,Math.PI/2,Math.PI,3*Math.PI/2].map(a=><g key={a}>{line(ob(-Math.cos(a),-Math.sin(a),-1),ob(3*Math.cos(a),3*Math.sin(a),3),C.a)}</g>)}<Dot at={ob(0,0,0)} color={C.y}/><T x={380} y={70} size={15}>x²+y²−z² = 0</T><T x={390} y={101} size={14}>{t('puncak O', 'vertex O')}</T><At from={2} frame={k}><T x={240} y={280} size={14}>{t('Geser koordinat → geser puncak', 'Translate coordinates → translate vertex')}</T></At></>}
  </>
}
