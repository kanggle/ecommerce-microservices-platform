'use client';

import { LoadingSpinner } from '@repo/ui';
import { EmptyState } from '@repo/ui';
import { buildPageNumbers } from '@repo/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface PaginationState {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination?: PaginationState;
  isLoading: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowKey?: (item: T, index: number) => string;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  isLoading,
  emptyMessage = '데이터가 없습니다.',
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  function getRowKey(item: T, index: number): string {
    if (rowKey) return rowKey(item, index);
    const record = item as Record<string, unknown>;
    if (record['id'] != null) return String(record['id']);
    return columns.map((col) => String(record[col.key] ?? '')).join('::') || String(index);
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '10px 20px',
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: '#6b7280',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.03em',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              onClick={() => onRowClick?.(item)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: index < data.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.875rem',
                    color: '#111827',
                  }}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="pagination"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
            padding: '16px 0',
            borderTop: '1px solid #f3f4f6',
          }}
        >
          <button
            aria-label="이전 페이지"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
              opacity: pagination.page === 0 ? 0.4 : 1,
              fontSize: '0.8125rem',
              color: '#374151',
            }}
          >
            이전
          </button>
          {buildPageNumbers(pagination.page, pagination.totalPages).map((item, idx) =>
            item === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                style={{ padding: '4px 8px', color: '#9ca3af', fontSize: '0.8125rem' }}
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${item}`}
                aria-label={`${item + 1} 페이지`}
                aria-current={item === pagination.page ? 'page' : undefined}
                onClick={() => pagination.onPageChange(item)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: item === pagination.page ? 'none' : '1px solid transparent',
                  backgroundColor: item === pagination.page ? '#1A1A2E' : 'transparent',
                  color: item === pagination.page ? '#fff' : '#374151',
                  fontWeight: item === pagination.page ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                }}
              >
                {item + 1}
              </button>
            ),
          )}
          <button
            aria-label="다음 페이지"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages - 1}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              cursor: pagination.page >= pagination.totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: pagination.page >= pagination.totalPages - 1 ? 0.4 : 1,
              fontSize: '0.8125rem',
              color: '#374151',
            }}
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
