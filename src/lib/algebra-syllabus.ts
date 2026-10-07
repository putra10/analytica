import { mod, range } from './rings'
import { ringZn } from './finite-ring'

export function finiteSet(text: string, max = 12): string[] {
  const clean = text.trim().replace(/^\{/, '').replace(/\}$/, '')
  if (!clean) return []
  const atoms = clean.split(/[\s,;]+/).filter(Boolean)
  if (atoms.some(x => x.length > 18 || !/^[\p{L}\p{N}_+().-]+$/u.test(x))) throw new Error('atoms')
  const result = [...new Set(atoms)]
  if (result.length > max) throw new Error('size')
  return result
}
export const union = (a: string[], b: string[]) => [...new Set([...a, ...b])]
export const intersection = (a: string[], b: string[]) => a.filter(x => b.includes(x))
export const difference = (a: string[], b: string[]) => a.filter(x => !b.includes(x))
export const symmetricDifference = (a: string[], b: string[]) => union(difference(a,b), difference(b,a))
export const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x))
export const powerSet = (a: string[]) => {
  if (a.length > 8) throw new Error('power-size')
  return range(2 ** a.length).map(mask => a.filter((_, j) => (mask & (1 << j)) !== 0))
}
export const setText = (a: (string | number)[]) => a.length ? `{${a.join(', ')}}` : '∅'
export function boundedInteger(text: string, min: number, max: number) {
  if (!/^-?\d+$/.test(text.trim())) throw new Error('integer')
  const n = Number(text)
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error('bounds')
  return n
}
export function builderSet(lo: number, hi: number, divisor: number, predicate: 'evenSquare' | 'multiple' | 'positive', image: 'identity' | 'square') {
  if (lo > hi) throw new Error('interval')
  const domain = range(hi - lo + 1).map(x => x + lo)
  const selected = domain.filter(x => predicate === 'evenSquare' ? mod(x*x,2) === 0 : predicate === 'multiple' ? mod(x,divisor) === 0 : x > 0)
  const pairs = selected.map(x => ({ x, y: image === 'identity' ? x : x*x }))
  return { domain, selected, pairs, result: [...new Set(pairs.map(p => p.y))].sort((a,b)=>a-b) }
}
export function relationInfo(n: number, matrix: boolean[][]) {
  const related = (a: number, b: number) => matrix[a]?.[b] === true
  const reflexiveFailure = range(n).find(a => !related(a,a))
  let symmetricFailure: [number,number] | undefined, transitiveFailure: [number,number,number] | undefined
  for (const a of range(n)) for (const b of range(n)) {
    if (related(a,b) && !related(b,a) && !symmetricFailure) symmetricFailure = [a,b]
    for (const c of range(n)) if (related(a,b) && related(b,c) && !related(a,c) && !transitiveFailure) transitiveFailure = [a,b,c]
  }
  const equivalence = reflexiveFailure === undefined && !symmetricFailure && !transitiveFailure
  const classes: number[][] = []
  if (equivalence) for (const a of range(n)) if (!classes.some(group=>group.includes(a))) classes.push(range(n).filter(b=>related(a,b)))
  return { reflexiveFailure, symmetricFailure, transitiveFailure, equivalence, classes }
}
export function finiteFunction(a: string[], b: string[], mapping: Record<string,string>, selected: string[]) {
  const images = a.map(x => mapping[x] ?? b[0])
  const valid = images.every(y=>b.includes(y))
  const image = valid ? [...new Set(images)] : []
  const collisions: [string,string,string][] = []
  if (valid) for (let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if (images[i]===images[j]) collisions.push([a[i],a[j],images[i]])
  const injective = valid && collisions.length===0, surjective = valid && b.every(y=>image.includes(y))
  const factorial = (n: number) => range(n).reduce((f,i)=>f*(i+1),1)
  return { valid, images, image, collisions, injective, surjective, bijective: injective && surjective, preimage: valid ? a.filter((_,i)=>selected.includes(images[i])) : [], functionCount: b.length**a.length, bijectionCount: a.length===b.length ? factorial(a.length) : 0 }
}
export function znMap(m: number, n: number, k: number, unital: boolean) {
  const source = ringZn(m), target = ringZn(n), images = range(m).map(x=>mod(k*x,n))
  const wellDefined = mod(k*m,n)===0
  let additionFailure: [number,number,number,number] | undefined, multiplicationFailure: [number,number,number,number] | undefined
  for (const a of range(m)) for (const b of range(m)) {
    const addLeft=images[source.add[a][b]],addRight=target.add[images[a]][images[b]]
    const mulLeft=images[source.mul[a][b]],mulRight=target.mul[images[a]][images[b]]
    if (addLeft!==addRight && !additionFailure) additionFailure=[a,b,addLeft,addRight]
    if (mulLeft!==mulRight && !multiplicationFailure) multiplicationFailure=[a,b,mulLeft,mulRight]
  }
  const preservesOne = images[source.one]===target.one
  const homomorphism = wellDefined && !additionFailure && !multiplicationFailure && (!unital || preservesOne)
  const kernel = range(m).filter(x=>images[x]===0), image=[...new Set(images)].sort((a,b)=>a-b)
  const fibers = image.map(y=>({y,x:range(m).filter(x=>images[x]===y)}))
  return { images, wellDefined, additionFailure, multiplicationFailure, preservesOne, homomorphism, kernel, image, fibers, representativeImages: [0, mod(k*m,n)] }
}
export function znSubset(n: number, elements: number[], unital: boolean) {
  const ring=ringZn(n), set=[...new Set(elements)].sort((a,b)=>a-b)
  if (set.some(x=>!Number.isInteger(x)||x<0||x>=n)) throw new Error('residues')
  let subtractionFailure: [number,number,number] | undefined, productFailure: [number,number,number] | undefined, absorptionFailure: [number,number,number] | undefined
  for (const a of set) for (const b of set) {
    const subtraction=mod(a-b,n),product=ring.mul[a][b]
    if(!set.includes(subtraction)&&!subtractionFailure)subtractionFailure=[a,b,subtraction]
    if(!set.includes(product)&&!productFailure)productFailure=[a,b,product]
  }
  for(const r of range(n))for(const a of set)if(!set.includes(ring.mul[r][a])&&!absorptionFailure)absorptionFailure=[r,a,ring.mul[r][a]]
  const additiveSubgroup=set.includes(0)&&!subtractionFailure
  const subring=additiveSubgroup&&!productFailure&&(!unital||set.includes(1))
  const ideal=additiveSubgroup&&!absorptionFailure
  return { set, additiveSubgroup, subtractionFailure, productFailure, absorptionFailure, containsOne:set.includes(1), subring, ideal }
}
