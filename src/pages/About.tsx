import { useLang, useT } from '../lib/i18n'
import { Tex } from '../components/ui/FormulaBlock'

type Block = { h: { id: string; en: string }; p: { id: React.ReactNode; en: React.ReactNode } }

const code = (s: string) => <code className="rounded bg-slate-900 px-1 py-0.5 font-mono text-[12px] text-slate-100">{s}</code>

const BLOCKS: { title: { id: string; en: string }; items: Block[] }[] = [
  {
    title: { id: 'Apa ini', en: 'What this is' },
    items: [
      { h: { id: 'Tujuan', en: 'Purpose' }, p: { id: <>Analytica adalah alat bantu belajar untuk tiga mata kuliah: Fungsi Kompleks (Brown &amp; Churchill), Geometri Analitik (Vaisman), dan Aljabar (Herstein). Setiap laboratorium mengambil satu topik dari SAP dan menggambarnya secara interaktif, dengan teks teori yang mengikuti notasi bukunya.</>, en: <>Analytica is a study companion for three courses: Complex Functions (Brown &amp; Churchill), Analytic Geometry (Vaisman) and Algebra (Herstein). Each lab takes one topic from the course plan and draws it interactively, with theory text that follows the book\'s notation.</> } },
      { h: { id: 'Cara memakainya', en: 'How to use it' }, p: { id: <>Pilih modul di navigasi, lalu sub-tab topiknya. Panel kiri adalah gambar (bisa diseret/diputar), panel kanan kontrol, dan kartu di bawah berisi teori dan angka-angka yang dihitung langsung dari keadaan gambar. Saklar <b>ID/EN</b> mengganti bahasa teks; ikon bulan/matahari mengganti tema.</>, en: <>Pick a module in the navigation, then the topic sub-tab. The left panel is the picture (drag/rotate it), the right panel the controls, and the cards below hold the theory and the numbers computed live from the picture\'s state. The <b>ID/EN</b> switch changes the text language; the moon/sun icon changes the theme.</> } },
      { h: { id: 'Masukan sendiri', en: 'Your own input' }, p: { id: <>Untuk mengerjakan soal: di Fungsi Kompleks ketik {code('f(z)')} apa saja (misalnya {code('(z^2+1)/(z(z-2)^2)')}) dan daftar titik singularnya; di Geometri tempel persamaan konik/kuadrik/lingkaran dari soal; di Aljabar ketik permutasi, polinom, atau pembangkit grup {code('(1 2 3 4), (1 3)')}. Sintaks: {code('+ - * / ^')}, konstanta {code('i e pi c')}, fungsi {code('exp log sin cos tan sinh cosh sqrt conj abs re im arg')}, dan perkalian implisit seperti {code('2z')} atau {code('4xy')}.</>, en: <>To work on problems: in Complex Functions type any {code('f(z)')} (say {code('(z^2+1)/(z(z-2)^2)')}) and its singular points; in Geometry paste a conic/quadric/circle equation; in Algebra type permutations, polynomials, or group generators {code('(1 2 3 4), (1 3)')}. Syntax: {code('+ - * / ^')}, constants {code('i e pi c')}, functions {code('exp log sin cos tan sinh cosh sqrt conj abs re im arg')}, implicit products such as {code('2z')} or {code('4xy')}.</> } },
    ],
  },
  {
    title: { id: 'Bagaimana gambarnya dihitung', en: 'How the pictures are computed' },
    items: [
      { h: { id: 'Pewarnaan domain', en: 'Domain colouring' }, p: { id: <>Setiap piksel bidang kompleks dikirim ke kartu grafis; sebuah shader menghitung <Tex tex="w = f(z)" /> dan mewarnai piksel dengan rona = <Tex tex="\arg w" />, kecerahan = <Tex tex="|w|" /> (bertingkat pada <Tex tex="|w| = 2^k" />). Nol tampak gelap, kutub putih. Rumus yang Anda ketik diterjemahkan ke bahasa shader secara otomatis.</>, en: <>Every pixel of the complex plane goes to the graphics card; a shader evaluates <Tex tex="w = f(z)" /> and colours the pixel with hue = <Tex tex="\arg w" />, brightness = <Tex tex="|w|" /> (stepped at <Tex tex="|w| = 2^k" />). Zeros look dark, poles white. The formula you type is translated to shader code automatically.</> } },
      { h: { id: 'Integral kontur dan residu', en: 'Contour integrals and residues' }, p: { id: <>Integral <Tex tex="\oint_C f\,dz" /> dihitung dengan aturan trapesium pada 4096 titik lingkaran; residu fungsi kustom dihitung sebagai <Tex tex="\frac{1}{2\pi i}\oint" /> pada lingkaran kecil di sekitar titik yang Anda beri. Untuk preset, residunya analitik dan dibandingkan dengan nilai numerik sebagai pemeriksaan teorema residu.</>, en: <>The integral <Tex tex="\oint_C f\,dz" /> is computed by the trapezoid rule on 4096 points of the circle; residues of custom functions are <Tex tex="\frac{1}{2\pi i}\oint" /> over a small circle around each point you list. For presets the residues are analytic and compared with the numeric value as a check of the residue theorem.</> } },
      { h: { id: 'Reduksi kuadrik', en: 'Quadric reduction' }, p: { id: <>Nilai dan vektor eigen matriks <Tex tex="A" /> dicari dengan metode Jacobi; titik asal dipindahkan ke pusat (solusi <Tex tex="A\xi + a = 0" />) atau, untuk paraboloid, ke puncak; permukaan digambar di kerangka kanonik lalu diputar kembali. Irisan bidang diperoleh dengan mensubstitusi <Tex tex="\bar r = \bar r_0 + s\bar e_1 + t\bar e_2" /> dan menelusuri konik hasilnya (marching squares).</>, en: <>The eigenvalues and eigenvectors of the matrix <Tex tex="A" /> are found with the Jacobi method; the origin is moved to the centre (solution of <Tex tex="A\xi + a = 0" />) or, for paraboloids, to the vertex; the surface is drawn in the canonical frame and rotated back. Plane sections come from substituting <Tex tex="\bar r = \bar r_0 + s\bar e_1 + t\bar e_2" /> and tracing the resulting conic (marching squares).</> } },
      { h: { id: 'Grup dan gelanggang', en: 'Groups and rings' }, p: { id: <>Setiap grup disimpan sebagai tabel Cayley; subgrup dicari sebagai penutup dari satu atau dua pembangkit, koset dan kenormalan langsung dari definisi, dan isomorfisma dengan membandingkan invarian lalu mencari bijeksi yang mengawetkan operasi dari bayangan pembangkit. Polinom dihitung dengan aritmetika eksak (rasional atau modulo p).</>, en: <>Each group is stored as a Cayley table; subgroups are closures of one or two generators, cosets and normality follow the definitions, and isomorphism is decided by comparing invariants and then searching for an operation-preserving bijection from generator images. Polynomials use exact arithmetic (rational or mod p).</> } },
    ],
  },
  {
    title: { id: 'Batasan yang perlu diketahui', en: 'Limitations to know about' },
    items: [
      { h: { id: 'Numerik, bukan simbolik', en: 'Numeric, not symbolic' }, p: { id: <>Untuk fungsi kustom, nol dan jenis singularitas (orde kutub, esensial) tidak diklasifikasikan; residu numerik akurat untuk kutub berorde rendah, tetapi tidak menggantikan perhitungan tangan yang diminta di ujian. Gunakan sebagai pemeriksa jawaban.</>, en: <>For custom functions, zeros and singularity types (pole order, essential) are not classified; numeric residues are accurate for low-order poles but do not replace the hand computation asked for in exams. Use them to check answers.</> } },
      { h: { id: 'Ukuran grup', en: 'Group size' }, p: { id: <>Grup kustom dibatasi 120 unsur, dan pencarian subgrup menganggap setiap subgrup dibangkitkan oleh paling banyak dua unsur (benar untuk semua grup yang disediakan, tetapi tidak untuk, misalnya, <Tex tex="\mathbb{Z}_2^3" />).</>, en: <>Custom groups are capped at 120 elements, and the subgroup search assumes every subgroup is generated by at most two elements (true for all built-in groups, but not for, say, <Tex tex="\mathbb{Z}_2^3" />).</> } },
      { h: { id: 'Ketertereduksian atas Q', en: 'Irreducibility over Q' }, p: { id: <>Uji yang dipakai: akar rasional, Eisenstein, dan reduksi mod p. Bila ketiganya tidak memutuskan (misalnya <Tex tex="x^4 + 4" />), aplikasi mengatakan "belum ditentukan" alih-alih menebak.</>, en: <>Tests used: rational roots, Eisenstein, and reduction mod p. When none decides (for example <Tex tex="x^4 + 4" />) the app says "undetermined" rather than guessing.</> } },
    ],
  },
]

export function About() {
  const t = useT()
  const { lang } = useLang()
  return (
    <div className="space-y-10 py-4">
      <div>
        <span className="eyebrow">{t('Tentang', 'About')}</span>
        <h1 className="font-display mt-2 text-[clamp(30px,4vw,46px)] text-slate-100">{t('Apa yang dihitung, dan bagaimana.', 'What is computed, and how.')}</h1>
      </div>
      {BLOCKS.map((b) => (
        <section key={b.title.en}>
          <h2 className="font-display mb-4 text-[26px] text-slate-100">{b.title[lang]}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {b.items.map((it) => (
              <article key={it.h.en} className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
                <h3 className="text-[14px] font-semibold text-slate-100">{it.h[lang]}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{it.p[lang]}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section className="rounded-[var(--radius)] border border-border bg-slate-900 p-5 text-[13px] leading-relaxed text-slate-400">
        <h3 className="mb-1 text-[14px] font-semibold text-slate-100">{t('Rujukan', 'References')}</h3>
        <ul className="list-disc space-y-0.5 pl-5">
          <li>J. W. Brown, R. V. Churchill, <i>Complex Variables and Applications</i>, 8th ed., McGraw-Hill, 2009.</li>
          <li>I. Vaisman, <i>Analytical Geometry</i>, World Scientific, 1997.</li>
          <li>I. N. Herstein, <i>Abstract Algebra</i>, 3rd ed., Prentice-Hall, 1996.</li>
        </ul>
      </section>
    </div>
  )
}
