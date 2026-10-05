import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      restaurantName,
      ownerName,
      email,
      password,
      phone,
    } = body;

    if (
      !restaurantName ||
      !ownerName ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    const baseSlug = restaurantName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await Restaurant.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const restaurant = await Restaurant.create({
      name: restaurantName.trim(),
      slug,
      phone: phone?.trim() || "",
      country: "India",
      currency: "INR",
      timezone: "Asia/Kolkata",
      isActive: true,
    });

    try {
      await User.create({
        name: ownerName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "RESTAURANT_OWNER",
        restaurantId: restaurant._id,
        phone: phone?.trim() || "",
        isActive: true,
      });
    } catch (userError) {
      await Restaurant.findByIdAndDelete(restaurant._id);
      throw userError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant registered successfully",
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the account",
      },
      { status: 500 }
    );
  }
}