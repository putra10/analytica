import { useState, type ReactNode } from 'react'
import { DiagramViewport } from './DiagramViewport'
import type { VisualTheorem } from '../../content/summary-theorems'

type P=[number,number]
const blue='#38bdf8',red='#fb7185',purple='#a78bfa',muted='#94a3b8'
const label=(x:number,y:number,s:string,color=muted,size=14)=><text x={x} y={y} textAnchor="middle" fill={color} fontSize={size}>{s}</text>
const line=(a:P,b:P,color=blue,dashed=false)=><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth="2" strokeDasharray={dashed?'5 4':undefined}/>
const arrow=(a:P,b:P,color=blue)=>{const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);return <g>{line(a,b,color)}{line([b[0]-9*Math.cos(angle-.4),b[1]-9*Math.sin(angle-.4)],b,color)}{line([b[0]-9*Math.cos(angle+.4),b[1]-9*Math.sin(angle+.4)],b,color)}</g>}
const dot=(p:P,s='',color=blue)=><g><circle cx={p[0]} cy={p[1]} r="5" fill={color}/>{s&&label(p[0],p[1]-13,s,color)}</g>
const box=(x:number,y:number,w:number,s:string,color=blue)=><g><rect x={x} y={y} width={w} height="42" rx="8" stroke={color} fill={color+'15'}/>{label(x+w/2,y+26,s,color,13)}</g>
const path=(points:P[],close=false)=>points.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(' ')+(close?'Z':'')
const curve=(fn:(t:number)=>P,a:number,b:number,n=80)=>path(Array.from({length:n+1},(_,i)=>fn(a+(b-a)*i/n)))
const axes=(x=100,y=210,w=350,h=160)=><g>{line([x-40,y],[x+w,y],muted)}{line([x,y+30],[x,y-h],muted)}{label(x+w,y+20,'x')}{label(x-17,y-h,'y')}</g>
const permutations=[[0,1,2],[1,0,2],[0,2,1],[2,1,0],[1,2,0],[2,0,1]]
const permNames=['e','(12)','(23)','(13)','(123)','(132)']
const multiply=(a:number[],b:number[])=>b.map(v=>a[v])
const inverse=(a:number[])=>a.map((_,i)=>a.indexOf(i))
const permName=(p:number[])=>permNames[permutations.findIndex(q=>q.every((v,i)=>v===p[i]))]

