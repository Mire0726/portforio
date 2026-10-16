import { Message } from "../../../components/message/Message";
import { ChannelIntro, ExternalLink } from "../../../components/message/parts";
import { links, profile } from "../../../data/profile";
import { me, MyAvatar } from "../../authors";

export function ContactChannel() {
  return (
    <>
      <ChannelIntro title={profile.name} icon={<MyAvatar size="lg" />}>
        これは <strong>{profile.name}</strong> とのダイレクトメッセージです。
      </ChannelIntro>
      <Message author={me} time="now" reactions={["🙏"]}>
        <p>
          ご連絡は <ExternalLink href={links.x.url}>X の DM</ExternalLink> からお気軽にどうぞ！
        </p>
        <p>{profile.hiring}</p>
        <ul className="list-none! pl-0!">
          {Object.values(links).map((l) => (
            <li key={l.url}>
              🔗 {l.label}: <ExternalLink href={l.url}>{l.display}</ExternalLink>
            </li>
          ))}
        </ul>
      </Message>
    </>
  );
}
