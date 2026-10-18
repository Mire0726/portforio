import type { ZennArticle } from "../../lib/feeds";
import type { Post } from "../../lib/posts";

// DOM ids of individual messages, so the career pin and search results can jump to them.

/** e.g. "post-2025-01-monolu". */
export const postAnchorId = (p: Post) => `post-${p.file.replace(/^.*\//, "").replace(/\.md$/, "")}`;

/** e.g. "zenn-a1b2c3d4e5f6", from the article's slug. */
export const zennAnchorId = (a: ZennArticle) => `zenn-${a.url.replace(/^.*\//, "")}`;

/** Scrolls the message list to a message and briefly highlights it. */
export function jumpToMessage(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.setAttribute("data-flash", "");
  setTimeout(() => el.removeAttribute("data-flash"), 1200);
}
