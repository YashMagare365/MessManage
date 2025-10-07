// Test what's being exported
const razorpayExports = {
  loadRazorpay: typeof loadRazorpay,
  initiateRazorpayPayment: typeof initiateRazorpayPayment,
};

console.log("Razorpay exports:", razorpayExports);

export const loadRazorpay = () => {
  console.log("loadRazorpay function called");
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (orderData) => {
  console.log("initiateRazorpayPayment called with:", orderData);

  const razorpayLoaded = await loadRazorpay();
  if (!razorpayLoaded) {
    throw new Error("Razorpay SDK failed to load");
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: "INR",
      name: "Mess Management System",
      description: `Order from ${orderData.messName}`,
      order_id: orderData.razorpayOrderId,
      handler: resolve,
      prefill: {
        name: orderData.studentName,
        email: orderData.studentEmail,
      },
      theme: { color: "#4F46E5" },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on("payment.failed", (response) => {
      reject(new Error(response.error.description));
    });
    razorpayInstance.open();
  });
};
