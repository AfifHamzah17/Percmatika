// src/features/profil/ProfilPage.jsx
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function ProfilPage() {
  const { user } = useAuth();
  const { umkm, produkList } = useApp();

  const rows = [
    { icon: User,  label: "Nama Toko", value: user?.nama_toko ?? umkm.nama },
    { icon: Mail,  label: "Email",     value: user?.email ?? "-" },
    { icon: Phone, label: "No HP",     value: user?.no_hp ?? "-" },
    { icon: MapPin, label: "Kota",     value: user?.kota ?? "-" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Profil Akun</h1>
        <p className="text-sm text-gray-500 mt-0.5">Informasi akun & toko Anda</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <row.icon size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{row.label}</p>
              <p className="text-sm font-medium text-gray-800">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Ringkasan Produksi</p>
        <p className="text-sm text-gray-600">{produkList.length} produk terdaftar · Kapasitas reguler {umkm.Cr} jam/bulan</p>
        <p className="text-xs text-gray-400 mt-2">Untuk mengubah data produk atau kapasitas, buka menu Produk.</p>
      </div>
    </div>
  );
}
