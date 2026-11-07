// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../services/apiClient";

const AuthContext = createContext(null);

const TOKEN_KEY = "percamatika_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // {email, nama_toko, no_hp, kota, provinsi, punya_pekerja, jumlah_pekerja, first_login}
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState(null);

  // Saat app pertama load: kalau ada token, coba validasi & ambil profil
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    api.setAuthToken(token);
    api.fetchMe()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        api.setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const register = async ({ email, password, confirmPassword, namaToko, noHp, kota }) => {
    setError(null);
    const data = await api.registerUser({
      email,
      password,
      confirm_password: confirmPassword,
      nama_toko: namaToko,
      no_hp: noHp,
      kota,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    api.setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    setError(null);
    const data = await api.loginUser({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    api.setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    api.setAuthToken(null);
    setUser(null);
  };

  // ── BARU: Complete Profile (setelah modal onboarding / skip) ──
  const completeProfile = useCallback(async (profileData) => {
    setError(null);
    const data = await api.completeProfile(profileData);
    // Update user state dengan data terbaru dari backend
    setUser((prev) => ({ ...prev, ...data.user }));
    return data.user;
  }, []);

  // ── BARU: Refresh user data dari backend ──
  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.fetchMe();
      setUser(profile);
    } catch {
      // silent
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        setError,
        register,
        login,
        logout,
        completeProfile,
        refreshUser,
        isAuthenticated: !!user,
        firstLogin: user?.first_login === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}