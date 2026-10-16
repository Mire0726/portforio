// Career / activity posts from content/<channel>/*.md (see content/_template.md).
import * as content from "virtual:content";
import type { Post } from "../lib/posts";

export const careerPosts = content.careerPosts as Post[];
export const activityPosts = content.activityPosts as Post[];
