export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome to Restova 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Here's what's happening with your restaurant today.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}