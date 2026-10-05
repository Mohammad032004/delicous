import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  Table2,
  ShoppingCart,
  ChefHat,
  Settings,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900 md:block">
        <div className="border-b border-white/10 p-6">
          <h1 className="text-2xl font-bold">Restova</h1>
          <p className="mt-1 text-xs text-slate-400">
            Restaurant Management
          </p>
        </div>

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
            href="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Settings"
          />
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium">
              {session.user.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              {session.user.email}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-xs text-slate-400">
                Manage your restaurant
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              {session.user.role}
            </div>
          </div>
        </header>

        <section className="p-6">{children}</section>
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
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}