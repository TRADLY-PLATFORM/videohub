import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Plus, Check, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetListingDetailQuery } from "@/state/listing/api";
import { MOCK_TITLES, setProgress, getMyListIds, toggleMyListId } from "@/src/data/mockTitles";
import { backdropOf, posterOf } from "@/src/components/netflix/rails";
import { useHasActiveSubscription } from "./PlansPage";
import { isWorkspaceConfigured } from "@/api/tradly-init";

export default function WatchPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const hasSub = useHasActiveSubscription();
  // Demo mode (no workspace): play the demo catalog directly so visitors see
  // video immediately. With a real workspace, playback requires membership.
  const demoMode = !isWorkspaceConfigured();
  const locked = !hasSub && !demoMode;
  const { data } = useGetListingDetailQuery({ slug });
  const mock = MOCK_TITLES.find((m) => m.slug === slug);
  const listing = data?.listing ?? (mock as unknown as import("@/types/listing.types").Listing | undefined);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [inList, setInList] = useState(() => (listing ? getMyListIds().includes(listing.id) : false));

  useEffect(() => {
    if (listing) setInList(getMyListIds().includes(listing.id));
  }, [slug]);

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-lg">Title not found.</p>
        <button onClick={() => navigate("/")} className="rounded bg-green-500 px-6 py-2 font-semibold">
          Back to Browse
        </button>
      </div>
    );
  }

  const videoUrl = listing.videos?.[0];
  const onTime = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress(slug, (v.currentTime / v.duration) * 100);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-4 md:left-12">
        <button onClick={() => navigate(-1)} className="text-white/90 hover:text-white" aria-label="Back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <Link to="/" className="text-2xl font-black tracking-tight text-green-500">
          VIDEOHUB
        </Link>
      </div>

      {locked ? (
        <div className="relative">
          <img src={backdropOf(listing)} alt={listing.title} className="aspect-video max-h-[82vh] w-full object-cover opacity-40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center">
            <p className="text-xl font-bold">Subscribe to watch this title</p>
            <p className="max-w-md text-sm text-zinc-300">
              Playback is gated by an active membership (Tradly Memberships API).
              Pick a plan to unlock all movies & series.
            </p>
            <Link to="/plans" className="rounded bg-green-500 px-8 py-2.5 font-semibold text-white hover:bg-green-600">
              See Plans
            </Link>
          </div>
        </div>
      ) : (
        <>
          {demoMode && (
            <p className="bg-yellow-500/10 px-4 py-1.5 text-center text-xs text-yellow-200 md:px-12">
              Demo preview — connect a workspace + subscription to gate playback.
            </p>
          )}
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={backdropOf(listing)}
              controls
              autoPlay
              onTimeUpdate={onTime}
              onEnded={() => setProgress(slug, 100)}
              className="aspect-video max-h-[82vh] w-full bg-black"
            />
          ) : (
            <img src={backdropOf(listing)} alt={listing.title} className="aspect-video max-h-[82vh] w-full object-cover" />
          )}
        </>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <img src={posterOf(listing)} alt="" className="hidden w-40 rounded-md md:block" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold md:text-4xl">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="font-bold text-green-400">98% Match</span>
              <span className="rounded border border-white/30 px-1.5 text-xs">U/A 16+</span>
              <span className="text-white/70">{listing.account?.name ?? "VideoHub Originals"}</span>
              {listing.rating_data?.rating_average > 0 && (
                <span className="text-yellow-400">★ {listing.rating_data.rating_average.toFixed(1)}</span>
              )}
            </div>
            <div
              className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80"
              dangerouslySetInnerHTML={{ __html: listing.description || "" }}
            />
            <div className="mt-5 flex items-center gap-3">
              {!videoUrl && (
                <Link
                  to={`/watch/${listing.slug}`}
                  className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black"
                >
                  <Play className="h-4 w-4 fill-current" /> Play
                </Link>
              )}
              <button
                onClick={() => {
                  toggleMyListId(listing.id);
                  setInList((v) => !v);
                }}
                className="flex items-center gap-2 rounded bg-zinc-700/70 px-5 py-2 font-semibold hover:bg-zinc-700"
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                My List
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40">
                <ThumbsUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-white/50">
              {(listing.categories?.[0] as unknown as { name?: string })?.name
                ? `Genres: ${(listing.categories ?? []).map((c) => c.name).join(", ")}`
                : `Starring: Ensemble cast · Creator: VideoHub Originals`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
