// src/lib/kalender.js
// Kalender Hijriah aritmetik (tabular, tipe II), akurat ±1–2 hari: cukup untuk penanda bulanan.
// Logika yang sama dengan notebook prakiraan, sehingga label di layar selaras dengan fitur model.

export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
export const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const NAMA_HIJRI = [
  "Muharam", "Safar", "Rabiulawal", "Rabiulakhir", "Jumadilawal", "Jumadilakhir",
  "Rajab", "Syaban", "Ramadhan", "Syawal", "Zulkaidah", "Zulhijah",
];

export function keHijri(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const bulan = Math.floor((24 * l) / 709);
  const hari = l - Math.floor((709 * bulan) / 24);
  const tahun = 30 * n + j - 30;
  return { tahun, bulan, hari };
}

/** Label Hijriah untuk tanggal 1 sampai akhir bulan, mis. "Rabiulakhir 1448 H". */
export function labelHijriBulan(tahun, bulan1) {
  const awal = keHijri(tahun, bulan1, 1);
  const akhir = keHijri(tahun, bulan1, new Date(tahun, bulan1, 0).getDate());
  const a = `${NAMA_HIJRI[awal.bulan - 1]} ${awal.tahun} H`;
  const b = `${NAMA_HIJRI[akhir.bulan - 1]} ${akhir.tahun} H`;
  return a === b ? a : `${NAMA_HIJRI[awal.bulan - 1]} – ${NAMA_HIJRI[akhir.bulan - 1]} ${akhir.tahun} H`;
}

/** Penanda musim permintaan untuk satu bulan Masehi: sama dengan fitur kalender pada model. */
export function penandaMusim(tahun, bulan1) {
  let ramadhan = false, fitri = false, adha = false;
  const hariDalamBulan = new Date(tahun, bulan1, 0).getDate();
  for (let d = 1; d <= hariDalamBulan; d++) {
    const h = keHijri(tahun, bulan1, d);
    if (h.bulan === 9) ramadhan = true;
    if (h.bulan === 10 && h.hari <= 7) fitri = true;
    if (h.bulan === 12 && h.hari >= 8 && h.hari <= 13) adha = true;
  }
  const label = [];
  if (ramadhan) label.push("Ramadhan");
  if (fitri) label.push("Idul Fitri");
  if (adha) label.push("Idul Adha");
  if (bulan1 === 11 || bulan1 === 12) label.push("Natal dan Tahun Baru");
  if (bulan1 === 6 || bulan1 === 7) label.push("Tahun ajaran baru");
  return label;
}
