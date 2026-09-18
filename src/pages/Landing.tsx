import { ArrowRight, BookOpen, Box, PenLine, Sigma, Waves } from 'lucide-react'
import { useT } from '../lib/i18n'
import { href } from '../lib/router'
import { Tex } from '../components/ui/FormulaBlock'

const MODULES = [
  { id: 'complex', num: '01', icon: Waves, title: { id: 'Fungsi Kompleks', en: 'Complex Functions' }, tex: '\\oint_C f(z)\\,dz = 2\\pi i \\sum \\operatorname{Res}', body: { id: 'Pemetaan w = f(z), pewarnaan domain, uji Cauchy-Riemann, singularitas dan residu yang diverifikasi numerik.', en: 'Mappings w = f(z), domain colouring, Cauchy-Riemann checks, singularities and numerically verified residues.' } },
  { id: 'geometry', num: '02', icon: Box, title: { id: 'Geometri Analitik', en: 'Analytic Geometry' }, tex: '\\xi^t A\\xi + 2a^t\\xi + \\alpha = 0', body: { id: 'Garis dan bidang di R³, lingkaran dan kuasa titik, konik dan kuadrik umum yang direduksi ke bentuk kanonik, transformasi afin.', en: 'Lines and planes in R³, circles and power of a point, general conics and quadrics reduced to canonical form, affine maps.' } },
  { id: 'algebra', num: '03', icon: Sigma, title: { id: 'Aljabar', en: 'Algebra' }, tex: 'G/\\ker\\varphi \\cong \\varphi(G)', body: { id: 'Tabel Cayley, koset dan Lagrange, grup faktor, isomorfisma, grup simetri, ideal Zₙ dan gelanggang polinom.', en: 'Cayley tables, cosets and Lagrange, factor groups, isomorphisms, symmetric groups, ideals of Zₙ and polynomial rings.' } },
]

