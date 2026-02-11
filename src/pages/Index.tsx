import { useState } from "react";
import { Package, Leaf, TrendingDown, Plus, ChevronRight, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stats = [
  { icon: Package, label: "Orders", value: "12", color: "text-primary" },
  { icon: Leaf, label: "CO₂ Saved", value: "34kg", color: "text-success" },
  { icon: TrendingDown, label: "Saved", value: "₦18,500", color: "text-secondary" },
];

const activeOrders = [
  {
    id: "ORD-2847",
    destination: "Ikeja, Lagos",
    status: "Paired",
    pairedWith: 2,
    yourShare: "₦1,200",
    eta: "45 min",
  },
  {
    id: "ORD-2843",
    destination: "Victoria Island",
    status: "In Transit",
    pairedWith: 3,
    yourShare: "₦850",
    eta: "20 min",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good morning 👋</p>
          <h1 className="text-2xl font-bold text-foreground">Adebayo</h1>
        </div>
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          AD
        </div>
      </div>

      {/* Eco Banner */}
      <div className="gradient-eco rounded-2xl p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent-foreground">
            Shared deliveries reduce emissions by up to 40%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You've saved 34kg CO₂ this month!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl p-3 border border-border text-center"
          >
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
          {activeOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate("/track")}
              className="bg-card rounded-xl p-4 border border-border cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {order.id}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === "Paired"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {order.destination}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Paired with {order.pairedWith} others
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {order.eta}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Your share</span>
                <span className="text-sm font-bold text-primary">
                  {order.yourShare}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
