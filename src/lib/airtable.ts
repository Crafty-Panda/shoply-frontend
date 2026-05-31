import type { Store } from "./stores";
import fallbackCoverImage from "@/data/placeholder-store.png";

/**
 * Loads stores from Airtable’s Web API. Field layout must match below.
 *
 * | Store field | Airtable field name   |
 * |------------|-----------------------|
 * | name       | Store name            |
 * | handle     | Instagram handle      |
 * | niche      | Niche                 |
 * | styleTags  | Style tags             |
 * | priceRange | Price range           |
 * | area       | Area                   |
 * | description| Short description     |
 * | coverImage | Cover image (attach.) |
 * | gallery    | Gallery images         |
 * | followerTier | Follower tier       |
 * | verified   | Verified               |
 * | —          | Active (filter)        |
 *
 * Tokens in `VITE_*` ship in the JS bundle — use a scoped read-only PAT and revoke if leaked.
 */

const DEFAULT_API_ROOT = "https://api.airtable.com/v0";
const FALLBACK_COVER_IMAGE = fallbackCoverImage;

interface AirtableAttachment {
  url: string;
  thumbnails?: { large?: { url: string }; full?: { url: string } };
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

function getConfig(): { token: string; baseId: string; tableName: string; apiRoot: string } {
  const token =
    import.meta.env.VITE_AIRTABLE_TOKEN?.trim() ||
    import.meta.env.VITE_AIRTABLE_API_KEY?.trim();
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID?.trim();
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME?.trim();
  const apiRoot = (import.meta.env.VITE_AIRTABLE_API_BASE?.trim() || DEFAULT_API_ROOT).replace(
    /\/$/,
    "",
  );
  if (!token) {
    throw new Error("Set VITE_AIRTABLE_TOKEN (or VITE_AIRTABLE_API_KEY) in .env");
  }
  if (!baseId) throw new Error("Set VITE_AIRTABLE_BASE_ID in .env");
  if (!tableName) throw new Error("Set VITE_AIRTABLE_TABLE_NAME in .env");
  return { token, baseId, tableName, apiRoot };
}

/** Airtable string literals escape `'` as `''`. */
function airtableFormulaString(s: string): string {
  return s.replace(/'/g, "''");
}

function mapPriceRange(v: unknown): Store["priceRange"] {
  const str = String(v ?? "").toLowerCase();
  if (str.includes("premium")) return "Premium";
  if (str.includes("budget")) return "Budget";
  return "Mid-range";
}

function mapFollowerTier(v: unknown): Store["followerTier"] {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("established") || s.includes("10k+")) return "Established";
  if (s.includes("growing") || s.includes("1k-10k")) return "Growing";
  if (s.includes("small") || s.includes("under 1k")) return "Small";
  return "Micro";
}

function attachmentUrl(a: AirtableAttachment): string {
  return a?.thumbnails?.large?.url ?? a?.url ?? "";
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stringList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return (v as unknown[]).map(String).filter((x) => x.length > 0);
  }
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function mapRecord(r: AirtableRecord): Store {
  const f = r.fields;
  const handle = String(f["Instagram handle"] ?? "").replace(/^@/, "").trim();
  const name = String(f["Store name"] ?? "Untitled");
  const cover = Array.isArray(f["Cover image"]) ? (f["Cover image"] as AirtableAttachment[])[0] : null;
  const galleryRaw = Array.isArray(f["Gallery images"]) ? (f["Gallery images"] as AirtableAttachment[]) : [];

  return {
    id: r.id,
    name,
    handle: handle || slugify(name),
    niche: stringList(f["Niche"]),
    styleTags: stringList(f["Style tags"]),
    priceRange: mapPriceRange(f["Price range"]),
    area: String(f["Area"] ?? "Online only"),
    description: String(f["Short description"] ?? ""),
    coverImage: cover ? attachmentUrl(cover) : FALLBACK_COVER_IMAGE,
    gallery: galleryRaw.map(attachmentUrl).filter(Boolean),
    followerTier: mapFollowerTier(f["Follower tier"]),
    verified: Boolean(f["Verified"]),
  };
}

async function fetchRecordPages(filterByFormula: string): Promise<AirtableRecord[]> {
  const { token, baseId, tableName, apiRoot } = getConfig();
  const tablePath = encodeURIComponent(tableName);
  const out: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ filterByFormula, pageSize: "100" });
    if (offset) params.set("offset", offset);
    const url = `${apiRoot}/${baseId}/${tablePath}?${params}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Airtable error [${res.status}]: ${JSON.stringify(data)}`);
    }
    out.push(...(data.records ?? []));
    offset = data.offset as string | undefined;
  } while (offset);

  return out;
}

export async function fetchStores(): Promise<Store[]> {
  const records = await fetchRecordPages("{Active}");
  return records
    .map(mapRecord)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

export async function fetchStoreByHandle(rawHandle: string): Promise<Store | null> {
  const lowered = rawHandle.replace(/^@/, "").trim().toLowerCase();
  if (!lowered) return null;
  const lit = airtableFormulaString(lowered);
  const formula = `AND({Active}, LOWER(TRIM(SUBSTITUTE({Instagram handle}, "@", ""))) = '${lit}')`;
  const records = await fetchRecordPages(formula);
  const mapped = records.map(mapRecord);
  if (mapped.length === 0) return null;
  return mapped[0] ?? null;
}
