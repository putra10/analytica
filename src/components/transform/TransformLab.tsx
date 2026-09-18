import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Play, RotateCcw, Sigma, SquareFunction } from 'lucide-react'
import {
  IDENTITY, charPolyTex, det2, directionAngle, eigen2, eigenvaluesTex, lerpMat, norm2, svd2, trace2,
  type Eigen2, type Mat2, type Vec2,
} from '../../lib/matrix-math'
import { useT } from '../../lib/i18n'
import { fmt, signed } from '../../lib/utils'
import { Layout, NumInput } from '../ui/Layout'
import { MathCard, Chip, Toggle } from '../ui/MathCard'
import { Slider } from '../ui/Slider'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { MatrixTransformCanvas } from './MatrixTransformCanvas'
import { EigenTracker } from './EigenTracker'

const r45 = Math.SQRT1_2
const PRESETS: { id: string; label: { id: string; en: string }; m: Mat2; c: Vec2 }[] = [
  { id: 'id', label: { id: 'Identitas', en: 'Identity' }, m: IDENTITY, c: [0, 0] },
  { id: 'rot', label: { id: 'Rotasi 45°', en: 'Rotation 45°' }, m: [r45, -r45, r45, r45], c: [0, 0] },
  { id: 'refl', label: { id: 'Simetri thd y = x', en: 'Reflection in y = x' }, m: [0, 1, 1, 0], c: [0, 0] },
  { id: 'trans', label: { id: 'Translasi', en: 'Translation' }, m: IDENTITY, c: [1.5, 1] },
  { id: 'glide', label: { id: 'Pencerminan geser', en: 'Glide reflection' }, m: [1, 0, 0, -1], c: [1.5, 0] },
  { id: 'rotP', label: { id: 'Rotasi 90° pusat (2,1)', en: 'Rotation 90° about (2,1)' }, m: [0, -1, 1, 0], c: [3, -1] },
  { id: 'homo', label: { id: 'Homoteti ×2', en: 'Homothety ×2' }, m: [2, 0, 0, 2], c: [-1, -1] },
  { id: 'sim', label: { id: 'Kesebangunan', en: 'Similarity' }, m: [1.2 * r45, -1.2 * r45, 1.2 * r45, 1.2 * r45], c: [0.5, 0] },
  { id: 'shear', label: { id: 'Geseran (shear)', en: 'Shear' }, m: [1, 1, 0, 1], c: [0, 0] },
  { id: 'aff', label: { id: 'Afin umum', en: 'General affine' }, m: [2, 1, 0.5, 1.5], c: [1, -0.5] },
  { id: 'sing', label: { id: 'Singular (det = 0)', en: 'Singular (det = 0)' }, m: [1, 2, 0.5, 1], c: [0, 0] },
]

const SNAP_RAD = (4 * Math.PI) / 180

