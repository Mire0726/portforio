import { useState, type ReactNode } from "react";
import { links, profile } from "../data/profile";
import { channels, type Channel, type ChannelId } from "../features/channels/registry";

type Props = {
  active: ChannelId;
  visited: ReadonlySet<ChannelId>;
  onNavigate: (id: ChannelId) => void;
};

const itemBase = "mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-md px-2.5 py-1 text-left text-[15px]";

function Presence() {
  return <span className="inline-block size-2.25 rounded-full bg-presence" />;
}

/** Desktop only; on mobile the channel list is its own screen (MobileHome). */
export function Sidebar({ active, visited, onNavigate }: Props) {
  const item = (c: Channel, icon: ReactNode) => (
    <SidebarItem
      key={c.id}
      label={c.name}
      icon={icon}
      active={active === c.id}
      unread={!visited.has(c.id)}
      onClick={() => onNavigate(c.id)}
    />
  );

  return (
    <aside
      aria-label="チャンネル一覧"
      className="col-start-1 row-start-2 hidden overflow-y-auto border-r border-white/10 bg-sidebar text-sidebar-fg md:block"
    >
      <div className="flex flex-col border-b border-white/10 px-4 py-3 text-[17px] font-black text-white">
        <span>{profile.name}'s Portfolio</span>
        <span className="flex items-center gap-1.5 text-[13px] font-normal text-sidebar-muted">
          <Presence /> {profile.title}
        </span>
        <span className="text-[13px] font-normal text-sidebar-muted">{profile.status}</span>
      </div>
      <nav className="pt-2 pb-6">
        <SidebarSection title="チャンネル">
          {channels.filter((c) => c.kind === "channel").map((c) => item(c, "#"))}
        </SidebarSection>
        <SidebarSection title="ダイレクトメッセージ">
          {channels.filter((c) => c.kind === "dm").map((c) => item(c, <Presence />))}
        </SidebarSection>
        <SidebarSection title="外部リンク">
          {Object.values(links).map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className={`${itemBase} text-sidebar-muted hover:bg-sidebar-hover hover:no-underline`}
            >
              <span className="inline-flex w-4 justify-center opacity-90">↗</span>
              <span>{l.label}</span>
            </a>
          ))}
        </SidebarSection>
      </nav>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-0.5 text-left text-sm text-sidebar-muted"
      >
        <span className={`inline-block transition-transform duration-150 ${open ? "" : "-rotate-90"}`}>▾</span>
        {title}
      </button>
      {open && children}
    </section>
  );
}

type ItemProps = {
  label: string;
  icon: ReactNode;
  active: boolean;
  unread: boolean;
  onClick: () => void;
};

function SidebarItem({ label, icon, active, unread, onClick }: ItemProps) {
  const state = active
    ? "bg-sidebar-active text-sidebar-active-fg"
    : unread
      ? "font-black text-white hover:bg-sidebar-hover"
      : "text-sidebar-muted hover:bg-sidebar-hover";
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`${itemBase} cursor-pointer ${state}`}
    >
      <span className="inline-flex w-4 justify-center opacity-90">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
