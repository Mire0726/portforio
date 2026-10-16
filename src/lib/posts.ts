import { parse as parseYaml } from "yaml";

// Parses one post file (content/<channel>/*.md): YAML frontmatter + a plain-text body.
// Runs on the Node side only (scripts/load-posts.ts); the browser receives the parsed result.

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

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

class PostError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`);
  }
}

function requireString(file: string, data: Record<string, unknown>, key: string): string {
  const v = data[key];
  if (typeof v === "number") {
    throw new PostError(file, `${key} は "" で囲んでください（例: ${key}: "2025.10"）。囲まないと数値扱いになり 2025.10 が 2025.1 になります`);
  }
  if (typeof v !== "string" || !v.trim()) throw new PostError(file, `${key} は必須です`);
  return v.trim();
}

function requirePeriod(file: string, data: Record<string, unknown>): string {
  const period = requireString(file, data, "period");
  if (!/^\d{4}(\.\d{1,2})?( - (\d{4}(\.\d{1,2})?|現在))?$/.test(period)) {
    throw new PostError(file, `period の形式が不正です: "${period}"（例: "2025.9" / "2025.5 - 2025.6" / "2024.2 - 現在" / "2027"）`);
  }
  return period;
}

function optionalStrings(file: string, data: Record<string, unknown>, key: string): string[] {
  const v = data[key] ?? [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
    throw new PostError(file, `${key} は文字列のリストで書いてください（例: ${key}: [Go, AWS]）`);
  }
  return v;
}

/** Only http(s) — rejects javascript:/data: URLs, which would run code when the link is clicked. */
export const isWebUrl = (url: string) => URL.canParse(url) && /^https?:$/.test(new URL(url).protocol);

function optionalLinks(file: string, data: Record<string, unknown>): PostLink[] {
  const v = data.links ?? [];
  const ok =
    Array.isArray(v) &&
    v.every((l) => typeof l?.title === "string" && typeof l?.url === "string" && isWebUrl(l.url));
  if (!ok) throw new PostError(file, "links は title と url（https://…）を持つリストで書いてください");
  return v as PostLink[];
}

export function parsePost(file: string, raw: string): Post {
  const m = raw.match(FRONTMATTER);
  if (!m) throw new PostError(file, "先頭に --- で囲んだ frontmatter が必要です");

  const data = parseYaml(m[1]) as unknown;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new PostError(file, "frontmatter は key: value の形で書いてください");
  }
  const d = data as Record<string, unknown>;

  const body = m[2]
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, "").trim())
    .filter(Boolean);
  if (body.length === 0) throw new PostError(file, "本文（説明文）が空です");

  const period = requirePeriod(file, d);
  return {
    file,
    org: requireString(file, d, "org"),
    role: requireString(file, d, "role"),
    period,
    ongoing: period.endsWith("現在"),
    stack: optionalStrings(file, d, "stack"),
    body,
    links: optionalLinks(file, d),
    note: d.note === undefined ? undefined : requireString(file, d, "note"),
    reactions: optionalStrings(file, d, "reactions"),
  };
}

/** "2025.5 - 2025.6" → 202505; "2027" → 202700. Used to sort posts chronologically. */
export function periodStart(period: string): number {
  const m = period.match(/^(\d{4})(?:\.(\d{1,2}))?/);
  return m ? Number(m[1]) * 100 + Number(m[2] ?? 0) : 0;
}

/** Files whose name starts with "_" (e.g. _template.md) are ignored. */
export const isPostFile = (path: string) => path.endsWith(".md") && !/(^|\/)_[^/]*$/.test(path);
