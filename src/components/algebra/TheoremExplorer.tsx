import { useState } from 'react'
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react'
import { GROUP, KERNEL, subgroup, image, preimage, coset } from '../../lib/correspondence'
import { FormulaBlock } from '../ui/FormulaBlock'
import { cn } from '../../lib/utils'

type Lang = 'id' | 'en'
type Theorem = 'correspondence' | 'first' | 'second' | 'third'
const setText = (items: number[]) => `{${items.join(', ')}}`

function Elements({ elements, highlight = [] }: { elements: number[]; highlight?: number[] }) {
  return <div className="mt-3 flex flex-wrap gap-1.5">{elements.map(n => <span key={n} className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs', highlight.includes(n) ? 'border-accent bg-accent/15 text-accent' : 'border-border text-slate-400')}>{n}</span>)}</div>
}

function Lattice({ side, selected, onSelect, lang }: { side: 'original' | 'quotient'; selected: number; onSelect: (n: number) => void; lang: Lang }) {
  const original = side === 'original'
  const positions = original ? [{g:1,x:180,y:45},{g:2,x:100,y:125},{g:3,x:270,y:125},{g:4,x:55,y:215},{g:6,x:205,y:215},{g:12,x:160,y:295}] : [{g:1,x:180,y:45},{g:2,x:90,y:125},{g:3,x:270,y:125},{g:6,x:180,y:215}]
  const edges = original ? [[1,2],[1,3],[2,4],[2,6],[3,6],[4,12],[6,12]] : [[1,2],[1,3],[2,6],[3,6]]
  const activeImage = image(subgroup(selected)).join(',')
  return <figure className="min-w-0 rounded-lg border border-border bg-slate-900/30 p-3">
    <figcaption className="text-center text-sm font-semibold text-slate-100">{original ? 'G = Z₁₂' : 'G/K ≅ Z₆'}</figcaption>
    <svg viewBox="0 0 360 335" className="mt-2 h-auto w-full" role="img" aria-label={lang==='id'?`Kisi subgrup ${original?'Z12':'Z6'}; garis berarti inklusi`:`Subgroup lattice of ${original?'Z12':'Z6'}; lines mean inclusion`}>
      {edges.map(([a,b])=>{
        const p=positions.find(n=>n.g===a)!,q=positions.find(n=>n.g===b)!
        const eligible=original?(6%a===0&&6%b===0):true
        return <path key={`${a}-${b}`} d={`M${p.x} ${p.y}L${q.x} ${q.y}`} stroke={eligible?'var(--accent)':'var(--border-strong)'} strokeWidth="2" strokeDasharray={eligible?undefined:'5 5'} />
      })}
      {positions.map(p=>{
        const eligible=6%p.g===0
        const selectedNode=original?selected===p.g:image(subgroup(p.g)).join(',')===activeImage
        const name=original?(p.g===1?'G':p.g===6?'K = ⟨6⟩':p.g===12?'{0}':`⟨${p.g}⟩`):(p.g===1?'G/K':p.g===6?'K/K = {[0]}':`⟨[${p.g}]⟩`)
        return <g key={p.g} role="button" tabIndex={0} aria-label={`${original?'G':'G/K'}: ${name}`} aria-pressed={selectedNode} onClick={()=>onSelect(p.g)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(p.g)}}} className="cursor-pointer focus:outline-accent">
          <rect x={p.x-44} y={p.y-18} width="88" height="36" rx="10" fill={selectedNode?'var(--accent-soft)':'var(--surface)'} stroke={selectedNode?'var(--accent)':eligible||!original?'var(--border-strong)':'var(--danger)'} strokeWidth={selectedNode?3:1.5} />
          <text x={p.x} y={p.y+5} textAnchor="middle" fontSize={p.g===6&&!original?11:15} fill={eligible||!original?'var(--fg)':'var(--danger)'}>{name}</text>
        </g>
      })}
    </svg>
    <p className="text-xs leading-relaxed text-slate-400">{lang==='id'?'Setiap kotak adalah subgrup. Garis ke atas berarti termuat dalam subgrup lebih besar.':'Each box is a subgroup. An upward line means containment in a larger subgroup.'}</p>
    <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={lang==='id'?`Pilih subgrup ${original?'asal':'kuosien'}`:`Choose ${original?'an original':'a quotient'} subgroup`}>
      {positions.map(p=><button key={p.g} type="button" aria-pressed={original?selected===p.g:image(subgroup(p.g)).join(',')===activeImage} onClick={()=>onSelect(p.g)} className={cn('rounded-lg border px-2 py-1.5 text-xs',original&&6%p.g!==0?'border-amber-500/30 text-amber-400':'border-border text-slate-300')}>{original?(p.g===1?'G':p.g===6?'K':p.g===12?'{0}':`⟨${p.g}⟩`):(p.g===1?'G/K':p.g===6?'[0]':`⟨[${p.g}]⟩`)}</button>)}
    </div>
  </figure>
}

