'use client';

import { useRouter } from 'next/navigation';
import { DataTable, StatusBadge, FilterBar, ListError } from '@/shared/ui';
import type { ColumnDef } from '@/shared/ui';
import { useOrders } from '../hooks/use-orders';
import type { AdminOrderSummary } from '@repo/types';

const STATUS_OPTIONS = [
  { label: '대기', value: 'PENDING' },
  { label: '확인', value: 'CONFIRMED' },
  { label: '배송중', value: 'SHIPPED' },
  { label: '배송완료', value: 'DELIVERED' },
  { label: '취소', value: 'CANCELLED' },
];

const columns: ColumnDef<AdminOrderSummary>[] = [
  {
    key: 'orderId',
    header: '주문번호',
    render: (order: AdminOrderSummary) => order.orderId.slice(0, 8) + '...',
  },
  { key: 'userId', header: '주문자ID',
    render: (order: AdminOrderSummary) => order.userId.slice(0, 8) + '...',
  },
  {
    key: 'status',
    header: '상태',
    render: (order: AdminOrderSummary) => <StatusBadge status={order.status} />,
  },
  {
    key: 'totalPrice',
    header: '총액',
    render: (order: AdminOrderSummary) => `${order.totalPrice.toLocaleString()}원`,
  },
  { key: 'itemCount', header: '상품수' },
  {
    key: 'createdAt',
    header: '주문일',
    render: (order: AdminOrderSummary) =>
      new Date(order.createdAt).toLocaleDateString('ko-KR'),
  },
];

export function OrderList() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, pagination, filters } = useOrders();

  if (isError) {
    return <ListError message="주문 목록을 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  return (
    <div>
      <FilterBar
        statusOptions={STATUS_OPTIONS}
        statusValue={filters.status}
        onStatusChange={(value) => filters.setFilter('status', value)}
      />
      <DataTable<AdminOrderSummary>
        columns={columns}
        data={data?.content ?? []}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage="주문이 없습니다."
        onRowClick={(item) => router.push(`/orders/${item.orderId}`)}
      />
    </div>
  );
}
