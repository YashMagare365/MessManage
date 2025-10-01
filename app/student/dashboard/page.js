"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import MessList from "../../../components/student/MessList";
import MenuCard from "../../../components/student/MenuCard";
import OrderCart from "../../../components/student/OrderCart";
import dynamic from "next/dynamic";
import { getMesses, createOrder } from "../../../lib/firestore";

// Use dynamic import for LogoutButton with error handling
const LogoutButton = dynamic(
  () => import("../../../components/common/LogoutButton"),
  {
    ssr: false,
    loading: () => (
      <button className="flex items-center space-x-2 text-red-600 opacity-50">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>Logout</span>
      </button>
    ),
  }
);

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && currentUser.userData?.userType !== "student") {
      router.push("/unauthorized");
      return;
    }

    loadMesses();
  }, [currentUser, router]);

  const loadMesses = async () => {
    try {
      const messesData = await getMesses();
      setMesses(messesData);
    } catch (error) {
      console.error("Error loading messes:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (meal) => {
    if (!selectedMess) return;

    const cartItem = {
      ...meal,
      messId: selectedMess.id,
      messName: selectedMess.name,
      quantity: 1,
    };

    setCart([...cart, cartItem]);
    alert(`${meal.name} added to cart from ${selectedMess.name}!`);
  };

  const placeOrder = async (orderData) => {
    if (!currentUser) {
      alert("Please log in to place an order");
      return;
    }

    const completeOrderData = {
      ...orderData,
      studentId: currentUser.uid,
      studentName:
        currentUser.displayName || currentUser.userData?.name || "Unknown",
      createdAt: new Date(),
    };

    try {
      await createOrder(completeOrderData);
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Student Portal
              </h1>
              <p className="text-sm text-gray-600">
                Order from multiple messes
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome,{" "}
              {currentUser?.displayName ||
                currentUser?.userData?.name ||
                "Student"}
              !
            </h1>
            <p className="text-gray-600 mt-2">
              Order from multiple messes in one go
            </p>
          </div>

          {cart.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
              <span className="font-semibold">{cart.length}</span> items in cart
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MessList
              messes={messes}
              onSelectMess={setSelectedMess}
              selectedMess={selectedMess}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedMess && (
                <MenuCard mess={selectedMess} onAddToCart={addToCart} />
              )}
              <OrderCart
                cart={cart}
                onPlaceOrder={placeOrder}
                selectedMess={selectedMess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
