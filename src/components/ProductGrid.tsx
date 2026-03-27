import { ProductCard } from "@/components/ProductCard";
import { ProductView } from "@/lib/types";

type ProductGridProps = {
  products: ProductView[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
        No products found for this filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
