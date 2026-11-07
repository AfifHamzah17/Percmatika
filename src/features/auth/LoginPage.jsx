// src/features/auth/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, CircleAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lihat, setLihat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Berhasil masuk", { position: "top-right" });
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal masuk. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      judul="Selamat datang kembali"
      deskripsi="Masuk untuk melihat rencana produksi bulan ini."
      kaki={<>Belum punya akun? <Link to="/register" style={{ color: "var(--pm-accent)", fontWeight: 500 }}>Daftar gratis</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }} noValidate={false}>
        {error && <div className="pm-error" role="alert"><CircleAlert size={18} strokeWidth={1.75} style={{ flex: "none", marginTop: 1 }} />{error}</div>}
        <div className="pm-field">
          <label className="pm-label" htmlFor="email">Email</label>
          <input id="email" className="pm-input" type="email" required autoComplete="email" inputMode="email"
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
        </div>
        <div className="pm-field">
          <label className="pm-label" htmlFor="password">Kata sandi</label>
          <div style={{ position: "relative" }}>
            <input id="password" className="pm-input" type={lihat ? "text" : "password"} required autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kata sandi Anda" style={{ paddingRight: 46 }} />
            <button type="button" className="pm-iconbtn" onClick={() => setLihat((v) => !v)}
              aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              style={{ position: "absolute", right: 4, top: 4, width: 36, height: 36 }}>
              {lihat ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="pm-btn pm-btn--primary pm-btn--lg" style={{ width: "100%" }}>
          {isSubmitting ? <><Loader2 size={18} className="pm-spin" />Memproses</> : "Masuk"}
        </button>
      </form>
    </AuthShell>
  );
}
