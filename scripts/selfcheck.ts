// Runnable self-check for the math engines:  npx tsx scripts/selfcheck.ts
import { reduceQuadric, QUADRIC_PRESETS, invariants, evalQuadric, quadricSurfaces } from '../src/lib/quadrics'
import { eigen3Sym } from '../src/lib/matrix-math'

const assert = (cond: boolean, msg: string) => { if (!cond) { console.error('FAIL', msg); process.exitCode = 1 } }

// Vaisman Example 3.4.3: eigenvalues 2, 3, -6
const e = eigen3Sym([[1, -1, -3], [-1, 1, -3], [-3, -3, -3]])
const sorted = [...e.values].sort((a, b) => a - b).map((v) => +v.toFixed(6))
assert(JSON.stringify(sorted) === JSON.stringify([-6, 2, 3]), `eigen3Sym: ${sorted}`)

for (const p of QUADRIC_PRESETS) {
  const r = reduceQuadric(p.q)
  const inv = invariants(p.q)
  let maxRes = 0
  for (const s of quadricSurfaces(r)) for (let i = 0; i < s.positions.length; i += 3) {
    const v: [number, number, number] = [s.positions[i], s.positions[i + 1], s.positions[i + 2]]
    maxRes = Math.max(maxRes, Math.abs(evalQuadric(p.q, v)))
  }
  console.log(p.id.padEnd(10), r.type.padEnd(22), 'δ', inv.delta.toFixed(3).padStart(8), 'Δ', inv.Delta.toFixed(3).padStart(8), 'res', maxRes.toExponential(1), ' ', r.canonicalTex)
  assert(maxRes < 1e-4 /* Float32 positions */, `${p.id}: surface points do not satisfy f = 0 (res ${maxRes})`)
}
assert(reduceQuadric(QUADRIC_PRESETS.find((p) => p.id === 'v343')!.q).type === 'hyperboloid-2', 'Example 3.4.3 must be a two-sheeted hyperboloid')
console.log(process.exitCode ? 'FAILED' : 'all checks passed')

// ---------- algebra ----------
import { symmetric, dihedral, cyclic, product, quaternion, units, isomorphism, subgroups, isNormal, quotient, isAbelian, elementOrder } from '../src/lib/group-theory'
import { parsePerm, compose, cycleTex, order, isEven } from '../src/lib/permutations'
import { zpIrreducible, qIrreducible, parsePoly, pDivMod, polyTex, znInfo } from '../src/lib/rings'
import { analyzeConic, CONIC_PRESETS } from '../src/lib/conics'
import { contourIntegral, PRESETS, C } from '../src/lib/complex-math'

// Herstein 3.1: σ = (1 2 3 4 5 → 2 3 1 5 4), τ = (3 4 5 1 2) ⇒ στ = (1 5 4 2 3)
const s = parsePerm('2 3 1 5 4', 5)!, tt = parsePerm('3 4 5 1 2', 5)!
assert(compose(s, tt).join(',') === '0,4,3,1,2', `Herstein στ example: ${compose(s, tt)}`)
// 13-card shuffle: order 13; with the extra move the product has order 12
const sh = parsePerm('3 4 5 6 7 8 9 10 11 12 13 1 2', 13)!, mv = parsePerm('(1 12 11 10 9 8 7 6 5 4 3 2)', 13)!
assert(order(sh) === 13 && order(compose(sh, mv)) === 12, `shuffle orders ${order(sh)} ${order(compose(sh, mv))}`)
assert(cycleTex(parsePerm('(1 2 3)(4 5)', 5)!) === String.raw`(1\;2\;3)(4\;5)` && !isEven(parsePerm('(1 2 3)(4 5)', 5)!), 'cycle parse / parity')

// S3 ≅ D3, Z6 ≅ Z2×Z3, Z4 ≇ Z2×Z2, Q8 ≇ D4, U(8) ≅ Z2×Z2
assert(isomorphism(symmetric(3), dihedral(3)).isomorphic, 'S3 ≅ D3')
assert(isomorphism(cyclic(6), product(2, 3)).isomorphic, 'Z6 ≅ Z2×Z3')
assert(!isomorphism(cyclic(4), product(2, 2)).isomorphic, 'Z4 ≇ Z2×Z2')
assert(!isomorphism(quaternion(), dihedral(4)).isomorphic, 'Q8 ≇ D4')
assert(isomorphism(units(8), product(2, 2)).isomorphic, 'U8 ≅ Z2×Z2')
// S4 has 30 subgroups; A3 ◁ S3 with S3/A3 abelian of order 2
assert(subgroups(symmetric(4)).length === 30, `S4 subgroups: ${subgroups(symmetric(4)).length}`)
const S3 = symmetric(3), A3 = subgroups(S3).find((h) => h.length === 3)!
assert(isNormal(S3, A3) && quotient(S3, A3).order === 2 && isAbelian(quotient(S3, A3)), 'A3 normal in S3')
assert(!isNormal(S3, subgroups(S3).find((h) => h.length === 2)!), 'order-2 subgroup of S3 not normal')
assert(quaternion().table.every((row, a) => row.every((_, b) => elementOrder(quaternion(), a) <= 4)) && subgroups(quaternion()).every((h) => isNormal(quaternion(), h)), 'Q8: all subgroups normal')

