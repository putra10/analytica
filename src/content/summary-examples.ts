export type Bilingual = { id: string; en: string }
export type WorkedExample = { prompt: Bilingual; work: string; reading: Bilingual }
export type PartVisual = { title: Bilingual; caption: Bilingual; steps: { label: Bilingual; tex: string }[] }

const bi = (id: string, en: string): Bilingual => ({ id, en })
const ex = (id: string, en: string, work: string, readingId: string, readingEn: string): WorkedExample => ({
  prompt: bi(id, en), work, reading: bi(readingId, readingEn),
})
const flow = (id: string, en: string, captionId: string, captionEn: string, steps: [Bilingual, string][]): PartVisual => ({
  title: bi(id, en), caption: bi(captionId, captionEn), steps: steps.map(([label, tex]) => ({ label, tex })),
})

/** One concrete calculation for every Summary entry, in the same syllabus order. */
export const SUMMARY_EXAMPLES: Record<string, WorkedExample[][]> = {
  complex: [
    [
      ex('Ambil z = 3 + 4i.', 'Take z = 3 + 4i.', '|z|=\\sqrt{3^2+4^2}=5,\\quad \\bar z=3-4i,\\quad z\\bar z=(3+4i)(3-4i)=25', 'Perkalian dengan konjugat menghasilkan bilangan real positif, yaitu kuadrat jarak dari asal.', 'Multiplying by the conjugate gives a positive real number, the squared distance from the origin.'),
      ex('Naikkan 1 + i ke pangkat empat.', 'Raise 1 + i to the fourth power.', '(1+i)^2=1+2i+i^2=2i,\\qquad (1+i)^4=(2i)^2=-4', 'Modulusnya berubah dari √2 menjadi 4, dan sudut π/4 menjadi π.', 'Its modulus changes from √2 to 4, and its angle from π/4 to π.'),
      ex('Cari semua akar pangkat tiga dari 1.', 'Find all cube roots of 1.', 'z^3=1\\ \\Longrightarrow\\ z\\in\\{1,e^{2\\pi i/3},e^{4\\pi i/3}\\}', 'Tiga jawaban berjarak sudut 2π/3 pada lingkaran satuan.', 'The three answers are spaced by 2π/3 on the unit circle.'),
      ex('Periksa cakram D = {|z| < 1}.', 'Inspect the disc D = {|z| < 1}.', 'D=\\{z:|z|<1\\},\\qquad \\partial D=\\{z:|z|=1\\}', 'D terbuka karena setiap titiknya memiliki lingkungan kecil yang tetap di dalam D; lingkaran batas tidak termasuk.', 'D is open because every point has a small neighbourhood still inside D; the boundary circle is excluded.'),
    ],
    [
      ex('Petakan titik 1 + i dengan f(z) = z².', 'Map the point 1 + i with f(z) = z².', '(1+i)^2=1+2i+i^2=2i', 'Titik (1, 1) pada bidang z menjadi (0, 2) pada bidang w.', 'The point (1, 1) in the z-plane becomes (0, 2) in the w-plane.'),
      ex('Turunkan f(z) = z² di z = 1 + i.', 'Differentiate f(z) = z² at z = 1 + i.', 'f\\prime(z)=2z,\\qquad f\\prime(1+i)=2+2i', 'Turunan kompleks menyatakan skala lokal |2+2i| dan rotasi lokal arg(2+2i).', 'The complex derivative gives the local scale |2+2i| and rotation arg(2+2i).'),
      ex('Uji w = z² dengan Cauchy-Riemann.', 'Check w = z² with Cauchy-Riemann.', 'u=x^2-y^2,\\ v=2xy:\\quad u_x=2x=v_y,\\quad u_y=-2y=-v_x', 'Kedua persamaan berlaku di setiap titik, sehingga fungsi ini analitik di seluruh bidang.', 'Both equations hold at every point, so this function is analytic throughout the plane.'),
      ex('Cari pasangan harmonik dari u = x² − y².', 'Find a harmonic partner of u = x² − y².', '\\Delta u=u_{xx}+u_{yy}=2-2=0,\\qquad v=2xy', 'u harmonik dan v memenuhi persamaan Cauchy-Riemann; u + iv = z².', 'u is harmonic and v satisfies Cauchy-Riemann; u + iv = z².'),
    ],
    [
      ex('Hitung eksponensial pada sumbu imajiner.', 'Evaluate the exponential on the imaginary axis.', 'e^{i\\pi}=\\cos\\pi+i\\sin\\pi=-1,\\qquad |e^{x+iy}|=e^x', 'Bagian real mengatur ukuran; bagian imajiner mengatur sudut.', 'The real part controls size; the imaginary part controls angle.'),
      ex('Dekati −1 dari dua sisi potongan cabang.', 'Approach −1 from both sides of the branch cut.', '\\operatorname{Log}(-1+i0)=i\\pi,\\qquad \\operatorname{Log}(-1-i0)=-i\\pi', 'Nilai utama melompat sebesar 2πi ketika melintasi sumbu real negatif.', 'The principal value jumps by 2πi when crossing the negative real axis.'),
      ex('Masukkan z = i ke fungsi sinus.', 'Substitute z = i into sine.', '\\sin(i)=i\\sinh(1),\\qquad \\cos(i)=\\cosh(1)', 'Sinus dan kosinus kompleks terkait langsung dengan fungsi hiperbolik.', 'Complex sine and cosine are directly connected to hyperbolic functions.'),
    ],
    [
      ex('Integralkan 1/z pada lingkaran satuan.', 'Integrate 1/z around the unit circle.', 'z=e^{it},\\ 0\\le t\\le2\\pi:\\quad \\oint_{|z|=1}\\frac{dz}{z}=\\int_0^{2\\pi}i\\,dt=2\\pi i', 'Arah lintasan berpengaruh; membalik arah mengubah tanda integral.', 'Orientation matters; reversing the path changes the sign of the integral.'),
      ex('Integralkan z² pada lintasan tertutup.', 'Integrate z² around a closed path.', 'F(z)=\\frac{z^3}{3},\\quad F\\prime(z)=z^2,\\quad \\oint_\\gamma z^2\\,dz=0', 'Karena antiturunan berlaku di seluruh bidang, nilai hanya bergantung pada ujung lintasan.', 'Because the antiderivative works throughout the plane, the value depends only on path endpoints.'),
      ex('Gunakan lingkaran |z| = 2 yang mengelilingi a = 1.', 'Use the circle |z| = 2, which encloses a = 1.', '\\oint_{|z|=2}\\frac{1}{z-1}\\,dz=2\\pi i', 'Rumus Cauchy mengambil nilai fungsi pembilang di titik yang dilingkari.', 'Cauchy’s formula samples the numerator at the enclosed point.'),
    ],
    [
      ex('Kembangkan fungsi pada anulus 0 < |z| < 1.', 'Expand a function on the annulus 0 < |z| < 1.', '\\frac{1}{z(1-z)}=\\frac1z+1+z+z^2+\\cdots', 'Suku 1/z adalah bagian utama Laurent; koefisiennya 1 adalah residu di nol.', 'The 1/z term is the Laurent principal part; its coefficient 1 is the residue at zero.'),
      ex('Bandingkan tiga perilaku di z = 0.', 'Compare three behaviours at z = 0.', '\\frac{\\sin z}{z}\\to1,\\qquad \\frac1z\\to\\infty,\\qquad e^{1/z}=\\sum_{n=0}^{\\infty}\\frac{1}{n!z^n}', 'Berturut-turut: dapat dihapuskan, kutub, dan esensial. Banyaknya pangkat negatif membedakannya.', 'These are removable, pole, and essential singularities. The negative-power terms distinguish them.'),
      ex('Lingkari kedua kutub dari 1/[z(z−1)].', 'Enclose both poles of 1/[z(z−1)].', '\\operatorname{Res}(f,0)=-1,\\quad \\operatorname{Res}(f,1)=1,\\quad \\oint_{|z|=2}f(z)\\,dz=0', 'Kedua residu saling meniadakan; jumlahnya, bukan banyaknya kutub, menentukan integral.', 'The residues cancel; their sum, rather than the number of poles, determines the integral.'),
    ],
  ],
  geometry: [
    [
      ex('Dari P = (2, 3) ke Q = (5, 7).', 'From P = (2, 3) to Q = (5, 7).', '\\overrightarrow{PQ}=Q-P=(5-2,7-3)=(3,4),\\qquad |PQ|=\\sqrt{3^2+4^2}=5', 'Vektor perpindahan tidak bergantung pada posisi asal koordinat.', 'The displacement vector does not depend on where the coordinate origin is placed.'),
      ex('Gunakan vektor satuan e₁, e₂, e₃.', 'Use the unit vectors e₁, e₂, e₃.', 'e_1\\cdot e_2=0,\\quad e_1\\times e_2=e_3,\\quad [e_1,e_2,e_3]=1', 'Hasil kali skalar mengukur kesejajaran, hasil kali silang memberi arah tegak lurus, dan hasil kali campuran memberi volume berarah.', 'The dot product measures alignment, the cross product gives a perpendicular direction, and the triple product gives signed volume.'),
    ],
    [
      ex('Potong garis r(t) = (t,t,t) dengan bidang x+y+z=3.', 'Intersect the line r(t) = (t,t,t) with the plane x+y+z=3.', 't+t+t=3\\ \\Longrightarrow\\ t=1,\\qquad r(1)=(1,1,1)', 'Masukkan parameter garis ke persamaan bidang untuk mencari titik potong.', 'Substitute the line parameter into the plane equation to find the intersection.'),
      ex('Hitung jarak asal ke bidang x+y+z=3.', 'Find the distance from the origin to x+y+z=3.', 'd=\\frac{|0+0+0-3|}{\\sqrt{1^2+1^2+1^2}}=\\sqrt3', 'Penyebut adalah panjang vektor normal bidang, bukan panjang titik yang diuji.', 'The denominator is the length of the plane’s normal vector, not the length of the test point.'),
    ],
    [
      ex('Ambil lingkaran x²+y²=4 dan P=(3,0).', 'Take the circle x²+y²=4 and P=(3,0).', '\\operatorname{Pow}(P)=3^2-2^2=5,\\qquad \\text{polar}(P):\\ 3x=4', 'Kuasa positif berarti titik di luar lingkaran; garis polar P adalah x=4/3.', 'Positive power places P outside the circle; its polar line is x=4/3.'),
      ex('Bandingkan dua lingkaran berpusat di (−1,0) dan (1,0), keduanya berjari-jari 2.', 'Compare equal-radius circles centred at (−1,0) and (1,0).', '(x+1)^2+y^2=(x-1)^2+y^2\\ \\Longrightarrow\\ x=0', 'Sumbu radikal adalah tempat kuasa terhadap kedua lingkaran sama.', 'The radical axis is the set of points with equal power relative to both circles.'),
    ],
    [
      ex('Baca fokus elips x²/9 + y²/4 = 1.', 'Find the foci of x²/9 + y²/4 = 1.', 'a=3,\\ b=2,\\ c=\\sqrt{a^2-b^2}=\\sqrt5,\\qquad F_\\pm=(\\pm\\sqrt5,0)', 'Sumbu panjang menentukan arah fokus; panjang fokus dihitung dari a²−b².', 'The major axis sets the focus direction; focal distance follows from a²−b².'),
      ex('Lihat garis pada paraboloid pelana z=x²−y².', 'Find a line on the saddle z=x²−y².', 's=x+y,\\ t=x-y\\ \\Longrightarrow\\ z=st;\\qquad s=c\\ \\Longrightarrow\\ z=ct', 'Dengan s tetap, x, y, dan z berubah linear terhadap t: ini satu keluarga garis pembangun.', 'With s fixed, x, y, and z all vary linearly in t: this is one family of rulings.'),
      ex('Cari arah utama untuk x²+2xy+y².', 'Find the principal directions of x²+2xy+y².', 'A=\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix},\\quad \\lambda_1=2,\\ \\lambda_2=0', 'Arah (1,1) dan (1,−1) menghilangkan suku campuran setelah rotasi.', 'The directions (1,1) and (1,−1) remove the mixed term after rotation.'),
      ex('Ubah x²+4x+y²−2y=0 ke bentuk kanonik.', 'Reduce x²+4x+y²−2y=0 to canonical form.', '(x^2+4x+4)+(y^2-2y+1)=5\\ \\Longrightarrow\\ (x+2)^2+(y-1)^2=5', 'Melengkapkan kuadrat mengungkap pusat (−2,1) dan jari-jari √5.', 'Completing squares reveals centre (−2,1) and radius √5.'),
    ],
    [
      ex('Terapkan T(x,y)=(2x+1,y−1) pada (1,2).', 'Apply T(x,y)=(2x+1,y−1) to (1,2).', 'T(1,2)=(3,1)', 'Skala dan translasi mengubah panjang, tetapi garis sejajar tetap sejajar.', 'Scaling and translation change lengths, but parallel lines remain parallel.'),
      ex('Putar (1,0) sebesar 90°.', 'Rotate (1,0) by 90°.', 'R=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix},\\quad R(1,0)=(0,1),\\quad |R(1,0)|=1', 'Matriks ortogonal menjaga panjang dan sudut.', 'An orthogonal matrix preserves lengths and angles.'),
    ],
  ],
  algebra: [
    [
      ex('Gunakan penjumlahan modulo 4.', 'Use addition modulo 4.', '1+3\\equiv0\\pmod4,\\qquad -1\\equiv3\\pmod4', 'Identitasnya 0 dan setiap elemen punya invers aditif.', 'The identity is 0 and every element has an additive inverse.'),
      ex('Bangun subgrup dari 2 di Z₆.', 'Generate a subgroup from 2 in Z₆.', '\\langle2\\rangle=\\{0,2,4\\},\\qquad |\\langle2\\rangle|=3', 'Terus tambahkan 2 sampai kembali ke 0; himpunan yang diperoleh tertutup.', 'Keep adding 2 until returning to 0; the resulting set is closed.'),
      ex('Bagi Z₆ menurut H={0,2,4}.', 'Partition Z₆ using H={0,2,4}.', 'H=\\{0,2,4\\},\\quad 1+H=\\{1,3,5\\},\\quad |\\mathbb Z_6|=2|H|', 'Dua koset tidak tumpang tindih dan menutupi seluruh grup.', 'The two cosets are disjoint and cover the whole group.'),
      ex('Petakan bilangan bulat ke kelas modulo 3.', 'Map integers to classes modulo 3.', '\\varphi:\\mathbb Z\\to\\mathbb Z_3,\\quad \\varphi(n)=[n]_3,\\quad \\ker\\varphi=3\\mathbb Z', 'Bilangan yang dipetakan ke identitas membentuk kernel, suatu subgrup normal.', 'The numbers mapped to the identity form the kernel, a normal subgroup.'),
      ex('Bentuk grup faktor dari kernel tadi.', 'Form the factor group from that kernel.', '\\mathbb Z/3\\mathbb Z\\cong\\mathbb Z_3', 'Setiap koset 3Z menjadi satu elemen: [0], [1], atau [2].', 'Each coset of 3Z becomes one element: [0], [1], or [2].'),
    ],
    [
      ex('Cari orde permutasi (1 2 3)(4 5).', 'Find the order of (1 2 3)(4 5).', '\\operatorname{ord}\\big((1\\ 2\\ 3)(4\\ 5)\\big)=\\operatorname{lcm}(3,2)=6', 'Siklus yang terpisah dapat dihitung sendiri, lalu panjangnya digabung dengan KPK.', 'Disjoint cycles can be analysed separately, then their lengths combined by the least common multiple.'),
      ex('Uraikan siklus (1 2 3) menjadi transposisi.', 'Decompose (1 2 3) into transpositions.', '(1\\ 2\\ 3)=(1\\ 3)(1\\ 2),\\qquad \\operatorname{sgn}=(-1)^2=+1', 'Perkalian dibaca dari kanan ke kiri; dua pertukaran berarti permutasi genap.', 'Read composition from right to left; two swaps make an even permutation.'),
    ],
    [
      ex('Kalikan 2 dan 3 dalam Z₆.', 'Multiply 2 and 3 in Z₆.', '2\\cdot3\\equiv0\\pmod6,\\qquad 2\\ne0,\\ 3\\ne0', 'Keduanya pembagi nol, sehingga Z₆ bukan daerah integral dan bukan lapangan.', 'They are zero divisors, so Z₆ is neither an integral domain nor a field.'),
      ex('Bentuk kuosien Z₆ oleh ideal (2).', 'Take the quotient of Z₆ by the ideal (2).', '(2)=\\{0,2,4\\},\\qquad \\mathbb Z_6/(2)\\cong\\mathbb Z_2', 'Kuosien memiliki dua kelas; karena Z₂ lapangan, ideal (2) maksimal.', 'The quotient has two classes; since Z₂ is a field, the ideal (2) is maximal.'),
      ex('Bagi x³+1 dengan x+1 di F₅[x].', 'Divide x³+1 by x+1 in F₅[x].', 'x^3+1=(x+1)(x^2-x+1)=(x+1)(x^2+4x+1)\\ \\text{di }\\mathbb F_5[x]', 'Koefisien −1 ditulis sebagai 4 modulo 5; sisanya nol.', 'The coefficient −1 is written as 4 modulo 5; the remainder is zero.'),
      ex('Uji f(x)=x³+6x+3 dengan Eisenstein.', 'Test f(x)=x³+6x+3 with Eisenstein.', '3\\mid 0,6,3;\\qquad 3\\nmid1;\\qquad 9\\nmid3', 'Semua syarat berlaku untuk p=3, maka polinom irreduksibel atas Q.', 'All conditions hold for p=3, so the polynomial is irreducible over Q.'),
    ],
  ],
}

