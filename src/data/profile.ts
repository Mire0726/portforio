// Profile, skills and links from content/profile.md — edit that file, not this one.
import * as content from "virtual:content";
import type { Profile } from "../lib/profile";

export const profile = content.profile as Profile;
export const { links, skills, spokenLanguages } = profile;
