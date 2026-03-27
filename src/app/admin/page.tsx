import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdminSessionFromCookies } from "@/lib/auth";
import { getAllProducts, getGalleryItems } from "@/lib/data";

export default async function AdminPage() {
  const isAdmin = await isAdminSessionFromCookies();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const [products, gallery] = await Promise.all([getAllProducts(), getGalleryItems()]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Lucentrezn CMS</p>
          <h1 className="font-display text-5xl uppercase leading-none text-foreground">Admin Dashboard</h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-background">
            Logout
          </button>
        </form>
      </div>

      <AdminPanel initialProducts={products} initialGallery={gallery} />
    </main>
  );
}
