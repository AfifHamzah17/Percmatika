// src/features/bantuan/BantuanPage.jsx
import { Link } from "react-router-dom";
import { PageHeader, QuiltLegend } from "../../components/ui";

const LANGKAH = [
  { j: "Isi produk dan kapasitas", d: "Harga, biaya, jam kerja per unit, dan jam kerja bulanan usaha Anda.", to: "/produk", t: "Buka Produk" },
  { j: "Isi penjualan tiap bulan", d: "Unit terjual per produk. Semakin rapat dan lengkap, semakin baik prakiraan.", to: "/penjualan", t: "Buka Penjualan" },
  { j: "Hitung rencana", d: "Pilih bulan, lalu tekan Hitung. Hasilnya berupa jumlah produksi, lembur, dan jadwal pesan bahan.", to: "/", t: "Buka Rencana" },
];

const FAQ = [
  { q: "Apa yang dihitung PercaMatika?", a: "Berapa unit tiap produk sebaiknya dibuat bulan ini, kapan perlu lembur, kapan memesan bahan lewat jalur cepat, dan kapan harus memesan bahan agar tidak terlambat. Sistem menimbang beberapa kemungkinan permintaan, bukan hanya satu tebakan." },
  { q: "Bagaimana prakiraan permintaan dibuat?", a: "Dari riwayat penjualan Anda dan kalender (Ramadhan, Idul Fitri, Idul Adha, akhir tahun, tahun ajaran baru). Dua model dipakai bersama, XGBoost dan LSTM, lalu hasilnya digabung. Model yang lebih sederhana dipakai sebagai pembanding agar kualitasnya bisa diukur." },
  { q: "Apa arti “seberapa yakin sistem pada tiap kemungkinan”?", a: "Sistem membayangkan lima kemungkinan: permintaan lebih rendah, sesuai prakiraan, atau lebih tinggi. Tiap kemungkinan diberi bobot. Bobot diperbarui dari penjualan bulan-bulan terakhir, jadi jika prakiraan sering meleset ke satu arah, bobotnya ikut bergeser." },
  { q: "Mengapa jumlah produksi berbeda dari prakiraan permintaan?", a: "Jam kerja terbatas. Bila semua produk dibuat sebanyak permintaan, jamnya tidak cukup. Sistem mengutamakan produk yang memberi keuntungan lebih besar per jam kerja, dan mempertimbangkan biaya lembur serta bahan ekspres." },
  { q: "Apakah hasilnya pasti benar?", a: "Tidak. Semua angka adalah perkiraan dari data yang Anda isi. Kualitas hasil bergantung pada kelengkapan data penjualan. Gunakan sebagai bahan pertimbangan, bukan jaminan." },
  { q: "Mengapa ada tulisan “data contoh”?", a: "Jika server belum bisa dihubungi, halaman menampilkan contoh agar Anda bisa melihat bentuk hasilnya. Contoh itu bukan hasil hitung usaha Anda dan selalu diberi tanda." },
  { q: "Bagaimana cara mengubah data?", a: "Buka menu Produk lalu tab Ubah data, atau impor dari Excel. Data penjualan diubah di menu Penjualan." },
];

export default function BantuanPage() {
  return (
    <div className="pm-stack pm-stack--lg" style={{ maxWidth: 820 }}>
      <PageHeader judul="Bantuan" deskripsi="Cara memulai, membaca hasil, dan jawaban atas pertanyaan yang sering muncul." />

      <section aria-labelledby="h-mulai">
        <h2 id="h-mulai" className="pm-h2" style={{ marginBottom: 14 }}>Mulai dalam tiga langkah</h2>
        <ol className="pm-panel pm-divide" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {LANGKAH.map((l, i) => (
            <li key={l.j} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", flexWrap: "wrap" }}>
              <span className="pm-num" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--pm-accent-soft)", color: "var(--pm-accent)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 220 }}>
                <p className="pm-h3">{l.j}</p>
                <p className="pm-small">{l.d}</p>
              </div>
              <Link to={l.to} className="pm-btn pm-btn--ghost pm-btn--sm">{l.t}</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="pm-panel pm-panel--pad pm-stitch" aria-labelledby="h-baca">
        <h2 id="h-baca" className="pm-h2">Cara membaca kotak-kotak di Rencana</h2>
        <p className="pm-lead" style={{ margin: "6px 0 14px" }}>Satu kotak mewakili satu unit produk.</p>
        <QuiltLegend />
        <p className="pm-help" style={{ marginTop: 12 }}>Jumlah lembur, ekspres, dan tidak terpenuhi adalah batas maksimum pada skenario permintaan tinggi, bukan angka pasti.</p>
      </section>

      <section aria-labelledby="h-faq">
        <h2 id="h-faq" className="pm-h2" style={{ marginBottom: 14 }}>Pertanyaan umum</h2>
        <div className="pm-panel pm-divide">
          {FAQ.map((f) => (
            <details key={f.q} className="pm-faq">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="pm-small">PercaMatika versi 2.0 · Prakiraan XGBoost dan LSTM, optimasi dua tahap dengan Progressive Hedging.</p>
    </div>
  );
}
