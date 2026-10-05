import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
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

    const categories = await Category.find({
      restaurantId: session.user.restaurantId,
      isActive: true,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories GET error:", error);

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

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingCategory = await Category.findOne({
      restaurantId: session.user.restaurantId,
      slug,
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      restaurantId: session.user.restaurantId,
      name,
      slug,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST error:", error);

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