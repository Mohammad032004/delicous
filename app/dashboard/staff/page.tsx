"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";

type StaffRole =
  | "MANAGER"
  | "KITCHEN"
  | "WAITER"
  | "CASHIER";

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

const roleLabels: Record<StaffRole, string> = {
  MANAGER: "Manager",
  KITCHEN: "Kitchen",
  WAITER: "Waiter",
  CASHIER: "Cashier",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "WAITER" as StaffRole,
  });

  async function loadStaff() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/staff");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load staff"
        );
      }

      setStaff(data.staff || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load staff"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create staff"
        );
      }

      setSuccess(
        "Staff member created successfully."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "WAITER",
      });

      setShowModal(false);

      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create staff"
      );
    } finally {
      setSaving(false);
    }
  }

  function getRoleIcon(role: StaffRole) {
    if (role === "MANAGER") return "👨‍💼";
    if (role === "KITCHEN") return "👨‍🍳";
    if (role === "WAITER") return "🧑‍💼";
    return "💳";
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <Users size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Staff Management
                </h1>

                <p className="text-sm text-gray-500">
                  Manage your restaurant team
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <UserPlus size={18} />
            Add Staff
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Staff
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {staff.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Active Staff
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                staff.filter(
                  (member) => member.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Inactive Staff
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-500">
              {
                staff.filter(
                  (member) => !member.isActive
                ).length
              }
            </p>
          </div>
        </div>

        {/* Staff list */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="font-semibold text-gray-900">
              Restaurant Staff
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Employees who have access to your restaurant
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={28}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Users
                  size={26}
                  className="text-gray-500"
                />
              </div>

              <h3 className="font-semibold text-gray-900">
                No staff members yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Add your restaurant team members to give
                them access to Restova.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"
              >
                <UserPlus size={17} />
                Add Staff
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {staff.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {getRoleIcon(member.role)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.name}
                      </h3>

                      <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:gap-4">
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} />
                          {member.email}
                        </span>

                        {member.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      {roleLabels[member.role]}
                    </span>

                    <span
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        member.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.isActive
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />

                      {member.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add Staff Member
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create login credentials for your staff
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter staff name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="staff@example.com"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >
                  <option value="MANAGER">
                    Manager
                  </option>

                  <option value="KITCHEN">
                    Kitchen
                  </option>

                  <option value="WAITER">
                    Waiter
                  </option>

                  <option value="CASHIER">
                    Cashier
                  </option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Temporary Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Create Staff Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}