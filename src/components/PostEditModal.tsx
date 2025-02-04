'use client';

import { MoreHorizontal } from 'lucide-react'; // アイコン
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './PostEditModal.module.css';

type Props = {
  threadId: number;
  postId: number;
  initialContent: string;
  initialAuthor: string | null;
};

export default function PostEditModal({ postId, initialContent, initialAuthor }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [author, setAuthor] = useState(initialAuthor || '');
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthor(initialAuthor || '');
    setContent(initialContent);
  }, [initialAuthor, initialContent]);

  const onClickCancel = () => {
    setAuthor(initialAuthor || '');
    setContent(initialContent);
    setPassword('');
    setError('');
    setShowModal(false);
  };

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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ author: author.trim() || null, content, password }),
    });

    if (res.ok) {
      setShowModal(false);
      router.refresh();
    } else {
      setError('編集に失敗しました。パスワードを確認してください。');
    }
  };

  const handleDelete = async () => {
    setError('');

    if (!password.trim()) {
      setError('パスワードを入力してください。');
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setShowModal(false);
      router.refresh();
    } else {
      setError('削除に失敗しました。パスワードを確認してください。');
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.menuButton}>
        <MoreHorizontal size={20} />
      </button>

      {/* 編集 & 削除モーダル */}
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

            <div className={styles.modalActions}>
              <button onClick={handleEdit} className={styles.confirmEditButton}>
                保存する
              </button>
              <button onClick={onClickCancel} className={styles.cancelButton}>
                キャンセル
              </button>
            </div>

            <button onClick={handleDelete} className={styles.deleteButton}>
              削除する
            </button>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
