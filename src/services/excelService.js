// src/services/excelService.js
import ExcelJS from "exceljs";

const COLUMNS = [
  { key:"nama", header:"Nama Produk", width:20 },
  { key:"harga_jual", header:"Harga Jual (Rp/unit)", width:22 },
  { key:"biaya_material", header:"Biaya Material (Rp/unit)", width:26 },
  { key:"biaya_tk", header:"Biaya TK Reguler (Rp/unit)", width:26 },
  { key:"waktu_jam", header:"Waktu Produksi (jam/unit)", width:26 },
  { key:"ongkir_ekspres", header:"Ongkir Ekspres (Rp/unit)", width:24 },
  { key:"penalti_backorder", header:"Penalti Backorder (Rp/unit)", width:26 },
  { key:"lead_time", header:"Lead Time (hari)", width:18 },
];

const SAMPLE = [
  { nama:"Sajadah", harga_jual:162500, biaya_material:35000, biaya_tk:15000, waktu_jam:2.5, ongkir_ekspres:15000, penalti_backorder:20000, lead_time:14 },
  { nama:"Selimut Quilting", harga_jual:192500, biaya_material:40000, biaya_tk:18000, waktu_jam:3.5, ongkir_ekspres:20000, penalti_backorder:25000, lead_time:8 },
  { nama:"Totebag", harga_jual:85000, biaya_material:20000, biaya_tk:10000, waktu_jam:1.0, ongkir_ekspres:8000, penalti_backorder:10000, lead_time:10 },
];

const thinBorder = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin" }};

export async function downloadTemplate() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Data Produk");

  // Row 1: Title
  ws.mergeCells("A1:H1");
  const t1 = ws.getCell("A1");
  t1.value = "TEMPLATE DATA PERCAMATIKA";
  t1.font = { bold:true, size:14, color:{argb:"FFFFFFFF"} };
  t1.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF1E40AF"} };
  t1.alignment = { horizontal:"center", vertical:"middle" };
  ws.getRow(1).height = 36;

  // Row 2: Subtitle
  ws.mergeCells("A2:H2");
  const t2 = ws.getCell("A2");
  t2.value = "Isi data sesuai petunjuk kolom. Jangan ubah nama header.";
  t2.font = { italic:true, size:10, color:{argb:"FF6B7280"} };
  t2.alignment = { horizontal:"center" };
  ws.getRow(2).height = 22;

  // Row 3: Empty
  ws.getRow(3).height = 8;

  // Row 4: UMKM section header
  ws.mergeCells("A4:H4");
  const p1 = ws.getCell("A4");
  p1.value = "PARAMETER UMKM (isi di kolom B)";
  p1.font = { bold:true, size:11, color:{argb:"FFFFFFFF"} };
  p1.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF059669"} };
  p1.alignment = { horizontal:"left", vertical:"middle" };
  ws.getRow(4).height = 28;

  // Rows 5-8: UMKM params
  const umkmRows = [
    { label:"Nama UMKM", sample:"Bu Aminah, Medan" },
    { label:"Kapasitas Reguler (jam/bulan)", sample:160 },
    { label:"Kapasitas Lembur (jam/bulan)", sample:200 },
    { label:"Biaya Lembur per Jam (Rp)", sample:25000 },
  ];
  umkmRows.forEach((item, i) => {
    const rn = 5 + i;
    const c1 = ws.getCell(`A${rn}`);
    c1.value = item.label;
    c1.font = { bold:true, size:10 };
    c1.border = thinBorder;
    c1.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FFECFDF5"} };
    const c2 = ws.getCell(`B${rn}`);
    c2.value = item.sample;
    c2.font = { size:10 };
    c2.border = thinBorder;
    c2.alignment = { horizontal:"center" };
    ws.mergeCells(`B${rn}:H${rn}`);
    ws.getRow(rn).height = 22;
  });

  // Row 9: Empty
  ws.getRow(9).height = 8;

  // Row 10: Product headers
  const hr = ws.getRow(10);
  hr.height = 28;
  COLUMNS.forEach((col, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold:true, size:10, color:{argb:"FFFFFFFF"} };
    cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:"FF3B82F6"} };
    cell.alignment = { horizontal:"center", vertical:"middle", wrapText:true };
    cell.border = thinBorder;
    ws.getColumn(i + 1).width = col.width;
  });

  // Rows 11+: Sample data
  SAMPLE.forEach((row, ri) => {
    const r = ws.getRow(11 + ri);
    r.height = 22;
    COLUMNS.forEach((col, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = row[col.key];
      cell.font = { size:10 };
      cell.alignment = { horizontal: ci === 0 ? "left" : "center" };
      cell.border = thinBorder;
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "template_percamatika.xlsx"; a.click();
  URL.revokeObjectURL(url);
}

export async function readExcel(file) {
  const ab = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(ab);
  const ws = wb.worksheets[0];

  const products = [];
  let umkm = { nama:"", Cr:160, Co:200, cost_overtime_hr:25000 };

  ws.eachRow((row, rn) => {
    if (rn < 11) return;
    const nama = row.getCell(1).value;
    if (!nama || typeof nama !== "string") return;
    const harga_jual = Number(row.getCell(2).value) || 0;
    if (harga_jual === 0) return;
    products.push({
      nama,
      harga_jual,
      biaya_material: Number(row.getCell(3).value) || 0,
      biaya_tk: Number(row.getCell(4).value) || 0,
      waktu_jam: Number(row.getCell(5).value) || 1,
      ongkir_ekspres: Number(row.getCell(6).value) || 0,
      penalti_backorder: Number(row.getCell(7).value) || 0,
      lead_time: Number(row.getCell(8).value) || 7,
    });
  });

  const nm = ws.getCell("B5").value;
  const cr = ws.getCell("B6").value;
  const co = ws.getCell("B7").value;
  const cot = ws.getCell("B8").value;
  if (nm) umkm.nama = String(nm);
  if (cr) umkm.Cr = Number(cr);
  if (co) umkm.Co = Number(co);
  if (cot) umkm.cost_overtime_hr = Number(cot);

  return { products, umkm };
}

export { COLUMNS };