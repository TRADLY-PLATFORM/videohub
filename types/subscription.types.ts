// ─── Memberships (Subscriptions) — developer.tradly.app/memberships ────────────
// Tradly Memberships API lets tenants enroll users into membership programs
// tied to a listing of type `membership`. Used here as VideoHub plans.

export type MembershipStatus = "active" | "expired" | "cancelled";

export interface Membership {
  id: number;
  membership_id: string; // external identifier (our subscription ref)
  listing_id: number;
  user_id: number;
  status: MembershipStatus;
  joined_at?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: number;
  currency_id?: number;
  metadata?: Record<string, unknown>;
  contributions?: Contribution[];
}

export interface Contribution {
  id: number;
  amount: number;
  units_credited: number;
  unit_price?: number;
  unit_name?: string;
  order_id?: number;
}

export interface PriceLog {
  id: number;
  listing_id: number;
  price: number;
  currency_id: number;
  observed_at: string;
  unit_name?: string;
  source?: string;
}

export interface CreateMembershipInput {
  listing_id: number;
  membership_id: string; // unique per tenant+listing, e.g. `vh-<user>-<ts>`
  status?: MembershipStatus;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;
  duration_months?: number;
  currency_id?: number;
  metadata?: Record<string, unknown>;
}

export interface ListMembershipsParams {
  listing_id?: number;
  status?: MembershipStatus;
  membership_id?: string;
  user_id?: number;
  page?: number;
  per_page?: number;
}

export interface ListMembershipsResponse {
  memberships: Membership[];
  total: number;
  page: number;
  per_page: number;
}

// ─── VideoHub plan (membership listing) ───────────────────────────────────────
export interface Plan {
  listing_id: number; // Tradly listing id of type `membership`
  slug: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
}

export const MOCK_PLANS: Plan[] = [
  {
    listing_id: 729424,
    slug: "videohub-basic",
    name: "Basic",
    price: "$6.99/mo",
    period: "HD · 1 screen",
    features: ["HD streaming", "1 screen at a time", "Watch on phone & laptop", "Cancel anytime"],
  },
  {
    listing_id: 729422,
    slug: "videohub-standard",
    name: "Standard",
    price: "$11.99/mo",
    period: "Full HD · 2 screens",
    features: ["Full HD streaming", "2 screens at a time", "Offline downloads", "Cancel anytime"],
    highlight: true,
  },
  {
    listing_id: 729423,
    slug: "videohub-premium",
    name: "Premium",
    price: "$15.99/mo",
    period: "4K+HDR · 4 screens",
    features: ["4K + HDR", "4 screens at a time", "Offline downloads", "Early originals access"],
  },
];

const SUB_KEY = "videohub.subscription";
export function getLocalSubscription(): { planSlug: string; status: MembershipStatus } | null {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function setLocalSubscription(planSlug: string, status: MembershipStatus = "active") {
  localStorage.setItem(SUB_KEY, JSON.stringify({ planSlug, status }));
}
export function clearLocalSubscription() {
  localStorage.removeItem(SUB_KEY);
}
