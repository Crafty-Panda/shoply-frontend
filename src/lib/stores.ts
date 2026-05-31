export type PriceRange = "Budget" | "Mid-range" | "Premium";
export type FollowerTier = "Micro" | "Small" | "Growing" | "Established";

export interface Store {
  id: string;
  name: string;
  handle: string; // without @
  categories: string[];
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
  categories: string | null;
  priceRange: PriceRange | null;
  area: string | null;
}

export const emptyFilters: FilterState = {
  categories: null,
  priceRange: null,
  area: null,
};

export function hasActiveFilters(f: FilterState): boolean {
  return !!(f.categories || f.priceRange || f.area);
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
        ...s.categories,
        ...s.styleTags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.categories && !s.categories.includes(filters.categories)) return false;
    if (filters.priceRange && s.priceRange !== filters.priceRange) return false;
    if (filters.area && s.area !== filters.area) return false;
    return true;
  });
}

export function uniqueValues(stores: Store[], key: "category" | "area"): string[] {
  const set = new Set<string>();
  stores.forEach((s) => {
    if (key === "category") s.categories.forEach((n) => set.add(n));
    else set.add(s.area);
  });
  return Array.from(set).sort();
}

export const PRICE_RANGES: PriceRange[] = ["Budget", "Mid-range", "Premium"];

export function matchCountLabel(count: number): string {
  return count === 1 ? "1 store matches" : `${count} stores match`;
}

export function hasActiveSearch(filters: FilterState, keywords: string): boolean {
  return hasActiveFilters(filters) || keywords.trim().length > 0;
}

/** Summary shown in the search trigger after a search is applied. */
export function formatSearchSummary(filters: FilterState, keywords: string): string {
  const parts: string[] = [];
  if (keywords.trim()) parts.push(keywords.trim());
  if (filters.categories) parts.push(filters.categories);
  if (filters.area) parts.push(filters.area);
  if (filters.priceRange) parts.push(filters.priceRange);
  return parts.join(" · ");
}

/** Top niches by store count for quick browse chips. */
export function popularNiches(stores: Store[], limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const s of stores) {
    for (const n of s.categories) {
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([n]) => n);
}
