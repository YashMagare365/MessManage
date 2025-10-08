"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmail } from "../../../lib/auth";
import SignupForm from "../../../components/auth/SignupForm";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const [animationClass, setAnimationClass] = useState("");
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

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setAnimationClass("pulse");
    setTimeout(() => setAnimationClass(""), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header Section */}
      

        {/* User Type Selection - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">I am a...</h3>
            <p className="text-gray-500 mt-2">
              Choose how you'll use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Student Option */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                userType === "student"
                  ? "border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200"
                  : "border-gray-200 bg-gray-50 hover:border-indigo-300"
              } ${animationClass}`}
              onClick={() => handleUserTypeSelect("student")}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-3 rounded-full mb-3 ${
                    userType === "student"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l9 5m-9 5l-9-5"
                    />
                  </svg>
                </div>
                <h4
                  className={`font-semibold text-lg ${
                    userType === "student" ? "text-indigo-700" : "text-gray-700"
                  }`}
                >
                  Student
                </h4>
                <p className="text-sm text-gray-500 mt-2">
                  Looking for Mess to buy food
                </p>
                {userType === "student" && (
                  <div className="absolute top-2 right-2">
                    <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Option */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                userType === "owner"
                  ? "border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200"
                  : "border-gray-200 bg-gray-50 hover:border-green-300"
              } ${animationClass}`}
              onClick={() => handleUserTypeSelect("owner")}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-3 rounded-full mb-3 ${
                    userType === "owner"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h4
                  className={`font-semibold text-lg ${
                    userType === "owner" ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  Mess Owner
                </h4>
                <p className="text-sm text-gray-500 mt-2">
                  Have opened a mess to sell food
                </p>
                {userType === "owner" && (
                  <div className="absolute top-2 right-2">
                    <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div
              className={`h-2 w-2 rounded-full ${
                userType ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          </div>

          {/* Signup Form - Only show after user type selection */}
          {userType ? (
            <div className="animate-fade-in">
              <div className="text-center mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    userType === "student"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {userType === "student"
                    ? "🎓 Student Account"
                    : "🏢 Space Owner Account"}
                </span>
              </div>
              <SignupForm
                onSubmit={handleSignup}
                loading={loading}
                userType={userType}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">
                Please select your role to continue with signup
              </p>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
