# Shoply — Build Plan

A mobile-first web app that helps buyers in Accra discover small Instagram clothing stores. Two pages, no accounts, one CTA: message the store on Instagram.

## Visual direction

Modern & soft aesthetic.

- **Background:** warm off-white (`#FAF8F5`)
- **Surface/cards:** pure white with subtle shadow, rounded-2xl corners
- **Text:** near-black ink (`#1A1A1A`) on background, soft muted gray for secondary
- **Accent:** a single warm tone (deep terracotta `#C2410C`-ish) used sparingly — verified badge, active chips, sticky CTA
- **Type:** Inter for everything, generous letter spacing on small caps tags
- **Motion:** gentle fades, no bounce; bottom sheet slides up smoothly
- All tokens added to `index.css` and `tailwind.config.ts` as semantic HSL variables

## Page 1 — Directory (`/`)

Layout top to bottom:

1. **Header** — "Shoply" wordmark, tiny tagline ("Small Accra stores, big style")
2. **Search bar** — rounded, soft shadow, leading search icon, clear (×) button when text present. Live filtering as user types (debounced ~150ms).
3. **Filter chip row** — three chips: Niche, Price, Area. Each chip shows its label, or the selected value + a small × to clear. Tapping a chip opens a **bottom sheet** with the options (single-select per filter for v1; multi-select can come later). Active chips use the accent color.
4. **Recently viewed** (only renders if localStorage has entries and no search/filter is active) — horizontal scroll row of small cards, "Recently viewed" heading.
5. **Store grid** — 2-column grid, square cover image on top, store name + verified tick inline, niche tag + price range below, one-line description truncated. Tap → profile.
6. **Skeleton state** — same grid shape, shimmering placeholders while data loads.

### Empty states

Three distinct messages depending on whether search / filters / both are active:

- Search only, no results → "We don't have a store for that yet — try browsing by category." Button: *Clear search*.
- Filters only, no results → "No stores match those filters yet — try widening your search." Button: *Clear filters*.
- Search + filters, no results → "Nothing matched — try removing a filter or searching something broader." Two buttons: *Clear filters* (keep search) and *Reset all*.

### Filtering logic

- Search matches against store name, description, niche, and style tags (case-insensitive substring).
- Filters AND together with search; filters AND with each other.

## Page 2 — Store profile (`/store/:handle`)

- Back arrow top-left
- Hero cover image (full-width, ~16:10)
- Store name + verified badge
- Niche tags + style tags as small pills
- Price range and Accra area as a small meta row
- Short description paragraph
- Image gallery — 2-column grid of gallery images, tappable to open a lightbox (simple full-screen overlay)
- Small share button in the top-right of the header — uses Web Share API if available, otherwise copies the profile URL to clipboard with a toast confirmation
- **Sticky bottom CTA**: "Message on Instagram" — full-width, accent color, opens `https://ig.me/m/{handle}?text={encoded message}`

### Pre-filled message

Read from URL params (`?q=...` carrying the search term used on the directory):

- If `q` is present: `"Hi, I found you on Shoply and I'm looking for {q} — do you have any available?"`
- Otherwise: `"Hi, I found you on Shoply and I'd love to see what you have available"`

When navigating from a card, the directory passes its current search term through the URL so the message stays accurate.

## Data layer

Airtable infrastructure stubbed but not wired:

- `src/lib/stores.ts` exports a `Store` TypeScript type matching the Airtable schema (name, handle, niche[], styleTags[], priceRange, area, description, coverImage, gallery[], followerTier, verified).
- `src/lib/airtable.ts` exports `fetchStores()` — currently returns dummy data from `src/data/dummyStores.ts` (12–15 realistic Accra-flavored stores with Unsplash cover/gallery URLs). Function is async and shaped so swapping in a real Airtable fetch later is a one-file change.
- React Query (`useQuery`) wraps the fetch so skeleton states + caching come for free.
- `src/hooks/useRecentlyViewed.ts` reads/writes a small list of handles in localStorage (cap at 6).

## File changes

```text
src/
  pages/
    Index.tsx              ← Directory page
    StoreProfile.tsx       ← New profile page
  components/
    SearchBar.tsx
    FilterChips.tsx        ← chip row + bottom-sheet logic
    StoreCard.tsx
    StoreGrid.tsx
    StoreGridSkeleton.tsx
    EmptyState.tsx
    RecentlyViewed.tsx
    ShareButton.tsx
    Lightbox.tsx
  data/
    dummyStores.ts
  lib/
    airtable.ts            ← stub fetchStores()
    stores.ts              ← types + filter helpers
    instagram.ts           ← buildIgDeepLink(handle, searchTerm)
  hooks/
    useRecentlyViewed.ts
  App.tsx                  ← add /store/:handle route
  index.css                ← new color tokens, font import
tailwind.config.ts         ← extend with semantic tokens
```

## Out of scope (per brief)

No login, no cart, no transactions, no second CTA anywhere. Real Airtable wiring is intentionally deferred — the stub keeps the swap to one file.
