import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Function to create mess document
export const createMessDocument = async (ownerId, ownerName) => {
  try {
    console.log("Creating mess document for:", ownerId);

    const messData = {
      name: `${ownerName}'s Mess`,
      ownerId: ownerId,
      ownerName: ownerName,
      description: "Welcome to our mess! We serve delicious and hygienic food.",
      menu: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "messes", ownerId), messData);
    console.log("Mess document created successfully for:", ownerId);
    return messData;
  } catch (error) {
    console.error("Error creating mess document:", error);
    throw new Error(`Failed to create mess document: ${error.message}`);
  }
};

// Function to ensure mess document exists
export const ensureMessDocumentExists = async (userId, userName) => {
  try {
    const messDoc = await getDoc(doc(db, "messes", userId));

    if (!messDoc.exists()) {
      console.log("Mess document not found, creating now...");
      await createMessDocument(userId, userName);
      return true; // Document was created
    }

    console.log("Mess document already exists");
    return false; // Document already existed
  } catch (error) {
    console.error("Error ensuring mess document exists:", error);
    throw error;
  }
};

export const createUserWithEmail = async (userData) => {
  const { email, password, name, phone, userType } = userData;

  try {
    console.log("Starting user creation for:", email);

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("User created successfully:", user.uid);

    // Update user profile
    await updateProfile(user, {
      displayName: name,
    });
    console.log("User profile updated");

    // Send email verification
    await sendEmailVerification(user);
    console.log("Verification email sent");

    // Prepare user data for Firestore
    const userDocData = {
      name,
      email,
      phone,
      userType,
      createdAt: new Date(),
      emailVerified: false,
      uid: user.uid, // Store uid for easier queries
    };

    console.log("Saving user data to Firestore...");

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), userDocData);
    console.log("User data saved to Firestore");

    // If user is a mess owner, create a mess document
    if (userType === "owner") {
      console.log("Creating mess document for owner...");
      await createMessDocument(user.uid, name);
      console.log("Mess document created successfully");
    }

    // Return the complete user data
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      userData: userDocData,
    };
  } catch (error) {
    console.error("Error in createUserWithEmail:", error);

    // More specific error messages
    if (error.code === "auth/email-already-in-use") {
      throw new Error(
        "This email is already registered. Please use a different email or login."
      );
    } else if (error.code === "auth/weak-password") {
      throw new Error(
        "Password is too weak. Please use a stronger password (at least 6 characters)."
      );
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address. Please check your email format.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error(
        "Network error. Please check your internet connection and try again."
      );
    } else {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    console.log("Attempting sign in for:", email);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("User signed in successfully:", user.uid);

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      console.error("User document not found for:", user.uid);
      throw new Error("User data not found. Please contact support.");
    }

    const userData = userDoc.data();
    console.log("User data retrieved:", userData);

    // If user is a mess owner, ensure mess document exists
    if (userData.userType === "owner") {
      console.log("User is a mess owner, checking mess document...");
      try {
        await ensureMessDocumentExists(user.uid, userData.name);
      } catch (messError) {
        console.warn("Could not ensure mess document exists:", messError);
        // Continue with login even if mess document creation fails
      }
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      userData: userData,
    };
  } catch (error) {
    console.error("Error in signInWithEmail:", error);

    // More specific error messages
    if (error.code === "auth/user-not-found") {
      throw new Error(
        "No account found with this email. Please sign up first."
      );
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address format.");
    } else if (error.code === "auth/too-many-requests") {
      throw new Error(
        "Too many failed login attempts. Please try again later or reset your password."
      );
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Network error. Please check your internet connection.");
    } else {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
};

export const logoutUser = async () => {
  try {
    console.log("Logging out user...");
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Logout failed. Please try again.");
  }
};

export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();

      if (user) {
        try {
          console.log("Auth state changed - user found:", user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data loaded successfully");

            resolve({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              userData: userData,
            });
          } else {
            console.warn("User document not found for:", user.uid);
            resolve(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          resolve(null);
        }
      } else {
        console.log("Auth state changed - no user");
        resolve(null);
      }
    });
  });
};

// Additional utility functions

export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in.");
    }

    // Update profile in Firebase Auth
    if (updates.displayName) {
      await updateProfile(user, {
        displayName: updates.displayName,
      });
    }

    // Update user data in Firestore
    if (updates.name || updates.phone) {
      const userRef = doc(db, "users", user.uid);
      const updateData = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.phone) updateData.phone = updates.phone;
      updateData.updatedAt = new Date();

      await setDoc(userRef, updateData, { merge: true });
    }

    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(`Profile update failed: ${error.message}`);
  }
};

export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in.");
    }

    await sendEmailVerification(user);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in.");
    }

    // Reload user to get latest email verification status
    await user.reload();

    return user.emailVerified;
  } catch (error) {
    console.error("Error checking email verification:", error);
    throw new Error(`Failed to check email verification: ${error.message}`);
  }
};