/** Concrete examples for the individual definitions and results inside each entry. */
export function SubsectionDiagram({theorem,lang}:{theorem:VisualTheorem;lang:'id'|'en'}) {
  const kind=theorem.diagram!.kind, mode=theorem.diagram!.mode??''
  const initial=kind==='angle'?mode==='roots'?-90:45:kind==='vectors'?mode==='triple'?1:45:kind==='angles'?mode==='linePlane'?45:1:kind==='conicTangent'?45:kind==='limits'&&mode==='continuity'?.5:kind==='quadrics'?.5:kind==='complexArithmetic'||kind==='groupTable'||kind==='S3'||kind==='circles'&&mode==='complete'?1:kind==='circleIntegral'?-1:2
  const [v,setV]=useState(initial)
  const t=(id:string,en:string)=>lang==='id'?id:en
  let drawing:ReactNode
  let result=''
  let control:{name:string;min:number;max:number;step:number}|undefined
  const slider=(name:string,min:number,max:number,step=1)=>{control={name,min,max,step}}
  switch(kind) {
    case 'complexArithmetic': {
      slider(t('Bagian real z, Im z = 1','Real part of z, Im z = 1'),-2,3,.25)
      const out=mode==='division'?[(2*v+1)/5,(2-v)/5]:[2*v-1,v+2]
      const origin:P=[210,190],project=(x:number,y:number):P=>[210+x*30,190-y*30]
      drawing=<>{axes(210,190,245,160)}{arrow(origin,project(v,1))}{dot(project(v,1),'z')}{arrow(origin,project(2,1),purple)}{label(330,180,'w = 2+i',purple)}{arrow(origin,project(out[0],out[1]),red)}{dot(project(out[0],out[1]),mode==='division'?'z/w':'zw',red)}{line(project(out[0],0),project(out[0],out[1]),red,true)}</>
      result=`${mode==='division'?'z/w':'zw'} = ${out[0].toFixed(2)} + (${out[1].toFixed(2)})i`;break
    }
    case 'angle': {
      slider(t('Sudut masukan θ (derajat)','Input angle θ (degrees)'),-180,180,5)
      const theta=v*Math.PI/180
      if(mode==='roots') {
        drawing=<>{[0,1,2].map(k=>{const a=(theta+2*Math.PI*k)/3,p:P=[190+85*Math.cos(a),155-85*Math.sin(a)];return <g key={k}>{arrow([190,155],p)}{dot(p,`w${k}`)}</g>})}<circle cx="190" cy="155" r="85" fill="none" stroke={muted}/>{label(405,100,`target: 8e^i${v}°`,red)}{label(405,140,'root radius = 2')}{label(405,180,'spacing = 120°')}</>;result=`angles: ${[0,1,2].map(k=>(v+360*k)/3).map(n=>n.toFixed(1)+'°').join(', ')}`
      } else if(mode==='sector') {
        control=undefined
        drawing=<><path d="M115 190L190 190A75 75 0 0 0 115 115Z" fill={blue+'25'} stroke={blue}/><path d="M385 190L460 190A75 75 0 0 0 310 190Z" fill={red+'25'} stroke={red}/>{label(115,235,'z: 0° ≤ θ ≤ 90°',blue)}{label(385,235,'w: 0° ≤ φ ≤ 180°',red)}{arrow([235,170],[270,170],purple)}{label(250,140,'z²')}</>;result='ρ = r², φ = 2θ; f′(0) = 0'
      } else {
        const r=mode==='inverse'?2:1,angle=mode==='inverse'?-theta:theta+Math.PI/3,ro=mode==='inverse'?.5:2
        const o:P=[190,155],p:P=[190+r*45*Math.cos(theta),155-r*45*Math.sin(theta)],q:P=[190+ro*45*Math.cos(angle),155-ro*45*Math.sin(angle)]
        drawing=<>{axes(190,155,250,120)}<circle cx="190" cy="155" r={r*45} fill="none" stroke={muted}/>{arrow(o,p)}{dot(p,'z')}{arrow(o,q,red)}{dot(q,mode==='inverse'?'z⁻¹':'z·2e^i60°',red)}{label(365,270,mode==='inverse'?'r → 1/r, θ → −θ':'r₁r₂, θ₁+θ₂',purple)}</>;result=mode==='inverse'?`input radius 2, output radius 0.5; angle ${-v}°`:`output radius 2; angle ${v+60}°`
      }break
    }
    case 'regions': {
      if(mode==='openClosed')drawing=<>{['|z|<1','|z|≤1','0<|z|≤1'].map((s,i)=><g key={i}><circle cx={90+i*170} cy="145" r="64" fill={blue+'15'} stroke={blue} strokeDasharray={i===0?'5 4':undefined}/>{i===2?<circle cx="430" cy="145" r="6" fill="#101827" stroke={red}/>:dot([90+i*170,145])}{label(90+i*170,245,s,blue)}{label(90+i*170,275,[t('terbuka','open'),t('tertutup','closed'),t('keduanya bukan','neither')][i])}</g>)}</>
      else if(mode==='connected')drawing=<><circle cx="70" cy="145" r="45" fill={blue+'20'} stroke={blue}/><circle cx="180" cy="145" r="45" fill={blue+'20'} stroke={blue}/>{dot([70,145],'A')}{dot([180,145],'B')}<circle cx="390" cy="145" r="80" fill={purple+'20'} stroke={purple}/><circle cx="390" cy="145" r="35" fill="#101827" stroke={red}/><path d="M330 145A60 60 0 0 1 450 145" fill="none" stroke={blue} strokeWidth="3"/>{dot([330,145],'A')}{dot([450,145],'B')}{label(125,265,t('dua komponen','two components'))}{label(390,265,t('terhubung, berlubang','connected, with a hole'))}</>
      else drawing=<>{axes(90,155,360,100)}<circle cx="90" cy="155" r="6" fill="#101827" stroke={red}/>{Array.from({length:15},(_,i)=><g key={i}>{dot([90+300/(i+1),155],i<3?`1/${i+1}`:'')}</g>)}{label(95,225,'0 ∉ S',red)}{label(300,265,'S ⊂ {|z| < 2}',blue)}</>
      result=mode==='openClosed'?'A boundary point can be included or excluded':mode==='connected'?'Connected ≠ simply connected':'0 is an accumulation point but is not a member';break
    }
    case 'limits': {
      slider(mode==='infinity'?t('Radius R','Radius R'):t('Ukuran perpindahan h','Displacement size h'),mode==='infinity'?1:.1,mode==='infinity'?8:2,mode==='infinity'?.5:.1)
      if(mode==='infinity')drawing=<>{axes(95,175,140,120)}{axes(360,175,130,120)}{arrow([95,175],[95+v*16,175])}{arrow([360,175],[360+80/v,175],red)}{label(145,235,`R=${v}`)}{label(385,235,`1/R=${(1/v).toFixed(3)}`,red)}{arrow([245,145],[285,145],purple)}{label(265,115,'1/z')}</>
      else if(mode==='paths')drawing=<>{axes(130,170,130,110)}{arrow([130+v*40,170],[130,170])}{arrow([130,170-v*40],[130,170],red)}{box(305,85,160,'real path → 1')}{box(305,175,160,'imaginary path → −1',red)}{label(150,265,'f(z) = z̄/z')}</>
      else {slider('h',.05,1,.05);const p:P=[100+(1+v)*30,155-v*30];drawing=<>{axes(100,155,110,100)}{axes(365,155,110,140)}{dot([130,155],'z₀=1')}{dot(p,'1+h+ih')}{dot([395,155],'f(z₀)=1',red)}{dot([365+(1+2*v)*30,155-2*(1+v)*v*30],'z²',red)}{arrow([235,155],[285,155],purple)}</>}
      result=mode==='paths'?'real limit 1 ≠ imaginary limit −1':mode==='infinity'?`R · (1/R) = 1; 1/R = ${(1/v).toFixed(4)}`:'Both output coordinates must approach their target coordinates';break
    }
    case 'analytic': {
      if(mode==='polar'){slider('r',.5,3,.25);drawing=<><circle cx="200" cy="170" r={v*35} fill="none" stroke={blue}/>{arrow([200,170],[200+v*35,170])}<path d={`M${200+v*35} 170A${v*35} ${v*35} 0 0 0 ${200+v*35*Math.cos(.5)} ${170-v*35*Math.sin(.5)}`} fill="none" stroke={red} strokeWidth="4"/>{label(385,100,`Δθ = 0.5 rad`,red)}{label(385,145,`arc = ${(v*.5).toFixed(3)}`)}{label(385,190,'rΔθ ≠ Δθ')}</>;result=`angular displacement length = rΔθ = ${(v*.5).toFixed(3)}`}
      else if(mode==='conjugate'){drawing=<>{[-1,1].flatMap(sign=>[1,2].map(k=><g key={`${sign}${k}`}><path d={curve(y=>[260+sign*Math.sqrt(y*y+k)*30,165-y*30],-2,2)} fill="none" stroke={blue}/><path d={curve(x=>[260+sign*x*30,165-sign*k/x*15],.5,2.5)} fill="none" stroke={red}/></g>))}{line([185,240],[335,90],blue)}{line([185,90],[335,240],blue)}{line([185,165],[335,165],red)}{line([260,90],[260,240],red)}{label(145,275,'u=x²−y²',blue)}{label(375,275,'v=2xy+C',red)}{box(155,25,210,'u + iv = z² + iC',purple)}</>;result='Level curves meet at right angles away from z=0; vᵧ=2x, vₓ=2y'}
      else drawing=<>{arrow([100,205],[165,205])}{arrow([100,205],[100,140],red)}{arrow([340,205],[400,145])}{arrow([340,205],[280,145],red)}{box(170,40,180,'[[a,−b],[b,a]]',purple)}{label(140,265,'input: 90°')}{label(340,265,'output: 90°')}{label(260,110,'real differentiability + CR')}</>
      break
    }
    case 'period': {
      if(mode==='law') {
        slider(t('Sudut y (radian)','Angle y (radians)'),-3.14,3.14,.1)
        drawing=<>{box(25,35,190,'z=iy, w=iπ/2',blue)}{arrow([125,85],[125,150],blue)}{box(25,170,190,'e^(z+w)',blue)}{arrow([225,190],[295,190],purple)}{box(305,170,190,'e^z · e^w',red)}{box(305,35,190,'e^iy · i',red)}{arrow([400,85],[400,150],red)}{label(260,280,'add angles → multiply unit arrows',purple)}</>
        result=`both = ${(-Math.sin(v)).toFixed(3)} + (${Math.cos(v).toFixed(3)})i`;break
      }
      slider(t('Sudut y (radian)','Angle y (radians)'),-3.14,3.14,.1)
      const p:P=[385+75*Math.cos(v),160-75*Math.sin(v)]
      drawing=<>{line([100,45],[100,250],blue)}{dot([100,130],'x+iy')}{dot([100,220],'x+i(y+2π)',purple)}{arrow([180,130],[270,150])}{arrow([180,220],[270,170],purple)}<circle cx="385" cy="160" r="75" fill="none" stroke={blue}/>{arrow([385,160],p,red)}{dot(p,'e^z',red)}{label(100,285,'vertical separation 2π')}{label(385,285,'same nonzero output')}</>
      result=`x=0: e^iy = ${Math.cos(v).toFixed(3)} + (${Math.sin(v).toFixed(3)})i; radius = 1`;break
    }
    case 'powerBranch': {
      if(mode==='power'){slider(t('Bilangan cabang k','Branch integer k'),-2,2);drawing=<>{box(25,50,180,`log i = i(π/2+2π·${v})`)}{arrow([215,75],[270,75],purple)}{box(285,50,210,`×(−2i) → π+4π·${v}`,red)}{arrow([390,105],[390,155],red)}{box(245,175,250,`exp(${(Math.PI+4*Math.PI*v).toFixed(3)})`,red)}{label(120,205,'same input i',blue)}</>;result=`i^(−2i) = ${Math.exp(Math.PI+4*Math.PI*v).toExponential(4)}`}
      else drawing=<><circle cx="170" cy="160" r="80" fill="none" stroke={muted}/>{arrow([170,160],[170,240],red)}<path d="M250 160 A80 80 0 1 0 170 240" fill="none" stroke={blue} strokeWidth="3"/>{label(380,115,'π + π/2 = 3π/2',blue)}{label(380,165,'principal: −π/2',red)}{label(380,215,'difference: 2πi',purple)}</>
      break
    }
    case 'trigZeros': {
      if(mode==='zeros')drawing=<>{axes(260,155,210,100)}{[-2,-1,0,1,2].map(k=><g key={k}>{dot([260+k*70,155],`${k}π`,blue)}{k<2&&dot([295+k*70,155],`${k}π+π/2`,red)}</g>)}{label(260,230,'sin zeros',blue)}{label(260,260,'cos zeros',red)}</>
      else {slider('y',0,3,.1);drawing=<>{axes(130,230,100,185)}{arrow([130,230],[130,230-v*45],blue)}{axes(360,230,100,185)}{arrow([360,230],[360,230-Math.sinh(v)*18],red)}{label(140,275,'input iy',blue)}{label(380,275,'sin(iy)=i sinh y',red)}</>;result=`|sin(iy)| = sinh(${v}) = ${Math.sinh(v).toFixed(3)}`}
      break
    }
    case 'ML': {
      slider('R',.5,4,.25)
      drawing=<><path d="M70 200A110 110 0 0 1 290 200" fill="none" stroke={blue} strokeWidth="4"/>{arrow([265,130],[245,110],blue)}{mode==='orientation'&&arrow([130,105],[150,95],red)}{label(180,225,`R = ${v}`,blue)}{box(330,75,160,`M = ${(1/v).toFixed(3)}`)}{box(330,145,160,`L = ${(Math.PI*v).toFixed(3)}`,purple)}{box(330,215,160,'M L = π',red)}</>;result=mode==='orientation'?'CCW: iπ; CW: −iπ; both magnitudes π':`M·L = (1/R)·πR = ${Math.PI.toFixed(4)}`;break
    }
    case 'circleIntegral': {
      slider(t('Pangkat n','Exponent n'),-3,3)
      drawing=<><circle cx="155" cy="155" r="90" fill="none" stroke={blue}/>{[0,1,2,3].map(k=>{const a=k*Math.PI/2,b=(v+1)*a;const p:P=[155+90*Math.cos(a),155-90*Math.sin(a)];return <g key={k}>{dot(p)}{arrow(p,[p[0]+25*Math.cos(b+Math.PI/2),p[1]-25*Math.sin(b+Math.PI/2)],red)}</g>})}{box(315,100,170,`n+1 = ${v+1}`,purple)}{box(315,175,170,v===-1?'sum: 2πi':'rotations cancel',red)}</>;result=`∮ z^${v} dz = ${v===-1?'2πi':'0'}`;break
    }
    case 'holes': {
      if(mode==='goursat')drawing=<>{[0,1].flatMap(i=>[0,1].map(j=><g key={`${i}${j}`}><rect x={120+i*105} y={65+j*90} width="105" height="90" fill={blue+'12'} stroke={blue}/></g>))}{arrow([217,90],[217,130],red)}{arrow([233,130],[233,90],purple)}{arrow([155,147],[185,147],red)}{arrow([185,163],[155,163],purple)}{label(390,125,'shared edges',red)}{label(390,165,'cancel',purple)}{label(225,285,'outer boundary remains',blue)}</>
      else drawing=<><circle cx="200" cy="150" r="105" fill={blue+'15'} stroke={blue}/><circle cx="200" cy="150" r="35" fill="#101827" stroke={red}/>{dot([200,150],'0',red)}{arrow([290,100],[270,70])}{arrow([230,130],[220,117],red)}{label(390,100,'outer C',blue)}{label(390,155,'inner C₁',red)}{label(390,215,'both: 2πi',purple)}</>
      result=mode==='goursat'?'analytic on the filled interior → integral 0':'f(z)=1/z; the interior contains an excluded singularity';break
    }
    case 'series': {
      if(mode==='taylor'){slider(t('Jumlah suku N','Number of terms N'),1,12);const sum=2*(1-.5**v);drawing=<><circle cx="125" cy="150" r="85" fill={blue+'15'} stroke={blue} strokeDasharray="5 4"/>{dot([125,150],'0')}{dot([210,150],'1: singularity',red)}{dot([167.5,150],'z=0.5',purple)}{Array.from({length:v},(_,i)=><rect key={i} x={270+i*18} y={220-140*.5**i} width="14" height={140*.5**i} fill={i===0?blue:purple}/>)}{label(370,265,'1, 1/2, 1/4, …')}</>;result=`S_${v-1}(0.5) = ${sum.toFixed(6)}, limit = 2`}
      else drawing=<><circle cx="190" cy="150" r="110" fill={purple+'15'} stroke={purple}/><circle cx="190" cy="150" r="65" fill={blue+'20'} stroke={blue} strokeDasharray="5 4"/><circle cx="190" cy="150" r="6" fill="#101827" stroke={red}/>{dot([255,150],'1',red)}{label(395,100,'inside: z⁻¹+1+z+…',blue)}{label(395,190,'outside: −z⁻²−z⁻³−…',purple)}{label(190,290,'different annuli → different coefficients')}</>
      break
    }
    case 'singularity': {
      if(mode==='removable'){drawing=<>{axes(80,225,370,170)}<path d={curve(x=>[260+x*50,225-(x===0?1:Math.sin(x)/x)*125],-3.5,3.5)} fill="none" stroke={blue} strokeWidth="3"/><circle cx="260" cy="100" r="8" fill="#101827" stroke={red}/>{arrow([360,65],[273,95],red)}{label(385,50,'fill f(0)=1',red)}</>;result='removable: sin z/z has no negative Laurent powers'}
      else {slider('r',.1,2,.1);drawing=<><circle cx="160" cy="160" r={v*45} fill="none" stroke={blue}/>{dot([160,160],'0',red)}{dot([160+v*45,160],'z')}{box(300,90,190,`|1/z²| = ${(1/v**2).toFixed(2)}`,red)}{box(300,180,190,'z²f(z) = 1',purple)}</>;result=`r=${v.toFixed(1)}, |f|=${(1/v**2).toFixed(4)}; pole order 2`}
      break
    }
    case 'residue': {
      if(mode==='simple'){slider(t('Radius kontur R dari 0','Contour radius R about zero'),.3,2,.1);drawing=<><circle cx="190" cy="155" r={v*65} fill={blue+'15'} stroke={blue}/>{dot([190,155],'0: Res=−1',red)}{dot([255,155],'1: Res=+1',purple)}{label(410,130,v>1?'two poles inside':'one pole inside')}{label(410,175,v===1?'contour hits pole!':v>1?'sum = 0':'sum = −1',red)}</>;result=v===1?'Invalid: contour passes through pole 1':`integral = ${v>1?'0':'−2πi'}`}
      else drawing=<>{['1','z','z²/2','z³/6'].map((s,i)=><g key={i}>{box(10+i*130,50,115,s,blue)}{arrow([67+i*130,100],[67+i*130,160],muted)}{box(10+i*130,180,115,['z⁻²','z⁻¹','1/2','z/6'][i],i===1?red:purple)}</g>)}{label(260,280,'e^z / z²: coefficient of z⁻¹ is 1',red)}</>
      break
    }
    case 'sectionPoint': {
      slider('k = AM / MB',.25,4,.25);const f=v/(1+v),a:P=[65,215],b:P=[425,75],m:P=[65+360*f,215-140*f]
      drawing=<>{line(a,b)}{dot(a,'A=(0,0)')}{dot(b,'B=(6,3)')}{dot(m,'M',red)}{line([m[0],215],m,red,true)}{label(260,275,'(1+k)M = A + kB',purple)}</>;result=`M = (${(6*f).toFixed(3)}, ${(3*f).toFixed(3)}); AM:MB = ${v}:1`;break
    }
    case 'vectors': {
      slider(mode==='triple'?t('Tinggi h','Height h'):t('Sudut θ (derajat)','Angle θ (degrees)'),mode==='triple'?-2:0,mode==='triple'?2:180,mode==='triple'?.25:5)
      if(mode==='triple'){const h=v;drawing=<><path d="M80 220L240 220L320 160L160 160Z" stroke={blue} fill={blue+'20'}/>{[80,240].map((x,i)=><g key={i}>{line([x,220],[x,220-h*55],red)}{line([x+80,160],[x+80,160-h*55],red)}</g>)}<path d={`M80 ${220-h*55}L240 ${220-h*55}L320 ${160-h*55}L160 ${160-h*55}Z`} fill="none" stroke={purple}/>{label(410,130,`h = ${h}`)}{label(410,185,'base area = 6',blue)}</>;result=`signed volume = 6h = ${6*h}`}
      else {const a=v*Math.PI/180,p:P=[110+120*Math.cos(a),220-120*Math.sin(a)],o:P=[110,220],u:P=[260,220];drawing=<>{axes(110,220,320,180)}{arrow(o,u)}{arrow(o,p,red)}<path d={path([o,u,[u[0]+p[0]-o[0],p[1]],p],true)} fill={purple+'20'} stroke={purple}/>{line(p,[p[0],220],red,true)}{label(370,60,mode==='basis'?`det = ${(Math.sin(a)).toFixed(3)}`:mode==='dot'?`cosθ = ${Math.cos(a).toFixed(3)}`:`sinθ = ${Math.sin(a).toFixed(3)}`)}{label(370,100,mode==='basis'?(Math.abs(Math.sin(a))<1e-8?'not a basis':'independent directions'):mode==='dot'?'signed projection':'oriented area',purple)}</>;result=mode==='basis'?`det(e₁,e₂) = sin(${v}°) = ${Math.sin(a).toFixed(4)}`:mode==='dot'?`unit-vector dot = ${Math.cos(a).toFixed(4)}`:`unit-vector cross magnitude = ${Math.abs(Math.sin(a)).toFixed(4)}`}
      break
    }
    case 'linePlane': {
      if(mode==='line'){slider('t',-2,3,.25);drawing=<>{axes(160,220,300,170)}{line([40,255],[450,50],muted)}{dot([220,170],'p=(1,1)')}{arrow([220,170],[320,120],purple)}{dot([220+v*60,170-v*30],'p+td',red)}{label(365,260,'d=(2,1)',purple)}</>;result=`r(${v}) = (${1+2*v}, ${1+v})`}
      else drawing=<><path d="M100 260L230 210L230 50L100 100Z" fill={blue+'20'} stroke={blue}/><path d="M100 100L230 150L360 100L230 50Z" fill={purple+'20'} stroke={purple}/>{line([230,210],[230,50],red)}{arrow([230,150],[335,190],blue)}{arrow([230,150],[155,195],purple)}{label(365,210,'n₁=e₁',blue)}{label(115,235,'n₂=e₂',purple)}{label(280,35,'d=e₃',red)}</>
      break
    }
    case 'angles': {
      slider(mode==='linePlane'?t('Sudut α (derajat)','Angle α (degrees)'):t('Tinggi h','Height h'),0,mode==='linePlane'?90:3,mode==='linePlane'?5:.25)
      if(mode==='linePlane'){const a=v*Math.PI/180;drawing=<>{line([70,225],[425,225],blue)}{arrow([180,225],[180,60],purple)}{arrow([180,225],[180+160*Math.cos(a),225-160*Math.sin(a)],red)}{label(390,70,`α = ${v}°`,red)}{label(390,110,`β = ${90-v}°`,purple)}{label(160,275,t('bidang dalam irisan','plane in cross-section'),blue)}</>;result=`sinα = cosβ = ${Math.sin(a).toFixed(4)}`}
      else if(mode==='pointLine'){drawing=<>{line([60,240],[460,240])}{dot([90,240],'A')}{dot([310,240-v*55],'P',red)}{line([310,240-v*55],[310,240],red)}{line([90,240],[310,240-v*55],purple)}{label(370,265,'perpendicular foot')}{label(120,60,'base × height / base')}</>;result=`dist(P,line) = |h| = ${v}`}
      else {drawing=<>{line([60,240],[420,240])}{line([100,210-v*50],[360,100-v*50],purple)}{line([235,240],[235,153-v*50],red,true)}{label(130,275,'d₁=e₁',blue)}{label(405,80,'d₂=e₂',purple)}{label(365,190,`z separation h=${v}`,red)}</>;result=`|e₁×e₂|=1, distance=|h|=${v}`}
      break
    }
    case 'circles': {
      if(mode==='complete'){slider('σ',0,6,.25);drawing=<>{axes(150,170,300,125)}{v<5?<circle cx="270" cy="230" r={Math.sqrt(5-v)*35} fill={blue+'20'} stroke={blue}/>:v===5?dot([270,230],'one point'):label(310,230,'∅',red,30)}{dot([270,230],'O=(2,−1)',red)}{label(330,75,`R² = 5−σ = ${5-v}`)}</>;result=v<5?`R = √(5−σ) = ${Math.sqrt(5-v).toFixed(3)}`:v===5?'one point':'no real circle'}
      else if(mode==='secant'){slider('x of P',-3,3,.25);drawing=<><circle cx="250" cy="155" r="90" fill={blue+'15'} stroke={blue}/>{line([65,155],[455,155],muted)}{dot([160,155],'−2')}{dot([340,155],'2')}{dot([250+45*v,155],'P',red)}{label(250,265,`t₁=${(-2-v).toFixed(2)}, t₂=${(2-v).toFixed(2)}`,purple)}</>;result=`t₁t₂ = ${(-2-v).toFixed(2)} × ${(2-v).toFixed(2)} = ${(v*v-4).toFixed(3)}`}
      else drawing=<><circle cx="220" cy="170" r="90" fill={blue+'20'} stroke={blue}/>{dot([220,170],'O')}{dot([220,80],'T',red)}{line([220,170],[220,80],red)}{line([60,80],[430,80],purple)}{label(375,125,'tangent plane',purple)}{label(280,245,'normal = T−O',red)}</>
      break
    }
    case 'pencil': {
      if(mode==='planes'){slider(t('Sudut θ','Angle θ'),0,180,5);const a=v*Math.PI/180;drawing=<>{line([260,270],[260,40],red)}{line([260-150*Math.cos(a),155+65*Math.sin(a)],[260+150*Math.cos(a),155-65*Math.sin(a)],blue)}<path d={path([[260-150*Math.cos(a),245+65*Math.sin(a)],[260+150*Math.cos(a),245-65*Math.sin(a)],[260+150*Math.cos(a),65-65*Math.sin(a)],[260-150*Math.cos(a),65+65*Math.sin(a)]],true)} fill={blue+'20'} stroke={blue}/>{label(380,280,'common z-axis',red)}</>;result=`cos(${v}°)x + sin(${v}°)y = 0`}
      else {slider(t('Pusat pada sumbu x: c','Center on x-axis: c'),-2,2,.25);const radius=Math.sqrt(v*v+1);drawing=<>{[-1,1].map(c=><circle key={c} cx={260+c*45} cy="155" r={Math.sqrt(2)*45} fill="none" stroke={muted}/>) }<circle cx={260+v*45} cy="155" r={radius*45} fill={blue+'15'} stroke={blue}/>{line([260,35],[260,275],red,true)}{dot([260,110],'base A',red)}{dot([260,200],'base B',red)}{dot([260+v*45,155],'center')}</>;result=`(x−${v})²+y²=${(v*v+1).toFixed(3)}; both (0,±1) stay on circle`}
      break
    }
    case 'conicTangent': {
      if(mode==='polar'){const px=3,r=2,tangentX=r*r/px,ty=Math.sqrt(r*r-tangentX*tangentX);drawing=<><circle cx="155" cy="155" r="90" fill={blue+'15'} stroke={blue}/>{dot([155+px*45,155],'P=(3,0)',red)}{line([155+tangentX*45,45],[155+tangentX*45,265],purple)}{[-1,1].map(sign=><g key={sign}>{dot([155+tangentX*45,155+sign*ty*45],'T',purple)}{line([290,155],[155+tangentX*45,155+sign*ty*45],red)}</g>)}{label(405,75,'polar x=4/3',purple)}</>;result='PT ⟂ OT; x contact = R²/Pₓ = 4/3'}
      else {slider(t('Sudut parameter P','Point parameter angle'),0,360,5);const a=v*Math.PI/180,x=3*Math.cos(a),y=2*Math.sin(a),p:P=[175+x*35,160-y*35],dx=-3*Math.sin(a),dy=2*Math.cos(a);drawing=<><ellipse cx="175" cy="160" rx="105" ry="70" fill={blue+'15'} stroke={blue}/>{dot(p,'P',red)}{line([p[0]-dx*45,p[1]+dy*45],[p[0]+dx*45,p[1]-dy*45],red)}{mode==='eccentricity'&&<>{line([175+9/Math.sqrt(5)*35,25],[175+9/Math.sqrt(5)*35,285],purple)}{dot([175+Math.sqrt(5)*35,160],'F',purple)}{line(p,[175+Math.sqrt(5)*35,160],blue)}{line(p,[175+9/Math.sqrt(5)*35,p[1]],purple,true)}</>}{label(400,90,'a=3, b=2')}{label(400,145,mode==='eccentricity'?'e=√5/3':'normal ∇F',purple)}</>;result=mode==='eccentricity'?`PF=${(3-Math.sqrt(5)*Math.cos(a)).toFixed(3)}, e·dist(P,d)=${(3-Math.sqrt(5)*Math.cos(a)).toFixed(3)}`:`P=(${x.toFixed(3)},${y.toFixed(3)}); tangent: x·${x.toFixed(3)}/9+y·${y.toFixed(3)}/4=1`}
      break
    }
    case 'quadrics': {
      slider(mode==='ruling'?'s':t('Tinggi irisan h','Slice height h'),-2,2,.1)
      const radiusSquared=(h:number)=>mode==='ellipsoid'?1-h*h:mode==='oneSheet'?1+h*h:mode==='twoSheets'?h*h-1:mode==='cone'?h*h:mode==='ellipticParaboloid'?2*h:1
      if(mode==='ruling'||mode==='hyperbolicParaboloid')drawing=<>{[-2,-1,0,1,2].map(s=><g key={s}><path d={curve(t=>[260+(s+t)*40,165+(s-t)*18-s*t*(mode==='ruling'?15:7.5)],-2,2)} stroke={blue} fill="none"/><path d={curve(t=>[260+(s+t)*40,165+(t-s)*18-s*t*(mode==='ruling'?15:7.5)],-2,2)} stroke={muted} fill="none"/></g>)}<path d={curve(t=>[260+(v+t)*40,165+(v-t)*18-v*t*(mode==='ruling'?15:7.5)],-2,2)} fill="none" stroke={red} strokeWidth="4"/>{label(260,290,mode==='ruling'?'z=(x−y)(x+y)':'z=(x²−y²)/2',red)}</>
      else {const hvals=Array.from({length:33},(_,i)=>-2+i*.125);drawing=<>{mode==='ellipsoid'&&[15,35,60].map(r=><ellipse key={r} cx="155" cy="175" rx={r} ry="65" fill="none" stroke={muted}/>)}{hvals.map((h,i)=>{const r2=radiusSquared(h);return r2>=0?<ellipse key={i} cx="155" cy={175-h*65} rx={Math.sqrt(r2)*60} ry={Math.sqrt(r2)*18} fill="none" stroke={muted}/>:null})}{radiusSquared(v)>=0?<ellipse cx="155" cy={175-v*65} rx={Math.sqrt(radiusSquared(v))*60} ry={Math.sqrt(radiusSquared(v))*18} fill={red+'30'} stroke={red} strokeWidth="3"/>:null}{radiusSquared(v)>0?<circle cx="380" cy="150" r={Math.sqrt(radiusSquared(v))*55} fill={blue+'15'} stroke={blue}/>:label(380,150,radiusSquared(v)===0?'point':'∅',red,26)}{label(155,315,t('proyeksi permukaan','surface projection'))}{label(380,290,`z=h=${v}`,red)}</>;result=mode==='degenerate'?'cylinder: r²=1 at every height':`slice r²=${radiusSquared(v).toFixed(3)} ${radiusSquared(v)<0?'→ no real section':''}`}
      break
    }
    case 'matrix': {
      if(mode==='center')drawing=<>{box(20,50,220,'circle: A=I, a=(−2,1)')}{box(20,120,220,'h=(2,−1)',red)}{box(280,50,220,'parabola y²−2x=0',purple)}{box(280,120,220,'0·hₓ−1=0: impossible',red)}<circle cx="125" cy="225" r="45" fill="none" stroke={blue}/>{dot([125,225],'center') }<path d={curve(t=>[350+t*t*12,225-t*22],-2,2)} fill="none" stroke={purple}/>{label(390,290,'no center',red)}</>
      else drawing=<>{box(25,40,470,'x² + 2xy + y² → A = [[1,1],[1,1]]',blue)}{arrow([260,90],[260,130],purple)}{box(25,150,145,'x²: A₁₁=1')}{box(190,150,145,'xy: 2A₁₂=2',red)}{box(355,150,145,'y²: A₂₂=1')}{box(75,230,165,'trace A = 2',purple)}{box(280,230,165,'det A = 0',purple)}</>
      break
    }
    case 'classification': {
      slider('q',-2,2,.25)
      if(v>0)drawing=<ellipse cx="260" cy="150" rx="80" ry={Math.min(130,80/Math.sqrt(v))} fill={blue+'15'} stroke={blue}/>
      else if(v===0)drawing=<>{line([180,25],[180,275],red)}{line([340,25],[340,275],red)}</>
      else drawing=<>{[-1,1].map(sign=><path key={sign} d={curve(t=>[260+sign*80*Math.cosh(t),150-80/Math.sqrt(-v)*Math.sinh(t)],-1.1,1.1)} fill="none" stroke={blue}/>)}</>
      result=`X² + (${v})Y² = 1: ${v>0?'ellipse':v<0?'hyperbola':'two lines X=±1'}`;break
    }
    case 'transform': {
      if(mode==='inversion'){slider('r',.3,3,.1);drawing=<>{axes(190,165,280,120)}<circle cx="190" cy="165" r="60" stroke={muted} fill="none"/>{dot([190,165],'O')}{arrow([190,165],[190+v*60,165])}{dot([190+v*60,165],'M')}{arrow([190,165],[190+60/v,165],red)}{dot([190+60/v,165],'M′',red)}{label(260,265,'r · r′ = 1',purple)}</>;result=`r=${v.toFixed(2)}, r′=${(1/v).toFixed(3)}`}
      else if(mode==='fixed')drawing=<>{axes(230,180,200,120)}{dot([170,180],'fixed (−1,0)',red)}{[0,1,2].map(x=><g key={x}>{dot([230+x*45,180],String(x))}{arrow([230+x*45,180],[230+(2*x+1)*45,180],purple)}</g>)}{label(260,260,'T(x)=2x+(1,0)',purple)}</>
      else {slider(mode==='reflection'?t('Jarak ke cermin','Distance to mirror'):t('Skala k','Scale k'),mode==='reflection'?0:.25,mode==='reflection'?3:2.5,.25);const pts:P[]=[[0,0],[1,0],[.25,1]],input=(p:P):P=>mode==='reflection'?[150+p[0]*70,165-(p[1]+v)*30]:[110+p[0]*70,190-p[1]*70],out=(p:P):P=>mode==='reflection'?[150+p[0]*70,165+(p[1]+v)*30]:[310+p[0]*70*v,210-p[1]*70*v];drawing=<><path d={path(pts.map(input),true)} stroke={blue} fill={blue+'20'}/><path d={path(pts.map(out),true)} stroke={red} fill={red+'15'}/>{mode==='reflection'&&line([80,165],[310,165],purple)}{label(390,100,'input',blue)}{label(390,230,mode==='reflection'?'mirror image':`scale k=${v}`,red)}</>;result=mode==='reflection'?'same distances, det Q = −1; reflecting twice restores points':`side factor ${v}; area factor ${(v*v).toFixed(3)}`}
      break
    }
    case 'groupTable': {
      slider('a in Z₄',0,3)
      drawing=<>{Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>{const n=i===0?j-1:j===0?i-1:(i+j-2)%4;const active=i===v+1;return <g key={`${i}-${j}`}><rect x={55+j*46} y={35+i*46} width="44" height="44" fill={active?blue+'30':i===0||j===0?purple+'20':'none'} stroke={muted}/>{label(77+j*46,63+i*46,i===0&&j===0?'+':String(n),n===0&&i>0&&j>0?red:blue)}</g>}))}{label(405,100,`a = ${v}`)}{label(405,150,mode==='cancellation'?`a+x=3 → x=${(3-v+4)%4}`:`inverse: ${(4-v)%4}`,red)}{label(405,200,'modulo 4',purple)}</>;result=mode==='cancellation'?`${v} + ${(3-v+4)%4} ≡ 3 (mod 4)`:`${v} + ${(4-v)%4} ≡ 0 (mod 4)`;break
    }
    case 'subgroupTest': {
      if(mode==='closure'){drawing=<>{box(20,40,225,'H={0,2,4} in Z₆')}{box(275,40,225,'S={0,1,2} in Z₆',red)}{[0,2,4].map((n,i)=><g key={n}>{dot([75+i*65,145],String(n))}</g>)}{[0,1,2].map((n,i)=><g key={n}>{dot([330+i*65,145],String(n),red)}</g>)}{arrow([420,170],[420,215],red)}{box(335,230,165,'1+2=3 ∉ S',red)}{box(45,230,165,'closed; inverses stay',blue)}</>}
      else {slider('a in Z₁₂',0,11);const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;const order=12/gcd(v,12),values=Array.from({length:order},(_,k)=>k*v%12);drawing=<>{values.map((n,i)=>{const a=2*Math.PI*i/order;return <g key={i}>{dot([210+95*Math.cos(a),160-95*Math.sin(a)],String(n),i===0?red:blue)}</g>})}{label(415,125,`gcd(${v},12)=${gcd(v,12)}`)}{label(415,170,`order=${order}`,red)}{label(210,290,`add ${v} modulo 12`)}</>;result=`o(${v}) = 12/gcd(${v},12) = ${order}`}
      break
    }
    case 'S3': {
      const sigma=permutations[1],tau=permutations[2],st=multiply(sigma,tau),ts=multiply(tau,sigma)
      if(mode==='centralizer'){drawing=<>{permutations.map((p,i)=>{const commutes=permName(multiply(p,sigma))===permName(multiply(sigma,p));return <g key={i}>{box(20+(i%3)*165,55+Math.floor(i/3)*105,150,permNames[i],commutes?blue:muted)}{label(95+(i%3)*165,115+Math.floor(i/3)*105,commutes?'commutes with (12)':'does not commute',commutes?blue:red,11)}</g>})}{label(260,295,'C((12))={e,(12)}; Z(S₃)={e}',purple)}</>}
      else if(mode==='normal'){drawing=<>{box(20,40,225,'H = {e,(12)}',blue)}{box(275,40,225,'A₃ = {e,(123),(132)}',purple)}{arrow([130,95],[130,145],red)}{arrow([385,95],[385,145],red)}{box(20,170,225,'(23)⁻¹H(23)={e,(13)}',red)}{box(275,170,225,'(23)⁻¹A₃(23)=A₃',purple)}{label(130,265,'different set: not normal',red)}{label(385,265,'same set: normal',purple)}</>}
      else if(mode==='quotient'){const aCoset=[tau,multiply(tau,sigma)].map(permName),bCoset=[st,multiply(st,sigma)].map(permName);drawing=<>{box(20,35,480,'same starting coset H: representatives e or (12)')}{box(20,115,225,`e·(23)H = {${aCoset}}`,blue)}{box(275,115,225,`(12)(23)H = {${bCoset}}`,red)}{label(260,220,'different output cosets!',red,20)}{label(260,275,'H={e,(12)} is not normal')}</>;result='representative choice changes the product: quotient multiplication fails'}
      else if(mode==='commutator'){drawing=<>{box(20,55,225,`στ = ${permName(st)}`,blue)}{box(275,55,225,`τσ = ${permName(ts)}`,red)}{arrow([130,110],[240,180],blue)}{arrow([385,110],[280,180],red)}{box(140,205,240,'both in A₃ → same class',purple)}</>;result='S₃ nonabelian; S₃/A₃ ≅ Z₂ abelian'}
      else if(mode==='inverse') {
        slider(t('Masukan s','Input s'),1,3)
        const start=v-1, product=st[start], middle=sigma[product], restored=tau[middle]
        drawing=<>{box(20,55,90,String(v),blue)}{arrow([120,76],[190,76],blue)}{label(155,45,'στ',blue)}{box(200,55,110,String(product+1),red)}{arrow([320,76],[390,76],purple)}{label(355,45,'σ⁻¹',purple)}{box(400,55,100,String(middle+1),purple)}{arrow([450,105],[450,190],purple)}{label(400,155,'τ⁻¹',purple)}{box(350,205,150,String(restored+1),blue)}{label(185,245,'last operation undone first',purple)}{label(260,300,'(στ)⁻¹ = τ⁻¹σ⁻¹',red)}</>
        result=`${v} → στ → ${product+1} → σ⁻¹ → ${middle+1} → τ⁻¹ → ${restored+1}`
      }
      else {slider(t('Masukan s','Input s'),1,3);const input=v-1,afterTau=tau[input],afterSt=sigma[afterTau],afterSigma=sigma[input],afterTs=tau[afterSigma];drawing=<>{label(135,35,'τ then σ',blue)}{label(390,35,'σ then τ',red)}{[0,1,2].map(i=><g key={i}>{dot([50,90+i*60],String(i+1),i===input?blue:muted)}{dot([140,90+i*60],String(i+1),i===afterTau?blue:muted)}{dot([230,90+i*60],String(i+1),i===afterSt?blue:muted)}{dot([290,90+i*60],String(i+1),i===input?red:muted)}{dot([380,90+i*60],String(i+1),i===afterSigma?red:muted)}{dot([470,90+i*60],String(i+1),i===afterTs?red:muted)}</g>)}{arrow([50,90+input*60],[140,90+afterTau*60])}{arrow([140,90+afterTau*60],[230,90+afterSt*60])}{arrow([290,90+input*60],[380,90+afterSigma*60],red)}{arrow([380,90+afterSigma*60],[470,90+afterTs*60],red)}{label(260,290,mode==='inverse'?'undo: σ⁻¹ then τ⁻¹':'στ ≠ τσ',purple)}</>;result=mode==='inverse'?`(στ)⁻¹ = ${permName(inverse(st))} = τ⁻¹σ⁻¹`:`${v} → στ(${v})=${afterSt+1}, τσ(${v})=${afterTs+1}`}
      break
    }
    case 'coset': {
      slider(t('Wakil a','Representative a'),0,11);const residue=v%4
      drawing=<>{[0,1,2,3].map(k=><g key={k}><rect x={20+k*125} y="60" width="110" height="155" rx="12" fill={(k===residue?blue:muted)+'15'} stroke={k===residue?blue:muted}/>{[k,k+4,k+8].map((n,j)=><g key={n}>{dot([75+k*125,100+j*40],String(n),k===residue?blue:muted)}</g>)}{label(75+k*125,245,`${k}+H`,k===residue?blue:muted)}</g>)}{label(260,290,'H={0,4,8}; 12=4×3',purple)}</>;result=mode==='equality'?`${v}+H = ${residue}+H = {${residue},${residue+4},${residue+8}}`:'4 disjoint cosets × 3 elements each = 12';break
    }
    case 'homomorphism': {
      slider('a in Z₁₂',0,11);const image=v%3,b=5,resultSum=(v+b)%12
      if(mode==='injective')drawing=<>{[0,1,2].map(k=><g key={k}>{box(20,35+k*85,250,`{${[k,k+3,k+6,k+9].join(',')}}`,k===image?blue:muted)}{arrow([285,56+k*85],[355,56+k*85],k===image?blue:muted)}{box(370,35+k*85,110,`[${k}]`,k===image?red:muted)}</g>)}</>
      else drawing=<>{box(35,45,190,`a+b = ${resultSum} in Z₁₂`)}{box(295,45,190,`φ(a+b)=${resultSum%3}`,red)}{arrow([235,65],[285,65],purple)}{arrow([130,95],[130,185],purple)}{arrow([390,185],[390,95],purple)}{box(35,205,190,`φ(a)=${image}, φ(5)=2`)}{box(295,205,190,`(${image}+2) mod 3=${(image+2)%3}`,red)}{arrow([235,225],[285,225],purple)}</>
      result=mode==='injective'?`φ(${v})=${image}; kernel {0,3,6,9} is nontrivial`:'two routes produce the same target element';break
    }
    case 'cycles': {
      if(mode==='count')drawing=<>{box(185,20,150,'3 choices')}{[0,1,2].map(i=><g key={i}>{line([260,65],[90+i*170,110],blue)}{box(25+i*170,115,130,`first=${i+1}: 2 choices`)}{[0,1].map(j=><g key={j}>{line([90+i*170,160],[55+i*170+j*70,210],purple)}{box(25+i*170+j*70,220,60,[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]][i*2+j].map(x=>x+1).join(''),purple)}</g>)}</g>)}{label(260,295,'3 × 2 × 1 = 6',red)}</>
      else if(mode==='parity')drawing=<>{box(20,35,480,'(1234) = (14)(13)(12)',blue)}{['(12)','(13)','(14)'].map((s,i)=><g key={i}>{box(30+i*170,135,120,s,purple)}{label(90+i*170,220,'−1',red,24)}</g>)}{label(260,290,'(−1)³ = −1: odd',red)}</>
      else {slider(t('Langkah k','Step k'),0,6);drawing=<>{[0,1,2].map((i)=>{const a=2*Math.PI*i/3;return <g key={i}>{dot([150+75*Math.cos(a),155-75*Math.sin(a)],String((i+v)%3+1))}</g>})}<circle cx="150" cy="155" r="75" fill="none" stroke={blue}/>{box(325,75,120,String(v%2?5:4),purple)}{box(325,190,120,String(v%2?4:5),purple)}{arrow([385,120],[385,180],purple)}{label(150,275,'3-cycle')}{label(385,275,'2-cycle')}</>;result=`k=${v}; return together: ${v%6===0?'yes':'no'}; order=6`}
      break
    }
    case 'ringTable': {
      if(mode!=='hierarchy')slider('a in Z₆',0,5)
      if(mode==='hierarchy')drawing=<><rect x="35" y="30" width="450" height="260" rx="16" fill={blue+'10'} stroke={blue}/>{label(260,60,'commutative rings: Z₆ (2·3=0)',blue)}<rect x="65" y="95" width="390" height="180" rx="12" fill={purple+'12'} stroke={purple}/>{label(260,125,'integral domains: Z (2 has no inverse)',purple)}<rect x="95" y="160" width="330" height="95" rx="10" fill={red+'12'} stroke={red}/>{label(260,215,'fields: Z₅ (all nonzero invertible)',red)}</>
      else {drawing=<>{Array.from({length:6},(_,i)=><g key={i}>{box(10+i*85,50,75,String(i),blue)}{arrow([47+i*85,100],[47+i*85,175],purple)}{box(10+i*85,200,75,String(v*i%6),v*i%6===0?red:purple)}</g>)}{label(260,150,`×${v} mod 6`,purple)}</>;const invert=[1,5].includes(v);result=mode==='distribute'?`${v}·(1+3) mod 6=${v*4%6}; (${v}·1+${v}·3) mod 6=${v*4%6}`:v===0?'zero: not a unit':invert?`${v} is a unit; inverse ${v}`:`${v} is a zero divisor: a nonzero input maps to zero`}
      break
    }
    case 'ideal': {
      if(mode==='gaussian')drawing=<>{[0,1,2].flatMap(b=>[0,1,2].map(a=><g key={`${a}-${b}`}>{box(70+a*125,40+b*85,110,`${a}+${b}i`,a===0&&b===0?red:blue)}</g>))}{label(260,315,'i² = 2 modulo 3; 9 elements',purple)}</>
      else if(mode==='absorb')drawing=<>{box(20,40,225,'Z ⊂ Q: 1 ∈ Z',blue)}{box(275,40,225,'(2) ⊂ Z: 2 ∈ (2)',purple)}{arrow([130,95],[130,165],red)}{arrow([385,95],[385,165],purple)}{box(20,190,225,'×1/2 → 1/2 ∉ Z',red)}{box(275,190,225,'×3 → 6 ∈ (2)',purple)}{label(130,280,'subring, not ideal',red)}{label(385,280,'absorbs ambient products',purple)}</>
      else drawing=<>{[0,1,2].map(i=><g key={i}>{box(35,40+i*80,240,`… ${i-3}, ${i}, ${i+3}, …`,blue)}{arrow([285,60+i*80],[350,60+i*80],purple)}{box(365,40+i*80,100,`[${i}]₃`,red)}</g>)}{label(260,310,'[1]+[2]=[0]; [1]·[2]=[2]',purple)}</>
      break
    }
    case 'polynomial': {
      if(mode==='degree')drawing=<>{['x³+1','x²(x+1): remove x³','−x(x+1): remove −x²','1(x+1): remove x','remainder 0'].map((s,i)=><g key={i}>{box(25+i*35,20+i*56,320,s,i===4?red:blue)}</g>)}</>
      else drawing=<>{box(20,35,220,'Q: x²−2 irreducible',blue)}{box(280,35,220,'R: x²−2',purple)}{line([390,85],[330,140],purple)}{line([390,85],[450,140],purple)}{box(275,150,110,'x−√2',red)}{box(395,150,110,'x+√2',red)}{box(20,240,480,'x⁴+4=(x²+2x+2)(x²−2x+2)',blue)}{label(260,310,'no real roots does not imply irreducible in degree 4',muted,12)}</>
      break
    }
    case 'eisensteinShift': {
      const before=mode==='content'?[6,9,3]:[1,1,1,1,1],after=mode==='content'?[2,3,1]:[1,5,10,10,5],step=480/before.length
      drawing=<>{before.map((n,i)=><g key={i}>{box(20+i*step,45,step-10,String(n),blue)}{arrow([20+i*step+step/2,95],[20+i*step+step/2,185],purple)}{box(20+i*step,210,step-10,String(after[i]),i===0?blue:red)}</g>)}{label(260,155,mode==='content'?'extract gcd 3':'substitute x+1',purple)}{label(260,295,mode==='content'?'content 3 → primitive coefficients':'5∤1; 5|5,10,10,5; 25∤5',red)}</>;break
    }
  }
  return <figure className="my-4 min-w-0 rounded-xl border border-border p-3 sm:p-4">
    <DiagramViewport lang={lang}><svg viewBox="0 0 520 330" role="img" aria-label={theorem.title[lang]} className="w-full rounded-lg bg-[#101827]">{drawing}</svg></DiagramViewport>
    {control&&<label className="mt-4 block text-sm text-slate-300">{control.name}: <strong className="font-mono text-accent">{v}</strong><input type="range" aria-label={control.name} min={control.min} max={control.max} step={control.step} value={v} onChange={e=>setV(Number(e.target.value))} className="mt-2 w-full accent-sky-400"/></label>}
    {result&&<p className="mt-3 break-words font-mono text-xs leading-6 text-accent" aria-live="polite">{result}</p>}
    <figcaption className="mt-3 text-sm leading-7 text-slate-300"><strong>{t('Contoh & cara membaca: ','Example & how to read: ')}</strong>{theorem.caption[lang]}</figcaption>
  </figure>
}
