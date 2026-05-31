import { Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  title: string;
  text?: string;
}

export function ShareButton({ title, text }: Props) {
  const handle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* user cancelled or unsupported, fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied to clipboard" });
    } catch {
      toast({ description: "Couldn't copy link", variant: "destructive" });
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      aria-label="Share store"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-card/95 text-foreground backdrop-blur transition active:opacity-80"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
