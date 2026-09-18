import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { BookOpen, Layers, Move3d } from 'lucide-react'
import { linePlane, twoLines, distPointPlane, projectOnPlane, type Line3, type Plane3 } from '../../lib/geometry3d'
import { add3, norm3, scale3, unit3, type Vec3 } from '../../lib/quadrics'
import { useT } from '../../lib/i18n'
import { fmt, signed } from '../../lib/utils'
import { Layout, NumInput } from '../ui/Layout'
import { MathCard, Chip, Toggle } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

const deg = (r: number) => `${((r * 180) / Math.PI).toFixed(1)}^\\circ`
const vecTex = (v: Vec3) => `(${v.map((x) => fmt(x)).join(', ')})`
const lineTex = (l: Line3, name: string) =>
  `${name}:\\; \\frac{x ${signed(-l.p[0])}}{${fmt(l.v[0])}} = \\frac{y ${signed(-l.p[1])}}{${fmt(l.v[1])}} = \\frac{z ${signed(-l.p[2])}}{${fmt(l.v[2])}}`
const planeTex = (pl: Plane3) => `\\pi:\\; ${fmt(pl.n[0])}\\,x ${signed(pl.n[1])}\\,y ${signed(pl.n[2])}\\,z ${signed(pl.D)} = 0`

function Vec3Input({ label, value, onChange }: { label: string; value: Vec3; onChange: (v: Vec3) => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-1">
      <span className="pr-1 text-[11px] text-slate-400"><Tex tex={label} /></span>
      {[0, 1, 2].map((i) => (
        <NumInput key={i} label={'xyz'[i]} value={value[i]} onChange={(x) => { const v = [...value] as Vec3; v[i] = x; onChange(v) }} />
      ))}
    </div>
  )
}

function Scene({ l1, l2, pl, showPlane }: { l1: Line3; l2: Line3; pl: Plane3; showPlane: boolean }) {
  const L = 6
  const seg = (l: Line3): [number, number, number][] => {
    const u = unit3(l.v)
    return [add3(l.p, scale3(u, -L)), add3(l.p, scale3(u, L))]
  }
  const planeQ = useMemo(() => {
    const n = new THREE.Vector3(...pl.n)
    if (n.length() < 1e-6) return null
    const len = n.length()
    n.divideScalar(len)
    return { quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), pos: n.multiplyScalar(-pl.D / len) }
  }, [pl])
  const lp = linePlane(l1, pl)
  const tl = twoLines(l1, l2)
  return (
    <>
      <Line points={seg(l1)} color="#38bdf8" lineWidth={2.5} />
      <Line points={seg(l2)} color="#a78bfa" lineWidth={2.5} />
      <Html position={seg(l1)[1]} center style={{ pointerEvents: 'none' }}><span className="font-mono text-xs text-sky-300">d₁</span></Html>
      <Html position={seg(l2)[1]} center style={{ pointerEvents: 'none' }}><span className="font-mono text-xs text-violet-300">d₂</span></Html>
      {showPlane && planeQ && (
        <mesh quaternion={planeQ.quat} position={planeQ.pos}>
          <planeGeometry args={[9, 9]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {showPlane && lp.point && (
        <mesh position={lp.point}><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#fbbf24" /></mesh>
      )}
      {tl.point && <mesh position={tl.point}><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color="#34d399" /></mesh>}
      {tl.perpendicular && (
        <>
          <Line points={tl.perpendicular} color="#34d399" lineWidth={2} dashed dashSize={0.15} gapSize={0.1} />
          {tl.perpendicular.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.06, 12, 12]} /><meshBasicMaterial color="#34d399" /></mesh>)}
        </>
      )}
      <axesHelper args={[4]} />
    </>
  )
}

const PRESETS: { id: string; label: { id: string; en: string }; l1: Line3; l2: Line3; pl: Plane3 }[] = [
  { id: 'skew', label: { id: 'Garis bersilangan', en: 'Skew lines' }, l1: { p: [0, 0, 0], v: [1, 1, 0] }, l2: { p: [0, 0, 2], v: [1, -1, 0.3] }, pl: { n: [1, 2, 2], D: -3 } },
  { id: 'cross', label: { id: 'Garis berpotongan', en: 'Intersecting lines' }, l1: { p: [1, 0, 0], v: [1, 2, 1] }, l2: { p: [1, 0, 0], v: [-1, 1, 2] }, pl: { n: [0, 0, 1], D: -1.5 } },
  { id: 'par', label: { id: 'Garis sejajar bidang', en: 'Line parallel to plane' }, l1: { p: [0, 0, 1], v: [1, 1, 0] }, l2: { p: [2, 0, 1], v: [1, 1, 0] }, pl: { n: [0, 0, 1], D: 0 } },
  // Vaisman 3.2.17: lines x/2 = (y-1)/0 = z/-1,  (x-2)/0 = y/1 = z/1
  { id: 'v3217', label: { id: 'Latihan 3.2.17', en: 'Exercise 3.2.17' }, l1: { p: [0, 1, 0], v: [2, 0, -1] }, l2: { p: [2, 0, 0], v: [0, 1, 1] }, pl: { n: [1, 1, 1], D: -2 } },
]

