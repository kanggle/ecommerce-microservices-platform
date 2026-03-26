'use client';

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  ON_SALE: { backgroundColor: '#dcfce7', color: '#166534' },
  SOLD_OUT: { backgroundColor: '#fee2e2', color: '#991b1b' },
  HIDDEN: { backgroundColor: '#f3f4f6', color: '#374151' },
  ACTIVE: { backgroundColor: '#dcfce7', color: '#166534' },
  INACTIVE: { backgroundColor: '#f3f4f6', color: '#374151' },
  DRAFT: { backgroundColor: '#fef9c3', color: '#854d0e' },
  PENDING: { backgroundColor: '#fef9c3', color: '#854d0e' },
  CONFIRMED: { backgroundColor: '#dbeafe', color: '#1e40af' },
  SHIPPED: { backgroundColor: '#e0e7ff', color: '#3730a3' },
  DELIVERED: { backgroundColor: '#dcfce7', color: '#166534' },
  CANCELLED: { backgroundColor: '#fee2e2', color: '#991b1b' },
  COMPLETED: { backgroundColor: '#dcfce7', color: '#166534' },
  FAILED: { backgroundColor: '#fee2e2', color: '#991b1b' },
  REFUNDED: { backgroundColor: '#fce7f3', color: '#9d174d' },
  SUSPENDED: { backgroundColor: '#fef9c3', color: '#854d0e' },
  WITHDRAWN: { backgroundColor: '#fee2e2', color: '#991b1b' },
};

const STATUS_LABELS: Record<string, string> = {
  ON_SALE: '판매중',
  SOLD_OUT: '품절',
  HIDDEN: '숨김',
  ACTIVE: '활성',
  INACTIVE: '비활성',
  DRAFT: '임시저장',
  PENDING: '대기',
  CONFIRMED: '확인',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
  COMPLETED: '완료',
  FAILED: '실패',
  REFUNDED: '환불',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { backgroundColor: '#f3f4f6', color: '#374151' };
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      style={{
        ...style,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
