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

| メソッド   | エンドポイント            | 説明             |
| ---------- | ------------------------- | ---------------- |
| **GET**    | `/api/threads`            | スレッド一覧取得 |
| **POST**   | `/api/threads`            | スレッド作成     |
| **GET**    | `/api/threads/[threadId]` | スレッド詳細取得 |
| **DELETE** | `/api/threads/[threadId]` | スレッド削除     |
| **POST**   | `/api/posts`              | 投稿作成         |
| **DELETE** | `/api/posts/[postId]`     | 投稿削除         |
| **PATCH**  | `/api/posts/[postId]`     | 投稿編集         |

## 画面一覧

| パス                                    | タイトル                         |
| --------------------------------------- | -------------------------------- |
| /threads                                | スレッド一覧（ページネーション） |
| /threads/new                            | スレッド作成                     |
| /threads/[threadId]                     | スレッド詳細（ページネーション） |
| /threads/[threadId]/edit                | スレッド編集                     |
| /threads/[threadId]/posts/new           | 投稿作成                         |
| /threads/[threadId]/posts/[postId]/edit | 投稿編集                         |

