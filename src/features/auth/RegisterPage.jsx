// src/features/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = { namaToko: "", noHp: "", email: "", kota: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(form);
      toast.success("Akun berhasil dibuat!", { position: "top-right" });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ic = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const label = "text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Daftar Akun PercaMatika</h1>
          <p className="text-sm text-gray-500 mt-1">Mulai rencanakan produksi patchwork Anda dengan lebih akurat</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div>
            <label className={label}>Nama Toko / Usaha</label>
            <input required value={form.namaToko} onChange={update("namaToko")} className={ic} placeholder="mis. Bu Aminah Craft" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>No HP</label>
              <input required value={form.noHp} onChange={update("noHp")} className={ic} placeholder="0812xxxxxxx" />
            </div>
            <div>
              <label className={label}>Kota</label>
              <input required value={form.kota} onChange={update("kota")} className={ic} placeholder="Medan" />
            </div>
          </div>

          <div>
            <label className={label}>Email</label>
            <input type="email" required value={form.email} onChange={update("email")} className={ic} placeholder="nama@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Password</label>
              <input type="password" required value={form.password} onChange={update("password")} className={ic} placeholder="Min. 8 karakter" />
            </div>
            <div>
              <label className={label}>Konfirmasi Password</label>
              <input type="password" required value={form.confirmPassword} onChange={update("confirmPassword")} className={ic} placeholder="Ulangi password" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-medium hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
