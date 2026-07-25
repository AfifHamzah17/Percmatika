//src/components/modal/InputDataModal.jsx
import { useState, useRef } from "react";
import { X, Upload, Download, Plus, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { downloadTemplate, readExcel, COLUMNS } from "../../services/excelService";
import { saveUserConfig } from "../../services/apiClient";
import ConfirmModal from "./ConfirmModal";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col modal-anim">{children}</div>
    </div>
  );
}

const EMPTY = { nama:"", harga_jual:0, biaya_material:0, biaya_tk:0, waktu_jam:1, ongkir_ekspres:0, penalti_backorder:0, lead_time:7 };

export default function InputDataModal({ isOpen, onClose, onRun }) {
  const { umkm, setUmkm, produkList, setProdukList } = useApp();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState("form");
  const [localUmkm, setLocalUmkm] = useState({ ...umkm });
  const [localProduk, setLocalProduk] = useState([...produkList]);
  const [excelPreview, setExcelPreview] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const fileRef = useRef(null);

  const handleSaveForm = () => {
    const valid = localProduk.filter(p => p.nama && p.harga_jual > 0);
    if (valid.length === 0) return;
    setUmkm(localUmkm);
    setProdukList(valid);
    if (isAuthenticated) {
      saveUserConfig(valid, localUmkm).catch(() => { /* gagal simpan ke server -- state lokal tetap terupdate */ });
    }
    onClose();
    onRun();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { products, umkm: u } = await readExcel(file);
      if (products.length === 0) { alert("Tidak ada data produk ditemukan"); return; }
      setExcelPreview({ products, umkm: u });
      setLocalProduk(products);
      setLocalUmkm(u);
    } catch (err) { alert("Gagal membaca file: " + err.message); }
  };

  const handleSaveExcel = () => {
    setUmkm(localUmkm);
    setProdukList(localProduk);
    if (isAuthenticated) {
      saveUserConfig(localProduk, localUmkm).catch(() => { /* gagal simpan ke server -- state lokal tetap terupdate */ });
    }
    setExcelPreview(null);
    onClose();
    onRun();
  };

  const confirmDelete = () => {
    setLocalProduk(localProduk.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  };

  const updateProduk = (idx, key, val) => {
    const next = [...localProduk];
    next[idx] = { ...next[idx], [key]: key === "nama" ? val : Number(val) || 0 };
    setLocalProduk(next);
  };
  const addProduk = () => setLocalProduk([...localProduk, { ...EMPTY }]);
  const ic = "w-full px-2.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Input Data Produksi</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
      </div>

      <div className="flex border-b border-gray-100 px-6">
        {["form","excel"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t === "form" ? "Form Input" : "Upload Excel"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Parameter UMKM</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Nama UMKM</label><input className={ic} value={localUmkm.nama} onChange={e => setLocalUmkm({...localUmkm, nama:e.target.value})} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Kapasitas Reguler (jam)</label><input type="number" className={ic} value={localUmkm.Cr} onChange={e => setLocalUmkm({...localUmkm, Cr:Number(e.target.value)})} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Kapasitas Lembur (jam)</label><input type="number" className={ic} value={localUmkm.Co} onChange={e => setLocalUmkm({...localUmkm, Co:Number(e.target.value)})} /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Biaya Lembur/jam (Rp)</label><input type="number" className={ic} value={localUmkm.cost_overtime_hr} onChange={e => setLocalUmkm({...localUmkm, cost_overtime_hr:Number(e.target.value)})} /></div>
          </div>
        </div>

        {tab === "form" ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700">Data Produk ({localProduk.length})</h3>
              <button onClick={addProduk} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"><Plus size={14} /> Tambah</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">{COLUMNS.map(c => <th key={c.key} className="px-2.5 py-2.5 text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold whitespace-nowrap">{c.header}</th>)}<th className="w-10" /></tr></thead>
                <tbody>
                  {localProduk.map((p, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-1"><input className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md" value={p.nama} onChange={e => updateProduk(i,"nama",e.target.value)} placeholder="Nama" /></td>
                      {["harga_jual","biaya_material","biaya_tk","waktu_jam","ongkir_ekspres","penalti_backorder","lead_time"].map(k => (
                        <td key={k} className="p-1"><input type="number" className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md text-right" value={p[k]} onChange={e => updateProduk(i,k,e.target.value)} /></td>
                      ))}
                      <td className="p-1"><button onClick={() => setDeleteIdx(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"><Download size={15} /> Download Template</button>
              <span className="text-xs text-gray-500">Format .xlsx — isi sesuai petunjuk kolom</span>
            </div>

            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-medium">Klik atau drag file Excel ke sini</p>
              <p className="text-xs text-gray-400 mt-1">.xlsx maks 5MB</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
            </div>

            {excelPreview && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2">Preview: {excelPreview.products.length} produk terdeteksi</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs"><thead><tr className="text-left text-blue-600">{COLUMNS.map(c => <th key={c.key} className="px-2 py-1.5 font-semibold whitespace-nowrap">{c.header}</th>)}</tr></thead>
                  <tbody>{excelPreview.products.slice(0,5).map((p,i) => (
                    <tr key={i} className="border-t border-blue-100">
                      <td className="px-2 py-1">{p.nama}</td><td className="px-2 py-1 text-right">{p.harga_jual?.toLocaleString()}</td><td className="px-2 py-1 text-right">{p.biaya_material?.toLocaleString()}</td><td className="px-2 py-1 text-right">{p.biaya_tk?.toLocaleString()}</td><td className="px-2 py-1 text-right">{p.waktu_jam}</td><td className="px-2 py-1 text-right">{p.ongkir_ekspres?.toLocaleString()}</td><td className="px-2 py-1 text-right">{p.penalti_backorder?.toLocaleString()}</td><td className="px-2 py-1 text-right">{p.lead_time}</td>
                    </tr>
                  ))}</tbody></table>
                </div>
                {excelPreview.products.length > 5 && <p className="text-xs text-blue-500 mt-1">...dan {excelPreview.products.length - 5} produk lainnya</p>}
              </div>
            )}

            {/* Panduan Kolom + Contoh Tabel */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Panduan Kolom</h4>
              <div className="space-y-1.5">
                {COLUMNS.map((c, i) => (
                  <div key={c.key} className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center font-bold">{String.fromCharCode(65 + i)}</span>
                    <span className="text-gray-600"><span className="font-semibold text-gray-800">{c.header}</span></span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Contoh Isi Tabel</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-[11px]">
                    <thead><tr className="bg-blue-50">{COLUMNS.map(c => <th key={c.key} className="px-2 py-2 text-left font-semibold text-blue-800 whitespace-nowrap">{String.fromCharCode(65+COLUMNS.indexOf(c))}. {c.header.split("(")[0].trim()}</th>)}</tr></thead>
                    <tbody>
                      {["Sajadah","Selimut Quilting","Totebag"].map((nama,ri) => {
                        const s = ri===0?{h:162500,m:35000,t:15000,w:2.5,o:15000,p:20000,l:14}:ri===1?{h:192500,m:40000,t:18000,w:3.5,o:20000,p:25000,l:8}:{h:85000,m:20000,t:10000,w:1,o:8000,p:10000,l:10};
                        return (
                          <tr key={nama} className={ri%2===1?"bg-gray-50":""}>
                            <td className="px-2 py-1.5 font-medium text-gray-800">{nama}</td>
                            <td className="px-2 py-1.5 text-right">{s.h.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">{s.m.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">{s.t.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">{s.w}</td>
                            <td className="px-2 py-1.5 text-right">{s.o.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">{s.p.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right">{s.l}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-1 text-[11px] text-gray-500">
                  <p><span className="font-semibold text-gray-700">Baris 4-8:</span> Parameter UMKM (kapasitas, biaya lembur)</p>
                  <p><span className="font-semibold text-gray-700">Baris 10:</span> Header kolom produk (jangan diubah)</p>
                  <p><span className="font-semibold text-gray-700">Baris 11+:</span> Data produk (tambahkan sesuai kebutuhan)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium">Batal</button>
        <button onClick={tab === "form" ? handleSaveForm : handleSaveExcel} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors">Simpan & Hitung</button>
      </div>

      <ConfirmModal
        isOpen={deleteIdx !== null}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus "${localProduk[deleteIdx]?.nama}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteIdx(null)}
      />
    </Modal>
  );
}