/** The reasoning step that connects each question to its calculation. */
export const SUMMARY_METHODS: Record<string, Bilingual[][]> = {
  complex: [
    [
      bi('Hitung panjang dengan teorema Pythagoras. Untuk konjugat, ubah tanda bagian imajiner.', 'Use Pythagoras for the length. For the conjugate, change the sign of the imaginary part.'),
      bi('Kuadratkan sekali untuk mendapat 2i, lalu kuadratkan hasilnya lagi.', 'Square once to get 2i, then square that result again.'),
      bi('Tulis 1 sebagai e^{i2πk}, lalu bagi setiap sudut dengan 3 dan ambil tiga nilai yang berbeda.', 'Write 1 as e^{i2πk}, divide each angle by 3, and keep the three distinct values.'),
      bi('Bandingkan jarak setiap titik ke asal dengan 1. Tanda < berarti lingkaran batas tidak ikut.', 'Compare each point’s distance from the origin with 1. The strict < excludes the boundary circle.'),
    ],
    [
      bi('Ganti z dengan 1+i, kalikan kedua faktor, lalu gunakan i² = −1.', 'Substitute 1+i for z, multiply the factors, then use i² = −1.'),
      bi('Turunkan z² seperti aturan pangkat biasa, lalu masukkan titik yang diminta.', 'Differentiate z² with the usual power rule, then substitute the requested point.'),
      bi('Pisahkan bagian real u dan imajiner v, kemudian hitung empat turunan parsialnya.', 'Separate the real part u and imaginary part v, then compute their four partial derivatives.'),
      bi('Jumlahkan turunan kedua u terhadap x dan y. Setelah hasilnya nol, cari v dari persamaan Cauchy-Riemann.', 'Add the second x and y derivatives of u. Once the sum is zero, use Cauchy-Riemann to find v.'),
    ],
    [
      bi('Gunakan rumus Euler untuk e^{iπ}. Untuk modulus, perhatikan bahwa |e^{iy}| = 1.', 'Use Euler’s formula for e^{iπ}. For the modulus, note that |e^{iy}| = 1.'),
      bi('Lihat sudut titik yang mendekati −1 dari atas dan dari bawah; nilai utamanya memilih sudut yang berbeda.', 'Compare the angles when approaching −1 from above and below; the principal branch chooses different angles.'),
      bi('Gunakan identitas sin(iy) = i sinh(y) dan cos(iy) = cosh(y), lalu pilih y = 1.', 'Use sin(iy) = i sinh(y) and cos(iy) = cosh(y), then set y = 1.'),
    ],
    [
      bi('Parametrisasi lingkaran dengan z=e^{it}. Turunan z terhadap t memberi dz=i e^{it}dt, lalu e^{it} saling habis.', 'Parametrize the circle by z=e^{it}. Differentiating gives dz=i e^{it}dt, so the e^{it} factors cancel.'),
      bi('Cari fungsi F yang turunannya z². Pada lintasan tertutup, titik awal dan akhir sama.', 'Find a function F whose derivative is z². A closed path has the same start and end point.'),
      bi('Cek bahwa titik 1 ada di dalam |z|=2, lalu terapkan rumus Cauchy dengan pembilang konstan 1.', 'Check that 1 lies inside |z|=2, then apply Cauchy’s formula with constant numerator 1.'),
    ],
    [
      bi('Pisahkan faktor 1/z, lalu gunakan deret geometri 1/(1−z)=1+z+z²+⋯ yang berlaku saat |z|<1.', 'Separate the 1/z factor, then use 1/(1−z)=1+z+z²+⋯, valid when |z|<1.'),
      bi('Bandingkan suku berpangkat negatif pada deret Laurent: tidak ada, satu suku, atau tak hingga banyak.', 'Compare the negative-power Laurent terms: none, one, or infinitely many.'),
      bi('Uraikan pecahan menjadi −1/z + 1/(z−1). Koefisien kedua suku itu adalah residu.', 'Split the fraction into −1/z + 1/(z−1). Their coefficients are the residues.'),
    ],
  ],
  geometry: [
    [
      bi('Kurangi koordinat Q dengan koordinat P, lalu hitung panjang hasilnya.', 'Subtract P’s coordinates from Q’s, then find the length of the result.'),
      bi('Hasil kali skalar memakai komponen searah; hasil kali silang memberi arah tegak lurus; determinan memberi volume berarah.', 'The dot product combines matching components; the cross product gives a perpendicular direction; the determinant gives signed volume.'),
    ],
    [
      bi('Masukkan x=t, y=t, z=t dari garis ke persamaan bidang, lalu selesaikan t.', 'Substitute x=t, y=t, z=t from the line into the plane equation, then solve for t.'),
      bi('Ambil koefisien x, y, z sebagai vektor normal. Masukkan titik asal ke persamaan dan bagi dengan panjang normal.', 'Use the x, y, z coefficients as the normal vector. Substitute the origin into the equation and divide by the normal’s length.'),
    ],
    [
      bi('Kuasa titik adalah jarak ke pusat kuadrat dikurangi jari-jari kuadrat. Untuk polar, gunakan x₀x+y₀y=r².', 'Point power is squared distance to the centre minus squared radius. For the polar, use x₀x+y₀y=r².'),
      bi('Tulis kuasa titik terhadap masing-masing lingkaran dan samakan; suku x² dan y² akan hilang.', 'Write the point power for each circle and set them equal; the x² and y² terms cancel.'),
    ],
    [
      bi('Penyebut yang lebih besar adalah a². Hitung c²=a²−b², lalu letakkan fokus pada sumbu panjang.', 'The larger denominator is a². Compute c²=a²−b², then place the foci on the major axis.'),
      bi('Faktorkan x²−y² sebagai (x+y)(x−y). Tetapkan salah satu faktor agar yang lain menjadi parameter garis.', 'Factor x²−y² as (x+y)(x−y). Fix one factor so the other becomes a line parameter.'),
      bi('Masukkan koefisien x², xy, y² ke matriks simetris. Arah eigennya menjadi sumbu baru.', 'Put the x², xy, y² coefficients into a symmetric matrix. Its eigenvectors give the new axes.'),
      bi('Kelompokkan suku x dan y masing-masing, lalu tambahkan dan kurangkan kuadrat yang diperlukan.', 'Group the x and y terms separately, then add and subtract the squares needed to complete each square.'),
    ],
    [
      bi('Ganti x=1 dan y=2 dalam rumus T. Setelah itu lihat apa yang dilakukan skala dan translasi pada garis.', 'Substitute x=1 and y=2 into T. Then examine how scaling and translation affect lines.'),
      bi('Kalikan matriks rotasi dengan vektor. Bandingkan panjang vektor sebelum dan sesudah.', 'Multiply the rotation matrix by the vector. Compare its length before and after.'),
    ],
  ],
  algebra: [
    [
      bi('Gunakan penjumlahan, lalu ambil sisa bagi 4. Cari pasangan 1 yang menghasilkan identitas 0.', 'Add, then take the remainder modulo 4. Find the partner of 1 that produces the identity 0.'),
      bi('Mulai dari 0 dan tambahkan 2 berulang kali modulo 6 sampai kembali ke 0.', 'Start at 0 and repeatedly add 2 modulo 6 until you return to 0.'),
      bi('Daftarkan H, lalu tambahkan 1 pada setiap unsurnya untuk mendapat koset lain.', 'List H, then add 1 to every element to get another coset.'),
      bi('Ambil sisa bagi 3 dari setiap bilangan bulat. Kernel berisi tepat bilangan yang sisanya 0.', 'Take each integer’s remainder modulo 3. The kernel contains exactly those with remainder 0.'),
      bi('Gabungkan bilangan yang selisihnya kelipatan 3; tiga kelas yang muncul berperilaku seperti Z₃.', 'Group numbers whose difference is a multiple of 3; the resulting three classes behave like Z₃.'),
    ],
    [
      bi('Pisahkan menjadi siklus yang tidak berbagi angka, lalu ambil KPK dari panjang siklus.', 'Separate cycles that share no symbols, then take the least common multiple of their lengths.'),
      bi('Terapkan dua pertukaran dari kanan ke kiri, lalu hitung apakah jumlah pertukarannya genap atau ganjil.', 'Apply the two swaps from right to left, then count whether the number of swaps is even or odd.'),
    ],
    [
      bi('Cari dua unsur yang bukan nol tetapi hasil kalinya nol modulo 6.', 'Look for two nonzero elements whose product is zero modulo 6.'),
      bi('Daftarkan kelipatan 2 modulo 6. Dalam kuosien, unsur yang berbeda sebesar kelipatan 2 menjadi satu kelas.', 'List the multiples of 2 modulo 6. In the quotient, elements differing by a multiple of 2 become one class.'),
      bi('Kalikan kembali faktor pembagi dengan hasil bagi, lalu ubah −1 menjadi 4 modulo 5.', 'Multiply the divisor by the quotient to check it, then replace −1 by 4 modulo 5.'),
      bi('Pilih p=3. Cek semua koefisien selain yang terdepan habis dibagi 3, tetapi konstanta tidak habis dibagi 9.', 'Choose p=3. Check that every nonleading coefficient is divisible by 3 while the constant is not divisible by 9.'),
    ],
  ],
}

