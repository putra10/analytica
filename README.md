# Analytica

Laboratorium visual (client-side, tanpa server) untuk tiga mata kuliah Departemen Matematika FMIPA UI, semester gasal 2026/2027:

| Modul | Rujukan | Sub-tab |
|---|---|---|
| Fungsi Kompleks | Brown & Churchill, *Complex Variables and Applications* | Pemetaan & fungsi analitik (pewarnaan domain, kisi konformal, uji Cauchy-Riemann); Singularitas, residu & integral kontur (klasifikasi titik singular, teorema residu diverifikasi numerik); Studio Fungsi Kompleks (`#/studio/complex`): bentuk kutub, akar, Log dan cabang, uji Cauchy-Riemann, konjugat harmonik, limit, integral kontur, taksiran ML, rumus Cauchy, deret Taylor/Laurent, residu, dengan langkah pengerjaan |
| Geometri Analitik | Vaisman, *Analytical Geometry* | Studio Geometri (`#/studio/geometry`): titik, garis, bidang, lingkaran dan bola dari persamaan umum, kuasa titik, garis kutub, sumbu radikal, pensil, klasifikasi konik dan kuadrik (δ, Δ, bentuk kanonik), transformasi afin dan ortogonal; setiap hasil disertai langkah pengerjaan |
| Aljabar | Herstein, *Abstract Algebra* | Grup (tabel Cayley, subgrup, koset, Lagrange, subgrup normal, grup faktor, isomorfisma, homomorfisma); Grup simetri Sₙ (dekomposisi siklus, paritas, hasil kali); Gelanggang Zₙ & ideal; Gelanggang polinom (algoritma pembagian, gcd, ketertereduksian, Z_p[x]/(f)); Isomorfisma grup dan gelanggang (uji invarian dan peta eksplisit) |

Teks teori tersedia dalam Bahasa Indonesia dan Inggris (saklar ID/EN di kanan atas), tema terang/gelap (ikon di kanan atas, mengikuti preferensi OS).

**Masukan sendiri (untuk soal/contoh kuliah):**
- Fungsi kompleks: ketik `f(z)` apa saja (`(z^2+1)/(z(z-2)^2)`, `exp(1/z)`, `|z|^2`, ...); dirender di shader dan dipakai di semua panel. Di tab residu, daftar titik singular (`0, 2, i`) menghasilkan residu numerik dan verifikasi teorema residu.
- Konik, kuadrik, lingkaran: tempel persamaan dari soal (`5x^2 - 2y^2 + 24xy + 4x - 1 = 0`, `x^2 + y^2 - 3z^2 - 2xy ... = 0`), tekan Enter.
- Grup: `⟨(1 2 3 4), (1 3)⟩` membangun subgrup Sₙ dari pembangkit; permutasi dan polinom juga diketik langsung. Notasi mengikuti buku rujukan (mis. matriks kecil/besar `A`, `Ã`, invarian `δ`, `Δ` Vaisman; hasil kali permutasi kanan-ke-kiri Herstein).

```bash
npm install
npm run dev     # http://localhost:5173
npm run check   # self-check mesin matematika (contoh dari buku)
npm run build   # keluaran statis di dist/
```

## Deploy (Vercel Hobby)

Import repo ini, preset **Vite** (root repo = proyek). Keluaran `dist/`. Tidak ada variabel lingkungan. Halaman: `#/` beranda, `#/app/<modul>` laboratorium (kompleks, aljabar), `#/studio/<geometry|complex>` studio, `#/summary` ringkasan rumus, `#/about` penjelasan.
