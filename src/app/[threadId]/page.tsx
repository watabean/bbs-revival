import Link from 'next/link';
import styles from './page.module.css';
import { Thread, Post } from '@/types/api';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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
          <p className={styles.postHeader}>
            <span className={styles.postNumber}>{(index + 1).toString().padStart(4, '0')}</span>{' '}
            {post.author ?? process.env.NO_NAME}：
            {format(post.createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', { locale: ja })}
          </p>
          <p className={styles.postContent}>{post.content}</p>
          <div className={styles.postActions}>
            <Link href={`/${thread.id}/posts/${post.id}/edit`} className={styles.anchor}>
              編集
            </Link>
          </div>
        </div>
      ))}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        path={`/${threadId}`}
      />

      <div className={styles.formContainer}>
        <textarea className={styles.textarea} placeholder="新しい投稿を入力..." />
        <button type="submit" className={styles.button}>
          投稿する
        </button>
      </div>

      <div>
        <Link href={`/${thread.id}/delete`} className={styles.deleteLink}>
          スレッドを削除
        </Link>
      </div>
    </div>
  );
}
