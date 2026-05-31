export function buildIgMessage(searchTerm?: string | null): string {
  if (searchTerm?.trim()) {
    return `Hi, I found you on Shoply and I'm looking for ${searchTerm.trim()} — do you have any available?`;
  }
  return `Hi, I found you on Shoply and I'd love to see what you have available`;
}

export function buildIgDmUrl(handle: string): string {
  const cleanHandle = handle.replace(/^@/, "").trim();
  return `https://ig.me/m/${cleanHandle}`;
}

export async function copyIgMessage(searchTerm?: string | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildIgMessage(searchTerm));
    return true;
  } catch {
    return false;
  }
}
