"use client";
import { useState, useEffect } from "react";
import {
  ORDER_STATUS,
  getNextStatusOptions,
  getStatusInfo,
  getOrderProgress,
} from "../../lib/orderStatus";
import GoogleMap from "../common/GoogleMap";
import { getMessLocation } from "../../lib/firestore";

export default function OrderCard({ order, onStatusUpdate }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [messLocation, setMessLocation] = useState(null);
  const [studentLocation, setStudentLocation] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Generate a stable order ID for display
  const orderId = order.id || order._id || `temp-${Date.now()}`;
  const displayOrderId = orderId.slice(-6);

  const statusInfo = getStatusInfo(order.status);
  const nextStatusOptions = getNextStatusOptions(order.status, order.orderType);
  const progress = getOrderProgress(order.status);

  useEffect(() => {
    if (order.orderType === "delivery" && order.deliveryAddress) {
      loadLocations();
    }
  }, [order]);

  const loadLocations = async () => {
    if (!order.deliveryAddress) return;
    
    setLoadingLocations(true);
    try {
      // Get mess location
      const messLoc = await getMessLocation(order.messId);
      setMessLocation(messLoc);

      // For demo purposes, create a mock student location
      const mockStudentLocation = {
        lat: messLoc.lat + (Math.random() - 0.5) * 0.02,
        lng: messLoc.lng + (Math.random() - 0.5) * 0.02,
        address: order.deliveryAddress
      };
      setStudentLocation(mockStudentLocation);
    } catch (error) {
      console.error("Error loading locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Format address function
  const formatAddress = (address) => {
    if (!address) return "No address provided";

    if (typeof address === "string") {
      return address;
    }

    // Handle address object
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.landmark) parts.push(address.landmark);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);

    return parts.join(", ") || "Address not specified";
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(orderId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating order status: " + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Prepare markers for the map
  const markers = [];
  if (messLocation) {
    markers.push({
      position: { lat: messLocation.lat, lng: messLocation.lng },
      title: `${order.messName} (Mess)`,
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
  }
  if (studentLocation) {
    markers.push({
      position: { lat: studentLocation.lat, lng: studentLocation.lng },
      title: `${order.studentName} (Delivery Address)`,
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
  }

  // Calculate center point for map
  const mapCenter = markers.length > 0 
    ? markers[0].position 
    : { lat: 28.6139, lng: 77.2090 }; // Default to Delhi

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{displayOrderId}
          </h3>
          <p className="text-sm text-gray-600">
            by {order.studentName || "Unknown Student"} • {formatDate(order.createdAt)} at{" "}
            {formatTime(order.createdAt)}
          </p>
          {getTimeElapsed(order.createdAt) && (
            <p className="text-xs text-gray-500 mt-1">
              {getTimeElapsed(order.createdAt)}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
          >
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.label}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.orderType === "delivery"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {order.orderType?.toUpperCase() || "UNKNOWN"}
          </span>
        </div>
      </div>

      {/* Order Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Order Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-${statusInfo.color}-500 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
        <div className="space-y-2">
          {Object.values(ORDER_STATUS).map((status, index) => {
            const stepInfo = getStatusInfo(status);
            const isCompleted =
              getOrderProgress(order.status) >= getOrderProgress(status);
            const isCurrent = order.status === status;

            return (
              <div key={status} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? `bg-${stepInfo.color}-500 text-white`
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm ${
                    isCompleted ? "text-gray-900" : "text-gray-500"
                  } ${isCurrent ? "font-semibold" : ""}`}
                >
                  {stepInfo.label}
                </span>
                {isCurrent && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity || 1}
              </span>
              <span>₹{item.price * (item.quantity || 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-600">Payment:</span>
          <span
            className={`ml-2 font-medium ${
              order.paymentMethod === "online"
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {order.paymentMethod === "online"
              ? "Online Paid"
              : "Cash on Delivery"}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Total:</span>
          <span className="ml-2 font-semibold text-gray-900">
            ₹{order.total || 0}
          </span>
        </div>
      </div>

      {/* Delivery Information */}
      {order.orderType === "delivery" && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Delivery Information
          </h4>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Delivery Address:
              </p>
              <p className="text-sm text-gray-600">
                {formatAddress(order.deliveryAddress)}
              </p>
            </div>
          )}

          {/* Customer Contact */}
          <div className="bg-blue-50 p-3 rounded-lg mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Customer Contact:
            </p>
            <div className="flex space-x-4">
              <div>
                <p className="text-xs text-gray-600">Name</p>
                <p className="text-sm font-medium">{order.studentName || "Unknown"}</p>
              </div>
              {order.studentPhone && (
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-medium">{order.studentPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="font-medium text-gray-700">
                Delivery Location
              </span>
              <button
                onClick={() => setShowMap(!showMap)}
                disabled={loadingLocations}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
              >
                {loadingLocations ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>{showMap ? "Hide Map" : "Show Map"}</span>
                )}
              </button>
            </div>

            {showMap ? (
              <div className="h-64 bg-gray-100 relative">
                {markers.length > 0 ? (
                  <>
                    <GoogleMap
                      center={mapCenter}
                      markers={markers}
                      height="256px"
                      className="w-full"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">Mess Location</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">Delivery Location</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${studentLocation?.lat},${studentLocation?.lng}&travelmode=driving`, '_blank')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <span>🗺️</span>
                        <span>Get Directions</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p className="text-gray-600 font-medium">Interactive Map</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {loadingLocations ? "Loading locations..." : "Click show map to view delivery route"}
                      </p>
                      {!loadingLocations && (
                        <div className="mt-3 flex space-x-2 justify-center">
                          <button 
                            onClick={loadLocations}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Load Map
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <button
                  onClick={() => setShowMap(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <span>🗺️</span>
                  <span>Click to view delivery map</span>
                </button>
              </div>
            )}
          </div>

          {/* Delivery Actions */}
          {order.status === "out_for_delivery" && studentLocation && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${studentLocation.lat},${studentLocation.lng}&travelmode=driving`, '_blank')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗺️</span>
                <span>Open in Google Maps</span>
              </button>
              {order.studentPhone && (
                <button
                  onClick={() => window.open(`tel:${order.studentPhone}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📞</span>
                  <span>Call Customer</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Walk-in Order Information */}
      {order.orderType === "walkin" && (
        <div className="mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-2">🏪</span>
              <div>
                <p className="font-medium text-green-800">Walk-in Order</p>
                <p className="text-sm text-green-600 mt-1">
                  Customer will pick up the order from your mess location
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {nextStatusOptions.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Update Order Status:
          </h4>
          <div className="flex flex-wrap gap-2">
            {nextStatusOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleStatusUpdate(option.status)}
                disabled={updatingStatus}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  option.color === "red"
                    ? "bg-red-500 hover:bg-red-600"
                    : option.color === "blue"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : option.color === "orange"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : option.color === "purple"
                    ? "bg-purple-500 hover:bg-purple-600"
                    : option.color === "indigo"
                    ? "bg-indigo-500 hover:bg-indigo-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {updatingStatus ? "Updating..." : option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Completed Message */}
      {order.status === ORDER_STATUS.DELIVERED && (
        <div className="border-t pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-2">🎉</span>
              <div>
                <p className="font-medium text-green-800">
                  Order Completed Successfully!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  This order was{" "}
                  {order.orderType === "delivery" ? "delivered" : "completed"}{" "}
                  on {formatDate(order.updatedAt || order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Cancelled Message */}
      {order.status === ORDER_STATUS.CANCELLED && (
        <div className="border-t pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-lg mr-2">❌</span>
              <div>
                <p className="font-medium text-red-800">Order Cancelled</p>
                <p className="text-sm text-red-600 mt-1">
                  This order was cancelled on{" "}
                  {formatDate(order.updatedAt || order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}