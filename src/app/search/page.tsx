import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

import SearchForm from '@/components/SearchForm';
import { Thread } from '@/types/api';

import styles from './page.module.css';

const MAX_POST_COUNT = 100;

type Props = {
  searchParams: Promise<{ query?: string }>;
};

const highlightMatch = (text: string, query: string | undefined) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query})`, 'gi'); // 大文字小文字区別なし
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className={styles.highlight}>
        {part}
      </span>
    ) : (
      part
    ),
  );
};

export default async function SearchResultPage({ searchParams }: Props) {
  const { query } = await searchParams;

  const url = new URL('/api/search', process.env.NEXT_PUBLIC_API_URL);

  if (query) {
    url.searchParams.set('query', query);
  }

  const res = await fetch(url);
  const threads = await res.json();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topLink}>
          <Link href="/" className={styles.anchor}>
            トップに戻る
          </Link>
        </div>

        <SearchForm query={query ?? ''} />

        <div className={styles.threadList}>
          {threads.map((thread: Thread) => (
            <Link key={thread.id} href={thread.id.toString()} className={styles.threadItem}>
              <h2>{highlightMatch(thread.title, query)}</h2>
              {(thread.filteredPosts?.length ? thread.filteredPosts : thread.posts)
                .slice(0, MAX_POST_COUNT)
                .map((post) => (
                  <div key={post.id}>
                    <div className={styles.lastPost}>
                      {/* <span>{post.postNumber?.toString().padStart(4, '0')}</span> */}
                      <span>{post.author ?? process.env.NO_NAME}：</span>
                      <span>
                        {format(post.createdAt, 'yyyy/MM/dd(E) HH:mm:ss.SS', {
                          locale: ja,
                        })}
                      </span>
                    </div>
                    <p className={styles.lastPost}>{highlightMatch(post.content, query)}</p>
                  </div>
                ))}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
