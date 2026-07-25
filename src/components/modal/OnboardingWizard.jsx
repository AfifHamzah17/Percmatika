// src/components/modal/OnboardingWizard.jsx
import { useState } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { saveUserConfig } from "../../services/apiClient";
import { toast } from "react-toastify";

const PRODUK_KANONIK = ["Sajadah", "Selimut Quilting", "Tote Bag", "Pouch", "Sarung Bantal", "Taplak Meja"];

const EMPTY_PRODUK = (nama) => ({
  nama, harga_jual: 0, biaya_material: 0, biaya_tk: 0, waktu_jam: 1,
  ongkir_ekspres: 0, penalti_backorder: 0, lead_time: 7,
});

export default function OnboardingWizard() {
  const { needsOnboarding, umkm, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [localUmkm, setLocalUmkm] = useState(umkm);
  const [selectedProduk, setSelectedProduk] = useState(() => new Set(PRODUK_KANONIK));
  const [produkData, setProdukData] = useState(() =>
    Object.fromEntries(PRODUK_KANONIK.map((p) => [p, EMPTY_PRODUK(p)]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!needsOnboarding) return null;

  const toggleProduk = (nama) => {
    const next = new Set(selectedProduk);
    if (next.has(nama)) next.delete(nama); else next.add(nama);
    setSelectedProduk(next);
  };

  const updateProduk = (nama, key, val) => {
    setProdukData({ ...produkData, [nama]: { ...produkData[nama], [key]: key === "nama" ? val : Number(val) || 0 } });
  };

  const handleFinish = async () => {
    const finalList = PRODUK_KANONIK.filter((p) => selectedProduk.has(p)).map((p) => produkData[p]);
    if (finalList.length === 0) {
      toast.error("Pilih minimal 1 produk yang Anda produksi.", { position: "top-right" });
      return;
    }
    if (finalList.some((p) => !p.harga_jual || p.harga_jual <= 0)) {
      toast.error("Isi harga jual untuk semua produk yang dipilih.", { position: "top-right" });
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserConfig(finalList, localUmkm);
      completeOnboarding(finalList, localUmkm);
      toast.success("Data toko tersimpan! Selamat menggunakan PercaMatika.", { position: "top-right" });
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message, { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ic = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const label = "text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col">

        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Selamat Datang di PercaMatika! 👋</h2>
          <p className="text-sm text-gray-500 mt-1">
            Isi data toko Anda sekali ini saja — bisa diubah kapan pun nanti lewat menu Produk/Pengaturan.
          </p>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-blue-600" : "bg-gray-150"}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Langkah 1 — Kapasitas Produksi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={label}>Kapasitas Reguler (jam/bulan)</label>
                  <input type="number" className={ic} value={localUmkm.Cr} onChange={(e) => setLocalUmkm({ ...localUmkm, Cr: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={label}>Kapasitas Lembur (jam/bulan)</label>
                  <input type="number" className={ic} value={localUmkm.Co} onChange={(e) => setLocalUmkm({ ...localUmkm, Co: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={label}>Biaya Lembur/jam (Rp)</label>
                  <input type="number" className={ic} value={localUmkm.cost_overtime_hr} onChange={(e) => setLocalUmkm({ ...localUmkm, cost_overtime_hr: Number(e.target.value) })} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Tidak yakin angkanya? Pakai perkiraan dulu — bisa diubah kapan saja.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">Langkah 2 — Produk yang Anda Produksi</h3>
              <p className="text-xs text-gray-500">Centang produk yang aktif Anda produksi, lalu isi harga & biayanya.</p>

              <div className="space-y-3">
                {PRODUK_KANONIK.map((nama) => {
                  const active = selectedProduk.has(nama);
                  return (
                    <div key={nama} className={`border rounded-xl p-3 transition-colors ${active ? "border-blue-200 bg-blue-50/40" : "border-gray-200"}`}>
                      <label className="flex items-center gap-2.5 cursor-pointer mb-2">
                        <input type="checkbox" checked={active} onChange={() => toggleProduk(nama)} className="w-4 h-4 rounded accent-blue-600" />
                        <span className="text-sm font-semibold text-gray-800">{nama}</span>
                      </label>
                      {active && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6">
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Harga Jual</label>
                            <input type="number" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md" value={produkData[nama].harga_jual} onChange={(e) => updateProduk(nama, "harga_jual", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Biaya Material</label>
                            <input type="number" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md" value={produkData[nama].biaya_material} onChange={(e) => updateProduk(nama, "biaya_material", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Biaya TK</label>
                            <input type="number" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md" value={produkData[nama].biaya_tk} onChange={(e) => updateProduk(nama, "biaya_tk", e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Waktu (jam)</label>
                            <input type="number" step="0.1" className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md" value={produkData[nama].waktu_jam} onChange={(e) => updateProduk(nama, "waktu_jam", e.target.value)} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setStep(1)}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Kembali
          </button>

          {step === 1 ? (
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors">
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={isSubmitting} className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Check size={16} /> {isSubmitting ? "Menyimpan..." : "Selesai & Mulai"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
