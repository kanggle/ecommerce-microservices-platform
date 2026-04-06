'use client';

import { useState } from 'react';
import type { CouponStatus } from '@repo/types';
import { ErrorMessage, EmptyState } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCoupons } from '../model/use-coupons';
import { CouponCard } from './CouponCard';

const STATUS_FILTERS: { value: CouponStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ISSUED', label: '사용가능' },
  { value: 'USED', label: '사용완료' },
  { value: 'EXPIRED', label: '만료' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function CouponList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'ALL'>('ALL');

  const status = statusFilter === 'ALL' ? undefined : statusFilter;
  const { data, isLoading, isError, refetch } = useCoupons(page, size, status);

  const coupons = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const error = isError ? '쿠폰 목록을 불러오는데 실패했습니다.' : '';

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

  function handleStatusChange(newStatus: CouponStatus | 'ALL') {
    setStatusFilter(newStatus);
    setPage(0);
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>쿠폰</h1>

      <div
        data-testid="status-filter"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleStatusChange(value)}
            className="btn"
            style={{
              fontSize: 'var(--font-size-sm)',
              background: statusFilter === value ? 'var(--color-primary)' : 'transparent',
              color: statusFilter === value ? 'var(--color-white)' : 'var(--color-text-secondary)',
              border: statusFilter === value ? 'none' : '1px solid var(--color-border-light)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
              <Skeleton width="50%" height="20px" />
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Skeleton width="70%" height="14px" />
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Skeleton width="40%" height="12px" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <ErrorMessage message={error} onRetry={() => refetch()} />}
      {!isLoading && !error && coupons.length === 0 && (
        <EmptyState message="보유한 쿠폰이 없습니다." />
      )}
      {coupons.map((coupon) => (
        <CouponCard key={coupon.couponId} coupon={coupon} />
      ))}

      {!isLoading && !error && totalElements > 0 && (
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
            <label htmlFor="couponPageSize" className="label" style={{ marginBottom: 0 }}>페이지 크기:</label>
            <select
              id="couponPageSize"
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="input"
              style={{ width: 'auto', padding: 'var(--space-1) var(--space-2)' }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}개</option>
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
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
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
