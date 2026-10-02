import { useMemo, useState, type ReactNode } from 'react'
import { BookOpen, Divide, Grid3x3, ListOrdered } from 'lucide-react'
import {
  deg, gcd, isPrime, isZeroPoly, pDivMod, pDivSteps, pEval, pExtGcd, pGcd, pMul, pAdd, parsePoly, polyTex, q, qIrreducible, qTex, qZero,
  zpIrreducible, zpRoots, type Field, type Poly, type Q,
} from '../../lib/rings'
import { polyText, ringInvariants, ringPolyQuotient } from '../../lib/finite-ring'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { MathCard, Chip, TextField } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'
import { C, T } from '../stories/kit'
import { LabLayout, Node, Pic, PicCard, Steps, TablePic } from './pics'
import { textW } from './pic-utils'

const FIELDS: { id: string; f: Field; tex: string }[] = [
  { id: 'Z2', f: { kind: 'Zp', p: 2 }, tex: '\\mathbb{Z}_2' },
  { id: 'Z3', f: { kind: 'Zp', p: 3 }, tex: '\\mathbb{Z}_3' },
  { id: 'Z5', f: { kind: 'Zp', p: 5 }, tex: '\\mathbb{Z}_5' },
  { id: 'Z7', f: { kind: 'Zp', p: 7 }, tex: '\\mathbb{Z}_7' },
  { id: 'Q', f: { kind: 'Q' }, tex: '\\mathbb{Q}' },
]

const EXAMPLES: { field: string; f: string; g: string; label: string }[] = [
  { field: 'Z2', f: 'x^2 + x + 1', g: 'x + 1', label: 'F₄ = Z₂[x]/(x²+x+1)' },
  { field: 'Z2', f: 'x^3 + x + 1', g: 'x^2 + 1', label: 'F₈' },
  { field: 'Z3', f: 'x^2 + 1', g: 'x + 2', label: 'F₉ = Z₃[x]/(x²+1)' },
  { field: 'Z5', f: 'x^4 + 3x^2 + 2', g: 'x^2 + 1', label: 'Z₅: x⁴+3x²+2' },
  { field: 'Q', f: 'x^3 + 6x + 3', g: 'x + 1', label: 'Eisenstein p=3' },
  { field: 'Q', f: 'x^4 + 2x^2 + 2', g: 'x^2 + 1', label: 'Eisenstein p=2' },
  { field: 'Q', f: 'x^3 + 2x + 1', g: 'x + 1', label: 'x³ + 2x + 1 ÷ (x + 1)' },
  { field: 'Q', f: '2x^3 - 3x^2 - 3x + 2', g: 'x + 1', label: 'akar rasional' },
  { field: 'Q', f: 'x^4 + 4', g: 'x^2 + 2x + 2', label: 'x⁴ + 4' },
]

const coefText = (c: Q) => (c.den === 1 ? String(c.num) : `${c.num}/${c.den}`).replace('-', '−')
const term = (c: Q, s: number) => polyText([...Array.from({ length: s }, () => q(0)), c])
/** Integer coefficients with no common factor (Gauss's lemma lets us test these). */
function primitive(a: Poly): number[] {
  const L = a.reduce((l, c) => (l * c.den) / gcd(l, c.den), 1)
  const ints = a.map((c) => (c.num * L) / c.den)
  const g = ints.reduce((x, y) => gcd(x, y), 0) || 1
  const s = ints[ints.length - 1] < 0 ? -1 : 1
  return ints.map((c) => (s * c) / g)
}
/** The prime Eisenstein uses: the first that passes, else the first prime dividing a₀ (to show why it fails). */
function eisenstein(prim: number[]) {
  const d = prim.length - 1, a0 = prim[0]
  const check = (p: number) => ({ p, lower: prim.slice(0, d).map((c) => c % p === 0), lead: prim[d] % p !== 0, square: a0 % (p * p) !== 0 })
  const primes = Array.from({ length: 60 }, (_, i) => i).filter(isPrime)
  const pass = primes.map(check).find((c) => c.lower.every(Boolean) && c.lead && c.square)
  if (pass) return { ...pass, ok: true }
  const p = primes.find((x) => a0 !== 0 && a0 % x === 0)
  return p ? { ...check(p), ok: false } : null
}

