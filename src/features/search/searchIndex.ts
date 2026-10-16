import { activityPosts, careerPosts } from "../../data/posts";
import { feeds } from "../../lib/feeds";
import { channelLabel, channels, getChannel, type ChannelId } from "../channels/registry";

export type SearchHit = { channel: ChannelId; label: string; sub: string };

const hit = (channel: ChannelId, label: string, sub: string): SearchHit => ({
  channel,
  label,
  sub: `${channelLabel(getChannel(channel))} · ${sub}`,
});

export const searchIndex: SearchHit[] = [
  ...channels.map((c) => hit(c.id, channelLabel(c), c.topic)),
  ...careerPosts.map((p) => hit("career", p.org, p.stack.join(", "))),
  ...activityPosts.map((p) => hit("activities", p.org, p.role)),
  ...feeds.zenn.map((a) => hit("zenn", `${a.emoji} ${a.title}`, "Zenn")),
];

export function search(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex.filter((h) => `${h.label} ${h.sub}`.toLowerCase().includes(q)).slice(0, limit);
}
