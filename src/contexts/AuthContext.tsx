import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export type UserRole = "retailer" | "driver";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<string | null>;
  signup: (name: string, email: string, password: string, role: UserRole, vehicleType?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // true while we check existing session

  // On app load, check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) await loadUserProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Look up the user's profile from retailers or riders table
  const loadUserProfile = async (authId: string) => {
    // Check retailers first
    const { data: retailer } = await supabase
      .from("retailers")
      .select("retailer_id, full_name, email")
      .eq("auth_id", authId)
      .single();

    if (retailer) {
      setUser({
        id: retailer.retailer_id,
        email: retailer.email,
        name: retailer.full_name,
        role: "retailer",
      });
      return;
    }

    // Check riders
    const { data: rider } = await supabase
      .from("riders")
      .select("rider_id, full_name, email")
      .eq("auth_id", authId)
      .single();

    if (rider) {
      setUser({
        id: rider.rider_id,
        email: rider.email,
        name: rider.full_name,
        role: "driver",
      });
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    // Verify the user actually belongs to the role they selected
    const table = role === "retailer" ? "retailers" : "riders";
    const idCol = role === "retailer" ? "retailer_id" : "rider_id";
    const { data: profile } = await supabase
      .from(table)
      .select(idCol)
      .eq("auth_id", data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return `No ${role} account found for this email. Please check your role or sign up.`;
    }

    return null; // null = success
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    vehicleType?: string
  ): Promise<string | null> => {
    // Step 1: Create the auth account
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (!data.user) return "Signup failed, please try again.";

    const authId = data.user.id;

    // Step 2: Insert into the correct table based on role
    if (role === "retailer") {
      const { error: insertError } = await supabase.from("retailers").insert({
        auth_id: authId,
        full_name: name,
        email: email,
      });
      if (insertError) return insertError.message;
    } else {
      const { error: insertError } = await supabase.from("riders").insert({
        auth_id: authId,
        full_name: name,
        email: email,
        vehicle_type: vehicleType || null,
      });
      if (insertError) return insertError.message;
    }

    return null; // null = success
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};