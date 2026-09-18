import { Scissors, Shapes } from 'lucide-react'
import { QUADRIC_PRESETS, type Plane, type Quadric } from '../../lib/quadrics'
import { useLang, useT } from '../../lib/i18n'
import { NumInput } from '../ui/Layout'
import { EquationField } from '../ui/EquationField'
import { MathCard, Chip, Toggle } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex } from '../ui/FormulaBlock'

interface Props {
  q: Quadric
  onQ: (q: Quadric) => void
  wireframe: boolean
  onWireframe: (v: boolean) => void
  showFrame: boolean
  onShowFrame: (v: boolean) => void
  plane: Plane
  onPlane: (p: Plane) => void
  showPlane: boolean
  onShowPlane: (v: boolean) => void
}

const PLANE_PRESETS: { label: string; n: Plane['n'] }[] = [
  { label: '⊥ x', n: [1, 0, 0] },
  { label: '⊥ y', n: [0, 1, 0] },
  { label: '⊥ z', n: [0, 0, 1] },
  { label: 'tilt', n: [0.5, 0.3, 0.8] },
]

export function QuadricControls({ q, onQ, wireframe, onWireframe, showFrame, onShowFrame, plane, onPlane, showPlane, onShowPlane }: Props) {
  const t = useT()
  const { lang } = useLang()
  const setA = (i: number, j: number, v: number) => {
    const A = q.A.map((r) => [...r])
    A[i][j] = v; A[j][i] = v
    onQ({ ...q, A })
  }
  const setN = (i: number, v: number) => { const n = [...plane.n] as Plane['n']; n[i] = v; onPlane({ ...plane, n }) }
  return (
    <div className="space-y-4">
      <MathCard number="01" title={t('Kuadrik', 'Quadric')} icon={<Shapes size={16} />}>
        <div className="mb-3">
          <EquationField
            placeholder="x^2 + y^2 - 3z^2 - 2xy - 6xz - 6yz + 2x + 2y + 4z = 0"
            onApply={(c) => {
              if (![c.a11, c.a22, c.a33, c.a12, c.a13, c.a23].some((v) => v)) return t('Tidak ada suku kuadrat.', 'No quadratic term.')
              onQ({ A: [[c.a11, c.a12, c.a13], [c.a12, c.a22, c.a23], [c.a13, c.a23, c.a33]], a: [c.a10, c.a20, c.a30], alpha: c.a00 })
              return null
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUADRIC_PRESETS.map((p) => (
            <Chip key={p.id} active={p.q === q} onClick={() => onQ(p.q)}>{p.label[lang]}</Chip>
          ))}
        </div>
        <p className="mt-3 mb-1.5 text-[11px] text-slate-500"><Tex tex="a_{11}x^2 + a_{22}y^2 + a_{33}z^2 + 2a_{12}xy + 2a_{13}xz + 2a_{23}yz + 2a_{10}x + 2a_{20}y + 2a_{30}z + a_{00} = 0" /></p>
        <div className="grid grid-cols-3 gap-1.5">
          <NumInput label="a₁₁" value={q.A[0][0]} onChange={(v) => setA(0, 0, v)} />
          <NumInput label="a₂₂" value={q.A[1][1]} onChange={(v) => setA(1, 1, v)} />
          <NumInput label="a₃₃" value={q.A[2][2]} onChange={(v) => setA(2, 2, v)} />
          <NumInput label="a₁₂" value={q.A[0][1]} onChange={(v) => setA(0, 1, v)} />
          <NumInput label="a₁₃" value={q.A[0][2]} onChange={(v) => setA(0, 2, v)} />
          <NumInput label="a₂₃" value={q.A[1][2]} onChange={(v) => setA(1, 2, v)} />
          <NumInput label="a₁₀" value={q.a[0]} onChange={(v) => onQ({ ...q, a: [v, q.a[1], q.a[2]] })} />
          <NumInput label="a₂₀" value={q.a[1]} onChange={(v) => onQ({ ...q, a: [q.a[0], v, q.a[2]] })} />
          <NumInput label="a₃₀" value={q.a[2]} onChange={(v) => onQ({ ...q, a: [q.a[0], q.a[1], v] })} />
          <NumInput label="a₀₀" value={q.alpha} onChange={(alpha) => onQ({ ...q, alpha })} className="col-span-3" />
        </div>
        <div className="mt-3 space-y-2">
          <Toggle label={t('Kerangka kanonik (x′, y′, z′)', 'Canonical frame (x′, y′, z′)')} checked={showFrame} onChange={onShowFrame} />
          <Toggle label={t('Rangka kawat', 'Wireframe')} checked={wireframe} onChange={onWireframe} />
        </div>
      </MathCard>

      <MathCard number="02" title={<span>{t('Bidang pemotong', 'Cutting plane')} <Tex tex="Ax + By + Cz + D = 0" /></span>} icon={<Scissors size={16} />}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PLANE_PRESETS.map((p) => <Chip key={p.label} onClick={() => onPlane({ ...plane, n: p.n })}>{p.label}</Chip>)}
          </div>
          <Slider label={<Tex tex="A" />} value={plane.n[0]} min={-1} max={1} defaultValue={0} onChange={(v) => setN(0, v)} />
          <Slider label={<Tex tex="B" />} value={plane.n[1]} min={-1} max={1} defaultValue={0} onChange={(v) => setN(1, v)} />
          <Slider label={<Tex tex="C" />} value={plane.n[2]} min={-1} max={1} defaultValue={1} onChange={(v) => setN(2, v)} />
          <Slider label={<Tex tex="D" />} value={plane.D} min={-3} max={3} defaultValue={-0.5} onChange={(D) => onPlane({ ...plane, D })} />
          <Toggle label={t('Tampilkan bidang', 'Show plane')} checked={showPlane} onChange={onShowPlane} />
        </div>
      </MathCard>
    </div>
  )
}
