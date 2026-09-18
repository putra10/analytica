# Analytica

Laboratorium visual (client-side, tanpa server) untuk tiga mata kuliah Departemen Matematika FMIPA UI, semester gasal 2026/2027:

| Modul | Rujukan | Sub-tab |
|---|---|---|
| Fungsi Kompleks | Brown & Churchill, *Complex Variables and Applications* | Pemetaan & fungsi analitik (pewarnaan domain, kisi konformal, uji Cauchy-Riemann); Singularitas, residu & integral kontur (klasifikasi titik singular, teorema residu diverifikasi numerik) |
| Geometri Analitik | Vaisman, *Analytical Geometry* | Garis & bidang di R³; Lingkaran (kuasa titik, garis kutub, sumbu radikal, pensil); Konik umum & klasifikasi (Teorema 3.4.5); Kuadrik & irisan bidang (reduksi ke bentuk kanonik, 17 kelas Teorema 3.4.6); Transformasi afin & ortogonal |
| Aljabar | Herstein, *Abstract Algebra* | Grup (tabel Cayley, subgrup, koset, Lagrange, subgrup normal, grup faktor, isomorfisma, homomorfisma); Grup simetri Sₙ (dekomposisi siklus, paritas, hasil kali); Gelanggang Zₙ & ideal; Gelanggang polinom (algoritma pembagian, gcd, ketertereduksian, Z_p[x]/(f)) |

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

Import repo ini, preset **Vite** (root repo = proyek). Keluaran `dist/`. Tidak ada variabel lingkungan. Halaman: `#/` beranda, `#/app/<modul>` laboratorium, `#/summary` ringkasan rumus, `#/about` penjelasan.
