import type { VisualKind } from './summary-lessons'
import type { CourseExercise } from './complex-course-model'

export const COMPLEX_BASIC_PRACTICE: Partial<Record<VisualKind, CourseExercise[]>> = {
  "triangle": [
    {
      "question": {
        "id": "Hitung (2+i)/(1−i).",
        "en": "Compute (2+i)/(1−i)."
      },
      "solution": {
        "id": "Kalikan pembilang dan penyebut dengan 1+i. Penyebut menjadi 2, pembilang 1+3i, sehingga hasilnya 1/2+3i/2.",
        "en": "Multiply numerator and denominator by 1+i. The denominator becomes 2 and numerator 1+3i, giving 1/2+3i/2."
      },
      "tex": "\\frac{2+i}{1-i}=\\frac{(2+i)(1+i)}{(1-i)(1+i)}=\\frac12+\\frac32i"
    }
  ],
  "polar": [
    {
      "question": {
        "id": "Hitung (1+i)^6 dalam bentuk kutub.",
        "en": "Compute (1+i)^6 in polar form."
      },
      "solution": {
        "id": "Radius √2 dipangkatkan enam menjadi 8. Sudut π/4 dikali enam menjadi 3π/2, sehingga hasilnya −8i.",
        "en": "The sixth power of radius √2 is 8. Six times π/4 is 3π/2, giving −8i."
      },
      "tex": "(1+i)^6=(\\sqrt2)^6e^{6i\\pi/4}=8e^{3\\pi i/2}=-8i"
    }
  ],
  "roots": [
    {
      "question": {
        "id": "Mengapa jumlah akar satuan tidak nol untuk n=1?",
        "en": "Why is the sum of roots of unity nonzero for n=1?"
      },
      "solution": {
        "id": "Satu-satunya akar adalah 1. Pembuktian jumlah nol membagi dengan 1−ω, yang nol untuk n=1. Teorema perlu n>1.",
        "en": "The only root is 1. The zero-sum proof divides by 1−ω, which vanishes at n=1. The theorem requires n>1."
      },
      "tex": "n=1:\\ S=1;\\qquad n>1:\\ \\omega\\ne1,\\ (1-\\omega)S=1-\\omega^n=0\\implies S=0"
    }
  ],
  "disc": [
    {
      "question": {
        "id": "Apakah 0<|z|<2 adalah domain dan simply connected?",
        "en": "Is 0<|z|<2 a domain and simply connected?"
      },
      "solution": {
        "id": "Terbuka dan terhubung berarti domain. Tetapi lubang di 0 mencegah lingkaran yang mengelilingi 0 dikerutkan ke titik di dalamnya, jadi bukan simply connected.",
        "en": "It is open and connected, hence a domain. The hole at 0 prevents a loop around 0 from contracting to a point inside, so it is not simply connected."
      },
      "tex": "D=\\{z:0<|z|<2\\}\\text{ is open and connected, with a hole at }0"
    }
  ],
  "map": [
    {
      "question": {
        "id": "Di titik mana z² tidak konformal?",
        "en": "Where does z² fail to be conformal?"
      },
      "solution": {
        "id": "Turunannya 2z dan hanya nol di 0. Di setiap titik bukan nol, perkalian lokal oleh 2z menjaga sudut. Di 0, f tidak menjaga semua sudut perpotongan.",
        "en": "Its derivative 2z vanishes only at 0. At nonzero points, local multiplication by 2z preserves angles. At 0, not all crossing angles are preserved."
      },
      "tex": "f'(z)=2z,\\qquad f'(z)\\ne0\\iff z\\ne0"
    }
  ],
  "derivative": [
    {
      "question": {
        "id": "Apakah dua lintasan dengan limit sama membuktikan limit ada?",
        "en": "Do matching limits along two paths prove a limit exists?"
      },
      "solution": {
        "id": "Tidak. xy/(x²+y²) bernilai 0 pada kedua sumbu tetapi 1/2 pada y=x≠0. Bukti harus mengendalikan setiap titik cukup dekat.",
        "en": "No. xy/(x²+y²) is 0 on both axes but 1/2 on y=x≠0. A proof must control every sufficiently nearby point."
      },
      "tex": "\\frac{xy}{x^2+y^2}=0\\text{ on both axes};\\qquad y=x\\ne0:\\ \\frac{xy}{x^2+y^2}=\\frac12"
    }
  ],
  "cr": [
    {
      "question": {
        "id": "Apakah |z|² analitik di 0?",
        "en": "Is |z|² analytic at 0?"
      },
      "solution": {
        "id": "CR berlaku hanya di 0, dan turunan kompleks di 0 ada dengan nilai 0. Tetapi analitik di 0 perlu keterturunan di suatu lingkungan, yang tidak ada. Jadi jawabannya tidak.",
        "en": "CR holds only at 0, whose complex derivative exists and is 0. Analyticity at 0 requires differentiability on a neighborhood, which fails. The answer is no."
      },
      "tex": "u=x^2+y^2,\\ v=0;\\quad\\frac{|h|^2}{h}=\\bar h\\to0,\\quad f'(0)=0"
    }
  ],
  "harmonic": [
    {
      "question": {
        "id": "Cari konjugat harmonik u=x²−y².",
        "en": "Find a harmonic conjugate of u=x²−y²."
      },
      "solution": {
        "id": "v_y=u_x=2x memberi v=2xy+g(x). Persamaan v_x=−u_y=2y memaksa g′=0, jadi v=2xy+C, dengan C real.",
        "en": "v_y=u_x=2x gives v=2xy+g(x). The equation v_x=−u_y=2y forces g′=0, so v=2xy+C for real C."
      },
      "tex": "v=2xy+C,\\qquad f(z)=z^2+iC"
    }
  ],
  "exp": [
    {
      "question": {
        "id": "Selesaikan eᶻ=i untuk semua z.",
        "en": "Solve eᶻ=i for all z."
      },
      "solution": {
        "id": "Modulus memberi eˣ=1, sehingga x=0. Sudut y harus π/2+2πk, dengan k bulat.",
        "en": "The modulus gives eˣ=1, hence x=0. Its angle y must be π/2+2πk for integer k."
      },
      "tex": "z=i\\left(\\frac\\pi2+2\\pi k\\right),\\qquad k\\in\\mathbb Z"
    }
  ],
  "branch": [
    {
      "question": {
        "id": "Mengapa Log((−1)(−1))≠2Log(−1)?",
        "en": "Why is Log((−1)(−1))≠2Log(−1)?"
      },
      "solution": {
        "id": "Nilai utama Log1=0, sedangkan Log(−1)=iπ. Jumlah sudut π+π perlu dibungkus ke nilai utama 0. Nilai utama di −1 ada, tetapi cabang analitik utama mengecualikan sumbu real negatif.",
        "en": "Principal values give Log1=0 and Log(−1)=iπ. The angle sum π+π must wrap back to principal angle 0. The principal value at −1 exists, but the principal analytic branch excludes the negative real axis."
      },
      "tex": "\\operatorname{Log}(1)=0,\\qquad2\\operatorname{Log}(-1)=2\\pi i"
    }
  ],
  "trig": [
    {
      "question": {
        "id": "Hitung sin(i), cos(i), dan jumlah kuadratnya.",
        "en": "Compute sin(i), cos(i), and the sum of their squares."
      },
      "solution": {
        "id": "sin(i)=i sinh1 dan cos(i)=cosh1. Kuadrat sinus menjadi −sinh²1, sehingga jumlahnya cosh²1−sinh²1=1.",
        "en": "sin(i)=i sinh1 and cos(i)=cosh1. Squaring the sine gives −sinh²1, so the sum is cosh²1−sinh²1=1."
      },
      "tex": "\\sin^2 i+\\cos^2 i=-\\sinh^2 1+\\cosh^2 1=1"
    }
  ],
  "integral": [
    {
      "question": {
        "id": "Hitung ∮ z̄ dz pada lingkaran unit CCW.",
        "en": "Compute ∮ z̄ dz around the CCW unit circle."
      },
      "solution": {
        "id": "Pakai z=eⁱᵗ, t dari 0 sampai 2π, dan dz=i eⁱᵗdt. Konjugat e⁻ⁱᵗ menghapus eksponensial sehingga tersisa i dt. Cauchy–Goursat tidak berlaku karena z̄ tidak analitik.",
        "en": "Use z=eⁱᵗ, t from 0 to 2π, and dz=i eⁱᵗdt. Its conjugate e⁻ⁱᵗ cancels the exponential, leaving i dt. Cauchy–Goursat does not apply because z̄ is not analytic."
      },
      "tex": "\\oint_{|z|=1}\\bar z\\,dz=i\\int_0^{2\\pi}dt=2\\pi i"
    }
  ],
  "primitive": [
    {
      "question": {
        "id": "Mengapa 1/z tidak punya antiturunan global di C\\{0}?",
        "en": "Why does 1/z have no global primitive on C\\{0}?"
      },
      "solution": {
        "id": "Integral pada lingkaran unit positif adalah 2πi, padahal satu antiturunan global membuat setiap integral tertutup nol. Cabang Log hanya berlaku sebagai antiturunan di domain yang sesuai.",
        "en": "Its positive unit-circle integral is 2πi, whereas a global primitive makes every closed integral zero. A branch of Log is a primitive only on an appropriate domain."
      },
      "tex": "\\oint_{|z|=1}\\frac{dz}z=2\\pi i\\ne0"
    }
  ],
  "cauchy": [
    {
      "question": {
        "id": "Hitung ∮ eᶻ/(z−1)³ dz pada |z|=2 positif.",
        "en": "Compute ∮ eᶻ/(z−1)³ dz on the positive circle |z|=2."
      },
      "solution": {
        "id": "eᶻ entire dan 1 berada di dalam kontur. Penyebut pangkat tiga memakai turunan kedua: 2πi f″(1)/2!=πi e.",
        "en": "eᶻ is entire and 1 is inside. A third-power denominator calls for the second derivative: 2πi f″(1)/2!=πi e."
      },
      "tex": "\\oint_{|z|=2}\\frac{e^z}{(z-1)^3}dz=\\frac{2\\pi i}{2!}e=\\pi i e"
    }
  ],
  "series": [
    {
      "question": {
        "id": "Kembangkan 1/(z−1) untuk |z|>1.",
        "en": "Expand 1/(z−1) for |z|>1."
      },
      "solution": {
        "id": "Faktorkan z di penyebut dan pakai deret geometri dalam 1/z. Pangkatnya negatif, jadi ini Laurent, dan daerah |z|>1 harus dinyatakan. Batas |z|=1 tidak termasuk.",
        "en": "Factor z from the denominator and use a geometric series in 1/z. The powers are negative, so this is Laurent, valid on |z|>1. The boundary |z|=1 is excluded."
      },
      "tex": "\\frac1{z-1}=\\frac{1/z}{1-1/z}=\\sum_{n=1}^{\\infty}z^{-n},\\qquad|z|>1"
    }
  ],
  "singularities": [
    {
      "question": {
        "id": "Klasifikasikan (1−cos z)/z² di 0.",
        "en": "Classify (1−cos z)/z² at 0."
      },
      "solution": {
        "id": "Ekspansi cos memberi pembilang z²/2−z⁴/24+…. Setelah dibagi z², tidak ada pangkat negatif dan limitnya 1/2. Isi nilai itu untuk menghapus singularitas.",
        "en": "The cosine expansion gives numerator z²/2−z⁴/24+…. Division leaves no negative powers and limit 1/2. Define that value to remove the singularity."
      },
      "tex": "\\frac{1-\\cos z}{z^2}=\\frac12-\\frac{z^2}{24}+\\cdots"
    }
  ],
  "residue": [
    {
      "question": {
        "id": "Bandingkan orde kutub dan residu 3/z²+5/z.",
        "en": "Compare the pole order and residue of 3/z²+5/z."
      },
      "solution": {
        "id": "Pangkat terendah −2 memberi kutub orde 2. Koefisien z⁻¹ adalah 5, sehingga integral satu lingkaran positif adalah 10πi. Orde kutub dan residu adalah dua informasi berbeda.",
        "en": "Lowest power −2 gives a pole of order 2. The z⁻¹ coefficient is 5, so a positive circle has integral 10πi. Pole order and residue are different information."
      },
      "tex": "\\operatorname{ord}_{\\rm pole}=2,\\quad\\operatorname{Res}_0=5,\\quad\\oint f\\,dz=10\\pi i"
    }
  ]
}