export function TransformLab() {
  const t = useT()
  const [matrix, setMatrix] = useState<Mat2>(PRESETS[1].m)
  const [trans, setTrans] = useState<Vec2>(PRESETS[1].c)
  const [tt, setT] = useState(1)
  const [testVec, setTestVecRaw] = useState<Vec2>([1.5, 0.5])
  const [snapped, setSnapped] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [showShapes, setShowShapes] = useState(true)
  const raf = useRef(0)

  const eigen = useMemo(() => eigen2(matrix), [matrix])
  const shown = useMemo(() => lerpMat(IDENTITY, matrix, tt), [matrix, tt])
  const shownTrans = useMemo<Vec2>(() => [trans[0] * tt, trans[1] * tt], [trans, tt])

  const setTestVec = useCallback((v: Vec2) => {
    const len = norm2(v)
    let best: number | null = null
    let bestAng = SNAP_RAD
    eigen.vectors.forEach((ev, k) => { const ang = directionAngle(ev, v); if (ang < bestAng) { bestAng = ang; best = k } })
    if (best !== null && len > 0.2) {
      const ev = eigen.vectors[best]
      const sign = Math.sign(ev[0] * v[0] + ev[1] * v[1]) || 1
      setTestVecRaw([ev[0] * len * sign, ev[1] * len * sign])
    } else setTestVecRaw(v)
    setSnapped(best)
  }, [eigen])
  useEffect(() => { setTestVec(testVec) }, [eigen]) // eslint-disable-line react-hooks/exhaustive-deps

  const animate = () => {
    cancelAnimationFrame(raf.current)
    setAnimating(true)
    const start = performance.now()
    const D = 1400
    const tick = (now: number) => {
      const x = Math.min((now - start) / D, 1)
      setT(x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
      if (x < 1) raf.current = requestAnimationFrame(tick)
      else setAnimating(false)
    }
    setT(0)
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const setM = (i: number, v: number) => { const m = [...matrix] as Mat2; m[i] = v; setMatrix(m) }

  return (
    <Layout
      canvas={<MatrixTransformCanvas matrix={shown} translation={shownTrans} eigen={eigen} testVec={testVec} onTestVec={setTestVec} snapped={snapped} showShapes={showShapes} />}
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex="\bar r' = B\bar r + \bar c" /></span>} icon={<SquareFunction size={16} />}>
            <div className="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-1.5">
              <NumInput label="b₁₁" value={matrix[0]} onChange={(v) => setM(0, v)} />
              <NumInput label="b₁₂" value={matrix[1]} onChange={(v) => setM(1, v)} />
              <span className="px-1 text-xs text-slate-500">c</span>
              <NumInput label="c₁" value={trans[0]} onChange={(v) => setTrans([v, trans[1]])} />
              <NumInput label="b₂₁" value={matrix[2]} onChange={(v) => setM(2, v)} />
              <NumInput label="b₂₂" value={matrix[3]} onChange={(v) => setM(3, v)} />
              <span />
              <NumInput label="c₂" value={trans[1]} onChange={(v) => setTrans([trans[0], v])} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => <Chip key={p.id} onClick={() => { setMatrix(p.m); setTrans(p.c) }}>{t(p.label.id, p.label.en)}</Chip>)}
            </div>
          </MathCard>
          <MathCard title={t('Animasi', 'Animation')}>
            <div className="space-y-3">
              <Slider label={<Tex tex="t:\; (1-t)I + tB,\; t\bar c" />} value={tt} min={0} max={1} step={0.001} onChange={setT} format={(x) => x.toFixed(2)} />
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={animate} disabled={animating} className="flex items-center justify-center gap-2 rounded-md border border-accent/50 bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/25 disabled:opacity-50"><Play size={13} /> {t('Animasikan', 'Animate')}</button>
                <button type="button" onClick={() => setT(0)} className="flex items-center justify-center gap-2 rounded-md border border-border bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white"><RotateCcw size={13} /> {t('Ulang', 'Rewind')}</button>
              </div>
              <Toggle label={t('Lingkaran satuan & bendera', 'Unit circle & flag')} checked={showShapes} onChange={setShowShapes} />
            </div>
          </MathCard>
          <EigenTracker matrix={matrix} eigen={eigen} testVec={testVec} snapped={snapped} />
        </div>
      }
      theory={<TransformTheory matrix={matrix} trans={trans} eigen={eigen} />}
    />
  )
}

