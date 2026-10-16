import { channelLabel, type Channel } from "../features/channels/registry";

type Props = { channel: Channel; menuOpen: boolean; onOpenMenu: () => void };

export function ChannelHeader({ channel, menuOpen, onOpenMenu }: Props) {
  return (
    <header className="flex min-h-13 items-center gap-2 border-b border-line px-4 py-1.5 md:px-5">
      <button
        type="button"
        aria-label="チャンネル一覧を開く"
        aria-controls="sidebar"
        aria-expanded={menuOpen}
        onClick={onOpenMenu}
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center text-xl md:hidden"
      >
        ☰
      </button>
      <div className="min-w-0">
        <h1 className="text-lg leading-tight font-black">{channelLabel(channel).replace(/^#/, "# ")}</h1>
        <p className="truncate text-[13px] text-muted">{channel.topic}</p>
      </div>
    </header>
  );
}
