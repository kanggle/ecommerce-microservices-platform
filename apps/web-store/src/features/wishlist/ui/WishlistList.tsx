'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ErrorMessage, EmptyState } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useWishlist } from '../model/use-wishlist';
import { WishlistItemCard } from './WishlistItemCard';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function WishlistList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, isLoading, isError, refetch } = useWishlist(page, size);

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));

  function handlePageChange(newPage: number) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }

  function handleSizeChange(newSize: number) {
    setSize(newSize);
    setPage(0);
  }

  return (
    <div>
      <h1 className="page-title">위시리스트</h1>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <Skeleton width="60px" height="60px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height="14px" />
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <Skeleton width="30%" height="14px" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorMessage
          message="위시리스트를 불러오는데 실패했습니다."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState message="위시리스트가 비어 있습니다." />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {items.map((item) => (
            <WishlistItemCard key={item.wishlistItemId} item={item} />
          ))}
        </div>
      )}

      {!isLoading && !isError && totalElements > 0 && (
        <nav
          aria-label="페이지네이션"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label htmlFor="pageSize" className="label" style={{ marginBottom: 0 }}>
              페이지 크기:
            </label>
            <select
              id="pageSize"
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="input"
              style={{ width: 'auto', padding: 'var(--space-1) var(--space-2)' }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}개
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              aria-label="이전 페이지"
              className="btn"
            >
              이전
            </button>
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="다음 페이지"
              className="btn"
            >
              다음
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
