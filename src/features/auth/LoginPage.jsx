// src/features/auth/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Berhasil masuk!", { position: "top-right" });
      const redirectTo = location.state?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Gagal masuk. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ic = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Masuk ke PercaMatika</h1>
          <p className="text-sm text-gray-500 mt-1">Rencana produksi optimal untuk UMKM patchwork Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={ic} placeholder="nama@email.com" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={ic} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Belum punya akun? <Link to="/register" className="text-blue-600 font-medium hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
