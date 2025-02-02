'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './PostEditModal.module.css';

type Props = {
  threadId: string;
  postId: number;
  initialContent: string;
  initialAuthor: string | null;
};

export default function PostEditModal({ threadId, postId, initialContent, initialAuthor }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [author, setAuthor] = useState(initialAuthor || '');
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setAuthor(initialAuthor || '');
    setContent(initialContent);
  }, [initialAuthor, initialContent]);

  const handleEdit = async () => {
    setError('');

    if (!password.trim()) {
      setError('パスワードを入力してください。');
      return;
    }
    if (!content.trim()) {
      setError('投稿内容を入力してください。');
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${threadId}/posts/${postId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: author.trim() || null, content, password }),
      },
    );

    if (res.ok) {
      setShowModal(false);
      router.refresh(); // 編集後にページをリフレッシュ
    } else {
      setError('編集に失敗しました。');
    }
  };

  const handleDelete = async () => {
    setDeleteError('');

    if (!password.trim()) {
      setDeleteError('パスワードを入力してください。');
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${threadId}/posts/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      },
    );

    if (res.ok) {
      setShowModal(false);
      router.refresh(); // 削除後にページをリフレッシュ
    } else {
      setDeleteError('削除に失敗しました。パスワードを確認してください。');
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.editButton}>
        編集
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>投稿を編集</h2>

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
              placeholder="編集する内容を入力..."
            />

            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.modalActions}>
              <button onClick={handleEdit} className={styles.confirmEditButton}>
                保存する
              </button>
              <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                キャンセル
              </button>
            </div>

            {deleteError && <p className={styles.error}>{deleteError}</p>}

            <button onClick={handleDelete} className={styles.deleteButton}>
              削除する
            </button>
          </div>
        </div>
      )}
    </>
  );
}
