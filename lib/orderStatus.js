export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_TYPE = {
  WALKIN: "walkin",
  DELIVERY: "delivery",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Get next possible statuses for an order
export const getNextStatusOptions = (currentStatus, orderType) => {
  const baseFlow = {
    [ORDER_STATUS.PENDING]: [
      { status: ORDER_STATUS.CONFIRMED, label: "Confirm Order", color: "blue" },
      { status: ORDER_STATUS.CANCELLED, label: "Cancel Order", color: "red" },
    ],
    [ORDER_STATUS.CONFIRMED]: [
      {
        status: ORDER_STATUS.PREPARING,
        label: "Start Preparing",
        color: "orange",
      },
      { status: ORDER_STATUS.CANCELLED, label: "Cancel Order", color: "red" },
    ],
    [ORDER_STATUS.PREPARING]: [
      { status: ORDER_STATUS.READY, label: "Mark as Ready", color: "purple" },
      { status: ORDER_STATUS.CANCELLED, label: "Cancel Order", color: "red" },
    ],
    [ORDER_STATUS.READY]:
      orderType === ORDER_TYPE.DELIVERY
        ? [
            {
              status: ORDER_STATUS.OUT_FOR_DELIVERY,
              label: "Out for Delivery",
              color: "indigo",
            },
          ]
        : [
            {
              status: ORDER_STATUS.DELIVERED,
              label: "Mark as Completed",
              color: "green",
            },
          ],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [
      {
        status: ORDER_STATUS.DELIVERED,
        label: "Mark as Delivered",
        color: "green",
      },
    ],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: [],
  };

  return baseFlow[currentStatus] || [];
};

// Get status display information
export const getStatusInfo = (status) => {
  const statusInfo = {
    [ORDER_STATUS.PENDING]: {
      label: "Pending",
      color: "yellow",
      icon: "⏳",
      description: "Waiting for confirmation",
    },
    [ORDER_STATUS.CONFIRMED]: {
      label: "Confirmed",
      color: "blue",
      icon: "✅",
      description: "Order confirmed",
    },
    [ORDER_STATUS.PREPARING]: {
      label: "Preparing",
      color: "orange",
      icon: "👨‍🍳",
      description: "Food being prepared",
    },
    [ORDER_STATUS.READY]: {
      label: "Ready",
      color: "purple",
      icon: "📦",
      description: "Ready for pickup/delivery",
    },
    [ORDER_STATUS.OUT_FOR_DELIVERY]: {
      label: "Out for Delivery",
      color: "indigo",
      icon: "🚚",
      description: "On the way to customer",
    },
    [ORDER_STATUS.DELIVERED]: {
      label: "Delivered",
      color: "green",
      icon: "🎉",
      description: "Order delivered successfully",
    },
    [ORDER_STATUS.CANCELLED]: {
      label: "Cancelled",
      color: "red",
      icon: "❌",
      description: "Order cancelled",
    },
  };

  return (
    statusInfo[status] || {
      label: status,
      color: "gray",
      icon: "❓",
      description: "Unknown status",
    }
  );
};

// Get progress percentage for order timeline
export const getOrderProgress = (status) => {
  const progress = {
    [ORDER_STATUS.PENDING]: 0,
    [ORDER_STATUS.CONFIRMED]: 20,
    [ORDER_STATUS.PREPARING]: 40,
    [ORDER_STATUS.READY]: 70,
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 90,
    [ORDER_STATUS.DELIVERED]: 100,
    [ORDER_STATUS.CANCELLED]: 0,
  };
  return progress[status] || 0;
};