export function LinesPlanesLab() {
  const t = useT()
  const [l1, setL1] = useState<Line3>(PRESETS[0].l1)
  const [l2, setL2] = useState<Line3>(PRESETS[0].l2)
  const [pl, setPl] = useState<Plane3>(PRESETS[0].pl)
  const [showPlane, setShowPlane] = useState(true)
  const lp = linePlane(l1, pl)
  const lp2 = linePlane(l2, pl)
  const tl = twoLines(l1, l2)
  const foot = projectOnPlane(l1.p, pl)
  const REL = {
    intersect: t('berpotongan', 'intersect'), parallel: t('sejajar', 'parallel'), coincident: t('berimpit', 'coincident'),
    skew: t('bersilangan', 'skew'), contained: t('terletak pada bidang', 'lies in the plane'),
  }

  return (
    <Layout
      canvas={
        <Canvas camera={{ position: [7, 5, 7], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={['#0a0f1d']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1} />
          <Grid args={[20, 20]} cellColor="#1e293b" sectionColor="#334155" fadeDistance={30} infiniteGrid />
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Scene l1={l1} l2={l2} pl={pl} showPlane={showPlane} />
            <Html position={[4.4, 0, 0]} center style={{ pointerEvents: 'none' }}><span className="font-mono text-xs text-red-400">x</span></Html>
            <Html position={[0, 4.4, 0]} center style={{ pointerEvents: 'none' }}><span className="font-mono text-xs text-green-400">y</span></Html>
            <Html position={[0, 0, 4.4]} center style={{ pointerEvents: 'none' }}><span className="font-mono text-xs text-blue-400">z</span></Html>
          </group>
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2} maxDistance={40} />
        </Canvas>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={t('Garis', 'Lines')} icon={<Move3d size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => <Chip key={p.id} onClick={() => { setL1(p.l1); setL2(p.l2); setPl(p.pl) }}>{t(p.label.id, p.label.en)}</Chip>)}
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-slate-500"><Tex tex="d_1:\ \bar r = \bar r_0 + \lambda \bar v" /></p>
              <Vec3Input label="\bar r_0" value={l1.p} onChange={(p) => setL1({ ...l1, p })} />
              <Vec3Input label="\bar v" value={l1.v} onChange={(v) => setL1({ ...l1, v })} />
              <p className="pt-1 text-[11px] text-slate-500"><Tex tex="d_2" /></p>
              <Vec3Input label="\bar r_0" value={l2.p} onChange={(p) => setL2({ ...l2, p })} />
              <Vec3Input label="\bar v" value={l2.v} onChange={(v) => setL2({ ...l2, v })} />
            </div>
          </MathCard>
          <MathCard title={<span>{t('Bidang', 'Plane')} <Tex tex="Ax + By + Cz + D = 0" /></span>} icon={<Layers size={16} />}>
            <div className="space-y-2">
              <Vec3Input label="(A,B,C)" value={pl.n} onChange={(n) => setPl({ ...pl, n })} />
              <NumInput label="D" value={pl.D} onChange={(D) => setPl({ ...pl, D })} />
              <Toggle label={t('Tampilkan bidang', 'Show plane')} checked={showPlane} onChange={setShowPlane} />
            </div>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Persamaan', 'Equations')} icon={<Move3d size={16} />}>
            <FormulaBlock tex={lineTex(l1, 'd_1')} />
            <FormulaBlock tex={lineTex(l2, 'd_2')} />
            <FormulaBlock tex={planeTex(pl)} />
            <p className="text-xs leading-relaxed text-slate-400">
              {t(<>Bentuk simetrik/kanonik garis: <Tex tex="\frac{x-x_0}{l} = \frac{y-y_0}{m} = \frac{z-z_0}{n}" /> dengan vektor arah <Tex tex="\bar v(l,m,n)" />; bidang ditentukan oleh vektor normal <Tex tex="\bar N(A,B,C)" />. Bentuk vektor: <Tex tex="\bar r = \bar r_0 + \lambda\bar v" /> dan <Tex tex="\bar N\cdot(\bar r - \bar r_0) = 0" />.</>,
                 <>Symmetric (canonical) equations of a line: <Tex tex="\frac{x-x_0}{l} = \frac{y-y_0}{m} = \frac{z-z_0}{n}" /> with direction vector <Tex tex="\bar v(l,m,n)" />; a plane is fixed by its normal <Tex tex="\bar N(A,B,C)" />. Vector forms: <Tex tex="\bar r = \bar r_0 + \lambda\bar v" /> and <Tex tex="\bar N\cdot(\bar r - \bar r_0) = 0" />.</>)}
            </p>
          </MathCard>

          <MathCard title={t('Garis & bidang', 'Line & plane')} icon={<Layers size={16} />}>
            <p className="text-sm text-slate-200">
              <Tex tex="d_1" /> {t('dan', 'and')} <Tex tex="\pi" />: <span className="font-semibold text-amber-300">{REL[lp.relation]}</span>
              {lp.point && <> {t('di', 'at')} <Tex tex={vecTex(lp.point)} /></>}
            </p>
            <FormulaBlock tex={`\\angle(d_1, \\pi) = \\arcsin\\frac{|\\bar N\\cdot\\bar v|}{|\\bar N||\\bar v|} = ${deg(lp.angle)},\\qquad \\angle(d_2,\\pi) = ${deg(lp2.angle)}`} />
            <FormulaBlock tex={`\\operatorname{dist}(M_0, \\pi) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2+B^2+C^2}} = ${fmt(distPointPlane(l1.p, pl), 3)}`} />
            <p className="text-xs text-slate-400">
              {t(<>untuk <Tex tex={`M_0 = \\bar r_0(d_1) = ${vecTex(l1.p)}`} />; proyeksinya pada <Tex tex="\pi" /> adalah <Tex tex={vecTex(foot)} />.</>,
                 <>for <Tex tex={`M_0 = \\bar r_0(d_1) = ${vecTex(l1.p)}`} />; its projection on <Tex tex="\pi" /> is <Tex tex={vecTex(foot)} />.</>)}
            </p>
          </MathCard>

          <MathCard title={t('Dua garis', 'Two lines')} icon={<BookOpen size={16} />}>
            <p className="text-sm text-slate-200">
              <Tex tex="d_1, d_2" />: <span className="font-semibold text-amber-300">{REL[tl.relation]}</span>
              {tl.point && <> {t('di', 'at')} <Tex tex={vecTex(tl.point)} /></>}
            </p>
            <FormulaBlock tex={`\\angle(d_1, d_2) = \\arccos\\frac{|\\bar v_1\\cdot\\bar v_2|}{|\\bar v_1||\\bar v_2|} = ${deg(tl.angle)}`} />
            <FormulaBlock tex={`\\operatorname{dist}(d_1, d_2) = ${fmt(tl.distance, 3)}`} />
            {tl.relation === 'skew' && tl.perpendicular && (
              <>
                <FormulaBlock tex={`\\frac{|(\\bar r_2 - \\bar r_1)\\cdot(\\bar v_1\\times\\bar v_2)|}{|\\bar v_1\\times\\bar v_2|},\\quad P_1 = ${vecTex(tl.perpendicular[0])},\\; P_2 = ${vecTex(tl.perpendicular[1])}`} />
                <p className="text-xs text-slate-400">{t('Garis tegak lurus persekutuan (hijau putus-putus) memotong kedua garis tegak lurus; panjangnya adalah jarak terpendek. Ketiga vektor r₂−r₁, v₁, v₂ tidak sebidang (hasil kali tripel ≠ 0).', 'The common perpendicular (dashed green) meets both lines at right angles; its length is the shortest distance. The vectors r₂−r₁, v₁, v₂ are not coplanar (triple product ≠ 0).')}</p>
              </>
            )}
            {tl.relation === 'intersect' && <p className="text-xs text-slate-400">{t('Hasil kali tripel (r₂−r₁)·(v₁×v₂) = 0 dan v₁ ∦ v₂: kedua garis sebidang dan berpotongan (titik hijau).', 'Triple product (r₂−r₁)·(v₁×v₂) = 0 and v₁ ∦ v₂: coplanar and intersecting (green point).')}</p>}
            {tl.relation === 'parallel' && <p className="text-xs text-slate-400">{t('v₁ × v₂ = 0: sejajar; jaraknya |(r₂−r₁)×v₁|/|v₁|.', 'v₁ × v₂ = 0: parallel; distance |(r₂−r₁)×v₁|/|v₁|.')}</p>}
            <p className="mt-1 text-[11px] text-slate-500"><Tex tex={`|\\bar v_1| = ${fmt(norm3(l1.v), 3)},\\; |\\bar v_2| = ${fmt(norm3(l2.v), 3)}`} /></p>
          </MathCard>
        </div>
      }
    />
  )
}
