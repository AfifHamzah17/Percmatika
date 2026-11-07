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

// ── BARU: Complete profile (setelah onboarding / skip) ──
export async function completeProfile(data) {
  return _request("POST", "/auth/complete-profile", data);
}

export async function fetchUserConfig() {
  return _request("GET", "/auth/user-config");
}

export async function saveUserConfig(produkList, umkm) {
  return _request("POST", "/auth/user-config", { produk_list: produkList, umkm });
}

// ─────────────────────────────────────────────────────────────────────
// DATA STATUS — gate "Mulai Hitung"
// ─────────────────────────────────────────────────────────────────────
export async function getDataStatus() {
  return _request("GET", "/data-status");
}

// ─────────────────────────────────────────────────────────────────────
// CACHED RESULT & PARAMS
// ─────────────────────────────────────────────────────────────────────
export async function fetchCachedResult(bulanTarget) {
  const headers = { "Content-Type": "application/json" };
  if (_authToken) headers["Authorization"] = `Bearer ${_authToken}`;

  const res = await fetch(
    `${BASE_URL}/api/cached-result?bulan_target=${encodeURIComponent(bulanTarget)}`,
    { headers }
  );

  // 404 = belum ada cache, ini normal → return null tanpa throw
  if (res.status === 404) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error ?? `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(msg.length > 150 ? msg.substring(0, 150) + "…" : msg);
  }
  return data;
}

export async function fetchParams() {
  return _request("GET", "/params");
}

export async function fetchLastResult() {
  return _request("GET", "/result");
}

// ─────────────────────────────────────────────────────────────────────
// HITUNG / OPTIMIZE / BENCHMARK
// ─────────────────────────────────────────────────────────────────────
export async function runHitung(bulanTarget, produkList = null, umkm = null, probs = null) {
  const body = { bulan_target: bulanTarget };
  if (produkList) body.produk_list = produkList;
  if (umkm) body.umkm = umkm;
  if (probs) body.probs = probs;
  return _request("POST", "/hitung", body);
}

export async function runOptimize(demandMatrix, probs, signal = null) {
  return _request("POST", "/optimize", { demand_matrix: demandMatrix, probs }, signal);
}

export async function runBenchmark(demandMatrix, probs) {
  return _request("POST", "/benchmark", { demand_matrix: demandMatrix, probs });
}

// ─────────────────────────────────────────────────────────────────────
// PENJUALAN CRUD
// ─────────────────────────────────────────────────────────────────────

// GET /api/penjualan?tahun=&produk_nama=
export async function getPenjualan(params = {}) {
  const query = new URLSearchParams();
  if (params.tahun) query.set("tahun", String(params.tahun));
  if (params.produk_nama) query.set("produk_nama", params.produk_nama);
  const qs = query.toString();
  const path = `/penjualan${qs ? `?${qs}` : ""}`;
  return _request("GET", path);
}

// POST /api/penjualan (single record)
export async function createPenjualan(record) {
  return _request("POST", "/penjualan", record);
}

// POST /api/penjualan (bulk — array of records)
export async function createPenjualanBulk(records) {
  return _request("POST", "/penjualan", { records });
}

// PUT /api/penjualan/<docId>
export async function updatePenjualan(docId, data) {
  return _request("PUT", `/penjualan/${docId}`, data);
}

// DELETE /api/penjualan/<docId>
export async function deletePenjualan(docId) {
  return _request("DELETE", `/penjualan/${docId}`);
}

// GET /api/penjualan/export (semua data, urut untuk export)
export async function getPenjualanExport() {
  return _request("GET", "/penjualan/export");
}

// ─────────────────────────────────────────────────────────────────────
// LEGACY class-based client — kept for backward compatibility
// ─────────────────────────────────────────────────────────────────────
class ApiClient {
  constructor(base) { this.base = base; }

  async postOptimize(payload, signal) {
    if (payload?.bulan_target) {
      return _request("POST", "/hitung", payload, signal);
    }
    return _request("POST", "/optimize", payload, signal);
  }
}

export const apiClient = new ApiClient(BASE_URL);