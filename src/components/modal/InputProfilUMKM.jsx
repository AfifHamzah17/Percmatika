// src/components/modal/InputProfilUMKM.jsx
import { useState, useEffect } from "react";
import { Check, SkipForward, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProvinsiKota } from "../../hooks/useProvinsiKota";
import { toast } from "react-toastify";

const PRODUK_DEFAULT = [
  "Sajadah",
  "Selimut Quilting",
  "Tote Bag",
  "Pouch",
  "Sarung Bantal",
  "Taplak Meja",
];

const makeDefaultProduk = (nama) => ({
  nama,
  harga_jual: 0,
  biaya_material: 0,
  biaya_tk: 0,
  biaya_lembur: 0,
  ongkir_ekspres: 0,
  ongkir_reguler: 0,
  waktu_hari: 1,
  penalti_backorder: 10000,
  lead_time: 7,
});

export default function InputProfilUMKM({ onComplete }) {
  const { user, completeProfile } = useAuth();
  const { provinsiList, kotaList, isLoadingKota, fetchKota } = useProvinsiKota();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [namaToko, setNamaToko] = useState(user?.nama_toko || "");
  const [noHp, setNoHp] = useState(user?.no_hp || "");
  const [provinsiId, setProvinsiId] = useState("");
  const [provinsiName, setProvinsiName] = useState(user?.provinsi || "");
  const [kota, setKota] = useState(user?.kota || "");
  const [punyaPekerja, setPunyaPekerja] = useState(user?.punya_pekerja || false);
  const [jumlahPekerja, setJumlahPekerja] = useState(user?.jumlah_pekerja || "");
  const [selectedProduk, setSelectedProduk] = useState(() => new Set(PRODUK_DEFAULT));

  // ── Saat provinsiList sudah loaded & user punya provinsi tersimpan,
  //    cari ID-nya supaya dropdown menampilkan pilihan yang benar ──
  useEffect(() => {
    if (provinsiList.length === 0 || !provinsiName) return;
    const match = provinsiList.find(
      (p) => p.name.toUpperCase() === provinsiName.toUpperCase()
    );
    if (match && match.id !== provinsiId) {
      setProvinsiId(match.id);
      fetchKota(match.id); // otomatis load kota juga
    }
  }, [provinsiList]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ganti provinsi → fetch kota baru ──
  const handleProvinsiChange = (e) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setProvinsiId(id);
    setProvinsiName(name);
    setKota("");
    fetchKota(id);
  };

  // ── Checklist produk ──
  const toggleProduk = (nama) => {
    setSelectedProduk((prev) => {
      const next = new Set(prev);
      if (next.has(nama)) next.delete(nama);
      else next.add(nama);
      return next;
    });
  };
  const selectAll = () => setSelectedProduk(new Set(PRODUK_DEFAULT));
  const deselectAll = () => setSelectedProduk(new Set());

  // ── Skip ──
  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await completeProfile({});
      onComplete?.();
    } catch (err) {
      toast.error("Gagal: " + err.message, { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Selesai ──
  const handleFinish = async () => {
    if (!namaToko.trim()) {
      toast.error("Nama UMKM wajib diisi.", { position: "top-right" });
      return;
    }
    if (!noHp.trim()) {
      toast.error("No. HP wajib diisi.", { position: "top-right" });
      return;
    }
    if (!provinsiId) {
      toast.error("Pilih provinsi terlebih dahulu.", { position: "top-right" });
      return;
    }
    if (!kota) {
      toast.error("Pilih kota terlebih dahulu.", { position: "top-right" });
      return;
    }
    if (punyaPekerja && (!jumlahPekerja || Number(jumlahPekerja) < 1)) {
      toast.error("Jumlah tenaga kerja harus diisi minimal 1.", { position: "top-right" });
      return;
    }

    setIsSubmitting(true);
    try {
      const produkList = PRODUK_DEFAULT.filter((p) => selectedProduk.has(p)).map(makeDefaultProduk);
      await completeProfile({
        nama_toko: namaToko.trim(),
        no_hp: noHp.trim(),
        provinsi: provinsiName,
        kota,
        punya_pekerja: punyaPekerja,
        jumlah_pekerja: punyaPekerja ? Number(jumlahPekerja) : null,
        produk_list: produkList,
      });
      toast.success("Profil berhasil disimpan! Selamat menggunakan PercaMatika.", { position: "top-right" });
      onComplete?.();
    } catch (err) {
      toast.error("Gagal menyimpan: " + err.message, { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Styles ──
  const ic = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white";
  const label = "text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-6 pb-6 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Selamat Datang di PercaMatika! 👋</h2>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi profil UMKM Anda dan pilih produk yang sesuai. Bisa diubah kapan pun.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ═══ SECTION 1: Checklist Produk ═══ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700">Produk yang Anda Produksi</h3>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">Pilih Semua</button>
                <span className="text-gray-300">|</span>
                <button onClick={deselectAll} className="text-[11px] text-gray-500 hover:text-gray-700 font-medium">Hapus Semua</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRODUK_DEFAULT.map((nama) => {
                const checked = selectedProduk.has(nama);
                return (
                  <button
                    key={nama}
                    onClick={() => toggleProduk(nama)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all duration-150 ${
                      checked
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                      {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </span>
                    {nama}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {selectedProduk.size} produk dipilih. Detail produk bisa diisi nanti di menu <strong>Produk</strong>.
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* ═══ SECTION 2: Profil UMKM ═══ */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Profil UMKM</h3>
            <div className="space-y-3">

              <div>
                <label className={label}>Nama UMKM</label>
                <input className={ic} placeholder="Contoh: Serune Craft" value={namaToko} onChange={(e) => setNamaToko(e.target.value)} />
              </div>

              <div>
                <label className={label}>Email</label>
                <input className={`${ic} bg-gray-50 text-gray-500 cursor-not-allowed`} value={user?.email || ""} readOnly />
              </div>

              <div>
                <label className={label}>No. HP</label>
                <input className={ic} placeholder="Contoh: 08123456789" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
              </div>

              {/* Provinsi → Kota (cascading dari API) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Provinsi</label>
                  <div className="relative">
                    <select
                      className={`${ic} appearance-none pr-9`}
                      value={provinsiId}
                      onChange={handleProvinsiChange}
                    >
                      <option value="">— Pilih Provinsi —</option>
                      {provinsiList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={label}>Kota</label>
                  <div className="relative">
                    <select
                      className={`${ic} appearance-none pr-9 ${!provinsiId ? "opacity-50 cursor-not-allowed" : ""}`}
                      value={kota}
                      onChange={(e) => setKota(e.target.value)}
                      disabled={!provinsiId}
                    >
                      <option value="">
                        {isLoadingKota ? "Memuat..." : "— Pilih Kota —"}
                      </option>
                      {kotaList.map((k) => (
                        <option key={k.id} value={k.name}>{k.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Tenaga Kerja */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setPunyaPekerja(!punyaPekerja)}>
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${punyaPekerja ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                    {punyaPekerja && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-gray-700">Apakah Anda memiliki tenaga kerja tambahan?</span>
                </label>
                {punyaPekerja && (
                  <div className="mt-3 ml-7.5">
                    <label className={label}>Berapa jumlah tenaga kerja?</label>
                    <input type="number" min="1" className={`${ic} max-w-[200px]`} placeholder="Contoh: 3" value={jumlahPekerja} onChange={(e) => setJumlahPekerja(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button onClick={handleSkip} disabled={isSubmitting} className="flex items-center gap-1.5 px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 transition-colors">
            <SkipForward size={15} /> Lewati
          </button>
          <button onClick={handleFinish} disabled={isSubmitting} className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (<><Loader2 size={15} className="animate-spin" /> Menyimpan...</>) : (<><Check size={15} /> Selesai</>)}
          </button>
        </div>
      </div>
    </div>
  );
}