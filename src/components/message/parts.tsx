import type { ReactNode } from "react";

// Small presentational building blocks shared by channel views.

type AvatarProps = { src?: string; label: string; color?: string; size?: "md" | "lg" };

export function Avatar({ src, label, color, size = "md" }: AvatarProps) {
  const box = size === "lg" ? "size-18 rounded-xl text-[28px]" : "size-9 rounded-md text-sm";
  return src ? (
    <img className={`block object-cover ${box}`} src={src} alt="" />
  ) : (
    <span
      className={`flex items-center justify-center font-black text-white ${box}`}
      style={{ background: color }}
      aria-hidden
    >
      {label}
    </span>
  );
}

export function Chips({ items }: { items: string[] }) {
  return (
    <span className="my-1 flex flex-wrap gap-1">
      {items.map((s) => (
        <code key={s} className="rounded border border-line bg-chip px-1.5 py-px font-mono text-xs text-chip-fg">
          {s}
        </code>
      ))}
    </span>
  );
}

export function DateDivider({ label }: { label: string }) {
  return (
    <div className="relative mt-5 mb-2 flex justify-center" role="separator">
      <span className="absolute inset-x-0 top-1/2 border-t border-line" />
      <span className="relative rounded-full border border-line bg-surface px-3.5 py-0.5 text-[13px] font-bold">
        {label}
      </span>
    </div>
  );
}

/** The header block Slack shows at the very top of a channel's history. */
export function ChannelIntro({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="px-4 pt-6 pb-4 md:px-5">
      {icon}
      <h2 className="mt-2 mb-1 text-[22px] font-black">{title}</h2>
      <p className="text-muted">{children}</p>
    </div>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
