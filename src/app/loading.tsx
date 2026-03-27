import { ProductSkeletonGrid } from "@/components/ProductSkeletonGrid";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-14 md:px-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-zinc-800" />
      <ProductSkeletonGrid />
    </main>
  );
}
