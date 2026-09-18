import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Map as MapIcon, Shapes } from 'lucide-react'
import { C, PRESETS, type Complex } from '../../lib/complex-math'
import { compileComplex } from '../../lib/expr'
import { useLang, useT } from '../../lib/i18n'
import { Canvas2D, type View2D } from '../ui/Canvas2D'
import { MathCard, Chip, TextField } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

type Fn = (z: Complex) => Complex
type Region = 'cartesian' | 'polar' | 'rectangle' | 'halfstrip' | 'sector' | 'disk'

interface MapPreset {
  id: string
  label: string
  tex: string
  f: Fn
  /** what happens to the curve families, per Brown & Churchill ch. 2 (§13-14) */
  note: { id: string; en: string }
  /** suggested region and bounds */
  region: Region
  bounds: [number, number, number, number]
}

const P = (id: string) => PRESETS.find((p) => p.id === id)!
const MAP_PRESETS: MapPreset[] = [
  {
    id: 'square', label: 'w = z²', tex: 'w = z^2 = (x^2 - y^2) + i\\,2xy', f: (z) => P('square').f(z, C(0)), region: 'cartesian', bounds: [0.2, 2, 0.2, 2],
    note: { id: 'Garis x = c₁ dipetakan ke parabola u = c₁² − v²/(4c₁²) yang membuka ke kiri, garis y = c₂ ke parabola yang membuka ke kanan; keduanya berpotongan tegak lurus (fungsi konformal). Kuadran pertama dipetakan ke setengah bidang atas: sudut di titik asal digandakan.', en: 'Lines x = c₁ map to parabolas u = c₁² − v²/(4c₁²) opening left, lines y = c₂ to parabolas opening right; they meet at right angles (conformality). The first quadrant maps onto the upper half-plane: angles at the origin are doubled.' },
  },
  {
    id: 'inv', label: 'w = 1/z', tex: 'w = \\frac{1}{z} = \\frac{\\bar z}{|z|^2}', f: (z) => P('inv').f(z, C(0)), region: 'polar', bounds: [0.5, 2, 0, 2 * Math.PI],
    note: { id: 'Inversi terhadap lingkaran satuan diikuti pencerminan pada sumbu real: lingkaran |z| = r menjadi lingkaran |w| = 1/r, sinar arg z = θ menjadi sinar arg w = −θ. Secara umum lingkaran dan garis dipetakan ke lingkaran dan garis (§14).', en: 'Inversion in the unit circle followed by reflection in the real axis: the circle |z| = r becomes |w| = 1/r, the ray arg z = θ becomes arg w = −θ. In general circles and lines map to circles and lines (§14).' },
  },
  {
    id: 'exp', label: 'w = eᶻ', tex: 'w = e^{z} = e^{x}(\\cos y + i\\sin y)', f: (z) => P('exp').f(z, C(0)), region: 'halfstrip', bounds: [-1, 1, 0, Math.PI],
    note: { id: 'Garis vertikal x = c₁ dipetakan ke lingkaran |w| = e^{c₁}; garis horizontal y = c₂ ke sinar arg w = c₂. Pita horizontal 0 ≤ y ≤ π dipetakan ke setengah bidang atas, dan pita selebar 2π menutupi seluruh bidang w kecuali titik asal (§13 contoh 3).', en: 'Vertical lines x = c₁ map to circles |w| = e^{c₁}; horizontal lines y = c₂ to rays arg w = c₂. The strip 0 ≤ y ≤ π maps onto the upper half-plane, and any strip of width 2π covers the whole w-plane except the origin (§13, Example 3).' },
  },
  {
    id: 'sin', label: 'w = sin z', tex: 'w = \\sin z = \\sin x\\cosh y + i\\cos x\\sinh y', f: (z) => P('sin').f(z, C(0)), region: 'rectangle', bounds: [-Math.PI / 2, Math.PI / 2, 0, 1.5],
    note: { id: 'Garis x = c₁ (bukan kelipatan π/2) dipetakan ke cabang hiperbola u²/sin²c₁ − v²/cos²c₁ = 1, garis y = c₂ ≠ 0 ke elips u²/cosh²c₂ + v²/sinh²c₂ = 1 dengan fokus ±1. Pita −π/2 ≤ x ≤ π/2 dipetakan satu-satu ke seluruh bidang w.', en: 'Lines x = c₁ (not a multiple of π/2) map to branches of the hyperbola u²/sin²c₁ − v²/cos²c₁ = 1, lines y = c₂ ≠ 0 to ellipses u²/cosh²c₂ + v²/sinh²c₂ = 1 with foci ±1. The strip −π/2 ≤ x ≤ π/2 maps one-to-one onto the whole w-plane.' },
  },
  {
    id: 'mobius', label: 'w = (z−1)/(z+1)', tex: 'w = \\frac{z-1}{z+1}', f: (z) => P('mobius').f(z, C(0)), region: 'cartesian', bounds: [0, 3, -2, 2],
    note: { id: 'Transformasi linear fraksional memetakan setengah bidang kanan Re z > 0 ke cakram |w| < 1: sumbu imajiner (Re z = 0) menjadi lingkaran satuan. Garis dan lingkaran dipetakan ke garis dan lingkaran.', en: 'A linear fractional transformation maps the right half-plane Re z > 0 onto the disc |w| < 1: the imaginary axis (Re z = 0) becomes the unit circle. Lines and circles go to lines and circles.' },
  },
  {
    id: 'log', label: 'w = Log z', tex: 'w = \\operatorname{Log} z = \\ln r + i\\Theta', f: (z) => P('log').f(z, C(0)), region: 'polar', bounds: [0.5, 3, -Math.PI + 0.05, Math.PI - 0.05],
    note: { id: 'Kebalikan dari eᶻ: lingkaran |z| = r menjadi garis vertikal u = ln r, sinar arg z = Θ menjadi garis horizontal v = Θ. Bidang tanpa sumbu real negatif dipetakan ke pita −π < v < π.', en: 'Inverse of eᶻ: circles |z| = r become vertical lines u = ln r, rays arg z = Θ become horizontal lines v = Θ. The plane minus the negative real axis maps onto the strip −π < v < π.' },
  },
]

