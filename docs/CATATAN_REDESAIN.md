# Catatan redesain frontend PercaMatika

## Arah desain
- **Gagasan khas:** kain perca. Satu kotak = satu unit produk (`QuiltUnits`): hijau = reguler, kuning tua = lembur,
  kotak berbingkai = bahan ekspres, kotak berarsir = tidak terpenuhi. Dipakai di Rencana, Penjualan (peta kelengkapan data),
  halaman masuk, dan status kosong. Garis jahitan putus-putus (`pm-stitch`) sebagai ornamen tunggal.
- **Warna:** satu aksen (hijau daun `#146b5a`), netral kehijauan. Merah dan kuning hanya untuk makna status.
- **Tipografi:** Bricolage Grotesque (judul), Geist (isi), Geist Mono (angka). Dimuat dari Google Fonts di `index.html`.
- **Navigasi:** sidebar dan kolom pencarian palsu dihapus; diganti navigasi atas (desktop) dan tab bawah (ponsel).
- **Tata letak Rencana:** pita ringkasan (bukan empat kartu), daftar produk di kiri, kolom kanan lengket berisi
  tindakan, keyakinan skenario, dan penjelasan hitungan.

## Berkas
| Berkas | Perubahan |
|---|---|
| `index.html`, `src/index.css` | font, token warna, komponen `pm-*`. Skala `gray-*` dan `blue-*` Tailwind dipetakan ulang (`@theme static`) sehingga komponen lama (modal input) ikut serasi |
| `src/components/ui.jsx` | `LogoMark`, `QuiltUnits`, `QuiltLegend`, `ScenarioWeights`, `PageHeader`, `EmptyState`, `Skeleton` |
| `src/components/layout/AppNav.jsx`, `MainLayout.jsx` | menggantikan `Navbar.jsx` dan `Sidebar.jsx` (dihapus) |
| `src/lib/kalender.js`, `format.js` | kalender Hijriah (logika sama dengan notebook), format angka |
| `features/dashboard`, `analitik`, `produk`, `penjualan`, `auth`, `bantuan`, `profil` | tampilan ditulis ulang; presenter dan lapisan data **tidak diubah** kecuali yang tercatat di bawah |
| `features/dashboard/dashboard-model.js` | tambah `extractAi`, `isMock`; toast data contoh dibuat jujur |
| `features/produk/produk-model.js` | jam kerja per unit memakai `waktu_jam` (lihat KONTRAK_API_AI.md) |
| `components/modal/ConfirmModal`, `HitungLoadingModal` | gaya baru; tahap pemuatan mengikuti alur AI |

## Masalah lama yang ditemukan dan diperbaiki
1. `services/pdfExportService.js` berisi JSX di berkas `.js` (bisa gagal saat build) → diganti nama `.jsx`.
2. Di berkas yang sama, `const { BULAN_LABEL } = [ ... ]` meng-*destructure* array sehingga nama bulan PDF selalu `undefined` → diperbaiki.
3. Saat API gagal, dashboard diam-diam menampilkan data contoh seolah hasil asli → kini diberi banner dan toast peringatan.
4. Kalender musiman di dashboard memuat produk yang tidak ada (Mukena, Tasbih) dan bulan Idul Fitri yang keliru → diganti
   perhitungan kalender Hijriah.
5. Footer Analitik memuat karakter Tiongkok nyasar → dibuang.
6. `window.confirm` dan `alert` diganti modal/toast yang bisa dibaca pembaca layar.
7. "Waktu produksi" dihitung sebagai hari × 24 jam dan dijumlahkan antarproduk (tidak bermakna) → diganti jam kerja per unit.
8. Pilihan tahun di Penjualan menyempit sendiri mengikuti hasil filter → kini daftar tahun tetap.
9. Lonceng notifikasi dan kolom pencarian pada navbar tidak berfungsi → dihapus.

## Keamanan
- Berkas `.env` ikut dalam zip yang Anda kirim. **Jangan di-commit.** Isinya tidak saya salin; hanya `.env.example` yang disertakan.
  Bila kunci/URL di dalamnya pernah masuk repo publik, ganti kuncinya.

## Cara menjalankan
```bash
npm install
npm run dev
```
Tidak ada dependensi baru. Ikon tetap `lucide-react`, grafik tetap `recharts`, animasi memakai CSS (hormati `prefers-reduced-motion`).

## Yang belum diverifikasi
Sandbox tempat redesain ini dibuat tidak punya akses jaringan sehingga `vite build` penuh tidak bisa dijalankan. Yang sudah dicek:
semua berkas JSX lolos kompilasi esbuild, 14 layar dirender ke HTML dan difoto pada lebar 1440 px dan 390 px (tanpa overflow
horizontal), dengan Recharts dan ikon diganti pengganti. Yang **belum** terlihat: tampilan asli grafik Recharts, font Geist/Bricolage
(di sandbox memakai font cadangan), dan halaman setelah terhubung ke backend. Jalankan `npm run build` dan periksa visual di peramban.
