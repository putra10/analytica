import { Compass } from 'lucide-react'
import { apply, directionAngle, norm2, type Eigen2, type Mat2, type Vec2 } from '../../lib/matrix-math'
import { useT } from '../../lib/i18n'
import { fmt } from '../../lib/utils'
import { MathCard } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

interface Props {
  matrix: Mat2
  eigen: Eigen2
  testVec: Vec2
  snapped: number | null
}

const vecTex = (v: Vec2) => `\\begin{pmatrix} ${fmt(v[0])} \\\\ ${fmt(v[1])} \\end{pmatrix}`
const deg = (rad: number) => `${((rad * 180) / Math.PI).toFixed(1)}°`

/** Invariant directions of the linear part B: eigenvectors. */
export function EigenTracker({ matrix, eigen, testVec, snapped }: Props) {
  const t = useT()
  const tv = apply(matrix, testVec)
  const vn = norm2(testVec)
  const tvn = norm2(tv)
  const stretch = vn > 1e-9 ? tvn / vn : 0
  const rot = vn > 1e-9 && tvn > 1e-9 ? Math.acos(Math.min(1, (testVec[0] * tv[0] + testVec[1] * tv[1]) / (vn * tvn))) : null
  const closest = eigen.vectors.length ? Math.min(...eigen.vectors.map((ev) => directionAngle(ev, testVec))) : null

  return (
    <MathCard title={t('Arah invarian (vektor eigen)', 'Invariant directions (eigenvectors)')} icon={<Compass size={16} />}>
      <div className="space-y-2">
        <FormulaBlock tex={`\\vec v = ${vecTex(testVec)},\\qquad B\\vec v = ${vecTex(tv)}`} />
        {snapped !== null ? (
          <div className="rounded-md border border-yellow-400/40 bg-yellow-400/10 p-2">
            <FormulaBlock tex={`B\\vec v = \\lambda \\vec v,\\quad \\lambda = ${fmt(eigen.values[snapped])}`} />
            <p className="text-xs text-yellow-200">{t('Terkunci pada arah eigen: garis melalui titik asal dengan arah ini dipetakan ke dirinya sendiri.', 'Locked on an eigen-direction: the line through the origin in this direction is mapped onto itself.')}</p>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-slate-400">
            {t('Regangan', 'Stretch')} <Tex tex="|B\vec v| / |\vec v|" /> = <span className="font-mono text-slate-200">{stretch.toFixed(3)}</span>, {t('rotasi', 'rotation')}{' '}
            <span className="font-mono text-slate-200">{rot === null ? '-' : deg(rot)}</span>
            {closest !== null && <>, {t('arah eigen terdekat', 'nearest eigen-direction')} <span className="font-mono text-slate-200">{deg(closest)}</span> {t('lagi', 'away')}</>}.
          </p>
        )}
        <div className="border-t border-border pt-2">
          {eigen.real ? (
            eigen.vectors.map((ev, k) => (
              <FormulaBlock key={k} tex={`\\lambda_{${k + 1}} = ${fmt(eigen.values[k])},\\quad \\vec e_{${k + 1}} = ${vecTex(ev)}`} />
            ))
          ) : (
            <p className="text-xs text-slate-400">
              {t('Nilai eigen kompleks (', 'Complex eigenvalues (')}<Tex tex={`${fmt(eigen.values[0])} \\pm ${fmt(eigen.imag)}i`} />): {t('setiap vektor berputar, tidak ada arah real yang invarian.', 'every vector rotates; no real direction is invariant.')}
            </p>
          )}
          {eigen.real && eigen.vectors.length === 1 && (
            <p className="text-xs text-slate-400">{t('Nilai eigen berulang dengan satu arah eigen saja (geseran/shear).', 'Repeated eigenvalue with a single eigen-direction (shear-like).')}</p>
          )}
        </div>
        <p className="text-[11px] text-slate-500">{t('Seret pegangan biru; ia terkunci saat sejajar dengan vektor eigen.', 'Drag the blue handle; it snaps when aligned with an eigenvector.')}</p>
      </div>
    </MathCard>
  )
}
