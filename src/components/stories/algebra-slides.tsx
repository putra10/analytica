import { ALGEBRA_SLIDE_TOPICS, type AlgebraSlideKind } from '../../content/algebra-slide-topics'
import { At, Arrow, C, Dot, T, b, type Lang, type P, type Story } from './kit'
import { AlgebraBox as Box, AlgebraNode as Node } from './algebra-slide-shapes'

const set = (mask: number) => mask === 0 ? '∅' : `{${[1, 2].filter(n => mask & (1 << (n - 1))).join(',')}}`
const divisors = [1, 2, 3, 4, 6, 12]

function draw(kind: AlgebraSlideKind, k: number, v: number, lang: Lang) {
  const t = (id: string, en: string) => lang === 'id' ? id : en
  switch (kind) {
    case 'setMembership': return <>
      <T x={240} y={30}>S = {'{1,2}'}</T>
      <rect x="25" y="60" width="430" height="132" rx="14" fill={C.bg} stroke={C.a} /><T x={240} y={95}>P(S)</T>
      {['∅', '{1}', '{2}', '{1,2}'].map((value, i) => <Box key={value} x={36 + i * 106} y={130} w={94} text={value} active={k === 0 || i === 1} />)}
      <At frame={k} from={1}><T x={240} y={208} color={C.a}>{'{1} ∈ P(S)'}</T></At>
      <At frame={k} from={2}><T x={125} y={251} color={C.r}>{'1 ∉ P(S)'}</T><T x={340} y={251} color={C.g}>{'{{1}} ⊆ P(S)'}</T></At>
    </>
    case 'setBuilder': {
      const nums = Array.from({ length: 14 }, (_, i) => i - 4)
      return <><T x={240} y={30} size={17}>{t('Menyaring ≠ menghasilkan nilai', 'Filtering ≠ producing values')}</T>
        {[0, 1].map(row => <g key={row}><T x={240} y={65 + row * 90} size={15}>{row === 0 ? 'I = {n ∈ Z : 2 | n²}' : 'J = {n² : n ∈ Z}'}</T><path d={`M32 ${100 + row * 90} H450`} stroke={C.ln} />{nums.map((n, i) => { const inside = row === 0 ? n % 2 === 0 : n >= 0 && Number.isInteger(Math.sqrt(n)); return <g key={n}><Dot at={[42 + i * 30, 100 + row * 90]} r={n === v ? 9 : 5} color={inside ? row === 0 ? C.a : C.r : C.mu} hollow={!inside} /><T x={42 + i * 30} y={124 + row * 90} size={12}>{n}</T></g> })}</g>)}
        <At frame={k} from={2}><T x={240} y={260} size={15}>{t('Warna bertemu di 0 dan 4; I tetap berbeda dari J.', 'Colors meet at 0 and 4; I still differs from J.')}</T></At>
      </>
    }
    case 'abstractSets': return <>
      <T x={240} y={30} size={17}>{'X = M₂(R),  P(A): det A = 0'}</T>
      {[['A', '1  2', '2  4', 'det = 0'], ['I₂', '1  0', '0  1', 'det = 1'], ['c', '5', '', t('bukan matriks', 'not a matrix')]].map((a, i) => <g key={a[0]}><rect x={20 + i * 153} y="70" width="140" height="170" rx="12" fill={C.bg} stroke={i === 0 ? C.a : C.r} /><T x={90 + i * 153} y={95} color={i === 0 ? C.a : C.r}>{a[0]}</T><T x={90 + i * 153} y={137} size={22}>{a[1]}</T><T x={90 + i * 153} y={168} size={22}>{a[2]}</T><At from={1} frame={k}><T x={90 + i * 153} y={216} size={13}>{a[3]}</T></At></g>)}
      <At from={2} frame={k}><T x={90} y={274} color={C.g}>A ∈ H</T><T x={243} y={274} color={C.r}>I₂ ∉ H</T><T x={396} y={274} color={C.r}>5 ∉ X</T></At>
    </>
    case 'setEquality': return <>
      <T x={240} y={30} size={15}>{'U = {1,…,6}; A = {1,2,3}; B = {3,4}'}</T>
      {['A ∪ B', '(A ∪ B)ᶜ', 'Aᶜ ∩ Bᶜ'].map((label, row) => <g key={label}><T x={95} y={86 + row * 77} size={14}>{label}</T>{Array.from({ length: 6 }, (_, i) => <g key={i}><Node at={[190 + i * 43, 80 + row * 77]} label={i + 1} color={(row === 0 ? i < 4 : i >= 4) ? row === 0 ? C.a : C.g : C.mu} /></g>)}</g>)}
      <At from={2} frame={k}><T x={240} y={283} size={13} color={C.g}>{t('Dua ruas memilih anggota yang sama.', 'Both sides select the same members.')}</T></At>
    </>
    case 'equivalence': return <>
      <T x={240} y={28} size={16}>{'a ~ b ⇔ 3 | (a−b)'}</T>
      {[0, 1, 2].map(r => <g key={r}><rect x={25 + r * 153} y="55" width="135" height="193" rx="14" fill={C.bg} stroke={[C.a, C.r, C.g][r]} strokeWidth="2" /><T x={92 + r * 153} y={85} color={[C.a, C.r, C.g][r]}>[{r}]</T>{[-1, 0, 1, 2].map((n, i) => <Node key={n} at={[92 + r * 153, 116 + i * 36]} label={r + 3 * n} color={[C.a, C.r, C.g][r]} />)}</g>)}
      <At from={2} frame={k}><T x={240} y={278} size={14}>{t('Satu anggota, tepat satu kelas; contoh hingga dari Z.', 'One member, one class; a finite sample from Z.')}</T></At>
    </>
    case 'firstIso': return <>
      <T x={150} y={28}>G = Z₁₂</T><T x={398} y={28}>φ(a) = [a]₃</T>
      {[0, 1, 2].map(r => <g key={r}><rect x="25" y={48 + r * 72} width="275" height="58" rx="12" fill={C.bg} stroke={r === 0 && k === 1 ? C.g : [C.a, C.r, C.v][r]} strokeWidth="2" />{[0, 1, 2, 3].map(n => <Node key={n} at={[60 + n * 65, 77 + r * 72]} label={r + n * 3} color={[C.a, C.r, C.v][r]} />)}<Arrow from={[313, 77 + r * 72]} to={[374, 77 + r * 72]} color={[C.a, C.r, C.v][r]} /><Node at={[404, 77 + r * 72]} label={r} color={[C.a, C.r, C.v][r]} /></g>)}
      <T x={240} y={284} size={14}>{k === 1 ? 'K = {0,3,6,9}' : t('Satu koset ↔ satu image', 'One coset ↔ one image')}</T>
    </>
    case 'correspondence': return <>
      <T x={110} y={27}>Z</T><T x={348} y={27}>Z₁₂</T>
      {divisors.map((d, i) => <g key={d}><Box x={32} y={45 + i * 39} w={130} h={32} text={`${d === 1 ? '' : d}Z`} active={divisors[v] === d} /><Arrow from={[178, 61 + i * 39]} to={[263, 61 + i * 39]} color={divisors[v] === d ? C.a : C.mu} /><Box x={280} y={45 + i * 39} w={170} h={32} text={`⟨[${d === 12 ? 0 : d}]⟩; ${12 / d} ${t('anggota', 'members')}`} active={divisors[v] === d} /></g>)}
    </>
    case 'secondIso': return <>
      <T x={240} y={25}>{'G = (Z,+), H = 6Z, N = 4Z'}</T>
      {['H', 'N'].map((name, row) => <g key={name}><T x={35} y={82 + row * 66}>{name}</T>{[0, 2, 4, 6, 8, 10, 12].map((n, i) => <Node key={n} at={[85 + i * 57, 77 + row * 66]} label={n} color={n % (row === 0 ? 6 : 4) === 0 ? row === 0 ? C.a : C.r : C.mu} />)}</g>)}
      <At from={1} frame={k}><T x={240} y={191} size={15}>{'H+N = 2Z; H∩N = 12Z'}</T></At>
      <At from={2} frame={k}><Box x={22} y={221} w={190} text={'2Z/4Z: [0], [2]'} /><Arrow from={[225, 246]} to={[251, 246]} color={C.a} /><Box x={267} y={221} w={190} text={'6Z/12Z: [0], [6]'} /><T x={240} y={289} size={13}>{t('[6]₁₂ ↦ [2]₄; keduanya ≅ Z₂', '[6]₁₂ ↦ [2]₄; both ≅ Z₂')}</T></At>
    </>
    case 'thirdIso': return <>
      <T x={240} y={26}>12Z ⊆ 4Z ⊆ Z</T>
      {[0, 1, 2, 3].map(r => <g key={r}><rect x={24 + r * 114} y="48" width="96" height="169" rx="12" fill={C.bg} stroke={k >= 2 ? [C.a, C.r, C.g, C.v][r] : C.ln} />{[0, 1, 2].map(n => <Node key={n} at={[72 + r * 114, 78 + n * 55]} label={r + 4 * n} color={r === 0 && k === 1 ? C.g : C.a} />)}<At from={2} frame={k}><Arrow from={[72 + r * 114, 223]} to={[72 + r * 114, 242]} color={[C.a, C.r, C.g, C.v][r]} /><Node at={[72 + r * 114, 265]} label={`[${r}]₄`} color={[C.a, C.r, C.g, C.v][r]} /></At></g>)}
    </>
    case 'symmetricFunctions': return <>
      <T x={240} y={28} size={16}>{t('Urutan berubah, jumlah tetap', 'The order changes, the sum stays')}</T>
      {[[1, 2, 4], [2, 1, 4]].map((a, row) => <g key={row}>{a.map((n, i) => <Node key={i} at={[92 + i * 76, 85 + row * 115]} label={n} color={[C.a, C.r, C.g][n === 1 ? 0 : n === 2 ? 1 : 2]} />)}<T x={365} y={91 + row * 115}>Σ = 7</T></g>)}
      <Arrow from={[95, 110]} to={[165, 174]} color={C.a} /><Arrow from={[166, 110]} to={[95, 174]} color={C.r} /><Arrow from={[244, 110]} to={[244, 174]} color={C.g} />
      <At from={2} frame={k}><T x={240} y={266} size={15} color={C.r}>{t('x₁²x₂: 2 → 4; tidak simetris', 'x₁²x₂: 2 → 4; not symmetric')}</T></At>
    </>
    case 'cycleConjugation': {
      const points: P[] = [[80, 100], [172, 100], [126, 202]]
      return <><T x={240} y={30}>σ = (14)(25)</T>{[[1, 2, 3], [4, 5, 3]].map((a, side) => <g key={side}>{points.map((p, i) => { const q = points[(i + 1) % 3], d = Math.hypot(q[0] - p[0], q[1] - p[1]), dx = (q[0] - p[0]) / d, dy = (q[1] - p[1]) / d; return <g key={i}><Arrow from={[p[0] + side * 224 + 19 * dx, p[1] + 19 * dy]} to={[q[0] + side * 224 - 22 * dx, q[1] - 22 * dy]} color={side ? C.r : C.a} /><Node at={[p[0] + side * 224, p[1]]} label={a[i]} color={side ? C.r : C.a} /></g> })}<T x={126 + side * 224} y={262}>{side ? '(453)' : '(123)'}</T></g>)}<Arrow from={[215, 152]} to={[266, 152]} color={C.v} /></>
    }
    case 'parityProof': return <>
      <T x={240} y={29} size={15}>{'Δ=(x₁−x₂)(x₁−x₃)(x₂−x₃)'}</T>
      {['(1,2,3)', '(2,1,3)', '(1,2,3)'].map((a, i) => <g key={i}><Box x={22 + i * 156} y={70} w={125} text={a} /><T x={85 + i * 156} y={151} color={i === 1 ? C.r : C.a}>Δ = {i === 1 ? '+2' : '−2'}</T>{i < 2 && <Arrow from={[151 + i * 156, 95]} to={[173 + i * 156, 95]} color={C.v} />}</g>)}
      <At from={1} frame={k}><T x={240} y={197}>{t('r pertukaran → (−1)ʳ Δ', 'r swaps → (−1)ʳ Δ')}</T></At>
      <At from={2} frame={k}><T x={240} y={231} size={15}>{t('σ sama → tanda sama → r ≡ s (mod 2)', 'same σ → same sign → r ≡ s (mod 2)')}</T></At>
      <At from={3} frame={k}><T x={240} y={271} color={C.g}>{'Aₙ = ker(sgn), n ≥ 2: |Aₙ| = n!/2'}</T></At>
    </>
    case 'subringTest': return <>
      <T x={240} y={30}>{'S = 2Z ⊆ Z'}</T><Box x={80} y={65} text="a = 2" /><Box x={270} y={65} text="b = 4" />
      <Arrow from={[145, 125]} to={[145, 173]} color={C.a} /><Arrow from={[335, 125]} to={[335, 173]} color={C.r} />
      <Box x={60} y={187} w={170} text="a−b = −2 ∈ 2Z" /><Box x={250} y={187} w={170} text="ab = 8 ∈ 2Z" />
      <At from={2} frame={k}><T x={240} y={273} size={15}>{t('1 ∉ 2Z; subring tetap sah menurut slide.', '1 ∉ 2Z; a valid subring in the slide convention.')}</T></At>
    </>
    case 'booleanRing': return <>
      <T x={240} y={30}>{'P({1,2}): + = △, × = ∩'}</T>
      <Box x={55} y={70} w={170} text={`A = ${set(v)}`} /><Box x={255} y={70} w={170} text={'B = {1,2}'} />
      <At from={1} frame={k}><Arrow from={[140, 126]} to={[140, 165]} color={C.a} /><Arrow from={[340, 126]} to={[340, 165]} color={C.r} /><Box x={55} y={177} w={170} text={`A △ B = ${set(v ^ 3)}`} /><Box x={255} y={177} w={170} text={`A ∩ B = ${set(v & 3)}`} /></At>
      <At from={2} frame={k}><T x={240} y={272} color={C.g}>{'A △ A = ∅; A ∩ A = A; 2a = 0'}</T></At>
    </>
    case 'ringTheorems': {
      const rows = [['Z', 'Z/6Z', 'Z₆'], ['6Z ⊆ J ⊆ Z', 'J/6Z', 'ideal Z₆'], ['S = 2Z', '2Z/6Z', 'Z₃'], ['Z/6Z', t('bagi {0,3}', 'divide by {0,3}'), 'Z/3Z']][k]
      return <><T x={240} y={32}>{['I', t('Korespondensi', 'Correspondence'), 'II', 'III'][k]}</T>{rows.map((name, i) => <g key={name}><Box x={18 + i * 160} y={115} w={130} text={name} />{i < 2 && <Arrow from={[151 + i * 160, 139]} to={[173 + i * 160, 139]} color={C.a} />}</g>)}<T x={240} y={209} size={14}>{['ker φ = 6Z', 'J = dZ, d | 6', 'I = 3Z; S ∩ I = 6Z', '6Z ⊆ 3Z; J/I = {0,3}'][k]}</T><T x={240} y={259} size={16} color={C.g}>{t('Setiap peta menjaga + dan ×.', 'Every map preserves + and ×.')}</T></>
    }
    case 'formalPolynomials': return <>
      <T x={240} y={28} size={16}>{t('F₂[x]: bandingkan koefisien dahulu', 'F₂[x]: compare coefficients first')}</T>
      {['f = x²+x', 'g = 0'].map((a, row) => <g key={a}><T x={86} y={78 + row * 60} size={15}>{a}</T>{[0, 1, 2].map(i => <g key={i}><Box x={175 + i * 95} y={48 + row * 60} w={80} text={String(row === 0 && i > 0 ? 1 : 0)} active={row === 0 && i > 0} /><T x={215 + i * 95} y={42} size={12}>{['1', 'x', 'x²'][i]}</T></g>)}</g>)}
      <At from={1} frame={k}><T x={240} y={200} size={16}>{'input 0: f(0)=g(0)=0'}</T><T x={240} y={232} size={16}>{'input 1: f(1)=g(1)=0'}</T></At>
      <At from={2} frame={k}><T x={240} y={277} size={15} color={C.r}>{t('Fungsi sama; polinomial berbeda.', 'Same function; different polynomials.')}</T></At>
    </>
  }
}

