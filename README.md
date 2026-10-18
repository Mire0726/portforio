# portforio

- Vite + React + TypeScript + Tailwind CSS v4 の静的サイト
- Cloudflare Workers（静的アセット配信、無料プラン）にデプロイ
- `main` への push でデプロイ

## 開発

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # dist/ に出力
pnpm preview   # build 結果の確認
```

`dev` / `build` の前に `scripts/fetch-feeds.ts` が Zenn の記事一覧、GitHub のアイコン URL、リンクカード用の OGP（タイトル・説明・画像）を取得して `src/data/feeds.generated.json` を生成し、アプリはそれを静的に import します（Zenn の API はブラウザから CORS で叩けないためビルド時に取得）。ユーザー名は `content/profile.md` の `links` から読みます。取得に失敗してもビルドは止まらず、該当チャンネルに「読み込めませんでした」が出るだけです。

`dev` は起動を速くするため、前回の取得から 24 時間以内で `content/` も変わっていなければ取得をスキップします。最新の Zenn 記事などを取り直したいときは `pnpm fetch-feeds` を実行してください。

## 内容の更新

| 変えたいもの | 場所 |
| --- | --- |
| `#career` / `#activities` の投稿 | `content/career/*.md` / `content/activities/*.md`（1 投稿 1 ファイル） |
| 名前・肩書・ステータス・自己紹介・募集文・スキル・語学・リンク | `content/profile.md`（本文が自己紹介、それ以外は frontmatter） |
| Zenn 記事 | 自動（ビルド時に取得。毎朝 6:00 JST に再デプロイ） |
| チャンネルの追加 | `src/features/channels/registry.ts` に定義を足し、`views/` にビューを作って `ChannelView.tsx` に登録（登録漏れは型エラーになる） |

### 投稿を追加する

1. `content/_template.md` を `content/career/` か `content/activities/` にコピー（例: `content/activities/2026-11-gocon-2027-kickoff.md`）
2. frontmatter（`---` の間）と本文を書き換える
3. `pnpm dev` で確認 → `main` にマージすればデプロイされる

```md
---
org: Go Conference 2026
role: 実行委員
period: "2026.9"          # 必ず "" で囲む（2025.10 が数値の 2025.1 になるのを防ぐため）
stack: [Go]
links:
  - title: Go Conference 2026
    url: https://gocon.jp/2026/
reactions: [🐹]
---

Go Conference 2026 の実行委員として運営に参加。
```

- 並び順は `period` で自動的に決まる（ファイル名は自由）
- `links` の OGP（画像・説明）はビルド時に自動取得
- 必須項目の抜けや `period` の書式ミスはビルド時にファイル名付きのエラーになる
- `_` で始まるファイルは無視される

## ディレクトリ構成

```
content/
  career/*.md                #career の投稿（1 投稿 1 ファイル）
  activities/*.md            #activities の投稿
  _template.md               投稿の雛形
  profile.md                 プロフィール（自己紹介・スキル・リンクなど）
scripts/load-content.ts      content/ を読み込んで検証（Vite プラグインと fetch-feeds から使う）
scripts/fetch-feeds.ts       ビルド前に Zenn 記事・GitHub アイコン・リンクカードの OGP を取得
src/
  data/                      content/ の読み込み結果（profile.ts / posts.ts）
  lib/                       content/ のパース（frontmatter / profile / posts）、生成フィードの型、日付フォーマット
  components/message/        Slack 風の汎用 UI（Message, LinkCard, Reactions など）
  features/
    authors.tsx              投稿者（自分・bot・閲覧者）
    channels/                チャンネル定義・ルーティング・各チャンネルのビュー
    chat/                    入力欄（見た目だけ。送信すると自動返信）
    search/                  ヘッダーの検索
  layout/                    アプリの枠（Sidebar, ChannelHeader）
  styles/index.css           Tailwind の読み込みとカラートークン（ライト / ダーク）
```

スタイルは各コンポーネントに Tailwind のクラスで直接書いています。色は `styles/index.css` の CSS 変数を `@theme` で `bg-surface` / `text-muted` / `border-line` などのユーティリティとして公開しており、ダークモードは変数の切り替えだけで対応するので、コンポーネントに `dark:` は書きません。

依存の向きは `layout → features → components / lib / data` の一方向で、`components/` はどこにも依存しない汎用 UI に保っています。

## デプロイ

`.github/workflows/deploy.yml` が `main` への push（と毎日の定期実行・手動実行）で `wrangler deploy` します。PR では `ci.yml` がビルドだけ確認します。

### セキュリティ

- `public/_headers` で CSP などのセキュリティヘッダーを付けている。読み込めるのは自サイトのスクリプト、Google Fonts、https の画像、Speaker Deck の埋め込みのみ。外部の埋め込みやスクリプトを増やすときはここも更新する
- 投稿の `links` は http(s) の URL のみ受け付ける（`javascript:` などはビルドエラー）
- GitHub Actions のアクションはコミット SHA で固定している（タグの付け替えによる乗っ取り対策）。更新するときは SHA ごと書き換える

### 料金

Workers の静的アセット配信は無料プランでリクエスト数無制限です。このサイトはサーバー側のコード（Worker スクリプト）を持たないため、Worker の無料枠（10 万リクエスト/日）も消費しません。
