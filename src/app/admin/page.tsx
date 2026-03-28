import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdminSessionFromCookies } from "@/lib/auth";
import { getAllProducts, getGalleryItems } from "@/lib/data";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);
  const isAdmin = await isAdminSessionFromCookies();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const [products, gallery] = await Promise.all([getAllProducts(), getGalleryItems()]);

  return (
    <main className="w-full px-2 py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Lucentrez CMS</p>
          <h1 className="font-display text-5xl uppercase leading-none text-foreground">
            {lang === "id" ? "Dashboard Admin" : "Admin Dashboard"}
          </h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground hover:bg-foreground hover:text-background">
            {lang === "id" ? "Keluar" : "Logout"}
          </button>
        </form>
      </div>

      <AdminPanel initialProducts={products} initialGallery={gallery} lang={lang} />
    </main>
  );
}
