import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdminSessionFromCookies } from "@/lib/auth";
import { getAllProducts, getGalleryItems, getHeroSlides, getContactSettings } from "@/lib/data";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);
  const isAdmin = await isAdminSessionFromCookies();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const [products, gallery, heroSlides, contactSettings] = await Promise.all([
    getAllProducts(),
    getGalleryItems(),
    getHeroSlides(),
    getContactSettings(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1600px] min-w-0 overflow-x-clip px-3 py-8 md:px-6 md:py-12 lg:px-8 xl:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Lucentrez CMS</p>
          <h1 className="font-display text-3xl uppercase leading-none text-foreground sm:text-4xl md:text-5xl">
            {lang === "id" ? "Dashboard Admin" : "Admin Dashboard"}
          </h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background">
            {lang === "id" ? "Keluar" : "Logout"}
          </button>
        </form>
      </div>

      <AdminPanel initialProducts={products} initialGallery={gallery} initialHeroSlides={heroSlides} initialContactSettings={contactSettings} lang={lang} />
    </main>
  );
}
