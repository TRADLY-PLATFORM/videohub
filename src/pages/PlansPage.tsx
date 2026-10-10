import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Crown } from "lucide-react";
import Layout from "../components/Layout";
import { useAuthSelector } from "@/state/auth/selectors";
import { useCreateMembershipMutation, useGetMembershipsQuery } from "@/state/membership/api";
import {
  MOCK_PLANS,
  getLocalSubscription,
  setLocalSubscription,
} from "@/types/subscription.types";

export function useHasActiveSubscription(): boolean {
  const isAuthenticated = useAuthSelector((s) => s.isAuthenticated);
  const { data } = useGetMembershipsQuery(
    { status: "active", per_page: 1 },
    { skip: !isAuthenticated },
  );
  if ((data?.memberships.length ?? 0) > 0) return true;
  const local = getLocalSubscription();
  return local?.status === "active";
}

export default function PlansPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthSelector((s) => s.isAuthenticated);
  const [createMembership, { isLoading }] = useCreateMembershipMutation();
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const hasSub = useHasActiveSubscription();

  const subscribe = async (planSlug: string, listingId: number) => {
    setError("");
    setDone("");
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }
    // Enroll via Tradly Memberships API (POST /v1/memberships).
    // membership_id is our external ref — must be unique per tenant+listing.
    const ref = `vh-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const result = await createMembership({
      listing_id: listingId,
      membership_id: ref,
      status: "active",
      duration_months: 1,
      metadata: { plan: planSlug },
    });
    if ("error" in result) {
      // Backend not configured (no membership listing yet) → demo fallback so
      // the flow is testable without a Tradly workspace.
      const msg = (result.error as { error: string }).error ?? "";
      if (msg) setError(`${msg} — saved locally for demo.`);
      setLocalSubscription(planSlug, "active");
      setDone(`Subscribed to ${planSlug} (demo mode).`);
      return;
    }
    setLocalSubscription(planSlug, "active");
    setDone(`Subscribed to ${planSlug}. Enjoy!`);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl py-10">
        <p className="text-center text-xs font-bold tracking-[0.3em] text-red-600">VIDEOHUB PLANS</p>
        <h1 className="mt-2 text-center text-3xl font-black text-white md:text-5xl">
          One subscription. Unlimited movies & series.
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-400">
          {hasSub ? "You have an active subscription." : "Pick a plan to start watching. Cancel anytime."}{" "}
          <Link to="/" className="underline">Back to browse</Link>
        </p>

        {error && <p className="mx-auto mt-6 max-w-xl rounded bg-yellow-500/10 px-4 py-3 text-center text-sm text-yellow-300">{error}</p>}
        {done && <p className="mx-auto mt-6 max-w-xl rounded bg-green-500/10 px-4 py-3 text-center text-sm text-green-300">{done}</p>}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MOCK_PLANS.map((p) => (
            <div
              key={p.slug}
              className={`rounded-xl border p-6 ${p.highlight ? "border-red-600 bg-zinc-900 shadow-2xl" : "border-zinc-800 bg-zinc-900/60"}`}
            >
              {p.highlight && (
                <span className="mb-3 inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                  <Crown className="h-3 w-3" /> MOST POPULAR
                </span>
              )}
              <h2 className="text-xl font-bold text-white">{p.name}</h2>
              <p className="mt-1 text-2xl font-black text-white">{p.price}</p>
              <p className="text-xs text-zinc-400">{p.period}</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isLoading}
                onClick={() => subscribe(p.slug, p.listing_id)}
                className={`mt-6 w-full rounded py-2.5 font-semibold ${p.highlight ? "bg-red-600 text-white hover:bg-red-700" : "bg-white text-black hover:bg-white/80"}`}
              >
                {isLoading ? "Processing…" : hasSub ? "Switch plan" : "Subscribe"}
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-500">Tradly listing {p.listing_id} · type membership</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-black/40 p-5 text-xs leading-relaxed text-zinc-400">
          <p className="font-semibold text-zinc-200">How it works with Tradly</p>
          <p className="mt-1">
            1. Create a listing with <code>type: "membership"</code> per plan in SuperAdmin.{" "}
            2. App calls <code>POST /v1/memberships</code> to enroll (see <code>api/membership.ts</code>).{" "}
            3. Payment goes through standard Tradly checkout — contributions auto-record on order confirm.{" "}
            4. Gate playback with <code>GET /v1/memberships?status=active</code>.
            Docs: developer.tradly.app/memberships.
          </p>
        </div>
      </div>
    </Layout>
  );
}
