import { useMemo, useRef, useState } from 'react'
import { C, PRESETS, numericResidue, abs, sub as csub, type Complex, type Contour, type Preset, type Singularity } from '../../lib/complex-math'
import { compileComplex } from '../../lib/expr'
import { useT } from '../../lib/i18n'
import { SubTabs } from '../navigation/TabNav'
import { Layout } from '../ui/Layout'
import { ComplexCanvas, DEFAULT_VIEW, type Overlay, type View } from './ComplexCanvas'
import { ComplexControls } from './ComplexControls'
import { ComplexTheory } from './ComplexTheory'
import { MappingLab } from './MappingLab'

type Sub = 'mapping' | 'map' | 'sing'
const MAP_PRESETS = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const SING_PRESETS = [9, 10, 11, 14, 15, 12, 13, 1, 5, 6]

/** Parse "0, 2, i, -1+2i" into complex numbers; throws on the first bad entry. */
function parsePoints(text: string): Complex[] {
  return text.split(/[,;]/).map((s) => s.trim()).filter(Boolean).map((s) => compileComplex(s).f(C(0), C(0)))
}

export function ComplexModule() {
  const t = useT()
  const [sub, setSub] = useState<Sub>('mapping')
  const [preset, setPreset] = useState(0)
  const [c, setC] = useState<Complex>(C(-0.4, 0.6))
  const [mode, setMode] = useState<'color' | 'grid'>('color')
  const [showGrid, setShowGrid] = useState(false)
  const [view, setView] = useState<View>(DEFAULT_VIEW)
  const [hover, setHover] = useState<Complex | null>(null)
  const [contour, setContour] = useState<Contour>({ center: C(0.3, 0), radius: 1.5 })
  const [customText, setCustomText] = useState('(z^2 + 1) / (z (z - 2)^2)')
  const [singText, setSingText] = useState('0, 2')
  const [shaderError, setShaderError] = useState<string | null>(null)

  const compiled = useMemo(() => {
    try { return { ok: true as const, ...compileComplex(customText) } } catch (e) { return { ok: false as const, error: (e as Error).message } }
  }, [customText])
  // keep the last valid shader while the user is mid-edit
  const lastGLSL = useRef('z')
  if (compiled.ok) lastGLSL.current = compiled.glsl
  const points = useMemo(() => {
    try { return { ok: true as const, list: parsePoints(singText) } } catch (e) { return { ok: false as const, error: (e as Error).message, list: [] as Complex[] } }
  }, [singText])

  // the custom preset: numeric residues at the user's points, using a circle smaller than the gap to the nearest other point
  const custom = useMemo<Preset>(() => {
    const f = compiled.ok ? compiled.f : () => C(NaN, NaN)
    const singularities = (cc: Complex): Singularity[] => points.list.map((z) => {
      const gap = Math.min(0.02, ...points.list.filter((w) => w !== z).map((w) => abs(csub(w, z)) / 3))
      return { z, type: 'user', res: compiled.ok ? numericResidue((x) => f(x, cc), z, Math.max(gap, 1e-4)) : undefined }
    })
    return {
      id: 'custom', label: t('Kustom', 'Custom'), tex: compiled.ok ? `f(z) = ${compiled.tex}` : 'f(z) = ?',
      usesC: compiled.ok && compiled.glsl.includes('uC'), analytic: true, singular: true,
      f, roots: () => [], singularities,
      note: {
        id: 'Fungsi yang Anda ketik. Nol dan jenis singularitas tidak diklasifikasikan otomatis; residu di titik yang Anda berikan dihitung numerik, jadi cocokkan dengan perhitungan tangan (pecahan parsial, rumus kutub orde m).',
        en: 'Your own function. Zeros and singularity types are not classified automatically; residues at the points you list are estimated numerically, so compare them with your hand computation (partial fractions, the order-m pole formula).',
      },
    }
  }, [compiled, points, t])

  const presetIds = sub === 'map' ? MAP_PRESETS : SING_PRESETS
  const current = preset < 0 ? custom : PRESETS[preset]
  const overlay = useMemo<Overlay>(() => ({
    contour: sub === 'sing' ? contour : undefined,
    marks: [
      ...current.roots(c).map((z) => ({ z, kind: 'zero' as const })),
      ...current.singularities(c).map((s) => ({ z: s.z, kind: s.type })),
    ],
  }), [sub, contour, current, c])

  const switchSub = (s: Sub) => {
    setSub(s)
    const ids = s === 'map' ? MAP_PRESETS : SING_PRESETS
    if (preset >= 0 && !ids.includes(preset)) setPreset(ids[0])
  }
  const customError = compiled.ok ? shaderError : compiled.error

  return (
    <div className="space-y-4">
      <SubTabs
        active={sub}
        onChange={switchSub}
        tabs={[
          { id: 'mapping', label: t('Pemetaan w = f(z)', 'Mappings w = f(z)') },
          { id: 'map', label: t('Pewarnaan Domain & Fungsi Analitik', 'Domain Colouring & Analytic Functions') },
          { id: 'sing', label: t('Singularitas, Residu & Integral Kontur', 'Singularities, Residues & Contour Integrals') },
        ]}
      />
      {sub === 'mapping' ? <MappingLab /> : (
      <Layout
        canvas={
          <ComplexCanvas
            preset={preset} c={c} mode={mode} showGrid={showGrid} view={view} onViewChange={setView} onHover={setHover} overlay={overlay}
            customGLSL={lastGLSL.current} onShaderError={setShaderError}
          />
        }
        controls={
          <ComplexControls
            presetIds={presetIds} preset={preset} onPreset={setPreset} current={current}
            custom={{ text: customText, onText: setCustomText, error: customError }}
            sing={{ text: singText, onText: setSingText, error: points.ok ? null : points.error }}
            c={c} onC={setC} mode={mode} onMode={setMode}
            showGrid={showGrid} onShowGrid={setShowGrid} onResetView={() => setView(DEFAULT_VIEW)}
            contour={sub === 'sing' ? contour : undefined} onContour={setContour}
          />
        }
        theory={<ComplexTheory p={current} c={c} hover={hover} contour={sub === 'sing' ? contour : undefined} />}
      />
      )}
    </div>
  )
}
