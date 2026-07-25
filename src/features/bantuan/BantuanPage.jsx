// src/features/bantuan/BantuanPage.jsx
import { Info } from "lucide-react";

export default function BantuanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Bantuan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pertanyaan umum dan informasi sistem</p>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Info size={16} className="text-blue-600" /> Pertanyaan Umum</h2>
        <div className="divide-y divide-gray-100">
          {[
            { q:"Apa itu PercaMatika?", a:"Sistem optimasi produksi berbasis Two-Stage Stochastic Programming dengan Progressive Hedging Algorithm (TSSP-PHA) yang dirancang khusus untuk UMKM konveksi (patchwork)." },
            { q:"Apa bedanya dengan forecasting biasa?", a:"Forecasting hanya memprediksi permintaan. PercaMatika tidak hanya memprediksi, tapi mengoptimasi keputusan produksi — berapa unit tiap produk, kapan lembur, kapan pesan bahan — dengan mempertimbangkan semua skenario sekaligus." },
            { q:"Mengapa angka produksi berbeda dari forecast?", a:"Karena optimizer memutuskan untuk tidak memproduksi semua yang diminta jika kapasitas lebih baik dialokasikan ke produk lain dengan margin lebih tinggi per jam." },
            { q:"Apa itu x_j, y_js, e_js, b_js?", a:"Variabel keputusan matematis: x_j = produksi reguler, y_js = tambahan lembur, e_js = pengadaan ekspres, b_js = backorder diterima. Ditampilkan kecil di kartu produk sebagai referensi akademis." },
            { q:"Data dari mana?", a:"Saat ini menggunakan dataset contoh. Kedepannya, data diambil dari penjualan historis UMKM, diproses oleh LSTM, lalu dioptimasi oleh TSSP engine." },
            { q:"Bagaimana cara mengubah data?", a:"Buka menu Produk, lalu gunakan tab Edit Data untuk mengubah parameter UMKM dan detail produk, atau tombol Import Data untuk upload dari Excel." },
          ].map((item, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between py-3 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                <span className="font-medium">{item.q}</span>
                <span className="text-xs text-gray-400 group-open:hidden">▼</span>
              </summary>
              <p className="pb-3 text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Versi */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Versi Sistem</h2>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <div>Frontend: React + Tailwind CSS + Vite</div>
          <div>Backend: Python + Flask + PuLP</div>
          <div>Engine: TSSP-PHA Solver</div>
          <div>Forecasting: LSTM</div>
          <div>Report: @react-pdf/renderer</div>
          <div>Excel: ExcelJS</div>
          <div>Version: 1.0.0 (Proof of Concept)</div>
        </div>
      </div>
    </div>
  );
}