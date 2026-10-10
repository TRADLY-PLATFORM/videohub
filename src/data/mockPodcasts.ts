export interface PodcastEpisode {
  id: number;
  slug: string;
  showSlug: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSec: number;
  publishedAt: string; // ISO date
  episodeNo: number;
  seasonNo?: number;
}

export interface PodcastShow {
  slug: string;
  title: string;
  description: string;
  author: string;
  email: string;
  category: string;
  language: string;
  artwork: string;
  explicit: boolean;
}

const art = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;
const MP3 = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

export const MOCK_SHOWS: PodcastShow[] = [
  {
    slug: "behind-the-frame",
    title: "Behind the Frame",
    description: "How movies get made — directors, editors and composers break down one scene per episode.",
    author: "VideoHub Studios",
    email: "podcasts@videohub.example",
    category: "TV & Film",
    language: "en",
    artwork: art("pod-frame"),
    explicit: false,
  },
  {
    slug: "signal-loss",
    title: "Signal Loss",
    description: "A weekly tech-thriller serial. One station. No signal. Twelve survivors.",
    author: "VideoHub Originals",
    email: "podcasts@videohub.example",
    category: "Fiction",
    language: "en",
    artwork: art("pod-signal"),
    explicit: true,
  },
  {
    slug: "box-office-breakdown",
    title: "Box Office Breakdown",
    description: "Numbers, trends and takes on what the streaming charts actually mean.",
    author: "VideoHub Business",
    email: "podcasts@videohub.example",
    category: "Business",
    language: "en",
    artwork: art("pod-charts"),
    explicit: false,
  },
];

let epId = 5000;
function ep(
  showSlug: string,
  episodeNo: number,
  title: string,
  durationSec: number,
  publishedAt: string,
  n: number,
  description?: string,
): PodcastEpisode {
  epId += 1;
  return {
    id: epId,
    slug: `${showSlug}-e${episodeNo}`,
    showSlug,
    title,
    description:
      description ??
      `${title} — show notes, chapters and links for this episode. Stream it here or in any podcast app via RSS.`,
    audioUrl: MP3(((n - 1) % 6) + 1),
    durationSec,
    publishedAt,
    episodeNo,
  };
}

export const MOCK_EPISODES: PodcastEpisode[] = [
  ep("behind-the-frame", 12, "The One-Take Wonder", 2145, "2026-09-28", 1),
  ep("behind-the-frame", 11, "Cutting a Chase Scene", 1890, "2026-09-21", 2),
  ep("behind-the-frame", 10, "Scoring Silence", 2430, "2026-09-14", 3),
  ep("behind-the-frame", 9, "Color Is a Character", 1720, "2026-09-07", 4),
  ep("signal-loss", 8, "Static — Finale", 2760, "2026-10-02", 5),
  ep("signal-loss", 7, "The Relay", 2310, "2026-09-25", 6),
  ep("signal-loss", 6, "Dead Air", 1980, "2026-09-18", 1),
  ep("box-office-breakdown", 21, "Why Documentaries Chart", 1560, "2026-10-05", 2),
  ep("box-office-breakdown", 20, "The 90-Minute Comeback", 1740, "2026-09-28", 3),
  ep("box-office-breakdown", 19, "Regional Hits Go Global", 2010, "2026-09-21", 4),
];

export const episodesOf = (showSlug: string) =>
  MOCK_EPISODES.filter((e) => e.showSlug === showSlug).sort((a, b) => b.episodeNo - a.episodeNo);

export const showOf = (slug: string) => MOCK_SHOWS.find((s) => s.slug === slug);

export const formatClock = (sec: number) => {
  if (!sec || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

export const formatMin = (sec: number) => (sec && sec > 0 ? `${Math.round(sec / 60)} min` : "—");

// ─── RSS 2.0 + iTunes feed builder (frontend-only) ────────────────────────────
export function buildRssFeed(show: PodcastShow, episodes: PodcastEpisode[], siteUrl: string): string {
  const items = episodes
    .map(
      (e) => `    <item>
      <title><![CDATA[${e.title}]]></title>
      <description><![CDATA[${e.description}]]></description>
      <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="false">${siteUrl}/episode/${e.slug}</guid>
      <link>${siteUrl}/episode/${e.slug}</link>
      <enclosure url="${e.audioUrl}" length="0" type="audio/mpeg" />
      <itunes:episode>${e.episodeNo}</itunes:episode>
      <itunes:duration>${Math.floor(e.durationSec)}</itunes:duration>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title><![CDATA[${show.title}]]></title>
    <description><![CDATA[${show.description}]]></description>
    <link>${siteUrl}/podcast/${show.slug}</link>
    <language>${show.language}</language>
    <itunes:author>${show.author}</itunes:author>
    <itunes:category text="${show.category}" />
    <itunes:explicit>${show.explicit ? "yes" : "no"}</itunes:explicit>
    <itunes:image href="${show.artwork}" />
${items}
  </channel>
</rss>`;
}

// Progress persistence (per-episode seconds)
const PROG_KEY = "videohub.podcast.progress";
export function getEpisodeProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PROG_KEY) ?? "{}");
  } catch {
    return {};
  }
}
export function setEpisodeProgress(slug: string, sec: number) {
  try {
    const cur = getEpisodeProgress();
    cur[slug] = sec;
    localStorage.setItem(PROG_KEY, JSON.stringify(cur));
  } catch { /* private mode */ }
}
