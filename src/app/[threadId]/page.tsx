import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

import DeleteThreadModal from '@/components/DeleteThreadModal';
import Pagination from '@/components/Pagination';
import PostEditModal from '@/components/PostEditModal';
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
  const res = await fetch(url);
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

      {thread.posts.map((post: Post) => (
        <div key={post.id} className={styles.post}>
          <div className={styles.postHeader}>
            <span>{post.postNumber?.toString().padStart(4, '0')}</span>
            <span>{post.author ?? process.env.NO_NAME}：</span>
            <span>{format(post.createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', { locale: ja })}</span>
            <div className={styles.postActions}>
              <PostEditModal
                threadId={thread.id}
                postId={post.id}
                initialContent={post.content}
                initialAuthor={post.author}
              />
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