function TransformTheory({ matrix, trans, eigen }: { matrix: Mat2; trans: Vec2; eigen: Eigen2 }) {
  const t = useT()
  const [a, b, c, d] = matrix
  const det = det2(matrix)
  const tr = trace2(matrix)
  const svd = useMemo(() => svd2(matrix), [matrix])
  // BᵀB
  const g11 = a * a + c * c, g12 = a * b + c * d, g22 = b * b + d * d
  const orthogonal = Math.abs(g11 - 1) < 1e-6 && Math.abs(g22 - 1) < 1e-6 && Math.abs(g12) < 1e-6
  const similarity = !orthogonal && Math.abs(g11 - g22) < 1e-6 && Math.abs(g12) < 1e-6 && g11 > 1e-9
  const kScale = Math.sqrt(g11)
  // fixed points: (B − I) x = −c
  const M: Mat2 = [a - 1, b, c, d - 1]
  const dM = det2(M)
  const fixed: Vec2 | null = Math.abs(dM) > 1e-9 ? [(-trans[0] * M[3] + M[1] * trans[1]) / dM, (-M[0] * trans[1] + M[2] * trans[0]) / dM] : null
  const kind = orthogonal
    ? det > 0
      ? t('rotasi (ortogonal langsung, det B = +1)', 'rotation (direct orthogonal, det B = +1)')
      : t('simetri / pencerminan geser (ortogonal tak langsung, det B = −1)', 'reflection / glide reflection (indirect orthogonal, det B = −1)')
    : similarity
      ? t(`kesebangunan dengan rasio k = ${fmt(kScale, 3)} (B = kQ, Q ortogonal)`, `similarity of ratio k = ${fmt(kScale, 3)} (B = kQ, Q orthogonal)`)
      : Math.abs(det) < 1e-9
        ? t('BUKAN transformasi afin: det B = 0, tidak bijektif (bidang runtuh ke garis)', 'NOT an affine transformation: det B = 0, not bijective (the plane collapses onto a line)')
        : t('transformasi afin umum (det B ≠ 0)', 'general affine transformation (det B ≠ 0)')
  const rotAngle = orthogonal && det > 0 ? (Math.atan2(c, a) * 180) / Math.PI : null

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded-xl border border-border bg-card/80 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('Determinan', 'Determinant')} tex={`\\det B = ${fmt(det)}`} warn={det < 0} />
        <Stat label={t('Teras (trace)', 'Trace')} tex={`\\operatorname{tr} B = ${fmt(tr)}`} />
        <Stat label={t('Polinom karakteristik', 'Characteristic polynomial')} tex={`${charPolyTex(matrix)}`} />
        <Stat label={t('Nilai eigen', 'Eigenvalues')} tex={eigenvaluesTex(eigen)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <MathCard title={t('Jenis transformasi', 'Kind of transformation')} icon={<Sigma size={16} />}>
          <p className="text-sm text-slate-200"><span className="font-semibold text-amber-300">{kind}</span></p>
          <FormulaBlock tex={`B^tB = \\begin{pmatrix} ${fmt(g11, 3)} & ${fmt(g12, 3)} \\\\ ${fmt(g12, 3)} & ${fmt(g22, 3)} \\end{pmatrix}`} />
          {rotAngle !== null && <FormulaBlock tex={`\\theta = ${fmt(rotAngle, 1)}^\\circ`} />}
          <FormulaBlock tex={fixed ? `\\text{${t('titik tetap', 'fixed point')}}: (B - I)\\xi = -c \\Rightarrow \\xi = (${fmt(fixed[0], 3)}, ${fmt(fixed[1], 3)})` : `\\det(B - I) = 0:\\ ${t('\\text{tidak ada titik tetap tunggal}', '\\text{no unique fixed point}')}`} />
          <p className="text-xs leading-relaxed text-slate-400">
            {t(<>Transformasi afin (Vaisman 4.2): bijeksi <Tex tex="\bar r' = B\bar r + \bar c" /> dengan <Tex tex="\det B \neq 0" />; mengawetkan garis, kesejajaran, dan perbandingan ruas segaris, mengalikan luas dengan <Tex tex="|\det B|" />. Transformasi ortogonal (4.3): <Tex tex="B^tB = I" />, mengawetkan jarak dan sudut; setiap transformasi ortogonal bidang adalah komposisi paling banyak tiga simetri (pencerminan).</>,
               <>Affine transformation (Vaisman 4.2): a bijection <Tex tex="\bar r' = B\bar r + \bar c" /> with <Tex tex="\det B \neq 0" />; it preserves lines, parallelism and ratios of collinear segments, and multiplies areas by <Tex tex="|\det B|" />. Orthogonal transformation (4.3): <Tex tex="B^tB = I" />, preserves distances and angles; every orthogonal transformation of the plane is a composition of at most three symmetries (reflections).</>)}
          </p>
        </MathCard>

        <MathCard title={t('Determinan & orientasi', 'Determinant & orientation')} icon={<BookOpen size={16} />}>
          <FormulaBlock tex={`\\det B = b_{11}b_{22} - b_{12}b_{21} = ${fmt(a)}\\cdot${fmt(d)} - ${fmt(b)}\\cdot${fmt(c)} = ${fmt(det)}`} />
          <p className="text-xs leading-relaxed text-slate-400">
            {t(<>Jajar genjang yang direntang oleh <Tex tex="B\hat\imath, B\hat\jmath" /> berluas bertanda <Tex tex="\det B" />. Tanda negatif (merah) berarti orientasi terbalik: bendera oranye menjadi bayangan cerminnya. Transformasi ortogonal dengan <Tex tex="\det B = +1" /> disebut langsung (rotasi), dengan <Tex tex="-1" /> tak langsung (simetri terhadap garis).</>,
               <>The parallelogram spanned by <Tex tex="B\hat\imath, B\hat\jmath" /> has signed area <Tex tex="\det B" />. A negative sign (red) means orientation is reversed: the orange flag becomes its mirror image. Orthogonal transformations with <Tex tex="\det B = +1" /> are direct (rotations), with <Tex tex="-1" /> indirect (line symmetries).</>)}
          </p>
          <FormulaBlock tex={`\\operatorname{tr} B = \\lambda_1 + \\lambda_2,\\qquad \\det B = \\lambda_1\\lambda_2`} />
        </MathCard>

        <MathCard title={t('Bayangan lingkaran satuan (SVD)', 'Image of the unit circle (SVD)')} icon={<BookOpen size={16} />}>
          <FormulaBlock tex={`B = U\\,\\Sigma\\,V^t,\\quad \\sigma_1 = ${fmt(svd.sigma[0], 3)},\\; \\sigma_2 = ${fmt(svd.sigma[1], 3)}`} />
          <p className="text-xs leading-relaxed text-slate-400">
            {t(<>Lingkaran satuan dipetakan ke elips (merah muda) dengan setengah sumbu <Tex tex="\sigma_1, \sigma_2" /> (nilai singular <Tex tex="B" />), dan <Tex tex="\sigma_1\sigma_2 = |\det B|" />. Untuk transformasi ortogonal <Tex tex="\sigma_1 = \sigma_2 = 1" />: lingkaran tetap lingkaran; untuk kesebangunan <Tex tex="\sigma_1 = \sigma_2 = k" />. Arah <Tex tex="V" /> membentuk sudut <Tex tex={`${fmt((svd.thetaV * 180) / Math.PI, 1)}^\\circ`} />.</>,
               <>The unit circle maps to an ellipse (pink) with semi-axes <Tex tex="\sigma_1, \sigma_2" /> (singular values of <Tex tex="B" />), and <Tex tex="\sigma_1\sigma_2 = |\det B|" />. For an orthogonal transformation <Tex tex="\sigma_1 = \sigma_2 = 1" />: circles stay circles; for a similarity <Tex tex="\sigma_1 = \sigma_2 = k" />. The <Tex tex="V" /> direction makes an angle of <Tex tex={`${fmt((svd.thetaV * 180) / Math.PI, 1)}^\\circ`} />.</>)}
          </p>
          <FormulaBlock tex={`\\lambda^2 ${signed(-tr)}\\lambda ${signed(det)} = 0 \\Rightarrow ${eigenvaluesTex(eigen)}`} />
        </MathCard>
      </div>
    </div>
  )
}

function Stat({ label, tex, warn }: { label: string; tex: string; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-slate-900/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <Tex tex={tex} className={warn ? 'text-rose-300' : undefined} />
    </div>
  )
}
