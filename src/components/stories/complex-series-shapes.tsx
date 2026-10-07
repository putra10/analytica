import { Arrow, At, C, Dot, Grid, T, fn, plane, pl, tr, type Lang, type P } from './kit'
import type { SeriesKind } from '../../content/complex-series-topics'

const circle = (o: P, r: number, color: string, fill = false) => <circle cx={o[0]} cy={o[1]} r={r} fill={fill ? color : 'none'} fillOpacity={fill ? .1 : 1} stroke={color} strokeWidth="2" />
const line = (points: P[], color: string, dash?: string) => <path d={pl(points)} fill="none" stroke={color} strokeWidth="2" strokeDasharray={dash} />
const turn = (o: P, r: number, clockwise = false) => {
  const a = Math.PI/3, sign = clockwise ? -1 : 1
  const p = (t: number): P => [o[0]+r*Math.cos(t),o[1]-r*Math.sin(t)]
  return <Arrow from={p(a-sign*.15)} to={p(a+sign*.15)} color={C.v} width={2} head={7} />
}
export function ComplexSeriesScene({ kind, frame: k, value, lang }: { kind: SeriesKind; frame: number; value: number; lang: Lang }) {
  const t = tr(lang)
  if (kind === 'cxSequences') {
    if (k === 3) {
      const p=plane([240,150],82)
      return <><Grid map={p} x={[-1.9,1.9]} y={[-1.25,1.25]}/>{circle(p(0,0),82,C.a)}
        {[0,1,2,3].map(j=><g key={j}><Dot at={p(Math.cos(j*Math.PI/2),Math.sin(j*Math.PI/2))} color={j%2===0?C.r:C.v} r={7}/><T x={240+112*Math.cos(j*Math.PI/2)} y={155-112*Math.sin(j*Math.PI/2)} size={16}>{['1','i','−1','−i'][j]}</T></g>)}
        <T x={240} y={23} size={16}>iⁿ: |iⁿ| = 1</T><T x={240} y={281} size={14} color={C.r}>i⁴ᵏ = 1 ≠ −1 = i⁴ᵏ⁺²</T></>
    }
    const eps=value,n=Math.floor(1/eps)+1,p=plane([90,230],125),o=p(0,1)
    return <><Grid map={p} x={[-.45,1.9]} y={[-.1,1.2]} step={.5}/>{circle(o,125*eps,C.g,true)}<Dot at={o} color={C.y} r={5}/><T x={65} y={o[1]-12} size={15}>L = i</T>
      {Array.from({length:16},(_,i)=>{const j=i+1,point=p(1/j,1);return <g key={j}><Dot at={point} color={j>=n?C.g:C.r} r={j>8?2.5:4}/>{j<4&&<T x={point[0]} y={point[1]+(j%2?27:43)} size={13}>z{['','₁','₂','₃'][j]}</T>}</g>})}
      <T x={320} y={145} size={15}>zₙ = 1/n + i</T><T x={320} y={177} size={15} color={C.g}>n ≥ N = {n}</T>
      <At from={1} frame={k}><T x={320} y={211} size={13}>|Re(zₙ−i)| = 1/n</T><T x={320} y={236} size={13}>|Im(zₙ−i)| = 0</T></At>
      <T x={240} y={26} size={15}>{t('Vertikal: Im z; horizontal: Re z', 'Vertical: Im z; horizontal: Re z')}</T>
      <T x={240} y={284} size={14}>{k<2?'|zₙ−i| = 1/n < ε for n ≥ N':'|Δx+iΔy| ≤ |Δx|+|Δy| < ε'}</T></>
  }
  if (kind === 'cxSeriesConvergence') {
    const n=Math.round(value)
    if(k===4){const x=(l:number)=>52+180*l
      return <><T x={240} y={27} size={16}>{t('Rasio / akar pada |aₙ|', 'Ratio / root tests on |aₙ|')}</T><rect x="52" y="60" width="180" height="155" fill={C.g} fillOpacity=".08"/><rect x="232" y="60" width="180" height="155" fill={C.r} fillOpacity=".08"/>{line([[52,215],[412,215]],C.ln)}{line([[232,60],[232,215]],C.y,'4 4')}
        <T x={142} y={89} size={14} color={C.g}>L &lt; 1</T><T x={322} y={89} size={14} color={C.r}>L &gt; 1</T><T x={142} y={117} size={13}>{t('Absolut konvergen', 'Absolutely convergent')}</T><T x={322} y={117} size={13}>{t('Divergen', 'Divergent')}</T>
        <Dot at={[x(2/(n+1)),156]} color={C.a} r={5}/><Arrow from={[x(2/(n+1)),156]} to={[x(0),156]} color={C.a} head={6}/><Dot at={[x(n/(2*n+1)),183]} color={C.v} r={5}/><Arrow from={[x(n/(2*n+1)),183]} to={[x(.5),183]} color={C.v} head={6}/><T x={232} y={239} size={14} color={C.y}>L=1: {t('belum pasti', 'inconclusive')}</T><T x={240} y={269} size={13}>aₙ=(2i)ⁿ/n!: {t('rasio', 'ratio')}={ (2/(n+1)).toFixed(3) } → 0</T><T x={240} y={291} size={13}>bₙ=[in/(2n+1)]ⁿ: {t('akar', 'root')}={ (n/(2*n+1)).toFixed(3) } → 1/2</T></>
    }
    if(k===1){const p=plane([52,237],1),points:P[]=[],scaleX=17,scaleY=48;let sum=0
      for(let j=1;j<=22;j++){sum+=1/j;points.push(p(j*scaleX,sum*scaleY))}
      return <>{line([p(0,0),p(390,0)],C.ln)}{line([p(0,0),p(0,190)],C.ln)}{line(points,C.r)}{points.filter((_,i)=>i%3===0).map((q,i)=><Dot key={i} at={q} color={C.r} r={3}/>)}<T x={240} y={25} size={17}>aₙ = 1/n → 0</T><T x={240} y={61} size={16} color={C.r}>Sₙ = 1 + 1/2 + ⋯ + 1/n → ∞</T><T x={440} y={257} size={13}>n</T><T x={32} y={68} size={13}>Sₙ</T><T x={240} y={283} size={14}>{t('Suku kecil belum menjamin jumlah hingga.', 'Small terms do not guarantee a finite sum.')}</T></>
    }
    const p=plane([68,229],230),points:P[]=[p(0,0)];let x=0,y=0
    for(let j=0;j<=n;j++){const r=2**(-j),a=j*Math.PI/2;x+=r*Math.cos(a);y+=r*Math.sin(a);points.push(p(x,y))}
    const target=p(.8,.4),last=points[points.length-1],error=Math.hypot(last[0]-target[0],last[1]-target[1])
    return <><Grid map={p} x={[-.15,1.45]} y={[-.1,.75]} step={.25}/>{points.slice(1).map((q,i)=><Arrow key={i} from={points[i]} to={q} color={i%2?C.v:C.a} width={2} head={6}/>)}<Dot at={last} color={C.a} r={5}/><Dot at={target} color={C.g} r={5}/><T x={346} y={105} size={14} color={C.g}>S = 4/5 + 2i/5</T><T x={346} y={137} size={14}>N = {n}</T><T x={240} y={26} size={16}>Σ(i/2)ⁿ, n = 0,1,2,…</T>
      <At from={2} frame={k}>{circle(target,Math.max(error,3),C.y)}<T x={346} y={180} size={14} color={C.y}>|S−Sₙ|</T><T x={346} y={204} size={14} color={C.y}>≈ {(2**(-n)/Math.sqrt(5)).toFixed(5)}</T></At>
      <T x={240} y={284} size={14}>{k===2?'|Sₘ−Sₙ| ≤ Σ |aⱼ| (tail)':'|q| = 1/2 < 1 ⇒ Sₙ → S'}</T></>
  }
  if(kind==='cxZeros'){
    const m=Math.round(value),o:P=[113,148],w:P=[364,148],rho=.7,imageRadius=74*rho**(m-1)
    if(k===0)return <><T x={240} y={30} size={17}>f(z)=zᵐ, m={m}</T><T x={240} y={70} size={15}>f⁽ʲ⁾(0) / j!</T>{Array.from({length:5},(_,j)=><g key={j}><rect x={35+j*85} y="112" width="70" height="71" rx="10" fill={j===m?C.soft:'none'} stroke={j===m?C.g:C.ln}/><T x={70+j*85} y={139} size={14}>j={j}</T><T x={70+j*85} y={166} size={18} color={j===m?C.g:C.mu}>{j===m?'1':'0'}</T></g>)}<T x={240} y={226} size={15} color={C.g}>{t('Koefisien pertama tak nol: j=m', 'First nonzero coefficient: j=m')}</T><T x={240} y={277} size={14}>f⁽ᵐ⁾(0)=m!={ [1,1,2,6,24][m] }</T></>
    if(k===3)return <><T x={240} y={31} size={16}>{t('Pengecualian: identik nol', 'Exception: identically zero')}</T>{circle(o,80,C.a)}{circle(w,80,C.ln)}{Array.from({length:18},(_,j)=>{const a=j*Math.PI/9;return <Dot key={j} at={[o[0]+62*Math.cos(a),o[1]-62*Math.sin(a)]} color={C.a} r={4}/>})}<Arrow from={[213,148]} to={[265,148]} color={C.v}/><Dot at={w} color={C.g} r={7}/><T x={364} y={182} size={14}>f(z)=0</T><T x={240} y={253} size={14}>f⁽ⁿ⁾(a)=0 {t('untuk semua n', 'for every n')}</T><T x={240} y={280} size={13} color={C.r}>{t('Tak ada orde nol hingga; semua titik nol.', 'No finite zero order; every point is a zero.')}</T></>
    return <>{circle(o,74,C.a)}{circle(w,imageRadius,C.g)}<Dot at={o} color={C.r} r={5}/><Dot at={w} color={C.r} r={5}/><T x={113} y={32} size={16}>z = ρeⁱᶿ</T><T x={364} y={32} size={16}>f(z) = zᵐ</T><Arrow from={[203,148]} to={[266,148]} color={C.v}/>
      {Array.from({length:16},(_,j)=>{const a=j*Math.PI/8;return <g key={j}><Dot at={[o[0]+74*Math.cos(a),o[1]-74*Math.sin(a)]} color={j<8?C.a:C.y} r={3}/><Dot at={[w[0]+imageRadius*Math.cos(m*a),w[1]-imageRadius*Math.sin(m*a)]} color={j<8?C.a:C.y} r={3}/></g>})}{turn(o,74)}{turn(w,imageRadius)}
      <T x={113} y={246} size={14}>ρ = 0.7</T><T x={364} y={246} size={14}>|f| = ρᵐ = {(rho**m).toFixed(3)}</T>
      <T x={240} y={279} size={13}>{[t('Turunan pertama tak nol: ke-m', 'First nonzero derivative: number m'),t('Faktorisasi: f = zᵐ · 1', 'Factorization: f = zᵐ · 1'),t('g=1 ≠ 0: hanya z=0 yang nol', 'g=1 ≠ 0: only z=0 is a zero'),t('Model ini berbeda dari f ≡ 0', 'This model differs from f ≡ 0')][k]}</T>
      <T x={240} y={66} size={14} color={C.v}>{t('Bayangan berputar', 'Image winds')} {m}×</T></>
  }
  if(kind==='cxZeroPole'){
    const s=Math.round(value)
    return <><T x={240} y={29} size={17}>Fₛ(z) = (eᶻ−1)/zˢ</T><T x={240} y={65} size={14}>eᶻ−1 = z(1+z/2+⋯)</T>
      <T x={95} y={109} size={15}>{t('Pembilang r=1', 'Numerator r=1')}</T><T x={355} y={109} size={15}>{t('Penyebut s=', 'Denominator s=')}{s}</T>
      <circle cx="95" cy="157" r="24" fill={C.soft} stroke={C.a}/><T x={95} y={164} color={C.a}>z</T>
      {Array.from({length:s},(_,j)=><g key={j}><circle cx={303+j*52} cy="157" r="22" fill="none" stroke={j===0?C.a:C.r} strokeWidth="2"/><T x={303+j*52} y={164} color={j===0?C.a:C.r}>z</T><At from={1} frame={k}>{j===0&&<path d="M282,178 L324,136" stroke={C.a} strokeWidth="3"/>}</At></g>)}
      <At from={1} frame={k}><path d="M73,178 L117,136" stroke={C.a} strokeWidth="3"/><T x={240} y={219} size={16}>Fₛ(z) = z⁽¹⁻ˢ⁾(1+z/2+⋯)</T></At>
      <At from={2} frame={k}><T x={240} y={253} size={15} color={s===1?C.g:C.r}>{s===1?t('Removable: F₁(0)=1', 'Removable: F₁(0)=1'):t(`Pole berorde ${s-1}`,`Pole of order ${s-1}`)}</T></At>
      <T x={240} y={285} size={14}>{k===3?(s===1?'Res₀ F₁ = 0':s===2?'Res₀ F₂ = 1':'Res₀ F₃ = 1/2'):t('Lubang asli perlu diisi untuk perluasan.', 'The original hole needs an extension.')}</T></>
  }
  if(kind==='cxLocalBehavior'){
    const d=value
    if(k===0||k===1){const p=plane([48,236],1),points=Array.from({length:70},(_,j)=>{const x=.1+j*.9/69;return p(360*x, k===0?100*(Math.sin(x)/x):20/x)})
      return <>{line([p(0,0),p(390,0)],C.ln)}{line([p(0,0),p(0,205)],C.ln)}{line(points,k===0?C.g:C.r)}<Dot at={p(360*d,k===0?100*Math.sin(d)/d:20/d)} color={C.y}/><T x={240} y={28} size={16}>{k===0?'f(t)=sin(t)/t':'|f(t)| = 1/t'}</T><T x={240} y={62} size={14}>{k===0?'limₜ→₀ sin(t)/t = 1':'1/f(z) = z → 0'}</T><T x={442} y={257} size={14}>t</T><T x={240} y={282} size={13}>{k===0?t('Irisan real; Taylor membuktikan semua arah.', 'Real slice; Taylor proves every direction.'):t('Modulus pole membesar dari semua arah.', 'Pole modulus grows along every direction.')}</T></>
    }
    if(k===2){const o:P=[114,156],r=76;return <>{circle(o,r,C.ln)}<Arrow from={[o[0]+r,o[1]]} to={[o[0]+8,o[1]]} color={C.r}/><Arrow from={[o[0]-r,o[1]]} to={[o[0]-8,o[1]]} color={C.g}/><Arrow from={[o[0],o[1]-r]} to={[o[0],o[1]-8]} color={C.v}/><Dot at={o} color={C.y} hollow r={5}/><T x={240} y={29} size={17}>f(z)=e¹ᐟᶻ, t = {d.toFixed(1)}</T><T x={332} y={104} size={14} color={C.r}>z=t: |f| ≈ {Math.exp(1/d).toFixed(1)}</T><T x={332} y={156} size={14} color={C.g}>z=−t: |f| ≈ {Math.exp(-1/d).toFixed(5)}</T><T x={332} y={208} size={14} color={C.v}>z=it: |f|=1</T><T x={240} y={278} size={13}>{t('Tiga jalur, tiga perilaku: essential.', 'Three paths, three behaviors: essential.')}</T></>}
    const o:P=[105,151],target:P=[369,151]
    return <>{circle(o,78,C.a)}{circle(o,40,C.a)}<Dot at={o} color={C.r} hollow/><T x={105} y={39} size={15}>0 &lt; |z| &lt; δ</T><Arrow from={[196,151]} to={[255,151]} color={C.v}/>{circle(target,69,C.ln)}{circle(target,30,C.g,true)}<Dot at={target} color={C.y} r={5}/><T x={369} y={41} size={15}>|f(z)−w₀| &lt; ε</T><T x={369} y={171} size={12}>w₀</T>{[[13,0],[-6,19],[-11,-10],[21,-9]].map((p,j)=><Dot key={j} at={[target[0]+p[0],target[1]+p[1]]} color={C.g} r={3}/>)}<T x={240} y={255} size={14}>{t('Bayangan dekat setiap target w₀.', 'The image approaches every target w₀.')}</T><T x={240} y={282} size={13} color={C.r}>{t('Dekat tidak berarti tepat; e¹ᐟᶻ ≠ 0.', 'Close does not mean exact; e¹ᐟᶻ ≠ 0.')}</T></>
  }
  if(kind==='cxResidueInfinity'){
    const r=value,o:P=[115,151],w:P=[367,151],rad=80*(2/r)
    return <>{circle(o,80,C.a)}{circle(w,rad,C.g)}{turn(o,80)}{turn(w,rad,true)}<T x={115} y={30} size={16}>|z| = R = {r.toFixed(1)}</T><T x={367} y={30} size={16}>|w| = 1/R</T><Arrow from={[210,151]} to={[264,151]} color={C.v}/><T x={237} y={115} size={13}>w=1/z</T><Dot at={o} color={C.r} r={4}/><Dot at={[o[0]+80/r,o[1]]} color={C.r} r={4}/><T x={o[0]-12} y={178} size={13}>0</T><T x={o[0]+80/r} y={178} size={13}>1</T><Dot at={w} color={C.y} hollow r={5}/><T x={w[0]} y={178} size={13}>w=0 ↔ ∞</T>
      <T x={115} y={250} size={14} color={C.a}>2+3 = 5</T><T x={367} y={250} size={14} color={C.g}>{k<2?'dz = −dw/w²':'Res∞ f = −5'}</T><T x={240} y={282} size={13}>{k===3?'Σ Resfinite + Res∞ = 5−5 = 0':k===2?'f(z) = 5/z + 3/z² + ⋯':'f(z) = (5z−2)/(z(z−1))'}</T></>
  }
  const r=value,p=plane([139,181],98/r)
  return <>{line([p(-r-1,0),p(r+1,0)],C.ln)}{line([p(0,-r*.6),p(0,r*1.2)],C.ln)}<path d={fn(a=>p(r*Math.cos(a),r*Math.sin(a)),0,Math.PI)} fill="none" stroke={C.a} strokeWidth="3"/><Arrow from={p(-r,0)} to={p(r,0)} color={C.a} width={3}/><Arrow from={p(r*Math.cos(Math.PI/3-.1),r*Math.sin(Math.PI/3-.1))} to={p(r*Math.cos(Math.PI/3+.1),r*Math.sin(Math.PI/3+.1))} color={C.a} head={7}/><Dot at={p(0,1)} color={C.g} r={5}/><Dot at={p(0,-1)} color={C.r} r={5}/><T x={161} y={p(0,1)[1]-2} size={13}>i</T><T x={164} y={p(0,-1)[1]+5} size={13}>−i</T><T x={41} y={208} size={13}>−R</T><T x={237} y={208} size={13}>R</T><T x={240} y={28} size={16}>f(z)=1/(z²+1), R={r}</T><T x={361} y={88} size={14} color={C.g}>{k===0?'Cᴿ = segment + arc':'Resᵢ f = 1/(2i)'}</T><T x={361} y={123} size={14}>∮ f dz = π</T><At from={2} frame={k}><T x={361} y={166} size={14} color={C.y}>ML ≤ πR/(R²−1)</T><T x={361} y={194} size={14} color={C.y}>≈ {(Math.PI*r/(r*r-1)).toFixed(3)}</T></At><T x={240} y={255} size={14}>{k===3?'0 ≤ f(x) ≤ 1/x² for |x| ≥ 1':t('Pole bawah tidak dihitung.', 'The lower pole is not counted.')}</T><T x={240} y={283} size={14}>{k===3?t('Kedua ekor konvergen ⇒ integral biasa = π', 'Both tails converge ⇒ ordinary integral = π'):'∫₋ᴿᴿ f(x) dx = π − ∫arc f(z) dz'}</T></>
}
