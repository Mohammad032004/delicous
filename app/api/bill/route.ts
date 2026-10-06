import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Order from "@/models/Order";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const bills = await Bill.find({
      restaurantId: session.user.restaurantId,
    })
      .populate({
        path: "orderId",
        select:
          "orderNumber status paymentStatus customerName createdAt",
      })
      .populate({
        path: "tableId",
        select: "name number",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load bills",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const orderId = String(body.orderId ?? "").trim();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order belonging to this restaurant.
    const order = await Order.findOne({
      _id: orderId,
      restaurantId: session.user.restaurantId,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Only completed orders can generate a final bill.
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: "Only completed orders can generate a bill",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate bills for the same order.
    const existingBill = await Bill.findOne({
      orderId: order._id,
      restaurantId: session.user.restaurantId,
    }).lean();

    if (existingBill) {
      return NextResponse.json({
        success: true,
        message: "Bill already exists",
        bill: existingBill,
      });
    }

    // Generate the next bill number for this restaurant.
    const lastBill = await Bill.findOne({
      restaurantId: session.user.restaurantId,
    })
      .sort({ billNumber: -1 })
      .select("billNumber")
      .lean();

    const billNumber = (lastBill?.billNumber ?? 0) + 1;

    const bill = await Bill.create({
      restaurantId: order.restaurantId,
      orderId: order._id,
      tableId: order.tableId,
      billNumber,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentStatus: "PENDING",
      status: "GENERATED",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bill generated successfully",
        bill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bill generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate bill",
      },
      { status: 500 }
    );
  }
}