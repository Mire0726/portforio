import { Fragment } from "react";
import { Message } from "../../../components/message/Message";
import { LinkCard } from "../../../components/message/LinkCard";
import { DateDivider } from "../../../components/message/parts";
import { links } from "../../../data/profile";
import { formatDate, formatMonth } from "../../../lib/date";
import { feeds } from "../../../lib/feeds";
import { bots } from "../../authors";
import { FeedUnavailable } from "../FeedUnavailable";

export function ZennChannel() {
  if (feeds.zenn.length === 0) return <FeedUnavailable url={links.zenn.url} label="Zenn" />;

  // API order is newest first; Slack reads oldest first.
  const articles = [...feeds.zenn].reverse();
  return articles.map((a, i) => {
    const month = formatMonth(a.publishedAt);
    const newMonth = i === 0 || month !== formatMonth(articles[i - 1].publishedAt);
    return (
      <Fragment key={a.url}>
        {newMonth && <DateDivider label={month} />}
        <Message author={bots.zenn} time={formatDate(a.publishedAt)} compact={!newMonth}>
          {newMonth && <p>新しい記事が公開されました</p>}
          <LinkCard
            url={a.url}
            title={`${a.emoji} ${a.title}`}
            preview={feeds.previews[a.url]}
            meta={`${a.type === "tech" ? "Tech" : "Idea"} · ♡ ${a.likes}`}
          />
        </Message>
      </Fragment>
    );
  });
}
