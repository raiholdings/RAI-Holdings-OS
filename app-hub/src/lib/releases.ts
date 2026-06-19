// releases.json is the single source of truth for the hub & desktop auto-update.
// (docs/rai-app-hub-spec.md §4). The hub only READS it — never hardcode downloads.

export type Artifact = { url: string; size?: string };
export type StoreEntry = { store_url?: string; apk_url?: string; install?: boolean };

export type Releases = {
  version: string;
  released_at: string;
  notes_url?: string;
  platforms: {
    windows?: Record<string, Artifact>;
    macos?: Record<string, Artifact>;
    linux?: Record<string, Artifact>;
    ios?: StoreEntry;
    android?: StoreEntry;
    chrome?: StoreEntry;
    edge?: StoreEntry;
    firefox?: StoreEntry;
    safari?: StoreEntry;
    pwa?: StoreEntry;
  };
  changelog?: { version: string; released_at: string; notes: string[] }[];
};

let cache: Releases | null = null;

export async function loadReleases(): Promise<Releases> {
  if (cache) return cache;
  const res = await fetch("/releases.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Không tải được releases.json");
  cache = (await res.json()) as Releases;
  return cache;
}
