import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Plus, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useGetListingDetailQuery, useLikeListingMutation, useUnlikeListingMutation } from "@/state/listing/api";
import { useAuthSelector } from "@/state/auth/selectors";
import Layout from "../components/Layout";
import { MOCK_TITLES, getMyListIds, toggleMyListId } from "@/src/data/mockTitles";
import { backdropOf, Row } from "@/src/components/netflix/rails";
import type { Listing } from "@/types/listing.types";

export default function TitleDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthSelector((s) => s.isAuthenticated);
  const { data, isLoading } = useGetListingDetailQuery({ slug });
  const [likeIt] = useLikeListingMutation();
  const [unlikeIt] = useUnlikeListingMutation();

  const mock = MOCK_TITLES.find((m) => m.slug === slug);
  const listing = (data?.listing ?? mock) as Listing | undefined;
  const [inList, setInList] = useState(() => (listing ? getMyListIds().includes(listing.id) : false));
  const more = MOCK_TITLES.filter((m) => m.slug !== slug).slice(0, 10) as Listing[];

  if (isLoading && !listing) {
    return (
      <Layout>
        <div className="h-[50vh] animate-pulse rounded-xl bg-zinc-800" />
      </Layout>
    );
  }
  if (!listing) {
    return (
      <Layout>
        <p className="py-20 text-center text-sm text-zinc-400">Title not found.</p>
      </Layout>
    );
  }

  const toggleLike = async () => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }
    if (listing.liked) await unlikeIt({ id: listing.id });
    else await likeIt({ id: listing.id });
  };

  return (
    <Layout minimalPadding>
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        <img src={backdropOf(listing)} alt={listing.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#14141466] to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute left-4 top-20 text-white/80 hover:text-white md:left-12" aria-label="Back">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="absolute bottom-10 left-4 max-w-2xl md:left-12">
          <h1 className="text-4xl font-black text-white md:text-6xl">{listing.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Link to={`/watch/${listing.slug}`} className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-semibold text-black hover:bg-white/80">
              <Play className="h-5 w-5 fill-current" /> Play
            </Link>
            <button
              onClick={() => {
                toggleMyListId(listing.id);
                setInList((v) => !v);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white"
            >
              {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
            <button onClick={toggleLike} className="rounded-full border border-white/40 px-4 py-2 text-sm text-white">
              {listing.liked ? "♥ Liked" : "♡ Like"} {listing.likes > 0 ? `(${listing.likes})` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 px-4 py-8 md:grid-cols-[2fr_1fr] md:px-12">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-green-400">97% Match</span>
            <span className="rounded border border-white/30 px-1 text-xs text-zinc-300">U/A 16+</span>
            <span className="text-zinc-400">{listing.account?.name}</span>
          </div>
          <div className="mt-3 text-sm leading-relaxed text-zinc-300" dangerouslySetInnerHTML={{ __html: listing.description || "" }} />
        </div>
        <div className="text-xs leading-relaxed text-zinc-400">
          <p><span className="text-zinc-500">Cast:</span> Ensemble, Guest stars</p>
          <p className="mt-1"><span className="text-zinc-500">Genres:</span> {(listing.categories ?? []).map((c) => c.name).join(", ") || "Drama, Thriller"}</p>
          <p className="mt-1"><span className="text-zinc-500">Maturity:</span> U/A 16+ · violence, language</p>
        </div>
      </div>

      <div className="pb-16">
        <Row title="More Like This" listings={more} />
      </div>
    </Layout>
  );
}
