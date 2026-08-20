import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
    return res;
  };

  const logout = () => {
    api.clearToken();
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
