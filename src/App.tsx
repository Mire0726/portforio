import { useEffect, useRef, useState } from "react";
import { ChannelView } from "./features/channels/ChannelView";
import { channelLabel, getChannel, type ChannelId } from "./features/channels/registry";
import { useActiveChannel } from "./features/channels/useActiveChannel";
import { Composer } from "./features/chat/Composer";
import { LocalMessages } from "./features/chat/LocalMessages";
import { useLocalChat } from "./features/chat/useLocalChat";
import { SearchBox } from "./features/search/SearchBox";
import { ChannelHeader } from "./layout/ChannelHeader";
import { Sidebar } from "./layout/Sidebar";

export default function App() {
  const { active, visited, navigate } = useActiveChannel();
  const chat = useLocalChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = getChannel(active);
  const localMessages = chat.messagesIn(active);

  const go = (id: ChannelId) => {
    setSidebarOpen(false);
    navigate(id);
  };

  // Like Slack, open each channel scrolled to its latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active, localMessages]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="grid h-dvh grid-cols-1 grid-rows-[44px_1fr] md:grid-cols-[260px_1fr]">
      <div className="flex items-center justify-center bg-topbar px-4 md:col-span-2">
        <SearchBox onNavigate={go} />
      </div>

      <Sidebar
        active={active}
        visited={visited}
        onNavigate={go}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="row-start-2 flex min-h-0 min-w-0 flex-col md:col-start-2">
        <ChannelHeader channel={channel} menuOpen={sidebarOpen} onOpenMenu={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto pt-4 pb-2" ref={scrollRef}>
          <ChannelView id={active} />
          <LocalMessages messages={localMessages} />
        </div>
        <Composer
          key={active}
          placeholder={`${channelLabel(channel)} へのメッセージ`}
          onSend={(text) => chat.send(active, text)}
        />
      </main>
    </div>
  );
}
