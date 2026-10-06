import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const allowedRoles = [
  "KITCHEN",
  "RESTAURANT_OWNER",
  "MANAGER",
];

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!session.user.restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to view kitchen orders",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const orders = await Order.find({
      restaurantId: session.user.restaurantId,
      status: {
        $in: [
          "PLACED",
          "ACCEPTED",
          "PREPARING",
          "READY",
        ],
      },
    })
      .populate("tableId", "name number capacity")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Kitchen orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load kitchen orders",
      },
      { status: 500 }
    );
  }
}