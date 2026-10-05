export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome to Restova 👋</h1>

      <p className="mt-2 text-slate-400">
        Your restaurant management dashboard is ready.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Orders" value="0" />
        <StatCard title="Revenue" value="₹0" />
        <StatCard title="Active Tables" value="0" />
        <StatCard title="Menu Items" value="0" />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}