import Link from 'next/link';
import styles from './page.module.css';
import { Thread, Post } from '@/types/api';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type Props = {
  params: Promise<{ threadId: string }>;
};

export default async function ThreadDetail({ params }: Props) {
  const { threadId } = await params;

  // APIからスレッドデータを取得
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads/${threadId}`, {
    next: { revalidate: 60 }, // ISRで60秒キャッシュ
  });
  const thread: Thread = await res.json();

  return (
    <div className={styles.container}>
      <div className={styles.topLink}>
        <Link href="/" className={styles.anchor}>
          トップに戻る
        </Link>
      </div>
      <h1 className={styles.threadTitle}>{thread.title}</h1>

      {thread.posts.map((post: Post, index) => (
        <div key={post.id} className={styles.post}>
          <p className={styles.postHeader}>
            <span className={styles.postNumber}>{(index + 1).toString().padStart(4, '0')}</span>{' '}
            {post.author}：{format(post.createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', { locale: ja })}
          </p>
          <p className={styles.postContent}>{post.content}</p>
          <div className={styles.postActions}>
            <Link href={`/${thread.id}/posts/${post.id}/edit`} className={styles.anchor}>
              編集
            </Link>
          </div>
        </div>
      ))}

      <Pagination currentPage={1} totalPages={5} path={`/${threadId}`} />

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
