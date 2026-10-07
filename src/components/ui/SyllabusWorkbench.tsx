import { useEffect, useState } from 'react'
import { useLang, useT } from '../../lib/i18n'
import { COURSE_TOPICS, SYLLABUS_ACTIVITIES, activityHref, summaryHref, topicFromHash, type CourseId } from '../../content/syllabus-activities'
import { VisualStory } from './VisualStory'
import { FormulaBlock } from './FormulaBlock'
import { ComplexSyllabusLab } from '../complex/ComplexSyllabusLab'
import { GeometrySyllabusLab } from '../studio/GeometrySyllabusLab'
import { AlgebraSyllabusLab } from '../algebra/AlgebraSyllabusLab'
import { TheoremExplorer } from '../algebra/TheoremExplorer'
import type { VisualKind } from '../../content/summary-lessons'

function ProofNotes({course, kind}: {course: CourseId; kind: VisualKind}) {
  const {lang} = useLang(), t = useT()
  const topic = COURSE_TOPICS[course].find(x => x.kind === kind)!
  const key = `analytica-proof-${course}-${kind}`
  const [notes,setNotes] = useState(() => { try { return localStorage.getItem(key) ?? '' } catch { return '' } })
  useEffect(() => { const timer=setTimeout(() => { try { localStorage.setItem(key,notes) } catch { /* optional local notes */ } },300); return () => clearTimeout(timer) },[key,notes])
  return <div className="space-y-4" data-proof-workbench={kind}>
    {course==='algebra' && ['quotient','firstIso','correspondence','secondIso','thirdIso'].includes(kind) && <TheoremExplorer lang={lang} initialTheorem={kind==='firstIso'?'first':kind==='secondIso'?'second':kind==='thirdIso'?'third':'correspondence'}/>}
    <p className="text-sm leading-7">{topic.lesson.check.question[lang]}</p>
    <label className="block text-sm font-semibold">{t('Tuliskan alasanmu','Write your reasoning')}
      <textarea value={notes} onChange={e=>{setNotes(e.target.value);try{localStorage.setItem(key,e.target.value)}catch{/* optional local notes */}}} maxLength={12000} rows={5}
        placeholder={t('1. Definisi dan syarat. 2. Alasan tiap langkah. 3. Kesimpulan dan contoh ketika syarat gagal.','1. Definitions and assumptions. 2. Reasons for each step. 3. Conclusion and an example where a condition fails.')}
        className="mt-2 w-full min-w-0 rounded-lg border border-border bg-bg p-3 text-sm font-normal leading-7" />
    </label>
    <p className="text-xs leading-6 text-slate-400">{t('Catatan disimpan di browser ini. Bandingkan argumen dengan langkah di bawah; pemeriksaan contoh numerik tidak membuktikan teorema umum.','Notes are saved in this browser. Compare your argument with the steps below; checking numerical examples does not prove a general theorem.')}</p>
    <details className="min-w-0 rounded-lg border border-border p-3">
      <summary className="cursor-pointer text-sm font-semibold">{t('Bandingkan dengan kerangka pembuktian','Compare with the proof outline')}</summary>
      <ol className="mt-4 space-y-4">{topic.lesson.steps.map((s,i)=><li key={i} className="min-w-0 border-l-2 border-accent/50 pl-3">
        <h4 className="text-sm font-semibold">{i+1}. {s.title[lang]}</h4><p className="mt-1 text-sm leading-7">{s.text[lang]}</p><FormulaBlock tex={s.tex}/>
      </li>)}</ol>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7">{topic.lesson.conditions.map((c,i)=><li key={i}>{c[lang]}</li>)}</ul>
      <p className="mt-4 text-sm leading-7 text-amber-400">{topic.lesson.failure[lang]}</p>
      <p className="mt-4 border-t border-border pt-3 text-sm leading-7">{topic.lesson.check.answer[lang]}</p>
    </details>
  </div>
}

