import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}

interface Props {
  message: string;
  actions: Action[];
}

export function EmptyState({ message, actions }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-card px-6 py-12 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm text-foreground">{message}</p>
      {actions.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {actions.map((a, i) => (
            <Button
              key={i}
              onClick={a.onClick}
              variant={a.variant ?? "default"}
              className="rounded-md"
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
