import { AppConfig } from "../config/app.config.ts";
import type {
  CreateMembershipInput,
  ListMembershipsParams,
  Membership,
  PriceLog,
} from "@/types/subscription.types";

// Memberships REST — developer.tradly.app/memberships
// The tradly JS SDK (v1.2.14) has no memberships methods, so we call REST directly
// with the same headers the SDK uses: Bearer pkKey + x-auth-key.
const base = () => `${AppConfig.apiBaseUrl}/v1/memberships`;

function headers(authKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AppConfig.pkKey}`,
    ...(authKey ? { "x-auth-key": authKey } : {}),
  };
}

async function handle<T>(res: Response): Promise<{ data?: T; error?: { code: number; message: string } }> {
  const json = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) {
    return { error: { code: res.status, message: (json as { message?: string }).message ?? `Request failed (${res.status})` } };
  }
  return { data: json as T };
}

export const listMemberships = (
  params: ListMembershipsParams,
  authKey: string,
): Promise<{ data?: { memberships: Membership[]; pagination: { total: number; page: number; per_page: number } }; error?: { code: number; message: string } }> => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) q.set(k, String(v));
  const qs = q.toString() ? `?${q}` : "";
  return fetch(`${base()}${qs}`, { headers: headers(authKey) }).then((r) =>
    handle<{ memberships: Membership[]; pagination: { total: number; page: number; per_page: number } }>(r),
  );
};

export const createMembership = (
  input: CreateMembershipInput,
  authKey: string,
): Promise<{ data?: { membership: Membership }; error?: { code: number; message: string } }> =>
  fetch(`${base()}`, {
    method: "POST",
    headers: headers(authKey),
    body: JSON.stringify({ membership: input }),
  }).then((r) => handle<{ membership: Membership }>(r));

export const getMembershipDetail = (
  membershipId: string,
  listingId: number,
  authKey: string,
): Promise<{ data?: { membership: Membership }; error?: { code: number; message: string } }> =>
  fetch(`${base()}/${encodeURIComponent(membershipId)}?listing_id=${listingId}`, {
    headers: headers(authKey),
  }).then((r) => handle<{ membership: Membership }>(r));

export const listPriceLogs = (
  listingId: number,
  authKey: string,
): Promise<{ data?: { price_logs: PriceLog[] }; error?: { code: number; message: string } }> =>
  fetch(`${base()}/price_logs?listing_id=${listingId}`, { headers: headers(authKey) }).then((r) =>
    handle<{ price_logs: PriceLog[] }>(r),
  );
