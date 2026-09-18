import { useMemo, useState } from 'react'
import { BookOpen, Divide, Grid3x3 } from 'lucide-react'
import {
  deg, isZeroPoly, pAdd, pDivMod, pGcd, pMul, parsePoly, polyTex, qIrreducible, zpIrreducible, zpRoots, q, range, trim,
  type Field, type Poly,
} from '../../lib/rings'
import { useT } from '../../lib/i18n'
import { cn } from '../../lib/utils'
import { Layout } from '../ui/Layout'
import { MathCard, Chip } from '../ui/MathCard'
import { Tex, FormulaBlock } from '../ui/FormulaBlock'

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
  { field: 'Q', f: 'x^4 + 2x^2 + 2', g: 'x^2 + 1', label: 'Eisenstein p=2' },
  { field: 'Q', f: 'x^3 - 2', g: 'x - 1', label: 'x³ − 2' },
  { field: 'Q', f: '2x^3 - 3x^2 - 3x + 2', g: 'x + 1', label: 'akar rasional' },
  { field: 'Q', f: 'x^4 + 4', g: 'x^2 + 2x + 2', label: 'x⁴ + 4' },
]

const HUES = (n: number, i: number) => `hsl(${(i * 360) / n} 70% 55%)`

/** All polynomials of degree < d over Z_p, indexed like base-p numbers. */
function residues(p: number, d: number): Poly[] {
  return range(p ** d).map((k) => trim(range(d).map((i) => q(Math.floor(k / p ** i) % p))))
}
const residueIndex = (p: number, r: Poly) => r.reduce((acc, c, i) => acc + c.num * p ** i, 0)

