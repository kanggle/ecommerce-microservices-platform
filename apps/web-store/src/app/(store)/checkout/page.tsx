'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { CheckoutForm, useCheckoutItems } from '@/features/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { isReady } = useRequireAuth();
  const { checkoutItems, totalAmount, completeOrder, isEmpty } = useCheckoutItems();

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
