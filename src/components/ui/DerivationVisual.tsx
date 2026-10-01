import { useState, type ReactNode } from 'react'
import { DiagramViewport } from './DiagramViewport'
import type { VisualKind } from '../../content/summary-lessons'
import { FormulaBlock } from './FormulaBlock'

type Lang = 'id' | 'en'
const accent = 'var(--accent)'
const red = 'var(--danger)'
const fg = 'var(--fg)'
const muted = 'var(--muted)'
const line = 'var(--border-strong)'
type P = [number, number]
const path = (pts: P[], close = false) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ') + (close ? ' Z' : '')
const curve = (fn: (t: number) => P, a: number, b: number, n = 64) => path(Array.from({ length: n + 1 }, (_, i) => fn(a + (b - a) * i / n)))
const label = (x: number, y: number, text: string, color = fg, size = 15) => <text x={x} y={y} fill={color} fontSize={size} textAnchor="middle">{text}</text>
const point = (x: number, y: number, text?: string, color = accent) => <g><circle cx={x} cy={y} r="5" fill={color} />{text && label(x + 22, y - 12, text, color)}</g>
const segment = (a: P, b: P, color = accent, dashed = false, width = 3) => <path d={path([a, b])} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 5' : undefined} />
const arrow = (a: P, b: P, color = accent) => {
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0])
  return <g>{segment(a, b, color)}<path d={path([[b[0] - 10 * Math.cos(angle - .4), b[1] - 10 * Math.sin(angle - .4)], b, [b[0] - 10 * Math.cos(angle + .4), b[1] - 10 * Math.sin(angle + .4)]])} fill="none" stroke={color} strokeWidth="3" /></g>
}
const axes = (x = 90, y = 195, w = 250, h = 155) => <g>{segment([x - 35, y], [x + w, y], line, false, 1)}{segment([x, y + 25], [x, y - h], line, false, 1)}{label(x + w - 8, y + 20, 'x', muted)}{label(x - 18, y - h + 8, 'y', muted)}</g>
const box = (x: number, y: number, text: string, active: boolean, width = 100) => <g><rect x={x} y={y} width={width} height="50" rx="10" fill={active ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={active ? accent : line} strokeWidth="2" />{label(x + width / 2, y + 30, text, active ? accent : fg)}</g>

const controls: Partial<Record<VisualKind, { id: string; en: string; min: number; max: number; initial: number; step: number }>> = {
  triangle: { id: 'Bagian real x', en: 'Real part x', min: 0, max: 5, initial: 3, step: .5 },
  polar: { id: 'Sudut awal (derajat)', en: 'Input angle (degrees)', min: 0, max: 90, initial: 45, step: 5 },
  roots: { id: 'Jumlah akar n', en: 'Number of roots n', min: 2, max: 6, initial: 3, step: 1 },
  disc: { id: 'Posisi titik pada sumbu real', en: 'Point on the real axis', min: 0, max: 1.2, initial: .6, step: .1 },
  map: { id: 'Bagian real x, y = 1', en: 'Real part x, y = 1', min: -1, max: 1.5, initial: 1, step: .1 },
  projection: { id: 'Konstanta bidang c', en: 'Plane constant c', min: 1, max: 5, initial: 3, step: 1 },
  power: { id: 'Posisi P = (x,0), R = 2', en: 'Point P = (x,0), R = 2', min: .5, max: 4, initial: 3, step: .5 },
  conic: { id: 'Semi-sumbu pendek b, a = 3', en: 'Minor semiaxis b, a = 3', min: 1, max: 3, initial: 2, step: .25 },
  affine: { id: 'Skala mendatar', en: 'Horizontal scale', min: .5, max: 2.5, initial: 2, step: .25 },
  cycles: { id: 'Jumlah penerapan k', en: 'Applications k', min: 0, max: 6, initial: 0, step: 1 },
}

/** Each topic has a concrete mathematical scene; active steps reveal its construction. */
function Sketch({ kind, stage, value, lang }: { kind: VisualKind; stage: number; value: number; lang: Lang }) {
  const t = (id: string, en: string) => lang === 'id' ? id : en
  let drawing: ReactNode
  let readout = ''
  const on = (n: number) => stage >= n ? 1 : .18

  switch (kind) {
    case 'triangle': {
      const x = 100 + value * 25, y = 60
      drawing = <>{axes(100, 160, 270, 125)}{segment([100, 160], [x, 160], accent)}{segment([x, 160], [x, y], red)}{label((100 + x) / 2, 184, `x = ${value}`, accent)}{label(x + 40, 130, 'y = 4', red)}{arrow([100, 160], [x, y])}{point(x, y, 'z')}<g opacity={on(1)}>{segment([100, 160], [x, 260], red, true)}{point(x,260,'z̄',red)}{label(325, 65, 'z̄ = x − 4i', red)}{label(325, 90, t('pencerminan', 'reflection'), muted)}</g><g opacity={on(2)}>{label(320,225,'zz̄ = x²+16',accent)}</g></>
      readout = String.raw`|z|=\sqrt{${value}^2+4^2}=${Math.hypot(value, 4).toFixed(2)},\quad z\bar z=${value * value + 16}`
      break
    }
    case 'polar': {
      const theta = value * Math.PI / 180, radius=Math.sqrt(2)*20, p: P = [150 + radius * Math.cos(theta), 130 - radius * Math.sin(theta)]
      const out: P = [150 + 80 * Math.cos(theta * 4), 130 - 80 * Math.sin(theta * 4)]
      drawing = <><circle cx="150" cy="130" r={radius} fill="none" stroke={line} />{segment([50,130],[250,130],line,false,1)}{segment([150,230],[150,30],line,false,1)}{arrow([150,130],p)}{point(...p,'z')}<g opacity={on(1)}>{arrow([150,130],out,red)}{point(...out,'z⁴',red)}</g>{label(338, 90, `θ = ${value}°`,accent)}{label(338,125, `4θ = ${4 * value}°`,red)}{label(338,160,t('panjang: √2 → 4','length: √2 → 4'),stage===2?accent:muted,14)}</>
      readout = String.raw`z=\sqrt2e^{i${value}\pi/180},\quad z^4=4e^{i${4 * value}\pi/180}`
      break
    }
    case 'roots': {
      const n = value, center: P = [170,130]
      const points = Array.from({length:n}, (_,k): P => [170+85*Math.cos(2*Math.PI*k/n),130-85*Math.sin(2*Math.PI*k/n)])
      drawing = <><circle cx="170" cy="130" r="85" fill="none" stroke={line} /><g opacity={on(2)}><path d={path(points,true)} fill="var(--accent-soft)" stroke={accent} /></g>{points.map((p,k)=><g key={k} opacity={k===0?1:on(1)}>{segment(center,p,k===0?red:accent,true,1)}{point(...p,String(k),k===0?red:accent)}</g>)}{label(355,95,`${n} ${t('akar','roots')}`)}{label(355,130,`360°/${n}`,accent)}{label(355,165,t('jarak sudut sama','equal spacing'),muted,14)}</>
      readout = String.raw`w_k=e^{2\pi ik/${n}},\quad k=0,\ldots,${n-1}`
      break
    }
    case 'disc': {
      const x = 140 + value * 75, inside=value<1, epsilon=inside?Math.min(.2,(1-value)/2):.2
      drawing = <><circle cx="140" cy="130" r="75" fill="var(--accent-soft)" stroke={accent} strokeWidth="2" strokeDasharray="5 4" />{segment([40,130],[265,130],line,false,1)}{point(x,130,'P',inside?accent:red)}<circle cx={x} cy="130" r={epsilon*75} fill="none" stroke={red} strokeWidth="2" opacity={on(1)} />{label(335,85, '|z| < 1',accent)}{label(335,125,inside?t('interior','interior'):value===1?t('batas','boundary'):t('eksterior','exterior'),inside?accent:red)}{label(335,165,`ε = ${epsilon.toFixed(2)}`,inside?accent:red)}</>
      readout = inside ? String.raw`|P|=${value.toFixed(1)}<1,\quad\varepsilon<1-|P|=${(1-value).toFixed(1)}` : String.raw`|P|=${value.toFixed(1)}\ge1:\quad P\notin D`
      break
    }
    case 'map': {
      const u=value*value-1,v=2*value
      drawing = <>{axes(85,175,90,130)}{axes(310,175,90,130)}{label(85,235,'z = x + i',accent)}{label(310,235,'w = z²',red)}{point(85+value*40,135,'z')}<g opacity={on(1)}>{arrow([185,120],[230,120],fg)}{point(310+u*32,175-v*32,'w',red)}</g><g opacity={on(2)}><path d={curve(y=>[310+(value*value-y*y)*32,175-2*value*y*32],-1,1)} fill="none" stroke={red} strokeWidth="2" /></g></>
      readout = String.raw`(${value.toFixed(1)}+i)^2=${u.toFixed(2)}+(${v.toFixed(2)})i`
      break
    }
    case 'derivative':
      drawing=<>{axes(95,160,100,100)}{axes(310,160,100,100)}{point(95,160,'z₀')}{arrow([95,160],[130,160])}{arrow([95,160],[95,125],red)}<g opacity={on(1)}>{arrow([310,160],[355,115])}{arrow([310,160],[265,115],red)}</g>{label(110,215,'h',accent)}{label(315,215,'f′(z₀)h',accent)}{label(225,45,'f′(1+i) = 2+2i')}{label(225,240,t('skala dan rotasi lokal','local scale and rotation'),muted)}</>
      break
    case 'cr':
      drawing=<>{point(90,180,'z₀')}{arrow([90,180],[195,180])}{arrow([90,180],[90,65],red)}{label(225,206,'uₓ + ivₓ',accent)}{label(142,58,'vᵧ − iuᵧ',red)}<g opacity={on(1)}>{arrow([260,140],[295,140],fg)}{box(302,70,'uₓ = vᵧ',stage===2,118)}{box(302,145,'uᵧ = −vₓ',stage===2,118)}</g>{label(205,240,t('dua arah, satu turunan','two directions, one derivative'),muted)}</>
      break
    case 'harmonic':
      drawing=<><path d={curve(x=>[100+x*30,150-x*x*10],-3,3)} fill="none" stroke={accent} strokeWidth="3" /><path d={curve(y=>[290+y*30,80+y*y*10],-3,3)} fill="none" stroke={red} strokeWidth="3" />{label(100,215,'uₓₓ = +2',accent)}{label(290,215,'uᵧᵧ = −2',red)}<g opacity={on(1)}>{label(215,35,'Δu = 2 − 2 = 0')}{label(215,245,t('kelengkungan saling mengimbangi','balanced curvatures'),muted)}</g></>
      break
    case 'exp':
      drawing=<><rect x="40" y="50" width="90" height="155" fill="var(--accent-soft)" stroke={accent} /><path d="M85 50V205" stroke={red} strokeWidth="3" />{label(85,232,'x tetap / fixed',accent,14)}<g opacity={on(1)}>{arrow([155,128],[200,128],fg)}<circle cx="310" cy="128" r="70" fill="none" stroke={accent} strokeWidth="3" />{segment([310,128],[380,128],red)}{label(310,232,'r = eˣ',accent)}</g><g opacity={on(2)}>{label(215,28,'e^(x+iy) = eˣeⁱʸ')}{label(310,128+25,'y → θ',red)}</g></>
      break
    case 'branch':
      drawing=<>{axes(190,135,190,100)}{segment([40,135],[190,135],red,false,5)}{point(95,120,'+π')}{point(95,150,'−π',red)}<g opacity={on(1)}><path d="M110 105 A85 85 0 0 1 260 135" fill="none" stroke={accent} strokeWidth="2" /><path d="M110 165 A85 85 0 0 0 260 135" fill="none" stroke={red} strokeWidth="2" /></g>{label(220,240,t('dua nilai batas, selisih 2πi','two boundary values, difference 2πi'),muted,14)}</>
      break
    case 'trig':
      drawing=<>{box(20,95,'z = iy',stage===0,100)}{arrow([128,120],[156,120],fg)}{box(165,60,'e⁻ʸ',stage===1,110)}{box(165,150,'eʸ',stage===1,110)}<g opacity={on(2)}>{arrow([285,120],[310,120],fg)}{box(318,95,'i sinh y',true,105)}</g>{label(220,240,'cos(iy) = cosh y',muted)}</>
      break
    case 'integral':
    case 'primitive':
    case 'cauchy':
    case 'residue': {
      const primitive=kind==='primitive',residue=kind==='residue'
      drawing=<><ellipse cx="175" cy="135" rx="110" ry="80" fill="var(--accent-soft)" stroke={accent} strokeWidth="3" />{arrow([270,105],[256,81])}{label(175,30,'γ : +1',accent)}{primitive?<>{point(285,135,'start=end')}{label(345,170,'F(b)−F(a)',fg,14)}{label(345,205,'= 0',accent)}</>:<>{point(residue?130:175,135,residue?'0':'a',red)}{residue&&point(225,135,'1',red)}<g opacity={on(1)}><circle cx={residue?130:175} cy="135" r="23" fill="none" stroke={red} strokeDasharray="4 4" />{residue&&<circle cx="225" cy="135" r="23" fill="none" stroke={red} strokeDasharray="4 4" />}</g>{label(345,100,kind==='integral'?'dz = z′dt':residue?'−1 + 1':'f(a)',red)}{label(345,140,kind==='integral'?'|∫| ≤ ML':residue?'Σ Res = 0':'2πi f(a)',stage===2?accent:muted)}</>}{label(220,245,primitive?t('satu antiturunan global','one global antiderivative'):t('periksa bagian dalam dan orientasi','check interior and orientation'),muted,14)}</>
      break
    }
    case 'series':
      drawing=<><circle cx="160" cy="135" r="88" fill="var(--accent-soft)" stroke={accent} strokeDasharray="5 5" /><circle cx="160" cy="135" r="5" fill={red} /><circle cx="248" cy="135" r="5" fill={red} />{label(160,112,'0',red)}{label(252,115,'1',red)}{label(340,80,'1/z',stage===1?accent:fg)}{label(340,125,'+ 1 + z + z²',stage===2?accent:fg,14)}{label(220,245,'0 < |z| < 1',accent)}</>
      break
    case 'singularities':
      drawing=<>{box(20,55,t('dapat diisi','removable'),stage===0,122)}{box(160,55,t('kutub','pole'),stage===1,122)}{box(300,55,t('esensial','essential'),stage===2,122)}{label(81,145,'0',accent,28)}{label(221,145,'−m … −1',accent,20)}{label(361,145,'… −3 −2 −1',accent,17)}{label(81,200,t('tanpa pangkat −','no negative powers'),muted,12)}{label(221,200,t('hingga','finite'),muted,14)}{label(361,200,t('tak hingga','infinite'),muted,14)}{label(220,245,t('baca pangkat negatif Laurent','read Laurent’s negative powers'),muted,14)}</>
      break
    case 'basis':
      drawing=<>{axes(75,195,295,155)}{point(135,150,'P')}{point(270,65,'Q',red)}{arrow([75,195],[135,150])}<g opacity={on(1)}>{arrow([135,150],[270,65],red)}{segment([135,150],[270,150],line,true)}{segment([270,150],[270,65],line,true)}</g>{label(320,130,'Q−P',red)}{label(220,242,'(3,4) = 3e₁ + 4e₂',accent)}</>
      break
    case 'products':
      drawing=<><path d="M90 175L230 175L295 105L155 105Z" fill="var(--accent-soft)" stroke={line} />{arrow([90,175],[230,175])}{arrow([90,175],[155,105],red)}<g opacity={on(1)}>{arrow([90,175],[90,65],fg)}{label(68,45,'a×b')}</g>{label(230,205,'a',accent)}{label(170,90,'b',red)}<g opacity={on(2)}><path d="M90 175V65L230 65L295 105V0" fill="none" stroke={line} strokeDasharray="4 5" />{label(340,95,t('luas × tinggi','area × height'))}{label(340,130,'(a×b)·c',accent)}</g></>
      break
    case 'plane':
    case 'projection': {
      const d=kind==='projection'?value:3,base=175,foot: P=[205,base-d*12]
      drawing=<><path d={path([[80,base],[290,base],[360,base-65],[150,base-65]],true)} fill="var(--accent-soft)" stroke={accent} strokeWidth="2" />{label(303,202,`n·r = ${d}`,accent)}{arrow(foot,[foot[0],40],red)}{label(230,46,'n',red)}{point(205,235,'P = 0',red)}<g opacity={on(1)}>{segment([205,235],foot,red,true)}{point(...foot,'Q')}</g><g opacity={on(2)}>{label(100,60,kind==='plane'?'r = p + td':'d = |n·P−c|/|n|',fg,14)}</g></>
      if(kind==='projection')readout=String.raw`n=(1,1,1),\ c=${d},\ P=0:\quad d=\frac{${d}}{\sqrt3}=${(d/Math.sqrt(3)).toFixed(2)}`
      break
    }
    case 'power': {
      const x=value,px=125+x*48,polarX=125+192/x
      drawing=<><circle cx="125" cy="135" r="96" fill="var(--accent-soft)" stroke={accent} strokeWidth="2" />{point(125,135,'O')}{point(px,135,'P',red)}{segment([125,135],[px,135],line)}<g opacity={on(1)}>{x>=2&&segment([px,135],[polarX,135-96*Math.sqrt(1-4/(x*x))],red)}</g><g opacity={on(2)}>{polarX<425?segment([polarX,32],[polarX,225],red,true):<>{arrow([325,185],[410,185],red)}{label(340,165,t('polar di kanan gambar','polar off-frame →'),red,13)}</>}</g>{label(340,35,`Pow = ${(x*x-4).toFixed(2)}`,red)}{label(330,253,x>=2?t('P di luar / pada','P outside / on'):t('P di dalam','P inside'),muted,14)}</>
      readout=String.raw`\operatorname{Pow}(P)=${x}^2-2^2=${(x*x-4).toFixed(2)},\quad\text{polar}:x=${(4/x).toFixed(2)}`
      break
    }
    case 'radical':
      drawing=<><circle cx="165" cy="135" r="85" fill="var(--accent-soft)" stroke={accent} strokeWidth="2" /><circle cx="265" cy="135" r="85" fill="none" stroke={red} strokeWidth="2" />{point(165,135,'O₁')}{point(265,135,'O₂',red)}<g opacity={on(1)}>{segment([215,25],[215,245],fg,true)}{label(215,23,'Pow₁ = Pow₂')}</g>{label(365,200,'x = 0',stage===2?accent:muted)}</>
      break
    case 'conic': {
      const b=value,c=Math.sqrt(9-b*b),scale=31
      drawing=<><ellipse cx="185" cy="135" rx="93" ry={b*scale} fill="var(--accent-soft)" stroke={accent} strokeWidth="2" />{point(185-c*scale,135,'F−',red)}{point(185+c*scale,135,'F+',red)}<g opacity={on(1)}>{segment([185-c*scale,135],[185,135-b*scale],red)}{segment([185+c*scale,135],[185,135-b*scale],red)}</g>{label(355,75,`a = 3`)}{label(355,115,`b = ${b}`,accent)}{label(355,155,`c = ${c.toFixed(2)}`,red)}</>
      readout=String.raw`c=\sqrt{a^2-b^2}=\sqrt{9-${b*b}}=${c.toFixed(2)}`
      break
    }
    case 'quadric':
      drawing=<>{[-2,-1,0,1,2].map(c=><path key={c} d={curve(t=>[220+(c+t)*33,135+(c-t)*15-c*t*12],-2,2)} fill="none" stroke={stage===2?accent:line} strokeWidth="2" />)}{[-2,-1,0,1,2].map(c=><path key={c} d={curve(s=>[220+(s+c)*33,135+(s-c)*15-s*c*12],-2,2)} fill="none" stroke={red} strokeWidth={stage===1?3:1} />)}{label(220,28,'z = st = (x+y)(x−y)')}{label(220,245,t('dua keluarga garis lurus','two straight-line families'),muted,14)}</>
      break
    case 'eigen':
      drawing=<>{axes(195,140,150,100)}<g opacity={stage===0?.3:1}>{arrow([100,230],[290,40],accent)}{arrow([105,50],[285,230],red)}</g>{label(318,40,'λ₁ = 2',accent)}{label(320,220,'λ₂ = 0',red)}<g opacity={on(2)}>{label(195,28,'(x+y)² = 2y₁²')}{label(195,255,t('arah utama tegak lurus','perpendicular principal axes'),muted,14)}</g></>
      break
    case 'reduce':
      drawing=<>{axes(245,155,140,125)}<circle cx="170" cy="110" r="66" fill="var(--accent-soft)" stroke={accent} strokeWidth="2" />{point(170,110,stage===0?'?':'(−2,1)',red)}<g opacity={on(1)}>{arrow([245,155],[170,110],red)}</g><g opacity={on(2)}>{segment([85,110],[255,110],accent)}{segment([170,35],[170,185],accent)}</g>{label(220,240,'(x+2)² + (y−1)² = 5',accent)}</>
      break
    case 'affine':
    case 'isometry': {
      const stretch=kind==='affine'?value:1
      drawing=<><path d="M35 175H115V95H35Z" fill="var(--accent-soft)" stroke={accent} strokeWidth="2" />{point(115,95)}{label(75,215,'input',accent)}{arrow([145,135],[190,135],fg)}<path d={kind==='affine'?path([[225,175],[225+80*stretch,175],[225+80*stretch,95],[225,95]],true):'M315 78.4L371.6 135L315 191.6L258.4 135Z'} fill="none" stroke={red} strokeWidth="3" opacity={on(1)} /><g opacity={on(1)}>{point(kind==='affine'?225+80*stretch:371.6,kind==='affine'?95:135,undefined,red)}</g>{label(320,225,kind==='affine'?`scale x = ${stretch}`:'RᵀR = I',red)}<g opacity={on(2)}>{label(220,35,kind==='affine'?'T(q)−T(p) = A(q−p)':'|Rv|² = vᵀRᵀRv = |v|²')}</g></>
      if(kind==='affine')readout=String.raw`T(1,2)=(${stretch}\cdot1+1,2-1)=(${stretch+1},1)`
      break
    }
    case 'group':
    case 'cyclic': {
      const nums=kind==='group'?[0,1,2,3]:[0,2,4],n=nums.length
      const pts=nums.map((_,i):P=>[180+85*Math.cos(2*Math.PI*i/n),130-85*Math.sin(2*Math.PI*i/n)])
      drawing=<>{nums.map((a,i)=><g key={a}>{arrow(pts[i],pts[(i+1)%n],i===stage?red:line)}<circle cx={pts[i][0]} cy={pts[i][1]} r="19" fill="var(--surface)" stroke={accent} strokeWidth="2" />{label(pts[i][0],pts[i][1]+5,String(a),accent,18)}</g>)}{label(355,85,kind==='group'?'+1 mod 4':'+2 mod 6')}{label(355,130,t('identitas: 0','identity: 0'),muted,14)}{label(355,175,kind==='group'?'1 + 3 = 0':'3 × 2 = 0',red)}</>
      break
    }
    case 'cosets':
    case 'kernel':
    case 'quotient':
    case 'ideal': {
      const thirds=kind==='kernel'||kind==='quotient',sets=thirds?[[0,3,6],[1,4,7],[2,5,8]]:[[0,2,4],[1,3,5]],w=thirds?112:165
      drawing=<>{sets.map((set,i)=><g key={i}><rect x={30+i*(w+15)} y="45" width={w} height="145" rx="12" fill={i===0?'var(--accent-soft)':'var(--surface-2)'} stroke={i===0?accent:red} strokeWidth="2" />{set.map((n,j)=><g key={n}><circle cx={60+i*(w+15)} cy={76+j*38} r="13" fill="var(--surface)" stroke={i===0?accent:red} />{label(60+i*(w+15),81+j*38,String(n),i===0?accent:red,14)}</g>)}{label(30+i*(w+15)+w/2,217,thirds?`[${i}]₃`:i===0?'H / [0]':'1+H / [1]',i===0?accent:red,14)}</g>)}<g opacity={on(2)}>{label(220,250,thirds?'φ(a+b) = [a+b]₃':kind==='ideal'?'[1] × [1] = [1]':'6 = 2 × 3',accent)}</g></>
      break
    }
    case 'cycles': {
      const k=value,nums=[1,2,3],pts:P[]=[[100,60],[165,175],[35,175]]
      drawing=<>{nums.map((n,i)=><g key={n}>{arrow(pts[i],pts[(i+1)%3],line)}<circle cx={pts[i][0]} cy={pts[i][1]} r="20" fill="var(--surface)" stroke={accent} />{label(pts[i][0],pts[i][1]+5,String(nums[(i+k)%3]),accent,18)}</g>)}{segment([280,75],[355,175],red)}{box(248,50,String(k%2?5:4),stage===1,65)}{box(325,155,String(k%2?4:5),stage===1,65)}{label(100,240,'k mod 3',accent)}{label(325,240,'k mod 2',red)}{label(220,30,`k = ${k}`)}</>
      readout=String.raw`k=${k}:\quad k\bmod3=${k%3},\quad k\bmod2=${k%2}${k%3===0&&k%2===0?String.raw`\quad\sigma^k=e`:''}`
      break
    }
    case 'parity':
      drawing=<>{[0,1,2].map(i=><g key={i}>{box(25+i*140,75,['(1 2)','(1 3)','(1 2 3)'][i],i===stage,110)}{label(80+i*140,175,['−1','−1','+1'][i],i===2?accent:red,24)}</g>)}{label(220,235,'(−1) × (−1) = +1',accent)}</>
      break
    case 'ring':
      drawing=<>{box(35,85,'2 ≠ 0',stage===0,95)}{label(155,115,'×',fg,26)}{box(180,85,'3 ≠ 0',stage===1,95)}{label(300,115,'=',fg,26)}{box(325,85,'0',stage===2,75)}{label(220,180,'2 × 3 = 6 ≡ 0 (mod 6)',red)}{label(220,235,t('pembatalan gagal','cancellation fails'),muted)}</>
      break
    case 'division':
      drawing=<>{box(25,70,'x³ + 1',stage===0,130)}{arrow([165,95],[200,95],fg)}{box(210,70,'÷ (x+1)',stage===1,180)}<g opacity={on(1)}>{label(220,170,'x² − x + 1',accent,22)}</g><g opacity={on(2)}>{label(220,215,t('sisa = 0','remainder = 0'),red)}{label(220,245,'−1 ≡ 4 (mod 5)',muted)}</g></>
      break
    case 'eisenstein':
      drawing=<>{[1,0,6,3].map((v,i)=><g key={i}>{box(24+i*103,65,String(v),stage===0?i>0:stage===1?i===0:i===3,85)}{label(66+i*103,155,['x³','x²','x','1'][i],muted)}{label(66+i*103,198,i===0?'3 ∤ 1':i===3&&stage===2?'9 ∤ 3':`3 | ${v}`,i===0?red:accent,14)}</g>)}{label(220,245,t('tiga syarat, p = 3','three conditions, p = 3'),muted,14)}</>
      break
  }
  return <><svg viewBox="0 0 440 280" role="img" aria-label={t('Visual matematika untuk langkah terpilih', 'Mathematical visual for the selected step')} className="h-auto w-full"><rect x="1" y="1" width="438" height="278" rx="14" fill="var(--surface)" stroke="var(--border)" />{drawing}</svg>{readout&&<div className="mt-2 min-w-0 rounded-lg border border-border bg-card px-3 py-1"><FormulaBlock tex={readout} /></div>}</>
}

/** Static, fully revealed picture of a topic for overview thumbnails. */
export const TopicThumb = ({ kind, lang }: { kind: VisualKind; lang: Lang }) => <div className="[&>div]:hidden"><Sketch kind={kind} stage={2} value={controls[kind]?.initial ?? 3} lang={lang} /></div>

export function DerivationVisual({ kind, stage, lang }: { kind: VisualKind; stage: number; lang: Lang }) {
  const control=controls[kind]
  const [value,setValue]=useState(control?.initial??3)
  const t=(id:string,en:string)=>lang==='id'?id:en
  return <figure className="min-w-0 space-y-3">
    <DiagramViewport lang={lang}><Sketch kind={kind} stage={stage} value={value} lang={lang} /></DiagramViewport>
    {control&&<label className="block rounded-lg border border-border bg-card p-3 text-xs text-slate-300">
      <span className="flex items-start justify-between gap-2"><span>{control[lang]}</span><output className="font-mono text-accent">{value}</output></span>
      <input aria-label={control[lang]} type="range" min={control.min} max={control.max} step={control.step} value={value} onChange={e=>setValue(Number(e.target.value))} className="mt-3 w-full accent-[var(--accent)]" />
    </label>}
    <figcaption className="text-xs leading-relaxed text-slate-400">{t('Warna ungu menandai objek awal; merah menandai perubahan atau syarat penting. Pilih langkah untuk mengikuti konstruksi. Gambar geometri 3D dan panah adalah skema, bukan ukuran sebenarnya.', 'Violet marks the starting object; red marks a change or important condition. Select a step to follow the construction. 3D geometry and arrows are schematic, not measured dimensions.')}</figcaption>
  </figure>
}
