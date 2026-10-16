import type { ReactNode } from "react";
import { Reactions } from "./Reactions";

export type Author = { name: string; avatar: ReactNode; bot?: boolean };

type Props = {
  /** DOM id, so other messages can scroll to this one. */
  id?: string;
  author: Author;
  time: string;
  children: ReactNode;
  reactions?: string[];
  /** Hides the avatar and name, like Slack does for consecutive posts by the same author. */
  compact?: boolean;
};

export function Message({ id, author, time, children, reactions, compact }: Props) {
  return (
    <article
      id={id}
      className={`group flex scroll-mt-4 gap-2 px-4 transition-colors duration-700 hover:bg-hover target-flash:bg-reaction-mine md:px-5 ${compact ? "pt-0.5 pb-2" : "py-2"}`}
    >
      <div className="w-9 shrink-0">
        {compact ? (
          <span className="invisible block pt-1 text-right text-[11px] text-muted group-hover:visible">{time}</span>
        ) : (
          author.avatar
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!compact && (
          <header className="flex items-baseline gap-2">
            <span className="font-black">{author.name}</span>
            {author.bot && (
              <span className="rounded-sm bg-chip px-1 text-[10px] font-bold text-muted">APP</span>
            )}
            <time className="text-xs text-muted">{time}</time>
          </header>
        )}
        <div className="[&_p]:mb-1 [&_ul]:mb-1 [&_ul]:list-disc [&_ul]:pl-5.5">{children}</div>
        {reactions && reactions.length > 0 && <Reactions emojis={reactions} />}
      </div>
    </article>
  );
}
