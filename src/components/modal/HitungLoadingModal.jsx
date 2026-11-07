// src/components/modal/HitungLoadingModal.jsx
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { QuiltUnits } from "../ui";

// Tahap sesuai alur AI yang sebenarnya: prakiraan → skenario & bobot → optimasi → rencana.
const STEPS = [
  "Membaca riwayat penjualan dan kalender bulan ini",
  "Memprakirakan permintaan tiap produk",
  "Menimbang lima kemungkinan permintaan",
  "Mencari rencana produksi terbaik",
  "Menyusun jadwal lembur dan pemesanan bahan",
];

export default function HitungLoadingModal() {
  const [langkah, setLangkah] = useState(0);
  useEffect(() => {
    // Perkiraan visual saja: tahap bergeser berkala, tahap terakhir menunggu server benar-benar selesai.
    const t = setInterval(() => setLangkah((i) => (i < STEPS.length - 1 ? i + 1 : i)), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pm-modal" style={{ zIndex: "var(--z-loading)" }} role="alertdialog" aria-modal="true" aria-busy="true" aria-labelledby="hl-judul">
      <div className="pm-modal__scrim" />
      <div className="pm-modal__box" style={{ maxWidth: 440, padding: 28 }}>
        <div style={{ marginBottom: 20 }}><QuiltUnits reg={7} ot={3} ex={1} bo={0} max={14} /></div>
        <h3 id="hl-judul" className="pm-h2">Sedang menghitung rencana</h3>
        <ol style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "grid", gap: 10 }} aria-live="polite">
          {STEPS.map((s, i) => {
            const selesai = i < langkah, aktif = i === langkah;
            return (
              <li key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: selesai || aktif ? "var(--pm-ink)" : "var(--pm-faint)" }}>
                <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 7, display: "grid", placeItems: "center", flex: "none",
                  background: selesai ? "var(--pm-accent)" : aktif ? "var(--pm-accent-soft)" : "var(--pm-surface-2)", color: selesai ? "#fff" : "var(--pm-accent)" }}>
                  {selesai ? <Check size={13} strokeWidth={2.5} /> : aktif ? <i className="pm-spin" style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid var(--pm-accent)", borderTopColor: "transparent", display: "block" }} /> : null}
                </span>
                {s}
              </li>
            );
          })}
        </ol>
        <p className="pm-help" style={{ marginTop: 18 }}>Biasanya beberapa detik sampai setengah menit. Jangan tutup halaman ini.</p>
      </div>
    </div>
  );
}
