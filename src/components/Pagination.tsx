import Link from 'next/link';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  path: string;
}

export default function Pagination({ currentPage, totalPages, path }: PaginationProps) {
  const createPageRange = () => {
    const range: (number | string)[] = [];
    const delta = 2; // 表示する前後のページ数

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage > delta + 2) {
      range.push(1, '...');
    } else {
      for (let i = 1; i < currentPage; i++) {
        range.push(i);
      }
    }

    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage < totalPages - delta - 1) {
      range.push('...', totalPages);
    } else {
      for (let i = currentPage + 1; i <= totalPages; i++) {
        range.push(i);
      }
    }

    return range;
  };

  const pages = createPageRange();

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
