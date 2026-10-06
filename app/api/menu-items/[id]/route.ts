import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import Category from "@/models/Category";

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
            "You do not have permission to access menu items",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid menu item ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    })
      .populate("categoryId", "name")
      .lean();

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Menu item GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load menu item",
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
            "You do not have permission to update menu items",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid menu item ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      body.name !== undefined
        ? String(body.name).trim()
        : undefined;

    const description =
      body.description !== undefined
        ? String(body.description).trim()
        : undefined;

    const categoryId =
      body.categoryId !== undefined
        ? String(body.categoryId).trim()
        : undefined;

    const price =
      body.price !== undefined
        ? Number(body.price)
        : undefined;

    const preparationTime =
      body.preparationTime !== undefined
        ? Number(body.preparationTime)
        : undefined;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Menu item name cannot be empty",
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
            message: "Invalid menu item name",
          },
          { status: 400 }
        );
      }

      const existingItem = await MenuItem.findOne({
        restaurantId: session.user.restaurantId,
        slug,
        _id: { $ne: id },
      });

      if (existingItem) {
        return NextResponse.json(
          {
            success: false,
            message: "Another menu item with this name already exists",
          },
          { status: 409 }
        );
      }

      updateData.name = name;
      updateData.slug = slug;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (categoryId !== undefined) {
      if (
        !categoryId ||
        !mongoose.Types.ObjectId.isValid(categoryId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid category is required",
          },
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
          {
            success: false,
            message: "Category not found",
          },
          { status: 404 }
        );
      }

      updateData.categoryId = categoryId;
    }

    if (price !== undefined) {
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid price is required",
          },
          { status: 400 }
        );
      }

      updateData.price = price;
    }

    if (preparationTime !== undefined) {
      if (
        !Number.isFinite(preparationTime) ||
        preparationTime < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid preparation time",
          },
          { status: 400 }
        );
      }

      updateData.preparationTime = preparationTime;
    }

    if (body.isVeg !== undefined) {
      updateData.isVeg = body.isVeg === true;
    }

    if (body.isAvailable !== undefined) {
      updateData.isAvailable = body.isAvailable === true;
    }

    if (body.isFeatured !== undefined) {
      updateData.isFeatured = body.isFeatured === true;
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

    const menuItem = await MenuItem.findOneAndUpdate(
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
    )
      .populate("categoryId", "name")
      .lean();

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Menu item PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update menu item",
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
            "You do not have permission to delete menu items",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid menu item ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
    });

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu item not found",
        },
        { status: 404 }
      );
    }

    menuItem.isAvailable = false;

    await menuItem.save();

    return NextResponse.json({
      success: true,
      message: "Menu item disabled successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Menu item DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete menu item",
      },
      { status: 500 }
    );
  }
}