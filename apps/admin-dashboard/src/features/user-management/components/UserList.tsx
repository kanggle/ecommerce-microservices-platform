'use client';

import { useRouter } from 'next/navigation';
import { DataTable, StatusBadge, FilterBar } from '@/shared/ui';
import type { ColumnDef } from '@/shared/ui';
import { useUsers } from '../hooks/use-users';
import type { AdminUserSummary } from '@repo/types';

const STATUS_OPTIONS = [
  { label: '활성', value: 'ACTIVE' },
  { label: '정지', value: 'SUSPENDED' },
  { label: '탈퇴', value: 'WITHDRAWN' },
];

const columns: ColumnDef<AdminUserSummary>[] = [
  { key: 'email', header: '이메일' },
  { key: 'name', header: '이름' },
  { key: 'nickname', header: '닉네임' },
  {
    key: 'status',
    header: '상태',
    render: (user: AdminUserSummary) => <StatusBadge status={user.status} />,
  },
  {
    key: 'createdAt',
    header: '가입일',
    render: (user: AdminUserSummary) =>
      new Date(user.createdAt).toLocaleDateString('ko-KR'),
  },
];

export function UserList() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, pagination, filters } = useUsers();

  if (isError) {
    return (
      <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>사용자 목록을 불러오는데 실패했습니다.</p>
        <button onClick={() => refetch()} style={{ marginTop: '1rem' }}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        searchPlaceholder="이메일 검색..."
        searchValue={filters.email ?? ''}
        onSearchChange={(value) => filters.setFilter('email', value || undefined)}
        statusOptions={STATUS_OPTIONS}
        statusValue={filters.status}
        onStatusChange={(value) => filters.setFilter('status', value)}
      />
      <DataTable<AdminUserSummary & Record<string, unknown>>
        columns={columns as ColumnDef<AdminUserSummary & Record<string, unknown>>[]}
        data={(data?.content ?? []) as (AdminUserSummary & Record<string, unknown>)[]}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage="등록된 사용자가 없습니다."
        onRowClick={(item) => router.push(`/users/${item.userId}`)}
      />
    </div>
  );
}
