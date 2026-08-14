// src/features/penjualan/penjualan-view.jsx
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { BULAN_LABEL } from "./penjualan-model";

const ic =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function PenjualanView({
  penjualanList,
  isLoading,
  filterTahun,
  setFilterTahun,
  filterProduk,
  setFilterProduk,
  availableTahun,
  produkList,
  onAdd,
  onEdit,
  onDelete,
  onExportExcel,
  onExportPdf,
  isExporting,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formProduk, setFormProduk] = useState("");
  const [formBulan, setFormBulan] = useState(new Date().getMonth() + 1);
  const [formTahun, setFormTahun] = useState(new Date().getFullYear());
  const [formJumlah, setFormJumlah] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditMode(false);
    setEditId(null);
    setFormProduk(produkList.length > 0 ? produkList[0].nama : "");
    setFormBulan(new Date().getMonth() + 1);
    setFormTahun(new Date().getFullYear());
    setFormJumlah("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setFormProduk(item.produk_nama);
    setFormBulan(item.bulan);
    setFormTahun(item.tahun);
    setFormJumlah(String(item.jumlah_terjual));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formProduk) return;
    if (!formJumlah || Number(formJumlah) < 0) return;

    setIsSaving(true);
    try {
      const record = {
        produk_nama: formProduk,
        bulan: Number(formBulan),
        tahun: Number(formTahun),
        jumlah_terjual: Number(formJumlah),
      };
      if (editMode && editId) {
        await onEdit(editId, record);
      } else {
        await onAdd(record);
      }
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus data penjualan "${item.produk_nama}" bulan ${BULAN_LABEL[item.bulan]} ${item.tahun}?`)) return;
    await onDelete(item.id);
  };

  // Group by produk untuk summary
  const grouped = {};
  for (const p of penjualanList) {
    if (!grouped[p.produk_nama]) grouped[p.produk_nama] = [];
    grouped[p.produk_nama].push(p);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Data Penjualan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {penjualanList.length} record penjualan
            {filterTahun ? ` — tahun ${filterTahun}` : ""}
            {filterProduk ? ` — ${filterProduk}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText size={15} /> PDF
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Plus size={15} /> Tambah
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <Filter size={15} className="text-gray-400 shrink-0" />
        <select
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterTahun}
          onChange={(e) => setFilterTahun(Number(e.target.value) || "")}
        >
          <option value="">Semua Tahun</option>
          {availableTahun.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterProduk}
          onChange={(e) => setFilterProduk(e.target.value)}
        >
          <option value="">Semua Produk</option>
          {produkList.map((p) => (
            <option key={p.nama} value={p.nama}>
              {p.nama}
            </option>
          ))}
        </select>
        {(filterTahun || filterProduk) && (
          <button
            onClick={() => {
              setFilterTahun("");
              setFilterProduk("");
            }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : penjualanList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              Belum ada data penjualan.
            </p>
            <button
              onClick={openAdd}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Tambah data pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "#",
                    "Produk",
                    "Bulan",
                    "Tahun",
                    "Jumlah Terjual",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-500 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penjualanList.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.produk_nama}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {BULAN_LABEL[item.bulan]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.tahun}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {item.jumlah_terjual}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ MODAL FORM ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editMode ? "Edit Data Penjualan" : "Tambah Data Penjualan"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                  Produk
                </label>
                <select
                  className={ic}
                  value={formProduk}
                  onChange={(e) => setFormProduk(e.target.value)}
                  required
                >
                  <option value="">— Pilih Produk —</option>
                  {produkList.map((p) => (
                    <option key={p.nama} value={p.nama}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                    Bulan
                  </label>
                  <select
                    className={ic}
                    value={formBulan}
                    onChange={(e) => setFormBulan(Number(e.target.value))}
                    required
                  >
                    {BULAN_LABEL.slice(1).map((b, i) => (
                      <option key={i} value={i + 1}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                    Tahun
                  </label>
                  <input
                    type="number"
                    className={ic}
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5 block">
                  Jumlah Terjual (unit)
                </label>
                <input
                  type="number"
                  className={ic}
                  value={formJumlah}
                  onChange={(e) => setFormJumlah(e.target.value)}
                  min="0"
                  placeholder="Contoh: 25"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  {editMode ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}