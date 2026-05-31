import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import type { Store } from "@/lib/stores";

interface Props {
  store: Store;
  searchTerm?: string;
  compact?: boolean;
}

export function StoreCard({ store, searchTerm, compact }: Props) {
  const to = searchTerm
    ? `/store/${store.handle}?q=${encodeURIComponent(searchTerm)}`
    : `/store/${store.handle}`;

  return (
    <Link
      to={to}
      className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition active:opacity-90"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={store.coverImage}
          alt={`${store.name} cover`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 md:group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {store.name}
          </h3>
          {store.verified && (
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-primary"
              strokeWidth={2.2}
              aria-label="Verified"
            />
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="truncate">{store.niche[0]}</span>
          <span aria-hidden>·</span>
          <span>{store.priceRange}</span>
        </div>
        {!compact && (
          <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
            {store.description}
          </p>
        )}
      </div>
    </Link>
  );
}
