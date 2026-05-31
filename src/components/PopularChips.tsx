interface Props {
  categories: string[];
  onSelect: (niche: string) => void;
}

export function PopularChips({ categories, onSelect }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">Popular</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
