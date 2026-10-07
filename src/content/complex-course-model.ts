import type { Entry } from './summary'
import type { Bilingual, WorkedExample } from './summary-examples'
import type { DerivationStep, SummaryLesson, VisualKind } from './summary-lessons'

export const b = (id: string, en: string): Bilingual => ({ id, en })
export const step = (id: string, en: string, textId: string, textEn: string, tex: string): DerivationStep => ({ title: b(id, en), text: b(textId, textEn), tex })
export type CourseDefinition = { name: Bilingual; text: Bilingual; tex: string; picture: Bilingual }
export type CourseSources = { brown: string; zill: string }
export type CourseExercise = { question: Bilingual; solution: Bilingual; tex: string }
export const exercise = (id: string, en: string, solutionId: string, solutionEn: string, tex: string): CourseExercise => ({ question: b(id, en), solution: b(solutionId, solutionEn), tex })
export type CourseTopic = { entry: Entry; lesson: SummaryLesson; definition: CourseDefinition; example: WorkedExample; sources: CourseSources; practice: CourseExercise[] }
export type CourseInput = { visual: VisualKind; title: Bilingual; question: Bilingual; meaning: Bilingual; tex: string; picture: Bilingual; steps: DerivationStep[]; conditions: Bilingual[]; failure: Bilingual; examplePrompt: Bilingual; exampleSteps: DerivationStep[]; check: { question: Bilingual; answer: Bilingual }; sources: CourseSources; practice?: CourseExercise[] }
export function topic(i: CourseInput): CourseTopic {
  const last = i.exampleSteps[i.exampleSteps.length - 1]
  return {
    entry: { title: i.title, intuition: i.meaning, formulas: [i.tex], insight: i.steps[i.steps.length - 1].text, pitfall: i.failure },
    definition: { name: i.title, text: i.meaning, tex: i.tex, picture: i.picture },
    lesson: { visual: i.visual, question: i.question, steps: i.steps, conditions: i.conditions, failure: i.failure, exampleSteps: i.exampleSteps, check: i.check },
    example: { prompt: i.examplePrompt, work: last.tex, reading: last.text },
    sources: i.sources, practice: i.practice ?? [],
  }
}

