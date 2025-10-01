"use client";
import { useState } from "react";

export default function OrderCart({ cart, onPlaceOrder, selectedMess }) {
  const [orderType, setOrderType] = useState("walkin");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!selectedMess) {
      alert("Please select a mess first!");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await onPlaceOrder(orderType, paymentMethod);
    } catch (error) {
      alert("Error placing order: " + error.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    // In a real app, you'd update the cart state here
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    // In a real app, you'd update the cart state here
  };

  if (!selectedMess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <p className="text-gray-500">Select a mess to start ordering</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
        <p className="text-sm text-gray-600">From {selectedMess.name}</p>
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

        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  ₹{item.price} × {item.quantity || 1}
                </p>
                <p className="text-xs text-gray-500">
                  Subtotal: ₹{item.price * (item.quantity || 1)}
                </p>
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
                <span className="w-8 text-center">{item.quantity || 1}</span>
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

          {cart.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">
                Add items from the menu to get started
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
              {isPlacingOrder ? "Placing Order..." : `Place ${orderType} Order`}
            </button>

            {paymentMethod === "online" && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                You will be redirected to secure payment gateway
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
