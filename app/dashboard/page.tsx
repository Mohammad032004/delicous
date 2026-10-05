import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Restova Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Welcome, {session.user.name}
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Logged in as
          </p>

          <p className="mt-1">
            {session.user.email}
          </p>
        </div>
      </div>
    </main>
  );
}