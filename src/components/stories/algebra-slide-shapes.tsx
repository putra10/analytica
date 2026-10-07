import { C, T, type P } from './kit'

export function AlgebraBox({ x, y, w = 130, h = 48, text, active = true }: { x: number; y: number; w?: number; h?: number; text: string; active?: boolean }) {
  return <g><rect x={x} y={y} width={w} height={h} rx="10" fill={active ? C.soft : C.bg} stroke={active ? C.a : C.ln} strokeWidth="2" /><T x={x + w / 2} y={y + h / 2 + 5} size={15}>{text}</T></g>
}

export function AlgebraNode({ at, label, color = C.a }: { at: P; label: string | number; color?: string }) {
  return <g><circle cx={at[0]} cy={at[1]} r="16" fill={C.bg} stroke={color} strokeWidth="2" /><T x={at[0]} y={at[1] + 5} color={color} size={14}>{label}</T></g>
}
