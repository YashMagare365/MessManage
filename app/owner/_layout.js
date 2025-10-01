"use client";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentLayout({ children }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.userData?.userType !== "student") {
      router.push("/unauthorized");
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.userData?.userType !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-600">You don't have access to this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Student Portal
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{currentUser.displayName}</span>
              <button
                onClick={() => router.push("/auth/logout")}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
