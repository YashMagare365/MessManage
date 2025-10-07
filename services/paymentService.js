import { initiateRazorpayPayment } from "../lib/razorpay";

class PaymentService {
  async createRazorpayOrder(orderData) {
    try {
      console.log("Creating Razorpay order for amount:", orderData.total);

      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: orderData.total,
          receipt: `order_${Date.now()}`,
          currency: "INR",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      return result.order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new Error(error.message || "Failed to create payment order");
    }
  }

  async verifyPayment(paymentData) {
    try {
      const response = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Payment verification failed");
      }

      return result;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw new Error("Payment verification failed");
    }
  }

  async processOnlinePayment(orderData) {
    try {
      console.log("Starting online payment process...");

      // Step 1: Create Razorpay order
      const razorpayOrder = await this.createRazorpayOrder(orderData);
      console.log("Razorpay order created:", razorpayOrder);

      // Step 2: Prepare payment data
      const paymentData = {
        ...orderData,
        razorpayOrderId: razorpayOrder.id,
        amount: orderData.total, // Keep amount in rupees
      };

      // Step 3: Initiate Razorpay payment
      console.log("Initiating Razorpay payment dialog...");
      const paymentResponse = await initiateRazorpayPayment(paymentData);
      console.log("Payment response:", paymentResponse);

      // Step 4: Verify payment
      console.log("Verifying payment...");
      const verificationResult = await this.verifyPayment({
        razorpay_order_id: razorpayOrder.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      console.log("Payment verified:", verificationResult);

      return {
        success: true,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: razorpayOrder.id,
        verification: verificationResult,
      };
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const paymentService = new PaymentService();
