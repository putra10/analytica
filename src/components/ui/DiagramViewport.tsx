import { useState, type ReactNode } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export function DiagramViewport({children,lang}:{children:ReactNode;lang:'id'|'en'}) {
  const [large,setLarge]=useState(false)
  return <div className="min-w-0">
    <div className="mb-2 flex items-center justify-end gap-2">
      <button type="button" aria-pressed={large} onClick={()=>setLarge(!large)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-slate-300">{large?<Minimize2 size={14}/>:<Maximize2 size={14}/>} {lang==='id'?(large?'Sesuaikan gambar':'Perbesar gambar'):(large?'Fit diagram':'Enlarge diagram')}</button>
    </div>
    <div className={`diagram-viewport ${large?'diagram-enlarged':''}`}>{children}</div>
    {large&&<p className="mt-2 text-xs text-slate-400">{lang==='id'?'Geser ke samping untuk membaca label dan melihat seluruh gambar.':'Scroll sideways to read labels and explore the full diagram.'}</p>}
  </div>
}
