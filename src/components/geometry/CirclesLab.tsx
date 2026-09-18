import { useRef, useState } from 'react'
import { BookOpen, Circle as CircleIcon, MousePointer2 } from 'lucide-react'
import { fromCentre, power, polar, radicalAxis, pencil, tangentsFrom, circleCircle, radius, radius2, isReal, type Circle, type Line2 } from '../../lib/circles'
import type { Vec2 } from '../../lib/matrix-math'
import { useT } from '../../lib/i18n'
import { fmt, signed } from '../../lib/utils'
import { Canvas2D, drawGrid, drawLine, drawPoint, type View2D } from '../ui/Canvas2D'
import { Layout } from '../ui/Layout'
import { EquationField } from '../ui/EquationField'
import { MathCard, Toggle } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

const UNIT = 40
const circleTex = (c: Circle, name: string) => `${name}:\\; x^2 + y^2 ${signed(-2 * c.alpha)}\\,x ${signed(-2 * c.beta)}\\,y ${signed(c.sigma)} = 0`
const lineTex = (l: Line2) => `${fmt(l.a)}\\,x ${signed(l.b)}\\,y ${signed(l.c)} = 0`

interface Spec { cx: number; cy: number; r: number }

export function CirclesLab() {
  const t = useT()
  const [s1, setS1] = useState<Spec>({ cx: -1.5, cy: 0, r: 2 })
  const [s2, setS2] = useState<Spec>({ cx: 1.5, cy: 0.5, r: 1.5 })
  const [M, setM] = useState<Vec2>([1, 3])
  const [lambda, setLambda] = useState(0.5)
  const [showPencil, setShowPencil] = useState(true)
  const dragging = useRef(false)

  const c1 = fromCentre(s1.cx, s1.cy, s1.r)
  const c2 = fromCentre(s2.cx, s2.cy, s2.r)
  const p1 = power(c1, M), p2 = power(c2, M)
  const pol = polar(c1, M)
  const tang = tangentsFrom(c1, M)
  const rad = radicalAxis(c1, c2)
  const inter = circleCircle(c1, c2)
  const pen = pencil(c1, c2, lambda)

  const draw = (ctx: CanvasRenderingContext2D, view: View2D) => {
    drawGrid(ctx, view)
    const circle = (c: Circle, color: string, width = 2, dash: number[] = []) => {
      if (!isReal(c)) return
      const [x, y] = view.P([c.alpha, c.beta])
      ctx.beginPath(); ctx.arc(x, y, radius(c) * UNIT, 0, Math.PI * 2)
      ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([])
    }
    if (showPencil) circle(pen, '#f472b6', 2, [4, 4])
    circle(c1, '#38bdf8'); circle(c2, '#a78bfa')
    drawPoint(ctx, view, [c1.alpha, c1.beta], '#38bdf8', 'A₁', 3)
    drawPoint(ctx, view, [c2.alpha, c2.beta], '#a78bfa', 'A₂', 3)
    drawLine(ctx, view, rad.a, rad.b, rad.c, '#34d399', 1.5, [6, 4])
    drawLine(ctx, view, pol.a, pol.b, pol.c, '#fbbf24', 1.5, [2, 4])
    for (const T of tang) {
      const a = view.P(M), b = view.P(T)
      ctx.strokeStyle = 'rgba(251,191,36,0.8)'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
      drawPoint(ctx, view, T, '#fbbf24', undefined, 3)
    }
    for (const P of inter) drawPoint(ctx, view, P, '#34d399', undefined, 3.5)
    drawPoint(ctx, view, M, '#ffffff', 'M', 6)
  }

  const specSliders = (s: Spec, set: (s: Spec) => void, name: string) => (
    <div className="space-y-2">
      <EquationField
        placeholder="x^2 + y^2 - 2x + 4y - 4 = 0"
        onApply={(q) => {
          if (q.a33 || q.a13 || q.a23 || q.a30) return t('Persamaan memuat z.', 'The equation involves z.')
          if (Math.abs(q.a11 - q.a22) > 1e-9 || Math.abs(q.a12) > 1e-9 || !q.a11) return t('Bukan lingkaran: koefisien x² dan y² harus sama dan tanpa suku xy.', 'Not a circle: the x² and y² coefficients must agree and there must be no xy term.')
          const alpha = -q.a10 / q.a11, beta = -q.a20 / q.a11, sigma = q.a00 / q.a11
          const r2 = alpha * alpha + beta * beta - sigma
          if (r2 <= 0) return t(`Lingkaran imajiner: ρ² = ${r2.toFixed(3)} ≤ 0.`, `Imaginary circle: ρ² = ${r2.toFixed(3)} ≤ 0.`)
          set({ cx: alpha, cy: beta, r: Math.sqrt(r2) })
          return null
        }}
      />
      <Slider label={<Tex tex={`\\alpha_{${name}}`} />} value={s.cx} min={-5} max={5} step={0.05} onChange={(cx) => set({ ...s, cx })} />
      <Slider label={<Tex tex={`\\beta_{${name}}`} />} value={s.cy} min={-4} max={4} step={0.05} onChange={(cy) => set({ ...s, cy })} />
      <Slider label={<Tex tex={`\\rho_{${name}}`} />} value={s.r} min={0.2} max={4} step={0.05} onChange={(r) => set({ ...s, r })} />
    </div>
  )

  return (
    <Layout
      canvas={
        <Canvas2D
          unit={UNIT}
          draw={draw}
          deps={[s1, s2, M, lambda, showPencil]}
          onPointer={(w, phase) => {
            if (phase === 'down' && Math.hypot(w[0] - M[0], w[1] - M[1]) * UNIT < 16) dragging.current = true
            if (phase === 'move' && dragging.current) setM(w)
            if (phase === 'up') dragging.current = false
          }}
        />
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex="\Gamma_1" /> {t('(biru)', '(blue)')}</span>} icon={<CircleIcon size={16} />}>{specSliders(s1, setS1, '1')}</MathCard>
          <MathCard title={<span><Tex tex="\Gamma_2" /> {t('(ungu)', '(violet)')}</span>} icon={<CircleIcon size={16} />}>{specSliders(s2, setS2, '2')}</MathCard>
          <MathCard title={t('Pensil lingkaran', 'Pencil of circles')}>
            <div className="space-y-2">
              <Toggle label={<Tex tex="\lambda\,\Gamma_1 + (1-\lambda)\,\Gamma_2" />} checked={showPencil} onChange={setShowPencil} />
              <Slider label={<Tex tex="\lambda" />} value={lambda} min={-2} max={3} step={0.01} defaultValue={0.5} onChange={setLambda} />
            </div>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Persamaan umum', 'General equations')} icon={<CircleIcon size={16} />}>
            <FormulaBlock tex={circleTex(c1, '\\Gamma_1')} />
            <FormulaBlock tex={circleTex(c2, '\\Gamma_2')} />
            <p className="text-xs text-slate-400">
              {t(<>Pusat <Tex tex="(\alpha, \beta)" />, jari-jari <Tex tex="\rho^2 = \alpha^2 + \beta^2 - \sigma" /> (Vaisman 3.1.3). Jika <Tex tex="\rho^2 < 0" /> lingkarannya imajiner.</>,
                 <>Centre <Tex tex="(\alpha, \beta)" />, radius <Tex tex="\rho^2 = \alpha^2 + \beta^2 - \sigma" /> (Vaisman 3.1.3). If <Tex tex="\rho^2 < 0" /> the circle is imaginary.</>)}
            </p>
            <div className="mt-2 border-t border-border pt-2">
              <FormulaBlock tex={`${circleTex(pen, '\\Gamma_\\lambda')}${isReal(pen) ? `,\\quad \\rho = ${fmt(radius(pen))}` : `,\\quad \\rho^2 = ${fmt(radius2(pen))} < 0`}`} />
              <p className="text-xs text-slate-400">
                {t('Setiap anggota pensil melalui titik-titik potong Γ₁ ∩ Γ₂ (real atau imajiner). λ = 1 memberi Γ₁, λ = 0 memberi Γ₂.',
                   'Every member of the pencil passes through Γ₁ ∩ Γ₂ (real or imaginary points). λ = 1 gives Γ₁, λ = 0 gives Γ₂.')}
              </p>
            </div>
          </MathCard>

          <MathCard title={t('Kuasa titik & garis kutub', 'Power of a point & polar')} icon={<MousePointer2 size={16} />}>
            <FormulaBlock tex={`M = (${fmt(M[0])}, ${fmt(M[1])})`} />
            <FormulaBlock tex={`p(M, \\Gamma_1) = ${fmt(p1, 3)},\\qquad p(M, \\Gamma_2) = ${fmt(p2, 3)}`} />
            <p className="text-xs text-slate-400">
              {p1 > 0 ? t('M di luar Γ₁: ada dua garis singgung real (kuning); titik singgungnya terletak pada garis kutub.', 'M is exterior to Γ₁: two real tangents (yellow); their contact points lie on the polar.')
                : p1 < 0 ? t('M di dalam Γ₁: garis singgungnya imajiner, tetapi garis kutub tetap real.', 'M is interior to Γ₁: the tangents are imaginary, but the polar is still real.')
                : t('M pada Γ₁: garis kutub adalah garis singgung di M.', 'M on Γ₁: the polar is the tangent at M.')}
            </p>
            <FormulaBlock tex={`\\text{${t('kutub', 'polar')}}(M, \\Gamma_1):\\; ${lineTex(pol)}`} />
            <p className="text-xs text-slate-400">
              {t(<>Kuasa <Tex tex="p(M,\Gamma) = \overline{MP_1}\cdot\overline{MP_2}" /> untuk sebarang garis melalui M yang memotong Γ di <Tex tex="P_1, P_2" /> (Prop. 3.1.7); nilainya sama dengan ruas kiri persamaan umum di M. Garis kutub diperoleh dengan polarisasi <Tex tex="x^2 \mapsto x x_0,\; x \mapsto \tfrac12(x + x_0)" />.</>,
                 <>The power <Tex tex="p(M,\Gamma) = \overline{MP_1}\cdot\overline{MP_2}" /> for any line through M meeting Γ at <Tex tex="P_1, P_2" /> (Prop. 3.1.7); it equals the left-hand side of the general equation at M. The polar comes from polarisation <Tex tex="x^2 \mapsto x x_0,\; x \mapsto \tfrac12(x + x_0)" />.</>)}
            </p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">{t('Seret M.', 'Drag M.')}</span></p>
          </MathCard>

          <MathCard title={t('Sumbu radikal', 'Radical axis')} icon={<BookOpen size={16} />}>
            <FormulaBlock tex={lineTex(rad)} />
            <p className="text-xs text-slate-400">
              {t(<>Tempat kedudukan titik dengan kuasa sama terhadap <Tex tex="\Gamma_1" /> dan <Tex tex="\Gamma_2" /> (hijau putus-putus): <Tex tex="2(\alpha_2-\alpha_1)x + 2(\beta_2-\beta_1)y - (\sigma_2-\sigma_1) = 0" />. Garis ini tegak lurus garis pusat dan melalui titik potong kedua lingkaran{inter.length ? ` (${inter.length} ${t('titik real', 'real points')})` : t(' (di sini imajiner)', ' (here imaginary)')}.</>,
                 <>The locus of points with equal power with respect to <Tex tex="\Gamma_1" /> and <Tex tex="\Gamma_2" /> (dashed green): <Tex tex="2(\alpha_2-\alpha_1)x + 2(\beta_2-\beta_1)y - (\sigma_2-\sigma_1) = 0" />. It is perpendicular to the line of centres and passes through the intersection points{inter.length ? ` (${inter.length} real)` : ' (here imaginary)'}.</>)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {t('Untuk bola berlaku hal serupa: bidang radikal, sumbu radikal (tiga bola), dan pusat radikal (empat bola). Irisan bola dengan bidang adalah lingkaran; lihat tab Kuadrik dengan elipsoid a = b = c.',
                 'Spheres behave the same way: radical plane, radical axis (three spheres) and radical centre (four spheres). A plane cuts a sphere in a circle; see the Quadrics tab with an ellipsoid a = b = c.')}
            </p>
          </MathCard>
        </div>
      }
    />
  )
}
