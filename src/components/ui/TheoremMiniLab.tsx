import { useState } from 'react'
import type { VisualTheorem } from '../../content/summary-theorems'
import { FormulaBlock } from './FormulaBlock'
import { SubsectionDiagram } from './SubsectionDiagram'
import { DiagramViewport } from './DiagramViewport'
import { CONCEPT_STORIES, StoryPlayer } from './VisualStory'

export function TheoremMiniLab({theorems,lang,selectedIndex,kind}:{theorems:VisualTheorem[];lang:'id'|'en';selectedIndex?:number;kind?:string}) {
  const [index,setIndex]=useState(0)
  const active=selectedIndex??index
  const theorem=theorems[active]
  const story=kind?CONCEPT_STORIES[`${kind}:${active}`]:undefined
  return <section className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 sm:p-5">
    <h4 className="text-lg font-semibold text-slate-100">{theorem.title[lang]}</h4>
    {selectedIndex===undefined&&<label className="mt-4 block text-xs text-slate-400">{lang==='en'?'Theorem to explore':'Teorema untuk dipelajari'}
      <select value={index} onChange={e=>setIndex(Number(e.target.value))} className="mt-2 w-full min-w-0 rounded-lg border border-border bg-slate-900 p-3 text-sm text-slate-100">{theorems.map((t,i)=><option value={i} key={i}>{t.title[lang]}</option>)}</select>
    </label>}
    <p className="mt-4 text-sm leading-7 text-slate-300">{theorem.statement[lang]}</p>
    {story?<div className="my-4"><StoryPlayer key={active} story={story} lang={lang}/></div>:theorem.scene==='supplement'?<SubsectionDiagram key={active} theorem={theorem} lang={lang}/>:<TheoremPicture key={active} theorem={theorem} lang={lang}/>}
    <FormulaBlock tex={theorem.tex}/>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div><h5 className="text-sm font-semibold text-accent">{lang==='en'?'Why it follows':'Mengapa hasilnya demikian'}</h5><p className="mt-2 text-sm leading-7 text-slate-300">{theorem.why[lang]}</p></div>
      <div><h5 className="text-sm font-semibold text-amber-400">{lang==='en'?'Conditions':'Syarat'}</h5><p className="mt-2 text-sm leading-7 text-slate-300">{theorem.conditions[lang]}</p></div>
    </div>
  </section>
}

