import type { Author } from "../components/message/Message";
import { Avatar } from "../components/message/parts";
import { profile } from "../data/profile";
import { feeds } from "../lib/feeds";

// Who posts messages. Shared by the channels and chat features.

export function MyAvatar({ size }: { size?: "md" | "lg" }) {
  return <Avatar src={feeds.avatarUrl ?? undefined} label="S" color="#7c5cbf" size={size} />;
}

export const me: Author = {
  name: profile.name,
  avatar: <MyAvatar />,
};

export const guest: Author = {
  name: "あなた",
  avatar: <Avatar label="👀" color="#2eb67d" />,
};

export const bots = {
  zenn: { name: "Zenn", bot: true, avatar: <Avatar label="Z" color="#3ea8ff" /> },
} satisfies Record<string, Author>;
