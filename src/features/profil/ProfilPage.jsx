// src/features/profil/ProfilPage.jsx
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { PageHeader } from "../../components/ui";
import { angka } from "../../lib/format";

export default function ProfilPage() {
  const { user } = useAuth();
  const { umkm, produkList } = useApp();
  const baris = [
    { icon: User, label: "Nama usaha", value: user?.nama_toko ?? umkm.nama },
    { icon: Mail, label: "Email", value: user?.email ?? "–" },
    { icon: Phone, label: "Nomor HP", value: user?.no_hp ?? "–" },
    { icon: MapPin, label: "Kota", value: user?.kota ?? "–" },
  ];
  return (
    <div className="pm-stack pm-stack--lg" style={{ maxWidth: 720 }}>
      <PageHeader judul="Profil usaha" deskripsi="Data akun dan usaha Anda." />
      <dl className="pm-panel pm-divide" style={{ margin: 0 }}>
        {baris.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
            <span aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--pm-accent-soft)", color: "var(--pm-accent)", flex: "none" }}><Icon size={18} strokeWidth={1.75} /></span>
            <div style={{ minWidth: 0 }}>
              <dt className="pm-small">{label}</dt>
              <dd style={{ color: "var(--pm-ink)", fontWeight: 500, overflowWrap: "anywhere" }}>{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <section className="pm-panel pm-panel--pad pm-stitch">
        <h2 className="pm-h3">Ringkasan produksi</h2>
        <p className="pm-lead" style={{ marginTop: 6 }}>
          <b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{produkList.length}</b> produk terdaftar ·
          kapasitas reguler <b className="pm-num" style={{ color: "var(--pm-ink)", fontWeight: 500 }}>{angka(umkm.Cr)}</b> jam per bulan.
        </p>
        <Link to="/produk" className="pm-btn pm-btn--ghost" style={{ marginTop: 16 }}>Ubah produk dan kapasitas</Link>
      </section>
    </div>
  );
}
