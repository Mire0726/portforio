import { ExternalLink } from "../../components/message/parts";

export function FeedUnavailable({ url, label }: { url: string; label: string }) {
  return (
    <p className="px-4 py-2 text-muted md:px-5">
      読み込めませんでした。<ExternalLink href={url}>{label} で見る →</ExternalLink>
    </p>
  );
}
