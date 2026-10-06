import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CASHIER") {
    if (
      session.user.role === "RESTAURANT_OWNER" ||
      session.user.role === "MANAGER"
    ) {
      redirect("/dashboard");
    }

    if (session.user.role === "KITCHEN") {
      redirect("/kitchen");
    }

    if (session.user.role === "WAITER") {
      redirect("/staff");
    }

    redirect("/login");
  }

  return children;
}