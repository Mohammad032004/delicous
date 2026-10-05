import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Table from "@/models/Table";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";

interface OrderRequestItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const qrToken = String(body.qrToken ?? "").trim();
    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerNotes = String(body.customerNotes ?? "").trim();

    const requestedItems = Array.isArray(body.items)
      ? (body.items as OrderRequestItem[])
      : [];

    if (!qrToken) {
      return NextResponse.json(
        {
          success: false,
          message: "QR token is required",
        },
        { status: 400 }
      );
    }

    if (requestedItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the table from the QR token.
    const table = await Table.findOne({
      qrToken,
      isActive: true,
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or inactive table QR code",
        },
        { status: 404 }
      );
    }

    // Validate item IDs.
    for (const item of requestedItems) {
      if (
        !mongoose.Types.ObjectId.isValid(
          item.menuItemId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid menu item",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid item quantity",
          },
          { status: 400 }
        );
      }
    }

    const menuItemIds = requestedItems.map(
      (item) => item.menuItemId
    );

    // Read actual menu items from the database.
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurantId: table.restaurantId,
      isAvailable: true,
    }).lean();

    if (menuItems.length !== requestedItems.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more menu items are unavailable",
        },
        { status: 400 }
      );
    }

    const orderItems = requestedItems.map((requestedItem) => {
      const menuItem = menuItems.find(
        (item) =>
          item._id.toString() === requestedItem.menuItemId
      );

      if (!menuItem) {
        throw new Error("Menu item not found");
      }

      const quantity = requestedItem.quantity;
      const subtotal = menuItem.price * quantity;

      return {
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
        subtotal,
        notes: String(requestedItem.notes ?? "").trim(),
      };
    });

    const subtotal = orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    // Generate the next order number for this restaurant.
    const lastOrder = await Order.findOne({
      restaurantId: table.restaurantId,
    })
      .sort({ orderNumber: -1 })
      .select("orderNumber")
      .lean();

    const orderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    const order = await Order.create({
      restaurantId: table.restaurantId,
      tableId: table._id,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      customerName,
      customerPhone,
      customerNotes,
      status: "PLACED",
      paymentStatus: "PENDING",
    });

    // Mark table as occupied.
    await Table.findByIdAndUpdate(table._id, {
      status: "OCCUPIED",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          tableName: table.name,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to place order",
      },
      { status: 500 }
    );
  }
}