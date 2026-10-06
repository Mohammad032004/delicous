import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order, { OrderStatus } from "@/models/Order";

const allowedStatuses: OrderStatus[] = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.restaurantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();
    const { status } = body;

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const currentStatus = order.status;

    const validTransition =
      (currentStatus === "PLACED" && status === "ACCEPTED") ||
      (currentStatus === "ACCEPTED" && status === "PREPARING") ||
      (currentStatus === "PREPARING" && status === "READY") ||
      (currentStatus === "READY" && status === "SERVED") ||
      (currentStatus === "SERVED" && status === "COMPLETED") ||
      status === "CANCELLED";

    if (!validTransition) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${status}`,
        },
        { status: 400 }
      );
    }

    order.status = status;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Kitchen order update error:", error);

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}