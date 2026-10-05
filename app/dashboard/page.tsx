"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Users,
} from "lucide-react";

interface Table {
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
  qrUrl: string;
  qrCode: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("4");

  const [qrData, setQrData] = useState<QRData | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);

  async function fetchTables() {
    try {
      setError("");

      const response = await fetch("/api/tables", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load tables"
        );
      }

      setTables(data.tables || []);
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
    fetchTables();
  }, []);

  async function createTable(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a table name.");
      return;
    }

    if (!number || Number(number) < 1) {
      setError("Please enter a valid table number.");
      return;
    }

    if (!capacity || Number(capacity) < 1) {
      setError("Please enter a valid capacity.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          number: Number(number),
          capacity: Number(capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create table"
        );
      }

      setTables((currentTables) => [
        ...currentTables,
        data.table,
      ]);

      setName("");
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

  async function showQR(table: Table) {
    try {
      setLoadingQR(true);
      setError("");

      const response = await fetch(
        `/api/tables/${table._id}/qr`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate QR code"
        );
      }

      setQrData(data);
      setQrTable(table);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate QR code"
      );
    } finally {
      setLoadingQR(false);
    }
  }

  function getStatusClass(status: Table["status"]) {
    switch (status) {
      case "AVAILABLE":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "OCCUPIED":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "BILL_REQUESTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "CLEANING":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Tables
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage restaurant tables and QR codes
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTables}
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

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Add Table
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a new restaurant table.
              </p>
            </div>

            <form
              onSubmit={createTable}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Table Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Table 1"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
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
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) =>
                    setCapacity(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div>
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Loading tables...
                </div>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                <div className="text-center">
                  <Users
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <h2 className="mt-3 font-semibold text-slate-700">
                    No tables yet
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Create your first table.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => (
                  <div
                    key={table._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">
                          {table.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Table #{table.number}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                          table.status
                        )}`}
                      >
                        {table.status.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                      <Users size={16} />
                      {table.capacity} seats
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => showQR(table)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <QrCode size={16} />
                        QR Code
                      </button>

                      <a
                        href={`/menu/${table.qrToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        <ExternalLink size={16} />
                        Open Menu
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {qrTable && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {qrTable.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Scan to open the customer menu
              </p>

              <img
                src={qrData.qrCode}
                alt={`QR code for ${qrTable.name}`}
                className="mx-auto mt-6 h-64 w-64"
              />

              <p className="mt-4 break-all text-xs text-slate-400">
                {qrData.qrUrl}
              </p>

              <button
                type="button"
                onClick={() => {
                  setQrTable(null);
                  setQrData(null);
                }}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}