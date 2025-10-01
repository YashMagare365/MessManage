"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";

const LogoutButton = ({ className = "" }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) {
      return;
    }

    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Logging out...</span>
        </>
      ) : (
        <>
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
        </>
      )}
    </button>
  );
};

export default LogoutButton;
