import Link from "next/link";
import { getCurrentUser } from "../lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mess Management System
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Efficiently manage your mess operations, orders, and payments in one
            place.
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full border border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition duration-200"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                href={`/${user.userData.userType}/dashboard`}
                className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
