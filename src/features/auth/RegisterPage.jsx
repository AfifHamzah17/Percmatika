// src/features/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, CircleAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

const EMPTY_FORM = { namaToko: "", noHp: "", email: "", kota: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [lihat, setLihat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const kuat = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!kuat) return setError("Kata sandi minimal 8 karakter.");
    if (form.password !== form.confirmPassword) return setError("Konfirmasi kata sandi belum cocok.");
    setIsSubmitting(true);
    try {
      await register(form);
      toast.success("Akun berhasil dibuat", { position: "top-right" });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      judul="Buat akun usaha Anda"
      deskripsi="Cukup satu menit. Data produk dan penjualan bisa diisi setelah masuk."
      kaki={<>Sudah punya akun? <Link to="/login" style={{ color: "var(--pm-accent)", fontWeight: 500 }}>Masuk</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {error && <div className="pm-error" role="alert"><CircleAlert size={18} strokeWidth={1.75} style={{ flex: "none", marginTop: 1 }} />{error}</div>}
        <div className="pm-field">
          <label className="pm-label" htmlFor="namaToko">Nama usaha</label>
          <input id="namaToko" className="pm-input" required value={form.namaToko} onChange={update("namaToko")} placeholder="mis. Bu Aminah Craft" autoComplete="organization" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="pm-field">
            <label className="pm-label" htmlFor="noHp">Nomor HP</label>
            <input id="noHp" className="pm-input" required type="tel" inputMode="tel" value={form.noHp} onChange={update("noHp")} placeholder="0812…" autoComplete="tel" />
          </div>
          <div className="pm-field">
            <label className="pm-label" htmlFor="kota">Kota</label>
            <input id="kota" className="pm-input" required value={form.kota} onChange={update("kota")} placeholder="mis. Medan" autoComplete="address-level2" />
          </div>
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="email">Email</label>
          <input id="email" className="pm-input" type="email" required value={form.email} onChange={update("email")} placeholder="nama@email.com" autoComplete="email" />
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="password">Kata sandi</label>
          <div style={{ position: "relative" }}>
            <input id="password" className="pm-input" type={lihat ? "text" : "password"} required value={form.password} onChange={update("password")}
              placeholder="Minimal 8 karakter" autoComplete="new-password" style={{ paddingRight: 46 }} />
            <button type="button" className="pm-iconbtn" onClick={() => setLihat((v) => !v)} aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              style={{ position: "absolute", right: 4, top: 4, width: 36, height: 36 }}>
              {lihat ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
          <span className="pm-help" style={{ color: form.password ? (kuat ? "var(--pm-accent)" : "var(--pm-warn)") : undefined }}>
            {form.password ? (kuat ? "Panjang kata sandi sudah cukup." : `Kurang ${8 - form.password.length} karakter lagi.`) : "Gunakan minimal 8 karakter."}
          </span>
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="confirm">Ulangi kata sandi</label>
          <input id="confirm" className="pm-input" type={lihat ? "text" : "password"} required value={form.confirmPassword} onChange={update("confirmPassword")}
            placeholder="Ketik ulang kata sandi" autoComplete="new-password"
            aria-invalid={form.confirmPassword && form.confirmPassword !== form.password ? "true" : undefined} />
        </div>
        <button type="submit" disabled={isSubmitting} className="pm-btn pm-btn--primary pm-btn--lg" style={{ width: "100%", marginTop: 4 }}>
          {isSubmitting ? <><Loader2 size={18} className="pm-spin" />Membuat akun</> : "Buat akun"}
        </button>
      </form>
    </AuthShell>
  );
}
