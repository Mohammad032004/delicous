import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

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

    await connectDB();

    const orders = await Order.find({
      restaurantId: session.user.restaurantId,
      status: {
        $in: ["READY", "SERVED"],
      },
    })
      .populate("tableId", "name number capacity")
      .sort({ updatedAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Staff orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load staff orders",
      },
      { status: 500 }
    );
  }
}