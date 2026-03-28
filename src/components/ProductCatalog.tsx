"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CatalogGridItem, ProductGrid } from "@/components/ProductGrid";
import type { AppLang } from "@/lib/lang";
import { ProductView } from "@/lib/types";

type ProductCatalogProps = {
  products: ProductView[];
  lang: AppLang;
};

const priceRanges = [
  { id: "all", label: "All Price" },
  { id: "under-620", label: "Under Rp 620,000", min: 0, max: 620000 },
  { id: "620-1200", label: "Rp 620,000 - Rp 1,200,000", min: 620000, max: 1200000 },
  { id: "1200-1800", label: "Rp 1,200,000 - Rp 1,800,000", min: 1200000, max: 1800000 },
  { id: "1800-plus", label: "Rp 1,800,000 +", min: 1800000 },
] as const;

type SortOption = "featured" | "newest" | "price-low" | "price-high";

export function ProductCatalog({ products, lang }: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [availability, setAvailability] = useState<"all" | "in-stock">("all");
  const [priceRange, setPriceRange] = useState("all");
  const [size, setSize] = useState<"all" | "S" | "M" | "L" | "XL">("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const catalogProducts = useMemo<CatalogGridItem[]>(() => {
    const sizeOptions: Array<"S" | "M" | "L" | "XL"> = ["S", "M", "L", "XL"];

    return products.map((product, index) => {
      const primarySize = sizeOptions[index % sizeOptions.length];
      const secondarySize = sizeOptions[(index + 1) % sizeOptions.length];

      return {
        ...product,
        featured: index < 8,
        sizes: [primarySize, secondarySize],
      };
    });
  }, [products]);

  const categories = useMemo(
    () => ["All Products", ...new Set(catalogProducts.map((product) => product.category))],
    [catalogProducts],
  );

  const filtered = useMemo(() => {
    return catalogProducts.filter((product) => {
      const searchMatch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const categoryMatch = category === "All Products" || product.category === category;
      const availabilityMatch = availability === "all" || product.inStock;

      const selectedPrice = priceRanges.find((range) => range.id === priceRange);
      const priceMatch =
        !selectedPrice || selectedPrice.id === "all"
          ? true
          : product.price >= (selectedPrice.min ?? 0) &&
            (("max" in selectedPrice && selectedPrice.max)
              ? product.price <= selectedPrice.max
              : true);

      const sizeMatch = size === "all" || product.sizes.includes(size);

      return searchMatch && categoryMatch && availabilityMatch && priceMatch && sizeMatch;
    });
  }, [availability, catalogProducts, category, priceRange, search, size]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "newest") return b.createdAt.getTime() - a.createdAt.getTime();

      if (a.featured === b.featured) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.featured ? -1 : 1;
    });
  }, [filtered, sortBy]);

  const filterContent = (
    <>
      <div className="border-b border-border p-4">
        <label className="block text-sm text-foreground">
          <span className="sr-only">Search product</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={lang === "id" ? "Cari" : "Search"}
            className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="border-b border-border p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{lang === "id" ? "Tipe Produk" : "Product Type"}</p>
        <div className="space-y-2">
          {categories.map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="category"
                checked={category === item}
                onChange={() => setCategory(item)}
                className="h-4 w-4 accent-black"
              />
              {item === "All Products" ? (lang === "id" ? "Semua Produk" : "All Products") : item}
            </label>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{lang === "id" ? "Ketersediaan" : "Availability"}</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="availability"
              checked={availability === "all"}
              onChange={() => setAvailability("all")}
              className="h-4 w-4 accent-black"
            />
            {lang === "id" ? "Semua" : "All"}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="availability"
              checked={availability === "in-stock"}
              onChange={() => setAvailability("in-stock")}
              className="h-4 w-4 accent-black"
            />
            {lang === "id" ? "Tersedia" : "In Stock"}
          </label>
        </div>
      </div>

      <div className="border-b border-border p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{lang === "id" ? "Harga" : "Price"}</p>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.id} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="price"
                checked={priceRange === range.id}
                onChange={() => setPriceRange(range.id)}
                className="h-4 w-4 accent-black"
              />
              {lang === "id"
                ? range.id === "all"
                  ? "Semua Harga"
                  : range.id === "under-620"
                    ? "Di bawah Rp 620.000"
                    : range.id === "620-1200"
                      ? "Rp 620.000 - Rp 1.200.000"
                      : range.id === "1200-1800"
                        ? "Rp 1.200.000 - Rp 1.800.000"
                        : "Rp 1.800.000 +"
                : range.label}
            </label>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground">{lang === "id" ? "Ukuran" : "Size"}</p>
        <div className="space-y-2">
          {(["all", "S", "M", "L", "XL"] as const).map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="size"
                checked={size === item}
                onChange={() => setSize(item)}
                className="h-4 w-4 accent-black"
              />
              {item === "all" ? (lang === "id" ? "Semua Ukuran" : "All Size") : item}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden h-fit border border-border bg-card/70 lg:block">
        {filterContent}
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-4xl uppercase leading-none text-foreground">{lang === "id" ? "Semua Produk" : "All Products"}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="border border-border bg-background px-3 py-2 text-sm text-foreground lg:hidden"
            >
              {lang === "id" ? "Filter" : "Filter"}
            </button>

            <label className="text-sm text-foreground">
              <span className="sr-only">Sort products</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="featured">{lang === "id" ? "Urut: Unggulan" : "Sort: Featured"}</option>
                <option value="newest">{lang === "id" ? "Urut: Terbaru" : "Sort: Newest"}</option>
                <option value="price-low">{lang === "id" ? "Urut: Harga Rendah" : "Sort: Price Low"}</option>
                <option value="price-high">{lang === "id" ? "Urut: Harga Tinggi" : "Sort: Price High"}</option>
              </select>
            </label>
          </div>
        </div>

        <ProductGrid products={sorted} />
      </div>

      <AnimatePresence>
        {mobileFilterOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto border-t border-border bg-background"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">{lang === "id" ? "Filter" : "Filters"}</p>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs uppercase tracking-[0.14em] text-muted"
                >
                  {lang === "id" ? "Tutup" : "Close"}
                </button>
              </div>

              {filterContent}

              <div className="border-t border-border p-4">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-background"
                >
                  {lang === "id" ? "Terapkan Filter" : "Apply Filters"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
