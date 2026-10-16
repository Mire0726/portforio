import { ChannelIntro } from "../../../components/message/parts";
import { activityPosts } from "../../../data/posts";
import { PostFeed } from "../PostFeed";

export function ActivitiesChannel() {
  return (
    <>
      <ChannelIntro title="# activities">ハッカソン、コミュニティ、エンジニア以外の経験など。</ChannelIntro>
      <PostFeed posts={activityPosts} />
    </>
  );
}
