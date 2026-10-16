import { readContent, type Fields } from "./frontmatter.ts";

// Parses one post file (content/<channel>/*.md). Node side only; see scripts/load-content.ts.

export type PostLink = { title: string; url: string };

export type Post = {
  /** Source file, for error messages and stable React keys. */
  file: string;
  org: string;
  role: string;
  /** "2025.9", "2025.5 - 2025.6", "2024.2 - 現在", "2027" … */
  period: string;
  /** True when the period ends with "現在" (still going on). */
  ongoing: boolean;
  stack: string[];
  /** Body paragraphs (split on blank lines). */
  body: string[];
  links: PostLink[];
  /** Muted footnote, e.g. "Coming soon". */
  note?: string;
  reactions: string[];
};

const PERIOD = /^\d{4}(\.\d{1,2})?( - (\d{4}(\.\d{1,2})?|現在))?$/;

export function parsePost(file: string, raw: string): Post {
  const { fields: f, body } = readContent(file, raw);
  if (body.length === 0) f.fail("本文（説明文）が空です");

  const period = f.str("period");
  if (!PERIOD.test(period)) {
    f.fail(`period の形式が不正です: "${period}"（例: "2025.9" / "2025.5 - 2025.6" / "2024.2 - 現在" / "2027"）`);
  }

  return {
    file,
    org: f.str("org"),
    role: f.str("role"),
    period,
    ongoing: period.endsWith("現在"),
    stack: f.strList("stack"),
    body,
    links: parseLinks(f),
    note: f.optStr("note"),
    reactions: f.strList("reactions"),
  };
}

function parseLinks(f: Fields): PostLink[] {
  return f.list("links").map((l, i) => {
    const { title, url } = f.record(`links[${i}]`, l);
    return { title: f.str(`links[${i}].title`, title), url: f.url(`links[${i}].url`, url) };
  });
}

/** "2025.5 - 2025.6" → 202505; "2027" → 202700. Used to sort posts chronologically. */
export function periodStart(period: string): number {
  const m = period.match(/^(\d{4})(?:\.(\d{1,2}))?/);
  return m ? Number(m[1]) * 100 + Number(m[2] ?? 0) : 0;
}
