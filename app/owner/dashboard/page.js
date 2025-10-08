"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import OrderCard from "../../../components/owner/OrderCard";
import MenuManager from "../../../components/owner/MenuManager";
import QrUpload from "../../../components/owner/QrUpload";
import LogoutButton from "../../../components/common/LogoutButton";
import { getMessOrders, updateOrderStatus } from "../../../lib/firestore";

export default function OwnerDashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  const loadOrders = async () => {
    try {
      const ordersData = await getMessOrders(currentUser.uid);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      // Reload orders to get updated data
      await loadOrders();
      alert(`Order status updated to: ${status.replace(/_/g, " ")}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "orders", name: "Orders", count: orders.length },
    { id: "menu", name: "Menu" },
    { id: "qr", name: "QR Code" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Mess Owner Portal
              </h1>
              <p className="text-sm text-gray-600">
                Manage your mess operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {currentUser?.displayName || currentUser?.userData?.name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mess Owner Dashboard
        </h1>
        <p className="text-gray-600 mb-8">Manage your mess operations</p>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.map((index,order) => (
              <OrderCard
                key={index}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Orders will appear here when students place them
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "menu" && currentUser && (
          <MenuManager messId={currentUser.uid} />
        )}

        {activeTab === "qr" && currentUser && (
          <QrUpload messId={currentUser.uid} />
        )}
      </div>
    </div>
  );
}
