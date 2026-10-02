import { Arrow, C, Clip, Dot, T, pl, type P } from '../stories/kit'
import { ROW_COLORS, type Mark, type Row } from '../../lib/complex-studio'
import type { Complex } from '../../lib/complex-math'

const W = 480, H = 360


/** Bounding box of everything drawable; the origin is always included. */
function fit(rows: Row[]): { cx: number; cy: number; u: number } {
  let x0 = 0, x1 = 0, y0 = 0, y1 = 0
  const add = (x: number, y: number) => { if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) < 1e3 && Math.abs(y) < 1e3) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) } }
  for (const r of rows) for (const m of r.marks) {
    if (m.kind === 'point') add(m.z.re, m.z.im)
    else if (m.kind === 'circle') { add(m.c.re - m.r, m.c.im - m.r); add(m.c.re + m.r, m.c.im + m.r) }
    else if (m.kind === 'poly' && !m.infinite) m.pts.forEach((p) => add(p.re, p.im))
    else if (m.kind === 'region') { add(m.box[0], m.box[1]); add(m.box[2], m.box[3]) }
  }
  const dx = Math.max(2, x1 - x0), dy = Math.max(2, y1 - y0)
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, u: Math.min((W - 40) / (dx * 1.2), (H - 40) / (dy * 1.2)) }
}
const niceStep = (span: number) => { const raw = span / 8, p = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 5, 10].map((k) => k * p).find((s) => s >= raw)! }
const fmt = (v: number) => String(+v.toFixed(6))

function MarkView({ m, color, map, unit, view, k }: { m: Mark; color: string; map: (z: Complex) => P; unit: number; view: { x0: number; x1: number; y0: number; y1: number }; k: string }) {
  if (m.kind === 'circle') {
    const c = map(m.c), r = m.r * unit, a = map({ re: m.c.re + m.r * Math.SQRT1_2, im: m.c.im + m.r * Math.SQRT1_2 })
    return <g>
      <circle cx={c[0]} cy={c[1]} r={r} fill="none" stroke={color} strokeWidth={m.dashed ? 1.5 : 2.5} strokeDasharray={m.dashed ? '6 5' : undefined} />
      {m.arrow && <Arrow from={[a[0] + 9, a[1] - 9]} to={[a[0] - 1, a[1] - 1]} color={color} width={2.5} head={9} />}
    </g>
  }
  if (m.kind === 'poly') {
    const pts = m.pts.map(map), all = m.closed ? [...pts, pts[0]] : pts
    return <g>
      <path d={pl(all)} fill="none" stroke={color} strokeWidth={m.dashed ? 1.5 : 2.5} strokeDasharray={m.dashed ? '6 5' : undefined} strokeLinejoin="round" />
      {m.arrow && all.slice(1).map((q, i) => { const p = all[i], mid: P = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1, d: P = [(q[0] - p[0]) / len, (q[1] - p[1]) / len]; return <Arrow key={i} from={[mid[0] - 8 * d[0], mid[1] - 8 * d[1]]} to={[mid[0] + 4 * d[0], mid[1] + 4 * d[1]]} color={color} width={2.5} head={9} /> })}
    </g>
  }
  if (m.kind === 'region') {
    const n = 90, ny = Math.round((n * H) / W), sx = (view.x1 - view.x0) / n, sy = (view.y1 - view.y0) / ny
    let d = ''
    for (let i = 0; i < n; i++) for (let j = 0; j < ny; j++) {
      const z = { re: view.x0 + (i + 0.5) * sx, im: view.y1 - (j + 0.5) * sy }
      let inside = false
      try { inside = m.test(z) } catch { inside = false }
      if (inside) d += `M${(i * W) / n},${(j * H) / ny}h${W / n + 0.4}v${H / ny + 0.4}h${-(W / n + 0.4)}z`
    }
    return <path d={d} fill={color} opacity={0.2} />
  }
  const p = map(m.z)
  if (Math.abs(p[0]) > 4 * W || Math.abs(p[1]) > 4 * H) return null
  const label = m.label && <T x={p[0] + 9} y={p[1] - 9} anchor="start" size={13} color={m.tone === 'pole' ? C.r : color} weight={600}>{m.label}</T>
  if (m.tone === 'pole' || m.tone === 'essential') return <g key={k}>
    <path d={`M${p[0] - 6},${p[1] - 6} L${p[0] + 6},${p[1] + 6} M${p[0] - 6},${p[1] + 6} L${p[0] + 6},${p[1] - 6}`} stroke={m.tone === 'pole' ? C.r : C.v} strokeWidth={2.8} strokeLinecap="round" />
    {m.tone === 'essential' && <circle cx={p[0]} cy={p[1]} r={9} fill="none" stroke={C.v} strokeWidth={2} />}
    {label}
  </g>
  const origin = map({ re: 0, im: 0 })
  return <g>
    {m.vector && Math.hypot(p[0] - origin[0], p[1] - origin[1]) > 14 && <Arrow from={origin} to={p} color={color} width={2} head={8} />}
    {m.tone === 'branch' ? <rect x={p[0] - 5} y={p[1] - 5} width={10} height={10} fill={C.bg} stroke={C.y} strokeWidth={2.5} />
      : <Dot at={p} color={m.tone === 'removable' ? C.g : color} r={m.tone === 'root' ? 5 : 6} hollow={m.tone === 'zero' || m.tone === 'removable'} />}
    {label}
  </g>
}

