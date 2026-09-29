import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Line, OrbitControls, Html } from '@react-three/drei'
import { DoubleSide, Quaternion, Vector3 } from 'three'
import { calculate, colors, describe, fmt, add, scale, norm, type Entry, type Result, type Shape, type V } from '../lib/studio'
import { useT } from '../lib/i18n'
import './studio.css'

const key = 'analytica-studio-v1'
const rows = (texts: string[]): Entry[] => texts.map(text => ({ id: crypto.randomUUID(), text, visible: true }))
const examples = {
  '2D': ['A = (-2,1)', 'B = (2,3)', 'l = line(A,B)', 'c = circle(A,2)', 'y = sin(x)', 'distance(A,B)', 'area(c)'],
  '3D': ['A = (1,2,3)', 'B = (-2,-1,0)', 'l = line(A,B)', 'p = plane(0,0,1,-1)', 's = sphere((0,0,0),1.5)', 'I = intersect(l,p)', 'distance(A,p)'],
}
function initial(): { entries: Entry[]; mode: '2D' | '3D' } {
  try { const s = JSON.parse(localStorage.getItem(key) ?? 'null'); if (s && ['2D', '3D'].includes(s.mode) && Array.isArray(s.entries) && s.entries.length <= 60 && s.entries.every((r: Entry) => typeof r.id === 'string' && typeof r.text === 'string' && r.text.length <= 500 && typeof r.visible === 'boolean')) return s } catch { /* start with the example when storage is unavailable */ }
  return { entries: rows(examples['2D']), mode: '2D' }
}
class SceneBoundary extends Component<{ children: ReactNode; fallback: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p className="p-8">{this.props.fallback}</p> : this.props.children }
}
function PlaneMesh({ shape, color }: { shape: Extract<Shape, { kind: 'plane' }>; color: string }) {
  const normal = new Vector3(...shape.n).normalize()
  const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal)
  return <mesh position={scale(shape.n, -shape.D / norm(shape.n) ** 2)} quaternion={rotation}><planeGeometry args={[16, 16]} /><meshBasicMaterial color={color} transparent opacity={0.22} side={DoubleSide} depthWrite={false} /></mesh>
}
function Surface({ shape, color }: { shape: Extract<Shape, { kind: 'curve' | 'surface' }>; color: string }) {
  const paths = useMemo(() => {
    const paths: V[][] = []
    if (shape.kind === 'curve') {
      let path: V[] = []
      for (let i = 0; i <= 800; i++) { const t = -20 + i / 20, x = shape.axis === 'x' ? shape.f(0, t) : t, y = shape.axis === 'x' ? t : shape.f(t, 0); if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 25 && Math.abs(y) <= 25 && (!path.length || Math.hypot(x - path[path.length - 1][0], y - path[path.length - 1][1]) < 5)) path.push([x, y, 0]); else { if (path.length > 1) paths.push(path); path = [] } }
      if (path.length > 1) paths.push(path)
      return paths
    }
    for (let k = -8; k <= 8; k++) for (const flip of [false, true]) {
      let path: V[] = []
      for (let i = 0; i <= 80; i++) { const t = -8 + i / 5, x = flip ? k : t, y = flip ? t : k, z = shape.f(x, y); if (Number.isFinite(z) && Math.abs(z) <= 25 && (!path.length || Math.abs(z - path[path.length - 1][2]) < 5)) path.push([x, y, z]); else { if (path.length > 1) paths.push(path); path = [] } }
      if (path.length > 1) paths.push(path)
    }
    return paths
  }, [shape])
  return <>{paths.map((p, i) => <Line key={i} points={p} color={color} lineWidth={1} />)}</>
}
function contourPath(f: (x: number, y: number) => number, view: { x: number; y: number; range: number }, width: number, height: number) {
  const nx = 120, ny = Math.max(48, Math.round(nx * height / width)), unit = width / (2 * view.range), ry = height / (2 * unit)
  const values = Array.from({ length: ny + 1 }, (_, j) => Array.from({ length: nx + 1 }, (_, i) => f(view.x - view.range + 2 * view.range * i / nx, view.y - ry + 2 * ry * j / ny)))
  let path = ''
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as const
    const crossings: [number, number][] = []
    for (let e = 0; e < 4; e++) {
      const [ia, ja] = corners[e], [ib, jb] = corners[(e + 1) % 4], a = values[ja][ia], b = values[jb][ib]
      if (!Number.isFinite(a) || !Number.isFinite(b) || (a < 0) === (b < 0)) continue
      const t = a / (a - b), x = (ia + (ib - ia) * t) / nx * 2 * view.range - view.range + view.x, y = (ja + (jb - ja) * t) / ny * 2 * ry - ry + view.y
      crossings.push([width / 2 + (x - view.x) * unit, height / 2 - (y - view.y) * unit])
    }
    for (let k = 0; k + 1 < crossings.length; k += 2) path += `M${crossings[k][0]},${crossings[k][1]}L${crossings[k + 1][0]},${crossings[k + 1][1]} `
  }
  return path
}
function Scene({ results }: { results: Result[] }) {
  return <Canvas camera={{ position: [11, -14, 11], up: [0, 0, 1], fov: 45 }}>
    <ambientLight intensity={1.6} /><pointLight position={[10, -10, 15]} intensity={60} />
    <gridHelper args={[20, 20, '#536279', '#293548']} rotation={[Math.PI / 2, 0, 0]} />
    {([[10, 0, 0], [0, 10, 0], [0, 0, 10]] as V[]).map((p, i) => <group key={i}><Line points={[scale(p, -1), p]} color={['#f87171', '#4ade80', '#60a5fa'][i]} /><Html position={p} style={{ color: '#fff', fontSize: 12 }}>{['x', 'y', 'z'][i]}</Html></group>)}
    {results.map((r, i) => {
      const s = r.shape, color = colors[i % colors.length]; if (!s || !r.entry.visible || s.kind === 'value') return null
      return <group key={r.entry.id}>
        {s.kind === 'point' && <><mesh position={s.p}><sphereGeometry args={[0.1, 16, 16]} /><meshBasicMaterial color={color} /></mesh><Html position={s.p} style={{ color, fontSize: 12, paddingLeft: 10, pointerEvents: 'none' }}>{r.name}</Html></>}
        {(s.kind === 'line' || s.kind === 'segment') && <Line points={s.kind === 'line' ? [add(s.p, scale(s.v, -20 / norm(s.v))), add(s.p, scale(s.v, 20 / norm(s.v)))] : [s.p, add(s.p, s.v)]} color={color} lineWidth={2} />}
        {s.kind === 'circle' && <Line points={Array.from({ length: 129 }, (_, j) => add(s.p, [s.r * Math.cos(j * Math.PI / 64), s.r * Math.sin(j * Math.PI / 64), 0]))} color={color} lineWidth={2} />}
        {s.kind === 'sphere' && <mesh position={s.p}><sphereGeometry args={[s.r, 24, 16]} /><meshBasicMaterial color={color} wireframe transparent opacity={0.5} /></mesh>}
        {s.kind === 'plane' && <PlaneMesh shape={s} color={color} />}
        {s.kind === 'surface' && <Surface shape={s} color={color} />}
        {s.kind === 'curve' && <Surface shape={s} color={color} />}
      </group>
    })}
    <OrbitControls makeDefault />
  </Canvas>
}
function Plot({ results, tool, onPoint, onMove }: { results: Result[]; tool: boolean; onPoint: (p: V) => void; onMove: (id: string, p: V) => void }) {
  const [view, setView] = useState({ x: 0, y: 0, range: 8 })
  const [size, setSize] = useState({ w: 800, h: 560 })
  const ref = useRef<SVGSVGElement>(null)
  const drag = useRef<{ id?: string; x: number; y: number; cx: number; cy: number; z: number } | null>(null)
  const fitView = () => {
    const rect = ref.current?.getBoundingClientRect()
    const w = rect?.width || size.w, h = rect?.height || size.h, aspect = w / h
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    const include = (x: number, y: number) => { if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) < 1e4 && Math.abs(y) < 1e4) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y) } }
    for (const { shape, entry } of results) {
      if (!shape || !entry.visible || shape.kind === 'value' || shape.kind === 'plane' || shape.kind === 'sphere' || shape.kind === 'surface') continue
      if (shape.kind === 'point') include(shape.p[0], shape.p[1])
      else if (shape.kind === 'circle') { include(shape.p[0] - shape.r, shape.p[1] - shape.r); include(shape.p[0] + shape.r, shape.p[1] + shape.r) }
      else if (shape.kind === 'segment') { include(shape.p[0], shape.p[1]); include(shape.p[0] + shape.v[0], shape.p[1] + shape.v[1]) }
      else if (shape.kind === 'line') { const length = norm(shape.v); if (length) { const d = scale(shape.v, 6 / length); include(shape.p[0] - d[0], shape.p[1] - d[1]); include(shape.p[0] + d[0], shape.p[1] + d[1]) } }
      else if (shape.kind === 'curve') {
        const half = shape.axis === 'x' ? 8 / aspect : 8
        for (let i = 0; i <= 240; i++) { const t = -half + 2 * half * i / 240, x = shape.axis === 'x' ? shape.f(0, t) : t, y = shape.axis === 'x' ? t : shape.f(t, 0); include(x, y) }
      }
    }
    if (!Number.isFinite(minX)) { minX = -8; maxX = 8; minY = -8; maxY = 8 }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
    const halfX = Math.max(1.5, (maxX - minX) / 2), halfY = Math.max(1.5, (maxY - minY) / 2)
    setView({ x: cx, y: cy, range: Math.min(100, Math.max(0.25, Math.max(halfX, halfY * aspect) * 1.12)) })
  }
  useEffect(() => {
    const el = ref.current!, ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    fitView()
    return () => ro.disconnect()
    // The current results are used for the initial fit; reset remounts Plot to fit edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const unit = size.w / (2 * view.range), px = (x: number) => size.w / 2 + (x - view.x) * unit, py = (y: number) => size.h / 2 - (y - view.y) * unit
  const toWorld = (x: number, y: number): V => { const b = ref.current!.getBoundingClientRect(); return [+(view.x + (x - b.left - size.w / 2) / unit).toFixed(3), +(view.y - (y - b.top - size.h / 2) / unit).toFixed(3), 0] }
  const step = 10 ** Math.floor(Math.log10(view.range / 3)), lines = []
  for (let x = Math.floor((view.x - view.range) / step) * step; x <= view.x + view.range; x += step) lines.push(<g key={`x${x}`}><line x1={px(x)} x2={px(x)} y2={size.h} stroke={Math.abs(x) < 1e-8 ? '#708197' : '#283448'} /><text x={px(x) + 4} y={Math.min(size.h - 10, Math.max(16, py(0) + 16))} fill="#98a8bf" fontSize={10}>{fmt(x)}</text></g>)
  const ry = size.h / unit / 2
  for (let y = Math.floor((view.y - ry) / step) * step; y <= view.y + ry; y += step) lines.push(<g key={`y${y}`}><line y1={py(y)} y2={py(y)} x2={size.w} stroke={Math.abs(y) < 1e-8 ? '#708197' : '#283448'} /><text x={Math.max(5, Math.min(size.w - 30, px(0) + 5))} y={py(y) - 5} fill="#98a8bf" fontSize={10}>{fmt(y)}</text></g>)
  return <svg ref={ref} className="studio-svg" aria-label="2D coordinate graph" onWheel={e => { e.preventDefault(); setView(v => ({ ...v, range: Math.min(100, Math.max(0.25, v.range * (e.deltaY > 0 ? 1.12 : 0.89))) })) }} onPointerDown={e => {
    if (tool) { onPoint(toWorld(e.clientX, e.clientY)); return }
    const id = (e.target as SVGElement).dataset.point
    drag.current = { id, x: e.clientX, y: e.clientY, cx: view.x, cy: view.y, z: 0 }; e.currentTarget.setPointerCapture(e.pointerId)
  }} onPointerMove={e => { const d = drag.current; if (!d) return; if (d.id) onMove(d.id, toWorld(e.clientX, e.clientY)); else setView(v => ({ ...v, x: d.cx - (e.clientX - d.x) / unit, y: d.cy + (e.clientY - d.y) / unit })) }} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}>
    {lines}
    {results.map((r, i) => {
      const s = r.shape, color = colors[i % colors.length]; if (!s || !r.entry.visible) return null
      if (s.kind === 'point') return <g key={r.entry.id}><circle data-point={/^\s*(?:\w+\s*=\s*)?\([^()]+\)\s*$/.test(r.entry.text) ? r.entry.id : undefined} cx={px(s.p[0])} cy={py(s.p[1])} r={7} fill={color} stroke="#111827" strokeWidth={2} style={{ cursor: 'grab' }} /><text x={px(s.p[0]) + 12} y={py(s.p[1]) - 10} fill={color} fontSize={13}>{r.name}</text></g>
      if (s.kind === 'circle') return <circle key={r.entry.id} cx={px(s.p[0])} cy={py(s.p[1])} r={s.r * unit} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.045} pointerEvents="none" />
      if (s.kind === 'line' || s.kind === 'segment') { const t = s.kind === 'line' ? 1e4 : 1, a = s.kind === 'line' ? add(s.p, scale(s.v, -t)) : s.p, b = add(s.p, scale(s.v, t)); return <line key={r.entry.id} x1={px(a[0])} y1={py(a[1])} x2={px(b[0])} y2={py(b[1])} stroke={color} strokeWidth={2} pointerEvents="none" /> }
      if (s.kind === 'curve') { let d = '', previous: number | null = null; const half = s.axis === 'x' ? ry : view.range; for (let k = 0; k <= 800; k++) { const t = (s.axis === 'x' ? view.y - half : view.x - half) + k / 800 * 2 * half, x = s.axis === 'x' ? s.f(0, t) : t, y = s.axis === 'x' ? t : s.f(t, 0), sy = py(y); if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(px(x)) > size.w * 8 || Math.abs(sy) > size.h * 8) { previous = null; continue } d += `${previous === null || Math.abs(sy - previous) > size.h ? 'M' : 'L'}${px(x)},${sy} `; previous = sy } return <path key={r.entry.id} d={d} stroke={color} strokeWidth={2} fill="none" pointerEvents="none" /> }
      if (s.kind === 'implicit') return <path key={r.entry.id} d={contourPath(s.f, view, size.w, size.h)} stroke={color} strokeWidth={2} fill="none" pointerEvents="none" />
      return null
    })}
    <text x={size.w - 20} y={Math.max(20, Math.min(size.h - 20, py(0) - 10))} fill="#e2e8f0">x</text><text x={Math.max(12, Math.min(size.w - 20, px(0) - 15))} y={20} fill="#e2e8f0">y</text>
  </svg>
}
export function GeometryStudio() {
  const t = useT(), [saved] = useState(initial), [entries, setEntries] = useState(saved.entries), [mode, setMode] = useState(saved.mode)
  const [tool, setTool] = useState(false), [reset, setReset] = useState(0), [storageError, setStorageError] = useState(false)
  const [past, setPast] = useState<Entry[][]>([]), [future, setFuture] = useState<Entry[][]>([])
  const results = useMemo(() => calculate(entries), [entries])
  const readyCount=results.filter(r=>r.shape&&!r.error).length
  useEffect(() => { const timer = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify({ entries, mode })); setStorageError(false) } catch { setStorageError(true) } }, 400); return () => clearTimeout(timer) }, [entries, mode])
  const change = (next: Entry[]) => { setPast(p => [...p.slice(-39), entries]); setFuture([]); setEntries(next) }
  const update = (id: string, patch: Partial<Entry>) => change(entries.map(r => r.id === id ? { ...r, ...patch } : r))
  const append = (text: string) => { if (entries.length < 60) change([...entries, ...rows([text])]) }
  const unique = (prefix: string) => { let n = 1; while (results.some(r => r.name === `${prefix}${n}`)) n++; return `${prefix}${n}` }
  const addPoint = (p: V) => { append(`${unique('P')} = (${p.slice(0, mode === '2D' ? 2 : 3).join(',')})`); setTool(false) }
  const exportFile = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ mode, entries }, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'analytica-studio.json'; a.click(); URL.revokeObjectURL(url) }
  return <div className="studio">
    <div className="studio-heading"><div><span className="eyebrow">{t('Ruang matematika terbuka', 'An open math workspace')}</span><h1>{t('Studio Geometri', 'Geometry Studio')}<span>.</span></h1><p>{t('Buat objek. Hubungkan ide. Hitung langsung.', 'Create objects. Connect ideas. Calculate live.')}</p></div><div className="studio-mode">{(['2D', '3D'] as const).map(m => <button key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setTool(false) }}>{m}</button>)}</div></div>
    <div className="studio-toolbar">
      <div className="studio-tool-group" role="group" aria-label={t('Buat objek','Create objects')}>
      <button onClick={() => mode === '2D' ? setTool(!tool) : addPoint([1, 1, 1])} aria-pressed={tool}>+ {t('Titik', 'Point')}</button>
      <button onClick={() => append(`${unique('l')} = line((-2,0,0),(2,2,${mode === '3D' ? 3 : 0}))`)}>+ {t('Garis', 'Line')}</button>
      <button onClick={() => append(`${unique('c')} = circle((0,0,0),2)`)}>+ {t('Lingkaran', 'Circle')}</button>
      <button onClick={() => append(`${unique('s')} = segment((0,0,0),(3,2,0))`)}>+ {t('Ruas', 'Segment')}</button>
      {mode === '3D' && <><button onClick={() => append(`${unique('p')} = plane(1,1,1,-3)`)}>+ {t('Bidang', 'Plane')}</button><button onClick={() => append(`${unique('s')} = sphere((0,0,0),2)`)}>+ {t('Bola', 'Sphere')}</button></>}
      <button onClick={() => append(mode === '2D' ? 'y = x^2' : 'z = sin(x)*cos(y)')}>+ {t('Fungsi', 'Function')}</button>
      </div><div className="studio-tool-group studio-history" role="group" aria-label={t('Riwayat dan ekspor','History and export')}>
      <span className="studio-spacer" /><button disabled={!past.length} onClick={() => { setFuture(f => [entries, ...f]); setEntries(past[past.length - 1]); setPast(p => p.slice(0, -1)) }}>{t('Urungkan', 'Undo')}</button><button disabled={!future.length} onClick={() => { setPast(p => [...p, entries]); setEntries(future[0]); setFuture(f => f.slice(1)) }}>{t('Ulangi', 'Redo')}</button><button onClick={exportFile}>{t('Ekspor', 'Export')}</button>
      </div>
    </div>
    <div className="studio-status"><span><span className="studio-live-dot"/> {t('Perhitungan langsung','Live calculations')}</span><span>{readyCount} {t('objek siap',readyCount===1?'object ready':'objects ready')}{results.some(r=>r.error)&&` · ${results.filter(r=>r.error).length} ${t('perlu diperbaiki','need attention')}`}</span></div>
    <div className="studio-workspace"><aside className="studio-expressions"><div className="studio-panel-title"><strong>{t('Objek & perhitungan', 'Objects & calculations')}</strong><span>{entries.length}/60</span></div>
      <div className="studio-rows">{results.map((r, i) => <div className="studio-row" key={r.entry.id}>
        <div className="studio-row-top"><button className="studio-dot" aria-label={`${r.entry.visible ? 'Hide' : 'Show'} ${r.name}`} aria-pressed={r.entry.visible} style={{ background: r.entry.visible ? colors[i % colors.length] : 'transparent', borderColor: colors[i % colors.length] }} onClick={() => update(r.entry.id, { visible: !r.entry.visible })} /><span>{r.name}</span><button className="studio-delete" aria-label={`Delete ${r.name}`} onClick={() => change(entries.filter(e => e.id !== r.entry.id))}>×</button></div>
        <input aria-label={`Expression ${i + 1}`} value={r.entry.text} maxLength={500} spellCheck={false} onChange={e => update(r.entry.id, { text: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') append('') }} />
        <div className={r.error ? 'studio-error' : 'studio-result'}>{r.error ?? (r.shape && describe(r.shape))}</div>
        {r.shape?.kind === 'implicit' && mode === '3D' && <small>{t('Persamaan implisit ditampilkan di tampilan 2D', 'Implicit equations are shown in the 2D view')}</small>}
        {r.shape && ['plane', 'sphere', 'surface'].includes(r.shape.kind) && mode === '2D' && <small>{t('Tampilkan di tampilan 3D', 'Visible in the 3D view')}</small>}
      </div>)}</div><button className="studio-add" disabled={entries.length >= 60} onClick={() => append('')}>+ {t('Tambah ekspresi', 'Add expression')}</button>
      <p className="studio-save">{storageError ? t('Penyimpanan tidak tersedia. Ekspor untuk menyimpan.', 'Storage unavailable. Export to keep your work.') : t('Disimpan di browser ini', 'Saved in this browser')}</p>
    </aside><section className="studio-stage"><div className="studio-stage-top"><span>{mode === '2D' ? 'x · y' : 'x · y · z'} / {t('KOORDINAT', 'COORDINATES')}</span><button onClick={() => setReset(r => r + 1)}>{mode === '2D' ? t('Sesuaikan objek', 'Fit objects') : t('Atur ulang tampilan', 'Reset view')}</button></div>
      <div className="studio-viewport">{mode === '2D' ? <Plot key={reset} results={results} tool={tool} onPoint={addPoint} onMove={(id, p) => { const r = results.find(x => x.entry.id === id)!; if (r.shape?.kind === 'point') { p[2] = r.shape.p[2]; update(id, { text: `${r.name.startsWith('#') ? '' : r.name + ' = '}(${p.join(',')})` }) } }} /> : <SceneBoundary key={reset} fallback={t('WebGL tidak tersedia. Gunakan tampilan 2D; perhitungan tetap aktif.', 'WebGL is unavailable. Use the 2D view; calculations remain available.')}><Scene results={results} /></SceneBoundary>}</div>
      <div className="studio-stage-bottom">{tool ? t('Klik grafik untuk menaruh titik.', 'Click the graph to place a point.') : mode === '2D' ? t('Seret titik • Seret latar untuk geser • Gulir untuk zoom', 'Drag points • Drag background to pan • Scroll to zoom') : t('Seret untuk rotasi • Klik kanan untuk geser • Gulir untuk zoom', 'Drag to orbit • Right-drag to pan • Scroll to zoom')}</div>
    </section></div>
    <div className="studio-help"><div><h2>{t('Mulai dari sebuah ide.', 'Start with an idea.')}</h2><p>{t('Objek dihitung dari atas ke bawah. Gunakan namanya untuk membuat hubungan.', 'Rows calculate from top to bottom. Use object names to build relationships.')}</p><button onClick={() => { change(rows(examples[mode])); setReset(r => r + 1) }}>{t('Muat contoh', 'Load example')} {mode}</button></div><div><code>A = (1,2,3)<br />B = (4,2,0)<br />l = line(A,B)<br />c = circle(A,2)</code></div><div><code>p = plane(1,2,3,-6)<br />distance(A,p)<br />intersect(l,p)<br />angle(l,p)</code></div><div><code>a = 2<br />y = a*sin(x)<br />z = sin(x)*cos(y)<br />sqrt(25) + 2^3</code></div></div>
    <p className="studio-note">{t('Bidang: ax + by + cz + d = 0. Lingkaran 3D sejajar bidang xy. Tampilan 2D memproyeksikan koordinat x,y; perhitungan memakai ketiga koordinat. Sudut dalam derajat; fungsi trigonometri memakai radian. Irisan mendukung garis–garis, garis–bidang, dan bidang–bidang. Grafik 2D menerima y = f(x), x = f(y), dan F(x,y) = 0; persamaan linear 3D menjadi bidang. Grafik disampling secara numerik.', 'Planes use ax + by + cz + d = 0. 3D circles lie parallel to the xy plane. The 2D view projects x,y; calculations use all three coordinates. Angles are in degrees; trig inputs use radians. Intersections support line-line, line-plane, and plane-plane. 2D graphs accept y = f(x), x = f(y), and F(x,y) = 0; linear 3D equations become planes. Graphs are sampled numerically.')}</p>
  </div>
}
