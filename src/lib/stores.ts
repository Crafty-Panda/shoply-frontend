export type PriceRange = "Budget" | "Mid-range" | "Premium";
export type FollowerTier = "Micro" | "Small" | "Growing" | "Established";

export interface Store {
  id: string;
  name: string;
  handle: string; // without @
  niche: string[];
  styleTags: string[];
  priceRange: PriceRange;
  area: string; // Accra area
  description: string;
  coverImage: string;
  gallery: string[];
  followerTier: FollowerTier;
  verified: boolean;
}

export interface FilterState {
  niche: string | null;
  priceRange: PriceRange | null;
  area: string | null;
}

export const emptyFilters: FilterState = {
  niche: null,
  priceRange: null,
  area: null,
};

export function hasActiveFilters(f: FilterState): boolean {
  return !!(f.niche || f.priceRange || f.area);
}

export function filterStores(
  stores: Store[],
  search: string,
  filters: FilterState,
): Store[] {
  const q = search.trim().toLowerCase();
  return stores.filter((s) => {
    if (q) {
      const haystack = [
        s.name,
        s.description,
        ...s.niche,
        ...s.styleTags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.niche && !s.niche.includes(filters.niche)) return false;
    if (filters.priceRange && s.priceRange !== filters.priceRange) return false;
    if (filters.area && s.area !== filters.area) return false;
    return true;
  });
}

export function uniqueValues(stores: Store[], key: "niche" | "area"): string[] {
  const set = new Set<string>();
  stores.forEach((s) => {
    if (key === "niche") s.niche.forEach((n) => set.add(n));
    else set.add(s.area);
  });
  return Array.from(set).sort();
}

export const PRICE_RANGES: PriceRange[] = ["Budget", "Mid-range", "Premium"];
