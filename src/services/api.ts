import { supabase } from "@/lib/supabase";

interface SignupData {
  name: string;
  email: string;
  phone: string;
  user_type: "retailer" | "rider";
  shop_name?: string;
  vehicle_type?: string;
}

export const api = {
  // ================================
  // Signup — create profile in DB
  // ================================
  signup: async (data: SignupData) => {
    try {
      const table = data.user_type === "retailer" ? "RETAILERS" : "RIDERS";

      // Check if user already exists
      const { data: existing } = await supabase
        .from(table)
        .select("Email")
        .eq("Email", data.email)
        .single();

      if (existing) {
        return { success: false, error: "An account with this email already exists" };
      }

      // Insert into correct table
      if (data.user_type === "retailer") {
        const { error } = await supabase.from("RETAILERS").insert({
          Full_Name: data.name,
          Email: data.email,
          Phone_no: data.phone,
          Shop_name: data.shop_name || "",
          is_active: false,
        });
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase.from("RIDERS").insert({
          Full_name: data.name,
          Email: data.email,
          Phone_no: data.phone,
          Vehicle_type: data.vehicle_type || "",
          is_active: false,
        });
        if (error) return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Signup failed" };
    }
  },

  // ================================
  // Send OTP via Supabase magic link
  // ================================
  sendOTP: async (email: string) => {
    try {
      // Check user exists in either table
      const { data: retailer } = await supabase
        .from("RETAILERS")
        .select("Email")
        .eq("Email", email)
        .single();

      const { data: rider } = await supabase
        .from("RIDERS")
        .select("Email")
        .eq("Email", email)
        .single();

      if (!retailer && !rider) {
        return { success: false, error: "No account found with this email" };
      }

      // Send OTP via Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) return { success: false, error: error.message };

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to send OTP" };
    }
  },

  // ================================
  // Verify OTP + fetch user profile
  // ================================
  verifyOTP: async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: "Verification failed" };

      // Fetch profile from RETAILERS first
      const { data: retailer } = await supabase
        .from("RETAILERS")
        .select("Retailer_ID, Full_Name, Email")
        .eq("Email", email)
        .single();

      if (retailer) {
        return {
          success: true,
          data: {
            user: {
              id: retailer.Retailer_ID,
              email: retailer.Email,
              name: retailer.Full_Name,
              user_type: "retailer",
            },
          },
        };
      }

      // Otherwise check RIDERS
      const { data: rider } = await supabase
        .from("RIDERS")
        .select("Rider_ID, Full_name, Email")
        .eq("Email", email)
        .single();

      if (rider) {
        return {
          success: true,
          data: {
            user: {
              id: rider.Rider_ID,
              email: rider.Email,
              name: rider.Full_name,
              user_type: "rider",
            },
          },
        };
      }

      return { success: false, error: "User profile not found" };
    } catch (error: any) {
      return { success: false, error: error.message || "Verification failed" };
    }
  },

  // ================================
  // Logout
  // ================================
  logout: async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // ================================
  // Create Delivery
  // ================================
  createDelivery: async (data: any) => {
    try {
      const { error } = await supabase.from("DELIVERIES").insert({
        Customer_name: data.customer_name,
        Customer_no: data.customer_phone,
        latitlude: data.latitude,
        longitude: data.longitude,
        Package_description: data.package_description,
        Status: "pending",
        Retailer_ID: data.retailer_id,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to create delivery" };
    }
  },

  // ================================
  // Get Deliveries
  // ================================
  getDeliveries: async () => {
    try {
      const { data, error } = await supabase
        .from("DELIVERIES")
        .select("*")
        .order("Created_date", { ascending: false });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to fetch deliveries" };
    }
  },

  // ================================
  // Get Batches
  // ================================
  getBatches: async () => {
    try {
      const { data, error } = await supabase
        .from("BATCHES")
        .select("*")
        .order("Created_date", { ascending: false });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to fetch batches" };
    }
  },
};