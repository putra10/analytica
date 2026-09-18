import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type Lang = 'id' | 'en'

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'id', setLang: () => {} })

const KEY = 'analytica.lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem(KEY) as Lang) || 'id' } catch { return 'id' }
  })
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* private mode */ }
  }, [])
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)

/** `t(id, en)` picks the string / node for the active language. */
export function useT() {
  const { lang } = useContext(Ctx)
  return useCallback(<T,>(id: T, en: T): T => (lang === 'id' ? id : en), [lang])
}
