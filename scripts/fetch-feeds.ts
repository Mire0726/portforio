// Fetches Zenn articles, the GitHub avatar and link-card metadata (OGP) at build time into src/data/feeds.generated.json,
// which the app imports statically. (Zenn's API doesn't allow browser CORS.)
// Failures never break the build: the affected channel just shows a fallback.
import { writeFile } from "node:fs/promises";
import { links } from "../src/data/profile.ts";
import type { Feeds, LinkPreview } from "../src/lib/feeds.ts";
import { loadPosts } from "./load-posts.ts";

const OUT_FILE = new URL("../src/data/feeds.generated.json", import.meta.url);
const TIMEOUT_MS = 10_000;

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "portforio-build", ...headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${url})`);
  return res.json() as Promise<T>;
}

type ZennResponse = {
  articles: {
    title: string;
    emoji: string;
    path: string;
    article_type: "tech" | "idea";
    liked_count: number;
    published_at: string;
  }[];
  next_page: number | null;
};

async function fetchZenn(): Promise<Feeds["zenn"]> {
  const articles: ZennResponse["articles"] = [];
  for (let page: number | null = 1; page && page <= 10; ) {
    const data: ZennResponse = await getJson(
      `https://zenn.dev/api/articles?username=${links.zenn.user}&order=latest&page=${page}`,
    );
    articles.push(...data.articles);
    page = data.next_page;
  }
  return articles.map((a) => ({
    title: a.title,
    emoji: a.emoji,
    url: `https://zenn.dev${a.path}`,
    type: a.article_type,
    likes: a.liked_count,
    publishedAt: a.published_at,
  }));
}

async function fetchAvatarUrl(): Promise<string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const user = await getJson<{ avatar_url: string }>(`https://api.github.com/users/${links.github.user}`, headers);
  return user.avatar_url;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

/** Reads a <meta property|name="key" content="..."> value, in either attribute order. */
function metaContent(html: string, key: string): string | undefined {
  const k = key.replace(/[.:]/g, "\\$&");
  const m =
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i")) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, "i"));
  return m ? decodeEntities(m[1]).trim() || undefined : undefined;
}

async function fetchPreview(url: string): Promise<LinkPreview> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; portforio-build)" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${res.status} (${url})`);
  const html = await res.text();
  // Third-party HTML: keep only https URLs so nothing odd ends up in <img src>.
  const abs = (href: string | undefined) => {
    if (!href || !URL.canParse(href, res.url)) return undefined;
    const url = new URL(href, res.url);
    return url.protocol === "https:" ? url.href : undefined;
  };
  const icon = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)?.[1];
  return {
    title:
      metaContent(html, "og:title") ??
      (decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim() || undefined),
    description: metaContent(html, "og:description") ?? metaContent(html, "description"),
    image: abs(metaContent(html, "og:image")),
    favicon: abs(icon) ?? abs("/favicon.ico"),
  };
}

/** Speaker Deck's player URL via oEmbed, so slides can be embedded instead of shown as a card. */
async function fetchSpeakerDeckEmbed(url: string): Promise<string | undefined> {
  const data = await getJson<{ html: string }>(`https://speakerdeck.com/oembed.json?url=${encodeURIComponent(url)}`);
  const src = data.html.match(/src="(https:\/\/speakerdeck\.com\/player\/[0-9a-f]+)"/)?.[1];
  return src;
}

/** OGP for every link card on the site, keyed by URL. Missing entries fall back to the plain title. */
async function fetchPreviews(urls: string[]): Promise<Feeds["previews"]> {
  const entries = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      try {
        const preview = await fetchPreview(url);
        if (new URL(url).hostname === "speakerdeck.com") preview.embed = await fetchSpeakerDeckEmbed(url);
        return [url, preview] as const;
      } catch (err) {
        console.warn(`[fetch-feeds] preview failed — ${(err as Error).message}`);
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null));
}

async function settle<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const value = await fn();
    console.log(`[fetch-feeds] ${label}: ok`);
    return value;
  } catch (err) {
    console.warn(`[fetch-feeds] ${label}: failed, using fallback — ${(err as Error).message}`);
    return fallback;
  }
}

const [zenn, avatarUrl] = await Promise.all([
  settle("zenn", fetchZenn, []),
  settle<string | null>("github avatar", fetchAvatarUrl, null),
]);

const cardUrls = [
  ...Object.values(await loadPosts()).flatMap((posts) => posts.flatMap((p) => p.links.map((l) => l.url))),
  ...zenn.map((a) => a.url),
];
const previews = await settle("link previews", () => fetchPreviews(cardUrls), {});

const feeds: Feeds = { generatedAt: new Date().toISOString(), zenn, avatarUrl, previews };
await writeFile(OUT_FILE, JSON.stringify(feeds, null, 2) + "\n");
