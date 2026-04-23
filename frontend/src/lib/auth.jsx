import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "./api.js";

// Context is React's built-in way to share data without passing it through
// every component as a prop. We wrap the whole app in <AuthProvider> and
// then any page can call useAuth() to read the user and login/logout functions.
const AuthContext = createContext(null);

export function AuthProvider(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, fetch the user from the server.
  useEffect(function () {
    const token = localStorage.getItem("flashmaster_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/api/auth/me")
      .then(function (data) {
        setUser(data.user);
      })
      .catch(function () {
        // Token was invalid or expired. Clear it.
        setToken(null);
        setUser(null);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const response = await api.post("/api/auth/login", {
      email: email,
      password: password,
    });
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function signup(payload) {
    const response = await api.post("/api/auth/signup", payload);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = {
    user: user,
    loading: loading,
    login: login,
    signup: signup,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}

// Small helper so pages can just call useAuth() instead of useContext(AuthContext).
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
