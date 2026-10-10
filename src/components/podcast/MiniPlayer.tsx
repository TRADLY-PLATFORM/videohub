import { Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Gauge,
  ListMusic,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { usePodcastPlayer, SPEEDS } from "./PlayerContext";
import { formatClock } from "@/src/data/mockPodcasts";

export default function MiniPlayer() {
  const { current, queue, playing, toggle, next, prev, seek, skip, speed, setSpeed, currentTime, duration, clear } =
    usePodcastPlayer();
  const [showSpeed, setShowSpeed] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [muted, setMuted] = useState(false);
  const { play } = usePodcastPlayer();

  if (!current) return null;
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-800 bg-black/95 backdrop-blur">
      <div
        className="h-1 w-full cursor-pointer bg-zinc-800"
        onClick={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const ratio = (e.clientX - r.left) / r.width;
          seek(ratio * (duration || 0));
        }}
      >
        <div className="h-full bg-red-600" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-3 px-3 py-2 md:px-6">
        <Link to={`/episode/${current.slug}`} className="hidden h-11 w-11 shrink-0 overflow-hidden rounded sm:block">
          <img src={`https://picsum.photos/seed/pod-${current.showSlug}/96/96`} alt="" className="h-full w-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/episode/${current.slug}`} className="block truncate text-[13px] font-semibold text-white hover:underline">
            {current.title}
          </Link>
          <p className="truncate text-[11px] text-zinc-400">
            {formatClock(currentTime)} / {formatClock(duration || current.durationSec)} · {speed}x
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => skip(-15)} title="Back 15s" className="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10">
            <SkipBack className="h-5 w-5" />
            <span className="absolute text-[8px] font-bold">15</span>
          </button>
          <button onClick={prev} title="Previous" className="hidden h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 sm:flex">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-white/85">
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
          </button>
          <button onClick={next} title="Next" className="hidden h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 sm:flex">
            <SkipForward className="h-4 w-4" />
          </button>
          <button onClick={() => skip(30)} title="Forward 30s" className="relative flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10">
            <SkipForward className="h-5 w-5" />
            <span className="absolute text-[8px] font-bold">30</span>
          </button>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <div className="relative">
            <button onClick={() => setShowSpeed((v) => !v)} title="Playback speed" className="flex h-9 items-center gap-1 rounded-full px-2 text-xs font-bold text-white hover:bg-white/10">
              <Gauge className="h-4 w-4" /> {speed}x
            </button>
            {showSpeed && (
              <div className="absolute bottom-11 right-0 w-28 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-2xl">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setShowSpeed(false); }}
                    className={`block w-full rounded px-2 py-1.5 text-left text-xs ${s === speed ? "bg-red-600 text-white" : "text-zinc-300 hover:bg-white/10"}`}
                  >
                    {s}x speed
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setShowQueue((v) => !v)} title="Queue" className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10">
              <ListMusic className="h-4 w-4" />
            </button>
            {showQueue && (
              <div className="absolute bottom-11 right-0 max-h-64 w-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-2xl">
                {queue.length === 0 && <p className="p-3 text-xs text-zinc-400">Queue is empty.</p>}
                {queue.map((q, i) => (
                  <button key={q.slug} onClick={() => { play(q, queue); }} className={`block w-full truncate rounded px-2 py-1.5 text-left text-xs ${q.slug === current.slug ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}>
                    {i + 1}. {q.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setMuted((m) => !m)} title="Mute (demo)" className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10">
            <Volume2 className={`h-4 w-4 ${muted ? "opacity-40" : ""}`} />
          </button>
          <button onClick={clear} title="Close player" className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
