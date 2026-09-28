import { parse, freeVars, type Node } from './expr'
import { distPointLine, distPointPlane, linePlane, twoLines, twoPlanes } from './geometry3d'

export type V = [number, number, number]
export type Shape =
  | { kind: 'point'; p: V }
  | { kind: 'line' | 'segment'; p: V; v: V }
  | { kind: 'circle' | 'sphere'; p: V; r: number }
  | { kind: 'plane'; n: V; D: number }
  | { kind: 'curve'; axis: 'x' | 'y'; f: (x: number, y: number) => number }
  | { kind: 'implicit'; f: (x: number, y: number) => number }
  | { kind: 'surface'; f: (x: number, y: number) => number }
  | { kind: 'value'; value: number | string }
export interface Entry { id: string; text: string; visible: boolean }
export interface Result { entry: Entry; name: string; shape?: Shape; error?: string }
export const colors = ['#a78bfa', '#38bdf8', '#fb923c', '#34d399', '#f472b6', '#facc15']
export const fmt = (n: number) => Number.isFinite(n) ? String(+n.toPrecision(6)) : 'undefined'
export const add = (a: V, b: V): V => a.map((v, i) => v + b[i]) as V
export const sub = (a: V, b: V): V => a.map((v, i) => v - b[i]) as V
export const scale = (a: V, t: number): V => a.map(v => v * t) as V
export const norm = (a: V) => Math.hypot(...a)

