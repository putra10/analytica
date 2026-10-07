import { FOUNDATIONS_TOPICS, FOUNDATIONS_SECTIONS, FOUNDATIONS_DECKS, FOUNDATIONS_PRACTICE, type FoundationsKind } from './geometry-foundations-topics'
import { METRIC_TOPICS, METRIC_SECTIONS, METRIC_DECKS, METRIC_PRACTICE, type MetricKind } from './geometry-metric-topics'
import { CLASSIFICATION_TOPICS, CLASSIFICATION_SECTIONS, CLASSIFICATION_DECKS, CLASSIFICATION_PRACTICE, type ClassificationKind } from './geometry-classification-topics'
import type { GeometryTopic, GeometryDefinition, GeometryExercise } from './geometry-slide-model'
import type { PartVisual } from './summary-examples'
import type { VisualKind } from './summary-lessons'
import type { VisualTheorem } from './summary-theorems'

export type GeometrySlideKind = FoundationsKind | MetricKind | ClassificationKind
export const GEOMETRY_SLIDE_TOPICS: Record<GeometrySlideKind, GeometryTopic> = { ...FOUNDATIONS_TOPICS, ...METRIC_TOPICS, ...CLASSIFICATION_TOPICS }
export const GEOMETRY_SECTIONS = [...FOUNDATIONS_SECTIONS, ...METRIC_SECTIONS, ...CLASSIFICATION_SECTIONS]
export const GEOMETRY_DECKS = [...FOUNDATIONS_DECKS, ...METRIC_DECKS, ...CLASSIFICATION_DECKS]
export const GEOMETRY_PRACTICE: Partial<Record<VisualKind, GeometryExercise[]>> = {}
for (const practice of [FOUNDATIONS_PRACTICE, METRIC_PRACTICE, CLASSIFICATION_PRACTICE]) {
  for (const [kind, exercises] of Object.entries(practice)) {
    const key = kind as VisualKind
    GEOMETRY_PRACTICE[key] = [...(GEOMETRY_PRACTICE[key] ?? []), ...exercises]
  }
}
const BASE_ORDER = ['basis', 'products', 'plane', 'projection', 'power', 'radical', 'conic', 'quadric', 'eigen', 'reduce', 'affine', 'isometry']

export function extendGeometry<T>(base: T[][], additions: Record<string, T>): T[][] {
  const original = Object.fromEntries(BASE_ORDER.map((kind, i) => [kind, base.flat()[i]]))
  return GEOMETRY_SECTIONS.map(section => section.order.map(kind => additions[kind] ?? original[kind]))
}
export const GEOMETRY_ENTRIES = Object.fromEntries(Object.entries(GEOMETRY_SLIDE_TOPICS).map(([k, t]) => [k, t.entry]))
export const GEOMETRY_LESSONS = Object.fromEntries(Object.entries(GEOMETRY_SLIDE_TOPICS).map(([k, t]) => [k, t.lesson]))
export const GEOMETRY_EXAMPLES = Object.fromEntries(Object.entries(GEOMETRY_SLIDE_TOPICS).map(([k, t]) => [k, t.example]))
export const GEOMETRY_DEFINITIONS = Object.fromEntries(Object.entries(GEOMETRY_SLIDE_TOPICS).map(([k, t]) => [k, t.definition])) as Record<GeometrySlideKind, GeometryDefinition>
export const GEOMETRY_CONCEPTS = Object.fromEntries(Object.keys(GEOMETRY_SLIDE_TOPICS).map(kind => [kind, [] as VisualTheorem[]])) as Record<GeometrySlideKind, VisualTheorem[]>

/** A representative construction for each lecture subsection. */
export function geometryPartVisuals(original: PartVisual[]): PartVisual[] {
  const originalPart: Record<string, number> = { basis: 0, products: 0, plane: 1, projection: 1, power: 2, radical: 2, conic: 3, quadric: 3, eigen: 4, reduce: 4, affine: 5, isometry: 5 }
  return GEOMETRY_SECTIONS.map(section => {
    const kind = section.order[0]
    const topic = GEOMETRY_SLIDE_TOPICS[kind as GeometrySlideKind]
    if (!topic) return { ...original[originalPart[kind]], title: section.title }
    const steps = topic.lesson.steps
    const indexes = [...new Set([0, Math.floor((steps.length - 1) / 2), steps.length - 1])]
    return { title: section.title, caption: topic.definition.picture, steps: indexes.map(i => ({ label: steps[i].title, tex: steps[i].tex })) }
  })
}
