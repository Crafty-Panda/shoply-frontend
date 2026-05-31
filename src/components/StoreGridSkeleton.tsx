export function StoreGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-md border border-border bg-card"
        >
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-2.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
