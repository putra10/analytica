import { fmt } from './utils'

export interface Complex {
  re: number
  im: number
}

export const C = (re: number, im = 0): Complex => ({ re, im })
export const add = (a: Complex, b: Complex): Complex => C(a.re + b.re, a.im + b.im)
export const sub = (a: Complex, b: Complex): Complex => C(a.re - b.re, a.im - b.im)
export const neg = (z: Complex): Complex => C(-z.re, -z.im)
export const conj = (z: Complex): Complex => C(z.re, -z.im)
export const scale = (z: Complex, k: number): Complex => C(z.re * k, z.im * k)
export const mul = (a: Complex, b: Complex): Complex =>
  C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
export const div = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
export const inv = (z: Complex): Complex => div(C(1), z)
export const abs = (z: Complex) => Math.hypot(z.re, z.im)
export const arg = (z: Complex) => Math.atan2(z.im, z.re)
export const polar = (r: number, t: number): Complex => C(r * Math.cos(t), r * Math.sin(t))
export const exp = (z: Complex): Complex => {
  const e = Math.exp(z.re)
  return C(e * Math.cos(z.im), e * Math.sin(z.im))
}
/** Principal branch: Log z = ln|z| + i Arg z,  -π < Arg z ≤ π */
export const log = (z: Complex): Complex => C(Math.log(abs(z)), arg(z))
export const sin = (z: Complex): Complex =>
  C(Math.sin(z.re) * Math.cosh(z.im), Math.cos(z.re) * Math.sinh(z.im))
export const cos = (z: Complex): Complex =>
  C(Math.cos(z.re) * Math.cosh(z.im), -Math.sin(z.re) * Math.sinh(z.im))
/** Principal square root. */
export const sqrt = (z: Complex): Complex => {
  const r = abs(z)
  return C(Math.sqrt((r + z.re) / 2), (z.im < 0 ? -1 : 1) * Math.sqrt(Math.max(r - z.re, 0) / 2))
}
export const isFinite = (z: Complex) => Number.isFinite(z.re) && Number.isFinite(z.im)

export function toTex(z: Complex, d = 2): string {
  const re = +z.re.toFixed(d)
  const im = +z.im.toFixed(d)
  if (im === 0) return fmt(re, d)
  const imAbs = Math.abs(im) === 1 ? '' : fmt(Math.abs(im), d)
  if (re === 0) return `${im < 0 ? '-' : ''}${imAbs}i`
  return `${fmt(re, d)} ${im < 0 ? '-' : '+'} ${imAbs}i`
}

// ---------- singularities ----------

/** 'user': a point the user typed for a custom formula; its residue is estimated numerically */
export type SingType = 'pole' | 'essential' | 'removable' | 'branch' | 'user'

export interface Singularity {
  z: Complex
  type: SingType
  /** pole order */
  order?: number
  /** residue (poles and essential singularities) */
  res?: Complex
  /** principal part of the Laurent series, TeX */
  principal?: string
}

export interface Preset {
  id: string
  label: string
  tex: string
  usesC: boolean
  /** analytic on its domain (false for z̄, |z|², Re z) */
  analytic: boolean
  /** shown under the "singularities" sub-tab */
  singular: boolean
  f: (z: Complex, c: Complex) => Complex
  roots: (c: Complex) => Complex[]
  singularities: (c: Complex) => Singularity[]
  rootsTex?: string
  note: { id: string; en: string }
}

const UNITY3 = [0, 1, 2].map((k) => polar(1, (2 * Math.PI * k) / 3))
const pole = (z: Complex, order: number, res: Complex, principal: string): Singularity => ({ z, type: 'pole', order, res, principal })

