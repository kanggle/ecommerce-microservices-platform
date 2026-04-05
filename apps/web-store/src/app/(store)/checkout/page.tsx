'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { CheckoutForm, useCheckoutItems } from '@/features/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { isReady } = useRequireAuth();
  const { items, removeItem } = useCart();
  const { checkoutItems, totalAmount, completeOrder, isEmpty } = useCheckoutItems({ items, removeItem });

  if (!isReady) return null;
  if (isEmpty) {
    router.replace('/cart');
    return null;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <CheckoutForm
        items={checkoutItems}
        totalAmount={totalAmount}
        onOrderComplete={completeOrder}
      />
    </div>
  );
}
