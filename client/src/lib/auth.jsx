// ===================================================================
// Auth context — holds the current user and provides login/logout/signup.
// Token is persisted in localStorage (see lib/api.js).
// ===================================================================

import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch /api/auth/me to rehydrate the session.
  useEffect(() => {
    const token = localStorage.getItem("flashmaster_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null); // bad/expired token, clear it
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.post("/api/auth/login", { email, password });
    setToken(token);
    setUser(user);
    return user;
  };

  const signup = async (payload) => {
    const { user, token } = await api.post("/api/auth/signup", payload);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