/** Order must match the `uPreset` branch order in the GLSL shader (ComplexCanvas). */
export const PRESETS: Preset[] = [
  {
    id: 'square', label: 'z² + c', tex: 'f(z) = z^2 + c', usesC: true, analytic: true, singular: false,
    f: (z, c) => add(mul(z, z), c),
    roots: (c) => { const s = sqrt(neg(c)); return [s, neg(s)] },
    singularities: () => [],
    rootsTex: 'z = \\pm\\sqrt{-c}',
    note: {
      id: 'Fungsi entire (analitik di seluruh bidang). Warna berputar sekali mengelilingi tiap nol sederhana; jauh dari pusat argumen menjadi dua kali lipat sehingga satu siklus warna muncul dua kali per putaran.',
      en: 'An entire function. Hue winds once around each simple zero; far from the origin the argument doubles, so a full colour cycle appears twice per revolution.',
    },
  },
  {
    id: 'mobius', label: '(z−1)/(z+1)', tex: 'f(z) = \\frac{z-1}{z+1}', usesC: false, analytic: true, singular: true,
    f: (z) => div(sub(z, C(1)), add(z, C(1))),
    roots: () => [C(1)],
    singularities: () => [pole(C(-1), 1, C(-2), '\\frac{-2}{z+1}')],
    note: {
      id: 'Transformasi Möbius (linear fraksional): memetakan setengah bidang kanan ke cakram satuan dan mengirim lingkaran/garis ke lingkaran/garis. Nol sederhana di 1, kutub sederhana di −1 dengan residu −2.',
      en: 'A Möbius (linear fractional) transformation: it maps the right half-plane onto the unit disc and sends circles and lines to circles and lines. Simple zero at 1, simple pole at −1 with residue −2.',
    },
  },
  {
    id: 'exp', label: 'eᶻ', tex: 'f(z) = e^{z}', usesC: false, analytic: true, singular: false,
    f: (z) => exp(z), roots: () => [], singularities: () => [],
    note: {
      id: 'Entire dan tidak pernah nol. Periodik dengan periode 2πi ke arah imajiner: warna berulang secara vertikal, modulus tumbuh eksponensial ke kanan.',
      en: 'Entire and never zero. Periodic with period 2πi in the imaginary direction: hue repeats vertically while the modulus grows exponentially to the right.',
    },
  },
  {
    id: 'sin', label: 'sin z', tex: 'f(z) = \\sin z', usesC: false, analytic: true, singular: false,
    f: (z) => sin(z), roots: () => [-2, -1, 0, 1, 2].map((k) => C(k * Math.PI)), singularities: () => [],
    rootsTex: 'z = k\\pi,\\; k \\in \\mathbb{Z}',
    note: {
      id: 'Entire dengan nol sederhana di setiap kelipatan bulat π. Menjauhi sumbu real, |sin z| tumbuh seperti e^{|y|}/2, sehingga bidang memutih di atas dan bawah.',
      en: 'Entire with simple zeros at every integer multiple of π. Away from the real axis |sin z| grows like e^{|y|}/2, which is why the plane brightens to white above and below.',
    },
  },
  {
    id: 'cubic', label: 'z³ − 1', tex: 'f(z) = z^3 - 1', usesC: false, analytic: true, singular: false,
    f: (z) => sub(mul(mul(z, z), z), C(1)), roots: () => UNITY3, singularities: () => [],
    rootsTex: 'z = e^{2\\pi i k/3},\\; k = 0, 1, 2',
    note: {
      id: 'Tiga akar satuan pangkat tiga di titik sudut segitiga sama sisi (bandingkan dengan rumus akar-akar bilangan kompleks). Jauh dari pusat, fase berputar tiga kali per putaran.',
      en: 'The three cube roots of unity sit at the vertices of an equilateral triangle (compare with the formula for roots of complex numbers). Far away the phase winds three times per revolution.',
    },
  },
  {
    id: 'log', label: 'Log z', tex: 'f(z) = \\operatorname{Log} z = \\ln r + i\\Theta', usesC: false, analytic: true, singular: true,
    f: (z) => log(z), roots: () => [C(1)],
    singularities: () => [{ z: C(0), type: 'branch' }],
    note: {
      id: 'Cabang utama logaritma, −π < Θ ≤ π. Analitik di mana-mana kecuali pada potongan cabang (sumbu real negatif) dan titik cabang 0. Perhatikan lompatan warna sepanjang sumbu real negatif: 0 bukan titik singular terisolasi.',
      en: 'Principal branch of the logarithm, −π < Θ ≤ π. Analytic except on the branch cut (negative real axis) and the branch point 0. Note the colour jump along the negative real axis: 0 is not an isolated singularity.',
    },
  },
  {
    id: 'sqrt', label: '√z', tex: 'f(z) = z^{1/2} = \\sqrt{r}\\,e^{i\\Theta/2}', usesC: false, analytic: true, singular: true,
    f: (z) => sqrt(z), roots: () => [C(0)],
    singularities: () => [{ z: C(0), type: 'branch' }],
    note: {
      id: 'Cabang utama akar kuadrat (nilai utama dari pangkat kompleks z^{1/2}). Hanya setengah siklus warna mengelilingi 0, dan ada diskontinuitas pada potongan cabang.',
      en: 'Principal branch of the square root (principal value of the complex power z^{1/2}). Only half a colour cycle surrounds 0, with a discontinuity along the branch cut.',
    },
  },
  {
    id: 'conj', label: 'z̄', tex: 'f(z) = \\bar z = x - iy', usesC: false, analytic: false, singular: false,
    f: (z) => conj(z), roots: () => [C(0)], singularities: () => [],
    note: {
      id: 'TIDAK analitik: u = x, v = −y sehingga u_x = 1 ≠ v_y = −1. Persamaan Cauchy-Riemann gagal di setiap titik, dan kisi konformal tidak lagi berupa kisi Kartesius yang dipetakan secara konformal (orientasi terbalik).',
      en: 'NOT analytic: u = x, v = −y gives u_x = 1 ≠ v_y = −1. The Cauchy-Riemann equations fail everywhere; the map reverses orientation.',
    },
  },
  {
    id: 'abs2', label: '|z|²', tex: 'f(z) = |z|^2 = x^2 + y^2', usesC: false, analytic: false, singular: false,
    f: (z) => C(z.re * z.re + z.im * z.im), roots: () => [C(0)], singularities: () => [],
    note: {
      id: 'Bernilai real, u = x² + y², v = 0. Persamaan Cauchy-Riemann hanya terpenuhi di z = 0, jadi f mempunyai turunan di 0 tetapi tidak analitik di mana pun (contoh klasik Brown & Churchill).',
      en: 'Real-valued, u = x² + y², v = 0. Cauchy-Riemann holds only at z = 0, so f is differentiable at 0 but analytic nowhere (the classic Brown & Churchill example).',
    },
  },
  {
    id: 'inv', label: '1/z', tex: 'f(z) = \\frac{1}{z}', usesC: false, analytic: true, singular: true,
    f: (z) => inv(z), roots: () => [],
    singularities: () => [pole(C(0), 1, C(1), '\\frac{1}{z}')],
    note: {
      id: 'Kutub sederhana di 0 dengan residu 1. Integral pada setiap lintasan tertutup yang mengelilingi 0 satu kali bernilai 2πi: inilah kasus dasar teorema residu Cauchy.',
      en: 'Simple pole at 0 with residue 1. The integral over any closed contour winding once around 0 equals 2πi: the basic case of the Cauchy residue theorem.',
    },
  },
  {
    id: 'inv2', label: '1/z²', tex: 'f(z) = \\frac{1}{z^2}', usesC: false, analytic: true, singular: true,
    f: (z) => inv(mul(z, z)), roots: () => [],
    singularities: () => [pole(C(0), 2, C(0), '\\frac{1}{z^2}')],
    note: {
      id: 'Kutub orde 2 di 0 dengan residu 0: koefisien 1/z pada deret Laurent adalah nol, sehingga integral kontur mengelilinginya bernilai 0 walaupun fungsinya singular.',
      en: 'Pole of order 2 at 0 with residue 0: the 1/z coefficient of the Laurent series vanishes, so the contour integral around it is 0 even though the function is singular.',
    },
  },
  {
    id: 'inv_z2p1', label: '1/(z²+1)', tex: 'f(z) = \\frac{1}{z^2 + 1}', usesC: false, analytic: true, singular: true,
    f: (z) => inv(add(mul(z, z), C(1))), roots: () => [],
    singularities: () => [
      pole(C(0, 1), 1, C(0, -0.5), '\\frac{-i/2}{z - i}'),
      pole(C(0, -1), 1, C(0, 0.5), '\\frac{i/2}{z + i}'),
    ],
    note: {
      id: 'Kutub sederhana di ±i. Res(f, i) = 1/(2i) = −i/2 dari rumus Res = p(z₀)/q′(z₀). Kontur yang memuat keduanya memberi jumlah residu 0.',
      en: 'Simple poles at ±i. Res(f, i) = 1/(2i) = −i/2 from the formula Res = p(z₀)/q′(z₀). A contour enclosing both gives residue sum 0.',
    },
  },
  {
    id: 'exp_inv', label: 'e^{1/z}', tex: 'f(z) = e^{1/z}', usesC: false, analytic: true, singular: true,
    f: (z) => exp(inv(z)), roots: () => [],
    singularities: () => [{ z: C(0), type: 'essential', res: C(1), principal: '\\frac{1}{z} + \\frac{1}{2!\\,z^2} + \\frac{1}{3!\\,z^3} + \\cdots' }],
    note: {
      id: 'Titik singular esensial di 0: bagian utama deret Laurent memuat tak hingga banyak suku. Di sekitar 0 fungsi mengambil setiap nilai kompleks tak hingga kali (teorema Picard); perhatikan semua warna berdesakan di dekat pusat. Residu = 1.',
      en: 'Essential singularity at 0: the principal part of the Laurent series has infinitely many terms. Near 0 the function takes every complex value infinitely often (Picard); notice every colour crowding near the origin. Residue = 1.',
    },
  },
  {
    id: 'sinc', label: 'sin z / z', tex: 'f(z) = \\frac{\\sin z}{z}', usesC: false, analytic: true, singular: true,
    f: (z) => (abs(z) < 1e-9 ? C(1) : div(sin(z), z)),
    roots: () => [-2, -1, 1, 2].map((k) => C(k * Math.PI)),
    singularities: () => [{ z: C(0), type: 'removable', res: C(0), principal: '0' }],
    note: {
      id: 'Titik singular yang dapat dihapuskan di 0: sin z / z = 1 − z²/3! + z⁴/5! − ⋯ tidak mempunyai bagian utama. Mendefinisikan f(0) = 1 membuat f entire; secara visual tidak ada yang istimewa di 0.',
      en: 'Removable singularity at 0: sin z / z = 1 − z²/3! + z⁴/5! − ⋯ has no principal part. Setting f(0) = 1 makes f entire; visually nothing happens at 0.',
    },
  },
  {
    id: 'rat3', label: '1/(z(z−1)(z−2))', tex: 'f(z) = \\frac{1}{z(z-1)(z-2)}', usesC: false, analytic: true, singular: true,
    f: (z) => inv(mul(mul(z, sub(z, C(1))), sub(z, C(2)))), roots: () => [],
    singularities: () => [
      pole(C(0), 1, C(0.5), '\\frac{1/2}{z}'),
      pole(C(1), 1, C(-1), '\\frac{-1}{z-1}'),
      pole(C(2), 1, C(0.5), '\\frac{1/2}{z-2}'),
    ],
    note: {
      id: 'Tiga kutub sederhana dengan residu 1/2, −1, 1/2 (pecahan parsial). Geser kontur sehingga memuat satu, dua, atau tiga kutub dan bandingkan nilai integralnya dengan 2πi kali jumlah residu.',
      en: 'Three simple poles with residues 1/2, −1, 1/2 (partial fractions). Move the contour to enclose one, two or three poles and compare the integral with 2πi times the residue sum.',
    },
  },
  {
    id: 'csc', label: '1/sin z', tex: 'f(z) = \\frac{1}{\\sin z}', usesC: false, analytic: true, singular: true,
    f: (z) => inv(sin(z)), roots: () => [],
    singularities: () => [-2, -1, 0, 1, 2].map((k) => pole(C(k * Math.PI), 1, C(k % 2 ? -1 : 1), `\\frac{${k % 2 ? '-1' : '1'}}{z - ${k}\\pi}`)),
    note: {
      id: 'Kutub sederhana di setiap nol dari sin z, yaitu kπ, dengan residu 1/cos(kπ) = (−1)^k. Contoh teorema: jika q mempunyai nol sederhana di z₀ dan p(z₀) ≠ 0 maka p/q berkutub sederhana dengan residu p(z₀)/q′(z₀).',
      en: 'Simple poles at every zero of sin z, namely kπ, with residue 1/cos(kπ) = (−1)^k. Illustrates: if q has a simple zero at z₀ and p(z₀) ≠ 0 then p/q has a simple pole with residue p(z₀)/q′(z₀).',
    },
  },
]

