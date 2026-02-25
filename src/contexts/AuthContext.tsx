import React, { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/services/api";

export type UserRole = "retailer" | "rider";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (data: SignupData) => Promise<string | null>;
  sendOTP: (email: string) => Promise<string | null>;
  verifyOTP: (email: string, otp: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  user_type: "retailer" | "rider";
  shop_name?: string;
  vehicle_type?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signup = async (data: SignupData): Promise<string | null> => {
    setLoading(true);
    try {
      const result = await api.signup(data);
      if (!result.success) {
        return result.error || "Signup failed";
      }
      return null;
    } catch (error: any) {
      return error.message || "Signup failed";
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (email: string): Promise<string | null> => {
    setLoading(true);
    try {
      const result = await api.sendOTP(email);
      if (!result.success) {
        return result.error || "Failed to send OTP";
      }
      return null;
    } catch (error: any) {
      return error.message || "Failed to send OTP";
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (
    email: string,
    otp: string,
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const result = await api.verifyOTP(email, otp);
      if (!result.success) {
        return result.error || "Verification failed";
      }

      if (result.data?.user) {
        setUser({
          id: result.data.user.id || "",
          email: result.data.user.email,
          name: result.data.user.name,
          role:
            result.data.user.user_type === "retailer" ? "retailer" : "rider",
        });
      }

      return null;
    } catch (error: any) {
      return error.message || "Verification failed";
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (error: any) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        sendOTP,
        verifyOTP,
        logout,
        isAuthenticated: !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
