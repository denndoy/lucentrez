import { ProductSkeletonGrid } from "@/components/ProductSkeletonGrid";

export default function CatalogLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
      <div className="mb-6 h-12 w-72 animate-pulse rounded bg-zinc-800" />
      <div className="mb-7 h-24 animate-pulse rounded-2xl bg-zinc-900" />
      <ProductSkeletonGrid />
    </main>
  );
}
