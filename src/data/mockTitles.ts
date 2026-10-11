import type { Listing } from "@/types/listing.types";

export type TitleKind = "movie" | "series";

export interface MockTitle extends Listing {
  kind: TitleKind;
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  match: number;
}

const img = (seed: string, w = 640, h = 360) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const poster = (seed: string) => img(seed, 400, 600);
const backdrop = (seed: string) => img(seed, 1280, 720);

const SAMPLE_VIDEO =
  "https://media.w3.org/2010/05/sintel/trailer.mp4";

// Distinct playable sample files per title (CC-BY Blender / CC0 MDN).
// Google's gtv-videos-bucket now 403s, so it is NOT used.
export const DEMO_VIDEOS = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];

let id = 1000;
function make(
  partial: Partial<MockTitle> & { title: string; slug: string; kind: TitleKind },
): MockTitle {
  id += 1;
  const seed = partial.slug;
  const { slug, title, kind, year, duration, maturity, genres, match, description, rating_data, ...rest } = partial;
  return {
    id,
    slug,
    title,
    description:
      description ??
      `<p>${title} — stream it now in 4K. An original story with unforgettable characters, twists and cinematic visuals.</p>`,
    sku: "",
    barcode: "",
    gtin: "",
    mpn: "",
    locale: "en",
    currency_id: 1,
    list_price: { amount: 0, currency: "USD", formatted: "" },
    offer_price: { amount: 0, currency: "USD", formatted: "" },
    goal_price: { amount: 0, currency: "USD", formatted: "" },
    offer_percent: 0,
    shipping_charges: { amount: 0, currency: "USD", formatted: "" },
    stock: 999,
    max_quantity: 1,
    sold: false,
    active: true,
    status: 2,
    images: [backdrop(seed), poster(seed)],
    videos: [DEMO_VIDEOS[(id - 1001) % DEMO_VIDEOS.length] ?? SAMPLE_VIDEO],
    liked: false,
    unliked: false,
    likes: Math.floor(Math.random() * 9000) + 500,
    unlikes: 0,
    in_cart: false,
    distance: 0,
    type: "video_listing",
    order_type: "video_listing",
    category_id: [],
    categories: [],
    tags: genres ?? [],
    account_id: 1,
    account: {
      id: 1,
      name: "VideoHub Originals",
      slug: "tradly-originals",
      description: "",
      images: [],
      type: "accounts",
      active: true,
      status: 2,
      following: false,
      total_followers: 0,
      total_listings: 0,
      category_id: [],
      categories: [],
      location: {},
      coordinates: { latitude: 0, longitude: 0 },
      shipping_methods: [],
      commission_percent: 0,
      rating_data: {
        rating_count_data: { rating_1: 0, rating_2: 0, rating_3: 0, rating_4: 0, rating_5: 0 },
        rating_average: 4.5,
        rating_count: 100,
        review_count: 100,
      },
      user: { id: "1", first_name: "VideoHub", last_name: "Originals" },
      metadata: {},
      attributes: [],
    },
    user: { id: "1", first_name: "VideoHub", last_name: "Originals" },
    created_at: Date.now() / 1000,
    start_at: 0,
    end_at: 0,
    weight_uom: "",
    size_uom: "",
    volume_uom: "",
    weight_value: 0,
    volume_value: 0,
    height: 0,
    width: 0,
    length: 0,
    seller_protection_fee_enabled: false,
    weighted: false,
    fulfilled_by_platform: false,
    expirable: false,
    meta_title: title,
    meta_description: title,
    meta_keyword: "",
    rating_data: {
      rating_count_data: { rating_1: 2, rating_2: 5, rating_3: 20, rating_4: 40, rating_5: 60 },
      rating_average: rating_data?.rating_average ?? 4.4,
      rating_count: 127,
      review_count: 89,
    },
    attributes: [],
    variants: [],
    schedules: [],
    listing_taxes: [],
    my_review: null,
    location: {},
    kind,
    year: year ?? 2024,
    duration: duration ?? (kind === "movie" ? "2h 8m" : "3 Seasons"),
    maturity: maturity ?? "U/A 16+",
    genres: genres ?? ["Drama"],
    match: match ?? 97,
    ...rest,
  } as MockTitle;
}

