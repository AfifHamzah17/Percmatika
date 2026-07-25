// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import * as api from "../services/apiClient";

const AuthContext = createContext(null);

const TOKEN_KEY = "percamatika_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // {email, nama_toko, no_hp, kota}
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState(null);

  // Saat app pertama load: kalau ada token tersimpan, coba validasi & ambil profil
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return; // isLoading sudah false dari inisialisasi state di atas
    api.setAuthToken(token);
    api.fetchMe()
      .then((profile) => setUser(profile))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); api.setAuthToken(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const register = async ({ email, password, confirmPassword, namaToko, noHp, kota }) => {
    setError(null);
    const data = await api.registerUser({
      email, password, confirm_password: confirmPassword,
      nama_toko: namaToko, no_hp: noHp, kota,
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

  return (
    <AuthContext.Provider value={{ user, isLoading, error, setError, register, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