const funcs: Record<string, (v: number) => number> = { sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, log: Math.log, ln: Math.log, sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh }
function validate(n: Node): void {
  if (n.t === 'call' && !Object.hasOwn(funcs, n.fn)) throw Error('Use real functions: sin, cos, tan, sqrt, abs, exp, ln')
  if (n.t === 'call' || n.t === 'neg') validate(n.a)
  if (n.t === 'bin') { validate(n.a); validate(n.b) }
}
function real(n: Node, env: Record<string, number>): number {
  if (n.t === 'num') return n.v
  if (n.t === 'var') { const v = n.name === 'pi' ? Math.PI : n.name === 'e' ? Math.E : env[n.name]; if (v === undefined) throw Error(`Unknown variable: ${n.name}`); return v }
  if (n.t === 'neg') return -real(n.a, env)
  if (n.t === 'call') { if (!funcs[n.fn]) throw Error('Use real functions: sin, cos, tan, sqrt, abs, exp, ln'); return funcs[n.fn](real(n.a, env)) }
  const a = real(n.a, env), b = real(n.b, env)
  return n.op === '+' ? a + b : n.op === '-' ? a - b : n.op === '*' ? a * b : n.op === '/' ? a / b : a ** b
}
function split(s: string): string[] {
  let depth = 0, start = 0; const parts: string[] = []
  for (let i = 0; i < s.length; i++) { if (s[i] === '(') depth++; if (s[i] === ')') depth--; if (s[i] === ',' && depth === 0) { parts.push(s.slice(start, i).trim()); start = i + 1 } }
  if (depth !== 0) throw Error('Unbalanced parentheses')
  parts.push(s.slice(start).trim()); return parts
}
export function calculate(entries: Entry[]): Result[] {
  const objects: Record<string, Shape> = Object.create(null), numbers: Record<string, number> = Object.create(null)
  const scalar = (s: string) => { const v = real(parse(s), numbers); if (!Number.isFinite(v)) throw Error('Result is not a finite real number'); return v }
  const point = (s: string): V => {
    const obj = objects[s]; if (obj?.kind === 'point') return obj.p
    if (!s.startsWith('(') || !s.endsWith(')')) throw Error('Use a point name or (x,y,z)')
    const p = split(s.slice(1, -1)).map(scalar); if (p.length !== 2 && p.length !== 3) throw Error('A point needs 2 or 3 coordinates')
    return [p[0], p[1], p[2] ?? 0]
  }
  return entries.map((entry, index) => {
    let name = `#${index + 1}`, src = entry.text.trim()
    try {
      if (!src) throw Error('Enter an expression')
      if (src.length > 500) throw Error('Keep expressions below 500 characters')
      const assignment = src.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.+)$/)
      const graphAxis = assignment?.[1].toLowerCase()
      if (assignment) {
        name = assignment[1]
        if (['x', 'y', 'z'].includes(graphAxis!)) src = `${graphAxis} = ${assignment[2]}`
        else src = assignment[2]
        if (objects[name]) throw Error('Name already used')
      }
      let shape: Shape
      if (/^[xyz]\s*=/.test(src)) {
        const axis = src[0] as 'x' | 'y' | 'z'
        const kind = axis === 'z' ? 'surface' : 'curve', ast = parse(src.slice(src.indexOf('=') + 1))
        validate(ast)
        const independent = axis === 'x' ? 'y' : 'x'
        for (const v of freeVars(ast)) if (![independent, ...(kind === 'surface' ? ['y'] : []), 'pi', 'e', ...Object.keys(numbers)].includes(v)) throw Error(`Unknown variable: ${v}`)
        const env = { ...numbers }
        shape = kind === 'curve'
          ? { kind, axis: axis as 'x' | 'y', f: (x, y) => real(ast, { ...env, x, y }) }
          : { kind, f: (x, y) => real(ast, { ...env, x, y }) }
      } else if (src.includes('=')) {
        const sides = src.split('=')
        if (sides.length !== 2) throw Error('Use one equals sign in a line equation')
        const lhs = parse(sides[0]), rhs = parse(sides[1])
        validate(lhs); validate(rhs)
        const allowed = ['x', 'y', 'z', 'pi', 'e', ...Object.keys(numbers)]
        for (const v of [...freeVars(lhs), ...freeVars(rhs)]) if (!allowed.includes(v)) throw Error('Unknown variable: ' + v)
        const env = { ...numbers }
        const at = (x: number, y: number, z = 0) => real(lhs, { ...env, x, y, z }) - real(rhs, { ...env, x, y, z })
        const d = at(0, 0, 0), a = at(1, 0, 0) - d, b = at(0, 1, 0) - d, c = at(0, 0, 1) - d
        const samples: [number, number, number][] = [[-2, 1, 0], [1, -3, 0], [2, 3, 0], [-3, -2, 0], [1, 1, 2], [-2, 3, -1], [2, -1, 3]]
        const values = samples.map(([x, y, z]) => at(x, y, z))
        const linear = [a, b, c, d].every(Number.isFinite) && Math.hypot(a, b, c) >= 1e-10 && values.every(Number.isFinite) && samples.every(([x, y, z], i) => Math.abs(values[i] - (a * x + b * y + c * z + d)) <= 1e-8 * (1 + Math.abs(values[i])))
        if (linear) {
          if (Math.abs(c) > 1e-10) shape = { kind: 'plane', n: [a, b, c], D: d }
          else {
            const length2 = a * a + b * b
            if (length2 < 1e-20) throw Error('Equation does not define a line or plane')
            shape = { kind: 'line', p: [-a * d / length2, -b * d / length2, 0], v: [b, -a, 0] }
          }
        } else {
          const vars = [...freeVars(lhs), ...freeVars(rhs)]
          if (vars.includes('z')) throw Error('Use z = f(x,y) for a 3D surface; implicit 3D surfaces are not supported')
          if (!vars.some(v => v === 'x' || v === 'y')) throw Error('Equation does not define a 2D curve')
          const q0 = at(0, 0), xp = at(1, 0), xn = at(-1, 0), yp = at(0, 1), yn = at(0, -1)
          const qx = (xp + xn - 2 * q0) / 2, qy = (yp + yn - 2 * q0) / 2
          const lx = (xp - xn) / 2, ly = (yp - yn) / 2, qxy = at(1, 1) - qx - qy - lx - ly - q0
          const circleSamples: [number, number][] = [[2, 1], [-1, 2], [-2, -3], [3, -1]]
          const circleModel = (x: number, y: number) => qx * x * x + qy * y * y + qxy * x * y + lx * x + ly * y + q0
          const isCircle = [q0, qx, qy, lx, ly, qxy].every(Number.isFinite) && Math.abs(qx) > 1e-10 && Math.abs(qx - qy) <= 1e-8 * (1 + Math.abs(qx)) && Math.abs(qxy) <= 1e-8 * (1 + Math.abs(qx)) && circleSamples.every(([x, y]) => Math.abs(at(x, y) - circleModel(x, y)) <= 1e-8 * (1 + Math.abs(at(x, y))))
          const radius2 = (lx * lx + ly * ly) / (4 * qx * qx) - q0 / qx
          if (isCircle && Number.isFinite(radius2) && radius2 > 0) shape = { kind: 'circle', p: [-lx / (2 * qx), -ly / (2 * qx), 0], r: Math.sqrt(radius2) }
          else shape = { kind: 'implicit', f: at }
        }
      } else if (src.startsWith('(') && split(src.slice(1, -1)).length > 1) shape = { kind: 'point', p: point(src) }
      else {
        const call = src.match(/^(point|line|segment|circle|sphere|plane|distance|intersect|angle|area|volume)\((.*)\)$/i)
        if (!call) shape = { kind: 'value', value: scalar(src) }
        else {
          const op = call[1].toLowerCase(), args = split(call[2])
          const count = (n: number) => { if (args.length !== n) throw Error(`${op} needs ${n} arguments`) }
          if (op === 'point') { shape = { kind: 'point', p: point(`(${call[2]})`) } }
          else if (op === 'line' || op === 'segment') { count(2); const p = point(args[0]), v = sub(point(args[1]), p); if (norm(v) < 1e-10) throw Error('Choose two distinct points'); shape = { kind: op, p, v } }
          else if (op === 'circle' || op === 'sphere') { count(2); const p = point(args[0]), r = scalar(args[1]); if (r <= 0) throw Error('Radius must be positive'); shape = { kind: op, p, r } }
          else if (op === 'plane') { count(4); const [a, b, c, D] = args.map(scalar); const n: V = [a, b, c]; if (norm(n) < 1e-10) throw Error('Plane normal cannot be zero'); shape = { kind: 'plane', n, D } }
          else {
            count(op === 'area' || op === 'volume' ? 1 : 2)
            const a = objects[args[0]], b = objects[args[1]]
            if (!a || (args.length === 2 && !b)) throw Error('Reference named objects defined above this row')
            if (op === 'area' && (a.kind === 'circle' || a.kind === 'sphere')) shape = { kind: 'value', value: Math.PI * a.r ** 2 * (a.kind === 'sphere' ? 4 : 1) }
            else if (op === 'volume' && a.kind === 'sphere') shape = { kind: 'value', value: 4 / 3 * Math.PI * a.r ** 3 }
            else if (op === 'distance') {
              const p = a.kind === 'point' ? a : b?.kind === 'point' ? b : null, other = p === a ? b : a
              if (!p) throw Error('Distance needs at least one point')
              let d: number
              if (other.kind === 'point') d = norm(sub(p.p, other.p))
              else if (other.kind === 'line') d = distPointLine(p.p, other)
              else if (other.kind === 'plane') d = distPointPlane(p.p, other)
              else throw Error('Use point-point, point-line or point-plane')
              shape = { kind: 'value', value: d }
            } else if ((op === 'angle' || op === 'intersect') && a.kind === 'line' && b.kind === 'line') {
              const r = twoLines(a, b); shape = op === 'angle' ? { kind: 'value', value: r.angle * 180 / Math.PI } : r.point ? { kind: 'point', p: r.point } : { kind: 'value', value: r.relation }
            } else if ((op === 'angle' || op === 'intersect') && a.kind === 'plane' && b.kind === 'plane') {
              const r = twoPlanes(a, b); shape = op === 'angle' ? { kind: 'value', value: r.angle * 180 / Math.PI } : r.line ? { kind: 'line', ...r.line } : { kind: 'value', value: r.relation }
            } else if ((op === 'angle' || op === 'intersect') && ((a.kind === 'line' && b.kind === 'plane') || (a.kind === 'plane' && b.kind === 'line'))) {
              const r = linePlane(a.kind === 'line' ? a : b as Extract<Shape, { kind: 'line' | 'segment' }>, a.kind === 'plane' ? a : b as Extract<Shape, { kind: 'plane' }>)
              shape = op === 'angle' ? { kind: 'value', value: r.angle * 180 / Math.PI } : r.point ? { kind: 'point', p: r.point } : { kind: 'value', value: r.relation }
            } else throw Error('Unsupported object pair for this calculation')
          }
        }
      }
      objects[name] = shape
      if (shape.kind === 'value' && typeof shape.value === 'number' && /^[a-df-w]$/.test(name)) numbers[name] = shape.value
      return { entry, name, shape }
    } catch (e) { return { entry, name, error: e instanceof Error ? e.message : 'Invalid expression' } }
  })
}
export function describe(s: Shape): string {
  if (s.kind === 'point') return `(${s.p.map(fmt).join(', ')})`
  if (s.kind === 'value') return typeof s.value === 'number' ? fmt(s.value) : s.value
  if (s.kind === 'circle' || s.kind === 'sphere') return `r = ${fmt(s.r)} · area = ${fmt(Math.PI * s.r ** 2 * (s.kind === 'sphere' ? 4 : 1))}`
  if (s.kind === 'plane') return `${s.n.map(fmt).join(', ')} · (x,y,z) + ${fmt(s.D)} = 0`
  if (s.kind === 'segment') return `length = ${fmt(norm(s.v))}`
  if (s.kind === 'line') return `direction = (${s.v.map(fmt).join(', ')})`
  if (s.kind === 'implicit') return 'implicit curve'
  return s.kind === 'curve' ? (s.axis === 'x' ? 'x = f(y)' : 'y = f(x)') : 'z = f(x,y)'
}
