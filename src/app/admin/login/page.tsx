"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, normalizeLang, type AppLang } from "@/lib/lang";

export default function AdminLoginPage() {
  const router = useRouter();
  const [lang] = useState<AppLang>(() => {
    if (typeof document === "undefined") {
      return "en";
    }

    const found = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${LANG_COOKIE}=`));

    return normalizeLang(found ? found.split("=")[1] : undefined);
  });
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
      setError(lang === "id" ? "Kredensial tidak valid." : "Invalid credentials.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-[70vh] w-full items-center px-2 py-14">
      <form className="w-full rounded-2xl border border-border bg-card p-6" onSubmit={onSubmit}>
        <h1 className="font-display text-4xl uppercase text-foreground">{lang === "id" ? "Login Admin" : "Admin Login"}</h1>
        <p className="mt-2 text-sm text-muted">{lang === "id" ? "Gunakan kredensial admin Lucentrez." : "Use your Lucentrez admin credentials."}</p>

        <div className="mt-6 space-y-3">
          <input name="username" placeholder={lang === "id" ? "Nama pengguna" : "Username"} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" required />
          <input name="password" type="password" placeholder={lang === "id" ? "Kata sandi" : "Password"} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground" required />
          <button type="submit" className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-background">
            {lang === "id" ? "Masuk" : "Sign In"}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </form>
    </main>
  );
}
