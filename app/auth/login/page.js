"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "../../../lib/auth";
import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError("");

    try {
      console.log("1. Starting login process...");
      console.log("2. Email:", email);

      const user = await signInWithEmail(email, password);
      console.log("3. USER====", user);

      if (user && user.userData) {
        // Check if user has userType in userData
        if (user.userData.userType) {
          router.push(`/${user.userData.userType}/dashboard`);
        } else {
          // If userType doesn't exist, redirect to a default page or show error
          setError("User type not found. Please contact administrator.");
        }
      } else {
        setError("Invalid user data received.");
      }
    } catch (error) {
      console.log("4. ERROR DETAILS:", error);
      console.log("5. Error code:", error.code);
      console.log("6. Error message:", error.message);
      setError(error.message);
    }
    setLoading(false);
    // Call this in your handleLogin before signInWithEmail
    const firebaseReady = await testFirebase();
    if (!firebaseReady) {
      setError("Firebase not configured properly");
      return;
    }
  };

  const testFirebase = async () => {
    try {
      const { auth } = await import("../../../lib/firebase");
      console.log("Firebase auth object:", auth);
      return true;
    } catch (error) {
      console.log("Firebase import error:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
            <br />
            <small className="text-red-600">
              Check browser console for details
            </small>
          </div>
        )}

        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
}
