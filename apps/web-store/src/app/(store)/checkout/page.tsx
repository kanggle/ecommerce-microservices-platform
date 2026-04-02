'use client';

import { useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { CheckoutForm } from '@/features/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady } = useRequireAuth();
  const { items, removeItem } = useCart();
  const completedRef = useRef(false);

  const selectedKeys = useMemo(() => {
    const raw = searchParams.get('items');
    if (!raw) return null;
    return new Set(raw.split(','));
  }, [searchParams]);

  const checkoutItems = useMemo(() => {
    if (!selectedKeys) return items;
    return items.filter((i) => selectedKeys.has(`${i.productId}:${i.variantId}`));
  }, [items, selectedKeys]);

  const totalAmount = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!isReady) return null;
  if (!completedRef.current && checkoutItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <CheckoutForm
        items={checkoutItems}
        totalAmount={totalAmount}
        onOrderComplete={() => {
          completedRef.current = true;
          checkoutItems.forEach((item) => removeItem(item.productId, item.variantId));
        }}
      />
    </div>
  );
}
