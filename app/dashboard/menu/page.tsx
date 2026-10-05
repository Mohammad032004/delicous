"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Utensils,
  Loader2,
  Leaf,
  Star,
  FolderPlus,
  Trash2,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  categoryId:
    | string
    | {
        _id: string;
        name: string;
      };
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] =
    useState("");
  const [creatingCategory, setCreatingCategory] =
    useState(false);

  // Menu item form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [preparationTime, setPreparationTime] =
    useState("15");
  const [isVeg, setIsVeg] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // State
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoriesResponse, menuResponse] =
        await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu-items"),
        ]);

      const categoriesData =
        await categoriesResponse.json();

      const menuData = await menuResponse.json();

      if (!categoriesResponse.ok) {
        throw new Error(
          categoriesData.message ||
            "Failed to load categories"
        );
      }

      if (!menuResponse.ok) {
        throw new Error(
          menuData.message ||
            "Failed to load menu items"
        );
      }

      setCategories(categoriesData.categories || []);
      setMenuItems(menuData.menuItems || []);

      if (
        !categoryId &&
        categoriesData.categories?.length > 0
      ) {
        setCategoryId(
          categoriesData.categories[0]._id
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load menu"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!categoryName.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    try {
      setCreatingCategory(true);
      setCategoryError("");
      setError("");

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create category"
        );
      }

      const newCategory = data.category;

      setCategories((current) => [
        ...current,
        newCategory,
      ]);

      setCategoryId(newCategory._id);

      setCategoryName("");
      setCategoryDescription("");
    } catch (error) {
      setCategoryError(
        error instanceof Error
          ? error.message
          : "Failed to create category"
      );
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleCreateItem(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Menu item name is required.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          categoryId,
          price: Number(price),
          preparationTime: Number(preparationTime),
          isVeg,
          isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create menu item"
        );
      }

      setMenuItems((current) => [
        ...current,
        data.menuItem,
      ]);

      setName("");
      setDescription("");
      setPrice("");
      setPreparationTime("15");
      setIsVeg(true);
      setIsFeatured(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create menu item"
      );
    } finally {
      setCreating(false);
    }
  }

  function getCategoryName(item: MenuItem) {
    if (typeof item.categoryId === "object") {
      return item.categoryId.name;
    }

    const category = categories.find(
      (category) => category._id === item.categoryId
    );

    return category?.name || "Unknown";
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Menu
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your restaurant categories and food
              items.
            </p>
          </div>

          <div className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm sm:block">
            {menuItems.length}{" "}
            {menuItems.length === 1
              ? "item"
              : "items"}
          </div>
        </div>
      </div>

      {/* GLOBAL ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* CATEGORY SECTION */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <FolderPlus size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Menu Categories
            </h2>

            <p className="text-xs text-slate-500">
              Create categories for your food items
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateCategory}
          className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto]"
        >
          <input
            type="text"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
            placeholder="Category name e.g. Biryani"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          />

          <input
            type="text"
            value={categoryDescription}
            onChange={(event) =>
              setCategoryDescription(
                event.target.value
              )
            }
            placeholder="Description e.g. Rice & biryani dishes"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          />

          <button
            type="submit"
            disabled={creatingCategory}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingCategory ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Creating...
              </>
            ) : (
              <>
                <Plus size={17} />
                Add Category
              </>
            )}
          </button>
        </form>

        {categoryError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {categoryError}
          </div>
        )}

        {/* CATEGORY LIST */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500" />

                <span className="text-sm font-medium text-slate-700">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* ADD MENU ITEM */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Plus size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Add Menu Item
              </h2>

              <p className="text-xs text-slate-500">
                Add a food or beverage
              </p>
            </div>
          </div>

          {categories.length === 0 && !loading && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Create at least one category before adding
              menu items.
            </div>
          )}

          <form
            onSubmit={handleCreateItem}
            className="space-y-5"
          >
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Item Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Chicken Biryani"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                disabled={categories.length === 0}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400"
              >
                {categories.length === 0 ? (
                  <option value="">
                    No categories available
                  </option>
                ) : (
                  categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* PRICE + PREP TIME */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="220"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prep. Time
                </label>

                <input
                  type="number"
                  min="0"
                  value={preparationTime}
                  onChange={(event) =>
                    setPreparationTime(
                      event.target.value
                    )
                  }
                  placeholder="15"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="A delicious traditional biryani..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* VEGETARIAN */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <Leaf
                    size={17}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Vegetarian
                  </p>

                  <p className="text-xs text-slate-500">
                    Mark this item as vegetarian
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isVeg}
                onChange={(event) =>
                  setIsVeg(event.target.checked)
                }
                className="h-4 w-4 accent-indigo-600"
              />
            </label>

            {/* FEATURED */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2">
                  <Star
                    size={17}
                    className="text-amber-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Featured Item
                  </p>

                  <p className="text-xs text-slate-500">
                    Highlight this item
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(event) =>
                  setIsFeatured(
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-indigo-600"
              />
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                creating ||
                categories.length === 0
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Add Menu Item
                </>
              )}
            </button>
          </form>
        </div>

        {/* MENU ITEMS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Menu Items
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {menuItems.length}{" "}
                {menuItems.length === 1
                  ? "item"
                  : "items"}{" "}
                in your menu
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Utensils size={19} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <Utensils
                size={32}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm font-medium text-slate-600">
                No menu items yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add your first food item using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-sm border-2 ${
                          item.isVeg
                            ? "border-emerald-500"
                            : "border-red-500"
                        }`}
                      />

                      <h3 className="font-medium text-slate-900">
                        {item.name}
                      </h3>

                      {item.isFeatured && (
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {getCategoryName(item)} •{" "}
                      {item.preparationTime} min
                    </p>

                    {item.description && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900">
                      ₹{item.price}
                    </p>

                    <span className="text-xs font-medium text-emerald-600">
                      Available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}