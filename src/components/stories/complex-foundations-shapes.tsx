import { Arrow, At, C, Dot, Grid, T, plane, pl, tr, type Lang, type P } from './kit'
import type { FoundationsKind } from '../../content/complex-foundations-topics'

const stroke=(points:P[],color:string,dash?:string)=><path d={pl(points)} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={dash}/>
const circle=(center:P,r:number,color:string,fill=false)=><circle cx={center[0]} cy={center[1]} r={r} fill={fill?color:'none'} fillOpacity={fill?.12:1} stroke={color} strokeWidth="2"/>
const contours=(fn:(x:number,y:number)=>number,color:string)=>{
  const p=plane([158,165],70),out:string[]=[]
  for(const level of [-4,-2,0,2,4])for(let i=0;i<34;i++)for(let j=0;j<34;j++){
    const x=-1.6+i*.1,y=-1.6+j*.1,pts:[[number,number],[number,number],[number,number],[number,number]]=[[x,y],[x+.1,y],[x+.1,y+.1],[x,y+.1]],hits:P[]=[]
    for(let e=0;e<4;e++){
      const a=pts[e],b=pts[(e+1)%4],fa=fn(...a)-level,fb=fn(...b)-level
      if((fa<=0&&fb>0)||(fa>0&&fb<=0)){const r=fa/(fa-fb);hits.push(p(a[0]+r*(b[0]-a[0]),a[1]+r*(b[1]-a[1])))}
    }
    for(let n=0;n+1<hits.length;n+=2)out.push(pl([hits[n],hits[n+1]]))
  }
  return <path d={out.join(' ')} stroke={color} strokeWidth="1.7" fill="none" opacity=".8"/>
}
export function ComplexFoundationsScene({kind,frame:k,value,lang}:{kind:FoundationsKind;frame:number;value:number;lang:Lang}){
  const t=tr(lang)
  if(kind==='cxLimitProof'){
    const eps=value,delta=Math.min(1,eps/3),o:P=[115,160],w:P=[370,160],scale=100
    return <>
      <T x={115} y={30}>z</T><T x={370} y={30}>w = z²</T>
      <At from={1} frame={k}>{circle(o,100,C.ln)}<T x={115} y={53} size={12}>|z−1| &lt; 1</T></At>
      {circle(o,delta*scale,C.a,true)}{circle(w,eps*scale,C.g,true)}<Dot at={o} color={C.a} r={4}/><Dot at={w} color={C.g} r={4}/>
      <Arrow from={[232,160]} to={[265,160]} color={C.v}/>
      {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,r=delta*.85,x=r*Math.cos(a),y=r*Math.sin(a),point:P=[o[0]+100*x,o[1]-100*y],image:P=[w[0]+100*(2*x+x*x-y*y),w[1]-100*(2*y+2*x*y)];return <g key={i}><Dot at={point} color={C.a} r={3}/><At from={2} frame={k}><Dot at={image} color={C.v} r={3}/></At></g>})}
      <T x={115} y={198} size={12}>z₀ = 1</T><T x={370} y={eps*scale+181} size={12}>L = 1</T>
      <At from={2} frame={k}><T x={115} y={232} size={15} color={C.a}>δ = {delta.toFixed(3)}</T><T x={370} y={53} size={15} color={C.g}>ε = {eps.toFixed(2)}</T><T x={240} y={281} size={14}>|z²−1| &lt; 3|z−1| &lt; 3δ ≤ ε</T></At>
      <At from={3} frame={k}>{[0,Math.PI/3,Math.PI].map((a,i)=><path key={i} d={`M${o[0]+delta*80*Math.cos(a)},${o[1]-delta*80*Math.sin(a)} Q${o[0]-delta*40},${o[1]+delta*30} ${o[0]},${o[1]}`} fill="none" stroke={C.y} strokeWidth="1.5"/>)}<T x={240} y={257} size={12}>{t('Sampel menggambar; estimasi membuktikan.', 'Samples illustrate; the bound proves.')}</T></At>
    </>
  }
  if(kind==='cxDerivativeRules'){
    if(k===0){const p=plane([100,245],140);return <><Grid map={p} x={[0,2]} y={[0,1.4]}/><Arrow from={p(0,0)} to={p(.3,.3)} color={C.a}/><Arrow from={p(.3,.3)} to={p(.3,.9)} color={C.g}/><Arrow from={p(0,0)} to={p(.3,.9)} color={C.v} dash="4 4"/><T x={175} y={228} size={14} color={C.a}>f Δg</T><T x={175} y={157} size={14} color={C.g}>g Δf</T><T x={320} y={68} size={16}>f = 1+i, g = 2</T><T x={320} y={101} size={14}>Δf = 0.3i, Δg = 0.3</T><T x={320} y={153} size={15}>fΔg + gΔf</T><T x={320} y={185} size={17} color={C.v}>= 0.3 + 0.9i</T><T x={240} y={280} size={13}>{t('Bentuk linear; ΔfΔg adalah sisa.', 'Linear part; ΔfΔg is the remainder.')}</T></>}
    if(k===1)return <><T x={120} y={36} size={17}>g</T><T x={355} y={36} size={17}>1/g</T>{stroke([[30,165],[210,165]],C.ln)}{stroke([[265,165],[450,165]],C.ln)}<Dot at={[125,165]} color={C.a}/><Arrow from={[125,165]} to={[125,105]} color={C.a}/><Dot at={[350,165]} color={C.g}/><Arrow from={[350,165]} to={[345,215]} color={C.g}/><Arrow from={[220,165]} to={[255,165]} color={C.v}/><T x={120} y={90} color={C.a} size={15}>Δg = 0.2i</T><T x={120} y={195} size={14}>g = 2</T><T x={355} y={110} size={14}>1/(2+0.2i)</T><T x={355} y={135} size={14}>= 0.495−0.0495i</T><T x={355} y={244} size={14} color={C.g}>Δ(1/g) ≈ −Δg/g²</T><T x={240} y={280} size={13} color={C.r}>g ≠ 0</T></>
    const origins:P[]=[[80,180],[242,180],[400,180]],vectors:P[]=[[.18,.08],[.2,.52],[-2.08,.8]],scales=[180,100,31]
    return <>{origins.map((o,i)=>{const tip:P=[o[0]+vectors[i][0]*scales[i],o[1]-vectors[i][1]*scales[i]];return <g key={i}>{circle(o,62,C.ln)}<Dot at={o} color={C.mu} r={4}/><Arrow from={o} to={tip} color={[C.a,C.g,C.v][i]}/><T x={o[0]} y={100} size={15}>{['Δz','Δw ≈ f′Δz','ΔW ≈ g′Δw'][i]}</T><T x={o[0]} y={258} size={13}>{['z₀ = 1+i','w₀ = 2i','W₀ = −4'][i]}</T></g>})}<Arrow from={[147,180]} to={[172,180]} color={C.mu}/><Arrow from={[309,180]} to={[335,180]} color={C.mu}/><T x={240} y={34} size={16}>f(z) = z², g(w) = w²</T><T x={160} y={68} size={14} color={C.g}>f′ = 2+2i</T><T x={325} y={68} size={14} color={C.v}>g′ = 4i</T><At from={3} frame={k}><T x={240} y={288} size={14}>g′f′ = −8+8i</T></At></>
  }
  if(kind==='cxAnalyticIdentity'){
    const o:P=[220,154]
    if(k===3)return <><ellipse cx="110" cy="156" rx="86" ry="98" fill={C.soft} stroke={C.a}/><T x={110} y={151} size={17}>D</T><T x={110} y={179} size={13}>{t('terhubung', 'connected')}</T><Arrow from={[210,156]} to={[267,156]} color={C.v}/>{stroke([[285,156],[460,156]],C.ln)}<Dot at={[360,156]} color={C.g} r={9}/><T x={360} y={129} size={16}>f(z) = c ∈ ℝ</T><T x={360} y={208} size={14}>uₓ = uᵧ = 0</T><T x={240} y={281} size={14}>{t('Analitik + keluaran real ⇒ konstan', 'Analytic + real output ⇒ constant')}</T></>
    return <><ellipse cx={o[0]} cy={o[1]} rx="185" ry="112" fill={k>=2?C.g:C.soft} fillOpacity=".12" stroke={C.a} strokeWidth="2"/><T x={72} y={90} size={18}>D</T>
      {k<2&&Array.from({length:10},(_,i)=>{const p:P=[o[0]+155/(i+1),o[1]];return <g key={i}><Dot at={p} color={C.r} r={i>5?2.5:4}/>{i<3&&<T x={p[0]} y={i%2===0?135:183} size={12}>1/{i+1}</T>}</g>})}
      <Dot at={o} color={C.y} r={6}/><T x={o[0]-15} y={o[1]+25} size={13}>a = 0</T>
      <At from={1} until={1} frame={k}>{circle(o,60,C.v)}<T x={235} y={224} size={13} color={C.v}>h = zᵐq, q(0) ≠ 0</T><T x={240} y={284} size={13} color={C.r}>{t('Nol dekat a membantah nol terisolasi.', 'Nearby zeros contradict isolation.')}</T></At>
      <At from={2} frame={k}>{[[100,145],[157,146],[220,154],[280,159],[344,160]].map((p,i)=><g key={i}>{circle(p as P,47,C.g,true)}<T x={p[0]} y={p[1]-10} size={12} color={C.g}>h ≡ 0</T></g>)}<T x={240} y={282} size={13}>{t('Cakram bertumpang tindih meneruskan identitas.', 'Overlapping discs propagate identity.')}</T></At>
      <At until={0} frame={k}><T x={240} y={283} size={14}>zₙ → a ∈ D, h(zₙ) = 0</T></At>
    </>
  }
  if(kind==='cxHarmonicConjugate'){
    if(k===3){const o:P=[240,145],r=88;return <>{circle(o,r,C.a)}<Dot at={o} color={C.r} r={7} hollow/><T x={240} y={149} size={11} color={C.r}>0</T>{[0,Math.PI/2,Math.PI,3*Math.PI/2].map((a,i)=>{const p:P=[o[0]+r*Math.cos(a),o[1]-r*Math.sin(a)];return <g key={i}><Dot at={p} color={C.g} r={4}/><T x={p[0]+(i===0?38:i===2?-38:0)} y={p[1]+(i===1?-12:i===3?26:4)} size={14}>{['0 → 2π','π/2','π','3π/2'][i]}</T></g>})}<T x={240} y={33} size={16}>u = ln|z|, v = arg z</T><T x={240} y={284} size={14} color={C.r}>∮ dv = 2π ≠ 0</T></>}
    const p=plane([158,165],70)
    return <><Grid map={p} x={[-1.6,1.7]} y={[-1.6,1.7]} step={.5}/>{contours((x,y)=>y*y*y-3*x*x*y,C.a)}<At from={1} frame={k}>{contours((x,y)=>x*x*x-3*x*y*y,C.g)}</At><T x={374} y={58} size={16} color={C.a}>u = y³−3x²y</T><T x={374} y={91} size={16} color={C.g}>{k===0?'vₓ = −uᵧ':'v = x³−3xy²'}</T><T x={374} y={128} size={14}>uₓₓ + uᵧᵧ = 0</T><T x={374} y={160} size={14}>vₓ = −uᵧ</T><T x={374} y={189} size={14}>vᵧ = uₓ</T><At from={2} frame={k}><Dot at={p(1,0)} color={C.v} r={5}/><Arrow from={p(1,0)} to={p(1,-.6)} color={C.a}/><Arrow from={p(1,0)} to={p(1.6,0)} color={C.g}/><T x={374} y={228} size={16}>∇u · ∇v = 0</T></At><T x={240} y={291} size={13}>{t('Kontur untuk konstanta −4,−2,0,2,4', 'Contours at levels −4,−2,0,2,4')}</T></>
  }
  if(kind==='cxElementaryDerivatives'){
    if(k===1||k===3){const yreal=105,yimag=215;return <><T x={240} y={31} size={16}>{t('Nol penyebut = kutub kuosien', 'Denominator zeros = quotient poles')}</T>{stroke([[35,yreal],[455,yreal]],C.ln)}{stroke([[35,yimag],[455,yimag]],C.ln)}<T x={240} y={72} size={14}>tan: z = π/2 + kπ</T><T x={240} y={181} size={14}>tanh: z = i(π/2 + kπ)</T>{[-1,0,1].map(i=><g key={i}><Dot at={[240+i*125,yreal]} color={C.r} r={7} hollow/><Dot at={[240+i*125,yimag]} color={C.v} r={7} hollow/><T x={240+i*125} y={136} size={13}>{['−π/2','π/2','3π/2'][i+1]}</T><T x={240+i*125} y={248} size={13}>{['−πi/2','πi/2','3πi/2'][i+1]}</T></g>)}<T x={240} y={284} size={13}>{k===1?'tan′ = 1/cos²z, cot′ = −1/sin²z':'sin(iy) = i sinh y, cos(iy) = cosh y'}</T></>}
    const p=plane([70,246],70),points=Array.from({length:60},(_,i)=>{const x=i*1.7/59;return p(x,Math.sinh(x))})
    return <><Grid map={p} x={[0,2.6]} y={[0,2.8]}/>{stroke(points,C.g)}<Dot at={p(1,Math.sinh(1))} color={C.v}/><Arrow from={p(.55,Math.sinh(1)-.45*Math.cosh(1))} to={p(1.45,Math.sinh(1)+.45*Math.cosh(1))} color={C.v}/><T x={365} y={68} size={16}>{k===0?'sin z = (eⁱᶻ−e⁻ⁱᶻ)/2i':'sinh z = (eᶻ−e⁻ᶻ)/2'}</T><T x={365} y={109} size={16}>{k===0?'sin′ z = cos z':'sinh′ z = cosh z'}</T><T x={365} y={151} size={14} color={C.g}>sin(iy) = i sinh y</T><T x={365} y={188} size={14} color={C.v}>{t('slope pada y=1', 'slope at y=1')}</T><T x={365} y={218} size={16}>cosh 1 ≈ 1.543</T><T x={240} y={284} size={13}>{t('Irisan imajiner: y ↦ Im sin(iy)', 'Imaginary slice: y ↦ Im sin(iy)')}</T></>
  }
  if(k===0||k===1){const p=plane([230,156],75);return <><Grid map={p} x={[-2.5,2.5]} y={[-1.2,1.4]}/><Dot at={p(0,0)} color={C.mu} r={4}/><Dot at={p(Math.SQRT2-1,0)} color={C.g} r={7}/><Dot at={p(-1-Math.SQRT2,0)} color={C.v} r={7}/><T x={290} y={117} color={C.g} size={14}>ξ₁ = √2−1</T><T x={98} y={202} color={C.v} size={14}>ξ₂ = −1−√2</T><T x={240} y={34} size={17}>z = i: ξ² + 2ξ − 1 = 0</T><At from={1} frame={k}><T x={240} y={253} size={14}>w = iA+2πk {t('atau', 'or')} π−iA+2πk</T><T x={240} y={285} size={14}>A = ln(1+√2)</T></At></>}
  if(k===2)return <>{stroke([[30,150],[455,150]],C.ln)}{stroke([[242,260],[242,45]],C.ln)}{stroke([[30,150],[160,150]],C.r)}{stroke([[320,150],[455,150]],C.r)}<Dot at={[160,150]} color={C.r} hollow/><Dot at={[320,150]} color={C.r} hollow/><T x={160} y={181}>−1</T><T x={320} y={181}>1</T><Dot at={[242,85]} color={C.g}/><T x={260} y={84} size={14}>i</T><T x={240} y={30} size={17}>{t('Cabang utama Arcsin', 'Principal Arcsin branch')}</T><T x={240} y={224} size={14}>{t('Merah: potongan dikeluarkan', 'Red: excluded cuts')}</T><T x={240} y={282} size={14}>Arcsin′(i) = 1/√2</T></>
  return <><T x={240} y={25} size={17}>{t('Turunkan pada cabang yang sama', 'Differentiate on the same branch')}</T><T x={240} y={54} size={14}>Arcsin′ = 1/√(1−z²)</T><T x={240} y={80} size={14}>Arccos′ = −1/√(1−z²)</T>{stroke([[48,180],[432,180]],C.ln)}{stroke([[240,250],[240,108]],C.ln)}<path d={pl(Array.from({length:80},(_,i)=>{const x=-.9+i*1.8/79;return [240+180*x,180-55*Math.asin(x)] as P}))} fill="none" stroke={C.a} strokeWidth="3"/><Dot at={[240,180]} color={C.g}/><T x={446} y={184} size={13}>x</T><T x={267} y={118} size={13}>Arcsin x</T><T x={65} y={205} size={13}>−1</T><T x={418} y={205} size={13}>1</T><T x={224} y={203} size={12}>0</T><T x={240} y={280} size={13}>{t('Irisan real −1<x<1; akar positif', 'Real slice −1<x<1; positive root')}</T></>
}
