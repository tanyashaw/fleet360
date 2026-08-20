import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fleet360_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return { name: "Operations Manager", role: "MANAGER", email: "manager@fleet360.in" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(api.getToken()) || true;
  });

  const login = async (email, password) => {
    const res = await api.login(email, password);
    const userInfo = res.user || {
      name: email ? email.split("@")[0].toUpperCase() + " User" : "Operations Manager",
      email: email || "manager@fleet360.in",
      role: email?.includes("admin") ? "ADMIN" : email?.includes("manager") ? "MANAGER" : "ANALYST"
    };
    setUser(userInfo);
    setIsAuthenticated(true);
    localStorage.setItem("fleet360_user", JSON.stringify(userInfo));
    return res;
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem("fleet360_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
