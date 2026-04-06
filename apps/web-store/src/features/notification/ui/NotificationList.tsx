'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NotificationSummary, NotificationChannel } from '@repo/types';
import { ErrorMessage, EmptyState } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useNotifications } from '../model/use-notifications';

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: '이메일',
  SMS: 'SMS',
  PUSH: '푸시',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function NotificationCard({ notification }: { notification: NotificationSummary }) {
  return (
    <Link
      href={`/my/notifications?id=${notification.notificationId}`}
      className="card"
      data-testid="notification-card"
      style={{
        display: 'block',
        padding: 'var(--space-4) var(--space-5)',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 var(--space-1)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}>
            {new Date(notification.sentAt).toLocaleString('ko-KR')}
          </p>
          <p style={{
            margin: '0 0 var(--space-1)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {notification.subject}
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            marginLeft: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-gray-100)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {CHANNEL_LABELS[notification.channel]}
        </span>
      </div>
    </Link>
  );
}

export function NotificationList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, isLoading, isError, refetch } = useNotifications(page, size);

  const notifications = (data?.content ?? []).filter((n) => n.status === 'SENT');
  const totalElements = data?.totalElements ?? 0;
  const error = isError ? '알림 목록을 불러오는데 실패했습니다.' : '';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>알림</h1>
        <Link
          href="/my/notifications/settings"
          className="btn"
          style={{ textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}
        >
          알림 설정
        </Link>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60px" height="14px" />
              </div>
              <Skeleton width="70%" height="14px" />
            </div>
          ))}
        </div>
      )}
      {error && <ErrorMessage message={error} onRetry={() => refetch()} />}
      {!isLoading && !error && notifications.length === 0 && (
        <EmptyState message="알림이 없습니다." />
      )}
      {notifications.map((notification) => (
        <NotificationCard key={notification.notificationId} notification={notification} />
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
            <label htmlFor="pageSize" className="label" style={{ marginBottom: 0 }}>페이지 크기:</label>
            <select
              id="pageSize"
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
