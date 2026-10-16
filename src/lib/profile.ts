import { readContent } from "./frontmatter.ts";

// Parses content/profile.md. Node side only; see scripts/load-content.ts.

export type ProfileLink = {
  label: string;
  /** Account name; github / zenn are used by scripts/fetch-feeds.ts. */
  user?: string;
  /** Text shown for the link in the contact DM. */
  display: string;
  url: string;
};

/** github / zenn / x are referenced by name in the code; others (e.g. linkedin) just appear in the lists. */
const REQUIRED_LINKS = ["github", "zenn", "x"] as const;
type RequiredLink = (typeof REQUIRED_LINKS)[number];

export type Profile = {
  name: string;
  title: string;
  /** Slack-style custom status shown under the name in the sidebar. */
  status: string;
  school: string;
  /** Self-introduction paragraphs (the file body). */
  bio: string[];
  /** Shown as a pinned post in #about and in the contact DM. */
  hiring: string;
  skills: { languages: string[]; tools: string[] };
  spokenLanguages: string[];
  links: Record<RequiredLink, ProfileLink & { user: string }> & Record<string, ProfileLink>;
};

export function parseProfile(file: string, raw: string): Profile {
  const { fields: f, body } = readContent(file, raw);
  if (body.length === 0) f.fail("本文（自己紹介）が空です");

  const skills = f.record("skills");
  const links = Object.fromEntries(
    Object.entries(f.record("links")).map(([id, v]) => {
      const l = f.record(`links.${id}`, v);
      const user = l.user === undefined ? undefined : f.str(`links.${id}.user`, l.user);
      return [
        id,
        {
          label: f.str(`links.${id}.label`, l.label),
          user,
          display: f.str(`links.${id}.display`, l.display),
          url: f.url(`links.${id}.url`, l.url),
        },
      ];
    }),
  );
  for (const id of REQUIRED_LINKS) {
    if (!links[id]?.user) f.fail(`links.${id} は必須です（user も書いてください）`);
  }

  return {
    name: f.str("name"),
    title: f.str("title"),
    status: f.str("status"),
    school: f.str("school"),
    bio: body,
    hiring: f.str("hiring"),
    skills: {
      languages: f.strList("skills.languages", skills.languages ?? []),
      tools: f.strList("skills.tools", skills.tools ?? []),
    },
    spokenLanguages: f.strList("spokenLanguages"),
    links: links as Profile["links"],
  };
}
