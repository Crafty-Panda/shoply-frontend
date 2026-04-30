import { useCallback, useEffect, useState } from "react";

const KEY = "shoply:recentlyViewed";
const MAX = 6;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    setHandles(read());
  }, []);

  const add = useCallback((handle: string) => {
    setHandles((prev) => {
      const next = [handle, ...prev.filter((h) => h !== handle)].slice(0, MAX);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { handles, add };
}
