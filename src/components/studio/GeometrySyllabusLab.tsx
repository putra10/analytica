import { DiagramViewport } from '../ui/DiagramViewport'
import { useLang } from '../../lib/i18n'
import type { ReactNode as DiagramNode } from 'react'
import { useMemo, useState } from 'react'
import type { VisualKind } from '../../content/summary-lessons'
import { geometryExperiment, observeGeometry } from '../../lib/geometry-syllabus'
import { useT } from '../../lib/i18n'

export function GeometrySyllabusLab({ kind }: { kind: VisualKind }) {
  return <GeometryExperimentPanel key={kind} kind={kind} />
}

function GeometryExperimentPanel({ kind }: { kind: VisualKind }) {
  const t = useT(), config = useMemo(() => geometryExperiment(kind), [kind])
  const defaults = () => Object.fromEntries(config.fields.map(field => [field.key, field.value]))
  const [input, setInput] = useState(defaults)
  const result = useMemo(() => observeGeometry(kind, input), [kind, input])
  const projected = (p: number[]) => [p[0] - .55 * p[1], .35 * p[0] + .3 * p[1] + p[2]]
  const values = [...result.points.map(point => projected(point.p)), ...result.paths.flatMap(path => path.points.map(projected)), [0, 0]]
  const minX = Math.min(...values.map(p => p[0])), maxX = Math.max(...values.map(p => p[0])), minY = Math.min(...values.map(p => p[1])), maxY = Math.max(...values.map(p => p[1]))
  const range = Math.max(maxX - minX, (maxY - minY) * 1.6, 3), scale = 440 / range, centerX = (maxX + minX) / 2, centerY = (maxY + minY) / 2
  const xy = (p: number[]) => { const [x, y] = projected(p); return [280 + scale * (x - centerX), 163 - scale * (y - centerY)] }
  const pathData = (points: number[][]) => points.map((p, i) => { const [x, y] = xy(p); return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}` }).join(' ')
  return <section className="min-w-0 space-y-4 rounded-xl border p-4" data-geometry-syllabus={kind} data-syllabus-experiment={kind}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">{t(config.title.id, config.title.en)}</h3><button className="rounded-md border px-3 py-1 text-sm" onClick={() => setInput(defaults())}>{t('Atur ulang contoh', 'Reset example')}</button></div>
    <p className="text-sm leading-relaxed text-[var(--muted)]">{t(config.note.id, config.note.en)}</p>
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">{config.fields.map(field => <label key={field.key} className="min-w-0 space-y-1 text-sm"><span className="block">{t(field.label.id, field.label.en)}</span>{field.multiline ? <textarea className="block w-full min-w-0 rounded-md border bg-[var(--surface)] p-2 font-mono" rows={3} value={input[field.key]} spellCheck={false} maxLength={300} onChange={event => setInput(prev => ({ ...prev, [field.key]: event.target.value }))} /> : <input className="block w-full min-w-0 rounded-md border bg-[var(--surface)] p-2 font-mono" value={input[field.key]} spellCheck={false} maxLength={180} onChange={event => setInput(prev => ({ ...prev, [field.key]: event.target.value }))} />}</label>)}</div>
    {result.error ? <p role="alert" className="text-sm text-[var(--danger)]">{t(result.error.id, result.error.en)}</p> : <>
      <LabDiagram><svg className="block h-auto w-full rounded-lg border bg-[var(--surface)]" viewBox="0 0 560 340" role="img" aria-label={t('Proyeksi geometri dari masukan yang dapat diedit', 'Geometry projection from editable inputs')}>
        <text x={280} y={23} fill="var(--muted)" textAnchor="middle" fontSize={12}>{t('Proyeksi sejajar ℝ³; ukuran/sudut gambar dapat berubah', 'Parallel projection of ℝ³; picture lengths/angles can change')}</text>
        {result.paths.map((path, i) => <path key={i} d={pathData(path.points)} fill="none" stroke={path.color ?? 'var(--accent)'} strokeWidth={path.color === 'var(--border-strong)' ? 1 : 2} strokeDasharray={path.dashed ? '5 4' : undefined} opacity={path.color === 'var(--border-strong)' ? .7 : .9} />)}
        {result.points.map((point, i) => { const [x, y] = xy(point.p), color = point.color ?? ['var(--warn)', 'var(--accent)', 'var(--success)', 'var(--violet)'][i % 4]; return <g key={point.name}><circle cx={x} cy={y} r={4.5} fill={color} /><text x={Math.min(510, Math.max(45, x + 7))} y={Math.min(303, Math.max(45, y - 8))} fontSize={12} fill={color}>{point.name}</text></g> })}
        <text x={280} y={326} textAnchor="middle" fontSize={12} fill="var(--muted)">{t('Masukan dihitung ulang langsung; nilai ruang ada di bawah', 'Inputs recompute live; spatial values appear below')}</text>
      </svg></LabDiagram>
      <div aria-live="polite" aria-label={t('Hasil perhitungan geometri', 'Geometry calculation results')} className="space-y-2 rounded-lg bg-[var(--surface)] p-3">{result.lines.map((line, i) => <p key={i} className="break-words text-sm leading-relaxed">{t(line.id, line.en)}</p>)}</div>
    </>}
    <p className="text-xs leading-relaxed text-[var(--muted)]">{t('Perhitungan memakai aritmetika desimal dan toleransi numerik. Gunakan langkah pembuktian untuk klaim umum; contoh yang cocok belum membuktikan teorema.', 'Calculations use decimal arithmetic and numerical tolerances. Use the proof steps for general claims; matching examples do not prove a theorem.')}</p>
  </section>
}

function LabDiagram({children}:{children:DiagramNode}){const {lang}=useLang();return <DiagramViewport lang={lang}>{children}</DiagramViewport>}
