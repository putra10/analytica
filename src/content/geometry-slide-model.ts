import type { Entry } from './summary'
import type { Bilingual, WorkedExample } from './summary-examples'
import type { DerivationStep, SummaryLesson, VisualKind } from './summary-lessons'

export const b = (id: string, en: string): Bilingual => ({ id, en })
export const step = (id: string, en: string, textId: string, textEn: string, tex: string): DerivationStep => ({ title: b(id, en), text: b(textId, textEn), tex })
export type GeometryDefinition = { name: Bilingual; text: Bilingual; tex: string; picture: Bilingual }
export type GeometryTopic = { entry: Entry; lesson: SummaryLesson; definition: GeometryDefinition; example: WorkedExample }
export type GeometryInput = { visual: VisualKind; title: Bilingual; question: Bilingual; meaning: Bilingual; tex: string; picture: Bilingual; steps: DerivationStep[]; conditions: Bilingual[]; failure: Bilingual; examplePrompt: Bilingual; exampleSteps: DerivationStep[]; check: { question: Bilingual; answer: Bilingual } }
export function geometryTopic(i: GeometryInput): GeometryTopic {
  const last = i.exampleSteps[i.exampleSteps.length - 1]
  return {
    entry: { title: i.title, intuition: i.meaning, formulas: [i.tex], insight: i.steps[i.steps.length - 1].text, pitfall: i.failure },
    definition: { name: i.title, text: i.meaning, tex: i.tex, picture: i.picture },
    lesson: { visual: i.visual, question: i.question, steps: i.steps, conditions: i.conditions, failure: i.failure, exampleSteps: i.exampleSteps, check: i.check },
    example: { prompt: i.examplePrompt, work: last.tex, reading: last.text },
  }
}
export type GeometryDeck = { file: string; title: Bilingual; topics: VisualKind[] }
export type GeometrySection = { title: Bilingual; order: VisualKind[] }
export type GeometryExercise = { question: Bilingual; solution: Bilingual; tex: string }
export const exercise = (id: string, en: string, solutionId: string, solutionEn: string, tex: string): GeometryExercise => ({ question: b(id, en), solution: b(solutionId, solutionEn), tex })
