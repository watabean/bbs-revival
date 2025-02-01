'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import styles from './DeleteThreadModal.module.css';

type Props = {
  threadId: string;
};

export default function DeleteThreadModal({ threadId }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      alert('スレッドが削除されました');
      router.push('/'); // 削除後、トップページへリダイレクト
    } else {
      setError('削除に失敗しました。パスワードを確認してください。');
    }
  };

  return (
    <>
      {/* 削除ボタン */}
      <button onClick={() => setShowModal(true)} className={styles.deleteButton}>
        スレッドを削除
      </button>

      {/* 削除確認モーダル */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>スレッド削除</h2>
            <p className={styles.modalText}>削除するにはパスワードを入力してください。</p>

            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.modalActions}>
              <button onClick={handleDelete} className={styles.confirmDeleteButton}>
                削除する
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
