import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  summary?: string;
  onOpen: () => void;
}

export function SearchTrigger({ summary, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative flex h-12 w-full items-center gap-2.5 rounded-md border border-border bg-card px-3.5 text-left transition hover:border-foreground/30"
      aria-label={summary ? `Search: ${summary}` : "Search stores"}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
      <span
        className={cn(
          "flex-1 truncate text-base",
          summary ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {summary || "Search stores or styles"}
      </span>
    </button>
  );
}
