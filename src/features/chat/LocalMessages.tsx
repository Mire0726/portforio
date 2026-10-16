import { Message } from "../../components/message/Message";
import { guest, me } from "../authors";
import type { LocalMessage } from "./useLocalChat";

export function LocalMessages({ messages }: { messages: LocalMessage[] }) {
  return messages.map((m) => (
    <Message key={m.id} author={m.from === "me" ? me : guest} time={m.time}>
      <p>{m.text}</p>
    </Message>
  ));
}
