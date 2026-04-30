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
    <div className="flex flex-col items-center justify-center rounded-3xl bg-card px-6 py-12 text-center shadow-soft">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <SearchX className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm text-foreground">{message}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {actions.map((a, i) => (
          <Button
            key={i}
            onClick={a.onClick}
            variant={a.variant ?? "default"}
            className="rounded-full"
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