/** A visual relation for every topic group, shown before its detailed entries. */
export const PART_VISUALS: Record<string, PartVisual[]> = {
  complex: [
    flow('Satu titik, dua cara membaca', 'One point, two ways to read it', 'Bentuk Kartesius menunjukkan posisi; bentuk kutub menunjukkan ukuran dan rotasi.', 'Cartesian form shows position; polar form shows size and rotation.', [[bi('koordinat', 'coordinates'), 'z=x+iy'], [bi('ukur dan sudut', 'length and angle'), '(r,\\theta)=(|z|,\\arg z)'], [bi('bentuk kutub', 'polar form'), 'z=re^{i\\theta}']]),
    flow('Dari fungsi ke geometri lokal', 'From a function to local geometry', 'Fungsi memindahkan titik; turunan tak nol menjelaskan skala dan rotasi di dekatnya.', 'The function moves points; a nonzero derivative describes nearby scaling and rotation.', [[bi('titik asal', 'source point'), 'z=x+iy'], [bi('bayangan', 'image'), 'w=f(z)'], [bi('perubahan lokal', 'local change'), 'f\\prime(z)\\ne0']]),
    flow('Eksponensial menghubungkan dua koordinat', 'The exponential connects two coordinates', 'Bagian real menentukan radius dan bagian imajiner menentukan arah.', 'The real part sets the radius and the imaginary part sets direction.', [[bi('masukan', 'input'), 'z=x+iy'], [bi('pemetaan', 'mapping'), 'e^z=e^x e^{iy}'], [bi('keluaran kutub', 'polar output'), '(|w|,\\arg w)=(e^x,y)']]),
    flow('Lintasan menjadi nilai integral', 'A path becomes an integral', 'Cek daerah di dalam lintasan serta titik tempat fungsi gagal analitik.', 'Check the area inside the path and the points where the function is not analytic.', [[bi('lintasan', 'path'), '\\gamma'], [bi('integrasi', 'integration'), '\\oint_\\gamma f(z)\\,dz'], [bi('hasil', 'result'), '2\\pi i\\sum\\operatorname{Res}']]),
    flow('Koefisien yang menentukan integral', 'The coefficient that determines the integral', 'Deret Laurent memisahkan perilaku biasa dari bagian utama di sekitar singularitas.', 'A Laurent series separates regular behaviour from the principal part near a singularity.', [[bi('fungsi lokal', 'local function'), 'f(z)=\\sum_{n=-\\infty}^{\\infty}c_n(z-a)^n'], [bi('koefisien', 'coefficient'), 'c_{-1}=\\operatorname{Res}(f,a)'], [bi('integral', 'integral'), '\\oint f\\,dz=2\\pi i\\sum c_{-1}']]),
  ],
  geometry: [
    flow('Koordinat menjadi ukuran geometri', 'Coordinates become geometric measurements', 'Selisih titik memberi perpindahan; hasil kali vektor memberi sudut, arah, dan volume.', 'Subtracting points gives displacement; vector products give angles, directions, and volume.', [[bi('dua titik', 'two points'), 'P,\\ Q'], [bi('vektor', 'vector'), 'v=Q-P'], [bi('ukuran', 'measurement'), '|v|,\\ v\\cdot w,\\ v\\times w']]),
    flow('Arah dan normal menentukan kedudukan', 'Directions and normals determine position', 'Persamaan parametrik cocok untuk garis; persamaan normal cocok untuk bidang dan jarak.', 'Parametric equations suit lines; normal equations suit planes and distances.', [[bi('arah atau normal', 'direction or normal'), 'd,\\ n'], [bi('persamaan', 'equation'), 'r=p+td,\\ n\\cdot r=c'], [bi('hubungan', 'relation'), '\\text{potong, sejajar, jarak}']]),
    flow('Dua lingkaran berbagi satu sumbu kuasa', 'Two circles share one power axis', 'Kurangi persamaan kuasa untuk menghilangkan suku kuadrat.', 'Subtract power equations to eliminate the quadratic terms.', [[bi('lingkaran', 'circles'), 'C_1,\\ C_2'], [bi('kuasa titik', 'point power'), '\\operatorname{Pow}_{C_i}(P)'], [bi('sumbu radikal', 'radical axis'), '\\operatorname{Pow}_{C_1}=\\operatorname{Pow}_{C_2}']]),
    flow('Bentuk umum menjadi bentuk kanonik', 'General form becomes canonical form', 'Translasi menghilangkan suku linear; arah eigen menghilangkan suku campuran.', 'Translation removes linear terms; eigenvectors remove mixed terms.', [[bi('persamaan umum', 'general equation'), 'x^TAx+b^Tx+c=0'], [bi('geser dan putar', 'translate and rotate'), 'x=Qy+h'], [bi('bentuk kanonik', 'canonical form'), '\\sum\\lambda_i y_i^2=k']]),
    flow('Jenis transformasi menentukan invarian', 'The transformation determines the invariant', 'Transformasi afin menjaga kesejajaran; transformasi ortogonal juga menjaga jarak dan sudut.', 'Affine maps preserve parallelism; orthogonal maps also preserve distances and angles.', [[bi('titik', 'point'), 'x,\\ y'], [bi('transformasi', 'transformation'), 'T(x)=Ax+b'], [bi('yang tetap', 'what remains'), 'A^TA=I\\implies |T(x)-T(y)|=|x-y|']]),
  ],
  algebra: [
    flow('Dari operasi ke kelas koset', 'From an operation to cosets', 'Subgrup mempartisi grup menjadi koset. Jika subgrup normal, koset juga membentuk grup faktor.', 'A subgroup partitions the group into cosets. If it is normal, those cosets also form a factor group.', [[bi('grup', 'group'), '(G,\\ast)'], [bi('subgrup', 'subgroup'), 'H\\le G'], [bi('grup faktor jika normal', 'factor group if normal'), 'H\\triangleleft G\\implies G/H']]),
    flow('Permutasi dibaca lewat siklus', 'Read permutations through cycles', 'Siklus yang saling lepas mempermudah hitung orde; transposisi menentukan paritas.', 'Disjoint cycles simplify order calculations; transpositions determine parity.', [[bi('permutasi', 'permutation'), '\\sigma\\in S_n'], [bi('siklus', 'cycles'), '(a\\ b\\ c)(d\\ e)'], [bi('sifat', 'properties'), '\\operatorname{ord},\\ \\operatorname{sgn}']]),
    flow('Ideal membentuk aritmetika baru', 'An ideal makes new arithmetic', 'Identifikasi elemen yang berbeda sebesar unsur ideal; kuosien mewarisi dua operasi.', 'Identify elements that differ by an ideal element; the quotient inherits both operations.', [[bi('gelanggang', 'ring'), 'R'], [bi('ideal', 'ideal'), 'I\\triangleleft R'], [bi('kuosien', 'quotient'), 'R/I']]),
  ],
}
