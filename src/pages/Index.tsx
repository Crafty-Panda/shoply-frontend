import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "@/lib/airtable";
import {
  emptyFilters,
  filterStores,
  formatSearchSummary,
  hasActiveSearch,
  matchCountLabel,
  popularNiches,
  uniqueValues,
  type FilterState,
} from "@/lib/stores";
import { SearchTrigger } from "@/components/SearchTrigger";
import { SearchOverlay } from "@/components/SearchOverlay";
import { PopularChips } from "@/components/PopularChips";
import { StoreGrid } from "@/components/StoreGrid";
import { StoreList } from "@/components/StoreList";
import { StoreGridSkeleton } from "@/components/StoreGridSkeleton";
import { StoreListSkeleton } from "@/components/StoreListSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const Index = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlaySection, setOverlaySection] = useState<"what" | "where" | "budget">("what");
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(emptyFilters);
  const [appliedKeywords, setAppliedKeywords] = useState("");
  const [draftFilters, setDraftFilters] = useState<FilterState>(emptyFilters);
  const [draftKeywords, setDraftKeywords] = useState("");
  const { handles: recentHandles } = useRecentlyViewed();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo(() => (stores ? uniqueValues(stores, "category") : []), [stores]);
  const areas = useMemo(() => (stores ? uniqueValues(stores, "area") : []), [stores]);
  const popular = useMemo(() => (stores ? popularNiches(stores) : []), [stores]);

  const visible = useMemo(
    () => (stores ? filterStores(stores, appliedKeywords, appliedFilters) : []),
    [stores, appliedKeywords, appliedFilters],
  );

  const recentStores = useMemo(() => {
    if (!stores) return [];
    return recentHandles
      .map((h) => stores.find((s) => s.handle === h))
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [stores, recentHandles]);

  const searchApplied = hasActiveSearch(appliedFilters, appliedKeywords);
  const summary = formatSearchSummary(appliedFilters, appliedKeywords);
  const showRecent = !searchApplied && recentStores.length > 0;
  const searchTerm = appliedKeywords.trim() || undefined;

  const openOverlay = (section: "what" | "where" | "budget" = "what") => {
    setDraftFilters(appliedFilters);
    setDraftKeywords(appliedKeywords);
    setOverlaySection(section);
    setOverlayOpen(true);
  };

  const handleApplySearch = () => {
    setAppliedFilters(draftFilters);
    setAppliedKeywords(draftKeywords);
    setOverlayOpen(false);
  };

  const handlePopularCategory = (category: string) => {
    setDraftFilters({ ...emptyFilters, categories: category });
    setDraftKeywords("");
    setOverlaySection("what");
    setOverlayOpen(true);
  };

  const clearSearch = () => {
    setAppliedFilters(emptyFilters);
    setAppliedKeywords("");
    setDraftFilters(emptyFilters);
    setDraftKeywords("");
  };

  const renderEmpty = () => {
    if (searchApplied) {
      return (
        <EmptyState
          message={
            summary
              ? `No stores for "${summary}" — try fewer filters or a broader term.`
              : "No stores match — try widening your search."
          }
          actions={[
            { label: "Edit search", onClick: () => openOverlay(), variant: "outline" },
            { label: "Clear search", onClick: clearSearch },
          ]}
        />
      );
    }
    return (
      <EmptyState
        message="No stores to show yet."
        actions={[]}
      />
    );
  };

  const renderResults = () => {
    if (isLoading) {
      return searchApplied ? <StoreListSkeleton /> : <StoreGridSkeleton />;
    }
    if (visible.length === 0) {
      return renderEmpty();
    }
    if (searchApplied) {
      return <StoreList stores={visible} searchTerm={searchTerm} />;
    }
    return <StoreGrid stores={visible} searchTerm={searchTerm} />;
  };

  return (
    <>
      <main className="mx-auto min-h-screen w-full max-w-xl bg-background px-4 pb-16 pt-6">
        <header className="mb-4">
          <h1 className="text-lg font-bold tracking-tight text-logo">shoply</h1>
        </header>

        <div className="space-y-3">
          <SearchTrigger summary={summary || undefined} onOpen={() => openOverlay()} />
          {!searchApplied && <PopularChips categories={popular} onSelect={handlePopularCategory} />}
        </div>

        <div className="mt-5 space-y-5">
          {showRecent && <RecentlyViewed stores={recentStores} />}

          <section>
            {searchApplied && visible.length > 0 && !isLoading && (
              <div className="mb-2.5 flex items-baseline justify-between">
                <p className="text-xs font-semibold text-foreground">
                  {matchCountLabel(visible.length)}
                </p>
                <button
                  type="button"
                  onClick={() => openOverlay()}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Edit search
                </button>
              </div>
            )}

            {!searchApplied && !isLoading && stores && (
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-micro text-muted-foreground">
                {visible.length} stores
              </p>
            )}

            {searchApplied && visible.length === 0 && !isLoading && (
              <p className="mb-2.5 text-xs font-semibold text-foreground">
                {matchCountLabel(0)}
              </p>
            )}

            {renderResults()}
          </section>
        </div>
      </main>

      {stores && (
        <SearchOverlay
          open={overlayOpen}
          stores={stores}
          draftFilters={draftFilters}
          draftKeywords={draftKeywords}
          onDraftFiltersChange={setDraftFilters}
          onDraftKeywordsChange={setDraftKeywords}
          onSearch={handleApplySearch}
          onClose={() => setOverlayOpen(false)}
          categories={categories}
          areas={areas}
          initialSection={overlaySection}
        />
      )}
    </>
  );
};

export default Index;