export const ALGEBRA_SLIDE_STORIES = Object.fromEntries(Object.entries(ALGEBRA_SLIDE_TOPICS).map(([key, topic]) => {
  const kind = key as AlgebraSlideKind
  const story: Story = { title: topic.lesson.question, zoomable: true, frames: topic.lesson.steps.map(step => ({ caption: step.text, tex: step.tex })), draw: (k, v, lang) => draw(kind, k, v, lang) }
  if (kind === 'setBuilder') {
    story.control = { label: b('Bilangan yang diuji', 'Number to test'), min: -4, max: 9, step: 1, initial: 2 }
    story.readout = v => String.raw`${v}\ ${v % 2 === 0 ? '\\in' : '\\notin'}\ I,\qquad ${v}\ ${v >= 0 && Number.isInteger(Math.sqrt(v)) ? '\\in' : '\\notin'}\ J`
  }
  if (kind === 'correspondence') {
    story.control = { label: b('Pilih pembagi 12 (indeks 0–5)', 'Choose a divisor of 12 (index 0–5)'), min: 0, max: 5, step: 1, initial: 1 }
    story.readout = v => String.raw`d=${divisors[v]},\qquad |d\mathbb Z/12\mathbb Z|=${12 / divisors[v]}`
  }
  if (kind === 'booleanRing') {
    story.control = { label: b('Pilih A: 0=∅, 1={1}, 2={2}, 3={1,2}', 'Choose A: 0=∅, 1={1}, 2={2}, 3={1,2}'), min: 0, max: 3, step: 1, initial: 1 }
  }
  return [kind, story]
})) as Record<AlgebraSlideKind, Story>