/** Argand plane in the picture-story style: faint grid, labelled points with halos, paths with direction arrows. */
export function ArgandPlane({ rows, focus }: { rows: Row[]; focus: string | null }) {
  const live = rows.filter((r) => !r.error && r.marks.length)
  const { cx, cy, u } = fit(live)
  const map = (z: Complex): P => [W / 2 + (z.re - cx) * u, H / 2 - (z.im - cy) * u]
  const view = { x0: cx - W / 2 / u, x1: cx + W / 2 / u, y0: cy - H / 2 / u, y1: cy + H / 2 / u }
  const step = niceStep(view.x1 - view.x0), lines: number[][] = [[], []]
  for (let v = Math.ceil(view.x0 / step) * step; v <= view.x1; v += step) lines[0].push(v)
  for (let v = Math.ceil(view.y0 / step) * step; v <= view.y1; v += step) lines[1].push(v)
  const o = map({ re: 0, im: 0 }), ax = Math.min(H - 8, Math.max(14, o[1] + 15)), ay = Math.min(W - 30, Math.max(6, o[0] + 5))
  return <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Argand plane">
    <rect width={W} height={H} fill={C.bg} />
    <Clip id="argand" x={0} y={0} w={W} h={H}>
      {lines[0].map((v) => <path key={`x${v}`} d={`M${map({ re: v, im: 0 })[0]},0 V${H}`} stroke={C.faint} />)}
      {lines[1].map((v) => <path key={`y${v}`} d={`M0,${map({ re: 0, im: v })[1]} H${W}`} stroke={C.faint} />)}
      <path d={`M0,${o[1]} H${W} M${o[0]},0 V${H}`} stroke={C.ln} strokeWidth={1.4} />
      {lines[0].filter((v) => Math.abs(v) > 1e-9).map((v) => <T key={`lx${v}`} x={map({ re: v, im: 0 })[0]} y={ax} size={10} color={C.mu}>{fmt(v)}</T>)}
      {lines[1].filter((v) => Math.abs(v) > 1e-9).map((v) => <T key={`ly${v}`} x={ay} y={map({ re: 0, im: v })[1] + 4} size={10} color={C.mu} anchor="start">{`${fmt(v)}i`}</T>)}
      <T x={W - 8} y={Math.min(H - 8, Math.max(14, o[1] - 8))} size={12} color={C.mu} anchor="end">Re</T>
      <T x={Math.min(W - 8, Math.max(8, o[0] + 8))} y={14} size={12} color={C.mu} anchor="start">Im</T>
      {[...live].sort((a, b) => (a.entry.id === focus ? 1 : 0) - (b.entry.id === focus ? 1 : 0)).map((r) => {
        const color = ROW_COLORS[rows.indexOf(r) % ROW_COLORS.length]
        return <g key={r.entry.id} style={{ opacity: focus && focus !== r.entry.id ? 0.28 : 1, transition: 'opacity .3s ease' }}>
          {r.marks.map((m, i) => <MarkView key={i} k={String(i)} m={m} color={color} map={map} unit={u} view={view} />)}
        </g>
      })}
    </Clip>
  </svg>
}
