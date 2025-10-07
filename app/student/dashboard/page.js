"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import MessList from "../../../components/student/MessList";
import MenuCard from "../../../components/student/MenuCard";
import OrderCart from "../../../components/student/OrderCart";
import AddressForm from "../../../components/common/AddressForm";
import AddressDisplay from "../../../components/common/AddressDisplay";
import LogoutButton from "../../../components/common/LogoutButton";
import dynamic from "next/dynamic";
import { getMesses, createOrder } from "../../../lib/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const LogoutButtonDynamic = dynamic(
  () => import("../../../components/common/LogoutButton"),
  { ssr: false }
);

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

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
      studentEmail: currentUser.email,
      createdAt: new Date(),
    };

    try {
      await createOrder(completeOrderData);
      // Clear cart after successful order placement
      setCart([]);
    } catch (error) {
      throw error;
    }
  };

  const updateStudentAddress = async (addressData) => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        address: addressData,
        updatedAt: new Date(),
      });
      // Update local user data
      if (currentUser.userData) {
        currentUser.userData.address = addressData;
      }
      setShowAddressForm(false);
      alert("Address updated successfully!");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Error updating address: " + error.message);
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
              <AddressDisplay
                address={currentUser?.userData?.address}
                title="My Address"
                className="text-right"
              />
              <LogoutButtonDynamic />
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

            {/* Address Management */}
            <div className="mt-4">
              {!currentUser?.userData?.address?.street ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Add your delivery address
                </button>
              ) : (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-gray-600 hover:text-gray-700 text-sm"
                >
                  Update address
                </button>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full">
              <span className="font-semibold">{cart.length}</span> items in cart
            </div>
          )}
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <AddressForm
                initialAddress={currentUser?.userData?.address || {}}
                onSave={updateStudentAddress}
                onCancel={() => setShowAddressForm(false)}
                title="Update Your Address"
              />
            </div>
          </div>
        )}

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
                studentAddress={currentUser?.userData?.address}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
