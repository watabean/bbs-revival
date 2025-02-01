import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

import DeleteThreadModal from '@/components/DeleteThreadModal';
import Pagination from '@/components/Pagination';
import PostModal from '@/components/PostModal';
import { Post } from '@/types/api';

import styles from './page.module.css';

type Props = {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ page: number }>;
};

export default async function ThreadDetail({ params, searchParams }: Props) {
  const { threadId } = await params;
  const { page } = await searchParams;

  const url = new URL(`/api/threads/${threadId}`, process.env.NEXT_PUBLIC_API_URL);
  if (page) {
    url.searchParams.set('page', String(page));
  }

  // APIからスレッドデータを取得
  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISRで60秒キャッシュ
  });
  const { thread, pagination } = await res.json();

  return (
    <div className={styles.container}>
      <div className={styles.topLink}>
        <Link href="/" className={styles.anchor}>
          トップに戻る
        </Link>
      </div>
      <h1 className={styles.threadTitle}>{thread.title}</h1>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        path={`/${threadId}`}
      />

      {thread.posts.map((post: Post, index: number) => (
        <div key={post.id} className={styles.post}>
          <div className={styles.postHeader}>
            <span className={styles.postNumber}>{(index + 1).toString().padStart(4, '0')}</span>
            <span>{post.author ?? process.env.NO_NAME}：</span>
            <span>{format(post.createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', { locale: ja })}</span>
            <div className={styles.postActions}>
              <Link href={`/${thread.id}/posts/${post.id}/edit`} className={styles.anchor}>
                編集
              </Link>
            </div>
          </div>
          <p className={styles.postContent}>{post.content}</p>
        </div>
      ))}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        path={`/${threadId}`}
      />

      <div className={styles.modals}>
        <PostModal threadId={threadId} />
        <DeleteThreadModal threadId={threadId} />
      </div>
    </div>
  );
}
