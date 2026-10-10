import { useMemo } from "react";
import { useGetListingsQuery } from "@/state/listing/api";
import type { Listing } from "@/types/listing.types";
import {
  MOCK_SHOWS,
  MOCK_EPISODES,
  type PodcastEpisode,
  type PodcastShow,
} from "./mockPodcasts";

// Implements docs/podcast-contract.md: maps live Tradly listings to podcast
// shows/episodes. Falls back to mocks when the workspace has no audio.

const AUDIO_RE = /\.(mp3|m4a|aac|wav|ogg)(\?.*)?$/i;

const EPISODE_TYPES = new Set(["digital", "information_listing"]);

function attrValue(l: Listing, names: string[]): string | undefined {
  const wanted = new Set(names.map((n) => n.toLowerCase()));
  for (const a of l.attributes ?? []) {
    if (!a || typeof a.name !== "string") continue;
    if (!wanted.has(a.name.toLowerCase())) continue;
    const v = a.values as unknown;
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v) && v.length > 0) {
      const first = v[0] as unknown;
      if (typeof first === "string") return first;
      if (typeof first === "number") return String(first);
      if (first && typeof first === "object") {
        const o = first as Record<string, unknown>;
        for (const k of ["value", "name", "title"]) {
          if (typeof o[k] === "string" && o[k]) return o[k] as string;
        }
      }
    }
  }
  const meta = (l as unknown as { metadata?: Record<string, unknown> }).metadata;
  if (meta) {
    for (const n of names) {
      const v = meta[n] ?? meta[n.toLowerCase()];
      if (typeof v === "string" && v) return v;
      if (typeof v === "number") return String(v);
    }
  }
  return undefined;
}

const toInt = (raw: string | undefined, fallback: number): number => {
  const n = raw !== undefined ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function isAudioListing(l: Listing): boolean {
  if (!EPISODE_TYPES.has(l.order_type)) return false;
  const url = l.videos?.[0];
  return typeof url === "string" && AUDIO_RE.test(url);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function listingToEpisode(l: Listing, indexInShow: number): PodcastEpisode | null {
  if (!isAudioListing(l)) return null;
  const durationSec = toInt(attrValue(l, ["duration_sec", "duration", "length_sec"]), 0);
  const explicitRaw = (attrValue(l, ["explicit", "is_explicit"]) ?? "").toLowerCase();
  void explicitRaw;
  const created = l.created_at ? new Date(l.created_at * 1000).toISOString().slice(0, 10) : "1970-01-01";
  return {
    id: l.id,
    slug: l.slug,
    showSlug: "", // filled by groupPodcasts
    title: l.title,
    description: stripHtml(l.description || "") || l.title,
    audioUrl: l.videos[0],
    durationSec,
    publishedAt: created,
    episodeNo: toInt(attrValue(l, ["episode_number", "episode_no", "episode"]), indexInShow + 1),
    seasonNo: toInt(attrValue(l, ["season_number", "season_no", "season"]), 1),
  };
}

export function groupPodcasts(listings: Listing[]): { shows: PodcastShow[]; episodes: PodcastEpisode[] } {
  const audio = listings.filter(isAudioListing);
  const byShow = new Map<string, Listing[]>();
  for (const l of audio) {
    const key = l.account?.id ? `account:${l.account.id}` : `category:${l.categories?.[0]?.id ?? "misc"}`;
    if (!byShow.has(key)) byShow.set(key, []);
    byShow.get(key)!.push(l);
  }
  const shows: PodcastShow[] = [];
  const episodes: PodcastEpisode[] = [];
  for (const [, ls] of byShow) {
    const sorted = [...ls].sort((a, b) => a.created_at - b.created_at);
    const first = sorted[0];
    const slug = first.account?.slug || `account-${first.account_id || "misc"}`;
    const show: PodcastShow = {
      slug,
      title: first.account?.name || first.categories?.[0]?.name || "Untitled show",
      description: first.account?.description || "",
      author: first.account?.name || "Unknown",
      email: "",
      category: first.categories?.[0]?.name || "Podcasts",
      language: "en",
      artwork: first.account?.images?.[0] || first.images?.[0] || `https://picsum.photos/seed/${slug}/600/600`,
      explicit: false,
    };
    shows.push(show);
    sorted.forEach((l, i) => {
      const ep = listingToEpisode(l, i);
      if (ep) episodes.push({ ...ep, showSlug: slug });
    });
  }
  // Newest show order kept stable; episodes sorted newest-first per show by callers.
  return { shows, episodes };
}

export function usePodcastCatalog(): {
  shows: PodcastShow[];
  episodes: PodcastEpisode[];
  isMock: boolean;
  isLoading: boolean;
} {
  const digital = useGetListingsQuery({ page: 1, limit: 50, type: "digital" });
  const info = useGetListingsQuery({ page: 1, limit: 50, type: "information_listing" });

  return useMemo(() => {
    const isLoading = digital.isLoading || info.isLoading;
    const live = [...(digital.data?.listings ?? []), ...(info.data?.listings ?? [])];
    const { shows, episodes } = groupPodcasts(live);
    if (episodes.length > 0) return { shows, episodes, isMock: false, isLoading: false };
    // Mock fallback: no credentials, empty catalog, or API error.
    return { shows: MOCK_SHOWS, episodes: MOCK_EPISODES, isMock: true, isLoading };
  }, [digital.isLoading, info.isLoading, digital.data, info.data]);
}

export function episodesOfCatalog(episodes: PodcastEpisode[], showSlug: string): PodcastEpisode[] {
  return episodes
    .filter((e) => e.showSlug === showSlug)
    .sort((a, b) => b.episodeNo - a.episodeNo);
}
