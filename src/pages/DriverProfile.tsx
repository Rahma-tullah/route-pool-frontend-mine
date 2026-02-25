import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Truck, ChevronRight, LogOut, Bell, Shield, HelpCircle, Leaf, Star, MapPin } from "lucide-react";

const menuItems = [
  { icon: Truck, label: "Vehicle Details", desc: "Manage your vehicle info" },
  { icon: Bell, label: "Notifications", desc: "Delivery & earning alerts" },
  { icon: Shield, label: "Security", desc: "Password & verification" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQs and contact us" },
];

const DriverProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="px-4 pt-6 pb-24 animate-slide-up">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{user?.name || "Unknown"}</h1>
          <p className="text-sm text-muted-foreground">Driver</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="h-3.5 w-3.5 text-secondary fill-secondary" />
            <span className="text-xs font-semibold text-foreground">4.8</span>
            <span className="text-xs text-muted-foreground">• 142 trips</span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">+234 801 234 5678</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{user?.email || "driver@pairdrop.ng"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Motorcycle</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Lagos, Nigeria</span>
        </div>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: "This Week", value: "₦42,500" },
          { label: "This Month", value: "₦168,000" },
          { label: "All Time", value: "₦1.2M" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className="text-sm font-bold text-primary">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Eco stats */}
      <div className="gradient-eco rounded-xl p-4 mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent-foreground">Eco Impact</p>
          <p className="text-xs text-muted-foreground">
            87kg CO₂ saved • 142 shared deliveries • 48 routes optimised
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

export default DriverProfile;
