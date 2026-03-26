import type { OrderStatus } from '@repo/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '주문 대기',
  CONFIRMED: '주문 확인',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: STATUS_COLORS[status],
        borderRadius: '4px',
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
