"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserData } from "../lib/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            userData: userData || {}, // Ensure userData is always an object
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            userData: {}, // Fallback empty object
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
