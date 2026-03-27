'use client';

import { useState } from 'react';
import { PageLayout, StatusBadge, ConfirmDialog, DescriptionList, Section } from '@/shared/ui';
import { ErrorMessage } from '@repo/ui';
import { useOrder } from '../hooks/use-order';
import { useCancelOrder } from '../hooks/use-cancel-order';

interface Props {
  orderId: string;
}

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

export function OrderDetail({ orderId }: Props) {
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const cancelMutation = useCancelOrder();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading || !order) {
    return <PageLayout.Skeleton />;
  }

  if (isError) {
    return <ErrorMessage message="주문 정보를 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const handleCancel = () => {
    cancelMutation.mutate(orderId, {
      onSuccess: () => setShowCancelDialog(false),
    });
  };

  return (
    <PageLayout
      title={`주문 ${orderId}`}
      actions={canCancel ? [
        {
          label: cancelMutation.isPending ? '취소 중...' : '주문 취소',
          onClick: () => setShowCancelDialog(true),
          variant: 'danger' as const,
          disabled: cancelMutation.isPending,
        },
      ] : []}
    >
      <Section title="주문 정보">
        <DescriptionList
          items={[
            { label: '상태', value: <StatusBadge status={order.status} /> },
            { label: '총액', value: `${order.totalPrice.toLocaleString()}원` },
            { label: '주문일', value: new Date(order.createdAt).toLocaleString('ko-KR') },
            { label: '수정일', value: new Date(order.updatedAt).toLocaleString('ko-KR') },
          ]}
        />
      </Section>

      <Section title="주문 항목">
        {order.items.length === 0 ? (
          <p style={{ color: '#6b7280' }}>주문 항목이 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  상품명
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  옵션
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>
                  단가
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>
                  수량
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>
                  소계
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.productId}-${item.variantId}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 16px' }}>{item.productName}</td>
                  <td style={{ padding: '8px 16px' }}>{item.optionName}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    {item.unitPrice.toLocaleString()}원
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                    {(item.unitPrice * item.quantity).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="배송지 정보">
        <DescriptionList
          items={[
            { label: '수령인', value: order.shippingAddress.recipient },
            { label: '연락처', value: order.shippingAddress.phone },
            { label: '우편번호', value: order.shippingAddress.zipCode },
            { label: '주소', value: `${order.shippingAddress.address1} ${order.shippingAddress.address2}` },
          ]}
        />
      </Section>

      {cancelMutation.isError && (
        <div role="alert" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#991b1b' }}>
          주문 취소에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        title="주문 취소"
        message="이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel={cancelMutation.isPending ? '처리 중...' : '취소하기'}
        confirmDisabled={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />
    </PageLayout>
  );
}
