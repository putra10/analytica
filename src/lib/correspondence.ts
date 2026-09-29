/** Additive Z_12, projected to Z_6 by reduction modulo 6. */
export const GROUP = Array.from({ length: 12 }, (_, i) => i)
export const KERNEL = [0, 6]
export const subgroup = (generator: number) => GROUP.filter(n => n % generator === 0)
export const image = (elements: number[]) => [...new Set(elements.map(n => n % 6))].sort((a, b) => a - b)
export const preimage = (classes: number[]) => GROUP.filter(n => classes.includes(n % 6))
export const containsKernel = (elements: number[]) => KERNEL.every(n => elements.includes(n))
export const coset = (representative: number) => [representative, representative + 6]
export const SUBGROUPS = [1, 2, 3, 4, 6, 12].map(generator => ({ generator, elements: subgroup(generator), eligible: containsKernel(subgroup(generator)) }))
