import { useMemo } from "react";
import { useGetListingsQuery } from "@/state/listing/api";
import Layout from "../components/Layout";
import { Row } from "../components/netflix/rails";
import { MOCK_TITLES, getMyListIds } from "@/src/data/mockTitles";
import type { Listing } from "@/types/listing.types";

export default function MyListPage() {
  const { data } = useGetListingsQuery({ page: 1, limit: 40, type: "video_listing" });
  const live = data?.listings ?? [];
  const ids = getMyListIds();
  const likedLive = live.filter((l) => l.liked || ids.includes(l.id));
  const mockMine = (MOCK_TITLES.filter((m) => ids.includes(m.id)) as Listing[]);
  const all = [...likedLive, ...mockMine.filter((m) => !likedLive.some((l) => l.id === m.id))];
  const fallback = useMemo(
    () => (all.length ? all : (MOCK_TITLES.slice(0, 6) as Listing[])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(ids), live.length],
  );

  return (
    <Layout>
      <h1 className="mb-6 mt-6 text-2xl font-bold text-white">My List</h1>
      {(all.length ? all : []).length > 0 ? (
        <Row title={`${all.length} titles`} listings={all} />
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-400">
            Your list is empty — here are some picks to get started. Tap + on any title to save it here.
          </p>
          <Row title="Suggested for you" listings={fallback} />
        </>
      )}
    </Layout>
  );
}
