import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

const Auth = () => {
  const [screen, setScreen] = useState<
    "choice" | "signin-role" | "signup-role" | "signin" | "signup" | "otp"
  >("choice");
  const [role, setRole] = useState<UserRole>("retailer");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup, sendOTP, verifyOTP } = useAuth();

  const handleSignInRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setScreen("signin");
    setError("");
    setEmail("");
  };

  const handleSignUpRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setScreen("signup");
    setError("");
    setName("");
    setEmail("");
    setPhone("");
    setShopName("");
    setVehicleType("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const errorMsg = await sendOTP(email);
    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setScreen("otp");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const errorMsg = await signup({
      name,
      email,
      phone,
      user_type: role,
      shop_name: role === "retailer" ? shopName : undefined,
      vehicle_type: role === "rider" ? vehicleType : undefined,
    });

    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setScreen("otp");
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const errorMsg = await verifyOTP(email, otp);
    setLoading(false);

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // ✅ No navigate() here — AuthRoute in App.tsx handles the redirect
    // automatically once isAuthenticated becomes true
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await sendOTP(email);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Route Pool</h1>
          <p className="text-gray-600 mt-2">Shared deliveries, lower costs</p>
        </div>

        {/* Choice Screen */}
        {screen === "choice" && (
          <div className="space-y-3">
            <Button
              onClick={() => setScreen("signin-role")}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
            <Button
              onClick={() => setScreen("signup-role")}
              className="w-full h-12 bg-green-600 hover:bg-green-700">
              Sign Up
            </Button>
          </div>
        )}

        {/* Sign In Role Selection */}
        {screen === "signin-role" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Sign In As</h2>
              <Button
                onClick={() => handleSignInRole("retailer")}
                variant="outline"
                className="w-full h-12">
                🏪 Retailer
              </Button>
              <Button
                onClick={() => handleSignInRole("rider")}
                variant="outline"
                className="w-full h-12">
                🚴 Rider
              </Button>
              <Button
                onClick={() => setScreen("choice")}
                variant="ghost"
                className="w-full">
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sign Up Role Selection */}
        {screen === "signup-role" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Sign Up As</h2>
              <Button
                onClick={() => handleSignUpRole("retailer")}
                variant="outline"
                className="w-full h-12">
                🏪 Retailer
              </Button>
              <Button
                onClick={() => handleSignUpRole("rider")}
                variant="outline"
                className="w-full h-12">
                🚴 Rider
              </Button>
              <Button
                onClick={() => setScreen("choice")}
                variant="ghost"
                className="w-full">
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sign In Form */}
        {screen === "signin" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Sign in as {role === "rider" ? "a rider" : "a retailer"}
              </p>

              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                  {loading ? "Sending..." : "Continue"}
                </Button>

                <Button
                  type="button"
                  onClick={() => setScreen("signin-role")}
                  variant="ghost"
                  className="w-full">
                  Change Role
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sign Up Form */}
        {screen === "signup" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Sign up as {role === "rider" ? "a rider" : "a retailer"}
              </p>

              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  type="text"
                  placeholder={role === "rider" ? "Full Name" : "Business Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
                <Input
                  type="tel"
                  placeholder="Phone (07012345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-11"
                />

                {role === "retailer" && (
                  <Input
                    type="text"
                    placeholder="Shop Name"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    className="h-11"
                  />
                )}

                {role === "rider" && (
                  <Input
                    type="text"
                    placeholder="Vehicle Type (e.g. Motorcycle)"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                    className="h-11"
                  />
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-green-600 hover:bg-green-700">
                  {loading ? "Creating..." : "Continue"}
                </Button>

                <Button
                  type="button"
                  onClick={() => setScreen("signup-role")}
                  variant="ghost"
                  className="w-full">
                  Change Role
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* OTP Verification */}
        {screen === "otp" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Verify Email
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter the code sent to {email}
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="h-11 text-center text-lg tracking-widest"
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-green-600 hover:bg-green-700">
                  {loading ? "Verifying..." : "Verify"}
                </Button>

                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  variant="ghost"
                  className="w-full">
                  Resend Code
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;