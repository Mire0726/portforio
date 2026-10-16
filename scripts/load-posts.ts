// Reads and parses content/<channel>/*.md on the Node side.
// Used by the Vite plugin (vite.config.ts) and scripts/fetch-feeds.ts, so YAML parsing never ships to the browser.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isPostFile, parsePost, periodStart, type Post } from "../src/lib/posts.ts";

export const CONTENT_DIR = fileURLToPath(new URL("../content/", import.meta.url));

export const POST_CHANNELS = ["career", "activities"] as const;
export type PostChannel = (typeof POST_CHANNELS)[number];

/** Posts per channel, oldest first (Slack reads top-to-bottom). Throws with the file name on invalid posts. */
export async function loadPosts(): Promise<Record<PostChannel, Post[]>> {
  const entries = await Promise.all(
    POST_CHANNELS.map(async (channel) => {
      const dir = path.join(CONTENT_DIR, channel);
      const files = (await readdir(dir)).filter(isPostFile);
      const posts = await Promise.all(
        files.map(async (f) => parsePost(`content/${channel}/${f}`, await readFile(path.join(dir, f), "utf8"))),
      );
      posts.sort((a, b) => periodStart(a.period) - periodStart(b.period));
      return [channel, posts] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<PostChannel, Post[]>;
}
