import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Instagram, MapPin } from "lucide-react";
import { fetchStoreByHandle } from "@/lib/airtable";
import { buildIgDmUrl, buildIgMessage, copyIgMessage } from "@/lib/instagram";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ShareButton } from "@/components/ShareButton";
import { Lightbox } from "@/components/Lightbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const StoreProfile = () => {
  const { handle = "" } = useParams();
  const [params] = useSearchParams();
  const searchTerm = params.get("q");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [igDialogOpen, setIgDialogOpen] = useState(false);
  const [igDialogCopied, setIgDialogCopied] = useState(true);
  const { add } = useRecentlyViewed();

  const { data: store, isLoading } = useQuery({
    queryKey: ["store", handle],
    queryFn: () => fetchStoreByHandle(handle),
    enabled: !!handle,
  });

  useEffect(() => {
    if (store) add(store.handle);
  }, [store, add]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl bg-background">
        <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
        <div className="space-y-3 p-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center bg-background p-8 text-center">
        <p className="text-foreground">Store not found.</p>
        <Link to="/" className="mt-4 text-sm text-foreground underline">
          Back to directory
        </Link>
      </main>
    );
  }

  const suggestedMessage = buildIgMessage(searchTerm);
  const igUrl = buildIgDmUrl(store.handle);

  const handleInstagramMessage = async () => {
    const copied = await copyIgMessage(searchTerm);
    setIgDialogCopied(copied);
    setIgDialogOpen(true);
  };

  const handleIgDialogOk = () => {
    setIgDialogOpen(false);
    window.location.assign(igUrl);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl bg-background pb-28">
      <div className="relative">
        <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
          <img
            src={store.coverImage}
            alt={`${store.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/"
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-card/95 text-foreground backdrop-blur transition active:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <ShareButton title={`${store.name} on Shoply`} text={store.description} />
        </div>
      </div>

      <section className="space-y-4 px-4 pt-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {store.name}
            </h1>
            {store.verified && (
              <BadgeCheck
                className="h-5 w-5 text-muted-foreground"
                strokeWidth={2.2}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">@{store.handle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            {store.area}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-xs font-medium">
              ₵
            </span>
            {store.priceRange}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-foreground">
          {store.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[...store.categories, ...store.styleTags].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 px-4">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-micro text-muted-foreground">
          Gallery
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {store.gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(src)}
              className="aspect-square overflow-hidden rounded-md border border-border bg-muted transition active:opacity-90"
            >
              <img
                src={src}
                alt={`${store.name} gallery ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-sticky backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-md text-sm font-semibold"
            onClick={handleInstagramMessage}
          >
            <Instagram className="mr-2 h-4 w-4" />
            Message on Instagram
          </Button>
        </div>
      </div>

      <AlertDialog open={igDialogOpen} onOpenChange={setIgDialogOpen}>
        <AlertDialogContent className="mx-auto max-w-sm rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {igDialogCopied ? "We copied your message!" : "Almost there — copy this"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {igDialogCopied
                ? "Hey — we're making it easier to DM your seller. Your message is already copied! When Instagram opens, just paste it into the chat and hit send."
                : "We couldn't copy automatically, but no worries — select the message below, copy it, then paste it into the chat when Instagram opens."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="rounded-md border border-border bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground">
            {suggestedMessage}
          </p>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-11 w-full rounded-md"
              onClick={handleIgDialogOk}
            >
              {igDialogCopied ? "Open Instagram" : "Got it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </main>
  );
};

export default StoreProfile;
