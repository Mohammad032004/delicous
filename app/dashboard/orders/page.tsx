"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function getStatusClass(status: string) {
    switch (status) {
      case "PLACED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "ACCEPTED":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";

      case "PREPARING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "READY":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "SERVED":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "COMPLETED":
        return "border-slate-200 bg-slate-100 text-slate-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  }

  function getPaymentClass(status: string) {
    switch (status) {
      case "PAID":
        return "text-emerald-600";

      case "FAILED":
        return "text-red-600";

      case "REFUNDED":
        return "text-orange-600";

      default:
        return "text-amber-600";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage restaurant orders
            </p>
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
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
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
              <ShoppingBag
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-700">
                No orders yet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Customer orders will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Table
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Items
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          #{order.orderNumber}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {order.tableId?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {order.tableId?.capacity || 0} seats
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {order.customerName ||
                            "Guest"}
                        </p>

                        {order.customerPhone && (
                          <p className="text-xs text-slate-400">
                            {order.customerPhone}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-xs space-y-1">
                          {order.items.map(
                            (item, index) => (
                              <p
                                key={`${item.name}-${index}`}
                                className="text-sm text-slate-600"
                              >
                                {item.name} ×{" "}
                                {item.quantity}
                              </p>
                            )
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-bold">
                          ₹{order.total}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-semibold ${getPaymentClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock size={14} />

                          {new Date(
                            order.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}