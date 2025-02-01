import Link from 'next/link';
import styles from './page.module.css';
import { ThreadListResponse } from '@/types/api';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type Props = {
  searchParams: Promise<{ page: number }>;
};

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;

  const url = new URL('/api/threads', process.env.NEXT_PUBLIC_API_URL);
  if (page) {
    url.searchParams.set('page', String(page));
  }

  // APIからスレッドデータを取得
  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISRで60秒キャッシュ
  });
  const { threads, pagination }: ThreadListResponse = await res.json();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>掲示板</h1>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          path="/"
        />

        <div className={styles.threadList}>
          {threads.map((thread) => (
            <Link key={thread.id} href={thread.id.toString()} className={styles.threadItem}>
              <h2>{thread.title}</h2>
              {thread.posts[0] && (
                <>
                  <p className={styles.lastPost}>最新投稿: {thread.posts[0].content}</p>
                  <p className={styles.lastPost}>
                    投稿日時:{' '}
                    {format(thread.posts[0].createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', { locale: ja })}
                  </p>
                </>
              )}
            </Link>
          ))}
        </div>

        <Link href="/thread/new" className={styles.newThreadButton}>
          新しいスレッドを作成
        </Link>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          path="/"
        />
      </main>
    </div>
  );
}
