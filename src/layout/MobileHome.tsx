import { useState, type ReactNode } from "react";
import { links, profile } from "../data/profile";
import { channels, type ChannelId } from "../features/channels/registry";
import { SearchBox } from "../features/search/SearchBox";

type Props = {
  visited: ReadonlySet<ChannelId>;
  onNavigate: (id: ChannelId) => void;
};

/**
 * The mobile home screen, modeled on Slack for iOS 26: the channel list as a full screen,
 * with a floating glass tab bar and a separate search button at the bottom.
 */
export function MobileHome({ visited, onNavigate }: Props) {
  const [searching, setSearching] = useState(false);

  return (
    <div className="relative row-span-full min-h-0 md:hidden">
      <div className="h-full overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <header className="bg-sidebar px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-lg font-black" aria-hidden>
              {profile.name[0]}
            </span>
            <div className="min-w-0">
              <p className="text-xl leading-tight font-black">{profile.name}'s Portfolio</p>
              <p className="flex items-center gap-1.5 text-[13px] text-sidebar-muted">
                <Presence /> {profile.title}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[13px] text-sidebar-muted">{profile.status}</p>
        </header>

        <nav aria-label="チャンネル一覧">
          <Section title="チャンネル">
            {channels
              .filter((c) => c.kind === "channel")
              .map((c) => (
                <Row key={c.id} icon="#" label={c.name} unread={!visited.has(c.id)} onClick={() => onNavigate(c.id)} />
              ))}
          </Section>
          <Section title="ダイレクトメッセージ">
            {channels
              .filter((c) => c.kind === "dm")
              .map((c) => (
                <Row key={c.id} icon={<Presence />} label={c.name} unread={!visited.has(c.id)} onClick={() => onNavigate(c.id)} />
              ))}
          </Section>
          <Section title="外部リンク">
            {Object.values(links).map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className={`${rowBase} text-muted hover:no-underline`}>
                <span className={rowIcon}>↗</span>
                {l.label}
              </a>
            ))}
          </Section>
        </nav>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {searching ? (
          <>
            <div className="glass min-w-0 flex-1 rounded-full">
              <SearchBox
                variant="sheet"
                autoFocus
                onNavigate={(id) => {
                  setSearching(false);
                  onNavigate(id);
                }}
              />
            </div>
            <GlassCircle label="検索を閉じる" onClick={() => setSearching(false)}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </GlassCircle>
          </>
        ) : (
          <>
            <nav aria-label="タブ" className="glass flex flex-1 rounded-full p-1">
              <Tab label="ホーム" current>
                <path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" strokeLinejoin="round" />
              </Tab>
              <Tab label="DM" onClick={() => onNavigate("contact")}>
                <path d="M5 5h14v10H10l-4 4v-4H5z" strokeLinejoin="round" />
              </Tab>
            </nav>
            <GlassCircle label="検索" onClick={() => setSearching(true)}>
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l4 4" strokeLinecap="round" />
            </GlassCircle>
          </>
        )}
      </div>
    </div>
  );
}

const rowBase = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[17px] active:bg-hover";
const rowIcon = "inline-flex w-5 justify-center text-muted";

function Presence() {
  return <span className="inline-block size-2.25 rounded-full bg-presence" />;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="px-4 pb-1 text-[13px] font-bold text-muted">{title}</h2>
      {children}
    </section>
  );
}

type RowProps = { icon: ReactNode; label: string; unread: boolean; onClick: () => void };

function Row({ icon, label, unread, onClick }: RowProps) {
  return (
    <button type="button" onClick={onClick} className={`${rowBase} cursor-pointer ${unread ? "font-black text-fg" : "text-muted"}`}>
      <span className={rowIcon}>{icon}</span>
      {label}
    </button>
  );
}

type TabProps = { label: string; current?: boolean; onClick?: () => void; children: ReactNode };

function Tab({ label, current, onClick, children }: TabProps) {
  return (
    <button
      type="button"
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={`flex flex-1 cursor-pointer flex-col items-center rounded-full py-1 text-[10px] font-bold ${
        current ? "bg-fg/8 text-link" : "text-fg"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        {children}
      </svg>
      {label}
    </button>
  );
}

function GlassCircle({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass inline-flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
