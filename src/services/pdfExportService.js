// src/services/pdfExportService.js
// Export PDF data penjualan pakai @react-pdf/renderer
// Style: tabel berwarna, header biru, alternating row

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import PenjualanPdfDocument from "../components/pdf/PenjualanPdfDocument";

const { BULAN_LABEL } = [
  "",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export async function generatePenjualanPdf(data) {
  const rows = data.map((d, i) => ({
    no: i + 1,
    produk: d.produk_nama,
    bulan: BULAN_LABEL[d.bulan] || String(d.bulan),
    tahun: String(d.tahun),
    jumlah: String(d.jumlah_terjual),
  }));

  const doc = (
    <PenjualanPdfDocument
      rows={rows}
      namaUmkm="PercaMatika User"
      tanggalExport={new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    />
  );

  const blob = await pdf(doc).toBlob();
  saveAs(blob, `Data_Penjualan_PercaMatika_${new Date().toISOString().slice(0, 10)}.pdf`);
}