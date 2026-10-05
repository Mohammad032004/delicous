"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Table2,
  Loader2,
  Users,
  QrCode,
  X,
  ExternalLink,
} from "lucide-react";

interface RestaurantTable {
  _id: string;
  name: string;
  number: number;
  capacity: number;
  qrToken: string;
  status:
    | "AVAILABLE"
    | "OCCUPIED"
    | "BILL_REQUESTED"
    | "CLEANING";
  isActive: boolean;
}

interface QRData {
  table: {
    id: string;
    name: string;
    number: number;
  };
  menuUrl: string;
  qrCode: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("4");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const [error, setError] = useState("");
  const [qrData, setQrData] = useState<QRData | null>(null);

  async function loadTables() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tables");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load tables"
        );
      }

      setTables(data.tables);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load tables"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTables();
  }, []);

  async function handleCreateTable(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const tableNumber = Number(number);
    const tableCapacity = Number(capacity);

    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      setError("Enter a valid table number");
      return;
    }

    if (
      !Number.isInteger(tableCapacity) ||
      tableCapacity < 1
    ) {
      setError("Enter a valid capacity");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: tableNumber,
          capacity: tableCapacity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create table"
        );
      }

      setTables((current) => [...current, data.table]);

      setNumber("");
      setCapacity("4");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create table"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleGenerateQR(tableId: string) {
    try {
      setQrLoading(true);
      setError("");

      const response = await fetch(
        `/api/tables/${tableId}/qr`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate QR"
        );
      }

      setQrData(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate QR"
      );
    } finally {
      setQrLoading(false);
    }
  }

  function getStatusClasses(
    status: RestaurantTable["status"]
  ) {
    switch (status) {
      case "OCCUPIED":
        return "bg-red-50 text-red-600 border-red-200";

      case "BILL_REQUESTED":
        return "bg-amber-50 text-amber-600 border-amber-200";

      case "CLEANING":
        return "bg-blue-50 text-blue-600 border-blue-200";

      default:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Tables
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage restaurant tables and QR ordering.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Add Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Plus size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Add Table
              </h2>

              <p className="text-xs text-slate-500">
                Create a restaurant table
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateTable}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Table Number
              </label>

              <input
                type="number"
                min="1"
                value={number}
                onChange={(event) =>
                  setNumber(event.target.value)
                }
                placeholder="1"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Seating Capacity
              </label>

              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(event) =>
                  setCapacity(event.target.value)
                }
                placeholder="4"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Add Table
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tables */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Restaurant Tables
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {tables.length}{" "}
                {tables.length === 1
                  ? "table"
                  : "tables"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
              <Table2 size={19} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
            </div>
          ) : tables.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
              <Table2
                size={34}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm font-medium text-slate-600">
                No tables yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add your first restaurant table.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tables.map((table) => (
                <div
                  key={table._id}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                        <Table2 size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {table.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={13} />
                          {table.capacity} seats
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        table.status
                      )}`}
                    >
                      {table.status.replace("_", " ")}
                    </span>

                    <button
                      onClick={() =>
                        handleGenerateQR(table._id)
                      }
                      disabled={qrLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                    >
                      {qrLoading ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <QrCode size={14} />
                      )}
                      QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {qrData.table.name}
                </h2>

                <p className="text-xs text-slate-500">
                  Customer ordering QR code
                </p>
              </div>

              <button
                onClick={() => setQrData(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-5">
              <img
                src={qrData.qrCode}
                alt={`QR code for ${qrData.table.name}`}
                className="h-64 w-64"
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="break-all text-center text-xs text-slate-500">
                {qrData.menuUrl}
              </p>
            </div>

            <a
              href={qrData.menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ExternalLink size={16} />
              Open Customer Menu
            </a>
          </div>
        </div>
      )}
    </div>
  );
}