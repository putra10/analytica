import { parse, freeVars, type Node } from './expr'
import type { Conic } from './conics'
import type { Quadric } from './quadrics'
import { canonicalLine, command, COMMANDS, fromQuadratic, quadOf } from './studio-ops'

export type V = [number, number, number]
export type Shape =
  | { kind: 'point'; p: V }
  | { kind: 'line' | 'segment'; p: V; v: V; dash?: boolean }
  /** n: normal of a circle lying in a tilted plane (3D); absent means parallel to the xy plane */
  | { kind: 'circle' | 'sphere'; p: V; r: number; n?: V }
  | { kind: 'plane'; n: V; D: number }
  | { kind: 'curve'; axis: 'x' | 'y'; f: (x: number, y: number) => number }
  | { kind: 'implicit'; f: (x: number, y: number) => number }
  | { kind: 'conic'; c: Conic; f: (x: number, y: number) => number }
  | { kind: 'quadric'; q: Quadric }
  | { kind: 'surface'; f: (x: number, y: number) => number }
  /** (x, y) ↦ M(x, y) + c, M row-major */
  | { kind: 'transform'; m: [number, number, number, number]; c: [number, number] }
  | { kind: 'group'; items: Shape[] }
  | { kind: 'value'; value: number | string }
/** Bilingual text. */
export interface L { id: string; en: string }
/** One line of working: prose and/or a TeX formula. */
export interface Step { text?: L; tex?: string }
export interface Out { shape: Shape; steps?: Step[]; summary?: L }
export interface Entry { id: string; text: string; visible: boolean }
export interface Result { entry: Entry; name: string; shape?: Shape; error?: string; steps?: Step[]; summary?: L }
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
const callRe = new RegExp(`^(${COMMANDS.join('|')})\\((.*)\\)$`, 'i')
export function calculate(entries: Entry[]): Result[] {
  const objects: Record<string, Shape> = Object.create(null), numbers: Record<string, number> = Object.create(null)
  const scalar = (s: string) => { const v = real(parse(s), numbers); if (!Number.isFinite(v)) throw Error('Result is not a finite real number'); return v }
  const point = (s: string): V => {
    const obj = objects[s]; if (obj?.kind === 'point') return obj.p
    if (!s.startsWith('(') || !s.endsWith(')')) throw Error('Use a point name or (x,y,z)')
    const p = split(s.slice(1, -1)).map(scalar); if (p.length !== 2 && p.length !== 3) throw Error('A point needs 2 or 3 coordinates')
    return [p[0], p[1], p[2] ?? 0]
  }
  const shape = (s: string): Shape => { const o = objects[s]; if (o) return o; if (s.startsWith('(')) return { kind: 'point', p: point(s) }; throw Error('Reference named objects defined above this row') }
  const ctx = { shape, point, scalar }
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
      let out: Out
      if (/^[xyz]\s*=[^=]*$/.test(src)) {
        const axis = src[0] as 'x' | 'y' | 'z'
        const kind = axis === 'z' ? 'surface' : 'curve', ast = parse(src.slice(src.indexOf('=') + 1))
        validate(ast)
        const independent = axis === 'x' ? 'y' : 'x'
        for (const v of freeVars(ast)) if (![independent, ...(kind === 'surface' ? ['y'] : []), 'pi', 'e', ...Object.keys(numbers)].includes(v)) throw Error(`Unknown variable: ${v}`)
        const env = { ...numbers }
        out = { shape: kind === 'curve'
          ? { kind, axis: axis as 'x' | 'y', f: (x, y) => real(ast, { ...env, x, y }) }
          : { kind, f: (x, y) => real(ast, { ...env, x, y }) } }
      } else if (src.includes('=')) {
        const sides = src.split('=').map(s => parse(s))
        sides.forEach(validate)
        const allowed = ['x', 'y', 'z', 'pi', 'e', ...Object.keys(numbers)]
        for (const side of sides) for (const v of freeVars(side)) if (!allowed.includes(v)) throw Error('Unknown variable: ' + v)
        const env = { ...numbers }
        if (sides.length === 3) out = canonicalLine(sides.map(s => (x: number, y: number, z: number) => real(s, { ...env, x, y, z })))
        else {
          if (sides.length !== 2) throw Error('Use one equals sign (or two for a line (x-x0)/l = (y-y0)/m = (z-z0)/n)')
          const [lhs, rhs] = sides
          const at = (x: number, y: number, z = 0) => real(lhs, { ...env, x, y, z }) - real(rhs, { ...env, x, y, z })
          const d = at(0, 0, 0), a = at(1, 0, 0) - d, b = at(0, 1, 0) - d, c = at(0, 0, 1) - d
          const samples: [number, number, number][] = [[-2, 1, 0], [1, -3, 0], [2, 3, 0], [-3, -2, 0], [1, 1, 2], [-2, 3, -1], [2, -1, 3]]
          const values = samples.map(([x, y, z]) => at(x, y, z))
          const linear = [a, b, c, d].every(Number.isFinite) && Math.hypot(a, b, c) >= 1e-10 && values.every(Number.isFinite) && samples.every(([x, y, z], i) => Math.abs(values[i] - (a * x + b * y + c * z + d)) <= 1e-8 * (1 + Math.abs(values[i])))
          if (linear) {
            if (Math.abs(c) > 1e-10) out = { shape: { kind: 'plane', n: [a, b, c], D: d } }
            else {
              const length2 = a * a + b * b
              if (length2 < 1e-20) throw Error('Equation does not define a line or plane')
              out = { shape: { kind: 'line', p: [-a * d / length2, -b * d / length2, 0], v: [b, -a, 0] } }
            }
          } else {
            const vars = [...freeVars(lhs), ...freeVars(rhs)]
            const q = quadOf(at)
            if (q) out = fromQuadratic(q, vars.includes('z'))
            else if (vars.includes('z')) throw Error('Use z = f(x,y) or a second-degree equation in x, y, z for a 3D surface')
            else if (!vars.some(v => v === 'x' || v === 'y')) throw Error('Equation does not define a 2D curve')
            else out = { shape: { kind: 'implicit', f: at } }
          }
        }
      } else if (src.startsWith('(') && split(src.slice(1, -1)).length > 1) out = { shape: { kind: 'point', p: point(src) } }
      else {
        const call = src.match(callRe)
        out = call ? command(call[1].toLowerCase(), split(call[2]), ctx) : { shape: { kind: 'value', value: scalar(src) } }
      }
      objects[name] = out.shape
      if (out.shape.kind === 'value' && typeof out.shape.value === 'number' && /^[a-df-w]$/.test(name)) numbers[name] = out.shape.value
      return { entry, name, ...out }
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
  if (s.kind === 'conic') return 'conic'
  if (s.kind === 'quadric') return 'quadric'
  if (s.kind === 'transform') return `x' = ${fmt(s.m[0])}x + ${fmt(s.m[1])}y + ${fmt(s.c[0])}, y' = ${fmt(s.m[2])}x + ${fmt(s.m[3])}y + ${fmt(s.c[1])}`
  if (s.kind === 'group') return `${s.items.length} objects`
  return s.kind === 'curve' ? (s.axis === 'x' ? 'x = f(y)' : 'y = f(x)') : 'z = f(x,y)'
}
