import type { PaymentStatus } from '@repo/types';

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: '결제 대기',
  COMPLETED: '결제 완료',
  FAILED: '결제 실패',
  REFUNDED: '환불 완료',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: '#f59e0b',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
  REFUNDED: '#6b7280',
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
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
