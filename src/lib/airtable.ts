import type { Store } from "./stores";
import { dummyStores } from "@/data/dummyStores";

/**
 * Fetch all stores. Currently returns dummy data.
 * When Airtable is wired up, replace the body with a fetch to the
 * Airtable API (via the connector gateway) and map records → Store.
 */
export async function fetchStores(): Promise<Store[]> {
  // simulate a tiny network delay so skeletons get a chance to flash
  await new Promise((r) => setTimeout(r, 250));
  return dummyStores;
}

export async function fetchStoreByHandle(handle: string): Promise<Store | null> {
  const all = await fetchStores();
  return all.find((s) => s.handle === handle) ?? null;
}
