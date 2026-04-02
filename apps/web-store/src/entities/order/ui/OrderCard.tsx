import Link from 'next/link';
import type { OrderSummary } from '@repo/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/my/orders/${order.orderId}`}
      className="card"
      style={{
        display: 'block',
        padding: 'var(--space-4) var(--space-5)',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            {new Date(order.createdAt).toLocaleDateString('ko-KR')}
          </p>
          <p style={{ margin: 0, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
            {order.totalPrice.toLocaleString()}원 &middot; {order.itemCount}개 상품
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
    </Link>
  );
}
