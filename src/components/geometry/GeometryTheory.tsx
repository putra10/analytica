import { useMemo } from 'react'
import { BookOpen, Grid3x3, Spline } from 'lucide-react'
import { invariants, largeMatrix, TYPE_LABEL, TYPE_INDEX, CONIC_KIND_LABEL, type Quadric, type Reduced, type Slice } from '../../lib/quadrics'
import { useLang, useT } from '../../lib/i18n'
import { fmt, signed } from '../../lib/utils'
import { MathCard } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

interface Props {
  q: Quadric
  reduced: Reduced
  slice: Slice
}

const pmatrix = (m: number[][]) => `\\begin{pmatrix} ${m.map((r) => r.map((x) => fmt(x)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`
const vecTex = (v: number[]) => `(${v.map((x) => fmt(x, 3)).join(', ')})`

export function GeometryTheory({ q, reduced, slice }: Props) {
  const t = useT()
  const { lang } = useLang()
  const inv = useMemo(() => invariants(q), [q])
  const { a11, a12, a22, a10, a20, a00 } = slice.conic
  const idx = TYPE_INDEX[reduced.type]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <MathCard title={t('Bentuk matriks & invarian', 'Matrix form & invariants')} icon={<Grid3x3 size={16} />}>
        <p className="mb-1 text-xs text-slate-400">
          {t(<><Tex tex="f(\bar r) = \bar r\cdot T\bar r + 2\bar a\cdot\bar r + \alpha = 0" />, atau <Tex tex="\xi^t A \xi + 2a^t\xi + \alpha = 0" />, <Tex tex="\mathcal X^t \tilde A \mathcal X = 0" /> (3.3.10, 3.3.11):</>,
             <><Tex tex="f(\bar r) = \bar r\cdot T\bar r + 2\bar a\cdot\bar r + \alpha = 0" />, i.e. <Tex tex="\xi^t A \xi + 2a^t\xi + \alpha = 0" />, <Tex tex="\mathcal X^t \tilde A \mathcal X = 0" /> (3.3.10, 3.3.11):</>)}
        </p>
        <FormulaBlock tex={`\\tilde A = ${pmatrix(largeMatrix(q))}`} />
        <FormulaBlock tex={`\\delta = \\det A = ${fmt(inv.delta, 3)},\\quad \\Delta = \\det\\tilde A = ${fmt(inv.Delta, 3)}`} />
        <FormulaBlock tex={`I = \\operatorname{tr} A = ${fmt(inv.I, 3)},\\quad J = \\textstyle\\sum \\text{minor utama } 2\\times2 = ${fmt(inv.J, 3)}`} />
        <p className="text-xs leading-relaxed text-slate-400">
          {t(<>Matriks kecil <Tex tex="A" /> dan matriks besar <Tex tex="\tilde A" /> (3.3.7-3.3.8). Kuadrik berpusat tunggal iff <Tex tex="\delta \neq 0" /> (3.3.32); tak-degenerasi iff <Tex tex="\Delta \neq 0" /> (Prop. 3.4.9). Tanda <Tex tex="\Delta" /> dan ke-nol-an <Tex tex="\delta" /> invarian afin; nilai <Tex tex="I, J, \delta, \Delta" /> invarian ortogonal.</>,
             <>Small matrix <Tex tex="A" /> and large matrix <Tex tex="\tilde A" /> (3.3.7-3.3.8). Unique centre iff <Tex tex="\delta \neq 0" /> (3.3.32); nondegenerate iff <Tex tex="\Delta \neq 0" /> (Prop. 3.4.9). The sign of <Tex tex="\Delta" /> and the vanishing of <Tex tex="\delta" /> are affine invariants; <Tex tex="I, J, \delta, \Delta" /> are orthogonal invariants.</>)}
        </p>
      </MathCard>

      <MathCard title={t('Reduksi ke bentuk kanonik', 'Reduction to canonical form')} icon={<Spline size={16} />}>
        <p className="text-sm text-slate-200">
          {t('Jenis: ', 'Type: ')}<span className="font-semibold text-amber-300">{TYPE_LABEL[reduced.type][lang]}</span>
          {idx > 0 && <span className="text-slate-500"> ({t('kelas', 'class')} {idx}, Teorema 3.4.6)</span>}
        </p>
        {reduced.rank > 0 && (
          <>
            <FormulaBlock tex={`s_1 = ${fmt(reduced.s[0], 3)},\\; s_2 = ${fmt(reduced.s[1], 3)},\\; s_3 = ${fmt(reduced.s[2], 3)}`} />
            <FormulaBlock tex={`\\bar v_1 = ${vecTex(reduced.axes[0])},\\; \\bar v_2 = ${vecTex(reduced.axes[1])},\\; \\bar v_3 = ${vecTex(reduced.axes[2])}`} />
            <FormulaBlock tex={`O' = ${vecTex(reduced.origin)}`} />
            <FormulaBlock tex={reduced.canonicalTex} />
          </>
        )}
        <p className="text-xs leading-relaxed text-slate-400">
          {t(<>Langkah Contoh 3.4.3: (1) persamaan karakteristik <Tex tex="\det(A - sI) = 0" /> memberi <Tex tex="s_i" /> dan arah utama <Tex tex="\bar v_i" /> (sistem karakteristik 3.3.37); (2) bidang diametral konjugat <Tex tex="\bar r\cdot T\bar v_i + \bar a\cdot\bar v_i = 0" /> adalah bidang simetri; (3) pindahkan titik asal ke pusat <Tex tex="A\xi + a = 0" /> (atau ke puncak untuk paraboloid) dan putar ke basis <Tex tex="(\bar v_1, \bar v_2, \bar v_3)" />. Kerangka kanonik tampak putus-putus pada gambar.</>,
             <>Steps of Example 3.4.3: (1) the characteristic equation <Tex tex="\det(A - sI) = 0" /> gives <Tex tex="s_i" /> and the principal directions <Tex tex="\bar v_i" /> (characteristic system 3.3.37); (2) the conjugate diametral planes <Tex tex="\bar r\cdot T\bar v_i + \bar a\cdot\bar v_i = 0" /> are symmetry planes; (3) translate the origin to the centre <Tex tex="A\xi + a = 0" /> (or to the vertex for paraboloids) and rotate to the basis <Tex tex="(\bar v_1, \bar v_2, \bar v_3)" />. The canonical frame is drawn dashed.</>)}
        </p>
      </MathCard>

      <MathCard title={t('Irisan dengan bidang', 'Plane section')} icon={<BookOpen size={16} />}>
        <p className="text-sm text-slate-200">
          {t('Irisannya adalah ', 'The section is ')}<span className="font-semibold text-amber-300">{CONIC_KIND_LABEL[slice.kind][lang]}</span>.
        </p>
        <p className="mt-1 text-xs text-slate-400">{t('Dalam koordinat ortonormal (s, t) pada bidang, konik irisannya (Prop. 3.3.2):', 'In orthonormal in-plane coordinates (s, t) the section conic is (Prop. 3.3.2):')}</p>
        <FormulaBlock tex={`${fmt(a11)}\\,s^2 ${signed(2 * a12)}\\,st ${signed(a22)}\\,t^2 ${signed(2 * a10)}\\,s ${signed(2 * a20)}\\,t ${signed(a00)} = 0`} />
        <FormulaBlock tex={`\\delta_\\pi = ${fmt(slice.delta, 3)},\\quad \\Delta_\\pi = ${fmt(slice.Delta, 3)}`} />
        <p className="text-xs leading-relaxed text-slate-400">
          {t(<><Tex tex="\Delta_\pi \neq 0" /> dan <Tex tex="\delta_\pi > 0" />: elips; <Tex tex="\delta_\pi < 0" />: hiperbola; <Tex tex="\delta_\pi = 0" />: parabola. Memiringkan bidang melalui kerucut menghasilkan semua irisan kerucut; bidang melalui pusat hiperboloid satu lembar yang sejajar generator memberi sepasang garis (Latihan 3.2.16).</>,
             <><Tex tex="\Delta_\pi \neq 0" /> with <Tex tex="\delta_\pi > 0" />: ellipse; <Tex tex="\delta_\pi < 0" />: hyperbola; <Tex tex="\delta_\pi = 0" />: parabola. Tilting the plane through a cone yields every conic section; a plane through a one-sheeted hyperboloid parallel to its generators gives a pair of lines (Exercise 3.2.16).</>)}
        </p>
      </MathCard>
    </div>
  )
}
