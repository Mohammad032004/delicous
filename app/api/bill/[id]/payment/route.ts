import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import Order from "@/models/Order";
import Table from "@/models/Table";

const allowedPaymentMethods = [
  "CASH",
  "UPI",
  "CARD",
  "OTHER",
] as const;

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
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();
    const paymentMethod = body.paymentMethod;

    if (
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const bill = await Bill.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    });

    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          error: "Bill not found",
        },
        { status: 404 }
      );
    }

    if (bill.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Cancelled bill cannot be paid",
        },
        { status: 400 }
      );
    }

    if (bill.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: "Bill is already paid",
        },
        { status: 400 }
      );
    }

    const paidAt = new Date();

    // Mark bill as paid
    bill.paymentStatus = "PAID";
    bill.paymentMethod = paymentMethod;
    bill.status = "PAID";
    bill.paidAt = paidAt;

    await bill.save();

    // Keep order payment status synchronized
    await Order.findOneAndUpdate(
      {
        _id: bill.orderId,
        restaurantId: session.user.restaurantId,
      },
      {
        $set: {
          paymentStatus: "PAID",
        },
      }
    );

    // Make the table available again
    await Table.findOneAndUpdate(
      {
        _id: bill.tableId,
        restaurantId: session.user.restaurantId,
      },
      {
        $set: {
          status: "AVAILABLE",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      bill,
    });
  } catch (error) {
    console.error(
      "Payment update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to record payment",
      },
      { status: 500 }
    );
  }
}