export function TheoremExplorer({ lang }: { lang: Lang }) {
  const [theorem,setTheorem]=useState<Theorem>('correspondence')
  const [selected,setSelected]=useState(2)
  const [phase,setPhase]=useState(0)
  const [representative,setRepresentative]=useState(2)
  const t=(id:string,en:string)=>lang==='id'?id:en
  const names: { id: Theorem; label: string }[]=[{id:'correspondence',label:t('Korespondensi','Correspondence')},{id:'first',label:t('Isomorfisma I','First isomorphism')},{id:'second',label:t('Isomorfisma II','Second isomorphism')},{id:'third',label:t('Isomorfisma III','Third isomorphism')}]
  const H=subgroup(selected), projected=image(H), lifted=preimage(projected), eligible=KERNEL.every(n=>H.includes(n))
  const setTheoremChoice=(value:Theorem)=>{setTheorem(value);setPhase(0)}
  return <section className="min-w-0 overflow-hidden rounded-[var(--radius)] border border-accent/40 bg-card p-4 shadow-[var(--shadow-sm)] sm:p-5" aria-label={t('Teorema grup secara visual','Visual group theorems')}>
    <p className="eyebrow">{t('Definisi → contoh → teorema','Definition → example → theorem')}</p>
    <h3 className="font-display mt-2 text-2xl text-slate-100">{t('Lihat apa yang dihubungkan oleh teorema.','See what the theorem connects.')}</h3>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t('Pilih teorema grup','Choose a group theorem')}>{names.map(n=><button key={n.id} type="button" aria-pressed={theorem===n.id} onClick={()=>setTheoremChoice(n.id)} className={cn('rounded-lg border px-3 py-2 text-xs',theorem===n.id?'border-accent bg-accent/10 text-slate-100':'border-border text-slate-400')}>{n.label}</button>)}</div>
    <div className="mt-4 rounded-lg border border-border bg-slate-900/30 p-3 text-sm leading-relaxed text-slate-300">
      {t('Contoh tetap: G = Z₁₂ memakai penjumlahan modulo 12. Peta π mengambil sisa modulo 6. Kernel K = {0,6}; 0 dan 6 menjadi identitas yang sama di target. Semua subgrup contoh ini normal karena G abelian.','Fixed example: G = Z₁₂ uses addition modulo 12. The map π reduces modulo 6. Its kernel is K = {0,6}; 0 and 6 become the same target identity. Every subgroup in this example is normal because G is abelian.')}
      <div className="mt-2"><FormulaBlock tex={String.raw`\pi:\mathbb Z_{12}\twoheadrightarrow\mathbb Z_6,\quad\pi(a)=[a]_6,\quad\ker\pi=K=\{0,6\}`} /></div>
    </div>
    {theorem==='correspondence'&&<>
      <p className="mt-4 text-sm leading-7 text-slate-300">{t('Pernyataannya: setiap subgrup H yang memuat seluruh kernel K cocok dengan tepat satu subgrup H/K pada G/K. Ini pasangan antara subgrup, bukan pasangan antara anggota H dan anggota H/K.','Statement: every subgroup H containing the whole kernel K matches exactly one subgroup H/K of G/K. This pairs subgroups, not individual elements of H and H/K.')}</p>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2"><Lattice side="original" selected={selected} onSelect={setSelected} lang={lang} /><Lattice side="quotient" selected={selected} onSelect={setSelected} lang={lang} /></div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('Langkah korespondensi','Correspondence steps')}>{[t('1 · Pilih H','1 · Choose H'),t('2 · Proyeksikan','2 · Project'),t('3 · Angkat kembali','3 · Lift back')].map((text,i)=><button key={i} type="button" aria-pressed={phase===i} onClick={()=>setPhase(i)} className={cn('rounded-lg border px-3 py-2 text-xs',phase===i?'border-accent text-accent':'border-border text-slate-400')}>{text}</button>)}</div>
      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-3">
        <div className={cn('rounded-lg border p-3',phase===0?'border-accent':'border-border')}><p className="text-xs font-semibold text-slate-100">H = {setText(H)}</p><Elements elements={GROUP} highlight={H} /><p className="mt-2 text-xs text-slate-400">{eligible?t('K ⊆ H: memenuhi syarat','K ⊆ H: eligible'):t('K ⊈ H: syarat gagal','K ⊈ H: condition fails')}</p></div>
        <div className={cn('rounded-lg border p-3',phase===1?'border-accent':'border-border')}><p className="flex items-center gap-1 text-xs font-semibold text-slate-100"><ArrowDown size={14} />π(H) = {setText(projected.map(n=>n))}</p><div className="mt-3 space-y-1">{projected.map(n=><p key={n} className="text-xs text-slate-300"><span className="font-mono text-accent">[{n}]</span> = {setText(coset(n))}</p>)}</div></div>
        <div className={cn('rounded-lg border p-3',phase===2?'border-accent':'border-border')}><p className="flex items-center gap-1 text-xs font-semibold text-slate-100"><ArrowUp size={14} />π⁻¹(π(H))</p><Elements elements={GROUP} highlight={lifted} /><p className="mt-2 text-xs leading-relaxed text-slate-400">{setText(lifted)} {eligible?'= H':'≠ H'}</p></div>
      </div>
      <div className="mt-4 rounded-lg bg-slate-900/40 p-3" aria-live="polite">
        <p className="text-sm leading-relaxed text-slate-300">{phase===0?t('H harus memuat 0 dan 6. Pilih kotak kiri atau kanan untuk melihat pasangan; semua anggota H disorot, bukan hanya pembangkitnya.','H must contain 0 and 6. Choose a left or right node to see its pair; every element of H is highlighted, not just its generator.'):phase===1?t('Proyeksi menyatukan a dan a+6. Setiap pasangan utuh menjadi satu kelas. Untuk H yang memenuhi syarat, banyak kelasnya |H|/2.','Projection merges a with a+6. Each complete pair becomes one class. For eligible H, the number of classes is |H|/2.'):t('Preimage mengambil semua anggota G yang kelasnya ada pada π(H), bukan hanya satu wakil tiap kelas. H kembali utuh tepat ketika seluruh kernel sudah termuat.','The preimage takes every element of G whose class lies in π(H), not one representative per class. It recovers H exactly when the entire kernel was already included.')}</p>
        <FormulaBlock tex={String.raw`H\supseteq K:\quad H\mapsto\pi(H)=H/K,\quad L\mapsto\pi^{-1}(L)`} />
      </div>
      {!eligible&&<div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"><p className="flex items-start gap-2 text-sm leading-relaxed text-slate-300"><AlertTriangle size={17} className="shrink-0 text-amber-400" />{t(`Subgrup ${setText(H)} tetap punya image, tetapi setelah diangkat kembali menjadi ${setText(lifted)}. Anggota 6 dan pasangannya ditambahkan. Karena itu subgrup ini tidak termasuk bijeksi korespondensi.`,`The subgroup ${setText(H)} still has an image, but lifting it back gives ${setText(lifted)}. The element 6 and its partners are added. This is why this subgroup is excluded from the correspondence bijection.`)}</p></div>}
      <p className="mt-3 text-xs leading-relaxed text-slate-400">{t('Inklusi juga terjaga: K ⊆ H ⊆ G menjadi {identitas} ⊆ H/K ⊆ G/K. Secara umum, normalitas H di G setara dengan normalitas H/K di G/K.','Inclusion is preserved: K ⊆ H ⊆ G becomes {identity} ⊆ H/K ⊆ G/K. In general, H is normal in G exactly when H/K is normal in G/K.')}</p>
    </>}
    {theorem==='first'&&<>
      <p className="mt-4 text-sm leading-7 text-slate-300">{t('Teorema pertama mengatakan G/kernel cocok secara struktur dengan image peta. Semua anggota yang tidak dapat dibedakan oleh π digabung; tidak ada informasi tambahan yang hilang setelah itu.','The first theorem says G/kernel has the same group structure as the map’s image. All elements indistinguishable under π are merged; no further information is lost.')}</p>
      <label className="mt-3 block text-xs text-slate-400">{t('Pilih wakil a','Choose representative a')}<select value={representative} onChange={e=>setRepresentative(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-slate-900 p-2 text-slate-100">{GROUP.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">a = {representative}</p><Elements elements={GROUP} highlight={coset(representative%6)} /></div><div className="rounded-lg border border-accent p-3"><p className="text-sm text-accent">a+K = {setText(coset(representative%6))}</p><p className="mt-3 text-xs text-slate-400">{t('Satu anggota G/K','One element of G/K')}</p></div><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">π(a) = [{representative%6}]₆</p><p className="mt-3 text-xs text-slate-400">{t('Satu anggota image','One element of the image')}</p></div></div>
      <FormulaBlock tex={String.raw`\mathbb Z_{12}/\{0,6\}\cong\mathbb Z_6,\quad a+K\mapsto[a]_6`} />
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('Syarat: π homomorfisma. Isomorfisma selalu menuju image π; surjektivitas diperlukan jika ingin menuju seluruh target. Wakil 2 dan 8 memberi koset dan image yang sama.','Condition: π is a homomorphism. The isomorphism always reaches image π; surjectivity is required to reach the entire target. Representatives 2 and 8 give the same coset and image.')}</p>
    </>}
    {theorem==='second'&&<>
      <p className="mt-4 text-sm leading-7 text-slate-300">{t('Teorema kedua membandingkan dua cara melihat H ketika unsur N dianggap identitas: gabungkan H dengan N lalu bagi N, atau buang hanya bagian N yang sudah berada dalam H.','The second theorem compares two ways to view H when N becomes the identity: join H with N and quotient by N, or remove only the part of N already inside H.')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">H = ⟨4⟩ = {setText(subgroup(4))}</p><Elements elements={GROUP} highlight={subgroup(4)} /><p className="mt-3 text-xs text-slate-400">N = K = {setText(KERNEL)}; H ∩ N = {'{0}'}</p></div><div className="rounded-lg border border-accent p-3"><p className="text-sm text-accent">H+N = {setText(subgroup(2))}</p><div className="mt-3 space-y-2">{[0,2,4].map(n=><p key={n} className="text-xs text-slate-300">{setText(coset(n))} → [{n}]₆</p>)}</div></div></div>
      <FormulaBlock tex={String.raw`(H+N)/N\cong H/(H\cap N),\quad |(H+N)/N|=6/2=3/1=|H/(H\cap N)|`} />
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('Syarat cukup: H subgrup G, N normal di G. Peta h ↦ h+N dari H memiliki kernel H∩N dan image (H+N)/N. Pada contoh, 0,4,8 menjadi [0],[4],[2]; tiga anggota tetap berbeda.','Sufficient conditions: H is a subgroup of G and N is normal in G. The map h ↦ h+N on H has kernel H∩N and image (H+N)/N. Here 0,4,8 become [0],[4],[2]; the three elements remain distinct.')}</p>
    </>}
    {theorem==='third'&&<>
      <p className="mt-4 text-sm leading-7 text-slate-300">{t('Teorema ketiga mengatakan penggabungan dua tahap memberi hasil yang sama dengan langsung menggabungkan berdasarkan subgrup normal yang lebih besar.','The third theorem says merging in two stages gives the same result as directly merging by the larger normal subgroup.')}</p>
      <div className="mt-4 grid gap-3"><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">G = Z₁₂</p><Elements elements={GROUP} highlight={KERNEL} /></div><ArrowDown size={18} className="mx-auto text-accent" /><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">G/K ≅ Z₆; N/K = {'{[0],[2],[4]}'}</p><Elements elements={[0,1,2,3,4,5]} highlight={[0,2,4]} /></div><ArrowDown size={18} className="mx-auto text-accent" /><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-accent p-3"><p className="text-sm text-accent">{'{[0],[2],[4]}'}</p><p className="mt-2 text-xs text-slate-400">{t('kelas genap','even class')}</p></div><div className="rounded-lg border border-border p-3"><p className="text-sm text-slate-100">{'{[1],[3],[5]}'}</p><p className="mt-2 text-xs text-slate-400">{t('kelas ganjil','odd class')}</p></div></div></div>
      <FormulaBlock tex={String.raw`K=\{0,6\}\subseteq N=\{0,2,4,6,8,10\}\triangleleft G,\quad(G/K)/(N/K)\cong G/N\cong\mathbb Z_2`} />
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('Syarat: K ⊆ N dan keduanya normal di G. Peta a+K ↦ a+N memiliki kernel N/K. Langsung dari Z₁₂, hasilnya juga dua kelas genap dan ganjil.','Conditions: K ⊆ N and both are normal in G. The map a+K ↦ a+N has kernel N/K. Directly from Z₁₂, the result is also the two even and odd classes.')}</p>
    </>}
    <details className="mt-4 rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm text-slate-300">{t('Mengapa kedua arah korespondensi saling membatalkan?','Why do the two correspondence directions undo each other?')}</summary><p className="mt-3 text-sm leading-relaxed text-slate-300">{t('Jika g punya image yang sama dengan h ∈ H, maka h⁻¹g ada dalam K. Jadi g ada dalam H tepat ketika semua K sudah termuat dalam H. Dalam arah sebaliknya, image dari seluruh preimage L kembali ke L karena π surjektif.','If g has the same image as h ∈ H, then h⁻¹g lies in K. Thus g is in H exactly when the whole kernel is already included in H. Conversely, the image of the full preimage of L returns L because π is surjective.')}</p><FormulaBlock tex={String.raw`\pi^{-1}(\pi(H))=HK,\quad K\subseteq H\implies HK=H,\quad\pi(\pi^{-1}(L))=L`} /></details>
    <p className="mt-4 text-xs text-slate-400">{t('Syarat teorema dirujuk silang dengan','The theorem conditions are cross-referenced with')} <a href="https://jmilne.org/math/CourseNotes/GTe6.pdf#page=46" target="_blank" rel="noreferrer" className="text-accent underline">J. S. Milne, Group Theory, §1</a>. {t('Contoh kisi memakai grup siklik abelian; normalitas otomatis pada contoh ini, tetapi tetap syarat penting pada grup umum.','The lattice example uses an abelian cyclic group; normality is automatic here but remains an important condition in general groups.')}</p>
  </section>
}
