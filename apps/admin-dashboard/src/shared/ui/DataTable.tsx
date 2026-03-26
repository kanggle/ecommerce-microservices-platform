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

export function DataTable<T extends Record<string, unknown>>({
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
    if (item['id'] != null) return String(item['id']);
    return columns.map((col) => String(item[col.key] ?? '')).join('::') || String(index);
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  borderBottom: '2px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
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
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.875rem',
                    color: '#111827',
                  }}
                >
                  {col.render
                    ? col.render(item)
                    : String(item[col.key] ?? '')}
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
            gap: '8px',
            padding: '16px 0',
          }}
        >
          <button
            aria-label="이전 페이지"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 0}
            style={{ padding: '4px 12px' }}
          >
            이전
          </button>
          {buildPageNumbers(pagination.page, pagination.totalPages).map((item, idx) =>
            item === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                style={{ padding: '4px 8px', color: '#6b7280' }}
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
                  padding: '4px 12px',
                  fontWeight: item === pagination.page ? 'bold' : 'normal',
                  textDecoration: item === pagination.page ? 'underline' : 'none',
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
            style={{ padding: '4px 12px' }}
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
