import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

import Pagination from '@/components/Pagination';
import { ThreadListResponse } from '@/types/api';

import styles from './page.module.css';

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
  const res = await fetch(url);
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
                  <div className={styles.lastPost}>
                    <span>{thread.posts[0].postNumber?.toString().padStart(4, '0')}</span>
                    <span>{thread.posts[0].author ?? process.env.NO_NAME}：</span>
                    <span>
                      {format(thread.posts[0].createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', {
                        locale: ja,
                      })}
                    </span>
                  </div>
                  <p className={styles.lastPost}>{thread.posts[0].content}</p>
                </>
              )}
            </Link>
          ))}
        </div>

        <Link href="/new" className={styles.newThreadButton}>
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
