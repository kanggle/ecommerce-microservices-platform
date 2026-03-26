import Link from 'next/link';
import type { OrderSummary } from '@repo/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.orderId}`}
      style={{
        display: 'block',
        padding: '16px',
        border: '1px solid #eee',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
            {new Date(order.createdAt).toLocaleDateString('ko-KR')}
          </p>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>
            {order.totalPrice.toLocaleString()}원 · {order.itemCount}개 상품
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
    </Link>
  );
}
