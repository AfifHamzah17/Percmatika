# Kontrak API untuk AI baru (disiapkan di frontend, diisi backend pada tahap berikutnya)

Frontend sudah membaca blok **opsional** `ai` pada respons `POST /hitung` (atau endpoint hitung yang dipakai sekarang).
Bila blok ini **tidak ada** (backend lama), halaman tetap berfungsi dan panel AI otomatis disembunyikan.
Pembaca: `src/features/dashboard/dashboard-model.js` → fungsi `extractAi(raw)`.

## Bentuk blok `ai`

```json
{
  "ai": {
    "prakiraan": {
      "model": "Ensemble (XGBoost + LSTM)",
      "bobot_lstm": 0.39,
      "mase": 0.89,
      "baseline_terbaik": "TSB",
      "bulan_uji": 9
    },
    "skenario": {
      "mu":    [0.70, 0.85, 1.00, 1.20, 1.50],
      "bobot": [0.22, 0.40, 0.26, 0.09, 0.03],
      "prior": [0.29, 0.37, 0.24, 0.08, 0.02]
    },
    "optimasi": {
      "metode": "PHA",
      "status": "natural",
      "iterasi": 12,
      "gap_ef_pct": 0.2
    }
  }
}
```

| Field | Wajib | Catatan |
|---|---|---|
| `skenario.mu`, `skenario.bobot` | ya, bila `skenario` ada | panjang sama; `bobot` berjumlah 1 |
| `skenario.prior` | tidak | bobot awal sebelum pembaruan; bila ada, ditampilkan sebagai garis putus |
| `optimasi.status` | ya, bila `optimasi` ada | `"natural"` = semua skenario sepakat sebelum batas iterasi. Nilai lain (`"dipaksa"`) ditampilkan sebagai peringatan |
| `optimasi.gap_ef_pct` | tidak | selisih nilai terhadap optimum *extensive form*, dalam persen |
| `prakiraan.mase` | tidak | < 1 berarti lebih baik daripada naive-1 |

Field lama (`tssp.alokasi_produk`, `vss_vpi`, `jadwal_pengadaan`, `tssp.kapasitas`, `forecast P10/P50/P90`) **tidak berubah**.

## Hal yang perlu diputuskan saat backend dikerjakan

1. **Satuan waktu produk.** Frontend sekarang menyimpan `waktu_jam` (jam kerja per unit, sesuai survei C6) dan mengisi
   `waktu_hari = waktu_jam / 24` agar backend lama yang membaca `waktu_hari * 24` tetap mendapat angka jam yang sama.
   Backend baru sebaiknya membaca `waktu_jam` saja.
2. **Parameter yang belum punya kolom di form:** minimum batch (`qmin`), kerugian *backorder* per unit (`beta`),
   porsi kebutuhan yang boleh lewat ekspres (`theta`), kenaikan biaya ekspres (%). Notebook memakai nilai klaster dari survei;
   backend perlu default yang sama atau kolom baru di form Produk.
3. **Klaster.** Notebook memakai 3 klaster skala usaha. Backend perlu memetakan tiap pengguna ke klaster (K-Means tersimpan di
   `klaster.joblib`) atau memakai parameter pengguna sendiri.
4. **`e_ekspres_label`** masih berupa teks (mis. "1 unit(P50)/3 unit(peak)"). Frontend mengambil angka pertama untuk menggambar
   kotak. Lebih baik backend mengirim angka (`e_ekspres_unit`) agar tidak bergantung pada teks.
5. **Data contoh.** Bila server gagal merespons, frontend menampilkan data contoh dengan label jelas "Data contoh" dan menandai
   `isMock: true`. Jangan kirim data contoh dari backend tanpa penanda yang sama.
