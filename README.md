## 動作環境

- MacOS 15.2
- Windows（未検証）

## 主要ツール

- Volta（バージョン管理ツール）
  - node: v22.13.1
  - npm: v11.1.0
- Next.js: v15.1.6
- React: v19.0.0
- Prisma: v6.3.0
- SQLite

# ローカル起動手順

1. [公式](https://volta.sh/)よりVoltaをインストール
2. ライブラリをインストール
   ```bash
   npm install
   ```
3. DBのmigrationを実施
   ```bash
   npx prisma migrate dev
   ```
4. ローカル起動

   ```bash
   npm run dev
   ```

# テスト実行手順

1. [公式](https://volta.sh/)よりVoltaをインストール（インストール済みなら省略）
2. ライブラリをインストール（インストール済みなら省略）
   ```bash
   npm install
   ```
3. テスト実行
   ```bash
   npm run test
   ```

# Prismaのコマンド一覧

## DB参照

```bash
npx prisma studio
```

## マイグレーションファイル作成（schemaを編集した場合）

```bash
npx prisma migrate dev --name added_job_title # 内容を簡潔に書く
```

## DBの初期化

```bash
npx prisma migrate reset # Seedのデータも入り直す
```

# アプリケーション仕様

## API エンドポイント一覧

| メソッド   | エンドポイント                                                     | 説明              |
| ---------- | ------------------------------------------------------------------ | ----------------- |
| **GET**    | [/api/threads](src/app/api/threads/route.ts)                       | スレッド一覧取得  |
| **POST**   | [/api/threads](src/app/api/threads/route.ts)                       | スレッド作成      |
| **GET**    | [/api/threads/[threadId]](src/app/api/threads/[threadId]/route.ts) | スレッド詳細取得  |
| **DELETE** | [/api/threads/[threadId]](src/app/api/threads/[threadId]/route.ts) | スレッド削除      |
| **POST**   | [/api/posts](src/app/api/post/route.ts)                            | 投稿作成          |
| **DELETE** | [/api/posts/[postId]](src/app/api/post/[postId]/route.ts)          | 投稿削除          |
| **PATCH**  | [/api/posts/[postId]](src/app/api/post/[postId]/route.ts)          | 投稿編集          |
| **GET**    | [/api/search](src/app/api/search/route.ts)                         | スレッド/投稿検索 |

## 画面一覧

| パス                                                                         | タイトル                         |
| ---------------------------------------------------------------------------- | -------------------------------- |
| [/](src/app/page.tsx)                                                        | スレッド一覧（ページネーション） |
| [/new](src/app/new/page.tsx)                                                 | スレッド作成                     |
| [/[threadId]](src/app/[threadId]/page.tsx)                                   | スレッド詳細（ページネーション） |
| [/search](src/app/search/page.tsx)                                           | 検索結果ページ                   |
| [src/components/DeleteThreadModal.tsx](src/components/DeleteThreadModal.tsx) | スレッド削除（モーダル）         |
| [src/components/PostModal.tsx](src/components/PostModal.tsx)                 | 投稿作成（モーダル）             |
| [src/components/PostModal.tsx](src/components/PostEditModal.tsx)             | 投稿編集（モーダル）             |
