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
r = run('l=4x+7y=0', 'A=(0,0)', 'distance(A,l)')
assert.equal(r[0].shape?.kind, 'line'); if (r[0].shape?.kind === 'line') { close(r[0].shape.p[0], 0); close(r[0].shape.p[1], 0); close(r[0].shape.v[0], 7); close(r[0].shape.v[1], -4) }
close(value(r[2].shape), 0)
r = run('c=x^2+y^2=4', 'area(c)', 'e=x^2+2y^2=4', 'y=sin(x)')
assert.equal(r[0].shape?.kind, 'circle'); if (r[0].shape?.kind === 'circle') { close(r[0].shape.p[0], 0); close(r[0].shape.p[1], 0); close(r[0].shape.r, 2) }
close(value(r[1].shape), 4 * Math.PI)
assert.equal(r[2].shape?.kind, 'conic'); if (r[2].shape?.kind === 'conic') { close(r[2].shape.f(0, 0), -4); close(r[2].shape.f(2, 0), 0) }
assert.equal(r[3].shape?.kind, 'curve')
r = run('x+y+z=0')
assert.equal(r[0].shape?.kind, 'plane'); if (r[0].shape?.kind === 'plane') { close(r[0].shape.n[0], 1); close(r[0].shape.n[1], 1); close(r[0].shape.n[2], 1); close(r[0].shape.D, 0) }
r = run('p=plane(1,0,0,-2)', 'q=plane(0,1,0,-3)', 'l=intersect(p,q)')
assert.equal(r[2].shape?.kind, 'line'); if (r[2].shape?.kind === 'line') { close(r[2].shape.p[0], 2); close(r[2].shape.p[1], 3) }
r = run('l=line((0,0),(1,0))', 'm=line((0,1),(1,1))', 'intersect(l,m)')
assert.equal(value(r[2].shape), 'parallel')
for (const src of ['circle((0,0),-1)', 'line((1,1),(1,1))', 'plane(0,0,0,1)', 'sqrt(-1)', '1/0', 'y=unknown(x)', 'y=conj(x)', 'z=re(x)', 'circle((0,0),2,3)', 'intersect(A,B)']) assert.ok(run(src)[0].error, src)
r = run('A=(0,0)', 'A=(2,2)', 'B=(3,4)', 'distance(A,B)'); assert.ok(r[1].error); close(value(r[3].shape), 5)
r = run('s=sphere((1,2,3),3)', 'volume(s)', 'area(s)'); close(value(r[1].shape), 36 * Math.PI); close(value(r[2].shape), 36 * Math.PI)
// ---- course commands (known answers) ----
const pt = (s: Shape | undefined, p: number[]) => { assert.equal(s?.kind, 'point'); p.forEach((x, i) => close((s as Extract<Shape, { kind: 'point' }>).p[i], x)) }
const summary = (x: { summary?: { en: string } }) => x.summary?.en ?? ''
const steps = (x: { steps?: unknown[] }) => assert.ok((x.steps?.length ?? 0) > 0, 'missing steps')
// circles: general equation, power, polar, tangent, radical axis/centre, pencil
r = run('c=x^2+y^2-4x-2y-4=0', 'P=(6,4)', 'power(P,c)', 'polar(P,c)', 'tangent(P,c)', 'd=x^2+y^2+2x-6y+6=0', 'radical(c,d)', 'e3=x^2+y^2-10y+16=0', 'radical(c,d,e3)', 'pencil(c,d,1/2)', 'center(c)', 'radius(c)', 'intersect(c,d)')
assert.ok(r.every(x => !x.error), r.find(x => x.error)?.error)
assert.equal(r[0].shape?.kind, 'circle'); if (r[0].shape?.kind === 'circle') { close(r[0].shape.r, 3); close(r[0].shape.p[0], 2); close(r[0].shape.p[1], 1) }
close(value(r[2].shape), 16); assert.equal(summary(r[3]), '4x + 3y - 20 = 0'); assert.equal(summary(r[4]), 'y - 4 = 0;  24x - 7y - 116 = 0')
assert.equal(summary(r[6]), '3x - 2y + 5 = 0'); pt(r[8].shape, [0, 2.5, 0]); assert.equal(summary(r[9]), 'centre (1/2, 2), r = √13/2 ≈ 1.80278')
pt(r[10].shape, [2, 1, 0]); close(value(r[11].shape), 3); assert.equal(summary(r[12]), '(-1, 1), (11/13, 49/13)')
r.slice(2).forEach(steps)
assert.equal(summary(run('c=x^2+y^2-4x+6y-16=0')[0]), 'centre (2, -3), r = √29 ≈ 5.38516')
// spheres and sphere-plane section
r = run('s=x^2+y^2+z^2-2x+4y-6z-11=0', 'p=2x-y+2z-1=0', 'intersect(s,p)', 'T=(1,-2,8)', 'tangent(T,s)')
assert.equal(r[0].shape?.kind, 'sphere'); if (r[0].shape?.kind === 'sphere') close(r[0].shape.r, 5)
assert.equal(r[2].shape?.kind, 'circle'); if (r[2].shape?.kind === 'circle') { close(r[2].shape.r, 4); [-1, -1, 1].forEach((x, i) => close((r[2].shape as { p: number[] }).p[i], x)) }
assert.equal(summary(r[4]), 'z - 8 = 0')
// lines and planes: canonical form, skew distance, common perpendicular, projection
r = run('l=(x-1)/2=(y+2)/(-1)=z/3', 'm=(x+1)/1=y/2=(z-3)/(-1)', 'position(l,m)', 'distance(l,m)', 'perpendicular(l,m)', 'P=(2,-1,3)', 'p=2x-y+2z-3=0', 'distance(P,p)', 'projection(P,p)', 'intersect(l,p)', 'parallel(P,p)', 'plane((1,0,0),(0,1,0),(0,0,1))')
assert.ok(r.every(x => !x.error), r.find(x => x.error)?.error)
assert.equal(value(r[2].shape), 'skew'); close(value(r[3].shape), 7 / Math.sqrt(3)); assert.equal(summary(r[3]), 'd = 7√3/3 ≈ 4.04145')
assert.equal(r[4].shape?.kind, 'segment'); if (r[4].shape?.kind === 'segment') close(Math.hypot(...r[4].shape.v), 7 / Math.sqrt(3))
close(value(r[7].shape), 8 / 3); pt(r[8].shape, [2 / 9, -1 / 9, 11 / 9]); pt(r[9].shape, [9 / 11, -21 / 11, -3 / 11])
assert.equal(summary(r[10]), '2x - y + 2z - 11 = 0'); assert.equal(summary(r[11]), 'x + y + z - 1 = 0')
// conics (Vaisman 3.3.22 / 3.4.1): invariants and types
r = run('C=5x^2+24xy-2y^2+4x-1=0', 'classify(C)', 'E=9x^2+16y^2+24xy-40x+30y=0', 'classify(E)', 'H=x^2-y^2+2x+4y-3=0', 'classify(H)', 'center(C)', 'W=x^2+y^2+4=0', 'classify(W)')
assert.ok(r.every(x => !x.error)); assert.equal(summary(r[8]), 'imaginary ellipse (class 1)')
assert.equal(summary(r[1]), 'hyperbola (class 3)'); assert.equal(summary(r[3]), 'parabola (class 4)'); assert.equal(summary(r[5]), 'pair of real crossing lines (class 5)')
assert.ok(r[1].steps!.some(s => s.tex?.includes('= -154')) && r[1].steps!.some(s => s.tex?.includes('= 162')), 'delta/Delta of 3.3.22')
assert.ok(r[3].steps!.some(s => s.tex?.includes("25x'^2 - 50y' = 0") && s.tex.includes("x'^2 = 2\\,y'")), 'parabola canonical form')
pt(r[6].shape, [-2 / 77, -12 / 77, 0])
// quadrics (Vaisman Example 3.4.3 and Exercise 3.4.2)
r = run('Q=x^2+y^2-3z^2-2xy-6xz-6yz+2x+2y+4z=0', 'classify(Q)', 'center(Q)', 'R=4x^2+2y^2+z^2-4xy-2yz-2y+2z-4=0', 'classify(R)', 'S=x^2+y^2+z^2-1=0', 'classify(S)')
assert.equal(summary(r[1]), 'two-sheeted hyperboloid (class 3)'); pt(r[2].shape, [1 / 6, 1 / 6, 1 / 3])
assert.ok(r[1].steps!.some(s => s.tex?.includes('s^3 + s^2 - 24s + 36 = 0')), 'characteristic polynomial')
assert.equal(summary(r[4]), 'elliptic cylinder (class 10)'); assert.equal(summary(r[6]), 'real ellipsoid (class 2)')
// transformations
r = run('T=affine(0,-1,1,0,3,-1)', 'classify(T)', 'A=(1,2)', 'apply(T,A)', 'm=line((0,0),(1,1))', 'S=reflect(m)', 'classify(S)', 'U=apply(T,S)', 'classify(U)', 'H=scale(2,(1,1))', 'classify(H)', 'c=x^2+y^2-2x=0', 'apply(T,c)', 'G=affine(2,1,1,1,0,0)', 'E=x^2/4+y^2=1', 'F=apply(G,E)', 'R=rotate(90,(2,1))', 'classify(R)', 'K=affine(1,2,2,4,0,0)', 'classify(K)')
assert.ok(r.every(x => !x.error), r.find(x => x.error)?.error)
assert.equal(summary(r[1]), 'rotation by 90° about (2, 1)'); pt(r[3].shape, [1, 0, 0])
assert.equal(summary(r[6]), 'reflection in the line of fixed points'); assert.equal(summary(r[8]), 'glide reflection')
assert.equal(summary(r[10]), 'homothety with ratio 2 about (1, 1)'); assert.equal(summary(r[12]), 'centre (3, 0), r = 1')
assert.equal(r[15].shape?.kind, 'conic'); if (r[15].shape?.kind === 'conic') { const c = r[15].shape.c; close(c.a11, 5 / 4); close(c.a12, -9 / 4); close(c.a22, 17 / 4); close(c.a00, -1) }
assert.equal(summary(r[17]), 'rotation by 90° about (2, 1)'); assert.equal(summary(r[19]), 'singular map (not affine)')
// errors
for (const src of ['tangent((2,1),x^2+y^2=9)', 'classify(A)', 'pencil(c,d)', 'apply(A,A)']) assert.ok(run('A=(0,0)', 'c=circle(A,1)', src).at(-1)!.error, src)
assert.ok(run('c=x^2+y^2-9=0', 'tangent((1,1),c)')[1].error, 'tangent from inside')
console.log('Studio checks passed: arithmetic, geometry, intersections, invalid inputs, functions, circles/spheres, lines/planes, conics, quadrics, transformations.')
