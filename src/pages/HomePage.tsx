import { useMemo, useState } from "react";
import { useGetListingsQuery } from "@/state/listing/api";
import Layout from "../components/Layout";
import Billboard from "../components/netflix/Billboard";
import { Row, ContinueCard } from "../components/netflix/rails";
import { MOCK_TITLES, getMyListIds, getProgress } from "@/src/data/mockTitles";
import type { Listing } from "@/types/listing.types";
import { Skeleton } from "@/src/components/ui/skeleton";

function useTitles(kind?: "movie" | "series", search = "") {
  const { data, isLoading, isError } = useGetListingsQuery({
    page: 1,
    limit: 40,
    type: "video_listing",
    ...(search ? { search_key: search } : {}),
  });
  const live = useMemo(() => {
    const ls = (data?.listings ?? []).filter((l) =>
      search ? l.title.toLowerCase().includes(search.toLowerCase()) : true,
    );
    if (kind) {
      // Tradly has no movie/series split — infer from mock `kind` when present,
      // otherwise alternate live items between rows so rows never look empty.
      const mocks = MOCK_TITLES.filter((m) => m.kind === kind).map((m) => m.slug);
      if (mocks.length && ls.length === 0) return [];
      return ls;
    }
    return ls;
  }, [data, kind, search]);

  const useMock = isError || (!isLoading && live.length === 0);
  const mock = useMemo(() => {
    let m = MOCK_TITLES;
    if (kind) m = m.filter((t) => t.kind === kind);
    if (search) m = m.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return m as Listing[];
  }, [kind, search]);

  return { listings: useMock ? mock : live, isLoading: isLoading && !useMock, isMock: useMock };
}

export default function HomePage({ kind }: { kind?: "movie" | "series" }) {
  const [query, setQuery] = useState("");
  const { listings, isLoading } = useTitles(kind, query);
  const [myListTick, setMyListTick] = useState(0);

  const myIds = getMyListIds();
  void myListTick;
  const myList = listings.filter((l) => myIds.includes(l.id) || l.liked);
  const progress = getProgress();
  const continueIds = Object.keys(progress);
  const continueList = listings.filter((l) => continueIds.includes(l.slug)).slice(0, 10);

  const trending = [...listings].sort((a, b) => b.likes - a.likes).slice(0, 10);
  const top10 = [...listings].slice(0, 10);
  const movies = (kind ? listings : MOCK_TITLES.filter((m) => m.kind === "movie")).slice(0, 12) as Listing[];
  const series = (kind ? listings : MOCK_TITLES.filter((m) => m.kind === "series")).slice(0, 12) as Listing[];
  const hero = trending[0] ?? listings[0];

  return (
    <Layout search={query} onSearch={(v) => setQuery(v)} minimalPadding>
      {isLoading || !hero ? (
        <div className="h-[78vh] w-full animate-pulse bg-zinc-900" />
      ) : (
        <Billboard title={hero} />
      )}

      <div className="-mt-24 relative z-10 pb-16">
        {isLoading ? (
          <div className="flex gap-4 px-4 md:px-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[240px] w-[160px] shrink-0 bg-zinc-800" />
            ))}
          </div>
        ) : (
          <>
            {continueList.length > 0 && (
              <section className="mb-6 md:mb-8">
                <h2 className="mb-2 px-4 text-[15px] font-semibold text-zinc-100 md:px-12 md:text-lg">
                  Continue Watching
                </h2>
                <div className="scroll-row px-4 md:px-12">
                  {continueList.map((l) => (
                    <ContinueCard key={l.id} listing={l} progress={progress[l.slug] ?? 35} />
                  ))}
                </div>
              </section>
            )}
            <div onClick={() => setMyListTick((t) => t + 1)}>
              <Row title="Trending Now" listings={trending} />
            </div>
            <Row title="Top 10 in Your Country Today" listings={top10} numbered />
            {myList.length > 0 && <Row title="My List" listings={myList} />}
            {!kind && (
              <>
                <Row title="Blockbuster Movies" listings={movies} />
                <Row title="Binge-Worthy Series" listings={series} />
                <Row title="Because You Watched Neon Harbor" listings={[...listings].reverse().slice(0, 12)} />
              </>
            )}
            {kind === "movie" && <Row title="Movies" listings={listings} />}
            {kind === "series" && <Row title="Series" listings={listings} />}
            {listings.length === 0 && (
              <p className="px-12 py-20 text-center text-sm text-zinc-400">
                No titles found{query ? ` for “${query}”` : ""}.
              </p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