// ---------- numerical tools for the theory panels ----------

export interface CRCheck {
  ux: number; uy: number; vx: number; vy: number
  /** |u_x − v_y| + |u_y + v_x|, relative */
  violation: number
  /** f'(z) = u_x + i v_x when CR hold */
  derivative: Complex
  /** Laplacian of u (harmonic test) */
  laplaceU: number
}

/** Central-difference partials of u, v at z. */
export function cauchyRiemann(f: (z: Complex) => Complex, z: Complex): CRCheck {
  const h = 1e-4 * Math.max(1, abs(z))
  const fxp = f(C(z.re + h, z.im)), fxm = f(C(z.re - h, z.im))
  const fyp = f(C(z.re, z.im + h)), fym = f(C(z.re, z.im - h))
  const ux = (fxp.re - fxm.re) / (2 * h), vx = (fxp.im - fxm.im) / (2 * h)
  const uy = (fyp.re - fym.re) / (2 * h), vy = (fyp.im - fym.im) / (2 * h)
  const f0 = f(z)
  const laplaceU = (fxp.re - 2 * f0.re + fxm.re) / (h * h) + (fyp.re - 2 * f0.re + fym.re) / (h * h)
  const mag = Math.hypot(ux, uy, vx, vy) || 1
  return { ux, uy, vx, vy, violation: (Math.abs(ux - vy) + Math.abs(uy + vx)) / mag, derivative: C(ux, vx), laplaceU }
}

