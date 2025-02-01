import Link from 'next/link';
import styles from './page.module.css';
import { ThreadListResponse } from '@/types/api';

export default async function Home() {
  // APIからスレッドデータを取得
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads`, {
    next: { revalidate: 60 }, // ISRで60秒キャッシュ
  });
  const { threads }: ThreadListResponse = await res.json();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>スレッド一覧</h1>

        <div className={styles.threadList}>
          {threads.map((thread) => (
            <Link key={thread.id} href={thread.id} className={styles.threadItem}>
              <h2>{thread.title}</h2>
              {thread.posts[0] && (
                <p className={styles.lastPost}>最新投稿: {thread.posts[0].content}</p>
              )}
              <span className={styles.postCount}>投稿数: {thread.posts.length}</span>
            </Link>
          ))}
        </div>

        <Link href="/thread/new" className={styles.newThreadButton}>
          新しいスレッドを作成
        </Link>
      </main>
    </div>
  );
}
