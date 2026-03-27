'use client';

import { useRequireAuth } from '@/features/auth';
import { OrderHistory } from '@/features/order';

export default function OrdersPage() {
  const { isReady } = useRequireAuth();

  if (!isReady) return null;

  return <OrderHistory />;
}
