import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Eye, EyeOff, Leaf } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("retailer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let errorMsg: string | null = null;

    if (mode === "login") {
      errorMsg = await login(email, password, role);
    } else {
      errorMsg = await signup(name, email, password, role, vehicleType);
    }

    setSubmitting(false);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // Success — redirect based on role
    navigate(role === "driver" ? "/driver" : "/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-primary-foreground tracking-tight">Route Pool</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Shared deliveries, lower costs</p>
      </div>

      <div className="flex-1 px-5 -mt-5">
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole("retailer")}
            className={`rounded-xl p-4 border-2 transition-all flex flex-col items-center gap-2 ${
              role === "retailer"
                ? "border-primary bg-accent shadow-md"
                : "border-border bg-card"
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              role === "retailer" ? "gradient-primary" : "bg-muted"
            }`}>
              <Package className={`h-6 w-6 ${role === "retailer" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-sm font-semibold ${role === "retailer" ? "text-primary" : "text-muted-foreground"}`}>
              SME / Retailer
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Place & track orders
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("driver")}
            className={`rounded-xl p-4 border-2 transition-all flex flex-col items-center gap-2 ${
              role === "driver"
                ? "border-primary bg-accent shadow-md"
                : "border-border bg-card"
            }`}
          >
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              role === "driver" ? "gradient-primary" : "bg-muted"
            }`}>
              <Truck className={`h-6 w-6 ${role === "driver" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-sm font-semibold ${role === "driver" ? "text-primary" : "text-muted-foreground"}`}>
              Driver
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Deliver paired orders
            </span>
          </button>
        </div>

        {/* Auth Form */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-foreground mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {mode === "login"
                ? `Sign in as ${role === "driver" ? "a driver" : "an SME owner"}`
                : `Register as ${role === "driver" ? "a driver" : "an SME owner"}`}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {role === "driver" ? "Full Name" : "Business Name"}
                  </label>
                  <Input
                    placeholder={role === "driver" ? "Chinedu Okafor" : "Your Business Name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {role === "driver" && mode === "signup" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Vehicle Type</label>
                  <Input
                    placeholder="e.g. Motorcycle, Van, Tricycle"
                    className="h-11"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  />
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 gradient-primary text-primary-foreground font-semibold text-sm"
              >
                {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary font-semibold"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-6 mb-8">
          By continuing, you agree to Route Pool's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;