<<<<<<< HEAD
import React, { createContext, useContext, useState } from "react";
=======
import React, { createContext, useContext, useState, useEffect } from "react";
>>>>>>> 57350ca (final commit)
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
  const [user, setUser] = useState({
    name: "Operations Controller",
    role: "CFO / Operations Manager",
    email: "controller@fleet360.io"
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setUser(res.user);
    setIsAuthenticated(true);
=======
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("fleet360_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(api.getToken());
  });

  const login = async (email, password) => {
    const res = await api.login(email, password);
    const userInfo = res.user || {
      name: email.split("@")[0].toUpperCase() + " User",
      email: email,
      role: email.includes("admin") ? "ADMIN" : email.includes("manager") ? "MANAGER" : "ANALYST"
    };
    setUser(userInfo);
    setIsAuthenticated(true);
    localStorage.setItem("fleet360_user", JSON.stringify(userInfo));
>>>>>>> 57350ca (final commit)
    return res;
  };

  const logout = () => {
    api.clearToken();
<<<<<<< HEAD
=======
    localStorage.removeItem("fleet360_user");
>>>>>>> 57350ca (final commit)
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
