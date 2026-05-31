import type { Store } from "@/lib/stores";
import { StoreListRow } from "./StoreListRow";

interface Props {
  stores: Store[];
  searchTerm?: string;
}

export function StoreList({ stores, searchTerm }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {stores.map((s) => (
        <StoreListRow key={s.id} store={s} searchTerm={searchTerm} />
      ))}
    </div>
  );
}
