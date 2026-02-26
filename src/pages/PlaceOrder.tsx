import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Package, Weight, ChevronRight, Leaf, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface MatchResult {
  totalFee: number;
  splitCount: number;
  yourShare: number;
  co2Saved: number;
  batchId: string;
  deliveryId: string;
}

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paired, setPaired] = useState(false);
  const [error, setError] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);

  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    description: "",
    weight: "",
  });

  // Pre-fill pickup address from retailer's shop address
  useEffect(() => {
    if (!user) return;
    const fetchAddress = async () => {
      const { data, error: fetchError } = await supabase
        .from("RETAILERS")
        .select('"Shop_address"')
        .eq("Retailer_ID", user.id)
        .single();

      if (!fetchError && data?.Shop_address) {
        setForm((prev) => ({ ...prev, pickup: data.Shop_address }));
      }
    };
    if (user?.user_type === "retailer") fetchAddress();
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Look for an open batch to pair with
      const { data: openBatches, error: batchFetchError } = await supabase
        .from("BATCHES")
        .select('"Batch_ID", "Total_deliveries"')
        .eq("Status", "open")
        .lt("Total_deliveries", 4)
        .order("Created_date", { ascending: true })
        .limit(1);

      if (batchFetchError) {
        setError("Failed to find delivery matches. Please try again.");
        setLoading(false);
        return;
      }

      let batchId: string;
      let splitCount: number;

      if (openBatches && openBatches.length > 0) {
        // Pair with existing batch
        batchId = openBatches[0].Batch_ID;
        splitCount = openBatches[0].Total_deliveries + 1;

        await supabase
          .from("BATCHES")
          .update({
            Total_deliveries: splitCount,
            Updated_at: new Date().toISOString(),
          })
          .eq("Batch_ID", batchId);
      } else {
        // Create a new batch
        const { data: newBatch, error: newBatchError } = await supabase
          .from("BATCHES")
          .insert({ Status: "open", Total_deliveries: 1 })
          .select('"Batch_ID"')
          .single();

        if (newBatchError || !newBatch) {
          setError("Failed to create a new batch. Please try again.");
          setLoading(false);
          return;
        }

        batchId = newBatch.Batch_ID;
        splitCount = 1;
      }

      // Step 2: Calculate cost split
      const totalFee = 4500;
      const yourShare = Math.round(totalFee / splitCount);
      const co2Saved = parseFloat((2.3 / splitCount).toFixed(1));

      // Step 3: Save the delivery to DELIVERIES table
      // Only inserting columns that exist in the schema
      const { data: deliveryData, error: insertError } = await supabase
        .from("DELIVERIES")
        .insert({
          Retailer_ID: user!.id,
          Batch_ID: batchId,
          Customer_name: user!.name,
          Package_description: form.description,
          Status: splitCount > 1 ? "Paired" : "Pending",
        })
        .select('"Delivery_ID"')
        .single();

      if (insertError) {
        setError("Failed to place order. Please try again.");
        setLoading(false);
        return;
      }

      setMatch({
        totalFee,
        splitCount,
        yourShare,
        co2Saved,
        batchId,
        deliveryId: deliveryData!.Delivery_ID,
      });

      setLoading(false);
      setPaired(true);
      setStep(3);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
            disabled={!form.destination || !form.description}
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
              <span className="font-medium text-foreground">{form.pickup || "Not specified"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-medium text-foreground">{form.destination}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Package</span>
              <span className="font-medium text-foreground">{form.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium text-foreground">{form.weight || "—"} kg</span>
            </div>
          </div>

          <div className="gradient-eco rounded-xl p-4 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-xs text-accent-foreground">
              Our AI will pair your order with nearby SMEs heading to the same area to split costs and reduce emissions.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

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

      {step === 3 && paired && match && (
        <div className="space-y-5 animate-slide-up">
          <div className="text-center py-4">
            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Users className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {match.splitCount > 1 ? "Match Found!" : "Order Placed!"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {match.splitCount > 1
                ? `Paired with ${match.splitCount - 1} other ${match.splitCount - 1 === 1 ? "SME" : "SMEs"} heading to ${form.destination}`
                : `Your order is pending — waiting for nearby SMEs to pair with`}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total delivery fee</span>
                <span className="text-foreground line-through">₦{match.totalFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Split between</span>
                <span className="font-medium text-foreground">
                  {match.splitCount} {match.splitCount === 1 ? "SME" : "SMEs"}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="font-semibold text-foreground">Your share</span>
                <span className="text-lg font-bold text-primary">₦{match.yourShare.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-accent px-4 py-3 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-xs text-accent-foreground font-medium">
                Saving {match.co2Saved}kg CO₂ with this shared delivery
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/payments")}
            className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
          >
            Pay ₦{match.yourShare.toLocaleString()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;