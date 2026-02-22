import { useState, useEffect } from "react";
import { Package, Leaf, TrendingDown, Plus, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; avatar_initials: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ecoTip, setEcoTip] = useState("Shared deliveries reduce emissions by up to 40%");
  const [totalCO2, setTotalCO2] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_initials")
      .eq("id", user.id)
      .single();
    setProfile(profileData);

    // Fetch active orders (not delivered)
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "Delivered")
      .order("created_at", { ascending: false });
    setOrders(ordersData || []);

    // Calculate totals from all orders
    const { data: allOrders } = await supabase
      .from("orders")
      .select("co2_saved, your_share")
      .eq("user_id", user.id);

    const co2 = allOrders?.reduce((sum, o) => sum + (o.co2_saved || 0), 0) || 0;
    const saved = allOrders?.reduce((sum, o) => sum + (o.your_share || 0), 0) || 0;
    setTotalCO2(co2);
    setTotalSaved(saved);

    // Ask Gemini for a personalized eco tip
    fetchEcoTip(co2, allOrders?.length || 0);

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

  const stats = [
    { icon: Package, label: "Orders", value: String(orders.length), color: "text-primary" },
    { icon: Leaf, label: "CO₂ Saved", value: `${totalCO2}kg`, color: "text-success" },
    { icon: TrendingDown, label: "Saved", value: `₦${totalSaved.toLocaleString()}`, color: "text-secondary" },
  ];

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
            {profile?.full_name?.split(" ")[0] || "There"}
          </h1>
        </div>
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {profile?.avatar_initials || "?"}
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
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No active orders. Place one above!
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate("/track")}
                className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === "Paired"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary/10 text-secondary"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-semibold text-foreground text-sm">{order.destination}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Paired with {order.paired_with} others
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {order.eta}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Your share</span>
                  <span className="text-sm font-bold text-primary">
                    ₦{Number(order.your_share).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;