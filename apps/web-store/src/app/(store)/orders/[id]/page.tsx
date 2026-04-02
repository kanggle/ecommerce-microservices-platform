'use client';

import { useParams } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { OrderDetailView } from '@/features/order';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { isReady } = useRequireAuth();

  if (!isReady) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <OrderDetailView orderId={params.id} />
    </div>
  );
}
