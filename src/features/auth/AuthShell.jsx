// src/features/auth/AuthShell.jsx
// Kerangka halaman masuk/daftar: panel merek (kiri, hanya desktop) + formulir (kanan).
import { LogoMark, QuiltUnits, QuiltLegend } from "../../components/ui";

export default function AuthShell({ judul, deskripsi, children, kaki }) {
  return (
    <div className="pm-auth">
      <aside className="pm-auth__brand" aria-hidden="false">
        <div className="pm-brand" style={{ color: "#fff" }}>
          <LogoMark size={34} />
          <span className="pm-brand__name" style={{ color: "#fff" }}>Perca<b style={{ color: "#a7d4c7" }}>Matika</b></span>
        </div>

        <div style={{ display: "grid", gap: 28 }}>
          <h2 className="pm-auth__hero">Setiap kain perca punya tempat dalam rencana bulan ini.</h2>
          <p style={{ color: "#bfe0d6", maxWidth: "44ch", lineHeight: 1.6 }}>
            PercaMatika memprakirakan permintaan, menimbang beberapa kemungkinan, lalu menghitung berapa unit tiap produk
            dibuat reguler, lembur, atau lewat bahan ekspres.
          </p>
          <div className="pm-auth__card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontWeight: 500, color: "#fff" }}>Contoh: Sajadah</span>
              <span className="pm-num" style={{ color: "#bfe0d6", fontFamily: "var(--font-mono)", fontSize: 13 }}>16 unit</span>
            </div>
            <QuiltUnits reg={11} ot={3} ex={2} />
            <div style={{ marginTop: 14, opacity: 0.9 }}><QuiltLegend /></div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#8fc4b6" }}>Alat bantu perencanaan. Hasilnya perkiraan, bukan jaminan penjualan.</p>
      </aside>

      <section className="pm-auth__form">
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="pm-auth__mobilebrand"><LogoMark size={30} /><span className="pm-brand__name">Perca<b>Matika</b></span></div>
          <h1 className="pm-h1" style={{ fontSize: 30 }}>{judul}</h1>
          <p className="pm-lead" style={{ marginTop: 8, marginBottom: 28 }}>{deskripsi}</p>
          {children}
          <p className="pm-small" style={{ marginTop: 24, textAlign: "center" }}>{kaki}</p>
        </div>
      </section>
    </div>
  );
}
