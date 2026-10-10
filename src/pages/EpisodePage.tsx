import { Link } from "react-router-dom";
import { Play, Pause, Rss, Copy, Check, Gauge } from "lucide-react";
import { useState } from "react";
import Layout from "../components/Layout";
import {
  formatClock,
  formatMin,
  buildRssFeed,
} from "@/src/data/mockPodcasts";
import { usePodcastCatalog, episodesOfCatalog } from "@/src/data/podcastContract";
import { usePodcastPlayer, SPEEDS } from "@/src/components/podcast/PlayerContext";

// Single episode — show notes + full player controls + speed + RSS.
export default function EpisodePage({ slug }: { slug: string }) {
  const { shows, episodes } = usePodcastCatalog();
  const ep = episodes.find((e) => e.slug === slug);
  const { current, playing, play, toggle, seek, skip, speed, setSpeed, currentTime, duration, addToQueue } =
    usePodcastPlayer();
  const [copied, setCopied] = useState(false);
  if (!ep) {
    return (
      <Layout>
        <p className="py-20 text-center text-sm text-zinc-400">Episode not found.</p>
      </Layout>
    );
  }
  const show = shows.find((s) => s.slug === ep.showSlug);
  const eps = episodesOfCatalog(episodes, ep.showSlug);
  const isCurrent = current?.slug === ep.slug;
  const pos = isCurrent ? currentTime : 0;
  const len = isCurrent && duration > 0 ? duration : ep.durationSec;
  const pct = len > 0 ? (pos / len) * 100 : 0;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl py-8">
        <Link to={`/podcast/${ep.showSlug}`} className="text-xs text-zinc-400 hover:text-white">
          ← {show?.title}
        </Link>
        <div className="mt-4 flex gap-5">
          <img src={show?.artwork} alt="" className="h-32 w-32 shrink-0 rounded-xl object-cover" />
          <div>
            <p className="text-xs text-zinc-500">Episode {ep.episodeNo} · {ep.publishedAt} · {formatMin(ep.durationSec)}</p>
            <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">{ep.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {isCurrent ? (
                <button onClick={toggle} className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black hover:bg-white/80">
                  {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                  {playing ? "Pause" : "Resume"} · {formatClock(pos)}
                </button>
              ) : (
                <button onClick={() => play(ep, eps)} className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black hover:bg-white/80">
                  <Play className="h-4 w-4 fill-current" /> Play
                </button>
              )}
              <button onClick={() => addToQueue(ep)} className="rounded bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                + Queue
              </button>
              <button onClick={copyLink} className="flex items-center gap-2 rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />} Share
              </button>
            </div>
          </div>
        </div>

        {/* progress + transport */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div
            className="h-1.5 w-full cursor-pointer rounded bg-zinc-800"
            onClick={(e) => {
              if (!isCurrent) return;
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              seek(((e.clientX - r.left) / r.width) * len);
            }}
          >
            <div className="h-full rounded bg-red-600" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>{formatClock(pos)}</span>
            <span>-{formatClock(Math.max(0, len - pos))} left</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => (isCurrent ? skip(-15) : play(ep, eps))} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-white hover:border-white">
              −15s
            </button>
            <button onClick={() => isCurrent && skip(30)} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-white hover:border-white">
              +30s
            </button>
            <span className="ml-2 flex items-center gap-1 text-xs text-zinc-400">
              <Gauge className="h-3.5 w-3.5" /> Speed:
            </span>
            <div className="flex flex-wrap gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${isCurrent && speed === s ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">Speed, queue and progress persist across pages; background + lock-screen controls via Media Session API.</p>
        </div>

        <h2 className="mb-2 mt-8 text-sm font-bold uppercase tracking-wider text-zinc-400">Show notes</h2>
        <p className="text-sm leading-relaxed text-zinc-300">{ep.description}</p>
        <audio src={ep.audioUrl} preload="none" className="mt-4 w-full" controls />

        <div className="mt-6 flex items-center gap-2 text-xs">
          <Rss className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-500">In your podcast app, add:</span>
          <code className="break-all font-mono text-zinc-300">
            {typeof window !== "undefined" ? window.location.origin : ""}/podcast/{ep.showSlug}/rss
          </code>
        </div>
      </div>
    </Layout>
  );
}

// RSS feed route — renders raw XML with copy/download (frontend-only;
// production should serve this path as application/rss+xml from the backend/CDN).
export function RssFeedPage({ showSlug }: { showSlug: string }) {
  const { shows, episodes } = usePodcastCatalog();
  const show = shows.find((s) => s.slug === showSlug);
  const [copied, setCopied] = useState(false);
  if (!show) {
    return (
      <Layout>
        <p className="py-20 text-center text-sm text-zinc-400">Show not found.</p>
      </Layout>
    );
  }
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://videohub.example";
  const xml = buildRssFeed(show, episodesOfCatalog(episodes, show.slug), siteUrl);
  return (
    <Layout>
      <div className="mx-auto max-w-4xl py-8">
        <Link to={`/podcast/${show.slug}`} className="text-xs text-zinc-400 hover:text-white">← {show.title}</Link>
        <h1 className="mt-2 text-2xl font-black text-white">RSS feed — {show.title}</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Paste this URL into Apple Podcasts Connect / Spotify for Podcasters, or any podcast app.
          Each <code>&lt;item&gt;</code> carries an <code>&lt;enclosure&gt;</code> MP3 + iTunes duration.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={async () => {
              try { await navigator.clipboard.writeText(xml); } catch { /* noop */ }
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied XML" : "Copy XML"}
          </button>
          <Link to={`/podcast/${show.slug}`} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white">Back to show</Link>
        </div>
        <pre className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-zinc-800 bg-black p-4 font-mono text-[11px] leading-relaxed text-green-300">
          {xml}
        </pre>
      </div>
    </Layout>
  );
}
