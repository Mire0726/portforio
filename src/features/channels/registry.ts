import { links, profile } from "../../data/profile";

// Channel metadata only; the views live in ./views and are wired up in ChannelView.

export type ChannelId = "about" | "career" | "activities" | "zenn" | "contact";

export type Channel = {
  id: ChannelId;
  name: string;
  kind: "channel" | "dm";
  topic: string;
};

export const channels: Channel[] = [
  { id: "about", name: "about", kind: "channel", topic: "はじめまして！ 自己紹介とスキル" },
  { id: "career", name: "career", kind: "channel", topic: "業務委託・インターンなどの実務経験" },
  { id: "activities", name: "activities", kind: "channel", topic: "ハッカソン・コミュニティ・その他の活動" },
  { id: "zenn", name: "zenn", kind: "channel", topic: `Zenn に書いた記事 · ${links.zenn.url}` },
  { id: "contact", name: profile.name, kind: "dm", topic: "連絡先・リンク" },
];

export const DEFAULT_CHANNEL: ChannelId = "about";

export const isChannelId = (v: string): v is ChannelId => channels.some((c) => c.id === v);

export const getChannel = (id: ChannelId): Channel => channels.find((c) => c.id === id)!;

/** "#career" for channels, the bare name for DMs. */
export const channelLabel = (c: Channel): string => (c.kind === "channel" ? `#${c.name}` : c.name);
