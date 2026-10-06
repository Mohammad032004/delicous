"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Table2,
  XCircle,
} from "lucide-react";

interface DashboardStats {
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  billRequestedTables: number;
  cleaningTables: number;
}

interface Table {
  _id: string;
  name: string;
  number: number;
  capacity: number;
  status:
    | "AVAILABLE"
    | "OCCUPIED"
    | "BILL_REQUESTED"
    | "CLEANING";
}

interface RecentOrder {
  _id: string;
  orderNumber: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  tableId?: {
    name: string;
    number: number;
    capacity: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [tables, setTables] = useState<Table[]>([]);
  const [recentOrders, setRecentOrders] =
    useState<RecentOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setError("");

      const response = await fetch(
        "/api/dashboard/stats",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard"
        );
      }

      setStats(data.stats);
      setTables(data.tables || []);
      setRecentOrders(
        data.recentOrders || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(
      fetchDashboard,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  function getTableClass(status: Table["status"]) {
    switch (status) {
      case "AVAILABLE":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "OCCUPIED":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "BILL_REQUESTED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "CLEANING":
        return "border-slate-200 bg-slate-100 text-slate-700";

      default:
        return "border-slate-200 bg-white text-slate-700";
    }
  }

  function getOrderClass(status: string) {
    switch (status) {
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "READY":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "PREPARING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
            />
            Loading dashboard...
          </div>
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
            <h1 className="text-2xl font-bold">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Restaurant overview and today&apos;s
              activity
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Main Stats */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Today&apos;s Sales
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      ₹{stats.todaySales}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <IndianRupee size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Today&apos;s Orders
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats.totalOrders}
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
                      Pending Orders
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats.pendingOrders}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Clock3 size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Completed
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats.completedOrders}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Table2
                    size={20}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Total Tables
                    </p>

                    <p className="text-xl font-bold">
                      {stats.totalTables}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Occupied
                    </p>

                    <p className="text-xl font-bold">
                      {stats.occupiedTables}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Available
                    </p>

                    <p className="text-xl font-bold">
                      {stats.availableTables}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <XCircle
                    size={20}
                    className="text-red-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Cancelled
                    </p>

                    <p className="text-xl font-bold">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold">
                  Table Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current status of your restaurant
                  tables
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {tables.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No tables created yet.
                  </p>
                ) : (
                  tables.map((table) => (
                    <div
                      key={table._id}
                      className={`rounded-xl border p-4 ${getTableClass(
                        table.status
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {table.name}
                        </p>

                        <span className="text-xs font-bold">
                          #{table.number}
                        </span>
                      </div>

                      <p className="mt-2 text-xs">
                        {table.capacity} seats
                      </p>

                      <p className="mt-3 text-xs font-semibold">
                        {table.status.replace(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest restaurant activity
                </p>
              </div>

              {recentOrders.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  No orders yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px]">
                    <thead className="border-b border-slate-100 bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Order
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Table
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Time
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold">
                              #{order.orderNumber}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {order.tableId?.name ||
                              "Unknown"}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            ₹{order.total}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-medium">
                            {order.paymentStatus}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(
                              order.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}