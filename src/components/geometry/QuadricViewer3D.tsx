import { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Grid, Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { add3, scale3, type Plane, type Reduced, type Slice, type Surface } from '../../lib/quadrics'

interface Props {
  surfaces: Surface[]
  reduced: Reduced
  color: string
  wireframe: boolean
  plane: Plane
  showPlane: boolean
  showFrame: boolean
  slice: Slice
}

function SurfaceMesh({ surface, color, wireframe }: { surface: Surface; color: string; wireframe: boolean }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(surface.positions, 3))
    g.setIndex(new THREE.BufferAttribute(surface.indices, 1))
    g.computeVertexNormals()
    return g
  }, [surface])
  useEffect(() => () => geom.dispose(), [geom])
  return (
    <>
      <mesh geometry={geom}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.82} roughness={0.45} metalness={0.15} />
      </mesh>
      {wireframe && (
        <mesh geometry={geom}>
          <meshBasicMaterial color="#cbd5e1" wireframe transparent opacity={0.18} />
        </mesh>
      )}
    </>
  )
}

function CuttingPlane({ plane }: { plane: Plane }) {
  const q = useMemo(() => {
    const n = new THREE.Vector3(...plane.n)
    const len = n.length()
    if (len < 1e-6) return null
    n.divideScalar(len)
    return { quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n), pos: n.multiplyScalar(-plane.D / len) }
  }, [plane])
  if (!q) return null
  return (
    <mesh quaternion={q.quat} position={q.pos}>
      <planeGeometry args={[9, 9]} />
      <meshBasicMaterial color="#e2e8f0" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

const Label = ({ p, text, color }: { p: [number, number, number]; text: string; color: string }) => (
  <Html position={p} center style={{ pointerEvents: 'none' }}>
    <span className="font-mono text-xs" style={{ color }}>{text}</span>
  </Html>
)

export function QuadricViewer3D({ surfaces, reduced, color, wireframe, plane, showPlane, showFrame, slice }: Props) {
  const curve = useMemo(() => Array.from(slice.segments), [slice])
  const frame = useMemo(() => reduced.axes.map((ax) => [add3(reduced.origin, scale3(ax, -2.5)), add3(reduced.origin, scale3(ax, 2.5))] as [number, number, number][]), [reduced])
  return (
    <Canvas camera={{ position: [6.5, 5, 6.5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#0a0f1d']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} />
      <directionalLight position={[-6, -4, -3]} intensity={0.5} />
      <Grid args={[20, 20]} cellColor="#1e293b" sectionColor="#334155" fadeDistance={30} infiniteGrid />

      {/* Math (x, y, z) with z up -> three.js (x, z, -y) */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {surfaces.map((s, i) => (
          <SurfaceMesh key={i} surface={s} color={color} wireframe={wireframe} />
        ))}
        {showPlane && <CuttingPlane plane={plane} />}
        {curve.length >= 6 && <Line points={curve} segments color="#fbbf24" lineWidth={3} />}
        {showFrame && reduced.rank > 0 && (
          <>
            {frame.map((pts, i) => <Line key={i} points={pts} color={['#f87171', '#4ade80', '#60a5fa'][i]} lineWidth={2} dashed dashSize={0.2} gapSize={0.1} />)}
            <mesh position={reduced.origin}><sphereGeometry args={[0.08, 16, 16]} /><meshBasicMaterial color="#fbbf24" /></mesh>
            {frame.map((pts, i) => <Label key={`l${i}`} p={pts[1]} text={["x'", "y'", "z'"][i]} color={['#fca5a5', '#86efac', '#93c5fd'][i]} />)}
          </>
        )}
        <axesHelper args={[4]} />
        <Label p={[4.4, 0, 0]} text="x" color="#f87171" />
        <Label p={[0, 4.4, 0]} text="y" color="#4ade80" />
        <Label p={[0, 0, 4.4]} text="z" color="#60a5fa" />
      </group>

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2} maxDistance={40} />
    </Canvas>
  )
}
