import { AnimatePresence, motion } from 'framer-motion'
import { LangProvider, useT } from './lib/i18n'
import { href, navigate, useRoute } from './lib/router'
import { cn } from './lib/utils'
import { TabNav, LangToggle, ThemeToggle, TABS, type TabId } from './components/navigation/TabNav'
import { ComplexModule } from './components/complex/ComplexModule'
import { AlgebraModule } from './components/algebra/AlgebraModule'
import { Landing } from './pages/Landing'
import { Summary } from './pages/Summary'
import { About } from './pages/About'
import { GeometryStudio } from './pages/GeometryStudio'
import { ComplexStudio } from './pages/ComplexStudio'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const MODULES: Partial<Record<TabId, () => React.JSX.Element>> = { complex: ComplexModule, algebra: AlgebraModule }

const INTRO: Partial<Record<TabId, { id: [string, string]; en: [string, string] }>> = {
  complex: {
    id: ['Lihat fungsi kompleks bekerja.', 'Pemetaan w = f(z), pewarnaan domain, uji Cauchy-Riemann, dan teorema residu yang diverifikasi secara numerik. Ketik fungsi Anda sendiri.'],
    en: ['Watch complex functions work.', 'Mappings w = f(z), domain colouring, Cauchy-Riemann checks and the residue theorem verified numerically. Type your own function.'],
  },
  algebra: {
    id: ['Struktur grup dan gelanggang, dihitung langsung.', 'Tabel Cayley, koset, grup faktor, isomorfisma, permutasi, ideal dan polinom mengikuti Herstein.'],
    en: ['Group and ring structure, computed live.', 'Cayley tables, cosets, factor groups, isomorphisms, permutations, ideals and polynomials, following Herstein.'],
  },
}

function Workbench({ tab }: { tab: TabId }) {
  const t = useT()
  const Module = MODULES[tab]!
  const meta = TABS.find((x) => x.id === tab)!
  const intro = INTRO[tab]!
  return (
    <div className="space-y-5">
      <TabNav active={tab} onChange={(id) => navigate({ page: 'app', tab: id })} />
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-5">
          <section className="pt-2">
            <span className="eyebrow">{t('Modul', 'Module')} {meta.num} · {t(meta.id_label, meta.en_label)}</span>
            <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t(intro.id[0], intro.en[0])}</h1>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-slate-400">{t(intro.id[1], intro.en[1])}</p>
          </section>
          <Module />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** Studio = type objects from a problem and get answers with working; one per course that needs it. */
function StudioPage({ tab }: { tab: 'geometry' | 'complex' }) {
  const t = useT()
  return <div className="space-y-4">
    <nav aria-label={t('Pilih studio', 'Choose a studio')} className="flex flex-wrap gap-2 pt-2">
      {([['geometry', t('Geometri Analitik', 'Analytic Geometry')], ['complex', t('Fungsi Kompleks', 'Complex Functions')]] as const).map(([id, label]) =>
        <a key={id} href={href({ page: 'studio', tab: id })} aria-current={tab === id ? 'page' : undefined} className={cn('rounded-full border px-4 py-2 text-sm no-underline', tab === id ? 'border-accent bg-accent-soft text-accent' : 'border-border text-slate-300 hover:border-accent')}>{label}</a>)}
    </nav>
    {tab === 'complex' ? <ComplexStudio /> : <GeometryStudio />}
  </div>
}

function Shell() {
  const t = useT()
  const route = useRoute()
  const tab: TabId = route.page === 'app' && route.tab && route.tab in MODULES ? (route.tab as TabId) : 'complex'
  const links = [
    { r: { page: 'home' } as const, label: t('Beranda', 'Home') },
    { r: { page: 'app', tab } as const, label: t('Laboratorium', 'Workbench') },
    { r: { page: 'studio' } as const, label: t('Studio', 'Studio') },
    { r: { page: 'summary' } as const, label: t('Ringkasan', 'Summary') },
    { r: { page: 'about' } as const, label: t('Tentang', 'About') },
  ]
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus();document.getElementById('main-content')?.scrollIntoView()}} className="skip-link">{t('Lewati ke konten','Skip to content')}</a>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-5 px-4 sm:px-6">
          <a href="#/" className="font-display flex items-center text-[26px] tracking-tight text-slate-100 no-underline">
            Analytica<span className="text-accent">.</span>
          </a>
          <nav aria-label={t('Navigasi utama','Main navigation')} className="ml-2 hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a key={l.label} href={href(l.r)} aria-current={route.page===l.r.page?'page':undefined} className={cn('rounded-full px-3 py-1.5 text-[13px] no-underline transition-colors', route.page === l.r.page ? 'bg-accent-soft text-accent' : 'text-slate-400 hover:text-slate-100')}>
                {l.label}
              </a>
            ))}
          </nav>
          <span className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </span>
        </div>
        <nav aria-label={t('Navigasi seluler','Mobile navigation')} className="mobile-nav lg:hidden">{links.map(l=><a key={l.label} href={href(l.r)} aria-current={route.page===l.r.page?'page':undefined}>{l.label}</a>)}</nav>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {route.page === 'home' && <Landing />}
        {route.page === 'studio' && <StudioPage tab={route.tab === 'complex' ? 'complex' : 'geometry'} />}
        {route.page === 'app' && <Workbench tab={tab} />}
        {route.page === 'summary' && <Summary section={route.section} />}
        {route.page === 'about' && <About />}
      </main>

      <footer className="border-t border-border px-4 py-4 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
        Brown &amp; Churchill · Vaisman · Herstein
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
      <Analytics />
      <SpeedInsights />
    </LangProvider>
  )
}
