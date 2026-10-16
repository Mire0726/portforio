// Profile, links and skills. Career / activity posts live in content/<channel>/*.md (see README).
// Zenn articles and the GitHub avatar are fetched automatically at build time.
// The real name is intentionally kept out of the site text; only the handle is shown.
// (The LinkedIn link is the one exception: its URL and profile page carry the real name.)

export const profile = {
  name: "Suu",
  title: "Web Engineer",
  /** Slack-style custom status shown under the name in the sidebar. */
  status: "💼 業務委託のお仕事募集中",
  school: "お茶の水女子大学 生活科学部 人間生活学科（2027年卒業予定）",
  bio: "文系学部からエンジニアになり、Go と TypeScript を中心に Web アプリケーションのバックエンドからフロントエンド、インフラまで開発しています。長期・短期あわせて 10 社以上のインターンやハッカソンでプロダクト開発からパフォーマンスチューニング、IaC まで経験し、現在は AI スタートアップ 2 社で業務委託として働いています。最近は機械学習に興味があります。ジェンダー研究を学びながら、女性・ジェンダーマイノリティのテック参画を後押しする活動にも取り組んでいます。",
  /** Shown as a pinned post in #about and in the contact DM. */
  hiring: "業務委託のお仕事を募集しています。Web アプリケーションの開発（Go / TypeScript）などでお手伝いできることがあれば、お気軽にご連絡ください。",
};

// `user` values are also read by scripts/fetch-feeds.ts. `display` is the text shown for the link.
export const links = {
  github: { label: "GitHub", user: "Mire0726", display: "@Mire0726", url: "https://github.com/Mire0726" },
  zenn: { label: "Zenn", user: "mire0726", display: "@mire0726", url: "https://zenn.dev/mire0726" },
  x: { label: "X", user: "suueng", display: "@suueng", url: "https://x.com/suueng" },
  linkedin: {
    label: "LinkedIn",
    user: "sumire-inoue-422a3b244",
    display: "プロフィール",
    url: "https://www.linkedin.com/in/sumire-inoue-422a3b244/",
  },
} as const;

export const skills = {
  languages: ["Go", "TypeScript", "JavaScript", "Python", "Kotlin", "Ruby"],
  others: [
    "AWS",
    "Google Cloud",
    "Terraform",
    "Docker",
    "PostgreSQL",
    "MySQL",
    "Elasticsearch",
    "Firebase",
    "GraphQL",
    "GitHub Actions",
  ],
};

export const languagesSpoken = ["日本語（ネイティブ）", "英語（IELTS 5.5）", "スペイン語（日常会話・簡単な業務）"];