export function SyllabusWorkbench({course,onLoad,onLab}: {
  course: CourseId
  onLoad?: (rows: string[], dimension?: '2D'|'3D')=>void
  onLab?: (lab: string)=>void
}) {
  const {lang}=useLang(), t=useT(), topics=COURSE_TOPICS[course]
  const [kind,setKind]=useState<VisualKind>(()=>topics.find(x=>x.kind===topicFromHash())?.kind ?? topics[0].kind)
  const [open,setOpen]=useState(()=>topics.some(x=>x.kind===topicFromHash()))
  const [loaded,setLoaded]=useState(false)
  useEffect(()=>{const sync=()=>{const selected=COURSE_TOPICS[course].find(x=>x.kind===topicFromHash());if(selected){setKind(selected.kind);setOpen(true);setLoaded(false)}};sync();addEventListener('hashchange',sync);return()=>removeEventListener('hashchange',sync)},[course])
  const topic=topics.find(x=>x.kind===kind) ?? topics[0], activity=SYLLABUS_ACTIVITIES[course][topic.kind]
  function choose(value: VisualKind) {
    setKind(value); setLoaded(false)
    const [base]=location.hash.split('?')
    history.replaceState(null,'',base+'?topic='+encodeURIComponent(value))
  }
  if(!activity) return <p role="alert">{t('Aktivitas topik ini belum tersedia.','The activity for this topic is unavailable.')}</p>
  return <details open={open} onToggle={e=>setOpen(e.currentTarget.open)} data-syllabus-workbench={course}
    className="my-4 min-w-0 rounded-xl border border-accent/35 bg-card p-4 sm:p-5 text-slate-300">
    <summary className="cursor-pointer text-sm font-semibold text-slate-100">{t('Latihan mengikuti silabus','Practice by syllabus')} · {topics.length} {t('topik','topics')}</summary>
    {open && <div className="mt-4 min-w-0 space-y-4">
      <p className="text-sm leading-7">{t('Pilih topik, coba tugasnya, lalu ubah masukan dan jelaskan hasilnya. Topik pembuktian memiliki ruang untuk menulis argumen dan memeriksa syarat.','Choose a topic, try its task, then change the inputs and explain the result. Proof topics provide space to write an argument and check assumptions.')}</p>
      <label className="block min-w-0 text-xs font-semibold">{t('Topik silabus','Syllabus topic')}
        <select value={topic.kind} onChange={e=>choose(e.target.value as VisualKind)} className="mt-2 block w-full min-w-0 rounded-lg border border-border bg-bg p-3 text-sm">
          {topics.map(x=><option key={x.kind} value={x.kind}>{x.p+1}.{x.e+1} {x.entry.title[lang]}</option>)}
        </select>
      </label>
      <div className="min-w-0 rounded-lg border border-border bg-bg p-4" data-activity-kind={topic.kind}>
        <span className="text-xs font-semibold text-accent">{activity.mode==='calculator'?t('Perhitungan','Calculation'):activity.mode==='experiment'?t('Eksperimen','Experiment'):t('Latihan pembuktian','Proof practice')} · {activity.tool[lang]}</span>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">{topic.entry.title[lang]}</h2>
        <p className="mt-2 text-sm leading-7">{activity.task[lang]}</p>
        <p className="mt-2 text-xs leading-6 text-slate-400">{activity.limitation[lang]}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activity.rows && onLoad && <button type="button" data-load-syllabus onClick={()=>{onLoad([...activity.rows!],activity.dimension);setLoaded(true)}} className="rounded-full border border-accent px-4 py-2 text-xs text-accent">{t('Muat lembar kerja','Load worksheet')}</button>}
          {activity.rows && !onLoad && <a href={activityHref(course,topic.kind)} className="rounded-full border border-accent px-4 py-2 text-xs text-accent">{t('Buka lembar kerja di Studio','Open the worksheet in Studio')}</a>}
          {activity.lab && activity.lab!=='syllabus' && (onLab
            ? <button type="button" data-open-syllabus-lab onClick={()=>{onLab(activity.lab!);setLoaded(true)}} className="rounded-full border border-border px-4 py-2 text-xs">{t('Buka alat lab','Open lab tool')}</button>
            : <a href={`#/app/${course}?topic=${topic.kind}&lab=${encodeURIComponent(activity.lab)}`} className="rounded-full border border-border px-4 py-2 text-xs">{t('Buka alat lab','Open lab tool')}</a>)}
          <a href={summaryHref(course,topic.kind)} className="rounded-full border border-border px-4 py-2 text-xs">{t('Baca penjelasan topik','Read the topic explanation')}</a>
        </div>
        {loaded && <p role="status" className="mt-3 text-xs text-accent">{t('Tugas siap di alat di bawah. Ubah masukan untuk mencoba contoh lain.','The task is ready in the tool below. Change the inputs to try another example.')}</p>}
      </div>
      {activity.lab==='syllabus' && <div key={topic.kind} data-syllabus-tool={topic.kind}>
        {course==='complex'?<ComplexSyllabusLab kind={topic.kind}/>:course==='geometry'?<GeometrySyllabusLab kind={topic.kind}/>:<AlgebraSyllabusLab kind={topic.kind}/>}
      </div>}
      <details className="min-w-0 rounded-lg border border-border p-3" data-syllabus-visual>
        <summary className="cursor-pointer text-sm font-semibold">{t('Eksperimen visual langkah demi langkah','Step-by-step visual experiment')}</summary>
        <div className="mt-4 min-w-0"><VisualStory key={topic.kind} kind={topic.kind} lang={lang}/></div>
      </details>
      <details className="min-w-0 rounded-lg border border-border p-3" data-syllabus-proof open={activity.mode==='proof'}>
        <summary className="cursor-pointer text-sm font-semibold">{t('Coba buktikan dan periksa syarat','Try the proof and check its assumptions')}</summary>
        <div className="mt-4"><ProofNotes key={course+topic.kind} course={course} kind={topic.kind}/></div>
      </details>
    </div>}
  </details>
}
