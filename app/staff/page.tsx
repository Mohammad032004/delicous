"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  RefreshCw,
  Utensils,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Table {
  name: string;
  number: number;
  capacity: number;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  status: "READY" | "SERVED";
  createdAt: string;
  updatedAt: string;
  tableId: Table;
}

export default function StaffPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch("/api/staff/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load staff orders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  async function updateStatus(
    orderId: string,
    status: "SERVED" | "COMPLETED"
  ) {
    try {
      setUpdatingOrder(orderId);
      setError("");

      const response = await fetch(
        `/api/staff/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update order"
        );
      }

      if (status === "COMPLETED") {
        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) => order._id !== orderId
          )
        );
      } else {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: "SERVED",
                }
              : order
          )
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Utensils size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Staff Orders
              </h1>
              <p className="text-sm text-slate-500">
                Serve and complete restaurant orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2
                size={20}
                className="animate-spin"
              />
              Loading orders...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <Utensils
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-700">
                No orders to serve
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Ready orders will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const isReady = order.status === "READY";

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Order
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          #{order.orderNumber}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          isReady
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                      >
                        {isReady ? "READY" : "SERVED"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {order.tableId?.name ||
                            "Unknown Table"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {order.tableId?.capacity || 0} seats
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={14} />

                        {new Date(
                          order.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="flex items-start justify-between gap-3"
                        >
                          <div className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-700">
                              {item.quantity}
                            </span>

                            <div>
                              <p className="text-sm font-medium">
                                {item.name}
                              </p>

                              {item.notes && (
                                <p className="mt-1 text-xs text-amber-600">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="text-sm font-semibold">
                            ₹{item.subtotal}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.customerName && (
                      <div className="mt-5 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Customer
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {order.customerName}
                        </p>

                        {order.customerPhone && (
                          <p className="mt-1 text-xs text-slate-500">
                            {order.customerPhone}
                          </p>
                        )}
                      </div>
                    )}

                    {order.customerNotes && (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-semibold text-amber-800">
                          Customer Note
                        </p>

                        <p className="mt-1 text-sm text-amber-700">
                          {order.customerNotes}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">
                        Total
                      </span>

                      <span className="text-lg font-bold">
                        ₹{order.total}
                      </span>
                    </div>

                    {isReady ? (
                      <button
                        type="button"
                        disabled={
                          updatingOrder === order._id
                        }
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "SERVED"
                          )
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={17} />
                        )}

                        Mark as Served
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          updatingOrder === order._id
                        }
                        onClick={() =>
                          updateStatus(
                            order._id,
                            "COMPLETED"
                          )
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={17} />
                        )}

                        Complete Order
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}