import { useState, useEffect } from "react";
import { Package, Leaf, TrendingDown, Plus, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const placeholderOrders = [
  {
    delivery_id: "ORD-2847",
    package_description: "Ikeja, Lagos",
    status: "Paired",
    customer_share: 1200,
    co2_saved: 1.2,
    batches: { total_deliveries: 3 },
    isPlaceholder: true,
  },
  {
    delivery_id: "ORD-2843",
    package_description: "Victoria Island",
    status: "In Transit",
    customer_share: 850,
    co2_saved: 0.8,
    batches: { total_deliveries: 4 },
    isPlaceholder: true,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ecoTip, setEcoTip] = useState("Shared deliveries reduce emissions by up to 40%");
  const [totalCO2, setTotalCO2] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data: activeOrders } = await supabase
      .from("deliveries")
      .select("*, batches(total_deliveries)")
      .eq("retailer_id", user!.id)
      .neq("status", "Delivered")
      .order("created_date", { ascending: false });

    setOrders(activeOrders || []);

    const { data: allDeliveries } = await supabase
      .from("deliveries")
      .select("co2_saved, customer_share")
      .eq("retailer_id", user!.id);

    const co2 = allDeliveries?.reduce((sum, d) => sum + (d.co2_saved || 0), 0) || 0;
    const saved = allDeliveries?.reduce((sum, d) => sum + (d.customer_share || 0), 0) || 0;
    setTotalCO2(Math.round(co2));
    setTotalSaved(Math.round(saved));

    fetchEcoTip(co2, allDeliveries?.length || 0);
    setLoading(false);
  };

  const fetchEcoTip = async (co2Saved: number, orderCount: number) => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `A user of a shared delivery app has saved ${co2Saved}kg of CO₂ across ${orderCount} shared deliveries. 
                Write ONE short encouraging sentence (max 12 words) about their environmental impact. Be specific and positive.`
              }]
            }]
          }),
        }
      );
      const data = await res.json();
      const tip = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (tip) setEcoTip(tip);
    } catch (e) {
      // Keep the default tip if the API fails
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const stats = [
    { icon: Package, label: "Orders", value: String(orders.length), color: "text-primary" },
    { icon: Leaf, label: "CO₂ Saved", value: `${totalCO2}kg`, color: "text-success" },
    { icon: TrendingDown, label: "Saved", value: `₦${totalSaved.toLocaleString()}`, color: "text-secondary" },
  ];

  // Show real orders if they exist, otherwise show placeholders for aesthetics
  const displayedOrders = orders.length > 0 ? orders : placeholderOrders;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="px-4 pt-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()} 👋</p>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.name?.split(" ")[0] || "There"}
          </h1>
        </div>
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {initials}
        </div>
      </div>

      {/* Eco Banner */}
      <div className="gradient-eco rounded-2xl p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent-foreground">{ecoTip}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You've saved {totalCO2}kg CO₂ this month!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-3 border border-border text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Place Order CTA */}
      <Button
        onClick={() => navigate("/place-order")}
        className="w-full h-14 rounded-2xl gradient-primary text-primary-foreground text-base font-semibold shadow-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="h-5 w-5 mr-2" />
        Place New Order
      </Button>

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Active Orders</h2>
          <button className="text-xs text-primary font-medium">View All</button>
        </div>

        <div className="space-y-3">
          {displayedOrders.map((order) => (
            <div
              key={order.delivery_id}
              onClick={() => navigate("/track")}
              className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {order.isPlaceholder
                    ? order.delivery_id
                    : order.delivery_id.slice(0, 8).toUpperCase()}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  order.status === "Paired"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary/10 text-secondary"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {order.package_description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {order.batches?.total_deliveries > 1
                    ? `Paired with ${order.batches.total_deliveries - 1} other${order.batches.total_deliveries - 1 > 1 ? "s" : ""}`
                    : "Waiting for match"}
                </span>
                <span className="flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  {order.co2_saved}kg CO₂ saved
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Your share</span>
                <span className="text-sm font-bold text-primary">
                  ₦{Number(order.customer_share).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle label so you know when placeholders are showing */}
        {orders.length === 0 && (
          <p className="text-center text-[10px] text-muted-foreground/50 mt-3">
            Sample orders shown — place your first order above!
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;