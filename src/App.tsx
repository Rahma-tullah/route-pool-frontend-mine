import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import PlaceOrder from "./pages/PlaceOrder";
import TrackOrder from "./pages/TrackOrder";
import Chat from "./pages/Chat";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import DriverDashboard from "./pages/DriverDashboard";
import DriverProfile from "./pages/DriverProfile";
import DriverLayout from "./components/DriverLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


// ============================
// Loading Screen
// ============================
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p className="text-muted-foreground text-sm">Loading...</p>
  </div>
);


// ============================
// Protected Route (With Role Support)
// ============================
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: "retailer" | "rider";
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && user?.user_type !== allowedRole) {
    // Redirect to their correct dashboard if they hit the wrong role's route
    return <Navigate to={user?.user_type === "rider" ? "/driver" : "/"} replace />;
  }

  return <>{children}</>;
};


// ============================
// Auth Route (Redirect if Logged In)
// ============================
const AuthRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.user_type === "rider" ? "/driver" : "/"} replace />;
  }

  return <Auth />;
};


// ============================
// Routes (gated behind loading)
// ============================
const AppRoutes = () => {
  const { loading } = useAuth();

  // Don't render any routes until auth state is fully resolved
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<AuthRoute />} />

      {/* ============================
          Rider Routes (DriverLayout)
          ============================ */}
      <Route
        element={
          <ProtectedRoute allowedRole="rider">
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
      </Route>

      {/* ============================
          Retailer Routes (AppLayout)
          ============================ */}
      <Route
        element={
          <ProtectedRoute allowedRole="retailer">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};


// ============================
// Main App
// ============================
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;