function TheoremPicture({theorem,lang}:{theorem:VisualTheorem;lang:'id'|'en'}) {
  const [value,setValue]=useState(theorem.scene==='triangle'?60:theorem.scene==='hyperbola'||theorem.scene==='parabola'?0:theorem.scene==='sphere'||theorem.scene==='classification'?1:2)
  const [classes,setClasses]=useState<number[]>([])
  const scene=theorem.scene
  const t=(id:string,en:string)=>lang==='en'?en:id
  const line=(x1:number,y1:number,x2:number,y2:number,color='#38bdf8')=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3"/>
  const text=(x:number,y:number,s:string,color='#cbd5e1')=><text x={x} y={y} fill={color} fontSize="13" textAnchor="middle">{s}</text>
  const dot=(x:number,y:number,label:string,color='#38bdf8')=><g><circle cx={x} cy={y} r="5" fill={color}/>{text(x,y-12,label,color)}</g>
  const box=(x:number,y:number,label:string,color='#38bdf8',width=100)=><g><rect x={x} y={y} width={width} height="40" rx="8" fill={`${color}15`} stroke={color}/>{text(x+width/2,y+25,label,color)}</g>
  const circle=(r=75)=><circle cx="210" cy="115" r={r} fill="none" stroke="#64748b" strokeWidth="2"/>
  let drawing:React.ReactNode
  let result=''
  let slider:{min:number;max:number;step:number;label:string}|undefined
  switch(scene) {
    case 'hyperbola': {
      slider={min:-1.5,max:1.5,step:.1,label:t('Parameter t pada cabang kanan','Parameter t on the right branch')}
      const c=Math.sqrt(5),x=2*Math.cosh(value),y=Math.sinh(value),p=[210+x*35,125-y*35]
      const d1=Math.hypot(x+c,y),d2=Math.hypot(x-c,y)
      const branch=(sign:number)=>Array.from({length:61},(_,i)=>{const t=-1.5+i*.05;return `${i?'L':'M'}${210+sign*2*Math.cosh(t)*35},${125-Math.sinh(t)*35}`}).join(' ')
      drawing=<><path d={branch(1)} fill="none" stroke="#38bdf8" strokeWidth="2"/><path d={branch(-1)} fill="none" stroke="#38bdf8" strokeWidth="2"/>{dot(210-c*35,125,'F₋')}{dot(210+c*35,125,'F₊')}{line(p[0],p[1],210-c*35,125,'#a78bfa')}{line(p[0],p[1],210+c*35,125,'#fb7185')}{dot(p[0],p[1],'P','#fb7185')}</>;result=`|PF₋| − |PF₊| = ${d1.toFixed(3)} − ${d2.toFixed(3)} = 4`;break
    }
    case 'parabola': {
      slider={min:-2,max:2,step:.25,label:t('Koordinat y dari P','P coordinate y')}
      const x=value*value/4,px=160+x*40,py=125-value*40
      const path=Array.from({length:61},(_,i)=>{const y=-2.5+i/12;return `${i?'L':'M'}${160+y*y*10},${125-y*40}`}).join(' ')
      drawing=<><path d={path} fill="none" stroke="#38bdf8" strokeWidth="2"/>{line(120,15,120,235,'#a78bfa')}{text(80,235,'x = −1')}{dot(200,125,'F = (1,0)')}{line(px,py,120,py,'#a78bfa')}{line(px,py,200,125,'#fb7185')}{dot(px,py,'P','#fb7185')}</>;result=`P = (${x.toFixed(3)}, ${value}); both distances = ${(x+1).toFixed(3)}`;break
    }
    case 'triangle': {
      slider={min:0,max:180,step:5,label:t('Sudut antar vektor','Angle between vectors')}
      const x=210+70*Math.cos(value*Math.PI/180),y=170-70*Math.sin(value*Math.PI/180)
      drawing=<>{line(70,170,210,170)}{line(210,170,x,y,'#a78bfa')}{line(70,170,x,y,'#fb7185')}{dot(70,170,'0')}{dot(210,170,'a')}{dot(x,y,'a+b','#fb7185')}{text(140,195,'|a| = 2')}{text(280,205,'|b| = 1')}</>
      result=`1 ≤ |a+b| = ${Math.sqrt(5+4*Math.cos(value*Math.PI/180)).toFixed(3)} ≤ 3`;break
    }
    case 'rootSum': case 'polynomialRoots': {
      if(scene==='rootSum')slider={min:2,max:6,step:1,label:t('Jumlah akar n','Number of roots n')}
      const n=scene==='rootSum'?value:3
      drawing=<>{circle()}{Array.from({length:n},(_,i)=>{const x=210+75*Math.cos(2*Math.PI*i/n),y=115-75*Math.sin(2*Math.PI*i/n);return <g key={i}>{line(210,115,x,y)}{dot(x,y,`ω${i}`)}</g>})}{dot(210,115,'Σ = 0','#fb7185')}</>;result=scene==='rootSum'?`1 + ω + ⋯ + ω${n-1} = 0`:'z³−1 = (z−1)(z−ω)(z−ω²)';break
    }
    case 'constant':drawing=<><ellipse cx="110" cy="110" rx="75" ry="60" fill="#38bdf815" stroke="#38bdf8"/><ellipse cx="305" cy="110" rx="75" ry="60" fill="#a78bfa15" stroke="#a78bfa"/>{text(110,105,'f′ = 0 → f = c₁')}{text(305,105,'f′ = 0 → f = c₂')}{text(210,210,'c₁ ≠ c₂ is possible')}</>;break
    case 'cauchy':slider={min:1,max:10,step:.5,label:t('Radius R, batas global M = 6','Radius R, global bound M = 6')};drawing=<>{circle(35+value*6)}{dot(210,115,'a')}{line(210,115,245+value*6,115)}{text(210,215,`R = ${value}, M = 6`)}{text(210,25,`|f′(a)| ≤ ${(6/value).toFixed(2)}`,'#fb7185')}</>;result=`M/R = ${(6/value).toFixed(3)}`;break
    case 'essential': {
      slider={min:1,max:12,step:1,label:'k'}
      const denom=Math.log(2)**2+(2*Math.PI*value)**2,x=Math.log(2)/denom,y=-2*Math.PI*value/denom
      drawing=<>{line(50,110,180,110,'#64748b')}{line(110,30,110,210,'#64748b')}{dot(110,110,'0','#fb7185')}{dot(110+x*500,110-y*500,'zₖ')}{text(215,100,'e^(1/z) →')}{dot(335,110,'2')}{text(110,230,'input')}{text(335,230,'output')}</>;result=`|zₖ| = ${(1/Math.sqrt(denom)).toFixed(5)}, e^(1/zₖ) = 2`;break
    }
    case 'powers': case 'primeGroup': case 'cauchyGroup': {
      const n=scene==='powers'?2:scene==='primeGroup'?5:value
      slider=scene==='cauchyGroup'?{min:2,max:3,step:1,label:t('Prima p membagi 12','Prime p dividing 12')}:{min:0,max:scene==='powers'?4:5,step:1,label:t('Langkah k','Step k')}
      const labels=scene==='powers'?['1','3']:scene==='primeGroup'?['0','2','4','1','3']:Array.from({length:n},(_,i)=>String(i*12/n))
      drawing=<>{circle()}{labels.map((l,i)=>{const a=2*Math.PI*i/n;return <g key={i}>{dot(210+75*Math.cos(a),115-75*Math.sin(a),l,scene==='cauchyGroup'||i===value%n?'#fb7185':'#38bdf8')}</g>})}{text(210,115,scene==='powers'?'×3 mod 8':scene==='primeGroup'?'+2 mod 5':`+${12/n} mod 12`)}</>
      result=scene==='powers'?`3^${value} ≡ ${value%2?3:1} (mod 8)`:scene==='primeGroup'?`${value}·2 ≡ ${value*2%5} (mod 5)`:`${n}·${12/n} ≡ 0 (mod 12), order = ${n}`;break
    }
    case 'sign':drawing=<>{box(30,40,'+1: A₃', '#38bdf8',160)}{box(230,40,'−1: odd','#a78bfa',160)}{text(110,115,'e, (123), (132)')}{text(310,115,'(12), (13), (23)')}{text(210,190,'3 elements in each coset')}</>;break
    case 'simple': {
      const sum=1+classes.reduce((a,b)=>a+[12,12,15,20][b],0)
      drawing=<>{[1,12,12,15,20].map((size,i)=><g key={i}>{box(20+i*80,75,String(size),i===0||classes.includes(i-1)?'#38bdf8':'#64748b',65)}</g>)}{text(210,165,`|N| = ${sum}; 60 / ${sum} = ${(60/sum).toFixed(3)}`,60%sum===0?'#38bdf8':'#fb7185')}</>;result=60%sum===0?t('Ukuran mungkin: identitas atau seluruh A₅','Possible size: identity or all of A₅'):t('Bukan pembagi 60: tidak mungkin subgrup','Not a divisor of 60: cannot be a subgroup');break
    }
    case 'finiteField':slider={min:1,max:4,step:1,label:t('Anggota a ≠ 0 di F₅','Nonzero a in F₅')};drawing=<>{Array.from({length:5},(_,i)=><g key={i}>{box(25+i*78,40,String(i),'#38bdf8',60)}{line(55+i*78,85,55+i*78,135)}{box(25+i*78,140,String(i*value%5),i*value%5===1?'#fb7185':'#a78bfa',60)}</g>)}{text(210,120,`×${value} mod 5`)}</>;result=`${value}⁻¹ = ${[0,1,3,2,4][value]} in F₅`;break
    case 'maximal':drawing=<>{box(35,40,'R = Z₆', '#38bdf8',350)}{box(110,100,'M = {0,2,4}', '#a78bfa',200)}{box(35,180,'[0] = {0,2,4}', '#38bdf8',160)}{box(225,180,'[1] = {1,3,5}', '#fb7185',160)}</>;result='Z₆ / (2) ≅ F₂, [1]·[1] = [1]';break
    case 'euclid':drawing=<>{['f: deg 4','g: deg 3','r₁: deg 2','r₂: deg 1','0: stop'].map((s,i)=><g key={i}>{box(30+i*65,35+i*35,s,i===4?'#fb7185':'#38bdf8',120)}</g>)}</>;result=t('Derajat turun setiap pembagian; substitusi balik memberi Bézout.','Degrees descend at each division; back substitution gives Bézout.');break
    case 'extension':drawing=<>{['0','1','x','x+1'].map((s,i)=><g key={i}>{box(35+(i%2)*190,45+Math.floor(i/2)*90,s,i===0?'#64748b':'#38bdf8',150)}</g>)}{text(210,225,'x(x+1) = x²+x = (x+1)+x = 1')}</>;result='q(0) = 1, q(1) = 1 in F₂; no root → irreducible quadratic';break
    case 'factors':drawing=<>{box(145,25,'x³+1', '#38bdf8',130)}{line(175,70,110,130)}{line(245,70,310,130)}{box(35,135,'x+1', '#a78bfa',150)}{box(225,135,'x²−x+1', '#a78bfa',160)}{text(210,225,'Q[x]: irreducible leaves')}</>;break
    case 'coefficients':slider={min:0,max:3,step:1,label:t('Pilih pasangan koefisien','Choose coefficient pair')};drawing=<>{['0','1','x','1+x'].map((s,i)=><g key={i}>{box(35+(i%2)*190,45+Math.floor(i/2)*90,s,i===value?'#fb7185':'#38bdf8',150)}</g>)}</>;result=`a₀ = ${value%2}, a₁ = ${Math.floor(value/2)}; 2 × 2 = 4 classes`;break
    case 'rational': {
      const candidates=[-3,-1.5,-1,-.5,.5,1,1.5,3]
      slider={min:0,max:7,step:1,label:t('Pilih calon akar','Choose a root candidate')};const x=candidates[value],f=2*x*x+x-3
      drawing=<>{candidates.map((v,i)=><g key={i}>{box(15+(i%4)*100,50+Math.floor(i/4)*90,String(v),i===value?'#fb7185':'#38bdf8',90)}</g>)}</>;result=`f(${x}) = ${f} ${f===0?'✓ root':'≠ 0'}`;break
    }
    case 'classification':slider={min:-2,max:2,step:.25,label:'k'};drawing=<>{value>0?circle(55*Math.sqrt(value)):value===0?dot(210,115,'(0,0)'):text(210,115,'∅','#fb7185')}{text(210,220,`X² + Y² = ${value}`)}</>;result=value>0?`radius = √k = ${Math.sqrt(value).toFixed(3)}`:value===0?t('Satu titik','One point'):t('Tidak ada solusi nyata','No real solutions');break
    case 'area':slider={min:.5,max:2.5,step:.25,label:t('Skala s','Scale s')};drawing=<>{box(35,75,'area 1','#38bdf8',80)}{text(165,105,'A →')}{box(210,75,`area ${value}`,'#a78bfa',70*value)}{text(210,195,`det diag(${value},1) = ${value}`)}</>;break
    case 'sphere': {
      slider={min:0,max:4,step:.25,label:t('Jarak bidang d; R = 3','Plane distance d; R = 3')}
      const y=135-25*value,r=value<=3?25*Math.sqrt(9-value*value):0
      drawing=<><circle cx="210" cy="135" r="75" fill="none" stroke="#64748b" strokeWidth="2"/>{line(70,y,350,y,'#a78bfa')}{line(210,135,210,y)}{dot(210,135,'O')}{value<3&&<>{line(210,y,210+r,y,'#fb7185')}{line(210,135,210+r,y,'#38bdf8')}{dot(210+r,y,'slice edge')}</>}{value===3&&dot(210,y,'tangent')}{text(360,y+20,`d=${value}`)}</>;result=value<=3?`r = √(9−${value}²) = ${Math.sqrt(9-value*value).toFixed(3)}`:t('d > R: tidak berpotongan','d > R: no intersection');break
    }
  }
  return <figure className="my-4 min-w-0 rounded-xl border border-border bg-slate-950 p-3 sm:p-4">
    <DiagramViewport lang={lang}><svg viewBox="0 0 420 255" role="img" aria-label={theorem.title[lang]} className="w-full rounded-lg bg-[#101827]">{drawing}</svg></DiagramViewport>
    {slider&&<label className="mt-4 block text-xs text-slate-300">{slider.label}: <strong>{value}</strong><input aria-label={slider.label} type="range" min={slider.min} max={slider.max} step={slider.step} value={value} onChange={e=>setValue(Number(e.target.value))} className="mt-2 block w-full accent-sky-400"/></label>}
    {scene==='simple'&&<div className="mt-3 flex flex-wrap gap-3">{[12,12,15,20].map((n,i)=><label key={i} className="text-xs text-slate-300"><input type="checkbox" checked={classes.includes(i)} onChange={()=>setClasses(classes.includes(i)?classes.filter(c=>c!==i):[...classes,i])}/> {t('Kelas','Class')} {i+1}: {n}</label>)}</div>}
    {result&&<p className="mt-3 break-words font-mono text-xs leading-6 text-accent" aria-live="polite">{result}</p>}
    <figcaption className="mt-3 text-xs leading-6 text-slate-400">{theorem.caption[lang]}</figcaption>
  </figure>
}
