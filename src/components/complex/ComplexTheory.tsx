import { useMemo } from 'react'
import { BookOpen, Crosshair, Target, CircleDashed } from 'lucide-react'
import {
  toTex, cauchyRiemann, contourIntegral, inside, onContour, abs, scale, C,
  type Complex, type Contour, type Singularity, type Preset,
} from '../../lib/complex-math'
import { useT, useLang } from '../../lib/i18n'
import { fmt } from '../../lib/utils'
import { MathCard } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

interface Props {
  p: Preset
  c: Complex
  hover: Complex | null
  contour?: Contour
}

const setTex = (zs: Complex[]) => (zs.length ? `\\{\\, ${zs.map((z) => toTex(z)).join(',\\; ')} \\,\\}` : '\\varnothing')

export function ComplexTheory({ p, c, hover, contour }: Props) {
  const t = useT()
  const { lang } = useLang()
  const f = (z: Complex) => p.f(z, c)
  const roots = p.roots(c)
  const sings = p.singularities(c)
  const fz = hover ? f(hover) : null
  const cr = hover ? cauchyRiemann(f, hover) : null

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {contour ? <SingularityCard sings={sings} contour={contour} /> : (
        <MathCard title={t('Nol fungsi', 'Zeros')} icon={<Target size={16} />}>
          {p.rootsTex && <FormulaBlock tex={p.rootsTex} />}
          <FormulaBlock tex={`f(z) = 0 \\iff z \\in ${setTex(roots)}`} />
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.note[lang]}</p>
        </MathCard>
      )}

      {contour ? <ContourCard f={f} sings={sings} contour={contour} note={p.note[lang]} /> : (
        <MathCard title={t('Kursor & Cauchy-Riemann', 'Cursor & Cauchy-Riemann')} icon={<Crosshair size={16} />}>
          {hover && fz && cr ? (
            <div className="space-y-1">
              <FormulaBlock tex={`z = ${toTex(hover, 3)},\\quad f(z) = ${toTex(fz, 3)}`} />
              <FormulaBlock tex={`|f(z)| = ${abs(fz).toPrecision(4)},\\quad \\arg f(z) = ${Math.atan2(fz.im, fz.re).toFixed(3)}`} />
              <FormulaBlock tex={`u_x = ${fmt(cr.ux, 3)},\\; v_y = ${fmt(cr.vy, 3)},\\qquad u_y = ${fmt(cr.uy, 3)},\\; v_x = ${fmt(cr.vx, 3)}`} />
              {cr.violation < 1e-3 ? (
                <p className="text-xs text-emerald-300">
                  {t('Persamaan Cauchy-Riemann terpenuhi: ', 'Cauchy-Riemann equations hold: ')}
                  <Tex tex={`f'(z) = u_x + i v_x = ${toTex(cr.derivative, 3)}`} />
                  {Math.abs(cr.laplaceU) < 1e-2 && <>{t(', u harmonik (', ', u is harmonic (')}<Tex tex="u_{xx} + u_{yy} = 0" />)</>}
                </p>
              ) : (
                <p className="text-xs text-rose-300">
                  {t('Cauchy-Riemann GAGAL di titik ini: ', 'Cauchy-Riemann FAILS here: ')}
                  <Tex tex="u_x \neq v_y \text{ atau } u_y \neq -v_x" />. {t('f tidak mempunyai turunan di z.', 'f is not differentiable at z.')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('Gerakkan kursor di atas bidang.', 'Move the cursor over the plane.')}</p>
          )}
        </MathCard>
      )}

      <MathCard title={t('Cara membaca gambar', 'How to read the picture')} icon={<BookOpen size={16} />}>
        <div className="space-y-2 text-xs leading-relaxed text-slate-400">
          {t(
            <>
              <p>
                Setiap piksel adalah titik <Tex tex="z = x + iy" />. Warnanya menyandikan <Tex tex="w = f(z)" />: rona (hue) adalah argumen{' '}
                <Tex tex="\arg w \in (-\pi, \pi]" /> (merah = real positif, sian = real negatif) dan kecerahan mengikuti modulus{' '}
                <Tex tex="|w|" />, dengan lompatan kecerahan pada setiap <Tex tex="|w| = 2^k" />.
              </p>
              <p>
                Nol tampak gelap (semua warna bertemu); kutub tampak putih. Mengelilingi nol berorde <Tex tex="n" /> sekali membuat rona berputar{' '}
                <Tex tex="n" /> kali (prinsip argumen).
              </p>
              <p>
                Garis kisi adalah prapeta dari <Tex tex="\operatorname{Re} w \in \mathbb{Z}" /> dan <Tex tex="\operatorname{Im} w \in \mathbb{Z}" />.
                Fungsi analitik bersifat konformal di mana <Tex tex="f'(z) \neq 0" />: kisi yang terdeformasi tetap berpotongan tegak lurus.
                Sudut hanya rusak di titik kritis, dan pada fungsi tak analitik (<Tex tex="\bar z" />, <Tex tex="|z|^2" />) kekonformalan hilang sama sekali.
              </p>
            </>,
            <>
              <p>
                Each pixel is a point <Tex tex="z = x + iy" />. Its colour encodes <Tex tex="w = f(z)" />: the hue is the argument{' '}
                <Tex tex="\arg w \in (-\pi, \pi]" /> (red = positive real, cyan = negative real) and the brightness follows the modulus{' '}
                <Tex tex="|w|" />, with a brightness step at every <Tex tex="|w| = 2^k" />.
              </p>
              <p>
                Zeros are dark (all hues meet); poles are white. Walking once around a zero of order <Tex tex="n" /> cycles the hue{' '}
                <Tex tex="n" /> times (the argument principle).
              </p>
              <p>
                The grid lines are preimages of <Tex tex="\operatorname{Re} w \in \mathbb{Z}" /> and <Tex tex="\operatorname{Im} w \in \mathbb{Z}" />.
                An analytic function is conformal wherever <Tex tex="f'(z) \neq 0" />: the deformed grid still meets at right angles. Angles break only at
                critical points, and for non-analytic maps (<Tex tex="\bar z" />, <Tex tex="|z|^2" />) conformality is lost entirely.
              </p>
            </>,
          )}
        </div>
      </MathCard>
    </div>
  )
}

