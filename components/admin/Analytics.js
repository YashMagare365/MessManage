"use client";
import { useState, useEffect } from "react";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    // Simulated data - replace with actual Firebase analytics
    const sampleStats = {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 125000,
      activeMesses: 8,
      newUsers: 15,
      completedOrders: 420,
      cancelledOrders: 30,
      revenueGrowth: 12.5,
      userGrowth: 8.2,
      popularMesses: [
        { name: "Spice Garden", orders: 85, revenue: 28000 },
        { name: "Tasty Bites", orders: 72, revenue: 24000 },
        { name: "Home Kitchen", orders: 68, revenue: 22000 },
      ],
      recentOrders: [
        {
          id: "ORD001",
          user: "John Doe",
          mess: "Spice Garden",
          amount: 280,
          status: "delivered",
        },
        {
          id: "ORD002",
          user: "Jane Smith",
          mess: "Tasty Bites",
          amount: 320,
          status: "preparing",
        },
        {
          id: "ORD003",
          user: "Bob Wilson",
          mess: "Home Kitchen",
          amount: 180,
          status: "pending",
        },
      ],
    };
    setStats(sampleStats);
    setLoading(false);
  };

  const StatCard = ({ title, value, change, icon }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}% from last period
            </p>
          )}
        </div>
        <div className="text-indigo-600 text-2xl">{icon}</div>
      </div>
    </div>
  );

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          icon="👥"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={12.5}
          icon="📦"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          icon="💰"
        />
        <StatCard
          title="Active Messes"
          value={stats.activeMesses}
          change={5.2}
          icon="🏪"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Messes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Messes
          </h3>
          <div className="space-y-4">
            {stats.popularMesses.map((mess, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{mess.name}</h4>
                  <p className="text-sm text-gray-600">{mess.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ₹{mess.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Orders</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{stats.completedOrders}</span>
                <span className="text-green-600 text-sm">✓</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Orders</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {stats.totalOrders -
                    stats.completedOrders -
                    stats.cancelledOrders}
                </span>
                <span className="text-yellow-600 text-sm">⏳</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled Orders</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{stats.cancelledOrders}</span>
                <span className="text-red-600 text-sm">✗</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {((stats.completedOrders / stats.totalOrders) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mess
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.mess}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "preparing"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
