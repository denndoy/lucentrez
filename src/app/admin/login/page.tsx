"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
      credentials: "include",
    });

    if (!response.ok) {
      setError("Invalid credentials.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-5 py-14">
      <form className="w-full rounded-2xl border border-border bg-card p-6" onSubmit={onSubmit}>
        <h1 className="font-display text-4xl uppercase text-foreground">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Use your Lucentrezn admin credentials.</p>

        <div className="mt-6 space-y-3">
          <input name="username" placeholder="Username" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" required />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" required />
          <button type="submit" className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-background">
            Sign In
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </form>
    </main>
  );
}
