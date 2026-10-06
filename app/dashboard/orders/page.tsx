"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Loader2,
  RefreshCw,
  ShoppingBag,
  X,
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
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

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
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-500">
                {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
              </p>
            </div>

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
                      onClick={() =>
                        setSelectedOrder(order)
                      }
                      className="cursor-pointer transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          #{order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Click for details
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Order Details
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  #{selectedOrder.orderNumber}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {new Date(
                    selectedOrder.createdAt
                  ).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Order Status
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* Table */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Table
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedOrder.tableId?.name ||
                    "Unknown Table"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Table #
                  {selectedOrder.tableId?.number} •{" "}
                  {selectedOrder.tableId?.capacity} seats
                </p>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Customer
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <p className="font-medium">
                    {selectedOrder.customerName ||
                      "Guest"}
                  </p>

                  {selectedOrder.customerPhone && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Items
                </h3>

                <div className="mt-3 space-y-3">
                  {selectedOrder.items.map(
                    (item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            ₹{item.price} ×{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ₹{item.subtotal}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                    Customer Notes
                  </p>

                  <p className="mt-2 text-sm text-amber-700">
                    {selectedOrder.customerNotes}
                  </p>
                </div>
              )}

              {/* Bill Summary */}
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ₹{selectedOrder.subtotal}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <span className="font-medium">
                    ₹{selectedOrder.tax}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <span className="font-medium">
                    -₹{selectedOrder.discount}
                  </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    ₹{selectedOrder.total}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-5">
                <span className="text-sm text-slate-500">
                  Payment Status
                </span>

                <span
                  className={`font-semibold ${getPaymentClass(
                    selectedOrder.paymentStatus
                  )}`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}