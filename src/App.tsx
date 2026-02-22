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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === "driver" ? "/driver" : "/"} replace />;
  }
  return <Auth />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      
      {/* Driver routes */}
      <Route path="/driver" element={
        <ProtectedRoute>
          {user?.role === "driver" ? <DriverDashboard /> : <Navigate to="/" replace />}
        </ProtectedRoute>
      } />

      {/* Retailer routes */}
      <Route element={
        <ProtectedRoute>
          {user?.role === "driver" ? <Navigate to="/driver" replace /> : <AppLayout />}
        </ProtectedRoute>
      }>
        <Route path="/" element={<Index />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