/** Coefficient boxes, as in the Eisenstein story; over Q tinted by the Eisenstein test, over Z_p with the root check below. */
function CoefficientPicture({ f, F }: { f: Poly; F: Field }) {
  const t = useT()
  const d = deg(f)
  const vals = F.kind === 'Q' ? primitive(f) : f.map((c) => c.num)
  const es = F.kind === 'Q' && d >= 1 ? eisenstein(vals) : null
  const n = d + 1, bw = Math.min(76, (440 - (n - 1) * 10) / n), x0 = 240 - (n * bw + (n - 1) * 10) / 2
  const xs = (i: number) => x0 + (d - i) * (bw + 10)
  const tone = (i: number) => !es ? undefined : i === d ? (es.lead ? C.g : C.r) : i === 0 ? (es.lower[0] && es.square ? C.g : C.r) : es.lower[i] ? C.g : C.r
  const p = F.kind === 'Zp' ? F.p : 0
  const vsize = Math.min(22, ...vals.map((v) => ((bw - 8) * 22) / Math.max(textW(String(v), 22), 1)))
  return (
    <Pic h={F.kind === 'Zp' ? 236 : 230} label={t('Kotak koefisien', 'Coefficient boxes')}>
      <T x={240} y={30} size={15} weight={600}>{F.kind === 'Q' && vals.some((v, i) => v !== f[i]?.num || f[i]?.den !== 1) ? `${t('primitif', 'primitive')}: ` : 'f = '}{polyText(vals.map((v) => q(v)))}</T>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={xs(i)} y={48} width={bw} height={52} rx={10} fill={tone(i) ?? C.bg} fillOpacity={tone(i) ? 0.15 : 1} stroke={tone(i) ?? C.ln} strokeWidth="2" />
          <T x={xs(i) + bw / 2} y={82} size={vsize} weight={700}>{String(v).replace('-', '−')}</T>
          <T x={xs(i) + bw / 2} y={120} size={13} color={C.mu}>{term(q(1), i)}</T>
        </g>
      ))}
      {F.kind === 'Q' && (es ? (
        <>
          <T x={240} y={150} size={15} weight={700} color={es.ok ? C.g : C.r}>p = {es.p}: {es.lower.every(Boolean) ? '✓' : '✗'} {es.lead ? '✓' : '✗'} {es.square ? '✓' : '✗'}</T>
          {[t(`① ${es.p} membagi semua kecuali terdepan`, `① ${es.p} divides all but the leading one`), t(`② ${es.p} ∤ koefisien terdepan`, `② ${es.p} ∤ leading coefficient`), t(`③ ${es.p * es.p} ∤ suku konstan`, `③ ${es.p * es.p} ∤ constant term`)].map((s, i) => {
            const ok = [es.lower.every(Boolean), es.lead, es.square][i]
            return <T key={i} x={40} y={178 + i * 20} anchor="start" size={13} weight={ok ? 600 : 400} color={ok ? C.g : C.r}>{s} {ok ? '✓' : '✗'}</T>
          })}
        </>
      ) : <T x={240} y={160} size={14} color={C.mu}>{t('tidak ada prima yang membagi suku konstan', 'no prime divides the constant term')}</T>)}
      {F.kind === 'Zp' && (
        <>
          <T x={240} y={150} size={14} color={C.mu}>{t(`cari akar: hitung f(a) untuk setiap a di ℤ${p}`, `look for roots: compute f(a) for every a in ℤ${p}`)}</T>
          {Array.from({ length: p }, (_, a) => {
            const v = pEval(F, f, q(a)).num, x = 240 + (a - (p - 1) / 2) * Math.min(60, 440 / p)
            return (
              <g key={a}>
                <T x={x} y={176} size={13} color={C.mu}>f({a})</T>
                <Node at={[x, 204]} label={String(v)} r={15} size={14} fill={v === 0 ? C.r : C.bg} stroke={v === 0 ? C.r : C.ln} />
              </g>
            )
          })}
        </>
      )}
    </Pic>
  )
}

