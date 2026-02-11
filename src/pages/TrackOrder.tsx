import { ArrowLeft, Phone, Navigation, Package, CheckCircle2, Circle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trackingSteps = [
  { label: "Order Placed", time: "9:00 AM", done: true },
  { label: "Orders Paired", time: "9:05 AM", done: true },
  { label: "Payment Confirmed", time: "9:08 AM", done: true },
  { label: "Picked Up", time: "9:30 AM", done: true },
  { label: "In Transit", time: "10:15 AM", done: false, active: true },
  { label: "Delivered", time: "", done: false },
];

const TrackOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Track Order</h1>
        <span className="ml-auto text-xs font-mono text-muted-foreground">ORD-2847</span>
      </div>

      {/* Map placeholder */}
      <div className="mx-4 rounded-2xl overflow-hidden bg-primary/5 border border-border h-52 relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 text-center space-y-2">
          <div className="h-12 w-12 mx-auto rounded-full gradient-primary flex items-center justify-center">
            <Navigation className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Driver is en route</p>
          <p className="text-xs text-muted-foreground">ETA: 20 minutes</p>
        </div>
        {/* Fake route dots */}
        <div className="absolute top-8 left-8 h-3 w-3 rounded-full bg-primary animate-pulse" />
        <div className="absolute top-16 left-20 h-2 w-2 rounded-full bg-primary/60" />
        <div className="absolute top-24 left-28 h-2 w-2 rounded-full bg-primary/60" />
        <div className="absolute bottom-16 right-16 h-3 w-3 rounded-full bg-secondary animate-pulse" />
      </div>

      {/* Driver info */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          MK
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Musa Kabiru</p>
          <p className="text-xs text-muted-foreground">Toyota HiAce • LAG-234-XY</p>
        </div>
        <button className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
          <Phone className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Paired info */}
      <div className="mx-4 mt-3 gradient-eco rounded-xl p-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-xs text-accent-foreground">
          This delivery is shared with <strong>2 other SMEs</strong> heading to Ikeja area
        </p>
      </div>

      {/* Timeline */}
      <div className="mx-4 mt-5 mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Delivery Progress</h2>
        <div className="space-y-0">
          {trackingSteps.map((step, i) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : step.active ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 flex-shrink-0 animate-pulse-eco" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
                )}
                {i < trackingSteps.length - 1 && (
                  <div className={`w-0.5 h-8 ${step.done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm ${step.done || step.active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                {step.time && (
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
