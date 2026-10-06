import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const allowedRoles = [
  "WAITER",
  "RESTAURANT_OWNER",
  "MANAGER",
];

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!session.user.restaurantId) {
      return NextResponse.json(
        {
          success: false,
          error: "Restaurant not found",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to update staff orders",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();
    const { status } = body;

    if (!["SERVED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
        },
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
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    if (
      status === "SERVED" &&
      order.status !== "READY"
    ) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
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
        success: false,
        error: "Failed to update order status",
      },
      { status: 500 }
    );
  }
}