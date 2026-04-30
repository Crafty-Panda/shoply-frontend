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
      className="flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition active:scale-95"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
