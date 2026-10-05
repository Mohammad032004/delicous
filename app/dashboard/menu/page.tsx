"use client";

import { useEffect, useState } from "react";
import { Plus, Utensils, Loader2 } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);

      const response = await fetch("/api/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.categories);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreateCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create category");
      }

      setCategories((current) => [...current, data.category]);
      setName("");
      setDescription("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create category"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Menu</h1>

        <p className="mt-2 text-slate-400">
          Manage your restaurant categories and menu items.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add Category */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Plus size={20} />
            </div>

            <div>
              <h2 className="font-semibold">Add Category</h2>
              <p className="text-xs text-slate-400">
                Create a menu category
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Starters"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional description"
                rows={4}
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
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
        </div>

        {/* Categories */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Categories</h2>

              <p className="text-xs text-slate-400">
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"}
              </p>
            </div>

            <Utensils size={20} className="text-slate-500" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 py-16 text-center">
              <Utensils
                size={32}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="text-sm text-slate-400">
                No categories yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Create your first menu category.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/60 px-4 py-4"
                >
                  <div>
                    <h3 className="font-medium">{category.name}</h3>

                    {category.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}