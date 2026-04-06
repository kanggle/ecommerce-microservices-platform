'use client';

import { useState } from 'react';
import { DataTable, StatusBadge, FilterBar, ListError, ConfirmDialog } from '@/shared/ui';
import type { ColumnDef } from '@/shared/ui';
import { useShippings } from '../hooks/use-shippings';
import { useUpdateShippingStatus } from '../hooks/use-update-shipping-status';
import { SHIPPING_STATUS_OPTIONS } from '@/shared/lib/status-options';
import { ShipFormDialog } from './ShipFormDialog';
import type { ShippingSummary, ShippingStatus } from '@repo/types';

const NEXT_STATUS: Partial<Record<ShippingStatus, { label: string; target: ShippingStatus }>> = {
  PREPARING: { label: '발송 처리', target: 'SHIPPED' },
  SHIPPED: { label: '배송중 전환', target: 'IN_TRANSIT' },
  IN_TRANSIT: { label: '배송완료 처리', target: 'DELIVERED' },
};

function StatusActionButton({
  shipping,
  isPending,
  onAction,
}: {
  shipping: ShippingSummary;
  isPending: boolean;
  onAction: (shipping: ShippingSummary, target: ShippingStatus) => void;
}) {
  const next = NEXT_STATUS[shipping.status];
  if (!next) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAction(shipping, next.target);
      }}
      disabled={isPending}
      style={{
        padding: '4px 12px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#1A1A2E',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {next.label}
    </button>
  );
}

export function ShippingList() {
  const { data, isLoading, isError, refetch, pagination, filters } = useShippings();
  const mutation = useUpdateShippingStatus();

  const [shipFormTarget, setShipFormTarget] = useState<ShippingSummary | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ shipping: ShippingSummary; target: ShippingStatus } | null>(null);

  function handleAction(shipping: ShippingSummary, target: ShippingStatus) {
    if (target === 'SHIPPED') {
      setShipFormTarget(shipping);
    } else {
      setConfirmTarget({ shipping, target });
    }
  }

  function handleShipConfirm(trackingNumber: string, carrier: string) {
    if (!shipFormTarget) return;
    mutation.mutate(
      { shippingId: shipFormTarget.shippingId, data: { status: 'SHIPPED', trackingNumber, carrier } },
      { onSuccess: () => setShipFormTarget(null) },
    );
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    mutation.mutate(
      { shippingId: confirmTarget.shipping.shippingId, data: { status: confirmTarget.target } },
      { onSuccess: () => setConfirmTarget(null) },
    );
  }

  const columns: ColumnDef<ShippingSummary>[] = [
    {
      key: 'orderId',
      header: '주문 ID',
      render: (item: ShippingSummary) => item.orderId.slice(0, 8) + '...',
    },
    {
      key: 'status',
      header: '배송 상태',
      sortable: true,
      render: (item: ShippingSummary) => <StatusBadge status={item.status} />,
    },
    {
      key: 'carrier',
      header: '택배사',
      render: (item: ShippingSummary) => item.carrier ?? '-',
    },
    {
      key: 'trackingNumber',
      header: '운송장 번호',
      render: (item: ShippingSummary) => item.trackingNumber ?? '-',
    },
    {
      key: 'createdAt',
      header: '생성일',
      sortable: true,
      render: (item: ShippingSummary) => new Date(item.createdAt).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      header: '상태 변경',
      render: (item: ShippingSummary) => (
        <StatusActionButton shipping={item} isPending={mutation.isPending} onAction={handleAction} />
      ),
    },
  ];

  if (isError) {
    return <ListError message="배송 목록을 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  return (
    <div>
      <FilterBar
        statusOptions={SHIPPING_STATUS_OPTIONS}
        statusValue={filters.status}
        onStatusChange={(value) => filters.setFilter('status', value)}
      />
      <DataTable<ShippingSummary>
        columns={columns}
        data={data?.content ?? []}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage="배송 건이 없습니다."
        rowKey={(item) => item.shippingId}
      />

      <ShipFormDialog
        open={shipFormTarget !== null}
        isPending={mutation.isPending}
        onConfirm={handleShipConfirm}
        onCancel={() => setShipFormTarget(null)}
      />

      <ConfirmDialog
        open={confirmTarget !== null}
        title="배송 상태 변경"
        message={
          confirmTarget
            ? `배송 상태를 '${SHIPPING_STATUS_OPTIONS.find((o) => o.value === confirmTarget.target)?.label ?? confirmTarget.target}'(으)로 변경하시겠습니까?`
            : ''
        }
        confirmLabel="변경"
        confirmDisabled={mutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
