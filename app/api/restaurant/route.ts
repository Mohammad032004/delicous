import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";

const allowedRoles = [
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
            "You do not have permission to access restaurant settings",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const restaurant = await Restaurant.findById(
      session.user.restaurantId
    ).lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load restaurant",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
            "You do not have permission to update restaurant settings",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "name",
      "description",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "country",
      "currency",
      "timezone",
    ] as const;

    const updateData: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = String(body[field]).trim();
      }
    }

    if (!updateData.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const restaurant =
      await Restaurant.findByIdAndUpdate(
        session.user.restaurantId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Restaurant settings updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update restaurant",
      },
      { status: 500 }
    );
  }
}