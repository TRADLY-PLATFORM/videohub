import { Link } from "react-router-dom";
import { Play, Mic, Rss, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import Layout from "../components/Layout";
import {
  MOCK_EPISODES,
  formatMin,
  formatClock,
  buildRssFeed,
  getEpisodeProgress,
} from "@/src/data/mockPodcasts";
import { usePodcastCatalog, episodesOfCatalog } from "@/src/data/podcastContract";
import { usePodcastPlayer } from "@/src/components/podcast/PlayerContext";

// Podcast home — list UX (art + rows), not poster grid.
export function PodcastsPage() {
  const { play } = usePodcastPlayer();
  const { shows, episodes, isMock, isLoading } = usePodcastCatalog();
  const showOf = (slug: string) => shows.find((s) => s.slug === slug);
  const latest = [...episodes]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 5);
  void MOCK_EPISODES;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl py-8">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-red-600">
          <Mic className="h-4 w-4" /> VIDEOHUB PODCASTS
        </p>
        <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Shows & episodes</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          A different layout from video on purpose: artwork-led rows, durations up front, and one-tap
          play with queue + speed. Every show ships an RSS feed for Apple & Spotify distribution.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading shows…</p>
          ) : (
          shows.map((s) => {
            const eps = episodesOfCatalog(episodes, s.slug);
            return (
              <Link key={s.slug} to={`/podcast/${s.slug}`} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600">
                <div className="flex gap-4 p-4">
                  <img src={s.artwork} alt={s.title} className="h-24 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-white group-hover:underline">{s.title}</h2>
                    <p className="text-xs text-zinc-400">{s.category} · {eps.length} episodes</p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{s.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-xs">
                  <span className="flex items-center gap-1 text-zinc-400"><Rss className="h-3.5 w-3.5" /> RSS ready</span>
                  <span className="text-zinc-400">Apple · Spotify</span>
                </div>
              </Link>
            );
          }))}
        </div>
        {!isLoading && isMock && (
          <p className="mt-3 text-[11px] text-zinc-600">Demo catalog — connect a workspace with audio listings to go live (see docs/podcast-contract.md).</p>
        )}

        <h2 className="mb-3 mt-10 text-lg font-bold text-white">Latest episodes</h2>
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
          {latest.map((e) => {
            const show = showOf(e.showSlug);
            const prog = getEpisodeProgress()[e.slug] ?? 0;
            return (
              <div key={e.slug} className="flex items-center gap-3 p-3 hover:bg-white/[0.03]">
                <img src={show?.artwork} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <Link to={`/episode/${e.slug}`} className="block truncate text-sm font-semibold text-white hover:underline">
                    {e.title}
                  </Link>
                  <p className="truncate text-xs text-zinc-500">
                    {show?.title} · {formatMin(e.durationSec)} · {e.publishedAt}
                    {prog > 10 ? ` · resumed ${formatClock(prog)}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => play(e, latest)}
                  aria-label={`Play ${e.title}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/85"
                >
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

// Show page — header, distribute (RSS/Apple/Spotify), episode list with queue.
export function PodcastShowPage({ slug }: { slug: string }) {
  const { shows, episodes } = usePodcastCatalog();
  const show = shows.find((s) => s.slug === slug);
  const { play, addToQueue } = usePodcastPlayer();
  const [copied, setCopied] = useState(false);
  if (!show) {
    return (
      <Layout>
        <p className="py-20 text-center text-sm text-zinc-400">Show not found.</p>
      </Layout>
    );
  }
  const eps = episodesOfCatalog(episodes, show.slug);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://videohub.example";
  const rssUrl = `${siteUrl}/podcast/${show.slug}/rss`;
  const rss = buildRssFeed(show, eps, siteUrl);

  const copyRss = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = rssUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRss = () => {
    const blob = new Blob([rss], { type: "application/rss+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${show.slug}.rss.xml`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <img src={show.artwork} alt={show.title} className="h-52 w-52 shrink-0 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.3em] text-red-600">PODCAST</p>
            <h1 className="mt-1 text-3xl font-black text-white md:text-5xl">{show.title}</h1>
            <p className="mt-1 text-sm text-zinc-400">By {show.author} · {show.category} · {eps.length} episodes</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">{show.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => eps[0] && play(eps[0], eps)}
                className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black hover:bg-white/80"
              >
                <Play className="h-4 w-4 fill-current" /> Play latest
              </button>
              <button onClick={copyRss} className="flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy RSS URL"}
              </button>
              <button onClick={downloadRss} className="flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                <Download className="h-4 w-4" /> .xml
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <a
                href={`https://podcastsconnect.apple.com/`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-white"
              >
                Submit to Apple Podcasts ↗
              </a>
              <a
                href={`https://podcasters.spotify.com/`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-white"
              >
                Submit to Spotify ↗
              </a>
              <Link to={`/podcast/${show.slug}/rss`} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-white">
                <Rss className="mr-1 inline h-3 w-3" /> View RSS feed
              </Link>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-zinc-500">{rssUrl}</p>
          </div>
        </div>

        <h2 className="mb-3 mt-10 text-lg font-bold text-white">Episodes</h2>
        <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
          {eps.map((e) => {
            const prog = getEpisodeProgress()[e.slug] ?? 0;
            const pct = prog > 0 ? Math.min(100, (prog / e.durationSec) * 100) : 0;
            return (
              <div key={e.slug} className="p-4 hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => play(e, eps)}
                    aria-label={`Play ${e.title}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/85"
                  >
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <Link to={`/episode/${e.slug}`} className="block truncate text-sm font-semibold text-white hover:underline">
                      E{e.episodeNo} · {e.title}
                    </Link>
                    <p className="text-xs text-zinc-500">{e.publishedAt} · {formatMin(e.durationSec)}{prog > 10 ? ` · left off ${formatClock(prog)}` : ""}</p>
                  </div>
                  <button onClick={() => addToQueue(e)} className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:border-white">
                    + Queue
                  </button>
                </div>
                {pct > 0 && <div className="ml-[52px] mt-2 h-1 overflow-hidden rounded bg-zinc-800"><div className="h-full bg-red-600" style={{ width: `${pct}%` }} /></div>}
                <p className="ml-[52px] mt-1 line-clamp-2 text-xs text-zinc-500">{e.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
