"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmail } from "../../../lib/auth";
import SignupForm from "../../../components/auth/SignupForm"; // Make sure this path is correct

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (formData) => {
    setLoading(true);
    try {
      await createUserWithEmail(formData);
      router.push("/auth/verify-email");
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <SignupForm onSubmit={handleSignup} loading={loading} />
      </div>
    </div>
  );
}
