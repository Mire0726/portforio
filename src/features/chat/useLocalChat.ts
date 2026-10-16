import { useCallback, useState } from "react";
import { formatClock } from "../../lib/date";
import type { ChannelId } from "../channels/registry";

// The composer is decorative: messages stay in memory and get a canned reply.

export type LocalMessage = { id: number; from: "guest" | "me"; text: string; time: string };

const AUTO_REPLY = "メッセージありがとうございます！ ご連絡は X の DM へ!";

const NO_MESSAGES: LocalMessage[] = [];
let nextId = 0;

export function useLocalChat() {
  const [byChannel, setByChannel] = useState<Partial<Record<ChannelId, LocalMessage[]>>>({});

  const send = useCallback((channel: ChannelId, text: string) => {
    const time = formatClock(new Date());
    const added: LocalMessage[] = [
      { id: nextId++, from: "guest", text, time },
      { id: nextId++, from: "me", text: AUTO_REPLY, time },
    ];
    setByChannel((prev) => ({ ...prev, [channel]: [...(prev[channel] ?? []), ...added] }));
  }, []);

  const messagesIn = useCallback((channel: ChannelId) => byChannel[channel] ?? NO_MESSAGES, [byChannel]);

  return { send, messagesIn };
}
