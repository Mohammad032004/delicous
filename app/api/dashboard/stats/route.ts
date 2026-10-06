import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";

import Order from "@/models/Order";
import Table from "@/models/Table";

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

    const restaurantId = session.user.restaurantId;

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await Order.find({
      restaurantId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    // Today's sales
    const todaySales = todayOrders
      .filter(
        (order) =>
          order.status !== "CANCELLED" &&
          order.paymentStatus === "PAID"
      )
      .reduce(
        (total, order) => total + order.total,
        0
      );

    // Order statistics
    const totalOrders = todayOrders.length;

    const pendingOrders = todayOrders.filter(
      (order) =>
        order.status === "PLACED" ||
        order.status === "ACCEPTED" ||
        order.status === "PREPARING"
    ).length;

    const completedOrders = todayOrders.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    const cancelledOrders = todayOrders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    // Tables
    const tables = await Table.find({
      restaurantId,
      isActive: true,
    })
      .select("name number capacity status")
      .sort({ number: 1 })
      .lean();

    const totalTables = tables.length;

    const occupiedTables = tables.filter(
      (table) => table.status === "OCCUPIED"
    ).length;

    const availableTables = tables.filter(
      (table) => table.status === "AVAILABLE"
    ).length;

    const billRequestedTables = tables.filter(
      (table) => table.status === "BILL_REQUESTED"
    ).length;

    const cleaningTables = tables.filter(
      (table) => table.status === "CLEANING"
    ).length;

    // Recent orders
    const recentOrders = await Order.find({
      restaurantId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate(
        "tableId",
        "name number capacity"
      )
      .lean();

    return NextResponse.json({
      success: true,

      stats: {
        todaySales,
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,

        totalTables,
        occupiedTables,
        availableTables,
        billRequestedTables,
        cleaningTables,
      },

      tables,

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard statistics",
      },
      { status: 500 }
    );
  }
}