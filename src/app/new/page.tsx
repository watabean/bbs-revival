'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './page.module.css';

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(''); // 任意の名前
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, author: author.trim() || null }),
    });

    if (res.ok) {
      const { thread, updatePassword } = await res.json();
      prompt('スレッドを作成しました。削除/更新用パスワードを控えてください', updatePassword);
      router.push(`/${thread.id}`);
    } else {
      alert('スレッド作成に失敗しました');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topLink}>
          <Link href="/" className={styles.anchor}>
            トップに戻る
          </Link>
        </div>
        <h1 className={styles.title}>新しいスレッドを作成</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            <span className={styles.labelText}>
              スレッドタイトル <span className={styles.required}>*</span>
            </span>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>
              初回投稿内容 <span className={styles.required}>*</span>
            </span>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            <span className={styles.labelText}>名前（省略可）</span>
            <input
              type="text"
              className={styles.input}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="未入力の場合は匿名"
            />
          </label>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? '作成中...' : '作成'}
          </button>
        </form>
      </main>
    </div>
  );
}
