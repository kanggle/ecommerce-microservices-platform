'use client';

import { useRequireAuth } from '@/features/auth';
import { OrderHistory } from '@/features/order';

export default function OrdersPage() {
  const { isReady } = useRequireAuth();

  if (!isReady) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <OrderHistory />
    </div>
  );
}
