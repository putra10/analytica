import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LangProvider, useT } from './lib/i18n'
import { TabNav, LangToggle, ThemeToggle, TABS, type TabId } from './components/navigation/TabNav'
import { ComplexModule } from './components/complex/ComplexModule'
import { GeometryModule } from './components/geometry/GeometryModule'
import { AlgebraModule } from './components/algebra/AlgebraModule'

const MODULES: Record<TabId, () => React.JSX.Element> = { complex: ComplexModule, geometry: GeometryModule, algebra: AlgebraModule }

const INTRO: Record<TabId, { id: [string, string]; en: [string, string] }> = {
  complex: {
    id: ['Lihat fungsi kompleks bekerja.', 'Pewarnaan domain, kisi konformal, uji Cauchy-Riemann, dan teorema residu yang diverifikasi secara numerik. Ketik fungsi Anda sendiri.'],
    en: ['Watch complex functions work.', 'Domain colouring, conformal grids, Cauchy-Riemann checks and the residue theorem verified numerically. Type your own function.'],
  },
  geometry: {
    id: ['Geometri linear dan kuadratik di R² dan R³.', 'Garis, bidang, lingkaran, konik dan kuadrik umum dengan reduksi ke bentuk kanonik ala Vaisman. Tempel persamaan dari soal.'],
    en: ['Linear and quadratic geometry in R² and R³.', 'Lines, planes, circles, general conics and quadrics reduced to canonical form the Vaisman way. Paste an equation from a problem.'],
  },
  algebra: {
    id: ['Struktur grup dan gelanggang, dihitung langsung.', 'Tabel Cayley, koset, grup faktor, isomorfisma, permutasi, ideal dan polinom mengikuti Herstein.'],
    en: ['Group and ring structure, computed live.', 'Cayley tables, cosets, factor groups, isomorphisms, permutations, ideals and polynomials, following Herstein.'],
  },
}

function Shell() {
  const t = useT()
  const [tab, setTab] = useState<TabId>('complex')
  const Module = MODULES[tab]
  const meta = TABS.find((x) => x.id === tab)!
  const intro = INTRO[tab]
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-5 px-4 sm:px-6">
          <a href="#" className="font-display flex items-center text-[26px] tracking-tight text-slate-100 no-underline">
            Analytica<span className="text-accent">.</span>
          </a>
          <span className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6">
        <TabNav active={tab} onChange={setTab} />
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-5">
            <section className="pt-2">
              <span className="eyebrow">
                {t('Modul', 'Module')} {meta.num} · {t(meta.id_label, meta.en_label)}
              </span>
              <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t(intro.id[0], intro.en[0])}</h1>
              <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-slate-400">{t(intro.id[1], intro.en[1])}</p>
            </section>
            <Module />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border px-4 py-4 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
        {t('Seluruh perhitungan berjalan lokal di peramban · Brown & Churchill · Vaisman · Herstein', 'All computation runs locally in your browser · Brown & Churchill · Vaisman · Herstein')}
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}