const TYPE_LABEL = {
  pole: { id: 'kutub', en: 'pole' },
  essential: { id: 'singular esensial', en: 'essential' },
  removable: { id: 'dapat dihapuskan', en: 'removable' },
  branch: { id: 'titik cabang (tidak terisolasi)', en: 'branch point (not isolated)' },
  user: { id: 'titik singular (residu numerik)', en: 'singular point (numeric residue)' },
} as const

function SingularityCard({ sings, contour }: { sings: Singularity[]; contour: Contour }) {
  const t = useT()
  const { lang } = useLang()
  return (
    <MathCard title={t('Titik singular terisolasi', 'Isolated singular points')} icon={<Target size={16} />}>
      {sings.length === 0 ? (
        <p className="text-sm text-slate-400">{t('Fungsi entire: tidak ada titik singular di bidang berhingga.', 'Entire function: no singular points in the finite plane.')}</p>
      ) : (
        <ul className="space-y-1.5">
          {sings.map((s, i) => {
            const isIn = inside(s, contour)
            return (
              <li key={i} className={`rounded-md border px-2 py-1.5 text-xs ${isIn ? 'border-yellow-400/40 bg-yellow-400/10' : 'border-border'}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <Tex tex={`z_0 = ${toTex(s.z)}`} />
                  <span className="text-slate-400">{TYPE_LABEL[s.type][lang]}{s.type === 'pole' && s.order ? ` ${t('orde', 'of order')} ${s.order}` : ''}</span>
                  {s.res && <Tex tex={`\\operatorname{Res}_{z_0} f = ${toTex(s.res)}`} />}
                  {isIn && <span className="ml-auto text-yellow-300">{t('di dalam C', 'inside C')}</span>}
                </div>
                {s.principal && s.principal !== '0' && (
                  <div className="mt-0.5 text-slate-400">{t('Bagian utama: ', 'Principal part: ')}<Tex tex={s.principal} /></div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        {t(
          <>Laurent di sekitar <Tex tex="z_0" />: <Tex tex="f(z) = \sum_{n=0}^\infty a_n (z-z_0)^n + \sum_{n=1}^\infty \frac{b_n}{(z-z_0)^n}" />. Tidak ada <Tex tex="b_n" />: dapat dihapuskan; berhingga banyak (sampai <Tex tex="b_m \neq 0" />): kutub orde <Tex tex="m" />; tak hingga banyak: esensial. <Tex tex="\operatorname{Res} = b_1" />.</>,
          <>Laurent series about <Tex tex="z_0" />: <Tex tex="f(z) = \sum_{n=0}^\infty a_n (z-z_0)^n + \sum_{n=1}^\infty \frac{b_n}{(z-z_0)^n}" />. No <Tex tex="b_n" />: removable; finitely many (up to <Tex tex="b_m \neq 0" />): pole of order <Tex tex="m" />; infinitely many: essential. <Tex tex="\operatorname{Res} = b_1" />.</>,
        )}
      </p>
    </MathCard>
  )
}

function ContourCard({ f, sings, contour, note }: { f: (z: Complex) => Complex; sings: Singularity[]; contour: Contour; note: string }) {
  const t = useT()
  const numeric = useMemo(() => contourIntegral(f, contour), [f, contour])
  const enclosed = sings.filter((s) => inside(s, contour))
  const touching = sings.some((s) => onContour(s, contour))
  const branchInside = enclosed.some((s) => s.type === 'branch')
  const resSum = enclosed.reduce((acc, s) => (s.res ? { re: acc.re + s.res.re, im: acc.im + s.res.im } : acc), C(0))
  const predicted = scale(C(-resSum.im, resSum.re), 2 * Math.PI) // 2πi · Σ Res

  return (
    <MathCard title={t('Integral kontur', 'Contour integral')} icon={<CircleDashed size={16} />}>
      <FormulaBlock tex={`\\oint_C f(z)\\,dz \\approx ${toTex(numeric, 3)}`} />
      {touching ? (
        <p className="text-xs text-rose-300">{t('Kontur melewati titik singular: integral tidak terdefinisi. Geser z₀ atau ubah r.', 'The contour passes through a singular point: the integral is undefined. Move z₀ or change r.')}</p>
      ) : branchInside ? (
        <p className="text-xs text-amber-300">{t('Kontur memotong potongan cabang; f tidak analitik pada C, sehingga teorema residu tidak berlaku (titik cabang bukan singularitas terisolasi).', 'The contour crosses the branch cut; f is not analytic on C, so the residue theorem does not apply (a branch point is not an isolated singularity).')}</p>
      ) : enclosed.length === 0 ? (
        <p className="text-xs text-emerald-300">
          {t('Tidak ada titik singular di dalam C. Teorema Cauchy-Goursat: ', 'No singular points inside C. Cauchy-Goursat theorem: ')}
          <Tex tex="\oint_C f(z)\,dz = 0" />.
        </p>
      ) : (
        <div className="space-y-1">
          <FormulaBlock tex={`2\\pi i \\sum_{k=1}^{${enclosed.length}} \\operatorname{Res}_{z_k} f = 2\\pi i \\cdot (${toTex(resSum, 3)}) = ${toTex(predicted, 3)}`} />
          <p className="text-xs text-slate-400">
            {t('Teorema residu Cauchy: nilai numerik dan 2πi × jumlah residu di dalam C berimpit (selisih ', 'Cauchy residue theorem: the numeric value and 2πi × the residue sum inside C agree (difference ')}
            <span className="font-mono text-slate-200">{abs({ re: numeric.re - predicted.re, im: numeric.im - predicted.im }).toExponential(2)}</span>).
          </p>
        </div>
      )}
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{note}</p>
    </MathCard>
  )
}
