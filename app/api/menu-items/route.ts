import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";

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

    const menuItems = await MenuItem.find({
      restaurantId: session.user.restaurantId,
    })
      .populate("categoryId", "name")
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      menuItems,
    });
  } catch (error) {
    console.error("Menu items GET error:", error);

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

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const categoryId = String(body.categoryId ?? "").trim();

    const price = Number(body.price);
    const preparationTime = Number(body.preparationTime ?? 15);

    const isVeg = body.isVeg !== false;
    const isFeatured = body.isFeatured === true;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Menu item name is required" },
        { status: 400 }
      );
    }

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, message: "Valid category is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(preparationTime) || preparationTime < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid preparation time" },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findOne({
      _id: categoryId,
      restaurantId: session.user.restaurantId,
      isActive: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingItem = await MenuItem.findOne({
      restaurantId: session.user.restaurantId,
      slug,
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: "Menu item already exists" },
        { status: 409 }
      );
    }

    const menuItem = await MenuItem.create({
      restaurantId: session.user.restaurantId,
      categoryId,
      name,
      slug,
      description,
      price,
      isVeg,
      isFeatured,
      preparationTime,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Menu item created successfully",
        menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Menu items POST error:", error);

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