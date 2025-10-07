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
import { ORDER_STATUS } from "./orderStatus";

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
  const completeOrderData = {
    ...orderData,
    status: ORDER_STATUS.PENDING,
    paymentStatus:
      orderData.paymentMethod === "online" ? "completed" : "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, "orders"), completeOrderData);
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
  try {
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
  } catch (error) {
    console.error("Error getting mess orders:", error);

    // Fallback: get all orders and filter client-side
    if (error.code === "failed-precondition") {
      const allOrders = await getOrders();
      return allOrders
        .filter((order) => order.messId === messId)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });
    }
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  const updateData = {
    status,
    updatedAt: new Date(),
  };

  // Add timestamp for specific status changes
  if (status === ORDER_STATUS.CONFIRMED) {
    updateData.confirmedAt = new Date();
  } else if (status === ORDER_STATUS.PREPARING) {
    updateData.preparingAt = new Date();
  } else if (status === ORDER_STATUS.READY) {
    updateData.readyAt = new Date();
  } else if (status === ORDER_STATUS.OUT_FOR_DELIVERY) {
    updateData.outForDeliveryAt = new Date();
  } else if (status === ORDER_STATUS.DELIVERED) {
    updateData.deliveredAt = new Date();
  } else if (status === ORDER_STATUS.CANCELLED) {
    updateData.cancelledAt = new Date();
  }

  await updateDoc(doc(db, "orders", orderId), updateData);
};

export const getUserOrders = async (userId) => {
  try {
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
  } catch (error) {
    console.error("Error getting user orders:", error);

    // Fallback: get all orders and filter client-side
    if (error.code === "failed-precondition") {
      const allOrders = await getOrders();
      return allOrders
        .filter((order) => order.studentId === userId)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });
    }
    throw error;
  }
};

// Real-time order listeners
export const listenToMessOrders = (messId, callback) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("messId", "==", messId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(orders);
      },
      (error) => {
        console.error("Error in mess orders listener:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up mess orders listener:", error);
    throw error;
  }
};

export const listenToUserOrders = (userId, callback) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("studentId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(orders);
      },
      (error) => {
        console.error("Error in user orders listener:", error);
      }
    );
  } catch (error) {
    console.error("Error setting up user orders listener:", error);
    throw error;
  }
};

// Menu management operations
export const updateMessMenu = async (messId, menuItems) => {
  await updateDoc(doc(db, "messes", messId), {
    menu: menuItems,
    menuUpdatedAt: new Date(),
  });
};

export const getMessMenu = async (messId) => {
  const messDoc = await getDoc(doc(db, "messes", messId));
  if (messDoc.exists()) {
    const messData = messDoc.data();
    return messData.menu || [];
  }
  return [];
};

// Statistics and analytics
export const getMessOrderStats = async (messId) => {
  const orders = await getMessOrders(messId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => {
    const orderDate = order.createdAt?.toDate
      ? order.createdAt.toDate()
      : new Date(order.createdAt);
    return orderDate >= today;
  });

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const revenue = orders
    .filter((order) => order.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    statusCounts,
    revenue,
    popularItems: getPopularItems(orders),
  };
};

const getPopularItems = (orders) => {
  const itemCounts = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const key = item.name;
      itemCounts[key] = (itemCounts[key] || 0) + (item.quantity || 1);
    });
  });

  return Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
};

// Delivery operations
export const updateDeliveryInfo = async (orderId, deliveryInfo) => {
  await updateDoc(doc(db, "orders", orderId), {
    ...deliveryInfo,
    updatedAt: new Date(),
  });
};

// Payment operations
export const updatePaymentStatus = async (
  orderId,
  paymentStatus,
  paymentId = null
) => {
  const updateData = {
    paymentStatus,
    updatedAt: new Date(),
  };

  if (paymentId) {
    updateData.paymentId = paymentId;
  }

  if (paymentStatus === "completed") {
    updateData.paidAt = new Date();
  }

  await updateDoc(doc(db, "orders", orderId), updateData);
};
