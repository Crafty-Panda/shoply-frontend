import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/airtable";
const BASE_ID = "appGsYhCDLAZMUZtl";
const TABLE_NAME = "store listings";

interface AirtableAttachment {
  url: string;
  thumbnails?: { large?: { url: string }; full?: { url: string } };
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

function mapPriceRange(v: unknown): "Budget" | "Mid-range" | "Premium" {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("premium")) return "Premium";
  if (s.includes("budget")) return "Budget";
  return "Mid-range";
}

function mapFollowerTier(v: unknown): "Micro" | "Small" | "Growing" | "Established" {
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

function mapRecord(r: AirtableRecord) {
  const f = r.fields;
  const handle = String(f["Instagram handle"] ?? "").replace(/^@/, "").trim();
  const name = String(f["Store name"] ?? "Untitled");
  const cover = Array.isArray(f["Cover image"]) ? (f["Cover image"] as AirtableAttachment[])[0] : null;
  const galleryRaw = Array.isArray(f["Gallery images"]) ? (f["Gallery images"] as AirtableAttachment[]) : [];
  const niche = Array.isArray(f["Niche"]) ? (f["Niche"] as string[]) : [];
  const styleTags = Array.isArray(f["Style tags"]) ? (f["Style tags"] as string[]) : [];

  return {
    id: r.id,
    name,
    handle: handle || slugify(name),
    niche,
    styleTags,
    priceRange: mapPriceRange(f["Price range"]),
    area: String(f["Area"] ?? "Online only"),
    description: String(f["Short description"] ?? ""),
    coverImage: cover ? attachmentUrl(cover) : "",
    gallery: galleryRaw.map(attachmentUrl).filter(Boolean),
    followerTier: mapFollowerTier(f["Follower tier"]),
    verified: Boolean(f["Verified"]),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!AIRTABLE_API_KEY) throw new Error("AIRTABLE_API_KEY is not configured");

    const records: AirtableRecord[] = [];
    let offset: string | undefined;
    const tablePath = encodeURIComponent(TABLE_NAME);

    do {
      const params = new URLSearchParams({
        filterByFormula: "{Active}",
        pageSize: "100",
      });
      if (offset) params.set("offset", offset);

      const url = `${GATEWAY_URL}/v0/${BASE_ID}/${tablePath}?${params}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": AIRTABLE_API_KEY,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Airtable call failed [${res.status}]: ${JSON.stringify(data)}`);
      }
      records.push(...(data.records ?? []));
      offset = data.offset;
    } while (offset);

    const stores = records.map(mapRecord).filter((s) => s.coverImage);

    return new Response(JSON.stringify({ stores }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("get-stores error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
