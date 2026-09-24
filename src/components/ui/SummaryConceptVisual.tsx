import { ArrowRight } from 'lucide-react'
import type { PartVisual } from '../../content/summary-examples'
import { Tex } from './FormulaBlock'

type Lang = 'id' | 'en'

function ConceptSketch({ course, part }: { course: string; part: number }) {
  const key = `${course}-${part}`
  const axis = <path d="M22 138 H238 M78 158 V16" stroke="var(--hint)" strokeWidth="1.2" />
  let drawing: React.ReactNode

  switch (key) {
    case 'complex-0':
      drawing = <>{axis}<circle cx="78" cy="138" r="69" fill="none" stroke="var(--border-strong)" strokeDasharray="4 5" /><path d="M78 138 L127 89" stroke="var(--accent)" strokeWidth="3" /><circle cx="127" cy="89" r="5" fill="var(--accent)" /><path d="M98 138 A20 20 0 0 0 92 124" fill="none" stroke="var(--danger)" strokeWidth="2" /><text x="133" y="87" fontSize="13" fill="var(--fg)">z</text><text x="102" y="132" fontSize="11" fill="var(--danger)">θ</text></>
      break
    case 'complex-1':
      drawing = <><path d="M20 90 H108 M64 45 V135 M150 90 H240 M195 45 V135" stroke="var(--hint)" /><rect x="70" y="50" width="32" height="32" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><path d="M158 75 Q192 42 222 78 Q211 108 170 110 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><path d="M116 90 H140 M133 83 L140 90 L133 97" fill="none" stroke="var(--danger)" strokeWidth="2" /><text x="57" y="39" fontSize="12" fill="var(--fg)">z</text><text x="190" y="39" fontSize="12" fill="var(--fg)">w</text></>
      break
    case 'complex-2':
      drawing = <><path d="M20 35 H105 V140 H20 Z" fill="var(--surface-2)" stroke="var(--border-strong)" /><rect x="42" y="35" width="32" height="105" fill="var(--accent-soft)" stroke="var(--accent)" /><circle cx="190" cy="88" r="48" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><circle cx="190" cy="88" r="20" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" /><path d="M110 88 H138 M131 81 L138 88 L131 95" fill="none" stroke="var(--danger)" strokeWidth="2" /><text x="27" y="156" fontSize="11" fill="var(--muted)">x + iy</text><text x="167" y="156" fontSize="11" fill="var(--muted)">eˣeⁱʸ</text></>
      break
    case 'complex-3':
      drawing = <><circle cx="130" cy="88" r="60" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2.5" /><circle cx="130" cy="88" r="5" fill="var(--danger)" /><path d="M173 46 L184 45 L181 56" fill="none" stroke="var(--accent)" strokeWidth="2.5" /><text x="137" y="83" fontSize="12" fill="var(--danger)">a</text><text x="187" y="47" fontSize="12" fill="var(--fg)">γ</text><text x="62" y="158" fontSize="11" fill="var(--muted)">∮ f(z) dz</text></>
      break
    case 'complex-4':
      drawing = <><circle cx="130" cy="87" r="67" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><circle cx="130" cy="87" r="29" fill="var(--surface)" stroke="var(--danger)" strokeWidth="2" /><circle cx="130" cy="87" r="4" fill="var(--danger)" /><path d="M130 87 L177 40" stroke="var(--border-strong)" strokeDasharray="4 4" /><text x="139" y="82" fontSize="12" fill="var(--danger)">a</text><text x="178" y="41" fontSize="11" fill="var(--fg)">R</text><text x="153" y="72" fontSize="11" fill="var(--fg)">r</text></>
      break
    case 'geometry-0':
      drawing = <>{axis}<path d="M78 138 L174 138 L210 72 L114 72 Z" fill="var(--accent-soft)" stroke="var(--border-strong)" /><path d="M78 138 L174 138 M78 138 L114 72 M78 138 L210 72" stroke="var(--accent)" strokeWidth="2.3" /><circle cx="210" cy="72" r="4" fill="var(--danger)" /><text x="178" y="151" fontSize="12" fill="var(--fg)">a</text><text x="104" y="68" fontSize="12" fill="var(--fg)">b</text><text x="214" y="69" fontSize="12" fill="var(--danger)">a+b</text></>
      break
    case 'geometry-1':
      drawing = <><path d="M35 125 L103 47 L223 47 L155 125 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><path d="M110 145 L151 18" stroke="var(--danger)" strokeWidth="2.5" /><circle cx="129" cy="86" r="4" fill="var(--danger)" /><path d="M129 86 L194 17" stroke="var(--border-strong)" strokeDasharray="4 4" /><text x="199" y="19" fontSize="13" fill="var(--fg)">n</text><text x="154" y="146" fontSize="12" fill="var(--muted)">n·r = c</text></>
      break
    case 'geometry-2':
      drawing = <><circle cx="101" cy="86" r="55" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><circle cx="159" cy="86" r="55" fill="none" stroke="var(--danger)" strokeWidth="2" /><path d="M130 16 V156" stroke="var(--fg)" strokeDasharray="5 5" /><circle cx="101" cy="86" r="3" fill="var(--accent)" /><circle cx="159" cy="86" r="3" fill="var(--danger)" /><text x="115" y="166" fontSize="11" fill="var(--fg)">{'Pow₁ = Pow₂'}</text></>
      break
    case 'geometry-3':
      drawing = <>{axis}<ellipse cx="130" cy="87" rx="85" ry="43" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" /><path d="M45 87 H215 M130 44 V130" stroke="var(--danger)" strokeDasharray="5 5" /><circle cx="68" cy="87" r="4" fill="var(--danger)" /><circle cx="192" cy="87" r="4" fill="var(--danger)" /><text x="118" y="164" fontSize="11" fill="var(--fg)">principal axes</text></>
      break
    case 'geometry-4':
      drawing = <><path d="M20 50 H105 M20 85 H105 M20 120 H105 M36 34 V138 M71 34 V138 M106 34 V138" stroke="var(--accent)" strokeWidth="1.5" /><path d="M150 50 H235 M158 85 H243 M166 120 H251 M150 50 L166 120 M185 50 L201 120 M220 50 L236 120" stroke="var(--danger)" strokeWidth="1.5" /><path d="M116 86 H141 M134 79 L141 86 L134 93" fill="none" stroke="var(--fg)" strokeWidth="2" /><text x="172" y="153" fontSize="11" fill="var(--fg)">T(x) = Ax+b</text></>
      break
    case 'algebra-0':
      drawing = <><rect x="25" y="31" width="93" height="112" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" /><rect x="143" y="31" width="93" height="112" rx="12" fill="var(--surface-2)" stroke="var(--danger)" />{[0, 1, 2].map((i) => <g key={i}><circle cx="54" cy={58 + i * 30} r="10" fill="var(--accent)" /><circle cx="172" cy={58 + i * 30} r="10" fill="var(--danger)" /><text x="51" y={62 + i * 30} fontSize="10" fill="var(--accent-ink)">{i * 2}</text><text x="169" y={62 + i * 30} fontSize="10" fill="var(--surface)">{i * 2 + 1}</text></g>)}<text x="83" y="159" fontSize="11" fill="var(--fg)">H</text><text x="180" y="159" fontSize="11" fill="var(--fg)">1+H</text></>
      break
    case 'algebra-1':
      drawing = <><path d="M62 62 L122 38 L109 112 Z" fill="none" stroke="var(--accent)" strokeWidth="2" /><path d="M177 57 L217 111" stroke="var(--danger)" strokeWidth="2" />{[[62, 62, '1'], [122, 38, '2'], [109, 112, '3'], [177, 57, '4'], [217, 111, '5']].map(([x, y, label]) => <g key={label}><circle cx={x} cy={y} r="13" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" /><text x={Number(x) - 4} y={Number(y) + 4} fontSize="12" fill="var(--fg)">{label}</text></g>)}<text x="66" y="156" fontSize="11" fill="var(--fg)">(1 2 3)(4 5)</text></>
      break
    default:
      drawing = <><rect x="24" y="39" width="94" height="99" rx="13" fill="var(--accent-soft)" stroke="var(--accent)" /><rect x="143" y="39" width="94" height="99" rx="13" fill="var(--surface-2)" stroke="var(--danger)" /><text x="65" y="91" fontSize="20" fill="var(--accent)">R</text><text x="168" y="91" fontSize="20" fill="var(--danger)">R/I</text><path d="M119 88 H140 M133 81 L140 88 L133 95" fill="none" stroke="var(--fg)" strokeWidth="2" /><text x="46" y="159" fontSize="11" fill="var(--muted)">a ~ b iff a − b ∈ I</text></>
  }

  return <svg viewBox="0 0 260 170" aria-hidden="true" className="mx-auto h-[170px] w-full max-w-[260px]"><rect x="0.5" y="0.5" width="259" height="169" rx="12" fill="var(--surface)" stroke="var(--border)" />{drawing}</svg>
}

export function SummaryConceptVisual({ course, part, visual, lang }: { course: string; part: number; visual: PartVisual; lang: Lang }) {
  return (
    <figure className="mb-5 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
        <ConceptSketch course={course} part={part} />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">{visual.title[lang]}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{visual.caption[lang]}</p>
          <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {visual.steps.map((step, i) => <div key={i} className="contents sm:contents">
              {i > 0 && <ArrowRight size={16} className="mx-auto shrink-0 rotate-90 text-accent sm:rotate-0" aria-hidden="true" />}
              <div className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-border bg-slate-900 px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wide text-slate-500">{step.label[lang]}</span>
                <div className="mt-1 overflow-x-auto text-[12px] text-slate-100"><Tex tex={step.tex} /></div>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </figure>
  )
}
