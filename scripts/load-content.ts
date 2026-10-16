// Reads and parses content/ on the Node side: content/profile.md and content/<channel>/*.md.
// Used by the Vite plugin (vite.config.ts) and scripts/fetch-feeds.ts, so YAML parsing never ships to the browser.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isContentFile } from "../src/lib/frontmatter.ts";
import { parsePost, periodStart, type Post } from "../src/lib/posts.ts";
import { parseProfile, type Profile } from "../src/lib/profile.ts";

export const CONTENT_DIR = fileURLToPath(new URL("../content/", import.meta.url));

export const POST_CHANNELS = ["career", "activities"] as const;
export type PostChannel = (typeof POST_CHANNELS)[number];

export async function loadProfile(): Promise<Profile> {
  return parseProfile("content/profile.md", await readFile(path.join(CONTENT_DIR, "profile.md"), "utf8"));
}

/** Posts per channel, oldest first (Slack reads top-to-bottom). Throws with the file name on invalid posts. */
export async function loadPosts(): Promise<Record<PostChannel, Post[]>> {
  const entries = await Promise.all(
    POST_CHANNELS.map(async (channel) => {
      const dir = path.join(CONTENT_DIR, channel);
      const files = (await readdir(dir)).filter(isContentFile);
      const posts = await Promise.all(
        files.map(async (f) => parsePost(`content/${channel}/${f}`, await readFile(path.join(dir, f), "utf8"))),
      );
      posts.sort((a, b) => periodStart(a.period) - periodStart(b.period));
      return [channel, posts] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<PostChannel, Post[]>;
}
