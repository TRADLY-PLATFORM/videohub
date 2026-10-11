import { Link } from "react-router-dom";
import { Play, Plus, Check, ChevronDown, ThumbsUp } from "lucide-react";
import type { Listing } from "@/types/listing.types";
import { getMyListIds, toggleMyListId } from "@/src/data/mockTitles";
import { useState } from "react";

export function posterOf(l: Listing): string {
  return l.images?.[1] ?? l.images?.[0] ?? `https://picsum.photos/seed/${l.slug}/400/600`;
}
export function backdropOf(l: Listing): string {
  return l.images?.[0] ?? `https://picsum.photos/seed/${l.slug}/1280/720`;
}

export function TitleCard({
  listing,
  rank,
  onToggleList,
}: {
  listing: Listing;
  rank?: number;
  onToggleList?: () => void;
}) {
  const [inList, setInList] = useState(() => getMyListIds().includes(listing.id));
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMyListId(listing.id);
    setInList((v) => !v);
    onToggleList?.();
  };

  return (
    <Link
      to={`/watch/${listing.slug}`}
      className="group relative w-[160px] md:w-[200px] shrink-0 snap-start"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-800 transition-all duration-300 group-hover:scale-[1.04] group-hover:z-10 group-hover:shadow-2xl group-hover:ring-1 group-hover:ring-white/20">
        {rank !== undefined && (
          <span className="absolute -left-1 bottom-0 z-10 text-[92px] leading-[0.8] font-black text-black [-webkit-text-stroke:2px_#71717a] select-none">
            {rank}
          </span>
        )}
        <img
          src={posterOf(listing)}
          alt={listing.title}
          loading="lazy"
          className={`h-full w-full object-cover ${rank !== undefined ? "pl-10" : ""}`}
        />
        {/* hover overlay */}
        <div className="absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
          <p className="text-[13px] font-semibold text-white line-clamp-1">{listing.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-green-400">97% Match</span>
            <span className="rounded border border-white/30 px-1 text-[10px] text-white/80">U/A 16+</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <button
              onClick={toggle}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white hover:border-white"
              title={inList ? "Remove from My List" : "Add to My List"}
            >
              {inList ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
            <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white">
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Row({
  title,
  listings,
  numbered,
}: {
  title: string;
  listings: Listing[];
  numbered?: boolean;
}) {
  if (!listings.length) return null;

  return (
    <section className="relative mb-6 md:mb-8">
      <h2 className="mb-2 px-4 text-[15px] font-semibold text-zinc-100 md:px-12 md:text-lg">
        {title}
      </h2>
      <div className="group/row relative">
        <div
          className="scroll-row px-4 md:px-12"
        >
          {listings.map((l, i) => (
            <TitleCard key={l.id} listing={l} rank={numbered ? i + 1 : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContinueCard({ listing, progress }: { listing: Listing; progress: number }) {
  return (
    <Link
      to={`/watch/${listing.slug}`}
      className="group relative w-[280px] md:w-[320px] shrink-0 snap-start"
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-800 transition group-hover:ring-1 group-hover:ring-white/20">
        <img src={backdropOf(listing)} alt={listing.title} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-black/50 opacity-0 transition group-hover:opacity-100">
          <Play className="h-5 w-5 fill-white text-white" />
        </span>
        <div className="absolute bottom-0 h-1 w-full bg-zinc-700">
          <div className="h-full bg-green-500" style={{ width: `${Math.min(100, Math.max(2, progress))}%` }} />
        </div>
      </div>
      <p className="mt-1.5 text-[13px] text-zinc-300">{listing.title}</p>
    </Link>
  );
}

export function LikeButton({ listing }: { listing: Listing }) {
  const [liked, setLiked] = useState(!!listing.liked);
  return (
    <button
      onClick={() => setLiked((v) => !v)}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:border-white"
      title="I like this"
    >
      <ThumbsUp className={`h-4 w-4 ${liked ? "fill-white" : ""}`} />
    </button>
  );
}
