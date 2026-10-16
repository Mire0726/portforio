import { useState } from "react";

/** Emoji reactions; duplicates are grouped into counts and clicking toggles the viewer's own. */
export function Reactions({ emojis }: { emojis: string[] }) {
  const counts = emojis.reduce<Record<string, number>>((acc, e) => {
    acc[e] = (acc[e] ?? 0) + 1;
    return acc;
  }, {});
  const [mine, setMine] = useState<Record<string, boolean>>({});

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {Object.entries(counts).map(([emoji, n]) => (
        <button
          key={emoji}
          type="button"
          aria-pressed={!!mine[emoji]}
          onClick={() => setMine((m) => ({ ...m, [emoji]: !m[emoji] }))}
          className={`inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border px-2 text-[13px] ${
            mine[emoji]
              ? "border-reaction-mine-line bg-reaction-mine"
              : "border-transparent bg-reaction hover:border-muted"
          }`}
        >
          <span>{emoji}</span>
          <span className="text-xs font-bold">{n + (mine[emoji] ? 1 : 0)}</span>
        </button>
      ))}
    </div>
  );
}