// rings
assert(zpIrreducible(2, parsePoly('x^2+x+1', { kind: 'Zp', p: 2 })!).irreducible === true, 'x²+x+1 irreducible over Z2')
assert(zpIrreducible(2, parsePoly('x^2+1', { kind: 'Zp', p: 2 })!).irreducible === false, 'x²+1 = (x+1)² over Z2')
assert(qIrreducible(parsePoly('x^4+2x^2+2', { kind: 'Q' })!).reason === 'eisenstein', 'Eisenstein')
assert(qIrreducible(parsePoly('2x^3-3x^2-3x+2', { kind: 'Q' })!).irreducible === false, 'rational root')
const dm = pDivMod({ kind: 'Q' }, parsePoly('x^3-2', { kind: 'Q' })!, parsePoly('x-1', { kind: 'Q' })!)
assert(polyTex(dm.q) === 'x^{2} + x + 1' && polyTex(dm.r) === '-1', `division: ${polyTex(dm.q)} r ${polyTex(dm.r)}`)
assert(znInfo(12).ideals.map((i) => i.d).join() === '2,3,4,6,12' && znInfo(12).ideals.filter((i) => i.maximal).map((i) => i.d).join() === '2,3', 'ideals of Z12')

// conics: Vaisman 3.4.11 is a real ellipse with δ = 4, Δ = −109
const v = analyzeConic(CONIC_PRESETS.find((p) => p.id === 'v3411')!.c)
assert(v.type === 'ellipse' && Math.abs(v.delta - 4) < 1e-9 && Math.abs(v.Delta + 109) < 1e-9, `3.4.11: ${v.type} δ=${v.delta} Δ=${v.Delta}`)

// residue theorem: ∮ dz/(z(z−1)(z−2)) around |z − 0.3| = 1.5 encloses 0 and 1 ⇒ 2πi(½ − 1)
const I = contourIntegral((z) => PRESETS.find((p) => p.id === 'rat3')!.f(z, C(0)), { center: C(0.3, 0), radius: 1.5 })
assert(Math.abs(I.re) < 1e-9 && Math.abs(I.im + Math.PI) < 1e-9, `residue theorem: ${I.re} ${I.im}`)
console.log(process.exitCode ? 'FAILED' : 'algebra / conic / residue checks passed')

// ---------- user input ----------
import { compileComplex, quadraticCoeffs } from '../src/lib/expr'
import { numericResidue } from '../src/lib/complex-math'
import { permutationGroupFrom } from '../src/lib/group-theory'
{
  const { f } = compileComplex('(z^2 + 1) / (z (z - 2)^2)')
  // Res at 0: 1/4 ; Res at 2 (double pole): d/dz[(z²+1)/z] at 2 = 1 − 1/z² = 3/4
  const r0 = numericResidue((z) => f(z, C(0)), C(0)), r2 = numericResidue((z) => f(z, C(0)), C(2))
  assert(Math.abs(r0.re - 0.25) < 1e-6 && Math.abs(r0.im) < 1e-6 && Math.abs(r2.re - 0.75) < 1e-6, `numeric residues ${r0.re} ${r2.re}`)
  const q = quadraticCoeffs('x^2 + 8y^2 - 4xy - 8x + 6y - 5 = 0')
  assert(q.a11 === 1 && q.a22 === 8 && q.a12 === -2 && q.a10 === -4 && q.a20 === 3 && q.a00 === -5, 'quadraticCoeffs 3.4.11')
  const D4 = permutationGroupFrom('(1 2 3 4), (1 3)')
  assert(D4.order === 8 && isomorphism(D4, dihedral(4)).isomorphic, 'custom ⟨(1234),(13)⟩ ≅ D4')
  assert(permutationGroupFrom('(1 2 3), (1 2)').order === 6, 'custom ⟨(123),(12)⟩ = S3')
}
console.log(process.exitCode ? 'FAILED' : 'user-input checks passed')
