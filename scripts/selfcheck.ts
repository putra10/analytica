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
import { symmetric, dihedral, cyclic, product, quaternion, units, isomorphism, subgroups, isNormal, quotient, isAbelian, elementOrder, homomorphisms } from '../src/lib/group-theory'
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

// Hom counts: S3 → Z2 is trivial + sign; Hom(D4,Z2) = 4; End(S4) = 58
assert(homomorphisms(S3, cyclic(2)).length === 2, `|Hom(S3,Z2)| = ${homomorphisms(S3, cyclic(2)).length}`)
assert(homomorphisms(dihedral(4), cyclic(2)).length === 4, `|Hom(D4,Z2)| = ${homomorphisms(dihedral(4), cyclic(2)).length}`)
assert(homomorphisms(symmetric(4), symmetric(4)).length === 58, `|End(S4)| = ${homomorphisms(symmetric(4), symmetric(4)).length}`)
// the sign map has kernel A3
assert(homomorphisms(S3, cyclic(2)).some((f) => f.kernel.join() === A3.join()), 'ker(sign) = A3')
// every kernel is normal (2.5.5) and |G| = |ker φ|·|φ(G)| with G/ker φ ≅ φ(G) (2.7.1)
for (const G of [S3, dihedral(4), quaternion(), symmetric(4), cyclic(12)]) {
  for (const H of [cyclic(2), cyclic(4), S3, dihedral(4)]) {
    for (const f of homomorphisms(G, H)) {
      assert(isNormal(G, f.kernel), `ker φ normal in ${G.name} → ${H.name}`)
      assert(f.kernel.length * f.image.length === G.order, `|G| = |ker|·|im| for ${G.name} → ${H.name}`)
      const Q = quotient(G, f.kernel)
      assert(Q.order === f.image.length, `|G/ker φ| = |φ(G)| for ${G.name} → ${H.name}`)
    }
  }
}
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

// ---------- isomorphism checker ----------
import { parseGroup, alternating } from '../src/lib/group-theory'
import { parseRing, ringIsomorphism, ringInvariants, ringZn, ringProduct } from '../src/lib/finite-ring'
import { pExtGcd, pDivSteps, pAdd, pMul as pM } from '../src/lib/rings'
{
  const iso = (a: string, b: string) => isomorphism(parseGroup(a), parseGroup(b))
  const yes = (a: string, b: string) => {
    const r = iso(a, b), G = parseGroup(a), H = parseGroup(b)
    assert(r.isomorphic && !!r.map, `${a} ≅ ${b}`)
    // the map must be a bijective homomorphism
    if (r.map) for (let x = 0; x < G.order; x++) for (let y = 0; y < G.order; y++) assert(r.map[G.table[x][y]] === H.table[r.map[x]][r.map[y]], `${a} → ${b} not a homomorphism`)
    assert(new Set(r.map).size === G.order, `${a} → ${b} not bijective`)
  }
  const no = (a: string, b: string, reason: string) => { const r = iso(a, b); assert(!r.isomorphic && r.reason === reason, `${a} ≇ ${b} by ${reason} (got ${r.reason})`) }
  yes('Z6', 'Z2xZ3'); yes('U8', 'Z2×Z2'); yes('S3', 'D3'); yes('U10', 'Z4'); yes('(1 2 3 4), (1 3)', 'D4'); yes('Z2xZ2xZ2', 'U24'); yes('U15', 'Z2xZ4')
  no('Z4', 'Z2xZ2', 'cyclic'); no('S3', 'Z6', 'abelian'); no('D4', 'Q8', 'profile'); no('A4', 'D6', 'center'); no('Z6', 'S4', 'order'); no('Z2xZ4', 'Z8', 'cyclic')
  assert(parseGroup('A4').order === 12 && alternating(4).order === 12 && parseGroup('Z₁₂').order === 12 && parseGroup('⟨(1 2 3), (1 2)⟩').order === 6 && parseGroup('U(8)').order === 4, 'parseGroup forms')
  let bad = 0; for (const s of ['', 'S9', 'Z', 'foo', '(1 2']) { try { parseGroup(s) } catch { bad++ } }
  assert(bad === 5, `parseGroup rejects bad input (${bad}/5)`)

  const ryes = (a: string, b: string) => {
    const R = parseRing(a), S = parseRing(b), r = ringIsomorphism(R, S)
    assert(r.isomorphic && !!r.map, `ring ${a} ≅ ${b}`)
    if (r.map) for (let x = 0; x < R.labels.length; x++) for (let y = 0; y < R.labels.length; y++) assert(r.map[R.add[x][y]] === S.add[r.map[x]][r.map[y]] && r.map[R.mul[x][y]] === S.mul[r.map[x]][r.map[y]], `ring ${a} → ${b} not a homomorphism`)
  }
  const rno = (a: string, b: string, reason: string) => { const r = ringIsomorphism(parseRing(a), parseRing(b)); assert(!r.isomorphic && r.reason === reason, `ring ${a} ≇ ${b} by ${reason} (got ${r.reason})`) }
  ryes('Z6', 'Z2xZ3'); ryes('Z10', 'Z5×Z2'); ryes('Z2[x]/(x^2+x)', 'Z2xZ2'); ryes('Z3[x]/(x^2+1)', 'Z3[x]/(x^2+x+2)'); ryes('Z2[x]/(x^3+x+1)', 'Z2[x]/(x^3+x^2+1)')
  rno('Z4', 'Z2xZ2', 'char'); rno('Z12', 'Z2xZ6', 'char'); rno('Z2[x]/(x^2+x+1)', 'Z2xZ2', 'units'); rno('Z2[x]/(x^2)', 'Z2xZ2', 'units'); rno('Z9', 'Z3[x]/(x^2+1)', 'char')
  const F4 = ringInvariants(parseRing('F2[x]/(x^2+x+1)'))
  assert(F4.order === 4 && F4.field && F4.char === 2 && F4.units.length === 3, 'F2[x]/(x²+x+1) is a field of 4 elements')
  assert(!ringInvariants(parseRing('Z2[x]/(x^2+1)')).field && ringInvariants(parseRing('Z2[x]/(x^2+1)')).nilpotents.length === 2, 'Z2[x]/(x²+1) has a nilpotent x+1')
  assert(ringInvariants(ringProduct(ringZn(2), ringZn(3))).units.length === 2 && ringInvariants(ringZn(12)).zeroDivisors.length === 7, 'units / zero divisors')

  // Bézout over Q and Z_p; long-division rows end in the remainder
  for (const [F, a, b] of [[{ kind: 'Q' as const }, 'x^4 - 1', 'x^3 + x^2 + x + 1'], [{ kind: 'Zp' as const, p: 5 }, 'x^4 + 3x^2 + 2', 'x^2 + 1'], [{ kind: 'Zp' as const, p: 2 }, 'x^3 + x + 1', 'x^2 + 1']] as const) {
    const f = parsePoly(a, F)!, g = parsePoly(b, F)!, e = pExtGcd(F, f, g)
    assert(polyTex(pAdd(F, pM(F, e.s, f), pM(F, e.t, g))) === polyTex(e.g), `Bézout ${a}, ${b}`)
    const st = pDivSteps(F, f, g)
    assert(polyTex(st[st.length - 1]?.rem ?? f) === polyTex(pDivMod(F, f, g).r), `division rows ${a} ÷ ${b}`)
  }
}
console.log(process.exitCode ? 'FAILED' : 'isomorphism checks passed')
