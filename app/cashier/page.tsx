"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "OTHER";

interface Order {
  _id: string;
  orderNumber: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  tableId?: {
    name: string;
    number: number;
  };
}

interface Bill {
  _id: string;
  orderId: string;
  billNumber: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: PaymentMethod;
  status: string;
  paidAt?: string;
}

export default function CashierPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<
    Record<string, Bill>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchOrders(
    showLoader = false
  ) {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(
        "/api/orders",
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

      const completedOrders = (
        data.orders || []
      ).filter(
        (order: Order) =>
          order.status === "COMPLETED"
      );

      setOrders(completedOrders);
    } catch (error) {
      console.error(
        "Cashier orders error:",
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

  async function generateBill(
    orderId: string
  ) {
    try {
      setProcessingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/bill",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to generate bill"
        );
      }

      const bill = data.bill as Bill;

      setBills((previous) => ({
        ...previous,
        [orderId]: bill,
      }));

      setSuccess(
        `Bill #${bill.billNumber} generated successfully.`
      );
    } catch (error) {
      console.error(
        "Generate bill error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate bill"
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function recordPayment(
    billId: string,
    orderId: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      setProcessingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/bill/${billId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to record payment"
        );
      }

      const updatedBill =
        data.bill as Bill;

      setBills((previous) => ({
        ...previous,
        [orderId]: updatedBill,
      }));

      setSuccess(
        `Payment recorded successfully using ${paymentMethod}.`
      );

      await fetchOrders();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to record payment"
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading cashier panel...
        </div>
      </main>
    );
  }

  const unpaidOrders = orders.filter(
    (order) =>
      bills[order._id]?.paymentStatus !== "PAID"
  );

  const paidOrders = orders.filter(
    (order) =>
      bills[order._id]?.paymentStatus === "PAID"
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Receipt size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Cashier Panel
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage bills and payments
              </p>
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
        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Completed Orders"
            value={orders.length}
            icon={<Receipt size={21} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending Payment"
            value={unpaidOrders.length}
            icon={<Wallet size={21} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Paid Orders"
            value={paidOrders.length}
            icon={
              <CheckCircle2 size={21} />
            }
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Orders */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Completed Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generate bills and record customer
              payments.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
              <Receipt
                size={36}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-3 font-semibold">
                No completed orders
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Completed orders will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {orders.map((order) => {
                const bill =
                  bills[order._id];

                const isPaid =
                  bill?.paymentStatus ===
                  "PAID";

                const isProcessing =
                  processingId ===
                  order._id;

                return (
                  <div
                    key={order._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                      <div>
                        <p className="font-bold">
                          Order #
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatTime(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        COMPLETED
                      </span>
                    </div>

                    {/* Table */}
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <p className="text-xs text-slate-500">
                        Table
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {order.tableId?.name ||
                          `Table ${
                            order.tableId
                              ?.number || "-"
                          }`}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="p-5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Subtotal
                          </span>

                          <span>
                            ₹{order.subtotal}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Tax
                          </span>

                          <span>
                            ₹{order.tax}
                          </span>
                        </div>

                        {order.discount >
                          0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>
                              Discount
                            </span>

                            <span>
                              -₹
                              {
                                order.discount
                              }
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="font-semibold">
                            Total
                          </span>

                          <span className="text-2xl font-bold">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bill Status */}
                    {bill && (
                      <div className="border-t border-slate-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500">
                              Bill
                            </p>

                            <p className="font-semibold">
                              #
                              {
                                bill.billNumber
                              }
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {isPaid
                              ? "PAID"
                              : "PAYMENT PENDING"}
                          </span>
                        </div>

                        {bill.paymentMethod && (
                          <p className="mt-2 text-xs text-slate-500">
                            Payment:{" "}
                            {
                              bill.paymentMethod
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-slate-100 p-5">
                      {!bill ? (
                        <button
                          type="button"
                          onClick={() =>
                            generateBill(
                              order._id
                            )
                          }
                          disabled={
                            isProcessing
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Receipt
                                size={17}
                              />
                              Generate Bill
                            </>
                          )}
                        </button>
                      ) : isPaid ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                          <CheckCircle2
                            size={17}
                          />
                          Payment Completed
                        </div>
                      ) : (
                        <div>
                          <p className="mb-3 text-sm font-semibold text-slate-700">
                            Select Payment Method
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <PaymentButton
                              label="Cash"
                              icon={
                                <IndianRupee
                                  size={16}
                                />
                              }
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "CASH"
                                )
                              }
                            />

                            <PaymentButton
                              label="UPI"
                              icon={
                                <Wallet
                                  size={16}
                                />
                              }
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "UPI"
                                )
                              }
                            />

                            <PaymentButton
                              label="Card"
                              icon={
                                <CreditCard
                                  size={16}
                                />
                              }
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "CARD"
                                )
                              }
                            />

                            <PaymentButton
                              label="Other"
                              icon={
                                <Receipt
                                  size={16}
                                />
                              }
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "OTHER"
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function PaymentButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}