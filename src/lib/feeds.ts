import generated from "../data/feeds.generated.json";

// Shape of src/data/feeds.generated.json, written by scripts/fetch-feeds.ts before dev/build.

export type ZennArticle = {
  title: string;
  emoji: string;
  url: string;
  type: "tech" | "idea";
  likes: number;
  publishedAt: string;
};

/** OGP metadata for a link card. */
export type LinkPreview = {
  title?: string;
  description?: string;
  /** Local paths under /cached/ (shrunk copies made at build time). */
  image?: string;
  favicon?: string;
  /** Embeddable player URL (Speaker Deck slides), shown instead of the card. */
  embed?: string;
};

export type Feeds = {
  generatedAt: string;
  zenn: ZennArticle[];
  /** GitHub avatar (local path under /cached/), used as the profile picture. */
  avatarUrl: string | null;
  /** Keyed by URL. */
  previews: Record<string, LinkPreview>;
};

export const feeds = generated as Feeds;
