import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "KITCHEN") {
    if (session.user.role === "RESTAURANT_OWNER" || session.user.role === "MANAGER") {
      redirect("/dashboard");
    }

    if (session.user.role === "WAITER") {
      redirect("/staff");
    }

    if (session.user.role === "CASHIER") {
      redirect("/cashier");
    }

    redirect("/login");
  }

  return children;
}