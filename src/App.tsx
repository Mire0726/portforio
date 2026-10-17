import { useEffect, useRef } from "react";
import { ChannelView } from "./features/channels/ChannelView";
import { channelLabel, getChannel } from "./features/channels/registry";
import { useActiveChannel } from "./features/channels/useActiveChannel";
import { Composer } from "./features/chat/Composer";
import { LocalMessages } from "./features/chat/LocalMessages";
import { useLocalChat } from "./features/chat/useLocalChat";
import { SearchBox } from "./features/search/SearchBox";
import { ChannelHeader } from "./layout/ChannelHeader";
import { MobileHome } from "./layout/MobileHome";
import { Sidebar } from "./layout/Sidebar";

export default function App() {
  const { route, active, visited, navigate, goHome } = useActiveChannel();
  const chat = useLocalChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = getChannel(active);
  const localMessages = chat.messagesIn(active);
  // On mobile, like the Slack app, the channel list is its own screen and a channel replaces it.
  const home = route === null;

  // Like Slack, open each channel scrolled to its latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [route, active, localMessages]);

  return (
    <div className="grid h-dvh grid-cols-1 grid-rows-1 md:grid-cols-[260px_1fr] md:grid-rows-[44px_1fr]">
      <div className="hidden items-center justify-center bg-topbar px-4 md:col-span-2 md:flex">
        <SearchBox onNavigate={navigate} />
      </div>

      <Sidebar active={active} visited={visited} onNavigate={navigate} />
      {home && <MobileHome visited={visited} onNavigate={navigate} />}

      {/* On mobile the header and composer float over the messages, which scroll edge to edge underneath. */}
      <main className={`relative min-h-0 min-w-0 flex-col md:col-start-2 md:row-start-2 md:flex ${home ? "hidden" : "flex"}`}>
        <ChannelHeader channel={channel} onBack={goHome} />
        <div
          className="flex-1 overflow-y-auto pt-4 pb-2 max-md:absolute max-md:inset-0 max-md:pt-20 max-md:pb-[calc(5rem+env(safe-area-inset-bottom))]"
          ref={scrollRef}
        >
          <ChannelView id={active} />
          <LocalMessages messages={localMessages} />
        </div>
        <div className="max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:z-10 max-md:pb-[env(safe-area-inset-bottom)]">
          <Composer
            key={active}
            placeholder={`${channelLabel(channel)} へのメッセージ`}
            onSend={(text) => chat.send(active, text)}
          />
        </div>
      </main>
    </div>
  );
}
