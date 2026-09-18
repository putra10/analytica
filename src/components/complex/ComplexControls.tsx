import { CircleDashed, Grid2x2, Palette, PenLine, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { PRESETS, type Complex, type Contour, type Preset } from '../../lib/complex-math'
import { useT } from '../../lib/i18n'
import { MathCard, Chip, TextField, Toggle } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex } from '../ui/FormulaBlock'

interface Props {
  presetIds: number[]
  preset: number
  onPreset: (i: number) => void
  current: Preset
  custom: { text: string; onText: (s: string) => void; error: string | null }
  sing?: { text: string; onText: (s: string) => void; error: string | null }
  c: Complex
  onC: (c: Complex) => void
  mode: 'color' | 'grid'
  onMode: (m: 'color' | 'grid') => void
  showGrid: boolean
  onShowGrid: (v: boolean) => void
  onResetView: () => void
  contour?: Contour
  onContour?: (c: Contour) => void
}

export function ComplexControls({ presetIds, preset, onPreset, current, custom, sing, c, onC, mode, onMode, showGrid, onShowGrid, onResetView, contour, onContour }: Props) {
  const t = useT()
  const usesC = current.usesC
  return (
    <div className="space-y-4">
      <MathCard number="01" title={t('Fungsi', 'Function')} icon={<SlidersHorizontal size={16} />}>
        <div className="flex flex-wrap gap-1.5">
          {presetIds.map((i) => (
            <Chip key={PRESETS[i].id} active={i === preset} onClick={() => onPreset(i)}>
              {PRESETS[i].label}
            </Chip>
          ))}
          <Chip active={preset < 0} onClick={() => onPreset(-1)}>
            <span className="flex items-center gap-1"><PenLine size={11} /> {t('Kustom', 'Custom')}</span>
          </Chip>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-[11px] text-slate-500">{t('Ketik f(z) sendiri (mis. dari soal):', 'Type your own f(z) (e.g. from a problem):')}</label>
          <TextField
            value={custom.text}
            onChange={(v) => { custom.onText(v); if (preset >= 0) onPreset(-1) }}
            placeholder="(z^2 + 1) / (z (z - 2)^2)"
            invalid={preset < 0 && !!custom.error}
          />
          {preset < 0 && custom.error && <p className="mt-1 text-[11px] text-rose-300">{custom.error}</p>}
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {t('Operator + − * / ^, konstanta i, e, pi, c; fungsi exp, log, sin, cos, tan, sinh, cosh, sqrt, conj, abs, re, im, arg; |z| untuk modulus; perkalian implisit (2z, z(z+1)).',
               'Operators + − * / ^, constants i, e, pi, c; functions exp, log, sin, cos, tan, sinh, cosh, sqrt, conj, abs, re, im, arg; |z| for the modulus; implicit products (2z, z(z+1)).')}
          </p>
        </div>
        <div className="mt-3 text-center">
          <Tex tex={current.tex} />
        </div>
      </MathCard>

      {contour && onContour ? (
        <MathCard number="02" title={<span>{t('Kontur', 'Contour')} <Tex tex="C: |z - z_0| = r" /></span>} icon={<CircleDashed size={16} />}>
          <div className="space-y-3">
            <Slider label={<Tex tex="\operatorname{Re} z_0" />} value={contour.center.re} min={-3} max={3} defaultValue={0} onChange={(re) => onContour({ ...contour, center: { ...contour.center, re } })} />
            <Slider label={<Tex tex="\operatorname{Im} z_0" />} value={contour.center.im} min={-3} max={3} defaultValue={0} onChange={(im) => onContour({ ...contour, center: { ...contour.center, im } })} />
            <Slider label={<Tex tex="r" />} value={contour.radius} min={0.1} max={4} defaultValue={1.5} onChange={(radius) => onContour({ ...contour, radius })} />
            {sing && preset < 0 && (
              <div>
                <label className="mb-1 block text-[11px] text-slate-500">{t('Titik singular f kustom (pisahkan dengan koma):', 'Singular points of the custom f (comma separated):')}</label>
                <TextField value={sing.text} onChange={sing.onText} placeholder="0, 2, i, -i" invalid={!!sing.error} />
                {sing.error && <p className="mt-1 text-[11px] text-rose-300">{sing.error}</p>}
                <p className="mt-1 text-[11px] text-slate-500">{t('Residunya dihitung numerik dengan lingkaran kecil di sekitar tiap titik.', 'Residues are estimated numerically with a small circle around each point.')}</p>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-slate-500">
              {t('Kontur berorientasi positif (berlawanan arah jarum jam). Integral dihitung secara numerik dengan 4096 titik.',
                 'Positively oriented (counter-clockwise). The integral is evaluated numerically with 4096 samples.')}
            </p>
          </div>
        </MathCard>
      ) : (
        <MathCard number="02" title={<span>{t('Konstanta', 'Constant')} <Tex tex="c = a + bi" /></span>}>
          <div className="space-y-3">
            <Slider label={<Tex tex="a = \operatorname{Re}(c)" />} value={c.re} min={-2} max={2} defaultValue={0} disabled={!usesC} onChange={(re) => onC({ ...c, re })} />
            <Slider label={<Tex tex="b = \operatorname{Im}(c)" />} value={c.im} min={-2} max={2} defaultValue={0} disabled={!usesC} onChange={(im) => onC({ ...c, im })} />
            {!usesC && <p className="text-[11px] text-slate-500">{t('Fungsi ini tidak bergantung pada c (gunakan huruf c dalam rumus untuk memakainya).', 'This function does not depend on c (use the letter c in a formula to enable it).')}</p>}
          </div>
        </MathCard>
      )}

      <MathCard number="03" title={t('Tampilan', 'Rendering')} icon={<Palette size={16} />}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            <Chip active={mode === 'color'} onClick={() => onMode('color')}>{t('Pewarnaan domain', 'Domain coloring')}</Chip>
            <Chip active={mode === 'grid'} onClick={() => onMode('grid')}>{t('Kisi konformal', 'Conformal grid')}</Chip>
          </div>
          <Toggle
            label={<span className="flex items-center gap-1.5"><Grid2x2 size={13} /> {t('Garis', 'Lines')} <Tex tex="\operatorname{Re} f,\operatorname{Im} f \in \mathbb{Z}" /></span>}
            checked={showGrid}
            onChange={onShowGrid}
            disabled={mode === 'grid'}
          />
          <button
            type="button"
            onClick={onResetView}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-slate-100"
          >
            <RotateCcw size={13} /> {t('Atur ulang tampilan', 'Reset view')}
          </button>
          <p className="text-[11px] leading-relaxed text-slate-500">{t('Seret untuk menggeser, gulir untuk memperbesar di sekitar kursor.', 'Drag to pan, scroll to zoom about the cursor.')}</p>
        </div>
      </MathCard>
    </div>
  )
}
