import type { Store } from "@/lib/stores";
import { StoreCard } from "./StoreCard";

interface Props {
  stores: Store[];
  searchTerm?: string;
}

export function StoreGrid({ stores, searchTerm }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stores.map((s) => (
        <StoreCard key={s.id} store={s} searchTerm={searchTerm} />
      ))}
    </div>
  );
}
