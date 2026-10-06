import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";

const allowedMethods = [
  "CASH",
  "UPI",
  "CARD",
  "OTHER",
] as const;

type PaymentMethod = (typeof allowedMethods)[number];

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
          message: "Invalid bill ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const paymentMethod = String(
      body.paymentMethod ?? ""
    ) as PaymentMethod;

    if (!allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
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
          message: "Bill not found",
        },
        { status: 404 }
      );
    }

    if (bill.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Cancelled bills cannot be paid",
        },
        { status: 400 }
      );
    }

    if (bill.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "Bill is already paid",
        },
        { status: 400 }
      );
    }

    bill.paymentStatus = "PAID";
    bill.paymentMethod = paymentMethod;
    bill.status = "PAID";
    bill.paidAt = new Date();

    await bill.save();

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      bill,
    });
  } catch (error) {
    console.error("Payment update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to record payment",
      },
      { status: 500 }
    );
  }
}