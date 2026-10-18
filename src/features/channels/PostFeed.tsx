import { Fragment } from "react";
import { Message } from "../../components/message/Message";
import { LinkCard } from "../../components/message/LinkCard";
import { Chips, DateDivider } from "../../components/message/parts";
import { feeds } from "../../lib/feeds";
import type { Post } from "../../lib/posts";
import { me } from "../authors";
import { postAnchorId } from "./anchors";

/** Posts (already sorted oldest first) as messages, with a divider at each new year. */
export function PostFeed({ posts }: { posts: Post[] }) {
  const yearOf = (p: Post | undefined) => p?.period.slice(0, 4);

  return posts.map((p, i) => (
    <Fragment key={p.file}>
      {yearOf(p) !== yearOf(posts[i - 1]) && <DateDivider label={`${yearOf(p)}年`} />}
      <Message id={postAnchorId(p)} author={me} time={p.period} reactions={p.reactions}>
        <p>
          <strong>{p.org}</strong> <span className="text-muted">— {p.role}</span>
        </p>
        {p.body.map((paragraph, j) => (
          <p key={j}>{paragraph}</p>
        ))}
        {p.stack.length > 0 && <Chips items={p.stack} />}
        {p.links.map((l) => (
          <LinkCard key={l.url} url={l.url} title={l.title} preview={feeds.previews[l.url]} />
        ))}
        {p.note && <p className="text-muted">{p.note}</p>}
      </Message>
    </Fragment>
  ));
}