/** Long division as a student writes it, coefficients in degree columns: f, subtract c·xˢ·g, remainder, … */
function DivisionPicture({ f, g, F }: { f: Poly; g: Poly; F: Field }) {
  const t = useT()
  const steps = pDivSteps(F, f, g)
  const d = deg(f), cols = d + 1, lw = 96, cw = Math.min(58, (468 - lw) / Math.max(cols, 1)), x0 = lw + 8
  const cx = (i: number) => x0 + (d - i) * cw + cw / 2
  type Row = { label: string; coefs: (Q | null)[]; color: string; line?: boolean }
  const rows: Row[] = [{ label: 'f', coefs: Array.from({ length: cols }, (_, i) => f[i] ?? q(0)), color: C.fg }]
  for (const s of steps) {
    rows.push({ label: s.c.num < 0 ? `− (${term(s.c, s.s)}) · g` : `− ${term(s.c, s.s)} · g`, coefs: Array.from({ length: cols }, (_, i) => (i < s.s || i > s.s + deg(g) ? null : s.sub[i] ?? q(0))), color: C.r })
    const top = s.s + deg(g) - 1
    rows.push({ label: '=', coefs: Array.from({ length: cols }, (_, i) => (i > top ? null : s.rem[i] ?? q(0))), color: C.a, line: true })
  }
  const allText = rows.flatMap((r) => r.coefs.filter(Boolean).map((c) => coefText(c!)))
  const size = Math.min(15, ...allText.map((s) => ((cw - 6) * 15) / Math.max(textW(s, 15), 1)))
  const h = 58 + rows.length * 28 + 54
  const { q: quo, r: rem } = pDivMod(F, f, g)
  return (
    <Pic h={h} label={t('Pembagian panjang', 'Long division')}>
      {Array.from({ length: cols }, (_, i) => <T key={i} x={cx(i)} y={30} size={13} weight={700} color={C.mu}>{term(q(1), i)}</T>)}
      <path d={`M${x0},40 H${x0 + cols * cw}`} stroke={C.ln} />
      {rows.map((r, k) => {
        const y = 62 + k * 28
        return (
          <g key={k}>
            {r.line && <path d={`M${x0},${y - 19} H${x0 + cols * cw}`} stroke={C.ln} strokeWidth="1.2" />}
            <T x={x0 - 10} y={y} anchor="end" size={Math.min(14, (14 * (lw - 10)) / Math.max(textW(r.label, 14), 1))} weight={600} color={r.color}>{r.label}</T>
            {r.coefs.map((c, i) => c && <T key={i} x={cx(i)} y={y} size={size} weight={k === rows.length - 1 ? 700 : 400} color={qZero(c) ? C.mu : k === rows.length - 1 && k > 0 ? C.v : r.color}>{coefText(c)}</T>)}
          </g>
        )
      })}
      <T x={20} y={h - 32} anchor="start" size={15} weight={700} color={C.a}>q = {polyText(quo)}</T>
      <T x={20} y={h - 10} anchor="start" size={15} weight={700} color={C.v}>r = {polyText(rem)}{'   '}({t('derajat', 'degree')} {deg(rem) < 0 ? '−∞' : deg(rem)} &lt; {deg(g)})</T>
    </Pic>
  )
}

