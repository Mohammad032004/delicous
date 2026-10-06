import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

    if (!["SERVED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
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

    if (
      status === "SERVED" &&
      order.status !== "READY"
    ) {
      return NextResponse.json(
        {
          error: `Order must be READY before it can be SERVED. Current status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    if (
      status === "COMPLETED" &&
      order.status !== "SERVED"
    ) {
      return NextResponse.json(
        {
          error: `Order must be SERVED before it can be COMPLETED. Current status: ${order.status}`,
        },
        { status: 400 }
      );
    }

    order.status = status;

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order marked as ${status}`,
      order,
    });
  } catch (error) {
    console.error(
      "Staff order update error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update order status",
      },
      { status: 500 }
    );
  }
}