import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "retailer" | "driver";

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  signup: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("pairdrop_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, _password: string, role: UserRole) => {
    const u = { email, name: email.split("@")[0], role };
    setUser(u);
    localStorage.setItem("pairdrop_user", JSON.stringify(u));
  };

  const signup = (name: string, email: string, _password: string, role: UserRole) => {
    const u = { email, name, role };
    setUser(u);
    localStorage.setItem("pairdrop_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pairdrop_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
