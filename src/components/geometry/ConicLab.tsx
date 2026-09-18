import { useMemo, useState } from 'react'
import { BookOpen, Grid3x3, Spline } from 'lucide-react'
import { analyzeConic, evalConic, CONIC_PRESETS, CONIC_TYPE_LABEL, CONIC_TYPE_INDEX, type Conic } from '../../lib/conics'
import { marchingSquares } from '../../lib/marching'
import { useLang, useT } from '../../lib/i18n'
import { fmt, signed } from '../../lib/utils'
import { Canvas2D, drawGrid, drawLine, drawPoint, drawSegments, type View2D } from '../ui/Canvas2D'
import { Layout, NumInput } from '../ui/Layout'
import { EquationField } from '../ui/EquationField'
import { MathCard, Chip, Toggle } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

const UNIT = 40
const R = 12

const conicTex = (c: Conic) =>
  `${fmt(c.a11)}\\,x^2 ${signed(c.a22)}\\,y^2 ${signed(2 * c.a12)}\\,xy ${signed(2 * c.a10)}\\,x ${signed(2 * c.a20)}\\,y ${signed(c.a00)} = 0`
const bmatrix = (m: number[][]) => `\\begin{pmatrix} ${m.map((r) => r.map((x) => fmt(x)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`

export function ConicLab() {
  const t = useT()
  const { lang } = useLang()
  const [c, setC] = useState<Conic>(CONIC_PRESETS[3].c)
  const [showAxes, setShowAxes] = useState(true)
  const [showFoci, setShowFoci] = useState(true)
  const an = useMemo(() => analyzeConic(c), [c])
  const segs = useMemo(() => marchingSquares((x, y) => evalConic(c, x, y), -R, R, -R, R, 320), [c])

  const draw = (ctx: CanvasRenderingContext2D, v: View2D) => {
    drawGrid(ctx, v)
    if (showAxes && an.rank > 0) {
      const o = an.origin
      an.axes.forEach((ax, i) => drawLine(ctx, v, -ax[1], ax[0], ax[1] * o[0] - ax[0] * o[1], i ? '#a78bfa' : '#fbbf24', 1, [6, 4]))
      an.asymptotes?.forEach((d) => drawLine(ctx, v, -d[1], d[0], d[1] * o[0] - d[0] * o[1], '#34d399', 1, [2, 4]))
    }
    drawSegments(ctx, v, segs, '#38bdf8', 2.5)
    if (showAxes && an.rank === 2) drawPoint(ctx, v, an.origin, '#fbbf24', 'C', 4)
    if (showAxes && an.type === 'parabola') drawPoint(ctx, v, an.origin, '#fbbf24', 'V', 4)
    if (showFoci) an.foci?.forEach((f, i) => drawPoint(ctx, v, f, '#f472b6', `F${i + 1}`, 4))
  }

  const set = (k: keyof Conic) => (v: number) => setC({ ...c, [k]: v })
  const typeLabel = CONIC_TYPE_LABEL[an.type][lang]
  const idx = CONIC_TYPE_INDEX[an.type]

  return (
    <Layout
      canvas={<Canvas2D unit={UNIT} draw={draw} deps={[c, showAxes, showFoci, segs]} />}
      controls={
        <div className="space-y-4">
          <MathCard number="01" title={t('Persamaan konik', 'Conic equation')} icon={<Spline size={16} />}>
            <div className="mb-3">
              <EquationField
                placeholder="5x^2 - 2y^2 + 24xy + 4x - 1 = 0"
                onApply={(q) => {
                  if (q.a33 || q.a13 || q.a23 || q.a30) return t('Persamaan memuat z: gunakan tab Kuadrik.', 'The equation involves z: use the Quadrics tab.')
                  if (!q.a11 && !q.a12 && !q.a22) return t('Tidak ada suku kuadrat.', 'No quadratic term.')
                  setC({ a11: q.a11, a12: q.a12, a22: q.a22, a10: q.a10, a20: q.a20, a00: q.a00 })
                  return null
                }}
              />
            </div>
            <p className="mb-2 text-[11px] text-slate-500"><Tex tex="a_{11}x^2 + a_{22}y^2 + 2a_{12}xy + 2a_{10}x + 2a_{20}y + a_{00} = 0" /></p>
            <div className="grid grid-cols-3 gap-1.5">
              <NumInput label="a₁₁" value={c.a11} onChange={set('a11')} />
              <NumInput label="a₁₂" value={c.a12} onChange={set('a12')} />
              <NumInput label="a₂₂" value={c.a22} onChange={set('a22')} />
              <NumInput label="a₁₀" value={c.a10} onChange={set('a10')} />
              <NumInput label="a₂₀" value={c.a20} onChange={set('a20')} />
              <NumInput label="a₀₀" value={c.a00} onChange={set('a00')} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CONIC_PRESETS.map((p) => (
                <Chip key={p.id} active={p.c === c} onClick={() => setC(p.c)}>{p.ref ? `${p.ref}` : p.label}</Chip>
              ))}
            </div>
          </MathCard>
          <MathCard title={t('Tampilan', 'Display')}>
            <div className="space-y-2">
              <Toggle label={t('Pusat, sumbu simetri, asimtot', 'Centre, symmetry axes, asymptotes')} checked={showAxes} onChange={setShowAxes} />
              <Toggle label={t('Titik fokus', 'Foci')} checked={showFoci} onChange={setShowFoci} />
            </div>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Matriks & invarian', 'Matrices & invariants')} icon={<Grid3x3 size={16} />}>
            <FormulaBlock tex={conicTex(c)} />
            <FormulaBlock tex={`A = ${bmatrix([[c.a11, c.a12], [c.a12, c.a22]])},\\quad \\tilde A = ${bmatrix([[c.a11, c.a12, c.a10], [c.a12, c.a22, c.a20], [c.a10, c.a20, c.a00]])}`} />
            <FormulaBlock tex={`I = \\operatorname{tr} A = ${fmt(an.I, 3)},\\quad \\delta = \\det A = ${fmt(an.delta, 3)},\\quad \\Delta = \\det\\tilde A = ${fmt(an.Delta, 3)}`} />
            <p className="text-xs leading-relaxed text-slate-400">
              {t(<><Tex tex="\delta" /> dan <Tex tex="\Delta" /> invarian terhadap transformasi koordinat ortogonal, dan tanda keduanya (serta ke-nol-annya) invarian afin (Prop. 3.4.8). <Tex tex="\Delta \neq 0" /> ⇔ konik tak-degenerasi; <Tex tex="\delta > 0" /> tipe eliptik, <Tex tex="\delta < 0" /> hiperbolik, <Tex tex="\delta = 0" /> parabolik (Prop. 3.4.10).</>,
                 <><Tex tex="\delta" /> and <Tex tex="\Delta" /> are invariant under orthogonal coordinate changes, and their signs (and vanishing) are affine invariants (Prop. 3.4.8). <Tex tex="\Delta \neq 0" /> ⇔ nondegenerate; <Tex tex="\delta > 0" /> elliptic type, <Tex tex="\delta < 0" /> hyperbolic, <Tex tex="\delta = 0" /> parabolic (Prop. 3.4.10).</>)}
            </p>
          </MathCard>

          <MathCard title={t('Klasifikasi & bentuk kanonik', 'Classification & canonical form')} icon={<Spline size={16} />}>
            <p className="text-sm text-slate-200">
              {t('Jenis: ', 'Type: ')}<span className="font-semibold text-amber-300">{typeLabel}</span>
              {idx > 0 && <span className="text-slate-500"> ({t('kelas', 'class')} {idx}, Teorema 3.4.5)</span>}
            </p>
            {an.rank > 0 && (
              <>
                <FormulaBlock tex={`s^2 - I s + \\delta = 0 \\;\\Rightarrow\\; s_1 = ${fmt(an.s[0], 3)},\\; s_2 = ${fmt(an.s[1], 3)}`} />
                <FormulaBlock tex={`\\bar v_1 = (${fmt(an.axes[0][0], 3)}, ${fmt(an.axes[0][1], 3)}),\\; \\bar v_2 = (${fmt(an.axes[1][0], 3)}, ${fmt(an.axes[1][1], 3)}),\\quad \\theta = ${fmt((an.theta * 180) / Math.PI, 1)}^\\circ`} />
                <FormulaBlock tex={`${an.rank === 2 ? 'C' : 'V'} = (${fmt(an.origin[0], 3)}, ${fmt(an.origin[1], 3)})`} />
                <FormulaBlock tex={an.canonicalTex} />
                {an.a !== undefined && an.b !== undefined && <FormulaBlock tex={`a = ${fmt(an.a, 3)},\\; b = ${fmt(an.b, 3)}${an.foci ? `,\\; c = ${fmt(Math.hypot(an.foci[0][0] - an.origin[0], an.foci[0][1] - an.origin[1]), 3)}` : ''}`} />}
                {an.type === 'parabola' && <FormulaBlock tex={`x'^2 = 2\\,(${fmt(an.p / an.s[0], 3)})\\,y'`} />}
              </>
            )}
            <p className="text-xs leading-relaxed text-slate-400">
              {t(<>Arah utama = vektor eigen dari <Tex tex="A" /> (Prop. 3.3.20); diameter konjugatnya adalah sumbu simetri (kuning, ungu). Pusat memenuhi <Tex tex="A\xi + a = 0" /> (3.3.31′) dan ada tunggal iff <Tex tex="\delta \neq 0" />. Dalam kerangka kanonik <Tex tex="(x', y')" /> suku silang dan suku linear lenyap.</>,
                 <>Principal directions = eigenvectors of <Tex tex="A" /> (Prop. 3.3.20); their conjugate diameters are the symmetry axes (yellow, violet). The centre solves <Tex tex="A\xi + a = 0" /> (3.3.31′) and is unique iff <Tex tex="\delta \neq 0" />. In the canonical frame <Tex tex="(x', y')" /> the cross and linear terms vanish.</>)}
            </p>
          </MathCard>

          <MathCard title={t('Tabel klasifikasi afin (Vaisman 3.4)', 'Affine classification table (Vaisman 3.4)')} icon={<BookOpen size={16} />}>
            <table className="w-full text-[11px] text-slate-300">
              <tbody>
                {[
                  ['imaginary-ellipse', '\\Delta \\neq 0,\\ \\delta > 0,\\ \\cap = \\text{imag.}'],
                  ['ellipse', '\\Delta \\neq 0,\\ \\delta > 0,\\ \\cap = \\text{real}'],
                  ['hyperbola', '\\Delta \\neq 0,\\ \\delta < 0'],
                  ['parabola', '\\Delta \\neq 0,\\ \\delta = 0'],
                  ['imaginary-crossing-lines', '\\Delta = 0,\\ \\delta > 0'],
                  ['real-crossing-lines', '\\Delta = 0,\\ \\delta < 0'],
                  ['real-parallel-lines', '\\Delta = 0,\\ \\delta = 0,\\ \\cap = 2\\text{ pts}'],
                  ['imaginary-parallel-lines', '\\Delta = 0,\\ \\delta = 0,\\ \\cap = \\text{imag.}'],
                  ['coincident-lines', '\\Delta = 0,\\ \\delta = 0,\\ \\cap = 1\\text{ pt}'],
                ].map(([k, tex]) => (
                  <tr key={k} className={an.type === k || (k === 'ellipse' && an.type === 'circle') ? 'text-amber-300' : ''}>
                    <td className="py-0.5 pr-2">{CONIC_TYPE_LABEL[k as keyof typeof CONIC_TYPE_LABEL][lang]}</td>
                    <td className="py-0.5"><Tex tex={tex} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-400">
              {t('∩ adalah uji perpotongan dengan garis y = k: banyaknya titik real yang diperoleh.', '∩ is the intersection test with a line y = k: how many real points appear.')}
            </p>
          </MathCard>
        </div>
      }
    />
  )
}
