import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import type { Store } from "@/lib/stores";

interface Props {
  store: Store;
  searchTerm?: string;
}

export function StoreListRow({ store, searchTerm }: Props) {
  const to = searchTerm
    ? `/store/${store.handle}?q=${encodeURIComponent(searchTerm)}`
    : `/store/${store.handle}`;

  return (
    <Link
      to={to}
      className="group flex overflow-hidden rounded-md border border-border bg-card transition active:opacity-90"
    >
      <div className="w-[72px] shrink-0 bg-muted">
        <img
          src={store.coverImage}
          alt={`${store.name} cover`}
          loading="lazy"
          className="h-full min-h-[72px] w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-center gap-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {store.name}
          </h3>
          {store.verified && (
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={2.2}
              aria-label="Verified"
            />
          )}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {store.categories[0]} · {store.area} · {store.priceRange}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground/80">
          {store.description}
        </p>
      </div>
    </Link>
  );
}
