import { notFound } from "next/navigation";

import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";

import CustomerMenu from "@/components/menu/CustomerMenu";

interface MenuPageProps {
  params: Promise<{
    qrToken: string;
  }>;
}

export default async function CustomerMenuPage({
  params,
}: MenuPageProps) {
  const { qrToken } = await params;

  await connectDB();

  const table = await Table.findOne({
    qrToken,
    isActive: true,
  }).lean();

  if (!table) {
    notFound();
  }

  const restaurant = await Restaurant.findById(
    table.restaurantId
  ).lean();

  if (!restaurant || !restaurant.isActive) {
    notFound();
  }

  const categories = await Category.find({
    restaurantId: restaurant._id,
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
    isAvailable: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const categoryData = categories.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
    description: category.description || "",
    items: menuItems
      .filter(
        (item) =>
          item.categoryId.toString() ===
          category._id.toString()
      )
      .map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        description: item.description || "",
        price: item.price,
        isVeg: item.isVeg,
        isFeatured: item.isFeatured,
        preparationTime: item.preparationTime,
      })),
  }));

  return (
    <CustomerMenu
      restaurantName={restaurant.name}
      restaurantDescription={restaurant.description || ""}
      tableName={table.name}
      qrToken={qrToken}
      categories={categoryData}
    />
  );
}