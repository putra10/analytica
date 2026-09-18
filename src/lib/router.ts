import { useEffect, useState } from 'react'

export type Route = { page: 'home' } | { page: 'app'; tab?: string } | { page: 'summary'; section?: string } | { page: 'about' }

/** #/, #/app/complex, #/summary/geometry, #/about */
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  switch (parts[0]) {
    case 'app': return { page: 'app', tab: parts[1] }
    case 'summary': return { page: 'summary', section: parts[1] }
    case 'about': return { page: 'about' }
    default: return { page: 'home' }
  }
}

export const href = (r: Route) =>
  r.page === 'home' ? '#/' : r.page === 'app' ? `#/app${r.tab ? '/' + r.tab : ''}` : r.page === 'summary' ? `#/summary${r.section ? '/' + r.section : ''}` : '#/about'

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const on = () => { setRoute(parseRoute(location.hash)); window.scrollTo({ top: 0 }) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return route
}

export const navigate = (r: Route) => { location.hash = href(r) }
