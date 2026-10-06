"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Utensils,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "READY" | "SERVED";
  paymentStatus: string;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  createdAt: string;
  tableId?: {
    _id: string;
    name: string;
    number: number;
    capacity: number;
  };
}

export default function StaffPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  async function fetchOrders(
    showLoader = false
  ) {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(
        "/api/staff/orders",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Staff orders error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function updateOrder(
    orderId: string,
    status: "SERVED" | "COMPLETED"
  ) {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `/api/staff/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to update order"
        );
      }

      await fetchOrders();
    } catch (error) {
      console.error(
        "Order update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  const servedOrders = orders.filter(
    (order) => order.status === "SERVED"
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading waiter panel...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Utensils size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Waiter Panel
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage ready and served orders
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Ready to Serve
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {readyOrders.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ShoppingBag size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Served
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {servedOrders.length}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Ready Orders */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Ready Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Orders waiting to be delivered to the
                table
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {readyOrders.length} Ready
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <CheckCircle2
                size={35}
                className="mx-auto text-emerald-500"
              />

              <h3 className="mt-3 font-semibold">
                No orders ready
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New ready orders will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  updating={
                    updatingId === order._id
                  }
                  onUpdate={() =>
                    updateOrder(
                      order._id,
                      "SERVED"
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Served Orders */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Served Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Orders already delivered to customers
            </p>
          </div>

          {servedOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              No served orders yet.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {servedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  updating={
                    updatingId === order._id
                  }
                  served
                  onUpdate={() =>
                    updateOrder(
                      order._id,
                      "COMPLETED"
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function OrderCard({
  order,
  updating,
  served = false,
  onUpdate,
}: {
  order: Order;
  updating: boolean;
  served?: boolean;
  onUpdate: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="font-bold">
            Order #{order.orderNumber}
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={13} />
            {formatOrderTime(order.createdAt)}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            served
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {served ? "SERVED" : "READY"}
        </span>
      </div>

      {/* Table */}
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">
              Table
            </p>

            <p className="mt-1 text-lg font-bold">
              {order.tableId?.name ||
                `Table ${order.tableId?.number || "-"}`}
            </p>
          </div>

          {order.tableId?.capacity && (
            <p className="text-xs text-slate-500">
              {order.tableId.capacity} seats
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 p-5">
        {order.items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold">
                {item.quantity} × {item.name}
              </p>

              {item.notes && (
                <p className="mt-1 text-xs text-slate-500">
                  Note: {item.notes}
                </p>
              )}
            </div>

            <p className="text-sm font-semibold">
              ₹{item.subtotal}
            </p>
          </div>
        ))}
      </div>

      {/* Customer */}
      {(order.customerName ||
        order.customerNotes) && (
        <div className="border-t border-slate-100 px-5 py-4">
          {order.customerName && (
            <p className="text-sm">
              <span className="text-slate-500">
                Customer:
              </span>{" "}
              <span className="font-medium">
                {order.customerName}
              </span>
            </p>
          )}

          {order.customerNotes && (
            <p className="mt-1 text-sm">
              <span className="text-slate-500">
                Note:
              </span>{" "}
              <span className="font-medium">
                {order.customerNotes}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Total + Action */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs text-slate-500">
            Total
          </p>

          <p className="text-xl font-bold">
            ₹{order.total}
          </p>
        </div>

        <button
          type="button"
          onClick={onUpdate}
          disabled={updating}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            served
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {updating ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              Updating...
            </>
          ) : served ? (
            <>
              <CheckCircle2 size={17} />
              Complete Order
            </>
          ) : (
            <>
              <Utensils size={17} />
              Mark Served
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function formatOrderTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}