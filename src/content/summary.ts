/**
 * Formula & theory summary for the three courses, in syllabus order, written from the
 * course textbooks (theorem / section numbers refer to them):
 *   Brown & Churchill, Complex Variables and Applications, 8th ed. (section numbers §)
 *   Vaisman, Analytical Geometry, 1997 (numbered propositions)
 *   Herstein, Abstract Algebra, 3rd ed. (numbered theorems)
 *
 * Each entry: the idea first (why it exists), the formulas, the one thing to remember,
 * and where students usually slip.
 */
export interface Entry {
  title: { id: string; en: string }
  intuition: { id: string; en: string }
  formulas: string[]
  insight: { id: string; en: string }
  /** the classic mistake or subtlety */
  pitfall?: { id: string; en: string }
  /** where to try it in the app */
  lab?: string
}
export interface Section {
  id: string
  title: { id: string; en: string }
  source: string
  parts: { title: { id: string; en: string }; entries: Entry[] }[]
}

export const SUMMARY: Section[] = [
  // =====================================================================================
  {
    id: 'complex',
    title: { id: 'Fungsi Kompleks', en: 'Complex Functions' },
    source: 'Brown & Churchill, Complex Variables and Applications, 8th ed.',
    parts: [
      {
        title: { id: 'Bilangan kompleks (§1-11)', en: 'Complex numbers (§1-11)' },
        entries: [
          {
            title: { id: 'Aljabar, modulus, konjugat (§1-5)', en: 'Algebra, modulus, conjugate (§1-5)' },
            intuition: {
              id: 'Bilangan kompleks adalah pasangan terurut (x, y) dengan perkalian yang dirancang agar i² = −1. Secara geometri, |z| adalah panjang vektor dan z̄ adalah cerminnya pada sumbu real; jadi zz̄ = |z|² adalah "kuadrat panjang", dan itulah kunci untuk membagi.',
              en: 'A complex number is an ordered pair (x, y) with a multiplication designed so that i² = −1. Geometrically |z| is the length of the vector and z̄ its mirror image in the real axis; hence zz̄ = |z|² is the "squared length", which is the key to dividing.',
            },
            formulas: [
              'z = x + iy,\\quad \\bar z = x - iy,\\quad |z| = \\sqrt{x^2 + y^2},\\quad z\\bar z = |z|^2',
              '\\frac{z_1}{z_2} = \\frac{z_1\\bar z_2}{|z_2|^2},\\qquad |z_1 z_2| = |z_1||z_2|,\\qquad \\overline{z_1 z_2} = \\bar z_1\\bar z_2',
              '|z_1 + z_2| \\le |z_1| + |z_2|,\\qquad |z_1 + z_2| \\ge \\big||z_1| - |z_2|\\big|,\\qquad \\operatorname{Re} z \\le |\\operatorname{Re} z| \\le |z|',
            ],
            insight: {
              id: 'Ketaksamaan segitiga dan bentuk kebalikannya adalah alat untuk menaksir: untuk |z| = R besar, |z³ + 1| ≥ R³ − 1, sehingga penyebut tidak pernah nol.',
              en: 'The triangle inequality and its reverse form are estimation tools: for large |z| = R, |z³ + 1| ≥ R³ − 1, so a denominator never vanishes.',
            },
            pitfall: {
              id: 'Tidak ada urutan "<" pada C: z₁ < z₂ tidak bermakna kecuali keduanya real. Yang bisa dibandingkan hanyalah modulusnya.',
              en: 'There is no order "<" on C: z₁ < z₂ is meaningless unless both are real. Only moduli can be compared.',
            },
          },
          {
            title: { id: 'Bentuk eksponensial, argumen, de Moivre (§6-8)', en: 'Exponential form, argument, de Moivre (§6-8)' },
            intuition: {
              id: 'Tulis z = r e^{iθ}. Perkalian kini menjadi "kalikan panjang, jumlahkan sudut": itulah alasan mengapa mengalikan dengan i memutar 90°. Rumus Euler e^{iθ} = cos θ + i sin θ adalah definisi yang membuat semuanya konsisten.',
              en: 'Write z = r e^{iθ}. Multiplication becomes "multiply lengths, add angles": that is why multiplying by i rotates by 90°. Euler\'s formula e^{iθ} = cos θ + i sin θ is the definition that makes it all consistent.',
            },
            formulas: [
              'z = re^{i\\theta},\\quad e^{i\\theta} = \\cos\\theta + i\\sin\\theta,\\quad \\arg z = \\operatorname{Arg} z + 2n\\pi,\\ -\\pi < \\operatorname{Arg} z \\le \\pi',
              'z_1 z_2 = r_1 r_2\\, e^{i(\\theta_1 + \\theta_2)},\\qquad \\frac{z_1}{z_2} = \\frac{r_1}{r_2}\\, e^{i(\\theta_1 - \\theta_2)},\\qquad z^{-1} = \\frac{1}{r}e^{-i\\theta}',
              '(re^{i\\theta})^n = r^n e^{in\\theta},\\qquad (\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta \\ \\text{(de Moivre)}',
            ],
            insight: {
              id: 'arg(z₁z₂) = arg z₁ + arg z₂ berlaku sebagai kesamaan himpunan. Untuk nilai utama Arg pernyataan itu bisa gagal: Arg(−1 · i) = −π/2 tetapi Arg(−1) + Arg(i) = 3π/2.',
              en: 'arg(z₁z₂) = arg z₁ + arg z₂ holds as an equality of sets. For the principal value Arg it can fail: Arg(−1 · i) = −π/2 while Arg(−1) + Arg(i) = 3π/2.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Akar bilangan kompleks (§9-10)', en: 'Roots of complex numbers (§9-10)' },
            intuition: {
              id: 'Mencari w dengan wⁿ = z₀ berarti mencari r dan θ dengan rⁿ = r₀ dan nθ = θ₀ + 2kπ. Karena sudut hanya ditentukan modulo 2π, ada tepat n jawaban, tersebar merata di lingkaran berjari-jari ⁿ√r₀: titik sudut segi-n beraturan.',
              en: 'Solving wⁿ = z₀ means finding r and θ with rⁿ = r₀ and nθ = θ₀ + 2kπ. Because angles are only defined modulo 2π there are exactly n answers, evenly spread on the circle of radius ⁿ√r₀: the vertices of a regular n-gon.',
            },
            formulas: [
              'c_k = \\sqrt[n]{r_0}\\,\\exp\\!\\Big[i\\Big(\\frac{\\theta_0}{n} + \\frac{2k\\pi}{n}\\Big)\\Big],\\qquad k = 0, 1, \\dots, n-1',
              'c_k = c_0\\,\\omega_n^k,\\qquad \\omega_n = e^{2\\pi i/n}\\ \\text{(akar satuan)},\\qquad 1 + \\omega_n + \\cdots + \\omega_n^{n-1} = 0',
              '(-1)^{1/2} = \\pm i,\\qquad (-8i)^{1/3} = \\sqrt3 - i,\\ 2i,\\ -\\sqrt3 - i',
            ],
            insight: {
              id: 'Hitung satu akar (nilai utama, k = 0), lalu kalikan berulang dengan ωₙ. Jangan mencari tiap akar dari nol.',
              en: 'Compute one root (the principal one, k = 0), then keep multiplying by ωₙ. Do not recompute each root from scratch.',
            },
            pitfall: {
              id: 'Gunakan θ₀ sebagai sudut z₀, bukan sudut yang sudah dibagi n. Lupa 2kπ sebelum membagi n adalah kesalahan yang paling sering.',
              en: 'Use θ₀ as the angle of z₀, not an angle already divided by n. Forgetting the 2kπ before dividing by n is the most common slip.',
            },
          },
          {
            title: { id: 'Daerah di bidang kompleks (§11)', en: 'Regions in the complex plane (§11)' },
            intuition: {
              id: 'Analisis kompleks dibangun di atas "domain": himpunan terbuka yang terhubung. Terbuka artinya setiap titik punya ruang bebas di sekelilingnya; terhubung artinya dua titik mana pun dapat dihubungkan oleh garis patah di dalamnya. Semua teorema besar (Cauchy-Goursat, keunikan analitik) hidup di domain.',
              en: 'Complex analysis is built on "domains": open connected sets. Open means each point has breathing room around it; connected means any two points can be joined by a polygonal line inside. Every big theorem (Cauchy-Goursat, uniqueness of analytic functions) lives on a domain.',
            },
            formulas: [
              '|z - z_0| < \\varepsilon\\ \\text{(lingkungan)},\\qquad 0 < |z - z_0| < \\varepsilon\\ \\text{(lingkungan terhapus)}',
              '\\text{terbuka} \\iff \\text{semua titiknya interior};\\quad \\text{tertutup} \\iff \\text{memuat semua titik batasnya}',
              '\\text{domain} = \\text{terbuka} + \\text{terhubung};\\qquad \\text{terbatas} \\iff \\exists R:\\ |z| < R\\ \\forall z',
            ],
            insight: {
              id: 'Himpunan bisa tidak terbuka dan tidak tertutup sekaligus (mis. 0 < |z| ≤ 1). Titik akumulasi tidak harus anggota himpunan.',
              en: 'A set can be neither open nor closed (e.g. 0 < |z| ≤ 1). An accumulation point need not belong to the set.',
            },
          },
        ],
      },
      {
        title: { id: 'Fungsi analitik (§12-27)', en: 'Analytic functions (§12-27)' },
        entries: [
          {
            title: { id: 'Fungsi sebagai pemetaan (§12-14)', en: 'Functions as mappings (§12-14)' },
            intuition: {
              id: 'Grafik w = f(z) membutuhkan empat dimensi, jadi kita lihat pemetaan: gambar kurva atau daerah di bidang z dan bayangannya di bidang w. Untuk w = z², lihat u = x² − y², v = 2xy: garis x = c₁ menjadi parabola karena mengeliminasi y memberi v² = 4c₁²(c₁² − u).',
              en: 'The graph of w = f(z) would need four dimensions, so we look at mappings: draw a curve or region in the z-plane and its image in the w-plane. For w = z², use u = x² − y², v = 2xy: the line x = c₁ becomes a parabola since eliminating y gives v² = 4c₁²(c₁² − u).',
            },
            formulas: [
              'f(z) = u(x, y) + i\\,v(x, y) = u(r, \\theta) + i\\,v(r, \\theta)',
              'w = z^2:\\ u = x^2 - y^2,\\ v = 2xy;\\quad \\text{kutub: } \\rho = r^2,\\ \\phi = 2\\theta \\ \\text{(sektor } 0 \\le \\theta \\le \\pi/2 \\to \\text{setengah bidang)}',
              'w = e^z:\\ \\rho = e^{x},\\ \\phi = y;\\quad \\text{garis } x = c_1 \\to \\text{lingkaran } \\rho = e^{c_1},\\ \\text{garis } y = c_2 \\to \\text{sinar } \\phi = c_2',
            ],
            insight: {
              id: 'Pemetaan konformal (f analitik, f′ ≠ 0) mengawetkan sudut: bayangan dua keluarga garis yang tegak lurus tetap tegak lurus. Inilah yang terlihat di kisi parabola untuk z².',
              en: 'A conformal map (f analytic, f′ ≠ 0) preserves angles: the images of two perpendicular families of lines stay perpendicular. That is what you see in the parabola grid for z².',
            },
            pitfall: {
              id: 'w = z² memetakan kuadran pertama ke setengah bidang atas secara satu-satu, tetapi seluruh bidang ke bidang secara dua-ke-satu: z dan −z punya bayangan sama.',
              en: 'w = z² maps the first quadrant one-to-one onto the upper half-plane, but the whole plane two-to-one: z and −z share an image.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Limit, kekontinuan, turunan (§15-20)', en: 'Limits, continuity, derivative (§15-20)' },
            intuition: {
              id: 'Definisinya sama persis dengan kalkulus real, tetapi Δz → 0 dari segala arah. Inilah pembeda besar: limit hasil bagi selisih harus sama di sepanjang sumbu real, sumbu imajiner, dan setiap arah lain. Itu syarat yang sangat kuat, dan z̄ gagal memenuhinya di setiap titik.',
              en: 'The definitions are word for word those of real calculus, but Δz → 0 from every direction. That is the big difference: the limit of the difference quotient must agree along the real axis, the imaginary axis, and every other direction. It is a very strong demand, and z̄ fails it at every point.',
            },
            formulas: [
              "f'(z_0) = \\lim_{\\Delta z \\to 0} \\frac{f(z_0 + \\Delta z) - f(z_0)}{\\Delta z}",
              '\\lim_{z\\to z_0} f(z) = w_0 \\iff \\lim u = u_0 \\ \\text{dan}\\ \\lim v = v_0 \\quad\\text{(Teorema §16)}',
              '\\lim_{z\\to z_0} f(z) = \\infty \\iff \\lim \\frac{1}{f(z)} = 0;\\qquad \\lim_{z\\to\\infty} f(z) = w_0 \\iff \\lim_{z\\to 0} f(1/z) = w_0',
            ],
            insight: {
              id: 'Aturan turunan (jumlah, hasil kali, rantai, pangkat) berlaku persis seperti di kalkulus real karena buktinya hanya memakai aljabar limit.',
              en: 'The derivative rules (sum, product, chain, power) hold exactly as in real calculus because their proofs only use the algebra of limits.',
            },
            pitfall: {
              id: 'f(z) = z̄: sepanjang sumbu real hasil bagi selisih = 1, sepanjang sumbu imajiner = −1. Tidak ada turunan di mana pun, walaupun u dan v sangat mulus.',
              en: 'f(z) = z̄: along the real axis the difference quotient is 1, along the imaginary axis −1. No derivative anywhere, although u and v are perfectly smooth.',
            },
          },
          {
            title: { id: 'Persamaan Cauchy-Riemann (§21-23)', en: 'Cauchy-Riemann equations (§21-23)' },
            intuition: {
              id: 'Ambil limit hasil bagi selisih sepanjang arah x (Δz = Δx) dan arah y (Δz = iΔy). Keduanya harus sama: uₓ + ivₓ = v_y − iu_y. Menyamakan bagian real dan imajinernya menghasilkan dua persamaan yang harus dipenuhi kalau f′ ada.',
              en: 'Take the difference quotient along the x-direction (Δz = Δx) and the y-direction (Δz = iΔy). They must agree: uₓ + ivₓ = v_y − iu_y. Matching real and imaginary parts gives two equations that must hold whenever f′ exists.',
            },
            formulas: [
              "u_x = v_y,\\qquad u_y = -v_x \\qquad\\text{dan}\\qquad f'(z_0) = u_x + i v_x \\quad\\text{(syarat perlu, §21)}",
              "\\text{§22: } u_x, u_y, v_x, v_y \\text{ ada di lingkungan } z_0,\\ \\text{kontinu di } z_0,\\ \\text{CR di } z_0 \\Rightarrow f'(z_0) \\text{ ada}",
              "\\text{kutub (§23): } r u_r = v_\\theta,\\quad u_\\theta = -r v_r,\\qquad f'(z_0) = e^{-i\\theta}(u_r + i v_r)",
            ],
            insight: {
              id: 'CR saja hanya syarat perlu. Bersama kekontinuan turunan parsial (§22) barulah cukup. Untuk memeriksa turunan, hitung uₓ, u_y, vₓ, v_y, uji CR, lalu baca f′ = uₓ + ivₓ.',
              en: 'CR alone is only necessary. Together with continuity of the partials (§22) it becomes sufficient. To check differentiability, compute uₓ, u_y, vₓ, v_y, test CR, then read off f′ = uₓ + ivₓ.',
            },
            pitfall: {
              id: 'f(z) = |z|²: u = x² + y², v = 0. CR memberi 2x = 0 dan 2y = 0, jadi hanya di z = 0. Di sana f′(0) = 0 ada, tetapi f tidak analitik di mana pun karena tidak ada lingkungan tempat f′ ada.',
              en: 'f(z) = |z|²: u = x² + y², v = 0. CR gives 2x = 0 and 2y = 0, so only at z = 0. There f′(0) = 0 exists, yet f is analytic nowhere since no neighbourhood has f′.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Fungsi analitik dan fungsi harmonik (§24-27)', en: 'Analytic and harmonic functions (§24-27)' },
            intuition: {
              id: 'Analitik di z₀ berarti terturunkan di seluruh lingkungan z₀, bukan hanya di satu titik. Fungsi analitik adalah objek yang "kaku": kalau f′ = 0 di suatu domain, f konstan; kalau |f| konstan, f konstan. Turunkan persamaan CR sekali lagi dan Anda mendapat persamaan Laplace: bagian real dan imajiner fungsi analitik selalu harmonik.',
              en: 'Analytic at z₀ means differentiable throughout a neighbourhood of z₀, not just at the point. Analytic functions are "rigid": if f′ = 0 on a domain, f is constant; if |f| is constant, f is constant. Differentiate the CR equations once more and Laplace\'s equation appears: the real and imaginary parts of an analytic function are always harmonic.',
            },
            formulas: [
              "f'(z) = 0 \\text{ pada domain } D \\Rightarrow f \\text{ konstan pada } D \\quad (\\S 24)",
              'u_{xx} + u_{yy} = 0,\\quad v_{xx} + v_{yy} = 0 \\quad (\\S 26);\\qquad v \\text{ konjugat harmonik dari } u \\iff u + iv \\text{ analitik}',
              '\\text{Contoh: } u = y^3 - 3x^2 y \\Rightarrow v = 3xy^2 - x^3 + c,\\quad f(z) = i(z^3 + c)',
            ],
            insight: {
              id: 'Untuk mencari konjugat harmonik: dari v_y = uₓ integralkan terhadap y, lalu tentukan "konstanta" φ(x) dengan vₓ = −u_y. Urutan pasangan penting: u punya konjugat v, tetapi v punya konjugat −u.',
              en: 'To find a harmonic conjugate: from v_y = uₓ integrate in y, then fix the "constant" φ(x) using vₓ = −u_y. Order matters: u has conjugate v, but v has conjugate −u.',
            },
            pitfall: {
              id: 'Fungsi hasil bagi P/Q analitik di mana Q ≠ 0; titik-titik dengan Q = 0 adalah titik singular. Contoh: 1/z analitik di setiap titik kecuali z = 0.',
              en: 'A quotient P/Q is analytic wherever Q ≠ 0; the points with Q = 0 are singular points. Example: 1/z is analytic everywhere except z = 0.',
            },
          },
        ],
      },
      {
        title: { id: 'Fungsi elementer (§29-36)', en: 'Elementary functions (§29-36)' },
        entries: [
          {
            title: { id: 'Fungsi eksponensial (§29)', en: 'The exponential function (§29)' },
            intuition: {
              id: 'e^z didefinisikan agar tetap sama dengan turunannya dan cocok dengan e^x di sumbu real: e^z = e^x e^{iy}. Modulusnya e^x tidak pernah nol, dan sudutnya y berulang setiap 2π. Jadi e^z periodik "ke atas" dengan periode 2πi, sesuatu yang tidak dimiliki e^x.',
              en: 'e^z is defined so that it equals its own derivative and agrees with e^x on the real axis: e^z = e^x e^{iy}. Its modulus e^x is never zero and its angle y repeats every 2π. So e^z is periodic "upward" with period 2πi, which e^x never was.',
            },
            formulas: [
              'e^z = e^x(\\cos y + i\\sin y),\\qquad |e^z| = e^x,\\qquad \\arg e^z = y + 2n\\pi',
              '\\frac{d}{dz}e^z = e^z,\\qquad e^{z_1 + z_2} = e^{z_1}e^{z_2},\\qquad e^{z + 2\\pi i} = e^z,\\qquad e^z \\ne 0',
              'e^z = -1 \\iff z = (2n+1)\\pi i;\\qquad e^z \\text{ bisa negatif, mis. } e^{i\\pi} = -1',
            ],
            insight: {
              id: 'Pita horizontal 0 ≤ y < 2π sudah dipetakan ke seluruh bidang w tanpa nol; pita selebar π dipetakan ke setengah bidang.',
              en: 'A horizontal strip 0 ≤ y < 2π already covers the whole w-plane minus the origin; a strip of width π maps to a half-plane.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Logaritma, cabang, pangkat kompleks (§30-33)', en: 'Logarithm, branches, complex powers (§30-33)' },
            intuition: {
              id: 'Karena e^z periodik, kebalikannya bernilai banyak: log z = ln|z| + i arg z dengan tak hingga pilihan sudut. Memilih satu sudut secara kontinu di suatu daerah disebut cabang; nilai utama Log memakai Arg ∈ (−π, π] dan analitik di luar sumbu real negatif (potongan cabang). Pangkat kompleks didefinisikan lewat log, jadi z^c juga bernilai banyak kecuali c bulat.',
              en: 'Because e^z is periodic, its inverse is multivalued: log z = ln|z| + i arg z with infinitely many angle choices. Choosing one angle continuously on a region is a branch; the principal value Log uses Arg ∈ (−π, π] and is analytic off the negative real axis (the branch cut). Complex powers are defined through log, so z^c is multivalued too unless c is an integer.',
            },
            formulas: [
              '\\log z = \\ln r + i(\\Theta + 2n\\pi),\\qquad \\operatorname{Log} z = \\ln r + i\\Theta,\\quad -\\pi < \\Theta \\le \\pi',
              '\\frac{d}{dz}\\log z = \\frac{1}{z}\\ \\text{(pada cabang)},\\qquad \\log(z_1 z_2) = \\log z_1 + \\log z_2\\ \\text{(sebagai himpunan)}',
              'z^c = e^{c\\log z},\\qquad \\text{nilai utama } \\mathrm{P.V.}\\ z^c = e^{c\\operatorname{Log} z},\\qquad i^{-2i} = e^{(4n+1)\\pi}',
            ],
            insight: {
              id: 'Log(z₁z₂) = Log z₁ + Log z₂ bisa meleset sebesar 2πi: dengan z₁ = z₂ = −1, Log(1) = 0 tetapi Log(−1) + Log(−1) = 2πi. Setiap kali ada log dalam soal, tanyakan dulu: cabang mana?',
              en: 'Log(z₁z₂) = Log z₁ + Log z₂ can be off by 2πi: with z₁ = z₂ = −1, Log(1) = 0 but Log(−1) + Log(−1) = 2πi. Whenever a log appears in a problem, first ask: which branch?',
            },
            pitfall: {
              id: 'Log tidak kontinu pada sumbu real negatif: mendekati −1 dari atas memberi iπ, dari bawah −iπ. Di titik cabang 0 tidak ada cabang yang analitik.',
              en: 'Log is discontinuous on the negative real axis: approaching −1 from above gives iπ, from below −iπ. At the branch point 0 no branch is analytic.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Fungsi trigonometri dan hiperbolik (§34-36)', en: 'Trigonometric and hyperbolic functions (§34-36)' },
            intuition: {
              id: 'Definisikan sin dan cos dengan rumus Euler yang dibalik; semua identitas real (jumlah sudut, sin² + cos² = 1, turunan) ikut terbawa karena hanya bergantung pada aljabar eksponensial. Yang hilang adalah keterbatasan: sin z tumbuh seperti e^{|y|}/2 begitu menjauhi sumbu real.',
              en: 'Define sin and cos by inverting Euler\'s formula; every real identity (angle sums, sin² + cos² = 1, derivatives) carries over because it only depends on exponential algebra. What is lost is boundedness: sin z grows like e^{|y|}/2 once you leave the real axis.',
            },
            formulas: [
              '\\sin z = \\frac{e^{iz} - e^{-iz}}{2i},\\quad \\cos z = \\frac{e^{iz} + e^{-iz}}{2},\\quad \\sinh z = \\frac{e^{z} - e^{-z}}{2},\\quad \\cosh z = \\frac{e^{z} + e^{-z}}{2}',
              '\\sin z = \\sin x\\cosh y + i\\cos x\\sinh y,\\qquad |\\sin z|^2 = \\sin^2 x + \\sinh^2 y,\\qquad |\\cos z|^2 = \\cos^2 x + \\sinh^2 y',
              '\\sin z = 0 \\iff z = n\\pi;\\quad \\cos z = 0 \\iff z = \\tfrac{\\pi}{2} + n\\pi;\\quad \\sin(iz) = i\\sinh z,\\ \\cos(iz) = \\cosh z',
            ],
            insight: {
              id: 'Semua nol dari sin z dan cos z terletak di sumbu real (dari |sin z|² = sin²x + sinh²y: kedua suku harus nol). Nol sinh z ada di sumbu imajiner: z = nπi.',
              en: 'All zeros of sin z and cos z lie on the real axis (from |sin z|² = sin²x + sinh²y: both terms must vanish). The zeros of sinh z sit on the imaginary axis: z = nπi.',
            },
          },
        ],
      },
      {
        title: { id: 'Integral (§37-53)', en: 'Integrals (§37-53)' },
        entries: [
          {
            title: { id: 'Integral kontur dan taksiran ML (§37-43)', en: 'Contour integrals and the ML bound (§37-43)' },
            intuition: {
              id: 'Integral kompleks bukan luas; ia adalah integral garis: parametrisasi kontur z(t), lalu integralkan f(z(t)) z′(t). Nilainya bisa bergantung pada lintasan. Alat taksiran satu-satunya yang Anda perlukan: |∫| ≤ (maks |f| pada C) × (panjang C).',
              en: 'A complex integral is not an area; it is a line integral: parametrise the contour z(t), then integrate f(z(t)) z′(t). Its value may depend on the path. The one estimation tool you need: |∫| ≤ (max |f| on C) × (length of C).',
            },
            formulas: [
              "\\int_C f(z)\\,dz = \\int_a^b f(z(t))\\,z'(t)\\,dt,\\qquad \\int_{-C} f\\,dz = -\\int_C f\\,dz",
              '\\Big|\\int_C f(z)\\,dz\\Big| \\le M L \\quad (|f(z)| \\le M \\text{ pada } C,\\ L = \\text{panjang } C)\\qquad (\\S 43)',
              '\\oint_{|z - z_0| = R} \\frac{dz}{z - z_0} = 2\\pi i,\\qquad \\oint_{|z - z_0| = R} (z - z_0)^{n}\\,dz = 0\\ (n \\ne -1)',
            ],
            insight: {
              id: 'Integral 1/(z − z₀) mengelilingi z₀ bernilai 2πi berapa pun jari-jarinya: inilah "atom" dari seluruh teori residu.',
              en: 'The integral of 1/(z − z₀) around z₀ equals 2πi whatever the radius: this is the "atom" of the whole residue theory.',
            },
            pitfall: {
              id: 'Contoh §41: ∫ z̄ dz sepanjang setengah lingkaran atas dari −1 ke 1 bernilai −πi, tetapi sepanjang ruas garis bernilai 0. Untuk fungsi tak analitik nilai integral bergantung pada lintasan.',
              en: 'Example in §41: ∫ z̄ dz along the upper semicircle from −1 to 1 gives −πi, but along the segment it gives 0. For non-analytic integrands the value depends on the path.',
            },
          },
          {
            title: { id: 'Antiturunan dan teorema Cauchy-Goursat (§44-49)', en: 'Antiderivatives and the Cauchy-Goursat theorem (§44-49)' },
            intuition: {
              id: 'Tiga pernyataan setara di suatu domain (§44): f punya antiturunan F; integral f tidak bergantung lintasan; setiap integral tertutup f bernilai nol. Cauchy-Goursat mengatakan analitik sudah cukup untuk semua itu: jika f analitik di dalam dan pada kontur tertutup sederhana C, tidak ada "yang menghalangi", dan ∮_C f dz = 0. Untuk domain berlubang, kontur luar dapat digeser ke kontur dalam tanpa mengubah nilai integral (prinsip deformasi).',
              en: 'Three equivalent statements on a domain (§44): f has an antiderivative F; integrals of f are path-independent; every closed integral of f vanishes. Cauchy-Goursat says analyticity is enough for all of them: if f is analytic inside and on a simple closed contour C, nothing "obstructs", and ∮_C f dz = 0. On a domain with holes the outer contour may be deformed onto inner ones without changing the integral (principle of deformation).',
            },
            formulas: [
              "\\int_{z_1}^{z_2} f(z)\\,dz = F(z_2) - F(z_1)\\quad (F' = f \\text{ pada domain yang memuat lintasan})",
              '\\oint_C f(z)\\,dz = 0 \\quad (f \\text{ analitik di dalam dan pada } C)\\qquad \\text{(Cauchy-Goursat, §46)}',
              '\\oint_{C} f\\,dz = \\sum_k \\oint_{C_k} f\\,dz \\quad (\\text{domain ganda-terhubung, semua berorientasi positif, §49})',
            ],
            insight: {
              id: 'Bentuk praktisnya: kontur mana pun yang mengelilingi singularitas yang sama memberi integral yang sama. Jadi ganti kontur yang rumit dengan lingkaran kecil.',
              en: 'The practical form: any contour surrounding the same singularities gives the same integral. So replace a complicated contour by a small circle.',
            },
            pitfall: {
              id: '∮ dz/z = 2πi pada lingkaran satuan walaupun 1/z punya "antiturunan" log z: tidak ada cabang log yang analitik pada seluruh lingkaran. Antiturunan harus ada pada domain yang memuat seluruh lintasan.',
              en: '∮ dz/z = 2πi on the unit circle even though 1/z has the "antiderivative" log z: no branch of log is analytic on the whole circle. The antiderivative must exist on a domain containing the entire path.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Rumus integral Cauchy dan akibatnya (§50-53)', en: 'Cauchy integral formula and its consequences (§50-53)' },
            intuition: {
              id: 'Nilai fungsi analitik di dalam kontur ditentukan sepenuhnya oleh nilainya di kontur: f(z₀) adalah "rata-rata berbobot" dari f di sekeliling. Turunkan rumus itu terhadap z₀ berulang-ulang, dan semua turunan muncul sebagai integral: analitik sekali berarti analitik tak hingga kali. Dari taksiran ML pada rumus turunan lahir ketaksamaan Cauchy, lalu Liouville, lalu teorema dasar aljabar.',
              en: 'The values of an analytic function inside a contour are fully determined by its values on the contour: f(z₀) is a "weighted average" of f around it. Differentiate that formula in z₀ repeatedly and every derivative appears as an integral: analytic once means analytic infinitely often. Applying the ML bound to the derivative formula yields Cauchy\'s inequality, then Liouville, then the fundamental theorem of algebra.',
            },
            formulas: [
              'f(z_0) = \\frac{1}{2\\pi i}\\oint_C \\frac{f(z)}{z - z_0}\\,dz,\\qquad f^{(n)}(z_0) = \\frac{n!}{2\\pi i}\\oint_C \\frac{f(z)\\,dz}{(z - z_0)^{n+1}}\\quad (\\S 50\\text{-}51)',
              '|f^{(n)}(z_0)| \\le \\frac{n!\\,M_R}{R^n}\\ \\text{(Cauchy)};\\qquad \\text{Liouville: entire + terbatas} \\Rightarrow \\text{konstan}\\quad (\\S 53)',
              '\\text{Teorema dasar aljabar: } P(z) \\text{ berderajat } n \\ge 1 \\text{ mempunyai } n \\text{ nol (dengan multiplisitas)}',
            ],
            insight: {
              id: 'Membaca soal integral: tulis integran sebagai f(z)/(z − z₀)^{n+1} dengan f analitik di dalam C, lalu jawabannya 2πi f^{(n)}(z₀)/n!. Contoh §51: ∮ dz/(z(z²+9)) pada |z| = 2 sama dengan 2πi · 1/9.',
              en: 'Reading an integral problem: write the integrand as f(z)/(z − z₀)^{n+1} with f analytic inside C, and the answer is 2πi f^{(n)}(z₀)/n!. Example in §51: ∮ dz/(z(z²+9)) on |z| = 2 equals 2πi · 1/9.',
            },
            pitfall: {
              id: 'Liouville menggagalkan intuisi real: sin z tidak terbatas di C (tidak ada fungsi entire tak konstan yang terbatas). Prinsip modulus maksimum: |f| pada domain mencapai maksimum hanya di batas.',
              en: 'Liouville breaks real intuition: sin z is unbounded on C (no non-constant entire function is bounded). Maximum modulus principle: |f| on a domain attains its maximum only on the boundary.',
            },
          },
        ],
      },
      {
        title: { id: 'Deret dan residu (§55-73)', en: 'Series and residues (§55-73)' },
        entries: [
          {
            title: { id: 'Deret Taylor dan Laurent (§57-62)', en: 'Taylor and Laurent series (§57-62)' },
            intuition: {
              id: 'Di cakram terbesar tempat f analitik, f sama dengan deret Taylor-nya, dan jari-jarinya tepat jarak ke singularitas terdekat. Di anulus (cincin) mengelilingi singularitas, tambahkan pangkat negatif: itulah deret Laurent. Dalam praktik tidak ada yang menghitung koefisiennya lewat integral; kita substitusi ke deret yang sudah dikenal (eʷ, sin w, 1/(1 − w)).',
              en: 'On the largest disc where f is analytic, f equals its Taylor series, with radius exactly the distance to the nearest singularity. On an annulus around a singularity, add negative powers: that is the Laurent series. In practice nobody computes the coefficients by integrals; we substitute into known series (eʷ, sin w, 1/(1 − w)).',
            },
            formulas: [
              'f(z) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(z_0)}{n!}(z - z_0)^n,\\quad |z - z_0| < R_0 \\quad (\\S 57)',
              'f(z) = \\sum_{n=0}^\\infty a_n (z - z_0)^n + \\sum_{n=1}^\\infty \\frac{b_n}{(z - z_0)^n},\\quad R_1 < |z - z_0| < R_2 \\quad (\\S 60)',
              'e^{z} = \\sum \\frac{z^n}{n!},\\quad \\frac{1}{1 - z} = \\sum z^n\\ (|z| < 1),\\quad e^{1/z} = 1 + \\frac{1}{z} + \\frac{1}{2!\\,z^2} + \\cdots\\ (|z| > 0)',
            ],
            insight: {
              id: 'Koefisien b₁ (koefisien 1/(z − z₀)) adalah residu. Deret Laurent bergantung pada anulus: 1/(z − 1) punya dua ekspansi berbeda untuk |z| < 1 dan |z| > 1.',
              en: 'The coefficient b₁ (of 1/(z − z₀)) is the residue. A Laurent series depends on the annulus: 1/(z − 1) has two different expansions for |z| < 1 and |z| > 1.',
            },
            pitfall: {
              id: 'Deret pangkat boleh diturunkan dan diintegralkan suku demi suku di dalam cakram kekonvergenannya (§65), tetapi tidak di batasnya.',
              en: 'A power series may be differentiated and integrated term by term inside its disc of convergence (§65), but not on its boundary.',
            },
          },
          {
            title: { id: 'Tiga jenis titik singular terisolasi (§68-70)', en: 'The three kinds of isolated singularities (§68-70)' },
            intuition: {
              id: 'Lihat bagian utama deret Laurent (suku-suku dengan pangkat negatif). Tidak ada: singularitas dapat dihapuskan, f terbatas dan bisa "ditambal". Berhingga banyak, sampai 1/(z − z₀)^m: kutub orde m, |f| → ∞. Tak hingga banyak: singularitas esensial, f berperilaku liar (Casorati-Weierstrass: mendekati setiap nilai; Picard: mengambil setiap nilai kecuali paling banyak satu, tak hingga kali).',
              en: 'Look at the principal part of the Laurent series (the negative-power terms). None: removable singularity, f is bounded and can be "patched". Finitely many, up to 1/(z − z₀)^m: pole of order m, |f| → ∞. Infinitely many: essential singularity, f behaves wildly (Casorati-Weierstrass: it comes arbitrarily close to every value; Picard: it takes every value but at most one, infinitely often).',
            },
            formulas: [
              '\\text{dapat dihapuskan: } b_n = 0\\ \\forall n,\\qquad \\frac{\\sin z}{z} = 1 - \\frac{z^2}{3!} + \\frac{z^4}{5!} - \\cdots',
              '\\text{kutub orde } m: f(z) = \\frac{\\phi(z)}{(z - z_0)^m},\\ \\phi \\text{ analitik},\\ \\phi(z_0) \\ne 0;\\qquad \\frac{1}{z^2},\\ \\frac{1}{\\sin z}',
              '\\text{esensial: } e^{1/z} \\text{ di } 0;\\qquad \\text{Casorati-Weierstrass (§70), Picard}',
            ],
            insight: {
              id: 'Uji cepat (§70): jika lim (z − z₀)^m f(z) ada dan tidak nol, kutubnya berorde m. Nol berorde m dari q dengan p(z₀) ≠ 0 memberi kutub berorde m dari p/q (§69).',
              en: 'Quick test (§70): if lim (z − z₀)^m f(z) exists and is nonzero, the pole has order m. A zero of order m of q with p(z₀) ≠ 0 gives a pole of order m of p/q (§69).',
            },
            pitfall: {
              id: 'Singularitas harus terisolasi agar semua ini berlaku. Titik cabang 0 dari Log z bukan singularitas terisolasi, dan 1/sin(1/z) punya singularitas 1/(nπ) yang menumpuk di 0.',
              en: 'The singularity must be isolated for all of this to apply. The branch point 0 of Log z is not isolated, and 1/sin(1/z) has singularities 1/(nπ) accumulating at 0.',
            },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Residu dan teorema residu Cauchy (§66-67, §71-73)', en: 'Residues and Cauchy\'s residue theorem (§66-67, §71-73)' },
            intuition: {
              id: 'Integralkan deret Laurent suku demi suku mengelilingi z₀: setiap suku (z − z₀)ⁿ memberi nol kecuali n = −1, yang memberi 2πi b₁. Jadi integral tertutup hanya "melihat" residu setiap singularitas di dalamnya, dan menjumlahkannya. Dari situ, menghitung integral menjadi menghitung residu, dan menghitung residu di kutub adalah menghitung limit atau turunan.',
              en: 'Integrate the Laurent series term by term around z₀: each term (z − z₀)ⁿ contributes zero except n = −1, which gives 2πi b₁. So a closed integral only "sees" the residue of each singularity inside, and adds them up. Hence computing integrals becomes computing residues, and residues at poles are limits or derivatives.',
            },
            formulas: [
              '\\oint_C f(z)\\,dz = 2\\pi i \\sum_{k=1}^n \\operatorname{Res}_{z = z_k} f(z) \\quad (\\S 66)',
              '\\text{kutub sederhana (§72): } \\operatorname{Res}_{z_0} f = \\lim_{z\\to z_0}(z - z_0)f(z);\\qquad f = \\frac{p}{q},\\ q(z_0) = 0 \\ne q\'(z_0):\\ \\operatorname{Res} = \\frac{p(z_0)}{q\'(z_0)}\\ (\\S 73)',
              '\\text{kutub orde } m\\ (\\S 71):\\ f = \\frac{\\phi(z)}{(z - z_0)^m} \\Rightarrow \\operatorname{Res}_{z_0} f = \\frac{\\phi^{(m-1)}(z_0)}{(m-1)!}',
            ],
            insight: {
              id: 'Contoh §73: 1/sin z punya kutub sederhana di nπ dengan residu 1/cos(nπ) = (−1)ⁿ. Contoh §71: (z² + 1)/(z(z − 2)²) punya Res₀ = 1/4 dan Res₂ = 3/4 (turunkan (z² + 1)/z sekali). Untuk fungsi dengan pecahan parsial sederhana, residunya adalah koefisien 1/(z − z_k).',
              en: 'Example in §73: 1/sin z has simple poles at nπ with residue 1/cos(nπ) = (−1)ⁿ. Example in §71: (z² + 1)/(z(z − 2)²) has Res₀ = 1/4 and Res₂ = 3/4 (differentiate (z² + 1)/z once). For functions with simple partial fractions the residues are the coefficients of 1/(z − z_k).',
            },
            pitfall: {
              id: 'Residu bisa nol walaupun singularitasnya kutub: 1/z² berkutub orde 2 dengan residu 0, sehingga ∮ dz/z² = 0. "Ada singularitas di dalam" tidak berarti "integral tidak nol".',
              en: 'A residue can be zero even at a pole: 1/z² has a pole of order 2 with residue 0, so ∮ dz/z² = 0. "A singularity inside" does not mean "a nonzero integral".',
            },
            lab: '#/app/complex',
          },
        ],
      },
    ],
  },
  // =====================================================================================
  {
    id: 'geometry',
    title: { id: 'Geometri Analitik', en: 'Analytic Geometry' },
    source: 'Vaisman, Analytical Geometry (World Scientific, 1997)',
    parts: [
      {
        title: { id: 'Vektor dan hasil kali (Bab 1)', en: 'Vectors and products (Chapter 1)' },
        entries: [
          {
            title: { id: 'Vektor, basis, koordinat afin (1.1-1.3)', en: 'Vectors, bases, affine coordinates (1.1-1.3)' },
            intuition: {
              id: 'Vektor adalah kelas ruas garis berarah yang ekuipolen (sama panjang, arah, dan orientasi). Tiga vektor tak sebidang membentuk basis, dan setiap vektor punya koordinat tunggal terhadap basis itu. Kerangka afin = titik asal + basis; titik M punya koordinat vektor posisinya OM.',
              en: 'A vector is a class of equipollent directed segments (same length, direction and sense). Three non-coplanar vectors form a basis and every vector has unique coordinates in it. An affine frame = origin + basis; a point M has the coordinates of its position vector OM.',
            },
            formulas: [
              '\\bar v = v_1\\bar i + v_2\\bar j + v_3\\bar k,\\qquad \\overrightarrow{AB} = (x_B - x_A,\\ y_B - y_A,\\ z_B - z_A)',
              '\\text{titik pembagi } \\overrightarrow{AM} = k\\,\\overrightarrow{MB}:\\ x_M = \\frac{x_A + k x_B}{1 + k}\\ (k \\ne -1);\\quad \\text{titik tengah: } k = 1',
              '\\bar u, \\bar v \\text{ sejajar} \\iff \\frac{u_1}{v_1} = \\frac{u_2}{v_2} = \\frac{u_3}{v_3};\\qquad \\bar u, \\bar v, \\bar w \\text{ sebidang} \\iff \\det(u, v, w) = 0',
            ],
            insight: {
              id: 'Perbandingan sederhana (simple ratio) tiga titik segaris tidak berubah oleh perubahan koordinat afin; itulah alasan koordinat afin cukup untuk kesejajaran dan titik tengah, tetapi tidak untuk jarak dan sudut.',
              en: 'The simple ratio of three collinear points is preserved by affine coordinate changes; that is why affine coordinates suffice for parallelism and midpoints, but not for lengths and angles.',
            },
          },
          {
            title: { id: 'Hasil kali skalar, vektor, dan campuran (1.4)', en: 'Scalar, vector and mixed products (1.4)' },
            intuition: {
              id: 'Tiga hasil kali menjawab tiga pertanyaan geometri. Skalar: seberapa searah dua vektor (sudut, proyeksi, panjang). Vektor: vektor yang tegak lurus keduanya, dengan panjang = luas jajar genjang. Campuran: volume bertanda paralelepiped, dan karena itu uji kesebidangan.',
              en: 'The three products answer three geometric questions. Scalar: how aligned two vectors are (angle, projection, length). Vector: a vector perpendicular to both, with length = area of the parallelogram. Mixed: signed volume of the parallelepiped, hence a coplanarity test.',
            },
            formulas: [
              '\\bar u\\cdot\\bar v = |\\bar u||\\bar v|\\cos\\varphi = u_1v_1 + u_2v_2 + u_3v_3,\\qquad \\operatorname{pr}_{\\bar v}\\bar u = \\frac{\\bar u\\cdot\\bar v}{|\\bar v|}',
              '\\bar u\\times\\bar v = \\begin{vmatrix} \\bar i & \\bar j & \\bar k \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix},\\quad |\\bar u\\times\\bar v| = |\\bar u||\\bar v|\\sin\\varphi = \\text{luas},\\quad \\bar u\\times\\bar v = -\\bar v\\times\\bar u',
              '(\\bar u, \\bar v, \\bar w) = \\bar u\\cdot(\\bar v\\times\\bar w) = \\det(u, v, w) = \\pm\\text{volume};\\qquad \\bar u\\times(\\bar v\\times\\bar w) = (\\bar u\\cdot\\bar w)\\bar v - (\\bar u\\cdot\\bar v)\\bar w',
            ],
            insight: {
              id: 'Hasil kali campuran bersifat siklik: (u, v, w) = (v, w, u) = (w, u, v), dan berganti tanda bila dua vektor ditukar. Nol persis ketika ketiganya sebidang.',
              en: 'The mixed product is cyclic: (u, v, w) = (v, w, u) = (w, u, v), and changes sign when two vectors are swapped. It vanishes exactly when the three are coplanar.',
            },
            pitfall: {
              id: 'Hasil kali vektor tidak asosiatif: u × (v × w) ≠ (u × v) × w secara umum (rumus "bac − cab" di atas menunjukkannya). Rumus koordinatnya hanya berlaku pada basis ortonormal.',
              en: 'The vector product is not associative: u × (v × w) ≠ (u × v) × w in general (the "bac − cab" formula shows it). The coordinate formulas hold only in an orthonormal basis.',
            },
          },
        ],
      },
      {
        title: { id: 'Garis dan bidang (Bab 2)', en: 'Lines and planes (Chapter 2)' },
        entries: [
          {
            title: { id: 'Persamaan garis dan bidang (2.1-2.2)', en: 'Equations of lines and planes (2.1-2.2)' },
            intuition: {
              id: 'Garis ditentukan oleh satu titik dan satu arah v; bidang oleh satu titik dan dua arah, atau lebih praktis satu normal N. Semua bentuk persamaan (vektor, parametrik, simetrik, umum) hanyalah cara berbeda menulis "r − r₀ sejajar v" atau "r − r₀ tegak lurus N".',
              en: 'A line is fixed by a point and a direction v; a plane by a point and two directions, or more practically one normal N. All the equation forms (vector, parametric, symmetric, general) are just different ways of writing "r − r₀ is parallel to v" or "r − r₀ is perpendicular to N".',
            },
            formulas: [
              'd:\\ \\bar r = \\bar r_0 + \\lambda\\bar v;\\quad \\frac{x - x_0}{l} = \\frac{y - y_0}{m} = \\frac{z - z_0}{n};\\quad \\text{melalui } A, B:\\ \\bar v = \\overrightarrow{AB}',
              '\\pi:\\ \\bar N\\cdot(\\bar r - \\bar r_0) = 0 \\iff Ax + By + Cz + D = 0,\\quad \\bar N = (A, B, C);\\quad \\text{melalui 3 titik: } \\bar N = \\overrightarrow{AB}\\times\\overrightarrow{AC}',
              '\\text{garis sebagai irisan dua bidang: } \\bar v = \\bar N_1 \\times \\bar N_2;\\qquad \\text{pensil bidang: } \\lambda(\\pi_1) + \\mu(\\pi_2) = 0',
            ],
            insight: {
              id: 'Bentuk simetrik dengan penyebut 0 (mis. (y − 1)/0) hanyalah singkatan untuk "y = 1"; jangan membaginya. Bidang Ax + By + Cz + D = 0 dengan D = 0 melalui titik asal, dengan C = 0 sejajar sumbu z.',
              en: 'A symmetric form with a 0 denominator (e.g. (y − 1)/0) is just shorthand for "y = 1"; do not divide. The plane Ax + By + Cz + D = 0 passes through the origin when D = 0 and is parallel to the z-axis when C = 0.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Sudut, jarak, kedudukan relatif (2.3)', en: 'Angles, distances, relative position (2.3)' },
            intuition: {
              id: 'Setiap pertanyaan tentang sudut kembali ke hasil kali skalar antara vektor arah/normal; setiap pertanyaan tentang jarak kembali ke proyeksi pada normal (bidang) atau ke luas jajar genjang dibagi alas (garis). Dua garis: sejajar bila v₁ × v₂ = 0, sebidang bila hasil kali campuran (r₂ − r₁, v₁, v₂) = 0, selebihnya bersilangan, dengan jarak = volume dibagi luas alas.',
              en: 'Every angle question reduces to a scalar product of direction/normal vectors; every distance question reduces to a projection onto the normal (plane) or an area divided by a base (line). Two lines: parallel if v₁ × v₂ = 0, coplanar if the mixed product (r₂ − r₁, v₁, v₂) = 0, otherwise skew, with distance = volume over base area.',
            },
            formulas: [
              '\\cos\\angle(d_1, d_2) = \\frac{|\\bar v_1\\cdot\\bar v_2|}{|\\bar v_1||\\bar v_2|},\\quad \\cos\\angle(\\pi_1,\\pi_2) = \\frac{|\\bar N_1\\cdot\\bar N_2|}{|\\bar N_1||\\bar N_2|},\\quad \\sin\\angle(d,\\pi) = \\frac{|\\bar N\\cdot\\bar v|}{|\\bar N||\\bar v|}',
              '\\operatorname{dist}(M_0,\\pi) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}},\\qquad \\operatorname{dist}(M_0, d) = \\frac{|\\overrightarrow{M_1M_0}\\times\\bar v|}{|\\bar v|}',
              '\\operatorname{dist}(d_1, d_2) = \\frac{|(\\overrightarrow{M_1M_2}, \\bar v_1, \\bar v_2)|}{|\\bar v_1\\times\\bar v_2|}\\ \\text{(bersilangan)};\\qquad d \\parallel \\pi \\iff \\bar N\\cdot\\bar v = 0',
            ],
            insight: {
              id: 'Garis tegak lurus persekutuan dua garis bersilangan searah dengan v₁ × v₂; panjangnya adalah jarak terpendek. Rumus jarak titik-bidang adalah proyeksi vektor M₁M₀ pada normal satuan.',
              en: 'The common perpendicular of two skew lines has direction v₁ × v₂; its length is the shortest distance. The point-plane distance is the projection of M₁M₀ onto the unit normal.',
            },
            pitfall: {
              id: 'Sudut antara garis dan bidang memakai sinus, bukan kosinus, karena yang diukur adalah sudut dengan proyeksi garis, sementara N tegak lurus bidang.',
              en: 'The angle between a line and a plane uses a sine, not a cosine, because it is measured against the line\'s projection while N is perpendicular to the plane.',
            },
            lab: '#/app/geometry',
          },
        ],
      },
      {
        title: { id: 'Lingkaran dan bola (3.1)', en: 'Circles and spheres (3.1)' },
        entries: [
          {
            title: { id: 'Persamaan umum, kuasa titik, garis kutub (3.1.1-3.1.21)', en: 'General equation, power of a point, polar (3.1.1-3.1.21)' },
            intuition: {
              id: 'Setiap persamaan x² + y² − 2αx − 2βy + σ = 0 adalah lingkaran berpusat (α, β) begitu ρ² = α² + β² − σ > 0. Ruas kirinya, dievaluasi di M, adalah kuasa M: negatif di dalam, nol pada, positif di luar; dan ia sama dengan hasil kali MP₁ · MP₂ untuk garis mana pun melalui M (Prop. 3.1.7, "lihat lingkaran dari luar"). Polarisasi persamaan memberi garis singgung di M₀ bila M₀ pada lingkaran, dan garis kutub secara umum.',
              en: 'Every equation x² + y² − 2αx − 2βy + σ = 0 is a circle with centre (α, β) once ρ² = α² + β² − σ > 0. Its left-hand side evaluated at M is the power of M: negative inside, zero on, positive outside; and it equals MP₁ · MP₂ for any secant through M (Prop. 3.1.7). Polarising the equation gives the tangent at M₀ when M₀ is on the circle, and the polar line in general.',
            },
            formulas: [
              'x^2 + y^2 - 2\\alpha x - 2\\beta y + \\sigma = 0,\\quad A(\\alpha, \\beta),\\quad \\rho^2 = \\alpha^2 + \\beta^2 - \\sigma\\ (>0 \\text{ real},\\ <0 \\text{ imajiner})',
              'p(M, \\Gamma) = x_0^2 + y_0^2 - 2\\alpha x_0 - 2\\beta y_0 + \\sigma = \\overline{MP_1}\\cdot\\overline{MP_2} = |MA|^2 - \\rho^2',
              '\\text{kutub } M_0:\\ x x_0 + y y_0 - \\alpha(x + x_0) - \\beta(y + y_0) + \\sigma = 0 \\quad (x^2 \\to xx_0,\\ x \\to \\tfrac{x + x_0}{2})',
            ],
            insight: {
              id: 'Panjang garis singgung dari M adalah √p(M, Γ). Titik-titik singgung dari M₀ terletak pada garis kutubnya, dan M₀ pada kutub M₁ iff M₁ pada kutub M₀ (kekonjugatan).',
              en: 'The tangent length from M is √p(M, Γ). The contact points of tangents from M₀ lie on its polar, and M₀ lies on the polar of M₁ iff M₁ lies on the polar of M₀ (conjugacy).',
            },
            pitfall: {
              id: 'Sebelum membaca pusat dan jari-jari, normalisasi koefisien x² dan y² menjadi 1. 2x² + 2y² − 4x = 6 adalah x² + y² − 2x = 3, pusat (1, 0), ρ = 2.',
              en: 'Normalise the x² and y² coefficients to 1 before reading off the centre and radius. 2x² + 2y² − 4x = 6 is x² + y² − 2x = 3, centre (1, 0), ρ = 2.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Sumbu radikal, pensil, bola (3.1.22-3.1.40)', en: 'Radical axis, pencils, spheres (3.1.22-3.1.40)' },
            intuition: {
              id: 'Kurangkan dua persamaan lingkaran (dengan koefisien kuadrat 1): suku kuadratnya lenyap dan tersisa garis, tempat kedudukan titik berkuasa sama terhadap keduanya. Garis itu tegak lurus garis pusat dan melalui titik potong bila ada. Kombinasi λΓ₁ + μΓ₂ menyapu semua lingkaran melalui titik potong yang sama (pensil). Bola mengikuti pola persis sama satu dimensi lebih tinggi.',
              en: 'Subtract two circle equations (with leading coefficients 1): the quadratic terms cancel and a line remains, the locus of points with equal power with respect to both. It is perpendicular to the line of centres and passes through the intersection points when they exist. The combination λΓ₁ + μΓ₂ sweeps out every circle through the same intersection points (a pencil). Spheres follow the identical pattern one dimension up.',
            },
            formulas: [
              '\\text{sumbu radikal: } 2(\\alpha_2 - \\alpha_1)x + 2(\\beta_2 - \\beta_1)y - (\\sigma_2 - \\sigma_1) = 0;\\quad \\text{pusat radikal: perpotongan tiga sumbu radikal}',
              '\\text{pensil: } \\lambda f_1 + \\mu f_2 = 0;\\qquad \\text{bola: } (x-\\alpha)^2 + (y-\\beta)^2 + (z-\\gamma)^2 = \\rho^2,\\ \\text{bidang singgung dengan polarisasi}',
              '\\text{irisan bola dengan bidang: lingkaran berjari-jari } \\sqrt{\\rho^2 - \\operatorname{dist}(A, \\pi)^2}',
            ],
            insight: {
              id: 'Tiga lingkaran dengan pusat tak segaris mempunyai tepat satu pusat radikal: titik dari mana ketiga garis singgungnya sama panjang.',
              en: 'Three circles with non-collinear centres have exactly one radical centre: the point from which all three tangent lengths agree.',
            },
            lab: '#/app/geometry',
          },
        ],
      },
      {
        title: { id: 'Konik dan kuadrik (3.2-3.4)', en: 'Conics and quadrics (3.2-3.4)' },
        entries: [
          {
            title: { id: 'Persamaan kanonik konik (3.2.1-3.2.13)', en: 'Canonical equations of conics (3.2.1-3.2.13)' },
            intuition: {
              id: 'Elips dan hiperbola adalah tempat kedudukan titik dengan jumlah (selisih) jarak ke dua fokus tetap; parabola dengan jarak ke fokus = jarak ke direktriks. Ketiganya juga satu keluarga lewat eksentrisitas e = jarak ke fokus / jarak ke direktriks: e < 1 elips, e = 1 parabola, e > 1 hiperbola.',
              en: 'Ellipses and hyperbolas are loci of points whose sum (difference) of distances to two foci is constant; a parabola has distance to focus = distance to directrix. All three form one family via the eccentricity e = distance to focus / distance to directrix: e < 1 ellipse, e = 1 parabola, e > 1 hyperbola.',
            },
            formulas: [
              '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1,\\ c^2 = a^2 - b^2,\\ e = \\frac{c}{a} < 1;\\qquad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1,\\ c^2 = a^2 + b^2,\\ e > 1,\\ \\text{asimtot } y = \\pm\\frac{b}{a}x',
              'y^2 = 2px,\\ \\text{fokus } (p/2, 0),\\ \\text{direktriks } x = -p/2;\\qquad \\text{direktriks elips/hiperbola: } x = \\pm a/e',
              '\\text{garis singgung di } (x_0, y_0) \\text{ dengan polarisasi: } \\frac{x x_0}{a^2} + \\frac{y y_0}{b^2} = 1,\\qquad y y_0 = p(x + x_0)',
            ],
            insight: {
              id: 'Hiperbola dan asimtotnya berbeda hanya pada konstanta: x²/a² − y²/b² = 1 versus = 0. Hiperbola konjugat menukar peran a dan b dengan asimtot yang sama.',
              en: 'A hyperbola and its asymptotes differ only in the constant: x²/a² − y²/b² = 1 versus = 0. The conjugate hyperbola swaps a and b and shares the asymptotes.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Kuadrik kanonik dan generator rektilinear (3.2.14-3.2.24)', en: 'Canonical quadrics and rulings (3.2.14-3.2.24)' },
            intuition: {
              id: 'Kenali kuadrik dari irisannya dengan bidang koordinat: elipsoid memberi elips di ketiga bidang; hiperboloid satu lembar memberi elips (z = konst.) dan hiperbola; paraboloid eliptik memberi elips dan parabola; paraboloid hiperbolik (pelana) memberi hiperbola dan parabola yang membuka berlawanan. Dua di antaranya, hiperboloid satu lembar dan pelana, memuat dua keluarga garis lurus.',
              en: 'Recognise a quadric by its sections with the coordinate planes: an ellipsoid gives ellipses in all three; a one-sheeted hyperboloid gives ellipses (z = const.) and hyperbolas; an elliptic paraboloid gives ellipses and parabolas; a hyperbolic paraboloid (saddle) gives hyperbolas and oppositely opening parabolas. Two of them, the one-sheeted hyperboloid and the saddle, contain two families of straight lines.',
            },
            formulas: [
              '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1;\\quad \\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = 1\\ (\\text{1 lembar}),\\ = -1\\ (\\text{2 lembar}),\\ = 0\\ (\\text{kerucut})',
              '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 2z\\ (\\text{paraboloid eliptik}),\\qquad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 2z\\ (\\text{paraboloid hiperbolik})',
              '\\text{generator hiperboloid 1 lembar: } \\Big(\\frac{x}{a} - \\frac{z}{c}\\Big) = \\lambda\\Big(1 - \\frac{y}{b}\\Big),\\ \\lambda\\Big(\\frac{x}{a} + \\frac{z}{c}\\Big) = 1 + \\frac{y}{b}',
            ],
            insight: {
              id: 'Kerucut adalah kasus batas hiperboloid (konstanta 0) dan sekaligus asimtotnya. Silinder muncul saat satu variabel hilang dari persamaan.',
              en: 'The cone is the limiting case of the hyperboloids (constant 0) and also their asymptotic cone. Cylinders appear when one variable is missing from the equation.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Teori umum: matriks, pusat, arah utama (3.3)', en: 'General theory: matrices, centre, principal directions (3.3)' },
            intuition: {
              id: 'Persamaan derajat dua umum = bentuk kuadrat (matriks kecil A) + suku linear + konstanta, semuanya terkumpul dalam matriks besar Ã. Pusatnya adalah titik tempat suku linear lenyap (solusi Aξ + a = 0), ada tunggal iff δ = det A ≠ 0. Arah utama adalah vektor eigen A: sepanjang arah itu tidak ada suku silang, jadi itulah sumbu simetrinya.',
              en: 'A general second-degree equation = quadratic form (small matrix A) + linear terms + constant, all collected in the large matrix Ã. The centre is where the linear terms vanish (solution of Aξ + a = 0), unique iff δ = det A ≠ 0. The principal directions are eigenvectors of A: along them there are no cross terms, so they are the symmetry axes.',
            },
            formulas: [
              'a_{11}x^2 + a_{22}y^2 + 2a_{12}xy + 2a_{10}x + 2a_{20}y + a_{00} = 0 \\iff \\xi^t A\\xi + 2a^t\\xi + a_{00} = 0 \\iff \\mathcal X^t\\tilde A\\mathcal X = 0',
              'A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{12} & a_{22} \\end{pmatrix},\\quad \\tilde A = \\begin{pmatrix} A & a \\\\ a^t & a_{00} \\end{pmatrix},\\qquad I = \\operatorname{tr} A,\\ \\delta = \\det A,\\ \\Delta = \\det\\tilde A',
              '\\text{pusat: } A\\xi + a = 0\\ (3.3.31);\\qquad \\text{arah utama: } A\\bar v = s\\bar v,\\ \\det(A - sI) = s^2 - Is + \\delta = 0\\ (3.3.37)',
            ],
            insight: {
              id: 'Diameter konjugat arah v adalah garis (bidang) yang memotong semua tali busur searah v di titik tengahnya; untuk arah utama, diameter konjugatnya tegak lurus v dan menjadi sumbu simetri (Prop. 3.3.20).',
              en: 'The diameter conjugate to a direction v is the line (plane) bisecting all chords parallel to v; for a principal direction it is perpendicular to v and becomes a symmetry axis (Prop. 3.3.20).',
            },
            pitfall: {
              id: 'Koefisien silang dan linear masuk matriks dengan faktor ½: dari 24xy tulis a₁₂ = 12, dari 4x tulis a₁₀ = 2. Lupa membagi dua merusak δ dan Δ.',
              en: 'Cross and linear coefficients enter the matrices halved: from 24xy write a₁₂ = 12, from 4x write a₁₀ = 2. Forgetting to halve corrupts δ and Δ.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Reduksi ke bentuk kanonik dan klasifikasi (3.4)', en: 'Reduction to canonical form and classification (3.4)' },
            intuition: {
              id: 'Dua jalan: (1) Gauss, melengkapkan kuadrat, memberi jenis afin dengan cepat; (2) nilai eigen, memberi jenis ortogonal beserta ukuran sesungguhnya. Metode eigen: cari s₁, s₂ (s₃) dan vektor eigen ortonormal, putar ke basis itu sehingga suku silang hilang, geser ke pusat sehingga suku linear hilang (atau ke puncak untuk parabola/paraboloid). Jenisnya lalu terbaca dari tanda s_i dan konstanta. I, δ, Δ tidak berubah oleh langkah-langkah ini, sehingga bisa dipakai untuk mengklasifikasi tanpa menghitung reduksi.',
              en: 'Two routes: (1) Gauss, completing squares, gives the affine type quickly; (2) eigenvalues, gives the orthogonal type with true sizes. Eigen method: find s₁, s₂ (s₃) and orthonormal eigenvectors, rotate to that basis so the cross terms vanish, translate to the centre so the linear terms vanish (or to the vertex for parabolas/paraboloids). The type is then read from the signs of the s_i and the constant. I, δ, Δ are unchanged by these steps, so they classify without carrying out the reduction.',
            },
            formulas: [
              '\\delta \\ne 0:\\ s_1x\'^2 + s_2y\'^2 + \\frac{\\Delta}{\\delta} = 0;\\qquad \\delta = 0,\\ \\Delta \\ne 0:\\ s\\,y\'^2 = \\pm 2\\sqrt{-\\Delta/I}\\;x\'\\ \\text{(parabola)}',
              '\\text{konik (Teorema 3.4.5): } \\Delta \\ne 0:\\ \\delta > 0 \\text{ elips (real jika } I\\Delta < 0),\\ \\delta < 0 \\text{ hiperbola},\\ \\delta = 0 \\text{ parabola};\\ \\Delta = 0 \\text{ pasangan garis}',
              '\\text{kuadrik (Teorema 3.4.6): } \\delta \\ne 0 \\text{ berpusat (elipsoid, hiperboloid, kerucut)};\\ \\delta = 0,\\ \\Delta \\ne 0 \\text{ paraboloid};\\ \\delta = \\Delta = 0 \\text{ silinder / bidang}',
            ],
            insight: {
              id: 'Contoh 3.4.3: x² + y² − 3z² − 2xy − 6xz − 6yz + 2x + 2y + 4z = 0 punya s = 2, 3, −6 dan δ = Δ = −36, jadi hiperboloid dua lembar 2x′² + 3y′² − 6z′² + 1 = 0. Tanda Δ dan ke-nol-an δ adalah invarian afin; nilai I, δ, Δ invarian ortogonal (Prop. 3.4.8).',
              en: 'Example 3.4.3: x² + y² − 3z² − 2xy − 6xz − 6yz + 2x + 2y + 4z = 0 has s = 2, 3, −6 and δ = Δ = −36, hence the two-sheeted hyperboloid 2x′² + 3y′² − 6z′² + 1 = 0. The sign of Δ and the vanishing of δ are affine invariants; the values I, δ, Δ are orthogonal invariants (Prop. 3.4.8).',
            },
            pitfall: {
              id: 'δ > 0 belum berarti elips real: x² + y² + 1 = 0 punya δ = 1 tetapi kosong (elips imajiner). Periksa tanda konstanta setelah reduksi, atau tanda IΔ.',
              en: 'δ > 0 does not yet mean a real ellipse: x² + y² + 1 = 0 has δ = 1 but is empty (imaginary ellipse). Check the sign of the constant after reduction, or the sign of IΔ.',
            },
            lab: '#/app/geometry',
          },
        ],
      },
      {
        title: { id: 'Transformasi geometri (Bab 4)', en: 'Geometric transformations (Chapter 4)' },
        entries: [
          {
            title: { id: 'Transformasi afin (4.1-4.2)', en: 'Affine transformations (4.1-4.2)' },
            intuition: {
              id: 'Transformasi afin adalah bijeksi yang, terhadap sepasang kerangka afin yang bersesuaian, mempunyai persamaan x′ = x (Def. 4.2.1); dalam kerangka sebarang ia berbentuk x′ = Bx + c dengan det B ≠ 0. Ia mengawetkan tepat apa yang koordinat afin catat: garis ke garis, kesejajaran, dan perbandingan sederhana, tetapi tidak panjang atau sudut. Translasi, homoteti, dan proyeksi sejajar semuanya afin.',
              en: 'An affine transformation is a bijection that, with respect to a pair of corresponding affine frames, has equations x′ = x (Def. 4.2.1); in arbitrary frames it reads x′ = Bx + c with det B ≠ 0. It preserves exactly what affine coordinates record: lines to lines, parallelism and simple ratios, but not lengths or angles. Translations, homotheties and parallel projections are all affine.',
            },
            formulas: [
              "\\bar r' = B\\bar r + \\bar c,\\ \\det B \\ne 0;\\qquad \\text{bagian linear } \\bar v' = B\\bar v \\text{ (4.2.3)}",
              '\\text{luas}\' = |\\det B|\\,\\text{luas},\\quad \\det B > 0 \\text{ langsung},\\ \\det B < 0 \\text{ tak langsung},\\ \\det B = 1 \\text{ ekuiafin}',
              '\\text{translasi: } B = I;\\quad \\text{homoteti pusat } O \\text{ rasio } k: B = kI;\\quad \\text{titik tetap: } (B - I)\\xi = -\\bar c',
            ],
            insight: {
              id: 'Teorema dasar 4.2.9: transformasi afin bidang ditentukan tunggal oleh tiga titik tak segaris beserta bayangannya. Contoh 4.2.10: A(0,0) → (1,1), B(1,0) → (−1,1), C(0,1) → (1,−1) memberi x′ = −2x + 1, y′ = −2y + 1.',
              en: 'Fundamental theorem 4.2.9: a plane affine map is uniquely fixed by three non-collinear points and their images. Example 4.2.10: A(0,0) → (1,1), B(1,0) → (−1,1), C(0,1) → (1,−1) gives x′ = −2x + 1, y′ = −2y + 1.',
            },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Transformasi ortogonal, isometri, kesebangunan (4.3)', en: 'Orthogonal transformations, isometries, similarities (4.3)' },
            intuition: {
              id: 'Transformasi ortogonal (isometri) mengawetkan hasil kali skalar, jadi jarak dan sudut; matriksnya memenuhi BᵗB = I sehingga det B = ±1. Yang +1 disebut gerak (rotasi, translasi); yang −1 melibatkan pencerminan. Teorema 4.3.9: setiap transformasi ortogonal adalah komposisi beberapa pencerminan (di bidang: paling banyak tiga). Kesebangunan = ortogonal ∘ homoteti, mengalikan semua jarak dengan k.',
              en: 'An orthogonal transformation (isometry) preserves the scalar product, hence distances and angles; its matrix satisfies BᵗB = I so det B = ±1. Those with +1 are motions (rotations, translations); those with −1 involve a reflection. Theorem 4.3.9: every orthogonal transformation is a composition of reflections (in the plane: at most three). A similarity = orthogonal ∘ homothety, scaling all distances by k.',
            },
            formulas: [
              "B^tB = I,\\ \\det B = \\pm 1;\\qquad \\text{rotasi (4.3.1): } x' = x\\cos\\theta - y\\sin\\theta,\\ y' = x\\sin\\theta + y\\cos\\theta",
              "\\text{simetri thd sumbu } x: x' = x,\\ y' = -y;\\quad \\text{thd bidang } z = c: z' = -z + 2c;\\quad \\sigma\\circ\\sigma = \\mathrm{id}",
              '\\text{kesebangunan: } B = kQ,\\ Q^tQ = I,\\ k > 0;\\qquad \\text{inversi kutub } O \\text{ kuasa } k: \\overline{OM}\\cdot\\overline{OM\'} = k \\ (\\text{bukan afin})',
            ],
            insight: {
              id: 'Prop. 4.3.8: isometri tak langsung bidang dengan titik tetap adalah rotasi ∘ pencerminan pada garis melalui titik itu. Setiap gerak = rotasi ∘ translasi; di ruang setiap rotasi berpusat punya sumbu (4.3.5).',
              en: 'Prop. 4.3.8: an indirect plane isometry with a fixed point is a rotation ∘ reflection in a line through that point. Every motion = rotation ∘ translation; in space every rotation about a point has an axis (4.3.5).',
            },
            pitfall: {
              id: 'Homoteti dengan |k| ≠ 1 adalah afin tetapi tidak ortogonal (panjang berubah). Sebaliknya setiap transformasi ortogonal otomatis afin.',
              en: 'A homothety with |k| ≠ 1 is affine but not orthogonal (lengths change). Conversely every orthogonal transformation is automatically affine.',
            },
            lab: '#/app/geometry',
          },
        ],
      },
    ],
  },
  // =====================================================================================
  {
    id: 'algebra',
    title: { id: 'Aljabar', en: 'Algebra' },
    source: 'Herstein, Abstract Algebra, 3rd ed.',
    parts: [
      {
        title: { id: 'Grup (Bab 2)', en: 'Groups (Chapter 2)' },
        entries: [
          {
            title: { id: 'Definisi, contoh, sifat dasar (2.1-2.2)', en: 'Definition, examples, basic properties (2.1-2.2)' },
            intuition: {
              id: 'Herstein memulai dari A(S), himpunan bijeksi S → S dengan komposisi, lalu mengambil empat sifat yang membuatnya "berjalan": tertutup, asosiatif, ada identitas, ada invers. Itulah grup. Perkalian grup tidak harus komutatif; contohnya S₃ (orde 6, terkecil yang tak-abelian) dan grup dihedral. Sifat dasar (2.2.1-2.2.2): identitas dan invers tunggal, (ab)⁻¹ = b⁻¹a⁻¹, dan hukum kanselasi.',
              en: 'Herstein starts from A(S), the bijections S → S under composition, and extracts the four properties that make it "work": closure, associativity, an identity, inverses. That is a group. The product need not commute; witness S₃ (order 6, the smallest non-abelian group) and the dihedral groups. Basic facts (2.2.1-2.2.2): identity and inverses are unique, (ab)⁻¹ = b⁻¹a⁻¹, and cancellation holds.',
            },
            formulas: [
              '(ab)c = a(bc),\\quad ae = ea = a,\\quad aa^{-1} = a^{-1}a = e;\\qquad ab = ac \\Rightarrow b = c,\\quad (ab)^{-1} = b^{-1}a^{-1}',
              'a^n = \\underbrace{a\\cdots a}_{n},\\ a^{-n} = (a^{-1})^n,\\ a^m a^n = a^{m+n};\\qquad \\text{abelian} \\iff ab = ba\\ \\forall a, b',
              '\\text{contoh: } (\\mathbb{Z}, +),\\ (\\mathbb{Q}^*, \\cdot),\\ E_n = \\{e^{2\\pi i k/n}\\},\\ S_n,\\ D_n\\ (|D_n| = 2n),\\ T_{a,b}: r \\mapsto ar + b',
            ],
            insight: {
              id: 'Untuk membuktikan sesuatu himpunan grup, tiga dari empat aksioma biasanya jelas; yang sering gagal adalah invers (Z terhadap perkalian) atau asosiativitas (a ∗ b = a²b). Selalu tunjukkan kandidat inversnya secara eksplisit.',
              en: 'To prove a set is a group, three of the four axioms are usually obvious; the one that typically fails is inverses (Z under multiplication) or associativity (a ∗ b = a²b). Always exhibit the candidate inverse explicitly.',
            },
            pitfall: {
              id: 'ab = ca tidak boleh dikanselasi menjadi b = c (kanselasi hanya di sisi yang sama). Dan (ab)ⁿ = aⁿbⁿ hanya di grup abelian.',
              en: 'ab = ca cannot be cancelled to b = c (cancellation works only on the same side). And (ab)ⁿ = aⁿbⁿ only holds in abelian groups.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Subgrup dan grup siklik (2.3)', en: 'Subgroups and cyclic groups (2.3)' },
            intuition: {
              id: 'Subgrup adalah subhimpunan yang sendiri grup dengan operasi yang sama; asosiativitas otomatis, jadi cukup periksa tertutup dan invers (Lemma 2.3.1), dan untuk himpunan berhingga cukup tertutup saja (Lemma 2.3.2). Satu unsur a membangkitkan subgrup siklik (a) = {aⁱ}; ukurannya adalah orde a. Contoh penting: sentralisator C(a), pusat Z(G), dan konjugat a⁻¹Ha.',
              en: 'A subgroup is a subset that is itself a group under the same operation; associativity is inherited, so only closure and inverses need checking (Lemma 2.3.1), and for finite subsets closure alone suffices (Lemma 2.3.2). One element a generates the cyclic subgroup (a) = {aⁱ}; its size is the order of a. Important examples: the centraliser C(a), the centre Z(G), and conjugates a⁻¹Ha.',
            },
            formulas: [
              'H \\le G \\iff H \\ne \\varnothing,\\ a, b \\in H \\Rightarrow ab \\in H,\\ a \\in H \\Rightarrow a^{-1} \\in H\\ (\\text{berhingga: cukup tertutup, 2.3.2})',
              '(a) = \\{a^i : i \\in \\mathbb{Z}\\},\\qquad o(a) = \\min\\{m > 0 : a^m = e\\} = |(a)|,\\qquad a^k = e \\Rightarrow o(a) \\mid k',
              'C(a) = \\{g \\in G : ga = ag\\} \\le G,\\quad Z(G) = \\bigcap_a C(a),\\quad a^{-1}Ha \\le G,\\quad H \\cap K \\le G',
            ],
            insight: {
              id: 'Teorema 2.3.5: setiap subgrup grup siklik siklik. Zₙ = ([1]) mempunyai tepat satu subgrup untuk tiap pembagi d dari n, yaitu ([n/d]), dan φ(n) pembangkit.',
              en: 'Theorem 2.3.5: every subgroup of a cyclic group is cyclic. Zₙ = ([1]) has exactly one subgroup for each divisor d of n, namely ([n/d]), and φ(n) generators.',
            },
            pitfall: {
              id: 'Gabungan dua subgrup umumnya bukan subgrup (irisannya ya). Dalam grup tak-abelian, a⁻¹Ha bisa berbeda dari H walaupun ordenya sama.',
              en: 'The union of two subgroups is generally not a subgroup (the intersection is). In a non-abelian group a⁻¹Ha may differ from H even though it has the same order.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Koset, Teorema Lagrange, Euler-Fermat (2.4)', en: 'Cosets, Lagrange\'s theorem, Euler-Fermat (2.4)' },
            intuition: {
              id: 'Relasi a ~ b iff ab⁻¹ ∈ H adalah relasi ekuivalensi (Contoh 3 §2.4), dan kelasnya adalah koset kanan Ha = {ha}. Kelas-kelas suatu relasi ekuivalensi mempartisi himpunan (2.4.1); tiap koset berukuran |H| karena h ↦ ha satu-satu. Jadi |G| = (banyak koset) · |H|: Lagrange. Semua akibatnya adalah pembagian: o(a) | |G|, a^{|G|} = e, grup berorde prima siklik, dan a^{φ(n)} ≡ 1 (mod n).',
              en: 'The relation a ~ b iff ab⁻¹ ∈ H is an equivalence relation (Example 3 of §2.4), and its classes are the right cosets Ha = {ha}. Equivalence classes partition the set (2.4.1); each coset has |H| elements since h ↦ ha is one-to-one. Hence |G| = (number of cosets) · |H|: Lagrange. Everything that follows is a divisibility statement: o(a) | |G|, a^{|G|} = e, groups of prime order are cyclic, and a^{φ(n)} ≡ 1 (mod n).',
            },
            formulas: [
              'Ha = \\{ha : h \\in H\\},\\qquad Ha = Hb \\iff ab^{-1} \\in H,\\qquad Ha \\cap Hb \\ne \\varnothing \\Rightarrow Ha = Hb',
              '|G| = i_G(H)\\,|H| \\ (2.4.2);\\qquad o(a) \\mid |G| \\ (2.4.4);\\qquad a^{|G|} = e \\ (2.4.5);\\qquad |G| = p \\Rightarrow G \\text{ siklik} \\ (2.4.3)',
              'U_n = \\{[a] : \\gcd(a, n) = 1\\},\\ |U_n| = \\varphi(n) \\ (2.4.7);\\qquad a^{\\varphi(n)} \\equiv 1 \\ (\\mathrm{mod}\\ n) \\ (\\text{Euler 2.4.8}),\\quad a^{p-1} \\equiv 1 \\ (\\mathrm{mod}\\ p) \\ (\\text{Fermat})',
            ],
            insight: {
              id: 'Contoh: U₈ = {1, 3, 5, 7} dengan a² = 1 untuk semua a, jadi tidak siklik; U₉ = ([2]) siklik berorde 6. Kebalikan Lagrange gagal: grup berorde 12 (A₄) tidak punya subgrup berorde 6.',
              en: 'Example: U₈ = {1, 3, 5, 7} with a² = 1 for all a, hence not cyclic; U₉ = ([2]) is cyclic of order 6. The converse of Lagrange fails: a group of order 12 (A₄) has no subgroup of order 6.',
            },
            pitfall: {
              id: 'Koset kiri aH dan kanan Ha bisa berbeda. Di S₃ dengan H = {i, f}: gH = {g, gf} tetapi Hg = {g, fg} = {g, g²f} ≠ gH (Soal 2.4.6-7).',
              en: 'Left cosets aH and right cosets Ha can differ. In S₃ with H = {i, f}: gH = {g, gf} but Hg = {g, fg} = {g, g²f} ≠ gH (Problems 2.4.6-7).',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Homomorfisma dan subgrup normal (2.5)', en: 'Homomorphisms and normal subgroups (2.5)' },
            intuition: {
              id: 'Homomorfisma φ mengawetkan operasi, φ(ab) = φ(a)φ(b); ia "melupakan" sebagian struktur, dan kernel Ker φ = {a : φ(a) = e′} mengukur berapa banyak yang dilupakan: φ satu-satu iff Ker φ = {e}. Kernel selalu memiliki sifat a⁻¹Ka ⊂ K (2.5.5), dan subgrup dengan sifat itu disebut normal. Teorema 2.5.6: N normal iff setiap koset kiri adalah koset kanan. Cayley (2.5.1): setiap grup isomorfik dengan grup permutasi, lewat a ↦ T_a (perkalian kiri).',
              en: 'A homomorphism φ preserves the operation, φ(ab) = φ(a)φ(b); it "forgets" some structure, and the kernel Ker φ = {a : φ(a) = e′} measures how much: φ is one-to-one iff Ker φ = {e}. Kernels always satisfy a⁻¹Ka ⊂ K (2.5.5), and subgroups with that property are called normal. Theorem 2.5.6: N is normal iff every left coset is a right coset. Cayley (2.5.1): every group is isomorphic to a permutation group, via a ↦ T_a (left multiplication).',
            },
            formulas: [
              "\\varphi(ab) = \\varphi(a)\\varphi(b);\\quad \\varphi(e) = e',\\ \\varphi(a^{-1}) = \\varphi(a)^{-1} \\ (2.5.2);\\quad \\varphi(G) \\le G' \\ (2.5.3)",
              "\\operatorname{Ker}\\varphi = \\{a : \\varphi(a) = e'\\} \\le G,\\quad a^{-1}(\\operatorname{Ker}\\varphi)a \\subset \\operatorname{Ker}\\varphi \\ (2.5.5);\\quad \\varphi \\text{ 1-1} \\iff \\operatorname{Ker}\\varphi = \\{e\\}",
              'N \\lhd G \\iff a^{-1}Na \\subset N\\ \\forall a \\iff aN = Na\\ \\forall a \\ (2.5.6);\\qquad Z(G) \\lhd G,\\ \\{i, g, g^2\\} \\lhd S_3',
            ],
            insight: {
              id: 'Isomorfisma = homomorfisma bijektif: G ≅ G′ berarti G′ hanyalah G dengan nama unsur yang diganti. Untuk membuktikan G ≇ G′ cari sifat struktural yang berbeda: orde, keabelan, banyaknya unsur berorde tertentu.',
              en: 'An isomorphism is a bijective homomorphism: G ≅ G′ means G′ is just G with its elements relabelled. To prove G ≇ G′ find a structural property that differs: order, commutativity, the number of elements of a given order.',
            },
            pitfall: {
              id: 'Di grup abelian setiap subgrup normal, tetapi kebalikannya salah: Q₈ (kuaternion) tak-abelian dan semua subgrupnya normal. a⁻¹Na = N sebagai himpunan tidak berarti a⁻¹na = n untuk tiap n.',
              en: 'In an abelian group every subgroup is normal, but the converse fails: Q₈ (quaternions) is non-abelian yet all its subgroups are normal. a⁻¹Na = N as sets does not mean a⁻¹na = n for each n.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Grup faktor dan teorema homomorfisma (2.6-2.7)', en: 'Factor groups and the homomorphism theorems (2.6-2.7)' },
            intuition: {
              id: 'Coba kalikan koset: [a][b] = [ab]. Ini terdefinisi dengan baik (tidak bergantung pada wakil) tepat ketika N normal, karena (Na)(Nb) = N(ab) memerlukan aN = Na. Hasilnya grup faktor G/N, dan ψ: a ↦ Na adalah homomorfisma onto dengan kernel N (2.6.2). Jadi subgrup normal dan kernel adalah konsep yang sama. Teorema homomorfisma pertama menutup lingkarannya: bayangan homomorfisma selalu "G dengan kernelnya dilenyapkan".',
              en: 'Try to multiply cosets: [a][b] = [ab]. This is well defined (independent of representatives) exactly when N is normal, since (Na)(Nb) = N(ab) needs aN = Na. The result is the factor group G/N, and ψ: a ↦ Na is an onto homomorphism with kernel N (2.6.2). So normal subgroups and kernels are one and the same concept. The first homomorphism theorem closes the loop: the image of a homomorphism is always "G with the kernel blotted out".',
            },
            formulas: [
              'N \\lhd G:\\ G/N = \\{Na : a \\in G\\},\\quad (Na)(Nb) = N(ab) \\ (2.6.1);\\qquad |G/N| = |G|/|N| \\ (2.6.3)',
              "\\text{Teorema 2.7.1: } \\varphi: G \\to G' \\text{ onto},\\ K = \\operatorname{Ker}\\varphi \\Rightarrow G/K \\cong G' \\text{ via } Ka \\mapsto \\varphi(a)",
              '\\text{2.7.2 (korespondensi): subgrup } G\' \\leftrightarrow \\text{subgrup } G \\supset K;\\quad \\text{2.7.3: } HN/N \\cong H/(H\\cap N);\\quad \\text{2.7.4: } (G/K)/(N/K) \\cong G/N',
            ],
            insight: {
              id: 'Contoh §2.7: φ(T_{a,b}) = a dari {T_{a,b}} onto R* punya kernel {T_{1,b}}, jadi G/K ≅ R*. Contoh 2: C*/{|z| = 1} ≅ R⁺ lewat z ↦ |z|. Teorema Cauchy (2.6.4, 2.8.2): jika p | |G| ada unsur berorde p; buktinya untuk kasus abelian memakai induksi lewat G/N.',
              en: 'Example in §2.7: φ(T_{a,b}) = a from {T_{a,b}} onto R* has kernel {T_{1,b}}, so G/K ≅ R*. Example 2: C*/{|z| = 1} ≅ R⁺ via z ↦ |z|. Cauchy\'s theorem (2.6.4, 2.8.2): if p | |G| there is an element of order p; the abelian case is proved by induction through G/N.',
            },
            pitfall: {
              id: 'G/N bukan subgrup dari G; unsurnya adalah koset. Dan G/N bisa abelian walau G tidak (S₃/A₃ ≅ Z₂), jadi "G/N abelian" hanya mengatakan komutator aba⁻¹b⁻¹ ∈ N (Soal 2.6.12-13).',
              en: 'G/N is not a subgroup of G; its elements are cosets. And G/N can be abelian while G is not (S₃/A₃ ≅ Z₂), so "G/N abelian" only says the commutators aba⁻¹b⁻¹ lie in N (Problems 2.6.12-13).',
            },
            lab: '#/app/algebra',
          },
        ],
      },
      {
        title: { id: 'Grup simetri (Bab 3)', en: 'The symmetric group (Chapter 3)' },
        entries: [
          {
            title: { id: 'Permutasi, siklus, orde (3.1-3.2)', en: 'Permutations, cycles, order (3.1-3.2)' },
            intuition: {
              id: 'Sₙ adalah A(S) untuk S = {1, …, n}, berorde n!. Herstein memakai konvensi kanan-ke-kiri, (στ)(s) = σ(τ(s)): τ bekerja dulu. Setiap permutasi memecah {1, …, n} menjadi orbit, dan pada tiap orbit ia berputar: itulah dekomposisi ke siklus-siklus saling lepas (3.2.2), tunggal kecuali urutannya. Siklus yang saling lepas komut, sehingga orde permutasi adalah KPK panjang siklusnya (3.2.4).',
              en: 'Sₙ is A(S) for S = {1, …, n}, of order n!. Herstein uses the right-to-left convention (στ)(s) = σ(τ(s)): τ acts first. Every permutation splits {1, …, n} into orbits, on each of which it cycles: that is the decomposition into disjoint cycles (3.2.2), unique up to order. Disjoint cycles commute, so the order of a permutation is the lcm of its cycle lengths (3.2.4).',
            },
            formulas: [
              '\\sigma = \\begin{pmatrix} 1 & 2 & \\cdots & n \\\\ \\sigma(1) & \\sigma(2) & \\cdots & \\sigma(n) \\end{pmatrix},\\qquad (\\sigma\\tau)(s) = \\sigma(\\tau(s)),\\qquad |S_n| = n!',
              '(a_1\\, a_2 \\cdots a_k):\\ a_1 \\mapsto a_2 \\mapsto \\cdots \\mapsto a_k \\mapsto a_1;\\quad (a_1 \\cdots a_k)^{-1} = (a_k \\cdots a_1);\\quad \\text{siklus lepas komut}',
              'o(\\sigma) = \\operatorname{lcm}(\\text{panjang siklus}) \\ (3.2.4);\\qquad \\text{contoh: } o\\big((1\\,2\\,3)(4\\,5)\\big) = 6,\\quad o(\\text{shuffle 13 kartu}) = 13',
            ],
            insight: {
              id: 'Contoh §3.1: σ = (2 3 1 5 4), τ = (3 4 5 1 2) memberi στ = (1 5 4 2 3) tetapi τσ = (4 5 3 2 1): tidak sama, Sₙ tak-abelian untuk n ≥ 3. Soal 3.2.5 dan seterusnya: Sₙ dibangkitkan oleh transposisi, bahkan oleh (1 2) dan (1 2 ⋯ n).',
              en: 'Example in §3.1: σ = (2 3 1 5 4), τ = (3 4 5 1 2) give στ = (1 5 4 2 3) but τσ = (4 5 3 2 1): not equal, Sₙ is non-abelian for n ≥ 3. Problems 3.2.5 ff.: Sₙ is generated by transpositions, even by (1 2) and (1 2 ⋯ n).',
            },
            pitfall: {
              id: 'Buku lain memakai konvensi kiri-ke-kanan; jawaban στ Anda akan terbalik jika konvensinya tertukar. Selalu nyatakan konvensi sebelum menghitung.',
              en: 'Other books use the left-to-right convention; your στ will come out reversed if the conventions are mixed. State the convention before computing.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Transposisi, paritas, grup alternating (3.2-3.3)', en: 'Transpositions, parity, the alternating group (3.2-3.3)' },
            intuition: {
              id: 'Setiap siklus adalah hasil kali transposisi: (a₁ a₂ ⋯ aₖ) = (a₁ aₖ)(a₁ aₖ₋₁)⋯(a₁ a₂), jadi k − 1 transposisi (3.2.5). Dekomposisinya tidak tunggal, tetapi paritas banyaknya transposisi selalu sama (3.3.1), sehingga "genap/ganjil" terdefinisi baik. Permutasi genap membentuk Aₙ, kernel dari homomorfisma tanda Sₙ → {1, −1}, karenanya normal berindeks 2.',
              en: 'Every cycle is a product of transpositions: (a₁ a₂ ⋯ aₖ) = (a₁ aₖ)(a₁ aₖ₋₁)⋯(a₁ a₂), i.e. k − 1 of them (3.2.5). The decomposition is not unique, but the parity of the count always is (3.3.1), so "even/odd" is well defined. Even permutations form Aₙ, the kernel of the sign homomorphism Sₙ → {1, −1}, hence normal of index 2.',
            },
            formulas: [
              '(a_1\\, a_2 \\cdots a_k) = (a_1\\, a_k)(a_1\\, a_{k-1})\\cdots(a_1\\, a_2);\\qquad \\text{paritas } \\sigma = \\sum_{\\text{siklus}} (\\text{panjang} - 1) \\bmod 2',
              '\\operatorname{sgn}: S_n \\to \\{1, -1\\} \\text{ homomorfisma},\\quad A_n = \\operatorname{Ker}(\\operatorname{sgn}) \\lhd S_n,\\quad |A_n| = \\frac{n!}{2} \\ (3.3.2)',
              '\\text{siklus panjang } k \\text{ genap} \\iff k \\text{ ganjil};\\qquad A_n \\ (n \\ge 5) \\text{ sederhana} \\ (3.3.4)',
            ],
            insight: {
              id: 'Cara tercepat menentukan paritas: hitung Σ(panjang siklus − 1). (1 2 3)(4 5) memberi 2 + 1 = 3, jadi ganjil. Hasil kali dua permutasi ganjil genap; jadi separuh Sₙ genap, separuh ganjil.',
              en: 'Fastest parity check: compute Σ(cycle length − 1). (1 2 3)(4 5) gives 2 + 1 = 3, so odd. The product of two odd permutations is even; hence half of Sₙ is even, half odd.',
            },
            pitfall: {
              id: 'Siklus berpanjang genap adalah permutasi ganjil (dan sebaliknya): (1 2 3 4) ganjil karena = 3 transposisi.',
              en: 'A cycle of even length is an odd permutation (and vice versa): (1 2 3 4) is odd since it equals 3 transpositions.',
            },
            lab: '#/app/algebra',
          },
        ],
      },
      {
        title: { id: 'Gelanggang (Bab 4)', en: 'Rings (Chapter 4)' },
        entries: [
          {
            title: { id: 'Definisi dan jenis gelanggang (4.1-4.2)', en: 'Definition and kinds of rings (4.1-4.2)' },
            intuition: {
              id: 'Gelanggang adalah grup abelian terhadap + dengan perkalian asosiatif yang terhubung ke + oleh distributivitas. Herstein sengaja tidak menuntut 1 maupun komutatif, agar matriks 2×2 dan kuaternion tercakup. Hierarkinya: gelanggang komutatif ⊃ daerah integral (tanpa pembagi nol) ⊃ lapangan (setiap unsur tak nol punya invers). Zₙ adalah laboratorium terbaik: Z₆ punya pembagi nol [2][3] = [0], Z₅ lapangan.',
              en: 'A ring is an abelian group under + with an associative multiplication tied to + by distributivity. Herstein deliberately does not demand a 1 or commutativity, so that 2×2 matrices and quaternions qualify. The hierarchy: commutative rings ⊃ integral domains (no zero divisors) ⊃ fields (every nonzero element invertible). Zₙ is the best laboratory: Z₆ has zero divisors [2][3] = [0], Z₅ is a field.',
            },
            formulas: [
              'a(b + c) = ab + ac,\\ (b + c)a = ba + ca;\\qquad a0 = 0,\\ a(-b) = -(ab),\\ (-a)(-b) = ab \\ (4.2.1)',
              '\\text{pembagi nol: } a \\ne 0,\\ ab = 0 \\text{ untuk suatu } b \\ne 0;\\quad \\text{daerah integral: komutatif tanpa pembagi nol};\\quad \\text{lapangan: gelanggang bagi komutatif}',
              '\\mathbb{Z}_p \\text{ lapangan (Fermat: } a^{p-2} = a^{-1});\\quad \\mathbb{Z}_n \\text{ lapangan} \\iff n \\text{ prima};\\quad \\text{daerah integral berhingga} \\Rightarrow \\text{lapangan (Soal 4.2.3)}',
            ],
            insight: {
              id: 'Di Zₙ, [a] unit iff gcd(a, n) = 1 dan pembagi nol iff gcd(a, n) > 1; setiap unsur tak nol adalah salah satunya. Contoh: unit Z₂₄ adalah 1, 5, 7, 11, 13, 17, 19, 23 (Soal 4.1.1).',
              en: 'In Zₙ, [a] is a unit iff gcd(a, n) = 1 and a zero divisor iff gcd(a, n) > 1; every nonzero element is one or the other. Example: the units of Z₂₄ are 1, 5, 7, 11, 13, 17, 19, 23 (Problem 4.1.1).',
            },
            pitfall: {
              id: 'Dalam gelanggang tak-komutatif (a + b)² = a² + ab + ba + b², bukan a² + 2ab + b² (Lemma 4.2.2). Dan ab = ac dengan a ≠ 0 hanya boleh dikanselasi di daerah integral.',
              en: 'In a non-commutative ring (a + b)² = a² + ab + ba + b², not a² + 2ab + b² (Lemma 4.2.2). And ab = ac with a ≠ 0 may only be cancelled in an integral domain.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Ideal, homomorfisma, gelanggang kuosien, ideal maksimal (4.3-4.4)', en: 'Ideals, homomorphisms, quotient rings, maximal ideals (4.3-4.4)' },
            intuition: {
              id: 'Kernel homomorfisma gelanggang bukan hanya subgrup aditif: ia "menelan" perkalian dari kiri dan kanan (ra, ar ∈ K). Subhimpunan dengan sifat itu disebut ideal, dan ia memainkan peran subgrup normal: R/I adalah gelanggang dengan (a + I)(b + I) = ab + I (4.3.2), dan semua teorema homomorfisma berlaku. Lapangan hanya punya ideal (0) dan R; karena itu R/M lapangan iff M maksimal (4.4.2-4.4.3), jalan utama untuk membangun lapangan baru.',
              en: 'The kernel of a ring homomorphism is more than an additive subgroup: it "swallows" multiplication from both sides (ra, ar ∈ K). Subsets with that property are ideals, and they play the role of normal subgroups: R/I is a ring with (a + I)(b + I) = ab + I (4.3.2), and all homomorphism theorems carry over. A field has only the ideals (0) and R; hence R/M is a field iff M is maximal (4.4.2-4.4.3), the main road to constructing new fields.',
            },
            formulas: [
              '\\varphi(a + b) = \\varphi(a) + \\varphi(b),\\ \\varphi(ab) = \\varphi(a)\\varphi(b);\\qquad I \\text{ ideal} \\iff (I, +) \\le (R, +),\\ rI \\subset I,\\ Ir \\subset I',
              'R/I = \\{a + I\\},\\ (a + I)(b + I) = ab + I;\\qquad R/\\operatorname{Ker}\\varphi \\cong \\varphi(R) \\ (4.3.3);\\qquad \\mathbb{Z}/(n) \\cong \\mathbb{Z}_n',
              'M \\text{ maksimal} \\iff R/M \\text{ lapangan} \\ (R \\text{ komutatif dengan 1});\\qquad \\text{ideal maksimal } \\mathbb{Z} = (p),\\ p \\text{ prima}',
            ],
            insight: {
              id: 'Ideal Zₙ tepat adalah (d) dengan d | n, dan Zₙ/(d) ≅ Z_d. Contoh 4.4.2: M = {a + bi : 3 | a, 3 | b} maksimal di Z[i] dan Z[i]/M lapangan bersembilan unsur; tetapi (5) tidak maksimal karena 5 = (2 + i)(2 − i).',
              en: 'The ideals of Zₙ are exactly (d) with d | n, and Zₙ/(d) ≅ Z_d. Example 4.4.2: M = {a + bi : 3 | a, 3 | b} is maximal in Z[i] and Z[i]/M is a field with nine elements; but (5) is not maximal since 5 = (2 + i)(2 − i).',
            },
            pitfall: {
              id: 'Subgelanggang bukan ideal: Z ⊂ Q adalah subgelanggang tetapi ½ · 1 ∉ Z. Untuk ideal periksa perkalian oleh sembarang r ∈ R, bukan hanya oleh unsur I.',
              en: 'A subring is not an ideal: Z ⊂ Q is a subring but ½ · 1 ∉ Z. For an ideal check multiplication by arbitrary r ∈ R, not just by elements of I.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Gelanggang polinom F[x] (4.5)', en: 'Polynomial rings F[x] (4.5)' },
            intuition: {
              id: 'F[x] meniru Z hampir sempurna, dengan derajat menggantikan nilai mutlak: deg(fg) = deg f + deg g (4.5.2) membuatnya daerah integral, algoritma pembagian (4.5.5) memberi f = qg + r dengan deg r < deg g, dan dari situ setiap ideal utama (4.5.6), gcd ada dan berbentuk af + bg (4.5.7), lalu polinom tak tereduksi berperan sebagai "prima" dengan faktorisasi tunggal (4.5.12). Puncaknya: (p) maksimal iff p tak tereduksi (4.5.11), jadi F[x]/(p) lapangan.',
              en: 'F[x] mimics Z almost perfectly, with degree replacing absolute value: deg(fg) = deg f + deg g (4.5.2) makes it an integral domain, the division algorithm (4.5.5) gives f = qg + r with deg r < deg g, whence every ideal is principal (4.5.6), gcds exist and have the form af + bg (4.5.7), and irreducible polynomials play the role of "primes" with unique factorisation (4.5.12). The climax: (p) is maximal iff p is irreducible (4.5.11), so F[x]/(p) is a field.',
            },
            formulas: [
              'f = qg + r,\\ r = 0 \\text{ atau } \\deg r < \\deg g \\ (4.5.5);\\qquad I \\ne (0) \\Rightarrow I = (g(x)) \\ (4.5.6);\\qquad \\gcd = af + bg \\ (4.5.7)',
              'p \\text{ tak tereduksi} \\iff \\text{tidak ada faktorisasi } p = ab,\\ \\deg a, \\deg b \\ge 1;\\qquad (p) \\text{ maksimal} \\iff p \\text{ tak tereduksi} \\ (4.5.11)',
              'f = a\\,p_1^{m_1}\\cdots p_k^{m_k} \\text{ tunggal} \\ (4.5.12);\\qquad |\\mathbb{Z}_p[x]/(q)| = p^{\\deg q}\\ (\\text{Soal 4.5.15-16})',
            ],
            insight: {
              id: 'Contoh 4.5: x⁴ − 7x + 1 = (2x² + 1)(½x² − ¼) + (−7x + 5/4). Ketertereduksian bergantung pada lapangan: x² − 2 tak tereduksi atas Q, tetapi = (x − √2)(x + √2) atas R. Derajat ≤ 3 tak tereduksi iff tidak punya akar di F (Soal 4.5.11).',
              en: 'Example in 4.5: x⁴ − 7x + 1 = (2x² + 1)(½x² − ¼) + (−7x + 5/4). Irreducibility depends on the field: x² − 2 is irreducible over Q but = (x − √2)(x + √2) over R. Degree ≤ 3 is irreducible iff it has no root in F (Problem 4.5.11).',
            },
            pitfall: {
              id: 'Uji "tanpa akar" hanya cukup untuk derajat 2 dan 3. x⁴ + 4 tidak punya akar real tetapi = (x² + 2x + 2)(x² − 2x + 2) atas Q.',
              en: 'The "no roots" test suffices only for degrees 2 and 3. x⁴ + 4 has no real roots yet = (x² + 2x + 2)(x² − 2x + 2) over Q.',
            },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Polinom atas Q: Gauss dan Eisenstein (4.6)', en: 'Polynomials over Q: Gauss and Eisenstein (4.6)' },
            intuition: {
              id: 'Dua hasil khas Q. Lemma Gauss (4.6.3): polinom monik dengan koefisien bulat yang terfaktor atas Q sudah terfaktor atas Z dengan faktor monik bulat; jadi cukup mencari faktor bulat. Kriteria Eisenstein (4.6.4): kalau satu prima p membagi semua koefisien kecuali yang tertinggi, dan p² tidak membagi konstanta, polinomnya tak tereduksi. Buktinya lewat reduksi modulo p: Z[x]/(p)[x] ≅ Z_p[x] daerah integral (4.6.2).',
              en: 'Two results special to Q. Gauss\'s lemma (4.6.3): a monic integer polynomial that factors over Q already factors over Z with monic integer factors; so it suffices to look for integer factors. Eisenstein\'s criterion (4.6.4): if one prime p divides every coefficient but the leading one, and p² does not divide the constant term, the polynomial is irreducible. The proof reduces modulo p: Z[x]/(p)[x] ≅ Z_p[x] is an integral domain (4.6.2).',
            },
            formulas: [
              'f(x) = \\frac{u}{m}(a_0x^n + \\cdots + a_n),\\ \\gcd(a_i) = 1 \\ (4.6.1);\\qquad \\text{Gauss (4.6.3): } f \\in \\mathbb{Z}[x] \\text{ monik}, f = ab \\text{ atas } \\mathbb{Q} \\Rightarrow f = a_1 b_1,\\ a_1, b_1 \\in \\mathbb{Z}[x] \\text{ monik}',
              '\\text{Eisenstein (4.6.4): } p \\mid a_1, \\dots, a_n,\\ p \\nmid a_0,\\ p^2 \\nmid a_n \\Rightarrow f = a_0x^n + \\cdots + a_n \\text{ tak tereduksi atas } \\mathbb{Q}',
              '\\text{akar rasional } r/s \\text{ dari } f \\in \\mathbb{Z}[x]:\\ r \\mid a_n,\\ s \\mid a_0;\\qquad \\bar f \\in \\mathbb{Z}_p[x] \\text{ tak tereduksi (derajat sama)} \\Rightarrow f \\text{ tak tereduksi atas } \\mathbb{Q}',
            ],
            insight: {
              id: 'Contoh 4.6: xⁿ − p, x⁵ − 4x + 22 (p = 2), x¹¹ − 6x⁴ + 12x³ + 36x − 6 (p = 2 atau 3). Trik substitusi: x⁴ + x³ + x² + x + 1 tidak memenuhi Eisenstein, tetapi f(x + 1) = x⁴ + 5x³ + 10x² + 10x + 5 memenuhinya dengan p = 5, dan itu cukup (Soal 4.6.1, 4.6.5).',
              en: 'Examples in 4.6: xⁿ − p, x⁵ − 4x + 22 (p = 2), x¹¹ − 6x⁴ + 12x³ + 36x − 6 (p = 2 or 3). Substitution trick: x⁴ + x³ + x² + x + 1 fails Eisenstein, but f(x + 1) = x⁴ + 5x³ + 10x² + 10x + 5 satisfies it with p = 5, which is enough (Problems 4.6.1, 4.6.5).',
            },
            pitfall: {
              id: 'Eisenstein adalah syarat cukup, bukan perlu: x² + 1 tak tereduksi atas Q tanpa prima Eisenstein. Dan kriteria itu tidak memberi algoritma untuk Z_p[x]; di sana gunakan pencarian akar dan faktor.',
              en: 'Eisenstein is sufficient, not necessary: x² + 1 is irreducible over Q with no Eisenstein prime. And it gives no algorithm for Z_p[x]; there use root and factor searches.',
            },
            lab: '#/app/algebra',
          },
        ],
      },
    ],
  },
]
