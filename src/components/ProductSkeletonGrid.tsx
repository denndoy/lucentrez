export function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-none border border-border bg-card">
          <div className="aspect-[4/5] animate-pulse bg-zinc-200" />
          <div className="space-y-2 p-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
