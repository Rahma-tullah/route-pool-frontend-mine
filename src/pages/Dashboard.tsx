import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Package } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    address: "",
    latitude: "",
    longitude: "",
    package_description: "",
  });

  useEffect(() => {
    loadDeliveries();
  }, [user]);

  const loadDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.getDeliveries();
      if (res.success) {
        setDeliveries(res.data || []);
      } else {
        setError("Failed to load deliveries");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.createDelivery({
        retailer_id: user?.id,
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      if (res.success) {
        setFormData({
          customer_name: "",
          customer_phone: "",
          address: "",
          latitude: "",
          longitude: "",
          package_description: "",
        });
        setShowForm(false);
        alert("Delivery created! Check back in 1 minute for auto-batching.");
        await loadDeliveries();
      } else {
        setError(res.error || "Failed to create delivery");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Pool</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-6 text-red-600">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && user?.role === "retailer" && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Create New Delivery</h2>
              <form onSubmit={handleCreateDelivery} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Customer Name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Latitude (e.g. 6.5244)"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Longitude (e.g. 3.3792)"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    required
                  />
                </div>

                <Input
                  placeholder="Package Description"
                  value={formData.package_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      package_description: e.target.value,
                    })
                  }
                  required
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700">
                    Create Delivery
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {!showForm && user?.role === "retailer" && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Delivery
          </Button>
        )}

        {/* Deliveries List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {user?.role === "retailer" ? "My Deliveries" : "My Batches"}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {user?.role === "retailer"
                    ? "No deliveries yet. Create one to get started!"
                    : "No batches assigned yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deliveries.map((delivery: any) => (
                <Card key={delivery.id} className="hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {delivery.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📍 {delivery.address}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          delivery.status,
                        )}`}>
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      📦 {delivery.package_description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Phone: {delivery.customer_phone}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
