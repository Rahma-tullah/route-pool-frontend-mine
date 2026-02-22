import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Package, Clock, CheckCircle2, Phone, LogOut } from "lucide-react";

const deliveries = [
  {
    id: "PD-2847",
    area: "Ikeja, Lagos",
    orders: 3,
    distance: "4.2 km",
    earnings: "₦2,800",
    status: "active" as const,
    pickups: ["Mama Nkechi Stores", "TechHub NG", "FreshMart"],
  },
  {
    id: "PD-2831",
    area: "Lekki Phase 1",
    orders: 2,
    distance: "6.1 km",
    earnings: "₦3,500",
    status: "pending" as const,
    pickups: ["GlamBox", "SpiceRoute"],
  },
  {
    id: "PD-2819",
    area: "Victoria Island",
    orders: 4,
    distance: "3.8 km",
    earnings: "₦4,200",
    status: "completed" as const,
    pickups: ["QuickBite", "Urban Closet", "PhoneFixNG", "BookNook"],
  },
];

const DriverDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Hello, Driver</p>
            <h1 className="text-xl font-bold text-primary-foreground">{user?.name || "Driver"}</h1>
          </div>
          <button onClick={logout} className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Today", value: "₦8,500", icon: "💰" },
            { label: "Trips", value: "6", icon: "🚚" },
            { label: "Rating", value: "4.8", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="text-primary-foreground font-bold text-sm mt-0.5">{s.value}</p>
              <p className="text-primary-foreground/60 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="px-5 -mt-4">
        <Card className="overflow-hidden border-border/50 shadow-md mb-4">
          <div className="h-40 bg-accent flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, hsl(152 55% 28%), transparent 60%), radial-gradient(circle at 70% 30%, hsl(30 90% 55%), transparent 50%)"
            }} />
            <div className="text-center z-10">
              <Navigation className="h-8 w-8 text-primary mx-auto mb-1" />
              <p className="text-sm font-semibold text-foreground">Live Map</p>
              <p className="text-[10px] text-muted-foreground">Route optimisation active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deliveries */}
      <div className="px-5 pb-8">
        <h2 className="text-base font-bold text-foreground mb-3">Paired Deliveries</h2>
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Card key={d.id} className="border-border/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{d.id}</span>
                      <Badge
                        variant={d.status === "active" ? "default" : d.status === "pending" ? "secondary" : "outline"}
                        className="text-[10px] h-5"
                      >
                        {d.status === "active" && <Clock className="h-3 w-3 mr-0.5" />}
                        {d.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-0.5" />}
                        {d.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{d.area} • {d.distance}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-primary">{d.earnings}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {d.pickups.map((p) => (
                    <span key={p} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                      <Package className="h-2.5 w-2.5 inline mr-0.5" />{p}
                    </span>
                  ))}
                </div>

                {d.status === "active" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs gradient-primary text-primary-foreground">
                      <Navigation className="h-3.5 w-3.5 mr-1" /> Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {d.status === "pending" && (
                  <Button size="sm" className="w-full h-8 text-xs gradient-accent text-secondary-foreground">
                    Accept Delivery
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
