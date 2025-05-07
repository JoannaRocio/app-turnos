import React, { createContext, useContext, useState, useMemo } from "react";
import AuthService from "../services/AuthService";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [userRole, setUserRole] = useState<string | null>(AuthService.getRole());

  const login = () => {
    setIsAuthenticated(true);
    setUserRole(AuthService.getRole());
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const value = useMemo(() => ({
    isAuthenticated,
    userRole,
    login,
    logout
  }), [isAuthenticated, userRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
