import { useMemo, useState } from 'react'
import { QUADRIC_PRESETS, quadricSurfaces, reduceQuadric, slicePlane, type Plane, type Quadric } from '../../lib/quadrics'
import { useT } from '../../lib/i18n'
import { SubTabs } from '../navigation/TabNav'
import { Layout } from '../ui/Layout'
import { QuadricViewer3D } from './QuadricViewer3D'
import { QuadricControls } from './QuadricControls'
import { GeometryTheory } from './GeometryTheory'
import { LinesPlanesLab } from './LinesPlanesLab'
import { CirclesLab } from './CirclesLab'
import { ConicLab } from './ConicLab'
import { TransformLab } from '../transform/TransformLab'

type Sub = 'lines' | 'circles' | 'conics' | 'quadrics' | 'transform'

const COLORS: Record<string, string> = {
  ellipsoid: '#38bdf8', 'hyperboloid-1': '#a78bfa', 'hyperboloid-2': '#f472b6', 'elliptic-paraboloid': '#34d399',
  'hyperbolic-paraboloid': '#fbbf24', cone: '#fb7185', 'elliptic-cylinder': '#2dd4bf', 'hyperbolic-cylinder': '#c084fc',
  'parabolic-cylinder': '#4ade80',
}

function QuadricLab() {
  const [q, setQ] = useState<Quadric>(QUADRIC_PRESETS[0].q)
  const [wireframe, setWireframe] = useState(true)
  const [showFrame, setShowFrame] = useState(true)
  const [plane, setPlane] = useState<Plane>({ n: [0, 0, 1], D: -0.5 })
  const [showPlane, setShowPlane] = useState(true)
  const reduced = useMemo(() => reduceQuadric(q), [q])
  const surfaces = useMemo(() => quadricSurfaces(reduced), [reduced])
  const slice = useMemo(() => slicePlane(q, plane), [q, plane])
  return (
    <Layout
      canvas={<QuadricViewer3D surfaces={surfaces} reduced={reduced} color={COLORS[reduced.type] ?? '#94a3b8'} wireframe={wireframe} plane={plane} showPlane={showPlane} showFrame={showFrame} slice={slice} />}
      controls={<QuadricControls q={q} onQ={setQ} wireframe={wireframe} onWireframe={setWireframe} showFrame={showFrame} onShowFrame={setShowFrame} plane={plane} onPlane={setPlane} showPlane={showPlane} onShowPlane={setShowPlane} />}
      theory={<GeometryTheory q={q} reduced={reduced} slice={slice} />}
    />
  )
}

export function GeometryModule() {
  const t = useT()
  const [sub, setSub] = useState<Sub>('quadrics')
  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={setSub}
        tabs={[
          { id: 'lines', label: t('Garis & Bidang di R³', 'Lines & Planes in R³') },
          { id: 'circles', label: t('Lingkaran: Kuasa, Kutub, Pensil', 'Circles: Power, Polar, Pencils') },
          { id: 'conics', label: t('Konik Umum & Klasifikasi', 'General Conics & Classification') },
          { id: 'quadrics', label: t('Kuadrik & Irisan Bidang', 'Quadrics & Plane Sections') },
          { id: 'transform', label: t('Transformasi Afin & Ortogonal', 'Affine & Orthogonal Transformations') },
        ]}
      />
      {sub === 'lines' && <LinesPlanesLab />}
      {sub === 'circles' && <CirclesLab />}
      {sub === 'conics' && <ConicLab />}
      {sub === 'quadrics' && <QuadricLab />}
      {sub === 'transform' && <TransformLab />}
    </div>
  )
}
