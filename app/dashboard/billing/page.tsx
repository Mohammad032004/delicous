"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
  Wallet,
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
  status: string;
  paymentStatus: string;
  createdAt: string;
  tableId: Table;
}

interface Bill {
  _id: string;
  billNumber: number;
  orderId: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  status: string;
  paidAt?: string;
}

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "OTHER";

export default function BillingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<
    Record<string, Bill>
  >({});

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState<
    string | null
  >(null);

  const [payingBill, setPayingBill] = useState<
    string | null
  >(null);

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

      const completedOrders = (
        data.orders || []
      ).filter(
        (order: Order) =>
          order.status === "COMPLETED"
      );

      setOrders(completedOrders);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load billing orders"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchBills() {
    try {
      const response = await fetch("/api/bill", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load bills"
        );
      }

      const billMap: Record<string, Bill> = {};

      for (const bill of data.bills || []) {
        const orderId =
          typeof bill.orderId === "string"
            ? bill.orderId
            : bill.orderId?._id;

        if (orderId) {
          billMap[orderId] = bill;
        }
      }

      setBills(billMap);
    } catch (error) {
      console.error("Bills fetch error:", error);
    }
  }

  async function refreshData() {
    await Promise.all([
      fetchOrders(),
      fetchBills(),
    ]);
  }

  useEffect(() => {
    refreshData();

    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function generateBill(orderId: string) {
    try {
      setGenerating(orderId);
      setError("");

      const response = await fetch("/api/bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate bill"
        );
      }

      setBills((currentBills) => ({
        ...currentBills,
        [orderId]: data.bill,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate bill"
      );
    } finally {
      setGenerating(null);
    }
  }

  async function recordPayment(
    billId: string,
    orderId: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      setPayingBill(billId);
      setError("");

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
          data.message ||
            "Failed to record payment"
        );
      }

      const updatedBill = data.bill as Bill;

      setBills((currentBills) => ({
        ...currentBills,
        [orderId]: updatedBill,
      }));

      await fetchOrders();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to record payment"
      );
    } finally {
      setPayingBill(null);
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
          Loading billing panel...
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
              Billing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Generate bills and record payments
            </p>
          </div>

          <button
            type="button"
            onClick={refreshData}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <FileText
                size={42}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-700">
                No completed orders
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Completed orders will appear here
                for billing.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const bill = bills[order._id];

              /*
               * IMPORTANT:
               * Once a bill exists, its paymentStatus is
               * the latest payment state.
               *
               * This prevents the top badge from showing
               * PENDING while the bill below says PAID.
               */
              const paymentStatus =
                bill?.paymentStatus ||
                order.paymentStatus;

              return (
                <article
                  key={order._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Order
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        #{order.orderNumber}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Order Status */}
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        ORDER: {order.status}
                      </span>

                      {/* Payment Status */}
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          paymentStatus === "PAID"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        PAYMENT: {paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold">
                      {order.tableId?.name ||
                        "Unknown Table"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {order.customerName || "Guest"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mt-5 space-y-2">
                    {order.items.map(
                      (item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-slate-600">
                            {item.name} ×{" "}
                            {item.quantity}
                          </span>

                          <span className="font-medium">
                            ₹{item.subtotal}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span>
                        ₹{order.subtotal}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-slate-500">
                        Tax
                      </span>

                      <span>₹{order.tax}</span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-slate-500">
                        Discount
                      </span>

                      <span>
                        -₹{order.discount}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
                      <span className="font-semibold">
                        Total
                      </span>

                      <span className="text-xl font-bold">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Bill */}
                  {bill ? (
                    <div className="mt-5">
                      <div
                        className={`rounded-xl border p-4 ${
                          bill.paymentStatus ===
                          "PAID"
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            bill.paymentStatus ===
                            "PAID"
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          <CheckCircle2
                            size={18}
                          />

                          <span className="font-semibold">
                            Bill #{bill.billNumber}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between text-sm">
                          <span
                            className={
                              bill.paymentStatus ===
                              "PAID"
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }
                          >
                            Payment
                          </span>

                          <span
                            className={`font-semibold ${
                              bill.paymentStatus ===
                              "PAID"
                                ? "text-emerald-800"
                                : "text-amber-800"
                            }`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </div>

                        {bill.paymentMethod && (
                          <div className="mt-1 flex justify-between text-sm">
                            <span
                              className={
                                bill.paymentStatus ===
                                "PAID"
                                  ? "text-emerald-700"
                                  : "text-amber-700"
                              }
                            >
                              Method
                            </span>

                            <span
                              className={`font-semibold ${
                                bill.paymentStatus ===
                                "PAID"
                                  ? "text-emerald-800"
                                  : "text-amber-800"
                              }`}
                            >
                              {bill.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Payment Controls */}
                      {bill.paymentStatus !==
                        "PAID" && (
                        <div className="mt-4">
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            Record Payment
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={
                                payingBill ===
                                bill._id
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "CASH"
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                              <CreditCard
                                size={15}
                              />
                              Cash
                            </button>

                            <button
                              type="button"
                              disabled={
                                payingBill ===
                                bill._id
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "UPI"
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                              UPI
                            </button>

                            <button
                              type="button"
                              disabled={
                                payingBill ===
                                bill._id
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "CARD"
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                              Card
                            </button>

                            <button
                              type="button"
                              disabled={
                                payingBill ===
                                bill._id
                              }
                              onClick={() =>
                                recordPayment(
                                  bill._id,
                                  order._id,
                                  "OTHER"
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                              Other
                            </button>
                          </div>

                          {payingBill ===
                            bill._id && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                              Recording payment...
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment Completed */}
                      {bill.paymentStatus ===
                        "PAID" && (
                        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                          ✓ Payment completed
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Generate Bill */
                    <button
                      type="button"
                      disabled={
                        generating === order._id
                      }
                      onClick={() =>
                        generateBill(order._id)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generating ===
                      order._id ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText size={17} />
                          Generate Bill
                        </>
                      )}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}