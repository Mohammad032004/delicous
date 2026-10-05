import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Table from "@/models/Table";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";

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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Restaurant Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {restaurant.name}
              </h1>

              {restaurant.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {restaurant.description}
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600">
              {table.name}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Ordering from {table.name}
          </div>
        </div>
      </header>

      {/* Menu */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-medium text-slate-700">
              Menu is currently unavailable
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Please ask a staff member for assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => {
              const items = menuItems.filter(
                (item) =>
                  item.categoryId.toString() ===
                  category._id.toString()
              );

              if (items.length === 0) {
                return null;
              }

              return (
                <section key={category._id}>
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      {category.name}
                    </h2>

                    {category.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-3 w-3 shrink-0 rounded-sm border-2 ${
                                  item.isVeg
                                    ? "border-emerald-500"
                                    : "border-red-500"
                                }`}
                              />

                              <h3 className="font-semibold text-slate-900">
                                {item.name}
                              </h3>
                            </div>

                            {item.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {item.description}
                              </p>
                            )}

                            <p className="mt-3 text-lg font-bold text-slate-900">
                              ₹{item.price}
                            </p>
                          </div>

                          {item.isFeatured && (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-xs text-slate-400">
                            Preparation time:{" "}
                            {item.preparationTime} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center">
        <p className="text-xs text-slate-400">
          Powered by Restova
        </p>
      </footer>
    </main>
  );
}