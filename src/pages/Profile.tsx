import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, MapPin, Phone, Mail, ChevronRight, LogOut, Bell, Shield, HelpCircle, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { icon: Building2, label: "Business Details", desc: "Manage your SME profile" },
  { icon: Bell, label: "Notifications", desc: "Delivery & payment alerts" },
  { icon: Shield, label: "Security", desc: "Password & verification" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact us" },
];

interface ProfileDetails {
  phone_no: string | null;
  email: string;
  shop_address: string | null;
}

interface EcoStats {
  co2Saved: number;
  totalDeliveries: number;
  totalSaved: number;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [ecoStats, setEcoStats] = useState<EcoStats>({ co2Saved: 0, totalDeliveries: 0, totalSaved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProfileDetails();
  }, [user]);

  const fetchProfileDetails = async () => {
    // Fetch full profile details from the correct table based on role
    const table = user?.role === "retailer" ? "retailers" : "riders";
    const idCol = user?.role === "retailer" ? "retailer_id" : "rider_id";

    const { data: profileData } = await supabase
      .from(table)
      .select("phone_no, email, shop_address")
      .eq(idCol, user?.id)
      .single();

    setProfile(profileData);

    // Fetch eco stats from deliveries
    const { data: deliveries } = await supabase
      .from("deliveries")
      .select("co2_saved, customer_share")
      .eq("retailer_id", user?.id);

    if (deliveries) {
      const co2Saved = deliveries.reduce((sum, d) => sum + (d.co2_saved || 0), 0);
      const totalSaved = deliveries.reduce((sum, d) => sum + (d.customer_share || 0), 0);
      setEcoStats({
        co2Saved: Math.round(co2Saved),
        totalDeliveries: deliveries.length,
        totalSaved: Math.round(totalSaved),
      });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Generate initials from name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 animate-slide-up">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{user?.name || "Unknown"}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "driver" ? "Driver" : "SME Owner"}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {profile?.phone_no || "No phone number added"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{profile?.email || user?.email}</span>
        </div>
        {user?.role === "retailer" && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {profile?.shop_address || "No address added"}
            </span>
          </div>
        )}
      </div>

      {/* Eco stats */}
      <div className="gradient-eco rounded-xl p-4 mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent-foreground">Eco Impact</p>
          <p className="text-xs text-muted-foreground">
            {ecoStats.co2Saved}kg CO₂ saved • {ecoStats.totalDeliveries} shared deliveries • ₦{ecoStats.totalSaved.toLocaleString()} saved
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-destructive text-sm font-medium"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
};

export default Profile;