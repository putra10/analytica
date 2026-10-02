import assert from 'node:assert/strict'
import { calculate, type Row } from '../src/lib/complex-studio'
import type { Complex } from '../src/lib/complex-math'

const run = (...text: string[]) => calculate(text.map((text, i) => ({ id: String(i), text })))
const ok = (r: Row) => { assert.ok(!r.error, `${r.entry.text}: ${r.error?.en}`); return r }
const close = (z: Complex | undefined, re: number, im = 0, tol = 1e-6, what = '') => {
  assert.ok(z && Math.abs(z.re - re) < tol && Math.abs(z.im - im) < tol, `${what}: got ${z?.re} + ${z?.im}i, want ${re} + ${im}i`)
}
const one = (text: string) => ok(run(text)[0])
const has = (r: Row, s: string) => assert.ok(r.answer?.includes(s), `${r.entry.text}: "${r.answer}" lacks "${s}"`)

// numbers, polar form, de Moivre
let r = run('z = 3+4i', 'w = 2e^(i*pi/3)', 'z*w', 'z/w', 'abs(z)', 'conj(z)', 'polar(-1+i)')
r.forEach(ok)
has(r[1], '1 + \\sqrt{3}\\,i')
close(r[2].value, 3 - 4 * Math.sqrt(3), 4 + 3 * Math.sqrt(3), 1e-9, 'z*w')
close(r[4].value, 5, 0, 1e-12, '|3+4i|')
has(r[6], '\\sqrt{2}e^{i\\frac{3\\pi}{4}}')
close(one('pow(-1+i, 7)').value, -8, -8, 1e-9, '(-1+i)^7')
// roots of -8i: 2i, -√3 - i, √3 - i
const roots = one('roots(-8i, 3)').values!
for (const [re, im] of [[0, 2], [-Math.sqrt(3), -1], [Math.sqrt(3), -1]]) assert.ok(roots.some((z) => Math.abs(z.re - re) < 1e-9 && Math.abs(z.im - im) < 1e-9), `root ${re}+${im}i`)
// logs and powers
close(one('Log(-1)').value, 0, Math.PI, 1e-12, 'Log(-1)'); has(one('Log(-1)'), '\\pi\\,i')
close(one('i^i').value, Math.exp(-Math.PI / 2), 0, 1e-12, 'i^i')
// functions, CR, derivatives, harmonic
r = run('f(z) = z^2 + 1', 'f(1+i)', 'cr(f)', 'cr(conj(z))', 'cr(|z|^2)', 'derivative(f, 2-i)', 'derivative(|z|^2, 0)', 'cr(x^2 + i*y^2)')
r.forEach(ok)
close(r[1].value, 1, 2, 1e-12, 'f(1+i)')
assert.ok(r[2].note?.en.includes('analytic') && !r[2].note.en.includes('not'), 'CR for z^2')
assert.ok(r[3].note?.en.includes('not analytic'), 'CR fails for conj z')
has(r[4], 'z = 0')
close(r[5].value, 4, -2, 1e-12, "f'(2-i)")
close(r[6].value, 0, 0, 1e-12, "(|z|^2)'(0)")
has(r[7], '2x - 2y = 0')
const h = one('harmonic(x^2 - y^2)'); has(h, '2xy')
has(one('harmonic(y^3 - 3x^2*y)'), 'x^{3} - 3xy^{2}')
assert.ok(one('harmonic(x^2 + y^2)').answer!.includes('\\ne 0'), 'x^2+y^2 not harmonic')
// limits
assert.ok(one('limit(conj(z)/z, 0)').answer!.includes('does not exist'), 'lim zbar/z')
close(one('limit((z^2-1)/(z-1), 1)').value, 2, 0, 1e-9, 'lim (z^2-1)/(z-1)')
// integrals
close(one('integral(1/z, circle(0, 1))').value, 0, 2 * Math.PI, 1e-9, '∮dz/z')
close(one('integral(z^2, segment(0, 1+i))').value, -2 / 3, 2 / 3, 1e-12, '∫z² dz')
close(one('integral(conj(z), circle(0, 2))').value, 0, 8 * Math.PI, 1e-6, '∮ z̄ dz')
close(one('integral(1/(z^2+4), polygon(1+i, -1+i, -1-i, 1-i))').value, 0, 0, 1e-9, 'Cauchy-Goursat')
close(one('cauchy(exp(z), 1, circle(0, 2))').value, 0, 2 * Math.PI * Math.E, 1e-9, 'Cauchy formula')
close(one('cauchy(exp(2z), 0, circle(0, 1), 3)').value, 0, 2 * Math.PI * 8 / 6, 1e-9, 'Cauchy n=3')
close(one('ml(1/(z^2+1), circle(0, 3))').value, 6 * Math.PI / 8, 0, 1e-9, 'ML bound')
// residues, classification, series
close(one('residue(exp(z)/z^2, 0)').value, 1, 0, 1e-9, 'Res e^z/z^2')
close(one('residue(1/(z^2+1)^2, i)').value, 0, -0.25, 1e-9, 'Res order 2')
close(one('residue(1/sin(z), pi)').value, -1, 0, 1e-9, 'Res 1/sin z at π')
close(one('residue(exp(1/z), 0)').value, 1, 0, 1e-9, 'Res e^{1/z}')
close(one('residues((5z-2)/(z(z-1)), circle(0, 2))').value, 0, 10 * Math.PI, 1e-9, 'residue theorem')
assert.ok(one('classify(sin(z)/z, 0)').note?.en === 'removable singularity')
assert.ok(one('classify(exp(1/z), 0)').note?.en === 'essential singularity')
assert.ok(one('classify(1/(z-1)^3, 1)').note?.en === 'pole of order 3')
const t = one('taylor(1/(1-z), 0, 5)').values!
t.forEach((c, k) => close(c, 1, 0, 1e-9, `taylor c${k}`))
const l = one('laurent(1/(z*(z-1)), 0, 3, 2)').values! // 1 < |z|: 1/z^2 + 1/z^3 + ...
close(l[0], 1, 0, 1e-9, 'c-3'); close(l[1], 1, 0, 1e-9, 'c-2'); close(l[2], 0, 0, 1e-9, 'c-1'); close(l[3], 0, 0, 1e-9, 'c0')
const zs = one('zeros(z^3 - z)').values!; assert.equal(zs.length, 3)
// regions, paths, errors
assert.ok(one('region(1 < |z-i| < 2)').note?.en.startsWith('an annulus'))
for (const bad of ['w = z', 'roots(1, 0)', 'residue(conj(z), 0)', 'integral(1/z, circle(0, -1))', 'taylor(1/z, 0, 3)', 'pow(0, -1)', '1/0', 'f(z) = q*z']) assert.ok(run(bad)[0].error, bad)
r = run('a = 2', 'a = 3'); assert.ok(r[1].error, 'duplicate name')
console.log('Complex studio checks passed: arithmetic, roots, logs, CR, harmonic, limits, integrals, residues, series, regions.')
