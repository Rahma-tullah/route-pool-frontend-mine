import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Package, Clock, CheckCircle2, Phone, Zap, Users } from "lucide-react";

interface MapOrder {
  id: string;
  x: number;
  y: number;
  label: string;
  status: "new" | "pairing" | "paired";
  pairedWith?: string;
  color: string;
}

const AREAS = ["Ikeja", "Lekki", "V.I.", "Surulere", "Yaba", "Ikoyi", "Ajah", "Gbagada"];
const NAMES = ["Mama's Store", "TechHub", "FreshMart", "GlamBox", "SpiceRoute", "QuickBite", "PhoneFixNG", "BookNook", "ChopBar", "KoolKuts"];
const PAIR_COLORS = [
  "hsl(152, 55%, 28%)", "hsl(30, 90%, 55%)", "hsl(200, 70%, 50%)", 
  "hsl(280, 60%, 55%)", "hsl(0, 70%, 55%)", "hsl(170, 60%, 40%)"
];

const deliveries = [
  {
    id: "PD-2847", area: "Ikeja, Lagos", orders: 3, distance: "4.2 km",
    earnings: "₦2,800", status: "active" as const,
    pickups: ["Mama Nkechi Stores", "TechHub NG", "FreshMart"],
  },
  {
    id: "PD-2831", area: "Lekki Phase 1", orders: 2, distance: "6.1 km",
    earnings: "₦3,500", status: "pending" as const,
    pickups: ["GlamBox", "SpiceRoute"],
  },
  {
    id: "PD-2819", area: "Victoria Island", orders: 4, distance: "3.8 km",
    earnings: "₦4,200", status: "completed" as const,
    pickups: ["QuickBite", "Urban Closet", "PhoneFixNG", "BookNook"],
  },
];

const DriverDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MapOrder[]>([]);
  const [pairCount, setPairCount] = useState(0);
  const [aiMessage, setAiMessage] = useState("Scanning for nearby orders…");

  const addOrder = useCallback(() => {
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: MapOrder = {
      id,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 75,
      label: NAMES[Math.floor(Math.random() * NAMES.length)],
      status: "new",
      color: "hsl(var(--secondary))",
    };
    setOrders((prev) => [...prev.slice(-11), newOrder]);
    setAiMessage(`📦 New order from ${newOrder.label} in ${AREAS[Math.floor(Math.random() * AREAS.length)]}`);
  }, []);

  const pairOrders = useCallback(() => {
    setOrders((prev) => {
      const unpaired = prev.filter((o) => o.status === "new");
      if (unpaired.length < 2) return prev;

      const color = PAIR_COLORS[pairCount % PAIR_COLORS.length];
      const [a, b] = [unpaired[0], unpaired[1]];

      setAiMessage(`🤖 AI paired ${a.label} ↔ ${b.label} — saving ₦${(800 + Math.floor(Math.random() * 1200)).toLocaleString()}`);
      setPairCount((c) => c + 1);

      return prev.map((o) => {
        if (o.id === a.id) return { ...o, status: "paired" as const, pairedWith: b.id, color };
        if (o.id === b.id) return { ...o, status: "paired" as const, pairedWith: a.id, color };
        return o;
      });
    });
  }, [pairCount]);

  useEffect(() => {
    // Initial orders
    const t1 = setTimeout(() => addOrder(), 500);
    const t2 = setTimeout(() => addOrder(), 1200);
    const t3 = setTimeout(() => addOrder(), 2000);

    // Recurring simulation
    const addInterval = setInterval(() => addOrder(), 3500);
    const pairInterval = setInterval(() => pairOrders(), 5000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(addInterval); clearInterval(pairInterval);
    };
  }, [addOrder, pairOrders]);

  const pairedLines = orders
    .filter((o) => o.status === "paired" && o.pairedWith)
    .reduce<{ from: MapOrder; to: MapOrder; color: string }[]>((acc, o) => {
      const partner = orders.find((p) => p.id === o.pairedWith);
      if (partner && !acc.find((l) => l.from.id === partner.id && l.to.id === o.id)) {
        acc.push({ from: o, to: partner, color: o.color });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Hello, Driver</p>
            <h1 className="text-xl font-bold text-primary-foreground">{user?.name || "Driver"}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary-foreground text-xs font-medium">Online</span>
          </div>
        </div>

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

      {/* Interactive Map */}
      <div className="px-5 -mt-4">
        <Card className="overflow-hidden border-border/50 shadow-lg mb-4">
          <div className="relative h-64 bg-accent overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`h${i}`} className="absolute w-full border-t border-foreground/20" style={{ top: `${(i + 1) * 12}%` }} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`v${i}`} className="absolute h-full border-l border-foreground/20" style={{ left: `${(i + 1) * 12}%` }} />
              ))}
            </div>

            {/* Road lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="60%" y1="0" x2="60%" y2="100%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="0" y1="35%" x2="100%" y2="35%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="0" y1="70%" x2="100%" y2="70%" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 4" />
            </svg>

            {/* Pairing lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
              {pairedLines.map((line, i) => (
                <line
                  key={i}
                  x1={`${line.from.x}%`} y1={`${line.from.y}%`}
                  x2={`${line.to.x}%`} y2={`${line.to.y}%`}
                  stroke={line.color} strokeWidth="2" strokeDasharray="5 3"
                  className="animate-pulse"
                />
              ))}
            </svg>

            {/* Order dots */}
            {orders.map((order) => (
              <div
                key={order.id}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  left: `${order.x}%`,
                  top: `${order.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 3,
                }}
              >
                {/* Ping ring for new orders */}
                {order.status === "new" && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: "hsl(var(--secondary))", opacity: 0.4 }}
                  />
                )}
                <div
                  className="relative h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{ backgroundColor: order.color }}
                >
                  {order.status === "paired" ? (
                    <Users className="h-2.5 w-2.5 text-white" />
                  ) : (
                    <Package className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-[8px] font-semibold text-foreground whitespace-nowrap bg-card/90 px-1 rounded">
                  {order.label}
                </span>
              </div>
            ))}

            {/* Driver position */}
            <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 5 }}>
              <div className="h-8 w-8 rounded-full gradient-primary border-3 border-white shadow-lg flex items-center justify-center">
                <Navigation className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] font-bold text-primary bg-card px-1.5 py-0.5 rounded-full shadow">
                You
              </span>
            </div>
          </div>

          {/* AI status bar */}
          <div className="px-4 py-2.5 bg-card border-t border-border flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs text-foreground font-medium truncate">{aiMessage}</p>
          </div>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] text-muted-foreground">New order</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">AI paired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-primary" />
            <span className="text-[10px] text-muted-foreground">Route link</span>
          </div>
        </div>
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
