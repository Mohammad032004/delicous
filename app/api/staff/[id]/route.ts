import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "RESTAURANT_OWNER" &&
      session.user.role !== "MANAGER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to manage staff",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    await connectDB();

    const staff = await User.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
      role: {
        $in: [
          "MANAGER",
          "KITCHEN",
          "WAITER",
          "CASHIER",
        ],
      },
    });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff member not found",
        },
        { status: 404 }
      );
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Name cannot be empty",
          },
          { status: 400 }
        );
      }

      staff.name = name;
    }

    if (body.phone !== undefined) {
      staff.phone = String(body.phone).trim();
    }

    if (body.role !== undefined) {
      const allowedRoles = [
        "MANAGER",
        "KITCHEN",
        "WAITER",
        "CASHIER",
      ];

      if (!allowedRoles.includes(body.role)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid staff role",
          },
          { status: 400 }
        );
      }

      staff.role = body.role;
    }

    if (body.isActive !== undefined) {
      staff.isActive = Boolean(body.isActive);
    }

    if (body.password !== undefined) {
      const password = String(body.password);

      if (password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be at least 8 characters",
          },
          { status: 400 }
        );
      }

      staff.password = await bcrypt.hash(
        password,
        12
      );
    }

    await staff.save();

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        isActive: staff.isActive,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    console.error("Update staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update staff",
      },
      { status: 500 }
    );
  }
}