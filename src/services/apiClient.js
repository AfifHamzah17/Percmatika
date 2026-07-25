// src/services/apiClient.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

// ── Token auth (di-set oleh AuthContext saat login/logout) ─────────────
let _authToken = null;
export function setAuthToken(token) {
  _authToken = token;
}

// ── Low-level fetch helper ────────────────────────────────────────────
async function _request(method, path, body = null, signal = null) {
  const headers = { "Content-Type": "application/json" };
  if (_authToken) headers["Authorization"] = `Bearer ${_authToken}`;

  const options = { method, headers, ...(signal ? { signal } : {}) };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}/api${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error ?? `HTTP ${res.status}: ${res.statusText}`;
    const short = msg.length > 150 ? msg.substring(0, 150) + "…" : msg;
    throw new Error(short);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────
// AUTH — register, login, profil, config produk/UMKM tersimpan
// ─────────────────────────────────────────────────────────────────────
export async function registerUser(payload) {
  return _request("POST", "/auth/register", payload);
}

export async function loginUser(payload) {
  return _request("POST", "/auth/login", payload);
}

export async function fetchMe() {
  return _request("GET", "/auth/me");
}

export async function fetchUserConfig() {
  return _request("GET", "/auth/user-config");
}

export async function saveUserConfig(produkList, umkm) {
  return _request("POST", "/auth/user-config", { produk_list: produkList, umkm });
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/cached-result?bulan_target=YYYY-MM
// Return hasil /hitung tersimpan (kalau masih fresh <24 jam & bulan cocok).
// Throws (404) kalau tidak ada cache -- caller WAJIB panggil runHitung()
// kalau ini gagal.
// ─────────────────────────────────────────────────────────────────────
export async function fetchCachedResult(bulanTarget) {
  return _request("GET", `/cached-result?bulan_target=${encodeURIComponent(bulanTarget)}`);
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/params
// Ambil param_produk, param_umkm, produk_list dari backend.
// ─────────────────────────────────────────────────────────────────────
export async function fetchParams() {
  return _request("GET", "/params");
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/result
// Load tssp_output.json terakhir (tanpa re-run optimasi).
// Throws jika belum pernah hitung (404).
// ─────────────────────────────────────────────────────────────────────
export async function fetchLastResult() {
  return _request("GET", "/result");
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/hitung  ← ENDPOINT UTAMA
// Full pipeline: forecast → skenario → TSSP → VSS/VPI.
// Dipanggil tombol "Hitung" di dashboard.
//
// @param {string} bulanTarget    "YYYY-MM"  misal "2025-03"
// @param {Array}  [produkList]   dari AppContext.produkList -- param biaya/harga
//                                milik user SELALU dikirim di sini (bukan dari
//                                default server), sesuai kesepakatan.
// @param {Object} [umkm]         dari AppContext.umkm (Cr, Co, cost_overtime_hr, nama)
// @param {number[]} [probs]      opsional — override manual probabilitas skenario
// ─────────────────────────────────────────────────────────────────────
export async function runHitung(bulanTarget, produkList = null, umkm = null, probs = null) {
  const body = { bulan_target: bulanTarget };
  if (produkList) body.produk_list = produkList;
  if (umkm) body.umkm = umkm;
  if (probs) body.probs = probs;
  return _request("POST", "/hitung", body);
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/optimize  (standalone — debug / custom scenario)
// ─────────────────────────────────────────────────────────────────────
export async function runOptimize(demandMatrix, probs, signal = null) {
  return _request("POST", "/optimize", { demand_matrix: demandMatrix, probs }, signal);
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/benchmark  (VSS/VPI standalone)
// ─────────────────────────────────────────────────────────────────────
export async function runBenchmark(demandMatrix, probs) {
  return _request("POST", "/benchmark", { demand_matrix: demandMatrix, probs });
}

// ─────────────────────────────────────────────────────────────────────
// LEGACY class-based client — kept for backward compatibility
// (dashboard-model.js lama mungkin masih pakai apiClient.postOptimize)
// ─────────────────────────────────────────────────────────────────────
class ApiClient {
  constructor(base) { this.base = base; }

  async postOptimize(payload, signal) {
    // Kalau payload punya bulan_target, pakai /hitung (full pipeline)
    if (payload?.bulan_target) {
      return _request("POST", "/hitung", payload, signal);
    }
    // Fallback ke /optimize (demand_matrix manual)
    return _request("POST", "/optimize", payload, signal);
  }
}

export const apiClient = new ApiClient(BASE_URL);