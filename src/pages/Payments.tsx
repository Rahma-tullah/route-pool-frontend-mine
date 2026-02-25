import { useState } from "react";
import { CreditCard, CheckCircle2, Copy, Shield, ChevronRight, Wallet, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const paymentHistory = [
  { id: "PAY-001", amount: "₦1,200", date: "Feb 10", status: "Completed", order: "ORD-2843" },
  { id: "PAY-002", amount: "₦850", date: "Feb 8", status: "Completed", order: "ORD-2840" },
  { id: "PAY-003", amount: "₦2,100", date: "Feb 5", status: "Completed", order: "ORD-2835" },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState<"pay" | "history">("pay");
  const [payStep, setPayStep] = useState<"details" | "otp" | "done">("details");
  const [otp, setOtp] = useState("");

  return (
    <div className="px-4 pt-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-foreground mb-5">Payments</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
        {(["pay", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {tab === "pay" ? "Make Payment" : "History"}
          </button>
        ))}
      </div>

      {activeTab === "pay" && payStep === "details" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order</span>
              <span className="text-sm font-mono text-foreground">ORD-2847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Destination</span>
              <span className="text-sm text-foreground">Ikeja, Lagos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paired with</span>
              <span className="text-sm text-foreground">2 other SMEs</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">Your Share</span>
              <span className="text-xl font-bold text-primary">₦1,500</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment Method</label>
            <div className="space-y-2">
              {[
                { label: "Bank Transfer", icon: Wallet, desc: "Pay via bank transfer" },
                { label: "Card Payment", icon: CreditCard, desc: "Visa / Mastercard" },
              ].map((method) => (
                <div
                  key={method.label}
                  className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                    <method.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setPayStep("otp")}
            className="w-full h-12 rounded-xl gradient-accent text-secondary-foreground font-semibold mt-2"
          >
            Pay ₦1,500
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Secured with 256-bit encryption
          </div>
        </div>
      )}

      {activeTab === "pay" && payStep === "otp" && (
        <div className="space-y-5">
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground mt-1">₦1,500 has been charged</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Delivery OTP</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold tracking-[0.3em] text-primary font-mono">
                4829
              </span>
              <button className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Copy className="h-4 w-4 text-primary" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Share this OTP with the driver upon delivery
            </p>
          </div>

          <Button
            onClick={() => setPayStep("done")}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
          >
            Track My Delivery
          </Button>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {paymentHistory.map((p) => (
            <div
              key={p.id}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{p.order}</p>
                <p className="text-xs text-muted-foreground">{p.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{p.amount}</p>
                <p className="text-xs text-success">{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;