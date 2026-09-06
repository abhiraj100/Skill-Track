import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("skilltrack_user")) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("skilltrack_token");
    if (!token) return setLoading(false);
    api.get("/auth/me").then(({ data }) => {
      setUser(data.user);
      localStorage.setItem("skilltrack_user", JSON.stringify(data.user));
    }).catch(() => logout()).finally(() => setLoading(false));
  }, []);

  function saveAuth(data) {
    localStorage.setItem("skilltrack_token", data.token);
    localStorage.setItem("skilltrack_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(values) {
    const { data } = await api.post("/auth/login", values);
    saveAuth(data);
  }

  async function register(values) {
    const { data } = await api.post("/auth/register", values);
    saveAuth(data);
  }

  function logout() {
    localStorage.removeItem("skilltrack_token");
    localStorage.removeItem("skilltrack_user");
    setUser(null);
  }

  async function updateProfile(values) {
    const { data } = await api.put("/auth/profile", values);
    setUser(data.user);
    localStorage.setItem("skilltrack_user", JSON.stringify(data.user));
    return data.user;
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
