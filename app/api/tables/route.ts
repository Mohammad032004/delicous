import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Table from "@/models/Table";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.restaurantId) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 }
      );
    }

    await connectDB();

    const tables = await Table.find({
      restaurantId: session.user.restaurantId,
    })
      .sort({ number: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      tables,
    });
  } catch (error) {
    console.error("Tables GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.restaurantId) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const number = Number(body.number);
    const capacity = Number(body.capacity ?? 4);

    if (!Number.isInteger(number) || number < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Table number must be a positive integer",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Capacity must be a positive integer",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingTable = await Table.findOne({
      restaurantId: session.user.restaurantId,
      number,
    });

    if (existingTable) {
      return NextResponse.json(
        {
          success: false,
          message: "Table number already exists",
        },
        { status: 409 }
      );
    }

    const table = await Table.create({
      restaurantId: session.user.restaurantId,
      name: `Table ${number}`,
      number,
      capacity,
      qrToken: crypto.randomBytes(24).toString("hex"),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Table created successfully",
        table,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Tables POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      { status: 500 }
    );
  }
}