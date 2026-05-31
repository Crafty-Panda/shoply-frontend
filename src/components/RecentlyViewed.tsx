import { Link } from "react-router-dom";
import type { Store } from "@/lib/stores";

interface Props {
  stores: Store[];
}

export function RecentlyViewed({ stores }: Props) {
  if (stores.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-[10px] font-semibold uppercase tracking-micro text-muted-foreground">
        Recently viewed
      </h2>
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-none">
        {stores.map((s) => (
          <Link
            key={s.id}
            to={`/store/${s.handle}`}
            className="flex w-[52px] shrink-0 flex-col gap-1.5"
          >
            <div className="aspect-square overflow-hidden rounded-md border border-border bg-muted">
              <img
                src={s.coverImage}
                alt={s.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="truncate text-[10px] font-medium text-foreground">
              {s.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
