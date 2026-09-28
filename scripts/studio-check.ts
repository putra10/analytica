import assert from 'node:assert/strict'
import { calculate, type Shape } from '../src/lib/studio'
const run = (...text: string[]) => calculate(text.map((text, i) => ({ id: String(i), text, visible: true })))
const value = (s?: Shape) => { assert.equal(s?.kind, 'value'); return (s as Extract<Shape, { kind: 'value' }>).value }
const close = (a: unknown, b: number) => assert.ok(typeof a === 'number' && Math.abs(a - b) < 1e-8, `${a} != ${b}`)
close(value(run('sqrt(25)+2^3')[0].shape), 13)
close(value(run('-2^2')[0].shape), -4)
close(value(run('2^3^2')[0].shape), 512)
let r = run('A=(0,0)', 'B=(3,4)', 'l=line(A,B)', 'distance(A,B)', 'c=circle(A,2)', 'area(c)')
assert.ok(r.every(x => !x.error)); close(value(r[3].shape), 5); close(value(r[5].shape), 4 * Math.PI)
r = run('A=(0,0,3)', 'B=(0,0,-1)', 'l=line(A,B)', 'p=plane(0,0,1,-1)', 'I=intersect(l,p)', 'distance(A,p)', 'angle(l,p)')
assert.deepEqual(r[4].shape, { kind: 'point', p: [0, 0, 1] }); close(value(r[5].shape), 2); close(value(r[6].shape), 90)
r = run('a=2', 'y=a*sin(x)', 'z=x^2+y^2')
assert.equal(r[1].shape?.kind, 'curve'); if (r[1].shape?.kind === 'curve') close(r[1].shape.f(Math.PI / 2, 0), 2)
assert.equal(r[2].shape?.kind, 'surface'); if (r[2].shape?.kind === 'surface') close(r[2].shape.f(3, 4), 25)
r = run('p=plane(1,0,0,-2)', 'q=plane(0,1,0,-3)', 'l=intersect(p,q)')
assert.equal(r[2].shape?.kind, 'line'); if (r[2].shape?.kind === 'line') { close(r[2].shape.p[0], 2); close(r[2].shape.p[1], 3) }
r = run('l=line((0,0),(1,0))', 'm=line((0,1),(1,1))', 'intersect(l,m)')
assert.equal(value(r[2].shape), 'parallel')
for (const src of ['circle((0,0),-1)', 'line((1,1),(1,1))', 'plane(0,0,0,1)', 'sqrt(-1)', '1/0', 'y=unknown(x)', 'y=conj(x)', 'z=re(x)', 'circle((0,0),2,3)', 'intersect(A,B)']) assert.ok(run(src)[0].error, src)
r = run('A=(0,0)', 'A=(2,2)', 'B=(3,4)', 'distance(A,B)'); assert.ok(r[1].error); close(value(r[3].shape), 5)
r = run('s=sphere((1,2,3),3)', 'volume(s)', 'area(s)'); close(value(r[1].shape), 36 * Math.PI); close(value(r[2].shape), 36 * Math.PI)
console.log('Studio checks passed: arithmetic, dependency updates, geometry, intersections, invalid inputs, functions.')
