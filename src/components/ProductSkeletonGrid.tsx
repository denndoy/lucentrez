export function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden bg-card">
          <div className="h-[320px] animate-pulse bg-zinc-200 sm:h-[360px] lg:h-[420px]" />
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
