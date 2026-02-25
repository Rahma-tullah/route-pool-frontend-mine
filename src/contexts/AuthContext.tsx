import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { api } from "@/services/api";

export type UserRole = "retailer" | "rider";

interface User {
  id: string;
  email: string;
  name: string;
  user_type: "rider" | "retailer" | "driver";
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
  const [loading, setLoading] = useState(true);

  // ================================
  // Restore Session On App Load
  // ================================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("routepool_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      localStorage.removeItem("routepool_user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================
  // Signup
  // ================================
  const signup = async (data: SignupData): Promise<string | null> => {
    try {
      const result = await api.signup(data);
      if (!result.success) {
        return result.error || "Signup failed";
      }
      return null;
    } catch (error: any) {
      return error.message || "Signup failed";
    }
  };

  // ================================
  // Send OTP
  // ================================
  const sendOTP = async (email: string): Promise<string | null> => {
    try {
      const result = await api.sendOTP(email);
      if (!result.success) {
        return result.error || "Failed to send OTP";
      }
      return null;
    } catch (error: any) {
      return error.message || "Failed to send OTP";
    }
  };

  // ================================
  // Verify OTP (Login)
  // ================================
  const verifyOTP = async (
    email: string,
    otp: string,
  ): Promise<string | null> => {
    try {
      const result = await api.verifyOTP(email, otp);
      if (!result.success) {
        return result.error || "Verification failed";
      }

      if (result.data?.user) {
        const loggedInUser: User = {
          id: result.data.user.id || "",
          email: result.data.user.email,
          name: result.data.user.name,
          user_type: result.data.user.user_type,
        };

        setUser(loggedInUser);
        localStorage.setItem("routepool_user", JSON.stringify(loggedInUser));
      }

      return null;
    } catch (error: any) {
      return error.message || "Verification failed";
    }
  };

  // ================================
  // Logout
  // ================================
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("routepool_user");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};