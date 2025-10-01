import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const createUserWithEmail = async (userData) => {
  const { email, password, name, phone, userType } = userData;

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: name,
    });

    // Send email verification
    await sendEmailVerification(user);

    // Save user data to Firestore
    const userDocData = {
      name,
      email,
      phone,
      userType,
      createdAt: new Date(),
      emailVerified: false,
    };

    await setDoc(doc(db, "users", user.uid), userDocData);

    // If user is a mess owner, create a mess document
    if (userType === "owner") {
      await setDoc(doc(db, "messes", user.uid), {
        name: `${name}'s Mess`,
        ownerId: user.uid,
        ownerName: name,
        description: "Describe your mess here...",
        menu: [],
        isActive: true,
        createdAt: new Date(),
      });
    }

    // Return the complete user data
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      userData: userDocData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      throw new Error("User data not found");
    }

    const userData = userDoc.data();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      userData: userData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              userData: userData,
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};
