'use client';

import { useRouter } from 'next/navigation';

import styles from './SearchForm.module.css';

export default function SearchForm({ query }: { query: string }) {
  const router = useRouter();

  const onSubmitSearchQuery = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      className={styles.searchBox}
      action="/"
      method="GET"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = (formData.get('query') as string) ?? '';
        onSubmitSearchQuery(query);
      }}
    >
      <input
        type="text"
        name="query"
        className={styles.searchInput}
        placeholder="スレッド名や投稿内容を検索"
        defaultValue={query || ''}
      />
      <button type="submit" className={styles.searchButton}>
        検索
      </button>
    </form>
  );
}
