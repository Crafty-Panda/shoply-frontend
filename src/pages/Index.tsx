import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "@/lib/airtable";
import {
  emptyFilters,
  filterStores,
  hasActiveFilters,
  uniqueValues,
  type FilterState,
} from "@/lib/stores";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
import { StoreGrid } from "@/components/StoreGrid";
import { StoreGridSkeleton } from "@/components/StoreGridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const Index = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const { handles: recentHandles } = useRecentlyViewed();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    staleTime: 1000 * 60 * 5,
  });

  const niches = useMemo(() => (stores ? uniqueValues(stores, "niche") : []), [stores]);
  const areas = useMemo(() => (stores ? uniqueValues(stores, "area") : []), [stores]);

  const visible = useMemo(
    () => (stores ? filterStores(stores, search, filters) : []),
    [stores, search, filters],
  );

  const recentStores = useMemo(() => {
    if (!stores) return [];
    return recentHandles
      .map((h) => stores.find((s) => s.handle === h))
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [stores, recentHandles]);

  const filtersActive = hasActiveFilters(filters);
  const searchActive = search.trim().length > 0;
  const showRecent = !searchActive && !filtersActive && recentStores.length > 0;

  const renderEmpty = () => {
    if (searchActive && filtersActive) {
      return (
        <EmptyState
          message="Nothing matched — try removing a filter or searching something broader."
          actions={[
            {
              label: "Clear filters",
              onClick: () => setFilters(emptyFilters),
              variant: "outline",
            },
            {
              label: "Reset all",
              onClick: () => {
                setFilters(emptyFilters);
                setSearch("");
              },
            },
          ]}
        />
      );
    }
    if (searchActive) {
      return (
        <EmptyState
          message="We don't have a store for that yet — try browsing by category."
          actions={[{ label: "Clear search", onClick: () => setSearch("") }]}
        />
      );
    }
    return (
      <EmptyState
        message="No stores match those filters yet — try widening your search."
        actions={[
          { label: "Clear filters", onClick: () => setFilters(emptyFilters) },
        ]}
      />
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-background px-4 pb-16 pt-6">
      <header className="mb-5 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Shoply
        </h1>
        <p className="text-[11px] text-muted-foreground">Accra · Instagram stores</p>
      </header>

      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <FilterChips
          filters={filters}
          onChange={setFilters}
          niches={niches}
          areas={areas}
        />
      </div>

      <div className="mt-6 space-y-6">
        {showRecent && <RecentlyViewed stores={recentStores} />}

        <section>
          {isLoading ? (
            <StoreGridSkeleton />
          ) : visible.length === 0 ? (
            renderEmpty()
          ) : (
            <StoreGrid stores={visible} searchTerm={search.trim() || undefined} />
          )}
        </section>
      </div>
    </main>
  );
};

export default Index;