export const MOCK_TITLES: MockTitle[] = [
  make({ title: "Neon Harbor", slug: "neon-harbor", kind: "series", year: 2025, duration: "2 Seasons", genres: ["Sci-Fi", "Thriller", "Mystery"], match: 99, rating_data: { rating_count_data: { rating_1: 1, rating_2: 2, rating_3: 10, rating_4: 30, rating_5: 80 }, rating_average: 4.8, rating_count: 123, review_count: 90 } }),
  make({ title: "The Last Monsoon", slug: "the-last-monsoon", kind: "movie", year: 2024, duration: "2h 14m", genres: ["Drama", "Romance"], match: 98 }),
  make({ title: "Circuit Breakers", slug: "circuit-breakers", kind: "series", year: 2024, duration: "1 Season", genres: ["Action", "Sci-Fi"], match: 96 }),
  make({ title: "Paper Moons", slug: "paper-moons", kind: "movie", year: 2023, duration: "1h 52m", genres: ["Comedy", "Drama"], match: 94 }),
  make({ title: "Midnight Diner: Mumbai", slug: "midnight-diner-mumbai", kind: "series", year: 2025, duration: "3 Seasons", genres: ["Food", "Drama"], match: 97 }),
  make({ title: "Shadow Protocol", slug: "shadow-protocol", kind: "movie", year: 2025, duration: "2h 21m", genres: ["Action", "Spy"], match: 95 }),
  make({ title: "Wildflower", slug: "wildflower", kind: "movie", year: 2022, duration: "1h 47m", genres: ["Indie", "Drama"], match: 93 }),
  make({ title: "Kings of Deccan", slug: "kings-of-deccan", kind: "series", year: 2023, duration: "2 Seasons", genres: ["History", "Epic"], match: 97 }),
  make({ title: "Zero Gravity Love", slug: "zero-gravity-love", kind: "movie", year: 2024, duration: "2h 02m", genres: ["Romance", "Sci-Fi"], match: 92 }),
  make({ title: "The Night Auditor", slug: "the-night-auditor", kind: "series", year: 2024, duration: "1 Season", genres: ["Crime", "Noir"], match: 98 }),
  make({ title: "Coconut Heist", slug: "coconut-heist", kind: "movie", year: 2023, duration: "1h 58m", genres: ["Comedy", "Heist"], match: 91 }),
  make({ title: "Banyan", slug: "banyan", kind: "series", year: 2025, duration: "1 Season", genres: ["Horror", "Folk"], match: 96 }),
  make({ title: "Fast Local", slug: "fast-local", kind: "movie", year: 2024, duration: "2h 05m", genres: ["Action", "Thriller"], match: 94 }),
  make({ title: "Salt & Smoke", slug: "salt-and-smoke", kind: "series", year: 2022, duration: "4 Seasons", genres: ["Reality", "Food"], match: 90 }),
  make({ title: "Orbit", slug: "orbit", kind: "movie", year: 2025, duration: "2h 30m", genres: ["Sci-Fi", "Adventure"], match: 99 }),
  make({ title: "The Quiet Code", slug: "the-quiet-code", kind: "series", year: 2023, duration: "2 Seasons", genres: ["Drama", "Tech"], match: 93 }),
  make({ title: "Monsoon Wedding 2", slug: "monsoon-wedding-2", kind: "movie", year: 2024, duration: "2h 11m", genres: ["Family", "Comedy"], match: 89 }),
  make({ title: "Iron Lotus", slug: "iron-lotus", kind: "series", year: 2025, duration: "1 Season", genres: ["Martial Arts", "Drama"], match: 97 }),
];

export const mockToListing = (m: MockTitle): Listing => m as Listing;

// LocalStorage helpers for My List + Continue Watching (work without backend)
const MY_LIST_KEY = "videohub.myList";
const PROGRESS_KEY = "videohub.progress";

export function getMyListIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(MY_LIST_KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function toggleMyListId(id: number): number[] {
  const cur = getMyListIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(MY_LIST_KEY, JSON.stringify(next));
  return next;
}
export function getProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
  } catch {
    return {};
  }
}
export function setProgress(slug: string, pct: number) {
  const cur = getProgress();
  cur[slug] = pct;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(cur));
}
