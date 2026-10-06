import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User, { UserRole } from "@/models/User";

const allowedRoles: UserRole[] = [
  "MANAGER",
  "KITCHEN",
  "WAITER",
  "CASHIER",
];

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

    const staff = await User.find({
      restaurantId: session.user.restaurantId,
      role: {
        $in: allowedRoles,
      },
    })
      .select(
        "name email phone role isActive createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load staff",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
            "You do not have permission to create staff",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(
      body.name ?? ""
    ).trim();

    const email = String(
      body.email ?? ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password ?? ""
    );

    const phone = String(
      body.phone ?? ""
    ).trim();

    const role = body.role as UserRole;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email, password and role are required",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid staff role",
        },
        { status: 400 }
      );
    }

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

    await connectDB();

    const existingUser = await User.findOne({
      email,
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      restaurantId:
        session.user.restaurantId,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Staff member created successfully",
        staff: {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          isActive: staff.isActive,
          createdAt: staff.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create staff",
      },
      { status: 500 }
    );
  }
}