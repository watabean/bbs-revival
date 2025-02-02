# 起動手順

1. Voltaをインストール
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

## DBを参照

```bash
npx prisma studio
```

# アプリケーション仕様

## API 一覧

## API エンドポイント一覧

| メソッド   | エンドポイント                                                     | 説明             |
| ---------- | ------------------------------------------------------------------ | ---------------- |
| **GET**    | [/api/threads](src/app/api/threads/route.ts)                       | スレッド一覧取得 |
| **POST**   | [/api/threads](src/app/api/threads/route.ts)                       | スレッド作成     |
| **GET**    | [/api/threads/[threadId]](src/app/api/threads/[threadId]/route.ts) | スレッド詳細取得 |
| **DELETE** | [/api/threads/[threadId]](src/app/api/threads/[threadId]/route.ts) | スレッド削除     |
| **POST**   | [/api/posts](src/app/api/post/route.ts)                            | 投稿作成         |
| **DELETE** | [/api/posts/[postId]](src/app/api/post/[postId]/route.ts)          | 投稿削除         |
| **PATCH**  | [/api/posts/[postId]](src/app/api/post/[postId]/route.ts)          | 投稿編集         |

## 画面一覧

| パス                                                                         | タイトル                         |
| ---------------------------------------------------------------------------- | -------------------------------- |
| [/](src/app/page.tsx)                                                        | スレッド一覧（ページネーション） |
| [/new](src/app/new/page.tsx)                                                 | スレッド作成                     |
| [/[threadId]](src/app/[threadId]/page.tsx)                                   | スレッド詳細（ページネーション） |
| [src/components/DeleteThreadModal.tsx](src/components/DeleteThreadModal.tsx) | スレッド削除（モーダル）         |
| [src/components/PostModal.tsx](src/components/PostModal.tsx)                 | 投稿作成（モーダル）             |
| [src/components/PostModal.tsx](src/components/PostEditModal.tsx)             | 投稿編集（モーダル）             |
