import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify token and get user details immediately
          const res = await api.get("user/me/");
          setUser(res.data);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem("access_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (accessToken) => {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
    try {
      const res = await api.get("user/me/");
      setUser(res.data);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
