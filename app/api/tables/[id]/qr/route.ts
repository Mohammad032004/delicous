import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Table from "@/models/Table";

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
            "You do not have permission to access table QR codes",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    await connectDB();

    const table = await Table.findOne({
      _id: id,
      restaurantId: session.user.restaurantId,
      isActive: true,
    }).lean();

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          message: "Table not found",
        },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const menuUrl = `${baseUrl}/menu/${table.qrToken}`;

    const qrCode = await QRCode.toDataURL(menuUrl, {
      width: 800,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({
      success: true,
      table: {
        id: table._id,
        name: table.name,
        number: table.number,
      },
      menuUrl,
      qrCode,
    });
  } catch (error) {
    console.error("QR generation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate QR code",
      },
      { status: 500 }
    );
  }
}