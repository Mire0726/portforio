declare module "virtual:posts" {
  import type { Post } from "./lib/posts";
  export const careerPosts: Post[];
  export const activityPosts: Post[];
}
