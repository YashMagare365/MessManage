export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const makePayment = async (orderData) => {
  const res = await loadRazorpay();

  if (!res) {
    alert("Razorpay SDK failed to load");
    return;
  }

  // Create order on your backend
  const response = await fetch("/api/create-razorpay-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const { order } = await response.json();

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "Mess Management",
    description: "Food Order",
    order_id: order.id,
    handler: async function (response) {
      // Verify payment on backend
      const verificationResponse = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verificationResult = await verificationResponse.json();

      if (verificationResult.success) {
        alert("Payment Successful!");
        // Update order status in Firestore
      } else {
        alert("Payment Verification Failed");
      }
    },
    prefill: {
      name: orderData.studentName,
      email: orderData.studentEmail,
    },
    theme: {
      color: "#3399cc",
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
