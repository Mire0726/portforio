import { Message } from "../../../components/message/Message";
import { ChannelIntro, DateDivider } from "../../../components/message/parts";
import { careerPosts } from "../../../data/posts";
import { me } from "../../authors";
import { jumpToPost, PostFeed } from "../PostFeed";

export function CareerChannel() {
  const ongoing = careerPosts.filter((p) => p.ongoing);

  return (
    <>
      <ChannelIntro title="# career">業務委託・インターンなど、エンジニアとしての実務経験を時系列で並べています。</ChannelIntro>
      <PostFeed posts={careerPosts} />

      {/* Pinned at the bottom, which is where the channel opens. */}
      {ongoing.length > 0 && (
        <>
          <DateDivider label="📌 現在" />
          <Message author={me} time="pinned 📌" reactions={["💪"]}>
            <p>
              <strong>現在の仕事</strong>
            </p>
            <ul className="list-none! pl-0!">
              {ongoing.map((p) => (
                <li key={p.file}>
                  <button
                    type="button"
                    onClick={() => jumpToPost(p)}
                    className="cursor-pointer text-left text-link hover:underline"
                  >
                    {p.org}
                  </button>{" "}
                  <span className="text-muted">
                    — {p.role}（{p.period}）
                  </span>
                </li>
              ))}
            </ul>
          </Message>
        </>
      )}
    </>
  );
}
