"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const sessionResponse = await fetch(
        "/api/auth/session"
      );

      if (!sessionResponse.ok) {
        setError(
          "Login successful, but session could not be loaded."
        );
        return;
      }

      const session = await sessionResponse.json();

      const role = session?.user?.role;

      if (role === "KITCHEN") {
        window.location.href = "/kitchen";
      } else if (role === "WAITER") {
        window.location.href = "/staff";
      } else if (role === "CASHIER") {
        window.location.href =
          "/dashboard/billing";
      } else {
        // RESTAURANT_OWNER and MANAGER
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-3xl font-bold text-white">
            Restova
          </div>

          <h1 className="text-2xl font-semibold text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to your restaurant dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="owner@example.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm text-slate-300">
                Password
              </label>

              <span className="text-xs text-slate-500">
                Forgot password?
              </span>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have a restaurant account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}