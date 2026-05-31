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
        <Link to="/" className="mt-4 text-sm text-primary underline">
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition active:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <ShareButton title={`${store.name} on Shoply`} text={store.description} />
        </div>
      </div>

      <section className="space-y-4 px-4 pt-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {store.name}
            </h1>
            {store.verified && (
              <BadgeCheck className="h-5 w-5 text-primary" strokeWidth={2.2} />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">@{store.handle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {store.area}
          </span>
          <span aria-hidden>·</span>
          <span>{store.priceRange}</span>
        </div>

        <p className="text-[15px] leading-relaxed text-foreground">
          {store.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {[...store.niche, ...store.styleTags].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 px-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-micro text-muted-foreground">
          Gallery
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {store.gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(src)}
              className="aspect-square overflow-hidden rounded-2xl bg-muted shadow-soft transition active:opacity-90"
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

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-sticky backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-full text-sm font-semibold"
            onClick={handleInstagramMessage}
          >
            <Instagram className="mr-2 h-4 w-4" />
            Message on Instagram
          </Button>
        </div>
      </div>

      <AlertDialog open={igDialogOpen} onOpenChange={setIgDialogOpen}>
        <AlertDialogContent className="mx-auto max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {igDialogCopied ? "Message copied" : "Copy this message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {igDialogCopied
                ? "Paste it in the chat when Instagram opens, then tap Send."
                : "We couldn't copy automatically — select and copy the message below."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="rounded-xl bg-secondary px-4 py-3 text-sm leading-relaxed text-foreground">
            {suggestedMessage}
          </p>
          <AlertDialogFooter>
            <AlertDialogAction
              className="h-11 w-full rounded-full"
              onClick={handleIgDialogOk}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </main>
  );
};

export default StoreProfile;
