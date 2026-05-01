import type { Store } from "./stores";
import { supabase } from "@/integrations/supabase/client";

export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase.functions.invoke("get-stores");
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return (data?.stores ?? []) as Store[];
}

export async function fetchStoreByHandle(handle: string): Promise<Store | null> {
  const all = await fetchStores();
  return all.find((s) => s.handle === handle) ?? null;
}
