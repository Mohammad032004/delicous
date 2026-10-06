import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  Table2,
  ShoppingCart,
  ChefHat,
  Users,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Only restaurant owners and managers can access
  // the main restaurant dashboard.
  const allowedRoles = ["RESTAURANT_OWNER", "MANAGER"];

  if (!allowedRoles.includes(session.user.role)) {
    if (session.user.role === "KITCHEN") {
      redirect("/kitchen");
    }

    if (session.user.role === "WAITER") {
      redirect("/staff");
    }

    if (session.user.role === "CASHIER") {
      redirect("/cashier");
    }

    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white md:block">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Restova
            </h1>
            <p className="text-xs text-slate-500">
              Restaurant Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />

          <NavItem
            href="/dashboard/menu"
            icon={<Utensils size={18} />}
            label="Menu"
          />

          <NavItem
            href="/dashboard/tables"
            icon={<Table2 size={18} />}
            label="Tables"
          />

          <NavItem
            href="/dashboard/orders"
            icon={<ShoppingCart size={18} />}
            label="Orders"
          />

          <NavItem
            href="/kitchen"
            icon={<ChefHat size={18} />}
            label="Kitchen"
          />

          <NavItem
            href="/dashboard/staff"
            icon={<Users size={18} />}
            label="Staff"
          />

          <NavItem
            href="/dashboard/billing"
            icon={<Receipt size={18} />}
            label="Billing"
          />

          <NavItem
            href="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Settings"
          />
        </nav>

        {/* Bottom user section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {session.user.name || "User"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {session.user.email}
            </p>

            <div className="mt-2">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {session.user.role === "RESTAURANT_OWNER"
                  ? "Restaurant Owner"
                  : "Manager"}
              </span>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen md:ml-64">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}