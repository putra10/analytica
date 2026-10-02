import { C, T, type P } from '../stories/kit'
import type { Group } from '../../lib/group-theory'

/** Kit colours first (violet, red, green, amber, pink); past five, evenly spaced hues that read in both themes. */
const KIT = [C.a, C.r, C.g, C.y, C.v]
export const pal = (i: number, n: number) => (n <= KIT.length ? KIT[i % KIT.length] : `oklch(66% 0.15 ${Math.round((285 + (i * 360) / n) % 360)})`)

/** Approximate rendered width of a label (≈ 0.58 em per character, a bit more for wide glyphs). */
export const textW = (s: string, size: number) => [...s].reduce((w, ch) => w + (/[ ,.()1il|]/.test(ch) ? 0.36 : /[⁰-⁹₀-₉²³]/.test(ch) ? 0.42 : 0.6), 0) * size

/** Element labels without spaces inside cycles: "(1 2 3)" → "(123)" when every symbol is one digit. */
export const compact = (s: string) => (/^[()\d\s]+$/.test(s) && !/\d\d/.test(s) ? s.replace(/ /g, '') : s)

export const clockAt = (c: P, r: number, n: number) => (k: number): P => {
  const a = -Math.PI / 2 + (2 * Math.PI * k) / n
  return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]
}

export interface Bag { title: string; color: string; items: string[]; ring?: boolean; faint?: boolean }

/** Lay bags out in rows of `cols`; each bag holds its items as small pills, wrapped to the bag width. */
export function layoutBags(bags: Bag[], W = 480, y0 = 14, cols = Math.min(bags.length, bags.length <= 4 ? bags.length : 4)) {
  const gap = 10, bw = (W - 24 - gap * (cols - 1)) / Math.max(cols, 1), size = 13
  const boxes = bags.map((b) => {
    const rows: { s: string; w: number }[][] = [[]]
    let x = 0
    for (const s of b.items) {
      const w = textW(s, size) + 12
      if (x + w > bw - 12 && rows[rows.length - 1].length) { rows.push([]); x = 0 }
      rows[rows.length - 1].push({ s, w }); x += w + 5
    }
    return { rows, h: 34 + rows.length * 26 + 6 }
  })
  const pos: { x: number; y: number; w: number; h: number }[] = []
  let y = y0
  for (let i = 0; i < bags.length; i += cols) {
    const rowH = Math.max(...boxes.slice(i, i + cols).map((b) => b.h))
    for (let j = i; j < Math.min(i + cols, bags.length); j++) pos.push({ x: 12 + (j - i) * (bw + gap), y, w: bw, h: rowH })
    y += rowH + gap
  }
  const node = (
    <g>
      {bags.map((b, i) => {
        const p = pos[i]
        return (
          <g key={i} style={{ opacity: b.faint ? 0.35 : 1 }}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={14} fill={b.color} fillOpacity=".1" stroke={b.color} strokeWidth={b.ring ? 3.5 : 2.5} />
            <T x={p.x + p.w / 2} y={p.y + 22} size={14} weight={700} color={b.color}>{b.title}</T>
            {boxes[i].rows.map((row, k) => {
              const total = row.reduce((s, it) => s + it.w + 5, -5)
              let x = p.x + (p.w - total) / 2
              return row.map((it, j) => {
                const cx = x + it.w / 2
                x += it.w + 5
                return (
                  <g key={`${k}-${j}`}>
                    <rect x={cx - it.w / 2} y={p.y + 34 + k * 26} width={it.w} height={21} rx={10.5} fill={C.bg} stroke={b.color} strokeWidth="1.5" />
                    <T x={cx} y={p.y + 34 + k * 26 + 15} size={size} halo={false}>{it.s}</T>
                  </g>
                )
              })
            })}
          </g>
        )
      })}
    </g>
  )
  return { node, pos, bottom: y - gap }
}

/** Pills in centred rows (used for the points of G/N or of a codomain). */
export function layoutPills(items: { s: string; color: string; faint?: boolean }[], W: number, y0: number, size = 14) {
  const rows: { s: string; color: string; faint?: boolean; w: number }[][] = [[]]
  let x = 0
  for (const it of items) {
    const w = Math.max(30, textW(it.s, size) + 16)
    if (x + w > W - 30 && rows[rows.length - 1].length) { rows.push([]); x = 0 }
    rows[rows.length - 1].push({ ...it, w }); x += w + 10
  }
  const centers: P[] = []
  const node = (
    <g>
      {rows.map((row, k) => {
        const total = row.reduce((s, it) => s + it.w + 10, -10)
        let x = (W - total) / 2
        return row.map((it, j) => {
          const c: P = [x + it.w / 2, y0 + 15 + k * 40]
          centers.push(c)
          x += it.w + 10
          return (
            <g key={`${k}-${j}`} style={{ opacity: it.faint ? 0.35 : 1 }}>
              <rect x={c[0] - it.w / 2} y={c[1] - 15} width={it.w} height={30} rx={15} fill={it.faint ? C.bg : it.color} fillOpacity={it.faint ? 1 : 0.18} stroke={it.faint ? C.ln : it.color} strokeWidth="2" />
              <T x={c[0]} y={c[1] + size / 3} size={size} weight={600} halo={false}>{it.s}</T>
            </g>
          )
        })
      })}
    </g>
  )
  return { node, centers, bottom: y0 + rows.length * 40 - 10 }
}


/** Unicode element labels → TeX (subscripts, superscripts, minus, spaces inside cycles). */
export const labelTex = (s: string) =>
  s.replace(/([₀-₉]+)/g, (m) => `_{${[...m].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('')}}`)
    .replace(/([⁰-⁹]+)/g, (m) => `^{${[...m].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`)
    .replace(/−/g, '-').replace(/ /g, '\\,')

/** Groups written additively (Z_n and products of them): cosets are a + H, not Ha. */
export const additive = (id: string) => /^Z\d+(xZ\d+)*$/.test(id)

/** Name of the coset of `rep`: H itself for e, then Ha / aH, or a+H for additive groups. */
export const cosetName = (g: Group, rep: number, side: 'left' | 'right', S = 'H') =>
  rep === g.e ? S : additive(g.id) ? `${compact(g.labels[rep])}+${S}` : side === 'right' ? `${S}${compact(g.labels[rep])}` : `${compact(g.labels[rep])}${S}`