export function PolynomialLab() {
  const t = useT()
  const [fieldId, setFieldId] = useState('Z2')
  const [fText, setFText] = useState('x^2 + x + 1')
  const [gText, setGText] = useState('x + 1')
  const field = FIELDS.find((x) => x.id === fieldId)!
  const F = field.f
  const f = useMemo(() => parsePoly(fText, F), [fText, F])
  const g = useMemo(() => parsePoly(gText, F), [gText, F])
  const ok = !!f && !!g && !isZeroPoly(g)
  const irr = f && deg(f) >= 1 ? (F.kind === 'Zp' ? zpIrreducible(F.p, f) : qIrreducible(f)) : null
  const p = F.kind === 'Zp' ? F.p : 0
  const ring = useMemo(() => (f && F.kind === 'Zp' && deg(f) >= 1 && p ** deg(f) <= 27 ? ringPolyQuotient(p, f) : null), [f, F, p])
  const ringInfo = ring ? ringInvariants(ring) : null

  const reasonText = (r: NonNullable<typeof irr>) => {
    const k = r.reason
    if (k === 'linear') return t('berderajat 1, selalu tak tereduksi.', 'degree 1, always irreducible.')
    if (k === 'root') return t(`mempunyai akar ${r.detail}, jadi (x − ${r.detail}) membagi f: tereduksi.`, `has the root ${r.detail}, so (x − ${r.detail}) divides f: reducible.`)
    if (k === 'no-root') return t('derajat ≤ 3 tanpa akar ⇒ tak tereduksi (faktor sejati pasti linear).', 'degree ≤ 3 with no root ⇒ irreducible (a proper factor would be linear).')
    if (k === 'factor') return t('tereduksi: ada faktor monik berderajat ≥ 2.', 'reducible: it has a monic factor of degree ≥ 2.')
    if (k === 'no-factor') return t('tidak ada faktor monik berderajat ≤ deg/2 ⇒ tak tereduksi.', 'no monic factor of degree ≤ deg/2 ⇒ irreducible.')
    if (k === 'eisenstein') return t(`tak tereduksi oleh kriteria Eisenstein dengan p = ${r.detail}.`, `irreducible by Eisenstein's criterion with p = ${r.detail}.`)
    if (k === 'mod-p') return t(`tak tereduksi karena reduksinya modulo ${r.detail} tak tereduksi (derajat tetap).`, `irreducible because its reduction mod ${r.detail} is irreducible (degree kept).`)
    return t('uji akar rasional, Eisenstein dan reduksi mod p (p ≤ 13) tidak memutuskan; f mungkin hasil kali dua kuadrat.', 'the rational-root, Eisenstein and mod-p (p ≤ 13) tests are inconclusive; f may be a product of two quadratics.')
  }

  type Step = { text: ReactNode; tex?: string; tone?: 'good' | 'bad' }
  const divisionSteps = (): Step[] => {
    if (!ok) return []
    const st = pDivSteps(F, f!, g!)
    const { q: quo, r } = pDivMod(F, f!, g!)
    return [
      ...st.slice(0, 5).map((s, i) => ({
        text: i === 0 ? t('Bagi suku terdepan sisa dengan suku terdepan g, lalu kurangkan hasil kali itu dengan g.', 'Divide the leading term of what is left by the leading term of g, then subtract that times g.')
          : t('Ulangi dengan sisa yang baru.', 'Repeat with the new remainder.'),
        tex: `${term(s.c, s.s).replace(/([⁰-⁹]+)/g, (m) => `^{${[...m].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`).replace(/−/g, '-')}\\cdot g = ${polyTex(s.sub)},\\quad \\text{${t('sisa', 'left')}}: ${polyTex(s.rem)}`,
      })),
      ...(st.length > 5 ? [{ text: t(`… ${st.length - 5} langkah lagi.`, `… ${st.length - 5} more steps.`) }] : []),
      { text: t('Berhenti ketika derajat sisa < derajat g.', 'Stop once the remainder has degree < deg g.'), tex: `f = (${polyTex(quo)})\\,g + (${polyTex(r)})`, tone: r.length ? undefined : 'good' as const },
    ]
  }
  const euclidSteps = (): Step[] => {
    if (!ok || isZeroPoly(f!)) return []
    const e = pExtGcd(F, f!, g!)
    return [
      { text: t('Algoritma Euclid: bagi, lalu bagi pembagi dengan sisanya, sampai sisa 0.', 'Euclid: divide, then divide the divisor by the remainder, until the remainder is 0.'), tex: `\\begin{aligned}${e.rows.slice(0, 6).map((r) => `${polyTex(r.a)} &= (${polyTex(r.q)})(${polyTex(r.b)}) + ${polyTex(r.r) === '0' ? '0' : `(${polyTex(r.r)})`}`).join('\\\\')}\\end{aligned}` },
      { text: t('Sisa tak nol terakhir, dibuat monik, adalah fpb.', 'The last nonzero remainder, made monic, is the gcd.'), tex: `\\gcd(f, g) = ${polyTex(e.g)}` },
      { text: t('Mundur lewat langkah-langkah itu memberi Bézout: fpb sebagai kombinasi f dan g.', 'Working back up gives Bézout: the gcd as a combination of f and g.'), tex: `(${polyTex(e.s)})\\,f + (${polyTex(e.t)})\\,g = ${polyTex(e.g)}`, tone: deg(e.g) === 0 ? 'good' as const : undefined },
      ...(deg(e.g) === 0 ? [{ text: t('fpb = 1: f dan g relatif prima, jadi g punya invers di F[x]/(f), yaitu koefisien Bézout dari g.', 'gcd = 1: f and g are coprime, so g is invertible in F[x]/(f), with inverse the Bézout coefficient of g.'), tex: `g^{-1} \\equiv ${polyTex(e.t)} \\pmod{f}` }] : []),
    ]
  }
  const irreducibilitySteps = (): Step[] => {
    if (!f || !irr || deg(f) < 1) return []
    const d = deg(f)
    if (d === 1) return [{ text: t('Polinom berderajat 1 selalu tak tereduksi.', 'A polynomial of degree 1 is always irreducible.'), tone: 'good' }]
    if (F.kind === 'Zp') {
      const roots = zpRoots(F.p, f)
      const out: Step[] = [{ text: t(`Faktor linear x − a ada tepat ketika f(a) = 0. Coba semua a di ℤ${F.p}.`, `A linear factor x − a exists exactly when f(a) = 0. Try every a in ℤ${F.p}.`), tex: Array.from({ length: F.p }, (_, a) => `f(${a}) = ${pEval(F, f, q(a)).num}`).join(',\\ ') }]
      if (roots.length) out.push({ text: t(`f(${roots[0]}) = 0, jadi x − ${roots[0]} membagi f: tereduksi.`, `f(${roots[0]}) = 0, so x − ${roots[0]} divides f: reducible.`), tex: `f = (${polyTex(irr.factor!)})(${polyTex(pDivMod(F, f, irr.factor!).q)})`, tone: 'bad' })
      else if (d <= 3) out.push({ text: t('Tidak ada akar, dan faktor sejati dari polinom berderajat 2 atau 3 pasti linear. Jadi f tak tereduksi.', 'No root, and a proper factor of a degree 2 or 3 polynomial would be linear. So f is irreducible.'), tone: 'good' })
      else if (irr.factor) out.push({ text: t('Tanpa akar, tetapi pencarian faktor monik berderajat 2 menemukan satu: tereduksi.', 'No root, but searching monic factors of degree 2 finds one: reducible.'), tex: `f = (${polyTex(irr.factor)})(${polyTex(pDivMod(F, f, irr.factor).q)})`, tone: 'bad' })
      else out.push({ text: t(`Tanpa akar, dan tidak ada faktor monik berderajat 2 sampai ${Math.floor(d / 2)}: tak tereduksi.`, `No root, and no monic factor of degree 2 to ${Math.floor(d / 2)}: irreducible.`), tone: 'good' })
      if (irr.irreducible) out.push({ text: t(`Maka (f) maksimal dan ℤ${F.p}[x]/(f) adalah lapangan dengan ${F.p}^${d} = ${F.p ** d} unsur.`, `So (f) is maximal and ℤ${F.p}[x]/(f) is a field with ${F.p}^${d} = ${F.p ** d} elements.`), tex: `\\mathbb{F}_{${F.p ** d}} = \\mathbb{Z}_{${F.p}}[x]/(${polyTex(f)})`, tone: 'good' })
      return out
    }
    const prim = primitive(f), a0 = prim[0], an = prim[d]
    const divs = (n: number) => Array.from({ length: Math.abs(n) }, (_, i) => i + 1).filter((k) => n % k === 0)
    const cands = a0 === 0 ? [q(0)] : [...new Map(divs(a0).flatMap((r) => divs(an).flatMap((s) => [q(r, s), q(-r, s)])).map((x) => [`${x.num}/${x.den}`, x])).values()]
    const roots = cands.filter((x) => qZero(pEval(F, f, x)))
    const out: Step[] = [
      { text: t('Lemma Gauss: kalikan dengan penyebut dan bagi dengan FPB koefisien; cukup uji polinom bulat primitif.', "Gauss's lemma: clear denominators and divide out the content; testing the primitive integer polynomial is enough."), tex: `${polyTex(prim.map((c) => q(c)))}` },
      { text: t(`Uji akar rasional: akar r/s harus memenuhi r | ${a0}, s | ${an}. Ada ${cands.length} calon.`, `Rational root test: a root r/s needs r | ${a0}, s | ${an}. There are ${cands.length} candidates.`), tex: cands.slice(0, 8).map((x) => `f(${qTex(x)}) = ${qTex(pEval(F, f, x))}`).join(',\\ ') + (cands.length > 8 ? ',\\ \\dots' : '') },
    ]
    if (roots.length) { out.push({ text: t(`${coefText(roots[0])} akar, jadi f punya faktor linear: tereduksi.`, `${coefText(roots[0])} is a root, so f has a linear factor: reducible.`), tone: 'bad' }); return out }
    out.push({ text: d <= 3 ? t('Tidak ada akar rasional dan derajat ≤ 3: tak tereduksi atas ℚ.', 'No rational root and degree ≤ 3: irreducible over ℚ.') : t('Tidak ada akar rasional, jadi tidak ada faktor linear. Faktor kuadrat masih mungkin.', 'No rational root, so no linear factor. Quadratic factors are still possible.'), tone: d <= 3 ? 'good' : undefined })
    if (d > 3) {
      const es = eisenstein(prim)
      if (es) out.push({ text: es.ok ? t(`Eisenstein dengan p = ${es.p}: ${es.p} membagi semua koefisien kecuali terdepan, ${es.p} ∤ ${an}, ${es.p * es.p} ∤ ${a0}. Tak tereduksi.`, `Eisenstein with p = ${es.p}: ${es.p} divides every coefficient but the leading one, ${es.p} ∤ ${an}, ${es.p * es.p} ∤ ${a0}. Irreducible.`) : t(`Eisenstein dengan p = ${es.p} gagal (lihat kotak merah). Eisenstein hanya syarat cukup.`, `Eisenstein with p = ${es.p} fails (see the red boxes). Eisenstein is only sufficient.`), tone: es.ok ? 'good' : undefined })
      if (irr.reason === 'mod-p') out.push({ text: t(`Reduksi modulo ${irr.detail}: hasilnya tak tereduksi di ℤ${irr.detail}[x] dengan derajat sama, maka f tak tereduksi atas ℚ.`, `Reduce mod ${irr.detail}: the result is irreducible in ℤ${irr.detail}[x] with the same degree, so f is irreducible over ℚ.`), tex: `\\bar f = ${polyTex(prim.map((c) => q(((c % +irr.detail!) + +irr.detail!) % +irr.detail!)))}\\ \\in \\mathbb{Z}_{${irr.detail}}[x]`, tone: 'good' })
      if (irr.reason === 'undetermined') out.push({ text: reasonText(irr) })
    }
    return out
  }

  return (
    <LabLayout
      picture={
        <>
          {f && deg(f) >= 0 && (
            <PicCard eyebrow={t('Gambar', 'Picture')} title={F.kind === 'Q' ? t('Koefisien f dan uji Eisenstein', 'The coefficients of f and the Eisenstein test') : t(`Koefisien f dan pencarian akar di ℤ${p}`, `The coefficients of f and the root search in ℤ${p}`)}
              caption={F.kind === 'Q' ? t('Hijau: syarat Eisenstein terpenuhi pada kotak itu; merah: gagal.', 'Green: that box meets its Eisenstein condition; red: it fails.') : t('Lingkaran merah: f(a) = 0, jadi a akar dan x − a faktor.', 'Red circle: f(a) = 0, so a is a root and x − a is a factor.')}>
              <CoefficientPicture f={f} F={F} />
            </PicCard>
          )}
          {ok && (
            <PicCard eyebrow={t('Pembagian panjang', 'Long division')} title={<>f ÷ g {t('atas', 'over')} <Tex tex={field.tex} /></>}
              caption={t('Setiap baris merah adalah (suku hasil bagi) · g yang dikurangkan; baris ungu adalah sisanya. Kolom = derajat.', 'Each red row is (quotient term) · g being subtracted; each violet row is what is left. Columns = degrees.')}>
              <DivisionPicture f={f!} g={g!} F={F} />
            </PicCard>
          )}
          {ring && f && (
            <PicCard eyebrow={t('Gelanggang kuosien', 'Quotient ring')} title={<><Tex tex={`${field.tex}[x]/(${polyTex(f)})`} />, {ring.labels.length} {t('unsur', 'elements')}</>}
              caption={ringInfo?.field ? t(`Tidak ada sel merah dan setiap baris tak nol punya satu sel hijau: lapangan dengan ${ring.labels.length} unsur.`, `No red cells and every nonzero row has one green cell: a field with ${ring.labels.length} elements.`) : t('Sel merah: hasil kali 0 dari dua unsur tak nol. f tereduksi, jadi kuosiennya punya pembagi nol.', 'Red cells: a product 0 of two nonzero elements. f is reducible, so the quotient has zero divisors.')}>
              <TablePic heads={ring.labels} text={(r, c) => ring.labels[ring.mul[r][c]]} tone={(r, c) => (ring.mul[r][c] === ring.zero && r && c ? C.r : ring.mul[r][c] === ring.one ? C.g : undefined)} sym="×" label={t('Tabel perkalian kuosien', 'Quotient multiplication table')} maxCell={60} />
            </PicCard>
          )}
        </>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex="F[x]" /></span>} icon={<Grid3x3 size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {FIELDS.map((x) => <Chip key={x.id} active={x.id === fieldId} onClick={() => setFieldId(x.id)}><Tex tex={x.tex} /></Chip>)}
            </div>
            <div className="mt-3 space-y-2">
              {([['f', fText, setFText, f], ['g', gText, setGText, g]] as const).map(([name, text, set, val]) => (
                <label key={name} className="block">
                  <span className="text-[11px] text-slate-400">{name}(x)</span>
                  <TextField value={text} onChange={set} invalid={!val} placeholder="x^3 + 2x - 1" />
                </label>
              ))}
              <p className="text-[11px] text-slate-500">{t('Koefisien bulat (atau pecahan a/b atas ℚ); atas ℤp koefisien direduksi mod p.', 'Integer coefficients (or fractions a/b over ℚ); over ℤp coefficients are reduced mod p.')}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => <Chip key={i} onClick={() => { setFieldId(ex.field); setFText(ex.f); setGText(ex.g) }}>{ex.label}</Chip>)}
            </div>
          </MathCard>
          <MathCard title={t('Ringkasan', 'Summary')} icon={<Divide size={16} />}>
            {ok ? (
              <div className="space-y-1">
                <FormulaBlock tex={`f + g = ${polyTex(pAdd(F, f!, g!))}`} />
                <FormulaBlock tex={`f \\cdot g = ${polyTex(pMul(F, f!, g!))}`} />
                <FormulaBlock tex={`\\gcd(f, g) = ${polyTex(pGcd(F, f!, g!))}`} />
              </div>
            ) : <p className="text-xs text-rose-300">{t('Masukan tidak valid (g ≠ 0 diperlukan).', 'Invalid input (g ≠ 0 required).')}</p>}
            {f && irr && (
              <p className={cn('mt-2 text-sm', irr.irreducible === true ? 'text-emerald-300' : irr.irreducible === false ? 'text-rose-300' : 'text-amber-300')}>
                f {irr.irreducible === true ? t('tak tereduksi', 'is irreducible') : irr.irreducible === false ? t('tereduksi', 'is reducible') : t('belum ditentukan', 'is undetermined')}{' '}
                <span className="text-xs text-slate-400">{t('atas', 'over')} <Tex tex={field.tex} />: {reasonText(irr)}</span>
              </p>
            )}
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Langkah demi langkah: pembagian', 'Step by step: division')} icon={<ListOrdered size={16} />}>
            {ok ? <Steps steps={divisionSteps()} /> : <p className="text-xs text-rose-300">{t('Masukan tidak valid.', 'Invalid input.')}</p>}
          </MathCard>
          <MathCard title={t('Langkah demi langkah: fpb dan Bézout', 'Step by step: gcd and Bézout')} icon={<ListOrdered size={16} />}>
            {ok ? <Steps steps={euclidSteps()} /> : <p className="text-xs text-rose-300">{t('Masukan tidak valid.', 'Invalid input.')}</p>}
          </MathCard>
          <MathCard title={t('Langkah demi langkah: ketertereduksian f', 'Step by step: is f irreducible?')} icon={<ListOrdered size={16} />}>
            {f && deg(f) >= 1 ? <Steps steps={irreducibilitySteps()} /> : <p className="text-xs text-slate-500">{t('Masukkan f berderajat ≥ 1.', 'Enter f of degree ≥ 1.')}</p>}
          </MathCard>
          <MathCard title={t('Polinom atas ℚ (Herstein 4.6)', 'Polynomials over ℚ (Herstein 4.6)')} icon={<BookOpen size={16} />} className="lg:col-span-3">
            <div className="grid gap-3 text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
              {t(
                <>
                  <p><Tex tex="F[x]/(f)" /> lapangan iff <Tex tex="f" /> tak tereduksi (4.5): maka <Tex tex="(f)" /> maksimal. Atas <Tex tex="\mathbb{Z}_p" /> ini menghasilkan lapangan berhingga dengan <Tex tex="p^{\deg f}" /> unsur.</p>
                  <p>Lemma Gauss: polinom bulat primitif yang tereduksi atas <Tex tex="\mathbb{Q}" /> tereduksi pula atas <Tex tex="\mathbb{Z}" />. Uji akar rasional: akar <Tex tex="r/s" /> mengharuskan <Tex tex="r \mid a_0,\ s \mid a_n" />.</p>
                  <p>Kriteria Eisenstein: bila prima <Tex tex="p" /> membagi <Tex tex="a_0,\dots,a_{n-1}" />, <Tex tex="p \nmid a_n" />, <Tex tex="p^2 \nmid a_0" />, maka <Tex tex="f" /> tak tereduksi atas <Tex tex="\mathbb{Q}" />.</p>
                  <p>Reduksi mod <Tex tex="p" />: jika <Tex tex="\bar f \in \mathbb{Z}_p[x]" /> tak tereduksi dengan derajat sama, maka <Tex tex="f" /> tak tereduksi atas <Tex tex="\mathbb{Q}" /> (kebalikannya tidak berlaku).</p>
                </>,
                <>
                  <p><Tex tex="F[x]/(f)" /> is a field iff <Tex tex="f" /> is irreducible (4.5): then <Tex tex="(f)" /> is maximal. Over <Tex tex="\mathbb{Z}_p" /> this gives a finite field with <Tex tex="p^{\deg f}" /> elements.</p>
                  <p>Gauss's lemma: a primitive integer polynomial reducible over <Tex tex="\mathbb{Q}" /> is reducible over <Tex tex="\mathbb{Z}" />. Rational root test: a root <Tex tex="r/s" /> needs <Tex tex="r \mid a_0,\ s \mid a_n" />.</p>
                  <p>Eisenstein's criterion: if a prime <Tex tex="p" /> divides <Tex tex="a_0,\dots,a_{n-1}" />, <Tex tex="p \nmid a_n" />, <Tex tex="p^2 \nmid a_0" />, then <Tex tex="f" /> is irreducible over <Tex tex="\mathbb{Q}" />.</p>
                  <p>Reduction mod <Tex tex="p" />: if <Tex tex="\bar f \in \mathbb{Z}_p[x]" /> is irreducible of the same degree, then <Tex tex="f" /> is irreducible over <Tex tex="\mathbb{Q}" /> (the converse fails).</p>
                </>,
              )}
            </div>
          </MathCard>
        </div>
      }
    />
  )
}
