import { C, T, type P } from '../stories/kit'
import { Pic } from './pics'
import { layoutBags, layoutPills } from './pic-utils'

/** A block on top: one part of the domain (a coset, or a fibre of φ), drawn as a bag. */
export interface Block {
  key: string | number
  name: string
  elems: string[]
  color: string
  /** small tag next to the name, used to point out ker φ */
  tag?: string
}

/** A point below: one element of the codomain. */
export interface Target {
  key: string | number
  name: string
  color: string
  /** in the codomain but outside the image */
  dimmed?: boolean
}

/**
 * The "collapsing" picture for G/N and for a homomorphism: the domain split into bags on top,
 * one arrow per bag, and the point it collapses to below.
 */
export function CollapseDiagram({ blocks, targets, leftName, label }: { blocks: Block[]; targets: Target[]; leftName: string; label: string }) {
  const bags = layoutBags(blocks.map((b) => ({ title: b.tag ? `${b.name}  (${b.tag})` : b.name, color: b.color, items: b.elems, ring: !!b.tag })), 480, 32)
  const pills = layoutPills(targets.map((t) => ({ s: t.name, color: t.color, faint: t.dimmed })), 480, bags.bottom + 56)
  const at = (key: string | number) => pills.centers[targets.findIndex((t) => t.key === key)]
  return (
    <Pic h={pills.bottom + 18} label={label}>
      <T x={16} y={22} anchor="start" size={14} weight={700} color={C.mu}>{leftName}</T>
      {blocks.map((b, i) => {
        const p = bags.pos[i], q: P | undefined = at(b.key)
        if (!q) return null
        const s: P = [p.x + p.w / 2, p.y + p.h]
        const e: P = [q[0], q[1] - 17]
        return <path key={i} d={`M${s[0]},${s[1]} C${s[0]},${s[1] + 30} ${e[0]},${e[1] - 30} ${e[0]},${e[1]}`} fill="none" stroke={b.color} strokeWidth="2" strokeDasharray="6 4" />
      })}
      {bags.node}
      {pills.node}
    </Pic>
  )
}
