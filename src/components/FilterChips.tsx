import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PRICE_RANGES, type FilterState, type PriceRange } from "@/lib/stores";

type FilterKey = "niche" | "priceRange" | "area";

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  niches: string[];
  areas: string[];
}

const LABELS: Record<FilterKey, string> = {
  niche: "Niche",
  priceRange: "Price",
  area: "Area",
};

export function FilterChips({ filters, onChange, niches, areas }: Props) {
  const [open, setOpen] = useState<FilterKey | null>(null);

  const optionsFor = (key: FilterKey): string[] => {
    if (key === "niche") return niches;
    if (key === "area") return areas;
    return PRICE_RANGES;
  };

  const select = (key: FilterKey, value: string | null) => {
    if (key === "priceRange") {
      onChange({ ...filters, priceRange: value as PriceRange | null });
    } else {
      onChange({ ...filters, [key]: value });
    }
    setOpen(null);
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {(Object.keys(LABELS) as FilterKey[]).map((key) => {
          const value = filters[key];
          const active = !!value;
          return (
            <div key={key} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setOpen(key)}
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/20",
                )}
              >
                <span>{active ? value : LABELS[key]}</span>
                {active ? (
                  <span
                    role="button"
                    aria-label={`Clear ${LABELS[key]} filter`}
                    onClick={(e) => {
                      e.stopPropagation();
                      select(key, null);
                    }}
                    className="rounded-full p-0.5 hover:bg-primary-foreground/20"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border bg-card p-0">
          <SheetHeader className="px-6 pt-6 pb-2 text-left">
            <SheetTitle className="text-base font-semibold">
              {open ? LABELS[open] : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="max-h-[60vh] overflow-y-auto px-3 pb-8 pt-2">
            {open && (
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => select(open, null)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition",
                      !filters[open]
                        ? "bg-secondary text-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <span>Any {LABELS[open].toLowerCase()}</span>
                  </button>
                </li>
                {optionsFor(open).map((opt) => {
                  const selected = filters[open] === opt;
                  return (
                    <li key={opt}>
                      <button
                        onClick={() => select(open, opt)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary",
                        )}
                      >
                        <span>{opt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