export function PolynomialLab() {
  const t = useT()
  const [fieldId, setFieldId] = useState('Z2')
  const [fText, setFText] = useState('x^2 + x + 1')
  const [gText, setGText] = useState('x + 1')
  const field = FIELDS.find((x) => x.id === fieldId)!
  const F = field.f
  const f = useMemo(() => parsePoly(fText, F), [fText, F])
  const g = useMemo(() => parsePoly(gText, F), [gText, F])
  const ok = f && g && !isZeroPoly(g)
  const dm = ok ? pDivMod(F, f!, g!) : null
  const irr = f && deg(f) >= 1 ? (F.kind === 'Zp' ? zpIrreducible(F.p, f) : qIrreducible(f)) : null
  const p = F.kind === 'Zp' ? F.p : 0
  const showQuotient = f && F.kind === 'Zp' && deg(f) >= 1 && p ** deg(f) <= 27
  const res = showQuotient ? residues(p, deg(f!)) : []
  const mulRes = (a: Poly, b: Poly) => pDivMod(F, pMul(F, a, b), f!).r

  const reasonText = (r: NonNullable<typeof irr>) => {
    const k = r.reason
    if (k === 'linear') return t('berderajat 1, selalu tak tereduksi.', 'degree 1, always irreducible.')
    if (k === 'root') return t(`mempunyai akar ${r.detail} di lapangan, jadi (x − ${r.detail}) membagi f: tereduksi.`, `has the root ${r.detail} in the field, so (x − ${r.detail}) divides f: reducible.`)
    if (k === 'no-root') return t('derajat ≤ 3 tanpa akar di lapangan ⇒ tak tereduksi (faktor sejati harus linear).', 'degree ≤ 3 with no root in the field ⇒ irreducible (a proper factor would be linear).')
    if (k === 'factor') return t(`tereduksi: faktor monik ${polyTex(r.factor!)} ditemukan dengan pencarian.`, `reducible: the monic factor ${polyTex(r.factor!)} was found by search.`)
    if (k === 'no-factor') return t('tidak ada faktor monik berderajat ≤ deg/2 ⇒ tak tereduksi.', 'no monic factor of degree ≤ deg/2 ⇒ irreducible.')
    if (k === 'eisenstein') return t(`tak tereduksi atas Q oleh kriteria Eisenstein dengan p = ${r.detail}.`, `irreducible over Q by Eisenstein's criterion with p = ${r.detail}.`)
    if (k === 'mod-p') return t(`tak tereduksi atas Q karena reduksinya modulo ${r.detail} tak tereduksi atas Z${r.detail} (derajat tetap).`, `irreducible over Q because its reduction mod ${r.detail} is irreducible over Z${r.detail} (degree preserved).`)
    return t('uji akar rasional, Eisenstein, dan reduksi mod p (p ≤ 13) tidak memutuskan; f mungkin masih tereduksi (mis. hasil kali dua kuadrat).', 'rational-root, Eisenstein and mod-p (p ≤ 13) tests are inconclusive; f may still be reducible (e.g. a product of two quadratics).')
  }

  return (
    <Layout
      canvas={
        <div className="h-full w-full overflow-auto p-4">
          {showQuotient && f ? (
            <>
              <p className="mb-2 text-xs text-slate-400">
                <Tex tex={`${field.tex}[x]/(${polyTex(f)})`} />: {t('tabel perkalian residu (derajat', 'multiplication table of residues (degree')} &lt; {deg(f)}), {res.length} {t('unsur', 'elements')}.
                {irr?.irreducible ? t(' Karena f tak tereduksi, (f) maksimal dan kuosiennya lapangan ', ' Since f is irreducible, (f) is maximal and the quotient is a field ') : t(' f tereduksi: ada pembagi nol (sel bernilai 0 di luar baris/kolom 0).', ' f is reducible: there are zero divisors (0 cells off the zero row/column).')}
                {irr?.irreducible && <Tex tex={`\\mathbb{F}_{${res.length}}`} />}
              </p>
              <table className="border-separate border-spacing-0.5 font-mono text-[10px]">
                <thead><tr><th className="text-slate-500">·</th>{res.map((r, i) => <th key={i} className="px-1 font-normal text-slate-300"><Tex tex={polyTex(r)} /></th>)}</tr></thead>
                <tbody>
                  {res.map((a, i) => (
                    <tr key={i}>
                      <th className="px-1 font-normal text-slate-300"><Tex tex={polyTex(a)} /></th>
                      {res.map((b, j) => {
                        const r = mulRes(a, b)
                        const idx = residueIndex(p, r)
                        return <td key={j} className={cn('rounded-sm px-1 text-center text-slate-900', idx === 0 && i && j && 'ring-2 ring-rose-400')} style={{ background: HUES(res.length, idx) }}><Tex tex={polyTex(r)} /></td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('Tabel gelanggang kuosien ditampilkan untuk Z_p[x]/(f) dengan p^deg f ≤ 27.', 'The quotient-ring table is shown for Z_p[x]/(f) with p^deg f ≤ 27.')}</p>
          )}
        </div>
      }
      controls={
        <div className="space-y-4">
          <MathCard title={<span><Tex tex="F[x]" /></span>} icon={<Grid3x3 size={16} />}>
            <div className="flex flex-wrap gap-1.5">
              {FIELDS.map((x) => <Chip key={x.id} active={x.id === fieldId} onClick={() => setFieldId(x.id)}><Tex tex={x.tex} /></Chip>)}
            </div>
            <div className="mt-3 space-y-2">
              {[['f', fText, setFText, f], ['g', gText, setGText, g]].map(([name, text, set, val]) => (
                <label key={name as string} className="block">
                  <span className="text-[11px] text-slate-400">{name as string}(x)</span>
                  <input value={text as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} className={`mt-0.5 w-full rounded-md border bg-slate-900/60 px-2 py-1 font-mono text-sm text-slate-100 outline-none ${val ? 'border-border' : 'border-rose-500/60'}`} placeholder="x^3 + 2x - 1" />
                </label>
              ))}
              <p className="text-[11px] text-slate-500">{t('Koefisien bulat (atau pecahan a/b atas Q); atas Z_p koefisien direduksi mod p.', 'Integer coefficients (or fractions a/b over Q); over Z_p coefficients are reduced mod p.')}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex, i) => <Chip key={i} onClick={() => { setFieldId(ex.field); setFText(ex.f); setGText(ex.g) }}>{ex.label}</Chip>)}
            </div>
          </MathCard>
        </div>
      }
      theory={
        <div className="grid gap-4 lg:grid-cols-3">
          <MathCard title={t('Aritmetika & algoritma pembagian', 'Arithmetic & division algorithm')} icon={<Divide size={16} />}>
            {ok && dm ? (
              <div className="space-y-1">
                <FormulaBlock tex={`f + g = ${polyTex(pAdd(F, f!, g!))}`} />
                <FormulaBlock tex={`f \\cdot g = ${polyTex(pMul(F, f!, g!))}`} />
                <FormulaBlock tex={`f = (${polyTex(dm.q)})\\,g + (${polyTex(dm.r)})`} />
                <FormulaBlock tex={`\\gcd(f, g) = ${polyTex(pGcd(F, f!, g!))}`} />
                <p className="text-xs text-slate-400">
                  {t(<>Algoritma pembagian: untuk <Tex tex="g \neq 0" /> ada tunggal <Tex tex="q, r" /> dengan <Tex tex="f = qg + r" />, <Tex tex="r = 0" /> atau <Tex tex="\deg r < \deg g" />. Akibatnya <Tex tex="F[x]" /> adalah daerah ideal utama: setiap ideal berbentuk <Tex tex="(h)" />, dan <Tex tex="\gcd" /> diperoleh dengan algoritma Euclid.</>,
                     <>Division algorithm: for <Tex tex="g \neq 0" /> there are unique <Tex tex="q, r" /> with <Tex tex="f = qg + r" />, <Tex tex="r = 0" /> or <Tex tex="\deg r < \deg g" />. Hence <Tex tex="F[x]" /> is a principal ideal domain: every ideal is <Tex tex="(h)" />, and <Tex tex="\gcd" /> comes from the Euclidean algorithm.</>)}
                </p>
              </div>
            ) : <p className="text-xs text-rose-300">{t('Masukan tidak valid (g ≠ 0 diperlukan).', 'Invalid input (g ≠ 0 required).')}</p>}
          </MathCard>
          <MathCard title={t('Ketertereduksian f', 'Irreducibility of f')} icon={<Grid3x3 size={16} />}>
            {f && irr ? (
              <div className="space-y-1">
                <FormulaBlock tex={`f(x) = ${polyTex(f)},\\quad \\deg f = ${deg(f)}`} />
                {F.kind === 'Zp' && <FormulaBlock tex={`\\text{${t('akar di', 'roots in')}}\\ \\mathbb{Z}_{${F.p}}: ${zpRoots(F.p, f).length ? `\\{${zpRoots(F.p, f).join(', ')}\\}` : '\\varnothing'}`} />}
                <p className={cn('text-sm', irr.irreducible === true ? 'text-emerald-300' : irr.irreducible === false ? 'text-rose-300' : 'text-amber-300')}>
                  {irr.irreducible === true ? t('Tak tereduksi', 'Irreducible') : irr.irreducible === false ? t('Tereduksi', 'Reducible') : t('Belum ditentukan', 'Undetermined')}
                  <span className="text-xs text-slate-400"> {t('atas', 'over')} <Tex tex={field.tex} />: {reasonText(irr)}</span>
                </p>
                {irr.factor && <FormulaBlock tex={`f = (${polyTex(irr.factor)})\\cdot(${polyTex(pDivMod(F, f, irr.factor).q)})`} />}
              </div>
            ) : <p className="text-xs text-slate-500">{t('Masukkan f berderajat ≥ 1.', 'Enter f of degree ≥ 1.')}</p>}
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t(<><Tex tex="F[x]/(f)" /> lapangan iff <Tex tex="f" /> tak tereduksi (4.5): maka <Tex tex="(f)" /> maksimal. Atas <Tex tex="\mathbb{Z}_p" /> ini menghasilkan lapangan berhingga dengan <Tex tex="p^{\deg f}" /> unsur.</>,
                 <><Tex tex="F[x]/(f)" /> is a field iff <Tex tex="f" /> is irreducible (4.5): then <Tex tex="(f)" /> is maximal. Over <Tex tex="\mathbb{Z}_p" /> this produces a finite field with <Tex tex="p^{\deg f}" /> elements.</>)}
            </p>
          </MathCard>
          <MathCard title={t('Polinom atas Q (Herstein 4.6)', 'Polynomials over Q (Herstein 4.6)')} icon={<BookOpen size={16} />}>
            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              {t(
                <>
                  <p>Lemma Gauss: polinom bulat primitif yang tereduksi atas <Tex tex="\mathbb{Q}" /> tereduksi pula atas <Tex tex="\mathbb{Z}" />. Akibatnya uji faktor cukup dilakukan dengan koefisien bulat.</p>
                  <p>Uji akar rasional: <Tex tex="r/s" /> akar dari <Tex tex="a_nx^n + \cdots + a_0" /> (bulat) mengharuskan <Tex tex="r \mid a_0,\ s \mid a_n" />.</p>
                  <p>Kriteria Eisenstein: bila prima <Tex tex="p" /> membagi <Tex tex="a_0,\dots,a_{n-1}" />, <Tex tex="p \nmid a_n" />, <Tex tex="p^2 \nmid a_0" />, maka <Tex tex="f" /> tak tereduksi atas <Tex tex="\mathbb{Q}" />. Contoh: polinom siklotomik <Tex tex="x^{p-1} + \cdots + x + 1" /> (setelah substitusi <Tex tex="x \mapsto x+1" />).</p>
                  <p>Reduksi mod <Tex tex="p" />: jika <Tex tex="\bar f \in \mathbb{Z}_p[x]" /> tak tereduksi dengan derajat sama, maka <Tex tex="f" /> tak tereduksi atas <Tex tex="\mathbb{Q}" /> (kebalikannya tidak berlaku).</p>
                </>,
                <>
                  <p>Gauss's lemma: a primitive integer polynomial reducible over <Tex tex="\mathbb{Q}" /> is reducible over <Tex tex="\mathbb{Z}" />. So factor tests can be run with integer coefficients.</p>
                  <p>Rational root test: a root <Tex tex="r/s" /> of <Tex tex="a_nx^n + \cdots + a_0" /> (integers) needs <Tex tex="r \mid a_0,\ s \mid a_n" />.</p>
                  <p>Eisenstein's criterion: if a prime <Tex tex="p" /> divides <Tex tex="a_0,\dots,a_{n-1}" />, <Tex tex="p \nmid a_n" />, <Tex tex="p^2 \nmid a_0" />, then <Tex tex="f" /> is irreducible over <Tex tex="\mathbb{Q}" />. Example: the cyclotomic polynomial <Tex tex="x^{p-1} + \cdots + x + 1" /> (after <Tex tex="x \mapsto x+1" />).</p>
                  <p>Reduction mod <Tex tex="p" />: if <Tex tex="\bar f \in \mathbb{Z}_p[x]" /> is irreducible with the same degree, then <Tex tex="f" /> is irreducible over <Tex tex="\mathbb{Q}" /> (the converse fails).</p>
                </>,
              )}
            </div>
          </MathCard>
        </div>
      }
    />
  )
}
