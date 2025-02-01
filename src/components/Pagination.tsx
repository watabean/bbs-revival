import Link from 'next/link';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  path: string;
}

export default function Pagination({ currentPage, totalPages, path }: PaginationProps) {
  // 前後に何ページを表示するか
  const delta = 2;

  // ページ配列を作る関数
  const createPageRange = (current: number, total: number, delta: number) => {
    const pages: (number | string)[] = [];

    // ページ総数が（2*delta + 1）以下なら、そのまま全部表示
    if (total <= 2 * delta + 1) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 1ページ目は必ず表示
    pages.push(1);

    // 「…」を入れるかどうか判断する基準
    // current - delta > 2 なら、1 と 2 の間が大きく空くので「…」表示
    if (current - delta > 2) {
      pages.push('...');
    }

    // 中間ページ： max(2, current - delta) から min(total - 1, current + delta) まで
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // current + delta < total - 1 なら、最後のページとの間が大きく空くので「…」表示
    if (current + delta < total - 1) {
      pages.push('...');
    }

    // 最後のページは必ず表示
    pages.push(total);

    return pages;
  };

  const pages = createPageRange(currentPage, totalPages, delta);

  return (
    <div className={styles.pagination}>
      <Link
        href={currentPage > 1 ? `${path}?page=${currentPage - 1}` : '#'}
        aria-disabled={currentPage === 1}
        className={`${styles.button} ${currentPage === 1 ? styles.disabled : ''}`}
      >
        前へ
      </Link>

      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <Link
            key={index}
            href={`${path}?page=${page}`}
            className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
          >
            {page}
          </Link>
        ) : (
          <span key={index} className={styles.ellipsis}>
            {page}
          </span>
        ),
      )}

      <Link
        href={currentPage < totalPages ? `${path}?page=${currentPage + 1}` : '#'}
        aria-disabled={currentPage === totalPages}
        className={`${styles.button} ${currentPage === totalPages ? styles.disabled : ''}`}
      >
        次へ
      </Link>
    </div>
  );
}
