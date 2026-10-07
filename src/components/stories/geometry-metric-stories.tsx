import { METRIC_TOPICS, type MetricKind } from '../../content/geometry-metric-topics'
import { b, type Story } from './kit'
import { MetricScene } from './geometry-metric-shapes'

const controls: Partial<Record<MetricKind, Story['control']>> = {
  circleSphereData: { label: b('Sudut t (derajat)', 'Angle t (degrees)'), min: 0, max: 360, step: 5, initial: 40 },
  secantDiscriminant: { label: b('Tinggi garis h', 'Line height h'), min: -3, max: 3, step: .1, initial: 1 },
  sphereTangency: { label: b('Jarak OP', 'Distance OP'), min: 2, max: 4, step: .1, initial: 3 },
  circlePencil: { label: b('Posisi pusat h', 'Center position h'), min: -3, max: 3, step: .1, initial: 0 },
  focusDirectrix: { label: b('Parameter t=y', 'Parameter t=y'), min: -4, max: 4, step: .1, initial: 2 },
  asymptoticDirections: { label: b('Geser garis: h', 'Line offset h'), min: -1, max: 1, step: .1, initial: .5 },
  quadricRulings: { label: b('Sudut θ di pinggang (derajat)', 'Waist angle θ (degrees)'), min: 0, max: 180, step: 5, initial: 45 },
}

export const METRIC_STORIES = Object.fromEntries((Object.keys(METRIC_TOPICS) as MetricKind[]).map(kind => {
  const topic = METRIC_TOPICS[kind]
  const story: Story = { title: topic.entry.title, zoomable: true, frames: topic.lesson.steps.map(step => ({ caption: step.text, tex: step.tex })), draw: (frame, value, lang) => <MetricScene {...{ kind, frame, value, lang }} />, control: controls[kind] }
  return [kind, story]
})) as Record<MetricKind, Story>
