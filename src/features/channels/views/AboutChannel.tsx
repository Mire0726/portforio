import { Message } from "../../../components/message/Message";
import { ChannelIntro, Chips, ExternalLink } from "../../../components/message/parts";
import { languagesSpoken, links, profile, skills } from "../../../data/profile";
import { me } from "../../authors";

export function AboutChannel() {
  return (
    <>
      <ChannelIntro title="# about">
        <strong>{profile.name}</strong> のワークスペースへようこそ 👋
        左のチャンネルから経歴や記事をのぞいてみてください。
      </ChannelIntro>

      <Message author={me} time="pinned 📌" reactions={["👋", "💜", "🎉"]}>
        <p>
          はじめまして！ <strong>{profile.name}</strong> です。{profile.title} をしています。
        </p>
        <p>{profile.bio}</p>
        <p className="text-muted">🎓 {profile.school}</p>
      </Message>

      <Message author={me} time="pinned 📌" compact reactions={["💼", "🙌"]}>
        <p>
          <strong>{profile.status}</strong>
        </p>
        <p>
          {profile.hiring} ご連絡は <ExternalLink href={links.x.url}>X の DM</ExternalLink> か{" "}
          <a href="#/contact">DM チャンネル</a> のリンクからどうぞ。
        </p>
      </Message>

      <Message author={me} time="pinned 📌" compact>
        <p>
          <strong>💻 Languages</strong>
        </p>
        <Chips items={skills.languages} />
        <p>
          <strong>🧰 Infra / Tools</strong>
        </p>
        <Chips items={skills.others} />
      </Message>

      <Message author={me} time="pinned 📌" compact reactions={["🌏"]}>
        <p>
          <strong>🗣️ 語学</strong>
        </p>
        <ul>
          {languagesSpoken.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Message>
    </>
  );
}
