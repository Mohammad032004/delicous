"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isFeatured: boolean;
  preparationTime: number;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface CustomerMenuProps {
  restaurantName: string;
  restaurantDescription?: string;
  tableName: string;
  qrToken: string;
  categories: Category[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface PlacedOrder {
  orderNumber: number;
  tableName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  total: number;
  status: string;
}

export default function CustomerMenu({
  restaurantName,
  restaurantDescription,
  tableName,
  qrToken,
  categories,
}: CustomerMenuProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] =
    useState<PlacedOrder | null>(null);

  function addToCart(item: MenuItem) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(itemId: string) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(itemId: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === itemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(itemId: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== itemId)
    );
  }

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cart]);

  async function handlePlaceOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setOrderError("");

    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (!customerName.trim()) {
      setOrderError("Please enter your name.");
      return;
    }

    if (!customerPhone.trim()) {
      setOrderError("Please enter your phone number.");
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrToken,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerNotes: customerNotes.trim(),
          items: cart.map((item) => ({
            menuItemId: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to place order"
        );
      }

      setPlacedOrder(data.order);
      setCart([]);
      setCartOpen(false);
      setCheckoutOpen(false);
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  /*
   * ORDER CONFIRMATION
   */
  if (placedOrder) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2
                size={36}
                className="text-emerald-600"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Order Placed!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Your order has been sent to the kitchen.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Order Number
              </p>

              <p className="mt-1 text-3xl font-bold text-indigo-600">
                #{placedOrder.orderNumber}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {placedOrder.tableName}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-left">
              {placedOrder.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-slate-600">
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between border-t border-slate-200 pt-4">
              <span className="font-medium text-slate-600">
                Total
              </span>

              <span className="text-lg font-bold text-slate-900">
                ₹{placedOrder.total}
              </span>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Please wait while the restaurant prepares your
              order.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {restaurantName}
              </h1>

              {restaurantDescription && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  {restaurantDescription}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ordering from {tableName}
              </div>
            </div>

            {/* CART BUTTON */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MENU */}
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
              if (category.items.length === 0) {
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
                    {category.items.map((item) => {
                      const cartItem = cart.find(
                        (cartItem) =>
                          cartItem._id === item._id
                      );

                      return (
                        <div
                          key={item._id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
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

                            {/* ADD / QUANTITY */}
                            {!cartItem ? (
                              <button
                                type="button"
                                onClick={() =>
                                  addToCart(item)
                                }
                                className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
                              >
                                <Plus size={16} />
                                Add
                              </button>
                            ) : (
                              <div className="flex h-10 shrink-0 items-center overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      item._id
                                    )
                                  }
                                  className="flex h-full w-9 items-center justify-center text-indigo-600 transition hover:bg-indigo-100"
                                >
                                  <Minus size={15} />
                                </button>

                                <span className="flex w-8 items-center justify-center text-sm font-bold text-indigo-700">
                                  {cartItem.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      item._id
                                    )
                                  }
                                  className="flex h-full w-9 items-center justify-center text-indigo-600 transition hover:bg-indigo-100"
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 border-t border-slate-100 pt-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-400">
                                Preparation time:{" "}
                                {item.preparationTime} min
                              </p>

                              {item.isFeatured && (
                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setCartOpen(false)}
          />

          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  Your Cart
                </h2>

                <p className="text-xs text-slate-500">
                  {cartCount}{" "}
                  {cartCount === 1 ? "item" : "items"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <ShoppingCart
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      Your cart is empty
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Add something delicious!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-medium">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            ₹{item.price} each
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item._id)
                          }
                          className="text-slate-400 transition hover:text-red-500"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item._id)
                            }
                            className="p-2 text-slate-500 hover:bg-slate-50"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-5 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item._id)
                            }
                            className="p-2 text-slate-500 hover:bg-slate-50"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <p className="font-semibold">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-5">
                <div className="mb-4 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Subtotal
                  </span>

                  <span className="text-xl font-bold">
                    ₹{subtotal}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                    setOrderError("");
                  }}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Continue to Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50">
          <div className="mx-auto min-h-screen max-w-md bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setCartOpen(true);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h2 className="font-bold">
                  Complete Your Order
                </h2>

                <p className="text-xs text-slate-500">
                  {tableName}
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePlaceOrder}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Your Name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Special Instructions
                </label>

                <textarea
                  value={customerNotes}
                  onChange={(event) =>
                    setCustomerNotes(event.target.value)
                  }
                  placeholder="Less spicy, no onions, etc."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-3 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Items
                  </span>

                  <span className="text-sm font-medium">
                    {cartCount}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-lg font-bold">
                    ₹{subtotal}
                  </span>
                </div>
              </div>

              {orderError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={placingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Placing Order...
                  </>
                ) : (
                  `Place Order • ₹${subtotal}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}