export interface Contour {
  center: Complex
  radius: number
}

/** ∮ f(z) dz over the positively oriented circle, trapezoid rule. */
export function contourIntegral(f: (z: Complex) => Complex, { center, radius }: Contour, N = 4096): Complex {
  let re = 0, im = 0
  const dt = (2 * Math.PI) / N
  for (let k = 0; k < N; k++) {
    const t = k * dt
    const z = C(center.re + radius * Math.cos(t), center.im + radius * Math.sin(t))
    const dz = C(-radius * Math.sin(t) * dt, radius * Math.cos(t) * dt) // i r e^{it} dt
    const w = mul(f(z), dz)
    if (Number.isFinite(w.re) && Number.isFinite(w.im)) { re += w.re; im += w.im }
  }
  return C(re, im)
}

/** Residue at z0 by a small positively oriented circle:  Res = (1/2πi) ∮ f dz. */
export function numericResidue(f: (z: Complex) => Complex, z0: Complex, r = 1e-2): Complex {
  const I = contourIntegral(f, { center: z0, radius: r }, 2048)
  return C(I.im / (2 * Math.PI), -I.re / (2 * Math.PI))
}

export const inside = (s: Singularity, c: Contour) => abs(sub(s.z, c.center)) < c.radius
export const onContour = (s: Singularity, c: Contour) => Math.abs(abs(sub(s.z, c.center)) - c.radius) < 0.03 * c.radius
