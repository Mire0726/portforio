import { useRef, useState, type FocusEvent } from "react";
import { profile } from "../../data/profile";
import type { ChannelId } from "../channels/registry";
import { search } from "./searchIndex";

type Props = {
  onNavigate: (id: ChannelId) => void;
  /** "topbar" sits in the desktop top bar; "sheet" is the mobile search field at the bottom, with results opening upward. */
  variant?: "topbar" | "sheet";
  autoFocus?: boolean;
};

const inputClass = {
  topbar:
    "h-7 w-full rounded-md border border-white/20 bg-white/15 px-3 text-[13px] text-white transition-colors placeholder:text-white/70 focus:border-line focus:bg-surface focus:text-fg focus:outline-none focus:placeholder:text-muted",
  // 16px keeps iOS Safari from zooming in on focus.
  sheet: "h-11 w-full bg-transparent px-4 text-base text-fg outline-none placeholder:text-muted",
};

const resultsClass = {
  topbar: "top-8.5 rounded-lg border border-line bg-surface shadow-lg",
  sheet: "glass bottom-13 max-h-[60dvh] overflow-y-auto rounded-3xl",
};

export function SearchBox({ onNavigate, variant = "topbar", autoFocus }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = search(query);
  const showResults = focused && query.trim() !== "";

  // Keep the results open while focus moves between the input and the result buttons.
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  };

  return (
    <div className="relative w-full max-w-160" onFocus={() => setFocused(true)} onBlur={onBlur}>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          setQuery("");
          inputRef.current?.blur();
        }}
        autoFocus={autoFocus}
        placeholder={variant === "sheet" ? "検索（例: Go, AWS）" : `🔍 ${profile.name}'s Portfolio 内を検索（例: Go, AWS）`}
        aria-label="検索"
        className={inputClass[variant]}
      />
      {showResults && (
        <ul
          className={`absolute inset-x-0 z-20 py-1.5 ${resultsClass[variant]}`}
          // Safari doesn't focus buttons on click, so the input's blur would close the list before the click lands.
          onMouseDown={(e) => e.preventDefault()}
        >
          {hits.length === 0 && <li className="truncate px-3.5 py-1.5 text-xs text-muted">「{query}」に一致する結果はありません</li>}
          {hits.map((h, i) => (
            <li key={`${h.channel}:${h.label}:${i}`}>
              <button
                type="button"
                className="group/hit flex w-full cursor-pointer flex-col items-start px-3.5 py-1.5 text-left hover:bg-link hover:text-white"
                onClick={() => {
                  onNavigate(h.channel);
                  setQuery("");
                  inputRef.current?.blur();
                }}
              >
                <span className="font-bold">{h.label}</span>
                <span className="max-w-full truncate text-xs text-muted group-hover/hit:text-white/85">{h.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
