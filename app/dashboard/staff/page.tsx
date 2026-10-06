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
  Pencil,
  Power,
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

const roleIcons: Record<StaffRole, string> = {
  MANAGER: "👨‍💼",
  KITCHEN: "👨‍🍳",
  WAITER: "🧑‍💼",
  CASHIER: "💳",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "WAITER" as StaffRole,
  });

  const [editForm, setEditForm] = useState({
    name: "",
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

  function handleAddChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAddStaff(
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
        body: JSON.stringify(addForm),
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

      setAddForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "WAITER",
      });

      setShowAddModal(false);

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

  function openEditModal(member: Staff) {
    setSelectedStaff(member);

    setEditForm({
      name: member.name,
      phone: member.phone || "",
      password: "",
      role: member.role,
    });

    setError("");
    setSuccess("");
    setShowEditModal(true);
  }

  async function handleEditStaff(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!selectedStaff) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload: {
        name: string;
        phone: string;
        role: StaffRole;
        password?: string;
      } = {
        name: editForm.name,
        phone: editForm.phone,
        role: editForm.role,
      };

      if (editForm.password.trim()) {
        payload.password =
          editForm.password;
      }

      const response = await fetch(
        `/api/staff/${selectedStaff._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update staff"
        );
      }

      setSuccess(
        "Staff member updated successfully."
      );

      setShowEditModal(false);
      setSelectedStaff(null);

      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update staff"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStaffStatus(
    member: Staff
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/staff/${member._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !member.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update staff status"
        );
      }

      setSuccess(
        member.isActive
          ? `${member.name} has been deactivated.`
          : `${member.name} has been activated.`
      );

      await loadStaff();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update staff status"
      );
    }
  }

  function closeModals() {
    if (saving) return;

    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedStaff(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowAddModal(true);
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

        {/* Staff List */}
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
                onClick={() =>
                  setShowAddModal(true)
                }
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
                  className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {roleIcons[member.role]}
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

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      {roleLabels[member.role]}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        member.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {member.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <button
                      onClick={() =>
                        openEditModal(member)
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleStaffStatus(member)
                      }
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        member.isActive
                          ? "border border-red-200 text-red-600 hover:bg-red-50"
                          : "border border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <Power size={14} />
                      {member.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add Staff Member
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create login credentials
                </p>
              </div>

              <button
                onClick={closeModals}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleAddStaff}
              className="space-y-5 p-6"
            >
              <FormInput
                label="Full Name"
                name="name"
                value={addForm.name}
                onChange={handleAddChange}
                placeholder="Enter staff name"
                required
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={addForm.email}
                onChange={handleAddChange}
                placeholder="staff@example.com"
                required
              />

              <FormInput
                label="Phone"
                name="phone"
                value={addForm.phone}
                onChange={handleAddChange}
                placeholder="Enter phone number"
              />

              <RoleSelect
                value={addForm.role}
                onChange={handleAddChange}
                name="role"
              />

              <FormInput
                label="Temporary Password"
                name="password"
                type="password"
                value={addForm.password}
                onChange={handleAddChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />

              <SubmitButton
                saving={saving}
                text="Create Staff Account"
              />
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Staff Member
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedStaff.email}
                </p>
              </div>

              <button
                onClick={closeModals}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditStaff}
              className="space-y-5 p-6"
            >
              <FormInput
                label="Full Name"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Enter staff name"
                required
              />

              <FormInput
                label="Phone"
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                placeholder="Enter phone number"
              />

              <RoleSelect
                value={editForm.role}
                onChange={handleEditChange}
                name="role"
              />

              <FormInput
                label="New Password"
                name="password"
                type="password"
                value={editForm.password}
                onChange={handleEditChange}
                placeholder="Leave blank to keep current password"
                minLength={8}
              />

              <SubmitButton
                saving={saving}
                text="Save Changes"
              />
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  minLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
      />
    </div>
  );
}

function RoleSelect({
  value,
  onChange,
  name,
}: {
  value: StaffRole;
  name: string;
  onChange: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Role
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      >
        <option value="MANAGER">Manager</option>
        <option value="KITCHEN">Kitchen</option>
        <option value="WAITER">Waiter</option>
        <option value="CASHIER">Cashier</option>
      </select>
    </div>
  );
}

function SubmitButton({
  saving,
  text,
}: {
  saving: boolean;
  text: string;
}) {
  return (
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
          Saving...
        </>
      ) : (
        <>
          <ShieldCheck size={18} />
          {text}
        </>
      )}
    </button>
  );
}