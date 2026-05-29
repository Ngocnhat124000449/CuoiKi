// Wikimedia Commons image search — returns real, freely-licensed product photos.
// Docs: https://www.mediawiki.org/wiki/API:Search  +  API:Imageinfo

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
// Wikimedia requires a descriptive User-Agent or it may reject the request.
const USER_AGENT = "PhoneShopSeeder/1.0 (student e-commerce project)";

// ── Polite throttle + 429 backoff, shared by every Wikimedia request ──────────
// Wikimedia rate-limits bursts; keep requests serial and ~1.1s apart.
const MIN_GAP_MS = 1100;
let lastRequestAt = 0;

async function throttle() {
  const wait = Math.max(0, lastRequestAt + MIN_GAP_MS - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function wikimediaFetch(url: string, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    await throttle();
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status !== 429 || attempt >= maxRetries) return res;
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); // 2s, 4s, 6s backoff
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
export type CommonsCandidate = {
  title: string;
  url: string;     // 800px thumbnail when available, else original
  mime: string;
  width: number;
  height: number;
  index: number;   // search-relevance order (lower = more relevant)
};

const IMAGE_MIME = /^image\/(jpeg|png|webp)$/;

export async function searchCommonsImages(query: string, limit = 15): Promise<CommonsCandidate[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",        // File: namespace
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: "800",
  });

  let data: any;
  try {
    const res = await wikimediaFetch(`${COMMONS_API}?${params.toString()}`);
    if (!res.ok) return [];
    data = await res.json();
  } catch {
    return [];
  }

  const pages = data?.query?.pages;
  if (!pages) return [];

  const out: CommonsCandidate[] = [];
  for (const key of Object.keys(pages)) {
    const p = pages[key];
    const ii = p?.imageinfo?.[0];
    if (!ii) continue;
    const mime: string = ii.mime ?? "";
    if (!IMAGE_MIME.test(mime)) continue;
    out.push({
      title: String(p.title ?? ""),
      url: ii.thumburl ?? ii.url,
      mime,
      width: ii.thumbwidth ?? ii.width ?? 0,
      height: ii.thumbheight ?? ii.height ?? 0,
      index: typeof p.index === "number" ? p.index : 999,
    });
  }
  return out;
}

// ── Matching ────────────────────────────────────────────────────────────────
// Split text into a set of lowercase alphanumeric words (no regex on dynamic input).
// Whole-word semantics: "14" won't match "SU7…14" loosely and "mac" won't match "MacBook".
function wordSet(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}
// Meaningful tokens: length >= 2 (keeps model ids like "s24","m2","14"; drops "1","a").
function meaningfulTokens(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
}

// Accept a candidate only if its title contains the brand/lead token AND at least half of
// the remaining meaningful tokens — rejects wrong-product photos that share one stray word.
export function pickBestCommons(
  query: string,
  candidates: CommonsCandidate[],
  skip = 0,
): CommonsCandidate | undefined {
  const tokens = meaningfulTokens(query);
  if (tokens.length === 0) return undefined;
  const brand = tokens[0];
  const rest = tokens.slice(1);
  const needRest = rest.length === 0 ? 0 : Math.max(1, Math.ceil(rest.length / 2));

  const scored = candidates
    .map((c) => {
      const words = wordSet(c.title);
      const brandOk = words.has(brand);
      const restMatches = rest.filter((t) => words.has(t)).length;
      const ok = brandOk && restMatches >= needRest;
      let score = (brandOk ? 1 : 0) + restMatches;
      if (c.width >= 400 && c.height >= 400) score += 0.25;
      return { c, ok, score };
    })
    .filter((s) => s.ok)
    .sort((a, b) => (b.score - a.score) || (a.c.index - b.c.index));

  return scored[skip]?.c;
}
