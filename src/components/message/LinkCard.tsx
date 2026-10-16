import type { ReactNode, SyntheticEvent } from "react";

export type LinkPreviewData = {
  description?: string;
  image?: string;
  favicon?: string;
  embed?: string;
};

type Props = {
  url: string;
  title: string;
  preview?: LinkPreviewData;
  /** Extra text after the domain in the footer, e.g. like counts. */
  meta?: ReactNode;
};

const hideOnError = (e: SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = "none";
};

/** Wide bookmark-style link card: text on the left, OGP thumbnail on the right. Embeds slides when possible. */
export function LinkCard({ url, title, preview, meta }: Props) {
  if (preview?.embed) return <SlideEmbed src={preview.embed} title={title} />;

  const host = new URL(url).hostname.replace(/^www\./, "");
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group/card mt-1.5 mb-0.5 flex h-22 max-w-150 overflow-hidden rounded-lg border border-line bg-surface text-fg hover:bg-hover hover:no-underline md:h-26"
    >
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3.5 py-2.5">
        <span className="line-clamp-2 text-sm leading-snug font-bold group-hover/card:underline">{title}</span>
        {preview?.description && <span className="line-clamp-1 text-xs text-muted">{preview.description}</span>}
        <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted">
          {preview?.favicon && (
            <img className="size-3.5 rounded-xs" src={preview.favicon} alt="" loading="lazy" onError={hideOnError} />
          )}
          <span>{host}</span>
          {meta && <span>· {meta}</span>}
        </span>
      </span>
      {preview?.image && (
        <img
          className="aspect-square h-full shrink-0 border-l border-line object-cover md:aspect-[1.91/1]"
          src={preview.image}
          alt=""
          loading="lazy"
          onError={hideOnError}
        />
      )}
    </a>
  );
}

/** Speaker Deck player (16:9). Only speakerdeck.com is allowed to be framed by the CSP in public/_headers. */
function SlideEmbed({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      allowFullScreen
      loading="lazy"
      className="mt-1.5 mb-0.5 aspect-video w-full max-w-150 rounded-lg border border-line bg-surface"
    />
  );
}
