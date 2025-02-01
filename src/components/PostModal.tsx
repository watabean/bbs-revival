'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './PostModal.module.css';

type Props = {
  threadId: string;
};

export default function PostModal({ threadId }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handlePost = async () => {
    setError('');

    if (!content.trim()) {
      setError('投稿内容を入力してください。');
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author: author.trim() || null, content, threadId }),
    });

    if (res.ok) {
      setShowModal(false);
      setAuthor('');
      setContent('');
      router.refresh(); // 投稿後にページをリフレッシュ
    } else {
      setError('投稿に失敗しました。');
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.postButton}>
        投稿する
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>新しい投稿</h2>

            <input
              type="text"
              className={styles.input}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="名前（任意）"
            />

            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿内容を入力..."
            />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.modalActions}>
              <button onClick={handlePost} className={styles.confirmPostButton}>
                投稿する
              </button>
              <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
