'use client';

import { useRouter } from 'next/navigation';
import { DataTable, StatusBadge, FilterBar } from '@/shared/ui';
import type { ColumnDef } from '@/shared/ui';
import { useOrders } from '../hooks/use-orders';
import type { OrderSummary } from '@repo/types';

const STATUS_OPTIONS = [
  { label: '대기', value: 'PENDING' },
  { label: '확인', value: 'CONFIRMED' },
  { label: '배송중', value: 'SHIPPED' },
  { label: '배송완료', value: 'DELIVERED' },
  { label: '취소', value: 'CANCELLED' },
];

const columns: ColumnDef<OrderSummary>[] = [
  { key: 'orderId', header: '주문번호' },
  {
    key: 'status',
    header: '상태',
    render: (order: OrderSummary) => <StatusBadge status={order.status} />,
  },
  {
    key: 'totalPrice',
    header: '총액',
    render: (order: OrderSummary) => `${order.totalPrice.toLocaleString()}원`,
  },
  { key: 'itemCount', header: '상품수' },
  {
    key: 'createdAt',
    header: '주문일',
    render: (order: OrderSummary) =>
      new Date(order.createdAt).toLocaleDateString('ko-KR'),
  },
];

export function OrderList() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, pagination, filters } = useOrders();

  if (isError) {
    return (
      <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>주문 목록을 불러오는데 실패했습니다.</p>
        <button onClick={() => refetch()} style={{ marginTop: '1rem' }}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        statusOptions={STATUS_OPTIONS}
        statusValue={filters.status}
        onStatusChange={(value) => filters.setFilter('status', value)}
      />
      <DataTable<OrderSummary & Record<string, unknown>>
        columns={columns as ColumnDef<OrderSummary & Record<string, unknown>>[]}
        data={(data?.content ?? []) as (OrderSummary & Record<string, unknown>)[]}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage="주문이 없습니다."
        onRowClick={(item) => router.push(`/orders/${item.orderId}`)}
      />
    </div>
  );
}
