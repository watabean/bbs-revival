'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ThreadEdit({ params }: { params: { threadId: number } }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/threads/${params.threadId}`, {
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
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>スレッドを削除</h1>

        <button className={styles.deleteButton} onClick={() => setShowModal(true)}>
          削除
        </button>

        {/* 削除確認モーダル */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>本当に削除しますか？</h2>
              <p>削除するにはパスワードを入力してください。</p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
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
      </main>
    </div>
  );
}
