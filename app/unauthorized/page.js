'use client'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

export default function UnauthorizedPage() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        
        {currentUser ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Logged in as: {currentUser.email}
              <br />
              User type: {currentUser.userData?.userType || 'Not set'}
            </p>
            <div className="space-x-4">
              <Link 
                href="/"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Go Home
              </Link>
              <button 
                onClick={() => {
                  auth.signOut()
                  window.location.href = '/'
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link 
            href="/auth/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  )
}