const REGIONS: { id: Region; label: { id: string; en: string } }[] = [
  { id: 'cartesian', label: { id: 'Kisi x = c₁, y = c₂', en: 'Grid x = c₁, y = c₂' } },
  { id: 'polar', label: { id: 'Kisi kutub |z| = r, arg z = θ', en: 'Polar grid |z| = r, arg z = θ' } },
  { id: 'rectangle', label: { id: 'Persegi panjang', en: 'Rectangle' } },
  { id: 'halfstrip', label: { id: 'Pita', en: 'Strip' } },
  { id: 'sector', label: { id: 'Sektor lingkaran', en: 'Circular sector' } },
  { id: 'disk', label: { id: 'Cakram |z − z₀| ≤ r', en: 'Disc |z − z₀| ≤ r' } },
]

interface Curve { pts: Complex[]; color: string; width: number; fill?: boolean }

/** Sample the curve families of a region; bounds = [a, b, c, d] with meaning per region. */
function curves(region: Region, [a, b, c, d]: [number, number, number, number], accent: string, violet: string, n = 9): Curve[] {
  const out: Curve[] = []
  const line = (p: (t: number) => Complex, t0: number, t1: number, color: string, width = 1, N = 160): Curve => ({ pts: Array.from({ length: N + 1 }, (_, k) => p(t0 + ((t1 - t0) * k) / N)), color, width })
  const lerp = (u: number, v: number, k: number) => u + ((v - u) * k) / (n - 1)
  if (region === 'cartesian') {
    for (let k = 0; k < n; k++) { const x = lerp(a, b, k); out.push(line((t) => C(x, t), c, d, accent)) }
    for (let k = 0; k < n; k++) { const y = lerp(c, d, k); out.push(line((t) => C(t, y), a, b, violet)) }
  } else if (region === 'polar') {
    for (let k = 0; k < n; k++) { const r = lerp(a, b, k); out.push(line((t) => C(r * Math.cos(t), r * Math.sin(t)), c, d, accent, 1, 240)) }
    for (let k = 0; k < n; k++) { const th = lerp(c, d, k); out.push(line((t) => C(t * Math.cos(th), t * Math.sin(th)), a, b, violet)) }
  } else if (region === 'rectangle' || region === 'halfstrip') {
    const [x0, x1, y0, y1] = [a, b, c, d]
    const boundary = [...line((t) => C(t, y0), x0, x1, accent).pts, ...line((t) => C(x1, t), y0, y1, accent).pts, ...line((t) => C(t, y1), x1, x0, accent).pts, ...line((t) => C(x0, t), y1, y0, accent).pts]
    out.push({ pts: boundary, color: accent, width: 2, fill: true })
    for (let k = 1; k < n - 1; k++) { out.push(line((t) => C(lerp(x0, x1, k), t), y0, y1, accent, 0.7)); out.push(line((t) => C(t, lerp(y0, y1, k)), x0, x1, violet, 0.7)) }
  } else if (region === 'sector') {
    const [r0, r1, t0, t1] = [a, b, c, d]
    const boundary = [...line((t) => C(t * Math.cos(t0), t * Math.sin(t0)), r0, r1, accent).pts, ...line((t) => C(r1 * Math.cos(t), r1 * Math.sin(t)), t0, t1, accent, 1, 240).pts, ...line((t) => C(t * Math.cos(t1), t * Math.sin(t1)), r1, r0, accent).pts, ...line((t) => C(r0 * Math.cos(t), r0 * Math.sin(t)), t1, t0, accent, 1, 240).pts]
    out.push({ pts: boundary, color: accent, width: 2, fill: true })
    for (let k = 1; k < n - 1; k++) { const r = lerp(r0, r1, k); out.push(line((t) => C(r * Math.cos(t), r * Math.sin(t)), t0, t1, accent, 0.7, 240)); const th = lerp(t0, t1, k); out.push(line((t) => C(t * Math.cos(th), t * Math.sin(th)), r0, r1, violet, 0.7)) }
  } else {
    const [x0, y0, r] = [a, b, c]
    out.push({ pts: line((t) => C(x0 + r * Math.cos(t), y0 + r * Math.sin(t)), 0, 2 * Math.PI, accent, 2, 360).pts, color: accent, width: 2, fill: true })
    for (let k = 1; k < n - 1; k++) { const rr = (r * k) / (n - 1); out.push(line((t) => C(x0 + rr * Math.cos(t), y0 + rr * Math.sin(t)), 0, 2 * Math.PI, accent, 0.7, 240)); const th = (Math.PI * k) / (n - 1); out.push(line((t) => C(x0 + t * Math.cos(th), y0 + t * Math.sin(th)), -r, r, violet, 0.7)) }
  }
  return out
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/** Plain paper-coloured plane with axes and unit ticks. */
function drawPlane(ctx: CanvasRenderingContext2D, v: View2D, label: string, axes: [string, string]) {
  const border = css('--border'), hint = css('--hint'), fg = css('--fg')
  const [x0, y1] = v.Q([0, 0]), [x1, y0] = v.Q([v.W, v.H])
  ctx.lineWidth = 1
  ctx.strokeStyle = border
  for (let x = Math.ceil(x0); x <= x1; x++) { const [px] = v.P([x, 0]); ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, v.H); ctx.stroke() }
  for (let y = Math.ceil(y0); y <= y1; y++) { const [, py] = v.P([0, y]); ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(v.W, py); ctx.stroke() }
  ctx.strokeStyle = hint
  const [ox, oy] = v.P([0, 0])
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(v.W, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, v.H); ctx.stroke()
  ctx.fillStyle = hint
  ctx.font = '11px ui-monospace, monospace'
  for (let x = Math.ceil(x0); x <= x1; x++) if (x) ctx.fillText(String(x), v.P([x, 0])[0] + 2, Math.min(oy + 12, v.H - 4))
  for (let y = Math.ceil(y0); y <= y1; y++) if (y) ctx.fillText(String(y), Math.min(ox + 4, v.W - 14), v.P([0, y])[1] - 2)
  ctx.fillStyle = fg
  ctx.font = 'italic 600 15px Georgia, serif'
  ctx.fillText(label, 14, 24)
  ctx.font = 'italic 12px Georgia, serif'
  ctx.fillText(axes[0], v.W - 16, oy - 6)
  ctx.fillText(axes[1], ox + 6, 14)
}

