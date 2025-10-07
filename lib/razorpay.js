// Server-side Razorpay instance (for API routes)
let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const Razorpay = require("razorpay");
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Client-side Razorpay loader
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Client-side payment initialization
export const initiateRazorpayPayment = async (orderData) => {
  try {
    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded) {
      throw new Error("Razorpay SDK failed to load. Please try again.");
    }

    if (!window.Razorpay) {
      throw new Error("Razorpay not available");
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // amount in paise
        currency: "INR",
        name: "Mess Management System",
        description: `Order from ${orderData.messName}`,
        order_id: orderData.razorpayOrderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: orderData.studentName,
          email: orderData.studentEmail,
          contact: orderData.studentPhone || "",
        },
        notes: {
          orderId: orderData.orderId,
          messId: orderData.messId,
          studentId: orderData.studentId,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled by user"));
          },
        },
      };

      console.log("Razorpay options:", options);

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        reject(new Error(response.error.description || "Payment failed"));
      });

      razorpayInstance.open();
    });
  } catch (error) {
    console.error("Error initiating Razorpay payment:", error);
    throw error;
  }
};

// Export a default object for backward compatibility
export default {
  getRazorpayInstance,
  loadRazorpay,
  initiateRazorpayPayment,
};
