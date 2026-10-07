import { useEffect, useState } from 'react'

export type Route = { page: 'home' } | { page: 'studio'; tab?: string } | { page: 'app'; tab?: string } | { page: 'summary'; section?: string } | { page: 'about' }

/** #/, #/app/complex, #/summary/geometry, #/about */
export function parseRoute(hash: string): Route {
  const parts = hash.split('?')[0].replace(/^#\/?/, '').split('/').filter(Boolean)
  switch (parts[0]) {
    case 'studio': return { page: 'studio', tab: parts[1] }
    // the geometry labs moved into Studio; keep old links working
    case 'app': return parts[1] === 'geometry' ? { page: 'studio', tab: 'geometry' } : { page: 'app', tab: parts[1] }
    case 'summary': return { page: 'summary', section: parts[1] }
    case 'about': return { page: 'about' }
    default: return { page: 'home' }
  }
}

export const href = (r: Route) =>
  r.page === 'home' ? '#/' : r.page === 'studio' ? `#/studio${r.tab ? '/' + r.tab : ''}` : r.page === 'app' ? `#/app${r.tab ? '/' + r.tab : ''}` : r.page === 'summary' ? `#/summary${r.section ? '/' + r.section : ''}` : '#/about'

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
