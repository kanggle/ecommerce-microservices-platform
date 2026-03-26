'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderSummary } from '@repo/types';
import { useAuth } from '@/features/auth';
import { getOrders, OrderCard } from '@/entities/order';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@repo/ui';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadOrders = useCallback(async (currentPage: number, currentSize: number) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getOrders(currentPage, currentSize);
      setOrders(result.content);
      setTotalElements(result.totalElements);
    } catch {
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadOrders(page, size);
    }
  }, [authLoading, isAuthenticated, page, size, loadOrders]);

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

  if (authLoading || !isAuthenticated) return null;

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>주문 내역</h1>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={() => loadOrders(page, size)} />}
      {!isLoading && !error && orders.length === 0 && (
        <EmptyState message="주문 내역이 없습니다." />
      )}
      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}

      {!isLoading && !error && totalElements > 0 && (
        <nav aria-label="페이지네이션" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="pageSize">페이지 크기:</label>
            <select
              id="pageSize"
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              style={{ padding: '4px 8px' }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}개</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              aria-label="이전 페이지"
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: page === 0 ? '#f5f5f5' : '#fff',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              이전
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="다음 페이지"
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: page >= totalPages - 1 ? '#f5f5f5' : '#fff',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              다음
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}
