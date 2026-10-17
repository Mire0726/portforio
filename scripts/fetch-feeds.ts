// Fetches Zenn articles, the GitHub avatar and link-card metadata (OGP) at build time into src/data/feeds.generated.json,
// which the app imports statically. (Zenn's API doesn't allow browser CORS.)
// Remote images are downloaded, shrunk to WebP and served from public/cached/, so visitors never load
// multi-megabyte originals from third-party servers.
// Failures never break the build: the affected channel just shows a fallback.
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import sharp, { type Sharp } from "sharp";
import type { Feeds, LinkPreview } from "../src/lib/feeds.ts";
import { loadPosts, loadProfile } from "./load-content.ts";

const { links } = await loadProfile();
const OUT_FILE = new URL("../src/data/feeds.generated.json", import.meta.url);
const TIMEOUT_MS = 10_000;
const BROWSER_UA = { "User-Agent": "Mozilla/5.0 (compatible; portforio-build)" };

const IMAGE_DIR = new URL("../public/cached/", import.meta.url);
const IMAGE_PATH = "/cached/";
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

/** 2x what the UI shows: link-card thumbnails (~200x104), favicons (14px) and the avatar (up to 72px). */
const IMAGE_SIZES = {
  card: { width: 400, height: 210, fit: "cover" },
  icon: { width: 32, height: 32, fit: "inside" },
  avatar: { width: 144, height: 144, fit: "cover" },
} as const;

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

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

/** sharp can't read .ico: takes its largest image, either an embedded PNG or a 32-bit bitmap (as raw RGBA). */
function decodeIco(buf: Buffer): Sharp {
  let best = { size: 0, offset: 0, length: 0 };
  for (let i = 0; i < buf.readUInt16LE(4); i++) {
    const entry = 6 + 16 * i;
    const size = buf[entry] || 256;
    if (size > best.size) best = { size, offset: buf.readUInt32LE(entry + 12), length: buf.readUInt32LE(entry + 8) };
  }
  const data = buf.subarray(best.offset, best.offset + best.length);
  if (data.subarray(0, 4).equals(PNG_SIGNATURE)) return sharp(data);

  const headerSize = data.readUInt32LE(0);
  const width = data.readInt32LE(4);
  const height = data.readInt32LE(8) / 2; // Doubled to include the AND mask.
  if (data.readUInt16LE(14) !== 32) throw new Error("unsupported .ico bit depth");
  // Rows are stored bottom-up in BGRA.
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = headerSize + ((height - 1 - y) * width + x) * 4;
      const dst = (y * width + x) * 4;
      rgba[dst] = data[src + 2];
      rgba[dst + 1] = data[src + 1];
      rgba[dst + 2] = data[src];
      rgba[dst + 3] = data[src + 3];
    }
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } });
}

const isIco = (buf: Buffer) => buf.readUInt32BE(0) === 0x00000100;

// Many cards share a favicon (every Zenn article), so each image is fetched once.
const imageCache = new Map<string, Promise<string | undefined>>();

// Unbounded, dozens of downloads + conversions at once stall each other past the timeout on small CI runners.
const MAX_CONCURRENT_IMAGES = 6;
let activeImages = 0;
const waitingImages: (() => void)[] = [];

async function withImageSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (activeImages >= MAX_CONCURRENT_IMAGES) await new Promise<void>((resolve) => waitingImages.push(resolve));
  activeImages++;
  try {
    return await fn();
  } finally {
    activeImages--;
    waitingImages.shift()?.();
  }
}

/**
 * Downloads a remote image, shrinks it to WebP under public/cached/ and returns its local path.
 * Files are named by content hash, so /cached/* can be cached forever. Undefined on failure: the UI omits the image.
 */
function cacheImage(url: string, size: keyof typeof IMAGE_SIZES): Promise<string | undefined> {
  const key = `${size}:${url}`;
  if (!imageCache.has(key)) imageCache.set(key, withImageSlot(() => downloadImage(url, size)));
  return imageCache.get(key)!;
}

async function downloadImage(url: string, size: keyof typeof IMAGE_SIZES): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: BROWSER_UA, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok || Number(res.headers.get("content-length")) > MAX_IMAGE_BYTES) {
      await res.body?.cancel(); // Release the connection.
      throw new Error(res.ok ? "too large" : `${res.status}`);
    }
    const input = Buffer.from(await res.arrayBuffer());
    const output = await (isIco(input) ? decodeIco(input) : sharp(input))
      .resize({ ...IMAGE_SIZES[size], withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    const name = `${createHash("sha256").update(output).digest("hex").slice(0, 16)}.webp`;
    await writeFile(new URL(name, IMAGE_DIR), output);
    return IMAGE_PATH + name;
  } catch (err) {
    console.warn(`[fetch-feeds] image failed — ${(err as Error).message} (${url})`);
    return undefined;
  }
}

