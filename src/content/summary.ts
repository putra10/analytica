/**
 * Formula & theory summary for the three courses, in syllabus order.
 * Each entry: the idea in one breath, the formulas, and the one thing to remember.
 */
export interface Entry {
  title: { id: string; en: string }
  /** short "why / what" before the formulas */
  intuition: { id: string; en: string }
  formulas: string[]
  insight: { id: string; en: string }
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
  {
    id: 'complex',
    title: { id: 'Fungsi Kompleks', en: 'Complex Functions' },
    source: 'Brown & Churchill, Complex Variables and Applications (8th ed.)',
    parts: [
      {
        title: { id: 'Bilangan kompleks (Modul 01-05)', en: 'Complex numbers (Modules 01-05)' },
        entries: [
          {
            title: { id: 'Aljabar, modulus, konjugat', en: 'Algebra, modulus, conjugate' },
            intuition: { id: 'Bilangan kompleks adalah pasangan real dengan aturan i² = −1; modulus adalah jarak ke titik asal dan konjugat adalah pencerminan pada sumbu real.', en: 'A complex number is a pair of reals with the rule i² = −1; the modulus is the distance to the origin and the conjugate is the reflection in the real axis.' },
            formulas: ['z = x + iy,\\quad \\bar z = x - iy,\\quad |z|^2 = z\\bar z = x^2 + y^2', '\\frac{1}{z} = \\frac{\\bar z}{|z|^2},\\qquad |z_1 z_2| = |z_1||z_2|,\\qquad |z_1 + z_2| \\le |z_1| + |z_2|', '\\operatorname{Re} z = \\tfrac{z + \\bar z}{2},\\quad \\operatorname{Im} z = \\tfrac{z - \\bar z}{2i},\\quad \\big||z_1| - |z_2|\\big| \\le |z_1 - z_2|'],
            insight: { id: 'Untuk membagi, kalikan dengan konjugat penyebut. Ketaksamaan segitiga adalah alat utama untuk menaksir modulus.', en: 'To divide, multiply by the conjugate of the denominator. The triangle inequality is the main tool for bounding moduli.' },
          },
          {
            title: { id: 'Bentuk eksponensial dan argumen', en: 'Exponential form and argument' },
            intuition: { id: 'Perkalian lebih mudah dalam koordinat kutub: modulus dikalikan, sudut dijumlahkan.', en: 'Multiplication is easier in polar coordinates: moduli multiply, angles add.' },
            formulas: ['z = re^{i\\theta},\\quad e^{i\\theta} = \\cos\\theta + i\\sin\\theta,\\quad \\arg z = \\operatorname{Arg} z + 2n\\pi,\\ -\\pi < \\operatorname{Arg} z \\le \\pi', 'z_1 z_2 = r_1 r_2 e^{i(\\theta_1 + \\theta_2)},\\qquad \\frac{z_1}{z_2} = \\frac{r_1}{r_2} e^{i(\\theta_1 - \\theta_2)},\\qquad z^n = r^n e^{in\\theta}', '(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta \\quad\\text{(de Moivre)}'],
            insight: { id: 'arg(z₁z₂) = arg z₁ + arg z₂ berlaku sebagai himpunan; Arg (nilai utama) tidak selalu aditif.', en: 'arg(z₁z₂) = arg z₁ + arg z₂ holds as sets; Arg (the principal value) is not always additive.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Akar bilangan kompleks', en: 'Roots of complex numbers' },
            intuition: { id: 'Akar ke-n dari z₀ terletak pada lingkaran berjari-jari ⁿ√r₀, membentuk segi-n beraturan.', en: 'The n-th roots of z₀ sit on the circle of radius ⁿ√r₀ at the vertices of a regular n-gon.' },
            formulas: ['c_k = \\sqrt[n]{r_0}\\,\\exp\\!\\Big[i\\Big(\\frac{\\theta_0}{n} + \\frac{2k\\pi}{n}\\Big)\\Big],\\quad k = 0, 1, \\dots, n-1', '\\text{akar satuan: } \\omega_n = e^{2\\pi i/n},\\quad 1, \\omega_n, \\omega_n^2, \\dots, \\omega_n^{n-1}'],
            insight: { id: 'Semua akar diperoleh dari satu akar (nilai utama) dikalikan pangkat-pangkat ωₙ.', en: 'All roots come from one root (the principal one) times powers of ωₙ.' },
          },
          {
            title: { id: 'Daerah di bidang kompleks', en: 'Regions in the plane' },
            intuition: { id: 'Topologi dasar untuk limit dan analitisitas: lingkungan, titik interior, himpunan terbuka, terhubung, domain.', en: 'The basic topology needed for limits and analyticity: neighbourhoods, interior points, open sets, connectedness, domains.' },
            formulas: ['|z - z_0| < \\varepsilon \\ (\\text{lingkungan}),\\qquad 0 < |z - z_0| < \\varepsilon \\ (\\text{lingkungan terhapus})', '\\text{domain} = \\text{himpunan terbuka dan terhubung};\\quad \\text{terbatas} \\iff \\exists R: |z| < R'],
            insight: { id: 'Himpunan terbuka: setiap titiknya titik interior. Domain adalah "panggung" tempat fungsi analitik didefinisikan.', en: 'Open set: every point is interior. A domain is the "stage" on which analytic functions live.' },
          },
        ],
      },
      {
        title: { id: 'Fungsi analitik (Modul 06-09)', en: 'Analytic functions (Modules 06-09)' },
        entries: [
          {
            title: { id: 'Fungsi sebagai pemetaan', en: 'Functions as mappings' },
            intuition: { id: 'w = f(z) tidak bisa digrafikkan; kita lihat bayangan kurva dan daerah dari bidang z ke bidang w.', en: 'w = f(z) cannot be graphed; we look at images of curves and regions from the z-plane to the w-plane.' },
            formulas: ['f(z) = u(x, y) + i\\,v(x, y)', 'w = z^2:\\ u = x^2 - y^2,\\ v = 2xy;\\qquad w = e^z:\\ |w| = e^{x},\\ \\arg w = y'],
            insight: { id: 'Garis x = c dan y = c di bawah z² menjadi parabola; pita horizontal di bawah eᶻ menjadi sektor.', en: 'Under z² the lines x = c, y = c become parabolas; under eᶻ a horizontal strip becomes a sector.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Limit, kekontinuan, turunan', en: 'Limits, continuity, derivative' },
            intuition: { id: 'Sama seperti kalkulus real, tetapi z boleh mendekati z₀ dari segala arah: itulah yang membuat keterturunan kompleks jauh lebih kuat.', en: 'Same as real calculus, except z may approach z₀ from every direction: that is what makes complex differentiability so strong.' },
            formulas: ["f'(z_0) = \\lim_{\\Delta z \\to 0} \\frac{f(z_0 + \\Delta z) - f(z_0)}{\\Delta z}", '\\lim_{z \\to z_0} f(z) = w_0 \\iff \\lim u = u_0 \\text{ dan } \\lim v = v_0', '\\lim_{z\\to\\infty} f(z) = w_0 \\iff \\lim_{z \\to 0} f(1/z) = w_0'],
            insight: { id: 'Contoh klasik: f(z) = z̄ tidak mempunyai turunan di mana pun, karena limit sepanjang sumbu real (+1) dan imajiner (−1) berbeda.', en: 'Classic example: f(z) = z̄ has no derivative anywhere, since the limits along the real axis (+1) and imaginary axis (−1) differ.' },
          },
          {
            title: { id: 'Persamaan Cauchy-Riemann', en: 'Cauchy-Riemann equations' },
            intuition: { id: 'Turunan harus sama dari arah x dan arah iy; menyamakan keduanya memberi dua persamaan diferensial parsial.', en: 'The derivative must agree along the x and iy directions; equating the two gives two partial differential equations.' },
            formulas: ['u_x = v_y,\\qquad u_y = -v_x \\quad\\text{(perlu)}', "u_x, u_y, v_x, v_y \\text{ kontinu} + \\text{CR} \\Rightarrow f'(z_0) = u_x + i v_x \\quad\\text{(cukup)}", '\\text{kutub: } r u_r = v_\\theta,\\quad u_\\theta = -r v_r,\\qquad f\'(z_0) = e^{-i\\theta}(u_r + i v_r)'],
            insight: { id: 'CR adalah syarat perlu; bersama kekontinuan turunan parsial menjadi syarat cukup. f(z) = |z|² memenuhi CR hanya di 0.', en: 'CR is necessary; with continuous partials it becomes sufficient. f(z) = |z|² satisfies CR only at 0.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Fungsi analitik dan harmonik', en: 'Analytic and harmonic functions' },
            intuition: { id: 'Analitik = terturunkan di suatu lingkungan, bukan hanya di satu titik. Bagian real dan imajinernya otomatis memenuhi persamaan Laplace.', en: 'Analytic = differentiable throughout a neighbourhood, not just at a point. Its real and imaginary parts automatically satisfy Laplace\'s equation.' },
            formulas: ['u_{xx} + u_{yy} = 0,\\quad v_{xx} + v_{yy} = 0 \\quad (\\text{harmonik})', "f'(z) = 0 \\text{ pada domain } D \\Rightarrow f \\text{ konstan pada } D", 'f \\text{ analitik dan } |f| \\text{ konstan} \\Rightarrow f \\text{ konstan}'],
            insight: { id: 'v disebut konjugat harmonik dari u; ia ditemukan dengan mengintegrasikan persamaan CR.', en: 'v is called a harmonic conjugate of u; it is found by integrating the CR equations.' },
          },
        ],
      },
      {
        title: { id: 'Fungsi elementer (Modul 10-11)', en: 'Elementary functions (Modules 10-11)' },
        entries: [
          {
            title: { id: 'Eksponensial dan logaritma', en: 'Exponential and logarithm' },
            intuition: { id: 'eᶻ periodik dengan periode 2πi, sehingga logaritma bernilai banyak; nilai utama Log memilih −π < Arg z ≤ π.', en: 'eᶻ is 2πi-periodic, so the logarithm is multivalued; the principal value Log picks −π < Arg z ≤ π.' },
            formulas: ['e^z = e^x(\\cos y + i\\sin y),\\quad e^{z + 2\\pi i} = e^z,\\quad |e^z| = e^x', '\\log z = \\ln r + i(\\Theta + 2n\\pi),\\qquad \\operatorname{Log} z = \\ln r + i\\Theta', 'z^c = e^{c\\log z},\\qquad \\frac{d}{dz}\\operatorname{Log} z = \\frac{1}{z}\\ (|z|>0,\\ -\\pi < \\operatorname{Arg} z < \\pi)'],
            insight: { id: 'Log(z₁z₂) = Log z₁ + Log z₂ bisa gagal (selisih 2πi); untuk log bernilai banyak identitasnya berlaku sebagai himpunan.', en: 'Log(z₁z₂) = Log z₁ + Log z₂ can fail (by 2πi); for the multivalued log the identity holds as sets.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Trigonometri dan hiperbolik', en: 'Trigonometric and hyperbolic' },
            intuition: { id: 'Didefinisikan lewat eᶻ; identitas real tetap berlaku, tetapi sin dan cos tidak lagi terbatas.', en: 'Defined through eᶻ; the real identities survive, but sin and cos are no longer bounded.' },
            formulas: ['\\sin z = \\frac{e^{iz} - e^{-iz}}{2i},\\quad \\cos z = \\frac{e^{iz} + e^{-iz}}{2},\\quad \\sinh z = \\frac{e^z - e^{-z}}{2}', '\\sin z = \\sin x\\cosh y + i\\cos x\\sinh y,\\qquad |\\sin z|^2 = \\sin^2 x + \\sinh^2 y', '\\sin z = 0 \\iff z = n\\pi;\\qquad \\cos z = 0 \\iff z = \\tfrac{\\pi}{2} + n\\pi;\\qquad \\sin(iz) = i\\sinh z'],
            insight: { id: 'Nol dari sin dan cos hanya di sumbu real; |sin z| tumbuh seperti e^{|y|}/2 menjauhi sumbu real.', en: 'The zeros of sin and cos lie only on the real axis; |sin z| grows like e^{|y|}/2 away from it.' },
          },
        ],
      },
      {
        title: { id: 'Integral (Modul 12-16)', en: 'Integrals (Modules 12-16)' },
        entries: [
          {
            title: { id: 'Integral kontur dan taksiran modulus', en: 'Contour integrals and the ML bound' },
            intuition: { id: 'Integral sepanjang lintasan berparameter; nilainya bergantung pada lintasan kecuali jika integrannya analitik.', en: 'An integral along a parametrised path; it depends on the path unless the integrand is analytic.' },
            formulas: ["\\int_C f(z)\\,dz = \\int_a^b f(z(t))\\,z'(t)\\,dt", '\\Big|\\int_C f(z)\\,dz\\Big| \\le M L,\\quad |f(z)| \\le M \\text{ pada } C,\\ L = \\text{panjang } C', '\\int_C \\frac{dz}{z - z_0} = 2\\pi i \\ \\text{(lingkaran mengelilingi } z_0 \\text{ sekali, arah positif)}'],
            insight: { id: 'Taksiran ML adalah cara standar menunjukkan integral pada busur besar/kecil menuju nol.', en: 'The ML bound is the standard way to show integrals over large or small arcs vanish.' },
          },
          {
            title: { id: 'Antiturunan dan Cauchy-Goursat', en: 'Antiderivatives and Cauchy-Goursat' },
            intuition: { id: 'Jika f analitik di dalam dan pada kontur tertutup sederhana, tidak ada "yang mengganggu" di dalamnya, dan integralnya nol.', en: 'If f is analytic inside and on a simple closed contour, nothing "obstructs" inside, and the integral is zero.' },
            formulas: ["\\int_{z_1}^{z_2} f(z)\\,dz = F(z_2) - F(z_1) \\quad (F' = f \\text{ pada domain})", '\\oint_C f(z)\\,dz = 0 \\quad (f \\text{ analitik di dalam dan pada } C)', '\\oint_{C} f\\,dz = \\oint_{C_1} f\\,dz \\quad \\text{(deformasi kontur pada domain ganda-terhubung)}'],
            insight: { id: 'Tiga hal setara pada domain: f punya antiturunan, integral bebas lintasan, integral tertutup nol.', en: 'Three equivalent things on a domain: f has an antiderivative, integrals are path-independent, closed integrals vanish.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Rumus integral Cauchy dan akibatnya', en: 'Cauchy integral formula and consequences' },
            intuition: { id: 'Nilai f di dalam kontur ditentukan sepenuhnya oleh nilainya di kontur; turunan semua orde pun ada.', en: 'The values of f inside a contour are fixed by its values on the contour; derivatives of all orders exist.' },
            formulas: ['f(z_0) = \\frac{1}{2\\pi i}\\oint_C \\frac{f(z)}{z - z_0}\\,dz,\\qquad f^{(n)}(z_0) = \\frac{n!}{2\\pi i}\\oint_C \\frac{f(z)}{(z - z_0)^{n+1}}\\,dz', '|f^{(n)}(z_0)| \\le \\frac{n!\\,M_R}{R^n} \\ \\text{(Cauchy)},\\qquad \\text{Liouville: entire dan terbatas} \\Rightarrow \\text{konstan}', '\\text{Teorema dasar aljabar: polinom berderajat } n \\ge 1 \\text{ punya nol.}'],
            insight: { id: 'Analitik sekali berarti analitik tak hingga kali; ini tidak benar di kalkulus real.', en: 'Analytic once means analytic infinitely often; this fails in real calculus.' },
          },
        ],
      },
      {
        title: { id: 'Deret dan residu (Modul 17-19)', en: 'Series and residues (Modules 17-19)' },
        entries: [
          {
            title: { id: 'Deret Taylor dan Laurent', en: 'Taylor and Laurent series' },
            intuition: { id: 'Di cakram tempat f analitik, f adalah deret pangkatnya; di anulus, tambahkan pangkat negatif.', en: 'On a disc where f is analytic, f equals its power series; on an annulus, add negative powers.' },
            formulas: ['f(z) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(z_0)}{n!}(z - z_0)^n,\\quad |z - z_0| < R_0', 'f(z) = \\sum_{n=0}^\\infty a_n (z - z_0)^n + \\sum_{n=1}^\\infty \\frac{b_n}{(z - z_0)^n},\\quad R_1 < |z - z_0| < R_2', 'b_n = \\frac{1}{2\\pi i}\\oint_C \\frac{f(z)\\,dz}{(z - z_0)^{-n+1}},\\qquad e^{1/z} = 1 + \\frac{1}{z} + \\frac{1}{2!\\,z^2} + \\cdots'],
            insight: { id: 'Koefisien b₁ adalah residu. Dalam praktik deret Laurent didapat dari deret yang sudah dikenal (eʷ, 1/(1−w)), bukan dari rumus integral.', en: 'The coefficient b₁ is the residue. In practice Laurent series come from known series (eʷ, 1/(1−w)), not from the integral formula.' },
          },
          {
            title: { id: 'Tiga jenis titik singular terisolasi', en: 'Three types of isolated singularities' },
            intuition: { id: 'Lihat bagian utama deret Laurent: kosong, berhingga, atau tak hingga.', en: 'Look at the principal part of the Laurent series: empty, finite, or infinite.' },
            formulas: ['\\text{dapat dihapuskan: } b_n = 0\\ \\forall n \\quad (\\text{mis. } \\tfrac{\\sin z}{z})', '\\text{kutub orde } m: b_m \\ne 0,\\ b_n = 0\\ (n > m) \\quad (\\text{mis. } \\tfrac{1}{z^2})', '\\text{esensial: tak hingga banyak } b_n \\ne 0 \\quad (\\text{mis. } e^{1/z};\\ \\text{Casorati-Weierstrass, Picard})'],
            insight: { id: 'Di kutub, |f| → ∞; di singularitas esensial, f mendekati setiap nilai. Di titik yang dapat dihapuskan, f terbatas.', en: 'At a pole |f| → ∞; at an essential singularity f comes close to every value. At a removable one, f is bounded.' },
            lab: '#/app/complex',
          },
          {
            title: { id: 'Residu di kutub dan teorema residu', en: 'Residues at poles and the residue theorem' },
            intuition: { id: 'Integral tertutup hanya "melihat" koefisien 1/(z−z₀) dari tiap singularitas di dalamnya.', en: 'A closed integral only "sees" the 1/(z−z₀) coefficient of each singularity inside.' },
            formulas: ['\\oint_C f(z)\\,dz = 2\\pi i \\sum_{k=1}^n \\operatorname{Res}_{z = z_k} f(z)', '\\text{kutub sederhana: } \\operatorname{Res} = \\lim_{z\\to z_0}(z - z_0)f(z) = \\frac{p(z_0)}{q\'(z_0)}\\ \\text{untuk } f = \\frac{p}{q}', '\\text{kutub orde } m:\\ f(z) = \\frac{\\phi(z)}{(z - z_0)^m},\\ \\operatorname{Res} = \\frac{\\phi^{(m-1)}(z_0)}{(m-1)!}'],
            insight: { id: 'Nol berorde m dari q dengan p(z₀) ≠ 0 memberi kutub berorde m dari p/q. Zero dan pole adalah dua sisi mata uang yang sama.', en: 'A zero of order m of q with p(z₀) ≠ 0 gives a pole of order m of p/q. Zeros and poles are two sides of one coin.' },
            lab: '#/app/complex',
          },
        ],
      },
    ],
  },
  {
    id: 'geometry',
    title: { id: 'Geometri Analitik', en: 'Analytic Geometry' },
    source: 'Vaisman, Analytical Geometry (World Scientific, 1997)',
    parts: [
      {
        title: { id: 'Vektor dan geometri linear (Pekan 1-4)', en: 'Vectors and linear geometry (Weeks 1-4)' },
        entries: [
          {
            title: { id: 'Hasil kali vektor', en: 'Vector products' },
            intuition: { id: 'Hasil kali titik mengukur proyeksi dan sudut; hasil kali silang memberi normal dan luas; hasil kali tripel memberi volume dan uji kesebidangan.', en: 'The dot product measures projection and angle; the cross product gives a normal and an area; the triple product gives volume and a coplanarity test.' },
            formulas: ['\\bar u\\cdot\\bar v = |\\bar u||\\bar v|\\cos\\varphi,\\qquad |\\bar u\\times\\bar v| = |\\bar u||\\bar v|\\sin\\varphi', '(\\bar u, \\bar v, \\bar w) = \\bar u\\cdot(\\bar v\\times\\bar w) = \\det\\begin{pmatrix} u_1 & u_2 & u_3\\\\ v_1 & v_2 & v_3 \\\\ w_1 & w_2 & w_3\\end{pmatrix}', '\\bar u\\times(\\bar v\\times\\bar w) = (\\bar u\\cdot\\bar w)\\bar v - (\\bar u\\cdot\\bar v)\\bar w,\\qquad |\\bar u\\times\\bar v|^2 = |\\bar u|^2|\\bar v|^2 - (\\bar u\\cdot\\bar v)^2'],
            insight: { id: 'Hasil kali tripel nol ⇔ tiga vektor sebidang; itulah uji apakah dua garis berpotongan atau bersilangan.', en: 'Zero triple product ⇔ three vectors coplanar; that is the test for intersecting versus skew lines.' },
          },
          {
            title: { id: 'Garis dan bidang di R³', en: 'Lines and planes in R³' },
            intuition: { id: 'Garis = titik + arah; bidang = titik + normal (atau dua arah). Semua soal jarak/sudut kembali ke hasil kali titik dan silang.', en: 'Line = point + direction; plane = point + normal (or two directions). Every distance/angle problem reduces to dot and cross products.' },
            formulas: ['d:\\ \\bar r = \\bar r_0 + \\lambda\\bar v,\\quad \\frac{x - x_0}{l} = \\frac{y - y_0}{m} = \\frac{z - z_0}{n};\\qquad \\pi:\\ Ax + By + Cz + D = 0,\\ \\bar N(A,B,C)', '\\operatorname{dist}(M_0, \\pi) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}},\\qquad \\operatorname{dist}(M_0, d) = \\frac{|(\\bar r_0 - \\bar r_1)\\times\\bar v|}{|\\bar v|}', '\\operatorname{dist}(d_1, d_2) = \\frac{|(\\bar r_2 - \\bar r_1)\\cdot(\\bar v_1\\times\\bar v_2)|}{|\\bar v_1\\times\\bar v_2|},\\qquad \\sin\\angle(d,\\pi) = \\frac{|\\bar N\\cdot\\bar v|}{|\\bar N||\\bar v|}'],
            insight: { id: 'Dua garis: v₁×v₂ = 0 sejajar; tripel (r₂−r₁, v₁, v₂) = 0 berpotongan; selain itu bersilangan.', en: 'Two lines: v₁×v₂ = 0 parallel; triple product (r₂−r₁, v₁, v₂) = 0 intersecting; otherwise skew.' },
            lab: '#/app/geometry',
          },
        ],
      },
      {
        title: { id: 'Lingkaran dan bola (Pekan 5-7)', en: 'Circles and spheres (Weeks 5-7)' },
        entries: [
          {
            title: { id: 'Persamaan umum, kuasa titik, garis kutub', en: 'General equation, power of a point, polar' },
            intuition: { id: 'Ruas kiri persamaan umum yang dievaluasi di M adalah kuasa M: negatif di dalam, nol pada, positif di luar lingkaran.', en: 'The left-hand side of the general equation evaluated at M is the power of M: negative inside, zero on, positive outside the circle.' },
            formulas: ['x^2 + y^2 - 2\\alpha x - 2\\beta y + \\sigma = 0,\\quad A(\\alpha,\\beta),\\ \\rho^2 = \\alpha^2 + \\beta^2 - \\sigma', 'p(M, \\Gamma) = x_0^2 + y_0^2 - 2\\alpha x_0 - 2\\beta y_0 + \\sigma = \\overline{MP_1}\\cdot\\overline{MP_2}', '\\text{kutub } M_0:\\ x x_0 + y y_0 - \\alpha(x + x_0) - \\beta(y + y_0) + \\sigma = 0 \\ \\text{(polarisasi)}'],
            insight: { id: 'Polarisasi (x² → xx₀, x → (x+x₀)/2) memberi garis singgung jika M₀ pada lingkaran, dan garis kutub secara umum; titik-titik singgung dari M₀ terletak pada garis kutubnya.', en: 'Polarisation (x² → xx₀, x → (x+x₀)/2) gives the tangent when M₀ is on the circle and the polar in general; the contact points of tangents from M₀ lie on its polar.' },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Sumbu radikal dan pensil lingkaran', en: 'Radical axis and pencils of circles' },
            intuition: { id: 'Tempat kedudukan titik berkuasa sama terhadap dua lingkaran adalah garis; semua lingkaran melalui dua titik potong membentuk pensil.', en: 'Points of equal power with respect to two circles form a line; all circles through two intersection points form a pencil.' },
            formulas: ['2(\\alpha_2 - \\alpha_1)x + 2(\\beta_2 - \\beta_1)y - (\\sigma_2 - \\sigma_1) = 0 \\ \\text{(sumbu radikal)}', '\\lambda f_1(x, y) + \\mu f_2(x, y) = 0 \\ \\text{(pensil)},\\qquad \\text{bola: } (x-\\alpha)^2 + (y-\\beta)^2 + (z-\\gamma)^2 = \\rho^2'],
            insight: { id: 'Tiga lingkaran memberi pusat radikal; untuk bola konsepnya sama satu dimensi lebih tinggi (bidang radikal, sumbu radikal, pusat radikal).', en: 'Three circles give a radical centre; for spheres the same ideas move up one dimension (radical plane, axis, centre).' },
          },
        ],
      },
      {
        title: { id: 'Konik dan kuadrik (Pekan 9-13)', en: 'Conics and quadrics (Weeks 9-13)' },
        entries: [
          {
            title: { id: 'Persamaan kanonik', en: 'Canonical equations' },
            intuition: { id: 'Setiap konik/kuadrik tak-degenerasi mempunyai kerangka ortonormal tempat persamaannya paling sederhana.', en: 'Every nondegenerate conic/quadric has an orthonormal frame in which its equation is simplest.' },
            formulas: ['\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1,\\quad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1,\\quad y^2 = 2px \\qquad (c^2 = a^2 \\mp b^2,\\ e = c/a)', '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1,\\quad \\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = \\pm 1,\\quad \\frac{x^2}{a^2} \\pm \\frac{y^2}{b^2} = 2z', '\\text{hiperboloid 1 lembar dan paraboloid hiperbolik memuat dua keluarga garis (generator rektilinear)}'],
            insight: { id: 'Fokus dan direktriks: elips e < 1, parabola e = 1, hiperbola e > 1. Asimtot hiperbola: x/a ± y/b = 0.', en: 'Foci and directrices: ellipse e < 1, parabola e = 1, hyperbola e > 1. Asymptotes of the hyperbola: x/a ± y/b = 0.' },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Teori umum: matriks dan invarian', en: 'General theory: matrices and invariants' },
            intuition: { id: 'Tulis persamaan derajat dua sebagai bentuk kuadrat plus suku linear; matriks kecil A dan besar Ã menyimpan semua informasinya.', en: 'Write the degree-two equation as a quadratic form plus linear terms; the small matrix A and large matrix Ã carry all the information.' },
            formulas: ['a_{11}x^2 + a_{22}y^2 + 2a_{12}xy + 2a_{10}x + 2a_{20}y + a_{00} = 0,\\quad \\xi^t A\\xi + 2a^t\\xi + \\alpha = 0,\\quad \\mathcal X^t\\tilde A\\mathcal X = 0', 'A = (a_{ij})_{i,j\\ge 1},\\quad \\tilde A = \\begin{pmatrix} A & a \\\\ a^t & a_{00}\\end{pmatrix},\\qquad \\delta = \\det A,\\ \\Delta = \\det\\tilde A,\\ I = \\operatorname{tr} A', '\\text{pusat: } A\\xi + a = 0 \\ (\\text{tunggal iff } \\delta \\ne 0);\\quad \\text{arah utama: } A\\bar v = s\\bar v,\\ \\det(A - sI) = 0'],
            insight: { id: 'I, δ, Δ invarian ortogonal; tanda Δ dan ke-nol-an δ invarian afin. Δ ≠ 0 ⇔ tak-degenerasi.', en: 'I, δ, Δ are orthogonal invariants; the sign of Δ and the vanishing of δ are affine invariants. Δ ≠ 0 ⇔ nondegenerate.' },
            lab: '#/app/geometry',
          },
          {
            title: { id: 'Klasifikasi (Teorema 3.4.5 dan 3.4.6)', en: 'Classification (Theorems 3.4.5 and 3.4.6)' },
            intuition: { id: 'Reduksi: cari nilai/vektor eigen A, pindahkan ke pusat (atau puncak), putar ke arah utama. Jenisnya terbaca dari tanda-tanda.', en: 'Reduction: find the eigenvalues/eigenvectors of A, translate to the centre (or vertex), rotate to the principal directions. The type is read off from signs.' },
            formulas: ['\\text{konik: } \\Delta\\ne0:\\ \\delta>0 \\text{ elips},\\ \\delta<0 \\text{ hiperbola},\\ \\delta=0 \\text{ parabola};\\quad \\Delta=0:\\ \\text{pasangan garis}', 's_1 x\'^2 + s_2 y\'^2 + \\frac{\\Delta}{\\delta} = 0 \\ (\\delta\\ne0),\\qquad s\\,y\'^2 = 2\\sqrt{-\\Delta/I}\\;x\' \\ (\\text{parabola})', '\\text{kuadrik: } \\Delta<0,\\delta\\ne0 \\text{ elipsoid / hiperboloid 2 lembar};\\ \\Delta>0,\\delta\\ne0 \\text{ hiperboloid 1 lembar};\\ \\delta=0: \\text{paraboloid, silinder}'],
            insight: { id: 'Metode Gauss (melengkapkan kuadrat) memberi jenis afin; metode nilai eigen memberi jenis ortogonal beserta ukurannya. Keduanya sama jenisnya (Prop. 3.4.7).', en: 'Completing squares (Gauss) gives the affine type; the eigenvalue method gives the orthogonal type with sizes. The types agree (Prop. 3.4.7).' },
            lab: '#/app/geometry',
          },
        ],
      },
      {
        title: { id: 'Transformasi geometri (Pekan 14-15)', en: 'Geometric transformations (Weeks 14-15)' },
        entries: [
          {
            title: { id: 'Afin versus ortogonal', en: 'Affine versus orthogonal' },
            intuition: { id: 'Afin mengawetkan garis, kesejajaran, dan perbandingan; ortogonal juga mengawetkan jarak dan sudut.', en: 'Affine maps preserve lines, parallelism and ratios; orthogonal maps also preserve distances and angles.' },
            formulas: ["\\bar r' = B\\bar r + \\bar c,\\quad \\det B \\ne 0 \\ \\text{(afin)};\\qquad B^tB = I \\ \\text{(ortogonal)},\\ \\det B = \\pm 1", '\\text{luas}\' = |\\det B|\\cdot\\text{luas};\\qquad \\text{titik tetap: } (B - I)\\xi = -\\bar c', '\\text{rotasi: } B = \\begin{pmatrix}\\cos\\theta & -\\sin\\theta\\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix};\\quad \\text{setiap transformasi ortogonal bidang = komposisi } \\le 3 \\text{ simetri}'],
            insight: { id: 'det B = +1: langsung (rotasi); −1: tak langsung (pencerminan / pencerminan geser). Kesebangunan: B = kQ dengan Q ortogonal.', en: 'det B = +1: direct (rotation); −1: indirect (reflection / glide reflection). Similarity: B = kQ with Q orthogonal.' },
            lab: '#/app/geometry',
          },
        ],
      },
    ],
  },
  {
    id: 'algebra',
    title: { id: 'Aljabar', en: 'Algebra' },
    source: 'Herstein, Abstract Algebra (3rd ed.)',
    parts: [
      {
        title: { id: 'Grup (Bab 2)', en: 'Groups (Chapter 2)' },
        entries: [
          {
            title: { id: 'Definisi dan sifat dasar', en: 'Definition and basic properties' },
            intuition: { id: 'Sebuah himpunan dengan satu operasi yang asosiatif, punya identitas, dan setiap unsur punya invers. Simetri-simetri suatu objek selalu membentuk grup.', en: 'A set with one associative operation, an identity, and inverses. The symmetries of any object form a group.' },
            formulas: ['(ab)c = a(bc),\\quad ae = ea = a,\\quad aa^{-1} = a^{-1}a = e', '(ab)^{-1} = b^{-1}a^{-1},\\qquad ab = ac \\Rightarrow b = c \\ \\text{(kanselasi)}', 'o(a) = \\min\\{n > 0 : a^n = e\\},\\qquad a^m = e \\Rightarrow o(a) \\mid m'],
            insight: { id: 'Abelian jika ab = ba untuk semua a, b. Contoh tak-abelian terkecil: S₃ (orde 6).', en: 'Abelian if ab = ba for all a, b. Smallest non-abelian example: S₃ (order 6).' },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Subgrup, grup siklik', en: 'Subgroups, cyclic groups' },
            intuition: { id: 'Subgrup = subhimpunan yang sendiri merupakan grup dengan operasi yang sama. Unsur tunggal membangkitkan subgrup siklik.', en: 'A subgroup is a subset that is itself a group under the same operation. A single element generates a cyclic subgroup.' },
            formulas: ['H \\le G \\iff H \\ne \\varnothing,\\ a, b \\in H \\Rightarrow ab \\in H,\\ a^{-1} \\in H \\quad (\\text{berhingga: cukup tertutup})', '(a) = \\{a^i : i \\in \\mathbb{Z}\\},\\qquad |(a)| = o(a)', 'C(a) = \\{g : ga = ag\\},\\quad Z(G) = \\{z : zx = xz\\ \\forall x\\},\\quad a^{-1}Ha \\le G'],
            insight: { id: 'Setiap subgrup grup siklik siklik; Zₙ mempunyai tepat satu subgrup untuk tiap pembagi n.', en: 'Every subgroup of a cyclic group is cyclic; Zₙ has exactly one subgroup for each divisor of n.' },
          },
          {
            title: { id: 'Koset dan Teorema Lagrange', en: 'Cosets and Lagrange\'s theorem' },
            intuition: { id: 'Koset-koset Ha mempartisi G menjadi potongan berukuran |H|; jadi |H| membagi |G|.', en: 'The cosets Ha partition G into pieces of size |H|; hence |H| divides |G|.' },
            formulas: ['Ha = \\{ha : h \\in H\\},\\qquad Ha = Hb \\iff ab^{-1} \\in H', '|G| = [G:H]\\,|H| \\quad\\Rightarrow\\quad o(a) \\mid |G|,\\quad a^{|G|} = e', '|G| = p \\text{ prima} \\Rightarrow G \\cong \\mathbb{Z}_p;\\qquad \\text{Euler: } a^{\\varphi(n)} \\equiv 1 \\pmod n \\text{ untuk } \\gcd(a,n)=1'],
            insight: { id: 'Kebalikan Lagrange gagal secara umum (A₄ tidak punya subgrup orde 6), tetapi berlaku untuk pangkat prima (Sylow) dan bilangan prima (Cauchy).', en: 'The converse of Lagrange fails in general (A₄ has no subgroup of order 6), but holds for prime powers (Sylow) and primes (Cauchy).' },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Homomorfisma, subgrup normal, grup faktor', en: 'Homomorphisms, normal subgroups, factor groups' },
            intuition: { id: 'Homomorfisma mengawetkan operasi; kernelnya selalu normal, dan subgrup normal tepat adalah yang koset-kosetnya bisa dikalikan.', en: 'A homomorphism preserves the operation; its kernel is always normal, and normal subgroups are exactly those whose cosets can be multiplied.' },
            formulas: ['\\varphi(ab) = \\varphi(a)\\varphi(b),\\quad \\ker\\varphi = \\{a : \\varphi(a) = e\'\\} \\lhd G,\\quad \\varphi \\text{ injektif} \\iff \\ker\\varphi = \\{e\\}', 'N \\lhd G \\iff aNa^{-1} = N\\ \\forall a \\iff aN = Na\\ \\forall a;\\qquad (Na)(Nb) = N(ab)', 'G/\\ker\\varphi \\cong \\varphi(G) \\ \\text{(Teorema Homomorfisma 1)};\\qquad |G/N| = |G|/|N|'],
            insight: { id: 'Subgrup berindeks 2 selalu normal. Teorema Cayley: setiap grup isomorfik dengan grup permutasi.', en: 'A subgroup of index 2 is always normal. Cayley: every group is isomorphic to a permutation group.' },
            lab: '#/app/algebra',
          },
        ],
      },
      {
        title: { id: 'Grup simetri (Bab 3)', en: 'The symmetric group (Chapter 3)' },
        entries: [
          {
            title: { id: 'Permutasi, siklus, paritas', en: 'Permutations, cycles, parity' },
            intuition: { id: 'Sₙ adalah semua penyusunan ulang n benda. Dalam notasi siklus struktur permutasi terlihat sekilas: orde, invers, paritas.', en: 'Sₙ is all rearrangements of n objects. In cycle notation the structure is visible at a glance: order, inverse, parity.' },
            formulas: ['(\\sigma\\tau)(s) = \\sigma(\\tau(s)) \\ \\text{(kanan ke kiri)},\\qquad |S_n| = n!', '\\sigma = \\text{hasil kali siklus saling lepas (tunggal)},\\quad o(\\sigma) = \\operatorname{lcm}(\\text{panjang siklus})', '(a_1 a_2 \\cdots a_k) = (a_1 a_k)(a_1 a_{k-1})\\cdots(a_1 a_2),\\qquad \\text{genap/ganjil terdefinisi baik},\\quad |A_n| = n!/2'],
            insight: { id: 'Aₙ adalah kernel dari homomorfisma tanda Sₙ → {±1}, jadi normal berindeks 2. Untuk n ≥ 5, Aₙ sederhana.', en: 'Aₙ is the kernel of the sign homomorphism Sₙ → {±1}, hence normal of index 2. For n ≥ 5, Aₙ is simple.' },
            lab: '#/app/algebra',
          },
        ],
      },
      {
        title: { id: 'Gelanggang (Bab 4)', en: 'Rings (Chapter 4)' },
        entries: [
          {
            title: { id: 'Definisi dan jenis gelanggang', en: 'Definition and kinds of rings' },
            intuition: { id: 'Dua operasi: grup abelian terhadap +, monoid terhadap ·, dihubungkan distributivitas. Zₙ, Z, Q, matriks, polinom semuanya gelanggang.', en: 'Two operations: an abelian group under +, a monoid under ·, linked by distributivity. Zₙ, Z, Q, matrices, polynomials are all rings.' },
            formulas: ['a(b + c) = ab + ac,\\qquad a\\cdot 0 = 0,\\quad (-a)b = -(ab)', '\\text{daerah integral: komutatif, } ab = 0 \\Rightarrow a = 0 \\text{ atau } b = 0;\\quad \\text{lapangan: setiap } a \\ne 0 \\text{ punya invers}', '\\mathbb{Z}_n \\text{ lapangan} \\iff n \\text{ prima};\\quad \\text{daerah integral berhingga} \\Rightarrow \\text{lapangan};\\quad U(\\mathbb{Z}_n) = \\{a : \\gcd(a,n) = 1\\}'],
            insight: { id: 'Di Zₙ setiap unsur tak nol adalah unit atau pembagi nol, bergantung pada gcd(a, n).', en: 'In Zₙ every nonzero element is either a unit or a zero divisor, according to gcd(a, n).' },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Ideal, homomorfisma, gelanggang kuosien', en: 'Ideals, homomorphisms, quotient rings' },
            intuition: { id: 'Ideal berperan seperti subgrup normal: kernel homomorfisma gelanggang, dan tempat membentuk R/I.', en: 'Ideals play the role of normal subgroups: kernels of ring homomorphisms, and what we quotient by to form R/I.' },
            formulas: ['I \\text{ ideal} \\iff (I, +) \\le (R, +),\\ rI \\subseteq I,\\ Ir \\subseteq I', '(a) = aR \\ \\text{(ideal utama)};\\quad \\text{ideal } \\mathbb{Z}_n: (d),\\ d \\mid n;\\quad R/\\ker\\varphi \\cong \\varphi(R)', 'M \\text{ maksimal} \\iff R/M \\text{ lapangan} \\ (R \\text{ komutatif dengan satuan})'],
            insight: { id: 'Lapangan hanya mempunyai ideal trivial (0) dan R. Ideal maksimal Zₙ tepat (p) dengan p prima pembagi n.', en: 'A field has only the trivial ideals (0) and R. The maximal ideals of Zₙ are exactly (p) for primes p dividing n.' },
            lab: '#/app/algebra',
          },
          {
            title: { id: 'Gelanggang polinom dan polinom atas Q', en: 'Polynomial rings and polynomials over Q' },
            intuition: { id: 'F[x] berperilaku seperti Z: algoritma pembagian, gcd Euclid, faktorisasi tunggal ke polinom tak tereduksi (peran "prima").', en: 'F[x] behaves like Z: division algorithm, Euclidean gcd, unique factorisation into irreducibles (the role of "primes").' },
            formulas: ['f = qg + r,\\ \\deg r < \\deg g;\\qquad \\deg(fg) = \\deg f + \\deg g;\\qquad F[x] \\text{ daerah ideal utama}', 'F[x]/(p(x)) \\text{ lapangan} \\iff p \\text{ tak tereduksi};\\qquad |\\mathbb{Z}_p[x]/(f)| = p^{\\deg f}', '\\text{Eisenstein: } p \\mid a_0,\\dots,a_{n-1},\\ p \\nmid a_n,\\ p^2 \\nmid a_0 \\Rightarrow f \\text{ tak tereduksi atas } \\mathbb{Q};\\quad \\text{akar rasional } r/s:\\ r \\mid a_0,\\ s \\mid a_n'],
            insight: { id: 'Lemma Gauss: tereduksi atas Q ⇒ tereduksi atas Z. Derajat ≤ 3 tak tereduksi iff tanpa akar di lapangan. Deg 4 bisa tereduksi tanpa akar (x⁴ + 4).', en: 'Gauss\'s lemma: reducible over Q ⇒ reducible over Z. Degree ≤ 3 is irreducible iff it has no root in the field. Degree 4 can be reducible without roots (x⁴ + 4).' },
            lab: '#/app/algebra',
          },
        ],
      },
    ],
  },
]
