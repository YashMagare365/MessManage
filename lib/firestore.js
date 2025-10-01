import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// User operations
export const getUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data() : null;
};

// Mess operations
export const getMesses = async () => {
  const querySnapshot = await getDocs(collection(db, "messes"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getMessById = async (messId) => {
  const messDoc = await getDoc(doc(db, "messes", messId));
  return messDoc.exists() ? { id: messDoc.id, ...messDoc.data() } : null;
};

// Order operations
export const createOrder = async (orderData) => {
  const docRef = await addDoc(collection(db, "orders"), orderData);
  return docRef.id;
};

export const getOrders = async () => {
  const querySnapshot = await getDocs(collection(db, "orders"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getMessOrders = async (messId) => {
  const q = query(
    collection(db, "orders"),
    where("messId", "==", messId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateOrderStatus = async (orderId, status) => {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: new Date(),
  });
};

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, "orders"),
    where("studentId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
