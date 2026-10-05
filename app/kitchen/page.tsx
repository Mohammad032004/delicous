"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChefHat,
  Clock,
  Loader2,
  RefreshCw,
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
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  tableId: Table;
}

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  PLACED: {
    label: "New Order",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  READY: {
    label: "Ready",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch("/api/kitchen/orders", {
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
          : "Failed to load kitchen orders"
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

  async function updateStatus(orderId: string, status: string) {
    try {
      setUpdatingOrder(orderId);
      setError("");

      const response = await fetch(
        `/api/kitchen/orders/${orderId}`,
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

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order.status,
              }
            : order
        )
      );
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

  function getNextAction(status: string) {
    switch (status) {
      case "PLACED":
        return {
          label: "Accept Order",
          nextStatus: "ACCEPTED",
        };

      case "ACCEPTED":
        return {
          label: "Start Preparing",
          nextStatus: "PREPARING",
        };

      case "PREPARING":
        return {
          label: "Mark Ready",
          nextStatus: "READY",
        };

      case "READY":
        return null;

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <ChefHat size={21} />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Kitchen Display
                </h1>
                <p className="text-sm text-slate-500">
                  Manage incoming restaurant orders
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
              Loading kitchen orders...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <ChefHat
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-700">
                No active orders
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                New customer orders will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const config =
                statusConfig[order.status] ||
                statusConfig.PLACED;

              const nextAction = getNextAction(order.status);

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

                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                          #{order.orderNumber}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
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
                              <p className="text-sm font-medium text-slate-800">
                                {item.name}
                              </p>

                              {item.notes && (
                                <p className="mt-1 text-xs text-amber-600">
                                  Note: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-slate-700">
                            ₹{item.subtotal}
                          </p>
                        </div>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-semibold text-amber-800">
                          Customer Note
                        </p>

                        <p className="mt-1 text-sm text-amber-700">
                          {order.customerNotes}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">
                        Total
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        ₹{order.total}
                      </span>
                    </div>

                    {nextAction && (
                      <button
                        type="button"
                        disabled={updatingOrder === order._id}
                        onClick={() =>
                          updateStatus(
                            order._id,
                            nextAction.nextStatus
                          )
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check size={17} />
                            {nextAction.label}
                          </>
                        )}
                      </button>
                    )}

                    {order.status === "READY" && (
                      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        <Check size={17} />
                        Order Ready
                      </div>
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