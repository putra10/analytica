import { SUMMARY } from './summary'
import { SUMMARY_LESSONS, type VisualKind } from './summary-lessons'
import type { Bilingual } from './summary-examples'
import { COMPLEX_ACTIVITIES } from './complex-activities'
import { GEOMETRY_ACTIVITIES } from './geometry-activities'
import { ALGEBRA_ACTIVITIES } from './algebra-activities'

export type CourseId = 'complex' | 'geometry' | 'algebra'
export type SyllabusActivity = {
  tool: Bilingual
  task: Bilingual
  limitation: Bilingual
  mode: 'calculator' | 'experiment' | 'proof'
  rows?: readonly string[]
  lab?: string
  dimension?: '2D' | '3D'
}
export const SYLLABUS_ACTIVITIES: Record<CourseId, Partial<Record<VisualKind, SyllabusActivity>>> = {
  complex: COMPLEX_ACTIVITIES, geometry: GEOMETRY_ACTIVITIES, algebra: ALGEBRA_ACTIVITIES,
}
export const COURSE_TOPICS = Object.fromEntries(SUMMARY.map(course => [course.id,
  course.parts.flatMap((part, p) => part.entries.map((entry, e) => ({
    kind: SUMMARY_LESSONS[course.id][p][e].visual,
    entry, lesson: SUMMARY_LESSONS[course.id][p][e], part: part.title, p, e,
  }))),
])) as Record<CourseId, {kind: VisualKind; entry: (typeof SUMMARY)[number]['parts'][number]['entries'][number]; lesson: (typeof SUMMARY_LESSONS)[string][number][number]; part: Bilingual; p:number; e:number}[]>

export function topicFromHash(): string | null {
  return new URLSearchParams(location.hash.split('?')[1] ?? '').get('topic')
}
export function activityHref(course: CourseId, kind: VisualKind): string {
  return `#/${course === 'algebra' ? 'app' : 'studio'}/${course}?topic=${encodeURIComponent(kind)}`
}
export function summaryHref(course: CourseId, kind: VisualKind): string {
  return `#/summary/${course}?topic=${encodeURIComponent(kind)}`
}
