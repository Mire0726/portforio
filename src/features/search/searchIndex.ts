import { activityPosts, careerPosts } from "../../data/posts";
import { feeds } from "../../lib/feeds";
import { postAnchorId, zennAnchorId } from "../channels/anchors";
import { channelLabel, channels, getChannel, type ChannelId } from "../channels/registry";

/** `anchor` is the DOM id of the matching message; channel hits have none and open at the latest message. */
export type SearchHit = { channel: ChannelId; label: string; sub: string; anchor?: string };

const hit = (channel: ChannelId, label: string, sub: string, anchor?: string): SearchHit => ({
  channel,
  label,
  sub: `${channelLabel(getChannel(channel))} · ${sub}`,
  anchor,
});

export const searchIndex: SearchHit[] = [
  ...channels.map((c) => hit(c.id, channelLabel(c), c.topic)),
  ...careerPosts.map((p) => hit("career", p.org, p.stack.join(", "), postAnchorId(p))),
  ...activityPosts.map((p) => hit("activities", p.org, p.role, postAnchorId(p))),
  ...feeds.zenn.map((a) => hit("zenn", `${a.emoji} ${a.title}`, "Zenn", zennAnchorId(a))),
];

export function search(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex.filter((h) => `${h.label} ${h.sub}`.toLowerCase().includes(q)).slice(0, limit);
}
