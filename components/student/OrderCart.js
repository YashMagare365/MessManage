"use client";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function OrderCart({ cart, onPlaceOrder, selectedMess }) {
  const { currentUser } = useAuth();
  const [orderType, setOrderType] = useState("walkin");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Group cart items by mess
  const cartByMess = cart.reduce((acc, item) => {
    const messId = item.messId || selectedMess?.id;
    if (!acc[messId]) {
      acc[messId] = {
        messName: item.messName || selectedMess?.name,
        items: [],
      };
    }
    acc[messId].items.push(item);
    return acc;
  }, {});

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // Simple Razorpay loader
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Simple payment initiation
  const initiateRazorpayPayment = async (orderData) => {
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded) {
      throw new Error("Razorpay SDK failed to load. Please try again.");
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // amount in paise
        currency: "INR",
        name: "Mess Management System",
        description: `Order from ${orderData.messName}`,
        order_id: orderData.razorpayOrderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: orderData.studentName,
          email: orderData.studentEmail,
        },
        notes: {
          orderId: orderData.orderId,
          messId: orderData.messId,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        reject(new Error(response.error.description || "Payment failed"));
      });

      razorpayInstance.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!currentUser) {
      alert("Please log in to place an order");
      return;
    }

    setIsPlacingOrder(true);

    try {
      if (paymentMethod === "online") {
        await processOnlinePayment();
      } else {
        await processCashPayment();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order: " + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const processOnlinePayment = async () => {
    try {
      console.log("Starting online payment process...");

      // Step 1: Create Razorpay order via API
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          receipt: `order_${Date.now()}`,
          currency: "INR",
        }),
      });

      const result = await response.json();
      console.log("Razorpay order response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to create payment order");
      }

      // Step 2: Prepare payment data
      const paymentData = {
        razorpayOrderId: result.order.id,
        amount: total,
        messName: Object.values(cartByMess)
          .map((mess) => mess.messName)
          .join(", "),
        studentName:
          currentUser.displayName || currentUser.userData?.name || "Customer",
        studentEmail: currentUser.email,
        studentId: currentUser.uid,
        orderId: `order_${Date.now()}`,
      };

      // Step 3: Initiate payment
      console.log("Opening Razorpay payment dialog...");
      const paymentResponse = await initiateRazorpayPayment(paymentData);
      console.log("Payment completed:", paymentResponse);

      // Step 4: Verify payment
      const verifyResponse = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: result.order.id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      const verifyResult = await verifyResponse.json();
      console.log("Payment verification:", verifyResult);

      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || "Payment verification failed");
      }

      // Payment successful - place orders
      await placeOrdersAfterPayment(paymentResponse.razorpay_payment_id);
      alert("Payment successful! Your order has been placed.");
    } catch (error) {
      console.error("Online payment error:", error);
      throw error;
    }
  };

  const processCashPayment = async () => {
    // Place orders for each mess separately
    for (const [messId, messData] of Object.entries(cartByMess)) {
      const orderData = {
        messId: messId,
        messName: messData.messName,
        items: messData.items,
        total: messData.items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        ),
        orderType,
        paymentMethod: "cash",
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      };
      await onPlaceOrder(orderData);
    }

    alert(
      "Order placed successfully! Please pay in " +
        (orderType === "delivery" ? "cash on delivery" : "cash at pickup")
    );
  };

  const placeOrdersAfterPayment = async (paymentId) => {
    // Place orders for each mess separately with payment info
    for (const [messId, messData] of Object.entries(cartByMess)) {
      const orderData = {
        messId: messId,
        messName: messData.messName,
        items: messData.items,
        total: messData.items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        ),
        orderType,
        paymentMethod: "online",
        status: "paid",
        paymentStatus: "completed",
        paymentId: paymentId,
        paidAt: new Date(),
        createdAt: new Date(),
      };
      await onPlaceOrder(orderData);
    }
  };

  // ... rest of the component (updateQuantity, removeFromCart, JSX) remains the same
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    // Note: You'll need to pass this update to parent component
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    // Note: You'll need to pass this update to parent component
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
        <p className="text-sm text-gray-600">
          {Object.keys(cartByMess).length}{" "}
          {Object.keys(cartByMess).length === 1 ? "mess" : "messes"} selected
        </p>
      </div>

      <div className="p-4">
        {/* Order Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="walkin"
                checked={orderType === "walkin"}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-2"
              />
              <span>Walk-in</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="delivery"
                checked={orderType === "delivery"}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-2"
              />
              <span>Delivery</span>
            </label>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>
                Cash on {orderType === "delivery" ? "Delivery" : "Pickup"}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span>Online Payment</span>
            </label>
          </div>
        </div>

        {/* Cart Items Grouped by Mess */}
        <div className="space-y-4 mb-6">
          {Object.entries(cartByMess).map(([messId, messData]) => (
            <div key={messId} className="border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium text-gray-900">
                  {messData.messName}
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {messData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ₹{item.price} × {item.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(index, (item.quantity || 1) - 1)
                        }
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(index, (item.quantity || 1) + 1)
                        }
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="ml-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">
                Add items from different messes to get started
              </p>
            </div>
          )}
        </div>

        {/* Total and Place Order */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm text-gray-600">₹{total}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Total:
              </span>
              <span className="text-lg font-bold text-green-600">₹{total}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder
                ? "Processing..."
                : paymentMethod === "online"
                ? `Pay ₹${total} Online`
                : `Place Orders (${Object.keys(cartByMess).length} messes)`}
            </button>

            {paymentMethod === "online" && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Secure payment powered by Razorpay
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
