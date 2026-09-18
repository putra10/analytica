import { motion } from 'framer-motion'
import { Box, Moon, Sigma, Sun, Waves } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLang, useT } from '../../lib/i18n'
import { useTheme } from '../../lib/theme'

export const TABS = [
  { id: 'complex', num: '01', id_label: 'Fungsi Kompleks', en_label: 'Complex Functions', icon: Waves },
  { id: 'geometry', num: '02', id_label: 'Geometri Analitik', en_label: 'Analytic Geometry', icon: Box },
  { id: 'algebra', num: '03', id_label: 'Aljabar', en_label: 'Algebra', icon: Sigma },
] as const

export type TabId = (typeof TABS)[number]['id']

export function TabNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const t = useT()
  return (
    <nav className="flex gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow-sm)]" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex flex-1 items-center justify-center rounded-full px-3 py-2 text-[13px] font-medium transition-colors',
            active === tab.id ? 'text-accent-ink' : 'text-slate-400 hover:text-slate-100',
          )}
        >
          {active === tab.id && (
            <motion.span layoutId="tab-bg" className="absolute inset-0 rounded-full bg-slate-100" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
          )}
          <span className="relative flex items-center gap-2">
            <span className={cn('font-mono text-[10px] tracking-wider', active === tab.id ? 'opacity-70' : 'text-slate-500')}>{tab.num}</span>
            <tab.icon size={15} />
            <span className="hidden sm:inline">{t(tab.id_label, tab.en_label)}</span>
          </span>
        </button>
      ))}
    </nav>
  )
}

/** Second-level navigation inside a module: ink-on-paper active state. */
export function SubTabs<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          aria-pressed={active === s.id}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            active === s.id
              ? 'border-slate-100 bg-slate-100 text-accent-ink'
              : 'border-border bg-card text-slate-400 hover:border-slate-700 hover:text-slate-100',
          )}
        >
          <span className="font-mono text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
          {s.label}
        </button>
      ))}
    </div>
  )
}

export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex overflow-hidden rounded-md border border-border font-mono text-[11px]">
      {(['id', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn('px-2.5 py-1 font-semibold uppercase', lang === l ? 'bg-slate-100 text-accent-ink' : 'text-slate-500 hover:text-slate-100')}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const t = useT()
  return (
    <button
      onClick={toggle}
      title={t('Ganti tema', 'Toggle theme')}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-slate-400 hover:text-slate-100"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
