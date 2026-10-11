import { Link } from "react-router-dom";
import { Play, Info, VolumeX, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Listing } from "@/types/listing.types";
import { backdropOf } from "./rails";
import { getMyListIds, toggleMyListId } from "@/src/data/mockTitles";
import { Plus, Check } from "lucide-react";

export default function Billboard({ title }: { title: Listing }) {
  const [muted, setMuted] = useState(true);
  const [inList, setInList] = useState(() => getMyListIds().includes(title.id));
  const hasVideo = (title.videos?.length ?? 0) > 0;

  const year =
    (title as unknown as { year?: number }).year ??
    (title.start_at ? new Date(title.start_at * 1000).getFullYear() : 2025);

  return (
    <div className="relative h-[78vh] min-h-[480px] w-full overflow-hidden">
      {hasVideo ? (
        <video
          key={title.slug}
          className="absolute inset-0 h-full w-full object-cover"
          src={title.videos[0]}
          autoPlay
          muted={muted}
          loop
          playsInline
          poster={backdropOf(title)}
        />
      ) : (
        <img
          src={backdropOf(title)}
          alt={title.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#141414] to-transparent" />

      <div className="absolute bottom-[18%] left-4 max-w-xl md:left-12">
        <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-white/90">
          <span className="font-black text-green-500 text-base tracking-normal">V</span> ORIGINAL
        </p>
        <h1 className="text-4xl font-black uppercase leading-none text-white drop-shadow-xl md:text-7xl">
          {title.title}
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-white">
          <span className="font-bold text-green-400">98% Match</span>
          <span className="text-white/80">{year}</span>
          <span className="rounded border border-white/40 px-1.5 py-px text-xs text-white/80">U/A 16+</span>
          <span className="rounded bg-white/10 px-1.5 py-px text-xs">4K</span>
        </div>
        <div
          className="mt-3 line-clamp-3 max-w-lg text-sm text-white/85"
          dangerouslySetInnerHTML={{ __html: title.description ?? "" }}
        />
        <div className="mt-5 flex items-center gap-3">
          <Link
            to={`/watch/${title.slug}`}
            className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-white/80"
          >
            <Play className="h-5 w-5 fill-current" /> Play
          </Link>
          <Link
            to={`/title/${title.slug}`}
            className="flex items-center gap-2 rounded bg-zinc-500/60 px-6 py-2.5 font-semibold text-white hover:bg-zinc-500/40"
          >
            <Info className="h-5 w-5" /> More Info
          </Link>
          <button
            onClick={() => {
              toggleMyListId(title.id);
              setInList((v) => !v);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white"
            title="My List"
          >
            {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {hasVideo && (
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-[20%] right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white md:right-12"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
