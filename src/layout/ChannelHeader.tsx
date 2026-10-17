import { channelLabel, type Channel } from "../features/channels/registry";

type Props = { channel: Channel; onBack: () => void };

/**
 * On mobile, like Slack for iOS 26, the header floats over the messages: a glass back
 * button and a glass title capsule, over a fade so scrolled text doesn't clash with them.
 */
export function ChannelHeader({ channel, onBack }: Props) {
  return (
    <header className="flex min-h-13 items-center gap-2 border-b border-line px-5 py-1.5 max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:z-10 max-md:border-0 max-md:bg-linear-to-b max-md:from-surface max-md:via-surface/85 max-md:to-transparent max-md:px-3 max-md:pt-2 max-md:pb-6">
      <button
        type="button"
        aria-label="チャンネル一覧に戻る"
        onClick={onBack}
        className="glass inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg md:hidden"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="min-w-0 max-md:glass max-md:mx-auto max-md:rounded-full max-md:px-5 max-md:py-1 max-md:text-center">
        <h1 className="text-lg leading-tight font-black max-md:text-base">{channelLabel(channel).replace(/^#/, "# ")}</h1>
        <p className="truncate text-[13px] text-muted max-md:text-[11px]">{channel.topic}</p>
      </div>
      {/* Mirrors the back button so the title capsule sits centered. */}
      <span className="size-11 shrink-0 md:hidden" aria-hidden />
    </header>
  );
}
