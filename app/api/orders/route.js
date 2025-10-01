import { NextResponse } from "next/server";
import { getOrders, createOrder } from "../../../lib/firestore";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const orderId = await createOrder(orderData);
    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
