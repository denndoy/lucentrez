import { Metadata } from "next";
import { cookies } from "next/headers";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getAllProducts } from "@/lib/data";
import { LANG_COOKIE, normalizeLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse Lucentrez streetwear products and continue checkout on marketplace.",
};

export default async function CatalogPage() {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get(LANG_COOKIE)?.value);
  const products = await getAllProducts();

  return (
    <main className="w-full px-4 py-8 md:px-6 lg:px-10">
      <ProductCatalog products={products} lang={lang} />
    </main>
  );
}
