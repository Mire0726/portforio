import { parse as parseYaml } from "yaml";

// Shared reader for content/*.md files: YAML frontmatter + a plain-text body, with
// validation helpers that report errors as "<file>: <message>" in Japanese.
// Runs on the Node side only (scripts/load-content.ts); the browser receives parsed results.

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`);
  }
}

/** Only http(s) — rejects javascript:/data: URLs, which would run code when the link is clicked. */
export const isWebUrl = (url: unknown): url is string =>
  typeof url === "string" && URL.canParse(url) && /^https?:$/.test(new URL(url).protocol);

/** Files whose name starts with "_" (e.g. _template.md) are ignored. */
export const isContentFile = (path: string) => path.endsWith(".md") && !/(^|\/)_[^/]*$/.test(path);

export type Fields = ReturnType<typeof fieldsOf>;

/** Typed accessors over a frontmatter object; each throws a ContentError naming the file and key. */
function fieldsOf(file: string, data: Record<string, unknown>) {
  const fail = (message: string): never => {
    throw new ContentError(file, message);
  };

  const str = (key: string, value: unknown = data[key]): string => {
    if (typeof value === "number") {
      fail(`${key} は "" で囲んでください（例: ${key}: "2025.10"）。囲まないと数値扱いになり 2025.10 が 2025.1 になります`);
    }
    if (typeof value !== "string" || !value.trim()) fail(`${key} は必須です`);
    return (value as string).trim();
  };

  return {
    file,
    fail,
    str,
    optStr: (key: string): string | undefined => (data[key] === undefined ? undefined : str(key)),
    strList: (key: string, value: unknown = data[key] ?? []): string[] => {
      if (!Array.isArray(value) || value.some((x) => typeof x !== "string")) {
        fail(`${key} は文字列のリストで書いてください（例: ${key}: [Go, AWS]）`);
      }
      return value as string[];
    },
    /** An optional list of anything (items validated by the caller). */
    list: (key: string, value: unknown = data[key] ?? []): unknown[] => {
      if (!Array.isArray(value)) fail(`${key} はリスト（- で始まる行）で書いてください`);
      return value as unknown[];
    },
    record: (key: string, value: unknown = data[key]): Record<string, unknown> => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        fail(`${key} は key: value の形で書いてください`);
      }
      return value as Record<string, unknown>;
    },
    url: (key: string, value: unknown): string => {
      if (!isWebUrl(value)) fail(`${key} は https:// で始まる URL にしてください`);
      return value as string;
    },
  };
}

/** Splits a content file into validated frontmatter fields and body paragraphs (split on blank lines). */
export function readContent(file: string, raw: string): { fields: Fields; body: string[] } {
  const m = raw.match(FRONTMATTER);
  if (!m) throw new ContentError(file, "先頭に --- で囲んだ frontmatter が必要です");

  const data = parseYaml(m[1]) as unknown;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ContentError(file, "frontmatter は key: value の形で書いてください");
  }

  // Japanese text: a single line break inside a paragraph joins without a space.
  const body = m[2]
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, "").trim())
    .filter(Boolean);

  return { fields: fieldsOf(file, data as Record<string, unknown>), body };
}