export function Landing() {
  const t = useT()
  return (
    <div className="space-y-14 py-6">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="eyebrow">{t('Laboratorium visual · tiga mata kuliah', 'Visual workbench · three courses')}</span>
          <h1 className="font-display mt-4 text-[clamp(40px,6vw,76px)] text-slate-100">
            {t(<>Lihat rumusnya <em className="text-accent">bergerak</em>.</>, <>Watch the formula <em className="text-accent">move</em>.</>)}
          </h1>
          <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-slate-400">
            {t('Analytica menggambar apa yang ada di buku Brown & Churchill, Vaisman, dan Herstein: fungsi kompleks sebagai peta warna, kuadrik yang berputar ke kerangka kanoniknya, grup yang tabelnya diwarnai menurut koset. Ketik fungsi atau persamaan dari soal Anda dan lihat hasilnya langsung.',
               'Analytica draws what is in Brown & Churchill, Vaisman and Herstein: complex functions as colour maps, quadrics rotating into their canonical frame, groups whose tables are coloured by coset. Type a function or an equation from your problem set and see it immediately.')}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href={href({ page: 'app', tab: 'complex' })} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-medium text-accent-ink no-underline hover:opacity-90">
              {t('Buka laboratorium', 'Open the workbench')} <ArrowRight size={16} />
            </a>
            <a href={href({ page: 'summary' })} className="inline-flex items-center gap-2 text-sm text-slate-300 no-underline hover:text-slate-100">
              <BookOpen size={15} /> {t('Ringkasan rumus', 'Formula summary')}
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-6 text-[11px] text-slate-500">
            {[
              { b: '3', s: t('mata kuliah, 11 laboratorium', 'courses, 11 labs') },
              { b: 'ID / EN', s: t('teks teori dua bahasa', 'bilingual theory text') },
              { b: '0 server', s: t('semua hitungan di peramban Anda', 'every computation in your browser') },
            ].map((x) => <li key={x.b}><b className="block font-display text-[22px] tracking-tight text-slate-100">{x.b}</b>{x.s}</li>)}
          </ul>
        </div>
        <div className="stage relative overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-stage)]" style={{ background: 'var(--stage-bg)' }}>
          <Hero />
        </div>
      </section>

      <section>
        <span className="eyebrow">{t('Modul', 'Modules')}</span>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <a key={m.id} href={href({ page: 'app', tab: m.id })} className="group rounded-[var(--radius)] border border-border bg-card p-5 no-underline shadow-[var(--shadow-sm)] transition-colors hover:border-slate-700">
              <div className="flex items-center gap-2 text-slate-500"><span className="section-number">{m.num}</span><m.icon size={15} className="text-accent" /></div>
              <h3 className="font-display mt-3 text-[26px] text-slate-100">{t(m.title.id, m.title.en)}</h3>
              <div className="mt-2 text-slate-300"><Tex tex={m.tex} /></div>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{t(m.body.id, m.body.en)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-slate-300 group-hover:text-accent">{t('Buka', 'Open')} <ArrowRight size={13} /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[var(--radius-lg)] border border-border bg-slate-900 p-6 md:grid-cols-3 md:p-8">
        {[
          { icon: PenLine, h: t('Masukan dari soal', 'Input from your problems'), p: t('Ketik f(z) = (z²+1)/(z(z−2)²), tempel 5x² + 24xy − 2y² + 4x − 1 = 0, atau bangun ⟨(1 2 3 4), (1 3)⟩. Semuanya diurai dan dihitung, bukan dicari di tabel.', 'Type f(z) = (z²+1)/(z(z−2)²), paste 5x² + 24xy − 2y² + 4x − 1 = 0, or build ⟨(1 2 3 4), (1 3)⟩. Everything is parsed and computed, not looked up.') },
          { icon: BookOpen, h: t('Notasi buku', 'Textbook notation'), p: t('Matriks kecil A dan besar Ã, invarian δ dan Δ, koset kanan Ha, hasil kali permutasi kanan-ke-kiri: mengikuti Vaisman dan Herstein persis seperti di kuliah.', 'Small matrix A and large Ã, invariants δ and Δ, right cosets Ha, right-to-left permutation products: following Vaisman and Herstein exactly as taught.') },
          { icon: Sigma, h: t('Diverifikasi', 'Verified'), p: t('Contoh 3.4.3 Vaisman, hasil kali στ Herstein, dan teorema residu diuji otomatis; angka yang Anda lihat cocok dengan buku.', 'Vaisman Example 3.4.3, Herstein\'s στ product and the residue theorem are checked automatically; the numbers you see agree with the books.') },
        ].map((x) => (
          <div key={x.h}>
            <x.icon size={18} className="text-accent" />
            <h4 className="mt-3 text-sm font-semibold text-slate-100">{x.h}</h4>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{x.p}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

/** Decorative hero: a domain-colouring style radial sweep drawn with CSS only. */
function Hero() {
  const t = useT()
  return (
    <div className="relative aspect-[5/4] w-full">
      <div className="absolute inset-0" style={{ background: 'conic-gradient(from 0deg at 62% 45%, #ff4d4d, #ffd24d, #4dff88, #4dd2ff, #7a4dff, #ff4dd2, #ff4d4d)', filter: 'saturate(0.9)' }} />
      <div className="absolute inset-0" style={{ background: 'repeating-radial-gradient(circle at 62% 45%, rgba(0,0,0,0) 0 26px, rgba(0,0,0,0.28) 26px 28px)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 62% 45%, rgba(0,0,0,0.9) 0 4px, transparent 6px), radial-gradient(circle at 25% 62%, rgba(255,255,255,0.95) 0 5px, transparent 7px), linear-gradient(to top, rgba(10,12,24,0.85), transparent 55%)' }} />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="eyebrow" style={{ color: 'var(--stage-muted)' }}>{t('pewarnaan domain', 'domain colouring')}</div>
        <div className="mt-1 text-[15px] text-[var(--stage-fg)]"><Tex tex="f(z) = \frac{z - 1}{z + 1}" /></div>
      </div>
    </div>
  )
}
