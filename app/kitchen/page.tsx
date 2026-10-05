"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChefHat,
  Clock3,
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

interface Order {
  _id: string;
  orderNumber: number;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerNotes?: string;
  status:
    | "PLACED"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: string;
  createdAt: string;
}

const statusConfig = {
  PLACED: {
    label: "New",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  READY: {
    label: "Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const nextStatus: Record<
  Order["status"],
  Order["status"] | null
> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: null,
  SERVED: null,
  COMPLETED: null,
  CANCELLED: null,
};

const actionLabels: Record<
  Order["status"],
  string
> = {
  PLACED: "Accept Order",
  ACCEPTED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Ready",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          "/api/kitchen/orders",
          {
            cache: "no-store",
          }
        );

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
            : "Failed to load kitchen orders"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateOrderStatus(
    orderId: string,
    status: Order["status"]
  ) {
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
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
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

  function getOrderAge(createdAt: string) {
    const created = new Date(createdAt).getTime();
    const now = Date.now();

    const minutes = Math.max(
      0,
      Math.floor((now - created) / 60000)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes === 1) {
      return "1 min ago";
    }

    return `${minutes} min ago`;
  }

  const newOrders = orders.filter(
    (order) => order.status === "PLACED"
  );

  const preparingOrders = orders.filter(
    (order) =>
      order.status === "ACCEPTED" ||
      order.status === "PREPARING"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <ChefHat size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Kitchen Dashboard
                </h1>

                <p className="text-xs text-slate-500">
                  Manage incoming restaurant orders
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadOrders(false)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              New Orders
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-600">
              {newOrders.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Preparing
            </p>

            <p className="mt-1 text-3xl font-bold text-amber-600">
              {preparingOrders.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Ready
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-600">
              {readyOrders.length}
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading kitchen orders...
              </p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <ChefHat
              size={45}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-slate-700">
              No active orders
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          /* ORDERS */
          <div className="grid gap-6 lg:grid-cols-3">
            {/* NEW */}
            <OrderColumn
              title="New Orders"
              count={newOrders.length}
              color="blue"
              orders={newOrders}
              updatingOrder={updatingOrder}
              getOrderAge={getOrderAge}
              onUpdateStatus={updateOrderStatus}
            />

            {/* PREPARING */}
            <OrderColumn
              title="Preparing"
              count={preparingOrders.length}
              color="amber"
              orders={preparingOrders}
              updatingOrder={updatingOrder}
              getOrderAge={getOrderAge}
              onUpdateStatus={updateOrderStatus}
            />

            {/* READY */}
            <OrderColumn
              title="Ready"
              count={readyOrders.length}
              color="emerald"
              orders={readyOrders}
              updatingOrder={updatingOrder}
              getOrderAge={getOrderAge}
              onUpdateStatus={updateOrderStatus}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function OrderColumn({
  title,
  count,
  color,
  orders,
  updatingOrder,
  getOrderAge,
  onUpdateStatus,
}: {
  title: string;
  count: number;
  color: "blue" | "amber" | "emerald";
  orders: Order[];
  updatingOrder: string | null;
  getOrderAge: (createdAt: string) => string;
  onUpdateStatus: (
    orderId: string,
    status: Order["status"]
  ) => void;
}) {
  const columnColors = {
    blue: "border-blue-200 bg-blue-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
  };

  return (
    <section
      className={`rounded-2xl border p-4 ${columnColors[color]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">
          {title}
        </h2>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
          {count}
        </span>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 py-10 text-center">
            <p className="text-sm text-slate-400">
              No orders
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              updatingOrder={updatingOrder}
              getOrderAge={getOrderAge}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </section>
  );
}

function OrderCard({
  order,
  updatingOrder,
  getOrderAge,
  onUpdateStatus,
}: {
  order: Order;
  updatingOrder: string | null;
  getOrderAge: (createdAt: string) => string;
  onUpdateStatus: (
    orderId: string,
    status: Order["status"]
  ) => void;
}) {
  const config =
    statusConfig[
      order.status as keyof typeof statusConfig
    ];

  const next = nextStatus[order.status];

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* CARD HEADER */}
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                #{order.orderNumber}
              </span>

              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.color}`}
              >
                {config.label}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Utensils size={13} />

              <span>
                Table {order.tableId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock3 size={13} />
            {getOrderAge(order.createdAt)}
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="space-y-3 p-4">
        {order.items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex gap-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700">
              {item.quantity}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">
                {item.name}
              </p>

              {item.notes && (
                <p className="mt-1 text-xs text-orange-600">
                  Note: {item.notes}
                </p>
              )}
            </div>

            <p className="text-sm font-medium text-slate-700">
              ₹{item.subtotal}
            </p>
          </div>
        ))}
      </div>

      {/* CUSTOMER NOTE */}
      {order.customerNotes && (
        <div className="mx-4 mb-4 rounded-lg bg-amber-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
            Customer Note
          </p>

          <p className="mt-1 text-xs text-amber-800">
            {order.customerNotes}
          </p>
        </div>
      )}

      {/* TOTAL */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <span className="text-sm text-slate-500">
          Total
        </span>

        <span className="font-bold text-slate-900">
          ₹{order.total}
        </span>
      </div>

      {/* ACTION */}
      {next && (
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            disabled={updatingOrder === order._id}
            onClick={() =>
              onUpdateStatus(order._id, next)
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updatingOrder === order._id ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Updating...
              </>
            ) : (
              actionLabels[order.status]
            )}
          </button>
        </div>
      )}
    </article>
  );
}