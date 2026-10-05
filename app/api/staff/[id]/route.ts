import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const allowedStatuses = ["SERVED", "COMPLETED"] as const;

type StaffOrderStatus = (typeof allowedStatuses)[number];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const status = String(
      body.status
    ) as StaffOrderStatus;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        restaurantId: session.user.restaurantId,
        status:
          status === "SERVED"
            ? "READY"
            : "SERVED",
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
      }
    ).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found or invalid status transition",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Staff order update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update order",
      },
      { status: 500 }
    );
  }
}