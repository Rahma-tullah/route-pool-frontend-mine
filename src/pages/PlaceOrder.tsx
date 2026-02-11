import { useState } from "react";
import { ArrowLeft, MapPin, Package, Weight, ChevronRight, Leaf, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paired, setPaired] = useState(false);

  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    description: "",
    weight: "",
  });

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaired(true);
      setStep(3);
    }, 2500);
  };

  return (
    <div className="px-4 pt-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (step > 1 && !paired ? setStep(step - 1) : navigate(-1))}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Place Order</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "gradient-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Delivery Details</h2>
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
              <Input
                placeholder="Pickup address"
                value={form.pickup}
                onChange={(e) => setForm({ ...form, pickup: e.target.value })}
                className="pl-10 h-11 rounded-xl bg-card border-border"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-secondary" />
              <Input
                placeholder="Delivery destination"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="pl-10 h-11 rounded-xl bg-card border-border"
              />
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Package description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="pl-10 h-11 rounded-xl bg-card border-border"
              />
            </div>
            <div className="relative">
              <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Estimated weight (kg)"
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="pl-10 h-11 rounded-xl bg-card border-border"
              />
            </div>
          </div>
          <Button
            onClick={() => setStep(2)}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold mt-4"
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {step === 2 && !loading && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-foreground">Confirm & Find Matches</h2>
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pickup</span>
              <span className="font-medium text-foreground">{form.pickup || "Lekki Phase 1"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-medium text-foreground">{form.destination || "Ikeja, Lagos"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Package</span>
              <span className="font-medium text-foreground">{form.description || "Electronics"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium text-foreground">{form.weight || "5"} kg</span>
            </div>
          </div>

          <div className="gradient-eco rounded-xl p-4 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-xs text-accent-foreground">
              Our AI will pair your order with nearby SMEs heading to the same area to split costs and reduce emissions.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
          >
            Find Delivery Matches
          </Button>
        </div>
      )}

      {step === 2 && loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-eco">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">AI is pairing your order...</p>
          <p className="text-sm text-muted-foreground text-center">
            Finding SMEs with deliveries heading to the same area
          </p>
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      )}

      {step === 3 && paired && (
        <div className="space-y-5 animate-slide-up">
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Users className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Match Found!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Paired with 2 other SMEs heading to Ikeja
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total delivery fee</span>
                <span className="text-foreground line-through">₦4,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Split between</span>
                <span className="font-medium text-foreground">3 SMEs</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="font-semibold text-foreground">Your share</span>
                <span className="text-lg font-bold text-primary">₦1,500</span>
              </div>
            </div>
            <div className="bg-accent px-4 py-3 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-xs text-accent-foreground font-medium">
                Saving 2.3kg CO₂ with this shared delivery
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/payments")}
            className="w-full h-12 rounded-xl gradient-accent text-secondary-foreground font-semibold"
          >
            Pay ₦1,500
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
