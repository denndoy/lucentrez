import { Metadata } from "next";
import { ProductCatalog } from "@/components/ProductCatalog";
import { getAllProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catalog | Lucentrezn",
  description: "Browse Lucentrezn streetwear products and continue checkout on marketplace.",
};

export default async function CatalogPage() {
  const products = await getAllProducts();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
      <h1 className="font-display text-5xl uppercase leading-none text-foreground md:text-7xl">Catalog</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Pick your next fit. Every product page includes a direct marketplace purchase button for secure checkout.
      </p>

      <div className="mt-8">
        <ProductCatalog products={products} />
      </div>
    </main>
  );
}