function drawCurves(ctx: CanvasRenderingContext2D, v: View2D, cs: Curve[], f?: Fn) {
  for (const c of cs) {
    const pts = c.pts.map((z) => (f ? f(z) : z)).map((w) => (Number.isFinite(w.re) && Number.isFinite(w.im) && Math.hypot(w.re, w.im) < 60 ? w : null))
    ctx.strokeStyle = c.color
    ctx.lineWidth = c.width
    ctx.beginPath()
    let pen = false
    for (const w of pts) {
      if (!w) { pen = false; continue }
      const [px, py] = v.P([w.re, w.im])
      if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py)
      pen = true
    }
    if (c.fill) { ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c.color; ctx.fill(); ctx.restore() }
    ctx.stroke()
  }
}

export function MappingLab() {
  const t = useT()
  const { lang } = useLang()
  const [presetId, setPresetId] = useState('square')
  const [customText, setCustomText] = useState('z^2 + 1/z')
  const [region, setRegion] = useState<Region>('cartesian')
  const [bounds, setBounds] = useState<[number, number, number, number]>([0.2, 2, 0.2, 2])
  const [density, setDensity] = useState(9)
  const [probe, setProbe] = useState<Complex | null>(null)

  const compiled = useMemo(() => { try { return { ok: true as const, ...compileComplex(customText) } } catch (e) { return { ok: false as const, error: (e as Error).message } } }, [customText])
  const preset = MAP_PRESETS.find((p) => p.id === presetId)
  const f: Fn = preset ? preset.f : compiled.ok ? (z) => compiled.f(z, C(0)) : (z) => z
  const tex = preset ? preset.tex : compiled.ok ? `w = ${compiled.tex}` : 'w = ?'

  const pick = (p: MapPreset) => { setPresetId(p.id); setRegion(p.region); setBounds(p.bounds) }
  const pickRegion = (r: Region) => {
    setRegion(r)
    setBounds(r === 'cartesian' ? [0.2, 2, 0.2, 2] : r === 'polar' ? [0.5, 2, 0, 2 * Math.PI] : r === 'rectangle' ? [0.5, 1.5, 0.3, 1.2] : r === 'halfstrip' ? [-1, 1, 0, Math.PI] : r === 'sector' ? [0.5, 1.5, 0, Math.PI / 3] : [1, 0.5, 0.8, 0])
  }
  const accent = css('--accent') || '#6c5ce7', violet = css('--danger') || '#c0392b'
  const cs = useMemo(() => curves(region, bounds, accent, violet, density), [region, bounds, density, accent, violet])
  const wProbe = probe ? f(probe) : null

  const boundLabels: Record<Region, string[]> = {
    cartesian: ['x_{\\min}', 'x_{\\max}', 'y_{\\min}', 'y_{\\max}'], polar: ['r_{\\min}', 'r_{\\max}', '\\theta_{\\min}', '\\theta_{\\max}'],
    rectangle: ['a', 'b', 'c', 'd'], halfstrip: ['a', 'b', 'c', 'd'], sector: ['r_1', 'r_2', '\\theta_1', '\\theta_2'], disk: ['x_0', 'y_0', 'r', ''],
  }
  const ranges: [number, number][] = region === 'polar' || region === 'sector' ? [[0, 3], [0, 3], [-Math.PI, 2 * Math.PI], [-Math.PI, 2 * Math.PI]] : region === 'disk' ? [[-3, 3], [-3, 3], [0.1, 3], [0, 0]] : [[-3, 3], [-3, 3], [-3, 3], [-3, 3]]

  const plane = (label: string, axes: [string, string], mapFn?: Fn) => (
    <div className="relative h-[300px] rounded-[var(--radius)] border border-border bg-card sm:h-[420px]">
      <Canvas2D
        unit={70}
        draw={(ctx, v) => { drawPlane(ctx, v, label, axes); drawCurves(ctx, v, cs, mapFn); const p = mapFn ? wProbe : probe; if (p && Number.isFinite(p.re) && Number.isFinite(p.im)) { const [x, y] = v.P([p.re, p.im]); ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = css('--fg'); ctx.fill() } }}
        deps={[cs, mapFn, probe, wProbe]}
        onPointer={(w, phase) => { if (!mapFn && (phase === 'move' || phase === 'down')) setProbe(C(w[0], w[1])) }}
        className="h-full w-full touch-none rounded-[var(--radius)]"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          {plane(t('bidang z', 'z-plane'), ['x', 'y'])}
          <div className="hidden flex-col items-center gap-1 text-slate-500 md:flex"><Tex tex="w = f(z)" /><ArrowRight size={18} /></div>
          {plane(t('bidang w', 'w-plane'), ['u', 'v'], f)}
        </div>
        <div className="space-y-4">
          <MathCard number="01" title={t('Pemetaan', 'Mapping')} icon={<MapIcon size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {MAP_PRESETS.map((p) => <Chip key={p.id} active={presetId === p.id} onClick={() => pick(p)}>{p.label}</Chip>)}
              <Chip active={!preset} onClick={() => setPresetId('')}>{t('Kustom', 'Custom')}</Chip>
            </div>
            <div className="mt-3">
              <TextField value={customText} onChange={(v) => { setCustomText(v); setPresetId('') }} placeholder="z^2 + 1/z" invalid={!preset && !compiled.ok} />
              {!preset && !compiled.ok && <p className="mt-1 text-[11px] text-rose-300">{compiled.error}</p>}
            </div>
            <div className="mt-3 text-center"><Tex tex={tex} /></div>
          </MathCard>
          <MathCard number="02" title={t('Daerah di bidang z', 'Region in the z-plane')} icon={<Shapes size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((r) => <Chip key={r.id} active={region === r.id} onClick={() => pickRegion(r.id)}>{r.label[lang]}</Chip>)}
            </div>
            <div className="mt-3 space-y-2">
              {boundLabels[region].map((lb, i) => lb && (
                <Slider key={i} label={<Tex tex={lb} />} value={bounds[i]} min={ranges[i][0]} max={ranges[i][1]} step={0.01} onChange={(v) => { const b = [...bounds] as typeof bounds; b[i] = v; setBounds(b) }} />
              ))}
              <Slider label={t('Kerapatan kurva', 'Curve density')} value={density} min={3} max={17} step={2} onChange={setDensity} format={(v) => String(v)} />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{t('Gerakkan kursor di bidang z untuk melihat bayangan titiknya di bidang w.', 'Move the cursor over the z-plane to see the image of the point in the w-plane.')}</p>
          </MathCard>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MathCard title={t('Bayangan kurva', 'Images of the curves')} icon={<MapIcon size={16} />}>
          <p className="text-xs leading-relaxed text-slate-400">
            {preset ? preset.note[lang] : t('Fungsi kustom: kurva keluarga pertama (ungu) dan kedua (merah) dipetakan titik demi titik. Jika f analitik dengan f′ ≠ 0, sudut perpotongan (90°) dipertahankan.', 'Custom function: the first (violet) and second (red) curve families are mapped point by point. If f is analytic with f′ ≠ 0, the right angles between them are preserved.')}
          </p>
        </MathCard>
        <MathCard title={t('Titik uji', 'Probe point')} icon={<ArrowRight size={16} />}>
          {probe && wProbe ? (
            <div className="space-y-1">
              <FormulaBlock tex={`z = ${probe.re.toFixed(3)} ${probe.im < 0 ? '-' : '+'} ${Math.abs(probe.im).toFixed(3)}i = ${Math.hypot(probe.re, probe.im).toFixed(3)}\\,e^{i(${Math.atan2(probe.im, probe.re).toFixed(3)})}`} />
              <FormulaBlock tex={`w = f(z) = ${wProbe.re.toFixed(3)} ${wProbe.im < 0 ? '-' : '+'} ${Math.abs(wProbe.im).toFixed(3)}i,\\quad |w| = ${Math.hypot(wProbe.re, wProbe.im).toFixed(3)},\\ \\arg w = ${Math.atan2(wProbe.im, wProbe.re).toFixed(3)}`} />
            </div>
          ) : <p className="text-sm text-slate-500">{t('Arahkan kursor ke bidang z.', 'Point at the z-plane.')}</p>}
        </MathCard>
        <MathCard title={t('Teori (Brown & Churchill §12-14)', 'Theory (Brown & Churchill §12-14)')} icon={<BookOpen size={16} />}>
          <div className="space-y-2 text-xs leading-relaxed text-slate-400">
            {t(
              <>
                <p>Fungsi kompleks <Tex tex="w = f(z) = u(x,y) + i\,v(x,y)" /> tidak dapat digambar sebagai grafik; ia dipahami sebagai <b>pemetaan</b> dari bidang <Tex tex="z" /> ke bidang <Tex tex="w" />: kita gambar sebuah daerah atau keluarga kurva dan bayangannya.</p>
                <p>Bayangan kurva <Tex tex="x = c_1" /> di bawah <Tex tex="w = z^2" /> diperoleh dari <Tex tex="u = c_1^2 - y^2,\ v = 2c_1 y" /> dengan mengeliminasi <Tex tex="y" />: <Tex tex="v^2 = 4c_1^2(c_1^2 - u)" />, sebuah parabola.</p>
                <p>Dalam bentuk kutub <Tex tex="z = re^{i\theta}" />, <Tex tex="z^n = r^n e^{in\theta}" />: modulus dipangkatkan, argumen dikalikan. Inilah sebabnya <Tex tex="z^2" /> menggandakan sudut dan <Tex tex="e^z" /> mengubah pita menjadi anulus.</p>
              </>,
              <>
                <p>A complex function <Tex tex="w = f(z) = u(x,y) + i\,v(x,y)" /> cannot be graphed; it is understood as a <b>mapping</b> from the <Tex tex="z" />-plane to the <Tex tex="w" />-plane: we draw a region or a family of curves and its image.</p>
                <p>The image of <Tex tex="x = c_1" /> under <Tex tex="w = z^2" /> follows from <Tex tex="u = c_1^2 - y^2,\ v = 2c_1 y" /> by eliminating <Tex tex="y" />: <Tex tex="v^2 = 4c_1^2(c_1^2 - u)" />, a parabola.</p>
                <p>In polar form <Tex tex="z = re^{i\theta}" />, <Tex tex="z^n = r^n e^{in\theta}" />: the modulus is raised to the power, the argument multiplied. That is why <Tex tex="z^2" /> doubles angles and <Tex tex="e^z" /> turns strips into annuli.</p>
              </>,
            )}
          </div>
        </MathCard>
      </div>
    </div>
  )
}
