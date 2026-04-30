export function buildIgDeepLink(handle: string, searchTerm?: string | null): string {
  const cleanHandle = handle.replace(/^@/, "");
  const message = searchTerm && searchTerm.trim()
    ? `Hi, I found you on Shoply and I'm looking for ${searchTerm.trim()} — do you have any available?`
    : `Hi, I found you on Shoply and I'd love to see what you have available`;
  return `https://ig.me/m/${cleanHandle}?text=${encodeURIComponent(message)}`;
}