/** The first candidate that downloads and converts. .ico is tried last: it's often tiny or not an image at all. */
async function firstCachedImage(urls: (string | undefined)[], size: keyof typeof IMAGE_SIZES) {
  const candidates = [...new Set(urls.filter((u) => u !== undefined))];
  candidates.sort((a, b) => Number(/\.ico$/i.test(new URL(a).pathname)) - Number(/\.ico$/i.test(new URL(b).pathname)));
  for (const url of candidates) {
    const local = await cacheImage(url, size);
    if (local) return local;
  }
  return undefined;
}

/** The page's OGP text, plus the remote image URLs to cache once every page has been fetched. */
type RemotePreview = { preview: LinkPreview; image?: string; icons: (string | undefined)[] };

async function fetchPreview(url: string): Promise<RemotePreview> {
  const res = await fetch(url, { headers: BROWSER_UA, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${res.status} (${url})`);
  const html = await res.text();
  // Third-party HTML: keep only https URLs so nothing odd ends up in <img src>.
  const abs = (href: string | undefined) => {
    if (!href || !URL.canParse(href, res.url)) return undefined;
    const url = new URL(href, res.url);
    return url.protocol === "https:" ? url.href : undefined;
  };
  const icons = [...html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/gi)].map((m) => abs(m[1]));
  return {
    preview: {
      title:
        metaContent(html, "og:title") ??
        (decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim() || undefined),
      description: metaContent(html, "og:description") ?? metaContent(html, "description"),
    },
    image: abs(metaContent(html, "og:image")),
    icons: [...icons, abs("/favicon.ico")],
  };
}

/** Speaker Deck's player URL via oEmbed, so slides can be embedded instead of shown as a card. */
async function fetchSpeakerDeckEmbed(url: string): Promise<string | undefined> {
  const data = await getJson<{ html: string }>(`https://speakerdeck.com/oembed.json?url=${encodeURIComponent(url)}`);
  const src = data.html.match(/src="(https:\/\/speakerdeck\.com\/player\/[0-9a-f]+)"/)?.[1];
  return src;
}

/**
 * OGP for every link card on the site, keyed by URL. Missing entries fall back to the plain title.
 * Pages are fetched first and images afterwards, so slow image downloads can't time out the page fetches.
 */
async function fetchPreviews(urls: string[]): Promise<Feeds["previews"]> {
  const remote = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      try {
        const result = await fetchPreview(url);
        if (new URL(url).hostname === "speakerdeck.com") result.preview.embed = await fetchSpeakerDeckEmbed(url);
        return [url, result] as const;
      } catch (err) {
        console.warn(`[fetch-feeds] preview failed — ${(err as Error).message}`);
        return null;
      }
    }),
  );
  const entries = await Promise.all(
    remote
      .filter((e) => e !== null)
      .map(async ([url, { preview, image, icons }]) => {
        const [localImage, favicon] = await Promise.all([
          image && cacheImage(image, "card"),
          firstCachedImage(icons, "icon"),
        ]);
        return [url, { ...preview, image: localImage, favicon }] as const;
      }),
  );
  return Object.fromEntries(entries);
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

// Start clean so images no longer referenced don't pile up.
await rm(IMAGE_DIR, { recursive: true, force: true });
await mkdir(IMAGE_DIR, { recursive: true });

const [zenn, avatarUrl] = await Promise.all([
  settle("zenn", fetchZenn, []),
  settle<string | null>("github avatar", async () => (await cacheImage(await fetchAvatarUrl(), "avatar")) ?? null, null),
]);

const cardUrls = [
  ...Object.values(await loadPosts()).flatMap((posts) => posts.flatMap((p) => p.links.map((l) => l.url))),
  ...zenn.map((a) => a.url),
];
const previews = await settle("link previews", () => fetchPreviews(cardUrls), {});

const feeds: Feeds = { generatedAt: new Date().toISOString(), zenn, avatarUrl, previews };
await writeFile(OUT_FILE, JSON.stringify(feeds, null, 2) + "\n");
