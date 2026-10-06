import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const allowedRoles = [
  "RESTAURANT_OWNER",
  "MANAGER",
];

export async function GET(
  request: Request,
  context: RouteContext
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

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to access categories",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    }).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Category GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load category",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
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

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to update categories",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name cannot be empty",
          },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid category name",
          },
          { status: 400 }
        );
      }

      await connectDB();

      const existingCategory = await Category.findOne({
        restaurantId: session.user.restaurantId,
        slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another category with this name already exists",
          },
          { status: 409 }
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (body.description !== undefined) {
      updateData.description = String(
        body.description
      ).trim();
    }

    if (body.image !== undefined) {
      updateData.image = String(body.image).trim();
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid sort order",
          },
          { status: 400 }
        );
      }

      updateData.sortOrder = sortOrder;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive === true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findOneAndUpdate(
      {
        _id: id,
        restaurantId: session.user.restaurantId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Category PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
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

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to delete categories",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    const menuItemCount = await MenuItem.countDocuments({
      categoryId: category._id,
      restaurantId: session.user.restaurantId,
    });

    if (menuItemCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete category while menu items are assigned to it",
        },
        { status: 409 }
      );
    }

    category.isActive = false;

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category disabled successfully",
      category,
    });
  } catch (error) {
    console.error("Category DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete category",
      },
      { status: 500 }
    );
  }
}