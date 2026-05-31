import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PRICE_RANGES,
  filterStores,
  type FilterState,
  type PriceRange,
  type Store,
} from "@/lib/stores";

type Section = "what" | "where" | "budget";

interface Props {
  open: boolean;
  stores: Store[];
  draftFilters: FilterState;
  draftKeywords: string;
  onDraftFiltersChange: (next: FilterState) => void;
  onDraftKeywordsChange: (next: string) => void;
  onSearch: () => void;
  onClose: () => void;
  categories: string[];
  areas: string[];
  initialSection?: Section;
}

function SectionCard({
  label,
  hint,
  value,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  hint: string;
  value?: string | null;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-card transition-colors",
        expanded ? "border-foreground" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 text-left"
      >
        <p className="text-[11px] font-semibold uppercase tracking-micro text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-[15px]",
            value ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {value || hint}
        </p>
      </button>
      {expanded && (
        <div className="border-t border-border px-4 pb-4">{children}</div>
      )}
    </div>
  );
}

function OptionChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function SearchOverlay({
  open,
  stores,
  draftFilters,
  draftKeywords,
  onDraftFiltersChange,
  onDraftKeywordsChange,
  onSearch,
  onClose,
  categories,
  areas,
  initialSection = "what",
}: Props) {
  const [expanded, setExpanded] = useState<Section | null>(initialSection);

  useEffect(() => {
    if (open) setExpanded(initialSection);
  }, [open, initialSection]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const matchCount = useMemo(
    () => filterStores(stores, draftKeywords, draftFilters).length,
    [stores, draftKeywords, draftFilters],
  );

  if (!open) return null;

  const toggle = (section: Section) => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  const setCategories = (categories: string | null) => {
    onDraftFiltersChange({ ...draftFilters, categories });
  };

  const setArea = (area: string | null) => {
    onDraftFiltersChange({ ...draftFilters, area });
  };

  const setPrice = (priceRange: PriceRange | null) => {
    onDraftFiltersChange({ ...draftFilters, priceRange });
  };

  const clearAll = () => {
    onDraftFiltersChange({ categories: null, priceRange: null, area: null });
    onDraftKeywordsChange("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Search</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <SectionCard
              label="What"
              hint="Style or category"
              value={draftFilters.categories ?? (draftKeywords.trim() || null)}
              expanded={expanded === "what"}
              onToggle={() => toggle("what")}
            >
              <Input
                value={draftKeywords}
                onChange={(e) => onDraftKeywordsChange(e.target.value)}
                placeholder="Optional keywords…"
                className="mt-3 h-11 rounded-md border-border"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((n) => (
                  <OptionChip
                    key={n}
                    label={n}
                    active={draftFilters.categories === n}
                    onClick={() =>
                      setCategories(draftFilters.categories === n ? null : n)
                    }
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              label="Where"
              hint="Area in Accra"
              value={draftFilters.area}
              expanded={expanded === "where"}
              onToggle={() => toggle("where")}
            >
              <div className="mt-3 flex flex-wrap gap-2">
                {areas.map((a) => (
                  <OptionChip
                    key={a}
                    label={a}
                    active={draftFilters.area === a}
                    onClick={() => setArea(draftFilters.area === a ? null : a)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              label="Budget"
              hint="Price range"
              value={draftFilters.priceRange}
              expanded={expanded === "budget"}
              onToggle={() => toggle("budget")}
            >
              <div className="mt-3 flex flex-wrap gap-2">
                {PRICE_RANGES.map((p) => (
                  <OptionChip
                    key={p}
                    label={p}
                    active={draftFilters.priceRange === p}
                    onClick={() =>
                      setPrice(draftFilters.priceRange === p ? null : p)
                    }
                  />
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="border-t border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear all
            </button>
            <Button
              type="button"
              onClick={onSearch}
              className="h-11 gap-2 rounded-md px-5 font-semibold"
            >
              <Search className="h-4 w-4" />
              Search · {matchCount} {matchCount === 1 ? "store" : "stores"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
