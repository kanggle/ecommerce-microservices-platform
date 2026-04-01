'use client';

import Link from 'next/link';
import { buildPageNumbers } from '@repo/utils';

interface PaginationProps {
  currentPage: number;
  totalElements: number;
  pageSize: number;
  baseHref: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalElements,
  pageSize,
  baseHref,
  searchParams = {},
}: PaginationProps) {
  const totalPages = Math.ceil(totalElements / pageSize);

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${baseHref}?${params.toString()}`;
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="pagination">
      <ul
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          listStyle: 'none',
          padding: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {currentPage > 0 && (
          <li>
            <Link href={buildHref(currentPage - 1)} className="btn" style={{ fontSize: 'var(--font-size-sm)' }}>
              이전
            </Link>
          </li>
        )}
        {pages.map((item, idx) => (
          <li key={item === '...' ? `ellipsis-${idx}` : item}>
            {item === '...' ? (
              <span style={{ color: 'var(--color-text-muted)', padding: '0 var(--space-1)' }}>...</span>
            ) : item === currentPage ? (
              <span
                className="btn btn-primary"
                style={{ fontSize: 'var(--font-size-sm)', pointerEvents: 'none', fontWeight: 'bold' }}
              >
                {item + 1}
              </span>
            ) : (
              <Link href={buildHref(item)} className="btn" style={{ fontSize: 'var(--font-size-sm)' }}>
                {item + 1}
              </Link>
            )}
          </li>
        ))}
        {currentPage < totalPages - 1 && (
          <li>
            <Link href={buildHref(currentPage + 1)} className="btn" style={{ fontSize: 'var(--font-size-sm)' }}>
              다음
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
