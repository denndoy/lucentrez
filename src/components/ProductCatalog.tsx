"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductView } from "@/lib/types";

type ProductCatalogProps = {
  products: ProductView[];
};

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(0);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products],
  );

  const priceLimit =
    maxPrice > 0
      ? maxPrice
      : Math.max(...products.map((product) => product.price), 0);

  const filtered = products.filter((product) => {
    const categoryMatch = category === "All" || product.category === category;
    const priceMatch = product.price <= priceLimit;
    return categoryMatch && priceMatch;
  });

  return (
    <section className="space-y-7">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(0,0,0,0.09)] md:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">Category</label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-muted">
              Max Price: {priceLimit.toLocaleString("id-ID")}
            </label>
            <input
              type="range"
              min={0}
              max={Math.max(...products.map((product) => product.price), 500000)}
              step={10000}
              value={priceLimit}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full accent-black"
            />
          </div>
        </div>
      </div>

      <ProductGrid products={filtered} />
    </section>
  );
}
